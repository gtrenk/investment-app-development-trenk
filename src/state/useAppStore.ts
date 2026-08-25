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
  OhlcvSeries,
  PortfolioState,
  ProgressState,
  Stats,
  Transaction,
} from '@core/types'
import { newCardState, applyGrade } from '@core/srs/sm2'
import { buildQueue } from '@core/srs/scheduler'
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
 */
function settle(
  progress: ProgressState,
  srs: Record<CardId, CardState>,
  drills: DrillHistory,
  portfolio: PortfolioState,
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

function pickStorage(): StorageAdapter {
  try {
    if (typeof indexedDB !== 'undefined') return idbStorage
  } catch {
    /* private mode / blocked storage — fall through */
  }
  return createMemoryStorage()
}

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
  pendingCelebrations: Celebration[]

  hydrate: () => Promise<void>
  completeLesson: (lessonId: LessonId) => void
  answerQuiz: (itemId: string, correctFirstTry: boolean) => void
  gradeCard: (cardId: CardId, grade: Grade) => void
  finishReviewSession: (cardCount: number) => void
  recordDrillResult: (result: DrillResult) => void
  placeTrade: (req: TradeRequest) => TradeOutcome
  placeLimitOrder: (req: LimitOrderRequest) => LimitOrderOutcome
  cancelLimitOrder: (id: string) => void
  /** Replay resting orders against bundled bars and fill the ones that crossed. */
  settleLimitOrders: (seriesBySymbol: SeriesMap) => void
  toggleWatchlist: (symbol: string) => void
  ensureBenchmark: (spyPrice: number) => void
  snapshotToday: (prices: PriceMap, spySeries?: OhlcvSeries | null) => void
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

/** The portfolio saves on its own key, so a trade never rewrites the whole app. */
function persistPortfolio(portfolio: PortfolioState): void {
  void storage.set(STORAGE_KEYS.portfolio, portfolio)
}

function persistOrders(orders: LimitOrder[]): void {
  void storage.set(STORAGE_KEYS.orders, orders)
}

function persistWatchlist(watchlist: string[]): void {
  void storage.set(STORAGE_KEYS.watchlist, watchlist)
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
  pendingCelebrations: [],

  async hydrate() {
    if (get().ready) return
    const [progress, srs, game, drills, portfolio, orders, watchlist] = await Promise.all([
      storage.get<ProgressState>(STORAGE_KEYS.progress),
      storage.get<Record<CardId, CardState>>(STORAGE_KEYS.srs),
      storage.get<GameState>(STORAGE_KEYS.game),
      storage.get<DrillHistory>(STORAGE_KEYS.drills),
      storage.get<PortfolioState>(STORAGE_KEYS.portfolio),
      storage.get<LimitOrder[]>(STORAGE_KEYS.orders),
      storage.get<string[]>(STORAGE_KEYS.watchlist),
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
    game = settle(progress, srs, state.drillHistory, state.portfolio, game, today, out)

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
    game = settle(progress, state.srs, state.drillHistory, state.portfolio, game, today, out)

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
    game = settle(state.progress, state.srs, state.drillHistory, state.portfolio, game, today, out)

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
    game = settle(state.progress, state.srs, drillHistory, state.portfolio, game, today, out)

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
    game = settle(state.progress, state.srs, state.drillHistory, portfolio, game, today, out)

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

    // Write the resolved book first: `placeTrade` reads and replaces state, and
    // a fill must never be evaluated twice even if one of them throws.
    set({ openOrders: orders })

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

  async resetAll() {
    const next = { progress: emptyProgress(), srs: {}, game: emptyGame(), drillHistory: emptyDrills() }
    set({
      ...next,
      portfolio: newPortfolio(),
      openOrders: [],
      watchlist: [],
      pendingCelebrations: [],
    })
    await Promise.all([
      storage.del(STORAGE_KEYS.progress),
      storage.del(STORAGE_KEYS.srs),
      storage.del(STORAGE_KEYS.game),
      storage.del(STORAGE_KEYS.drills),
      storage.del(STORAGE_KEYS.portfolio),
      storage.del(STORAGE_KEYS.orders),
      storage.del(STORAGE_KEYS.watchlist),
    ])
  },
}))
