// ─── Drill player ────────────────────────────────────────────────────────────
// Both drill kinds share one focus-layout shell: header → chart → question →
// reveal → done panel. The drill for the day is snapshotted on mount, because
// recording the answer changes the history that `pickDailyDrill` reads.

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type {
  Confidence,
  DrillResult,
  FinDrillDef,
  OhlcvSeries,
  PatternDrillDef,
  WhatNextDrillDef,
} from '@core/types'
import {
  CALIBRATION_ADJUST,
  CONFIDENCE_LEVELS,
  DRILL_BASE_SCORE,
  answeredToday,
  pickDailyDrill,
  scoreDrill,
  whatNextOutcome,
} from '@core/drills/engine'
import type { WhatNextOutcome } from '@core/drills/engine'
import { lastCloseReturn, sliceSeries } from '@core/market/bundled'
import { XP_DRILL, XP_DRILL_CORRECT_BONUS } from '@core/gamification/xp'
import { PATTERN_DRILLS, PATTERN_LABELS, WHATNEXT_DRILLS } from '@content/drills/patterns'
import { FIN_DRILLS, FIN_DRILL_KIND_LABELS } from '@content/drills/financials'
import { useAppStore, appClock } from '@state/useAppStore'
import { dayLogFor } from '@state/selectors'
import { useSeries } from '@ui/data/loadSeries'
import { useStatements } from '@ui/data/loadFinancials'
import { ATTRIBUTION, CandleChart } from '@ui/charts/CandleChart'
import { Markdown } from '@ui/components/Markdown'
import { StatementTable } from '@ui/components/StatementTable'
import { KIND_COPY, OUTCOMES, OUTCOME_COPY, pct } from '@ui/drills/labels'

/** Bars of lead-in shown before a what-next cutoff. */
export const WHATNEXT_LOOKBACK = 120

// ── Deterministic shuffle ────────────────────────────────────────────────────
// Choice order has to survive a re-render (and a re-mount), otherwise the
// answer moves under the learner's thumb. Seeding off the drill id gives every
// drill one fixed order that is still unguessable across drills.

function hashString(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleSeeded<T>(items: readonly T[], seed: string): T[] {
  const rng = mulberry32(hashString(seed))
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// ── Deferred recording ───────────────────────────────────────────────────────

/**
 * Park an answered drill's result until the learner has read the feedback.
 *
 * Recording on the tap would settle the daily goal immediately and throw the
 * celebration overlay *over* the explanation — the one screen the drill exists
 * for. So the result is armed on answer and flushed on Continue, where the
 * celebration lands on the done panel like it does at the end of a lesson.
 *
 * An unmount flush covers the learner who bails out after answering: the answer
 * was final the moment it was tapped, so it still counts.
 */
function useDeferredRecord() {
  const record = useAppStore((s) => s.recordDrillResult)
  const pending = useRef<DrillResult | null>(null)

  const flush = () => {
    const result = pending.current
    if (!result) return
    pending.current = null
    record(result)
  }

  // Keep the unmount cleanup pointed at the latest closure without re-running it.
  const flushRef = useRef(flush)
  flushRef.current = flush
  useEffect(() => () => flushRef.current(), [])

  return {
    arm(result: DrillResult) {
      pending.current = result
    },
    flush,
  }
}

// ── Shared chrome ────────────────────────────────────────────────────────────

function Shell({
  title,
  subtitle,
  steps,
  step,
  children,
}: {
  title: string
  subtitle: string
  steps: number
  step: number
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="safe-top sticky top-0 z-10 bg-slate-950/95 px-4 pb-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/drills')}
            data-testid="drill-exit"
            aria-label="Exit drill"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-400 active:bg-slate-800"
          >
            ✕
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] uppercase tracking-widest text-slate-500">
              Daily drill
            </p>
            <p className="truncate text-sm font-semibold text-slate-100">{title}</p>
          </div>
          <span className="shrink-0 rounded-full border border-slate-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {subtitle}
          </span>
        </div>
        <div className="mt-2.5 flex gap-1" aria-hidden>
          {Array.from({ length: steps }, (_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-emerald-400' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </header>
      <div className="flex-1 px-4 pb-8 pt-4">{children}</div>
    </div>
  )
}

function ChartFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 px-1 pb-1 pt-2">
      {children}
      <p className="px-2 pb-0.5 text-right text-[9px] tracking-wide text-slate-700">
        {ATTRIBUTION}
      </p>
    </div>
  )
}

function Loading({ label }: { label: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 text-sm text-slate-500">
      {label}
    </div>
  )
}

function Failed({ message }: { message: string }) {
  return (
    <div className="safe-top px-4 py-16 text-center" data-testid="drill-error">
      <p className="text-5xl">📉</p>
      <h1 className="mt-4 text-lg font-bold text-slate-100">Chart data unavailable</h1>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">{message}</p>
      <Link to="/drills" className="mt-6 inline-block text-sm font-semibold text-emerald-400">
        Back to Drills
      </Link>
    </div>
  )
}

// ── Done panel ───────────────────────────────────────────────────────────────

interface ScoreLine {
  label: string
  value: number
}

function DonePanel({
  correct,
  score,
  lines,
  xp,
}: {
  correct: boolean
  score: number
  lines: ScoreLine[]
  xp: number
}) {
  const game = useAppStore((s) => s.game)
  const day = dayLogFor({ game }, appClock.today())

  return (
    <div className="anim-fade-up space-y-5 py-4 text-center" data-testid="drill-done">
      <div aria-hidden className="text-6xl">
        {correct ? '🎯' : '📓'}
      </div>
      <div>
        <h1 className="text-2xl font-extrabold text-white">
          {correct ? 'Drill nailed' : 'Drill logged'}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {correct ? 'That one counts.' : 'A miss you understand is worth more than a lucky hit.'}
        </p>
      </div>

      <dl className="mx-auto max-w-xs space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-left text-sm">
        {lines.map((l) => (
          <div key={l.label} className="flex justify-between gap-3">
            <dt className="text-slate-400">{l.label}</dt>
            <dd
              className={`font-semibold tabular-nums ${
                l.value < 0 ? 'text-rose-300' : 'text-emerald-300'
              }`}
            >
              {l.value > 0 ? '+' : l.value < 0 ? '−' : ''}
              {Math.abs(l.value)}
            </dd>
          </div>
        ))}
        <div className="flex justify-between border-t border-slate-800 pt-2">
          <dt className="font-semibold text-slate-200">Drill score</dt>
          <dd
            className={`font-bold tabular-nums ${score < 0 ? 'text-rose-300' : 'text-emerald-300'}`}
            data-testid="drill-score"
          >
            {score > 0 ? '+' : score < 0 ? '−' : ''}
            {Math.abs(score)} pts
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="font-semibold text-slate-200">XP earned</dt>
          <dd className="font-bold tabular-nums text-emerald-300" data-testid="drill-xp">
            +{xp} XP
          </dd>
        </div>
      </dl>

      <p className="text-sm text-slate-400" data-testid="drill-goal-status">
        {day.goalMet
          ? `Daily goal met — streak at ${game.streak.current} 🔥`
          : 'Clear your review queue to lock in today’s streak.'}
      </p>

      <div className="space-y-2.5 pt-1">
        <Link
          to="/drills"
          data-testid="drill-back"
          className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400"
        >
          Back to Drills
        </Link>
        <Link
          to="/drill-stats"
          className="flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-5 font-bold text-slate-100 active:bg-slate-800"
        >
          See your calibration
        </Link>
      </div>
    </div>
  )
}

// ── Pattern drill ────────────────────────────────────────────────────────────

function PatternDrill({ def }: { def: PatternDrillDef }) {
  const { arm, flush } = useDeferredRecord()
  const { series, loading, error } = useSeries(def.symbol)
  const [picked, setPicked] = useState<string | null>(null)
  const [showDone, setShowDone] = useState(false)
  const recorded = useRef(false)

  const choices = useMemo(
    () => shuffleSeeded([def.answer, ...def.distractors], def.id),
    [def],
  )

  const window: OhlcvSeries | null = useMemo(
    () => (series ? sliceSeries(series, def.startIdx, def.endIdx) : null),
    [series, def],
  )

  if (error) return <Failed message={error} />

  const answered = picked !== null
  const correct = picked === def.answer
  const score = scoreDrill(correct)

  function pick(id: string) {
    if (picked !== null || recorded.current) return
    setPicked(id)
    recorded.current = true
    const isRight = id === def.answer
    arm({
      drillId: def.id,
      kind: 'pattern',
      date: appClock.today(),
      correct: isRight,
      score: scoreDrill(isRight),
    })
  }

  if (showDone) {
    return (
      <Shell title={KIND_COPY.pattern.title} subtitle="Done" steps={2} step={1}>
        <DonePanel
          correct={correct}
          score={score}
          lines={[{ label: correct ? 'Correct answer' : 'Missed', value: score }]}
          xp={XP_DRILL + (correct ? XP_DRILL_CORRECT_BONUS : 0)}
        />
      </Shell>
    )
  }

  return (
    <Shell
      title={KIND_COPY.pattern.title}
      // The ticker is a spoiler-free reward: it appears only once the answer is in.
      subtitle={answered ? def.symbol : 'Mystery Chart'}
      steps={2}
      step={0}
    >
      <div className="space-y-4">
        {window ? (
          <ChartFrame>
            <CandleChart series={window} height={240} />
          </ChartFrame>
        ) : (
          <Loading label={loading ? 'Loading chart…' : 'No data'} />
        )}

        <h2 className="text-lg font-semibold leading-snug text-white" data-testid="drill-question">
          What pattern is this?
        </h2>

        <div className="space-y-2.5">
          {choices.map((id, i) => {
            const isAnswer = id === def.answer
            const isPicked = id === picked
            const state = !answered
              ? 'idle'
              : isAnswer
                ? isPicked
                  ? 'correct'
                  : 'revealed'
                : isPicked
                  ? 'wrong'
                  : 'idle'
            const cls =
              state === 'correct'
                ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                : state === 'revealed'
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                  : state === 'wrong'
                    ? 'border-rose-500 bg-rose-500/15 text-rose-100'
                    : 'border-slate-700 bg-slate-900 text-slate-100 active:bg-slate-800'
            return (
              <button
                key={id}
                type="button"
                data-testid="drill-choice"
                data-state={state}
                disabled={answered}
                onClick={() => pick(id)}
                className={`flex min-h-[52px] w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] font-semibold transition-colors ${cls}`}
              >
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-[11px] opacity-70"
                >
                  {'ABCD'[i]}
                </span>
                <span className="min-w-0 flex-1">{PATTERN_LABELS[id]}</span>
                {state === 'correct' && <span aria-hidden>✓</span>}
                {state === 'revealed' && <span aria-hidden>←</span>}
                {state === 'wrong' && <span aria-hidden>✕</span>}
              </button>
            )
          })}
        </div>

        {answered && (
          <div
            data-testid="drill-explain"
            data-correct={correct}
            className={`anim-fade-up rounded-2xl border px-4 py-3.5 ${
              correct ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-rose-500/40 bg-rose-500/10'
            }`}
          >
            <p className={`mb-1.5 text-sm font-bold ${correct ? 'text-emerald-300' : 'text-rose-300'}`}>
              {correct
                ? `Correct — ${PATTERN_LABELS[def.answer]}`
                : `Not quite — it is a ${PATTERN_LABELS[def.answer]}`}
            </p>
            <div className="text-[13px] leading-relaxed text-slate-300">
              <Markdown md={def.explain} />
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-500">
              {def.symbol} · bars {def.startIdx}–{def.endIdx}
            </p>
          </div>
        )}

        {answered && (
          <button
            type="button"
            data-testid="drill-continue"
            onClick={() => {
              flush()
              setShowDone(true)
            }}
            className="min-h-[52px] w-full rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400"
          >
            Continue
          </button>
        )}
      </div>
    </Shell>
  )
}

// ── Read-the-financials drill ────────────────────────────────────────────────

/**
 * The authored `explain` strings use `•` for their distractor post-mortems.
 * `Markdown` understands `-` and `*` lists, so translate at the boundary rather
 * than reformatting 36 hand-written explanations (or teaching the renderer a
 * fourth bullet character it will never see anywhere else).
 */
function bulletsToMarkdown(md: string): string {
  return md.replace(/^•\s+/gm, '- ')
}

function FinancialsDrill({ def }: { def: FinDrillDef }) {
  const { arm, flush } = useDeferredRecord()
  const { statements, loading, error } = useStatements(def.statementIds)
  const [picked, setPicked] = useState<number | null>(null)
  const [showDone, setShowDone] = useState(false)
  const recorded = useRef(false)

  if (error) return <Failed message={error} />

  const answered = picked !== null
  const correct = picked === def.answerIdx
  const score = scoreDrill(correct)

  function pick(idx: number) {
    if (picked !== null || recorded.current) return
    setPicked(idx)
    recorded.current = true
    const isRight = idx === def.answerIdx
    arm({
      drillId: def.id,
      kind: 'financials',
      date: appClock.today(),
      correct: isRight,
      score: scoreDrill(isRight),
    })
  }

  if (showDone) {
    return (
      <Shell title={KIND_COPY.financials.title} subtitle="Done" steps={2} step={1}>
        <DonePanel
          correct={correct}
          score={score}
          lines={[{ label: correct ? 'Correct answer' : 'Missed', value: score }]}
          xp={XP_DRILL + (correct ? XP_DRILL_CORRECT_BONUS : 0)}
        />
      </Shell>
    )
  }

  return (
    <Shell
      title={KIND_COPY.financials.title}
      subtitle={FIN_DRILL_KIND_LABELS[def.kind]}
      steps={2}
      step={0}
    >
      <div className="space-y-4">
        {statements.length > 0 ? (
          <StatementTable companies={statements} />
        ) : (
          <Loading label={loading ? 'Loading statements…' : 'No statements'} />
        )}

        <h2
          className="text-[15px] font-semibold leading-snug text-white"
          data-testid="drill-question"
        >
          {def.prompt}
        </h2>

        <div className="space-y-2.5">
          {def.choices.map((choice, i) => {
            const isAnswer = i === def.answerIdx
            const isPicked = i === picked
            const state = !answered
              ? 'idle'
              : isAnswer
                ? isPicked
                  ? 'correct'
                  : 'revealed'
                : isPicked
                  ? 'wrong'
                  : 'idle'
            const cls =
              state === 'correct'
                ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                : state === 'revealed'
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                  : state === 'wrong'
                    ? 'border-rose-500 bg-rose-500/15 text-rose-100'
                    : 'border-slate-700 bg-slate-900 text-slate-100 active:bg-slate-800'
            return (
              <button
                key={choice}
                type="button"
                data-testid="drill-choice"
                data-state={state}
                disabled={answered}
                onClick={() => pick(i)}
                className={`flex min-h-[52px] w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-[14px] font-semibold leading-snug transition-colors ${cls}`}
              >
                <span
                  aria-hidden
                  className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-[11px] opacity-70"
                >
                  {'ABCD'[i]}
                </span>
                <span className="min-w-0 flex-1 tabular-nums">{choice}</span>
                {state === 'correct' && <span aria-hidden>✓</span>}
                {state === 'revealed' && <span aria-hidden>←</span>}
                {state === 'wrong' && <span aria-hidden>✕</span>}
              </button>
            )
          })}
        </div>

        {answered && (
          <div
            data-testid="drill-explain"
            data-correct={correct}
            className={`anim-fade-up rounded-2xl border px-4 py-3.5 ${
              correct ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-rose-500/40 bg-rose-500/10'
            }`}
          >
            <p className={`mb-2 text-sm font-bold ${correct ? 'text-emerald-300' : 'text-rose-300'}`}>
              {correct
                ? 'Correct'
                : `Not quite — the answer is ${'ABCD'[def.answerIdx]}: ${def.choices[def.answerIdx]}`}
            </p>
            <div className="text-[13px] leading-relaxed text-slate-300">
              <Markdown md={bulletsToMarkdown(def.explain)} />
            </div>
          </div>
        )}

        {answered && (
          <button
            type="button"
            data-testid="drill-continue"
            onClick={() => {
              flush()
              setShowDone(true)
            }}
            className="min-h-[52px] w-full rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400"
          >
            Continue
          </button>
        )}
      </div>
    </Shell>
  )
}

// ── What-next drill ──────────────────────────────────────────────────────────

type WhatNextStep = 'direction' | 'confidence' | 'reveal' | 'done'

function WhatNextDrill({ def }: { def: WhatNextDrillDef }) {
  const { arm, flush } = useDeferredRecord()
  const { series, loading, error } = useSeries(def.symbol)
  const [step, setStep] = useState<WhatNextStep>('direction')
  const [guess, setGuess] = useState<WhatNextOutcome | null>(null)
  const [confidence, setConfidence] = useState<Confidence | null>(null)
  const recorded = useRef(false)

  const from = Math.max(0, def.cutoffIdx - WHATNEXT_LOOKBACK)

  const leadIn = useMemo(
    () => (series ? sliceSeries(series, from, def.cutoffIdx) : null),
    [series, from, def.cutoffIdx],
  )
  const full = useMemo(
    () => (series ? sliceSeries(series, from, def.cutoffIdx + def.horizon) : null),
    [series, from, def],
  )
  const actual = useMemo(
    () => (series ? lastCloseReturn(series, def.cutoffIdx, def.horizon) : null),
    [series, def],
  )

  if (error) return <Failed message={error} />

  const truth: WhatNextOutcome | null = actual === null ? null : whatNextOutcome(actual)
  const correct = truth !== null && guess === truth

  function commit(confidence: Confidence) {
    if (recorded.current || guess === null || truth === null) return
    recorded.current = true
    const isRight = guess === truth
    arm({
      drillId: def.id,
      kind: 'whatnext',
      date: appClock.today(),
      correct: isRight,
      confidence,
      score: scoreDrill(isRight, confidence),
    })
    setConfidence(confidence)
    setStep('reveal')
  }

  const score = confidence === null ? 0 : scoreDrill(correct, confidence)

  const stepIndex = step === 'direction' ? 0 : step === 'confidence' ? 1 : 2

  if (step === 'done' && confidence !== null) {
    const adj = CALIBRATION_ADJUST[confidence][correct ? 'correct' : 'wrong']
    return (
      <Shell title={KIND_COPY.whatnext.title} subtitle="Done" steps={3} step={2}>
        <DonePanel
          correct={correct}
          score={score}
          lines={[
            { label: correct ? 'Right call' : 'Wrong call', value: correct ? DRILL_BASE_SCORE : 0 },
            { label: `${confidence}% sure and ${correct ? 'right' : 'wrong'}`, value: adj },
          ]}
          xp={XP_DRILL + (correct ? XP_DRILL_CORRECT_BONUS : 0)}
        />
      </Shell>
    )
  }

  const revealing = step === 'reveal'

  return (
    <Shell
      title={KIND_COPY.whatnext.title}
      // Never the ticker: naming it would hand over the answer from memory.
      subtitle="Mystery Chart"
      steps={3}
      step={stepIndex}
    >
      <div className="space-y-4">
        {revealing && full ? (
          <ChartFrame>
            <CandleChart
              key="reveal"
              series={full}
              height={240}
              revealFrom={def.cutoffIdx - from}
            />
          </ChartFrame>
        ) : leadIn ? (
          <ChartFrame>
            <CandleChart key="leadin" series={leadIn} height={240} />
          </ChartFrame>
        ) : (
          <Loading label={loading ? 'Loading chart…' : 'No data'} />
        )}

        {step === 'direction' && (
          <div className="space-y-3">
            <h2
              className="text-lg font-semibold leading-snug text-white"
              data-testid="drill-question"
            >
              Where does it close {def.horizon} bars from here?
            </h2>
            <div className="space-y-2.5">
              {OUTCOMES.map((o) => {
                const c = OUTCOME_COPY[o]
                return (
                  <button
                    key={o}
                    type="button"
                    data-testid="drill-choice"
                    data-outcome={o}
                    onClick={() => {
                      setGuess(o)
                      setStep('confidence')
                    }}
                    className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-left font-semibold text-slate-100 active:bg-slate-800"
                  >
                    <span aria-hidden className={`text-lg ${c.tint}`}>
                      {c.icon}
                    </span>
                    <span className="flex-1">{c.label}</span>
                    <span className="tabular-nums text-sm font-normal text-slate-500">{c.band}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Measured close-to-close over the next {def.horizon} bars. Anything inside the band
              counts as Flat.
            </p>
          </div>
        )}

        {step === 'confidence' && guess && (
          <div className="anim-fade-up space-y-3">
            <h2
              className="text-lg font-semibold leading-snug text-white"
              data-testid="drill-question"
            >
              You said{' '}
              <span className={OUTCOME_COPY[guess].tint}>
                {OUTCOME_COPY[guess].label} {OUTCOME_COPY[guess].band}
              </span>
              . How sure are you?
            </h2>
            <div className="grid grid-cols-3 gap-2.5">
              {CONFIDENCE_LEVELS.map((c) => (
                <button
                  key={c}
                  type="button"
                  data-testid="confidence-choice"
                  data-confidence={c}
                  onClick={() => commit(c)}
                  className="flex min-h-[72px] flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-2 font-bold text-slate-100 active:bg-slate-800"
                >
                  <span className="text-xl tabular-nums">{c}%</span>
                  <span className="mt-0.5 text-[10px] font-medium text-slate-500">
                    {c === 50 ? 'coin flip' : c === 70 ? 'leaning' : 'confident'}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Claiming 90% and being right pays {CALIBRATION_ADJUST[90].correct > 0 ? '+' : ''}
              {CALIBRATION_ADJUST[90].correct} extra — being wrong costs{' '}
              {Math.abs(CALIBRATION_ADJUST[90].wrong)}. Hedge at 50% and you bank almost nothing
              either way.
            </p>
            <button
              type="button"
              onClick={() => setStep('direction')}
              className="min-h-[44px] w-full rounded-2xl border border-slate-800 px-4 text-sm font-semibold text-slate-400 active:bg-slate-900"
            >
              Change my call
            </button>
          </div>
        )}

        {revealing && confidence !== null && truth !== null && actual !== null && guess && (
          <div className="anim-fade-up space-y-3" data-testid="drill-reveal" data-correct={correct}>
            <div
              className={`rounded-2xl border px-4 py-4 ${
                correct
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : 'border-rose-500/40 bg-rose-500/10'
              }`}
            >
              <p className={`text-sm font-bold ${correct ? 'text-emerald-300' : 'text-rose-300'}`}>
                {correct ? 'Called it' : 'Missed it'}
              </p>
              <p className="mt-1.5 text-sm text-slate-300">
                You said{' '}
                <span className={`font-semibold ${OUTCOME_COPY[guess].tint}`}>
                  {OUTCOME_COPY[guess].label}
                </span>{' '}
                at {confidence}%. It went{' '}
                <span className={`font-semibold ${OUTCOME_COPY[truth].tint}`}>
                  {OUTCOME_COPY[truth].label}
                </span>{' '}
                —{' '}
                <span className="font-bold tabular-nums" data-testid="drill-actual">
                  {pct(actual)}
                </span>{' '}
                over {def.horizon} bars.
              </p>
              <p className="mt-2.5 border-t border-white/10 pt-2.5 text-[13px] leading-relaxed text-slate-400">
                <span className="font-semibold text-slate-200">
                  {score > 0 ? '+' : score < 0 ? '−' : ''}
                  {Math.abs(score)} pts:
                </span>{' '}
                {correct ? `+${DRILL_BASE_SCORE} for the call` : '0 for the call'},{' '}
                {CALIBRATION_ADJUST[confidence][correct ? 'correct' : 'wrong'] === 0
                  ? 'nothing either way'
                  : `${CALIBRATION_ADJUST[confidence][correct ? 'correct' : 'wrong'] > 0 ? '+' : '−'}${Math.abs(
                      CALIBRATION_ADJUST[confidence][correct ? 'correct' : 'wrong'],
                    )}`}{' '}
                for being {confidence}% sure and {correct ? 'right' : 'wrong'}.
              </p>
            </div>
            <button
              type="button"
              data-testid="drill-continue"
              onClick={() => {
                flush()
                setStep('done')
              }}
              className="min-h-[52px] w-full rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </Shell>
  )
}

// ── Route entry ──────────────────────────────────────────────────────────────

export function DrillPlayer() {
  const drillHistory = useAppStore((s) => s.drillHistory)
  const today = appClock.today()

  // Snapshot both on mount: recording the answer mutates the history that
  // `pickDailyDrill` and `answeredToday` read, and the drill in play must not
  // change underneath the learner.
  const [daily] = useState(() =>
    pickDailyDrill(PATTERN_DRILLS, WHATNEXT_DRILLS, drillHistory, today, undefined, FIN_DRILLS),
  )
  const [wasAnswered] = useState(() => answeredToday(drillHistory, today))

  if (wasAnswered) {
    return (
      <div className="safe-top px-4 py-16 text-center" data-testid="drill-already-done">
        <p className="text-5xl">✅</p>
        <h1 className="mt-4 text-lg font-bold text-slate-100">Today’s drill is done</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
          One a day — spacing them out is what makes them stick. A new one unlocks tomorrow.
        </p>
        <Link
          to="/drills"
          className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-emerald-500 px-7 font-bold text-slate-950 active:bg-emerald-400"
        >
          Back to Drills
        </Link>
      </div>
    )
  }

  if (!daily) return <Failed message="No drills are authored yet." />

  if (daily.kind === 'pattern') return <PatternDrill def={daily.def} />
  if (daily.kind === 'whatnext') return <WhatNextDrill def={daily.def} />
  return <FinancialsDrill def={daily.def} />
}
