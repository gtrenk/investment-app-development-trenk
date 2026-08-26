// ─── Case player ─────────────────────────────────────────────────────────────
// One case, one step at a time, in the focus layout: header and step rail →
// (optional) statements → the step → Next.
//
// THE PLACE IS THE STORE'S, NOT THE COMPONENT'S. `stepIdx` lives in the
// persisted case state rather than in `useState`, so backgrounding the tab
// twenty minutes into an analysis and coming back tomorrow lands on the same
// step with the same answers already revealed. That is also why every answer
// and every keystroke of the thesis box is written through immediately.
//
// The statements toggle, by contrast, is deliberately component state: it is a
// view preference for this sitting, and remembering it across sessions would
// mean opening a case tomorrow to a collapsed table you do not remember closing.

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { CaseStep, FinStatementSnapshot, QuizItem } from '@core/types'
import { CASES, CASE_ORDER, caseById, caseNumber } from '@content/cases'
import {
  XP_CASE_QUESTION,
  caseItems,
  caseThesisCount,
  completionXp,
  isCaseUnlocked,
  scoreCase,
} from '@core/cases/progress'
import { speakableFromMarkdown, speakableQuiz } from '@core/speech/text'
import { useCasesStore } from '@state/cases'
import { useAppStore } from '@state/useAppStore'
import { useStatements } from '@ui/data/loadFinancials'
import type { StatementsQuery } from '@ui/data/loadFinancials'
import { Markdown } from '@ui/components/Markdown'
import { QuizChoice } from '@ui/components/QuizChoice'
import type { ChoiceState } from '@ui/components/QuizChoice'
import { StatementTable, shortName } from '@ui/components/StatementTable'
import { isSupported, speak, stop } from '@ui/speech/tts'

/** How long the thesis box waits after the last keystroke before persisting. */
const THESIS_SAVE_MS = 500

const KIND_LABEL: Record<CaseStep['kind'], string> = {
  read: 'Read',
  question: 'Judge',
  calc: 'Compute',
  thesis: 'Write',
}

// ── Statements ───────────────────────────────────────────────────────────────

/**
 * `Harborline FY2023 + FY2024`, or `Skyline vs Halden`.
 *
 * The toggle has to say what is behind it, because on a phone the table is a
 * whole screen tall and it is collapsed most of the time — a bar reading only
 * "Statements" makes the learner open it to find out whether it is the one they
 * want.
 */
function statementsLabel(statements: readonly FinStatementSnapshot[]): string {
  if (statements.length === 0) return 'Statements'
  const names = [...new Set(statements.map((s) => shortName(s.company)))]
  if (names.length === 1) return `${names[0]} ${statements.map((s) => s.period).join(' + ')}`
  return names.join(' vs ')
}

function Statements({ query, open }: { query: StatementsQuery; open: boolean }) {
  const { statements, loading, error } = query

  if (!open) return null
  if (error) {
    return (
      <p
        data-testid="case-statements-error"
        className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-3 py-3 text-xs text-rose-200"
      >
        {error}
      </p>
    )
  }
  if (loading) {
    return (
      <div
        data-testid="case-statements-loading"
        className="h-32 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70"
      />
    )
  }
  return <StatementTable companies={statements} />
}

// ── Quiz ─────────────────────────────────────────────────────────────────────

function choiceState(index: number, item: QuizItem, picked: number | undefined): ChoiceState {
  if (picked === undefined) return 'idle'
  if (index === item.answerIdx) return picked === item.answerIdx ? 'correct' : 'revealed'
  return index === picked ? 'wrong' : 'idle'
}

function QuizStep({
  item,
  formulaHint,
  picked,
  onPick,
}: {
  item: QuizItem
  formulaHint?: string
  picked: number | undefined
  onPick: (index: number) => void
}) {
  return (
    <div data-testid="case-quiz" data-item-id={item.id}>
      <Markdown md={item.prompt} className="text-[15px]" />

      {formulaHint && (
        <p
          data-testid="case-formula-hint"
          className="mt-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 font-mono text-[12px] leading-relaxed text-emerald-300"
        >
          {formulaHint}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {item.choices.map((text, i) => (
          <QuizChoice
            key={i}
            index={i}
            text={text}
            state={choiceState(i, item, picked)}
            disabled={picked !== undefined}
            onPick={() => onPick(i)}
          />
        ))}
      </div>

      {picked !== undefined && (
        <div
          data-testid="case-explain"
          data-correct={picked === item.answerIdx}
          className="anim-fade-up mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-3.5 py-3.5"
        >
          <p
            className={`mb-2 text-xs font-bold uppercase tracking-widest ${
              picked === item.answerIdx ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {picked === item.answerIdx ? 'Correct' : 'Not quite'}
          </p>
          <Markdown md={item.explain} className="text-[13.5px]" />
        </div>
      )}
    </div>
  )
}

// ── Thesis ───────────────────────────────────────────────────────────────────

function ThesisStep({
  prompts,
  value,
  onChange,
}: {
  prompts: readonly string[]
  value: string
  onChange: (text: string) => void
}) {
  return (
    <div data-testid="case-thesis">
      <h2 className="text-lg font-bold text-white">Write it down</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-slate-400">
        Nothing here is graded. The point is to commit to a view before you read what the case
        concludes — you will see both side by side at the end.
      </p>
      <ol className="mt-4 space-y-2">
        {prompts.map((p, i) => (
          <li key={i} className="flex gap-2 text-[13.5px] leading-snug text-slate-300">
            <span className="mt-px shrink-0 font-semibold tabular-nums text-emerald-400">
              {i + 1}.
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ol>
      <textarea
        data-testid="case-thesis-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={9}
        placeholder="Your analysis…"
        className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-900 px-3.5 py-3 text-[14px] leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
      />
      <p className="mt-1.5 text-[11px] text-slate-600">Saved as you type.</p>
    </div>
  )
}

// ── Player ───────────────────────────────────────────────────────────────────

export function CasePlayer() {
  const { id = '' } = useParams()
  const study = caseById(id)

  const hydrate = useCasesStore((s) => s.hydrate)
  const ready = useCasesStore((s) => s.ready)
  const completed = useCasesStore((s) => s.completed)
  const inProgress = useCasesStore((s) => s.inProgress)
  const pendingXp = useCasesStore((s) => s.pendingXp)
  const begin = useCasesStore((s) => s.begin)
  const goToStep = useCasesStore((s) => s.goToStep)
  const answer = useCasesStore((s) => s.answer)
  const saveThesis = useCasesStore((s) => s.saveThesis)
  const finish = useCasesStore((s) => s.finish)

  const readAloud = useAppStore((s) => s.settings.readAloud)
  const [ttsAvailable] = useState(isSupported)

  /**
   * The completion snapshot. It carries the thesis text because finishing
   * clears `inProgress`, and the whole point of the last screen is to put what
   * the learner wrote next to what the model analysis concluded.
   */
  const [done, setDone] = useState<{
    score: number
    total: number
    replay: boolean
    thesisTexts: string[]
  } | null>(null)
  /**
   * `null` means "whatever this step wants". Only the opening step of a case
   * shows the table by default: it is a whole screen tall at 390px, so leaving
   * it open on a question step would push the question — and the four choices
   * that answer it — entirely below the fold.
   */
  const [statementsOverride, setStatementsOverride] = useState<boolean | null>(null)
  const settled = useRef(false)

  const thesisCount = study ? caseThesisCount(study) : 0
  const items = useMemo(() => (study ? caseItems(study) : []), [study])

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  // Open the case once the store knows what is already on disk — calling it any
  // earlier would begin a fresh sitting on top of a half-finished one.
  useEffect(() => {
    if (ready && study) begin(study.id, thesisCount)
  }, [ready, study, thesisCount, begin])

  const mine = inProgress?.caseId === id ? inProgress : undefined
  const stepIdx = Math.min(mine?.stepIdx ?? 0, (study?.steps.length ?? 1) - 1)
  const step: CaseStep | undefined = study?.steps[stepIdx]
  const stepStatementIds = step && step.kind !== 'thesis' ? step.statementIds : []
  const statementsQuery = useStatements(stepStatementIds)

  // A new step forgets whatever the last one was toggled to.
  useEffect(() => setStatementsOverride(null), [stepIdx])

  // ── Speech ────────────────────────────────────────────────────────────────
  // One effect owns everything the voice says, keyed on what is on screen.
  // No auto-advance: a case step is a page of analysis, not a lesson card, and
  // turning the page out from under a reader who is still looking at a
  // statement table would be worse than silence.
  const listening = readAloud.enabled && ttsAvailable
  useEffect(() => {
    if (!listening || !step || done) {
      stop()
      return
    }
    if (step.kind === 'read') {
      speak([speakableFromMarkdown(step.md)], { rate: readAloud.rate })
      return
    }
    if (step.kind === 'thesis') {
      speak([speakableFromMarkdown(step.prompts.join('\n\n'))], { rate: readAloud.rate })
      return
    }
    const spoken = speakableQuiz(step.item)
    speak([spoken.question, ...spoken.choices], { rate: readAloud.rate })
  }, [listening, readAloud.rate, step, done])

  useEffect(() => stop, [])

  if (!study) {
    return (
      <div className="safe-top px-4 py-16 text-center">
        <p className="text-5xl">🗂️</p>
        <h1 className="mt-4 text-lg font-bold text-slate-100">Case not found</h1>
        <Link to="/cases" className="mt-4 inline-block text-sm font-semibold text-emerald-400">
          Back to case studies
        </Link>
      </div>
    )
  }

  const unlocked = isCaseUnlocked({ completed, inProgress, pendingXp }, CASE_ORDER, study.id)
  if (ready && !unlocked) {
    const previous = CASES[CASE_ORDER.indexOf(study.id) - 1]
    return (
      <div className="safe-top px-4 py-16 text-center" data-testid="case-locked">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 text-lg font-bold text-slate-100">{study.title} is locked</h1>
        <p className="mt-1 text-sm text-slate-500">
          Finish “{previous?.title}” first — this case builds directly on it.
        </p>
        <Link to="/cases" className="mt-4 inline-block text-sm font-semibold text-emerald-400">
          Back to case studies
        </Link>
      </div>
    )
  }

  const answers = mine?.answers ?? {}
  const total = items.length

  const finishCase = () => {
    if (settled.current) return
    settled.current = true
    const replay = Boolean(completed[study.id])
    const score = scoreCase(study, answers)
    const thesisTexts = [...(mine?.thesisTexts ?? [])]
    finish(study.id, { score, total })
    const banked = useCasesStore.getState().claimPendingXp()
    if (banked > 0) useAppStore.getState().awardCaseXp(banked)
    setDone({ score, total, replay, thesisTexts })
    stop()
  }

  const advance = () => {
    if (stepIdx + 1 >= study.steps.length) finishCase()
    else goToStep(study.id, stepIdx + 1)
  }

  const back = () => {
    if (stepIdx > 0) goToStep(study.id, stepIdx - 1)
  }

  // ── Completion ────────────────────────────────────────────────────────────

  if (done) {
    const earned = done.score * XP_CASE_QUESTION + completionXp(study.id)
    return (
      <div className="safe-top space-y-5 px-4 pb-12" data-testid="case-complete">
        <header className="text-center">
          <p aria-hidden className="text-5xl">
            🧾
          </p>
          <h1 className="mt-3 text-xl font-extrabold tracking-tight text-white">
            {study.title} — complete
          </h1>
          <p className="mt-1 text-sm text-slate-500">Case {caseNumber(study.id)} of {CASES.length}</p>
        </header>

        <section className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5">
            <p className="text-2xl font-extrabold tabular-nums text-white" data-testid="case-score">
              {done.score}
              <span className="text-base text-slate-500">/{done.total}</span>
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">
              right first time
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 px-4 py-3.5">
            <p
              className="text-2xl font-extrabold tabular-nums text-emerald-300"
              data-testid="case-xp-earned"
            >
              +{earned}
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">
              {done.replay ? 'already banked' : 'XP earned'}
            </p>
          </div>
        </section>

        <section
          data-testid="case-verdict"
          data-checklist-score={study.verdict.checklistScore}
          className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4"
        >
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400/80">
              The model verdict
            </h2>
            <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-500">
              checklist {study.verdict.checklistScore}/10
            </span>
          </div>
          <Markdown md={study.verdict.md} className="text-[13.5px]" />
        </section>

        {done.thesisTexts.some((t) => t.trim() !== '') && (
          <section
            data-testid="case-your-thesis"
            className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4"
          >
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              What you wrote
            </h2>
            {done.thesisTexts
              .filter((t) => t.trim() !== '')
              .map((t, i) => (
                <p key={i} className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-300">
                  {t}
                </p>
              ))}
          </section>
        )}

        <p className="text-xs leading-relaxed text-slate-600">
          {pendingXp} XP banked from case studies so far.
        </p>

        <Link
          to="/cases"
          data-testid="case-back-to-list"
          className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-emerald-500 text-base font-bold text-slate-950 active:bg-emerald-400"
        >
          Back to case studies
        </Link>
      </div>
    )
  }

  // ── A step ────────────────────────────────────────────────────────────────

  if (!step) return null

  const statementIds = stepStatementIds
  const showStatements = statementsOverride ?? stepIdx === 0
  const picked = step.kind === 'question' || step.kind === 'calc' ? answers[step.item.id] : undefined
  const mustAnswer = (step.kind === 'question' || step.kind === 'calc') && picked === undefined

  return (
    <div className="flex min-h-dvh flex-col" data-testid="case-player" data-case-id={study.id}>
      <header className="safe-top sticky top-0 z-10 bg-slate-950/95 px-4 pb-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            to="/cases"
            aria-label="Leave case"
            data-testid="case-exit"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-400 active:bg-slate-800"
          >
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] uppercase tracking-widest text-slate-500">
              Case {caseNumber(study.id)} · {KIND_LABEL[step.kind]}
            </p>
            <h1 className="truncate text-[15px] font-bold text-white">{study.title}</h1>
          </div>
          <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-500">
            {stepIdx + 1}/{study.steps.length}
          </span>
        </div>

        {/* Step rail — one segment per step, so the shape of the case is visible */}
        <div className="mt-2.5 flex gap-1" data-testid="case-rail">
          {study.steps.map((s, i) => (
            <span
              key={i}
              data-active={i === stepIdx}
              className={`h-1 flex-1 rounded-full ${
                i < stepIdx
                  ? 'bg-emerald-500'
                  : i === stepIdx
                    ? 'bg-emerald-400'
                    : s.kind === 'thesis'
                      ? 'bg-slate-700'
                      : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </header>

      <div className="momentum flex-1 space-y-4 px-4 pb-6 pt-4" data-testid="case-step" data-kind={step.kind} data-idx={stepIdx}>
        {statementIds.length > 0 && (
          <div className="space-y-2">
            <button
              type="button"
              data-testid="case-statements-toggle"
              aria-expanded={showStatements}
              onClick={() => setStatementsOverride(!showStatements)}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3.5 py-2.5 text-left"
            >
              <span className="min-w-0 flex-1 truncate text-[12px] font-bold uppercase tracking-wide text-slate-300">
                📄 {statementsLabel(statementsQuery.statements)}
              </span>
              <span aria-hidden className="shrink-0 text-xs font-semibold text-emerald-400">
                {showStatements ? 'Hide ▲' : 'Show ▼'}
              </span>
            </button>
            <Statements query={statementsQuery} open={showStatements} />
          </div>
        )}

        {step.kind === 'read' && <Markdown md={step.md} className="text-[14.5px]" />}

        {(step.kind === 'question' || step.kind === 'calc') && (
          <QuizStep
            item={step.item}
            formulaHint={step.kind === 'calc' ? step.formulaHint : undefined}
            picked={picked}
            onPick={(i) => answer(study.id, step.item.id, i, i === step.item.answerIdx)}
          />
        )}

        {step.kind === 'thesis' && (
          <ThesisBox
            prompts={step.prompts}
            thesisIdx={thesisIndexOf(study.steps, stepIdx)}
            saved={mine?.thesisTexts ?? []}
            onSave={(idx, text) => saveThesis(study.id, idx, text)}
          />
        )}
      </div>

      <footer className="safe-bottom sticky bottom-0 flex gap-2 border-t border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur">
        {stepIdx > 0 && (
          <button
            type="button"
            data-testid="case-back"
            onClick={back}
            className="flex min-h-[52px] w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-700 text-lg text-slate-300 active:bg-slate-800"
            aria-label="Previous step"
          >
            ←
          </button>
        )}
        <button
          type="button"
          data-testid="case-next"
          disabled={mustAnswer}
          onClick={advance}
          className="flex min-h-[52px] flex-1 items-center justify-center rounded-2xl bg-emerald-500 text-base font-bold text-slate-950 active:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500"
        >
          {mustAnswer
            ? 'Pick an answer'
            : stepIdx + 1 >= study.steps.length
              ? 'Finish case'
              : 'Next'}
        </button>
      </footer>
    </div>
  )
}

/** How many thesis steps precede `stepIdx` — i.e. this step's slot in `thesisTexts`. */
function thesisIndexOf(steps: readonly CaseStep[], stepIdx: number): number {
  let n = 0
  for (let i = 0; i < stepIdx; i++) if (steps[i].kind === 'thesis') n += 1
  return n
}

/**
 * The thesis box keeps its own draft and pushes it into the store on a short
 * debounce.
 *
 * Writing on every keystroke would put an IndexedDB round trip behind the
 * caret; writing only on Next would lose the paragraph a learner typed before
 * the tab was killed. Half a second is short enough that nothing meaningful is
 * ever at risk and long enough that a sentence costs one write, not forty.
 */
function ThesisBox({
  prompts,
  thesisIdx,
  saved,
  onSave,
}: {
  prompts: readonly string[]
  thesisIdx: number
  saved: readonly string[]
  onSave: (idx: number, text: string) => void
}) {
  const [draft, setDraft] = useState(saved[thesisIdx] ?? '')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<string | null>(null)

  // A different thesis step (or a resume) re-seeds the box from storage.
  useEffect(() => {
    setDraft(saved[thesisIdx] ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thesisIdx])

  useEffect(() => {
    return () => {
      if (timer.current !== null) clearTimeout(timer.current)
      if (pending.current !== null) onSave(thesisIdx, pending.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thesisIdx])

  const change = (text: string) => {
    setDraft(text)
    pending.current = text
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      timer.current = null
      pending.current = null
      onSave(thesisIdx, text)
    }, THESIS_SAVE_MS)
  }

  return <ThesisStep prompts={prompts} value={draft} onChange={change} />
}
