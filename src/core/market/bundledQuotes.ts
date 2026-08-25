// ─── Bundled-data quote provider (offline fallback) ──────────────────────────
// Prices the Trade flow off the last bar of the bundled `public/data/ohlcv`
// files instead of the network. This is what makes paper trading work on a
// plane, in a dev sandbox with no egress, and on the very first run before any
// live quote has been cached.
//
// Every quote it returns is flagged `stale: true` — it is a historical close,
// possibly months old, and the UI must say so next to the "as of" date rather
// than let it pass for a live mark.

import type { OhlcvSeries, Quote } from '@core/types'
import type { QuoteProvider } from '@core/market/provider'

/** How the UI hands over a bundled series (see `src/ui/data/loadSeries.ts`). */
export type SeriesLoader = (symbol: string) => Promise<OhlcvSeries>

/**
 * Quote = last close of the symbol's bundled series, `asOf` = that bar's date.
 * Rejects when the series is missing, empty, or ends on an unusable close, so
 * a `fallbackProvider` chain can move on instead of quoting a NaN.
 */
export function createBundledProvider(loadSeries: SeriesLoader): QuoteProvider {
  return {
    async getQuote(symbol: string): Promise<Quote> {
      const s = String(symbol ?? '').trim().toUpperCase()
      if (s === '') throw new Error('bundled quote: symbol is required')

      const series = await loadSeries(s)
      const n = series?.c?.length ?? 0
      if (n === 0) throw new Error(`bundled quote: no bars for ${s}`)

      const price = series.c[n - 1]
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`bundled quote: invalid last close for ${s}`)
      }

      const ts = series.t[n - 1]
      const asOf = Number.isFinite(ts)
        ? new Date(ts * 1000).toISOString()
        : new Date(0).toISOString()

      return { symbol: s, price, asOf, stale: true }
    },
  }
}
