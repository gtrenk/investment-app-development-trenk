// ─── Quotes for the UI ───────────────────────────────────────────────────────
// The one place the app asks "what is X worth right now". It composes the pure
// providers from core/ into the chain the Trade and Portfolio screens use:
//
//   fallbackProvider(
//     withCache(stooq via the CORS proxy, 5 min, persisted to IndexedDB),
//     bundledProvider(loadSeries),          ← last close of the shipped OHLCV
//   )
//
// Three consequences worth stating out loud:
//
// 1. **It always answers.** Stooq is unreachable from an offline phone (and from
//    this dev sandbox, which has no egress), so in practice the bundled leg is
//    what fills most paper trades. Those quotes carry `stale: true` and the UI
//    is required to badge them — a months-old close must never pass for a live
//    mark.
// 2. **The cache survives a reload.** `withCache` wants a synchronous store, so
//    an in-memory Map is hydrated from IndexedDB once at startup and written
//    through on every refresh. Anything asking for a quote awaits that hydration
//    first, so there is no window where a fresh tab silently ignores the cache.
// 3. **Only the bundled universe is quotable.** An unknown symbol is rejected
//    before any I/O happens — the tradable universe and the priceable universe
//    are the same 27 symbols by construction.

import { useEffect, useReducer } from 'react'
import type { Quote } from '@core/types'
import type { PriceMap } from '@core/portfolio/engine'
import { fallbackProvider, withCache } from '@core/market/provider'
import type { QuoteCacheEntry, QuoteProvider, QuoteStore } from '@core/market/provider'
import { createStooqProvider, DEFAULT_STOOQ_BASE } from '@core/market/stooq'
import { createBundledProvider } from '@core/market/bundledQuotes'
import { STORAGE_KEYS, createMemoryStorage } from '@core/storage/adapter'
import type { StorageAdapter } from '@core/storage/adapter'
import { idbStorage } from '@platform/idbStorage'
import { loadSeries } from '@ui/data/loadSeries'
import { isTradable } from '@ui/data/universe'

/** How long a live quote is served without going back to the wire. */
export const QUOTE_TTL_MS = 5 * 60 * 1000

/**
 * After this many consecutive live-quote failures the Stooq leg is skipped for
 * `PROXY_COOLDOWN_MS`. Without it, an offline session pays a doomed round trip
 * for every symbol on the picker grid before falling back.
 */
const PROXY_FAIL_LIMIT = 2
const PROXY_COOLDOWN_MS = 5 * 60 * 1000

// ── Storage ──────────────────────────────────────────────────────────────────

function pickStorage(): StorageAdapter {
  try {
    if (typeof indexedDB !== 'undefined') return idbStorage
  } catch {
    /* private mode / blocked storage — fall through */
  }
  return createMemoryStorage()
}

const storage = pickStorage()

type CacheRecord = Record<string, QuoteCacheEntry>

const cache = new Map<string, QuoteCacheEntry>()

/** Coalesce the write-behind: a grid of 27 quotes must not mean 27 IDB writes. */
let flushTimer: ReturnType<typeof setTimeout> | null = null
function scheduleFlush(): void {
  if (flushTimer !== null) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    const out: CacheRecord = {}
    for (const [symbol, entry] of cache) out[symbol] = entry
    void storage.set(STORAGE_KEYS.quotes, out)
  }, 250)
}

/** Map-shaped cache for `withCache`, written through to IndexedDB. */
const persistentStore: QuoteStore = {
  get(symbol) {
    return cache.get(symbol)
  },
  set(symbol, entry) {
    cache.set(symbol, entry)
    scheduleFlush()
  },
}

let hydration: Promise<void> | null = null

/**
 * Load the persisted quote cache. Idempotent and never rejects — a missing or
 * corrupt record just means the app starts with a cold cache.
 */
export function hydrateQuotes(): Promise<void> {
  if (hydration) return hydration
  hydration = storage
    .get<CacheRecord>(STORAGE_KEYS.quotes)
    .then((rec) => {
      for (const [symbol, entry] of Object.entries(rec ?? {})) {
        if (entry && typeof entry.cachedAt === 'number' && Number(entry.quote?.price) > 0) {
          cache.set(symbol, entry)
        }
      }
    })
    .catch(() => undefined)
  return hydration
}

// ── Provider chain ───────────────────────────────────────────────────────────

/**
 * Where live quotes come from: the Cloudflare Worker in production
 * (`VITE_QUOTE_PROXY`), the Vite dev proxy otherwise.
 */
export const QUOTE_PROXY_BASE: string =
  import.meta.env.VITE_QUOTE_PROXY?.trim() || DEFAULT_STOOQ_BASE

let proxyFails = 0
let proxyMutedUntil = 0

/** Stooq behind the proxy, plus a circuit breaker so an offline app fails fast. */
function liveProvider(): QuoteProvider {
  const stooq = createStooqProvider({ baseUrl: QUOTE_PROXY_BASE })
  return {
    async getQuote(symbol: string): Promise<Quote> {
      if (proxyFails >= PROXY_FAIL_LIMIT && Date.now() < proxyMutedUntil) {
        throw new Error('Live quotes unavailable — using bundled data')
      }
      try {
        const quote = await stooq.getQuote(symbol)
        proxyFails = 0
        return quote
      } catch (err) {
        proxyFails++
        if (proxyFails >= PROXY_FAIL_LIMIT) proxyMutedUntil = Date.now() + PROXY_COOLDOWN_MS
        throw err
      }
    },
  }
}

const provider: QuoteProvider = fallbackProvider(
  withCache(liveProvider(), QUOTE_TTL_MS, () => Date.now(), persistentStore),
  createBundledProvider(loadSeries),
)

// ── Reactive quote memo ──────────────────────────────────────────────────────

const latest = new Map<string, Quote>()
const inflight = new Map<string, Promise<Quote>>()
const listeners = new Set<() => void>()

function notify(): void {
  for (const fn of listeners) fn()
}

/**
 * Fetch one symbol's quote. Concurrent callers share a single request, and the
 * resolved quote is remembered for synchronous reads by `useQuotes`.
 */
export function getQuote(symbol: string): Promise<Quote> {
  const s = String(symbol ?? '').trim().toUpperCase()
  if (!isTradable(s)) {
    return Promise.reject(new Error(`${s || 'That symbol'} is not in the tradable universe`))
  }
  const pending = inflight.get(s)
  if (pending) return pending

  const req = hydrateQuotes()
    .then(() => provider.getQuote(s))
    .then((quote) => {
      latest.set(s, quote)
      inflight.delete(s)
      notify()
      return quote
    })
    .catch((err: unknown) => {
      inflight.delete(s)
      throw err
    })

  inflight.set(s, req)
  return req
}

export interface QuotesQuery {
  quotes: Record<string, Quote>
  /** Symbol → price, ready to hand to the portfolio engine. */
  prices: PriceMap
  /** True until every requested symbol has resolved (or failed) at least once. */
  loading: boolean
  /** True when any quote in the set is a stale/bundled mark. */
  stale: boolean
}

/**
 * Subscribe to quotes for a set of symbols.
 *
 * Requests fire on mount and whenever the set changes; the hook re-renders as
 * each one lands, so a 27-tile grid fills in progressively instead of blocking
 * on the slowest symbol. Failures are swallowed — a symbol that cannot be priced
 * simply stays absent from `prices`, which `portfolioEquity` already handles by
 * carrying the position at cost and naming it in `pricesMissing`.
 */
export function useQuotes(symbols: string[]): QuotesQuery {
  const key = symbols.join(',')
  const [, rerender] = useReducer((n: number) => n + 1, 0)

  useEffect(() => {
    listeners.add(rerender)
    return () => {
      listeners.delete(rerender)
    }
  }, [])

  useEffect(() => {
    for (const s of key.split(',').filter(Boolean)) {
      void getQuote(s).catch(() => undefined)
    }
  }, [key])

  const wanted = key.split(',').filter(Boolean)
  const quotes: Record<string, Quote> = {}
  const prices: PriceMap = {}
  let loading = false
  let stale = false
  for (const s of wanted) {
    const q = latest.get(s)
    if (!q) {
      loading = true
      continue
    }
    quotes[s] = q
    prices[s] = q.price
    if (q.stale) stale = true
  }
  return { quotes, prices, loading, stale }
}
