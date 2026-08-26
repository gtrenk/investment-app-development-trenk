// ─── Case 4 — Earnings Quality Detective ─────────────────────────────────────
// Brightway Retail, FY2023 and FY2024.
//
// The red-flag case. Brightway already exists in the drill set as the company
// where every warning sign is switched on at once; the prior-year snapshot is
// what makes those signs *readable*, because almost every earnings-quality flag
// is a trend rather than a level. One year of 172.9 inventory days is a fact
// about retail. Two years of 141.7 becoming 172.9 while sales grow 5.1% is a
// finding.
//
// Every figure is recomputed from companies.json in tests/cases.test.ts.

import type { CaseStudy } from '@core/types'

const FY24 = 'brightway-retail'
const FY23 = 'brightway-retail-fy2023'
const BOTH = [FY23, FY24]

export const CASE_4: CaseStudy = {
  id: 'c4',
  title: 'Earnings Quality Detective',
  blurb: 'The profit is reported. The cash is not. Find out where it went.',
  company: FY24,
  intro: `**Brightway Retail** reported a profit last year: $100M of net income on $6,200M of revenue, and $1.25 of earnings per share.

It also collected **$22M** of cash from operations.

Those two numbers describe the same twelve months. This case is about the distance between them — where it came from, whether it is temporary, and what the balance sheet says about how long the company can afford it.

You are not being asked whether the shares are cheap. You are being asked whether the earnings are real.`,
  verdict: {
    md: `**Pass — and it is a veto, not a judgement.** Cash from operations fell **89.7%** to $22M while reported profit stayed positive; inventory grew **30.3%** on **5.1%** more sales; receivables grew **40.0%**. Cash conversion went from **1.11×** to **0.22×** in one year.

Two of the five Unit 13 red-flag vetoes are lit: earnings that are not converting to cash, and a balance sheet with **$2,350M** of goodwill against **$950M** of equity — tangible book value of **−$1,400M** — carrying interest cover of **1.25×**. A veto is not weighed against anything else. There is no price at which this is analysed further.`,
    checklistScore: 0,
  },
  steps: [
    {
      kind: 'read',
      statementIds: BOTH,
      md: `## Where the cash went

Two years of Brightway are above. Start with the income statement and the story is dull but not alarming: revenue up **5.1%** from $5,900M to $6,200M, gross margin slipping from 38.0% to 37.0%, operating margin from 12.0% to 10.0%. Interest expense of $496M eats most of what is left, and $100M survives.

Now the cash flow statement, and the story stops being dull.

| | FY2023 | FY2024 |
|---|---|---|
| Net income | $192M | $100M |
| Cash from operations | $214M | **$22M** |
| Capital expenditure | $165M | $140M |
| Free cash flow | $49M | **−$118M** |

Cash from operations did not decline in proportion to profit. It collapsed. And a collapse in operating cash while the income statement still shows a profit means the difference is sitting on the balance sheet — because that is the only place it can be.

Two balance sheet lines grew much faster than sales. Find them.`,
    },
    {
      kind: 'calc',
      statementIds: [FY24],
      formulaHint: 'Cash conversion = cash from operations ÷ net income',
      item: {
        id: 'c4-q1',
        prompt: 'What was FY2024 cash conversion?',
        choices: ['4.55×', '0.22×', '−1.18×', '1.11×'],
        answerIdx: 1,
        explain: `$22M ÷ $100M = **0.22×**. Twenty-two cents of cash for every dollar of reported profit. The checklist wants at least 1.0× on a three-year average.

4.55× is the ratio inverted. −1.18× uses free cash flow rather than operating cash flow — a fair question, and an even worse answer, but not this ratio. 1.11× is the prior year, which is the next step.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [FY23],
      formulaHint: 'Cash conversion = cash from operations ÷ net income, FY2023 column',
      item: {
        id: 'c4-q2',
        prompt: 'And FY2023?',
        choices: ['0.90×', '1.11×', '0.26×', '0.22×'],
        answerIdx: 1,
        explain: `$214M ÷ $192M = **1.11×** — an ordinary, healthy figure. A year ago this company converted its profit into cash and a little more.

0.90× is inverted. 0.26× uses free cash flow. 0.22× is this year's.

**1.11× to 0.22× in twelve months.** That is not a level, it is an event, and one year of statements would have shown you only the level.`,
      },
    },
    {
      kind: 'question',
      statementIds: BOTH,
      item: {
        id: 'c4-q3',
        prompt: 'Cash conversion falling from 1.11× to 0.22× in one year tells you what, mechanically?',
        choices: [
          'Profits were overstated by an accounting fraud',
          'Depreciation fell sharply, so less non-cash expense was added back',
          '$78M of what the income statement recognised as profit never arrived as cash, so something on the balance sheet absorbed it — and the balance sheet has to show what',
          'The company paid an unusually large tax bill during the year',
        ],
        answerIdx: 2,
        explain: `Cash from operations is net income plus non-cash charges plus or minus the change in working capital. Profit stayed positive; the cash did not appear; so something on the balance sheet grew and swallowed it. That is arithmetic, not an accusation.

Fraud is a possible explanation but never the first one, and nothing here demonstrates it. Depreciation is not disclosed separately in these statements and would have to move by an implausible amount. Taxes were $24M.

The point of this ratio is that it turns a vague unease into a **specific place to look**: the current-asset lines. Two of them are about to explain the whole gap.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [FY24],
      formulaHint: 'Days inventory = 365 ÷ (COGS ÷ inventory)',
      item: {
        id: 'c4-q4',
        prompt: 'How many days of stock is Brightway carrying in FY2024?',
        choices: ['108.9 days', '141.7 days', '172.9 days', '12.4 days'],
        answerIdx: 2,
        explain: `Inventory turnover is $3,906M ÷ $1,850M = 2.11×, so 365 ÷ 2.11 = **172.9 days**. Nearly six months of merchandise sitting in stores and warehouses.

108.9 days divides by revenue rather than cost of revenue and flatters the figure by the whole gross margin. 141.7 days is the FY2023 reading. 12.4 days is the receivable collection period.

Compare with the grocer in Case 1, at 35.9 days. Retail formats differ, but the number that matters is the direction: 141.7 → 172.9 in a year when sales grew 5.1%.`,
      },
    },
    {
      kind: 'calc',
      statementIds: BOTH,
      formulaHint: 'Inventory growth = (FY2024 inventory ÷ FY2023 inventory) − 1',
      item: {
        id: 'c4-q5',
        prompt: 'By how much did inventory grow, against 5.1% revenue growth?',
        choices: ['+5.1%', '+30.3%', '+40.0%', '−23.2%'],
        answerIdx: 1,
        explain: `$1,850M ÷ $1,420M − 1 = **+30.3%**, six times the rate revenue grew. That $430M of extra stock is cash that left the company and has not come back.

+5.1% is the revenue growth it should be compared against. +40.0% is the *receivables* growth — also true, also alarming, and the second half of the gap. −23.2% is the ratio inverted.

$430M of inventory plus $60M of receivables is $490M of working capital absorbed in a year where net income was $100M.`,
      },
    },
    {
      kind: 'question',
      statementIds: BOTH,
      item: {
        id: 'c4-q6',
        prompt:
          'Inventory grew 30.3% and receivables 40.0% on 5.1% more sales, while gross margin fell from 38.0% to 37.0%. What is the most likely reading?',
        choices: [
          'A deliberate pre-launch build ahead of a new range, which will unwind next year',
          'Merchandise is not selling at the price it was bought to sell at, and sales are increasingly being made on credit — both of which usually precede markdowns that have not yet been taken',
          'Suppliers extended better terms, allowing the company to hold more stock cheaply',
          'A seasonal effect: the fiscal year ended before the peak selling period',
        ],
        answerIdx: 1,
        explain: `Any single one of these lines has an innocent explanation. All four moving the same way at once — stock up 30.3%, receivables up 40.0%, gross margin down a point, cash conversion down to 0.22× — is a pattern, and the pattern has a name: goods bought for a demand that did not arrive.

Why it matters beyond this year: inventory is carried at cost until it is written down. Stock that will eventually be cleared at 40% off is still sitting in the balance sheet at full cost today, which means **next year's** gross margin has a markdown in it that this year's statements have not yet recognised.

A pre-launch build is a real thing and would be described in the MD&A; better supplier terms would show in payables, not in inventory; a seasonal effect would have been there last year too.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [FY24],
      formulaHint: 'Tangible book value = shareholders’ equity − goodwill',
      item: {
        id: 'c4-q7',
        prompt: 'What is Brightway’s tangible book value?',
        choices: ['$950M', '$3,300M', '−$1,450M', '−$1,400M'],
        answerIdx: 3,
        explain: `$950M of equity less $2,350M of goodwill = **−$1,400M**. Strip out the premium paid for past acquisitions and the balance sheet is $1,400M in the hole.

$950M is the reported equity, which is the number the goodwill is hiding inside. $3,300M *adds* the goodwill. −$1,450M is FY2023 — and note that it barely moved, because goodwill is not amortised: it sits at cost until somebody decides it is impaired.

Goodwill is **40.5%** of total assets here. That is the cushion the lenders are relying on, and it is made of an opinion about acquisitions made years ago.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [FY24],
      formulaHint: 'Interest coverage = operating income ÷ interest expense',
      item: {
        id: 'c4-q8',
        prompt: 'How well is the interest bill covered?',
        choices: ['0.20×', '4.63×', '1.25×', '1.51×'],
        answerIdx: 2,
        explain: `$620M ÷ $496M = **1.25×**, down from $708M ÷ $468M = 1.51× a year ago. The checklist wants above 4×.

0.20× uses net income — after the interest has already been paid. 4.63× uses gross profit, before the $1,674M cost of running the stores. 1.51× is last year's.

Put the three findings together. Operating income covers interest 1.25 times; the markdowns implied by 172.9 days of stock have not been taken yet; and if they are, operating income falls and that 1.25× goes below 1.0×.`,
      },
    },
    {
      kind: 'question',
      statementIds: BOTH,
      item: {
        id: 'c4-q9',
        prompt:
          'The Unit 13 checklist keeps five red-flag vetoes — conditions that stop the process regardless of score. Which one does Brightway trip most clearly?',
        choices: [
          'The strongest argument for the thesis is that the price has gone up',
          'The business model cannot be explained in three sentences',
          'Cash from operations below net income while receivables grow faster than revenue — earnings that are not cash',
          'An auditor resignation or a restatement',
        ],
        answerIdx: 2,
        explain: `The veto is written as: *CFO below net income for three consecutive years with receivables growing faster than revenue.* Brightway shows one such year, not three — but it shows the sharpest possible version of it, with receivables growing 40.0% on 5.1% more sales and conversion at 0.22×, and a second flag (tangible book value of −$1,400M against 1.25× interest cover) that the leverage veto covers.

The mechanism of a veto is what matters here. Brightway is not a low score to be weighed against a low price. A scored checklist has one fatal failure mode: a high total drowning a single disqualifying fact. Vetoes exist to stop that, and they are not traded off against anything.

Retail is easy to explain and there is no auditor event in these statements — the other options describe real vetoes that this company does not trip.`,
      },
    },
    {
      kind: 'thesis',
      prompts: [
        'Write the three sentences you would send a colleague who asks "what is wrong with Brightway?"',
        'Name the one disclosure you would read next, and what answer would make you drop the concern.',
        'Suppose the shares halve tomorrow. Does anything in your analysis change? Say why or why not.',
      ],
    },
    {
      kind: 'read',
      statementIds: BOTH,
      md: `## The model analysis

**The business.** A leveraged retail chain: $6,200M of revenue at a 37.0% gross margin, assembled partly by acquisition — $2,350M of the $5,800M balance sheet is goodwill — and financed with $3,400M of long-term debt against $950M of equity.

**What the two years show.**

| | FY2023 | FY2024 | Direction |
|---|---|---|---|
| Revenue | $5,900M | $6,200M | +5.1% |
| Gross margin | 38.0% | 37.0% | eroding |
| Operating margin | 12.0% | 10.0% | eroding |
| Net income | $192M | $100M | −47.9% |
| Cash from operations | $214M | $22M | **−89.7%** |
| Cash conversion | 1.11× | **0.22×** | collapsed |
| Inventory | $1,420M | $1,850M | **+30.3%** |
| Days inventory | 141.7 | **172.9** | +31 days |
| Receivables | $150M | $210M | **+40.0%** |
| Days sales outstanding | 9.3 days | 12.4 days | +3 days |
| Interest coverage | 1.51× | **1.25×** | falling |
| Tangible book value | −$1,450M | −$1,400M | negative throughout |
| Free cash flow | $49M | **−$118M** | negative |

**The checklist (Unit 5).** One item is worth stating precisely rather than waving through: return on invested capital is NOPAT $500M ÷ invested capital $4,255M = **11.8%**, against a cost of capital near 9.0%. That is a positive spread — but at **+2.8 points** it is under the +3 the checklist asks for, and it is computed on an operating income that has markdowns still to come.

| # | Test | Reading | Score |
|---|---|---|---|
| 1 | Gross margin | 38.0% → 37.0% | **Fail** |
| 2 | Operating margin | 12.0% → 10.0% | **Fail** |
| 3 | ROE, DuPont | 10.5% on a 6.11× equity multiplier | **Fail** |
| 4 | ROIC vs WACC | 11.8% vs 9.0% — a +2.8 point spread | **Watch** |
| 5 | Liquidity | Current ratio 1.52×, but quick ratio 0.21× | **Watch** |
| 6 | Leverage | Net debt $3,305M = 5.33× operating income | **Fail** |
| 7 | Interest coverage | 1.25× | **Fail** |
| 8 | Cash conversion | 0.22× | **Fail** |
| 9 | Working-capital trend | Inventory and receivables both diverging from sales | **Fail** |
| 10 | Per-share growth | EPS $2.43 → $1.25 | **Fail** |

**Score: 0 pass, 2 watch, 8 fail — and the score is not the point.**

**The vetoes.** Two of the five in the Unit 13 list are lit:

1. **Earnings that are not cash.** Conversion at 0.22× with receivables growing 40.0% against 5.1% revenue growth. The formal veto asks for three consecutive years; one year this severe is a stop-and-investigate, and the investigation is what items 9 and 10 above already did.
2. **Existential balance-sheet risk.** Interest covered 1.25×, free cash flow negative, and the only equity cushion is $2,350M of goodwill that would vanish on a single impairment test.

A veto is not weighed against the score, and it is certainly not weighed against the price. There is no multiple at which the next question gets asked.

**Where the cash actually went.** $430M into inventory and $60M into receivables — $490M of working capital, against $100M of reported profit. The stock is carried at cost, so the loss it represents has not yet been recognised; when it is, gross margin falls again and interest coverage goes through 1.0×.

**The decision: pass, on the veto.** If you want to keep watching it out of interest, the disclosures that would settle the case are the inventory ageing and reserve footnote, the allowance for credit losses, and the goodwill impairment test's headroom disclosure. But a watchlist entry is not a position, and this one does not become a position because the price falls.`,
    },
  ],
}
