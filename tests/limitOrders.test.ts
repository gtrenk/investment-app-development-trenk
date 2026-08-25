// ─── Limit-order replay ──────────────────────────────────────────────────────
// The interesting cases are all about *which bar* fills an order and *at what
// price*, so most of this file is a table: one row per (side, limit, bars)
// scenario, each with the exact fill date and price it must produce.

import { describe, expect, it } from 'vitest'
import {
  LIMIT_ORDER_TTL_DAYS,
  barDate,
  cancelOrder,
  evaluateLimitOrders,
  expiresOn,
  limitOrderIssue,
  newLimitOrder,
  orderAgeDays,
  restingOrders,
  visibleOrders,
} from '@core/portfolio/limitOrders'
import type { LimitOrder, SeriesMap } from '@core/portfolio/limitOrders'
import { addDays } from '@core/clock'
import type { OhlcvSeries } from '@core/types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

/** Unix seconds for the UTC midnight of a 'YYYY-MM-DD'. */
function ts(date: string): number {
  return Date.parse(`${date}T00:00:00.000Z`) / 1000
}

interface Bar {
  date: string
  o: number
  h: number
  l: number
  c?: number
}

function series(symbol: string, bars: Bar[]): OhlcvSeries {
  return {
    symbol,
    interval: '1d',
    t: bars.map((b) => ts(b.date)),
    o: bars.map((b) => b.o),
    h: bars.map((b) => b.h),
    l: bars.map((b) => b.l),
    c: bars.map((b) => b.c ?? b.o),
    v: bars.map(() => 1_000_000),
  }
}

const PLACED = '2026-06-01'

function order(over: Partial<LimitOrder> = {}): LimitOrder {
  return {
    id: 'lo-1',
    symbol: 'AAPL',
    side: 'buy',
    qty: 10,
    limitPrice: 100,
    placedAt: PLACED,
    status: 'open',
    ...over,
  }
}

/** Three sessions after placement: 100.5 / 99 / 96 lows, a walk down. */
const WALK_DOWN: Bar[] = [
  { date: '2026-06-01', o: 105, h: 106, l: 104 }, // the placement day itself
  { date: '2026-06-02', o: 104, h: 105, l: 100.5 },
  { date: '2026-06-03', o: 102, h: 103, l: 99 },
  { date: '2026-06-04', o: 98, h: 99, l: 96 },
]

// ─── Table: which bar fills, and at what price ───────────────────────────────

interface Row {
  name: string
  side: 'buy' | 'sell'
  limit: number
  bars: Bar[]
  asOf: string
  /** null = no fill */
  expect: { date: string; price: number } | null
  status: LimitOrder['status']
}

const ROWS: Row[] = [
  {
    name: 'buy fills on the first bar whose low touches the limit, at the limit',
    side: 'buy',
    limit: 99.5,
    bars: WALK_DOWN,
    asOf: '2026-06-10',
    expect: { date: '2026-06-03', price: 99.5 },
    status: 'filled',
  },
  {
    name: 'buy that gaps through the limit fills at the open, not the limit',
    side: 'buy',
    limit: 99,
    // Opens at 96, well under a 99 limit — the first print of the day is the fill.
    bars: [
      { date: '2026-06-02', o: 104, h: 105, l: 101 },
      { date: '2026-06-03', o: 96, h: 97, l: 94 },
    ],
    asOf: '2026-06-10',
    expect: { date: '2026-06-03', price: 96 },
    status: 'filled',
  },
  {
    name: 'buy whose limit is never touched stays open',
    side: 'buy',
    limit: 90,
    bars: WALK_DOWN,
    asOf: '2026-06-10',
    expect: null,
    status: 'open',
  },
  {
    name: 'the placement day itself cannot fill the order',
    side: 'buy',
    // The 2026-06-01 bar trades down to 104 — but that bar is the day the order
    // was written, and a resting order starts working the next session.
    limit: 104.5,
    bars: [{ date: '2026-06-01', o: 105, h: 106, l: 104 }],
    asOf: '2026-06-10',
    expect: null,
    status: 'open',
  },
  {
    name: 'sell fills when the high reaches the limit, at the limit',
    side: 'sell',
    limit: 105,
    bars: [
      { date: '2026-06-02', o: 100, h: 104.9, l: 99 },
      { date: '2026-06-03', o: 101, h: 106, l: 100 },
    ],
    asOf: '2026-06-10',
    expect: { date: '2026-06-03', price: 105 },
    status: 'filled',
  },
  {
    name: 'sell that gaps above the limit fills at the open',
    side: 'sell',
    limit: 105,
    bars: [{ date: '2026-06-02', o: 112, h: 114, l: 111 }],
    asOf: '2026-06-10',
    expect: { date: '2026-06-02', price: 112 },
    status: 'filled',
  },
  {
    name: 'bars after asOf are the future and cannot fill',
    side: 'buy',
    limit: 99.5,
    bars: WALK_DOWN,
    asOf: '2026-06-02',
    expect: null,
    status: 'open',
  },
  {
    name: 'a bar past the 30-day expiry does not fill; the order expires',
    side: 'buy',
    limit: 99.5,
    bars: [{ date: addDays(PLACED, LIMIT_ORDER_TTL_DAYS + 1), o: 98, h: 99, l: 90 }],
    asOf: addDays(PLACED, LIMIT_ORDER_TTL_DAYS + 2),
    expect: null,
    status: 'expired',
  },
  {
    name: 'a bar on the expiry day itself still fills',
    side: 'buy',
    limit: 99.5,
    bars: [{ date: addDays(PLACED, LIMIT_ORDER_TTL_DAYS), o: 99.8, h: 100, l: 98 }],
    asOf: addDays(PLACED, LIMIT_ORDER_TTL_DAYS + 5),
    expect: { date: addDays(PLACED, LIMIT_ORDER_TTL_DAYS), price: 99.5 },
    status: 'filled',
  },
]

describe('evaluateLimitOrders', () => {
  for (const row of ROWS) {
    it(row.name, () => {
      const o = order({ side: row.side, limitPrice: row.limit })
      const map: SeriesMap = { AAPL: series('AAPL', row.bars) }
      const result = evaluateLimitOrders([o], map, row.asOf)

      expect(result.orders[0].status).toBe(row.status)
      if (row.expect) {
        expect(result.fills).toHaveLength(1)
        expect(result.fills[0].date).toBe(row.expect.date)
        expect(result.fills[0].price).toBe(row.expect.price)
        expect(result.fills[0].qty).toBe(o.qty)
        expect(result.orders[0].filledAt).toBe(row.expect.date)
        expect(result.orders[0].fillPrice).toBe(row.expect.price)
      } else {
        expect(result.fills).toHaveLength(0)
        expect(result.orders[0].fillPrice).toBeUndefined()
      }
      // A fill or an expiry is a change; anything else must leave the book alone.
      expect(result.changed).toBe(row.status !== 'open')
    })
  }

  it('a fill is never worse than the limit price', () => {
    // Property check over the same table: whatever the fill price is, a buyer
    // never pays above their limit and a seller never receives below theirs.
    for (const row of ROWS) {
      const map: SeriesMap = { AAPL: series('AAPL', row.bars) }
      const { fills } = evaluateLimitOrders(
        [order({ side: row.side, limitPrice: row.limit })],
        map,
        row.asOf,
      )
      for (const f of fills) {
        if (f.side === 'buy') expect(f.price).toBeLessThanOrEqual(row.limit)
        else expect(f.price).toBeGreaterThanOrEqual(row.limit)
      }
    }
  })

  it('is idempotent — feeding the output back in changes nothing', () => {
    const map: SeriesMap = { AAPL: series('AAPL', WALK_DOWN) }
    const first = evaluateLimitOrders([order({ limitPrice: 99.5 })], map, '2026-06-10')
    expect(first.fills).toHaveLength(1)

    const second = evaluateLimitOrders(first.orders, map, '2026-06-10')
    expect(second.fills).toHaveLength(0)
    expect(second.changed).toBe(false)
    expect(second.orders).toEqual(first.orders)
  })

  it('leaves an order untouched while its series is still loading', () => {
    const late = addDays(PLACED, LIMIT_ORDER_TTL_DAYS + 3)
    // No AAPL in the map at all: with no bars we cannot know whether it filled
    // before expiry, so expiring it would be a guess.
    const result = evaluateLimitOrders([order()], {}, late)
    expect(result.orders[0].status).toBe('open')
    expect(result.changed).toBe(false)
  })

  it('resolves several orders and returns the fills oldest first', () => {
    const map: SeriesMap = {
      AAPL: series('AAPL', WALK_DOWN),
      MSFT: series('MSFT', [
        { date: '2026-06-02', o: 300, h: 301, l: 299 },
        { date: '2026-06-03', o: 298, h: 299, l: 290 },
      ]),
    }
    const orders: LimitOrder[] = [
      order({ id: 'a', symbol: 'MSFT', limitPrice: 292 }), // fills 06-03 @292
      order({ id: 'b', symbol: 'AAPL', limitPrice: 100.5 }), // fills 06-02 @100.5
      order({ id: 'c', symbol: 'AAPL', limitPrice: 50 }), // never
    ]
    const { fills, orders: next } = evaluateLimitOrders(orders, map, '2026-06-10')

    expect(fills.map((f) => f.orderId)).toEqual(['b', 'a'])
    expect(next.map((o) => o.status)).toEqual(['filled', 'filled', 'open'])
  })

  it('ignores orders that are already resolved', () => {
    const map: SeriesMap = { AAPL: series('AAPL', WALK_DOWN) }
    const book: LimitOrder[] = [
      order({ id: 'x', status: 'cancelled', limitPrice: 99.5 }),
      order({ id: 'y', status: 'expired', limitPrice: 99.5 }),
      order({ id: 'z', status: 'filled', limitPrice: 99.5, filledAt: '2026-06-03', fillPrice: 99.5 }),
    ]
    const result = evaluateLimitOrders(book, map, '2026-06-10')
    expect(result.fills).toHaveLength(0)
    expect(result.orders).toEqual(book)
  })

  it('a sell order fills at its limit when the bar opens below it', () => {
    const map: SeriesMap = { AAPL: series('AAPL', [{ date: '2026-06-02', o: 100, h: 108, l: 99 }]) }
    const { fills } = evaluateLimitOrders(
      [order({ side: 'sell', limitPrice: 105 })],
      map,
      '2026-06-10',
    )
    // Opened at 100, traded up through 105 — the limit is the fill, not the open.
    expect(fills[0].price).toBe(105)
  })
})

// ─── Book helpers ────────────────────────────────────────────────────────────

describe('the order book', () => {
  it('expires exactly 30 calendar days after placement', () => {
    expect(LIMIT_ORDER_TTL_DAYS).toBe(30)
    expect(expiresOn({ placedAt: '2026-06-01' })).toBe('2026-07-01')
    // Across a month boundary and a 31-day month, still 30 days.
    expect(expiresOn({ placedAt: '2026-12-20' })).toBe('2027-01-19')
  })

  it('reads a bar date off its UTC midnight timestamp', () => {
    expect(barDate(ts('2026-08-21'))).toBe('2026-08-21')
    expect(barDate(Number.NaN)).toBeNull()
  })

  it('ages an order in whole days and never goes negative', () => {
    expect(orderAgeDays({ placedAt: '2026-06-01' }, '2026-06-01')).toBe(0)
    expect(orderAgeDays({ placedAt: '2026-06-01' }, '2026-06-12')).toBe(11)
    expect(orderAgeDays({ placedAt: '2026-06-12' }, '2026-06-01')).toBe(0)
  })

  it('lists resting orders newest first and keeps expired ones visible', () => {
    const book: LimitOrder[] = [
      order({ id: '1' }),
      order({ id: '2', status: 'filled' }),
      order({ id: '3', status: 'expired' }),
      order({ id: '4' }),
      order({ id: '5', status: 'cancelled' }),
    ]
    expect(restingOrders(book).map((o) => o.id)).toEqual(['4', '1'])
    expect(visibleOrders(book).map((o) => o.id)).toEqual(['4', '3', '1'])
  })

  it('cancels by id, refuses to un-fill a fill, and is a no-op on a miss', () => {
    const book: LimitOrder[] = [order({ id: '1' }), order({ id: '2', status: 'filled' })]
    expect(cancelOrder(book, '1')[0].status).toBe('cancelled')
    expect(cancelOrder(book, '2')[1].status).toBe('filled')
    expect(cancelOrder(book, 'nope')).toBe(book)
  })

  it('rejects orders that cannot rest', () => {
    const base = { id: 'x', symbol: 'AAPL', side: 'buy' as const, qty: 1, limitPrice: 100, placedAt: PLACED }
    expect(limitOrderIssue(base)).toBeNull()
    expect(limitOrderIssue({ ...base, symbol: '  ' })).toMatch(/Symbol/)
    expect(limitOrderIssue({ ...base, qty: 0 })).toMatch(/Quantity/)
    expect(limitOrderIssue({ ...base, qty: Number.NaN })).toMatch(/Quantity/)
    expect(limitOrderIssue({ ...base, limitPrice: -1 })).toMatch(/Limit price/)
    expect(limitOrderIssue({ ...base, placedAt: 'yesterday' })).toMatch(/date/)
  })

  it('normalises the symbol when the order is created', () => {
    const o = newLimitOrder({
      id: 'x',
      symbol: ' aapl ',
      side: 'buy',
      qty: 2,
      limitPrice: 100,
      placedAt: PLACED,
    })
    expect(o.symbol).toBe('AAPL')
    expect(o.status).toBe('open')
    expect(o.fillPrice).toBeUndefined()
  })
})
