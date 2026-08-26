// ─── Case-study progress ─────────────────────────────────────────────────────
// Pure reducers over the persisted case state. The zustand store in
// src/state/cases.ts is a write-through shell around these; everything that can
// be decided without React or IndexedDB is decided here.
//
// TWO THINGS ARE PERSISTED, and they are deliberately different shapes:
//
//   • `completed` — one durable record per finished case: when, how well, and
//     the learner's own written thesis. Never overwritten by a replay with a
//     worse score, because the record is a diary entry, not a high score.
//   • `inProgress` — at most one, because a case is a sitting. Opening a second
//     case abandons the first rather than juggling two half-finished analyses,
//     which is also what makes "resume where I left off" unambiguous.
//
// XP IS TALLIED, NOT SPENT. `pendingXp` accumulates what the cases have earned
// and nothing here awards it: the XP/streak/badge store is owned elsewhere and
// will claim this figure once the two halves are wired together. Until then the
// completion screen reads its "+N XP earned" straight off this tally.

import type { CaseId, CaseStudy, QuizItem } from '../types'

// ── XP ───────────────────────────────────────────────────────────────────────

/** Per question or calc step answered right on the first attempt. */
export const XP_CASE_QUESTION = 10

/** For reaching the end of any case. */
export const XP_CASE_COMPLETE = 25

/** On top of the above, once, for finishing the capstone. */
export const XP_CASE_CAPSTONE_BONUS = 50

/** The case that pays the capstone bonus. */
export const CAPSTONE_CASE_ID: CaseId = 'c6'

// ── Shape ────────────────────────────────────────────────────────────────────

export interface CaseCompletion {
  /** Local date 'YYYY-MM-DD' the case was finished. */
  date: string
  /** Questions answered correctly on the first attempt. */
  score: number
  /** Questions the case asks — so `score / total` survives a content edit. */
  total: number
  /** One entry per thesis step, in step order. */
  thesisTexts: string[]
}

export interface CaseInProgress {
  caseId: CaseId
  /** Index into `CaseStudy.steps` the learner is looking at. */
  stepIdx: number
  /** Quiz item id → the choice index picked **first**. Later picks never land. */
  answers: Record<string, number>
  thesisTexts: string[]
}

export interface CasesState {
  completed: Record<CaseId, CaseCompletion>
  inProgress?: CaseInProgress
  /** Earned by cases, not yet handed to the gamification store. */
  pendingXp: number
}

export function emptyCasesState(): CasesState {
  // `inProgress` is spelled out rather than omitted so that spreading this over
  // a live state actually clears a sitting instead of leaving the old one behind.
  return { completed: {}, inProgress: undefined, pendingXp: 0 }
}

// ── Defensive read ───────────────────────────────────────────────────────────

function asInt(v: unknown, min: number): number {
  return typeof v === 'number' && Number.isFinite(v) && v >= min ? Math.floor(v) : min
}

function asStrings(v: unknown): string[] {
  return Array.isArray(v) ? v.map((t) => (typeof t === 'string' ? t : '')) : []
}

function asAnswers(v: unknown): Record<string, number> {
  const out: Record<string, number> = {}
  if (!v || typeof v !== 'object') return out
  for (const [k, raw] of Object.entries(v as Record<string, unknown>)) {
    if (typeof raw === 'number' && Number.isInteger(raw) && raw >= 0 && raw <= 3) out[k] = raw
  }
  return out
}

/**
 * Never throws, never returns a partial object — a record written by a future
 * build, or half-cleared storage, degrades to "nothing done yet" rather than
 * crashing the case list.
 */
export function sanitizeCasesState(raw: unknown): CasesState {
  const base = emptyCasesState()
  if (!raw || typeof raw !== 'object') return base

  const r = raw as Partial<CasesState>

  if (r.completed && typeof r.completed === 'object') {
    for (const [id, entry] of Object.entries(r.completed)) {
      if (!entry || typeof entry !== 'object') continue
      const e = entry as Partial<CaseCompletion>
      if (typeof e.date !== 'string' || e.date === '') continue
      base.completed[id] = {
        date: e.date,
        score: asInt(e.score, 0),
        total: asInt(e.total, 0),
        thesisTexts: asStrings(e.thesisTexts),
      }
    }
  }

  const p = r.inProgress
  if (p && typeof p === 'object' && typeof p.caseId === 'string' && p.caseId !== '') {
    base.inProgress = {
      caseId: p.caseId,
      stepIdx: asInt(p.stepIdx, 0),
      answers: asAnswers(p.answers),
      thesisTexts: asStrings(p.thesisTexts),
    }
  }

  base.pendingXp = asInt(r.pendingXp, 0)
  return base
}

// ── Unlocking ────────────────────────────────────────────────────────────────

/**
 * A case is open when the one before it is finished; the first is always open.
 *
 * Sequential rather than free choice because the ramp is the pedagogy: case 5
 * assumes the learner has already argued with a cheap P/E in case 3 and with
 * stock-based compensation in case 2.
 */
export function isCaseUnlocked(state: CasesState, orderedIds: readonly CaseId[], id: CaseId): boolean {
  const idx = orderedIds.indexOf(id)
  if (idx <= 0) return idx === 0
  return Boolean(state.completed[orderedIds[idx - 1]])
}

/** The furthest case the learner may open — where the list scrolls to. */
export function nextOpenCaseId(
  state: CasesState,
  orderedIds: readonly CaseId[],
): CaseId | undefined {
  return orderedIds.find((id) => !state.completed[id] && isCaseUnlocked(state, orderedIds, id))
}

// ── Scoring ──────────────────────────────────────────────────────────────────

/** Every quiz item a case asks, in step order. */
export function caseItems(study: CaseStudy): QuizItem[] {
  const out: QuizItem[] = []
  for (const step of study.steps) {
    if (step.kind === 'question' || step.kind === 'calc') out.push(step.item)
  }
  return out
}

/** How many thesis steps a case has — the length of `thesisTexts`. */
export function caseThesisCount(study: CaseStudy): number {
  return study.steps.filter((s) => s.kind === 'thesis').length
}

/** Items answered correctly on the first attempt. */
export function scoreCase(study: CaseStudy, answers: Record<string, number>): number {
  let score = 0
  for (const item of caseItems(study)) {
    if (answers[item.id] === item.answerIdx) score += 1
  }
  return score
}

/** XP a finished case pays for reaching the end, before per-question XP. */
export function completionXp(caseId: CaseId): number {
  return XP_CASE_COMPLETE + (caseId === CAPSTONE_CASE_ID ? XP_CASE_CAPSTONE_BONUS : 0)
}

// ── Reducers ─────────────────────────────────────────────────────────────────

/**
 * Open a case. Resuming the one already in progress is a no-op, so the caller
 * can call this unconditionally on mount without resetting the learner's place.
 */
export function beginCase(state: CasesState, caseId: CaseId, thesisCount: number): CasesState {
  if (state.inProgress?.caseId === caseId) return state
  return {
    ...state,
    inProgress: {
      caseId,
      stepIdx: 0,
      answers: {},
      thesisTexts: Array.from({ length: thesisCount }, () => ''),
    },
  }
}

export function setCaseStep(state: CasesState, caseId: CaseId, stepIdx: number): CasesState {
  if (state.inProgress?.caseId !== caseId) return state
  return { ...state, inProgress: { ...state.inProgress, stepIdx: Math.max(0, stepIdx) } }
}

/**
 * Record a pick.
 *
 * The **first** pick for an item is the one that counts, forever: a case is
 * allowed to show the explanation and let the learner keep reading, but the
 * score has to mean "got it right first time" or it means nothing. A replay of
 * an already-completed case records answers but pays no XP.
 */
export function recordCaseAnswer(
  state: CasesState,
  caseId: CaseId,
  itemId: string,
  choiceIdx: number,
  correct: boolean,
): CasesState {
  const p = state.inProgress
  if (p?.caseId !== caseId) return state
  if (itemId in p.answers) return state

  const firstTimeThrough = !state.completed[caseId]
  return {
    ...state,
    pendingXp: state.pendingXp + (correct && firstTimeThrough ? XP_CASE_QUESTION : 0),
    inProgress: { ...p, answers: { ...p.answers, [itemId]: choiceIdx } },
  }
}

/** `thesisIdx` counts thesis steps, not steps — see `caseThesisCount`. */
export function saveCaseThesis(
  state: CasesState,
  caseId: CaseId,
  thesisIdx: number,
  text: string,
): CasesState {
  const p = state.inProgress
  if (p?.caseId !== caseId || thesisIdx < 0) return state
  const thesisTexts = [...p.thesisTexts]
  while (thesisTexts.length <= thesisIdx) thesisTexts.push('')
  thesisTexts[thesisIdx] = text
  return { ...state, inProgress: { ...p, thesisTexts } }
}

/**
 * Finish: fold the in-progress record into `completed` and clear it.
 *
 * `score` and `total` come from the caller because these reducers are
 * content-free by design — `scoreCase` above needs the `CaseStudy`, and the
 * persisted state deliberately does not carry one.
 *
 * A replay that scores worse does not overwrite the original: the entry is a
 * record of a sitting, and the first honest run is the informative one. It does
 * pick up whatever the learner rewrote in the thesis box, because that is the
 * one field they are meant to keep improving.
 */
export function completeCase(
  state: CasesState,
  caseId: CaseId,
  result: { score: number; total: number; date: string },
): CasesState {
  const p = state.inProgress
  if (p?.caseId !== caseId) return state

  const previous = state.completed[caseId]
  const wrote = p.thesisTexts.some((t) => t.trim() !== '')
  const entry: CaseCompletion = previous
    ? {
        date: previous.date,
        score: Math.max(previous.score, result.score),
        total: result.total || previous.total,
        thesisTexts: wrote ? p.thesisTexts : previous.thesisTexts,
      }
    : { date: result.date, score: result.score, total: result.total, thesisTexts: p.thesisTexts }

  return {
    completed: { ...state.completed, [caseId]: entry },
    inProgress: undefined,
    pendingXp: state.pendingXp + (previous ? 0 : completionXp(caseId)),
  }
}

/** Drop everything — used by the tests and by a profile wipe. */
export function clearCases(): CasesState {
  return emptyCasesState()
}
