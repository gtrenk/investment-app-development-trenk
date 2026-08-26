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

/** Which dataset a set of drill windows was curated against. */
export type DrillWindowSource = 'synthetic' | 'stooq'

/**
 * The whole chart-drill catalogue, as shipped in
 * `public/data/drills/windows.json` and written by `scripts/curate-windows.mjs`.
 *
 * Windows are index ranges into the bundled series, so they are only valid for
 * the dataset they were curated against — which is why they travel *with* the
 * data rather than being compiled into the bundle. `generatedAt` is the newest
 * bar in that dataset, not a wall-clock stamp: the curator has to be
 * reproducible, and a build clock would put a diff in every refresh.
 */
export interface DrillWindows {
  version: number
  source: DrillWindowSource
  /** ISO timestamp of the newest bar in the dataset these were curated from. */
  generatedAt: string
  patterns: PatternDrillDef[]
  whatnext: WhatNextDrillDef[]
}

export type DrillKind = 'pattern' | 'whatnext' | 'financials'

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

// ── Read-the-financials drills ──

/**
 * One fictional company's annual statements, simplified to the lines a learner
 * actually reasons about. Loaded from `public/data/financials/companies.json`.
 *
 * UNITS: every figure is **$ millions** except `shares` (millions of shares)
 * and `eps` (dollars per share). Because both `netIncome` and `shares` are in
 * millions, `eps = netIncome / shares` works without a scale factor.
 *
 * IDENTITIES every snapshot satisfies exactly (asserted in `tests/finDrills.test.ts`):
 *   grossProfit      = revenue − cogs
 *   operatingIncome  = grossProfit − opex
 *   pretaxIncome     = operatingIncome − interestExpense
 *   netIncome        = pretaxIncome − taxes
 *   eps              = netIncome / shares            (exact to 2 decimals)
 *   currentAssets    ≥ cash + receivables + inventory  (remainder = prepaid/other)
 *   totalAssets      = currentAssets + ppe + goodwill
 *   totalLiabilities = currentLiabilities + longTermDebt
 *   totalAssets      = totalLiabilities + equity
 *   fcf              = cfo − capex
 *
 * `goodwill` absorbs all acquired intangibles and `opex` all of SG&A + R&D —
 * the statements are teaching instruments, not filings.
 */
export interface FinStatementSnapshot {
  id: string
  /** Fictional company name — no real issuer is depicted. */
  company: string
  sector: string
  /** Fiscal period label, e.g. 'FY2024'. */
  period: string
  incomeStatement: {
    revenue: number
    cogs: number
    grossProfit: number
    opex: number
    operatingIncome: number
    interestExpense: number
    pretaxIncome: number
    taxes: number
    netIncome: number
    /** Diluted shares outstanding, in millions. */
    shares: number
    /** Dollars per share. */
    eps: number
  }
  balanceSheet: {
    cash: number
    receivables: number
    inventory: number
    currentAssets: number
    ppe: number
    goodwill: number
    totalAssets: number
    currentLiabilities: number
    longTermDebt: number
    totalLiabilities: number
    equity: number
  }
  cashFlow: {
    /** Cash flow from operations. */
    cfo: number
    /** Capital expenditure, reported positive. */
    capex: number
    /** Free cash flow = cfo − capex. */
    fcf: number
    /** Stock-based compensation. */
    sbc: number
  }
}

/**
 * The three things a financials drill can ask:
 * - `ratio-calc` — compute one ratio from one company's statements
 * - `compare`    — judge two companies side by side
 * - `red-flag`   — decide what in one company's statements deserves scrutiny
 */
export type FinDrillKind = 'ratio-calc' | 'compare' | 'red-flag'

/**
 * One read-the-financials question.
 *
 * All three kinds are **multiple choice**, including `ratio-calc`. Free numeric
 * entry would be a keypad-and-tolerance problem on a phone, and it tests the
 * same skill less well: a choice set whose distractors are the specific
 * miscalculations a learner actually makes (inverted ratio, quick ratio
 * computed instead of current, denominator swapped for total assets) forces the
 * learner to get the *formula* right, not just to arrive near a number.
 *
 * `statementIds` holds one id for `ratio-calc` and `red-flag`, two for
 * `compare`, referencing `FinStatementSnapshot.id`.
 */
export interface FinDrillDef {
  id: string
  kind: FinDrillKind
  statementIds: string[]
  prompt: string
  choices: [string, string, string, string]
  answerIdx: 0 | 1 | 2 | 3
  /** Worked solution: the real arithmetic, plus what each distractor got wrong. */
  explain: string
}

// ── Case studies ─────────────────────────────────────────────────────────────

/** `'c1'` … `'c6'` — the authored order is also the unlock order. */
export type CaseId = string

/**
 * A page of the analyst's narrative: what the filing says, what to notice,
 * what the number just computed actually means.
 *
 * `statementIds` are `FinStatementSnapshot.id` values, at most two, rendered as
 * a collapsible `StatementTable` above the prose. Two ids is how a case shows
 * one company across two fiscal years — the snapshot shape holds a single
 * period, so a trend is expressed as two snapshots side by side.
 */
export interface CaseReadStep {
  kind: 'read'
  md: string
  statementIds: string[]
}

/** A judgement call: what does this reading mean? Never arithmetic. */
export interface CaseQuestionStep {
  kind: 'question'
  item: QuizItem
  statementIds: string[]
}

/**
 * Compute one figure from the statements on screen.
 *
 * Multiple choice for the same reason the financials drills are (see
 * `FinDrillDef`): distractors built from the specific miscalculations a learner
 * makes test the formula, where a numeric keypad only tests arithmetic.
 * `formulaHint` is shown next to the question — the case is not a memory test
 * of which line goes on top, it is practice at reading a real statement.
 */
export interface CaseCalcStep {
  kind: 'calc'
  item: QuizItem
  statementIds: string[]
  /** e.g. `'Inventory turnover = COGS ÷ inventory'`. */
  formulaHint: string
}

/**
 * Free writing, saved into case progress and shown back on the completion
 * screen next to the model analysis. Nothing is graded: the value is that the
 * learner commits to a view *before* reading what the case concludes.
 */
export interface CaseThesisStep {
  kind: 'thesis'
  prompts: string[]
}

export type CaseStep = CaseReadStep | CaseQuestionStep | CaseCalcStep | CaseThesisStep

export interface CaseVerdict {
  /** The one-paragraph decision — buy, pass, or watch, and why. */
  md: string
  /** The Unit 5 ten-point health checklist score the model analysis reaches. */
  checklistScore: number
}

/**
 * One guided end-to-end company analysis: read the statements → compute the
 * ratios → judge the quality → value it → make the call.
 *
 * The bridge between knowing the material and being able to do the work, so a
 * case is deliberately long-form (8–12 steps) and always ends with a `read`
 * step holding the model analysis, followed by the learner's own answers and
 * thesis on the completion screen.
 */
export interface CaseStudy {
  id: CaseId
  title: string
  /** One line for the case list — the question the case actually asks. */
  blurb: string
  /**
   * The company under analysis: a `FinStatementSnapshot.id` from
   * `public/data/financials/companies.json`, or an inline snapshot for a case
   * that needs figures no drill uses.
   */
  company: string | FinStatementSnapshot
  intro: string
  steps: CaseStep[]
  verdict: CaseVerdict
}
