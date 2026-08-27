// ─── The one store ───────────────────────────────────────────────────────────
// Glue only: it wires the pure engines in core/ to the StorageAdapter and hands
// plain data to the UI. No business rules live here that core/ could own.

import { create } from 'zustand'
import { appClock } from './clock'
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
  OhlcvSeries,
  PortfolioState,
  ProgressState,
  Stats,
  Transaction,
} from '@core/types'
import { newCardState, applyGrade } from '@core/srs/sm2'
import { buildQueue, queueOptsForPace } from '@core/srs/scheduler'
import {
  XP_DRILL,
  XP_DRILL_CORRECT_BONUS,
  XP_JOURNAL_NOTE,
  XP_LESSON,
  XP_PER_CARD,
  XP_QUIZ_ITEM,
  XP_REVIEW_SESSION,
  levelFor,
} from '@core/gamification/xp'
import { emptyWeakSpots, recordMiss, resolveMiss, sanitizeWeakSpots } from '@core/weakspots/bank'
import type { WeakSpotsState } from '@core/weakspots/bank'
import { resolveAward } from '@core/weakspots/session'
import { emptyPlacementRecord, sanitizePlacementRecord } from '@core/placement/record'
import type { PlacementRecord } from '@core/placement/record'
import { creditPlacement } from '@core/placement/apply'
import type { PlacementOutcome } from '@core/placement/engine'
import {
  executeBuy,
  executeSell,
  isTradeError,
  newPortfolio,
  portfolioEquity,
} from '@core/portfolio/engine'
import type { PriceMap, TradeErrorCode } from '@core/portfolio/engine'
import {
  appendSnapshot,
  backfillSnapshots,
  benchmarkEquity,
  initBenchmark,
} from '@core/portfolio/benchmark'
import {
  cancelOrder,
  evaluateLimitOrders,
  limitOrderIssue,
  newLimitOrder,
} from '@core/portfolio/limitOrders'
import type { LimitOrder, SeriesMap } from '@core/portfolio/limitOrders'
import { isGoalMet, lessonGoalFor, newStreakState, recordGoalMet } from '@core/gamification/streak'
import { evaluateBadges } from '@core/gamification/badges'
import { STORAGE_KEYS, createMemoryStorage } from '@core/storage/adapter'
import type { StorageAdapter } from '@core/storage/adapter'
import { defaultSettings, sanitizeSettings } from '@core/settings'
import type { Pace, ReadAloudSettings, Settings } from '@core/settings'
import { activeProfileStorage } from './profiles'
import { emptyDay } from './selectors'
import { ALL_LESSONS, ALL_UNITS, getLesson } from '@content/units'

// The clock (and its Playwright override) lives in its own module so the
// profile boot path can share it without importing the store. Re-exported
// because every screen already imports it from here.
export { appClock } from './clock'

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

export function emptyDrills(): DrillHistory {
  return { results: [] }
}

// Re-exported from its new home in ./selectors, which every screen already
// imports and which — unlike this module — is safe to load outside a browser.
export { emptyDay }

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

/**
 * Trades the learner has *placed* — buys only.
 *
 * A sale is the closing half of a decision already counted, so counting both
 * legs would hand out the "first trade" badge twice as fast as it reads.
 */
export function tradesPlacedIn(portfolio: PortfolioState): number {
  return portfolio.transactions.filter((t) => t.side === 'buy').length
}

export function statsSnapshot(
  progress: ProgressState,
  game: GameState,
  drills: DrillHistory = emptyDrills(),
  portfolio: PortfolioState = newPortfolio(),
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
    tradesPlaced: tradesPlacedIn(portfolio),
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
 *
 * `pace` is threaded in rather than read from the store so this stays a pure
 * function of what the caller has already got in hand — and so the one place
 * that decides "is the day done?" is the one place pace has to be applied.
 */
function settle(
  progress: ProgressState,
  srs: Record<CardId, CardState>,
  drills: DrillHistory,
  portfolio: PortfolioState,
  game: GameState,
  today: string,
  out: Celebration[],
  pace: Pace,
): GameState {
  let next = game
  const day = dayOf(next, today)

  if (!day.goalMet) {
    const queue = buildQueue(srs, today, queueOptsForPace(pace))
    const dueCount = queue.due.length + queue.newCards.length
    const remaining = Math.max(0, ALL_LESSONS.length - Object.keys(progress.completedLessons).length)
    if (isGoalMet(day, dueCount, lessonGoalFor(pace, remaining))) {
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
    statsSnapshot(progress, next, drills, portfolio),
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

// ── Paper trading ────────────────────────────────────────────────────────────

export interface TradeRequest {
  symbol: string
  side: 'buy' | 'sell'
  qty: number
  /** The price the confirm screen showed — the fill is always at what was seen. */
  price: number
  note?: string
  /**
   * ISO timestamp of the fill. Market orders leave this out and get "now"; a
   * limit order that filled three weeks ago passes the date of the bar that
   * filled it, so the history reads as what actually happened.
   */
  at?: string
  /**
   * The app wrote this trade, not the learner. Suppresses the journal-note XP:
   * "Limit order fill" is bookkeeping, and paying 5 XP for it would turn a
   * resting order into an XP faucet.
   */
  automated?: boolean
}

/** What the Trade screen sends when it rests an order instead of filling one. */
export interface LimitOrderRequest {
  symbol: string
  side: 'buy' | 'sell'
  qty: number
  limitPrice: number
}

export type LimitOrderOutcome =
  | { ok: true; order: LimitOrder }
  | { ok: false; error: string }

/** Note stamped on every transaction that came from a resting order. */
export const LIMIT_FILL_NOTE = 'Limit order fill'

export type TradeOutcome =
  | {
      ok: true
      tx: Transaction
      /** Realized P&L on a sale; undefined for a buy. */
      realized?: number
      /** XP awarded by this trade (the journal-note bonus, or 0). */
      xp: number
    }
  | { ok: false; error: string; code: TradeErrorCode }

export interface AppState {
  ready: boolean
  progress: ProgressState
  srs: Record<CardId, CardState>
  game: GameState
  drillHistory: DrillHistory
  portfolio: PortfolioState
  /**
   * The limit-order book. Resting orders are the ones with `status: 'open'`;
   * filled, cancelled and expired orders stay in the array so a fill can never
   * be replayed twice and the learner can see that an order died unfilled.
   */
  openOrders: LimitOrder[]
  /** Starred symbols, in the order they were starred. */
  watchlist: string[]
  /** Per-profile preferences. Read-aloud lives here; see @core/settings. */
  settings: Settings
  /** What the placement test credited, and whether its offer was dismissed. */
  placement: PlacementRecord
  /** The mistake bank: every quiz item ever missed, and which are still open. */
  weakSpots: WeakSpotsState
  pendingCelebrations: Celebration[]

  /**
   * Read the active profile's state in. Idempotent — a second call is a no-op
   * unless `force` is set, which is how a cloud pull that changed keys under
   * the app gets the screens to show the new values without a page reload.
   */
  hydrate: (force?: boolean) => Promise<void>
  completeLesson: (lessonId: LessonId) => void
  answerQuiz: (itemId: string, correctFirstTry: boolean) => void
  /**
   * Bank one wrong answer. `answerQuiz` calls it for a missed lesson question;
   * the placement test calls it directly (its exam flow has no first-try XP to
   * award), and so does a weak-spot re-ask that goes wrong again.
   */
  recordQuizMiss: (itemId: string) => void
  /** Retire one banked mistake and pay XP_WEAKSPOT — once per fix, ever. */
  resolveWeakSpot: (itemId: string) => void
  gradeCard: (cardId: CardId, grade: Grade) => void
  finishReviewSession: (cardCount: number) => void
  recordDrillResult: (result: DrillResult) => void
  /** Award XP earned outside the store (case studies) and run the usual goal/badge settle. */
  awardCaseXp: (amount: number) => void
  /** Credit the units a placement test passed. Idempotent — see the action. */
  applyPlacement: (outcome: PlacementOutcome) => void
  /** Hide the Home placement offer for good. */
  dismissPlacementOffer: () => void
  placeTrade: (req: TradeRequest) => TradeOutcome
  placeLimitOrder: (req: LimitOrderRequest) => LimitOrderOutcome
  cancelLimitOrder: (id: string) => void
  /** Replay resting orders against bundled bars and fill the ones that crossed. */
  settleLimitOrders: (seriesBySymbol: SeriesMap) => void
  toggleWatchlist: (symbol: string) => void
  ensureBenchmark: (spyPrice: number) => void
  snapshotToday: (prices: PriceMap, spySeries?: OhlcvSeries | null) => void
  dismissCelebration: () => void
  /** Patch the read-aloud preference and save it. Off is the default. */
  setReadAloud: (patch: Partial<ReadAloudSettings>) => void
  /** Set how many lessons a day the goal asks for. 1 is the default. */
  setPace: (pace: Pace) => void
  resetAll: () => Promise<void>
}

/**
 * Where this session persists. Swapped in `hydrate()` for the signed-in
 * profile's namespaced view of the real store — until then it is a throwaway,
 * so a stray write before sign-in can never land in someone else's slot.
 */
let storage: StorageAdapter = createMemoryStorage()

/**
 * Auto-save, one key at a time.
 *
 * There is no dirty buffer and no debounce anywhere in this file: every action
 * that changes state issues its writes in the same synchronous turn as its
 * `set`, so at no point does the app hold unsaved progress that a flush-on-exit
 * hook could rescue. The UI simply does not wait for the write to land.
 *
 * A rejected write is surfaced rather than swallowed — a full disk or a blocked
 * store is exactly the failure this whole scheme exists to notice, and a bare
 * `void promise` would turn it into a silent unhandled rejection.
 */
/**
 * Cloud sync's tap into persistence.
 *
 * Every mutation in this file already funnels through `write()`, so that is the
 * one place a key can be marked dirty without hand-editing twenty actions and
 * forgetting the twenty-first. Registered by src/state/sync.ts at boot; a build
 * with sync off (or a worker not deployed) simply never registers one.
 *
 * A *hook*, not an import, so this module keeps knowing nothing about sync —
 * the dependency runs one way and there is no cycle to reason about.
 */
export type PersistHook = (key: string) => void

let persistHook: PersistHook | null = null

export function onPersist(hook: PersistHook | null): void {
  persistHook = hook
}

function write<T>(key: string, value: T): void {
  void storage.set(key, value).catch((err: unknown) => {
    console.error(`[tickerquest] failed to save ${key}`, err)
  })
  // Outside the promise on purpose: the key is dirty the moment the app decided
  // to change it, whether or not IndexedDB has caught up.
  persistHook?.(key)
}

function persist(s: Pick<AppState, 'progress' | 'srs' | 'game' | 'drillHistory'>): void {
  write(STORAGE_KEYS.progress, s.progress)
  write(STORAGE_KEYS.srs, s.srs)
  write(STORAGE_KEYS.game, s.game)
  write(STORAGE_KEYS.drills, s.drillHistory)
}

/** The portfolio saves on its own key, so a trade never rewrites the whole app. */
function persistPortfolio(portfolio: PortfolioState): void {
  write(STORAGE_KEYS.portfolio, portfolio)
}

function persistOrders(orders: LimitOrder[]): void {
  write(STORAGE_KEYS.orders, orders)
}

function persistWatchlist(watchlist: string[]): void {
  write(STORAGE_KEYS.watchlist, watchlist)
}

/** Sequential order id: `lo-0001`, `lo-0002`, … */
function nextOrderId(orders: LimitOrder[]): string {
  return `lo-${String(orders.length + 1).padStart(4, '0')}`
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  progress: emptyProgress(),
  srs: {},
  game: emptyGame(),
  drillHistory: emptyDrills(),
  portfolio: newPortfolio(),
  openOrders: [],
  watchlist: [],
  settings: defaultSettings(),
  placement: emptyPlacementRecord(),
  weakSpots: emptyWeakSpots(),
  pendingCelebrations: [],

  async hydrate(force = false) {
    if (get().ready && !force) return
    // Point every read and write below at the active profile's namespace. The
    // keys the store asks for never change — only where they land.
    storage = await activeProfileStorage()
    const [progress, srs, game, drills, portfolio, orders, watchlist, settings, placement, weakSpots] =
      await Promise.all([
        storage.get<ProgressState>(STORAGE_KEYS.progress),
        storage.get<Record<CardId, CardState>>(STORAGE_KEYS.srs),
        storage.get<GameState>(STORAGE_KEYS.game),
        storage.get<DrillHistory>(STORAGE_KEYS.drills),
        storage.get<PortfolioState>(STORAGE_KEYS.portfolio),
        storage.get<LimitOrder[]>(STORAGE_KEYS.orders),
        storage.get<string[]>(STORAGE_KEYS.watchlist),
        storage.get<unknown>(STORAGE_KEYS.settings),
        storage.get<unknown>(STORAGE_KEYS.placement),
        storage.get<unknown>(STORAGE_KEYS.weakspots),
      ])
    set({
      progress: { ...emptyProgress(), ...(progress ?? {}) },
      srs: srs ?? {},
      game: { ...emptyGame(), ...(game ?? {}) },
      drillHistory: { results: drills?.results ?? [] },
      // Spread over a fresh portfolio so a record written by an older build is
      // missing fields rather than fatal.
      portfolio: { ...newPortfolio(), ...(portfolio ?? {}) },
      openOrders: Array.isArray(orders) ? orders : [],
      watchlist: Array.isArray(watchlist) ? watchlist.filter((s) => typeof s === 'string') : [],
      settings: sanitizeSettings(settings),
      placement: sanitizePlacementRecord(placement),
      weakSpots: sanitizeWeakSpots(weakSpots),
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
    game = settle(progress, srs, state.drillHistory, state.portfolio, game, today, out, state.settings.pace)

    const next = { progress, srs, game, drillHistory: state.drillHistory }
    set({ ...next, pendingCelebrations: [...state.pendingCelebrations, ...out] })
    persist(next)
  },

  answerQuiz(itemId, correctFirstTry) {
    const state = get()
    // A wrong first try is not "nothing happened" any more: it is the event the
    // mistake bank exists to hear about. Still no XP, and still no settle —
    // missing a question earns neither.
    if (!correctFirstTry) {
      get().recordQuizMiss(itemId)
      return
    }
    if (state.progress.firstTryCorrect.includes(itemId)) return // XP once per item, ever

    const today = appClock.today()
    const out: Celebration[] = []
    const progress: ProgressState = {
      ...state.progress,
      firstTryCorrect: [...state.progress.firstTryCorrect, itemId],
    }
    let game = awardXp(state.game, XP_QUIZ_ITEM, today, out)
    game = settle(progress, state.srs, state.drillHistory, state.portfolio, game, today, out, state.settings.pace)

    const next = { progress, srs: state.srs, game, drillHistory: state.drillHistory }
    set({ ...next, pendingCelebrations: [...state.pendingCelebrations, ...out] })
    persist(next)
  },

  /**
   * Bank one wrong answer, wherever it came from.
   *
   * Writes only the weak-spots key: a miss changes no XP, no day log and no
   * streak, so rewriting `progress`/`game`/`srs` alongside it would be four
   * pointless IndexedDB puts and four keys needlessly marked dirty for sync.
   *
   * An id the bank refuses (not a curriculum item — a case question, say)
   * leaves the state identical by reference and is dropped here, so a stray
   * call cannot spin the store or the syncer.
   */
  recordQuizMiss(itemId) {
    const state = get()
    const weakSpots = recordMiss(state.weakSpots, itemId, appClock.today())
    if (weakSpots === state.weakSpots) return
    set({ weakSpots })
    write(STORAGE_KEYS.weakspots, weakSpots)
  },

  /**
   * Retire one banked mistake: the learner has just answered it correctly in a
   * weak-spot session.
   *
   * XP comes from `resolveAward`, which reads the *transition* rather than the
   * caller's intent — an item that was already resolved (a double tap, a
   * remount) pays nothing and writes nothing.
   *
   * DELIBERATELY NOT TOUCHED: the day log. Fixing weak spots does not count as
   * a lesson, a review or a drill, so it neither advances nor satisfies the
   * daily goal and cannot on its own extend a streak. The goal means "you did
   * today's study"; remediation is extra, and quietly redefining a streak to
   * include it would devalue every streak already earned. `settle` still runs
   * so the XP can trip a level-up or a badge, exactly like case XP does.
   */
  resolveWeakSpot(itemId) {
    const state = get()
    const today = appClock.today()
    const weakSpots = resolveMiss(state.weakSpots, itemId, today)
    const xp = resolveAward(state.weakSpots, weakSpots)
    if (xp === 0) return

    const out: Celebration[] = []
    let game = awardXp(state.game, xp, today, out)
    game = settle(
      state.progress,
      state.srs,
      state.drillHistory,
      state.portfolio,
      game,
      today,
      out,
      state.settings.pace,
    )

    set({ weakSpots, game, pendingCelebrations: [...state.pendingCelebrations, ...out] })
    persist({ progress: state.progress, srs: state.srs, game, drillHistory: state.drillHistory })
    write(STORAGE_KEYS.weakspots, weakSpots)
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
    game = settle(
      state.progress,
      state.srs,
      state.drillHistory,
      state.portfolio,
      game,
      today,
      out,
      state.settings.pace,
    )

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
  awardCaseXp(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return
    const state = get()
    const today = appClock.today()
    const out: Celebration[] = []
    let game = awardXp(state.game, Math.round(amount), today, out)
    game = settle(
      state.progress,
      state.srs,
      state.drillHistory,
      state.portfolio,
      game,
      today,
      out,
      state.settings.pace,
    )
    set({ game, pendingCelebrations: [...state.pendingCelebrations, ...out] })
    persist({ progress: state.progress, srs: state.srs, game, drillHistory: state.drillHistory })
  },

  /**
   * Credit everything a placement test passed.
   *
   * THREE DELIBERATE OMISSIONS, each of which would be a bug rather than a
   * feature:
   *
   *   • NO SRS CARDS ARE MINTED. Ten passed units is ~90 lessons, which would
   *     mint roughly 300 flashcards due on day one. A learner who tested out to
   *     save time would open the app to a review queue three hours deep and
   *     never come back. They can study any skipped lesson whenever they like
   *     (the Learn screen keeps every lesson tappable) and that mints its cards
   *     the ordinary way.
   *   • NO PER-LESSON XP. `completeLesson` pays XP_LESSON because a lesson was
   *     *studied*; nothing was studied here. The flat XP_PLACEMENT_UNIT per unit
   *     below is the credit instead.
   *   • NO QUIZ XP for the placement answers. They are an exam, not practice —
   *     and paying per correct answer would reward retaking the test.
   *
   * Idempotent through the placement record's `passedUnits` union: a unit
   * already credited pays nothing a second time, so a double tap, a reload on
   * the results screen, or a retake that passes the same units again is free.
   * Lessons are only ever marked complete — never un-marked (see mergePlacement).
   */
  applyPlacement(outcome) {
    const state = get()
    const today = appClock.today()
    const credit = creditPlacement({
      record: state.placement,
      outcome,
      units: ALL_UNITS,
      completedLessons: state.progress.completedLessons,
      today,
    })
    const { record, newlyPassed } = credit

    // Still write the record when nothing is new: `takenAt` moves, which is
    // what stops the Home offer card coming back after a no-op retake.
    if (newlyPassed.length === 0) {
      set({ placement: record })
      write(STORAGE_KEYS.placement, record)
      return
    }

    const out: Celebration[] = []
    const completedLessons = { ...state.progress.completedLessons }
    for (const lessonId of credit.lessonIds) completedLessons[lessonId] = today
    const progress: ProgressState = { ...state.progress, completedLessons }

    // The day log counts this as one lesson's worth of activity: the daily goal
    // and the streak both read it, and a learner who just placed out of forty
    // lessons has plainly done today's work. One, not forty — the goal is a
    // measure of a day's study, and placement is not forty days of it.
    const day = dayOf(state.game, today)
    let game: GameState = {
      ...state.game,
      dailyLog: {
        ...state.game.dailyLog,
        [today]: { ...day, lessons: day.lessons + (credit.lessonIds.length > 0 ? 1 : 0) },
      },
    }
    game = awardXp(game, credit.xp, today, out)
    game = settle(
      progress,
      state.srs,
      state.drillHistory,
      state.portfolio,
      game,
      today,
      out,
      state.settings.pace,
    )

    const next = { progress, srs: state.srs, game, drillHistory: state.drillHistory }
    set({ ...next, placement: record, pendingCelebrations: [...state.pendingCelebrations, ...out] })
    persist(next)
    write(STORAGE_KEYS.placement, record)
  },

  dismissPlacementOffer() {
    const state = get()
    if (state.placement.offerDismissed) return
    const placement: PlacementRecord = { ...state.placement, offerDismissed: true }
    set({ placement })
    write(STORAGE_KEYS.placement, placement)
  },

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
    game = settle(
      state.progress,
      state.srs,
      drillHistory,
      state.portfolio,
      game,
      today,
      out,
      state.settings.pace,
    )

    const next = { progress: state.progress, srs: state.srs, game, drillHistory }
    set({ ...next, pendingCelebrations: [...state.pendingCelebrations, ...out] })
    persist(next)
  },

  /**
   * Fill one market order at the price the confirm screen showed.
   *
   * The engine owns every rule (cash, shares held, FIFO, rounding); this only
   * decides what a *successful* fill means to the rest of the app: the trade
   * counts toward the `first-trade` badge via `tradesPlacedIn`, a non-empty
   * journal note pays `XP_JOURNAL_NOTE` once, and the usual goal/badge settle
   * runs so celebrations fire from the same place they always do.
   *
   * Returns the outcome synchronously — the Trade screen renders the error
   * inline rather than throwing, because "not enough cash" is a normal answer.
   */
  placeTrade(req) {
    const state = get()
    const ts = req.at ?? appClock.now()
    const today = appClock.today()
    const note = req.note?.trim()
    const input = {
      symbol: req.symbol,
      qty: req.qty,
      price: req.price,
      ts,
      ...(note ? { note } : {}),
    }

    const result =
      req.side === 'buy'
        ? executeBuy(state.portfolio, input)
        : executeSell(state.portfolio, input)
    if (isTradeError(result)) return { ok: false, error: result.error, code: result.code }

    const portfolio = result.state
    const out: Celebration[] = []
    const xp = note && !req.automated ? XP_JOURNAL_NOTE : 0
    let game = awardXp(state.game, xp, today, out)
    game = settle(
      state.progress,
      state.srs,
      state.drillHistory,
      portfolio,
      game,
      today,
      out,
      state.settings.pace,
    )

    set({
      game,
      portfolio,
      pendingCelebrations: [...state.pendingCelebrations, ...out],
    })
    persist({ progress: state.progress, srs: state.srs, game, drillHistory: state.drillHistory })
    persistPortfolio(portfolio)

    return {
      ok: true,
      tx: result.tx,
      ...('realized' in result ? { realized: result.realized as number } : {}),
      xp,
    }
  },

  /**
   * Rest a limit order. Nothing is reserved and nothing is charged — the order
   * is a note to the app, and the money only moves if a later bar crosses it.
   */
  placeLimitOrder(req) {
    const state = get()
    const input = {
      id: nextOrderId(state.openOrders),
      symbol: req.symbol,
      side: req.side,
      qty: req.qty,
      limitPrice: req.limitPrice,
      placedAt: appClock.today(),
    }
    const issue = limitOrderIssue(input)
    if (issue) return { ok: false, error: issue }

    const order = newLimitOrder(input)
    const openOrders = [...state.openOrders, order]
    set({ openOrders })
    persistOrders(openOrders)
    return { ok: true, order }
  },

  cancelLimitOrder(id) {
    const state = get()
    const openOrders = cancelOrder(state.openOrders, id)
    if (openOrders === state.openOrders) return
    set({ openOrders })
    persistOrders(openOrders)
  },

  /**
   * Replay the book against the bars that have printed since each order was
   * placed, and push the fills through the ordinary `placeTrade` path so a
   * resting order and a market order end up indistinguishable in the ledger —
   * same lots, same FIFO, same badge settle. Only the note and the timestamp
   * say where the fill came from.
   *
   * A fill the engine refuses (the cash was spent elsewhere while the order
   * rested) cancels the order rather than retrying it on every app open. That
   * is the honest outcome: a broker would have rejected it too.
   */
  settleLimitOrders(seriesBySymbol) {
    const { orders, fills, changed } = evaluateLimitOrders(
      get().openOrders,
      seriesBySymbol,
      appClock.today(),
    )
    if (!changed) return

    // Write the resolved book first — to state *and* to storage. `placeTrade`
    // below persists the portfolio as it fills, so if one of those throws (or
    // the tab dies mid-loop) the book must already say "filled"; otherwise the
    // next app open would replay the same fill against a portfolio that has
    // already paid for it.
    set({ openOrders: orders })
    persistOrders(orders)

    const rejected = new Set<string>()
    for (const fill of fills) {
      const outcome = get().placeTrade({
        symbol: fill.symbol,
        side: fill.side,
        qty: fill.qty,
        price: fill.price,
        note: LIMIT_FILL_NOTE,
        // Midday UTC so the stamp reads as the fill's own session in any zone.
        at: `${fill.date}T16:00:00.000Z`,
        automated: true,
      })
      if (!outcome.ok) rejected.add(fill.orderId)
    }

    const settled = rejected.size
      ? get().openOrders.map((o) =>
          rejected.has(o.id)
            ? { ...o, status: 'cancelled' as const, filledAt: undefined, fillPrice: undefined }
            : o,
        )
      : get().openOrders
    if (rejected.size) set({ openOrders: settled })
    persistOrders(settled)
  },

  /** Star or unstar a symbol. Order of insertion is the display order. */
  toggleWatchlist(symbol) {
    const s = String(symbol ?? '').trim().toUpperCase()
    if (!s) return
    const state = get()
    const watchlist = state.watchlist.includes(s)
      ? state.watchlist.filter((x) => x !== s)
      : [...state.watchlist, s]
    set({ watchlist })
    persistWatchlist(watchlist)
  },

  /**
   * Convert the starting cash into shadow-SPY units on the first usable SPY
   * price. `initBenchmark` is init-once, so calling this on every app open is
   * safe and the comparison can never be silently re-based.
   */
  ensureBenchmark(spyPrice) {
    const state = get()
    const portfolio = initBenchmark(state.portfolio, spyPrice)
    if (portfolio === state.portfolio) return
    set({ portfolio })
    persistPortfolio(portfolio)
  },

  /**
   * Mark the account to market for today and fill in the days the app was not
   * opened, so the equity chart is a line rather than a scatter.
   *
   * Backfill runs *first* (it carries the last known equity forward across the
   * gap), then today's real mark overwrites the carried value. Idempotent: a
   * second call on the same day with the same prices produces an identical
   * snapshot and bails out before touching state, so an effect that re-runs on
   * every render cannot spin the store.
   */
  snapshotToday(prices, spySeries) {
    const state = get()
    const p = state.portfolio
    if (p.benchmarkUnits === null) return // no benchmark yet — nothing to plot against

    const today = appClock.today()
    const { equity } = portfolioEquity(p, prices)
    const bench = benchmarkEquity(p, prices.SPY ?? NaN)
    if (bench === null) return

    const existing = p.snapshots.find((sn) => sn.date === today)
    const filled = spySeries ? backfillSnapshots(p, spySeries, { today }) : p
    const next = appendSnapshot(filled, today, equity, bench)
    const fresh = next.snapshots.find((sn) => sn.date === today)

    // Nothing moved: same mark, same backfill. Skip the write entirely.
    if (
      filled === p &&
      existing &&
      fresh &&
      existing.equity === fresh.equity &&
      existing.benchmarkEquity === fresh.benchmarkEquity
    ) {
      return
    }

    set({ portfolio: next })
    persistPortfolio(next)
  },

  dismissCelebration() {
    set((s) => ({ pendingCelebrations: s.pendingCelebrations.slice(1) }))
  },

  /**
   * Preferences, not progress: this is the one action in the file that neither
   * awards XP nor touches the streak. It still goes through `write()`, so the
   * choice follows the profile to its other devices like everything else.
   */
  setReadAloud(patch) {
    const settings: Settings = {
      ...get().settings,
      readAloud: { ...get().settings.readAloud, ...patch },
    }
    set({ settings })
    write(STORAGE_KEYS.settings, settings)
  },

  /**
   * Change the daily pace. Nothing is recomputed here on purpose: the goal, the
   * SRS caps and the session plan are all *derived* from this value the next
   * time they are read, so raising the pace mid-day simply asks more of today
   * and lowering it asks less. A day already banked stays banked.
   */
  setPace(pace) {
    const settings: Settings = { ...get().settings, pace }
    set({ settings })
    write(STORAGE_KEYS.settings, settings)
  },

  async resetAll() {
    const next = { progress: emptyProgress(), srs: {}, game: emptyGame(), drillHistory: emptyDrills() }
    set({
      ...next,
      portfolio: newPortfolio(),
      openOrders: [],
      watchlist: [],
      placement: emptyPlacementRecord(),
      weakSpots: emptyWeakSpots(),
      pendingCelebrations: [],
    })
    const wiped = [
      STORAGE_KEYS.progress,
      STORAGE_KEYS.srs,
      STORAGE_KEYS.game,
      STORAGE_KEYS.drills,
      STORAGE_KEYS.portfolio,
      STORAGE_KEYS.orders,
      STORAGE_KEYS.watchlist,
      // A wiped profile has not taken the placement test: the credited-units
      // ledger must go with the progress it credited, or a re-apply would be
      // silently skipped as "already paid".
      STORAGE_KEYS.placement,
      // Mistakes belong to the progress that made them: a wiped profile has
      // never answered a question, so it has nothing to fix.
      STORAGE_KEYS.weakspots,
    ]
    await Promise.all(wiped.map((key) => storage.del(key)))
    // A reset is a change like any other: mark the keys dirty so the cloud copy
    // is emptied too, rather than restoring everything on the next pull.
    for (const key of wiped) persistHook?.(key)
  },
}))
