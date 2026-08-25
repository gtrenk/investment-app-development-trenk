import type { Unit } from '@core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Unit 10 — Indicators
// Every indicator here is a transformation of the price and volume series read
// in Units 8 and 9 — no indicator adds information, and saying so plainly is
// the point of the unit. Formulas are given where they exist (EMA smoothing,
// RSI, MACD, Bollinger bandwidth, true range, OBV), each with a numeric worked
// example, the standard interpretation, and the specific place that
// interpretation breaks. Ends on redundancy, curve-fitting, and a deliberately
// small toolkit; ATR bridges to the risk-management unit that follows.
// ─────────────────────────────────────────────────────────────────────────────

export const u10: Unit = {
  id: 'u10',
  title: 'Indicators',
  order: 10,
  description:
    'Moving averages, crossovers, RSI, divergence, MACD, Bollinger Bands, ATR and volume measures — what each one actually computes, the arithmetic behind it, where its textbook reading breaks down, and why four indicators measuring four different things beat twelve measuring one.',
  unlockAfter: 'u09',
  lessons: [
    // ── L01 ───────────────────────────────────────────────────────────────
    {
      id: 'u10-l01',
      unitId: 'u10',
      order: 1,
      title: 'What Indicators Are',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `An **indicator** is a function of the price and volume history. That is the entire definition, and almost every mistake people make with indicators comes from forgetting it.

> **An indicator contains no information that was not already in the chart.** It is a transformation — a re-presentation of closes, highs, lows and volumes you can already see.

So what are they *for*? Three honest uses:

- **Compression.** A 200-day moving average summarises 200 numbers as one. Your eye cannot average 200 closes; the arithmetic can.
- **Consistency.** "The stock looks overextended" varies by mood and by day. "RSI is 78" is the same number for everyone, which makes a rule testable and a decision reviewable.
- **Normalisation.** ATR expresses volatility in a stock's own units, so a $12 stock and a $600 stock can be compared and sized on the same scale.

None of those is prediction. An indicator is a measuring instrument pointed at the past.`,
        },
        {
          kind: 'text',
          md: `**Leading and lagging — a distinction that is mostly marketing.**

Every indicator computed from past prices is, strictly, lagging. What the industry calls **leading** indicators are *oscillators* — RSI, stochastics, rate-of-change — which respond to short windows and therefore move sooner. What they buy in speed they pay for in false signals. What the industry calls **lagging** indicators — moving averages, MACD — smooth over long windows and confirm late, but confirm more reliably.

There is no third option. The trade-off is **lag versus noise**, it is imposed by arithmetic rather than by design, and every parameter choice you make is a position on that single dial. A shorter lookback is always faster and always noisier. Anyone offering a setting that is both is selling a backtest.`,
        },
        {
          kind: 'example',
          md: `**Watching an average lag, exactly.** A stock sits at **$50.00** for twenty sessions, then jumps to **$60.00** and stays there. Follow the **10-day simple moving average**:

| Sessions since the jump | Closes in the window | 10-day SMA |
|---|---|---|
| 1 | one at $60, nine at $50 | **$51.00** |
| 3 | three at $60, seven at $50 | **$53.00** |
| 5 | five at $60, five at $50 | **$55.00** |
| 8 | eight at $60, two at $50 | **$58.00** |
| 10 | ten at $60 | **$60.00** |

Price repriced instantly and completely. The average needed **ten full sessions** to agree, and at the halfway point it was reporting **$55.00** — a price that had not traded in two weeks and would not trade again.

This is not a flaw to be tuned away. It is what averaging *is*. A 10-day average of a step change reaches the halfway point in five days by arithmetic necessity, and a 200-day average of the same step takes 100 days to get halfway. Shorten the window and you get there faster while reacting to every one-day wobble along the way.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Indicators tell you what price is going to do."

They tell you what price has already done, arithmetically compressed. When an indicator appears to anticipate a move, one of two things is happening: the pattern was visible in the raw price too (the indicator just made it easier to see), or you are looking at a chart where you already know the ending. The useful mental model is a car's speedometer — it tells you your current speed accurately and says nothing whatever about the corner ahead.`,
        },
        {
          kind: 'callout',
          md: `**The overfitting trap — with the arithmetic.** Suppose you test an RSI rule with three parameters: the lookback (5–30), the entry threshold (10–40), and the exit threshold (60–90). Sample each range at twenty settings and that is **20 × 20 × 20 = 8,000 combinations**. Run all 8,000 on ten years of data and the best one will look excellent — *even if the price data is pure noise*, because you selected the maximum of 8,000 random draws.

Three defences, all boring and all necessary: prefer **default parameters** (14-period RSI, 20/50/200-day averages) precisely because you did not choose them; test on data you did not tune on; and be immediately suspicious when a rule works at a lookback of 11 but not at 10 or 12. Genuine effects are robust to small parameter changes. Fitted ones are not.`,
        },
        {
          kind: 'keypoint',
          md: `An indicator is a transformation of price and volume — it adds no information, it compresses, standardises and normalises what is already there. Every one is lagging; "leading" oscillators simply trade lag for noise, and that trade-off is arithmetic, not design. A 10-day average of a step change takes ten sessions to catch up. Prefer default parameters, because you did not fit them.`,
        },
      ],
      quiz: [
        {
          id: 'u10-l01-q1',
          prompt: 'What is the most accurate description of what an indicator is?',
          choices: [
            'A forecasting model calibrated on historical outcomes',
            'A transformation of price and volume history that adds no new information',
            'An independent data source that supplements the chart',
            'A measure of a company’s underlying fundamentals',
          ],
          answerIdx: 1,
          explain:
            'Every indicator in this unit is computed from closes, highs, lows and volumes you can already see, so it re-presents information rather than adding any — its value is compression, consistency and normalisation. Treating it as an independent source is what leads people to count a moving average and its own price series as two confirmations of the same thing.',
        },
        {
          id: 'u10-l01-q2',
          prompt:
            'A stock sits at $50 for twenty sessions, then jumps to $60 and stays. What does its 10-day SMA read five sessions after the jump?',
          choices: [
            '$60.00 — the average catches up immediately to a sustained move',
            '$50.00, until all ten sessions have repriced',
            '$57.50, weighted toward the more recent closes',
            '$55.00 — five closes at $60 and five at $50',
          ],
          answerIdx: 3,
          explain:
            'A simple average weights every close in the window equally, so five at $60 and five at $50 give exactly $55.00 — a price that had not traded in two weeks and never would again. The weighting toward recent closes describes an exponential average, not a simple one, and the full catch-up takes all ten sessions.',
        },
        {
          id: 'u10-l01-q3',
          prompt: 'What does the leading-versus-lagging distinction actually amount to?',
          choices: [
            'A trade-off between lag and noise — shorter windows respond sooner and produce more false signals',
            'Some indicators are computed from future prices, others from past prices',
            'Leading indicators are proprietary; lagging ones are public',
            'Leading indicators work in trends, lagging ones in ranges',
          ],
          answerIdx: 0,
          explain:
            'Everything computed from past prices lags; so-called leading oscillators just use short windows, buying speed with false signals, and there is no setting that is both fast and quiet. Nothing is computed from future prices, and if anything the association runs the other way — smoothed, lagging measures are the ones that survive trending markets.',
        },
        {
          id: 'u10-l01-q4',
          prompt:
            'You test 8,000 combinations of RSI lookback and thresholds and the best one returns 24% a year. What is the main problem?',
          choices: [
            'The lookback was probably too long',
            'RSI should not be tested on daily data',
            'You selected the maximum of 8,000 draws — the best of that many variants looks excellent even on pure noise',
            'Nothing, provided the result is statistically significant at the 5% level',
          ],
          answerIdx: 2,
          explain:
            'Searching thousands of variants and reporting the winner is selection, not evidence: the top result of 8,000 random draws is impressive by construction. A conventional significance test makes this worse rather than better, because it takes no account of the 7,999 variants you discarded — which is why default parameters and untouched test data matter.',
        },
        {
          id: 'u10-l01-q5',
          prompt:
            'A rule works well with an RSI lookback of 11 but poorly at 10 and 12. What should you conclude?',
          choices: [
            'The 11-day period captures a genuine market cycle',
            'It is almost certainly fitted — real effects are robust to small parameter changes',
            'You should test 10.5 to refine it further',
            'The data for the 10- and 12-day tests must be faulty',
          ],
          answerIdx: 1,
          explain:
            'Genuine effects degrade gracefully as parameters shift; a result that lives or dies on one setting is a description of the specific noise in your sample. Refining further searches more combinations and deepens the problem, and there is no market mechanism that would single out an 11-day window while ignoring 10 and 12.',
        },
      ],
      cardSeeds: [
        {
          id: 'u10-l01-c1',
          kind: 'cloze',
          front:
            'An indicator is a ____ of price and volume history. It contains ____ information that was not already in the chart.',
          back: 'transformation (function); no',
        },
        {
          id: 'u10-l01-c2',
          kind: 'basic',
          front: 'What are the three honest uses of an indicator?',
          back: 'Compression (200 closes into one number), consistency (a number everyone agrees on, so rules are testable), and normalisation (expressing volatility in a stock’s own units so different stocks compare).',
        },
        {
          id: 'u10-l01-c3',
          kind: 'basic',
          front: 'What is the leading/lagging distinction really about?',
          back: 'Lag versus noise. Everything computed from past prices lags; short-window oscillators respond sooner and produce more false signals. It is an arithmetic trade-off, and no setting escapes it.',
        },
        {
          id: 'u10-l01-c4',
          kind: 'basic',
          front: 'Three defences against overfitting an indicator',
          back: 'Use default parameters precisely because you did not choose them; test on data you did not tune on; and distrust any rule that works at a lookback of 11 but not at 10 or 12 — real effects are robust to small parameter changes.',
        },
      ],
    },

    // ── L02 ───────────────────────────────────────────────────────────────
    {
      id: 'u10-l02',
      unitId: 'u10',
      order: 2,
      title: 'Moving Averages',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A **simple moving average (SMA)** of period *N* is the arithmetic mean of the last *N* closes, recomputed every session. Every close in the window counts equally, and the close that drops out counts as much as the one that enters — which is why an SMA can move purely because of what happened *N* days ago.

An **exponential moving average (EMA)** fixes that by weighting recent closes more heavily, with a weight that decays smoothly rather than falling off a cliff:

> **k = 2 ÷ (N + 1)**
> **EMA today = (close × k) + (EMA yesterday × (1 − k))**

For a 20-period EMA, k = 2 ÷ 21 ≈ **0.0952**, so each new close contributes about **9.5%** of the new value and the accumulated history supplies the rest. Nothing ever fully leaves an EMA; it just fades.

**Which to use?** SMA for levels other people are watching (the 200-day SMA is the one quoted in every market report, and that shared attention is part of why it behaves as a level). EMA when you want faster response and fewer artefacts from old data dropping out. The difference is far smaller than the volume of argument about it suggests.`,
        },
        {
          kind: 'example',
          md: `**SMA and EMA on the same numbers.** Closes for five sessions: **$10, $11, $12, $13, $14**.

- **5-day SMA** = (10 + 11 + 12 + 13 + 14) ÷ 5 = **$12.00**.
- Take the same $12.00 as the starting **5-day EMA**, and let k = 2 ÷ 6 = **0.3333**.

Now the sixth close arrives at **$20.00** — a jump.

- **New SMA** = (11 + 12 + 13 + 14 + 20) ÷ 5 = 70 ÷ 5 = **$14.00**. Note that the $10 dropping out contributed as much to that move as the $20 arriving.
- **New EMA** = 12.00 + 0.3333 × (20.00 − 12.00) = 12.00 + 2.67 = **$14.67**.

The EMA sits **$0.67** higher because it gives the new information more weight. Over one bar that is a rounding difference; over a fast trend reversal it is a few days of earlier response, and over a choppy range it is a few extra whipsaws. That is the whole SMA-versus-EMA debate, quantified.`,
        },
        {
          kind: 'text',
          md: `**The conventional periods, and why they are conventional.**

| Period | Roughly | Typical use |
|---|---|---|
| **20-day** | one trading month | Short-term trend; the middle Bollinger band |
| **50-day** | one quarter | The standard swing-trend reference; institutional shorthand |
| **200-day** | about 40 weeks, ten months | The long-horizon regime line |

There is nothing special about these numbers. They are round, they map loosely onto calendar intuitions, and — most importantly — **everybody uses them**, which makes them mildly self-fulfilling. That is a real reason to prefer them over a lookback you optimised yourself: you are not trying to out-clever the average, you are trying to see the same line the rest of the market is looking at.

**Dynamic support and resistance.** In a persistent uptrend, pullbacks often stall near a rising average — the 20-day in a fast trend, the 50-day in a slower one. The mechanism is the same as any level: the average is a visible reference, so buy orders cluster near it. Treat it as a **zone with a width of a percent or two**, exactly like a horizontal level, and expect it to fail regularly.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "The 200-day moving average is a magic level — above it is bullish, below it is bearish."

It is a ten-month arithmetic mean, nothing more, and price crosses it repeatedly in any range-bound market. The evidence for it as a *filter* is genuinely mixed but not empty: rules like "hold only when price is above the 200-day" have historically reduced drawdowns in broad indices — while also reducing total returns and generating a steady stream of whipsaw trades in sideways years. That is a risk-preference trade-off, not an edge, and it applies much more weakly to individual stocks than to indices.`,
        },
        {
          kind: 'callout',
          md: `**The artefact you should know about.** An SMA can move for reasons that have nothing to do with today. If the close that just dropped out of a 50-day window was an $80 spike and today's close is an ordinary $52, the average will fall — and someone will explain the "breakdown below the 50-day" as though something happened today. Nothing did. EMAs do not have this problem, and it is the one genuinely good technical argument for preferring them.`,
        },
        {
          kind: 'keypoint',
          md: `SMA = equal-weighted mean of the last N closes; EMA weights recent closes more, with **k = 2 ÷ (N + 1)** and **EMA = close × k + prior EMA × (1 − k)**. Common periods 20/50/200 are conventional rather than optimal, and their shared use is part of what makes them behave as levels. Treat a moving average as a zone, not a line — and remember an SMA can move because of what dropped out of the window.`,
        },
      ],
      quiz: [
        {
          id: 'u10-l02-q1',
          prompt: 'What is the smoothing factor k for a 20-period EMA, and what does it mean?',
          choices: [
            'k = 2 ÷ 21 ≈ 0.095 — each new close contributes about 9.5% of the updated value',
            'k = 1 ÷ 20 = 0.05 — each close contributes exactly one-twentieth',
            'k = 20 ÷ 2 = 10 — the average is scaled by ten',
            'k = 0.5 — an EMA always splits the difference between price and the prior average',
          ],
          answerIdx: 0,
          explain:
            'The standard smoothing constant is k = 2 ÷ (N + 1), so a 20-period EMA uses 2 ÷ 21 ≈ 0.0952 and each new close supplies roughly 9.5% of the new value while accumulated history supplies the rest. The 1 ÷ N form is the equal weight of a simple average, and a fixed 0.5 would make the EMA react to a two-bar window regardless of its stated period.',
        },
        {
          id: 'u10-l02-q2',
          prompt:
            'Closes are $10, $11, $12, $13, $14, and the next close is $20. What does the 5-day SMA become?',
          choices: [
            '$12.00, unchanged until the whole window turns over',
            '$14.67, since recent closes count more',
            '$14.00 — (11 + 12 + 13 + 14 + 20) ÷ 5',
            '$13.00, the midpoint of the old and new averages',
          ],
          answerIdx: 2,
          explain:
            'The $10 drops out and the $20 enters, giving 70 ÷ 5 = $14.00 — and note the departing $10 contributed as much to that $2.00 move as the arriving $20 did. The $14.67 figure is the corresponding 5-day EMA, which weights the new close more heavily; a simple average has no such weighting.',
        },
        {
          id: 'u10-l02-q3',
          prompt: 'Why prefer conventional 20/50/200-day periods over a lookback you optimised yourself?',
          choices: [
            'Optimised lookbacks are computationally expensive',
            'Round numbers are mathematically more stable',
            'Longer averages are always better than shorter ones',
            'Everyone watches the conventional ones, which makes them mildly self-fulfilling — and you did not fit them to your own sample',
          ],
          answerIdx: 3,
          explain:
            'Shared attention gives conventional periods a little genuine reality as reference levels, and using a period you did not choose removes one whole avenue of overfitting. The periods are not special mathematically, longer is not uniformly better, and computation cost has nothing to do with it.',
        },
        {
          id: 'u10-l02-q4',
          prompt:
            'A 50-day SMA falls sharply on a day when price closed normally at $52. What is the most likely explanation?',
          choices: [
            'A data error in the price feed',
            'An $80 spike dropped out of the back of the 50-day window',
            'Institutional selling that has not yet appeared in price',
            'The EMA and SMA have diverged',
          ],
          answerIdx: 1,
          explain:
            'A simple average changes when a close leaves the window as well as when one enters, so a large old value dropping out moves the line with nothing happening today — an artefact frequently narrated as a "breakdown". EMAs avoid it because nothing ever fully leaves them, which is the best technical argument for preferring them.',
        },
        {
          id: 'u10-l02-q5',
          prompt: 'What does the evidence actually support about "hold only while price is above the 200-day"?',
          choices: [
            'It has historically reduced drawdowns in broad indices while also reducing total returns and producing whipsaws in sideways markets',
            'It reliably increases returns in individual stocks',
            'It has no measurable effect of any kind',
            'It identifies bear markets before they begin',
          ],
          answerIdx: 0,
          explain:
            'The honest summary is a risk-preference trade-off rather than an edge: smaller drawdowns, lower total returns, and a steady stream of false signals in range-bound years — and the effect is much weaker on individual stocks than on indices. Nothing about a ten-month arithmetic mean can identify anything before it begins.',
        },
      ],
      cardSeeds: [
        {
          id: 'u10-l02-c1',
          kind: 'cloze',
          front: 'EMA smoothing factor: k = ____ ÷ (____ + 1); EMA today = close × k + EMA yesterday × (1 − ____).',
          back: '2; N; k',
        },
        {
          id: 'u10-l02-c2',
          kind: 'basic',
          front: 'SMA vs EMA in one line each',
          back: 'SMA: equal-weighted mean of the last N closes — so it also moves when an old close drops out of the window. EMA: recent closes weighted more, decaying smoothly, nothing ever fully leaves.',
        },
        {
          id: 'u10-l02-c3',
          kind: 'basic',
          front: 'What do the 20/50/200-day periods correspond to, and why use them?',
          back: 'Roughly a trading month, a quarter and about ten months. They are conventional rather than optimal — but everyone watches them, which makes them mildly self-fulfilling, and you did not fit them to your own data.',
        },
        {
          id: 'u10-l02-c4',
          kind: 'basic',
          front: 'How should a moving average be treated as support?',
          back: 'As a zone a percent or two wide, like any level — buy orders cluster near a visible reference. Expect it to fail regularly; it is a ten-month or ten-week mean, not a floor.',
        },
      ],
    },

    // ── L03 ───────────────────────────────────────────────────────────────
    {
      id: 'u10-l03',
      unitId: 'u10',
      order: 3,
      title: 'MA Crossovers',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `A **crossover** is one moving average crossing another. The famous pair:

- **Golden cross** — the 50-day rising through the 200-day.
- **Death cross** — the 50-day falling through the 200-day.

Strip away the names and the arithmetic is unglamorous. The 50-day exceeds the 200-day when *the average close of the last quarter exceeds the average close of the last ten months*. That condition cannot be met until a large move has already happened, because both terms are averages of history. A crossover is not a forecast; it is a **restatement, in arrears, of a trend that is already well established**.

That is not useless. It is a clean, unambiguous, non-discretionary description of regime — which is exactly what a filter should be, and exactly what an entry signal should not be.`,
        },
        {
          kind: 'example',
          md: `**How late is late?** A stock bottoms at **$60.00** in March. It recovers through spring, and the golden cross — 50-day crossing above the 200-day — finally prints in **July**, with price at **$84.00**.

The signal arrives **40% above the low**. Nothing went wrong; that is the mechanism. For the quarter's mean to exceed the ten-month mean, the ten-month mean must still be weighed down by the old low prices, which takes months to work through.

Now the range case. The same stock spends the following four months oscillating between **$47** and **$53** (a different, quieter phase). A faster 10/30-day crossover system fires **seven** signals in those four months:

- Six losers averaging **−1.8%** each: **−10.8%**
- One winner at **+2.1%**
- Net: **−8.7%**, before commissions and spreads

Price ended the four months roughly where it started. The system lost nearly 9% of the position's value doing it. This is the defining cost of crossovers, and it is not avoidable by tuning — a faster pair whipsaws more, a slower pair signals later.`,
        },
        {
          kind: 'text',
          md: `**The right way to use them: as a filter, not a trigger.**

- **As a filter:** "I will only take long setups while the 50-day is above the 200-day." The crossover never decides *when* you act — the pattern, the level and the volume from Units 8 and 9 do that. It decides only which direction of setup you are willing to consider.
- **As a trigger:** "Buy the golden cross." You enter after the move, with no defined invalidation level (what would it be — the cross reversing, weeks later and possibly 15% lower?), and you take every whipsaw the range has to offer.

The filter use also composes cleanly with everything else: a bull flag in a stock whose 50-day sits above a rising 200-day is a setup working with the regime; the identical flag under a falling 200-day is a counter-trend bet that needs more evidence.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "The golden cross is a buy signal."

Beyond the lateness, there is a statistical problem people rarely mention: **the sample is tiny**. On a broad index the 50/200 pair crosses on the order of a couple of dozen times in ninety years. Any claim about what "usually happens after a golden cross" is therefore based on a few dozen overlapping, non-independent observations spanning wildly different market regimes — which is not enough to distinguish a real effect from chance. When you see a headline reporting the average index return after golden crosses, ask how many observations are in the average. The answer is usually somewhere between 25 and 35.`,
        },
        {
          kind: 'callout',
          md: `**Crossovers in a range are worse than useless.** In the four-month example the system did not merely fail to profit — it converted a flat market into an 8.7% loss through friction alone, before costs. Any rule that generates a signal every time two smoothed lines touch will do this, and the only real defence is a regime check: **do not run a crossover system in a market whose 200-day line is flat.** A flat long average is the definition of the environment these systems are built to lose in.`,
        },
        {
          kind: 'keypoint',
          md: `A golden cross means the last quarter's average close exceeds the last ten months' — a restatement of an established trend, typically arriving far above the low (40% in the worked example). Crossovers whipsaw badly in ranges, and their headline statistics rest on only a couple of dozen index observations. Use them as a directional **filter** on setups, never as an entry trigger.`,
        },
      ],
      quiz: [
        {
          id: 'u10-l03-q1',
          prompt: 'Why does a golden cross necessarily arrive well after the low?',
          choices: [
            'Because the 200-day average is calculated with a reporting delay',
            'Because exchanges publish crossover data on a lag',
            'Because it requires the quarter’s average close to exceed the ten-month average, which cannot happen until a large move is already complete',
            'Because most traders wait for confirmation before acting on it',
          ],
          answerIdx: 2,
          explain:
            'Both lines are averages of history, so the shorter one can only overtake the longer one after enough high closes have accumulated — in the worked example that put the signal at $84 against a $60 low, 40% up. There is no reporting delay involved; the lateness is arithmetic and cannot be tuned away.',
        },
        {
          id: 'u10-l03-q2',
          prompt:
            'A 10/30 crossover system fires seven signals in a four-month $47–$53 range: six losses averaging −1.8% and one gain of +2.1%. What is the net, and what does it illustrate?',
          choices: [
            'About +2.1%, since the winner offsets the losers',
            'About −8.7%, illustrating whipsaw — a flat market converted into a real loss by friction',
            'About −1.8%, the average loss',
            'Roughly zero, since the market ended where it started',
          ],
          answerIdx: 1,
          explain:
            'Six losses of 1.8% total −10.8%, and adding the single +2.1% winner gives −8.7% before commissions and spreads, even though price finished where it began. That gap between the market’s outcome and the system’s outcome is the defining cost of crossovers, and tuning does not remove it — faster pairs whipsaw more, slower pairs signal later.',
        },
        {
          id: 'u10-l03-q3',
          prompt: 'What is the defensible use of a 50/200 crossover?',
          choices: [
            'As an entry trigger, since it is unambiguous',
            'As an exit signal for every position regardless of setup',
            'As a directional filter deciding which setups you are willing to consider — never as the trigger itself',
            'As a target-setting tool for measured moves',
          ],
          answerIdx: 2,
          explain:
            'A crossover is a clean, non-discretionary statement about regime, which is exactly what a filter needs to be — it decides which direction of setup you will look at, while the pattern, level and volume decide when. Used as a trigger it enters after the move with no meaningful invalidation level, and it has nothing to say about targets.',
        },
        {
          id: 'u10-l03-q4',
          prompt:
            'Why should you distrust headline statistics about index returns following golden crosses?',
          choices: [
            'Index data before 1980 is unavailable',
            'Golden crosses are defined differently by every data vendor',
            'Index averages exclude dividends, which invalidates the comparison',
            'The sample is tiny — on the order of a couple of dozen overlapping observations across ninety years and very different regimes',
          ],
          answerIdx: 3,
          explain:
            'Twenty-five to thirty-five non-independent observations spanning radically different market regimes cannot distinguish a real effect from chance, whatever the average return looks like. The 50/200 definition is standard, long index histories are readily available, and dividend treatment does not begin to explain the problem.',
        },
        {
          id: 'u10-l03-q5',
          prompt: 'What single regime check most reduces crossover whipsaw?',
          choices: [
            'Do not run a crossover system when the long average is flat',
            'Switch to EMAs instead of SMAs',
            'Use a faster pair so signals arrive sooner',
            'Require the crossover to occur on above-average volume',
          ],
          answerIdx: 0,
          explain:
            'A flat 200-day line is precisely the environment these systems are built to lose in, so declining to trade the signal there removes most of the damage at a stroke. Switching averages or speeding the pair changes the texture of the whipsaw rather than the cause, and volume filters on a smoothed-line crossing add little because the crossing itself is a lagged arithmetic event.',
        },
      ],
      cardSeeds: [
        {
          id: 'u10-l03-c1',
          kind: 'cloze',
          front:
            'A golden cross is the ____-day average rising through the ____-day; it means the last quarter’s average close now exceeds the last ____ months’.',
          back: '50; 200; ten',
        },
        {
          id: 'u10-l03-c2',
          kind: 'basic',
          front: 'Why is a crossover a filter rather than a trigger?',
          back: 'It restates an already-established trend, arriving long after the low and with no meaningful invalidation level. Let it decide which direction of setup you consider; let pattern, level and volume decide when you act.',
        },
        {
          id: 'u10-l03-c3',
          kind: 'basic',
          front: 'Two reasons to distrust golden-cross statistics',
          back: 'Whipsaw: in ranges the signals convert flat markets into real losses through friction. Sample size: a broad index produces only a couple of dozen crossovers in ninety years, far too few to separate effect from chance.',
        },
      ],
    },

    // ── L04 ───────────────────────────────────────────────────────────────
    {
      id: 'u10-l04',
      unitId: 'u10',
      order: 4,
      title: 'RSI',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `The **Relative Strength Index**, published by J. Welles Wilder in 1978, compares the size of recent gains with the size of recent losses and squeezes the answer into a 0–100 range.

> **RS = average gain ÷ average loss** (over the lookback, default 14 periods)
> **RSI = 100 − (100 ÷ (1 + RS))**

The second line is just a squashing function. All the meaning is in **RS**: how big have up-days been relative to down-days lately?

Read the extremes to build intuition:

- All 14 periods up → average loss is 0 → RS is infinite → **RSI = 100**.
- All 14 periods down → average gain is 0 → RS = 0 → **RSI = 0**.
- Gains and losses equally sized → RS = 1 → **RSI = 50**.

So RSI is a **momentum** measure, not a valuation measure. It says nothing about whether a stock is expensive. A $4 stock going bankrupt and a $400 compounder can both print an RSI of 78.`,
        },
        {
          kind: 'example',
          md: `**Turning gains and losses into a number.**

*Case 1 — strong advance.* Over 14 sessions the average gain on up-days is **$1.20** and the average loss on down-days is **$0.60**.

- RS = 1.20 ÷ 0.60 = **2.0**
- RSI = 100 − (100 ÷ 3.0) = 100 − 33.3 = **66.7**

*Case 2 — steady decline.* Average gain **$0.30**, average loss **$0.90**.

- RS = 0.30 ÷ 0.90 = **0.3333**
- RSI = 100 − (100 ÷ 1.3333) = 100 − 75.0 = **25.0**

Notice what happened in case 1: up-moves being twice the size of down-moves produced 66.7 — *not* an extreme reading. To reach 70 you need up-days meaningfully larger than down-days over a fortnight; to reach 80 you need something close to a one-way advance. The 70 and 30 thresholds are Wilder's defaults, and they describe **rarity of the momentum condition**, not a price judgement.`,
        },
        {
          kind: 'text',
          md: `**Overbought stays overbought.** This is the single most important empirical fact about RSI, and it is the opposite of how the indicator is usually taught.

A stock in a powerful trend can hold RSI above 70 for **weeks**. Consider a stock that rallies from **$140** to **$186** — a 33% advance — over **23 consecutive sessions with RSI above 70**. Anyone who sold the first 70 print exited at roughly $147 and watched the rest. High RSI in a strong trend is a description of *strength*, and strength persists.

**Range shifts.** The genuinely useful refinement, and it is well documented:

| Regime | RSI tends to oscillate | What acts as the pivot |
|---|---|---|
| Uptrend | roughly **40–80** | the **40** area holds on pullbacks |
| Downtrend | roughly **20–60** | the **60** area caps rallies |

So an RSI of 42 means very different things in the two regimes: in an uptrend it is a pullback finding support; in a downtrend it is the middle of nowhere. Which is a compact restatement of the whole unit's theme — the indicator's number is meaningless until you supply the context from the price chart.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "RSI above 70 means sell; below 30 means buy."

This is the most expensive misreading in technical analysis, because it puts you systematically on the wrong side of every strong trend — shorting strength and catching falling knives. RSI above 70 means recent gains have substantially outweighed recent losses. In a range, that condition often does resolve by mean reversion. In a trend, it is the trend itself, and it can persist for a month. The threshold is a **description of a momentum state**, never an instruction, and using it as one without first establishing the regime is how beginners lose money in the most consistent way available to them.`,
        },
        {
          kind: 'callout',
          md: `**Two more things to know.** First, RSI is bounded, which means it *must* flatten near its extremes: a stock rising 3% a day for a month cannot push RSI past 100, so the line flattens while price keeps going. That flattening is an artefact of the arithmetic and gets misread as weakness constantly. Second, the lookback dominates the reading: a 2-period RSI hits extremes several times a month, a 14-period a few times a year, and a 25-period rarely — so "RSI is 78" means nothing without the period attached.`,
        },
        {
          kind: 'keypoint',
          md: `**RS = average gain ÷ average loss; RSI = 100 − 100 ÷ (1 + RS)** over 14 periods by default. It measures momentum, not value: 50 means gains and losses are equally sized. Overbought can stay overbought for weeks in a strong trend. RSI's ranges shift with regime — roughly 40–80 in uptrends, 20–60 in downtrends — so the same reading means opposite things in different contexts.`,
        },
      ],
      quiz: [
        {
          id: 'u10-l04-q1',
          prompt: 'Over 14 sessions the average gain is $1.20 and the average loss is $0.60. What is RSI?',
          choices: [
            '50.0, since gains and losses both occurred',
            '75.0, the ratio expressed as a percentage',
            '66.7 is impossible — RSI cannot exceed 50 unless every session was up',
            '66.7 — RS = 2.0, so RSI = 100 − (100 ÷ 3) = 66.7',
          ],
          answerIdx: 3,
          explain:
            'RS = 1.20 ÷ 0.60 = 2.0, and RSI = 100 − (100 ÷ (1 + 2)) = 66.7. Worth noting that up-moves being twice the size of down-moves does not even reach the 70 threshold — and RSI passes 50 whenever average gains exceed average losses, which requires nothing like an unbroken run of up sessions.',
        },
        {
          id: 'u10-l04-q2',
          prompt: 'What does an RSI reading of 50 indicate?',
          choices: [
            'Average gains and average losses over the lookback have been the same size',
            'The stock is trading at its 14-day average price',
            'Exactly half the sessions in the lookback were up',
            'The stock is fairly valued',
          ],
          answerIdx: 0,
          explain:
            'RSI is 50 when RS = 1, meaning average gain equals average loss in magnitude — a statement about the size of moves, not their count. Seven up-sessions and seven down-sessions can produce any RSI at all depending on how big each was, and RSI carries no information about price level or value.',
        },
        {
          id: 'u10-l04-q3',
          prompt:
            'A stock rallies from $140 to $186 over 23 consecutive sessions with RSI above 70. What is the lesson?',
          choices: [
            'The RSI calculation must be misconfigured, since it cannot stay above 70 that long',
            'The stock was overbought and the advance was therefore unsustainable',
            'Overbought can stay overbought — high RSI in a strong trend describes strength, and strength persists',
            'RSI should be recalculated on a shorter lookback to catch the top',
          ],
          answerIdx: 2,
          explain:
            'Selling the first 70 print meant exiting near $147 and missing the remaining 26% of the advance, which is the standard cost of treating the threshold as an instruction. RSI can legitimately hold above 70 for weeks, and shortening the lookback makes the reading noisier rather than more prescient.',
        },
        {
          id: 'u10-l04-q4',
          prompt: 'How do RSI ranges shift between regimes, and why does it matter?',
          choices: [
            'They do not shift; 70 and 30 are fixed for all conditions',
            'Ranges shift only on intraday charts',
            'Uptrends oscillate roughly 40–80 with 40 as a pivot; downtrends roughly 20–60 with 60 as a cap — so the same reading means opposite things',
            'Uptrends oscillate 60–100 and downtrends 0–40',
          ],
          answerIdx: 2,
          explain:
            'The documented shift means an RSI of 42 is a pullback finding support in an uptrend and the middle of nowhere in a downtrend — the number is meaningless until the regime supplies context. The 70/30 levels are Wilder’s defaults rather than fixed truths, and RSI rarely pins to the 0–40 or 60–100 extremes for long on any timeframe.',
        },
        {
          id: 'u10-l04-q5',
          prompt:
            'A stock rises 3% a day for a month and its RSI line flattens near 90. What does the flattening indicate?',
          choices: [
            'Momentum has stalled and a reversal is imminent',
            'An arithmetic artefact — RSI is bounded at 100, so it must flatten while price keeps rising',
            'The data feed has stopped updating the indicator',
            'The lookback period has expired',
          ],
          answerIdx: 1,
          explain:
            'RSI cannot exceed 100, so a sustained one-way advance compresses the line near its ceiling regardless of how strong price is — the flattening is a property of the scale, not evidence about momentum. Reading it as impending weakness is one of the most common indicator misreadings there is.',
        },
      ],
      cardSeeds: [
        {
          id: 'u10-l04-c1',
          kind: 'cloze',
          front: 'RS = average ____ ÷ average ____; RSI = 100 − (100 ÷ (1 + ____)). Default lookback: ____ periods.',
          back: 'gain; loss; RS; 14',
        },
        {
          id: 'u10-l04-c2',
          kind: 'basic',
          front: 'What does RSI = 50 mean, and what does it NOT mean?',
          back: 'It means average gains and average losses over the lookback were the same size. It does not mean half the sessions were up, and it says nothing about whether the stock is expensive — RSI measures momentum, not value.',
        },
        {
          id: 'u10-l04-c3',
          kind: 'basic',
          front: 'How do RSI ranges shift with regime?',
          back: 'Uptrend: roughly 40–80, with the 40 area holding on pullbacks. Downtrend: roughly 20–60, with the 60 area capping rallies. The same reading means opposite things depending on which regime you are in.',
        },
        {
          id: 'u10-l04-c4',
          kind: 'basic',
          front: 'Why is "RSI > 70 means sell" so expensive?',
          back: 'It puts you systematically on the wrong side of strong trends. RSI can hold above 70 for weeks — 23 straight sessions in the worked example, during a 33% advance. The threshold describes a momentum state, never an instruction.',
        },
      ],
    },

    // ── L05 ───────────────────────────────────────────────────────────────
    {
      id: 'u10-l05',
      unitId: 'u10',
      order: 5,
      title: 'Divergences',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `A **divergence** is price and an oscillator disagreeing about a swing. Four cases, and the names are worth getting right:

| Type | Price | Oscillator | Conventional reading |
|---|---|---|---|
| **Regular bearish** | higher high | lower high | advance decelerating |
| **Regular bullish** | lower low | higher low | decline decelerating |
| **Hidden bullish** | higher low | lower low | uptrend continuation |
| **Hidden bearish** | lower high | higher high | downtrend continuation |

**Regular** divergences are read as potential reversals; **hidden** divergences as continuation, and they appear most often in pullbacks inside an intact trend.

What a divergence actually measures is narrow and specific: **the current swing was made with less momentum than the last one**. That is a real observation. It is also, on its own, a very ordinary thing for a trend to do.`,
        },
        {
          kind: 'example',
          md: `**The same divergence, two endings.** A stock makes three successive pushes:

| Push | Price high | RSI at the high |
|---|---|---|
| 1 | $58.00 | 78 |
| 2 | $61.00 | 71 |
| 3 | $63.50 | 64 |

Textbook regular bearish divergence: price up **9.5%** across the three peaks while RSI falls **14 points**. Each new high is being made with less momentum than the last.

- **Ending A:** the third push fails, price breaks the pivot low beneath it and falls to **$52.00** — an 18% decline. The divergence "worked".
- **Ending B:** price consolidates for three weeks, then advances to **$81.00** over the following four months — printing two *more* bearish divergences on the way, at $70 and at $76, each of which also "failed".

Ending B is at least as common as ending A. A trend that decelerates does not have to reverse; it can decelerate, rest, and accelerate again. Divergence told you something true about momentum and nothing reliable about direction.`,
        },
        {
          kind: 'text',
          md: `**Why divergence is weaker evidence than it looks.** Three structural reasons:

1. **It is partly mechanical.** RSI is bounded and mean-reverting by construction. Once it has printed 78, any subsequent advance that is even slightly less violent produces a lower RSI high — automatically. A large share of divergences are arithmetic, not behavioural.
2. **There is no invalidation level in it.** "RSI made a lower high" gives you no price at which you were wrong. A divergence-based entry has to import its stop from the price structure, which means the price structure was doing the real work all along.
3. **They stack.** As ending B shows, a strong trend will produce divergence after divergence. Acting on each one means being wrong repeatedly in the same direction, which is the signature of fighting a trend.

**The defensible use:** treat a regular divergence as a reason to **tighten risk on a position you already hold** — trail the stop, reduce size, stop adding — and as a *confirming* input when the price structure has *already* broken (a lost pivot low, a failed retest). Divergence plus a broken structure is a coherent read. Divergence alone is a mood.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Divergence means the trend is about to reverse."

Divergence means the last swing carried less momentum than the previous one — full stop. The strongest trends in any market produce long strings of bearish divergences on the way up, each one unresolved, and the tests that have been run on divergence as a standalone entry signal are unimpressive. If you want a rule of thumb: a divergence is worth about as much as a single candlestick pattern — a modifier on a decision made elsewhere, never the decision.`,
        },
        {
          kind: 'keypoint',
          md: `Regular divergence (price higher high, oscillator lower high) reads as deceleration; hidden divergence reads as continuation inside a trend. It is partly a mechanical consequence of a bounded oscillator, it supplies no invalidation level, and strong trends produce them repeatedly. Use it to tighten risk on an existing position, or as confirmation once price structure has already broken — never as a standalone entry.`,
        },
      ],
      quiz: [
        {
          id: 'u10-l05-q1',
          prompt: 'Price makes a higher high while RSI makes a lower high. What is this, and what does it strictly mean?',
          choices: [
            'Hidden bullish divergence — the uptrend will continue',
            'Regular bearish divergence — the new high was made with less momentum than the previous one',
            'A data error, since RSI must follow price',
            'Regular bullish divergence — the decline is decelerating',
          ],
          answerIdx: 1,
          explain:
            'Price higher, oscillator lower is regular bearish divergence, and its strict content is deceleration: this swing carried less momentum than the last. Hidden bullish divergence is price making a *higher low* against a lower oscillator low, and RSI is a function of the size of moves rather than a follower of price level, so disagreement is normal rather than erroneous.',
        },
        {
          id: 'u10-l05-q2',
          prompt:
            'A stock peaks at $58.00 (RSI 78), $61.00 (RSI 71) and $63.50 (RSI 64), then advances to $81.00 over four months, printing two more divergences. What does this illustrate?',
          choices: [
            'The divergences were incorrectly measured',
            'RSI should have been calculated on a longer lookback',
            'A decelerating trend can rest and re-accelerate — divergence describes momentum, not direction',
            'Divergence only works on downtrends',
          ],
          answerIdx: 2,
          explain:
            'The observation was true — each high did carry less momentum — and the trend continued anyway, which is at least as common as the reversal outcome. Strong trends stack divergences, so acting on each one means being repeatedly wrong in the same direction; the measurement and the lookback were never the problem.',
        },
        {
          id: 'u10-l05-q3',
          prompt: 'Why is a large share of divergences described as "mechanical" rather than behavioural?',
          choices: [
            'RSI is bounded and mean-reverting, so once it prints 78 any slightly less violent advance produces a lower high automatically',
            'Charting platforms generate them algorithmically',
            'Market makers create them deliberately',
            'They only appear when volume data is missing',
          ],
          answerIdx: 0,
          explain:
            'Because the oscillator has a ceiling, a second advance that is merely a little calmer than the first must register a lower reading — the divergence appears from the arithmetic without anyone’s behaviour changing meaningfully. That is why divergence is weaker evidence than its visual drama suggests.',
        },
        {
          id: 'u10-l05-q4',
          prompt: 'What is the defensible way to use a regular divergence?',
          choices: [
            'As a standalone entry signal, since it precedes the price move',
            'As a reason to lengthen your holding period',
            'As a substitute for a stop-loss level',
            'To tighten risk on a position you already hold, or as confirmation once price structure has already broken',
          ],
          answerIdx: 3,
          explain:
            'Trailing a stop, reducing size or declining to add are all decisions the observation genuinely supports, and divergence plus an already-broken pivot is a coherent combined read. It cannot serve as a stop level because it supplies no price at which you were wrong — any divergence trade has to import its invalidation from the price structure, which was doing the real work anyway.',
        },
      ],
      cardSeeds: [
        {
          id: 'u10-l05-c1',
          kind: 'cloze',
          front:
            'Regular bearish divergence: price makes a ____ high while the oscillator makes a ____ high. Hidden bullish: price makes a ____ low while the oscillator makes a ____ low.',
          back: 'higher; lower; higher; lower',
        },
        {
          id: 'u10-l05-c2',
          kind: 'basic',
          front: 'What does a divergence strictly mean?',
          back: 'That the latest swing was made with less momentum than the previous one. That is a true observation about deceleration — and a decelerating trend can rest and re-accelerate rather than reverse.',
        },
        {
          id: 'u10-l05-c3',
          kind: 'basic',
          front: 'Three reasons divergence is weaker evidence than it looks',
          back: 'It is partly mechanical (a bounded oscillator produces lower highs automatically); it supplies no invalidation level; and strong trends stack divergences, so acting on each means being wrong repeatedly in one direction.',
        },
      ],
    },

    // ── L06 ───────────────────────────────────────────────────────────────
    {
      id: 'u10-l06',
      unitId: 'u10',
      order: 6,
      title: 'MACD',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**MACD** — Moving Average Convergence Divergence, devised by Gerald Appel around 1979 — is two moving averages subtracted from each other, then smoothed again. Three components:

> **MACD line = EMA(12) − EMA(26)**
> **Signal line = EMA(9) of the MACD line**
> **Histogram = MACD line − Signal line**

Read that first equation carefully, because it is the whole indicator. The MACD line is the *distance* between a fast average and a slow one:

- **MACD above zero** — the 12-period average is above the 26-period. The short-term trend is above the medium-term one.
- **MACD rising** — the two averages are *separating*: the trend is accelerating.
- **MACD falling but still positive** — still an uptrend, but the averages are converging: the trend is decelerating.

So MACD does not measure momentum in the RSI sense. It measures the **spread between two smoothed trends**, and the spread's rate of change is what people call momentum here.`,
        },
        {
          kind: 'example',
          md: `**Three readings, computed.**

*Week 1.* EMA(12) = **$52.40**, EMA(26) = **$51.10**, signal line = **$0.95**.

- MACD = 52.40 − 51.10 = **+1.30**
- Histogram = 1.30 − 0.95 = **+0.35** — MACD above its signal and pulling away, so the advance is broadening.

*Week 2.* EMA(12) = **$52.80**, EMA(26) = **$51.90**, signal = **$1.05**.

- MACD = 52.80 − 51.90 = **+0.90**
- Histogram = 0.90 − 1.05 = **−0.15** — a bearish signal-line crossover.

Now look at what price did: **both EMAs rose**. Price is higher than it was a week ago and the trend is intact. What changed is that the fast average gained less ground than the slow one, so the spread narrowed from $1.30 to $0.90. The "bearish crossover" is a statement about the *rate of separation*, and reading it as "sell" in a rising market is the single most common MACD error.

*A note on the histogram.* Because the histogram is the difference between the MACD line and its own smoothed version, it peaks and turns **before** the lines cross — always, by construction. That is arithmetic, not foresight, and treating an early histogram turn as an "advance warning" is claiming credit for a definition.`,
        },
        {
          kind: 'text',
          md: `**The three MACD events, ranked by usefulness:**

1. **Zero-line crosses.** MACD crossing zero means EMA(12) crossed EMA(26) — a genuine, if lagging, statement about trend regime. Slowest and most reliable of the three.
2. **Signal-line crosses.** MACD crossing its own 9-period average. Faster, far noisier, and — as the worked example shows — routinely fires while the trend is intact.
3. **MACD divergence.** Price makes a higher high, MACD makes a lower high. Everything from Lesson 5 applies unchanged, including the part where strong trends produce them repeatedly.

**On the 12/26/9 parameters.** They date from an era of six-day trading weeks, when 12 and 26 corresponded roughly to two and four weeks. There is no evidence they are optimal for anything, and no reason to expect there is — but there is a good reason to keep them: everybody else uses them, and you did not fit them yourself. Optimising MACD parameters is the overfitting exercise from Lesson 1 with a different label.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "A MACD crossover is a buy or sell signal."

A signal-line crossover means the spread between two exponential averages stopped widening. In a trending market that happens constantly during ordinary pauses — the worked example above fired a bearish cross on a week when price *rose*. In a range it fires every few days and every signal is a whipsaw. MACD carries no invalidation level, no target, and no volume input, so it cannot constitute a trade on its own. Use zero-line position as a regime filter and the histogram as a description of whether a move is broadening or narrowing.`,
        },
        {
          kind: 'callout',
          md: `**MACD is not scale-free.** Because it is a difference of prices, its values scale with the share price: a $400 stock will print MACD values ten times larger than a $40 stock for the same *percentage* move. You therefore cannot compare MACD readings across stocks, and you cannot compare a stock's MACD today with its MACD from five years ago at a quarter of the price. RSI, being bounded 0–100, does not have this problem — which is a small illustration of why knowing what an indicator computes matters more than knowing how to read its picture.`,
        },
        {
          kind: 'keypoint',
          md: `**MACD line = EMA(12) − EMA(26); Signal = EMA(9) of MACD; Histogram = MACD − Signal.** It measures the spread between a fast and a slow average, so rising MACD means the averages are separating. Zero-line crosses describe regime and are the most useful event; signal-line crosses fire constantly, including in intact uptrends. Values scale with share price, so they are not comparable across stocks.`,
        },
      ],
      quiz: [
        {
          id: 'u10-l06-q1',
          prompt: 'What does the MACD line actually compute?',
          choices: [
            'EMA(12) − EMA(26) — the spread between a fast and a slow exponential average',
            'The percentage change in price over 12 periods',
            'The ratio of average gains to average losses over 26 periods',
            'The 9-period average of the closing price',
          ],
          answerIdx: 0,
          explain:
            'MACD is a difference of two EMAs, so its level says which average is on top and its slope says whether they are separating or converging. The gain-to-loss ratio describes RSI, and the 9-period average is the signal line — computed from the MACD line itself, not from price.',
        },
        {
          id: 'u10-l06-q2',
          prompt:
            'EMA(12) = $52.40 and EMA(26) = $51.10, with the signal line at $0.95. What are the MACD value and histogram?',
          choices: [
            'MACD = $103.50, histogram = $102.55',
            'MACD = +1.30, histogram = +2.25',
            'MACD = +0.35, histogram = +1.30',
            'MACD = +1.30, histogram = +0.35',
          ],
          answerIdx: 3,
          explain:
            'MACD = 52.40 − 51.10 = +1.30, and the histogram is MACD minus the signal line: 1.30 − 0.95 = +0.35, meaning MACD is above its own average and pulling away. Adding the two components rather than subtracting them, or swapping their roles, are the usual slips.',
        },
        {
          id: 'u10-l06-q3',
          prompt:
            'A week later both EMAs are higher — EMA(12) $52.80, EMA(26) $51.90 — but MACD falls to +0.90, crossing below a $1.05 signal line. How should this be read?',
          choices: [
            'Price has begun falling, which is what triggered the cross',
            'The indicator is faulty, since MACD cannot fall while price rises',
            'The trend is intact but the averages are converging — the cross describes a slowing rate of separation, not a decline',
            'A confirmed sell signal, since MACD crossed its signal line',
          ],
          answerIdx: 2,
          explain:
            'Both averages rose, so price is higher and the uptrend is unbroken; what changed is that the fast average gained less than the slow one, narrowing the spread from $1.30 to $0.90. Reading that as a sell in a rising market is the most common MACD error — the cross is a statement about acceleration, not direction.',
        },
        {
          id: 'u10-l06-q4',
          prompt: 'Why does the MACD histogram always turn before the lines cross?',
          choices: [
            'Because it incorporates volume, which leads price',
            'Because it is the difference between the MACD line and its own smoothed average — the turn is arithmetic, not foresight',
            'Because it is calculated on a shorter lookback than the MACD line',
            'Because it is plotted with a one-bar offset',
          ],
          answerIdx: 1,
          explain:
            'The histogram measures the gap that a crossover eventually closes, so it must shrink toward zero before the lines meet — by construction, in every case. Calling that an advance warning claims credit for a definition; no volume enters MACD at any point, and there is no plotting offset involved.',
        },
        {
          id: 'u10-l06-q5',
          prompt: 'Why can MACD readings not be compared across two different stocks?',
          choices: [
            'MACD values scale with the share price, so a $400 stock prints values ten times larger than a $40 stock for the same percentage move',
            'Because each vendor uses different EMA periods',
            'Because MACD requires at least five years of history to stabilise',
            'Because MACD is bounded between 0 and 100 differently for each stock',
          ],
          answerIdx: 0,
          explain:
            'MACD is a difference of prices in dollars, so its magnitude depends on the price level — which also rules out comparing one stock’s MACD today with its own reading from years ago at a quarter of the price. RSI is the bounded 0–100 indicator; MACD is unbounded, and the 12/26/9 periods are near-universal defaults.',
        },
      ],
      cardSeeds: [
        {
          id: 'u10-l06-c1',
          kind: 'cloze',
          front:
            'MACD line = EMA(____) − EMA(____). Signal line = EMA(____) of the MACD line. Histogram = MACD − ____.',
          back: '12; 26; 9; signal line',
        },
        {
          id: 'u10-l06-c2',
          kind: 'basic',
          front: 'What does a rising MACD line mean?',
          back: 'The fast and slow averages are separating — the trend is accelerating. A falling but still-positive MACD means an intact uptrend whose averages are converging: deceleration, not decline.',
        },
        {
          id: 'u10-l06-c3',
          kind: 'basic',
          front: 'Rank the three MACD events by usefulness',
          back: 'Zero-line crosses (EMA12 crossing EMA26) describe regime and are slowest but most reliable; signal-line crosses are far noisier and fire during intact trends; MACD divergence carries all the weaknesses of RSI divergence.',
        },
        {
          id: 'u10-l06-c4',
          kind: 'basic',
          front: 'Why is MACD not comparable across stocks?',
          back: 'It is a difference of prices in dollars, so its values scale with the share price. The same percentage move gives a $400 stock roughly ten times the MACD reading of a $40 stock.',
        },
      ],
    },

    // ── L07 ───────────────────────────────────────────────────────────────
    {
      id: 'u10-l07',
      unitId: 'u10',
      order: 7,
      title: 'Bollinger Bands',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**Bollinger Bands**, developed by John Bollinger in the early 1980s, wrap a moving average in a volatility envelope:

> **Middle band = 20-period SMA**
> **Upper band = middle + (2 × standard deviation of the last 20 closes)**
> **Lower band = middle − (2 × standard deviation of the last 20 closes)**

The key property follows from the standard deviation being recomputed every session: **the bands are not a fixed channel — they breathe.** When the stock is quiet the bands squeeze inward; when it becomes violent they flare outward. The bands are a picture of *current volatility*, drawn around a *current average*.

**Bandwidth** turns that picture into a number:

> **Bandwidth = (upper − lower) ÷ middle**

which expresses the envelope's width as a fraction of price, making it comparable over time and across stocks.`,
        },
        {
          kind: 'example',
          md: `**A squeeze, in numbers.** A stock's 20-day SMA is **$48.00**.

*Normal conditions.* The standard deviation of the last 20 closes is **$1.50**.

- Upper band = 48.00 + (2 × 1.50) = **$51.00**
- Lower band = 48.00 − (2 × 1.50) = **$45.00**
- Bandwidth = (51.00 − 45.00) ÷ 48.00 = 6.00 ÷ 48.00 = **12.5%**

*After six quiet weeks.* The average is still **$48.00** but the standard deviation has fallen to **$0.60**.

- Upper band = **$49.20**, lower band = **$46.80**
- Bandwidth = 2.40 ÷ 48.00 = **5.0%**

The envelope has narrowed by **60%** while the average has not moved at all. If 5.0% is the narrowest bandwidth in six months, that is a **squeeze** — the Bollinger version of Unit 8's range contraction, and it carries the same warning and the same limitation: **an expansion is likely; the direction is not indicated.** Squeezes resolve upward and downward, and a squeeze that breaks up, reverses, and then runs down is entirely ordinary.`,
        },
        {
          kind: 'text',
          md: `**Two regimes, and the bands cannot tell you which you are in.**

- **Range regime.** Price oscillates between the bands and touches are followed by reversion to the middle. This is where "sell the upper band, buy the lower band" appears to work, and it works until it stops.
- **Trend regime.** Price **walks the band**: session after session closing at or above the upper band, with the middle band acting as support on pullbacks. A stock might close above its upper band in **14 of 18 sessions** while advancing from **$46** to **$59** — every one of those touches a "sell signal" to someone.

Which regime you are in is a question for the price chart — trend structure, higher highs and higher lows, the slope of the middle band — not for the envelope. The bands measure dispersion. They have no opinion about direction, and asking them for one is a category error.

**Two useful refinements.** A **band touch on expanding bandwidth** during an established trend is continuation, not exhaustion. And **%B** — where price sits inside the envelope, 0 at the lower band and 1 at the upper — is the compact way to say "closed above the upper band" (%B > 1) without eyeballing.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Price touching the upper band means overbought — sell."

A band touch means price is two standard deviations above its 20-day average, which in a strong trend is a **daily occurrence**, not an extreme. This is the RSI-70 error wearing different clothing: it puts you short exactly the stocks that are working. The bands describe where price sits within its own recent dispersion; they contain no information about whether that position is sustainable. If you want a rule, invert the naive one — in a confirmed trend, a band walk is evidence of strength.`,
        },
        {
          kind: 'callout',
          md: `**About the "95%" claim.** People often say two standard deviations should contain 95% of observations. That figure comes from the normal distribution, and it does not transfer here for two reasons: financial returns have **fat tails**, and the standard deviation is estimated from the *same twenty closes* the bands are drawn around, which is a small, autocorrelated, in-sample estimate. In practice something closer to **85–90%** of closes land inside the bands, and the misses cluster in exactly the violent periods you care about most. Do not treat a band touch as a 1-in-20 event; it is closer to 1 in 8.`,
        },
        {
          kind: 'keypoint',
          md: `**Bands = 20-day SMA ± 2 standard deviations of the last 20 closes; bandwidth = (upper − lower) ÷ middle.** They are a breathing volatility envelope, not a fixed channel. A squeeze (multi-month-low bandwidth) predicts expansion but not direction. In trends price walks the band, so a touch is not an extreme — roughly 85–90% of closes fall inside, not 95%.`,
        },
      ],
      quiz: [
        {
          id: 'u10-l07-q1',
          prompt: 'A stock’s 20-day SMA is $48.00 and the standard deviation of the last 20 closes is $1.50. Where are the bands, and what is the bandwidth?',
          choices: [
            'Bands at $46.50 and $49.50; bandwidth 6.25%',
            'Bands at $45.00 and $51.00; bandwidth 12.5%',
            'Bands at $44.00 and $52.00; bandwidth 16.7%',
            'Bands at $46.80 and $49.20; bandwidth 5.0%',
          ],
          answerIdx: 1,
          explain:
            'Two standard deviations is 2 × $1.50 = $3.00, giving $45.00 and $51.00, and bandwidth is (51 − 45) ÷ 48 = 12.5%. One standard deviation would give the $46.50–49.50 pair, and the $46.80–49.20 figures are the squeezed case where the deviation has fallen to $0.60.',
        },
        {
          id: 'u10-l07-q2',
          prompt: 'Bandwidth falls from 12.5% to 5.0% while the 20-day average stays at $48.00. What does this tell you?',
          choices: [
            'Volatility has contracted to a squeeze — an expansion is likely, but the direction is not indicated',
            'The stock is being accumulated, since narrowing bands mean buying pressure',
            'A downside break is coming, since squeezes resolve toward the prior trend',
            'The average has become unreliable and should be recalculated',
          ],
          answerIdx: 0,
          explain:
            'Only the standard deviation changed, so the stock has gone quiet — the Bollinger version of Unit 8’s range contraction, which reliably precedes expansion and says nothing whatever about which way. Squeezes resolve in both directions, and a break that reverses before running the other way is entirely ordinary.',
        },
        {
          id: 'u10-l07-q3',
          prompt:
            'A stock closes above its upper band in 14 of 18 sessions while rising from $46 to $59. What is this called and what does it mean?',
          choices: [
            'A squeeze — volatility is compressing ahead of a reversal',
            'A divergence — price and volatility are disagreeing',
            'A band failure — the calculation has broken down at these prices',
            'A band walk — in a trend regime, repeated band touches are evidence of strength, not exhaustion',
          ],
          answerIdx: 3,
          explain:
            'Walking the band is the trend-regime behaviour, with the middle band acting as support on pullbacks, and every one of those closes would have been a "sell signal" to someone reading touches as extremes. A squeeze is the opposite condition — narrowing bandwidth — and nothing about the arithmetic breaks at any price level.',
        },
        {
          id: 'u10-l07-q4',
          prompt: 'Why is the "two standard deviations contains 95%" claim wrong for Bollinger Bands?',
          choices: [
            'Because the bands use a 20-day rather than a 30-day window',
            'Because returns have fat tails and the deviation is estimated in-sample from the same 20 closes — in practice roughly 85–90% of closes fall inside',
            'Because the middle band is an SMA rather than an EMA',
            'Because standard deviation cannot be computed on price data',
          ],
          answerIdx: 1,
          explain:
            'The 95% figure comes from the normal distribution, but financial returns are fat-tailed and the deviation here is a small, autocorrelated, in-sample estimate — so band touches occur closer to one time in eight than one in twenty, and the misses cluster in exactly the violent periods that matter. The window length and the choice of average shift the picture slightly but are not the reason.',
        },
        {
          id: 'u10-l07-q5',
          prompt: 'Which question can Bollinger Bands not answer?',
          choices: [
            'How wide the current dispersion of closes is',
            'Where price sits relative to its own recent volatility',
            'Whether the market is in a mean-reverting or a trending regime',
            'Whether volatility has contracted relative to recent months',
          ],
          answerIdx: 2,
          explain:
            'The bands measure dispersion and location within it, so they answer the width and position questions directly — but regime is a question about trend structure, higher highs and higher lows, and the slope of the middle band, which the envelope has no opinion on. Asking an envelope for direction is a category error, and it is the source of most losses attributed to the indicator.',
        },
      ],
      cardSeeds: [
        {
          id: 'u10-l07-c1',
          kind: 'cloze',
          front:
            'Bollinger Bands: middle = ____-period SMA; upper/lower = middle ± ____ × the ____ of the last 20 closes.',
          back: '20; 2; standard deviation',
        },
        {
          id: 'u10-l07-c2',
          kind: 'cloze',
          front: 'Bandwidth = (____ − ____) ÷ ____. A multi-month low in bandwidth is a ____, which predicts expansion but not ____.',
          back: 'upper; lower; middle; squeeze; direction',
        },
        {
          id: 'u10-l07-c3',
          kind: 'basic',
          front: 'What is a band walk?',
          back: 'Price closing at or above the upper band session after session in a trend, with the middle band acting as support. It is evidence of strength — the trend-regime opposite of the "touch means overbought" reading.',
        },
        {
          id: 'u10-l07-c4',
          kind: 'basic',
          front: 'Why do band touches happen more often than "1 in 20"?',
          back: 'The 95% figure assumes normally distributed returns. Real returns have fat tails and the standard deviation is estimated in-sample from the same 20 closes — so roughly 85–90% of closes land inside, making a touch closer to a 1-in-8 event.',
        },
      ],
    },

    // ── L08 ───────────────────────────────────────────────────────────────
    {
      id: 'u10-l08',
      unitId: 'u10',
      order: 8,
      title: 'ATR & Volatility',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**Average True Range** is the most practically useful indicator in this unit, and almost the only one that is not used to predict anything.

Start with the problem it solves. The obvious measure of a day's movement — **high minus low** — misses gaps entirely. A stock that closes at $53.60 and opens the next day at $52.00 has moved $1.60 before a single share trades in the session. **True Range** repairs that by taking the largest of three distances:

> **TR = max( high − low, |high − previous close|, |low − previous close| )**

**ATR** is then the average true range over a lookback, conventionally **14 periods** (Wilder's original smoothing, not a plain mean, but the distinction rarely matters for reading it).

ATR is expressed in the stock's own units: an ATR of **$2.40** on an **$84** stock means it typically travels about **2.9%** of its price in a session.`,
        },
        {
          kind: 'example',
          md: `**One true range, computed.** Yesterday's close was **$53.60**. Today: high **$52.40**, low **$50.90**.

| Candidate | Calculation | Value |
|---|---|---|
| high − low | 52.40 − 50.90 | **$1.50** |
| \\|high − prev close\\| | \\|52.40 − 53.60\\| | **$1.20** |
| \\|low − prev close\\| | \\|50.90 − 53.60\\| | **$2.70** |

**TR = $2.70** — the largest. The naive high-minus-low reading would have reported $1.50 and understated the day's real movement by **44%**, because the entire gap down happened between sessions. On a stock that gaps regularly — anything with earnings, trial results or commodity exposure — that understatement compounds into stops that are systematically too tight.`,
        },
        {
          kind: 'example',
          md: `**Sizing two positions to the same risk.** Account: **$30,000**. Risk budget per position: **1% = $300**. Stop distance: **2.5 × ATR**.

*Stock A — quiet.* Price **$84.00**, ATR **$2.40**.

- Stop distance = 2.5 × 2.40 = **$6.00**
- Shares = 300 ÷ 6.00 = **50**
- Position value = 50 × 84.00 = **$4,200** — **14.0%** of the account

*Stock B — volatile.* Price **$84.00**, ATR **$6.00**.

- Stop distance = 2.5 × 6.00 = **$15.00**
- Shares = 300 ÷ 15.00 = **20**
- Position value = 20 × 84.00 = **$1,680** — **5.6%** of the account

Same price, same account, same dollar risk — and a position **two and a half times larger** in the quieter stock. This is what ATR is *for*. Sizing by dollar amount ("I put $5,000 in each name") silently takes far more risk in the volatile one; sizing by ATR equalises the thing you actually care about, which is how much you lose when you are wrong.

Note also that **stop distance is not risk**. Stock B's $15.00 stop is wider than Stock A's $6.00 — and carries *less* portfolio risk, because the position is smaller. Conflating the two is why beginners tighten stops to "reduce risk" and end up with the same dollar exposure hit by ordinary noise.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "A tighter stop means less risk."

Risk is **stop distance × share count**, and share count is yours to set. Halving the stop while keeping the same share count halves the loss *when the stop is hit* — and roughly doubles how often it is hit, because you have placed it inside the stock's ordinary daily wiggle. A stop at 0.4 × ATR will be triggered by noise almost immediately, converting a possibly-good idea into a certainly-realised loss. The correct order of operations is: place the stop where the idea is genuinely wrong, *then* solve for share count.`,
        },
        {
          kind: 'callout',
          md: `**Volatility clusters, so ATR is a moving target.** Quiet periods follow quiet periods and violent ones follow violent ones. A position sized on a $1.20 ATR before an earnings release may be sitting in a stock with a $3.50 ATR the following morning — the position did not change, but its risk nearly tripled. Two habits follow: re-check ATR before adding to a position, and treat a sharp ATR expansion as a reason to reduce size rather than as a signal about direction. ATR has no direction; it is unsigned, exactly like volume.`,
        },
        {
          kind: 'keypoint',
          md: `**TR = max(high − low, |high − prev close|, |low − prev close|)**, so gaps are counted; **ATR** is its 14-period average, expressed in the stock's own units. Its job is sizing, not prediction: **shares = risk budget ÷ (ATR multiple)**, which equalises dollar risk across stocks of different volatility. Stop distance is not risk — risk is distance × share count. Unit 11 builds position sizing and risk rules on exactly this arithmetic.`,
        },
      ],
      quiz: [
        {
          id: 'u10-l08-q1',
          prompt:
            'Yesterday’s close was $53.60. Today’s high is $52.40 and low is $50.90. What is the true range?',
          choices: [
            '$1.50 — high minus low',
            '$1.20 — high minus previous close',
            '$4.20 — the sum of the gap and the range',
            '$2.70 — the largest of the three candidates, low to previous close',
          ],
          answerIdx: 3,
          explain:
            'The three candidates are $1.50, $1.20 and $2.70, and true range takes the largest — here the distance from the previous close down to today’s low, which captures the overnight gap. Reporting high minus low would understate the day’s real movement by 44%, which is precisely the failure true range exists to fix.',
        },
        {
          id: 'u10-l08-q2',
          prompt: 'Why does true range use the previous close rather than just today’s high and low?',
          choices: [
            'To smooth the series and reduce noise',
            'Because gaps move price between sessions, and high minus low misses that movement entirely',
            'Because exchanges report the previous close more accurately',
            'To make the measure comparable across different stocks',
          ],
          answerIdx: 1,
          explain:
            'A stock that closes at $53.60 and opens at $52.00 has already moved $1.60 before a share trades, and only the previous-close comparisons capture it — which matters most in exactly the names that gap: earnings, trial results, commodity exposure. True range does no smoothing (that is ATR’s job) and is still expressed in dollars, so it is not cross-stock comparable on its own.',
        },
        {
          id: 'u10-l08-q3',
          prompt:
            'On a $30,000 account risking 1% per position with a 2.5 × ATR stop, how many shares of an $84 stock with a $6.00 ATR?',
          choices: [
            '20 shares — a $15.00 stop into a $300 risk budget',
            '50 shares, as with any $84 stock',
            '357 shares — the risk budget divided by the ATR',
            '3 shares — 1% of the account divided by the share price',
          ],
          answerIdx: 0,
          explain:
            'The stop distance is 2.5 × $6.00 = $15.00, and $300 ÷ $15.00 = 20 shares, a $1,680 position. The 50-share answer belongs to the quieter version of the same stock with a $2.40 ATR — which is the whole point: identical price and identical dollar risk produce very different share counts.',
        },
        {
          id: 'u10-l08-q4',
          prompt: 'Two positions have the same dollar risk, but one has a $15.00 stop and the other a $6.00 stop. Which carries more portfolio risk?',
          choices: [
            'The $15.00 stop, since the potential loss per share is larger',
            'The $6.00 stop, since tighter stops are hit more often',
            'Neither — risk is stop distance × share count, and both were sized to the same dollar risk',
            'Cannot be determined without knowing the entry prices',
          ],
          answerIdx: 2,
          explain:
            'Dollar risk is distance multiplied by share count, so equalising it is exactly what the ATR sizing did — the wider stop simply comes with proportionally fewer shares. Confusing stop distance with risk is why beginners tighten stops to "reduce risk" while leaving share count untouched, keeping the same exposure and getting stopped out by noise.',
        },
        {
          id: 'u10-l08-q5',
          prompt: 'A stock’s ATR triples overnight after an earnings release. What does that imply for an existing position?',
          choices: [
            'Nothing, since the number of shares has not changed',
            'It is a bullish signal, since expanding volatility follows expanding interest',
            'The ATR calculation should be reset to exclude the gap',
            'Its risk has roughly tripled — a reason to reduce size, not a statement about direction',
          ],
          answerIdx: 3,
          explain:
            'The position is unchanged but the stock it is in has become a different stock in risk terms, so a stop and size calibrated to the old ATR are badly miscalibrated for the new one. ATR is unsigned, exactly like volume — it says how far price moves, never which way — and excluding the gap would remove the very movement true range was designed to capture.',
        },
      ],
      cardSeeds: [
        {
          id: 'u10-l08-c1',
          kind: 'cloze',
          front:
            'TR = max( high − ____, |high − ____ close|, |low − ____ close| ). ATR is its ____-period average.',
          back: 'low; previous; previous; 14',
        },
        {
          id: 'u10-l08-c2',
          kind: 'cloze',
          front:
            'ATR position sizing: shares = ____ budget ÷ (ATR ____). Risk is stop ____ × share ____, so a wider stop is not more risk.',
          back: 'risk (dollar); multiple (stop distance); distance; count',
        },
        {
          id: 'u10-l08-c3',
          kind: 'basic',
          front: 'Why does sizing by dollar amount take unequal risk?',
          back: 'Putting $5,000 into each name gives the volatile stock a far larger loss when the stop is hit. ATR sizing equalises dollar risk instead: a $30,000 account risking $300 with a 2.5 × ATR stop buys 50 shares of an ATR-$2.40 stock and 20 shares of an ATR-$6.00 one.',
        },
        {
          id: 'u10-l08-c4',
          kind: 'basic',
          front: 'Why must ATR be re-checked over the life of a position?',
          back: 'Volatility clusters, so ATR moves. A position sized on a $1.20 ATR before earnings can be sitting in a $3.50-ATR stock the next morning — same shares, roughly triple the risk. Treat ATR expansion as a reason to cut size, never as a direction signal.',
        },
      ],
    },

    // ── L09 ───────────────────────────────────────────────────────────────
    {
      id: 'u10-l09',
      unitId: 'u10',
      order: 9,
      title: 'Volume Indicators',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `Volume indicators try to turn the unsigned participation number from Unit 8 into something with a direction. They do it by borrowing the sign from *price*.

**On-Balance Volume (OBV)**, the simplest and oldest, is a running total:

> If the close is **up** on the day: **OBV = previous OBV + volume**
> If the close is **down**: **OBV = previous OBV − volume**
> If unchanged: OBV is carried forward

Two things follow immediately, and both are important:

- **The absolute level of OBV is meaningless.** It depends entirely on when the series started. Only its **slope** and its **relationship to price** carry any information.
- **OBV is a blunt instrument.** A close up **0.05%** adds the full day's volume; a close down **7%** subtracts it. A day's direction is treated as binary regardless of magnitude, which is a crude approximation of what actually happened.

**Accumulation/Distribution** and **Chaikin Money Flow** refine this by weighting each day's volume by *where in the range* the close landed — a close at the high of the day counts fully positive, a close mid-range counts near zero. Better arithmetic, same underlying idea, same limits.`,
        },
        {
          kind: 'example',
          md: `**Five days of OBV.** Start the running total at zero.

| Day | Close direction | Volume | OBV |
|---|---|---|---|
| 1 | up | 1.2M | **+1.2M** |
| 2 | up | 0.9M | **+2.1M** |
| 3 | down | 1.6M | **+0.5M** |
| 4 | up | 0.8M | **+1.3M** |
| 5 | down | 2.4M | **−1.1M** |

Over the week price rose from **$40.00** to **$41.20** — a **3%** gain, three up days against two down days. And OBV finished at **−1.1M**, below where it started.

The reading: the advance happened on **light** days (1.2M, 0.9M, 0.8M — total 2.9M) while the declines happened on **heavy** ones (1.6M and 2.4M — total 4.0M). Price went up; participation went the other way.

That is a genuine observation, and it is also a *hint*. Divergences of this kind persist for months, resolve in both directions, and — as Lesson 5 established for RSI — mean far less on their own than their visual drama suggests.`,
        },
        {
          kind: 'text',
          md: `**Volume-by-price** is the other family, and it is arguably more useful than any running total. Instead of plotting volume against *time* along the bottom, it plots volume against **price** along the side: a horizontal histogram showing how many shares changed hands at each price level.

What it gives you, directly:

- **High-volume nodes** — prices where enormous quantities traded. These are the levels from Unit 8's support-and-resistance lesson, derived arithmetically rather than drawn by hand: a lot of positions were established there, so a lot of people care what happens there.
- **Low-volume nodes** — thin zones where little traded. Price tends to move through these quickly, because there is no accumulated inventory to absorb it.

A practical read: a stock that traded **45M** shares between $46 and $52 and only **4M** between $52 and $58 has a wall below and open air above. That is the same fact as the trapped-buyers example from Unit 9's first lesson, quantified.

**The confirmation rule.** Volume indicators confirm; they do not initiate. There is no volume-indicator entry that makes sense on its own, because none of them supplies a level or an invalidation price. They answer one question — *did participation support what price did?* — and that question only arises after price has done something worth asking about.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "OBV reveals what smart money is doing."

OBV assigns the whole day's volume to whichever direction the close happened to land, which is not a measurement of anyone's identity or intent. There is no field in the data marked *institutional*. Worse, the volume you see is incomplete: in recent years roughly **40–50%** of US equity share volume has printed off-exchange — in dark pools and internalised at wholesalers — and a large institution working an order is specifically trying to avoid appearing in the tape you are reading. Volume indicators measure aggregate participation, imperfectly. They do not identify participants.`,
        },
        {
          kind: 'keypoint',
          md: `OBV adds the day's volume on up closes and subtracts it on down closes — its *level* is meaningless, only slope and divergence from price matter, and it treats a 0.05% close the same as a 7% one. Volume-by-price is often more useful: high-volume nodes are levels, low-volume nodes are fast zones. All of them confirm rather than initiate, and none identifies "smart money" — 40–50% of volume prints off-exchange anyway.`,
        },
      ],
      quiz: [
        {
          id: 'u10-l09-q1',
          prompt:
            'Starting at zero, a stock closes up on 1.2M, up on 0.9M, down on 1.6M, up on 0.8M and down on 2.4M shares. What is OBV after five days?',
          choices: [
            '+6.9M, the total volume traded',
            '−1.1M — up-day volume added, down-day volume subtracted',
            '+2.9M, the sum of the up days only',
            '+0.5M, since three of five days were up',
          ],
          answerIdx: 1,
          explain:
            'Running the total gives +1.2, +2.1, +0.5, +1.3 and finally −1.1M: the two down days carried 4.0M shares against 2.9M on the three up days. Counting days rather than weighting by volume, or summing only one side, misses the entire point of the construction.',
        },
        {
          id: 'u10-l09-q2',
          prompt: 'Price rose 3% over that week while OBV finished below where it started. What does this suggest?',
          choices: [
            'The price data must be wrong, since OBV is derived from price',
            'A confirmed sell signal, since OBV leads price',
            'The advance occurred on light volume while the declines came on heavy volume — a hint, not a signal',
            'Institutional accumulation, since OBV fell while price rose',
          ],
          answerIdx: 2,
          explain:
            'The observation is real — 2.9M shares on the up days against 4.0M on the down days — and it says participation did not support the advance. But divergences of this kind persist for months and resolve in both directions, so it is a reason to watch rather than an instruction, and OBV does not lead anything.',
        },
        {
          id: 'u10-l09-q3',
          prompt: 'What is the main crudeness in OBV’s construction?',
          choices: [
            'It ignores volume entirely on unchanged days',
            'It uses the open rather than the close',
            'It cannot be computed on daily data',
            'It treats direction as binary — a 0.05% up close adds the full day’s volume, exactly as a 7% one would',
          ],
          answerIdx: 3,
          explain:
            'Assigning the entire day’s volume by the sign of the close, regardless of magnitude, throws away most of the information in the move — which is exactly what Accumulation/Distribution improves on by weighting volume by where in the range the close landed. Carrying the total forward on unchanged days is a minor detail, and OBV is computed from daily closes as standard.',
        },
        {
          id: 'u10-l09-q4',
          prompt:
            'A stock traded 45M shares between $46 and $52 and only 4M between $52 and $58. What does volume-by-price tell you?',
          choices: [
            'A high-volume node below acts as a level with accumulated inventory; the thin zone above is open air price can move through quickly',
            'The $52–58 zone is stronger resistance, since less volume means fewer buyers',
            'The stock is illiquid above $52 and should not be traded',
            'Nothing, since volume-by-price only works on intraday charts',
          ],
          answerIdx: 0,
          explain:
            'Heavy volume means many positions were established there, so many participants care what happens at that price — the arithmetic version of Unit 8’s support and resistance — while a thin zone has little inventory to absorb a move. A low-volume node is a fast zone, not strong resistance, and the technique applies on any timeframe.',
        },
      ],
      cardSeeds: [
        {
          id: 'u10-l09-c1',
          kind: 'cloze',
          front:
            'OBV: ____ the day’s volume when the close is up, ____ it when the close is down. Only its ____ and its divergence from price carry information — the ____ is meaningless.',
          back: 'add; subtract; slope; level',
        },
        {
          id: 'u10-l09-c2',
          kind: 'basic',
          front: 'What do high- and low-volume nodes mean in volume-by-price?',
          back: 'High-volume node: many positions established at that price, so it behaves as a level. Low-volume node: little accumulated inventory, so price tends to travel through it quickly.',
        },
        {
          id: 'u10-l09-c3',
          kind: 'basic',
          front: 'Why can no volume indicator identify "smart money"?',
          back: 'There is no field in the data marked institutional; OBV just assigns the day’s volume by the sign of the close. And roughly 40–50% of US share volume prints off-exchange, where large orders are specifically trying not to be seen.',
        },
      ],
    },

    // ── L10 ───────────────────────────────────────────────────────────────
    {
      id: 'u10-l10',
      unitId: 'u10',
      order: 10,
      title: 'Indicator Pitfalls & Synthesis',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**Redundancy is the first and biggest trap.** Consider a screen showing six indicators, all bullish:

RSI(14) rising · Stochastic(14) rising · Williams %R(14) rising · CCI(20) rising · ROC(12) positive · MACD histogram expanding

That looks like six confirmations. It is **one observation, restated six times**. Every one of those is a momentum transform of the same closes over roughly the same window; their pairwise correlations routinely run **0.8 to 0.95**. If price has been rising for three weeks, all six *must* be bullish — they are arithmetically compelled to be.

The consequence is not merely wasted screen space. It is **false confidence**: six agreeing indicators feel like independent evidence, and independent evidence is what justifies a larger position. Sizing up because your dashboard is unanimous is sizing up on a single input you have counted six times.

**The test:** for any two indicators, ask what *quantity* each measures. If the answer is the same quantity — direction of recent price change, dispersion of recent closes, participation — you have one input.`,
        },
        {
          kind: 'text',
          md: `**Curve-fitting, scaled up.** Lesson 1 showed 8,000 combinations of a single RSI rule. A realistic "system" is worse.

Take five parameters — a fast average, a slow average, an RSI lookback, an entry threshold, an exit threshold — with twenty plausible settings each. That is **20⁵ = 3,200,000 combinations**. Test them on ten years of daily data and the best performer will show a spectacular equity curve. It will also be, almost entirely, a description of the specific sequence of noise in that decade.

Three defences worth actually applying:

1. **Count your parameters, out loud.** Every knob multiplies the search space. A rule with two parameters is a hypothesis; a rule with seven is a curve drawn through your sample.
2. **Hold data back.** Fit on one period, test on another you have never looked at. If the result collapses, it was fitted — and it usually collapses.
3. **Demand a mechanism.** "Price above the 200-day means institutions have been net buyers for months" is a story you can evaluate. "RSI(11) crossing 27" is not a story at all, and rules without mechanisms are the ones that stop working the moment you commit money.`,
        },
        {
          kind: 'example',
          md: `**One stock, two screens.** A **$61.40** stock has risen from **$52.00** over eighteen sessions. Its 20-day SMA is **$57.10**, its 50-day **$54.80**, its 200-day **$49.30** and rising. ATR(14) is **$1.70**. Yesterday's volume was **3.4M** against a 50-day average of **1.5M**.

*Screen one — the beginner's dashboard.* RSI(14) **72**, Stochastic(14) **88**, Williams %R **−9**, CCI(20) **+164**, ROC(12) **+18%**, MACD histogram expanding, price above all three averages, riding the upper Bollinger band. Eleven lines, and every one of them bullish.

But count the *quantities*: RSI, stochastics, %R, CCI, ROC and the MACD histogram are six views of "the last three weeks were strongly up" — they could not have printed anything else given an $52 → $61.40 advance. The three averages are three views of "price is above its recent means". The band position is a fourth view of the same advance. **Eleven lines, three quantities, and the momentum family counted six times.**

*Screen two — the four-instrument toolkit.* Price above a **rising 200-day** (trend: long setups only). RSI **72** (momentum: extended, and in an uptrend the 40–80 range means 72 is not a sell). ATR **$1.70** (a 2.5 × ATR stop is **$4.25**, so a $300 risk budget buys **70 shares**, a **$4,298** position). Volume **2.3×** its average (participation: real). Four numbers, four different questions, and the sizing arithmetic falls out of one of them.

**A minimal toolkit — four instruments, four different quantities.**

| Instrument | Measures | Question it answers |
|---|---|---|
| **200-day moving average** (and price's position vs it) | trend regime | Which direction of setup am I willing to take? |
| **One momentum measure** — RSI(14) *or* MACD, not both | speed of recent change | Is the move accelerating or decelerating? |
| **ATR(14)** | volatility | Where does the stop go, and how many shares? |
| **Volume vs its own 50-day average** | participation | Did anyone show up for this move? |

Four numbers. Each measures something the other three do not, so agreement between them is genuine corroboration rather than an echo.

Compare against a typical beginner's screen: 20/50/200 SMAs, RSI, stochastics, MACD, CCI, Bollinger Bands, and a volume overlay — **eleven** lines measuring **three** distinct quantities, with the momentum family counted five times over. The problem is not that any individual indicator is bad; it is that the arrangement systematically misrepresents how much independent evidence is present.`,
        },
        {
          kind: 'text',
          md: `**Checklists over dashboards.** A dashboard is passive and always on, which means it produces an impression rather than a decision. A checklist forces a discrete answer and leaves a record:

> **Regime:** is price above a rising 200-day? ☐ yes ☐ no
> **Location:** is the setup at a level that mattered before? ☐ yes ☐ no
> **Pattern:** what is it, and could I have drawn it before the last pivot? ☐
> **Participation:** is breakout volume ≥ 1.5× the 50-day average? ☐ yes ☐ no
> **Invalidation:** what price says I am wrong? **$____**
> **Size:** risk budget ÷ per-share risk = **____ shares**
> **Target region:** measured move, and the first real level before it. **$____ – $____**

Three properties make this better than any screen of oscillators. It is **falsifiable** — boxes fail. It is **reviewable** — in three months you can see which boxes were unticked on your losers. And it puts **invalidation and size in writing before entry**, which is the one structural defence against hindsight bias from Unit 8.

If a checklist ever conflicts with a dashboard, follow the checklist. The dashboard is measuring three things and showing you eleven.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "More indicators means more confirmation."

Adding a correlated indicator adds confidence without adding information — which is strictly worse than adding nothing, because confidence drives position size. The honest version is uncomfortable: beyond roughly four instruments measuring genuinely different quantities, additional indicators reduce decision quality. They increase the chance that *something* on the screen agrees with what you already wanted to do, which is a machine for manufacturing permission.`,
        },
        {
          kind: 'callout',
          md: `**The standing reminder.** This unit is educational material about how derived measures of price and volume work, not investment advice or a trading system. Indicators have no predictive power beyond what is in the price series they are computed from, and the evidence that indicator-based rules beat a low-cost diversified portfolio after costs and taxes is weak. Learn the arithmetic so you can evaluate claims — most of which, once you can compute the indicator yourself, turn out to be claims about a moving average.`,
        },
        {
          kind: 'keypoint',
          md: `Most indicator screens count one input several times: momentum transforms correlate 0.8–0.95, so six agreeing oscillators are one observation with false confidence attached. Count parameters (20⁵ = 3.2M combinations is a curve, not a hypothesis), hold data back, and demand a mechanism. A sensible toolkit is four instruments measuring four different quantities — trend, momentum, volatility, participation — driven by a written checklist that records invalidation and size before entry.`,
        },
        {
          kind: 'text',
          md: `**Where this leaves you.** Three units of chart reading reduce to a short and slightly deflating summary: price and volume are a record of crowd behaviour; patterns and indicators are two ways of compressing that record; the compression adds no information; and the only durable deliverables are a **defined invalidation level** and the **position size** that follows from it.

That last pairing — invalidation and size — is exactly where the risk-management unit picks up. ATR sizing from Lesson 8 is the first brick of it; what follows builds out portfolio-level risk, correlation between positions, drawdown arithmetic, and the rules that keep a run of ordinary losses from becoming an unrecoverable one.`,
        },
      ],
      quiz: [
        {
          id: 'u10-l10-q1',
          prompt:
            'RSI, stochastics, Williams %R, CCI, ROC and the MACD histogram are all bullish. How much independent evidence is that?',
          choices: [
            'Essentially one observation — they are momentum transforms of the same closes, correlating roughly 0.8–0.95',
            'Six independent confirmations, which justifies a larger position',
            'Three confirmations, since they come from three indicator families',
            'None — agreement between indicators is always meaningless',
          ],
          answerIdx: 0,
          explain:
            'All six are computed from the same recent closes over similar windows, so if price has risen for three weeks they are arithmetically compelled to agree — that is one input counted six times. The danger is precisely the sizing-up impulse: unanimity feels like independent evidence, which is what justifies larger positions, and here it is an echo rather than corroboration.',
        },
        {
          id: 'u10-l10-q2',
          prompt: 'A system has five parameters with twenty plausible settings each. What is the problem with reporting the best result?',
          choices: [
            'Five parameters is too few to capture market behaviour',
            'The settings should be optimised jointly rather than individually',
            'Twenty settings per parameter is too coarse a grid',
            'It is the best of 3.2 million combinations — largely a description of the noise in that particular decade',
          ],
          answerIdx: 3,
          explain:
            'Twenty to the fifth power is 3,200,000 variants, and the maximum of that many draws looks spectacular even on data with no exploitable structure. Finer grids or joint optimisation search *more* combinations and make the problem worse; the defences are fewer parameters, held-back data, and a mechanism you can state in words.',
        },
        {
          id: 'u10-l10-q3',
          prompt: 'What defines a sensible minimal indicator toolkit?',
          choices: [
            'One indicator from each of the ten major families',
            'Four instruments measuring genuinely different quantities: trend, momentum, volatility and participation',
            'As many as your screen can display, so nothing is missed',
            'Whichever combination scored best in a backtest',
          ],
          answerIdx: 1,
          explain:
            'A 200-day average, one momentum measure, ATR and volume against its own average each answer a question the others cannot, so their agreement is real corroboration. Maximising coverage duplicates the momentum family several times over, and selecting the combination that scored best in a backtest is the curve-fitting failure this lesson exists to warn against.',
        },
        {
          id: 'u10-l10-q4',
          prompt: 'Why is a written checklist better than a dashboard of indicators?',
          choices: [
            'Checklists are faster to read during volatile markets',
            'Dashboards are less accurate because of rendering lag',
            'It forces falsifiable answers, leaves a reviewable record, and puts invalidation and size in writing before entry',
            'Checklists eliminate losing trades by catching errors',
          ],
          answerIdx: 2,
          explain:
            'Boxes can fail, the record can be reviewed against your actual losers months later, and committing the invalidation level and share count before entry is the structural defence against hindsight bias from Unit 8. A dashboard produces an impression rather than a decision — and no checklist eliminates losses, since losses are the normal cost of a probabilistic method.',
        },
        {
          id: 'u10-l10-q5',
          prompt: 'What is the strongest argument against adding a seventh indicator to a screen?',
          choices: [
            'It adds confidence without adding information, and confidence drives position size',
            'Screen space is limited on most trading platforms',
            'Each additional indicator slows the platform’s calculations',
            'Seven is above the limit of human working memory',
          ],
          answerIdx: 0,
          explain:
            'A correlated addition changes nothing about the evidence while raising your subjective certainty, and certainty is what determines how much you risk — so it is strictly worse than adding nothing. It also raises the chance that *something* on the screen agrees with what you already wanted to do, which manufactures permission rather than analysis.',
        },
      ],
      cardSeeds: [
        {
          id: 'u10-l10-c1',
          kind: 'basic',
          front: 'How do you test whether two indicators are redundant?',
          back: 'Ask what quantity each measures. If both measure the same thing — direction of recent price change, dispersion of recent closes, participation — you have one input, however different the pictures look. Momentum transforms typically correlate 0.8–0.95.',
        },
        {
          id: 'u10-l10-c2',
          kind: 'cloze',
          front:
            'Five parameters with twenty settings each gives ____ combinations; the best of them describes the ____ in your sample. Defences: count ____, hold back ____, and demand a ____.',
          back: '3.2 million (20⁵); noise; parameters; data; mechanism',
        },
        {
          id: 'u10-l10-c3',
          kind: 'basic',
          front: 'Name the four-instrument minimal toolkit and what each measures.',
          back: '200-day moving average (trend regime), one momentum measure — RSI or MACD, not both (acceleration), ATR (volatility, for stop and size), and volume against its own 50-day average (participation).',
        },
        {
          id: 'u10-l10-c4',
          kind: 'basic',
          front: 'Why does a checklist beat a dashboard?',
          back: 'It is falsifiable (boxes fail), reviewable (you can see which boxes were unticked on your losers), and it records the invalidation level and position size before entry — the structural defence against hindsight bias.',
        },
      ],
    },
  ],
}
