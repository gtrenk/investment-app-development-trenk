// ─── Smart Session, wired to the app ─────────────────────────────────────────
// The thin layer between the pure session module (@state/session) and the
// screens: it reads the live snapshot the plan is a function of, and turns
// "what's next" into a navigation.

import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore, appClock } from '@state/useAppStore'
import { livePlan, pendingIndex, pendingStep, stepRoute, useSessionStore } from '@state/session'
import type { SessionInput, SessionStep } from '@state/session'

/** The live snapshot every session question is answered from. */
export function useSessionInput(): SessionInput {
  const progress = useAppStore((s) => s.progress)
  const srs = useAppStore((s) => s.srs)
  const game = useAppStore((s) => s.game)
  const drillHistory = useAppStore((s) => s.drillHistory)
  const pace = useAppStore((s) => s.settings.pace)
  return { today: appClock.today(), progress, srs, game, drillHistory, pace }
}

/** Same snapshot, read imperatively — for event handlers, not render. */
export function sessionInputNow(): SessionInput {
  const s = useAppStore.getState()
  return {
    today: appClock.today(),
    progress: s.progress,
    srs: s.srs,
    game: s.game,
    drillHistory: s.drillHistory,
    pace: s.settings.pace,
  }
}

export interface SessionFlow {
  active: boolean
  plan: SessionStep[]
  input: SessionInput
  /** The step to do next, or null when everything planned is done. */
  next: SessionStep | null
  /** Position of `next` in the plan, or the plan length when finished. */
  index: number
  /** Go to the next step — or to the celebration when there is none left. */
  advance: () => void
}

/**
 * What a completion panel needs to keep the chain going.
 *
 * `next` is read live, so by the time a panel renders the step it belongs to is
 * already marked done and `next` is genuinely the following one. That is the
 * whole trick: nothing has to tell the session that a step finished.
 */
export function useSessionFlow(): SessionFlow {
  const active = useSessionStore((s) => s.active)
  const started = useSessionStore((s) => s.plan)
  const input = useSessionInput()
  const navigate = useNavigate()

  const plan = livePlan(started, input)
  const i = pendingIndex(plan, input)
  const next = i === -1 ? null : plan[i]

  return {
    active,
    plan,
    input,
    next,
    index: i === -1 ? plan.length : i,
    advance: () => {
      const now = sessionInputNow()
      // Growing the plan (see `livePlan`) is committed here rather than during
      // render, which is the only place a store write belongs.
      const live = livePlan(useSessionStore.getState().plan, now)
      useSessionStore.getState().adopt(live)
      const step = pendingStep(live, now)
      navigate(step ? stepRoute(step) : '/session')
    },
  }
}

/** Routes a live session is allowed to be on. Anything else ends it. */
function isSessionRoute(pathname: string): boolean {
  return (
    pathname === '/session' ||
    pathname === '/review' ||
    pathname === '/drill' ||
    pathname.startsWith('/lesson/')
  )
}

/**
 * Interruption handling, in full: navigate anywhere outside the flow — the tab
 * bar, a lesson's ✕, the browser Back gesture — and the session quietly ends.
 * There is nothing to save, because starting again rebuilds the plan from what
 * is actually done.
 */
export function SessionGuard(): null {
  const { pathname } = useLocation()
  const active = useSessionStore((s) => s.active)
  const end = useSessionStore((s) => s.end)

  useEffect(() => {
    if (active && !isSessionRoute(pathname)) end()
  }, [active, pathname, end])

  return null
}
