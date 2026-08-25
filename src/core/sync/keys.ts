// ─── What travels ────────────────────────────────────────────────────────────
// One list, derived rather than typed out, so adding a storage key to the app
// cannot silently leave it behind on the old device.

import { PROFILE_SCOPED_KEYS } from '../storage/profiles'
import { PROFILE_META_BLOB, SYNC_LEDGER_KEY } from './engine'

/**
 * Every blob a profile carries between devices.
 *
 * = the profile-scoped storage keys
 *   − the sync ledger (this device's view of the server; see engine.ts)
 *   + `profileMeta`, the {name, emoji} pair, which lives in the profile
 *     registry rather than in the app store and so has no storage key of its own
 *
 * `quotes` is absent because it is a SHARED_KEY: market data belongs to the
 * install, not to a learner, and re-uploading a price cache would be pure waste.
 *
 * The worker keeps an identical allow-list (SYNC_BLOB_KEYS in proxy/worker.js);
 * tests/syncWorker.test.ts asserts the two agree.
 */
export const SYNC_KEYS: readonly string[] = [
  ...PROFILE_SCOPED_KEYS.filter((k) => k !== SYNC_LEDGER_KEY),
  PROFILE_META_BLOB,
]

/** The store keys the app rehydrates from — i.e. everything but `profileMeta`. */
export const SYNC_STORE_KEYS: readonly string[] = SYNC_KEYS.filter((k) => k !== PROFILE_META_BLOB)
