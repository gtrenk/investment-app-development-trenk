// ─── What a profile remembers about its placement test ───────────────────────
// Pure data + a defensive reader, same contract as @core/settings: a record
// written by a future build (or a half-cleared store) degrades to "never took
// it", never crashes a screen.

import type { UnitId } from '../types'
import type { PlacementOutcome } from './engine'

export interface PlacementRecord {
  /** Local date of the most recent applied placement; `null` = never taken. */
  takenAt: string | null
  /**
   * Every unit ever credited by a placement, as a union across retakes.
   *
   * This is the idempotence ledger, not a log: `applyPlacement` pays the flat
   * per-unit XP only for ids that are *not* already in here, so re-applying the
   * same outcome (a double tap, a replayed sync blob, a reload on the results
   * screen) is free.
   */
  passedUnits: UnitId[]
  /**
   * The learner dismissed the Home offer card. Sticky forever — an offer you
   * said no to must not come back tomorrow. The permanent entry point in the
   * profile panel is how it is found again.
   */
  offerDismissed: boolean
}

export function emptyPlacementRecord(): PlacementRecord {
  return { takenAt: null, passedUnits: [], offerDismissed: false }
}

export function sanitizePlacementRecord(raw: unknown): PlacementRecord {
  const base = emptyPlacementRecord()
  if (!raw || typeof raw !== 'object') return base
  const rec = raw as Partial<PlacementRecord>
  return {
    takenAt: typeof rec.takenAt === 'string' ? rec.takenAt : null,
    passedUnits: Array.isArray(rec.passedUnits)
      ? [...new Set(rec.passedUnits.filter((id): id is UnitId => typeof id === 'string'))]
      : [],
    offerDismissed: rec.offerDismissed === true,
  }
}

/**
 * Fold an outcome into the record.
 *
 * A retake can only ever ADD: the union below is what makes "pass Unit 2 on
 * the second attempt" open Unit 3 without a failed Unit 5 taking away the
 * lessons the first attempt credited. Nothing is ever un-completed — the
 * lessons are already marked studied, and taking that back would delete real
 * progress on the strength of one bad morning.
 */
export function mergePlacement(
  record: PlacementRecord,
  outcome: PlacementOutcome,
  today: string,
): { record: PlacementRecord; newlyPassed: UnitId[] } {
  const known = new Set(record.passedUnits)
  const newlyPassed = outcome.passedUnits.filter((id) => !known.has(id))
  return {
    record: {
      ...record,
      takenAt: today,
      passedUnits: [...record.passedUnits, ...newlyPassed],
    },
    newlyPassed,
  }
}
