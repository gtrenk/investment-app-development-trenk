import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PACE,
  PACE_OPTIONS,
  defaultSettings,
  isPace,
  monthsToFinish,
  sanitizeSettings,
} from '@core/settings'
import { DEFAULT_DUE_CAP, DEFAULT_NEW_CAP, queueOptsForPace } from '@core/srs/scheduler'
import { isGoalMet, lessonGoalFor } from '@core/gamification/streak'
import type { DayLog } from '@core/types'

function log(partial: Partial<DayLog> = {}): DayLog {
  return { reviews: 0, lessons: 0, drills: 0, xp: 0, goalMet: false, ...partial }
}

// ── The setting itself ───────────────────────────────────────────────────────

describe('pace in settings', () => {
  it('defaults to one lesson a day', () => {
    expect(defaultSettings().pace).toBe(1)
    expect(DEFAULT_PACE).toBe(1)
    expect([...PACE_OPTIONS]).toEqual([1, 2, 3])
  })

  it('keeps a stored pace', () => {
    expect(sanitizeSettings({ pace: 3 }).pace).toBe(3)
    expect(sanitizeSettings({ readAloud: { enabled: true, rate: 1.2 }, pace: 2 })).toEqual({
      readAloud: { enabled: true, rate: 1.2 },
      pace: 2,
    })
  })

  it.each([0, 4, -1, 2.5, '2', null, undefined, {}, NaN])(
    'sanitizes %j back to 1',
    (raw) => {
      expect(sanitizeSettings({ pace: raw }).pace).toBe(1)
    },
  )

  it('reads pace even when read-aloud is missing or broken', () => {
    // The two preferences share one synced blob. A record written by a build
    // that only knew about one of them must not cost the learner the other.
    expect(sanitizeSettings({ pace: 3 }).readAloud).toEqual({ enabled: false, rate: 1 })
    expect(sanitizeSettings({ readAloud: 'nope', pace: 2 }).pace).toBe(2)
  })

  it('recognises exactly the three offered values', () => {
    expect(isPace(2)).toBe(true)
    expect(isPace(0)).toBe(false)
    expect(isPace('2')).toBe(false)
  })
})

describe('monthsToFinish', () => {
  // 134 lessons is the shipped curriculum; five study days a week.
  it.each([
    [1, 6],
    [2, 3],
    [3, 2],
  ])('pace %i finishes 134 lessons in ~%i months', (pace, months) => {
    expect(monthsToFinish(134, pace as 1 | 2 | 3)).toBe(months)
  })

  it('never quotes zero months for work that remains', () => {
    expect(monthsToFinish(1, 1)).toBe(1)
  })

  it('is zero only when there is nothing left', () => {
    expect(monthsToFinish(0, 1)).toBe(0)
  })
})

// ── The SRS caps ─────────────────────────────────────────────────────────────

describe('queueOptsForPace', () => {
  it('scales new cards straight off pace', () => {
    expect(queueOptsForPace(1).newCap).toBe(DEFAULT_NEW_CAP)
    expect(queueOptsForPace(2).newCap).toBe(DEFAULT_NEW_CAP * 2)
    expect(queueOptsForPace(3).newCap).toBe(DEFAULT_NEW_CAP * 3)
  })

  it('leaves the review cap alone at pace 1 and lifts it after', () => {
    expect(queueOptsForPace(1).dueCap).toBe(DEFAULT_DUE_CAP)
    expect(queueOptsForPace(2).dueCap).toBe(40)
    expect(queueOptsForPace(3).dueCap).toBe(50)
  })

  it('raises the review cap more gently than the new-card cap', () => {
    // Triple the intake, but not triple the grind: 90 reviews would be a chore
    // nobody finishes, and an unfinishable queue is an unreachable daily goal.
    const one = queueOptsForPace(1)
    const three = queueOptsForPace(3)
    expect(three.newCap / one.newCap).toBe(3)
    expect(three.dueCap / one.dueCap).toBeLessThan(3)
    expect(three.dueCap).toBeGreaterThan(one.dueCap)
  })
})

// ── The daily goal ───────────────────────────────────────────────────────────

describe('lessonGoalFor', () => {
  it('is the pace while there is that much curriculum left', () => {
    expect(lessonGoalFor(1, 100)).toBe(1)
    expect(lessonGoalFor(3, 100)).toBe(3)
  })

  it('never asks for more lessons than remain', () => {
    expect(lessonGoalFor(3, 2)).toBe(2)
  })

  it('still asks for one when the curriculum is finished, so the drill counts', () => {
    expect(lessonGoalFor(3, 0)).toBe(1)
  })
})

describe('isGoalMet with a lesson goal', () => {
  const cases: { name: string; day: DayLog; due: number; goal: number; expected: boolean }[] = [
    {
      name: 'pace 2: one lesson is no longer enough',
      day: log({ reviews: 5, lessons: 1 }),
      due: 5,
      goal: 2,
      expected: false,
    },
    {
      name: 'pace 2: two lessons meet it',
      day: log({ reviews: 5, lessons: 2 }),
      due: 5,
      goal: 2,
      expected: true,
    },
    {
      name: 'pace 2: a lesson plus the drill meets it',
      day: log({ reviews: 5, lessons: 1, drills: 1 }),
      due: 5,
      goal: 2,
      expected: true,
    },
    {
      name: 'pace 3: two lessons and the drill meet it',
      day: log({ reviews: 5, lessons: 2, drills: 1 }),
      due: 5,
      goal: 3,
      expected: true,
    },
    {
      name: 'pace 3: three lessons and no drill meet it',
      day: log({ reviews: 5, lessons: 3 }),
      due: 5,
      goal: 3,
      expected: true,
    },
    {
      name: 'pace 3: the drill alone does not',
      day: log({ reviews: 5, drills: 1 }),
      due: 5,
      goal: 3,
      expected: false,
    },
    {
      name: 'the review half still has to be cleared',
      day: log({ reviews: 1, lessons: 3 }),
      due: 9,
      goal: 3,
      expected: false,
    },
    {
      name: '20 reviews still satisfies the review half at any pace',
      day: log({ reviews: 20, lessons: 3 }),
      due: 60,
      goal: 3,
      expected: true,
    },
  ]

  it.each(cases)('$name → $expected', ({ day, due, goal, expected }) => {
    expect(isGoalMet(day, due, goal)).toBe(expected)
  })

  it('is exactly the old rule when the goal is left at 1', () => {
    // The drill counts once, so "one lesson OR one drill" survives unchanged.
    expect(isGoalMet(log({ reviews: 3, lessons: 1 }), 3)).toBe(true)
    expect(isGoalMet(log({ reviews: 3, drills: 1 }), 3)).toBe(true)
    expect(isGoalMet(log({ reviews: 3 }), 3)).toBe(false)
    expect(isGoalMet(log({ reviews: 3, lessons: 1 }), 3, 1)).toBe(true)
  })

  it('treats a goal below 1 as 1 rather than as "nothing required"', () => {
    expect(isGoalMet(log({ reviews: 0 }), 0, 0)).toBe(false)
  })
})
