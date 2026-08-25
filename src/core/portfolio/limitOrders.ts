// ─── Limit orders ────────────────────────────────────────────────────────────
// A resting order is a promise about the future, so the only honest way to fill
// one offline is to replay it against the bars that actually happened. This
// module is that replay, and nothing else: pure functions over an order book and
// already-loaded daily series. No clock, no fetch, no storage — the caller
// passes in `asOf` and the bars, and gets back a new book plus the fills it owes
// the portfolio engine.
//
// FILL MODEL (daily bars, no intraday data)
// -----------------------------------------
//   buy  fills on the first later bar whose LOW  ≤ limit, at min(open, limit)
//   sell fills on the first later bar whose HIGH ≥ limit, at max(open, limit)
//
// The `min`/`max` is the gap-through rule and it is the whole point. If a stock
// closes at 200, a buy limit rests at 196, and the next morning it *opens* at
// 190, the order does not fill at 196 — it fills at 190, because 190 is where
// the first trade of the day printed and a limit order says "this price or
// better". Filling such an order at the limit would hand the learner a price
// that never existed and quietly flatter every gap-down entry they ever place.
//
// The model still flatters reality in one direction: within a bar that merely
// *touches* the limit intraday, a real queue might never reach the learner's
// order. Assuming it does is the standard simplification for daily-bar
// backtests and is stated in the UI.

import { addDays, daysBetween } from '@core/clock'
import { roundCents } from '@core/portfolio/engine'
import type { OhlcvSeries } from '@core/types'

// ─── Types ───────────────────────────────────────────────────────────────────

export type LimitOrderStatus = 'open' | 'filled' | 'cancelled' | 'expired'

export interface LimitOrder {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  qty: number
  limitPrice: number
  /** Local date 'YYYY-MM-DD' the order was placed. */
  placedAt: string
  status: LimitOrderStatus
  /** Local date of the bar that filled it. Set only when `status === 'filled'`. */
  filledAt?: string
  /** Price the fill printed at — never worse than `limitPrice`. */
  fillPrice?: number
}

/** One fill owed to the portfolio engine, in the order it happened. */
export interface LimitFill {
  orderId: string
  symbol: string
  side: 'buy' | 'sell'
  qty: number
  /** Cent-rounded fill price. */
  price: number
  /** Local date of the bar that filled it. */
  date: string
}

export interface LimitEvaluation {
  /** The whole book, resolved orders included, in its original order. */
  orders: LimitOrder[]
  /** Fills to execute, oldest first across every symbol. */
  fills: LimitFill[]
  /** False when nothing moved — lets a caller skip a state write entirely. */
  changed: boolean
}

/** Series keyed by symbol. A missing entry means "cannot evaluate yet". */
export type SeriesMap = Record<string, OhlcvSeries | undefined>

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Calendar days an order rests before it is cancelled by time.
 *
 * Calendar, not trading, days: a learner who set an order and forgot it is
 * thinking in weeks on a wall calendar, and "30 days" that silently means six
 * weeks would be a lie in the one place the app promises certainty.
 */
export const LIMIT_ORDER_TTL_DAYS = 30

/** Last local date an order can still fill on (inclusive). */
export function expiresOn(order: Pick<LimitOrder, 'placedAt'>): string {
  return addDays(order.placedAt, LIMIT_ORDER_TTL_DAYS)
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface LimitOrderInput {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  qty: number
  limitPrice: number
  placedAt: string
}

/**
 * Why this order cannot be placed, or `null` when it can.
 *
 * Deliberately *not* a cash or shares check: a resting order is not a trade, the
 * account can change many times before it fills, and reserving cash for an order
 * that may never fill would be a worse lie than letting the fill fail later.
 */
export function limitOrderIssue(input: LimitOrderInput): string | null {
  if (!input.symbol.trim()) return 'Symbol is required'
  if (!Number.isFinite(input.qty) || input.qty <= 0) return 'Quantity must be a positive number'
  if (!Number.isFinite(input.limitPrice) || input.limitPrice <= 0) {
    return 'Limit price must be a positive number'
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.placedAt)) return 'Placement date is required'
  return null
}

/** A fresh resting order. Callers should check `limitOrderIssue` first. */
export function newLimitOrder(input: LimitOrderInput): LimitOrder {
  return {
    id: input.id,
    symbol: input.symbol.trim().toUpperCase(),
    side: input.side,
    qty: input.qty,
    limitPrice: input.limitPrice,
    placedAt: input.placedAt,
    status: 'open',
  }
}

// ─── Bar dates ───────────────────────────────────────────────────────────────

/**
 * A bar's calendar date. Bundled `t` values are UTC midnights for a US session,
 * so the UTC date is the session date — reading them in a local zone would slide
 * every bar a day west of the Atlantic.
 */
export function barDate(tSeconds: number): string | null {
  if (!Number.isFinite(tSeconds)) return null
  return new Date(tSeconds * 1000).toISOString().slice(0, 10)
}

// ─── Evaluation ──────────────────────────────────────────────────────────────

/** Price a bar would fill this side at, or `null` if it does not touch the limit. */
function fillPriceOn(
  side: 'buy' | 'sell',
  limit: number,
  open: number,
  high: number,
  low: number,
): number | null {
  if (side === 'buy') {
    if (!(low <= limit)) return null
    // Gap through the limit → the fill is the (better) open, not the limit.
    return roundCents(Number.isFinite(open) ? Math.min(open, limit) : limit)
  }
  if (!(high >= limit)) return null
  return roundCents(Number.isFinite(open) ? Math.max(open, limit) : limit)
}

/**
 * Replay every open order against its symbol's bars and resolve what happened.
 *
 * `sinceDate` — named `asOf` here because that is what it does — is the local
 * date the evaluation runs on, and it is a hard upper bound: bars *after* it are
 * the future as far as the learner is concerned and can never fill an order.
 * Without that bound an order placed today would fill instantly against bundled
 * data that already contains next month.
 *
 * Bars considered for one order: strictly after `placedAt` (an order placed
 * after the close cannot fill on that same session), up to and including the
 * earlier of `asOf` and its expiry.
 *
 * - a bar that touches the limit fills the order in full, at `fillPriceOn`
 * - no fill by expiry, and `asOf` is past it → `expired`
 * - a symbol with no series yet is left untouched, so a slow load cannot expire
 *   an order that may in fact have filled
 * - orders that are not `open` are returned unchanged, which makes the whole
 *   function idempotent: feeding its own output back in is a no-op
 */
export function evaluateLimitOrders(
  orders: readonly LimitOrder[],
  seriesBySymbol: SeriesMap,
  asOf: string,
): LimitEvaluation {
  const fills: LimitFill[] = []
  let changed = false

  const next = orders.map((order): LimitOrder => {
    if (order.status !== 'open') return order

    const series = seriesBySymbol[order.symbol]
    if (!series) return order

    const expiry = expiresOn(order)
    const lastDay = asOf < expiry ? asOf : expiry

    for (let i = 0; i < series.t.length; i++) {
      const date = barDate(series.t[i])
      if (date === null || date <= order.placedAt) continue
      if (date > lastDay) break

      const price = fillPriceOn(order.side, order.limitPrice, series.o[i], series.h[i], series.l[i])
      if (price === null || !(price > 0)) continue

      changed = true
      fills.push({
        orderId: order.id,
        symbol: order.symbol,
        side: order.side,
        qty: order.qty,
        price,
        date,
      })
      return { ...order, status: 'filled', filledAt: date, fillPrice: price }
    }

    if (asOf > expiry) {
      changed = true
      return { ...order, status: 'expired' }
    }
    return order
  })

  // Oldest fill first, so a sequence of fills hits the portfolio in the order it
  // actually happened — which matters for cash and for FIFO lots.
  fills.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  return { orders: next, fills, changed }
}

// ─── Book queries ────────────────────────────────────────────────────────────

/** Orders still resting, newest first — the order the UI lists them in. */
export function restingOrders(orders: readonly LimitOrder[]): LimitOrder[] {
  return orders.filter((o) => o.status === 'open').reverse()
}

/**
 * Orders worth showing on the Portfolio screen: everything still resting, plus
 * the ones that quietly expired (a learner has to be told their order died, or
 * they will believe it is still working).
 */
export function visibleOrders(orders: readonly LimitOrder[]): LimitOrder[] {
  return orders.filter((o) => o.status === 'open' || o.status === 'expired').reverse()
}

/** Whole days the order has been resting, as of `today`. Never negative. */
export function orderAgeDays(order: Pick<LimitOrder, 'placedAt'>, today: string): number {
  return Math.max(0, daysBetween(order.placedAt, today))
}

/** Mark one order cancelled. Returns the same array when nothing matched. */
export function cancelOrder(orders: readonly LimitOrder[], id: string): LimitOrder[] {
  let hit = false
  const next = orders.map((o) => {
    if (o.id !== id || o.status === 'filled') return o
    hit = true
    return { ...o, status: 'cancelled' as const }
  })
  return hit ? next : (orders as LimitOrder[])
}
