// ─── Weak-spot targeting ─────────────────────────────────────────────────────
// The mistake bank, the per-unit insight maths, the re-ask shuffle and the
// session plan. All four are pure, so this is a plain Node test with no DOM and
// no store: the store's own wiring is one guard clause over `resolveAward`,
// which is exercised here directly and end to end in e2e/weakspots.spec.ts.

import { describe, expect, it } from 'vitest'
import type { CardId, CardState, Unit } from '@core/types'
import { addDays } from '@core/clock'
import { XP_WEAKSPOT } from '@core/gamification/xp'
import {
  emptyWeakSpots,
  findMiss,
  isOpen,
  lessonIdOf,
  missesByUnit,
  openMissCount,
  openMisses,
  recordMiss,
  resolveMiss,
  sanitizeWeakSpots,
  unitIdOf,
} from '@core/weakspots/bank'
import type { WeakSpotsState } from '@core/weakspots/bank'
import {
  LAPSE_MIN,
  LAPSE_WINDOW_DAYS,
  OPEN_MISS_SCALE,
  SCORE_WEIGHTS,
  lapsedCardIds,
  rankUnits,
  totalOpenMisses,
  unitInsights,
  weakSpotSummary,
  weaknessScore,
} from '@core/weakspots/insight'
import {
  WEAKSPOT_MISS_MAX,
  WEAKSPOT_SESSION_MAX,
  buildWeakSpotPlan,
  missStepCount,
  resolveAward,
} from '@core/weakspots/session'
import { reaskItem, reaskOrder } from '@core/weakspots/reask'
import { ALL_LESSONS, ALL_UNITS } from '@content/units'

const T0 = '2026-03-01'
const T1 = '2026-03-05'
const T2 = '2026-03-09'

/** A bank built by replaying misses, the way the store does. */
function bankOf(...entries: Array<[itemId: string, date: string]>): WeakSpotsState {
  return entries.reduce((state, [itemId, date]) => recordMiss(state, itemId, date), emptyWeakSpots())
}

function card(cardId: CardId, patch: Partial<CardState> = {}): CardState {
  return {
    cardId,
    ease: 2.5,
    intervalDays: 1,
    reps: 3,
    lapses: 0,
    due: T0,
    introduced: T0,
    ...patch,
  }
}

function srsOf(...cards: CardState[]): Record<CardId, CardState> {
  return Object.fromEntries(cards.map((c) => [c.cardId, c]))
}

/** Two throwaway units, so the insight tests do not depend on curriculum edits. */
const UNITS: Unit[] = [
  { id: 'u01', title: 'Unit One', order: 1, description: '', unlockAfter: null, lessons: [] },
  { id: 'u02', title: 'Unit Two', order: 2, description: '', unlockAfter: 'u01', lessons: [] },
]

// ── Ids ──────────────────────────────────────────────────────────────────────

describe('curriculum id parsing', () => {
  it('reads the unit and lesson back out of an item or card id', () => {
    expect(unitIdOf('u05-l03-q2')).toBe('u05')
    expect(lessonIdOf('u05-l03-q2')).toBe('u05-l03')
    expect(unitIdOf('u05-l03-c1')).toBe('u05')
    expect(lessonIdOf('u12-l10')).toBe('u12-l10')
  })

  it('refuses anything that is not one', () => {
    for (const bad of ['', 'c1-q1', 'case-c3-q2', 'u05', 'lesson-1-q1', 'U05-L03-q1']) {
      expect(unitIdOf(bad)).toBeNull()
      expect(lessonIdOf(bad)).toBeNull()
    }
  })
})

// ── Bank transitions ─────────────────────────────────────────────────────────

describe('the mistake bank', () => {
  it('an item enters on its first miss, with everything derived from the id', () => {
    const bank = bankOf(['u05-l03-q2', T0])
    expect(bank.misses).toEqual([
      {
        itemId: 'u05-l03-q2',
        lessonId: 'u05-l03',
        unitId: 'u05',
        missCount: 1,
        lastMissedAt: T0,
      },
    ])
    expect(openMissCount(bank)).toBe(1)
    expect(totalOpenMisses(bank)).toBe(1)
  })

  it('a repeat miss increments the counter and moves the date — it does not duplicate', () => {
    const bank = bankOf(['u05-l03-q2', T0], ['u05-l03-q2', T1])
    expect(bank.misses).toHaveLength(1)
    expect(findMiss(bank, 'u05-l03-q2')).toMatchObject({ missCount: 2, lastMissedAt: T1 })
  })

  it('resolving keeps the record but takes it out of the queue', () => {
    const bank = resolveMiss(bankOf(['u05-l03-q2', T0]), 'u05-l03-q2', T1)
    const record = findMiss(bank, 'u05-l03-q2')!
    expect(record.resolvedAt).toBe(T1)
    expect(isOpen(record)).toBe(false)
    expect(openMisses(bank)).toEqual([])
    // Still there for the stats — a fixed mistake is evidence, not a deletion.
    expect(bank.misses).toHaveLength(1)
    expect(missesByUnit(bank).u05).toHaveLength(1)
  })

  it('a resolved item re-enters on a new miss, and the counter carries over', () => {
    const fixed = resolveMiss(bankOf(['u05-l03-q2', T0], ['u05-l03-q2', T1]), 'u05-l03-q2', T1)
    const again = recordMiss(fixed, 'u05-l03-q2', T2)
    const record = findMiss(again, 'u05-l03-q2')!
    expect(record.resolvedAt).toBeUndefined()
    expect(record.missCount).toBe(3)
    expect(record.lastMissedAt).toBe(T2)
    expect(openMisses(again).map((m) => m.itemId)).toEqual(['u05-l03-q2'])
  })

  it('refuses an id that is not a curriculum item, by reference', () => {
    const bank = bankOf(['u05-l03-q2', T0])
    expect(recordMiss(bank, 'case-c3-q1', T1)).toBe(bank)
    expect(recordMiss(bank, '', T1)).toBe(bank)
  })

  it('resolving something unknown or already fixed is a no-op, by reference', () => {
    const bank = bankOf(['u05-l03-q2', T0])
    expect(resolveMiss(bank, 'u09-l01-q1', T1)).toBe(bank)
    const fixed = resolveMiss(bank, 'u05-l03-q2', T1)
    expect(fixed).not.toBe(bank)
    expect(resolveMiss(fixed, 'u05-l03-q2', T2)).toBe(fixed)
  })

  it('queues the oldest miss first, ties broken on id', () => {
    const bank = bankOf(
      ['u09-l01-q1', T2],
      ['u01-l02-q3', T0],
      ['u05-l03-q2', T1],
      ['u01-l01-q1', T0],
    )
    expect(openMisses(bank).map((m) => m.itemId)).toEqual([
      'u01-l01-q1',
      'u01-l02-q3',
      'u05-l03-q2',
      'u09-l01-q1',
    ])
  })

  it('groups by unit, open and resolved alike', () => {
    const bank = resolveMiss(
      bankOf(['u01-l01-q1', T0], ['u01-l02-q2', T1], ['u05-l03-q2', T1]),
      'u01-l01-q1',
      T2,
    )
    const byUnit = missesByUnit(bank)
    expect(Object.keys(byUnit).sort()).toEqual(['u01', 'u05'])
    expect(byUnit.u01.map((m) => m.itemId)).toEqual(['u01-l01-q1', 'u01-l02-q2'])
  })
})

describe('reading a stored bank back', () => {
  it('survives junk, drops duplicates, and re-derives missing ids', () => {
    const state = sanitizeWeakSpots({
      misses: [
        { itemId: 'u05-l03-q2', lastMissedAt: T0 },
        { itemId: 'u05-l03-q2', lastMissedAt: T1, missCount: 9 },
        { itemId: 'not-an-item', lastMissedAt: T0 },
        { lastMissedAt: T0 },
        null,
        { itemId: 'u01-l01-q1', lastMissedAt: T1, missCount: -4, resolvedAt: T2 },
      ],
    })
    expect(state.misses).toHaveLength(2)
    expect(state.misses[0]).toMatchObject({ unitId: 'u05', lessonId: 'u05-l03', missCount: 1 })
    expect(state.misses[1]).toMatchObject({ missCount: 1, resolvedAt: T2 })
  })

  it('degrades to an empty bank rather than throwing', () => {
    for (const bad of [undefined, null, 42, 'misses', {}, { misses: 'nope' }]) {
      expect(sanitizeWeakSpots(bad)).toEqual(emptyWeakSpots())
    }
  })
})

// ── Insight ──────────────────────────────────────────────────────────────────

describe('lapsed cards', () => {
  const today = T0
  const inWindow = addDays(today, LAPSE_WINDOW_DAYS)
  const outside = addDays(today, LAPSE_WINDOW_DAYS + 1)

  it('needs both the lapse count and the due window', () => {
    const srs = srsOf(
      card('u01-l01-c1', { lapses: LAPSE_MIN, due: today }),
      card('u01-l01-c2', { lapses: LAPSE_MIN - 1, due: today }), // too few lapses
      card('u01-l02-c1', { lapses: 9, due: outside }), // too far out
      card('u02-l01-c1', { lapses: LAPSE_MIN, due: today }), // another unit
    )
    expect(lapsedCardIds(srs, 'u01', today)).toEqual(['u01-l01-c1'])
    expect(lapsedCardIds(srs, 'u02', today)).toEqual(['u02-l01-c1'])
  })

  it('counts the window edges the way the copy says: overdue in, day 7 in, day 8 out', () => {
    const srs = srsOf(
      card('u01-l01-c1', { lapses: 4, due: addDays(today, -30) }),
      card('u01-l01-c2', { lapses: 2, due: inWindow }),
      card('u01-l01-c3', { lapses: 2, due: outside }),
    )
    expect(lapsedCardIds(srs, 'u01', today)).toEqual(['u01-l01-c1', 'u01-l01-c2'])
  })

  it('ignores cards whose id is not curriculum-shaped', () => {
    expect(lapsedCardIds(srsOf(card('mystery', { lapses: 5 })), 'u01', today)).toEqual([])
  })
})

describe('the weakness score', () => {
  it('is 0 with nothing recorded and 100 when every term saturates', () => {
    expect(weaknessScore({ quizAttempted: 0, quizMissed: 0, openMisses: 0, lapsedCards: 0 })).toBe(0)
    expect(weaknessScore({ quizAttempted: 4, quizMissed: 4, openMisses: 99, lapsedCards: 99 })).toBe(100)
  })

  it('blends the three signals with the published weights', () => {
    // Half the items missed, nothing open, nothing lapsing.
    expect(weaknessScore({ quizAttempted: 10, quizMissed: 5, openMisses: 0, lapsedCards: 0 })).toBe(
      Math.round(SCORE_WEIGHTS.missRate * 0.5 * 100),
    )
    // Backlog alone, exactly at the saturation point.
    expect(
      weaknessScore({ quizAttempted: 0, quizMissed: 0, openMisses: OPEN_MISS_SCALE, lapsedCards: 0 }),
    ).toBe(Math.round(SCORE_WEIGHTS.openMisses * 100))
  })

  it('saturates rather than overflowing on a huge backlog', () => {
    const many = weaknessScore({ quizAttempted: 0, quizMissed: 0, openMisses: 500, lapsedCards: 0 })
    expect(many).toBe(Math.round(SCORE_WEIGHTS.openMisses * 100))
  })
})

describe('per-unit insight', () => {
  const srs = srsOf(
    card('u01-l01-c1', { lapses: 3, due: T0 }),
    card('u01-l01-c2', { lapses: 3, due: T0 }),
  )

  it('counts attempted as the union of first-try-right and ever-missed', () => {
    const bank = bankOf(['u01-l01-q2', T0], ['u01-l02-q1', T1])
    const [u01] = unitInsights({
      units: UNITS,
      firstTryCorrect: ['u01-l01-q1', 'u01-l01-q3', 'u09-l01-q1'],
      weakSpots: bank,
      srs: {},
      today: T1,
    })
    expect(u01.quizAttempted).toBe(4)
    expect(u01.quizMissed).toBe(2)
    expect(u01.accuracy).toBeCloseTo(0.5)
    expect(u01.openMisses).toBe(2)
  })

  it('counts an item that was both right in a lesson and missed in placement as missed', () => {
    const [u01] = unitInsights({
      units: UNITS,
      firstTryCorrect: ['u01-l01-q1'],
      weakSpots: bankOf(['u01-l01-q1', T1]),
      srs: {},
      today: T1,
    })
    expect(u01.quizAttempted).toBe(1)
    expect(u01.quizMissed).toBe(1)
    expect(u01.accuracy).toBe(0)
  })

  it('keeps resolved misses in the accuracy record but out of the open count', () => {
    const bank = resolveMiss(bankOf(['u01-l01-q2', T0]), 'u01-l01-q2', T1)
    const [u01] = unitInsights({
      units: UNITS,
      firstTryCorrect: ['u01-l01-q1'],
      weakSpots: bank,
      srs: {},
      today: T1,
    })
    expect(u01.quizMissed).toBe(1)
    expect(u01.openMisses).toBe(0)
  })

  it('drops units with no evidence at all, and keeps one that only has lapsing cards', () => {
    const rows = unitInsights({
      units: UNITS,
      firstTryCorrect: [],
      weakSpots: emptyWeakSpots(),
      srs,
      today: T0,
    })
    expect(rows.map((r) => r.unitId)).toEqual(['u01'])
    expect(rows[0]).toMatchObject({ quizAttempted: 0, accuracy: null, lapsedCards: 2 })
    expect(rows[0].score).toBeGreaterThan(0)
  })

  it('ranks the weakest first and summarises the lot', () => {
    const bank = bankOf(
      ['u01-l01-q1', T0],
      ['u01-l01-q2', T0],
      ['u01-l02-q1', T0],
      ['u02-l01-q1', T0],
    )
    const rows = unitInsights({
      units: UNITS,
      firstTryCorrect: ['u02-l01-q2', 'u02-l01-q3', 'u02-l02-q1', 'u02-l02-q2'],
      weakSpots: bank,
      srs: {},
      today: T1,
    })
    const ranked = rankUnits(rows)
    expect(ranked[0].unitId).toBe('u01')

    const summary = weakSpotSummary(rows)
    expect(summary.openMisses).toBe(4)
    expect(summary.unitsAffected).toBe(2)
    expect(summary.quizAttempted).toBe(8)
    expect(summary.quizMissed).toBe(4)
    expect(summary.accuracy).toBeCloseTo(0.5)
    expect(summary.weakest?.unitId).toBe('u01')
  })

  it('summarises an untouched profile without inventing an accuracy', () => {
    const summary = weakSpotSummary([])
    expect(summary).toMatchObject({ openMisses: 0, unitsAffected: 0, accuracy: null, weakest: null })
  })
})

// ── The re-ask shuffle ───────────────────────────────────────────────────────

describe('re-asking a missed item', () => {
  const ITEMS = ALL_LESSONS.flatMap((l) => l.quiz)

  it('is a permutation of the original choices, every time', () => {
    for (const item of ITEMS) {
      const reasked = reaskItem(item)
      expect([...reasked.order].sort()).toEqual([0, 1, 2, 3])
      expect([...reasked.choices].sort()).toEqual([...item.choices].sort())
      expect(reasked.choices[reasked.answerIdx]).toBe(item.choices[item.answerIdx])
    }
  })

  it('is deterministic — same item, same order, forever', () => {
    for (const item of ITEMS.slice(0, 25)) {
      expect(reaskOrder(item.id)).toEqual(reaskOrder(item.id))
      expect(reaskItem(item).choices).toEqual(reaskItem(item).choices)
    }
  })

  it('never hands back the authored order', () => {
    for (const item of ITEMS) {
      expect(reaskOrder(item.id)).not.toEqual([0, 1, 2, 3])
    }
  })

  it('moves the correct answer for most items — but not for all, which is the point', () => {
    const moved = ITEMS.filter((item) => reaskItem(item).answerIdx !== item.answerIdx).length
    // Guaranteeing a move would tell anyone who noticed that the answer is
    // never where it was last time: a free elimination on every re-ask.
    expect(moved).toBeGreaterThan(ITEMS.length * 0.5)
    expect(moved).toBeLessThan(ITEMS.length)
  })

  it('gives different items different orders', () => {
    const orders = new Set(ITEMS.slice(0, 40).map((item) => reaskOrder(item.id).join('')))
    expect(orders.size).toBeGreaterThan(4)
  })
})

// ── The session plan ─────────────────────────────────────────────────────────

describe('the weak-spot session plan', () => {
  const manyMisses = (n: number): WeakSpotsState =>
    bankOf(
      ...Array.from(
        { length: n },
        (_, i) => [`u01-l${String(i + 1).padStart(2, '0')}-q1`, addDays(T0, i)] as [string, string],
      ),
    )

  it('queues open misses oldest first, capped', () => {
    const plan = buildWeakSpotPlan({
      weakSpots: manyMisses(12),
      srs: {},
      units: UNITS,
      today: T2,
    })
    expect(plan).toHaveLength(WEAKSPOT_MISS_MAX)
    expect(missStepCount(plan)).toBe(WEAKSPOT_MISS_MAX)
    expect(plan[0].kind === 'miss' && plan[0].record.itemId).toBe('u01-l01-q1')
  })

  it('leaves resolved items out', () => {
    const bank = resolveMiss(bankOf(['u01-l01-q1', T0], ['u01-l02-q1', T1]), 'u01-l01-q1', T2)
    const plan = buildWeakSpotPlan({ weakSpots: bank, srs: {}, units: UNITS, today: T2 })
    expect(plan).toHaveLength(1)
    expect(plan[0].kind === 'miss' && plan[0].record.itemId).toBe('u01-l02-q1')
  })

  it('appends one pointer per unit with lapsing cards, worst unit first', () => {
    const srs = srsOf(
      card('u01-l01-c1', { lapses: 2, due: T0 }),
      card('u02-l01-c1', { lapses: 2, due: T0 }),
      card('u02-l01-c2', { lapses: 3, due: T0 }),
      card('u02-l02-c1', { lapses: 3, due: T0 }),
    )
    const plan = buildWeakSpotPlan({
      weakSpots: bankOf(['u01-l01-q1', T0]),
      srs,
      units: UNITS,
      today: T0,
    })
    expect(plan.map((s) => s.kind)).toEqual(['miss', 'lapsed', 'lapsed'])
    expect(plan[1].kind === 'lapsed' && plan[1].unitId).toBe('u02')
    expect(plan[1].kind === 'lapsed' && plan[1].cardIds).toHaveLength(3)
    expect(plan[2].kind === 'lapsed' && plan[2].unitId).toBe('u01')
  })

  it('never exceeds the session cap', () => {
    const srs = srsOf(card('u01-l01-c1', { lapses: 4 }), card('u02-l01-c1', { lapses: 4 }))
    const plan = buildWeakSpotPlan({ weakSpots: manyMisses(20), srs, units: UNITS, today: T2 })
    expect(plan.length).toBeLessThanOrEqual(WEAKSPOT_SESSION_MAX)
    expect(plan.length).toBe(WEAKSPOT_MISS_MAX + 2)
  })

  it('skips items whose question has left the curriculum', () => {
    const bank = bankOf(['u01-l01-q1', T0], ['u01-l99-q9', T1])
    const plan = buildWeakSpotPlan(
      { weakSpots: bank, srs: {}, units: UNITS, today: T2 },
      (id) => id === 'u01-l01-q1',
    )
    expect(plan).toHaveLength(1)
  })

  it('is empty for a learner with nothing to fix', () => {
    expect(
      buildWeakSpotPlan({ weakSpots: emptyWeakSpots(), srs: {}, units: UNITS, today: T0 }),
    ).toEqual([])
  })

  it('every queued item resolves to a real question in the shipped curriculum', () => {
    const ids = new Set(ALL_LESSONS.flatMap((l) => l.quiz.map((q) => q.id)))
    const bank = bankOf(
      [ALL_LESSONS[0].quiz[0].id, T0],
      [ALL_LESSONS[1].quiz[0].id, T1],
    )
    const plan = buildWeakSpotPlan({ weakSpots: bank, srs: {}, units: ALL_UNITS, today: T2 }, (id) =>
      ids.has(id),
    )
    expect(plan.map((s) => (s.kind === 'miss' ? s.record.itemId : ''))).toEqual([
      ALL_LESSONS[0].quiz[0].id,
      ALL_LESSONS[1].quiz[0].id,
    ])
  })
})

// ── XP wiring ────────────────────────────────────────────────────────────────

describe('what a fix is worth', () => {
  it('pays once, and pays nothing for a repeat resolve', () => {
    const bank = bankOf(['u01-l01-q1', T0])
    const fixed = resolveMiss(bank, 'u01-l01-q1', T1)
    expect(resolveAward(bank, fixed)).toBe(XP_WEAKSPOT)

    // The store's guard is exactly this comparison: a double tap, a remount or
    // a replayed action all land here and pay 0.
    const again = resolveMiss(fixed, 'u01-l01-q1', T2)
    expect(again).toBe(fixed)
    expect(resolveAward(fixed, again)).toBe(0)
  })

  it('pays nothing for resolving something that was never missed', () => {
    const bank = bankOf(['u01-l01-q1', T0])
    expect(resolveAward(bank, resolveMiss(bank, 'u09-l09-q9', T1))).toBe(0)
  })

  it('pays again after the item has been missed afresh', () => {
    const bank = bankOf(['u01-l01-q1', T0])
    const fixed = resolveMiss(bank, 'u01-l01-q1', T1)
    const missedAgain = recordMiss(fixed, 'u01-l01-q1', T2)
    const refixed = resolveMiss(missedAgain, 'u01-l01-q1', T2)
    expect(resolveAward(missedAgain, refixed)).toBe(XP_WEAKSPOT)
    expect(findMiss(refixed, 'u01-l01-q1')?.missCount).toBe(2)
  })
})
