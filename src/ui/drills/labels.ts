// ─── Shared drill copy ───────────────────────────────────────────────────────
// One home for the wording the Drills tab, the player and the stats screen all
// have to agree on. Pure strings — no state, no imports beyond core types.

import type { DrillKind } from '@core/types'
import type { WhatNextOutcome } from '@core/drills/engine'
import { OUTCOME_THRESHOLD } from '@core/drills/engine'

/** ±2% rendered once, so the band in the buttons can never drift from the engine. */
export const BAND_PCT = Math.round(OUTCOME_THRESHOLD * 100)

export const KIND_COPY: Record<DrillKind, { title: string; icon: string; blurb: string }> = {
  pattern: {
    title: 'Spot the Pattern',
    icon: '🔍',
    blurb: 'Name the shape on a real chart window, then read why it is what it is.',
  },
  whatnext: {
    title: 'What Happens Next',
    icon: '🎲',
    blurb: 'Call the next 10 bars on a masked chart — and say how sure you are.',
  },
}

export interface OutcomeCopy {
  label: string
  band: string
  icon: string
  /** Tailwind classes for the selected/-correct pill. */
  tint: string
}

export const OUTCOME_COPY: Record<WhatNextOutcome, OutcomeCopy> = {
  up: { label: 'Up', band: `> +${BAND_PCT}%`, icon: '▲', tint: 'text-emerald-300' },
  flat: { label: 'Flat', band: `±${BAND_PCT}%`, icon: '▬', tint: 'text-slate-300' },
  down: { label: 'Down', band: `< −${BAND_PCT}%`, icon: '▼', tint: 'text-rose-300' },
}

export const OUTCOMES: readonly WhatNextOutcome[] = ['up', 'flat', 'down']

/** `0.0431` → `+4.3%`. */
export function pct(fraction: number): string {
  const v = fraction * 100
  const sign = v > 0 ? '+' : v < 0 ? '−' : ''
  return `${sign}${Math.abs(v).toFixed(1)}%`
}
