import { describe, expect, it } from 'vitest'
import {
  CONCENTRATION_WARN_PCT,
  MIN_QTY,
  STARTING_CASH,
  concentrationPct,
  executeBuy,
  executeSell,
  isTradeError,
  newPortfolio,
  normalizeSymbol,
  portfolioEquity,
  positions,
  roundCents,
  sharesHeld,
} from '@core/portfolio/engine'
import type { BuyResult, PriceMap, SellResult, TradeInput } from '@core/portfolio/engine'
import type { PortfolioState } from '@core/types'

const TS = '2024-05-17T14:30:00.000Z'

/** Unwrap a successful buy, failing the test loudly if it errored. */
function buy(p: PortfolioState, input: Partial<TradeInput> & { symbol: string; qty: number; price: number }) {
  const r: BuyResult = executeBuy(p, { ts: TS, ...input })
  if (isTradeError(r)) throw new Error(`unexpected buy error: ${r.error}`)
  return r
}

function sell(p: PortfolioState, input: Partial<TradeInput> & { symbol: string; qty: number; price: number }) {
  const r: SellResult = executeSell(p, { ts: TS, ...input })
  if (isTradeError(r)) throw new Error(`unexpected sell error: ${r.error}`)
  return r
}

/** buy 10 @100 then 10 @120 of AAPL — the FIFO fixture used throughout. */
function twoLots(): PortfolioState {
  const a = buy(newPortfolio(), { symbol: 'AAPL', qty: 10, price: 100, ts: '2024-01-02T15:00:00.000Z' })
  return buy(a.state, { symbol: 'AAPL', qty: 10, price: 120, ts: '2024-02-02T15:00:00.000Z' }).state
}

// ─── helpers ─────────────────────────────────────────────────────────────────

describe('roundCents', () => {
  it.each([
    [0, 0],
    [1.005, 1.01],
    [0.145, 0.15],
    [-0.145, -0.15],
    [99.999, 100],
    [-12.344, -12.34],
    [1234.5678, 1234.57],
  ])('roundCents(%s) === %s', (input, expected) => {
    expect(roundCents(input)).toBe(expected)
  })
})

describe('normalizeSymbol', () => {
  it.each([
    ['aapl', 'AAPL'],
    ['  msft  ', 'MSFT'],
    ['SPY', 'SPY'],
    ['', ''],
  ])('normalizeSymbol(%o) === %o', (input, expected) => {
    expect(normalizeSymbol(input)).toBe(expected)
  })
})

// ─── construction ────────────────────────────────────────────────────────────

describe('newPortfolio', () => {
  it('starts with $100k and nothing else', () => {
    expect(newPortfolio()).toEqual({
      cash: STARTING_CASH,
      lots: [],
      transactions: [],
      realizedPnl: 0,
      benchmarkUnits: null,
      snapshots: [],
    })
  })

  it('returns a fresh object each call', () => {
    const a = newPortfolio()
    a.lots.push({ symbol: 'X', qty: 1, costBasis: 1, openedAt: TS })
    expect(newPortfolio().lots).toEqual([])
  })
})

// ─── buy ─────────────────────────────────────────────────────────────────────

describe('executeBuy', () => {
  it('debits cash, opens a lot and records the transaction', () => {
    const { state, tx } = buy(newPortfolio(), { symbol: 'AAPL', qty: 10, price: 150, note: 'first trade' })

    expect(state.cash).toBe(98_500)
    expect(state.lots).toEqual([{ symbol: 'AAPL', qty: 10, costBasis: 150, openedAt: TS }])
    expect(tx).toEqual({
      id: 'tx-0001',
      ts: TS,
      symbol: 'AAPL',
      side: 'buy',
      qty: 10,
      price: 150,
      note: 'first trade',
    })
    expect(state.transactions).toEqual([tx])
    expect(state.realizedPnl).toBe(0)
  })

  it('never mutates the input state', () => {
    const p = newPortfolio()
    const before = structuredClone(p)
    buy(p, { symbol: 'AAPL', qty: 1, price: 10 })
    expect(p).toEqual(before)
  })

  it('upper-cases the symbol', () => {
    const { state, tx } = buy(newPortfolio(), { symbol: ' aapl ', qty: 1, price: 10 })
    expect(tx.symbol).toBe('AAPL')
    expect(state.lots[0].symbol).toBe('AAPL')
  })

  it('omits note when none was given', () => {
    const { tx } = buy(newPortfolio(), { symbol: 'AAPL', qty: 1, price: 10 })
    expect('note' in tx).toBe(false)
  })

  it('numbers transactions in sequence', () => {
    const a = buy(newPortfolio(), { symbol: 'AAPL', qty: 1, price: 10 })
    const b = buy(a.state, { symbol: 'MSFT', qty: 1, price: 10 })
    expect([a.tx.id, b.tx.id]).toEqual(['tx-0001', 'tx-0002'])
  })

  it('honours a caller-supplied id', () => {
    expect(buy(newPortfolio(), { symbol: 'AAPL', qty: 1, price: 10, id: 'abc' }).tx.id).toBe('abc')
  })

  it('rounds the cash debit to cents', () => {
    // 3 × 33.333 = 99.999 → $100.00 debited
    const { state } = buy(newPortfolio(), { symbol: 'AAPL', qty: 3, price: 33.333 })
    expect(state.cash).toBe(99_900)
  })

  it('supports fractional shares', () => {
    const { state } = buy(newPortfolio(), { symbol: 'AAPL', qty: 0.5, price: 199.99 })
    expect(state.lots[0].qty).toBe(0.5)
    expect(state.cash).toBe(roundCents(STARTING_CASH - 100)) // 99.995 → 100.00
  })

  it('accepts the minimum quantity', () => {
    expect(isTradeError(executeBuy(newPortfolio(), { symbol: 'AAPL', qty: MIN_QTY, price: 100, ts: TS }))).toBe(false)
  })

  it('allows spending the account down to exactly zero', () => {
    const { state } = buy(newPortfolio(), { symbol: 'SPY', qty: 200, price: 500 })
    expect(state.cash).toBe(0)
  })

  it.each<[string, TradeInput, string]>([
    ['empty symbol', { symbol: '  ', qty: 1, price: 10, ts: TS }, 'bad-symbol'],
    ['zero qty', { symbol: 'AAPL', qty: 0, price: 10, ts: TS }, 'bad-qty'],
    ['negative qty', { symbol: 'AAPL', qty: -5, price: 10, ts: TS }, 'bad-qty'],
    ['NaN qty', { symbol: 'AAPL', qty: Number.NaN, price: 10, ts: TS }, 'bad-qty'],
    ['infinite qty', { symbol: 'AAPL', qty: Number.POSITIVE_INFINITY, price: 10, ts: TS }, 'bad-qty'],
    ['sub-minimum qty', { symbol: 'AAPL', qty: 0.00001, price: 10, ts: TS }, 'bad-qty'],
    ['zero price', { symbol: 'AAPL', qty: 1, price: 0, ts: TS }, 'bad-price'],
    ['negative price', { symbol: 'AAPL', qty: 1, price: -10, ts: TS }, 'bad-price'],
    ['NaN price', { symbol: 'AAPL', qty: 1, price: Number.NaN, ts: TS }, 'bad-price'],
    ['cost above cash', { symbol: 'AAPL', qty: 1000, price: 500, ts: TS }, 'insufficient-cash'],
  ])('rejects %s', (_label, input, code) => {
    const r = executeBuy(newPortfolio(), input)
    expect(isTradeError(r)).toBe(true)
    if (isTradeError(r)) {
      expect(r.code).toBe(code)
      expect(r.error).toBeTruthy()
    }
  })

  it('leaves the portfolio untouched on a rejected trade', () => {
    const p = newPortfolio()
    const r = executeBuy(p, { symbol: 'AAPL', qty: 1000, price: 500, ts: TS })
    expect(isTradeError(r)).toBe(true)
    expect(p.lots).toEqual([])
    expect(p.cash).toBe(STARTING_CASH)
  })
})

// ─── sell ────────────────────────────────────────────────────────────────────

describe('executeSell — FIFO', () => {
  it('splits the second lot: buy 10@100, buy 10@120, sell 15@130 → +350', () => {
    const { state, realized, tx } = sell(twoLots(), { symbol: 'AAPL', qty: 15, price: 130 })

    // 10 × (130−100) + 5 × (130−120) = 300 + 50 = 350
    expect(realized).toBe(350)
    expect(state.realizedPnl).toBe(350)
    expect(state.lots).toEqual([
      { symbol: 'AAPL', qty: 5, costBasis: 120, openedAt: '2024-02-02T15:00:00.000Z' },
    ])
    expect(tx.side).toBe('sell')
    expect(tx.id).toBe('tx-0003')
  })

  it('credits the cent-rounded proceeds', () => {
    const start = twoLots() // spent 1000 + 1200
    const { state } = sell(start, { symbol: 'AAPL', qty: 15, price: 130 })
    expect(start.cash).toBe(97_800)
    expect(state.cash).toBe(97_800 + 1950)
  })

  it('consumes whole lots exactly at a boundary', () => {
    const { state, realized } = sell(twoLots(), { symbol: 'AAPL', qty: 10, price: 110 })
    expect(realized).toBe(100) // 10 × (110−100)
    expect(state.lots).toEqual([
      { symbol: 'AAPL', qty: 10, costBasis: 120, openedAt: '2024-02-02T15:00:00.000Z' },
    ])
  })

  it('empties the position when everything is sold', () => {
    const { state, realized } = sell(twoLots(), { symbol: 'AAPL', qty: 20, price: 110 })
    expect(realized).toBe(0) // 10 × (110−100) + 10 × (110−120) = +100 − 100
    expect(state.lots).toEqual([])
    expect(positions(state)).toEqual([])
  })

  it('records a realized loss', () => {
    const { state, realized } = sell(twoLots(), { symbol: 'AAPL', qty: 5, price: 80 })
    expect(realized).toBe(-100) // 5 × (80−100)
    expect(state.realizedPnl).toBe(-100)
  })

  it('accumulates realized P&L across sales', () => {
    const a = sell(twoLots(), { symbol: 'AAPL', qty: 10, price: 130 }) // +300
    const b = sell(a.state, { symbol: 'AAPL', qty: 10, price: 110 }) // 10 × (110−120) = −100
    expect(b.realized).toBe(-100)
    expect(b.state.realizedPnl).toBe(200)
  })

  it('only touches the sold symbol and keeps other lots in place', () => {
    const withMsft = buy(twoLots(), { symbol: 'MSFT', qty: 4, price: 400 }).state
    const { state } = sell(withMsft, { symbol: 'AAPL', qty: 12, price: 130 })
    expect(state.lots.map((l) => [l.symbol, l.qty])).toEqual([
      ['AAPL', 8],
      ['MSFT', 4],
    ])
  })

  it('rounds realized P&L and proceeds half-up to cents', () => {
    const p = buy(newPortfolio(), { symbol: 'AAPL', qty: 1, price: 10 }).state
    const { state, realized } = sell(p, { symbol: 'AAPL', qty: 1, price: 10.125 })
    expect(realized).toBe(0.13) // 0.125 → 0.13
    expect(state.cash).toBe(100_000.13) // proceeds 10.125 → 10.13, cost was 10
  })

  it('handles fractional quantities', () => {
    const p = buy(newPortfolio(), { symbol: 'AAPL', qty: 0.25, price: 200 }).state
    const { state, realized } = sell(p, { symbol: 'AAPL', qty: 0.1, price: 240 })
    expect(realized).toBe(4) // 0.1 × 40
    expect(state.lots[0].qty).toBeCloseTo(0.15, 10)
  })

  it('never mutates the input state', () => {
    const p = twoLots()
    const before = structuredClone(p)
    sell(p, { symbol: 'AAPL', qty: 15, price: 130 })
    expect(p).toEqual(before)
  })

  it.each<[string, TradeInput, string]>([
    ['more shares than held', { symbol: 'AAPL', qty: 21, price: 130, ts: TS }, 'insufficient-shares'],
    ['a symbol not held', { symbol: 'TSLA', qty: 1, price: 130, ts: TS }, 'insufficient-shares'],
    ['zero qty', { symbol: 'AAPL', qty: 0, price: 130, ts: TS }, 'bad-qty'],
    ['negative qty', { symbol: 'AAPL', qty: -1, price: 130, ts: TS }, 'bad-qty'],
    ['zero price', { symbol: 'AAPL', qty: 1, price: 0, ts: TS }, 'bad-price'],
  ])('rejects selling %s', (_label, input, code) => {
    const r = executeSell(twoLots(), input)
    expect(isTradeError(r)).toBe(true)
    if (isTradeError(r)) expect(r.code).toBe(code)
  })

  it('clamps float dust so "sell all" fully closes the position', () => {
    // 3 × 0.1 = 0.30000000000000004 — a UI summing lot quantities gets this.
    let p = newPortfolio()
    for (let i = 0; i < 3; i++) p = buy(p, { symbol: 'AAPL', qty: 0.1, price: 100 }).state
    const total = p.lots.reduce((s, l) => s + l.qty, 0)
    expect(total).toBeGreaterThan(0.3)

    const { state } = sell(p, { symbol: 'AAPL', qty: total, price: 100 })
    expect(state.lots).toEqual([])
    expect(sharesHeld(state, 'AAPL')).toBe(0)
  })
})

describe('buy/sell round trip', () => {
  it('returns the account to its starting cash at a flat price', () => {
    const p = buy(newPortfolio(), { symbol: 'AAPL', qty: 12, price: 175.5 }).state
    const { state } = sell(p, { symbol: 'AAPL', qty: 12, price: 175.5 })
    expect(state.cash).toBe(STARTING_CASH)
    expect(state.realizedPnl).toBe(0)
    expect(state.lots).toEqual([])
    expect(state.transactions).toHaveLength(2)
  })

  it('cash gain equals realized P&L after a profitable round trip', () => {
    const p = buy(newPortfolio(), { symbol: 'AAPL', qty: 10, price: 100 }).state
    const { state, realized } = sell(p, { symbol: 'AAPL', qty: 10, price: 125 })
    expect(realized).toBe(250)
    expect(state.cash - STARTING_CASH).toBe(250)
  })
})

// ─── positions ───────────────────────────────────────────────────────────────

describe('positions', () => {
  it('aggregates lots per symbol with a weighted average cost', () => {
    expect(positions(twoLots())).toEqual([
      { symbol: 'AAPL', qty: 20, avgCost: 110, costValue: 2200 },
    ])
  })

  it('weights by quantity, not by lot count', () => {
    const a = buy(newPortfolio(), { symbol: 'AAPL', qty: 30, price: 100 }).state
    const b = buy(a, { symbol: 'AAPL', qty: 10, price: 200 }).state
    expect(positions(b)[0]).toEqual({ symbol: 'AAPL', qty: 40, avgCost: 125, costValue: 5000 })
  })

  it('sorts by symbol regardless of trade order', () => {
    let p = newPortfolio()
    for (const s of ['TSLA', 'AAPL', 'MSFT']) p = buy(p, { symbol: s, qty: 1, price: 100 }).state
    expect(positions(p).map((x) => x.symbol)).toEqual(['AAPL', 'MSFT', 'TSLA'])
  })

  it('is empty for a fresh portfolio', () => {
    expect(positions(newPortfolio())).toEqual([])
  })

  it('drops symbols that were fully sold', () => {
    const p = buy(newPortfolio(), { symbol: 'AAPL', qty: 5, price: 100 }).state
    const { state } = sell(p, { symbol: 'AAPL', qty: 5, price: 100 })
    expect(positions(state)).toEqual([])
  })

  it('reports avgCost to 6 decimals', () => {
    const a = buy(newPortfolio(), { symbol: 'AAPL', qty: 3, price: 100 }).state
    const b = buy(a, { symbol: 'AAPL', qty: 1, price: 101 }).state
    expect(positions(b)[0].avgCost).toBe(100.25)
  })
})

describe('sharesHeld', () => {
  it.each([
    ['AAPL', 20],
    ['aapl', 20],
    ['MSFT', 0],
  ])('sharesHeld(%s) === %s', (symbol, expected) => {
    expect(sharesHeld(twoLots(), symbol)).toBe(expected)
  })
})

// ─── equity ──────────────────────────────────────────────────────────────────

describe('portfolioEquity', () => {
  it('marks positions to market', () => {
    const p = twoLots() // 20 AAPL, cost 2200, cash 97 800
    expect(portfolioEquity(p, { AAPL: 130 })).toEqual({
      equity: 100_400,
      cash: 97_800,
      positionsValue: 2600,
      unrealizedPnl: 400,
      pricesMissing: [],
    })
  })

  it('reports a fresh portfolio as all cash', () => {
    expect(portfolioEquity(newPortfolio(), {})).toEqual({
      equity: STARTING_CASH,
      cash: STARTING_CASH,
      positionsValue: 0,
      unrealizedPnl: 0,
      pricesMissing: [],
    })
  })

  it('shows an unrealized loss when the mark is below cost', () => {
    const e = portfolioEquity(twoLots(), { AAPL: 90 })
    expect(e.positionsValue).toBe(1800)
    expect(e.unrealizedPnl).toBe(-400)
  })

  it('falls back to average cost for a missing price and flags the symbol', () => {
    const p = buy(twoLots(), { symbol: 'MSFT', qty: 5, price: 400 }).state
    const e = portfolioEquity(p, { AAPL: 130 })

    expect(e.pricesMissing).toEqual(['MSFT'])
    expect(e.positionsValue).toBe(2600 + 2000) // MSFT carried at its 400 cost
    expect(e.unrealizedPnl).toBe(400) // the fallback contributes nothing
  })

  it.each([
    ['absent', undefined],
    ['zero', 0],
    ['negative', -5],
    ['NaN', Number.NaN],
  ])('treats a %s price as missing', (_label, px) => {
    const prices: PriceMap = px === undefined ? {} : { AAPL: px }
    const e = portfolioEquity(twoLots(), prices)
    expect(e.pricesMissing).toEqual(['AAPL'])
    expect(e.positionsValue).toBe(2200)
  })

  it('excludes realized P&L from unrealized', () => {
    const { state } = sell(twoLots(), { symbol: 'AAPL', qty: 10, price: 130 })
    const e = portfolioEquity(state, { AAPL: 130 })
    expect(state.realizedPnl).toBe(300)
    expect(e.unrealizedPnl).toBe(100) // remaining 10 @120 marked at 130
  })

  it('rounds to cents', () => {
    const p = buy(newPortfolio(), { symbol: 'AAPL', qty: 3, price: 10 }).state
    const e = portfolioEquity(p, { AAPL: 33.333 })
    expect(e.positionsValue).toBe(100) // 99.999
  })
})

// ─── concentration ───────────────────────────────────────────────────────────

describe('concentrationPct', () => {
  it('is 0 for a symbol not held with nothing added', () => {
    expect(concentrationPct(newPortfolio(), 'AAPL', 0, {})).toBe(0)
  })

  it('measures an existing position against equity', () => {
    // 20 AAPL @130 = 2 600 of 100 400 equity
    expect(concentrationPct(twoLots(), 'AAPL', 0, { AAPL: 130 })).toBeCloseTo(2.5896, 3)
  })

  it('a buy is value-neutral: $25k into a fresh $100k account is 25%', () => {
    expect(concentrationPct(newPortfolio(), 'AAPL', 25_000, {})).toBe(25)
  })

  it('adds to an existing position', () => {
    const p = buy(newPortfolio(), { symbol: 'AAPL', qty: 100, price: 100 }).state // 10k of 100k
    expect(concentrationPct(p, 'AAPL', 0, { AAPL: 100 })).toBe(10)
    expect(concentrationPct(p, 'AAPL', 15_000, { AAPL: 100 })).toBe(25)
  })

  it('trips the guardrail past 20%', () => {
    const p = newPortfolio()
    expect(concentrationPct(p, 'AAPL', 20_000, {})).toBeLessThanOrEqual(CONCENTRATION_WARN_PCT)
    expect(concentrationPct(p, 'AAPL', 20_100, {})).toBeGreaterThan(CONCENTRATION_WARN_PCT)
  })

  it('is 100% when the whole account is in one name', () => {
    const p = buy(newPortfolio(), { symbol: 'SPY', qty: 200, price: 500 }).state
    expect(concentrationPct(p, 'SPY', 0, { SPY: 500 })).toBe(100)
  })

  it('uses the cost-basis fallback when the price is missing', () => {
    const p = buy(newPortfolio(), { symbol: 'AAPL', qty: 100, price: 100 }).state
    expect(concentrationPct(p, 'AAPL', 0, {})).toBe(10)
  })

  it('normalizes the symbol', () => {
    const p = buy(newPortfolio(), { symbol: 'AAPL', qty: 100, price: 100 }).state
    expect(concentrationPct(p, 'aapl', 0, { AAPL: 100 })).toBe(10)
  })

  it.each([
    [Number.NaN],
    [-1000],
  ])('ignores a nonsensical addCost (%s)', (addCost) => {
    const p = buy(newPortfolio(), { symbol: 'AAPL', qty: 100, price: 100 }).state
    expect(concentrationPct(p, 'AAPL', addCost, { AAPL: 100 })).toBe(10)
  })

  it('returns 0 rather than dividing by a zero equity', () => {
    const broke: PortfolioState = { ...newPortfolio(), cash: 0 }
    expect(concentrationPct(broke, 'AAPL', 1000, {})).toBe(0)
  })
})
