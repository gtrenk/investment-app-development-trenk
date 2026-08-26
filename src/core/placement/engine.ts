// ─── Placement test ──────────────────────────────────────────────────────────
// "I have been around markets before — don't make me grind Unit 1."
//
// The whole thing is a ladder, not an exam paper: five questions per unit,
// four right to pass, and a miss stops that track dead. A total beginner
// answers five questions and is placed at Unit 1; someone who really has read
// filings for a decade answers fifty. Nothing here knows about React, the
// store or the clock — the screen drives it, the store applies its verdict.
//
// THREE RULES THE UI HAS TO SAY OUT LOUD, because they are what make the test
// honest rather than a lottery:
//
//   1. 4/5 passes a unit. Not 3/5: skipping ~9 lessons on the strength of two
//      lucky guesses out of five is a bad trade for the learner, and the cost
//      of a false *fail* is only that they study something they knew.
//   2. A miss stops the track. The ladder tests upward, so a unit you failed
//      is the floor: everything above it is untested and therefore unskipped.
//   3. Units above `PLACEMENT_MAX_ORDER` are never tested. They are synthesis
//      and expert material (risk, behaviour, strategy, the capstone) that
//      re-uses everything below; "testing out" of them would skip the point.

import type { Lesson, QuizItem, Unit, UnitId } from '../types'

/** Questions asked per unit. Five is ~90 seconds, so ten units is ~15 minutes. */
export const PLACEMENT_ITEMS_PER_UNIT = 5

/** Correct answers needed to pass a unit and skip its lessons. */
export const PLACEMENT_PASS_MARK = 4

/** Highest `Unit.order` the test covers; everything above is always studied. */
export const PLACEMENT_MAX_ORDER = 10

/**
 * The sampling seed.
 *
 * Deliberately a constant and *not* mixed with a profile id: two learners on
 * one install should be able to compare notes, a retake must ask the same
 * questions as the first attempt (otherwise "retake until it passes" is a
 * grind), and a bug report can be reproduced from the unit id alone.
 */
export const PLACEMENT_SEED = 'tq.placement.v1'

/**
 * Item ids the sampler reaches for first.
 *
 * Lesson quizzes are authored easy-to-hard, so `-q1` is nearly always the
 * gimme — a test built from q1s would place half the app's beginners into
 * Unit 5. The mid-difficulty items are the ones that actually discriminate.
 */
export const PREFERRED_ITEM_SUFFIXES: readonly string[] = ['-q2', '-q3']

export type PlacementTrack = 'fundamental' | 'technical'

/** Branch order at the split, and the display order of the two tracks. */
export const PLACEMENT_TRACKS: readonly PlacementTrack[] = ['fundamental', 'technical']

export interface PlacementPlan {
  /** Units every learner is tested on, in order, before the tracks split. */
  core: UnitId[]
  /** Each branch below the split, in curriculum order. */
  tracks: Record<PlacementTrack, UnitId[]>
  /** Every tested unit, in the order the ladder would reach it. */
  order: UnitId[]
  /** Units the test never covers — always studied. See rule 3 above. */
  alwaysStudied: UnitId[]
}

// ── Plan ─────────────────────────────────────────────────────────────────────

/**
 * Read the ladder out of the curriculum's own unlock graph.
 *
 * Nothing is hard-coded to `u01`/`u08`: the plan walks `unlockAfter` from the
 * root, calls the single-successor run the core, and calls each branch below
 * the first fork a track. That way inserting a unit into the fundamental chain
 * changes the placement test with it, and the only knob is
 * `PLACEMENT_MAX_ORDER`.
 *
 * A fork deeper inside a track ends that chain (the ladder is linear by
 * construction) — the shipped curriculum has exactly one fork, and a second
 * one would be a curriculum decision that needs its own UI anyway.
 */
export function buildPlacementPlan(units: Unit[]): PlacementPlan {
  const sorted = [...units].sort((a, b) => a.order - b.order)
  const testable = sorted.filter((u) => u.order <= PLACEMENT_MAX_ORDER && u.lessons.length > 0)
  const byId = new Map<UnitId, Unit>(testable.map((u) => [u.id, u]))
  const successors = (id: UnitId): Unit[] => testable.filter((u) => u.unlockAfter === id)

  const core: UnitId[] = []
  const tracks: Record<PlacementTrack, UnitId[]> = { fundamental: [], technical: [] }

  // The root is the unit nothing testable unlocks — normally `unlockAfter: null`.
  const root = testable.find((u) => !u.unlockAfter || !byId.has(u.unlockAfter))

  if (root) {
    const seen = new Set<UnitId>()
    let cursor: Unit | undefined = root
    while (cursor && !seen.has(cursor.id)) {
      seen.add(cursor.id)
      core.push(cursor.id)
      const next = successors(cursor.id)
      if (next.length === 1) {
        cursor = next[0]
        continue
      }
      if (next.length > 1) {
        next.slice(0, PLACEMENT_TRACKS.length).forEach((head, i) => {
          tracks[PLACEMENT_TRACKS[i]] = chainFrom(head, successors, seen)
        })
      }
      break
    }
  }

  const order = [...core, ...tracks.fundamental, ...tracks.technical]
  const inOrder = new Set(order)
  return {
    core,
    tracks,
    order,
    alwaysStudied: sorted.filter((u) => !inOrder.has(u.id)).map((u) => u.id),
  }
}

function chainFrom(
  head: Unit,
  successors: (id: UnitId) => Unit[],
  seen: Set<UnitId>,
): UnitId[] {
  const chain: UnitId[] = []
  let cursor: Unit | undefined = head
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id)
    chain.push(cursor.id)
    const next = successors(cursor.id)
    cursor = next.length === 1 ? next[0] : undefined
  }
  return chain
}

/** Which track a unit sits in, or `null` for a core unit / one not tested. */
export function trackOf(plan: PlacementPlan, unitId: UnitId): PlacementTrack | null {
  for (const track of PLACEMENT_TRACKS) {
    if (plan.tracks[track].includes(unitId)) return track
  }
  return null
}

// ── Deterministic sampling ───────────────────────────────────────────────────

/** FNV-1a, 32-bit. Small, dependency-free, and stable across engines. */
function hash32(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** mulberry32 — one line of state, uniform enough to shuffle a list of ten. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** The RNG for one unit's sample. Same unit id, same questions, forever. */
export function placementRng(unitId: UnitId): () => number {
  return mulberry32(hash32(`${PLACEMENT_SEED}:${unitId}`))
}

/** Fisher-Yates against an injected RNG — pure, and reproducible. */
function shuffled<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function isPreferred(item: QuizItem): boolean {
  return PREFERRED_ITEM_SUFFIXES.some((suffix) => item.id.endsWith(suffix))
}

/**
 * The order this lesson would give up its questions: mid-difficulty items
 * first (shuffled among themselves), then everything else.
 */
function lessonQueue(lesson: Lesson, rng: () => number): QuizItem[] {
  const preferred = lesson.quiz.filter(isPreferred)
  const rest = lesson.quiz.filter((q) => !isPreferred(q))
  return [...shuffled(preferred, rng), ...shuffled(rest, rng)]
}

/**
 * The `k` questions this unit is tested on.
 *
 * ONE PER LESSON, as far as the unit allows: five questions from one lesson
 * would test one idea five times and place a learner on the strength of the
 * single page they happen to remember. Lessons are shuffled first (so the
 * sample is not always the first five) and then drained round-robin, which
 * only reaches a second question from the same lesson in a unit with fewer
 * than `k` lessons — none in the shipped curriculum.
 */
export function sampleUnitItems(unit: Unit, k = PLACEMENT_ITEMS_PER_UNIT): QuizItem[] {
  const rng = placementRng(unit.id)
  const lessons = [...unit.lessons]
    .sort((a, b) => a.order - b.order)
    .filter((l) => l.quiz.length > 0)
  const queues = shuffled(lessons, rng).map((lesson) => lessonQueue(lesson, rng))

  const picked: QuizItem[] = []
  for (let round = 0; picked.length < k; round++) {
    let tookOne = false
    for (const queue of queues) {
      if (picked.length >= k) break
      const item = queue[round]
      if (!item) continue
      picked.push(item)
      tookOne = true
    }
    if (!tookOne) break // every lesson is drained — the unit has fewer than k items
  }
  return picked
}

/** Every unit's sample, keyed by unit id — what the screen plays through. */
export function samplePlacement(
  units: Unit[],
  plan: PlacementPlan,
): Record<UnitId, QuizItem[]> {
  const out: Record<UnitId, QuizItem[]> = {}
  for (const unitId of plan.order) {
    const unit = units.find((u) => u.id === unitId)
    if (unit) out[unitId] = sampleUnitItems(unit)
  }
  return out
}

// ── The ladder ───────────────────────────────────────────────────────────────

export interface PlacementUnitResult {
  unitId: UnitId
  correct: number
  /** Questions actually asked — normally `PLACEMENT_ITEMS_PER_UNIT`. */
  total: number
  /**
   * Credited by an *earlier* placement and not re-tested in this run.
   *
   * A retake resumes rather than restarts: making someone who already tested
   * out of Units 1–2 answer them again to get at Unit 3 would be ten questions
   * of pure tax, and their credit is not up for re-litigation anyway (see
   * `mergePlacement` — a retake can only add). The screen renders these rows as
   * "already tested out" rather than as a score, because no score was earned
   * today and printing 5/5 would be a small lie.
   */
  carried?: boolean
}

export interface PlacementState {
  plan: PlacementPlan
  /** One entry per unit tested, in the order they were answered. */
  results: PlacementUnitResult[]
}

/**
 * Synthetic pass rows for units an earlier placement already credited, in
 * ladder order — what makes a retake pick up where the last one stopped.
 */
export function carriedResults(
  plan: PlacementPlan,
  creditedUnits: readonly UnitId[],
): PlacementUnitResult[] {
  const credited = new Set(creditedUnits)
  return plan.order
    .filter((id) => credited.has(id))
    .map((unitId) => ({
      unitId,
      correct: PLACEMENT_ITEMS_PER_UNIT,
      total: PLACEMENT_ITEMS_PER_UNIT,
      carried: true,
    }))
}

export function newPlacementState(
  plan: PlacementPlan,
  carried: readonly PlacementUnitResult[] = [],
): PlacementState {
  return { plan, results: [...carried] }
}

export function passed(result: PlacementUnitResult): boolean {
  return result.correct >= PLACEMENT_PASS_MARK
}

export function resultFor(state: PlacementState, unitId: UnitId): PlacementUnitResult | undefined {
  return state.results.find((r) => r.unitId === unitId)
}

/**
 * The next unit to put in front of the learner, or `null` when the test is over.
 *
 * Core first, in order — a failed core unit ends the whole test, because the
 * tracks live *below* it and there is nothing above a floor you did not reach.
 * Then each track in turn, each stopping at its own first miss.
 */
export function nextUnitToTest(state: PlacementState): UnitId | null {
  for (const unitId of state.plan.core) {
    const result = resultFor(state, unitId)
    if (!result) return unitId
    if (!passed(result)) return null
  }
  for (const track of PLACEMENT_TRACKS) {
    for (const unitId of state.plan.tracks[track]) {
      const result = resultFor(state, unitId)
      if (!result) return unitId
      if (!passed(result)) break // this track is done; the next one still runs
    }
  }
  return null
}

/**
 * Bank one unit's score. Idempotent per unit: a second call for a unit already
 * recorded returns the state untouched, so a double-tapped "Continue" cannot
 * write a second result or shift the ladder.
 */
export function recordUnitResult(
  state: PlacementState,
  unitId: UnitId,
  correctCount: number,
  total = PLACEMENT_ITEMS_PER_UNIT,
): PlacementState {
  if (resultFor(state, unitId)) return state
  const safeTotal = Math.max(0, Math.floor(total))
  const correct = Math.min(safeTotal, Math.max(0, Math.floor(correctCount)))
  return { ...state, results: [...state.results, { unitId, correct, total: safeTotal }] }
}

export interface PlacementOutcome {
  /** Units the learner tested out of, in curriculum order. */
  passedUnits: UnitId[]
  /**
   * The first unit of each track the learner still has to study.
   *
   * `null` means the whole track was passed — study continues in the units
   * above `PLACEMENT_MAX_ORDER`, which nobody tests out of. Typed as nullable
   * rather than pointing at the first synthesis unit, because "you start at
   * Unit 11" would be a claim about a unit this engine never examined.
   */
  startAt: Record<PlacementTrack, UnitId | null>
}

/**
 * What the results screen shows and what the store applies.
 *
 * `startAt` walks core-then-track and stops at the first unit not passed, so a
 * learner who never reached a track starts at that track's first unit — which
 * is exactly where they were before taking the test.
 */
export function placementOutcome(state: PlacementState): PlacementOutcome {
  const passedSet = new Set(state.results.filter(passed).map((r) => r.unitId))
  const passedUnits = state.plan.order.filter((id) => passedSet.has(id))

  const startAt = {} as Record<PlacementTrack, UnitId | null>
  for (const track of PLACEMENT_TRACKS) {
    const chain = [...state.plan.core, ...state.plan.tracks[track]]
    startAt[track] = chain.find((id) => !passedSet.has(id)) ?? null
  }
  return { passedUnits, startAt }
}

/**
 * Questions actually put to the learner in this run — carried credit from an
 * earlier attempt is not a question anyone answered today.
 */
export function placementAsked(state: PlacementState): number {
  return state.results.reduce((n, r) => n + (r.carried ? 0 : r.total), 0)
}
