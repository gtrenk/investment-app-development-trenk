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
  ProgressState,
  Unit,
} from '@core/types'
import { addDays } from '@core/clock'
import { buildQueue } from '@core/srs/scheduler'
import { ALL_LESSONS, ALL_UNITS } from '@content/units'
import { emptyDay } from './useAppStore'
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
  for (const unit of ALL_UNITS) {
    if (!isUnitUnlocked(unit, progress)) continue
    const lesson = unit.lessons.find((l) => !progress.completedLessons[l.id])
    if (lesson) return lesson
  }
  return undefined
}

export function lessonsCompletedCount(progress: ProgressState): number {
  return Object.keys(progress.completedLessons).length
}

export const TOTAL_LESSONS = ALL_LESSONS.length

/** Today's SRS session, in the order the Review screen plays it. */
export function todayQueue(srs: Record<CardId, CardState>, today: string): CardId[] {
  const q = buildQueue(srs, today)
  return [...q.due, ...q.newCards]
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

/** Answered/correct counts per drill kind, in a stable order for the stats page. */
export function drillTotalsByKind(history: DrillHistory): DrillKindTotals[] {
  const kinds: DrillKind[] = ['pattern', 'whatnext']
  return kinds.map((kind) => {
    const mine = history.results.filter((r) => r.kind === kind)
    return { kind, answered: mine.length, correct: mine.filter((r) => r.correct).length }
  })
}

/** How many answers carry a confidence — the calibration chart's sample size. */
export function confidenceSampleSize(history: DrillHistory): number {
  return history.results.filter((r) => r.confidence !== undefined).length
}
