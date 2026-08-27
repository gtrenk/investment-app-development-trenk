// ─── Placement test ──────────────────────────────────────────────────────────
// intro → five questions a unit → interstitial → results → apply.
//
// The one thing that makes this screen different from the lesson player: it
// never says whether an answer was right. An exam that explained itself after
// every question would teach the next one, and the score would stop meaning
// "what you already knew". The explanations are all here — on the results
// screen, attached to the questions that were actually missed, where they are
// feedback rather than a hint.

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { QuizItem, UnitId } from '@core/types'
import { XP_PLACEMENT_UNIT } from '@core/gamification/xp'
import { speakableQuiz } from '@core/speech/text'
import {
  PLACEMENT_ITEMS_PER_UNIT,
  PLACEMENT_PASS_MARK,
  PLACEMENT_TRACKS,
  buildPlacementPlan,
  carriedResults,
  newPlacementState,
  nextUnitToTest,
  passed,
  placementOutcome,
  recordUnitResult,
  samplePlacement,
} from '@core/placement/engine'
import type { PlacementOutcome, PlacementState, PlacementTrack } from '@core/placement/engine'
import { ALL_UNITS, getUnit } from '@content/units'
import { useAppStore } from '@state/useAppStore'
import { Markdown } from '@ui/components/Markdown'
import { QuizChoice } from '@ui/components/QuizChoice'
import type { ChoiceState } from '@ui/components/QuizChoice'
import { isSupported, speak, stop } from '@ui/speech/tts'

/**
 * The ladder and its questions are pure functions of the shipped curriculum, so
 * they are computed once per module load rather than per mount — and a retake
 * therefore asks exactly the questions the first attempt did.
 */
const PLAN = buildPlacementPlan(ALL_UNITS)
const SAMPLES = samplePlacement(ALL_UNITS, PLAN)

const TRACK_LABEL: Record<PlacementTrack, string> = {
  fundamental: 'Fundamental analysis',
  technical: 'Technical analysis',
}

type Phase =
  | { kind: 'intro' }
  | { kind: 'quiz'; unitId: UnitId; index: number }
  | { kind: 'interstitial'; unitId: UnitId }
  | { kind: 'results' }

function unitTitle(unitId: UnitId): string {
  return getUnit(unitId)?.title ?? unitId
}

function unitNumber(unitId: UnitId): number {
  return getUnit(unitId)?.order ?? 0
}

function lessonCount(unitId: UnitId): number {
  return getUnit(unitId)?.lessons.length ?? 0
}

// ── Screen ───────────────────────────────────────────────────────────────────

export function PlacementScreen() {
  const navigate = useNavigate()
  const applyPlacement = useAppStore((s) => s.applyPlacement)
  const recordQuizMiss = useAppStore((s) => s.recordQuizMiss)
  const alreadyPassed = useAppStore((s) => s.placement.passedUnits)

  const listening = useAppStore((s) => s.settings.readAloud.enabled)
  const rate = useAppStore((s) => s.settings.readAloud.rate)
  const setReadAloud = useAppStore((s) => s.setReadAloud)
  const [ttsAvailable] = useState(isSupported)

  // Seeded once from what the profile already tested out of, so a retake
  // resumes at the first uncredited unit instead of re-asking Unit 1.
  const [state, setState] = useState<PlacementState>(() =>
    newPlacementState(PLAN, carriedResults(PLAN, alreadyPassed)),
  )
  const [phase, setPhase] = useState<Phase>({ kind: 'intro' })
  const [picked, setPicked] = useState<number | null>(null)
  /** itemId → the choice index the learner tapped. Drives the results review. */
  const [answers, setAnswers] = useState<Record<string, number>>({})

  const items: QuizItem[] = phase.kind === 'quiz' ? (SAMPLES[phase.unitId] ?? []) : []
  const item = phase.kind === 'quiz' ? items[phase.index] : undefined

  const outcome = useMemo(() => placementOutcome(state), [state])

  /**
   * "What is on screen", as one string. The speech effect keys on this and
   * nothing else, so an unrelated re-render (a tapped choice, an XP tick)
   * cannot restart the voice mid-sentence.
   */
  const spokenKey =
    phase.kind === 'quiz'
      ? `q:${item?.id ?? ''}`
      : phase.kind === 'interstitial'
        ? `i:${phase.unitId}`
        : phase.kind

  // ── Speech ────────────────────────────────────────────────────────────────
  // Same shape as the lesson player: one effect keyed on what is on screen, and
  // nothing at all is spoken about correctness while the test is running.
  useEffect(() => {
    if (!listening || !ttsAvailable) {
      stop()
      return
    }
    if (phase.kind === 'quiz' && item) {
      const spoken = speakableQuiz(item)
      speak([spoken.question, ...spoken.choices], { rate })
      return
    }
    if (phase.kind === 'interstitial') {
      const result = state.results.find((r) => r.unitId === phase.unitId)
      if (!result) return
      const next = nextUnitToTest(state)
      speak(
        [
          `Unit ${unitNumber(phase.unitId)}, ${unitTitle(phase.unitId)}. ` +
            `${result.correct} out of ${result.total}. ` +
            (passed(result) ? 'Passed.' : 'Not passed — you will study this one.'),
          next ? `Next up: Unit ${unitNumber(next)}, ${unitTitle(next)}.` : 'That is the last one.',
        ],
        { rate },
      )
      return
    }
    if (phase.kind === 'results') {
      speak(
        [
          'Placement complete.',
          outcome.passedUnits.length === 0
            ? 'You start at the beginning — Unit 1.'
            : `You tested out of ${outcome.passedUnits.length} unit${outcome.passedUnits.length === 1 ? '' : 's'}.`,
        ],
        { rate },
      )
    }
    // Keyed on "what is on screen" only — see the same note in LessonPlayer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, ttsAvailable, rate, spokenKey])

  useEffect(() => stop, [])

  // ── Transitions ───────────────────────────────────────────────────────────

  function start(): void {
    const first = nextUnitToTest(state)
    setPicked(null)
    setPhase(first ? { kind: 'quiz', unitId: first, index: 0 } : { kind: 'results' })
  }

  /** Bank the tapped answer and move on — no feedback, by design. */
  function submit(): void {
    if (phase.kind !== 'quiz' || picked === null || !item) return
    const nextAnswers = { ...answers, [item.id]: picked }
    setAnswers(nextAnswers)
    setPicked(null)

    // A missed exam question is a missed question: it enters the mistake bank
    // exactly like a missed lesson quiz item, so "fix my weak spots" can later
    // re-ask it. Recorded here, on the tap, rather than on the results screen —
    // this is the one place each answer is submitted exactly once, and a
    // learner who abandons the test halfway still keeps what it learned about
    // them. Silent, of course: the test says nothing about correctness, and
    // writing a record the learner cannot see does not change that.
    if (picked !== item.answerIdx) recordQuizMiss(item.id)

    if (phase.index + 1 < items.length) {
      setPhase({ kind: 'quiz', unitId: phase.unitId, index: phase.index + 1 })
      return
    }
    const correct = items.filter((q) => nextAnswers[q.id] === q.answerIdx).length
    setState(recordUnitResult(state, phase.unitId, correct, items.length))
    setPhase({ kind: 'interstitial', unitId: phase.unitId })
  }

  function advanceFromInterstitial(): void {
    const next = nextUnitToTest(state)
    setPicked(null)
    setPhase(next ? { kind: 'quiz', unitId: next, index: 0 } : { kind: 'results' })
  }

  function apply(): void {
    applyPlacement(outcome)
    navigate('/learn')
  }

  // ── Chrome ────────────────────────────────────────────────────────────────

  const header = (
    <header className="safe-top sticky top-0 z-10 bg-slate-950/95 px-4 pb-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-testid="placement-exit"
          aria-label="Leave the placement test"
          onClick={() => navigate('/')}
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-400 active:bg-slate-800"
        >
          ✕
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] uppercase tracking-widest text-slate-500">
            Placement test
          </p>
          <p className="truncate text-sm font-semibold text-slate-100">
            {phase.kind === 'quiz' || phase.kind === 'interstitial'
              ? `Unit ${unitNumber(phase.unitId)} · ${unitTitle(phase.unitId)}`
              : phase.kind === 'results'
                ? 'Your results'
                : 'Before you start'}
          </p>
        </div>
        {ttsAvailable && (
          <button
            type="button"
            data-testid="tts-toggle"
            aria-pressed={listening}
            aria-label={listening ? 'Turn off read aloud' : 'Read the questions aloud'}
            onClick={() => {
              if (listening) stop()
              setReadAloud({ enabled: !listening })
            }}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-base ${
              listening
                ? 'border-emerald-400/70 bg-emerald-400/10 text-emerald-300'
                : 'border-slate-700 text-slate-400 active:bg-slate-800'
            }`}
          >
            <span aria-hidden>{listening ? '🔊' : '🔈'}</span>
          </button>
        )}
      </div>
      {phase.kind === 'quiz' && (
        <div className="mt-2.5 flex gap-1" aria-hidden>
          {items.map((q, i) => (
            <span
              key={q.id}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= phase.index ? 'bg-emerald-400' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      )}
    </header>
  )

  return (
    <div className="flex min-h-dvh flex-col">
      {header}
      <div className="flex-1 px-4 pb-8 pt-4">
        {phase.kind === 'intro' && (
          <Intro onStart={start} alreadyPassed={alreadyPassed} resumeAt={nextUnitToTest(state)} />
        )}

        {phase.kind === 'quiz' && item && (
          <div className="space-y-4" data-testid="placement-question" data-unit={phase.unitId}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Question {phase.index + 1} of {items.length}
            </p>
            <h2 className="text-lg font-semibold leading-snug text-white" data-testid="quiz-prompt">
              {item.prompt}
            </h2>
            <div className="space-y-2.5">
              {item.choices.map((choice, i) => (
                <QuizChoice
                  key={`${item.id}-${i}`}
                  index={i}
                  text={choice}
                  state={(picked === i ? 'selected' : 'idle') as ChoiceState}
                  disabled={false}
                  onPick={() => setPicked(i)}
                />
              ))}
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              No answers until the end — this is a test, not a lesson.
            </p>
            <button
              type="button"
              data-testid="placement-next"
              disabled={picked === null}
              onClick={submit}
              className="min-h-[52px] w-full rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400 disabled:opacity-40"
            >
              {phase.index + 1 < items.length ? 'Next question' : 'Finish this unit'}
            </button>
          </div>
        )}

        {phase.kind === 'interstitial' && (
          <Interstitial state={state} unitId={phase.unitId} onContinue={advanceFromInterstitial} />
        )}

        {phase.kind === 'results' && (
          <Results
            state={state}
            outcome={outcome}
            answers={answers}
            onApply={apply}
            passedUnitsAlready={alreadyPassed}
          />
        )}
      </div>
    </div>
  )
}

// ── Intro ────────────────────────────────────────────────────────────────────

function Intro({
  onStart,
  alreadyPassed,
  resumeAt,
}: {
  onStart: () => void
  alreadyPassed: UnitId[]
  /** The first unit this run will actually test — Unit 1 on a first attempt. */
  resumeAt: UnitId | null
}) {
  const testable = PLAN.order.length
  const skipped = PLAN.alwaysStudied
  return (
    <div className="anim-fade-up space-y-5" data-testid="placement-intro">
      <div className="text-center">
        <p aria-hidden className="text-5xl leading-none">
          🎯
        </p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white">
          Skip what you already know
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
          About 15 minutes at the very most — and far less if the questions get hard early.
        </p>
      </div>

      <ul className="space-y-2.5">
        <Rule icon="5️⃣">
          <strong className="text-slate-200">{PLACEMENT_ITEMS_PER_UNIT} questions per unit</strong>,
          pulled from different lessons of that unit.
        </Rule>
        <Rule icon="✅">
          <strong className="text-slate-200">
            {PLACEMENT_PASS_MARK} of {PLACEMENT_ITEMS_PER_UNIT} passes
          </strong>{' '}
          — the unit is marked studied and you keep going up.
        </Rule>
        <Rule icon="🛑">
          <strong className="text-slate-200">A miss stops that track.</strong> Nothing above a unit
          you missed gets skipped, because nothing above it was tested.
        </Rule>
        <Rule icon="🌿">
          The two tracks are tested{' '}
          <strong className="text-slate-200">separately</strong> — you can test out of the
          fundamentals and still start technicals from scratch.
        </Rule>
        <Rule icon="📚">
          The test covers units 1–{testable}. Units {skipped.map(unitNumber).join(', ')} — risk,
          behaviour, strategy and the capstone — are{' '}
          <strong className="text-slate-200">never tested</strong>. They pull the whole curriculum
          together, so everyone studies them.
        </Rule>
        <Rule icon="🙂">
          Nothing is lost by doing badly. A unit you miss is simply a unit you study, exactly as you
          would have anyway.
        </Rule>
      </ul>

      {alreadyPassed.length > 0 && (
        <p
          className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs leading-relaxed text-slate-400"
          data-testid="placement-retake-note"
        >
          You have taken this before and tested out of {alreadyPassed.length} unit
          {alreadyPassed.length === 1 ? '' : 's'}. Those are not re-asked, and a retake can only add
          to them — units already credited stay credited, whatever happens this time.
          {resumeAt && ` This one picks up at Unit ${unitNumber(resumeAt)}.`}
        </p>
      )}

      <button
        type="button"
        data-testid="placement-start"
        onClick={onStart}
        className="min-h-[56px] w-full rounded-2xl bg-emerald-500 px-5 text-base font-bold text-slate-950 active:bg-emerald-400"
      >
        Start the test
      </button>
      <Link
        to="/learn"
        data-testid="placement-bail"
        className="block min-h-[44px] pt-1 text-center text-sm font-medium text-slate-500 active:text-slate-300"
      >
        Not now — start from Unit 1
      </Link>
    </div>
  )
}

function Rule({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
      <span aria-hidden className="shrink-0 text-lg leading-snug">
        {icon}
      </span>
      <span className="text-[13px] leading-relaxed text-slate-400">{children}</span>
    </li>
  )
}

// ── Between units ────────────────────────────────────────────────────────────

function Interstitial({
  state,
  unitId,
  onContinue,
}: {
  state: PlacementState
  unitId: UnitId
  onContinue: () => void
}) {
  const result = state.results.find((r) => r.unitId === unitId)
  if (!result) return null
  const ok = passed(result)
  const next = nextUnitToTest(state)

  return (
    <div
      className="anim-fade-up space-y-5 py-8 text-center"
      data-testid="placement-interstitial"
      data-unit={unitId}
      data-passed={ok}
      data-score={result.correct}
    >
      <p aria-hidden className="text-6xl leading-none">
        {ok ? '🎉' : '📘'}
      </p>
      <div>
        <h1 className="text-2xl font-extrabold text-white">
          Unit {unitNumber(unitId)} {ok ? 'passed' : 'not passed'}
        </h1>
        <p className="mt-1 text-sm text-slate-400">{unitTitle(unitId)}</p>
      </div>

      <p className="text-4xl font-extrabold tabular-nums text-emerald-300">
        {result.correct}
        <span className="text-xl text-slate-500">/{result.total}</span>
      </p>

      <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-400">
        {ok
          ? `Its ${lessonCount(unitId)} lessons will be marked studied when you apply the results.`
          : `${PLACEMENT_PASS_MARK} of ${result.total} were needed. You will study this unit — that is where you start.`}
      </p>

      <p className="text-sm font-semibold text-slate-200" data-testid="placement-next-unit">
        {next
          ? `Testing Unit ${unitNumber(next)} next — ${unitTitle(next)}`
          : 'That was the last one.'}
      </p>

      <button
        type="button"
        data-testid="placement-continue"
        onClick={onContinue}
        className="min-h-[52px] w-full rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400"
      >
        {next ? 'Continue' : 'See your results'}
      </button>
    </div>
  )
}

// ── Results ──────────────────────────────────────────────────────────────────

function Results({
  state,
  outcome,
  answers,
  onApply,
  passedUnitsAlready,
}: {
  state: PlacementState
  /** The same outcome the Apply button will hand the store — never recomputed here. */
  outcome: PlacementOutcome
  answers: Record<string, number>
  onApply: () => void
  passedUnitsAlready: UnitId[]
}) {
  const known = new Set(passedUnitsAlready)
  const newlyPassed = outcome.passedUnits.filter((id) => !known.has(id))
  const lessonsSkipped = newlyPassed.reduce((n, id) => n + lessonCount(id), 0)
  const xp = newlyPassed.length * XP_PLACEMENT_UNIT

  const missed = state.results.flatMap((result) =>
    (SAMPLES[result.unitId] ?? [])
      .filter((q) => answers[q.id] !== undefined && answers[q.id] !== q.answerIdx)
      .map((q) => ({ unitId: result.unitId, item: q, chosen: answers[q.id] })),
  )

  return (
    <div className="anim-fade-up space-y-6" data-testid="placement-results">
      <div className="text-center">
        <p aria-hidden className="text-5xl leading-none">
          {newlyPassed.length > 0 ? '🏅' : '🧭'}
        </p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white">
          {newlyPassed.length > 0
            ? `You tested out of ${newlyPassed.length} unit${newlyPassed.length === 1 ? '' : 's'}`
            : 'You start at the beginning'}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400" data-testid="placement-summary">
          {newlyPassed.length > 0
            ? `${lessonsSkipped} lessons marked studied · +${xp} XP placement credit`
            : 'No units passed this time — Unit 1 is where the curriculum starts, and it is short.'}
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Unit by unit
        </h2>
        <ul className="space-y-2">
          {state.results.map((result) => {
            const ok = passed(result)
            return (
              <li
                key={result.unitId}
                data-testid="placement-unit-result"
                data-unit={result.unitId}
                data-passed={ok}
                data-score={result.correct}
                className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3"
              >
                <span
                  aria-hidden
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    ok ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ok ? '✓' : unitNumber(result.unitId)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-100">
                    {unitTitle(result.unitId)}
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    {result.carried
                      ? 'Credited by an earlier placement'
                      : ok
                        ? `Tested out — ${lessonCount(result.unitId)} lessons skipped`
                        : 'You will study this one'}
                  </span>
                </span>
                <span
                  className={`shrink-0 text-sm font-bold tabular-nums ${ok ? 'text-emerald-300' : 'text-slate-400'}`}
                >
                  {result.carried ? '—' : `${result.correct}/${result.total}`}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Where you start
        </h2>
        <ul className="space-y-2">
          {PLACEMENT_TRACKS.map((track) => {
            const startAt = outcome.startAt[track]
            return (
              <li
                key={track}
                data-testid="placement-track-start"
                data-track={track}
                data-start={startAt ?? ''}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3"
              >
                {/* Stacked rather than label-left/value-right: "Fundamental
                    analysis" plus a unit title does not fit on one 390px line
                    without one of them wrapping mid-phrase. */}
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {TRACK_LABEL[track]}
                </span>
                <span className="mt-0.5 block text-sm font-semibold text-slate-200">
                  {startAt
                    ? `Starts at Unit ${unitNumber(startAt)} — ${unitTitle(startAt)}`
                    : 'All tested out 🎉'}
                </span>
              </li>
            )
          })}
        </ul>
        <p className="px-1 text-[11px] leading-relaxed text-slate-500">
          Units {PLAN.alwaysStudied.map(unitNumber).join(', ')} are never tested — they pull
          everything together, so you will study them whatever happens here.
        </p>
      </section>

      {missed.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            What you missed ({missed.length})
          </h2>
          <p className="px-1 text-[11px] leading-relaxed text-slate-500">
            Here are the answers — this is the part the test held back.
          </p>
          <ul className="space-y-2.5">
            {missed.map(({ unitId, item, chosen }) => (
              <li
                key={item.id}
                data-testid="placement-missed"
                data-item={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  Unit {unitNumber(unitId)}
                </p>
                <p className="mt-1 text-sm font-semibold leading-snug text-slate-100">
                  {item.prompt}
                </p>
                <p className="mt-2 text-xs text-rose-300">
                  You answered: {item.choices[chosen]}
                </p>
                <p className="mt-1 text-xs text-emerald-300">
                  Correct: {item.choices[item.answerIdx]}
                </p>
                <div className="mt-2 text-[13px] leading-relaxed text-slate-400">
                  <Markdown md={item.explain} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="space-y-2.5">
        <button
          type="button"
          data-testid="placement-apply"
          onClick={onApply}
          className="min-h-[56px] w-full rounded-2xl bg-emerald-500 px-5 text-base font-bold text-slate-950 active:bg-emerald-400"
        >
          {newlyPassed.length > 0 ? `Apply placement — skip ${lessonsSkipped} lessons` : 'Start at Unit 1'}
        </button>
        <Link
          to="/learn"
          data-testid="placement-discard"
          className="block min-h-[44px] pt-1 text-center text-sm font-medium text-slate-500 active:text-slate-300"
        >
          Discard — study everything anyway
        </Link>
        <p className="px-1 text-center text-[11px] leading-relaxed text-slate-600">
          Skipped lessons stay open: you can read any of them any time, and they mint their review
          cards then. Nothing is added to your review queue by testing out.
        </p>
      </div>
    </div>
  )
}
