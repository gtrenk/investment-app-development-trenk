// ─── Derived views over the store ────────────────────────────────────────────
// Plain functions of state — deliberately not hooks, so screens can call them
// inside a single `useAppStore` subscription without extra re-renders.

import type {
  CardId,
  CardState,
  DayLog,
  DrillHistory,
  DrillKind,
  DrillResult,
  Lesson,
  PortfolioState,
  ProgressState,
  Transaction,
  Unit,
} from '@core/types'
import { addDays } from '@core/clock'
import { DRILL_ROTATION_3 } from '@core/drills/engine'
import { buildQueue, queueOptsForPace } from '@core/srs/scheduler'
import { lessonGoalFor } from '@core/gamification/streak'
import { DEFAULT_PACE } from '@core/settings'
import type { Pace } from '@core/settings'
import { positions, roundCents, roundTo } from '@core/portfolio/engine'
import type { PriceMap } from '@core/portfolio/engine'
import { benchmarkEquity } from '@core/portfolio/benchmark'
import { ALL_LESSONS, ALL_UNITS } from '@content/units'
// `AppState` is imported for its *type* only — erased at build time, so this
// module stays free of any runtime dependency on the store (and of the browser
// APIs the store's storage adapter reaches for at import time). That is what
// lets a plain Node unit test import these selectors, and @state/session with
// them.
import type { AppState } from './useAppStore'

/** Fraction (0–1) of a unit's lessons that are complete. */
export function unitProgress(unit: Unit, progress: ProgressState): number {
  if (unit.lessons.length === 0) return 0
  const done = unit.lessons.filter((l) => progress.completedLessons[l.id]).length
  return done / unit.lessons.length
}

export function unitLessonsDone(unit: Unit, progress: ProgressState): number {
  return unit.lessons.filter((l) => progress.completedLessons[l.id]).length
}

/** A unit opens once its prerequisite is 80% complete (plan rule). */
export const UNLOCK_THRESHOLD = 0.8

export function isUnitUnlocked(unit: Unit, progress: ProgressState): boolean {
  if (!unit.unlockAfter) return true
  const prev = ALL_UNITS.find((u) => u.id === unit.unlockAfter)
  if (!prev) return true
  return unitProgress(prev, progress) >= UNLOCK_THRESHOLD
}

/** The next lesson to study: first incomplete lesson in the first unlocked unit. */
export function nextLesson(progress: ProgressState): Lesson | undefined {
  return upcomingLessons(progress, 1)[0]
}

/**
 * The next `n` lessons to study, in the order a session would play them.
 *
 * Not simply "the first n incomplete lessons": finishing a lesson can push its
 * unit past the 80% mark and open the next one, so the walk carries a growing
 * set of pretend-completed ids and re-asks the unlock question at every step.
 * Otherwise a learner sitting on lesson 8 of 8 would be offered nothing for the
 * second half of a pace-2 day.
 */
export function upcomingLessons(progress: ProgressState, n: number): Lesson[] {
  if (n <= 0) return []
  const out: Lesson[] = []
  let seen: ProgressState = progress

  while (out.length < n) {
    let picked: Lesson | undefined
    for (const unit of ALL_UNITS) {
      if (!isUnitUnlocked(unit, seen)) continue
      picked = unit.lessons.find((l) => !seen.completedLessons[l.id])
      if (picked) break
    }
    if (!picked) break
    out.push(picked)
    seen = {
      ...seen,
      completedLessons: { ...seen.completedLessons, [picked.id]: 'planned' },
    }
  }
  return out
}

export function lessonsCompletedCount(progress: ProgressState): number {
  return Object.keys(progress.completedLessons).length
}

export const TOTAL_LESSONS = ALL_LESSONS.length

/** Authored lessons still to do. */
export function lessonsRemaining(progress: ProgressState): number {
  return Math.max(0, TOTAL_LESSONS - lessonsCompletedCount(progress))
}

/** How many lessons today's goal asks for, at this profile's pace. */
export function lessonGoalToday(progress: ProgressState, pace: Pace): number {
  return lessonGoalFor(pace, lessonsRemaining(progress))
}

/**
 * Today's SRS session, in the order the Review screen plays it.
 * The caps scale with pace — see `queueOptsForPace`.
 */
export function todayQueue(
  srs: Record<CardId, CardState>,
  today: string,
  pace: Pace = DEFAULT_PACE,
): CardId[] {
  const q = buildQueue(srs, today, queueOptsForPace(pace))
  return [...q.due, ...q.newCards]
}

/** A day nobody has touched yet. */
export function emptyDay(): DayLog {
  return { reviews: 0, lessons: 0, drills: 0, xp: 0, goalMet: false }
}

export function dayLogFor(state: Pick<AppState, 'game'>, today: string): DayLog {
  return state.game.dailyLog[today] ?? emptyDay()
}

// ── Drills ───────────────────────────────────────────────────────────────────

/** Every result recorded on `date` (normally 0 or 1 — one drill a day). */
export function drillResultsOn(history: DrillHistory, date: string): DrillResult[] {
  return history.results.filter((r) => r.date === date)
}

/**
 * Consecutive days ending today on which a drill was answered.
 *
 * Today not being done yet does not break the run — the streak is counted back
 * from yesterday in that case, so opening the app in the morning still shows
 * "3 days" rather than a demoralising 0.
 */
export function drillDayStreak(history: DrillHistory, today: string): number {
  const days = new Set(history.results.map((r) => r.date))
  if (days.size === 0) return 0
  let cursor = days.has(today) ? today : addDays(today, -1)
  let n = 0
  while (days.has(cursor)) {
    n++
    cursor = addDays(cursor, -1)
  }
  return n
}

export interface DrillKindTotals {
  kind: DrillKind
  answered: number
  correct: number
}

/**
 * Answered/correct counts per drill kind, in a stable order for the stats page.
 *
 * The list is the full rotation, not the kinds that happen to appear in the
 * history: a kind with no answers yet must still show as a row ("not played
 * yet"), or the section silently shrinks and the learner never learns the third
 * kind exists.
 */
export function drillTotalsByKind(history: DrillHistory): DrillKindTotals[] {
  const kinds: DrillKind[] = [...DRILL_ROTATION_3]
  return kinds.map((kind) => {
    const mine = history.results.filter((r) => r.kind === kind)
    return { kind, answered: mine.length, correct: mine.filter((r) => r.correct).length }
  })
}

/** How many answers carry a confidence — the calibration chart's sample size. */
export function confidenceSampleSize(history: DrillHistory): number {
  return history.results.filter((r) => r.confidence !== undefined).length
}

// ── Portfolio ────────────────────────────────────────────────────────────────

export interface PositionRow {
  symbol: string
  qty: number
  avgCost: number
  /** Mark used for the row — the quote, or the average cost when unpriced. */
  price: number
  marketValue: number
  unrealizedPnl: number
  /** Unrealized P&L as a percentage of the row's cost basis. */
  unrealizedPct: number
  /** Share of total equity this position represents. */
  weightPct: number
  /** True when no quote was available and the row is carried at cost. */
  unpriced: boolean
}

/**
 * One display row per open position, marked to `prices` and sorted biggest
 * first — the order a portfolio is actually read in.
 *
 * A symbol with no usable quote is carried at its own average cost (matching
 * `portfolioEquity`) and flagged `unpriced`, so the UI can say "at cost"
 * instead of showing a fabricated 0% day.
 */
export function positionRows(p: PortfolioState, prices: PriceMap, equity: number): PositionRow[] {
  const rows = positions(p).map((pos) => {
    const quoted = prices[pos.symbol]
    const unpriced = !(Number.isFinite(quoted) && quoted > 0)
    const price = unpriced ? pos.avgCost : quoted
    const marketValue = roundCents(pos.qty * price)
    const unrealizedPnl = roundCents(marketValue - pos.costValue)
    return {
      symbol: pos.symbol,
      qty: pos.qty,
      avgCost: pos.avgCost,
      price,
      marketValue,
      unrealizedPnl,
      unrealizedPct: pos.costValue > 0 ? roundTo((unrealizedPnl / pos.costValue) * 100, 2) : 0,
      weightPct: equity > 0 ? roundTo((marketValue / equity) * 100, 2) : 0,
      unpriced,
    }
  })
  return rows.sort((a, b) => b.marketValue - a.marketValue)
}

/** Newest transaction first — the order a history is read in. */
export function transactionsNewestFirst(p: PortfolioState): Transaction[] {
  return [...p.transactions].reverse()
}

/**
 * Today's move: the change in equity since the previous snapshot.
 * `null` until there are two points to compare — a portfolio opened today has
 * no yesterday, and inventing one would be a lie in the headline position.
 */
export function dayChange(p: PortfolioState, equity: number): { abs: number; pct: number } | null {
  if (p.snapshots.length < 2) return null
  const prev = p.snapshots[p.snapshots.length - 2]
  if (!(prev.equity > 0)) return null
  return {
    abs: roundCents(equity - prev.equity),
    pct: roundTo((equity / prev.equity - 1) * 100, 2),
  }
}

/**
 * How far ahead of (or behind) the shadow index the account is, in percentage
 * points of total return. `null` until the benchmark has been initialised and
 * SPY can be priced.
 */
export function vsBenchmarkPct(p: PortfolioState, equity: number, spyPrice: number): number | null {
  const bench = benchmarkEquity(p, spyPrice)
  if (bench === null || !(bench > 0)) return null
  const start = p.snapshots[0]?.equity ?? equity
  if (!(start > 0)) return null
  const benchStart = p.snapshots[0]?.benchmarkEquity ?? bench
  if (!(benchStart > 0)) return null
  return roundTo((equity / start - bench / benchStart) * 100, 2)
}
