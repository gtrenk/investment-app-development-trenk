#!/usr/bin/env node
// ─── Dataset gate ────────────────────────────────────────────────────────────
//
//   node scripts/validate-data.mjs                       # check public/data
//   node scripts/validate-data.mjs --data=public/data --min-bars=2000
//   node scripts/validate-data.mjs --expect-symbols=27
//
// Exits non-zero, loudly, when the committed dataset is not fit to ship. The
// refresh workflow runs this straight after `fetch-data.mjs` so a bad fetch is
// caught *before* the curator rebuilds every drill window against it and before
// anything is pushed to main — a half-downloaded series would otherwise sail
// through as a valid-looking file with 40 bars in it.
//
// Checks: manifest agrees with the files, OHLC invariants hold, timestamps
// strictly increase, and no symbol is shorter than `--min-bars`.
//
// No dependencies beyond node builtins.

import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** A series shorter than this cannot carry the drill windows. */
const DEFAULT_MIN_BARS = 2000

/** Per-symbol provenance `scripts/fetch-data.mjs` records in the manifest. */
const PROVIDERS = ['stooq', 'yahoo', 'kept']

function parseArgs(argv) {
  const opts = { data: join(ROOT, 'public', 'data'), minBars: DEFAULT_MIN_BARS, expectSymbols: 0 }
  for (const arg of argv) {
    const m = /^--([\w-]+)=(.*)$/.exec(arg)
    if (!m) continue
    const [, key, val] = m
    if (key === 'data') opts.data = resolve(process.cwd(), val)
    else if (key === 'min-bars') opts.minBars = Number(val)
    else if (key === 'expect-symbols') opts.expectSymbols = Number(val)
  }
  return opts
}

/** Structural check on one series. Mirrors `validateSeries` in src/core. */
export function checkSeries(series, minBars) {
  const errs = []
  const { symbol, t, o, h, l, c, v } = series
  if (series.interval !== '1d') errs.push(`interval is '${series.interval}', expected '1d'`)
  const n = Array.isArray(t) ? t.length : 0
  for (const [name, arr] of [['o', o], ['h', h], ['l', l], ['c', c], ['v', v]]) {
    if (!Array.isArray(arr) || arr.length !== n) errs.push(`${name} has ${arr?.length} entries, t has ${n}`)
  }
  if (errs.length > 0) return errs
  if (n < minBars) errs.push(`only ${n} bars (minimum ${minBars})`)

  for (let i = 0; i < n; i++) {
    if (![o[i], h[i], l[i], c[i]].every((x) => Number.isFinite(x) && x > 0)) {
      errs.push(`bar ${i}: prices must be finite and positive`)
      break
    }
    if (h[i] < Math.max(o[i], c[i])) { errs.push(`bar ${i}: h < max(o, c)`); break }
    if (l[i] > Math.min(o[i], c[i])) { errs.push(`bar ${i}: l > min(o, c)`); break }
    if (!Number.isFinite(v[i]) || v[i] < 0) { errs.push(`bar ${i}: invalid volume`); break }
    if (i > 0 && t[i] <= t[i - 1]) { errs.push(`bar ${i}: timestamps not strictly increasing`); break }
  }
  return errs.map((e) => `${symbol}: ${e}`)
}

function main() {
  const { data, minBars, expectSymbols } = parseArgs(process.argv.slice(2))
  const manifestPath = join(data, 'manifest.json')
  if (!existsSync(manifestPath)) {
    console.error(`No manifest at ${manifestPath}`)
    process.exit(1)
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const problems = []

  if (!['synthetic', 'stooq'].includes(manifest.generated)) {
    problems.push(`manifest.generated is '${manifest.generated}', expected 'synthetic' or 'stooq'`)
  }
  // `generated` names the pipeline; `symbols[].source` names the host that
  // actually answered for each symbol, and is absent on synthetic data.
  for (const entry of manifest.symbols) {
    if (entry.source !== undefined && !PROVIDERS.includes(entry.source)) {
      problems.push(`${entry.symbol}: unknown source '${entry.source}'`)
    }
  }
  if (expectSymbols && manifest.symbols.length !== expectSymbols) {
    problems.push(`manifest lists ${manifest.symbols.length} symbols, expected ${expectSymbols}`)
  }

  for (const entry of manifest.symbols) {
    const file = join(data, 'ohlcv', `${entry.symbol}.json`)
    if (!existsSync(file)) {
      problems.push(`${entry.symbol}: manifest lists it but ${file} is missing`)
      continue
    }
    const series = JSON.parse(readFileSync(file, 'utf8'))
    problems.push(...checkSeries(series, minBars))
    if (series.symbol !== entry.symbol) problems.push(`${entry.symbol}: file says symbol is '${series.symbol}'`)
    if (series.t.length !== entry.bars) {
      problems.push(`${entry.symbol}: manifest says ${entry.bars} bars, file has ${series.t.length}`)
    }
    const iso = (s) => new Date(s * 1000).toISOString().slice(0, 10)
    if (series.t.length > 0) {
      if (iso(series.t[0]) !== entry.firstDate) problems.push(`${entry.symbol}: firstDate disagrees with the file`)
      if (iso(series.t[series.t.length - 1]) !== entry.lastDate) {
        problems.push(`${entry.symbol}: lastDate disagrees with the file`)
      }
    }
  }

  if (problems.length > 0) {
    console.error(`\n${problems.length} problem(s) in ${data}:`)
    for (const p of problems) console.error(`  ✗ ${p}`)
    process.exit(1)
  }

  const bars = manifest.symbols.map((s) => s.bars)
  console.log(
    `✓ ${manifest.symbols.length} ${manifest.generated} series in ${data} — ` +
    `${Math.min(...bars)}…${Math.max(...bars)} bars each, all invariants hold`,
  )

  // Surface the provider mix: a refresh that ran entirely off the fallback, or
  // that kept most of last month's bars, is a healthy-looking run worth a look.
  const counts = {}
  for (const entry of manifest.symbols) if (entry.source) counts[entry.source] = (counts[entry.source] ?? 0) + 1
  const mix = Object.entries(counts).map(([k, n]) => `${n} ${k}`).join(' · ')
  if (mix) console.log(`  sources: ${mix}`)
  if (counts.kept >= manifest.symbols.length / 2) {
    console.warn(`  ⚠ ${counts.kept} of ${manifest.symbols.length} symbols kept their previous bars — the fetch mostly failed.`)
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main()
}
