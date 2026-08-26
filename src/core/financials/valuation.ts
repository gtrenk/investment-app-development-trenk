// ─── Discounted-cash-flow arithmetic ─────────────────────────────────────────
// The case studies triangulate a value three ways — multiples, a DCF, and a
// reverse DCF — and every one of those numbers is asserted in `tests/cases.test.ts`
// against these functions. They exist so the authored prose and the test agree
// by construction, exactly as `ratios.ts` does for the drills.
//
// Conventions, all of them the ones Units 6–7 teach:
//   • Cash flows are END-OF-YEAR; year 1 is discounted once.
//   • The terminal value is a Gordon growth on the LAST explicit year, and it is
//     discounted back over the same number of years as that last cash flow.
//   • Rates are fractions (0.09 === 9%), never percents.
//   • Nothing here knows about shares or net debt: these return an ENTERPRISE
//     value from an enterprise-level cash flow, and the caller bridges to equity.

/** One growth path applied to a base figure: `[0.08, 0.07]` → two years. */
export function growCashFlows(base: number, growthRates: readonly number[]): number[] {
  const out: number[] = []
  let current = base
  for (const g of growthRates) {
    current *= 1 + g
    out.push(current)
  }
  return out
}

/** PV of end-of-year cash flows, `flows[0]` one year out. */
export function presentValue(flows: readonly number[], discountRate: number): number {
  let pv = 0
  for (let i = 0; i < flows.length; i++) pv += flows[i] / (1 + discountRate) ** (i + 1)
  return pv
}

export interface DcfInputs {
  /** The most recent year's cash flow — the thing being grown. */
  base: number
  /** Explicit-period growth, one rate per year. */
  growthRates: readonly number[]
  /** Perpetual growth after the explicit period. Must be below `discountRate`. */
  terminalGrowth: number
  discountRate: number
}

export interface DcfResult {
  /** The explicit-period cash flows, undiscounted. */
  flows: number[]
  /** PV of the explicit period only. */
  explicitPv: number
  /** Terminal value AT the last explicit year, before discounting. */
  terminalValue: number
  /** PV of that terminal value. */
  terminalPv: number
  /** explicitPv + terminalPv — an enterprise value. */
  value: number
}

/**
 * A two-stage DCF: an explicit growth path, then Gordon growth forever.
 *
 * Throws rather than returning a negative or infinite value when the terminal
 * growth meets or exceeds the discount rate — that is the single most common
 * way a DCF quietly produces nonsense, and Unit 7 spends a lesson on it.
 */
export function dcfValue(inputs: DcfInputs): DcfResult {
  const { base, growthRates, terminalGrowth, discountRate } = inputs
  if (terminalGrowth >= discountRate) {
    throw new Error('dcfValue: terminal growth must be below the discount rate')
  }
  const flows = growCashFlows(base, growthRates)
  if (flows.length === 0) throw new Error('dcfValue: needs at least one explicit year')

  const explicitPv = presentValue(flows, discountRate)
  const last = flows[flows.length - 1]
  const terminalValue = (last * (1 + terminalGrowth)) / (discountRate - terminalGrowth)
  const terminalPv = terminalValue / (1 + discountRate) ** flows.length

  return { flows, explicitPv, terminalValue, terminalPv, value: explicitPv + terminalPv }
}

/** Enterprise value → per-share equity value. `netDebt` is negative for net cash. */
export function equityValuePerShare(
  enterpriseValue: number,
  netDebt: number,
  shares: number,
): number {
  return (enterpriseValue - netDebt) / shares
}

export interface ImpliedGrowthInputs {
  /** The enterprise value the market is already paying. */
  target: number
  base: number
  /** Length of the explicit period the constant growth rate applies to. */
  years: number
  terminalGrowth: number
  discountRate: number
}

/**
 * The reverse DCF: the flat explicit-period growth rate that makes the model
 * spit out exactly what the market is charging.
 *
 * Bisection rather than a closed form — the value is monotonic in growth, the
 * bracket is generous (−50% to +100% a year), and fifty halvings put the answer
 * inside 1e-13, which is far tighter than the one decimal place it is quoted at.
 */
export function impliedConstantGrowth(inputs: ImpliedGrowthInputs): number {
  const { target, base, years, terminalGrowth, discountRate } = inputs
  const valueAt = (g: number): number =>
    dcfValue({
      base,
      growthRates: Array.from({ length: years }, () => g),
      terminalGrowth,
      discountRate,
    }).value

  let lo = -0.5
  let hi = 1
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (valueAt(mid) < target) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
