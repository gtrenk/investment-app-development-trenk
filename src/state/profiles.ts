// ─── Profile boot & picker state ─────────────────────────────────────────────
// Sits between the pure helpers in @core/storage/profiles and the UI:
//
//   • owns the single raw (un-namespaced) storage adapter,
//   • runs the one-time legacy migration exactly once per page load,
//   • exposes the registry to the picker as a small zustand store,
//   • hands useAppStore the namespaced adapter for the signed-in profile.
//
// Everything user-facing goes through here; nothing below it knows profiles exist.

import { create } from 'zustand'
import { createMemoryStorage, STORAGE_KEYS } from '@core/storage/adapter'
import type { StorageAdapter } from '@core/storage/adapter'
import {
  createProfile,
  deleteProfile,
  emptyMeta,
  findProfile,
  migrateProfiles,
  namespacedKey,
  namespacedStorage,
  renameProfile,
  saveProfilesMeta,
  selectProfile,
  setProfileEmoji,
  setProfileSync,
  wipeProfileData,
} from '@core/storage/profiles'
import type { Profile, ProfileSync, ProfilesMeta } from '@core/storage/profiles'
import type { GameState } from '@core/types'
import { levelFor } from '@core/gamification/xp'
import { idbStorage } from '@platform/idbStorage'
import { appClock } from './clock'

// ── The raw store ────────────────────────────────────────────────────────────

function pickStorage(): StorageAdapter {
  try {
    if (typeof indexedDB !== 'undefined') return idbStorage
  } catch {
    /* private mode / blocked storage — fall through */
  }
  return createMemoryStorage()
}

/** Un-namespaced. Only the profile registry and shared keys belong here. */
export const rawStorage: StorageAdapter = pickStorage()

// ── Avatars ──────────────────────────────────────────────────────────────────

/**
 * A curated grid instead of an OS emoji keyboard: on a phone the system picker
 * is a full-screen modal that hides the form, and half of what it offers does
 * not render as a single glyph.
 */
export const PROFILE_EMOJI = [
  '📈',
  '🚀',
  '🦊',
  '🐻',
  '🐼',
  '🦉',
  '🐬',
  '🌟',
  '🔥',
  '🎯',
  '🧠',
  '💎',
] as const

export const DEFAULT_EMOJI = PROFILE_EMOJI[0]

// ── Boot ─────────────────────────────────────────────────────────────────────

/**
 * Test-harness accommodation, never a production path.
 *
 * The pre-existing e2e specs open '/' with an empty store and expect Home. A
 * spec sets `window.__TEST_AUTO_PROFILE__` (see e2e/fixtures.ts) and boot signs
 * a throwaway profile in silently. Real users always meet the picker.
 */
async function autoProfileForTests(meta: ProfilesMeta): Promise<ProfilesMeta> {
  if (typeof window === 'undefined' || window.__TEST_AUTO_PROFILE__ !== true) return meta
  if (meta.activeId !== null) return meta
  const now = appClock.now()
  const base = meta.profiles.length > 0 ? meta : createProfile(meta, { name: 'Test', emoji: DEFAULT_EMOJI }, now).meta
  const next = selectProfile(base, base.profiles[0].id, now)
  await saveProfilesMeta(rawStorage, next)
  return next
}

let bootPromise: Promise<ProfilesMeta> | null = null

/**
 * Migration + registry read, memoised for the life of the page. Both the store's
 * hydrate() and the picker call it; only the first one does any work.
 */
export function bootProfiles(): Promise<ProfilesMeta> {
  bootPromise ??= (async () => {
    const { meta } = await migrateProfiles(rawStorage, appClock.now())
    return autoProfileForTests(meta)
  })()
  return bootPromise
}

/**
 * The adapter the app store persists through: the signed-in profile's namespace.
 *
 * With nobody signed in there is nothing legitimate to write, so writes go to a
 * throwaway memory store rather than leaking back into the un-namespaced keys
 * the migration just cleaned up.
 */
export async function activeProfileStorage(): Promise<StorageAdapter> {
  const meta = await bootProfiles()
  return meta.activeId ? namespacedStorage(rawStorage, meta.activeId) : createMemoryStorage()
}

// ── Picker state ─────────────────────────────────────────────────────────────

/** The one-line summary a profile card shows without hydrating the whole store. */
export interface ProfilePreview {
  level: number
  xp: number
  streak: number
}

export interface ProfilesState {
  loaded: boolean
  meta: ProfilesMeta
  /** Lazily filled per profile; a missing entry just renders as "New player". */
  previews: Record<string, ProfilePreview>

  load: () => Promise<void>
  loadPreview: (id: string) => Promise<void>
  create: (name: string, emoji: string) => Promise<Profile>
  rename: (id: string, name: string) => Promise<void>
  setEmoji: (id: string, emoji: string) => Promise<void>
  /** Link this profile to a cloud sync code, or `null` to unlink this device. */
  setSync: (id: string, sync: ProfileSync | null) => Promise<void>
  remove: (id: string) => Promise<void>
  /** Sign in. Callers reload the page afterwards — see `enterProfile`. */
  select: (id: string) => Promise<void>
}

async function commit(meta: ProfilesMeta): Promise<ProfilesMeta> {
  await saveProfilesMeta(rawStorage, meta)
  return meta
}

export const useProfilesStore = create<ProfilesState>((set, get) => ({
  loaded: false,
  meta: emptyMeta(),
  previews: {},

  async load() {
    set({ meta: await bootProfiles(), loaded: true })
  },

  /**
   * Deliberately un-cached: the picker is reachable mid-session from the Home
   * chip, and by then the active profile's XP has moved on from whatever was
   * read at boot. One key read per card is cheap; a stale card is a lie.
   */
  async loadPreview(id) {
    const game = await rawStorage.get<GameState>(namespacedKey(id, STORAGE_KEYS.game))
    const xp = typeof game?.xp === 'number' ? game.xp : 0
    const streak = typeof game?.streak?.current === 'number' ? game.streak.current : 0
    set((s) => ({ previews: { ...s.previews, [id]: { level: levelFor(xp), xp, streak } } }))
  },

  async create(name, emoji) {
    const { meta, profile } = createProfile(get().meta, { name, emoji }, appClock.now())
    set({ meta: await commit(meta) })
    return profile
  },

  async rename(id, name) {
    set({ meta: await commit(renameProfile(get().meta, id, name)) })
  },

  async setEmoji(id, emoji) {
    set({ meta: await commit(setProfileEmoji(get().meta, id, emoji)) })
  },

  async setSync(id, sync) {
    set({ meta: await commit(setProfileSync(get().meta, id, sync)) })
  },

  async remove(id) {
    // Data first: a crash between the two leaves orphaned keys, which the next
    // create in that slot would otherwise inherit as someone else's XP.
    await wipeProfileData(rawStorage, id)
    const meta = deleteProfile(get().meta, id)
    set((s) => {
      const previews = { ...s.previews }
      delete previews[id]
      return { previews }
    })
    set({ meta: await commit(meta) })
  },

  async select(id) {
    set({ meta: await commit(selectProfile(get().meta, id, appClock.now())) })
  },
}))

/**
 * Sign in and restart the app at the deploy base.
 *
 * A full reload is the honest way to swap namespaces: every module that cached
 * a value from the old profile — the store, the quote cache's hydration, the
 * portfolio sync loops — starts over against the new one. Hot-swapping the
 * adapter under a live store would leave half the app showing the other user.
 */
export async function enterProfile(id: string): Promise<void> {
  await useProfilesStore.getState().select(id)
  if (typeof window !== 'undefined') window.location.assign(import.meta.env.BASE_URL)
}

/** The signed-in profile, or undefined while nobody is. */
export function activeProfile(meta: ProfilesMeta): Profile | undefined {
  return meta.activeId ? findProfile(meta, meta.activeId) : undefined
}
