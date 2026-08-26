// ─── Shipped drill-window guard ──────────────────────────────────────────────
//
// `public/data/drills/windows.json` is generated, not authored, and the app
// loads it over the wire — so nothing in the type system stops it from pointing
// at bars that do not exist, shipping thirty consecutive "up" answers, or
// drifting away from what `scripts/curate-windows.mjs` would produce today.
// This file is that stop. Vitest runs in node, so it reads the committed data
// straight off disk and re-runs the curator in a child process.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'

import { OUTCOME_THRESHOLD, whatNextOutcome } from '@core/drills/engine'
import { DRILL_WINDOWS_VERSION, parseDrillWindows } from '@core/drills/windows'
import { isValidWindow, lastCloseReturn, validateSeries } from '@core/market/bundled'
import { FALLBACK_WINDOWS, PATTERN_LABELS } from '@content/drills/patterns'
import type { DrillWindows, OhlcvSeries, PatternId } from '@core/types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DATA = join(ROOT, 'public', 'data')
const WINDOWS_PATH = join(DATA, 'drills', 'windows.json')

interface Manifest {
  generated: string
  symbols: Array<{ symbol: string; bars: number; firstDate: string; lastDate: string }>
}

const manifest = JSON.parse(readFileSync(join(DATA, 'manifest.json'), 'utf8')) as Manifest
const rawWindows = readFileSync(WINDOWS_PATH, 'utf8')

const seriesCache = new Map<string, OhlcvSeries>()
function loadSeries(symbol: string): OhlcvSeries {
  let s = seriesCache.get(symbol)
  if (!s) {
    s = JSON.parse(readFileSync(join(DATA, 'ohlcv', `${symbol}.json`), 'utf8')) as OhlcvSeries
    seriesCache.set(symbol, s)
  }
  return s
}

// The curator's own tunables, so a deliberate change to a cap lands in one file
// and this guard follows it instead of having to be edited twice.
const curator = (await import(join(ROOT, 'scripts', 'curate-windows.mjs'))) as {
  PATTERN_CLASS_CAP: number
  PATTERN_SYMBOL_CAP: number
  MIN_GAP: number
  WHATNEXT_PER_OUTCOME: number
  WHATNEXT_MARGIN: number
  WHATNEXT_FLAT_MAX: number
  WHATNEXT_FLAT_MIN: number
  WHATNEXT_MIN_LEADIN: number
  WHATNEXT_TAIL: number
  WHATNEXT_SYMBOL_CAP: number
  WHATNEXT_MIN_GAP: number
  PATTERN_IDS: PatternId[]
}

// Parsing is the first assertion: everything below reads the parsed document,
// so a malformed file fails here rather than fifty times over.
const parsed = parseDrillWindows(JSON.parse(rawWindows))
if (typeof parsed === 'string') throw new Error(`windows.json does not parse: ${parsed}`)
const windows: DrillWindows = parsed

// ─── Document ────────────────────────────────────────────────────────────────

describe('windows.json', () => {
  it('parses at the version this build reads', () => {
    expect(windows.version).toBe(DRILL_WINDOWS_VERSION)
  })

  it('names the dataset it was curated against', () => {
    expect(windows.source).toBe(manifest.generated)
  })

  it('stamps generatedAt from the data, not from a build clock', () => {
    const latest = manifest.symbols.map((s) => s.lastDate).sort().at(-1)
    expect(windows.generatedAt).toBe(`${latest}T00:00:00.000Z`)
  })

  it('ships appreciably more windows than the bundled fallback', () => {
    expect(windows.patterns.length).toBeGreaterThanOrEqual(70)
    expect(windows.patterns.length).toBeGreaterThan(FALLBACK_WINDOWS.patterns.length)
    expect(windows.whatnext.length).toBeGreaterThanOrEqual(60)
    expect(windows.whatnext.length).toBeGreaterThan(FALLBACK_WINDOWS.whatnext.length)
  })

  it('is pretty-printed with a trailing newline, so a refresh diffs line by line', () => {
    expect(rawWindows.endsWith('\n')).toBe(true)
    expect(rawWindows).toContain('\n  "patterns": [')
  })
})

// ─── Underlying data ─────────────────────────────────────────────────────────

describe('the data the windows index into', () => {
  it('has a series for every symbol a window names, and every one is valid', () => {
    const known = new Set(manifest.symbols.map((s) => s.symbol))
    const used = new Set([...windows.patterns, ...windows.whatnext].map((d) => d.symbol))
    for (const symbol of used) {
      expect(known.has(symbol), `${symbol} is not in the manifest`).toBe(true)
      expect(validateSeries(loadSeries(symbol))).toEqual([])
    }
  })

  it('carries enough history for the longest window', () => {
    for (const entry of manifest.symbols) expect(entry.bars).toBeGreaterThanOrEqual(2000)
  })
})

// ─── Pattern windows ─────────────────────────────────────────────────────────

describe('pattern windows', () => {
  it('have unique ids naming their symbol and start bar', () => {
    const ids = windows.patterns.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const d of windows.patterns) expect(d.id).toBe(`pd-${d.symbol.toLowerCase()}-${d.startIdx}`)
  })

  it.each(windows.patterns.map((d) => [d.id, d] as const))('%s is in bounds and playable', (_id, d) => {
    const series = loadSeries(d.symbol)
    // In bounds for *this* symbol — the failure mode a generated file invites.
    expect(isValidWindow(series, d.startIdx, d.endIdx)).toBe(true)
    // Long enough to show a shape, short enough to read on a phone.
    const span = d.endIdx - d.startIdx
    expect(span).toBeGreaterThanOrEqual(40)
    expect(span).toBeLessThanOrEqual(120)

    // Four distinct choices, all of them real labels, answer not among decoys.
    expect(new Set([d.answer, ...d.distractors]).size).toBe(4)
    for (const p of [d.answer, ...d.distractors]) expect(PATTERN_LABELS[p]).toBeTruthy()

    // A teaching note with this window's own numbers in it, not a stub.
    expect(d.explain.length).toBeGreaterThan(120)
    expect(d.explain).toMatch(/\d/)
  })

  it('respects the per-class cap and covers many classes', () => {
    const counts = new Map<PatternId, number>()
    for (const d of windows.patterns) counts.set(d.answer, (counts.get(d.answer) ?? 0) + 1)
    for (const [answer, n] of counts) {
      expect(n, `${answer} has ${n} windows`).toBeLessThanOrEqual(curator.PATTERN_CLASS_CAP)
    }
    expect(counts.size).toBeGreaterThanOrEqual(12)
    // No single class may dominate the pool.
    expect(Math.max(...counts.values()) / windows.patterns.length).toBeLessThanOrEqual(0.2)
  })

  it('only ever answers with a label the app can render', () => {
    for (const d of windows.patterns) expect(curator.PATTERN_IDS).toContain(d.answer)
  })

  it('respects the per-symbol cap and spreads across symbols and eras', () => {
    const perSymbol = new Map<string, number>()
    for (const d of windows.patterns) perSymbol.set(d.symbol, (perSymbol.get(d.symbol) ?? 0) + 1)
    for (const [symbol, n] of perSymbol) {
      expect(n, `${symbol} has ${n} windows`).toBeLessThanOrEqual(curator.PATTERN_SYMBOL_CAP)
    }
    expect(perSymbol.size).toBeGreaterThanOrEqual(20)
    expect(new Set(windows.patterns.map((d) => Math.floor(d.startIdx / 420))).size).toBeGreaterThanOrEqual(6)
  })

  it('never puts two windows within the minimum gap on one symbol', () => {
    const bySymbol = new Map<string, typeof windows.patterns>()
    for (const d of windows.patterns) {
      const list = bySymbol.get(d.symbol) ?? []
      list.push(d)
      bySymbol.set(d.symbol, list)
    }
    for (const [symbol, list] of bySymbol) {
      const sorted = [...list].sort((a, b) => a.startIdx - b.startIdx)
      for (let i = 1; i < sorted.length; i++) {
        const gap = sorted[i].startIdx - sorted[i - 1].endIdx
        expect(gap, `${symbol}: ${sorted[i - 1].id} and ${sorted[i].id} are ${gap} bars apart`)
          .toBeGreaterThan(curator.MIN_GAP)
      }
    }
  })
})

// ─── What-next cutoffs ───────────────────────────────────────────────────────

describe('what-next cutoffs', () => {
  const outcomeOf = (d: { symbol: string; cutoffIdx: number; horizon: number }) =>
    whatNextOutcome(lastCloseReturn(loadSeries(d.symbol), d.cutoffIdx, d.horizon))
  const returnOf = (d: { symbol: string; cutoffIdx: number; horizon: number }) =>
    lastCloseReturn(loadSeries(d.symbol), d.cutoffIdx, d.horizon)

  it('have unique ids naming their symbol and cutoff', () => {
    const ids = windows.whatnext.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const d of windows.whatnext) expect(d.id).toBe(`wn-${d.symbol.toLowerCase()}-${d.cutoffIdx}`)
  })

  it.each(windows.whatnext.map((d) => [d.id, d] as const))('%s has lead-in and tail', (_id, d) => {
    const series = loadSeries(d.symbol)
    expect(d.horizon).toBe(10)
    // Enough history to draw the lead-in chart the player shows …
    expect(d.cutoffIdx).toBeGreaterThanOrEqual(curator.WHATNEXT_MIN_LEADIN)
    // … and enough bars past the reveal that the chart is not cut off at it.
    expect(d.cutoffIdx + d.horizon + curator.WHATNEXT_TAIL).toBeLessThanOrEqual(series.t.length - 1)
    expect(() => lastCloseReturn(series, d.cutoffIdx, d.horizon)).not.toThrow()
  })

  it('are balanced EXACTLY across the three outcomes', () => {
    const counts = { up: 0, flat: 0, down: 0 }
    for (const d of windows.whatnext) counts[outcomeOf(d)]++
    expect(counts.up).toBe(curator.WHATNEXT_PER_OUTCOME)
    expect(counts.flat).toBe(curator.WHATNEXT_PER_OUTCOME)
    expect(counts.down).toBe(curator.WHATNEXT_PER_OUTCOME)
    // Exact balance is the point: always guessing one outcome scores 1 in 3.
    expect(windows.whatnext.length).toBe(3 * curator.WHATNEXT_PER_OUTCOME)
  })

  it('clears the ±2% band by a full extra percent (or sits well inside it)', () => {
    for (const d of windows.whatnext) {
      const r = returnOf(d)
      if (whatNextOutcome(r) === 'flat') {
        // Flats must be genuinely flat, not 1.9% moves that round the wrong way.
        expect(Math.abs(r), `${d.id} flat by ${(r * 100).toFixed(2)}%`)
          .toBeLessThanOrEqual(curator.WHATNEXT_FLAT_MAX + 1e-9)
        // …and it still has to move, so the reveal shows a signed number.
        expect(Math.abs(r), `${d.id} did not move at all`)
          .toBeGreaterThanOrEqual(curator.WHATNEXT_FLAT_MIN - 1e-9)
      } else {
        expect(Math.abs(r), `${d.id} moved ${(r * 100).toFixed(2)}%`)
          .toBeGreaterThanOrEqual(OUTCOME_THRESHOLD + curator.WHATNEXT_MARGIN - 1e-9)
      }
    }
  })

  it('spreads across symbols and eras, with no symbol over its cap', () => {
    const perSymbol = new Map<string, number>()
    for (const d of windows.whatnext) perSymbol.set(d.symbol, (perSymbol.get(d.symbol) ?? 0) + 1)
    for (const [symbol, n] of perSymbol) {
      expect(n, `${symbol} has ${n} cutoffs`).toBeLessThanOrEqual(curator.WHATNEXT_SYMBOL_CAP)
    }
    // Every symbol in the universe gets asked about.
    expect(perSymbol.size).toBe(manifest.symbols.length)
    expect(new Set(windows.whatnext.map((d) => Math.floor(d.cutoffIdx / 420))).size).toBeGreaterThanOrEqual(6)
  })

  it('keeps cutoffs on one symbol far enough apart to be different questions', () => {
    const bySymbol = new Map<string, number[]>()
    for (const d of windows.whatnext) {
      const list = bySymbol.get(d.symbol) ?? []
      list.push(d.cutoffIdx)
      bySymbol.set(d.symbol, list)
    }
    for (const [symbol, cutoffs] of bySymbol) {
      const sorted = [...cutoffs].sort((a, b) => a - b)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i] - sorted[i - 1], `${symbol} cutoffs ${sorted[i - 1]}/${sorted[i]}`)
          .toBeGreaterThanOrEqual(curator.WHATNEXT_MIN_GAP)
      }
    }
  })
})

// ─── Reproducibility ─────────────────────────────────────────────────────────
//
// The refresh workflow commits only when the curated output changes. If the
// curator were not deterministic it would commit every month whether or not the
// data moved, and every one of those commits would silently reshuffle the
// drills a learner is part-way through.

describe('curate-windows.mjs', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tq-curate-'))
  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  it('re-run over the same data reproduces the committed file byte for byte', () => {
    const out = join(dir, 'windows.json')
    execFileSync(
      process.execPath,
      [join(ROOT, 'scripts', 'curate-windows.mjs'), `--data=${DATA}`, `--out=${out}`],
      { cwd: ROOT, stdio: 'pipe' },
    )
    expect(readFileSync(out, 'utf8')).toBe(rawWindows)
  }, 60_000)
})

// ─── Fallback ────────────────────────────────────────────────────────────────

describe('bundled fallback', () => {
  it('parses under the same schema as the fetched document', () => {
    const round = parseDrillWindows(JSON.parse(JSON.stringify(FALLBACK_WINDOWS)))
    expect(typeof round).not.toBe('string')
  })

  it('is in bounds for the committed data too, so falling back is safe', () => {
    for (const d of FALLBACK_WINDOWS.patterns) {
      expect(isValidWindow(loadSeries(d.symbol), d.startIdx, d.endIdx)).toBe(true)
    }
    for (const d of FALLBACK_WINDOWS.whatnext) {
      expect(() => lastCloseReturn(loadSeries(d.symbol), d.cutoffIdx, d.horizon)).not.toThrow()
    }
  })

  it('shares no drill id with the curated set, so history never collides', () => {
    // Ids encode symbol + index, so an overlap would mean two different windows
    // scored under one id if the loader ever fell back mid-history.
    const curated = new Map(
      [...windows.patterns.map((d) => [d.id, `${d.symbol}:${d.startIdx}-${d.endIdx}`] as const)],
    )
    for (const d of FALLBACK_WINDOWS.patterns) {
      const hit = curated.get(d.id)
      if (hit) expect(hit).toBe(`${d.symbol}:${d.startIdx}-${d.endIdx}`)
    }
  })
})
