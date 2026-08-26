// ─── Daily pace, the settings panel ──────────────────────────────────────────
// Sits beside read aloud in the profile editor: same panel shape, same
// per-profile storage, same "the picker may be editing someone who is not
// signed in" dance (see @state/settings).

import { useEffect, useRef, useState } from 'react'
import { PACE_LABELS, PACE_OPTIONS, defaultSettings, monthsToFinish } from '@core/settings'
import type { Pace, Settings } from '@core/settings'
import type { Profile } from '@core/storage/profiles'
import { TOTAL_LESSONS, lessonsRemaining } from '@state/selectors'
import { loadProfileProgress, loadProfileSettings, saveProfilePace } from '@state/settings'

const PANEL = 'rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4'

/** "~6 months", or "under a month" once the finish line is close. */
function estimate(remaining: number, pace: Pace): string {
  const months = monthsToFinish(remaining, pace)
  if (months === 0) return 'curriculum complete'
  if (remaining <= pace * 5) return 'under a month'
  return `~${months} month${months === 1 ? '' : 's'}`
}

export function PaceSection({
  profile,
  isActive,
}: {
  profile: Profile
  /** True when this is the signed-in profile, so writes route through the store. */
  isActive: boolean
}) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [remaining, setRemaining] = useState(TOTAL_LESSONS)
  const [loaded, setLoaded] = useState(false)
  // What is on disk right now — two taps in one frame must not both save from
  // the same stale render value.
  const saved = useRef<Settings>(defaultSettings())

  useEffect(() => {
    let live = true
    void Promise.all([loadProfileSettings(profile.id), loadProfileProgress(profile.id)]).then(
      ([s, progress]) => {
        if (!live) return
        saved.current = s
        setSettings(s)
        setRemaining(lessonsRemaining(progress))
        setLoaded(true)
      },
    )
    return () => {
      live = false
    }
  }, [profile.id])

  const pace = settings.pace

  function pick(next: Pace): void {
    const updated: Settings = { ...saved.current, pace: next }
    const before = saved.current
    saved.current = updated
    setSettings(updated)
    void saveProfilePace(profile.id, before, next, isActive)
  }

  return (
    <section className={PANEL} data-testid="pace-section" data-pace={pace}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Daily pace
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            How many lessons a day the daily goal asks {profile.name} for. More lessons mint more
            flashcards, so the review queue grows with it.
          </p>
        </div>
        <span aria-hidden className="shrink-0 text-2xl leading-none">
          {pace === 1 ? '🌱' : pace === 2 ? '⚡' : '🔥'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {PACE_OPTIONS.map((p) => (
          <button
            key={p}
            type="button"
            data-testid="pace-option"
            data-value={p}
            aria-pressed={p === pace}
            disabled={!loaded}
            onClick={() => pick(p)}
            className={`flex min-h-[72px] flex-col items-center justify-center rounded-2xl border px-1 text-center disabled:opacity-50 ${
              p === pace
                ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                : 'border-slate-700 text-slate-300 active:bg-slate-800'
            }`}
          >
            <span className="text-sm font-bold">{PACE_LABELS[p]}</span>
            <span className="mt-0.5 text-[11px] font-medium tabular-nums opacity-75">
              {p} lesson{p === 1 ? '' : 's'}/day
            </span>
          </button>
        ))}
      </div>

      {/* The honest part: what the choice actually costs in calendar time,
          computed from the lessons this profile has left rather than from the
          full curriculum, and assuming a five-day study week. */}
      <ul className="mt-3.5 space-y-1" data-testid="pace-estimates">
        {PACE_OPTIONS.map((p) => (
          <li
            key={p}
            data-testid="pace-estimate"
            data-value={p}
            className={`flex justify-between text-xs tabular-nums ${
              p === pace ? 'font-semibold text-slate-300' : 'text-slate-500'
            }`}
          >
            <span>
              {PACE_LABELS[p]} · {p}/day
            </span>
            <span>{estimate(remaining, p)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-500" data-testid="pace-note">
        {remaining} of {TOTAL_LESSONS} lessons left, at five study days a week.
      </p>
    </section>
  )
}
