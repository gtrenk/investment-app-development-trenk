// ─── The app's clock ─────────────────────────────────────────────────────────
// Its own module so both the store and the profile boot path can read it
// without importing each other.

import type { Clock } from '@core/clock'
import { systemClock } from '@core/clock'

// Playwright injects `window.__TEST_CLOCK__` to simulate other days without
// touching the machine clock, `window.__TEST_AUTO_PROFILE__` to skip the profile
// picker (see src/state/profiles.ts), and `window.__TEST_SYNC_BASE__` to stand a
// fake worker in front of cloud sync (see src/state/sync.ts) — the e2e build has
// no VITE_QUOTE_PROXY, so without it there would be no sync origin to intercept.
// All three are read lazily so a spec can change them mid-session, and all three
// exist only on `window`: nothing in a production build can set them.
declare global {
  interface Window {
    __TEST_CLOCK__?: { today?: string; now?: string }
    __TEST_AUTO_PROFILE__?: boolean
    __TEST_SYNC_BASE__?: string
  }
}

export const appClock: Clock = {
  today: () =>
    (typeof window !== 'undefined' && window.__TEST_CLOCK__?.today) || systemClock.today(),
  now: () => (typeof window !== 'undefined' && window.__TEST_CLOCK__?.now) || systemClock.now(),
}
