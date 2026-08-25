import type { Unit } from '@core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Unit 07 — Valuation II: Intrinsic Value & DCF
// Multiples borrow their answer from other people's prices. A discounted cash
// flow model builds one from scratch: what will this business pay its owners,
// and what is that stream worth today? One worked model — Meridian Software —
// runs from Lesson 3 to Lesson 10, so every later idea is tested on numbers
// the learner has already built.
// ─────────────────────────────────────────────────────────────────────────────

export const u07: Unit = {
  id: 'u07',
  title: 'Valuation II: Intrinsic Value & DCF',
  order: 7,
  description:
    'Build a valuation from first principles: the time value of money, discount rates and WACC, projecting free cash flow, terminal value, a full worked DCF, sensitivity and scenarios, margin of safety, reverse DCF, owner earnings, and how to triangulate every method into one memo.',
  unlockAfter: 'u06',
  lessons: [
    // ── L01 ───────────────────────────────────────────────────────────────
    {
      id: 'u07-l01',
      unitId: 'u07',
      order: 1,
      title: 'The Time Value of Money',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `Unit 6 valued companies by comparison: this one trades at 9x, so that one should too. Useful, and entirely parasitic on someone else's opinion. A **discounted cash flow** model does something different — it builds a value from nothing but the cash the business will produce and the time you must wait for it.

Everything rests on one idea. **A dollar today is worth more than a dollar tomorrow**, for three separate reasons:

1. **Opportunity cost.** A dollar today can be invested and become more than a dollar. Waiting forfeits that.
2. **Risk.** A promised future dollar might not arrive. The further out and the shakier the promise, the larger the haircut.
3. **Inflation.** A future dollar buys less than today's dollar does.

**Discounting** is the arithmetic that converts a future amount into its equivalent today:

> **PV = FV ÷ (1 + r)ⁿ**

where **PV** is present value, **FV** is the future amount, **r** is the discount rate per period, and **n** is the number of periods. The reverse operation is compounding: **FV = PV × (1 + r)ⁿ**. They are the same equation read in opposite directions.`,
        },
        {
          kind: 'example',
          md: `**The $110-in-a-year problem.**

Someone offers you a contract that pays **$110 one year from today**. How much is it worth right now?

It depends entirely on the return you could otherwise earn — your **discount rate**.

- At **r = 10%**: PV = 110 / (1.10)¹ = 110 / 1.10 = **$100.00**
- At **r = 8%**: PV = 110 / 1.08 = **$101.85**
- At **r = 6%**: PV = 110 / 1.06 = **$103.77**
- At **r = 15%**: PV = 110 / 1.15 = **$95.65**

Check the first one by compounding forward: $100.00 × 1.10 = $110.00. ✓ The two operations undo each other exactly.

Two things fall straight out of that little table:

- **A higher discount rate means a lower present value**, always. Demanding more return means paying less today for the same future cash.
- **The future amount never changed.** All four numbers value the *identical* $110. The entire spread of $95.65 to $103.77 came from the rate — which is why Lesson 2 is about choosing it, and Lesson 6 is about admitting you cannot choose it precisely.`,
        },
        {
          kind: 'example',
          md: `**Time is the exponent, and exponents are brutal.**

Discount **$1,000** at 8%:

| Received in | Calculation | Present value |
|---|---|---|
| 1 year | 1,000 / 1.08 | **$925.93** |
| 5 years | 1,000 / 1.08⁵ | **$680.58** |
| 10 years | 1,000 / 1.08¹⁰ | **$463.19** |
| 30 years | 1,000 / 1.08³⁰ | **$99.38** |

At an 8% discount rate, $1,000 promised in thirty years is worth **under a hundred dollars** today — about a tenth of its face amount. Read the same fact forward: $100 invested at 8% grows to **$1,006.27** over thirty years.

This is why the far future contributes so little to a present value, and why anyone claiming precision about year 25 of a forecast is claiming precision about something that barely moves the answer. It is also, awkwardly, why terminal value still ends up dominating a DCF — Lesson 4 explains that apparent contradiction.`,
        },
        {
          kind: 'callout',
          md: `**A quick check you can do in your head.** Divide 72 by the rate to get the doubling time, and read it as a *halving* time for present value. At 9%, money doubles roughly every 8 years — so cash received in 8 years is worth roughly half as much as cash today, in 16 years roughly a quarter, in 24 years roughly an eighth. If a model's value depends on year 24, you should be nervous.`,
        },
        {
          kind: 'callout',
          md: `**Match the rate to the cash.** Discount **nominal** cash flows (which include inflation) at a **nominal** rate, and **real** cash flows at a **real** rate. Mixing them — projecting revenue growth that includes 3% inflation and then discounting at a real rate — inflates the answer substantially and is one of the most common silent errors in an amateur model. In practice, nominal-and-nominal is standard, because that is how companies actually report.`,
        },
        {
          kind: 'keypoint',
          md: `A dollar today beats a dollar tomorrow because of opportunity cost, risk, and inflation. PV = FV ÷ (1 + r)ⁿ, and its inverse FV = PV × (1 + r)ⁿ. $110 in one year is worth $100.00 at 10%, $101.85 at 8%, $95.65 at 15% — the future cash never moved, only the rate. A higher rate always means a lower present value, and time enters as an exponent, so distant cash flows shrink fast.`,
        },
      ],
      quiz: [
        {
          id: 'u07-l01-q1',
          prompt: 'What is the present value of $110 received in one year, discounted at 10%?',
          choices: [
            '$121.00',
            '$100.00',
            '$99.00',
            '$110.00',
          ],
          answerIdx: 1,
          explain:
            'PV = 110 / 1.10 = $100.00, and compounding back confirms it: 100 × 1.10 = 110. The $121 answer compounds forward instead of discounting back, which is the same formula run in the wrong direction.',
        },
        {
          id: 'u07-l01-q2',
          prompt: 'Raising the discount rate from 8% to 15% does what to the present value of a fixed future amount?',
          choices: [
            'Raises it, because a higher rate means higher returns',
            'Leaves it unchanged, since the future cash flow is fixed',
            'Lowers it — $110 in a year falls from $101.85 to $95.65',
            'Raises it for cash flows within five years and lowers it beyond',
          ],
          answerIdx: 2,
          explain:
            'A higher required return means you will pay less today for the same future dollars, so present value and discount rate always move in opposite directions. The future amount is identical in both cases — the entire difference is the price of waiting and bearing risk.',
        },
        {
          id: 'u07-l01-q3',
          prompt: 'What is the present value of $1,000 received in 10 years at an 8% discount rate?',
          choices: [
            '$463.19',
            '$925.93',
            '$800.00',
            '$2,158.92',
          ],
          answerIdx: 0,
          explain:
            '1,000 / 1.08¹⁰ = 1,000 / 2.1589 = $463.19 — time enters as an exponent, so ten years more than halves the value. The $925.93 answer discounts for one year only, and $800.00 subtracts 8% ten times linearly rather than compounding.',
        },
        {
          id: 'u07-l01-q4',
          prompt:
            'A model projects revenue growth that includes 3% inflation, then discounts at a real (inflation-adjusted) rate. What is the error?',
          choices: [
            'Nominal cash flows discounted at a real rate systematically overstate the present value',
            'Nothing — inflation cancels out of any discounted cash flow model',
            'It understates value, because real rates are always higher',
            'It only matters if the inflation rate exceeds the discount rate',
          ],
          answerIdx: 0,
          explain:
            'Growing the numerator with inflation while removing inflation from the denominator counts the same effect once in your favour and never against you, inflating the answer. The rule is nominal-with-nominal or real-with-real, and nominal is standard because that is how companies report.',
        },
      ],
      cardSeeds: [
        {
          id: 'u07-l01-c1',
          kind: 'cloze',
          front: 'PV = ____ ÷ (1 + ____)^____, and its inverse FV = ____ × (1 + r)^n.',
          back: 'FV ÷ (1 + r)^n; PV × (1 + r)^n',
        },
        {
          id: 'u07-l01-c2',
          kind: 'basic',
          front: 'Why is a dollar today worth more than a dollar tomorrow?',
          back: 'Opportunity cost (today\'s dollar can be invested), risk (the future dollar may not arrive), and inflation (it will buy less). Discounting converts future amounts into today\'s equivalent.',
        },
        {
          id: 'u07-l01-c3',
          kind: 'basic',
          front: 'What is $110 in one year worth at 10%, 8%, and 15%? What does the spread show?',
          back: '$100.00, $101.85, and $95.65. The future cash never changed — the entire spread comes from the discount rate, which is why choosing r is the highest-stakes assumption in a DCF.',
        },
      ],
    },

    // ── L02 ───────────────────────────────────────────────────────────────
    {
      id: 'u07-l02',
      unitId: 'u07',
      order: 2,
      title: 'Discount Rates & WACC Intuition',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `The discount rate is not a fact you look up. It is **the return you require** for parting with your money and bearing this particular risk — an opportunity cost, expressed as a percentage.

Build it in two layers:

> **Required return = risk-free rate + risk premium**

The **risk-free rate** is what you can earn with near-certainty, conventionally the yield on a long government bond (the 10-year is standard). It is the floor: no rational investor accepts less risk-adjusted return from a company than from a treasury.

The **risk premium** is the extra demanded for the possibility that this business disappoints. It scales with everything that makes the future uncertain: cyclicality, leverage, customer concentration, competitive fragility, regulatory exposure, and the sheer length of the forecast.

The textbook formulation of the equity layer is the **capital asset pricing model**:

> **Cost of equity = risk-free rate + β × equity risk premium**

where β measures how violently the stock moves relative to the market, and the equity risk premium is the historical excess return of stocks over bonds (commonly assumed at 4–6%). Treat it as scaffolding for the intuition rather than a precision instrument — β is estimated from past price wiggles and is a poor proxy for what a business owner would call risk.`,
        },
        {
          kind: 'text',
          md: `A company is funded by two kinds of capital, and each has its own price. The **weighted average cost of capital** blends them:

> **WACC = (E ÷ V) × cost of equity + (D ÷ V) × cost of debt × (1 − tax rate)**

where **E** is the market value of equity, **D** the market value of debt, and **V = E + D**.

Three things to notice:

- **Debt is cheaper than equity**, always. Lenders get paid first and have contractual claims, so they demand less. Equity is the residual claim and carries the residual risk.
- **The (1 − tax rate) term** is the interest tax shield: interest is tax-deductible, so a dollar of interest costs the company less than a dollar after tax. Dividends are not deductible, so no such term appears on the equity side.
- **More debt lowers WACC — until it doesn't.** Adding cheap debt mechanically pulls the average down, but past a point it raises the risk of *both* claims, so both costs rise and WACC turns back up.

**Typical territory** for a large, stable listed company: **7–10%**. Below 6% implies extraordinary safety; above 12% implies you are valuing something genuinely fragile. If your model needs a 5% rate to produce an attractive answer, the model is telling you the answer is not attractive.`,
        },
        {
          kind: 'example',
          md: `**Meridian Software — building the rate.** (This company runs through the rest of the unit; the numbers here are the ones every later lesson uses.)

Market value of equity **$800M**, market value of debt **$200M**, so **V = $1,000M**. Tax rate 25%.

**Cost of equity via CAPM:** the 10-year government bond yields **4%**, Meridian's β is **1.0**, and we use a **5%** equity risk premium.

- Cost of equity = 4% + 1.0 × 5% = **9.0%**

**Cost of debt:** Meridian's bonds trade at a **5%** yield. After the tax shield: 5% × (1 − 0.25) = **3.75%**.

**Blend them:**

- Equity weight = 800 / 1,000 = **0.80** → 0.80 × 9.0% = **7.20%**
- Debt weight = 200 / 1,000 = **0.20** → 0.20 × 3.75% = **0.75%**
- **WACC = 7.20% + 0.75% = 7.95%**

We will round to **9%** for the rest of the unit — deliberately. Two reasons, and both matter more than the decimal we just discarded:

1. **Every input is an estimate.** The equity risk premium is a contested historical average, β is a regression on past prices, and the "risk-free" rate moves daily. A WACC quoted to two decimals is false precision dressed up as rigour.
2. **A slightly higher rate is a form of humility.** Using 9% instead of 7.95% builds in a cushion against the optimism that creeps into every forecast.

**What a bad rate costs.** Discounting Meridian's identical cash flows at 7% instead of 9% raises the per-share value from **$36.46** to **$54.78** — a 50% increase produced by nothing but the rate. At 12% the same cash flows are worth **$23.46**. The discount rate is not a technicality.`,
        },
        {
          kind: 'callout',
          md: `**A practical shortcut many investors prefer.** Skip the CAPM machinery and simply ask: *what annual return do I require to own this business?* Then discount at that. If you require 10% and the model says the stock is worth more than the price at 10%, you expect to earn at least 10%. This "hurdle rate" framing is honest about what the rate really is — a personal requirement, not a market observable — and it removes the illusion that β measured your risk for you.`,
        },
        {
          kind: 'callout',
          md: `**Do not use a single company-wide rate for wildly different cash flows.** A stable subscription business and a speculative new venture inside the same company do not deserve the same discount rate. Professionals handle this by valuing segments separately or by risk-adjusting the *cash flows* rather than inflating the rate — because a punitive discount rate applied to all years penalises the near-certain near-term cash just as hard as the speculative far-term cash.`,
        },
        {
          kind: 'keypoint',
          md: `The discount rate is your required return: risk-free rate + risk premium. Cost of equity ≈ risk-free + β × equity risk premium. WACC = (E/V) × cost of equity + (D/V) × cost of debt × (1 − tax rate); debt is cheaper because lenders are paid first and interest is tax-deductible. Meridian: 0.80 × 9% + 0.20 × 5% × 0.75 = 7.95%, rounded to 9% for humility. Typical large-cap range is 7–10%, and moving from 7% to 12% changes Meridian's value from $54.78 to $23.46.`,
        },
      ],
      quiz: [
        {
          id: 'u07-l02-q1',
          prompt:
            'Meridian has $800M of equity at a 9% cost and $200M of debt at 5%, with a 25% tax rate. What is its WACC?',
          choices: [
            '8.20%',
            '7.95%',
            '7.00%',
            '9.00%',
          ],
          answerIdx: 1,
          explain:
            '0.80 × 9% = 7.20% plus 0.20 × 5% × 0.75 = 0.75%, giving 7.95%. The 8.20% answer omits the (1 − tax rate) term, forgetting that deductible interest makes debt cheaper still to the company than its headline coupon.',
        },
        {
          id: 'u07-l02-q2',
          prompt: 'Why is debt cheaper than equity as a source of capital?',
          choices: [
            'Because debt investors are less sophisticated than equity investors',
            'Because debt never has to be repaid',
            'Because lenders are paid first with contractual claims, and interest is tax-deductible',
            'Because interest rates are set by central banks while equity returns are not',
          ],
          answerIdx: 2,
          explain:
            'Priority in the capital structure means lenders bear less risk and therefore demand less return, and deductibility reduces the after-tax cost further via the (1 − tax rate) term. Equity is the residual claim, paid last, so it carries the residual risk and its price reflects that.',
        },
        {
          id: 'u07-l02-q3',
          prompt: 'What does the CAPM cost of equity formula say?',
          choices: [
            'Cost of equity = risk-free rate + β × equity risk premium',
            'Cost of equity = dividend yield + growth rate',
            'Cost of equity = WACC ÷ (1 − tax rate)',
            'Cost of equity = earnings yield × leverage ratio',
          ],
          answerIdx: 0,
          explain:
            'CAPM builds the required equity return from a risk-free floor plus a premium scaled by β, the stock\'s sensitivity to market moves. It is useful scaffolding for the intuition, though β is estimated from past price volatility and is a weak proxy for what a business owner would call risk.',
        },
        {
          id: 'u07-l02-q4',
          prompt:
            'Discounting Meridian\'s identical cash flows at 7% gives $54.78 per share; at 12% it gives $23.46. What is the lesson?',
          choices: [
            'The cash flow projection is the only assumption that matters',
            'DCF models are invalid whenever the answer changes',
            'The discount rate alone can more than double the answer, so it must be justified, not assumed',
            'A 7% rate should always be used, since it is more optimistic',
          ],
          answerIdx: 2,
          explain:
            'Nothing about the business changed between those two numbers — only the required return — so an unexamined rate silently decides the conclusion. This is also why a model needing an implausibly low rate to look attractive is quietly reporting that it is not.',
        },
        {
          id: 'u07-l02-q5',
          prompt: 'Why do many investors skip CAPM and simply pick a personal hurdle rate?',
          choices: [
            'Because CAPM is prohibited outside institutional settings',
            'Because a hurdle rate always produces a higher valuation',
            'Because β is unavailable for listed companies',
            'Because the rate is really a personal required return, and CAPM\'s β measures past price volatility rather than business risk',
          ],
          answerIdx: 3,
          explain:
            'Framing the rate as "the return I demand to own this" is honest about what it is and avoids the illusion that a regression on historical prices has measured the risk for you. If a stock clears its value test at your 10% hurdle, you expect to earn at least 10%.',
        },
      ],
      cardSeeds: [
        {
          id: 'u07-l02-c1',
          kind: 'cloze',
          front:
            'WACC = (E ÷ V) × ____ + (D ÷ V) × ____ × (1 − ____).',
          back: 'cost of equity; cost of debt; tax rate',
        },
        {
          id: 'u07-l02-c2',
          kind: 'cloze',
          front: 'Cost of equity (CAPM) = ____ + ____ × ____.',
          back: 'risk-free rate + β × equity risk premium',
        },
        {
          id: 'u07-l02-c3',
          kind: 'basic',
          front: 'What is a typical WACC range for a large listed company, and what do values outside it imply?',
          back: '7–10%. Below 6% implies extraordinary safety; above 12% implies genuine fragility. If a model needs an implausibly low rate to look attractive, that is the model reporting that it is not attractive.',
        },
      ],
    },

    // ── L03 ───────────────────────────────────────────────────────────────
    {
      id: 'u07-l03',
      unitId: 'u07',
      order: 3,
      title: 'Projecting Free Cash Flows',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A DCF discounts **free cash flow** — the cash left after the business has paid its costs, its taxes, and the capital spending required to keep operating (Unit 4). Not earnings, not EBITDA: the cash an owner could actually withdraw.

Build the projection as a **chain**, so every number has a stated reason:

> **Revenue → margin → operating profit → tax → reinvestment → free cash flow**

1. **Revenue growth.** The hardest and most important assumption. Decompose it where you can: volume × price, or customers × revenue per customer.
2. **Margin path.** Does the margin expand with scale, hold, or compress under competition? A margin assumption that drifts upward every year needs a reason.
3. **Taxes.** Apply a sustainable cash tax rate, not a one-off effective rate distorted by credits.
4. **Reinvestment.** Capex and working capital. Growth consumes cash before it produces any.

The explicit forecast normally runs **5 to 10 years** — long enough for a company's current advantages to play out, short enough that the numbers are not pure fiction. Everything beyond it goes into terminal value (Lesson 4).`,
        },
        {
          kind: 'text',
          md: `**Growth fades. Always.** This is the base rate that separates a defensible model from a fantasy. High growth attracts capital, capital attracts competition, competition compresses growth and margins. Large numbers get harder: a company growing 30% on $1B of revenue must add $300M; the same rate on $50B demands $15B.

Empirically, very few companies sustain 20%+ growth for a decade, and essentially none do so for two. So your growth path should **fade toward the economy's growth rate** — nominal GDP, roughly 4–5% — over the forecast horizon. A model that holds 20% growth flat for ten years is not aggressive; it is asserting something that has almost never happened.

**The hockey stick** is the signature failure. Two shapes to distrust:

- Flat or declining recent performance, followed by a sharp acceleration beginning in year 1 of the forecast — always the year the model was built.
- Margins that expand every single year to a level the company has never achieved and no peer sustains.

The discipline: **the first forecast year should look like a plausible continuation of the last actual year.** If it does not, the model is arguing with reality and you should find out why before believing it.`,
        },
        {
          kind: 'example',
          md: `**Meridian Software — the five-year projection.** This is the model every remaining lesson uses.

Last full year: **revenue $1,000M**, **free cash flow $100M** (a 10.0% FCF margin). Growth has been decelerating: 18%, 15%, 13% over the last three years.

We assume the fade continues and the FCF margin holds at **10.0%**:

| Year | Growth | Revenue | FCF margin | Free cash flow |
|---|---|---|---|---|
| 0 (actual) | — | $1,000.0M | 10.0% | **$100.0M** |
| 1 | 12% | $1,120.0M | 10.0% | **$112.0M** |
| 2 | 10% | $1,232.0M | 10.0% | **$123.2M** |
| 3 | 8% | $1,330.6M | 10.0% | **$133.1M** |
| 4 | 6% | $1,410.4M | 10.0% | **$141.0M** |
| 5 | 5% | $1,480.9M | 10.0% | **$148.1M** |

Check a row: year 3 revenue = 1,232.0 × 1.08 = $1,330.56M, and 10% of that is $133.06M. ✓

Over five years FCF grows from $100.0M to $148.1M — a **compound rate of 8.2%**, well below the 12% we start with, because the fade does its work. The company ends the forecast growing at 5%, close enough to nominal GDP that the terminal assumption in Lesson 4 will not be a leap.

**The hockey stick alternative, for contrast.** Suppose we had instead assumed 20% growth held flat for ten years. Revenue would reach 1,000 × 1.20¹⁰ = **$6,191.7M** — a company more than six times its current size, in a market that would have to grow with it, against competitors who apparently never respond. Writing the number down is usually enough to kill the assumption.`,
        },
        {
          kind: 'callout',
          md: `**Growth without reinvestment is not free.** If you project revenue rising 50% over five years while capex and working capital stay flat, you have assumed the company grows without buying anything — which is only true for a genuinely asset-light business, and even then only up to a point. Tie reinvestment to growth: a common approximation is that reinvestment ≈ growth rate ÷ ROIC, which is Unit 5, Lesson 4 reappearing as a modelling constraint.`,
        },
        {
          kind: 'callout',
          md: `**Sanity-check against the industry, not just the company.** If your forecast implies the company's market share rises from 8% to 25% while three well-funded competitors do nothing, the forecast is a market-share assumption wearing a growth-rate costume. Convert growth projections into implied share, implied units, or implied customers — anything that can be checked against a real-world ceiling.`,
        },
        {
          kind: 'keypoint',
          md: `Project free cash flow through the chain revenue → margin → operating profit → tax → reinvestment → FCF, over an explicit 5–10 year window. Growth fades: high returns attract competition and large bases resist growth, so the path should decline toward nominal GDP of 4–5%. Meridian goes 12/10/8/6/5% on a flat 10% FCF margin, taking FCF from $100.0M to $148.1M — an 8.2% compound rate. Distrust hockey sticks: year 1 of the forecast should be a plausible continuation of year 0.`,
        },
      ],
      quiz: [
        {
          id: 'u07-l03-q1',
          prompt:
            'Meridian has year-2 revenue of $1,232.0M, grows 8% in year 3, and holds a 10.0% FCF margin. What is year-3 free cash flow?',
          choices: [
            '$123.2M',
            '$1,330.6M',
            '$141.0M',
            '$133.1M',
          ],
          answerIdx: 3,
          explain:
            'Revenue = 1,232.0 × 1.08 = $1,330.6M, and 10% of that is $133.1M. The $1,330.6M answer is the revenue itself rather than the cash flow, and $123.2M is the prior year — both easy slips when reading across a projection table.',
        },
        {
          id: 'u07-l03-q2',
          prompt: 'Why should a projected growth rate fade over the forecast horizon?',
          choices: [
            'Because accounting rules require conservative forecasts',
            'Because high growth attracts competition and large revenue bases make each percentage point harder to add',
            'Because discount rates rise over time',
            'Because companies deliberately slow growth to reduce their tax burden',
          ],
          answerIdx: 1,
          explain:
            'Capital chases high returns until competition compresses them, and 30% growth on $50B requires adding $15B where the same rate on $1B required $300M. Very few companies sustain 20%+ growth for a decade, so a path fading toward nominal GDP of 4–5% is the base rate rather than pessimism.',
        },
        {
          id: 'u07-l03-q3',
          prompt: 'What is a "hockey stick" forecast and why is it a warning sign?',
          choices: [
            'Any forecast extending beyond five years',
            'A forecast where margins are held constant throughout',
            'A forecast using nominal rather than real cash flows',
            'Flat or declining recent results followed by sharp acceleration starting in year 1 of the forecast',
          ],
          answerIdx: 3,
          explain:
            'The inflection conveniently begins the year the model was built, which means it is an assertion rather than an extrapolation of anything observed. The discipline is that year 1 of the forecast should look like a plausible continuation of the last actual year.',
        },
        {
          id: 'u07-l03-q4',
          prompt:
            'Meridian\'s FCF grows from $100.0M to $148.1M over five years. What compound annual rate is that, and why is it below the 12% starting growth?',
          choices: [
            '8.2%, because the fading growth path pulls the average down',
            '9.6%, the simple average of the five annual rates',
            '48.1%, the total growth over the period',
            '12%, since the first year sets the compound rate',
          ],
          answerIdx: 0,
          explain:
            '(148.1 / 100.0)^(1/5) − 1 = 8.2%, which sits below the 12% opening rate precisely because the path steps down to 10%, 8%, 6% and 5%. Compound rates are driven by the whole path, so quoting the first year would overstate the projection substantially.',
        },
        {
          id: 'u07-l03-q5',
          prompt:
            'A model projects revenue up 50% over five years with capex and working capital held flat. What is the flaw?',
          choices: [
            'Capex should always be projected as a fixed percentage of revenue',
            'Working capital is irrelevant to free cash flow',
            'It assumes the company can grow without buying anything — growth consumes cash before producing it',
            'Nothing, provided the company is profitable',
          ],
          answerIdx: 2,
          explain:
            'Growth normally requires capacity, inventory and receivables, so reinvestment should be tied to the growth rate — approximately growth ÷ ROIC. Holding reinvestment flat while revenue climbs manufactures free cash flow out of an assumption rather than a business.',
        },
      ],
      cardSeeds: [
        {
          id: 'u07-l03-c1',
          kind: 'cloze',
          front:
            'The FCF projection chain runs: ____ → ____ → operating profit → ____ → ____ → free cash flow.',
          back: 'revenue → margin → operating profit → tax → reinvestment → free cash flow',
        },
        {
          id: 'u07-l03-c2',
          kind: 'basic',
          front: 'Why must projected growth fade, and toward what rate?',
          back: 'High growth attracts competition and large bases resist growth, so growth should fade toward nominal GDP of roughly 4–5% over the forecast horizon. Very few companies sustain 20%+ growth for a decade and essentially none for two.',
        },
        {
          id: 'u07-l03-c3',
          kind: 'basic',
          front: 'Meridian\'s five-year FCF projection — the numbers.',
          back: 'From $100.0M base, growing 12/10/8/6/5% at a flat 10% FCF margin: $112.0M, $123.2M, $133.1M, $141.0M, $148.1M. That is an 8.2% compound rate over the five years.',
        },
        {
          id: 'u07-l03-c4',
          kind: 'basic',
          front: 'What is a hockey stick, and what is the discipline that prevents one?',
          back: 'A forecast where flat or declining results suddenly accelerate in year 1 of the model — the year it was built. The discipline: year 1 must look like a plausible continuation of the last actual year, and growth should be convertible into implied market share or units that can be checked against a real ceiling.',
        },
      ],
    },

    // ── L04 ───────────────────────────────────────────────────────────────
    {
      id: 'u07-l04',
      unitId: 'u07',
      order: 4,
      title: 'Terminal Value',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A business does not stop at the end of your forecast. **Terminal value** is the value of everything after the explicit window — years 6 to infinity, collapsed into one number sitting at the end of year 5.

Two standard methods.

**Method 1 — perpetuity growth (Gordon growth).** Assume the final year's cash flow grows forever at a constant rate g:

> **TV = FCF₅ × (1 + g) ÷ (r − g)**

The numerator is next year's cash flow (year 6), which is why the (1 + g) is there. The denominator, r − g, is the whole game: as g approaches r, it collapses toward zero and TV explodes toward infinity.

**Choosing g.** The constraint is not aesthetic, it is logical: **g must not exceed the long-run growth rate of the economy.** A company growing faster than GDP forever eventually becomes the entire economy. Defensible range: **2% to 3%**, roughly long-run inflation plus a little real growth. Use of 5% or 6% is the single most common way to manufacture a valuation.

**Method 2 — exit multiple.** Assume the business is sold at the end of year 5 at a multiple a buyer would plausibly pay:

> **TV = year-5 metric × exit multiple** (e.g. FCF₅ × 16, or EBITDA₅ × 10)

This is intuitive and grounded in observable market prices. Its weakness is circularity: you are valuing a company using multiples, which is what a DCF was supposed to avoid — and today's multiple may not be the one available in five years.

**Best practice is to run both** and check they roughly agree. A perpetuity assumption that implies an exit multiple no buyer has ever paid is telling you something.`,
        },
        {
          kind: 'example',
          md: `**Meridian's terminal value, both ways.**

From Lesson 3, **FCF₅ = $148.1M**. Our discount rate is **r = 9%** and we assume perpetuity growth **g = 2.5%**.

**Perpetuity growth:**

- TV = 148.1 × 1.025 ÷ (0.09 − 0.025) = 151.8 ÷ 0.065 = **$2,335.3M**

That is a large number, so cross-check it. **What exit multiple does it imply?**

- 2,335.3 / 148.1 = **15.8x** free cash flow

Is 15.8x FCF a price a buyer would pay for a business growing 2.5% a year? It corresponds to a 6.3% FCF yield — demanding but not absurd for a durable software business. The perpetuity assumption survives the sanity check.

**Exit multiple, for comparison:**

| Exit multiple | TV | PV of TV at 9% | Implied value per share |
|---|---|---|---|
| 14x FCF₅ | $2,073.3M | $1,347.5M | $33.06 |
| 16x FCF₅ | $2,369.5M | $1,540.0M | $36.91 |
| 18x FCF₅ | $2,665.6M | $1,732.5M | $40.76 |

The 16x row lands at $36.91, within 1.2% of the $36.46 the perpetuity method produces in Lesson 5. The two methods agree — which is the point of running both.

**Now the uncomfortable part.** Discounting that $2,335.3M back five years at 9% gives **$1,517.8M**. The five explicit years of cash flow are worth **$505.4M** in total. So:

> **Terminal value is 1,517.8 / 2,023.1 = 75.0% of the entire valuation.**

Three quarters of the answer comes from the part you did not forecast.`,
        },
        {
          kind: 'text',
          md: `**What TV dominance actually implies.** The instinct is to conclude the model is broken. It is not — it is honest. Most of the value of an ongoing business genuinely does lie beyond five years; that is what "ongoing" means. A bond has a terminal value too, and nobody calls it a flaw.

What it does imply is a change in where you spend your effort and your scepticism:

- **Extending the forecast reduces TV's share but barely moves the answer.** Take Meridian to ten explicit years (fading 12/10/8/6/5/4.5/4/3.5/3/2.5%) and TV falls to **55.9%** of value — while the per-share figure moves from $36.46 to **$37.88**, about 4%. The value did not move; it was merely relabelled.
- **The terminal assumptions deserve the most scrutiny, not the least.** A 1-point change in g moves the answer far more than a 1-point change in year-3 revenue growth. Lesson 6 quantifies that.
- **Argue about g and r, not about the third decimal of year 4.** Most of a beginner's modelling effort goes into the 25% of the value that is easiest to estimate.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Terminal value dominating the answer means the DCF is useless."**

TV dominance is a property of valuing anything long-lived, not a defect of the technique. The correct response is not to abandon the DCF but to (1) sanity-check the implied exit multiple, (2) keep g at or below long-run GDP growth, (3) test the answer across a range of g and r rather than reporting one number, and (4) stop pretending the output is precise. A DCF's job is to make your assumptions explicit and testable — not to produce a number to the cent.`,
        },
        {
          kind: 'callout',
          md: `**Watch r − g like a hawk.** With r = 9% and g = 2.5%, the denominator is 6.5%. Push g to 5% and it becomes 4% — TV rises by more than 60%. Push g to 8% and the denominator is 1%, producing a value roughly six times larger and a company that eventually swallows the world economy. If a valuation only works with a high g, the valuation does not work.`,
        },
        {
          kind: 'keypoint',
          md: `TV = FCF₅ × (1 + g) ÷ (r − g), with g capped at long-run GDP growth (2–3%); or TV = year-5 metric × exit multiple. Meridian: 148.1 × 1.025 ÷ 0.065 = $2,335.3M, implying a 15.8x FCF exit — a passing sanity check. Discounted back, TV is 75.0% of the total value, which is honest rather than broken: extending to ten explicit years cuts TV's share to 55.9% but changes the answer by only 4%. Scrutinise g and r hardest.`,
        },
      ],
      quiz: [
        {
          id: 'u07-l04-q1',
          prompt:
            'Meridian\'s year-5 FCF is $148.1M, r = 9%, and g = 2.5%. What is the terminal value?',
          choices: [
            '$2,278.3M',
            '$2,335.3M',
            '$1,645.5M',
            '$5,923.6M',
          ],
          answerIdx: 1,
          explain:
            'TV = 148.1 × 1.025 / (0.09 − 0.025) = 151.8 / 0.065 = $2,335.3M. The $2,278.3M answer omits the (1 + g) in the numerator, and $1,645.5M assumes zero perpetual growth by dividing by r alone.',
        },
        {
          id: 'u07-l04-q2',
          prompt: 'Why must the perpetuity growth rate g not exceed long-run GDP growth?',
          choices: [
            'Because accounting standards cap terminal growth assumptions',
            'Because the formula becomes undefined above 3%',
            'Because a company growing faster than the economy forever would eventually become the entire economy',
            'Because inflation is always below GDP growth',
          ],
          answerIdx: 2,
          explain:
            'Perpetual growth above the economy\'s rate implies an ever-rising share of GDP without limit, which is logically impossible rather than merely optimistic. The formula stays defined for any g below r — it simply produces absurd values, which is what makes an inflated g such an effective way to manufacture a valuation.',
        },
        {
          id: 'u07-l04-q3',
          prompt:
            'In Meridian\'s model, terminal value is 75.0% of the total. Extending the forecast to ten explicit years cuts it to 55.9%. What happens to the value?',
          choices: [
            'It falls by roughly a quarter, matching the reduction in TV share',
            'It barely moves — from $36.46 to $37.88, about 4% — because the value was only relabelled',
            'It roughly doubles, since more years of cash flow are counted',
            'It cannot be compared across different forecast horizons',
          ],
          answerIdx: 1,
          explain:
            'Cash flows in years 6–10 shift from inside terminal value to inside the explicit forecast without being created or destroyed, so only the label changes. This is the clearest evidence that TV dominance is a property of valuing long-lived assets rather than a defect in the method.',
        },
        {
          id: 'u07-l04-q4',
          prompt:
            'A perpetuity terminal value of $2,335.3M on $148.1M of year-5 FCF implies what, and why compute it?',
          choices: [
            'An implied exit multiple of 15.8x FCF — a sanity check on whether a buyer would ever pay it',
            'A perpetual growth rate of 15.8%',
            'A discount rate of 15.8%',
            'That the company will be sold in year 15.8',
          ],
          answerIdx: 0,
          explain:
            '2,335.3 / 148.1 = 15.8x, a 6.3% FCF yield, which is demanding but plausible for a durable business growing 2.5%. Converting a perpetuity assumption into the multiple it implies is the fastest way to catch a terminal value no real buyer would validate.',
        },
        {
          id: 'u07-l04-q5',
          prompt:
            'With r = 9%, raising g from 2.5% to 5% does what to terminal value, and why?',
          choices: [
            'Raises it about 25%, roughly in proportion to the change in g',
            'Leaves it unchanged, since g appears in both numerator and denominator',
            'Lowers it, because higher growth requires more reinvestment',
            'Raises it by more than 60%, because the r − g denominator shrinks from 6.5% to 4.0%',
          ],
          answerIdx: 3,
          explain:
            'Terminal value is driven by the spread r − g, and shrinking it from 6.5% to 4.0% is a 38% reduction in the divisor before the larger numerator is even counted. That leverage is exactly why an inflated g is the most common way to manufacture a valuation that does not exist.',
        },
      ],
      cardSeeds: [
        {
          id: 'u07-l04-c1',
          kind: 'cloze',
          front: 'Perpetuity terminal value: TV = ____ × (1 + ____) ÷ (____ − ____).',
          back: 'FCF of the final forecast year × (1 + g) ÷ (r − g)',
        },
        {
          id: 'u07-l04-c2',
          kind: 'basic',
          front: 'What are the two terminal value methods, and what is each one\'s weakness?',
          back: 'Perpetuity growth — TV = FCF₅ × (1+g)/(r−g) — is sensitive to g and explodes as g approaches r. Exit multiple — TV = year-5 metric × multiple — is circular, since it reimports the multiples a DCF was meant to avoid. Run both and check they agree.',
        },
        {
          id: 'u07-l04-c3',
          kind: 'basic',
          front: 'Terminal value is 75% of Meridian\'s DCF. Is the model broken?',
          back: 'No. Most of a going concern\'s value genuinely lies beyond five years. Extending to ten explicit years drops TV\'s share to 55.9% while changing the answer only 4% ($36.46 to $37.88) — the value was relabelled, not created. The response is to scrutinise g and r and report a range, not to abandon the method.',
        },
        {
          id: 'u07-l04-c4',
          kind: 'basic',
          front: 'What is the cap on g, and what sanity check validates a perpetuity TV?',
          back: 'g must not exceed long-run GDP growth — defensible range 2–3%. Sanity check: divide TV by final-year FCF to get the implied exit multiple. Meridian\'s $2,335.3M on $148.1M implies 15.8x, a 6.3% FCF yield a real buyer might pay.',
        },
      ],
    },

    // ── L05 ───────────────────────────────────────────────────────────────
    {
      id: 'u07-l05',
      unitId: 'u07',
      order: 5,
      title: 'Building a Simple DCF',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Every piece is now on the table. Assemble them.

**The six steps:**

1. Project free cash flow for the explicit years (Lesson 3).
2. Discount each year: **PV = FCF ÷ (1 + r)ⁿ** (Lesson 1).
3. Compute terminal value: **TV = FCF₅ × (1 + g) ÷ (r − g)** (Lesson 4).
4. Discount the terminal value back the same number of years: **PV(TV) = TV ÷ (1 + r)⁵**.
5. Sum everything → **enterprise value**.
6. Bridge to equity: **equity value = EV − net debt**, then **÷ shares** for value per share.

Step 6 is the one beginners skip. A DCF on unlevered free cash flow produces an **enterprise** value — the value of the whole business to everyone who funded it. Shareholders own what is left after the lenders are repaid.`,
        },
        {
          kind: 'example',
          md: `**Meridian Software — the complete model.**

**Assumptions:** discount rate **r = 9%**; perpetuity growth **g = 2.5%**; **net debt $200M**; **50M shares outstanding**. Free cash flows from Lesson 3.

**Steps 1 and 2 — discount the explicit years:**

| Year | FCF | Discount factor 1/1.09ⁿ | Present value |
|---|---|---|---|
| 1 | $112.0M | 0.9174 | **$102.8M** |
| 2 | $123.2M | 0.8417 | **$103.7M** |
| 3 | $133.1M | 0.7722 | **$102.7M** |
| 4 | $141.0M | 0.7084 | **$99.9M** |
| 5 | $148.1M | 0.6499 | **$96.2M** |
| | | **Sum of PVs** | **$505.4M** |

Check row 1: 112.0 / 1.09 = $102.75M ✓. Notice the present values are nearly flat across the five years — cash flow growth of 8.2% and discounting at 9% almost exactly cancel.

**Steps 3 and 4 — terminal value:**

- TV = 148.1 × 1.025 ÷ 0.065 = **$2,335.3M**
- PV(TV) = 2,335.3 ÷ 1.09⁵ = 2,335.3 × 0.6499 = **$1,517.8M**

**Step 5 — enterprise value:**

- EV = 505.4 + 1,517.8 = **$2,023.1M**

**Step 6 — bridge to equity and per share:**

- Equity value = 2,023.1 − 200.0 = **$1,823.1M**
- Value per share = 1,823.1 ÷ 50 = **$36.46**

**Meridian's estimated intrinsic value is $36.46 per share.**

The stock currently trades at **$30.00**, which is a **17.7%** discount to that estimate (1 − 30 / 36.46). Whether that is enough of a discount is Lesson 7's question.`,
        },
        {
          kind: 'text',
          md: `**Read the model back before you trust it.** Three diagnostics, all computed from numbers already on the page:

- **Terminal value share:** 1,517.8 / 2,023.1 = **75.0%**. High, and normal (Lesson 4).
- **Implied EV/FCF today:** 2,023.1 / 100.0 = **20.2x** current free cash flow. Does 20x look sane for a business fading from 12% to 5% growth? It is a full but defensible price — and the market's own 17.0x (EV of 1,700 at the $30 price, on $100M of FCF) is the more conservative view.
- **What the market is implying:** at $30.00, market cap is $1,500M and EV is $1,700M, meaning the market is valuing the same business $323M below your model. Lesson 8 turns that gap into a testable growth assumption.

And one thing the model does **not** do: it does not tell you it is right. Every number above is a mechanical consequence of four assumptions — the growth path, the FCF margin, r, and g. Change any of them and the answer changes, sometimes violently. That is Lesson 6.`,
        },
        {
          kind: 'callout',
          md: `**Mid-year convention (optional but worth knowing).** The model above assumes every year's cash arrives in a single lump on the last day of the year. In reality it arrives throughout the year. Discounting at n − 0.5 instead of n — the **mid-year convention** — raises the valuation by roughly 4% at a 9% rate. It is more accurate; it is also a refinement worth far less than getting r or g approximately right, so do not reach for it before the big assumptions are settled.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "$36.46 is what the stock is worth."**

It is not. It is what the stock is worth *if* revenue grows 12/10/8/6/5%, *if* the FCF margin holds at 10%, *if* 9% is the right required return, and *if* the business is still growing 2.5% a century from now. The honest output of a DCF is a **range with a clearly stated set of assumptions**, and the two decimal places are an artefact of arithmetic, not knowledge. Report "somewhere in the low-to-mid thirties, on these assumptions" — never "$36.46."`,
        },
        {
          kind: 'keypoint',
          md: `The six steps: project FCF, discount each year at 1/(1+r)ⁿ, compute TV = FCF₅(1+g)/(r−g), discount TV back, sum to enterprise value, then subtract net debt and divide by shares. Meridian: PVs of $102.8 + $103.7 + $102.7 + $99.9 + $96.2 = $505.4M, plus PV(TV) of $1,517.8M = EV $2,023.1M; less $200M net debt = $1,823.1M equity; ÷ 50M shares = $36.46 per share against a $30.00 price. Never skip the net-debt bridge, and never quote the output to the cent.`,
        },
      ],
      quiz: [
        {
          id: 'u07-l05-q1',
          prompt:
            'Meridian\'s year-1 FCF is $112.0M and r = 9%. What is its present value?',
          choices: [
            '$122.1M',
            '$102.8M',
            '$112.0M',
            '$96.2M',
          ],
          answerIdx: 1,
          explain:
            '112.0 / 1.09 = $102.8M, applying the 0.9174 discount factor for one year. The $122.1M answer multiplies by 1.09 instead of dividing, and $96.2M is the year-5 present value further down the same column.',
        },
        {
          id: 'u07-l05-q2',
          prompt:
            'Meridian\'s explicit-period PVs sum to $505.4M and PV of terminal value is $1,517.8M. Net debt is $200M and there are 50M shares. What is the value per share?',
          choices: [
            '$36.46',
            '$40.46',
            '$30.34',
            '$44.46',
          ],
          answerIdx: 0,
          explain:
            'EV = 505.4 + 1,517.8 = $2,023.1M; equity = 2,023.1 − 200 = $1,823.1M; 1,823.1 / 50 = $36.46. The $40.46 answer skips the net-debt bridge and divides enterprise value straight by the share count, handing shareholders value that belongs to lenders.',
        },
        {
          id: 'u07-l05-q3',
          prompt:
            'Why does a DCF on unlevered free cash flow require subtracting net debt before dividing by shares?',
          choices: [
            'Because net debt is a non-cash charge that must be reversed',
            'Because unlevered FCF produces an enterprise value — the value to all capital providers — and shareholders own only what remains after lenders',
            'Because share counts are stated net of debt in the filings',
            'Because interest expense is already deducted from unlevered FCF',
          ],
          answerIdx: 1,
          explain:
            'Unlevered free cash flow is generated before any payment to lenders, so discounting it yields the value of the whole business rather than the equity slice. Interest is specifically *not* deducted from unlevered FCF, which is exactly why the debt claim has to be removed at the end instead.',
        },
        {
          id: 'u07-l05-q4',
          prompt:
            'Meridian\'s enterprise value of $2,023.1M against $100.0M of current FCF implies 20.2x. Why compute that?',
          choices: [
            'It replaces the DCF with a simpler multiple-based valuation',
            'It converts the model into an earnings yield for tax purposes',
            'It is a sanity check: does 20x current free cash flow look plausible for a business fading from 12% to 5% growth?',
            'It determines the terminal growth rate the model should use',
          ],
          answerIdx: 2,
          explain:
            'Translating a DCF output back into a multiple tests it against prices real buyers actually pay, catching models whose assumptions imply a valuation nobody would validate. It is a check on the model, not a substitute for it — the market\'s own 17.0x on the same FCF is simply a more conservative set of assumptions.',
        },
        {
          id: 'u07-l05-q5',
          prompt: 'What is the honest way to report a DCF output of $36.46?',
          choices: [
            'As a precise intrinsic value of $36.46 per share',
            'As a range on clearly stated assumptions — "low-to-mid thirties, if growth fades 12% to 5% and r is 9%"',
            'As a price target to be updated daily as the stock moves',
            'As the maximum price at which the stock can ever trade',
          ],
          answerIdx: 1,
          explain:
            'The two decimals are an artefact of arithmetic, not knowledge: the figure is a mechanical consequence of four estimated assumptions and moves substantially when any of them shifts. Reporting a range with its assumptions attached is what makes a DCF a tool for thinking rather than a false precision machine.',
        },
      ],
      cardSeeds: [
        {
          id: 'u07-l05-c1',
          kind: 'cloze',
          front:
            'DCF steps: project FCF → discount at ____ → add TV = ____ → discount TV → sum to ____ → subtract ____ → divide by ____.',
          back: '1/(1+r)^n; FCF₅ × (1+g)/(r−g); enterprise value; net debt; shares outstanding',
        },
        {
          id: 'u07-l05-c2',
          kind: 'basic',
          front: 'Meridian DCF — the full chain of numbers.',
          back: 'PVs of explicit years: 102.8 + 103.7 + 102.7 + 99.9 + 96.2 = $505.4M. TV $2,335.3M → PV $1,517.8M. EV $2,023.1M − $200M net debt = $1,823.1M equity ÷ 50M shares = $36.46 per share, against a $30.00 market price (a 17.7% discount).',
        },
        {
          id: 'u07-l05-c3',
          kind: 'basic',
          front: 'Why must you subtract net debt at the end of a DCF?',
          back: 'Unlevered FCF is earned before lenders are paid, so discounting it gives enterprise value. Shareholders own only the residual: equity value = EV − net debt. Skipping the bridge inflated Meridian from $36.46 to $40.46 per share.',
        },
        {
          id: 'u07-l05-c4',
          kind: 'basic',
          front: 'What is the mid-year convention and how much does it matter?',
          back: 'Discounting at n − 0.5 instead of n, reflecting that cash arrives through the year rather than on the last day. It raises value by roughly 4% at a 9% rate — more accurate, but worth far less than getting r and g approximately right.',
        },
      ],
    },

    // ── L06 ───────────────────────────────────────────────────────────────
    {
      id: 'u07-l06',
      unitId: 'u07',
      order: 6,
      title: 'Sensitivity & Scenarios',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A DCF produces one number with enormous confidence and no justification for it. The cure is to stop asking "what is it worth?" and start asking **"how much does the answer move when I am wrong?"**

Two complementary tools:

- **Sensitivity analysis** varies one or two assumptions across a range, holding everything else fixed, and tabulates the results. It answers: *which assumption actually drives this?*
- **Scenario analysis** varies a whole coherent set of assumptions together — a bear case where growth *and* margins *and* the discount rate all move in the direction they would move together in the real world. It answers: *what does this look like if I am wrong about the story, not just about one input?*

Both exist to replace a false point estimate with an honest range.`,
        },
        {
          kind: 'example',
          md: `**Meridian sensitivity — value per share across r and g.**

Same cash flows as Lesson 5 ($112.0M through $148.1M), same $200M net debt and 50M shares. Only r and g move.

| r ↓ / g → | 1.5% | 2.0% | 2.5% | 3.0% | 3.5% |
|---|---|---|---|---|---|
| **8.0%** | $37.87 | $40.66 | $43.95 | $47.91 | $52.75 |
| **8.5%** | $34.81 | $37.16 | $39.90 | $43.13 | $47.02 |
| **9.0%** | $32.16 | $34.16 | **$36.46** | $39.15 | $42.33 |
| **9.5%** | $29.84 | $31.56 | $33.52 | $35.78 | $38.43 |
| **10.0%** | $27.80 | $29.29 | $30.97 | $32.90 | $35.12 |

The base case sits in the centre. Read the extremes: the same business, the same cash flows, valued anywhere from **$27.80** to **$52.75** — a range where the top is **90% above** the bottom, produced entirely by moving two assumptions across ranges that any two reasonable analysts might disagree over.

**Isolate each lever from the $36.46 base:**

- **r: 9% → 10%** (one point) → $30.97, a **−15.1%** change
- **g: 2.5% → 3.5%** (one point) → $42.33, a **+16.1%** change
- **g: 2.5% → 1.5%** (one point) → $32.16, a **−11.8%** change

One percentage point — the width of a shrug — moves the answer 12% to 16%. Against that, arguing about whether year-3 growth is 8% or 9% is rounding error.

**Where the market sits.** At **$30.00**, Meridian is priced roughly where the model lands at r = 10% and g = 2.5%, or at r = 9.5% with g around 1.8%. The market is not making a wild claim. It is applying a modestly higher required return, or a modestly lower terminal growth rate, than you are.`,
        },
        {
          kind: 'example',
          md: `**Scenario analysis — three coherent futures.**

Instead of moving one dial, move the whole story. Each case keeps the 10% FCF margin but changes the growth path *and* the rate assumptions together, as they would actually co-move.

**Bear** — competition arrives, growth stalls, the market demands more for the risk. Growth 6/5/4/3/2%, r = 10%, g = 1.5%.
- FCFs: $106.0M, $111.3M, $115.8M, $119.2M, $121.6M → **$22.68 per share**

**Base** — Lesson 5, unchanged. Growth 12/10/8/6/5%, r = 9%, g = 2.5%.
- **$36.46 per share**

**Bull** — the product wins its category, growth holds up, the market re-rates the risk down. Growth 18/16/14/12/10%, r = 8.5%, g = 3.0%.
- FCFs: $118.0M, $136.9M, $156.0M, $174.8M, $192.2M → **$55.91 per share**

**Weight them.** At 25% bear / 50% base / 25% bull:

- 0.25 × 22.68 + 0.50 × 36.46 + 0.25 × 55.91 = **$37.88 per share**

Two things to take from that. First, the probability-weighted value ($37.88) sits close to the base case ($36.46) — so the weighting did not change the answer much, but it *did* attach a distribution to it. Second, and more usefully: at **$30.00** the stock is above the bear case and well below the base case. You are not being paid for the bear case, but you are getting the bull case for free.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "A more detailed model is a more accurate model."**

A 200-row model with segment-level revenue build-ups and quarterly working capital detail is *not* more accurate than a ten-row model if both rest on the same guess about r and g — and the sensitivity table shows those two assumptions swinging the answer by 90%. Detail creates the *feeling* of rigour while the real uncertainty sits untouched in two cells. Spend the effort on the assumptions the sensitivity table says matter.`,
        },
        {
          kind: 'callout',
          md: `**Run the sensitivity table before you form a view, not after.** Building it afterwards invites you to select the corner that supports the conclusion you already reached — and every table has a corner that supports every conclusion. Decide in advance which cell reflects your honest assumptions, then read the surrounding cells as the range you are genuinely uncertain across.`,
        },
        {
          kind: 'keypoint',
          md: `Sensitivity analysis moves one or two assumptions across a range; scenario analysis moves a coherent set together. Meridian spans $27.80 to $52.75 across r of 8–10% and g of 1.5–3.5% — a 90% spread from two assumptions. One point on r costs 15.1%; one point on g adds 16.1%. Bear/base/bull of $22.68 / $36.46 / $55.91 weights to $37.88. Detail is not accuracy: a bigger model resting on the same r and g is no more reliable.`,
        },
      ],
      quiz: [
        {
          id: 'u07-l06-q1',
          prompt:
            'Meridian is worth $36.46 at r = 9%, g = 2.5%. Raising r to 10% gives $30.97. What does that show?',
          choices: [
            'A one-point rise in the discount rate cuts the value 15.1%',
            'The model is broken, since value should not change',
            'The cash flows must have been reduced as well',
            'A one-point rise in r has a negligible effect on long-lived assets',
          ],
          answerIdx: 0,
          explain:
            '30.97 / 36.46 − 1 = −15.1% from a single percentage point, because the rate compounds against every year and shrinks the r − g spread that drives terminal value. That leverage is why the discount rate deserves more argument than any individual forecast year.',
        },
        {
          id: 'u07-l06-q2',
          prompt:
            'Across r of 8–10% and g of 1.5–3.5%, Meridian\'s value ranges from $27.80 to $52.75. What is the correct conclusion?',
          choices: [
            'The DCF method is invalid and should be discarded',
            'Only the centre cell is meaningful; the others are hypothetical',
            'The output is a range driven by two assumptions, so it should be reported as a range with those assumptions stated',
            'The wide range proves the stock is undervalued at $30.00',
          ],
          answerIdx: 2,
          explain:
            'A top nearly 90% above the bottom, generated by moving two contestable inputs across ordinary ranges, is exactly why a single point estimate misrepresents what the model knows. The range does not invalidate the DCF — it is the DCF being honest about the precision it actually has.',
        },
        {
          id: 'u07-l06-q3',
          prompt: 'What distinguishes scenario analysis from sensitivity analysis?',
          choices: [
            'Scenario analysis uses historical data; sensitivity analysis uses forecasts',
            'They are different names for the same procedure',
            'Scenario analysis applies only to private companies',
            'Scenario analysis moves a coherent set of assumptions together; sensitivity analysis varies one or two in isolation',
          ],
          answerIdx: 3,
          explain:
            'In a real bear case growth, margins and the required return all deteriorate together, which is a different question from "what if only g is wrong?" Sensitivity identifies which lever dominates; scenarios test whether the whole story could be wrong.',
        },
        {
          id: 'u07-l06-q4',
          prompt:
            'Meridian\'s bear/base/bull values are $22.68 / $36.46 / $55.91. At 25/50/25 weights the expected value is $37.88. What does the $30.00 price imply?',
          choices: [
            'The market is pricing the bull case, since $30 exceeds the bear value',
            'The stock is fairly valued, since $30 lies inside the range',
            'The market expects the company to fail',
            'The price sits above the bear case and well below the base — you are not paid for the downside, but the upside is not priced in',
          ],
          answerIdx: 3,
          explain:
            'At $30.00 the buyer is above the $22.68 bear outcome and 18% below the $36.46 base, so a genuine downside scenario still loses money while the $55.91 bull case costs nothing. Placing the price inside the distribution, rather than beside a single number, is what makes scenario work actionable.',
        },
      ],
      cardSeeds: [
        {
          id: 'u07-l06-c1',
          kind: 'basic',
          front: 'What is the difference between sensitivity and scenario analysis?',
          back: 'Sensitivity varies one or two assumptions across a range with everything else fixed, identifying which lever dominates. Scenario analysis moves a coherent set together — growth, margins and the discount rate as they would co-move — testing whether the whole story could be wrong.',
        },
        {
          id: 'u07-l06-c2',
          kind: 'cloze',
          front:
            'From Meridian\'s $36.46 base, r rising 9% → 10% gives ____ (a ____ change), and g rising 2.5% → 3.5% gives ____ (a ____ change).',
          back: '$30.97 (−15.1%); $42.33 (+16.1%) — one percentage point on either lever moves the answer 12–16%',
        },
        {
          id: 'u07-l06-c3',
          kind: 'basic',
          front: 'Why is a more detailed DCF not necessarily a more accurate one?',
          back: 'A 200-row model and a 10-row model resting on the same guesses for r and g share the same uncertainty — and the sensitivity table shows those two inputs swinging the answer 90%. Detail creates the feeling of rigour while the real uncertainty sits untouched in two cells.',
        },
      ],
    },

    // ── L07 ───────────────────────────────────────────────────────────────
    {
      id: 'u07-l07',
      unitId: 'u07',
      order: 7,
      title: 'Margin of Safety',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `Lesson 6 established that your estimate of value is a range, not a number, and that reasonable assumptions can produce a 90% spread. So how do you act on an estimate you know is imprecise?

Benjamin Graham's answer, and the most durable idea in investing:

> **Margin of safety = buy only at a meaningful discount to your estimate of value.**

> **Margin of safety % = (estimated value − price) ÷ estimated value**

Graham's analogy was an engineering one. A bridge rated for 30 tons is built to carry 100, not because engineers expect 100-ton trucks, but because materials vary, loads are estimated, and inspections miss things. The margin absorbs the error you cannot see.

It does three jobs at once:

1. **It absorbs estimation error.** If you are worth-wrong by 25% and you bought at a 40% discount, you still made money.
2. **It creates return from convergence.** Buying at 70% of value and having price meet value is a 42.9% gain (1 / 0.70 − 1) before the business grows at all.
3. **It reduces the cost of bad luck.** Recessions, lost contracts and management errors hurt less when they were partly pre-paid for in the entry price.`,
        },
        {
          kind: 'text',
          md: `**The margin should scale with your uncertainty**, not sit at a fixed 30% for everything. The rule: *the less confident you are, the wider the discount you require.*

| Situation | Suggested margin of safety |
|---|---|
| Stable, predictable business you understand well (utility, consumer staple) | 15–25% |
| Ordinary quality company, ordinary predictability | 25–35% |
| Cyclical, leveraged, or fast-changing industry | 40–50% |
| Turnaround, or a business you understand only partly | 50%+, or simply pass |

Two consequences follow, and both are uncomfortable:

- **Most stocks will not qualify most of the time.** That is the system working. The output of a valuation process is usually "no."
- **A wide required margin on a business you barely understand is not a solution.** If you need a 60% discount to feel safe, the honest read is that the business is outside your competence, and no price fully compensates for not knowing what you own.`,
        },
        {
          kind: 'example',
          md: `**Applying it to Meridian.**

Your DCF says **$36.46**. Meridian is a software business with recurring revenue and a modest net debt position — decent predictability, so a **30%** margin of safety is reasonable.

- Buy-below price = 36.46 × (1 − 0.30) = **$25.52**

At different requirements:

| Margin of safety | Buy below |
|---|---|
| 20% | $29.17 |
| 30% | $25.52 |
| 40% | $21.88 |
| 50% | $18.23 |

**The current price is $30.00.** The discount is (36.46 − 30.00) / 36.46 = **17.7%** — real, but short of the 30% you decided to require. The disciplined action is to **do nothing**, put Meridian on a watchlist, and revisit if the price falls toward $25.52 or if your estimate of value rises.

**Now test the discipline against the scenarios from Lesson 6.** The bear case put Meridian at **$22.68**. At today's $30.00 a bear outcome loses 24%. At the $25.52 buy-below price it loses 11%. At $21.88 (a 40% margin) the bear case is roughly break-even. That is what the margin is actually buying: not certainty, but survivable outcomes when you are wrong.`,
        },
        {
          kind: 'callout',
          md: `**A margin of safety is not a stop-loss.** It is a *purchase* discipline, applied once, at entry. If the price falls further after you buy, the margin of safety has widened, not been violated — assuming your estimate of value still holds. The question to re-ask is always "has value changed?", never "has price fallen?" Those are different questions, and confusing them converts a discount into a panic.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "A big enough discount makes any stock safe."**

It does not. A 60% discount to a value estimate built on a business you cannot predict is a 60% discount to a number you made up. The margin of safety protects against *estimation error* within your circle of competence; it protects against nothing at all outside it. Graham paired the concept with a hard prerequisite: only invest in what you can analyse. The discount is the second filter, never the first.`,
        },
        {
          kind: 'keypoint',
          md: `Margin of safety % = (estimated value − price) ÷ estimated value: buy only at a meaningful discount, because your estimate is a range. It absorbs estimation error, creates return from convergence (buying at 70% of value returns 42.9% on convergence alone), and cushions bad luck. Scale it to uncertainty — 15–25% for predictable businesses, 40–50% for cyclicals. Meridian at $30.00 offers 17.7% against a 30% requirement of $25.52, so the disciplined answer is no.`,
        },
      ],
      quiz: [
        {
          id: 'u07-l07-q1',
          prompt:
            'Your DCF values Meridian at $36.46 and you require a 30% margin of safety. What is your buy-below price?',
          choices: [
            '$25.52',
            '$28.05',
            '$30.00',
            '$10.94',
          ],
          answerIdx: 0,
          explain:
            '36.46 × 0.70 = $25.52, the price at which a 30% cushion exists. The $10.94 answer is 30% of the value rather than a 30% discount from it — a slip that would set an absurdly low threshold and guarantee you never buy anything.',
        },
        {
          id: 'u07-l07-q2',
          prompt: 'Buying at 70% of estimated value produces what return if price simply converges to value?',
          choices: [
            '30.0%',
            '70.0%',
            '17.7%',
            '42.9%',
          ],
          answerIdx: 3,
          explain:
            '1 / 0.70 − 1 = 42.9%, because the gain is measured against the discounted price paid, not against the value. The 30% answer confuses the size of the discount with the return that closing it produces — the asymmetry that makes buying at a discount so powerful.',
        },
        {
          id: 'u07-l07-q3',
          prompt: 'How should the required margin of safety vary across situations?',
          choices: [
            'A fixed 30% for every investment, for consistency',
            'Wider for stable businesses, since they have less upside',
            'It should scale with uncertainty — 15–25% for predictable businesses, 40–50% for cyclical or leveraged ones',
            'Narrower for businesses you understand poorly, since the discount already compensates',
          ],
          answerIdx: 2,
          explain:
            'The margin exists to absorb estimation error, so it must grow with the size of the error you might plausibly be making. Widening it for a business you barely understand does not fix the problem — no price fully compensates for not knowing what you own.',
        },
        {
          id: 'u07-l07-q4',
          prompt:
            'Meridian trades at $30.00 against a $36.46 estimate — a 17.7% discount — while you require 30%. What is the disciplined action?',
          choices: [
            'Buy a half position, since some discount exists',
            'Do nothing, watchlist it, and revisit at $25.52 or if your value estimate rises',
            'Lower the required margin to 15% so the purchase qualifies',
            'Buy, because a 17.7% discount exceeds the market\'s average return',
          ],
          answerIdx: 1,
          explain:
            'Adjusting the requirement to fit the opportunity dissolves the discipline entirely, and the bear scenario at $22.68 shows what the missing cushion costs: a 24% loss at $30.00 versus 11% at $25.52. Most candidates failing the test most of the time is the system working, not a defect.',
        },
      ],
      cardSeeds: [
        {
          id: 'u07-l07-c1',
          kind: 'cloze',
          front: 'Margin of safety % = (____ − ____) ÷ ____.',
          back: '(estimated value − price) ÷ estimated value',
        },
        {
          id: 'u07-l07-c2',
          kind: 'basic',
          front: 'What three jobs does a margin of safety do?',
          back: 'Absorbs estimation error (wrong by 25% but bought 40% below still works), creates return from convergence (buying at 70% of value returns 42.9% when price meets value), and cushions bad luck by pre-paying for it in the entry price.',
        },
        {
          id: 'u07-l07-c3',
          kind: 'basic',
          front: 'How wide should the margin of safety be?',
          back: 'It scales with uncertainty: 15–25% for stable predictable businesses, 25–35% for ordinary ones, 40–50% for cyclical or leveraged ones, and 50%+ or simply pass for turnarounds. Needing a 60% discount usually means the business is outside your competence.',
        },
      ],
    },

    // ── L08 ───────────────────────────────────────────────────────────────
    {
      id: 'u07-l08',
      unitId: 'u07',
      order: 8,
      title: 'Reverse DCF',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A forward DCF asks: *given my assumptions, what is this worth?* It requires you to forecast — the thing humans are worst at — and it hands you an answer whose precision you cannot justify.

A **reverse DCF** flips the question:

> **Given today's price, what must the future look like for this price to be correct?**

You take the market price as the answer and solve backwards for the assumption that produces it — usually the growth rate. Then you do the one thing you are genuinely good at: **judging whether a specific claim is plausible.**

This is often more useful than a forward DCF, for three reasons:

1. **It replaces forecasting with judging.** "Will this company grow 4.3% a year?" is a far easier question than "what will this company grow at?"
2. **It makes the market's view explicit and testable.** Instead of arguing with a price, you argue with a claim.
3. **It cannot be gamed as easily.** There is nowhere to hide an optimistic assumption, because the price fixes the answer and only one input is free to move.

**The mechanics:** hold every assumption fixed except one, then solve for the value of that one which makes the model output equal the current price. In a spreadsheet this is Goal Seek; by hand it is trial and error over three or four iterations.`,
        },
        {
          kind: 'example',
          md: `**Reverse DCF on Meridian.**

Meridian trades at **$30.00** with 50M shares and $200M of net debt:

- Market capitalisation = 30.00 × 50 = **$1,500M**
- Implied enterprise value = 1,500 + 200 = **$1,700M**

So the market says the whole business is worth $1,700M. Hold everything else from Lesson 5 — base FCF $100M, r = 9%, terminal g = 2.5%, five explicit years — and solve for the **constant five-year FCF growth rate** that produces exactly $1,700M.

**The answer: 4.25% a year.**

That is the market's claim, stated plainly: *Meridian's free cash flow will grow about 4.25% a year for five years, then 2.5% forever.*

Now judge it. Meridian grew FCF 18%, 15% and 13% over the last three years. For 4.25% to be right, growth must fall by roughly two thirds essentially immediately and stay there. That is not impossible — competition, saturation, a large customer loss — but it is a **specific, aggressive claim about deceleration**, and you can go and check it against the last two quarters of bookings, retention rates, and pricing.

Compare that with your own model's assumption: **8.2% compound FCF growth** over five years. The entire disagreement between you and the market is 8.2% versus 4.25%. That is a debatable, checkable question — vastly more useful than "the market thinks it is worth $30 and I think it is worth $36.46."

**The same question from the other end.** Instead of solving for growth, hold your growth path and solve for the discount rate that makes the model output $30.00: **10.21%**. Read that as an expected return — if your forecasts are right, buying at $30.00 earns you about 10.2% a year. Now the decision is simple: is 10.2% enough for this level of risk?`,
        },
        {
          kind: 'example',
          md: `**Where a reverse DCF earns its keep — Aurora Dynamics.**

Aurora is a fast-growing platform business. **Price $90.00**, **300M shares** → market cap **$27,000M**. It holds **$1,000M of net cash**, so **EV = $26,000M**. Current free cash flow is **$200M**.

The headline: **EV/FCF = 130x**. Bulls say that is meaningless for a company growing this fast. Fine — make the claim explicit.

Solve for the constant FCF growth rate over **ten** explicit years, then 2.5% forever, at a 9% discount rate, that justifies $26,000M.

**The answer: about 30.9% a year, for ten straight years.**

At that rate, free cash flow in year 10 is 200 × 1.309¹⁰ = **$2,961M** — nearly **15 times** today's level. That is the claim embedded in the price.

Now it is a judgement, not a mystery. Is it plausible? Sometimes, genuinely, yes — a handful of companies have done it. But you now know precisely what you are betting on, you know the bet is on a decade of near-31% compounding, and you can check the base rate: **very few companies in history have compounded free cash flow at 30% for ten consecutive years.** A 130x multiple told you nothing. "15x more cash in a decade" tells you everything.`,
        },
        {
          kind: 'callout',
          md: `**Reverse the assumption that is actually contested.** Growth is the usual choice, but not always the right one. For a mature business the interesting solve is often the **terminal growth rate**; for a turnaround it is the **margin** the company must recover to; for a leveraged company it is the **discount rate**, read as an expected return. Pick whichever input the argument is really about and let the price pin down everything else.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "The implied growth rate is what the market predicts."**

It is what the market's price is *consistent with*, under **your** other assumptions. Change r from 9% to 10% and the implied growth rate rises, because a higher discount rate needs more growth to justify the same price. A reverse DCF is a conditional statement, not a mind-reading device — which is exactly why you should state the conditions alongside the answer: "at a 9% discount rate and 2.5% terminal growth, this price implies 4.25% growth."`,
        },
        {
          kind: 'keypoint',
          md: `A reverse DCF takes today's price as given and solves for the assumption that justifies it, replacing forecasting with judging a specific claim. Meridian at $30.00 implies EV of $1,700M and 4.25% five-year FCF growth — against three recent years of 18/15/13% and your own 8.2% estimate. Solved for r instead, $30.00 implies a 10.21% expected return. Aurora at 130x EV/FCF implies 30.9% growth for ten years, or 15x the free cash flow — a claim you can check against base rates.`,
        },
      ],
      quiz: [
        {
          id: 'u07-l08-q1',
          prompt: 'What does a reverse DCF solve for?',
          choices: [
            'The intrinsic value implied by a set of forecasts',
            'The assumption — usually growth — that makes the model output equal today\'s market price',
            'The historical growth rate over the past five years',
            'The multiple at which peers currently trade',
          ],
          answerIdx: 1,
          explain:
            'It fixes the output at the observed price and lets one input float, converting the market\'s price into an explicit, checkable claim. That swaps the hard task of forecasting for the much easier one of judging whether a stated claim is plausible.',
        },
        {
          id: 'u07-l08-q2',
          prompt:
            'Meridian trades at $30.00 with 50M shares and $200M of net debt. What enterprise value must the reverse DCF solve to?',
          choices: [
            '$1,500M',
            '$1,300M',
            '$1,700M',
            '$1,823M',
          ],
          answerIdx: 2,
          explain:
            'Market cap is 30.00 × 50 = $1,500M, and EV = 1,500 + 200 = $1,700M. Solving to the $1,500M market cap instead would compare an equity value against a model that discounts unlevered cash flows — the same net-debt bridge error, run backwards.',
        },
        {
          id: 'u07-l08-q3',
          prompt:
            'Meridian\'s $30.00 price implies 4.25% five-year FCF growth, while it grew 18%, 15% and 13% in the last three years. How should you use that?',
          choices: [
            'Conclude the market is wrong, since 4.25% is far below recent growth',
            'Conclude the stock is fairly valued, since the market is efficient',
            'Ignore it — historical growth rates never inform future ones',
            'Treat it as a specific claim about sharp deceleration and go check bookings, retention and pricing',
          ],
          answerIdx: 3,
          explain:
            'The value of the exercise is that it converts a price into a testable proposition about the business, which evidence can then support or contradict. Concluding the market is wrong purely because the implied number is low skips the verification step that the reverse DCF exists to make possible.',
        },
        {
          id: 'u07-l08-q4',
          prompt:
            'Aurora trades at 130x EV/FCF, implying 30.9% FCF growth for ten years — about 15x today\'s cash flow. What has the reverse DCF accomplished?',
          choices: [
            'It converted an uninterpretable multiple into a specific claim that can be checked against historical base rates',
            'It proved the stock is overvalued',
            'It calculated the company\'s cost of capital',
            'It showed that high-multiple stocks cannot be valued',
          ],
          answerIdx: 0,
          explain:
            '"130x" carries no usable information, whereas "free cash flow must be roughly 15 times larger in a decade" can be weighed against how often companies have actually done that. The exercise does not decide the question — it makes the question answerable.',
        },
        {
          id: 'u07-l08-q5',
          prompt:
            'Why is an implied growth rate not the same as "what the market predicts"?',
          choices: [
            'Because market participants do not use DCF models',
            'Because implied growth rates are always lower than consensus estimates',
            'Because it is conditional on your other assumptions — raise r from 9% to 10% and the implied growth rate rises too',
            'Because growth rates cannot be inferred from prices',
          ],
          answerIdx: 2,
          explain:
            'The solve holds every other input at your chosen values, so the answer moves whenever those change — a higher required return needs more growth to justify the same price. This is why the output should always be quoted with its conditions attached.',
        },
      ],
      cardSeeds: [
        {
          id: 'u07-l08-c1',
          kind: 'basic',
          front: 'What is a reverse DCF and why is it often more useful than a forward one?',
          back: 'It takes today\'s price as given and solves for the assumption (usually growth) that justifies it. It replaces forecasting — which humans do badly — with judging whether a specific claim is plausible, makes the market\'s view explicit and testable, and leaves nowhere to hide an optimistic assumption.',
        },
        {
          id: 'u07-l08-c2',
          kind: 'basic',
          front: 'Meridian at $30.00 — what does the reverse DCF say?',
          back: 'Market cap $1,500M + $200M net debt = $1,700M EV. Holding r = 9% and g = 2.5%, that implies 4.25% five-year FCF growth, against 18/15/13% recently and your own 8.2% estimate. Solved for r instead, $30.00 implies a 10.21% expected return.',
        },
        {
          id: 'u07-l08-c3',
          kind: 'cloze',
          front:
            'Aurora at 130x EV/FCF implies about ____% FCF growth for ten years — roughly ____ times today\'s free cash flow by year 10.',
          back: '30.9%; 15 times',
        },
        {
          id: 'u07-l08-c4',
          kind: 'basic',
          front: 'Is an implied growth rate what the market predicts?',
          back: 'No — it is what the price is consistent with under *your* other assumptions. Raising r from 9% to 10% raises the implied growth rate, because a higher required return needs more growth to justify the same price. Always quote the conditions with the answer.',
        },
      ],
    },

    // ── L09 ───────────────────────────────────────────────────────────────
    {
      id: 'u07-l09',
      unitId: 'u07',
      order: 9,
      title: 'Owner Earnings & Quality Adjustments',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A DCF is only as good as the cash flow you feed it, and **reported free cash flow is not always the cash an owner can take out.** Warren Buffett's 1986 shareholder letter proposed a cleaner measure:

> **Owner earnings = reported earnings + depreciation and amortisation + other non-cash charges − the average annual capital expenditure required to maintain competitive position and unit volume**

The critical phrase is "required to **maintain**." Not total capex — **maintenance** capex. Spending that grows the business is discretionary and produces new earning power; spending that merely keeps the current business running is a genuine cost of the existing cash flow.

Buffett's own gloss is the useful part: owner earnings are approximate, and "*it is better to be approximately right than precisely wrong.*" The point is not a new formula. It is refusing to accept a reported number that flatters the business.

Three adjustments do most of the work.`,
        },
        {
          kind: 'text',
          md: `**1. Stock-based compensation is a real cost.** SBC is added back as a non-cash charge in the cash flow statement, so it lands inside reported operating cash flow and therefore inside reported FCF. But it is not free — it is paid in ownership, and the bill arrives as **dilution** (Unit 2, Lesson 4). Two honest treatments, and you must pick one:

- **Subtract SBC** from free cash flow, treating it as the cash-equivalent cost of the labour it bought; or
- **Leave it in** and grow the share count in the model to reflect the dilution.

Doing neither counts the labour as free. For a software company where SBC runs 20–40% of free cash flow, that is not a rounding error — it is the difference between a good investment and a bad one.

**2. Split capex into maintenance and growth.** Companies rarely disclose the split, so estimate it. Common approaches: use depreciation as a proxy for maintenance capex (crude but serviceable for a stable business); or regress historical capex against revenue growth and read the intercept as maintenance; or take management's segment commentary at its word and sanity-check it. If maintenance capex is close to total capex, the business is spending merely to stand still — and that is a finding, not a nuisance.

**3. Normalise working capital and one-offs.** A single year's FCF can be flattered by stretching payables or squeezing inventory, and depressed by a legal settlement or a one-time build. Use a three-year average of the working capital swing and strip genuine one-offs out of the base.

Other adjustments worth a look: **pension shortfalls**, **capitalised software development**, **acquisition spending that is really R&D**, and **leases** treated as operating rather than financing.`,
        },
        {
          kind: 'example',
          md: `**Meridian's owner earnings — and what they do to the valuation.**

Reported figures for the base year:

- Cash from operations: **$140M**
- Capital expenditure: **$40M**
- **Reported free cash flow = 140 − 40 = $100M** — the number used in Lessons 3 through 8

Now dig in:

- **Stock-based compensation: $30M**, added back inside that $140M of operating cash flow. Meridian's share count has grown about 2% a year, which is the same cost arriving by another route.
- **Capex split:** of the $40M, roughly **$28M** is maintenance (replacing servers, refreshing the existing platform) and **$12M** is growth (new data-centre capacity for expansion).

**Owner earnings = 140 − 30 (SBC) − 28 (maintenance capex) = $82M**

That is **18% below** the reported $100M. Note that we subtracted only maintenance capex — growth capex is excluded because it buys future earnings rather than sustaining current ones — and that this partially offsets the SBC deduction rather than compounding it.

**Re-run the Lesson 5 DCF with an $82M base**, keeping every other assumption identical (12/10/8/6/5% growth, 10% margin, r = 9%, g = 2.5%, $200M net debt, 50M shares):

- Enterprise value = 2,023.1 × 0.82 = **$1,659.0M** (enterprise value scales linearly with the base cash flow)
- Equity value = 1,659.0 − 200.0 = **$1,459.0M**
- **Value per share = 1,459.0 / 50 = $29.18**

**From $36.46 to $29.18 — a 20% cut, from two adjustments and no change to a single growth assumption.**

And note the asymmetry: equity value fell **20%** while enterprise value fell only **18%**, because the $200M of net debt is fixed and does not shrink with the cash flow. Leverage magnifies every adjustment you make to the numerator.

**The punchline.** At the market price of **$30.00**, Meridian was a 17.7% discount to the reported-FCF valuation and is a **2.8% premium** to the owner-earnings valuation. The adjustment did not refine the answer — it reversed it.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Stock-based compensation is non-cash, so ignore it."**

It is non-cash to the *company* and extremely costly to the *owner*. Employees are paid in a slice of your business; the cash never leaves, but your ownership percentage shrinks. Buybacks that merely offset SBC are not returning capital to shareholders — they are converting your cash into employee compensation while the share count stays flat. Check the **diluted** share count over five years: if it is rising while the company reports large buybacks, the buybacks are paying the payroll.`,
        },
        {
          kind: 'callout',
          md: `**Be consistent between your model and your comparison.** If you deduct SBC from Meridian's cash flow, you must deduct it from every peer you compare it against — otherwise you have penalised one company for an honest adjustment. The same applies to maintenance capex splits and lease treatment. An adjustment applied to one name and not the rest is worse than no adjustment at all, because it produces a difference that looks like a finding.`,
        },
        {
          kind: 'keypoint',
          md: `Owner earnings = reported earnings + D&A + other non-cash charges − maintenance capex: the cash an owner can actually withdraw. Subtract SBC (or model the dilution — never neither), split capex into maintenance and growth, and normalise working capital and one-offs. Meridian: CFO $140M − SBC $30M − maintenance capex $28M = $82M, versus $100M reported. Re-running the DCF gives $29.18 rather than $36.46 — a 20% cut that turns a 17.7% discount into a 2.8% premium.`,
        },
      ],
      quiz: [
        {
          id: 'u07-l09-q1',
          prompt:
            'Meridian has CFO of $140M, capex of $40M ($28M maintenance, $12M growth), and $30M of SBC. What are its owner earnings?',
          choices: [
            '$82M',
            '$70M',
            '$100M',
            '$112M',
          ],
          answerIdx: 0,
          explain:
            '140 − 30 (SBC, a real cost paid in ownership) − 28 (maintenance capex only) = $82M. The $70M answer deducts total capex rather than the maintenance portion, penalising the company for growth spending that buys future earnings rather than sustaining current ones.',
        },
        {
          id: 'u07-l09-q2',
          prompt: 'Why should stock-based compensation be deducted from free cash flow?',
          choices: [
            'Because it is a cash outflow that the cash flow statement omits',
            'Because it is always a one-time charge',
            'Because accounting standards require its deduction from FCF',
            'Because it is a real cost paid in ownership, arriving as dilution rather than as cash',
          ],
          answerIdx: 3,
          explain:
            'SBC is added back as non-cash, so it sits inside reported FCF, but employees were genuinely paid — in a slice of the business, which shows up as a rising share count. You must either deduct it or grow the share count in the model; doing neither treats the labour as free.',
        },
        {
          id: 'u07-l09-q3',
          prompt: 'Why does owner earnings subtract only maintenance capex rather than total capex?',
          choices: [
            'Because growth capex is not a genuine cash outflow',
            'Because maintenance capex is always the larger of the two',
            'Because growth capex is discretionary and buys new earning power, while maintenance capex is the cost of sustaining today\'s cash flow',
            'Because tax rules treat the two differently',
          ],
          answerIdx: 2,
          explain:
            'The measure asks what an owner could withdraw while leaving the current business intact, and expansion spending can be stopped without impairing existing operations. If maintenance capex turns out to be close to total capex, that is itself a finding — the company is spending merely to stand still.',
        },
        {
          id: 'u07-l09-q4',
          prompt:
            'Meridian\'s enterprise value falls 18% on owner earnings, but equity value per share falls 20% (from $36.46 to $29.18). Why the difference?',
          choices: [
            'The share count rises alongside the adjustment',
            'The discount rate must be increased when using owner earnings',
            'Terminal value does not scale with the base cash flow',
            'The $200M of net debt is fixed, so a proportional fall in EV is a larger proportional fall in the equity residual',
          ],
          answerIdx: 3,
          explain:
            'Enterprise value scales linearly with the base cash flow (2,023.1 × 0.82 = $1,659.0M), but the same $200M is subtracted regardless, so the residual left to shareholders shrinks faster. Leverage magnifies every adjustment made to the numerator — in both directions.',
        },
        {
          id: 'u07-l09-q5',
          prompt:
            'A company reports large buybacks while its diluted share count stays flat. What does that tell you?',
          choices: [
            'The buybacks are being used to offset stock-based compensation, so cash is funding payroll rather than returning capital',
            'The company is retiring debt rather than equity',
            'The buybacks are being executed at prices above intrinsic value',
            'Nothing — a flat share count is the expected result of buybacks',
          ],
          answerIdx: 0,
          explain:
            'Genuine capital return shrinks the share count, so a flat count means repurchases are absorbing newly issued employee shares one for one. Checking the diluted count over five years is the fastest way to see whether SBC is quietly consuming the cash a company claims to be returning.',
        },
      ],
      cardSeeds: [
        {
          id: 'u07-l09-c1',
          kind: 'cloze',
          front:
            'Owner earnings = reported earnings + ____ + other non-cash charges − ____ capex.',
          back: 'depreciation and amortisation; maintenance (not total) capex',
        },
        {
          id: 'u07-l09-c2',
          kind: 'basic',
          front: 'What are the two acceptable treatments of stock-based compensation, and the one unacceptable one?',
          back: 'Either subtract SBC from free cash flow as a cash-equivalent labour cost, or leave it in and grow the share count for the dilution. Doing neither counts the labour as free — and for software companies SBC often runs 20–40% of FCF.',
        },
        {
          id: 'u07-l09-c3',
          kind: 'basic',
          front: 'Meridian\'s owner-earnings adjustment — the numbers and the effect.',
          back: 'CFO $140M − SBC $30M − maintenance capex $28M = $82M owner earnings versus $100M reported FCF. Re-running the DCF: EV $1,659.0M, equity $1,459.0M, $29.18 per share instead of $36.46 — turning a 17.7% discount at $30.00 into a 2.8% premium.',
        },
        {
          id: 'u07-l09-c4',
          kind: 'basic',
          front: 'How do you estimate maintenance capex when a company does not disclose it?',
          back: 'Use depreciation as a proxy (crude but serviceable for a stable business), regress historical capex against revenue growth and read the intercept, or use management segment commentary and sanity-check it. Apply the same method to every peer you compare.',
        },
      ],
    },

    // ── L10 ───────────────────────────────────────────────────────────────
    {
      id: 'u07-l10',
      unitId: 'u07',
      order: 10,
      title: 'Valuation Synthesis',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `No single method is trustworthy on its own. Multiples borrow their answer from other prices and cannot tell you whether the sector is mispriced. A DCF is enormously sensitive to two assumptions nobody can pin down. A reverse DCF tells you what the market believes but never whether it is right.

**Triangulation** is the practice of running several methods and treating their **agreement or disagreement** as information in itself:

- **They converge** → higher confidence. Different roads reached the same place.
- **They diverge** → the highest-value signal in valuation. One method is wrong, and finding out which one is the actual work.

The standard toolkit for a profitable business:

1. **Multiples** — EV/EBITDA, P/E, EV/FCF against a genuine peer set (Unit 6, Lesson 7).
2. **DCF** — an explicit forecast with a stated discount rate and terminal growth.
3. **Reverse DCF** — what the current price requires.
4. **Owner-earnings adjustment** — applied to whichever cash flow the first three rest on.`,
        },
        {
          kind: 'example',
          md: `**Meridian Software — the full triangulation.**

Recall: **$30.00** price, 50M shares → market cap **$1,500M**, net debt **$200M**, **EV $1,700M**. Reported FCF **$100M**, owner earnings **$82M**, EBITDA **$160M**.

| Method | Assumption | Value per share |
|---|---|---|
| DCF on reported FCF | 12/10/8/6/5% growth, r = 9%, g = 2.5% | **$36.46** |
| Comps — EV/EBITDA | Peer median 12.0x on $160M EBITDA | **$34.40** |
| Comps — EV/FCF | Peer median 18.0x on $100M FCF | **$32.00** |
| DCF on owner earnings | Same assumptions, $82M base | **$29.18** |
| **Market price** | — | **$30.00** |

Check the comps rows: 12.0 × 160 = $1,920M EV, less $200M net debt = $1,720M, ÷ 50M = **$34.40**. And 18.0 × 100 = $1,800M EV, less $200M = $1,600M, ÷ 50M = **$32.00**.

**And the reverse DCF:** at $30.00 the market implies **4.25%** five-year FCF growth, against your model's **8.2%**.

**Reading the table.** The four methods span **$29.18 to $36.46** — a range of about 25%, which is a genuinely *tight* cluster by valuation standards. The market price of $30.00 sits at the bottom of that range, essentially on top of the owner-earnings DCF.

That is the finding. The entire disagreement between you and the market reduces to **one question**: is Meridian's stock-based compensation a real cost?

- If **yes** (you deduct SBC): fair value is around **$29**, the stock is fairly priced at $30.00, and there is nothing to do.
- If **no** (you treat SBC as non-cash): fair value is around **$32 to $36**, and the stock is 10–20% cheap.

Every other assumption — the growth fade, the peer multiples, the discount rate — turned out not to matter much, because the methods agreed on them. One adjustment carries the entire decision, and now you know exactly which fact to go and investigate.`,
        },
        {
          kind: 'text',
          md: `**When methods disagree, diagnose rather than average.** A large gap is a question, and each pattern has a small set of likely answers:

| Pattern | Likely explanation |
|---|---|
| DCF ≫ multiples | Your growth or margin assumptions exceed what peers achieve; or the whole sector is depressed |
| Multiples ≫ DCF | The sector is richly priced; or your discount rate is too high; or the peer set is not comparable |
| Reverse DCF implies growth far below history | The market expects a break in the trend — find out what it knows |
| Reverse DCF implies growth far above any precedent | The price embeds a bet on an exceptional outcome |
| Owner-earnings DCF ≪ reported-FCF DCF | Reported cash flow is flattered — usually SBC or under-stated maintenance capex |

Averaging four numbers produces a fifth number with no meaning and hides the disagreement that was the useful part. Weight the method best suited to the business — DCF for stable predictable cash flows, multiples for cyclicals where normalised earnings matter more than a forecast, asset value for financials and holding companies — and let the others act as checks.`,
        },
        {
          kind: 'example',
          md: `**The valuation memo.** One page, written before you act, and re-read before you sell. Meridian's:

> **1. The business (2 sentences).** Meridian sells subscription engineering software to industrial manufacturers; revenue is $1,000M growing in the low teens, with recurring revenue above 80%.
>
> **2. Why it might be worth owning.** High retention, a 10% FCF margin with room to expand, ROIC comfortably above its ~8% WACC, and modest leverage at $200M net debt against $160M of EBITDA (1.25x).
>
> **3. My estimate of value.** $29–$36 per share. DCF on reported FCF: $36.46. DCF on owner earnings: $29.18. Comps: $32.00–$34.40. Base assumptions: growth fading 12% → 5%, 10% FCF margin, r = 9%, g = 2.5%.
>
> **4. What the price implies.** At $30.00 the market implies 4.25% five-year FCF growth versus my 8.2%, or equivalently a 10.2% return on my forecasts.
>
> **5. The single question the case turns on.** Is $30M of annual SBC a real economic cost? If yes, the stock is fairly valued. If no, it is 10–20% cheap.
>
> **6. What would change my mind.** Net revenue retention falling below 105%; SBC growing faster than revenue; maintenance capex rising toward total capex; a competitor winning two or more flagship accounts.
>
> **7. Decision.** No action at $30.00 — a 17.7% discount to my upper estimate is below my 30% requirement, and my lower estimate says there is no discount at all. Revisit below $26, or if the SBC question resolves.

The memo's real function is **falsifiability**. Section 6 is the important one: it commits you in advance to what would prove you wrong, so that when the facts change you notice, rather than retrofitting the thesis. Section 7 makes "no" a legitimate, recorded output.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "The goal of valuation is to arrive at the right number."**

The goal is to **make your assumptions explicit enough to be wrong in public**. A valuation that produces $36.46 and cannot say which assumption carries the answer is worse than one producing "$29 to $36, and it all hinges on SBC" — because the second one tells you what to research, what to monitor, and what would change your mind. The number is a by-product. The argument is the deliverable.`,
        },
        {
          kind: 'callout',
          md: `**Valuation is necessary but not sufficient.** Unit 5 asked whether the business is any good; this unit asked what it is worth. Both can be answered correctly and you can still lose money — through position sizing, through selling at the wrong moment, through a portfolio that is really one bet wearing eight tickers. A valuation tells you what a stock is worth to *someone*. Whether it belongs in *your* portfolio, at what size, is a separate discipline.`,
        },
        {
          kind: 'keypoint',
          md: `Triangulate multiples, DCF, and reverse DCF, then treat disagreement as the finding rather than averaging it away. Meridian: $36.46 (FCF DCF), $34.40 (EV/EBITDA), $32.00 (EV/FCF), $29.18 (owner-earnings DCF) against a $30.00 price implying 4.25% growth versus your 8.2% — a tight range whose entire spread reduces to one question about SBC. Write a memo with your estimate, what the price implies, the question the case turns on, what would change your mind, and a decision — including "no."`,
        },
      ],
      quiz: [
        {
          id: 'u07-l10-q1',
          prompt:
            'Meridian has $160M of EBITDA, $200M of net debt and 50M shares. At a peer median of 12.0x EV/EBITDA, what is the implied value per share?',
          choices: [
            '$38.40',
            '$34.40',
            '$32.00',
            '$29.18',
          ],
          answerIdx: 1,
          explain:
            'EV = 12.0 × 160 = $1,920M; equity = 1,920 − 200 = $1,720M; 1,720 / 50 = $34.40. The $38.40 answer omits the net-debt bridge and divides enterprise value straight by the share count — the same error that inflates a DCF output.',
        },
        {
          id: 'u07-l10-q2',
          prompt: 'When two valuation methods disagree sharply, what is the correct response?',
          choices: [
            'Average them, since each carries equal information',
            'Use the lower one, since conservatism is always appropriate',
            'Diagnose the disagreement — the gap identifies which assumption is doing the work',
            'Discard both and rely on the market price',
          ],
          answerIdx: 2,
          explain:
            'Averaging produces a fifth number with no meaning and conceals the divergence that was the most informative output. A gap between methods localises the contested assumption — which is what turns a valuation into a research agenda.',
        },
        {
          id: 'u07-l10-q3',
          prompt:
            'Meridian\'s four methods span $29.18 to $36.46 against a $30.00 price. What is the actual finding?',
          choices: [
            'The stock is clearly undervalued, since three of four methods exceed the price',
            'The methods are too inconsistent to support any conclusion',
            'The average of $33.01 is the best estimate of fair value',
            'The whole decision reduces to one question: whether $30M of annual SBC is a real economic cost',
          ],
          answerIdx: 3,
          explain:
            'The methods agree closely on growth, peer multiples and the discount rate, so the entire spread traces back to the single adjustment that separates the $36.46 and $29.18 DCFs. Identifying the one fact that carries the decision is worth far more than a spuriously precise average.',
        },
        {
          id: 'u07-l10-q4',
          prompt:
            'A reverse DCF implies growth far below the company\'s long history. What does that suggest?',
          choices: [
            'The market expects a break in the trend, and you should find out what it knows',
            'The market is definitively wrong and the stock is a bargain',
            'The reverse DCF was computed incorrectly',
            'Historical growth is irrelevant to valuation',
          ],
          answerIdx: 0,
          explain:
            'A price implying sharp deceleration is a claim about the future that someone has reasons for, and those reasons — a contract loss, a technology shift, a pricing change — are checkable. Treating the divergence as automatic proof of mispricing skips the verification step the whole exercise exists to enable.',
        },
        {
          id: 'u07-l10-q5',
          prompt: 'What is the most important section of a valuation memo?',
          choices: [
            'The estimate of value, since it drives the decision',
            'What would change your mind, because it commits you in advance to falsifiable conditions',
            'The description of the business, since it establishes context',
            'The comparison against peer multiples, since it is the most objective section',
          ],
          answerIdx: 1,
          explain:
            'Pre-committing to the specific evidence that would break the thesis is what lets you notice when facts change, rather than quietly retrofitting the argument around a falling price. The number is a by-product of the memo; the falsifiable argument is the deliverable.',
        },
      ],
      cardSeeds: [
        {
          id: 'u07-l10-c1',
          kind: 'basic',
          front: 'What does triangulation mean in valuation, and how do you read agreement vs disagreement?',
          back: 'Run multiples, a DCF, and a reverse DCF and treat their relationship as information. Convergence raises confidence; divergence is the highest-value signal, because it localises the assumption doing the work. Diagnose the gap — never average it away.',
        },
        {
          id: 'u07-l10-c2',
          kind: 'basic',
          front: 'Meridian\'s four valuations and what they revealed.',
          back: '$36.46 (DCF on reported FCF), $34.40 (12.0x EV/EBITDA), $32.00 (18.0x EV/FCF), $29.18 (DCF on owner earnings), against a $30.00 price implying 4.25% growth versus the model\'s 8.2%. The whole 25% spread reduces to one question: is $30M of annual SBC a real cost?',
        },
        {
          id: 'u07-l10-c3',
          kind: 'cloze',
          front:
            'A valuation memo covers: the business, why it might be worth owning, my estimate of value, what the ____ implies, the single ____ the case turns on, what would ____, and a decision.',
          back: 'what the price implies; the single question the case turns on; what would change my mind',
        },
      ],
    },
  ],
}
