// ─── Drill-window document parsing ───────────────────────────────────────────
// Pure: turns the untrusted JSON body of `data/drills/windows.json` into a
// `DrillWindows`, or explains why it cannot. No fetch — that is the UI layer's
// job (src/ui/data/loadWindows.ts).
//
// This exists because the windows now arrive over the wire alongside the market
// data instead of being compiled into the bundle. A half-written file, a stale
// service-worker entry or a future schema would otherwise surface as a blank
// chart or an out-of-range slice mid-drill; here it surfaces as "fall back to
// the bundled constants", which is a drill the learner can still play.

import type { DrillWindows, PatternDrillDef, PatternId, WhatNextDrillDef } from '@core/types'

/** Schema version this build understands. */
export const DRILL_WINDOWS_VERSION = 1

export const PATTERN_ID_VALUES: readonly PatternId[] = [
  'head-and-shoulders',
  'inverse-head-and-shoulders',
  'double-top',
  'double-bottom',
  'ascending-triangle',
  'descending-triangle',
  'symmetrical-triangle',
  'bull-flag',
  'bear-flag',
  'cup-and-handle',
  'rising-wedge',
  'falling-wedge',
  'breakout',
  'support-bounce',
  'uptrend',
  'downtrend',
  'consolidation',
]

const PATTERN_ID_SET = new Set<string>(PATTERN_ID_VALUES)

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

const isIndex = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x) && x >= 0

function parsePattern(raw: unknown, at: number): PatternDrillDef | string {
  if (!isRecord(raw)) return `patterns[${at}] is not an object`
  const { id, symbol, startIdx, endIdx, answer, distractors, explain } = raw
  if (typeof id !== 'string' || id === '') return `patterns[${at}] has no id`
  if (typeof symbol !== 'string' || symbol === '') return `${String(id)}: no symbol`
  if (!isIndex(startIdx) || !isIndex(endIdx)) return `${id}: window bounds must be non-negative integers`
  if (endIdx <= startIdx) return `${id}: endIdx must be after startIdx`
  if (typeof answer !== 'string' || !PATTERN_ID_SET.has(answer)) return `${id}: unknown answer '${String(answer)}'`
  if (!Array.isArray(distractors) || distractors.length !== 3) return `${id}: needs exactly 3 distractors`
  for (const d of distractors) {
    if (typeof d !== 'string' || !PATTERN_ID_SET.has(d)) return `${id}: unknown distractor '${String(d)}'`
  }
  if (new Set([answer, ...(distractors as string[])]).size !== 4) return `${id}: the answer is among its distractors`
  if (typeof explain !== 'string' || explain.length < 40) return `${id}: explanation is missing or too short`
  return {
    id,
    symbol,
    startIdx,
    endIdx,
    answer: answer as PatternId,
    distractors: distractors as [PatternId, PatternId, PatternId],
    explain,
  }
}

function parseWhatNext(raw: unknown, at: number): WhatNextDrillDef | string {
  if (!isRecord(raw)) return `whatnext[${at}] is not an object`
  const { id, symbol, cutoffIdx, horizon } = raw
  if (typeof id !== 'string' || id === '') return `whatnext[${at}] has no id`
  if (typeof symbol !== 'string' || symbol === '') return `${String(id)}: no symbol`
  if (!isIndex(cutoffIdx)) return `${id}: cutoffIdx must be a non-negative integer`
  if (!isIndex(horizon) || horizon < 1) return `${id}: horizon must be a positive integer`
  return { id, symbol, cutoffIdx, horizon }
}

/**
 * Parse a `windows.json` body.
 *
 * Returns the document, or an error string naming the first problem. Structural
 * only — whether a window is in bounds for its symbol needs the series, and is
 * checked by `tests/windows.test.ts` against the committed data rather than at
 * runtime on every visit.
 */
export function parseDrillWindows(raw: unknown): DrillWindows | string {
  if (!isRecord(raw)) return 'not an object'
  if (raw.version !== DRILL_WINDOWS_VERSION) {
    return `unsupported version ${String(raw.version)} (this build reads ${DRILL_WINDOWS_VERSION})`
  }
  if (raw.source !== 'synthetic' && raw.source !== 'stooq') return `unknown source '${String(raw.source)}'`
  if (typeof raw.generatedAt !== 'string' || raw.generatedAt === '') return 'generatedAt is missing'
  if (!Array.isArray(raw.patterns) || !Array.isArray(raw.whatnext)) return 'patterns and whatnext must be arrays'

  const patterns: PatternDrillDef[] = []
  for (let i = 0; i < raw.patterns.length; i++) {
    const parsed = parsePattern(raw.patterns[i], i)
    if (typeof parsed === 'string') return parsed
    patterns.push(parsed)
  }
  const whatnext: WhatNextDrillDef[] = []
  for (let i = 0; i < raw.whatnext.length; i++) {
    const parsed = parseWhatNext(raw.whatnext[i], i)
    if (typeof parsed === 'string') return parsed
    whatnext.push(parsed)
  }

  const ids = new Set([...patterns.map((d) => d.id), ...whatnext.map((d) => d.id)])
  if (ids.size !== patterns.length + whatnext.length) return 'drill ids are not unique'
  // An empty catalogue is not a usable one; the caller should keep its fallback.
  if (patterns.length === 0 || whatnext.length === 0) return 'catalogue has no drills'

  return { version: raw.version, source: raw.source, generatedAt: raw.generatedAt, patterns, whatnext }
}
