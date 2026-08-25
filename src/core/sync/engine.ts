// ─── Cloud sync engine ───────────────────────────────────────────────────────
// Pure over an injected `fetch` and an injected StorageAdapter: no window, no
// IndexedDB, no React, no timers. Everything scheduling-shaped (the 3-second
// debounce, the flush on tab-hide) lives in src/state/sync.ts; everything
// protocol-shaped lives here, so the whole wire contract is unit-testable
// against createMemoryStorage() and a fake fetch.
//
// ── What a "sync" is ─────────────────────────────────────────────────────────
//
// One profile's user state is eight independent JSON blobs (the seven
// per-profile storage keys plus `profileMeta`). Each blob carries an
// `updatedAt` in epoch milliseconds and each device keeps a **ledger** of what
// it believes about every key:
//
//   perKey[key].localTs   when this device last changed the key
//   perKey[key].pushedTs  the `updatedAt` this device last got the server to accept
//
// A key is *dirty* when `localTs > pushedTs`. Pushing sends the local value
// stamped with `localTs`; pulling takes the remote value when the remote
// `updatedAt` is strictly newer than `localTs`.
//
// ── Conflict policy: per-key last-write-wins ─────────────────────────────────
//
// There is no merge. If the phone and the laptop both change the *same key* on
// the same profile before either syncs, the one whose change is pulled second
// keeps its value and the older device's edit for that key is gone — silently,
// with no prompt and no recovery. Different keys do not collide, so reading a
// lesson on the phone (progress, game) while grading cards on the laptop (srs,
// game) still only risks `game`.
//
// That is a real data-loss window and it is accepted deliberately: this is a
// personal learning app, the blobs are XP counters and a paper portfolio, and
// the alternative — CRDTs, or a merge UI asking a teenager which copy of their
// streak to keep — costs far more than the failure. Use one device at a time
// and the policy never fires.
//
// ── Failure policy ───────────────────────────────────────────────────────────
//
// Nothing here throws at a caller. Every entry point resolves to a typed result
// and an offline device is a no-op that reports `kind: 'offline'`, because sync
// failing must never be able to interrupt someone mid-lesson.

import type { StorageAdapter } from '../storage/adapter'

/**
 * The ledger's own key. Per profile, deliberately **not** in the synced set:
 * it describes this device's relationship to the server, and shipping it to the
 * other device would make each one lie about what the other had pushed.
 */
export const SYNC_LEDGER_KEY = 'tq.v1.syncLedger'

/** Blob name for the {name, emoji} pair, so a linked device can label itself. */
export const PROFILE_META_BLOB = 'profileMeta'

// ── Ledger ───────────────────────────────────────────────────────────────────

export interface KeyLedger {
  /** Epoch ms of this device's last local change to the key. */
  localTs: number
  /** Epoch ms the server has confirmed for this key from this device. */
  pushedTs: number
}

export interface SyncLedger {
  /** Epoch ms of the last completed `pullAll`, or null before the first one. */
  lastPulledAt: number | null
  /** Epoch ms of the last accepted push, or null before the first one. */
  lastPushedAt: number | null
  perKey: Record<string, KeyLedger>
}

export function emptyLedger(): SyncLedger {
  return { lastPulledAt: null, lastPushedAt: null, perKey: {} }
}

/** Defensive read — a half-written or future-shaped ledger degrades to empty. */
export function sanitizeLedger(raw: unknown): SyncLedger {
  if (!raw || typeof raw !== 'object') return emptyLedger()
  const r = raw as Partial<SyncLedger>
  const perKey: Record<string, KeyLedger> = {}
  for (const [key, entry] of Object.entries(r.perKey ?? {})) {
    const e = entry as Partial<KeyLedger>
    const localTs = Number(e?.localTs)
    const pushedTs = Number(e?.pushedTs)
    if (!Number.isFinite(localTs)) continue
    perKey[key] = { localTs, pushedTs: Number.isFinite(pushedTs) ? pushedTs : 0 }
  }
  const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
  return { lastPulledAt: num(r.lastPulledAt), lastPushedAt: num(r.lastPushedAt), perKey }
}

// ── Results ──────────────────────────────────────────────────────────────────

export type SyncErrorKind =
  /** The request never reached a server: no network, DNS, CORS, aborted. */
  | 'offline'
  /** 401 — the code is wrong, or this syncId belongs to someone else's token. */
  | 'auth'
  /** 413 — the blob exceeds the worker's 256 KB cap. */
  | 'too-large'
  /** 400 — the worker rejected the key or the body shape. */
  | 'rejected'
  /** Any other non-2xx, or an unreadable body. */
  | 'server'

export interface SyncFailure {
  ok: false
  kind: SyncErrorKind
  message: string
  /** HTTP status when there was one; absent for `offline`. */
  status?: number
}

export type PushOutcome = { ok: true; pushed: string[] } | SyncFailure
export type PullOutcome = { ok: true; updated: string[] } | SyncFailure
export type ManifestOutcome = { ok: true; manifest: Record<string, number> } | SyncFailure
export type FetchOutcome =
  | { ok: true; found: true; data: unknown; updatedAt: number }
  | { ok: true; found: false }
  | SyncFailure
export type DeleteOutcome = { ok: true } | SyncFailure

export function isSyncFailure(r: { ok: boolean }): r is SyncFailure {
  return r.ok === false
}

// ── Engine ───────────────────────────────────────────────────────────────────

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>

export interface SyncEngineOptions {
  fetchFn: FetchLike
  /** Sync root, e.g. `https://tickerquest-quotes.x.workers.dev/sync`. */
  baseUrl: string
  /** The 20-character sync code. Its first 8 characters are the syncId. */
  token: string
  /** The active profile's namespaced adapter — the same one the store writes to. */
  storage: StorageAdapter
  /** Blob names to keep in step. `SYNC_LEDGER_KEY` must not be among them. */
  keys: string[]
  /** Epoch milliseconds. Injected so tests can step time deterministically. */
  now: () => number
}

export interface SyncEngine {
  readonly keys: readonly string[]
  /** The persisted ledger, read through a per-engine memo. */
  ledger(): Promise<SyncLedger>
  /** Stamp a key as changed locally. Called from the store's write() hook. */
  markDirty(key: string): Promise<void>
  /** Keys whose local change has not been accepted by the server yet. */
  dirtyKeys(): Promise<string[]>
  pushKey(key: string): Promise<PushOutcome>
  pushDirty(): Promise<PushOutcome>
  pullAll(): Promise<PullOutcome>
  /** Read one blob without writing it locally — used by the link-a-device flow. */
  fetchKey(key: string): Promise<FetchOutcome>
  /** Also the cheapest way to validate a code before committing to it. */
  fetchManifest(): Promise<ManifestOutcome>
  /** Erase every blob for this syncId, including the token record. */
  deleteRemote(): Promise<DeleteOutcome>
}

function stripTrailingSlash(s: string): string {
  return s.replace(/\/+$/, '')
}

/** Map a transport or HTTP failure onto the typed vocabulary above. */
function failureFor(status: number, message: string): SyncFailure {
  const kind: SyncErrorKind =
    status === 401 || status === 403
      ? 'auth'
      : status === 413
        ? 'too-large'
        : status === 400
          ? 'rejected'
          : 'server'
  return { ok: false, kind, message, status }
}

export function createSyncEngine(options: SyncEngineOptions): SyncEngine {
  const { fetchFn, token, storage, now } = options
  const base = stripTrailingSlash(options.baseUrl)
  const keys = options.keys.filter((k) => k !== SYNC_LEDGER_KEY)

  // One in-memory copy per engine, memoised as a *promise* so N concurrent
  // callers share one read instead of racing N of them.
  let ledgerPromise: Promise<SyncLedger> | null = null

  function ledger(): Promise<SyncLedger> {
    ledgerPromise ??= storage.get<unknown>(SYNC_LEDGER_KEY).then(sanitizeLedger)
    return ledgerPromise
  }

  /**
   * Serialised read-modify-write of the ledger.
   *
   * This is not defensive plumbing — it is load-bearing. One store mutation
   * writes up to four keys in the same turn, so four `markDirty` calls are in
   * flight at once; without the queue each would build its update from the same
   * snapshot and the last save would erase the other three, leaving keys that
   * the app thinks are synced and never pushes.
   */
  let chain: Promise<unknown> = Promise.resolve()

  function updateLedger(mutate: (led: SyncLedger) => SyncLedger): Promise<SyncLedger> {
    const run = async (): Promise<SyncLedger> => {
      const next = mutate(await ledger())
      ledgerPromise = Promise.resolve(next)
      await storage.set(SYNC_LEDGER_KEY, next)
      return next
    }
    // `.then(run, run)` so one failed write cannot wedge the queue for good.
    const result = chain.then(run, run)
    chain = result.then(
      () => undefined,
      () => undefined,
    )
    return result
  }

  const headers = { 'X-Sync-Token': token }

  /**
   * One request. Transport failures (offline, DNS, CORS) come back as a typed
   * `offline` result rather than a rejected promise, which is what lets every
   * public method below stay throw-free.
   */
  async function send(
    path: string,
    init: RequestInit,
  ): Promise<{ ok: true; res: Response } | SyncFailure> {
    try {
      const res = await fetchFn(`${base}${path}`, { ...init, headers: { ...headers, ...(init.headers ?? {}) } })
      return { ok: true, res }
    } catch (err) {
      return {
        ok: false,
        kind: 'offline',
        message: err instanceof Error ? err.message : 'Network unavailable',
      }
    }
  }

  /** Best-effort error text; a body that will not read must not mask the status. */
  async function errorMessage(res: Response, fallback: string): Promise<string> {
    try {
      const body = (await res.json()) as { error?: unknown }
      return typeof body?.error === 'string' ? body.error : fallback
    } catch {
      return fallback
    }
  }

  async function pushKey(key: string): Promise<PushOutcome> {
    const led = await ledger()
    const entry = led.perKey[key]
    // A key that has never been touched locally still has a value worth
    // uploading on the first push, so fall back to "now".
    const updatedAt = entry?.localTs ?? now()
    const value = await storage.get<unknown>(key)

    // `null` is a real state, not an absence: it is how a reset or a deletion
    // reaches the other device instead of being resurrected by the next pull.
    const body = JSON.stringify({ data: value ?? null, updatedAt })

    const sent = await send(`/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body,
      headers: { 'Content-Type': 'application/json' },
    })
    if (isSyncFailure(sent)) return sent
    if (!sent.res.ok) {
      return failureFor(sent.res.status, await errorMessage(sent.res, `Push failed (${sent.res.status})`))
    }

    await updateLedger((current) => ({
      ...current,
      lastPushedAt: now(),
      perKey: { ...current.perKey, [key]: { localTs: updatedAt, pushedTs: updatedAt } },
    }))
    return { ok: true, pushed: [key] }
  }

  async function pushDirty(): Promise<PushOutcome> {
    const dirty = await dirtyKeys()
    const pushed: string[] = []
    for (const key of dirty) {
      const out = await pushKey(key)
      // Stop on the first failure: the rest would fail the same way, and a
      // half-pushed set is exactly what the ledger is designed to resume from.
      if (isSyncFailure(out)) return out
      pushed.push(...out.pushed)
    }
    return { ok: true, pushed }
  }

  async function dirtyKeys(): Promise<string[]> {
    const led = await ledger()
    return keys.filter((k) => {
      const e = led.perKey[k]
      return e !== undefined && e.localTs > e.pushedTs
    })
  }

  async function fetchManifest(): Promise<ManifestOutcome> {
    const sent = await send('/manifest', { method: 'GET' })
    if (isSyncFailure(sent)) return sent
    if (!sent.res.ok) {
      return failureFor(sent.res.status, await errorMessage(sent.res, `Manifest failed (${sent.res.status})`))
    }
    try {
      const raw = (await sent.res.json()) as Record<string, unknown>
      const manifest: Record<string, number> = {}
      for (const [key, ts] of Object.entries(raw ?? {})) {
        const n = Number(ts)
        if (Number.isFinite(n)) manifest[key] = n
      }
      return { ok: true, manifest }
    } catch {
      return { ok: false, kind: 'server', message: 'Manifest was not JSON', status: sent.res.status }
    }
  }

  async function fetchKey(key: string): Promise<FetchOutcome> {
    const sent = await send(`/${encodeURIComponent(key)}`, { method: 'GET' })
    if (isSyncFailure(sent)) return sent
    if (sent.res.status === 404) return { ok: true, found: false }
    if (!sent.res.ok) {
      return failureFor(sent.res.status, await errorMessage(sent.res, `Fetch failed (${sent.res.status})`))
    }
    try {
      const body = (await sent.res.json()) as { data?: unknown; updatedAt?: unknown }
      const updatedAt = Number(body?.updatedAt)
      if (!Number.isFinite(updatedAt)) {
        return { ok: false, kind: 'server', message: 'Record had no updatedAt', status: 200 }
      }
      return { ok: true, found: true, data: body.data, updatedAt }
    } catch {
      return { ok: false, kind: 'server', message: 'Record was not JSON', status: 200 }
    }
  }

  async function pullAll(): Promise<PullOutcome> {
    const man = await fetchManifest()
    if (isSyncFailure(man)) return man

    const led = await ledger()
    const fresh: Record<string, KeyLedger> = {}
    const updated: string[] = []

    for (const key of keys) {
      const remoteTs = man.manifest[key]
      if (remoteTs === undefined) continue
      const localTs = led.perKey[key]?.localTs ?? 0
      if (remoteTs <= localTs) continue // ours is the same or newer — keep it

      // `since` lets the worker answer 304 when nothing moved between the
      // manifest read and this one, so a busy pull costs one round trip less.
      const sent = await send(`/${encodeURIComponent(key)}?since=${localTs}`, { method: 'GET' })
      if (isSyncFailure(sent)) return sent
      if (sent.res.status === 304 || sent.res.status === 404) continue
      if (!sent.res.ok) {
        return failureFor(sent.res.status, await errorMessage(sent.res, `Pull failed (${sent.res.status})`))
      }

      let body: { data?: unknown; updatedAt?: unknown }
      try {
        body = (await sent.res.json()) as { data?: unknown; updatedAt?: unknown }
      } catch {
        return { ok: false, kind: 'server', message: `Record for ${key} was not JSON`, status: 200 }
      }
      const stamp = Number(body?.updatedAt)
      if (!Number.isFinite(stamp)) continue

      if (body.data === null || body.data === undefined) {
        await storage.del(key)
      } else {
        await storage.set(key, body.data)
      }
      // pushedTs matches localTs so a freshly pulled key is not immediately
      // considered dirty and echoed straight back to the server.
      fresh[key] = { localTs: stamp, pushedTs: stamp }
      updated.push(key)
    }

    // Merged rather than assigned: a `markDirty` that landed while the network
    // was busy must not be thrown away by the pull that overtook it.
    await updateLedger((current) => ({
      ...current,
      lastPulledAt: now(),
      perKey: { ...current.perKey, ...fresh },
    }))
    return { ok: true, updated }
  }

  async function markDirty(key: string): Promise<void> {
    if (!keys.includes(key)) return
    await updateLedger((current) => {
      const previous = current.perKey[key]
      // Never let two mutations inside the same millisecond collapse into one
      // timestamp that equals `pushedTs` — that would look clean and never push.
      const stamp = Math.max(now(), (previous?.localTs ?? 0) + 1)
      return {
        ...current,
        perKey: {
          ...current.perKey,
          [key]: { localTs: stamp, pushedTs: previous?.pushedTs ?? 0 },
        },
      }
    })
  }

  async function deleteRemote(): Promise<DeleteOutcome> {
    const sent = await send('', { method: 'DELETE' })
    if (isSyncFailure(sent)) return sent
    if (!sent.res.ok) {
      return failureFor(sent.res.status, await errorMessage(sent.res, `Delete failed (${sent.res.status})`))
    }
    // Forget everything this device believed about the server, so re-enabling
    // sync later starts from a clean slate rather than a ledger full of ghosts.
    await updateLedger(() => emptyLedger())
    return { ok: true }
  }

  return {
    keys,
    ledger,
    markDirty,
    dirtyKeys,
    pushKey,
    pushDirty,
    pullAll,
    fetchKey,
    fetchManifest,
    deleteRemote,
  }
}
