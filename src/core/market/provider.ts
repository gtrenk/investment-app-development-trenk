// ─── Quote provider contract & caching wrapper ───────────────────────────────
// One tiny interface so the Trade flow never knows whether a price came off
// the wire, out of the cache, or out of the bundled historical files.
//
// Implementations live beside this file: `stooq.ts` (live, delayed) and
// `bundledQuotes.ts` (offline fallback). Both are constructed with their I/O
// injected, so nothing in core/ ever reaches for a global.

import type { Quote } from '@core/types'

export interface QuoteProvider {
  /** Resolve with a quote, or reject if no price could be produced at all. */
  getQuote(symbol: string): Promise<Quote>
}

/** Canonical cache key form: trimmed, upper-case. */
function key(symbol: string): string {
  return String(symbol ?? '').trim().toUpperCase()
}

export interface QuoteCacheEntry {
  quote: Quote
  /** Epoch ms the entry was written, per the injected clock. */
  cachedAt: number
}

/**
 * Map-shaped cache. A plain `Map` satisfies it, and so does a thin wrapper the
 * UI writes through to IndexedDB — which is the point: quotes survive a reload
 * and a plane ride, and the phone can still price a portfolio offline.
 */
export interface QuoteStore {
  get(symbol: string): QuoteCacheEntry | undefined
  set(symbol: string, entry: QuoteCacheEntry): void
}

/**
 * Wrap a provider with a TTL cache that degrades instead of failing.
 *
 * - fresh entry (age < `ttlMs`) → served straight from the store, no call
 * - stale or absent → the underlying provider is called; a success refreshes
 *   the entry and is returned as-is
 * - the call fails, but *something* is cached (however old) → that quote is
 *   returned with `stale: true`. This is the offline path: the Trade screen
 *   fills against the last known price and labels it "as of …".
 * - the call fails with nothing cached → the rejection propagates; there is no
 *   honest price to show.
 *
 * `clockNow` returns epoch ms (`Date.now` in the app, a counter in tests).
 * Concurrent calls for the same symbol are not de-duplicated — the UI asks for
 * one quote per confirm screen, so the extra machinery would not earn its keep.
 */
export function withCache(
  provider: QuoteProvider,
  ttlMs: number,
  clockNow: () => number,
  store: QuoteStore = new Map<string, QuoteCacheEntry>(),
): QuoteProvider {
  return {
    async getQuote(symbol: string): Promise<Quote> {
      const k = key(symbol)
      const hit = store.get(k)
      const now = clockNow()

      if (hit && now - hit.cachedAt < ttlMs) return hit.quote

      try {
        const quote = await provider.getQuote(symbol)
        store.set(k, { quote, cachedAt: now })
        return quote
      } catch (err) {
        if (hit) return { ...hit.quote, stale: true }
        throw err
      }
    },
  }
}

/**
 * Try providers in order, first success wins — live quotes with the bundled
 * historical price as a last resort. Rejects with the last error if all fail.
 */
export function fallbackProvider(...providers: QuoteProvider[]): QuoteProvider {
  return {
    async getQuote(symbol: string): Promise<Quote> {
      let lastErr: unknown = new Error(`No quote provider available for ${symbol}`)
      for (const p of providers) {
        try {
          return await p.getQuote(symbol)
        } catch (err) {
          lastErr = err
        }
      }
      throw lastErr
    },
  }
}
