// ─── Financial-statement ratios ──────────────────────────────────────────────
// Pure functions over one (or two) already-loaded `FinStatementSnapshot`.
// Nothing here fetches: reading `public/data/financials/companies.json` is the
// UI/platform layer's job, exactly as with `@core/market/bundled`.
//
// These are the same formulas Units 4–5 teach, expressed once so that the drill
// content, the UI reveal, and `tests/finDrills.test.ts` cannot drift apart —
// the test recomputes every ratio-calc answer straight from the JSON with these
// functions, so a typo in a drill choice fails the suite.
//
// DIVISION BY ZERO is not defended against: it returns ±Infinity or NaN and the
// caller sees it. A zero denominator here always means a nonsense question
// (inventory turnover for a company with no inventory, interest coverage with
// no debt), which belongs in a content test, not in a silent fallback.

import type { FinStatementSnapshot } from '@core/types'

/** Days in the year used by every turnover-to-days conversion below. */
export const DAYS_PER_YEAR = 365

// ─── Margins (fractions, not percents: 0.80 === 80%) ─────────────────────────

export function grossMargin(s: FinStatementSnapshot): number {
  return s.incomeStatement.grossProfit / s.incomeStatement.revenue
}

export function operatingMargin(s: FinStatementSnapshot): number {
  return s.incomeStatement.operatingIncome / s.incomeStatement.revenue
}

export function pretaxMargin(s: FinStatementSnapshot): number {
  return s.incomeStatement.pretaxIncome / s.incomeStatement.revenue
}

export function netMargin(s: FinStatementSnapshot): number {
  return s.incomeStatement.netIncome / s.incomeStatement.revenue
}

/** Taxes ÷ pretax income. Meaningless (and possibly negative) at a pretax loss. */
export function effectiveTaxRate(s: FinStatementSnapshot): number {
  return s.incomeStatement.taxes / s.incomeStatement.pretaxIncome
}

// ─── Liquidity ───────────────────────────────────────────────────────────────

export function currentRatio(s: FinStatementSnapshot): number {
  return s.balanceSheet.currentAssets / s.balanceSheet.currentLiabilities
}

/**
 * (cash + receivables) ÷ current liabilities — the current ratio with inventory
 * and prepaids stripped out. The gap between this and `currentRatio` is the
 * whole question of how saleable the current assets really are.
 */
export function quickRatio(s: FinStatementSnapshot): number {
  return (s.balanceSheet.cash + s.balanceSheet.receivables) / s.balanceSheet.currentLiabilities
}

export function cashRatio(s: FinStatementSnapshot): number {
  return s.balanceSheet.cash / s.balanceSheet.currentLiabilities
}

/** Current assets − current liabilities, in $M. Negative is normal for grocers. */
export function workingCapital(s: FinStatementSnapshot): number {
  return s.balanceSheet.currentAssets - s.balanceSheet.currentLiabilities
}

// ─── Leverage & coverage ─────────────────────────────────────────────────────

/** Total liabilities ÷ equity. */
export function debtToEquity(s: FinStatementSnapshot): number {
  return s.balanceSheet.totalLiabilities / s.balanceSheet.equity
}

/** Long-term debt only ÷ equity — the narrower definition some screens use. */
export function longTermDebtToEquity(s: FinStatementSnapshot): number {
  return s.balanceSheet.longTermDebt / s.balanceSheet.equity
}

export function debtToAssets(s: FinStatementSnapshot): number {
  return s.balanceSheet.totalLiabilities / s.balanceSheet.totalAssets
}

/** Total assets ÷ equity — the leverage term of the DuPont decomposition. */
export function equityMultiplier(s: FinStatementSnapshot): number {
  return s.balanceSheet.totalAssets / s.balanceSheet.equity
}

/** Long-term debt − cash, in $M. Negative means a net cash position. */
export function netDebt(s: FinStatementSnapshot): number {
  return s.balanceSheet.longTermDebt - s.balanceSheet.cash
}

/**
 * Operating income ÷ interest expense — how many times over the year's profit
 * covers the year's interest bill. Under ~2× the company is one bad quarter
 * from having to renegotiate.
 */
export function interestCoverage(s: FinStatementSnapshot): number {
  return s.incomeStatement.operatingIncome / s.incomeStatement.interestExpense
}

/** Equity − goodwill, in $M. Negative = the book cushion is all acquisition premium. */
export function tangibleBookValue(s: FinStatementSnapshot): number {
  return s.balanceSheet.equity - s.balanceSheet.goodwill
}

export function goodwillToAssets(s: FinStatementSnapshot): number {
  return s.balanceSheet.goodwill / s.balanceSheet.totalAssets
}

export function bookValuePerShare(s: FinStatementSnapshot): number {
  return s.balanceSheet.equity / s.incomeStatement.shares
}

// ─── Efficiency ──────────────────────────────────────────────────────────────

/** COGS ÷ inventory. Using revenue instead is the classic overstatement. */
export function inventoryTurnover(s: FinStatementSnapshot): number {
  return s.incomeStatement.cogs / s.balanceSheet.inventory
}

/** 365 ÷ inventory turnover — days of stock on hand. */
export function daysInventory(s: FinStatementSnapshot): number {
  return DAYS_PER_YEAR / inventoryTurnover(s)
}

export function receivablesTurnover(s: FinStatementSnapshot): number {
  return s.incomeStatement.revenue / s.balanceSheet.receivables
}

/** Days sales outstanding: 365 × receivables ÷ revenue. */
export function daysSalesOutstanding(s: FinStatementSnapshot): number {
  return (DAYS_PER_YEAR * s.balanceSheet.receivables) / s.incomeStatement.revenue
}

export function assetTurnover(s: FinStatementSnapshot): number {
  return s.incomeStatement.revenue / s.balanceSheet.totalAssets
}

// ─── Returns ─────────────────────────────────────────────────────────────────

export function returnOnEquity(s: FinStatementSnapshot): number {
  return s.incomeStatement.netIncome / s.balanceSheet.equity
}

export function returnOnAssets(s: FinStatementSnapshot): number {
  return s.incomeStatement.netIncome / s.balanceSheet.totalAssets
}

// ─── Cash quality ────────────────────────────────────────────────────────────

/**
 * CFO ÷ net income — the earnings-quality ratio. Sustainably below ~1× means
 * reported profit is not turning into cash; well above ~1× usually just means
 * heavy depreciation, which is why it must be read next to capex.
 */
export function cashConversion(s: FinStatementSnapshot): number {
  return s.cashFlow.cfo / s.incomeStatement.netIncome
}

export function fcfMargin(s: FinStatementSnapshot): number {
  return s.cashFlow.fcf / s.incomeStatement.revenue
}

export function fcfConversion(s: FinStatementSnapshot): number {
  return s.cashFlow.fcf / s.incomeStatement.netIncome
}

export function capexToRevenue(s: FinStatementSnapshot): number {
  return s.cashFlow.capex / s.incomeStatement.revenue
}

/** Capex ÷ CFO — what share of operating cash the business must reinvest to stand still. */
export function capexToCfo(s: FinStatementSnapshot): number {
  return s.cashFlow.capex / s.cashFlow.cfo
}

export function sbcToRevenue(s: FinStatementSnapshot): number {
  return s.cashFlow.sbc / s.incomeStatement.revenue
}

// ─── Identity checking ───────────────────────────────────────────────────────

/** Tolerance for the identity checks — the data is authored in whole $M. */
export const IDENTITY_EPSILON = 1e-9

/**
 * Every accounting identity a snapshot must satisfy, as a list of human-readable
 * violations. An empty array means the statements hang together.
 *
 * Used by `tests/finDrills.test.ts` against the shipped JSON, and safe for the
 * UI to call on anything it loads.
 */
export function statementIssues(s: FinStatementSnapshot): string[] {
  const i = s.incomeStatement
  const b = s.balanceSheet
  const f = s.cashFlow
  const issues: string[] = []

  const eq = (label: string, actual: number, expected: number): void => {
    if (Math.abs(actual - expected) > IDENTITY_EPSILON) {
      issues.push(`${label}: ${actual} ≠ ${expected}`)
    }
  }

  eq('grossProfit = revenue − cogs', i.grossProfit, i.revenue - i.cogs)
  eq('operatingIncome = grossProfit − opex', i.operatingIncome, i.grossProfit - i.opex)
  eq(
    'pretaxIncome = operatingIncome − interestExpense',
    i.pretaxIncome,
    i.operatingIncome - i.interestExpense,
  )
  eq('netIncome = pretaxIncome − taxes', i.netIncome, i.pretaxIncome - i.taxes)

  // eps is a rounded quantity, so it gets a half-cent band rather than epsilon.
  if (Math.abs(i.eps - i.netIncome / i.shares) > 0.005) {
    issues.push(`eps = netIncome / shares: ${i.eps} ≠ ${i.netIncome / i.shares}`)
  }
  if (!(i.shares > 0)) issues.push(`shares must be positive: ${i.shares}`)

  const namedCurrent = b.cash + b.receivables + b.inventory
  if (b.currentAssets < namedCurrent - IDENTITY_EPSILON) {
    issues.push(
      `currentAssets ≥ cash + receivables + inventory: ${b.currentAssets} < ${namedCurrent}`,
    )
  }
  eq('totalAssets = currentAssets + ppe + goodwill', b.totalAssets, b.currentAssets + b.ppe + b.goodwill)
  eq(
    'totalLiabilities = currentLiabilities + longTermDebt',
    b.totalLiabilities,
    b.currentLiabilities + b.longTermDebt,
  )
  eq('totalAssets = totalLiabilities + equity', b.totalAssets, b.totalLiabilities + b.equity)

  eq('fcf = cfo − capex', f.fcf, f.cfo - f.capex)
  if (f.capex < 0) issues.push(`capex is reported positive: ${f.capex}`)
  if (f.sbc < 0) issues.push(`sbc must be non-negative: ${f.sbc}`)

  return issues
}
