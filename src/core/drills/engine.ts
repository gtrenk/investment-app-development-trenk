// ─── Drill engine ────────────────────────────────────────────────────────────
// Pure functions: outcome classification, calibration-aware scoring, daily
// drill selection, and the stats behind the Profile calibration chart.
// No fetch, no DOM, no clock — `today` is always passed in.

import { daysBetween } from '@core/clock'
import type {
  Confidence,
  DrillHistory,
  DrillKind,
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
 * Which kind of drill today is. Alternates strictly day by day off the
 * day-of-epoch parity, so the two kinds interleave without consulting history
 * and a skipped day does not desynchronise the rotation.
 */
export function drillKindForDay(date: string): DrillKind {
  return dayOfEpoch(date) % 2 === 0 ? 'pattern' : 'whatnext'
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

/**
 * Pick the one drill for `today`.
 *
 * - the kind alternates by day-of-epoch parity (`drillKindForDay`)
 * - drills answered correctly in the last 60 days are skipped
 * - if that empties the preferred pool, the other kind is tried; if both are
 *   exhausted the exclusion is dropped rather than showing nothing
 * - selection is deterministic: the default `rng` is seeded from `today`, so
 *   the same day always yields the same drill for the same history
 *
 * Returns `null` only when both definition lists are empty.
 */
export function pickDailyDrill(
  patternDefs: readonly PatternDrillDef[],
  whatnextDefs: readonly WhatNextDrillDef[],
  history: DrillHistory,
  today: string,
  rng: () => number = mulberry32(hashString(today)),
): DailyDrill | null {
  const kind = drillKindForDay(today)
  const mastered = recentlyMastered(history, today)

  const patternPool = patternDefs.filter((d) => !mastered.has(d.id))
  const whatnextPool = whatnextDefs.filter((d) => !mastered.has(d.id))

  // Preferred kind first, then the other, then ignore the exclusion entirely.
  const order: Array<[DrillKind, readonly PatternDrillDef[] | readonly WhatNextDrillDef[]]> =
    kind === 'pattern'
      ? [['pattern', patternPool], ['whatnext', whatnextPool], ['pattern', patternDefs], ['whatnext', whatnextDefs]]
      : [['whatnext', whatnextPool], ['pattern', patternPool], ['whatnext', whatnextDefs], ['pattern', patternDefs]]

  for (const [poolKind, pool] of order) {
    if (pool.length === 0) continue
    // One rng draw per attempt keeps the sequence deterministic for a given day.
    const idx = Math.min(pool.length - 1, Math.floor(rng() * pool.length))
    return poolKind === 'pattern'
      ? { kind: 'pattern', def: pool[idx] as PatternDrillDef }
      : { kind: 'whatnext', def: pool[idx] as WhatNextDrillDef }
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
