// ─── Review: the SRS session ─────────────────────────────────────────────────
// The queue is snapshotted when the session starts so grading a card (which
// pushes its due date into the future) cannot reshuffle the run in progress.

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { CardId, CardSeed, Grade } from '@core/types'
import { XP_PER_CARD, XP_REVIEW_SESSION } from '@core/gamification/xp'
import { speakableCard } from '@core/speech/text'
import { ALL_LESSONS } from '@content/units'
import { useAppStore, appClock } from '@state/useAppStore'
import { todayQueue } from '@state/selectors'
import { Flashcard } from '@ui/components/Flashcard'
import { ProgressBar } from '@ui/components/ProgressBar'
import { isSupported, speak, stop } from '@ui/speech/tts'

/** cardId → seed, across every authored lesson. */
const SEEDS: Map<CardId, CardSeed> = new Map(
  ALL_LESSONS.flatMap((l) => l.cardSeeds.map((s) => [s.id, s] as const)),
)

interface GradeButton {
  grade: Grade
  label: string
  hint: string
  cls: string
}

const GRADES: GradeButton[] = [
  { grade: 0, label: 'Again', hint: 'Blanked', cls: 'bg-rose-500/90 active:bg-rose-500 text-white' },
  { grade: 3, label: 'Hard', hint: 'Struggled', cls: 'bg-amber-500/90 active:bg-amber-500 text-slate-950' },
  { grade: 4, label: 'Good', hint: 'Got it', cls: 'bg-emerald-500/90 active:bg-emerald-500 text-slate-950' },
  { grade: 5, label: 'Easy', hint: 'Instant', cls: 'bg-sky-500/90 active:bg-sky-500 text-slate-950' },
]

function dueLabel(due: string, today: string): string {
  if (due <= today) return 'today'
  const days = Math.round((Date.parse(due) - Date.parse(today)) / 86_400_000)
  if (days === 1) return 'tomorrow'
  if (days < 30) return `in ${days} days`
  return `in ${Math.round(days / 30)} months`
}

export function ReviewScreen() {
  const srs = useAppStore((s) => s.srs)
  const gradeCard = useAppStore((s) => s.gradeCard)
  const finishReviewSession = useAppStore((s) => s.finishReviewSession)

  const listening = useAppStore((s) => s.settings.readAloud.enabled)
  const rate = useAppStore((s) => s.settings.readAloud.rate)

  const today = appClock.today()
  // Snapshot on first render only.
  const [session] = useState<CardId[]>(() => todayQueue(srs, today))
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [graded, setGraded] = useState<Grade[]>([])
  const finished = useRef(false)

  const done = index >= session.length
  const currentId = session[index]
  const seed = currentId ? SEEDS.get(currentId) : undefined

  /**
   * Listen mode, review edition: the prompt is read when the card appears and
   * the answer when it is turned over.
   *
   * Nothing here advances on its own, unlike the lesson player. Grading is a
   * self-assessment — only the listener knows whether they actually recalled
   * it — so the four buttons stay deliberate taps and the queue waits.
   */
  useEffect(() => {
    if (!listening || !currentId || !isSupported()) {
      stop()
      return
    }
    const face = revealed
      ? (seed?.back ?? 'This card’s content is no longer in the curriculum.')
      : (seed?.front ?? currentId)
    speak([speakableCard(face)], { rate })
  }, [listening, rate, currentId, revealed, seed])

  useEffect(() => stop, [])

  const nextDue = useMemo(() => {
    if (!done || session.length === 0) return null
    const dates = session.map((id) => srs[id]?.due).filter((d): d is string => Boolean(d)).sort()
    return dates[0] ?? null
  }, [done, session, srs])

  function grade(g: Grade) {
    if (!currentId) return
    gradeCard(currentId, g)
    setGraded((prev) => [...prev, g])
    setRevealed(false)
    const next = index + 1
    setIndex(next)
    if (next >= session.length && !finished.current) {
      finished.current = true
      finishReviewSession(session.length)
    }
  }

  // ── Empty state ──
  if (session.length === 0) {
    return (
      <div className="safe-top flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
        <div aria-hidden className="text-6xl">
          ✅
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-white" data-testid="review-empty">
          All caught up
        </h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
          Nothing is due right now. Finish a lesson to mint new flashcards — they show up here
          immediately, then come back on the SM-2 schedule.
        </p>
        <Link
          to="/learn"
          className="mt-6 flex min-h-[52px] items-center justify-center rounded-2xl bg-emerald-500 px-7 font-bold text-slate-950 active:bg-emerald-400"
        >
          Go to Learn
        </Link>
      </div>
    )
  }

  // ── Session complete ──
  if (done) {
    const xp = XP_REVIEW_SESSION + XP_PER_CARD * session.length
    const again = graded.filter((g) => g === 0).length
    return (
      <div className="safe-top space-y-5 px-4 py-10 text-center" data-testid="review-complete">
        <div aria-hidden className="text-6xl">
          🧠
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Session complete</h1>
          <p className="mt-1 text-sm text-slate-400">
            {session.length} card{session.length === 1 ? '' : 's'} reviewed
          </p>
        </div>

        <dl className="mx-auto max-w-xs space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-left text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-400">Session bonus</dt>
            <dd className="font-semibold tabular-nums text-emerald-300">+{XP_REVIEW_SESSION} XP</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">
              Cards ({session.length} × {XP_PER_CARD})
            </dt>
            <dd className="font-semibold tabular-nums text-emerald-300">
              +{XP_PER_CARD * session.length} XP
            </dd>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-2">
            <dt className="font-semibold text-slate-200">Total</dt>
            <dd className="font-bold tabular-nums text-emerald-300">+{xp} XP</dd>
          </div>
        </dl>

        <p className="text-sm text-slate-400">
          {again > 0
            ? `${again} card${again === 1 ? '' : 's'} came back as Again — you will see ${again === 1 ? 'it' : 'them'} tomorrow.`
            : 'Clean sweep — nothing lapsed.'}
          {nextDue && <span className="block text-slate-500">Next card due {dueLabel(nextDue, today)}.</span>}
        </p>

        <div className="space-y-2.5 pt-1">
          <Link
            to="/"
            className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400"
          >
            Back home
          </Link>
        </div>
      </div>
    )
  }

  // ── Card ──
  return (
    <div className="safe-top flex min-h-[85dvh] flex-col px-4 pb-4">
      <header className="pb-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h1 className="text-sm font-semibold text-slate-300">Review</h1>
          <span className="text-xs tabular-nums text-slate-500" data-testid="review-progress">
            {index + 1} of {session.length}
          </span>
        </div>
        <ProgressBar value={index / session.length} />
      </header>

      <div className="flex flex-1 items-center">
        <div className="w-full">
          <Flashcard
            key={currentId}
            front={seed?.front ?? currentId}
            back={seed?.back ?? 'This card’s content is no longer in the curriculum.'}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
          />
        </div>
      </div>

      <div className="pt-5">
        {revealed ? (
          <div className="anim-fade-up grid grid-cols-4 gap-2" data-testid="grade-buttons">
            {GRADES.map((g) => (
              <button
                key={g.grade}
                type="button"
                data-testid={`grade-${g.label.toLowerCase()}`}
                onClick={() => grade(g.grade)}
                className={`flex min-h-[60px] flex-col items-center justify-center rounded-2xl px-1 text-sm font-bold ${g.cls}`}
              >
                {g.label}
                <span className="text-[10px] font-medium opacity-75">{g.hint}</span>
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            data-testid="reveal-btn"
            onClick={() => setRevealed(true)}
            className="min-h-[60px] w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 font-bold text-slate-100 active:bg-slate-800"
          >
            Show answer
          </button>
        )}
      </div>
    </div>
  )
}
