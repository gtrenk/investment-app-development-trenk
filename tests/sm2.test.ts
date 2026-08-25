import { describe, expect, it } from 'vitest'
import { addDays } from '@core/clock'
import { applyGrade, MIN_EASE, newCardState } from '@core/srs/sm2'
import type { CardState, Grade } from '@core/types'

const AGAIN: Grade = 0
const HARD: Grade = 3
const GOOD: Grade = 4
const EASY: Grade = 5

const T0 = '2026-03-01'

function fresh(): CardState {
  return newCardState('u01-l01-c1', T0)
}

/** Replay a list of grades, one per day, starting from a fresh card. */
function replay(grades: Grade[], start = T0): CardState[] {
  let state = fresh()
  const out: CardState[] = []
  let day = start
  for (const g of grades) {
    state = applyGrade(state, g, day)
    out.push(state)
    day = addDays(day, 1)
  }
  return out
}

describe('newCardState', () => {
  it('starts at ease 2.5, unreviewed, due immediately', () => {
    const c = fresh()
    expect(c).toEqual({
      cardId: 'u01-l01-c1',
      ease: 2.5,
      intervalDays: 0,
      reps: 0,
      lapses: 0,
      due: T0,
      introduced: T0,
    })
    expect(c.lastGrade).toBeUndefined()
  })
})

describe('interval progression on repeated Good', () => {
  const cases: { rep: number; interval: number }[] = [
    { rep: 1, interval: 1 },
    { rep: 2, interval: 6 },
    { rep: 3, interval: 15 }, // round(6 × 2.5)
    { rep: 4, interval: 38 }, // round(15 × 2.5)
    { rep: 5, interval: 95 }, // round(38 × 2.5)
  ]

  const states = replay([GOOD, GOOD, GOOD, GOOD, GOOD])

  it.each(cases)('rep $rep → $interval days', ({ rep, interval }) => {
    const s = states[rep - 1]
    expect(s.reps).toBe(rep)
    expect(s.intervalDays).toBe(interval)
  })

  it('leaves ease untouched on Good and never lapses', () => {
    for (const s of states) {
      expect(s.ease).toBeCloseTo(2.5, 10)
      expect(s.lapses).toBe(0)
    }
  })

  it('sets due = review day + interval', () => {
    let day = T0
    for (const s of states) {
      expect(s.due).toBe(addDays(day, s.intervalDays))
      day = addDays(day, 1)
    }
  })
})

describe('ease drift', () => {
  const cases: { name: string; grade: Grade; from: number; to: number }[] = [
    { name: 'Hard drops ease by 0.14', grade: HARD, from: 2.5, to: 2.36 },
    { name: 'Good leaves ease flat', grade: GOOD, from: 2.5, to: 2.5 },
    { name: 'Easy raises ease by 0.10', grade: EASY, from: 2.5, to: 2.6 },
    { name: 'Hard from a lower ease', grade: HARD, from: 1.8, to: 1.66 },
  ]

  it.each(cases)('$name', ({ grade, from, to }) => {
    const state: CardState = { ...fresh(), ease: from, reps: 2, intervalDays: 6 }
    expect(applyGrade(state, grade, T0).ease).toBeCloseTo(to, 6)
  })

  it('never breaches the 1.3 floor, however many Hard grades', () => {
    let state: CardState = { ...fresh(), reps: 5, intervalDays: 30 }
    for (let i = 0; i < 50; i++) {
      state = applyGrade(state, HARD, T0)
      expect(state.ease).toBeGreaterThanOrEqual(MIN_EASE)
    }
    expect(state.ease).toBeCloseTo(MIN_EASE, 10)
  })
})

describe('Easy multiplier', () => {
  it('applies a further ×1.3 to the computed interval', () => {
    // reps 2 → 3: round(6 × 2.5 × 1.3) = round(19.5) = 20
    const state: CardState = { ...fresh(), reps: 2, intervalDays: 6, ease: 2.5 }
    const next = applyGrade(state, EASY, T0)
    expect(next.intervalDays).toBe(20)
    expect(next.ease).toBeCloseTo(2.6, 6)
  })

  it('Easy always schedules at least as far out as Good', () => {
    const state: CardState = { ...fresh(), reps: 4, intervalDays: 20, ease: 2.2 }
    const good = applyGrade(state, GOOD, T0)
    const easy = applyGrade(state, EASY, T0)
    expect(easy.intervalDays).toBeGreaterThan(good.intervalDays)
  })
})

describe('lapses', () => {
  it('resets interval to 1 and bumps lapses without touching ease', () => {
    const mature: CardState = { ...fresh(), reps: 4, intervalDays: 38, ease: 2.36, lapses: 1 }
    const lapsed = applyGrade(mature, AGAIN, T0)
    expect(lapsed.reps).toBe(0)
    expect(lapsed.intervalDays).toBe(1)
    expect(lapsed.lapses).toBe(2)
    expect(lapsed.ease).toBeCloseTo(2.36, 10)
    expect(lapsed.due).toBe(addDays(T0, 1))
    expect(lapsed.lastGrade).toBe(AGAIN)
  })

  it('relearns from the 1 / 6 ladder after a lapse', () => {
    let state = applyGrade({ ...fresh(), reps: 4, intervalDays: 38 }, AGAIN, T0)
    state = applyGrade(state, GOOD, addDays(T0, 1))
    expect(state.intervalDays).toBe(1)
    state = applyGrade(state, GOOD, addDays(T0, 2))
    expect(state.intervalDays).toBe(6)
  })

  it('is pure — the input state is never mutated', () => {
    const before = fresh()
    const snapshot = { ...before }
    applyGrade(before, GOOD, T0)
    expect(before).toEqual(snapshot)
  })
})
