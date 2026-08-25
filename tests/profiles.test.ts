import { describe, expect, it } from 'vitest'
import { STORAGE_KEYS, createMemoryStorage } from '@core/storage/adapter'
import type { StorageAdapter } from '@core/storage/adapter'
import {
  LEGACY_PROFILE_EMOJI,
  LEGACY_PROFILE_NAME,
  MAX_PROFILES,
  META_KEY,
  PROFILE_IDS,
  PROFILE_SCOPED_KEYS,
  SHARED_KEYS,
  canCreateProfile,
  createProfile,
  deleteProfile,
  emptyMeta,
  findProfile,
  loadProfilesMeta,
  migrateProfiles,
  nameError,
  namespacedKey,
  namespacedStorage,
  nextFreeId,
  normalizeName,
  renameProfile,
  sanitizeMeta,
  saveProfilesMeta,
  selectProfile,
  setProfileEmoji,
  touchProfile,
  wipeProfileData,
} from '@core/storage/profiles'
import type { ProfilesMeta } from '@core/storage/profiles'

const T0 = '2026-03-01T09:00:00.000Z'
const T1 = '2026-03-02T09:00:00.000Z'

function withProfiles(names: string[]): ProfilesMeta {
  let meta = emptyMeta()
  for (const n of names) meta = createProfile(meta, { name: n, emoji: '📈' }, T0).meta
  return meta
}

// ── Slots & the cap ──────────────────────────────────────────────────────────

describe('profile slots', () => {
  it('fills p1..p5 in order and then refuses', () => {
    let meta = emptyMeta()
    for (let i = 0; i < MAX_PROFILES; i++) {
      expect(canCreateProfile(meta)).toBe(true)
      const out = createProfile(meta, { name: `P${i}`, emoji: '📈' }, T0)
      expect(out.profile.id).toBe(PROFILE_IDS[i])
      meta = out.meta
    }
    expect(meta.profiles).toHaveLength(MAX_PROFILES)
    expect(canCreateProfile(meta)).toBe(false)
    expect(nextFreeId(meta)).toBeNull()
    expect(() => createProfile(meta, { name: 'Sixth', emoji: '📈' }, T0)).toThrow(/limit/i)
  })

  it('reuses a freed slot rather than drifting upward', () => {
    let meta = withProfiles(['A', 'B', 'C'])
    meta = deleteProfile(meta, 'p2')
    expect(meta.profiles.map((p) => p.id)).toEqual(['p1', 'p3'])
    expect(nextFreeId(meta)).toBe('p2')

    const { meta: after, profile } = createProfile(meta, { name: 'D', emoji: '🚀' }, T1)
    expect(profile.id).toBe('p2')
    // and the list stays in slot order, not insertion order
    expect(after.profiles.map((p) => p.id)).toEqual(['p1', 'p2', 'p3'])
  })

  it('signs out when the active profile is deleted, and keeps it otherwise', () => {
    const meta = selectProfile(withProfiles(['A', 'B']), 'p2', T0)
    expect(deleteProfile(meta, 'p2').activeId).toBeNull()
    expect(deleteProfile(meta, 'p1').activeId).toBe('p2')
  })
})

// ── Names, emoji, timestamps ─────────────────────────────────────────────────

describe('profile fields', () => {
  it('accepts 1–16 characters and rejects the rest', () => {
    expect(nameError('Greg')).toBeNull()
    expect(nameError('G')).toBeNull()
    expect(nameError('x'.repeat(16))).toBeNull()
    expect(nameError('')).not.toBeNull()
    expect(nameError('   ')).not.toBeNull()
    expect(nameError('x'.repeat(17))).not.toBeNull()
    // A too-long name is a validation error, not a silent truncation.
    expect(() => createProfile(emptyMeta(), { name: '', emoji: '📈' }, T0)).toThrow()
  })

  it('trims on the way in', () => {
    expect(normalizeName('  Greg  ')).toBe('Greg')
    const { profile } = createProfile(emptyMeta(), { name: '  Ana ', emoji: '🚀' }, T0)
    expect(profile.name).toBe('Ana')
    expect(profile.createdAt).toBe(T0)
    expect(profile.lastActiveAt).toBe(T0)
  })

  it('renames and re-avatars without touching anything else', () => {
    const meta = withProfiles(['A', 'B'])
    const renamed = renameProfile(meta, 'p2', 'Bea')
    expect(findProfile(renamed, 'p2')?.name).toBe('Bea')
    expect(findProfile(renamed, 'p1')?.name).toBe('A')
    expect(findProfile(renamed, 'p2')?.createdAt).toBe(T0)

    const re = setProfileEmoji(renamed, 'p2', '🦊')
    expect(findProfile(re, 'p2')?.emoji).toBe('🦊')
    expect(findProfile(re, 'p2')?.name).toBe('Bea')
    expect(() => renameProfile(meta, 'p1', '')).toThrow()
  })

  it('selecting stamps lastActiveAt and sets activeId', () => {
    const meta = withProfiles(['A', 'B'])
    const after = selectProfile(meta, 'p2', T1)
    expect(after.activeId).toBe('p2')
    expect(findProfile(after, 'p2')?.lastActiveAt).toBe(T1)
    expect(findProfile(after, 'p1')?.lastActiveAt).toBe(T0)
    expect(touchProfile(after, 'p1', T1).activeId).toBe('p2')
    expect(() => selectProfile(meta, 'p5', T1)).toThrow()
  })

  it('never mutates the meta it was handed', () => {
    const meta = withProfiles(['A'])
    const snapshot = JSON.stringify(meta)
    createProfile(meta, { name: 'B', emoji: '🚀' }, T1)
    renameProfile(meta, 'p1', 'Z')
    selectProfile(meta, 'p1', T1)
    deleteProfile(meta, 'p1')
    expect(JSON.stringify(meta)).toBe(snapshot)
  })
})

// ── Namespacing ──────────────────────────────────────────────────────────────

describe('namespacedStorage', () => {
  it('prefixes every user-state key', () => {
    expect(namespacedKey('p1', STORAGE_KEYS.game)).toBe('p1:tq.v1.game')
    expect(namespacedKey('p3', STORAGE_KEYS.portfolio)).toBe('p3:tq.v1.portfolio')
    for (const key of PROFILE_SCOPED_KEYS) {
      expect(namespacedKey('p4', key)).toBe(`p4:${key}`)
    }
  })

  it('leaves quotes shared — market data is nobody"s user state', () => {
    expect(SHARED_KEYS).toContain(STORAGE_KEYS.quotes)
    expect(namespacedKey('p1', STORAGE_KEYS.quotes)).toBe(STORAGE_KEYS.quotes)
    expect(PROFILE_SCOPED_KEYS).not.toContain(STORAGE_KEYS.quotes)
    // Every other key is scoped: the two lists partition STORAGE_KEYS.
    expect([...PROFILE_SCOPED_KEYS, ...SHARED_KEYS].sort()).toEqual(
      Object.values(STORAGE_KEYS).sort(),
    )
  })

  it('isolates two profiles reading the same key', async () => {
    const raw = createMemoryStorage()
    const a = namespacedStorage(raw, 'p1')
    const b = namespacedStorage(raw, 'p2')

    await a.set(STORAGE_KEYS.game, { xp: 100 })
    await b.set(STORAGE_KEYS.game, { xp: 7 })

    expect(await a.get(STORAGE_KEYS.game)).toEqual({ xp: 100 })
    expect(await b.get(STORAGE_KEYS.game)).toEqual({ xp: 7 })
    expect(await raw.get('p1:tq.v1.game')).toEqual({ xp: 100 })
    expect(await raw.get(STORAGE_KEYS.game)).toBeUndefined()

    await a.del(STORAGE_KEYS.game)
    expect(await a.get(STORAGE_KEYS.game)).toBeUndefined()
    expect(await b.get(STORAGE_KEYS.game)).toEqual({ xp: 7 })
  })

  it('shares the quote cache between profiles', async () => {
    const raw = createMemoryStorage()
    const a = namespacedStorage(raw, 'p1')
    const b = namespacedStorage(raw, 'p5')

    await a.set(STORAGE_KEYS.quotes, { AAPL: 190 })
    expect(await b.get(STORAGE_KEYS.quotes)).toEqual({ AAPL: 190 })
    expect(await raw.get(STORAGE_KEYS.quotes)).toEqual({ AAPL: 190 })
  })
})

describe('wipeProfileData', () => {
  it('erases one profile and leaves the others (and the quotes) alone', async () => {
    const raw = createMemoryStorage()
    for (const id of ['p1', 'p2']) {
      const s = namespacedStorage(raw, id)
      for (const key of PROFILE_SCOPED_KEYS) await s.set(key, `${id}-${key}`)
    }
    await raw.set(STORAGE_KEYS.quotes, { AAPL: 1 })

    await wipeProfileData(raw, 'p1')

    for (const key of PROFILE_SCOPED_KEYS) {
      expect(await raw.get(namespacedKey('p1', key))).toBeUndefined()
      expect(await raw.get(namespacedKey('p2', key))).toBe(`p2-${key}`)
    }
    expect(await raw.get(STORAGE_KEYS.quotes)).toEqual({ AAPL: 1 })
  })
})

// ── Meta persistence & sanitising ────────────────────────────────────────────

describe('meta persistence', () => {
  it('round-trips through storage under the un-namespaced key', async () => {
    const raw = createMemoryStorage()
    const meta = selectProfile(withProfiles(['Greg']), 'p1', T1)
    await saveProfilesMeta(raw, meta)
    expect(await raw.get(META_KEY)).toEqual(meta)
    expect(await loadProfilesMeta(raw)).toEqual(meta)
  })

  it('degrades garbage to "no profiles" instead of crashing the boot', () => {
    expect(sanitizeMeta(undefined)).toBeUndefined()
    expect(sanitizeMeta(42)).toBeUndefined()
    expect(sanitizeMeta({})).toBeUndefined()
    expect(sanitizeMeta({ profiles: [] })).toEqual({ profiles: [], activeId: null })
    // Malformed entries and unknown slot ids are dropped.
    expect(
      sanitizeMeta({ profiles: [{ id: 'p9', name: 'X', emoji: '📈', createdAt: T0, lastActiveAt: T0 }, null], activeId: 'p9' }),
    ).toEqual({ profiles: [], activeId: null })
    // An activeId pointing at nobody means "show the picker".
    expect(sanitizeMeta({ profiles: [], activeId: 'p3' })?.activeId).toBeNull()
  })

  it('drops duplicate slot ids', () => {
    const dupe = { id: 'p1', name: 'A', emoji: '📈', createdAt: T0, lastActiveAt: T0 }
    const meta = sanitizeMeta({ profiles: [dupe, { ...dupe, name: 'B' }], activeId: 'p1' })
    expect(meta?.profiles).toHaveLength(1)
    expect(meta?.profiles[0].name).toBe('A')
  })
})

// ── Migration ────────────────────────────────────────────────────────────────

/** A store that looks like a pre-profiles install. */
async function seedLegacy(raw: StorageAdapter): Promise<void> {
  await raw.set(STORAGE_KEYS.game, { xp: 420, streak: { current: 3 } })
  await raw.set(STORAGE_KEYS.progress, { completedLessons: { 'u01-l01': '2026-02-01' } })
  await raw.set(STORAGE_KEYS.portfolio, { cash: 9000 })
  await raw.set(STORAGE_KEYS.quotes, { AAPL: { price: 190 } })
}

describe('migrateProfiles', () => {
  it('fresh install: writes empty meta, migrates nothing, shows the picker', async () => {
    const raw = createMemoryStorage()
    const { meta, migrated } = await migrateProfiles(raw, T0)

    expect(migrated).toBe(false)
    expect(meta).toEqual({ profiles: [], activeId: null })
    // Persisted, so the next boot takes the cheap path.
    expect(await loadProfilesMeta(raw)).toEqual({ profiles: [], activeId: null })
  })

  it('legacy install: adopts the data as Player 1 and clears the old keys', async () => {
    const raw = createMemoryStorage()
    await seedLegacy(raw)

    const { meta, migrated } = await migrateProfiles(raw, T0)

    expect(migrated).toBe(true)
    expect(meta.profiles).toHaveLength(1)
    expect(meta.profiles[0]).toMatchObject({
      id: 'p1',
      name: LEGACY_PROFILE_NAME,
      emoji: LEGACY_PROFILE_EMOJI,
      createdAt: T0,
      lastActiveAt: T0,
    })
    // activeId stays null: the owner still meets the picker, with their
    // carried-over profile waiting there.
    expect(meta.activeId).toBeNull()

    // Values moved, not copied-and-left.
    expect(await raw.get('p1:tq.v1.game')).toEqual({ xp: 420, streak: { current: 3 } })
    expect(await raw.get('p1:tq.v1.progress')).toEqual({
      completedLessons: { 'u01-l01': '2026-02-01' },
    })
    expect(await raw.get('p1:tq.v1.portfolio')).toEqual({ cash: 9000 })
    for (const key of PROFILE_SCOPED_KEYS) {
      expect(await raw.get(key)).toBeUndefined()
    }
  })

  it('does not migrate or prefix the quote cache', async () => {
    const raw = createMemoryStorage()
    await seedLegacy(raw)
    await migrateProfiles(raw, T0)

    expect(await raw.get(STORAGE_KEYS.quotes)).toEqual({ AAPL: { price: 190 } })
    expect(await raw.get('p1:tq.v1.quotes')).toBeUndefined()
  })

  it('a store holding only quotes is a fresh install, not a legacy one', async () => {
    const raw = createMemoryStorage()
    await raw.set(STORAGE_KEYS.quotes, { AAPL: { price: 190 } })

    const { meta, migrated } = await migrateProfiles(raw, T0)
    expect(migrated).toBe(false)
    expect(meta.profiles).toHaveLength(0)
  })

  it('is idempotent: a second run changes nothing', async () => {
    const raw = createMemoryStorage()
    await seedLegacy(raw)

    const first = await migrateProfiles(raw, T0)
    const second = await migrateProfiles(raw, T1)

    expect(second.migrated).toBe(false)
    expect(second.meta).toEqual(first.meta)
    expect(second.meta.profiles).toHaveLength(1)
    expect(await raw.get('p1:tq.v1.game')).toEqual({ xp: 420, streak: { current: 3 } })
  })

  it('a third run after real use neither duplicates nor loses a profile', async () => {
    const raw = createMemoryStorage()
    await seedLegacy(raw)
    await migrateProfiles(raw, T0)

    // The owner signs in and a second learner joins.
    let meta = (await loadProfilesMeta(raw)) as ProfilesMeta
    meta = selectProfile(meta, 'p1', T1)
    meta = createProfile(meta, { name: 'Ana', emoji: '🚀' }, T1).meta
    await saveProfilesMeta(raw, meta)
    await namespacedStorage(raw, 'p2').set(STORAGE_KEYS.game, { xp: 10 })

    const again = await migrateProfiles(raw, T1)
    expect(again.migrated).toBe(false)
    expect(again.meta.profiles.map((p) => p.name)).toEqual([LEGACY_PROFILE_NAME, 'Ana'])
    expect(again.meta.activeId).toBe('p1')
    expect(await raw.get('p1:tq.v1.game')).toEqual({ xp: 420, streak: { current: 3 } })
    expect(await raw.get('p2:tq.v1.game')).toEqual({ xp: 10 })
  })

  it('migrated data is readable through the namespaced adapter the store uses', async () => {
    const raw = createMemoryStorage()
    await seedLegacy(raw)
    const { meta } = await migrateProfiles(raw, T0)

    const scoped = namespacedStorage(raw, meta.profiles[0].id)
    expect(await scoped.get(STORAGE_KEYS.game)).toEqual({ xp: 420, streak: { current: 3 } })
    expect(await scoped.get(STORAGE_KEYS.quotes)).toEqual({ AAPL: { price: 190 } })
    // A slot nobody has used yet is simply empty.
    expect(await namespacedStorage(raw, 'p2').get(STORAGE_KEYS.game)).toBeUndefined()
  })
})
