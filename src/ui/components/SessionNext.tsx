// ─── "Next: …" ───────────────────────────────────────────────────────────────
// The one button that turns three separate players into a single daily flow.
// Each completion panel renders it *instead of* its usual "back to the tabs"
// links while a Smart Session is live; outside a session it renders nothing and
// every screen behaves exactly as it did before.

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@state/useAppStore'
import { stepLabel } from '@state/session'
import { useSessionFlow } from '@ui/session/useSessionFlow'

/**
 * How long a hands-free session pauses on a completion panel before moving on.
 *
 * Long enough to hear "lesson complete" and see the XP land, short enough that
 * a phone in a cradle keeps going without a tap. Only ever applied when read
 * aloud is on — a reader who is looking at the screen gets to decide.
 */
export const SESSION_AUTO_ADVANCE_MS = 2000

export function SessionNext() {
  const { active, next, advance } = useSessionFlow()
  const listening = useAppStore((s) => s.settings.readAloud.enabled)
  const navigate = useNavigate()

  // Kept in a ref so the timer below can fire the freshest closure without
  // being restarted by every unrelated re-render (an XP tick, a celebration).
  const advanceRef = useRef(advance)
  advanceRef.current = advance

  const auto = active && listening
  useEffect(() => {
    if (!auto) return
    const t = setTimeout(() => advanceRef.current(), SESSION_AUTO_ADVANCE_MS)
    return () => clearTimeout(t)
  }, [auto])

  if (!active) return null

  return (
    <div className="space-y-2.5 pt-1">
      <button
        type="button"
        data-testid="session-next"
        data-auto={auto}
        onClick={advance}
        className="flex min-h-[52px] w-full items-center justify-between rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400"
      >
        <span className="min-w-0 truncate pr-3 text-left">
          {next ? (
            <>
              Next: {stepLabel(next)}
              <span className="block text-xs font-normal opacity-70">
                {next.kind === 'lesson' ? 'Lesson' : next.kind === 'drill' ? 'Drill' : 'Reviews'}
              </span>
            </>
          ) : (
            'Finish session'
          )}
        </span>
        <span aria-hidden>→</span>
      </button>
      <button
        type="button"
        data-testid="session-leave"
        onClick={() => navigate('/')}
        className="min-h-[44px] w-full text-sm font-medium text-slate-500 active:text-slate-300"
      >
        End session for now
      </button>
    </div>
  )
}
