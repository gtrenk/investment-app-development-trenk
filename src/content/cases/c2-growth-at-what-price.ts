// ─── Case 2 — Growth at What Price? ──────────────────────────────────────────
// Cobalt Cloud, FY2023 and FY2024.
//
// The lesson is stock-based compensation, approached the way it actually
// arrives: as a gap between a GAAP loss and positive operating cash that looks,
// at first, like proof the loss is an accounting illusion. It is half an
// illusion. The other half is a 7.8% annual transfer of the company from the
// owners to the staff, and it never appears on the income statement as cash.
//
// Every figure is recomputed from companies.json in tests/cases.test.ts.

import type { CaseStudy } from '@core/types'

const FY24 = 'cobalt-cloud'
const FY23 = 'cobalt-cloud-fy2023'
const BOTH = [FY23, FY24]

export const CASE_2: CaseStudy = {
  id: 'c2',
  title: 'Growth at What Price?',
  blurb: 'A SaaS company losing money on paper and generating cash. Which is true?',
  company: FY24,
  intro: `**Cobalt Cloud** sells subscription software to mid-sized logistics firms. Revenue grew a third last year. It reported a loss. It also generated positive free cash flow.

All three of those are true at once, and the gap between the second and the third is where most of the arguing about software companies happens. This case walks straight into it.

By the end you will have computed what the company's cash generation looks like once the largest non-cash expense is treated as the real cost it eventually becomes — and decided whether $24.00 a share is a price worth paying.`,
  verdict: {
    md: `**Pass — but keep it on the list.** The cash flow is real and the gross margin is rising, but $396M of stock compensation is **22.0%** of revenue, it has been 22.0% for two years, and it converts $90M of reported free cash flow into **−$306M**. Owners were diluted **7.8%** in a single year.

At **2.7×** enterprise value to sales this is not a bubble price for 33.3% growth. It is a fair price for a company whose economics are still being paid for in shares. Watch for stock compensation below 15% of revenue and dilution under 3% a year; either would change the answer.`,
    checklistScore: 3,
  },
  steps: [
    {
      kind: 'read',
      statementIds: BOTH,
      md: `## Two years of a company in a hurry

Revenue went from $1,350M to $1,800M — **33.3%** growth, with no acquisition to explain it.

Now look at what it cost. Operating expenses rose from $1,155M to $1,530M, and the operating line stayed negative both years: a **$156M** loss becoming a **$180M** loss.

Then look at the cash flow statement, and the picture inverts. Cash from operations was **+$145M**. Capital expenditure is trivial for a software business — $55M — so free cash flow was **+$90M**.

A company that lost $200M and generated $90M of cash. The single line that explains most of that gap is sitting at the bottom of the cash flow statement, and it is the largest number on it.`,
    },
    {
      kind: 'calc',
      statementIds: [FY24],
      formulaHint: 'Gross margin = gross profit ÷ revenue',
      item: {
        id: 'c2-q1',
        prompt: "What is Cobalt's FY2024 gross margin, and which way is it moving?",
        choices: ['25.0%', '74.0%', '75.0%, up from FY2023', '−10.0%'],
        answerIdx: 2,
        explain: `$1,350M ÷ $1,800M = **75.0%**, against $999M ÷ $1,350M = 74.0% the year before. Rising gross margin while revenue grows a third is the single most encouraging fact in these statements: the incremental customer is not costing more to serve.

25.0% is cost of revenue ÷ revenue. 74.0% is last year's. −10.0% is the operating margin, which is a statement about spending, not about the product.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [FY24],
      formulaHint: 'Stock compensation intensity = stock-based comp ÷ revenue',
      item: {
        id: 'c2-q2',
        prompt: 'Stock-based compensation was $396M. How large is that against revenue?',
        choices: ['22.0%', '273.1%', '14.1%', '−198.0%'],
        answerIdx: 0,
        explain: `$396M ÷ $1,800M = **22.0%**. In FY2023 it was $297M ÷ $1,350M — also 22.0%. This is not a one-off grant vesting; it is the company's standing pay structure.

273.1% is stock comp ÷ cash from operations, which is a striking figure but answers a different question. 14.1% divides by total assets. −198.0% divides by the net loss, and a ratio with a negative denominator will mislead you in a new way every year.

For scale: the grocer in Case 1 spent 0.2% of revenue on stock compensation.`,
      },
    },
    {
      kind: 'question',
      statementIds: [FY24],
      item: {
        id: 'c2-q3',
        prompt:
          'Cobalt reports a $200M net loss and $145M of cash from operations. What accounts for most of that $345M gap?',
        choices: [
          'Customers prepaying for subscriptions, which is deferred revenue rather than profit',
          'The $396M of stock-based compensation: a real expense on the income statement that costs the company no cash, so it is added straight back in the cash flow statement',
          'Capitalised software development, which moves cost off the income statement',
          'The $8M tax charge, which was accrued but not paid',
        ],
        answerIdx: 1,
        explain: `Stock compensation is charged against profit and settled in newly issued shares, so the cash flow statement adds it back. $396M added back to a $200M loss is most of the way to $145M of operating cash on its own.

Deferred revenue and capitalised development are real mechanisms and worth checking in the footnotes, but nothing on this scale. The tax charge is a rounding error.

The conclusion people draw next is the trap: "so the loss is not real". The expense is entirely real — it is simply paid in ownership rather than in cash, which makes it invisible to every cash-based metric and visible only in the share count.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [FY24],
      formulaHint: 'Free cash flow margin = free cash flow ÷ revenue',
      item: {
        id: 'c2-q4',
        prompt: 'What is the FY2024 free cash flow margin as reported?',
        choices: ['8.1%', '1.1%', '−11.1%', '5.0%'],
        answerIdx: 3,
        explain: `$90M ÷ $1,800M = **5.0%**, up from $15M ÷ $1,350M = 1.1% in FY2023. On the rule-of-40 arithmetic that many software investors use — revenue growth plus free cash flow margin — Cobalt scores 33.3 + 5.0 = **38.3**, just under the line.

8.1% uses cash from operations and forgets the $55M of capital expenditure. 1.1% is last year. −11.1% is the net margin, which is the GAAP answer to a cash question.

Hold on to 38.3. The next step recomputes it.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [FY24],
      formulaHint: 'Owner free cash flow = free cash flow − stock-based compensation',
      item: {
        id: 'c2-q5',
        prompt:
          'Treat stock compensation as the cost it eventually becomes. What is free cash flow after subtracting it?',
        choices: ['−$306M', '$486M', '−$251M', '$90M'],
        answerIdx: 0,
        explain: `$90M − $396M = **−$306M**, a margin of −17.0%. The rule-of-40 score goes from 38.3 to 33.3 − 17.0 = **16.3**.

$486M *adds* stock compensation, which double-counts an add-back the cash flow statement already made. −$251M subtracts it from cash from operations and forgets capital expenditure. $90M is the unadjusted figure.

Why subtract it at all, when no cash leaves? Because the alternative to paying in shares is paying in salary, and a company that stopped granting stock would have to raise cash pay or lose the staff. Unit 7 calls the result owner earnings: what the business would generate if the owners' stake were not being diluted to fund it.`,
      },
    },
    {
      kind: 'calc',
      statementIds: BOTH,
      formulaHint: 'Dilution = (FY2024 shares ÷ FY2023 shares) − 1',
      item: {
        id: 'c2-q6',
        prompt: 'By how much did the diluted share count grow over the year?',
        choices: ['+18.0%', '+7.8%', '−7.2%', '+33.3%'],
        answerIdx: 1,
        explain: `250M ÷ 232M − 1 = **+7.8%**. An owner who bought at the start of the year and did nothing owns 7.2% less of the company than they did.

+18.0% mistakes the 18 million new *shares* for a percentage. −7.2% is the ratio inverted — the right number with the wrong sign and the wrong meaning. +33.3% is revenue growth.

Set it against Case 1, where the grocer *retired* 2.9% of its shares. Two businesses, opposite directions, and the difference lands directly in per-share value.`,
      },
    },
    {
      kind: 'question',
      statementIds: BOTH,
      item: {
        id: 'c2-q7',
        prompt:
          "Cobalt's cash went from $1,180M to $1,450M — a $270M increase — while free cash flow was $90M. What is the honest reading?",
        choices: [
          'Free cash flow was understated; the balance sheet is the more reliable record',
          'The company earned interest on its cash pile, which is excluded from free cash flow',
          'Roughly $180M of the increase came from somewhere other than the business — most plausibly shares issued on option exercises, which is the same dilution seen in the share count',
          'The difference is a timing effect that reverses next year',
        ],
        answerIdx: 2,
        explain: `A rising cash balance feels like proof of self-funding, and it is one of the easiest things in a filing to misread. Cash can rise because the business generated it, because debt was raised, or because shares were sold — and only the first is the company paying for itself.

Long-term debt is unchanged at $300M, so borrowing is not the answer. The share count rose 7.8%. Interest income is real but nowhere near $180M on a $1.2–1.5 billion balance at any plausible rate.

The habit worth taking away: **never read the cash balance without reading the share count next to it.**`,
      },
    },
    {
      kind: 'calc',
      statementIds: [FY24],
      formulaHint:
        'Enterprise value = market cap + long-term debt − cash. At $24.00 a share on 250M shares, market cap is $6,000M.',
      item: {
        id: 'c2-q8',
        prompt: 'At $24.00 a share, what is Cobalt trading at on enterprise value to sales?',
        choices: ['3.3×', '2.7×', '4.0×', '0.4×'],
        answerIdx: 1,
        explain: `Market cap $6,000M, plus $300M of debt, less $1,450M of cash = enterprise value **$4,850M**. Divided by $1,800M of revenue: **2.7×**.

3.3× uses market capitalisation and ignores $1,150M of net cash the buyer effectively gets back. 4.0× *adds* the net cash instead of subtracting it. 0.4× is the ratio inverted.

The net cash matters here more than usual: it is 19% of the market value, and a loss-making company's cash pile is also its runway.`,
      },
    },
    {
      kind: 'thesis',
      prompts: [
        'In three sentences: what does Cobalt sell, to whom, and why would a customer stay?',
        'Is the $200M loss real? Write the argument for both sides, then say which you believe.',
        'At $24.00, buy, pass or watch — and name the one number you would track each quarter to test it.',
      ],
    },
    {
      kind: 'read',
      statementIds: BOTH,
      md: `## The model analysis

**The business.** Subscription logistics software. A **75.0%** gross margin rising from 74.0%, revenue up **33.3%**, and a customer base that appears to be sticky enough that the incremental sale is cheaper than the last one. Receivables at 77.1 days are worth watching — up from 74.4 days — but for enterprise software that is ordinary.

**The checklist (Unit 5).** Applied honestly, an early-stage growth company fails items it is *supposed* to fail, and the u05 note says so: judge the path to positive returns rather than the current reading.

| # | Test | Reading | Score |
|---|---|---|---|
| 1 | Gross margin | 74.0% → 75.0% | **Pass** |
| 2 | Operating margin | −11.6% → −10.0% — improving, still negative | **Fail** |
| 3 | ROE | −12.5% | **Fail** |
| 4 | ROIC vs WACC | NOPAT is negative; no spread exists | **Fail** |
| 5 | Liquidity | Current ratio 2.17× | **Pass** |
| 6 | Leverage | Net **cash** of $1,150M | **Pass** |
| 7 | Interest coverage | No operating income to cover with | **Fail** |
| 8 | Cash quality | $90M of free cash flow against a $200M loss | **Watch** |
| 9 | Receivable days | 74.4 → 77.1 days | **Watch** |
| 10 | Per-share growth | Shares +7.8% | **Fail** |

**Score: 3 pass, 2 watch, 5 fail.** That is not a verdict — it is a description of a company that has not finished being built. What it does establish is that nothing in the financial-health half of the checklist can carry the case. The entire argument has to be about unit economics and the path to a positive return on capital.

**The number that decides it.** Stock compensation at **22.0%** of revenue in both years, converting **$90M** of reported free cash flow into **−$306M** of owner free cash flow and a rule-of-40 score of **16.3** rather than 38.3.

The company is not lying. Every figure is in the filing. But the two ways of describing it lead to opposite conclusions, and only one of them is what an owner receives.

**The valuation.** At **$24.00**, enterprise value is **$4,850M** and the sales multiple **2.7×**. For 33.3% growth at a 75.0% gross margin that is not expensive; software at this growth rate has traded at three times the figure. The problem is not the multiple. The problem is that the denominator of every cash-based multiple is negative once compensation is paid for honestly, so the sales multiple is the only one that can be quoted at all — and a sales multiple is a promise, not a measurement.

**The decision: pass, and put it on the watchlist.** Two triggers would change it:

1. Stock compensation below **15%** of revenue, sustained for two years.
2. Dilution below **3%** a year, which is the point at which growth starts reaching the owner rather than the payroll.

**What would take it off the list entirely.** Gross margin falling below 70%; receivable days above 90; revenue growth below 20% while stock compensation stays at 22.0%, which would mean the shares are buying effort that no longer produces growth.`,
    },
  ],
}
