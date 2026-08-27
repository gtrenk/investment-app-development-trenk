// ─── The mistake bank ────────────────────────────────────────────────────────
// One record per quiz item the learner has ever got wrong, so "study what you
// miss" stops being a slogan the app cannot act on.
//
// THE WHOLE MODEL, in three sentences:
//
//   • An item ENTERS the bank the first time it is answered wrongly — in a
//     lesson quiz or in the placement test. Both are the same event: a question
//     this learner could not answer.
//   • Every later miss INCREMENTS `missCount` and moves `lastMissedAt`. That
//     counter is the only measure of "how stuck am I on this one", and it never
//     goes down.
//   • Answering it correctly in a weak-spot session RESOLVES the record. The
//     record stays — a resolved miss is still evidence about which unit was
//     shaky, and deleting it would make the insight screen forget every mistake
//     the learner has actually fixed — but it leaves the queue.
//
// A resolved item that is missed AGAIN simply re-enters: `resolvedAt` is
// cleared and `missCount` keeps climbing. There is no "resolved for good"
// state, because forgetting is not a bug.
//
// Cases are deliberately out of scope for v1: CasePlayer records its answers in
// the cases store, a case question is scaffolded by the statements on screen
// rather than free-standing, and re-asking one outside its case would strip the
// context that makes it answerable. Lesson quizzes and placement items are
// self-contained; those are what the bank holds.
//
// Pure and storage-free, like everything else in core/.

import type { LessonId, UnitId } from '@core/types'

export interface MissRecord {
  /** Quiz item id, e.g. `u05-l03-q2`. Unique within the bank. */
  itemId: string
  lessonId: LessonId
  unitId: UnitId
  /** Times this item has been answered wrongly, ever. Never decreases. */
  missCount: number
  /** Local date 'YYYY-MM-DD' of the most recent miss. */
  lastMissedAt: string
  /** Local date it was last answered correctly in a weak-spot session. */
  resolvedAt?: string
}

export interface WeakSpotsState {
  misses: MissRecord[]
}

export function emptyWeakSpots(): WeakSpotsState {
  return { misses: [] }
}

// ── Id parsing ───────────────────────────────────────────────────────────────

/**
 * Curriculum ids are structural: `u05-l03-q2` and `u05-l03-c1` both name the
 * unit and the lesson they belong to. Reading them back is what lets the bank
 * take a bare item id from anywhere in the app — the lesson player, the
 * placement sampler — without every caller having to hand over the same two
 * ids it already spelled into the item.
 *
 * An id that does not match the shape yields `null` and is refused entry, which
 * is the honest outcome: a record whose unit is a guess would poison the
 * per-unit insight that is the whole point of keeping it.
 */
const CURRICULUM_ID = /^(u\d+)-(l\d+)(?:-|$)/

export function unitIdOf(id: string): UnitId | null {
  return CURRICULUM_ID.exec(id)?.[1] ?? null
}

export function lessonIdOf(id: string): LessonId | null {
  const m = CURRICULUM_ID.exec(id)
  return m ? `${m[1]}-${m[2]}` : null
}

// ── Reading ──────────────────────────────────────────────────────────────────

export function isOpen(record: MissRecord): boolean {
  return record.resolvedAt === undefined
}

export function findMiss(state: WeakSpotsState, itemId: string): MissRecord | undefined {
  return state.misses.find((m) => m.itemId === itemId)
}

/** Stable order: oldest miss first, ties broken on item id. */
function byAgeThenId(a: MissRecord, b: MissRecord): number {
  if (a.lastMissedAt !== b.lastMissedAt) return a.lastMissedAt < b.lastMissedAt ? -1 : 1
  return a.itemId < b.itemId ? -1 : a.itemId > b.itemId ? 1 : 0
}

/**
 * Everything still waiting to be fixed, oldest miss first.
 *
 * Oldest-first rather than most-missed-first on purpose: a question missed
 * three weeks ago and never revisited is the one at real risk of being
 * forgotten entirely, while the one missed this morning is still warm. The
 * count is shown in the UI, but it does not set the running order.
 */
export function openMisses(state: WeakSpotsState): MissRecord[] {
  return state.misses.filter(isOpen).sort(byAgeThenId)
}

export function resolvedMisses(state: WeakSpotsState): MissRecord[] {
  return state.misses.filter((m) => !isOpen(m)).sort(byAgeThenId)
}

export function openMissCount(state: WeakSpotsState): number {
  return state.misses.reduce((n, m) => n + (isOpen(m) ? 1 : 0), 0)
}

/**
 * Every record — open *and* resolved — grouped by unit.
 *
 * Resolved ones are included because this is the input to the accuracy view: a
 * unit where five items were missed and then all five fixed is a unit that was
 * once shaky, and hiding that would flatter the learner.
 */
export function missesByUnit(state: WeakSpotsState): Record<UnitId, MissRecord[]> {
  const out: Record<UnitId, MissRecord[]> = {}
  for (const m of [...state.misses].sort(byAgeThenId)) {
    ;(out[m.unitId] ??= []).push(m)
  }
  return out
}

// ── Transitions ──────────────────────────────────────────────────────────────

/**
 * Bank one wrong answer.
 *
 * Returns the state *unchanged by reference* when the id is not a curriculum
 * item — every caller treats reference equality as "nothing happened", which is
 * what keeps a stray call from writing storage.
 */
export function recordMiss(state: WeakSpotsState, itemId: string, date: string): WeakSpotsState {
  const unitId = unitIdOf(itemId)
  const lessonId = lessonIdOf(itemId)
  if (!unitId || !lessonId) return state

  const existing = findMiss(state, itemId)
  if (!existing) {
    return { misses: [...state.misses, { itemId, lessonId, unitId, missCount: 1, lastMissedAt: date }] }
  }

  // Re-entry after a resolve is an ordinary miss with `resolvedAt` dropped:
  // `missCount` keeps counting across the whole history of the item, so the
  // record still says "this one has bitten me four times" rather than resetting
  // every time it is briefly fixed.
  const next: MissRecord = {
    ...existing,
    missCount: existing.missCount + 1,
    lastMissedAt: date,
  }
  delete next.resolvedAt
  return { misses: state.misses.map((m) => (m.itemId === itemId ? next : m)) }
}

/**
 * Mark an item fixed. A no-op — by reference — when the item is unknown or
 * already resolved, which is exactly the guard that makes the XP award for
 * resolving one idempotent (see `resolveAward` in ./session).
 */
export function resolveMiss(state: WeakSpotsState, itemId: string, date: string): WeakSpotsState {
  const existing = findMiss(state, itemId)
  if (!existing || !isOpen(existing)) return state
  return {
    misses: state.misses.map((m) => (m.itemId === itemId ? { ...m, resolvedAt: date } : m)),
  }
}

// ── Defensive read ───────────────────────────────────────────────────────────

function sanitizeRecord(raw: unknown): MissRecord | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<MissRecord>
  if (typeof r.itemId !== 'string' || typeof r.lastMissedAt !== 'string') return null
  const unitId = typeof r.unitId === 'string' ? r.unitId : unitIdOf(r.itemId)
  const lessonId = typeof r.lessonId === 'string' ? r.lessonId : lessonIdOf(r.itemId)
  if (!unitId || !lessonId) return null
  const missCount = Number.isFinite(r.missCount) ? Math.max(1, Math.floor(r.missCount as number)) : 1
  const record: MissRecord = { itemId: r.itemId, lessonId, unitId, missCount, lastMissedAt: r.lastMissedAt }
  if (typeof r.resolvedAt === 'string') record.resolvedAt = r.resolvedAt
  return record
}

/**
 * A blob written by another build (or a half-cleared store) must degrade to
 * "no misses recorded", never crash a boot. Duplicate ids collapse to the
 * first, so the bank's one-record-per-item invariant survives a bad merge.
 */
export function sanitizeWeakSpots(raw: unknown): WeakSpotsState {
  if (!raw || typeof raw !== 'object') return emptyWeakSpots()
  const list = (raw as Partial<WeakSpotsState>).misses
  if (!Array.isArray(list)) return emptyWeakSpots()
  const seen = new Set<string>()
  const misses: MissRecord[] = []
  for (const entry of list) {
    const record = sanitizeRecord(entry)
    if (!record || seen.has(record.itemId)) continue
    seen.add(record.itemId)
    misses.push(record)
  }
  return { misses }
}
