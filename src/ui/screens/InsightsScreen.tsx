// ─── Insights: accuracy by unit ──────────────────────────────────────────────
// The honest answer to "where am I actually weak?", built from three signals
// the app already has (see @core/weakspots/insight): first-try quiz accuracy,
// mistakes still unfixed, and flashcards that keep lapsing.
//
// Its own screen rather than a panel bolted onto /drill-stats: that page is
// about *calibration* — how well the learner's stated confidence matches their
// hit rate on chart drills — and this one is about the curriculum. Two
// different questions with two different remedies; sharing a page would make
// both harder to read. Reachable from the drill-stats footer, from the Home
// weak-spots row's destination, and from the weak-spot session's own screens.

import { Link } from 'react-router-dom'
import { ALL_UNITS } from '@content/units'
import { rankUnits, unitInsights, weakSpotSummary } from '@core/weakspots/insight'
import type { UnitInsight } from '@core/weakspots/insight'
import { WEAKSPOT_HOME_THRESHOLD } from '@core/weakspots/session'
import { useAppStore, appClock } from '@state/useAppStore'

/** Bar colour by weakness: nothing to see, worth a look, go and fix it. */
function tone(score: number): { bar: string; text: string; label: string } {
  if (score >= 50) return { bar: 'bg-rose-400', text: 'text-rose-300', label: 'weak' }
  if (score >= 25) return { bar: 'bg-amber-400', text: 'text-amber-300', label: 'shaky' }
  return { bar: 'bg-emerald-400', text: 'text-emerald-300', label: 'solid' }
}

function UnitRow({ insight }: { insight: UnitInsight }) {
  const t = tone(insight.score)
  const accuracyPct = insight.accuracy === null ? null : Math.round(insight.accuracy * 100)

  const body = (
    <>
      <div className="flex items-baseline gap-2">
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-100">
          {insight.title}
        </span>
        <span className={`shrink-0 text-xs font-bold tabular-nums ${t.text}`}>
          {accuracyPct === null ? '—' : `${accuracyPct}%`}
        </span>
      </div>

      {/* The bar is ACCURACY, not the weakness score: a long green bar reading
          "you get 90% of these right" is the thing a learner can act on, and
          plotting weakness instead would make the best unit look the busiest. */}
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${t.bar}`}
          style={{ width: `${accuracyPct ?? 0}%` }}
          data-testid="insight-accuracy-bar"
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
        <span className="tabular-nums">
          {insight.quizMissed}/{insight.quizAttempted} missed
        </span>
        {insight.openMisses > 0 && (
          <span className="tabular-nums text-amber-300">{insight.openMisses} to fix</span>
        )}
        {insight.lapsedCards > 0 && (
          <span className="tabular-nums text-sky-300">{insight.lapsedCards} cards lapsing</span>
        )}
        <span className="ml-auto uppercase tracking-wide">{t.label}</span>
      </div>
    </>
  )

  const shell = 'block rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5'

  return (
    <li
      data-testid="insight-unit-row"
      data-unit={insight.unitId}
      data-score={insight.score}
      data-open={insight.openMisses}
      data-lapsed={insight.lapsedCards}
    >
      {insight.openMisses > 0 ? (
        <Link to="/weakspots" className={`${shell} active:bg-slate-800/70`}>
          {body}
        </Link>
      ) : (
        <div className={shell}>{body}</div>
      )}
    </li>
  )
}

export function InsightsScreen() {
  const progress = useAppStore((s) => s.progress)
  const weakSpots = useAppStore((s) => s.weakSpots)
  const srs = useAppStore((s) => s.srs)
  const today = appClock.today()

  const insights = unitInsights({
    units: ALL_UNITS,
    firstTryCorrect: progress.firstTryCorrect,
    weakSpots,
    srs,
    today,
  })
  const ranked = rankUnits(insights)
  const summary = weakSpotSummary(insights)
  const accuracyPct = summary.accuracy === null ? null : Math.round(summary.accuracy * 100)

  return (
    <div className="safe-top space-y-6 px-4 pb-10" data-testid="insights-screen">
      <header className="flex items-center gap-3">
        <Link
          to="/"
          aria-label="Back home"
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-400 active:bg-slate-800"
        >
          ←
        </Link>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-slate-500">Insights</p>
          <h1 className="text-xl font-extrabold tracking-tight text-white">Where you are weak</h1>
        </div>
      </header>

      {insights.length === 0 ? (
        <p
          data-testid="insights-empty"
          className="rounded-2xl border border-dashed border-slate-800 px-4 py-8 text-center text-xs leading-relaxed text-slate-600"
        >
          Nothing to measure yet. Answer a few lesson quizzes and this fills in — one row per unit,
          ranked by how much of it is still shaky.
        </p>
      ) : (
        <>
          <section className="grid grid-cols-3 gap-2.5" data-testid="insight-tiles">
            {[
              {
                v: accuracyPct === null ? '—' : `${accuracyPct}%`,
                l: 'first-try accuracy',
                tone: 'text-white',
              },
              {
                v: String(summary.openMisses),
                l: 'still to fix',
                tone: summary.openMisses > 0 ? 'text-amber-300' : 'text-white',
              },
              {
                v: String(summary.unitsAffected),
                l: summary.unitsAffected === 1 ? 'unit affected' : 'units affected',
                tone: 'text-white',
              },
            ].map((t) => (
              <div key={t.l} className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3">
                <p className={`text-xl font-extrabold tabular-nums ${t.tone}`}>{t.v}</p>
                <p className="mt-0.5 text-[10px] uppercase leading-tight tracking-wide text-slate-500">
                  {t.l}
                </p>
              </div>
            ))}
          </section>

          {summary.openMisses > 0 && (
            <Link
              to="/weakspots"
              data-testid="insights-cta"
              className="flex min-h-[56px] w-full items-center justify-between rounded-2xl bg-amber-400 px-5 py-3 font-bold text-slate-950 active:bg-amber-300"
            >
              <span className="min-w-0 pr-3 text-left">
                Fix my weak spots
                <span className="block truncate text-xs font-medium opacity-75">
                  {summary.openMisses} question{summary.openMisses === 1 ? '' : 's'} queued
                  {summary.weakest ? ` · worst: ${summary.weakest.title}` : ''}
                </span>
              </span>
              <span aria-hidden className="text-lg">
                ▶
              </span>
            </Link>
          )}

          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              By unit — weakest first
            </h2>
            <ul className="space-y-2">
              {ranked.map((insight) => (
                <UnitRow key={insight.unitId} insight={insight} />
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="text-[11px] leading-relaxed text-slate-600">
        Accuracy counts every quiz item of a unit you have answered: an item you have ever got wrong
        counts as missed, even after you fix it, because that is what it means to have been weak
        there. “To fix” is the part still open — the Home row appears once{' '}
        {WEAKSPOT_HOME_THRESHOLD} of them are waiting.
      </p>

      <Link
        to="/"
        className="flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-5 font-bold text-slate-100 active:bg-slate-800"
      >
        Back home
      </Link>
    </div>
  )
}
