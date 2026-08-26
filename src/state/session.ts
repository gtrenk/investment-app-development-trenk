// ─── Smart Session ───────────────────────────────────────────────────────────
// One tap, one day's work: due reviews → today's lesson(s) → today's drill,
// with no trip back to the tab bar in between.
//
// This module is an *orchestrator*, not a player. It owns an ordered plan of
// steps and knows which route each one lives at; the reviewing, the lesson and
// the drill are the same screens they always were. Two consequences worth
// stating out loud:
//
//   • Nothing here is persisted. The plan is a pure function of the store's
//     own state (what is due, what has been studied today, what pace is set),
//     so an interruption needs no recovery record: leaving deactivates the
//     session, and starting again recomputes the plan from what is actually
//     done. Steps finished outside the session are simply skipped.
//
//   • There is no cursor. "Where am I?" is derived by asking each step whether
//     it is done yet — which is the same question that makes a restart correct,
//     so having one answer instead of two removes a whole class of drift.
//
// It deliberately imports no browser API and no store, so it stays testable in
// a plain Node unit test.

import { create } from 'zustand'
import type {
  CardId,
  CardState,
  DrillHistory,
  GameState,
  LessonId,
  ProgressState,
} from '@core/types'
import type { Pace } from '@core/settings'
import { answeredToday } from '@core/drills/engine'
import { dayLogFor, lessonGoalToday, todayQueue, upcomingLessons } from './selectors'

// ── Steps ────────────────────────────────────────────────────────────────────

export type SessionStep =
  | {
      kind: 'review'
      /** Cards waiting when the plan was built — what the CTA promises. */
      due: number
      /**
       * Today's review count that marks this step cleared. Absolute rather than
       * relative because reviews done *before* the session started must not
       * count toward it — otherwise a learner who ground 20 cards this morning
       * would find the session's own review step pre-ticked.
       */
      target: number
    }
  | { kind: 'lesson'; id: LessonId; title: string }
  | { kind: 'drill' }

/** Everything the plan is a function of. A plain snapshot — no store, no clock. */
export interface SessionInput {
  today: string
  progress: ProgressState
  srs: Record<CardId, CardState>
  game: GameState
  drillHistory: DrillHistory
  pace: Pace
}

/**
 * Today's remaining work, in the order it should be done.
 *
 * Reviews first (warm up on what you already know), then the new lessons the
 * pace asks for, then the drill — applying what was learned is the right note
 * to end on, and it is the one step that is never long.
 *
 * Only *remaining* work appears: a lesson already finished today is not a step,
 * which is what makes "start the session again after lunch" do the right thing.
 */
export function buildSessionPlan(input: SessionInput): SessionStep[] {
  const { today, progress, srs, game, drillHistory, pace } = input
  const day = dayLogFor({ game }, today)
  const steps: SessionStep[] = []

  const due = todayQueue(srs, today, pace).length
  if (due > 0) steps.push({ kind: 'review', due, target: day.reviews + due })

  const wanted = Math.max(0, lessonGoalToday(progress, pace) - day.lessons)
  for (const lesson of upcomingLessons(progress, wanted)) {
    steps.push({ kind: 'lesson', id: lesson.id, title: lesson.title })
  }

  if (!answeredToday(drillHistory, today)) steps.push({ kind: 'drill' })

  return steps
}

/**
 * The plan as it stands *now*: the steps planned at the start, plus any work
 * the session itself created.
 *
 * There is exactly one such case, and it matters: finishing a lesson mints its
 * flashcards, and those cards are due today. A learner at pace 2 who started
 * with an empty queue would otherwise finish the whole session with the daily
 * goal still unmet — "clear your review queue" fails against a queue that only
 * appeared halfway through. So once everything planned is done, a review step
 * for whatever is now due is appended.
 *
 * Only at the end, deliberately: a review step added while lessons are still
 * outstanding would have to promise a card count before the remaining lessons
 * have minted theirs, and "Review 4 cards" leading to a queue of 8 is worse
 * than saying nothing yet.
 *
 * Derived rather than stored, so it stays true after an interruption, and
 * bounded: each appended review step has to be cleared before another can
 * appear, and only lessons (which are finite) create cards.
 */
export function livePlan(plan: SessionStep[], input: SessionInput): SessionStep[] {
  if (plan.length === 0 || pendingIndex(plan, input) !== -1) return plan
  const fresh = buildSessionPlan(input).find((s) => s.kind === 'review')
  return fresh ? [...plan, fresh] : plan
}

/** Has this step been satisfied — by the session, or by anything else? */
export function isStepDone(step: SessionStep, input: SessionInput): boolean {
  switch (step.kind) {
    case 'review': {
      const day = dayLogFor({ game: input.game }, input.today)
      // Either the target was hit, or the queue emptied early — which happens
      // whenever the cap held back fewer cards than the plan expected.
      return (
        day.reviews >= step.target || todayQueue(input.srs, input.today, input.pace).length === 0
      )
    }
    case 'lesson':
      return Boolean(input.progress.completedLessons[step.id])
    case 'drill':
      return answeredToday(input.drillHistory, input.today)
  }
}

/** Index of the first step still to do, or -1 when the session is finished. */
export function pendingIndex(plan: SessionStep[], input: SessionInput): number {
  return plan.findIndex((step) => !isStepDone(step, input))
}

export function pendingStep(plan: SessionStep[], input: SessionInput): SessionStep | null {
  const i = pendingIndex(plan, input)
  return i === -1 ? null : plan[i]
}

// ── Presentation helpers ─────────────────────────────────────────────────────

/** Where a step is played. The real routes — no session-only copies exist. */
export function stepRoute(step: SessionStep): string {
  switch (step.kind) {
    case 'review':
      return '/review'
    case 'lesson':
      return `/lesson/${step.id}`
    case 'drill':
      return '/drill'
  }
}

/** Long label — the "Next: …" button and the complete screen's summary. */
export function stepLabel(step: SessionStep): string {
  switch (step.kind) {
    case 'review':
      return `Review ${step.due} card${step.due === 1 ? '' : 's'}`
    case 'lesson':
      return step.title
    case 'drill':
      return 'Daily drill'
  }
}

/** Short label — the rail, where four of them share 390 pixels. */
export function stepShortLabel(step: SessionStep, plan: SessionStep[]): string {
  switch (step.kind) {
    case 'review':
      return 'Review'
    case 'drill':
      return 'Drill'
    case 'lesson': {
      const lessons = plan.filter((s) => s.kind === 'lesson')
      if (lessons.length <= 1) return 'Lesson'
      return `Lesson ${lessons.indexOf(step) + 1}`
    }
  }
}

/** Minutes a card, a lesson and a drill are each worth, for the estimate. */
export const MINUTES_PER_REVIEW = 0.2
export const MINUTES_PER_LESSON = 2.5
export const MINUTES_PER_DRILL = 1.5

/**
 * Roughly how long the plan takes, in whole minutes.
 *
 * Deliberately an under-promise on the low end: a one-card day rounds to 1
 * rather than 0, because "0 min" reads as broken rather than as quick.
 */
export function sessionEstimateMinutes(plan: SessionStep[]): number {
  const minutes = plan.reduce((sum, step) => {
    if (step.kind === 'review') return sum + step.due * MINUTES_PER_REVIEW
    if (step.kind === 'lesson') return sum + MINUTES_PER_LESSON
    return sum + MINUTES_PER_DRILL
  }, 0)
  return plan.length === 0 ? 0 : Math.max(1, Math.round(minutes))
}

// ── The store ────────────────────────────────────────────────────────────────

export interface SessionState {
  /** True from "Start today's session" until the learner leaves the flow. */
  active: boolean
  /** The steps planned at start. Frozen for display; doneness is live. */
  plan: SessionStep[]
  /** Build a plan from the given snapshot and open the session. */
  start: (input: SessionInput) => SessionStep | null
  /**
   * Commit a plan that `livePlan` has grown, so the step it added survives
   * being completed — a rail and a summary that dropped the reviews the moment
   * they were done would be lying about what the session actually was.
   */
  adopt: (plan: SessionStep[]) => void
  /** Deactivate. Called by the route guard whenever the flow is left. */
  end: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  active: false,
  plan: [],

  start(input) {
    const plan = buildSessionPlan(input)
    set({ active: true, plan })
    return pendingStep(plan, input)
  },

  adopt(plan) {
    set((s) => (s.plan.length === plan.length ? s : { plan }))
  },

  end() {
    set({ active: false, plan: [] })
  },
}))
