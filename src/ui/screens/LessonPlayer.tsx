// ─── Lesson player ───────────────────────────────────────────────────────────
// One screen at a time: content blocks → quiz items → completion summary.

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { ContentBlock, QuizItem } from '@core/types'
import { XP_LESSON, XP_QUIZ_ITEM } from '@core/gamification/xp'
import { speakableFromMarkdown, speakableQuiz } from '@core/speech/text'
import { getLesson, getUnit } from '@content/units'
import { useSessionStore } from '@state/session'
import { useAppStore, appClock } from '@state/useAppStore'
import { dayLogFor } from '@state/selectors'
import { Markdown } from '@ui/components/Markdown'
import { SessionNext } from '@ui/components/SessionNext'
import { QuizChoice } from '@ui/components/QuizChoice'
import type { ChoiceState } from '@ui/components/QuizChoice'
import { isSupported, pause, resume, speak, stop, useSpeechState } from '@ui/speech/tts'

// ── Listen mode ──────────────────────────────────────────────────────────────

/**
 * The beat between a block finishing and the page turning itself.
 *
 * Short enough that a hands-free lesson feels continuous, long enough that the
 * last sentence has landed before the next one starts — and long enough that a
 * listener who wants to stop the lesson turning has a moment to reach the
 * pause button.
 */
const AUTO_ADVANCE_MS = 1000

// ── Content blocks ───────────────────────────────────────────────────────────

const BLOCK_STYLE: Record<ContentBlock['kind'], { wrap: string; label?: string; icon?: string }> = {
  text: { wrap: '' },
  callout: {
    wrap: 'border-l-4 border-amber-400 bg-amber-400/10 rounded-r-2xl px-4 py-3.5',
    label: 'Watch out',
    icon: '⚠️',
  },
  example: {
    wrap: 'border-l-4 border-sky-400 bg-sky-400/10 rounded-r-2xl px-4 py-3.5',
    label: 'Worked example',
    icon: '🧮',
  },
  keypoint: {
    wrap: 'border-l-4 border-emerald-400 bg-emerald-400/10 rounded-r-2xl px-4 py-3.5',
    label: 'Key point',
    icon: '⭐',
  },
}

function BlockView({ block }: { block: ContentBlock }) {
  const style = BLOCK_STYLE[block.kind]
  return (
    <div className={`anim-fade-up ${style.wrap}`} data-testid="content-block" data-kind={block.kind}>
      {style.label && (
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <span aria-hidden>{style.icon}</span>
          {style.label}
        </p>
      )}
      <Markdown md={block.md} className={block.kind === 'text' ? 'text-[15px]' : 'text-[14px]'} />
    </div>
  )
}

// ── Quiz step ────────────────────────────────────────────────────────────────

function QuizView({
  item,
  index,
  total,
  onAnswered,
  onNext,
}: {
  item: QuizItem
  index: number
  total: number
  onAnswered: (correctFirstTry: boolean) => void
  onNext: () => void
}) {
  const [picked, setPicked] = useState<number | null>(null)

  const answered = picked !== null
  const correct = picked === item.answerIdx

  /**
   * One tap, one answer. Getting it wrong reveals the right choice and the
   * explanation rather than asking for another guess — a second guess after
   * seeing the answer teaches nothing, and first-try correctness is what the
   * XP rule and the SRS both care about.
   */
  function pick(i: number) {
    if (answered) return
    setPicked(i)
    onAnswered(i === item.answerIdx)
  }

  function stateOf(i: number): ChoiceState {
    if (!answered) return 'idle'
    if (i === item.answerIdx) return picked === i ? 'correct' : 'revealed'
    return picked === i ? 'wrong' : 'idle'
  }

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
        Question {index + 1} of {total}
      </p>
      <h2 className="text-lg font-semibold leading-snug text-white" data-testid="quiz-prompt">
        {item.prompt}
      </h2>

      <div className="space-y-2.5">
        {item.choices.map((c, i) => (
          <QuizChoice
            key={i}
            index={i}
            text={c}
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
            {correct ? 'Correct' : 'Not quite — here is why'}
          </p>
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

// ── Player ───────────────────────────────────────────────────────────────────

export function LessonPlayer() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const lesson = getLesson(id)

  const completeLesson = useAppStore((s) => s.completeLesson)
  const answerQuiz = useAppStore((s) => s.answerQuiz)
  const game = useAppStore((s) => s.game)
  const wasComplete = useAppStore((s) => Boolean(s.progress.completedLessons[id]))

  // Listen mode is the persisted preference itself, not a copy of it: the
  // header button is a real settings toggle that happens to be where you need
  // it. Turning it off in a lesson is remembered for the next one.
  const listening = useAppStore((s) => s.settings.readAloud.enabled)
  const rate = useAppStore((s) => s.settings.readAloud.rate)
  const setReadAloud = useAppStore((s) => s.setReadAloud)
  const inSession = useSessionStore((s) => s.active)
  const speech = useSpeechState()
  const [ttsAvailable] = useState(isSupported)

  const [step, setStep] = useState(0)
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const alreadyDone = useRef(wasComplete)
  const settled = useRef(false)
  const firstTryIds = useRef<Set<string>>(new Set())

  const blockCount = lesson?.blocks.length ?? 0
  const quizCount = lesson?.quiz.length ?? 0
  const totalSteps = blockCount + quizCount + 1
  const cardsMinted = useMemo(() => lesson?.cardSeeds.length ?? 0, [lesson])
  const isSummary = step >= blockCount + quizCount

  /** Runs exactly once, when the learner reaches the summary screen. */
  const finish = () => {
    if (!lesson || settled.current) return
    settled.current = true
    completeLesson(lesson.id)
    // Quiz XP is idempotent per item id inside the store.
    for (const itemId of firstTryIds.current) answerQuiz(itemId, true)
  }

  const advance = () => {
    const next = step + 1
    if (next >= blockCount + quizCount) finish()
    setStep(next)
  }

  // ── Speech ────────────────────────────────────────────────────────────────
  // One effect owns everything the voice says, keyed on "what is on screen".
  // Manual Next/Back changes `step`, which re-runs it, which cancels whatever
  // was mid-sentence and re-anchors on the new page — so the buttons keep
  // working exactly as they did before listen mode existed.

  const autoAdvance = useRef<ReturnType<typeof setTimeout> | null>(null)
  const advanceRef = useRef(advance)
  useEffect(() => {
    advanceRef.current = advance
  })

  const clearAutoAdvance = () => {
    if (autoAdvance.current !== null) {
      clearTimeout(autoAdvance.current)
      autoAdvance.current = null
    }
  }

  const summaryLine = () => {
    if (!lesson) return ''
    const quizXp = firstTryCorrect * XP_QUIZ_ITEM
    const lessonXp = alreadyDone.current ? 0 : XP_LESSON
    const cards = alreadyDone.current ? 0 : cardsMinted
    return speakableFromMarkdown(
      `Lesson complete. ${lesson.title}. ` +
        `${lessonXp + quizXp} XP, with ${firstTryCorrect} of ${quizCount} quiz questions right first try. ` +
        `${cards} ${cards === 1 ? 'card' : 'cards'} added to review.`,
    )
  }

  useEffect(() => {
    clearAutoAdvance()
    // `ttsAvailable` matters as much as `listening`: the preference travels
    // between devices over cloud sync, so a browser with no speech engine can
    // arrive with it switched on. Without this guard `speak()` would report an
    // instant "done" and the lesson would flip through itself in silence.
    if (!listening || !ttsAvailable || !lesson) {
      stop()
      return
    }

    if (isSummary) {
      speak([summaryLine()], { rate })
      return
    }

    if (step < blockCount) {
      speak([speakableFromMarkdown(lesson.blocks[step].md)], {
        rate,
        // The page turns itself only after the voice has actually finished,
        // never on a timer that races it — a slow voice must not be cut off.
        onDone: () => {
          autoAdvance.current = setTimeout(() => {
            autoAdvance.current = null
            advanceRef.current()
          }, AUTO_ADVANCE_MS)
        },
      })
      return
    }

    // Quiz: read the question and the four options, then stop. Answering takes
    // a deliberate tap, so auto-advancing here would either pick for the
    // listener or strand them on a page they cannot answer without looking.
    const spoken = speakableQuiz(lesson.quiz[step - blockCount])
    speak([spoken.question, ...spoken.choices], { rate })
    // Deliberately keyed on "what is on screen" and nothing else. `summaryLine`
    // and `advance` are rebuilt every render and are reached through a ref
    // instead; listing them here would restart the voice mid-sentence on any
    // unrelated re-render (a quiz answer, an XP tick).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, ttsAvailable, rate, step, isSummary, blockCount, lesson])

  // Leaving the screen any way at all — Back, the tab bar, a hardware gesture —
  // must not leave a voice talking to an empty room.
  useEffect(() => {
    return () => {
      clearAutoAdvance()
      stop()
    }
  }, [])

  /** Read the verdict and the explanation the moment a choice is tapped. */
  const speakFeedback = (item: QuizItem, correct: boolean) => {
    if (!listening || !ttsAvailable) return
    speak([correct ? 'Correct!' : 'Not quite.', speakableFromMarkdown(item.explain)], { rate })
  }

  const toggleListening = () => {
    clearAutoAdvance()
    if (listening) stop()
    setReadAloud({ enabled: !listening })
  }

  if (!lesson) {
    return (
      <div className="safe-top px-4 py-16 text-center">
        <p className="text-5xl">🤔</p>
        <h1 className="mt-4 text-lg font-bold">Lesson not found</h1>
        <Link to="/learn" className="mt-4 inline-block text-sm font-semibold text-emerald-400">
          Back to Learn
        </Link>
      </div>
    )
  }

  const unit = getUnit(lesson.unitId)

  const exit = () => navigate('/learn')

  const day = dayLogFor({ game }, appClock.today())
  const quizXp = firstTryCorrect * XP_QUIZ_ITEM
  const lessonXp = alreadyDone.current ? 0 : XP_LESSON

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header + progress */}
      <header className="safe-top sticky top-0 z-10 bg-slate-950/95 px-4 pb-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exit}
            data-testid="lesson-exit"
            aria-label="Exit lesson"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-400 active:bg-slate-800"
          >
            ✕
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] uppercase tracking-widest text-slate-500">
              {unit?.title}
            </p>
            <p className="truncate text-sm font-semibold text-slate-100">{lesson.title}</p>
          </div>

          {/* Two controls rather than one that cycles: with the phone in a
              cradle, "shush for a second" and "stop reading to me entirely"
              must not be the same tap. Play/pause takes the prominent slot
              because it is the one you reach for at a red light. */}
          {ttsAvailable && listening && (speech.speaking || speech.paused) && (
            <button
              type="button"
              data-testid="tts-playpause"
              aria-label={speech.paused ? 'Resume reading' : 'Pause reading'}
              onClick={() => (speech.paused ? resume() : pause())}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-700 text-base text-slate-200 active:bg-slate-800"
            >
              <span aria-hidden>{speech.paused ? '▶' : '⏸'}</span>
            </button>
          )}

          {ttsAvailable && (
            <button
              type="button"
              data-testid="tts-toggle"
              aria-pressed={listening}
              aria-label={listening ? 'Turn off read aloud' : 'Read this lesson aloud'}
              onClick={toggleListening}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-base ${
                listening
                  ? `border-emerald-400/70 bg-emerald-400/10 text-emerald-300 ${
                      speech.speaking && !speech.paused ? 'anim-listen' : ''
                    }`
                  : 'border-slate-700 text-slate-400 active:bg-slate-800'
              }`}
            >
              <span aria-hidden>{listening ? '🔊' : '🔈'}</span>
            </button>
          )}
        </div>
        <div className="mt-2.5 flex gap-1" aria-hidden>
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-emerald-400' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </header>

      <div className="flex-1 px-4 pb-6 pt-4">
        {isSummary ? (
          <div className="anim-fade-up space-y-5 py-6 text-center" data-testid="lesson-complete">
            <div aria-hidden className="text-6xl">
              🎉
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Lesson complete</h1>
              <p className="mt-1 text-sm text-slate-400">{lesson.title}</p>
            </div>

            <dl className="mx-auto max-w-xs space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-left text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Lesson</dt>
                <dd className="font-semibold tabular-nums text-emerald-300">+{lessonXp} XP</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">
                  Quiz ({firstTryCorrect}/{quizCount} first try)
                </dt>
                <dd className="font-semibold tabular-nums text-emerald-300">+{quizXp} XP</dd>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <dt className="font-semibold text-slate-200">Cards added to review</dt>
                <dd className="font-semibold tabular-nums text-sky-300" data-testid="cards-minted">
                  {alreadyDone.current ? 0 : cardsMinted}
                </dd>
              </div>
            </dl>

            <p className="text-sm text-slate-400" data-testid="lesson-goal-status">
              {day.goalMet
                ? `Daily goal met — streak at ${game.streak.current} 🔥`
                : 'Clear your review queue to lock in today’s streak.'}
            </p>

            {/* In a session the lesson is one step of several: the panel offers
                the next step rather than the two usual ways out. */}
            {inSession && <SessionNext />}

            <div className="space-y-2.5 pt-1" hidden={inSession}>
              <Link
                to="/review"
                data-testid="summary-review"
                className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400"
              >
                Review your cards
              </Link>
              <Link
                to="/learn"
                data-testid="summary-done"
                className="flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-5 font-bold text-slate-100 active:bg-slate-800"
              >
                Back to Learn
              </Link>
            </div>
          </div>
        ) : step < blockCount ? (
          <BlockView block={lesson.blocks[step]} />
        ) : (
          <QuizView
            key={lesson.quiz[step - blockCount].id}
            item={lesson.quiz[step - blockCount]}
            index={step - blockCount}
            total={quizCount}
            onAnswered={(right) => {
              const item = lesson.quiz[step - blockCount]
              if (right) {
                firstTryIds.current.add(item.id)
                setFirstTryCorrect((n) => n + 1)
              } else {
                // Banked immediately, unlike the XP for a correct answer, which
                // waits for the completion screen. The two are not symmetric on
                // purpose: XP is a reward for finishing the lesson, but a missed
                // question is a fact about the learner the moment it happens —
                // and abandoning the lesson here is exactly when they most need
                // it queued for later. See @core/weakspots/bank.
                answerQuiz(item.id, false)
              }
              speakFeedback(item, right)
            }}
            onNext={advance}
          />
        )}
      </div>

      {!isSummary && step < blockCount && (
        <div className="safe-bottom sticky bottom-0 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent px-4 pb-4 pt-6">
          <div className="flex gap-2.5">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="min-h-[52px] rounded-2xl border border-slate-700 px-5 font-semibold text-slate-300 active:bg-slate-800"
              >
                Back
              </button>
            )}
            <button
              type="button"
              data-testid="next-btn"
              onClick={advance}
              className="min-h-[52px] flex-1 rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400"
            >
              {step === blockCount - 1 && quizCount > 0 ? 'Start quiz' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
