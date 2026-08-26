// ─── Per-profile settings ────────────────────────────────────────────────────
// One extensible object per profile, saved under STORAGE_KEYS.settings. Pure
// data + a defensive reader, so a record written by a future build (or a
// half-cleared store) degrades to defaults instead of crashing a screen.

/** The four speeds the rate control offers. 1 is the platform default. */
export const READ_ALOUD_RATES = [0.8, 1, 1.2, 1.5] as const
export type ReadAloudRate = (typeof READ_ALOUD_RATES)[number]

export interface ReadAloudSettings {
  /** Opt-in, always. Silence is the default for every new profile. */
  enabled: boolean
  rate: ReadAloudRate
}

export interface Settings {
  readAloud: ReadAloudSettings
}

export function defaultSettings(): Settings {
  return { readAloud: { enabled: false, rate: 1 } }
}

function isRate(v: unknown): v is ReadAloudRate {
  return (READ_ALOUD_RATES as readonly number[]).includes(v as number)
}

/** Never throws, never returns a partial object. */
export function sanitizeSettings(raw: unknown): Settings {
  const base = defaultSettings()
  if (!raw || typeof raw !== 'object') return base
  const r = (raw as { readAloud?: unknown }).readAloud
  if (!r || typeof r !== 'object') return base
  const ra = r as Partial<ReadAloudSettings>
  return {
    readAloud: {
      enabled: ra.enabled === true,
      rate: isRate(ra.rate) ? ra.rate : base.readAloud.rate,
    },
  }
}
