#!/usr/bin/env node
// ─── Drill-window curator ────────────────────────────────────────────────────
//
//   node scripts/curate-windows.mjs                    # curate public/data
//   node scripts/curate-windows.mjs --data=public/data --out=public/data/drills/windows.json
//   node scripts/curate-windows.mjs --report           # per-class yield table
//
// Reads whatever OHLCV sits in `<data>/ohlcv/*.json` (synthetic today, real
// Stooq bars after `.github/workflows/refresh-data.yml` runs) and writes the
// drill windows the app plays:
//
//   { version, source, generatedAt, patterns: [...], whatnext: [...] }
//
// WHY A SCRIPT AND NOT A HAND-WRITTEN LIST
// ----------------------------------------
// The windows are index ranges into a dataset that is about to start changing
// underneath them once a month. A hand-curated list would rot on the first
// refresh — every index would point at a different bar. So the *criteria* are
// committed here and the windows are re-derived from whatever data is present.
//
// HONESTY RULES THIS CURATOR ENFORCES
// -----------------------------------
//  1. Every detector is structural, never a regression line alone. The naive
//     "fit two converging trendlines" test labels any plain trend a wedge, so
//     triangles and wedges additionally demand envelope *containment*, three
//     real pivot touches on each line, and four alternations between the two —
//     a shape a learner can actually trace.
//  2. A window that satisfies two different pattern classes is thrown away, not
//     assigned to the higher score. An ambiguous chart has two defensible
//     answers and teaches nothing.
//  3. Classes that find no honest instance ship *empty*. They stay in
//     `PatternId` as distractors (ruling a rising wedge out still requires
//     knowing what one is) rather than being filled with noise.
//  4. What-next cutoffs are balanced exactly and every one clears the ±2%
//     classification band by at least another 1%, so the "right" answer is
//     never a rounding accident.
//
// Deterministic: the only randomness is a mulberry32 stream seeded from the
// data manifest, so the same bars always produce byte-identical output. The
// refresh workflow relies on that — a no-op refresh must produce no diff.
//
// VISUAL VERIFICATION
// -------------------
// Arithmetic satisfaction is not the same as a chart a learner can read, so the
// thresholds here were tuned against rendered candlesticks, not against counts:
//
//   node scripts/render-windows.mjs --n=15 --out=/tmp/shots
//   node scripts/render-windows.mjs --answer=rising-wedge --out=/tmp/shots
//
// Three rounds of that pass are why the detectors look the way they do — the
// window-spanning requirements on the extrema patterns, the major-fractal pivot
// set, the mandatory neckline break, and the traversal + range-contraction
// tests on the envelope family each exist because a specific rendered chart was
// unnameable. Re-run it after any threshold change, and after the first refresh
// against real bars.
//
// No dependencies beyond node builtins.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// ─── Tunables ────────────────────────────────────────────────────────────────

/** Candidate window spans (endIdx − startIdx). Spec allows 40…120 bars. */
export const WINDOW_SPANS = [48, 56, 64, 72, 84, 96, 108, 120]
/** Candidate start indices step by this many bars. */
const STRIDE = 4

/** How many pattern windows to ship, budget permitting. */
const PATTERN_TARGET = 80
/** Never more than this many windows of one pattern class. */
export const PATTERN_CLASS_CAP = 7
/** Never more than this many pattern windows on one symbol. */
export const PATTERN_SYMBOL_CAP = 5
/** Bars that must separate two selected windows on the same symbol. */
export const MIN_GAP = 40
/** A class with at most this many candidates is treated as scarce … */
const SCARCE_CANDIDATES = 60
/** … and gets this many picks before the round-robin starts competing. */
const SCARCE_RESERVE = 3

/** What-next: bars of lead-in required before a cutoff. */
export const WHATNEXT_MIN_LEADIN = 130
export const WHATNEXT_HORIZON = 10
/** Bars that must remain after the revealed horizon. */
export const WHATNEXT_TAIL = 5
/** Exactly this many of each outcome (up / flat / down). */
export const WHATNEXT_PER_OUTCOME = 20
/** The engine's ±2% band. */
const OUTCOME_BAND = 0.02
/** Directional picks must clear the band by this much more … */
export const WHATNEXT_MARGIN = 0.01
/** … and flat picks must sit at least this far inside it. */
export const WHATNEXT_FLAT_MAX = 0.01
/**
 * A flat still has to *move*. An exactly-unchanged close ten bars later is an
 * artifact of two-decimal prices, and the reveal would render it as a bare
 * "0.0%" with no direction at all — which reads like a bug, not like a flat.
 */
export const WHATNEXT_FLAT_MIN = 0.001
export const WHATNEXT_SYMBOL_CAP = 3
export const WHATNEXT_MIN_GAP = 60

/** Era buckets used for spreading windows across the decade. */
const ERA_BARS = 420

export const PATTERN_IDS = [
  'head-and-shoulders',
  'inverse-head-and-shoulders',
  'double-top',
  'double-bottom',
  'ascending-triangle',
  'descending-triangle',
  'symmetrical-triangle',
  'bull-flag',
  'bear-flag',
  'cup-and-handle',
  'rising-wedge',
  'falling-wedge',
  'breakout',
  'support-bounce',
  'uptrend',
  'downtrend',
  'consolidation',
]

/**
 * Plausible wrong answers per class — same family, differing in exactly the
 * feature that defines the right one. Three of the five are drawn per drill, so
 * the same pattern class does not always come with the same decoys.
 */
const CONFUSABLE = {
  uptrend: ['bull-flag', 'breakout', 'cup-and-handle', 'ascending-triangle', 'rising-wedge'],
  downtrend: ['bear-flag', 'descending-triangle', 'falling-wedge', 'head-and-shoulders', 'double-top'],
  consolidation: ['symmetrical-triangle', 'ascending-triangle', 'descending-triangle', 'support-bounce', 'breakout'],
  breakout: ['ascending-triangle', 'bull-flag', 'uptrend', 'cup-and-handle', 'consolidation'],
  'support-bounce': ['double-bottom', 'consolidation', 'descending-triangle', 'inverse-head-and-shoulders', 'downtrend'],
  'double-top': ['head-and-shoulders', 'rising-wedge', 'uptrend', 'consolidation', 'symmetrical-triangle'],
  'double-bottom': ['inverse-head-and-shoulders', 'support-bounce', 'falling-wedge', 'downtrend', 'cup-and-handle'],
  'head-and-shoulders': ['double-top', 'rising-wedge', 'uptrend', 'symmetrical-triangle', 'consolidation'],
  'inverse-head-and-shoulders': ['double-bottom', 'falling-wedge', 'support-bounce', 'downtrend', 'cup-and-handle'],
  'cup-and-handle': ['double-bottom', 'inverse-head-and-shoulders', 'uptrend', 'consolidation', 'bull-flag'],
  'bull-flag': ['uptrend', 'breakout', 'consolidation', 'rising-wedge', 'symmetrical-triangle'],
  'bear-flag': ['downtrend', 'falling-wedge', 'consolidation', 'symmetrical-triangle', 'descending-triangle'],
  'ascending-triangle': ['symmetrical-triangle', 'consolidation', 'breakout', 'bull-flag', 'rising-wedge'],
  'descending-triangle': ['symmetrical-triangle', 'consolidation', 'bear-flag', 'falling-wedge', 'downtrend'],
  'symmetrical-triangle': ['ascending-triangle', 'descending-triangle', 'consolidation', 'rising-wedge', 'falling-wedge'],
  // Note the asymmetry: 'uptrend' is a fair decoy for a bull flag (whose
  // defining feature is the tight pause) but NOT for a rising wedge, which
  // *is* an uptrend — one that is converging. Punishing a learner for saying
  // "uptrend" about a rising wedge would be scoring a technicality.
  'rising-wedge': ['bull-flag', 'symmetrical-triangle', 'ascending-triangle', 'double-top', 'consolidation'],
  'falling-wedge': ['bear-flag', 'symmetrical-triangle', 'descending-triangle', 'double-bottom', 'consolidation'],
}

// ─── Seeded PRNG (same generator as the data scripts) ────────────────────────

function mulberry32(seed) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

// ─── Small numeric helpers ───────────────────────────────────────────────────

const pct = (x, d = 1) => `${(x * 100).toFixed(d)}%`
const signedPct = (x, d = 1) => `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(d)}%`

function minOf(arr, s, e) {
  let m = Infinity
  for (let i = s; i <= e; i++) if (arr[i] < m) m = arr[i]
  return m
}
function maxOf(arr, s, e) {
  let m = -Infinity
  for (let i = s; i <= e; i++) if (arr[i] > m) m = arr[i]
  return m
}
function argMin(arr, s, e) {
  let m = Infinity
  let k = s
  for (let i = s; i <= e; i++) if (arr[i] < m) { m = arr[i]; k = i }
  return k
}
function argMax(arr, s, e) {
  let m = -Infinity
  let k = s
  for (let i = s; i <= e; i++) if (arr[i] > m) { m = arr[i]; k = i }
  return k
}
function mean(arr, s, e) {
  let sum = 0
  for (let i = s; i <= e; i++) sum += arr[i]
  return sum / (e - s + 1)
}

/** Deepest peak-to-trough fall in closes over the window, as a fraction. */
export function maxDrawdown(c, s, e) {
  let peak = c[s]
  let worst = 0
  for (let i = s; i <= e; i++) {
    if (c[i] > peak) peak = c[i]
    const dd = 1 - c[i] / peak
    if (dd > worst) worst = dd
  }
  return worst
}

/** Deepest trough-to-peak rise in closes — the mirror of `maxDrawdown`. */
export function maxRunup(c, s, e) {
  let trough = c[s]
  let best = 0
  for (let i = s; i <= e; i++) {
    if (c[i] < trough) trough = c[i]
    const ru = c[i] / trough - 1
    if (ru > best) best = ru
  }
  return best
}

/** Least-squares fit of log(close) against bar index. */
export function logFit(c, s, e) {
  const n = e - s + 1
  let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0
  for (let i = 0; i < n; i++) {
    const x = i
    const y = Math.log(c[s + i])
    sx += x; sy += y; sxx += x * x; sxy += x * y; syy += y * y
  }
  const denX = n * sxx - sx * sx
  const denY = n * syy - sy * sy
  const cov = n * sxy - sx * sy
  const slope = denX === 0 ? 0 : cov / denX
  const r2 = denX === 0 || denY === 0 ? 0 : (cov * cov) / (denX * denY)
  return { slope, r2 }
}

/** Least-squares line through (index, price) points, evaluated at any index. */
function fitLine(points) {
  const n = points.length
  let sx = 0, sy = 0, sxx = 0, sxy = 0
  for (const [x, y] of points) { sx += x; sy += y; sxx += x * x; sxy += x * y }
  const den = n * sxx - sx * sx
  const m = den === 0 ? 0 : (n * sxy - sx * sy) / den
  const b = (sy - m * sx) / n
  return { m, b, at: (x) => m * x + b }
}

// ─── Series context ──────────────────────────────────────────────────────────

/** Fractal pivots: `i` is a pivot high when no bar within ±k reaches higher. */
function pivotIndices(arr, k, kind) {
  const out = []
  for (let i = k; i < arr.length - k; i++) {
    let ok = true
    for (let j = i - k; j <= i + k; j++) {
      if (j === i) continue
      if (kind === 'high' ? arr[j] > arr[i] : arr[j] < arr[i]) { ok = false; break }
    }
    if (ok) out.push(i)
  }
  return out
}

const PIVOT_K = 3
/**
 * The extrema-geometry patterns (double top/bottom, head-and-shoulders) name
 * *major* turning points, so they use a wider fractal. With k=3 the detector
 * happily assembles three peaks out of a week of wiggles.
 */
const PIVOT_K_MAJOR = 5

export function makeContext(series) {
  const { symbol, o, h, l, c, v } = series
  const pivotHighs = pivotIndices(h, PIVOT_K, 'high')
  const pivotLows = pivotIndices(l, PIVOT_K, 'low')
  const majorHighs = pivotIndices(h, PIVOT_K_MAJOR, 'high')
  const majorLows = pivotIndices(l, PIVOT_K_MAJOR, 'low')
  return {
    symbol, o, h, l, c, v, n: c.length,
    pivotHighs, pivotLows,
    highsIn(s, e) { return pivotHighs.filter((i) => i >= s && i <= e) },
    lowsIn(s, e) { return pivotLows.filter((i) => i >= s && i <= e) },
    majorHighsIn(s, e) { return majorHighs.filter((i) => i >= s && i <= e) },
    majorLowsIn(s, e) { return majorLows.filter((i) => i >= s && i <= e) },
  }
}

// ─── Pattern detectors ───────────────────────────────────────────────────────
//
// Each takes (ctx, s, e) and returns null, or { score, facts }. `score` is a
// rough 0…1 quality used only to rank candidates against each other inside the
// same class — it never decides whether a window qualifies.

function detectUptrend(ctx, s, e) {
  const { c, h, l } = ctx
  const n = e - s + 1
  const ret = c[e] / c[s] - 1
  if (ret < 0.14) return null
  const { slope, r2 } = logFit(c, s, e)
  if (slope <= 0 || r2 < 0.78) return null
  const mdd = maxDrawdown(c, s, e)
  if (mdd > 0.13) return null

  // Monotone envelope: five segments, each making a higher high AND a higher
  // low than the one before it. This is what separates a trend from a drift.
  const K = 5
  let prevLo = -Infinity
  let prevHi = -Infinity
  for (let j = 0; j < K; j++) {
    const a = s + Math.floor((j * n) / K)
    const b = s + Math.floor(((j + 1) * n) / K) - 1
    const lo = minOf(l, a, b)
    const hi = maxOf(h, a, b)
    if (j > 0 && (lo < prevLo * 0.995 || hi < prevHi * 0.995)) return null
    prevLo = lo
    prevHi = hi
  }

  const lows = ctx.lowsIn(s + 2, e - 2)
  let higherLows = 0
  for (let i = 1; i < lows.length; i++) if (l[lows[i]] > l[lows[i - 1]]) higherLows++

  return {
    score: 0.5 * r2 + 0.3 * Math.min(1, ret / 0.45) + 0.2 * (1 - mdd / 0.13),
    facts: { ret, mdd, r2, higherLows, bars: n },
  }
}

function detectDowntrend(ctx, s, e) {
  const { c, h, l } = ctx
  const n = e - s + 1
  const ret = c[e] / c[s] - 1
  if (ret > -0.12) return null
  const { slope, r2 } = logFit(c, s, e)
  if (slope >= 0 || r2 < 0.78) return null
  const mru = maxRunup(c, s, e)
  if (mru > 0.13) return null

  const K = 5
  let prevLo = Infinity
  let prevHi = Infinity
  for (let j = 0; j < K; j++) {
    const a = s + Math.floor((j * n) / K)
    const b = s + Math.floor(((j + 1) * n) / K) - 1
    const lo = minOf(l, a, b)
    const hi = maxOf(h, a, b)
    if (j > 0 && (lo > prevLo * 1.005 || hi > prevHi * 1.005)) return null
    prevLo = lo
    prevHi = hi
  }

  const highs = ctx.highsIn(s + 2, e - 2)
  let lowerHighs = 0
  for (let i = 1; i < highs.length; i++) if (h[highs[i]] < h[highs[i - 1]]) lowerHighs++

  return {
    score: 0.5 * r2 + 0.3 * Math.min(1, -ret / 0.4) + 0.2 * (1 - mru / 0.13),
    facts: { ret, mru, r2, lowerHighs, bars: n },
  }
}

/** Collapse pivots closer than `gap` bars into a single visit to the edge. */
function visits(indices, gap) {
  const out = []
  for (const i of indices) if (out.length === 0 || i - out[out.length - 1] >= gap) out.push(i)
  return out
}

/** Shared range test used by both `consolidation` and a breakout's base. */
function rangeBase(ctx, s, e, { maxWidth, maxDrift, minCrossings, minVisits }) {
  const { c, h, l } = ctx
  const hi = maxOf(h, s, e)
  const lo = minOf(l, s, e)
  const mid = (hi + lo) / 2
  const width = (hi - lo) / mid
  if (width > maxWidth || width < 0.03) return null
  const drift = c[e] / c[s] - 1
  if (Math.abs(drift) > maxDrift) return null

  let crossings = 0
  for (let i = s + 1; i <= e; i++) if ((c[i] - mid) * (c[i - 1] - mid) < 0) crossings++
  if (crossings < minCrossings) return null

  const band = (hi - lo) * 0.25
  // Separate *visits* to each edge, not separate bars: one three-day spike is
  // one test of the level, however many pivots the fractal finds inside it.
  const upper = visits(ctx.highsIn(s + 1, e - 1).filter((i) => h[i] >= hi - band), 5)
  const lower = visits(ctx.lowsIn(s + 1, e - 1).filter((i) => l[i] <= lo + band), 5)
  if (upper.length < minVisits || lower.length < minVisits) return null
  // Touches have to be spread out, not clustered in one corner of the window.
  if (upper[upper.length - 1] - upper[0] < (e - s) * 0.35) return null
  if (lower[lower.length - 1] - lower[0] < (e - s) * 0.35) return null

  return { hi, lo, mid, width, drift, crossings, upper, lower }
}

function detectConsolidation(ctx, s, e) {
  const { c } = ctx
  const base = rangeBase(ctx, s, e, { maxWidth: 0.115, maxDrift: 0.05, minCrossings: 5, minVisits: 3 })
  if (!base) return null
  const { r2 } = logFit(c, s, e)
  if (r2 > 0.3) return null

  // The range has to sit still: the first and last quarters must be centred on
  // the same level, or this is a drifting channel dressed up as a box.
  const q = Math.floor((e - s + 1) / 4)
  const midFirst = (maxOf(ctx.h, s, s + q) + minOf(ctx.l, s, s + q)) / 2
  const midLast = (maxOf(ctx.h, e - q, e) + minOf(ctx.l, e - q, e)) / 2
  if (Math.abs(midFirst - midLast) / base.mid > 0.045) return null

  return {
    score: 0.4 * (1 - base.width / 0.115) + 0.35 * Math.min(1, base.crossings / 12) + 0.25 * (1 - r2 / 0.3),
    facts: {
      width: base.width,
      crossings: base.crossings,
      upperTouches: base.upper.length,
      lowerTouches: base.lower.length,
      hi: base.hi,
      lo: base.lo,
      bars: e - s + 1,
    },
  }
}

function detectBreakout(ctx, s, e) {
  const { c, v } = ctx
  const n = e - s + 1
  const baseEnd = s + Math.floor(n * 0.65)
  const base = rangeBase(ctx, s, baseEnd, { maxWidth: 0.14, maxDrift: 0.06, minCrossings: 4, minVisits: 2 })
  if (!base) return null

  let breakIdx = -1
  for (let i = baseEnd + 1; i <= e; i++) {
    if (c[i] > base.hi * 1.02) { breakIdx = i; break }
  }
  if (breakIdx < 0 || e - breakIdx < 4) return null

  let above = 0
  for (let i = breakIdx; i <= e; i++) if (c[i] > base.hi) above++
  if (above < 4) return null

  const escape = c[e] / base.hi - 1
  if (escape < 0.04) return null
  // The break must be the *first* time price left the box: no close above the
  // ceiling anywhere in the base, or this is the second leg of a move already
  // under way rather than a breakout.
  if (maxOf(c, s, baseEnd) > base.hi * 0.995) return null

  const volBase = mean(v, s, baseEnd)
  const volBreak = mean(v, breakIdx, Math.min(e, breakIdx + 9))
  if (!(volBase > 0) || volBreak < volBase * 1.15) return null

  return {
    score: 0.4 * Math.min(1, escape / 0.15) + 0.3 * Math.min(1, volBreak / volBase / 2) + 0.3 * (1 - base.width / 0.14),
    facts: {
      width: base.width,
      hi: base.hi,
      escape,
      volRatio: volBreak / volBase,
      baseBars: baseEnd - s + 1,
      bars: n,
    },
  }
}

function detectSupportBounce(ctx, s, e) {
  const { c, h, l } = ctx
  const n = e - s + 1
  // Three separated tests of one level need room; in 48 bars they are noise.
  if (n < 60) return null
  const hi = maxOf(h, s, e)
  const lo = minOf(l, s, e)
  const range = hi - lo
  if (range / lo < 0.06) return null

  const zoneTop = lo + range * 0.18
  const raw = ctx.lowsIn(s + 3, e - 8).filter((i) => l[i] <= zoneTop)
  // Collapse touches closer than 8 bars — one dip, not two.
  const touches = []
  for (const i of raw) {
    if (touches.length === 0 || i - touches[touches.length - 1] >= 8) touches.push(i)
    else if (l[i] < l[touches[touches.length - 1]]) touches[touches.length - 1] = i
  }
  if (touches.length < 3) return null
  // The level has to be defended across the whole window, not in one stretch.
  if (touches[0] > s + n * 0.4) return null
  if (touches[touches.length - 1] - touches[0] < n * 0.45) return null

  const lowsAt = touches.map((i) => l[i])
  const spread = (Math.max(...lowsAt) - Math.min(...lowsAt)) / Math.min(...lowsAt)
  if (spread > 0.03) return null

  let minRebound = Infinity
  for (const t of touches) {
    const upTo = Math.min(e, t + 15)
    const reb = maxOf(h, t, upTo) / l[t] - 1
    if (reb < 0.045) return null
    if (reb < minRebound) minRebound = reb
  }
  // The shelf has to still be holding at the right-hand edge.
  if (c[e] < zoneTop * 1.03) return null
  if (minOf(c, s, e) < Math.min(...lowsAt) * 0.995) return null

  return {
    score: 0.4 * Math.min(1, touches.length / 5) + 0.3 * (1 - spread / 0.03) + 0.3 * Math.min(1, minRebound / 0.12),
    facts: { touches: touches.length, level: Math.min(...lowsAt), minRebound, spread, bars: e - s + 1 },
  }
}

function detectDoubleTop(ctx, s, e) {
  const { c, h, l } = ctx
  const n = e - s + 1
  const peaks = ctx.majorHighsIn(s + 6, e - 8)
  if (peaks.length < 2) return null
  const windowHigh = maxOf(h, s, e)
  let best = null

  for (let a = 0; a < peaks.length; a++) {
    for (let b = a + 1; b < peaks.length; b++) {
      const p1 = peaks[a]
      const p2 = peaks[b]
      const gap = p2 - p1
      if (gap < 14 || gap > 65) continue
      // The two peaks and the decline off them have to *be* the window, not sit
      // inside a longer stretch of unrelated chop.
      if (p1 - s > n * 0.4 || e - p2 < n * 0.22 || gap < n * 0.25) continue
      const lower = Math.min(h[p1], h[p2])
      const higher = Math.max(h[p1], h[p2])
      if ((higher - lower) / lower > 0.03) continue
      if (higher < windowHigh * 0.995) continue
      // Exactly two peaks reach this level: a third makes it a range, not a top.
      if (ctx.highsIn(s + 1, e - 1).some((i) => i !== p1 && i !== p2 && h[i] > lower * 0.985)) continue

      const tIdx = argMin(l, p1 + 1, p2 - 1)
      const depth = 1 - l[tIdx] / lower
      if (depth < 0.06 || depth > 0.25) continue
      if (c[p1] / minOf(c, s, p1) - 1 < 0.06) continue

      const after = minOf(c, p2 + 1, e)
      const fall = 1 - after / lower
      if (fall < 0.07) continue
      const brokeNeck = after < l[tIdx]

      const score = 0.35 * (1 - (higher - lower) / lower / 0.03) + 0.3 * Math.min(1, depth / 0.18) +
        0.2 * Math.min(1, fall / 0.2) + (brokeNeck ? 0.15 : 0)
      if (!best || score > best.score) {
        best = {
          score,
          facts: {
            p1, p2, gap, level: higher, depth, fall, brokeNeck,
            peakGap: (higher - lower) / lower,
            neck: l[tIdx],
            bars: e - s + 1,
          },
        }
      }
    }
  }
  return best
}

function detectDoubleBottom(ctx, s, e) {
  const { c, h, l } = ctx
  const n = e - s + 1
  const troughs = ctx.majorLowsIn(s + 6, e - 8)
  if (troughs.length < 2) return null
  const windowLow = minOf(l, s, e)
  let best = null

  for (let a = 0; a < troughs.length; a++) {
    for (let b = a + 1; b < troughs.length; b++) {
      const p1 = troughs[a]
      const p2 = troughs[b]
      const gap = p2 - p1
      if (gap < 14 || gap > 65) continue
      if (p1 - s > n * 0.4 || e - p2 < n * 0.22 || gap < n * 0.25) continue
      const lower = Math.min(l[p1], l[p2])
      const higher = Math.max(l[p1], l[p2])
      if ((higher - lower) / lower > 0.03) continue
      if (lower > windowLow * 1.005) continue
      if (ctx.lowsIn(s + 1, e - 1).some((i) => i !== p1 && i !== p2 && l[i] < higher * 1.015)) continue

      const pIdx = argMax(h, p1 + 1, p2 - 1)
      const height = h[pIdx] / higher - 1
      if (height < 0.06 || height > 0.25) continue
      if (maxOf(c, s, p1) / c[p1] - 1 < 0.06) continue

      const after = maxOf(c, p2 + 1, e)
      const rise = after / higher - 1
      if (rise < 0.07) continue
      const brokeNeck = after > h[pIdx]

      const score = 0.35 * (1 - (higher - lower) / lower / 0.03) + 0.3 * Math.min(1, height / 0.18) +
        0.2 * Math.min(1, rise / 0.2) + (brokeNeck ? 0.15 : 0)
      if (!best || score > best.score) {
        best = {
          score,
          facts: {
            p1, p2, gap, level: lower, height, rise, brokeNeck,
            troughGap: (higher - lower) / lower,
            neck: h[pIdx],
            bars: e - s + 1,
          },
        }
      }
    }
  }
  return best
}

function detectHeadAndShoulders(ctx, s, e) {
  const { c, h, l } = ctx
  const n = e - s + 1
  const peaks = ctx.majorHighsIn(s + 5, e - 8)
  if (peaks.length < 3) return null
  const windowHigh = maxOf(h, s, e)
  let best = null

  for (let a = 0; a < peaks.length - 2; a++) {
    for (let b = a + 1; b < peaks.length - 1; b++) {
      for (let d = b + 1; d < peaks.length; d++) {
        const A = peaks[a], B = peaks[b], C = peaks[d]
        if (B - A < 8 || C - B < 8) continue
        // The three peaks must span the window: a shoulder-head-shoulder buried
        // in the middle of 110 bars of chop is chop, not a pattern.
        if (A - s > n * 0.32 || e - C < n * 0.15 || C - A < n * 0.45) continue
        if (h[B] < windowHigh * 0.999) continue
        if (h[B] < h[A] * 1.06 || h[B] < h[C] * 1.06) continue
        // A reversal needs something to reverse: the left shoulder has to be
        // the top of a real advance, not the high of a sideways patch.
        if (h[A] / minOf(l, s, A) - 1 < 0.06) continue
        const shoulderGap = Math.abs(h[A] - h[C]) / Math.min(h[A], h[C])
        if (shoulderGap > 0.06) continue
        // Nothing between the shoulders may stand taller than they do except
        // the head. Real necklines have a bounce or two under them; a *higher*
        // peak means the fractal picked three points out of a crowd.
        if (ctx.highsIn(A + 1, C - 1).some((i) => i !== B && h[i] > Math.max(h[A], h[C]) * 1.005)) continue

        const t1 = argMin(l, A + 1, B - 1)
        const t2 = argMin(l, B + 1, C - 1)
        const neckGap = Math.abs(l[t1] - l[t2]) / Math.min(l[t1], l[t2])
        if (neckGap > 0.05) continue
        if (1 - l[t1] / h[A] < 0.04 || 1 - l[t2] / h[C] < 0.04) continue
        if (c[A] / minOf(c, s, A) - 1 < 0.05) continue

        const neck = Math.min(l[t1], l[t2])
        const after = minOf(c, C + 1, e)
        if (after > h[C] * 0.94) continue
        // Confirmation is not optional here: an unbroken neckline leaves a
        // picture that is equally well described as "three peaks and some
        // chop". The window must end under the line.
        if (after >= neck) continue
        const brokeNeck = true

        const score = 0.3 * (1 - shoulderGap / 0.06) + 0.25 * (1 - neckGap / 0.05) +
          0.25 * Math.min(1, (h[B] / Math.max(h[A], h[C]) - 1) / 0.15) + (brokeNeck ? 0.2 : 0)
        if (!best || score > best.score) {
          best = {
            score,
            facts: { A, B, C, head: h[B], shoulderGap, neck, brokeNeck, drop: 1 - after / h[B], bars: e - s + 1 },
          }
        }
      }
    }
  }
  return best
}

function detectInverseHeadAndShoulders(ctx, s, e) {
  const { c, h, l } = ctx
  const n = e - s + 1
  const troughs = ctx.majorLowsIn(s + 5, e - 8)
  if (troughs.length < 3) return null
  const windowLow = minOf(l, s, e)
  let best = null

  for (let a = 0; a < troughs.length - 2; a++) {
    for (let b = a + 1; b < troughs.length - 1; b++) {
      for (let d = b + 1; d < troughs.length; d++) {
        const A = troughs[a], B = troughs[b], C = troughs[d]
        if (B - A < 8 || C - B < 8) continue
        if (A - s > n * 0.32 || e - C < n * 0.15 || C - A < n * 0.45) continue
        if (l[B] > windowLow * 1.001) continue
        if (l[B] > l[A] * 0.94 || l[B] > l[C] * 0.94) continue
        if (maxOf(h, s, A) / l[A] - 1 < 0.06) continue
        const shoulderGap = Math.abs(l[A] - l[C]) / Math.min(l[A], l[C])
        if (shoulderGap > 0.06) continue
        if (ctx.lowsIn(A + 1, C - 1).some((i) => i !== B && l[i] < Math.min(l[A], l[C]) * 0.995)) continue

        const t1 = argMax(h, A + 1, B - 1)
        const t2 = argMax(h, B + 1, C - 1)
        const neckGap = Math.abs(h[t1] - h[t2]) / Math.min(h[t1], h[t2])
        if (neckGap > 0.05) continue
        if (h[t1] / l[A] - 1 < 0.04 || h[t2] / l[C] - 1 < 0.04) continue
        if (maxOf(c, s, A) / c[A] - 1 < 0.05) continue

        const neck = Math.max(h[t1], h[t2])
        const after = maxOf(c, C + 1, e)
        if (after < l[C] * 1.06) continue
        if (after <= neck) continue
        const brokeNeck = true

        const score = 0.3 * (1 - shoulderGap / 0.06) + 0.25 * (1 - neckGap / 0.05) +
          0.25 * Math.min(1, (Math.min(l[A], l[C]) / l[B] - 1) / 0.15) + (brokeNeck ? 0.2 : 0)
        if (!best || score > best.score) {
          best = {
            score,
            facts: { A, B, C, head: l[B], shoulderGap, neck, brokeNeck, rise: after / l[B] - 1, bars: e - s + 1 },
          }
        }
      }
    }
  }
  return best
}

function detectCupAndHandle(ctx, s, e) {
  const { c, h, l } = ctx
  const n = e - s + 1
  // A cup is a base that takes *time*. Under ~80 bars the "cup" is a V and the
  // "handle" is three quiet days.
  if (n < 84) return null
  const rimScan = s + Math.floor(n * 0.15)
  const handleStart = s + Math.floor(n * 0.72)
  const handleBars = e - handleStart + 1
  if (handleBars < 8 || handleBars > 32) return null

  const leftRimIdx = argMax(h, s, rimScan)
  const rim = h[leftRimIdx]
  if (handleStart - leftRimIdx < 25) return null

  const botIdx = argMin(l, leftRimIdx + 3, handleStart - 3)
  const depth = 1 - l[botIdx] / rim
  if (depth < 0.12 || depth > 0.4) return null

  const relPos = (botIdx - leftRimIdx) / (handleStart - leftRimIdx)
  if (relPos < 0.3 || relPos > 0.7) return null

  const rightRimIdx = argMax(h, botIdx + 3, handleStart)
  const rightRim = h[rightRimIdx]
  if (rightRim / rim < 0.95 || rightRim / rim > 1.05) return null

  // Rounded, not a V: a real cup spends a quarter of its bars near the bottom.
  const floorLevel = rim * (1 - depth * 0.6)
  let deepBars = 0
  for (let i = leftRimIdx; i <= handleStart; i++) if (c[i] <= floorLevel) deepBars++
  const cupBars = handleStart - leftRimIdx + 1
  if (deepBars / cupBars < 0.3) return null

  const hHi = maxOf(h, handleStart, e)
  const hLo = minOf(l, handleStart, e)
  if (hHi > rightRim * 1.02) return null
  const pull = 1 - hLo / rightRim
  if (pull < 0.03 || pull > 0.12) return null
  if (hLo < rim * (1 - depth * 0.5)) return null
  // The window has to end *in* the handle — otherwise the drill is showing the
  // breakout, which is a different question.
  if (c[e] > rightRim * 0.985) return null

  return {
    score: 0.35 * (1 - Math.abs(relPos - 0.5) / 0.2) + 0.3 * Math.min(1, deepBars / cupBars / 0.5) +
      0.2 * (1 - Math.abs(rightRim / rim - 1) / 0.05) + 0.15 * (1 - Math.abs(pull - 0.06) / 0.07),
    facts: { rim, depth, handleBars, pull, cupBars, bars: n },
  }
}

function detectBullFlag(ctx, s, e) {
  const { c, h, l, v } = ctx
  const n = e - s + 1
  const poleScanEnd = s + Math.floor(n * 0.45)
  const poleEnd = argMax(c, s + 8, poleScanEnd)
  const gain = c[poleEnd] / c[s] - 1
  if (gain < 0.15) return null
  if (poleEnd - s > 30) return null
  if (maxDrawdown(c, s, poleEnd) > 0.06) return null

  const flagStart = poleEnd + 1
  const flagBars = e - flagStart + 1
  if (flagBars < 12 || flagBars > 45) return null

  const flagHi = maxOf(h, flagStart, e)
  const flagLo = minOf(l, flagStart, e)
  if (flagHi > c[poleEnd] * 1.03) return null
  const retrace = (c[poleEnd] - flagLo) / (c[poleEnd] - c[s])
  if (retrace > 0.5 || retrace < 0.05) return null
  const range = (flagHi - flagLo) / c[poleEnd]
  if (range > 0.09) return null
  const drift = c[e] / c[poleEnd] - 1
  if (drift > 0.02 || drift < -0.08) return null

  const volPole = mean(v, s, poleEnd)
  const volFlag = mean(v, flagStart, e)
  if (!(volPole > 0) || volFlag > volPole * 0.95) return null

  return {
    score: 0.35 * Math.min(1, gain / 0.35) + 0.3 * (1 - range / 0.09) + 0.2 * (1 - retrace / 0.5) +
      0.15 * (1 - volFlag / volPole),
    facts: { gain, poleBars: poleEnd - s + 1, flagBars, retrace, range, volRatio: volFlag / volPole, bars: n },
  }
}

function detectBearFlag(ctx, s, e) {
  const { c, h, l, v } = ctx
  const n = e - s + 1
  const poleScanEnd = s + Math.floor(n * 0.45)
  const poleEnd = argMin(c, s + 8, poleScanEnd)
  const drop = 1 - c[poleEnd] / c[s]
  if (drop < 0.13) return null
  if (poleEnd - s > 30) return null
  if (maxRunup(c, s, poleEnd) > 0.06) return null

  const flagStart = poleEnd + 1
  const flagBars = e - flagStart + 1
  if (flagBars < 12 || flagBars > 45) return null

  const flagHi = maxOf(h, flagStart, e)
  const flagLo = minOf(l, flagStart, e)
  if (flagLo < c[poleEnd] * 0.97) return null
  const retrace = (flagHi - c[poleEnd]) / (c[s] - c[poleEnd])
  if (retrace > 0.5 || retrace < 0.05) return null
  const range = (flagHi - flagLo) / c[poleEnd]
  if (range > 0.09) return null
  const drift = c[e] / c[poleEnd] - 1
  if (drift < -0.02 || drift > 0.08) return null

  const volPole = mean(v, s, poleEnd)
  const volFlag = mean(v, flagStart, e)
  if (!(volPole > 0) || volFlag > volPole * 0.95) return null

  return {
    score: 0.35 * Math.min(1, drop / 0.3) + 0.3 * (1 - range / 0.09) + 0.2 * (1 - retrace / 0.5) +
      0.15 * (1 - volFlag / volPole),
    facts: { drop, poleBars: poleEnd - s + 1, flagBars, retrace, range, volRatio: volFlag / volPole, bars: n },
  }
}

// ── Envelope family: triangles and wedges ────────────────────────────────────
//
// The trap here is that *any* trending series has a rising pivot-high line and
// a rising pivot-low line, and two least-squares lines through noise will
// happily converge. So a shape only counts when price is genuinely *contained*
// by the two lines, each line is touched at least three times by real fractal
// pivots spread across the window, and the touches alternate between the two
// lines at least four times — i.e. price is visibly bouncing between them.

const ENV_TOUCH_TOL = 0.012
const ENV_BREACH_TOL = 0.012
const ENV_MIN_TOUCHES = 3
const ENV_MIN_ALTERNATIONS = 5
/** Width at the right edge must be at most this fraction of the left edge. */
const ENV_CONVERGE = 0.5
/**
 * Traversal: in every third of the window price must come within this fraction
 * of the channel's width of BOTH boundaries. Without this a plain trend that
 * happens to sit inside two converging lines qualifies — the exact false
 * positive that left triangles and wedges unshipped in the hand-curated set.
 */
const ENV_TRAVERSE = 0.25
/**
 * Volatility really has to compress: the raw high-low range of the last third
 * must be at most this fraction of the first third's. Measured on price, not on
 * the fitted lines, because two extrapolated lines can "converge" over a window
 * whose swings are as wide at the end as at the start.
 */
const ENV_RANGE_CONTRACTION = 0.6

export function envelope(ctx, s, e) {
  const { h, l } = ctx
  const n = e - s + 1
  const ph = ctx.highsIn(s + 1, e - 1)
  const pl = ctx.lowsIn(s + 1, e - 1)
  if (ph.length < ENV_MIN_TOUCHES || pl.length < ENV_MIN_TOUCHES) return null

  const up = fitLine(ph.map((i) => [i, h[i]]))
  const dn = fitLine(pl.map((i) => [i, l[i]]))

  const w0 = up.at(s) - dn.at(s)
  const w1 = up.at(e) - dn.at(e)
  if (w0 <= 0 || w1 <= 0) return null
  if (w1 / w0 > ENV_CONVERGE) return null

  const third = Math.max(8, Math.floor(n / 3))
  const rangeFirst = maxOf(h, s, s + third - 1) - minOf(l, s, s + third - 1)
  const rangeLast = maxOf(h, e - third + 1, e) - minOf(l, e - third + 1, e)
  if (!(rangeFirst > 0) || rangeLast > rangeFirst * ENV_RANGE_CONTRACTION) return null

  let breaches = 0
  for (let i = s; i <= e; i++) {
    if (h[i] > up.at(i) * (1 + ENV_BREACH_TOL)) breaches++
    else if (l[i] < dn.at(i) * (1 - ENV_BREACH_TOL)) breaches++
  }
  if (breaches > n * 0.03) return null

  const tH = ph.filter((i) => Math.abs(h[i] - up.at(i)) / up.at(i) < ENV_TOUCH_TOL)
  const tL = pl.filter((i) => Math.abs(l[i] - dn.at(i)) / dn.at(i) < ENV_TOUCH_TOL)
  if (tH.length < ENV_MIN_TOUCHES || tL.length < ENV_MIN_TOUCHES) return null

  const touches = [...tH.map((i) => ({ i, k: 'H' })), ...tL.map((i) => ({ i, k: 'L' }))].sort((a, b) => a.i - b.i)
  // Touches must span the window, not cluster in one half.
  if (touches[0].i > s + n * 0.3) return null
  if (touches[touches.length - 1].i < e - n * 0.3) return null

  let alternations = 0
  for (let j = 1; j < touches.length; j++) if (touches[j].k !== touches[j - 1].k) alternations++
  if (alternations < ENV_MIN_ALTERNATIONS) return null

  // Traversal: price must work the full width of the channel in every third of
  // the window, not drift along one boundary while the other closes in on it.
  for (let t = 0; t < 3; t++) {
    const a = s + Math.floor((t * n) / 3)
    const b = s + Math.floor(((t + 1) * n) / 3) - 1
    let nearFloor = Infinity
    let nearCeiling = -Infinity
    for (let i = a; i <= b; i++) {
      const w = up.at(i) - dn.at(i)
      if (w <= 0) return null
      nearFloor = Math.min(nearFloor, (l[i] - dn.at(i)) / w)
      nearCeiling = Math.max(nearCeiling, (h[i] - dn.at(i)) / w)
    }
    if (nearFloor > ENV_TRAVERSE || nearCeiling < 1 - ENV_TRAVERSE) return null
  }

  const mid = (up.at(s) + dn.at(s)) / 2
  return {
    up, dn, w0, w1, breaches, alternations,
    touchesHigh: tH.length,
    touchesLow: tL.length,
    // Total movement of each line across the window, as a fraction of price.
    driftUp: (up.at(e) - up.at(s)) / mid,
    driftDn: (dn.at(e) - dn.at(s)) / mid,
    contraction: 1 - w1 / w0,
    mid,
  }
}

/** Flat means the line travels less than 2% of price across the whole window. */
const FLAT = 0.02
/** A sloping line has to travel at least this far to count as sloping. */
const SLOPED = 0.04

function envScore(env) {
  return 0.4 * Math.min(1, env.alternations / 8) + 0.3 * env.contraction +
    0.3 * Math.min(1, (env.touchesHigh + env.touchesLow) / 10)
}

function envFacts(env, ctx, s, e) {
  return {
    touchesHigh: env.touchesHigh,
    touchesLow: env.touchesLow,
    alternations: env.alternations,
    contraction: env.contraction,
    driftUp: env.driftUp,
    driftDn: env.driftDn,
    hi: maxOf(ctx.h, s, e),
    lo: minOf(ctx.l, s, e),
    bars: e - s + 1,
  }
}

function makeEnvDetector(test) {
  return (ctx, s, e) => {
    const env = envelope(ctx, s, e)
    if (!env || !test(env)) return null
    return { score: envScore(env), facts: envFacts(env, ctx, s, e) }
  }
}

const detectAscendingTriangle = makeEnvDetector(
  (env) => Math.abs(env.driftUp) < FLAT && env.driftDn > SLOPED,
)
const detectDescendingTriangle = makeEnvDetector(
  (env) => Math.abs(env.driftDn) < FLAT && env.driftUp < -SLOPED,
)
const detectSymmetricalTriangle = makeEnvDetector(
  (env) => env.driftUp < -SLOPED && env.driftDn > SLOPED,
)
const detectRisingWedge = makeEnvDetector(
  (env) => env.driftUp > SLOPED && env.driftDn > SLOPED && env.driftDn > env.driftUp,
)
const detectFallingWedge = makeEnvDetector(
  (env) => env.driftUp < -SLOPED && env.driftDn < -SLOPED && env.driftUp < env.driftDn,
)

const DETECTORS = {
  uptrend: detectUptrend,
  downtrend: detectDowntrend,
  consolidation: detectConsolidation,
  breakout: detectBreakout,
  'support-bounce': detectSupportBounce,
  'double-top': detectDoubleTop,
  'double-bottom': detectDoubleBottom,
  'head-and-shoulders': detectHeadAndShoulders,
  'inverse-head-and-shoulders': detectInverseHeadAndShoulders,
  'cup-and-handle': detectCupAndHandle,
  'bull-flag': detectBullFlag,
  'bear-flag': detectBearFlag,
  'ascending-triangle': detectAscendingTriangle,
  'descending-triangle': detectDescendingTriangle,
  'symmetrical-triangle': detectSymmetricalTriangle,
  'rising-wedge': detectRisingWedge,
  'falling-wedge': detectFallingWedge,
}

// ─── Explanations ────────────────────────────────────────────────────────────
//
// Every explain is a per-class teaching note (what names the shape, what it
// implies, what the usual failure is) with this window's measured numbers
// spliced in, so the learner reads about the chart in front of them.

const EXPLAIN = {
  uptrend: (f) => `Higher highs and higher lows, ${f.bars} bars of them: price closed ${signedPct(f.ret)} over the window and the deepest pullback along the way was only ${pct(f.mdd)} off the running peak. A line drawn under the lows is never broken — ${f.higherLows} of the pivot lows sit above the one before. That is the whole definition of an uptrend, and it is the context every other pattern gets read inside: the same triangle means something different in an uptrend than in a downtrend.`,
  downtrend: (f) => `Lower highs and lower lows across ${f.bars} bars: price closed ${signedPct(f.ret)} and the best rally inside the window only recovered ${pct(f.mru)} before rolling over again. ${f.lowerHighs} pivot highs came in under the one before. Downtrends are where beginners lose money buying "cheap" — the definition of a downtrend is that every level that looked cheap got cheaper.`,
  consolidation: (f) => `A box, not a pattern with a bias: the range is only ${pct(f.width)} wide, price crossed its midline ${f.crossings} times, and both edges were tested repeatedly (${f.upperTouches} touches of the ceiling, ${f.lowerTouches} of the floor). Nothing here predicts direction — a consolidation is the market storing energy, and the tradeable event is the break out of it, not the box itself.`,
  breakout: (f) => `The first ${f.baseBars} bars are a ${pct(f.width)}-wide box; then price closes clean through the ceiling and finishes ${pct(f.escape)} above it, on volume running ${f.volRatio.toFixed(1)}× the base's average. The volume is what separates a breakout from a fakeout: a real break needs new buyers, and their footprint is the volume spike. A break on quiet volume is the one that gets sold back into the range.`,
  'support-bounce': (f) => `Price came down to roughly the same shelf ${f.touches} times and turned up from it every time, the weakest bounce still worth ${pct(f.minRebound)}. The touches sit within ${pct(f.spread)} of each other, which is what makes it a level rather than a coincidence. Support is a zone, not a line — and it only counts once it has been tested more than twice.`,
  'double-top': (f) => `Two peaks ${f.gap} bars apart at within ${pct(f.peakGap, 2)} of the same price, separated by a trough ${pct(f.depth)} below them, and then a fall of ${pct(f.fall)}${f.brokeNeck ? ' that closed below the middle trough — the neckline break that confirms the pattern' : ' that has not yet closed below the middle trough, so the pattern is unconfirmed'}. Twice rejected at one price means the buyers who were willing to pay it are used up; the neckline is where that verdict becomes tradeable.`,
  'double-bottom': (f) => `Two troughs ${f.gap} bars apart within ${pct(f.troughGap, 2)} of each other, split by a rally ${pct(f.height)} high, then a ${pct(f.rise)} advance${f.brokeNeck ? ' that closed above that middle peak — the neckline break that confirms it' : ' that has not yet cleared the middle peak, so the pattern is unconfirmed'}. The second test failing to make a new low is the tell: sellers had their chance at that price and could not push through.`,
  'head-and-shoulders': (f) => `Three peaks: a shoulder, a higher head, then a second shoulder back at the first one's level (they match to ${pct(f.shoulderGap)}). The two troughs between them line up into a neckline, and price has since fallen ${pct(f.drop)} from the head${f.brokeNeck ? ', closing below that neckline — the confirmation' : ', though the neckline has not given way yet'}. It marks a failed attempt to keep making higher highs: the right shoulder is the rally that could not.`,
  'inverse-head-and-shoulders': (f) => `The bottoming mirror: a trough, a deeper head, then a second trough level with the first (within ${pct(f.shoulderGap)}), with a neckline across the two intervening peaks. Price has since risen ${pct(f.rise)} off the head${f.brokeNeck ? ' and closed above the neckline, confirming the pattern' : ', but has not yet closed above the neckline'}. The right shoulder failing to make a new low is the evidence that the selling is done.`,
  'cup-and-handle': (f) => `A rounded ${pct(f.depth)}-deep base spread over ${f.cupBars} bars — note how much time price spends near the bottom, which is what makes it a cup and not a V — recovering to the old rim, followed by a ${f.handleBars}-bar handle that drifts back only ${pct(f.pull)}. The shallow handle is the point: it shakes out the last impatient holders without undoing the repair work of the cup.`,
  'bull-flag': (f) => `A ${pct(f.gain)} pole in ${f.poleBars} bars, then ${f.flagBars} bars of tight drift: the whole flag is only ${pct(f.range)} wide, it gave back just ${pct(f.retrace)} of the pole, and volume in the flag ran at ${f.volRatio.toFixed(2)}× the pole's. Falling volume during the pause is the signature — nobody is selling, they are waiting. A drift that retraces more than half the pole is not a flag any more.`,
  'bear-flag': (f) => `A ${pct(f.drop)} drop in ${f.poleBars} bars, then ${f.flagBars} bars of narrow, slightly *upward* drift — only ${pct(f.range)} wide, recovering just ${pct(f.retrace)} of the fall, on ${f.volRatio.toFixed(2)}× the pole's volume. The upward tilt is what makes it a bear flag rather than a bottom: a real reversal comes with expanding volume, and this pause has none.`,
  'ascending-triangle': (f) => `A flat ceiling and a rising floor: ${f.touchesHigh} touches of the same resistance level and ${f.touchesLow} touches of a rising support line, alternating ${f.alternations} times, with the gap between them closing by ${pct(f.contraction)}. Buyers keep paying up while sellers hold one price — the shape is a coiled spring, usually resolving upward, but the flat side must be touched at least three times or it is just a range.`,
  'descending-triangle': (f) => `A flat floor and a falling ceiling: ${f.touchesLow} touches of one support level against ${f.touchesHigh} lower highs, alternating ${f.alternations} times, the range contracting ${pct(f.contraction)}. Each rally dies sooner while the same shelf is defended — pressure building on the floor, usually resolving downward. Watch the volume on the eventual break, not the shape.`,
  'symmetrical-triangle': (f) => `Lower highs and higher lows converging: ${f.touchesHigh} touches on the falling ceiling, ${f.touchesLow} on the rising floor, ${f.alternations} alternations between them, and ${pct(f.contraction)} of the range squeezed out. A symmetrical triangle is direction-neutral by construction — it says volatility is compressing, not which way it will release, so the trade is the break, never the anticipation.`,
  'rising-wedge': (f) => `Both boundaries rise, but the floor rises faster than the ceiling: the range has narrowed ${pct(f.contraction)} across ${f.touchesHigh} upper and ${f.touchesLow} lower touches, alternating ${f.alternations} times. That is the bearish part — buyers must pay ever higher prices for ever smaller gains. Do not confuse it with an uptrend: a wedge *converges*, and the price must actually be bouncing between both lines.`,
  'falling-wedge': (f) => `Both boundaries fall, but the ceiling falls faster than the floor, contracting the range ${pct(f.contraction)} over ${f.touchesHigh} upper and ${f.touchesLow} lower touches with ${f.alternations} alternations. Selling is losing momentum even as price slips — the classic bullish-reversal reading. The trap is calling every downtrend a falling wedge: without containment and repeated touches on both lines there is no wedge, just a decline.`,
}

// ─── Candidate generation ────────────────────────────────────────────────────

export function candidatesForSymbol(ctx) {
  const out = []
  const n = ctx.n
  for (const span of WINDOW_SPANS) {
    for (let s = 0; s + span < n; s += STRIDE) {
      const e = s + span
      let matched = null
      let ambiguous = false
      for (const id of PATTERN_IDS) {
        const hit = DETECTORS[id](ctx, s, e)
        if (!hit) continue
        if (matched) { ambiguous = true; break }
        matched = { id, ...hit }
      }
      // Rule 2: a chart with two defensible answers is not a drill.
      if (ambiguous || !matched) continue
      out.push({
        symbol: ctx.symbol,
        startIdx: s,
        endIdx: e,
        answer: matched.id,
        score: matched.score,
        facts: matched.facts,
      })
    }
  }
  return out
}

// ─── Selection ───────────────────────────────────────────────────────────────

const eraOf = (idx) => Math.floor(idx / ERA_BARS)

function selectPatterns(all, rng) {
  const byClass = new Map()
  for (const id of PATTERN_IDS) byClass.set(id, [])
  for (const cand of all) byClass.get(cand.answer).push(cand)
  for (const [, list] of byClass) {
    // Deterministic order: score desc, then a stable key.
    list.sort((a, b) => b.score - a.score || a.symbol.localeCompare(b.symbol) || a.startIdx - b.startIdx)
  }

  // Rare classes pick first, so a class with six honest instances is not
  // crowded out by one with six hundred.
  const order = [...PATTERN_IDS].sort(
    (a, b) => byClass.get(a).length - byClass.get(b).length || a.localeCompare(b),
  )

  const chosen = []
  const perClass = new Map(PATTERN_IDS.map((id) => [id, 0]))
  const perSymbol = new Map()
  const perEra = new Map()
  const usedBySymbol = new Map()

  const fits = (cand) => {
    if ((perSymbol.get(cand.symbol) ?? 0) >= PATTERN_SYMBOL_CAP) return false
    const taken = usedBySymbol.get(cand.symbol) ?? []
    for (const t of taken) {
      if (cand.startIdx <= t.endIdx + MIN_GAP && t.startIdx <= cand.endIdx + MIN_GAP) return false
    }
    return true
  }

  const takeBest = (id) => {
    const pool = byClass.get(id)
    let best = null
    let bestKey = -Infinity
    for (const cand of pool) {
      if (cand.taken || !fits(cand)) continue
      // Diversity bonuses: prefer an unused symbol and an under-filled era.
      const symPenalty = perSymbol.get(cand.symbol) ?? 0
      const eraCount = perEra.get(eraOf(cand.startIdx)) ?? 0
      const key = cand.score + 0.35 / (1 + symPenalty) + 0.3 / (1 + eraCount) + rng() * 1e-6
      if (key > bestKey) { bestKey = key; best = cand }
    }
    if (!best) return false

    best.taken = true
    chosen.push(best)
    perClass.set(id, perClass.get(id) + 1)
    perSymbol.set(best.symbol, (perSymbol.get(best.symbol) ?? 0) + 1)
    perEra.set(eraOf(best.startIdx), (perEra.get(eraOf(best.startIdx)) ?? 0) + 1)
    const taken = usedBySymbol.get(best.symbol) ?? []
    taken.push(best)
    usedBySymbol.set(best.symbol, taken)
    return true
  }

  // Scarce classes get first refusal. Without this a class with two honest
  // instances in the whole dataset can lose both to the min-gap rule after a
  // class with six thousand has already claimed those symbols' bars.
  for (const id of order) {
    if (byClass.get(id).length > SCARCE_CANDIDATES) continue
    for (let k = 0; k < SCARCE_RESERVE && perClass.get(id) < PATTERN_CLASS_CAP; k++) {
      if (!takeBest(id)) break
    }
  }

  let progress = true
  while (chosen.length < PATTERN_TARGET && progress) {
    progress = false
    for (const id of order) {
      if (chosen.length >= PATTERN_TARGET) break
      if (perClass.get(id) >= PATTERN_CLASS_CAP) continue
      if (takeBest(id)) progress = true
    }
  }

  chosen.sort((a, b) => a.symbol.localeCompare(b.symbol) || a.startIdx - b.startIdx)
  return chosen
}

function pickDistractors(answer, rng) {
  const pool = [...CONFUSABLE[answer]]
  // Fisher–Yates on a seeded stream — same drill id, same three decoys.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 3).sort()
}

// ─── What-next sampling ──────────────────────────────────────────────────────

const OUTCOMES = ['up', 'flat', 'down']

function whatnextCandidates(ctx) {
  const { c, n } = ctx
  const out = { up: [], flat: [], down: [] }
  const last = n - 1 - WHATNEXT_HORIZON - WHATNEXT_TAIL
  for (let cut = WHATNEXT_MIN_LEADIN; cut <= last; cut++) {
    const r = c[cut + WHATNEXT_HORIZON] / c[cut] - 1
    let outcome = null
    if (r >= OUTCOME_BAND + WHATNEXT_MARGIN) outcome = 'up'
    else if (r <= -(OUTCOME_BAND + WHATNEXT_MARGIN)) outcome = 'down'
    else if (Math.abs(r) <= WHATNEXT_FLAT_MAX && Math.abs(r) >= WHATNEXT_FLAT_MIN) outcome = 'flat'
    if (!outcome) continue
    out[outcome].push({ symbol: ctx.symbol, cutoffIdx: cut, r, outcome })
  }
  return out
}

function selectWhatnext(byOutcome, symbols, rng) {
  const chosen = []
  const perOutcome = { up: 0, flat: 0, down: 0 }
  const perSymbol = new Map()
  const perEra = new Map()
  const usedBySymbol = new Map()

  const fits = (cand) => {
    if ((perSymbol.get(cand.symbol) ?? 0) >= WHATNEXT_SYMBOL_CAP) return false
    for (const t of usedBySymbol.get(cand.symbol) ?? []) {
      if (Math.abs(t - cand.cutoffIdx) < WHATNEXT_MIN_GAP) return false
    }
    return true
  }

  const take = (cand) => {
    cand.taken = true
    chosen.push(cand)
    perOutcome[cand.outcome]++
    perSymbol.set(cand.symbol, (perSymbol.get(cand.symbol) ?? 0) + 1)
    perEra.set(eraOf(cand.cutoffIdx), (perEra.get(eraOf(cand.cutoffIdx)) ?? 0) + 1)
    const used = usedBySymbol.get(cand.symbol) ?? []
    used.push(cand.cutoffIdx)
    usedBySymbol.set(cand.symbol, used)
  }

  /** Best remaining candidate for one outcome, optionally pinned to a symbol. */
  const best = (outcome, symbol) => {
    let pick = null
    let bestKey = -Infinity
    for (const cand of byOutcome[outcome]) {
      if (cand.taken) continue
      if (symbol && cand.symbol !== symbol) continue
      if (!fits(cand)) continue
      const eraCount = perEra.get(eraOf(cand.cutoffIdx)) ?? 0
      const symCount = perSymbol.get(cand.symbol) ?? 0
      // Margin beyond the band is a mild plus — an unambiguous move is a better
      // teaching example — but spread matters more.
      const margin = cand.outcome === 'flat'
        ? (WHATNEXT_FLAT_MAX - Math.abs(cand.r)) / WHATNEXT_FLAT_MAX
        : Math.min(1, (Math.abs(cand.r) - OUTCOME_BAND - WHATNEXT_MARGIN) / 0.06)
      const key = 0.4 * margin + 1.2 / (1 + eraCount) + 0.8 / (1 + symCount) + rng() * 1e-6
      if (key > bestKey) { bestKey = key; pick = cand }
    }
    return pick
  }

  // Phase 1 — every symbol contributes at least one, cycling the outcome so the
  // three classes stay level while coverage is being established.
  for (const symbol of symbols) {
    let placed = false
    const ranked = [...OUTCOMES].sort((a, b) => perOutcome[a] - perOutcome[b] || OUTCOMES.indexOf(a) - OUTCOMES.indexOf(b))
    for (const outcome of ranked) {
      if (perOutcome[outcome] >= WHATNEXT_PER_OUTCOME) continue
      const cand = best(outcome, symbol)
      if (cand) { take(cand); placed = true; break }
    }
    if (!placed) {
      // Symbol has nothing left that fits — not fatal, the fill phase covers it.
    }
  }

  // Phase 2 — fill each outcome to exactly its quota.
  for (const outcome of OUTCOMES) {
    while (perOutcome[outcome] < WHATNEXT_PER_OUTCOME) {
      const cand = best(outcome)
      if (!cand) break
      take(cand)
    }
  }

  chosen.sort((a, b) => a.symbol.localeCompare(b.symbol) || a.cutoffIdx - b.cutoffIdx)
  return { chosen, perOutcome }
}

// ─── Main ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = { data: join(ROOT, 'public', 'data'), out: null, report: false }
  for (const arg of argv) {
    if (arg === '--report') { opts.report = true; continue }
    const m = /^--([\w-]+)=(.*)$/.exec(arg)
    if (!m) continue
    const [, key, val] = m
    if (key === 'data') opts.data = resolve(process.cwd(), val)
    else if (key === 'out') opts.out = resolve(process.cwd(), val)
  }
  if (!opts.out) opts.out = join(opts.data, 'drills', 'windows.json')
  return opts
}

/** ISO timestamp of the newest bar in the dataset — deterministic, no clock. */
function generatedAtFrom(manifest) {
  let latest = ''
  for (const s of manifest.symbols) if (s.lastDate > latest) latest = s.lastDate
  return `${latest}T00:00:00.000Z`
}

export function curate(dataDir) {
  const manifest = JSON.parse(readFileSync(join(dataDir, 'manifest.json'), 'utf8'))
  const symbols = manifest.symbols.map((s) => s.symbol)

  // One seed for the whole run, derived from the data itself: identical bars in,
  // identical windows out — which is what makes the refresh workflow's
  // "commit only if changed" check meaningful.
  const seed = hashSeed(`${manifest.generated}|${manifest.symbols.map((s) => `${s.symbol}:${s.bars}:${s.firstDate}:${s.lastDate}`).join(',')}`)

  const contexts = symbols.map((symbol) =>
    makeContext(JSON.parse(readFileSync(join(dataDir, 'ohlcv', `${symbol}.json`), 'utf8'))),
  )

  const allCandidates = []
  const wnByOutcome = { up: [], flat: [], down: [] }
  for (const ctx of contexts) {
    allCandidates.push(...candidatesForSymbol(ctx))
    const wn = whatnextCandidates(ctx)
    for (const o of OUTCOMES) wnByOutcome[o].push(...wn[o])
  }

  const patternRng = mulberry32(seed)
  const picked = selectPatterns(allCandidates, patternRng)

  const distractorRng = mulberry32(seed ^ 0x5bf03635)
  const patterns = picked.map((cand) => ({
    id: `pd-${cand.symbol.toLowerCase()}-${cand.startIdx}`,
    symbol: cand.symbol,
    startIdx: cand.startIdx,
    endIdx: cand.endIdx,
    answer: cand.answer,
    distractors: pickDistractors(cand.answer, distractorRng),
    explain: EXPLAIN[cand.answer](cand.facts),
  }))

  const wnRng = mulberry32(seed ^ 0x1b873593)
  const { chosen: wnChosen, perOutcome } = selectWhatnext(wnByOutcome, symbols, wnRng)
  const whatnext = wnChosen.map((cand) => ({
    id: `wn-${cand.symbol.toLowerCase()}-${cand.cutoffIdx}`,
    symbol: cand.symbol,
    cutoffIdx: cand.cutoffIdx,
    horizon: WHATNEXT_HORIZON,
  }))

  const doc = {
    version: 1,
    source: manifest.generated,
    generatedAt: generatedAtFrom(manifest),
    patterns,
    whatnext,
  }

  return { doc, allCandidates, picked, perOutcome, wnByOutcome }
}

function report(result) {
  const counts = new Map()
  const found = new Map()
  for (const id of PATTERN_IDS) { counts.set(id, 0); found.set(id, 0) }
  for (const c of result.allCandidates) found.set(c.answer, found.get(c.answer) + 1)
  for (const p of result.doc.patterns) counts.set(p.answer, counts.get(p.answer) + 1)

  console.log('\nPattern class            candidates   shipped')
  console.log('──────────────────────────────────────────────')
  for (const id of PATTERN_IDS) {
    console.log(`${id.padEnd(28)}${String(found.get(id)).padStart(6)}${String(counts.get(id)).padStart(10)}`)
  }
  console.log('──────────────────────────────────────────────')
  console.log(`${'TOTAL'.padEnd(28)}${String(result.allCandidates.length).padStart(6)}${String(result.doc.patterns.length).padStart(10)}`)

  const symbols = new Set(result.doc.patterns.map((p) => p.symbol))
  const eras = new Set(result.doc.patterns.map((p) => eraOf(p.startIdx)))
  console.log(`\nsymbols covered: ${symbols.size}   eras covered: ${eras.size}`)
  console.log(`what-next: ${result.doc.whatnext.length} (up ${result.perOutcome.up} / flat ${result.perOutcome.flat} / down ${result.perOutcome.down})`)
  const wnSymbols = new Set(result.doc.whatnext.map((w) => w.symbol))
  const wnEras = new Set(result.doc.whatnext.map((w) => eraOf(w.cutoffIdx)))
  console.log(`what-next symbols: ${wnSymbols.size}   eras: ${wnEras.size}`)
}

function main() {
  const { data, out, report: wantReport } = parseArgs(process.argv.slice(2))
  const started = Date.now()
  const result = curate(data)

  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, `${JSON.stringify(result.doc, null, 2)}\n`)

  console.log(
    `Curated ${result.doc.patterns.length} pattern windows and ${result.doc.whatnext.length} what-next cutoffs ` +
    `from ${result.doc.source} data → ${out} (${((Date.now() - started) / 1000).toFixed(1)}s)`,
  )
  if (wantReport) report(result)

  if (result.doc.patterns.length < 40) {
    console.error(`\nOnly ${result.doc.patterns.length} pattern windows — the detectors found too little to ship.`)
    process.exitCode = 1
  }
  for (const o of OUTCOMES) {
    if (result.perOutcome[o] !== WHATNEXT_PER_OUTCOME) {
      console.error(`\nwhat-next outcome '${o}' has ${result.perOutcome[o]}, expected exactly ${WHATNEXT_PER_OUTCOME}.`)
      process.exitCode = 1
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main()
}
