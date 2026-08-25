// ─── Celebration queue ───────────────────────────────────────────────────────
// Pops one item at a time off `pendingCelebrations`: level-ups, badges and the
// daily-goal moment. Auto-dismisses so it never traps the user (or a test).

import { useEffect } from 'react'
import { badgeById } from '@core/gamification/badges'
import { useAppStore } from '@state/useAppStore'
import type { Celebration } from '@state/useAppStore'

const AUTO_DISMISS_MS = 2000

function content(c: Celebration): { icon: string; title: string; body: string; accent: string } {
  switch (c.kind) {
    case 'level-up':
      return {
        icon: '⭐',
        title: `Level ${c.level}`,
        body: 'Your compounding is showing.',
        accent: 'text-amber-300',
      }
    case 'goal-met':
      return {
        icon: '🔥',
        title: `${c.streak}-day streak`,
        body: "Daily goal met. That's how mastery gets built.",
        accent: 'text-orange-300',
      }
    case 'badge': {
      const def = badgeById(c.badgeId)
      return {
        icon: def?.icon ?? '🏆',
        title: def?.name ?? 'Badge earned',
        body: def?.description ?? 'New badge unlocked',
        accent: 'text-emerald-300',
      }
    }
  }
}

export function CelebrationOverlay() {
  const current = useAppStore((s) => s.pendingCelebrations[0])
  const dismiss = useAppStore((s) => s.dismissCelebration)

  useEffect(() => {
    if (!current) return
    const t = setTimeout(dismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(t)
  }, [current, dismiss])

  if (!current) return null
  const { icon, title, body, accent } = content(current)

  return (
    <div
      data-testid="celebration"
      role="status"
      onClick={dismiss}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-8 backdrop-blur-sm"
    >
      <div className="anim-pop w-full max-w-xs rounded-3xl border border-slate-700 bg-slate-900 px-6 py-8 text-center shadow-2xl shadow-black/60">
        <div aria-hidden className="mb-3 text-6xl leading-none">
          {icon}
        </div>
        <p className={`text-xl font-extrabold ${accent}`}>{title}</p>
        <p className="mt-1.5 text-sm text-slate-400">{body}</p>
        <p className="mt-5 text-xs uppercase tracking-widest text-slate-600">Tap to continue</p>
      </div>
    </div>
  )
}
