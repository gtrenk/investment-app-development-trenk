// ─── Portfolio valuation & daily sync ────────────────────────────────────────
// Everything that needs "what is the account worth right now" goes through
// `usePortfolioValuation`, so Home, Portfolio and Trade always agree on the
// number. `<PortfolioSync />` mounts once in the app shell and does the two
// things that must happen on open: initialise the shadow benchmark, and record
// today's equity point (backfilling the days the app was closed).

import { useEffect, useMemo } from 'react'
import { portfolioEquity } from '@core/portfolio/engine'
import type { EquityBreakdown, PriceMap } from '@core/portfolio/engine'
import { benchmarkEquity } from '@core/portfolio/benchmark'
import type { PortfolioState, Quote } from '@core/types'
import { useAppStore } from '@state/useAppStore'
import { useQuotes } from '@ui/data/quotes'
import { useSeries } from '@ui/data/loadSeries'
import { BENCHMARK_SYMBOL } from '@ui/data/universe'

/** Distinct symbols with an open position, in a stable order. */
export function heldSymbols(p: PortfolioState): string[] {
  const seen = new Set<string>()
  for (const lot of p.lots) seen.add(lot.symbol)
  return [...seen].sort()
}

export interface Valuation {
  portfolio: PortfolioState
  /** Marked-to-market equity, cash and unrealized P&L. */
  equity: EquityBreakdown
  prices: PriceMap
  quotes: Record<string, Quote>
  /** Last SPY price, or null when it could not be quoted. */
  spyPrice: number | null
  /** Value of the shadow index position, or null before it is initialised. */
  benchEquity: number | null
  /** True while any needed quote is still in flight. */
  loading: boolean
  /** True when any quote backing these numbers is a bundled/stale mark. */
  stale: boolean
}

/**
 * Quote every held symbol plus SPY and mark the portfolio to market.
 *
 * Symbols that fail to quote are carried at cost by `portfolioEquity` and named
 * in `equity.pricesMissing` — the screens surface that rather than silently
 * showing a wrong total.
 */
export function usePortfolioValuation(): Valuation {
  const portfolio = useAppStore((s) => s.portfolio)

  const lotsKey = portfolio.lots.map((l) => l.symbol).join(',')
  const symbols = useMemo(() => {
    const held = new Set(lotsKey.split(',').filter(Boolean))
    held.add(BENCHMARK_SYMBOL)
    return [...held].sort()
  }, [lotsKey])

  const { quotes, prices, loading, stale } = useQuotes(symbols)
  const equity = portfolioEquity(portfolio, prices)
  const spy = prices[BENCHMARK_SYMBOL]
  const spyPrice = Number.isFinite(spy) && spy > 0 ? spy : null

  return {
    portfolio,
    equity,
    prices,
    quotes,
    spyPrice,
    benchEquity: spyPrice === null ? null : benchmarkEquity(portfolio, spyPrice),
    loading,
    stale,
  }
}

/**
 * Invisible shell component: initialises the benchmark on the first usable SPY
 * price and writes one equity snapshot per day.
 *
 * Both store actions are idempotent (`initBenchmark` is init-once and
 * `snapshotToday` bails when nothing moved), so re-running on every quote
 * refresh is safe and cheap. The snapshot waits until *every* held symbol has a
 * price, so a half-loaded grid never writes a marked-at-cost point into the
 * permanent equity history.
 */
export function PortfolioSync(): null {
  const ready = useAppStore((s) => s.ready)
  const ensureBenchmark = useAppStore((s) => s.ensureBenchmark)
  const snapshotToday = useAppStore((s) => s.snapshotToday)
  const { prices, spyPrice, equity } = usePortfolioValuation()
  const { series: spySeries } = useSeries(ready ? BENCHMARK_SYMBOL : null)

  useEffect(() => {
    if (!ready || spyPrice === null) return
    ensureBenchmark(spyPrice)
  }, [ready, spyPrice, ensureBenchmark])

  const pricesKey = Object.entries(prices)
    .map(([s, p]) => `${s}:${p}`)
    .sort()
    .join('|')
  const fullyPriced = equity.pricesMissing.length === 0

  useEffect(() => {
    if (!ready || spyPrice === null || !fullyPriced) return
    snapshotToday(prices, spySeries)
    // `prices` is a fresh object each render; `pricesKey` is its stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, spyPrice, fullyPriced, pricesKey, spySeries, snapshotToday])

  return null
}
