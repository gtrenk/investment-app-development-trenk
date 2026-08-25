import { describe, expect, it } from 'vitest'
import {
  MAX_SNAPSHOTS,
  appendSnapshot,
  backfillSnapshots,
  benchmarkEquity,
  closesByDate,
  initBenchmark,
  performanceSeries,
} from '@core/portfolio/benchmark'
import { STARTING_CASH, newPortfolio } from '@core/portfolio/engine'
import type { OhlcvSeries, PortfolioState } from '@core/types'

/** Unix seconds at UTC midnight for a 'YYYY-MM-DD' date. */
function utc(date: string): number {
  return Date.parse(`${date}T00:00:00Z`) / 1000
}

/** Synthetic SPY series over the given dates/closes (inline — never reads public/data). */
function spy(bars: Array<[string, number]>): OhlcvSeries {
  return {
    symbol: 'SPY',
    interval: '1d',
    t: bars.map(([d]) => utc(d)),
    o: bars.map(([, c]) => c),
    h: bars.map(([, c]) => c),
    l: bars.map(([, c]) => c),
    c: bars.map(([, c]) => c),
    v: bars.map(() => 1_000),
  }
}

/** Mon 2024-01-01 … Fri 2024-01-05, then the following Mon/Tue (weekend gap). */
const WEEK = spy([
  ['2024-01-01', 400],
  ['2024-01-02', 402],
  ['2024-01-03', 404],
  ['2024-01-04', 406],
  ['2024-01-05', 408],
  ['2024-01-08', 410],
  ['2024-01-09', 412],
])

// ─── initBenchmark ───────────────────────────────────────────────────────────

describe('initBenchmark', () => {
  it('converts the starting cash into SPY units', () => {
    const p = initBenchmark(newPortfolio(), 400)
    expect(p.benchmarkUnits).toBe(250) // 100 000 / 400
  })

  it('keeps fractional units to 8 decimals', () => {
    expect(initBenchmark(newPortfolio(), 431.17).benchmarkUnits).toBe(231.92708213)
  })

  it('initialises exactly once — a later price never re-bases it', () => {
    const first = initBenchmark(newPortfolio(), 400)
    const again = initBenchmark(first, 500)
    expect(again.benchmarkUnits).toBe(250)
    expect(again).toBe(first) // returned untouched, same reference
  })

  it.each([
    [0],
    [-10],
    [Number.NaN],
    [Number.POSITIVE_INFINITY],
  ])('is a no-op for an unusable price (%s)', (px) => {
    const p = newPortfolio()
    expect(initBenchmark(p, px).benchmarkUnits).toBeNull()
  })

  it('does not mutate the input', () => {
    const p = newPortfolio()
    initBenchmark(p, 400)
    expect(p.benchmarkUnits).toBeNull()
  })
})

// ─── benchmarkEquity ─────────────────────────────────────────────────────────

describe('benchmarkEquity', () => {
  it('is the starting cash at the initial price', () => {
    const p = initBenchmark(newPortfolio(), 400)
    expect(benchmarkEquity(p, 400)).toBe(STARTING_CASH)
  })

  it('tracks the index up and down', () => {
    const p = initBenchmark(newPortfolio(), 400)
    expect(benchmarkEquity(p, 440)).toBe(110_000)
    expect(benchmarkEquity(p, 360)).toBe(90_000)
  })

  it('rounds to cents', () => {
    const p = initBenchmark(newPortfolio(), 3)
    expect(benchmarkEquity(p, 3.000001)).toBe(100_000.03)
  })

  it('is null before the benchmark is initialised', () => {
    expect(benchmarkEquity(newPortfolio(), 400)).toBeNull()
  })

  it.each([[0], [-1], [Number.NaN]])('is null for an unusable price (%s)', (px) => {
    expect(benchmarkEquity(initBenchmark(newPortfolio(), 400), px)).toBeNull()
  })
})

// ─── appendSnapshot ──────────────────────────────────────────────────────────

describe('appendSnapshot', () => {
  it('records a point', () => {
    const p = appendSnapshot(newPortfolio(), '2024-01-02', 101_000, 100_500)
    expect(p.snapshots).toEqual([
      { date: '2024-01-02', equity: 101_000, benchmarkEquity: 100_500 },
    ])
  })

  it('rounds both legs to cents', () => {
    const p = appendSnapshot(newPortfolio(), '2024-01-02', 100_000.005, 99_999.994)
    expect(p.snapshots[0]).toEqual({
      date: '2024-01-02',
      equity: 100_000.01,
      benchmarkEquity: 99_999.99,
    })
  })

  it('replaces the point for a date already recorded', () => {
    let p = appendSnapshot(newPortfolio(), '2024-01-02', 100, 100)
    p = appendSnapshot(p, '2024-01-02', 200, 210)
    expect(p.snapshots).toEqual([{ date: '2024-01-02', equity: 200, benchmarkEquity: 210 }])
  })

  it('keeps snapshots sorted when dates arrive out of order', () => {
    let p = newPortfolio()
    for (const d of ['2024-03-01', '2024-01-01', '2024-02-01']) p = appendSnapshot(p, d, 1, 1)
    expect(p.snapshots.map((s) => s.date)).toEqual(['2024-01-01', '2024-02-01', '2024-03-01'])
  })

  it('caps the history at MAX_SNAPSHOTS, dropping the oldest', () => {
    let p = newPortfolio()
    const start = new Date(Date.UTC(2020, 0, 1))
    for (let i = 0; i < MAX_SNAPSHOTS + 10; i++) {
      const d = new Date(start.getTime() + i * 86_400_000).toISOString().slice(0, 10)
      p = appendSnapshot(p, d, 100 + i, 100)
    }
    expect(p.snapshots).toHaveLength(MAX_SNAPSHOTS)
    expect(p.snapshots[0].date).toBe('2020-01-11') // first 10 dropped
    expect(p.snapshots[0].equity).toBe(110)
    expect(p.snapshots[MAX_SNAPSHOTS - 1].equity).toBe(100 + MAX_SNAPSHOTS + 9)
  })

  it('does not mutate the input', () => {
    const p = newPortfolio()
    appendSnapshot(p, '2024-01-02', 1, 1)
    expect(p.snapshots).toEqual([])
  })
})

// ─── closesByDate ────────────────────────────────────────────────────────────

describe('closesByDate', () => {
  it('maps each bar to its UTC date', () => {
    const m = closesByDate(WEEK)
    expect(m.size).toBe(7)
    expect(m.get('2024-01-03')).toBe(404)
    expect(m.get('2024-01-06')).toBeUndefined() // Saturday — no bar
  })

  it('skips unusable closes', () => {
    const s = spy([['2024-01-01', 400], ['2024-01-02', 402]])
    s.c[1] = Number.NaN
    expect([...closesByDate(s).keys()]).toEqual(['2024-01-01'])
  })
})

// ─── backfillSnapshots ───────────────────────────────────────────────────────

/** Portfolio with 250 SPY-equivalent units and one snapshot on 2024-01-02. */
function seeded(): PortfolioState {
  const p = initBenchmark(newPortfolio(), 400)
  return appendSnapshot(p, '2024-01-02', 101_000, 100_500)
}

describe('backfillSnapshots', () => {
  it('fills every trading day up to today, carrying equity forward', () => {
    const p = backfillSnapshots(seeded(), WEEK, { today: '2024-01-05' })
    expect(p.snapshots.map((s) => s.date)).toEqual([
      '2024-01-02',
      '2024-01-03',
      '2024-01-04',
      '2024-01-05',
    ])
    expect(p.snapshots.every((s) => s.equity === 101_000)).toBe(true)
  })

  it('prices the benchmark leg off that day’s SPY close', () => {
    const p = backfillSnapshots(seeded(), WEEK, { today: '2024-01-05' })
    // 250 units × 404 / 406 / 408
    expect(p.snapshots.slice(1).map((s) => s.benchmarkEquity)).toEqual([101_000, 101_500, 102_000])
  })

  it('skips weekends and holidays (dates absent from the series)', () => {
    const p = backfillSnapshots(seeded(), WEEK, { today: '2024-01-09' })
    expect(p.snapshots.map((s) => s.date)).not.toContain('2024-01-06')
    expect(p.snapshots.map((s) => s.date)).not.toContain('2024-01-07')
    expect(p.snapshots).toHaveLength(6)
  })

  it('uses supplied equity where known and carries it forward after', () => {
    const p = backfillSnapshots(seeded(), WEEK, {
      today: '2024-01-05',
      equityByDate: { '2024-01-04': 105_000 },
    })
    const byDate = Object.fromEntries(p.snapshots.map((s) => [s.date, s.equity]))
    expect(byDate['2024-01-03']).toBe(101_000)
    expect(byDate['2024-01-04']).toBe(105_000)
    expect(byDate['2024-01-05']).toBe(105_000) // carried, not reverted
  })

  it('defaults `today` to the last bar in the series', () => {
    const p = backfillSnapshots(seeded(), WEEK)
    expect(p.snapshots[p.snapshots.length - 1].date).toBe('2024-01-09')
  })

  it('leaves the existing snapshot alone', () => {
    const p = backfillSnapshots(seeded(), WEEK, { today: '2024-01-05' })
    expect(p.snapshots[0]).toEqual({ date: '2024-01-02', equity: 101_000, benchmarkEquity: 100_500 })
  })

  it('is a no-op when already up to date', () => {
    const once = backfillSnapshots(seeded(), WEEK, { today: '2024-01-05' })
    const twice = backfillSnapshots(once, WEEK, { today: '2024-01-05' })
    expect(twice.snapshots).toEqual(once.snapshots)
  })

  it('bootstraps from equityByDate when there are no snapshots yet', () => {
    const p = initBenchmark(newPortfolio(), 400)
    const out = backfillSnapshots(p, WEEK, {
      today: '2024-01-04',
      equityByDate: { '2024-01-02': 100_000 },
    })
    expect(out.snapshots.map((s) => s.date)).toEqual(['2024-01-03', '2024-01-04'])
    expect(out.snapshots[0].equity).toBe(100_000)
  })

  it.each<[string, PortfolioState, OhlcvSeries]>([
    ['the benchmark was never initialised', appendSnapshot(newPortfolio(), '2024-01-02', 1, 1), WEEK],
    ['there is no equity baseline', initBenchmark(newPortfolio(), 400), WEEK],
    ['the series is empty', seeded(), spy([])],
  ])('returns the portfolio unchanged when %s', (_label, p, series) => {
    expect(backfillSnapshots(p, series, { today: '2024-01-09' })).toBe(p)
  })

  it('does not mutate the input', () => {
    const p = seeded()
    const before = structuredClone(p)
    backfillSnapshots(p, WEEK, { today: '2024-01-09' })
    expect(p).toEqual(before)
  })

  it('stays within the cap after a long absence', () => {
    // Three years of daily bars, one ancient snapshot, "today" at the far end.
    const bars: Array<[string, number]> = []
    for (let i = 0; i < 1100; i++) {
      const d = new Date(Date.UTC(2021, 0, 1) + i * 86_400_000).toISOString().slice(0, 10)
      bars.push([d, 400 + i * 0.1])
    }
    const long = spy(bars)
    const p = appendSnapshot(initBenchmark(newPortfolio(), 400), '2021-01-02', 100_000, 100_000)
    const out = backfillSnapshots(p, long, { today: bars[bars.length - 1][0] })
    expect(out.snapshots.length).toBeLessThanOrEqual(MAX_SNAPSHOTS)
    expect(out.snapshots[out.snapshots.length - 1].date).toBe(bars[bars.length - 1][0])
  })
})

// ─── performanceSeries ───────────────────────────────────────────────────────

describe('performanceSeries', () => {
  it('rebases both curves to 0% at the first point', () => {
    let p = initBenchmark(newPortfolio(), 400)
    p = appendSnapshot(p, '2024-01-02', 100_000, 100_000)
    p = appendSnapshot(p, '2024-01-03', 110_000, 105_000)

    expect(performanceSeries(p)).toEqual([
      { date: '2024-01-02', portfolioPct: 0, benchmarkPct: 0 },
      { date: '2024-01-03', portfolioPct: 10, benchmarkPct: 5 },
    ])
  })

  it('handles underperformance', () => {
    let p = appendSnapshot(newPortfolio(), '2024-01-02', 100_000, 100_000)
    p = appendSnapshot(p, '2024-01-03', 95_000, 102_000)
    const [, second] = performanceSeries(p)
    expect(second.portfolioPct).toBe(-5)
    expect(second.benchmarkPct).toBe(2)
  })

  it('is empty without snapshots', () => {
    expect(performanceSeries(newPortfolio())).toEqual([])
  })

  it('is empty when the first point cannot be rebased', () => {
    const p = appendSnapshot(newPortfolio(), '2024-01-02', 100_000, 0)
    expect(performanceSeries(p)).toEqual([])
  })
})
