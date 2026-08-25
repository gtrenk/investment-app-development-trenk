import type { Unit } from '@core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Unit 03 — The Income Statement
// The first of the three statements. Everything from revenue down to EPS,
// walked on one running example: Cascade Coffee Co. (fictional, CASC).
// The same company's balance sheet and cash flows continue in Unit 04.
// ─────────────────────────────────────────────────────────────────────────────

export const u03: Unit = {
  id: 'u03',
  title: 'The Income Statement',
  order: 3,
  description:
    'Read a company\'s profit story line by line — revenue, margins, operating leverage, EBITDA, taxes and EPS — using one running example you will meet again in every later unit.',
  unlockAfter: 'u02',
  lessons: [
    // ── L01 ───────────────────────────────────────────────────────────────
    {
      id: 'u03-l01',
      unitId: 'u03',
      order: 1,
      title: 'Anatomy of an Income Statement',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `The **income statement** (also called the *profit and loss statement*, or P&L) answers one question: **over a period of time, did this business make money?**

That phrase *over a period of time* is the part people skip. An income statement always covers a span — a quarter, a year — never a moment. It is a video, not a photograph. The balance sheet in Unit 4 is the photograph.`,
        },
        {
          kind: 'text',
          md: `The statement is a **ladder**. You start with everything the company sold and subtract costs in order of how directly they relate to the product:

1. **Revenue** (the "top line") — what customers were billed for goods and services delivered.
2. − **Cost of goods sold (COGS)** — the direct cost of the things that were sold.
3. = **Gross profit** — what's left to run the rest of the company.
4. − **Operating expenses** — selling, general & administrative (SG&A), research & development (R&D), depreciation & amortization (D&A).
5. = **Operating income** (also **EBIT**) — profit from actually running the business.
6. − **Interest** and − **taxes** — the cost of the balance sheet and the cost of government.
7. = **Net income** (the "bottom line") — what belongs to shareholders.

Each rung answers a different question. Skipping to net income throws away most of the information.`,
        },
        {
          kind: 'example',
          md: `**Meet Cascade Coffee Co. (ticker CASC).** A fictional roaster and café chain we will use for the rest of this unit and all of Unit 4. Fiscal year 2024, in millions of dollars:

| Line | FY2024 |
|---|---|
| Revenue | $500.0 |
| Cost of goods sold | (300.0) |
| **Gross profit** | **200.0** |
| Selling, general & administrative | (120.0) |
| Research & development | (15.0) |
| Depreciation & amortization | (25.0) |
| **Total operating expenses** | **(160.0)** |
| **Operating income (EBIT)** | **40.0** |
| Interest expense | (10.0) |
| **Pre-tax income** | **30.0** |
| Income tax expense | (7.5) |
| **Net income** | **22.5** |

Read the ladder out loud: Cascade sold **$500.0M** of coffee, the beans and packaging in it cost **$300.0M**, running the company cost another **$160.0M**, lenders took **$10.0M**, the tax authority took **$7.5M**, and shareholders were left with **$22.5M** — **4.5 cents of every sales dollar**.`,
        },
        {
          kind: 'callout',
          md: `**The misconception that causes the most damage: profit is not cash.**

Cascade's $22.5M of net income is not $22.5M that arrived in the bank. Revenue is booked when coffee is *delivered*, not when the customer *pays*. Depreciation is subtracted even though no cash moved this year. Building new cafés costs cash but never appears as an expense.

Cascade's actual cash from operations in FY2024 was **$44.0M** — nearly double net income — and after building stores, the cash truly left over was **$9.0M**. All three numbers are correct and all three mean different things. Unit 4 reconciles them.`,
        },
        {
          kind: 'keypoint',
          md: `The income statement covers a *period* and descends a ladder: revenue → gross profit → operating income → net income. Each rung isolates a different kind of cost, and net income is an accrual figure, not cash.`,
        },
      ],
      quiz: [
        {
          id: 'u03-l01-q1',
          prompt:
            'Cascade Coffee reports revenue of $500.0M and cost of goods sold of $300.0M. What is gross profit?',
          choices: ['$300 million', '$200 million', '$160 million', '$40 million'],
          answerIdx: 1,
          explain:
            'Gross profit = revenue − COGS = $500.0M − $300.0M = $200.0M. The $160M answer is total operating expenses and $40M is operating income — both sit further down the ladder. Getting the rungs in order matters, because each one is compared against different peers: gross profit tests the product, operating income tests the whole company.',
        },
        {
          id: 'u03-l01-q2',
          prompt: 'What does an income statement describe?',
          choices: [
            'A snapshot of what the company owns and owes on one specific date',
            'The cash sitting in the company\'s bank accounts at year end',
            'The market value investors place on the company as of the reporting date',
            'Performance over a period of time — typically a quarter or a fiscal year',
          ],
          answerIdx: 3,
          explain:
            'An income statement always spans a period. The "snapshot on one date" answer describes the **balance sheet**, which is the single most common mix-up between the two statements. Period-versus-instant is also why you never add a balance sheet figure to an income statement figure without thinking — one is a flow, the other a level.',
        },
        {
          id: 'u03-l01-q3',
          prompt: 'Which line is conventionally called "the bottom line"?',
          choices: ['Net income', 'Operating income', 'Gross profit', 'Revenue'],
          answerIdx: 0,
          explain:
            'Net income is literally the last line of the statement, after interest and taxes. Revenue is the *top* line — the two phrases get swapped constantly in casual conversation. Note that "bottom line" being last does not make it most informative: it is the line most easily distorted by one-time items, tax quirks, and financing choices.',
        },
        {
          id: 'u03-l01-q4',
          prompt:
            'Cascade has gross profit of $200.0M and total operating expenses of $160.0M. What is operating income?',
          choices: ['$200 million', '$65 million', '$40 million', '$22.5 million'],
          answerIdx: 2,
          explain:
            '$200.0M − $160.0M = $40.0M. The $65M distractor is EBITDA (operating income plus the $25M of D&A) and $22.5M is net income after interest and tax. Three different "profit" numbers for the same year is normal — which is exactly why you have to name the one you mean.',
        },
        {
          id: 'u03-l01-q5',
          prompt: 'Cascade reports $22.5M of net income. What can you conclude about its cash?',
          choices: [
            'Its bank balance increased by exactly $22.5 million',
            'Very little — net income is an accrual figure and can differ sharply from cash actually generated',
            'Cash flow must be lower than $22.5 million because of depreciation',
            'Net income is only recorded once the cash has been collected',
          ],
          answerIdx: 1,
          explain:
            'Revenue is recognised on delivery, non-cash charges like depreciation are subtracted, and cash spent building stores never touches the income statement — so profit and cash routinely diverge. Cascade actually generated $44.0M of operating cash on $22.5M of profit. The "must be lower because of depreciation" answer gets the direction backwards: adding depreciation back usually pushes operating cash *above* net income.',
        },
      ],
      cardSeeds: [
        {
          id: 'u03-l01-c1',
          kind: 'basic',
          front: 'What does the income statement measure, and over what span?',
          back: 'Profitability over a period of time (a quarter or a year) — a flow, not a snapshot. It runs from revenue down to net income.',
        },
        {
          id: 'u03-l01-c2',
          kind: 'basic',
          front: 'The income statement ladder, in order',
          back: 'Revenue − COGS = gross profit − operating expenses (SG&A, R&D, D&A) = operating income (EBIT) − interest − taxes = net income.',
        },
        {
          id: 'u03-l01-c3',
          kind: 'cloze',
          front: 'Revenue is the ____ line; net income is the ____ line.',
          back: 'top; bottom',
        },
        {
          id: 'u03-l01-c4',
          kind: 'basic',
          front: 'Why is net income not the same as cash generated?',
          back: 'Accrual accounting books revenue on delivery (not payment), subtracts non-cash charges like depreciation, and ignores capital spending. Profit and cash routinely differ in both directions.',
        },
      ],
    },

    // ── L02 ───────────────────────────────────────────────────────────────
    {
      id: 'u03-l02',
      unitId: 'u03',
      order: 2,
      title: 'Revenue: The Top Line',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**Revenue** is the value of goods and services a company *delivered* during the period, whether or not the customer has paid yet. That timing rule is called **revenue recognition**, and it is where a surprising amount of accounting mischief lives.

The modern standard (ASC 606) asks a simple question: has the company transferred **control** of what it promised? If Cascade ships $100,000 of beans on 30-day terms, revenue is recorded today and an **account receivable** is created. If a customer prepays $100,000 for beans not yet roasted, no revenue is recorded — the company owes a delivery, so it books a liability called **deferred revenue**.`,
        },
        {
          kind: 'text',
          md: `Not all growth is equal. Two distinctions do most of the analytical work:

- **Organic vs. acquired.** Organic growth comes from selling more to the market you already serve. Acquired growth comes from buying another company's revenue with cash or stock. Only one of them proves the business is winning.
- **Recurring vs. one-time.** A subscription that renews every month is worth far more per dollar than a one-off equipment sale, because it will still be there next year.

A third, softer signal is **guidance**: management's own forecast for coming quarters. Guidance is an estimate, not an audited number — but a company that repeatedly guides high and delivers low is telling you something about its judgment.`,
        },
        {
          kind: 'example',
          md: `**Cascade's $80.0M of revenue growth, decomposed.** Revenue rose from **$420.0M** in FY2023 to **$500.0M** in FY2024 — headline growth of **+19.0%**.

But in June 2024 Cascade bought **Basalt Bakehouse** out of a distressed sale — twelve leased cafés plus a wholesale book — which contributed **$24.0M** of revenue in the half-year after closing.

- Revenue excluding the acquisition: $500.0M − $24.0M = **$476.0M**
- Organic growth: $476.0M ÷ $420.0M − 1 = **+13.3%**
- Acquired contribution: 24.0 ÷ 420.0 = **+5.7 percentage points**

So roughly **two-thirds** of the headline growth was organic and **one-third** was bought. Both are real revenue. Only the 13.3% tells you whether people want more Cascade coffee — and the acquired $24.0M will stop flattering the comparison once it laps in June 2025.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Revenue is the hardest number to fake, so it's the safest."

Revenue is the *most* manipulated line in accounting fraud, precisely because it sits at the top and everything below scales with it. The classic tricks all attack recognition timing: shipping product to distributors nobody ordered (**channel stuffing**), booking multi-year contracts up front, or recording gross revenue when the company is really a middleman earning a fee. When revenue growth accelerates while receivables grow even faster, look harder.`,
        },
        {
          kind: 'keypoint',
          md: `Revenue is recognised on delivery of control, not on payment. Always split headline growth into organic vs. acquired and recurring vs. one-time before believing it.`,
        },
      ],
      quiz: [
        {
          id: 'u03-l02-q1',
          prompt:
            'Cascade ships $100,000 of coffee to a wholesale customer on 30-day payment terms. When is the revenue recorded?',
          choices: [
            'When the customer pays the invoice in 30 days',
            'When the purchase order is signed',
            'Spread evenly across the 30 days of the payment term',
            'On delivery, when control of the goods transfers — whether or not cash has arrived',
          ],
          answerIdx: 3,
          explain:
            'Accrual accounting records revenue when the promised goods or services are transferred, creating an account receivable for the unpaid cash. Waiting for payment would be *cash* accounting, which almost no public company uses. This single rule is why a company can report record revenue and still run out of money.',
        },
        {
          id: 'u03-l02-q2',
          prompt:
            'Cascade\'s revenue grew from $420.0M to $500.0M, but $24.0M of FY2024 revenue came from Basalt Bakehouse, acquired in June 2024. What was organic growth?',
          choices: ['About 13%', 'About 19%', 'About 16%', 'About 5%'],
          answerIdx: 0,
          explain:
            'Strip the acquisition out of the current year first: ($500.0M − $24.0M) ÷ $420.0M − 1 = +13.3%. The 19% answer is the headline figure that includes bought revenue, and 5% is roughly the acquisition\'s own contribution. Serial acquirers can post strong headline growth for years while their underlying business stagnates — this subtraction is how you catch it.',
        },
        {
          id: 'u03-l02-q3',
          prompt:
            'Which of these $500M revenue components most deserves a premium in your analysis?',
          choices: [
            'An $8 million one-time equipment sale to a single hotel group',
            'A $6 million legal settlement recorded in other income',
            'A $30 million subscription coffee club that renews monthly',
            'A $12 million bulk order a distributor placed to beat an announced price increase',
          ],
          answerIdx: 2,
          explain:
            'Recurring subscription revenue is the most durable: it starts next year at $30M rather than at zero. The bulk pre-buy is the sneakiest distractor — it is genuine revenue, but it was *pulled forward* from next year, so it inflates this year and creates a hole in the next. A legal settlement is not revenue at all.',
        },
        {
          id: 'u03-l02-q4',
          prompt: 'What is management guidance?',
          choices: [
            'A disclosure the SEC requires every public company to publish quarterly',
            'The consensus estimate compiled by Wall Street analysts',
            'A commitment shareholders can enforce if results fall short',
            'Management\'s own forecast of future results — an estimate, not an audited number',
          ],
          answerIdx: 3,
          explain:
            'Guidance is voluntary, forward-looking, and unaudited: management\'s own projection, usually hedged with safe-harbour language. Confusing it with **analyst consensus** is common — consensus is the average of outside forecasts, and the gap between guidance and consensus is itself a signal. Guidance is not enforceable, which is exactly why a company\'s track record of hitting it matters.',
        },
      ],
      cardSeeds: [
        {
          id: 'u03-l02-c1',
          kind: 'basic',
          front: 'When is revenue recognised under accrual accounting?',
          back: 'When control of the good or service transfers to the customer — on delivery, not on payment. Unpaid amounts become accounts receivable; cash collected before delivery becomes deferred revenue.',
        },
        {
          id: 'u03-l02-c2',
          kind: 'cloze',
          front:
            '____ growth comes from selling more of your own products; ____ growth comes from buying another company.',
          back: 'Organic; acquired (inorganic)',
        },
        {
          id: 'u03-l02-c3',
          kind: 'basic',
          front: 'How do you compute organic growth when an acquisition closed mid-year?',
          back: 'Subtract the acquired revenue from the current year, then compare to the prior year. Cascade: (500.0 − 24.0) ÷ 420.0 − 1 = +13.3% organic vs. +19.0% headline.',
        },
        {
          id: 'u03-l02-c4',
          kind: 'basic',
          front: 'What is deferred revenue, and which side of the balance sheet is it on?',
          back: 'Cash collected before the good or service is delivered. It is a **liability** — the company still owes the customer something.',
        },
      ],
    },

    // ── L03 ───────────────────────────────────────────────────────────────
    {
      id: 'u03-l03',
      unitId: 'u03',
      order: 3,
      title: 'Cost of Goods & Gross Margin',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**Cost of goods sold (COGS)** is the direct cost of the things that were actually sold in the period. For Cascade that means green coffee, packaging, freight-in, and the wages of the people running the roasters.

What it does *not* include: the marketing team, the CFO, the accounting software, or the interest on the term loan. Those are period costs that belong further down the statement. The dividing line is roughly "would this cost disappear if we sold one fewer unit?"`,
        },
        {
          kind: 'text',
          md: `Subtracting COGS from revenue gives **gross profit**, and expressing it as a percentage gives the single most useful ratio in fundamental analysis:

> **Gross margin = gross profit ÷ revenue**

Gross margin tells you how much of every sales dollar survives the product itself — the money available to fund everything else. High and stable gross margin is the fingerprint of pricing power. Falling gross margin means the company is either discounting or losing control of input costs, and it shows up here long before it shows up in net income.`,
        },
        {
          kind: 'example',
          md: `**Cascade's gross margin, two years:**

| | FY2024 | FY2023 |
|---|---|---|
| Revenue | $500.0 | $420.0 |
| COGS | (300.0) | (256.2) |
| **Gross profit** | **200.0** | **163.8** |
| **Gross margin** | **40.0%** | **39.0%** |

Gross margin improved by **1.0 percentage point**. On $500.0M of revenue that point is worth **$5.0M** of extra gross profit — more than the entire R&D budget. Management credits a mix shift toward higher-priced single-origin bags plus better green-coffee hedging.

**Now compare across industries.** Typical gross margins:

| Business | Gross margin |
|---|---|
| Enterprise software | 75–90% |
| Branded consumer goods | 40–60% |
| Cascade Coffee (roaster + cafés) | ~40% |
| Auto manufacturing | 15–20% |
| Supermarkets | 20–28% |
| Airlines / distribution | often under 15% |

A supermarket at 25% is not "worse" than software at 85%. Software's marginal cost of one more download is nearly zero; a grocer buys physical goods and resells them. What matters is the margin **relative to direct competitors** and its **trend over time**.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Higher gross margin means a better investment."

Gross margin is a fact about the business *model*, not about the price you pay for the stock. A 90% gross-margin software firm that spends 95% of revenue on sales and R&D loses money; a 25% gross-margin grocer with rigorous cost control and huge volume can throw off dependable cash. Compare gross margin only within an industry, and always look at what happens on the next rung down.`,
        },
        {
          kind: 'keypoint',
          md: `Gross margin = gross profit ÷ revenue. It measures pricing power and input-cost control, is only comparable within an industry, and its *trend* usually matters more than its level.`,
        },
      ],
      quiz: [
        {
          id: 'u03-l03-q1',
          prompt:
            'Cascade reports $500.0M of revenue and $200.0M of gross profit. What is gross margin?',
          choices: ['40%', '60%', '8%', '4.5%'],
          answerIdx: 0,
          explain:
            'Gross margin = gross profit ÷ revenue = 200.0 ÷ 500.0 = 40.0%. The 60% answer is the COGS ratio (its mirror image — the two always sum to 100%), 8% is the operating margin, and 4.5% is the net margin. Naming which margin you mean is half the discipline of financial analysis.',
        },
        {
          id: 'u03-l03-q2',
          prompt: 'Which of these Cascade costs belongs in cost of goods sold?',
          choices: [
            'The salary of the chief financial officer',
            'Green coffee beans and packaging consumed in products sold',
            'The advertising budget for the spring campaign',
            'Interest paid on the company\'s term loan',
          ],
          answerIdx: 1,
          explain:
            'COGS captures costs that attach directly to units sold: raw materials, packaging, freight-in, direct production labour. Executive salaries and advertising are operating expenses (SG&A), and interest is a financing cost below operating income. Companies have some latitude in where they draw this line, which is why gross margins are only comparable between close peers.',
        },
        {
          id: 'u03-l03-q3',
          prompt: 'Which pairing of gross margins is most plausible?',
          choices: [
            'A supermarket at 75% and an enterprise software firm at 25%',
            'Both at roughly 40%, since gross margin is standardised across industries',
            'A supermarket at 50% and an enterprise software firm at 45%',
            'A supermarket at 25% and an enterprise software firm at 80%',
          ],
          answerIdx: 3,
          explain:
            'Software has almost no marginal cost per additional copy, so gross margins of 75–90% are normal; grocers resell physical goods on thin spreads, typically 20–28%. Nothing standardises margins across industries — the level is a property of the business model, which is exactly why cross-industry margin comparisons are meaningless and same-industry comparisons are powerful.',
        },
        {
          id: 'u03-l03-q4',
          prompt:
            'Cascade\'s gross margin improved from 39.0% to 40.0% on $500.0M of FY2024 revenue. Roughly how much extra gross profit did that one point produce?',
          choices: ['$1 million', '$0.5 million', '$5 million', '$50 million'],
          answerIdx: 2,
          explain:
            'One percentage point of margin on $500.0M of revenue is 0.01 × 500.0 = $5.0M. Margin points sound small and land big — this single point exceeded Cascade\'s entire $15M R&D budget by a third. It is why management teams fight over tenths of a point on earnings calls.',
        },
        {
          id: 'u03-l03-q5',
          prompt: 'Why should gross margin only be compared within an industry?',
          choices: [
            'Because what companies put inside COGS varies with the business model, so the level is not comparable across sectors',
            'Because accounting rules forbid comparing margins across sectors',
            'Because gross margin is unaffected by pricing power',
            'Because a higher gross margin always identifies the better investment',
          ],
          answerIdx: 0,
          explain:
            'A software firm\'s COGS is hosting and support; a grocer\'s is the wholesale cost of everything on the shelves. The levels are structurally different, so the useful comparisons are against close competitors and against the company\'s own history. No rule forbids the cross-sector comparison — it is simply uninformative.',
        },
      ],
      cardSeeds: [
        {
          id: 'u03-l03-c1',
          kind: 'cloze',
          front: 'Formula: gross margin = ____ ÷ ____.',
          back: 'gross profit ÷ revenue (equivalently, (revenue − COGS) ÷ revenue)',
        },
        {
          id: 'u03-l03-c2',
          kind: 'basic',
          front: 'What belongs in COGS, and what does not?',
          back: 'In: direct materials, packaging, freight-in, direct production labour. Out: SG&A (marketing, executives, admin), R&D, interest, taxes.',
        },
        {
          id: 'u03-l03-c3',
          kind: 'basic',
          front: 'Typical gross margins: enterprise software vs. supermarkets',
          back: 'Software roughly 75–90% (near-zero marginal cost per copy); supermarkets roughly 20–28% (reselling physical goods). Only compare margins within an industry.',
        },
        {
          id: 'u03-l03-c4',
          kind: 'basic',
          front: 'What does a falling gross margin usually signal?',
          back: 'Discounting, loss of pricing power, or rising input costs. It shows up in gross margin well before it reaches net income, which makes it an early-warning line.',
        },
      ],
    },

    // ── L04 ───────────────────────────────────────────────────────────────
    {
      id: 'u03-l04',
      unitId: 'u03',
      order: 4,
      title: 'Operating Expenses',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Below gross profit sit the costs of *being a company* rather than of making the product. Three headings cover most of them:

- **SG&A** — selling, general & administrative. Sales commissions, marketing, corporate salaries, rent on head office, legal, insurance, software. The catch-all.
- **R&D** — research and development. For Cascade this is blend development, brewing equipment, and the mobile-ordering app. For a software or pharma company it is the largest line on the statement.
- **D&A** — depreciation & amortization. The annual write-down of assets bought in earlier years. Some companies report it separately, others bury it inside COGS and SG&A.

Gross profit minus these gives **operating income**.`,
        },
        {
          kind: 'text',
          md: `**Fixed vs. variable is the distinction that generates operating leverage.**

- **Variable costs** rise roughly in step with sales — beans, cups, card-processing fees.
- **Fixed costs** don't move much with volume — the CFO's salary, head-office rent, the accounting system, most of R&D.

When revenue grows, variable costs grow with it but fixed costs mostly don't. The extra revenue therefore drops disproportionately into profit. That amplification is **operating leverage**, and it is why a 19% revenue increase can produce a 90% increase in operating income.

The mechanism runs both ways. In a downturn, revenue falls, fixed costs stay, and operating income collapses faster than sales. High operating leverage means high sensitivity in *both* directions.`,
        },
        {
          kind: 'example',
          md: `**Cascade's operating leverage, in one table.** Note the dollar columns *and* the percent-of-revenue columns — the second pair is where the story is:

| | FY2024 $ | % of rev | FY2023 $ | % of rev |
|---|---|---|---|---|
| Revenue | 500.0 | 100.0% | 420.0 | 100.0% |
| Gross profit | 200.0 | 40.0% | 163.8 | 39.0% |
| SG&A | (120.0) | 24.0% | (109.2) | 26.0% |
| R&D | (15.0) | 3.0% | (12.6) | 3.0% |
| D&A | (25.0) | 5.0% | (21.0) | 5.0% |
| **Operating income** | **40.0** | **8.0%** | **21.0** | **5.0%** |

SG&A **rose** in dollars, from $109.2M to $120.0M — up 9.9%. But revenue rose 19.0%, so SG&A **fell** as a share of revenue from 26.0% to 24.0%. That two-point saving, plus the one point of gross margin, took operating margin from 5.0% to 8.0%.

Result: revenue **+19.0%**, operating income **+90.5%**. Cascade did not cut spending. It simply grew faster than its overheads.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Operating expenses went up, so costs are out of control."

Dollars alone are almost meaningless for a growing company — of course a bigger business spends more. The question is always *relative to revenue*. A cost line growing more slowly than sales is a cost line getting more efficient, even as its absolute number rises. Conversely, be suspicious of an operating-income beat achieved by slashing R&D: it flatters this year and quietly mortgages the next three.`,
        },
        {
          kind: 'keypoint',
          md: `Judge every operating expense as a **percentage of revenue**, not in dollars. When fixed costs are spread over growing sales, operating income grows faster than revenue — operating leverage — and it works just as violently in reverse.`,
        },
      ],
      quiz: [
        {
          id: 'u03-l04-q1',
          prompt: 'Which of these Cascade costs is an operating expense rather than COGS?',
          choices: [
            'Roasted beans shipped to a wholesale customer',
            'Freight-in on a container of green coffee',
            'Salaries of the marketing and finance teams',
            'Retail packaging used for bags that were sold',
          ],
          answerIdx: 2,
          explain:
            'Marketing and finance salaries are SG&A — costs of running the company, not of producing the units sold. Beans, inbound freight, and packaging all attach directly to the product and sit in COGS. The freight distractor trips people up: freight-*in* is part of getting inventory ready and lands in COGS, while freight-*out* to customers is usually SG&A.',
        },
        {
          id: 'u03-l04-q2',
          prompt:
            'Cascade\'s revenue grew 19.0% while operating income grew 90.5%. What best explains that gap?',
          choices: [
            'The company halved its cost of goods sold',
            'Operating leverage — a largely fixed cost base spread over more revenue',
            'An accounting change in how operating expenses are classified',
            'A one-time gain recorded inside operating income',
          ],
          answerIdx: 1,
          explain:
            'Fixed costs such as head office, systems, and most of R&D barely moved while revenue jumped, so a disproportionate share of the new revenue fell through to profit. COGS did not halve — it rose from $256.2M to $300.0M; it simply rose more slowly than revenue. Remember the symmetry: the same leverage would turn a 19% revenue decline into a far worse profit decline.',
        },
        {
          id: 'u03-l04-q3',
          prompt:
            'Cascade\'s SG&A rose from $109.2M to $120.0M while falling from 26.0% to 24.0% of revenue. Which statement is correct?',
          choices: [
            'SG&A grew more slowly than revenue, so it consumed a smaller share of each sales dollar',
            'SG&A was cut in absolute dollars',
            'Revenue must have fallen for the ratio to decline',
            'The company reclassified SG&A into cost of goods sold',
          ],
          answerIdx: 0,
          explain:
            'SG&A grew 9.9% against 19.0% revenue growth, so its ratio fell even though the dollar figure rose — the definition of operating leverage. Spending less in dollars is only one way to improve a cost ratio, and for a healthy growing company it is usually the *less* desirable way.',
        },
        {
          id: 'u03-l04-q4',
          prompt:
            'A company reports a big jump in operating income after cutting R&D from 3% of revenue to 1%. What is the main risk?',
          choices: [
            'None — R&D is discretionary and has no effect on future results',
            'It permanently raises gross margin',
            'It converts a fixed cost into a variable cost',
            'It flatters near-term operating income while starving the future product pipeline',
          ],
          answerIdx: 3,
          explain:
            'R&D is an expense today that buys revenue several years out, so cutting it is one of the easiest ways to manufacture a short-term earnings beat while damaging long-run earning power. It sits below gross profit, so it cannot change gross margin at all — that distractor tests whether you know which rung of the ladder each cost lives on.',
        },
      ],
      cardSeeds: [
        {
          id: 'u03-l04-c1',
          kind: 'basic',
          front: 'What is operating leverage?',
          back: 'When fixed costs are spread across growing revenue, profit grows faster than sales. Cascade: revenue +19.0% produced operating income +90.5%. It amplifies declines just as strongly.',
        },
        {
          id: 'u03-l04-c2',
          kind: 'basic',
          front: 'What sits in SG&A vs. R&D?',
          back: 'SG&A: selling, marketing, corporate salaries, rent, legal, insurance, admin systems. R&D: developing new products and technology — an expense today that buys revenue years later.',
        },
        {
          id: 'u03-l04-c3',
          kind: 'cloze',
          front:
            'To judge whether a cost line is under control, compare it as a percentage of ____, not in ____.',
          back: 'revenue; absolute dollars',
        },
      ],
    },

    // ── L05 ───────────────────────────────────────────────────────────────
    {
      id: 'u03-l05',
      unitId: 'u03',
      order: 5,
      title: 'Operating Income & EBITDA',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**Operating income**, also written **EBIT** (earnings before interest and taxes), is the profit produced by running the business — before any decision about how the company is financed and before the government's cut.

That makes it the fairest rung for comparing two companies. If Cascade is funded with $150M of debt and a rival is funded entirely with equity, their net incomes will differ purely because of financing. Their operating incomes won't.

> **Operating margin = operating income ÷ revenue.** Cascade FY2024: 40.0 ÷ 500.0 = **8.0%**.`,
        },
        {
          kind: 'text',
          md: `**EBITDA** goes one step further and adds back depreciation and amortization:

> **EBITDA = operating income + D&A**

**Depreciation** spreads the cost of a physical asset over its useful life. Cascade spent cash on espresso machines and store build-outs in earlier years; depreciation charges a slice of that cost each year afterward. **Amortization** does the same for intangibles — Cascade amortizes the Ridgeline Roasters recipes and brand at $5.0M a year.

Neither charge involves cash leaving the business *this* year, which is why adding them back is defensible. What is not defensible is treating the result as free money.`,
        },
        {
          kind: 'example',
          md: `**Cascade FY2024, three profit numbers from the same year:**

| Measure | Amount | Margin |
|---|---|---|
| Operating income (EBIT) | $40.0M | 8.0% |
| + Depreciation | 20.0 | |
| + Amortization | 5.0 | |
| **EBITDA** | **$65.0M** | **13.0%** |
| Net income | $22.5M | 4.5% |

EBITDA is **2.9×** net income. Now ask what the $25.0M add-back really represents: Cascade's espresso machines, roasters and store fit-outs genuinely wear out, and it spent **$35.0M of cash on capital expenditure** in FY2024 to replace and extend them. Depreciation isn't a paper fiction — it is last decade's cash spending finally showing up as an expense.

Follow the whole chain: EBITDA $65.0M → less real capex $35.0M → less cash interest $10.0M → less cash taxes ≈ $6.0M → roughly **$14.0M**, and after working-capital needs Cascade's true free cash flow was **$9.0M**. The $65.0M and the $9.0M describe the same year.`,
        },
        {
          kind: 'callout',
          md: `**"EBITDA — earnings before bad stuff."** Charlie Munger's jibe, and Warren Buffett's version: *"Does management think the tooth fairy pays for capital expenditures?"*

EBITDA excludes interest (real cash to lenders), taxes (real cash to government), and depreciation (a proxy for the real cash you must keep spending to stay in business). For an asset-light software company those distortions are small. For an airline, a telecom, or a café chain they are enormous — which is precisely why the most capital-hungry, most indebted companies are the ones that put EBITDA at the top of their press releases. EBITDA is also **not a GAAP measure**: no rule defines it, so "adjusted EBITDA" can mean whatever a company wants.`,
        },
        {
          kind: 'keypoint',
          md: `EBIT = operating income; EBITDA = EBIT + D&A. EBITDA is useful for comparing operating performance across different capital structures, and dangerous whenever it is treated as cash flow.`,
        },
      ],
      quiz: [
        {
          id: 'u03-l05-q1',
          prompt:
            'Cascade reports operating income of $40.0M and D&A of $25.0M. What is EBITDA?',
          choices: ['$40 million', '$65 million', '$15 million', '$47.5 million'],
          answerIdx: 1,
          explain:
            'EBITDA = operating income + D&A = $40.0M + $25.0M = $65.0M. The $15M answer subtracts D&A instead of adding it — a sign of forgetting that D&A was *already* deducted to reach operating income, so adding it back simply reverses that deduction.',
        },
        {
          id: 'u03-l05-q2',
          prompt: 'What does EBITDA exclude that a shareholder ultimately has to pay for?',
          choices: [
            'Cost of goods sold',
            'Selling, general and administrative expense',
            'Interest, taxes, and the cost of assets wearing out',
            'Revenue from discontinued operations',
          ],
          answerIdx: 2,
          explain:
            'The letters spell it out: earnings *before* interest, taxes, depreciation and amortization. Every one of those is a genuine claim on the business — lenders, the tax authority, and the replacement of worn-out equipment. COGS and SG&A are both still deducted inside EBITDA, so choosing them means reading the acronym as excluding more than it does.',
        },
        {
          id: 'u03-l05-q3',
          prompt: 'Why is it dangerous to treat EBITDA as a proxy for cash flow?',
          choices: [
            'EBITDA equals cash from operations for most companies',
            'EBITDA is the figure on which corporate tax is assessed',
            'EBITDA is defined by US GAAP and independently audited',
            'It ignores capex, working capital, interest and taxes, so it can far exceed real cash generation',
          ],
          answerIdx: 3,
          explain:
            'Cascade\'s FY2024 EBITDA was $65.0M while its actual free cash flow was $9.0M — the $56M gap is capex, interest, taxes and working capital, all real. EBITDA is also not a GAAP measure at all: nothing constrains what a company puts in "adjusted EBITDA", which is why the definition belongs in the footnotes you should read.',
        },
        {
          id: 'u03-l05-q4',
          prompt:
            'Why do capital-intensive companies — airlines, telecoms, café chains — lead with EBITDA in their presentations?',
          choices: [
            'Because it removes depreciation, the expense that reflects their heavy asset base',
            'Because it removes seasonal revenue volatility',
            'Because it is the only profit measure lenders are permitted to use',
            'Because it counts stock-based compensation as a cash cost',
          ],
          answerIdx: 0,
          explain:
            'The heavier the asset base, the larger the depreciation charge — and the more flattering it is to report profit before that charge. The metric is at its least honest exactly where it is most heavily promoted. Lenders do use EBITDA in leverage covenants, but nothing restricts them to it, and EBITDA adds SBC *back*, treating it as a non-cash cost rather than a cash one.',
        },
        {
          id: 'u03-l05-q5',
          prompt: 'Depreciation is described as a "non-cash" charge. What does that actually mean?',
          choices: [
            'The company never spends money on the assets being depreciated',
            'No cash leaves the business this period — the cash went out earlier when the asset was purchased',
            'It is an estimate the auditor removes before publication',
            'It reduces cash but does not reduce net income',
          ],
          answerIdx: 1,
          explain:
            'The cash outflow happened at purchase and was recorded as capital expenditure; depreciation just spreads that historical cost across the years the asset is used. Believing the company "never spends the money" is the exact error behind treating EBITDA as cash — Cascade spent $35.0M of real cash on capex in FY2024 alone.',
        },
      ],
      cardSeeds: [
        {
          id: 'u03-l05-c1',
          kind: 'cloze',
          front: 'EBITDA = ____ + ____.',
          back: 'operating income (EBIT) + depreciation & amortization',
        },
        {
          id: 'u03-l05-c2',
          kind: 'basic',
          front: 'Why is operating income (EBIT) better than net income for comparing two companies?',
          back: 'It comes before interest and taxes, so it is not distorted by how each company is financed or by tax quirks. It isolates the performance of the business itself.',
        },
        {
          id: 'u03-l05-c3',
          kind: 'basic',
          front: 'Why is EBITDA called "earnings before bad stuff"?',
          back: 'It excludes interest (owed to lenders), taxes (owed to government) and D&A (a proxy for the capex needed to stay in business) — all real claims. Cascade: EBITDA $65.0M vs. free cash flow $9.0M.',
        },
        {
          id: 'u03-l05-c4',
          kind: 'basic',
          front: 'What is the difference between depreciation and amortization?',
          back: 'Depreciation spreads the cost of tangible assets (machines, buildings) over their useful life. Amortization does the same for intangibles (acquired brands, patents, software).',
        },
      ],
    },

    // ── L06 ───────────────────────────────────────────────────────────────
    {
      id: 'u03-l06',
      unitId: 'u03',
      order: 6,
      title: 'Below the Line',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `Everything beneath operating income is about **how the company is financed and taxed**, plus whatever unusual events happened this year. It is short, it is where the surprises hide, and most beginners read straight past it.

**Interest expense** is the cost of debt. Cascade pays **$10.0M** a year on **$150.0M** of borrowings — an average rate of about 6.7%. Companies with cash also report **interest income**; the two are often netted. Interest sits below operating income because borrowing is a *financing choice*, not an operating outcome: two identical cafés earn identical operating income whether one is funded by debt or equity.`,
        },
        {
          kind: 'text',
          md: `**Tax** is reported as *income tax expense*, and the ratio you want is the **effective tax rate**:

> **Effective tax rate = income tax expense ÷ pre-tax income**

The US federal statutory rate is 21%, but almost nobody pays exactly that. State taxes push it up; foreign earnings in lower-tax jurisdictions, R&D credits, and losses carried forward from earlier years push it down. A rate that swings wildly year to year — 25%, then 9%, then 31% — usually means one-time items, not a change in the business.`,
        },
        {
          kind: 'example',
          md: `**Cascade below the line, FY2024 vs FY2023:**

| | FY2024 | FY2023 |
|---|---|---|
| Operating income | $40.0 | $21.0 |
| Interest expense | (10.0) | (9.0) |
| **Pre-tax income** | **30.0** | **12.0** |
| Income tax expense | (7.5) | (3.0) |
| **Net income** | **22.5** | **9.0** |
| Effective tax rate | 25.0% | 25.0% |

Watch what near-fixed interest does. Operating income rose **+90.5%**, but because interest barely moved ($9.0M to $10.0M), pre-tax income rose **+150.0%**. That extra amplification on top of operating leverage is **financial leverage** — debt magnifies the swing in both directions, which is why a highly indebted company is fragile in a downturn even if its operations are fine.

**A one-time item.** Suppose FY2025 includes a **$6.0M** legal settlement gain. Net income jumps, but the underlying business earned nothing extra. Strip it out — then check the last five years, because companies whose "one-time" items appear every single year do not really have one-time items.`,
        },
        {
          kind: 'callout',
          md: `**Continuing vs. discontinued operations.** When a company sells or shuts a business segment, the results of that segment are pulled out of every operating line and shown on one separate row, **net of tax**, near the bottom.

This is genuinely useful: *continuing operations* shows the company you would actually be buying. The trap is comparing this year's continuing-operations revenue against last year's total revenue and concluding that sales collapsed. Always check which basis each year is presented on — the prior year is usually restated, but headlines rarely are.`,
        },
        {
          kind: 'keypoint',
          md: `Below operating income: interest reflects financing choices, tax reflects the effective rate (expense ÷ pre-tax income), and unusual or discontinued items are separated so you can judge the ongoing business.`,
        },
      ],
      quiz: [
        {
          id: 'u03-l06-q1',
          prompt:
            'Cascade reports pre-tax income of $30.0M and income tax expense of $7.5M. What is its effective tax rate?',
          choices: ['33%', '15%', '21%', '25%'],
          answerIdx: 3,
          explain:
            'Effective tax rate = tax expense ÷ pre-tax income = 7.5 ÷ 30.0 = 25.0%. The 21% distractor is the US federal *statutory* rate — a common confusion. State taxes, foreign mix, credits and carried-forward losses mean the effective rate a company actually pays is almost never the statutory one.',
        },
        {
          id: 'u03-l06-q2',
          prompt: 'Why does interest expense appear below operating income rather than inside it?',
          choices: [
            'It is treated as part of operating expenses in most industries',
            'It measures how efficiently the company runs its stores',
            'It reflects a financing decision rather than operating performance, so it is kept out of EBIT',
            'It is a non-cash charge that gets added back to EBITDA',
          ],
          answerIdx: 2,
          explain:
            'Two identical businesses, one debt-funded and one equity-funded, should show the same operating income — the difference belongs below the line. The "non-cash charge" answer is half right in an unhelpful way: interest *is* added back in EBITDA, but it is very much a cash payment to lenders, unlike depreciation.',
        },
        {
          id: 'u03-l06-q3',
          prompt:
            'A company reports a $6.0M legal settlement gain that lifts net income sharply. How should you treat it?',
          choices: [
            'Strip it out when judging underlying earning power — while checking whether "one-time" items appear every year',
            'Treat it as recurring revenue, since it was collected in cash',
            'Ignore net income entirely for that year',
            'Add it to gross profit',
          ],
          answerIdx: 0,
          explain:
            'Non-recurring gains and charges say nothing about ongoing earning power, so remove them to see the run-rate. The important second half is the audit: a company posting "unusual" restructuring or settlement items in five consecutive years is describing its normal cost of doing business. Cash collection is irrelevant — a one-time cash gain is still one-time.',
        },
        {
          id: 'u03-l06-q4',
          prompt: 'How are discontinued operations presented, and why does it matter?',
          choices: [
            'Inside operating income, so total company performance stays comparable',
            'On a separate line, net of tax, so continuing operations shows the business you are actually buying',
            'Excluded from net income entirely',
            'By rule, continuing operations must exclude the company\'s largest segment',
          ],
          answerIdx: 1,
          explain:
            'Segments being sold or shut are stripped out of each operating line and shown once, after tax, near the bottom — leaving continuing operations as a clean view of the go-forward company. They are still inside total net income, just isolated. The practical trap is comparing restated continuing-operations revenue against a prior-year total and mistaking the presentation change for a collapse in sales.',
        },
      ],
      cardSeeds: [
        {
          id: 'u03-l06-c1',
          kind: 'cloze',
          front: 'Formula: effective tax rate = ____ ÷ ____.',
          back: 'income tax expense ÷ pre-tax income (Cascade FY2024: 7.5 ÷ 30.0 = 25.0%)',
        },
        {
          id: 'u03-l06-c2',
          kind: 'basic',
          front: 'Why is the effective tax rate rarely equal to the 21% US statutory rate?',
          back: 'State and foreign taxes, earnings mix across jurisdictions, R&D and other credits, and loss carryforwards all move it. Wild year-to-year swings usually signal one-time items.',
        },
        {
          id: 'u03-l06-c3',
          kind: 'basic',
          front: 'What is financial leverage on the income statement?',
          back: 'Near-fixed interest expense amplifies changes in operating income. Cascade: operating income +90.5% became pre-tax income +150.0% because interest barely moved. It magnifies losses too.',
        },
        {
          id: 'u03-l06-c4',
          kind: 'basic',
          front: 'Continuing vs. discontinued operations',
          back: 'Discontinued (sold or shut) segments are reported on one separate line, net of tax. Continuing operations is the business you are actually buying — check both years are on the same basis.',
        },
      ],
    },

    // ── L07 ───────────────────────────────────────────────────────────────
    {
      id: 'u03-l07',
      unitId: 'u03',
      order: 7,
      title: 'EPS: Basic and Diluted',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Net income belongs to shareholders collectively. **Earnings per share (EPS)** tells you how much of it belongs to *one* share — the number every valuation multiple in Unit 6 is built on.

> **Basic EPS = net income ÷ weighted-average basic shares outstanding**

"Weighted-average" because the share count changes during the year. If a company issues shares in July, they only count for half the year.`,
        },
        {
          kind: 'text',
          md: `**Diluted EPS** answers a harder question: what if everything that *could* become a share, did?

Employee stock options, restricted stock units (RSUs), convertible bonds and warrants are all claims on future shares. They haven't been issued yet, but they will be. Diluted EPS counts them, so the profit is divided among a larger number:

> **Diluted EPS = net income ÷ diluted share count**

Diluted EPS is always the more conservative number and is the one you should use by default. A company whose diluted count is 15% above its basic count is quietly transferring a meaningful slice of ownership to employees every year.`,
        },
        {
          kind: 'example',
          md: `**Cascade EPS, FY2024 vs FY2023:**

| | FY2024 | FY2023 |
|---|---|---|
| Net income | $22.5M | $9.0M |
| Weighted-average basic shares | 30.0M | 30.0M |
| Weighted-average diluted shares | 31.5M | 31.0M |
| **Basic EPS** | **$0.75** | **$0.30** |
| **Diluted EPS** | **$0.71** | **$0.29** |

The 1.5M share gap is options and RSUs granted to Cascade's staff — **5.0% dilution**. That is the cost of stock-based pay showing up where most people never look.

**Now the buyback effect.** Suppose FY2025 net income is completely flat at $22.5M, but Cascade spends cash retiring 3.0M shares, taking the basic count from 30.0M to 27.0M:

- New basic EPS = 22.5 ÷ 27.0 = **$0.83**
- EPS growth: **+11.1%**
- Net income growth: **0.0%**

A headline reading "Cascade grows earnings per share 11%" would be true and almost entirely uninformative about the business. Buybacks are not fake — each remaining share genuinely owns more of the company — but they are a *capital allocation* result, not an operating one.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Buybacks always create value, so EPS growth is EPS growth."

Two checks. First, **at what price?** Retiring shares above intrinsic value destroys value for the holders who stay, exactly as issuing below it does. Second, **is it real shrinkage?** Many companies buy back just enough stock to offset the shares handed to employees, so the count stays flat while cash pours out. Watch the *share count trend* in the 10-K, not the buyback headline: if net income growth and EPS growth diverge persistently, the difference is share count, not performance.`,
        },
        {
          kind: 'keypoint',
          md: `Basic EPS = net income ÷ basic shares; diluted EPS also counts options, RSUs and convertibles. Use diluted, and always compare EPS growth against net income growth to see how much came from the share count.`,
        },
      ],
      quiz: [
        {
          id: 'u03-l07-q1',
          prompt:
            'Cascade reports net income of $22.5M and 30.0M weighted-average basic shares. What is basic EPS?',
          choices: ['$0.71', '$0.30', '$0.75', '$1.33'],
          answerIdx: 2,
          explain:
            'Basic EPS = 22.5 ÷ 30.0 = $0.75. The $0.71 answer uses the 31.5M diluted count, and $1.33 inverts the division (shares ÷ income). Getting the denominator right matters more than it sounds: every P/E ratio you ever compute inherits this number.',
        },
        {
          id: 'u03-l07-q2',
          prompt:
            'Cascade\'s diluted share count is 31.5M against the same $22.5M of net income. What is diluted EPS?',
          choices: ['$0.71', '$0.75', '$0.68', '$0.79'],
          answerIdx: 0,
          explain:
            '22.5 ÷ 31.5 = $0.714, reported as $0.71 — about 5% below basic EPS of $0.75. Diluted EPS can never exceed basic EPS, because the denominator only ever gets bigger. The $0.79 answer would require *fewer* shares than basic, which the definition forbids.',
        },
        {
          id: 'u03-l07-q3',
          prompt: 'Why is diluted EPS lower than basic EPS?',
          choices: [
            'The company issued bonds during the year',
            'Treasury shares are added back to the share count',
            'Auditors require a conservative estimate of net income',
            'Options, RSUs and convertibles that could become shares are counted, spreading the same profit over more shares',
          ],
          answerIdx: 3,
          explain:
            'Dilution comes from the denominator, never the numerator — net income is identical in both calculations. Treasury shares work the opposite way: they are shares the company has bought back and *removed* from the count. Ordinary bonds do not dilute at all unless they are convertible.',
        },
        {
          id: 'u03-l07-q4',
          prompt:
            'Cascade\'s net income is flat at $22.5M but its share count falls from 30.0M to 27.0M after a buyback. What happened to EPS?',
          choices: [
            'Net income must have risen about 11% for EPS to move',
            'EPS rose about 11% purely because the same profit was divided among fewer shares',
            'Gross margin must have expanded',
            'EPS fell, because buybacks consume cash',
          ],
          answerIdx: 1,
          explain:
            '22.5 ÷ 27.0 = $0.83 versus $0.75 — up 11.1% with zero improvement in the business. This is why EPS growth and net income growth should always be checked side by side: a persistent gap between them is a share-count story, not an earnings story.',
        },
        {
          id: 'u03-l07-q5',
          prompt: 'Why watch net income growth alongside EPS growth?',
          choices: [
            'Because US companies are not required to report EPS',
            'Because net income already includes the effect of buybacks',
            'Because EPS can rise from a shrinking share count even when the business is earning no more than before',
            'Because EPS growth is always larger than net income growth',
          ],
          answerIdx: 2,
          explain:
            'EPS blends two very different things — how much the company earns, and how many slices it is divided into. Net income isolates the first. EPS growth is not always larger, either: when a company issues shares to fund an acquisition or pay staff, EPS can grow *more slowly* than net income, or fall while profits rise.',
        },
      ],
      cardSeeds: [
        {
          id: 'u03-l07-c1',
          kind: 'cloze',
          front: 'Formula: basic EPS = ____ ÷ ____.',
          back: 'net income ÷ weighted-average basic shares outstanding',
        },
        {
          id: 'u03-l07-c2',
          kind: 'basic',
          front: 'Basic vs. diluted EPS — what is the difference?',
          back: 'Diluted also counts shares that could be created by options, RSUs, warrants and convertibles. It is always the lower, more conservative figure — use it by default.',
        },
        {
          id: 'u03-l07-c3',
          kind: 'basic',
          front: 'How can EPS grow while net income is flat?',
          back: 'Buybacks shrink the share count, so the same profit is divided among fewer shares. Cascade: $22.5M ÷ 27.0M shares = $0.83 vs. $0.75 — EPS +11% with 0% profit growth.',
        },
        {
          id: 'u03-l07-c4',
          kind: 'basic',
          front: 'Two checks before crediting a buyback with creating value',
          back: '1) The price paid — repurchasing above intrinsic value destroys value for remaining holders. 2) Whether the share count actually fell, or the buyback merely offset shares issued to employees.',
        },
      ],
    },

    // ── L08 ───────────────────────────────────────────────────────────────
    {
      id: 'u03-l08',
      unitId: 'u03',
      order: 8,
      title: 'Reading a Real Income Statement',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Time to put the whole ladder together the way you would in a real 10-K. Three passes, always in this order:

1. **Year-over-year.** Which lines grew, and by how much?
2. **Common-size.** Restate every line as a percentage of revenue, so the shape of the business becomes visible independent of size.
3. **Ask what changed.** A common-size table doesn't explain anything; it tells you exactly where to point the question.`,
        },
        {
          kind: 'example',
          md: `**Cascade Coffee Co. — condensed consolidated statements of operations**
*(in millions, except per-share data)*

| | FY2024 | % of rev | FY2023 | % of rev | YoY $ | YoY % |
|---|---|---|---|---|---|---|
| Revenue | 500.0 | 100.0% | 420.0 | 100.0% | +80.0 | +19.0% |
| Cost of goods sold | (300.0) | 60.0% | (256.2) | 61.0% | +43.8 | +17.1% |
| **Gross profit** | **200.0** | **40.0%** | **163.8** | **39.0%** | +36.2 | +22.1% |
| SG&A | (120.0) | 24.0% | (109.2) | 26.0% | +10.8 | +9.9% |
| R&D | (15.0) | 3.0% | (12.6) | 3.0% | +2.4 | +19.0% |
| Depreciation & amortization | (25.0) | 5.0% | (21.0) | 5.0% | +4.0 | +19.0% |
| **Operating income** | **40.0** | **8.0%** | **21.0** | **5.0%** | +19.0 | +90.5% |
| Interest expense | (10.0) | 2.0% | (9.0) | 2.1% | +1.0 | +11.1% |
| **Pre-tax income** | **30.0** | **6.0%** | **12.0** | **2.9%** | +18.0 | +150.0% |
| Income tax expense | (7.5) | 1.5% | (3.0) | 0.7% | +4.5 | +150.0% |
| **Net income** | **22.5** | **4.5%** | **9.0** | **2.1%** | +13.5 | +150.0% |
| Diluted EPS | $0.71 | | $0.29 | | +0.42 | +144.8% |`,
        },
        {
          kind: 'text',
          md: `**Now read it.** The common-size column does the work in about thirty seconds:

- **COGS fell from 61.0% to 60.0%** of revenue → gross margin up one point → mix shift to premium bags plus better hedging.
- **SG&A fell from 26.0% to 24.0%** → the biggest single driver. Overheads grew 9.9% while revenue grew 19.0%: textbook operating leverage.
- **R&D and D&A held flat** at 3.0% and 5.0% → Cascade is still investing in proportion to its size, not starving the future to make the year look good.
- **Operating margin 5.0% → 8.0%** → the whole story in one number.
- **Interest roughly flat** in dollars → financial leverage turned +90.5% operating growth into +150.0% pre-tax growth.
- **Effective tax rate unchanged at 25.0%** → none of the improvement came from tax games.
- **Diluted EPS grew about 145%, slightly less than net income's 150.0%** → the diluted share count rose from 31.0M to 31.5M. Small, but it is the direction to watch.

The verdict: this is high-quality growth. It came from revenue and margin, not from tax, one-time gains, buybacks, or cut investment.`,
        },
        {
          kind: 'callout',
          md: `**What the income statement still cannot tell you.** Cascade's profit story is genuinely good, and it is only one third of the picture:

- Net income was $22.5M, but cash from operations was **$44.0M** and free cash flow only **$9.0M**.
- Inventory grew **25%** while revenue grew 19% — sales may be slower than the shelves suggest.
- The company carries **$150.0M of debt** and **$60.0M of goodwill** from acquisitions.

None of that appears above. Unit 4 is where those numbers live, and where the three statements finally lock together.`,
        },
        {
          kind: 'keypoint',
          md: `Read any income statement in three passes: year-over-year growth, common-size (every line ÷ revenue), then ask what changed. High-quality growth comes from revenue and margin — not from tax rates, one-time items, buybacks, or cut R&D.`,
        },
      ],
      quiz: [
        {
          id: 'u03-l08-q1',
          prompt:
            'On a common-size basis, what was Cascade\'s FY2024 cost of goods sold as a percentage of revenue?',
          choices: ['60.0%', '61.0%', '40.0%', '32.0%'],
          answerIdx: 0,
          explain:
            '300.0 ÷ 500.0 = 60.0%. The 61.0% figure is FY2023, and 40.0% is gross margin — COGS% and gross margin% always sum to 100%, which is a fast way to sanity-check your arithmetic. Common-sizing is what makes a $500M company and a $50B company directly comparable.',
        },
        {
          id: 'u03-l08-q2',
          prompt: 'Cascade\'s revenue went from $420.0M to $500.0M. What was year-over-year growth?',
          choices: ['16.0%', '13.3%', '20.0%', '19.0%'],
          answerIdx: 3,
          explain:
            '(500.0 − 420.0) ÷ 420.0 = 19.0%. The 16.0% trap divides the $80M change by the *new* number instead of the old one — always divide by the earlier period. The 13.3% figure is organic growth after removing the Basalt acquisition, a genuinely different (and arguably better) measure.',
        },
        {
          id: 'u03-l08-q3',
          prompt: 'What was Cascade\'s FY2024 net margin?',
          choices: ['8.0%', '4.5%', '13.0%', '40.0%'],
          answerIdx: 1,
          explain:
            'Net margin = net income ÷ revenue = 22.5 ÷ 500.0 = 4.5%. The other three are all real Cascade margins from the same year — operating 8.0%, EBITDA 13.0%, gross 40.0% — which is exactly why "the margin" is never a complete sentence. Name the rung.',
        },
        {
          id: 'u03-l08-q4',
          prompt: 'What does common-size analysis reveal that raw dollar figures hide?',
          choices: [
            'The company\'s cash balance and debt maturities',
            'Whether the auditor issued a clean opinion',
            'Whether each cost line is growing faster or slower than revenue',
            'The market value investors place on the company',
          ],
          answerIdx: 2,
          explain:
            'Restating every line as a percentage of revenue makes cost *ratios* visible, so a line that rises in dollars but falls as a share of sales is instantly recognisable as improving efficiency. Cash, debt, and audit opinions live elsewhere — on the balance sheet and in the notes, which is Unit 4 territory.',
        },
        {
          id: 'u03-l08-q5',
          prompt:
            'Cascade\'s net income grew 150% while revenue grew 19%. What was the main driver?',
          choices: [
            'A lower effective tax rate',
            'A large one-time gain',
            'A reduction in the share count',
            'Operating leverage — revenue rose 19% while the operating expense ratio fell from 34% to 32% of revenue',
          ],
          answerIdx: 3,
          explain:
            'Gross margin added a point and SG&A fell two points as a share of revenue, lifting operating margin from 5.0% to 8.0%; roughly flat interest then amplified that into a 150% pre-tax jump. The tax rate was unchanged at 25.0%, there was no one-time gain, and the share count actually *rose* slightly — each of those distractors is a low-quality source of earnings growth worth learning to rule out.',
        },
      ],
      cardSeeds: [
        {
          id: 'u03-l08-c1',
          kind: 'basic',
          front: 'The three passes for reading any income statement',
          back: '1) Year-over-year growth by line. 2) Common-size: every line as a percentage of revenue. 3) Ask what changed and why.',
        },
        {
          id: 'u03-l08-c2',
          kind: 'cloze',
          front: 'Common-size analysis restates every income statement line as a percentage of ____.',
          back: 'revenue (the top line = 100%)',
        },
        {
          id: 'u03-l08-c3',
          kind: 'basic',
          front: 'What distinguishes high-quality from low-quality earnings growth?',
          back: 'High quality: revenue growth and margin expansion. Low quality: a falling tax rate, one-time gains, buybacks shrinking the share count, or cuts to R&D and marketing.',
        },
        {
          id: 'u03-l08-c4',
          kind: 'basic',
          front: 'Cascade Coffee FY2024 in one line',
          back: 'Revenue $500.0M (+19.0%), gross margin 40.0%, operating income $40.0M (8.0%), EBITDA $65.0M, net income $22.5M (4.5%), diluted EPS $0.71.',
        },
      ],
    },
  ],
}
