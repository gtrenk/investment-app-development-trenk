// ─── Derived views over the store ────────────────────────────────────────────
// Plain functions of state — deliberately not hooks, so screens can call them
// inside a single `useAppStore` subscription without extra re-renders.

import type { CardId, CardState, DayLog, Lesson, ProgressState, Unit } from '@core/types'
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
