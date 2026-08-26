// ─── Case 6 — The Final Memo ─────────────────────────────────────────────────
// Maison Rivelle, FY2024. The capstone.
//
// Everything the five earlier cases practised in isolation, run once end to end
// on a company that is genuinely excellent: the ten-point checklist scored
// item by item, the valuation triangulated, the decision written down, and — the
// step people skip — the position actually sized under the Unit 11 rules.
//
// The verdict is deliberately not a buy. A learner who finishes six cases and
// has bought five companies has learned the wrong lesson; the common outcome of
// good analysis is a written price and the patience to wait for it.
//
// Every figure is recomputed in tests/cases.test.ts.

import type { CaseStudy } from '@core/types'

const CO = 'maison-rivelle'

export const CASE_6: CaseStudy = {
  id: 'c6',
  title: 'The Final Memo',
  blurb: 'Score the checklist, value it, size it, write it down. The whole process, once.',
  company: CO,
  intro: `**Maison Rivelle** makes leather goods and jewellery under a name that has been on shopfronts since 1874. It is, on the numbers, one of the best businesses in this entire course: a 70.0% gross margin, a 28.0% operating margin, $2,500M of net cash, and interest covered fifty-six times over.

This is the capstone. You will run the full ten-point checklist, triangulate a value three ways, reach a verdict, and then do the step almost everybody skips — **size the position under your own risk rules**, in shares, with a written invalidation price.

The finished output is a memo. Not a feeling about a company, and not a number in a spreadsheet: a page you could hand to somebody else, and that your future self can be held to.`,
  verdict: {
    md: `**Watch — an outstanding business at approximately its worth.** Eight of ten checklist items pass, return on invested capital is **37.2%** against an 8.0% cost of capital, and the valuation triangle lands at **$186.84** (DCF), **$179.36** (peer EV/EBIT) and **$188.10** (peer P/E) against a **$178.00** price. A **4.7%** discount, against the 25% the strategy document requires.

Buy-below price **$140.13**. At $140.00 with invalidation at $126.00, a 1% risk rule on a $50,000 account buys **35 shares** — $4,900, **9.8%** of the portfolio, $490 at risk. Written down now, so the decision does not have to be made in the middle of whatever causes the price to fall.`,
    checklistScore: 8,
  },
  steps: [
    {
      kind: 'read',
      statementIds: [CO],
      md: `## The business, in three sentences

Maison Rivelle designs and sells leather goods, jewellery and fragrance through 210 directly-operated boutiques and a website. It buys hides and gemstones, employs artisans, and sells the result for roughly three and a half times what the materials and labour cost — the gap being a brand that customers have been taught over a century and a half to treat as a store of value rather than a purchase.

A customer leaves when the brand stops signalling what they wanted it to signal, which is a slow process, or when the company chases volume by discounting, which is a fast one.

That is the whole model. Now read the statements above and notice that they say the same thing in numbers: **$11,000M** of revenue, **$3,300M** of cost of revenue, and **$2,900M** of inventory sitting on the balance sheet — nearly a year of stock, because the goods are not perishable and the company would rather warehouse a handbag than mark it down.`,
    },
    {
      kind: 'calc',
      statementIds: [CO],
      formulaHint: 'Operating margin = operating income ÷ revenue',
      item: {
        id: 'c6-q1',
        prompt: 'Checklist item 2 — what is the operating margin?',
        choices: ['70.0%', '28.0%', '20.9%', '42.0%'],
        answerIdx: 1,
        explain: `$3,080M ÷ $11,000M = **28.0%**, against a luxury peer median nearer 19%. This is item 2 of the checklist, and it passes comfortably.

70.0% is the gross margin. 20.9% is the net margin, after $726M of tax. 42.0% is operating expenses ÷ revenue — the cost of the boutiques, the advertising and the artisans, which is where 42 of the 70 points of gross margin go.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [CO],
      formulaHint: 'Return on equity = net income ÷ equity. DuPont: net margin × asset turnover × equity multiplier.',
      item: {
        id: 'c6-q2',
        prompt: 'Checklist item 3 — return on equity, and is it earned or borrowed?',
        choices: ['18.4%', '31.9%', '26.1%', '20.9%'],
        answerIdx: 2,
        explain: `$2,299M ÷ $8,800M = **26.1%**. Decomposed: 20.9% net margin × 0.88× asset turnover × 1.42× equity multiplier.

That 1.42× is the number that answers "earned or borrowed". Compare Case 1's grocer at 3.03× and Case 3's airline at 4.42×. Maison Rivelle's 26.1% comes almost entirely from margin, which is the durable source.

18.4% is the return on assets — the same figure before any leverage at all, and it is remarkable on its own. 31.9% divides by tangible book value; 20.9% is the net margin.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [CO],
      formulaHint:
        'ROIC = NOPAT ÷ invested capital. NOPAT = operating income × (1 − tax rate); invested capital = debt + equity − cash. The effective tax rate here is 24.0%.',
      item: {
        id: 'c6-q3',
        prompt: 'Checklist item 4 — the one that matters most. What is the return on invested capital?',
        choices: ['26.1%', '37.2%', '23.6%', '48.9%'],
        answerIdx: 1,
        explain: `NOPAT = $3,080M × 0.76 = $2,340.8M. Invested capital = $1,100M of debt + $8,800M of equity − $3,600M of cash = **$6,300M**. So $2,340.8M ÷ $6,300M = **37.2%**, against a cost of capital near 8.0% — a spread of **+29.2 points**.

26.1% is the return on equity. 23.6% leaves the $3,600M of cash inside invested capital, which understates how hard the operating assets actually work — idle cash is not employed capital. 48.9% uses pre-tax operating income and ignores the tax the business genuinely pays.

Item 4 is the checklist's most important line and its most skipped. A company can pass everything else and still destroy value by reinvesting below its cost of capital. This one earns nearly five times its cost of capital.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [CO],
      formulaHint: 'Days inventory = 365 ÷ (COGS ÷ inventory)',
      item: {
        id: 'c6-q4',
        prompt: 'Checklist item 9 — how many days of inventory does the company hold?',
        choices: ['96.2 days', '137.5 days', '29.9 days', '320.8 days'],
        answerIdx: 3,
        explain: `Inventory turnover is $3,300M ÷ $2,900M = 1.14×, so 365 ÷ 1.14 = **320.8 days**. Nearly eleven months.

96.2 days divides by revenue instead of cost of revenue — at a 70.0% gross margin that error shrinks the answer by more than two thirds, which is why the rule about using COGS matters most exactly where margins are highest. 137.5 days divides by gross profit. 29.9 days is the receivable collection period.

Against Case 1's grocer at 35.9 days and Case 4's retailer at 172.9, this is the largest inventory position in the course. The next question is whether that is a failure.`,
      },
    },
    {
      kind: 'question',
      statementIds: [CO],
      item: {
        id: 'c6-q5',
        prompt: '320.8 days of inventory. Fail, or feature?',
        choices: [
          'Fail — nearly a year of stock is the same warning Case 4 raised at 172.9 days',
          'Feature — long-lived goods that are never discounted are deliberately warehoused rather than marked down, and the 70.0% gross margin plus 1.15× cash conversion say the stock is not distressed; but it is scored watch, not pass, because it is also where a slowdown would first hide',
          'Neither — inventory days are not meaningful for companies selling through their own boutiques',
          'Feature — high inventory always indicates pricing power',
        ],
        answerIdx: 1,
        explain: `The number alone cannot tell you. What distinguishes this from Brightway in Case 4 is everything *around* it: gross margin at 70.0% and not eroding, cash conversion of 1.15×, free cash flow of $2,030M, and goods that do not go out of fashion in a season.

Brightway's 172.9 days came with a falling margin, receivables growing 40.0%, and cash conversion of 0.22×. Same kind of reading, opposite diagnosis.

It is scored **watch** rather than pass for an honest reason: eleven months of stock is exactly where a demand slowdown would hide for a year before it reached the income statement. A watch is a named question with a named place to look — here, the inventory ageing footnote and the split between raw materials and finished goods.

"Always indicates pricing power" is the answer that has stopped thinking; there is no ratio that always indicates anything.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [CO],
      formulaHint:
        'Owner earnings = free cash flow − stock comp. EV = market cap + debt − cash, at $178.00 on 220M shares.',
      item: {
        id: 'c6-q6',
        prompt: 'At $178.00 a share, what multiple of owner earnings is the market paying?',
        choices: ['18.1×', '18.9×', '17.0×', '11.9×'],
        answerIdx: 1,
        explain: `Market cap 220M × $178.00 = $39,160M; plus $1,100M of debt, less $3,600M of cash, gives an enterprise value of **$36,660M**. Owner earnings are $2,030M of free cash flow less $95M of stock compensation = **$1,935M**. So $36,660M ÷ $1,935M = **18.9×**.

18.1× uses unadjusted free cash flow — and note how little difference it makes here, because stock compensation is only 0.9% of revenue. Case 2's software company moved from 38.3 to 16.3 on the same adjustment; Case 5's chip designer from 22.3× to 47.7×. Here it is a rounding difference, and that is itself a finding about how this company pays people.

17.0× is the P/E. 11.9× is enterprise value over operating income.`,
      },
    },
    {
      kind: 'read',
      statementIds: [CO],
      md: `## The valuation triangle

**Assumptions**, stated so they can be argued with: owner earnings of **$1,935M** growing 8%, 7%, 6%, 5%, 4% and then 2.5% forever; a discount rate of **8.0%** for the checklist's cost-of-capital comparison and **8.5%** in the DCF for the equity holder; $2,500M of net cash added back; 220M shares.

| Method | Value per share |
|---|---|
| DCF on owner earnings | **$186.84** |
| Peers at 12× EV / operating income | **$179.36** |
| Peers at 18× earnings | **$188.10** |
| **Market** | **$178.00** |

Three methods inside a **$179–$188** band. That is unusually tight, and tightness is a signal about the *estimate*, not about the opportunity — it means the company is easy to value, which is exactly what you would expect of a stable, high-margin, low-leverage business.

**Run it backwards.** At $178.00, the reverse DCF implies **4.9%** annual owner-earnings growth for five years. Maison Rivelle has grown revenue in the high single digits and is not obviously slowing. So the market is not being foolish. It is being approximately right.

That is the situation this case exists to teach, because it is the most common one and the least discussed: **a wonderful business, correctly priced.**`,
    },
    {
      kind: 'question',
      statementIds: [CO],
      item: {
        id: 'c6-q7',
        prompt:
          'Eight of ten checklist items pass, zero vetoes, and the price sits 4.7% below a $186.84 central estimate against a 25% margin-of-safety rule. What is the verdict?',
        choices: [
          'Buy — a 4.7% discount on a business this good is as much as the market will ever offer',
          'Buy a half position, since the quality partly substitutes for the margin of safety',
          'Watch, with a written buy-below price of $140.13 and the triggers that would make you re-underwrite before it gets there',
          'Pass permanently — a company trading near fair value is not an investment candidate',
        ],
        answerIdx: 2,
        explain: `A margin of safety is compensation for the width of your own estimate, and it does not shrink because you admire the company. Three methods agreeing within 5% tells you the estimate is *narrow*, which is a reason to trust the central figure — not a reason to lower the discount you require against it.

The half-position answer is the one that feels sophisticated and is not: it converts an explicit rule into a negotiable one, and the negotiation always goes the same direction.

"Pass permanently" throws away the work. The output of good analysis on a fairly-priced great business is a **price**, written down, plus the conditions that would change it. That is what a watchlist is for, and it is why the buy-below number is the deliverable rather than the verdict.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [CO],
      formulaHint:
        'Unit 11: risk $ = capital × risk %. Shares = risk $ ÷ stop distance per share, always rounded down.',
      item: {
        id: 'c6-q8',
        prompt:
          'A $50,000 account with a 1% per-idea risk limit. If the shares reach the $140.00 buy-below level and the thesis is invalidated at $126.00, how many shares?',
        choices: ['3 shares', '35 shares', '357 shares', '71 shares'],
        answerIdx: 1,
        explain: `Risk dollars = $50,000 × 1% = $500. Stop distance = $140.00 − $126.00 = $14.00 per share. $500 ÷ $14.00 = 35.7, rounded **down** to **35 shares**.

That is $4,900 at cost — **9.8%** of the portfolio — with $490 at risk if the invalidation price is reached, or 0.98% of capital. Note the two numbers people constantly conflate: 1% is what being wrong costs, 9.8% is what the position weighs.

3 shares divides the risk dollars by the *price* instead of the stop distance, and would put $420 into a conviction position. 357 shares is a factor-of-ten slip. 71 shares is a 2% risk rule, which is a different rule and not the one written down.`,
      },
    },
    {
      kind: 'thesis',
      prompts: [
        'Section 1 — the business. Three sentences: what is sold, to whom, and why do they come back?',
        'Section 5 — the question the case turns on. Name the one fact that decides this, and where you would look for it.',
        'Sections 6 and 7 — what would change your mind, and what is your decision and size? Give a price, a trigger and a number of shares.',
      ],
    },
    {
      kind: 'read',
      statementIds: [CO],
      md: `## The model memo

**1. The business.** Maison Rivelle sells leather goods, jewellery and fragrance through 210 owned boutiques under a 150-year-old name, at a **70.0%** gross margin. It does not discount, which is why it carries **320.8 days** of inventory, and the refusal to discount is the asset. Customers leave slowly, when the signal stops meaning what they bought it to mean.

**2. Why it might be worth owning.**

| # | Test | Reading | Score |
|---|---|---|---|
| 1 | Gross margin | 70.0%, at the top of the luxury band | **Pass** |
| 2 | Operating margin | 28.0% vs a peer median near 19% | **Pass** |
| 3 | ROE, DuPont | 26.1% = 20.9% × 0.88× × 1.42× | **Pass** |
| 4 | ROIC vs WACC | 37.2% vs 8.0% — a +29.2 point spread | **Pass** |
| 5 | Liquidity | Current ratio 2.96× | **Pass** |
| 6 | Leverage | Net **cash** of $2,500M | **Pass** |
| 7 | Interest coverage | 56.0× | **Pass** |
| 8 | Cash conversion | CFO $2,650M ÷ net income $2,299M = 1.15× | **Pass** |
| 9 | Working capital | Inventory 320.8 days; DSO 29.9 days | **Watch** |
| 10 | Per-share growth | No prior year in this data set | **Watch** |

**Score: 8 pass, 2 watch, 0 vetoes.** Both watches are questions the data cannot answer rather than problems it reveals — which is a materially different thing from Case 4, where two watches sat among eight failures.

**3. My estimate of value.** **$179–$188** a share. DCF on $1,935M of owner earnings growing 8/7/6/5/4% then 2.5%, discounted at 8.5%: **$186.84**. Peers at 12× operating income: **$179.36**. Peers at 18× earnings: **$188.10**. Central estimate **$186.84**, quoted as a range because a point estimate on a fifteen-year cash flow is false precision.

**4. What the price implies.** At **$178.00** the reverse DCF requires **4.9%** annual owner-earnings growth. The company grows revenue faster than that today. The market is not making a mistake here; it is paying roughly what the business is worth, which is what usually happens to businesses this legible.

The discount to the central estimate is **4.7%**, against a 25% requirement. Buy-below price: **$140.13**.

**5. The question the case turns on.** Whether the brand's pricing power survives the next generation of customers. Every number above is a consequence of the 70.0% gross margin, and that margin is a cultural fact before it is a financial one. The place to look: price increases taken over the last five years against volume growth. If prices are rising and units are not falling, the asset is intact.

**6. What would change my mind.** Gross margin below 66%; inventory above 380 days; any discounting programme, including outlet stores; an acquisition above 12× operating income; net cash turning to net debt to fund a buyback.

**7. Decision and size.** **Watch.** Buy-below **$140.13**. At $140.00 with invalidation at $126.00, the Unit 11 arithmetic gives **35 shares** — $4,900 at cost, **9.8%** of a $50,000 portfolio, $490 of risk, or 0.98% of capital. Under the 20% single-position ceiling and inside the 1% per-idea limit. Build in two tranches; reassess on any Section 6 trigger.

---

## What you have just done

You read two statements, computed six figures, judged one of them against its industry rather than against a threshold, valued the company three independent ways, decided the market was right, and wrote down the price at which you would disagree.

That is the whole job. Everything else is repetition — which is the point: the same sequence, run identically on every candidate, so you cannot unconsciously shorten it for a company you already like.`,
    },
  ],
}
