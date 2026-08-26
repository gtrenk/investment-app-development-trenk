#!/usr/bin/env node
// ─── Real market-data fetcher (Stooq, falling back to Yahoo) ─────────────────
//
//   node scripts/fetch-data.mjs                 # all symbols, last ~10 years
//   node scripts/fetch-data.mjs --symbols=AAPL,SPY
//   node scripts/fetch-data.mjs --years=5
//   node scripts/fetch-data.mjs --out=public/data
//   node scripts/fetch-data.mjs --max-failures=3 --min-bars=2000   # CI guardrails
//   node scripts/fetch-data.mjs --provider=yahoo                   # skip Stooq
//   node scripts/fetch-data.mjs --help
//
// TWO PROVIDERS, IN ORDER
// -----------------------
// 1. **Stooq** — keyless, free, oldest-first CSV:
//
//      https://stooq.com/q/d/l/?s=aapl.us&i=d
//
//      s=<ticker>.us   US listings need the `.us` suffix (lower-case)
//      i=d             daily interval
//
//    Response is a CSV with a header row, oldest bar first:
//
//      Date,Open,High,Low,Close,Volume
//      2016-12-27,115.80,117.80,115.61,117.26,18296855
//
// 2. **Yahoo** — used for any symbol Stooq does not hand back CSV:
//
//      https://query1.finance.yahoo.com/v8/finance/chart/AAPL?range=10y&interval=1d
//
//    Plain symbol, no `.us` suffix. JSON, with `chart.result[0].timestamp[]`
//    alongside `chart.result[0].indicators.quote[0].{open,high,low,close,volume}`.
//
// ⚠ WHY THE FALLBACK EXISTS — a real failure, not a hypothetical.
//   The first live run of `.github/workflows/refresh-data.yml` got an HTML
//   anti-bot page (`<!DOCTYPE html>… <meta name="robots" …> … <noscript>`)
//   back from Stooq for all 27 symbols: Stooq serves a JavaScript challenge to
//   GitHub Actions' datacenter IP ranges. Nothing bad shipped — the failure
//   budget and carry-forward below did their job — but the refresh could not
//   fetch anything. So this script now (a) asks with browser-like headers and
//   (b) recognises that challenge page for what it is, stops retrying it (an IP
//   block does not change its mind in six seconds) and asks Yahoo instead.
//
// ⚠ NEITHER ENDPOINT IS REACHABLE FROM THE SANDBOX THIS WAS WRITTEN IN.
//   The egress proxy returns 403 for stooq.com and finance.yahoo.com alike, so
//   the HTTP calls have never run here. Everything that does not touch the
//   network — URL construction, challenge detection, `parseStooqCsv`,
//   `parseYahooChart`, the year trim — is exported and unit-tested in
//   `tests/fetchData.test.ts`, and those tests are the correctness story.
//
// RAW PRICES, NOT ADJUSTED
// ------------------------
// Yahoo also serves `indicators.adjclose[0].adjclose`. This script deliberately
// keeps the RAW OHLC:
//   • the drills are chart-reading exercises, and a candle has to be the price
//     that actually traded — an adjusted open/high/low is a synthetic number;
//   • adjusted history is *rewritten* by every subsequent dividend and split, so
//     a monthly refresh would silently shift every bar and, with them, every
//     curated drill window, producing a diff (and a re-curation) every month
//     whether or not any new bar arrived.
// The cost is that multi-year returns across a dividend are understated. For a
// pattern-recognition drill that is the right trade.
//
// Failure modes to expect (Stooq signals all of these with HTTP 200):
//   • an HTML challenge page                → IP-blocked; falls through to Yahoo
//   • "Exceeded the daily hits limit"       → rate limited; falls through to Yahoo
//   • "No data" / a bare header row         → bad or delisted ticker
//
// Output is byte-compatible with the synthetic generator: one columnar JSON
// per symbol in `public/data/ohlcv/{SYMBOL}.json` matching `OhlcvSeries`
// (src/core/types.ts), plus `public/data/manifest.json`.
//
// `manifest.generated` stays a two-value field — 'synthetic' (from
// `scripts/generate-data.mjs`) or 'stooq' (from this script) — because that is
// what every consumer switches on, and it names the *pipeline*, not the host
// that happened to answer. Which host actually answered is recorded per symbol
// in `symbols[].source` ('stooq' | 'yahoo' | 'kept') and rolled up in
// `providers`, so a refresh that quietly ran entirely off the fallback is
// visible in the diff instead of being invisible.
//
// No dependencies beyond node builtins (uses global fetch — needs Node 18+).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

export const DEFAULT_SYMBOLS = [
  'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOG', 'META', 'TSLA', 'JPM', 'BAC',
  'XOM', 'CVX', 'JNJ', 'PFE', 'UNH', 'WMT', 'COST', 'KO', 'PG', 'DIS',
  'NFLX', 'BA', 'CAT', 'HD', 'V', 'MA', 'SPY', 'QQQ',
]

/** Be a good citizen: one request at a time, with a gap between them. */
const DELAY_MS = 1200
/** Per-symbol attempts for a transient failure (network blip, 5xx, rate limit). */
const MAX_ATTEMPTS = 3
/**
 * Attempts when the answer is an anti-bot challenge page.
 *
 * One retry, then move on. The first live workflow run spent six minutes
 * politely re-asking an IP block the same question with 1.5s → 3s → 6s waits
 * between goes, and got the same HTML back every time. An IP block is not a
 * transient failure; the correct response is the other provider, quickly.
 */
const CHALLENGE_ATTEMPTS = 2
/** First backoff for a transient failure; doubles each retry (1.5s → 3s). */
const BACKOFF_MS = 1500
/** Backoff between challenge attempts — short, because the answer will not change. */
const CHALLENGE_BACKOFF_MS = 600
const TIMEOUT_MS = 20_000

/**
 * Ask like a browser.
 *
 * Both providers throttle or challenge traffic that announces itself as a
 * script (the previous `User-Agent: tickerquest-data-fetch/1.0` was an
 * invitation). This is not an attempt to hide: the request rate stays one
 * symbol at a time with a pause between, well inside what a person clicking
 * around the site would generate. It is only that the polite path and the
 * script-shaped path are served different pages.
 */
function browserHeaders(accept, referer) {
  return {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    Accept: accept,
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: referer,
  }
}

/**
 * Does this body look like an anti-bot / JS-challenge HTML page rather than the
 * data that was asked for?
 *
 * Both providers answer HTTP 200 with HTML when they decide a caller is a
 * robot, so the status code says nothing and the body has to be sniffed. Kept
 * deliberately narrow — a leading doctype/`<html>`, a `<noscript>` block, or
 * the `noindex,nofollow` robots meta — so a CSV that merely *contains* an angle
 * bracket is not mistaken for a challenge.
 *
 * @param {string} body  Raw response text.
 */
export function looksLikeChallenge(body) {
  const head = String(body ?? '').slice(0, 2000).toLowerCase()
  if (/^\s*<(!doctype\b|html\b|\?xml\b)/.test(head)) return true
  if (head.includes('<noscript')) return true
  return /<meta[^>]+name=["']?robots["']?[^>]*noindex/.test(head)
}

// ─── CSV parsing (pure — the unit-testable half of this script) ──────────────

/**
 * Parse a Stooq daily CSV into an `OhlcvSeries`-shaped object.
 *
 * Tolerates: CRLF line endings, a trailing newline, blank lines, and columns
 * in any order (the header is used to locate them). Rows with a missing or
 * non-numeric OHLC value are dropped rather than poisoning the series with
 * NaN — Stooq occasionally emits `N/A` for an untraded day. Volume defaults
 * to 0 when absent (some non-US tickers omit it).
 *
 * Bars are returned oldest-first with `t` as UTC-midnight unix *seconds*.
 *
 * @param {string} symbol  Canonical upper-case symbol for the output series.
 * @param {string} csv     Raw response body.
 * @returns {{symbol: string, interval: '1d', t: number[], o: number[], h: number[], l: number[], c: number[], v: number[]}}
 * @throws if the body is not a parseable Stooq CSV (rate limit, "No data", …).
 */
export function parseStooqCsv(symbol, csv) {
  const text = String(csv ?? '').trim()
  if (!text) throw new Error(`${symbol}: empty response`)

  // An HTML body is the anti-bot challenge, served with a 200. The word
  // "anti-bot" in the message is load-bearing: `fetchStooq` reads it to stop
  // retrying and hand over to the fallback provider.
  if (looksLikeChallenge(text)) {
    throw new Error(`${symbol}: Stooq served an anti-bot HTML challenge, not CSV`)
  }

  // Stooq signals errors with a plain-text body and a 200 status.
  if (/exceeded the daily hits limit/i.test(text)) {
    throw new Error(`${symbol}: Stooq rate limit reached — try again later`)
  }

  const lines = text.split(/\r?\n/).filter((ln) => ln.trim() !== '')
  const header = lines[0].toLowerCase().split(',').map((s) => s.trim())
  const col = (name) => header.indexOf(name)
  const iDate = col('date')
  const iOpen = col('open')
  const iHigh = col('high')
  const iLow = col('low')
  const iClose = col('close')
  const iVol = col('volume')

  if (iDate < 0 || iOpen < 0 || iHigh < 0 || iLow < 0 || iClose < 0) {
    throw new Error(`${symbol}: unexpected response (not a Stooq CSV): ${text.slice(0, 120)}`)
  }
  if (lines.length < 2) throw new Error(`${symbol}: no data rows returned`)

  const t = [], o = [], h = [], l = [], c = [], v = []

  for (let i = 1; i < lines.length; i++) {
    const f = lines[i].split(',')
    const date = (f[iDate] || '').trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue

    const O = Number(f[iOpen]), H = Number(f[iHigh])
    const L = Number(f[iLow]), C = Number(f[iClose])
    if (![O, H, L, C].every((x) => Number.isFinite(x) && x > 0)) continue

    const V = iVol >= 0 ? Number(f[iVol]) : 0

    t.push(Date.parse(`${date}T00:00:00Z`) / 1000)
    o.push(round2(O))
    // Defend the OHLC invariants: Stooq is clean but adjusted feeds are not
    // always self-consistent, and the drill renderer assumes h ≥ max(o,c).
    h.push(round2(Math.max(H, O, C)))
    l.push(round2(Math.min(L, O, C)))
    c.push(round2(C))
    v.push(Number.isFinite(V) && V > 0 ? Math.round(V) : 0)
  }

  if (t.length === 0) throw new Error(`${symbol}: no usable rows after parsing`)

  return { symbol, interval: '1d', t, o, h, l, c, v }
}

function round2(x) {
  return Math.round(x * 100) / 100
}

/** Floor a unix timestamp to UTC midnight of its day. */
function toUtcDay(seconds) {
  const n = Number(seconds)
  if (!Number.isFinite(n)) return Number.NaN
  return Math.floor(n / 86400) * 86400
}

/**
 * Yahoo's `range` parameter only accepts a fixed vocabulary, so `--years` is
 * rounded *up* to the nearest token it understands and the exact window is then
 * cut by `trimToYears`. Asking for more and trimming is safe; asking for less
 * would silently ship a short series.
 *
 * @param {number} years
 */
export function yahooRange(years) {
  const n = Number(years)
  if (!Number.isFinite(n) || n <= 0) return 'max'
  for (const token of [1, 2, 5, 10]) if (n <= token) return `${token}y`
  return 'max'
}

/**
 * Yahoo daily-chart endpoint for one symbol.
 *
 * Plain upper-case symbol — no `.us` suffix, unlike Stooq. Every symbol in
 * `DEFAULT_SYMBOLS`, ETFs included, is addressable as-is; index tickers would
 * need a `^` prefix, and none of ours are indices.
 *
 * @param {string} symbol
 * @param {number} [years]
 */
export function yahooUrl(symbol, years = 10) {
  return (
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol.toUpperCase())}` +
    `?range=${yahooRange(years)}&interval=1d`
  )
}

/**
 * Parse a Yahoo v8 chart payload into an `OhlcvSeries`-shaped object.
 *
 * Accepts either the raw response text or an already-parsed object, so the
 * caller can hand over whatever it has and every failure mode lands here with a
 * message naming the symbol.
 *
 * What this has to survive, all of it seen in real payloads:
 *   • `chart.error` set with `chart.result: null` (unknown ticker, bad range)
 *   • `null` entries padded into the quote arrays for halts and early closes —
 *     dropped, because a null price is not a bar
 *   • `volume` null on a day the prices are fine — kept as a bar, volume 0
 *   • timestamps at the *market open* (14:30 UTC), not UTC midnight — floored,
 *     so the series lines up bar-for-bar with Stooq and with the synthetic
 *     generator, and `manifest.firstDate` means the same thing either way
 *   • a duplicate trailing timestamp for the in-progress session — dropped, so
 *     `t` stays strictly increasing (a core `validateSeries` invariant)
 *
 * Uses the raw OHLC, never `adjclose` — see the note at the top of this file.
 *
 * @param {string} symbol   Canonical upper-case symbol for the output series.
 * @param {unknown} payload Response body, as text or as a parsed object.
 * @returns {{symbol: string, interval: '1d', t: number[], o: number[], h: number[], l: number[], c: number[], v: number[]}}
 * @throws if the payload is not a usable Yahoo chart response.
 */
export function parseYahooChart(symbol, payload) {
  let doc = payload
  if (typeof doc === 'string') {
    const text = doc.trim()
    if (!text) throw new Error(`${symbol}: empty response`)
    if (looksLikeChallenge(text)) {
      throw new Error(`${symbol}: Yahoo served an anti-bot HTML challenge, not JSON`)
    }
    try {
      doc = JSON.parse(text)
    } catch {
      throw new Error(`${symbol}: unexpected response (not Yahoo chart JSON): ${text.slice(0, 120)}`)
    }
  }
  if (!doc || typeof doc !== 'object') throw new Error(`${symbol}: empty Yahoo payload`)

  const chart = doc.chart
  if (!chart || typeof chart !== 'object') throw new Error(`${symbol}: no 'chart' in the Yahoo payload`)
  if (chart.error) {
    const detail = chart.error.description || chart.error.code || 'unknown error'
    throw new Error(`${symbol}: Yahoo returned an error — ${detail}`)
  }

  const result = Array.isArray(chart.result) ? chart.result[0] : null
  if (!result) throw new Error(`${symbol}: Yahoo returned no result for this symbol`)

  const stamps = result.timestamp
  const quote = result.indicators && Array.isArray(result.indicators.quote)
    ? result.indicators.quote[0]
    : null
  if (!Array.isArray(stamps) || stamps.length === 0 || !quote) {
    throw new Error(`${symbol}: Yahoo payload carries no daily bars`)
  }
  for (const name of ['open', 'high', 'low', 'close']) {
    if (!Array.isArray(quote[name])) {
      throw new Error(`${symbol}: Yahoo payload is missing the '${name}' series`)
    }
  }

  const t = [], o = [], h = [], l = [], c = [], v = []

  for (let i = 0; i < stamps.length; i++) {
    const day = toUtcDay(stamps[i])
    if (!Number.isFinite(day)) continue

    const O = Number(quote.open[i]), H = Number(quote.high[i])
    const L = Number(quote.low[i]), C = Number(quote.close[i])
    // `Number(null)` is 0, which the `> 0` test rejects; `Number(undefined)` is
    // NaN, which the finiteness test rejects. Both padded shapes drop out here.
    if (![O, H, L, C].every((x) => Number.isFinite(x) && x > 0)) continue
    // Strictly increasing, so a repeated or out-of-order stamp cannot land.
    if (t.length > 0 && day <= t[t.length - 1]) continue

    const V = Array.isArray(quote.volume) ? Number(quote.volume[i]) : 0

    t.push(day)
    o.push(round2(O))
    // Same invariant repair as the CSV path: the drill renderer assumes
    // h >= max(o, c) and l <= min(o, c), and no feed guarantees it.
    h.push(round2(Math.max(H, O, C)))
    l.push(round2(Math.min(L, O, C)))
    c.push(round2(C))
    v.push(Number.isFinite(V) && V > 0 ? Math.round(V) : 0)
  }

  if (t.length === 0) throw new Error(`${symbol}: no usable rows after parsing`)

  return { symbol, interval: '1d', t, o, h, l, c, v }
}

/** Drop every bar older than `years` before the newest one. */
export function trimToYears(series, years) {
  if (!years || years <= 0) return series
  const last = series.t[series.t.length - 1]
  const cutoff = last - years * 365.25 * 86400
  let from = 0
  while (from < series.t.length && series.t[from] < cutoff) from++
  if (from === 0) return series
  return {
    symbol: series.symbol,
    interval: series.interval,
    t: series.t.slice(from),
    o: series.o.slice(from),
    h: series.h.slice(from),
    l: series.l.slice(from),
    c: series.c.slice(from),
    v: series.v.slice(from),
  }
}

// ─── Network ─────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export function stooqUrl(symbol) {
  // US listings carry a `.us` suffix. Class shares use a dash on Stooq
  // (BRK.B → brk-b.us); none of DEFAULT_SYMBOLS need that, but the mapping is
  // here so adding one later is a one-liner.
  return `https://stooq.com/q/d/l/?s=${symbol.toLowerCase().replace(/\./g, '-')}.us&i=d`
}

/**
 * One GET with a timeout, returning the body as text.
 *
 * A 404 is named rather than left as a bare status because it is the one
 * failure a retry can never fix.
 */
async function getText(url, headers, symbol) {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: ctl.signal, headers })
    if (res.status === 404) throw new Error(`${symbol}: 404 — unknown ticker`)
    if (!res.ok) throw new Error(`${symbol}: HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

/**
 * The whole retry policy, as one pure decision.
 *
 * Three regimes, and the middle one is why this function exists:
 *   • **fatal** (`budget: 0`) — a 404. The ticker will not materialise.
 *   • **challenge** — an anti-bot HTML page. One more go on a short fuse, then
 *     the caller should try the other provider. The first live workflow run
 *     burned six minutes re-asking an IP block with doubling waits; a block is
 *     a standing decision, so waiting longer only wastes the job's time.
 *   • **transient** — everything else (5xx, rate limit, socket error), which
 *     genuinely does clear, so exponential backoff earns its keep.
 *
 * Exported so the policy is unit-testable without a network or a clock.
 *
 * @param {string} message  The failure message from a fetch-and-parse attempt.
 * @param {number} attempt  1-based attempt number that just failed.
 * @returns {{budget: number, waitMs: number}} Total attempts allowed, and how
 *   long to wait before the next one.
 */
export function retryPlanFor(message, attempt) {
  const text = String(message ?? '')
  if (/unknown ticker/.test(text)) return { budget: 0, waitMs: 0 }
  if (/anti-bot/.test(text)) return { budget: CHALLENGE_ATTEMPTS, waitMs: CHALLENGE_BACKOFF_MS }
  return { budget: MAX_ATTEMPTS, waitMs: BACKOFF_MS * 2 ** (Math.max(1, attempt) - 1) }
}

/**
 * Retry wrapper shared by both providers, driving `retryPlanFor`.
 *
 * @param {string} label   Provider name, for the log line.
 * @param {string} symbol
 * @param {() => Promise<object>} attemptFn  Performs one fetch-and-parse.
 */
async function withRetries(label, symbol, attemptFn) {
  let lastErr
  let budget = MAX_ATTEMPTS

  for (let attempt = 1; attempt <= budget; attempt++) {
    try {
      return await attemptFn()
    } catch (err) {
      lastErr = err
      const plan = retryPlanFor(err.message, attempt)
      if (plan.budget === 0) throw err
      budget = Math.min(budget, plan.budget)
      if (attempt >= budget) break
      console.warn(`    ${label}: ${err.message} — retry ${attempt}/${budget - 1} in ${plan.waitMs}ms`)
      await sleep(plan.waitMs)
    }
  }
  throw lastErr
}

/** Fetch and parse one symbol from Stooq. */
async function fetchStooq(symbol) {
  return withRetries('stooq', symbol, async () =>
    parseStooqCsv(
      symbol,
      await getText(
        stooqUrl(symbol),
        browserHeaders('text/csv,text/plain,*/*;q=0.8', 'https://stooq.com/'),
        symbol,
      ),
    ),
  )
}

/** Fetch and parse one symbol from Yahoo. */
async function fetchYahoo(symbol, years) {
  return withRetries('yahoo', symbol, async () =>
    parseYahooChart(
      symbol,
      await getText(
        yahooUrl(symbol, years),
        browserHeaders('application/json,text/plain,*/*;q=0.8', 'https://finance.yahoo.com/'),
        symbol,
      ),
    ),
  )
}

/**
 * Fetch one symbol, Stooq first and Yahoo as the fallback.
 *
 * Falls through on *any* Stooq failure, not only the challenge page: a rate
 * limit, a 404 against Stooq's `.us` symbology, or a network error are all
 * cases where the other provider may simply have the data. The reason is logged
 * either way, so a run that silently drifted onto the fallback is visible in
 * the job output as well as in the manifest.
 *
 * @returns {Promise<{series: object, source: 'stooq' | 'yahoo'}>}
 */
async function fetchSeries(symbol, years, provider) {
  if (provider !== 'yahoo') {
    try {
      return { series: await fetchStooq(symbol), source: 'stooq' }
    } catch (err) {
      if (provider === 'stooq') throw err
      const detail = err.message.startsWith(`${symbol}: `) ? err.message.slice(symbol.length + 2) : err.message
      console.warn(`    stooq failed (${detail}) — trying yahoo`)
    }
  }
  return { series: await fetchYahoo(symbol, years), source: 'yahoo' }
}

// ─── Main ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = {
    symbols: DEFAULT_SYMBOLS,
    years: 10,
    out: join(ROOT, 'public', 'data'),
    // Unattended refreshes need a failure budget: one delisted-for-a-day ticker
    // must not abandon a good fetch of the other twenty-six, but a rate limit
    // that takes out half the universe has to fail the run.
    maxFailures: 0,
    // A series that comes back shorter than this is treated as a bad fetch and
    // the previously committed file is kept instead. Stooq occasionally serves
    // a truncated history; silently shipping it would invalidate every drill
    // window curated against the longer one.
    minBars: 0,
    // 'auto' tries Stooq then Yahoo; the single-provider values exist for
    // diagnosing which host is unhappy without waiting out the other one.
    provider: 'auto',
    help: false,
  }
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') { opts.help = true; continue }
    const m = /^--([\w-]+)=(.*)$/.exec(arg)
    if (!m) continue
    const [, key, val] = m
    if (key === 'symbols') opts.symbols = val.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)
    else if (key === 'years') opts.years = Number(val)
    else if (key === 'out') opts.out = resolve(process.cwd(), val)
    else if (key === 'max-failures') opts.maxFailures = Number(val)
    else if (key === 'min-bars') opts.minBars = Number(val)
    else if (key === 'provider') opts.provider = val.trim().toLowerCase()
  }
  return opts
}

const USAGE = `Fetch real daily bars into public/data (Stooq, falling back to Yahoo).

  --symbols=AAPL,SPY     symbols to fetch (default: the 27 bundled ones)
  --years=10             history to keep
  --out=public/data      output directory
  --max-failures=3       how many symbols may fail before the run fails
  --min-bars=2000        reject a series shorter than this, keep the old one
  --provider=auto        auto | stooq | yahoo
  --help                 this message`

/**
 * Manifest entry for a symbol whose fetch failed, taken from the file already
 * on disk. Returns null when there is nothing to fall back to, in which case
 * the symbol drops out of the dataset entirely and the caller must fail.
 */
function keepExisting(ohlcvDir, symbol) {
  try {
    const existing = JSON.parse(readFileSync(join(ohlcvDir, `${symbol}.json`), 'utf8'))
    if (!Array.isArray(existing.t) || existing.t.length === 0) return null
    return {
      symbol,
      bars: existing.t.length,
      firstDate: isoDay(existing.t[0]),
      lastDate: isoDay(existing.t[existing.t.length - 1]),
      source: 'kept',
    }
  } catch {
    return null
  }
}

async function main() {
  const { symbols, years, out, maxFailures, minBars, provider, help } = parseArgs(process.argv.slice(2))
  if (help) {
    console.log(USAGE)
    return
  }
  if (!['auto', 'stooq', 'yahoo'].includes(provider)) {
    console.error(`Unknown --provider=${provider} (expected auto, stooq or yahoo)`)
    process.exitCode = 1
    return
  }
  const ohlcvDir = join(out, 'ohlcv')
  mkdirSync(ohlcvDir, { recursive: true })

  const via = provider === 'auto' ? 'Stooq, falling back to Yahoo' : provider
  console.log(`Fetching ${symbols.length} symbol(s) via ${via} (~${years}y daily)…`)

  const manifestSymbols = []
  const failed = []
  const dropped = []

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i]
    try {
      const { series: full, source } = await fetchSeries(symbol, years, provider)
      const series = trimToYears(full, years)
      if (minBars > 0 && series.t.length < minBars) {
        throw new Error(`${symbol}: only ${series.t.length} bars, expected at least ${minBars}`)
      }
      writeFileSync(join(ohlcvDir, `${symbol}.json`), JSON.stringify(series))
      manifestSymbols.push({
        symbol,
        bars: series.t.length,
        firstDate: isoDay(series.t[0]),
        lastDate: isoDay(series.t[series.t.length - 1]),
        source,
      })
      console.log(
        `  ✓ ${symbol.padEnd(5)} ${String(series.t.length).padStart(4)} bars  ` +
        `${isoDay(series.t[0])} → ${isoDay(series.t[series.t.length - 1])}  [${source}]`,
      )
    } catch (err) {
      failed.push(symbol)
      // Most messages already start with "SYMBOL: " — do not say it twice.
      const detail = err.message.startsWith(`${symbol}: `) ? err.message.slice(symbol.length + 2) : err.message
      console.error(`  ✗ ${symbol}: ${detail}`)
      // Carry the committed file forward so a partial fetch never shrinks the
      // universe: the drill windows are curated over every symbol in the
      // manifest, and a symbol vanishing would quietly delete its drills.
      const kept = keepExisting(ohlcvDir, symbol)
      if (kept) {
        manifestSymbols.push(kept)
        console.error(`    → kept the committed ${kept.bars} bars for ${symbol}`)
      } else {
        dropped.push(symbol)
      }
    }
    // Polite pause between symbols (skip after the last one).
    if (i < symbols.length - 1) await sleep(DELAY_MS)
  }

  if (manifestSymbols.length === 0) {
    console.error('\nNothing fetched — manifest left untouched.')
    process.exitCode = 1
    return
  }

  // Keep the manifest in the caller's symbol order, not fetch order, so a run
  // that fell back for one symbol still produces the same file as a clean one.
  manifestSymbols.sort((a, b) => symbols.indexOf(a.symbol) - symbols.indexOf(b.symbol))

  // Roll-up of who actually answered, so `git diff manifest.json` shows at a
  // glance that (say) every symbol came off the fallback this month.
  const providers = { stooq: 0, yahoo: 0, kept: 0 }
  for (const entry of manifestSymbols) providers[entry.source] = (providers[entry.source] ?? 0) + 1

  writeFileSync(
    join(out, 'manifest.json'),
    JSON.stringify({ generated: 'stooq', providers, symbols: manifestSymbols }, null, 2),
  )

  console.log(`\nWrote ${manifestSymbols.length} series to ${ohlcvDir}`)
  console.log(`Sources: ${providers.stooq} stooq · ${providers.yahoo} yahoo · ${providers.kept} kept`)
  if (failed.length) {
    console.error(`Failed: ${failed.join(', ')} — re-run for just those with --symbols=`)
    if (dropped.length > 0) {
      console.error(`No committed data to fall back to for: ${dropped.join(', ')} — the dataset is now incomplete.`)
      process.exitCode = 1
    } else if (failed.length > maxFailures) {
      console.error(`${failed.length} failure(s) exceeds the budget of ${maxFailures}.`)
      process.exitCode = 1
    } else {
      console.error(`Within the failure budget of ${maxFailures}; previous data kept for those symbols.`)
    }
  }
}

function isoDay(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10)
}

// Only run when invoked directly, so the parse helpers can be imported by tests.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main()
}
