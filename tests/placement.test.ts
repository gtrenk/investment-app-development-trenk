// ─── Placement test ──────────────────────────────────────────────────────────
// Three things are worth proving here, and they are the three things that would
// hurt a real learner if they broke:
//
//   • THE LADDER. Who gets tested on what, and where it stops. Table-driven,
//     because the interesting cases are whole score sequences, not single calls.
//   • THE SAMPLE. Same questions every time, drawn from different lessons,
//     biased away from the giveaway `-q1` items.
//   • THE CREDIT. Applying an outcome twice must never pay twice, and a retake
//     must never take anything away.

import { describe, expect, it } from 'vitest'
import { ALL_UNITS, getUnit } from '@content/units'
import { XP_PLACEMENT_UNIT } from '@core/gamification/xp'
import type { LessonId, Unit, UnitId } from '@core/types'
import {
  PLACEMENT_ITEMS_PER_UNIT,
  PLACEMENT_MAX_ORDER,
  PLACEMENT_PASS_MARK,
  buildPlacementPlan,
  carriedResults,
  newPlacementState,
  nextUnitToTest,
  placementAsked,
  placementOutcome,
  recordUnitResult,
  sampleUnitItems,
  samplePlacement,
  trackOf,
} from '@core/placement/engine'
import type { PlacementState } from '@core/placement/engine'
import { creditPlacement } from '@core/placement/apply'
import {
  emptyPlacementRecord,
  mergePlacement,
  sanitizePlacementRecord,
} from '@core/placement/record'

const PLAN = buildPlacementPlan(ALL_UNITS)

/**
 * Play a whole ladder from a score table.
 *
 * `scores` maps a unit id to what the learner got on it. A unit the ladder
 * reaches with no entry in the table is a test-authoring mistake, not a pass —
 * so it throws rather than silently scoring zero.
 */
function runLadder(scores: Record<UnitId, number>): PlacementState {
  let state = newPlacementState(PLAN)
  for (let guard = 0; guard < 50; guard++) {
    const unitId = nextUnitToTest(state)
    if (!unitId) return state
    const score = scores[unitId]
    if (score === undefined) throw new Error(`ladder reached untabulated unit ${unitId}`)
    state = recordUnitResult(state, unitId, score)
  }
  throw new Error('ladder did not terminate')
}

/** Every tested unit scored the same — the "total beginner"/"expert" shorthand. */
function allUnits(score: number): Record<UnitId, number> {
  return Object.fromEntries(PLAN.order.map((id) => [id, score]))
}

// ── The plan ─────────────────────────────────────────────────────────────────

describe('buildPlacementPlan', () => {
  it('reads the core, the two tracks and the untested tail out of the unlock graph', () => {
    expect(PLAN.core).toEqual(['u01', 'u02'])
    expect(PLAN.tracks.fundamental).toEqual(['u03', 'u04', 'u05', 'u06', 'u07'])
    expect(PLAN.tracks.technical).toEqual(['u08', 'u09', 'u10'])
    expect(PLAN.order).toEqual([
      'u01',
      'u02',
      'u03',
      'u04',
      'u05',
      'u06',
      'u07',
      'u08',
      'u09',
      'u10',
    ])
    // Synthesis and expert units are never tested — rule 3.
    expect(PLAN.alwaysStudied).toEqual(['u11', 'u12', 'u13', 'u14'])
  })

  it('covers exactly the units at or below PLACEMENT_MAX_ORDER', () => {
    for (const unit of ALL_UNITS) {
      const tested = PLAN.order.includes(unit.id)
      expect(tested).toBe(unit.order <= PLACEMENT_MAX_ORDER)
    }
  })

  it('names the track a unit belongs to', () => {
    expect(trackOf(PLAN, 'u05')).toBe('fundamental')
    expect(trackOf(PLAN, 'u09')).toBe('technical')
    expect(trackOf(PLAN, 'u01')).toBeNull()
    expect(trackOf(PLAN, 'u14')).toBeNull()
  })

  it('degrades to an empty plan rather than throwing on a curriculum with no root', () => {
    const orphan: Unit = { ...(getUnit('u03') as Unit), unlockAfter: 'u02' }
    const plan = buildPlacementPlan([orphan])
    // Nothing unlocks u03 in this one-unit world, so it *is* the root.
    expect(plan.core).toEqual(['u03'])
    expect(plan.tracks.fundamental).toEqual([])
    expect(buildPlacementPlan([]).order).toEqual([])
  })
})

// ── Sampling ─────────────────────────────────────────────────────────────────

describe('sampleUnitItems', () => {
  it('draws five questions from five different lessons of the unit', () => {
    for (const unitId of PLAN.order) {
      const unit = getUnit(unitId) as Unit
      const items = sampleUnitItems(unit)
      expect(items).toHaveLength(PLACEMENT_ITEMS_PER_UNIT)

      const lessonOf = (itemId: string): LessonId => itemId.slice(0, itemId.lastIndexOf('-'))
      const lessons = items.map((i) => lessonOf(i.id))
      expect(new Set(lessons).size).toBe(PLACEMENT_ITEMS_PER_UNIT)

      // Every item really is one of this unit's, and ids are unique.
      const own = new Set(unit.lessons.flatMap((l) => l.quiz.map((q) => q.id)))
      for (const item of items) expect(own.has(item.id)).toBe(true)
      expect(new Set(items.map((i) => i.id)).size).toBe(PLACEMENT_ITEMS_PER_UNIT)
    }
  })

  it('prefers the mid-difficulty -q2/-q3 items over the giveaway -q1', () => {
    for (const unitId of PLAN.order) {
      const items = sampleUnitItems(getUnit(unitId) as Unit)
      const mid = items.filter((i) => i.id.endsWith('-q2') || i.id.endsWith('-q3'))
      // Every shipped lesson has at least q1..q3, so the preference is total.
      expect(mid).toHaveLength(PLACEMENT_ITEMS_PER_UNIT)
    }
  })

  it('is deterministic — same unit, same questions, in the same order', () => {
    const unit = getUnit('u04') as Unit
    const a = sampleUnitItems(unit).map((i) => i.id)
    const b = sampleUnitItems(unit).map((i) => i.id)
    const c = sampleUnitItems({ ...unit, lessons: [...unit.lessons] }).map((i) => i.id)
    expect(b).toEqual(a)
    expect(c).toEqual(a)
  })

  it('gives different units different draws (the seed really mixes in the unit id)', () => {
    const a = sampleUnitItems(getUnit('u03') as Unit).map((i) => i.id.slice(-6))
    const b = sampleUnitItems(getUnit('u04') as Unit).map((i) => i.id.slice(-6))
    expect(a).not.toEqual(b)
  })

  it('falls back to a second question from a lesson when the unit is small', () => {
    const unit = getUnit('u01') as Unit
    const tiny: Unit = { ...unit, lessons: unit.lessons.slice(0, 2) }
    const items = sampleUnitItems(tiny)
    expect(items).toHaveLength(PLACEMENT_ITEMS_PER_UNIT)
    expect(new Set(items.map((i) => i.id)).size).toBe(PLACEMENT_ITEMS_PER_UNIT)
  })

  it('never asks for more questions than the unit has', () => {
    const unit = getUnit('u01') as Unit
    const oneLesson: Unit = {
      ...unit,
      lessons: [{ ...unit.lessons[0], quiz: unit.lessons[0].quiz.slice(0, 2) }],
    }
    expect(sampleUnitItems(oneLesson)).toHaveLength(2)
  })

  it('samples the whole plan in ladder order', () => {
    const samples = samplePlacement(ALL_UNITS, PLAN)
    expect(Object.keys(samples)).toEqual(PLAN.order)
  })
})

// ── The ladder ───────────────────────────────────────────────────────────────

describe('the ladder', () => {
  it('starts at u01 and asks nothing else until it is answered', () => {
    const state = newPlacementState(PLAN)
    expect(nextUnitToTest(state)).toBe('u01')
  })

  interface Ladder {
    name: string
    scores: Record<UnitId, number>
    /** Every unit the ladder should actually put in front of the learner. */
    tested: UnitId[]
    passedUnits: UnitId[]
    startAt: { fundamental: UnitId | null; technical: UnitId | null }
  }

  const LADDERS: Ladder[] = [
    {
      name: 'total beginner — misses u01 and is placed at the start',
      scores: allUnits(1),
      tested: ['u01'],
      passedUnits: [],
      startAt: { fundamental: 'u01', technical: 'u01' },
    },
    {
      name: 'knows the basics only — passes u01, misses u02, never reaches a track',
      scores: { ...allUnits(5), u02: 2 },
      tested: ['u01', 'u02'],
      passedUnits: ['u01'],
      startAt: { fundamental: 'u02', technical: 'u02' },
    },
    {
      name: 'expert — fifty questions, everything tested out',
      scores: allUnits(5),
      tested: PLAN.order,
      passedUnits: PLAN.order,
      startAt: { fundamental: null, technical: null },
    },
    {
      name: 'fundamental-strong, technical-weak',
      scores: { ...allUnits(5), u08: 2, u09: 5, u10: 5 },
      // u08 stops the technical track: u09/u10 are never asked, however well
      // this learner would have done on them.
      tested: ['u01', 'u02', 'u03', 'u04', 'u05', 'u06', 'u07', 'u08'],
      passedUnits: ['u01', 'u02', 'u03', 'u04', 'u05', 'u06', 'u07'],
      startAt: { fundamental: null, technical: 'u08' },
    },
    {
      name: 'chartist — fails u03 early, still tests out of the whole technical track',
      scores: { ...allUnits(5), u03: 0 },
      tested: ['u01', 'u02', 'u03', 'u08', 'u09', 'u10'],
      passedUnits: ['u01', 'u02', 'u08', 'u09', 'u10'],
      startAt: { fundamental: 'u03', technical: null },
    },
    {
      name: 'mid-fundamentals — stops at u05, technicals stop at u09',
      scores: { ...allUnits(5), u05: 3, u09: 3 },
      tested: ['u01', 'u02', 'u03', 'u04', 'u05', 'u08', 'u09'],
      passedUnits: ['u01', 'u02', 'u03', 'u04', 'u08'],
      startAt: { fundamental: 'u05', technical: 'u09' },
    },
    {
      name: 'exactly on the pass mark everywhere — 4/5 passes',
      scores: allUnits(PLACEMENT_PASS_MARK),
      tested: PLAN.order,
      passedUnits: PLAN.order,
      startAt: { fundamental: null, technical: null },
    },
    {
      name: 'one under the pass mark — 3/5 fails, and the boundary is exact',
      scores: { ...allUnits(PLACEMENT_PASS_MARK), u02: PLACEMENT_PASS_MARK - 1 },
      tested: ['u01', 'u02'],
      passedUnits: ['u01'],
      startAt: { fundamental: 'u02', technical: 'u02' },
    },
  ]

  for (const ladder of LADDERS) {
    it(ladder.name, () => {
      const state = runLadder(ladder.scores)
      expect(state.results.map((r) => r.unitId)).toEqual(ladder.tested)
      expect(nextUnitToTest(state)).toBeNull()

      const outcome = placementOutcome(state)
      expect(outcome.passedUnits).toEqual(ladder.passedUnits)
      expect(outcome.startAt).toEqual(ladder.startAt)
      expect(placementAsked(state)).toBe(ladder.tested.length * PLACEMENT_ITEMS_PER_UNIT)
    })
  }

  it('asks a beginner 5 questions and an expert 50', () => {
    expect(placementAsked(runLadder(allUnits(0)))).toBe(5)
    expect(placementAsked(runLadder(allUnits(5)))).toBe(50)
  })

  it('reports the passed units in curriculum order, not answer order', () => {
    // The technical track is answered after the fundamental one either way, but
    // the outcome must not depend on how the results array happened to fill.
    let state = newPlacementState(PLAN)
    state = recordUnitResult(state, 'u08', 5)
    state = recordUnitResult(state, 'u01', 5)
    state = recordUnitResult(state, 'u03', 5)
    expect(placementOutcome(state).passedUnits).toEqual(['u01', 'u03', 'u08'])
  })
})

describe('a retake resumes instead of restarting', () => {
  it('picks up at the first unit the earlier attempt did not credit', () => {
    const state = newPlacementState(PLAN, carriedResults(PLAN, ['u01', 'u02']))
    expect(nextUnitToTest(state)).toBe('u03')
    // Nothing was asked yet — carried credit is not a question anyone answered.
    expect(placementAsked(state)).toBe(0)
  })

  it('carries credit in ladder order, ignoring the order it is handed', () => {
    const carried = carriedResults(PLAN, ['u08', 'u01', 'u99'])
    expect(carried.map((r) => r.unitId)).toEqual(['u01', 'u08'])
    expect(carried.every((r) => r.carried)).toBe(true)
  })

  it('a fully credited profile has nothing left to test', () => {
    const state = newPlacementState(PLAN, carriedResults(PLAN, PLAN.order))
    expect(nextUnitToTest(state)).toBeNull()
    expect(placementOutcome(state).passedUnits).toEqual(PLAN.order)
  })

  it('a carried unit still gates the track above it the same way a fresh pass does', () => {
    let state = newPlacementState(PLAN, carriedResults(PLAN, ['u01', 'u02', 'u03']))
    expect(nextUnitToTest(state)).toBe('u04')
    state = recordUnitResult(state, 'u04', 1)
    expect(nextUnitToTest(state)).toBe('u08')
    expect(placementOutcome(state).startAt.fundamental).toBe('u04')
  })
})

describe('recordUnitResult', () => {
  it('is idempotent per unit — a double tap cannot rewrite a score', () => {
    const first = recordUnitResult(newPlacementState(PLAN), 'u01', 5)
    const second = recordUnitResult(first, 'u01', 0)
    expect(second).toBe(first)
    expect(second.results).toHaveLength(1)
    expect(second.results[0].correct).toBe(5)
  })

  it('clamps a nonsense score into the possible range', () => {
    const over = recordUnitResult(newPlacementState(PLAN), 'u01', 99)
    expect(over.results[0].correct).toBe(PLACEMENT_ITEMS_PER_UNIT)
    const under = recordUnitResult(newPlacementState(PLAN), 'u01', -3)
    expect(under.results[0].correct).toBe(0)
  })

  it('records the questions actually asked when a unit is short', () => {
    const short = recordUnitResult(newPlacementState(PLAN), 'u01', 2, 2)
    expect(short.results[0]).toEqual({ unitId: 'u01', correct: 2, total: 2 })
    // 2/2 is below the pass mark: a short unit is not an easier unit.
    expect(nextUnitToTest(short)).toBeNull()
  })

  it('leaves the input state untouched', () => {
    const before = newPlacementState(PLAN)
    recordUnitResult(before, 'u01', 5)
    expect(before.results).toEqual([])
  })
})

// ── The record ───────────────────────────────────────────────────────────────

describe('sanitizePlacementRecord', () => {
  it('degrades anything unrecognisable to "never taken"', () => {
    for (const raw of [undefined, null, 42, 'nope', [], {}]) {
      expect(sanitizePlacementRecord(raw)).toEqual(emptyPlacementRecord())
    }
  })

  it('keeps the good half of a half-broken record', () => {
    expect(
      sanitizePlacementRecord({
        takenAt: '2026-03-10',
        passedUnits: ['u01', 'u01', 7, null, 'u02'],
        offerDismissed: 'yes',
      }),
    ).toEqual({ takenAt: '2026-03-10', passedUnits: ['u01', 'u02'], offerDismissed: false })
  })
})

describe('mergePlacement', () => {
  it('unions across retakes and never removes a credited unit', () => {
    const first = mergePlacement(emptyPlacementRecord(), {
      passedUnits: ['u01', 'u02'],
      startAt: { fundamental: 'u03', technical: 'u08' },
    }, '2026-03-10')
    expect(first.newlyPassed).toEqual(['u01', 'u02'])

    // A retake that does *worse* still keeps u02.
    const second = mergePlacement(first.record, {
      passedUnits: ['u01'],
      startAt: { fundamental: 'u02', technical: 'u02' },
    }, '2026-04-01')
    expect(second.newlyPassed).toEqual([])
    expect(second.record.passedUnits).toEqual(['u01', 'u02'])
    expect(second.record.takenAt).toBe('2026-04-01')
  })

  it('carries the dismissed flag through', () => {
    const start = { ...emptyPlacementRecord(), offerDismissed: true }
    const { record } = mergePlacement(start, { passedUnits: [], startAt: { fundamental: 'u01', technical: 'u01' } }, '2026-03-10')
    expect(record.offerDismissed).toBe(true)
  })
})

// ── Applying it ──────────────────────────────────────────────────────────────

describe('creditPlacement', () => {
  const OUTCOME = placementOutcome(runLadder({ ...allUnits(5), u03: 1 }))
  const TODAY = '2026-03-10'

  it('credits every lesson of every passed unit, and no others', () => {
    const credit = creditPlacement({
      record: emptyPlacementRecord(),
      outcome: OUTCOME,
      units: ALL_UNITS,
      completedLessons: {},
      today: TODAY,
    })
    expect(credit.newlyPassed).toEqual(['u01', 'u02', 'u08', 'u09', 'u10'])

    const expected = credit.newlyPassed.flatMap((id) =>
      (getUnit(id) as Unit).lessons.map((l) => l.id),
    )
    expect(credit.lessonIds.sort()).toEqual(expected.sort())
    // Nothing from the failed unit, nothing from the never-tested tail.
    expect(credit.lessonIds.some((id) => id.startsWith('u03'))).toBe(false)
    expect(credit.lessonIds.some((id) => id.startsWith('u11'))).toBe(false)
  })

  it('pays a flat XP_PLACEMENT_UNIT per newly passed unit', () => {
    const credit = creditPlacement({
      record: emptyPlacementRecord(),
      outcome: OUTCOME,
      units: ALL_UNITS,
      completedLessons: {},
      today: TODAY,
    })
    expect(credit.xp).toBe(5 * XP_PLACEMENT_UNIT)
  })

  it('is idempotent — applying the same outcome twice costs nothing the second time', () => {
    const first = creditPlacement({
      record: emptyPlacementRecord(),
      outcome: OUTCOME,
      units: ALL_UNITS,
      completedLessons: {},
      today: TODAY,
    })
    const completed = Object.fromEntries(first.lessonIds.map((id) => [id, TODAY]))

    const again = creditPlacement({
      record: first.record,
      outcome: OUTCOME,
      units: ALL_UNITS,
      completedLessons: completed,
      today: TODAY,
    })
    expect(again.newlyPassed).toEqual([])
    expect(again.lessonIds).toEqual([])
    expect(again.xp).toBe(0)
    expect(again.record.passedUnits).toEqual(first.record.passedUnits)
  })

  it('a retake only ever adds — and only pays for the units it adds', () => {
    const first = creditPlacement({
      record: emptyPlacementRecord(),
      outcome: OUTCOME,
      units: ALL_UNITS,
      completedLessons: {},
      today: TODAY,
    })
    const completed = Object.fromEntries(first.lessonIds.map((id) => [id, TODAY]))

    // Second attempt: u03 passes this time, and the technical track is skipped
    // entirely (the learner quit after the fundamentals).
    const retake = creditPlacement({
      record: first.record,
      outcome: { passedUnits: ['u01', 'u02', 'u03'], startAt: { fundamental: 'u04', technical: null } },
      units: ALL_UNITS,
      completedLessons: completed,
      today: '2026-04-01',
    })
    expect(retake.newlyPassed).toEqual(['u03'])
    expect(retake.xp).toBe(XP_PLACEMENT_UNIT)
    expect(retake.lessonIds).toEqual((getUnit('u03') as Unit).lessons.map((l) => l.id))
    // Nothing from the first attempt was dropped.
    for (const id of first.record.passedUnits) {
      expect(retake.record.passedUnits).toContain(id)
    }
  })

  it('does not re-credit a lesson the learner already studied by hand', () => {
    const alreadyStudied = (getUnit('u01') as Unit).lessons[0].id
    const credit = creditPlacement({
      record: emptyPlacementRecord(),
      outcome: { passedUnits: ['u01'], startAt: { fundamental: 'u02', technical: 'u02' } },
      units: ALL_UNITS,
      completedLessons: { [alreadyStudied]: '2026-03-01' },
      today: TODAY,
    })
    expect(credit.lessonIds).not.toContain(alreadyStudied)
    expect(credit.lessonIds).toHaveLength((getUnit('u01') as Unit).lessons.length - 1)
    // Still a newly passed unit, so the credit is still paid once.
    expect(credit.xp).toBe(XP_PLACEMENT_UNIT)
  })

  it('mints nothing and knows nothing about cards', () => {
    // Guard-rail assertion: the credit surface is lessons + XP + record, full
    // stop. If a `cards` field ever appears here, the 300-card review queue
    // this design exists to prevent has come back.
    const credit = creditPlacement({
      record: emptyPlacementRecord(),
      outcome: OUTCOME,
      units: ALL_UNITS,
      completedLessons: {},
      today: TODAY,
    })
    expect(Object.keys(credit).sort()).toEqual(['lessonIds', 'newlyPassed', 'record', 'xp'])
  })
})

// ── The 80% unlock rule still holds after a placement ─────────────────────────

describe('placement and the unlock rule', () => {
  it('completing every lesson of a passed unit satisfies the 80% gate for the next one', async () => {
    const { isUnitUnlocked, unitProgress } = await import('@state/selectors')
    const credit = creditPlacement({
      record: emptyPlacementRecord(),
      outcome: { passedUnits: ['u01', 'u02'], startAt: { fundamental: 'u03', technical: 'u08' } },
      units: ALL_UNITS,
      completedLessons: {},
      today: '2026-03-10',
    })
    const progress = {
      completedLessons: Object.fromEntries(credit.lessonIds.map((id) => [id, '2026-03-10'])),
      firstTryCorrect: [],
    }
    expect(unitProgress(getUnit('u02') as Unit, progress)).toBe(1)
    // Both branches below u02 open.
    expect(isUnitUnlocked(getUnit('u03') as Unit, progress)).toBe(true)
    expect(isUnitUnlocked(getUnit('u08') as Unit, progress)).toBe(true)
    // And nothing further along opens by accident.
    expect(isUnitUnlocked(getUnit('u04') as Unit, progress)).toBe(false)
  })

  it('nextLesson skips straight past the units a placement credited', async () => {
    const { nextLesson } = await import('@state/selectors')
    const credit = creditPlacement({
      record: emptyPlacementRecord(),
      outcome: { passedUnits: ['u01', 'u02'], startAt: { fundamental: 'u03', technical: 'u08' } },
      units: ALL_UNITS,
      completedLessons: {},
      today: '2026-03-10',
    })
    const progress = {
      completedLessons: Object.fromEntries(credit.lessonIds.map((id) => [id, '2026-03-10'])),
      firstTryCorrect: [],
    }
    // No change was needed in the selector: "first incomplete lesson of the
    // first unlocked unit" is already the right answer once the lessons are
    // marked complete.
    expect(nextLesson(progress)?.id).toBe((getUnit('u03') as Unit).lessons[0].id)
  })
})
