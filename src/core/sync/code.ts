// ─── Sync codes ──────────────────────────────────────────────────────────────
// The whole credential is one string the user reads off one phone and types
// into another, so the alphabet matters more than the crypto does.
//
// Crockford base32: digits plus A–Z minus I, L, O and U. The first three are
// dropped because they are indistinguishable from 1, 1 and 0 in most sans-serif
// faces; U is dropped so no random draw can spell something the owner would
// rather not show a child. 20 characters × 5 bits = 100 bits of entropy.
//
// The first 8 characters are the **syncId** — the worker's KV prefix. The other
// 12 are the secret half: knowing which buckets exist is useless without them.
//
// Pure and dependency-free; randomness is injected so tests are deterministic.

/** Crockford base32 with the ambiguous glyphs removed. */
export const SYNC_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export const SYNC_TOKEN_LENGTH = 20
export const SYNC_ID_LENGTH = 8

const TOKEN_RE = new RegExp(`^[${SYNC_ALPHABET}]{${SYNC_TOKEN_LENGTH}}$`)

/** Source of randomness: fills the given array with unbiased bytes. */
export type RandomBytes = (into: Uint8Array) => void

/**
 * Mint a fresh sync code.
 *
 * Bytes ≥ 256 − (256 mod 32) would bias the alphabet, so they are redrawn
 * instead of folded — 32 divides 256 exactly, so in practice this never fires,
 * but the code should not depend on that arithmetic staying true.
 */
export function generateSyncToken(randomBytes: RandomBytes): string {
  const out: string[] = []
  const buf = new Uint8Array(SYNC_TOKEN_LENGTH)
  while (out.length < SYNC_TOKEN_LENGTH) {
    randomBytes(buf)
    for (const byte of buf) {
      if (out.length === SYNC_TOKEN_LENGTH) break
      const limit = 256 - (256 % SYNC_ALPHABET.length)
      if (byte >= limit) continue
      out.push(SYNC_ALPHABET[byte % SYNC_ALPHABET.length])
    }
  }
  return out.join('')
}

export function isSyncToken(raw: unknown): raw is string {
  return typeof raw === 'string' && TOKEN_RE.test(raw)
}

/** The KV prefix half of a code. Safe to log; the token itself is not. */
export function syncIdOf(token: string): string {
  return token.slice(0, SYNC_ID_LENGTH)
}

/**
 * What the user types, cleaned up into what the worker expects.
 *
 * Spaces and dashes come from the grouped display format; lowercase comes from
 * a phone keyboard; `I`/`l` and `O` come from someone reading the code as text
 * rather than as base32 and are folded to `1` and `0` the way Crockford
 * specifies. Anything still outside the alphabet is dropped, so the caller only
 * has to check the length.
 */
export function normalizeSyncCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[IL]/g, '1')
    .replace(/O/g, '0')
    .split('')
    .filter((c) => SYNC_ALPHABET.includes(c))
    .join('')
    .slice(0, SYNC_TOKEN_LENGTH)
}

/** `ABCD-EFGH-JKMN-PQRS-TVWX` — five groups of four, for reading aloud. */
export function formatSyncCode(token: string): string {
  return (token.match(/.{1,4}/g) ?? []).join('-')
}

/** `ABCD-••••-••••-••••-••••` — enough to recognise, not enough to reuse. */
export function maskSyncCode(token: string): string {
  const groups = formatSyncCode(token).split('-')
  return groups.map((g, i) => (i === 0 ? g : '•'.repeat(g.length))).join('-')
}
