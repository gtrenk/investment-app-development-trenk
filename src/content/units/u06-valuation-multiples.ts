import type { Unit } from '@core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Unit 06 — Valuation I: Multiples
// Unit 5 judged the business. This unit judges the *price*. Multiples are the
// fast lane of valuation: one ratio, one comparison, one verdict — and a dozen
// ways to fool yourself. Learn the tools, then learn exactly when they lie.
// ─────────────────────────────────────────────────────────────────────────────

export const u06: Unit = {
  id: 'u06',
  title: 'Valuation I: Multiples',
  order: 6,
  description:
    'Separate price from value, then put a number on it: P/E and earnings yield, the traps that make low multiples dangerous, enterprise value and EV/EBITDA, sales and free-cash-flow multiples, growth-adjusted valuation, comparable analysis, and the situations where every multiple lies.',
  unlockAfter: 'u05',
  lessons: [
    // ── L01 ───────────────────────────────────────────────────────────────
    {
      id: 'u06-l01',
      unitId: 'u06',
      order: 1,
      title: 'Price vs Value',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `Unit 5 ended on an uncomfortable note: a company can score 10 out of 10 on financial health and still be a terrible investment. The checklist measured the **business**. It never once looked at the **price**.

Two different things are in play, and confusing them is the most expensive mistake in investing:

- **Price** is what the market is asking today. It is a fact — you can look it up, and it is the same number for everyone.
- **Value** is what the stream of cash the business will produce is actually worth. It is an **estimate**, it is yours, and no two investors will produce the same one.

> Return comes from the **gap** between the two, not from the quality of the business alone.`,
        },
        {
          kind: 'text',
          md: `Benjamin Graham gave this its permanent metaphor. Imagine you own a stake in a private business with a partner named **Mr. Market**. Every day he appears and quotes you a price — sometimes to buy your stake, sometimes to sell you his. He is reliable in only one respect: he shows up every single day. His mood is not.

Some days he is euphoric and quotes an absurdly high price. Some days he is despondent and quotes a price far below what the business is plainly worth. He never minds being ignored; he will be back tomorrow with a new number.

The point of the parable is the relationship you should have with him:

- Mr. Market is there to **serve** you, not to **instruct** you.
- His quote tells you what you can transact at. It tells you nothing about what the business is worth.
- You are free to do nothing. Most days, doing nothing is correct.

Valuation is the discipline of forming your own number so that you can tell whether Mr. Market's number is a gift, a fair deal, or a trap.`,
        },
        {
          kind: 'example',
          md: `**The same business, four moods.**

Ironwood Fasteners earns a steady **$2.00 per share** year after year. The business barely changes. The price does:

| Year | Price | P/E | Mr. Market's mood |
|---|---|---|---|
| 1 | $28.00 | 14.0x | Bored |
| 2 | $62.00 | 31.0x | Euphoric |
| 3 | $24.00 | 12.0x | Panicked |
| 4 | $36.00 | 18.0x | Reasonable |

Check the arithmetic: 28 / 2 = 14.0, 62 / 2 = 31.0, 24 / 2 = 12.0, 36 / 2 = 18.0.

Earnings were **identical** in all four years. Every bit of that movement was a change in what someone was willing to pay for the same $2.00.

Now the consequence. Suppose you decide Ironwood is worth about **$36** a share, and over ten years earnings still grow at a modest 3% a year:

- Buy in Year 3 at **$24.00** — you paid 12x for a business you think is worth 18x. Both the earnings growth *and* the re-rating work for you.
- Buy in Year 2 at **$62.00** — you paid 31x. Even if earnings grow exactly as expected, a drift back toward 18x costs you roughly **42%** of the price, and the growth has to dig you out of that hole before you earn a cent.

Same company. Same earnings. Opposite outcomes, decided entirely at the moment of purchase.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "It's a great company, so the price doesn't really matter — just hold long enough."

Time helps, but it does not make you whole from any price. An investor who bought a portfolio of genuinely excellent, fast-growing US companies at the peak of 1999 waited more than a decade to break even — not because the businesses failed, but because the entry multiple was so high that a decade of real earnings growth went into repaying the premium. Quality decides *whether* value compounds. Price decides *how much of that compounding you get to keep*.`,
        },
        {
          kind: 'callout',
          md: `**The other half of the misconception:** "It's cheap, so it must be a good investment." A low price relative to today's earnings can equally mean the market has correctly noticed the earnings are about to fall. Cheapness is a *hypothesis about a mispricing*, not evidence of one. Lesson 8 is entirely about the cases where the market was right and the screen was wrong.`,
        },
        {
          kind: 'keypoint',
          md: `Price is a fact quoted by the market; value is your estimate of what the future cash is worth. Returns come from the gap between them. Mr. Market exists to serve you with quotes, not to instruct you on worth — so form your own number first, then decide whether his is a gift or a trap. Great business + bad price is a bad investment.`,
        },
      ],
      quiz: [
        {
          id: 'u06-l01-q1',
          prompt: 'What is the essential difference between price and value?',
          choices: [
            'Price is what the market quotes today; value is your estimate of what the future cash stream is worth',
            'Price is set by analysts; value is set by the exchange',
            'Price applies to stocks; value applies only to bonds',
            'They are the same thing measured over different time horizons',
          ],
          answerIdx: 0,
          explain:
            'Price is an observable fact identical for every participant, while value is a private estimate that differs from investor to investor because it depends on forecasts. Returns arise from the gap between the two — which is why an accurate view of the business alone is not enough.',
        },
        {
          id: 'u06-l01-q2',
          prompt:
            'Ironwood earns $2.00 per share every year. Its price moves from $28 to $62 to $24. What does that movement measure?',
          choices: [
            'A change in the underlying earning power of the business',
            'A change in what the market is willing to pay for an unchanged $2.00 of earnings',
            'An accounting restatement of prior-year results',
            'The effect of new shares being issued',
          ],
          answerIdx: 1,
          explain:
            'The earnings were identical in every year, so the entire price move — from 14.0x to 31.0x to 12.0x — was a shift in sentiment about the same $2.00. Recognising that price can move violently while value barely twitches is the whole point of the Mr. Market parable.',
        },
        {
          id: 'u06-l01-q3',
          prompt: 'In Graham\'s parable, what is the correct posture toward Mr. Market?',
          choices: [
            'Trade against every quote he offers, since he is usually wrong',
            'Treat his quote as the market\'s best estimate of intrinsic value',
            'Let him serve you — transact only when his quote diverges from your own estimate, and otherwise ignore him',
            'Follow his direction, because prices reflect information you do not have',
          ],
          answerIdx: 2,
          explain:
            'Mr. Market is there to serve, not to instruct: his usefulness is that he shows up daily with a price you may accept or ignore. Treating his quote as the truth surrenders the independent judgement that valuation exists to supply, and mechanically trading against him ignores that most days he is roughly right.',
        },
        {
          id: 'u06-l01-q4',
          prompt:
            'Why does valuation matter even when a company is unquestionably excellent?',
          choices: [
            'Because excellent companies are more likely to commit accounting fraud',
            'Because a high enough entry price can absorb years of real growth before the investor earns anything',
            'Because excellent companies always revert to average profitability',
            'Because regulators cap the returns on high-quality businesses',
          ],
          answerIdx: 1,
          explain:
            'Paying 31x for a business worth 18x means the multiple must compress roughly 42% at some point, and genuine earnings growth spends years merely repaying that premium. Quality determines whether value compounds; price determines how much of the compounding the buyer actually keeps.',
        },
      ],
      cardSeeds: [
        {
          id: 'u06-l01-c1',
          kind: 'basic',
          front: 'What is the difference between price and value, and where do returns come from?',
          back: 'Price is the market\'s quote — an observable fact. Value is your estimate of what the future cash stream is worth — a private judgement. Returns come from the gap between them, not from business quality alone.',
        },
        {
          id: 'u06-l01-c2',
          kind: 'cloze',
          front: 'Mr. Market is there to ____ you, not to ____ you.',
          back: 'serve; instruct',
        },
        {
          id: 'u06-l01-c3',
          kind: 'basic',
          front: 'Why is "great company, so price doesn\'t matter" wrong?',
          back: 'A premium multiple must eventually compress. Buying Ironwood at 31x when it is worth 18x means roughly 42% of the price is repaid by future growth before the investor earns anything. Quality decides whether value compounds; price decides how much of it you keep.',
        },
      ],
    },

    // ── L02 ───────────────────────────────────────────────────────────────
    {
      id: 'u06-l02',
      unitId: 'u06',
      order: 2,
      title: 'The P/E Ratio',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `The **price-to-earnings ratio** is the most quoted number in investing, and the most misused.

> **P/E = price per share ÷ earnings per share**
> Equivalently: **P/E = market capitalisation ÷ net income**

Both forms give the same answer, because market cap = price × shares and net income = EPS × shares. The share count cancels.

Read it two ways, and use both:

- **"Dollars paid per dollar of annual earnings."** A P/E of 18 means you are paying $18 for each $1 the company currently earns.
- **"Years of current earnings to pay back the price."** At 18x, and assuming earnings never grow or shrink, it takes 18 years of profit to repay what you paid. That framing makes the difference between 10x and 40x feel like what it is.`,
        },
        {
          kind: 'text',
          md: `Which "E" you use changes the answer, so always say which one:

- **Trailing P/E** uses the last four reported quarters (**TTM**, trailing twelve months). It is a **fact** — audited, filed, not up for debate. It is also stale, and it describes a business that no longer exists in exactly that form.
- **Forward P/E** uses an estimate of the next twelve months' earnings, usually the consensus of sell-side analysts. It is **more relevant** and **less reliable**. Analysts are systematically optimistic, especially 12+ months out, and estimates get cut hardest exactly when it matters most.

For a growing company the forward P/E is always the lower of the two, which is precisely why company presentations quote it.

Flip the ratio and you get its most useful cousin:

> **Earnings yield = EPS ÷ price = 1 ÷ P/E = E/P**

The earnings yield expresses the same information as a **percentage return**, which makes it directly comparable to a bond yield or a savings rate. An 18x P/E is a 5.6% earnings yield. A 40x P/E is a 2.5% earnings yield. When a 10-year government bond yields 4.5%, that 2.5% suddenly looks very different than "40x" did.`,
        },
        {
          kind: 'example',
          md: `**Bexley Industrial — trailing, forward, and the yield.**

- Price: **$72.00** per share
- Trailing twelve-month EPS: **$4.00**
- Consensus next-twelve-month EPS: **$4.50**

**Trailing P/E** = 72.00 / 4.00 = **18.0x**
**Forward P/E** = 72.00 / 4.50 = **16.0x**
**Earnings yield (trailing)** = 4.00 / 72.00 = **5.6%** — and as a check, 1 / 18.0 = 0.0556 = **5.6%**. The two routes agree, as they must.

The forward multiple is lower because analysts expect earnings to rise 12.5% (4.50 / 4.00 − 1). If that growth arrives, today's buyer is paying 16x forward. If it does not and EPS comes in at $3.80, the "real" forward P/E was 72.00 / 3.80 = **18.9x** — *higher* than the trailing figure the buyer thought they were improving on.

**Now the comparison that matters.** With the 10-year government bond at 4.5%, Bexley's 5.6% earnings yield is a **1.1 point** premium for taking equity risk — thin, but the earnings can grow while the coupon cannot. At a $120 price the earnings yield would be 4.00 / 120 = **3.3%**, *below* the risk-free bond, and the entire case would have to rest on growth.`,
        },
        {
          kind: 'text',
          md: `**What counts as "expensive"?** There is no universal number, but there are anchors. Broad US market P/E has spent most of the last century between roughly **10x and 22x**, averaging in the mid-teens, with genuine extremes at both ends:

| Period | Approximate market P/E | Condition |
|---|---|---|
| 1979–1982 | 7–9x | High inflation, high rates, deep pessimism |
| Long-run average | 15–17x | Normal |
| 1999–2000 | 30x+ | Dot-com peak |
| 2021 | high 20s | Zero interest rates |

Two forces set the level. **Interest rates**: when safe bonds yield 1%, a 3% earnings yield (33x) can be rational; when they yield 6%, it is not. **Expected growth**: faster and more durable growth justifies a higher multiple, because more of the value sits in later, larger years.`,
        },
        {
          kind: 'callout',
          md: `**Always ask "which E?"** A headline P/E can be trailing GAAP, trailing adjusted, forward consensus, or a company's own non-GAAP number, and the spread between them is routinely 30–50% for the same stock on the same day. Comparing your trailing GAAP P/E against a peer's forward adjusted P/E is not a comparison at all. Pick one convention and apply it to every company in the set.`,
        },
        {
          kind: 'keypoint',
          md: `P/E = price ÷ EPS = market cap ÷ net income — dollars paid per dollar of annual earnings, or years of current earnings to repay the price. Trailing uses reported TTM earnings (factual but stale); forward uses estimates (relevant but optimistic). Earnings yield = E/P = 1 ÷ P/E turns the multiple into a percentage comparable with bond yields. Long-run US market P/E has mostly sat between 10x and 22x.`,
        },
      ],
      quiz: [
        {
          id: 'u06-l02-q1',
          prompt: 'A stock trades at $72.00 with trailing EPS of $4.00. What is its trailing P/E?',
          choices: [
            '5.6x',
            '16.0x',
            '18.0x',
            '$68.00',
          ],
          answerIdx: 2,
          explain:
            '72.00 / 4.00 = 18.0x, meaning $18 paid for each $1 of current annual earnings. The 5.6x answer is the earnings yield expressed as a percentage (4 / 72 = 5.6%) — the reciprocal, and the single most common slip when the two are computed side by side.',
        },
        {
          id: 'u06-l02-q2',
          prompt: 'What is the earnings yield of a stock trading at a P/E of 25?',
          choices: [
            '4.0%',
            '25%',
            '2.5%',
            '12.5%',
          ],
          answerIdx: 0,
          explain:
            'Earnings yield is the reciprocal of the P/E: 1 / 25 = 0.04 = 4.0%. Expressing the multiple as a percentage is what makes it directly comparable to a bond yield, which is the reason the reciprocal is worth computing at all.',
        },
        {
          id: 'u06-l02-q3',
          prompt:
            'For a company whose earnings are expected to grow, how does the forward P/E compare with the trailing P/E?',
          choices: [
            'Forward is higher, because estimates include a risk premium',
            'They are identical by construction',
            'Forward is lower, because the same price is divided by a larger expected E',
            'It depends on the share count',
          ],
          answerIdx: 2,
          explain:
            'The numerator is the same price while the denominator grows, so the forward multiple is mechanically lower for any company expected to grow — which is exactly why company presentations prefer to quote it. The share count cancels out of both forms of the ratio entirely.',
        },
        {
          id: 'u06-l02-q4',
          prompt:
            'Bexley trades at $72 with forward consensus EPS of $4.50, so its forward P/E is 16.0x. EPS actually comes in at $3.80. What was the true multiple paid?',
          choices: [
            '15.2x — the shortfall reduces the multiple',
            '16.0x — the multiple is fixed at purchase',
            'Undefined, because actual earnings differed from consensus',
            '18.9x — higher than the 18.0x trailing multiple the buyer thought they were improving on',
          ],
          answerIdx: 3,
          explain:
            '72.00 / 3.80 = 18.9x, so the "cheaper" forward multiple was an artefact of an estimate that did not arrive. This is the structural weakness of forward P/E: it is most flattering precisely when analyst optimism is about to be disappointed.',
        },
        {
          id: 'u06-l02-q5',
          prompt:
            'Why can a 33x P/E be defensible when safe bonds yield 1% but not when they yield 6%?',
          choices: [
            'Because high rates force companies to report lower earnings',
            'Because a 33x P/E is a 3% earnings yield, which competes well against 1% but poorly against 6%',
            'Because P/E ratios are legally capped when rates rise',
            'Because bond yields and equity multiples are unrelated',
          ],
          answerIdx: 1,
          explain:
            'A 33x multiple is a 3.0% earnings yield, so the alternative available risk-free sets the bar it must clear — comfortably above 1%, well below 6%. Interest rates are one of the two structural drivers of the market multiple, alongside expected growth.',
        },
      ],
      cardSeeds: [
        {
          id: 'u06-l02-c1',
          kind: 'cloze',
          front: 'P/E = ____ ÷ ____, or equivalently ____ ÷ ____.',
          back: 'price per share ÷ earnings per share; market capitalisation ÷ net income',
        },
        {
          id: 'u06-l02-c2',
          kind: 'cloze',
          front: 'Earnings yield = ____ ÷ ____ = 1 ÷ ____.',
          back: 'EPS ÷ price (E/P); 1 ÷ P/E',
        },
        {
          id: 'u06-l02-c3',
          kind: 'basic',
          front: 'Trailing vs forward P/E — what does each use, and what is each one\'s weakness?',
          back: 'Trailing uses the last four reported quarters: factual but stale. Forward uses next-twelve-month estimates: more relevant but systematically optimistic, and most flattering right before estimates get cut.',
        },
        {
          id: 'u06-l02-c4',
          kind: 'basic',
          front: 'What two forces set the level of a justified market P/E?',
          back: 'Interest rates (the earnings yield must compete with the risk-free yield) and expected growth plus its durability. Long-run US market P/E has mostly ranged 10x–22x, hitting 7–9x in 1979–82 and above 30x in 1999–2000.',
        },
      ],
    },

    // ── L03 ───────────────────────────────────────────────────────────────
    {
      id: 'u06-l03',
      unitId: 'u06',
      order: 3,
      title: 'P/E Pitfalls',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `The P/E has one numerator you can trust and one denominator you cannot. Price is a fact. **Earnings are an opinion** — an accrual figure shaped by estimates, cycles, and one-off events (Unit 3 covered exactly how much judgement goes into that line).

Four failure modes account for most of the damage.`,
        },
        {
          kind: 'text',
          md: `**1. The cyclical trap — and it runs backwards.** For a deeply cyclical business (steel, chemicals, autos, semiconductors, shipping, homebuilders), the P/E is at its *lowest* when the stock is most dangerous and at its *highest* when it is most attractive. At the peak of the cycle, earnings are inflated, so P = high but E = higher still, and the multiple looks like a bargain right before earnings collapse. At the trough, earnings are crushed, so the multiple looks absurd right as the cycle turns. The fix is **normalised earnings**: use a mid-cycle E averaged over a full cycle (5–10 years) instead of this year's.

**2. One-time items distort E.** Selling a division, winning a lawsuit, releasing a tax reserve, or writing down an impairment all land in net income without saying anything about ongoing earning power. A large one-off gain deflates the P/E; a large one-off charge inflates it. Read the income statement and rebuild E from continuing operations.

**3. Negative earnings make it undefined.** A company losing money has no meaningful P/E, and screeners handle this inconsistently — some show a blank, some show a negative number, some quietly drop the company from the results. A "P/E of −8" is not cheaper than a P/E of 40; it is not a P/E at all. Lesson 5 covers what to use instead.

**4. Accounting choices change E without changing the business.** Depreciation schedules, inventory methods, capitalising versus expensing software development, and the treatment of acquired intangibles all move reported earnings between otherwise identical companies. Lesson 8 returns to this.`,
        },
        {
          kind: 'example',
          md: `**Cascade Steel across the cycle — same company, same price logic.**

| Cycle position | EPS | Price | P/E | What it looks like |
|---|---|---|---|---|
| Peak | $8.00 | $48.00 | **6.0x** | Screaming bargain |
| Trough | $1.00 | $30.00 | **30.0x** | Wildly expensive |

Check: 48 / 8 = 6.0 and 30 / 1 = 30.0.

Cascade's **mid-cycle** EPS, averaged across a full cycle, is **$3.50**. Measure both prices against *that*:

- Peak: 48.00 / 3.50 = **13.7x** — a full price, not a bargain.
- Trough: 30.00 / 3.50 = **8.6x** — genuinely cheap.

The normalised lens reverses the verdict at both ends of the cycle.

**And a one-time item, from a different company.** Halloran Group reports net income of **$500M** on **100M** shares, and trades at **$60.00**.

- Reported EPS = 500 / 100 = **$5.00** → P/E = 60 / 5.00 = **12.0x**. Cheap!
- The notes reveal **$200M** of that came from selling a warehouse portfolio — a one-off, never to repeat.
- Ongoing net income = 500 − 200 = **$300M** → adjusted EPS = **$3.00** → adjusted P/E = 60 / 3.00 = **20.0x**.

The stock did not go from cheap to expensive. It was always 20x; the screen was reading a number that included the proceeds of selling the furniture.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Low P/E = cheap."**

A low P/E means only that the price is low **relative to the earnings the accountants reported for one particular window**. It is almost always low for a reason, and the useful question is *which* reason:

- **Cyclical peak** — E is inflated and about to fall (Cascade at 6.0x).
- **One-off gain in E** — the denominator is fiction (Halloran at 12.0x).
- **Structural decline** — the market correctly expects earnings to shrink for years (Lesson 8's value trap).
- **Genuine mispricing** — the market is wrong. This happens, and it is rarer than screens make it look.

A low P/E is the *start* of the work, never the conclusion.`,
        },
        {
          kind: 'callout',
          md: `**Practical fix: use several years of E.** Averaging earnings over 5–10 years, adjusted for inflation, is the idea behind the **cyclically adjusted P/E (CAPE)** popularised by Robert Shiller for the market as a whole. Applied to a single company, the same normalisation is what turns Cascade's misleading 6.0x into an honest 13.7x. It is the single highest-value adjustment you can make to a P/E.`,
        },
        {
          kind: 'keypoint',
          md: `Price is a fact; earnings are an opinion. P/E fails when earnings are cyclically inflated (lowest multiple at the most dangerous moment), distorted by one-time items, negative (undefined, not cheap), or shaped by accounting choices. Normalising E over a full 5–10 year cycle is the standard fix. Low P/E is a question — cyclical peak, one-off gain, structural decline, or genuine mispricing — never an answer.`,
        },
      ],
      quiz: [
        {
          id: 'u06-l03-q1',
          prompt:
            'Cascade Steel trades at $48.00 with peak-cycle EPS of $8.00 but mid-cycle EPS of $3.50. What do the two multiples say?',
          choices: [
            'Reported P/E is 6.0x (a bargain); normalised P/E is 13.7x (a full price)',
            'Reported P/E is 6.0x and normalised is 4.4x, so it is even cheaper than it looks',
            'Both are 6.0x, since price is unchanged',
            'Normalised P/E cannot be calculated without the share count',
          ],
          answerIdx: 0,
          explain:
            '48 / 8.00 = 6.0x on inflated peak earnings, while 48 / 3.50 = 13.7x on mid-cycle earnings — a full price rather than a bargain. Cyclicals show their lowest multiples exactly when earnings are about to fall, which is why normalisation reverses the verdict.',
        },
        {
          id: 'u06-l03-q2',
          prompt:
            'Halloran reports $500M of net income on 100M shares at a $60 price, but $200M of that was a one-off warehouse sale. What is the adjusted P/E?',
          choices: [
            '12.0x',
            '30.0x',
            '8.6x',
            '20.0x',
          ],
          answerIdx: 3,
          explain:
            'Ongoing net income is 500 − 200 = $300M, so adjusted EPS is $3.00 and 60 / 3.00 = 20.0x. The headline 12.0x came from dividing by an EPS that included the proceeds of selling an asset the company can only sell once.',
        },
        {
          id: 'u06-l03-q3',
          prompt: 'A company reports EPS of −$0.50. What does its P/E tell you?',
          choices: [
            'That it is cheaper than a company at 40x, since the number is lower',
            'That its earnings yield is negative but comparable across peers',
            'That the multiple is exactly zero',
            'Nothing — the ratio is undefined and needs a different multiple entirely',
          ],
          answerIdx: 3,
          explain:
            'A negative denominator produces a figure with no economic meaning, and screeners treat it inconsistently — blank, negative, or silently excluded. Loss-making companies need sales or cash-flow based multiples instead, which is what the next lessons supply.',
        },
        {
          id: 'u06-l03-q4',
          prompt: 'Why does a deep cyclical show its LOWEST P/E at the most dangerous moment?',
          choices: [
            'Because analysts stop covering cyclicals at the peak',
            'Because peak-cycle earnings are inflated, so E rises faster than P and the multiple compresses just before earnings collapse',
            'Because cyclical companies buy back stock at the peak',
            'Because depreciation is suspended during boom years',
          ],
          answerIdx: 1,
          explain:
            'At the top of the cycle both price and earnings are elevated, but earnings more so, which mechanically compresses the multiple right before the collapse. The mirror image happens at the trough, where crushed earnings produce a frighteningly high multiple at the most attractive entry point.',
        },
        {
          id: 'u06-l03-q5',
          prompt: 'You screen for stocks under 8x earnings. What is the correct next step?',
          choices: [
            'Buy the basket, since a diversified set of low multiples is self-protecting',
            'Sort by the lowest multiple and start at the top',
            'Determine why each multiple is low — cyclical peak, one-off gain, structural decline, or genuine mispricing',
            'Discard any company whose multiple is below the market average',
          ],
          answerIdx: 2,
          explain:
            'A low multiple is a hypothesis about mispricing, and three of the four common explanations mean the stock deserves its price. The screen is a way to generate candidates; the diagnosis of *why* the E is what it is does the actual work.',
        },
      ],
      cardSeeds: [
        {
          id: 'u06-l03-c1',
          kind: 'basic',
          front: 'Name the four reasons a P/E can be low, and which one is rarest.',
          back: 'Cyclical peak earnings, a one-time gain inflating E, structural decline the market has correctly priced, or genuine mispricing. Genuine mispricing is the rarest — the other three mean the low multiple is deserved.',
        },
        {
          id: 'u06-l03-c2',
          kind: 'basic',
          front: 'Why does a cyclical company\'s P/E mislead at both ends of the cycle?',
          back: 'At the peak, inflated earnings compress the multiple (Cascade at 6.0x) just before earnings collapse. At the trough, crushed earnings inflate it (30.0x) at the most attractive entry point. Normalising to mid-cycle EPS ($3.50 → 13.7x and 8.6x) reverses both verdicts.',
        },
        {
          id: 'u06-l03-c3',
          kind: 'cloze',
          front:
            'The standard fix for a distorted P/E is to use ____ earnings, averaged over a full ____ year cycle — the idea behind ____ for the whole market.',
          back: 'normalised (mid-cycle) earnings; 5–10 year; CAPE (the cyclically adjusted P/E)',
        },
        {
          id: 'u06-l03-c4',
          kind: 'basic',
          front: 'Is a P/E of −8 cheaper than a P/E of 40?',
          back: 'No — it is not a P/E at all. A negative denominator makes the ratio undefined and meaningless. Loss-making companies require sales or cash-flow multiples (P/S, EV/Sales, P/FCF) instead.',
        },
      ],
    },

    // ── L04 ───────────────────────────────────────────────────────────────
    {
      id: 'u06-l04',
      unitId: 'u06',
      order: 4,
      title: 'Enterprise Value',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Market capitalisation is the price of the **equity**. It is not the price of the **business**. If you bought every share of a company, you would own its assets *and* inherit its debts — and you would also get its cash, which you could immediately use to pay some of those debts down.

**Enterprise value** is the takeover price of the whole business:

> **EV = market capitalisation + total debt − cash and equivalents**
> Equivalently: **EV = market cap + net debt**, where **net debt = total debt − cash**

Debt is *added* because an acquirer must repay or assume it. Cash is *subtracted* because an acquirer gets it back on day one — buying a company with $100M of cash for $1,000M is really paying $900M for the operations.

The consequence is that EV, not market cap, is the correct numerator whenever the denominator is a measure of profit available to **all** capital providers.`,
        },
        {
          kind: 'text',
          md: `**Match the numerator to the denominator.** This is the rule that makes multiples internally coherent:

| Numerator | Belongs to | Pairs with |
|---|---|---|
| **Price / market cap** | Equity holders only | EPS, net income, book equity, FCF to equity |
| **Enterprise value** | Debt *and* equity holders | EBITDA, EBIT, revenue, unlevered free cash flow |

EBITDA and EBIT sit **above** the interest line, so they are earned for everyone who funded the business. Pairing them with market cap alone would compare a whole-business profit against a part-of-the-business price. Net income sits **below** interest, so it belongs to shareholders — pairing it with EV would do the reverse.

Two EV multiples do most of the work:

> **EV/EBITDA = enterprise value ÷ EBITDA** — the standard for capital-intensive and leveraged businesses. Neutral to capital structure *and* to depreciation policy.
> **EV/EBIT = enterprise value ÷ EBIT** — the same idea but *after* depreciation, so it respects the fact that assets genuinely wear out.

EV/EBIT is the more honest of the two for any business that must keep reinvesting to stand still. EBITDA's convenience is precisely that it ignores the cost of the assets, which is why it flatters heavy-capex industries.`,
        },
        {
          kind: 'example',
          md: `**Two identical operations, opposite balance sheets.**

Beacon Retail and Corso Retail run the same store business: **EBITDA $200M**, D&A **$72M**, so **EBIT $128M** each. Tax rate 25%. Both have **100M** shares.

**Beacon Retail** — carries debt
- Market cap **$900M** → price **$9.00**; total debt **$700M**; cash **$100M**
- **EV = 900 + 700 − 100 = $1,500M**
- Interest = 700 × 6% = $42M → pre-tax 128 − 42 = $86M → net income 86 × 0.75 = **$64.5M** → EPS **$0.645**
- **P/E = 9.00 / 0.645 = 14.0x**
- **EV/EBITDA = 1,500 / 200 = 7.5x** | **EV/EBIT = 1,500 / 128 = 11.7x**

**Corso Retail** — debt-free
- Market cap **$1,500M** → price **$15.00**; total debt **$0**; cash **$100M**
- **EV = 1,500 + 0 − 100 = $1,400M**
- No interest → pre-tax $128M → net income 128 × 0.75 = **$96M** → EPS **$0.96**
- **P/E = 15.00 / 0.96 = 15.6x**
- **EV/EBITDA = 1,400 / 200 = 7.0x** | **EV/EBIT = 1,400 / 128 = 10.9x**

**The verdicts disagree.** On P/E, Beacon (14.0x) looks **cheaper** than Corso (15.6x). On EV/EBITDA, Beacon (7.5x) is **more expensive** than Corso (7.0x).

EV is right. The buyer of Beacon's whole business pays $1,500M for exactly the same $200M of EBITDA that costs $1,400M at Corso. Beacon's low P/E is an artefact: leverage shrank both its equity value and its net income, and the P/E ratio quietly ignored the $700M of debt that came with the deal.`,
        },
        {
          kind: 'callout',
          md: `**Net cash flips the sign.** A company with more cash than debt has **negative net debt**, so its EV is *below* its market cap. Corso's EV of $1,400M sits under its $1,500M market cap for exactly this reason. Cash-rich technology companies often look far cheaper on EV multiples than on P/E — and correctly so, because you are not paying an operating multiple on a pile of idle cash.`,
        },
        {
          kind: 'callout',
          md: `**What else belongs in EV.** A rigorous EV also adds **preferred stock**, **minority (non-controlling) interests**, and — for retailers, airlines, and anyone with a large leased estate — **capitalised operating leases**, now on the balance sheet as lease liabilities under IFRS 16 and ASC 842. Ignoring leases makes a lease-heavy retailer look dramatically cheaper than an owner-operator running the identical business. And subtract only **excess** cash: a business needs some working cash to operate.`,
        },
        {
          kind: 'keypoint',
          md: `EV = market cap + total debt − cash = market cap + net debt: the takeover price of the whole business. Match the numerator to the denominator — market cap with net income and EPS (equity-only), EV with EBITDA, EBIT, and revenue (all-capital). EV/EBITDA is neutral to capital structure and depreciation policy; EV/EBIT is the more honest read for capital-intensive businesses. P/E can call a leveraged company cheap while its EV multiple says the opposite.`,
        },
      ],
      quiz: [
        {
          id: 'u06-l04-q1',
          prompt:
            'A company has a $900M market cap, $700M of debt, and $100M of cash. What is its enterprise value?',
          choices: [
            '$1,700M',
            '$1,500M',
            '$1,300M',
            '$900M',
          ],
          answerIdx: 1,
          explain:
            'EV = 900 + 700 − 100 = $1,500M. The $1,700M answer adds the cash instead of subtracting it — but an acquirer receives that cash on closing and can use it to retire debt, so it reduces the effective price of the operations.',
        },
        {
          id: 'u06-l04-q2',
          prompt: 'Why is EBITDA paired with enterprise value rather than with market capitalisation?',
          choices: [
            'Because EBITDA is always larger than net income',
            'Because market cap is harder to observe than EV',
            'Because EBITDA sits above the interest line, so it is profit earned for debt and equity holders together',
            'Because EBITDA excludes taxes, which only affect equity',
          ],
          answerIdx: 2,
          explain:
            'A numerator must represent a claim on the same pool of capital as its denominator, and EBITDA is generated before any payment to lenders. Pairing an all-capital profit with an equity-only price would systematically make leveraged companies look cheap — which is precisely the error EV exists to prevent.',
        },
        {
          id: 'u06-l04-q3',
          prompt:
            'Beacon has a P/E of 14.0x and EV/EBITDA of 7.5x; debt-free Corso has a P/E of 15.6x and EV/EBITDA of 7.0x. Which is actually the cheaper business, and why?',
          choices: [
            'Corso, because a buyer pays $1,400M for the same $200M of EBITDA that costs $1,500M at Beacon',
            'Beacon, because its P/E is lower and P/E is the market\'s standard metric',
            'They are identical, since both generate $200M of EBITDA',
            'Beacon, because its debt provides a tax shield that raises its value',
          ],
          answerIdx: 0,
          explain:
            'The whole-business price per dollar of operating profit is lower at Corso, and Beacon\'s flattering P/E comes from leverage shrinking both its equity value and its net income while the ratio silently ignores the $700M of debt an acquirer inherits. This is the canonical case where P/E and EV multiples give opposite answers and EV is right.',
        },
        {
          id: 'u06-l04-q4',
          prompt: 'A company holds $2B of cash and $0.5B of debt. What does that do to its EV?',
          choices: [
            'EV exceeds market cap by $1.5B, because cash is an asset',
            'EV equals market cap, because the two offset',
            'EV is $1.5B below market cap, because net debt is negative',
            'EV cannot be computed for a net-cash company',
          ],
          answerIdx: 2,
          explain:
            'Net debt is 0.5 − 2.0 = −$1.5B, so EV = market cap − $1.5B. A buyer is not paying an operating multiple on idle cash, which is why cash-rich companies often look meaningfully cheaper on EV multiples than on P/E.',
        },
        {
          id: 'u06-l04-q5',
          prompt: 'When is EV/EBIT more informative than EV/EBITDA?',
          choices: [
            'For capital-intensive businesses, because EBIT is charged with the depreciation of assets that genuinely wear out',
            'For asset-light software companies, where depreciation is negligible',
            'Whenever the company reports under IFRS rather than US GAAP',
            'Never — EBITDA is a superset and therefore always preferable',
          ],
          answerIdx: 0,
          explain:
            'EBITDA adds back the cost of assets that must be replaced, which systematically flatters heavy-capex industries where that replacement spending is unavoidable. For asset-light companies the two measures nearly converge, so the distinction matters least exactly where the depreciation charge is smallest.',
        },
      ],
      cardSeeds: [
        {
          id: 'u06-l04-c1',
          kind: 'cloze',
          front: 'EV = ____ + ____ − ____, which equals ____ + net debt.',
          back: 'market capitalisation + total debt − cash; market capitalisation',
        },
        {
          id: 'u06-l04-c2',
          kind: 'basic',
          front: 'What is the numerator/denominator matching rule for multiples?',
          back: 'Market cap pairs with equity-only measures (EPS, net income, book equity). Enterprise value pairs with all-capital measures (EBITDA, EBIT, revenue, unlevered FCF) — anything earned above the interest line.',
        },
        {
          id: 'u06-l04-c3',
          kind: 'basic',
          front: 'Why can a leveraged company show a low P/E and a high EV/EBITDA at the same time?',
          back: 'Leverage shrinks both equity value and net income, so the P/E ratio can look low while ignoring the debt an acquirer must assume. Beacon: P/E 14.0x vs Corso 15.6x, but EV/EBITDA 7.5x vs 7.0x — the whole-business price says the opposite.',
        },
        {
          id: 'u06-l04-c4',
          kind: 'basic',
          front: 'What items besides debt and cash belong in a rigorous enterprise value?',
          back: 'Add preferred stock and minority (non-controlling) interests; add capitalised operating-lease liabilities, which matter enormously for retailers and airlines; and subtract only excess cash, since operations need some working cash.',
        },
      ],
    },

    // ── L05 ───────────────────────────────────────────────────────────────
    {
      id: 'u06-l05',
      unitId: 'u06',
      order: 5,
      title: 'Sales & Cash-Flow Multiples',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `When earnings are negative, distorted, or simply not the point, you move up or across the income statement for a denominator that still means something.

**Sales multiples** use the one line nobody can make disappear:

> **P/S = market cap ÷ revenue**
> **EV/Sales = enterprise value ÷ revenue**

**EV/Sales is the correct version.** Revenue is generated for all capital providers, so it belongs with EV under the matching rule. P/S is quoted more often because it is easier to compute, and it is systematically misleading for companies with lots of debt or lots of cash.

Sales multiples are the right lens for **unprofitable growth companies** — early software, biotech with a product, a retailer in expansion — where losses are the result of deliberate spending on growth rather than a broken business. Their weakness is total: **a dollar of revenue is not a dollar of value.** Revenue at an 85% gross margin is worth several times revenue at a 15% gross margin, and a sales multiple cannot see the difference. Always pair a sales multiple with a gross margin.`,
        },
        {
          kind: 'text',
          md: `**Cash-flow multiples** move the other way — past earnings, into cash:

> **P/FCF = market cap ÷ free cash flow**
> **FCF yield = FCF ÷ market cap = 1 ÷ P/FCF**

Free cash flow (Unit 4) is cash from operations minus capital expenditure: what is actually left over after keeping the lights on and the assets replaced. It is much harder to manufacture than earnings, because accruals eventually settle into cash or they do not.

FCF yield is the single most intuitive valuation number in this unit. A 6% FCF yield means the business throws off six cents of genuinely spendable cash per year for every dollar you pay. That is directly comparable to a bond yield, a rental yield, or a savings rate.

**Choosing the right lens:**

| Situation | Use | Why |
|---|---|---|
| Stable, profitable, modest capex | P/E, P/FCF | Earnings and cash roughly agree |
| Capital-intensive or leveraged | EV/EBITDA, EV/EBIT | Neutral to capital structure |
| Unprofitable but growing fast | EV/Sales (with gross margin) | Only line that is meaningful |
| Heavy non-cash charges (post-acquisition amortisation) | P/FCF, EV/FCF | Earnings understate cash |
| Heavy capitalised spending | P/FCF | Earnings *overstate* cash |
| Banks and insurers | P/B, P/tangible book | EV is meaningless — debt is raw material |`,
        },
        {
          kind: 'example',
          md: `**Lumen Cloud — losing money, still valuable.**

- Revenue **$400M**, growing 45% a year, gross margin **78%**
- Net income **−$60M** → P/E is undefined
- Market cap **$3,200M**; no debt; cash **$500M**

**P/S** = 3,200 / 400 = **8.0x**
**EV** = 3,200 + 0 − 500 = **$2,700M** → **EV/Sales** = 2,700 / 400 = **6.75x**

The P/S overstates the price by 19% because it charges the buyer an operating multiple on $500M of idle cash. And the 78% gross margin is doing real work: at 6.75x sales the buyer is paying 6.75 / 0.78 = **8.7x gross profit**. A distributor at the same 6.75x EV/Sales but a 15% gross margin would be paying **45x gross profit** — the same headline multiple describing a wildly different deal.

**Ridgeline Foods — where earnings and cash disagree.**

- Market cap **$2,400M**, no debt, negligible cash
- Net income **$100M**; free cash flow **$150M**

**P/E** = 2,400 / 100 = **24.0x** — looks expensive for a food company.
**P/FCF** = 2,400 / 150 = **16.0x**
**FCF yield** = 150 / 2,400 = **6.25%** — and 1 / 16.0 = 0.0625 = **6.25%**, as it must be.

Why does cash exceed earnings by 50%? Ridgeline built out its plants a decade ago, so annual depreciation ($90M) runs well above current maintenance capex ($40M). The depreciation is a real charge against a real past outlay, but the cash is not going out the door **now**. On earnings the stock looks expensive; on cash it yields 6.25% — and cash is what pays dividends and buys back stock.`,
        },
        {
          kind: 'callout',
          md: `**The mirror-image warning.** Ridgeline's gap runs in the investor-friendly direction, but it can run the other way. If a company's capex is persistently *above* depreciation — because it is growing, or because its assets deplete faster than the schedule assumes — then FCF sits below net income and the P/E flatters it. And if a company **capitalises** costs a rival expenses (software development is the classic), its earnings look better and its free cash flow does not. Whenever earnings and free cash flow diverge for more than two or three years, find the reason before trusting either multiple.`,
        },
        {
          kind: 'callout',
          md: `**Sales multiples have no floor.** A P/E of 6 at least implies real earnings exist. A P/S of 0.4 can belong to a business that will never earn a profit at any scale, because its cost structure does not permit one. Revenue only converts into value at a margin, and if you cannot articulate the margin the company will earn at maturity, an EV/Sales multiple is not a valuation — it is a placeholder.`,
        },
        {
          kind: 'keypoint',
          md: `EV/Sales (not P/S) is the correct sales multiple, and it is only meaningful alongside a gross margin, because a dollar of 80%-margin revenue is worth many times a dollar of 15%-margin revenue. P/FCF = market cap ÷ free cash flow and FCF yield = FCF ÷ market cap = 1 ÷ P/FCF turn valuation into a spendable-cash return you can compare with a bond. When earnings and FCF diverge persistently, diagnose the gap before using either.`,
        },
      ],
      quiz: [
        {
          id: 'u06-l05-q1',
          prompt:
            'Lumen Cloud has a $3,200M market cap, $500M of cash, no debt, and $400M of revenue. What is its EV/Sales?',
          choices: [
            '9.25x',
            '8.0x',
            '6.75x',
            '0.15x',
          ],
          answerIdx: 2,
          explain:
            'EV = 3,200 − 500 = $2,700M, and 2,700 / 400 = 6.75x. The 8.0x answer is the P/S ratio, which charges an operating multiple on $500M of idle cash and therefore overstates the price of the business by 19%.',
        },
        {
          id: 'u06-l05-q2',
          prompt: 'A stock trades at 16x free cash flow. What is its FCF yield?',
          choices: [
            '6.25%',
            '16%',
            '4.0%',
            '1.6%',
          ],
          answerIdx: 0,
          explain:
            'FCF yield is the reciprocal of P/FCF: 1 / 16 = 0.0625 = 6.25%, meaning 6.25 cents of spendable cash per year for each dollar paid. Expressing it as a yield is what makes it directly comparable to a bond coupon or a rental yield.',
        },
        {
          id: 'u06-l05-q3',
          prompt:
            'Two companies both trade at 6.75x EV/Sales. One has a 78% gross margin, the other 15%. What does that tell you?',
          choices: [
            'Nothing — the identical sales multiple means identical valuations',
            'The 15%-margin business is cheaper, because low margins imply low expectations',
            'The 78%-margin business must be the riskier of the two',
            'The multiples are not comparable: 6.75x sales is 8.7x gross profit at 78% margin but 45x gross profit at 15%',
          ],
          answerIdx: 3,
          explain:
            'Revenue only converts into value at a margin, so 6.75 / 0.78 = 8.7x versus 6.75 / 0.15 = 45x describes two completely different deals behind one identical headline. This is why a sales multiple is close to meaningless without a gross margin beside it.',
        },
        {
          id: 'u06-l05-q4',
          prompt:
            'Ridgeline earns $100M of net income but generates $150M of free cash flow, with $90M of depreciation and $40M of maintenance capex. What explains the gap?',
          choices: [
            'The company is capitalising operating costs to inflate cash flow',
            'Depreciation charges a large past outlay against today\'s earnings while today\'s cash capex is much lower',
            'Free cash flow always exceeds net income for profitable companies',
            'The company must have issued stock during the year',
          ],
          answerIdx: 1,
          explain:
            'Depreciation of $90M is a real non-cash charge on plants built a decade ago, while only $40M of cash actually leaves the business now — so cash exceeds earnings by roughly the difference. The same gap running in the opposite direction, with capex above depreciation, would mean the P/E was flattering the company instead.',
        },
      ],
      cardSeeds: [
        {
          id: 'u06-l05-c1',
          kind: 'cloze',
          front: 'FCF yield = ____ ÷ ____ = 1 ÷ ____.',
          back: 'free cash flow ÷ market capitalisation; 1 ÷ P/FCF',
        },
        {
          id: 'u06-l05-c2',
          kind: 'basic',
          front: 'Why is EV/Sales preferred to P/S, and what must always accompany it?',
          back: 'Revenue is earned for all capital providers, so it pairs with EV under the matching rule; P/S ignores debt and cash. It must always be read with a gross margin — 6.75x sales is 8.7x gross profit at a 78% margin but 45x at 15%.',
        },
        {
          id: 'u06-l05-c3',
          kind: 'basic',
          front: 'Which multiple fits which situation: unprofitable growth, capital-intensive, heavy amortisation, banks?',
          back: 'Unprofitable growth → EV/Sales with gross margin. Capital-intensive or leveraged → EV/EBITDA or EV/EBIT. Heavy non-cash amortisation → P/FCF or EV/FCF. Banks and insurers → P/B or price to tangible book, since EV is meaningless when debt is raw material.',
        },
      ],
    },

    // ── L06 ───────────────────────────────────────────────────────────────
    {
      id: 'u06-l06',
      unitId: 'u06',
      order: 6,
      title: 'Growth-Adjusted Valuation',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A 30x multiple on a business growing 30% a year and a 30x multiple on a business growing 2% a year are not the same purchase. Growth-adjusted valuation is the attempt to put that difference into one number.

The best-known attempt is Peter Lynch's **PEG ratio**:

> **PEG = P/E ÷ expected earnings growth rate (in percentage points)**

A P/E of 30 with 30% expected growth gives PEG = 30 / 30 = **1.0**. Lynch's rule of thumb: **PEG below 1.0 is interesting, above 2.0 is expensive.**

The intuition is genuinely useful. It formalises the fact that a high multiple can be perfectly rational if growth is fast enough, and that a low multiple on a shrinking business is not a bargain. It is the cleanest one-line antidote to "low P/E = cheap."`,
        },
        {
          kind: 'text',
          md: `**Now the limits, because there are several and they are serious.**

1. **Value is not linear in growth.** PEG treats 5% growth and 25% growth as differing by a factor of five, but the value they justify differs by far more than five — because faster growth compounds into every later year, and later years are where most of the value lives. PEG systematically *undervalues* very fast growers and *overvalues* slow ones.

2. **It ignores duration.** Two companies growing 20% next year are worth completely different amounts if one can sustain it for a decade and the other for two years. PEG uses a single growth number and is blind to how long it lasts.

3. **It ignores risk and the discount rate.** A 20% grower with a fragile balance sheet and a 20% grower with net cash and recurring revenue get the same PEG.

4. **It ignores capital intensity — the fatal one.** PEG has no idea what the growth *costs*. Unit 5, Lesson 4 established the value-creation test: growth only creates value when **ROIC > WACC**. A company growing EPS at 20% by reinvesting at a 5% ROIC against an 8% WACC is destroying value at speed, and its PEG of 1.0 will look attractive the whole way down.

5. **The growth input is a forecast.** The denominator is usually a consensus long-term estimate — the least reliable number in the whole calculation, and one that is highest right before it is cut.

6. **It breaks at the extremes.** Negative growth makes PEG negative and meaningless; near-zero growth makes it explode.`,
        },
        {
          kind: 'example',
          md: `**Three companies, three PEGs.**

| Company | P/E | Expected EPS growth | PEG |
|---|---|---|---|
| Helix Medical | 36.0x | 24% | **1.5** |
| Orchard Brands | 14.0x | 7% | **2.0** |
| Vantage Rail | 11.0x | 2% | **5.5** |

Check: 36 / 24 = 1.5, 14 / 7 = 2.0, 11 / 2 = 5.5.

Ranked by P/E, Vantage is by far the cheapest. Ranked by PEG, it is by far the most expensive — you are paying 11x for a business that will barely be larger in a decade. That inversion is the whole value of the PEG lens.

**Now put a return on it — "growth at a reasonable price" in numbers.** Helix earns **$2.00** of EPS today at a **$72.00** price (36 × 2.00). Suppose the 24% growth actually arrives for five years:

- EPS in year 5 = 2.00 × 1.24⁵ = 2.00 × 2.9316 = **$5.86**
- If the multiple **holds at 36x**: price = 36 × 5.86 = **$211.08** → that is **24.0% a year**, exactly the earnings growth rate.
- If the multiple **compresses to 20x** (perfectly normal as growth matures): price = 20 × 5.86 = **$117.27** → total gain 62.9% over five years, or **10.2% a year**.

Five years of flawless 24% growth, and de-rating from 36x to 20x consumed **more than half** the return. That is the price of the entry multiple, and it is why "reasonable" is the load-bearing word in *growth at a reasonable price*.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Growth is what makes a company valuable."**

Growth is a **multiplier on the sign of the ROIC−WACC spread** (Unit 5, Lesson 4). Positive spread: growth creates value, and more is better. Negative spread: growth **destroys** value faster. PEG cannot see the spread at all, which means it will happily assign a 1.0 to a company converting shareholder capital into scale at a loss. Before you trust any growth-adjusted multiple, check the ROIC.`,
        },
        {
          kind: 'callout',
          md: `**Use PEG as a sorting device, never a valuation.** It is a fast way to notice that a 36x grower may be cheaper than an 11x melting ice cube — a genuinely valuable reframing. It is not a way to decide what a company is worth. For that you need the growth *duration*, the *cost* of the growth, and an explicit discount rate: in other words, a discounted cash flow model, which is Unit 7.`,
        },
        {
          kind: 'keypoint',
          md: `PEG = P/E ÷ expected growth rate in percentage points; below 1.0 is interesting, above 2.0 is expensive. It is a fast antidote to "low P/E = cheap", but it is blind to growth duration, risk, the discount rate, and — most dangerously — capital intensity, since growth only creates value when ROIC > WACC. Multiple compression can consume most of the return even when the growth arrives exactly as forecast.`,
        },
      ],
      quiz: [
        {
          id: 'u06-l06-q1',
          prompt: 'A company trades at 36x earnings with expected EPS growth of 24%. What is its PEG?',
          choices: [
            '0.67',
            '1.5',
            '2.4',
            '12.0',
          ],
          answerIdx: 1,
          explain:
            'PEG = 36 / 24 = 1.5, using the growth rate as a plain number of percentage points rather than a decimal. The 0.67 answer inverts the ratio, which reverses the meaning of every threshold — under 1.0 would become expensive rather than interesting.',
        },
        {
          id: 'u06-l06-q2',
          prompt:
            'Vantage Rail trades at 11.0x with 2% growth; Helix Medical at 36.0x with 24% growth. What does PEG reveal?',
          choices: [
            'Vantage is cheaper on both measures, so the ranking is unambiguous',
            'PEG cannot compare companies in different industries',
            'Both PEGs are identical once growth is annualised',
            'The ranking inverts: PEG 5.5 for Vantage against 1.5 for Helix, so the low-P/E stock is the expensive one',
          ],
          answerIdx: 3,
          explain:
            '11 / 2 = 5.5 against 36 / 24 = 1.5, so paying 11x for a business that will barely grow is the more demanding purchase. Reframing a low headline multiple on a stagnant business as expensive is exactly what PEG is good for.',
        },
        {
          id: 'u06-l06-q3',
          prompt:
            'Helix grows EPS from $2.00 at 24% for five years to $5.86, but the multiple falls from 36x to 20x. What annual return does the buyer earn?',
          choices: [
            '24.0%, since returns track earnings growth',
            'Zero, because growth and de-rating exactly offset',
            '62.9% a year',
            '10.2% — the de-rating consumed more than half the return',
          ],
          answerIdx: 3,
          explain:
            'The price goes from $72.00 to 20 × 5.86 = $117.27, a 62.9% total gain over five years, which annualises to 10.2%. Had the multiple held at 36x the return would have been the full 24% — so the entry multiple, not the growth, decided most of the outcome.',
        },
        {
          id: 'u06-l06-q4',
          prompt:
            'A company grows EPS 20% a year by reinvesting at a 5% ROIC against an 8% WACC. Its PEG is 1.0. What is wrong with that signal?',
          choices: [
            'Nothing — a PEG of 1.0 is fair value by definition',
            'PEG understates the company, since 20% growth deserves a PEG below 1.0',
            'PEG cannot see that each reinvested dollar earns less than it costs, so the growth is destroying value',
            'The PEG is unreliable only because 20% growth is unusually fast',
          ],
          answerIdx: 2,
          explain:
            'Growth multiplies the sign of the ROIC−WACC spread, and a 5% return against an 8% cost means every dollar reinvested makes shareholders poorer — faster, the faster it grows. PEG has no capital-intensity input at all, so it will keep flattering the company the whole way down.',
        },
        {
          id: 'u06-l06-q5',
          prompt: 'Why does PEG systematically undervalue very fast growers?',
          choices: [
            'Because value is not linear in growth — faster growth compounds into later years, where most of the value sits',
            'Because fast growers usually have negative earnings',
            'Because analysts under-forecast growth for large companies',
            'Because the P/E of a fast grower is capped by regulation',
          ],
          answerIdx: 0,
          explain:
            'Dividing by growth treats 25% as merely five times better than 5%, but compounding means the value gap is far wider, since the extra growth applies to every future year. The same linearity flaw runs in reverse for slow growers, which PEG treats too generously.',
        },
      ],
      cardSeeds: [
        {
          id: 'u06-l06-c1',
          kind: 'cloze',
          front: 'PEG = ____ ÷ ____. A PEG below ____ is interesting; above ____ is expensive.',
          back: 'P/E ÷ expected earnings growth rate in percentage points; below 1.0; above 2.0',
        },
        {
          id: 'u06-l06-c2',
          kind: 'basic',
          front: 'Name four things PEG is blind to.',
          back: 'Growth duration (how long it lasts), risk and the discount rate, capital intensity (whether ROIC > WACC), and the non-linearity of value in growth. It also breaks entirely at zero or negative growth.',
        },
        {
          id: 'u06-l06-c3',
          kind: 'basic',
          front: 'Helix: EPS $2.00 at 36x, growing 24% for five years. Return if the multiple holds at 36x vs compresses to 20x?',
          back: 'EPS reaches $5.86. At 36x the price is $211.08 — 24.0% a year, matching the growth. At 20x it is $117.27 — 10.2% a year. De-rating consumed more than half the return despite flawless growth.',
        },
        {
          id: 'u06-l06-c4',
          kind: 'basic',
          front: 'Why is growth not automatically value-creating, and what does PEG miss about it?',
          back: 'Growth multiplies the sign of the ROIC−WACC spread: below the cost of capital, faster growth destroys value faster. PEG has no capital-intensity input, so a 20% grower reinvesting at 5% ROIC against an 8% WACC still scores a flattering 1.0.',
        },
      ],
    },

    // ── L07 ───────────────────────────────────────────────────────────────
    {
      id: 'u06-l07',
      unitId: 'u06',
      order: 7,
      title: 'Comparable Analysis',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A multiple on its own is a number. A multiple **next to its peers** is an argument. **Comparable company analysis** — "comps" — is the workflow that turns the second into a valuation.

The claim behind it is modest and worth stating plainly: *businesses with similar economics should trade at similar multiples, so a gap between a company and its peer group is either an opportunity or an explanation waiting to be found.* Note that comps produce a **relative** valuation. If the entire sector is mispriced, comps will faithfully reproduce the mispricing.

**The workflow, in order:**

1. **Define the peer set.** Same business model and economics, not merely the same sector code. Five to ten names is the working range.
2. **Pick the multiple that fits the industry.** EV/EBITDA for capital-intensive, P/E for stable profitable, EV/Sales for unprofitable growth, P/B for financials.
3. **Compute it identically for every name.** Same date, same convention (trailing or forward), same treatment of leases and stock compensation.
4. **Use the median, not the mean.** One 40x outlier drags a mean; the median ignores it.
5. **Place the target within the range** and explain the position with the drivers below.
6. **Apply the chosen multiple to the target** and work back to a per-share value.`,
        },
        {
          kind: 'text',
          md: `**Why peers legitimately trade at different multiples.** Four drivers explain most of the spread, and every one of them is a reason a "cheap" peer may deserve to be cheap:

- **Growth** — faster and more durable growth carries a higher multiple. This is usually the largest single driver of the spread.
- **Margins** — higher and more stable margins mean more of each revenue dollar reaches the owner.
- **Returns on capital** — high ROIC means growth is funded cheaply and creates value (Unit 5, Lesson 4). This is why two 10%-growers can rationally trade three turns apart.
- **Risk** — leverage, customer concentration, cyclicality, regulation, and earnings volatility all compress the multiple.

Choosing the peer set is where most of the error enters, and it is the step most easily gamed. A banker who wants a high valuation picks peers with high multiples. Ask of every name: *would a rational buyer genuinely weigh this business against the target?* Exclude anything in distress, mid-takeover, or with a wildly different capital structure.`,
        },
        {
          kind: 'example',
          md: `**Valuing Northgate Components against its peer set.**

Northgate makes precision industrial components. Its data: **EBITDA $250M**, **net debt $300M**, **80M shares**, current price **$21.00**.

| Peer | EV/EBITDA | Rev. growth | EBITDA margin | ROIC |
|---|---|---|---|---|
| Halyard Precision | 8.2x | 3% | 17% | 11% |
| Draycott Systems | 8.8x | 5% | 19% | 13% |
| **Median** | **9.0x** | **5%** | **19%** | **13%** |
| Vale Components | 9.0x | 5% | 19% | 12% |
| Ashfield Tooling | 9.6x | 7% | 21% | 15% |
| Pemberton Industrial | 11.4x | 12% | 24% | 21% |

The **median is 9.0x** (the middle of five values). The mean would be (8.2 + 8.8 + 9.0 + 9.6 + 11.4) / 5 = **9.4x**, pulled up by Pemberton — which grows more than twice as fast and earns a third more on capital, and so is not really a comparable at all.

**Apply the median:**

- Implied **EV** = 250 × 9.0 = **$2,250M**
- Implied **equity value** = EV − net debt = 2,250 − 300 = **$1,950M**
- Implied **per-share value** = 1,950 / 80 = **$24.38**
- Against the **$21.00** price → **16.1% upside** (24.375 / 21.00 − 1)

**Now the honest part.** Northgate grows 4% with an 18% EBITDA margin and a 12% ROIC — it sits slightly *below* the median peer on every driver. A defensible multiple is therefore closer to **8.5x**, not 9.0x:

- EV = 250 × 8.5 = $2,125M → equity $1,825M → **$22.81** per share → only **8.6% upside**.

The peer table did not hand you an answer. It handed you a **range** — roughly $22 to $24 — and the discipline of justifying where inside it the company belongs.`,
        },
        {
          kind: 'callout',
          md: `**Do not skip the net-debt bridge.** An EV multiple gives you an **enterprise** value; shareholders own the **equity**. You must subtract net debt (and preferred stock and minority interests) before dividing by the share count. Forgetting the bridge on a leveraged company overstates the per-share value badly — for Northgate it would produce 2,250 / 80 = $28.13 instead of $24.38, a 15% error created purely by skipping one subtraction.`,
        },
        {
          kind: 'callout',
          md: `**Comps are relative, not absolute.** In 1999 every internet company looked reasonably priced against every other internet company. A comps table will tell you whether a company is cheap *within its sector*; it can never tell you whether the sector is cheap. Pair it with an absolute method — a DCF, or simply an FCF yield you would accept — before concluding anything.`,
        },
        {
          kind: 'keypoint',
          md: `Comps workflow: define a genuine peer set (5–10 names, same economics), pick the industry-appropriate multiple, compute it identically for all, take the median not the mean, position the target using growth, margins, ROIC and risk, then apply the multiple and bridge from EV to equity by subtracting net debt before dividing by shares. Comps give a defensible range, not a point — and only a relative one.`,
        },
      ],
      quiz: [
        {
          id: 'u06-l07-q1',
          prompt:
            'Northgate has EBITDA of $250M, net debt of $300M, and 80M shares. At the peer median of 9.0x EV/EBITDA, what is the implied value per share?',
          choices: [
            '$28.13',
            '$24.38',
            '$21.00',
            '$31.88',
          ],
          answerIdx: 1,
          explain:
            'Implied EV = 250 × 9.0 = $2,250M; equity = 2,250 − 300 = $1,950M; 1,950 / 80 = $24.38. The $28.13 answer skips the net-debt bridge and divides enterprise value straight by the share count, which overstates the result by about 15%.',
        },
        {
          id: 'u06-l07-q2',
          prompt:
            'A peer set shows multiples of 8.2x, 8.8x, 9.0x, 9.6x and 11.4x. Why prefer the median of 9.0x to the mean of 9.4x?',
          choices: [
            'The median is always more conservative than the mean',
            'Regulators require median-based comparable analysis',
            'The mean is pulled up by the 11.4x outlier, which grows twice as fast and earns far more on capital',
            'The mean cannot be computed with an odd number of peers',
          ],
          answerIdx: 2,
          explain:
            'Pemberton trades at 11.4x because it grows 12% with a 21% ROIC, so its multiple reflects economics the target does not share, and the mean silently imports that premium. The median is not automatically conservative — it is simply robust to a single unrepresentative name.',
        },
        {
          id: 'u06-l07-q3',
          prompt:
            'Which set of factors legitimately explains why comparable companies trade at different multiples?',
          choices: [
            'Share price level, ticker symbol, exchange listing, and index membership',
            'Number of shares outstanding, employee count, and revenue in absolute dollars',
            'Dividend payment date, auditor, headquarters location, and CEO tenure',
            'Growth rate and durability, margin level and stability, return on invested capital, and risk',
          ],
          answerIdx: 3,
          explain:
            'Those four drivers determine how much cash a business will produce, how reliably, and at what cost of capital — which is what a multiple is a shorthand for. Absolute size and cosmetic attributes are exactly what dividing by a fundamental removes from the comparison.',
        },
        {
          id: 'u06-l07-q4',
          prompt:
            'Northgate sits slightly below its peer median on growth, margin, and ROIC. What does that imply for the multiple you apply?',
          choices: [
            'Apply the median anyway, since it is the objective figure',
            'Apply the highest peer multiple, since the gap represents upside',
            'Apply a discount to the median — around 8.5x rather than 9.0x, which cuts implied value from $24.38 to $22.81',
            'Abandon comps entirely, since the company is not an exact match',
          ],
          answerIdx: 2,
          explain:
            'The purpose of the driver analysis is to position the target inside the peer range rather than default to its centre, and a company weaker on every driver deserves the lower end. That discipline turns a spurious point estimate into an honest range of roughly $22 to $24.',
        },
      ],
      cardSeeds: [
        {
          id: 'u06-l07-c1',
          kind: 'basic',
          front: 'What are the six steps of a comparable company analysis?',
          back: 'Define a genuine peer set (5–10 names, same economics); pick the industry-appropriate multiple; compute it identically for all; take the median not the mean; position the target using growth, margins, ROIC and risk; apply the multiple and bridge EV to equity.',
        },
        {
          id: 'u06-l07-c2',
          kind: 'cloze',
          front:
            'To go from an EV multiple to a per-share value: implied EV = multiple × metric, then equity value = EV − ____, then divide by ____.',
          back: 'net debt (plus preferred stock and minority interests); shares outstanding',
        },
        {
          id: 'u06-l07-c3',
          kind: 'basic',
          front: 'What four drivers explain legitimate multiple differences between peers?',
          back: 'Growth rate and its durability, margin level and stability, return on invested capital, and risk (leverage, concentration, cyclicality, regulation). Growth is usually the largest single driver of the spread.',
        },
        {
          id: 'u06-l07-c4',
          kind: 'basic',
          front: 'What can comps never tell you?',
          back: 'Whether the sector itself is mispriced. Comps are purely relative — in 1999 every internet stock looked fair against every other one. Always pair them with an absolute method such as a DCF or a required FCF yield.',
        },
      ],
    },

    // ── L08 ───────────────────────────────────────────────────────────────
    {
      id: 'u06-l08',
      unitId: 'u06',
      order: 8,
      title: 'When Multiples Lie',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Everything in this unit is a shortcut. A multiple compresses an entire future — growth, duration, risk, reinvestment, capital structure — into one number, and shortcuts fail in predictable places. Four of them matter most.

**1. Accounting differences make identical businesses look different.** Two companies can run the same operations and report materially different earnings because of choices, not performance:

- **Capitalising vs expensing** development costs. Expensing depresses today's earnings and raises the P/E; capitalising flatters them.
- **Depreciation schedules** — useful lives and salvage assumptions are estimates, and longer lives mean lower annual charges and higher EBIT.
- **Acquired intangible amortisation** — an acquisitive company carries a charge that an organic grower building the same asset internally does not.
- **Stock-based compensation** — a real cost of ownership excluded from most "adjusted" earnings.
- **Leases** — a lease-heavy retailer shows a lower EBITDA than an owner-operator, and if you forget the lease liability in EV it will look far cheaper.

The defence is to compute the multiple the same way for everyone, and to lean on **cash-based** denominators (FCF) where accounting policy has the least room to operate.`,
        },
        {
          kind: 'text',
          md: `**2. Peak and trough cycles.** Lesson 3 covered this for P/E, and it applies to every multiple with an earnings-like denominator. EV/EBITDA at 5x on peak-cycle EBITDA is not cheap. The reliable tell is a **margin far above its own ten-year history**: if the denominator is being produced at a margin the company has never sustained, the denominator is the thing that will move.

**3. The value trap: "cheap for a reason."** A value trap is a stock that looks statistically cheap on every multiple and stays cheap, because the earnings supporting the multiple are in structural decline. The multiple never expands — it simply keeps applying to a shrinking number. Warning signs:

- Revenue and earnings declining for several consecutive years, not one bad quarter
- Structural rather than cyclical cause — a technology shift, a lost distribution channel, a regulatory change
- Deteriorating returns on capital and a rising net debt / EBITDA ratio
- A dividend yield that keeps rising because the price keeps falling
- Management describing the decline as "temporary" for the third consecutive year`,
        },
        {
          kind: 'example',
          md: `**The value trap in arithmetic — Fenway Media.**

Fenway trades at **$12.00** on EPS of **$2.00** — a **6.0x** P/E and a 16.7% earnings yield. It screens beautifully. But print advertising is in structural decline and earnings fall **15% a year**.

Three years later: EPS = 2.00 × 0.85³ = **$1.23**.

- If the multiple **holds** at 6.0x: price = 6 × 1.23 = **$7.37** → a **38.6% loss**.
- If the multiple **de-rates** to 4.0x, as markets do to melting assets: price = 4 × 1.23 = **$4.91** → a **59.1% loss**.

The 6.0x was never cheap. It was the market's estimate of what a shrinking earnings stream is worth, and it was approximately right.

**The same arithmetic in reverse — where returns actually come from.**

Larkspur Systems: EPS **$3.00**, P/E **12.0x** → price **$36.00**. Five years later EPS is **$4.50** and the market has re-rated it to **18.0x** → price **$81.00**.

Total return = 81 / 36 = **2.25x** over five years = **17.6% a year**. Decompose it:

- **Earnings growth**: 4.50 / 3.00 = **1.5x** → (1.5)^(1/5) − 1 = **8.4% a year**
- **Multiple re-rating**: 18.0 / 12.0 = **1.5x** → also **8.4% a year**
- 1.5 × 1.5 = 2.25 ✓ — and 8.4% + 8.4% compounds to 17.6%

**Exactly half** the return came from the business and half from a change of opinion. Earnings growth is something a company can produce. Re-rating is something the market grants, and it can be withdrawn just as easily — as Helix's investors discovered in Lesson 6.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Cheap on every multiple means the market is wrong."**

The market is usually not wrong; it is usually *pricing information you have not looked for yet*. Before concluding that a statistically cheap stock is mispriced, you must be able to answer: **what does the market believe about this company that I believe is false, and why am I right?** If you cannot name the disagreement specifically, you are not finding value — you are buying a declining earnings stream at a fair price.`,
        },
        {
          kind: 'callout',
          md: `**Multiple re-rating is not a plan.** You can forecast earnings growth with some discipline, because it follows from revenue, margins, and reinvestment. You cannot forecast the multiple, because it is other people's future mood. Build the case on the cash the business will generate; treat any re-rating as an unpriced bonus. A thesis that requires a multiple to expand is a thesis that requires strangers to agree with you on a schedule.`,
        },
        {
          kind: 'keypoint',
          md: `Multiples lie when accounting choices differ (capitalising, depreciation, amortisation, SBC, leases), when the denominator is at a cyclical peak or trough, and when cheapness reflects structural decline rather than mispricing. Total return decomposes into earnings growth + multiple change (+ dividends): Larkspur's 17.6% a year was 8.4% earnings and 8.4% re-rating. You can forecast the first; you cannot forecast the second — so never build a thesis on it.`,
        },
      ],
      quiz: [
        {
          id: 'u06-l08-q1',
          prompt:
            'Fenway trades at 6.0x on $2.00 EPS ($12.00) but earnings decline 15% a year. Where is the price in three years if the multiple holds?',
          choices: [
            '$12.00 — the low multiple provides a floor',
            '$10.20',
            '$7.37, a 38.6% loss',
            '$14.10, because low multiples mean-revert upward',
          ],
          answerIdx: 2,
          explain:
            'EPS falls to 2.00 × 0.85³ = $1.23, and 6 × 1.23 = $7.37. A low multiple offers no floor when it is applied to a shrinking denominator — and if the market de-rates the melting asset to 4.0x the loss deepens to 59.1%.',
        },
        {
          id: 'u06-l08-q2',
          prompt:
            'Larkspur goes from $3.00 EPS at 12.0x to $4.50 EPS at 18.0x over five years. How does the 17.6% annual return decompose?',
          choices: [
            'Roughly half from earnings growth (8.4%/yr) and half from multiple re-rating (8.4%/yr)',
            'Entirely from earnings growth, since the price follows earnings',
            'Entirely from re-rating, since the multiple rose 50%',
            'It cannot be decomposed without dividend data',
          ],
          answerIdx: 0,
          explain:
            'Earnings rose 1.5x and the multiple rose 1.5x, and 1.5 × 1.5 = 2.25x total, so each contributed (1.5)^(1/5) − 1 = 8.4% a year. Separating the two matters because only the earnings half is something the business can produce.',
        },
        {
          id: 'u06-l08-q3',
          prompt: 'Which is the strongest warning sign of a value trap rather than a bargain?',
          choices: [
            'Revenue and earnings have declined for several consecutive years from a structural cause, with deteriorating ROIC',
            'The company trades below its five-year average multiple',
            'The stock fell sharply after a single disappointing quarter',
            'Analyst coverage of the stock has decreased',
          ],
          answerIdx: 0,
          explain:
            'A multi-year structural decline with worsening returns on capital means the denominator itself is eroding, so the multiple keeps applying to a smaller number and never expands. One bad quarter or reduced coverage can create genuine mispricing precisely because neither implies the earning power is permanently impaired.',
        },
        {
          id: 'u06-l08-q4',
          prompt:
            'Two companies run identical operations, but one capitalises software development while the other expenses it. What happens to their multiples?',
          choices: [
            'Nothing — accounting choices are eliminated in the cash flow statement before multiples are computed',
            'The expensing company reports lower earnings and shows a higher P/E despite identical economics',
            'The capitalising company shows a higher P/E, because capitalising reduces earnings',
            'Both report identical earnings, since GAAP mandates one treatment',
          ],
          answerIdx: 1,
          explain:
            'Expensing charges the full outlay to this year\'s income statement while capitalising spreads it over several years, so the expensing firm reports lower E and therefore a higher P/E on the same price. This is exactly why cash-based denominators such as FCF are more robust when comparing companies with different accounting policies.',
        },
        {
          id: 'u06-l08-q5',
          prompt:
            'You find a stock cheap on P/E, EV/EBITDA, and P/FCF simultaneously. What question must you answer before buying?',
          choices: [
            'Which of the three multiples is technically the most accurate',
            'Whether the stock has outperformed its index over the past year',
            'Whether other investors have already noticed the same screen',
            'What the market believes about this company that you believe is false, and why you are right',
          ],
          answerIdx: 3,
          explain:
            'Cheapness across every measure usually means the market is pricing information you have not yet found, not that it has overlooked the company. Being unable to name the specific disagreement means you are buying a declining earnings stream at a fair price rather than finding value.',
        },
      ],
      cardSeeds: [
        {
          id: 'u06-l08-c1',
          kind: 'cloze',
          front:
            'Total shareholder return decomposes into ____ + ____ (+ dividends). You can forecast the first; you cannot forecast the second.',
          back: 'earnings growth + multiple change (re-rating)',
        },
        {
          id: 'u06-l08-c2',
          kind: 'basic',
          front: 'What is a value trap, and what are its warning signs?',
          back: 'A stock that stays statistically cheap because its earnings are in structural decline, so the multiple applies to an ever-smaller number. Signs: multi-year revenue and earnings decline, a structural not cyclical cause, falling ROIC, rising net debt/EBITDA, a yield rising only because the price falls, and management calling it "temporary" for years.',
        },
        {
          id: 'u06-l08-c3',
          kind: 'basic',
          front: 'Which five accounting choices most distort cross-company multiples?',
          back: 'Capitalising vs expensing development costs, depreciation useful-life assumptions, amortisation of acquired intangibles, stock-based compensation treatment, and lease accounting. Cash-based denominators such as FCF are the most robust defence.',
        },
        {
          id: 'u06-l08-c4',
          kind: 'basic',
          front: 'What single question must a statistically cheap stock answer before you buy it?',
          back: 'What does the market believe about this company that I believe is false, and why am I right? Without a specific, nameable disagreement you are buying a declining earnings stream at a fair price, not finding a mispricing.',
        },
      ],
    },
  ],
}
