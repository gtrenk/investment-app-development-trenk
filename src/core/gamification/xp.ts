// ─── XP awards and the level curve ───────────────────────────────────────────
// Pure arithmetic. The awards below are the *only* place XP amounts are defined.

// ── Award constants ──
/** Completing a micro-lesson. */
export const XP_LESSON = 20
/** Each quiz item answered correctly — first attempt only (caller enforces idempotence). */
export const XP_QUIZ_ITEM = 2
/** Finishing a review session at all. */
export const XP_REVIEW_SESSION = 10
/** Per card reviewed within a session. */
export const XP_PER_CARD = 1
/** Completing a daily drill. */
export const XP_DRILL = 15
/** Bonus on top of XP_DRILL when the drill answer is correct. */
export const XP_DRILL_CORRECT_BONUS = 10
/** Attaching a written rationale to a paper trade. */
export const XP_JOURNAL_NOTE = 5
/**
 * Testing out of one unit in the placement test.
 *
 * Flat, and deliberately far below what studying the unit pays (8–10 lessons
 * at XP_LESSON each, plus their quiz items): the placement test proves you
 * already knew it, and paying full price for knowledge the app did not teach
 * would make the leaderboard a measure of prior experience. Credit, not wages.
 */
export const XP_PLACEMENT_UNIT = 15

// ── Level curve ──
/** XP required at level 1 to reach level 2. */
export const BASE_LEVEL_XP = 100
/** Extra XP each successive level costs. */
export const LEVEL_XP_STEP = 75

/**
 * XP needed to advance from `level` to `level + 1`.
 * Levels start at 1: 100, 175, 250, 325, …
 */
export function xpForNextLevel(level: number): number {
  const l = Math.max(1, Math.floor(level))
  return BASE_LEVEL_XP + LEVEL_XP_STEP * (l - 1)
}

/**
 * Cumulative XP required to *reach* `level`. Level 1 costs nothing.
 * Closed form of the arithmetic series above.
 */
export function totalXpForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level))
  const n = l - 1
  return BASE_LEVEL_XP * n + (LEVEL_XP_STEP * n * (n - 1)) / 2
}

/** The level a given lifetime XP total sits in (>= 1). */
export function levelFor(xp: number): number {
  const total = Math.max(0, Math.floor(xp))
  // Invert totalXpForLevel: (75/2)n² + (100 − 75/2)n − total = 0, n = level − 1.
  const a = LEVEL_XP_STEP / 2
  const b = BASE_LEVEL_XP - LEVEL_XP_STEP / 2
  const n = Math.floor((-b + Math.sqrt(b * b + 4 * a * total)) / (2 * a))
  let level = Math.max(1, n + 1)
  // Guard against float error at exact level boundaries.
  while (totalXpForLevel(level + 1) <= total) level++
  while (level > 1 && totalXpForLevel(level) > total) level--
  return level
}

/** XP earned so far *within* the current level. */
export function xpIntoLevel(xp: number): number {
  const total = Math.max(0, Math.floor(xp))
  return total - totalXpForLevel(levelFor(total))
}

/** Fraction (0–1) of the way through the current level — handy for progress bars. */
export function levelProgress(xp: number): number {
  const level = levelFor(xp)
  return xpIntoLevel(xp) / xpForNextLevel(level)
}
