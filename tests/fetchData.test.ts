// Unit tests for the pure half of `scripts/fetch-data.mjs`.
//
// The HTTP call itself cannot be exercised here (the sandbox this was built in
// blocks stooq.com), so everything that does not touch the network is pinned
// down instead: URL construction, CSV parsing, and the year trim.
//
// The module is loaded through a computed specifier so `tsc` treats it as
// `any` — `scripts/` is deliberately outside the TypeScript project.

import { beforeAll, describe, expect, it } from 'vitest'

interface OhlcvLike {
  symbol: string
  interval: string
  t: number[]
  o: number[]
  h: number[]
  l: number[]
  c: number[]
  v: number[]
}

let parseStooqCsv: (symbol: string, csv: string) => OhlcvLike
let trimToYears: (series: OhlcvLike, years: number) => OhlcvLike
let stooqUrl: (symbol: string) => string
let DEFAULT_SYMBOLS: string[]

beforeAll(async () => {
  const specifier = new URL('../scripts/fetch-data.mjs', import.meta.url).href
  const mod = await import(/* @vite-ignore */ specifier)
  ;({ parseStooqCsv, trimToYears, stooqUrl, DEFAULT_SYMBOLS } = mod)
})

const HEADER = 'Date,Open,High,Low,Close,Volume'
const CSV = [
  HEADER,
  '2016-12-27,115.80,117.80,115.61,117.26,18296855',
  '2016-12-28,117.52,118.02,116.20,116.76,20905892',
  '2016-12-29,116.45,117.11,116.40,116.73,15039519',
].join('\n')

describe('stooqUrl', () => {
  it('lower-cases and appends the .us suffix', () => {
    expect(stooqUrl('AAPL')).toBe('https://stooq.com/q/d/l/?s=aapl.us&i=d')
  })

  it('maps dotted class shares to the dashed Stooq form', () => {
    expect(stooqUrl('BRK.B')).toBe('https://stooq.com/q/d/l/?s=brk-b.us&i=d')
  })

  it('covers the 27 bundled symbols', () => {
    expect(DEFAULT_SYMBOLS).toHaveLength(27)
    expect(DEFAULT_SYMBOLS).toContain('SPY')
    expect(DEFAULT_SYMBOLS).toContain('QQQ')
  })
})

describe('parseStooqCsv', () => {
  it('parses a well-formed CSV into columnar arrays', () => {
    const s = parseStooqCsv('AAPL', CSV)
    expect(s.symbol).toBe('AAPL')
    expect(s.interval).toBe('1d')
    expect(s.t).toHaveLength(3)
    expect(s.c).toEqual([117.26, 116.76, 116.73])
    expect(s.o[0]).toBe(115.8)
    expect(s.v).toEqual([18296855, 20905892, 15039519])
  })

  it('converts dates to UTC-midnight unix seconds, oldest first', () => {
    const s = parseStooqCsv('AAPL', CSV)
    expect(s.t[0]).toBe(Date.parse('2016-12-27T00:00:00Z') / 1000)
    expect(s.t[1] - s.t[0]).toBe(86400)
  })

  it('tolerates CRLF line endings and trailing blank lines', () => {
    const s = parseStooqCsv('AAPL', CSV.split('\n').join('\r\n') + '\r\n\r\n')
    expect(s.t).toHaveLength(3)
  })

  it('locates columns by header name, not position', () => {
    const reordered = [
      'Volume,Close,Date,Low,High,Open',
      '18296855,117.26,2016-12-27,115.61,117.80,115.80',
    ].join('\n')
    const s = parseStooqCsv('AAPL', reordered)
    expect(s.c).toEqual([117.26])
    expect(s.o).toEqual([115.8])
    expect(s.h).toEqual([117.8])
    expect(s.l).toEqual([115.61])
  })

  it('drops rows with unusable prices instead of emitting NaN', () => {
    const dirty = [HEADER, '2016-12-27,N/A,N/A,N/A,N/A,0', '2016-12-28,1,2,0.5,1.5,10'].join('\n')
    const s = parseStooqCsv('AAPL', dirty)
    expect(s.t).toHaveLength(1)
    expect(s.c).toEqual([1.5])
  })

  it('repairs OHLC invariants rather than trusting the feed', () => {
    // high below the close and low above the open — an inconsistent adjusted bar
    const bad = [HEADER, '2016-12-27,100,101,99.5,105,1000'].join('\n')
    const s = parseStooqCsv('AAPL', bad)
    expect(s.h[0]).toBeGreaterThanOrEqual(Math.max(s.o[0], s.c[0]))
    expect(s.l[0]).toBeLessThanOrEqual(Math.min(s.o[0], s.c[0]))
  })

  it('rounds prices to cents and volume to integers', () => {
    const s = parseStooqCsv('AAPL', [HEADER, '2016-12-27,1.23456,2,1,1.98765,1234.7'].join('\n'))
    expect(s.o[0]).toBe(1.23)
    expect(s.c[0]).toBe(1.99)
    expect(Number.isInteger(s.v[0])).toBe(true)
  })

  it('defaults volume to 0 when the column is absent', () => {
    const noVol = ['Date,Open,High,Low,Close', '2016-12-27,1,2,0.5,1.5'].join('\n')
    expect(parseStooqCsv('AAPL', noVol).v).toEqual([0])
  })

  it.each([
    ['empty body', ''],
    ['rate limit notice', 'Exceeded the daily hits limit'],
    ['plain error text', 'No data'],
    ['header only', HEADER],
  ])('throws on %s', (_name, body) => {
    expect(() => parseStooqCsv('AAPL', body)).toThrow()
  })

  it('names the symbol in its error messages', () => {
    expect(() => parseStooqCsv('ZZZZ', 'Exceeded the daily hits limit')).toThrow(/ZZZZ/)
  })
})

describe('trimToYears', () => {
  const day = 86400
  const last = Date.parse('2026-08-21T00:00:00Z') / 1000
  function synth(bars: number): OhlcvLike {
    const t = Array.from({ length: bars }, (_, i) => last - (bars - 1 - i) * day)
    const col = () => Array.from({ length: bars }, (_, i) => i + 1)
    return { symbol: 'X', interval: '1d', t, o: col(), h: col(), l: col(), c: col(), v: col() }
  }

  it('keeps only the trailing window', () => {
    const s = trimToYears(synth(4000), 5)
    expect(s.t.length).toBeLessThan(4000)
    expect(s.t[s.t.length - 1]).toBe(last)
    expect(last - s.t[0]).toBeLessThanOrEqual(5 * 365.25 * day)
  })

  it('trims every column to the same length', () => {
    const s = trimToYears(synth(4000), 2)
    for (const col of [s.o, s.h, s.l, s.c, s.v]) expect(col.length).toBe(s.t.length)
  })

  it('is a no-op when the series is already short enough', () => {
    const s = synth(100)
    expect(trimToYears(s, 10)).toBe(s)
  })

  it('is a no-op for a zero or negative window', () => {
    const s = synth(100)
    expect(trimToYears(s, 0)).toBe(s)
  })
})
