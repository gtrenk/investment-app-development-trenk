import type { Unit } from '@core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Unit 04 — Balance Sheet & Cash Flow
// Statements two and three, then the wiring that joins all three together.
// Continues the Cascade Coffee Co. (CASC) example begun in Unit 03: the FY2024
// balance sheet and cash flow statement here tie exactly to that income
// statement — net income $22.5M, D&A $25.0M, CFO $44.0M, capex $35.0M.
// ─────────────────────────────────────────────────────────────────────────────

export const u04: Unit = {
  id: 'u04',
  title: 'Balance Sheet & Cash Flow',
  order: 4,
  description:
    'What a company owns, what it owes, and where the cash actually went — plus the wiring that locks all three financial statements together into one model of a business.',
  unlockAfter: 'u03',
  lessons: [
    // ── L01 ───────────────────────────────────────────────────────────────
    {
      id: 'u04-l01',
      unitId: 'u04',
      order: 1,
      title: 'The Balance Sheet Equation',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `The income statement was a video of a year. The **balance sheet** is a photograph of a single instant — usually the last day of the fiscal quarter or year. It answers a different question: not *did we make money*, but **what do we own, what do we owe, and what is left over for the owners?**

Everything rests on one identity that can never be violated:

> **Assets = Liabilities + Shareholders' Equity**

Read it as a sentence about funding. Every asset the company controls was paid for with either **someone else's money** (liabilities) or **the owners' money** (equity). The two sides describe the same pile of resources from opposite ends: the left says *what we have*, the right says *who has a claim on it*.`,
        },
        {
          kind: 'text',
          md: `Rearranged, the identity defines equity:

> **Shareholders' equity = Assets − Liabilities**

That is why equity is also called **book value** or *net assets*. It is a residual — the leftovers after every creditor is satisfied, which is exactly the residual claim you learned about in Unit 1, now written in accounting form.

Assets are conventionally listed in order of **liquidity** (how fast they turn into cash) and liabilities in order of **maturity** (how soon they come due). Both split into **current** — within twelve months — and **non-current**.`,
        },
        {
          kind: 'example',
          md: `**Cascade Coffee Co. — condensed consolidated balance sheets**
*(in millions, as of December 31)*

| | FY2024 | FY2023 |
|---|---|---|
| Cash & equivalents | 30.0 | 22.0 |
| Accounts receivable | 40.0 | 32.0 |
| Inventory | 55.0 | 44.0 |
| Prepaid expenses | 5.0 | 4.0 |
| **Total current assets** | **130.0** | **102.0** |
| Property, plant & equipment, net | 140.0 | 125.0 |
| Operating lease right-of-use assets | 48.0 | 46.0 |
| Goodwill | 60.0 | 48.0 |
| Other intangibles, net | 20.0 | 17.0 |
| Other assets | 2.0 | 2.0 |
| **TOTAL ASSETS** | **400.0** | **340.0** |
| | | |
| Accounts payable | 35.0 | 30.0 |
| Accrued expenses | 15.0 | 13.0 |
| Current portion of long-term debt | 10.0 | 10.0 |
| Current lease liabilities | 5.0 | 5.0 |
| **Total current liabilities** | **65.0** | **58.0** |
| Long-term debt | 140.0 | 114.0 |
| Lease liabilities, non-current | 45.0 | 43.0 |
| Deferred income taxes | 10.0 | 9.5 |
| **TOTAL LIABILITIES** | **260.0** | **224.5** |
| | | |
| Common stock & paid-in capital | 95.0 | 86.0 |
| Retained earnings | 60.0 | 37.5 |
| Treasury stock | (15.0) | (8.0) |
| **TOTAL EQUITY** | **140.0** | **115.5** |
| **TOTAL LIABILITIES + EQUITY** | **400.0** | **340.0** |

Check the identity: **$260.0M + $140.0M = $400.0M**. It balances, as it must. Cascade's shareholders own $400.0M of stuff against $260.0M of obligations, leaving **$140.0M** of book equity.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Equity of $140M means the company is worth $140M."

Cascade has 30.0M shares. At $18.00 a share its **market capitalization is $540.0M** — nearly four times book equity. Neither number is wrong; they measure different things.

Book equity is an **accounting** figure built largely on **historical cost**: buildings carried at what they cost decades ago, brands built internally carried at zero, the value of a loyal customer base carried at nothing at all. Market cap is what investors will pay today for a claim on **future** earnings. The ratio between them — price-to-book — is a valuation tool in Unit 6, not a scandal.`,
        },
        {
          kind: 'keypoint',
          md: `Assets = Liabilities + Equity, always, at a single instant in time. Equity (book value) is the residual: assets minus liabilities — an accounting figure at historical cost, not the market value of the business.`,
        },
      ],
      quiz: [
        {
          id: 'u04-l01-q1',
          prompt:
            'Cascade reports total assets of $400.0M and total liabilities of $260.0M. What is shareholders\' equity?',
          choices: ['$400 million', '$260 million', '$140 million', '$660 million'],
          answerIdx: 2,
          explain:
            'Equity = assets − liabilities = $400.0M − $260.0M = $140.0M. The $660M answer *adds* the two sides, which is the most common slip — remember the identity says assets EQUAL liabilities plus equity, so the two right-hand items must together equal $400.0M, not exceed it.',
        },
        {
          id: 'u04-l01-q2',
          prompt:
            'What is the fundamental difference between the balance sheet and the income statement?',
          choices: [
            'The balance sheet is a snapshot at a single instant; the income statement covers a span of time',
            'They both cover the same twelve-month period, from different angles',
            'The balance sheet covers a period and the income statement is a snapshot',
            'The balance sheet is updated continuously and published daily',
          ],
          answerIdx: 0,
          explain:
            'A balance sheet is dated "as of December 31"; an income statement is "for the year ended December 31". One is a level (a stock), the other a flow. That distinction governs how you combine them: ratios like inventory days mix a balance-sheet level with an income-statement flow, which is why analysts often use an *average* balance across the two year-ends.',
        },
        {
          id: 'u04-l01-q3',
          prompt: 'Why must the balance sheet always balance?',
          choices: [
            'Because auditors adjust the figures until the two sides agree',
            'Because assets are recorded at current market value',
            'Because retained earnings is a plug figure management chooses',
            'Because every asset was funded either by a creditor or by an owner, so the two sides describe the same resources from different angles',
          ],
          answerIdx: 3,
          explain:
            'The identity is definitional, not enforced: equity is *defined* as assets minus liabilities, so it cannot fail to balance. The "plug figure" answer inverts reality — retained earnings is built up from actual profits and dividends over the company\'s life, and if a real balance sheet did not balance, the error would be somewhere in the underlying records, not in the equation.',
        },
        {
          id: 'u04-l01-q4',
          prompt:
            'Cascade\'s book equity is $140.0M but its market capitalization is $540.0M. What does this tell you?',
          choices: [
            'The market is overvaluing the company by $400 million',
            'Book equity is an accounting figure largely at historical cost, while market cap prices expected future earnings',
            'The balance sheet must contain an error',
            'Equity and market cap should be equal for any profitable company',
          ],
          answerIdx: 1,
          explain:
            'Book value ignores internally built brands, customer relationships and the earning power of the asset base, and carries old assets at what they originally cost. A gap between the two is normal and usually large for asset-light or brand-driven companies. Concluding the market is "wrong" by the difference confuses a measurement convention with a valuation opinion.',
        },
      ],
      cardSeeds: [
        {
          id: 'u04-l01-c1',
          kind: 'cloze',
          front: 'The balance sheet identity: ____ = ____ + ____.',
          back: 'Assets = Liabilities + Shareholders\' equity (equivalently, equity = assets − liabilities)',
        },
        {
          id: 'u04-l01-c2',
          kind: 'basic',
          front: 'Snapshot vs. flow — which statement is which?',
          back: 'Balance sheet: a snapshot "as of" one date (a level). Income statement and cash flow statement: flows "for the period ended" that date.',
        },
        {
          id: 'u04-l01-c3',
          kind: 'basic',
          front: 'Why does book equity differ so much from market capitalization?',
          back: 'Book equity uses historical cost and ignores internally built brands, customers and earning power. Market cap prices expected future cash flows. Cascade: $140.0M book vs. $540.0M market.',
        },
      ],
    },

    // ── L02 ───────────────────────────────────────────────────────────────
    {
      id: 'u04-l02',
      unitId: 'u04',
      order: 2,
      title: 'Current Assets & Liquidity',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**Current assets** are the things expected to become cash within twelve months. They are listed most-liquid-first, and each one tells a different story:

- **Cash & equivalents** — bank balances plus safe instruments maturing within 90 days.
- **Accounts receivable (AR)** — revenue already recognised but not yet collected. Money owed to you.
- **Inventory** — raw materials, work in progress, and finished goods waiting to be sold. For Cascade: green coffee, roasted stock, packaging.
- **Prepaid expenses** — cash already paid for something not yet consumed, like a year of insurance bought in January.

**Liquidity** is the question these lines answer: can the company pay what falls due in the next year without selling the roastery?`,
        },
        {
          kind: 'text',
          md: `Two ratios do most of the work:

> **Current ratio = current assets ÷ current liabilities**

> **Quick ratio = (cash + receivables) ÷ current liabilities**

The quick ratio (or "acid test") deliberately excludes inventory and prepaids, because inventory is the current asset most likely to be worth less than its carrying value when you actually need the money. A current ratio near 2.0 is comfortable for most industries; below 1.0 means the next twelve months of obligations exceed the next twelve months of resources, which demands an explanation.`,
        },
        {
          kind: 'example',
          md: `**Cascade's liquidity, FY2024:**

- Current assets **$130.0M**, current liabilities **$65.0M**
- **Current ratio** = 130.0 ÷ 65.0 = **2.0** — comfortable
- **Quick ratio** = (30.0 + 40.0) ÷ 65.0 = **1.08** — still above 1.0, but only just

Now the warning sign hiding inside those healthy ratios:

| | FY2024 | FY2023 | Growth |
|---|---|---|---|
| Revenue | 500.0 | 420.0 | **+19.0%** |
| Accounts receivable | 40.0 | 32.0 | **+25.0%** |
| Inventory | 55.0 | 44.0 | **+25.0%** |

Both receivables and inventory grew **faster than sales**. Roasted coffee gets stale, so inventory that is not turning is inventory heading for a markdown. And receivables outrunning revenue means Cascade is either selling to slower-paying customers or loosening credit terms to close deals.

Neither is fatal at these levels. Both are questions to ask on the earnings call — and both are cash, as the next lessons will show.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Rising inventory means the company is confident about demand."

Sometimes. It equally often means demand already slowed and the goods did not sell. Inventory is recorded at **cost**, so a bloated balance is a bet that the goods will eventually sell at full price — and when that bet fails, the company takes a **write-down** that hits gross margin in a later quarter, often as an unpleasant surprise.

The reliable tell is the *comparison*: inventory growing materially faster than revenue, quarter after quarter, has preceded an enormous share of retail and consumer-goods earnings disasters.`,
        },
        {
          kind: 'keypoint',
          md: `Current ratio = current assets ÷ current liabilities; quick ratio excludes inventory. Compare receivables and inventory growth against *revenue* growth — when they outrun sales, cash and future margins are at risk.`,
        },
      ],
      quiz: [
        {
          id: 'u04-l02-q1',
          prompt:
            'Cascade has current assets of $130.0M and current liabilities of $65.0M. What is its current ratio?',
          choices: ['2.0', '1.08', '0.5', '5.0'],
          answerIdx: 0,
          explain:
            '130.0 ÷ 65.0 = 2.0, generally considered comfortable. The 0.5 answer inverts the ratio — always put the resources on top and the obligations underneath. The 1.08 figure is the quick ratio, which strips out inventory and prepaid expenses.',
        },
        {
          id: 'u04-l02-q2',
          prompt:
            'Cascade holds $30.0M cash, $40.0M receivables, $55.0M inventory and $5.0M prepaids against $65.0M of current liabilities. What is the quick ratio?',
          choices: ['2.0', '1.5', '1.08', '0.46'],
          answerIdx: 2,
          explain:
            'The quick ratio counts only cash and receivables: (30.0 + 40.0) ÷ 65.0 = 1.08. Inventory is excluded precisely because it is the asset least likely to fetch its carrying value in a hurry — a roaster forced to liquidate stale coffee will not recover $55.0M. The 2.0 answer is the current ratio, which does include it.',
        },
        {
          id: 'u04-l02-q3',
          prompt:
            'Cascade\'s inventory grew 25.0% while revenue grew 19.0%. Why does that gap deserve attention?',
          choices: [
            'It is unambiguously good — the company is stocking up ahead of growth',
            'Inventory is growing faster than sales, which can signal slowing demand and future write-downs',
            'It means gross margin must have improved',
            'It has no cash-flow consequence, since inventory is an asset',
          ],
          answerIdx: 1,
          explain:
            'Inventory rising faster than revenue means goods are accumulating faster than customers are taking them — a pattern that has preceded countless margin write-downs. It also consumes cash: every extra dollar of inventory is a dollar paid to suppliers and not yet recovered from customers. Building stock ahead of a genuine demand surge is a possible innocent explanation, which is why it is a question to ask rather than a verdict.',
        },
        {
          id: 'u04-l02-q4',
          prompt: 'What does the accounts receivable line represent?',
          choices: [
            'Cash the company owes its suppliers',
            'A liability created by customer deposits taken in advance',
            'Inventory that has been paid for but not yet delivered',
            'Revenue already recognised on the income statement but not yet collected in cash',
          ],
          answerIdx: 3,
          explain:
            'Receivables are the accounting bridge between accrual revenue and cash: the sale is booked, the invoice is outstanding. Money owed *to* suppliers is accounts **payable**, on the liability side — mixing up receivable and payable is the most common beginner error on the balance sheet. Customer deposits are deferred revenue, also a liability.',
        },
      ],
      cardSeeds: [
        {
          id: 'u04-l02-c1',
          kind: 'cloze',
          front: 'Formula: current ratio = ____ ÷ ____.',
          back: 'current assets ÷ current liabilities (Cascade: 130.0 ÷ 65.0 = 2.0)',
        },
        {
          id: 'u04-l02-c2',
          kind: 'basic',
          front: 'Quick ratio — formula and why it differs from the current ratio',
          back: '(Cash + receivables) ÷ current liabilities. It excludes inventory and prepaids because those are the current assets least likely to convert to cash at full value in a hurry.',
        },
        {
          id: 'u04-l02-c3',
          kind: 'basic',
          front: 'Accounts receivable vs. accounts payable',
          back: 'Receivable = an ASSET: revenue booked, cash not yet collected from customers. Payable = a LIABILITY: goods received, cash not yet paid to suppliers.',
        },
        {
          id: 'u04-l02-c4',
          kind: 'basic',
          front: 'Why is inventory growing faster than revenue a warning sign?',
          back: 'Goods are piling up faster than customers take them — signalling slowing demand, and risking a write-down that hits gross margin later. It also consumes cash today.',
        },
      ],
    },

    // ── L03 ───────────────────────────────────────────────────────────────
    {
      id: 'u04-l03',
      unitId: 'u04',
      order: 3,
      title: 'Long-Term Assets',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Below the current section sit the assets the company intends to *use*, not sell.

**Property, plant & equipment (PP&E)** is the physical base: land, buildings, roasters, espresso machines, store fit-outs, vehicles. It is carried at **cost less accumulated depreciation**:

| Cascade PP&E | FY2024 | FY2023 |
|---|---|---|
| PP&E at cost | 250.0 | 215.0 |
| Accumulated depreciation | (110.0) | (90.0) |
| **PP&E, net** | **140.0** | **125.0** |

The roll-forward is simple and worth memorising: **opening net PP&E + capex − depreciation = closing net PP&E**. For Cascade: 125.0 + 35.0 − 20.0 = **140.0**. That is the first thread tying the balance sheet to the cash flow statement.`,
        },
        {
          kind: 'text',
          md: `**Intangible assets** are non-physical rights with value: patents, licences, acquired brands, customer relationships, purchased software. Crucially, an intangible generally only appears on the balance sheet if it was **bought**. A brand built over forty years of advertising is carried at **zero** — which is a large part of why book value understates so many great companies.

Finite-lived intangibles are **amortized** (Cascade charged $5.0M in FY2024). Indefinite-lived ones, including goodwill, are not amortized under US GAAP — they are **tested for impairment** instead.`,
        },
        {
          kind: 'example',
          md: `**Where Cascade's $60.0M of goodwill came from.** Goodwill is not a thing you can point at. It is a plug figure created by acquisitions:

> **Goodwill = purchase price − fair value of identifiable net assets acquired**

**Ridgeline Roasters, 2022.** Cascade paid **$83.0M** for a competitor whose identifiable net assets — buildings, equipment, inventory, brand, recipes, less its debts — were fairly valued at **$35.0M**.

- 83.0 − 35.0 = **$48.0M of goodwill**

**Basalt Bakehouse, June 2024.** Cascade paid **$20.0M cash** in a distressed sale for twelve leased cafés and a wholesale book. Identifiable intangibles (café brand, customer relationships) were valued at $8.0M; the leases went on as equal right-of-use assets and lease liabilities; net tangible assets were negligible.

- 20.0 − 8.0 = **$12.0M of goodwill**

Total goodwill: 48.0 + 12.0 = **$60.0M**, which is **15% of Cascade's total assets**. That single number tells you Cascade is an acquirer — it has repeatedly paid more than the accountable pieces of the businesses it bought.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Goodwill is an asset, so it's worth something I could sell."

Goodwill cannot be sold, pledged, or separated from the business. It is the accounting record of *a price once paid*, nothing more. Its only real information content is historical: **large goodwill means large past acquisitions**, and the honest question is whether those deals earned their price.

When they don't, the company takes a **goodwill impairment** — a non-cash write-down that admits the acquisition underdelivered. It doesn't touch cash and it doesn't change the business, but it is management publicly marking its own homework, and it is worth taking seriously. Many analysts compute **tangible book value** (equity − goodwill − intangibles) precisely to see what is left without it: for Cascade that is 140.0 − 60.0 − 20.0 = **$60.0M**.`,
        },
        {
          kind: 'keypoint',
          md: `Net PP&E = cost − accumulated depreciation, and rolls forward as opening + capex − depreciation. Goodwill = acquisition price − fair value of identifiable net assets: a record of past deals, never a saleable asset.`,
        },
      ],
      quiz: [
        {
          id: 'u04-l03-q1',
          prompt:
            'Cascade carries PP&E at $250.0M of cost less $110.0M of accumulated depreciation, for $140.0M net. What does that net figure represent?',
          choices: [
            'The amount the assets would fetch if sold today',
            'Original cost less depreciation charged so far — an accounting figure, not market value',
            'The cost of replacing the store base at today\'s prices',
            'The cash spent on property and equipment during FY2024',
          ],
          answerIdx: 1,
          explain:
            'Net PP&E is a historical-cost figure worn down by an estimated depreciation schedule; it makes no claim about resale or replacement value. A fully depreciated roaster carried at zero may still run perfectly and be worth real money. The FY2024 cash spent on assets was capex of $35.0M, a cash-flow statement item.',
        },
        {
          id: 'u04-l03-q2',
          prompt: 'How is goodwill created?',
          choices: [
            'By an annual appraisal of the company\'s brand value',
            'By setting aside cash reserved for future acquisitions',
            'By the market paying more for the stock than its book value',
            'By paying more for an acquired company than the fair value of its identifiable net assets',
          ],
          answerIdx: 3,
          explain:
            'Goodwill arises only in an acquisition, as the excess of purchase price over the fair value of the identifiable assets and liabilities acquired. Cascade: $83.0M paid for Ridgeline against $35.0M of identifiable net assets creates $48.0M of goodwill. A company can never create goodwill by valuing its own brand — internally built brands are carried at zero.',
        },
        {
          id: 'u04-l03-q3',
          prompt: 'Cascade carries $60.0M of goodwill, 15% of total assets. What does that imply?',
          choices: [
            'That the company has bought other businesses and paid more than their identifiable net assets were worth',
            'That it owns $60 million of land and buildings it could sell',
            'That management estimates the Cascade brand is worth $60 million',
            'That $60 million of its cash is restricted and unavailable',
          ],
          answerIdx: 0,
          explain:
            'A large goodwill balance is a historical record of acquisitions and the premiums paid for them — for Cascade, $48.0M from Ridgeline and $12.0M from Basalt. It corresponds to no saleable asset, which is why analysts compute tangible book value (equity − goodwill − intangibles = $60.0M here) to see the balance sheet without it.',
        },
        {
          id: 'u04-l03-q4',
          prompt: 'How is goodwill treated after an acquisition under US GAAP?',
          choices: [
            'It is depreciated on a straight line over 40 years',
            'It is revalued upward when the acquired business outperforms',
            'It is tested for impairment, and a write-down is a non-cash admission the acquisition underdelivered',
            'It is removed from the balance sheet automatically after five years',
          ],
          answerIdx: 2,
          explain:
            'Goodwill is not amortized; it sits at cost until an impairment test shows the acquired business is worth less than its carrying amount, at which point it is written down. The write-down is non-cash — no money moves and the business is unchanged — but it is management conceding the deal disappointed. Goodwill is never written back up, so the accounting is deliberately one-directional.',
        },
      ],
      cardSeeds: [
        {
          id: 'u04-l03-c1',
          kind: 'cloze',
          front: 'PP&E roll-forward: opening net PP&E + ____ − ____ = closing net PP&E.',
          back: 'capital expenditures; depreciation (Cascade: 125.0 + 35.0 − 20.0 = 140.0)',
        },
        {
          id: 'u04-l03-c2',
          kind: 'basic',
          front: 'Formula: goodwill',
          back: 'Goodwill = acquisition purchase price − fair value of identifiable net assets acquired. It arises only in acquisitions.',
        },
        {
          id: 'u04-l03-c3',
          kind: 'basic',
          front: 'Why is goodwill not a saleable asset?',
          back: 'It cannot be separated from the business or sold. It is the accounting record of a premium once paid — its only information is that the company made acquisitions and how much it overpaid relative to identifiable assets.',
        },
        {
          id: 'u04-l03-c4',
          kind: 'basic',
          front: 'What is tangible book value, and why compute it?',
          back: 'Equity − goodwill − intangibles. It shows the balance sheet stripped of acquisition premiums. Cascade: 140.0 − 60.0 − 20.0 = $60.0M.',
        },
      ],
    },

    // ── L04 ───────────────────────────────────────────────────────────────
    {
      id: 'u04-l04',
      unitId: 'u04',
      order: 4,
      title: 'Liabilities & Debt',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Liabilities split by *when they come due*.

**Current liabilities** (within twelve months): accounts payable to suppliers, accrued expenses (wages earned but unpaid, taxes owed), deferred revenue, and the **current portion of long-term debt** — the slice of borrowings maturing inside a year.

**Non-current liabilities**: long-term debt, lease liabilities, deferred taxes, pension obligations.

Not all liabilities are equal. **Accounts payable is free financing** — suppliers letting you hold their goods before paying is an interest-free loan. **Debt costs money and can force a company into bankruptcy.** Lumping them together as "what the company owes" loses the distinction that actually matters.`,
        },
        {
          kind: 'text',
          md: `**Debt comes in two main flavours:**

- A **revolver** (revolving credit facility) is a committed line of credit a company can draw down, repay, and draw again — a corporate credit card for working capital. It usually floats with benchmark rates, so the cost rises when rates rise.
- A **bond** or **term loan** is a fixed amount borrowed for a fixed term at a fixed schedule. Bonds are securities sold to investors and traded; term loans are held by banks.

**Leases** joined the balance sheet properly in 2019 (ASC 842). Before that, most rental commitments were footnotes — a company could operate a thousand leased stores and show almost no obligation. Now the present value of the lease payments sits as a **lease liability**, with a matching **right-of-use asset**. Cascade's $50.0M of lease liabilities are real obligations, and for retailers and restaurant chains this line is often larger than their actual debt.`,
        },
        {
          kind: 'example',
          md: `**Cascade's debt, and what it costs:**

| | FY2024 | FY2023 |
|---|---|---|
| Current portion of long-term debt | 10.0 | 10.0 |
| Long-term debt | 140.0 | 114.0 |
| **Total debt** | **150.0** | **124.0** |
| Less: cash | (30.0) | (22.0) |
| **Net debt** | **120.0** | **102.0** |

Debt rose **$26.0M** in FY2024 — Cascade borrowed to fund the $20.0M Basalt acquisition and part of its $35.0M of store construction.

The standard leverage test uses EBITDA (FY2024: $65.0M):

> **Net debt ÷ EBITDA = 120.0 ÷ 65.0 = 1.8×**

Rules of thumb: under 2.0× is conservative for a stable consumer business, 3–4× is aggressive, above 5× is where lenders start writing restrictive covenants. Cascade at **1.8×** has room — though adding the $50.0M of lease liabilities pushes adjusted leverage to about **2.6×**, which is how a credit analyst would actually see it.

**Interest coverage** is the other essential test: **EBIT ÷ interest expense = 40.0 ÷ 10.0 = 4.0×**. Operating profit covers the interest bill four times over.`,
        },
        {
          kind: 'callout',
          md: `**The maturity wall.** Debt does not just have a size, it has a **calendar**. The 10-K contains a table of principal due in each of the next five years. If $120.0M of Cascade's $150.0M came due in a single year, that year would be a **maturity wall** — the company must refinance at whatever interest rates and credit conditions happen to exist then, regardless of how the business is performing.

Companies rarely fail because they are unprofitable. They fail because an obligation comes due and the money to meet it isn't there. Staggered maturities are a genuine measure of financial safety, and the table showing them is one of the highest-value pages in any filing.`,
        },
        {
          kind: 'keypoint',
          md: `Net debt = total debt − cash; leverage = net debt ÷ EBITDA (Cascade 1.8×); interest coverage = EBIT ÷ interest (4.0×). Check the *maturity schedule*, not just the total — and remember leases are debt-like obligations.`,
        },
      ],
      quiz: [
        {
          id: 'u04-l04-q1',
          prompt:
            'Cascade shows a $10.0M current portion of long-term debt and $140.0M of long-term debt. What is total debt?',
          choices: ['$140 million', '$150 million', '$120 million', '$260 million'],
          answerIdx: 1,
          explain:
            'Total debt = $10.0M + $140.0M = $150.0M. Counting only the $140.0M long-term line is the classic omission — the current portion is still borrowed money, it is simply due sooner. The $120M figure is *net* debt after subtracting cash, and $260M is total liabilities including payables and leases.',
        },
        {
          id: 'u04-l04-q2',
          prompt:
            'Cascade has $150.0M of debt, $30.0M of cash and $65.0M of EBITDA. What is net debt / EBITDA?',
          choices: ['2.3×', '0.5×', '3.1×', '1.8×'],
          answerIdx: 3,
          explain:
            'Net debt = 150.0 − 30.0 = $120.0M, so 120.0 ÷ 65.0 = 1.8×. The 2.3× answer uses gross debt without netting cash. Both conventions exist and analysts use them for different purposes, so state which you mean — but net debt is the more common leverage measure for a cash-generative business.',
        },
        {
          id: 'u04-l04-q3',
          prompt: 'What is a "maturity wall"?',
          choices: [
            'The legal maximum a company is allowed to borrow',
            'The point at which a revolver automatically converts into equity',
            'A year in which a large share of a company\'s debt comes due at once, forcing refinancing at whatever rates then prevail',
            'The interest-rate ceiling written into a bond covenant',
          ],
          answerIdx: 2,
          explain:
            'Concentrated maturities force a company to refinance at a single moment it did not choose — potentially into a closed credit market or a much higher rate environment. This is how profitable companies fail: not from losses, but from an obligation coming due when funding is unavailable. The five-year maturity table in the 10-K is where you check for it.',
        },
        {
          id: 'u04-l04-q4',
          prompt: 'What distinguishes a revolver from a bond?',
          choices: [
            'A revolver is a committed credit line drawn and repaid as needed; a bond is a fixed-term debt security sold to investors',
            'A bond can be drawn and repaid repeatedly as needs change',
            'A revolver is a fixed-rate ten-year instrument sold to the public',
            'Both are classified as equity because they are long-term',
          ],
          answerIdx: 0,
          explain:
            'A revolver behaves like a corporate credit card — flexible, usually floating-rate, sized for working-capital swings. A bond is a fixed principal for a fixed term, traded among investors. Neither is equity: both are contractual obligations that must be repaid, which is precisely what separates debt from ownership.',
        },
      ],
      cardSeeds: [
        {
          id: 'u04-l04-c1',
          kind: 'cloze',
          front: 'Formula: net debt = ____ − ____. Leverage = net debt ÷ ____.',
          back: 'total debt (including the current portion) − cash; ÷ EBITDA. Cascade: (150.0 − 30.0) ÷ 65.0 = 1.8×',
        },
        {
          id: 'u04-l04-c2',
          kind: 'basic',
          front: 'Formula: interest coverage ratio',
          back: 'EBIT ÷ interest expense. Cascade: 40.0 ÷ 10.0 = 4.0× — operating profit covers the interest bill four times over.',
        },
        {
          id: 'u04-l04-c3',
          kind: 'basic',
          front: 'Revolver vs. bond',
          back: 'Revolver: a committed credit line, drawn and repaid repeatedly, usually floating-rate. Bond/term loan: a fixed principal borrowed for a fixed term at a set schedule.',
        },
        {
          id: 'u04-l04-c4',
          kind: 'basic',
          front: 'What is a maturity wall, and why does it matter more than total debt?',
          back: 'A year when a large share of debt comes due at once, forcing refinancing at whatever rates then exist. Companies usually fail from an obligation coming due, not from losses — check the five-year maturity table.',
        },
      ],
    },

    // ── L05 ───────────────────────────────────────────────────────────────
    {
      id: 'u04-l05',
      unitId: 'u04',
      order: 5,
      title: 'Shareholders\' Equity',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `Equity is the residual, and it is built from three main pieces:

- **Common stock & additional paid-in capital (APIC)** — the cumulative cash (and share-based compensation) that owners have *put in*. Cascade: **$95.0M**.
- **Retained earnings** — the cumulative profits the company has *kept* since its founding, less every dividend ever paid and every loss ever taken. Cascade: **$60.0M**.
- **Treasury stock** — shares the company has bought back. It is a **contra-equity** account, shown as a negative. Cascade: **$(15.0)M**.

95.0 + 60.0 − 15.0 = **$140.0M** of total equity.`,
        },
        {
          kind: 'example',
          md: `**The equity roll-forward** — the second thread joining the statements. Every change in equity has a source:

| | $M |
|---|---|
| Equity, start of FY2024 | 115.5 |
| + Net income | 22.5 |
| + Stock-based compensation | 9.0 |
| − Share repurchases | (7.0) |
| **Equity, end of FY2024** | **140.0** |

And inside that, retained earnings on its own: **37.5 + 22.5 net income − 0 dividends = 60.0**.

That second line is the single most important link between two statements: **net income flows into retained earnings.** Profit doesn't vanish at the bottom of the income statement; it lands here.

Note also the honest picture of buybacks: Cascade spent **$7.0M** repurchasing stock while issuing **$9.0M** of stock-based compensation. Net of both, the company issued more equity than it retired — the share count *rose*, which is exactly why diluted shares went from 31.0M to 31.5M in Unit 3.`,
        },
        {
          kind: 'text',
          md: `**Book value per share** = total equity ÷ shares outstanding = 140.0 ÷ 30.0 = **$4.67**. At $18.00 a share, Cascade trades at a **price-to-book of 3.9×**.

Whether that means anything depends entirely on the industry:

- **Banks and insurers** — most assets are financial instruments carried near market value, so book value approximates real net worth. Price-to-book is a serious valuation tool here.
- **Asset-light businesses** — software, consumer brands, services — carry their most valuable assets (code, brands, people) at or near zero. Book value is close to meaningless, and price-to-book ratios of 10× or 30× are routine and uninformative.

Cascade sits in between: real physical assets, but also brands and locations worth far more than their carrying cost.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Negative equity means the company is bankrupt."

Not necessarily. Equity goes negative when cumulative losses, or aggressive buybacks, exceed everything ever paid in — and several highly profitable, cash-generative companies have run negative book equity for years after buying back enormous amounts of stock. Book equity is an accounting residual, not a solvency test.

**Cash flow and debt maturities determine solvency**, not book value. Equally, a large positive equity balance stuffed with goodwill from bad acquisitions can be far less reassuring than it looks.`,
        },
        {
          kind: 'keypoint',
          md: `Equity = paid-in capital + retained earnings − treasury stock. Net income flows into retained earnings — the primary link between the income statement and the balance sheet. Book value matters for financials, far less for asset-light businesses.`,
        },
      ],
      quiz: [
        {
          id: 'u04-l05-q1',
          prompt: 'What does the retained earnings balance represent?',
          choices: [
            'Cash the company has retained in its bank accounts',
            'The par value of shares issued at the IPO',
            'Cumulative profits kept in the business since inception, less all dividends and losses',
            'Profit set aside specifically to fund next year\'s buybacks',
          ],
          answerIdx: 2,
          explain:
            'Retained earnings is a lifetime running total: every year\'s net income added, every dividend subtracted. The "cash retained" answer is the important trap — retained earnings is not a pot of money. Cascade shows $60.0M of retained earnings and only $30.0M of cash, because the profits were long ago converted into roasters, stores and inventory.',
        },
        {
          id: 'u04-l05-q2',
          prompt: 'What is treasury stock?',
          choices: [
            'Shares the company has bought back, shown as a negative (contra) item that reduces equity',
            'US Treasury bonds the company holds as an investment',
            'Shares reserved for the employee stock option pool',
            'Cash the company deposits with the US Treasury',
          ],
          answerIdx: 0,
          explain:
            'Repurchased shares are recorded at cost as a deduction from equity — Cascade\'s $(15.0)M reduces total equity rather than adding an asset. The Treasury-bond answer plays on the name; those would sit in cash and investments. Treasury stock also carries no votes and receives no dividends.',
        },
        {
          id: 'u04-l05-q3',
          prompt:
            'Cascade has $140.0M of equity and 30.0M shares outstanding. What is book value per share?',
          choices: ['$13.33', '$4.67', '$2.00', '$18.00'],
          answerIdx: 1,
          explain:
            '140.0 ÷ 30.0 = $4.67. The $18.00 answer is the market price, and dividing one by the other gives a price-to-book of 3.9×. The $2.00 figure comes from *tangible* book value ($60.0M, excluding goodwill and intangibles) — a legitimate alternative measure, but not what "book value per share" means by default. The $13.33 answer divides total assets by shares, ignoring the $260.0M owed to creditors.',
        },
        {
          id: 'u04-l05-q4',
          prompt: 'When is book value most useful as a valuation input?',
          choices: [
            'For software companies, whose most valuable assets sit on the balance sheet',
            'Always — it is the most reliable single measure of what a company is worth',
            'Never — book value carries no information for any business',
            'For banks and insurers, whose assets are largely financial instruments carried near market value',
          ],
          answerIdx: 3,
          explain:
            'Financial firms hold portfolios of loans and securities marked at or near market, so book equity approximates real net worth and price-to-book is genuinely informative. Software companies are the opposite case: their code, brands and people are carried at nearly zero, so book value understates them massively — which is why price-to-book ratios of 10× or more are unremarkable there.',
        },
      ],
      cardSeeds: [
        {
          id: 'u04-l05-c1',
          kind: 'cloze',
          front:
            'Shareholders\' equity = ____ capital + ____ earnings − ____ stock.',
          back: 'paid-in capital + retained earnings − treasury stock (Cascade: 95.0 + 60.0 − 15.0 = 140.0)',
        },
        {
          id: 'u04-l05-c2',
          kind: 'basic',
          front: 'Where does net income go on the balance sheet?',
          back: 'Into retained earnings, inside shareholders\' equity. Retained earnings = opening balance + net income − dividends. This is the main link between the income statement and the balance sheet.',
        },
        {
          id: 'u04-l05-c3',
          kind: 'basic',
          front: 'When does book value matter, and when does it not?',
          back: 'Matters for banks and insurers (assets carried near market value). Matters little for asset-light software, brands and services, whose key assets are carried at or near zero.',
        },
      ],
    },

    // ── L06 ───────────────────────────────────────────────────────────────
    {
      id: 'u04-l06',
      unitId: 'u04',
      order: 6,
      title: 'Working Capital',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**Net working capital (NWC) = current assets − current liabilities.** Cascade FY2024: 130.0 − 65.0 = **$65.0M**.

For analysis, the more useful version strips out cash and debt to focus on the *operating* cycle:

> **Operating working capital = receivables + inventory − payables**

Cascade: 40.0 + 55.0 − 35.0 = **$60.0M**. That is $60.0M of cash permanently tied up in the machinery of selling coffee — money the company has spent on beans and extended to customers, which it will not see again until the cycle completes.`,
        },
        {
          kind: 'text',
          md: `The **cash conversion cycle (CCC)** measures how long that money is trapped, in days:

> **CCC = DSO + DIO − DPO**

- **DSO** (days sales outstanding) = AR ÷ revenue × 365 — how long customers take to pay you.
- **DIO** (days inventory outstanding) = inventory ÷ COGS × 365 — how long goods sit before they sell.
- **DPO** (days payable outstanding) = AP ÷ COGS × 365 — how long you take to pay suppliers.

You want DSO and DIO **low** (collect fast, turn stock fast) and DPO **high** (pay suppliers slowly, using their money for free). A **shorter CCC is better**, and a **negative** CCC — customers pay you before you pay suppliers — is a superpower: it means growth *generates* cash instead of consuming it. Supermarkets and some large retailers run negative cycles.`,
        },
        {
          kind: 'example',
          md: `**Cascade's cash conversion cycle, two years:**

| | FY2024 | FY2023 |
|---|---|---|
| DSO = AR ÷ revenue × 365 | 40.0 ÷ 500.0 × 365 = **29 days** | 32.0 ÷ 420.0 × 365 = **28 days** |
| DIO = inventory ÷ COGS × 365 | 55.0 ÷ 300.0 × 365 = **67 days** | 44.0 ÷ 256.2 × 365 = **63 days** |
| DPO = AP ÷ COGS × 365 | 35.0 ÷ 300.0 × 365 = **43 days** | 30.0 ÷ 256.2 × 365 = **43 days** |
| **CCC** | **29 + 67 − 43 = 53 days** | **28 + 63 − 43 = 48 days** |

Cascade's cycle **lengthened by 5 days**. Coffee now sits 4 days longer before selling, and customers take 1 day longer to pay, while suppliers were not paid any slower to compensate.

**What five days costs.** Operating working capital rose from $46.0M to $60.0M — **$14.0M of cash consumed**, against net income of $22.5M. Growth alone explains part of it (a bigger company needs more inventory), but the *deteriorating cycle* explains the rest, and it is the part management could have controlled.`,
        },
        {
          kind: 'callout',
          md: `**Why profitable, fast-growing companies go bankrupt.**

Every new sale requires buying inventory *first* and waiting to be paid *after*. At a 53-day cycle, a company growing 40% a year must fund an ever-larger pile of beans and receivables out of cash it has not yet collected. Profit on the income statement rises; the bank balance falls. The technical term is **overtrading**, and it kills genuinely good businesses.

This is why "revenue growth" and "cash generation" are separate questions, and why a growth company's working capital line deserves as much attention as its margins.`,
        },
        {
          kind: 'keypoint',
          md: `CCC = DSO + DIO − DPO. Shorter is better; negative means growth funds itself. Rising receivables and inventory consume cash — which is how a profitable, fast-growing company can still run out of money.`,
        },
      ],
      quiz: [
        {
          id: 'u04-l06-q1',
          prompt:
            'Cascade has $130.0M of current assets and $65.0M of current liabilities. What is net working capital?',
          choices: ['$65 million', '$60 million', '$130 million', '$40 million'],
          answerIdx: 0,
          explain:
            'NWC = current assets − current liabilities = 130.0 − 65.0 = $65.0M. The $60M distractor is *operating* working capital (receivables + inventory − payables = 40 + 55 − 35), which excludes cash and debt to isolate the operating cycle. Both are used; say which one you mean.',
        },
        {
          id: 'u04-l06-q2',
          prompt:
            'Cascade has $40.0M of receivables on $500.0M of revenue. What is days sales outstanding?',
          choices: ['67 days', '43 days', '53 days', '29 days'],
          answerIdx: 3,
          explain:
            'DSO = AR ÷ revenue × 365 = 40.0 ÷ 500.0 × 365 = 29 days — customers pay in about a month. The 67-day answer is DIO, which uses inventory over COGS, and 43 is DPO. The key detail: DSO uses **revenue** as the denominator because receivables arise from sales, while DIO and DPO use **COGS** because inventory and payables are recorded at cost.',
        },
        {
          id: 'u04-l06-q3',
          prompt: 'What is the formula for the cash conversion cycle?',
          choices: ['DSO + DIO + DPO', 'DSO − DIO + DPO', 'DSO + DIO − DPO', 'DPO + DIO − DSO'],
          answerIdx: 2,
          explain:
            'CCC = DSO + DIO − DPO. The logic drives the signs: waiting for customers (DSO) and holding stock (DIO) both trap your cash, while delaying supplier payment (DPO) uses *their* cash and gives yours back. Only DPO gets the minus sign.',
        },
        {
          id: 'u04-l06-q4',
          prompt:
            'Cascade\'s DSO is 29 days, DIO is 67 days and DPO is 43 days. What is its cash conversion cycle?',
          choices: ['139 days', '53 days', '5 days', '96 days'],
          answerIdx: 1,
          explain:
            '29 + 67 − 43 = 53 days. The 139-day answer adds all three, forgetting that supplier credit shortens the cycle. Fifty-three days means every dollar Cascade spends on coffee takes almost two months to come back as cash — which is precisely why growing 19% consumed $14.0M of working capital this year.',
        },
        {
          id: 'u04-l06-q5',
          prompt: 'Why can a profitable, fast-growing company still run out of cash?',
          choices: [
            'Each new sale requires funding inventory and receivables before the cash arrives, so growth consumes cash',
            'Growing companies are taxed at higher rates',
            'Revenue growth automatically compresses gross margin',
            'Auditors require rapidly growing companies to hold larger cash reserves',
          ],
          answerIdx: 0,
          explain:
            'With a positive cash conversion cycle, every extra dollar of sales demands an upfront investment in stock and credit that comes back only weeks later. Faster growth means a bigger gap — profit rises on paper while the bank balance drains, the failure mode known as overtrading. Nothing about growth changes tax rates or forces margins down; the constraint is purely the timing of cash.',
        },
      ],
      cardSeeds: [
        {
          id: 'u04-l06-c1',
          kind: 'cloze',
          front: 'Formula: cash conversion cycle = ____ + ____ − ____.',
          back: 'DSO + DIO − DPO (Cascade FY2024: 29 + 67 − 43 = 53 days)',
        },
        {
          id: 'u04-l06-c2',
          kind: 'basic',
          front: 'DSO, DIO, DPO — formulas and which denominator each uses',
          back: 'DSO = AR ÷ revenue × 365. DIO = inventory ÷ COGS × 365. DPO = AP ÷ COGS × 365. DSO uses revenue; DIO and DPO use COGS, because inventory and payables are carried at cost.',
        },
        {
          id: 'u04-l06-c3',
          kind: 'basic',
          front: 'What does a negative cash conversion cycle mean?',
          back: 'Customers pay before suppliers are paid, so growth generates cash instead of consuming it. Supermarkets and some large retailers run negative cycles — a structural advantage.',
        },
        {
          id: 'u04-l06-c4',
          kind: 'basic',
          front: 'What is overtrading?',
          back: 'Growing so fast that funding inventory and receivables drains cash faster than profits replace it. A profitable company can go bankrupt this way — growth consumes cash whenever the CCC is positive.',
        },
      ],
    },

    // ── L07 ───────────────────────────────────────────────────────────────
    {
      id: 'u04-l07',
      unitId: 'u04',
      order: 7,
      title: 'The Cash Flow Statement',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `The cash flow statement exists because net income can be shaped by estimates and timing, but the bank balance cannot. It reconciles the cash a company started the year with to the cash it ended with, sorted into three buckets:

- **CFO — cash from operating activities.** Cash generated by running the business. The one that matters most.
- **CFI — cash from investing activities.** Buying and selling long-term assets: capital expenditure, acquisitions, purchases of securities. Usually negative for a growing company.
- **CFF — cash from financing activities.** Dealings with lenders and shareholders: borrowing, repaying, issuing stock, buybacks, dividends.

**CFO + CFI + CFF = the change in cash.** No exceptions, no estimates.`,
        },
        {
          kind: 'text',
          md: `Almost every company presents CFO by the **indirect method**, which looks strange until you see the logic. It starts at net income and *undoes* the accrual accounting:

1. **Start with net income** — the accrual answer.
2. **Add back non-cash charges** — depreciation, amortization, stock-based compensation. These reduced profit but no cash left.
3. **Adjust for working-capital swings** — if receivables grew, cash was booked as revenue but never collected, so subtract it. If payables grew, expenses were booked but not paid, so add it back.
4. **The result is cash actually generated by operations.**

The rule for step 3 in one line: **an asset going up uses cash; a liability going up provides cash.**`,
        },
        {
          kind: 'example',
          md: `**Cascade Coffee Co. — consolidated statement of cash flows, FY2024** *(in millions)*

| | $M |
|---|---|
| **Operating activities** | |
| Net income | 22.5 |
| Depreciation & amortization | 25.0 |
| Stock-based compensation | 9.0 |
| Deferred income taxes | 0.5 |
| Increase in accounts receivable | (8.0) |
| Increase in inventory | (11.0) |
| Increase in prepaid expenses | (1.0) |
| Increase in accounts payable | 5.0 |
| Increase in accrued expenses | 2.0 |
| **Cash from operations (CFO)** | **44.0** |
| **Investing activities** | |
| Capital expenditures | (35.0) |
| Acquisition of Basalt Bakehouse | (20.0) |
| **Cash used in investing (CFI)** | **(55.0)** |
| **Financing activities** | |
| Proceeds from long-term debt | 40.0 |
| Repayment of long-term debt | (14.0) |
| Repurchase of common stock | (7.0) |
| **Cash from financing (CFF)** | **19.0** |
| **Net change in cash** | **8.0** |
| Cash at beginning of year | 22.0 |
| **Cash at end of year** | **30.0** |

Every number ties. 44.0 − 55.0 + 19.0 = **8.0**, and 22.0 + 8.0 = **30.0** — the exact cash balance on the balance sheet. The working-capital block sums to **$(13.0)M**: the cash cost of that lengthening cash conversion cycle, appearing here in black and white.

Read the three lines together and you have Cascade's whole year in one sentence: **operations threw off $44.0M, the company spent $55.0M expanding, and it borrowed the difference.**`,
        },
        {
          kind: 'callout',
          md: `**The pattern that catches accounting problems early:** net income rising while CFO stagnates or falls.

Profit is an opinion assembled from estimates; cash is a fact. When the two diverge for several quarters, the gap is almost always sitting in receivables (revenue booked to customers who aren't paying) or inventory (goods produced that aren't selling). Both were visible on Enron's, Lucent's, and countless smaller frauds' statements *before* the collapse.

A quick sanity check used by professionals: over any multi-year stretch, cumulative CFO should meaningfully exceed cumulative net income, because depreciation gets added back. If it does not, ask why.`,
        },
        {
          kind: 'keypoint',
          md: `CFO + CFI + CFF = change in cash. The indirect method starts at net income, adds back non-cash charges, and adjusts for working capital: assets up = cash out, liabilities up = cash in.`,
        },
      ],
      quiz: [
        {
          id: 'u04-l07-q1',
          prompt: 'In which section of the cash flow statement do capital expenditures appear?',
          choices: [
            'Operating activities',
            'Financing activities',
            'Supplemental disclosures only',
            'Investing activities',
          ],
          answerIdx: 3,
          explain:
            'Capex is the purchase of long-term productive assets, so it sits in investing activities — Cascade\'s $(35.0)M. This placement is exactly why free cash flow has to be computed manually as CFO minus capex: the two numbers live in different sections, and no single reported line combines them.',
        },
        {
          id: 'u04-l07-q2',
          prompt: 'Under the indirect method, what is the starting point for cash from operations?',
          choices: ['Revenue', 'Net income', 'EBITDA', 'The prior year\'s cash balance'],
          answerIdx: 1,
          explain:
            'The indirect method begins at net income and works backwards, reversing every non-cash item and timing difference embedded in it. Starting from revenue would be the *direct* method, which is permitted but almost never used because it requires data companies do not otherwise compile.',
        },
        {
          id: 'u04-l07-q3',
          prompt: 'Why is depreciation added back when computing cash from operations?',
          choices: [
            'Because depreciation is a cash outflow that was recorded twice',
            'Because the charge will be reversed in a later year',
            'Because it was subtracted on the income statement but no cash left the business this period',
            'Because depreciation belongs in investing activities instead',
          ],
          answerIdx: 2,
          explain:
            'The cash went out when the asset was bought (recorded as capex in investing); depreciation merely spreads that historical cost across later years. Adding it back removes a non-cash deduction, it does not create cash. Cascade added back $25.0M of D&A, which alone accounts for most of the gap between $22.5M of profit and $44.0M of operating cash.',
        },
        {
          id: 'u04-l07-q4',
          prompt:
            'Cascade\'s accounts receivable rose $8.0M during FY2024. What is the effect on cash from operations?',
          choices: [
            'It reduces CFO by $8.0M — sales were booked but the cash was not collected',
            'It increases CFO by $8.0M, since receivables are an asset',
            'It has no effect on CFO; receivables only affect the balance sheet',
            'It appears in financing activities as a use of cash',
          ],
          answerIdx: 0,
          explain:
            'An operating asset increasing is a use of cash: revenue was recognised in net income, but $8.0M of it is still sitting with customers. The general rule is worth memorising — assets up, cash out; liabilities up, cash in — which is why Cascade\'s rising payables (+$5.0M) went the other way and *added* to CFO.',
        },
        {
          id: 'u04-l07-q5',
          prompt: 'Where do share repurchases appear on the cash flow statement?',
          choices: [
            'Operating activities, as a compensation-related cost',
            'Investing activities, as a purchase of securities',
            'They do not appear on the cash flow statement at all',
            'Financing activities, as a use of cash',
          ],
          answerIdx: 3,
          explain:
            'Buybacks are a transaction with shareholders, so they belong in financing — Cascade\'s $(7.0)M. The "investing" answer is the tempting one, since the company is technically buying shares, but investing activities cover assets acquired to *use* or hold; repurchased stock is retired capital, not an asset.',
        },
      ],
      cardSeeds: [
        {
          id: 'u04-l07-c1',
          kind: 'cloze',
          front: 'The three sections of the cash flow statement: ____, ____, and ____.',
          back: 'Operating (CFO), investing (CFI), financing (CFF). CFO + CFI + CFF = the change in cash.',
        },
        {
          id: 'u04-l07-c2',
          kind: 'basic',
          front: 'The indirect method in four steps',
          back: '1) Start at net income. 2) Add back non-cash charges (D&A, stock-based comp). 3) Adjust for working-capital changes. 4) Result = cash from operations.',
        },
        {
          id: 'u04-l07-c3',
          kind: 'cloze',
          front:
            'Working-capital rule: an operating asset going up ____ cash; a liability going up ____ cash.',
          back: 'uses (subtract); provides (add)',
        },
        {
          id: 'u04-l07-c4',
          kind: 'basic',
          front: 'What does net income rising while CFO stagnates usually indicate?',
          back: 'A red flag: profit is being booked that is not converting to cash, usually piling up in receivables or inventory. It preceded many accounting scandals.',
        },
      ],
    },

    // ── L08 ───────────────────────────────────────────────────────────────
    {
      id: 'u04-l08',
      unitId: 'u04',
      order: 8,
      title: 'Free Cash Flow',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Cash from operations is not free to spend. A café chain must keep replacing espresso machines and refitting stores just to keep the doors open. Subtract that and you get the number the whole of Units 6 and 7 will be built on:

> **Free cash flow (FCF) = cash from operations − capital expenditures**

FCF is the cash genuinely available to pay down debt, buy back stock, pay dividends, or fund acquisitions — the cash that belongs, in an economic sense, to the owners. It is why the valuation methods in Unit 7 discount *cash flows* and not earnings.

Note that FCF is **not a GAAP line item**. Nobody reports it; you compute it from two numbers in different sections of the cash flow statement.`,
        },
        {
          kind: 'example',
          md: `**Cascade FY2024 — every profit measure for the same year:**

| Measure | Amount |
|---|---|
| EBITDA | $65.0M |
| Operating income (EBIT) | $40.0M |
| Net income | $22.5M |
| Cash from operations | $44.0M |
| Capital expenditures | $(35.0)M |
| **Free cash flow** | **$9.0M** |

Sit with that spread. **EBITDA of $65.0M and free cash flow of $9.0M** — a factor of seven, all from the same twelve months. Every number is correct; each answers a different question.

- CFO ($44.0M) exceeds net income ($22.5M) mainly because $25.0M of D&A and $9.0M of stock-based compensation were added back.
- FCF ($9.0M) falls far below CFO because Cascade spent $35.0M building and refitting cafés.
- **FCF margin** = 9.0 ÷ 500.0 = **1.8%**. Thin — and entirely explained by the fact that Cascade is in a heavy expansion phase.`,
        },
        {
          kind: 'text',
          md: `**Maintenance vs. growth capex** is the adjustment that rescues a company like Cascade from looking worse than it is.

- **Maintenance capex** keeps the existing business running: replacing worn roasters, refitting old cafés. Unavoidable.
- **Growth capex** builds capacity that doesn't exist yet: new stores. Entirely discretionary — stop it tomorrow and the current business keeps operating.

Cascade's management discloses that of the **$35.0M** spent, roughly **$15.0M** was maintenance and **$20.0M** was **34 new cafés**.

> **Maintenance FCF = 44.0 − 15.0 = $29.0M**

That is what the existing business would throw off if Cascade stopped expanding — 3.2× the reported $9.0M. Companies do not report this split, so you estimate it (depreciation is a rough proxy for maintenance capex, since it approximates the rate at which assets wear out — here $20.0M, in the same neighbourhood). Growth capex is only worth funding if it earns a decent return, which is what the return-on-capital ratios in Unit 5 test.`,
        },
        {
          kind: 'callout',
          md: `**The stock-based compensation caveat — the most consequential FCF distortion of the last decade.**

Cascade added **$9.0M** of stock-based compensation back to CFO as a "non-cash" expense. Technically correct: no cash left the building. But something real did — **ownership**. Employees were paid with shares that dilute you, and the standard FCF figure counts none of that cost.

For a company where SBC is 2% of revenue this is a rounding error. For high-growth software companies where SBC routinely runs 15–25% of revenue, "adjusted free cash flow" can be enormous while shareholders are quietly diluted every single year. Cascade's own numbers make the point: FCF of $9.0M, but **only $0.0M once you subtract the $9.0M paid in shares**.

Two defences: subtract SBC from FCF, or track the **diluted share count** over five years. If it keeps rising, someone is being paid with your ownership.`,
        },
        {
          kind: 'keypoint',
          md: `FCF = CFO − capex, the cash actually available to owners and the bedrock of valuation. Separate maintenance from growth capex before judging it, and always check stock-based compensation and the share-count trend.`,
        },
      ],
      quiz: [
        {
          id: 'u04-l08-q1',
          prompt:
            'Cascade reports cash from operations of $44.0M and capital expenditures of $35.0M. What is free cash flow?',
          choices: ['$44 million', '$9 million', '$22.5 million', '$65 million'],
          answerIdx: 1,
          explain:
            'FCF = CFO − capex = 44.0 − 35.0 = $9.0M. The other options are all real Cascade figures from the same year — CFO $44.0M, net income $22.5M, EBITDA $65.0M — which is exactly the point: a single year yields half a dozen different "profit" numbers spanning a 7× range, and knowing which one is being quoted is the whole skill.',
        },
        {
          id: 'u04-l08-q2',
          prompt: 'What is the standard formula for free cash flow?',
          choices: [
            'Cash from operations minus capital expenditures',
            'Net income minus dividends paid',
            'EBITDA minus interest expense',
            'Revenue minus all cash costs',
          ],
          answerIdx: 0,
          explain:
            'FCF = CFO − capex, drawing one number from the operating section and one from the investing section. Note it is not a GAAP line item — no company reports it, so you compute it, and definitions of "adjusted" FCF in press releases vary widely. The EBITDA-minus-interest option ignores capex entirely, which is the very cost FCF exists to capture.',
        },
        {
          id: 'u04-l08-q3',
          prompt:
            'Cascade spent $35.0M of capex, of which management says $15.0M was maintenance and $20.0M built 34 new cafés. What does that imply about its cash generation?',
          choices: [
            'FCF is $9.0M — growth capex is unavoidable and should not be adjusted out',
            'Cash generation equals CFO of $44.0M, since capex is discretionary',
            'FCF is $20.0M, the amount spent on growth',
            'The existing business generates about $29.0M — far more than reported FCF once expansion spending is stripped out',
          ],
          answerIdx: 3,
          explain:
            'Maintenance FCF = 44.0 − 15.0 = $29.0M: what the current store base would produce if Cascade stopped expanding. Reported FCF of $9.0M understates the earning power of a company in a build-out phase. But the adjustment cuts both ways — ignoring capex altogether and calling CFO "cash generation" is the error EBITDA enthusiasts make, since equipment genuinely does wear out.',
        },
        {
          id: 'u04-l08-q4',
          prompt:
            'Cascade adds $9.0M of stock-based compensation back to CFO. Why should that trouble a shareholder?',
          choices: [
            'Stock-based compensation is a cash expense, so adding it back overstates the company\'s costs',
            'Stock-based compensation has no economic effect on existing shareholders',
            'The cost is real — it is simply paid in shares that dilute existing owners rather than in cash',
            'Stock-based compensation should be subtracted from revenue rather than from profit',
          ],
          answerIdx: 2,
          explain:
            'No cash leaves, so the add-back follows the rules — but employees were compensated with ownership taken from existing shareholders, and standard FCF captures none of that. Cascade\'s $9.0M add-back exactly equals its $9.0M of reported FCF, so FCF net of SBC is zero. The defence is to subtract SBC or watch the diluted share count over five years.',
        },
        {
          id: 'u04-l08-q5',
          prompt: 'Why is free cash flow considered the bedrock of valuation?',
          choices: [
            'Because it is the figure on which corporate income tax is assessed',
            'Because it is the cash actually available to repay debt, buy back stock, or pay dividends',
            'Because it is less volatile than net income in every year',
            'Because accounting standards define it precisely and auditors verify it',
          ],
          answerIdx: 1,
          explain:
            'A business is worth the cash it can hand its owners over its life, and FCF is the closest available measure of that — which is why discounted cash flow models in Unit 7 discount FCF, not earnings. It is often *more* volatile than net income, since a single large capex year can swing it hard, and it is explicitly not a GAAP measure.',
        },
      ],
      cardSeeds: [
        {
          id: 'u04-l08-c1',
          kind: 'cloze',
          front: 'Formula: free cash flow = ____ − ____.',
          back: 'cash from operations (CFO) − capital expenditures (Cascade FY2024: 44.0 − 35.0 = $9.0M)',
        },
        {
          id: 'u04-l08-c2',
          kind: 'basic',
          front: 'Maintenance vs. growth capex',
          back: 'Maintenance keeps the existing business running (unavoidable); growth builds new capacity (discretionary). Companies rarely split them — depreciation is a rough proxy for maintenance capex.',
        },
        {
          id: 'u04-l08-c3',
          kind: 'basic',
          front: 'What is the stock-based compensation caveat to FCF?',
          back: 'SBC is added back as non-cash, but the cost is real: employees are paid with shares that dilute you. Subtract SBC from FCF, or track the diluted share count over five years.',
        },
        {
          id: 'u04-l08-c4',
          kind: 'basic',
          front: 'Cascade FY2024: EBITDA, CFO and FCF — and why they differ so much',
          back: 'EBITDA $65.0M, CFO $44.0M, FCF $9.0M. CFO is below EBITDA after interest, taxes and working capital; FCF is below CFO after $35.0M of capex.',
        },
      ],
    },

    // ── L09 ───────────────────────────────────────────────────────────────
    {
      id: 'u04-l09',
      unitId: 'u04',
      order: 9,
      title: 'Linking the Three Statements',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `The three statements are not three reports. They are three views of **one** model, wired together so tightly that changing any number moves at least two of them. Four links do all the work:

1. **Net income → retained earnings.** The bottom of the income statement lands in equity on the balance sheet.
2. **Net income → top of the cash flow statement.** The same number starts the indirect-method CFO calculation.
3. **Ending cash on the cash flow statement = the cash line on the balance sheet.** The two must agree exactly.
4. **Depreciation touches all three.** It reduces net income on the income statement, reduces net PP&E on the balance sheet, and is added back in CFO.

Cascade demonstrates all four: net income $22.5M raised retained earnings from $37.5M to $60.0M; that same $22.5M opens the cash flow statement; ending cash of $30.0M is the balance sheet's cash line; and $20.0M of depreciation cut profit, cut net PP&E (125.0 + 35.0 capex − 20.0 = 140.0), and was added straight back to CFO.`,
        },
        {
          kind: 'example',
          md: `**Trace $100 of revenue through all three statements.**

Cascade ships **$100** of beans to a wholesale customer on 30-day terms. The beans cost **$60**. Assume **$25** of operating costs are incurred but not yet paid, and tax is **25%**.

**1. Income statement**

| Line | Amount |
|---|---|
| Revenue | +$100.00 |
| Cost of goods sold | (60.00) |
| Gross profit | 40.00 |
| Operating expenses | (25.00) |
| Pre-tax income | 15.00 |
| Tax at 25% | (3.75) |
| **Net income** | **+$11.25** |

**2. Balance sheet**

| | Amount |
|---|---|
| Accounts receivable | +$100.00 |
| Inventory | (60.00) |
| **Total assets** | **+$40.00** |
| Accrued expenses | +25.00 |
| Taxes payable | +3.75 |
| Retained earnings | +11.25 |
| **Total liabilities + equity** | **+$40.00** |

It balances: **$28.75 of new liabilities + $11.25 of new equity = $40.00 of new assets.**

**3. Cash flow statement**

| | Amount |
|---|---|
| Net income | +$11.25 |
| Increase in receivables | (100.00) |
| Decrease in inventory | +60.00 |
| Increase in accrued expenses | +25.00 |
| Increase in taxes payable | +3.75 |
| **Cash from operations** | **$0.00** |

**Zero.** Cascade booked $100 of revenue and $11.25 of profit and generated **not one cent of cash**. Thirty days later the customer pays: receivables fall $100, cash rises $100, and CFO for *that* period is +$100 with no revenue attached to it at all.

That is the entire relationship between profit and cash in one example.`,
        },
        {
          kind: 'callout',
          md: `**Two accrual traps this wiring lets you catch.**

**Channel stuffing.** Push extra product onto distributors near quarter end and revenue is recognised on shipment, even though nobody has bought a bag of coffee. Net income rises; CFO does not, because it all sits in receivables. The tell is **DSO jumping** while revenue "beats". Next quarter brings returns and a shortfall.

**Capitalizing expenses.** A cost recorded as an expense hits profit today. Record it as an *asset* instead — capitalized software, capitalized interest, unusually generous useful lives — and the same spending is spread over years. Profit looks better now and worse later, and CFO barely moves because the spending shifts from operating into investing. The tell is **capex growing much faster than revenue** while margins improve suspiciously smoothly.

Both are invisible on the income statement alone and obvious once you read all three together.`,
        },
        {
          kind: 'keypoint',
          md: `The links: net income → retained earnings and → the top of CFO; ending cash = the balance sheet cash line; depreciation reduces net income, reduces net PP&E, and is added back in CFO. Read all three or you cannot tell profit from cash.`,
        },
      ],
      quiz: [
        {
          id: 'u04-l09-q1',
          prompt: 'Where does net income land on the balance sheet?',
          choices: [
            'In the cash line, increasing cash by the amount of profit',
            'In accounts receivable',
            'In retained earnings, inside shareholders\' equity',
            'In common stock and paid-in capital',
          ],
          answerIdx: 2,
          explain:
            'Retained earnings = opening balance + net income − dividends. Cascade: 37.5 + 22.5 − 0 = 60.0. The "into cash" answer is the misconception this whole unit exists to kill — Cascade earned $22.5M while its cash rose only $8.0M. Paid-in capital changes only when shares are issued, not when profits are earned.',
        },
        {
          id: 'u04-l09-q2',
          prompt: 'How does depreciation touch all three financial statements?',
          choices: [
            'It appears only on the income statement, as an operating expense',
            'It appears on the income statement and balance sheet but not the cash flow statement',
            'It increases cash directly, because it is a non-cash charge',
            'It reduces net income, reduces net PP&E, and is added back in cash from operations',
          ],
          answerIdx: 3,
          explain:
            'One entry, three effects — which is why depreciation is the classic exam question on statement linkage. The "increases cash" answer inverts the logic: adding depreciation back in CFO merely reverses a deduction that never consumed cash; it does not generate any. The cash left years earlier, as capex.',
        },
        {
          id: 'u04-l09-q3',
          prompt:
            'Cascade ships $100 of beans (costing $60) on 30-day terms, incurs $25 of unpaid operating costs and $3.75 of accrued tax. What is the immediate effect on cash from operations?',
          choices: [
            '$0 — the profit is locked up in receivables until the customer pays',
            '+$100, the full amount of the sale',
            '+$11.25, equal to the net income recorded',
            '+$40, equal to gross profit',
          ],
          answerIdx: 0,
          explain:
            'Net income of +$11.25, less the $100 increase in receivables, plus the $60 inventory release, plus $28.75 of accrued liabilities, nets to exactly zero. Revenue and profit were both real and cash was zero — the clearest possible demonstration that an income statement alone cannot tell you whether a company is generating money.',
        },
        {
          id: 'u04-l09-q4',
          prompt: 'What is channel stuffing?',
          choices: [
            'Recording expenses in the wrong departmental cost centre',
            'Pushing extra product to distributors near period end to book revenue that has not truly sold through',
            'Repurchasing shares to raise earnings per share',
            'Delaying capital expenditure into the next fiscal year',
          ],
          answerIdx: 1,
          explain:
            'Revenue is recognised on shipment, so flooding distributors inflates the current period at the expense of the next — and it shows up as a jump in DSO with no matching cash. Buybacks and capex timing are real capital-allocation choices, sometimes questionable, but neither fabricates revenue the way channel stuffing does.',
        },
        {
          id: 'u04-l09-q5',
          prompt: 'What is the effect of capitalizing a cost that should have been expensed?',
          choices: [
            'It reduces both net income and total assets in the current period',
            'It has no effect on any of the three statements',
            'It moves the cost off the income statement onto the balance sheet, flattering profit now and depressing it later through depreciation',
            'It is prohibited in all circumstances under US GAAP',
          ],
          answerIdx: 2,
          explain:
            'The spending becomes an asset instead of an expense, so current profit rises and future years absorb the cost as depreciation or amortization. It also shifts the cash outflow from operating into investing, inflating CFO — which is why capex growing far faster than revenue alongside suspiciously smooth margin expansion deserves scrutiny. Capitalizing is legitimate and required for genuine long-lived assets; the abuse lies in stretching the definition.',
        },
      ],
      cardSeeds: [
        {
          id: 'u04-l09-c1',
          kind: 'basic',
          front: 'The four links between the three financial statements',
          back: '1) Net income → retained earnings. 2) Net income → top of CFO. 3) Ending cash on the CFS = the balance sheet cash line. 4) Depreciation reduces net income, reduces net PP&E, and is added back in CFO.',
        },
        {
          id: 'u04-l09-c2',
          kind: 'cloze',
          front:
            'Depreciation reduces ____ on the income statement, reduces ____ on the balance sheet, and is ____ in cash from operations.',
          back: 'net income; net PP&E; added back',
        },
        {
          id: 'u04-l09-c3',
          kind: 'basic',
          front: 'What is channel stuffing, and how do you spot it?',
          back: 'Shipping excess product to distributors near period end to book revenue that has not sold through. The tell: DSO jumping while revenue "beats" and CFO fails to follow net income.',
        },
        {
          id: 'u04-l09-c4',
          kind: 'basic',
          front: 'Why does capitalizing an expense flatter current profit?',
          back: 'The cost becomes a balance sheet asset instead of an income statement expense, so it is spread over future years as depreciation. It also shifts the cash outflow from operating to investing, inflating CFO.',
        },
      ],
    },
  ],
}
