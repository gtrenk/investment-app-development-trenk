// ─── Drill engine ────────────────────────────────────────────────────────────
// Pure functions: outcome classification, calibration-aware scoring, daily
// drill selection, and the stats behind the Profile calibration chart.
// No fetch, no DOM, no clock — `today` is always passed in.

import { daysBetween } from '@core/clock'
import type {
  Confidence,
  DrillHistory,
  DrillKind,
  FinDrillDef,
  PatternDrillDef,
  WhatNextDrillDef,
} from '@core/types'

// ─── Outcome classification ──────────────────────────────────────────────────

export type WhatNextOutcome = 'up' | 'flat' | 'down'

/** A move has to clear ±2% to count as a direction; everything else is chop. */
export const OUTCOME_THRESHOLD = 0.02

/**
 * Classify a fractional return over the drill horizon.
 * Strictly outside the band: exactly +2% or −2% is 'flat', so the boundary
 * belongs to one bucket only and the drill never has two defensible answers.
 */
export function whatNextOutcome(r: number): WhatNextOutcome {
  if (r > OUTCOME_THRESHOLD) return 'up'
  if (r < -OUTCOME_THRESHOLD) return 'down'
  return 'flat'
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

/** Points for a correct answer before any calibration adjustment. */
export const DRILL_BASE_SCORE = 10

/**
 * Calibration adjustment by stated confidence.
 *
 * This is the whole point of asking for a probability: claiming 90% and being
 * right is worth more than shrugging at 50% and being right, and claiming 90%
 * and being wrong has to hurt — otherwise there is no reason ever to say 50%.
 *
 * Note the asymmetry at 50%: +1 when right, 0 when wrong. Hedging is cheap but
 * never *free* upside, so a learner who always picks 50% scores worst overall.
 */
export const CALIBRATION_ADJUST: Record<Confidence, { correct: number; wrong: number }> = {
  90: { correct: 5, wrong: -5 },
  70: { correct: 3, wrong: -2 },
  50: { correct: 1, wrong: 0 },
}

/**
 * Score one drill answer.
 *
 * Without a confidence: +10 correct, 0 wrong.
 * With one: the base plus `CALIBRATION_ADJUST`.
 *
 * Full matrix:
 *   correct @90 → +15   wrong @90 → −5
 *   correct @70 → +13   wrong @70 → −2
 *   correct @50 → +11   wrong @50 →  0
 *   correct  —  → +10   wrong  —  →  0
 *
 * The result is deliberately **not** clamped at zero: a confident wrong answer
 * returns −5. Callers that feed a non-negative counter (XP) must clamp at the
 * point of award; the drill score itself stays signed so the calibration
 * penalty is visible in the drill history.
 */
export function scoreDrill(correct: boolean, confidence?: Confidence): number {
  const base = correct ? DRILL_BASE_SCORE : 0
  if (confidence === undefined) return base
  const adj = CALIBRATION_ADJUST[confidence]
  return base + (correct ? adj.correct : adj.wrong)
}

// ─── Daily drill selection ───────────────────────────────────────────────────

/** A drill answered correctly within this many days is not shown again. */
export const DRILL_EXCLUSION_DAYS = 60

export type DailyDrill =
  | { kind: 'pattern'; def: PatternDrillDef }
  | { kind: 'whatnext'; def: WhatNextDrillDef }
  | { kind: 'financials'; def: FinDrillDef }

const EPOCH = '1970-01-01'

/** mulberry32 — same generator the data script uses, so behaviour is familiar. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** FNV-1a: turns 'YYYY-MM-DD' into a stable seed. */
function hashString(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

/** Whole days from the Unix epoch to a local date string. */
export function dayOfEpoch(date: string): number {
  return daysBetween(EPOCH, date)
}

/**
 * The rotation order, longest first. Day-of-epoch modulo the rotation length
 * picks the entry, so the cycle is a pure function of the date: it never
 * consults history, and skipping a day cannot desynchronise it.
 */
export const DRILL_ROTATION_2: readonly DrillKind[] = ['pattern', 'whatnext']
export const DRILL_ROTATION_3: readonly DrillKind[] = ['pattern', 'whatnext', 'financials']

/**
 * Which kind of drill today is.
 *
 * By default this is the original two-kind alternation off day-of-epoch parity
 * (`1970-01-01` → pattern, `1970-01-02` → whatnext, …). Pass
 * `includeFinancials` to get the three-kind round robin
 * (pattern → whatnext → financials) used once financials drills are loaded.
 *
 * Both cycles start on `pattern` at the epoch, so the two agree on every day
 * divisible by 6 and the switch never lands a learner mid-cycle on a kind that
 * does not exist.
 */
export function drillKindForDay(date: string, includeFinancials = false): DrillKind {
  const rotation = includeFinancials ? DRILL_ROTATION_3 : DRILL_ROTATION_2
  // Floored modulo: dates before 1970 give a negative day-of-epoch, and a
  // negative index would read off the front of the array.
  const n = dayOfEpoch(date) % rotation.length
  return rotation[(n + rotation.length) % rotation.length]
}

/** Ids answered *correctly* within the exclusion window ending at `today`. */
function recentlyMastered(history: DrillHistory, today: string): Set<string> {
  const out = new Set<string>()
  for (const r of history.results) {
    if (!r.correct) continue
    const age = daysBetween(r.date, today)
    if (age >= 0 && age < DRILL_EXCLUSION_DAYS) out.add(r.drillId)
  }
  return out
}

type AnyDrillDef = PatternDrillDef | WhatNextDrillDef | FinDrillDef

/** Rebuild the tagged union from the kind that produced the pool. */
function asDailyDrill(kind: DrillKind, def: AnyDrillDef): DailyDrill {
  switch (kind) {
    case 'pattern':
      return { kind: 'pattern', def: def as PatternDrillDef }
    case 'whatnext':
      return { kind: 'whatnext', def: def as WhatNextDrillDef }
    case 'financials':
      return { kind: 'financials', def: def as FinDrillDef }
  }
}

/**
 * Pick the one drill for `today`.
 *
 * - the kind comes from `drillKindForDay`: a two-kind alternation while
 *   `finDefs` is empty, a three-kind round robin once financials drills are
 *   supplied (pattern → whatnext → financials)
 * - drills answered correctly in the last 60 days are skipped
 * - if that empties the preferred pool, the remaining kinds are tried in
 *   rotation order; if every pool is exhausted the exclusion is dropped rather
 *   than showing nothing
 * - selection is deterministic: the default `rng` is seeded from `today`, so
 *   the same day always yields the same drill for the same history
 *
 * `finDefs` is last and optional so every existing four- and five-argument call
 * site keeps its exact previous behaviour, two-kind rotation included.
 *
 * Returns `null` only when every definition list is empty.
 */
export function pickDailyDrill(
  patternDefs: readonly PatternDrillDef[],
  whatnextDefs: readonly WhatNextDrillDef[],
  history: DrillHistory,
  today: string,
  rng: () => number = mulberry32(hashString(today)),
  finDefs: readonly FinDrillDef[] = [],
): DailyDrill | null {
  const includeFinancials = finDefs.length > 0
  const rotation = includeFinancials ? DRILL_ROTATION_3 : DRILL_ROTATION_2
  const kind = drillKindForDay(today, includeFinancials)
  const mastered = recentlyMastered(history, today)

  const all: Record<DrillKind, readonly AnyDrillDef[]> = {
    pattern: patternDefs,
    whatnext: whatnextDefs,
    financials: finDefs,
  }

  // Preferred kind first, then the rest in rotation order — so a learner whose
  // pattern pool is exhausted falls through to what-next before financials,
  // exactly as the two-kind version did.
  const kinds = rotation.slice(rotation.indexOf(kind)).concat(rotation.slice(0, rotation.indexOf(kind)))

  // First pass honours the 60-day exclusion; second pass drops it.
  const order: Array<[DrillKind, readonly AnyDrillDef[]]> = [
    ...kinds.map(
      (k): [DrillKind, readonly AnyDrillDef[]] => [k, all[k].filter((d) => !mastered.has(d.id))],
    ),
    ...kinds.map((k): [DrillKind, readonly AnyDrillDef[]] => [k, all[k]]),
  ]

  for (const [poolKind, pool] of order) {
    if (pool.length === 0) continue
    // One rng draw per attempt keeps the sequence deterministic for a given day.
    const idx = Math.min(pool.length - 1, Math.floor(rng() * pool.length))
    return asDailyDrill(poolKind, pool[idx])
  }
  return null
}

// ─── History queries ─────────────────────────────────────────────────────────

/** Has a drill already been answered on `today`? (One drill per day.) */
export function answeredToday(history: DrillHistory, today: string): boolean {
  return history.results.some((r) => r.date === today)
}

export interface CalibrationBucket {
  confidence: Confidence
  /** Answers recorded at this confidence level. */
  n: number
  /** Share of them that were correct, 0–1. Zero when `n` is 0. */
  hitRate: number
}

export const CONFIDENCE_LEVELS: readonly Confidence[] = [50, 70, 90]

/**
 * Hit rate per stated confidence level — the data behind the Profile
 * calibration chart. A well-calibrated learner's bars sit near 0.5 / 0.7 / 0.9;
 * bars below the line mean overconfidence.
 *
 * Always returns all three buckets in ascending order so the chart has a stable
 * shape from the very first answer. Results with no confidence are ignored.
 */
export function calibrationStats(history: DrillHistory): CalibrationBucket[] {
  return CONFIDENCE_LEVELS.map((confidence) => {
    let n = 0
    let hits = 0
    for (const r of history.results) {
      if (r.confidence !== confidence) continue
      n++
      if (r.correct) hits++
    }
    return { confidence, n, hitRate: n === 0 ? 0 : hits / n }
  })
}
