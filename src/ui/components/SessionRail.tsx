// ─── Smart Session rail ──────────────────────────────────────────────────────
// The one piece of session chrome that follows the learner through the real
// screens: a strip of steps at the top of every route the flow visits, so
// "three things, you are on the second" is never a thing you have to remember.
//
// Rendered by the layouts rather than by the players, which is why none of the
// three players needed restructuring to get it.

import { isStepDone, livePlan, stepShortLabel, useSessionStore } from '@state/session'
import { useSessionInput } from '@ui/session/useSessionFlow'

export function SessionRail() {
  const active = useSessionStore((s) => s.active)
  const started = useSessionStore((s) => s.plan)
  const input = useSessionInput()
  const plan = livePlan(started, input)

  if (!active || plan.length === 0) return null

  const firstPending = plan.findIndex((s) => !isStepDone(s, input))

  // Deliberately not sticky: every player already owns a `sticky top-0` header
  // of its own, and two of them fighting for the same row of pixels is worse
  // than a rail that scrolls away with the top of the page.
  return (
    <div
      data-testid="session-rail"
      data-steps={plan.length}
      className="safe-top safe-x border-b border-slate-800/80 bg-slate-950/95 px-3 py-2"
    >
      <ol className="flex items-center gap-1.5 overflow-x-auto momentum">
        {plan.map((step, i) => {
          const done = isStepDone(step, input)
          const current = i === firstPending
          return (
            <li
              key={`${step.kind}-${i}`}
              data-testid="session-rail-step"
              data-kind={step.kind}
              data-done={done}
              data-current={current}
              className="flex shrink-0 items-center gap-1.5"
            >
              {i > 0 && (
                <span aria-hidden className="text-[11px] text-slate-700">
                  →
                </span>
              )}
              <span
                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                  done
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                    : current
                      ? 'border-emerald-400 bg-emerald-400/10 text-emerald-200'
                      : 'border-slate-800 text-slate-500'
                }`}
              >
                <span aria-hidden>{done ? '✓' : current ? '●' : '○'}</span>
                {stepShortLabel(step, plan)}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
