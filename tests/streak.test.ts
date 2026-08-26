import { describe, expect, it } from 'vitest'
import { addDays } from '@core/clock'
import {
  DAYS_PER_FREEZE,
  isGoalMet,
  MAX_FREEZES,
  newStreakState,
  recordGoalMet,
} from '@core/gamification/streak'
import type { DayLog, StreakState } from '@core/types'

const D1 = '2026-03-01'

function log(partial: Partial<DayLog> = {}): DayLog {
  return { reviews: 0, lessons: 0, drills: 0, xp: 0, goalMet: false, ...partial }
}

function streak(partial: Partial<StreakState> = {}): StreakState {
  return { ...newStreakState(), ...partial }
}

/** Meet the goal every day for `n` consecutive days, starting at D1. */
function runDays(n: number, from: StreakState = newStreakState(), start = D1): StreakState {
  let s = from
  let day = start
  for (let i = 0; i < n; i++) {
    s = recordGoalMet(s, day)
    day = addDays(day, 1)
  }
  return s
}

// The pace-aware half of this rule — `isGoalMet(day, due, lessonGoal)` and
// `lessonGoalFor` — has its own table in tests/pace.test.ts. The cases below are
// the default-goal behaviour, unchanged by pace and deliberately left as-is.
describe('isGoalMet', () => {
  const cases: { name: string; day: DayLog; due: number; expected: boolean }[] = [
    {
      name: 'all due reviews cleared plus a lesson',
      day: log({ reviews: 12, lessons: 1 }),
      due: 12,
      expected: true,
    },
    {
      name: 'all due reviews cleared plus a drill',
      day: log({ reviews: 12, drills: 1 }),
      due: 12,
      expected: true,
    },
    {
      name: '20 reviews satisfies even with more due',
      day: log({ reviews: 20, lessons: 1 }),
      due: 45,
      expected: true,
    },
    {
      name: 'reviews short of both the queue and 20',
      day: log({ reviews: 19, lessons: 1 }),
      due: 45,
      expected: false,
    },
    {
      name: 'reviews done but nothing learned or applied',
      day: log({ reviews: 30 }),
      due: 10,
      expected: false,
    },
    {
      name: 'lesson done but reviews outstanding',
      day: log({ reviews: 2, lessons: 3 }),
      due: 10,
      expected: false,
    },
    {
      name: 'nothing due — one lesson is enough',
      day: log({ reviews: 0, lessons: 1 }),
      due: 0,
      expected: true,
    },
    {
      name: 'nothing due and nothing done',
      day: log(),
      due: 0,
      expected: false,
    },
  ]

  it.each(cases)('$name → $expected', ({ day, due, expected }) => {
    expect(isGoalMet(day, due)).toBe(expected)
  })
})

describe('recordGoalMet', () => {
  it('starts a streak at 1 on the first ever day', () => {
    const s = recordGoalMet(newStreakState(), D1)
    expect(s.current).toBe(1)
    expect(s.longest).toBe(1)
    expect(s.lastActiveDate).toBe(D1)
    expect(s.daysTowardFreeze).toBe(1)
  })

  it('advances the streak on the next day', () => {
    const day1 = recordGoalMet(newStreakState(), D1)
    const day2 = recordGoalMet(day1, addDays(D1, 1))
    expect(day2.current).toBe(2)
    expect(day2.lastActiveDate).toBe(addDays(D1, 1))
  })

  it('is idempotent within the same day', () => {
    const once = recordGoalMet(streak({ current: 4, longest: 9, lastActiveDate: D1 }), D1)
    expect(once.current).toBe(4)
    const twice = recordGoalMet(once, D1)
    expect(twice).toBe(once)
  })

  it('consumes a freeze to bridge exactly one missed day', () => {
    const before = streak({ current: 9, longest: 9, lastActiveDate: D1, freezes: 1, daysTowardFreeze: 2 })
    const after = recordGoalMet(before, addDays(D1, 2))
    expect(after.current).toBe(10)
    expect(after.freezes).toBe(0)
    expect(after.daysTowardFreeze).toBe(3)
  })

  it('resets after one missed day with no freeze banked', () => {
    const before = streak({ current: 9, longest: 9, lastActiveDate: D1, freezes: 0, daysTowardFreeze: 5 })
    const after = recordGoalMet(before, addDays(D1, 2))
    expect(after.current).toBe(1)
    expect(after.freezes).toBe(0)
    expect(after.daysTowardFreeze).toBe(1)
  })

  it.each([3, 4, 10])('resets after a %i-day gap even with freezes banked', (gap) => {
    const before = streak({ current: 40, longest: 40, lastActiveDate: D1, freezes: 2, daysTowardFreeze: 4 })
    const after = recordGoalMet(before, addDays(D1, gap))
    expect(after.current).toBe(1)
    expect(after.freezes).toBe(2) // freezes survive a break, they just can't bridge it
    expect(after.daysTowardFreeze).toBe(1)
  })

  it('tracks the longest streak across a reset', () => {
    const before = streak({ current: 40, longest: 40, lastActiveDate: D1 })
    const after = recordGoalMet(before, addDays(D1, 5))
    expect(after.current).toBe(1)
    expect(after.longest).toBe(40)
  })

  it('ignores a date earlier than the last active day', () => {
    const before = streak({ current: 3, longest: 3, lastActiveDate: D1 })
    expect(recordGoalMet(before, '2026-02-25')).toBe(before)
  })

  it('does not mutate its input', () => {
    const before = streak({ current: 3, longest: 3, lastActiveDate: D1 })
    const snapshot = { ...before }
    recordGoalMet(before, addDays(D1, 1))
    expect(before).toEqual(snapshot)
  })
})

describe('freeze earning', () => {
  it('awards a freeze after 7 kept days and resets the counter', () => {
    const six = runDays(DAYS_PER_FREEZE - 1)
    expect(six.freezes).toBe(0)
    expect(six.daysTowardFreeze).toBe(6)

    const seven = runDays(DAYS_PER_FREEZE)
    expect(seven.current).toBe(7)
    expect(seven.freezes).toBe(1)
    expect(seven.daysTowardFreeze).toBe(0)
  })

  it('awards a second freeze after 14 days', () => {
    const s = runDays(14)
    expect(s.current).toBe(14)
    expect(s.freezes).toBe(2)
  })

  it('caps the freeze bank at 2', () => {
    const s = runDays(40)
    expect(s.current).toBe(40)
    expect(s.longest).toBe(40)
    expect(s.freezes).toBe(MAX_FREEZES)
  })

  it('counts a freeze-bridged day toward the next freeze', () => {
    // 6 kept days, then a gap bridged by a freeze → 7th kept day earns one back.
    const six = runDays(6, streak({ freezes: 1 }))
    expect(six.daysTowardFreeze).toBe(6)
    const bridged = recordGoalMet(six, addDays(D1, 6 - 1 + 2))
    expect(bridged.current).toBe(7)
    expect(bridged.daysTowardFreeze).toBe(0)
    expect(bridged.freezes).toBe(1) // one spent, one earned
  })

  it('restarts the freeze counter when the streak breaks', () => {
    const five = runDays(5)
    expect(five.daysTowardFreeze).toBe(5)
    const broken = recordGoalMet(five, addDays(D1, 5 - 1 + 4))
    expect(broken.current).toBe(1)
    expect(broken.daysTowardFreeze).toBe(1)
  })
})
