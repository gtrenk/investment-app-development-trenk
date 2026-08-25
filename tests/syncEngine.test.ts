// ─── Sync engine ─────────────────────────────────────────────────────────────
// The engine is exercised against a *hand-written* fake server rather than
// against proxy/worker.js. That is deliberate: two independent implementations
// of the same contract catch drift in either direction, and tests/syncWorker
// pins the real worker to the same shape from the other side.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryStorage } from '@core/storage/adapter'
import type { StorageAdapter } from '@core/storage/adapter'
import {
  PROFILE_META_BLOB,
  SYNC_LEDGER_KEY,
  createSyncEngine,
  emptyLedger,
  isSyncFailure,
  sanitizeLedger,
} from '@core/sync/engine'
import type { SyncEngine } from '@core/sync/engine'
import { SYNC_KEYS } from '@core/sync/keys'
import {
  SYNC_ALPHABET,
  SYNC_TOKEN_LENGTH,
  formatSyncCode,
  generateSyncToken,
  isSyncToken,
  maskSyncCode,
  normalizeSyncCode,
  syncIdOf,
} from '@core/sync/code'

const BASE = 'https://worker.test/sync'
const TOKEN_A = 'ABCDEFGH0123456789JK'
const TOKEN_B = 'ZYXWVTSR9876543210NM'
const PROGRESS = 'tq.v1.progress'
const GAME = 'tq.v1.game'

// ── A fake worker ────────────────────────────────────────────────────────────

interface Record_ {
  data: unknown
  updatedAt: number
}

interface FakeServer {
  /** `${syncId}:${blobKey}` → record. */
  blobs: Map<string, Record_>
  /** syncId → the token that claimed it. */
  tokens: Map<string, string>
  /** Every request, for asserting round-trip counts. */
  log: Array<{ method: string; path: string; status: number }>
  /** Flip to make every call reject the way an offline browser does. */
  offline: boolean
  fetchFn: (url: string, init?: RequestInit) => Promise<Response>
}

const MAX_BYTES = 256 * 1024
const ALLOWED = new Set([...SYNC_KEYS])

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function createFakeServer(): FakeServer {
  const server: FakeServer = {
    blobs: new Map(),
    tokens: new Map(),
    log: [],
    offline: false,
    fetchFn: async () => new Response(null, { status: 500 }),
  }

  server.fetchFn = async (url, init) => {
    if (server.offline) throw new TypeError('Failed to fetch')

    const method = init?.method ?? 'GET'
    const parsed = new URL(url)
    const rest = parsed.pathname.slice('/sync'.length).replace(/^\//, '')
    const headers = new Headers(init?.headers as HeadersInit)
    const token = headers.get('X-Sync-Token') ?? ''
    const syncId = token.slice(0, 8)

    const finish = (res: Response): Response => {
      server.log.push({ method, path: rest, status: res.status })
      return res
    }

    if (!isSyncToken(token)) return finish(jsonResponse({ error: 'Invalid sync code.' }, 401))

    const claimed = server.tokens.get(syncId)
    if (claimed === undefined) {
      if (method !== 'PUT') return finish(jsonResponse({ error: 'Unknown sync code.' }, 401))
    } else if (claimed !== token) {
      return finish(jsonResponse({ error: 'Sync code does not match this profile.' }, 401))
    }

    if (rest === '') {
      if (method !== 'DELETE') return finish(jsonResponse({ error: 'Method not allowed.' }, 405))
      for (const key of [...server.blobs.keys()]) {
        if (key.startsWith(`${syncId}:`)) server.blobs.delete(key)
      }
      server.tokens.delete(syncId)
      return finish(jsonResponse({ ok: true }, 200))
    }

    if (rest === 'manifest') {
      const out: Record<string, number> = {}
      for (const [key, rec] of server.blobs) {
        if (key.startsWith(`${syncId}:`)) out[key.slice(syncId.length + 1)] = rec.updatedAt
      }
      return finish(jsonResponse(out, 200))
    }

    if (!ALLOWED.has(rest)) return finish(jsonResponse({ error: 'Unknown sync key.' }, 400))

    if (method === 'PUT') {
      const raw = String(init?.body ?? '')
      if (new TextEncoder().encode(raw).length > MAX_BYTES) {
        return finish(jsonResponse({ error: 'Too large.' }, 413))
      }
      const body = JSON.parse(raw) as Record_
      server.tokens.set(syncId, token)
      server.blobs.set(`${syncId}:${rest}`, { data: body.data, updatedAt: body.updatedAt })
      return finish(jsonResponse({ ok: true }, 200))
    }

    if (method === 'GET') {
      const rec = server.blobs.get(`${syncId}:${rest}`)
      if (!rec) return finish(jsonResponse({ error: 'Not found.' }, 404))
      const since = Number(parsed.searchParams.get('since'))
      if (Number.isFinite(since) && since > 0 && rec.updatedAt <= since) {
        return finish(new Response(null, { status: 304 }))
      }
      return finish(jsonResponse(rec, 200))
    }

    return finish(jsonResponse({ error: 'Method not allowed.' }, 405))
  }

  return server
}

// ── A device ─────────────────────────────────────────────────────────────────

interface Device {
  storage: StorageAdapter
  engine: SyncEngine
  /** Advance the injected clock. */
  tick: (ms?: number) => void
}

function createDevice(server: FakeServer, token: string, startAt = 1_000): Device {
  const storage = createMemoryStorage()
  let clock = startAt
  return {
    storage,
    tick: (ms = 1_000) => {
      clock += ms
    },
    engine: createSyncEngine({
      // Indirected so a test can swap the server's handler mid-flight.
      fetchFn: (url, init) => server.fetchFn(url, init),
      baseUrl: BASE,
      token,
      storage,
      keys: [...SYNC_KEYS],
      now: () => clock,
    }),
  }
}

/** The usual opening move: write a value locally and mark it changed. */
async function edit(device: Device, key: string, value: unknown): Promise<void> {
  await device.storage.set(key, value)
  await device.engine.markDirty(key)
}

// ── Tests ────────────────────────────────────────────────────────────────────

let server: FakeServer

beforeEach(() => {
  server = createFakeServer()
})

describe('sync codes', () => {
  it('mints tokens from the unambiguous alphabet only', () => {
    let n = 0
    const token = generateSyncToken((into) => {
      for (let i = 0; i < into.length; i++) into[i] = (n += 7) % 256
    })
    expect(token).toHaveLength(SYNC_TOKEN_LENGTH)
    expect(isSyncToken(token)).toBe(true)
    for (const ch of token) expect(SYNC_ALPHABET).toContain(ch)
    expect(token).not.toMatch(/[ILOU]/)
  })

  it('is a full 20 characters of randomness with an 8-character id', () => {
    const token = generateSyncToken((into) => into.fill(0))
    expect(syncIdOf(token)).toHaveLength(8)
    expect(token.startsWith(syncIdOf(token))).toBe(true)
  })

  it('folds what a human types back into the alphabet', () => {
    // Lowercase from a phone keyboard, dashes from the display format, and the
    // three glyphs Crockford maps by hand.
    expect(normalizeSyncCode('abcd-efgh-0123-4567-89jk')).toBe('ABCDEFGH0123456789JK')
    expect(normalizeSyncCode('IlO')).toBe('110')
    expect(normalizeSyncCode('  a b c  ')).toBe('ABC')
    expect(normalizeSyncCode('!!!')).toBe('')
  })

  it('never returns more than a token from a pasted wall of text', () => {
    expect(normalizeSyncCode('X'.repeat(90))).toHaveLength(SYNC_TOKEN_LENGTH)
  })

  it('rejects near-misses', () => {
    expect(isSyncToken(TOKEN_A.slice(0, 19))).toBe(false)
    expect(isSyncToken(`${TOKEN_A}X`)).toBe(false)
    expect(isSyncToken('IIIIIIIIIIIIIIIIIIII')).toBe(false)
    expect(isSyncToken(null)).toBe(false)
  })

  it('formats for reading and masks for showing in public', () => {
    expect(formatSyncCode(TOKEN_A)).toBe('ABCD-EFGH-0123-4567-89JK')
    const masked = maskSyncCode(TOKEN_A)
    expect(masked.startsWith('ABCD-')).toBe(true)
    expect(masked).not.toContain('89JK')
  })
})

describe('ledger', () => {
  it('starts empty and survives a round trip', async () => {
    const a = createDevice(server, TOKEN_A)
    expect(await a.engine.ledger()).toEqual(emptyLedger())

    await edit(a, GAME, { xp: 10 })
    const stored = await a.storage.get(SYNC_LEDGER_KEY)
    expect(sanitizeLedger(stored).perKey[GAME].localTs).toBeGreaterThan(0)
  })

  it('degrades a corrupt record to empty rather than throwing', () => {
    expect(sanitizeLedger(null)).toEqual(emptyLedger())
    expect(sanitizeLedger('nonsense')).toEqual(emptyLedger())
    expect(sanitizeLedger({ perKey: { a: { localTs: 'x' } } }).perKey).toEqual({})
    expect(sanitizeLedger({ lastPulledAt: 'soon', perKey: {} }).lastPulledAt).toBeNull()
  })

  it('never syncs itself', () => {
    const a = createDevice(server, TOKEN_A)
    expect(a.engine.keys).not.toContain(SYNC_LEDGER_KEY)
    expect(SYNC_KEYS).not.toContain(SYNC_LEDGER_KEY)
    expect(SYNC_KEYS).toContain(PROFILE_META_BLOB)
  })

  it('gives two edits in the same millisecond distinct timestamps', async () => {
    const a = createDevice(server, TOKEN_A)
    await a.engine.markDirty(GAME)
    const first = (await a.engine.ledger()).perKey[GAME].localTs
    await a.engine.markDirty(GAME) // clock has not moved
    expect((await a.engine.ledger()).perKey[GAME].localTs).toBeGreaterThan(first)
  })
})

describe('dirty bookkeeping', () => {
  it('marks, pushes, and comes back clean', async () => {
    const a = createDevice(server, TOKEN_A)
    expect(await a.engine.dirtyKeys()).toEqual([])

    await edit(a, GAME, { xp: 42 })
    await edit(a, PROGRESS, { completedLessons: { l1: '2026-06-01' } })
    expect((await a.engine.dirtyKeys()).sort()).toEqual([PROGRESS, GAME].sort())

    const out = await a.engine.pushDirty()
    expect(out.ok).toBe(true)
    expect(await a.engine.dirtyKeys()).toEqual([])
    expect(server.blobs.get(`${syncIdOf(TOKEN_A)}:${GAME}`)?.data).toEqual({ xp: 42 })
  })

  it('a key edited again after a push is dirty again', async () => {
    const a = createDevice(server, TOKEN_A)
    await edit(a, GAME, { xp: 1 })
    await a.engine.pushDirty()
    expect(await a.engine.dirtyKeys()).toEqual([])

    a.tick()
    await edit(a, GAME, { xp: 2 })
    expect(await a.engine.dirtyKeys()).toEqual([GAME])
  })

  it('keeps every key of a concurrent burst — one store mutation writes four', async () => {
    // `persist()` in useAppStore fires write() four times in the same turn, so
    // four markDirty calls are genuinely in flight at once. Before the ledger
    // was serialised, three of them were silently lost.
    const a = createDevice(server, TOKEN_A)
    const burst = [PROGRESS, GAME, 'tq.v1.srs', 'tq.v1.drills']
    for (const key of burst) await a.storage.set(key, { key })
    await Promise.all(burst.map((key) => a.engine.markDirty(key)))

    expect((await a.engine.dirtyKeys()).sort()).toEqual([...burst].sort())
    const out = await a.engine.pushDirty()
    expect(out.ok && out.pushed.sort()).toEqual([...burst].sort())
  })

  it('pushing nothing is a no-op that still succeeds', async () => {
    const a = createDevice(server, TOKEN_A)
    const out = await a.engine.pushDirty()
    expect(out).toEqual({ ok: true, pushed: [] })
    expect(server.log).toHaveLength(0)
  })

  it('a key never touched locally still uploads on an explicit push', async () => {
    const a = createDevice(server, TOKEN_A)
    await a.storage.set(GAME, { xp: 7 }) // no markDirty — e.g. the enable-sync path
    const out = await a.engine.pushKey(GAME)
    expect(out.ok).toBe(true)
    expect(server.blobs.get(`${syncIdOf(TOKEN_A)}:${GAME}`)?.data).toEqual({ xp: 7 })
  })
})

describe('round trip between two devices', () => {
  it('carries every key across', async () => {
    const phone = createDevice(server, TOKEN_A, 1_000)
    const tablet = createDevice(server, TOKEN_A, 1_000)

    await edit(phone, GAME, { xp: 120 })
    await edit(phone, PROGRESS, { completedLessons: { 'u1-l1': '2026-06-01' } })
    await edit(phone, PROFILE_META_BLOB, { name: 'Greg', emoji: '📈' })
    await phone.engine.pushDirty()

    const pulled = await tablet.engine.pullAll()
    expect(pulled.ok).toBe(true)
    if (!pulled.ok) return
    expect(pulled.updated.sort()).toEqual([PROGRESS, GAME, PROFILE_META_BLOB].sort())
    expect(await tablet.storage.get(GAME)).toEqual({ xp: 120 })
    expect(await tablet.storage.get(PROFILE_META_BLOB)).toEqual({ name: 'Greg', emoji: '📈' })
  })

  it('a freshly pulled key is not immediately pushed back', async () => {
    const phone = createDevice(server, TOKEN_A)
    const tablet = createDevice(server, TOKEN_A)
    await edit(phone, GAME, { xp: 5 })
    await phone.engine.pushDirty()

    await tablet.engine.pullAll()
    expect(await tablet.engine.dirtyKeys()).toEqual([])
  })

  it('pulls nothing when the cloud has nothing', async () => {
    const a = createDevice(server, TOKEN_A)
    // The syncId has to exist for a GET to be authorised at all.
    await edit(a, GAME, { xp: 1 })
    await a.engine.pushDirty()

    const b = createDevice(server, TOKEN_A)
    server.blobs.clear()
    const out = await b.engine.pullAll()
    expect(out).toEqual({ ok: true, updated: [] })
  })

  it('a null blob deletes the key locally, so a reset propagates', async () => {
    const phone = createDevice(server, TOKEN_A)
    const tablet = createDevice(server, TOKEN_A)

    await edit(phone, GAME, { xp: 30 })
    await phone.engine.pushDirty()
    await tablet.engine.pullAll()
    expect(await tablet.storage.get(GAME)).toEqual({ xp: 30 })

    // The store's resetAll deletes the key and marks it dirty.
    phone.tick()
    await phone.storage.del(GAME)
    await phone.engine.markDirty(GAME)
    await phone.engine.pushDirty()

    await tablet.engine.pullAll()
    expect(await tablet.storage.get(GAME)).toBeUndefined()
  })
})

describe('last-write-wins, per key', () => {
  it('the newer device wins, in either direction', async () => {
    const phone = createDevice(server, TOKEN_A, 1_000)
    const tablet = createDevice(server, TOKEN_A, 1_000)

    // Phone first.
    await edit(phone, GAME, { xp: 10 })
    await phone.engine.pushDirty()
    await tablet.engine.pullAll()
    expect(await tablet.storage.get(GAME)).toEqual({ xp: 10 })

    // Now the tablet edits later and pushes; the phone must take it.
    tablet.tick(5_000)
    await edit(tablet, GAME, { xp: 99 })
    await tablet.engine.pushDirty()
    const back = await phone.engine.pullAll()
    expect(back.ok && back.updated).toEqual([GAME])
    expect(await phone.storage.get(GAME)).toEqual({ xp: 99 })
  })

  it('a stale remote never overwrites a newer local value', async () => {
    const phone = createDevice(server, TOKEN_A, 1_000)
    const tablet = createDevice(server, TOKEN_A, 1_000)

    await edit(tablet, GAME, { xp: 3 })
    await tablet.engine.pushDirty()

    // The phone edited the same key later and has not pushed yet.
    phone.tick(10_000)
    await edit(phone, GAME, { xp: 500 })
    const out = await phone.engine.pullAll()
    expect(out).toEqual({ ok: true, updated: [] })
    expect(await phone.storage.get(GAME)).toEqual({ xp: 500 })
  })

  it('loses the older edit when both devices changed the SAME key — the documented caveat', async () => {
    const phone = createDevice(server, TOKEN_A, 1_000)
    const tablet = createDevice(server, TOKEN_A, 1_000)

    await edit(phone, GAME, { xp: 10 }) // t = 1000
    tablet.tick(9_000)
    await edit(tablet, GAME, { xp: 20 }) // t = 10000

    await phone.engine.pushDirty()
    await tablet.engine.pushDirty() // newer stamp — overwrites
    await phone.engine.pullAll()

    expect(await phone.storage.get(GAME)).toEqual({ xp: 20 })
    // The phone's { xp: 10 } is gone. That is the policy, not a bug.
  })

  it('different keys never collide', async () => {
    const phone = createDevice(server, TOKEN_A, 1_000)
    const tablet = createDevice(server, TOKEN_A, 1_000)

    await edit(phone, GAME, { xp: 10 })
    tablet.tick(5_000)
    await edit(tablet, PROGRESS, { completedLessons: { a: '1' } })

    await phone.engine.pushDirty()
    await tablet.engine.pushDirty()
    await phone.engine.pullAll()
    await tablet.engine.pullAll()

    expect(await phone.storage.get(PROGRESS)).toEqual({ completedLessons: { a: '1' } })
    expect(await tablet.storage.get(GAME)).toEqual({ xp: 10 })
  })
})

describe('304 handling', () => {
  it('sends `since` and treats a 304 as "nothing changed"', async () => {
    const phone = createDevice(server, TOKEN_A)
    const tablet = createDevice(server, TOKEN_A)
    await edit(phone, GAME, { xp: 1 })
    await phone.engine.pushDirty()
    await tablet.engine.pullAll()

    // Force the manifest to advertise a newer stamp than the blob really has,
    // which is exactly the race a `since` guard exists for.
    const stored = server.blobs.get(`${syncIdOf(TOKEN_A)}:${GAME}`)!
    const ledger = await tablet.engine.ledger()
    server.blobs.set(`${syncIdOf(TOKEN_A)}:${GAME}`, {
      ...stored,
      updatedAt: ledger.perKey[GAME].localTs,
    })

    server.log.length = 0
    const out = await tablet.engine.pullAll()
    expect(out).toEqual({ ok: true, updated: [] })
    // Manifest said "same stamp", so the blob was not even requested.
    expect(server.log.map((r) => r.path)).toEqual(['manifest'])
  })

  it('a 304 on the blob itself is skipped, not treated as an error', async () => {
    const phone = createDevice(server, TOKEN_A)
    const tablet = createDevice(server, TOKEN_A)
    await edit(phone, GAME, { xp: 1 })
    await phone.engine.pushDirty()

    // Manifest claims something newer than the record actually carries.
    const key = `${syncIdOf(TOKEN_A)}:${GAME}`
    const real = server.blobs.get(key)!
    const originalFetch = server.fetchFn
    server.fetchFn = async (url, init) => {
      if (url.endsWith('/manifest')) {
        return jsonResponse({ [GAME]: real.updatedAt + 10_000 }, 200)
      }
      return originalFetch(url, init)
    }
    // The engine asks with since = 0 (nothing local), so the fake answers 200
    // — bump the local ledger past the record to provoke the 304 branch.
    await tablet.storage.set(SYNC_LEDGER_KEY, {
      lastPulledAt: null,
      lastPushedAt: null,
      perKey: { [GAME]: { localTs: real.updatedAt, pushedTs: real.updatedAt } },
    })

    const out = await tablet.engine.pullAll()
    expect(out).toEqual({ ok: true, updated: [] })
    expect(server.log.some((r) => r.status === 304)).toBe(true)
  })
})

describe('failure modes', () => {
  it('offline is a typed no-op, not a throw and not a data loss', async () => {
    const a = createDevice(server, TOKEN_A)
    await edit(a, GAME, { xp: 8 })
    server.offline = true

    const push = await a.engine.pushDirty()
    expect(push).toMatchObject({ ok: false, kind: 'offline' })
    const pull = await a.engine.pullAll()
    expect(pull).toMatchObject({ ok: false, kind: 'offline' })

    // The local write is untouched and still queued for when the net comes back.
    expect(await a.storage.get(GAME)).toEqual({ xp: 8 })
    expect(await a.engine.dirtyKeys()).toEqual([GAME])

    server.offline = false
    expect((await a.engine.pushDirty()).ok).toBe(true)
    expect(await a.engine.dirtyKeys()).toEqual([])
  })

  it('a second token on the same syncId is an auth error', async () => {
    const owner = createDevice(server, TOKEN_A)
    await edit(owner, GAME, { xp: 1 })
    await owner.engine.pushDirty()

    // Same first 8 characters, different secret half.
    const impostorToken = `${TOKEN_A.slice(0, 8)}ZZZZZZZZZZZZ`
    const impostor = createDevice(server, impostorToken)
    const pull = await impostor.engine.pullAll()
    expect(pull).toMatchObject({ ok: false, kind: 'auth', status: 401 })

    await edit(impostor, GAME, { xp: 666 })
    expect(await impostor.engine.pushDirty()).toMatchObject({ ok: false, kind: 'auth' })
    expect(server.blobs.get(`${syncIdOf(TOKEN_A)}:${GAME}`)?.data).toEqual({ xp: 1 })
  })

  it('an unknown code cannot read anything', async () => {
    const stranger = createDevice(server, TOKEN_B)
    expect(await stranger.engine.fetchManifest()).toMatchObject({ ok: false, kind: 'auth' })
  })

  it('an oversized blob comes back as too-large, not as a crash', async () => {
    const a = createDevice(server, TOKEN_A)
    await edit(a, GAME, { junk: 'x'.repeat(300 * 1024) })
    expect(await a.engine.pushDirty()).toMatchObject({ ok: false, kind: 'too-large', status: 413 })
    // Still dirty: nothing was accepted, so nothing is marked as pushed.
    expect(await a.engine.dirtyKeys()).toEqual([GAME])
  })

  it('a rejected key is reported as rejected', async () => {
    const a = createDevice(server, TOKEN_A)
    // Reach past the public keys list the way a stale build might.
    const rogue = createSyncEngine({
      fetchFn: server.fetchFn,
      baseUrl: BASE,
      token: TOKEN_A,
      storage: a.storage,
      keys: ['tq.v1.quotes'],
      now: () => 2_000,
    })
    await a.storage.set('tq.v1.quotes', { AAPL: 1 })
    expect(await rogue.pushKey('tq.v1.quotes')).toMatchObject({ ok: false, kind: 'rejected' })
  })

  it('stops at the first failure rather than hammering a dead server', async () => {
    const a = createDevice(server, TOKEN_A)
    await edit(a, GAME, { xp: 1 })
    await edit(a, PROGRESS, { completedLessons: {} })
    const spy = vi.fn(async () => jsonResponse({ error: 'boom' }, 500))
    const broken = createSyncEngine({
      fetchFn: spy,
      baseUrl: BASE,
      token: TOKEN_A,
      storage: a.storage,
      keys: [...SYNC_KEYS],
      now: () => 3_000,
    })
    expect(await broken.pushDirty()).toMatchObject({ ok: false, kind: 'server', status: 500 })
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('isSyncFailure narrows every result type', async () => {
    const a = createDevice(server, TOKEN_A)
    const ok = await a.engine.pushDirty()
    expect(isSyncFailure(ok)).toBe(false)
    server.offline = true
    expect(isSyncFailure(await a.engine.fetchManifest())).toBe(true)
  })
})

describe('reading without writing', () => {
  it('fetchKey answers found / not-found without touching local storage', async () => {
    const phone = createDevice(server, TOKEN_A)
    await edit(phone, PROFILE_META_BLOB, { name: 'Ana', emoji: '🚀' })
    await phone.engine.pushDirty()

    const linking = createDevice(server, TOKEN_A)
    const meta = await linking.engine.fetchKey(PROFILE_META_BLOB)
    expect(meta).toMatchObject({ ok: true, found: true, data: { name: 'Ana', emoji: '🚀' } })
    // Nothing was written — the link flow reads the name *before* taking a slot.
    expect(await linking.storage.get(PROFILE_META_BLOB)).toBeUndefined()

    expect(await linking.engine.fetchKey(GAME)).toEqual({ ok: true, found: false })
  })
})

describe('deleting the cloud copy', () => {
  it('wipes the server and resets this device’s ledger', async () => {
    const a = createDevice(server, TOKEN_A)
    await edit(a, GAME, { xp: 4 })
    await edit(a, PROGRESS, { completedLessons: {} })
    await a.engine.pushDirty()
    expect(server.blobs.size).toBe(2)

    expect(await a.engine.deleteRemote()).toEqual({ ok: true })
    expect(server.blobs.size).toBe(0)
    expect(await a.engine.ledger()).toEqual(emptyLedger())
    // Local data is untouched — unlinking is not a wipe.
    expect(await a.storage.get(GAME)).toEqual({ xp: 4 })
  })

  it('frees the code so a fresh device can claim it again', async () => {
    const a = createDevice(server, TOKEN_A)
    await edit(a, GAME, { xp: 4 })
    await a.engine.pushDirty()
    await a.engine.deleteRemote()

    const b = createDevice(server, TOKEN_A)
    expect(await b.engine.fetchManifest()).toMatchObject({ ok: false, kind: 'auth' })
  })
})
