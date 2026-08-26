// ─── Smart Session: the launcher and the finish line ─────────────────────────
// Everything in between happens on the real screens (/review, /lesson/:id,
// /drill) — this route only opens the session and celebrates the end of it.

import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { livePlan, pendingStep, stepLabel, stepRoute, useSessionStore } from '@state/session'
import { useAppStore, appClock } from '@state/useAppStore'
import { dayLogFor } from '@state/selectors'
import { sessionInputNow, useSessionInput } from '@ui/session/useSessionFlow'

/** Twelve squares on staggered delays — see `.anim-confetti` in index.css. */
const CONFETTI = ['#34d399', '#38bdf8', '#fbbf24', '#f472b6', '#a78bfa', '#f87171']

function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {Array.from({ length: 12 }, (_, i) => (
        <span
          key={i}
          className="anim-confetti absolute top-0 h-2.5 w-2 rounded-[2px]"
          style={{
            left: `${6 + i * 8}%`,
            backgroundColor: CONFETTI[i % CONFETTI.length],
            animationDelay: `${(i % 6) * 140}ms`,
          }}
        />
      ))}
    </div>
  )
}

export function SessionScreen() {
  const navigate = useNavigate()
  const active = useSessionStore((s) => s.active)
  const started = useSessionStore((s) => s.plan)
  const start = useSessionStore((s) => s.start)

  const game = useAppStore((s) => s.game)
  const today = appClock.today()
  const day = dayLogFor({ game }, today)
  const input = useSessionInput()

  // One shot, on arrival. Two ways in:
  //   • from Home, with no session live — build a plan and jump to step one;
  //   • from the last step's "Finish session" — the session is live and every
  //     step is done, so this falls through to the celebration below with the
  //     full plan (and the rail's row of ticks) intact.
  const opened = useRef(false)
  useEffect(() => {
    if (opened.current) return
    opened.current = true
    const now = sessionInputNow()
    const step = active ? pendingStep(livePlan(started, now), now) : start(now)
    if (step) navigate(stepRoute(step), { replace: true })
    // Intentionally mount-only: re-running this on every store tick would yank
    // the learner back to a route they just deliberately left.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const plan = livePlan(started, input)
  const finished = plan.length > 0

  return (
    <div className="safe-top relative flex min-h-dvh flex-col justify-center px-4 py-10">
      {finished && <Confetti />}
      <div className="anim-pop relative z-10 space-y-5 text-center" data-testid="session-complete">
        <div aria-hidden className="text-6xl">
          {finished ? '🏆' : '✅'}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {finished ? 'Session complete' : 'Nothing left today'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {finished
              ? `${plan.length} step${plan.length === 1 ? '' : 's'}, start to finish.`
              : 'Every review, lesson and drill for today is already done.'}
          </p>
        </div>

        {finished && (
          <ul className="mx-auto max-w-xs space-y-1.5 text-left" data-testid="session-summary-steps">
            {plan.map((step, i) => (
              <li
                key={`${step.kind}-${i}`}
                className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/70 px-3.5 py-2.5 text-sm text-slate-300"
              >
                <span aria-hidden className="text-emerald-400">
                  ✓
                </span>
                <span className="min-w-0 flex-1 truncate">{stepLabel(step)}</span>
              </li>
            ))}
          </ul>
        )}

        <dl className="mx-auto max-w-xs space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-left text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-400">XP earned today</dt>
            <dd
              className="font-bold tabular-nums text-emerald-300"
              data-testid="session-xp-today"
            >
              +{day.xp} XP
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Streak</dt>
            <dd className="font-bold tabular-nums text-orange-300" data-testid="session-streak">
              {game.streak.current} 🔥
            </dd>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-2">
            <dt className="font-semibold text-slate-200">Daily goal</dt>
            <dd
              className={`font-bold ${day.goalMet ? 'text-emerald-300' : 'text-slate-400'}`}
              data-testid="session-goal"
              data-met={day.goalMet}
            >
              {day.goalMet ? 'Met' : 'Not yet'}
            </dd>
          </div>
        </dl>

        {!day.goalMet && (
          <p className="text-xs leading-relaxed text-slate-500">
            Cards are still due — clear the queue to lock today in.
          </p>
        )}

        <div className="space-y-2.5 pt-1">
          <Link
            to="/"
            data-testid="session-home"
            className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  )
}
