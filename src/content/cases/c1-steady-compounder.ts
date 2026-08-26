// ─── Case 1 — The Steady Compounder ──────────────────────────────────────────
// Harborline Grocers, FY2023 and FY2024 side by side.
//
// The first case, so it teaches the *shape* of the work more than any single
// ratio: read the statement, compute, ask what the number means for this
// industry, then decide. The company is deliberately dull — a 3.0% operating
// margin and a current ratio below 1.0 both look like failures until you know
// what a grocer is, which is exactly the habit the case is trying to build.
//
// Every figure below is recomputed from companies.json in tests/cases.test.ts.
// Market assumptions (share price, discount rate, peer multiple) are declared
// there too, so nothing in this file is an unchecked number.

import type { CaseStudy } from '@core/types'

const FY24 = 'harborline-grocers'
const FY23 = 'harborline-grocers-fy2023'
const BOTH = [FY23, FY24]

export const CASE_1: CaseStudy = {
  id: 'c1',
  title: 'The Steady Compounder',
  blurb: 'A grocer with a 3% margin and no cash. Is boring beautiful?',
  company: FY24,
  intro: `**Harborline Grocers** runs 340 supermarkets. It sells $28.5 billion of food a year and keeps less than two cents of every dollar.

Nothing about this company is exciting, and every ratio you are about to compute would look like a failing grade in a different industry. That is the point. This case is about learning to ask *compared with what* before you ask *is it good*.

You will read two years of statements, compute six figures, and finish by writing down whether you would own it at $19.50 a share.`,
  verdict: {
    md: `**Buy — a small position.** Nine of ten checklist items pass, the tenth is a leverage reading that a depreciation line would probably rescue, and at $19.50 the reverse DCF implies revenue **shrinking 3.0%** a year forever for a chain that just grew 5.6%. The discount to a $27.44 central estimate is **28.9%**, clear of the 25% the strategy document demands.

Boring is beautiful only when it is priced as boring. This one is.`,
    checklistScore: 9,
  },
  steps: [
    {
      kind: 'read',
      statementIds: BOTH,
      md: `## Two years, side by side

The panel above holds two years of Harborline side by side, FY2023 then FY2024 — which is the only way a single year ever becomes informative — a snapshot tells you where a business is, two tell you where it is going.

Read down the income statement first and notice how little room there is. Of $28,500M of revenue, $21,375M goes straight back out as the cost of the food itself. What is left has to pay for 340 stores, their staff, their electricity and their trucks.

Three things are worth marking before you compute anything:

- **Revenue grew 5.6%**, from $27,000M to $28,500M — no acquisitions, no new segment.
- **Inventory is $2,100M** against $480M of cash. This is a business whose assets are groceries.
- **Diluted shares fell**, 274M to 266M. Somebody is buying stock back.`,
    },
    {
      kind: 'calc',
      statementIds: [FY24],
      formulaHint: 'Gross margin = gross profit ÷ revenue',
      item: {
        id: 'c1-q1',
        prompt: "What is Harborline's FY2024 gross margin?",
        choices: ['25.0%', '75.0%', '3.0%', '1.9%'],
        answerIdx: 0,
        explain: `$7,125M ÷ $28,500M = **25.0%**. A quarter of every dollar of groceries survives the cost of the groceries.

75.0% is cost of revenue ÷ revenue — the mirror image, and the single most common inversion there is. 3.0% is the operating margin, further down the statement; 1.9% is the net margin, further down still. Reading the wrong line is not a rounding error, it is a different question answered.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [FY24],
      formulaHint: 'Operating margin = operating income ÷ revenue',
      item: {
        id: 'c1-q2',
        prompt: 'And the FY2024 operating margin?',
        choices: ['22.0%', '25.0%', '2.5%', '3.0%'],
        answerIdx: 3,
        explain: `$855M ÷ $28,500M = **3.0%**. Running the stores consumed $6,270M of the $7,125M gross profit.

22.0% is operating expenses ÷ revenue — the cost, not the margin. 25.0% is the gross margin one line up. 2.5% is the pretax margin one line down, after $155M of interest. On a 3.0% operating margin those three lines are only a few hundred basis points apart, which is precisely why the label matters more here than anywhere else.`,
      },
    },
    {
      kind: 'question',
      statementIds: BOTH,
      item: {
        id: 'c1-q3',
        prompt: 'A 3.0% operating margin would be alarming at a software company. Why is it unremarkable here?',
        choices: [
          'Grocers report margins after tax, so the figure is not comparable',
          'Food retail is exempt from the usual profitability tests',
          'Margin is only half of return: a grocer earns a small margin many times a year, and it is margin × turnover that produces the return on capital',
          'The margin will expand once the chain reaches national scale',
        ],
        answerIdx: 2,
        explain: `Return on assets is net margin multiplied by asset turnover. Harborline keeps 1.9 cents per dollar of sales but sells $2.85 of goods for every $1.00 of assets it owns, so the thin margin runs through the balance sheet nearly three times a year.

A software company earns ten times the margin on a third of the turnover. Neither is better; they are two routes to the same destination, and comparing only the first leg tells you nothing. This is the whole reason the DuPont decomposition exists (Unit 5).`,
      },
    },
    {
      kind: 'calc',
      statementIds: [FY24],
      formulaHint: 'Asset turnover = revenue ÷ total assets',
      item: {
        id: 'c1-q4',
        prompt: 'Compute the FY2024 asset turnover.',
        choices: ['0.35×', '8.64×', '2.85×', '3.03×'],
        answerIdx: 2,
        explain: `$28,500M ÷ $10,000M = **2.85×**. Every dollar of assets generates $2.85 of sales a year — near the top of what any business achieves, and the entire compensation for the 3.0% margin.

0.35× is the ratio upside down (assets ÷ revenue). 8.64× divides revenue by *equity* rather than assets, which quietly folds in the leverage. 3.03× is total assets ÷ equity — the equity multiplier, a different DuPont term entirely.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [FY24],
      formulaHint: 'Return on equity = net income ÷ shareholders’ equity',
      item: {
        id: 'c1-q5',
        prompt: 'What return did Harborline earn on its equity in FY2024?',
        choices: ['5.3%', '16.1%', '1.9%', '15.9%'],
        answerIdx: 1,
        explain: `$532M ÷ $3,300M = **16.1%** — and the DuPont path there is 1.9% net margin × 2.85× asset turnover × 3.03× equity multiplier.

5.3% is the return on *assets*, which is what you get before the leverage. 1.9% is the net margin. 15.9% is the FY2023 figure — right arithmetic, wrong column, and the trap that catches people reading two years at once.

Note the honest caveat: a third of that 16.1% comes from the 3.03× equity multiplier. Leverage is doing real work, and the next question is whether the balance sheet can carry it.`,
      },
    },
    {
      kind: 'question',
      statementIds: [FY24],
      item: {
        id: 'c1-q6',
        prompt:
          'Harborline holds $3,050M of current assets against $3,600M of current liabilities — a current ratio of 0.85×, and negative working capital of $550M. How should that be read?',
        choices: [
          'A liquidity crisis: the company cannot meet its obligations for the coming year',
          'A structural feature of grocery retail — stock is sold for cash long before the suppliers who provided it are paid, so the customers finance the inventory',
          'An accounting error, since current assets must exceed current liabilities',
          'Evidence that the company is hoarding cash off the balance sheet',
        ],
        answerIdx: 1,
        explain: `A grocer turns its entire inventory in about five weeks and collects at the till instantly — receivables are only $320M on $28,500M of sales, four days' worth. Supplier terms run considerably longer than five weeks. The float that creates is negative working capital, and it is a *source* of cash, not a hole.

The checklist item (Unit 5, item 5) is written to allow exactly this: "current ratio ≥1.0, **or** a demonstrable negative-working-capital model." The demonstration is the inventory and receivable days you are about to compute. Where it would be a crisis is at a company whose stock sits for six months — which is Case 4.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [FY24],
      formulaHint: 'Days inventory = 365 ÷ (COGS ÷ inventory)',
      item: {
        id: 'c1-q7',
        prompt: 'How many days of stock does Harborline hold?',
        choices: ['26.9 days', '35.9 days', '10.2 days', '4.1 days'],
        answerIdx: 1,
        explain: `Inventory turnover is $21,375M ÷ $2,100M = 10.2×, so 365 ÷ 10.2 = **35.9 days**. Five weeks — and FY2023 was 36.4 days, so it is getting slightly faster, not slower.

26.9 days uses *revenue* instead of COGS in the turnover, which counts the retailer's markup as though it were stock and flatters the figure every time. 10.2 is the turnover itself, not a number of days. 4.1 days is the receivable collection period — the other half of the cash cycle.`,
      },
    },
    {
      kind: 'calc',
      statementIds: BOTH,
      formulaHint: 'Change in share count = (FY2024 shares ÷ FY2023 shares) − 1',
      item: {
        id: 'c1-q8',
        prompt:
          'Revenue grew 5.6% and net income grew 6.0%. What happened to the diluted share count over the same year?',
        choices: [
          'It rose 3.0% as stock compensation was issued',
          'It fell 2.9%, from 274M to 266M',
          'It was unchanged; EPS rose only because net income rose',
          'It fell 8.0%',
        ],
        answerIdx: 1,
        explain: `266 ÷ 274 − 1 = **−2.9%**. Eight million shares retired, which is why EPS went from $1.83 to $2.00 — faster than the 6.0% net income grew.

"Fell 8.0%" mistakes the 8 million *shares* for 8 percent. The unchanged answer would leave EPS growth equal to earnings growth, and it plainly is not.

This is checklist item 10, and it is the item that decides whether growth reaches the owner. Stock-based compensation here is $45M — 0.2% of revenue. Case 2 shows what happens when that figure is a hundred times larger.`,
      },
    },
    {
      kind: 'thesis',
      prompts: [
        'In three sentences: how does Harborline make money, and what would make a customer shop somewhere else?',
        'Name the single fact the case turns on — the one thing that, if it changed, would change your answer.',
        'At $19.50 a share, would you buy, pass, or watch? Say what price would change your mind.',
      ],
    },
    {
      kind: 'read',
      statementIds: BOTH,
      md: `## The model analysis

**The business.** A regional grocery chain selling food at a 25.0% gross margin and keeping 3.0% at the operating line. Nothing is proprietary. The moat, such as it is, is location density and scale purchasing, and it is worth exactly as much as the nearest competitor's willingness to open across the street.

**The checklist (Unit 5).**

| # | Test | Reading | Score |
|---|---|---|---|
| 1 | Gross margin stable | 25.0% in both FY2023 and FY2024 | **Pass** |
| 2 | Operating margin | 3.0% both years, at the grocery norm | **Pass** |
| 3 | ROE, DuPont-decomposed | 16.1% = 1.9% × 2.85× × 3.03× | **Pass** |
| 4 | ROIC vs WACC | NOPAT $649.8M ÷ invested capital $5,920M = 11.0% vs a 7.0% WACC | **Pass**, +4.0 pts |
| 5 | Liquidity | 0.85× current ratio, but a real negative-working-capital model | **Pass** |
| 6 | Leverage | Net debt $2,620M = 3.06× operating income | **Watch** |
| 7 | Interest coverage | $855M ÷ $155M = 5.5× | **Pass** |
| 8 | Cash conversion | CFO $1,180M ÷ net income $532M = 2.22× | **Pass** |
| 9 | Working-capital trend | Inventory 36.4 → 35.9 days; DSO 4.1 days | **Pass** |
| 10 | Per-share growth | Shares −2.9%; EPS $1.83 → $2.00 | **Pass** |

**Score: 9 pass, 1 watch.** The watch is item 6, and it deserves the honest caveat: these statements carry no depreciation line, so net debt is measured against operating income rather than EBITDA. A chain with $6,400M of stores and trucks depreciates heavily, and adding that back would very likely drop the ratio under 2.5×. It is a watch because the data cannot settle it, not because the answer is known to be bad.

**The valuation.** At **$19.50** the market capitalisation is $5,187M and enterprise value $7,807M.

- P/E **9.8×** · EV/operating income **9.1×** · free-cash-flow yield **9.3%**
- A DCF on $480M of free cash flow growing 4/4/3/3/3% then 2.0% forever, discounted at 7.0%, gives **$29.37** a share.
- Peers trade at 11× operating income, which gives **$25.51**.
- Central estimate: **$27.44**, the midpoint of two methods that are 13% apart — a real spread, quoted as a range rather than pretending to a decimal point.

**What the price implies.** Run the DCF backwards and $19.50 requires free cash flow to **shrink 3.0%** a year for five years and then grow at 2.0%. Harborline grew revenue 5.6% and per-share earnings faster still. You do not have to believe in growth to own this; you only have to believe the chain does not slowly liquidate.

**The decision.** Discount to the central estimate is **28.9%**, against the 25% the strategy document requires. Buy-below price: **$20.58**. Small position — item 6 is unresolved and the equity multiplier is doing a third of the work in that 16.1% ROE.

**What would change the answer.** Gross margin below 24%; inventory days above 45; net debt rising while stores are not being added; the share count flat for two consecutive years, which would mean the cash is going somewhere the owner cannot see.`,
    },
  ],
}
