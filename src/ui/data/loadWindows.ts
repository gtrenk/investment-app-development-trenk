// ─── Drill-window loader (UI layer) ──────────────────────────────────────────
// `public/data/drills/windows.json` is written by `scripts/curate-windows.mjs`
// and precached by the service worker along with the rest of `data/**/*.json`,
// so after the first visit this resolves offline like the series files do.
//
// The one rule this file exists to enforce: **the drills never break.** A
// missing file, a 404 behind a wrong base path, a truncated body, a schema from
// a future build — every one of them falls back to the constants compiled into
// the bundle rather than leaving the learner staring at "no drills authored".
// That is why the promise never rejects.

import { useEffect, useState } from 'react'
import type { DrillWindows } from '@core/types'
import { parseDrillWindows } from '@core/drills/windows'
import { FALLBACK_WINDOWS } from '@content/drills/patterns'

let cache: Promise<DrillWindows> | null = null
let resolved: DrillWindows | null = null

/** Where the curated windows live, honouring a non-root deploy base. */
function url(): string {
  return `${import.meta.env.BASE_URL}data/drills/windows.json`
}

async function fetchWindows(): Promise<DrillWindows> {
  const res = await fetch(url())
  if (!res.ok) throw new Error(`loadWindows: HTTP ${res.status}`)
  const parsed = parseDrillWindows(await res.json())
  if (typeof parsed === 'string') throw new Error(`loadWindows: ${parsed}`)
  return parsed
}

/**
 * Load the curated drill catalogue. Memoised for the life of the tab, and
 * **never rejects** — a failure resolves with `FALLBACK_WINDOWS` instead, after
 * logging why, so a broken data file costs the learner variety, not the drill.
 */
export function loadWindows(): Promise<DrillWindows> {
  if (cache) return cache
  cache = fetchWindows()
    .catch((err: unknown) => {
      console.warn('loadWindows: falling back to bundled windows —', err)
      return FALLBACK_WINDOWS
    })
    .then((windows) => {
      resolved = windows
      return windows
    })
  return cache
}

/**
 * The catalogue if it is already in hand, else null.
 *
 * Lets a screen mounted after the first load start with the real windows on its
 * very first render — which matters for `DrillPlayer`, where the drill in play
 * is snapshotted on mount and must not change under the learner.
 */
export function windowsSnapshot(): DrillWindows | null {
  return resolved
}

/** Drop the memo — only used by tests. */
export function clearWindowsCache(): void {
  cache = null
  resolved = null
}

export interface WindowsQuery {
  /** Null only while the very first load is in flight. */
  windows: DrillWindows | null
  loading: boolean
}

/** React binding for `loadWindows`. Resolves synchronously once cached. */
export function useDrillWindows(): WindowsQuery {
  const [state, setState] = useState<WindowsQuery>(() => {
    const hit = windowsSnapshot()
    return hit ? { windows: hit, loading: false } : { windows: null, loading: true }
  })

  useEffect(() => {
    if (state.windows) return
    let live = true
    void loadWindows().then((windows) => {
      if (live) setState({ windows, loading: false })
    })
    return () => {
      live = false
    }
    // Runs once: `loadWindows` is memoised and never rejects, so there is
    // nothing to retry and no dependency that can change the answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}
