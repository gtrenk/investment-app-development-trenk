/**
 * TickerQuest Worker — quote proxy + cloud sync (Cloudflare, free tier, no build step).
 *
 * One Worker, two jobs, kept strictly apart by path:
 *
 *   /q/l/…, /q/d/l/…   stateless CORS proxy in front of stooq.com   (§1)
 *   /sync…             per-profile blob store backed by KV           (§2)
 *
 * Everything else is 403. Dependency-free plain JS so `wrangler deploy` needs
 * no bundler and the file can be read top to bottom in one sitting.
 *
 * ── §1 Quote proxy ─────────────────────────────────────────────────────────
 *
 * Stooq serves keyless CSV quotes but sends no CORS headers, so the browser
 * cannot call it directly from the deployed PWA. In dev, vite.config.ts proxies
 * `/api/stooq`; in production this does the same job. GET only, two allow-listed
 * prefixes, no secrets, no logging, nothing to leak. Behaviour here is unchanged
 * from the original stateless proxy, byte for byte.
 *
 * ── §2 Sync ────────────────────────────────────────────────────────────────
 *
 * No accounts. A profile that turns sync on mints a **sync code** and that code
 * is the whole credential — the user types it on their other device and the two
 * are looking at the same cloud profile.
 *
 *   token   20 characters of Crockford base32 (0-9 A-Z minus I, L, O, U — the
 *           four glyphs people mistype). ~100 bits of entropy.
 *   syncId  the first 8 characters of the token. It is the KV key prefix, so a
 *           listing can never enumerate anyone else's blobs, and the remaining
 *           12 characters stay secret-ish even to an operator reading key names.
 *
 * Trust-on-first-use: the first PUT for a syncId writes `${syncId}:__token` and
 * from then on every request for that syncId must present the identical token
 * (compared in constant time). There is nothing else to authenticate against —
 * whoever holds the code is the owner, which is exactly the security model of a
 * password, and the UI says so.
 *
 *   PUT    /sync/:blobKey        X-Sync-Token: <token>   body {data, updatedAt}
 *   GET    /sync/:blobKey?since= X-Sync-Token: <token> → {data, updatedAt} | 304
 *   GET    /sync/manifest        X-Sync-Token: <token> → {blobKey: updatedAt}
 *   DELETE /sync                 X-Sync-Token: <token> → wipes the whole syncId
 *
 * Bodies are capped at 256 KB and blob keys are allow-listed, so a stolen code
 * buys an attacker one small fixed-shape bucket and no way to grow it.
 *
 * ── Deploy ─────────────────────────────────────────────────────────────────
 *
 *   npm i -g wrangler && wrangler login
 *   npx wrangler kv namespace create SYNC     # paste the id into wrangler.toml
 *   npx wrangler deploy                       # reads wrangler.toml
 *
 * Then set the repo variable QUOTE_PROXY to the worker URL and rebuild; the app
 * uses that one origin for both quotes and sync. See DEPLOY.md §3.
 *
 * Smoke test:
 *   curl 'https://<worker>/q/l/?s=aapl.us&f=sd2t2ohlcv&h&e=csv'
 */

// ─── §1 Quote proxy ──────────────────────────────────────────────────────────

const UPSTREAM = 'https://stooq.com'
const ALLOWED_PREFIXES = ['/q/l/', '/q/d/l/'] // last quote, daily history
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, max-age=300',
}

async function handleQuoteProxy(request, url) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 403, headers: CORS })

  if (!ALLOWED_PREFIXES.some((p) => url.pathname.startsWith(p))) {
    return new Response('Forbidden', { status: 403, headers: CORS })
  }

  const upstream = new URL(url.pathname + url.search, UPSTREAM)
  // cf.cacheTtl lets the edge absorb repeat lookups and keeps us well inside
  // Stooq's daily request limit.
  const res = await fetch(upstream, { method: 'GET', cf: { cacheTtl: 300, cacheEverything: true } })

  return new Response(res.body, {
    status: res.status,
    headers: { ...CORS, 'Content-Type': res.headers.get('Content-Type') || 'text/csv' },
  })
}

// ─── §2 Sync ─────────────────────────────────────────────────────────────────

/** Sync answers are never cacheable — a stale 200 would silently lose an edit. */
const SYNC_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'X-Sync-Token, Content-Type',
  'Access-Control-Max-Age': '86400',
  'Cache-Control': 'no-store',
}

/** 256 KB. The largest real profile measured is ~30 KB, so this is 8× headroom. */
export const MAX_BLOB_BYTES = 256 * 1024

/**
 * The only blob names that exist. All but the last are the app's per-profile
 * storage keys (see STORAGE_KEYS in src/core/storage/adapter.ts — `quotes` is
 * shared market data and deliberately absent); `profileMeta` carries the
 * {name, emoji} pair so a linked device can show the profile before it has
 * pulled anything else. tests/syncWorker.test.ts asserts this list matches
 * SYNC_KEYS exactly, so adding a storage key without adding it here fails CI.
 */
export const SYNC_BLOB_KEYS = [
  'tq.v1.progress',
  'tq.v1.srs',
  'tq.v1.game',
  'tq.v1.portfolio',
  'tq.v1.drills',
  'tq.v1.orders',
  'tq.v1.watchlist',
  'tq.v1.settings',
  'tq.v1.cases',
  'tq.v1.placement',
  'profileMeta',
]

const BLOB_KEY_SET = new Set(SYNC_BLOB_KEYS)

/** Crockford base32 minus the ambiguous glyphs. Kept in sync with src/state/sync.ts. */
const TOKEN_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
export const TOKEN_LENGTH = 20
export const SYNC_ID_LENGTH = 8

const TOKEN_RE = new RegExp(`^[${TOKEN_ALPHABET}]{${TOKEN_LENGTH}}$`)

function isValidToken(token) {
  return typeof token === 'string' && TOKEN_RE.test(token)
}

/**
 * Constant-time string compare. `a === b` leaks the length of the shared prefix
 * through timing; over enough requests that is a token oracle.
 */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...SYNC_CORS, 'Content-Type': 'application/json' },
  })
}

const tokenKeyFor = (syncId) => `${syncId}:__token`
const blobKeyFor = (syncId, blobKey) => `${syncId}:${blobKey}`

/** A finite, sane `updatedAt` in epoch milliseconds, or `null` when it is neither. */
function coerceTimestamp(raw) {
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null
}

async function listSyncId(env, syncId) {
  const out = []
  let cursor
  // KV list pages at 1000 keys; a syncId holds 9, but looping costs one line.
  do {
    const page = await env.SYNC.list({ prefix: `${syncId}:`, cursor })
    out.push(...page.keys)
    cursor = page.list_complete ? undefined : page.cursor
  } while (cursor)
  return out
}

async function handleSync(request, env, url) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: SYNC_CORS })

  // No KV binding means the owner deployed the quote proxy without creating the
  // namespace. Say so plainly rather than 500-ing on `env.SYNC.get`.
  if (!env || !env.SYNC) {
    return json({ error: 'Sync is not configured on this worker (no SYNC KV namespace).' }, 501)
  }

  const token = request.headers.get('X-Sync-Token') || ''
  if (!isValidToken(token)) return json({ error: 'Invalid sync code.' }, 401)
  const syncId = token.slice(0, SYNC_ID_LENGTH)

  // Trust on first use: only a PUT may claim an unused syncId.
  const stored = await env.SYNC.get(tokenKeyFor(syncId))
  if (stored === null || stored === undefined) {
    if (request.method !== 'PUT') return json({ error: 'Unknown sync code.' }, 401)
  } else if (!timingSafeEqual(stored, token)) {
    return json({ error: 'Sync code does not match this profile.' }, 401)
  }

  // `/sync` → '', `/sync/manifest` → 'manifest', `/sync/tq.v1.game` → 'tq.v1.game'
  const rest = decodeURIComponent(url.pathname.slice('/sync'.length).replace(/^\//, ''))

  if (rest === '') {
    if (request.method !== 'DELETE') return json({ error: 'Method not allowed.' }, 405)
    return deleteAll(env, syncId)
  }
  if (rest === 'manifest') {
    if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405)
    return manifest(env, syncId)
  }
  if (!BLOB_KEY_SET.has(rest)) return json({ error: `Unknown sync key: ${rest}` }, 400)

  if (request.method === 'PUT') return putBlob(request, env, syncId, rest, token)
  if (request.method === 'GET') return getBlob(env, syncId, rest, url)
  return json({ error: 'Method not allowed.' }, 405)
}

async function putBlob(request, env, syncId, blobKey, token) {
  // Cheap rejection first, so an oversized upload is refused on the header
  // rather than after it has all arrived.
  const declared = Number(request.headers.get('Content-Length'))
  if (Number.isFinite(declared) && declared > MAX_BLOB_BYTES) {
    return json({ error: 'Too large.', maxBytes: MAX_BLOB_BYTES }, 413)
  }

  const raw = await request.text()
  if (new TextEncoder().encode(raw).length > MAX_BLOB_BYTES) {
    return json({ error: 'Too large.', maxBytes: MAX_BLOB_BYTES }, 413)
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return json({ error: 'Body must be JSON.' }, 400)
  }
  if (!parsed || typeof parsed !== 'object' || !('data' in parsed)) {
    return json({ error: 'Body must be {data, updatedAt}.' }, 400)
  }
  const updatedAt = coerceTimestamp(parsed.updatedAt)
  if (updatedAt === null) return json({ error: 'updatedAt must be epoch milliseconds.' }, 400)

  // Claim the syncId only once the write is known to be well-formed, so a
  // malformed first request cannot burn someone's freshly generated code.
  await env.SYNC.put(tokenKeyFor(syncId), token)
  await env.SYNC.put(
    blobKeyFor(syncId, blobKey),
    JSON.stringify({ data: parsed.data, updatedAt }),
    { metadata: { updatedAt } },
  )
  return json({ ok: true, blobKey, updatedAt }, 200)
}

async function getBlob(env, syncId, blobKey, url) {
  const raw = await env.SYNC.get(blobKeyFor(syncId, blobKey))
  if (raw === null || raw === undefined) return json({ error: 'Not found.' }, 404)

  let record
  try {
    record = JSON.parse(raw)
  } catch {
    return json({ error: 'Corrupt record.' }, 404)
  }

  const since = coerceTimestamp(url.searchParams.get('since'))
  if (since !== null && record.updatedAt <= since) {
    return new Response(null, { status: 304, headers: SYNC_CORS })
  }
  return json({ data: record.data, updatedAt: record.updatedAt }, 200)
}

async function manifest(env, syncId) {
  const keys = await listSyncId(env, syncId)
  const out = {}
  for (const entry of keys) {
    const blobKey = entry.name.slice(syncId.length + 1)
    if (blobKey === '__token' || !BLOB_KEY_SET.has(blobKey)) continue
    // The list metadata avoids one KV read per blob; fall back to a read only
    // for records written before metadata existed.
    const ts = coerceTimestamp(entry.metadata && entry.metadata.updatedAt)
    if (ts !== null) {
      out[blobKey] = ts
      continue
    }
    const raw = await env.SYNC.get(entry.name)
    try {
      const parsed = JSON.parse(raw)
      const fallback = coerceTimestamp(parsed && parsed.updatedAt)
      if (fallback !== null) out[blobKey] = fallback
    } catch {
      /* unreadable record — omit it and let the next push overwrite it */
    }
  }
  return json(out, 200)
}

async function deleteAll(env, syncId) {
  const keys = await listSyncId(env, syncId)
  for (const entry of keys) await env.SYNC.delete(entry.name)
  return json({ ok: true, deleted: keys.length }, 200)
}

// ─── Entry point ─────────────────────────────────────────────────────────────

/**
 * Exported for the unit suite (tests/syncWorker.test.ts), which drives it with
 * plain `Request` objects and a `Map`-backed fake KV. Wrangler uses the default
 * export below.
 */
export async function handleRequest(request, env) {
  const url = new URL(request.url)
  if (url.pathname === '/sync' || url.pathname.startsWith('/sync/')) {
    return handleSync(request, env, url)
  }
  return handleQuoteProxy(request, url)
}

export default {
  fetch: handleRequest,
}
