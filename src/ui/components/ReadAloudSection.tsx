// ─── Read aloud, the settings panel ──────────────────────────────────────────
// Lives in the profile picker's edit view, under the name and avatar and above
// cloud sync. Per-profile: one household member can listen to lessons in the
// car while another reads them on the sofa.

import { useEffect, useRef, useState } from 'react'
import { READ_ALOUD_RATES, defaultSettings } from '@core/settings'
import type { ReadAloudRate, Settings } from '@core/settings'
import type { Profile } from '@core/storage/profiles'
import { loadProfileSettings, saveProfileReadAloud } from '@state/settings'
import { isSupported } from '@ui/speech/tts'

const PANEL = 'rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4'

/** `1 → '1×'`, `0.8 → '0.8×'`. */
function rateLabel(rate: ReadAloudRate): string {
  return `${rate}×`
}

export function ReadAloudSection({
  profile,
  isActive,
}: {
  profile: Profile
  /** True when this is the signed-in profile, so writes route through the store. */
  isActive: boolean
}) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loaded, setLoaded] = useState(false)
  // Read once on mount rather than every render: `isSupported()` walks
  // window.speechSynthesis, and the answer cannot change mid-screen.
  const [supported] = useState(isSupported)
  // What is actually on disk right now. Two taps in one frame (toggle on, then
  // a speed) would otherwise both save from the same stale render value and the
  // second would undo the first.
  const saved = useRef<Settings>(defaultSettings())

  useEffect(() => {
    let live = true
    void loadProfileSettings(profile.id).then((s) => {
      if (!live) return
      saved.current = s
      setSettings(s)
      setLoaded(true)
    })
    return () => {
      live = false
    }
  }, [profile.id])

  const { enabled, rate } = settings.readAloud

  function update(patch: Partial<Settings['readAloud']>): void {
    const next: Settings = {
      ...saved.current,
      readAloud: { ...saved.current.readAloud, ...patch },
    }
    // Optimistic: the write is one IndexedDB put and the toggle must not lag a
    // thumb. A failed put leaves the switch ahead of storage until the next
    // load, which is the right way round for a preference.
    const before = saved.current
    saved.current = next
    setSettings(next)
    void saveProfileReadAloud(profile.id, before, patch, isActive)
  }

  return (
    <section className={PANEL} data-testid="readaloud-section" data-enabled={enabled}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Read aloud
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Play lessons through whatever {profile.name} is listening on — phone speaker,
            headphones, the car. Pages turn themselves once a block finishes.
          </p>
        </div>
        <span aria-hidden className="shrink-0 text-2xl leading-none">
          {enabled ? '🔊' : '🔈'}
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Read aloud"
        data-testid="readaloud-toggle"
        disabled={!supported || !loaded}
        onClick={() => update({ enabled: !enabled })}
        className={`mt-4 flex min-h-[48px] w-full items-center justify-between rounded-2xl border px-4 font-bold disabled:opacity-50 ${
          enabled
            ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 active:bg-emerald-500/20'
            : 'border-slate-700 text-slate-200 active:bg-slate-800'
        }`}
      >
        <span>{enabled ? 'On' : 'Off'}</span>
        <span
          aria-hidden
          className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${
            enabled ? 'justify-end bg-emerald-500' : 'justify-start bg-slate-700'
          }`}
        >
          <span className="h-5 w-5 rounded-full bg-white" />
        </span>
      </button>

      {enabled && (
        <div className="mt-3.5" data-testid="readaloud-rate">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Speed
          </p>
          <div className="grid grid-cols-4 gap-2">
            {READ_ALOUD_RATES.map((r) => (
              <button
                key={r}
                type="button"
                data-testid="readaloud-rate-option"
                data-rate={r}
                aria-pressed={r === rate}
                onClick={() => update({ rate: r })}
                className={`min-h-[44px] rounded-xl border text-sm font-bold tabular-nums ${
                  r === rate
                    ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                    : 'border-slate-700 text-slate-300 active:bg-slate-800'
                }`}
              >
                {rateLabel(r)}
              </button>
            ))}
          </div>
        </div>
      )}

      {supported ? (
        <p className="mt-3.5 text-xs leading-relaxed text-slate-500" data-testid="readaloud-note">
          Listen mode reads lessons hands-free. Stay attentive to your surroundings.
        </p>
      ) : (
        <p
          className="mt-3.5 text-xs leading-relaxed text-slate-500"
          data-testid="readaloud-unsupported"
        >
          This browser has no speech voices, so read aloud is unavailable here. Safari, Chrome and
          Edge all have them.
        </p>
      )}
    </section>
  )
}
