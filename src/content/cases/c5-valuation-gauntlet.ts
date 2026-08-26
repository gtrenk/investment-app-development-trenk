// ─── Case 5 — The Valuation Gauntlet ─────────────────────────────────────────
// Silica Micro, FY2024.
//
// The business quality is settled in the first two minutes so the case can
// spend the rest of its length on the thing Units 6 and 7 actually teach:
// triangulation. Multiples, a DCF, and a reverse DCF, run on the same company —
// and the interesting result is not the average of the three but the *reason*
// two of them disagree by a factor of two.
//
// Valuation arithmetic is recomputed in tests/cases.test.ts via
// @core/financials/valuation; the market assumptions (price, discount rate,
// growth path, peer multiple) are declared there alongside it.

import type { CaseStudy } from '@core/types'

const CO = 'silica-micro'

export const CASE_5: CaseStudy = {
  id: 'c5',
  title: 'The Valuation Gauntlet',
  blurb: 'Three methods, one company. What do you do when they disagree?',
  company: CO,
  intro: `**Silica Micro** designs analogue chips for industrial sensors. It is a genuinely good business: 55.0% gross margin, 22.0% operating margin, more cash than debt, and a return on invested capital comfortably above its cost of capital.

None of that is in question in this case. What is in question is **$76.00 a share**.

You will price it three ways — against peer multiples, with a discounted cash flow, and by running the DCF backwards to see what the market is already assuming. Two of the three will agree closely. The third will disagree by more than a factor of two, and the reason it disagrees is the finding.`,
  verdict: {
    md: `**Pass — a fine business at a price that has already paid for the next decade.** The DCF on reported free cash flow gives **$62.90** and a peer multiple gives **$61.57**; the market wants **$76.00**, a **20.8%** premium to the more generous of the two.

Run backwards, that price requires **10.7%** annual free cash flow growth for five years from a company whose free cash flow is **$770M** before **$410M** of stock compensation. On owner earnings the same model says **$30.10**. Buy-below price at a 25% margin of safety: **$47.18**.`,
    checklistScore: 8,
  },
  steps: [
    {
      kind: 'read',
      statementIds: [CO],
      md: `## Settle the business first, then argue about the price

Silica Micro's statements are above, and the quality half of the analysis takes about ninety seconds:

- Gross margin **55.0%**, operating margin **22.0%**, net margin **17.0%**.
- Return on equity **14.7%** on an equity multiplier of only 1.56× — this is earned, not borrowed.
- Interest covered **11.0×**; net **cash** of $300M.
- Cash from operations $2,010M against $1,173M of net income — conversion of **1.71×**.
- Return on invested capital: NOPAT $1,290.3M ÷ invested capital $7,700M = **16.8%**, against a cost of capital near 9.0%. A **+7.8 point** spread.

Eight of the ten checklist items pass without argument. The two that do not are inventory at **190.4 days** and the absence of a prior year to judge per-share growth against — both watches, neither decisive.

So: a good business. Every remaining step in this case is about the price, and the price is **$76.00** against 230M shares.

Two lines matter for what follows. Free cash flow was **$770M**. Stock-based compensation was **$410M**.`,
    },
    {
      kind: 'calc',
      statementIds: [CO],
      formulaHint: 'Enterprise value = market cap + long-term debt − cash. 230M shares at $76.00.',
      item: {
        id: 'c5-q1',
        prompt: 'What is the enterprise value at $76.00 a share?',
        choices: ['$17,480M', '$17,180M', '$20,080M', '$8,000M'],
        answerIdx: 1,
        explain: `230M × $76.00 = $17,480M of market capitalisation, plus $2,600M of debt, less $2,900M of cash = **$17,180M**.

$17,480M is the market capitalisation, ignoring the $300M of net cash the buyer gets back. $20,080M adds the debt without netting the cash. $8,000M is book equity, which is an accounting figure and never a price.

The adjustment is small here — 1.7% — precisely because the balance sheet is clean. In Case 3 the same step changed the answer fivefold.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [CO],
      formulaHint: 'P/E = share price ÷ earnings per share',
      item: {
        id: 'c5-q2',
        prompt: 'What is the P/E at $76.00?',
        choices: ['2.2×', '14.9×', '14.6×', '22.7×'],
        answerIdx: 1,
        explain: `$76.00 ÷ $5.10 = **14.9×**. For a business earning a 16.8% return on capital that is not, on its face, demanding.

2.2× is price ÷ book value per share ($34.78) — a different multiple entirely. 14.6× divides enterprise value by *net* income, mixing an enterprise numerator with an equity denominator. 22.7× is price ÷ free cash flow per share, which is the honest cash version and already a very different picture.

Notice how far apart 14.9× and 22.7× are. Earnings and cash are not the same number at a company spending $1,240M a year on capital equipment.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [CO],
      formulaHint: 'EV ÷ free cash flow, using the $17,180M enterprise value',
      item: {
        id: 'c5-q3',
        prompt: 'What is the enterprise value to free cash flow multiple?',
        choices: ['8.5×', '11.3×', '14.6×', '22.3×'],
        answerIdx: 3,
        explain: `$17,180M ÷ $770M = **22.3×**. An owner buying the whole company at this price waits twenty-two years to get their money back at the current rate of cash generation.

8.5× divides by cash from operations and forgets the $1,240M of capital expenditure that keeps the fabs current. 11.3× divides by operating income — a real multiple, but an accrual one. 14.6× divides by net income.

Compare with the P/E of 14.9×. Same company, same day, and the cash multiple is half again as high, because $1,240M of capital expenditure is real money that depreciation only partly recognises.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [CO],
      formulaHint: 'Owner earnings = free cash flow − stock-based compensation (Unit 7, L9)',
      item: {
        id: 'c5-q4',
        prompt: 'What are Silica Micro’s owner earnings?',
        choices: ['$770M', '$360M', '$1,180M', '$1,600M'],
        answerIdx: 1,
        explain: `$770M − $410M = **$360M**. Stock compensation is 5.9% of revenue here — nowhere near Case 2's 22.0%, but $410M against $770M of free cash flow is more than half of it.

$770M is the unadjusted figure. $1,180M *adds* stock compensation, double-counting an add-back the cash flow statement already made. $1,600M subtracts it from cash from operations and forgets capital expenditure.

This is the number the rest of the case turns on, so it is worth being explicit about why it is defensible. Silica Micro could stop granting stock tomorrow. It would then have to pay $410M more in cash salary, or lose the engineers who design the chips. Either way the $770M does not survive contact with the alternative.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [CO],
      formulaHint: 'EV ÷ owner earnings, using $17,180M and the $360M just computed',
      item: {
        id: 'c5-q5',
        prompt: 'And on owner earnings, what multiple is the market paying?',
        choices: ['22.3×', '47.7×', '10.7×', '14.9×'],
        answerIdx: 1,
        explain: `$17,180M ÷ $360M = **47.7×**.

22.3× is the unadjusted free cash flow multiple. 10.7× divides by cash from operations less stock compensation, forgetting capital expenditure again. 14.9× is the P/E.

Three multiples of the same company, all correctly computed, at 14.9×, 22.3× and 47.7×. Nobody in this chain has done arithmetic wrong. The spread is entirely a question of which cash flow you think belongs to the owner — and the DCF you are about to read has exactly the same choice to make.`,
      },
    },
    {
      kind: 'read',
      statementIds: [CO],
      md: `## The discounted cash flow

Same model, run twice, with everything held constant except the starting cash flow.

**Assumptions**, stated so they can be argued with:

- Growth of **8%, 7%, 6%, 5%, 4%** over five years, then **2.5%** forever. That path is slightly below the industry's long-run unit growth and well below its cyclical peaks.
- Discount rate **9.0%**, roughly the cost of capital for a semiconductor designer with net cash.
- Net cash of $300M added back to get from enterprise value to equity; 230M shares.

**Run one — on reported free cash flow of $770M.**

Enterprise value $14,167M, equity $14,467M, **$62.90 a share**.

**Run two — on owner earnings of $360M.**

Enterprise value $6,624M, equity $6,924M, **$30.10 a share**.

**And the third method.** Peers in analogue semiconductors trade at about **18×** enterprise value to free cash flow. 18 × $770M = $13,860M, plus $300M of net cash, over 230M shares: **$61.57 a share**.

Two of the three land within **2.2%** of each other. The third is less than half of either. The market price is **$76.00**.`,
    },
    {
      kind: 'question',
      statementIds: [CO],
      item: {
        id: 'c5-q6',
        prompt:
          'The two DCFs use identical growth, an identical discount rate and an identical terminal assumption, and they differ by more than a factor of two. What does that tell you?',
        choices: [
          'One of them contains an arithmetic error and must be rerun',
          'DCF is too sensitive to be useful, and the multiple should be preferred',
          'The whole valuation reduces to a single judgement — whether $410M of stock compensation is a cost to the owner — and every other assumption is noise beside it',
          'The terminal value is doing too much work, which is the real problem with both runs',
        ],
        answerIdx: 2,
        explain: `Neither run is wrong. They answer the same question with different views of one line, and that one line moves the answer from $62.90 to $30.10 — a bigger swing than any plausible change to growth or the discount rate would produce.

This is what triangulation is *for*. The point of running three methods is not to average them into a false precision; it is to find out which assumption the answer actually depends on. Here the answer depends on stock compensation and almost nothing else, so that is where the research effort belongs: is $410M a permanent run rate, is it concentrated in a few retention grants, has the share count actually risen?

The terminal value is doing a lot of work — about 75% of the enterprise value in run one — but it does the same amount of work in both runs, so it cannot explain the gap.`,
      },
    },
    {
      kind: 'calc',
      statementIds: [CO],
      formulaHint:
        'Reverse DCF: hold the discount rate at 9.0% and the terminal rate at 2.5%, and solve for the flat five-year growth rate that makes the model produce today’s $17,180M enterprise value from $770M.',
      item: {
        id: 'c5-q7',
        prompt: 'What five-year growth in reported free cash flow does $76.00 already require?',
        choices: ['2.5%', '10.7%', '4.0%', '30.5%'],
        answerIdx: 1,
        explain: `**10.7%** a year, every year, for five years — and then 2.5% forever after that.

2.5% is the terminal rate, which is an input rather than an answer. 4.0% is the final year of the forward model's growth path. 30.5% is the rate implied if you start from **owner earnings** instead — true, and the reason the question named reported free cash flow.

Now judge it. Is 10.7% compound free cash flow growth defensible for a designer of industrial sensor chips? It is not absurd — semiconductor cycles produce years far better than that. It is also considerably more than the 8%-falling-to-4% the forward DCF assumed, which means **the market and the model disagree, and the market is the more optimistic of the two.**

That is the whole use of a reverse DCF. It converts "does $76.00 look expensive?" into "do I believe 10.7%?", which is a question about a business rather than a feeling about a number.`,
      },
    },
    {
      kind: 'question',
      statementIds: [CO],
      item: {
        id: 'c5-q8',
        prompt:
          'Central estimate around $62, market price $76.00, and a strategy document requiring a 25% margin of safety. What does that produce?',
        choices: [
          'A buy, since the business quality justifies paying above the model',
          'A pass, with a buy-below price of $47.18 — 25% under the $62.90 estimate — recorded so the decision does not have to be made again under pressure',
          'A half-size position, splitting the difference between the estimate and the price',
          'A buy, because two of three methods agreeing is the confirmation the process asks for',
        ],
        answerIdx: 1,
        explain: `The price is **20.8%** *above* the more generous estimate, not below it. There is no discount to require a margin of safety on.

The half-size answer is the seductive one, and it is how a rule quietly stops being a rule. A margin of safety is not a dial you turn down when you like the company — it is compensation for the fact that your estimate is a distribution and you cannot see its width. Halving the position does not make the estimate more accurate; it just makes being wrong slightly cheaper while still paying too much.

Two methods agreeing is a check on the *estimate*, not a licence to ignore what the estimate says. And the recorded buy-below price matters as much as the pass: it is the decision made while calm, so a fall to $50 in three months is a trigger rather than an argument with yourself.`,
      },
    },
    {
      kind: 'thesis',
      prompts: [
        'Write your own central estimate of value as a range, not a point, and say in one line what sets each end of it.',
        'Do you count stock-based compensation as a cost to the owner? Give the strongest argument against your own position.',
        'State your buy-below price and the single trigger that would make you re-underwrite this company before it gets there.',
      ],
    },
    {
      kind: 'read',
      statementIds: [CO],
      md: `## The model analysis

**The business.** Analogue chips for industrial sensors: **55.0%** gross margin, **22.0%** operating margin, **16.8%** return on invested capital against a 9.0% cost of capital, net cash, and interest covered **11.0×**. Eight of ten checklist items pass; the watches are 190.4 days of inventory (high even for semiconductors, where stock is a cycle buffer) and no prior year in this data set to test per-share growth against.

**The triangle.**

| Method | Input | Value per share |
|---|---|---|
| DCF, 8/7/6/5/4% then 2.5%, r = 9.0% | Free cash flow $770M | **$62.90** |
| Peer multiple, 18× EV/FCF | Free cash flow $770M | **$61.57** |
| DCF, same assumptions | Owner earnings $360M | **$30.10** |
| **Market** | | **$76.00** |

Two independent methods within **2.2%** of each other is a genuine confirmation — the DCF and the peer multiple are not the same model wearing different clothes, and their agreement means the growth path is not doing something exotic. Call the central estimate **$62.90**, with the peer figure as its floor and $30.10 as the bear case rather than an outlier to be discarded.

**What the price implies.** **10.7%** compound free cash flow growth for five years. Against the 8%-declining-to-4% the forward model used, the market is already paying for an outcome better than the base case. That is the definition of no margin of safety: you need to be right about the optimistic scenario just to earn the discount rate.

**The single question this case turns on.** Is $410M of annual stock compensation a cost to the owner? Everything else — the growth path, the discount rate, the peer multiple — moves the answer by less than that one judgement does. The disclosures that settle it are the share count history over five years, the split between new-hire and retention grants, and whether buybacks have merely offset dilution or actually retired shares.

**The decision: pass.** Buy-below price **$47.18**, being 25% below the $62.90 central estimate. Record it, and record why: this is a company worth owning at a price that has not been offered.

**What would change the answer.** Free cash flow above $1,000M with stock compensation flat, which would make the 10.7% look conservative; the share count falling for two consecutive years; or the price itself, which is the trigger the buy-below number exists to catch.`,
    },
  ],
}
