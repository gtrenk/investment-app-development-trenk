// ─── Shared domain types ─────────────────────────────────────────────────────
// Pure data definitions. No React, no DOM — everything in src/core is portable.

// ── Curriculum ──
export type UnitId = string // e.g. 'u01'
export type LessonId = string // e.g. 'u01-l01'
export type CardId = string // e.g. 'u01-l01-c1'

export interface ContentBlock {
  kind: 'text' | 'callout' | 'example' | 'keypoint'
  md: string
}

export interface QuizItem {
  id: string
  prompt: string
  choices: [string, string, string, string]
  answerIdx: 0 | 1 | 2 | 3
  explain: string
}

export interface CardSeed {
  id: CardId
  kind: 'basic' | 'cloze'
  front: string
  back: string
}

export interface Lesson {
  id: LessonId
  unitId: UnitId
  order: number
  title: string
  minutes: 2 | 3
  blocks: ContentBlock[]
  quiz: QuizItem[]
  cardSeeds: CardSeed[]
}

export interface Unit {
  id: UnitId
  title: string
  order: number
  description: string
  /** Unit unlocks when this unit reaches the unlock threshold (null = always open) */
  unlockAfter: UnitId | null
  lessons: Lesson[]
}

// ── Spaced repetition (SM-2) ──
/** Review grade: Again / Hard / Good / Easy mapped to SM-2 quality */
export type Grade = 0 | 3 | 4 | 5

export interface CardState {
  cardId: CardId
  /** SM-2 ease factor. Initial 2.5, floor 1.3 */
  ease: number
  intervalDays: number
  /** Consecutive successful reps (resets on lapse) */
  reps: number
  lapses: number
  /** Local date 'YYYY-MM-DD' when the card is next due */
  due: string
  /** Local date the card was introduced */
  introduced: string
  lastGrade?: Grade
}

// ── Gamification ──
export interface StreakState {
  current: number
  longest: number
  /** Last local date the daily goal was met, or null if never */
  lastActiveDate: string | null
  /** Banked streak freezes (0–2) */
  freezes: number
  /** Days-kept counter toward earning the next freeze (resets on break) */
  daysTowardFreeze: number
}

export interface DayLog {
  reviews: number
  lessons: number
  drills: number
  xp: number
  goalMet: boolean
}

export interface EarnedBadge {
  id: string
  earnedAt: string // local date
}

export interface GameState {
  xp: number
  streak: StreakState
  badges: EarnedBadge[]
  dailyLog: Record<string, DayLog>
}

/** Snapshot of lifetime stats used by badge predicates */
export interface Stats {
  totalXp: number
  level: number
  lessonsCompleted: number
  unitsCompleted: number
  totalUnits: number
  totalReviews: number
  streakCurrent: number
  streakLongest: number
  drillsCorrect: number
  tradesPlaced: number
}

export interface BadgeDef {
  id: string
  name: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold'
  test: (s: Stats) => boolean
}

// ── Progress ──
export interface ProgressState {
  /** lessonId → local date completed */
  completedLessons: Record<LessonId, string>
  /** quiz item ids answered correctly on first attempt (for XP idempotence) */
  firstTryCorrect: string[]
}

// ── Market data ──
export interface OhlcvSeries {
  symbol: string
  interval: '1d'
  t: number[] // unix seconds (day)
  o: number[]
  h: number[]
  l: number[]
  c: number[]
  v: number[]
}

export interface Quote {
  symbol: string
  price: number
  asOf: string // ISO timestamp
  stale: boolean
}

// ── Portfolio ──
export interface Lot {
  symbol: string
  qty: number
  costBasis: number // per-share
  openedAt: string // ISO timestamp
}

export interface Transaction {
  id: string
  ts: string // ISO timestamp
  symbol: string
  side: 'buy' | 'sell'
  qty: number
  price: number
  note?: string
}

export interface EquitySnapshot {
  date: string // local date
  equity: number
  benchmarkEquity: number
}

export interface PortfolioState {
  cash: number
  lots: Lot[]
  transactions: Transaction[]
  realizedPnl: number
  /** SPY units bought with the initial virtual cash at portfolio creation */
  benchmarkUnits: number | null
  snapshots: EquitySnapshot[]
}

// ── Drills ──

/** Every chart shape the pattern drill can ask about. */
export type PatternId =
  | 'head-and-shoulders'
  | 'inverse-head-and-shoulders'
  | 'double-top'
  | 'double-bottom'
  | 'ascending-triangle'
  | 'descending-triangle'
  | 'symmetrical-triangle'
  | 'bull-flag'
  | 'bear-flag'
  | 'cup-and-handle'
  | 'rising-wedge'
  | 'falling-wedge'
  | 'breakout'
  | 'support-bounce'
  | 'uptrend'
  | 'downtrend'
  | 'consolidation'

/** Self-reported probability that the chosen answer is right. */
export type Confidence = 50 | 70 | 90

/**
 * One pattern-recognition question: a window of a bundled series plus the
 * correct label and three wrong ones. `startIdx`/`endIdx` are inclusive indices
 * into that symbol's `OhlcvSeries` arrays.
 */
export interface PatternDrillDef {
  id: string
  symbol: string
  startIdx: number
  endIdx: number
  answer: PatternId
  distractors: [PatternId, PatternId, PatternId]
  /** Teaching note revealed after answering: what identifies it, what it signals. */
  explain: string
}

/**
 * One "what happens next" question: bars up to `cutoffIdx` are shown, the
 * learner predicts the direction over the following `horizon` bars, then the
 * hidden bars are revealed.
 */
export interface WhatNextDrillDef {
  id: string
  symbol: string
  /** Inclusive index of the last visible bar. */
  cutoffIdx: number
  /** Bars ahead the prediction covers (10 in the shipped set). */
  horizon: number
}

export type DrillKind = 'pattern' | 'whatnext'

export interface DrillResult {
  drillId: string
  kind: DrillKind
  /** Local date 'YYYY-MM-DD' the drill was answered */
  date: string
  correct: boolean
  /** Only what-next drills collect a confidence level */
  confidence?: Confidence
  score: number
}

export interface DrillHistory {
  results: DrillResult[]
}
