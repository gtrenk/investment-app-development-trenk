import { describe, expect, it } from 'vitest'
import {
  BASE_LEVEL_XP,
  LEVEL_XP_STEP,
  levelFor,
  levelProgress,
  totalXpForLevel,
  XP_DRILL,
  XP_DRILL_CORRECT_BONUS,
  XP_JOURNAL_NOTE,
  XP_LESSON,
  XP_PER_CARD,
  XP_QUIZ_ITEM,
  XP_REVIEW_SESSION,
  xpForNextLevel,
  xpIntoLevel,
} from '@core/gamification/xp'

const LEVELS = Array.from({ length: 30 }, (_, i) => i + 1)

describe('award constants', () => {
  it.each([
    ['lesson', XP_LESSON, 20],
    ['quiz item', XP_QUIZ_ITEM, 2],
    ['review session', XP_REVIEW_SESSION, 10],
    ['per card', XP_PER_CARD, 1],
    ['drill', XP_DRILL, 15],
    ['drill correct bonus', XP_DRILL_CORRECT_BONUS, 10],
    ['journal note', XP_JOURNAL_NOTE, 5],
  ])('%s awards %i XP', (_name, actual, expected) => {
    expect(actual).toBe(expected)
  })
})

describe('xpForNextLevel', () => {
  it.each([
    [1, 100],
    [2, 175],
    [3, 250],
    [4, 325],
    [10, 775],
  ])('level %i → %i XP to advance', (level, expected) => {
    expect(xpForNextLevel(level)).toBe(expected)
  })

  it('follows 100 + 75·(L−1) for every level', () => {
    for (const l of LEVELS) {
      expect(xpForNextLevel(l)).toBe(BASE_LEVEL_XP + LEVEL_XP_STEP * (l - 1))
    }
  })

  it('is strictly increasing', () => {
    for (const l of LEVELS.slice(1)) {
      expect(xpForNextLevel(l)).toBeGreaterThan(xpForNextLevel(l - 1))
    }
  })
})

describe('totalXpForLevel', () => {
  it.each([
    [1, 0],
    [2, 100],
    [3, 275],
    [4, 525],
    [5, 850],
  ])('reaching level %i costs %i XP', (level, expected) => {
    expect(totalXpForLevel(level)).toBe(expected)
  })

  it('is the running sum of xpForNextLevel', () => {
    let sum = 0
    for (const l of LEVELS) {
      expect(totalXpForLevel(l)).toBe(sum)
      sum += xpForNextLevel(l)
    }
  })

  it('is strictly increasing', () => {
    for (const l of LEVELS.slice(1)) {
      expect(totalXpForLevel(l)).toBeGreaterThan(totalXpForLevel(l - 1))
    }
  })
})

describe('levelFor', () => {
  it.each([
    [0, 1],
    [1, 1],
    [99, 1],
    [100, 2],
    [274, 2],
    [275, 3],
    [524, 3],
    [525, 4],
  ])('%i XP → level %i', (xp, level) => {
    expect(levelFor(xp)).toBe(level)
  })

  it('clamps negatives and never returns below 1', () => {
    expect(levelFor(-500)).toBe(1)
  })

  it('round-trips with totalXpForLevel for levels 1–30', () => {
    for (const l of LEVELS) {
      expect(levelFor(totalXpForLevel(l))).toBe(l)
      if (l > 1) expect(levelFor(totalXpForLevel(l) - 1)).toBe(l - 1)
      expect(levelFor(totalXpForLevel(l) + xpForNextLevel(l) - 1)).toBe(l)
    }
  })

  it('is monotonic across a dense XP sweep', () => {
    let prev = 1
    for (let xp = 0; xp <= totalXpForLevel(31); xp += 7) {
      const l = levelFor(xp)
      expect(l).toBeGreaterThanOrEqual(prev)
      prev = l
    }
  })
})

describe('xpIntoLevel', () => {
  it('is 0 at every level boundary', () => {
    for (const l of LEVELS) {
      expect(xpIntoLevel(totalXpForLevel(l))).toBe(0)
    }
  })

  it('stays within the current level requirement', () => {
    for (let xp = 0; xp <= 20_000; xp += 13) {
      const l = levelFor(xp)
      const into = xpIntoLevel(xp)
      expect(into).toBeGreaterThanOrEqual(0)
      expect(into).toBeLessThan(xpForNextLevel(l))
      expect(totalXpForLevel(l) + into).toBe(xp)
    }
  })
})

describe('levelProgress', () => {
  it('runs from 0 (inclusive) to 1 (exclusive)', () => {
    expect(levelProgress(totalXpForLevel(4))).toBe(0)
    const p = levelProgress(totalXpForLevel(4) + 100)
    expect(p).toBeGreaterThan(0)
    expect(p).toBeLessThan(1)
  })
})
