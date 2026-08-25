// ─── Multi-user profiles ─────────────────────────────────────────────────────
// Up to five learners share one install. Each gets its own slice of the same
// StorageAdapter: every user-state key is written under a `p3:` prefix, so two
// profiles can never read each other's XP, portfolio or review queue.
//
// Everything here is pure over an injected StorageAdapter — no IndexedDB, no
// window, no React — so the whole thing is unit-testable with createMemoryStorage().

import { STORAGE_KEYS } from './adapter'
import type { StorageAdapter } from './adapter'

/** Hard cap from the product spec. Five slots, no more. */
export const MAX_PROFILES = 5

/** The fixed slot ids. A deleted profile frees its slot for the next create. */
export const PROFILE_IDS = ['p1', 'p2', 'p3', 'p4', 'p5'] as const
export type ProfileId = (typeof PROFILE_IDS)[number]

/**
 * The profile registry itself is deliberately NOT namespaced — it is the map
 * that tells you which namespace to read, so it has to live outside all of them.
 */
export const META_KEY = 'tq.profiles'

export const NAME_MAX_LEN = 16

/**
 * Cloud-sync enrolment for one profile.
 *
 * Device-local, like the rest of the registry: the *token* is what travels
 * between devices, and it travels by the owner reading it off one screen and
 * typing it into another. Nothing here is ever uploaded.
 *
 * Holding the token is the entire authorisation — see proxy/worker.js §2 — so
 * it is a password in every sense that matters, and the UI says so.
 */
export interface ProfileSync {
  /** 20-character Crockford base32 sync code. */
  token: string
  /** ISO timestamp sync was switched on for this profile on this device. */
  enabledAt: string
}

export interface Profile {
  id: ProfileId
  /** 1–16 characters, already trimmed. */
  name: string
  /** Single-emoji avatar, chosen from a curated grid (no OS keyboard needed). */
  emoji: string
  createdAt: string
  lastActiveAt: string
  /** Absent while sync is off, which is the default and the common case. */
  sync?: ProfileSync
}

export interface ProfilesMeta {
  profiles: Profile[]
  /** `null` means "show the picker" — nobody is signed in yet. */
  activeId: string | null
}

export function emptyMeta(): ProfilesMeta {
  return { profiles: [], activeId: null }
}

// ── Key namespacing ──────────────────────────────────────────────────────────

/**
 * Keys that stay shared across every profile.
 *
 * Quotes are market data — the last price of AAPL is not Greg's or Ana's, and
 * duplicating the cache five times would mean five times the network on a cold
 * morning. Kept as an exclusion list so no call site has to special-case it.
 */
export const SHARED_KEYS: readonly string[] = [STORAGE_KEYS.quotes]

/** Every key that belongs to exactly one profile — i.e. all the user state. */
export const PROFILE_SCOPED_KEYS: readonly string[] = Object.values(STORAGE_KEYS).filter(
  (k) => !SHARED_KEYS.includes(k),
)

/** `('p3', 'tq.v1.game') → 'p3:tq.v1.game'`; shared keys pass through untouched. */
export function namespacedKey(profileId: string, key: string): string {
  return SHARED_KEYS.includes(key) ? key : `${profileId}:${key}`
}

/**
 * Wraps a storage adapter so every read/write lands in one profile's namespace.
 * The store above it keeps talking plain `STORAGE_KEYS` and never learns that
 * profiles exist.
 */
export function namespacedStorage(storage: StorageAdapter, profileId: string): StorageAdapter {
  return {
    async get<T>(key: string): Promise<T | undefined> {
      return storage.get<T>(namespacedKey(profileId, key))
    },
    async set<T>(key: string, value: T): Promise<void> {
      return storage.set<T>(namespacedKey(profileId, key), value)
    },
    async del(key: string): Promise<void> {
      return storage.del(namespacedKey(profileId, key))
    },
  }
}

// ── Pure transitions over ProfilesMeta ───────────────────────────────────────

export function normalizeName(raw: string): string {
  return raw.trim().slice(0, NAME_MAX_LEN)
}

/** Human-readable reason the name is unusable, or `null` when it is fine. */
export function nameError(raw: string): string | null {
  const name = raw.trim()
  if (name.length === 0) return 'Give this profile a name'
  if (name.length > NAME_MAX_LEN) return `Keep it to ${NAME_MAX_LEN} characters`
  return null
}

export function findProfile(meta: ProfilesMeta, id: string): Profile | undefined {
  return meta.profiles.find((p) => p.id === id)
}

/** The lowest unused slot, or `null` when all five are taken. */
export function nextFreeId(meta: ProfilesMeta): ProfileId | null {
  const taken = new Set(meta.profiles.map((p) => p.id))
  return PROFILE_IDS.find((id) => !taken.has(id)) ?? null
}

export function canCreateProfile(meta: ProfilesMeta): boolean {
  return nextFreeId(meta) !== null
}

/** Keep the list in slot order so a reused slot lands back where it was. */
function bySlot(a: Profile, b: Profile): number {
  return PROFILE_IDS.indexOf(a.id) - PROFILE_IDS.indexOf(b.id)
}

export interface NewProfileInput {
  name: string
  emoji: string
}

/**
 * Adds a profile in the lowest free slot. Does NOT change `activeId` — signing
 * in is a separate decision (and a separate call).
 *
 * Throws when the cap is reached or the name is unusable; callers that want to
 * ask first have `canCreateProfile` and `nameError`.
 */
export function createProfile(
  meta: ProfilesMeta,
  input: NewProfileInput,
  at: string,
): { meta: ProfilesMeta; profile: Profile } {
  const id = nextFreeId(meta)
  if (!id) throw new Error(`Profile limit reached (${MAX_PROFILES})`)
  const invalid = nameError(input.name)
  if (invalid) throw new Error(invalid)

  const profile: Profile = {
    id,
    name: normalizeName(input.name),
    emoji: input.emoji,
    createdAt: at,
    lastActiveAt: at,
  }
  return {
    meta: { ...meta, profiles: [...meta.profiles, profile].sort(bySlot) },
    profile,
  }
}

export function renameProfile(meta: ProfilesMeta, id: string, name: string): ProfilesMeta {
  const invalid = nameError(name)
  if (invalid) throw new Error(invalid)
  return {
    ...meta,
    profiles: meta.profiles.map((p) => (p.id === id ? { ...p, name: normalizeName(name) } : p)),
  }
}

/** Change the avatar without touching anything else. */
export function setProfileEmoji(meta: ProfilesMeta, id: string, emoji: string): ProfilesMeta {
  return {
    ...meta,
    profiles: meta.profiles.map((p) => (p.id === id ? { ...p, emoji } : p)),
  }
}

/**
 * Turn cloud sync on (with a freshly minted token, or one typed in from another
 * device) or off. Passing `null` unlinks *this device only* — the profile's
 * local data is untouched and the cloud copy stays where it is, which is what
 * makes "unlink" and "delete cloud copy" two separate, differently scary
 * buttons in the UI.
 */
export function setProfileSync(
  meta: ProfilesMeta,
  id: string,
  sync: ProfileSync | null,
): ProfilesMeta {
  return {
    ...meta,
    profiles: meta.profiles.map((p) => {
      if (p.id !== id) return p
      if (!sync) {
        const unlinked: Profile = { ...p }
        delete unlinked.sync
        return unlinked
      }
      return { ...p, sync }
    }),
  }
}

export function touchProfile(meta: ProfilesMeta, id: string, at: string): ProfilesMeta {
  return {
    ...meta,
    profiles: meta.profiles.map((p) => (p.id === id ? { ...p, lastActiveAt: at } : p)),
  }
}

/** Sign in: mark the profile active and stamp its last-active time. */
export function selectProfile(meta: ProfilesMeta, id: string, at: string): ProfilesMeta {
  if (!findProfile(meta, id)) throw new Error(`No such profile: ${id}`)
  return { ...touchProfile(meta, id, at), activeId: id }
}

/**
 * Drops the entry (freeing its slot) and signs out if it was the active one.
 * The profile's stored data is wiped separately by `wipeProfileData`.
 */
export function deleteProfile(meta: ProfilesMeta, id: string): ProfilesMeta {
  const profiles = meta.profiles.filter((p) => p.id !== id)
  return { profiles, activeId: meta.activeId === id ? null : meta.activeId }
}

// ── Persistence ──────────────────────────────────────────────────────────────

function isProfile(raw: unknown): raw is Profile {
  if (!raw || typeof raw !== 'object') return false
  const p = raw as Partial<Profile>
  return (
    typeof p.id === 'string' &&
    (PROFILE_IDS as readonly string[]).includes(p.id) &&
    typeof p.name === 'string' &&
    typeof p.emoji === 'string' &&
    typeof p.createdAt === 'string' &&
    typeof p.lastActiveAt === 'string'
  )
}

/**
 * A malformed `sync` block is dropped rather than disqualifying the profile:
 * losing the cloud link is recoverable (retype the code), losing the profile is
 * not.
 */
function sanitizeProfile(p: Profile): Profile {
  const s = p.sync as Partial<ProfileSync> | undefined
  if (s && typeof s.token === 'string' && typeof s.enabledAt === 'string') {
    return { ...p, sync: { token: s.token, enabledAt: s.enabledAt } }
  }
  if (!s) return p
  const cleaned: Profile = { ...p }
  delete cleaned.sync
  return cleaned
}

/**
 * Defensive read: a record written by a future build (or a half-cleared store)
 * must degrade to "no profiles", never crash the boot path.
 */
export function sanitizeMeta(raw: unknown): ProfilesMeta | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const r = raw as Partial<ProfilesMeta>
  if (!Array.isArray(r.profiles)) return undefined
  const seen = new Set<string>()
  const profiles = r.profiles
    .filter(isProfile)
    .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
    .map(sanitizeProfile)
    .sort(bySlot)
  const activeId =
    typeof r.activeId === 'string' && profiles.some((p) => p.id === r.activeId) ? r.activeId : null
  return { profiles, activeId }
}

export async function loadProfilesMeta(storage: StorageAdapter): Promise<ProfilesMeta | undefined> {
  return sanitizeMeta(await storage.get<unknown>(META_KEY))
}

export async function saveProfilesMeta(
  storage: StorageAdapter,
  meta: ProfilesMeta,
): Promise<void> {
  await storage.set(META_KEY, meta)
}

/** Erase every namespaced key belonging to one profile. */
export async function wipeProfileData(storage: StorageAdapter, id: string): Promise<void> {
  await Promise.all(PROFILE_SCOPED_KEYS.map((key) => storage.del(namespacedKey(id, key))))
}

// ── One-time migration from the single-user layout ───────────────────────────

export const LEGACY_PROFILE_NAME = 'Player 1'
export const LEGACY_PROFILE_EMOJI = '📈'

export interface MigrationResult {
  meta: ProfilesMeta
  /** True only on the run that actually moved legacy data into a namespace. */
  migrated: boolean
}

/**
 * Boot step, run once per load before anything reads user state.
 *
 * - Meta already present → nothing to do (this is what makes it idempotent).
 * - No meta but legacy unprefixed keys exist → adopt them as "Player 1" (p1):
 *   copy each value to its `p1:`-prefixed key, record the profile, then delete
 *   the originals. `activeId` stays null so the owner still meets the picker
 *   and sees their carried-over profile sitting there.
 * - No meta, no legacy data → write empty meta; the picker offers "New profile".
 *
 * The copy happens before the meta write, and the deletes after it, so an
 * interrupted migration can only ever leave a harmless duplicate — never a hole.
 */
export async function migrateProfiles(
  storage: StorageAdapter,
  now: string,
): Promise<MigrationResult> {
  const existing = await loadProfilesMeta(storage)
  if (existing) return { meta: existing, migrated: false }

  const legacy: Array<[string, unknown]> = []
  for (const key of PROFILE_SCOPED_KEYS) {
    const value = await storage.get<unknown>(key)
    if (value !== undefined) legacy.push([key, value])
  }

  if (legacy.length === 0) {
    const meta = emptyMeta()
    await saveProfilesMeta(storage, meta)
    return { meta, migrated: false }
  }

  const { meta: withProfile, profile } = createProfile(
    emptyMeta(),
    { name: LEGACY_PROFILE_NAME, emoji: LEGACY_PROFILE_EMOJI },
    now,
  )
  const meta: ProfilesMeta = { ...withProfile, activeId: null }

  for (const [key, value] of legacy) {
    await storage.set(namespacedKey(profile.id, key), value)
  }
  await saveProfilesMeta(storage, meta)
  for (const [key] of legacy) {
    await storage.del(key)
  }

  return { meta, migrated: true }
}
