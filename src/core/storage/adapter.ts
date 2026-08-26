// ─── Persistence boundary ────────────────────────────────────────────────────
// core/ never touches IndexedDB directly. It talks to this interface, which
// src/platform implements (idb-keyval on web, AsyncStorage/MMKV on RN later).

export interface StorageAdapter {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T): Promise<void>
  del(key: string): Promise<void>
}

/** Bump when a persisted shape changes incompatibly; migrations key off this. */
export const SCHEMA_VERSION = 1

/** Versioned storage keys — the whole persisted surface of the app. */
export const STORAGE_KEYS = {
  progress: 'tq.v1.progress',
  srs: 'tq.v1.srs',
  game: 'tq.v1.game',
  portfolio: 'tq.v1.portfolio',
  drills: 'tq.v1.drills',
  /** Last-known quote per symbol, so a reload (or a plane) still has prices. */
  quotes: 'tq.v1.quotes',
  /** The limit-order book: resting orders plus the ones already resolved. */
  orders: 'tq.v1.orders',
  /** Watchlist — a plain array of symbols, in the order they were starred. */
  watchlist: 'tq.v1.watchlist',
  /**
   * Per-profile preferences — currently just read-aloud. One extensible object
   * rather than a key per toggle, so the next setting costs no storage surface
   * and nothing to sync. See src/core/settings.ts for the shape.
   */
  settings: 'tq.v1.settings',
  /** Case-study progress: which analyses are finished, and the thesis written for each. */
  cases: 'tq.v1.cases',
  /**
   * Placement test: when it was last taken, which units it credited, and
   * whether the Home offer card was dismissed.
   *
   * Its own key rather than a corner of `settings` or `progress`, for two
   * reasons. It is not a preference — it is the audit trail that makes
   * `applyPlacement` idempotent, and burying an idempotence ledger inside the
   * blob a settings toggle rewrites invites one to clobber the other. And it
   * syncs on its own timeline: a device that only ever changed the read-aloud
   * rate should not push a placement record with it. See @core/placement/record.
   */
  placement: 'tq.v1.placement',
  /**
   * Cloud-sync bookkeeping for this profile *on this device*: what each key's
   * last local change was and what the server has accepted. Profile-scoped so
   * deleting a profile takes it along, but never itself synced — see
   * SYNC_LEDGER_KEY in src/core/sync/engine.ts.
   */
  syncLedger: 'tq.v1.syncLedger',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

/** In-memory adapter — used by tests and as a fallback when IDB is unavailable. */
export function createMemoryStorage(): StorageAdapter {
  const map = new Map<string, unknown>()
  return {
    async get<T>(key: string): Promise<T | undefined> {
      return map.get(key) as T | undefined
    },
    async set<T>(key: string, value: T): Promise<void> {
      map.set(key, value)
    },
    async del(key: string): Promise<void> {
      map.delete(key)
    },
  }
}
