import type { Unit } from '@core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Unit 12 — Behavioral Finance
// Unit 11 gave you the arithmetic of risk. This unit explains why people who
// know that arithmetic still break their own rules. The opponent is not the
// market; it is a set of mental shortcuts that were excellent for surviving on
// a savanna and are catastrophic for holding an index fund through a bear
// market. Naming them is the first defence; building systems around them is
// the only durable one.
// ─────────────────────────────────────────────────────────────────────────────

export const u12: Unit = {
  id: 'u12',
  title: 'Behavioral Finance',
  order: 12,
  description:
    'Why investors underperform their own investments: System 1 thinking, loss aversion and the disposition effect, overconfidence and calibration, confirmation bias and narrative, herding and recency, anchoring and sunk costs — and the journaling, checklists, rules, and automation that defend against all of them.',
  unlockAfter: 'u11',
  lessons: [
    // ── L01 ───────────────────────────────────────────────────────────────
    {
      id: 'u12-l01',
      unitId: 'u12',
      order: 1,
      title: 'Your Brain on Markets',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Every unit up to here assumed a rational analyst who computes an expectancy and acts on it. That analyst does not exist. What exists is a brain running two very different systems, described most influentially by Daniel Kahneman:

| | **System 1** | **System 2** |
|---|---|---|
| Speed | Instant | Slow |
| Effort | None | Tiring |
| Style | Pattern-matching, emotional, associative | Sequential, logical, arithmetic |
| Good at | Faces, threats, language, driving a familiar route | Long division, probability, comparing two mortgages |
| In markets | "This chart looks strong", "that CEO seems honest", "I need to get out **now**" | Reading a 10-K, computing expectancy, sizing a position |

System 1 is not the stupid one. It is the **fast** one, it runs constantly, and it produces the answer *before* System 2 knows a question was asked. System 2 then usually rationalises whatever System 1 already decided — which is why a bad decision so often arrives fully equipped with a plausible explanation.`,
        },
        {
          kind: 'text',
          md: `**Evolution built a superb survivor and a terrible investor.** Three ancient adaptations do most of the damage:

1. **Pattern detection on tiny samples.** Mistaking a rustle for a predator costs you a sprint; missing a real predator costs you everything. So the brain is tuned to find signal in noise — and a random price series obligingly produces "double bottoms" and "clear uptrends" all day long.
2. **Loss avoidance over gain seeking.** A lost day's food could kill you; an extra day's food could not save you as much. Losses therefore hurt more than equivalent gains help (Lesson 2), which is adaptive at subsistence and disastrous in a volatile portfolio.
3. **Social conformity.** Being expelled from the band was fatal, so the brain treats *"everyone else is doing this"* as strong evidence. In markets that is the machinery of bubbles (Lesson 5).

None of these is a defect you can fix by knowing about it. They are the operating system. The realistic goal is not to think differently but to **build an environment in which System 1 has fewer chances to press buttons**.`,
        },
        {
          kind: 'text',
          md: `The evidence that this costs real money is the **behaviour gap**: the difference between the return an investment produced and the return its investors actually earned. Studies of fund flows — DALBAR's annual work, Morningstar's *Mind the Gap*, and academic dollar-weighted return research — consistently find investors trail the funds they own, because money arrives after strong performance and leaves after weak performance.

Be careful with the numbers. Estimates range from **under one point** to **several points** a year depending on methodology, period, and fund type, and the largest published figures are the most contested. The **direction** is robust and well replicated; the precise magnitude is not. Even the small end of the range compounds into something enormous.`,
        },
        {
          kind: 'example',
          md: `**What a 1.5-point gap costs over 20 years.** $10,000 invested once:

- Fund returns **10.0%** a year → 10,000 × 1.10²⁰ = **$67,275**
- Investor captures **8.5%** a year → 10,000 × 1.085²⁰ = **$51,120**

Difference: **$16,155**, or **24%** of the ending balance, given away without a single bad *investment* decision. The fund was fine. The behaviour was not.

**And here is the mechanism, in miniature.** A fund returns +30%, −20%, +30% over three years — cumulatively **+35.2%**, about **10.6% a year**.

- Start: invest **$10,000**. After year 1 (+30%): **$13,000**.
- Feeling clever, add **$20,000** → **$33,000** invested going into year 2.
- Year 2 (−20%): **$26,400**. Panic; withdraw **half** = $13,200, leaving **$13,200**.
- Year 3 (+30%): **$17,160**.

Total contributed **$30,000**; total value now $17,160 + $13,200 withdrawn = **$30,360**. A gain of **$360**, or **1.2%**, from a fund that gained **35.2%**. Nothing was mistimed by more than a few months, no security was chosen badly, and almost the entire return vanished — because the big money was added at the high and removed at the low.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "I know about these biases, so I am not affected."**

Knowing the name of a bias is almost useless as a defence — this is itself one of the best-replicated findings in the field. Biases operate below the level at which you can introspect, and awareness mostly produces the ability to spot them **in other people**. What actually works is structural: written rules decided in advance (Unit 11, Lesson 8), pre-committed exits, automated contributions, checklists, and a journal that records the decision *before* the outcome exists. Design around System 1 rather than arguing with it.`,
        },
        {
          kind: 'keypoint',
          md: `System 1 is fast, emotional, and always answers first; System 2 is slow, effortful, and usually just rationalises. Evolution optimised for pattern-finding, loss avoidance, and conformity — all costly in markets. The behaviour gap is the measured result: research consistently finds investors earn less than the funds they hold, because money arrives after gains and leaves after losses. Awareness alone does not fix it; structure does.`,
        },
      ],
      quiz: [
        {
          id: 'u12-l01-q1',
          prompt: 'Which best describes the relationship between System 1 and System 2 thinking?',
          choices: [
            'System 2 evaluates every input before System 1 responds',
            'System 1 produces an answer first, and System 2 often rationalises it afterwards',
            'System 1 handles finance while System 2 handles emotion',
            'The two systems operate independently and never influence each other',
          ],
          answerIdx: 1,
          explain:
            'The fast, associative system reaches a conclusion before deliberate reasoning knows a question was asked, and the slow system then constructs a justification for it. That ordering is why poor decisions so reliably arrive already equipped with a plausible-sounding rationale.',
        },
        {
          id: 'u12-l01-q2',
          prompt: 'What is the "behaviour gap"?',
          choices: [
            'The spread between a fund\'s bid and ask prices',
            'The difference between an index and the funds that track it',
            'The gap between an investment\'s return and the return its investors actually earn',
            'The performance difference between professional and retail fund managers',
          ],
          answerIdx: 2,
          explain:
            'Because money flows in after strong performance and out after weak performance, the dollar-weighted return investors capture trails the time-weighted return the fund reports. The fund can be entirely blameless — the gap is created by when investors buy and sell it.',
        },
        {
          id: 'u12-l01-q3',
          prompt:
            'A fund gains 30%, loses 20%, then gains 30% (+35.2% cumulative). An investor puts in $10,000, adds $20,000 after the first year, and withdraws half after the down year. What is the approximate outcome?',
          choices: [
            'A gain of about 1.2% on the $30,000 contributed',
            'A gain of about 35%, matching the fund',
            'A loss of about 20%, matching the worst year',
            'A gain of about 18%, roughly half the fund\'s return',
          ],
          answerIdx: 0,
          explain:
            'Ending value $17,160 plus the $13,200 withdrawn is $30,360 against $30,000 contributed — a $360 gain from a fund that returned 35.2%. The big contribution landed at the high and the withdrawal happened at the low, which is the behaviour gap reproduced in three moves.',
        },
        {
          id: 'u12-l01-q4',
          prompt:
            'Why is a brain tuned to find patterns in small samples a liability in markets?',
          choices: [
            'It causes investors to overlook genuine chart patterns',
            'It slows down decision-making during volatile periods',
            'Random price series readily produce convincing-looking patterns, so the brain finds signal that is not there',
            'Pattern recognition only works on data sets larger than 10,000 observations',
          ],
          answerIdx: 2,
          explain:
            'Mistaking noise for a predator was cheap and missing a real one was fatal, so the machinery is deliberately over-sensitive — and randomly generated price series obligingly display double bottoms and clean trends. The cost is confident conclusions drawn from samples far too small to support them.',
        },
        {
          id: 'u12-l01-q5',
          prompt: 'What is the most effective defence against behavioural biases?',
          choices: [
            'Learning the name of each bias so you can recognise it in the moment',
            'Trading more frequently to gather more feedback',
            'Relying on intuition, which improves with market experience',
            'Structural pre-commitment — written rules, automated contributions, checklists, and journaling decisions before outcomes exist',
          ],
          answerIdx: 3,
          explain:
            'Biases operate below introspection, so awareness mostly grants the ability to diagnose other people while remaining fully exposed yourself. Defences that work move the decision to a calm moment and remove the opportunity to act on impulse, rather than trying to out-argue a system that answers before you notice.',
        },
      ],
      cardSeeds: [
        {
          id: 'u12-l01-c1',
          kind: 'cloze',
          front:
            'System ____ is fast, emotional, and pattern-matching; System ____ is slow, effortful, and logical — and usually just ____ what the first one already decided.',
          back: 'System 1; System 2; rationalises',
        },
        {
          id: 'u12-l01-c2',
          kind: 'basic',
          front: 'What is the behaviour gap and what causes it?',
          back: 'The difference between an investment\'s reported return and the return its investors actually capture. It is created by money arriving after strong performance and leaving after weak performance. Research consistently finds it is negative; estimates of its size vary widely by methodology.',
        },
        {
          id: 'u12-l01-c3',
          kind: 'basic',
          front: 'Which three evolutionary adaptations make humans bad investors?',
          back: 'Pattern detection on tiny samples (finding signal in random prices), loss avoidance over gain seeking (losses hurt disproportionately), and social conformity (treating "everyone is doing it" as evidence). All three were survival advantages and all three are costly in markets.',
        },
        {
          id: 'u12-l01-c4',
          kind: 'basic',
          front: 'Why does knowing about a bias fail to protect you from it?',
          back: 'Biases operate below the level of introspection, so awareness mostly enables you to spot them in others. Defences have to be structural: rules written in advance, pre-committed exits, automation, checklists, and journaling the decision before the outcome exists.',
        },
      ],
    },

    // ── L02 ───────────────────────────────────────────────────────────────
    {
      id: 'u12-l02',
      unitId: 'u12',
      order: 2,
      title: 'Loss Aversion & the Disposition Effect',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `The most robust finding in behavioural economics is that **losses loom larger than gains**. Kahneman and Tversky's prospect theory put a rough number on it: research consistently finds people weigh a loss somewhere around **twice** as heavily as a gain of the same size. Estimates of the multiplier vary by study, framing, and stake size — commonly reported between about 1.5 and 2.5 — so treat "roughly 2:1" as a well-supported *magnitude*, not a physical constant.

The classic demonstration is a single coin flip. Offer people heads wins $100, tails loses $100 and most decline, despite a zero expected value. Ask what the win would have to be before they accept, and the typical answer clusters around **$200**.`,
        },
        {
          kind: 'example',
          md: `**How a 2:1 weighting rejects a good bet.** A coin flip: heads wins **$150**, tails loses **$100**.

- **Expected value:** (0.5 × 150) − (0.5 × 100) = 75 − 50 = **+$25**. Clearly worth taking.
- **Felt value at λ = 2:** (0.5 × 150) − (0.5 × 2 × 100) = 75 − 100 = **−$25**. It feels like a bad bet.

The bet is *mathematically* positive and *emotionally* negative, and the emotion wins. To reach felt indifference the win would need to be **$200**, at which point the true expected value is a fat **+$50** that you are only just willing to accept.

Scale that up. Every position with a positive expectancy but a visible chance of loss faces the same internal tax, which is why perfectly sensible investors sit in cash after a bad year and why the very best long-run assets — the volatile ones — are the hardest to hold.`,
        },
        {
          kind: 'text',
          md: `Loss aversion has a specific and expensive market symptom: the **disposition effect** — the tendency to **sell winners too early and hold losers too long**.

The mechanism is that a paper loss is not yet *real*. Selling converts it into a closed, admitted, permanent mistake; holding preserves the hope that it becomes a win. Meanwhile, a paper gain is a chance to bank a certain, pleasant, provable success — so it gets taken quickly.

Terrance Odean's study of a large US discount brokerage in the 1990s quantified it: investors realised gains at roughly **1.5 times** the rate they realised losses. Worse, the stocks they *sold* went on to outperform the ones they *kept* by around **3.4 percentage points** over the following year. This is one dataset from one period, so treat the exact numbers with appropriate caution — but the pattern has since been reproduced in many markets and across many investor types, including professionals.`,
        },
        {
          kind: 'example',
          md: `**The tax code rewards the exact opposite behaviour.** A taxable US account holds two positions:

- **Winner** — unrealised gain of **$8,000**
- **Loser** — unrealised loss of **$8,000**

The disposition effect says: sell the winner, keep the loser. At a 15% long-term capital gains rate, that realises an $8,000 gain and hands over **$1,200** in tax, while the deductible loss sits unused.

Reverse it — sell the loser, keep the winner — and the $8,000 realised loss offsets $8,000 of gains elsewhere, **saving $1,200**. Same two positions, a **$2,400** swing in after-tax outcome, driven purely by which one felt better to sell.

Two important caveats: the **wash-sale rule** disallows the loss if you repurchase a substantially identical security within 30 days either side of the sale, and none of this applies inside a tax-sheltered account. The point is not tax strategy — this is not tax advice — but that the psychologically easy trade and the financially rational one point in **opposite directions**.`,
        },
        {
          kind: 'callout',
          md: `**The test that dissolves it.** Cost basis is information about your past, not about the security's future. So ask: *"If I held no position in this at all, would I buy it today at this price, in this size?"*

- **No, and I would not buy the winner either** → sell both. The gain is irrelevant.
- **Yes for the loser** → then holding it is a genuine decision, not an avoidance of admitting error.

The market has no idea what you paid. Every share you own is a fresh decision to own it at today's price, made every day, whether or not you notice you are making it.`,
        },
        {
          kind: 'keypoint',
          md: `Research consistently finds losses weigh roughly twice as heavily as equivalent gains, which rejects positive-expected-value bets that carry visible downside. The disposition effect follows: winners get sold early to bank a certain success, losers get held because the loss is not yet "real". In taxable accounts this is also backwards on tax. The antidote is to re-decide every holding at today's price, ignoring cost basis.`,
        },
      ],
      quiz: [
        {
          id: 'u12-l02-q1',
          prompt:
            'A coin flip pays $150 on heads and loses $100 on tails. Why do most people decline despite the positive expected value?',
          choices: [
            'With losses weighted about twice as heavily, the felt value is (0.5 × 150) − (0.5 × 2 × 100) = −$25',
            'The expected value is actually negative at −$25',
            'Most people miscalculate the probability as less than 50%',
            'Transaction costs typically exceed the $25 edge',
          ],
          answerIdx: 0,
          explain:
            'The true expected value is +$25, but at a loss-aversion multiplier around 2 the bet feels like −$25, and the feeling decides. Reaching felt indifference would require a $200 win — a bet whose real expected value is +$50 before it becomes acceptable.',
        },
        {
          id: 'u12-l02-q2',
          prompt: 'What is the disposition effect?',
          choices: [
            'Preferring dividend-paying stocks over growth stocks',
            'Selling holdings automatically once they reach a target allocation',
            'Selling winners too early and holding losers too long',
            'Disposing of an entire portfolio after a market crash',
          ],
          answerIdx: 2,
          explain:
            'A paper loss is not yet an admitted mistake, so selling it is avoided, while a paper gain offers a certain and provable success, so it gets banked quickly. In one large brokerage sample investors realised gains at roughly 1.5 times the rate of losses — and the stocks they sold subsequently beat the ones they kept.',
        },
        {
          id: 'u12-l02-q3',
          prompt:
            'A taxable account holds one position with an $8,000 unrealised gain and one with an $8,000 unrealised loss. At a 15% capital gains rate, what is the swing between selling the winner and selling the loser?',
          choices: [
            'No difference — both realise $8,000 of movement',
            '$2,400 — $1,200 of tax paid versus $1,200 of tax saved',
            '$8,000, the full value of the position',
            '$1,200, the tax on one position only',
          ],
          answerIdx: 1,
          explain:
            'Selling the winner creates a $1,200 tax bill while selling the loser generates a $1,200 offset against other gains, so the two paths differ by $2,400 on identical paper P&L. The psychologically comfortable trade and the financially sensible one point in opposite directions, subject to the 30-day wash-sale rule.',
        },
        {
          id: 'u12-l02-q4',
          prompt:
            'What question best neutralises the influence of cost basis on a hold-or-sell decision?',
          choices: [
            'How long have I owned this position?',
            'How far is it from my original purchase price?',
            'What would I need it to reach to break even?',
            'If I owned none of it, would I buy it today at this price in this size?',
          ],
          answerIdx: 3,
          explain:
            'Cost basis is a fact about your history and carries no information about the security\'s future, so re-deciding at today\'s price removes it from the calculation entirely. The other three questions all place the anchor back at the centre of a decision it has no business influencing.',
        },
      ],
      cardSeeds: [
        {
          id: 'u12-l02-c1',
          kind: 'cloze',
          front:
            'Research consistently finds losses weigh roughly ____ times as heavily as equivalent gains, which is why a coin flip paying $150 versus losing $100 feels like ____ despite an expected value of ____.',
          back: 'roughly 2 times; feels like −$25; expected value +$25',
        },
        {
          id: 'u12-l02-c2',
          kind: 'basic',
          front: 'What is the disposition effect and what drives it?',
          back: 'Selling winners too early and holding losers too long. A paper loss is not yet an admitted mistake, so it is preserved in hope; a paper gain is a certain success available to bank now. It is also backwards on tax in a taxable account.',
        },
        {
          id: 'u12-l02-c3',
          kind: 'basic',
          front: 'Why is cost basis irrelevant to a hold-or-sell decision?',
          back: 'The market does not know what you paid, and the price you paid contains no information about future returns. Every share you own is a fresh decision to own it at today\'s price. The useful question is "would I buy this today at this price in this size?"',
        },
      ],
    },

    // ── L03 ───────────────────────────────────────────────────────────────
    {
      id: 'u12-l03',
      unitId: 'u12',
      order: 3,
      title: 'Overconfidence & Calibration',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Overconfidence in investing has three distinct flavours, and they compound:

1. **Over-precision** — your confidence intervals are far too narrow. Asked for a range you are "90% sure" contains the right answer, people are typically right **closer to 50%** of the time.
2. **Over-placement** — the better-than-average effect. Large majorities rate themselves above average as drivers, and something similar shows up whenever investors are surveyed about their own skill.
3. **Illusion of knowledge** — more information raises **confidence** far faster than it raises **accuracy**. Beyond a few key facts, extra data mostly buys certainty rather than correctness.

The third is the one the modern information environment feeds constantly. Reading five more articles about a company reliably makes you feel more certain; whether it makes you more right is an entirely separate question, and usually not.`,
        },
        {
          kind: 'example',
          md: `**The cost, measured.** Barber and Odean's study of roughly 66,000 US discount-brokerage households in the 1990s is the classic reference:

| Group | Annual net return |
|---|---|
| Market over the period | ~17.9% |
| Average household | ~16.4% |
| Most active quintile (>250% turnover a year) | ~11.4% |

The most active traders gave up around **6.5 percentage points a year** against the market. On $10,000 over twenty years that is roughly **$269,000** at 17.9% versus roughly **$87,000** at 11.4% — about **a third** as much money, from the same starting capital and the same market.

A related study found men traded about **45% more** than women and underperformed them by roughly **one percentage point** a year — consistent with overconfidence, since trading frequency is the mechanism.

These are specific samples from a specific era, and costs have fallen enormously since. But the mechanism has not changed: turnover of 250% a year at a modest **0.5%** round-trip cost still burns **1.25 points** annually before any decision is even judged.`,
        },
        {
          kind: 'text',
          md: `**Calibration** is the cure — and unlike most behavioural advice, it is trainable. Being calibrated means your stated confidence matches your realised accuracy: of everything you call **70%**, about 70% turns out right.

This is a measurable skill, and it is the reason TickerQuest's what-next drills force you to commit to **50%, 70%, or 90%** before revealing the answer. The Profile calibration chart then plots realised accuracy against each bucket. Well-calibrated bars sit near the line; a 90% bar coming in at 62% is a precise, quantified statement about your overconfidence — the kind of feedback markets themselves are far too slow and noisy to give you.

The scoring is deliberately asymmetric, so honesty pays:

| Confidence | If correct | If wrong |
|---|---|---|
| 90% | +5 | −5 |
| 70% | +3 | −2 |
| 50% | +1 | 0 |`,
        },
        {
          kind: 'example',
          md: `**Why the asymmetry works.** Thirty drills, scored under each confidence claim:

| Your true accuracy | Always claim 90% | Always claim 70% | Always claim 50% |
|---|---|---|---|
| 90% (27 right) | **+120** | +75 | +27 |
| 60% (18 right) | +30 | **+30** | +18 |
| 50% (15 right) | **0** | +15 | +15 |

Read the rows. If you genuinely know your subject, claiming 90% pays **60% more** than hedging at 70% — confidence is rewarded when it is *earned*. At 60% accuracy, claiming 90% earns exactly what honest 70% earns, so the bluff buys nothing. At 50% accuracy, claiming 90% earns **zero** while admitting 50% earns 15.

Also note the 50% row of the scoring table: correct is +1 and wrong is 0. Hedging is cheap but never free upside, so someone who shrugs at 50% on everything scores worst of all. The system pays for **accurate self-knowledge**, in either direction.`,
        },
        {
          kind: 'callout',
          md: `**On Dunning-Kruger, honestly.** The popular version — "the incompetent are the most confident" — overstates a real but subtler finding, and parts of the original effect can be reproduced from statistical artefacts alone. The defensible claim is narrower: **self-assessment is noisy at every skill level**, and people with the least skill have the least information with which to notice their own errors, so their estimates regress toward "about average" from below. Beginners are not uniquely arrogant. Everyone is a poor judge of their own competence — which is exactly why measured calibration beats introspection.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "More research means better returns."**

Past a modest amount, additional information mainly raises confidence, and higher confidence raises **trading activity**, which reliably lowers net returns through costs and worse timing. The research that helps is research that could **change your mind** — a disconfirming fact, a competitor's disclosure, the bear case (Lesson 4). The research that does not help is the tenth bullish article, which changes nothing except how large a position you feel entitled to take.`,
        },
        {
          kind: 'keypoint',
          md: `Overconfidence appears as over-precision, over-placement, and the illusion of knowledge — where more information raises confidence far faster than accuracy. Research consistently finds more trading means worse net returns, with the most active traders in one large sample giving up several points a year. Calibration is the trainable antidote: commit to 50/70/90 before the answer is revealed, then compare stated confidence against realised accuracy.`,
        },
      ],
      quiz: [
        {
          id: 'u12-l03-q1',
          prompt: 'What is the "illusion of knowledge"?',
          choices: [
            'Believing that market prices already contain all information',
            'Assuming that professional investors know more than you do',
            'Additional information increasing confidence much faster than it increases accuracy',
            'Confusing memorised facts with genuine understanding of a business',
          ],
          answerIdx: 2,
          explain:
            'Past a handful of decisive facts, extra data mostly buys certainty rather than correctness — reading five more bullish articles reliably feels informative while changing nothing about the odds. The dangerous consequence is that the added confidence gets converted into larger positions and more trading.',
        },
        {
          id: 'u12-l03-q2',
          prompt:
            'In the Barber and Odean brokerage study, how did the most active traders compare with the market?',
          choices: [
            'They underperformed by roughly 6.5 percentage points a year, netting about 11.4% against a market near 17.9%',
            'They outperformed slightly, justifying the higher turnover',
            'They matched the market but with lower volatility',
            'They underperformed by roughly 0.2 points a year, a negligible amount',
          ],
          answerIdx: 0,
          explain:
            'The most active quintile turned over more than 250% of their portfolios annually and netted about 11.4% while the market returned about 17.9%. Compounded over twenty years on $10,000 that is roughly $87,000 against roughly $269,000 — the same market, about a third of the money.',
        },
        {
          id: 'u12-l03-q3',
          prompt:
            'What does it mean for an investor to be well calibrated?',
          choices: [
            'They are right more often than they are wrong',
            'They always express high confidence in their best ideas',
            'They avoid making probabilistic forecasts entirely',
            'Of everything they call 70% likely, about 70% actually happens',
          ],
          answerIdx: 3,
          explain:
            'Calibration is agreement between stated confidence and realised accuracy across many predictions, which is a separate skill from raw accuracy — a modest forecaster who knows their own hit rate is far more useful than a strong one who does not. It is also measurable, which is why the drills force a 50/70/90 commitment before revealing the answer.',
        },
        {
          id: 'u12-l03-q4',
          prompt:
            'A learner answers 30 drills at 90% confidence and gets 18 right (60% accuracy). Under the 90% scoring (+5 correct, −5 wrong), what do they score, and what would honest 70% have scored?',
          choices: [
            '+90 at 90%, versus +54 at 70%',
            '+30 at 90%, versus +30 at 70% — the bluff buys nothing',
            '−30 at 90%, versus +30 at 70%',
            '+120 at 90%, versus +75 at 70%',
          ],
          answerIdx: 1,
          explain:
            '18 × 5 − 12 × 5 = +30, and at 70% confidence 18 × 3 − 12 × 2 = +30 as well, so overclaiming at 60% accuracy earns exactly what honesty earns. The +120 versus +75 comparison is the 90%-accuracy row, where genuine skill makes the confident claim pay 60% more.',
        },
        {
          id: 'u12-l03-q5',
          prompt: 'What is the honest version of the Dunning-Kruger finding?',
          choices: [
            'Self-assessment is noisy at every skill level, and the least skilled have the least information to notice their errors',
            'Incompetent people are always more confident than experts',
            'Expertise reliably produces accurate self-assessment',
            'The effect has been fully retracted and carries no useful lesson',
          ],
          answerIdx: 0,
          explain:
            'Parts of the popular version can be reproduced from statistical artefacts, and the defensible claim is narrower: everyone judges their own competence poorly, and low skill offers the least information with which to detect one\'s own errors. That is precisely the argument for measured calibration over introspection.',
        },
      ],
      cardSeeds: [
        {
          id: 'u12-l03-c1',
          kind: 'basic',
          front: 'Name the three forms of overconfidence.',
          back: 'Over-precision (confidence intervals far too narrow), over-placement (the better-than-average effect), and the illusion of knowledge (more information raising confidence much faster than accuracy).',
        },
        {
          id: 'u12-l03-c2',
          kind: 'cloze',
          front:
            'An investor is well calibrated when of everything they call ____% likely, about ____% actually happens. The app measures this by requiring a commitment of ____, ____, or ____% before the answer is revealed.',
          back: '70%; 70%; 50, 70, or 90%',
        },
        {
          id: 'u12-l03-c3',
          kind: 'basic',
          front: 'What does the trading-volume research find, and why?',
          back: 'More trading means worse net returns. In one large 1990s brokerage sample the most active quintile netted about 11.4% against a market near 17.9%. The mechanism is overconfidence raising activity, and activity multiplying costs and timing errors.',
        },
        {
          id: 'u12-l03-c4',
          kind: 'basic',
          front: 'Why is the drill scoring asymmetric across confidence levels?',
          back: 'So honesty pays. Claiming 90% earns +5 correct and −5 wrong, so it only pays if you are genuinely right about 90% of the time; at 60% accuracy it earns exactly what an honest 70% earns, and at 50% it earns nothing. Meanwhile 50% pays +1/0, so shrugging at everything scores worst of all.',
        },
      ],
    },

    // ── L04 ───────────────────────────────────────────────────────────────
    {
      id: 'u12-l04',
      unitId: 'u12',
      order: 4,
      title: 'Confirmation & Narrative',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `**Confirmation bias** is the tendency to seek, notice, and remember evidence that supports what you already believe, while treating contrary evidence as noise, bias, or an opportunity to buy more.

Peter Wason's 2-4-6 experiment is the cleanest demonstration. Told that **2, 4, 6** follows a hidden rule, participants propose further triples and are told yes or no. Almost everyone forms a hypothesis — "ascending even numbers" — and then tests **8, 10, 12**, then **20, 22, 24**, collecting yes after yes and announcing the answer with confidence. The actual rule is usually something far broader like *"any three ascending numbers"*, and the one test that would have revealed it — **3, 5, 7**, or better, **6, 4, 2** — is the test almost nobody runs, because it is designed to hear **no**.

The market version: you like a company, so you read its bullish coverage, follow investors who own it, and interpret every product launch as validation. Ten yeses later you are certain — and you have never once tested the rule.`,
        },
        {
          kind: 'text',
          md: `**Narrative** is confirmation bias with a story attached, and stories are how System 1 reasons. A **story stock** has a compelling, emotionally satisfying account of the future — a founder-genius, a technology that changes everything, a market "worth trillions" — that the numbers do not yet support and may never.

Narratives are not lies and are not always wrong; some of the best investments of the last thirty years had exactly this shape. The problem is that a good story is **unfalsifiable in the short run**. Every data point fits: a miss is "investing for growth", a competitor is "validating the category", a resignation is "the company outgrowing early hires". A thesis that cannot be contradicted by any observation is not a thesis — it is a mood.

The discipline that fixes this is **reverse-engineering the story into a number**: what would have to be *true* for today's price to make sense?`,
        },
        {
          kind: 'example',
          md: `**Turning a narrative into a testable claim.** Vantage Dynamics trades at **$60** with **200 million** shares — a **$12.0 billion** market cap — on **$400 million** of revenue and no profits. The story is "the platform for an entire industry."

Ask what has to be true to earn a **12% annual return** over eight years:

- Required market cap in 8 years = 12,000 × 1.12⁸ = **$29.7 billion**
- At a mature multiple of **25× earnings**, that needs net income of **$1.19 billion**
- At a healthy **12% net margin**, that needs revenue of about **$9.9 billion**
- Against $400M today, that is **24.8×** revenue growth, or **49% a year, compounded, for eight straight years**

Now the narrative is a claim you can actually argue with. How many companies have compounded revenue at 49% for eight years? What is the total addressable market, and what share does $9.9B imply? Who else is competing for it? Does the 12% margin survive that competition?

The answer might still be yes — a handful of companies really have done this. But you are now betting on a **specific, checkable proposition** rather than on a feeling about the founder.`,
        },
        {
          kind: 'text',
          md: `**Inversion** is the general-purpose antidote, borrowed from Jacobi via Charlie Munger: instead of asking how to succeed, ask how to fail, then avoid that. Applied to a position, it takes two practical forms:

1. **The pre-mortem** (Gary Klein). Before you buy, imagine it is **eighteen months later and the position has lost half its value**. Write the story of how that happened, in detail, as though it already occurred. Research finds this prospective-hindsight framing surfaces substantially more concrete risks than asking "what could go wrong?" — because it removes the need to argue that failure is possible and asks only *how* it happened.
2. **The steel-manned bear case.** Find the most intelligent argument *against* your position — a short report, a sceptical analyst, a competitor's investor day — and write it in your own words, well enough that a believer would recognise it as fair. If you cannot, you do not yet understand what you own.`,
        },
        {
          kind: 'callout',
          md: `**Practical: write the invalidation conditions down.** A thesis that cannot be wrong cannot be tested, so make it falsifiable in advance:

> *"I own this because gross margin expands past 60% as the mix shifts to subscription. **I am wrong if** margin is still below 55% four quarters from now, **or if** net revenue retention drops under 110%, **or if** the two largest customers are not renewed."*

Put that in the journal note on the trade. Then, when quarterly results arrive, you are checking a prediction you already made rather than composing a fresh explanation of why the news is fine.`,
        },
        {
          kind: 'keypoint',
          md: `Confirmation bias makes you test only the cases expected to say yes — the 2-4-6 problem. Narratives amplify it, because a good story absorbs every data point and cannot be falsified in the short run. Convert the story into a checkable number ("what must be true?"), run a pre-mortem in which the position has already halved, steel-man the bear case, and write invalidation conditions into the journal before results arrive.`,
        },
      ],
      quiz: [
        {
          id: 'u12-l04-q1',
          prompt:
            'In the 2-4-6 experiment, why do most participants get the hidden rule wrong?',
          choices: [
            'They are not given enough attempts to test hypotheses',
            'The rule is deliberately designed to be unguessable',
            'They misremember the feedback they received',
            'They only propose triples they expect to be told "yes" to, never testing a case designed to fail',
          ],
          answerIdx: 3,
          explain:
            'Proposing 8-10-12 and 20-22-24 collects confirmation after confirmation without ever probing the boundary, so a narrow hypothesis survives inside a much broader true rule. The informative test is the one you expect to hear "no" to, such as 3-5-7 or 6-4-2 — and it is the test almost nobody runs.',
        },
        {
          id: 'u12-l04-q2',
          prompt:
            'A company trades at a $12.0B market cap on $400M of revenue. To justify a 12% annual return over eight years at 25× earnings and a 12% net margin, what revenue growth is required?',
          choices: [
            'About 12% a year, matching the required return',
            'About 49% a year — revenue must reach roughly $9.9B, or 24.8× today\'s level',
            'About 25% a year, matching the exit multiple',
            'The calculation cannot be done without knowing current earnings',
          ],
          answerIdx: 1,
          explain:
            '12,000 × 1.12⁸ = $29.7B of market cap, which at 25× needs $1.19B of net income and at a 12% margin needs about $9.9B of revenue — 24.8 times today, or 49% compounded for eight years. Reverse-engineering the price this way turns an unfalsifiable story into a specific claim you can research.',
        },
        {
          id: 'u12-l04-q3',
          prompt: 'What is a pre-mortem, and why does it work better than asking "what could go wrong?"',
          choices: [
            'A review of a position after it is closed, to extract lessons',
            'A stress test of the portfolio against historical crash scenarios',
            'Imagining the position has already lost half its value and writing how it happened — prospective hindsight surfaces more concrete risks',
            'A checklist completed by a second person before any trade is placed',
          ],
          answerIdx: 2,
          explain:
            'Assuming the failure has already occurred removes the need to argue that failure is possible and asks only for the mechanism, which research finds produces substantially more specific risks than an open-ended question. A review after closing is a post-mortem — useful, but far too late to change the decision.',
        },
        {
          id: 'u12-l04-q4',
          prompt: 'What makes a thesis falsifiable in practice?',
          choices: [
            'Written invalidation conditions recorded in advance — specific metrics and thresholds that would prove it wrong',
            'A stop loss placed 10% below the entry price',
            'A conviction level assigned on a scale from 1 to 10',
            'A price target published by a sell-side analyst',
          ],
          answerIdx: 0,
          explain:
            'Naming the metrics and thresholds beforehand — "wrong if gross margin is still under 55% in four quarters" — means each result checks a prediction you already made instead of prompting a fresh explanation of why the news is fine. A price stop bounds the loss without testing the reasoning, and a conviction number records a feeling rather than a claim.',
        },
      ],
      cardSeeds: [
        {
          id: 'u12-l04-c1',
          kind: 'basic',
          front: 'What does the 2-4-6 experiment demonstrate?',
          back: 'Confirmation bias: participants test only triples they expect a "yes" for (8-10-12, 20-22-24) and never probe the boundary, so they confidently announce a narrow rule inside a much broader true one. The informative test is the one designed to hear "no".',
        },
        {
          id: 'u12-l04-c2',
          kind: 'basic',
          front: 'How do you convert a story stock narrative into a testable claim?',
          back: 'Reverse-engineer the price. Grow today\'s market cap at your required return, divide by a mature exit multiple to get the needed earnings, divide by a plausible net margin to get the needed revenue, and compare to today\'s. The answer is a growth rate you can research rather than a feeling you can only share.',
        },
        {
          id: 'u12-l04-c3',
          kind: 'cloze',
          front:
            'Two forms of inversion: the ____, in which you imagine the position has already ____ and write how it happened; and the steel-manned ____ case, written well enough that a believer would call it fair.',
          back: 'pre-mortem; already lost half its value; bear case',
        },
      ],
    },

    // ── L05 ───────────────────────────────────────────────────────────────
    {
      id: 'u12-l05',
      unitId: 'u12',
      order: 5,
      title: 'Herding, FOMO & Recency',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Three closely related biases push in the same direction and reinforce each other:

- **Herding** — treating other people's behaviour as information. Often rational! If everyone runs, there may be a lion. But in markets the crowd's action is frequently *caused* by the same crowd's action, so the "evidence" is circular.
- **FOMO** — the specific, physical discomfort of watching other people make money in something you do not own. It is social pain, not analysis, and it grows with the size of the gain you missed.
- **Recency** — over-weighting what has happened lately and extrapolating it forward. Three good years feel like a permanent condition; three bad ones feel like a new regime.

Together they produce the single most reliable wealth-destroying behaviour in retail investing: **buying what has gone up, after it has gone up, because it has gone up.**`,
        },
        {
          kind: 'example',
          md: `**Performance chasing, in numbers.** A sector fund starts the year with **$100M** in assets.

- **Year 1:** returns **+60%** → **$160M**. Splendid coverage, top of every leaderboard.
- Investors pile in: **$400M** of new money arrives at the start of year 2 → **$560M** invested.
- **Year 2:** returns **−35%** → **$364M**.

**Reported (time-weighted) return:** 1.60 × 0.65 = **1.04**, a **+4.0%** two-year gain. Genuinely positive, and it is the number in the marketing.

**Investor (dollar-weighted) return:** $500M went in; $364M is left. Investors are down **$136M**, about **−27%** on the money actually invested.

The fund's advertised return is real and the investors' loss is real, at the same time. The $400M met the −35% year and only $100M met the +60% one. No investor here made an "investment" mistake — every one of them made a **timing** mistake, and the timing was driven by the return they had just watched somebody else earn.`,
        },
        {
          kind: 'text',
          md: `**Bubbles are social, not analytical.** The standard sequence is remarkably stable across four centuries:

1. A genuinely good idea attracts early capital and produces real returns.
2. Rising prices attract attention, and attention attracts capital, which raises prices.
3. Price becomes the primary evidence. "It keeps going up" replaces any argument about value.
4. Participation becomes identity — sceptics are not merely wrong, they *do not get it*.
5. Marginal buyers run out. There is no news event; the flow simply stops.
6. The same social mechanism reverses at speed.

Notice that steps 2–4 contain **no information** about the underlying asset. That is the definition of an **information cascade**: each participant rationally infers from others' actions, so the crowd's confidence grows while the underlying evidence stays exactly where it was. And the most painful feature is that being early and right is indistinguishable, in real time, from being simply wrong.`,
        },
        {
          kind: 'example',
          md: `**Dollar-cost averaging as a commitment device.** DCA means investing a fixed *amount* on a fixed schedule regardless of price. Five months at **$500** a month:

| Month | Price | Shares bought |
|---|---|---|
| 1 | $50 | 10.0 |
| 2 | $40 | 12.5 |
| 3 | $25 | 20.0 |
| 4 | $40 | 12.5 |
| 5 | $50 | 10.0 |
| **Total** | avg price **$41.00** | **65.0 shares** |

$2,500 invested for 65 shares → average cost **$38.46**, below the **$41.00** average price, because a fixed dollar amount automatically buys more shares when prices are low. At $50 the holding is worth **$3,250**, a **+30%** gain on the money invested even though the price ended exactly where it started.

**Be honest about what DCA is and is not.** Studies comparing DCA against investing a lump sum immediately generally find **lump sum wins about two-thirds of the time**, because markets rise more often than they fall and DCA leaves cash uninvested. DCA's real value is **behavioural**: it removes the timing decision from a person who would otherwise make it badly, it guarantees you buy during the month you least want to, and it converts "should I invest now?" — a question you will answer with your feelings — into a schedule you set once, calmly, in advance.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "I'm not chasing — the fundamentals really did improve."**

Sometimes true. The diagnostic is not *whether* you have reasons but **when** you acquired them. Ask three questions:

1. **Would I have bought this at the same size six months ago, at a 40% lower price?** If not, what changed — the business, or the price?
2. **What is my evidence, and how much of it is that the price went up?**
3. **Where did I first hear about it?** A screen or a filing is different from a group chat.

Recency has a symmetric form that is just as costly: refusing to buy anything that has fallen, and abandoning a sound allocation at the bottom because "the regime has changed". Both are the last three years being mistaken for the next ten.`,
        },
        {
          kind: 'keypoint',
          md: `Herding treats crowd behaviour as evidence, FOMO is the social pain of a missed gain, and recency extrapolates the recent past forward — together producing performance chasing. The gap between a fund's time-weighted return and its investors' dollar-weighted return measures the damage. Bubbles are information cascades in which price itself becomes the evidence. Dollar-cost averaging beats lump sum less than half the time but works as a commitment device that removes the timing decision.`,
        },
      ],
      quiz: [
        {
          id: 'u12-l05-q1',
          prompt:
            'A fund holds $100M and returns +60%, then takes in $400M before returning −35%. What do the reported and investor experiences look like?',
          choices: [
            'Both show a loss, since the second year dominates',
            'The fund reports +4.0% over two years while investors are down about 27% on the money invested',
            'Both show +4.0%, since returns are returns',
            'The fund reports a loss while investors show a gain',
          ],
          answerIdx: 1,
          explain:
            '1.60 × 0.65 = 1.04, a genuine +4.0% time-weighted return, while $500M invested ended at $364M — a $136M dollar-weighted loss. Only $100M experienced the good year and $560M experienced the bad one, which is performance chasing expressed as arithmetic.',
        },
        {
          id: 'u12-l05-q2',
          prompt: 'What is an information cascade in a market context?',
          choices: [
            'Each participant rationally infers from others\' actions, so confidence grows while the underlying evidence does not change',
            'The rapid dissemination of an earnings release across news wires',
            'A sequence of analyst downgrades following a single negative report',
            'The process by which order-book data reaches retail brokerages',
          ],
          answerIdx: 0,
          explain:
            'Rising prices attract attention, attention attracts capital, and capital raises prices — a loop containing no new information about the asset itself. That circularity is why crowd conviction can reach extraordinary levels on evidence that has not moved since the beginning.',
        },
        {
          id: 'u12-l05-q3',
          prompt:
            'An investor puts $500 a month into a stock priced at $50, $40, $25, $40, and $50. What is the average cost per share, and why?',
          choices: [
            '$41.00, the simple average of the five prices',
            '$50.00, since that is where the price ended',
            '$38.46 — a fixed dollar amount buys more shares at low prices',
            '$25.00, the lowest price paid',
          ],
          answerIdx: 2,
          explain:
            '$2,500 buys 65 shares, so the average cost is $38.46 — below the $41.00 average price because the fixed amount bought 20 shares at $25 and only 10 at $50. The position is worth $3,250 at the end, a 30% gain even though the price finished exactly where it began.',
        },
        {
          id: 'u12-l05-q4',
          prompt: 'What does the research on dollar-cost averaging versus lump-sum investing find?',
          choices: [
            'DCA reliably produces higher returns because it lowers average cost',
            'The two are mathematically identical over any period longer than a year',
            'DCA is superior only in falling markets, which are the majority',
            'Lump sum wins roughly two-thirds of the time; DCA\'s value is behavioural, not mathematical',
          ],
          answerIdx: 3,
          explain:
            'Markets rise more often than they fall, so leaving cash uninvested usually costs return — lump sum wins about two-thirds of the time on average outcomes. DCA earns its place by removing a timing decision from someone who would otherwise make it badly, and by guaranteeing purchases in the months they least want to buy.',
        },
        {
          id: 'u12-l05-q5',
          prompt:
            'Which question best distinguishes genuine conviction from performance chasing?',
          choices: [
            'How much has this position gained over the past year?',
            'Would I have bought this at the same size six months ago at a 40% lower price?',
            'How many analysts currently rate it a buy?',
            'Has the position outperformed its sector recently?',
          ],
          answerIdx: 1,
          explain:
            'If a 40% lower price would have made you less interested rather than more, the price rise is functioning as your evidence, which is the definition of chasing. The other three questions all take recent performance as an input, so they cannot possibly separate the two.',
        },
      ],
      cardSeeds: [
        {
          id: 'u12-l05-c1',
          kind: 'basic',
          front: 'Define herding, FOMO, and recency — and what do they jointly produce?',
          back: 'Herding treats crowd behaviour as evidence; FOMO is the social pain of watching others gain; recency extrapolates the recent past forward. Together they produce performance chasing: buying what has gone up, after it has gone up, because it has gone up.',
        },
        {
          id: 'u12-l05-c2',
          kind: 'cloze',
          front:
            'A fund can report a ____-weighted gain while its investors suffer a ____-weighted loss, because most of the money arrived ____ the good year.',
          back: 'time-weighted gain; dollar-weighted loss; after the good year',
        },
        {
          id: 'u12-l05-c3',
          kind: 'basic',
          front: 'Is dollar-cost averaging mathematically superior to lump-sum investing?',
          back: 'No — lump sum wins roughly two-thirds of the time because markets rise more often than they fall and DCA leaves cash idle. DCA is a commitment device: it removes the timing decision, forces buying in the months you least want to, and is chosen for behaviour rather than expected return.',
        },
        {
          id: 'u12-l05-c4',
          kind: 'basic',
          front: 'What are the three diagnostic questions for suspected performance chasing?',
          back: '(1) Would I have bought this at the same size six months ago at a 40% lower price? (2) How much of my evidence is simply that the price went up? (3) Where did I first hear about it — a screen and a filing, or a group chat?',
        },
      ],
    },

    // ── L06 ───────────────────────────────────────────────────────────────
    {
      id: 'u12-l06',
      unitId: 'u12',
      order: 6,
      title: 'Anchoring & Sunk Costs',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `**Anchoring** is the tendency for an initial number to contaminate a later estimate, even when it is obviously irrelevant. In Tversky and Kahneman's classic demonstration, participants watched a wheel of fortune stop on a number and were then asked what percentage of UN member states were African. Those who saw a high number gave systematically higher answers — from a number they had watched being generated at random moments earlier.

Markets supply anchors constantly, and every one of them is a fact about the **past**:

- **Your cost basis.** "I bought at $100."
- **The 52-week high.** "It was at $140 in February."
- **A round number.** "I'll sell at $50."
- **An IPO or offering price.**
- **An analyst's price target**, which is itself often anchored on the current price.

None of these carries information about future returns. All of them feel like they do.`,
        },
        {
          kind: 'example',
          md: `**"It'll come back."** You own **200 shares** bought at **$100** — $20,000 invested. The stock is now **$40**:

- Position value: **$8,000**. Unrealised loss: **$12,000**.
- Getting back to $100 requires **+150%** from here (0.60 ÷ 0.40).

Now notice what the "wait for even" plan actually is: a decision to hold $8,000 in this specific stock rather than any alternative, made not because you judge it the best available use of $8,000 but because of a number you paid two years ago that no other participant in the market can see.

The correct comparison has nothing to do with $100:

> **Given $8,000 in cash today, would I buy 200 shares of this at $40?**

- **Yes** → keep holding. That is a real decision, and the $100 is irrelevant to it.
- **No** → sell. The $12,000 is gone either way; the only question is where the surviving $8,000 goes next.

A stock does not owe you a return because you overpaid for it. It has no memory of your entry, and the +150% it needs is neither more nor less likely than the +150% needed by any other stock at $40.`,
        },
        {
          kind: 'example',
          md: `**Averaging down: re-underwriting or sunk-cost escalation?** You bought **100 shares at $100** ($10,000). It is now **$40**, so you buy **150 more at $40** ($6,000):

| | Before | After |
|---|---|---|
| Shares | 100 | 250 |
| Total cost | $10,000 | $16,000 |
| Average cost | $100.00 | **$64.00** |
| Position value at $40 | $4,000 | **$10,000** |
| Unrealised loss | $6,000 | $6,000 |
| Loss if it falls another 50% | $2,000 | **$5,000** |

The average cost fell from $100 to $64 and the break-even price came down with it, which *feels* like progress. But the loss is unchanged at $6,000, capital at risk went from $4,000 to **$10,000**, and the next 50% decline now costs **two and a half times** as much. You have not repaired anything — you have increased your bet on an unchanged thesis, in exchange for a more comfortable number in the average-cost column.

**The test that separates the two cases** is Unit 11's sizing arithmetic. At 1% risk on a $50,000 account with a stop at $34, the position size formula allows 500 ÷ 6 = **83 shares**, not 250. If a fresh look justifies adding, it justifies adding *a properly sized amount*; if the only argument is "it lowers my average", that is the sunk cost talking.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "I'll just hold until it comes back."**

Three things are wrong with this at once.

1. **It confuses your basis with the stock's prospects.** The market does not know what you paid and will not compensate you for it.
2. **It ignores opportunity cost.** Capital held hostage to a break-even price is capital not compounding elsewhere, and the wait is often measured in years.
3. **It quietly redefines the goal.** "Getting back to even" replaces "earning the best available return", so a mediocre holding becomes untouchable precisely because it has performed badly.

Ironically, the same investor will happily sell a position that is *up* 30% while refusing to sell one down 60% — the disposition effect (Lesson 2) and anchoring working as a team.`,
        },
        {
          kind: 'callout',
          md: `**The app shows you the anchor on purpose.** Your paper positions display cost basis and unrealised P&L, because that is what every real brokerage shows and pretending otherwise would not prepare you for anything. Use the **journal note** as the counterweight: record the *thesis* and its invalidation conditions at entry, then re-read that note — not the P&L column — when deciding whether to hold. The question the note answers is "is the reason still true?", which is the only question the cost basis cannot help with.`,
        },
        {
          kind: 'keypoint',
          md: `Anchoring lets an irrelevant number — cost basis, the 52-week high, a round number — contaminate a current judgement. The sunk-cost fallacy then defends the anchor: money already lost is gone regardless, so it cannot justify holding. Replace both with a decision made from today forward: given this cash, would I buy this position at this price in this size? Averaging down is legitimate only if a fresh, properly sized underwrite says so.`,
        },
      ],
      quiz: [
        {
          id: 'u12-l06-q1',
          prompt:
            'A stock bought at $100 now trades at $40. What return is needed to get back to the purchase price, and what does that imply?',
          choices: [
            '+60%, and the stock is likely to recover it since it traded there before',
            '+150%, but the previous price makes it more probable than for other stocks',
            '+150% — and the old price says nothing about the odds of achieving it',
            '+40%, which is a modest recovery in most market environments',
          ],
          answerIdx: 2,
          explain:
            'Recovering from $40 to $100 requires 0.60 / 0.40 = +150%, and the stock has no memory of your entry price. That +150% is neither more nor less likely than the +150% required by any other stock trading at $40, which is precisely why the anchor is useless.',
        },
        {
          id: 'u12-l06-q2',
          prompt:
            'An investor holds 100 shares bought at $100, now $40, and buys 150 more at $40. What actually changed?',
          choices: [
            'The unrealised loss is halved and the recovery becomes far easier',
            'Nothing material — the average cost is just an accounting figure',
            'Risk falls, since the average cost of $64 is closer to the market price',
            'Average cost drops to $64 and the loss is unchanged at $6,000, but capital at risk rises from $4,000 to $10,000',
          ],
          answerIdx: 3,
          explain:
            'The $6,000 loss does not move, while exposure grows from $4,000 to $10,000 and the next 50% decline costs $5,000 instead of $2,000. A lower average cost is a more comfortable number attached to a larger bet on an unchanged thesis.',
        },
        {
          id: 'u12-l06-q3',
          prompt: 'Why is the sunk-cost fallacy irrational in an investing context?',
          choices: [
            'Money already lost is gone regardless of what you decide next, so it cannot inform the choice between holding and redeploying',
            'Because losses can always be recovered by holding for long enough',
            'Because tax rules prohibit considering historical purchase prices',
            'Because averaging down is prohibited by most brokerages',
          ],
          answerIdx: 0,
          explain:
            'The only live question is where the remaining capital earns the best expected return from today forward, and the $12,000 already lost is identical under every option. Letting it influence the decision converts a past loss into an ongoing one through the opportunity cost of the capital still trapped.',
        },
        {
          id: 'u12-l06-q4',
          prompt:
            'What is the right test for whether averaging down is a genuine decision rather than sunk-cost escalation?',
          choices: [
            'Whether the position is down more than 50% from cost',
            'Whether the addition brings the average cost below the 52-week midpoint',
            'Whether the new average cost is below the current price',
            'Whether a fresh underwrite at today\'s price justifies the addition, sized by the normal risk rules rather than by the wish to lower the average',
          ],
          answerIdx: 3,
          explain:
            'At 1% risk on a $50,000 account with a $6 stop distance, the sizing formula permits 83 shares — not the 250 that "lowering the average" produces. Rules keyed to the average cost or the drawdown from cost simply re-import the anchor into the decision meant to escape it.',
        },
      ],
      cardSeeds: [
        {
          id: 'u12-l06-c1',
          kind: 'basic',
          front: 'Name four common market anchors and what they have in common.',
          back: 'Your cost basis, the 52-week high, round numbers, and IPO or analyst target prices. All are facts about the past that feel like information about the future, and none of them carries any information about future returns.',
        },
        {
          id: 'u12-l06-c2',
          kind: 'cloze',
          front:
            'The question that replaces "will it come back?": given ____ in cash today, would I ____ this position at ____ in ____?',
          back: 'given this amount of cash today, would I buy this position at today\'s price in this size?',
        },
        {
          id: 'u12-l06-c3',
          kind: 'basic',
          front: 'What actually changes when you average down, and what is the test?',
          back: 'The average cost and break-even price fall, but the unrealised loss is unchanged and capital at risk rises sharply — a bigger bet on an unchanged thesis. The test: would a fresh underwrite at today\'s price justify this addition, sized by the normal risk rules rather than by the wish to lower the average?',
        },
      ],
    },

    // ── L07 ───────────────────────────────────────────────────────────────
    {
      id: 'u12-l07',
      unitId: 'u12',
      order: 7,
      title: 'Building Behavioral Defenses',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Six lessons of biases lead to one uncomfortable conclusion: you cannot think your way out of this. Every defence that actually works has the same shape — it moves a decision from the **moment of stress** to a **moment of calm**, or removes the decision from you entirely.

Four layers, in increasing order of strength:

1. **Journaling** — makes your past reasoning inspectable, so you can grade decisions rather than remember them.
2. **Checklists** — force the steps you skip precisely when skipping them is most expensive.
3. **Rules** — pre-commit the decision so the stressed version of you is not consulted.
4. **Automation** — remove the decision from a human entirely.`,
        },
        {
          kind: 'text',
          md: `**Journaling is the foundation, and it is why the trade note exists.** Every paper trade in TickerQuest takes a "Why this trade?" note, and it is deliberately captured **before** the outcome exists — because after the outcome, your memory of your reasoning is quietly rewritten to fit what happened. That rewriting is called hindsight bias, and it is fast, automatic, and completely invisible from the inside.

A note worth writing has five parts:

| Field | Example |
|---|---|
| **Thesis** | Mix shift to subscription lifts gross margin past 60% |
| **Invalidation** | Margin still below 55% in four quarters, or NRR under 110% |
| **Exit / stop** | $78.80, below the March swing low |
| **Confidence** | 70% — comparable to a drill call, and gradeable later |
| **State** | Calm, or: chasing after a 12% two-day move |

That last field looks soft and is the most diagnostic thing in the journal. After thirty trades you can sort by it, and most people discover their "excited" entries have a materially worse expectancy than their "calm" ones — which is a rule they can then write.`,
        },
        {
          kind: 'example',
          md: `**Reviewing decisions, not outcomes.** A quarter of 20 closed paper trades, scored on process first:

| | Profitable | Loss | Total |
|---|---|---|---|
| **Followed process** | 6 | 8 | **14** |
| **Broke process** | 3 | 3 | **6** |

Process adherence: **70%**. Now add the money:

- **Process trades (14):** 6 wins averaging **+$820**, 8 losses averaging **−$480** → expectancy = (4,920 − 3,840) ÷ 14 = **+$77 per trade**, total **+$1,080**
- **Rule-break trades (6):** 3 wins averaging **+$300**, 3 losses averaging **−$1,900** → expectancy = (900 − 5,700) ÷ 6 = **−$800 per trade**, total **−$4,800**

Net for the quarter: **−$3,720**. The process made money. **30% of the activity destroyed nearly five times what the other 70% earned** — and note the shape of it: rule-breaks won as often as they lost, but the losses were enormous, because the rule being broken was almost always the sizing or stop rule.

An outcome-only review would have congratulated the three profitable rule-breaks and questioned the eight disciplined losses — reinforcing exactly the behaviour that caused the quarter's loss. The action item here is not "trade better", it is a single measurable target: **cut rule-breaks from 6 to 0**.`,
        },
        {
          kind: 'text',
          md: `**Checklists, rules, and automation.** Atul Gawande's work on surgical checklists showed large reductions in complications from a list of steps that every participant already knew — the value is not knowledge, it is **reliable execution under pressure**.

An investing checklist is short and binary. Nothing subjective, nothing that can be argued with at 3pm:

- [ ] Thesis and invalidation conditions written down
- [ ] Position size computed from the stop, not chosen
- [ ] Position under the max weight, sector under the max cluster
- [ ] Total open risk still under the cap
- [ ] Bear case read and summarised in my own words
- [ ] Not entered within 48 hours of first hearing about it

**Rules beat discretion more often than people expect.** A long research literature going back to Paul Meehl finds that simple mechanical models routinely match or beat expert clinical judgement — including the judgement of the experts whose own criteria built the model — because the model applies the criteria **consistently** and the expert does not. The lesson is not that judgement is worthless; it is that judgement should go into **designing** the rule, at leisure, rather than into overriding it in the moment.

**Automation is the strongest defence** because it removes you altogether: scheduled contributions, automatic rebalancing at fixed bands (say, rebalance whenever an allocation drifts more than 5 points from target), reinvested dividends. Every automated decision is one your future frightened self does not get a vote on.`,
        },
        {
          kind: 'callout',
          md: `**Grade the process, then the outcome — never the reverse.** Unit 11 introduced the grid; here it becomes a quarterly routine:

1. Pull every closed trade and its journal note.
2. Mark each **followed process / broke process**, using only what the note says — not what you now recall.
3. Mark each **profit / loss**.
4. Compute expectancy for each row separately.
5. Set one target for the next quarter, and make it a **behaviour**, not a return: "zero unplanned entries", "every trade journalled before the order", "no position above 15%".

Returns are not controllable in a quarter and behaviour is. Grading yourself on the thing you control is the only version of this that changes anything.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Rules are for people who lack discipline."**

Rules exist precisely *because* discipline is a finite, depletable resource that runs out fastest under stress — which is exactly when the expensive decisions arrive. The most disciplined investors are not the ones with the strongest willpower in the moment; they are the ones who arranged, in advance, to need the least of it. Ulysses did not resist the sirens by being resolute. He had himself tied to the mast.`,
        },
        {
          kind: 'keypoint',
          md: `Defences work by moving decisions from stressed moments to calm ones, or removing them from you entirely: journal the thesis, invalidation, stop, confidence, and emotional state before the outcome exists; run a short binary checklist; pre-commit rules because consistently applied simple rules beat inconsistent expert judgement; automate contributions and rebalancing. Review by grading process first and outcome second, and set behavioural targets rather than return targets.`,
        },
      ],
      quiz: [
        {
          id: 'u12-l07-q1',
          prompt:
            'Why must a trade journal record the reasoning before the outcome is known?',
          choices: [
            'Because hindsight bias silently rewrites your memory of your reasoning to fit what happened',
            'Because brokers require contemporaneous records for tax purposes',
            'Because entries written later cannot be timestamped',
            'Because reasoning written afterwards is usually too brief to be useful',
          ],
          answerIdx: 0,
          explain:
            'Once you know the result, your recollection of what you expected shifts to match it — automatically, and invisibly from the inside. A note written before the outcome is the only record of your actual reasoning, which makes it the only thing you can honestly grade later.',
        },
        {
          id: 'u12-l07-q2',
          prompt:
            'In a quarter, 14 process-following trades made +$1,080 and 6 rule-breaking trades lost $4,800. What is the right conclusion?',
          choices: [
            'The quarter was a loss, so the process needs to be redesigned',
            'The three profitable rule-breaks show that flexibility adds value',
            'The process is profitable (+$77 per trade) and the entire loss came from the 30% of trades that broke it — the target is zero rule-breaks',
            'Position sizes should be reduced across all trades until the quarter is profitable',
          ],
          answerIdx: 2,
          explain:
            'Process trades earned +$77 per trade while rule-breaks lost −$800 per trade, so the problem is adherence rather than design. An outcome-only review would praise the three lucky breaks and question the eight disciplined losses, reinforcing precisely the behaviour that caused the quarter to lose money.',
        },
        {
          id: 'u12-l07-q3',
          prompt: 'What does the research on checklists, from surgery onward, actually show?',
          choices: [
            'Checklists substitute for expertise in complex domains',
            'The benefit comes from reliable execution of steps practitioners already know, under pressure',
            'Checklists work only for tasks that are entirely routine',
            'Longer and more detailed checklists produce proportionally better outcomes',
          ],
          answerIdx: 1,
          explain:
            'Every participant in those surgical studies already knew each item on the list — the gain came from performing them consistently when attention and time were short. The same applies to an investing checklist, which is why the items must be short and binary rather than subjective.',
        },
        {
          id: 'u12-l07-q4',
          prompt:
            'What does the literature beginning with Paul Meehl find about simple rules versus expert judgement?',
          choices: [
            'Expert judgement reliably beats mechanical rules once experience exceeds ten years',
            'Rules and expert judgement perform identically across all studied domains',
            'Mechanical rules only outperform when the expert has no domain training',
            'Simple mechanical models routinely match or beat expert judgement, because the model applies criteria consistently and the expert does not',
          ],
          answerIdx: 3,
          explain:
            'Models built from the experts\' own criteria frequently outperform those same experts, since the inconsistency of human application is itself a large source of error. The implication is that judgement belongs in designing the rule at leisure, not in overriding it under pressure.',
        },
        {
          id: 'u12-l07-q5',
          prompt: 'Why should a quarterly review set behavioural targets rather than return targets?',
          choices: [
            'Because returns are not measurable over a single quarter',
            'Because behavioural targets are easier to achieve and improve morale',
            'Because returns over a quarter are dominated by luck, while behaviour is the part you actually control',
            'Because return targets are prohibited for non-professional investors',
          ],
          answerIdx: 2,
          explain:
            'A quarter is far too short a sample to separate skill from noise, so a return target grades you mostly on luck and teaches nothing repeatable. Targets like "zero unplanned entries" or "every trade journalled before the order" measure the input you control, which is the only input that can be improved deliberately.',
        },
      ],
      cardSeeds: [
        {
          id: 'u12-l07-c1',
          kind: 'cloze',
          front:
            'The four layers of behavioural defence, weakest to strongest: ____ → ____ → ____ → ____.',
          back: 'journaling → checklists → rules → automation. Each one moves the decision further from the stressed moment, and automation removes it from you entirely.',
        },
        {
          id: 'u12-l07-c2',
          kind: 'basic',
          front: 'What five fields belong in a trade journal note?',
          back: 'Thesis, invalidation conditions, exit or stop level, confidence (a 50/70/90-style number you can grade later), and emotional state at entry. The last field is the most diagnostic once you have thirty trades to sort by it.',
        },
        {
          id: 'u12-l07-c3',
          kind: 'basic',
          front: 'How do you review a quarter of trades properly?',
          back: 'Mark each closed trade as followed-process or broke-process using only what the journal note says, then separately as profit or loss, then compute expectancy for each row. Grade process first, outcome second, and set a behavioural target — not a return target — for the next quarter.',
        },
        {
          id: 'u12-l07-c4',
          kind: 'basic',
          front: 'Why are rules better than discretion, and what does that say about willpower?',
          back: 'Consistently applied simple rules routinely match or beat inconsistent expert judgement, and discipline is a depletable resource that runs out fastest under the stress that produces the expensive decisions. The most disciplined investors arranged in advance to need the least willpower — Ulysses tied himself to the mast rather than resisting.',
        },
      ],
    },
  ],
}
