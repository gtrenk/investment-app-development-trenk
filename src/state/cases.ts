// ─── Case-study progress store ───────────────────────────────────────────────
// A small write-through zustand store over the pure reducers in
// @core/cases/progress, persisted per profile under STORAGE_KEYS.cases.
//
// It is deliberately its own store rather than a slice of useAppStore: case
// progress is one key, it is written on every step (a case is long, and losing
// twenty minutes of work to a backgrounded tab is unacceptable), and nothing
// else in the app reads it. Same shape as @state/profiles — hydrate once, then
// every mutation `set()`s and fires an un-awaited write.
//
// XP EARNED HERE IS ONLY TALLIED. `pendingXp` is the running total the cases
// have earned; awarding it into the gamification store is a separate wiring
// step (see the note in @core/cases/progress).

import { create } from 'zustand'
import { STORAGE_KEYS } from '@core/storage/adapter'
import type { StorageAdapter } from '@core/storage/adapter'
import {
  beginCase,
  completeCase,
  emptyCasesState,
  recordCaseAnswer,
  sanitizeCasesState,
  saveCaseThesis,
  setCaseStep,
} from '@core/cases/progress'
import type { CasesState } from '@core/cases/progress'
import type { CaseId } from '@core/types'
import { activeProfileStorage } from './profiles'
import { appClock } from './clock'

// ── The adapter ──────────────────────────────────────────────────────────────

/**
 * Resolved once and cached, exactly like the app store's.
 *
 * `setCasesStorage` exists for the unit tests, which run in node with no
 * IndexedDB and no signed-in profile — without it every persistence assertion
 * would be writing into the throwaway memory adapter `activeProfileStorage()`
 * hands out when nobody is signed in.
 */
let adapter: StorageAdapter | null = null
let adapterPromise: Promise<StorageAdapter> | null = null

export function setCasesStorage(storage: StorageAdapter | null): void {
  adapter = storage
  adapterPromise = null
}

async function storage(): Promise<StorageAdapter> {
  if (adapter) return adapter
  adapterPromise ??= activeProfileStorage()
  adapter = await adapterPromise
  return adapter
}

// ── Store ────────────────────────────────────────────────────────────────────

export interface CasesStore extends CasesState {
  ready: boolean

  hydrate: (force?: boolean) => Promise<void>
  /** Open a case, or resume the one already open. `thesisCount` sizes the box list. */
  begin: (caseId: CaseId, thesisCount: number) => void
  goToStep: (caseId: CaseId, stepIdx: number) => void
  answer: (caseId: CaseId, itemId: string, choiceIdx: number, correct: boolean) => void
  saveThesis: (caseId: CaseId, thesisIdx: number, text: string) => void
  finish: (caseId: CaseId, result: { score: number; total: number }) => void
  /** Hand the banked case XP to the caller and zero it (persisted). Returns the claimed amount. */
  claimPendingXp: () => number
  /** Test/profile-wipe escape hatch. */
  reset: () => void
}

export const useCasesStore = create<CasesStore>((set, get) => {
  /**
   * Persist the whole blob. Un-awaited on purpose: a case step must not wait on
   * IndexedDB, and a failed write costs at most the current step's progress —
   * the next step writes the same object again.
   */
  const write = (): void => {
    const { completed, inProgress, pendingXp } = get()
    void storage()
      .then((s) => s.set<CasesState>(STORAGE_KEYS.cases, { completed, inProgress, pendingXp }))
      .catch(() => {
        /* private mode, quota, a closed tab — the next step retries */
      })
  }

  const apply = (fn: (state: CasesState) => CasesState): void => {
    const { completed, inProgress, pendingXp } = get()
    const next = fn({ completed, inProgress, pendingXp })
    // Every key spelled out: zustand merges, so an omitted `inProgress` would
    // leave a finished sitting sitting there forever.
    set({ completed: next.completed, inProgress: next.inProgress, pendingXp: next.pendingXp })
    write()
  }

  return {
    ...emptyCasesState(),
    ready: false,

    async hydrate(force = false) {
      if (get().ready && !force) return
      try {
        const s = await storage()
        const raw = await s.get<unknown>(STORAGE_KEYS.cases)
        set({ ...sanitizeCasesState(raw), ready: true })
      } catch {
        set({ ...emptyCasesState(), ready: true })
      }
    },

    begin(caseId, thesisCount) {
      apply((s) => beginCase(s, caseId, thesisCount))
    },

    goToStep(caseId, stepIdx) {
      apply((s) => setCaseStep(s, caseId, stepIdx))
    },

    answer(caseId, itemId, choiceIdx, correct) {
      apply((s) => recordCaseAnswer(s, caseId, itemId, choiceIdx, correct))
    },

    saveThesis(caseId, thesisIdx, text) {
      apply((s) => saveCaseThesis(s, caseId, thesisIdx, text))
    },

    finish(caseId, result) {
      apply((s) => completeCase(s, caseId, { ...result, date: appClock.today() }))
    },

    claimPendingXp() {
      const amount = get().pendingXp
      if (amount <= 0) return 0
      set({ pendingXp: 0 })
      write()
      return amount
    },

    reset() {
      set({ ...emptyCasesState(), ready: true })
      write()
    },
  }
})
