import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { addDays } from '@core/clock'
import {
  CALIBRATION_ADJUST,
  CONFIDENCE_LEVELS,
  DRILL_BASE_SCORE,
  DRILL_EXCLUSION_DAYS,
  OUTCOME_THRESHOLD,
  answeredToday,
  calibrationStats,
  dayOfEpoch,
  drillKindForDay,
  pickDailyDrill,
  scoreDrill,
  whatNextOutcome,
} from '@core/drills/engine'
import { lastCloseReturn, validateSeries } from '@core/market/bundled'
import { PATTERN_DRILLS, PATTERN_LABELS, WHATNEXT_DRILLS } from '@content/drills/patterns'
import type {
  Confidence,
  DrillHistory,
  DrillResult,
  OhlcvSeries,
  PatternDrillDef,
  WhatNextDrillDef,
} from '@core/types'

// ─── whatNextOutcome ─────────────────────────────────────────────────────────

describe('whatNextOutcome', () => {
  it('uses a ±2% threshold', () => {
    expect(OUTCOME_THRESHOLD).toBe(0.02)
  })

  it.each<[number, 'up' | 'flat' | 'down']>([
    [0.5, 'up'],
    [0.0201, 'up'],
    [0.02000001, 'up'],
    [0.02, 'flat'], // exactly +2% is NOT up
    [0.0199, 'flat'],
    [0, 'flat'],
    [-0.0199, 'flat'],
    [-0.02, 'flat'], // exactly −2% is NOT down
    [-0.02000001, 'down'],
    [-0.0201, 'down'],
    [-0.6, 'down'],
  ])('classifies %f as %s', (r, expected) => {
    expect(whatNextOutcome(r)).toBe(expected)
  })

  it('treats both exact boundaries as flat, so no return has two answers', () => {
    expect(whatNextOutcome(OUTCOME_THRESHOLD)).toBe('flat')
    expect(whatNextOutcome(-OUTCOME_THRESHOLD)).toBe('flat')
  })
})

// ─── scoreDrill ──────────────────────────────────────────────────────────────

describe('scoreDrill', () => {
  it('awards the base score with no confidence', () => {
    expect(DRILL_BASE_SCORE).toBe(10)
    expect(scoreDrill(true)).toBe(10)
    expect(scoreDrill(false)).toBe(0)
  })

  // The full confidence × correctness matrix.
  it.each<[boolean, Confidence, number]>([
    [true, 90, 15],
    [true, 70, 13],
    [true, 50, 11],
    [false, 90, -5],
    [false, 70, -2],
    [false, 50, 0],
  ])('correct=%s @%i%% scores %i', (correct, confidence, expected) => {
    expect(scoreDrill(correct, confidence)).toBe(expected)
  })

  it('returns a negative score for a confident miss (not clamped at zero)', () => {
    expect(scoreDrill(false, 90)).toBeLessThan(0)
  })

  it('rewards higher confidence more when right and punishes it more when wrong', () => {
    expect(scoreDrill(true, 90)).toBeGreaterThan(scoreDrill(true, 70))
    expect(scoreDrill(true, 70)).toBeGreaterThan(scoreDrill(true, 50))
    expect(scoreDrill(false, 90)).toBeLessThan(scoreDrill(false, 70))
    expect(scoreDrill(false, 70)).toBeLessThan(scoreDrill(false, 50))
  })

  it('makes always-hedging strictly worse than being calibrated', () => {
    // Someone right 90% of the time who says 90 beats the same person saying 50.
    const said90 = 9 * scoreDrill(true, 90) + 1 * scoreDrill(false, 90)
    const said50 = 9 * scoreDrill(true, 50) + 1 * scoreDrill(false, 50)
    expect(said90).toBeGreaterThan(said50)
    // But someone right only half the time is better off saying 50 than 90.
    const coinAt90 = 5 * scoreDrill(true, 90) + 5 * scoreDrill(false, 90)
    const coinAt50 = 5 * scoreDrill(true, 50) + 5 * scoreDrill(false, 50)
    expect(coinAt50).toBeGreaterThan(coinAt90)
  })

  it('matches the published adjustment table', () => {
    for (const c of CONFIDENCE_LEVELS) {
      expect(scoreDrill(true, c)).toBe(DRILL_BASE_SCORE + CALIBRATION_ADJUST[c].correct)
      expect(scoreDrill(false, c)).toBe(CALIBRATION_ADJUST[c].wrong)
    }
  })
})

// ─── daily selection ─────────────────────────────────────────────────────────

const P = (id: string): PatternDrillDef => ({
  id,
  symbol: 'AAPL',
  startIdx: 0,
  endIdx: 99,
  answer: 'uptrend',
  distractors: ['downtrend', 'consolidation', 'breakout'],
  explain: 'x',
})
const W = (id: string): WhatNextDrillDef => ({ id, symbol: 'AAPL', cutoffIdx: 200, horizon: 10 })

const R = (drillId: string, date: string, correct: boolean): DrillResult => ({
  drillId,
  kind: drillId.startsWith('p') ? 'pattern' : 'whatnext',
  date,
  correct,
  score: correct ? 10 : 0,
})

const EMPTY: DrillHistory = { results: [] }

/** A date whose day-of-epoch parity selects the given kind. */
function dateForKind(kind: 'pattern' | 'whatnext', from = '2026-03-02'): string {
  return drillKindForDay(from) === kind ? from : addDays(from, 1)
}

describe('drillKindForDay', () => {
  it('alternates strictly day by day', () => {
    let d = '2026-01-01'
    for (let i = 0; i < 20; i++) {
      const next = addDays(d, 1)
      expect(drillKindForDay(next)).not.toBe(drillKindForDay(d))
      d = next
    }
  })

  it('is driven by day-of-epoch parity', () => {
    expect(dayOfEpoch('1970-01-01')).toBe(0)
    expect(dayOfEpoch('1970-01-02')).toBe(1)
    expect(drillKindForDay('1970-01-01')).toBe('pattern')
    expect(drillKindForDay('1970-01-02')).toBe('whatnext')
  })

  it('does not desynchronise when days are skipped', () => {
    const d = '2026-05-10'
    expect(drillKindForDay(addDays(d, 2))).toBe(drillKindForDay(d))
    expect(drillKindForDay(addDays(d, 7))).not.toBe(drillKindForDay(d))
  })
})

describe('pickDailyDrill', () => {
  it('returns null only when there is nothing at all', () => {
    expect(pickDailyDrill([], [], EMPTY, '2026-03-02')).toBeNull()
  })

  it('picks the kind the day calls for', () => {
    const pd = [P('p1'), P('p2')]
    const wd = [W('w1'), W('w2')]
    const patternDay = dateForKind('pattern')
    const whatnextDay = dateForKind('whatnext')
    expect(pickDailyDrill(pd, wd, EMPTY, patternDay)?.kind).toBe('pattern')
    expect(pickDailyDrill(pd, wd, EMPTY, whatnextDay)?.kind).toBe('whatnext')
  })

  it('is deterministic: the same day and history always yield the same drill', () => {
    const pd = Array.from({ length: 40 }, (_, i) => P(`p${i}`))
    const wd = Array.from({ length: 30 }, (_, i) => W(`w${i}`))
    for (const day of ['2026-03-02', '2026-03-03', '2025-11-19', '2024-02-29']) {
      const first = pickDailyDrill(pd, wd, EMPTY, day)
      for (let i = 0; i < 5; i++) {
        expect(pickDailyDrill(pd, wd, EMPTY, day)).toEqual(first)
      }
    }
  })

  it('gives different days different drills', () => {
    const pd = Array.from({ length: 40 }, (_, i) => P(`p${i}`))
    const wd = Array.from({ length: 30 }, (_, i) => W(`w${i}`))
    const ids = new Set<string>()
    let d = '2026-03-02'
    for (let i = 0; i < 20; i++) {
      ids.add(pickDailyDrill(pd, wd, EMPTY, d)!.def.id)
      d = addDays(d, 1)
    }
    // Not a hard guarantee of uniqueness, but 20 draws from 70 defs should not
    // collapse to a handful — that would mean the seed barely varies.
    expect(ids.size).toBeGreaterThan(12)
  })

  it('honours an injected rng', () => {
    const pd = [P('p0'), P('p1'), P('p2'), P('p3')]
    const day = dateForKind('pattern')
    expect(pickDailyDrill(pd, [], EMPTY, day, () => 0)!.def.id).toBe('p0')
    expect(pickDailyDrill(pd, [], EMPTY, day, () => 0.5)!.def.id).toBe('p2')
    // rng returning exactly 1 must not index past the end
    expect(pickDailyDrill(pd, [], EMPTY, day, () => 1)!.def.id).toBe('p3')
  })

  describe('60-day exclusion', () => {
    const day = dateForKind('pattern')
    const pd = [P('p0'), P('p1')]

    it('skips a drill answered correctly inside the window', () => {
      const history: DrillHistory = {
        results: [R('p0', addDays(day, -(DRILL_EXCLUSION_DAYS - 1)), true)],
      }
      expect(pickDailyDrill(pd, [], history, day)!.def.id).toBe('p1')
    })

    it('skips one answered correctly today', () => {
      const history: DrillHistory = { results: [R('p0', day, true)] }
      expect(pickDailyDrill(pd, [], history, day)!.def.id).toBe('p1')
    })

    it('lets a drill back in exactly 60 days after a correct answer', () => {
      const history: DrillHistory = {
        results: [R('p1', addDays(day, -DRILL_EXCLUSION_DAYS), true)],
      }
      // p1 is eligible again, so with a forced rng both are reachable.
      expect(pickDailyDrill(pd, [], history, day, () => 0.99)!.def.id).toBe('p1')
    })

    it('does not exclude drills that were answered WRONG', () => {
      const history: DrillHistory = { results: [R('p1', addDays(day, -1), false)] }
      expect(pickDailyDrill(pd, [], history, day, () => 0.99)!.def.id).toBe('p1')
    })

    it('falls back to the other kind when the preferred pool is exhausted', () => {
      const history: DrillHistory = {
        results: [R('p0', addDays(day, -5), true), R('p1', addDays(day, -5), true)],
      }
      const got = pickDailyDrill(pd, [W('w0')], history, day)
      expect(got).toEqual({ kind: 'whatnext', def: W('w0') })
    })

    it('drops the exclusion rather than showing nothing when everything is mastered', () => {
      const history: DrillHistory = {
        results: [R('p0', addDays(day, -5), true), R('p1', addDays(day, -5), true)],
      }
      const got = pickDailyDrill(pd, [], history, day)
      expect(got).not.toBeNull()
      expect(got!.kind).toBe('pattern')
    })

    it('ignores results dated in the future', () => {
      const history: DrillHistory = { results: [R('p0', addDays(day, 3), true)] }
      expect(pickDailyDrill(pd, [], history, day, () => 0)!.def.id).toBe('p0')
    })
  })
})

// ─── history queries ─────────────────────────────────────────────────────────

describe('answeredToday', () => {
  it('is false for an empty history', () => {
    expect(answeredToday(EMPTY, '2026-03-02')).toBe(false)
  })

  it('is true when any result carries that date', () => {
    const h: DrillHistory = { results: [R('p0', '2026-03-01', true), R('w0', '2026-03-02', false)] }
    expect(answeredToday(h, '2026-03-02')).toBe(true)
    expect(answeredToday(h, '2026-03-01')).toBe(true)
    expect(answeredToday(h, '2026-03-03')).toBe(false)
  })
})

describe('calibrationStats', () => {
  const withConf = (confidence: Confidence, correct: boolean, i: number): DrillResult => ({
    drillId: `w${i}`,
    kind: 'whatnext',
    date: '2026-03-02',
    correct,
    confidence,
    score: scoreDrill(correct, confidence),
  })

  it('always returns all three buckets in ascending order', () => {
    const s = calibrationStats(EMPTY)
    expect(s.map((b) => b.confidence)).toEqual([50, 70, 90])
    expect(s.every((b) => b.n === 0 && b.hitRate === 0)).toBe(true)
  })

  it('computes hit rate per level', () => {
    const results = [
      withConf(90, true, 0),
      withConf(90, true, 1),
      withConf(90, false, 2),
      withConf(90, false, 3),
      withConf(70, true, 4),
      withConf(70, false, 5),
      withConf(50, true, 6),
    ]
    const [c50, c70, c90] = calibrationStats({ results })
    expect(c90).toEqual({ confidence: 90, n: 4, hitRate: 0.5 })
    expect(c70).toEqual({ confidence: 70, n: 2, hitRate: 0.5 })
    expect(c50).toEqual({ confidence: 50, n: 1, hitRate: 1 })
  })

  it('reports a perfectly calibrated learner at their stated levels', () => {
    const results: DrillResult[] = []
    // 10 @90 with 9 right, 10 @70 with 7 right, 10 @50 with 5 right.
    for (const [conf, hits] of [[90, 9], [70, 7], [50, 5]] as Array<[Confidence, number]>) {
      for (let i = 0; i < 10; i++) results.push(withConf(conf, i < hits, results.length))
    }
    const [c50, c70, c90] = calibrationStats({ results })
    expect(c50.hitRate).toBeCloseTo(0.5, 10)
    expect(c70.hitRate).toBeCloseTo(0.7, 10)
    expect(c90.hitRate).toBeCloseTo(0.9, 10)
  })

  it('ignores results with no confidence', () => {
    const results = [R('p0', '2026-03-02', true), withConf(70, true, 1)]
    const [, c70] = calibrationStats({ results })
    expect(c70.n).toBe(1)
    expect(calibrationStats({ results }).reduce((a, b) => a + b.n, 0)).toBe(1)
  })
})

// ─── content + bundled-data guard ────────────────────────────────────────────
//
// Vitest runs in node, so the tests can read the committed dataset straight off
// disk. This is the guard that stops a drill definition from silently pointing
// at a bar that does not exist.

interface Manifest {
  generated: string
  symbols: Array<{ symbol: string; bars: number; firstDate: string; lastDate: string }>
}

const dataPath = (rel: string) => fileURLToPath(new URL(`../public/data/${rel}`, import.meta.url))
const readJson = <T>(rel: string): T => JSON.parse(readFileSync(dataPath(rel), 'utf8')) as T

const manifest = readJson<Manifest>('manifest.json')
const seriesCache = new Map<string, OhlcvSeries>()
function loadSeries(symbol: string): OhlcvSeries {
  let s = seriesCache.get(symbol)
  if (!s) {
    s = readJson<OhlcvSeries>(`ohlcv/${symbol}.json`)
    seriesCache.set(symbol, s)
  }
  return s
}

describe('bundled dataset', () => {
  it('has a manifest naming every expected symbol', () => {
    expect(['synthetic', 'stooq']).toContain(manifest.generated)
    expect(manifest.symbols.length).toBe(27)
    for (const s of ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'SPY', 'QQQ']) {
      expect(manifest.symbols.map((m) => m.symbol)).toContain(s)
    }
  })

  it('manifest entries agree with the series files', () => {
    for (const entry of manifest.symbols) {
      const s = loadSeries(entry.symbol)
      expect(s.symbol).toBe(entry.symbol)
      expect(s.t.length).toBe(entry.bars)
      expect(new Date(s.t[0] * 1000).toISOString().slice(0, 10)).toBe(entry.firstDate)
      expect(new Date(s.t[s.t.length - 1] * 1000).toISOString().slice(0, 10)).toBe(entry.lastDate)
    }
  })

  it('every series satisfies the OHLC invariants', () => {
    for (const entry of manifest.symbols) {
      expect(validateSeries(loadSeries(entry.symbol))).toEqual([])
    }
  })

  it('carries enough history for the longest drill window', () => {
    for (const entry of manifest.symbols) {
      expect(entry.bars).toBeGreaterThanOrEqual(2000)
    }
  })
})

describe('pattern drill definitions', () => {
  it('ships a usable number of drills', () => {
    expect(PATTERN_DRILLS.length).toBeGreaterThanOrEqual(35)
  })

  it('has unique ids', () => {
    const ids = PATTERN_DRILLS.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(PATTERN_DRILLS.map((d) => [d.id, d] as const))('%s is well formed', (_id, d) => {
    // Symbol exists in the manifest.
    expect(manifest.symbols.map((m) => m.symbol)).toContain(d.symbol)
    const s = loadSeries(d.symbol)

    // Window is ordered, in bounds, and long enough to show a shape.
    expect(Number.isInteger(d.startIdx)).toBe(true)
    expect(Number.isInteger(d.endIdx)).toBe(true)
    expect(d.startIdx).toBeGreaterThanOrEqual(0)
    expect(d.endIdx).toBeLessThan(s.t.length)
    expect(d.endIdx - d.startIdx).toBeGreaterThanOrEqual(40)

    // Four distinct choices, and the answer is not hiding among the distractors.
    expect(d.distractors).toHaveLength(3)
    expect(new Set([d.answer, ...d.distractors]).size).toBe(4)

    // Every choice is a known label with a display name.
    for (const p of [d.answer, ...d.distractors]) expect(PATTERN_LABELS[p]).toBeTruthy()

    // A teaching explanation, not a placeholder.
    expect(d.explain.length).toBeGreaterThan(80)
  })

  it('covers a range of answers and symbols', () => {
    expect(new Set(PATTERN_DRILLS.map((d) => d.answer)).size).toBeGreaterThanOrEqual(8)
    expect(new Set(PATTERN_DRILLS.map((d) => d.symbol)).size).toBeGreaterThanOrEqual(10)
  })
})

describe('what-next drill definitions', () => {
  it('ships a usable number of drills with unique ids', () => {
    expect(WHATNEXT_DRILLS.length).toBeGreaterThanOrEqual(25)
    expect(new Set(WHATNEXT_DRILLS.map((d) => d.id)).size).toBe(WHATNEXT_DRILLS.length)
  })

  it.each(WHATNEXT_DRILLS.map((d) => [d.id, d] as const))('%s is well formed', (_id, d) => {
    expect(manifest.symbols.map((m) => m.symbol)).toContain(d.symbol)
    const s = loadSeries(d.symbol)

    expect(d.horizon).toBe(10)
    // Enough lead-in to draw the ~120-bar chart the player sees…
    expect(d.cutoffIdx).toBeGreaterThanOrEqual(130)
    // …and enough tail for the reveal.
    expect(d.cutoffIdx + 140).toBeLessThanOrEqual(s.t.length)

    // The ground-truth return must be computable.
    expect(() => lastCloseReturn(s, d.cutoffIdx, d.horizon)).not.toThrow()
  })

  it('is not dominated by any one outcome', () => {
    const counts = { up: 0, flat: 0, down: 0 }
    for (const d of WHATNEXT_DRILLS) {
      counts[whatNextOutcome(lastCloseReturn(loadSeries(d.symbol), d.cutoffIdx, d.horizon))]++
    }
    // Always answering the most common outcome must not beat a coin flip badly.
    const most = Math.max(counts.up, counts.flat, counts.down)
    expect(most / WHATNEXT_DRILLS.length).toBeLessThanOrEqual(0.45)
    expect(counts.up).toBeGreaterThan(0)
    expect(counts.flat).toBeGreaterThan(0)
    expect(counts.down).toBeGreaterThan(0)
  })

  it('keeps every outcome clear of the ±2% boundary', () => {
    for (const d of WHATNEXT_DRILLS) {
      const r = lastCloseReturn(loadSeries(d.symbol), d.cutoffIdx, d.horizon)
      // No window may sit within half a percent of the classification cut,
      // otherwise the "correct" answer is a coin toss the learner cannot see.
      expect(Math.abs(Math.abs(r) - OUTCOME_THRESHOLD)).toBeGreaterThan(0.005)
    }
  })

  it('spreads across symbols and eras', () => {
    expect(new Set(WHATNEXT_DRILLS.map((d) => d.symbol)).size).toBeGreaterThanOrEqual(20)
    const eras = new Set(WHATNEXT_DRILLS.map((d) => Math.floor(d.cutoffIdx / 300)))
    expect(eras.size).toBeGreaterThanOrEqual(6)
  })
})

describe('engine over the real content', () => {
  it('always produces a drill for any day of the next two years', () => {
    let day = '2026-08-25'
    for (let i = 0; i < 730; i++) {
      const picked = pickDailyDrill(PATTERN_DRILLS, WHATNEXT_DRILLS, EMPTY, day)
      expect(picked).not.toBeNull()
      day = addDays(day, 1)
    }
  })

  it('keeps serving drills as history accumulates', () => {
    const results: DrillResult[] = []
    let day = '2026-08-25'
    for (let i = 0; i < 200; i++) {
      const picked = pickDailyDrill(PATTERN_DRILLS, WHATNEXT_DRILLS, { results }, day)!
      expect(picked).not.toBeNull()
      // Answer everything correctly — the harshest case for the exclusion rule.
      results.push({ drillId: picked.def.id, kind: picked.kind, date: day, correct: true, score: 10 })
      day = addDays(day, 1)
    }
    expect(results).toHaveLength(200)
  })
})
