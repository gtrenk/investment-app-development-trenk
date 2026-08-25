// ─── Cloud sync UI ───────────────────────────────────────────────────────────
// Two pieces, both living inside the profile picker:
//
//   <CloudSyncSection>  the per-profile panel in the edit view
//   <LinkDeviceForm>    "I already have a code" on the picker's main screen
//
// The whole feature is one string the owner carries between devices, so the
// screen's job is mostly typography: make the code readable at arm's length,
// make it obvious it is a password, and keep the two destructive buttons far
// apart in weight from each other ("unlink" is reversible, "delete cloud copy"
// is not).

import { useState } from 'react'
import {
  SYNC_TOKEN_LENGTH,
  formatSyncCode,
  maskSyncCode,
  normalizeSyncCode,
} from '@core/sync/code'
import type { Profile } from '@core/storage/profiles'
import { useProfilesStore } from '@state/profiles'
import {
  deleteCloudCopy,
  enableSync,
  isSyncConfigured,
  linkFromCode,
  syncNow,
  unlinkSync,
  useSyncStore,
} from '@state/sync'
import type { SyncActionResult } from '@state/sync'

// ── Bits ─────────────────────────────────────────────────────────────────────

/**
 * One line, five dashed groups of four. Monospace at `text-lg` is the largest
 * size where all 24 glyphs still fit across a 390 px phone without wrapping —
 * and a code that wraps mid-group is a code someone reads out wrong.
 *
 * `select-all` so one tap selects the whole thing, for the times the clipboard
 * button is unavailable (insecure origin, in-app browser).
 */
function CodeBlock({ token, masked }: { token: string; masked: boolean }) {
  return (
    <div
      data-testid="sync-code"
      data-masked={masked}
      className="select-all overflow-x-auto rounded-xl bg-slate-950 px-2 py-3 text-center font-mono text-lg font-bold text-emerald-300"
    >
      {masked ? maskSyncCode(token) : formatSyncCode(token)}
    </div>
  )
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Clipboard access is blocked on insecure origins and in some in-app
    // browsers. The code is on screen either way, so this is not an error.
    return false
  }
}

function relativeTime(at: number | null): string {
  if (at === null) return 'not yet'
  const secs = Math.max(0, Math.round((Date.now() - at) / 1000))
  if (secs < 45) return 'just now'
  const mins = Math.round(secs / 60)
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} h ago`
  return new Date(at).toLocaleDateString()
}

const PANEL = 'rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4'

function Heading() {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Cloud sync</h2>
  )
}

// ── The per-profile panel ────────────────────────────────────────────────────

export function CloudSyncSection({ profile }: { profile: Profile }) {
  // Read through the store rather than the prop: enabling sync rewrites the
  // registry, and the panel has to redraw as the new state, not the old one.
  const live = useProfilesStore((s) => s.meta.profiles.find((p) => p.id === profile.id)) ?? profile
  const globalSyncedAt = useSyncStore((s) => s.lastSyncedAt)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [justEnabled, setJustEnabled] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  // The shared store tracks the *signed-in* profile; the picker can be editing
  // any of the five, so an action here reports its own time.
  const [actedAt, setActedAt] = useState<number | null>(null)

  const lastSyncedAt = actedAt ?? globalSyncedAt

  async function run(action: () => Promise<SyncActionResult>): Promise<boolean> {
    setBusy(true)
    setError(null)
    const out = await action()
    setBusy(false)
    if (!out.ok) {
      setError(out.message)
      return false
    }
    setActedAt(out.at)
    return true
  }

  // ── No worker ──
  if (!isSyncConfigured()) {
    return (
      <section className={PANEL} data-testid="sync-section" data-sync-state="unconfigured">
        <Heading />
        <p className="mt-2 text-sm leading-relaxed text-slate-400" data-testid="sync-unconfigured">
          Not set up yet. Cloud sync needs the TickerQuest worker deployed to Cloudflare — until
          then every profile lives on this device only.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Setup is two commands and a repo variable: see <span className="font-mono">DEPLOY.md</span>{' '}
          §3.
        </p>
      </section>
    )
  }

  // ── Off ──
  if (!live.sync) {
    return (
      <section className={PANEL} data-testid="sync-section" data-sync-state="off">
        <Heading />
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Play {live.name} on another phone or tablet. Turning sync on gives you a code — type it
          on the other device and both share the same XP, streak, reviews and portfolio.
        </p>
        {error && (
          <p data-testid="sync-error" className="mt-3 text-sm text-rose-400">
            {error}
          </p>
        )}
        <button
          type="button"
          data-testid="sync-enable"
          disabled={busy}
          onClick={() =>
            void run(() => enableSync(live.id)).then((ok) => {
              if (!ok) return
              setJustEnabled(true)
              setRevealed(true)
            })
          }
          className="mt-4 min-h-[48px] w-full rounded-2xl border border-emerald-500/60 bg-emerald-500/10 px-5 font-bold text-emerald-300 active:bg-emerald-500/20 disabled:opacity-60"
        >
          {busy ? 'Setting up…' : 'Enable sync'}
        </button>
      </section>
    )
  }

  // ── On ──
  const token = live.sync.token
  return (
    <section className={PANEL} data-testid="sync-section" data-sync-state="on">
      <div className="flex items-center justify-between">
        <Heading />
        <span className="text-xs font-semibold text-emerald-400">On</span>
      </div>

      {justEnabled && (
        <p className="mt-2 text-sm font-semibold text-emerald-300" data-testid="sync-just-enabled">
          Sync is on. Here is {live.name}’s code.
        </p>
      )}

      <div className="mt-3">
        <CodeBlock token={token} masked={!revealed} />
      </div>

      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          data-testid="sync-reveal"
          onClick={() => setRevealed((r) => !r)}
          className="min-h-[44px] flex-1 rounded-xl border border-slate-700 text-sm font-semibold text-slate-200 active:bg-slate-800"
        >
          {revealed ? 'Hide' : 'Show code'}
        </button>
        <button
          type="button"
          data-testid="sync-copy"
          onClick={() => void copyToClipboard(token).then(setCopied)}
          className="min-h-[44px] flex-1 rounded-xl border border-slate-700 text-sm font-semibold text-slate-200 active:bg-slate-800"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-400" data-testid="sync-code-hint">
        On your other device, open TickerQuest → <b className="text-slate-300">Link from another
        device</b> and enter this code.
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-amber-500/90">
        Treat it like a password: anyone who has it can read and overwrite this profile.
      </p>

      {error && (
        <p data-testid="sync-error" className="mt-3 text-sm text-rose-400">
          {error}
        </p>
      )}

      <button
        type="button"
        data-testid="sync-now"
        disabled={busy}
        onClick={() => void run(() => syncNow(live.id))}
        className="mt-4 min-h-[48px] w-full rounded-2xl border border-slate-700 px-5 font-semibold text-slate-100 active:bg-slate-800 disabled:opacity-60"
      >
        {busy ? 'Syncing…' : 'Sync now'}
      </button>
      <p className="mt-1.5 text-center text-xs text-slate-500" data-testid="sync-last">
        Last synced {relativeTime(lastSyncedAt)}
      </p>

      <div className="mt-5 space-y-2 border-t border-slate-800 pt-4">
        <button
          type="button"
          data-testid="sync-unlink"
          disabled={busy}
          onClick={() => void run(() => unlinkSync(live.id))}
          className="min-h-[44px] w-full rounded-xl border border-slate-700 text-sm font-semibold text-slate-300 active:bg-slate-800 disabled:opacity-60"
        >
          Unlink this device
        </button>
        <p className="text-center text-[11px] leading-relaxed text-slate-600">
          Keeps everything here and leaves the cloud copy for your other devices.
        </p>

        {confirmingDelete ? (
          <div data-testid="sync-delete-confirm" className="rounded-xl border border-rose-900/70 p-3">
            <p className="text-xs leading-relaxed text-rose-300">
              Delete the cloud copy? Every other device linked to this code stops syncing and keeps
              only what it already has. This cannot be undone.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                data-testid="sync-delete-cloud-confirm"
                disabled={busy}
                onClick={() => void run(() => deleteCloudCopy(live.id))}
                className="min-h-[44px] flex-1 rounded-xl bg-rose-600 text-sm font-bold text-white active:bg-rose-500 disabled:opacity-60"
              >
                Delete
              </button>
              <button
                type="button"
                data-testid="sync-delete-cloud-cancel"
                onClick={() => setConfirmingDelete(false)}
                className="min-h-[44px] flex-1 rounded-xl border border-slate-700 text-sm font-semibold text-slate-200 active:bg-slate-800"
              >
                Keep it
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            data-testid="sync-delete-cloud"
            onClick={() => setConfirmingDelete(true)}
            className="min-h-[44px] w-full text-sm font-semibold text-rose-400/90 active:text-rose-300"
          >
            Delete cloud copy
          </button>
        )}
      </div>
    </section>
  )
}

// ── "I already have a code" ──────────────────────────────────────────────────

export function LinkDeviceForm({
  onLinked,
  onCancel,
}: {
  onLinked: (profileId: string) => void
  onCancel: () => void
}) {
  const [raw, setRaw] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const normalized = normalizeSyncCode(raw)
  const complete = normalized.length === SYNC_TOKEN_LENGTH

  async function submit(): Promise<void> {
    setBusy(true)
    setError(null)
    const out = await linkFromCode(raw)
    setBusy(false)
    if (!out.ok) return setError(out.message)
    onLinked(out.profile.id)
  }

  return (
    <div
      className="safe-top mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8"
      data-testid="sync-link-screen"
    >
      <header className="flex shrink-0 items-center gap-2 py-3">
        <button
          type="button"
          data-testid="sync-link-back"
          aria-label="Back"
          onClick={onCancel}
          className="flex h-11 w-11 min-h-[44px] items-center justify-center rounded-full text-slate-400 active:bg-slate-800"
        >
          <span aria-hidden>←</span>
        </button>
        <h1 className="text-lg font-bold text-white">Link from another device</h1>
      </header>

      <div className="flex flex-1 flex-col justify-center gap-5 pb-10">
        <div className="text-center">
          <p aria-hidden className="text-5xl leading-none">
            ☁️
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            On the device that already has the profile: <b className="text-slate-300">Edit profile
            → Cloud sync</b>. Type the 20-character code it shows here.
          </p>
        </div>

        <div>
          <input
            data-testid="sync-code-input"
            autoFocus
            value={raw}
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder="ABCD-EFGH-JKMN-PQRS-TVWX"
            aria-label="Sync code"
            onChange={(e) => {
              setRaw(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && complete) void submit()
            }}
            className="min-h-[52px] w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 text-center font-mono text-base uppercase tracking-[0.15em] text-slate-100 placeholder:tracking-normal placeholder:text-slate-700 focus:border-emerald-400 focus:outline-none"
          />
          <p className="mt-1.5 text-center text-xs text-slate-600" data-testid="sync-code-count">
            {normalized.length} / {SYNC_TOKEN_LENGTH}
          </p>
        </div>

        {error && (
          <p data-testid="sync-link-error" className="text-center text-sm text-rose-400">
            {error}
          </p>
        )}

        <button
          type="button"
          data-testid="sync-link-submit"
          disabled={busy || !complete}
          onClick={() => void submit()}
          className="min-h-[52px] w-full rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400 disabled:opacity-40"
        >
          {busy ? 'Looking it up…' : 'Link this device'}
        </button>
      </div>
    </div>
  )
}
