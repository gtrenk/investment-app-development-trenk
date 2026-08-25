// ─── Drills: the daily drill hub ─────────────────────────────────────────────
// One drill a day. This screen only ever *announces* it — the actual chart and
// the answering live in DrillPlayer (/drill).

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { addDays } from '@core/clock'
import {
  answeredToday,
  calibrationStats,
  drillKindForDay,
  pickDailyDrill,
} from '@core/drills/engine'
import { XP_DRILL, XP_DRILL_CORRECT_BONUS } from '@core/gamification/xp'
import { PATTERN_DRILLS, WHATNEXT_DRILLS } from '@content/drills/patterns'
import { useAppStore, appClock } from '@state/useAppStore'
import {
  confidenceSampleSize,
  drillDayStreak,
  drillResultsOn,
  drillTotalsByKind,
} from '@state/selectors'
import { KIND_COPY } from '@ui/drills/labels'

/** Calibration is noise below this many confidence-bearing answers. */
export const CALIBRATION_MIN_N = 5

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3 text-center">
      <p className="text-xl font-extrabold tabular-nums text-white">{value}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  )
}

export function DrillsScreen() {
  const drillHistory = useAppStore((s) => s.drillHistory)
  const today = appClock.today()

  const daily = useMemo(
    () => pickDailyDrill(PATTERN_DRILLS, WHATNEXT_DRILLS, drillHistory, today),
    [drillHistory, today],
  )

  const done = answeredToday(drillHistory, today)
  const todayResults = drillResultsOn(drillHistory, today)
  const streak = drillDayStreak(drillHistory, today)
  const totals = drillTotalsByKind(drillHistory)
  const answered = totals.reduce((n, t) => n + t.answered, 0)
  const correct = totals.reduce((n, t) => n + t.correct, 0)

  const calibN = confidenceSampleSize(drillHistory)
  const buckets = calibrationStats(drillHistory)
  const showCalibration = calibN >= CALIBRATION_MIN_N

  const copy = daily ? KIND_COPY[daily.kind] : null

  return (
    <div className="safe-top space-y-5 px-4 pb-4" data-testid="drills-screen">
      <header>
        <p className="text-sm text-slate-500">One a day, like the review queue</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Drills</h1>
      </header>

      {/* ── Today's drill ── */}
      {done ? (
        <section
          data-testid="drill-answered"
          className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-5"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">
            Today’s drill · done
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span aria-hidden className="text-3xl">
              ✅
            </span>
            <div>
              <p className="text-lg font-bold text-white">
                {todayResults.every((r) => r.correct) ? 'Nailed it' : 'Logged'}
              </p>
              <p className="text-sm text-slate-300">
                {todayResults.map((r) => (
                  <span key={r.drillId} data-testid="today-score" className="tabular-nums">
                    {KIND_COPY[r.kind].title} · {r.correct ? 'correct' : 'missed'} · {r.score > 0 ? '+' : ''}
                    {r.score} pts
                  </span>
                ))}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            A fresh drill unlocks tomorrow — the kind alternates, so tomorrow is{' '}
            <span className="font-semibold text-slate-300">
              {KIND_COPY[drillKindForDay(addDays(today, 1))].title}
            </span>
            .
          </p>
        </section>
      ) : copy && daily ? (
        <section
          data-testid="drill-today"
          data-kind={daily.kind}
          className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70"
        >
          <div className="px-4 pb-4 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Today’s drill
            </p>
            <div className="mt-2 flex items-start gap-3">
              <span aria-hidden className="text-3xl leading-none">
                {copy.icon}
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white">{copy.title}</h2>
                {/* The ticker stays hidden either way — a what-next drill must be
                    anonymous, and a pattern drill reads better unprimed too. */}
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mystery Chart
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{copy.blurb}</p>
            <p className="mt-2 text-xs text-slate-500">
              +{XP_DRILL} XP for playing, +{XP_DRILL_CORRECT_BONUS} more if you are right. Counts
              toward today’s goal.
            </p>
          </div>
          <Link
            to="/drill"
            data-testid="start-drill"
            className="flex min-h-[52px] w-full items-center justify-between bg-emerald-500 px-5 py-3.5 font-bold text-slate-950 active:bg-emerald-400"
          >
            <span>Start the drill</span>
            <span aria-hidden>→</span>
          </Link>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-800 px-4 py-8 text-center text-sm text-slate-500">
          No drills are authored yet.
        </section>
      )}

      {/* ── Running totals ── */}
      <section className="flex gap-2.5" data-testid="drill-totals">
        <Stat value={String(streak)} label={streak === 1 ? 'drill day' : 'drill days'} />
        <Stat value={String(answered)} label="answered" />
        <Stat
          value={answered === 0 ? '—' : `${Math.round((correct / answered) * 100)}%`}
          label="correct"
        />
      </section>

      {/* ── Calibration teaser ── */}
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Calibration
          </h2>
          {showCalibration && (
            <Link
              to="/drill-stats"
              data-testid="calibration-link"
              className="text-xs font-semibold text-emerald-400"
            >
              Full stats →
            </Link>
          )}
        </div>

        {showCalibration ? (
          <div
            data-testid="calibration-summary"
            className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4"
          >
            {buckets.map((b) => (
              <div key={b.confidence} className="flex items-center gap-3 text-sm">
                <span className="w-10 shrink-0 tabular-nums text-slate-400">{b.confidence}%</span>
                <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${Math.round(b.hitRate * 100)}%` }}
                  />
                  {/* Where a perfectly calibrated learner would land. */}
                  <span
                    aria-hidden
                    className="absolute top-0 h-full w-px bg-slate-400"
                    style={{ left: `${b.confidence}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right tabular-nums text-slate-300">
                  {b.n === 0 ? '—' : `${Math.round(b.hitRate * 100)}%`}
                  <span className="ml-1 text-[11px] text-slate-600">n={b.n}</span>
                </span>
              </div>
            ))}
            <p className="pt-1 text-[11px] leading-relaxed text-slate-500">
              The thin line is the claim; the bar is what actually happened. Bars short of the line
              mean overconfidence.
            </p>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-800 px-4 py-5 text-center text-xs leading-relaxed text-slate-600">
            Answer {CALIBRATION_MIN_N - calibN} more what-next drill
            {CALIBRATION_MIN_N - calibN === 1 ? '' : 's'} with a confidence level to unlock your
            calibration chart.
          </p>
        )}
      </section>
    </div>
  )
}
