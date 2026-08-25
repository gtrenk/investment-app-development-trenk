// ─── Shadow-SPY benchmark & equity snapshots ─────────────────────────────────
// "What if I had just bought the index on day one?" — the honest yardstick the
// Portfolio chart plots the paper account against.
//
// The benchmark is a single buy-and-hold position: at portfolio creation the
// starting cash is notionally converted into SPY units, and from then on the
// benchmark curve is just `units × SPY close`. No rebalancing, no dividends,
// no cash drag — same simplifications the paper account itself makes.
//
// Pure functions, no clock: `date`/`today` are always supplied by the caller.

import { addDays, daysBetween } from '@core/clock'
import type { EquitySnapshot, OhlcvSeries, PortfolioState } from '@core/types'
import { roundCents, roundTo, STARTING_CASH } from '@core/portfolio/engine'

/** ~2 trading years of daily points — enough for the chart, bounded for IDB. */
export const MAX_SNAPSHOTS = 730

/** Units are fractional by construction; 8 dp keeps them stable across saves. */
const UNITS_DP = 8

// ─── Benchmark position ──────────────────────────────────────────────────────

/**
 * Convert the starting cash into SPY units — once.
 *
 * Called on the first successful SPY quote after a portfolio is created. A
 * portfolio that already has `benchmarkUnits` is returned untouched, so a
 * later quote can never silently re-base the benchmark and erase the
 * comparison. An unusable price is also a no-op: the next quote will do it.
 */
export function initBenchmark(p: PortfolioState, spyPrice: number): PortfolioState {
  if (p.benchmarkUnits !== null) return p
  if (!Number.isFinite(spyPrice) || spyPrice <= 0) return p
  return { ...p, benchmarkUnits: roundTo(STARTING_CASH / spyPrice, UNITS_DP) }
}

/**
 * Value of the shadow index position at `spyPrice`, cent-rounded.
 * `null` when the benchmark was never initialised or the price is unusable —
 * the caller shows "—" rather than a misleading zero.
 */
export function benchmarkEquity(p: PortfolioState, spyPrice: number): number | null {
  if (p.benchmarkUnits === null) return null
  if (!Number.isFinite(spyPrice) || spyPrice <= 0) return null
  return roundCents(p.benchmarkUnits * spyPrice)
}

// ─── Snapshots ───────────────────────────────────────────────────────────────

function bySnapshotDate(a: EquitySnapshot, b: EquitySnapshot): number {
  return a.date < b.date ? -1 : a.date > b.date ? 1 : 0
}

/**
 * Record (or overwrite) one day's equity point.
 *
 * Exactly one snapshot exists per date — a second call on the same day wins,
 * so the stored point always reflects the most recent mark of that day. The
 * list is kept sorted ascending and capped at `MAX_SNAPSHOTS` by dropping the
 * oldest entries, which is what the chart wants to read directly.
 */
export function appendSnapshot(
  p: PortfolioState,
  date: string,
  equity: number,
  benchEquity: number,
): PortfolioState {
  const snap: EquitySnapshot = {
    date,
    equity: roundCents(equity),
    benchmarkEquity: roundCents(benchEquity),
  }
  const kept = p.snapshots.filter((s) => s.date !== date)
  kept.push(snap)
  kept.sort(bySnapshotDate)
  return { ...p, snapshots: kept.slice(Math.max(0, kept.length - MAX_SNAPSHOTS)) }
}

// ─── Backfill ────────────────────────────────────────────────────────────────

/** A bundled bar's UTC-midnight timestamp as a 'YYYY-MM-DD' date string. */
function utcDateStr(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10)
}

/** date → close, for every bar in a bundled series. */
export function closesByDate(series: OhlcvSeries): Map<string, number> {
  const out = new Map<string, number>()
  for (let i = 0; i < series.t.length; i++) {
    const px = series.c[i]
    if (Number.isFinite(px) && px > 0) out.set(utcDateStr(series.t[i]), px)
  }
  return out
}

export interface BackfillOptions {
  /** Last date to fill, inclusive. Defaults to the last bar in `spySeries`. */
  today?: string
  /** Known portfolio equity for specific dates; gaps carry the last value forward. */
  equityByDate?: Record<string, number>
}

/**
 * Fill in the days the app was not opened, so the equity chart is a continuous
 * line instead of a dotted scatter of the days Greg happened to log in.
 *
 * Walks forward one day at a time from the most recent existing snapshot to
 * `today`, emitting a point only for dates the SPY series actually has a close
 * for — which conveniently skips weekends and market holidays. The benchmark
 * leg is exact (`units × that day's close`); the portfolio leg is the last
 * known equity carried forward, overridden wherever `equityByDate` supplies a
 * real value.
 *
 * **Limitations — this is a chart cosmetic, not a reconstruction.**
 * - Carried-forward equity is flat: it ignores what the held positions actually
 *   did on those days, so a backfilled stretch understates both drawdowns and
 *   rallies. Only the endpoints (real marks) are trustworthy.
 * - It does not replay transactions, so trades made while offline are not
 *   reflected until the next real mark.
 * - Nothing is filled before the first snapshot; a portfolio with no snapshots
 *   and no `equityByDate` has no equity baseline and is returned unchanged, as
 *   is one whose benchmark was never initialised.
 * - Dates absent from `spySeries` are skipped, so a stale bundled file simply
 *   stops the fill early rather than inventing index levels.
 */
export function backfillSnapshots(
  p: PortfolioState,
  spySeries: OhlcvSeries,
  opts: BackfillOptions = {},
): PortfolioState {
  const units = p.benchmarkUnits
  if (units === null) return p

  const closes = closesByDate(spySeries)
  if (closes.size === 0) return p

  const equityByDate = opts.equityByDate ?? {}
  const lastBar = utcDateStr(spySeries.t[spySeries.t.length - 1])
  const today = opts.today ?? lastBar

  // Baseline: the newest real snapshot, else the earliest supplied equity.
  const sorted = [...p.snapshots].sort(bySnapshotDate)
  const last = sorted[sorted.length - 1]
  const seeded = Object.keys(equityByDate).sort()
  const startDate = last?.date ?? seeded[0]
  if (startDate === undefined) return p

  let equity = last ? last.equity : equityByDate[startDate]
  let out = p

  // A long absence would otherwise walk thousands of days only to have the cap
  // discard all but the tail. Start where the surviving window begins.
  const gap = daysBetween(startDate, today)
  const from = gap > MAX_SNAPSHOTS ? addDays(today, -MAX_SNAPSHOTS) : addDays(startDate, 1)

  for (let date = from; date <= today; date = addDays(date, 1)) {
    const supplied = equityByDate[date]
    if (Number.isFinite(supplied)) equity = supplied
    const close = closes.get(date)
    if (close === undefined) continue // weekend, holiday, or a gap in the file
    out = appendSnapshot(out, date, equity, units * close)
  }
  return out
}

// ─── Chart-ready series ──────────────────────────────────────────────────────

export interface PerformancePoint {
  date: string
  /** Portfolio equity as a percentage return from the first snapshot. */
  portfolioPct: number
  /** Benchmark equity as a percentage return from the first snapshot. */
  benchmarkPct: number
}

/**
 * Rebase both curves to 0% at the first snapshot — the only fair way to draw
 * them on one axis, and the form the "Beat the Street" badge tests against.
 * Returns [] when there is nothing to rebase from.
 */
export function performanceSeries(p: PortfolioState): PerformancePoint[] {
  const [first] = p.snapshots
  if (!first || !(first.equity > 0) || !(first.benchmarkEquity > 0)) return []
  return p.snapshots.map((s) => ({
    date: s.date,
    portfolioPct: roundTo((s.equity / first.equity - 1) * 100, 4),
    benchmarkPct: roundTo((s.benchmarkEquity / first.benchmarkEquity - 1) * 100, 4),
  }))
}
