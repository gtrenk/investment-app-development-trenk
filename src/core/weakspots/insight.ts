// ─── Per-unit accuracy insight ───────────────────────────────────────────────
// "Which unit is actually weak?" answered from three independent signals the
// app already collects, and nothing else:
//
//   1. QUIZ ACCURACY — items of that unit answered right first try vs items
//      ever missed. The long-run record.
//   2. OPEN MISSES — how much of that record is still unfixed *today*.
//   3. LAPSED CARDS — cards of that unit that SM-2 keeps handing back (see
//      LAPSE_MIN) and that are due now or within the week.
//
// The three measure different things on purpose. Accuracy is history and moves
// slowly; open misses are the actionable backlog; lapses are the material that
// is decaying even though the quiz was passed. A unit can be weak on any one of
// them, so the weakness score below is a weighted blend rather than a ranking
// by whichever number happens to be biggest.
//
// Pure: units are passed in (never imported from @content), so this stays a
// function of its arguments and a plain Node test can drive it.

import type { CardId, CardState, Unit, UnitId } from '@core/types'
import { addDays } from '@core/clock'
import { openMisses, unitIdOf } from './bank'
import type { MissRecord, WeakSpotsState } from './bank'

// ── Tuning ───────────────────────────────────────────────────────────────────

/**
 * Lapses that make a card "trouble".
 *
 * One lapse is an ordinary bad morning — SM-2 exists to absorb exactly that.
 * Two is a pattern, and it is the point at which the card's interval has been
 * knocked back twice without the material sticking.
 */
export const LAPSE_MIN = 2

/**
 * How far ahead a lapsing card still counts as pressure. A card due in three
 * weeks is scheduled, not urgent; one due inside the week is about to cost the
 * learner another failed review.
 */
export const LAPSE_WINDOW_DAYS = 7

/** Open misses in one unit that saturate the "backlog" term of the score. */
export const OPEN_MISS_SCALE = 5

/** Lapsing cards in one unit that saturate the "decay" term of the score. */
export const LAPSE_SCALE = 4

/**
 * The blend. Accuracy carries the most weight because it is the only term based
 * on the learner answering questions rather than on the scheduler's opinion;
 * the backlog term is next because it is the one the app can act on today.
 * They sum to 1, so the score is a genuine 0–100 and not a number that only
 * means something relative to the other units on screen.
 */
export const SCORE_WEIGHTS = { missRate: 0.5, openMisses: 0.3, lapsedCards: 0.2 } as const

// ── Per unit ─────────────────────────────────────────────────────────────────

export interface UnitInsight {
  unitId: UnitId
  title: string
  /** Distinct quiz items of this unit the learner has actually answered. */
  quizAttempted: number
  /** Of those, how many have been missed at least once (resolved or not). */
  quizMissed: number
  /** Misses of this unit still waiting to be fixed. */
  openMisses: number
  /** Cards of this unit lapsing and due inside the window — see LAPSE_MIN. */
  lapsedCards: number
  /** First-try accuracy 0–1, or `null` when nothing has been attempted. */
  accuracy: number | null
  /** Weighted weakness, 0 (nothing to fix) – 100 (everything is wrong). */
  score: number
}

/**
 * Cards of one unit that keep coming back.
 *
 * "Due within the window OR overdue" is one comparison, not two: an overdue
 * card has a `due` date in the past, which is trivially `<= today + 7`. Written
 * as the single bound so the edge (due exactly seven days out — in) cannot
 * drift between this and the UI copy that describes it.
 */
export function lapsedCardIds(
  srs: Record<CardId, CardState>,
  unitId: UnitId,
  today: string,
): CardId[] {
  const horizon = addDays(today, LAPSE_WINDOW_DAYS)
  return Object.values(srs)
    .filter(
      (card) =>
        unitIdOf(card.cardId) === unitId && card.lapses >= LAPSE_MIN && card.due <= horizon,
    )
    .map((card) => card.cardId)
    .sort()
}

/** The 0–100 weakness blend. Exported so the tests pin the arithmetic itself. */
export function weaknessScore(input: {
  quizAttempted: number
  quizMissed: number
  openMisses: number
  lapsedCards: number
}): number {
  const missRate = input.quizAttempted > 0 ? input.quizMissed / input.quizAttempted : 0
  const backlog = Math.min(1, input.openMisses / OPEN_MISS_SCALE)
  const decay = Math.min(1, input.lapsedCards / LAPSE_SCALE)
  const blend =
    SCORE_WEIGHTS.missRate * missRate +
    SCORE_WEIGHTS.openMisses * backlog +
    SCORE_WEIGHTS.lapsedCards * decay
  return Math.round(Math.min(1, Math.max(0, blend)) * 100)
}

export interface InsightInput {
  units: Unit[]
  /** Quiz item ids answered right on the first attempt — from ProgressState. */
  firstTryCorrect: readonly string[]
  weakSpots: WeakSpotsState
  srs: Record<CardId, CardState>
  today: string
}

/**
 * One row per unit the learner has any evidence about, in curriculum order.
 *
 * Units with nothing recorded are dropped rather than shown as a row of
 * zeroes: fourteen "0%" rows would bury the two that matter, and "no data" is
 * not a weakness.
 *
 * An item that was answered right in a lesson *and* missed in the placement
 * test counts once as attempted and once as missed — i.e. it scores as a miss.
 * That is deliberate. The bank's claim is "you have got this wrong at some
 * point", and the remedy (re-ask it) is the same either way.
 */
export function unitInsights(input: InsightInput): UnitInsight[] {
  const { units, firstTryCorrect, weakSpots, srs, today } = input

  const correctByUnit = new Map<UnitId, Set<string>>()
  for (const itemId of firstTryCorrect) {
    const unitId = unitIdOf(itemId)
    if (!unitId) continue
    const set = correctByUnit.get(unitId)
    if (set) set.add(itemId)
    else correctByUnit.set(unitId, new Set([itemId]))
  }

  const missedByUnit = new Map<UnitId, MissRecord[]>()
  for (const record of weakSpots.misses) {
    const list = missedByUnit.get(record.unitId)
    if (list) list.push(record)
    else missedByUnit.set(record.unitId, [record])
  }

  const rows: UnitInsight[] = []
  for (const unit of [...units].sort((a, b) => a.order - b.order)) {
    const missed = missedByUnit.get(unit.id) ?? []
    const correct = correctByUnit.get(unit.id) ?? new Set<string>()
    const attempted = new Set<string>([...correct, ...missed.map((m) => m.itemId)])
    const quizAttempted = attempted.size
    const quizMissed = missed.length
    const open = missed.filter((m) => m.resolvedAt === undefined).length
    const lapsed = lapsedCardIds(srs, unit.id, today).length
    if (quizAttempted === 0 && open === 0 && lapsed === 0) continue

    rows.push({
      unitId: unit.id,
      title: unit.title,
      quizAttempted,
      quizMissed,
      openMisses: open,
      lapsedCards: lapsed,
      accuracy: quizAttempted === 0 ? null : (quizAttempted - quizMissed) / quizAttempted,
      score: weaknessScore({
        quizAttempted,
        quizMissed,
        openMisses: open,
        lapsedCards: lapsed,
      }),
    })
  }
  return rows
}

/** Weakest first. Ties break on unit id so the order never jitters. */
export function rankUnits(insights: UnitInsight[]): UnitInsight[] {
  return [...insights].sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.unitId < b.unitId ? -1 : 1,
  )
}

// ── Overall ──────────────────────────────────────────────────────────────────

export interface WeakSpotSummary {
  /** Misses still open, across every unit. Drives the Home row's threshold. */
  openMisses: number
  /** Units carrying at least one open miss. */
  unitsAffected: number
  quizAttempted: number
  quizMissed: number
  /** Lifetime first-try accuracy 0–1, or `null` before anything was answered. */
  accuracy: number | null
  /** The weakest unit by score, or `null` when there is no evidence at all. */
  weakest: UnitInsight | null
}

export function weakSpotSummary(insights: UnitInsight[]): WeakSpotSummary {
  const quizAttempted = insights.reduce((n, u) => n + u.quizAttempted, 0)
  const quizMissed = insights.reduce((n, u) => n + u.quizMissed, 0)
  const ranked = rankUnits(insights)
  return {
    openMisses: insights.reduce((n, u) => n + u.openMisses, 0),
    unitsAffected: insights.filter((u) => u.openMisses > 0).length,
    quizAttempted,
    quizMissed,
    accuracy: quizAttempted === 0 ? null : (quizAttempted - quizMissed) / quizAttempted,
    weakest: ranked.find((u) => u.score > 0) ?? null,
  }
}

/** Convenience for the screens: the open-miss count straight off the bank. */
export function totalOpenMisses(weakSpots: WeakSpotsState): number {
  return openMisses(weakSpots).length
}
