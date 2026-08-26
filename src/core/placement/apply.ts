// ─── Turning an outcome into credit ──────────────────────────────────────────
// The arithmetic of "what does passing these units actually change?", kept pure
// so it can be tested without a browser, a store or a profile. The store action
// (`applyPlacement` in @state/useAppStore) is then only the write half: take
// this result, put the lessons in `progress`, put the XP through the normal
// award path, save the record.

import type { LessonId, Unit, UnitId } from '../types'
import { XP_PLACEMENT_UNIT } from '../gamification/xp'
import { mergePlacement } from './record'
import type { PlacementRecord } from './record'
import type { PlacementOutcome } from './engine'

export interface PlacementCredit {
  /** The record to persist — `passedUnits` is the union across every attempt. */
  record: PlacementRecord
  /** Units credited by *this* application. Empty on a replay or a no-op retake. */
  newlyPassed: UnitId[]
  /** Lessons to mark complete: those of the newly passed units, minus any already done. */
  lessonIds: LessonId[]
  /** Flat placement XP for this application. Zero when nothing is newly passed. */
  xp: number
}

/**
 * What applying `outcome` should change, given what the profile already has.
 *
 * IDEMPOTENCE lives here and nowhere else: `newlyPassed` is the outcome minus
 * the units the record already credits, so applying the same outcome twice
 * yields `{ newlyPassed: [], lessonIds: [], xp: 0 }` and the caller has nothing
 * to award. That covers a double-tapped button, a results screen reloaded, a
 * sync blob replayed, and a retake that passes the same units again.
 *
 * NO CARDS ARE MINTED and no per-lesson XP is computed — deliberately, and the
 * reasoning is in the store action. This function returns lessons and a flat
 * per-unit figure precisely so there is no path from here to `newCardState`.
 */
export function creditPlacement(args: {
  record: PlacementRecord
  outcome: PlacementOutcome
  units: Unit[]
  /** The profile's `progress.completedLessons` — only its keys are read. */
  completedLessons: Record<LessonId, string>
  today: string
}): PlacementCredit {
  const { record, newlyPassed } = mergePlacement(args.record, args.outcome, args.today)

  const lessonIds: LessonId[] = []
  for (const unitId of newlyPassed) {
    const unit = args.units.find((u) => u.id === unitId)
    if (!unit) continue
    for (const lesson of unit.lessons) {
      if (!args.completedLessons[lesson.id]) lessonIds.push(lesson.id)
    }
  }

  return { record, newlyPassed, lessonIds, xp: XP_PLACEMENT_UNIT * newlyPassed.length }
}
