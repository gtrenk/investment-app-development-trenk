import type { Unit } from '@core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Unit 11 — Risk & Position Sizing
// Everything before this unit was about finding good ideas. This unit is about
// staying in the game long enough for good ideas to pay. Expectancy, fixed
// fractional sizing, stops, the arithmetic of drawdown, correlation, Kelly,
// risk of ruin — and a written framework that turns all of it into rules you
// can actually follow on a bad day.
// ─────────────────────────────────────────────────────────────────────────────

export const u11: Unit = {
  id: 'u11',
  title: 'Risk & Position Sizing',
  order: 11,
  description:
    'Survive first, compound second: expectancy and process-versus-outcome thinking, fixed-fractional position sizing, stop placement, the brutal asymmetry of drawdowns, correlation and real diversification, Kelly intuition, risk of ruin, and a written personal risk framework.',
  unlockAfter: 'u10',
  lessons: [
    // ── L01 ───────────────────────────────────────────────────────────────
    {
      id: 'u11-l01',
      unitId: 'u11',
      order: 1,
      title: 'Thinking in Bets',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Every position you take is a **bet**: money committed to an uncertain outcome. That is not a moral judgement, it is a description. And once you accept the description, the right question changes. It stops being *"will this work?"* — nobody knows — and becomes *"if I made this bet a thousand times, would I end up richer?"*

The tool that answers it is **expectancy**: the average profit or loss per bet over many repetitions.

> **Expectancy = (win% × average win) − (loss% × average loss)**

A positive expectancy means the bet pays *on average*. A negative one means you lose money slowly and reliably, no matter how good any individual outcome feels.`,
        },
        {
          kind: 'example',
          md: `**A 40% hit rate beating an 80% hit rate.**

**Steady Eddie** — sells options-like small wins, occasionally gets run over.
- Wins **80%** of the time, average win **$120**
- Loses **20%** of the time, average loss **$560**
- Expectancy = (0.80 × 120) − (0.20 × 560) = 96 − 112 = **−$16 per trade**

**Ugly Duckling** — wrong most of the time, cuts losses fast, lets winners run.
- Wins **40%** of the time, average win **$600**
- Loses **60%** of the time, average loss **$220**
- Expectancy = (0.40 × 600) − (0.60 × 220) = 240 − 132 = **+$108 per trade**

Over 200 trades: Steady Eddie loses **$3,200**; Ugly Duckling makes **$21,600**.

Steady Eddie is right four times out of five and goes broke. Ugly Duckling is wrong three times out of five and compounds. **Win rate on its own tells you nothing** — it is only half of a two-part number.`,
        },
        {
          kind: 'text',
          md: `The other half is the **payoff ratio** (average win ÷ average loss). Fix the payoff ratio and the win rate you need to break even is forced:

> **Break-even win rate = 1 ÷ (1 + payoff ratio)**

| Payoff ratio | Break-even win rate |
|---|---|
| 5:1 | 16.7% |
| 3:1 | 25.0% |
| 2:1 | 33.3% |
| 1:1 | 50.0% |
| 1:2 | 66.7% |
| 1:4 | 80.0% |

Steady Eddie's payoff ratio is 120 ÷ 560 = **0.21:1**, which demands an **82.4%** win rate just to tread water — and he only hits 80%. Ugly Duckling's is 600 ÷ 220 = **2.73:1**, needing only **26.8%** — and he hits 40%.

It is often easier to improve the payoff ratio (exit discipline) than the win rate (prediction skill). Note too that **costs subtract from expectancy on every single trade**: commissions, spread, and slippage come out of the average win and get added to the average loss.`,
        },
        {
          kind: 'text',
          md: `Because outcomes are noisy, a good decision and a good outcome are **different things**. Poker players call the mistake of judging the first by the second **resulting**.

| | Good outcome | Bad outcome |
|---|---|---|
| **Good process** | Deserved | Bad luck — *change nothing* |
| **Bad process** | Dumb luck — **most dangerous** | Poetic justice |

The bottom-left box is the killer, because the market pays you for the very habit that will eventually ruin you. Someone who bets 40% of their account on one earnings report and triples it has learned exactly the wrong lesson, and will keep applying it until it kills them.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "A high win rate means a good strategy."**

Win rate is one input, and on its own it is closer to a *style* description than a quality measure. Strategies that are right 80% of the time usually earn small wins and take occasional large losses; strategies that are right 35% of the time usually do the opposite. Neither is inherently better. **Only the combination — win rate and payoff ratio, net of costs — decides whether the bet is worth making.**`,
        },
        {
          kind: 'callout',
          md: `**Variance is not a signal.** With a 40% win rate, the chance of five straight losses starting at any given trade is 0.6⁵ = **7.8%** — so over a few hundred trades, runs of five and six losses are routine, not evidence that the edge has vanished. Even with Ugly Duckling's genuinely positive expectancy, roughly **1 in 6** ten-trade stretches ends in the red. Abandoning a positive-expectancy process after a normal losing streak is the most expensive thing an otherwise competent investor does.`,
        },
        {
          kind: 'keypoint',
          md: `Expectancy = (win% × average win) − (loss% × average loss). Break-even win rate = 1 ÷ (1 + payoff ratio). A 40% hit rate with a 2.7:1 payoff beats an 80% hit rate with a 0.2:1 payoff. Judge the process, not the outcome — and remember that lucky results from a bad process are the most dangerous feedback the market can give you.`,
        },
      ],
      quiz: [
        {
          id: 'u11-l01-q1',
          prompt:
            'A strategy wins 40% of the time with an average win of $600 and loses 60% of the time with an average loss of $220. What is its expectancy per trade?',
          choices: [
            '−$16',
            '+$380',
            '+$108',
            '+$240',
          ],
          answerIdx: 2,
          explain:
            '(0.40 × 600) − (0.60 × 220) = 240 − 132 = +$108. The +$240 answer counts only the winning half and forgets that six trades in ten give money back, which is exactly the arithmetic that makes low-win-rate strategies look worse than they are.',
        },
        {
          id: 'u11-l01-q2',
          prompt:
            'A strategy has an average win of $120 and an average loss of $560. What win rate does it need just to break even?',
          choices: [
            '82.4%',
            '50.0%',
            '21.4%',
            '78.6%',
          ],
          answerIdx: 0,
          explain:
            'Payoff ratio = 120 / 560 = 0.214, and break-even win rate = 1 / (1 + 0.214) = 82.4%. A strategy winning 80% of the time therefore still loses money — being right four times out of five is not enough when the fifth time costs nearly five times the win.',
        },
        {
          id: 'u11-l01-q3',
          prompt:
            'An investor bets 40% of their account on one earnings report and triples their money. How should this be classified?',
          choices: [
            'Good process, good outcome — the result validates the sizing',
            'Good process, bad outcome, since the risk was uncomfortable',
            'Bad process, bad outcome, because concentration is always wrong',
            'Bad process, good outcome — the most dangerous cell, because the result teaches the wrong lesson',
          ],
          answerIdx: 3,
          explain:
            'A single outcome cannot validate a sizing decision that would ruin the account across repetitions, and being paid for it is worse than being punished because the habit gets reinforced. Judging the decision by the result is the error poker players call resulting, and this is its textbook case.',
        },
        {
          id: 'u11-l01-q4',
          prompt:
            'With a 40% win rate, what is the probability of five consecutive losses starting from any given trade?',
          choices: [
            '0.4⁵ = 1.0%',
            '0.6⁵ = 7.8%',
            '5 × 0.6 = 300%, so it is certain',
            'It cannot be calculated without knowing the average loss',
          ],
          answerIdx: 1,
          explain:
            'Each trade loses with probability 0.6, so five in a row is 0.6⁵ = 7.8% — common enough that a few hundred trades will contain several such runs. Using 0.4⁵ computes the chance of five consecutive *wins*, and treating a normal streak as proof the edge is gone is how positive-expectancy processes get abandoned.',
        },
        {
          id: 'u11-l01-q5',
          prompt:
            'Why do trading costs matter more to a high-frequency, high-win-rate strategy than to a low-frequency one?',
          choices: [
            'Costs are charged as a percentage of win rate',
            'Brokers charge higher commissions on winning trades',
            'High-win-rate strategies are exempt from spread costs',
            'Costs are subtracted from every trade, so a strategy with many trades and small average wins loses a larger share of its edge',
          ],
          answerIdx: 3,
          explain:
            'Commission, spread, and slippage shrink each average win and enlarge each average loss, so an edge of $120 per trade survives a $10 cost far better than an edge of $15 does. Frequency multiplies the drag, which is why small-edge, high-turnover approaches are the first to die once real-world costs are included.',
        },
      ],
      cardSeeds: [
        {
          id: 'u11-l01-c1',
          kind: 'cloze',
          front: 'Expectancy = (____ × ____) − (____ × ____).',
          back: '(win% × average win) − (loss% × average loss)',
        },
        {
          id: 'u11-l01-c2',
          kind: 'cloze',
          front: 'Break-even win rate = ____ ÷ (1 + ____).',
          back: '1 ÷ (1 + payoff ratio), where payoff ratio = average win ÷ average loss. A 3:1 payoff needs 25%; a 1:1 payoff needs 50%; a 1:4 payoff needs 80%.',
        },
        {
          id: 'u11-l01-c3',
          kind: 'basic',
          front: 'What is "resulting", and which cell of the process/outcome grid is most dangerous?',
          back: 'Resulting is judging the quality of a decision by the quality of its outcome. The dangerous cell is bad process with a good outcome: the market pays you for a habit that will eventually ruin you, so the lesson gets reinforced instead of corrected.',
        },
        {
          id: 'u11-l01-c4',
          kind: 'basic',
          front: 'Why can a 40% win rate beat an 80% win rate?',
          back: 'Win rate is only half the number. An 80% strategy with a 0.2:1 payoff needs an 82.4% win rate to break even, while a 40% strategy with a 2.7:1 payoff only needs 26.8%. Expectancy — win rate combined with payoff ratio, net of costs — is the verdict.',
        },
      ],
    },

    // ── L02 ───────────────────────────────────────────────────────────────
    {
      id: 'u11-l02',
      unitId: 'u11',
      order: 2,
      title: 'Position Sizing I: Fixed Fractional',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Expectancy tells you *whether* to bet. **Position sizing** tells you *how much* — and it is the single highest-leverage decision in investing, because it is the only one that is entirely within your control. You cannot make a stock go up. You can always decide how much of your net worth rides on it.

The workhorse method is **fixed fractional** risk: you decide in advance what fraction of capital a single losing position may cost you, and you let that number, together with your exit point, determine the size.

> **Risk per trade ($) = capital × risk %**
> **Position size (shares) = risk $ ÷ stop distance per share**

Most professional practitioners land somewhere between **0.5% and 2%** of capital risked per position. That sounds trivially small until you multiply it by a losing streak — which is exactly the point, and exactly what Lesson 4 makes concrete.`,
        },
        {
          kind: 'example',
          md: `**The basic calculation.** Capital **$50,000**, risk **1%** = **$500** per position.

You want to buy a stock at **$84.00** and you have decided the thesis is wrong below **$78.00**.

- Stop distance = 84.00 − 78.00 = **$6.00 per share**
- Shares = 500 ÷ 6.00 = 83.3 → **83 shares** (always round down)
- Position value = 83 × $84.00 = **$6,972** = **13.9%** of capital
- Actual risk if stopped = 83 × $6.00 = **$498** = **1.0%** of capital

Notice the two numbers that people constantly conflate. The **risk** is 1% of the account. The **position** is 13.9% of the account. They are related by a simple identity:

> **Position weight = risk % ÷ stop distance %**

Here: 1% ÷ (6.00 / 84.00 = 7.14%) = **14.0%**. A tighter stop produces a *larger* position at the same dollar risk; a wider stop produces a smaller one.`,
        },
        {
          kind: 'example',
          md: `**Letting volatility set the stop (ATR-based).** The **average true range** measures how far a stock typically moves in a day (Unit 8). Using a multiple of ATR keeps your stop outside normal noise instead of at an arbitrary round number.

**Stock A** — price **$84.00**, ATR(14) = **$2.40**. Stop at **2 × ATR** below entry:
- Stop = 84.00 − 4.80 = **$79.20**, stop distance **$4.80**
- Shares = 500 ÷ 4.80 = 104.2 → **104 shares**
- Position = 104 × $84.00 = **$8,736** = **17.5%** of capital, risk **$499.20**

**Stock B** — price **$120.00**, ATR(14) = **$6.00** (a far twitchier name). Same 2 × ATR rule:
- Stop = 120.00 − 12.00 = **$108.00**, stop distance **$12.00**
- Shares = 500 ÷ 12.00 = 41.7 → **41 shares**
- Position = 41 × $120.00 = **$4,920** = **9.8%** of capital, risk **$492**

Same $500 at risk on both. Stock B gets **half** the position, automatically, because it moves twice as much. Volatility-adjusted sizing means your portfolio is not quietly dominated by whichever holding happens to be the wildest.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Risking 1% means I only invest 1%."**

No. Risking 1% means **1% is what you lose if your exit is hit**. On a stock with a 7% stop distance, 1% of risk is a 14% *position*. Confusing the two leads people either to buy absurdly tiny positions (risk 1%, buy 1%, so a 50% collapse costs 0.5% and the whole exercise is theatre) or to hear "risk 1%" as permission for a 1% *portfolio* stop while holding a 60% position. Write both numbers down before you place the order: **dollars at risk** and **percent of portfolio**.`,
        },
        {
          kind: 'callout',
          md: `**Practical notes.** (1) **Round down**, never up — 83 shares, not 84. (2) Compute risk % against **current** equity, not the amount you started with, so size shrinks automatically in a drawdown and grows as you recover. (3) A fixed-fractional rule is a *cap*, not a target: a good idea with a very tight stop can compute to a 30% position, which is when a separate maximum-position rule has to override it. TickerQuest's paper-trading confirm screen flags anything over **20% of equity in one name** for exactly this reason. (4) Costs and slippage mean your realised loss is usually slightly worse than the arithmetic, so treat 1% as a floor on the pain, not a ceiling.`,
        },
        {
          kind: 'keypoint',
          md: `Risk $ = capital × risk %. Position size (shares) = risk $ ÷ stop distance per share. Position weight = risk % ÷ stop distance %. Risking 1% of capital is not the same as investing 1% of capital. Volatility-based stops (a multiple of ATR) automatically shrink positions in wilder stocks.`,
        },
      ],
      quiz: [
        {
          id: 'u11-l02-q1',
          prompt:
            'With $50,000 of capital, a 1% risk rule, entry at $84.00 and a stop at $78.00, how many shares should you buy?',
          choices: [
            '595 shares',
            '83 shares',
            '500 shares',
            '6 shares',
          ],
          answerIdx: 1,
          explain:
            'Risk $ = 50,000 × 1% = $500; stop distance = 84 − 78 = $6.00; 500 / 6.00 = 83.3, rounded down to 83 shares. The 595-share answer divides the risk dollars by the stop *price* rather than the stop *distance*, which would put roughly $50,000 into a single name.',
        },
        {
          id: 'u11-l02-q2',
          prompt:
            'In that same trade, what percentage of the $50,000 portfolio does the position represent?',
          choices: [
            '1.0%, the same as the risk',
            '7.1%, the stop distance',
            '6.0%, the dollar stop distance',
            '13.9% — 83 shares × $84.00 = $6,972',
          ],
          answerIdx: 3,
          explain:
            '83 × $84.00 = $6,972, which is 13.9% of $50,000 — equal to risk % divided by stop distance % (1% / 7.14%). The 1% figure is what the position costs you if the stop is hit, not what it costs you to open, and mixing the two is the most common sizing error there is.',
        },
        {
          id: 'u11-l02-q3',
          prompt:
            'Two stocks are sized with the same $500 risk and a 2 × ATR stop. Stock A trades at $84 with ATR $2.40; Stock B trades at $120 with ATR $6.00. What happens to their position sizes?',
          choices: [
            'Both get the same dollar position, since the risk is identical',
            'Stock B gets the larger position because its share price is higher',
            'Stock A gets a much larger position ($8,736 vs $4,920) because its stop is tighter',
            'Neither can be sized without knowing the expected return',
          ],
          answerIdx: 2,
          explain:
            'A wider stop divides the same risk dollars by a bigger number, so B takes 41 shares ($4,920) against A at 104 shares ($8,736). Equal dollar risk deliberately produces unequal position sizes — that is the mechanism that stops the most volatile holding from dominating the portfolio.',
        },
        {
          id: 'u11-l02-q4',
          prompt:
            'Why should the risk percentage be applied to current equity rather than to the account\'s starting value?',
          choices: [
            'Position size then shrinks automatically during a drawdown and grows again as equity recovers',
            'Brokers require it for margin calculations',
            'Starting value is not knowable after the first trade',
            'It makes the arithmetic easier to do mentally',
          ],
          answerIdx: 0,
          explain:
            'Sizing off current equity is self-correcting: after a bad run you bet less, which slows the bleeding, and after a good run you bet more, which compounds it. Anchoring to the starting balance keeps bet sizes constant in dollars while the cushion behind them shrinks — the opposite of what a losing streak calls for.',
        },
        {
          id: 'u11-l02-q5',
          prompt:
            'A very tight stop makes the fixed-fractional formula compute a position worth 32% of your portfolio. What should you do?',
          choices: [
            'Take it — the formula guarantees the risk is still only 1%',
            'Widen the stop until the position size falls, keeping the risk at 1%',
            'Skip the trade entirely, since tight stops are unreliable',
            'Apply a separate maximum-position cap, because a single-name gap or halt can bypass the stop entirely',
          ],
          answerIdx: 3,
          explain:
            'The 1% figure only holds if the stop actually executes near its price, and a 32% position that gaps 25% overnight costs 8% of the account regardless of where the stop sat. Widening the stop to shrink the position abandons the analysis that set the exit in the first place — the right fix is a position cap layered on top of the risk rule.',
        },
      ],
      cardSeeds: [
        {
          id: 'u11-l02-c1',
          kind: 'cloze',
          front: 'Position size (shares) = (____ × ____) ÷ ____.',
          back: '(capital × risk %) ÷ stop distance per share. Always round down.',
        },
        {
          id: 'u11-l02-c2',
          kind: 'cloze',
          front: 'Position weight as a share of the portfolio = ____ ÷ ____.',
          back: 'risk % ÷ stop distance % — so a 1% risk with a 7% stop distance is a 14% position.',
        },
        {
          id: 'u11-l02-c3',
          kind: 'basic',
          front: 'Why does an ATR-based stop produce smaller positions in volatile stocks?',
          back: 'A stop set at a multiple of ATR sits further away in dollars for a twitchy stock, and position size is risk dollars divided by stop distance. Bigger denominator, smaller position — so equal dollar risk automatically means the wildest holding is not the biggest one.',
        },
        {
          id: 'u11-l02-c4',
          kind: 'basic',
          front: 'What is the difference between "risking 1%" and "investing 1%"?',
          back: 'Risking 1% is the loss taken if the exit is hit. Investing 1% is the size of the position. On a stock with a 7% stop distance, a 1% risk is a 14% position. Record both numbers — dollars at risk and percent of portfolio — before placing the order.',
        },
      ],
    },

    // ── L03 ───────────────────────────────────────────────────────────────
    {
      id: 'u11-l03',
      unitId: 'u11',
      order: 3,
      title: 'Stop Losses',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `A **stop** is a pre-committed exit: a price at which you accept that the reason you bought is no longer valid. It exists for two reasons, and only one of them is arithmetic.

1. **It bounds the loss.** Without a defined exit, "how much can this cost me?" has the answer "everything", and the sizing formula from Lesson 2 has no denominator at all.
2. **It moves the decision earlier.** You choose the exit while you are calm and have no money on the line, rather than at 3pm on a red day while the position argues with you. Unit 12 is a catalogue of what your brain does to you in that second moment.

A stop is therefore best written as a *thesis invalidation point*, not a pain threshold. "I am wrong below $78 because that breaks the base the stock built in March" is a stop. "I will get out if I am down $500" is a wish with a number attached.`,
        },
        {
          kind: 'text',
          md: `**Placement.** Put the stop where the *story* breaks, then add a volatility buffer:

- **Below structure** — the last swing low, the lower edge of a support zone, the base of a consolidation (Unit 8, Lesson 4).
- **Not at round numbers.** Resting orders cluster at $50.00, $100.00, and other tidy figures, which makes those prices a magnet: it is exactly where a flush of stops gets triggered before price recovers. Sit **below** the crowd, not on top of it.
- **Not at an arbitrary percentage.** "Always use an 8% stop" ignores that an 8% move is nothing in one stock and a catastrophe in another. Scale to ATR instead.
- **Never inside the noise.** If a stock routinely swings 2 ATR in a week, a 0.8 ATR stop is a coin flip that you pay for every time.`,
        },
        {
          kind: 'example',
          md: `**Placing one properly.** Stock at **$84.00**, ATR(14) **$2.40**, most recent swing low **$79.40**, and an obvious round number at **$80.00**.

- Round-number stop at $80.00 → distance $4.00 = **1.67 ATR**, and sitting right where every other stop sits.
- "8% rule" stop → 84.00 × 0.92 = **$77.28**, chosen by arithmetic that knows nothing about this chart.
- **Structure stop:** swing low $79.40 minus a 0.25 ATR buffer ($0.60) = **$78.80** → distance **$5.20 = 2.17 ATR**, below both the swing low and the round number.

Sizing it at 1% of a $50,000 account: 500 ÷ 5.20 = 96.2 → **96 shares**, position $8,064 (**16.1%** of equity), risk **$499.20**.

The structure stop is wider than the round-number one, so it buys fewer shares. That is the trade being made honestly: pay for a stop that only triggers when the thesis is actually broken.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "A stop guarantees your exit price."**

It does not. A **stop-market** order becomes a *market* order the instant the trigger prints, and it fills at whatever the next available price is — which after a gap can be far below your number.

Take the 83-share position from Lesson 2 with its stop at **$78.00**. The company pre-announces a disaster overnight and the stock opens at **$61.00**. Your stop triggers and fills near the open:

- Expected loss: 83 × $6.00 = **$498** (1.0% of $50,000)
- Actual loss: 83 × ($84.00 − $61.00) = **$1,909** = **3.8%** of the account

A **stop-limit** order fixes the price and breaks the guarantee of exit instead: with a limit at $77.50 in the example above, nothing fills, and you still own the stock at $61. There is no order type that gives you both. This is why position **caps** exist alongside risk rules, and why single-name overnight event risk deserves its own line in your framework.`,
        },
        {
          kind: 'text',
          md: `**Mental vs hard stops.** A hard stop rests at the broker; a mental stop lives in your head and is executed manually.

| | Hard stop | Mental stop |
|---|---|---|
| Executes when you are away | Yes | No |
| Visible to the market | Yes (resting order) | No |
| Requires discipline in the moment | No | **Yes — completely** |
| Vulnerable to intraday spikes | Yes | Less so |

The honest test for a mental stop is a question about your track record, not your intentions: **have you ever moved one down?** If the answer is yes, use hard stops. Most people fail this test, and the ones who fail it most confidently fail it worst.`,
        },
        {
          kind: 'callout',
          md: `**Practise where it is free.** The paper portfolio exists precisely for this. Before each trade, write the invalidation level into the journal note — *"stop $78.80, below the March swing low; if it trades there the base has failed"* — and then check, weeks later, whether you honoured it. A stop you have never had to obey is a hypothesis about yourself, and the paper account is the cheapest place to test it.`,
        },
        {
          kind: 'keypoint',
          md: `A stop is a pre-committed thesis-invalidation price, decided while calm, that bounds the loss and gives position sizing its denominator. Place it below structure with an ATR buffer — not at round numbers, not at an arbitrary percentage, never inside normal noise. Stop-market orders guarantee exit but not price; stop-limit orders guarantee price but not exit.`,
        },
      ],
      quiz: [
        {
          id: 'u11-l03-q1',
          prompt:
            'You hold 83 shares bought at $84.00 with a stop-market order at $78.00. Bad news breaks overnight and the stock opens at $61.00. What is your approximate loss?',
          choices: [
            '$1,909 — the stop becomes a market order and fills near the open',
            '$498, because the stop guarantees an exit at $78.00',
            '$0, because stops do not execute on gaps',
            '$1,411, the difference between $78.00 and $61.00',
          ],
          answerIdx: 0,
          explain:
            '83 × ($84.00 − $61.00) = $1,909, or 3.8% of a $50,000 account instead of the planned 1.0%. A stop triggers at your price but fills at the next available one, so gap risk is precisely what a maximum-position cap exists to contain.',
        },
        {
          id: 'u11-l03-q2',
          prompt: 'Why should a stop generally not be placed at a round number like $80.00?',
          choices: [
            'Exchanges reject stop orders at round numbers',
            'Round numbers move too slowly to trigger',
            'Resting stop orders cluster there, making it a magnet for a flush before price recovers',
            'Round numbers are always above the relevant support level',
          ],
          answerIdx: 2,
          explain:
            'Tidy figures attract a dense cluster of resting orders, and a brief dip through them triggers a wave of selling that frequently reverses — you get the loss without the information. Sitting below the crowd, with a volatility buffer under real structure, is what keeps the stop meaningful.',
        },
        {
          id: 'u11-l03-q3',
          prompt:
            'A stock trades at $84.00 with an ATR of $2.40 and a recent swing low of $79.40. Where does the structure-based approach put the stop?',
          choices: [
            'At $80.00, the nearest round number',
            'At $77.28, exactly 8% below the entry',
            'At $83.00, close enough to keep the loss small',
            'Just below the swing low with an ATR buffer — around $78.80',
          ],
          answerIdx: 3,
          explain:
            'Swing low $79.40 minus a 0.25 ATR buffer ($0.60) gives $78.80, a distance of $5.20 or 2.17 ATR — outside normal noise and below the obvious round number. The 8% rule produces a number derived from arithmetic that has never looked at the chart, and $83.00 sits well inside a single day of normal movement.',
        },
        {
          id: 'u11-l03-q4',
          prompt:
            'What is the essential trade-off between a stop-market order and a stop-limit order?',
          choices: [
            'Stop-limit orders are cheaper but slower to execute',
            'Stop-market guarantees exit but not price; stop-limit guarantees price but may never fill',
            'Stop-market works only in liquid stocks; stop-limit works only in illiquid ones',
            'Stop-limit orders are the same thing with a different name',
          ],
          answerIdx: 1,
          explain:
            'A stop-market becomes a market order and takes whatever price exists, which after a gap can be far below the trigger; a stop-limit refuses bad prices and can therefore leave you still holding a collapsing position. No order type gives you both guarantees, which is why sizing and position caps carry the rest of the load.',
        },
      ],
      cardSeeds: [
        {
          id: 'u11-l03-c1',
          kind: 'basic',
          front: 'What are the two jobs of a stop loss?',
          back: 'It bounds the loss (giving the position-sizing formula its denominator), and it moves the exit decision to a calm moment before any money is on the line rather than during the drawdown itself.',
        },
        {
          id: 'u11-l03-c2',
          kind: 'cloze',
          front:
            'A stop-market order guarantees ____ but not ____. A stop-limit order guarantees ____ but not ____.',
          back: 'guarantees exit but not price; guarantees price but not exit (it may never fill)',
        },
        {
          id: 'u11-l03-c3',
          kind: 'basic',
          front: 'Where should a stop be placed, and where should it not?',
          back: 'Below structure — the swing low or support zone — plus a volatility buffer (e.g. 0.25 ATR). Not at round numbers where stops cluster, not at an arbitrary fixed percentage, and never inside the stock\'s normal daily noise.',
        },
      ],
    },

    // ── L04 ───────────────────────────────────────────────────────────────
    {
      id: 'u11-l04',
      unitId: 'u11',
      order: 4,
      title: 'Drawdown Math',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Losses and gains are not symmetric, and the asymmetry gets worse the deeper you go. Lose 50% and a 50% gain does **not** get you back — you need 100%, because the gain is computed on a smaller base.

> **Recovery required = drawdown ÷ (1 − drawdown)**

| Drawdown | Gain needed to recover | Years at 8%/yr |
|---|---|---|
| −5% | +5.3% | 0.7 |
| −10% | +11.1% | 1.4 |
| −20% | +25.0% | 2.9 |
| −30% | +42.9% | 4.6 |
| −40% | +66.7% | 6.6 |
| −50% | +100.0% | 9.0 |
| −60% | +150.0% | 11.9 |
| −70% | +233.3% | 15.6 |
| −80% | +400.0% | 20.9 |
| −90% | +900.0% | 29.9 |

The curve is gentle up to about −20% and then bends viciously. **This is the entire argument for risk management**, compressed into one column: a −20% year costs you roughly three years of average market returns; a −50% year costs you nine.`,
        },
        {
          kind: 'example',
          md: `**What a losing streak actually costs, by risk per trade.** Portfolio drawdown after *k* consecutive full-stop losses is 1 − (1 − r)ᵏ:

| Risk per trade | 5 losses | 10 losses | 20 losses | Recovery needed after 20 |
|---|---|---|---|---|
| 1% | −4.9% | −9.6% | −18.2% | +22.3% |
| 2% | −9.6% | −18.3% | −33.2% | +49.8% |
| 5% | −22.6% | −40.1% | −64.2% | +179.0% |
| 10% | −41.0% | −65.1% | −87.8% | +722.5% |

Twenty consecutive losses is rare but entirely possible for a strategy with a 40% win rate. At **1%** risk it is an annoying dent you trade out of in a few months. At **10%** it is the end of the account: you would need to **turn every remaining dollar into eight** to get back to where you started.

The difference between those two rows is not skill, insight, or edge. It is one number, chosen in advance.`,
        },
        {
          kind: 'text',
          md: `**Why survival beats optimisation.** Compounding is multiplicative, so a single zero anywhere in the chain wipes out every term. The strategy with the highest expected return is almost never the one with the highest *median* long-run wealth, because the high-return strategy usually reaches its expectation by occasionally taking catastrophic losses that you personally cannot average over — you only get one life-path, not the ensemble average.

Practically: **you cannot compound if you are not still playing.** A dull 8% with a −15% worst year buries a spectacular 20% that occasionally does −70%, because the 20% strategy hands back a decade every time it misfires. Optimisation asks "how much can I make?" Survival asks "what is the largest loss I can take and still be running the same process next year?" The second question is prior to the first.`,
        },
        {
          kind: 'example',
          md: `**Sequence risk: same returns, different order, different outcome.** With no cash flowing in or out, order does not matter — a portfolio earning −30%, +10%, +40% in any sequence ends at 1.078× its start ($107,800 on $100,000).

Add a **$6,000 annual withdrawal** and order becomes decisive.

**Bad years first** — start $100,000:
- Year 1: ×0.70 = $70,000 → withdraw $6,000 → **$64,000**
- Year 2: ×1.10 = $70,400 → withdraw $6,000 → **$64,400**
- Year 3: ×1.40 = $90,160 → withdraw $6,000 → **$84,160**

**Good years first** — start $100,000:
- Year 1: ×1.40 = $140,000 → withdraw $6,000 → **$134,000**
- Year 2: ×1.10 = $147,400 → withdraw $6,000 → **$141,400**
- Year 3: ×0.70 = $98,980 → withdraw $6,000 → **$92,980**

Identical returns, identical withdrawals, **$8,820** apart. Withdrawing from a shrunken portfolio sells more units to raise the same cash, and those units are never there for the recovery. This is why the years immediately around retirement — or around any period when you are adding *or* drawing meaningful sums — carry outsized weight.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "I lost 50%, so I just need a 50% gain to get back."**

You need **100%**. $100 falling to $50 must double, not rise by half, because the percentage is computed on the reduced balance. The same trap runs in the other direction: a stock that rises 100% and then falls 50% is exactly flat. Percentages do not add — they multiply, and the base moves underneath them.`,
        },
        {
          kind: 'keypoint',
          md: `Recovery required = drawdown ÷ (1 − drawdown). −20% needs +25%, −50% needs +100%, −80% needs +400%. Drawdown after k full-stop losses = 1 − (1 − risk)ᵏ, so risk per trade decides whether a losing streak is a dent or a grave. Survival is prior to optimisation, and with cash flows the sequence of returns matters as much as their average.`,
        },
      ],
      quiz: [
        {
          id: 'u11-l04-q1',
          prompt: 'A portfolio falls 40%. What gain is required to return to the previous high?',
          choices: [
            '+40%',
            '+50%',
            '+66.7%',
            '+140%',
          ],
          answerIdx: 2,
          explain:
            '0.40 / (1 − 0.40) = 0.667, so +66.7% — $100 falls to $60, and $60 must rise by $40 to get back. Answering +40% treats percentages as additive, which is exactly the error that makes deep drawdowns feel survivable when they are not.',
        },
        {
          id: 'u11-l04-q2',
          prompt:
            'An investor risking 10% of capital per trade suffers 20 consecutive losses. What is the approximate drawdown and recovery required?',
          choices: [
            '−87.8% drawdown, needing roughly +722% to recover',
            '−200% drawdown, so the account is twice wiped out',
            '−18.2% drawdown, needing roughly +22% to recover',
            '−65% drawdown, needing roughly +186% to recover',
          ],
          answerIdx: 0,
          explain:
            '1 − 0.90²⁰ = 0.878, and recovering from −87.8% requires 0.878 / 0.122 = +722%. The −18.2% figure is the same streak at 1% risk per trade — the identical run of bad luck, differing only by a number chosen before any of it happened.',
        },
        {
          id: 'u11-l04-q3',
          prompt:
            'Two portfolios earn −30%, +10%, and +40% over three years. One takes those returns in that order, the other in reverse. Both withdraw $6,000 a year. What happens?',
          choices: [
            'They end identically, because multiplication is commutative',
            'The bad-years-first portfolio ends higher, having sold fewer units early',
            'The difference depends only on the size of the withdrawal, not the order',
            'The good-years-first portfolio ends about $8,800 higher ($92,980 vs $84,160)',
          ],
          answerIdx: 3,
          explain:
            'Withdrawing a fixed sum from a shrunken portfolio liquidates more units, and those units are gone before the recovery arrives — hence $92,980 against $84,160 from identical returns. Order is irrelevant only when no money moves in or out, which is exactly the assumption that fails for anyone contributing or drawing down.',
        },
        {
          id: 'u11-l04-q4',
          prompt:
            'Why might a strategy with a lower expected return produce more wealth over a lifetime than one with a higher expected return?',
          choices: [
            'Lower-return strategies have lower fees by definition',
            'Expected returns are always overstated for aggressive strategies',
            'Compounding is multiplicative, so occasional catastrophic losses destroy the whole chain — and you live one path, not the ensemble average',
            'High-return strategies are taxed at a higher rate',
          ],
          answerIdx: 2,
          explain:
            'A −70% year hands back a decade of progress, and the arithmetic mean that makes the aggressive strategy look attractive is an average across paths you will never get to run in parallel. Survival is what allows compounding to happen at all, which is why the largest tolerable loss is a prior constraint rather than an afterthought.',
        },
        {
          id: 'u11-l04-q5',
          prompt:
            'Roughly how long does it take to recover a 50% drawdown if the portfolio then compounds at 8% a year?',
          choices: [
            'About 5 years',
            'About 9 years',
            'About 6.5 years',
            'About 12.5 years',
          ],
          answerIdx: 1,
          explain:
            'Recovering −50% requires doubling, and at 8% a year doubling takes ln(2) / ln(1.08) ≈ 9.0 years. Framing drawdowns in years of forgone compounding rather than percentage points is what makes their true cost visible.',
        },
      ],
      cardSeeds: [
        {
          id: 'u11-l04-c1',
          kind: 'cloze',
          front: 'Recovery required = ____ ÷ (1 − ____).',
          back: 'drawdown ÷ (1 − drawdown). −20% → +25%; −50% → +100%; −80% → +400%.',
        },
        {
          id: 'u11-l04-c2',
          kind: 'cloze',
          front: 'Portfolio drawdown after k consecutive full-stop losses = 1 − (1 − ____)^____.',
          back: '1 − (1 − risk per trade)^k. At 1% risk, 20 losses = −18.2%; at 10% risk, 20 losses = −87.8%.',
        },
        {
          id: 'u11-l04-c3',
          kind: 'basic',
          front: 'What is sequence risk, and when does it bite?',
          back: 'The order of returns changes the outcome whenever money is being added or withdrawn. Poor returns early force you to sell more units to fund the same withdrawal, and those units are not there for the recovery — identical returns in reverse order can differ by thousands of dollars.',
        },
        {
          id: 'u11-l04-c4',
          kind: 'basic',
          front: 'Why does survival take priority over optimisation?',
          back: 'Compounding is multiplicative, so one catastrophic loss cancels every prior gain, and you only get one path rather than the ensemble average. The right first question is "what is the biggest loss I can take and still run this process next year?" — return maximisation comes second.',
        },
      ],
    },

    // ── L05 ───────────────────────────────────────────────────────────────
    {
      id: 'u11-l05',
      unitId: 'u11',
      order: 5,
      title: 'Diversification & Correlation',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Diversification is the only thing in investing that reduces risk without reducing expected return — which is why it gets called the one free lunch in finance. But it only works to the extent that your holdings are **not the same bet**, and that condition is much harder to satisfy than counting names.

For an equal-weighted portfolio of *n* stocks each with volatility σ and average pairwise correlation ρ:

> **Portfolio variance = σ² × [ (1/n) + (1 − 1/n) × ρ ]**

The **1/n** term is the idiosyncratic risk — company-specific news, a failed product, a fraud — and it vanishes as you add names. The **ρ** term is the shared, market-wide risk, and no amount of adding names removes it.`,
        },
        {
          kind: 'example',
          md: `**How many positions?** Individual stock volatility σ = **35%**, average pairwise correlation ρ = **0.30**:

| Positions | Portfolio volatility | Effective independent names |
|---|---|---|
| 1 | 35.0% | 1.0 |
| 2 | 28.2% | 1.5 |
| 5 | 23.2% | 2.3 |
| 10 | 21.3% | 2.7 |
| 20 | 20.3% | 3.0 |
| 30 | 19.9% | 3.1 |
| 50 | 19.6% | 3.2 |
| ∞ | 19.2% | 3.3 |

Going from 1 name to 10 removes **13.7 points** of volatility. Going from 10 to 30 removes **1.4 more**. The curve is essentially flat after about 20 positions, which is why most practitioners land on **15–25 names** for a concentrated portfolio: enough that no single accident is fatal, few enough that you can actually know what you own.

Note the ceiling. With ρ = 0.30, the most diversification you can *ever* buy is **1 / 0.30 = 3.3** independent names' worth, no matter how many tickers you hold.`,
        },
        {
          kind: 'example',
          md: `**Ten tech stocks are not ten positions.** Same σ = 35%, but within a single theme the average pairwise correlation is more like **0.75**:

- Ten names at ρ = 0.30 → portfolio volatility **21.3%**, worth **2.7** independent names.
- Ten names at ρ = 0.75 → portfolio volatility **30.8%**, worth **1.29** independent names.

Ten "different" cloud, semiconductor, and internet stocks behave like roughly **1.3 stocks**. And the ceiling is even more brutal: 1 / 0.75 = **1.33**, so buying the eleventh, the twentieth, and the fiftieth name in the same theme buys you essentially **nothing**.

Worse, correlations are not stable. They rise exactly when you need them low: in a genuine market panic, cross-asset correlations converge toward 1 as everything is sold at once for liquidity. A portfolio that looks diversified in calm markets can turn out to have been one bet the whole time.`,
        },
        {
          kind: 'text',
          md: `**Find your clusters, not your count.** The useful exercise is to group holdings by what would actually hurt them, then read the weights:

| Cluster | Weight |
|---|---|
| Rate-sensitive growth (software, unprofitable tech, long-duration) | 38% |
| Consumer discretionary (retail, travel, autos) | 22% |
| Energy & materials | 14% |
| Healthcare | 12% |
| Cash | 14% |

Twelve tickers, but the first row is a single position on the level of interest rates. Common hidden clusters: same customer (three suppliers to one automaker), same input (an oil price), same regulator, same country risk, same factor (all deep value, all momentum), and same currency.`,
        },
        {
          kind: 'callout',
          md: `**Why the app warns above 20% in one name.** TickerQuest's paper-trading confirm screen flags any purchase that would take a single position above **20% of equity**, with the note that it is *"a bet on a company, not a portfolio."* The arithmetic behind that line:

| Single-name weight | Portfolio hit if it goes to zero | Recovery needed | Portfolio hit if it halves |
|---|---|---|---|
| 5% | −5.0% | +5.3% | −2.5% |
| 10% | −10.0% | +11.1% | −5.0% |
| 20% | −20.0% | +25.0% | −10.0% |
| 40% | −40.0% | +66.7% | −20.0% |

At 20%, a single fraud, failed trial, or accounting restatement costs a fifth of everything and demands a +25% recovery. Above that, one company's specific and unknowable risks start to dominate a portfolio you built for other reasons. The warning does not block the trade — concentration is a legitimate choice — it just makes sure you made it deliberately.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Diversification kills returns."**

Diversification reduces **variance**, not **expected return**. A portfolio's expected return is the weighted average of its holdings' expected returns, so adding a name with equal expected return leaves the average untouched while lowering the volatility around it. What diversification genuinely costs you is the **extremes** — you give up the chance that one holding at 40% weight makes your decade. Since you cannot know in advance which name that would be, and since the same concentration is what makes a −50% year possible, that is usually a trade worth making. "Diversification is protection against ignorance," as Buffett put it — and everyone is ignorant about the specific thing that goes wrong.`,
        },
        {
          kind: 'keypoint',
          md: `Portfolio variance = σ² × [(1/n) + (1 − 1/n)ρ]. Idiosyncratic risk falls with the number of names; correlated risk does not, and caps total diversification at 1/ρ independent names. Most of the benefit arrives by 15–25 uncorrelated positions. Count clusters, not tickers — ten tech stocks at ρ = 0.75 are worth about 1.3 independent names. Diversification cuts variance, not expected return.`,
        },
      ],
      quiz: [
        {
          id: 'u11-l05-q1',
          prompt:
            'An investor holds ten technology stocks with an average pairwise correlation of 0.75. Roughly how much independent diversification does that provide?',
          choices: [
            'Ten names, since each is a separate company',
            'About seven and a half names, scaled by the correlation',
            'None at all — correlated holdings provide no benefit',
            'About 1.3 names — and the ceiling at that correlation is 1.33 no matter how many are added',
          ],
          answerIdx: 3,
          explain:
            'Effective names = 1 / [(1/10) + (0.9 × 0.75)] = 1 / 0.775 = 1.29, against a theoretical maximum of 1 / 0.75 = 1.33. There is a real but tiny benefit, and the important consequence is that the eleventh and fiftieth names in the same theme add essentially nothing.',
        },
        {
          id: 'u11-l05-q2',
          prompt:
            'A 20% position in a single stock goes to zero. What return is then required to get the portfolio back to its previous value?',
          choices: [
            '+20.0%',
            '+25.0%',
            '+5.3%',
            '+80.0%',
          ],
          answerIdx: 1,
          explain:
            'A 20% weight going to zero is a −20% portfolio drawdown, and 0.20 / 0.80 = +25%. Answering +20% forgets that the gain is computed on the reduced base — the same asymmetry that gives the 20% concentration warning its arithmetic.',
        },
        {
          id: 'u11-l05-q3',
          prompt:
            'Moving from 10 positions to 30 positions (σ = 35%, ρ = 0.30) reduces portfolio volatility from 21.3% to 19.9%. What does this illustrate?',
          choices: [
            'Diversification benefits diminish sharply — most of the gain arrives well before 30 names',
            'Portfolio volatility falls linearly with the number of positions',
            'Thirty names is the minimum needed for adequate diversification',
            'Correlation has no effect once you exceed ten positions',
          ],
          answerIdx: 0,
          explain:
            'Going from 1 name to 10 strips out 13.7 points of volatility while 10 to 30 removes only 1.4 more, because idiosyncratic risk falls as 1/n while the correlated component never moves. That flattening is what justifies a 15–25 name portfolio you can actually follow over a 60-name one you cannot.',
        },
        {
          id: 'u11-l05-q4',
          prompt: 'Which statement about diversification and returns is correct?',
          choices: [
            'Diversification lowers expected return proportionally to the number of holdings',
            'Diversification raises expected return by capturing more opportunities',
            'It reduces variance, not expected return — a portfolio\'s expected return is the weighted average of its holdings',
            'Diversification only matters for investors with more than $1 million',
          ],
          answerIdx: 2,
          explain:
            'Adding a holding with the same expected return leaves the weighted average untouched while lowering the dispersion around it, which is the sense in which it is a free lunch. What you give up is the tail on both sides — no single position can make your decade, and no single position can end it.',
        },
      ],
      cardSeeds: [
        {
          id: 'u11-l05-c1',
          kind: 'cloze',
          front:
            'Equal-weighted portfolio variance = σ² × [ (1/____) + (1 − 1/____) × ____ ].',
          back: 'σ² × [(1/n) + (1 − 1/n) × ρ] — the 1/n term is idiosyncratic risk and vanishes with more names; the ρ term is shared risk and never does.',
        },
        {
          id: 'u11-l05-c2',
          kind: 'basic',
          front: 'Why are ten technology stocks not a diversified portfolio?',
          back: 'Within one theme the average pairwise correlation is around 0.75, so ten names behave like about 1.3 independent positions — and the ceiling at that correlation is 1/0.75 = 1.33 names, however many you add. Count correlation clusters, not tickers.',
        },
        {
          id: 'u11-l05-c3',
          kind: 'basic',
          front: 'What is the arithmetic rationale for a 20% single-name concentration warning?',
          back: 'A 20% position going to zero is a −20% portfolio drawdown requiring +25% to recover, and a mere halving costs 10% of everything. Above that weight, one company\'s unknowable specific risks — fraud, a failed trial, a restatement — start to dominate the whole portfolio.',
        },
      ],
    },

    // ── L06 ───────────────────────────────────────────────────────────────
    {
      id: 'u11-l06',
      unitId: 'u11',
      order: 6,
      title: 'Kelly Intuition',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Fixed-fractional sizing picks a number like 1% and applies it everywhere. But surely a bet with a large edge deserves more than a bet with a small one? The **Kelly criterion** answers that question exactly: it gives the bet size that maximises the long-run **compound growth rate** of your capital.

For a bet that pays *b* to 1 and wins with probability *p* (with q = 1 − p):

> **f\\* = (p × b − q) ÷ b = p − q ÷ b**

- Coin flip, even money, **55% edge**: f\\* = 0.55 − 0.45 = **10%** of bankroll.
- Coin flip, even money, **60% edge**: f\\* = 0.60 − 0.40 = **20%**.
- 40% win rate at **3:1** odds: f\\* = 0.40 − 0.60/3 = **20%**.

The formula's shape is the useful part: **bet size rises with edge and falls with odds against you**. Where there is no edge (p × b = q), Kelly says bet **zero** — and it says so before it says anything else.`,
        },
        {
          kind: 'example',
          md: `**Why full Kelly is violent.** A 60/40 even-money bet (f\\* = 20%), 100 wagers with exactly 60 wins and 40 losses, starting from $1:

| Fraction bet | Final multiple | Comment |
|---|---|---|
| 5% (quarter Kelly) | **2.40×** | Slow and calm |
| 10% (half Kelly) | **4.50×** | ~75% of maximum growth |
| **20% (full Kelly)** | **7.49×** | Maximum growth rate |
| 40% (double Kelly) | **0.78×** | **A loss** — with a 60% win rate |
| 50% | **0.03×** | 97% of capital gone |

Two facts do all the work here.

1. **The peak is flat and the cliff is not.** Half Kelly captures about **75%** of the maximum growth rate while halving the bet size — and roughly quartering the drawdowns.
2. **Double Kelly grows at exactly zero.** Past that point, growth turns negative: you can have a genuine, large, correctly-identified edge and still go broke purely by betting too much of it.

And even at the optimum, full Kelly is emotionally unlivable. Betting 20% of everything on one flip means routine 40–50% drawdowns; the standard result is that a full-Kelly bettor has roughly a **50% chance of halving their bankroll** at some point along the way.`,
        },
        {
          kind: 'text',
          md: `**The uncertainty problem, which is the real one.** Kelly assumes you know *p* and *b*. In a casino you do. In markets you are **estimating** them from a small, noisy, non-stationary sample — and your estimate is biased upward, because the strategies you noticed are the ones that happened to work.

Watch what one small error does. You believe your edge is 60/40, so full Kelly says bet **20%**. The truth is 55/45, where full Kelly is **10%**. You are now betting **double Kelly** — the row of the table where long-run growth is exactly **zero**. A five-percentage-point overestimate of your own accuracy converted an optimal strategy into a pointless one.

This is why practitioners who use Kelly at all use **fractional Kelly** — typically a quarter to a half — and why fixed-fractional sizing at 1–2% (which is far *below* quarter Kelly for most realistic edges) is the sane default. Kelly is best treated as an **upper bound and a direction of travel**, not a formula to type into a spreadsheet.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "More conviction means a bigger position."**

Conviction is a **feeling**. Kelly needs a **calibrated probability** — and the gap between the two is exactly what Unit 12, Lesson 3 is about. Before letting confidence scale your size, you need evidence that your confidence tracks your accuracy.

That evidence is buildable. TickerQuest's what-next drills ask you to commit to **50%, 70%, or 90%** on every answer and then plot your realised accuracy in each bucket. If your 90% answers come in at 62%, your "high conviction" is worth about 0.6, and sizing off it is sizing off noise. Earn the right to bet bigger by demonstrating calibration first — that is what the drill scoring is for, and it is why claiming 90% and being wrong costs you points.`,
        },
        {
          kind: 'callout',
          md: `**Extra reasons real-world Kelly is too big.** (1) Your bets are **correlated**, so ten simultaneous 10% positions in one theme are not ten independent Kelly bets — they are closer to one enormous one. (2) Stock outcomes are not binary; a "loss" is a distribution, not a fixed −1. (3) Edges **decay**: the *p* you measured last year may not exist now. (4) Kelly maximises the *median* long-run outcome with no regard for the path, and human beings quit part-way along paths they cannot stomach. Every one of these pushes the practical answer **down**.`,
        },
        {
          kind: 'keypoint',
          md: `Kelly: f* = p − q/b, the bet size maximising long-run compound growth. Half Kelly delivers about 75% of the growth at half the size; double Kelly delivers exactly zero growth; beyond that a genuine edge still ruins you. Because p is estimated and estimates are optimistic, use fractional Kelly — a quarter to a half — and treat conviction as sizeable only once calibration data says it tracks accuracy.`,
        },
      ],
      quiz: [
        {
          id: 'u11-l06-q1',
          prompt:
            'What does the Kelly criterion maximise, and what is f* for an even-money bet won 60% of the time?',
          choices: [
            'Expected dollar profit per bet; f* = 60%',
            'Long-run compound growth rate; f* = 20% of bankroll',
            'The probability of never losing; f* = 0%',
            'Total number of winning bets; f* = 40%',
          ],
          answerIdx: 1,
          explain:
            'f* = p − q/b = 0.60 − 0.40/1 = 0.20, and Kelly targets the growth *rate* of capital rather than profit on any single bet. Maximising expected dollar profit would tell you to bet everything every time, which reaches zero with probability approaching one.',
        },
        {
          id: 'u11-l06-q2',
          prompt:
            'Betting half of the Kelly fraction rather than the full amount produces roughly what share of the maximum growth rate?',
          choices: [
            'About 25%',
            'About 50%',
            'Exactly 100% — the peak is flat',
            'About 75%',
          ],
          answerIdx: 3,
          explain:
            'The growth curve is a downward parabola around f*, so halving the bet gives up only about a quarter of the growth while roughly quartering the drawdowns. That asymmetry — flat on the upside of the peak, steep past it — is the entire argument for fractional Kelly.',
        },
        {
          id: 'u11-l06-q3',
          prompt:
            'An investor bets exactly twice the Kelly fraction on a genuinely positive-edge opportunity. What is the long-run outcome?',
          choices: [
            'Zero growth — and past double Kelly, growth turns negative and capital erodes',
            'Twice the growth rate, since the edge is real',
            'The same growth rate with higher volatility',
            'Slightly lower growth but faster compounding of wins',
          ],
          answerIdx: 0,
          explain:
            'Growth is zero at exactly 2f* and negative beyond it — in the worked table, betting 40% on a 60/40 edge turns $1 into $0.78 over 100 bets. A correct, well-identified edge is not protection against overbetting it; sizing is a separate decision from being right.',
        },
        {
          id: 'u11-l06-q4',
          prompt:
            'You estimate your edge at 60/40 and bet full Kelly (20%). Your true edge is 55/45. What have you actually done?',
          choices: [
            'Slightly overbet, costing a small amount of growth',
            'Nothing significant — Kelly is robust to small estimation errors',
            'Bet double the true Kelly of 10%, reducing long-run growth to zero',
            'Underbet, since a 55% edge still justifies more than 20%',
          ],
          answerIdx: 2,
          explain:
            'True f* = 0.55 − 0.45 = 10%, so a 20% bet is exactly double Kelly, the point where compound growth vanishes. Because p is estimated from noisy data and estimates skew optimistic, this five-point error is entirely ordinary — which is why practitioners use a quarter to a half of the computed figure.',
        },
        {
          id: 'u11-l06-q5',
          prompt:
            'Why is "I have high conviction" a poor basis for increasing position size?',
          choices: [
            'Conviction is always inversely related to returns',
            'Conviction is a feeling, and it only justifies size if calibration data shows your confidence tracks your actual accuracy',
            'Position size should never vary between ideas',
            'High conviction ideas are usually already fully priced by the market',
          ],
          answerIdx: 1,
          explain:
            'Kelly needs a calibrated probability, and confidence is only a probability if 90% claims come in right about 90% of the time — which is what the app\'s 50/70/90 drill buckets measure. Until that evidence exists, scaling size with conviction is scaling it with noise, and drill scoring penalises confident errors precisely to expose the gap.',
        },
      ],
      cardSeeds: [
        {
          id: 'u11-l06-c1',
          kind: 'cloze',
          front: 'Kelly fraction f* = ____ − ____ ÷ ____, where b is the payoff odds.',
          back: 'f* = p − q ÷ b (equivalently (pb − q)/b). Even money at 55/45 gives 10%; at 60/40 gives 20%.',
        },
        {
          id: 'u11-l06-c2',
          kind: 'basic',
          front: 'What happens at half Kelly, and what happens at double Kelly?',
          back: 'Half Kelly captures about 75% of the maximum growth rate with roughly a quarter of the drawdown. Double Kelly grows at exactly zero, and beyond it growth is negative — a real edge, overbet, still ruins you.',
        },
        {
          id: 'u11-l06-c3',
          kind: 'basic',
          front: 'Why do practitioners use fractional Kelly instead of the full formula?',
          back: 'Kelly assumes p and b are known; in markets they are noisy, upward-biased estimates. Overestimating a 55/45 edge as 60/40 makes full Kelly into double Kelly and zero growth. Correlated bets, non-binary outcomes, decaying edges, and unbearable drawdowns all push the practical size lower still.',
        },
        {
          id: 'u11-l06-c4',
          kind: 'basic',
          front: 'What has to be true before conviction is allowed to increase position size?',
          back: 'Your confidence has to be calibrated — 90% claims right about 90% of the time. The what-next drills measure exactly this by asking for 50/70/90 on every answer and plotting realised accuracy per bucket. Uncalibrated conviction is a feeling, not a probability.',
        },
      ],
    },

    // ── L07 ───────────────────────────────────────────────────────────────
    {
      id: 'u11-l07',
      unitId: 'u11',
      order: 7,
      title: 'Risk of Ruin',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `**Risk of ruin** is the probability that a run of bad luck takes your capital below the point of no return *before* your edge has time to assert itself. It is a function of three things and nothing else: the size of your **edge**, the size of your **bets relative to capital**, and the **number of bets** you take.

For repeated even-money bets of a fixed size, with win probability *p* and *U* units of capital (where one unit is one bet):

> **P(ruin) = (q ÷ p)^U**, where q = 1 − p

The exponent is the whole story. **U = capital ÷ risk per bet**, so halving your bet size squares your survival odds. That is not a figure of speech — it is literally what raising a fraction below 1 to double the power does.`,
        },
        {
          kind: 'example',
          md: `**A real, positive edge — a 55% win rate at even money — sized four different ways.**

| Risk per bet | Units of capital (U) | Probability of ruin |
|---|---|---|
| 20% | 5 | **36.7%** |
| 10% | 10 | **13.4%** |
| 5% | 20 | **1.8%** |
| 2% | 50 | **0.004%** |
| 1% | 100 | **~0%** |

Same strategy. Same edge. Same skill. The only thing that changed is the bet size — and the probability of losing everything moves from **more than one in three** to effectively zero.

**Now make the edge enormous** — a 60% win rate, which almost nobody has:

| Risk per bet | U | Probability of ruin |
|---|---|---|
| 20% | 5 | **13.2%** |
| 10% | 10 | **1.7%** |
| 5% | 20 | **0.03%** |

Even a 60/40 edge blows up **one time in eight** if you bet a fifth of the account each time. **Overbetting a positive edge is still ruin** — it just takes a little longer and feels better on the way.`,
        },
        {
          kind: 'text',
          md: `**The no-edge case.** When p = 0.50, q/p = 1 and the formula returns **P(ruin) = 1** for any U. With no edge, ruin is not a risk, it is a **destination** — the only variable is how long the journey takes. With p below 0.50, the same conclusion arrives faster.

This is why "size it small" is not, by itself, a strategy. Small bets buy you **time** for a real edge to show up in the results. They cannot manufacture an edge that is not there, and against a negative edge (which is what an ordinary trader with costs, spread, and taxes has) they simply extend the runway.

Note also that the classic formula assumes a **fixed** bet size. With **fixed-fractional** sizing you bet a percentage of what remains, so literal zero is never reached — you asymptote toward it. In practice that is a distinction without a difference, because real ruin arrives long before zero.`,
        },
        {
          kind: 'callout',
          md: `**Practical ruin comes before mathematical ruin.** Your account does not need to reach $0 for you to be finished. Ruin is whichever of these arrives first:

- **Arithmetic ruin** — the drawdown needs a recovery you will not plausibly get (−80% needs +400%).
- **Psychological ruin** — you stop being able to execute the process. You skip the next valid signal, or you double up to get even, or you stop looking at the account entirely.
- **Structural ruin** — a margin call, a redemption, or a life event forces liquidation at the bottom, converting a temporary drawdown into a permanent loss.

Most people meet the second one long before the first. Set your maximum acceptable drawdown at the level where **you** would stop following your own rules, not at the level where the spreadsheet says the money runs out.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "I have a positive edge, so I cannot go broke."**

An edge changes the *distribution* of outcomes, not the *possibility* of a terrible one. A 55% edge bet at 20% of capital ruins you 36.7% of the time. The edge determines whether you are favoured over many repetitions; the bet size determines whether you survive long enough to get them. Both have to be right, and the sizing decision is the one you fully control.`,
        },
        {
          kind: 'keypoint',
          md: `P(ruin) = (q/p)^U for even-money bets, where U = capital ÷ risk per bet. A genuine 55% edge ruins you 36.7% of the time at 20% risk per bet and effectively never at 1–2%. With no edge, ruin is certain given enough time. Practical ruin — the drawdown at which you stop following your own process — arrives long before the account reaches zero.`,
        },
      ],
      quiz: [
        {
          id: 'u11-l07-q1',
          prompt: 'Risk of ruin depends on which three factors?',
          choices: [
            'The size of the edge, the bet size relative to capital, and the number of bets taken',
            'Market volatility, interest rates, and portfolio turnover',
            'Win rate, holding period, and tax bracket',
            'Broker fees, account type, and asset class',
          ],
          answerIdx: 0,
          explain:
            'The formula (q/p)^U contains exactly the edge (through p) and the bet size (through U = capital / risk per bet), with the number of bets governing how much time the process has to play out. Everything else affects returns without changing the structure of the survival problem.',
        },
        {
          id: 'u11-l07-q2',
          prompt:
            'An investor with a genuine 55% win rate at even money risks 20% of capital per bet. Roughly what is the probability of ruin?',
          choices: [
            'Essentially zero, because the edge is positive',
            'About 5%',
            'About 37%',
            'About 80%',
          ],
          answerIdx: 2,
          explain:
            '20% risk means U = 5 units, so (0.45/0.55)⁵ = 36.7% — more than one chance in three of losing everything despite a real edge. Cutting the bet to 2% takes U to 50 and the same edge to a ruin probability of about 0.004%.',
        },
        {
          id: 'u11-l07-q3',
          prompt:
            'What does the risk-of-ruin formula say about a strategy with no edge at all (p = 0.50)?',
          choices: [
            'Ruin is impossible as long as bets stay under 1% of capital',
            'Ruin probability equals the bet size as a percentage',
            'Ruin probability is 50%, matching the win rate',
            'Ruin is certain given enough bets — small sizing only buys time',
          ],
          answerIdx: 3,
          explain:
            'At p = 0.50, q/p = 1 and 1 raised to any power is 1, so the probability of eventual ruin is 100% regardless of how small the bets are. Sizing buys time for a genuine edge to appear in the results; it cannot create one, which is why costs alone turn an even game into a losing one.',
        },
        {
          id: 'u11-l07-q4',
          prompt: 'What is "psychological ruin" and why does it matter more than the mathematical kind?',
          choices: [
            'The point at which trading stops being enjoyable, which is unrelated to results',
            'The drawdown at which you stop executing your process — skipping valid signals or doubling up — which almost always arrives before the account reaches zero',
            'A diagnosable condition requiring professional treatment before investing',
            'The point at which a broker restricts the account for excessive losses',
          ],
          answerIdx: 1,
          explain:
            'A process you abandon at −35% has exactly the same result as one that reached zero: the edge stops being applied. This is why the maximum acceptable drawdown should be set where *you* would stop following your rules, rather than where the arithmetic says the money runs out.',
        },
      ],
      cardSeeds: [
        {
          id: 'u11-l07-c1',
          kind: 'cloze',
          front: 'For even-money bets, P(ruin) = (____ ÷ ____)^____, where U = ____ ÷ ____.',
          back: '(q ÷ p)^U, where U = capital ÷ risk per bet. Halving the bet size doubles U, which squares the survival odds.',
        },
        {
          id: 'u11-l07-c2',
          kind: 'basic',
          front: 'A 55% edge at even money: what is the risk of ruin at 20% risk per bet versus 2%?',
          back: '36.7% at 20% risk (U = 5) versus about 0.004% at 2% risk (U = 50). Same edge, same skill — the difference is entirely the bet size, which is the part you fully control.',
        },
        {
          id: 'u11-l07-c3',
          kind: 'basic',
          front: 'Name the three kinds of ruin, and which one usually arrives first.',
          back: 'Arithmetic ruin (a drawdown needing an implausible recovery), psychological ruin (you stop executing the process), and structural ruin (a margin call or forced liquidation). Psychological ruin almost always comes first, so set the maximum drawdown where you would stop obeying your own rules.',
        },
      ],
    },

    // ── L08 ───────────────────────────────────────────────────────────────
    {
      id: 'u11-l08',
      unitId: 'u11',
      order: 8,
      title: 'A Personal Risk Framework',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Everything in this unit is useless as knowledge and valuable only as **rules written down before you need them**. The point of writing them is not that the rules are optimal — they will not be — but that they are decided in a state of mind you will not have available when the market is doing something frightening.

A workable framework has five layers, each answering a different question:

1. **Per-position** — how much can one idea cost me?
2. **Per-cluster** — how much can one *theme* cost me?
3. **Portfolio** — how much can everything cost me at once?
4. **Response** — what do I do when the drawdown arrives anyway?
5. **Review** — how do I tell a bad decision from a bad outcome?`,
        },
        {
          kind: 'example',
          md: `**A concrete framework, filled in for a $50,000 account.**

**Layer 1 — Per-position**
- Risk per position: **1% of current equity** = $500
- Position size = risk $ ÷ stop distance; **always round down**
- Maximum single position: **20% of equity** at cost — the app's concentration warning, treated as a hard ceiling rather than a suggestion
- Every position gets a written stop and a written thesis **before** the order goes in

**Layer 2 — Per-cluster**
- Maximum **30%** of equity in one sector or correlated theme
- Maximum **40%** in any one macro factor (rates, oil, a single currency)
- No more than **two** positions dependent on the same customer or input

**Layer 3 — Portfolio**
- Maximum **total open risk** (sum of all stop distances): **6% of equity**
- Minimum cash: **10%**
- Maximum positions: **12** — beyond that I cannot honestly follow them

**Layer 4 — Drawdown response ladder**

| Portfolio drawdown | Action |
|---|---|
| −10% | Halve risk per position to 0.5%. No new themes. |
| −15% | No new positions at all. Re-read every journal note from the drawdown. |
| −20% | Flat or paper-only for 30 days. Full written review before restarting. |

**Layer 5 — Review**
- Weekly: is any rule currently being broken?
- Quarterly: score every closed trade on **process**, then separately on outcome`,
        },
        {
          kind: 'example',
          md: `**The framework applied — a live portfolio.** $50,000, 1% risk, stops set on structure.

| Position | Sector | Entry | Stop | Distance | Shares | Cost | Weight | Risk $ |
|---|---|---|---|---|---|---|---|---|
| Northwind Software | Tech | $84.00 | $77.30 | $6.70 | 74 | $6,216 | 12.4% | $495.80 |
| Sable Instruments | Industrials | $52.00 | $46.80 | $5.20 | 96 | $4,992 | 10.0% | $499.20 |
| Harbor Grocers | Staples | $37.50 | $34.50 | $3.00 | 166 | $6,225 | 12.5% | $498.00 |
| Corvus Packaging | Materials | $28.00 | $25.20 | $2.80 | 178 | $4,984 | 10.0% | $498.40 |
| Meridian Health | Healthcare | $115.00 | $103.50 | $11.50 | 43 | $4,945 | 9.9% | $494.50 |
| Kestrel Devices | Tech | $61.00 | $54.90 | $6.10 | 81 | $4,941 | 9.9% | $494.10 |
| **Total** | | | | | | **$32,303** | **64.6%** | **$2,980.00** |

**Check it against the rules:**

- Largest position **12.5%** — under the 20% ceiling ✓
- Tech cluster = $6,216 + $4,941 = **$11,157 = 22.3%** — under the 30% sector cap ✓
- Total open risk **$2,980 = 5.96%** — just under the 6% cap ✓
- Cash $17,697 = **35.4%** — above the 10% floor ✓
- Six positions — under the 12-name maximum ✓

**The worst realistic day.** If every stop is hit at once, equity falls to **$47,020** — a **−5.96%** drawdown needing **+6.3%** to recover. Survivable, and unremarkable. That number is the whole point: a portfolio built this way has a *known* answer to "how bad can today be?"

**And the rules bite.** A seventh idea in tech at a 12% weight would push the cluster to 34.3%, over the 30% cap. The framework does not say "that is a bad company" — it says **not in this portfolio, not at this weight, not today**.`,
        },
        {
          kind: 'callout',
          md: `**Watch the stop-distance identity.** Because position weight = risk % ÷ stop distance %, a 1% risk rule with a **5%** stop lands you at exactly a **20%** position — right on the concentration warning. Tight stops and position caps are not two independent rules; they collide. When they do, the **cap wins**, because the cap is protection against the stop failing (a gap, a halt, a fraud) and the stop cannot protect against itself.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Risk rules are for traders. I am a long-term investor."**

Time horizon changes what your stop looks like — a thesis-invalidation review instead of a price trigger — but it does not repeal any of the arithmetic. Long-term investors still face −50% drawdowns needing +100%, still hold correlation clusters they have not noticed, still concentrate into whatever went up most recently, and still abandon good processes at the bottom. If anything the discipline matters **more**, because the feedback is slower and the position has had years to become part of your identity. A buy-and-hold framework simply swaps price stops for written invalidation conditions, position caps for rebalancing bands, and per-trade review for an annual one.`,
        },
        {
          kind: 'text',
          md: `**Write it down, then use the paper account to find out whether you obey it.** Rules that live only in your head get quietly rewritten under pressure, and you will not notice the edit. So:

1. Write the five layers with **your** numbers — the ones you would actually follow, not the ones that sound impressive.
2. Put the stop and the thesis into the **journal note** on every paper trade.
3. Answer drills at **50/70/90** and check whether your confidence deserves to size anything.
4. Once a quarter, read the notes and count: how many rules did I break, and what did breaking them cost?

That last count is the real measure. Anyone can write a risk framework. The framework is only real once there is evidence you followed it on a day you did not want to.`,
        },
        {
          kind: 'keypoint',
          md: `A personal framework has five layers: per-position risk and a maximum position size, per-cluster sector and factor caps, portfolio-level total open risk and a cash floor, a written drawdown response ladder, and a review that scores process separately from outcome. Write the numbers down in advance, put the stop and thesis in the journal note, and audit adherence quarterly — the rules only exist if you can prove you followed them.`,
        },
      ],
      quiz: [
        {
          id: 'u11-l08-q1',
          prompt:
            'A portfolio holds six positions each risking about $500 against $50,000 of equity. What is the total open risk, and what does it mean?',
          choices: [
            '$3,000 of capital is invested, or 6% of the portfolio',
            '6% of equity would be lost if every stop were hit at once — a −5.96% drawdown needing +6.3% to recover',
            '$500, because only one stop can trigger at a time',
            '$32,303, the total cost of the positions',
          ],
          answerIdx: 1,
          explain:
            'Total open risk sums the dollars between entry and stop across all positions: about $2,980 here, or 5.96% of equity, taking the account to $47,020 in the worst simultaneous case. It is not the amount invested ($32,303) — the two answer completely different questions.',
        },
        {
          id: 'u11-l08-q2',
          prompt:
            'Two positions in the same sector total $11,157 of a $50,000 portfolio, and a seventh idea in that sector would add another 12%. What does a 30% sector cap require?',
          choices: [
            'Skip or resize the trade — the cluster would reach 34.3%, over the cap',
            'Take it, since each individual position is still under the 20% single-name limit',
            'Take it and reduce the risk percentage on that one trade to 0.5%',
            'Take it, because sector caps only apply to portfolios over 12 positions',
          ],
          answerIdx: 0,
          explain:
            '$11,157 + $6,000 = $17,157, or 34.3% of equity, which breaks the cluster rule even though no individual name breaks the single-position rule. Cutting the risk percentage would shrink the position but leaves the cluster limit as the binding constraint — the rule is about correlated exposure, not per-trade loss.',
        },
        {
          id: 'u11-l08-q3',
          prompt:
            'Why should a drawdown response ladder be written before the drawdown, rather than decided during one?',
          choices: [
            'Because brokers require a documented risk policy',
            'Because written rules can be shown to a tax authority',
            'Because the state of mind that produces good rules is unavailable while you are in the drawdown',
            'Because the exact percentages are known to be optimal in advance',
          ],
          answerIdx: 2,
          explain:
            'Rules exist to transfer a decision from a frightened moment to a calm one, which is the only genuine advantage a plan has over improvisation. The specific thresholds are not optimal and do not need to be — they need to be pre-committed and followable.',
        },
        {
          id: 'u11-l08-q4',
          prompt:
            'A 1% risk rule combined with a very tight 5% stop distance produces a position weight of exactly 20%, colliding with the position cap. Which rule should win?',
          choices: [
            'The risk rule, since the 1% loss is already bounded by the stop',
            'The position cap, because it protects against the stop failing on a gap, halt, or fraud',
            'Neither — split the difference and take a 10% position',
            'Whichever produces the larger position, since the idea has a tight stop and therefore high conviction',
          ],
          answerIdx: 1,
          explain:
            'The 1% figure only holds if the stop executes near its price, and a gap can bypass it entirely — so the cap is protection against the failure mode of the stop itself. Letting the tight stop justify the larger size gets the logic exactly backwards: a stop cannot insure against its own non-execution.',
        },
        {
          id: 'u11-l08-q5',
          prompt:
            'What is the best evidence that a personal risk framework is real rather than decorative?',
          choices: [
            'A documented record of following it on days you did not want to — journal notes, adherence counts, and the cost of any breaches',
            'The framework produced a profit over the last quarter',
            'The rules are stricter than most published guidelines',
            'Every position is currently within every limit',
          ],
          answerIdx: 0,
          explain:
            'Rules held only in memory get silently rewritten under pressure, so adherence has to be measured rather than remembered — journal each thesis and stop, then count breaches and their cost quarterly. Profitability proves nothing about the framework, since a quarter is far too short to separate process from luck.',
        },
      ],
      cardSeeds: [
        {
          id: 'u11-l08-c1',
          kind: 'cloze',
          front:
            'The five layers of a personal risk framework: ____ → ____ → ____ → ____ → ____.',
          back: 'per-position (risk % and max size) → per-cluster (sector and factor caps) → portfolio (total open risk, cash floor, max positions) → drawdown response ladder → review of process separately from outcome',
        },
        {
          id: 'u11-l08-c2',
          kind: 'basic',
          front: 'What is "total open risk" and what is a reasonable cap?',
          back: 'The sum of the dollars between entry and stop across every open position — what the portfolio loses if every stop triggers at once. A cap around 6% of equity keeps the worst simultaneous day to a −6% drawdown needing only about +6.3% to recover.',
        },
        {
          id: 'u11-l08-c3',
          kind: 'basic',
          front: 'When a tight stop makes the risk rule and the position cap collide, which wins?',
          back: 'The position cap. Because weight = risk % ÷ stop distance %, a 1% risk with a 5% stop is exactly a 20% position. The cap protects against the stop failing — a gap, a halt, a fraud — and a stop cannot insure against its own non-execution.',
        },
        {
          id: 'u11-l08-c4',
          kind: 'basic',
          front: 'Do risk rules apply to long-term investors?',
          back: 'Yes — the arithmetic of drawdowns, correlation, and concentration does not care about holding period. The framework just changes form: price stops become written invalidation conditions, position caps become rebalancing bands, and per-trade review becomes an annual one.',
        },
      ],
    },
  ],
}
