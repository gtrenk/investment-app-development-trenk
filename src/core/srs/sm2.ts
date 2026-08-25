// ─── SM-2 spaced repetition ──────────────────────────────────────────────────
// Classic SuperMemo-2 transition function. Pure: no clock, no storage, no DOM.
// The caller supplies `today` (a local 'YYYY-MM-DD' string) so every review is
// reproducible in tests and portable to any platform.

import { addDays } from '@core/clock'
import type { CardId, CardState, Grade } from '@core/types'

/** Ease factor a brand-new card starts with. */
export const INITIAL_EASE = 2.5
/** Ease may never drop below this — SM-2's hard floor. */
export const MIN_EASE = 1.3
/** Interval (days) after the first successful rep. */
export const FIRST_INTERVAL = 1
/** Interval (days) after the second successful rep. */
export const SECOND_INTERVAL = 6
/** Extra multiplier applied when a card is graded Easy (q = 5). */
export const EASY_BONUS = 1.3

/** Round to 4 dp so persisted ease factors stay clean and float noise can't drift. */
function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000
}

/** A freshly minted card: never reviewed, due immediately. */
export function newCardState(cardId: CardId, today: string): CardState {
  return {
    cardId,
    ease: INITIAL_EASE,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
    due: today,
    introduced: today,
  }
}

/**
 * SM-2 ease update: EF' = EF + (0.1 − (5−q)(0.08 + (5−q)·0.02)), floored at 1.3.
 * q=5 → +0.10, q=4 → ±0, q=3 → −0.14.
 */
export function nextEase(ease: number, grade: Grade): number {
  const q = grade
  const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  return round4(Math.max(MIN_EASE, ease + delta))
}

/**
 * Apply a review grade to a card.
 *
 * Failure (q < 3, i.e. Again): the card lapses — reps reset to 0, interval back
 * to 1 day, lapse counter incremented, ease left untouched (Anki-style; the
 * repeated failures show up as lapses rather than ease collapse).
 *
 * Success (q >= 3): reps increments; the new interval is 1 day on the first
 * success, 6 days on the second, and `round(previousInterval × ease)` after
 * that — using the ease factor *before* this review's update, as in the
 * original SM-2 pseudocode. An Easy grade multiplies that by a further 1.3.
 */
export function applyGrade(state: CardState, grade: Grade, today: string): CardState {
  if (grade < 3) {
    return {
      ...state,
      reps: 0,
      lapses: state.lapses + 1,
      intervalDays: FIRST_INTERVAL,
      ease: state.ease, // unchanged on lapse
      due: addDays(today, FIRST_INTERVAL),
      lastGrade: grade,
    }
  }

  const reps = state.reps + 1
  let raw: number
  if (reps === 1) raw = FIRST_INTERVAL
  else if (reps === 2) raw = SECOND_INTERVAL
  else raw = state.intervalDays * state.ease

  if (grade === 5) raw *= EASY_BONUS

  const intervalDays = Math.max(1, Math.round(raw))

  return {
    ...state,
    reps,
    lapses: state.lapses,
    intervalDays,
    ease: nextEase(state.ease, grade),
    due: addDays(today, intervalDays),
    lastGrade: grade,
  }
}
