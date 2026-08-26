#!/usr/bin/env node
// ─── Drill-window contact sheet (PNG, no dependencies) ───────────────────────
//
//   node scripts/render-windows.mjs                       # 15 random windows
//   node scripts/render-windows.mjs --out=/tmp/shots      # default: test-results/window-shots
//   node scripts/render-windows.mjs --answer=rising-wedge # only that class
//   node scripts/render-windows.mjs --n=20 --seed=7
//   node scripts/render-windows.mjs --whatnext            # what-next cutoffs
//
// The curator's detectors are strict, but "strict" is a claim about arithmetic,
// not about whether a human can look at the chart and name the shape. This
// renders selected windows as candlestick PNGs so that claim can be checked by
// eye — the same eyeball pass the original hand-curated windows went through.
//
// For the envelope family (triangles and wedges) the two fitted boundary lines
// are drawn over the candles, because that is exactly where a detector can be
// arithmetically satisfied and visually wrong.
//
// Pure node: a minimal PNG encoder over `node:zlib`, no image library.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { envelope, makeContext } from './curate-windows.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// ─── Minimal PNG encoder ─────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

/** Encode an RGB byte raster (w × h × 3) as a PNG buffer. */
function encodePng(rgb, w, h) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // colour type: truecolour
  const raw = Buffer.alloc(h * (w * 3 + 1))
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0 // filter: none
    rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ─── Canvas ──────────────────────────────────────────────────────────────────

function canvas(w, h, bg) {
  const buf = Buffer.alloc(w * h * 3)
  for (let i = 0; i < w * h; i++) {
    buf[i * 3] = bg[0]
    buf[i * 3 + 1] = bg[1]
    buf[i * 3 + 2] = bg[2]
  }
  const px = (x, y, col) => {
    x = Math.round(x); y = Math.round(y)
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const o = (y * w + x) * 3
    buf[o] = col[0]; buf[o + 1] = col[1]; buf[o + 2] = col[2]
  }
  return {
    buf, w, h, px,
    vline(x, y0, y1, col) {
      const a = Math.min(y0, y1), b = Math.max(y0, y1)
      for (let y = a; y <= b; y++) px(x, y, col)
    },
    rect(x0, y0, x1, y1, col) {
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) {
        for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) px(x, y, col)
      }
    },
    /** Dashed line, so overlays never read as price. */
    line(x0, y0, x1, y1, col, dash = 6) {
      const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))
      for (let i = 0; i <= steps; i++) {
        if (dash && Math.floor(i / dash) % 2 === 1) continue
        px(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, col)
      }
    },
  }
}

const BG = [15, 23, 42]
const GRID = [30, 41, 59]
const UP = [52, 211, 153]
const DOWN = [248, 113, 113]
const LINE = [250, 204, 21]
const MARK = [125, 211, 252]

/**
 * Candlestick chart of `[s, e]`, optionally with `overlay` lines
 * (`{ at(i) }` functions) and vertical `marks` at given bar indices.
 */
function renderWindow(series, s, e, { overlay = [], marks = [], reveal = -1 } = {}) {
  const W = 1000
  const H = 460
  const PAD = 24
  const cv = canvas(W, H, BG)

  const n = e - s + 1
  let lo = Infinity
  let hi = -Infinity
  for (let i = s; i <= e; i++) { lo = Math.min(lo, series.l[i]); hi = Math.max(hi, series.h[i]) }
  for (const line of overlay) {
    lo = Math.min(lo, line.at(s), line.at(e))
    hi = Math.max(hi, line.at(s), line.at(e))
  }
  const span = hi - lo || 1
  lo -= span * 0.06
  hi += span * 0.06

  const yOf = (p) => PAD + ((hi - p) / (hi - lo)) * (H - 2 * PAD)
  const slot = (W - 2 * PAD) / n
  const xOf = (i) => PAD + (i - s + 0.5) * slot
  const bodyW = Math.max(1, Math.floor(slot * 0.62))

  for (let g = 1; g < 6; g++) {
    const y = PAD + (g * (H - 2 * PAD)) / 6
    for (let x = PAD; x < W - PAD; x += 3) cv.px(x, y, GRID)
  }

  // The revealed tail of a what-next drill gets a dimmer background.
  if (reveal >= 0) cv.rect(xOf(reveal) - slot / 2, PAD, W - PAD, H - PAD, [23, 33, 56])

  for (let i = s; i <= e; i++) {
    const col = series.c[i] >= series.o[i] ? UP : DOWN
    const x = xOf(i)
    cv.vline(x, yOf(series.h[i]), yOf(series.l[i]), col)
    const top = yOf(Math.max(series.o[i], series.c[i]))
    const bot = yOf(Math.min(series.o[i], series.c[i]))
    cv.rect(x - bodyW / 2, top, x + bodyW / 2, Math.max(bot, top + 1), col)
  }

  for (const line of overlay) cv.line(xOf(s), yOf(line.at(s)), xOf(e), yOf(line.at(e)), LINE)
  for (const m of marks) cv.vline(xOf(m), PAD, H - PAD, MARK)

  return encodePng(cv.buf, W, H)
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function mulberry32(seed) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ENVELOPE_CLASSES = new Set([
  'ascending-triangle', 'descending-triangle', 'symmetrical-triangle', 'rising-wedge', 'falling-wedge',
])

function parseArgs(argv) {
  const opts = {
    data: join(ROOT, 'public', 'data'),
    windows: null,
    // Under test-results/, which .gitignore already covers — a contact sheet
    // is a thing you look at once, not a thing you commit.
    out: join(ROOT, 'test-results', 'window-shots'),
    n: 15,
    seed: 1,
    answer: null,
    whatnext: false,
  }
  for (const arg of argv) {
    if (arg === '--whatnext') { opts.whatnext = true; continue }
    const m = /^--([\w-]+)=(.*)$/.exec(arg)
    if (!m) continue
    const [, k, v] = m
    if (k === 'data') opts.data = resolve(process.cwd(), v)
    else if (k === 'windows') opts.windows = resolve(process.cwd(), v)
    else if (k === 'out') opts.out = resolve(process.cwd(), v)
    else if (k === 'n') opts.n = Number(v)
    else if (k === 'seed') opts.seed = Number(v)
    else if (k === 'answer') opts.answer = v
  }
  if (!opts.windows) opts.windows = join(opts.data, 'drills', 'windows.json')
  return opts
}

function main() {
  const opts = parseArgs(process.argv.slice(2))
  const doc = JSON.parse(readFileSync(opts.windows, 'utf8'))
  mkdirSync(opts.out, { recursive: true })

  const seriesCache = new Map()
  const load = (symbol) => {
    let s = seriesCache.get(symbol)
    if (!s) {
      s = JSON.parse(readFileSync(join(opts.data, 'ohlcv', `${symbol}.json`), 'utf8'))
      seriesCache.set(symbol, s)
    }
    return s
  }

  let pool = opts.whatnext ? doc.whatnext : doc.patterns
  if (opts.answer) pool = pool.filter((d) => d.answer === opts.answer)

  const rng = mulberry32(opts.seed)
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const sample = shuffled.slice(0, Math.min(opts.n, shuffled.length))

  sample.forEach((d, k) => {
    const series = load(d.symbol)
    let png
    let name
    if (opts.whatnext) {
      const from = Math.max(0, d.cutoffIdx - 120)
      const to = d.cutoffIdx + d.horizon
      png = renderWindow(series, from, to, { marks: [d.cutoffIdx], reveal: d.cutoffIdx + 1 })
      name = `${String(k).padStart(2, '0')}_whatnext_${d.symbol}_${d.cutoffIdx}.png`
    } else {
      const overlay = []
      if (ENVELOPE_CLASSES.has(d.answer)) {
        const env = envelope(makeContext(series), d.startIdx, d.endIdx)
        if (env) overlay.push(env.up, env.dn)
      }
      png = renderWindow(series, d.startIdx, d.endIdx, { overlay })
      name = `${String(k).padStart(2, '0')}_${d.answer}_${d.symbol}_${d.startIdx}-${d.endIdx}.png`
    }
    writeFileSync(join(opts.out, name), png)
    console.log(name)
  })

  console.log(`\n${sample.length} chart(s) → ${opts.out}`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main()
}
