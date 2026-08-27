// ─── Fix my weak spots ───────────────────────────────────────────────────────
// The remediation session: the questions this learner has actually got wrong,
// re-asked, plus a pointer at the units whose flashcards keep lapsing.
//
// IT IS NOT AN EXAM, and every difference from the lesson quiz follows from
// that one sentence:
//
//   • The explanation is shown after EVERY answer, right or wrong. The learner
//     has already met this question and lost; the point is to leave knowing
//     why, not to be scored again.
//   • The four choices are reordered deterministically (see @core/weakspots/
//     reask): "it was the third one" is not an answer, and the record should
//     not retire on position memory.
//   • Nothing here counts toward the daily goal or the streak. Getting a
//     mistake right is worth XP_WEAKSPOT and nothing else — see the note on
//     `resolveWeakSpot` in the store.

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { UnitId } from '@core/types'
import { XP_WEAKSPOT } from '@core/gamification/xp'
import { speakableFromMarkdown, speakableQuiz } from '@core/speech/text'
import { openMisses } from '@core/weakspots/bank'
import type { WeakSpotsState } from '@core/weakspots/bank'
import { LAPSE_MIN, LAPSE_WINDOW_DAYS } from '@core/weakspots/insight'
import { buildWeakSpotPlan, missStepCount } from '@core/weakspots/session'
import type { WeakSpotStep } from '@core/weakspots/session'
import { reaskItem } from '@core/weakspots/reask'
import { ALL_UNITS, getQuizItem, getUnit } from '@content/units'
import { useAppStore, appClock } from '@state/useAppStore'
import { Markdown } from '@ui/components/Markdown'
import { QuizChoice } from '@ui/components/QuizChoice'
import type { ChoiceState } from '@ui/components/QuizChoice'
import { isSupported, speak, stop } from '@ui/speech/tts'

/** Open misses per unit — the before/after the completion screen compares. */
function openByUnit(weakSpots: WeakSpotsState): Record<UnitId, number> {
  const out: Record<UnitId, number> = {}
  for (const record of openMisses(weakSpots)) {
    out[record.unitId] = (out[record.unitId] ?? 0) + 1
  }
  return out
}

function unitTitle(unitId: UnitId): string {
  return getUnit(unitId)?.title ?? unitId
}

// ── One re-asked question ────────────────────────────────────────────────────

function MissStep({
  itemId,
  missCount,
  unitId,
  onAnswered,
  onNext,
}: {
  itemId: string
  missCount: number
  unitId: UnitId
  onAnswered: (correct: boolean) => void
  onNext: () => void
}) {
  const item = getQuizItem(itemId)
  // Memoised on the id alone: the shuffle is a pure function of it, but
  // recomputing on every keystroke of state would still be waste.
  const reasked = useMemo(() => (item ? reaskItem(item) : null), [item])
  const [picked, setPicked] = useState<number | null>(null)

  if (!item || !reasked) return null

  const answered = picked !== null
  const correct = picked === reasked.answerIdx

  function pick(i: number) {
    if (answered || !reasked) return
    setPicked(i)
    onAnswered(i === reasked.answerIdx)
  }

  function stateOf(i: number): ChoiceState {
    if (!answered || !reasked) return 'idle'
    if (i === reasked.answerIdx) return picked === i ? 'correct' : 'revealed'
    return picked === i ? 'wrong' : 'idle'
  }

  return (
    <div className="space-y-4" data-testid="weakspot-miss" data-item={itemId} data-unit={unitId}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
        {unitTitle(unitId)} · missed {missCount}×
      </p>
      <h2 className="text-lg font-semibold leading-snug text-white" data-testid="quiz-prompt">
        {item.prompt}
      </h2>

      <div className="space-y-2.5">
        {reasked.choices.map((choice, i) => (
          <QuizChoice
            key={`${itemId}-${i}`}
            index={i}
            text={choice}
            state={stateOf(i)}
            disabled={answered}
            onPick={() => pick(i)}
          />
        ))}
      </div>

      {answered && (
        <div
          data-testid="quiz-feedback"
          data-correct={correct}
          className={`anim-fade-up rounded-2xl border px-4 py-3.5 ${
            correct ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-rose-500/40 bg-rose-500/10'
          }`}
        >
          <p className={`mb-1.5 text-sm font-bold ${correct ? 'text-emerald-300' : 'text-rose-300'}`}>
            {correct ? `Fixed — +${XP_WEAKSPOT} XP` : 'Still not it — read this one properly'}
          </p>
          {/* Always, either way: this is remediation, not marking. */}
          <div className="text-[13px] leading-relaxed text-slate-300" data-testid="quiz-explain">
            <Markdown md={item.explain} />
          </div>
        </div>
      )}

      {answered && (
        <button
          type="button"
          data-testid="next-btn"
          onClick={onNext}
          className="min-h-[52px] w-full rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400"
        >
          Continue
        </button>
      )}
    </div>
  )
}

// ── One lapsed-card pointer ──────────────────────────────────────────────────

function LapsedStep({
  unitId,
  title,
  count,
  onNext,
}: {
  unitId: UnitId
  title: string
  count: number
  onNext: () => void
}) {
  return (
    <div className="space-y-4" data-testid="weakspot-lapsed" data-unit={unitId} data-cards={count}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-sky-400">Keeps slipping</p>
      <h2 className="text-lg font-semibold leading-snug text-white">
        {count} card{count === 1 ? '' : 's'} in {title} keep coming back
      </h2>
      <p className="text-[13px] leading-relaxed text-slate-400">
        {count === 1 ? 'This one has lapsed' : 'These have each lapsed'} {LAPSE_MIN} times or more
        and {count === 1 ? 'is' : 'are'} due within {LAPSE_WINDOW_DAYS} days. They are flashcards, so
        they are handled where flashcards live — your review queue schedules them, and grading them
        here would only muddle that. This is the nudge to go and clear them.
      </p>
      <Link
        to="/review"
        data-testid="weakspot-review-link"
        className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-sky-400 px-5 font-bold text-slate-950 active:bg-sky-300"
      >
        Open today’s review
      </Link>
      <button
        type="button"
        data-testid="next-btn"
        onClick={onNext}
        className="min-h-[52px] w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 font-bold text-slate-100 active:bg-slate-800"
      >
        Continue
      </button>
    </div>
  )
}

// ── Screen ───────────────────────────────────────────────────────────────────

export function WeakSpotsScreen() {
  const navigate = useNavigate()
  const weakSpots = useAppStore((s) => s.weakSpots)
  const srs = useAppStore((s) => s.srs)
  const resolveWeakSpot = useAppStore((s) => s.resolveWeakSpot)
  const recordQuizMiss = useAppStore((s) => s.recordQuizMiss)

  const listening = useAppStore((s) => s.settings.readAloud.enabled)
  const rate = useAppStore((s) => s.settings.readAloud.rate)
  const setReadAloud = useAppStore((s) => s.setReadAloud)
  const [ttsAvailable] = useState(isSupported)

  const today = appClock.today()

  /**
   * The plan is snapshotted on the first render and never rebuilt.
   *
   * Answering a question changes the bank, which would change what
   * `buildWeakSpotPlan` returns — a live plan would renumber itself under the
   * learner's thumb and drop the step they are standing on. Same reason the
   * Review screen snapshots its queue.
   */
  const [plan] = useState<WeakSpotStep[]>(() =>
    buildWeakSpotPlan({ weakSpots, srs, units: ALL_UNITS, today }, (id) => Boolean(getQuizItem(id))),
  )
  const [openBefore] = useState<Record<UnitId, number>>(() => openByUnit(weakSpots))

  const [step, setStep] = useState(0)
  const [fixed, setFixed] = useState<string[]>([])
  const [missedAgain, setMissedAgain] = useState<string[]>([])

  const questions = missStepCount(plan)
  const done = step >= plan.length
  const current = plan[step]

  // ── Speech ────────────────────────────────────────────────────────────────
  // One effect keyed on what is on screen, exactly as in the lesson player.
  const spokenKey = done ? 'done' : current.kind === 'miss' ? current.record.itemId : current.unitId

  useEffect(() => {
    // An empty plan renders the "nothing queued" panel, which is a state, not a
    // step — announcing a session that never ran would be nonsense.
    if (!listening || !ttsAvailable || plan.length === 0) {
      stop()
      return
    }
    if (done) {
      speak([`Weak spots session finished. ${fixed.length} fixed.`], { rate })
      return
    }
    const onScreen = plan[step]
    if (onScreen.kind === 'miss') {
      const item = getQuizItem(onScreen.record.itemId)
      if (!item) return
      const reasked = reaskItem(item)
      const spoken = speakableQuiz({ prompt: item.prompt, choices: reasked.choices })
      speak([spoken.question, ...spoken.choices], { rate })
      return
    }
    speak(
      [
        speakableFromMarkdown(
          `${onScreen.cardIds.length} cards in ${onScreen.title} keep coming back. They are waiting in your review queue.`,
        ),
      ],
      { rate },
    )
    // Keyed on "what is on screen" only — listing the tallies would restart the
    // voice mid-sentence every time an answer lands. See LessonPlayer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, ttsAvailable, rate, spokenKey])

  useEffect(() => stop, [])

  /** Read the verdict and the explanation the moment a choice is tapped. */
  function speakFeedback(itemId: string, correct: boolean): void {
    if (!listening || !ttsAvailable) return
    const item = getQuizItem(itemId)
    if (!item) return
    speak([correct ? 'Fixed.' : 'Still not it.', speakableFromMarkdown(item.explain)], { rate })
  }

  function answer(itemId: string, correct: boolean): void {
    if (correct) {
      resolveWeakSpot(itemId)
      setFixed((ids) => (ids.includes(itemId) ? ids : [...ids, itemId]))
    } else {
      // Wrong again: the record stays open and its counter climbs, which is
      // what pushes the item up the insight screen's per-unit tally.
      recordQuizMiss(itemId)
      setMissedAgain((ids) => (ids.includes(itemId) ? ids : [...ids, itemId]))
    }
    speakFeedback(itemId, correct)
  }

  const header = (
    <header className="safe-top sticky top-0 z-10 bg-slate-950/95 px-4 pb-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-testid="weakspots-exit"
          aria-label="Leave the weak-spot session"
          onClick={() => navigate('/')}
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-400 active:bg-slate-800"
        >
          ✕
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] uppercase tracking-widest text-slate-500">Weak spots</p>
          <p className="truncate text-sm font-semibold text-slate-100">
            {done
              ? 'Session complete'
              : plan.length === 0
                ? 'Nothing queued'
                : `Step ${step + 1} of ${plan.length}`}
          </p>
        </div>
        {ttsAvailable && (
          <button
            type="button"
            data-testid="tts-toggle"
            aria-pressed={listening}
            aria-label={listening ? 'Turn off read aloud' : 'Read these aloud'}
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
      {plan.length > 0 && (
        <div className="mt-2.5 flex gap-1" aria-hidden>
          {plan.map((s, i) => (
            <span
              key={s.kind === 'miss' ? s.record.itemId : `lapsed-${s.unitId}`}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-amber-400' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      )}
    </header>
  )

  // ── Nothing to fix ──
  if (plan.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col">
        {header}
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
          <div aria-hidden className="text-6xl">
            🎯
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-white" data-testid="weakspots-empty">
            Nothing queued
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
            No unfixed mistakes and no cards lapsing. Questions land here the moment you get one
            wrong — in a lesson or in the placement test — and stay until you answer them right.
          </p>
          <Link
            to="/insights"
            data-testid="weakspots-insights-link"
            className="mt-6 flex min-h-[52px] items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-7 font-bold text-slate-100 active:bg-slate-800"
          >
            See accuracy by unit
          </Link>
        </div>
      </div>
    )
  }

  // ── Complete ──
  if (done) {
    const after = openByUnit(weakSpots)
    const unitIds = [...new Set([...Object.keys(openBefore), ...Object.keys(after)])].sort()
    const remaining = openMisses(weakSpots).length
    const xp = fixed.length * XP_WEAKSPOT

    return (
      <div className="flex min-h-dvh flex-col">
        {header}
        <div className="anim-fade-up flex-1 space-y-5 px-4 pb-10 pt-6 text-center" data-testid="weakspots-complete">
          <div aria-hidden className="text-6xl">
            {fixed.length > 0 ? '🛠️' : '📘'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              {fixed.length > 0
                ? `${fixed.length} weak spot${fixed.length === 1 ? '' : 's'} fixed`
                : 'Nothing fixed this time'}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {questions} question{questions === 1 ? '' : 's'} re-asked
              {missedAgain.length > 0 && ` · ${missedAgain.length} still to crack`}
            </p>
          </div>

          <dl className="mx-auto max-w-xs space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-left text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">Fixed ({fixed.length} × {XP_WEAKSPOT})</dt>
              <dd className="font-semibold tabular-nums text-emerald-300" data-testid="weakspot-xp">
                +{xp} XP
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2">
              <dt className="font-semibold text-slate-200">Still in the bank</dt>
              <dd
                className="font-bold tabular-nums text-amber-300"
                data-testid="weakspot-remaining"
              >
                {remaining}
              </dd>
            </div>
          </dl>

          <section className="text-left">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Unit by unit
            </h2>
            <ul className="divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
              {unitIds.map((unitId) => {
                const before = openBefore[unitId] ?? 0
                const now = after[unitId] ?? 0
                return (
                  <li
                    key={unitId}
                    data-testid="weakspot-unit-delta"
                    data-unit={unitId}
                    data-before={before}
                    data-after={now}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-100">
                      {unitTitle(unitId)}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-slate-400">
                      {before}
                      <span aria-hidden className="px-1 text-slate-600">
                        →
                      </span>
                      <span className={now < before ? 'font-bold text-emerald-300' : 'text-slate-300'}>
                        {now}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>

          <p className="text-[11px] leading-relaxed text-slate-600">
            Fixing weak spots does not tick today’s goal or extend your streak — those still mean
            “I did today’s study”. This is extra credit, in the literal sense.
          </p>

          <div className="space-y-2.5 pt-1">
            <Link
              to="/insights"
              data-testid="weakspots-insights-link"
              className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400"
            >
              See accuracy by unit
            </Link>
            <Link
              to="/"
              data-testid="weakspots-home"
              className="flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-5 font-bold text-slate-100 active:bg-slate-800"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── A step ──
  return (
    <div className="flex min-h-dvh flex-col">
      {header}
      <div className="flex-1 px-4 pb-8 pt-4">
        {current.kind === 'miss' ? (
          <MissStep
            key={current.record.itemId}
            itemId={current.record.itemId}
            missCount={current.record.missCount}
            unitId={current.record.unitId}
            onAnswered={(correct) => answer(current.record.itemId, correct)}
            onNext={() => setStep((s) => s + 1)}
          />
        ) : (
          <LapsedStep
            key={`lapsed-${current.unitId}`}
            unitId={current.unitId}
            title={current.title}
            count={current.cardIds.length}
            onNext={() => setStep((s) => s + 1)}
          />
        )}
      </div>
    </div>
  )
}
