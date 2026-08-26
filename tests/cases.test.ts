// ─── Case studies: content verification + progress logic ─────────────────────
//
// The bar here is the one tests/finDrills.test.ts set: **no number in the case
// content is trusted.** Every figure a case quotes is recomputed from
// public/data/financials/companies.json with the pure helpers in
// @core/financials/ratios and @core/financials/valuation, and then:
//
//   1. ANSWERS — for every quiz item that has a numeric answer, the recomputed
//      value is formatted and must appear in the keyed choice and in none of
//      the other three. A mistyped digit in a distractor fails the suite.
//   2. CLAIMS — every statement-derived figure quoted in the prose (the read
//      steps, the verdict, the worked explanations) has a row here, is
//      recomputed the same way, and must appear verbatim in that case's text.
//   3. THE SCAN — every percentage, multiple and $M figure anywhere in a case
//      is then extracted and must be accounted for: verified by (1) or (2),
//      equal to a raw line item of a statement the case references, or listed
//      in that case's ASSUMPTION_TOKENS with a note saying what it is. There is
//      no fourth category, so an unexplained number cannot survive here.
//
// Market assumptions (share prices, discount rates, growth paths, peer
// multiples) live in ASSUMPTIONS below rather than in the content, so the
// valuation figures the cases quote are derived here rather than asserted.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  assetTurnover,
  bookValuePerShare,
  capexToCfo,
  cashConversion,
  currentRatio,
  daysInventory,
  daysSalesOutstanding,
  debtToEquity,
  equityMultiplier,
  fcfMargin,
  goodwillToAssets,
  grossMargin,
  interestCoverage,
  inventoryTurnover,
  netDebt,
  netMargin,
  operatingMargin,
  quickRatio,
  returnOnAssets,
  returnOnEquity,
  sbcToRevenue,
  statementIssues,
  tangibleBookValue,
} from '@core/financials/ratios'
import { dcfValue, equityValuePerShare, impliedConstantGrowth } from '@core/financials/valuation'
import {
  CAPSTONE_CASE_ID,
  XP_CASE_COMPLETE,
  XP_CASE_CAPSTONE_BONUS,
  XP_CASE_QUESTION,
  beginCase,
  caseItems,
  caseThesisCount,
  completeCase,
  completionXp,
  emptyCasesState,
  isCaseUnlocked,
  nextOpenCaseId,
  recordCaseAnswer,
  sanitizeCasesState,
  saveCaseThesis,
  scoreCase,
  setCaseStep,
} from '@core/cases/progress'
import type { CasesState } from '@core/cases/progress'
import { CASES, CASE_ORDER, caseById, caseNumber, caseStatementIds } from '@content/cases'
import { STORAGE_KEYS, createMemoryStorage } from '@core/storage/adapter'
import { setCasesStorage, useCasesStore } from '@state/cases'
import type { CaseStudy, FinStatementSnapshot, QuizItem } from '@core/types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const COMPANIES: FinStatementSnapshot[] = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../public/data/financials/companies.json', import.meta.url)),
    'utf8',
  ),
)
const BY_ID = new Map(COMPANIES.map((c) => [c.id, c]))

function snap(id: string): FinStatementSnapshot {
  const s = BY_ID.get(id)
  if (!s) throw new Error(`unknown statement id: ${id}`)
  return s
}

const H24 = snap('harborline-grocers')
const H23 = snap('harborline-grocers-fy2023')
const C24 = snap('cobalt-cloud')
const C23 = snap('cobalt-cloud-fy2023')
const B24 = snap('brightway-retail')
const B23 = snap('brightway-retail-fy2023')
const SKY = snap('skyline-air')
const HAL = snap('halden-industrial')
const SIL = snap('silica-micro')
const MR = snap('maison-rivelle')

const NEW_COMPANIES = ['harborline-grocers-fy2023', 'cobalt-cloud-fy2023', 'brightway-retail-fy2023']

// ─── Formatting, matched to how the content writes numbers ───────────────────

/**
 * Round half away from zero, then print to `d` places — and print the minus as
 * U+2212, which is the character the content uses.
 *
 * The nudge matters: `852 / 480` is exactly 1.775, a person writes 1.78×, and
 * plain `toFixed(2)` gives "1.77" because the double nearest 1.775 is a hair
 * below it. 1e-9 is far larger than any representation error at these
 * magnitudes and far smaller than any figure that is genuinely near a tie.
 */
function fixed(v: number, d: number): string {
  const scale = 10 ** d
  const rounded = (Math.sign(v) * Math.round(Math.abs(v) * scale + 1e-9)) / scale
  return rounded.toFixed(d).replace('-', '−')
}

const pct = (v: number): string => `${fixed(v * 100, 1)}%`
const mult1 = (v: number): string => `${fixed(v, 1)}×`
const mult2 = (v: number): string => `${fixed(v, 2)}×`
const days = (v: number): string => `${fixed(v, 1)} days`
const plain = (v: number): string => String(v)

/** `-306` → `−$306M`; `8374` → `$8,374M`. U+2212 minus, as the content uses. */
function moneyM(v: number): string {
  const body = Math.abs(v).toLocaleString('en-US')
  return `${v < 0 ? '−' : ''}$${body}M`
}

/** Sign-blind form, for the scan: the token regex never captures a leading minus. */
const unsigned = (token: string): string => token.replace(/[-−]/g, '')

/** A derived $M figure the content quotes to the nearest million. */
const moneyRounded = (v: number): string => moneyM(Math.round(v))

/** `$140.13` — a per-share figure. */
const perShare = (v: number): string => `$${v.toFixed(2)}`

/**
 * Substring search that will not let `75.0%` satisfy a search for `5.0%`.
 * A numeric token has to start and end at a real boundary.
 */
function containsToken(haystack: string, token: string): boolean {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?<![\\d.,])${escaped}(?![\\d.,]*\\d)`).test(haystack)
}

// ─── Market assumptions ──────────────────────────────────────────────────────
// Everything a case asserts that is NOT in the statements. Each one is quoted in
// the content as a stated assumption; here it is the input the test values from.

const RAMP = [0.08, 0.07, 0.06, 0.05, 0.04] as const

const ASSUMPTIONS = {
  c1: {
    price: 19.5,
    discountRate: 0.07,
    terminal: 0.02,
    growth: [0.04, 0.04, 0.03, 0.03, 0.03],
    peerEvEbit: 11,
    taxRate: 0.24,
    wacc: 0.07,
  },
  c2: { price: 24 },
  c3: { price: 9, haldenPrice: 44, taxRate: 0.25, wacc: 0.09 },
  c4: { taxRate: 24 / 124, wacc: 0.09 },
  c5: {
    price: 76,
    discountRate: 0.09,
    terminal: 0.025,
    growth: RAMP,
    peerEvFcf: 18,
    taxRate: 0.15,
    wacc: 0.09,
  },
  c6: {
    price: 178,
    discountRate: 0.085,
    terminal: 0.025,
    growth: RAMP,
    peerEvEbit: 12,
    peerPe: 18,
    taxRate: 0.24,
    wacc: 0.08,
    capital: 50_000,
    riskPct: 0.01,
    entry: 140,
    invalidation: 126,
  },
} as const

// ── Derived valuation quantities, computed once and reused ───────────────────

const marketCap = (s: FinStatementSnapshot, price: number): number =>
  s.incomeStatement.shares * price
const enterpriseValue = (s: FinStatementSnapshot, price: number): number =>
  marketCap(s, price) + netDebt(s)

const EV_H = enterpriseValue(H24, ASSUMPTIONS.c1.price)
const EV_SKY = enterpriseValue(SKY, ASSUMPTIONS.c3.price)
const EV_HAL = enterpriseValue(HAL, ASSUMPTIONS.c3.haldenPrice)
const EV_C = enterpriseValue(C24, ASSUMPTIONS.c2.price)
const EV_SIL = enterpriseValue(SIL, ASSUMPTIONS.c5.price)
const EV_MR = enterpriseValue(MR, ASSUMPTIONS.c6.price)

const OWNER_EARNINGS_C = C24.cashFlow.fcf - C24.cashFlow.sbc
const OWNER_EARNINGS_SIL = SIL.cashFlow.fcf - SIL.cashFlow.sbc
const OWNER_EARNINGS_MR = MR.cashFlow.fcf - MR.cashFlow.sbc

/** Debt + equity − cash: the invested-capital denominator of Unit 5 item 4. */
function investedCapital(s: FinStatementSnapshot): number {
  return s.balanceSheet.longTermDebt + s.balanceSheet.equity - s.balanceSheet.cash
}

/** NOPAT ÷ (debt + equity − cash), the Unit 5 item-4 definition. */
function roic(s: FinStatementSnapshot, taxRate: number): number {
  const nopat = s.incomeStatement.operatingIncome * (1 - taxRate)
  const invested = s.balanceSheet.longTermDebt + s.balanceSheet.equity - s.balanceSheet.cash
  return nopat / invested
}

const dcfPerShare = (
  s: FinStatementSnapshot,
  base: number,
  a: { growth: readonly number[]; terminal: number; discountRate: number },
): number =>
  equityValuePerShare(
    dcfValue({
      base,
      growthRates: a.growth,
      terminalGrowth: a.terminal,
      discountRate: a.discountRate,
    }).value,
    netDebt(s),
    s.incomeStatement.shares,
  )

const C1_DCF = dcfPerShare(H24, H24.cashFlow.fcf, ASSUMPTIONS.c1)
const C1_PEER = equityValuePerShare(
  ASSUMPTIONS.c1.peerEvEbit * H24.incomeStatement.operatingIncome,
  netDebt(H24),
  H24.incomeStatement.shares,
)
const C1_CENTRAL = (C1_DCF + C1_PEER) / 2

const C5_DCF_FCF = dcfPerShare(SIL, SIL.cashFlow.fcf, ASSUMPTIONS.c5)
const C5_DCF_OE = dcfPerShare(SIL, OWNER_EARNINGS_SIL, ASSUMPTIONS.c5)
const C5_PEER = equityValuePerShare(
  ASSUMPTIONS.c5.peerEvFcf * SIL.cashFlow.fcf,
  netDebt(SIL),
  SIL.incomeStatement.shares,
)

const C6_DCF = dcfPerShare(MR, OWNER_EARNINGS_MR, ASSUMPTIONS.c6)
const C6_PEER_EBIT = equityValuePerShare(
  ASSUMPTIONS.c6.peerEvEbit * MR.incomeStatement.operatingIncome,
  netDebt(MR),
  MR.incomeStatement.shares,
)
const C6_PEER_PE = ASSUMPTIONS.c6.peerPe * MR.incomeStatement.eps

/** Shares bought under the Unit 11 fixed-fractional rule, always rounded down. */
function positionShares(capital: number, riskPct: number, entry: number, stop: number): number {
  return Math.floor((capital * riskPct) / (entry - stop))
}
const C6_SHARES = positionShares(
  ASSUMPTIONS.c6.capital,
  ASSUMPTIONS.c6.riskPct,
  ASSUMPTIONS.c6.entry,
  ASSUMPTIONS.c6.invalidation,
)

const growthOf = (now: number, before: number): number => now / before - 1

const dcfEv = (
  base: number,
  a: { growth: readonly number[]; terminal: number; discountRate: number },
): number =>
  dcfValue({
    base,
    growthRates: a.growth,
    terminalGrowth: a.terminal,
    discountRate: a.discountRate,
  }).value

/**
 * The recession stress test cases 3 runs on both companies: revenue falls 10%
 * and cost of revenue falls by half that decline in dollars, with operating
 * expenses and interest unchanged. Every intermediate figure is quoted in the
 * content, so every intermediate figure gets a row.
 */
function stressClaims(caseId: string, s: FinStatementSnapshot): Claim[] {
  const revenue = s.incomeStatement.revenue * 0.9
  const cogs = s.incomeStatement.cogs - (s.incomeStatement.revenue - revenue) / 2
  const gross = revenue - cogs
  const operating = gross - s.incomeStatement.opex
  const pretax = operating - s.incomeStatement.interestExpense
  const tag = s.company.split(' ')[0].toLowerCase()
  return [
    claim(caseId, `${tag} stressed revenue`, revenue, moneyM),
    claim(caseId, `${tag} stressed cost of revenue`, cogs, moneyM),
    claim(caseId, `${tag} stressed gross profit`, gross, moneyM),
    claim(caseId, `${tag} stressed operating income`, operating, moneyM),
    // Quoted as "a $338M pretax loss" rather than with a sign, so compare on size.
    claim(caseId, `${tag} stressed pretax result`, Math.abs(pretax), moneyM),
  ]
}

// ─── (1) The answer table ────────────────────────────────────────────────────
// Every quiz item in every case, by id. `value`/`fmt` for the numeric ones;
// `numeric: false` marks a judgement question, which still has to appear here so
// that the coverage assertion below can prove nothing was forgotten.

interface AnswerRow {
  value?: number
  fmt?: (v: number) => string
  numeric?: false
  /** Why the question is a judgement rather than a calculation. */
  note?: string
}

const ANSWERS: Record<string, AnswerRow> = {
  // ── c1 — Harborline Grocers ──
  'c1-q1': { value: grossMargin(H24), fmt: pct },
  'c1-q2': { value: operatingMargin(H24), fmt: pct },
  'c1-q3': { numeric: false, note: 'margin × turnover, judged against the industry' },
  'c1-q4': { value: assetTurnover(H24), fmt: mult2 },
  'c1-q5': { value: returnOnEquity(H24), fmt: pct },
  'c1-q6': { numeric: false, note: 'negative working capital as a model, not a crisis' },
  'c1-q7': { value: daysInventory(H24), fmt: days },
  'c1-q8': {
    value: Math.abs(growthOf(H24.incomeStatement.shares, H23.incomeStatement.shares)),
    fmt: pct,
  },

  // ── c2 — Cobalt Cloud ──
  'c2-q1': { value: grossMargin(C24), fmt: pct },
  'c2-q2': { value: sbcToRevenue(C24), fmt: pct },
  'c2-q3': { numeric: false, note: 'why cash exceeds accounting profit' },
  'c2-q4': { value: fcfMargin(C24), fmt: pct },
  'c2-q5': { value: OWNER_EARNINGS_C, fmt: moneyM },
  'c2-q6': {
    value: growthOf(C24.incomeStatement.shares, C23.incomeStatement.shares),
    fmt: pct,
  },
  'c2-q7': { numeric: false, note: 'reading a rising cash balance next to the share count' },
  'c2-q8': { value: EV_C / C24.incomeStatement.revenue, fmt: mult1 },

  // ── c3 — Skyline Air vs Halden Industrial ──
  'c3-q1': { value: interestCoverage(SKY), fmt: mult2 },
  'c3-q2': { value: interestCoverage(HAL), fmt: mult2 },
  'c3-q3': { value: debtToEquity(SKY), fmt: mult2 },
  'c3-q4': { numeric: false, note: 'why a P/E cannot compare two capital structures' },
  'c3-q5': { value: EV_SKY, fmt: moneyM },
  'c3-q6': { value: EV_SKY / SKY.incomeStatement.operatingIncome, fmt: mult1 },
  'c3-q7': { numeric: false, note: 'the recession stress test; its arithmetic is a CLAIM row' },
  'c3-q8': { value: capexToCfo(SKY), fmt: pct },

  // ── c4 — Brightway Retail ──
  'c4-q1': { value: cashConversion(B24), fmt: mult2 },
  'c4-q2': { value: cashConversion(B23), fmt: mult2 },
  'c4-q3': { numeric: false, note: 'what a conversion collapse means mechanically' },
  'c4-q4': { value: daysInventory(B24), fmt: days },
  'c4-q5': {
    value: growthOf(B24.balanceSheet.inventory, B23.balanceSheet.inventory),
    fmt: pct,
  },
  'c4-q6': { numeric: false, note: 'diagnosis of the working-capital divergence' },
  'c4-q7': { value: tangibleBookValue(B24), fmt: moneyM },
  'c4-q8': { value: interestCoverage(B24), fmt: mult2 },
  'c4-q9': { numeric: false, note: 'which Unit 13 red-flag veto fires' },

  // ── c5 — Silica Micro ──
  'c5-q1': { value: EV_SIL, fmt: moneyM },
  'c5-q2': { value: ASSUMPTIONS.c5.price / SIL.incomeStatement.eps, fmt: mult1 },
  'c5-q3': { value: EV_SIL / SIL.cashFlow.fcf, fmt: mult1 },
  'c5-q4': { value: OWNER_EARNINGS_SIL, fmt: moneyM },
  'c5-q5': { value: EV_SIL / OWNER_EARNINGS_SIL, fmt: mult1 },
  'c5-q6': { numeric: false, note: 'why two identical DCFs disagree by 2×' },
  'c5-q7': {
    value: impliedConstantGrowth({
      target: EV_SIL,
      base: SIL.cashFlow.fcf,
      years: ASSUMPTIONS.c5.growth.length,
      terminalGrowth: ASSUMPTIONS.c5.terminal,
      discountRate: ASSUMPTIONS.c5.discountRate,
    }),
    fmt: pct,
  },
  'c5-q8': { numeric: false, note: 'the margin-of-safety decision' },

  // ── c6 — Maison Rivelle ──
  'c6-q1': { value: operatingMargin(MR), fmt: pct },
  'c6-q2': { value: returnOnEquity(MR), fmt: pct },
  'c6-q3': { value: roic(MR, ASSUMPTIONS.c6.taxRate), fmt: pct },
  'c6-q4': { value: daysInventory(MR), fmt: days },
  'c6-q5': { numeric: false, note: 'is 320 days of stock a fail or a feature' },
  'c6-q6': { value: EV_MR / OWNER_EARNINGS_MR, fmt: mult1 },
  'c6-q7': { numeric: false, note: 'the verdict at a 4.7% discount' },
  'c6-q8': { value: C6_SHARES, fmt: plain },
}

// ─── (2) The prose-claim table ───────────────────────────────────────────────
// Statement-derived figures quoted anywhere in a case's text. Each is recomputed
// and must appear verbatim somewhere in that case.

interface Claim {
  caseId: string
  what: string
  value: number
  fmt: (v: number) => string
}

const claim = (caseId: string, what: string, value: number, fmt: (v: number) => string): Claim => ({
  caseId,
  what,
  value,
  fmt,
})

const CLAIMS: Claim[] = [
  // ── c1 ──
  claim('c1', 'FY2023 gross margin', grossMargin(H23), pct),
  claim('c1', 'FY2023 operating margin', operatingMargin(H23), pct),
  claim('c1', 'net margin', netMargin(H24), pct),
  claim('c1', 'return on assets', returnOnAssets(H24), pct),
  claim('c1', 'FY2023 return on equity', returnOnEquity(H23), pct),
  claim('c1', 'equity multiplier', equityMultiplier(H24), mult2),
  claim('c1', 'inventory turnover', inventoryTurnover(H24), mult1),
  claim('c1', 'FY2023 days inventory', daysInventory(H23), days),
  claim('c1', 'days sales outstanding', daysSalesOutstanding(H24), days),
  claim('c1', 'current ratio', currentRatio(H24), mult2),
  claim('c1', 'interest coverage', interestCoverage(H24), mult1),
  claim('c1', 'cash conversion', cashConversion(H24), mult2),
  claim('c1', 'revenue growth', growthOf(H24.incomeStatement.revenue, H23.incomeStatement.revenue), pct),
  claim('c1', 'net income growth', growthOf(H24.incomeStatement.netIncome, H23.incomeStatement.netIncome), pct),
  claim('c1', 'roic', roic(H24, ASSUMPTIONS.c1.taxRate), pct),
  claim('c1', 'net debt / operating income', netDebt(H24) / H24.incomeStatement.operatingIncome, mult2),
  claim('c1', 'P/E', ASSUMPTIONS.c1.price / H24.incomeStatement.eps, mult1),
  claim('c1', 'EV / operating income', EV_H / H24.incomeStatement.operatingIncome, mult1),
  claim('c1', 'free cash flow yield', H24.cashFlow.fcf / marketCap(H24, ASSUMPTIONS.c1.price), pct),
  claim('c1', 'DCF value per share', C1_DCF, perShare),
  claim('c1', 'peer value per share', C1_PEER, perShare),
  claim('c1', 'central estimate', C1_CENTRAL, perShare),
  claim('c1', 'discount to central estimate', (C1_CENTRAL - ASSUMPTIONS.c1.price) / C1_CENTRAL, pct),
  claim('c1', 'buy-below price', C1_CENTRAL * 0.75, perShare),
  claim(
    'c1',
    'implied five-year growth',
    Math.abs(
      impliedConstantGrowth({
        target: EV_H,
        base: H24.cashFlow.fcf,
        years: ASSUMPTIONS.c1.growth.length,
        terminalGrowth: ASSUMPTIONS.c1.terminal,
        discountRate: ASSUMPTIONS.c1.discountRate,
      }),
    ),
    pct,
  ),

  // ── c2 ──
  claim('c2', 'FY2023 gross margin', grossMargin(C23), pct),
  claim('c2', 'FY2023 operating margin', operatingMargin(C23), pct),
  claim('c2', 'operating margin', operatingMargin(C24), pct),
  claim('c2', 'net margin', netMargin(C24), pct),
  claim('c2', 'return on equity', returnOnEquity(C24), pct),
  claim('c2', 'FY2023 sbc intensity', sbcToRevenue(C23), pct),
  claim('c2', 'FY2023 fcf margin', fcfMargin(C23), pct),
  claim('c2', 'owner fcf margin', OWNER_EARNINGS_C / C24.incomeStatement.revenue, pct),
  claim('c2', 'revenue growth', growthOf(C24.incomeStatement.revenue, C23.incomeStatement.revenue), pct),
  claim('c2', 'current ratio', currentRatio(C24), mult2),
  claim('c2', 'days sales outstanding', daysSalesOutstanding(C24), days),
  claim('c2', 'FY2023 days sales outstanding', daysSalesOutstanding(C23), days),

  // ── c3 ──
  claim('c3', 'skyline gross margin', grossMargin(SKY), pct),
  claim('c3', 'halden gross margin', grossMargin(HAL), pct),
  claim('c3', 'skyline operating margin', operatingMargin(SKY), pct),
  claim('c3', 'halden debt to equity', debtToEquity(HAL), mult2),
  claim('c3', 'skyline equity multiplier', equityMultiplier(SKY), mult2),
  claim('c3', 'skyline return on equity', returnOnEquity(SKY), pct),
  claim('c3', 'skyline current ratio', currentRatio(SKY), mult2),
  claim('c3', 'skyline cash conversion', cashConversion(SKY), mult2),
  claim('c3', 'skyline days sales outstanding', daysSalesOutstanding(SKY), days),
  claim('c3', 'skyline days inventory', daysInventory(SKY), days),
  claim('c3', 'skyline capex to revenue', SKY.cashFlow.capex / SKY.incomeStatement.revenue, pct),
  claim('c3', 'skyline fcf share of cfo', SKY.cashFlow.fcf / SKY.cashFlow.cfo, pct),
  claim('c3', 'halden capex to cfo', capexToCfo(HAL), pct),
  claim('c3', 'skyline roic', roic(SKY, ASSUMPTIONS.c3.taxRate), pct),
  claim('c3', 'halden roic', roic(HAL, ASSUMPTIONS.c3.taxRate), pct),
  claim('c3', 'skyline net debt / operating income', netDebt(SKY) / SKY.incomeStatement.operatingIncome, mult2),
  claim('c3', 'skyline P/E', ASSUMPTIONS.c3.price / SKY.incomeStatement.eps, mult1),
  claim('c3', 'halden P/E', ASSUMPTIONS.c3.haldenPrice / HAL.incomeStatement.eps, mult1),
  claim('c3', 'halden EV / operating income', EV_HAL / HAL.incomeStatement.operatingIncome, mult1),
  claim('c3', 'equity share of enterprise value', marketCap(SKY, ASSUMPTIONS.c3.price) / EV_SKY, (v) => `${Math.round(v * 100)}%`),

  // ── c4 ──
  claim('c4', 'FY2023 gross margin', grossMargin(B23), pct),
  claim('c4', 'gross margin', grossMargin(B24), pct),
  claim('c4', 'FY2023 operating margin', operatingMargin(B23), pct),
  claim('c4', 'operating margin', operatingMargin(B24), pct),
  claim('c4', 'return on equity', returnOnEquity(B24), pct),
  claim('c4', 'equity multiplier', equityMultiplier(B24), mult2),
  claim('c4', 'current ratio', currentRatio(B24), mult2),
  claim('c4', 'quick ratio', quickRatio(B24), mult2),
  claim('c4', 'goodwill share of assets', goodwillToAssets(B24), pct),
  claim('c4', 'FY2023 days inventory', daysInventory(B23), days),
  claim('c4', 'inventory turnover', inventoryTurnover(B24), mult2),
  claim('c4', 'days sales outstanding', daysSalesOutstanding(B24), days),
  claim('c4', 'FY2023 days sales outstanding', daysSalesOutstanding(B23), days),
  claim('c4', 'FY2023 interest coverage', interestCoverage(B23), mult2),
  claim('c4', 'FY2023 tangible book', tangibleBookValue(B23), moneyM),
  claim('c4', 'revenue growth', growthOf(B24.incomeStatement.revenue, B23.incomeStatement.revenue), pct),
  claim('c4', 'receivables growth', growthOf(B24.balanceSheet.receivables, B23.balanceSheet.receivables), pct),
  claim('c4', 'net income decline', Math.abs(growthOf(B24.incomeStatement.netIncome, B23.incomeStatement.netIncome)), pct),
  claim('c4', 'cfo decline', Math.abs(growthOf(B24.cashFlow.cfo, B23.cashFlow.cfo)), pct),
  claim('c4', 'roic', roic(B24, ASSUMPTIONS.c4.taxRate), pct),
  claim('c4', 'net debt / operating income', netDebt(B24) / B24.incomeStatement.operatingIncome, mult2),

  // ── c5 ──
  claim('c5', 'gross margin', grossMargin(SIL), pct),
  claim('c5', 'operating margin', operatingMargin(SIL), pct),
  claim('c5', 'net margin', netMargin(SIL), pct),
  claim('c5', 'return on equity', returnOnEquity(SIL), pct),
  claim('c5', 'equity multiplier', equityMultiplier(SIL), mult2),
  claim('c5', 'interest coverage', interestCoverage(SIL), mult1),
  claim('c5', 'cash conversion', cashConversion(SIL), mult2),
  claim('c5', 'days inventory', daysInventory(SIL), days),
  claim('c5', 'sbc intensity', sbcToRevenue(SIL), pct),
  claim('c5', 'book value per share', bookValuePerShare(SIL), perShare),
  claim('c5', 'roic', roic(SIL, ASSUMPTIONS.c5.taxRate), pct),
  claim('c5', 'market cap', marketCap(SIL, ASSUMPTIONS.c5.price), moneyM),
  claim('c5', 'DCF on free cash flow', C5_DCF_FCF, perShare),
  claim('c5', 'DCF on owner earnings', C5_DCF_OE, perShare),
  claim('c5', 'peer value per share', C5_PEER, perShare),
  claim('c5', 'premium to the DCF', (ASSUMPTIONS.c5.price - C5_DCF_FCF) / C5_DCF_FCF, pct),
  claim('c5', 'buy-below price', C5_DCF_FCF * 0.75, perShare),
  claim('c5', 'spread between the two agreeing methods', (C5_DCF_FCF - C5_PEER) / C5_PEER, pct),
  claim(
    'c5',
    'implied growth on owner earnings',
    impliedConstantGrowth({
      target: EV_SIL,
      base: OWNER_EARNINGS_SIL,
      years: ASSUMPTIONS.c5.growth.length,
      terminalGrowth: ASSUMPTIONS.c5.terminal,
      discountRate: ASSUMPTIONS.c5.discountRate,
    }),
    pct,
  ),

  // ── c6 ──
  claim('c6', 'gross margin', grossMargin(MR), pct),
  claim('c6', 'net margin', netMargin(MR), pct),
  claim('c6', 'return on assets', returnOnAssets(MR), pct),
  claim('c6', 'asset turnover', assetTurnover(MR), mult2),
  claim('c6', 'equity multiplier', equityMultiplier(MR), mult2),
  claim('c6', 'current ratio', currentRatio(MR), mult2),
  claim('c6', 'interest coverage', interestCoverage(MR), mult1),
  claim('c6', 'cash conversion', cashConversion(MR), mult2),
  claim('c6', 'days sales outstanding', daysSalesOutstanding(MR), days),
  claim('c6', 'inventory turnover', inventoryTurnover(MR), mult2),
  claim('c6', 'sbc intensity', sbcToRevenue(MR), pct),
  claim('c6', 'EV / free cash flow', EV_MR / MR.cashFlow.fcf, mult1),
  claim('c6', 'P/E', ASSUMPTIONS.c6.price / MR.incomeStatement.eps, mult1),
  claim('c6', 'EV / operating income', EV_MR / MR.incomeStatement.operatingIncome, mult1),
  claim('c6', 'DCF value per share', C6_DCF, perShare),
  claim('c6', 'peer EV/EBIT value', C6_PEER_EBIT, perShare),
  claim('c6', 'peer P/E value', C6_PEER_PE, perShare),
  claim('c6', 'discount to the DCF', (C6_DCF - ASSUMPTIONS.c6.price) / C6_DCF, pct),
  claim('c6', 'buy-below price', C6_DCF * 0.75, perShare),
  claim(
    'c6',
    'implied growth',
    impliedConstantGrowth({
      target: EV_MR,
      base: OWNER_EARNINGS_MR,
      years: ASSUMPTIONS.c6.growth.length,
      terminalGrowth: ASSUMPTIONS.c6.terminal,
      discountRate: ASSUMPTIONS.c6.discountRate,
    }),
    pct,
  ),
  claim('c6', 'position weight', (C6_SHARES * ASSUMPTIONS.c6.entry) / ASSUMPTIONS.c6.capital, pct),
  claim(
    'c6',
    'realised risk',
    (C6_SHARES * (ASSUMPTIONS.c6.entry - ASSUMPTIONS.c6.invalidation)) / ASSUMPTIONS.c6.capital,
    // Two places: the whole point of the rounding-down rule is that it lands
    // just under the 1% limit rather than on it.
    (v) => `${fixed(v * 100, 2)}%`,
  ),

  // ── derived $M figures quoted in the prose, case by case ──
  claim('c1', 'net debt', netDebt(H24), moneyM),
  claim('c1', 'market cap', marketCap(H24, ASSUMPTIONS.c1.price), moneyM),
  claim('c1', 'invested capital', investedCapital(H24), moneyM),
  claim('c1', 'NOPAT', H24.incomeStatement.operatingIncome * (1 - ASSUMPTIONS.c1.taxRate), moneyM),
  claim('c1', 'enterprise value', EV_H, moneyM),
  claim('c1', 'sbc intensity', sbcToRevenue(H24), pct),

  claim('c2', 'net cash', -netDebt(C24), moneyM),
  claim('c2', 'market cap', marketCap(C24, ASSUMPTIONS.c2.price), moneyM),
  claim('c2', 'enterprise value', EV_C, moneyM),
  claim('c2', 'cash increase', C24.balanceSheet.cash - C23.balanceSheet.cash, moneyM),
  claim('c2', 'loss-to-cash gap', C24.cashFlow.cfo - C24.incomeStatement.netIncome, moneyM),
  claim('c2', 'distractor: fcf + sbc', C24.cashFlow.fcf + C24.cashFlow.sbc, moneyM),
  claim('c2', 'distractor: cfo − sbc', C24.cashFlow.cfo - C24.cashFlow.sbc, moneyM),

  claim('c3', 'skyline market cap', marketCap(SKY, ASSUMPTIONS.c3.price), moneyM),
  claim('c3', 'halden market cap', marketCap(HAL, ASSUMPTIONS.c3.haldenPrice), moneyM),
  claim('c3', 'halden enterprise value', EV_HAL, moneyM),
  claim('c3', 'skyline net debt', netDebt(SKY), moneyM),
  claim('c3', 'halden net debt', netDebt(HAL), moneyM),
  claim('c3', 'skyline invested capital', investedCapital(SKY), moneyM),
  claim('c3', 'skyline NOPAT', SKY.incomeStatement.operatingIncome * (1 - ASSUMPTIONS.c3.taxRate), moneyM),
  claim(
    'c3',
    'distractor: market cap plus gross debt',
    marketCap(SKY, ASSUMPTIONS.c3.price) + SKY.balanceSheet.longTermDebt,
    moneyM,
  ),
  ...stressClaims('c3', SKY),
  ...stressClaims('c3', HAL),

  claim('c4', 'distractor: equity plus goodwill', B24.balanceSheet.equity + B24.balanceSheet.goodwill, moneyM),
  claim('c4', 'net debt', netDebt(B24), moneyM),
  claim('c4', 'invested capital', investedCapital(B24), moneyM),
  claim('c4', 'NOPAT', B24.incomeStatement.operatingIncome * (1 - ASSUMPTIONS.c4.taxRate), moneyRounded),
  claim('c4', 'inventory build', B24.balanceSheet.inventory - B23.balanceSheet.inventory, moneyM),
  claim('c4', 'receivable build', B24.balanceSheet.receivables - B23.balanceSheet.receivables, moneyM),
  claim(
    'c4',
    'working capital absorbed',
    B24.balanceSheet.inventory - B23.balanceSheet.inventory + B24.balanceSheet.receivables - B23.balanceSheet.receivables,
    moneyM,
  ),
  claim('c4', 'profit that never arrived as cash', B24.incomeStatement.netIncome - B24.cashFlow.cfo, moneyM),

  claim('c5', 'net cash', -netDebt(SIL), moneyM),
  claim('c5', 'invested capital', investedCapital(SIL), moneyM),
  claim('c5', 'NOPAT', SIL.incomeStatement.operatingIncome * (1 - ASSUMPTIONS.c5.taxRate), moneyM),
  claim('c5', 'distractor: cfo − sbc', SIL.cashFlow.cfo - SIL.cashFlow.sbc, moneyM),
  claim(
    'c5',
    'distractor: market cap plus gross debt',
    marketCap(SIL, ASSUMPTIONS.c5.price) + SIL.balanceSheet.longTermDebt,
    moneyM,
  ),
  claim('c5', 'peer enterprise value', ASSUMPTIONS.c5.peerEvFcf * SIL.cashFlow.fcf, moneyM),
  claim('c5', 'DCF enterprise value on fcf', dcfEv(SIL.cashFlow.fcf, ASSUMPTIONS.c5), moneyRounded),
  claim(
    'c5',
    'DCF equity value on fcf',
    dcfEv(SIL.cashFlow.fcf, ASSUMPTIONS.c5) - netDebt(SIL),
    moneyRounded,
  ),
  claim('c5', 'DCF enterprise value on owner earnings', dcfEv(OWNER_EARNINGS_SIL, ASSUMPTIONS.c5), moneyRounded),
  claim(
    'c5',
    'DCF equity value on owner earnings',
    dcfEv(OWNER_EARNINGS_SIL, ASSUMPTIONS.c5) - netDebt(SIL),
    moneyRounded,
  ),

  claim('c6', 'owner earnings', OWNER_EARNINGS_MR, moneyM),
  claim('c6', 'NOPAT', MR.incomeStatement.operatingIncome * (1 - ASSUMPTIONS.c6.taxRate), moneyM),
  claim('c6', 'net cash', -netDebt(MR), moneyM),
  claim('c6', 'invested capital', investedCapital(MR), moneyM),
  claim('c6', 'market cap', marketCap(MR, ASSUMPTIONS.c6.price), moneyM),
  claim('c6', 'enterprise value', EV_MR, moneyM),
]

// ─── (3) The scan ────────────────────────────────────────────────────────────
// Every decorated number in a case must be accounted for. What is NOT derived
// from a statement is listed here, with what it is.

const ASSUMPTION_TOKENS: Record<string, readonly string[]> = {
  c1: [
    '11×', // the peer EV/operating-income multiple
    '3%', // years 3–5 of the DCF growth path, written '4/4/3/3/3%'
    '7.0%', // discount rate / WACC assumption
    '2.0%', // terminal growth
    '4.0%', // year-1/2 of the DCF growth path
    '3.0%', // years 3–5 of the growth path (also the operating margin, verified)
    '25%', // the strategy document's margin-of-safety requirement
    '+4.0 pts', // the ROIC-WACC spread, stated as points
    '3.03×', // equity multiplier repeated in the DuPont line (verified)
    '8.64×', // distractor: revenue ÷ equity
    '0.35×', // distractor: assets ÷ revenue
    '75.0%', // distractor: COGS ÷ revenue
    '22.0%', // distractor: opex ÷ revenue
    '2.5%', // distractor: pretax margin
    '5.3%', // distractor: return on assets (verified as a claim)
    '26.9 days', // distractor: revenue-based inventory days
    '10.2 days', // distractor: the turnover mislabelled as days
    '4.1 days', // distractor: DSO (verified as a claim)
    '15.9%', // distractor: prior-year ROE (verified as a claim)
    '8.0%', // distractor: 8m shares read as 8 per cent
    '24%', // gross-margin trigger in "what would change the answer"
    '45', // inventory-days trigger
    '13%', // magnitude of the DCF/peer spread
    '2.5×', // the leverage ratio a depreciation line would plausibly reach
  ],
  c2: [
    '2.9%', // the grocer's buyback, quoted from case 1
    '25.0%', // distractor: COGS ÷ revenue
    '273.1%', // distractor: sbc ÷ CFO
    '14.1%', // distractor: sbc ÷ total assets
    '198.0%', // distractor: sbc ÷ net loss
    '8.1%', // distractor: CFO ÷ revenue
    '3.3×', // distractor: market cap ÷ revenue
    '4.0×', // distractor: net cash added instead of subtracted
    '0.4×', // distractor: the sales multiple inverted
    '18.0%', // distractor: 18m shares read as 18 per cent
    '7.2%', // the same dilution seen from the owner's side
    '19%', // net cash as a share of market value
    '15%', // watchlist trigger: sbc intensity
    '3%', // watchlist trigger: annual dilution
    '70%', // downside trigger: gross margin floor
    '20%', // downside trigger: revenue growth floor
    '90', // downside trigger: receivable days
    '0.2%', // the grocer's sbc intensity, quoted from case 1
    '12.5%', // return on equity (verified as a claim)
  ],
  c3: [
    '$170M', // one fifth of $852M of operating income, quoted to the nearest ten
    '$2,000M', // distractor: an invented market-capitalisation floor for the P/E
    '$562M', // distractor: the stress test with costs falling in full proportion
    '11×', // Halden's P/E, in the blurb
    '6×', // Skyline's P/E, in the blurb
    '4×', // the checklist's interest-coverage threshold
    '2×', // the coverage level below which renegotiation looms
    '4.73×', // distractor: gross profit ÷ interest (Skyline)
    '0.58×', // distractor: net income ÷ interest (Skyline)
    '0.56×', // distractor: coverage inverted (Skyline)
    '3.75×', // distractor: net income ÷ interest (Halden)
    '16.00×', // distractor: gross profit ÷ interest (Halden)
    '0.17×', // distractor: coverage inverted (Halden)
    '2.12×', // long-term-debt-only gearing, named as the narrower definition
    '4.42×', // the equity multiplier (verified as a claim)
    '0.77×', // distractor: debt ÷ assets
    '30.0×', // distractor: EV ÷ net income
    '2.0×', // distractor: market cap ÷ operating income
    '6.0×', // Skyline's P/E (verified as a claim)
    '13.0%', // capex ÷ revenue (verified as a claim)
    '107.0%', // distractor: CFO ÷ capex
    '6.6%', // free cash flow as a share of CFO (verified as a claim)
    '10%', // the size of the modelled revenue decline
    '9.0%', // Skyline's assumed cost of capital
    '12%', // how much dearer Skyline is on EV/EBIT
    '28%', // how much Halden's enterprise value exceeds its market cap
    '50%', // the equity move implied by a 10% move in enterprise value
    '20%', // the equity's share of enterprise value (verified as a claim)
    '3.2 pts', // the negative ROIC-WACC spread
    '17%', // reserved: not used
    '46%', // the pretax swing from a 20% move in operating income
    '3×', // the net-debt-to-operating-income level that would change the view
    '60%', // the capex-to-operating-cash level that would change the view
    '32.0%', // Halden's gross margin (verified as a claim)
  ],
  c4: [
    '3 days', // the DSO increase, 9.3 → 12.4, in the trend table
    '31 days', // the inventory-days increase, 141.7 → 172.9
    '4.55×', // distractor: net income ÷ CFO
    '1.18×', // distractor: free cash flow ÷ net income
    '0.90×', // distractor: FY2023 conversion inverted
    '0.26×', // distractor: FY2023 free cash flow ÷ net income
    '108.9 days', // distractor: revenue-based inventory days
    '23.2%', // distractor: inventory growth inverted
    '0.20×', // distractor: net income ÷ interest
    '4.63×', // distractor: gross profit ÷ interest
    '9.0%', // assumed cost of capital
    '2.8 points', // the ROIC-WACC spread, stated as points
    '+3', // the checklist's required spread
    '4×', // the checklist's interest-coverage threshold
    '1.0×', // the checklist's cash-conversion threshold, and the coverage floor
    '40%', // the markdown a clearance sale would take
    '172.9 days', // repeated in the c6 comparison and here (verified as an answer)
    '35.9 days', // the grocer's inventory days, quoted from case 1
    '6.11×', // the equity multiplier (verified as a claim)
  ],
  c5: [
    '$1,000M', // the free-cash-flow level that would change the verdict
    '18×', // the peer EV/free-cash-flow multiple
    '9.0%', // discount rate and cost-of-capital assumption
    '2.5%', // terminal growth
    '8%', '7%', '6%', '5%', '4%', // the explicit growth path
    '4.0%', // distractor: the last year of that path
    '+7.8 point', // the ROIC-WACC spread, stated as points
    '1.56×', // equity multiplier (verified as a claim)
    '2.2×', // distractor: price ÷ book value per share
    '14.6×', // distractor: EV ÷ net income
    '22.7×', // distractor: price ÷ free cash flow per share
    '8.5×', // distractor: EV ÷ CFO
    '11.3×', // distractor: EV ÷ operating income
    '10.7×', // distractor: EV ÷ (CFO − sbc)
    '30.5%', // implied growth on owner earnings (verified as a claim)
    '1.7%', // the size of the net-cash adjustment to enterprise value
    '25%', // the margin-of-safety requirement
    '75%', // the terminal value's share of the DCF
    '2.2%', // the gap between the two agreeing methods (verified as a claim)
    '5%', // reserved: not used
    '38.3', '16.3', '22.0%', '47.7×', '22.3×', // figures quoted back from cases 2 and 5
  ],
  c6: [
    '172.9 days', // Brightway's inventory days, quoted from case 4
    '35.9 days', // Harborline's inventory days, quoted from case 1
    '380 days', // the inventory-days trigger in 'what would change my mind'
    '2%', // distractor: a 2% per-idea risk rule, which is not the one written down
    '8.0%', // cost of capital used in the checklist comparison
    '8.5%', // DCF discount rate
    '2.5%', // terminal growth
    '8%', '7%', '6%', '5%', '4%', // the explicit growth path
    '19%', // the luxury peer median operating margin
    '+29.2 point', // the ROIC-WACC spread, stated as points
    '42.0%', // distractor: opex ÷ revenue
    '31.9%', // distractor: net income ÷ tangible book value
    '18.4%', // return on assets (verified as a claim)
    '23.6%', // distractor: cash left inside invested capital
    '48.9%', // distractor: pre-tax operating income ÷ invested capital
    '96.2 days', // distractor: revenue-based inventory days
    '137.5 days', // distractor: gross-profit-based inventory days
    '18.1×', // the unadjusted free cash flow multiple (verified as a claim)
    '25%', // the margin-of-safety requirement
    '1%', // the per-idea risk limit
    '0.98%', // the realised risk (verified as a claim)
    '20%', // the single-position ceiling
    '4.7%', // the discount to value (verified as a claim)
    '5%', // how close the three methods land
    '66%', // gross-margin trigger
    '380', // inventory-days trigger
    '12×', // acquisition-multiple trigger, and the peer EV/EBIT multiple
    '18×', // the peer P/E multiple
    '3.03×', '4.42×', '1.42×', // equity multipliers quoted across cases
    '70.0%', '28.0%', '172.9', '35.9', '38.3', '16.3', '22.3×', '47.7×', '0.9%', '1.15×',
    '320.8', '1.14×', '0.22×', '40.0%', '26.1%', '20.9%', '0.88×', '29.9', '37.2%', '56.0×',
    '2.96×',
  ],
}

/** Every scrap of authored text in one case. */
function caseText(study: CaseStudy): string {
  const parts = [study.intro, study.blurb, study.title, study.verdict.md]
  for (const step of study.steps) {
    if (step.kind === 'read') parts.push(step.md)
    else if (step.kind === 'thesis') parts.push(...step.prompts)
    else parts.push(step.item.prompt, ...step.item.choices, step.item.explain)
  }
  return parts.join('\n\n')
}

/**
 * Percentages, multiples, day counts and $M figures, as written.
 *
 * `×` must be glued to its number (`2.85×`), which is how a multiple is written
 * throughout — a spaced `50,000 × 1%` is a multiplication in prose and is not a
 * figure to verify. Spread figures quoted in "points" are left to CLAIMS rows,
 * because the content writes them as points, pts and point interchangeably.
 */
const TOKEN_RE = /(\d[\d,]*(?:\.\d+)?)(%|×)|(\d[\d,]*(?:\.\d+)?)\s(days)|\$(\d[\d,]*(?:\.\d+)?)M/g

function scanTokens(text: string): string[] {
  const out: string[] = []
  for (const m of text.matchAll(TOKEN_RE)) {
    if (m[5] !== undefined) out.push(`$${m[5]}M`)
    else if (m[3] !== undefined) out.push(`${m[3]} ${m[4]}`)
    else out.push(`${m[1]}${m[2]}`)
  }
  return out
}

/** The raw line items of every statement a case shows, as `$N,NNNM` strings. */
function rawFigureTokens(study: CaseStudy): Set<string> {
  const set = new Set<string>()
  for (const id of caseStatementIds(study)) {
    const s = snap(id)
    const numbers = [
      ...Object.values(s.incomeStatement),
      ...Object.values(s.balanceSheet),
      ...Object.values(s.cashFlow),
    ]
    for (const n of numbers) set.add(moneyM(n).replace('−', ''))
  }
  return set
}

// ═══ Structure ═══════════════════════════════════════════════════════════════

describe('the case set', () => {
  it('ships six cases in unlock order with unique ids', () => {
    expect(CASES).toHaveLength(6)
    expect(CASE_ORDER).toEqual(['c1', 'c2', 'c3', 'c4', 'c5', 'c6'])
    expect(new Set(CASE_ORDER).size).toBe(6)
    for (const c of CASES) expect(caseById(c.id)).toBe(c)
    expect(caseNumber('c4')).toBe(4)
  })

  it.each(CASES.map((c) => [c.id, c] as const))('%s is shaped like a case', (_id, study) => {
    expect(study.title.length).toBeGreaterThan(0)
    expect(study.blurb.length).toBeGreaterThan(0)
    expect(study.intro.length).toBeGreaterThan(80)
    expect(study.verdict.md.length).toBeGreaterThan(80)
    expect(study.verdict.checklistScore).toBeGreaterThanOrEqual(0)
    expect(study.verdict.checklistScore).toBeLessThanOrEqual(10)

    // 8–12 steps, opening on a read and closing on the model analysis.
    expect(study.steps.length).toBeGreaterThanOrEqual(8)
    expect(study.steps.length).toBeLessThanOrEqual(12)
    expect(study.steps[0].kind).toBe('read')
    expect(study.steps[study.steps.length - 1].kind).toBe('read')

    // Exactly one written thesis, and it sits before the model analysis.
    expect(caseThesisCount(study)).toBe(1)
    const thesisIdx = study.steps.findIndex((s) => s.kind === 'thesis')
    expect(thesisIdx).toBe(study.steps.length - 2)

    expect(caseItems(study).length).toBeGreaterThanOrEqual(6)
  })

  it.each(CASES.map((c) => [c.id, c] as const))('%s references real statements', (_id, study) => {
    if (typeof study.company === 'string') expect(BY_ID.has(study.company)).toBe(true)
    for (const step of study.steps) {
      if (step.kind === 'thesis') {
        expect(step.prompts.length).toBeGreaterThanOrEqual(2)
        continue
      }
      // StatementTable renders at most two companies at 390px.
      expect(step.statementIds.length).toBeGreaterThanOrEqual(1)
      expect(step.statementIds.length).toBeLessThanOrEqual(2)
      for (const id of step.statementIds) {
        expect(BY_ID.has(id), `${id} is not in companies.json`).toBe(true)
      }
      if (step.kind === 'calc') expect(step.formulaHint.length).toBeGreaterThan(10)
    }
  })

  it('gives every quiz item a unique id, four distinct choices and a real answer', () => {
    const seen = new Set<string>()
    const items: QuizItem[] = CASES.flatMap((c) => caseItems(c))
    expect(items.length).toBeGreaterThanOrEqual(45)
    for (const item of items) {
      expect(seen.has(item.id), `duplicate item id ${item.id}`).toBe(false)
      seen.add(item.id)
      expect(item.choices).toHaveLength(4)
      expect(new Set(item.choices).size, `${item.id} repeats a choice`).toBe(4)
      expect(item.answerIdx).toBeGreaterThanOrEqual(0)
      expect(item.answerIdx).toBeLessThanOrEqual(3)
      expect(item.prompt.length).toBeGreaterThan(10)
      // The explain is the teaching, not a rubber stamp.
      expect(item.explain.length).toBeGreaterThan(120)
    }
  })

  it('spreads the correct answer across all four positions', () => {
    const counts = [0, 0, 0, 0]
    for (const item of CASES.flatMap((c) => caseItems(c))) counts[item.answerIdx] += 1
    for (const n of counts) expect(n).toBeGreaterThan(0)
  })
})

// ═══ The new statements ══════════════════════════════════════════════════════

describe('the prior-year snapshots the cases add', () => {
  it.each(NEW_COMPANIES)('%s satisfies every accounting identity', (id) => {
    expect(statementIssues(snap(id))).toEqual([])
  })

  it('pairs each with its FY2024 self', () => {
    for (const id of NEW_COMPANIES) {
      const prior = snap(id)
      const current = snap(id.replace('-fy2023', ''))
      expect(prior.company).toBe(current.company)
      expect(prior.sector).toBe(current.sector)
      expect(prior.period).toBe('FY2023')
      expect(current.period).toBe('FY2024')
    }
  })

  it('embeds the trends each case is built to teach', () => {
    // c1 — a compounder: stable margins, falling share count.
    expect(grossMargin(H23)).toBeCloseTo(grossMargin(H24), 10)
    expect(H24.incomeStatement.shares).toBeLessThan(H23.incomeStatement.shares)
    expect(H24.incomeStatement.eps).toBeGreaterThan(H23.incomeStatement.eps)

    // c2 — dilution funding growth: heavy, steady stock comp and more shares.
    expect(sbcToRevenue(C23)).toBeCloseTo(sbcToRevenue(C24), 10)
    expect(sbcToRevenue(C24)).toBeGreaterThan(0.2)
    expect(C24.incomeStatement.shares).toBeGreaterThan(C23.incomeStatement.shares)

    // c4 — the earnings-quality collapse.
    expect(cashConversion(B23)).toBeGreaterThan(1)
    expect(cashConversion(B24)).toBeLessThan(0.3)
    expect(daysInventory(B24)).toBeGreaterThan(daysInventory(B23) + 25)
    expect(growthOf(B24.balanceSheet.receivables, B23.balanceSheet.receivables)).toBeGreaterThan(
      growthOf(B24.incomeStatement.revenue, B23.incomeStatement.revenue) * 5,
    )
  })
})

// ═══ (1) Answers ═════════════════════════════════════════════════════════════

describe('every quiz answer is the number the statements produce', () => {
  it('has a table row for every item, and no rows left over', () => {
    const ids = CASES.flatMap((c) => caseItems(c)).map((i) => i.id)
    expect([...ids].sort()).toEqual(Object.keys(ANSWERS).sort())
  })

  const numericItems = CASES.flatMap((c) => caseItems(c)).filter(
    (i) => ANSWERS[i.id]?.numeric !== false,
  )

  it.each(numericItems.map((i) => [i.id, i] as const))(
    '%s: the keyed choice carries the recomputed figure and no other choice does',
    (id, item) => {
      const row = ANSWERS[id]
      const printed = row.fmt!(row.value!)
      expect(
        containsToken(item.choices[item.answerIdx], printed),
        `${id}: expected "${printed}" in the keyed choice "${item.choices[item.answerIdx]}"`,
      ).toBe(true)
      item.choices.forEach((choice, i) => {
        if (i === item.answerIdx) return
        expect(
          containsToken(choice, printed),
          `${id}: distractor ${i} also carries "${printed}"`,
        ).toBe(false)
      })
      // The worked solution has to show the answer it is explaining.
      expect(containsToken(item.explain, printed), `${id}: explain omits "${printed}"`).toBe(true)
    },
  )
})

// ═══ (2) Prose claims ════════════════════════════════════════════════════════

describe('every figure quoted in the prose is recomputed from the statements', () => {
  const texts = new Map(CASES.map((c) => [c.id, caseText(c)]))

  it.each(CLAIMS.map((c) => [`${c.caseId} ${c.what}`, c] as const))('%s', (_label, c) => {
    const printed = c.fmt(c.value)
    expect(
      containsToken(texts.get(c.caseId) ?? '', printed),
      `${c.caseId}: "${printed}" (${c.what}) does not appear in the case`,
    ).toBe(true)
  })

  it('claims at least six recomputed figures per case', () => {
    for (const id of CASE_ORDER) {
      expect(CLAIMS.filter((c) => c.caseId === id).length).toBeGreaterThanOrEqual(6)
    }
  })
})

// ═══ (3) The scan ════════════════════════════════════════════════════════════

describe('no unexplained number survives in the case content', () => {
  it.each(CASES.map((c) => [c.id, c] as const))('%s', (id, study) => {
    const accounted = new Set<string>()
    const account = (token: string): void => {
      accounted.add(token)
      accounted.add(unsigned(token))
    }
    for (const t of ASSUMPTION_TOKENS[id] ?? []) account(t)
    for (const [itemId, row] of Object.entries(ANSWERS)) {
      if (!itemId.startsWith(`${id}-`) || row.numeric === false) continue
      account(row.fmt!(row.value!))
    }
    for (const c of CLAIMS) {
      if (c.caseId === id) account(c.fmt(c.value))
    }
    const raw = rawFigureTokens(study)

    const unexplained = new Set<string>()
    for (const token of scanTokens(caseText(study))) {
      if (accounted.has(token) || raw.has(token)) continue
      unexplained.add(token)
    }
    expect([...unexplained].sort()).toEqual([])
  })
})

// ═══ Progress reducers ═══════════════════════════════════════════════════════

describe('unlocking', () => {
  const empty = emptyCasesState()

  it('opens only the first case to a new learner', () => {
    expect(isCaseUnlocked(empty, CASE_ORDER, 'c1')).toBe(true)
    for (const id of CASE_ORDER.slice(1)) {
      expect(isCaseUnlocked(empty, CASE_ORDER, id)).toBe(false)
    }
    expect(nextOpenCaseId(empty, CASE_ORDER)).toBe('c1')
  })

  it('opens the next one, and only the next one, as each is finished', () => {
    let state = empty
    for (let i = 0; i < CASE_ORDER.length - 1; i++) {
      state = {
        ...state,
        completed: {
          ...state.completed,
          [CASE_ORDER[i]]: { date: '2026-03-01', score: 5, total: 8, thesisTexts: [] },
        },
      }
      expect(isCaseUnlocked(state, CASE_ORDER, CASE_ORDER[i + 1])).toBe(true)
      if (i + 2 < CASE_ORDER.length) {
        expect(isCaseUnlocked(state, CASE_ORDER, CASE_ORDER[i + 2])).toBe(false)
      }
      expect(nextOpenCaseId(state, CASE_ORDER)).toBe(CASE_ORDER[i + 1])
    }
  })

  it('refuses an id that is not in the set', () => {
    expect(isCaseUnlocked(empty, CASE_ORDER, 'c99')).toBe(false)
  })
})

describe('answering and scoring', () => {
  const study = caseById('c1')!
  const items = caseItems(study)

  function started(): CasesState {
    return beginCase(emptyCasesState(), 'c1', caseThesisCount(study))
  }

  it('starts a sitting at step zero with a slot per thesis step', () => {
    const s = started()
    expect(s.inProgress).toEqual({ caseId: 'c1', stepIdx: 0, answers: {}, thesisTexts: [''] })
  })

  it('resuming the same case does not reset it', () => {
    const s = setCaseStep(started(), 'c1', 4)
    expect(beginCase(s, 'c1', 1)).toBe(s)
    expect(beginCase(s, 'c2', 1).inProgress?.stepIdx).toBe(0)
  })

  it('keeps only the first pick for an item and pays XP once', () => {
    let s = started()
    s = recordCaseAnswer(s, 'c1', items[0].id, items[0].answerIdx, true)
    expect(s.pendingXp).toBe(XP_CASE_QUESTION)
    // A second pick on the same item lands nowhere.
    s = recordCaseAnswer(s, 'c1', items[0].id, (items[0].answerIdx + 1) % 4, false)
    expect(s.inProgress?.answers[items[0].id]).toBe(items[0].answerIdx)
    expect(s.pendingXp).toBe(XP_CASE_QUESTION)
  })

  it('pays nothing for a wrong answer, and ignores answers for another case', () => {
    let s = started()
    s = recordCaseAnswer(s, 'c1', items[0].id, (items[0].answerIdx + 1) % 4, false)
    expect(s.pendingXp).toBe(0)
    expect(recordCaseAnswer(s, 'c2', items[1].id, 0, true)).toBe(s)
  })

  it('scores only first-attempt correct answers', () => {
    let s = started()
    for (const item of items) s = recordCaseAnswer(s, 'c1', item.id, item.answerIdx, true)
    expect(scoreCase(study, s.inProgress!.answers)).toBe(items.length)

    let bad = started()
    bad = recordCaseAnswer(bad, 'c1', items[0].id, (items[0].answerIdx + 2) % 4, false)
    expect(scoreCase(study, bad.inProgress!.answers)).toBe(0)
  })

  it('saves thesis text into the right slot and grows the array if it has to', () => {
    let s = saveCaseThesis(started(), 'c1', 0, 'boring is beautiful')
    expect(s.inProgress?.thesisTexts).toEqual(['boring is beautiful'])
    s = saveCaseThesis(s, 'c1', 2, 'third box')
    expect(s.inProgress?.thesisTexts).toEqual(['boring is beautiful', '', 'third box'])
    expect(saveCaseThesis(s, 'c1', -1, 'nope')).toBe(s)
  })
})

describe('completing', () => {
  const study = caseById('c1')!
  const items = caseItems(study)

  function fullyAnswered(): CasesState {
    let s = beginCase(emptyCasesState(), 'c1', 1)
    for (const item of items) s = recordCaseAnswer(s, 'c1', item.id, item.answerIdx, true)
    return saveCaseThesis(s, 'c1', 0, 'my thesis')
  }

  it('records the sitting, clears the in-progress slot and pays the completion XP', () => {
    const before = fullyAnswered()
    const after = completeCase(before, 'c1', {
      score: items.length,
      total: items.length,
      date: '2026-03-04',
    })
    expect(after.inProgress).toBeUndefined()
    expect(after.completed.c1).toEqual({
      date: '2026-03-04',
      score: items.length,
      total: items.length,
      thesisTexts: ['my thesis'],
    })
    expect(after.pendingXp).toBe(items.length * XP_CASE_QUESTION + XP_CASE_COMPLETE)
  })

  it('pays the capstone bonus only on the last case', () => {
    expect(completionXp('c1')).toBe(XP_CASE_COMPLETE)
    expect(completionXp(CAPSTONE_CASE_ID)).toBe(XP_CASE_COMPLETE + XP_CASE_CAPSTONE_BONUS)
    expect(CAPSTONE_CASE_ID).toBe(CASE_ORDER[CASE_ORDER.length - 1])
  })

  it('a replay keeps the better score, the original date, and pays no XP twice', () => {
    const first = completeCase(fullyAnswered(), 'c1', { score: 3, total: 8, date: '2026-03-04' })
    const xpAfterFirst = first.pendingXp

    let replay = beginCase(first, 'c1', 1)
    replay = recordCaseAnswer(replay, 'c1', items[0].id, items[0].answerIdx, true)
    const second = completeCase(replay, 'c1', { score: 7, total: 8, date: '2026-05-01' })

    expect(second.completed.c1.score).toBe(7)
    expect(second.completed.c1.date).toBe('2026-03-04')
    expect(second.pendingXp).toBe(xpAfterFirst)
  })

  it('a replay that scores worse does not overwrite the record', () => {
    const first = completeCase(fullyAnswered(), 'c1', { score: 8, total: 8, date: '2026-03-04' })
    const replay = beginCase(first, 'c1', 1)
    const second = completeCase(replay, 'c1', { score: 1, total: 8, date: '2026-05-01' })
    expect(second.completed.c1.score).toBe(8)
    // …and an untouched thesis box does not blank the one already written.
    expect(second.completed.c1.thesisTexts).toEqual(['my thesis'])
  })

  it('ignores a completion for a case that is not the one in progress', () => {
    const s = fullyAnswered()
    expect(completeCase(s, 'c2', { score: 1, total: 1, date: '2026-03-04' })).toBe(s)
  })
})

describe('sanitizeCasesState', () => {
  it('turns anything unrecognisable into an empty state', () => {
    for (const raw of [undefined, null, 7, 'x', [], { completed: 3 }]) {
      expect(sanitizeCasesState(raw)).toEqual(emptyCasesState())
    }
  })

  it('drops malformed entries and clamps the rest', () => {
    const s = sanitizeCasesState({
      completed: {
        c1: { date: '2026-03-01', score: 5, total: 8, thesisTexts: ['a', 3] },
        c2: { score: 4 }, // no date — not a real record
        c3: 'nonsense',
      },
      inProgress: { caseId: 'c4', stepIdx: -3, answers: { x: 1, y: 9, z: 'q' }, thesisTexts: 'no' },
      pendingXp: -50,
    })
    expect(Object.keys(s.completed)).toEqual(['c1'])
    expect(s.completed.c1.thesisTexts).toEqual(['a', ''])
    expect(s.inProgress).toEqual({ caseId: 'c4', stepIdx: 0, answers: { x: 1 }, thesisTexts: [] })
    expect(s.pendingXp).toBe(0)
  })

  it('round-trips a real state', () => {
    const s = completeCase(
      saveCaseThesis(beginCase(emptyCasesState(), 'c1', 1), 'c1', 0, 'text'),
      'c1',
      { score: 6, total: 8, date: '2026-03-04' },
    )
    expect(sanitizeCasesState(JSON.parse(JSON.stringify(s)))).toEqual(s)
  })
})

// ═══ The store ═══════════════════════════════════════════════════════════════

describe('the cases store', () => {
  let storage = createMemoryStorage()

  beforeEach(async () => {
    storage = createMemoryStorage()
    setCasesStorage(storage)
    useCasesStore.setState({ ...emptyCasesState(), ready: false })
    await useCasesStore.getState().hydrate(true)
  })

  it('writes progress through on every step, so a reload resumes in place', async () => {
    const study = caseById('c1')!
    const item = caseItems(study)[0]
    const s = useCasesStore.getState()

    s.begin('c1', 1)
    s.goToStep('c1', 3)
    s.answer('c1', item.id, item.answerIdx, true)
    s.saveThesis('c1', 0, 'half a thought')

    // Give the un-awaited write-through a turn of the microtask queue.
    await Promise.resolve()
    await Promise.resolve()

    const onDisk = await storage.get<CasesState>(STORAGE_KEYS.cases)
    expect(onDisk?.inProgress?.stepIdx).toBe(3)
    expect(onDisk?.inProgress?.answers[item.id]).toBe(item.answerIdx)
    expect(onDisk?.inProgress?.thesisTexts).toEqual(['half a thought'])
    expect(onDisk?.pendingXp).toBe(XP_CASE_QUESTION)

    // A fresh hydrate — the reload — lands on the same step.
    useCasesStore.setState({ ...emptyCasesState(), ready: false })
    await useCasesStore.getState().hydrate(true)
    expect(useCasesStore.getState().inProgress?.stepIdx).toBe(3)
    expect(useCasesStore.getState().pendingXp).toBe(XP_CASE_QUESTION)
  })

  it('finishing banks the case and unlocks the next one', async () => {
    const s = useCasesStore.getState()
    s.begin('c1', 1)
    s.finish('c1', { score: 6, total: 8 })
    await Promise.resolve()

    const state = useCasesStore.getState()
    expect(state.completed.c1.score).toBe(6)
    expect(state.inProgress).toBeUndefined()
    expect(state.pendingXp).toBe(XP_CASE_COMPLETE)
    expect(isCaseUnlocked(state, CASE_ORDER, 'c2')).toBe(true)
  })

  it('hydrates to an empty state when storage throws', async () => {
    setCasesStorage({
      get: () => Promise.reject(new Error('blocked')),
      set: () => Promise.resolve(),
      del: () => Promise.resolve(),
    })
    useCasesStore.setState({ ...emptyCasesState(), ready: false })
    await useCasesStore.getState().hydrate(true)
    expect(useCasesStore.getState().ready).toBe(true)
    expect(useCasesStore.getState().completed).toEqual({})
  })
})
