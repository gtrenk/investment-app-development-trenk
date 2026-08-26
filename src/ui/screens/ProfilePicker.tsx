// ─── Who's playing? ──────────────────────────────────────────────────────────
// The first screen of every cold start. Renders before the app store hydrates —
// it reads only the profile registry, so there is nothing to wait for.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MAX_PROFILES,
  canCreateProfile,
  nameError,
  NAME_MAX_LEN,
} from '@core/storage/profiles'
import type { Profile } from '@core/storage/profiles'
import {
  DEFAULT_EMOJI,
  PROFILE_EMOJI,
  enterProfile,
  useProfilesStore,
} from '@state/profiles'
import { isSyncConfigured, noteProfileIdentityChanged } from '@state/sync'
import { CloudSyncSection, LinkDeviceForm } from '@ui/components/CloudSync'
import { PaceSection } from '@ui/components/PaceSection'
import { ReadAloudSection } from '@ui/components/ReadAloudSection'

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; profile: Profile }
  | { kind: 'confirm-delete'; profile: Profile }
  | { kind: 'link' }

/** Tap grid of avatars — 12 glyphs, no OS emoji keyboard involved. */
function EmojiGrid({ value, onPick }: { value: string; onPick: (e: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2" data-testid="emoji-grid">
      {PROFILE_EMOJI.map((e) => (
        <button
          key={e}
          type="button"
          data-testid="emoji-option"
          data-emoji={e}
          aria-label={`Avatar ${e}`}
          aria-pressed={e === value}
          onClick={() => onPick(e)}
          className={`flex h-11 min-h-[44px] items-center justify-center rounded-xl border text-xl active:bg-slate-800 ${
            e === value
              ? 'border-emerald-400 bg-emerald-400/10'
              : 'border-slate-800 bg-slate-900/70'
          }`}
        >
          <span aria-hidden>{e}</span>
        </button>
      ))}
    </div>
  )
}

function NameField({
  value,
  onChange,
  onSubmit,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
}) {
  return (
    <input
      data-testid="profile-name-input"
      autoFocus
      value={value}
      maxLength={NAME_MAX_LEN}
      placeholder="Name"
      aria-label="Profile name"
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSubmit()
      }}
      className="min-h-[48px] w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 text-base text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
    />
  )
}

/** One saved profile: avatar, name, and a level/streak line read from its keys. */
function ProfileCard({
  profile,
  onEnter,
  onEdit,
}: {
  profile: Profile
  onEnter: () => void
  onEdit: () => void
}) {
  const preview = useProfilesStore((s) => s.previews[profile.id])
  const loadPreview = useProfilesStore((s) => s.loadPreview)

  useEffect(() => {
    void loadPreview(profile.id)
  }, [loadPreview, profile.id])

  const summary = !preview
    ? '…'
    : preview.xp === 0
      ? 'New player'
      : `Level ${preview.level} · ${preview.xp} XP${preview.streak > 0 ? ` · 🔥 ${preview.streak}` : ''}`

  return (
    <li className="flex items-stretch gap-2" data-testid="profile-card" data-profile={profile.id}>
      <button
        type="button"
        data-testid="profile-enter"
        onClick={onEnter}
        className="flex min-h-[68px] flex-1 items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-left active:bg-slate-800/70"
      >
        <span aria-hidden className="text-3xl leading-none">
          {profile.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="block truncate text-base font-bold text-white"
            data-testid="profile-name"
          >
            {profile.name}
          </span>
          <span className="block truncate text-xs text-slate-500" data-testid="profile-summary">
            {summary}
          </span>
        </span>
        <span aria-hidden className="shrink-0 text-slate-600">
          →
        </span>
      </button>
      <button
        type="button"
        data-testid="profile-edit"
        aria-label={`Edit ${profile.name}`}
        onClick={onEdit}
        className="flex min-h-[44px] w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 text-slate-400 active:bg-slate-800/70"
      >
        <span aria-hidden>✏️</span>
      </button>
    </li>
  )
}

export function ProfilePicker() {
  const navigate = useNavigate()
  const meta = useProfilesStore((s) => s.meta)
  const create = useProfilesStore((s) => s.create)
  const rename = useProfilesStore((s) => s.rename)
  const setEmoji = useProfilesStore((s) => s.setEmoji)
  const remove = useProfilesStore((s) => s.remove)

  const [mode, setMode] = useState<Mode>({ kind: 'list' })
  const [name, setName] = useState('')
  const [emoji, setEmojiDraft] = useState<string>(DEFAULT_EMOJI)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const freeSlots = MAX_PROFILES - meta.profiles.length

  function openCreate() {
    setName('')
    setEmojiDraft(DEFAULT_EMOJI)
    setError(null)
    setMode({ kind: 'create' })
  }

  function openEdit(profile: Profile) {
    setName(profile.name)
    setEmojiDraft(profile.emoji)
    setError(null)
    setMode({ kind: 'edit', profile })
  }

  function backToList() {
    setError(null)
    setMode({ kind: 'list' })
  }

  async function submitCreate() {
    const invalid = nameError(name)
    if (invalid) return setError(invalid)
    setBusy(true)
    const profile = await create(name, emoji)
    await enterProfile(profile.id)
  }

  async function submitEdit(profile: Profile) {
    const invalid = nameError(name)
    if (invalid) return setError(invalid)
    await rename(profile.id, name)
    await setEmoji(profile.id, emoji)
    // The name and avatar travel with the profile, so a rename here has to
    // reach the other device too. No-op when this profile is not synced.
    await noteProfileIdentityChanged(profile.id)
    backToList()
  }

  async function confirmDelete(profile: Profile) {
    setBusy(true)
    await remove(profile.id)
    setBusy(false)
    backToList()
  }

  // ── Create / edit form ─────────────────────────────────────────────────────
  if (mode.kind === 'create' || mode.kind === 'edit') {
    const editing = mode.kind === 'edit' ? mode.profile : null
    return (
      <div className="safe-top mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8">
        <header className="flex shrink-0 items-center gap-2 py-3">
          <button
            type="button"
            data-testid="profile-back"
            aria-label="Back"
            onClick={backToList}
            className="flex h-11 w-11 min-h-[44px] items-center justify-center rounded-full text-slate-400 active:bg-slate-800"
          >
            <span aria-hidden>←</span>
          </button>
          <h1 className="text-lg font-bold text-white">
            {editing ? 'Edit profile' : 'New profile'}
          </h1>
        </header>

        {/* Centred between the header and the bottom of the phone, so the form
            sits under the thumb instead of stranded at the top of the screen.
            Editing adds the cloud-sync panel below, which is taller than the
            viewport — that one scrolls from the top instead. */}
        <div
          className={`flex flex-1 flex-col gap-6 pb-8 ${editing ? 'justify-start pt-2' : 'justify-center'}`}
        >
          <div className="flex flex-col items-center">
            <span aria-hidden className="text-6xl leading-none" data-testid="profile-preview-emoji">
              {emoji}
            </span>
          </div>

          <div className="space-y-4">
            <NameField
              value={name}
              onChange={(v) => {
                setName(v)
                setError(null)
              }}
              onSubmit={() => void (editing ? submitEdit(editing) : submitCreate())}
            />
            <EmojiGrid value={emoji} onPick={setEmojiDraft} />
            {error && (
              <p data-testid="profile-error" className="text-sm text-rose-400">
                {error}
              </p>
            )}
            <button
              type="button"
              data-testid="profile-save"
              disabled={busy}
              onClick={() => void (editing ? submitEdit(editing) : submitCreate())}
              className="min-h-[52px] w-full rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400 disabled:opacity-60"
            >
              {editing ? 'Save' : 'Start playing'}
            </button>
          </div>

          {/* Pace and read aloud first, then sync, then "Delete": the one
              irreversible button on the screen stays at the very bottom, where
              a thumb scrolling the panels cannot reach it by accident. */}
          {editing && <PaceSection profile={editing} isActive={editing.id === meta.activeId} />}

          {editing && <ReadAloudSection profile={editing} isActive={editing.id === meta.activeId} />}

          {/* Only for the signed-in profile: the test writes through the app
              store, which is pointed at whoever is signed in — offering it while
              editing someone else would credit the wrong learner. */}
          {editing && editing.id === meta.activeId && (
            <button
              type="button"
              data-testid="placement-row"
              onClick={() => navigate('/placement')}
              className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-left active:bg-slate-800/70"
            >
              <span aria-hidden className="shrink-0 text-xl leading-none">
                🎯
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-100">Placement test</span>
                <span className="block text-[11px] leading-relaxed text-slate-500">
                  Test out of units you already know. Retaking only ever adds — nothing already
                  studied is taken back.
                </span>
              </span>
              <span aria-hidden className="shrink-0 text-slate-600">
                →
              </span>
            </button>
          )}

          {editing && <CloudSyncSection profile={editing} />}

          {editing && (
            <button
              type="button"
              data-testid="profile-delete"
              onClick={() => setMode({ kind: 'confirm-delete', profile: editing })}
              className="min-h-[48px] w-full rounded-2xl border border-rose-900/70 px-5 text-sm font-semibold text-rose-400 active:bg-rose-950/40"
            >
              Delete this profile
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Link from another device ───────────────────────────────────────────────
  if (mode.kind === 'link') {
    return (
      <LinkDeviceForm
        onCancel={backToList}
        onLinked={(id) => {
          // Straight in, like finishing "New profile": the whole point of the
          // code was to get at this profile, and it is already fully pulled.
          void enterProfile(id)
        }}
      />
    )
  }

  // ── Delete confirmation ────────────────────────────────────────────────────
  if (mode.kind === 'confirm-delete') {
    const p = mode.profile
    return (
      <div
        className="safe-top mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 pb-8"
        data-testid="profile-delete-confirm"
      >
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-6">
          <p aria-hidden className="text-center text-5xl leading-none">
            {p.emoji}
          </p>
          <h1 className="mt-4 text-center text-lg font-bold text-white">Delete {p.name}?</h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-400">
            This erases {p.name}’s XP, streak and badges, every lesson and review card, the drill
            history, and the paper portfolio with its orders and watchlist. It cannot be undone.
          </p>
          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              data-testid="profile-delete-confirm-btn"
              disabled={busy}
              onClick={() => void confirmDelete(p)}
              className="min-h-[52px] w-full rounded-2xl bg-rose-600 px-5 font-bold text-white active:bg-rose-500 disabled:opacity-60"
            >
              Delete forever
            </button>
            <button
              type="button"
              data-testid="profile-delete-cancel"
              onClick={() => openEdit(p)}
              className="min-h-[48px] w-full rounded-2xl border border-slate-700 px-5 font-semibold text-slate-200 active:bg-slate-800"
            >
              Keep it
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── The list ───────────────────────────────────────────────────────────────
  return (
    <div
      className="safe-top mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8"
      data-testid="profile-picker"
    >
      <header className="pb-6 text-center">
        <p aria-hidden className="text-4xl leading-none">
          📈
        </p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-slate-500">TickerQuest</p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white">Who’s playing?</h1>
        <p className="mt-1 text-sm text-slate-500">
          {meta.profiles.length === 0
            ? 'Create a profile to start your streak.'
            : `${freeSlots} of ${MAX_PROFILES} slots free`}
        </p>
      </header>

      <ul className="space-y-2.5">
        {meta.profiles.map((p) => (
          <ProfileCard
            key={p.id}
            profile={p}
            onEnter={() => void enterProfile(p.id)}
            onEdit={() => openEdit(p)}
          />
        ))}

        {canCreateProfile(meta) && (
          <li>
            <button
              type="button"
              data-testid="profile-new"
              onClick={openCreate}
              className="flex min-h-[68px] w-full items-center gap-3.5 rounded-2xl border border-dashed border-slate-700 px-4 py-3 text-left text-slate-400 active:bg-slate-800/50"
            >
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 text-xl"
              >
                +
              </span>
              <span className="text-base font-semibold">New profile</span>
            </button>
          </li>
        )}
      </ul>

      {/* Only offered when there is a server to ask and a slot to fill — a
          disabled entry that explains a Cloudflare deploy belongs in the edit
          view, not on the first screen of a cold start. */}
      {isSyncConfigured() && canCreateProfile(meta) && (
        <button
          type="button"
          data-testid="profile-link-device"
          onClick={() => setMode({ kind: 'link' })}
          className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 text-sm font-semibold text-slate-300 active:bg-slate-800/60"
        >
          <span aria-hidden>☁️</span>
          Link from another device
        </button>
      )}

      {meta.activeId && (
        <button
          type="button"
          data-testid="profile-cancel"
          onClick={() => navigate('/')}
          className="mt-6 min-h-[44px] w-full text-sm font-medium text-slate-500 active:text-slate-300"
        >
          Never mind — back to TickerQuest
        </button>
      )}
    </div>
  )
}
