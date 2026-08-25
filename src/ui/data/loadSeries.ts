// ─── Bundled-series loader (UI layer) ────────────────────────────────────────
// core/ deliberately never fetches, so this is the one place that pulls a
// `public/data/ohlcv/{SYMBOL}.json` off the wire. The service worker precaches
// every one of those files, so after the first visit this resolves offline.
//
// Requests are cached as *promises*, not results: two drills mounting the same
// symbol in the same tick share one round trip, and a symbol already loaded
// resolves synchronously on the microtask queue with no network hit at all.

import { useEffect, useState } from 'react'
import type { OhlcvSeries } from '@core/types'
import { validateSeries } from '@core/market/bundled'

const cache = new Map<string, Promise<OhlcvSeries>>()

/** Where the bundled data lives, honouring a non-root deploy base. */
function urlFor(symbol: string): string {
  return `${import.meta.env.BASE_URL}data/ohlcv/${symbol}.json`
}

async function fetchSeries(symbol: string): Promise<OhlcvSeries> {
  const res = await fetch(urlFor(symbol))
  if (!res.ok) throw new Error(`loadSeries: ${symbol} → HTTP ${res.status}`)
  const series = (await res.json()) as OhlcvSeries
  // A truncated or malformed file would otherwise surface as a blank chart.
  const errs = validateSeries(series)
  if (errs.length > 0) throw new Error(`loadSeries: ${symbol} is malformed — ${errs[0]}`)
  return series
}

/**
 * Load one symbol's daily bars. Memoised for the life of the tab; a failed
 * load is evicted so a later attempt (e.g. after coming back online) retries.
 */
export function loadSeries(symbol: string): Promise<OhlcvSeries> {
  const hit = cache.get(symbol)
  if (hit) return hit
  const pending = fetchSeries(symbol).catch((err) => {
    cache.delete(symbol)
    throw err
  })
  cache.set(symbol, pending)
  return pending
}

/** Drop everything — only used by tests. */
export function clearSeriesCache(): void {
  cache.clear()
}

export interface SeriesQuery {
  series: OhlcvSeries | null
  loading: boolean
  error: string | null
}

export interface SeriesMapQuery {
  /** Loaded series keyed by symbol. Symbols that failed are simply absent. */
  series: Record<string, OhlcvSeries>
  /** True until every requested symbol has resolved or failed. */
  loading: boolean
}

/**
 * Load several symbols at once — the shape the limit-order replay and the
 * watchlist both need. Failures are swallowed per symbol (a missing file leaves
 * that entry out) because both callers have a sane answer for "no bars yet":
 * the replay leaves the order resting, and the watchlist shows a dash.
 */
export function useSeriesMap(symbols: readonly string[]): SeriesMapQuery {
  const key = [...symbols].join(',')
  const [state, setState] = useState<SeriesMapQuery>({ series: {}, loading: key !== '' })

  useEffect(() => {
    const wanted = key.split(',').filter(Boolean)
    if (wanted.length === 0) {
      setState({ series: {}, loading: false })
      return
    }
    let live = true
    setState({ series: {}, loading: true })
    void Promise.all(
      wanted.map((s) =>
        loadSeries(s).then(
          (series) => [s, series] as const,
          () => [s, null] as const,
        ),
      ),
    ).then((entries) => {
      if (!live) return
      const out: Record<string, OhlcvSeries> = {}
      for (const [symbol, series] of entries) if (series) out[symbol] = series
      setState({ series: out, loading: false })
    })
    return () => {
      live = false
    }
  }, [key])

  return state
}

/**
 * React binding for `loadSeries`. `symbol` may be null while the caller is
 * still deciding what to show; the hook then simply idles.
 */
export function useSeries(symbol: string | null): SeriesQuery {
  const [state, setState] = useState<SeriesQuery>({ series: null, loading: symbol !== null, error: null })

  useEffect(() => {
    if (symbol === null) {
      setState({ series: null, loading: false, error: null })
      return
    }
    let live = true
    setState({ series: null, loading: true, error: null })
    loadSeries(symbol).then(
      (series) => {
        if (live) setState({ series, loading: false, error: null })
      },
      (err: unknown) => {
        if (live) {
          setState({ series: null, loading: false, error: err instanceof Error ? err.message : String(err) })
        }
      },
    )
    return () => {
      live = false
    }
  }, [symbol])

  return state
}
