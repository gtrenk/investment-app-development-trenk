// ─── The "Fix my weak spots" session ─────────────────────────────────────────
// What the /weakspots screen plays, as a plain list of steps.
//
// TWO KINDS OF STEP, AND ONLY TWO:
//
//   • `miss` — a quiz item from the bank, re-asked. This is the session's real
//     work: the learner answers it again, and getting it right retires it.
//   • `lapsed` — a *pointer* at cards of one unit that SM-2 keeps handing back.
//
// The second kind deliberately does no reviewing. Flashcards belong to the SRS,
// which owns their scheduling, their grading and their intervals; grading a
// card here would either double-schedule it or quietly bypass the algorithm
// that decides when it is next worth seeing. So the step says "these four cards
// in Unit 5 keep lapsing — they are in today's review queue" and links there.
// Surfacing beats duplicating.
//
// Pure: units and card states come in as arguments, nothing is imported from
// @content or the store.

import type { CardId, CardState, Unit, UnitId } from '@core/types'
import { XP_WEAKSPOT } from '@core/gamification/xp'
import { openMisses } from './bank'
import type { MissRecord, WeakSpotsState } from './bank'
import { lapsedCardIds } from './insight'

/**
 * Ceiling on a whole session. Twelve steps is four or five minutes at the pace
 * a re-ask actually takes (read the explanation, not just tap) — long enough to
 * make a dent, short enough that the learner finishes it.
 */
export const WEAKSPOT_SESSION_MAX = 12

/**
 * Most re-asked questions in one sitting. Leaves room for the lapsed-card
 * pointers so a session can never be twelve questions with no mention of the
 * unit whose cards are falling over.
 */
export const WEAKSPOT_MISS_MAX = 8

/** Open misses that make the Home row worth showing. Below this it is noise. */
export const WEAKSPOT_HOME_THRESHOLD = 3

export type WeakSpotStep =
  | { kind: 'miss'; record: MissRecord }
  | { kind: 'lapsed'; unitId: UnitId; title: string; cardIds: CardId[] }

export interface WeakSpotPlanInput {
  weakSpots: WeakSpotsState
  srs: Record<CardId, CardState>
  units: Unit[]
  today: string
}

/**
 * Today's session, in the order it is played: the questions first, the
 * lapsed-card pointers last.
 *
 * That order is the useful one. The questions are the part that changes state,
 * and ending on "…and Unit 5's cards need a review" hands the learner straight
 * on to the review queue instead of interrupting the drilling with a detour.
 *
 * `known` filters out items whose text is no longer in the curriculum — a
 * record can outlive the lesson that authored it, and a step with no question
 * to ask is not a step.
 */
export function buildWeakSpotPlan(input: WeakSpotPlanInput, known?: (itemId: string) => boolean): WeakSpotStep[] {
  const { weakSpots, srs, units, today } = input

  const misses = openMisses(weakSpots)
    .filter((m) => (known ? known(m.itemId) : true))
    .slice(0, WEAKSPOT_MISS_MAX)

  const steps: WeakSpotStep[] = misses.map((record) => ({ kind: 'miss' as const, record }))

  const room = Math.max(0, WEAKSPOT_SESSION_MAX - steps.length)
  if (room === 0) return steps

  const lapsed = [...units]
    .sort((a, b) => a.order - b.order)
    .map((unit) => ({ unit, cardIds: lapsedCardIds(srs, unit.id, today) }))
    .filter((row) => row.cardIds.length > 0)
    // Worst first: a unit with six lapsing cards earns its slot ahead of one
    // with two, and unit order breaks the tie so the list never jitters.
    .sort((a, b) => b.cardIds.length - a.cardIds.length)
    .slice(0, room)

  for (const row of lapsed) {
    steps.push({ kind: 'lapsed', unitId: row.unit.id, title: row.unit.title, cardIds: row.cardIds })
  }
  return steps
}

/** How many of the plan's steps are questions — what the progress copy counts. */
export function missStepCount(plan: WeakSpotStep[]): number {
  return plan.filter((s) => s.kind === 'miss').length
}

/**
 * XP for one resolved item, computed from the bank transition rather than from
 * the caller's belief about it.
 *
 * `resolveMiss` returns its input by reference when the item was unknown or
 * already resolved, so this pays out exactly once per item per time it is
 * fixed — a double-tapped Continue, a re-render, or a replayed action is free.
 */
export function resolveAward(before: WeakSpotsState, after: WeakSpotsState): number {
  return after === before ? 0 : XP_WEAKSPOT
}
