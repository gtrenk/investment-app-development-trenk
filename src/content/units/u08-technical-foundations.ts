import type { Unit } from '@core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Unit 08 — Technical Foundations
// The theory behind the pattern and what-next drills. Price and volume as a
// record of crowd behaviour: candles, timeframes, trend, levels, participation,
// gaps and volatility — read as probabilities and risk framing, never as
// prophecy. Branches from Mechanics (u02) in parallel with the fundamental
// track, because reading a chart needs the plumbing and nothing else.
// ─────────────────────────────────────────────────────────────────────────────

export const u08: Unit = {
  id: 'u08',
  title: 'Technical Foundations',
  order: 8,
  description:
    'Read a price chart honestly: candlestick anatomy, timeframes and scales, trend, support and resistance zones, what volume does and does not confirm, gaps and volatility — and how to turn all of it into probabilities rather than predictions.',
  unlockAfter: 'u02',
  lessons: [
    // ── L01 ───────────────────────────────────────────────────────────────
    {
      id: 'u08-l01',
      unitId: 'u08',
      order: 1,
      title: 'What Technical Analysis Is (and Isn’t)',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**Technical analysis** is the study of a security's own trading record — price and volume over time — to estimate the *probability* of what happens next and to decide where risk sits.

That is the whole definition. It contains no claim that the future is knowable. Compare it with the fundamental track:

| | Fundamental analysis | Technical analysis |
|---|---|---|
| Raw material | Filings, cash flows, competitive position | Price, volume, time |
| Question asked | *What is this business worth?* | *What are participants doing, and where is my risk?* |
| Natural horizon | Years | Days to months |`,
        },
        {
          kind: 'text',
          md: `**The honest case for it.** Two arguments hold up reasonably well:

1. **Price aggregates behaviour.** Every tick is the outcome of real money changing hands. Buyers and sellers carry memories, anchors, stop orders, margin calls, and mandates — and those pressures repeat, because human beings and institutional plumbing repeat. A chart is a record of that crowd, not of the company.
2. **It frames risk.** A chart gives you *specific* levels: a place where your idea is wrong, a distance from entry to that place, and therefore a position size. "I'm wrong below $58" is an operationally useful sentence in a way that "the stock seems expensive" is not.

Some of this has academic support. Cross-sectional **momentum** — winners over 6–12 months tending to keep winning for a while — is one of the most replicated anomalies in finance. That is far weaker than "chart patterns predict prices", but it is not nothing.`,
        },
        {
          kind: 'text',
          md: `**The honest limits.** Four of them, and none is optional:

- **No crystal ball.** Every pattern is a distribution of outcomes, not an outcome. The best documented setups resolve as advertised only somewhat more often than not — and often by a margin smaller than trading costs.
- **Charts are self-reported by the past.** A pattern you can see is a pattern thousands of algorithms already saw. Any edge that was ever obvious has been arbitraged toward zero.
- **Hindsight makes everything look easy.** On a completed chart the signal is unmissable. In real time, the same bar sits at the right-hand edge with nothing to its right.
- **It says nothing about value.** A chart cannot tell you a company is diluting shareholders, burning cash, or facing a patent cliff.`,
        },
        {
          kind: 'example',
          md: `**The same tool, two outcomes.** A stock falls from **$40** to **$28** over four months, then goes quiet: six weeks oscillating between **$28** and **$30** on shrinking volume. It closes at **$30.60** on volume three times its recent average.

- *What the chart tells you:* participation returned exactly where sellers had been in control, and there is a natural "I'm wrong" level just under **$28**. Entry $30.60, invalidation $27.80 — risk is about **9%** per share, so a 1%-of-portfolio risk budget implies a specific position size.
- *What the chart does not tell you:* whether it works. In one version the stock runs to **$38**. In another it closes back at **$29.20** three days later and grinds to **$24**.

Both versions are ordinary. The setup was never a prediction; it was a **structured bet with a known loss**. The second version is not a failure of the method — it is the method working as designed, and the reason position sizing exists.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Technical analysis predicts where the stock is going."

It does not, and anyone selling it that way is selling something else. What it offers is conditional probability plus a defined risk point: *given this structure, the odds of continuation are somewhat better than the odds of reversal, and here is where I'll admit I was wrong.* Treat any indicator, pattern, or newsletter promising accuracy above roughly 60% on liquid markets as a claim about marketing, not about markets.`,
        },
        {
          kind: 'text',
          md: `**Why combining beats either alone.** The two disciplines answer different questions, so they compose rather than compete:

- Fundamentals answer **what** to own and roughly what it's worth — but give you nothing about entry, exit, or how much pain to tolerate before conceding.
- Technicals answer **where** risk sits and **when** the crowd has changed its mind — but will happily hand you a beautiful setup in a company that is quietly insolvent.

A workable synthesis for a beginner: let fundamentals build the shortlist, let the chart decide the entry, the invalidation level, and the size. Neither discipline rescues a bad decision in the other.`,
        },
        {
          kind: 'keypoint',
          md: `Technical analysis reads price and volume as a record of crowd behaviour to estimate probabilities and locate risk — not to predict. Its real deliverable is a defined invalidation level, which is what makes position sizing possible. Fundamentals choose the *what*; the chart informs the *where* and *how much*.`,
        },
      ],
      quiz: [
        {
          id: 'u08-l01-q1',
          prompt: 'Which best describes what technical analysis actually claims to do?',
          choices: [
            'Determine the intrinsic value of a business from its cash flows',
            'Predict future prices with high accuracy from repeating chart shapes',
            'Estimate probabilities of what happens next and define where risk sits',
            'Identify accounting fraud before it becomes public',
          ],
          answerIdx: 2,
          explain:
            'The defensible claim is conditional and probabilistic: given this structure, continuation is somewhat more likely than reversal, and here is the level that says I was wrong. The "high accuracy prediction" answer is the version sold by marketers — believing it is what leads people to size positions as if the outcome were known. Valuation and fraud detection are fundamental-track work; a chart contains no accounting data at all.',
        },
        {
          id: 'u08-l01-q2',
          prompt:
            'What is the strongest honest argument that price history carries any information at all?',
          choices: [
            'Every trade reflects real money and real behavioural pressures, and those pressures repeat',
            'Chart patterns are enforced by exchange rules',
            'Prices follow mathematical shapes that recur exactly',
            'Institutional traders are contractually required to respect trendlines',
          ],
          answerIdx: 0,
          explain:
            'Price is the output of participants acting under memory, anchoring, stop orders, margin calls, and mandates — recurring pressures that leave recurring footprints. Nothing enforces a pattern: shapes recur approximately because behaviour recurs approximately, which is precisely why every pattern is a distribution rather than a rule.',
        },
        {
          id: 'u08-l01-q3',
          prompt:
            'You enter at $30.60 with an invalidation level just below $27.80, and the stock instead closes back at $29.20 and drifts to $24. What does this most likely indicate?',
          choices: [
            'The chart was read incorrectly; a correct reading would have avoided the loss',
            'Technical analysis does not work and should be abandoned',
            'The invalidation level was set too tight',
            'A normal outcome — the setup was a probabilistic bet with a known maximum loss',
          ],
          answerIdx: 3,
          explain:
            'Even a genuinely favourable setup loses a large share of the time; a single loss carries almost no information about whether the method has an edge. That is exactly why the invalidation level was chosen in advance — it converts an unknowable outcome into a bounded one. Concluding "I read it wrong" after any loss is hindsight bias, and it pushes people toward ever more elaborate readings of noise.',
        },
        {
          id: 'u08-l01-q4',
          prompt:
            'Which market effect gives technical thinking its most replicated academic support?',
          choices: [
            'The January effect in large-cap indices',
            'Cross-sectional momentum — 6–12 month winners tending to keep winning',
            'The reliability of head-and-shoulders reversals',
            'The tendency of all price gaps to be filled',
          ],
          answerIdx: 1,
          explain:
            'Momentum is one of the most widely replicated anomalies across markets and decades, and it is a genuinely price-based effect. Specific chart shapes have far weaker and noisier support, and "all gaps get filled" is folklore rather than a finding — treating the strong evidence and the folklore as equally solid is how a probabilistic tool becomes superstition.',
        },
        {
          id: 'u08-l01-q5',
          prompt: 'Why does combining fundamental and technical analysis tend to beat either alone?',
          choices: [
            'Using two methods doubles the statistical confidence of a signal',
            'Technical analysis validates the accounting figures in the filings',
            'They answer different questions: what to own versus where risk sits and when the crowd shifted',
            'Fundamentals work in bull markets and technicals work in bear markets',
          ],
          answerIdx: 2,
          explain:
            'The disciplines are complementary because their inputs and questions barely overlap — valuation says nothing about entry or invalidation, and a chart says nothing about solvency. Stacking two methods does not multiply confidence: if both are reading the same crowd, their errors are correlated, and a great chart on a failing business is still a failing business.',
        },
      ],
      cardSeeds: [
        {
          id: 'u08-l01-c1',
          kind: 'basic',
          front: 'Define technical analysis in one sentence.',
          back: 'The study of a security’s own price and volume history to estimate the probability of what happens next and to locate a specific level where the idea is wrong.',
        },
        {
          id: 'u08-l01-c2',
          kind: 'cloze',
          front:
            'Technical analysis produces ____, not predictions — and its most useful output is a defined ____ level, which is what makes position sizing possible.',
          back: 'probabilities; invalidation (risk / stop) level',
        },
        {
          id: 'u08-l01-c3',
          kind: 'basic',
          front: 'Name the four honest limits of technical analysis.',
          back: 'No crystal ball (distributions, not outcomes); any obvious edge is already arbitraged; hindsight makes past charts look far easier than the live right-hand edge; and it carries no information about business value.',
        },
        {
          id: 'u08-l01-c4',
          kind: 'basic',
          front: 'How do the fundamental and technical tracks divide the work?',
          back: 'Fundamentals decide *what* to own and roughly what it is worth; the chart informs *where* risk sits, *when* the crowd changed its mind, and therefore *how much* to size.',
        },
      ],
    },

    // ── L02 ───────────────────────────────────────────────────────────────
    {
      id: 'u08-l02',
      unitId: 'u08',
      order: 2,
      title: 'Reading Candlesticks',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Each candle compresses one period — one day on the app's daily charts — into four numbers, **OHLC**:

- **Open** — first traded price of the period.
- **High** — the highest price traded.
- **Low** — the lowest price traded.
- **Close** — the final traded price. The most informative of the four, because it is where participants were willing to hold overnight.

The **real body** is the thick block between open and close. The **wicks** (also called shadows or tails) are the thin lines out to the high and the low.

In this app a candle is drawn **green** when the close is above the open and **red** when the close is below it — colour encodes open-to-close direction only. A green candle can still close well below yesterday's close.`,
        },
        {
          kind: 'text',
          md: `Body and wick answer two different questions:

- **Body length = conviction.** A long body means one side controlled the whole period. A tiny body means the period ended roughly where it began, whatever happened in between.
- **Wick length = rejection.** A long wick marks a price area the market visited and then abandoned. A long *upper* wick says buyers pushed up there and sellers forced price back down — higher prices were rejected. A long *lower* wick says the reverse.

Three shapes worth naming:

- **Doji** — open and close nearly equal, so the body is a thin line. Indecision, or a genuine balance of pressure.
- **Hammer** — small body near the top of the range with a long lower wick (roughly twice the body or more). Sellers pressed and lost the ground back. Its meaning depends entirely on appearing *after a decline*.
- **Engulfing** — a body that completely covers the previous candle's body in the opposite colour. A bullish engulfing candle after a downswing says the day's buyers overwhelmed the previous day's sellers.`,
        },
        {
          kind: 'example',
          md: `**Reading four days literally.**

| Day | Open | High | Low | Close | Shape |
|---|---|---|---|---|---|
| Mon | $50.00 | $54.00 | $49.60 | $50.20 | tiny green body, long upper wick |
| Tue | $50.10 | $50.40 | $47.90 | $48.10 | long red body |
| Wed | $48.00 | $48.30 | $44.90 | $47.80 | small body, long lower wick (hammer) |
| Thu | $47.70 | $51.60 | $47.50 | $51.40 | long green body engulfing Wednesday |

**Monday** rose nearly 8% intraday to $54.00 and gave essentially all of it back — a **$3.80 upper wick** against a **$0.20 body**. It closed green, and it was a bad day: buyers who paid $53 were all underwater by the close.

**Wednesday** fell to $44.90 and closed at $47.80 — a **$2.90 lower wick**. Someone absorbed everything sellers had below $46.

**Thursday's** body ($47.70→$51.40) fully covers Wednesday's, in the opposite colour: a bullish engulfing candle.

Now the honest part: this exact sequence appears constantly and resolves both ways. It says *pressure shifted*, not *the bottom is in*.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "A hammer means buy."

Single candles are the weakest evidence on a chart. A hammer in the middle of a range is noise; the same shape after an extended decline, at a level that mattered before, on heavy volume, is a *modest* piece of evidence. Three rules keep candle reading honest: (1) location beats shape — where it forms matters more than what it looks like; (2) confirmation is the next candle, not this one; (3) on a very thin stock, a "hammer" can be one 300-share print at a silly price.`,
        },
        {
          kind: 'callout',
          md: `**Colour trap.** Green means close above *open*, not close above *yesterday's close*. A stock that gaps down from $60 to $54, then rallies to close at $55, prints a green candle on a day it fell 8%. Judge the day by the close-to-close change and by where the body sits in the range — never by colour alone.`,
        },
        {
          kind: 'keypoint',
          md: `Body = conviction (open-to-close), wick = rejection (visited and abandoned). Doji is indecision, hammer is a rejected low after a decline, engulfing is one side overwhelming the previous period. Location and confirmation matter more than the shape itself.`,
        },
      ],
      quiz: [
        {
          id: 'u08-l02-q1',
          prompt:
            'A daily candle opens at $50.00, trades as high as $54.00 and as low as $49.60, and closes at $50.20. What does its long upper wick tell you?',
          choices: [
            'Buyers pushed price up to $54.00 but sellers forced it back — higher prices were rejected',
            'The stock closed at its high for the day',
            'Trading was halted near $54.00',
            'The stock gapped up at the open',
          ],
          answerIdx: 0,
          explain:
            'The wick marks territory the market visited and abandoned: price reached $54.00 and finished at $50.20, so everyone who bought near the high ended the day underwater. Reading it as strength because the candle is green is the classic error — the $3.80 wick dwarfs the $0.20 body, and the body is the only part that shows conviction.',
        },
        {
          id: 'u08-l02-q2',
          prompt: 'In this app, when is a candle drawn green?',
          choices: [
            'When the close is above the previous day’s close',
            'When volume rose versus the previous day',
            'When the close is above the 50-day moving average',
            'When the close is above that same candle’s open',
          ],
          answerIdx: 3,
          explain:
            'Candle colour encodes open-to-close direction within the single period, nothing else. This matters after a gap: a stock that opens at $54 following a $60 close and finishes at $55 prints a green candle on a day it fell 8%, so colour alone can invert your read of the day.',
        },
        {
          id: 'u08-l02-q3',
          prompt: 'What does a doji candle indicate?',
          choices: [
            'A guaranteed trend reversal',
            'The period opened and closed at nearly the same price — indecision or balanced pressure',
            'A day with no trading volume',
            'That the close was far above the open',
          ],
          answerIdx: 1,
          explain:
            'A doji has a near-zero body: whatever the range, the period ended where it began, so neither side finished in control. Calling it a reversal signal overstates it — a doji is a pause, and it becomes weak evidence for a turn only when it appears after an extended move at a level that already mattered.',
        },
        {
          id: 'u08-l02-q4',
          prompt:
            'Wednesday runs $48.00 open, $44.90 low, $47.80 close. Thursday opens $47.70 and closes $51.40. What is Thursday’s candle called relative to Wednesday’s?',
          choices: [
            'A doji',
            'An exhaustion gap',
            'A bullish engulfing candle',
            'A hammer',
          ],
          answerIdx: 2,
          explain:
            'Thursday’s body ($47.70→$51.40) completely covers Wednesday’s body in the opposite colour, which is the definition of engulfing — the day’s buyers overwhelmed the prior day’s sellers. Wednesday is the hammer in this sequence, and nothing gapped: Thursday opened inside Wednesday’s range.',
        },
        {
          id: 'u08-l02-q5',
          prompt: 'Which statement about single-candle signals is most defensible?',
          choices: [
            'Location and confirmation matter more than the shape itself',
            'A hammer is a reliable buy signal wherever it appears',
            'Engulfing candles reverse trends roughly 90% of the time',
            'Candle shapes are equally meaningful in liquid and illiquid stocks',
          ],
          answerIdx: 0,
          explain:
            'A shape is only weak evidence until you know where it formed and what the next candle did — the same hammer is meaningless mid-range and modestly informative after an extended decline at a prior level. Illiquidity makes it worse still: in a thin name a single small print can manufacture a textbook wick out of nothing.',
        },
      ],
      cardSeeds: [
        {
          id: 'u08-l02-c1',
          kind: 'cloze',
          front:
            'A candle’s real ____ shows conviction (open to close); its ____ show rejection — price levels visited and abandoned.',
          back: 'body; wicks (shadows/tails)',
        },
        {
          id: 'u08-l02-c2',
          kind: 'basic',
          front: 'What makes a candle green in this app?',
          back: 'Close above the *open* of that same candle. Not close above the previous close — after a gap down, a green candle can still be a large down day.',
        },
        {
          id: 'u08-l02-c3',
          kind: 'basic',
          front: 'Doji, hammer, engulfing — define each.',
          back: 'Doji: open ≈ close, tiny body, indecision. Hammer: small body near the top with a long lower wick after a decline — a rejected low. Engulfing: a body that fully covers the prior body in the opposite colour.',
        },
        {
          id: 'u08-l02-c4',
          kind: 'basic',
          front: 'Three rules that keep candle reading honest',
          back: 'Location beats shape; confirmation comes from the next candle, not this one; and in illiquid names a single odd print can fabricate a textbook shape.',
        },
      ],
    },

    // ── L03 ───────────────────────────────────────────────────────────────
    {
      id: 'u08-l03',
      unitId: 'u08',
      order: 3,
      title: 'Timeframes & Chart Types',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `A chart has no single true resolution. Each bar aggregates a period, and choosing the period chooses what you can see and what you erase.

- **Intraday (1-, 5-, 60-minute)** — the texture of a single session. Mostly noise for anyone holding longer than a day.
- **Daily** — the standard unit for swing horizons of days to months. The app's drill charts are daily bars.
- **Weekly** — one bar per week. Kills roughly 80% of the wiggles and leaves the structure that lasts quarters.
- **Monthly** — the multi-year picture, useful for locating decade-old levels.

The rule of thumb: your chart period should be roughly one-fifth to one-tenth of your intended holding period. Trading a two-month idea off a 5-minute chart guarantees you will be shaken out by noise you should never have seen.`,
        },
        {
          kind: 'example',
          md: `**One stock, three verdicts.** A stock closed last Friday at **$92**, having been at **$100** the previous Friday.

- **5-minute chart:** the last two sessions are a staircase of lower highs, red bar after red bar. Reads like a collapse.
- **Daily chart:** five consecutive down days from $100 to $92, an **8%** drawdown. Reads like a sharp correction.
- **Weekly chart:** one red bar. Behind it, weekly closes over the past year run **$54 → $61 → $58 → $73 → $79 → $71 → $100 → $92**. Every pullback so far has bottomed above the previous one. Reads like an ordinary pullback inside a strong uptrend.

None of the three is lying. The 8% fall is real; so is the fact that it is the fourth such pullback in a year and the smallest in percentage terms. The mistake is not picking the wrong timeframe — it is looking at only one.`,
        },
        {
          kind: 'text',
          md: `**Chart types.** A **line chart** connects closing prices only. It throws away the open, high, and low — which is exactly why it is good for seeing structure over years without intraday noise shouting at you. A **candlestick chart** keeps all four prices and shows the fight inside each period. Use candles when the question is *what is happening now*, lines when the question is *what is the shape of the last five years*.

**Scale matters more than most beginners realise.** On a **linear** scale, equal vertical distance means equal *dollar* change. On a **logarithmic** scale, equal vertical distance means equal *percentage* change.`,
        },
        {
          kind: 'example',
          md: `**Why long charts belong on a log scale.** Consider a stock that goes **$10 → $20** and later **$200 → $400**. Both are a 100% gain and both double your money.

- **Linear:** the first move is a **$10** rise; the second is a **$200** rise, drawn twenty times taller. The early years are squashed into an invisible flat line, and every trendline you draw across them is meaningless.
- **Log:** both moves are the same height. A steady 15%-a-year compounder plots as a straight line rather than a hockey stick.

The practical consequence: on a multi-year linear chart, almost any long-term holding looks like a bubble that "just went parabolic". That impression is an artefact of the axis, not of the stock.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Zooming in gives me more information."

A shorter timeframe gives you more *data points*, and the extra points are mostly noise — the signal-to-noise ratio falls as you zoom in, it does not rise. The related trap is **timeframe shopping**: flipping through periods until one of them agrees with the position you already want to take. Decide your holding period first, pick the matching chart period, then check one step up for context — and let that order stand.`,
        },
        {
          kind: 'keypoint',
          md: `Match chart period to holding period (roughly 1/5 to 1/10 of it), then check one timeframe up for context. Line charts show long-run structure, candles show the current fight. Use log scale for any multi-year chart: equal height = equal percentage, which is what compounding actually looks like.`,
        },
      ],
      quiz: [
        {
          id: 'u08-l03-q1',
          prompt:
            'A stock fell from $100 to $92 over five days. The weekly chart shows closes of $54, $61, $58, $73, $79, $71, $100, $92 over the past year. What is the most complete reading?',
          choices: [
            'The uptrend has ended, since the most recent weekly bar is red',
            'An 8% pullback inside an uptrend that has made a series of higher lows',
            'The daily chart is wrong and only the weekly matters',
            'Nothing can be concluded without intraday data',
          ],
          answerIdx: 1,
          explain:
            'Both facts are true at once: the 8% drop is real, and it is the fourth pullback in a year within a sequence of higher lows. Declaring the trend over on one red weekly bar mistakes a single period for a structural change — and no timeframe is "wrong", they simply answer different questions, which is why you read at least two.',
        },
        {
          id: 'u08-l03-q2',
          prompt: 'On a logarithmic price scale, equal vertical distances represent what?',
          choices: [
            'Equal dollar changes',
            'Equal trading volume',
            'Equal time intervals',
            'Equal percentage changes',
          ],
          answerIdx: 3,
          explain:
            'A log axis plots proportional change, so $10→$20 occupies the same height as $200→$400 — both are 100%. Equal dollar changes is the linear scale, which is what squashes early years into a flat line and makes ordinary compounding look parabolic on a ten-year chart.',
        },
        {
          id: 'u08-l03-q3',
          prompt: 'What does a line chart deliberately discard, and why is that sometimes useful?',
          choices: [
            'The open, high, and low — leaving closing structure visible without intraday noise',
            'Volume — leaving price uncluttered',
            'Every price except the weekly high, making trends clearer',
            'Dividends and splits, giving a cleaner raw price',
          ],
          answerIdx: 0,
          explain:
            'A line chart connects closes and drops the other three OHLC prices, which strips out intraday churn and makes multi-year structure legible. Volume is a separate overlay entirely, and corporate actions are handled by adjusting the data, not by the chart type — conflating the two leads people to read unadjusted split gaps as real crashes.',
        },
        {
          id: 'u08-l03-q4',
          prompt:
            'You plan to hold a position for roughly two months. Which chart period is the sensible primary, and what is the risk of going much shorter?',
          choices: [
            '1-minute; shorter periods always reveal more signal',
            'Monthly; two months is too short to appear on a daily chart',
            'Daily, with a weekly check for context; much shorter periods mostly add noise you will react to',
            'Weekly only; any daily movement is irrelevant to a two-month hold',
          ],
          answerIdx: 2,
          explain:
            'A chart period around one-fifth to one-tenth of the holding period keeps the structure visible without inviting reaction to noise — daily for a two-month idea, with weekly for context. Zooming to one minute adds data points whose signal-to-noise ratio is far worse, and the predictable result is being shaken out of a thesis by movement that was never relevant to it.',
        },
      ],
      cardSeeds: [
        {
          id: 'u08-l03-c1',
          kind: 'cloze',
          front:
            'Rule of thumb: choose a chart period roughly ____ to ____ of your intended holding period, then check ____ timeframe up for context.',
          back: 'one-fifth; one-tenth; one',
        },
        {
          id: 'u08-l03-c2',
          kind: 'basic',
          front: 'Linear vs. logarithmic price scale',
          back: 'Linear: equal height = equal dollar change. Log: equal height = equal percentage change. Use log for multi-year charts, or steady compounding falsely looks parabolic.',
        },
        {
          id: 'u08-l03-c3',
          kind: 'basic',
          front: 'What is timeframe shopping, and why is it a problem?',
          back: 'Flipping between chart periods until one agrees with the trade you already wanted — confirmation bias with extra steps. Fix the holding period and chart period first, then read.',
        },
      ],
    },

    // ── L04 ───────────────────────────────────────────────────────────────
    {
      id: 'u08-l04',
      unitId: 'u08',
      order: 4,
      title: 'Trend',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Trend is the single most useful thing on a chart, and it has a definition that requires no indicator at all:

> **Uptrend** = a sequence of **higher highs and higher lows**.
> **Downtrend** = a sequence of **lower highs and lower lows**.
> Anything else = **range** or **consolidation** — and that is a legitimate third state, not a failed trend.

The app's pattern drills use exactly these labels: **Uptrend**, **Downtrend**, and **Consolidation** sit alongside the named shapes, because trend is the context every other pattern is read inside. A bull flag in a downtrend is a different proposition from a bull flag in an uptrend.`,
        },
        {
          kind: 'example',
          md: `**Counting the pivots.** A stock traces these swing points over five months:

**$20 → $24 → $22 → $28 → $25 → $33 → $29 → $36**

Highs: 24, 28, 33, 36 — each above the last. Lows: 22, 25, 29 — each above the last. That is a textbook uptrend, and it stays one until a pivot low is broken.

Now the stock falls to **$27**. The last pivot low was **$29**, so the sequence of higher lows is broken — the *first* structural damage. It is not yet a downtrend: that needs a lower high as well. If it then rallies to only **$32** (below the $36 high) and rolls over through $27, the sequence has flipped to lower highs and lower lows. Notice how much price action passed between "still an uptrend" and "confirmed downtrend": roughly **$36 → $27**, a 25% drawdown, before the label changed.`,
        },
        {
          kind: 'text',
          md: `**Trendlines.** In an uptrend, draw a line under the swing *lows*; in a downtrend, over the swing *highs*. Two points define the line; the **third touch** is what makes it worth anything, because two points can be connected on any chart.

Rules that keep trendlines honest:

- Anchor to actual pivots, not to convenient wicks, and never adjust the line after the fact to keep price above it.
- A steep line (say, 60°+) is unsustainable almost by definition and will break early.
- On any multi-year chart, draw trendlines on a **log** scale — on a linear scale the line's slope is an artefact of the axis.

**Moving averages** are the same idea, mechanised. A **50-day** simple moving average is the average close of the last 50 days, replotted daily; a **200-day** is the long-horizon version. You do not need to compute anything to use them by eye: *price above a rising average* is an uptrend, *price below a falling average* is a downtrend, and *price whipsawing across a flat average* is a range. That is 90% of what an eyeballed moving average is good for.`,
        },
        {
          kind: 'text',
          md: `**Why "the trend is your friend" has real logic.** Institutions cannot buy a $2bn position in an afternoon; they accumulate over weeks, which mechanically extends moves. Trend followers add to what is working. Index inclusion, analyst upgrades, and momentum funds pile onto the same direction. And the cross-sectional momentum effect from Lesson 1 says 6–12 month winners have historically kept winning somewhat more often than chance.

**And its failure mode.** Trends end without warning, and the whole approach has a specific, well-documented weakness: **whipsaw in ranges**. Markets spend a large fraction of their time going nowhere, and inside a range every trend signal is a false one. Trend followers survive this by accepting many small losses to catch a few large gains — a hit rate near 35–40% with a large average-win-to-average-loss ratio is normal and profitable. If you cannot tolerate being wrong most of the time, trend following will break you psychologically long before it breaks you financially.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "A broken trendline means the trend is over."

A trendline is a hand-drawn approximation, and price slicing through it is far weaker evidence than a broken *pivot low*. The structural definition — higher highs and higher lows — is what actually defines the trend; the line is a visualisation of it. Related trap: trend is only ever known with certainty in hindsight. At the right-hand edge of the chart you never know whether you are in a pullback or the first leg of a reversal, and no line drawing will tell you.`,
        },
        {
          kind: 'keypoint',
          md: `Uptrend = higher highs + higher lows; downtrend = the reverse; everything else is a range. Trendlines need a third touch to mean anything, and a broken pivot low outranks a broken line. Trend persistence is real but modest — expect frequent whipsaws in ranges and a low hit rate with large winners.`,
        },
      ],
      quiz: [
        {
          id: 'u08-l04-q1',
          prompt: 'What structurally defines an uptrend?',
          choices: [
            'Price closing above its 50-day moving average',
            'At least three touches of a rising trendline',
            'Twenty consecutive green candles',
            'A sequence of higher highs and higher lows',
          ],
          answerIdx: 3,
          explain:
            'The pivot sequence is the definition; moving averages and trendlines are only convenient visualisations of it. That distinction matters in practice: price can dip under a moving average or slice a hand-drawn line while the higher-high, higher-low structure remains fully intact.',
        },
        {
          id: 'u08-l04-q2',
          prompt:
            'A stock makes swing points $20 → $24 → $22 → $28 → $25 → $33 → $29 → $36, then falls to $27. What has happened structurally?',
          choices: [
            'A confirmed downtrend, since price fell more than 20% from the high',
            'The first structural damage — the higher-low sequence broke, but a lower high is still needed to confirm a downtrend',
            'Nothing at all; $27 is still above the original $20',
            'The uptrend is unaffected because no trendline was broken',
          ],
          answerIdx: 1,
          explain:
            'Breaking the $29 pivot low ends the higher-low sequence, which is real damage — but a downtrend requires lower highs too, so the honest label is "damaged, unconfirmed". Note how much ground passes between those states: about $36 to $27, roughly 25%, which is exactly why waiting for confirmation is expensive and acting early is unreliable.',
        },
        {
          id: 'u08-l04-q3',
          prompt: 'How many touches does a trendline need before it carries any information?',
          choices: [
            'One — the starting pivot is enough',
            'Two, since two points define a line',
            'Three — the third touch is what distinguishes a real line from an arbitrary one',
            'Five or more, or it is statistically meaningless',
          ],
          answerIdx: 2,
          explain:
            'Any two points on any chart can be connected, so a two-point line carries no information; the third touch is the first evidence that participants are actually reacting there. Demanding five touches goes too far the other way — such lines are rare, and by the time you have them the move is usually over.',
        },
        {
          id: 'u08-l04-q4',
          prompt: 'What is the best-documented failure mode of trend-following logic?',
          choices: [
            'Whipsaw — in ranging markets, every trend signal is a false one',
            'It stops working entirely once a stock pays a dividend',
            'It only works on indices, never on individual stocks',
            'Trends reverse exactly at round numbers',
          ],
          answerIdx: 0,
          explain:
            'Markets range a large fraction of the time, and inside a range each breakout signal reverses — producing a string of small losses that is the defining cost of the approach. Practitioners accept a hit rate near 35–40% precisely because of this, funding it with a few large winners; the other options describe effects that simply do not exist.',
        },
        {
          id: 'u08-l04-q5',
          prompt:
            'On a ten-year chart, why should a trendline be drawn on a logarithmic scale?',
          choices: [
            'Log scale removes the effect of dividends',
            'It is required by charting software',
            'Log scale makes volume comparable across years',
            'On a linear scale the line’s slope is an artefact of the axis, since equal heights mean unequal percentage moves',
          ],
          answerIdx: 3,
          explain:
            'A linear axis compresses early low-priced years and stretches recent ones, so a straight line drawn across a decade encodes no consistent rate of change. On a log axis a constant percentage growth rate is a straight line, which is the only thing that makes a long-horizon trendline meaningful — dividends and volume are unrelated to the choice.',
        },
      ],
      cardSeeds: [
        {
          id: 'u08-l04-c1',
          kind: 'cloze',
          front:
            'An uptrend is a sequence of ____ highs and ____ lows; a downtrend is ____ highs and ____ lows; anything else is a ____.',
          back: 'higher, higher; lower, lower; range (consolidation)',
        },
        {
          id: 'u08-l04-c2',
          kind: 'basic',
          front: 'What makes a trendline worth drawing?',
          back: 'A third touch. Two points connect on any chart; anchor to real pivots, never redraw to keep price above the line, and use a log scale on multi-year charts.',
        },
        {
          id: 'u08-l04-c3',
          kind: 'basic',
          front: 'How do you read a 50- or 200-day moving average by eye?',
          back: 'Price above a rising average = uptrend; price below a falling average = downtrend; price crossing back and forth over a flat average = range. That is most of its value.',
        },
        {
          id: 'u08-l04-c4',
          kind: 'basic',
          front: 'Why do trend followers accept a hit rate near 35–40%?',
          back: 'Ranges generate constant whipsaw losses. The approach pays for many small losses with a few very large winners, so a low win rate with a high average-win-to-loss ratio is the normal, profitable shape.',
        },
      ],
    },

    // ── L05 ───────────────────────────────────────────────────────────────
    {
      id: 'u08-l05',
      unitId: 'u08',
      order: 5,
      title: 'Support & Resistance',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**Support** is an area where buying interest has previously been strong enough to stop a decline. **Resistance** is the mirror image: an area where selling has previously stopped an advance.

They exist for reasons that are about people and orders, not about magic numbers:

- **Memory.** Buyers who missed a bounce at $60 wait for another chance at $60. Buyers trapped at $80 wait to escape "at breakeven" when price returns.
- **Resting orders.** Limit buys, stop losses, and options strikes cluster at prices humans find satisfying, and clusters create real supply and demand.
- **Anchoring.** People remember round numbers and recent extremes far better than $63.47.

That last point is why **round numbers** — $50, $100, $1,000 — and the previous **52-week high** behave as levels even with no prior trading structure at all. It is entirely self-fulfilling, and it works anyway, because everyone is anchored to the same figures.`,
        },
        {
          kind: 'example',
          md: `**Building a zone, then flipping it.** A stock falls from **$80** to **$60**, rallies to **$70**, falls back to **$61**, and rallies again. The **$60–61** area is a support **zone**: two separate declines were absorbed there, at slightly different prices.

Weeks later the stock returns and closes at **$57.80** on heavy volume. Support is gone. Then:

- It rallies back to **$60.40** and stalls.
- Two weeks later it reaches **$60.90** and stalls again.

That is **role reversal** — old support has become resistance. The mechanism is human: everyone who bought at $60–61 and watched it fall now has a chance to get out near breakeven, and their sell orders sit exactly there. The zone did not change; the people holding it did.

Note that no single price was ever "the level". The lows were $60.00 and $61.00; the stalls were $60.40 and $60.90. A **$59.80–61.20** zone describes the behaviour; a line at "$60.00" would have had you stopped out at $59.90 and rejected an entry at $60.30.`,
        },
        {
          kind: 'text',
          md: `**Zones, not lines.** Three reasons the band matters more than the number:

1. Different participants act at slightly different prices, so absorption happens across a range.
2. Wicks make the "exact" level ambiguous — is the level the intraday low or the closing low? Reasonable people pick differently, so use both to bound a zone.
3. A hard line invites you to place a stop one cent beyond it, in the most crowded, most easily swept price on the chart.

**What breaks a level convincingly:** a *close* beyond the zone rather than a wick through it, ideally with an expansion in volume, followed by an inability to get back inside. Everything short of that is a probe.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Support lines are exact prices, and they hold."

Both halves are wrong. Support is a *zone* of interest, typically a percent or two wide in an ordinary stock, and it is a place where a *reaction* is somewhat more likely — not a floor. Levels break routinely, and the trade you are making is not "it will hold" but "if it holds, I know quickly; if it breaks, I know quickly and cheaply". That asymmetry, not the accuracy of the level, is where the value is.`,
        },
        {
          kind: 'callout',
          md: `**Do repeated touches strengthen a level?** Folklore says yes. A competing and equally reasonable view says each test *consumes* the resting orders that made the level real, so the fifth test is more fragile than the first. The evidence does not clearly settle it. Practical consequence: treat a much-tested level as *significant* — a lot of participants care about it — without assuming it is *strong*.`,
        },
        {
          kind: 'keypoint',
          md: `Support and resistance are zones of clustered orders and memory, not exact prices. After a decisive break they swap roles, because trapped holders sell into the return. A convincing break is a close beyond the zone with volume expansion — anything less is a probe.`,
        },
      ],
      quiz: [
        {
          id: 'u08-l05-q1',
          prompt:
            'A stock falls from $80 to $60, rallies to $70, falls back to $61, then rallies again. How should the $60–61 area be described?',
          choices: [
            'A guaranteed floor at exactly $60.00',
            'A support zone where two declines were absorbed at slightly different prices',
            'A resistance zone, since the stock fell from $80',
            'Meaningless until price has touched exactly $60.00 five times',
          ],
          answerIdx: 1,
          explain:
            'Two separate declines were absorbed at $60.00 and $61.00 — close but not identical, which is exactly why the honest description is a band rather than a number. Calling it a guaranteed floor is the misconception that gets people stopped out at $59.90; and it is support, not resistance, because buyers stopped declines there.',
        },
        {
          id: 'u08-l05-q2',
          prompt:
            'That stock later closes at $57.80, then rallies and stalls at $60.40 and $60.90. What is this called, and what causes it?',
          choices: [
            'Role reversal — broken support becomes resistance as trapped buyers sell near breakeven',
            'A measuring gap, caused by institutional accumulation',
            'A double bottom, caused by exhausted sellers',
            'A random coincidence with no behavioural basis',
          ],
          answerIdx: 0,
          explain:
            'The zone flipped roles: everyone who bought at $60–61 and sat through the decline now has a chance to exit near breakeven, and their resting sell orders sit right there. It is not a coincidence but it is also not mystical — the mechanism is entirely about where trapped holders placed their orders.',
        },
        {
          id: 'u08-l05-q3',
          prompt: 'Why do round numbers like $50 and $100 act as levels even with no prior structure?',
          choices: [
            'Exchanges enforce price bands at round numbers',
            'Options can only be struck at round numbers',
            'Anchoring — humans remember and place orders at satisfying numbers, so orders cluster there',
            'Market makers are required to provide extra liquidity there',
          ],
          answerIdx: 2,
          explain:
            'It is self-fulfilling and behavioural: people remember $100 far better than $97.43, so limit orders, stops, and targets pile up at the round figure, creating genuine supply and demand. Nothing in exchange rules or market-making obligations creates the effect, and options strikes exist at many non-round prices.',
        },
        {
          id: 'u08-l05-q4',
          prompt: 'What counts as a convincing break of a support zone?',
          choices: [
            'Any intraday wick below the zone',
            'A single tick below the lowest prior low',
            'A pre-market print below the zone',
            'A close beyond the zone, ideally on expanding volume, with no quick recovery back inside',
          ],
          answerIdx: 3,
          explain:
            'Closes reflect where participants were willing to hold, so a close outside the zone with volume expansion and no reclaim is the evidence that supply and demand actually changed. Wicks, single ticks, and thin pre-market prints are exactly the kind of probe that sweeps the crowded stops sitting just beyond a hand-drawn line.',
        },
        {
          id: 'u08-l05-q5',
          prompt: 'How should you treat a level that has been tested five separate times?',
          choices: [
            'As unbreakable — repeated defence proves strength',
            'As significant (many participants watch it) but not necessarily strong, since each test may consume the resting orders',
            'As irrelevant, since old levels expire after three tests',
            'As a guaranteed reversal point on the sixth touch',
          ],
          answerIdx: 1,
          explain:
            'Two defensible views compete here — folklore says repeated defence proves strength, while the order-flow view says each test consumes the limit orders that made the level real — and the evidence does not settle it. The honest reading is that many tests prove attention, not durability, so plan for a break rather than assuming a bounce.',
        },
      ],
      cardSeeds: [
        {
          id: 'u08-l05-c1',
          kind: 'basic',
          front: 'Why do support and resistance exist at all?',
          back: 'Memory (missed buyers and trapped holders), clustered resting orders (limits, stops, option strikes), and anchoring to round numbers and recent extremes.',
        },
        {
          id: 'u08-l05-c2',
          kind: 'cloze',
          front:
            'After a decisive break, old support tends to act as ____, because holders trapped in the zone sell near ____.',
          back: 'resistance; breakeven',
        },
        {
          id: 'u08-l05-c3',
          kind: 'basic',
          front: 'Why are levels zones rather than lines?',
          back: 'Participants act at slightly different prices; wicks make the "exact" level ambiguous; and a hard line invites a stop at the single most crowded, most easily swept price on the chart.',
        },
        {
          id: 'u08-l05-c4',
          kind: 'basic',
          front: 'What makes a break of a level convincing rather than a probe?',
          back: 'A close beyond the zone (not a wick), ideally on expanding volume, followed by failure to get back inside.',
        },
      ],
    },

    // ── L06 ───────────────────────────────────────────────────────────────
    {
      id: 'u08-l06',
      unitId: 'u08',
      order: 6,
      title: 'Volume',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**Volume** is the number of shares traded in a period — the histogram along the bottom of the app's drill charts. It is the only quantity on a standard chart that is not a price, and it answers a different question: **how many people cared?**

Start with the fact that eliminates most volume mysticism: **every share bought is a share sold**. Volume is *unsigned*. There is no such thing as more buyers than sellers — there is only a price at which the two agreed, and volume tells you how much agreement it took.

So volume measures **participation and conviction**, not direction. Direction comes from price; volume tells you how much to trust it.`,
        },
        {
          kind: 'text',
          md: `**Volume confirms price.** The standard readings, all probabilistic:

| Price | Volume | Reading |
|---|---|---|
| Breakout up | Well above average | Real participation — the most reliable of these |
| Breakout up | Below average | Suspect; thin breakouts fail often |
| Trend continues | Steadily declining | Interest waning; the move is running on fumes |
| Sharp drop | Enormous | Capitulation or forced selling — often near an exhaustion point |
| Range/consolidation | Drying up | Normal; a quiet base often precedes an expansion |

**Climax volume** is the extreme case: a volume bar several multiples of average, usually with a wide range and a long wick. At a low it is **capitulation** (the last forced sellers giving up); at a high it is a **blow-off** (the last late buyers piling in). Both mark the point where the supply of people willing to act has been used up — which is *why* moves often turn there.

**On-balance intuition.** You do not need to compute on-balance volume to use its idea: mentally add the day's volume when price closes up and subtract it when price closes down. If price grinds to new highs while that running tally sags, the new highs are being made on light participation — a **divergence** worth noticing. Divergences are hints, not signals; they can persist for months.`,
        },
        {
          kind: 'example',
          md: `**The same break, twice.** A stock trades between **$48** and **$50** for six weeks on roughly **1.0M** shares a day.

- **Version A:** it closes at **$52.10** on **4.2M** shares — over four times average. The next two days hold above $50 on 1.8M and 1.5M. Real supply above $50 was absorbed; the old resistance now acts as support on the retest.
- **Version B:** it closes at **$50.80** on **600k** shares — below average. Two days later it is back at **$49.20**, then **$47.60**. Nobody was there. This is a **bull trap** or **failed breakout**: the buyers who chased the break are now the trapped holders whose sell orders will cap the next rally near $50.

Same shape on the price chart. Completely different information, visible only in the histogram — which is why volume is the first thing to check after you name a pattern, and why a "clean breakout" with no participation is usually not one.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "High volume is bullish."

Volume has no sign. A 5M-share day on a stock that closes down 7% is *heavy distribution* — a large, motivated seller finding buyers all the way down. High volume simply means the move mattered: it amplifies whatever price did, in whichever direction. And the related phrase "more buyers than sellers" is arithmetically impossible; what people mean is that buyers were more *urgent*, and that shows in the price change, not the volume.`,
        },
        {
          kind: 'callout',
          md: `**Cautions before you lean on volume.** Compare volume only to that stock's own recent average (say, the last 50 days) — never across stocks. Watch for mechanical distortions: index-rebalance days, quarterly options expiry, and the closing auction routinely triple volume for reasons that have nothing to do with anyone's opinion. And in a very thin stock, a single institutional order can produce a "conviction" bar all by itself.`,
        },
        {
          kind: 'keypoint',
          md: `Volume is unsigned participation, not direction: every buy is a sell. It confirms price — breakouts on heavy volume are far more credible than thin ones, and climax volume marks exhaustion. Judge volume only against the same stock's own recent average.`,
        },
      ],
      quiz: [
        {
          id: 'u08-l06-q1',
          prompt: 'A stock closes down 7% on volume five times its average. What does the volume tell you?',
          choices: [
            'That the move mattered — heavy participation confirming distribution, not a bullish signal',
            'That the stock is being accumulated, since high volume is bullish',
            'That there were more sellers than buyers on the day',
            'Nothing at all, since volume only matters on up days',
          ],
          answerIdx: 0,
          explain:
            'Volume is unsigned: it amplifies whatever price did, so a heavy down day is a heavy down day — motivated sellers finding buyers all the way down. "More sellers than buyers" is arithmetically impossible, since every share sold is a share bought; the imbalance people mean is one of urgency, and that shows up in the price change.',
        },
        {
          id: 'u08-l06-q2',
          prompt:
            'A stock ranges $48–$50 for six weeks on ~1.0M shares a day, then closes at $50.80 on 600k shares and falls back to $47.60 within a week. What happened?',
          choices: [
            'A measuring gap inside a healthy uptrend',
            'A capitulation low',
            'A failed breakout (bull trap) — the break lacked participation',
            'A successful breakout that simply needed more time',
          ],
          answerIdx: 2,
          explain:
            'The break came on below-average volume, meaning almost nobody participated, and price fell straight back into the range — the textbook bull trap, whose chased buyers become the trapped sellers capping the next rally near $50. Contrast the same shape on 4.2M shares, where real supply above $50 was actually absorbed.',
        },
        {
          id: 'u08-l06-q3',
          prompt: 'What is climax volume, and what does it suggest?',
          choices: [
            'Volume that rises steadily for a month, suggesting accumulation',
            'Average volume during a quiet consolidation, suggesting a coming breakout',
            'Any day with volume above the 50-day average, suggesting institutional interest',
            'A bar several multiples of average, often with a wide range — suggesting the supply of willing participants is exhausted',
          ],
          answerIdx: 3,
          explain:
            'Climax volume is the extreme case — capitulation at a low, a blow-off at a high — and it matters because it marks the point where the people willing to act have acted, which is why moves often turn there. An ordinary above-average day is far too common to carry that meaning, and steadily rising volume over a month describes a trend, not a climax.',
        },
        {
          id: 'u08-l06-q4',
          prompt:
            'Price grinds to new highs while your running up-volume-minus-down-volume tally sags. How should you read it?',
          choices: [
            'A confirmed sell signal — exit immediately',
            'A divergence worth noting: new highs on light participation. It is a hint, and it can persist for months',
            'Proof the data feed is wrong, since new highs require rising volume',
            'Evidence that a short squeeze is under way',
          ],
          answerIdx: 1,
          explain:
            'That is the on-balance-volume idea, and a sagging tally under rising price says the new highs are being made without broad participation. But divergences routinely persist for months before resolving — or never resolve at all — so treating one as an exit trigger converts a soft hint into a costly rule.',
        },
      ],
      cardSeeds: [
        {
          id: 'u08-l06-c1',
          kind: 'cloze',
          front:
            'Volume is ____: every share bought is a share ____, so volume measures participation rather than ____.',
          back: 'unsigned; sold; direction',
        },
        {
          id: 'u08-l06-c2',
          kind: 'basic',
          front: 'How does volume confirm a breakout?',
          back: 'A break on well-above-average volume means real supply was absorbed; a break on below-average volume is suspect and often fails, trapping the buyers who chased it.',
        },
        {
          id: 'u08-l06-c3',
          kind: 'basic',
          front: 'What distorts volume readings?',
          back: 'Index rebalances, quarterly options expiry, and closing auctions inflate volume mechanically; thin stocks can print a "conviction" bar from one institutional order. Always compare a stock to its own recent average.',
        },
      ],
    },

    // ── L07 ───────────────────────────────────────────────────────────────
    {
      id: 'u08-l07',
      unitId: 'u08',
      order: 7,
      title: 'Gaps & Volatility',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A **gap** is empty space on the chart: today's entire range sits above yesterday's high or below yesterday's low, so no trading occurred in between. Gaps happen because the market is closed roughly 17.5 hours a day while news keeps arriving — earnings, guidance, trial results, downgrades, macro data.

A gap is worth attention because it is the one place where price *repriced without transacting*. Nobody established a position in that empty zone, so the usual memory-and-orders machinery of support and resistance has nothing to work with there.`,
        },
        {
          kind: 'text',
          md: `The traditional taxonomy — useful as vocabulary, unreliable as a real-time classifier:

- **Common gap.** Small, inside a range, no news. Fills quickly and means little.
- **Breakaway gap.** Price leaps out of a base or through a well-tested level, on very heavy volume. The most informative kind: it says the balance broke decisively.
- **Runaway (measuring) gap.** Occurs *mid*-trend on solid volume, as a move accelerates. Folklore places it near the midpoint of the whole move; treat that as a rough heuristic, not a measurement.
- **Exhaustion gap.** Appears late in an extended move on enormous volume, and is followed by stalling and a quick reversal — the last participants rushing in.

The honest caveat: a runaway gap and an exhaustion gap look **identical** on the day they occur. The label is assigned by what happens afterwards. Anyone telling you they classified one in real time is describing hindsight.

**Earnings gaps** are their own category. They reprice a business on genuine new information, and they often *do not* fill — the fundamentals changed. Fading an earnings gap purely because it is a gap is one of the more reliable ways to lose money.`,
        },
        {
          kind: 'example',
          md: `**An earnings gap, day by day.** A stock closes Tuesday at **$47.80** on 1.1M shares. It reports after the close and beats guidance.

Wednesday it opens at **$55.20**, trades a low of **$54.10** and a high of **$56.80**, closes **$56.20** on **9.4M** shares.

- The gap spans **$47.80 → $54.10**: no shares changed hands in that $6.30 band.
- Nothing "filled". The low of the day, $54.10, is still $6.30 above Tuesday's close, and over the following three weeks the stock holds a **$53–57** range.
- Note the change in **character**: Tuesday's range was $46.90–48.30 ($1.40, about 3%); the following weeks average $2.50-a-day ranges. The stock is now a **more volatile** stock than it was on Tuesday.

That last point is the durable lesson. Volatility **clusters**: quiet periods follow quiet periods, and violent periods follow violent periods. A stop or a position size calibrated to Tuesday's stock is badly miscalibrated for Wednesday's.`,
        },
        {
          kind: 'text',
          md: `**Ranges expand and contract.** A **contraction** — successively narrower daily ranges, shrinking volume, tightening consolidation — often precedes an expansion, though it never tells you the direction. An **expansion** — a sudden wide-range day — is how a new regime announces itself.

**ATR intuition.** The **Average True Range** is the average daily range over a lookback (typically 14 days), using the *true* range so that gaps count. You do not need to compute it to use it:

- A $100 stock with an ATR of **$2** moves about **2%** a day. A $100 stock with an ATR of **$6** moves about **6%**.
- A stop placed **$1** away on the second stock will be hit by ordinary noise almost immediately. That is not bad luck; it is a stop set inside the stock's normal daily wiggle.
- Sizing follows: if you are risking 1% of a $20,000 portfolio ($200) and your invalidation sits **2 × ATR** away — $12 on that second stock — the position is about **16 shares**, not "whatever $2,000 buys".

This is the most practical idea in the unit. It converts a vague chart reading into an arithmetic position size, and it is why volatility is a risk-management input long before it is a signal.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "All gaps get filled."

Some do, and the ones that do are memorable, which is exactly how the folklore survives. Common gaps inside a range fill often; breakaway gaps and earnings gaps frequently never fill, and "eventually" is doing enormous work in the claim — a gap that fills three years later is not a trade. Treating gap-fill as a rule is a survivorship-bias trap: you remember the fills and forget the stocks that gapped up and never looked back.`,
        },
        {
          kind: 'keypoint',
          md: `Gaps are price repricing with no transactions in between; breakaway and exhaustion gaps are only distinguishable after the fact. Volatility clusters, so range contraction often precedes expansion. ATR turns that into position sizing: place invalidation outside normal daily noise, then size the position to a fixed dollar risk.`,
        },
      ],
      quiz: [
        {
          id: 'u08-l07-q1',
          prompt:
            'A stock closes at $47.80, reports earnings, and the next day trades a low of $54.10 and a high of $56.80. What is the gap, and did it fill?',
          choices: [
            'A gap of $9.00; it filled at the high of $56.80',
            'There is no gap because the stock traded higher all day',
            'A gap from $47.80 to $54.10 — a $6.30 band with no trading, and it did not fill',
            'A gap of $6.30 that filled as soon as price touched $54.10',
          ],
          answerIdx: 2,
          explain:
            'The gap spans the previous close ($47.80) to the new day’s low ($54.10) — a $6.30 band where no shares changed hands — and filling it would require price to trade back down through that band, which never happened. Touching the low of the gap day is the start of the gap, not the fill, and a common source of false "it filled" claims.',
        },
        {
          id: 'u08-l07-q2',
          prompt: 'Why can a runaway gap and an exhaustion gap not be distinguished in real time?',
          choices: [
            'They look identical on the day; only subsequent price action assigns the label',
            'Both are always accompanied by identical volume, so no data distinguishes them',
            'Data vendors do not report the difference until the quarter closes',
            'They are the same thing under two names',
          ],
          answerIdx: 0,
          explain:
            'Both are gaps within an extended move on heavy volume — the classification depends entirely on whether the trend continues or reverses afterwards. Volume gives hints but is not decisive, which is why anyone claiming a same-day classification is describing hindsight rather than analysis.',
        },
        {
          id: 'u08-l07-q3',
          prompt: 'Which statement about gap fills is most accurate?',
          choices: [
            'All gaps fill within 30 days',
            'Common gaps inside a range often fill; breakaway and earnings gaps frequently never do',
            'Earnings gaps fill fastest, because the news is already priced in',
            'Gaps below $1 always fill; larger gaps never do',
          ],
          answerIdx: 1,
          explain:
            'Gap-fill frequency depends on the kind of gap: a small no-news gap inside a range usually gets retraced, while a gap that reprices a business on genuine new information often does not. "All gaps fill" survives on survivorship bias — the fills are memorable and the stocks that gapped up and never came back are forgotten.',
        },
        {
          id: 'u08-l07-q4',
          prompt:
            'A $100 stock has an ATR of $6. You risk $200 of a $20,000 portfolio and place invalidation 2 × ATR away. Roughly what position size does that imply, and why?',
          choices: [
            'About 200 shares — risk is capped by the stop, not by size',
            'About 20 shares, using a $10 stop for a round number',
            'About 100 shares, since $200 is 1% of the portfolio',
            'About 16 shares — a $12 risk per share divides into the $200 risk budget',
          ],
          answerIdx: 3,
          explain:
            '2 × ATR is $12 per share, and $200 ÷ $12 ≈ 16 shares — the stop distance drives the size, which is exactly the point of using ATR. Sizing by a round dollar amount instead ignores that a $1 or even $10 stop sits inside this stock’s normal daily wiggle and would be hit by noise almost immediately.',
        },
      ],
      cardSeeds: [
        {
          id: 'u08-l07-c1',
          kind: 'basic',
          front: 'Name the four traditional gap types.',
          back: 'Common (small, in-range, fills easily); breakaway (out of a base on heavy volume); runaway/measuring (mid-trend acceleration); exhaustion (late in a move on huge volume, then reversal). Runaway and exhaustion are indistinguishable on the day.',
        },
        {
          id: 'u08-l07-c2',
          kind: 'cloze',
          front:
            'Volatility ____: quiet periods follow quiet periods and violent ones follow violent ones — so range ____ often precedes an expansion, without indicating direction.',
          back: 'clusters; contraction',
        },
        {
          id: 'u08-l07-c3',
          kind: 'basic',
          front: 'How does ATR turn a chart reading into a position size?',
          back: 'ATR ≈ the stock’s normal daily range. Put invalidation outside it (e.g. 2 × ATR), then size = dollar risk budget ÷ per-share risk. A $200 budget with $12 per-share risk is ~16 shares.',
        },
      ],
    },

    // ── L08 ───────────────────────────────────────────────────────────────
    {
      id: 'u08-l08',
      unitId: 'u08',
      order: 8,
      title: 'From Reading to Practicing',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Everything so far has been vocabulary. Vocabulary is not skill — chart reading is a **perceptual** skill, and perceptual skills are built by repeated exposure with immediate feedback, not by reading definitions.

The app has two drills for exactly this:

- **Pattern drills.** A window of daily candles is shown and you name the shape from four options — for example *Double Top*, *Bull Flag*, *Cup and Handle*, *Support Bounce*. The three wrong options are deliberately drawn from the same family, so the answer turns on the defining feature rather than on eliminating nonsense: telling a *Bull Flag* from a *Consolidation* forces you to notice the pole and the downward drift, not just "it went sideways".
- **What-next drills.** Bars are shown up to a cutoff, you predict the direction over the next 10 bars, and then the hidden bars are revealed. This is the honest version of chart reading, because the right-hand edge is genuinely blank — which is the one condition every historical chart lacks.`,
        },
        {
          kind: 'text',
          md: `**Base rates: most patterns fail more often than the books admit.**

Published pattern statistics come with three problems worth internalising:

1. **Selection bias.** The clean examples in a textbook were chosen *because* they resolved as advertised. Every ambiguous, messy, half-formed version was quietly excluded.
2. **Definition drift.** If your criteria for a "valid" pattern are loose, your sample fills with noise; if they are strict, your sample is tiny. Both directions ruin the estimate.
3. **Costs.** A setup that resolves favourably 55% of the time can still lose money once spreads, slippage, and taxes are paid.

The honest summary: a genuinely good, well-defined setup gets you something in the region of **55–60%** — and even that is optimistic once trading costs are included. Nothing about the practice becomes reliable at the level of the individual trade. The edge, if it exists, is thin and statistical, and it only shows up over dozens or hundreds of occurrences.`,
        },
        {
          kind: 'example',
          md: `**Why a 40% hit rate can be excellent.** Expectancy per trade:

> **Expectancy = (win rate × average win) − (loss rate × average loss)**

Trader A takes tight-stop breakouts. Hit rate **40%**, average win **$300**, average loss **$100**:
(0.40 × $300) − (0.60 × $100) = **$120 − $60 = +$60** per trade.

Trader B takes mean-reversion trades with no defined stop. Hit rate **80%**, average win **$50**, average loss **$300**:
(0.80 × $50) − (0.20 × $300) = **$40 − $60 = −$20** per trade.

Trader B is right twice as often and loses money. Being right is not the objective; **expectancy** is. This is also why the invalidation level from Lesson 1 matters more than the pattern name — it sets the average loss, which is the term you actually control.

And note the sample-size trap: over 20 trades, Trader B's approach will usually *look* better. It takes on the order of a hundred trades before the difference is reliably visible, which is precisely why drills with instant feedback beat live money for learning.`,
        },
        {
          kind: 'text',
          md: `**Calibration.** The what-next drill asks for your confidence — **50%**, **70%**, or **90%** — and this is the most valuable data the app collects about you. Being *calibrated* means that when you say 90%, you are right about 9 times in 10; when you say 50%, about half the time.

Almost everyone is **overconfident**: their 90% answers come in around 65–70%. Two things follow:

- Calibration is measurable, and it improves with feedback — unlike raw prediction accuracy, which barely improves at all.
- A calibrated 55% belief is worth far more than an uncalibrated 90% belief, because it can be sized correctly. You cannot risk-manage a number you know is inflated.

Practical habit: before revealing, say what you expect *and* how sure you are, then check both. Track hit rate separately at each confidence level. If your 90s and your 70s come in at the same rate, your confidence carries no information — and that is fixable.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Patterns work every time — I just have to spot them correctly."

This is **hindsight bias** wearing a chart. On a completed chart the head and shoulders is obvious, the neckline is unmistakable, and the breakdown is clean. In the live market you are at the right-hand edge, the "neckline" is a zone, and half the formations you name will fail. The remedy is structural, not perceptual: define invalidation *before* the outcome, size so that being wrong is survivable, and judge the process over a hundred occurrences rather than the last one.`,
        },
        {
          kind: 'callout',
          md: `**A grounding reminder.** Everything in this unit is educational content about how prices are read, not investment advice or a trading system. The evidence for most chart patterns is weak, mixed, and hard to separate from noise; for most people, most of the time, low-cost diversified investing beats discretionary chart trading after costs and taxes. Learn to read charts because it makes you a more literate market participant — and keep any real money you commit to it small enough that being wrong is survivable.`,
        },
        {
          kind: 'keypoint',
          md: `Chart reading is a perceptual skill: drills with instant feedback build it, definitions do not. Expect base rates near 55–60% at best, judge decisions by expectancy rather than hit rate, and track calibration at each confidence level. Unit 9 takes these foundations into the named chart patterns themselves.`,
        },
        {
          kind: 'text',
          md: `**Next: Unit 9 — Chart Patterns.** With candles, timeframes, trend, levels, volume, and volatility in place, the named formations become readable as combinations of what you already know: a **Double Top** is resistance tested twice with waning volume; a **Bull Flag** is a trend pausing in a tight range; **Head and Shoulders** is a failed higher high plus a broken support zone. Unit 9 names each one, gives its invalidation level, and states honestly what its base rate is and is not.`,
        },
      ],
      quiz: [
        {
          id: 'u08-l08-q1',
          prompt:
            'Why do the app’s pattern drills draw the three wrong options from the same family as the answer?',
          choices: [
            'So the choice turns on the defining feature rather than on eliminating nonsense',
            'To make the drills harder so they take longer to complete',
            'Because the software cannot generate unrelated pattern labels',
            'To ensure every pattern label appears equally often',
          ],
          answerIdx: 0,
          explain:
            'Plausible near-misses force you to look for the feature that actually separates the shapes — the pole and downward drift that make a bull flag rather than a plain consolidation. Absurd distractors would let you score well by elimination while learning nothing, which defeats the purpose of a perceptual drill.',
        },
        {
          id: 'u08-l08-q2',
          prompt:
            'Trader A wins 40% of the time with a $300 average win and $100 average loss. Trader B wins 80% with a $50 average win and $300 average loss. Who has positive expectancy?',
          choices: [
            'Trader B, because an 80% hit rate is far higher',
            'Both, since both win more than they lose on average',
            'Neither — expectancy cannot be computed from these figures',
            'Trader A: (0.40 × $300) − (0.60 × $100) = +$60, versus Trader B’s −$20',
          ],
          answerIdx: 3,
          explain:
            'Expectancy weights each outcome by its size, so A earns $120 and gives back $60 for +$60 per trade, while B earns $40 and gives back $60 for −$20. Being right is not the objective — B is right twice as often and still loses money, which is why the invalidation level (the term that sets average loss) matters more than the pattern name.',
        },
        {
          id: 'u08-l08-q3',
          prompt: 'Published chart-pattern success rates tend to overstate real-world results mainly because of what?',
          choices: [
            'Exchanges withhold historical data from researchers',
            'Patterns only worked before electronic trading',
            'Selection bias, definition drift, and the omission of trading costs',
            'Most studies use intraday data, which is unreliable',
          ],
          answerIdx: 2,
          explain:
            'Textbook examples are chosen because they worked, "valid pattern" criteria can be tuned loose or strict to flatter the sample, and headline hit rates rarely net out spreads, slippage, and taxes. Data availability is not the constraint — the problems are methodological, which is why a real, well-defined edge lands nearer 55–60% than the numbers usually quoted.',
        },
        {
          id: 'u08-l08-q4',
          prompt:
            'Over many what-next drills, your 90%-confidence answers are correct about 68% of the time. What does this mean?',
          choices: [
            'Your pattern recognition is broken and should be relearned from scratch',
            'You are overconfident — your stated confidence is inflated, which is measurable and improvable with feedback',
            'The drills are miscalibrated, since 90% should be right 90% of the time by construction',
            'Nothing useful; confidence ratings are subjective',
          ],
          answerIdx: 1,
          explain:
            'Calibration compares stated confidence with realised hit rate, and 90% claims landing near 68% is the ordinary human pattern of overconfidence — not a broken skill and not a broken drill. It matters because calibration responds to feedback far better than raw accuracy does, and a belief you know is inflated cannot be sized correctly.',
        },
        {
          id: 'u08-l08-q5',
          prompt: 'What is the most reliable defence against hindsight bias when reading charts?',
          choices: [
            'Define invalidation and size before the outcome is known, and judge the process over many occurrences',
            'Study more completed examples until the patterns become obvious',
            'Use a shorter timeframe so signals appear sooner',
            'Only trade patterns that have worked in the last month',
          ],
          answerIdx: 0,
          explain:
            'Committing to the risk level and position size in advance makes the decision judgeable independently of the outcome, and a large sample keeps you from grading yourself on the last trade. Studying more completed charts actually deepens the illusion — everything looks obvious with the right-hand side visible, which is the bias itself.',
        },
      ],
      cardSeeds: [
        {
          id: 'u08-l08-c1',
          kind: 'cloze',
          front: 'Expectancy = (____ × average win) − (____ × average loss).',
          back: 'win rate; loss rate',
        },
        {
          id: 'u08-l08-c2',
          kind: 'basic',
          front: 'Why do published pattern success rates overstate reality?',
          back: 'Selection bias (textbook examples were chosen because they worked), definition drift (loose criteria admit noise, strict criteria shrink the sample), and omitted trading costs. A genuine edge is nearer 55–60%.',
        },
        {
          id: 'u08-l08-c3',
          kind: 'basic',
          front: 'What does it mean to be calibrated?',
          back: 'Your 90%-confidence calls are right about 9 times in 10, your 50% calls about half the time. Most people are overconfident; calibration improves with feedback even when raw accuracy does not.',
        },
        {
          id: 'u08-l08-c4',
          kind: 'basic',
          front: 'Structural defence against hindsight bias',
          back: 'Define the invalidation level and position size before the outcome is known, then judge the process across a hundred occurrences rather than the most recent one.',
        },
      ],
    },
  ],
}
