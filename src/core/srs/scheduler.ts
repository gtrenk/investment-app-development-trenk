// ─── Daily review queue assembly ─────────────────────────────────────────────
// Pure function of (card states, today). Produces the two lists the Review
// screen consumes: cards that have come due, and brand-new cards to introduce.

import type { CardId, CardState } from '@core/types'
import type { Pace } from '@core/settings'

export const DEFAULT_DUE_CAP = 30
export const DEFAULT_NEW_CAP = 5

/**
 * Review ceiling per pace.
 *
 * At pace 3 the learner mints three lessons' worth of cards a day instead of
 * one, and SM-2 brings each of those back three or four times in its first
 * fortnight — so the steady-state due load grows with pace too. Leaving the cap
 * at 30 would quietly strand the overflow: the queue would never reach zero,
 * and "clear your review queue" would become an unreachable daily goal.
 *
 * It does not scale linearly, though. 90 cards is a chore, not a session, and
 * REVIEW_GOAL_CAP already lets 20 reviews satisfy the goal on a heavy day. 40
 * and 50 keep a hard day finite while still letting the backlog drain.
 */
export const DUE_CAP_BY_PACE: Record<Pace, number> = { 1: 30, 2: 40, 3: 50 }

/**
 * The caps today's queue should be built with at this pace. New cards scale
 * straight off pace (one lesson's worth each), reviews rise more gently.
 */
export function queueOptsForPace(pace: Pace): Required<QueueOpts> {
  return { dueCap: DUE_CAP_BY_PACE[pace] ?? DEFAULT_DUE_CAP, newCap: DEFAULT_NEW_CAP * pace }
}

export interface QueueOpts {
  /** Max already-seen cards to review today (default 30). */
  dueCap?: number
  /** Max never-seen cards to introduce today (default 5). */
  newCap?: number
}

export interface ReviewQueue {
  due: CardId[]
  newCards: CardId[]
}

/** A card nobody has ever graded — it belongs in the "new" bucket, not "due". */
export function isNew(s: CardState): boolean {
  return s.reps === 0 && s.lapses === 0 && s.lastGrade === undefined
}

/** Stable ordering helper: sort by `key`, breaking ties on cardId. */
function byKeyThenId(a: [string, CardId], b: [string, CardId]): number {
  if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1
  return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0
}

/**
 * Build today's queue.
 *
 * `due`: cards already in rotation whose due date has arrived (or passed),
 * oldest-due first so the most overdue material is cleared first, capped.
 *
 * `newCards`: cards never reviewed, introduced today or earlier, in the order
 * they were introduced, capped.
 *
 * The two lists are disjoint by construction: a never-reviewed card is only
 * ever a new card, even though its `due` date is already in the past.
 */
export function buildQueue(
  states: Record<CardId, CardState>,
  today: string,
  opts: QueueOpts = {},
): ReviewQueue {
  const dueCap = opts.dueCap ?? DEFAULT_DUE_CAP
  const newCap = opts.newCap ?? DEFAULT_NEW_CAP

  const dueKeyed: [string, CardId][] = []
  const newKeyed: [string, CardId][] = []

  for (const state of Object.values(states)) {
    if (isNew(state)) {
      if (state.introduced <= today) newKeyed.push([state.introduced, state.cardId])
    } else if (state.due <= today) {
      dueKeyed.push([state.due, state.cardId])
    }
  }

  dueKeyed.sort(byKeyThenId)
  newKeyed.sort(byKeyThenId)

  return {
    due: dueKeyed.slice(0, Math.max(0, dueCap)).map(([, id]) => id),
    newCards: newKeyed.slice(0, Math.max(0, newCap)).map(([, id]) => id),
  }
}
