import type { Unit } from '@core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Unit 13 — Strategy & Synthesis
// Twelve units handed you tools. None of them told you how to hold them all at
// once. This unit assembles the pieces into a repeatable process: pick a game,
// find ideas, research them, size them, sell them, and write the whole thing
// down so that future-you cannot quietly rewrite the rules. One worked idea —
// Vantage Diagnostics — runs from Lesson 3 to Lesson 10.
// ─────────────────────────────────────────────────────────────────────────────

export const u13: Unit = {
  id: 'u13',
  title: 'Strategy & Synthesis',
  order: 13,
  description:
    'Assemble twelve units into one process: combining fundamentals with technicals, choosing your game honestly, screening for ideas, a repeatable research workflow, sector and macro context, earnings events, a pre-buy checklist, the sell decision, portfolio construction, and a written personal strategy document.',
  unlockAfter: 'u12',
  lessons: [
    // ── L01 ───────────────────────────────────────────────────────────────
    {
      id: 'u13-l01',
      unitId: 'u13',
      order: 1,
      title: 'Fundamental + Technical Together',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Units 3 to 7 taught you to answer **what** a business is worth. Units 8 to 10 taught you to read **what price is doing**. A remarkable amount of energy gets spent arguing that one of those is illegitimate.

The argument is a category error. The two disciplines answer different questions:

| Question | Answered by | Units |
|---|---|---|
| Is this a good business? | Statements, ratios | 3, 4, 5 |
| What is it worth? | Multiples, DCF | 6, 7 |
| **What** should I own? | **Fundamentals** | 3–7 |
| **When**, and at what risk per share? | **Technicals** | 8–10 |
| **How much**? | Risk and sizing | 11 |
| Will I actually follow the plan? | Behaviour | 12 |

Fundamentals have almost nothing to say about the next three months. Charts have nothing whatever to say about whether a company earns its cost of capital. Asking either one to do the other job is what produces the disappointment that then gets blamed on the tool.`,
        },
        {
          kind: 'text',
          md: `The practical combination is a **sequence**, not a blend:

1. **Fundamentals gate the universe.** Only businesses that pass the Unit 5 health checklist and trade below your Unit 7 estimate of value are eligible. Everything else is not a trade you are being patient about — it is not a trade.
2. **Technicals shape the entry.** For an idea already inside the gate, the chart tells you where support sits, whether the trend is with you or against you, and therefore where the thesis would be visibly wrong (Unit 8, Lessons 4 and 5).
3. **The chart level becomes the risk unit.** Distance from entry to invalidation is the dollars per share you are risking, which is the input Unit 11 needs to size the position.

Note the direction of authority. The chart never overrides the valuation to make you buy something expensive. It only refines the timing and the risk on something you already wanted.`,
        },
        {
          kind: 'example',
          md: `**Two entries into the same thesis — Meridian Software.**

Unit 7 valued Meridian at **$36.46** per share against a market price of **$30.00**, and you require a 30% margin of safety, so your buy-below price is 36.46 x 0.70 = **$25.52**. The fundamental verdict is *good business, not yet cheap enough*.

Now the chart. Meridian has been in a downtrend for four months, is trading below its 200-day moving average, and has an established shelf of support at **$23.40**, tested three times.

**Entry A — buy now at $30.00, stop below the last swing low at $25.00.**
- Risk per share: 30.00 − 25.00 = **$5.00** (16.7% of the entry price)
- Reward to your $36.46 estimate: 36.46 − 30.00 = **$6.46**
- Reward-to-risk: 6.46 / 5.00 = **1.29 to 1**
- On a $1,000 risk budget: 1,000 / 5.00 = **200 shares**, a $6,000 position

**Entry B — wait for the price to reach $26.00 and base above the $23.40 shelf, stop at $23.40.**
- Risk per share: 26.00 − 23.40 = **$2.60** (10.0% of the entry price)
- Reward to $36.46: **$10.46**
- Reward-to-risk: 10.46 / 2.60 = **4.02 to 1**
- On the same $1,000 risk budget: 1,000 / 2.60 = 384 shares, a **$9,984 position**

Identical company. Identical valuation work. Waiting bought you **three times the reward-to-risk and a 66% larger position for the same dollars at risk** — and it did it by using a chart level you could not have found in a 10-K.

The cost is real and must be stated: Meridian may never trade at $26.00. Entry B risks missing the idea entirely. That is the trade you are making — a lower probability of participating in exchange for far better terms when you do.`,
        },
        {
          kind: 'text',
          md: `**When the two signals diverge.** Four quadrants, four different actions:

| | Uptrend | Downtrend |
|---|---|---|
| **Cheap on fundamentals** | The comfortable case. Thesis and price agree. Buy, size normally. | The most common real case. Someone knows something, or nobody cares yet. Buy in tranches, or wait for the trend to stop deteriorating. |
| **Expensive on fundamentals** | The seductive case. The chart says yes, the valuation says the return is already gone. This is where most money is lost. | The easy case. Both say no. |

The bottom-left quadrant is where value investing actually lives, and it is uncomfortable by construction: to buy something cheap you must buy it while the price is falling. The top-right quadrant is where momentum lives, and it is dangerous for a fundamental investor precisely because it feels so good.

**A divergence is a question, not a verdict.** If your DCF says a stock is worth 60% more than it trades for and the chart has been making lower lows for a year, the useful response is not "the market is wrong" but "what does the price know that my model does not?" — usually a deteriorating input you have not yet reflected: a customer loss, a pricing change, a competitor, a covenant.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Technical analysis is astrology, so I ignore charts entirely."**

Ignoring the chart does not make you a purist; it makes you blind to two things that materially affect your outcome. First, **liquidity and level structure** determine your realistic entry, your exit, and your slippage. Second, price is an **aggregation of everyone else's information**, including the people who know more than you. A falling price does not prove you are wrong, but it is evidence, and treating evidence as noise because you dislike its source is the same error you would criticise in a chartist who refuses to read a 10-K.`,
        },
        {
          kind: 'callout',
          md: `**The failure mode of blending: signal shopping.** If you consult both disciplines and act whenever *either* says yes, you have not combined them — you have doubled the number of reasons available to justify a purchase you already wanted to make (Unit 12 has a name for this). The combination only works when it is **restrictive**: fundamentals must say yes *and* the chart must offer an acceptable risk level. Two filters in series, never two permissions in parallel.`,
        },
        {
          kind: 'keypoint',
          md: `Fundamentals decide what to own; technicals decide when and at what risk per share; Unit 11 decides how much. Run them in series, never in parallel — the chart refines an idea that already passed the valuation gate, and never overrules it. Meridian at $30.00 with a $25.00 stop gives 1.29:1 reward-to-risk; waiting for $26.00 with a $23.40 stop gives 4.02:1 and a 66% larger position for the same $1,000 at risk, at the cost of possibly missing the trade.`,
        },
      ],
      quiz: [
        {
          id: 'u13-l01-q1',
          prompt:
            'In the disciplined combination of fundamental and technical analysis, what is each one responsible for?',
          choices: [
            'Technicals decide what to own; fundamentals confirm the entry timing',
            'Both answer the same question, so agreement between them doubles your confidence',
            'Fundamentals decide what to own and what it is worth; technicals decide when to enter and where the risk level sits',
            'Fundamentals apply to long-term holdings only and technicals to anything held under a year',
          ],
          answerIdx: 2,
          explain:
            'The two disciplines answer different questions, which is why running them in series works and arguing about which is "real" does not. Reversing the order lets a chart talk you into an expensive business, and treating them as two independent confirmations turns a filter into a permission slip.',
        },
        {
          id: 'u13-l01-q2',
          prompt:
            'You buy Meridian at $26.00 with a stop at $23.40 against a $36.46 estimate of value. What is the reward-to-risk ratio?',
          choices: [
            '1.29 to 1',
            '4.02 to 1',
            '2.60 to 1',
            '10.46 to 1',
          ],
          answerIdx: 1,
          explain:
            'Reward is 36.46 − 26.00 = $10.46 and risk is 26.00 − 23.40 = $2.60, so 10.46 / 2.60 = 4.02. The 1.29 figure is the same thesis entered at $30.00 with a $25.00 stop — identical company, identical valuation, and a third of the payoff per unit of risk.',
        },
        {
          id: 'u13-l01-q3',
          prompt:
            'With a fixed $1,000 risk budget, why does the $26.00 entry support a larger position than the $30.00 entry?',
          choices: [
            'Because the risk per share falls from $5.00 to $2.60, so the same $1,000 buys 384 shares instead of 200',
            'Because a lower share price always means lower risk',
            'Because stops placed below support are less likely to be hit than stops above it',
            'Because the margin of safety requirement rises as the price falls',
          ],
          answerIdx: 0,
          explain:
            'Position size is the risk budget divided by the per-share distance to invalidation, so tightening that distance from $5.00 to $2.60 mechanically raises the share count from 200 to 384 — a $9,984 position rather than $6,000. A lower price on its own says nothing about risk; the distance to the level where you would admit you are wrong is what does the work.',
        },
        {
          id: 'u13-l01-q4',
          prompt:
            'Your DCF says a stock is worth far more than its price, but it has made lower lows for a year. What is the most useful interpretation?',
          choices: [
            'It is a question — ask what the falling price may know that your model has not yet reflected',
            'The market is wrong and the divergence is the opportunity',
            'The DCF is invalid, since price is the only real information',
            'Wait for the chart to confirm, then buy at whatever price it confirms at',
          ],
          answerIdx: 0,
          explain:
            'A persistent downtrend against a bullish model usually means a deteriorating input — a lost customer, a pricing change, a covenant — that your forecast has not absorbed yet. Declaring the market wrong skips the research step, and abandoning the valuation entirely discards the only thing that tells you what the shares are actually worth.',
        },
        {
          id: 'u13-l01-q5',
          prompt: 'What is "signal shopping" and why does it defeat the purpose of combining disciplines?',
          choices: [
            'Buying the same stock from multiple brokers to get better fills',
            'Running several screens in parallel to find more candidates',
            'Acting whenever either fundamentals or technicals says yes, which multiplies justifications instead of filtering ideas',
            'Switching between fundamental and technical strategies depending on the market regime',
          ],
          answerIdx: 2,
          explain:
            'Combining the two disciplines only helps if both must agree, making the process more restrictive rather than less. Treating them as parallel permissions means you will always find one that endorses the trade you already wanted, which is the behavioural failure Unit 12 describes rather than an analytical method.',
        },
      ],
      cardSeeds: [
        {
          id: 'u13-l01-c1',
          kind: 'cloze',
          front:
            'In a combined process, fundamentals answer ____ to own, technicals answer ____ to enter and where the ____ sits, and Unit 11 answers ____.',
          back: 'what; when; risk level (invalidation point); how much (position size)',
        },
        {
          id: 'u13-l01-c2',
          kind: 'basic',
          front: 'Why must fundamentals and technicals be run in series rather than in parallel?',
          back: 'In series they are two filters and the process gets more restrictive: fundamentals must pass AND the chart must offer an acceptable risk level. In parallel they become two permissions, so you can always find one that endorses the trade you already wanted — signal shopping.',
        },
        {
          id: 'u13-l01-c3',
          kind: 'basic',
          front: 'Meridian: entry $30.00 / stop $25.00 versus entry $26.00 / stop $23.40, value $36.46. Compare.',
          back: 'Entry A: $5.00 risk, $6.46 reward, 1.29:1, 200 shares on a $1,000 risk budget ($6,000 position). Entry B: $2.60 risk, $10.46 reward, 4.02:1, 384 shares ($9,984 position). Same thesis, triple the reward-to-risk — at the cost of possibly never getting filled.',
        },
        {
          id: 'u13-l01-c4',
          kind: 'basic',
          front: 'Which of the four fundamental/technical quadrants is the most dangerous, and why?',
          back: 'Expensive on fundamentals + uptrend. The chart says yes while the valuation says the return has already been earned by someone else. It is dangerous precisely because it feels good. Cheap + downtrend is where value investing actually lives, and it feels bad by construction.',
        },
      ],
    },

    // ── L02 ───────────────────────────────────────────────────────────────
    {
      id: 'u13-l02',
      unitId: 'u13',
      order: 2,
      title: 'Know Your Game',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Before any of the analysis matters, three questions decide whether the analysis can pay off at all.

**1. What is my time horizon?** Not the horizon you would like to have — the one your money actually has. Cash needed for a house deposit in two years has a two-year horizon regardless of how long-term you feel. Horizon determines which tools are even relevant: a DCF that says a company is worth 60% more is useless information over six months, because six-month returns are dominated by sentiment and flows, not by intrinsic value.

**2. What is my edge?** An edge is a specific, statable reason the marginal price-setter is wrong. There are only three families:

| Edge | Description | Availability to you |
|---|---|---|
| **Informational** | You know a fact others do not | Essentially none, and often illegal |
| **Analytical** | Same facts, better interpretation | Possible, but you are competing with full-time professionals |
| **Behavioural / structural** | Same facts, same interpretation, but you can act when others cannot or will not | **The realistic one** |

The behavioural edge is real and it is boring: you can hold through a 40% drawdown because no client can fire you; you can own a $400M company that no fund is allowed to buy; you can do nothing for three years; you can accept a lumpy return path in exchange for a better average.

**3. Which lane am I in?** Indexer, investor, or trader. These are different games with different skills, different time costs, and different odds.`,
        },
        {
          kind: 'text',
          md: `| | Indexer | Investor | Trader |
|---|---|---|---|
| Holding period | Decades | 3–10 years | Days to months |
| Decisions per year | ~2 | 5–15 | Hundreds |
| Primary skill | Doing nothing | Business analysis | Risk management |
| Time cost | ~2 hours/year | 5–10 hours/week | Full-time or worse |
| Main enemy | Boredom | Impatience | Costs and taxes |
| Realistic outcome | Market return minus ~0.05% | Market return, plus or minus a few points | Usually below market |

Unit 1, Lesson 7 established the base rate: the large majority of active participants underperform a low-cost index fund over long periods, and the gap widens with turnover. That is not a slur on your intelligence — it is arithmetic. Every active dollar collectively holds the market portfolio, so before costs active investors as a group earn the market return, and after costs they must earn less.

**Which means the honest default is: most people should mostly index.** Not as a consolation prize, but as the strategy with the best expected outcome for someone who does not want a second job.`,
        },
        {
          kind: 'example',
          md: `**The arithmetic of activity.** Two people, a $50,000 portfolio, and identical 9.0% gross returns before costs. One indexes; one trades actively.

**The indexer.** A broad index fund at a 0.03% expense ratio, no turnover, gains untaxed until sold.
- Net compounding rate: 9.00% − 0.03% = **8.97%**

**The active trader.** 200 round trips a year on an average position of $2,500, with a combined spread-plus-slippage cost of about 0.20% per round trip (Unit 2, Lesson 3).
- Trading cost: 200 x $2,500 x 0.20% = **$1,000/year**, which on $50,000 is a **2.00%** annual drag
- Gross 9.00% − 2.00% = **7.00%** before tax
- Gains are realised annually and taxed at the short-term rate of 32% (Unit 2, Lesson 8): 7.00% x (1 − 0.32) = **4.76%** net compounding rate

**After 30 years on the same $50,000:**

| | Rate | Ending value |
|---|---|---|
| Indexer | 8.97% | **$657,928** |
| Active trader | 4.76% | **$201,760** |

The indexer ends with **3.26 times** as much money. Note what did *not* happen in this example: the trader never picked a bad stock. The gross return was identical. The entire $456,168 difference is costs and taxes.

**The uncomfortable implication.** For the active approach to merely match indexing here, the trader must generate 4.21 percentage points of annual outperformance before costs — every year, for thirty years. That is a top-decile hedge fund result, achieved part-time, after work.`,
        },
        {
          kind: 'text',
          md: `**Picking a lane — and the honest compromise.** The framework that survives contact with reality is **core and satellite**:

- **Core (80–95%)**: broad, low-cost index funds. This is the money that has to work.
- **Satellite (5–20%)**: active positions, explicitly labelled as a **learning budget**.

The satellite exists for two reasons, and neither is "to beat the market". First, learning by doing is far more effective than learning by reading — you do not understand the disposition effect until you have felt it with your own money. Second, the satellite gives you a **measurable track record** against a benchmark, which is the only way to find out whether you actually have an edge rather than assuming it.

Set the review rule in advance: after three years, if the satellite has not beaten the index on a risk-adjusted basis, fold it into the core. Not as punishment — as evidence.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "I will be a long-term investor, but I will trade around the position."**

This is the most common way people end up in the trader lane while believing they are in the investor lane. "Trading around" a core holding means dozens of decisions a year, each with spread, slippage, and short-term tax treatment, all applied to a thesis that was supposed to play out over years. You get the trader's cost structure and the investor's information set — the worst available combination. Pick the lane and let the holding period match the thesis that justified the purchase.`,
        },
        {
          kind: 'callout',
          md: `**Indexing is not passivity about risk.** Choosing an index fund still leaves you the decisions that dominate your outcome: how much equity versus bonds and cash, how much international exposure, and — above all — whether you keep contributing during a bear market. Unit 1, Lesson 6 showed the cycle; Unit 12 showed why people sell at the bottom of it. An indexer who panics in a drawdown does not get the index return, and no fund can protect them from that.`,
        },
        {
          kind: 'keypoint',
          md: `Answer three questions before analysing anything: horizon (the one your money actually has), edge (informational, analytical, or the realistic behavioural one — acting when others cannot), and lane (indexer, investor, trader). Activity is expensive: 200 round trips at 0.20% is a 2.00% drag, and short-term taxation cuts 7.00% to 4.76%, turning $50,000 into $201,760 over 30 years against $657,928 for an indexer at 8.97% — a 3.26x gap with identical gross returns. Most people should mostly index, with a small satellite as an explicit learning budget measured against a benchmark.`,
        },
      ],
      quiz: [
        {
          id: 'u13-l02-q1',
          prompt: 'Which type of edge is realistically available to an individual investor?',
          choices: [
            'Informational — knowing facts before the market does',
            'Analytical — consistently out-interpreting full-time professionals on widely followed companies',
            'None; individual investors have no edge of any kind',
            'Behavioural and structural — being able to act, or wait, when institutions cannot or will not',
          ],
          answerIdx: 3,
          explain:
            'You can hold through a drawdown no client can force you out of, own companies too small for funds to touch, and do nothing for years — none of which requires knowing more than anyone else. Informational edges are essentially unavailable and often illegal, and an analytical edge means beating full-time analysts at their own job on their own names.',
        },
        {
          id: 'u13-l02-q2',
          prompt:
            'A trader makes 200 round trips a year on $2,500 average positions at 0.20% cost per round trip, on a $50,000 portfolio. What is the annual drag?',
          choices: [
            '0.20%',
            '0.50%',
            '4.00%',
            '2.00%',
          ],
          answerIdx: 3,
          explain:
            '200 x $2,500 x 0.20% = $1,000, and $1,000 on a $50,000 portfolio is 2.00% a year before any tax. The 0.20% answer mistakes the per-trade cost for the portfolio-level cost, which is exactly the error that makes frequent trading feel cheap.',
        },
        {
          id: 'u13-l02-q3',
          prompt:
            'In the worked example both investors earn 9.0% gross, yet the indexer ends with 3.26x the money after 30 years. What caused the gap?',
          choices: [
            'The trader picked worse stocks',
            'Costs and taxes alone — 2.00% of trading drag and 32% annual short-term taxation cut 9.00% to a 4.76% net compounding rate',
            'The index fund benefited from dividend reinvestment the trader did not receive',
            'Thirty years is long enough that any two strategies diverge by roughly that much',
          ],
          answerIdx: 1,
          explain:
            'Gross stock selection was identical by construction, so the entire $456,168 difference comes from the 2.00% cost drag and the annual realisation of gains at short-term rates. That is the point: the frictions compound against you every year whether or not your analysis was any good.',
        },
        {
          id: 'u13-l02-q4',
          prompt: 'What is the purpose of the satellite portion in a core-satellite structure?',
          choices: [
            'To generate the majority of the portfolio return',
            'To hedge the core against market declines',
            'To hold cash for opportunities',
            'To serve as a bounded learning budget that produces a measurable track record against a benchmark',
          ],
          answerIdx: 3,
          explain:
            'The satellite exists so you can learn by doing and then find out, with real numbers, whether you have an edge — with a rule set in advance to fold it into the core if it does not beat the benchmark over three years. Expecting it to drive returns or hedge the core misunderstands both its size and its function.',
        },
      ],
      cardSeeds: [
        {
          id: 'u13-l02-c1',
          kind: 'basic',
          front: 'Name the three families of investing edge and which one is realistically available to individuals.',
          back: 'Informational (know a fact others do not — essentially unavailable, often illegal), analytical (same facts, better interpretation — possible but you compete with professionals), and behavioural/structural (act or wait when others cannot). The third is the realistic one.',
        },
        {
          id: 'u13-l02-c2',
          kind: 'cloze',
          front:
            'Active trading example: 200 round trips at 0.20% is a ____ annual drag; 9.00% gross becomes ____ pre-tax and ____ after 32% short-term tax, ending at ____ over 30 years versus ____ for an indexer at 8.97%.',
          back: '2.00%; 7.00%; 4.76%; $201,760; $657,928 (a 3.26x gap on identical gross returns)',
        },
        {
          id: 'u13-l02-c3',
          kind: 'basic',
          front: 'Why is "long-term investor who trades around the position" the worst combination?',
          back: 'It produces the trader cost structure (dozens of decisions a year with spread, slippage, and short-term tax rates) applied to the investor information set (a thesis that needs years to play out). You pay for activity while relying on analysis that activity cannot exploit.',
        },
      ],
    },

    // ── L03 ───────────────────────────────────────────────────────────────
    {
      id: 'u13-l03',
      unitId: 'u13',
      order: 3,
      title: 'Screening for Ideas',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `There are roughly 3,500 US-listed companies above $300M of market value. You can research perhaps thirty a year properly. A **screen** is a mechanical filter that turns the first number into the second.

Understand what a screen is and is not. A screen is a **reading list generator**. It does not find winners, it does not rank quality, and it certainly does not tell you what a business is worth. It removes companies you would have rejected anyway, so that your scarce reading time lands on candidates that could plausibly survive the work.

The single most important design principle: **never screen on valuation alone**. A pure cheapness screen — lowest P/E, lowest EV/EBITDA — reliably returns a list of businesses that are cheap for a reason. Pair every valuation filter with at least one **quality** filter and one **safety** filter.`,
        },
        {
          kind: 'text',
          md: `**A general-purpose starting screen**, with the unit that justifies each line:

| Filter | Threshold | Purpose | From |
|---|---|---|---|
| Market cap | > $500M | Liquidity and filing quality | Unit 2 |
| ROIC | > 12% | Quality: earns its cost of capital | Unit 5, L4 |
| Revenue CAGR, 5 years | > 5% | The business is still growing | Unit 5, L8 |
| Net debt / EBITDA | < 3.0x | Survivability | Unit 5, L6 |
| CFO / net income, 3-year average | >= 1.0 | Earnings are cash-backed | Unit 5, L9 |
| EV / EBIT | < 15x | Valuation: a plausible starting price | Unit 6, L4 |

Adjust the thresholds to the market you are in and the sector you are hunting. What must not change is the **structure**: quality and safety filters gate the list before the cheapness filter narrows it.`,
        },
        {
          kind: 'example',
          md: `**The funnel, filter by filter.** Starting from roughly 3,500 US-listed names above $300M:

| Step | Filter | Names remaining |
|---|---|---|
| 0 | Starting universe | 3,500 |
| 1 | Market cap > $500M | 2,400 |
| 2 | ROIC > 12% | 620 |
| 3 | 5-year revenue CAGR > 5% | 310 |
| 4 | Net debt / EBITDA < 3.0x | 205 |
| 5 | EV / EBIT < 15x | 41 |
| 6 | CFO / net income >= 1.0 (3-yr avg) | **28** |

Look at where the list collapses. Step 2 alone removes **74%** of the eligible universe (2,400 down to 620), and step 3 then halves what is left — most listed companies do not simultaneously earn a high return on capital and grow. Between them they eliminate **87%** of eligible names. Step 5 then removes 80% of what survived, because businesses that pass steps 2–4 are usually not cheap. **That is the whole tension of investing compressed into two rows**: quality and price are, on average, negatively related, and the job is finding the places where that relationship temporarily breaks.

From 28 names: skim all 28 (roughly ten minutes each, mostly checking whether the numbers are artefacts), take **6** into full research (Lesson 4), and expect **one or two** to survive into a position.`,
        },
        {
          kind: 'example',
          md: `**How the quality filter earns its keep — Halden Retail.**

Halden appears at the very top of a pure cheapness screen: EPS **$2.00**, price **$12.00**, a **6.0x** P/E against a market at 20x. Irresistible on that one number.

The quality and safety filters it fails:

| Test | Halden | Threshold | Result |
|---|---|---|---|
| ROIC | 4% vs 8% WACC | ROIC > WACC | **Fail** — destroys value with every reinvested dollar |
| Revenue CAGR (5y) | −3.0% | > 5% | **Fail** |
| Gross margin trend | 34% falling to 27% over 5 years | Stable | **Fail** |
| Net debt / EBITDA | 4.2x | < 3.0x | **Fail** |

Now price the trap. Suppose EPS declines **12% a year** for three years and the multiple derates from 6.0x to 5.0x as the decline becomes undeniable:

- EPS after three years: 2.00 x 0.88³ = **$1.363**
- Price at 5.0x: 1.363 x 5.0 = **$6.81**
- Return: (6.81 − 12.00) / 12.00 = **−43.2%**

The stock was genuinely cheap, and you still lost 43% — because in a value trap **both terms fall at once**. The earnings shrink and the multiple applied to those shrinking earnings shrinks too. This is the double-compression that a low P/E screen cannot see, and it is why Unit 6, Lesson 3 insists that a low multiple is a question rather than an answer.`,
        },
        {
          kind: 'text',
          md: `**Where ideas come from besides screens.** A screen only finds what is already quantitatively visible, which means everyone with the same screen sees the same list. Other sources:

- **Competitor mentions.** Read the Item 1 Business section of a company you already understand and note who it names as a competitor. Some of them are public and better.
- **Your own industry.** The one place your analytical edge is plausibly real. You know which vendor everyone is switching to eighteen months before it shows in a revenue line.
- **52-week lows, gated by quality.** A list of falling knives is useless; a list of falling knives that pass the Unit 5 checklist is a genuine hunting ground.
- **Spin-offs and post-index-deletion names** — structurally under-owned (Unit 14, Lesson 9).
- **Institutional 13F filings.** Published quarterly with up to a 45-day lag, so never a signal to copy — but a decent source of names to *research*, with the reasoning done yourself.

**One warning that applies to all of them.** An idea from a source you admire arrives pre-loaded with someone else's conviction, which is exactly the condition under which you skip your own work. Unit 12 named this. The rule that fixes it: every idea, regardless of origin, enters the same funnel at the same starting point.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "The screen returned 28 names, so those are 28 good investments."**

A screen returns companies whose *reported historical numbers* passed some thresholds. It knows nothing about accounting artefacts, cyclical peaks, a pending patent expiry, or a business model about to be obsoleted. Several of the 28 will be cyclicals at peak earnings whose EV/EBIT looks low precisely because EBIT is at a top (Unit 6, Lesson 3) and one or two will have a data error. The screen has done its entire job when it hands you a reading list.`,
        },
        {
          kind: 'callout',
          md: `**Screens look backwards; valuations look forwards.** Every field a screen uses is historical. Your DCF (Unit 7) rests entirely on the future. A company can pass every backward-looking filter and still be a terrible investment because the thing that produced those numbers has just stopped working — and that is exactly the sort of change a screen registers three years late. Use screens to allocate attention, never to allocate capital.`,
        },
        {
          kind: 'keypoint',
          md: `A screen is a reading-list generator, not a buy list: 3,500 names to 28 to 6 researched to 1–2 owned. Never screen on valuation alone — pair every cheapness filter with a quality filter (ROIC > 12%) and a safety filter (net debt/EBITDA < 3.0x, CFO/NI >= 1.0). Halden Retail at 6.0x P/E fails all of them and loses 43.2% as EPS falls 12% a year for three years and the multiple derates to 5.0x — in a value trap both the earnings and the multiple compress at once. Every idea, whatever its source, enters the same funnel.`,
        },
      ],
      quiz: [
        {
          id: 'u13-l03-q1',
          prompt: 'What is the correct role of a stock screen?',
          choices: [
            'To generate a reading list that allocates your scarce research time',
            'To rank companies by investment quality',
            'To identify undervalued stocks ready to buy',
            'To replace valuation work for companies that pass every filter',
          ],
          answerIdx: 0,
          explain:
            'A screen mechanically filters thousands of names down to a few dozen worth reading about, using purely historical reported data. It cannot rank quality, cannot know what a business is worth, and is blind to accounting artefacts and cyclical peaks — all of which are the research that comes after.',
        },
        {
          id: 'u13-l03-q2',
          prompt: 'Why must a valuation filter never be used alone in a screen?',
          choices: [
            'Because valuation data is often stale in screening databases',
            'Because a pure cheapness screen reliably surfaces companies that are cheap for good reasons — value traps',
            'Because low-multiple stocks are usually too illiquid to trade',
            'Because valuation multiples are not comparable across sectors',
          ],
          answerIdx: 1,
          explain:
            'Sorting on cheapness alone selects for businesses the market has marked down because their earnings are declining, and the screen cannot distinguish those from genuine mispricings. Pairing every valuation filter with a quality filter and a safety filter is what removes the systematic bias.',
        },
        {
          id: 'u13-l03-q3',
          prompt:
            'Halden Retail trades at 6.0x on $2.00 EPS. EPS falls 12% a year for three years and the multiple derates to 5.0x. What is the total return?',
          choices: [
            '−31.9%',
            '−43.2%',
            '−16.7%',
            '−12.0%',
          ],
          answerIdx: 1,
          explain:
            'EPS becomes 2.00 x 0.88³ = $1.363, and at 5.0x that is $6.81 against the $12.00 paid — a 43.2% loss. The trap is that both terms compress together: the earnings shrink and the multiple applied to those shrinking earnings shrinks too, which a low-P/E screen cannot see.',
        },
        {
          id: 'u13-l03-q4',
          prompt:
            'In the screening funnel, the ROIC and revenue-growth filters remove 87% of the eligible universe and the EV/EBIT filter then removes 80% of what remains. What does this pattern show?',
          choices: [
            'The thresholds are set too strictly and should be relaxed',
            'Most companies have accounting problems that the filters detect',
            'Quality and cheapness are on average negatively related, so the job is finding where that relationship temporarily breaks',
            'Screening databases contain too many errors to be useful',
          ],
          answerIdx: 2,
          explain:
            'Businesses that earn high returns on capital and grow are rarely available at low multiples, because the market prices that combination — which is why the cheapness filter kills four fifths of the survivors. The whole tension of investing sits in those two rows, and loosening the thresholds would only hide it.',
        },
        {
          id: 'u13-l03-q5',
          prompt:
            'You get an idea from an investor whose track record you admire. How should it enter your process?',
          choices: [
            'At the same starting point as every other idea, running the full funnel yourself',
            'Straight to the position-sizing stage, since their research substitutes for yours',
            'With a larger position size, since the conviction of two investors compounds',
            'It should be rejected, because copying other investors never works',
          ],
          answerIdx: 0,
          explain:
            'An admired source delivers an idea pre-loaded with someone else\'s conviction, which is precisely the condition under which people skip their own work — and 13F holdings are published with up to a 45-day lag, so you cannot even be sure the position still exists. Borrowing a name to research is fine; borrowing the conclusion is not.',
        },
      ],
      cardSeeds: [
        {
          id: 'u13-l03-c1',
          kind: 'cloze',
          front:
            'A screen must never filter on ____ alone; pair every such filter with a ____ filter such as ROIC > 12% and a ____ filter such as net debt/EBITDA < 3.0x.',
          back: 'valuation (cheapness); quality; safety',
        },
        {
          id: 'u13-l03-c2',
          kind: 'basic',
          front: 'Why does a value trap lose more than the earnings decline alone would suggest?',
          back: 'Both terms compress at once. Halden Retail: EPS falls 12%/yr for three years to $1.363 AND the multiple derates from 6.0x to 5.0x, giving $6.81 against $12.00 paid — a 43.2% loss when the earnings fell only 32%.',
        },
        {
          id: 'u13-l03-c3',
          kind: 'basic',
          front: 'Name four sources of investment ideas besides quantitative screens.',
          back: 'Competitor names in the Item 1 Business section of companies you already own; your own industry (the one place an analytical edge is plausible); 52-week lows gated by the Unit 5 quality checklist; spin-offs and index deletions; and 13F filings used only as a source of names, never as a signal, given the 45-day lag.',
        },
      ],
    },

    // ── L04 ───────────────────────────────────────────────────────────────
    {
      id: 'u13-l04',
      unitId: 'u13',
      order: 4,
      title: 'The Research Process',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A name off the screen is not a thesis. Turning one into the other is a fixed sequence, run identically on every candidate so that you cannot unconsciously shorten it for a company you already like.

**Step 1 — Read the 10-K, in this order.** Not front to back. The annual report is written in a sequence optimised for lawyers, not for you.

| Order | Section | What you are extracting | Time |
|---|---|---|---|
| 1 | **Item 1 — Business** | What is sold, to whom, how it is priced, who competes | 20 min |
| 2 | **Item 7 — MD&A** | Management explaining the year in its own words | 20 min |
| 3 | **Financial statements** | The three statements, five years side by side (Units 3, 4) | 30 min |
| 4 | **Footnotes** | Revenue recognition, segments, debt maturities, SBC, leases, contingencies | 30 min |
| 5 | **Item 1A — Risk factors** | Skim only for *company-specific* risks; ignore boilerplate | 10 min |
| 6 | **Item 5 + proxy** | Share count history, buybacks, how management is paid | 10 min |

The test after Step 1 is Unit 1, Lesson 1 in disguise: **can you explain how this company makes money in three sentences, to someone who has not read anything?** If not, you are not ready to value it, and no amount of spreadsheet work will fix that.

**Step 2 — Run the Unit 5 checklist.** All ten points, three to five years of history, scored pass / watch / fail.

**Step 3 — Triangulate the valuation (Units 6 and 7).** Multiples against a genuine peer set, a DCF with stated assumptions, and a reverse DCF asking what the current price already requires.

**Step 4 — Write the one-page thesis.** Before any order is placed.`,
        },
        {
          kind: 'example',
          md: `**Vantage Diagnostics — from screen row to numbers.** (This company runs through the rest of the unit.)

Vantage sells benchtop diagnostic analysers to hospital labs, then sells the proprietary reagent cartridges those machines consume. Instruments are near-breakeven; the cartridges carry the margin. That is the whole business model in two sentences: **place the razor, sell the blades.**

Reported figures, most recent year (all $M except per share):

| Line | Value | Ratio | Result |
|---|---|---|---|
| Revenue | 1,850 | — | — |
| Gross profit | 1,110 | Gross margin | **60.0%** |
| Operating income | 370 | Operating margin | **20.0%** |
| Net income | 259 | Net margin | **14.0%** |
| EBITDA | 455 | — | — |
| CFO | 410 | CFO / net income | **1.58** |
| Capex | 95 | FCF = 410 − 95 | **$315M** (17.0% of revenue) |
| Interest expense | 28 | EBIT / interest | **13.2x** |
| Total debt | 600 | Net debt = 600 − 250 | **$350M** |
| Cash | 250 | Net debt / EBITDA | **0.77x** |
| Shareholders equity | 1,340 | — | — |
| Shares outstanding | 82.0 | EPS = 259 / 82 | **$3.16** |
| Share price | $54.00 | Market cap = 82 x 54 | **$4,428M** |

**Enterprise value** = 4,428 + 350 = **$4,778M** (Unit 6, Lesson 4).

**Owner earnings** (Unit 7, Lesson 9): reported FCF of $315M less $40M of stock-based compensation = **$275M**. Every valuation below uses this figure, not the reported one.

**Multiples:** EV/EBITDA = 4,778 / 455 = **10.5x** · EV/FCF = 4,778 / 315 = **15.2x** · EV / owner earnings = 4,778 / 275 = **17.4x** · P/E = 54.00 / 3.16 = **17.1x**

**ROIC** (Unit 5, Lesson 4), at a 24% tax rate: NOPAT = 370 x 0.76 = **$281.2M**; invested capital = 600 + 1,340 − 250 = **$1,690M**; ROIC = 281.2 / 1,690 = **16.6%**. Against an 8.5% WACC that is a **+8.1 point** spread — the number that tells you the razor-and-blades model is actually working rather than merely being described in the 10-K.`,
        },
        {
          kind: 'example',
          md: `**Vantage on the Unit 5 checklist.**

| # | Test | Reading | Score |
|---|---|---|---|
| 1 | Gross margin stable or rising | 58.1% → 59.0% → 60.0% over 3y | **Pass** |
| 2 | Operating margin vs peers | 20.0% vs peer median 15% | **Pass** |
| 3 | ROE, DuPont-decomposed | 259 / 1,340 = 19.3%, equity multiplier only 1.8x | **Pass** |
| 4 | **ROIC > WACC** | 16.6% vs 8.5% — spread +8.1 pts | **Pass** |
| 5 | Current ratio | 2.1x | **Pass** |
| 6 | Net debt / EBITDA | 0.77x | **Pass** |
| 7 | Interest coverage | 13.2x | **Pass** |
| 8 | CFO / net income | 1.58 (3-yr avg 1.49) | **Pass** |
| 9 | DSO and inventory days | DSO 62 → 68 days over two years | **Watch** |
| 10 | Per-share growth | Revenue CAGR 8%; shares −1.2%/yr; EPS CAGR 11% | **Pass** |

**Score: 9 pass, 1 watch.** The single watch item is worth naming precisely rather than waving through: receivables are growing faster than revenue, which is either lengthening hospital payment terms (an industry condition, tolerable) or revenue being recognised on shipments that are not converting to cash (the Unit 5, Lesson 9 red flag). The footnote on the allowance for credit losses and the concentration of receivables by customer answers it. **That is what a "watch" means: a named question with a named place to look.**`,
        },
        {
          kind: 'example',
          md: `**The one-page thesis.** Seven sections, written before the order, re-read before the sale. Vantage:

> **1. The business.** Vantage sells diagnostic analysers to hospital labs at near-breakeven and earns its profit on the proprietary reagent cartridges those instruments consume. Roughly 78% of revenue is recurring consumable sales from an installed base of about 14,000 instruments.
>
> **2. Why it might be worth owning.** A 60.0% gross margin backed by a real switching cost — a hospital lab that has validated an instrument under its accreditation does not swap vendors casually. ROIC of 16.6% against an 8.5% WACC, an 8.1-point spread sustained for six years. Net debt of only 0.77x EBITDA. Share count falling 1.2% a year.
>
> **3. My estimate of value.** **$57–$63** per share. DCF on $275M of owner earnings growing 8/7/6/5/4% then 2.5% forever, r = 8.5%, gives **$62.64**. Peer EV/EBITDA of 12.0x on $455M gives (12 x 455 − 350) / 82 = **$62.32**; at a conservative 11.0x it gives **$56.77**. Two independent methods within 0.5% of each other at the top of the range.
>
> **4. What the price implies.** At $54.00 the reverse DCF implies about **2.9%** five-year owner-earnings growth, against a business that has compounded revenue at 8% and instrument placements at 6%. The discount to my central estimate is (62.64 − 54.00) / 62.64 = **13.8%**, against the 25% I require — so my buy-below price is 62.64 x 0.75 = **$46.98**.
>
> **5. The question the case turns on.** Does the installed base keep growing, or has instrument placement growth stalled? Cartridge revenue is a lagging function of instruments placed two to four years ago, so a placement slowdown today is invisible in revenue for years.
>
> **6. What would change my mind.** Instrument placements declining year over year for two consecutive quarters; gross margin below 57%; DSO above 75 days; a competitor winning an integrated delivery network contract covering more than 50 labs; any acquisition above 12x EBITDA.
>
> **7. Decision and size.** **No buy at $54.00** — a 13.8% discount against a 25% requirement. Watchlist, target weight 8% if it reaches $47.00, built in two tranches. Reassess on any Section 6 trigger.

**Section 6 is the section that matters.** It is the only one written when you are calm, and it is what converts a later disappointment from an emotional event into a pre-agreed trigger. Section 3 quoted as a range, not a point, is the other discipline: your estimate is a distribution and pretending otherwise is false precision (Unit 7, Lesson 6).`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "More research always produces a better decision."**

Past a point, additional research mostly produces additional **confidence**, not additional accuracy — and confidence is the input to position size, which is where errors become expensive. The calibration literature is consistent on this: analysts given more data grow markedly more certain while their hit rate barely moves. The defence is structural: fix the process at a stated depth, and make Section 5 (the question the case turns on) name the *one* fact that actually decides the outcome. Everything beyond that fact is decoration you are paying for in conviction.`,
        },
        {
          kind: 'callout',
          md: `**Read the filing before you read anyone\'s opinion of it.** Sell-side notes, forum posts, and video summaries arrive with a conclusion attached, and once you have absorbed one your reading of the primary document becomes a search for confirmation (Unit 12). The 10-K first, your own checklist and valuation second, other people\'s views third — where they are genuinely useful, because they can tell you what the market believes and therefore where you actually disagree.`,
        },
        {
          kind: 'keypoint',
          md: `Fixed sequence: read the 10-K in the order Item 1 → MD&A → statements → footnotes → risk factors → proxy; pass the three-sentence business test; run the Unit 5 ten-point checklist; triangulate multiples, DCF and reverse DCF (Units 6, 7); then write a seven-section one-page thesis before placing any order. Vantage Diagnostics: $1,850M revenue, 60.0% gross margin, 20.0% operating margin, FCF $315M, EV $4,778M, 10.5x EV/EBITDA, ROIC 16.6% vs 8.5% WACC, 9 passes and 1 watch. The thesis section that matters is "what would change my mind."`,
        },
      ],
      quiz: [
        {
          id: 'u13-l04-q1',
          prompt: 'Why read a 10-K out of order, starting with Item 1 and the MD&A?',
          choices: [
            'The financial statements are audited last, so they are least reliable',
            'Because the document is sequenced for legal compliance, and you need the business model and management\'s own account before the numbers can mean anything',
            'Because Item 1A risk factors are the most important section and should be saved for last',
            'Regulators require the sections to be read in that order',
          ],
          answerIdx: 1,
          explain:
            'The filing order serves disclosure law, not comprehension, so reading front to back buries what the company actually does behind boilerplate. Numbers without the business model are uninterpretable — which is why the test after step 1 is whether you can explain how the company makes money in three sentences.',
        },
        {
          id: 'u13-l04-q2',
          prompt:
            'Vantage has EBIT of $370M, a 24% tax rate, $600M of debt, $1,340M of equity and $250M of cash. What is its ROIC?',
          choices: [
            '16.6%',
            '14.5%',
            '19.1%',
            '21.9%',
          ],
          answerIdx: 0,
          explain:
            'NOPAT = 370 x 0.76 = $281.2M and invested capital = 600 + 1,340 − 250 = $1,690M, giving 281.2 / 1,690 = 16.6%. Leaving the $250M of cash in the denominator understates how hard the operating assets work, and using pre-tax EBIT overstates the return by ignoring the tax the business actually pays.',
        },
        {
          id: 'u13-l04-q3',
          prompt:
            'Vantage scores 9 passes and 1 watch, the watch being DSO rising from 62 to 68 days. What does a "watch" score actually mean?',
          choices: [
            'The item can be ignored if the other nine pass',
            'The position should be halved until the item resolves',
            'A named question with a named place to look — here, the credit-loss allowance and receivable concentration footnotes',
            'The checklist has failed and the company should be rejected',
          ],
          answerIdx: 2,
          explain:
            'Receivables growing faster than revenue is either lengthening hospital payment terms or revenue that is not converting to cash, and those two possibilities have very different implications. The value of scoring an item "watch" is that it converts a vague unease into a specific footnote to read.',
        },
        {
          id: 'u13-l04-q4',
          prompt: 'Which section of the one-page thesis does the lesson identify as the most important?',
          choices: [
            'Section 6 — what would change my mind',
            'Section 3 — my estimate of value',
            'Section 7 — the decision and position size',
            'Section 1 — a description of the business',
          ],
          answerIdx: 0,
          explain:
            'It is the only section written while you are calm and unattached, and it converts a future disappointment from an emotional event into a pre-agreed trigger. The valuation and the size both get quietly rewritten under stress; a list of falsifying conditions committed to paper in advance does not.',
        },
        {
          id: 'u13-l04-q5',
          prompt: 'What does additional research beyond a fixed depth mostly add?',
          choices: [
            'Accuracy, roughly in proportion to the time spent',
            'Better calibration between confidence and hit rate',
            'A broader set of alternative candidates',
            'Confidence, with little improvement in accuracy — which is dangerous because confidence drives position size',
          ],
          answerIdx: 3,
          explain:
            'Studies of expert forecasting consistently find that more information raises certainty far faster than it raises hit rates, and certainty is the input to sizing, where errors get expensive. The structural defence is to fix the research depth in advance and force the thesis to name the single fact the case turns on.',
        },
      ],
      cardSeeds: [
        {
          id: 'u13-l04-c1',
          kind: 'cloze',
          front:
            'The 10-K reading order: ____ (business) → ____ (management discussion) → ____ → ____ → ____ (skim for company-specific only) → ____ and proxy.',
          back: 'Item 1; Item 7 MD&A; the three financial statements; the footnotes; Item 1A risk factors; Item 5 share count/buybacks',
        },
        {
          id: 'u13-l04-c2',
          kind: 'basic',
          front: 'What are the seven sections of a one-page thesis?',
          back: '1. The business. 2. Why it might be worth owning. 3. My estimate of value (as a range). 4. What the price implies. 5. The single question the case turns on. 6. What would change my mind. 7. Decision and size. Section 6 is the one that matters.',
        },
        {
          id: 'u13-l04-c3',
          kind: 'cloze',
          front:
            'Vantage Diagnostics headline numbers: revenue ____, gross margin ____, operating margin ____, FCF ____, EV ____, EV/EBITDA ____, ROIC ____ against an 8.5% WACC.',
          back: '$1,850M; 60.0%; 20.0%; $315M; $4,778M; 10.5x; 16.6%',
        },
        {
          id: 'u13-l04-c4',
          kind: 'basic',
          front: 'What is the test you must pass after step 1 of the research process, before valuing anything?',
          back: 'Explain how the company makes money in three sentences to someone who has read nothing. If you cannot, no amount of spreadsheet work will rescue the valuation — you do not yet know what you are forecasting.',
        },
      ],
    },

    // ── L05 ───────────────────────────────────────────────────────────────
    {
      id: 'u13-l05',
      unitId: 'u13',
      order: 5,
      title: 'Sector & Macro Context',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Every valuation you have built has a macro assumption hidden inside it. In Unit 7 it was the discount rate: **r = risk-free rate + risk premium**, and the risk-free rate is set by the bond market, which is set by inflation and central bank policy. You cannot avoid having a macro view. You can only choose whether it is explicit.

The productive use of macro is as **context**, not timing:

- **Context**: knowing that your holding is a long-duration asset, so a 2-point rise in rates would cut its fair value by roughly a quarter, and sizing accordingly.
- **Timing**: selling because you believe rates will rise next quarter.

The first is risk management and requires no forecast. The second requires you to out-predict the bond market on its own subject.`,
        },
        {
          kind: 'example',
          md: `**Why growth stocks are rate-sensitive: duration.**

Two businesses, each generating **$100M** of free cash flow today. The only difference is the long-run growth rate. Value them with the perpetuity formula from Unit 7, Lesson 4: **V = FCF x (1 + g) / (r − g)**.

| | Mature Co (g = 2%) | Growth Co (g = 5%) |
|---|---|---|
| At r = 8% | 102 / 0.06 = **$1,700M** | 105 / 0.03 = **$3,500M** |
| At r = 10% | 102 / 0.08 = **$1,275M** | 105 / 0.05 = **$2,100M** |
| **Change** | **−25.0%** | **−40.0%** |

Identical cash flow today. Identical rate move. The faster-growing business loses **60% more** of its value.

**Why.** The higher the growth rate, the further into the future the average dollar of value sits. That is exactly what **duration** means for a bond, and it means the same thing here: a long-duration asset is more sensitive to the rate used to discount it. A company earning most of its value in years 15–30 is a 20-year zero-coupon bond wearing a ticker.

This single table explains a pattern that gets attributed to sentiment every cycle: when rates rise sharply, unprofitable high-growth companies fall much harder than profitable slow-growth ones, without a single piece of company news. **The businesses did not change. The denominator did.**`,
        },
        {
          kind: 'text',
          md: `**Sector rotation — the textbook version, and its honest caveat.**

| Cycle phase | Typically leads | Reason |
|---|---|---|
| Early expansion | Consumer discretionary, financials, industrials | Rates low, credit reopening, pent-up demand |
| Mid expansion | Technology, industrials | Capex and hiring cycles run |
| Late expansion | Energy, materials | Capacity tight, input prices rising |
| Contraction | Staples, utilities, health care | Demand for their output barely changes |

**The caveat, and it is a large one.** This describes tendencies observed after the fact, in data where the cycle phase was labelled with hindsight. In real time nobody knows which phase they are in — the NBER dates US recessions in retrospect, often a year or more after the turning point it identifies. A framework that requires you to know the current phase to be useful is not usable when it matters.

What the table *is* good for: understanding **why your portfolio moved**, and noticing that you have unknowingly concentrated in one phase. If your six holdings are two banks, two homebuilders, an auto supplier, and a staffing company, you do not have six ideas. You have one interest-rate bet in six costumes.`,
        },
        {
          kind: 'example',
          md: `**Cyclicals and the peak-earnings trap.** (Unit 6, Lesson 3, made concrete.)

Cascade Steel earns **$8.00** per share at the top of the cycle and trades at **$48.00** — a **6.0x** P/E, which looks like the cheapest stock on any screen you run.

Four years later, at the bottom of the cycle, Cascade earns **$0.50**. At the same $48 price that is a **96x** P/E.

Same company, same assets, same management. The P/E swung from 6x to 96x on the denominator alone.

**The rule this generates:** for a cyclical, a *low* P/E on peak earnings is a warning and a *high* P/E on trough earnings is often the opportunity — the exact inverse of the reflex a screen trains. This is why cyclicals are valued on **normalised** earnings (an average across a full cycle), on price-to-book, or on EV per unit of capacity, rather than on a single year of EPS.

**Defensives** invert the profile. A utility or a staples company has stable earnings and therefore a stable multiple, which is why they hold up in contractions — and also why they rarely produce the returns that come from a cyclical bought correctly at the trough.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Understanding the macro cycle lets me rotate sectors ahead of it."**

This requires being right about three things in sequence: which phase we are in now, when it turns, and how much of that is already in prices. The third one defeats almost everyone, because sector prices already embed the consensus expectation — so being right about the economy and wrong about what was priced still loses money. Professional macro funds with dedicated teams and real-time data have a mixed record at this. Use the framework to understand your exposures, not to schedule them.`,
        },
        {
          kind: 'callout',
          md: `**Macro flows into your model through one number.** You do not need a view on GDP. You need to know that your discount rate rests on the risk-free rate, and that the risk-free rate moves. The practical discipline from Unit 7, Lesson 6 is to run your DCF at r and at r + 2 points, and to look at the second number before you size the position — not to predict the move, but to know in advance what it would do to you.`,
        },
        {
          kind: 'keypoint',
          md: `Growth stocks are rate-sensitive because they are long-duration: the same 8% → 10% discount-rate move cuts a g = 2% perpetuity by 25.0% and a g = 5% perpetuity by 40.0%, with no change to either business. Sector rotation describes tendencies labelled with hindsight — the NBER dates recessions a year or more late — so use it to understand your exposures, not to schedule them. Cyclicals invert the P/E reflex: Cascade Steel at 6x on $8.00 peak EPS becomes 96x on $0.50 trough EPS at the same $48 price. Run every DCF at r and r + 2 points before sizing.`,
        },
      ],
      quiz: [
        {
          id: 'u13-l05-q1',
          prompt:
            'A perpetuity generating $100M of FCF is valued at r = 8% then r = 10%. Which loses more value, g = 2% or g = 5%, and by how much?',
          choices: [
            'The g = 2% business, because low growth offers no offset to higher rates',
            'They lose the same proportion, since the rate change is identical',
            'The g = 5% business: −40.0% versus −25.0%',
            'Neither changes, because the cash flow today is unchanged',
          ],
          answerIdx: 2,
          explain:
            'At g = 5% the value falls from 105/0.03 = $3,500M to 105/0.05 = $2,100M, a 40.0% loss, while at g = 2% it falls from $1,700M to $1,275M, a 25.0% loss. The faster grower has more of its value sitting further in the future, which is exactly what duration means — and it is why high-growth names fall hardest when rates rise, with no company news at all.',
        },
        {
          id: 'u13-l05-q2',
          prompt: 'What is the main reason sector-rotation frameworks are hard to use in real time?',
          choices: [
            'The relationships between sectors and cycle phases are entirely spurious',
            'Sector ETFs are too expensive to trade frequently',
            'Nobody knows which cycle phase they are currently in — the NBER dates recessions in retrospect, often a year or more later',
            'Sector definitions change too often for the framework to apply',
          ],
          answerIdx: 2,
          explain:
            'The tendencies are real but were identified in data where the phase had been labelled with hindsight, and a framework that needs the current phase as an input cannot supply it when you need it. Even a correct read of the economy loses money if the market has already priced it, which is the third and hardest hurdle.',
        },
        {
          id: 'u13-l05-q3',
          prompt:
            'Cascade Steel trades at $48.00 on peak EPS of $8.00 (6.0x) and later earns $0.50 at the trough. What does this show about cyclicals?',
          choices: [
            'Cyclical companies should be avoided because their earnings are unpredictable',
            'The P/E ratio does not apply to industrial companies',
            'A cyclical\'s P/E is most reliable when computed on the most recent quarter',
            'A low P/E on peak earnings is a warning and a high P/E on trough earnings is often the opportunity — the inverse of the screening reflex',
          ],
          answerIdx: 3,
          explain:
            'At the same $48 price the multiple swings from 6x to 96x purely on the denominator, so a single year of EPS carries almost no information about a cyclical. That is why they are valued on normalised earnings across a full cycle, price-to-book, or EV per unit of capacity instead.',
        },
        {
          id: 'u13-l05-q4',
          prompt:
            'Your six holdings are two banks, two homebuilders, an auto supplier and a staffing company. What is the macro observation?',
          choices: [
            'The portfolio is well diversified across six distinct industries',
            'These are six expressions of a single early-cycle interest-rate bet, so the diversification is cosmetic',
            'The portfolio is defensively positioned for a contraction',
            'Six positions is too few to draw any conclusion about exposure',
          ],
          answerIdx: 1,
          explain:
            'Every one of those businesses gets its demand from cheap credit and an expanding consumer, so they will move together in exactly the conditions where diversification is supposed to help. Counting tickers is not the same as counting bets — which is the main practical use of the sector framework.',
        },
      ],
      cardSeeds: [
        {
          id: 'u13-l05-c1',
          kind: 'basic',
          front: 'Why are growth stocks more sensitive to interest rates than mature ones?',
          back: 'Duration. More of a fast grower\'s value sits far in the future, so it is discounted by a larger power of (1+r). The same 8% → 10% move cuts a g = 2% perpetuity by 25.0% and a g = 5% perpetuity by 40.0% — the businesses did not change, the denominator did.',
        },
        {
          id: 'u13-l05-c2',
          kind: 'cloze',
          front:
            'For a cyclical, a ____ P/E on ____ earnings is a warning, and a ____ P/E on ____ earnings is often the opportunity. Value them on ____ instead.',
          back: 'low; peak; high; trough; normalised (full-cycle average) earnings, price-to-book, or EV per unit of capacity',
        },
        {
          id: 'u13-l05-c3',
          kind: 'basic',
          front: 'How should macro be used — and how should it not be?',
          back: 'As context, not timing. Context: knowing your holding is long-duration so a 2-point rate rise cuts its value by a quarter, and sizing for that (run every DCF at r and r + 2). Timing: selling because you predict next quarter\'s rates, which requires out-forecasting the bond market and beating what is already priced.',
        },
      ],
    },

    // ── L06 ───────────────────────────────────────────────────────────────
    {
      id: 'u13-l06',
      unitId: 'u13',
      order: 6,
      title: 'Earnings Events',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Four times a year a company reports, and the stock can move 10% in a morning on a business that changed by 1%. Understanding why is one of the fastest routes to understanding what a share price actually is.

**A stock does not react to results. It reacts to results minus expectations.**

The price already embeds a consensus forecast — revenue, EPS, margins, next quarter's guidance, and a dozen operating metrics analysts track. The report replaces an estimate with a fact, and the price moves by the size of the **surprise**, not the size of the number.

This is why the two most confusing outcomes are actually the normal ones:

- **Great results, stock falls.** The results were good but expectations were better, or the guidance for the future was worse.
- **Poor results, stock rises.** The results were bad and expectations were worse, or something in the report resolves an uncertainty the market was pricing.`,
        },
        {
          kind: 'example',
          md: `**Great quarter, stock down 11%.** A fictional reporting day:

| Metric | Consensus | Reported | Surprise |
|---|---|---|---|
| Revenue | $505M | $498M | **−1.4%** |
| EPS | $1.20 | $1.28 | **+6.7%** |
| Next-quarter revenue guidance | $530M | $505–515M (mid $510M) | **−3.8%** |

The headline that afternoon reads "beats earnings estimates by 7%". The stock closes down **11%**. Three things are happening, and only the third is really about this quarter.

**1. The revenue miss.** Revenue is harder to manage than EPS and is the better read on demand. A beat on the bottom line alongside a miss on the top line is a quality warning before you look at anything else.

**2. The EPS beat is not operational.** Decompose it. Pre-tax income was **$148M** against an expected $146M, and there are 95M shares. The difference was the **tax rate**: 18% actual against 22% expected.

- At the actual 18% rate: 148 x 0.82 / 95 = **$1.28**
- At the expected 22% rate: 148 x 0.78 / 95 = **$1.22**

So **$0.06 of the $0.08 beat came from the tax line.** The operating business beat by about 1.5%, not 6.7%. A tax rate is not a durable earnings stream.

**3. The guidance cut is the actual news.** Guidance is the market's next estimate, and a midpoint 3.8% below consensus resets every future year of the model — which is where a DCF gets almost all of its value (Unit 7, Lesson 4). A quarter is one data point out of the forty in a ten-year forecast; a permanent 3.8% reduction in the base applies to all forty.

**The stock did not fall despite the beat. It fell because the beat was cosmetic and the future got smaller.**`,
        },
        {
          kind: 'text',
          md: `**Post-earnings announcement drift (PEAD).** Stocks that report large positive surprises have historically tended to keep drifting upward for weeks afterwards, and large negative surprises to keep drifting down — a documented anomaly since the late 1960s and one of the most persistent in the literature.

Three honest caveats before you try to use it:

1. **It has weakened substantially** since it was published and widely traded, which is the normal fate of published anomalies (Unit 14, Lesson 5).
2. **The average effect is small relative to costs.** A drift of a few percent over sixty days, net of spread and short-term taxation, is thin for a retail participant.
3. **It is an average over thousands of events.** Any single stock's drift is dominated by noise, so it can inform a decision you were already making and cannot support one on its own.

Where it is genuinely useful: it is evidence that markets **absorb information gradually**, which means you do not need to act in the first ten minutes. The pressure to trade instantly on an earnings release is manufactured.`,
        },
        {
          kind: 'example',
          md: `**Holding through earnings is a position-sizing decision, not a prediction.**

You cannot forecast a surprise — if you could, so could everyone else, and it would not be a surprise. What you *can* do is decide how much of your portfolio is exposed to a coin flip on a specific morning.

Suppose you have built the full **8%** position in Vantage Diagnostics, and the options market implies an expected move of about **9%** on the earnings date (Unit 14, Lesson 4 explains where that number comes from).

- Single-day portfolio exposure: 8% x 9% = **0.72%** of total capital
- Trim to a 5% position: 5% x 9% = **0.45%**

Now ask the only question that matters: **is 0.72% of my portfolio an acceptable amount to put on a single unpredictable morning?** For a thesis measured in years, usually yes — the whole reason you own a razor-and-blades business with a 16.6% ROIC is that quarterly noise is irrelevant to the argument. For an 18% position, 1.62% on one morning is a different conversation.

**The disqualifying answer.** If you find yourself wanting to trim purely because you are anxious about the print, the position was too big before the earnings date was ever relevant. Unit 11 sized it; the calendar merely revealed the mistake.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "A company that beats earnings estimates is a good investment."**

Consensus estimates are a moving target that management actively shapes — guiding conservatively, then beating the number they guided to, is a routine investor-relations practice that produces a long unbroken streak of beats with no information in it whatsoever. Roughly two thirds to three quarters of S&P 500 companies beat consensus EPS in a typical quarter, which tells you the bar is set to be cleared. What matters is **revenue growth, margins, cash conversion, and guidance** — the things a tax rate cannot manufacture.`,
        },
        {
          kind: 'callout',
          md: `**Do not re-underwrite a multi-year thesis on one quarter.** A single quarter can move revenue by a shipping delay, a large customer's budget timing, or a leap year. The question after any report is narrow and specific: **did this quarter trip one of the triggers in Section 6 of my thesis?** For Vantage that means instrument placements down year over year for two consecutive quarters, gross margin below 57%, or DSO above 75 days. If not, the report is data. If yes, it is a decision.`,
        },
        {
          kind: 'keypoint',
          md: `Stocks react to results minus expectations, so good results can drop a stock. In the worked case: revenue missed 1.4%, EPS "beat" 6.7% but $0.06 of the $0.08 came from an 18% tax rate versus 22% expected, and guidance came in 3.8% below consensus — which resets every year of the model, not one quarter. PEAD is real, documented, weakened since publication, and small relative to costs. Holding through earnings is a sizing decision: an 8% position with a 9% implied move risks 0.72% of the portfolio on one morning. After the print, ask only whether a Section 6 trigger fired.`,
        },
      ],
      quiz: [
        {
          id: 'u13-l06-q1',
          prompt: 'Why can a company report strong results and still see its stock fall sharply?',
          choices: [
            'Because earnings reports are usually released after the market closes',
            'Because the price already embedded a consensus expectation, and the stock moves on the surprise — including guidance for the future',
            'Because institutions are required to rebalance on reporting dates',
            'Because reported earnings are unaudited and therefore discounted by the market',
          ],
          answerIdx: 1,
          explain:
            'The price is a forecast, so the report replaces an estimate with a fact and the move is the size of the difference. Guidance matters more than the quarter because it resets every future year of the model, where a DCF gets almost all of its value.',
        },
        {
          id: 'u13-l06-q2',
          prompt:
            'A company reports pre-tax income of $148M on 95M shares at an 18% tax rate, against an expected 22%. How much of the EPS beat came from tax?',
          choices: [
            '$0.06 of the $0.08 beat — the operating business beat by about 1.5%, not 6.7%',
            'None; the tax rate does not affect EPS',
            '$0.02, with the rest operational',
            'The entire $0.08',
          ],
          answerIdx: 0,
          explain:
            'At 18%, EPS is 148 x 0.82 / 95 = $1.28; at the expected 22% it is 148 x 0.78 / 95 = $1.22, so $0.06 of the $0.08 came from the tax line alone. A tax rate is not a durable earnings stream, which is why a headline beat has to be decomposed before it means anything.',
        },
        {
          id: 'u13-l06-q3',
          prompt:
            'The same company misses revenue by 1.4% while beating EPS by 6.7%. Why is that combination a warning?',
          choices: [
            'It always indicates accounting fraud',
            'Analysts weight revenue more heavily than EPS in their models',
            'It shows the company overspent on marketing',
            'Revenue is harder to manage than EPS and is the better read on demand, so a bottom-line beat over a top-line miss signals low-quality earnings',
          ],
          answerIdx: 3,
          explain:
            'EPS sits below tax, interest, share count and non-recurring items, all of which can be nudged, while revenue reflects what customers actually bought. Beating on the manageable line while missing on the unmanageable one points at the quality of the beat rather than at fraud.',
        },
        {
          id: 'u13-l06-q4',
          prompt: 'What is the honest assessment of post-earnings announcement drift for a retail investor?',
          choices: [
            'It is a reliable standalone strategy that works on any individual stock',
            'Real and documented, but weakened since publication and small relative to spread and short-term taxes — useful mainly as evidence that markets absorb information gradually',
            'It has been fully disproven by modern research',
            'It applies only to negative surprises',
          ],
          answerIdx: 1,
          explain:
            'The anomaly has been documented since the late 1960s and has decayed substantially since being widely traded, and a few percent over sixty days is thin after costs. Its practical value is the reminder that the pressure to trade in the first ten minutes after a release is manufactured.',
        },
        {
          id: 'u13-l06-q5',
          prompt:
            'You hold an 8% position with a 9% implied earnings move and feel anxious enough to want to trim. What does that reveal?',
          choices: [
            'That the market expects bad news, since implied moves rise before negative surprises',
            'That trimming before earnings is always the correct risk management',
            'That the implied move is too high and the options are mispriced',
            'That the position was too large before the earnings date was ever relevant — the calendar revealed a sizing error, it did not create one',
          ],
          answerIdx: 3,
          explain:
            'The exposure is 8% x 9% = 0.72% of the portfolio on one morning, and if that is intolerable the position exceeded your risk tolerance from the day you bought it. Implied moves are symmetric and say nothing about direction, so anxiety is information about your sizing rather than about the company.',
        },
      ],
      cardSeeds: [
        {
          id: 'u13-l06-c1',
          kind: 'cloze',
          front:
            'A stock reacts to results minus ____. The reported quarter is one data point; ____ is what resets every year of the model.',
          back: 'expectations (consensus); guidance',
        },
        {
          id: 'u13-l06-c2',
          kind: 'basic',
          front: 'How do you decompose an EPS "beat" to see whether it is real?',
          back: 'Work back up the income statement. Check whether pre-tax income actually beat, or whether the tax rate, share count, or a one-off item did the work. Worked case: $148M pre-tax on 95M shares at 18% tax gives $1.28 versus $1.22 at the expected 22% — $0.06 of the $0.08 beat was tax, so the operating beat was ~1.5%, not 6.7%.',
        },
        {
          id: 'u13-l06-c3',
          kind: 'basic',
          front: 'Why is beating consensus EPS a weak signal?',
          back: 'Management shapes the consensus by guiding conservatively and then clearing the bar it set. Roughly two thirds to three quarters of large-cap companies beat EPS consensus in a typical quarter. Revenue growth, margins, cash conversion and guidance carry the information instead.',
        },
        {
          id: 'u13-l06-c4',
          kind: 'basic',
          front: 'How do you decide whether to hold a position through earnings?',
          back: 'As a sizing decision, not a prediction. Multiply position weight by the implied move: an 8% position with a 9% implied move puts 0.72% of the portfolio on one morning; trimming to 5% makes it 0.45%. If anxiety is the reason you want to trim, the position was already too big.',
        },
      ],
    },

    // ── L07 ───────────────────────────────────────────────────────────────
    {
      id: 'u13-l07',
      unitId: 'u13',
      order: 7,
      title: 'Building a Checklist',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `In 1935 the US Army Air Corps held a fly-off for its next bomber. Boeing's Model 299 was the clear favourite, and on its demonstration flight it took off, stalled, and crashed, killing the pilot. The investigation found no mechanical fault. The crew had forgotten to release a gust lock on the control surfaces. The pilot was one of the most experienced in the service.

The aircraft was not judged too complex to fly. It was judged too complex to fly **from memory**. The response was a printed checklist, and the aircraft went on to fly millions of miles as the B-17.

Medicine reached the same conclusion much later. A 2009 study of a nineteen-item surgical safety checklist across eight hospitals reported the inpatient death rate falling from 1.5% to 0.8% after adoption. The items were not sophisticated — confirm the patient's identity, confirm the site, confirm antibiotics given. They were things everyone already knew and sometimes skipped.

**This is the entire argument for an investing checklist.** It is not that you do not know what to check. It is that under time pressure, excitement, or the influence of a story you like, you will skip the step you skipped last time — and you will not notice.`,
        },
        {
          kind: 'text',
          md: `**The pre-buy checklist.** Eighteen items in six blocks, each traceable to the unit that justifies it. Score each pass, watch, or fail.

**A. The business (Units 1, 3)**
1. I can explain how it makes money in three sentences.
2. I can name the top three competitors and why customers choose this one.
3. Revenue is understandable and repeatable, not a single contract or event.
4. I know what would make a customer leave.

**B. The financials (Units 3, 4, 5)**
5. Gross margin stable or rising over five years.
6. **ROIC exceeds WACC by three points or more.**
7. CFO / net income >= 1.0 on a three-year average.
8. Net debt / EBITDA < 3.0x and interest coverage > 4x.
9. Share count flat or falling; dilution is not eating growth.

**C. Valuation (Units 6, 7)**
10. At least two independent methods produce a value, and I know why they disagree.
11. The reverse DCF implies growth I can defend against the company's own history.
12. The price offers a margin of safety scaled to how uncertain the estimate is.

**D. Timing and level (Units 8, 9, 10)**
13. I know where the thesis would be visibly wrong on the chart, and what that costs per share.
14. The reward-to-risk from here is at least 3:1.

**E. Risk (Unit 11)**
15. The position at this size keeps a single loss inside my per-idea risk limit.
16. It does not duplicate a factor or sector bet I already own.

**F. Behaviour (Unit 12)**
17. I heard about this at least 48 hours ago and the thesis is written down.
18. I can state, in one sentence, what would make me sell.`,
        },
        {
          kind: 'text',
          md: `**Red-flag vetoes.** Distinct from scored items. A veto is not weighed against anything — one is enough to stop, regardless of how attractive everything else looks. Five of them:

| Veto | Detects | From |
|---|---|---|
| CFO below net income for three consecutive years with receivables growing faster than revenue | Earnings that are not cash | Unit 5, L9 |
| Going-concern language, a covenant waiver, or debt maturing inside 12 months without a plan | Existential balance sheet risk | Unit 4, L4 |
| Auditor resignation, restatement, or a late filing | The numbers themselves are in question | Unit 5, L9 |
| I cannot explain the business model in three sentences | I do not know what I am buying | Unit 1, L1 |
| The strongest argument in my thesis is that it has gone up, or that someone I admire owns it | There is no thesis | Unit 12 |

Vetoes exist because scored checklists have a fatal failure mode: a high total score can drown a single disqualifying fact. Seventeen passes and one instance of "the auditor resigned" is not a 17/18 investment. It is a no.`,
        },
        {
          kind: 'example',
          md: `**Vantage Diagnostics through the full checklist.**

| Block | Items | Result |
|---|---|---|
| A. Business | 1–4 | 4 pass — razor-and-blades model, three named competitors, 78% recurring revenue, switching cost is accreditation-driven instrument validation |
| B. Financials | 5–9 | 5 pass — 60.0% gross margin rising, ROIC 16.6% vs 8.5% WACC (+8.1 pts), CFO/NI 1.58, net debt/EBITDA 0.77x, coverage 13.2x, shares −1.2%/yr |
| C. Valuation | 10–12 | 2 pass, **1 watch** — DCF $62.64 and peer EV/EBITDA $62.32 agree within 0.5%; reverse DCF implies 2.9% growth vs 8% history; but $54.00 is only **13.8%** below the estimate against a 25% requirement |
| D. Timing | 13–14 | 1 pass, **1 watch** — support shelf at $47.00, so entry at $54.00 risks **$7.00** per share against $8.64 of reward to $62.64, a ratio of **1.23:1** — below the 3:1 standard |
| E. Risk | 15–16 | 2 pass — 8% target weight, no other health-care exposure |
| F. Behaviour | 17–18 | 2 pass — idea sourced 6 weeks ago, thesis written, sell trigger stated |

**Score: 16 pass, 2 watch, 0 vetoes.**

**The decision this produces is not "buy".** Both watch items are about the same thing — the **price**, not the business. Item 12 says the 13.8% discount is short of the 25% you require; item 14 says 1.23:1 is short of the 3:1 you require. They are two instruments reading the same gauge.

The disciplined response is Lesson 1's Entry B. Buying nearer the $47.00 support shelf — entry $48.50, invalidation $45.00 — gives $3.50 of risk against $14.14 of reward to $62.64, a ratio of **4.04:1**, and a discount to value of 22.6%. At $54.00 you are paying for a good business without the compensation for being wrong.

Notice what the checklist prevented. Sixteen strong passes on a genuinely excellent company generate real enthusiasm, and enthusiasm is exactly what would have waved items 12 and 14 through.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "A checklist is for beginners; experienced investors internalise it."**

The surgical checklist study was run on trained surgeons, and the Model 299 was crashed by an elite test pilot. Expertise does not prevent omission errors — it is what makes them feel impossible, which is why they go unnoticed. Experience should change the *contents* of your checklist as you learn which failures are actually yours; it should never change whether you use one. The pilots with the most hours are the most rigid about running it.`,
        },
        {
          kind: 'callout',
          md: `**Your checklist should be personal and should grow.** The eighteen items here are a starting structure. The real checklist is built from your own post-mortems (Unit 14, Lesson 11): every loss that traces to a repeatable cause becomes a new line. If you have twice been burned by acquisitive roll-ups, add "no more than one acquisition above 10% of enterprise value in the last three years." A checklist assembled from your own scar tissue gets used; one copied from a book gets abandoned in month two.`,
        },
        {
          kind: 'keypoint',
          md: `Checklists beat memory because omission errors are invisible from the inside — the Model 299 crash and the 2009 surgical checklist study (1.5% to 0.8% inpatient deaths) both involved experts skipping steps they knew. Use eighteen scored items in six blocks: business, financials, valuation, timing, risk, behaviour — plus five red-flag vetoes that stop the process outright regardless of score, because a high total can otherwise drown one disqualifying fact. Vantage scores 16 pass, 2 watch, 0 vetoes, and both watch items are about the price rather than the business: a 13.8% discount against a 25% requirement, and 1.23:1 reward-to-risk against a 3:1 requirement.`,
        },
      ],
      quiz: [
        {
          id: 'u13-l07-q1',
          prompt: 'What do the Boeing Model 299 crash and the surgical checklist study have in common?',
          choices: [
            'Both involved experts omitting a step they already knew, showing that expertise does not prevent omission errors',
            'Both showed that complex systems should be simplified rather than documented',
            'Both demonstrated that written procedures slow down expert performance',
            'Both were caused by inadequate training',
          ],
          answerIdx: 0,
          explain:
            'A highly experienced test pilot forgot a gust lock and trained surgeons skipped confirming the surgical site — neither failure was a knowledge gap. That is precisely why a checklist helps: it catches the step you skipped last time and did not notice skipping.',
        },
        {
          id: 'u13-l07-q2',
          prompt: 'How does a red-flag veto differ from a scored checklist item?',
          choices: [
            'Vetoes are scored double-weight in the total',
            'Vetoes apply only to companies below $500M in market value',
            'A veto stops the process outright regardless of the total score, because a high score can otherwise drown one disqualifying fact',
            'Vetoes are checked only after a position has been established',
          ],
          answerIdx: 2,
          explain:
            'Seventeen passes alongside an auditor resignation is not a 17/18 investment, it is a no — and a purely additive score would let the good news outvote the fact that the numbers themselves are in question. Vetoes exist to make that arithmetic impossible.',
        },
        {
          id: 'u13-l07-q3',
          prompt:
            'Vantage scores 16 pass, 2 watch, 0 vetoes, both watch items concerning price: a 13.8% discount against a 25% requirement and 1.23:1 reward-to-risk against 3:1. What is the correct action?',
          choices: [
            'Do not buy at $54.00 — the business qualifies but the entry price does not; wait or build in tranches',
            'Buy, since 16 of 18 items pass comfortably',
            'Reject the company permanently, since it failed an item',
            'Buy a half position, since the failure is only on one item',
          ],
          answerIdx: 0,
          explain:
            'Both watch items are about the price you are being offered, not about the business, so the remedy is a better entry rather than a different company or a smaller size. This is exactly the case the checklist exists to catch: sixteen strong passes generate enthusiasm, and enthusiasm is what would have waved items 12 and 14 through.',
        },
        {
          id: 'u13-l07-q4',
          prompt: 'What is the best source of new items for your personal checklist?',
          choices: [
            'Your own post-mortems — every loss that traces to a repeatable cause becomes a new line',
            'The most recent investing book you read',
            'The consensus items used by professional analysts',
            'Whatever caused the largest losses in the market last year',
          ],
          answerIdx: 0,
          explain:
            'A checklist assembled from your own scar tissue addresses the failures you actually make and therefore gets used, while a borrowed list guards against someone else\'s mistakes and gets abandoned. Experience should change the contents of the checklist, never whether you run one.',
        },
      ],
      cardSeeds: [
        {
          id: 'u13-l07-c1',
          kind: 'cloze',
          front:
            'The pre-buy checklist has six blocks: ____ (U1, U3), ____ (U3–U5), ____ (U6, U7), ____ (U8–U10), ____ (U11), and ____ (U12).',
          back: 'the business; the financials; valuation; timing and level; risk; behaviour',
        },
        {
          id: 'u13-l07-c2',
          kind: 'basic',
          front: 'Name the five red-flag vetoes.',
          back: '1. CFO below net income three years running with receivables outgrowing revenue. 2. Going-concern language, covenant waiver, or debt maturing within 12 months with no plan. 3. Auditor resignation, restatement, or late filing. 4. Cannot explain the business in three sentences. 5. The strongest argument is that it went up or that someone admired owns it.',
        },
        {
          id: 'u13-l07-c3',
          kind: 'basic',
          front: 'Why do vetoes have to sit outside the scoring system?',
          back: 'A purely additive score lets seventeen good facts outvote one disqualifying fact. An auditor resignation is not offset by a high ROIC — it means the ROIC may not be real. Vetoes stop the process regardless of the total.',
        },
      ],
    },

    // ── L08 ───────────────────────────────────────────────────────────────
    {
      id: 'u13-l08',
      unitId: 'u13',
      order: 8,
      title: 'The Sell Decision',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Buying has structure: a screen, a checklist, a valuation, a thesis. Selling usually has none, which is why most investors are measurably worse at it. Three reasons it is harder:

1. **No natural trigger.** A screen tells you when to look at a purchase. Nothing tells you when to look at a holding, so the decision gets made only when something forces it — usually a price move, which is the worst possible prompt.
2. **The position is now part of your identity.** You have defended it, perhaps publicly. Unit 12 covered the disposition effect and the endowment effect, and both bite hardest here.
3. **The purchase price is irrelevant and impossible to ignore.** The market does not know what you paid. Your brain refuses to stop knowing.

The corrective is to reduce selling to a small number of pre-defined reasons and refuse the rest.`,
        },
        {
          kind: 'text',
          md: `**Three legitimate reasons to sell, and the tests that fire them.**

| # | Reason | Test |
|---|---|---|
| 1 | **The thesis is broken** | A Section 6 trigger from the written thesis has fired. The facts changed, so the conclusion changes. |
| 2 | **The price now exceeds value** | Re-run the reverse DCF (Unit 7, L8). If today's price requires growth you cannot defend, the margin of safety has become a margin of danger. |
| 3 | **A materially better use of the capital** | Not "another idea I like" — an idea good enough to clear reason 3's tax hurdle below. |

**And a fourth that is mechanical rather than analytical:** trimming a position back to its target weight after it has grown (Lesson 9's rebalancing).

**Illegitimate reasons, all of which feel like reasons:**
- It is down and selling would stop the discomfort.
- It is up 20% and locking in the gain feels prudent.
- It has done nothing for eight months and I am bored.
- Someone on the internet is bearish.

The diagnostic that separates them: **would this reason have convinced me before I owned it?** "The company lost its two largest customers" survives that test. "It is down 15%" does not.`,
        },
        {
          kind: 'example',
          md: `**"Thesis broken" versus "price moved" — the same 30% decline, two different answers.**

You own Vantage Diagnostics. It trades at $54.00, then falls to $37.80 — a **−30%** move. Which case is it?

**Case A — the price moved.** The decline came with a sector-wide de-rating: rates rose two points and every medical-device name fell together (Lesson 5's duration effect). Vantage's instrument placements grew 7%, gross margin held at 60.1%, DSO improved to 64 days. **No Section 6 trigger fired.**

Your $57–63 estimate of value is unchanged, so at $37.80 the discount to your $62.64 central estimate widens from **13.8%** to **39.7%**. The correct action is to buy more, subject to position limits — and if that feels wrong, notice that it is exactly the action your own written thesis prescribed when you were calm.

**Case B — the thesis broke.** The decline came with the Q3 report: instrument placements fell 9% year over year for the second consecutive quarter, and a competitor won a 60-lab integrated delivery network contract. Two Section 6 triggers fired.

Cartridge revenue lags placements by two to four years, so today's revenue still looks fine and will not for long. **Your estimate of value must be rebuilt before you can say anything about the price.** If placements are structurally declining, fair value may be $34, and $37.80 is expensive.

**Identical price action. Opposite conclusions.** The price told you nothing; the thesis triggers told you everything. This is why Section 6 is written before the purchase — after a 30% fall, nobody writes an honest list of falsifying conditions.`,
        },
        {
          kind: 'example',
          md: `**The tax hurdle on a switch.** (Unit 2, Lesson 8.)

You hold a position worth **$60,000** containing a **$10,000** unrealised gain, and you want to switch into a better idea.

| | Short-term (held < 1 year, 32% rate) | Long-term (held > 1 year, 15% rate) |
|---|---|---|
| Tax on the switch | 10,000 x 0.32 = **$3,200** | 10,000 x 0.15 = **$1,500** |
| Capital left to reinvest | $56,800 | $58,500 |
| Hurdle: new idea must beat the old by | 3,200 / 60,000 = **5.33%** | 1,500 / 60,000 = **2.50%** |

The new idea does not need to be *better*. It needs to be better **by more than 5.33%** just to break even on the switch — and if the holding period crosses the one-year line in six weeks, waiting six weeks cuts the hurdle to 2.50%.

**Two disciplines fall out of this.** First, tax is a real component of the sell decision and belongs in the arithmetic, not as an afterthought. Second — and more important — **tax must never veto reason 1**. If the thesis is broken, you sell and pay the tax. Paying $3,200 to avoid a further loss on a business that has stopped working is not a cost, it is the exit fee. Investors who let tax deferral override a broken thesis end up with concentrated positions in deteriorating companies, held for tax reasons, which is how a manageable loss becomes a permanent one.`,
        },
        {
          kind: 'text',
          md: `**Trailing rules and review cadence.**

A **trailing stop** — sell if the price falls X% from its high — is popular and mostly misapplied to long-term holdings. Consider the arithmetic: a stock with 40% annualised volatility has a daily standard deviation of about 40% / sqrt(252) = **2.5%**. Drawdowns of 20–25% from a running high occur routinely in such a stock *within ongoing uptrends*. A 20% trailing stop on a volatile compounder does not protect you from a broken thesis; it guarantees you will be removed from a working one, repeatedly, paying tax and spread each time.

Trailing rules belong to the trading lane (Lesson 2), where the holding period is short enough that price *is* the thesis. For a multi-year holding, the invalidation level is a **fact about the business**, not a percentage from a high.

**Review cadence — the fix for "no natural trigger":**

| Cadence | Activity |
|---|---|
| **Quarterly** | Read the report against Section 6 only. Did a trigger fire? Fifteen minutes per holding. |
| **Annually** | Full re-underwrite. Re-read the 10-K, re-run the checklist, rebuild the valuation. Then ask the killer question: **would I buy this today, at this price, in this size, knowing what I now know?** If no, that is a sell, whatever the purchase price was. |
| **Never** | Reviewing because the price moved. |`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "You can never go broke taking a profit."**

You can go broke *only* taking profits. Portfolio returns are dominated by a small number of positions that compound for years, and a rule that sells every winner at +20% systematically removes exactly those. The mirror image is worse: selling winners and holding losers inverts your portfolio quality over time until you own a museum of broken theses. The relevant question is never "am I up?" but "**does the current price still leave a margin of safety against my estimate of value?**"`,
        },
        {
          kind: 'callout',
          md: `**The annual re-underwrite question is the whole discipline in one line.** "Would I buy this today, at this price, in this size, knowing what I now know?" It works because it deletes the purchase price from the decision — which is the single most contaminating number in your head, and the one the market has never heard of. If the answer is no, you are holding for a reason that is not about the investment.`,
        },
        {
          kind: 'keypoint',
          md: `Sell for three reasons only: the thesis broke (a Section 6 trigger fired), the price now exceeds value (re-run the reverse DCF), or a materially better use of capital that clears the tax hurdle — plus mechanical rebalancing. A 30% fall means nothing on its own: same decline, buy more in Case A and rebuild the valuation in Case B, distinguished only by whether triggers fired. A $10,000 gain on a $60,000 position costs $3,200 at short-term rates, so the new idea must be 5.33% better just to break even — but tax must never veto a broken thesis. Trailing stops belong to trading, not to compounders. Review quarterly against Section 6, annually with: would I buy this today, at this price, in this size?`,
        },
      ],
      quiz: [
        {
          id: 'u13-l08-q1',
          prompt: 'Which of these is a legitimate reason to sell a long-term holding?',
          choices: [
            'The position is up 20% and locking in the gain feels prudent',
            'A trigger from Section 6 of the written thesis has fired',
            'The stock has been flat for eight months',
            'The position is down 15% from the purchase price',
          ],
          answerIdx: 1,
          explain:
            'A fired trigger means a fact you identified in advance as falsifying has actually occurred, so the conclusion has to change with it. The other three are all facts about the price or your comfort, none of which would have persuaded you to avoid the stock before you owned it — which is the diagnostic that separates reasons from feelings.',
        },
        {
          id: 'u13-l08-q2',
          prompt:
            'Vantage falls 30% to $37.80 with no Section 6 trigger fired and your $62.64 central estimate intact. What has changed?',
          choices: [
            'The estimate of value must be lowered to match the market price',
            'The discount to value has widened from 13.8% to 39.7%, so buying more is the action your own thesis prescribes',
            'Nothing actionable — a 30% fall is within normal volatility and should be ignored entirely',
            'The thesis should be considered broken since the market disagrees so strongly',
          ],
          answerIdx: 1,
          explain:
            'When the facts underlying the estimate are unchanged, a lower price is a better price and the discount to value has grown substantially. Marking your valuation to the market defeats the entire purpose of having one, and a price move without a trigger is precisely the case the written thesis was designed to handle.',
        },
        {
          id: 'u13-l08-q3',
          prompt:
            'You hold a $60,000 position with a $10,000 short-term gain taxed at 32%. By how much must a new idea beat the old to break even on the switch?',
          choices: [
            '32.0%',
            '16.7%',
            '2.50%',
            '5.33%',
          ],
          answerIdx: 3,
          explain:
            'The tax bill is 10,000 x 0.32 = $3,200, which against the $60,000 position is a 5.33% hurdle before the new idea adds anything. At long-term rates the same switch costs $1,500 and the hurdle falls to 2.50% — which is why the holding-period date belongs in the arithmetic.',
        },
        {
          id: 'u13-l08-q4',
          prompt: 'Why is a 20% trailing stop a poor rule for a long-term holding in a volatile stock?',
          choices: [
            'Trailing stops are not supported by most brokers for long-term accounts',
            'Because trailing stops only work in downtrends',
            'A stock with 40% annualised volatility routinely draws down 20–25% from a running high inside an ongoing uptrend, so the rule removes you from working positions rather than broken ones',
            'Because the tax treatment of stopped-out positions is unfavourable',
          ],
          answerIdx: 2,
          explain:
            '40% annualised volatility is about 2.5% a day, and drawdowns of that size are ordinary noise for such a stock, so the stop fires on volatility rather than on any change in the business. For a multi-year holding the invalidation level is a fact about the company, not a percentage from a high.',
        },
        {
          id: 'u13-l08-q5',
          prompt: 'What makes the annual re-underwrite question so effective?',
          choices: [
            'It forces a trade at least once a year, preventing stagnation',
            'It replaces the valuation with the current market price',
            'It deletes the purchase price from the decision — the most contaminating number in your head and one the market has never heard of',
            'It guarantees that gains are realised at long-term tax rates',
          ],
          answerIdx: 2,
          explain:
            '"Would I buy this today, at this price, in this size, knowing what I now know?" is answerable without reference to what you paid, which is what breaks the anchoring and endowment effects that make selling so hard. It also does not require you to trade at all — the answer is often yes.',
        },
      ],
      cardSeeds: [
        {
          id: 'u13-l08-c1',
          kind: 'basic',
          front: 'What are the three legitimate reasons to sell, plus the mechanical fourth?',
          back: '1. The thesis broke — a Section 6 trigger fired. 2. The price now exceeds value — the reverse DCF implies growth you cannot defend. 3. A materially better use of the capital that clears the tax hurdle. Fourth, mechanically: trimming back to target weight when a position has grown past its band.',
        },
        {
          id: 'u13-l08-c2',
          kind: 'basic',
          front: 'The diagnostic that separates a real sell reason from a feeling.',
          back: 'Would this reason have convinced me before I owned it? "The company lost its two largest customers" survives. "It is down 15%", "it is up 20%", and "I am bored" do not.',
        },
        {
          id: 'u13-l08-c3',
          kind: 'cloze',
          front:
            'A $10,000 gain on a $60,000 position costs ____ at a 32% short-term rate — a hurdle of ____ for the replacement idea — versus ____ and ____ at the 15% long-term rate. But tax must never veto ____.',
          back: '$3,200; 5.33%; $1,500; 2.50%; a broken thesis (reason 1)',
        },
        {
          id: 'u13-l08-c4',
          kind: 'basic',
          front: 'The annual re-underwrite question.',
          back: '"Would I buy this today, at this price, in this size, knowing what I now know?" If no, that is a sell regardless of the purchase price. It works by deleting the purchase price from the decision.',
        },
      ],
    },

    // ── L09 ───────────────────────────────────────────────────────────────
    {
      id: 'u13-l09',
      unitId: 'u13',
      order: 9,
      title: 'Portfolio Construction',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A portfolio is not a list of your best ideas. It is a structure designed so that being wrong about any one of them cannot end the exercise. Unit 11 sized the individual position; this lesson assembles them.

**How many positions?** The answer comes from arithmetic rather than opinion. For n equally weighted positions each with volatility σ and average pairwise correlation ρ:

> **portfolio volatility = σ x sqrt( ρ + (1 − ρ) / n )**

The term (1 − ρ)/n is the **idiosyncratic** risk — the part that diversification removes. The term ρ is **systematic** risk — the market itself, which no number of stocks removes.`,
        },
        {
          kind: 'example',
          md: `**Where diversification stops paying.** Individual stock volatility σ = 35%, average pairwise correlation ρ = 0.35 (typical for US equities):

| Positions | Portfolio volatility | Gained vs previous row |
|---|---|---|
| 1 | 35.00% | — |
| 5 | 24.25% | 10.75 pts |
| 10 | 22.55% | 1.70 pts |
| 15 | 21.95% | 0.60 pts |
| 20 | 21.65% | 0.30 pts |
| 30 | 21.34% | 0.31 pts |
| 50 | 21.09% | 0.25 pts |
| ∞ | 20.71% | — |

Read the third column. Going from 1 to 10 positions removes **12.45 points** of volatility. Going from 10 to 20 removes **0.90**. Going from 20 to 50 removes **0.56**.

**The floor is 20.71%** and you cannot get below it by adding stocks, because that is the market risk every equity shares.

**What this means in practice.** Somewhere between **12 and 25** positions captures essentially all the available diversification benefit. Below about 8, a single blow-up meaningfully damages the portfolio. Above about 30, you have added research obligations you cannot meet — and a portfolio of 60 names you cannot follow is more dangerous than 15 you know intimately, because you will notice a broken thesis a year late.

**The important caveat:** this arithmetic assumes ρ = 0.35 *between your holdings*. Six early-cycle names (Lesson 5) might run ρ = 0.75 with each other, in which case ten of them diversify like three.`,
        },
        {
          kind: 'text',
          md: `**Sizing by conviction and uncertainty.** Two different things that are constantly conflated:

- **Conviction** — how likely you think you are to be right.
- **Uncertainty** — how wide the range of outcomes is if you are right about the direction.

A stable subscription business you have followed for three years can be high conviction *and* low uncertainty. A pre-revenue biotech can be high conviction and enormous uncertainty. They do not get the same size.

> **Position size = base weight x conviction multiplier ÷ uncertainty multiplier**

With a **5%** base weight, conviction of 0.5 / 1.0 / 1.5 and uncertainty of 0.75 / 1.0 / 1.5:

| Idea | Conviction | Uncertainty | Size |
|---|---|---|---|
| Vantage Diagnostics — 6 years of data, recurring revenue, tight valuation range | 1.5 | 0.75 | 5 x 1.5 / 0.75 = **10.0%** → capped at **8%** |
| A solid but ordinary industrial at a fair price | 1.0 | 1.0 | **5.0%** |
| A cyclical at what may be the trough | 1.0 | 1.5 | **3.3%** |
| A speculative turnaround | 0.5 | 1.5 | **1.7%** |

**Hard caps override the formula, always.** A common set: 8% at cost, 15% at market before trimming is compulsory, and 25% in any one sector. The formula is an opinion; the caps are the protection against your opinion. Every catastrophic personal portfolio loss in history was a position that a formula justified.`,
        },
        {
          kind: 'example',
          md: `**Core-satellite, cash, and rebalancing on a $60,000 portfolio.**

| Sleeve | Amount | Contents |
|---|---|---|
| Core | $48,000 (80%) | Two broad low-cost index funds |
| Satellite | $10,800 (18%) | Up to 6 researched positions, $1,800 each |
| Cash | $1,200 (2%) | Dry powder and friction |

**Cash is a position, and it is not free.** Suppose your equity expectation is 8.0% and cash yields 4.5%. Holding 20% cash gives 0.80 x 8.0% + 0.20 x 4.5% = **7.3%** expected return — a **0.7-point** annual drag. That is a real price, and it buys a real thing: the ability to act when prices fall without selling something else first. Hold cash deliberately, in a stated amount, for a stated reason. What fails is holding cash because you are nervous and then still being nervous when prices fall, which is how people pay the drag and never collect the option.

**Rebalancing with bands, not the calendar.** Set a band of ±25% *relative* to each target weight. For a 5% target: trim above **6.25%**, add below **3.75%**. Calendar rebalancing (every 31 December) trades when the calendar says so rather than when the portfolio has actually drifted; bands trade only when something has moved enough to matter, which means fewer transactions, lower tax, and — importantly — rebalancing *into* declines, when it is hardest and most valuable.

**One exception worth naming.** Trimming a winner back to target is mechanically correct and is also how you cut off the compounders that produce most of long-run returns (Lesson 8). The reconciliation: use bands on the **core**, where the holdings are index funds with no thesis to outrun, and let satellite winners run to the 15%-at-market cap before trimming.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Diversification means owning many stocks."**

Diversification means owning **uncorrelated exposures**. Twelve software companies is one bet with twelve tickers, and the arithmetic above will quietly mislead you because ρ inside that group is far above 0.35. Before adding a position, ask what would have to be true for it to fall 40% and then ask how many of your existing holdings would fall with it. If the answer is "most of them", the new position is not diversifying anything — it is levering a bet you already have.`,
        },
        {
          kind: 'callout',
          md: `**Concentration is a defensible choice with a stated price.** Running five positions rather than twenty raises expected return *if* you actually have an edge, because your capital is in your best ideas rather than diluted across your twentieth-best. It also raises the volatility from 21.65% to 24.25% and, far more importantly, raises the damage from a single mistake to a level that can end the exercise. The honest form of the argument is: concentrate only in proportion to the evidence that you can pick, and remember that a three-year track record is far too short to be that evidence (Unit 14, Lesson 5).`,
        },
        {
          kind: 'keypoint',
          md: `Portfolio volatility = σ x sqrt(ρ + (1−ρ)/n). At σ = 35% and ρ = 0.35: 1 stock 35.00%, 10 stocks 22.55%, 20 stocks 21.65%, 50 stocks 21.09%, floor 20.71% — so 12–25 positions capture nearly all the benefit and more only adds research you cannot do. Size by conviction ÷ uncertainty off a 5% base, with hard caps (8% at cost, 15% at market, 25% per sector) that override the formula. Cash is a position costing 0.7 points a year at 20% weight — hold it deliberately or not at all. Rebalance on ±25% relative bands, not the calendar. Diversification means uncorrelated exposures, not many tickers.`,
        },
      ],
      quiz: [
        {
          id: 'u13-l09-q1',
          prompt:
            'With σ = 35% and ρ = 0.35, portfolio volatility falls from 22.55% at 10 positions to 21.09% at 50. What does this show?',
          choices: [
            'Fifty positions is the optimal number for a retail portfolio',
            'Almost all diversification benefit is captured well before 20 positions — going from 20 to 50 buys only 0.56 points',
            'Diversification benefits increase without limit as positions are added',
            'Correlation is irrelevant once you hold more than 10 positions',
          ],
          answerIdx: 1,
          explain:
            'Going from 1 to 10 removes 12.45 points of volatility while 20 to 50 removes 0.56, because the idiosyncratic term (1−ρ)/n shrinks fast and the systematic term ρ never shrinks at all. The floor of 20.71% is market risk, which no number of stocks can diversify away.',
        },
        {
          id: 'u13-l09-q2',
          prompt: 'What is the difference between conviction and uncertainty in position sizing?',
          choices: [
            'They are two words for the same quantity',
            'Conviction applies to growth stocks and uncertainty to value stocks',
            'Conviction is measured by position size; uncertainty by volatility',
            'Conviction is how likely you are to be right; uncertainty is how wide the range of outcomes is even if you are right',
          ],
          answerIdx: 3,
          explain:
            'A pre-revenue biotech can be high conviction and enormously uncertain, while a subscription business you have followed for years can be high conviction and tightly bounded — and those two should not receive the same weight. Size scales up with conviction and down with uncertainty, which is why the formula divides by one and multiplies by the other.',
        },
        {
          id: 'u13-l09-q3',
          prompt: 'Why do hard position caps override the sizing formula?',
          choices: [
            'Because regulators require maximum position limits in retail accounts',
            'Because the formula is an opinion and the caps protect you from your opinion — every catastrophic portfolio loss was a position some formula justified',
            'Because caps improve expected return',
            'Because the formula only works for positions below 8%',
          ],
          answerIdx: 1,
          explain:
            'The formula\'s inputs are your own conviction and uncertainty estimates, both of which are exactly what fails when you are most wrong. Caps of 8% at cost, 15% at market and 25% per sector bound the damage from a confident error without needing to know in advance which error it will be.',
        },
        {
          id: 'u13-l09-q4',
          prompt:
            'Your expected equity return is 8.0% and cash yields 4.5%. What does holding 20% cash cost, and what does it buy?',
          choices: [
            'It costs 3.5 points a year and buys nothing measurable',
            'It costs nothing, since cash yields a positive return',
            'It costs 0.7 points a year (7.3% versus 8.0%) and buys the ability to act in a decline without selling something else first',
            'It costs 1.6 points a year and buys protection from inflation',
          ],
          answerIdx: 2,
          explain:
            '0.80 x 8.0% + 0.20 x 4.5% = 7.3%, so the drag is 0.7 points annually — a real price for a real option. The failure mode is paying the drag while being too nervous to spend the cash when prices actually fall, which collects the cost without collecting the benefit.',
        },
        {
          id: 'u13-l09-q5',
          prompt: 'Why is a portfolio of twelve software companies poorly diversified despite holding twelve names?',
          choices: [
            'Because software companies have higher individual volatility than average',
            'Because twelve positions is below the minimum of twenty',
            'Because software valuations are always too high',
            'Because the pairwise correlation inside that group is far above the 0.35 assumed in the arithmetic, so twelve tickers behave like a much smaller number of bets',
          ],
          answerIdx: 3,
          explain:
            'Diversification comes from uncorrelated exposures rather than from a count of tickers, and a sector cluster shares the same demand drivers, rate sensitivity, and sentiment. The practical test is to ask what would make one of them fall 40% and how many of the others would fall with it.',
        },
      ],
      cardSeeds: [
        {
          id: 'u13-l09-c1',
          kind: 'cloze',
          front:
            'Portfolio volatility = σ x sqrt( ____ + ____ ). The first term is ____ risk that diversification cannot remove; the second is ____ risk that it can.',
          back: 'ρ; (1 − ρ)/n; systematic (market); idiosyncratic',
        },
        {
          id: 'u13-l09-c2',
          kind: 'basic',
          front: 'How many positions, and why?',
          back: '12–25. At σ = 35% and ρ = 0.35, volatility falls 35.00% → 22.55% from 1 to 10 positions, but only 22.55% → 21.09% from 10 to 50 against a 20.71% floor. Below ~8 a single blow-up is damaging; above ~30 you cannot meet the research obligation and will notice a broken thesis a year late.',
        },
        {
          id: 'u13-l09-c3',
          kind: 'basic',
          front: 'State the sizing formula, the caps, and the rebalancing rule.',
          back: 'Size = base weight x conviction ÷ uncertainty (base 5%). Hard caps override it: 8% at cost, 15% at market before compulsory trimming, 25% per sector. Rebalance on ±25% relative bands — for a 5% target, trim above 6.25% and add below 3.75% — not on the calendar.',
        },
      ],
    },

    // ── L10 ───────────────────────────────────────────────────────────────
    {
      id: 'u13-l10',
      unitId: 'u13',
      order: 10,
      title: 'Your Personal Strategy Document',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Everything in this unit has been a component. This lesson assembles them into a single written document, because a strategy that exists only in your head is not a strategy — it is a set of preferences that will be quietly revised by whatever you are feeling on the day.

The document has one job: **to be written by calm-you and obeyed by panicking-you.** That is why it must be written now, before the position that tests it exists, and why the specific numbers matter more than the prose around them.

**Eight sections.**

| # | Section | The question it answers |
|---|---|---|
| 1 | **Objective and horizon** | What is this money for, and when do I need it? |
| 2 | **Universe** | What am I allowed to buy? |
| 3 | **Edge claim** | Why would I beat the alternative — and what evidence would disprove it? |
| 4 | **Entry criteria** | What must be true before I buy? |
| 5 | **Sizing rules** | How much, and what caps? |
| 6 | **Exit rules** | What makes me sell? |
| 7 | **Review cadence** | When do I look, and at what? |
| 8 | **Behavioural tripwires** | What are my known failure modes, and what stops them? |

Section 3 is the section most people cannot write honestly, and it is the reason the document works. If you cannot state an edge, that is not a failure — it is a finding, and it points at a larger core allocation.`,
        },
        {
          kind: 'example',
          md: `**A worked strategy document.** R. Chen, age 34, $60,000 invested outside retirement accounts.

> **1. Objective and horizon.** Long-term growth. No planned withdrawals for 15+ years. Emergency fund of six months of expenses is held separately in cash and is not part of this portfolio.
>
> **2. Universe.** Core: two broad low-cost index funds (total US market, total international). Satellite: US-listed operating companies above $500M market cap that pass the Unit 5 checklist with at least 8 of 10 and no red-flag veto. **Excluded outright**: options, shorting, leverage, crypto, anything I cannot value with a DCF, anything I first heard of within the last 48 hours.
>
> **3. Edge claim.** I have no informational or analytical edge. My claimed edge is structural: a 15-year horizon with no client redemptions, which lets me hold through drawdowns and own companies too small for institutions. **Disproof:** if the satellite trails the core by more than 3 percentage points annualised over three years, the edge claim is false and the satellite folds into the core.
>
> **4. Entry criteria.** All of: 17+ of 18 checklist items pass; zero vetoes; two valuation methods within 20% of each other; price at least 25% below my central estimate; reward-to-risk to the invalidation level of at least 3:1; a written one-page thesis with Section 6 triggers completed before the order is placed.
>
> **5. Sizing rules.** Core 80% ($48,000). Satellite 18% ($10,800), maximum 6 positions of ~$1,800 (3.0% of total). Cash 2%. Per-idea risk limit: 1% of total portfolio ($600) between entry and invalidation. Hard caps: 5% of total at cost, 8% at market before trimming, 25% in one sector. **No position is ever added to on the way down without a new written thesis.**
>
> **6. Exit rules.** Sell if a Section 6 trigger fires; if the reverse DCF at the current price implies growth above 12% annually for five years; or if the annual re-underwrite answers no to "would I buy this today, at this price, in this size?" Rebalance the core on ±25% relative bands. **Never sell because of a price move alone.**
>
> **7. Review cadence.** Quarterly: 15 minutes per holding, reading the report against Section 6 triggers only. Annually (first weekend of February): full re-underwrite of every satellite position, recompute satellite-versus-index performance, update this document with a dated revision note.
>
> **8. Behavioural tripwires.** (a) 48-hour rule — no order within 48 hours of first hearing about an idea. (b) If I place more than 6 satellite orders in a quarter, no new positions for 30 days. (c) I may not check prices more than once a day; during a drawdown of more than 15%, once a week. (d) Before any sale not triggered by Section 6, write the reason and wait 24 hours. (e) Known failure mode: I like technically impressive products regardless of unit economics — **so every thesis must state the gross margin and the ROIC before it states anything about the product.**

Notice how much of it is arithmetic rather than sentiment. "$600 per-idea risk", "3:1", "6 orders per quarter", "±25% bands" — a rule with a number can be checked; a rule that says "be disciplined" cannot.`,
        },
        {
          kind: 'text',
          md: `**Section 8 deserves a note.** Behavioural tripwires are not general good advice — they are **specific countermeasures to your own documented failures**, and you will not know what yours are until you have a record. Start with the generic ones (the 48-hour rule, an order-count limit, a price-checking limit), then replace them over time with the ones your post-mortems reveal (Unit 14, Lesson 11).

The structure that makes a tripwire work is that it is **mechanical and pre-committed**. "I will try not to overtrade" fails. "More than 6 orders in a quarter means no new positions for 30 days" works, because it does not require judgement at the moment judgement is compromised.

**Now paper-trade it.** A written strategy is a hypothesis about your own behaviour, and the only way to test it is to run it. Use the app's paper portfolio (Unit 8, Lesson 8) for at least two quarters, and treat it as real:

- Place every order through the process — checklist, thesis, sizing, all of it.
- Log every decision, including the ones where you chose not to buy. **The rejections are the most informative entries**, because they are the ones your future self will want to relitigate.
- Track the portfolio against the benchmark the app plots alongside it. Not to prove you are good — two quarters proves nothing about returns — but to find out whether you actually followed your own document.

That last point is the real measurement. The first-order question after two quarters is not "did I make money?" It is **"how many of my trades violated a rule I wrote down?"** If the answer is more than zero, the document needs tightening or the rule was unrealistic — and you have learned something far more durable than a quarter of performance.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "I know my strategy, writing it down is bureaucracy."**

An unwritten strategy has a property that makes it useless exactly when it matters: it can be revised silently. In a 30% drawdown, an unwritten "hold for the long term" becomes "cut risk and wait for clarity" without you ever noticing a rule changed, because there was no rule — there was an intention. Writing it down creates the friction of having to *edit* it, and that friction is the entire mechanism. Every version dated, every revision noted, so you can see later whether you were improving the strategy or negotiating with it.`,
        },
        {
          kind: 'callout',
          md: `**Revise the document on a schedule, never in a drawdown.** Rules should improve as you learn, and a strategy frozen forever is as bad as none. But changes made while a position is hurting are rationalisations wearing the clothes of policy. The discipline: amendments are made only at the annual review, in writing, with the reason stated — with one exception, which is that you may always make a rule **stricter** immediately.`,
        },
        {
          kind: 'keypoint',
          md: `Write eight sections: objective and horizon, universe, edge claim (with its disproof condition), entry criteria, sizing rules, exit rules, review cadence, behavioural tripwires. Every rule needs a number — "$600 per-idea risk", "3:1", "6 orders per quarter", "±25% bands" — because a rule with a number can be checked and "be disciplined" cannot. Tripwires must be mechanical and pre-committed, since they operate when judgement is already compromised. Then paper-trade the document for at least two quarters and measure the thing that actually matters: how many trades violated a rule you wrote down. Amend only at the annual review, never in a drawdown — except to make a rule stricter.`,
        },
      ],
      quiz: [
        {
          id: 'u13-l10-q1',
          prompt: 'What is the primary function of a written strategy document?',
          choices: [
            'To satisfy record-keeping requirements for tax purposes',
            'To communicate your approach to other investors',
            'To be written by calm-you and obeyed by panicking-you, by making silent revision impossible',
            'To improve returns by formalising a proven edge',
          ],
          answerIdx: 2,
          explain:
            'An unwritten strategy can be revised in a drawdown without you noticing a rule changed, because there was never a rule — only an intention. Writing it down creates the friction of having to edit it, and that friction is the whole mechanism.',
        },
        {
          id: 'u13-l10-q2',
          prompt: 'Why does the edge claim section include a disproof condition?',
          choices: [
            'To satisfy the regulatory requirement for a stated investment objective',
            'To make the strategy fashionable to other investors',
            'Because an edge claim that cannot be disproven is a belief rather than a hypothesis, so the document commits in advance to what would falsify it and what happens then',
            'Because the disproof condition determines the tax treatment of the satellite',
          ],
          answerIdx: 2,
          explain:
            'R. Chen\'s document states that if the satellite trails the core by more than 3 points annualised over three years, the edge claim is false and the satellite folds in — a decision made while calm rather than after three bad years. Without that clause, underperformance simply gets reinterpreted each year as bad luck.',
        },
        {
          id: 'u13-l10-q3',
          prompt: 'What makes a behavioural tripwire actually work?',
          choices: [
            'It is reviewed with a financial adviser each quarter',
            'It expresses a strong intention to behave better',
            'It is set at a level that is never actually reached',
            'It is mechanical and pre-committed, so it needs no judgement at the moment judgement is compromised',
          ],
          answerIdx: 3,
          explain:
            '"More than 6 orders in a quarter means no new positions for 30 days" fires on a countable fact, while "I will try not to overtrade" requires exactly the self-assessment that fails under stress. A tripwire that needs you to be clear-headed to trigger it is not a tripwire.',
        },
        {
          id: 'u13-l10-q4',
          prompt: 'After two quarters of paper-trading your strategy, what is the most informative question to ask?',
          choices: [
            'How many of my trades violated a rule I wrote down?',
            'Did the portfolio beat the benchmark?',
            'Which position produced the largest gain?',
            'Was my average holding period long enough?',
          ],
          answerIdx: 0,
          explain:
            'Two quarters is far too short to say anything about returns, but it is more than enough to reveal whether you can actually follow your own document. A non-zero violation count means either the rules need tightening or one of them was unrealistic — and either finding is more durable than a quarter of performance.',
        },
      ],
      cardSeeds: [
        {
          id: 'u13-l10-c1',
          kind: 'cloze',
          front:
            'The eight sections of a strategy document: ____ and horizon, ____, ____ claim, ____ criteria, ____ rules, ____ rules, review ____, and behavioural ____.',
          back: 'objective; universe; edge; entry; sizing; exit; cadence; tripwires',
        },
        {
          id: 'u13-l10-c2',
          kind: 'basic',
          front: 'Why must every rule in a strategy document contain a number?',
          back: 'A rule with a number can be checked — "$600 per-idea risk", "3:1 reward-to-risk", "6 orders per quarter", "±25% relative bands". A rule that says "be disciplined" or "do not overtrade" cannot be violated in any detectable way, so it never binds.',
        },
        {
          id: 'u13-l10-c3',
          kind: 'basic',
          front: 'When may a strategy document be amended?',
          back: 'Only at the scheduled annual review, in writing, with the reason and date recorded — never during a drawdown, where changes are rationalisations wearing the clothes of policy. The one exception: you may always make a rule stricter immediately.',
        },
        {
          id: 'u13-l10-c4',
          kind: 'basic',
          front: 'What is the point of paper-trading a written strategy for two quarters?',
          back: 'To test the hypothesis about your own behaviour, not about returns. Place every order through the full process, log the rejections too (they are the most informative), and measure how many trades violated a written rule. Two quarters proves nothing about performance and everything about compliance.',
        },
      ],
    },
  ],
}
