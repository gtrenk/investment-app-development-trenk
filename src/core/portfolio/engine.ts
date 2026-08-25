// ─── Paper-trading portfolio engine ──────────────────────────────────────────
// Pure functions over `PortfolioState`. Nothing here mutates its input: every
// operation returns a fresh state, so the Zustand store can swap it in and
// React sees a new reference. No clock, no fetch, no DOM — timestamps and
// prices are always passed in by the caller.
//
// Money is held in dollars rounded to cents at every boundary (see `roundCents`).
// Share quantities stay full-precision floats: fractional shares are supported
// down to `MIN_QTY`, and rounding those would leak value on every round trip.

import type { Lot, PortfolioState, Transaction } from '@core/types'

// ─── Constants ───────────────────────────────────────────────────────────────

/** Virtual cash every paper portfolio starts with. */
export const STARTING_CASH = 100_000

/** Smallest tradeable quantity — a ten-thousandth of a share. */
export const MIN_QTY = 0.0001

/**
 * Slack allowed when comparing a cost against available cash.
 * Both sides are cent-rounded already, so this only absorbs float dust from
 * a caller that computed "max affordable qty" as `cash / price`.
 */
export const CASH_EPSILON = 1e-6

/**
 * Slack allowed when comparing a sell quantity against shares held, and the
 * threshold below which a partially consumed lot is dropped instead of left
 * behind as un-sellable dust.
 */
export const QTY_EPSILON = 1e-8

// ─── Money helpers ───────────────────────────────────────────────────────────

/**
 * Round to cents. `Number.EPSILON` nudging pulls values that landed a hair
 * below a half-cent (0.145 stored as 0.14499999999999999) back onto the
 * boundary, so 2 × 0.145 rounds the same way in both directions.
 */
export function roundCents(x: number): number {
  return Math.round((x + Number.EPSILON * Math.sign(x)) * 100) / 100
}

/** Round to `dp` decimals — used for derived per-share figures, never for cash. */
export function roundTo(x: number, dp: number): number {
  const f = 10 ** dp
  return Math.round(x * f) / f
}

/** Canonical in-app symbol form: trimmed, upper-case. */
export function normalizeSymbol(symbol: string): string {
  return String(symbol ?? '').trim().toUpperCase()
}

// ─── Result types ────────────────────────────────────────────────────────────

export type TradeErrorCode =
  | 'bad-symbol'
  | 'bad-qty'
  | 'bad-price'
  | 'insufficient-cash'
  | 'insufficient-shares'

export interface TradeFailure {
  error: string
  code: TradeErrorCode
}

export interface BuySuccess {
  state: PortfolioState
  tx: Transaction
}

export interface SellSuccess {
  state: PortfolioState
  tx: Transaction
  /** Realized P&L on this sale alone, cent-rounded. Negative on a loss. */
  realized: number
}

export type BuyResult = BuySuccess | TradeFailure
export type SellResult = SellSuccess | TradeFailure

/** Narrowing helper — `if (isTradeError(r)) return r.error`. */
export function isTradeError(r: BuyResult | SellResult): r is TradeFailure {
  return 'error' in r
}

export interface TradeInput {
  symbol: string
  qty: number
  price: number
  /** ISO timestamp of the fill. */
  ts: string
  note?: string
  /** Optional caller-supplied transaction id; otherwise a sequence id is minted. */
  id?: string
}

// ─── Construction ────────────────────────────────────────────────────────────

/** A fresh $100k paper portfolio with no positions and no benchmark yet. */
export function newPortfolio(): PortfolioState {
  return {
    cash: STARTING_CASH,
    lots: [],
    transactions: [],
    realizedPnl: 0,
    benchmarkUnits: null,
    snapshots: [],
  }
}

/** Sequential, human-readable transaction id: `tx-0001`, `tx-0002`, … */
function nextTxId(p: PortfolioState): string {
  return `tx-${String(p.transactions.length + 1).padStart(4, '0')}`
}

/** Shared shape/range validation for both sides of a trade. */
function validateTrade(input: TradeInput): TradeFailure | null {
  const symbol = normalizeSymbol(input.symbol)
  if (symbol === '') return { code: 'bad-symbol', error: 'Symbol is required' }

  const { qty, price } = input
  if (!Number.isFinite(qty) || qty <= 0) {
    return { code: 'bad-qty', error: 'Quantity must be a positive number' }
  }
  if (qty < MIN_QTY) {
    return { code: 'bad-qty', error: `Quantity must be at least ${MIN_QTY} shares` }
  }
  if (!Number.isFinite(price) || price <= 0) {
    return { code: 'bad-price', error: 'Price must be a positive number' }
  }
  return null
}

// ─── Buy ─────────────────────────────────────────────────────────────────────

/**
 * Market buy at `price`, filled in full or not at all.
 *
 * Opens one new lot per buy (FIFO relies on lots staying separate — averaging
 * them together at buy time would make a later partial sale unable to tell
 * which cost basis it consumed). The cash debit is the cent-rounded notional,
 * which is what the confirm screen shows the user.
 */
export function executeBuy(p: PortfolioState, input: TradeInput): BuyResult {
  const invalid = validateTrade(input)
  if (invalid) return invalid

  const symbol = normalizeSymbol(input.symbol)
  const { qty, price, ts, note } = input
  const cost = roundCents(qty * price)

  if (cost > p.cash + CASH_EPSILON) {
    return {
      code: 'insufficient-cash',
      error: `Not enough cash: need $${cost.toFixed(2)}, have $${p.cash.toFixed(2)}`,
    }
  }

  const lot: Lot = { symbol, qty, costBasis: price, openedAt: ts }
  const tx: Transaction = {
    id: input.id ?? nextTxId(p),
    ts,
    symbol,
    side: 'buy',
    qty,
    price,
    ...(note !== undefined ? { note } : {}),
  }

  return {
    state: {
      ...p,
      cash: roundCents(p.cash - cost),
      lots: [...p.lots, lot],
      transactions: [...p.transactions, tx],
    },
    tx,
  }
}

// ─── Sell ────────────────────────────────────────────────────────────────────

/**
 * Market sell at `price`, consuming that symbol's lots **first-in first-out**.
 *
 * A sale that runs past a lot boundary splits the last lot it touches: the
 * consumed part contributes `(price − costBasis) × consumed` to realized P&L
 * and the remainder stays open at its original basis. Lots of other symbols
 * keep their positions in the array, so FIFO order across the portfolio is
 * preserved for later sales.
 *
 * Short selling is not supported — `qty` above the shares held is rejected
 * rather than opening a negative position.
 */
export function executeSell(p: PortfolioState, input: TradeInput): SellResult {
  const invalid = validateTrade(input)
  if (invalid) return invalid

  const symbol = normalizeSymbol(input.symbol)
  const { price, ts, note } = input

  const held = p.lots.reduce((sum, l) => (l.symbol === symbol ? sum + l.qty : sum), 0)
  if (input.qty > held + QTY_EPSILON) {
    return {
      code: 'insufficient-shares',
      error: `Not enough shares: selling ${input.qty} ${symbol}, hold ${held}`,
    }
  }
  // Clamp float dust so "sell all" from a UI-computed total always empties out.
  const qty = Math.min(input.qty, held)

  let remaining = qty
  let realizedRaw = 0
  const lots: Lot[] = []

  for (const lot of p.lots) {
    if (lot.symbol !== symbol || remaining <= QTY_EPSILON) {
      lots.push(lot)
      continue
    }
    const consumed = Math.min(lot.qty, remaining)
    realizedRaw += (price - lot.costBasis) * consumed
    remaining -= consumed
    const left = lot.qty - consumed
    if (left > QTY_EPSILON) lots.push({ ...lot, qty: left })
  }

  const realized = roundCents(realizedRaw)
  const proceeds = roundCents(qty * price)
  const tx: Transaction = {
    id: input.id ?? nextTxId(p),
    ts,
    symbol,
    side: 'sell',
    qty,
    price,
    ...(note !== undefined ? { note } : {}),
  }

  return {
    state: {
      ...p,
      cash: roundCents(p.cash + proceeds),
      lots,
      transactions: [...p.transactions, tx],
      realizedPnl: roundCents(p.realizedPnl + realized),
    },
    tx,
    realized,
  }
}

// ─── Positions ───────────────────────────────────────────────────────────────

/**
 * One symbol's aggregated holding. Local to this module by design: `types.ts`
 * stores lots, and a position is always derived from them, never persisted.
 */
export interface Position {
  symbol: string
  /** Total shares held across every open lot. */
  qty: number
  /** Weighted-average cost per share (6 dp — a display figure, not money). */
  avgCost: number
  /** Total dollars of cost basis still open, cent-rounded. */
  costValue: number
}

/**
 * Aggregate open lots into one row per symbol, sorted by symbol so the UI
 * renders in a stable order regardless of trade sequence. Symbols whose lots
 * have all been sold disappear entirely.
 */
export function positions(p: PortfolioState): Position[] {
  const bySymbol = new Map<string, { qty: number; cost: number }>()
  for (const lot of p.lots) {
    const acc = bySymbol.get(lot.symbol) ?? { qty: 0, cost: 0 }
    acc.qty += lot.qty
    acc.cost += lot.qty * lot.costBasis
    bySymbol.set(lot.symbol, acc)
  }

  const out: Position[] = []
  for (const [symbol, { qty, cost }] of bySymbol) {
    if (qty <= QTY_EPSILON) continue
    out.push({ symbol, qty, avgCost: roundTo(cost / qty, 6), costValue: roundCents(cost) })
  }
  return out.sort((a, b) => (a.symbol < b.symbol ? -1 : a.symbol > b.symbol ? 1 : 0))
}

/** Shares held of one symbol (0 when flat). */
export function sharesHeld(p: PortfolioState, symbol: string): number {
  const s = normalizeSymbol(symbol)
  return p.lots.reduce((sum, l) => (l.symbol === s ? sum + l.qty : sum), 0)
}

// ─── Equity ──────────────────────────────────────────────────────────────────

/** Price lookup keyed by canonical symbol. */
export type PriceMap = Record<string, number>

export interface EquityBreakdown {
  /** cash + positionsValue, cent-rounded. */
  equity: number
  cash: number
  positionsValue: number
  /** positionsValue − open cost basis. Excludes `realizedPnl`. */
  unrealizedPnl: number
  /**
   * Symbols held with no usable price in the map. Their value was carried at
   * cost basis, so equity is a floor, not a mark — the UI should say so.
   */
  pricesMissing: string[]
}

/** A price is usable only if it is a finite positive number. */
function usablePrice(prices: PriceMap, symbol: string): number | null {
  const px = prices[symbol]
  return Number.isFinite(px) && px > 0 ? px : null
}

/**
 * Mark the portfolio to market.
 *
 * A held symbol missing from `prices` (offline, unknown ticker, failed quote)
 * falls back to its own weighted-average cost — i.e. it contributes zero
 * unrealized P&L rather than zero value, which would otherwise show the user a
 * catastrophic fake loss — and is listed in `pricesMissing`.
 */
export function portfolioEquity(p: PortfolioState, prices: PriceMap): EquityBreakdown {
  const pricesMissing: string[] = []
  let positionsValue = 0
  let costTotal = 0

  for (const pos of positions(p)) {
    const px = usablePrice(prices, pos.symbol)
    if (px === null) pricesMissing.push(pos.symbol)
    positionsValue += pos.qty * (px ?? pos.avgCost)
    costTotal += pos.costValue
  }

  const value = roundCents(positionsValue)
  return {
    equity: roundCents(p.cash + value),
    cash: p.cash,
    positionsValue: value,
    unrealizedPnl: roundCents(value - costTotal),
    pricesMissing,
  }
}

// ─── Concentration guardrail ─────────────────────────────────────────────────

/**
 * Percentage of post-trade equity that `symbol` would represent after adding
 * `addCost` dollars of it — the number behind the ">20% of your portfolio in
 * one name" warning on the confirm screen.
 *
 * A market buy is value-neutral at the moment of the fill (cash becomes shares
 * worth the same), so total equity is unchanged and only the numerator moves.
 * Pass `addCost = 0` to read the current concentration of an existing position.
 *
 * Returns 0 for a wiped-out portfolio (equity ≤ 0) rather than dividing by it.
 */
export function concentrationPct(
  p: PortfolioState,
  symbol: string,
  addCost: number,
  prices: PriceMap,
): number {
  const s = normalizeSymbol(symbol)
  const add = Number.isFinite(addCost) && addCost > 0 ? addCost : 0
  const { equity } = portfolioEquity(p, prices)
  if (!(equity > 0)) return 0

  const pos = positions(p).find((x) => x.symbol === s)
  const current = pos ? pos.qty * (usablePrice(prices, s) ?? pos.avgCost) : 0

  return roundTo(((current + add) / equity) * 100, 4)
}

/** Concentration above this share of equity trips the single-name warning. */
export const CONCENTRATION_WARN_PCT = 20
