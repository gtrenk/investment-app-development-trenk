// ─── Lesson player ───────────────────────────────────────────────────────────
// One screen at a time: content blocks → quiz items → completion summary.

import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { ContentBlock, QuizItem } from '@core/types'
import { XP_LESSON, XP_QUIZ_ITEM } from '@core/gamification/xp'
import { getLesson, getUnit } from '@content/units'
import { useAppStore, appClock } from '@state/useAppStore'
import { dayLogFor } from '@state/selectors'
import { Markdown } from '@ui/components/Markdown'
import { QuizChoice } from '@ui/components/QuizChoice'
import type { ChoiceState } from '@ui/components/QuizChoice'

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

  const [step, setStep] = useState(0)
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const alreadyDone = useRef(wasComplete)
  const settled = useRef(false)
  const firstTryIds = useRef<Set<string>>(new Set())

  const blockCount = lesson?.blocks.length ?? 0
  const quizCount = lesson?.quiz.length ?? 0
  const totalSteps = blockCount + quizCount + 1
  const cardsMinted = useMemo(() => lesson?.cardSeeds.length ?? 0, [lesson])

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
  const isSummary = step >= blockCount + quizCount

  /** Runs exactly once, when the learner reaches the summary screen. */
  const finish = () => {
    if (settled.current) return
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

            <div className="space-y-2.5 pt-1">
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
              if (right) {
                firstTryIds.current.add(lesson.quiz[step - blockCount].id)
                setFirstTryCorrect((n) => n + 1)
              }
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
