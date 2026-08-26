import { describe, expect, it } from 'vitest'
import { ALL_LESSONS } from '@content/units'
import { newCardState } from '@core/srs/sm2'
import type {
  CardId,
  CardState,
  DayLog,
  DrillHistory,
  GameState,
  ProgressState,
} from '@core/types'
import type { Pace } from '@core/settings'
import {
  buildSessionPlan,
  isStepDone,
  livePlan,
  pendingIndex,
  pendingStep,
  sessionEstimateMinutes,
  stepLabel,
  stepRoute,
  stepShortLabel,
} from '@state/session'
import type { SessionInput } from '@state/session'

const TODAY = '2026-03-10'
const L1 = ALL_LESSONS[0]
const L2 = ALL_LESSONS[1]
const L3 = ALL_LESSONS[2]

function day(partial: Partial<DayLog> = {}): DayLog {
  return { reviews: 0, lessons: 0, drills: 0, xp: 0, goalMet: false, ...partial }
}

function game(today: Partial<DayLog> = {}): GameState {
  return {
    xp: 0,
    streak: { current: 0, longest: 0, lastActiveDate: null, freezes: 0, daysTowardFreeze: 0 },
    badges: [],
    dailyLog: { [TODAY]: day(today) },
  }
}

function progressWith(...lessonIds: string[]): ProgressState {
  return {
    completedLessons: Object.fromEntries(lessonIds.map((id) => [id, TODAY])),
    firstTryCorrect: [],
  }
}

/** `n` cards that came due yesterday. */
function dueCards(n: number): Record<CardId, CardState> {
  const out: Record<CardId, CardState> = {}
  for (let i = 0; i < n; i++) {
    const id = `c${String(i).padStart(2, '0')}`
    out[id] = {
      ...newCardState(id, '2026-01-01'),
      reps: 2,
      lastGrade: 4,
      due: '2026-03-09',
    }
  }
  return out
}

function input(over: Partial<SessionInput> = {}): SessionInput {
  return {
    today: TODAY,
    progress: progressWith(),
    srs: {},
    game: game(),
    drillHistory: { results: [] } as DrillHistory,
    pace: 1 as Pace,
    ...over,
  }
}

// ── The plan ─────────────────────────────────────────────────────────────────

describe('buildSessionPlan', () => {
  it('is lesson then drill on a fresh account, with nothing to review yet', () => {
    const plan = buildSessionPlan(input())
    expect(plan.map((s) => s.kind)).toEqual(['lesson', 'drill'])
    expect(plan[0]).toMatchObject({ kind: 'lesson', id: L1.id })
  })

  it('puts due reviews first, and counts them', () => {
    const plan = buildSessionPlan(input({ srs: dueCards(7) }))
    expect(plan.map((s) => s.kind)).toEqual(['review', 'lesson', 'drill'])
    expect(plan[0]).toMatchObject({ kind: 'review', due: 7, target: 7 })
  })

  it('plans one lesson per pace point', () => {
    const two = buildSessionPlan(input({ pace: 2 }))
    expect(two.map((s) => s.kind)).toEqual(['lesson', 'lesson', 'drill'])
    expect(two.map((s) => (s.kind === 'lesson' ? s.id : null))).toEqual([L1.id, L2.id, null])

    const three = buildSessionPlan(input({ pace: 3 }))
    expect(three.filter((s) => s.kind === 'lesson')).toHaveLength(3)
    expect(three[2]).toMatchObject({ kind: 'lesson', id: L3.id })
  })

  it('counts reviews already done today against the target, not the queue', () => {
    // 20 cards cleared this morning, 5 still due. The session's review step is
    // "five more", not "you are already past twenty".
    const plan = buildSessionPlan(
      input({ srs: dueCards(5), game: game({ reviews: 20 }) }),
    )
    expect(plan[0]).toMatchObject({ kind: 'review', due: 5, target: 25 })
  })

  it('respects the raised review cap at pace 3', () => {
    const plan = buildSessionPlan(input({ srs: dueCards(60), pace: 3 }))
    expect(plan[0]).toMatchObject({ kind: 'review', due: 50 })
  })

  // ── Mid-day restart ──

  it('skips a lesson already done today', () => {
    const plan = buildSessionPlan(
      input({ pace: 2, progress: progressWith(L1.id), game: game({ lessons: 1 }) }),
    )
    expect(plan.map((s) => s.kind)).toEqual(['lesson', 'drill'])
    expect(plan[0]).toMatchObject({ kind: 'lesson', id: L2.id })
  })

  it('skips the drill once it has been answered', () => {
    const plan = buildSessionPlan(
      input({
        drillHistory: { results: [{ drillId: 'd1', kind: 'pattern', date: TODAY, correct: true, score: 10 }] },
      }),
    )
    expect(plan.map((s) => s.kind)).toEqual(['lesson'])
  })

  it('is empty when the whole day is already done', () => {
    const plan = buildSessionPlan(
      input({
        progress: progressWith(L1.id),
        game: game({ lessons: 1, reviews: 4 }),
        drillHistory: { results: [{ drillId: 'd1', kind: 'pattern', date: TODAY, correct: true, score: 10 }] },
      }),
    )
    expect(plan).toEqual([])
  })

  it('offers no lesson steps once every authored lesson is complete', () => {
    const plan = buildSessionPlan(input({ pace: 3, progress: progressWith(...ALL_LESSONS.map((l) => l.id)) }))
    expect(plan.map((s) => s.kind)).toEqual(['drill'])
  })

  it('does not run off the end of the curriculum at pace 3', () => {
    const allButTwo = ALL_LESSONS.slice(0, ALL_LESSONS.length - 2).map((l) => l.id)
    const plan = buildSessionPlan(input({ pace: 3, progress: progressWith(...allButTwo) }))
    expect(plan.filter((s) => s.kind === 'lesson')).toHaveLength(2)
  })
})

// ── Doneness, which is where "no cursor" pays off ────────────────────────────

describe('isStepDone', () => {
  it('ticks the review step at its target', () => {
    const step = buildSessionPlan(input({ srs: dueCards(5) }))[0]
    expect(isStepDone(step, input({ srs: dueCards(5) }))).toBe(false)
    // Graded all five: the cards are no longer due *and* the count is met.
    expect(isStepDone(step, input({ srs: {}, game: game({ reviews: 5 }) }))).toBe(true)
  })

  it('ticks the review step when the queue empties early', () => {
    const step = buildSessionPlan(input({ srs: dueCards(5) }))[0]
    expect(isStepDone(step, input({ srs: {} }))).toBe(true)
  })

  it('does not tick a review step off this morning’s reviews', () => {
    const step = buildSessionPlan(input({ srs: dueCards(5), game: game({ reviews: 20 }) }))[0]
    expect(isStepDone(step, input({ srs: dueCards(5), game: game({ reviews: 20 }) }))).toBe(false)
  })

  it('ticks a lesson step from progress, however the lesson was reached', () => {
    const step = buildSessionPlan(input())[0]
    expect(isStepDone(step, input())).toBe(false)
    expect(isStepDone(step, input({ progress: progressWith(L1.id) }))).toBe(true)
  })

  it('ticks the drill step from the day’s history', () => {
    const step = { kind: 'drill' } as const
    expect(isStepDone(step, input())).toBe(false)
    expect(
      isStepDone(
        step,
        input({
          drillHistory: {
            results: [{ drillId: 'd1', kind: 'pattern', date: TODAY, correct: false, score: 0 }],
          },
        }),
      ),
    ).toBe(true)
  })
})

describe('pendingStep', () => {
  it('walks the plan in order', () => {
    const plan = buildSessionPlan(input({ pace: 2 }))
    expect(pendingIndex(plan, input({ pace: 2 }))).toBe(0)

    const afterFirst = input({ pace: 2, progress: progressWith(L1.id), game: game({ lessons: 1 }) })
    expect(pendingStep(plan, afterFirst)).toMatchObject({ kind: 'lesson', id: L2.id })
  })

  it('skips a step completed outside the session', () => {
    // Plan built at breakfast; the drill got done on the bus.
    const plan = buildSessionPlan(input({ pace: 1 }))
    const later = input({
      progress: progressWith(L1.id),
      game: game({ lessons: 1 }),
      drillHistory: {
        results: [{ drillId: 'd1', kind: 'pattern', date: TODAY, correct: true, score: 10 }],
      },
    })
    expect(pendingIndex(plan, later)).toBe(-1)
    expect(pendingStep(plan, later)).toBeNull()
  })
})

// ── Cards the session itself minted ──────────────────────────────────────────

describe('livePlan', () => {
  it('appends a review step for cards the lessons just minted', () => {
    // Started with an empty queue, so the plan had no review step at all.
    const plan = buildSessionPlan(input({ pace: 2 }))
    expect(plan.some((s) => s.kind === 'review')).toBe(false)

    // Two lessons later, their cards are due today.
    const after = input({
      pace: 2,
      progress: progressWith(L1.id, L2.id),
      game: game({ lessons: 2 }),
      srs: dueCards(8),
      drillHistory: {
        results: [{ drillId: 'd1', kind: 'pattern', date: TODAY, correct: true, score: 10 }],
      },
    })
    const live = livePlan(plan, after)
    expect(live.map((s) => s.kind)).toEqual(['lesson', 'lesson', 'drill', 'review'])
    expect(pendingStep(live, after)).toMatchObject({ kind: 'review', due: 8 })
  })

  it('does not append while the plan still has a review step to do', () => {
    const plan = buildSessionPlan(input({ srs: dueCards(5) }))
    expect(livePlan(plan, input({ srs: dueCards(5) }))).toEqual(plan)
  })

  it('waits for the last lesson before promising a card count', () => {
    // Lesson one is done and has minted cards; lesson two has not run yet, so
    // any number quoted now would be wrong by the time the queue is reached.
    const plan = buildSessionPlan(input({ pace: 2 }))
    const midway = input({
      pace: 2,
      progress: progressWith(L1.id),
      game: game({ lessons: 1 }),
      srs: dueCards(4),
    })
    expect(livePlan(plan, midway)).toEqual(plan)
  })

  it('appends nothing when there is nothing due', () => {
    const plan = buildSessionPlan(input())
    expect(livePlan(plan, input())).toEqual(plan)
  })

  it('settles: once the appended reviews are done, it stops growing', () => {
    const plan = buildSessionPlan(input({ pace: 1 }))
    const minted = input({
      progress: progressWith(L1.id),
      game: game({ lessons: 1 }),
      srs: dueCards(4),
      drillHistory: {
        results: [{ drillId: 'd1', kind: 'pattern', date: TODAY, correct: true, score: 10 }],
      },
    })
    const once = livePlan(plan, minted)
    expect(once).toHaveLength(3)

    const reviewed = { ...minted, srs: {}, game: game({ lessons: 1, reviews: 4 }) }
    expect(livePlan(once, reviewed)).toEqual(once)
    expect(pendingStep(livePlan(once, reviewed), reviewed)).toBeNull()
  })

  it('leaves an empty plan empty', () => {
    expect(livePlan([], input({ srs: dueCards(3) }))).toEqual([])
  })
})

// ── Copy and estimates ───────────────────────────────────────────────────────

describe('routes and labels', () => {
  it('sends every step to the real screen that already plays it', () => {
    expect(stepRoute({ kind: 'review', due: 3, target: 3 })).toBe('/review')
    expect(stepRoute({ kind: 'lesson', id: L1.id, title: L1.title })).toBe(`/lesson/${L1.id}`)
    expect(stepRoute({ kind: 'drill' })).toBe('/drill')
  })

  it('numbers lessons only when there is more than one', () => {
    const one = buildSessionPlan(input({ pace: 1 }))
    expect(stepShortLabel(one[0], one)).toBe('Lesson')

    const two = buildSessionPlan(input({ pace: 2 }))
    expect(two.filter((s) => s.kind === 'lesson').map((s) => stepShortLabel(s, two))).toEqual([
      'Lesson 1',
      'Lesson 2',
    ])
  })

  it('says what a review step is worth', () => {
    expect(stepLabel({ kind: 'review', due: 1, target: 1 })).toBe('Review 1 card')
    expect(stepLabel({ kind: 'review', due: 9, target: 9 })).toBe('Review 9 cards')
  })
})

describe('sessionEstimateMinutes', () => {
  it('adds up reviews, lessons and the drill', () => {
    // 10 × 0.2 + 2 × 2.5 + 1.5 = 8.5 → 9
    const plan = buildSessionPlan(input({ srs: dueCards(10), pace: 2 }))
    expect(sessionEstimateMinutes(plan)).toBe(9)
  })

  it('never promises zero minutes for real work', () => {
    expect(sessionEstimateMinutes([{ kind: 'review', due: 1, target: 1 }])).toBe(1)
  })

  it('is zero for an empty plan', () => {
    expect(sessionEstimateMinutes([])).toBe(0)
  })
})
