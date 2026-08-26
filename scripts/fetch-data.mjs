#!/usr/bin/env node
// ─── Real market-data fetcher (Stooq) ────────────────────────────────────────
//
//   node scripts/fetch-data.mjs                 # all symbols, last ~10 years
//   node scripts/fetch-data.mjs --symbols=AAPL,SPY
//   node scripts/fetch-data.mjs --years=5
//   node scripts/fetch-data.mjs --out=public/data
//   node scripts/fetch-data.mjs --max-failures=3 --min-bars=2000   # CI guardrails
//
// ⚠ RUN THIS ON A NETWORK WITH ACCESS TO stooq.com.
//   The CI/agent sandbox this repo was built in has an egress proxy that
//   returns 403 for stooq.com and finance.yahoo.com, so this script has never
//   been executed end-to-end against the live endpoint. Everything except the
//   HTTP call is covered by `parseStooqCsv`, which is exported and unit-tested.
//   Until you run it, `public/data` holds the deterministic synthetic dataset
//   from `scripts/generate-data.mjs` (manifest.generated === 'synthetic').
//   After a successful run it holds real bars (manifest.generated === 'stooq').
//
// Stooq is keyless and free. Daily history endpoint:
//
//   https://stooq.com/q/d/l/?s=aapl.us&i=d
//
//   s=<ticker>.us   US listings need the `.us` suffix (lower-case)
//   i=d             daily interval
//
// Response is a CSV with a header row, oldest bar first:
//
//   Date,Open,High,Low,Close,Volume
//   2016-12-27,115.80,117.80,115.61,117.26,18296855
//
// Failure modes to expect (all are HTTP 200 with a text body, not error codes):
//   • "Exceeded the daily hits limit"  → rate limited; back off, retry tomorrow
//   • "No data"                        → bad/delisted ticker
//   • a bare header row                → same
//
// Output is byte-compatible with the synthetic generator: one columnar JSON
// per symbol in `public/data/ohlcv/{SYMBOL}.json` matching `OhlcvSeries`
// (src/core/types.ts), plus `public/data/manifest.json`.
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
/** Per-symbol attempts before giving up. */
const MAX_ATTEMPTS = 4
/** First backoff; doubles each retry (1.5s → 3s → 6s). */
const BACKOFF_MS = 1500
const TIMEOUT_MS = 20_000

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
 * Fetch one symbol's CSV, retrying on network errors, 5xx, and rate limits.
 * Exponential backoff; a 404 is treated as fatal (retrying a bad ticker is
 * just rude).
 */
async function fetchCsv(symbol) {
  const url = stooqUrl(symbol)
  let lastErr

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const ctl = new AbortController()
      const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS)
      let res
      try {
        res = await fetch(url, {
          signal: ctl.signal,
          headers: { 'User-Agent': 'tickerquest-data-fetch/1.0' },
        })
      } finally {
        clearTimeout(timer)
      }

      if (res.status === 404) throw new Error(`${symbol}: 404 — unknown ticker`)
      if (!res.ok) throw new Error(`${symbol}: HTTP ${res.status}`)

      const body = await res.text()
      // parseStooqCsv throws on rate-limit / "No data" bodies, which the
      // catch below turns into a retry.
      return parseStooqCsv(symbol, body)
    } catch (err) {
      lastErr = err
      if (/unknown ticker/.test(err.message)) throw err
      if (attempt === MAX_ATTEMPTS) break
      const wait = BACKOFF_MS * 2 ** (attempt - 1)
      console.warn(`  ${err.message} — retry ${attempt}/${MAX_ATTEMPTS - 1} in ${wait}ms`)
      await sleep(wait)
    }
  }
  throw lastErr
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
  }
  for (const arg of argv) {
    const m = /^--([\w-]+)=(.*)$/.exec(arg)
    if (!m) continue
    const [, key, val] = m
    if (key === 'symbols') opts.symbols = val.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)
    else if (key === 'years') opts.years = Number(val)
    else if (key === 'out') opts.out = resolve(process.cwd(), val)
    else if (key === 'max-failures') opts.maxFailures = Number(val)
    else if (key === 'min-bars') opts.minBars = Number(val)
  }
  return opts
}

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
    }
  } catch {
    return null
  }
}

async function main() {
  const { symbols, years, out, maxFailures, minBars } = parseArgs(process.argv.slice(2))
  const ohlcvDir = join(out, 'ohlcv')
  mkdirSync(ohlcvDir, { recursive: true })

  console.log(`Fetching ${symbols.length} symbol(s) from Stooq (~${years}y daily)…`)

  const manifestSymbols = []
  const failed = []
  const dropped = []

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i]
    try {
      const full = await fetchCsv(symbol)
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
      })
      console.log(`  ✓ ${symbol.padEnd(5)} ${series.t.length} bars  ${isoDay(series.t[0])} → ${isoDay(series.t[series.t.length - 1])}`)
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

  writeFileSync(
    join(out, 'manifest.json'),
    JSON.stringify({ generated: 'stooq', symbols: manifestSymbols }, null, 2),
  )

  console.log(`\nWrote ${manifestSymbols.length} series to ${ohlcvDir}`)
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
