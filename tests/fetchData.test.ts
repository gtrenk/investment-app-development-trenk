// Unit tests for the pure half of `scripts/fetch-data.mjs`.
//
// The HTTP calls cannot be exercised here — the sandbox's egress proxy returns
// 403 for stooq.com and finance.yahoo.com alike — so everything that does not
// touch the network is pinned down instead: URL construction, challenge
// detection, the retry policy, both response parsers, and the year trim.
//
// This matters more than usual for the Yahoo path. It exists because the first
// live run of the refresh workflow got an anti-bot HTML page back from Stooq
// for all 27 symbols, and it has never been run against the live Yahoo endpoint
// by anyone. These tests, driven by fixtures shaped like real payloads
// (null-padded halts, market-open timestamps, a duplicated trailing session, an
// error envelope), are the whole correctness story for it.
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
let parseYahooChart: (symbol: string, payload: unknown) => OhlcvLike
let trimToYears: (series: OhlcvLike, years: number) => OhlcvLike
let stooqUrl: (symbol: string) => string
let yahooUrl: (symbol: string, years?: number) => string
let yahooRange: (years: number) => string
let looksLikeChallenge: (body: unknown) => boolean
let retryPlanFor: (message: string, attempt: number) => { budget: number; waitMs: number }
let DEFAULT_SYMBOLS: string[]

beforeAll(async () => {
  const specifier = new URL('../scripts/fetch-data.mjs', import.meta.url).href
  const mod = await import(/* @vite-ignore */ specifier)
  ;({
    parseStooqCsv,
    parseYahooChart,
    trimToYears,
    stooqUrl,
    yahooUrl,
    yahooRange,
    looksLikeChallenge,
    retryPlanFor,
    DEFAULT_SYMBOLS,
  } = mod)
})

/** The page Stooq actually served to the GitHub runner, trimmed to its shape. */
const CHALLENGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta name="robots" content="noindex,nofollow">
<title>Just a moment...</title>
<script>window._cf_chl_opt={};</script>
</head>
<body>
<noscript><div>Enable JavaScript and cookies to continue</div></noscript>
</body>
</html>`

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

  // The failure that took out the first live workflow run: HTTP 200, HTML body.
  it('recognises the anti-bot challenge page and says so in the message', () => {
    expect(() => parseStooqCsv('AAPL', CHALLENGE_HTML)).toThrow(/anti-bot/)
    // The wording is load-bearing — `retryPlanFor` switches on it.
    expect(retryPlanFor('AAPL: Stooq served an anti-bot HTML challenge, not CSV', 1).budget)
      .toBeLessThan(retryPlanFor('AAPL: HTTP 503', 1).budget)
  })
})

// ─── Challenge detection ─────────────────────────────────────────────────────

describe('looksLikeChallenge', () => {
  it('flags the HTML page both providers serve to blocked callers', () => {
    expect(looksLikeChallenge(CHALLENGE_HTML)).toBe(true)
  })

  it.each([
    ['a bare doctype', '<!doctype html><html></html>'],
    ['a leading <html>', '<html lang="en"><body>nope</body></html>'],
    ['a noscript block anywhere', 'x'.repeat(50) + '<noscript>enable js</noscript>'],
    ['a noindex robots meta', "<meta name='robots' content='noindex,nofollow'>"],
  ])('flags %s', (_name, body) => {
    expect(looksLikeChallenge(body)).toBe(true)
  })

  it.each([
    ['a Stooq CSV', CSV],
    ['a JSON payload', '{"chart":{"result":[]}}'],
    ['a plain error line', 'Exceeded the daily hits limit'],
    ['an empty body', ''],
    ['null', null],
  ])('leaves %s alone', (_name, body) => {
    expect(looksLikeChallenge(body)).toBe(false)
  })

  it('does not trip on data that merely contains an angle bracket', () => {
    // A comparison in a note column must not be read as markup.
    expect(looksLikeChallenge('Date,Note\n2016-12-27,close<open')).toBe(false)
  })
})

// ─── Retry policy ────────────────────────────────────────────────────────────

describe('retryPlanFor', () => {
  it('never retries an unknown ticker', () => {
    expect(retryPlanFor('AAPL: 404 — unknown ticker', 1).budget).toBe(0)
  })

  it('gives a transient failure exponential backoff', () => {
    const first = retryPlanFor('AAPL: HTTP 503', 1)
    const second = retryPlanFor('AAPL: HTTP 503', 2)
    expect(second.waitMs).toBe(first.waitMs * 2)
    expect(first.budget).toBeGreaterThan(1)
  })

  it('cuts an anti-bot challenge short, and waits less between the tries', () => {
    // This is the regression under test: the first live run spent ~6 minutes
    // re-asking an IP block with doubling waits before giving up.
    const challenge = retryPlanFor('AAPL: Stooq served an anti-bot HTML challenge, not CSV', 1)
    const transient = retryPlanFor('AAPL: HTTP 503', 1)
    expect(challenge.budget).toBe(2)
    expect(challenge.budget).toBeLessThan(transient.budget)
    expect(challenge.waitMs).toBeLessThan(transient.waitMs)
  })

  it('keeps the challenge wait flat rather than doubling it', () => {
    const one = retryPlanFor('anti-bot', 1)
    const two = retryPlanFor('anti-bot', 2)
    expect(two.waitMs).toBe(one.waitMs)
  })

  it('tolerates a missing message', () => {
    expect(() => retryPlanFor(undefined as unknown as string, 1)).not.toThrow()
  })
})

// ─── Yahoo fallback ──────────────────────────────────────────────────────────

/** Yahoo stamps a daily bar at the market open (09:30 ET = 14:30 UTC). */
const openUtc = (day: string) => Date.parse(`${day}T14:30:00Z`) / 1000
const midnightUtc = (day: string) => Date.parse(`${day}T00:00:00Z`) / 1000

/**
 * A payload shaped like a real v8 chart response, carrying every wrinkle the
 * parser has to survive: a null-padded halted session, a null volume on an
 * otherwise good day, and the in-progress session repeated at the tail.
 */
function yahooPayload() {
  return {
    chart: {
      result: [
        {
          meta: { currency: 'USD', symbol: 'AAPL', exchangeName: 'NMS' },
          timestamp: [
            openUtc('2016-12-27'),
            openUtc('2016-12-28'),
            openUtc('2016-12-29'), // halted — every quote null
            openUtc('2016-12-30'),
            openUtc('2016-12-30'), // duplicate of the in-progress session
          ],
          indicators: {
            quote: [
              {
                open: [115.8, 117.52, null, 116.45, 116.45],
                high: [117.8, 118.02, null, 117.11, 117.11],
                low: [115.61, 116.2, null, 116.4, 116.4],
                close: [117.26, 116.76, null, 116.73, 116.73],
                volume: [18296855, 20905892, null, null, 15039519],
              },
            ],
            adjclose: [{ adjclose: [115.01, 114.52, null, 114.49, 114.49] }],
          },
        },
      ],
      error: null,
    },
  }
}

describe('yahooRange / yahooUrl', () => {
  it('addresses the plain symbol, with no .us suffix', () => {
    expect(yahooUrl('AAPL')).toBe(
      'https://query1.finance.yahoo.com/v8/finance/chart/AAPL?range=10y&interval=1d',
    )
  })

  it('handles the ETFs in the universe as ordinary symbols', () => {
    for (const etf of ['SPY', 'QQQ']) expect(yahooUrl(etf)).toContain(`/chart/${etf}?`)
  })

  it('upper-cases and always asks for daily bars', () => {
    expect(yahooUrl('aapl')).toContain('/chart/AAPL?')
    expect(yahooUrl('AAPL')).toContain('interval=1d')
  })

  it.each([
    [1, '1y'],
    [2, '2y'],
    [3, '5y'],
    [5, '5y'],
    [10, '10y'],
  ])('rounds %i years UP to the %s token, never down', (years, token) => {
    // Asking for more and trimming is safe; asking for less ships a short series.
    expect(yahooRange(years)).toBe(token)
  })

  it('asks for everything when the window is longer than Yahoo tokenises', () => {
    expect(yahooRange(20)).toBe('max')
    expect(yahooRange(0)).toBe('max')
  })
})

describe('parseYahooChart', () => {
  it('parses a chart payload into columnar arrays', () => {
    const s = parseYahooChart('AAPL', yahooPayload())
    expect(s.symbol).toBe('AAPL')
    expect(s.interval).toBe('1d')
    expect(s.c).toEqual([117.26, 116.76, 116.73])
    expect(s.o[0]).toBe(115.8)
  })

  it('accepts the raw response text as well as a parsed object', () => {
    const fromText = parseYahooChart('AAPL', JSON.stringify(yahooPayload()))
    expect(fromText).toEqual(parseYahooChart('AAPL', yahooPayload()))
  })

  it('floors market-open timestamps to UTC midnight, matching the Stooq path', () => {
    const s = parseYahooChart('AAPL', yahooPayload())
    expect(s.t[0]).toBe(midnightUtc('2016-12-27'))
    expect(s.t[0]).toBe(parseStooqCsv('AAPL', CSV).t[0])
    for (const t of s.t) expect(t % 86400).toBe(0)
  })

  it('drops the null-padded halted session instead of emitting NaN', () => {
    const s = parseYahooChart('AAPL', yahooPayload())
    expect(s.t).toHaveLength(3)
    expect(s.t).not.toContain(midnightUtc('2016-12-29'))
    for (const col of [s.o, s.h, s.l, s.c, s.v]) {
      expect(col).toHaveLength(3)
      for (const x of col) expect(Number.isFinite(x)).toBe(true)
    }
  })

  it('keeps a bar whose volume alone is null, recording zero volume', () => {
    const s = parseYahooChart('AAPL', yahooPayload())
    expect(s.c[2]).toBe(116.73)
    expect(s.v[2]).toBe(0)
    expect(s.v.slice(0, 2)).toEqual([18296855, 20905892])
  })

  it('drops the repeated in-progress session, keeping timestamps strictly increasing', () => {
    const s = parseYahooChart('AAPL', yahooPayload())
    for (let i = 1; i < s.t.length; i++) expect(s.t[i]).toBeGreaterThan(s.t[i - 1])
  })

  it('uses the raw close, never adjclose', () => {
    // Adjusted history is rewritten by every later dividend, which would shift
    // every curated drill window on each refresh.
    const s = parseYahooChart('AAPL', yahooPayload())
    expect(s.c[0]).toBe(117.26)
    expect(s.c[0]).not.toBe(115.01)
  })

  it('repairs OHLC invariants rather than trusting the feed', () => {
    const doc = yahooPayload()
    doc.chart.result[0].indicators.quote[0].high[0] = 100 // below the close
    doc.chart.result[0].indicators.quote[0].low[0] = 200 // above the open
    const s = parseYahooChart('AAPL', doc)
    expect(s.h[0]).toBeGreaterThanOrEqual(Math.max(s.o[0], s.c[0]))
    expect(s.l[0]).toBeLessThanOrEqual(Math.min(s.o[0], s.c[0]))
  })

  it('rounds prices to cents and volume to integers', () => {
    const doc = yahooPayload()
    doc.chart.result[0].indicators.quote[0].open[0] = 1.23456
    doc.chart.result[0].indicators.quote[0].close[0] = 1.98765
    doc.chart.result[0].indicators.quote[0].volume[0] = 1234.7
    const s = parseYahooChart('AAPL', doc)
    expect(s.o[0]).toBe(1.23)
    expect(s.c[0]).toBe(1.99)
    expect(Number.isInteger(s.v[0])).toBe(true)
  })

  it('produces a series the year trim accepts unchanged in shape', () => {
    const s = trimToYears(parseYahooChart('AAPL', yahooPayload()), 10)
    for (const col of [s.o, s.h, s.l, s.c, s.v]) expect(col.length).toBe(s.t.length)
  })

  it('surfaces the error envelope Yahoo returns for a bad symbol', () => {
    const payload = {
      chart: {
        result: null,
        error: { code: 'Not Found', description: 'No data found, symbol may be delisted' },
      },
    }
    expect(() => parseYahooChart('ZZZZ', payload)).toThrow(/No data found/)
    expect(() => parseYahooChart('ZZZZ', payload)).toThrow(/ZZZZ/)
  })

  it('recognises an anti-bot page served in place of JSON', () => {
    expect(() => parseYahooChart('AAPL', CHALLENGE_HTML)).toThrow(/anti-bot/)
  })

  it.each([
    ['a non-JSON body', 'not json at all'],
    ['an empty body', ''],
    ['null', null],
    ['an empty object', {}],
    ['a chart with no result', { chart: { result: [] } }],
    ['a result with no timestamps', { chart: { result: [{ indicators: { quote: [{}] } }] } }],
    ['a result with no quote block', { chart: { result: [{ timestamp: [1], indicators: {} }] } }],
  ])('throws on %s', (_name, payload) => {
    expect(() => parseYahooChart('AAPL', payload)).toThrow()
  })

  it('names the missing price series when the payload is half-built', () => {
    const half = {
      chart: {
        result: [
          { timestamp: [openUtc('2016-12-27')], indicators: { quote: [{ open: [1], low: [1], close: [1] }] } },
        ],
      },
    }
    expect(() => parseYahooChart('AAPL', half)).toThrow(/high/)
  })

  it('throws rather than returning an empty series when every row is null', () => {
    const doc = yahooPayload()
    const q = doc.chart.result[0].indicators.quote[0]
    for (const key of ['open', 'high', 'low', 'close'] as const) q[key] = q[key].map(() => null)
    expect(() => parseYahooChart('AAPL', doc)).toThrow(/no usable rows/)
  })

  it('names the symbol in every failure message', () => {
    for (const bad of ['not json', '', CHALLENGE_HTML]) {
      expect(() => parseYahooChart('ZZZZ', bad)).toThrow(/ZZZZ/)
    }
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
