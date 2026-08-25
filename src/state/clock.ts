// ─── The app's clock ─────────────────────────────────────────────────────────
// Its own module so both the store and the profile boot path can read it
// without importing each other.

import type { Clock } from '@core/clock'
import { systemClock } from '@core/clock'

// Playwright injects `window.__TEST_CLOCK__` to simulate other days without
// touching the machine clock, and `window.__TEST_AUTO_PROFILE__` to skip the
// profile picker (see src/state/profiles.ts). Both are read lazily so a spec can
// change them mid-session.
declare global {
  interface Window {
    __TEST_CLOCK__?: { today?: string; now?: string }
    __TEST_AUTO_PROFILE__?: boolean
  }
}

export const appClock: Clock = {
  today: () =>
    (typeof window !== 'undefined' && window.__TEST_CLOCK__?.today) || systemClock.today(),
  now: () => (typeof window !== 'undefined' && window.__TEST_CLOCK__?.now) || systemClock.now(),
}
