// ─── The Cloudflare Worker ───────────────────────────────────────────────────
// Drives proxy/worker.js directly: real `Request` objects, a Map-backed fake KV,
// and a stubbed global fetch for the quote-proxy half. The worker stays plain
// dependency-free JS (wrangler needs no build step), so the types come from the
// hand-written proxy/worker.d.ts beside it.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MAX_BLOB_BYTES,
  SYNC_BLOB_KEYS,
  SYNC_ID_LENGTH,
  TOKEN_LENGTH,
  handleRequest,
} from '../proxy/worker.js'
import type { SyncKvNamespace, WorkerEnv } from '../proxy/worker.js'
import { SYNC_KEYS } from '@core/sync/keys'

const ORIGIN = 'https://tickerquest.workers.dev'
const TOKEN = 'ABCDEFGH0123456789JK'
const SYNC_ID = TOKEN.slice(0, SYNC_ID_LENGTH)
const OTHER_TOKEN = 'ZYXWVTSR9876543210NM'
const GAME = 'tq.v1.game'

// ── Fake KV ──────────────────────────────────────────────────────────────────

interface FakeKv extends SyncKvNamespace {
  map: Map<string, { value: string; metadata?: { updatedAt?: number } }>
}

function createKv(): FakeKv {
  const map = new Map<string, { value: string; metadata?: { updatedAt?: number } }>()
  return {
    map,
    async get(key) {
      return map.has(key) ? map.get(key)!.value : null
    },
    async put(key, value, options) {
      map.set(key, { value, metadata: options?.metadata })
    },
    async delete(key) {
      map.delete(key)
    },
    async list(options) {
      const prefix = options?.prefix ?? ''
      const keys = [...map.entries()]
        .filter(([name]) => name.startsWith(prefix))
        .map(([name, entry]) => ({ name, metadata: entry.metadata }))
      return { keys, list_complete: true }
    },
  }
}

let kv: FakeKv
let env: WorkerEnv

beforeEach(() => {
  kv = createKv()
  env = { SYNC: kv }
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function put(key: string, body: unknown, token = TOKEN): Promise<Response> {
  return handleRequest(
    new Request(`${ORIGIN}/sync/${key}`, {
      method: 'PUT',
      headers: { 'X-Sync-Token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    env,
  )
}

function get(path: string, token = TOKEN): Promise<Response> {
  return handleRequest(
    new Request(`${ORIGIN}/sync/${path}`, { method: 'GET', headers: { 'X-Sync-Token': token } }),
    env,
  )
}

// ── Contract ─────────────────────────────────────────────────────────────────

describe('the allow-list', () => {
  it('matches the app’s travelling key set exactly', () => {
    expect([...SYNC_BLOB_KEYS].sort()).toEqual([...SYNC_KEYS].sort())
  })

  it('never accepts the shared quote cache or the local ledger', () => {
    expect(SYNC_BLOB_KEYS).not.toContain('tq.v1.quotes')
    expect(SYNC_BLOB_KEYS).not.toContain('tq.v1.syncLedger')
  })

  it('agrees with the client on the code format', () => {
    expect(TOKEN_LENGTH).toBe(20)
    expect(SYNC_ID_LENGTH).toBe(8)
  })
})

describe('auth', () => {
  it('the first PUT claims the syncId, and later requests must match it', async () => {
    const first = await put(GAME, { data: { xp: 1 }, updatedAt: 1_000 })
    expect(first.status).toBe(200)
    expect(kv.map.get(`${SYNC_ID}:__token`)?.value).toBe(TOKEN)

    // Same 8-character id, different secret half.
    const impostor = `${SYNC_ID}ZZZZZZZZZZZZ`
    expect((await put(GAME, { data: { xp: 2 }, updatedAt: 2_000 }, impostor)).status).toBe(401)
    expect((await get(GAME, impostor)).status).toBe(401)
    expect((await get('manifest', impostor)).status).toBe(401)

    // And the original data is untouched.
    expect(await (await get(GAME)).json()).toEqual({ data: { xp: 1 }, updatedAt: 1_000 })
  })

  it('refuses to read an id nothing has ever claimed', async () => {
    const res = await get('manifest', OTHER_TOKEN)
    expect(res.status).toBe(401)
    expect(await res.json()).toMatchObject({ error: expect.stringMatching(/unknown/i) })
  })

  it('refuses a malformed code before touching KV', async () => {
    for (const bad of ['', 'short', 'IIIIIIIIIIIIIIIIIIII', `${TOKEN}X`]) {
      expect((await get('manifest', bad)).status).toBe(401)
    }
    expect(kv.map.size).toBe(0)
  })

  it('does not claim an id on a malformed first PUT', async () => {
    const res = await handleRequest(
      new Request(`${ORIGIN}/sync/${GAME}`, {
        method: 'PUT',
        headers: { 'X-Sync-Token': TOKEN },
        body: 'not json',
      }),
      env,
    )
    expect(res.status).toBe(400)
    expect(kv.map.has(`${SYNC_ID}:__token`)).toBe(false)
    // …so the owner's freshly generated code is still theirs to use.
    expect((await put(GAME, { data: { xp: 1 }, updatedAt: 1 })).status).toBe(200)
  })

  it('rejects a body that is JSON but not the record shape', async () => {
    expect((await put(GAME, { updatedAt: 1 })).status).toBe(400)
    expect((await put(GAME, { data: 1, updatedAt: 'yesterday' })).status).toBe(400)
    expect((await put(GAME, { data: 1, updatedAt: -5 })).status).toBe(400)
  })
})

describe('blobs', () => {
  it('round-trips a record and reports it in the manifest', async () => {
    await put(GAME, { data: { xp: 42 }, updatedAt: 5_000 })
    await put('profileMeta', { data: { name: 'Greg', emoji: '📈' }, updatedAt: 6_000 })

    expect(await (await get(GAME)).json()).toEqual({ data: { xp: 42 }, updatedAt: 5_000 })

    const manifest = await (await get('manifest')).json()
    expect(manifest).toEqual({ [GAME]: 5_000, profileMeta: 6_000 })
    // The token record is never advertised.
    expect(Object.keys(manifest as object)).not.toContain('__token')
  })

  it('404s a key that was never written', async () => {
    await put(GAME, { data: 1, updatedAt: 1 })
    expect((await get('tq.v1.srs')).status).toBe(404)
  })

  it('answers 304 when the caller already has that version', async () => {
    await put(GAME, { data: { xp: 1 }, updatedAt: 5_000 })
    expect((await get(`${GAME}?since=5000`)).status).toBe(304)
    expect((await get(`${GAME}?since=9000`)).status).toBe(304)
    expect((await get(`${GAME}?since=4999`)).status).toBe(200)
    expect((await get(`${GAME}?since=0`)).status).toBe(200)
  })

  it('stores null as a real value — that is how a reset travels', async () => {
    await put(GAME, { data: null, updatedAt: 7_000 })
    expect(await (await get(GAME)).json()).toEqual({ data: null, updatedAt: 7_000 })
  })

  it('a later PUT replaces the record and its manifest stamp', async () => {
    await put(GAME, { data: { xp: 1 }, updatedAt: 1_000 })
    await put(GAME, { data: { xp: 2 }, updatedAt: 2_000 })
    expect(await (await get('manifest')).json()).toEqual({ [GAME]: 2_000 })
    expect(kv.map.size).toBe(2) // one blob + the token record
  })

  it('rejects an unknown key with 400, not 404', async () => {
    const res = await put('tq.v1.quotes', { data: {}, updatedAt: 1 })
    expect(res.status).toBe(400)
    expect((await get('tq.v1.secrets')).status).toBe(401) // unclaimed id checked first
    await put(GAME, { data: 1, updatedAt: 1 })
    // An encoded traversal survives URL normalisation and still hits the
    // allow-list; a plain one is collapsed by `new URL` before it ever gets
    // here and lands in the quote proxy's own 403.
    expect((await get('..%2Fetc%2Fpasswd')).status).toBe(400)
    expect((await get('../etc/passwd')).status).toBe(403)
  })

  it('caps a blob at 256 KB', async () => {
    const oversized = { data: 'x'.repeat(MAX_BLOB_BYTES + 10), updatedAt: 1_000 }
    const res = await put(GAME, oversized)
    expect(res.status).toBe(413)
    expect(await res.json()).toMatchObject({ maxBytes: MAX_BLOB_BYTES })
    expect(kv.map.has(`${SYNC_ID}:${GAME}`)).toBe(false)

    // Just under the cap still lands.
    const ok = await put(GAME, { data: 'x'.repeat(1_000), updatedAt: 1_000 })
    expect(ok.status).toBe(200)
  })

  it('refuses a declared Content-Length over the cap without reading the body', async () => {
    const res = await handleRequest(
      new Request(`${ORIGIN}/sync/${GAME}`, {
        method: 'PUT',
        headers: { 'X-Sync-Token': TOKEN, 'Content-Length': String(MAX_BLOB_BYTES + 1) },
        body: JSON.stringify({ data: 1, updatedAt: 1 }),
      }),
      env,
    )
    expect(res.status).toBe(413)
  })
})

describe('isolation between profiles', () => {
  it('one code can never see another’s blobs', async () => {
    await put(GAME, { data: { xp: 1 }, updatedAt: 1_000 })
    await put(GAME, { data: { xp: 2 }, updatedAt: 2_000 }, OTHER_TOKEN)

    expect(await (await get('manifest')).json()).toEqual({ [GAME]: 1_000 })
    expect(await (await get('manifest', OTHER_TOKEN)).json()).toEqual({ [GAME]: 2_000 })
    expect(await (await get(GAME)).json()).toMatchObject({ data: { xp: 1 } })
  })
})

describe('delete', () => {
  it('wipes every key for the syncId and frees the code', async () => {
    await put(GAME, { data: 1, updatedAt: 1 })
    await put('tq.v1.srs', { data: 2, updatedAt: 2 })
    await put(GAME, { data: 9, updatedAt: 9 }, OTHER_TOKEN)

    const res = await handleRequest(
      new Request(`${ORIGIN}/sync`, { method: 'DELETE', headers: { 'X-Sync-Token': TOKEN } }),
      env,
    )
    expect(res.status).toBe(200)
    expect([...kv.map.keys()].some((k) => k.startsWith(`${SYNC_ID}:`))).toBe(false)

    // The other profile is untouched…
    expect(await (await get('manifest', OTHER_TOKEN)).json()).toEqual({ [GAME]: 9 })
    // …and the deleted code no longer authorises a read.
    expect((await get('manifest')).status).toBe(401)
  })

  it('will not delete on the wrong method', async () => {
    await put(GAME, { data: 1, updatedAt: 1 })
    const res = await handleRequest(
      new Request(`${ORIGIN}/sync`, { method: 'GET', headers: { 'X-Sync-Token': TOKEN } }),
      env,
    )
    expect(res.status).toBe(405)
    expect(kv.map.size).toBe(2)
  })
})

describe('CORS', () => {
  it('answers the sync preflight with the methods and header the app sends', async () => {
    const res = await handleRequest(
      new Request(`${ORIGIN}/sync/${GAME}`, { method: 'OPTIONS' }),
      env,
    )
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('PUT')
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('DELETE')
    expect(res.headers.get('Access-Control-Allow-Headers')).toContain('X-Sync-Token')
  })

  it('never lets a sync answer be cached', async () => {
    await put(GAME, { data: 1, updatedAt: 1 })
    expect((await get(GAME)).headers.get('Cache-Control')).toBe('no-store')
  })

  it('preflight needs no token — the browser cannot send one', async () => {
    const res = await handleRequest(new Request(`${ORIGIN}/sync`, { method: 'OPTIONS' }), env)
    expect(res.status).toBe(204)
  })
})

describe('without a KV binding', () => {
  it('says so instead of exploding', async () => {
    const res = await handleRequest(
      new Request(`${ORIGIN}/sync/manifest`, { headers: { 'X-Sync-Token': TOKEN } }),
      {},
    )
    expect(res.status).toBe(501)
    expect(await res.json()).toMatchObject({ error: expect.stringMatching(/not configured/i) })
  })
})

// ── The other half of the worker ─────────────────────────────────────────────

describe('the quote proxy still routes exactly as before', () => {
  const realFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = realFetch
  })

  it('forwards an allow-listed path upstream and adds CORS', async () => {
    const upstream = vi.fn(
      async () => new Response('Symbol,Date\nAAPL,2026-06-01', { headers: { 'Content-Type': 'text/csv' } }),
    )
    globalThis.fetch = upstream as unknown as typeof fetch

    const res = await handleRequest(
      new Request(`${ORIGIN}/q/l/?s=aapl.us&f=sd2t2ohlcv&h&e=csv`),
      env,
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('AAPL')
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=300')

    const target = (upstream.mock.calls[0] as unknown as [URL])[0]
    expect(String(target)).toBe('https://stooq.com/q/l/?s=aapl.us&f=sd2t2ohlcv&h&e=csv')
  })

  it('keeps forbidding everything outside the two prefixes', async () => {
    globalThis.fetch = vi.fn() as unknown as typeof fetch
    expect((await handleRequest(new Request(`${ORIGIN}/`), env)).status).toBe(403)
    expect((await handleRequest(new Request(`${ORIGIN}/q/x/`), env)).status).toBe(403)
    expect(
      (await handleRequest(new Request(`${ORIGIN}/q/l/`, { method: 'POST' }), env)).status,
    ).toBe(403)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('answers its own preflight with the original GET-only header', async () => {
    const res = await handleRequest(new Request(`${ORIGIN}/q/l/`, { method: 'OPTIONS' }), env)
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS')
  })

  it('a path that merely starts with the letters "sync" is not a sync route', async () => {
    globalThis.fetch = vi.fn() as unknown as typeof fetch
    expect((await handleRequest(new Request(`${ORIGIN}/syncopate`), env)).status).toBe(403)
  })
})
