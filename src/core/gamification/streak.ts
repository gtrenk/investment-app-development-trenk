// ─── Daily streak state machine ──────────────────────────────────────────────
// The motivational backbone: a day "counts" only when the daily goal is met,
// and one missed day can be absorbed by a banked freeze.

import { daysBetween } from '@core/clock'
import type { DayLog, StreakState } from '@core/types'

/** Reviews that satisfy the goal outright, even if more cards are due. */
export const REVIEW_GOAL_CAP = 20
/** Consecutive kept days needed to earn one freeze. */
export const DAYS_PER_FREEZE = 7
/** Most freezes that can be banked at once. */
export const MAX_FREEZES = 2

/** A fresh streak: nothing done yet. */
export function newStreakState(): StreakState {
  return { current: 0, longest: 0, lastActiveDate: null, freezes: 0, daysTowardFreeze: 0 }
}

/**
 * Daily goal: clear the review queue (or grind 20 cards, whichever comes first)
 * AND do `lessonGoal` pieces of new work. Reviewing alone isn't enough — the
 * goal always includes learning something new or applying it.
 *
 * "Pieces of new work" is lessons plus *one* drill: there is only ever one
 * drill a day, so it counts once and a lesson counts for the rest. At the
 * default `lessonGoal` of 1 that is exactly the original rule — one lesson OR
 * one drill — which is why every call site that has no pace to hand can keep
 * omitting the argument. At pace 3 a day of two lessons and the drill still
 * lands the goal; three lessons and no drill does too.
 */
export function isGoalMet(day: DayLog, dueCount: number, lessonGoal = 1): boolean {
  const reviewsDone = day.reviews >= dueCount || day.reviews >= REVIEW_GOAL_CAP
  const activity = day.lessons + Math.min(day.drills, 1)
  return reviewsDone && activity >= Math.max(1, lessonGoal)
}

/**
 * How much new work today's goal asks for at this pace.
 *
 * Capped by what is left to study — the last day of the curriculum cannot ask
 * for three lessons when two remain — and floored at 1, so a learner who has
 * finished every authored lesson can still keep a streak alive with the drill.
 */
export function lessonGoalFor(pace: number, lessonsRemaining: number): number {
  return Math.max(1, Math.min(Math.round(pace), lessonsRemaining))
}

/**
 * Record that today's goal has just been met. Idempotent per day: calling it
 * again for the same `today` returns the state unchanged.
 *
 * - Yesterday active            → streak advances.
 * - Exactly one day missed,
 *   freeze banked               → freeze consumed, streak advances.
 * - Anything longer (or no
 *   freeze to spend)            → streak resets to 1.
 *
 * Every kept day ticks the freeze counter; each 7 kept days banks one freeze,
 * up to MAX_FREEZES. A break resets that counter along with the streak.
 */
export function recordGoalMet(streak: StreakState, today: string): StreakState {
  const last = streak.lastActiveDate

  if (last === today) return streak

  let current: number
  let freezes = streak.freezes
  let daysTowardFreeze = streak.daysTowardFreeze

  if (last === null) {
    // First day ever.
    current = 1
    daysTowardFreeze = 0
  } else {
    const gap = daysBetween(last, today)
    if (gap <= 0) return streak // clock skew / out-of-order call — ignore
    if (gap === 1) {
      current = streak.current + 1
    } else if (gap === 2 && freezes > 0) {
      freezes -= 1
      current = streak.current + 1
    } else {
      current = 1
      daysTowardFreeze = 0
    }
  }

  // Every day that kept or started the streak counts toward the next freeze.
  daysTowardFreeze += 1
  if (daysTowardFreeze >= DAYS_PER_FREEZE) {
    daysTowardFreeze = 0
    if (freezes < MAX_FREEZES) freezes += 1
  }

  return {
    current,
    longest: Math.max(streak.longest, current),
    lastActiveDate: today,
    freezes,
    daysTowardFreeze,
  }
}
