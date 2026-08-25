// ─── Resting orders & the watchlist (UI glue) ────────────────────────────────
// Two small bindings between the store and the bundled data files:
//
// `<LimitOrderSync />` is the limit-order equivalent of `<PortfolioSync />` — on
// every app open it replays the resting orders against the bars that printed
// while the app was closed and fills the ones that crossed. There is no
// background process in a PWA, so "the order filled last Tuesday" can only ever
// be discovered on the next open; doing it here means it happens once, in one
// place, before any screen reads the portfolio.
//
// `useWatchlistRows` prices the starred symbols the way the Portfolio screen
// shows them: last price plus the move since the previous bundled close.

import { useEffect, useMemo } from 'react'
import { restingOrders } from '@core/portfolio/limitOrders'
import type { LimitOrder } from '@core/portfolio/limitOrders'
import { roundTo } from '@core/portfolio/engine'
import { useAppStore, appClock } from '@state/useAppStore'
import { useSeriesMap } from '@ui/data/loadSeries'
import { useQuotes } from '@ui/data/quotes'

/** Distinct symbols with a resting order, in a stable order. */
export function orderSymbols(orders: readonly LimitOrder[]): string[] {
  return [...new Set(restingOrders(orders).map((o) => o.symbol))].sort()
}

/**
 * Fill any resting order whose limit was crossed since it was placed.
 *
 * Safe to mount once at the app shell: `settleLimitOrders` is idempotent (a
 * filled order is never re-evaluated) and bails out entirely when nothing moved,
 * so the effect re-running on a quote refresh costs one array scan.
 */
export function LimitOrderSync(): null {
  const ready = useAppStore((s) => s.ready)
  const openOrders = useAppStore((s) => s.openOrders)
  const settleLimitOrders = useAppStore((s) => s.settleLimitOrders)

  const symbols = useMemo(() => orderSymbols(openOrders), [openOrders])
  const { series, loading } = useSeriesMap(symbols)
  const today = appClock.today()

  useEffect(() => {
    if (!ready || loading || symbols.length === 0) return
    settleLimitOrders(series)
    // `series` is a fresh object per load; `loading` flipping false is the event.
    // `today` is in the list so an advanced clock re-runs the replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, loading, symbols.join(','), today, settleLimitOrders])

  return null
}

export interface WatchRow {
  symbol: string
  /** Latest price — a live quote when there is one, else the last bundled close. */
  price: number | null
  /** Change since the previous bundled close, in dollars. */
  change: number | null
  /** The same move as a percentage. */
  changePct: number | null
}

/**
 * Price every starred symbol.
 *
 * The comparison is always against the *previous bundled close*, never against
 * the last close in the same file the price came from: with a bundled (stale)
 * quote those are the same bar, and comparing a bar to itself would print a
 * permanent 0.00% next to every watchlist row.
 */
export function useWatchlistRows(): { rows: WatchRow[]; loading: boolean } {
  const watchlist = useAppStore((s) => s.watchlist)
  const { quotes, loading: quotesLoading } = useQuotes(watchlist)
  const { series, loading: seriesLoading } = useSeriesMap(watchlist)

  const rows = watchlist.map((symbol): WatchRow => {
    const s = series[symbol]
    const n = s?.c.length ?? 0
    const lastClose = n > 0 ? s.c[n - 1] : null
    const prevClose = n > 1 ? s.c[n - 2] : null
    const price = quotes[symbol]?.price ?? lastClose

    if (price === null || prevClose === null || !(prevClose > 0)) {
      return { symbol, price, change: null, changePct: null }
    }
    return {
      symbol,
      price,
      change: roundTo(price - prevClose, 2),
      changePct: roundTo((price / prevClose - 1) * 100, 2),
    }
  })

  return { rows, loading: watchlist.length > 0 && (quotesLoading || seriesLoading) }
}
