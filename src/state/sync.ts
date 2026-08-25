// ─── Cloud sync wiring ───────────────────────────────────────────────────────
// The impure half of sync: where the server is, when to push, what to do with
// what came back. The protocol itself is in @core/sync/engine, which knows
// nothing about React, IndexedDB, timers or profiles.
//
// The shape of it:
//
//   profile opened → hydrate() → initProfileSync()
//                                  ├── pullAll()  ─ keys changed? → hydrate(force)
//                                  ├── register the store's persist hook
//                                  └── flush on tab-hide
//   any mutation  → write() → markDirty(key) → debounce 3s → pushDirty()
//
// Sync is inert unless BOTH are true: the profile has a token (the owner turned
// it on) and a worker origin is configured. Neither is the default, so a fresh
// install does exactly what it did before this file existed.

import { create } from 'zustand'
import { createSyncEngine } from '@core/sync/engine'
import type { SyncEngine, SyncFailure } from '@core/sync/engine'
import { PROFILE_META_BLOB, isSyncFailure } from '@core/sync/engine'
import { SYNC_KEYS } from '@core/sync/keys'
import { generateSyncToken, isSyncToken, normalizeSyncCode } from '@core/sync/code'
import {
  canCreateProfile,
  createProfile,
  namespacedStorage,
  saveProfilesMeta,
  setProfileSync,
} from '@core/storage/profiles'
import type { Profile, ProfileSync, ProfilesMeta } from '@core/storage/profiles'
import { DEFAULT_EMOJI, activeProfile, rawStorage, useProfilesStore } from './profiles'
import { onPersist, useAppStore } from './useAppStore'
import { appClock } from './clock'

/** How long after the last mutation a push goes out. */
export const PUSH_DEBOUNCE_MS = 3_000

// ── Where the server is ──────────────────────────────────────────────────────

/**
 * One worker serves both quotes and sync, so the sync root is the quote origin
 * plus `/sync`. `VITE_QUOTE_PROXY` unset means the owner has not deployed it —
 * `null`, and the UI says "server not configured" instead of failing silently.
 *
 * A relative value (`/api/stooq`, the Vite dev proxy) is explicitly not a sync
 * server: it is a same-origin rewrite to stooq.com with no KV behind it. Read
 * from `import.meta.env` rather than from @ui/data/quotes so this module keeps
 * the state layer's one-way dependency on core/ and pulls in no provider chain.
 */
export function syncServerBase(): string | null {
  const override = typeof window !== 'undefined' ? window.__TEST_SYNC_BASE__ : undefined
  if (typeof override === 'string' && override.trim() !== '') {
    return `${override.trim().replace(/\/+$/, '')}/sync`
  }
  const base = (import.meta.env.VITE_QUOTE_PROXY ?? '').trim()
  if (base === '' || base.startsWith('/')) return null
  return `${base.replace(/\/+$/, '')}/sync`
}

export function isSyncConfigured(): boolean {
  return syncServerBase() !== null
}

// ── Status, for the Home dot and the picker ──────────────────────────────────

export type SyncStatus =
  /** No worker origin — the owner has not deployed it yet. */
  | 'unconfigured'
  /** Configured, but this profile has not opted in. */
  | 'off'
  /** A request is in flight. */
  | 'syncing'
  /** Everything local has been accepted by the server. */
  | 'synced'
  /** Local changes are waiting for the debounce (or for the network). */
  | 'pending'
  /** The last attempt could not reach the server. Changes are safe locally. */
  | 'offline'
  /** The server said no — a wrong code, or a blob it refused. */
  | 'error'

export interface SyncUiState {
  status: SyncStatus
  /** Epoch ms of the last successful push or pull, or null. */
  lastSyncedAt: number | null
  message: string | null
}

export const useSyncStore = create<SyncUiState>(() => ({
  status: isSyncConfigured() ? 'off' : 'unconfigured',
  lastSyncedAt: null,
  message: null,
}))

function setStatus(status: SyncStatus, message: string | null = null): void {
  useSyncStore.setState({ status, message })
}

function noteSynced(at: number): void {
  useSyncStore.setState({ status: 'synced', lastSyncedAt: at, message: null })
}

/** Map a typed engine failure onto the badge the UI shows. */
function noteFailure(failure: SyncFailure): void {
  setStatus(failure.kind === 'offline' ? 'offline' : 'error', failure.message)
}

/**
 * The shared status describes the *signed-in* profile, because that is what the
 * Home chip's dot sits next to. The picker can act on any of the five, so an
 * enable or an unlink over there must not repaint the dot for someone else.
 */
function isActive(id: string): boolean {
  return useProfilesStore.getState().meta.activeId === id
}

// ── Tokens ───────────────────────────────────────────────────────────────────

function browserRandomBytes(into: Uint8Array): void {
  crypto.getRandomValues(into)
}

export function newSyncToken(): string {
  return generateSyncToken(browserRandomBytes)
}

// ── Engines ──────────────────────────────────────────────────────────────────

/**
 * An engine bound to one profile's namespace, or null when sync cannot run for
 * it (no worker configured, or the profile never opted in).
 *
 * Deliberately not memoised: profiles are switched by a full page reload, so
 * there is at most one live engine per load anyway, and a fresh object per call
 * means a token change can never be served stale.
 */
export function engineFor(profile: Profile | undefined): SyncEngine | null {
  const base = syncServerBase()
  if (!base || !profile?.sync?.token) return null
  return createSyncEngine({
    fetchFn: (url, init) => fetch(url, init),
    baseUrl: base,
    token: profile.sync.token,
    storage: namespacedStorage(rawStorage, profile.id),
    keys: [...SYNC_KEYS],
    now: () => Date.now(),
  })
}

/** An engine for a token that has no local profile yet — the link-a-device path. */
function probeEngine(token: string, profileId: string): SyncEngine | null {
  const base = syncServerBase()
  if (!base) return null
  return createSyncEngine({
    fetchFn: (url, init) => fetch(url, init),
    baseUrl: base,
    token,
    storage: namespacedStorage(rawStorage, profileId),
    keys: [...SYNC_KEYS],
    now: () => Date.now(),
  })
}

function activeEngine(): SyncEngine | null {
  return engineFor(activeProfile(useProfilesStore.getState().meta))
}

// ── The profileMeta blob ─────────────────────────────────────────────────────

export interface ProfileMetaBlob {
  name: string
  emoji: string
}

function readMetaBlob(raw: unknown): ProfileMetaBlob | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<ProfileMetaBlob>
  if (typeof r.name !== 'string' || typeof r.emoji !== 'string') return null
  const name = r.name.trim()
  return name === '' ? null : { name, emoji: r.emoji || DEFAULT_EMOJI }
}

/**
 * Mirror {name, emoji} into the profile's namespace so the engine can treat it
 * as just another blob. The registry stays the source of truth locally; this is
 * the copy that travels.
 */
async function writeMetaBlob(profile: Profile): Promise<void> {
  const storage = namespacedStorage(rawStorage, profile.id)
  await storage.set<ProfileMetaBlob>(PROFILE_META_BLOB, {
    name: profile.name,
    emoji: profile.emoji,
  })
}

/**
 * Called by the picker after a rename or an avatar change.
 *
 * Pushed straight away rather than through the debounce: the picker can edit any
 * of the five profiles, and the debounced flush only ever pushes the signed-in
 * one. A failure is swallowed — the key stays dirty and the next sync sends it.
 */
export async function noteProfileIdentityChanged(id: string): Promise<void> {
  const profile = useProfilesStore.getState().meta.profiles.find((p) => p.id === id)
  if (!profile?.sync) return
  await writeMetaBlob(profile)
  const engine = engineFor(profile)
  if (!engine) return
  await engine.markDirty(PROFILE_META_BLOB)
  await engine.pushKey(PROFILE_META_BLOB)
}

/** Apply a pulled profileMeta blob to the local registry. */
async function applyPulledMeta(profile: Profile): Promise<void> {
  const storage = namespacedStorage(rawStorage, profile.id)
  const blob = readMetaBlob(await storage.get<unknown>(PROFILE_META_BLOB))
  if (!blob) return
  if (blob.name === profile.name && blob.emoji === profile.emoji) return
  const store = useProfilesStore.getState()
  await store.rename(profile.id, blob.name)
  await store.setEmoji(profile.id, blob.emoji)
}

// ── Push scheduling ──────────────────────────────────────────────────────────

let pushTimer: ReturnType<typeof setTimeout> | null = null
let pushInFlight: Promise<void> | null = null

function clearPushTimer(): void {
  if (pushTimer === null) return
  clearTimeout(pushTimer)
  pushTimer = null
}

/**
 * Coalesce a burst of writes into one push.
 *
 * Completing a lesson writes four keys in the same turn and a review session
 * writes two per graded card; without this the app would spend a round trip per
 * key. Three seconds is short enough that closing the tab straight after an
 * action still lands (the tab-hide flush below covers the rest) and long enough
 * that a fast reviewer pushes once per session, not once per card.
 */
export function schedulePush(): void {
  if (!activeEngine()) return
  setStatus('pending')
  clearPushTimer()
  pushTimer = setTimeout(() => {
    pushTimer = null
    void flushPush()
  }, PUSH_DEBOUNCE_MS)
}

/** Push everything dirty right now. Safe to call when nothing is. */
export async function flushPush(): Promise<void> {
  clearPushTimer()
  if (pushInFlight) return pushInFlight
  const engine = activeEngine()
  if (!engine) return

  pushInFlight = (async () => {
    const dirty = await engine.dirtyKeys()
    if (dirty.length === 0) {
      const led = await engine.ledger()
      useSyncStore.setState({ status: 'synced', lastSyncedAt: led.lastPushedAt ?? led.lastPulledAt })
      return
    }
    setStatus('syncing')
    const out = await engine.pushDirty()
    if (isSyncFailure(out)) {
      noteFailure(out)
      return
    }
    noteSynced(Date.now())
  })().finally(() => {
    pushInFlight = null
  })
  return pushInFlight
}

// ── Boot ─────────────────────────────────────────────────────────────────────

let started = false

/**
 * Wire sync for the signed-in profile. Called once per page load, *after* the
 * store has hydrated — pulling into storage the store has not read yet would
 * mean the first render shows the old values and nothing tells it otherwise.
 *
 * Order matters and is worth stating: pull first, then register the write hook.
 * Registering first would mark every key the rehydrate touches as dirty and
 * bounce the pulled state straight back at the server.
 */
export async function initProfileSync(): Promise<void> {
  if (started) return
  started = true

  if (!isSyncConfigured()) {
    setStatus('unconfigured')
    return
  }
  const profile = activeProfile(useProfilesStore.getState().meta)
  const engine = engineFor(profile)
  if (!engine || !profile) {
    setStatus('off')
    return
  }

  setStatus('syncing')
  const pulled = await engine.pullAll()
  if (isSyncFailure(pulled)) {
    noteFailure(pulled)
  } else {
    if (pulled.updated.includes(PROFILE_META_BLOB)) await applyPulledMeta(profile)
    // Only the store's own keys warrant a rehydrate; a changed profileMeta is
    // already live in the registry.
    if (pulled.updated.some((k) => k !== PROFILE_META_BLOB)) {
      await useAppStore.getState().hydrate(true)
    }
    noteSynced(Date.now())
  }

  onPersist((key) => {
    void engine.markDirty(key).then(schedulePush)
  })

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void flushPush()
    })
  }
  if (typeof window !== 'undefined') {
    // Safari on iOS often never fires visibilitychange on a swipe-away.
    window.addEventListener('pagehide', () => {
      void flushPush()
    })
  }

  // Whatever the pull left behind (or a write that raced it) goes out now
  // rather than waiting for the next mutation.
  void flushPush()
}

// ── Owner actions, driven from the picker ────────────────────────────────────

export type SyncActionResult =
  /** Epoch ms the action completed, so the panel can say "just now" for the
      profile it is editing even when that is not the signed-in one. */
  | { ok: true; at: number }
  | { ok: false; message: string }

function failed(f: SyncFailure): SyncActionResult {
  return { ok: false, message: f.message }
}

/**
 * Turn sync on for a profile: mint a code, claim it on the server by uploading
 * everything the profile has, and remember it locally.
 *
 * The upload is not optional and not deferred. A code that has never been PUT
 * does not exist as far as the worker is concerned, so "enable, read the code
 * aloud, type it on the tablet" would fail at the last step. Claiming it here
 * also means the token is bound to this owner before it is ever displayed.
 */
export async function enableSync(id: string): Promise<SyncActionResult> {
  if (!isSyncConfigured()) return { ok: false, message: 'No sync server is configured.' }
  const store = useProfilesStore.getState()
  const profile = store.meta.profiles.find((p) => p.id === id)
  if (!profile) return { ok: false, message: 'That profile no longer exists.' }

  const sync: ProfileSync = { token: newSyncToken(), enabledAt: appClock.now() }
  const linked: Profile = { ...profile, sync }
  await writeMetaBlob(linked)

  const engine = engineFor(linked)
  if (!engine) return { ok: false, message: 'No sync server is configured.' }

  const live = isActive(id)
  if (live) setStatus('syncing')
  for (const key of SYNC_KEYS) await engine.markDirty(key)
  const out = await engine.pushDirty()
  if (isSyncFailure(out)) {
    if (live) noteFailure(out)
    return failed(out)
  }

  // Recorded only after the server has the data: a token in the registry that
  // the worker has never seen would show the owner a code that does not work.
  await store.setSync(id, sync)
  const at = Date.now()
  if (live) noteSynced(at)
  return { ok: true, at }
}

/** Push whatever is dirty and pull whatever is newer, on demand. */
export async function syncNow(id?: string): Promise<SyncActionResult> {
  const meta = useProfilesStore.getState().meta
  const profile = id ? meta.profiles.find((p) => p.id === id) : activeProfile(meta)
  const engine = engineFor(profile)
  if (!engine || !profile) return { ok: false, message: 'Sync is not on for this profile.' }

  const live = isActive(profile.id)
  if (live) setStatus('syncing')
  const pushed = await engine.pushDirty()
  if (isSyncFailure(pushed)) {
    if (live) noteFailure(pushed)
    return failed(pushed)
  }
  const pulled = await engine.pullAll()
  if (isSyncFailure(pulled)) {
    if (live) noteFailure(pulled)
    return failed(pulled)
  }
  if (pulled.updated.includes(PROFILE_META_BLOB)) await applyPulledMeta(profile)
  // Only the signed-in profile's state is in the store; another slot's pulled
  // keys are simply sitting in its namespace for the next time it is opened.
  if (pulled.updated.some((k) => k !== PROFILE_META_BLOB) && live) {
    await useAppStore.getState().hydrate(true)
  }
  const at = Date.now()
  if (live) noteSynced(at)
  return { ok: true, at }
}

/**
 * Stop syncing this device. The local profile keeps every byte it has and the
 * cloud copy is left alone, so another device linked to the same code carries
 * on untouched — and re-entering the code here re-links.
 */
export async function unlinkSync(id: string): Promise<SyncActionResult> {
  const live = isActive(id)
  await useProfilesStore.getState().setSync(id, null)
  if (live) {
    // Persistence carries on unchanged; only the cloud leg stops. The hook is
    // left registered so nothing has to re-enter hydrate() — a markDirty on an
    // unlinked profile is written to a ledger nobody reads until it re-links.
    setStatus('off')
  }
  return { ok: true, at: Date.now() }
}

/**
 * Delete the cloud copy and unlink. Every other device linked to this code will
 * find nothing on its next pull; none of them lose their local data, and none of
 * them can get it back from the server.
 */
export async function deleteCloudCopy(id: string): Promise<SyncActionResult> {
  const profile = useProfilesStore.getState().meta.profiles.find((p) => p.id === id)
  const engine = engineFor(profile)
  if (!engine) return unlinkSync(id)

  const live = isActive(id)
  if (live) setStatus('syncing')
  const out = await engine.deleteRemote()
  if (isSyncFailure(out)) {
    if (live) noteFailure(out)
    return failed(out)
  }
  return unlinkSync(id)
}

// ── Linking a second device ──────────────────────────────────────────────────

export type LinkResult =
  | { ok: true; profile: Profile }
  | { ok: false; message: string }

/**
 * Take a code typed on this device and turn it into a local profile holding the
 * same state.
 *
 * The order is deliberately paranoid: validate the code's shape, ask the server
 * whether anything is there at all, only then take a profile slot. A typo must
 * not leave an empty stranger in the picker.
 */
export async function linkFromCode(raw: string): Promise<LinkResult> {
  if (!isSyncConfigured()) return { ok: false, message: 'No sync server is configured.' }
  const token = normalizeSyncCode(raw)
  if (!isSyncToken(token)) {
    return { ok: false, message: 'That code is not 20 characters. Check it and try again.' }
  }

  const store = useProfilesStore.getState()
  let meta: ProfilesMeta = store.meta
  if (meta.profiles.some((p) => p.sync?.token === token)) {
    return { ok: false, message: 'This device is already linked to that code.' }
  }
  if (!canCreateProfile(meta)) {
    return { ok: false, message: 'All five profile slots are full. Delete one first.' }
  }

  // Ask before committing. `p1`'s namespace is not touched by this — the probe
  // engine only reads the network — but it has to be given *some* id.
  const probe = probeEngine(token, meta.profiles[0]?.id ?? 'p1')
  if (!probe) return { ok: false, message: 'No sync server is configured.' }

  const manifest = await probe.fetchManifest()
  if (isSyncFailure(manifest)) {
    return {
      ok: false,
      message:
        manifest.kind === 'auth'
          ? 'No profile found for that code. Check it and try again.'
          : manifest.message,
    }
  }
  if (Object.keys(manifest.manifest).length === 0) {
    return { ok: false, message: 'That code has no profile stored yet.' }
  }

  // Name the slot from the cloud copy when it carries one, so the picker shows
  // "Greg", not "Player 2", the moment the profile appears.
  const remoteMeta = await probe.fetchKey(PROFILE_META_BLOB)
  const identity =
    !isSyncFailure(remoteMeta) && remoteMeta.found ? readMetaBlob(remoteMeta.data) : null

  const now = appClock.now()
  const created = createProfile(
    meta,
    { name: identity?.name ?? 'Synced', emoji: identity?.emoji ?? DEFAULT_EMOJI },
    now,
  )
  const sync: ProfileSync = { token, enabledAt: now }
  meta = setProfileSync(created.meta, created.profile.id, sync)
  await saveProfilesMeta(rawStorage, meta)
  useProfilesStore.setState({ meta })

  const profile: Profile = { ...created.profile, sync }
  const engine = engineFor(profile)
  if (!engine) return { ok: false, message: 'No sync server is configured.' }
  const pulled = await engine.pullAll()
  if (isSyncFailure(pulled)) {
    // The slot is already taken and named; leaving it is friendlier than
    // deleting it, and the next "Sync now" fills it in.
    noteFailure(pulled)
    return { ok: false, message: pulled.message }
  }
  await applyPulledMeta(profile)
  noteSynced(Date.now())

  const refreshed =
    useProfilesStore.getState().meta.profiles.find((p) => p.id === profile.id) ?? profile
  return { ok: true, profile: refreshed }
}
