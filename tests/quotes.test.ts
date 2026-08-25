import { describe, expect, it } from 'vitest'
import { fallbackProvider, withCache } from '@core/market/provider'
import type { QuoteCacheEntry, QuoteProvider, QuoteStore } from '@core/market/provider'
import {
  DEFAULT_STOOQ_BASE,
  createStooqProvider,
  parseStooqQuoteCsv,
  stooqQuoteUrl,
  toStooqSymbol,
} from '@core/market/stooq'
import type { FetchLike, FetchResponseLike } from '@core/market/stooq'
import { createBundledProvider } from '@core/market/bundledQuotes'
import type { OhlcvSeries, Quote } from '@core/types'

// ─── fixtures ────────────────────────────────────────────────────────────────

const GOOD_CSV = [
  'Symbol,Date,Time,Open,High,Low,Close,Volume',
  'AAPL.US,2024-05-17,22:00:07,189.51,190.81,189.18,189.87,41282925',
].join('\n')

/** Stooq answers an unknown ticker with N/D in every field, HTTP 200. */
const ND_CSV = [
  'Symbol,Date,Time,Open,High,Low,Close,Volume',
  'ZZZZ.US,N/D,N/D,N/D,N/D,N/D,N/D,N/D',
].join('\n')

function quoteOf(symbol: string, price: number, asOf = '2024-05-17T22:00:07.000Z'): Quote {
  return { symbol, price, asOf, stale: false }
}

/** Provider returning a fixed quote, counting calls. */
function stubProvider(quote: Quote) {
  let calls = 0
  const provider: QuoteProvider = {
    async getQuote() {
      calls++
      return quote
    },
  }
  return { provider, calls: () => calls }
}

/** Provider that always rejects, counting calls. */
function failingProvider(message = 'network down') {
  let calls = 0
  const provider: QuoteProvider = {
    async getQuote() {
      calls++
      throw new Error(message)
    },
  }
  return { provider, calls: () => calls }
}

/** Provider whose behaviour can be flipped mid-test. */
function flakyProvider(quote: Quote) {
  let fail = false
  const provider: QuoteProvider = {
    async getQuote() {
      if (fail) throw new Error('offline')
      return quote
    },
  }
  return { provider, break: () => { fail = true }, fix: () => { fail = false } }
}

/** Minimal fetch double: one canned response, recording the URL asked for. */
function stubFetch(body: string, init: { ok?: boolean; status?: number } = {}) {
  const urls: string[] = []
  const fetchFn: FetchLike = async (url) => {
    urls.push(url)
    const res: FetchResponseLike = {
      ok: init.ok ?? true,
      status: init.status ?? 200,
      async text() {
        return body
      },
    }
    return res
  }
  return { fetchFn, urls }
}

// ─── withCache ───────────────────────────────────────────────────────────────

describe('withCache', () => {
  it('passes the first call through to the provider', async () => {
    const { provider, calls } = stubProvider(quoteOf('AAPL', 189.87))
    const cached = withCache(provider, 60_000, () => 0)

    await expect(cached.getQuote('AAPL')).resolves.toEqual(quoteOf('AAPL', 189.87))
    expect(calls()).toBe(1)
  })

  it('serves a fresh entry from the cache without calling again', async () => {
    const { provider, calls } = stubProvider(quoteOf('AAPL', 189.87))
    let now = 1_000
    const cached = withCache(provider, 60_000, () => now)

    await cached.getQuote('AAPL')
    now = 30_000
    await expect(cached.getQuote('AAPL')).resolves.toEqual(quoteOf('AAPL', 189.87))
    expect(calls()).toBe(1)
  })

  it('refetches once the TTL has elapsed', async () => {
    const { provider, calls } = stubProvider(quoteOf('AAPL', 189.87))
    let now = 0
    const cached = withCache(provider, 60_000, () => now)

    await cached.getQuote('AAPL')
    now = 60_000 // exactly at the TTL counts as expired
    await cached.getQuote('AAPL')
    expect(calls()).toBe(2)
  })

  it('keys the cache per symbol', async () => {
    const { provider, calls } = stubProvider(quoteOf('X', 1))
    const cached = withCache(provider, 60_000, () => 0)

    await cached.getQuote('AAPL')
    await cached.getQuote('MSFT')
    await cached.getQuote('AAPL')
    expect(calls()).toBe(2)
  })

  it('normalizes the symbol before keying', async () => {
    const { provider, calls } = stubProvider(quoteOf('AAPL', 1))
    const cached = withCache(provider, 60_000, () => 0)

    await cached.getQuote('aapl')
    await cached.getQuote('  AAPL ')
    expect(calls()).toBe(1)
  })

  it('falls back to the cached quote marked stale when the fetch fails', async () => {
    const flaky = flakyProvider(quoteOf('AAPL', 189.87))
    let now = 0
    const cached = withCache(flaky.provider, 60_000, () => now)

    const fresh = await cached.getQuote('AAPL')
    expect(fresh.stale).toBe(false)

    flaky.break()
    now = 10 * 60_000 // well past the TTL
    const stale = await cached.getQuote('AAPL')

    expect(stale).toEqual({ ...fresh, stale: true })
    expect(stale.price).toBe(189.87)
  })

  it('does not poison the cache with the stale copy', async () => {
    const flaky = flakyProvider(quoteOf('AAPL', 189.87))
    let now = 0
    const cached = withCache(flaky.provider, 1_000, () => now)

    await cached.getQuote('AAPL')
    flaky.break()
    now = 5_000
    await cached.getQuote('AAPL')

    flaky.fix()
    now = 10_000
    await expect(cached.getQuote('AAPL')).resolves.toEqual(quoteOf('AAPL', 189.87))
  })

  it('propagates the error when nothing is cached', async () => {
    const { provider, calls } = failingProvider('network down')
    const cached = withCache(provider, 60_000, () => 0)

    await expect(cached.getQuote('AAPL')).rejects.toThrow('network down')
    expect(calls()).toBe(1)
  })

  it('writes through an injected Map-like store the UI can persist', async () => {
    const store: QuoteStore = new Map<string, QuoteCacheEntry>()
    const { provider } = stubProvider(quoteOf('AAPL', 189.87))
    const cached = withCache(provider, 60_000, () => 1_234, store)

    await cached.getQuote('aapl')
    expect((store as Map<string, QuoteCacheEntry>).get('AAPL')).toEqual({
      quote: quoteOf('AAPL', 189.87),
      cachedAt: 1_234,
    })
  })

  it('serves a pre-seeded store without ever calling the provider', async () => {
    const store: QuoteStore = new Map<string, QuoteCacheEntry>([
      ['AAPL', { quote: quoteOf('AAPL', 150), cachedAt: 0 }],
    ])
    const { provider, calls } = failingProvider()
    const cached = withCache(provider, 60_000, () => 1_000, store)

    await expect(cached.getQuote('AAPL')).resolves.toEqual(quoteOf('AAPL', 150))
    expect(calls()).toBe(0)
  })
})

// ─── fallbackProvider ────────────────────────────────────────────────────────

describe('fallbackProvider', () => {
  it('returns the first provider that succeeds', async () => {
    const live = failingProvider()
    const bundled = stubProvider({ ...quoteOf('AAPL', 100), stale: true })
    const chain = fallbackProvider(live.provider, bundled.provider)

    await expect(chain.getQuote('AAPL')).resolves.toMatchObject({ price: 100, stale: true })
    expect(live.calls()).toBe(1)
  })

  it('does not consult later providers once one succeeds', async () => {
    const first = stubProvider(quoteOf('AAPL', 189.87))
    const second = stubProvider(quoteOf('AAPL', 1))
    const chain = fallbackProvider(first.provider, second.provider)

    await chain.getQuote('AAPL')
    expect(second.calls()).toBe(0)
  })

  it('rejects with the last error when every provider fails', async () => {
    const chain = fallbackProvider(failingProvider('a').provider, failingProvider('b').provider)
    await expect(chain.getQuote('AAPL')).rejects.toThrow('b')
  })

  it('rejects when given no providers at all', async () => {
    await expect(fallbackProvider().getQuote('AAPL')).rejects.toThrow(/No quote provider/)
  })
})

// ─── Stooq symbol & URL mapping ──────────────────────────────────────────────

describe('toStooqSymbol', () => {
  it.each([
    ['AAPL', 'aapl.us'],
    ['spy', 'spy.us'],
    ['  MSFT  ', 'msft.us'],
    ['BRK.B', 'brk-b.us'],
    ['aapl.us', 'aapl.us'], // already suffixed — passed through
    ['VOD.UK', 'vod.uk'],
  ])('toStooqSymbol(%o) === %o', (input, expected) => {
    expect(toStooqSymbol(input)).toBe(expected)
  })

  it('throws on an empty symbol', () => {
    expect(() => toStooqSymbol('   ')).toThrow(/required/)
  })
})

describe('stooqQuoteUrl', () => {
  it('builds the documented quote endpoint', () => {
    expect(stooqQuoteUrl('/api/stooq', 'AAPL')).toBe(
      '/api/stooq/q/l/?s=aapl.us&f=sd2t2ohlcv&h&e=csv',
    )
  })

  it('tolerates a trailing slash on the base', () => {
    expect(stooqQuoteUrl('https://proxy.example.com/', 'SPY')).toBe(
      'https://proxy.example.com/q/l/?s=spy.us&f=sd2t2ohlcv&h&e=csv',
    )
  })

  it('defaults to the Vite dev-proxy path', () => {
    expect(DEFAULT_STOOQ_BASE).toBe('/api/stooq')
  })
})

// ─── parseStooqQuoteCsv ──────────────────────────────────────────────────────

describe('parseStooqQuoteCsv — good rows', () => {
  it('parses a normal quote', () => {
    expect(parseStooqQuoteCsv(GOOD_CSV, 'AAPL')).toEqual({
      symbol: 'AAPL',
      price: 189.87,
      asOf: '2024-05-17T22:00:07.000Z',
      stale: false,
    })
  })

  it('derives the symbol from the row when none is supplied', () => {
    expect(parseStooqQuoteCsv(GOOD_CSV).symbol).toBe('AAPL')
  })

  it('tolerates CRLF, blank lines and a trailing newline', () => {
    const messy = `\r\n${GOOD_CSV.split('\n').join('\r\n')}\r\n\r\n`
    expect(parseStooqQuoteCsv(messy, 'AAPL').price).toBe(189.87)
  })

  it('locates columns by header, not position', () => {
    const reordered = ['Close,Symbol,Date,Time,Volume', '42.5,MSFT.US,2024-05-17,22:00:07,1000'].join('\n')
    expect(parseStooqQuoteCsv(reordered, 'MSFT')).toMatchObject({ symbol: 'MSFT', price: 42.5 })
  })

  it('accepts an HH:MM time', () => {
    const csv = ['Symbol,Date,Time,Close', 'AAPL.US,2024-05-17,16:30,189.87'].join('\n')
    expect(parseStooqQuoteCsv(csv, 'AAPL').asOf).toBe('2024-05-17T16:30:00.000Z')
  })

  it('falls back to midnight when the time is unusable', () => {
    const csv = ['Symbol,Date,Time,Close', 'AAPL.US,2024-05-17,N/D,189.87'].join('\n')
    expect(parseStooqQuoteCsv(csv, 'AAPL').asOf).toBe('2024-05-17T00:00:00.000Z')
  })

  it('marks live quotes as not stale', () => {
    expect(parseStooqQuoteCsv(GOOD_CSV, 'AAPL').stale).toBe(false)
  })
})

describe('parseStooqQuoteCsv — bad rows', () => {
  it.each<[string, string, RegExp]>([
    ['an N/D row (unknown ticker)', ND_CSV, /no data/i],
    ['an empty body', '', /empty response/i],
    ['a whitespace-only body', '   \n  ', /empty response/i],
    ['the rate-limit message', 'Exceeded the daily hits limit', /limit/i],
    ['a header with no data row', 'Symbol,Date,Time,Open,High,Low,Close,Volume', /no quote row/i],
    ['plain garbage', 'not a csv at all\nsecond line', /not a quote csv/i],
    [
      'a non-numeric close',
      ['Symbol,Date,Time,Close', 'AAPL.US,2024-05-17,22:00:07,banana'].join('\n'),
      /unparseable close/i,
    ],
    [
      'a zero close',
      ['Symbol,Date,Time,Close', 'AAPL.US,2024-05-17,22:00:07,0'].join('\n'),
      /unparseable close/i,
    ],
    [
      'a negative close',
      ['Symbol,Date,Time,Close', 'AAPL.US,2024-05-17,22:00:07,-3'].join('\n'),
      /unparseable close/i,
    ],
    [
      'an unparseable date',
      ['Symbol,Date,Time,Close', 'AAPL.US,not-a-date,22:00:07,189.87'].join('\n'),
      /unparseable date/i,
    ],
  ])('throws on %s', (_label, csv, pattern) => {
    expect(() => parseStooqQuoteCsv(csv, 'AAPL')).toThrow(pattern)
  })
})

// ─── createStooqProvider ─────────────────────────────────────────────────────

describe('createStooqProvider', () => {
  it('fetches the quote URL and returns the parsed quote', async () => {
    const { fetchFn, urls } = stubFetch(GOOD_CSV)
    const provider = createStooqProvider({ baseUrl: '/api/stooq', fetchFn })

    await expect(provider.getQuote('AAPL')).resolves.toEqual({
      symbol: 'AAPL',
      price: 189.87,
      asOf: '2024-05-17T22:00:07.000Z',
      stale: false,
    })
    expect(urls).toEqual(['/api/stooq/q/l/?s=aapl.us&f=sd2t2ohlcv&h&e=csv'])
  })

  it('stamps the requested symbol, not Stooq’s suffixed one', async () => {
    const { fetchFn } = stubFetch(GOOD_CSV)
    const provider = createStooqProvider({ baseUrl: '/api/stooq', fetchFn })
    await expect(provider.getQuote('aapl')).resolves.toMatchObject({ symbol: 'AAPL' })
  })

  it('rejects on a non-OK response', async () => {
    const { fetchFn } = stubFetch('', { ok: false, status: 503 })
    const provider = createStooqProvider({ baseUrl: '/api/stooq', fetchFn })
    await expect(provider.getQuote('AAPL')).rejects.toThrow(/HTTP 503/)
  })

  it('propagates a parse failure', async () => {
    const { fetchFn } = stubFetch(ND_CSV)
    const provider = createStooqProvider({ baseUrl: '/api/stooq', fetchFn })
    await expect(provider.getQuote('ZZZZ')).rejects.toThrow(/no data/i)
  })

  it('propagates a network rejection', async () => {
    const fetchFn: FetchLike = async () => {
      throw new Error('Failed to fetch')
    }
    const provider = createStooqProvider({ fetchFn })
    await expect(provider.getQuote('AAPL')).rejects.toThrow('Failed to fetch')
  })

  it('composes with withCache to survive going offline', async () => {
    let online = true
    const fetchFn: FetchLike = async () => {
      if (!online) throw new Error('offline')
      return { ok: true, status: 200, async text() { return GOOD_CSV } }
    }
    let now = 0
    const provider = withCache(createStooqProvider({ fetchFn }), 60_000, () => now)

    await expect(provider.getQuote('AAPL')).resolves.toMatchObject({ stale: false })
    online = false
    now = 600_000
    await expect(provider.getQuote('AAPL')).resolves.toMatchObject({ price: 189.87, stale: true })
  })
})

// ─── createBundledProvider ───────────────────────────────────────────────────

/** Tiny inline series — deliberately not read from public/data. */
function synthetic(symbol = 'AAPL'): OhlcvSeries {
  return {
    symbol,
    interval: '1d',
    t: [
      Date.parse('2024-05-15T00:00:00Z') / 1000,
      Date.parse('2024-05-16T00:00:00Z') / 1000,
      Date.parse('2024-05-17T00:00:00Z') / 1000,
    ],
    o: [186, 188, 189],
    h: [190, 191, 192],
    l: [185, 187, 188],
    c: [188, 189, 189.87],
    v: [1_000, 2_000, 3_000],
  }
}

describe('createBundledProvider', () => {
  it('quotes the last close of the bundled series', async () => {
    const provider = createBundledProvider(async () => synthetic())
    await expect(provider.getQuote('AAPL')).resolves.toEqual({
      symbol: 'AAPL',
      price: 189.87,
      asOf: '2024-05-17T00:00:00.000Z',
      stale: true,
    })
  })

  it('always flags the quote stale — it is a historical close', async () => {
    const provider = createBundledProvider(async () => synthetic())
    expect((await provider.getQuote('AAPL')).stale).toBe(true)
  })

  it('normalizes the symbol before loading', async () => {
    const asked: string[] = []
    const provider = createBundledProvider(async (s) => {
      asked.push(s)
      return synthetic(s)
    })
    await provider.getQuote(' aapl ')
    expect(asked).toEqual(['AAPL'])
  })

  it('rejects when the loader fails', async () => {
    const provider = createBundledProvider(async () => {
      throw new Error('404')
    })
    await expect(provider.getQuote('NOPE')).rejects.toThrow('404')
  })

  it('rejects on an empty series', async () => {
    const empty: OhlcvSeries = { symbol: 'X', interval: '1d', t: [], o: [], h: [], l: [], c: [], v: [] }
    const provider = createBundledProvider(async () => empty)
    await expect(provider.getQuote('X')).rejects.toThrow(/no bars/)
  })

  it.each([[0], [-1], [Number.NaN]])('rejects an unusable last close (%s)', async (px) => {
    const provider = createBundledProvider(async () => {
      const s = synthetic()
      s.c[s.c.length - 1] = px
      return s
    })
    await expect(provider.getQuote('AAPL')).rejects.toThrow(/invalid last close/)
  })

  it('rejects an empty symbol', async () => {
    const provider = createBundledProvider(async () => synthetic())
    await expect(provider.getQuote('  ')).rejects.toThrow(/required/)
  })

  it('backs the live provider when the network is unavailable', async () => {
    const live = createStooqProvider({
      fetchFn: async () => {
        throw new Error('offline')
      },
    })
    const chain = fallbackProvider(live, createBundledProvider(async () => synthetic()))
    await expect(chain.getQuote('AAPL')).resolves.toMatchObject({ price: 189.87, stale: true })
  })
})
