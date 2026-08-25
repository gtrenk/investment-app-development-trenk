// ─── Stooq live-quote provider ───────────────────────────────────────────────
// Stooq is keyless and free, and serves a delayed last price as a two-line CSV:
//
//   https://stooq.com/q/l/?s=aapl.us&f=sd2t2ohlcv&h&e=csv
//
//   s=<ticker>.us        US listings need the `.us` suffix, lower-case
//   f=sd2t2ohlcv         fields: Symbol, Date, Time, O, H, L, C, Volume
//   h                    include the header row
//   e=csv                CSV output
//
//   Symbol,Date,Time,Open,High,Low,Close,Volume
//   AAPL.US,2024-05-17,22:00:07,189.51,190.81,189.18,189.87,41282925
//
// It sends no CORS headers, so the browser never talks to stooq.com directly:
// `baseUrl` points at the Vite dev proxy (`/api/stooq`) or, in production, at
// the Cloudflare Worker in `proxy/worker.js`.
//
// Failures arrive as HTTP 200 with a text body, never as a status code — see
// `parseStooqQuoteCsv`, which is exported and unit-tested on its own because
// this sandbox cannot reach stooq.com to exercise the fetch half.

import type { Quote } from '@core/types'
import type { QuoteProvider } from '@core/market/provider'

/** Minimal shape of what `fetch` gives back — keeps core free of DOM types. */
export interface FetchResponseLike {
  ok: boolean
  status: number
  text(): Promise<string>
}

export type FetchLike = (url: string) => Promise<FetchResponseLike>

export interface StooqProviderOptions {
  /** Proxy origin/prefix that forwards to https://stooq.com. */
  baseUrl?: string
  /** Injected for tests and for the RN port; defaults to the platform fetch. */
  fetchFn?: FetchLike
}

/** Default proxy path — matches `server.proxy` in vite.config.ts. */
export const DEFAULT_STOOQ_BASE = '/api/stooq'

/** Stooq's "no data" marker, seen in every field of an unknown ticker's row. */
const NO_DATA = /^n\/[da]$/i

/**
 * App symbol → Stooq ticker. `AAPL` → `aapl.us`; dotted class shares use a
 * hyphen (`BRK.B` → `brk-b.us`). A symbol that already carries a market suffix
 * is passed through lower-cased, so callers can address non-US listings.
 */
export function toStooqSymbol(symbol: string): string {
  const s = String(symbol ?? '').trim().toLowerCase()
  if (s === '') throw new Error('toStooqSymbol: symbol is required')
  if (/\.(us|uk|de|jp|pl|hk)$/.test(s)) return s
  return `${s.replace(/\./g, '-')}.us`
}

/** The full quote URL for a symbol — exported so tests can assert on it. */
export function stooqQuoteUrl(baseUrl: string, symbol: string): string {
  const base = baseUrl.replace(/\/+$/, '')
  return `${base}/q/l/?s=${encodeURIComponent(toStooqSymbol(symbol))}&f=sd2t2ohlcv&h&e=csv`
}

/**
 * Parse the two-line quote CSV into a `Quote`.
 *
 * Tolerates CRLF, blank lines, a trailing newline and reordered columns (the
 * header locates them). Throws — rather than returning a fake price — on:
 * an empty body, the rate-limit message, a missing header/row, an `N/D` close
 * (unknown or delisted ticker), or a non-numeric close.
 *
 * `asOf` is built from Stooq's Date+Time fields, which are stamped in Stooq's
 * own timezone (CET) with no offset published. We record them as UTC: the
 * value only drives the "as of …" label and staleness display, where a couple
 * of hours of skew is acceptable and a wrong-by-a-day parse would not be. When
 * the row carries no time, midnight UTC of the quote date is used.
 *
 * @param symbol Canonical app symbol to stamp on the result (Stooq echoes
 *               `AAPL.US`, which is not what the rest of the app keys on).
 */
export function parseStooqQuoteCsv(csv: string, symbol?: string): Quote {
  const text = String(csv ?? '').trim()
  if (text === '') throw new Error('Stooq: empty response')
  if (/exceeded the daily hits limit/i.test(text)) {
    throw new Error('Stooq: daily request limit reached — try again later')
  }

  const lines = text.split(/\r?\n/).filter((ln) => ln.trim() !== '')
  if (lines.length < 2) throw new Error(`Stooq: no quote row in response: ${text.slice(0, 80)}`)

  const header = lines[0].toLowerCase().split(',').map((s) => s.trim())
  const row = lines[1].split(',').map((s) => s.trim())
  const at = (name: string): string => {
    const i = header.indexOf(name)
    return i >= 0 ? (row[i] ?? '') : ''
  }

  if (header.indexOf('close') < 0 || header.indexOf('symbol') < 0) {
    throw new Error(`Stooq: unexpected response (not a quote CSV): ${text.slice(0, 80)}`)
  }

  const rawClose = at('close')
  const rawDate = at('date')
  if (NO_DATA.test(rawClose) || NO_DATA.test(rawDate)) {
    throw new Error(`Stooq: no data for ${symbol ?? (at('symbol') || 'that symbol')}`)
  }

  const price = Number(rawClose)
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Stooq: unparseable close '${rawClose}'`)
  }

  const rawTime = at('time')
  const time = /^\d{2}:\d{2}(:\d{2})?$/.test(rawTime)
    ? rawTime.length === 5 ? `${rawTime}:00` : rawTime
    : '00:00:00'
  const asOfMs = Date.parse(`${rawDate}T${time}Z`)
  if (!Number.isFinite(asOfMs)) throw new Error(`Stooq: unparseable date '${rawDate} ${rawTime}'`)

  return {
    symbol: (symbol ?? at('symbol').replace(/\.[a-z]+$/i, '')).trim().toUpperCase(),
    price,
    asOf: new Date(asOfMs).toISOString(),
    // Delayed, but a genuine mark of today's session — the cache wrapper is
    // what flips this to true when a fill has to reuse an old price.
    stale: false,
  }
}

/**
 * Live (delayed) quotes via a CORS proxy in front of Stooq.
 * The default `fetchFn` is the only reference to a global in this module, and
 * it is a default parameter — nothing is captured at import time.
 */
export function createStooqProvider(options: StooqProviderOptions = {}): QuoteProvider {
  const baseUrl = options.baseUrl ?? DEFAULT_STOOQ_BASE
  const fetchFn: FetchLike =
    options.fetchFn ?? ((url: string) => (globalThis as { fetch: FetchLike }).fetch(url))

  return {
    async getQuote(symbol: string): Promise<Quote> {
      const res = await fetchFn(stooqQuoteUrl(baseUrl, symbol))
      if (!res.ok) throw new Error(`Stooq: HTTP ${res.status} for ${symbol}`)
      return parseStooqQuoteCsv(await res.text(), symbol)
    },
  }
}
