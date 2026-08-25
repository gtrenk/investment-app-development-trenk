// ─── Badges ──────────────────────────────────────────────────────────────────
// Declarative definitions: each badge is a predicate over the lifetime Stats
// snapshot. Evaluated after every XP-earning event; only *newly* earned badges
// come back so the UI can toast them exactly once.

import type { BadgeDef, EarnedBadge, Stats } from '@core/types'

export const BADGES: BadgeDef[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '👣',
    tier: 'bronze',
    test: (s) => s.lessonsCompleted >= 1,
  },
  {
    id: 'bookworm-25',
    name: 'Bookworm',
    description: 'Complete 25 lessons',
    icon: '📗',
    tier: 'bronze',
    test: (s) => s.lessonsCompleted >= 25,
  },
  {
    id: 'bookworm-50',
    name: 'Well Read',
    description: 'Complete 50 lessons',
    icon: '📘',
    tier: 'silver',
    test: (s) => s.lessonsCompleted >= 50,
  },
  {
    id: 'bookworm-100',
    name: 'Library Card',
    description: 'Complete 100 lessons',
    icon: '📚',
    tier: 'gold',
    test: (s) => s.lessonsCompleted >= 100,
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Hit your daily goal 7 days running',
    icon: '🔥',
    tier: 'bronze',
    test: (s) => s.streakLongest >= 7,
  },
  {
    id: 'streak-30',
    name: 'Month of Mastery',
    description: 'Hit your daily goal 30 days running',
    icon: '🌟',
    tier: 'silver',
    test: (s) => s.streakLongest >= 30,
  },
  {
    id: 'streak-100',
    name: 'Centurion',
    description: 'Hit your daily goal 100 days running',
    icon: '💯',
    tier: 'gold',
    test: (s) => s.streakLongest >= 100,
  },
  {
    id: 'first-review',
    name: 'Total Recall',
    description: 'Review your first flashcard',
    icon: '🧠',
    tier: 'bronze',
    test: (s) => s.totalReviews >= 1,
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Review 100 flashcards',
    icon: '🗂️',
    tier: 'bronze',
    test: (s) => s.totalReviews >= 100,
  },
  {
    id: 'card-shark',
    name: 'Card Shark',
    description: 'Review 500 flashcards',
    icon: '🦈',
    tier: 'gold',
    test: (s) => s.totalReviews >= 500,
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Complete your first unit',
    icon: '🎓',
    tier: 'bronze',
    test: (s) => s.unitsCompleted >= 1,
  },
  {
    id: 'quiz-whiz',
    name: 'Quiz Whiz',
    description: 'Reach level 5',
    icon: '⚡',
    tier: 'bronze',
    test: (s) => s.level >= 5,
  },
  {
    id: 'rising-star',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: '✨',
    tier: 'silver',
    test: (s) => s.level >= 10,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Reach level 20',
    icon: '🏅',
    tier: 'gold',
    test: (s) => s.level >= 20,
  },
  {
    id: 'chart-eye',
    name: 'Chart Eye',
    description: 'Answer 50 drills correctly',
    icon: '📈',
    tier: 'silver',
    test: (s) => s.drillsCorrect >= 50,
  },
  {
    id: 'pattern-master',
    name: 'Pattern Master',
    description: 'Answer 250 drills correctly',
    icon: '🎯',
    tier: 'gold',
    test: (s) => s.drillsCorrect >= 250,
  },
  {
    id: 'first-trade',
    name: 'Opening Bell',
    description: 'Place your first paper trade',
    icon: '🔔',
    tier: 'bronze',
    test: (s) => s.tradesPlaced >= 1,
  },
  {
    id: 'graduate',
    name: 'Graduate',
    description: 'Complete every unit in the curriculum',
    icon: '👑',
    tier: 'gold',
    test: (s) => s.totalUnits > 0 && s.unitsCompleted >= s.totalUnits,
  },
]

/** Look up a definition by id (undefined for unknown ids). */
export function badgeById(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id)
}

/**
 * Evaluate every badge against the current stats and return ONLY the ones that
 * were not already earned. Callers append the result to GameState.badges — so
 * a badge fires exactly once, no matter how often this runs.
 */
export function evaluateBadges(stats: Stats, earned: EarnedBadge[], today: string): EarnedBadge[] {
  const have = new Set(earned.map((e) => e.id))
  const fresh: EarnedBadge[] = []
  for (const def of BADGES) {
    if (have.has(def.id)) continue
    if (def.test(stats)) fresh.push({ id: def.id, earnedAt: today })
  }
  return fresh
}
