// ─── Drill stats: the calibration dashboard ──────────────────────────────────
// Pure divs and one inline SVG — a bar chart of "how sure you said you were"
// against "how often you were actually right" needs no chart library, and
// lightweight-charts is reserved for price data.

import { Link } from 'react-router-dom'
import { CONFIDENCE_LEVELS, calibrationStats } from '@core/drills/engine'
import { useAppStore, appClock } from '@state/useAppStore'
import {
  confidenceSampleSize,
  drillDayStreak,
  drillTotalsByKind,
} from '@state/selectors'
import { KIND_COPY } from '@ui/drills/labels'

/** Verdict for one bucket, in the learner's language rather than statistics'. */
function verdict(confidence: number, hitRate: number, n: number): { text: string; tone: string } {
  if (n < 3) return { text: 'too few answers to judge', tone: 'text-slate-500' }
  const gap = hitRate * 100 - confidence
  if (gap > 12) return { text: 'underconfident — claim more', tone: 'text-sky-300' }
  if (gap < -12) return { text: 'overconfident — ease off', tone: 'text-amber-300' }
  return { text: 'well calibrated', tone: 'text-emerald-300' }
}

export function DrillStatsScreen() {
  const drillHistory = useAppStore((s) => s.drillHistory)
  const today = appClock.today()

  const buckets = calibrationStats(drillHistory)
  const totals = drillTotalsByKind(drillHistory)
  const answered = totals.reduce((n, t) => n + t.answered, 0)
  const correct = totals.reduce((n, t) => n + t.correct, 0)
  const streak = drillDayStreak(drillHistory, today)
  const calibN = confidenceSampleSize(drillHistory)
  const points = drillHistory.results.reduce((sum, r) => sum + r.score, 0)

  // Chart geometry: one column per confidence level, 0–100% on the y-axis.
  const W = 320
  const H = 168
  const PAD_L = 30
  const PAD_B = 26
  const PAD_T = 10
  const plotW = W - PAD_L - 8
  const plotH = H - PAD_B - PAD_T
  const colW = plotW / CONFIDENCE_LEVELS.length
  const y = (v: number) => PAD_T + plotH * (1 - v)

  return (
    <div className="safe-top space-y-6 px-4 pb-10" data-testid="drill-stats-screen">
      <header className="flex items-center gap-3">
        <Link
          to="/drills"
          aria-label="Back to Drills"
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-400 active:bg-slate-800"
        >
          ←
        </Link>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-slate-500">Drills</p>
          <h1 className="text-xl font-extrabold tracking-tight text-white">Your calibration</h1>
        </div>
      </header>

      {/* ── Headline numbers ── */}
      <section className="grid grid-cols-2 gap-2.5" data-testid="drill-stat-tiles">
        {[
          { v: String(streak), l: 'drill day streak', tone: 'text-white' },
          { v: String(answered), l: 'drills answered', tone: 'text-white' },
          {
            v: answered === 0 ? '—' : `${Math.round((correct / answered) * 100)}%`,
            l: 'hit rate',
            tone: 'text-white',
          },
          {
            // Points can go negative — a run of confident misses should look
            // like one, not like a tidy white number.
            v: `${points > 0 ? '+' : points < 0 ? '−' : ''}${Math.abs(points)}`,
            l: 'total points',
            tone: points < 0 ? 'text-rose-300' : 'text-white',
          },
        ].map((t) => (
          <div
            key={t.l}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5"
          >
            <p className={`text-2xl font-extrabold tabular-nums ${t.tone}`}>{t.v}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">{t.l}</p>
          </div>
        ))}
      </section>

      {/* ── Calibration chart ── */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Claimed vs actual
        </h2>
        {calibN === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-800 px-4 py-8 text-center text-xs leading-relaxed text-slate-600">
            Answer a what-next drill with a confidence level and this chart fills in.
          </p>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-4">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              role="img"
              aria-label="Hit rate by stated confidence"
              data-testid="calibration-chart"
            >
              {/* Gridlines + y labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                <g key={v}>
                  <line
                    x1={PAD_L}
                    x2={W - 8}
                    y1={y(v)}
                    y2={y(v)}
                    stroke="#1e293b"
                    strokeWidth={1}
                  />
                  <text x={PAD_L - 6} y={y(v) + 3} textAnchor="end" fill="#64748b" fontSize={9}>
                    {Math.round(v * 100)}
                  </text>
                </g>
              ))}

              {buckets.map((b, i) => {
                const cx = PAD_L + colW * i
                const barW = colW * 0.42
                const barX = cx + colW / 2 - barW / 2
                const top = y(b.hitRate)
                const claimY = y(b.confidence / 100)
                const empty = b.n === 0
                return (
                  <g key={b.confidence} data-testid="calibration-bar" data-confidence={b.confidence}>
                    {/* Actual hit rate */}
                    <rect
                      x={barX}
                      y={empty ? y(0) : top}
                      width={barW}
                      height={empty ? 0 : y(0) - top}
                      rx={3}
                      fill={empty ? '#1e293b' : '#34d399'}
                      opacity={b.n < 3 ? 0.45 : 1}
                    />
                    {/* The claim: a target line across the column */}
                    <line
                      x1={cx + colW * 0.16}
                      x2={cx + colW * 0.84}
                      y1={claimY}
                      y2={claimY}
                      stroke="#f8fafc"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                    />
                    <text
                      x={cx + colW / 2}
                      y={H - PAD_B + 13}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize={10}
                      fontWeight={600}
                    >
                      {b.confidence}%
                    </text>
                    <text
                      x={cx + colW / 2}
                      y={H - PAD_B + 23}
                      textAnchor="middle"
                      fill="#475569"
                      fontSize={8}
                    >
                      n={b.n}
                    </text>
                  </g>
                )
              })}
            </svg>

            <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="inline-block h-2 w-4 rounded-sm bg-emerald-400" />
                actually right
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="inline-block h-0.5 w-4 bg-slate-100" />
                what you claimed
              </span>
            </div>

            <ul className="mt-3 space-y-1.5 border-t border-slate-800 pt-3">
              {buckets.map((b) => {
                const v = verdict(b.confidence, b.hitRate, b.n)
                return (
                  <li key={b.confidence} className="flex items-baseline justify-between text-xs">
                    <span className="tabular-nums text-slate-400">
                      {b.confidence}% →{' '}
                      <span className="font-semibold text-slate-200">
                        {b.n === 0 ? '—' : `${Math.round(b.hitRate * 100)}%`}
                      </span>
                    </span>
                    <span className={v.tone}>{v.text}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </section>

      {/* ── Totals by kind ── */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          By drill kind
        </h2>
        <ul className="divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          {totals.map((t) => (
            <li
              key={t.kind}
              data-testid="kind-total"
              data-kind={t.kind}
              className="flex items-center gap-3 px-4 py-3.5"
            >
              <span aria-hidden className="text-xl">
                {KIND_COPY[t.kind].icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-100">{KIND_COPY[t.kind].title}</p>
                <p className="text-xs text-slate-500">
                  {t.answered === 0
                    ? 'not played yet'
                    : `${t.correct} of ${t.answered} correct`}
                </p>
              </div>
              <span
                className={`shrink-0 text-lg font-bold tabular-nums ${
                  t.answered === 0
                    ? 'text-slate-600'
                    : t.correct / t.answered >= 0.5
                      ? 'text-emerald-300'
                      : 'text-amber-300'
                }`}
              >
                {t.answered === 0 ? '—' : `${Math.round((t.correct / t.answered) * 100)}%`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-[11px] leading-relaxed text-slate-600">
        Calibration is the skill of knowing how much you know. Being right 90% of the time when you
        say 90% is worth more than being right more often than that at 50% — a market call is only
        useful if the confidence attached to it is honest.
      </p>

      <Link
        to="/drills"
        className="flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-5 font-bold text-slate-100 active:bg-slate-800"
      >
        Back to Drills
      </Link>
    </div>
  )
}
