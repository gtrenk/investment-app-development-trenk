// ─── The one store ───────────────────────────────────────────────────────────
// Glue only: it wires the pure engines in core/ to the StorageAdapter and hands
// plain data to the UI. No business rules live here that core/ could own.

import { create } from 'zustand'
import type { Clock } from '@core/clock'
import { systemClock } from '@core/clock'
import type {
  CardId,
  CardState,
  DayLog,
  DrillHistory,
  DrillResult,
  EarnedBadge,
  GameState,
  Grade,
  LessonId,
  ProgressState,
  Stats,
} from '@core/types'
import { newCardState, applyGrade } from '@core/srs/sm2'
import { buildQueue } from '@core/srs/scheduler'
import {
  XP_DRILL,
  XP_DRILL_CORRECT_BONUS,
  XP_LESSON,
  XP_PER_CARD,
  XP_QUIZ_ITEM,
  XP_REVIEW_SESSION,
  levelFor,
} from '@core/gamification/xp'
import { isGoalMet, newStreakState, recordGoalMet } from '@core/gamification/streak'
import { evaluateBadges } from '@core/gamification/badges'
import { STORAGE_KEYS, createMemoryStorage } from '@core/storage/adapter'
import type { StorageAdapter } from '@core/storage/adapter'
import { idbStorage } from '@platform/idbStorage'
import { ALL_UNITS, getLesson } from '@content/units'

// ── Test clock override ──────────────────────────────────────────────────────
// Playwright injects `window.__TEST_CLOCK__` to simulate other days without
// touching the machine clock. Read lazily so a spec can advance the date
// mid-session.
declare global {
  interface Window {
    __TEST_CLOCK__?: { today?: string; now?: string }
  }
}

export const appClock: Clock = {
  today: () =>
    (typeof window !== 'undefined' && window.__TEST_CLOCK__?.today) || systemClock.today(),
  now: () => (typeof window !== 'undefined' && window.__TEST_CLOCK__?.now) || systemClock.now(),
}

/**
 * Units planned for the finished curriculum (only two are authored so far).
 * Badge predicates such as "Graduate" compare against the whole curriculum, so
 * finishing the two shipped units must not hand out the gold crown.
 */
export const CURRICULUM_TOTAL_UNITS = 14

// ── Celebrations ─────────────────────────────────────────────────────────────

export type Celebration =
  | { id: string; kind: 'level-up'; level: number }
  | { id: string; kind: 'badge'; badgeId: string }
  | { id: string; kind: 'goal-met'; streak: number }

let celebrationSeq = 0
const celebrationId = () => `c${++celebrationSeq}`

// ── Empty state ──────────────────────────────────────────────────────────────

export function emptyProgress(): ProgressState {
  return { completedLessons: {}, firstTryCorrect: [] }
}

export function emptyGame(): GameState {
  return { xp: 0, streak: newStreakState(), badges: [], dailyLog: {} }
}

export function emptyDay(): DayLog {
  return { reviews: 0, lessons: 0, drills: 0, xp: 0, goalMet: false }
}

export function emptyDrills(): DrillHistory {
  return { results: [] }
}

function dayOf(game: GameState, date: string): DayLog {
  return game.dailyLog[date] ?? emptyDay()
}

// ── Derived stats ────────────────────────────────────────────────────────────

function countUnitsCompleted(progress: ProgressState): number {
  return ALL_UNITS.filter(
    (u) => u.lessons.length > 0 && u.lessons.every((l) => progress.completedLessons[l.id]),
  ).length
}

function totalReviewsIn(game: GameState): number {
  return Object.values(game.dailyLog).reduce((sum, d) => sum + d.reviews, 0)
}

export function statsSnapshot(
  progress: ProgressState,
  game: GameState,
  drills: DrillHistory = emptyDrills(),
): Stats {
  return {
    totalXp: game.xp,
    level: levelFor(game.xp),
    lessonsCompleted: Object.keys(progress.completedLessons).length,
    unitsCompleted: countUnitsCompleted(progress),
    totalUnits: CURRICULUM_TOTAL_UNITS,
    totalReviews: totalReviewsIn(game),
    streakCurrent: game.streak.current,
    streakLongest: game.streak.longest,
    drillsCorrect: drills.results.filter((r) => r.correct).length,
    tradesPlaced: 0, // Phase 3
  }
}

// ── Pure transition helpers ──────────────────────────────────────────────────

/** Add XP, roll the day log, and queue a level-up celebration when one happens. */
function awardXp(game: GameState, amount: number, today: string, out: Celebration[]): GameState {
  if (amount <= 0) return game
  const before = levelFor(game.xp)
  const xp = game.xp + amount
  const after = levelFor(xp)
  const day = dayOf(game, today)
  const next: GameState = {
    ...game,
    xp,
    dailyLog: { ...game.dailyLog, [today]: { ...day, xp: day.xp + amount } },
  }
  for (let l = before + 1; l <= after; l++) {
    out.push({ id: celebrationId(), kind: 'level-up', level: l })
  }
  return next
}

/**
 * After any XP-earning action: check whether today's goal has just been met
 * (first time only) and evaluate the badge set. Both are idempotent.
 */
function settle(
  progress: ProgressState,
  srs: Record<CardId, CardState>,
  drills: DrillHistory,
  game: GameState,
  today: string,
  out: Celebration[],
): GameState {
  let next = game
  const day = dayOf(next, today)

  if (!day.goalMet) {
    const queue = buildQueue(srs, today)
    const dueCount = queue.due.length + queue.newCards.length
    if (isGoalMet(day, dueCount)) {
      const streak = recordGoalMet(next.streak, today)
      next = {
        ...next,
        streak,
        dailyLog: { ...next.dailyLog, [today]: { ...day, goalMet: true } },
      }
      out.push({ id: celebrationId(), kind: 'goal-met', streak: streak.current })
    }
  }

  const fresh: EarnedBadge[] = evaluateBadges(
    statsSnapshot(progress, next, drills),
    next.badges,
    today,
  )
  if (fresh.length > 0) {
    next = { ...next, badges: [...next.badges, ...fresh] }
    for (const b of fresh) out.push({ id: celebrationId(), kind: 'badge', badgeId: b.id })
  }
  return next
}

// ── Store ────────────────────────────────────────────────────────────────────

function pickStorage(): StorageAdapter {
  try {
    if (typeof indexedDB !== 'undefined') return idbStorage
  } catch {
    /* private mode / blocked storage — fall through */
  }
  return createMemoryStorage()
}

export interface AppState {
  ready: boolean
  progress: ProgressState
  srs: Record<CardId, CardState>
  game: GameState
  drillHistory: DrillHistory
  pendingCelebrations: Celebration[]

  hydrate: () => Promise<void>
  completeLesson: (lessonId: LessonId) => void
  answerQuiz: (itemId: string, correctFirstTry: boolean) => void
  gradeCard: (cardId: CardId, grade: Grade) => void
  finishReviewSession: (cardCount: number) => void
  recordDrillResult: (result: DrillResult) => void
  dismissCelebration: () => void
  resetAll: () => Promise<void>
}

const storage = pickStorage()

/** Fire-and-forget write-behind: the UI never waits on persistence. */
function persist(s: Pick<AppState, 'progress' | 'srs' | 'game' | 'drillHistory'>): void {
  void storage.set(STORAGE_KEYS.progress, s.progress)
  void storage.set(STORAGE_KEYS.srs, s.srs)
  void storage.set(STORAGE_KEYS.game, s.game)
  void storage.set(STORAGE_KEYS.drills, s.drillHistory)
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  progress: emptyProgress(),
  srs: {},
  game: emptyGame(),
  drillHistory: emptyDrills(),
  pendingCelebrations: [],

  async hydrate() {
    if (get().ready) return
    const [progress, srs, game, drills] = await Promise.all([
      storage.get<ProgressState>(STORAGE_KEYS.progress),
      storage.get<Record<CardId, CardState>>(STORAGE_KEYS.srs),
      storage.get<GameState>(STORAGE_KEYS.game),
      storage.get<DrillHistory>(STORAGE_KEYS.drills),
    ])
    set({
      progress: { ...emptyProgress(), ...(progress ?? {}) },
      srs: srs ?? {},
      game: { ...emptyGame(), ...(game ?? {}) },
      drillHistory: { results: drills?.results ?? [] },
      ready: true,
    })
  },

  completeLesson(lessonId) {
    const lesson = getLesson(lessonId)
    if (!lesson) return
    const state = get()
    if (state.progress.completedLessons[lessonId]) return // already done — no double XP

    const today = appClock.today()
    const out: Celebration[] = []

    const progress: ProgressState = {
      ...state.progress,
      completedLessons: { ...state.progress.completedLessons, [lessonId]: today },
    }

    // Mint the lesson's cards (never overwrite one already in rotation).
    const srs = { ...state.srs }
    for (const seed of lesson.cardSeeds) {
      if (!srs[seed.id]) srs[seed.id] = newCardState(seed.id, today)
    }

    const day = dayOf(state.game, today)
    let game: GameState = {
      ...state.game,
      dailyLog: { ...state.game.dailyLog, [today]: { ...day, lessons: day.lessons + 1 } },
    }
    game = awardXp(game, XP_LESSON, today, out)
    game = settle(progress, srs, state.drillHistory, game, today, out)

    const next = { progress, srs, game, drillHistory: state.drillHistory }
    set({ ...next, pendingCelebrations: [...state.pendingCelebrations, ...out] })
    persist(next)
  },

  answerQuiz(itemId, correctFirstTry) {
    const state = get()
    if (!correctFirstTry) return
    if (state.progress.firstTryCorrect.includes(itemId)) return // XP once per item, ever

    const today = appClock.today()
    const out: Celebration[] = []
    const progress: ProgressState = {
      ...state.progress,
      firstTryCorrect: [...state.progress.firstTryCorrect, itemId],
    }
    let game = awardXp(state.game, XP_QUIZ_ITEM, today, out)
    game = settle(progress, state.srs, state.drillHistory, game, today, out)

    const next = { progress, srs: state.srs, game, drillHistory: state.drillHistory }
    set({ ...next, pendingCelebrations: [...state.pendingCelebrations, ...out] })
    persist(next)
  },

  gradeCard(cardId, grade) {
    const state = get()
    const today = appClock.today()
    const existing = state.srs[cardId] ?? newCardState(cardId, today)
    const srs = { ...state.srs, [cardId]: applyGrade(existing, grade, today) }

    const day = dayOf(state.game, today)
    const game: GameState = {
      ...state.game,
      dailyLog: { ...state.game.dailyLog, [today]: { ...day, reviews: day.reviews + 1 } },
    }

    const next = { progress: state.progress, srs, game, drillHistory: state.drillHistory }
    set(next)
    persist(next)
  },

  finishReviewSession(cardCount) {
    const state = get()
    if (cardCount <= 0) return
    const today = appClock.today()
    const out: Celebration[] = []

    let game = awardXp(
      state.game,
      XP_REVIEW_SESSION + XP_PER_CARD * cardCount,
      today,
      out,
    )
    game = settle(state.progress, state.srs, state.drillHistory, game, today, out)

    const next = { progress: state.progress, srs: state.srs, game, drillHistory: state.drillHistory }
    set({ ...next, pendingCelebrations: [...state.pendingCelebrations, ...out] })
    persist(next)
  },

  /**
   * Record one answered drill: append it to the history, count it against
   * today's activity, award XP, and run the same goal/badge settle path every
   * other action uses.
   *
   * Idempotent per (drillId, date) so a double-tap or a StrictMode double
   * invoke cannot pay out twice. Note the XP is *flat* — the signed drill score
   * (which can be −5 for a confident miss) lives in the history, but XP is a
   * lifetime counter that must never go backwards.
   */
  recordDrillResult(result) {
    const state = get()
    const already = state.drillHistory.results.some(
      (r) => r.drillId === result.drillId && r.date === result.date,
    )
    if (already) return

    const today = result.date
    const out: Celebration[] = []
    const drillHistory: DrillHistory = { results: [...state.drillHistory.results, result] }

    const day = dayOf(state.game, today)
    let game: GameState = {
      ...state.game,
      dailyLog: { ...state.game.dailyLog, [today]: { ...day, drills: day.drills + 1 } },
    }
    game = awardXp(game, XP_DRILL + (result.correct ? XP_DRILL_CORRECT_BONUS : 0), today, out)
    game = settle(state.progress, state.srs, drillHistory, game, today, out)

    const next = { progress: state.progress, srs: state.srs, game, drillHistory }
    set({ ...next, pendingCelebrations: [...state.pendingCelebrations, ...out] })
    persist(next)
  },

  dismissCelebration() {
    set((s) => ({ pendingCelebrations: s.pendingCelebrations.slice(1) }))
  },

  async resetAll() {
    const next = { progress: emptyProgress(), srs: {}, game: emptyGame(), drillHistory: emptyDrills() }
    set({ ...next, pendingCelebrations: [] })
    await Promise.all([
      storage.del(STORAGE_KEYS.progress),
      storage.del(STORAGE_KEYS.srs),
      storage.del(STORAGE_KEYS.game),
      storage.del(STORAGE_KEYS.drills),
    ])
  },
}))
