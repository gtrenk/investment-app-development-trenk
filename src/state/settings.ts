// ─── Settings, from outside the session ──────────────────────────────────────
// The app store owns the *active* profile's settings (see useAppStore). The
// profile picker, though, edits whichever profile the pencil was tapped on —
// which is usually not the signed-in one, and on a cold start there is no
// signed-in one at all. So it reads and writes the same namespaced key
// directly, exactly as ProfileCard reads a profile's XP for its preview.
//
// The one subtlety is the overlap: when the profile being edited *is* the
// active one, the write has to go through the store, or a lesson opened after
// "Never mind — back to TickerQuest" would still be reading the old value.

import { STORAGE_KEYS } from '@core/storage/adapter'
import { namespacedKey } from '@core/storage/profiles'
import { defaultSettings, sanitizeSettings } from '@core/settings'
import type { ReadAloudSettings, Settings } from '@core/settings'
import { rawStorage } from './profiles'
import { useAppStore } from './useAppStore'

export async function loadProfileSettings(id: string): Promise<Settings> {
  try {
    const raw = await rawStorage.get<unknown>(namespacedKey(id, STORAGE_KEYS.settings))
    return sanitizeSettings(raw)
  } catch {
    return defaultSettings()
  }
}

/**
 * Patch one profile's read-aloud preference and return what it now is, so the
 * caller renders from the result instead of re-reading storage.
 *
 * `isActive` is passed in rather than looked up: the picker already has the
 * registry in hand, and this module has no business subscribing to it.
 */
export async function saveProfileReadAloud(
  id: string,
  current: Settings,
  patch: Partial<ReadAloudSettings>,
  isActive: boolean,
): Promise<Settings> {
  const next: Settings = { ...current, readAloud: { ...current.readAloud, ...patch } }

  if (isActive && useAppStore.getState().ready) {
    // Same key, same namespace — and it additionally marks the key dirty for
    // cloud sync and re-renders any screen already reading the preference.
    useAppStore.getState().setReadAloud(patch)
    return next
  }

  await rawStorage.set(namespacedKey(id, STORAGE_KEYS.settings), next)
  return next
}
