// ─── Read-the-financials drills: data + content verification ─────────────────
//
// The point of this file is that no number in `src/content/drills/financials.ts`
// is trusted. For every `ratio-calc` drill the true value is recomputed from
// `public/data/financials/companies.json` with the pure helpers in
// `@core/financials/ratios`, the number is parsed back out of the choice text,
// and the keyed choice has to match to the precision it is printed at while all
// three distractors have to miss. A single mistyped digit fails the suite.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { addDays } from '@core/clock'
import {
  DRILL_EXCLUSION_DAYS,
  DRILL_ROTATION_2,
  DRILL_ROTATION_3,
  dayOfEpoch,
  drillKindForDay,
  pickDailyDrill,
} from '@core/drills/engine'
import {
  assetTurnover,
  bookValuePerShare,
  capexToRevenue,
  cashConversion,
  cashRatio,
  currentRatio,
  daysInventory,
  daysSalesOutstanding,
  debtToAssets,
  debtToEquity,
  effectiveTaxRate,
  equityMultiplier,
  fcfMargin,
  goodwillToAssets,
  grossMargin,
  interestCoverage,
  inventoryTurnover,
  longTermDebtToEquity,
  netDebt,
  netMargin,
  operatingMargin,
  pretaxMargin,
  quickRatio,
  returnOnAssets,
  returnOnEquity,
  sbcToRevenue,
  statementIssues,
  tangibleBookValue,
} from '@core/financials/ratios'
import { FIN_DRILLS, FIN_DRILL_KIND_LABELS, finDrillById } from '@content/drills/financials'
import { PATTERN_DRILLS, WHATNEXT_DRILLS } from '@content/drills/patterns'
import type {
  DrillHistory,
  DrillResult,
  FinDrillDef,
  FinStatementSnapshot,
  PatternDrillDef,
  WhatNextDrillDef,
} from '@core/types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const COMPANIES: FinStatementSnapshot[] = JSON.parse(
  readFileSync(fileURLToPath(new URL('../public/data/financials/companies.json', import.meta.url)), 'utf8'),
)

const BY_ID = new Map(COMPANIES.map((c) => [c.id, c]))

function snap(id: string): FinStatementSnapshot {
  const s = BY_ID.get(id)
  if (!s) throw new Error(`unknown statement id: ${id}`)
  return s
}

const EMPTY: DrillHistory = { results: [] }

// ─── The dataset ─────────────────────────────────────────────────────────────

/**
 * The drills are all single-period, so the twelve FY2024 snapshots are "the
 * company set". The case studies (src/content/cases) additionally ship a few
 * FY2023 snapshots of companies already in that set, because almost every
 * earnings-quality signal is a trend and the snapshot shape holds one period —
 * a trend is therefore two snapshots side by side. They are held to the same
 * identities and the same populated-field checks below.
 */
const CURRENT = COMPANIES.filter((c) => c.period === 'FY2024')
const PRIOR = COMPANIES.filter((c) => c.period !== 'FY2024')

describe('companies.json', () => {
  it('ships twelve current-year companies with unique ids and names', () => {
    expect(CURRENT).toHaveLength(12)
    expect(new Set(COMPANIES.map((c) => c.id)).size).toBe(COMPANIES.length)
    expect(new Set(CURRENT.map((c) => c.company)).size).toBe(12)
  })

  it('adds prior-year snapshots only for companies already in the current set', () => {
    for (const p of PRIOR) {
      const current = CURRENT.find((c) => c.company === p.company)
      expect(current, `${p.id} has no FY2024 counterpart`).toBeDefined()
      expect(p.sector).toBe(current?.sector)
    }
  })

  it('covers a spread of sectors', () => {
    // Twelve distinct sectors is the whole point: ratios are only readable
    // against an industry, so the set has to contain the contrasts.
    expect(new Set(CURRENT.map((c) => c.sector)).size).toBe(12)
  })

  it.each(COMPANIES.map((c) => [c.id, c] as const))(
    '%s satisfies every accounting identity',
    (_id, c) => {
      expect(statementIssues(c)).toEqual([])
    },
  )

  it.each(COMPANIES.map((c) => [c.id, c] as const))('%s is fully populated', (_id, c) => {
    expect(c.company.length).toBeGreaterThan(0)
    expect(c.sector.length).toBeGreaterThan(0)
    expect(c.period).toMatch(/^FY\d{4}$/)
    const numbers = [
      ...Object.values(c.incomeStatement),
      ...Object.values(c.balanceSheet),
      ...Object.values(c.cashFlow),
    ]
    for (const n of numbers) expect(Number.isFinite(n)).toBe(true)
  })

  it.each(COMPANIES.map((c) => [c.id, c] as const))(
    '%s has a positive, non-trivial revenue base',
    (_id, c) => {
      expect(c.incomeStatement.revenue).toBeGreaterThan(0)
      expect(c.balanceSheet.totalAssets).toBeGreaterThan(0)
      expect(c.balanceSheet.equity).toBeGreaterThan(0)
    },
  )

  // The characters the drills lean on. If someone retunes the data, these fail
  // before the drills that depend on them start teaching the wrong lesson.
  it('gives the software company an 80% gross margin and heavy stock comp', () => {
    const s = snap('northwind-systems')
    expect(grossMargin(s)).toBeCloseTo(0.8, 10)
    expect(sbcToRevenue(s)).toBeGreaterThan(0.1)
  })

  it('gives the grocer a 25% gross margin and fast inventory turns', () => {
    const s = snap('harborline-grocers')
    expect(grossMargin(s)).toBeCloseTo(0.25, 10)
    expect(inventoryTurnover(s)).toBeGreaterThan(9)
    expect(assetTurnover(s)).toBeGreaterThan(2.5)
    expect(currentRatio(s)).toBeLessThan(1)
  })

  it('gives the airline heavy capex and heavy leverage', () => {
    const s = snap('skyline-air')
    expect(capexToRevenue(s)).toBeGreaterThan(0.1)
    expect(s.cashFlow.capex / s.cashFlow.cfo).toBeGreaterThan(0.85)
    expect(debtToEquity(s)).toBeGreaterThan(3)
    expect(grossMargin(s)).toBeLessThan(0.2)
  })

  it('embeds every intended red flag in the retailer', () => {
    const s = snap('brightway-retail')
    // CFO far below net income
    expect(cashConversion(s)).toBeLessThan(0.3)
    // inventory bloated versus sales
    expect(inventoryTurnover(s)).toBeLessThan(2.5)
    expect(daysInventory(s)).toBeGreaterThan(150)
    // goodwill huge, and larger than equity
    expect(goodwillToAssets(s)).toBeGreaterThan(0.35)
    expect(tangibleBookValue(s)).toBeLessThan(0)
    // thin interest coverage
    expect(interestCoverage(s)).toBeLessThan(1.5)
    expect(s.cashFlow.fcf).toBeLessThan(0)
  })

  it('keeps the counter-example companies clean of the retailer pattern', () => {
    // Granite and Ridgeline also post negative FCF / negative CFO, which is
    // exactly why the red-flag drills use them — but they must not share
    // Brightway's balance-sheet damage, or the lesson collapses.
    for (const id of ['granite-power', 'ridgeline-homes']) {
      expect(tangibleBookValue(snap(id))).toBeGreaterThan(0)
      expect(interestCoverage(snap(id))).toBeGreaterThan(2)
    }
  })
})

// ─── Drill shape ─────────────────────────────────────────────────────────────

describe('FIN_DRILLS', () => {
  it('ships 36 drills split 16 / 12 / 8', () => {
    expect(FIN_DRILLS).toHaveLength(36)
    const count = (k: FinDrillDef['kind']): number => FIN_DRILLS.filter((d) => d.kind === k).length
    expect(count('ratio-calc')).toBe(16)
    expect(count('compare')).toBe(12)
    expect(count('red-flag')).toBe(8)
  })

  it('has unique ids', () => {
    expect(new Set(FIN_DRILLS.map((d) => d.id)).size).toBe(FIN_DRILLS.length)
  })

  it('does not collide with the chart-drill id space', () => {
    const chartIds = new Set<string>([
      ...PATTERN_DRILLS.map((d) => d.id),
      ...WHATNEXT_DRILLS.map((d) => d.id),
    ])
    for (const d of FIN_DRILLS) expect(chartIds.has(d.id)).toBe(false)
  })

  it.each(FIN_DRILLS.map((d) => [d.id, d] as const))('%s references real statements', (_id, d) => {
    for (const sid of d.statementIds) expect(BY_ID.has(sid)).toBe(true)
    expect(d.statementIds).toHaveLength(d.kind === 'compare' ? 2 : 1)
    // A comparison of a company with itself would have no answer.
    expect(new Set(d.statementIds).size).toBe(d.statementIds.length)
  })

  it.each(FIN_DRILLS.map((d) => [d.id, d] as const))('%s is a well-formed question', (_id, d) => {
    expect(d.choices).toHaveLength(4)
    expect(new Set(d.choices).size).toBe(4)
    for (const c of d.choices) expect(c.trim().length).toBeGreaterThan(0)
    expect(d.answerIdx).toBeGreaterThanOrEqual(0)
    expect(d.answerIdx).toBeLessThanOrEqual(3)
    expect(d.prompt.trim().length).toBeGreaterThan(20)
    // Every explain teaches: it shows the arithmetic and covers the distractors.
    expect(d.explain.length).toBeGreaterThan(200)
    expect(d.explain).toMatch(/[=÷×]/)
  })

  it('names the company in every prompt', () => {
    for (const d of FIN_DRILLS) {
      for (const sid of d.statementIds) {
        expect(d.prompt).toContain(snap(sid).company)
      }
    }
  })

  it('spreads the ratio-calc drills over most of the dataset', () => {
    const used = new Set(
      FIN_DRILLS.filter((d) => d.kind === 'ratio-calc').flatMap((d) => d.statementIds),
    )
    expect(used.size).toBeGreaterThanOrEqual(10)
  })

  it('uses every current-year company at least once across all kinds', () => {
    // The prior-year snapshots exist for the case studies, which are the only
    // content that reads two periods at once; the drills are single-period.
    const used = new Set(FIN_DRILLS.flatMap((d) => d.statementIds))
    expect([...used].sort()).toEqual(CURRENT.map((c) => c.id).sort())
  })

  it('exposes a label for every fin drill kind', () => {
    for (const d of FIN_DRILLS) {
      expect(FIN_DRILL_KIND_LABELS[d.kind].length).toBeGreaterThan(0)
    }
  })
})

describe('finDrillById', () => {
  it('returns each shipped drill', () => {
    for (const d of FIN_DRILLS) expect(finDrillById(d.id)).toBe(d)
  })

  it('returns undefined for an unknown id', () => {
    expect(finDrillById('fin-rc-99')).toBeUndefined()
  })
})

// ─── The arithmetic ──────────────────────────────────────────────────────────

/**
 * Pull the leading signed number out of a choice string.
 * Handles `$770M`, `−$450M`, `1.81`, `80.0%`, `15.9 days`, `$2,010M`, `1.25x`.
 */
export function parseChoiceNumber(choice: string): number {
  const m = choice.match(/(-|−)?\s*\$?\s*(\d[\d,]*(?:\.\d+)?)/)
  if (!m) throw new Error(`no number in choice: ${choice}`)
  const sign = m[1] ? -1 : 1
  return sign * Number(m[2].replace(/,/g, ''))
}

/** Decimal places printed in a choice — sets the rounding tolerance. */
function decimals(choice: string): number {
  const m = choice.match(/\d+\.(\d+)/)
  return m ? m[1].length : 0
}

/**
 * Every ratio-calc drill, restated independently: what quantity it asks for and
 * how the number is printed. This table is deliberately a *second* statement of
 * each question — if it and the drill disagree, one of them is wrong.
 *
 * The function returns the value in the units the choice prints it in: a
 * fraction ratio is scaled to percent where the choice says `%`.
 */
const PCT = 100

const RATIO_CHECKS: Record<string, (s: FinStatementSnapshot) => number> = {
  'fin-rc-01': (s) => currentRatio(s),
  'fin-rc-02': (s) => quickRatio(s),
  'fin-rc-03': (s) => PCT * grossMargin(s),
  'fin-rc-04': (s) => PCT * operatingMargin(s),
  'fin-rc-05': (s) => interestCoverage(s),
  'fin-rc-06': (s) => debtToEquity(s),
  'fin-rc-07': (s) => PCT * returnOnEquity(s),
  'fin-rc-08': (s) => s.cashFlow.fcf,
  'fin-rc-09': (s) => inventoryTurnover(s),
  'fin-rc-10': (s) => PCT * effectiveTaxRate(s),
  'fin-rc-11': (s) => bookValuePerShare(s),
  'fin-rc-12': (s) => PCT * sbcToRevenue(s),
  'fin-rc-13': (s) => assetTurnover(s),
  'fin-rc-14': (s) => daysSalesOutstanding(s),
  'fin-rc-15': (s) => s.incomeStatement.eps,
  'fin-rc-16': (s) => s.cashFlow.fcf,
}

/**
 * The specific miscalculation each distractor is meant to be, again recomputed
 * from the JSON. Verifying these too is what makes the `explain` text
 * trustworthy: the drill claims "0.55 is the ratio upside down", and this
 * asserts that 0.55 really is 2,600 ÷ 4,700.
 */
const DISTRACTOR_CHECKS: Record<
  string,
  Array<{ why: string; value: (s: FinStatementSnapshot) => number }>
> = {
  'fin-rc-01': [
    { why: 'inverted', value: (s) => 1 / currentRatio(s) },
    { why: 'quick ratio instead', value: (s) => quickRatio(s) },
    {
      why: 'total assets over current liabilities',
      value: (s) => s.balanceSheet.totalAssets / s.balanceSheet.currentLiabilities,
    },
  ],
  'fin-rc-02': [
    { why: 'cash ratio instead', value: (s) => cashRatio(s) },
    { why: 'current ratio instead', value: (s) => currentRatio(s) },
    { why: 'inverted', value: (s) => 1 / quickRatio(s) },
  ],
  'fin-rc-03': [
    { why: 'cogs over revenue', value: (s) => PCT * (s.incomeStatement.cogs / s.incomeStatement.revenue) },
    { why: 'operating margin instead', value: (s) => PCT * operatingMargin(s) },
    { why: 'net margin instead', value: (s) => PCT * netMargin(s) },
  ],
  'fin-rc-04': [
    { why: 'gross margin instead', value: (s) => PCT * grossMargin(s) },
    { why: 'pretax margin instead', value: (s) => PCT * pretaxMargin(s) },
    { why: 'net margin instead', value: (s) => PCT * netMargin(s) },
  ],
  'fin-rc-05': [
    {
      why: 'pretax income over interest',
      value: (s) => s.incomeStatement.pretaxIncome / s.incomeStatement.interestExpense,
    },
    {
      why: 'net income over interest',
      value: (s) => s.incomeStatement.netIncome / s.incomeStatement.interestExpense,
    },
    { why: 'inverted', value: (s) => 1 / interestCoverage(s) },
  ],
  'fin-rc-06': [
    { why: 'long-term debt only', value: (s) => longTermDebtToEquity(s) },
    { why: 'debt to assets instead', value: (s) => debtToAssets(s) },
    { why: 'inverted', value: (s) => 1 / debtToEquity(s) },
  ],
  'fin-rc-07': [
    { why: 'return on assets instead', value: (s) => PCT * returnOnAssets(s) },
    { why: 'net margin instead', value: (s) => PCT * netMargin(s) },
    {
      why: 'operating income over equity',
      value: (s) => PCT * (s.incomeStatement.operatingIncome / s.balanceSheet.equity),
    },
  ],
  'fin-rc-08': [
    { why: 'cfo alone', value: (s) => s.cashFlow.cfo },
    { why: 'capex added instead of subtracted', value: (s) => s.cashFlow.cfo + s.cashFlow.capex },
    { why: 'sbc double-counted', value: (s) => s.cashFlow.fcf - s.cashFlow.sbc },
  ],
  'fin-rc-09': [
    {
      why: 'revenue instead of cogs',
      value: (s) => s.incomeStatement.revenue / s.balanceSheet.inventory,
    },
    {
      why: 'cogs over current assets',
      value: (s) => s.incomeStatement.cogs / s.balanceSheet.currentAssets,
    },
    {
      why: 'cogs over total assets',
      value: (s) => s.incomeStatement.cogs / s.balanceSheet.totalAssets,
    },
  ],
  'fin-rc-10': [
    {
      why: 'taxes over net income',
      value: (s) => PCT * (s.incomeStatement.taxes / s.incomeStatement.netIncome),
    },
    {
      why: 'taxes over operating income',
      value: (s) => PCT * (s.incomeStatement.taxes / s.incomeStatement.operatingIncome),
    },
    {
      why: 'taxes over revenue',
      value: (s) => PCT * (s.incomeStatement.taxes / s.incomeStatement.revenue),
    },
  ],
  'fin-rc-11': [
    { why: 'tangible book per share', value: (s) => tangibleBookValue(s) / s.incomeStatement.shares },
    {
      why: 'total assets per share',
      value: (s) => s.balanceSheet.totalAssets / s.incomeStatement.shares,
    },
    {
      why: 'total liabilities per share',
      value: (s) => s.balanceSheet.totalLiabilities / s.incomeStatement.shares,
    },
  ],
  'fin-rc-12': [
    { why: 'sbc over opex', value: (s) => PCT * (s.cashFlow.sbc / s.incomeStatement.opex) },
    {
      why: 'sbc over gross profit',
      value: (s) => PCT * (s.cashFlow.sbc / s.incomeStatement.grossProfit),
    },
    { why: 'sbc over cfo', value: (s) => PCT * (s.cashFlow.sbc / s.cashFlow.cfo) },
  ],
  'fin-rc-13': [
    {
      why: 'revenue over current assets',
      value: (s) => s.incomeStatement.revenue / s.balanceSheet.currentAssets,
    },
    {
      why: 'revenue over equity',
      value: (s) => s.incomeStatement.revenue / s.balanceSheet.equity,
    },
    { why: 'inverted', value: (s) => 1 / assetTurnover(s) },
  ],
  'fin-rc-14': [
    {
      why: 'divided by cogs',
      value: (s) => (365 * s.balanceSheet.receivables) / s.incomeStatement.cogs,
    },
    { why: 'days inventory instead', value: (s) => daysInventory(s) },
    {
      why: 'inventory included in the numerator',
      value: (s) =>
        (365 * (s.balanceSheet.receivables + s.balanceSheet.inventory)) / s.incomeStatement.revenue,
    },
  ],
  'fin-rc-15': [
    {
      why: 'pretax income per share',
      value: (s) => s.incomeStatement.pretaxIncome / s.incomeStatement.shares,
    },
    {
      why: 'operating income per share',
      value: (s) => s.incomeStatement.operatingIncome / s.incomeStatement.shares,
    },
    {
      why: 'sbc double-counted',
      value: (s) => (s.incomeStatement.netIncome - s.cashFlow.sbc) / s.incomeStatement.shares,
    },
  ],
  'fin-rc-16': [
    { why: 'sign flipped', value: (s) => -s.cashFlow.fcf },
    { why: 'cfo alone', value: (s) => s.cashFlow.cfo },
    { why: 'net income instead', value: (s) => s.incomeStatement.netIncome },
  ],
}

const RATIO_DRILLS = FIN_DRILLS.filter((d) => d.kind === 'ratio-calc')

describe('ratio-calc answers', () => {
  it('has a recomputation for every ratio-calc drill', () => {
    expect(Object.keys(RATIO_CHECKS).sort()).toEqual(RATIO_DRILLS.map((d) => d.id).sort())
    expect(Object.keys(DISTRACTOR_CHECKS).sort()).toEqual(RATIO_DRILLS.map((d) => d.id).sort())
  })

  it.each(RATIO_DRILLS.map((d) => [d.id, d] as const))(
    '%s: the keyed choice equals the value recomputed from the JSON',
    (id, d) => {
      const s = snap(d.statementIds[0])
      const truth = RATIO_CHECKS[id](s)
      const keyed = d.choices[d.answerIdx]
      const tol = 0.5 * 10 ** -decimals(keyed) + 1e-9
      expect(Math.abs(parseChoiceNumber(keyed) - truth)).toBeLessThanOrEqual(tol)
    },
  )

  it.each(RATIO_DRILLS.map((d) => [d.id, d] as const))(
    '%s: no distractor is within rounding distance of the truth',
    (id, d) => {
      const s = snap(d.statementIds[0])
      const truth = RATIO_CHECKS[id](s)
      const keyed = d.choices[d.answerIdx]
      const tol = 0.5 * 10 ** -decimals(keyed) + 1e-9
      d.choices.forEach((choice, i) => {
        if (i === d.answerIdx) return
        const gap = Math.abs(parseChoiceNumber(choice) - truth)
        // Not merely outside the rounding band — far enough that a learner who
        // did the arithmetic right cannot land on it.
        expect(gap).toBeGreaterThan(tol)
        expect(gap).toBeGreaterThan(0.01 * Math.abs(truth))
      })
    },
  )

  it.each(RATIO_DRILLS.map((d) => [d.id, d] as const))(
    '%s: each distractor really is the miscalculation the explain claims',
    (id, d) => {
      const s = snap(d.statementIds[0])
      const wrong = d.choices.filter((_, i) => i !== d.answerIdx).map(parseChoiceNumber)
      for (const { why, value } of DISTRACTOR_CHECKS[id]) {
        const expected = value(s)
        const hit = wrong.some((w) => {
          // The distractor is printed to some precision; match against the
          // loosest band any of the three choices uses.
          const tol = Math.max(0.05, 0.005 * Math.abs(expected))
          return Math.abs(w - expected) <= tol
        })
        expect(hit, `${id}: no choice matches "${why}" (${expected})`).toBe(true)
      }
    },
  )

  it('gives every ratio-calc prompt at least three figures to work from', () => {
    for (const d of RATIO_DRILLS) {
      expect(moneyFigures(d.prompt).length, d.id).toBeGreaterThanOrEqual(3)
    }
  })
})

/** Every `$1,234M` amount in a string, as magnitudes. */
function moneyFigures(text: string): number[] {
  return [...text.matchAll(/\$(\d[\d,]*)M/g)].map((m) => Number(m[1].replace(/,/g, '')))
}

describe('quoted figures', () => {
  it.each(FIN_DRILLS.map((d) => [d.id, d] as const))(
    '%s: every $M amount in the prompt is a real line item',
    (id, d) => {
      // A prompt that invents a number teaches a calculation the learner cannot
      // reproduce from the statements in front of them. Magnitudes are compared
      // because losses and outflows are quoted as "−$450M".
      const known = new Set(
        d.statementIds.flatMap((sid) => {
          const s = snap(sid)
          return [
            ...Object.values(s.incomeStatement),
            ...Object.values(s.balanceSheet),
            ...Object.values(s.cashFlow),
          ].map(Math.abs)
        }),
      )
      for (const n of moneyFigures(d.prompt)) {
        expect(known.has(n), `${id}: $${n}M is not a line item`).toBe(true)
      }
    },
  )
})

describe('parseChoiceNumber', () => {
  it.each<[string, number]>([
    ['1.81', 1.81],
    ['0.55', 0.55],
    ['80.0%', 80],
    ['1.25x', 1.25],
    ['$770M', 770],
    ['$2,010M', 2010],
    ['−$450M', -450],
    ['-$450M', -450],
    ['15.9 days', 15.9],
    ['$25.33', 25.33],
  ])('parses %s', (text, expected) => {
    expect(parseChoiceNumber(text)).toBe(expected)
  })

  it('throws when a choice has no number', () => {
    expect(() => parseChoiceNumber('no number here')).toThrow()
  })
})

// ─── Compare / red-flag claims ───────────────────────────────────────────────
//
// These drills have no single keyed number, so the arithmetic check is instead
// that the comparison the answer asserts actually holds in the data — and that
// the specific figures quoted in the explain are the ones the helpers produce.

const pct1 = (x: number): number => Math.round(x * 1000) / 10
const two = (x: number): number => Math.round(x * 100) / 100
const one = (x: number): number => Math.round(x * 10) / 10

describe('compare-drill claims', () => {
  it('fin-cmp-01: the software company out-margins the grocer 80% to 25%', () => {
    expect(pct1(grossMargin(snap('northwind-systems')))).toBe(80)
    expect(pct1(grossMargin(snap('harborline-grocers')))).toBe(25)
    expect(pct1(operatingMargin(snap('northwind-systems')))).toBe(25)
    expect(pct1(operatingMargin(snap('harborline-grocers')))).toBe(3)
  })

  it('fin-cmp-02: Skyline converts 7.10x, Brightway 0.22x', () => {
    expect(two(cashConversion(snap('skyline-air')))).toBe(7.1)
    expect(two(cashConversion(snap('brightway-retail')))).toBe(0.22)
    expect(snap('skyline-air').cashFlow.fcf).toBe(130)
  })

  it('fin-cmp-03: current ratios diverge, quick ratios do not', () => {
    expect(two(currentRatio(snap('ridgeline-homes')))).toBe(6.56)
    expect(two(currentRatio(snap('halden-industrial')))).toBe(1.81)
    expect(two(quickRatio(snap('ridgeline-homes')))).toBe(0.94)
    expect(two(quickRatio(snap('halden-industrial')))).toBe(0.91)
  })

  it('fin-cmp-04: Maison beats Silica on FCF margin despite a lower CFO margin', () => {
    expect(pct1(fcfMargin(snap('maison-rivelle')))).toBe(18.5)
    expect(pct1(fcfMargin(snap('silica-micro')))).toBe(11.2)
    expect(pct1(capexToRevenue(snap('maison-rivelle')))).toBe(5.6)
    expect(pct1(capexToRevenue(snap('silica-micro')))).toBe(18)
    const cfoMargin = (id: string): number =>
      pct1(snap(id).cashFlow.cfo / snap(id).incomeStatement.revenue)
    expect(cfoMargin('silica-micro')).toBeGreaterThan(cfoMargin('maison-rivelle'))
  })

  it('fin-cmp-05: the more levered lender has the better interest cover', () => {
    expect(two(debtToEquity(snap('beacon-credit')))).toBe(5.84)
    expect(two(debtToEquity(snap('granite-power')))).toBe(1.76)
    expect(two(interestCoverage(snap('beacon-credit')))).toBe(3.35)
    expect(two(interestCoverage(snap('granite-power')))).toBe(2.54)
  })

  it('fin-cmp-06 / 12: stock comp dominates Cobalt and does not dominate its peers', () => {
    expect(pct1(sbcToRevenue(snap('cobalt-cloud')))).toBe(22)
    expect(pct1(sbcToRevenue(snap('northwind-systems')))).toBe(12.4)
    expect(pct1(sbcToRevenue(snap('silica-micro')))).toBe(5.9)
    // SBC larger than the entire operating loss is the load-bearing claim.
    const cobalt = snap('cobalt-cloud')
    expect(cobalt.cashFlow.sbc).toBeGreaterThan(Math.abs(cobalt.incomeStatement.operatingIncome))
    expect(two(cobalt.cashFlow.sbc / Math.abs(cobalt.incomeStatement.operatingIncome))).toBe(2.2)
  })

  it('fin-cmp-07: identical margins, different FCF margins', () => {
    for (const id of ['northwind-systems', 'verity-therapeutics']) {
      expect(pct1(grossMargin(snap(id)))).toBe(80)
      expect(pct1(operatingMargin(snap(id)))).toBe(25)
    }
    expect(pct1(fcfMargin(snap('northwind-systems')))).toBe(29.5)
    expect(pct1(fcfMargin(snap('verity-therapeutics')))).toBe(23.1)
  })

  it('fin-cmp-08: the grocer turns stock five times faster than the retailer', () => {
    expect(two(inventoryTurnover(snap('harborline-grocers')))).toBe(10.18)
    expect(two(inventoryTurnover(snap('brightway-retail')))).toBe(2.11)
    expect(one(daysInventory(snap('harborline-grocers')))).toBe(35.9)
    expect(one(daysInventory(snap('brightway-retail')))).toBe(172.9)
  })

  it('fin-cmp-09: the utility is the more capital-intensive of the two', () => {
    expect(pct1(capexToRevenue(snap('granite-power')))).toBe(34.5)
    expect(pct1(capexToRevenue(snap('skyline-air')))).toBe(13)
    expect(snap('granite-power').cashFlow.fcf).toBe(-450)
    expect(snap('skyline-air').cashFlow.fcf).toBe(130)
  })

  it('fin-cmp-10: net cash, low leverage and 56x cover versus net debt and 6x', () => {
    expect(netDebt(snap('maison-rivelle'))).toBe(-2500)
    expect(netDebt(snap('halden-industrial'))).toBe(2180)
    expect(two(debtToEquity(snap('maison-rivelle')))).toBe(0.42)
    expect(two(debtToEquity(snap('halden-industrial')))).toBe(1.5)
    expect(two(interestCoverage(snap('maison-rivelle')))).toBe(56)
    expect(two(interestCoverage(snap('halden-industrial')))).toBe(6)
  })

  it('fin-cmp-11: near-equal ROE from opposite DuPont decompositions', () => {
    for (const id of ['beacon-credit', 'harborline-grocers']) {
      const s = snap(id)
      // The decomposition itself must hold, or the teaching point is fiction.
      expect(netMargin(s) * assetTurnover(s) * equityMultiplier(s)).toBeCloseTo(
        returnOnEquity(s),
        10,
      )
    }
    expect(pct1(returnOnEquity(snap('beacon-credit')))).toBe(15.8)
    expect(pct1(returnOnEquity(snap('harborline-grocers')))).toBe(16.1)
    expect(pct1(returnOnAssets(snap('beacon-credit')))).toBe(2.3)
    expect(pct1(returnOnAssets(snap('harborline-grocers')))).toBe(5.3)
    expect(two(equityMultiplier(snap('beacon-credit')))).toBe(6.84)
    expect(two(equityMultiplier(snap('harborline-grocers')))).toBe(3.03)
  })
})

describe('red-flag-drill claims', () => {
  it('fin-rf-01..05: every Brightway figure quoted is the one the helpers give', () => {
    const s = snap('brightway-retail')
    expect(two(cashConversion(s))).toBe(0.22)
    expect(pct1(grossMargin(s))).toBe(37)
    expect(two(inventoryTurnover(s))).toBe(2.11)
    expect(one(daysInventory(s))).toBe(172.9)
    expect(pct1(goodwillToAssets(s))).toBe(40.5)
    expect(tangibleBookValue(s)).toBe(-1400)
    expect(two(interestCoverage(s))).toBe(1.25)
    expect(two(debtToEquity(s))).toBe(5.11)
    expect(s.cashFlow.fcf).toBe(-118)
    expect(pct1(netMargin(s))).toBe(1.6)
    // "a 20% fall in operating profit erases pretax income"
    expect(s.incomeStatement.operatingIncome * 0.8).toBeCloseTo(s.incomeStatement.interestExpense, 0)
  })

  it('fin-rf-06: the utility is levered but covered, and outspends CFO by design', () => {
    const s = snap('granite-power')
    expect(two(interestCoverage(s))).toBe(2.54)
    expect(pct1(operatingMargin(s))).toBe(22)
    expect(two(cashConversion(s))).toBe(2.73)
    expect(s.cashFlow.capex).toBeGreaterThan(s.cashFlow.cfo)
  })

  it('fin-rf-07: the homebuilder burns cash from a conservatively funded pipeline', () => {
    const s = snap('ridgeline-homes')
    expect(two(cashConversion(s))).toBe(-0.45)
    expect(two(inventoryTurnover(s))).toBe(0.89)
    // The explain shows the learner's own arithmetic: 365 / 0.89 rounds to 410.
    expect(Math.round(365 / two(inventoryTurnover(s)))).toBe(410)
    expect(daysInventory(s)).toBeGreaterThan(400)
    expect(two(debtToEquity(s))).toBe(0.72)
    expect(two(interestCoverage(s))).toBe(7.33)
    expect(pct1(s.balanceSheet.inventory / s.balanceSheet.totalAssets)).toBe(79)
    // Worse cash conversion than Brightway — that is the whole trap.
    expect(cashConversion(s)).toBeLessThan(cashConversion(snap('brightway-retail')))
  })

  it('fin-rf-08: the airline\'s high conversion is depreciation, not quality', () => {
    const s = snap('skyline-air')
    expect(two(cashConversion(s))).toBe(7.1)
    expect(s.cashFlow.fcf).toBe(130)
    expect(pct1(fcfMargin(s))).toBe(0.9)
    expect(two(s.cashFlow.fcf / s.incomeStatement.netIncome)).toBe(0.47)
  })
})

// ─── Rotation ────────────────────────────────────────────────────────────────

/** First date on/after `from` whose three-kind rotation slot is `kind`. */
function dateForFinKind(kind: string, from = '2026-03-02'): string {
  let d = from
  for (let i = 0; i < 3; i++) {
    if (drillKindForDay(d, true) === kind) return d
    d = addDays(d, 1)
  }
  throw new Error(`no ${kind} day found`)
}

const P = (id: string): PatternDrillDef => ({
  id,
  symbol: 'AAPL',
  startIdx: 0,
  endIdx: 60,
  answer: 'uptrend',
  distractors: ['downtrend', 'consolidation', 'breakout'],
  explain: 'x',
})

const W = (id: string): WhatNextDrillDef => ({ id, symbol: 'AAPL', cutoffIdx: 100, horizon: 10 })

const F = (id: string): FinDrillDef => ({
  id,
  kind: 'ratio-calc',
  statementIds: ['northwind-systems'],
  prompt: 'p',
  choices: ['a', 'b', 'c', 'd'],
  answerIdx: 0,
  explain: 'x',
})

const R = (drillId: string, date: string, correct: boolean): DrillResult => ({
  drillId,
  kind: 'financials',
  date,
  correct,
  score: correct ? 10 : 0,
})

describe('drillKindForDay with financials', () => {
  it('leaves the two-kind rotation untouched by default', () => {
    expect(DRILL_ROTATION_2).toEqual(['pattern', 'whatnext'])
    expect(drillKindForDay('1970-01-01')).toBe('pattern')
    expect(drillKindForDay('1970-01-02')).toBe('whatnext')
    expect(drillKindForDay('1970-01-03')).toBe('pattern')
  })

  it('rotates three ways when asked', () => {
    expect(DRILL_ROTATION_3).toEqual(['pattern', 'whatnext', 'financials'])
    expect(drillKindForDay('1970-01-01', true)).toBe('pattern')
    expect(drillKindForDay('1970-01-02', true)).toBe('whatnext')
    expect(drillKindForDay('1970-01-03', true)).toBe('financials')
    expect(drillKindForDay('1970-01-04', true)).toBe('pattern')
  })

  it('visits each kind exactly once every three days', () => {
    let d = '2026-03-02'
    const seen: string[] = []
    for (let i = 0; i < 3; i++) {
      seen.push(drillKindForDay(d, true))
      d = addDays(d, 1)
    }
    expect(new Set(seen).size).toBe(3)
  })

  it('repeats on a three-day cycle and never desynchronises after a gap', () => {
    const d = '2026-05-19'
    expect(drillKindForDay(addDays(d, 3), true)).toBe(drillKindForDay(d, true))
    expect(drillKindForDay(addDays(d, 30), true)).toBe(drillKindForDay(d, true))
    expect(drillKindForDay(addDays(d, 1), true)).not.toBe(drillKindForDay(d, true))
  })

  it('agrees with the two-kind rotation every sixth day', () => {
    // Both cycles start on `pattern` at the epoch, so the switch to three kinds
    // never strands a learner mid-cycle.
    for (let k = 0; k < 5; k++) {
      const d = addDays('1970-01-01', k * 6)
      expect(drillKindForDay(d, true)).toBe(drillKindForDay(d))
      expect(dayOfEpoch(d) % 6).toBe(0)
    }
  })
})

describe('pickDailyDrill with financials', () => {
  const pd = [P('p0'), P('p1')]
  const wd = [W('w0'), W('w1')]
  const fd = [F('f0'), F('f1')]

  it('stays two-kind when finDefs is omitted or empty', () => {
    const day = dateForFinKind('financials')
    // On a day the three-kind rotation calls "financials", the two-kind
    // rotation must still return one of its own kinds.
    expect(pickDailyDrill(pd, wd, EMPTY, day)!.kind).not.toBe('financials')
    expect(pickDailyDrill(pd, wd, EMPTY, day, undefined, [])!.kind).not.toBe('financials')
  })

  it('produces byte-identical results to the pre-financials call for every kind', () => {
    let d = '2026-01-01'
    for (let i = 0; i < 30; i++) {
      expect(pickDailyDrill(PATTERN_DRILLS, WHATNEXT_DRILLS, EMPTY, d, undefined, [])).toEqual(
        pickDailyDrill(PATTERN_DRILLS, WHATNEXT_DRILLS, EMPTY, d),
      )
      d = addDays(d, 1)
    }
  })

  it('serves each kind on its rotation day once finDefs is supplied', () => {
    for (const kind of ['pattern', 'whatnext', 'financials'] as const) {
      const day = dateForFinKind(kind)
      expect(pickDailyDrill(pd, wd, EMPTY, day, undefined, fd)!.kind).toBe(kind)
    }
  })

  it('returns a real FinDrillDef on a financials day', () => {
    const day = dateForFinKind('financials')
    const got = pickDailyDrill(PATTERN_DRILLS, WHATNEXT_DRILLS, EMPTY, day, undefined, FIN_DRILLS)!
    expect(got.kind).toBe('financials')
    expect(finDrillById(got.def.id)).toBeDefined()
  })

  it('is deterministic for a given day and history', () => {
    let d = '2026-04-01'
    for (let i = 0; i < 12; i++) {
      const first = pickDailyDrill(PATTERN_DRILLS, WHATNEXT_DRILLS, EMPTY, d, undefined, FIN_DRILLS)
      for (let k = 0; k < 3; k++) {
        expect(pickDailyDrill(PATTERN_DRILLS, WHATNEXT_DRILLS, EMPTY, d, undefined, FIN_DRILLS)).toEqual(
          first,
        )
      }
      d = addDays(d, 1)
    }
  })

  it('varies the drill across days', () => {
    const ids = new Set<string>()
    let d = '2026-04-01'
    for (let i = 0; i < 24; i++) {
      ids.add(pickDailyDrill(PATTERN_DRILLS, WHATNEXT_DRILLS, EMPTY, d, undefined, FIN_DRILLS)!.def.id)
      d = addDays(d, 1)
    }
    expect(ids.size).toBeGreaterThan(14)
  })

  it('honours an injected rng inside the financials pool', () => {
    const day = dateForFinKind('financials')
    const four = [F('f0'), F('f1'), F('f2'), F('f3')]
    expect(pickDailyDrill(pd, wd, EMPTY, day, () => 0, four)!.def.id).toBe('f0')
    expect(pickDailyDrill(pd, wd, EMPTY, day, () => 0.5, four)!.def.id).toBe('f2')
    expect(pickDailyDrill(pd, wd, EMPTY, day, () => 1, four)!.def.id).toBe('f3')
  })

  it('returns null only when all three lists are empty', () => {
    expect(pickDailyDrill([], [], EMPTY, '2026-03-02', undefined, [])).toBeNull()
    const day = dateForFinKind('financials')
    expect(pickDailyDrill([], [], EMPTY, day, undefined, fd)!.kind).toBe('financials')
  })

  describe('60-day exclusion across kinds', () => {
    it('skips a financials drill answered correctly inside the window', () => {
      const day = dateForFinKind('financials')
      const history: DrillHistory = {
        results: [R('f0', addDays(day, -(DRILL_EXCLUSION_DAYS - 1)), true)],
      }
      expect(pickDailyDrill(pd, wd, history, day, undefined, fd)!.def.id).toBe('f1')
    })

    it('lets a financials drill back in exactly 60 days later', () => {
      const day = dateForFinKind('financials')
      const history: DrillHistory = {
        results: [R('f1', addDays(day, -DRILL_EXCLUSION_DAYS), true)],
      }
      expect(pickDailyDrill(pd, wd, history, day, () => 0.99, fd)!.def.id).toBe('f1')
    })

    it('does not exclude a financials drill answered wrong', () => {
      const day = dateForFinKind('financials')
      const history: DrillHistory = { results: [R('f1', addDays(day, -1), false)] }
      expect(pickDailyDrill(pd, wd, history, day, () => 0.99, fd)!.def.id).toBe('f1')
    })

    it('falls through to the next kind in rotation when the financials pool empties', () => {
      const day = dateForFinKind('financials')
      const history: DrillHistory = {
        results: [R('f0', addDays(day, -5), true), R('f1', addDays(day, -5), true)],
      }
      // financials → pattern → whatnext, so pattern is next.
      expect(pickDailyDrill(pd, wd, history, day, undefined, fd)!.kind).toBe('pattern')
    })

    it('falls through from pattern to whatnext before reaching financials', () => {
      const day = dateForFinKind('pattern')
      const history: DrillHistory = {
        results: [R('p0', addDays(day, -5), true), R('p1', addDays(day, -5), true)],
      }
      expect(pickDailyDrill(pd, wd, history, day, undefined, fd)!.kind).toBe('whatnext')
    })

    it('drops the exclusion rather than showing nothing when everything is mastered', () => {
      const day = dateForFinKind('financials')
      const results = [...pd, ...wd, ...fd].map((d) => R(d.id, addDays(day, -5), true))
      const got = pickDailyDrill(pd, wd, { results }, day, undefined, fd)
      expect(got).not.toBeNull()
      expect(got!.kind).toBe('financials')
    })

    it('excludes by id across kinds without cross-talk', () => {
      // A pattern drill and a fin drill sharing an id would be a content bug;
      // distinct ids must not interfere.
      const day = dateForFinKind('financials')
      const history: DrillHistory = { results: [R('p0', day, true), R('w0', day, true)] }
      const got = pickDailyDrill(pd, wd, history, day, undefined, fd)!
      expect(got.kind).toBe('financials')
      expect(['f0', 'f1']).toContain(got.def.id)
    })
  })
})
