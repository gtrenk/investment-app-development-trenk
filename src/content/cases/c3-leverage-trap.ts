// ─── Case 3 — The Leverage Trap ──────────────────────────────────────────────
// Skyline Air against Halden Industrial, FY2024.
//
// Two cyclicals, one with a 6× P/E and one with an 11× P/E, and the cheap one is
// the expensive one. The case exists to make a single mechanism concrete: a P/E
// prices the equity stub, and when the stub is one sixth of the capital
// structure the multiple stops describing the business at all.
//
// Every figure is recomputed from companies.json in tests/cases.test.ts.

import type { CaseStudy } from '@core/types'

const AIR = 'skyline-air'
const IND = 'halden-industrial'
const BOTH = [AIR, IND]

export const CASE_3: CaseStudy = {
  id: 'c3',
  title: 'The Leverage Trap',
  blurb: 'A 6× P/E next to an 11× P/E. The cheap one is the expensive one.',
  company: AIR,
  intro: `Two cyclical businesses, both selling into demand they do not control.

**Skyline Air** flies 14 billion dollars of passengers a year and trades at **$9.00** against $1.50 of earnings — a P/E of 6.0×. **Halden Industrial** builds machinery, earns $4.00 a share, and trades at **$44.00** — a P/E of 11.0×.

One of them is genuinely cheaper than the other. It is not the one with the lower P/E, and by the end of this case you will be able to say exactly why in a single sentence.`,
  verdict: {
    md: `**Pass on Skyline.** The 6.0× P/E is not a discount, it is arithmetic: **$6,700M** of net debt sits ahead of a **$1,674M** equity stub, so on enterprise value the airline trades at **9.8×** operating income against Halden's **8.8×** — the "cheap" one is 12% dearer for the whole business.

Interest coverage of **1.78×** and capital expenditure absorbing **93.4%** of operating cash leave nothing to absorb a bad year, and a 10% revenue decline turns $852M of operating income into a **$338M** pretax loss. This is not a valuation problem. It is a survival one.`,
    checklistScore: 2,
  },
  steps: [
    {
      kind: 'read',
      statementIds: BOTH,
      md: `## Two cyclicals, side by side

The statements above put Skyline next to Halden. Read the income statements in parallel and the difference is not subtle.

- **Gross margin**: Skyline 16.0%, Halden 32.0%. Fuel, crew and airport fees leave the airline a sixth of its revenue.
- **Operating income**: $852M against $1,152M — Halden earns more from two thirds of the revenue.
- **Interest expense**: **$480M** at Skyline against **$192M** at Halden.

That last line is the case. Skyline pays more than half its operating income to its lenders before a shareholder sees anything.

Now the balance sheets. Skyline holds **$14,800M** of aircraft, financed with **$9,100M** of long-term debt against **$4,300M** of equity. Halden holds $2,900M of plant against $2,800M of debt and $3,600M of equity.

Both are cyclical. Only one of them is fragile.`,
    },
    {
      kind: 'calc',
      statementIds: [AIR],
      formulaHint: 'Interest coverage = operating income ÷ interest expense',
      item: {
        id: 'c3-q1',
        prompt: "How many times over does Skyline's operating income cover its interest bill?",
        choices: ['4.73×', '0.58×', '1.78×', '0.56×'],
        answerIdx: 2,
        explain: `$852M ÷ $480M = **1.78×**. The checklist wants more than 4×; below roughly 2× the company is one weak quarter away from renegotiating with its lenders.

4.73× uses gross profit, which is the number before the $1,420M of running the airline. 0.58× uses net income, which is *after* the interest — you cannot cover a cost out of what is left once you have paid it. 0.56× is the ratio upside down.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [IND],
      formulaHint: 'Interest coverage = operating income ÷ interest expense',
      item: {
        id: 'c3-q2',
        prompt: 'And Halden, on the same measure?',
        choices: ['6.00×', '3.75×', '16.00×', '0.17×'],
        answerIdx: 0,
        explain: `$1,152M ÷ $192M = **6.00×**, comfortably clear of the 4× threshold.

3.75× uses net income; 16.00× uses gross profit; 0.17× is inverted. Same three mistakes, same order of severity.

Skyline covers its interest 1.78 times. Halden covers it six. Hold both figures — every remaining question in this case is a consequence of them.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [AIR],
      formulaHint: 'Debt to equity = total liabilities ÷ shareholders’ equity',
      item: {
        id: 'c3-q3',
        prompt: "What is Skyline's debt-to-equity ratio?",
        choices: ['2.12×', '4.42×', '0.77×', '3.42×'],
        answerIdx: 3,
        explain: `$14,700M ÷ $4,300M = **3.42×**. Creditors have three and a half dollars in this business for every dollar the owners have.

2.12× counts only long-term debt and ignores $5,600M of current liabilities, which is the narrower definition some screens use and a materially friendlier one. 4.42× is total assets ÷ equity — the equity multiplier, which is this ratio plus one. 0.77× is debt ÷ assets, a real ratio answering a different question.

Halden's figure is 1.50×.`,
      },
    },
    {
      kind: 'question',
      statementIds: BOTH,
      item: {
        id: 'c3-q4',
        prompt:
          'Skyline trades at 6.0× earnings and Halden at 11.0×. Why is that comparison close to meaningless?',
        choices: [
          'Airlines report earnings on a different basis from industrial companies',
          'A P/E prices only the equity, and Skyline’s equity is a thin slice of a heavily indebted capital structure — the buyer of the shares also inherits the debt, which the multiple never mentions',
          'The P/E is unreliable for any company with a market capitalisation below $2,000M',
          'Skyline’s earnings are lower quality because its margin is thinner',
        ],
        answerIdx: 1,
        explain: `Buying every share of Skyline at $9.00 costs $1,674M and gets you a business carrying $6,700M of net debt. The true price of the enterprise is $8,374M, five times what the equity costs.

Buying all of Halden costs $7,920M and brings $2,180M of net debt — $10,100M for the enterprise, only 28% more than the shares.

The P/E compares the two equity stubs and says nothing about what stands behind them. When capital structures differ this much, the multiple that means something is enterprise value against operating income, and that is the next step.

(The other two answers are the sort of thing that sounds like caution but is not a mechanism. Reporting bases are the same; there is no size below which the P/E stops working.)`,
      },
    },
    {
      kind: 'calc',
      statementIds: [AIR],
      formulaHint:
        'Enterprise value = market cap + long-term debt − cash. Skyline: 186M shares at $9.00.',
      item: {
        id: 'c3-q5',
        prompt: "What is Skyline's enterprise value?",
        choices: ['$1,674M', '$8,374M', '$10,774M', '$6,700M'],
        answerIdx: 1,
        explain: `186M × $9.00 = $1,674M of market capitalisation, plus $9,100M of long-term debt, less $2,400M of cash = **$8,374M**.

$1,674M is the market capitalisation on its own — the price of the shares, not of the business. $10,774M adds the debt without netting the cash, which overstates what an acquirer would actually have to fund. $6,700M is the net debt by itself.

Notice the proportions: the equity is **20%** of the enterprise value. A 10% move in the value of the business is a 50% move in the shares, in either direction. That is what leverage is.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [AIR],
      formulaHint: 'EV ÷ operating income, using the $8,374M enterprise value just computed',
      item: {
        id: 'c3-q6',
        prompt: 'On enterprise value to operating income, what is Skyline worth?',
        choices: ['9.8×', '30.0×', '2.0×', '6.0×'],
        answerIdx: 0,
        explain: `$8,374M ÷ $852M = **9.8×**. Halden, on the same measure, is $10,100M ÷ $1,152M = **8.8×**.

The airline with the 6.0× P/E is **12% more expensive** than the machinery maker with the 11.0× P/E, once you price the whole business rather than the leftover slice.

30.0× divides enterprise value by *net* income, mixing an enterprise numerator with an equity denominator — the most common way to get an EV multiple wrong. 2.0× uses market capitalisation over operating income, the same mistake in reverse. 6.0× is the P/E you already had.`,
      },
    },
    {
      kind: 'question',
      statementIds: BOTH,
      item: {
        id: 'c3-q7',
        prompt:
          'Suppose revenue falls 10% in a recession and costs fall only half as much in dollars. Skyline: revenue $12,780M, cost of revenue $11,218M, operating expenses unchanged at $1,420M. What happens below the operating line?',
        choices: [
          'Operating income falls to $142M and, after $480M of interest, becomes a $338M pretax loss',
          'Operating income falls to $142M, which after interest is a small but positive profit',
          'The company breaks even, since interest expense would fall with the revenue',
          'Operating income falls to $562M and the company remains comfortably profitable',
        ],
        answerIdx: 0,
        explain: `$12,780M − $11,218M = $1,562M of gross profit; less $1,420M of operating expenses = **$142M** of operating income; less $480M of interest = a **$338M** pretax loss.

Run the identical stress on Halden: revenue $8,640M less cost of revenue $6,048M leaves $2,592M of gross profit; less $1,920M of operating expenses gives **$672M** of operating income, and after $192M of interest a pretax profit of **$480M**. Still comfortably profitable.

The interest bill does not shrink in a recession — it is contractual, and that is the entire difference. Cyclicality is survivable; cyclicality financed with fixed obligations is what turns a bad year into a rights issue at the worst possible price.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [AIR],
      formulaHint: 'Reinvestment burden = capital expenditure ÷ cash from operations',
      item: {
        id: 'c3-q8',
        prompt: 'What share of Skyline’s operating cash flow is consumed by capital expenditure?',
        choices: ['13.0%', '93.4%', '107.0%', '6.6%'],
        answerIdx: 1,
        explain: `$1,850M ÷ $1,980M = **93.4%**. Almost every dollar the airline generates goes straight back into aircraft, leaving $130M of free cash flow against a $6,700M net debt position.

13.0% is capital expenditure ÷ revenue — a real ratio, but it measures intensity against sales rather than against the cash actually available. 107.0% is the ratio inverted. 6.6% is free cash flow ÷ operating cash flow, which is the same fact stated as what survives.

Halden reinvests 40.4% of its operating cash and keeps $560M. That is the difference between a business that can pay down debt and one that can only refinance it.`,
      },
    },
    {
      kind: 'thesis',
      prompts: [
        'Write the one sentence that explains why Skyline’s 6.0× P/E is not cheap. Assume your reader knows what a P/E is and nothing else.',
        'What would have to be true about the next five years for the 6.0× P/E to turn out to have been right?',
        'If you could only fix one line of Skyline’s statements, which would it be, and what would the company look like afterwards?',
      ],
    },
    {
      kind: 'read',
      statementIds: BOTH,
      md: `## The model analysis

**The business.** A capital-intensive airline: $14,800M of aircraft producing $14,200M of revenue at a **16.0%** gross margin. Demand is cyclical, pricing is competitive, and the largest cost is a commodity nobody at the company controls.

**The checklist (Unit 5).**

| # | Test | Reading | Score |
|---|---|---|---|
| 1 | Gross margin | 16.0% — structurally thin | **Watch** |
| 2 | Operating margin | 6.0% | **Watch** |
| 3 | ROE, DuPont | 6.5%, on a 4.42× equity multiplier | **Fail** |
| 4 | ROIC vs WACC | NOPAT $639M ÷ invested capital $11,000M = 5.8% against a 9.0% WACC | **Fail**, −3.2 pts |
| 5 | Liquidity | Current ratio 0.66×, and no negative-working-capital model to justify it | **Watch** |
| 6 | Leverage | Net debt $6,700M = 7.86× operating income | **Fail** |
| 7 | Interest coverage | 1.78× | **Fail** |
| 8 | Cash conversion | CFO $1,980M ÷ net income $279M = 7.10× | **Pass** |
| 9 | Working capital | Receivables 15.9 days, inventory 14.7 days | **Pass** |
| 10 | Per-share growth | No prior year in this data set | **Watch** |

**Score: 2 pass, 4 watch, 4 fail.**

Item 4 is the one that settles it. Skyline earns **5.8%** on the capital it employs against a cost of capital near **9.0%** — every aircraft it buys destroys value at the margin, and it must keep buying aircraft to stay in business. Item 8's flattering 7.10× cash conversion is not a quality signal here; it is depreciation on $14,800M of planes, and capital expenditure takes 93.4% of it straight back.

**The valuation.**

| | Skyline | Halden |
|---|---|---|
| Share price | $9.00 | $44.00 |
| P/E | **6.0×** | **11.0×** |
| Market cap | $1,674M | $7,920M |
| Net debt | $6,700M | $2,180M |
| Enterprise value | $8,374M | $10,100M |
| EV / operating income | **9.8×** | **8.8×** |
| Interest coverage | 1.78× | 6.00× |
| ROIC | 5.8% | 14.9% |

The cheap one is the expensive one. On the multiple that prices the whole business rather than the residual claim, Skyline is 12% dearer than a company earning nearly three times the return on capital.

**What the P/E was actually telling you.** Not that the shares are cheap — that the earnings are geared. Net income of $279M is what survives $480M of interest on $9,100M of debt. A 20% swing in operating income — $170M — moves pretax income by 46%. A low multiple on a violently variable number is not a bargain, it is the market declining to pay for volatility.

**The decision: pass.** Not because airlines are bad businesses, but because this balance sheet removes the owner's ability to be wrong. The stress test is the whole argument: a 10% revenue decline — smaller than the airline industry has seen repeatedly — produces a **$338M** pretax loss, at a company whose entire equity is $4,300M and whose cash is $2,400M.

**What would change it.** Net debt below 3× operating income; interest coverage above 4×; capital expenditure below 60% of operating cash flow for two consecutive years. Any of those would mean the business had bought back its own optionality, and the analysis could start again from the top.`,
    },
  ],
}
