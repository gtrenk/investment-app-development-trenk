// ─── Equity vs SPY, in percent ───────────────────────────────────────────────
// A two-line chart of `performanceSeries` — the account against the shadow
// index, both rebased to 0% at the first snapshot. Inline SVG on purpose:
// lightweight-charts is reserved for candlesticks, and this is a sparkline with
// a zero line, not a price chart.
//
// The y-axis always includes 0%, so "above the line" and "beat the index" mean
// the same thing visually.

import type { PerformancePoint } from '@core/portfolio/benchmark'
import { shortDate, signedPct } from '@ui/format'

const W = 320
const H = 150
const PAD_L = 34
const PAD_R = 8
const PAD_T = 10
const PAD_B = 20

const PORTFOLIO = '#34d399' // emerald-400
const BENCHMARK = '#94a3b8' // slate-400

interface Props {
  points: PerformancePoint[]
  className?: string
}

/** Round a span outward to a readable tick so the axis labels are not noise. */
function niceStep(span: number): number {
  const raw = span / 2
  const mag = 10 ** Math.floor(Math.log10(Math.max(raw, 1e-6)))
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (mag * m >= raw) return mag * m
  }
  return mag * 10
}

export function PerformanceChart({ points, className = '' }: Props) {
  const n = points.length
  const values = points.flatMap((p) => [p.portfolioPct, p.benchmarkPct])
  const lo = Math.min(0, ...values)
  const hi = Math.max(0, ...values)
  const step = niceStep(Math.max(hi - lo, 1))
  let yLo = Math.floor(lo / step) * step
  let yHi = Math.ceil(hi / step) * step
  // A brand-new portfolio is flat at exactly 0% on both lines, which would
  // collapse the axis onto a single row and park the point on the frame. Give
  // it a symmetric band so the zero line sits where it belongs — the middle.
  if (yHi - yLo < step / 2) {
    yLo -= step
    yHi += step
  }
  const span = yHi - yLo

  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B
  // A single point sits in the middle rather than pinned to the left edge.
  const x = (i: number) => (n <= 1 ? PAD_L + plotW / 2 : PAD_L + (plotW * i) / (n - 1))
  const y = (v: number) => PAD_T + plotH * (1 - (v - yLo) / span)

  const path = (pick: (p: PerformancePoint) => number) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(pick(p)).toFixed(2)}`).join(' ')

  // Step from bound to bound rather than halving the span: both bounds are
  // multiples of `step`, so every label lands on a round number (a midpoint of
  // 2.5% printed as "+3%" is worse than no label at all).
  const ticks: number[] = []
  for (let t = yLo; t <= yHi + step / 2; t += step) ticks.push(Math.round(t * 1e6) / 1e6)
  const last = points[n - 1]

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Portfolio return versus the S&P 500, rebased to zero"
        data-testid="perf-chart"
        data-points={n}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y(t)}
              y2={y(t)}
              stroke={Math.abs(t) < 1e-9 ? '#334155' : '#1e293b'}
              strokeWidth={1}
            />
            <text x={PAD_L - 5} y={y(t) + 3} textAnchor="end" fill="#64748b" fontSize={9}>
              {t > 0 ? '+' : ''}
              {t.toFixed(Number.isInteger(step) ? 0 : 1)}%
            </text>
          </g>
        ))}

        {n === 1 ? (
          <>
            <circle cx={x(0)} cy={y(points[0].benchmarkPct)} r={3.5} fill={BENCHMARK} />
            <circle cx={x(0)} cy={y(points[0].portfolioPct)} r={3.5} fill={PORTFOLIO} />
          </>
        ) : (
          <>
            <path
              d={path((p) => p.benchmarkPct)}
              fill="none"
              stroke={BENCHMARK}
              strokeWidth={1.75}
              strokeDasharray="4 3"
              strokeLinejoin="round"
              data-testid="perf-line-benchmark"
            />
            <path
              d={path((p) => p.portfolioPct)}
              fill="none"
              stroke={PORTFOLIO}
              strokeWidth={2.25}
              strokeLinejoin="round"
              strokeLinecap="round"
              data-testid="perf-line-portfolio"
            />
          </>
        )}

        {/* Date bookends — enough context without an axis nobody reads on a phone. */}
        <text x={PAD_L} y={H - 5} textAnchor="start" fill="#475569" fontSize={9}>
          {shortDate(points[0].date)}
        </text>
        {n > 1 && (
          <text x={W - PAD_R} y={H - 5} textAnchor="end" fill="#475569" fontSize={9}>
            {shortDate(last.date)}
          </text>
        )}
      </svg>

      <div className="mt-1.5 flex items-center justify-center gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-0.5 w-4 rounded-full bg-emerald-400" />
          You <span className="tabular-nums text-slate-300" data-testid="perf-portfolio-pct">
            {signedPct(last.portfolioPct)}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-0.5 w-4 rounded-full bg-slate-400"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg,#94a3b8 0 4px,transparent 4px 7px)' }}
          />
          SPY <span className="tabular-nums text-slate-300" data-testid="perf-benchmark-pct">
            {signedPct(last.benchmarkPct)}
          </span>
        </span>
      </div>
    </div>
  )
}
