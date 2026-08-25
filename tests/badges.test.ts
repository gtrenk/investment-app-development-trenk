import { describe, expect, it } from 'vitest'
import { badgeById, BADGES, evaluateBadges } from '@core/gamification/badges'
import type { EarnedBadge, Stats } from '@core/types'

const TODAY = '2026-03-01'

const ZERO: Stats = {
  totalXp: 0,
  level: 1,
  lessonsCompleted: 0,
  unitsCompleted: 0,
  totalUnits: 14,
  totalReviews: 0,
  streakCurrent: 0,
  streakLongest: 0,
  drillsCorrect: 0,
  tradesPlaced: 0,
}

function stats(partial: Partial<Stats> = {}): Stats {
  return { ...ZERO, ...partial }
}

function ids(earned: EarnedBadge[]): string[] {
  return earned.map((e) => e.id).sort()
}

describe('badge definitions', () => {
  it('has at least 15 badges with unique ids', () => {
    expect(BADGES.length).toBeGreaterThanOrEqual(15)
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length)
  })

  it('gives every badge a name, description, icon and tier', () => {
    for (const b of BADGES) {
      expect(b.name.length).toBeGreaterThan(0)
      expect(b.description.length).toBeGreaterThan(0)
      expect(b.icon.length).toBeGreaterThan(0)
      expect(['bronze', 'silver', 'gold']).toContain(b.tier)
    }
  })

  it('awards nothing to a brand-new profile', () => {
    expect(evaluateBadges(ZERO, [], TODAY)).toEqual([])
  })

  it('looks badges up by id', () => {
    expect(badgeById('first-steps')?.name).toBe('First Steps')
    expect(badgeById('nope')).toBeUndefined()
  })
})

describe('thresholds', () => {
  const cases: { id: string; below: Partial<Stats>; at: Partial<Stats> }[] = [
    { id: 'first-steps', below: {}, at: { lessonsCompleted: 1 } },
    { id: 'bookworm-25', below: { lessonsCompleted: 24 }, at: { lessonsCompleted: 25 } },
    { id: 'bookworm-50', below: { lessonsCompleted: 49 }, at: { lessonsCompleted: 50 } },
    { id: 'bookworm-100', below: { lessonsCompleted: 99 }, at: { lessonsCompleted: 100 } },
    { id: 'streak-7', below: { streakLongest: 6 }, at: { streakLongest: 7 } },
    { id: 'streak-30', below: { streakLongest: 29 }, at: { streakLongest: 30 } },
    { id: 'streak-100', below: { streakLongest: 99 }, at: { streakLongest: 100 } },
    { id: 'first-review', below: {}, at: { totalReviews: 1 } },
    { id: 'century-club', below: { totalReviews: 99 }, at: { totalReviews: 100 } },
    { id: 'card-shark', below: { totalReviews: 499 }, at: { totalReviews: 500 } },
    { id: 'scholar', below: { unitsCompleted: 0 }, at: { unitsCompleted: 1 } },
    { id: 'quiz-whiz', below: { level: 4 }, at: { level: 5 } },
    { id: 'rising-star', below: { level: 9 }, at: { level: 10 } },
    { id: 'dedicated', below: { level: 19 }, at: { level: 20 } },
    { id: 'chart-eye', below: { drillsCorrect: 49 }, at: { drillsCorrect: 50 } },
    { id: 'pattern-master', below: { drillsCorrect: 249 }, at: { drillsCorrect: 250 } },
    { id: 'first-trade', below: {}, at: { tradesPlaced: 1 } },
    {
      id: 'graduate',
      below: { unitsCompleted: 13, totalUnits: 14 },
      at: { unitsCompleted: 14, totalUnits: 14 },
    },
  ]

  it.each(cases)('$id is not earned one short of the threshold', ({ id, below }) => {
    expect(ids(evaluateBadges(stats(below), [], TODAY))).not.toContain(id)
  })

  it.each(cases)('$id is earned at the threshold', ({ id, at }) => {
    expect(ids(evaluateBadges(stats(at), [], TODAY))).toContain(id)
  })

  it('covers every defined badge with a threshold case', () => {
    expect(new Set(cases.map((c) => c.id))).toEqual(new Set(BADGES.map((b) => b.id)))
  })
})

describe('evaluateBadges', () => {
  it('returns only newly earned badges and stamps today', () => {
    const s = stats({ lessonsCompleted: 30, totalReviews: 1 })
    const first = evaluateBadges(s, [], TODAY)
    expect(ids(first)).toEqual(['bookworm-25', 'first-review', 'first-steps'])
    for (const b of first) expect(b.earnedAt).toBe(TODAY)
  })

  it('does not re-award badges already earned', () => {
    const s = stats({ lessonsCompleted: 30, totalReviews: 1 })
    const first = evaluateBadges(s, [], TODAY)
    expect(evaluateBadges(s, first, '2026-03-02')).toEqual([])
  })

  it('awards only the newly crossed tier on a later evaluation', () => {
    const early = stats({ lessonsCompleted: 25 })
    const earned = evaluateBadges(early, [], TODAY)
    const later = stats({ lessonsCompleted: 50 })
    expect(ids(evaluateBadges(later, earned, '2026-04-01'))).toEqual(['bookworm-50'])
  })

  it('fires each badge exactly once across a long ramp', () => {
    let earned: EarnedBadge[] = []
    const seen: string[] = []
    for (let lessons = 0; lessons <= 120; lessons++) {
      const fresh = evaluateBadges(stats({ lessonsCompleted: lessons }), earned, TODAY)
      seen.push(...fresh.map((b) => b.id))
      earned = [...earned, ...fresh]
    }
    expect(seen).toEqual(['first-steps', 'bookworm-25', 'bookworm-50', 'bookworm-100'])
    expect(new Set(seen).size).toBe(seen.length)
  })

  it('never mutates the earned list it is handed', () => {
    const earned: EarnedBadge[] = [{ id: 'first-steps', earnedAt: TODAY }]
    evaluateBadges(stats({ lessonsCompleted: 60 }), earned, TODAY)
    expect(earned).toHaveLength(1)
  })
})
