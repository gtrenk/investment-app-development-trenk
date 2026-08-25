// ─── Bundled-series helpers ──────────────────────────────────────────────────
// Pure functions over an already-loaded `OhlcvSeries`. Nothing here fetches:
// loading `public/data/ohlcv/*.json` is the UI/platform layer's job, so core
// stays portable (no fetch, no DOM, no fs).

import type { OhlcvSeries } from '@core/types'

/** Number of bars in a series (all six columns are the same length). */
export function seriesLength(series: OhlcvSeries): number {
  return series.t.length
}

/** True when `idx` addresses a real bar. */
export function isValidIndex(series: OhlcvSeries, idx: number): boolean {
  return Number.isInteger(idx) && idx >= 0 && idx < series.t.length
}

/** True when `[startIdx, endIdx]` is a non-empty, in-bounds, ordered window. */
export function isValidWindow(series: OhlcvSeries, startIdx: number, endIdx: number): boolean {
  return isValidIndex(series, startIdx) && isValidIndex(series, endIdx) && startIdx <= endIdx
}

/**
 * Inclusive window `[startIdx, endIdx]` as a fresh `OhlcvSeries`.
 * Throws on an out-of-bounds or inverted window — a bad drill definition should
 * fail loudly in a test, not render a blank chart.
 */
export function sliceSeries(series: OhlcvSeries, startIdx: number, endIdx: number): OhlcvSeries {
  if (!isValidWindow(series, startIdx, endIdx)) {
    throw new RangeError(
      `sliceSeries: window [${startIdx}, ${endIdx}] out of bounds for ${series.symbol} (${series.t.length} bars)`,
    )
  }
  const to = endIdx + 1
  return {
    symbol: series.symbol,
    interval: series.interval,
    t: series.t.slice(startIdx, to),
    o: series.o.slice(startIdx, to),
    h: series.h.slice(startIdx, to),
    l: series.l.slice(startIdx, to),
    c: series.c.slice(startIdx, to),
    v: series.v.slice(startIdx, to),
  }
}

/**
 * Fractional return from the close at `cutoffIdx` to the close `horizon` bars
 * later — the ground truth a what-next drill is scored against.
 * `0.043` means +4.3%.
 */
export function lastCloseReturn(series: OhlcvSeries, cutoffIdx: number, horizon: number): number {
  if (!Number.isInteger(horizon) || horizon <= 0) {
    throw new RangeError(`lastCloseReturn: horizon must be a positive integer, got ${horizon}`)
  }
  const target = cutoffIdx + horizon
  if (!isValidIndex(series, cutoffIdx) || !isValidIndex(series, target)) {
    throw new RangeError(
      `lastCloseReturn: ${cutoffIdx}+${horizon} out of bounds for ${series.symbol} (${series.t.length} bars)`,
    )
  }
  const from = series.c[cutoffIdx]
  if (!(from > 0)) throw new RangeError(`lastCloseReturn: non-positive close at ${cutoffIdx}`)
  return series.c[target] / from - 1
}

/**
 * Structural check on a loaded series: equal column lengths, finite positive
 * prices, `h >= max(o,c)`, `l <= min(o,c)`, non-negative volume and strictly
 * increasing timestamps. Returns human-readable problems ([] when clean).
 * Stops after the first bad bar — one broken bar means the file is suspect and
 * 2 500 near-identical messages help nobody.
 */
export function validateSeries(series: OhlcvSeries): string[] {
  const errs: string[] = []
  const { symbol, t, o, h, l, c, v } = series

  if (series.interval !== '1d') errs.push(`${symbol}: interval is '${series.interval}', expected '1d'`)
  const n = t.length
  if (n === 0) errs.push(`${symbol}: empty series`)

  const cols: Array<[string, number[]]> = [['o', o], ['h', h], ['l', l], ['c', c], ['v', v]]
  for (const [name, arr] of cols) {
    if (arr.length !== n) errs.push(`${symbol}: ${name}.length ${arr.length} !== t.length ${n}`)
  }
  if (errs.length > 0) return errs

  for (let i = 0; i < n; i++) {
    const bar = [o[i], h[i], l[i], c[i]]
    if (!bar.every((x) => Number.isFinite(x) && x > 0)) {
      errs.push(`${symbol}[${i}]: prices must be finite and positive`)
      break
    }
    if (h[i] < Math.max(o[i], c[i])) { errs.push(`${symbol}[${i}]: h < max(o, c)`); break }
    if (l[i] > Math.min(o[i], c[i])) { errs.push(`${symbol}[${i}]: l > min(o, c)`); break }
    if (!Number.isFinite(v[i]) || v[i] < 0) { errs.push(`${symbol}[${i}]: invalid volume`); break }
    if (i > 0 && t[i] <= t[i - 1]) { errs.push(`${symbol}[${i}]: timestamps not strictly increasing`); break }
  }
  return errs
}
