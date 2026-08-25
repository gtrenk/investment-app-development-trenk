// ─── Sync status dot ─────────────────────────────────────────────────────────
// Rides on the Home profile chip. Deliberately tiny and wordless: sync working
// is the expected case and deserves no attention, so the only thing worth
// spending pixels on is the difference between "saved everywhere" and "not yet".
//
// Renders nothing at all when sync is off or unconfigured — an app that has
// never heard of cloud sync must not grow a mystery dot.

import { useSyncStore } from '@state/sync'
import type { SyncStatus } from '@state/sync'

const TONE: Record<SyncStatus, string | null> = {
  unconfigured: null,
  off: null,
  syncing: 'bg-sky-400',
  synced: 'bg-emerald-400',
  pending: 'bg-amber-400',
  offline: 'bg-slate-500',
  error: 'bg-rose-500',
}

const LABEL: Record<SyncStatus, string> = {
  unconfigured: 'Cloud sync not set up',
  off: 'Cloud sync off',
  syncing: 'Syncing…',
  synced: 'Synced',
  pending: 'Changes not synced yet',
  offline: 'Offline — changes saved on this device',
  error: 'Sync problem',
}

export function syncStatusLabel(status: SyncStatus): string {
  return LABEL[status]
}

export function SyncDot() {
  const status = useSyncStore((s) => s.status)
  const tone = TONE[status]
  if (!tone) return null

  return (
    <span
      data-testid="sync-dot"
      data-sync-status={status}
      // aria-hidden, and no text: the state is already in the chip's title and
      // aria-label, and a second announcement on every push would be noise.
      aria-hidden
      className={`pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-slate-950 ${tone}`}
    />
  )
}
