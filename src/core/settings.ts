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

// ── Daily pace ───────────────────────────────────────────────────────────────

/** Lessons the daily goal asks for: Chill, Focused, Intense. */
export const PACE_OPTIONS = [1, 2, 3] as const
export type Pace = (typeof PACE_OPTIONS)[number]

/** One lesson a day — the pace the app shipped with, and a safe default. */
export const DEFAULT_PACE: Pace = 1

export const PACE_LABELS: Record<Pace, string> = {
  1: 'Chill',
  2: 'Focused',
  3: 'Intense',
}

export interface Settings {
  readAloud: ReadAloudSettings
  /**
   * How many lessons a day the learner has signed up for. Raises the daily
   * goal, the SRS caps and the length of a Smart Session together — see
   * `lessonGoalFor` (streak) and `queueOptsForPace` (scheduler).
   */
  pace: Pace
}

export function defaultSettings(): Settings {
  return { readAloud: { enabled: false, rate: 1 }, pace: DEFAULT_PACE }
}

function isRate(v: unknown): v is ReadAloudRate {
  return (READ_ALOUD_RATES as readonly number[]).includes(v as number)
}

export function isPace(v: unknown): v is Pace {
  return (PACE_OPTIONS as readonly number[]).includes(v as number)
}

/** Never throws, never returns a partial object. */
export function sanitizeSettings(raw: unknown): Settings {
  const base = defaultSettings()
  if (!raw || typeof raw !== 'object') return base

  const rec = raw as { readAloud?: unknown; pace?: unknown }
  // Read independently of read-aloud: the two preferences travel in one blob,
  // and a record written before pace existed (or by a build that dropped
  // read-aloud) must still yield the half it does carry.
  const pace = isPace(rec.pace) ? rec.pace : base.pace

  const r = rec.readAloud
  if (!r || typeof r !== 'object') return { ...base, pace }
  const ra = r as Partial<ReadAloudSettings>
  return {
    readAloud: {
      enabled: ra.enabled === true,
      rate: isRate(ra.rate) ? ra.rate : base.readAloud.rate,
    },
    pace,
  }
}

// ── "How long will this take?" ───────────────────────────────────────────────

/**
 * Study days assumed per week when estimating how long the curriculum takes.
 *
 * Five, not seven: the honest estimate is the one a working adult with a
 * weekend actually hits. Promising "134 days" to someone who studies on
 * weekdays would be a number the app knows is wrong.
 */
export const STUDY_DAYS_PER_WEEK = 5

const WEEKS_PER_MONTH = 4.345

/**
 * Rough months to finish `lessonsRemaining` at `pace` lessons a study day.
 * Rounded to a whole month, floored at 1 — "0 months" is not an estimate.
 */
export function monthsToFinish(lessonsRemaining: number, pace: Pace): number {
  if (lessonsRemaining <= 0) return 0
  const weeks = lessonsRemaining / (pace * STUDY_DAYS_PER_WEEK)
  return Math.max(1, Math.round(weeks / WEEKS_PER_MONTH))
}
