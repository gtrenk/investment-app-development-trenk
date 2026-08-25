#!/usr/bin/env node
// ─── Synthetic OHLCV generator ───────────────────────────────────────────────
//
// Produces DETERMINISTIC, SEEDED synthetic daily bars for the bundled chart
// drills in `public/data/ohlcv/{SYMBOL}.json`, plus `public/data/manifest.json`.
//
// Why synthetic? The real fetcher is `scripts/fetch-data.mjs` (Stooq), but it
// needs outbound network access to stooq.com. This generator lets the whole
// drill pipeline — content windows, tests, charts — be built and verified
// offline, and it is byte-for-byte reproducible: same seeds in, same files out.
//
// The goal is charts that *look* like real stock charts under a candlestick
// renderer, so the model is deliberately more than a plain random walk:
//
//   • regime switching     bull / sideways / bear / crash, 8–250 bars each,
//                          with a Markov transition table per symbol
//   • GARCH(1,1) variance  volatility clusters and persists; a violent week
//                          stays violent for a while afterwards
//   • jump/gap days        rare earnings-style overnight gaps (open ≠ prev close)
//   • log-target pull      a very weak mean-reversion toward a long-run growth
//                          path so a decade of compounding lands in a
//                          plausible price range instead of exploding
//   • per-symbol character TSLA/NVDA fast and violent, KO/PG sleepy,
//                          SPY/QQQ index-smooth (fewer gaps, tighter wicks)
//   • intraday structure   open gaps slightly off the previous close, wicks are
//                          exponential-ish multiples of that day's sigma
//   • volume               correlated with |return|, plus a slow multi-year
//                          drift in the base level
//
// Run:  node scripts/generate-data.mjs
//
// No dependencies beyond node builtins.

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'data')
const OHLCV_DIR = join(OUT_DIR, 'ohlcv')

/** Last bar lands on the last weekday on or before this date. */
const END_DATE = '2026-08-22'
/** ~10 years of trading days (252/yr × 10). */
const BARS = 2520

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

/** mulberry32 — small, fast, good enough, and identical across node versions. */
function mulberry32(seed) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Stable 32-bit string hash, so a symbol name alone fixes its stream. */
function hashSeed(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

/** Box–Muller, one draw per call (the spare is discarded — keeps it stateless). */
function gaussian(rnd) {
  let u = 0
  while (u === 0) u = rnd()
  const v = rnd()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** Exponential-ish positive draw with mean ≈ `scale`, clipped to avoid absurd wicks. */
function expDraw(rnd, scale) {
  let u = rnd()
  if (u > 0.999999) u = 0.999999
  return Math.min(-Math.log(1 - u) * scale, scale * 6)
}

/** Pick a key from a {key: weight} table. Weights need not sum to 1. */
function pickWeighted(rnd, table) {
  const keys = Object.keys(table)
  let total = 0
  for (const k of keys) total += table[k]
  let r = rnd() * total
  for (const k of keys) {
    r -= table[k]
    if (r <= 0) return k
  }
  return keys[keys.length - 1]
}

// ─── Calendar ────────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000

function toUtcDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function isoFromUtc(ms) {
  return new Date(ms).toISOString().slice(0, 10)
}

/**
 * Weekday timestamps (unix *seconds*, UTC midnight) ending on the last weekday
 * on or before END_DATE. Weekends are skipped; market holidays are not modelled
 * (they would only remove ~9 bars a year and add nothing to the drills).
 */
function tradingDays(count, endIso) {
  let ms = toUtcDate(endIso)
  // Walk back to a weekday if END_DATE lands on Sat/Sun.
  while (new Date(ms).getUTCDay() % 6 === 0) ms -= DAY_MS
  const out = []
  while (out.length < count) {
    const dow = new Date(ms).getUTCDay()
    if (dow !== 0 && dow !== 6) out.push(ms / 1000)
    ms -= DAY_MS
  }
  return out.reverse()
}

// ─── Market regimes ──────────────────────────────────────────────────────────

const REGIMES = {
  // driftAnn is an annualised log-drift *before* the symbol's drift scale.
  bull: { driftAnn: 0.34, volMult: 0.82, minLen: 55, maxLen: 250 },
  sideways: { driftAnn: 0.02, volMult: 0.66, minLen: 40, maxLen: 170 },
  bear: { driftAnn: -0.32, volMult: 1.5, minLen: 35, maxLen: 130 },
  crash: { driftAnn: -1.8, volMult: 2.7, minLen: 8, maxLen: 26 },
}

/** Markov transitions. No self-transitions — a regime always changes character. */
const TRANSITIONS = {
  bull: { sideways: 0.5, bear: 0.38, crash: 0.12 },
  sideways: { bull: 0.55, bear: 0.35, crash: 0.1 },
  bear: { bull: 0.42, sideways: 0.48, crash: 0.1 },
  crash: { bear: 0.3, sideways: 0.45, bull: 0.25 },
}

// ─── Symbol universe ─────────────────────────────────────────────────────────
//
// start / end are the endpoints of the long-run log-growth path the price is
// weakly pulled toward. Actual endpoints wander off these by tens of percent —
// that is the point — but they keep every symbol inside a believable range.
//
// vol      annualised baseline volatility
// volume   baseline average daily shares
// smooth   index-like: fewer gaps, tighter wicks, milder regimes

const SYMBOLS = [
  { symbol: 'AAPL', start: 26, end: 232, vol: 0.28, volume: 62e6 },
  { symbol: 'MSFT', start: 46, end: 425, vol: 0.26, volume: 27e6 },
  { symbol: 'NVDA', start: 4.6, end: 178, vol: 0.52, volume: 240e6 },
  { symbol: 'AMZN', start: 34, end: 214, vol: 0.34, volume: 48e6 },
  { symbol: 'GOOG', start: 36, end: 198, vol: 0.29, volume: 25e6 },
  { symbol: 'META', start: 94, end: 615, vol: 0.41, volume: 18e6 },
  { symbol: 'TSLA', start: 14, end: 325, vol: 0.58, volume: 96e6 },
  { symbol: 'JPM', start: 62, end: 278, vol: 0.28, volume: 11e6 },
  { symbol: 'BAC', start: 16, end: 47, vol: 0.31, volume: 42e6 },
  { symbol: 'XOM', start: 79, end: 116, vol: 0.3, volume: 18e6 },
  { symbol: 'CVX', start: 104, end: 156, vol: 0.28, volume: 9e6 },
  { symbol: 'JNJ', start: 101, end: 168, vol: 0.18, volume: 8e6 },
  // PFE is deliberately a decade-long decliner — the drill set needs downtrends.
  { symbol: 'PFE', start: 33, end: 24, vol: 0.25, volume: 34e6 },
  { symbol: 'UNH', start: 116, end: 298, vol: 0.27, volume: 4e6 },
  { symbol: 'WMT', start: 22, end: 96, vol: 0.21, volume: 20e6 },
  { symbol: 'COST', start: 132, end: 905, vol: 0.23, volume: 2.2e6 },
  { symbol: 'KO', start: 41, end: 71, vol: 0.16, volume: 15e6 },
  { symbol: 'PG', start: 76, end: 166, vol: 0.16, volume: 8e6 },
  { symbol: 'DIS', start: 102, end: 114, vol: 0.3, volume: 11e6 },
  { symbol: 'NFLX', start: 88, end: 705, vol: 0.45, volume: 6e6 },
  { symbol: 'BA', start: 131, end: 212, vol: 0.4, volume: 8e6 },
  { symbol: 'CAT', start: 82, end: 352, vol: 0.29, volume: 4e6 },
  { symbol: 'HD', start: 114, end: 398, vol: 0.25, volume: 4e6 },
  { symbol: 'V', start: 76, end: 342, vol: 0.24, volume: 8e6 },
  { symbol: 'MA', start: 92, end: 538, vol: 0.25, volume: 3e6 },
  { symbol: 'SPY', start: 196, end: 642, vol: 0.16, volume: 78e6, smooth: true },
  { symbol: 'QQQ', start: 101, end: 572, vol: 0.2, volume: 44e6, smooth: true },
]

// ─── GARCH(1,1) parameters ───────────────────────────────────────────────────
// var_t = omega + alpha·eps²_{t−1} + beta·var_{t−1}
// alpha + beta = 0.98 → strongly persistent volatility (real equities sit here).
const GARCH_ALPHA = 0.08
const GARCH_BETA = 0.9
// Pull toward the long-run log path. Deliberately *adaptive*: the linear term
// is weak enough that ordinary multi-month swings run their course untouched,
// while the quadratic term bites hard once the price is far off path — which
// keeps a decade of compounding inside a believable range without flattening
// the chart into a smooth exponential.
//   gap 0.15 → ~0.06%/day    gap 0.40 → ~0.33%/day    gap 0.80 → ~1.05%/day
const TARGET_PULL = 0.0035
const TARGET_PULL_Q = 0.012

// ─── Generation ──────────────────────────────────────────────────────────────

function generateSeries(cfg, times) {
  const n = times.length
  const rnd = mulberry32(hashSeed(cfg.symbol) ^ 0x9e3779b9)
  const smooth = cfg.smooth === true

  // Long-run log-price path the price is weakly pulled toward.
  const logStart = Math.log(cfg.start)
  const logEnd = Math.log(cfg.end)

  // Higher-vol names swing harder inside a regime too.
  const driftScale = Math.min(2.2, Math.max(0.55, cfg.vol / 0.27)) * (smooth ? 0.7 : 1)
  const gapProb = smooth ? 0.0022 : 0.0065
  const wickScale = smooth ? 0.5 : 0.75

  const o = new Array(n)
  const h = new Array(n)
  const l = new Array(n)
  const c = new Array(n)
  const v = new Array(n)

  // Regime state
  let regime = pickWeighted(rnd, { bull: 0.45, sideways: 0.35, bear: 0.2 })
  let regimeLeft = 0

  // GARCH state
  const targetVarFor = (mult) => Math.pow((cfg.vol * mult) / Math.sqrt(252), 2)
  let variance = targetVarFor(REGIMES[regime].volMult)
  let omega = variance * (1 - GARCH_ALPHA - GARCH_BETA)
  let prevEps = 0

  let prevClose = cfg.start
  // Slow multi-year wander in baseline volume (interest in a name ebbs and flows).
  const volPhase = rnd() * Math.PI * 2
  const volTrend = (rnd() - 0.5) * 0.8

  for (let i = 0; i < n; i++) {
    // ── regime switching ──
    if (regimeLeft <= 0) {
      if (i > 0) regime = pickWeighted(rnd, TRANSITIONS[regime])
      const R = REGIMES[regime]
      regimeLeft = Math.round(R.minLen + rnd() * (R.maxLen - R.minLen))
      // Retarget the GARCH long-run variance to the new regime.
      const tv = targetVarFor(R.volMult)
      omega = tv * (1 - GARCH_ALPHA - GARCH_BETA)
    }
    regimeLeft--

    const R = REGIMES[regime]

    // ── volatility (GARCH(1,1)) ──
    variance = omega + GARCH_ALPHA * prevEps * prevEps + GARCH_BETA * variance
    // Guard rails: never dead-flat, never absurd.
    const tv = targetVarFor(R.volMult)
    variance = Math.min(Math.max(variance, tv * 0.25), tv * 9)
    const sigma = Math.sqrt(variance)

    // ── drift: regime drift + weak pull toward the long-run log path ──
    const frac = n === 1 ? 0 : i / (n - 1)
    const logTarget = logStart + (logEnd - logStart) * frac
    const logGap = logTarget - Math.log(prevClose)
    const pull = TARGET_PULL * logGap + TARGET_PULL_Q * logGap * Math.abs(logGap)
    const mu = (R.driftAnn * driftScale) / 252 + pull

    // ── overnight gap ──
    let gap = 0.35 * sigma * gaussian(rnd)
    if (rnd() < gapProb) {
      // Earnings-style jump: 1.5–9%, biased toward the prevailing regime.
      const mag = Math.min(0.09, 0.015 + expDraw(rnd, 0.028))
      const towardRegime = R.driftAnn >= 0 ? 1 : -1
      const sign = rnd() < 0.62 ? towardRegime : -towardRegime
      gap += sign * mag
    }

    const open = prevClose * (1 + gap)

    // ── intraday move ──
    const z = gaussian(rnd)
    const eps = sigma * z
    const close = open * Math.exp(mu - 0.5 * variance + eps)
    prevEps = eps

    // ── wicks: exponential multiples of the day's sigma, in price terms ──
    const amp = sigma * open * (0.55 + 0.9 * rnd())
    const upper = amp * (0.15 + expDraw(rnd, wickScale))
    const lower = amp * (0.15 + expDraw(rnd, wickScale))

    let hi = Math.max(open, close) + upper
    let lo = Math.min(open, close) - lower
    if (lo < 0.05) lo = Math.min(open, close) * 0.9

    // ── volume: base level drifts over the decade, spikes with |return| ──
    const ret = Math.abs(close / prevClose - 1)
    const levelMult =
      (1 + volTrend * frac) * (1 + 0.22 * Math.sin(volPhase + frac * 7.5))
    const noise = 0.55 + 0.9 * rnd()
    const shares = cfg.volume * Math.max(0.25, levelMult) * noise * (1 + 9 * ret)

    o[i] = round2(open)
    c[i] = round2(close)
    h[i] = round2(hi)
    l[i] = round2(lo)
    v[i] = Math.max(1000, Math.round(shares))

    // Re-assert the OHLC invariants *after* rounding to cents.
    if (h[i] < Math.max(o[i], c[i])) h[i] = Math.max(o[i], c[i])
    if (l[i] > Math.min(o[i], c[i])) l[i] = Math.min(o[i], c[i])
    if (l[i] <= 0) l[i] = 0.01

    prevClose = c[i]
  }

  return { symbol: cfg.symbol, interval: '1d', t: times, o, h, l, c, v }
}

function round2(x) {
  return Math.round(x * 100) / 100
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validate(series) {
  const { symbol, t, o, h, l, c, v } = series
  const n = t.length
  const errs = []
  for (const [name, arr] of [['o', o], ['h', h], ['l', l], ['c', c], ['v', v]]) {
    if (arr.length !== n) errs.push(`${symbol}: ${name}.length ${arr.length} ≠ ${n}`)
  }
  for (let i = 0; i < n; i++) {
    if (!Number.isFinite(o[i]) || !Number.isFinite(h[i]) || !Number.isFinite(l[i]) || !Number.isFinite(c[i])) {
      errs.push(`${symbol}[${i}]: non-finite price`)
      break
    }
    if (o[i] <= 0 || h[i] <= 0 || l[i] <= 0 || c[i] <= 0) { errs.push(`${symbol}[${i}]: non-positive price`); break }
    if (h[i] < Math.max(o[i], c[i])) { errs.push(`${symbol}[${i}]: h < max(o,c)`); break }
    if (l[i] > Math.min(o[i], c[i])) { errs.push(`${symbol}[${i}]: l > min(o,c)`); break }
    if (h[i] < l[i]) { errs.push(`${symbol}[${i}]: h < l`); break }
    if (!Number.isInteger(v[i]) || v[i] <= 0) { errs.push(`${symbol}[${i}]: bad volume`); break }
    if (i > 0 && t[i] <= t[i - 1]) { errs.push(`${symbol}[${i}]: non-monotonic timestamp`); break }
  }
  return errs
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  mkdirSync(OHLCV_DIR, { recursive: true })
  const times = tradingDays(BARS, END_DATE)

  const manifestSymbols = []
  const allErrors = []
  let totalBytes = 0

  for (const cfg of SYMBOLS) {
    const series = generateSeries(cfg, times)
    const errs = validate(series)
    allErrors.push(...errs)

    const json = JSON.stringify(series)
    writeFileSync(join(OHLCV_DIR, `${cfg.symbol}.json`), json)
    totalBytes += json.length

    manifestSymbols.push({
      symbol: cfg.symbol,
      bars: series.t.length,
      firstDate: isoFromUtc(series.t[0] * 1000),
      lastDate: isoFromUtc(series.t[series.t.length - 1] * 1000),
    })

    const lo = Math.min(...series.l)
    const hi = Math.max(...series.h)
    console.log(
      `${cfg.symbol.padEnd(5)} ${series.t.length} bars  ` +
        `${series.c[0].toFixed(2)} → ${series.c[series.c.length - 1].toFixed(2)}  ` +
        `range ${lo.toFixed(2)}–${hi.toFixed(2)}  ${(json.length / 1024).toFixed(0)} KB`,
    )
  }

  const manifest = { generated: 'synthetic', symbols: manifestSymbols }
  writeFileSync(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))

  console.log(
    `\n${SYMBOLS.length} symbols · ${BARS} bars each · ` +
      `${(totalBytes / 1024 / 1024).toFixed(2)} MB total\n` +
      `${manifestSymbols[0].firstDate} → ${manifestSymbols[0].lastDate}`,
  )

  if (allErrors.length) {
    console.error(`\n${allErrors.length} validation error(s):`)
    for (const e of allErrors.slice(0, 20)) console.error('  ' + e)
    process.exitCode = 1
  } else {
    console.log('OHLC invariants OK for every bar.')
  }
}

main()
