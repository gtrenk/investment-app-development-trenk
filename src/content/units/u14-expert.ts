import type { Unit } from '@core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Unit 14 — Expert Topics
// The final unit covers the machinery underneath the market and the games
// played on top of it. Several of these — shorting, options, special
// situations — are described so they can be *understood*, explicitly not so
// they can be attempted. The unit closes the curriculum: a full toolkit map
// from Unit 1 to Unit 14, an honest self-assessment, and what mastery is.
// ─────────────────────────────────────────────────────────────────────────────

export const u14: Unit = {
  id: 'u14',
  title: 'Expert Topics',
  order: 14,
  description:
    'The machinery under the market and the games played on it: microstructure, short selling, options and implied volatility as risk lenses, factor investing, macro cycles, moats, filings and conference calls, special situations, alternative assets in context, continuous learning, and a final synthesis of the whole curriculum.',
  unlockAfter: 'u13',
  lessons: [
    // ── L01 ───────────────────────────────────────────────────────────────
    {
      id: 'u14-l01',
      unitId: 'u14',
      order: 1,
      title: 'Market Microstructure',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Unit 2 told you that a market order buys at the ask and a limit order names your price. Underneath that sits the actual machinery, and knowing it changes which order type you should use and when.

**The order book** is the live list of every resting limit order on both sides, stacked by price:

| Bids (buyers) | | Asks (sellers) | |
|---|---|---|---|
| Price | Size | Price | Size |
| $49.98 | 100 | $50.02 | 200 |
| $49.97 | 400 | $50.04 | 500 |
| $49.95 | 900 | $50.06 | 1,200 |

- The **best bid** is $49.98, the **best ask** is $50.02, the **spread** is $0.04, and the **midpoint** is $50.00.
- The spread as a percentage — 0.04 / 50.00 = **0.08%** — is the number that matters, not the four cents.
- **Depth** is the size stacked behind the best prices. A book with 100 shares at the top and nothing behind it is a very different market from one with 100,000.

A **market order does not execute at one price.** It walks the book, consuming each level until it is filled.`,
        },
        {
          kind: 'example',
          md: `**What a market order actually costs.**

You send a market buy for **600 shares** into the book above.

- 200 shares fill at **$50.02** = $10,004
- 400 shares fill at **$50.04** = $20,016
- Total: **$30,020** for 600 shares → average price **$50.0333**

Against the $50.00 midpoint, you paid **$0.0333 per share**, or **$20.00** in total — **0.067%** of the trade. Half of that is the spread you always pay; the other half is **market impact**, the cost of being bigger than the top of the book.

**Now scale it.** The same 600-share order in a thinly traded $50 stock with a $0.30 spread and 100 shares at each level would walk five levels and cost several tenths of a percent. Do that 200 times a year (Unit 13, Lesson 2) and microstructure has quietly become your largest expense.

**The defence is a limit order.** Post a bid at $50.00 and you may not get filled — but you cannot pay $50.04 by accident. The trade-off is exactly the one from Unit 2, Lesson 1: a market order guarantees execution and not price; a limit order guarantees price and not execution. Microstructure tells you *how much* that guarantee costs, which is what makes the choice quantitative rather than stylistic.`,
        },
        {
          kind: 'text',
          md: `**Market makers** are firms that continuously quote both a bid and an ask, standing ready to buy from sellers and sell to buyers. They earn the spread and take on inventory risk — if they buy from you at $49.98 and the stock immediately drops to $49.00, that is their loss.

That inventory risk explains almost everything about how spreads behave:

| Spread widens when | Because |
|---|---|
| Volatility rises | The inventory can move against them faster |
| Volume falls | It takes longer to offload the inventory |
| An earnings release approaches | A gap could jump the price past any quote |
| The stock is small or illiquid | There may be no one to sell to at all |

This is why the widest spreads appear at exactly the moments you most want to trade — the first minutes after the open, the last minutes before the close, and immediately after news. Those are the moments when a market order is most expensive.

**Payment for order flow and price improvement.** Many retail brokers route orders to wholesalers rather than to an exchange, and are paid for doing so. The wholesaler frequently fills the order *inside* the quoted spread. On your 600 shares, a fill at $50.015 rather than the $50.02 ask is a saving of $0.005 x 600 = **$3.00**.

The honest reading of this arrangement is genuinely mixed. The price improvement is real and measurable. It is also, in effect, a rebate for order flow that is profitable to trade against — retail orders are attractive precisely because they are small and uninformed. You get a better price than the quote; the quote itself is not necessarily the best price that could have existed.`,
        },
        {
          kind: 'text',
          md: `**High-frequency trading — an honest reckoning.** HFT firms trade at microsecond speeds, mostly running two strategies: electronic market making (quoting both sides, earning the spread) and statistical arbitrage (keeping related instruments in line with each other).

What is fair to say:

- **Spreads collapsed as electronic market making took over.** Before decimalisation in 2001, the minimum tick was one sixteenth or one eighth of a dollar. An eighth on a $50 stock is a **0.25%** spread; a penny is **0.02%** — a **12.5x** reduction in the cost of a round trip for everyone, retail included.
- **You are not being front-run in the way the phrase suggests.** For a 600-share order in a liquid stock, HFT is mostly the reason your fill is as good as it is.
- **Some of it is genuinely extractive**, particularly latency arbitrage against slow institutional orders, and some market-making liquidity evaporates in precisely the stressed conditions where it is most needed.

The practical conclusion for someone holding a position for years: **HFT is close to irrelevant to your outcome.** Three basis points at the moment of entry does not move a five-year return. If you are trading often enough for it to matter, the frequency is the problem, not the machinery.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Commission-free trading means trading is free."**

The commission is one of four costs and usually the smallest. You still pay the **spread** (half of it on entry, half on exit), **market impact** if your order is larger than the top of the book, **the opportunity cost** of an unfilled limit order, and — usually the largest of all — **taxes on realised gains** (Unit 2, Lesson 8). A "free" round trip on a stock with a 0.08% spread costs 0.08% before impact, which is 8% of a year's return if you do it a hundred times.`,
        },
        {
          kind: 'callout',
          md: `**Three rules that fall directly out of microstructure.** First, **check the spread as a percentage before trading anything unfamiliar** — above roughly 0.5% you are in a market where entry and exit costs are a material part of the thesis. Second, **avoid market orders in the first and last ten minutes** and immediately after news, when spreads are widest. Third, **for anything illiquid, use limit orders and be patient** — being unfilled is a cost you can measure and survive, while a bad fill is permanent.`,
        },
        {
          kind: 'keypoint',
          md: `A market order walks the order book: 600 shares into a book with 200 at $50.02 and 400 at $50.04 costs $30,020, an average of $50.0333 — $20.00 or 0.067% above the $50.00 midpoint, half spread and half impact. Market makers quote both sides and earn the spread to compensate for inventory risk, which is why spreads widen with volatility, thin volume, and pending news. Electronic market making cut the minimum tick from an eighth (0.25% on a $50 stock) to a penny (0.02%), a 12.5x reduction. Commission-free is not free: spread, impact, opportunity cost and tax remain.`,
        },
      ],
      quiz: [
        {
          id: 'u14-l01-q1',
          prompt:
            'A market buy for 600 shares fills 200 at $50.02 and 400 at $50.04, against a $50.00 midpoint. What did it cost above the midpoint?',
          choices: [
            '$0.04 per share, the full spread',
            'Nothing, since the fills were at the quoted ask',
            '$24.00, or 0.08% of the trade',
            '$20.00, an average of $50.0333 — about 0.067% of the trade',
          ],
          answerIdx: 3,
          explain:
            'The fills total $30,020 for 600 shares, so the average is $50.0333 and the excess over the midpoint is $0.0333 x 600 = $20.00. Half of that is the spread you always pay and half is market impact from being larger than the top of the book — which is why order size relative to depth matters.',
        },
        {
          id: 'u14-l01-q2',
          prompt: 'Why do market makers widen their spreads before an earnings release?',
          choices: [
            'Exchange rules require wider quotes around scheduled announcements',
            'They hold inventory, and a price gap on the news could jump straight past any quote they are showing',
            'They stop trading entirely and the wider spread is a formality',
            'Retail order flow dries up, so the spread compensates for lower volume',
          ],
          answerIdx: 1,
          explain:
            'A market maker who buys from you at $49.98 owns the stock, and an overnight gap can move it well past that price before any hedge is possible. Inventory risk is the single explanation for why spreads widen with volatility, thin volume, illiquidity, and pending news alike.',
        },
        {
          id: 'u14-l01-q3',
          prompt: 'What is the honest assessment of high-frequency trading for a long-term investor?',
          choices: [
            'It systematically front-runs retail orders and materially reduces returns',
            'It is entirely beneficial and criticism of it is unfounded',
            'It is close to irrelevant to a multi-year holding — electronic market making cut spreads roughly twelvefold, though some latency arbitrage is genuinely extractive',
            'It only affects institutional orders and never touches retail fills',
          ],
          answerIdx: 2,
          explain:
            'The minimum tick fell from an eighth of a dollar (0.25% on a $50 stock) to a penny (0.02%), which lowered round-trip costs for everyone including retail, while latency arbitrage against slow institutional orders is a real and separate criticism. Either way, a few basis points at entry cannot move a five-year return — if it can, the trading frequency is the actual problem.',
        },
        {
          id: 'u14-l01-q4',
          prompt: 'Which practice follows most directly from understanding microstructure?',
          choices: [
            'Trade only at the market open, when volume is highest',
            'Check the spread as a percentage before trading anything unfamiliar, and use limit orders in illiquid names',
            'Always use market orders so that execution is guaranteed',
            'Prefer stocks with the narrowest absolute spread in cents',
          ],
          answerIdx: 1,
          explain:
            'A spread above roughly 0.5% makes entry and exit costs a material part of the thesis, and in a thin book a market order walks several levels before it fills. The absolute spread in cents is meaningless without the price — four cents on a $50 stock and four cents on a $4 stock are ten times apart — and the open is when spreads are widest, not narrowest.',
        },
      ],
      cardSeeds: [
        {
          id: 'u14-l01-c1',
          kind: 'cloze',
          front:
            'A market order ____ the order book, filling at successive price levels. Its cost above the midpoint is half ____ and half ____.',
          back: 'walks; spread; market impact',
        },
        {
          id: 'u14-l01-c2',
          kind: 'basic',
          front: 'Why do spreads widen, and when are they widest?',
          back: 'Market makers hold inventory and the spread compensates for the risk of it moving against them. Spreads widen with volatility, thin volume, small or illiquid names, and pending news — so they are widest in the first and last ten minutes of the session and immediately after an announcement, which is exactly when a market order costs most.',
        },
        {
          id: 'u14-l01-c3',
          kind: 'basic',
          front: 'Name the four costs of a "commission-free" round trip.',
          back: 'The spread (half on entry, half on exit), market impact if the order exceeds the depth at the top of the book, the opportunity cost of an unfilled limit order, and tax on realised gains — usually the largest of the four.',
        },
      ],
    },

    // ── L02 ───────────────────────────────────────────────────────────────
    {
      id: 'u14-l02',
      unitId: 'u14',
      order: 2,
      title: 'Short Selling',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**This lesson explains short selling so that you can understand what it does to a market and to a share price. It is not a recommendation to attempt it.** The asymmetry described below is structural, not a matter of skill, and short selling is a poor fit for almost every individual investor.

**The mechanics.** To sell short you:

1. **Borrow** shares from another investor, via your broker, paying a borrow fee for the loan.
2. **Sell** them immediately at the market price, receiving cash.
3. Later, **buy** the shares back — "covering" — and **return** them to the lender.

Your profit is the difference between the sale price and the repurchase price, minus the borrow fee, minus any dividends. Dividends matter: while you are short, the lender is entitled to any dividend paid, and **you** pay it out of your own pocket.

Three obligations exist that a long position never has: the borrow fee accrues daily, the lender may **recall** the shares at any time and force you to cover at whatever the price is that morning, and your broker will require **margin** that rises as the position moves against you.`,
        },
        {
          kind: 'example',
          md: `**The asymmetry, in numbers.** You short **100 shares at $40.00**, receiving **$4,000**.

| Outcome | Share price | Your P&L | Return on the $4,000 |
|---|---|---|---|
| The company goes bankrupt | $0.00 | **+$4,000** | **+100%** |
| It halves | $20.00 | +$2,000 | +50% |
| It doubles | $80.00 | −$4,000 | −100% |
| It triples | $120.00 | **−$8,000** | **−200%** |

**The best possible outcome is +100%. There is no worst outcome.**

Now compare the position dynamics with a long position, which is where the real danger lives:

- A **long** position that falls **shrinks**. A stock you bought at $40 that drops to $20 is now half the portfolio weight it was, so your worst idea automatically becomes your smallest position.
- A **short** position that rises **grows**. Short at $40, and at $120 the position is three times the size it was — so your worst idea automatically becomes your largest, and it does so exactly when you are least able to think clearly about it.

**This is why shorts get closed at the worst moment.** Not because short sellers lack conviction, but because the position mechanically demands more capital as it hurts more, and eventually the margin call arrives.`,
        },
        {
          kind: 'example',
          md: `**The cost of carry — you can be right and still lose.**

You are short $4,000 of a heavily shorted, hard-to-borrow stock for **six months**:

| Cost | Calculation | Amount |
|---|---|---|
| Borrow fee at 30% annualised | 4,000 x 0.30 x 0.5 | **$600** |
| Dividends paid to the lender | $0.50 x 100 shares x 2 quarters | **$100** |
| **Total carry** | | **$700** |

That is **17.5% of the proceeds in six months** with the stock completely unchanged. The share price must fall 17.5% just to break even — and hard-to-borrow rates on the most crowded shorts have exceeded 100% annualised, at which point the position is a wasting asset regardless of whether the thesis is correct.

**A long position has no equivalent.** Nothing charges you rent for owning a stock, and dividends flow *to* you rather than out of you. This is the second structural asymmetry, and it converts "eventually right" — a perfectly acceptable outcome when long — into a loss.`,
        },
        {
          kind: 'text',
          md: `**Short squeezes.** When a heavily shorted stock rises, shorts are forced to buy to cover, which pushes the price higher, which forces more covering. The feedback loop is mechanical rather than sentimental.

Two metrics describe the fuel:

> **Short interest %** = shares sold short ÷ shares available to trade (the float)
> **Days to cover** = shares sold short ÷ average daily volume

A stock with **18 million** shares short and **3 million** shares of average daily volume has **6 days to cover** — six full sessions of buying, at normal volume, before the shorts could all exit. If a catalyst forces them to move at once, there is not remotely enough liquidity, and the price goes wherever it must to find sellers.

**What short interest actually tells you** is genuinely ambiguous, and the ambiguity is the point:

| Reading | Interpretation |
|---|---|
| High short interest | Sophisticated investors have researched this and concluded something is wrong — **or** the trade is crowded and fragile |
| Rising short interest | Growing bearish conviction — **or** merger arbitrage, convertible-bond hedging, or index-related hedging, none of which is a directional view at all |
| Low short interest | Nothing much |

A great deal of reported short interest is a **hedge against another position**, not a bet that the stock will fall. Treating the number as a sentiment gauge without knowing its composition is a common error.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Short sellers are parasites who drive good companies down."**

The evidence points the other way more often than not. Short sellers have exposed a long list of accounting frauds — the incentive to find them is the only well-funded one in the market, since everyone else profits from prices going up. They also provide liquidity to buyers and dampen bubbles by supplying stock when demand outruns supply. That said, the criticism is not empty: coordinated bear raids and misleading published research do occur, and forced covering can distort a price violently in the other direction. Understanding shorting matters even if you never do it, because short positioning explains a large share of the price behaviour you will otherwise find inexplicable.`,
        },
        {
          kind: 'callout',
          md: `**Why this is the wrong tool for almost every individual.** Even a correct thesis has to survive the borrow cost, the dividend obligation, a possible recall, the margin mechanics, and the fact that the position grows as it hurts. Keynes\'s observation applies with full force: markets can stay irrational longer than you can stay solvent — and when you are short, "staying solvent" has a daily meter running on it. The asymmetry is not a difficulty to be overcome with skill. It is arithmetic. **Understand it; do not attempt it.**`,
        },
        {
          kind: 'keypoint',
          md: `Short selling: borrow, sell, buy back, return — paying a borrow fee and any dividends throughout. Maximum gain is +100%; loss is unbounded, and a short that moves against you grows into your largest position while a losing long shrinks into your smallest. Carry alone can be decisive: 30% annualised borrow plus $100 of dividends on a $4,000 short is $700 over six months, 17.5% of proceeds, so the stock must fall 17.5% to break even. Days to cover = short interest ÷ average daily volume (18M / 3M = 6 days) measures squeeze fuel. High short interest is ambiguous — much of it is hedging, not a directional bet.`,
        },
      ],
      quiz: [
        {
          id: 'u14-l02-q1',
          prompt: 'What makes short selling structurally asymmetric?',
          choices: [
            'Maximum gain is capped at +100% while the loss is unbounded, and a losing short grows into your largest position while a losing long shrinks into your smallest',
            'Short sales are taxed at a higher rate than long positions',
            'Brokers charge higher commissions on short sales',
            'Short positions cannot be closed until the borrow is returned',
          ],
          answerIdx: 0,
          explain:
            'A stock can only fall to zero but has no ceiling, so the payoff is bounded on one side and open on the other — and the position dynamics make it worse, since a short at $40 that reaches $120 is three times its original weight. That combination is arithmetic rather than a difficulty skill can overcome, which is why the position tends to get closed at the worst possible moment.',
        },
        {
          id: 'u14-l02-q2',
          prompt:
            'You short $4,000 of stock for six months at a 30% annualised borrow rate, and the company pays $0.50 per share quarterly on your 100 shares. What is the carry?',
          choices: [
            '$600, the borrow fee only',
            '$1,200, the full annual borrow rate',
            '$100, the dividends only',
            '$700 — $600 of borrow plus $100 of dividends, or 17.5% of proceeds',
          ],
          answerIdx: 3,
          explain:
            '4,000 x 0.30 x 0.5 = $600 of borrow fee, and 0.50 x 100 x 2 = $100 of dividends that you pay to the lender out of your own pocket. The stock must fall 17.5% over those six months simply for the position to break even, which converts "eventually right" into a loss.',
        },
        {
          id: 'u14-l02-q3',
          prompt:
            'A stock has 18 million shares short and 3 million shares of average daily volume. What does this tell you?',
          choices: [
            'Days to cover is 6 — six full sessions of normal volume would be needed for shorts to exit, so a catalyst forcing simultaneous covering would find nowhere near enough liquidity',
            'The stock will rise, since high short interest is bullish',
            'Short interest is 18% of the float',
            'The borrow cost must be above 30% annualised',
          ],
          answerIdx: 0,
          explain:
            'Days to cover is short interest divided by average daily volume, and it measures how much buying would have to happen if shorts were forced out at once. It says nothing about direction — short interest as a percentage of float requires the float, and the borrow rate is set by supply and demand for the loan, not by this ratio.',
        },
        {
          id: 'u14-l02-q4',
          prompt: 'Why is high reported short interest an ambiguous signal?',
          choices: [
            'Because short interest data is reported with a one-year lag',
            'Because short interest is only reported for companies above $1B in market value',
            'Because much of it is hedging — merger arbitrage, convertible bonds, index hedges — rather than a directional bet, and even genuine bearish positioning can mean a crowded, fragile trade',
            'Because brokers are not required to report short positions accurately',
          ],
          answerIdx: 2,
          explain:
            'A convertible-bond arbitrageur short against a long bond position has no view on the stock at all, yet appears in the same number as a research-driven bear. Even when the positioning is directional, "sophisticated investors found something wrong" and "the trade is crowded and about to squeeze" are opposite readings of the same figure.',
        },
        {
          id: 'u14-l02-q5',
          prompt: 'What is the fairest overall assessment of short sellers\' role in markets?',
          choices: [
            'They are purely destructive and drive good companies down',
            'They are purely beneficial and criticism of them is unfounded',
            'Their role is too small to have any effect on prices',
            'On balance useful — they expose frauds, add liquidity and dampen bubbles — while coordinated bear raids and misleading research are real problems',
          ],
          answerIdx: 3,
          explain:
            'Short sellers carry the only well-funded incentive in the market to find accounting fraud, since everyone else profits from prices rising, and they supply stock when demand outruns supply. Acknowledging that alongside genuine abuses is the honest position, and understanding short positioning explains price behaviour you would otherwise find inexplicable.',
        },
      ],
      cardSeeds: [
        {
          id: 'u14-l02-c1',
          kind: 'cloze',
          front:
            'Short selling: ____ shares, ____ them, later ____ them back and ____ them. Meanwhile you pay a ____ fee and any ____ to the lender.',
          back: 'borrow; sell; buy; return; borrow; dividends',
        },
        {
          id: 'u14-l02-c2',
          kind: 'basic',
          front: 'Why does a losing short position become more dangerous over time, unlike a losing long?',
          back: 'A long that falls shrinks as a share of the portfolio, so your worst idea becomes your smallest position automatically. A short that rises grows — short at $40 and at $120 the position is three times its original size — so your worst idea becomes your largest exactly when margin requirements are rising and judgement is worst.',
        },
        {
          id: 'u14-l02-c3',
          kind: 'cloze',
          front:
            'Days to cover = ____ ÷ ____. With 18M shares short and 3M average daily volume it is ____ days.',
          back: 'shares sold short; average daily volume; 6',
        },
        {
          id: 'u14-l02-c4',
          kind: 'basic',
          front: 'Why is short interest an ambiguous signal?',
          back: 'Much of it is hedging — merger arbitrage, convertible-bond hedging, index hedges — with no directional view at all. Even genuinely bearish short interest reads two opposite ways: sophisticated investors found a problem, or the trade is crowded and one catalyst from a squeeze.',
        },
      ],
    },

    // ── L03 ───────────────────────────────────────────────────────────────
    {
      id: 'u14-l03',
      unitId: 'u14',
      order: 3,
      title: 'Options as a Risk Lens',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**This lesson exists so you can read what options prices are telling you about a stock, and so you understand what happens to the people trading them. It is not encouragement to trade them.** The evidence on retail options outcomes is poor and the reasons are structural.

**The two contracts.** Each standard contract covers **100 shares**.

- A **call** gives the buyer the right, not the obligation, to **buy** 100 shares at the **strike price** until **expiry**. The buyer pays a **premium**.
- A **put** gives the buyer the right to **sell** 100 shares at the strike until expiry.
- For every buyer there is a **seller** (writer), who receives the premium and takes on the obligation.

**Where the premium comes from.** An option's price has exactly two components:

> **Premium = intrinsic value + time value**

**Intrinsic value** is what the option is worth if exercised right now — for a call, share price minus strike, floored at zero. **Time value** is everything else, and it is driven overwhelmingly by two things: how long is left, and **how much the stock is expected to move**. That second input is the reason options matter even to someone who never trades them: **an option price is a statement about expected volatility**, which is the subject of Lesson 4.`,
        },
        {
          kind: 'example',
          md: `**A call, priced and then resolved.** Stock at **$50.00**. A call with a **$55 strike** expiring in **3 months** costs **$2.00** per share ($200 per contract).

- **Breakeven at expiry** = strike + premium = 55 + 2.00 = **$57.00**
- That is (57 − 50) / 50 = **+14.0%** in three months, just to break even.

| Stock at expiry | Intrinsic value | P&L per share | Return on premium |
|---|---|---|---|
| $65.00 | $10.00 | **+$8.00** | **+400%** |
| $60.00 | $5.00 | +$3.00 | +150% |
| $57.00 | $2.00 | $0.00 | 0% |
| $54.00 | $0.00 | −$2.00 | **−100%** |
| $50.00 (unchanged) | $0.00 | −$2.00 | **−100%** |

Look at the last row. **The stock did not move and the option lost everything.** Compare with owning the shares, where an unchanged price returns 0%.

**The three simultaneous hurdles.** To make money on this call you must be right about **direction**, **magnitude** (at least +14%), and **timing** (inside three months). A share buyer needs only the first, and can be wrong about timing indefinitely.

**Rough odds on that.** For a stock with 30% annualised volatility, three-month volatility is about 15%, so a +14% move is roughly a 0.87 standard-deviation event — a probability of around **19%**, call it one in five. That is not a mispricing to exploit; it is approximately what the $2.00 premium is pricing. The option is not a cheap way to bet on the stock. It is a fairly priced bet on a demanding, time-limited proposition.`,
        },
        {
          kind: 'example',
          md: `**The two conservative strategies, honestly costed.** You own **100 shares at $50.00** — a $5,000 position.

**Protective put.** Buy a **$45-strike put** for **$1.50** ($150).

- Cost: 150 / 5,000 = **3.0%** of the position for three months, which annualises to about **12%**
- Floor: 45.00 − 1.50 = **$43.50**, so your maximum loss is (50 − 43.50) / 50 = **13.0%**
- What it is: insurance, priced like insurance. A 12% annual premium to cap losses at 13% is expensive, which is why it is normally used around a specific event rather than continuously.

**Covered call.** Sell a **$55-strike call** for **$2.00** ($200) against the shares you own.

- Income: 200 / 5,000 = **4.0%** of the position for three months
- Upside cap: 55.00 + 2.00 = **$57.00**, a maximum return of **14.0%**
- If the stock reaches $70.00, you are assigned at $55 and **forgo $13.00 per share**

**What a covered call really is.** You have sold your right tail. The payoff resembles a bond: a known income with a capped upside and the full downside intact. On a business you expect to compound for years (Unit 13, Lesson 8), systematically selling the upside is the option-market version of trimming every winner at +20% — it feels like income and it removes the outcomes that produce most of the return.`,
        },
        {
          kind: 'text',
          md: `**Why most beginners lose money with options.** Five structural reasons, none of which is about intelligence:

1. **Three hurdles instead of one.** Direction, magnitude, and timing must all be right.
2. **Time decay is relentless.** Time value bleeds every day and accelerates near expiry. Short-dated out-of-the-money options are the most popular retail choice and the fastest-decaying.
3. **Spreads are wide.** An option quoted $1.90 / $2.10 has a 10% round-trip spread — fifty to a hundred times the spread on the underlying stock (Lesson 1). Trade actively and the spread alone can consume the edge.
4. **Leverage amplifies behaviour.** Everything in Unit 12 — loss aversion, the disposition effect, revenge trading — operates on positions that can lose 100% in a week. Options do not create the behavioural errors; they magnify their consequences and shorten the time available to think.
5. **The payoff distribution is misread.** A structure that wins one time in five and pays 400% is fairly priced, but it *feels* like a losing streak, and the natural human response to four consecutive losses is to raise the stake.

**Where options genuinely help someone who never trades them:** they are the market's live, quantified forecast of uncertainty about a specific company on a specific date. That is a free information source, and it is what the next lesson is about.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Options are cheap leverage — I can control $5,000 of stock for $200."**

The $200 controls the stock only until expiry, and then it is worth zero unless the stock has cleared the strike. What you actually bought is a **time-limited, path-dependent claim** whose expected value is roughly the premium — the option is priced by people whose entire job is pricing it. Real leverage on shares (margin) keeps the position alive indefinitely; an option deletes it on a scheduled date. Calling it "cheap" confuses the ticket price with the odds.`,
        },
        {
          kind: 'callout',
          md: `**Understanding without advocating.** Everything above is here so that you can interpret an options price, recognise what a covered call gives away, and understand why a stock moves the way it does around expiry. **None of it is a suggestion to trade options.** If you ever do, the only defensible starting point is a defined-risk position, sized so a total loss is irrelevant to the portfolio, on a business you already understand well enough to own outright — and even then, the honest question is why the same view is not better expressed by simply owning the shares.`,
        },
        {
          kind: 'keypoint',
          md: `Premium = intrinsic value + time value, and time value is driven by time remaining and expected volatility — which is why an option price is a statement about uncertainty. A $55 call at $2.00 on a $50 stock breaks even at $57.00, needing +14.0% in three months: right about direction, magnitude and timing, roughly a one-in-five proposition for a 30%-volatility stock. A protective put at $45 for $1.50 costs 3.0% per quarter (~12% annualised) and caps the loss at 13.0%. A covered call at $55 for $2.00 pays 4.0% and caps the return at 14.0%, forgoing $13.00 per share if the stock reaches $70 — you have sold your right tail. Beginners lose to three hurdles, time decay, ~10% spreads, amplified behaviour, and a misread payoff distribution.`,
        },
      ],
      quiz: [
        {
          id: 'u14-l03-q1',
          prompt:
            'A $55-strike call costs $2.00 with the stock at $50.00. What must happen for the buyer to break even at expiry?',
          choices: [
            'The stock must close above $55.00, a 10.0% move',
            'The stock must close above $57.00 — a 14.0% move — within three months',
            'The stock must simply not fall, since the premium is refunded',
            'The stock must close above $52.00, the strike less the premium',
          ],
          answerIdx: 1,
          explain:
            'Breakeven is strike plus premium, so 55 + 2.00 = $57.00, which is 14.0% above the current price and must be reached before expiry. Closing at exactly $55 leaves the option worthless in P&L terms because the $2.00 premium is already spent, which is why direction, magnitude and timing must all be right.',
        },
        {
          id: 'u14-l03-q2',
          prompt: 'The stock finishes unchanged at $50.00. What happens to the call buyer and the share buyer?',
          choices: [
            'The call buyer loses 100% of the premium; the share buyer is flat at 0%',
            'Both are flat, since the stock did not move',
            'The call buyer loses the difference between strike and price',
            'The call buyer keeps the time value remaining at expiry',
          ],
          answerIdx: 0,
          explain:
            'At expiry there is no time value left, so an out-of-the-money call is worth zero and the entire $2.00 premium is gone. This is the sharpest difference between the two instruments: a share buyer who is merely early is flat, while an option buyer who is merely early is wiped out.',
        },
        {
          id: 'u14-l03-q3',
          prompt:
            'You own 100 shares at $50.00 and sell a $55 call for $2.00. The stock reaches $70.00. What happened?',
          choices: [
            'You keep the shares and the $200 premium',
            'You are assigned at $55, capping your return at 14.0% and forgoing $13.00 per share',
            'You lose $1,500, the difference between $70 and $55',
            'The call expires worthless because you own the shares',
          ],
          answerIdx: 1,
          explain:
            'Your effective exit is 55 + 2.00 = $57.00 against $50.00 paid, a 14.0% return, while the shares went to $70.00 — so the $13.00 above your cap belongs to the call buyer. A covered call sells the right tail, which on a long-term compounder removes exactly the outcomes that produce most of the return.',
        },
        {
          id: 'u14-l03-q4',
          prompt: 'Which of these is NOT one of the structural reasons beginners lose money on options?',
          choices: [
            'Time decay accelerates near expiry, and short-dated out-of-the-money contracts are both the most popular and the fastest-decaying',
            'Option spreads are often 10% round trip, fifty to a hundred times the spread on the underlying stock',
            'Leverage magnifies the behavioural errors from Unit 12 and shortens the time available to think',
            'Options are systematically overpriced by market makers relative to fair value',
          ],
          answerIdx: 3,
          explain:
            'The one-in-five call that pays 400% is roughly fairly priced, which is precisely the problem: there is no systematic overpricing to blame, and the losses come from the three simultaneous hurdles, decay, spreads, and behaviour under leverage. Believing the game is rigged by mispricing misdiagnoses a structure that is simply demanding.',
        },
        {
          id: 'u14-l03-q5',
          prompt: 'What is the main reason an investor who never trades options should still understand them?',
          choices: [
            'Because option positions must be disclosed in company filings',
            'Because covered calls are a reliable source of portfolio income',
            'Because options expiry determines the direction of the underlying stock',
            'Because option prices are the market\'s live, quantified forecast of uncertainty about a specific company on a specific date',
          ],
          answerIdx: 3,
          explain:
            'Time value is driven by expected volatility, so an option price backs out into a numerical statement about how uncertain the market is — free information, available for any listed company and any date. The other answers reverse the causation or turn a risk lens into a strategy recommendation.',
        },
      ],
      cardSeeds: [
        {
          id: 'u14-l03-c1',
          kind: 'cloze',
          front:
            'Premium = ____ value + ____ value. The second is driven by ____ remaining and ____, which is why an option price is a statement about uncertainty.',
          back: 'intrinsic; time; time; expected volatility',
        },
        {
          id: 'u14-l03-c2',
          kind: 'basic',
          front: 'What three things must a call buyer get right that a share buyer does not?',
          back: 'Direction, magnitude, and timing. A $55 call at $2.00 on a $50 stock breaks even at $57.00 — a 14.0% move inside three months, roughly a one-in-five proposition for a 30%-volatility stock. A share buyer needs only direction and can be wrong about timing indefinitely.',
        },
        {
          id: 'u14-l03-c3',
          kind: 'basic',
          front: 'What does a covered call actually sell, and what is the cost?',
          back: 'It sells the right tail. Owning at $50 and selling a $55 call for $2.00 gives 4.0% of income and caps the return at $57.00 (+14.0%); if the stock reaches $70 you forgo $13.00 per share. On a compounder it is the option-market equivalent of trimming every winner at +20%.',
        },
        {
          id: 'u14-l03-c4',
          kind: 'basic',
          front: 'Why is "options are cheap leverage" a misreading?',
          back: 'The premium buys a time-limited, path-dependent claim priced by people whose job is pricing it, with an expected value roughly equal to what you paid. Margin leverage on shares keeps a position alive indefinitely; an option deletes it on a scheduled date. The ticket price is low; the odds are not favourable.',
        },
      ],
    },

    // ── L04 ───────────────────────────────────────────────────────────────
    {
      id: 'u14-l04',
      unitId: 'u14',
      order: 4,
      title: 'Implied Volatility & Positioning',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `An option price is observable. Everything that goes into it except one input is also observable: the share price, the strike, the time to expiry, and interest rates. Run the pricing model backwards and you can solve for the missing input.

That input is **implied volatility (IV)** — the volatility figure that makes the model reproduce the market price. It is not a forecast anyone published. It is **the volatility the market is collectively paying for**, extracted from real transactions.

Two distinctions worth keeping straight:

- **Historical (realised) volatility** — how much the stock actually moved. Backward-looking, calculated from prices.
- **Implied volatility** — how much the market expects it to move. Forward-looking, extracted from option prices.

When IV is far above realised volatility, the market is paying up for something it expects: an earnings release, a trial result, a court ruling, a regulatory decision. **IV is the market's uncertainty forecast with a date attached**, and it is free to read.`,
        },
        {
          kind: 'example',
          md: `**Reading the expected move.** A useful approximation:

> **expected move ≈ share price x IV x sqrt(days ÷ 365)**

A stock trades at **$80.00** with **60%** implied volatility on options expiring in **2 days**, straddling an earnings release.

expected move = 80.00 x 0.60 x sqrt(2 / 365) = 80.00 x 0.60 x 0.0740 = **$3.55**, or **4.4%**

**The shortcut that skips the model entirely.** The price of an at-the-money **straddle** — buying both the call and the put at the same strike — is approximately the expected move. If the $80 straddle costs **$3.60**, the options market is saying it expects a move of about **±4.5%** by expiry, in either direction.

**What that number is worth to you as a shareholder.** Two things, neither requiring you to trade anything:

1. **Sizing.** Unit 13, Lesson 6 turned this into arithmetic: an 8% position with a 4.5% implied move puts 0.36% of the portfolio on one morning. A 9% implied move on the same position puts 0.72%.
2. **Calibration.** If IV implies ±4.5% and this company has moved 9%, 11% and 8% on its last three reports, the market is either underpricing the event or something structural has changed. Either way you have learned something before the report.

**And what it is not.** IV is **direction-neutral**. A high implied move says the market expects a large move, not an upward one. A straddle buyer profits from a big move in either direction, which is precisely why the number carries no directional information.`,
        },
        {
          kind: 'example',
          md: `**IV crush — being right and losing anyway.**

Implied volatility is high before an earnings release *because* the outcome is unknown. The moment results are published, the uncertainty is resolved and IV collapses — typically from something like 60% back toward a normal 30%. This is **IV crush**, and it happens every single time, on schedule.

Follow the $3.60 straddle through it:

| | Before | After |
|---|---|---|
| Stock | $80.00 | $82.40 (**+3.0%**) |
| Implied volatility | 60% | 32% |
| Straddle value | $3.60 | ~$2.50 |
| **P&L** | | **−$1.10, or −30.6%** |

**The stock went up, and the position lost 30.6%.** The call gained intrinsic value; the collapse in time value on both legs more than offset it, because the actual 3.0% move came in below the 4.5% the market had charged for.

**The general rule this establishes.** Buying options into a known, scheduled event means buying volatility at its most expensive moment. You do not merely need to be right about direction — you need the move to exceed what was already priced. "The stock rose after earnings" and "the option made money" are different claims, and they come apart routinely.`,
        },
        {
          kind: 'text',
          md: `**Skew — where positioning shows up.** Options at different strikes on the same stock and the same expiry trade at **different implied volatilities**. A representative equity picture:

| Contract | Implied volatility |
|---|---|
| 25-delta put (downside protection) | **38%** |
| At-the-money | 32% |
| 25-delta call (upside) | **27%** |

That **11-point** gap between the put and the call is **skew**, and in equity index options it is persistent — it has been a standing feature since 1987. The explanation is structural rather than sentimental: equity investors are natural buyers of crash insurance and natural sellers of upside, so downside strikes carry a permanent demand premium.

**Which means skew is a level to compare against its own history, never an absolute signal.** Skew being positive tells you nothing. Skew being at its widest in two years tells you demand for protection is unusually intense.

**The put/call ratio** — put volume divided by call volume — is used the same way and deserves the same caution. It is a contrarian indicator *at extremes* (heavy put buying often clusters near lows, when fear peaks) and pure noise in the middle of its range. It is also contaminated: a large share of put volume is institutional hedging of long positions rather than a bearish bet, exactly as with short interest (Lesson 2).

**The honest summary of all positioning data:** it describes what other people have already done. That is occasionally useful as a contrarian input at genuine extremes, and it is never a substitute for knowing what a business is worth.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "High implied volatility means the stock is going to fall."**

IV is direction-neutral by construction — it prices the *size* of an expected move, not its sign. A stock about to report results that could take it up 15% or down 15% has high IV, and a straddle buyer is indifferent between the two outcomes. Volatility does correlate with falling markets in aggregate, because indices decline faster than they rise, but for a single stock ahead of a scheduled event a high IV is a statement about uncertainty and nothing more.`,
        },
        {
          kind: 'callout',
          md: `**Two ways to use IV without ever opening an options account.** First, **read the expected move before every earnings date on a position you hold** and multiply it by your position weight — that product is your one-day portfolio exposure, and it is the input Unit 11 needs. Second, **compare IV to the stock\'s own history of reaction moves.** A market pricing ±4.5% into a company that has moved 8–11% on its last three reports is telling you something is being underestimated — possibly by the market, possibly by you.`,
        },
        {
          kind: 'keypoint',
          md: `Implied volatility is the volatility that makes an option model reproduce the market price — the market's forward-looking uncertainty forecast with a date attached, and it is direction-neutral. Expected move ≈ price x IV x sqrt(days/365): $80 at 60% IV over 2 days is $3.55, or 4.4%, and an at-the-money straddle price (~$3.60) approximates the same figure. IV crush is scheduled: after the release, IV falls from ~60% to ~32%, so a $3.60 straddle can lose 30.6% on a +3.0% move because the move came in under the 4.5% already priced. Skew (a 25-delta put at 38% versus a 25-delta call at 27%) is a persistent structural feature — read it against its own history, never in absolute terms.`,
        },
      ],
      quiz: [
        {
          id: 'u14-l04-q1',
          prompt: 'What is implied volatility?',
          choices: [
            'The volatility a stock actually experienced over the past year',
            'The volatility input that makes an option pricing model reproduce the option\'s observed market price',
            'The average volatility of the stocks in a sector index',
            'A forecast published by exchanges each morning',
          ],
          answerIdx: 1,
          explain:
            'Every other input to an option model — price, strike, time, rates — is observable, so the model can be run backwards to solve for the one that is not. The result is what the market is collectively paying for volatility, extracted from real trades, in contrast to realised volatility which is computed from past prices.',
        },
        {
          id: 'u14-l04-q2',
          prompt:
            'A stock trades at $80.00 with 60% implied volatility on options expiring in 2 days. What is the approximate expected move?',
          choices: [
            '$48.00, or 60%',
            '$0.26, or 0.3%',
            '$8.00, or 10%',
            '$3.55, or about 4.4%',
          ],
          answerIdx: 3,
          explain:
            '80.00 x 0.60 x sqrt(2/365) = 80.00 x 0.60 x 0.0740 = $3.55. The 60% figure is annualised, so it must be scaled by the square root of the fraction of a year remaining — skipping that step is what produces the $48.00 answer.',
        },
        {
          id: 'u14-l04-q3',
          prompt:
            'A $3.60 straddle is held through earnings. The stock rises 3.0% and IV falls from 60% to 32%, leaving the straddle at about $2.50. Why did a correct directional view lose money?',
          choices: [
            'Because straddles only profit from downward moves',
            'Because the position was closed before expiry',
            'Because the 3.0% move came in below the 4.5% already priced, and IV crush destroyed more time value than the call gained in intrinsic value',
            'Because implied volatility does not affect option prices once the news is out',
          ],
          answerIdx: 2,
          explain:
            'The market had already charged for a ±4.5% move, so a 3.0% move is a shortfall against what was paid for, and the scheduled collapse in IV strips time value from both legs at once. "The stock rose after earnings" and "the option made money" are different claims that come apart routinely.',
        },
        {
          id: 'u14-l04-q4',
          prompt: 'A 25-delta put trades at 38% IV while the 25-delta call trades at 27%. How should this be read?',
          choices: [
            'Skew is a persistent structural feature of equity options, so the level matters only relative to its own history — an 11-point gap is not a signal on its own',
            'The market expects the stock to fall, since puts are more expensive',
            'The options are mispriced and the put should be sold',
            'The stock has unusually high dividend risk',
          ],
          answerIdx: 0,
          explain:
            'Equity investors are natural buyers of crash insurance and natural sellers of upside, so downside strikes have carried a standing demand premium since 1987 — the gap existing tells you nothing. Skew at its widest in two years would tell you demand for protection is unusually intense, which is why it is read as a level against history.',
        },
      ],
      cardSeeds: [
        {
          id: 'u14-l04-c1',
          kind: 'cloze',
          front:
            'Expected move ≈ ____ x ____ x sqrt( ____ ). An at-the-money ____ price approximates the same figure without any model.',
          back: 'share price; implied volatility; days ÷ 365; straddle',
        },
        {
          id: 'u14-l04-c2',
          kind: 'basic',
          front: 'What is IV crush and why does it happen on schedule?',
          back: 'Implied volatility is elevated before a known event because the outcome is unknown; the moment results publish, the uncertainty resolves and IV collapses (say 60% to 32%). A $3.60 straddle can fall to $2.50 — a 30.6% loss — on a +3.0% move, because the actual move undershot the 4.5% already priced.',
        },
        {
          id: 'u14-l04-c3',
          kind: 'basic',
          front: 'Two ways to use implied volatility without trading options.',
          back: '1. Multiply the expected move by your position weight to get your one-day portfolio exposure to an earnings date. 2. Compare the implied move to the stock\'s own history of reaction moves — ±4.5% priced into a company that has moved 8–11% on its last three reports means someone is underestimating the event.',
        },
      ],
    },

    // ── L05 ───────────────────────────────────────────────────────────────
    {
      id: 'u14-l05',
      unitId: 'u14',
      order: 5,
      title: 'Factor Investing',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A **factor** is a shared characteristic that has historically explained differences in returns across large groups of stocks. The claim is not about any individual company — it is that portfolios sorted on the characteristic have behaved differently from each other over long periods.

The five with the most durable evidence:

| Factor | Sorted on | The proposed reason |
|---|---|---|
| **Value** | Low price to book, earnings, or cash flow | Compensation for distress risk, or systematic over-extrapolation of bad news |
| **Momentum** | Strong returns over the last 12 months excluding the most recent one | Under-reaction to news, then over-reaction as trends extend |
| **Quality / profitability** | High gross profits or ROIC, stable earnings (Unit 5) | Persistently profitable businesses were historically underpriced relative to their durability |
| **Size** | Small market capitalisation | Illiquidity and higher business risk |
| **Low volatility** | Low historical volatility | Leverage constraints push investors toward high-beta stocks, leaving low-beta ones cheap |

**Where the evidence comes from.** Fama and French's three-factor model (1993) added value and size to the market factor; Carhart (1997) added momentum; Fama and French's five-factor model (2015) added profitability and investment. These are among the most examined results in finance, replicated across decades and across international markets.

Two honest observations sit alongside that. The **explanations** are contested even where the return patterns are not — nobody agrees on whether value is compensation for risk or a behavioural error. And the effects are **averages over thousands of stocks and decades**, which is a very different thing from a rule you can apply to a portfolio of fifteen names over five years.`,
        },
        {
          kind: 'example',
          md: `**Why you cannot evaluate a factor within your own investing lifetime.**

Suppose a factor genuinely delivers a **3% annual premium** with a **12% tracking error** — a realistic profile. The statistical significance of an observed premium over n years is:

> **t = (premium ÷ tracking error) x sqrt(n)**

| Years observed | t-statistic |
|---|---|
| 10 | (3/12) x sqrt(10) = **0.79** |
| 25 | 1.25 |
| **64** | **2.00** |

You need **64 years** of data before a genuine 3% premium clears the conventional t = 2 threshold.

**Sit with what that implies.** Ten years of a factor underperforming is not evidence that it stopped working. Ten years of it outperforming is not evidence that it works. Both are entirely consistent with noise around a true 3% premium — and ten years is longer than most people's entire investing experience.

**The same arithmetic applies to you.** Your satellite portfolio (Unit 13, Lesson 2) will produce a three-year track record that is statistically indistinguishable from luck in either direction. This is why the disproof condition in a strategy document has to be a *decision rule* set in advance ("if the satellite trails by more than 3 points over three years, fold it into the core") rather than a claim of statistical proof. You will never have proof. You will have a rule.`,
        },
        {
          kind: 'text',
          md: `**Factor cycles — the reason factor investing is behaviourally brutal.**

Factors do not deliver a smooth premium. They deliver long stretches of nothing, or worse, punctuated by periods where they work spectacularly.

- **Value underperformed growth for roughly thirteen years** from the mid-2000s into 2020 — a drawdown long enough for a great many disciplined value investors to close, retire, or quietly become growth investors first.
- **Momentum crashes.** Momentum works most of the time and then fails catastrophically at sharp market reversals: as markets bottomed in 2009, the momentum long-short portfolio (long recent winners, short recent losers) suffered enormous losses in a matter of weeks as the most beaten-down stocks rebounded hardest.
- **Low volatility** lags badly in strong bull markets, precisely when abandoning it feels most obvious.

**Post-publication decay** is a further and separate problem. McLean and Pontiff (2016) examined dozens of published anomalies and found returns roughly a quarter lower out of sample and more than half lower after publication. Some of that is capital arriving to trade the effect; some is that the original result was partly data mining — with thousands of researchers testing thousands of characteristics, some will look significant by chance alone.

**The synthesis.** Factors are real in the sense that the historical patterns are robust and widely replicated. They are unreliable in the sense that no individual investor has enough time to verify one, capture one through its full cycle, or distinguish a factor that has stopped working from one that is merely having a bad decade.`,
        },
        {
          kind: 'example',
          md: `**Smart beta — factors in a wrapper.** "Smart beta" funds package a factor into an index-tracking product. Before buying one, four questions:

| Question | Why it matters |
|---|---|
| **What is the exact definition?** | "Quality" means gross profitability at one provider and low debt plus stable earnings at another. Two "quality" funds can hold almost nothing in common. |
| **What does it cost?** | A 0.35% fee against a claimed 3% premium consumes over a tenth of it — against a 0.03% broad index fund, the fee difference alone is 0.32%. |
| **What is the turnover?** | Momentum strategies rebalance constantly. In a taxable account, high turnover can consume the entire premium (Unit 13, Lesson 2). |
| **Would I hold it through the drawdown?** | A value fund required thirteen years of patience. If you would sell after three bad years, you will capture the drawdown and miss the recovery. |

**And the honest note on already owning factors.** If you are running the Unit 13 process — screening for ROIC above 12% and buying below your estimate of value — you already have a quality tilt and a value tilt. You may be paying a fund a fee for exposure your own process is generating, or unknowingly doubling a single bet. Knowing what factors you are already exposed to is the first-order use of this material; buying a product is a distant second.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "This factor has beaten the market for ten years, so it works."**

Ten years produces a t-statistic of about 0.8 on a genuine 3% premium — nowhere near significance, and equally consistent with a factor that does not exist at all but got lucky. The problem is symmetric and that symmetry is what people miss: the same arithmetic that forbids you to conclude a factor works after ten good years forbids you to conclude it has died after ten bad ones. Anyone who reasons confidently in one direction and not the other is not using the evidence, they are decorating a preference.`,
        },
        {
          kind: 'callout',
          md: `**The most useful thing factors give an individual investor is a vocabulary for their own exposures.** If your portfolio is six cheap, slow-growing, indebted industrials, you own a concentrated value-and-size bet and will live through the value factor\'s cycle whether or not you ever use the word. If it is eight expensive, fast-growing software names, you own growth and momentum and will live through theirs. Naming the exposure is what lets you notice that fifteen tickers are three bets (Unit 13, Lesson 9).`,
        },
        {
          kind: 'keypoint',
          md: `Five factors with durable evidence: value, momentum, quality/profitability, size, low volatility — from Fama-French (1993), Carhart (1997) and Fama-French (2015). A genuine 3% premium with 12% tracking error needs 64 years to reach t = 2; ten years gives t = 0.79, so a decade of outperformance and a decade of underperformance are equally uninformative. Factor cycles are brutal — value lagged growth for roughly thirteen years into 2020, momentum crashed at the 2009 reversal — and McLean and Pontiff (2016) found published anomalies roughly a quarter weaker out of sample and more than half weaker after publication. The first-order use of factors is naming the exposures you already have.`,
        },
      ],
      quiz: [
        {
          id: 'u14-l05-q1',
          prompt: 'Which of these correctly describes the momentum factor?',
          choices: [
            'Sorting on the highest earnings growth over the last three years',
            'Sorting on returns over the last 12 months excluding the most recent month, with under-reaction then over-reaction as the proposed mechanism',
            'Sorting on the lowest price-to-book ratio',
            'Sorting on the stocks with the highest trading volume',
          ],
          answerIdx: 1,
          explain:
            'The standard construction is a 12-month lookback skipping the most recent month, and the usual explanation is that markets under-react to news initially and then over-extend the resulting trend. Sorting on price-to-book is the value factor and sorting on earnings growth is not a factor construction at all.',
        },
        {
          id: 'u14-l05-q2',
          prompt:
            'A factor delivers a genuine 3% premium with 12% tracking error. How many years of data are needed to reach a t-statistic of 2?',
          choices: [
            '10 years',
            '64 years',
            '25 years',
            '4 years',
          ],
          answerIdx: 1,
          explain:
            't = (3/12) x sqrt(n), so t = 2 requires sqrt(n) = 8 and therefore n = 64. Ten years gives t = 0.79 — which is why a decade of outperformance and a decade of underperformance are both statistically uninformative about whether the factor exists.',
        },
        {
          id: 'u14-l05-q3',
          prompt: 'What did McLean and Pontiff (2016) find about published market anomalies?',
          choices: [
            'That anomalies strengthen after publication as more capital validates them',
            'That anomalies are entirely artefacts of survivorship bias in databases',
            'That anomalies only exist in US markets',
            'Returns were roughly a quarter lower out of sample and more than half lower after publication',
          ],
          answerIdx: 3,
          explain:
            'Part of the decay comes from capital arriving to trade a now-public effect and part from the original result being partly data mining, since thousands of researchers testing thousands of characteristics will produce false positives by chance. The finding is a caution about published edges generally, not a claim that anomalies never existed.',
        },
        {
          id: 'u14-l05-q4',
          prompt:
            'Why is the value factor\'s roughly thirteen-year lag behind growth into 2020 behaviourally significant?',
          choices: [
            'It proves the value factor no longer exists',
            'It shows that factor premia are paid continuously rather than episodically',
            'It is longer than most investors\' patience, so many abandoned the approach before any recovery — capturing the drawdown and missing the rebound',
            'It demonstrates that value only works in international markets',
          ],
          answerIdx: 2,
          explain:
            'Factors deliver long stretches of nothing punctuated by periods of strong performance, and a thirteen-year drawdown outlasts most people\'s conviction and often their careers. The arithmetic of the previous section forbids concluding the factor died, which is exactly why the honest framing is behavioural rather than statistical.',
        },
        {
          id: 'u14-l05-q5',
          prompt: 'What is the most useful thing factor research offers an individual investor?',
          choices: [
            'A vocabulary for naming the factor exposures their existing portfolio already has',
            'A reliable way to time rotations between factors',
            'Confidence that a chosen factor will outperform over a ten-year horizon',
            'A method for ranking individual stocks within a sector',
          ],
          answerIdx: 0,
          explain:
            'Six cheap, slow-growing, indebted industrials is a concentrated value-and-size bet whether or not you use those words, and naming it is what reveals that fifteen tickers may be three bets. Timing factors and expecting ten-year reliability both run straight into the 64-year problem.',
        },
      ],
      cardSeeds: [
        {
          id: 'u14-l05-c1',
          kind: 'cloze',
          front:
            'The five factors with the most durable evidence: ____, ____, ____, ____, and ____.',
          back: 'value; momentum; quality/profitability; size; low volatility',
        },
        {
          id: 'u14-l05-c2',
          kind: 'cloze',
          front:
            'Factor significance: t = ( ____ ÷ ____ ) x sqrt(n). A 3% premium with 12% tracking error gives t = ____ over 10 years and needs ____ years to reach t = 2.',
          back: 'premium; tracking error; 0.79; 64',
        },
        {
          id: 'u14-l05-c3',
          kind: 'basic',
          front: 'What is post-publication decay, and what did the evidence show?',
          back: 'Published anomalies weaken once they are public. McLean and Pontiff (2016) found returns roughly a quarter lower out of sample and more than half lower after publication — partly capital arriving to trade the effect, partly the original result being partly data mining.',
        },
        {
          id: 'u14-l05-c4',
          kind: 'basic',
          front: 'Four questions before buying a smart-beta fund.',
          back: 'What is the exact factor definition (two "quality" funds can hold almost nothing in common)? What does it cost against a 0.03% broad index fund? What is the turnover, and what does it cost after tax? Would I hold it through a thirteen-year drawdown?',
        },
      ],
    },

    // ── L06 ───────────────────────────────────────────────────────────────
    {
      id: 'u14-l06',
      unitId: 'u14',
      order: 6,
      title: 'Macro Cycles & Rates',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Unit 13, Lesson 5 established the rule: macro is context, not timing. This lesson gives you the instruments to read that context, and one number that shows exactly how macro enters your valuation.

**The business cycle** has four phases, and the important honest note comes first: **they are labelled after the fact.** In the United States the NBER dates recessions in retrospect, sometimes a year or more after the turning point it identifies.

| Phase | Typically | Rates | Credit |
|---|---|---|---|
| **Expansion** | Employment rising, capex growing, confidence high | Rising | Spreads tight |
| **Peak** | Capacity tight, wage and input pressure | High | Spreads at their tightest |
| **Contraction** | Demand falls, inventories build, layoffs | Falling | Spreads widening fast |
| **Trough** | Activity bottoms, policy easing, sentiment worst | Low | Spreads at their widest |

You cannot know which row you are in today. You can read the instruments in the last two columns, which is a different and more modest claim.`,
        },
        {
          kind: 'text',
          md: `**The yield curve.** Plot government bond yields against maturity. Normally longer bonds yield more, compensating for the extra time. When short yields exceed long ones — an **inversion**, usually measured as the 10-year minus the 2-year — it means bond markets expect rates to be lower in the future, which usually means they expect weakness.

Curve inversion has preceded every US recession of recent decades. The caveats that make it far less useful than it sounds:

- **The lag is long and variable** — historically six to twenty-four months between inversion and recession.
- **The sample is tiny.** A handful of recessions is not a basis for statistical confidence, and it is exactly the situation Lesson 5's arithmetic warns about.
- **It is widely watched**, so the expectation is already in asset prices before you act on it.

**Credit spreads** — the extra yield demanded on corporate bonds over government bonds — are the more responsive instrument, because bondholders lose everything in a default and therefore watch solvency obsessively. High-yield spreads of roughly 300–400 basis points indicate calm; spreads above 800 indicate genuine stress; the 2008 crisis saw them reach extraordinary levels. Widening credit spreads while equities are still rising is one of the few genuine early warnings, because it means the market that gets paid to worry about survival is worrying.

**Inflation regimes** matter because they set the risk-free rate that anchors every discount rate you have ever used. Low, stable inflation supports low rates and high multiples. High or volatile inflation forces rates up, compresses multiples, and — a point often missed — hurts *nominal* long-duration assets most (Unit 13, Lesson 5).`,
        },
        {
          kind: 'example',
          md: `**How macro actually reaches your valuation — the Meridian Software model, re-run.**

From Unit 7: five years of free cash flow of **$112.0M, $123.2M, $133.1M, $141.0M, $148.1M**, terminal growth **2.5%**, net debt **$200M**, **50M** shares. The cost of equity was built as risk-free 4% + β 1.0 x equity risk premium 5%, giving a discount rate of **9%**.

Now suppose the risk-free rate rises **two points**, from 4% to 6%, with the equity risk premium and beta unchanged. The discount rate becomes **11%**.

| | r = 9% | r = 10% | r = 11% |
|---|---|---|---|
| PV of the five explicit years | $505.4M | $491.9M | **$479.0M** |
| Terminal value | $2,335.3M | $2,023.9M | **$1,785.8M** |
| PV of terminal value | $1,517.8M | $1,256.7M | **$1,059.8M** |
| Enterprise value | $2,023.1M | $1,748.6M | **$1,538.8M** |
| Less net debt | −$200M | −$200M | −$200M |
| **Value per share** | **$36.46** | **$30.97** | **$26.78** |

**A 2-point move in the risk-free rate cut the value by (36.46 − 26.78) / 36.46 = 26.5%.** Meridian's customers, products, margins, market share and management did not change in any respect. Every dollar of that decline came from the denominator.

**Where the damage concentrates.** The explicit five years fell only 5.2%, from $505.4M to $479.0M. The present value of the terminal value fell **30.2%**, from $1,517.8M to $1,059.8M — because it sits furthest out and is discounted by the largest power of (1 + r), and because r appears again in the (r − g) denominator of the terminal formula itself. Long-dated cash flows are where rate risk lives.`,
        },
        {
          kind: 'text',
          md: `**What to do with all this, given you cannot forecast it.** Three practices, none of which requires a macro view:

1. **Know your portfolio's rate sensitivity before you need to.** Re-run every DCF at r and r + 2 points. If the portfolio loses a quarter of its estimated value on a rate move that has happened repeatedly in living memory, that is a fact to know while calm rather than discover while falling.
2. **Read credit before equity.** When high-yield spreads widen materially while the equity market is still making highs, take the divergence seriously — bondholders are paid to worry about survival and equity holders are paid to hope.
3. **Separate the business question from the rate question.** "Is this a good business at a good price?" and "what will rates do?" are different questions, and only the first is one you can research. If a holding only works at a 7% discount rate, you do not own a business — you own a bet on rates.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "The yield curve inverted, so I should sell equities."**

Three problems, each sufficient on its own. The lag between inversion and recession has run from six to twenty-four months, so "sell now" can mean sitting out two years of gains. The signal is universally watched, so it is already in prices before you read about it. And equities frequently make their highs *after* an inversion — being right about the recession and wrong about the timing is indistinguishable from being wrong. Use the curve as one input to how much risk you are comfortable carrying, never as a trade instruction.`,
        },
        {
          kind: 'callout',
          md: `**The reason a rate rise feels like a fundamental problem is that it is one — for the valuation, not the business.** When rates rose sharply in 2022 and unprofitable growth companies fell 60–80%, the near-universal explanation was sentiment. The arithmetic above is the better explanation: those companies had the longest-duration cash flows in the market, and their fair values genuinely fell by very large amounts. Nothing about the businesses changed. The rate used to convert their distant cash flows into present value did.`,
        },
        {
          kind: 'keypoint',
          md: `Cycle phases are labelled after the fact — the NBER dates recessions a year or more late — so read instruments rather than phases: the yield curve (inverted before every recent US recession, but with a 6–24 month variable lag, a tiny sample, and universal attention) and credit spreads (roughly 300–400bp calm, above 800bp stressed; widening spreads with equities still rising is a genuine early warning). Macro enters valuation through one number: Meridian at r = 9% is worth $36.46, at r = 11% it is worth $26.78 — a 26.5% fall from a 2-point risk-free move with no business change, and the PV of terminal value carries the damage, falling 30.2% against 5.2% for the explicit years.`,
        },
      ],
      quiz: [
        {
          id: 'u14-l06-q1',
          prompt: 'Why are business cycle phases hard to use as a decision framework?',
          choices: [
            'The four phases occur in a fixed, predictable sequence of equal length',
            'They are labelled after the fact — the NBER dates recessions in retrospect, sometimes a year or more later — so the current phase is unknowable when you need it',
            'They apply only to manufacturing economies',
            'Central banks change the definitions each cycle',
          ],
          answerIdx: 1,
          explain:
            'A framework that takes the current phase as an input cannot supply that input in real time, which is why the modest claim — read credit spreads and the curve — is the usable one. The phases are not fixed in length or sequence either, but the dating problem alone is enough to disqualify the framework as a timing tool.',
        },
        {
          id: 'u14-l06-q2',
          prompt:
            'Meridian is worth $36.46 at r = 9% and $26.78 at r = 11%, from a 2-point rise in the risk-free rate. Where does the damage concentrate?',
          choices: [
            'In the present value of terminal value, which falls 30.2% while the explicit five years fall only 5.2%',
            'Evenly across all years of the forecast',
            'In the explicit five-year forecast, which is discounted first',
            'In the net debt bridge, which grows with rates',
          ],
          answerIdx: 0,
          explain:
            'Terminal value sits furthest out, so it is discounted by the largest power of (1+r), and r also appears in the (r − g) denominator of the terminal formula itself — a double effect. That is why long-duration assets are where rate risk lives, and why the total value fell 26.5% with no change to the business.',
        },
        {
          id: 'u14-l06-q3',
          prompt: 'What makes credit spreads a more responsive instrument than equity prices?',
          choices: [
            'Bonds trade more frequently than stocks',
            'Credit spreads are published daily by central banks',
            'Corporate bonds are risk-free and therefore price macro conditions cleanly',
            'Bondholders lose everything in a default, so they watch solvency obsessively — widening spreads while equities still rise is a genuine early warning',
          ],
          answerIdx: 3,
          explain:
            'Equity holders are paid to hope and bondholders are paid to worry about survival, so the credit market prices deterioration first. Roughly 300–400 basis points of high-yield spread signals calm and above 800 signals real stress, which makes the divergence readable rather than merely narrative.',
        },
        {
          id: 'u14-l06-q4',
          prompt: 'What is the practical response to knowing your portfolio is rate-sensitive?',
          choices: [
            'Sell long-duration holdings whenever the yield curve inverts',
            'Hedge the portfolio with interest-rate derivatives',
            'Re-run every DCF at r and r + 2 points so the exposure is known while calm, and separate the business question from the rate question',
            'Shift entirely into short-duration value stocks',
          ],
          answerIdx: 2,
          explain:
            'Knowing in advance that a rate move which has occurred repeatedly would cost a quarter of your estimated value is risk management that requires no forecast at all. If a holding only works at a 7% discount rate, you do not own a business — you own a bet on rates, and that is worth discovering before the rates move rather than after.',
        },
      ],
      cardSeeds: [
        {
          id: 'u14-l06-c1',
          kind: 'basic',
          front: 'Yield curve inversion: what it means and three reasons it is weaker than it sounds.',
          back: 'Short yields above long yields means bond markets expect lower future rates, usually implying weakness; it preceded every recent US recession. But the lag has run 6–24 months, the sample is a handful of recessions, and it is universally watched so it is already in prices. Equities often peak after an inversion.',
        },
        {
          id: 'u14-l06-c2',
          kind: 'cloze',
          front:
            'Meridian at r = 9% is worth ____ per share; at r = 11% it is worth ____ — a ____ fall from a 2-point rise in the ____ rate, with no change to the business.',
          back: '$36.46; $26.78; 26.5%; risk-free',
        },
        {
          id: 'u14-l06-c3',
          kind: 'basic',
          front: 'What are high-yield credit spreads telling you at 300–400bp versus above 800bp?',
          back: 'Roughly 300–400 basis points indicates calm conditions; above 800 indicates genuine stress. The readable signal is divergence: spreads widening materially while equities are still making highs means the market that gets paid to worry about solvency has started worrying.',
        },
      ],
    },

    // ── L07 ───────────────────────────────────────────────────────────────
    {
      id: 'u14-l07',
      unitId: 'u14',
      order: 7,
      title: 'Moats & Competitive Analysis',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Unit 5, Lesson 4 established that value is created only when **ROIC exceeds WACC**. Basic economics says that condition should not persist: a business earning 25% on capital in an open market attracts competitors until returns fall to the cost of capital.

**A moat is whatever prevents that.** It is not a quality of the product and not a quality of the management. It is a **structural reason competitors cannot copy the economics**, and the only evidence that one exists is a high ROIC that has *already survived* attack for years.

The five recognised sources:

| Source | Mechanism | Test |
|---|---|---|
| **Network effects** | Each user makes the product more valuable to every other user | Does a new entrant with a better product still fail for lack of users? |
| **Switching costs** | Leaving is expensive in money, time, risk, or retraining | What would a customer have to do, and what would it cost them, to leave? |
| **Cost advantage / scale** | Structurally lower unit costs — density, scale, process, or a unique resource | Could a competitor replicate the cost base with unlimited capital? |
| **Intangibles** | Brand, patents, regulatory licences | Do customers pay more for an identical physical product? |
| **Efficient scale** | The market profitably supports only one or two operators | Would a second entrant make the market unprofitable for both? |

**Porter's five forces, briefly**, as the diagnostic that surrounds the moat: rivalry among existing competitors, threat of new entrants, threat of substitutes, buyer power, and supplier power. A business with a moat is one where at least two of those forces are structurally weak — and note that **substitutes** and **buyer power** are the two that most often destroy an apparently strong position, because both operate from outside the competitor set you were watching.`,
        },
        {
          kind: 'example',
          md: `**The moat is the valuation.** Two businesses, each with **$500M** of invested capital, each earning **25% ROIC** today, each with an **8% WACC**. Identical on every current metric.

The difference is how long the excess return survives. **Economic profit = invested capital x (ROIC − WACC)**, so year 1 is 500 x (0.25 − 0.08) = **$85M** for both.

| | Company A (wide moat) | Company B (no moat) |
|---|---|---|
| ROIC fade | 25% → 15% over **15 years** | 25% → 8% over **5 years** |
| Year-1 economic profit | $85M | $85M |
| Final-year economic profit | $35M (year 15) | $0M (year 5) |
| **PV of economic profit at 8%** | **$556.5M** | **$182.7M** |

**Company A's excess returns are worth 3.05 times Company B's** — from businesses that are indistinguishable in every current-year ratio you could compute. A screen (Unit 13, Lesson 3) sees them as the same company. A DCF sees them as the same company unless you *deliberately* encoded a different fade path.

**This is why competitive analysis is not a soft supplement to the numbers.** The fade rate is an input to your model, it is worth three times the answer, and no financial statement contains it. It comes from understanding why customers stay.`,
        },
        {
          kind: 'text',
          md: `**Moat erosion — the signs, in the order they usually appear.** A moat rarely collapses; it leaks, and the leaks show in this sequence:

| # | Sign | Where you see it |
|---|---|---|
| 1 | **Gross margin drifting down** | The first place pricing power dies (Units 3, 5) |
| 2 | **Rising customer acquisition cost** | Sales and marketing growing faster than revenue |
| 3 | **Falling retention or net revenue retention** | Disclosed metrics, or churn discussed in the MD&A |
| 4 | **Growth becoming price-led rather than volume-led** | Revenue up, units flat |
| 5 | **Market share slipping in the fastest-growing segment** | Often masked by growth in a declining segment |
| 6 | **A patent cliff or expiring licence** | Footnotes and risk factors |
| 7 | **The distribution channel changing** | The most dangerous, because it invalidates the moat rather than eroding it |

Sign 1 is the one to watch hardest, because it is quantitative, published quarterly, and almost always leads the rest. **A business with a genuine moat should be able to raise prices with inflation and lose no customers.** A gross margin that will not hold through an inflationary period is telling you the moat is narrower than the story.

**Applying this to Vantage Diagnostics** (Unit 13): the claimed moat is a switching cost. The test is not "customers seem happy" but "what exactly would a hospital lab have to do to switch?" — revalidate a new instrument under its accreditation, retrain staff, run parallel testing, and accept clinical risk during the transition. That is a specific, expensive, months-long process, which is why the 60.0% gross margin has held and risen. **A moat you can describe as a procedure is real; a moat you can only describe as a reputation is a hope.**`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "This company has a great product, so it has a moat."**

Product quality is not a moat — it is an invitation. Better products are copied constantly, and the graveyard of superior technologies beaten by inferior ones with better distribution is very large. The moat question is never "is this good?" but "**what stops a competitor with equal capital and talent from taking these customers?**" If the honest answer is "nothing except that our product is better", the excess returns have a fade path measured in a few years, and your model should say so.`,
        },
        {
          kind: 'callout',
          md: `**Moats are sometimes worth less than they appear because management spends them.** A business generating a 25% ROIC produces cash that has to go somewhere. If it is reinvested into the moated business, wonderful. If it is spent acquiring unmoated businesses at high prices, the consolidated ROIC falls toward the cost of capital by a different route — capital allocation rather than competition (Lesson 8 shows the arithmetic). Check what the excess cash has actually been doing for five years before you credit the moat with a long fade.`,
        },
        {
          kind: 'keypoint',
          md: `A moat is a structural reason competitors cannot copy the economics — network effects, switching costs, cost advantage/scale, intangibles, efficient scale — and the only evidence one exists is a high ROIC that has already survived attack. The moat IS the valuation: two businesses at $500M of capital, 25% ROIC and 8% WACC produce $85M of economic profit in year 1, but a 15-year fade to 15% is worth $556.5M of present value against $182.7M for a 5-year fade to 8% — 3.05x, from companies identical on every current ratio. Watch erosion in order, starting with gross margin. A moat you can describe as a procedure is real; one you can only describe as a reputation is a hope.`,
        },
      ],
      quiz: [
        {
          id: 'u14-l07-q1',
          prompt: 'What is a moat, precisely?',
          choices: [
            'A structural reason competitors cannot copy the economics, evidenced by a high ROIC that has already survived years of attack',
            'A product that customers prefer to the alternatives',
            'A management team with a strong track record',
            'A large market share in a growing industry',
          ],
          answerIdx: 0,
          explain:
            'Competition should drive returns toward the cost of capital, so a moat is whatever prevents that — and since the claim is about durability, the only evidence is persistence that has already been tested. Product preference, management quality and market share are all things a well-funded competitor can attack directly.',
        },
        {
          id: 'u14-l07-q2',
          prompt:
            'Two companies each have $500M of capital, 25% ROIC and an 8% WACC. A fades to 15% over 15 years, B to 8% over 5. What are their excess returns worth?',
          choices: [
            'The same, since both start at $85M of economic profit',
            'B is worth more, because its returns are realised sooner',
            'A is worth about twice B',
            'A is worth $556.5M against B at $182.7M — about 3.05 times as much',
          ],
          answerIdx: 3,
          explain:
            'Both produce 500 x (0.25 − 0.08) = $85M in year one, but A keeps earning excess returns for fifteen years while B\'s reach zero in five, and discounting at 8% gives $556.5M against $182.7M. The two businesses are indistinguishable on every current-year ratio, which is why the fade rate — an input no financial statement contains — carries three times the answer.',
        },
        {
          id: 'u14-l07-q3',
          prompt: 'Which sign of moat erosion should be watched hardest, and why?',
          choices: [
            'Gross margin drifting down — it is quantitative, published quarterly, and almost always leads the other signs',
            'Market share loss, because it is the most direct measure of competition',
            'A patent cliff, because it is the most severe',
            'Rising customer acquisition cost, because it appears earliest',
          ],
          answerIdx: 0,
          explain:
            'Gross margin is where pricing power dies first and it arrives every quarter without needing to be inferred, whereas share data is lagged and often masked by segment mix. A business with a genuine moat should raise prices with inflation and lose no customers, so a margin that will not hold is telling you the moat is narrower than the story.',
        },
        {
          id: 'u14-l07-q4',
          prompt: 'How should you test a claimed switching-cost moat, using Vantage Diagnostics as the example?',
          choices: [
            'Ask what a customer would specifically have to do to leave — revalidate the instrument under accreditation, retrain staff, run parallel testing, accept clinical risk',
            'Check whether customer satisfaction surveys are positive',
            'Confirm that the company has few competitors',
            'Verify that revenue has grown for five consecutive years',
          ],
          answerIdx: 0,
          explain:
            'A switching cost is only real if it can be described as a concrete, expensive, time-consuming procedure the customer must undertake — which is what has kept Vantage\'s gross margin at 60.0% and rising. Satisfaction, competitor counts and revenue growth are all consistent with a business that customers could leave tomorrow at no cost.',
        },
        {
          id: 'u14-l07-q5',
          prompt: 'How can a genuine moat still fail to produce value for shareholders?',
          choices: [
            'The moat causes regulators to intervene and cap returns',
            'Wide moats always attract short sellers who depress the price',
            'Moated businesses cannot grow, so the excess return never compounds',
            'Management spends the excess cash acquiring unmoated businesses at high prices, pulling consolidated ROIC toward the cost of capital',
          ],
          answerIdx: 3,
          explain:
            'A 25% ROIC generates cash that must be deployed somewhere, and deploying it into businesses that earn below the cost of capital destroys value through capital allocation rather than through competition. That is why you check what the excess cash has actually done for five years before crediting the moat with a long fade.',
        },
      ],
      cardSeeds: [
        {
          id: 'u14-l07-c1',
          kind: 'cloze',
          front:
            'The five sources of moat: ____ effects, ____ costs, ____ advantage or scale, ____ such as brand and patents, and ____ scale.',
          back: 'network; switching; cost; intangibles; efficient',
        },
        {
          id: 'u14-l07-c2',
          kind: 'basic',
          front: 'Show why the fade rate matters more than the current ROIC.',
          back: 'Two companies with $500M of capital, 25% ROIC and 8% WACC both earn $85M of economic profit in year 1. A 15-year fade to 15% has a present value of $556.5M; a 5-year fade to 8% is worth $182.7M — 3.05x apart from businesses identical on every current-year ratio. The fade rate is an input no statement contains.',
        },
        {
          id: 'u14-l07-c3',
          kind: 'basic',
          front: 'List the moat erosion signs in the order they typically appear.',
          back: '1. Gross margin drifting down. 2. Rising customer acquisition cost. 3. Falling retention. 4. Growth turning price-led rather than volume-led. 5. Share loss in the fastest-growing segment. 6. Patent cliff or expiring licence. 7. The distribution channel changing — the most dangerous, because it invalidates rather than erodes.',
        },
        {
          id: 'u14-l07-c4',
          kind: 'basic',
          front: 'The test that separates a real moat from a story.',
          back: '"What stops a competitor with equal capital and talent from taking these customers?" A moat you can describe as a procedure — revalidate the instrument, retrain staff, run parallel testing, accept clinical risk — is real. A moat you can only describe as a reputation is a hope, and product quality is an invitation rather than a barrier.',
        },
      ],
    },

    // ── L08 ───────────────────────────────────────────────────────────────
    {
      id: 'u14-l08',
      unitId: 'u14',
      order: 8,
      title: 'Reading Conference Calls & Filings',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Everything a public company says is drafted, reviewed by lawyers, and optimised. That does not make it uninformative — it makes it informative in a particular way. **What management chooses to emphasise, avoid, and change is data.**

**Language patterns worth noticing on a call:**

| Pattern | What it often indicates |
|---|---|
| Passive voice arriving with bad news ("inventory was allowed to build") | Distancing from a decision someone made |
| The highlighted metric changing between quarters | The previous metric stopped flattering |
| Vague externalities: "headwinds", "choppy", "macro environment" | An explanation that cannot be checked or falsified |
| Refusing to quantify something previously quantified | The number moved the wrong way |
| Irritation or evasion toward a specific analyst | Usually the analyst asking the right question |
| A new non-GAAP adjustment appearing | An expense has become inconvenient (Units 3, 5) |

**Read the Q&A section, not the prepared remarks.** The prepared statement is a written document that has been through legal review. The Q&A is management answering questions they did not choose, and the difference in specificity between the two halves of the same call is frequently the most informative thing in it.

**And note who is asking.** When an analyst returns to the same question three times, or when several analysts converge on one topic unprompted, that topic is where the professional community's doubt is concentrated — free information about the actual bear case.`,
        },
        {
          kind: 'text',
          md: `**Guidance games.** Guidance is a forecast management controls, issued to an audience it is judged by. That creates predictable behaviour.

- **Sandbagging.** Guide conservatively, beat the guidance, repeat. Produces long streaks of "beats" containing no information (Unit 13, Lesson 6). Detection: if the company has beaten guidance every quarter for three years, guidance is a floor, not a forecast.
- **Beat and lower.** Report a strong quarter while quietly cutting the full-year outlook. The headline is the beat; the substance is the cut, and the stock reaction usually tracks the cut.
- **Metric migration.** Guiding on revenue in good years and on "adjusted EBITDA" in bad ones. Track which metric is being guided *over time*; the switch is the signal.
- **Withdrawing guidance.** Sometimes genuinely warranted in a crisis. Otherwise it means management no longer trusts its own forecast, which is worth more than any number they could have published.

**The footnotes that repay reading**, in rough order of how often they matter:

1. **Revenue recognition** — when revenue is booked relative to when cash and obligations arrive.
2. **Segment reporting** — profitability by division. Consolidated margins routinely hide one excellent business subsidising one bad one.
3. **Debt maturity schedule** — what is due, when, and at what rate. A refinancing wall two years out at rates far above the existing coupon is a knowable future problem (Unit 4, Lesson 4).
4. **Stock-based compensation** — the real cost, before any non-GAAP adjustment removes it (Unit 7, Lesson 9).
5. **Leases** — obligations that behave exactly like debt.
6. **Related-party transactions** — small, rarely material, and disproportionately informative about governance.
7. **Critical audit matters** — the auditor stating which estimates were hardest to verify, which is a direct pointer at where the numbers are softest.`,
        },
        {
          kind: 'example',
          md: `**The proxy statement predicts capital allocation.** Executive compensation (DEF 14A) tells you what management is paid to maximise, and what management is paid to maximise is what management will do.

A CEO's annual bonus is weighted **70% to adjusted EBITDA growth** and **30% to revenue growth**. No return metric. No per-share metric. Now watch what that incentivises.

**Before the deal:**

| | Value |
|---|---|
| EBITDA | $750M |
| Depreciation and amortisation | $150M |
| EBIT | $600M |
| NOPAT at a 25% tax rate | $450M |
| Invested capital | $3,000M |
| **ROIC** | **15.0%** |

**The acquisition:** pay **$1,200M** for a business with **$150M** of EBITDA, **$30M** of D&A, therefore **$120M** of EBIT and **$90M** of NOPAT.

- **Return on the deal:** 90 / 1,200 = **7.5%**, against a WACC of 8.5%. The acquisition destroys value on day one.

**After the deal:**

| | Value | Change |
|---|---|---|
| EBITDA | $900M | **+20.0%** — bonus target comfortably cleared |
| NOPAT | $540M | +20.0% |
| Invested capital | $4,200M | +40.0% |
| **ROIC** | **12.9%** | **−2.1 points** |

**The CEO is paid in full for a transaction that made shareholders poorer.** EBITDA grew 20%, revenue grew, every headline improved, and the return on capital fell from 15.0% to 12.9% because $1,200M was deployed at 7.5% against an 8.5% cost.

**This is knowable in advance from the proxy.** A compensation plan built on size metrics with no return or per-share test predicts an acquisitive, dilutive company. Reading a proxy takes twenty minutes and forecasts years of capital allocation.`,
        },
        {
          kind: 'text',
          md: `**Insider transactions (Form 4).** Filed within two business days, public, free.

**Buys and sales are not symmetric, and this is the whole point.** An executive sells for many reasons — diversification, a house, a divorce, taxes on vesting equity, or a pre-scheduled 10b5-1 plan set up months earlier. A single sale is close to meaningless.

An executive **buys** for one reason.

What raises the signal from a buy:

- **Clusters.** Three or more insiders buying within a short window.
- **Role.** The CEO and CFO see the numbers first; a non-executive director may not.
- **Size relative to their compensation**, not in absolute dollars. A $200,000 purchase by someone earning $8M is a gesture; the same amount by someone earning $400,000 is a conviction.
- **Open-market purchases**, distinct from option exercises or grant vesting.
- **Timing** — buying into a decline is more informative than buying into strength.

**The honest limits.** Insiders are frequently wrong about their own stock, and they are systematically early. The cluster-buy signal is one weak input among many, not a thesis — and it belongs in the same category as everything else in this lesson: a way of adding texture to research you have already done yourself.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Reading a conference call transcript means checking whether they beat estimates."**

The beat is in the press release and is usually the least informative fact available (Unit 13, Lesson 6). The transcript is worth reading for what the press release cannot contain: which metric management emphasised this quarter versus last, which questions received specific numbers and which received adjectives, whether analysts kept circling one topic, and how the language changed. That is qualitative data you can only get by reading, and it is why professionals read transcripts rather than headlines.`,
        },
        {
          kind: 'callout',
          md: `**A pattern only exists across time.** No single call, footnote, or Form 4 supports a conclusion — everything in this lesson works by **comparison against the same company\'s previous disclosures**. One quarter of "headwinds" is a word; four consecutive quarters of "headwinds" while the highlighted metric changes twice is a pattern. Keep the last four transcripts and the last three proxies; the signal lives in the differences between them, not in any one document.`,
        },
        {
          kind: 'keypoint',
          md: `Read the Q&A rather than the prepared remarks, and track what management emphasises, avoids, and changes across quarters — passive voice on bad news, migrating metrics, unfalsifiable externalities, new non-GAAP adjustments. Guidance games: sandbagging (three years of beats means guidance is a floor), beat-and-lower, metric migration, withdrawal. Footnotes in priority order: revenue recognition, segments, debt maturities, SBC, leases, related parties, critical audit matters. The proxy predicts capital allocation — a bonus 70% weighted to EBITDA growth buys $150M of EBITDA for $1,200M (a 7.5% return against an 8.5% WACC), grows EBITDA 20.0%, pays the bonus, and cuts ROIC from 15.0% to 12.9%. Insider buys are informative in clusters; sales are noise.`,
        },
      ],
      quiz: [
        {
          id: 'u14-l08-q1',
          prompt: 'Why is the Q&A section of a conference call more informative than the prepared remarks?',
          choices: [
            'It is the only part that is recorded and transcribed',
            'Prepared remarks are legally required to omit forward-looking statements',
            'The prepared statement is a legally reviewed document, while the Q&A is management answering questions they did not choose — and the gap in specificity between the two is itself the signal',
            'Analysts are given the questions in advance, so the answers are more accurate',
          ],
          answerIdx: 2,
          explain:
            'Management controls every word of the prepared section and controls none of the questions, so any difference in precision between the two halves of the same call is data. Which topics analysts return to repeatedly also reveals where professional doubt is concentrated, which is a free map of the bear case.',
        },
        {
          id: 'u14-l08-q2',
          prompt:
            'A company buys $150M of EBITDA for $1,200M. Its NOPAT rises from $450M to $540M and invested capital from $3,000M to $4,200M. What happened?',
          choices: [
            'ROIC fell from 15.0% to 12.9% because $1,200M was deployed at a 7.5% return against an 8.5% WACC — EBITDA grew 20.0% while value was destroyed',
            'ROIC rose because both NOPAT and EBITDA increased',
            'The deal was value-neutral since EBITDA and capital both grew',
            'ROIC is unaffected by acquisitions, since goodwill is excluded from invested capital',
          ],
          answerIdx: 0,
          explain:
            'The deal itself earns 90 / 1,200 = 7.5%, below the 8.5% cost of capital, so it dilutes the existing 15.0% return down to 540 / 4,200 = 12.9%. Every headline metric improved, which is exactly why a bonus weighted to EBITDA growth pays out in full on a transaction that made shareholders poorer.',
        },
        {
          id: 'u14-l08-q3',
          prompt: 'Why are insider purchases more informative than insider sales?',
          choices: [
            'Purchases must be disclosed while sales need not be',
            'Insiders are legally prohibited from selling on negative information',
            'Executives sell for many reasons — diversification, taxes, pre-scheduled plans, a house — while they buy for one, so a cluster of open-market buys by executives carries signal a sale does not',
            'Purchases are always larger than sales in dollar terms',
          ],
          answerIdx: 2,
          explain:
            'A single sale is close to meaningless because so many non-informational motives produce one, whereas an open-market purchase costs the executive their own cash. The signal strengthens with clusters, seniority, size relative to the insider\'s compensation, and buying into weakness — though insiders are frequently wrong and systematically early.',
        },
        {
          id: 'u14-l08-q4',
          prompt: 'What does a proxy statement let you forecast?',
          choices: [
            'Capital allocation behaviour — a bonus plan weighted to size metrics with no return or per-share test predicts an acquisitive, dilutive company',
            'The next quarter\'s revenue guidance',
            'Whether the auditor intends to resign',
            'The timing of the next dividend increase',
          ],
          answerIdx: 0,
          explain:
            'Management maximises what management is paid to maximise, so the metrics in the bonus plan predict years of decisions. Twenty minutes reading a compensation table gives you a forecast that no amount of analysis of a single quarter can.',
        },
      ],
      cardSeeds: [
        {
          id: 'u14-l08-c1',
          kind: 'basic',
          front: 'Six language patterns worth noticing on a conference call.',
          back: 'Passive voice arriving with bad news; the highlighted metric changing between quarters; unfalsifiable externalities ("headwinds", "choppy"); refusing to quantify something previously quantified; irritation toward a specific analyst (usually the one asking the right question); a new non-GAAP adjustment appearing.',
        },
        {
          id: 'u14-l08-c2',
          kind: 'cloze',
          front:
            'The seven footnotes that repay reading: ____ recognition, ____ reporting, ____ maturity schedule, ____ compensation, ____, ____-party transactions, and critical ____ matters.',
          back: 'revenue; segment; debt; stock-based; leases; related; audit',
        },
        {
          id: 'u14-l08-c3',
          kind: 'basic',
          front: 'How does a compensation plan predict value destruction? Give the worked case.',
          back: 'A bonus 70% weighted to adjusted EBITDA growth with no return metric buys $150M of EBITDA for $1,200M — a 7.5% return against an 8.5% WACC. EBITDA rises 20.0% and the bonus pays in full, while ROIC falls from 15.0% (450/3,000) to 12.9% (540/4,200). Knowable in advance from the proxy.',
        },
      ],
    },

    // ── L09 ───────────────────────────────────────────────────────────────
    {
      id: 'u14-l09',
      unitId: 'u14',
      order: 9,
      title: 'Special Situations',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**Special situations** are events where a share price is being moved by something other than a change in the value of the business — a corporate action, a forced flow, or a structural constraint on who is allowed to hold the stock. **These are described here so you can recognise them, not because they are recommended.** Most are played by full-time specialists with better information and lower costs, and several of them have payoff shapes that punish an ordinary participant severely.

**Spin-offs.** A parent separates a division into an independently listed company and distributes its shares to existing holders. Three structural forces act at once:

1. **Forced selling.** Index funds tracking a large-cap benchmark cannot hold a small spun-off stub and must sell it, regardless of price. Many active funds have mandates that also exclude it.
2. **Nobody covers it.** The stub arrives with no analyst coverage, no earnings history as a standalone entity, and no investor base.
3. **Management incentives reset.** Executives who ran a division inside a conglomerate now run a company with its own stock and its own compensation plan.

Cusatis, Miles and Woolridge (1993) documented significant outperformance by spin-offs in the years following separation, and the finding became widely known. **The honest caveat is Lesson 5's**: an anomaly this famous has been traded for three decades, and the easy version is gone. The structural forces are still real; the free money is not.

**The dangerous version.** Parents sometimes use a spin-off to dispose of a declining business loaded with debt and pension obligations. Read the Form 10 registration statement — particularly the capital structure and any obligations transferred — before treating "spin-off" as a category rather than a specific company.`,
        },
        {
          kind: 'example',
          md: `**Buybacks: a value transfer whose direction depends entirely on price.**

A company has **100M shares** at **$20.00** ($2,000M market cap) and spends **$200M** repurchasing **10M shares**, leaving **90M**.

**If intrinsic value is $30.00 per share** ($3,000M total):

- Value remaining after the cash goes out: 3,000 − 200 = $2,800M
- Value per remaining share: 2,800 / 90 = **$31.11**
- Continuing holders gained **$1.11 per share, +3.7%** — transferred from the sellers, who accepted $20 for something worth $30.

**If intrinsic value is $14.00 per share** ($1,400M total):

- Value remaining: 1,400 − 200 = $1,200M
- Value per remaining share: 1,200 / 90 = **$13.33**
- Continuing holders **lost $0.67 per share, −4.8%** — transferred to the sellers, who received $20 for something worth $14.

**Same buyback. Same share count reduction. Opposite outcomes.** A repurchase is not shareholder-friendly by nature; it is a capital allocation decision that is good below intrinsic value and bad above it, exactly like any other purchase.

**Which makes the useful signal narrower than the headline.** What tells you something is a buyback executed **aggressively into a decline** — a management team that estimated value, found the price below it, and acted. What tells you very little is a standing authorisation (an authorisation is permission, not a purchase), or steady repurchases that merely offset stock compensation, which is dilution management rather than capital return. Check the actual dollars spent in the cash flow statement against the change in share count (Unit 4).`,
        },
        {
          kind: 'text',
          md: `**Three more, briefly, with their honest limitations.**

**Insider cluster buys.** Covered in Lesson 8. Three or more executives buying with their own money in the open market within a short window, into weakness, is one of the more informative freely available signals — and it is still a weak one, because insiders are frequently wrong and systematically early.

**Index inclusion.** A stock added to a major index is bought by every fund tracking it, on a known date, in a known size. This once produced a reliable pre-announcement run-up. It has decayed substantially: the event is anticipated by specialists, the effect is largely front-run, and much of the price move now reverses after the index funds have finished. A textbook case of an anomaly consumed by the people who read about it.

**Merger arbitrage.** After an acquisition is announced, the target trades below the offer price. The gap is payment for two risks: that the deal breaks, and that closing takes time.`,
        },
        {
          kind: 'example',
          md: `**Merger arbitrage — why the payoff shape is the whole story.**

An acquirer offers **$52.00 cash** per share. The target, which traded at **$38.00** before the announcement, now trades at **$50.00**. The deal is expected to close in **four months**.

| | Value |
|---|---|
| Gross spread | 52.00 − 50.00 = **$2.00** |
| Return if it closes | 2.00 / 50.00 = **4.0%** |
| Annualised (four months) | 4.0% x 3 = **12.0%** |
| Loss if the deal breaks | 50.00 − 38.00 = **−$12.00**, or **−24.0%** |

**The break-even probability.** For the expected value to be zero:

p x 2.00 − (1 − p) x 12.00 = 0 → 14p = 12 → **p = 85.7%**

**You must be right more than 85.7% of the time simply to break even.** And you are estimating that probability against antitrust review, financing conditions, shareholder votes, regulatory approval in multiple jurisdictions, and material adverse change clauses — assessed by law firms whose specialists do nothing else.

**The shape of this payoff is what matters, and it generalises far beyond merger arbitrage.** Small frequent gains against rare large losses feels wonderful right up until it does not: a long, satisfying record of 4% wins followed by one 24% loss erases six wins. Strategies with this profile are extremely popular with individuals precisely because the win rate is high, and the win rate is the least relevant statistic about them.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Special situations are lower risk because the outcome is driven by a corporate event rather than by the market."**

Event-driven does not mean low-risk; it means the risk is **concentrated into a binary outcome on a known date** and is largely uncorrelated with your other holdings, which is a different property entirely. A merger arbitrage position is not a safe 4% — it is an 85.7%-or-better probability bet with a 24% downside. Specialists play these games with dedicated legal analysis, diversification across dozens of simultaneous deals, and cost structures you do not have. **Recognise these situations to understand why a price is behaving strangely; that is the appropriate use of this material.**`,
        },
        {
          kind: 'callout',
          md: `**The one durable idea underneath all of these is forced or constrained flow.** Index funds must sell a spun-off stub; index funds must buy an included name; arbitrageurs must hedge; funds must sell a stock that falls out of their mandate. When someone is transacting because a rule requires it rather than because they think the price is right, a price can detach from value for a while. That mechanism is real and permanent even though every specific strategy built on it has been competed down — and noticing it is what lets you understand a price move that has no news attached.`,
        },
        {
          kind: 'keypoint',
          md: `Special situations arise from forced or constrained flow, not from changes in business value — index funds must sell a spun-off stub, must buy an included name, mandates force sales. Buybacks are a value transfer whose direction depends on price: $200M repurchasing 10M of 100M shares moves value per remaining share from $30.00 to $31.11 (+3.7%) if intrinsic value is $30, but from $14.00 to $13.33 (−4.8%) if it is $14. Merger arbitrage on a $52 offer with the target at $50 and a $38 break price pays 4.0% (12.0% annualised) against a 24.0% loss, requiring an 85.7% close probability to break even — small frequent gains against rare large losses, where the win rate is the least relevant statistic. These are specialists' games: recognise them, do not attempt them.`,
        },
      ],
      quiz: [
        {
          id: 'u14-l09-q1',
          prompt: 'What structural forces act on a newly spun-off company?',
          choices: [
            'Mandatory lock-up periods prevent any trading for six months',
            'Forced selling by index funds that cannot hold the small stub, no analyst coverage or standalone history, and reset management incentives',
            'Regulatory requirements that the stub trade at a discount to the parent',
            'Guaranteed inclusion in small-cap indices on the first day of trading',
          ],
          answerIdx: 1,
          explain:
            'Benchmark-tracking funds must sell a stub they are not mandated to hold regardless of price, the new entity arrives with no coverage or investor base, and executives suddenly have their own stock and compensation plan. Cusatis, Miles and Woolridge (1993) documented outperformance from this setup, though three decades of attention have removed the easy version.',
        },
        {
          id: 'u14-l09-q2',
          prompt:
            'A company with 100M shares at $20.00 spends $200M buying back 10M shares. Intrinsic value is $14.00 per share. What happens to continuing holders?',
          choices: [
            'They gain, because the share count fell by 10%',
            'Nothing changes, since cash and shares both decreased',
            'They lose — value per remaining share falls from $14.00 to $13.33, a 4.8% transfer to the selling shareholders',
            'They lose exactly the $200M spent, spread across 90M shares',
          ],
          answerIdx: 2,
          explain:
            'Total value falls from $1,400M to $1,200M and is spread over 90M shares, giving $13.33 against the $14.00 it was worth before. Paying $20 for something worth $14 transfers value to whoever sold, which is why a buyback is good below intrinsic value and bad above it — exactly like any other purchase.',
        },
        {
          id: 'u14-l09-q3',
          prompt: 'Which buyback pattern is genuinely informative?',
          choices: [
            'Repurchases executed aggressively into a price decline, showing management estimated value and found the price below it',
            'A large repurchase authorisation announced by the board',
            'Steady quarterly repurchases that offset stock-based compensation',
            'A buyback funded by new debt issuance',
          ],
          answerIdx: 0,
          explain:
            'Buying heavily while the price falls is the observable behaviour of a management team acting on a value estimate, which is the only version that transfers value to continuing holders. An authorisation is permission rather than a purchase, and repurchases that merely offset dilution are dilution management, not capital return — check dollars spent in the cash flow statement against the actual change in share count.',
        },
        {
          id: 'u14-l09-q4',
          prompt:
            'A $52.00 cash offer, target at $50.00, pre-deal price $38.00. What probability of closing is needed to break even?',
          choices: [
            '50.0%',
            '85.7%',
            '75.0%',
            '96.0%',
          ],
          answerIdx: 1,
          explain:
            'The gain is $2.00 and the loss on a break is $12.00, so p x 2 = (1 − p) x 12 gives 14p = 12 and p = 85.7%. That probability must be estimated against antitrust review, financing, shareholder votes and multi-jurisdiction approvals, assessed by law firms whose specialists do nothing else.',
        },
        {
          id: 'u14-l09-q5',
          prompt:
            'What generalisable lesson does the merger arbitrage payoff shape teach?',
          choices: [
            'Event-driven strategies are uncorrelated with markets and therefore safer',
            'Annualising a four-month return by multiplying by three overstates it',
            'Strategies of small frequent gains against rare large losses feel excellent until one loss erases six wins — the high win rate is the least relevant statistic',
            'Cash offers are always safer than stock offers',
          ],
          answerIdx: 2,
          explain:
            'A long satisfying record of 4% wins is wiped out by a single 24% break, and this shape appears far beyond merger arbitrage — it is what makes such strategies popular with individuals for precisely the wrong reason. Low correlation is a real property but it describes where the risk sits, not how large it is.',
        },
      ],
      cardSeeds: [
        {
          id: 'u14-l09-c1',
          kind: 'basic',
          front: 'What is the single durable idea underneath all special situations?',
          back: 'Forced or constrained flow. Index funds must sell a spun-off stub and must buy an included name; mandates force sales; arbitrageurs must hedge. When someone transacts because a rule requires it rather than because they think the price is right, price can detach from value. Every specific strategy built on it has been competed down; the mechanism has not.',
        },
        {
          id: 'u14-l09-c2',
          kind: 'cloze',
          front:
            'A $200M buyback of 10M of 100M shares takes value per remaining share to ____ if intrinsic value is $30 (a gain of ____) and to ____ if intrinsic value is $14 (a loss of ____).',
          back: '$31.11; +3.7%; $13.33; −4.8%',
        },
        {
          id: 'u14-l09-c3',
          kind: 'basic',
          front: 'Merger arb: $52 offer, target at $50, $38 pre-deal. Run the numbers.',
          back: 'Gain $2.00 = 4.0%, annualised 12.0% over four months. Break loss $12.00 = −24.0%. Break-even probability: 14p = 12, so p = 85.7%. You must be right more than 85.7% of the time simply to break even — against antitrust, financing, votes and multi-jurisdiction approvals.',
        },
        {
          id: 'u14-l09-c4',
          kind: 'basic',
          front: 'Why is "event-driven" not the same as "low risk"?',
          back: 'The risk is concentrated into a binary outcome on a known date and is largely uncorrelated with other holdings — a different property, not a smaller one. Merger arb is not a safe 4%; it is an 85.7%-or-better bet with a 24% downside, played by specialists with legal analysis and dozens of simultaneous deals.',
        },
      ],
    },

    // ── L10 ───────────────────────────────────────────────────────────────
    {
      id: 'u14-l10',
      unitId: 'u14',
      order: 10,
      title: 'Alternative Assets Context',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Everything in this curriculum so far has been about equities. This lesson describes four other asset classes so that you can understand what they are and how they behave alongside stocks. **It advocates for none of them, and it is not a recommendation to hold any.** The framing throughout is the same: what generates the return, what the honest risks are, and how it correlates with what you already own.

**Bonds.** A loan. You lend a fixed principal, receive fixed coupons, and get the principal back at maturity. Return comes from the coupon plus any change in price.

- **Prices move inversely to yields.** A bond paying 3% is worth less when new bonds pay 5%, because a buyer can get the better deal elsewhere.
- **Duration** measures that sensitivity: a bond with a duration of **8.5** loses roughly **8.5%** of its price for a 1-point rise in yields, and gains similarly when yields fall. This is the same mathematics as Unit 13, Lesson 5 — a bond is just a very predictable set of future cash flows being discounted.
- **The risks are specific and nameable:** interest rate risk (duration), credit risk (the borrower defaults), and inflation risk (fixed coupons buy less over time).
- **They are not "safe" in a simple sense.** A long-duration government bond can lose 20%+ when rates rise sharply, as holders discovered in 2022.

**REITs.** Companies owning income-producing real estate, required to distribute most of their taxable income. They are stocks legally, and real estate economically.

- Judged on **funds from operations (FFO)**, not EPS, because property depreciation is a large non-cash charge that understates earnings (Unit 5, Lesson 10 flagged exactly this kind of industry adaptation).
- High leverage is normal and structural, which makes them **rate-sensitive from both directions**: rising rates raise their borrowing costs and raise the yield investors demand from them.
- Correlation with equities is high — historically in the region of 0.6 to 0.7 — so the diversification is real but partial.`,
        },
        {
          kind: 'text',
          md: `**Gold.** A commodity with no cash flows, no earnings, and no ability to reinvest.

- **You cannot value it with any tool in this curriculum.** Every method from Units 6 and 7 requires cash flows, and gold has none. Its price is entirely what someone else will pay.
- The case made for it rests on being a monetary asset with a fixed supply that behaves differently in inflationary or currency-crisis conditions. The counter-case is that it produced very poor real returns over long stretches — the two decades from 1980 to 2000 are the standard example — and pays nothing while you wait.
- Correlation with equities is low, historically near zero, which is the entire diversification argument for it. That is a genuine property and it is separate from the question of expected return.

**Crypto assets.** A short history, extreme volatility, and no cash flows.

- Honest framing on all three: annualised volatility has frequently run **60–100%**, several multiples of equities, with drawdowns exceeding 70% occurring more than once.
- **The history is too short to establish anything statistically.** Lesson 5's arithmetic applies with total force — a decade of data cannot distinguish a real return premium from noise, let alone in an asset this volatile.
- The diversification claim has **weakened**: correlation with risk assets has generally risen since 2020, meaning it has increasingly fallen when equities fall — the opposite of what a diversifier is supposed to do.
- **There is no valuation method here either.** If you cannot state what produces a return other than a higher price later, you are in Unit 1, Lesson 1 territory, and the position size should reflect that honestly.

**No part of this is advocacy.** These descriptions exist so that when someone tells you an asset is "a hedge" or "digital gold", you can ask the two questions that matter: *what generates the return?* and *what is the correlation, measured recently rather than in the era the claim comes from?*`,
        },
        {
          kind: 'example',
          md: `**Why correlation, not the asset, does the work.**

Two assets, each with an **8%** expected return and **16%** volatility. Hold them 50/50 and vary only the correlation between them:

| Correlation | Portfolio volatility | Reduction vs 16% |
|---|---|---|
| 0.0 | **11.31%** | **−29.3%** |
| 0.3 | 12.90% | −19.4% |
| 0.7 | 14.75% | −7.8% |
| 1.0 | 16.00% | 0% |

Same expected return in every row — **8%** — with volatility ranging from 11.31% to 16.00%. **The diversification benefit comes entirely from the correlation, not from the second asset being interesting.**

**Two honest observations that follow.**

First, **correlations are not stable, and they rise in crises.** Assets that look uncorrelated in calm markets frequently move together when everything is being sold at once, which is precisely when the diversification was supposed to help. Historical correlation is a weaker guarantee than it looks.

Second, and more important: **adding an asset with a lower expected return lowers your expected return.** If the second asset returns 4% rather than 8%, a 50/50 mix expects 6.0%, and the volatility reduction has to be worth those two points to you. That trade-off — real return given up for real volatility reduction — is the only honest way to frame an allocation decision, and it is entirely a question about your circumstances rather than about the asset.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Uncorrelated means safe."**

Uncorrelated means it moves independently of your other holdings, which says nothing whatever about how much it moves on its own. An asset with 80% annualised volatility and zero correlation to your equities still has 80% volatility, and a large enough position in it will dominate your portfolio\'s risk no matter how elegantly it diversifies. Correlation describes the *relationship*; volatility describes the *magnitude*. You need both numbers, and a small position in a very volatile diversifier is a completely different proposition from a large one.`,
        },
        {
          kind: 'callout',
          md: `**The question to ask about any asset, including the four above: what produces the return?** Equities: a share of business profits. Bonds: contractual interest. REITs: rent. Gold and crypto: the price someone else pays later, and nothing else. That last category is not automatically illegitimate — a monetary or scarcity asset can have a coherent argument — but it does mean **none of the analytical machinery in Units 3 through 7 applies**, you have no way to know whether you are overpaying, and the honest response to that is a position size small enough that being wrong does not matter.`,
        },
        {
          kind: 'keypoint',
          md: `Bonds: coupons plus price change, with duration measuring rate sensitivity (a duration of 8.5 loses roughly 8.5% per 1-point yield rise), exposed to rate, credit and inflation risk. REITs: judged on FFO not EPS, structurally leveraged, doubly rate-sensitive, historically 0.6–0.7 correlated with equities. Gold and crypto have no cash flows, so no method from Units 6 and 7 applies. Diversification comes from correlation, not from the asset: two assets at 8% return and 16% volatility held 50/50 give 11.31% volatility at ρ = 0 and 14.75% at ρ = 0.7 — but correlations rise in crises, and adding a lower-returning asset lowers your expected return. Uncorrelated is not the same as safe.`,
        },
      ],
      quiz: [
        {
          id: 'u14-l10-q1',
          prompt: 'A bond has a duration of 8.5 and market yields rise by one percentage point. What happens?',
          choices: [
            'The coupon payment falls by 8.5%',
            'Nothing, because the coupon and principal are contractually fixed',
            'The bond\'s price falls by roughly 8.5%',
            'The bond\'s price rises by roughly 8.5%',
          ],
          answerIdx: 2,
          explain:
            'Duration measures price sensitivity to yields, and prices move inversely to yields because a bond paying an old, lower rate is worth less when new bonds pay more. The contractual cash flows are indeed fixed — which is exactly why the price must adjust instead, the same discounting mathematics that makes long-duration equities rate-sensitive.',
        },
        {
          id: 'u14-l10-q2',
          prompt: 'Why are REITs judged on funds from operations rather than EPS?',
          choices: [
            'Because REITs are exempt from reporting earnings per share',
            'Because property depreciation is a large non-cash charge that understates the cash economics of real estate',
            'Because FFO includes expected future rent increases',
            'Because REITs distribute most of their income and therefore have no retained earnings',
          ],
          answerIdx: 1,
          explain:
            'Buildings are depreciated on the income statement while often holding or gaining value, so EPS systematically understates what a property portfolio actually generates. This is the industry-specific adaptation that Unit 5, Lesson 10 warned about — the checklist supplies the structure and the industry supplies the metric.',
        },
        {
          id: 'u14-l10-q3',
          prompt:
            'Two assets each return 8% with 16% volatility. Held 50/50, the portfolio\'s volatility is 11.31% at ρ = 0 and 14.75% at ρ = 0.7. What is the lesson?',
          choices: [
            'The diversification benefit comes entirely from the correlation, not from any property of the second asset',
            'Lower-correlation assets have higher expected returns',
            'Volatility is halved whenever two assets are combined',
            'Correlation only matters for assets with different expected returns',
          ],
          answerIdx: 0,
          explain:
            'The expected return is 8% in every row while volatility ranges from 11.31% to 16.00%, so correlation is the only variable doing any work. Two caveats sit alongside it: correlations rise in crises, exactly when the benefit was needed, and adding a lower-returning asset reduces the portfolio\'s expected return.',
        },
        {
          id: 'u14-l10-q4',
          prompt: 'What is the flaw in the reasoning "this asset is uncorrelated, so it reduces my risk"?',
          choices: [
            'Uncorrelated assets always have lower expected returns',
            'Correlation describes the relationship but not the magnitude — an 80%-volatility asset still has 80% volatility, and a large position in it will dominate portfolio risk regardless',
            'Correlation cannot be measured reliably for any asset',
            'Uncorrelated assets are always illiquid',
          ],
          answerIdx: 1,
          explain:
            'You need both numbers: correlation tells you how it moves relative to your other holdings and volatility tells you how much it moves at all. A small position in a very volatile diversifier is a completely different proposition from a large one, and correlations also rise in the crises where the diversification was supposed to help.',
        },
      ],
      cardSeeds: [
        {
          id: 'u14-l10-c1',
          kind: 'basic',
          front: 'What produces the return in equities, bonds, REITs, gold and crypto?',
          back: 'Equities: a share of business profits. Bonds: contractual interest. REITs: rent. Gold and crypto: the price someone else pays later, and nothing else — which means no method from Units 6 and 7 applies, you cannot know whether you are overpaying, and the honest response is a position size small enough that being wrong does not matter.',
        },
        {
          id: 'u14-l10-c2',
          kind: 'cloze',
          front:
            'Two assets at 8% return and 16% volatility, held 50/50: portfolio volatility is ____ at ρ = 0, ____ at ρ = 0.3, and ____ at ρ = 0.7. The benefit comes entirely from ____.',
          back: '11.31%; 12.90%; 14.75%; the correlation',
        },
        {
          id: 'u14-l10-c3',
          kind: 'basic',
          front: 'Why is "uncorrelated" not the same as "safe", and what are the two caveats on diversification?',
          back: 'Correlation describes the relationship, volatility the magnitude — an 80%-volatility asset with zero correlation still has 80% volatility. Caveat one: correlations rise in crises, when the benefit is most needed. Caveat two: adding a lower-returning asset lowers your expected return, so the volatility reduction must be worth those points.',
        },
      ],
    },

    // ── L11 ───────────────────────────────────────────────────────────────
    {
      id: 'u14-l11',
      unitId: 'u14',
      order: 11,
      title: 'Continuous Learning',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Investing gives feedback that is **delayed, noisy, and frequently misleading**. A good decision can lose money for three years; a reckless one can pay off immediately. Experience alone therefore teaches you almost nothing — it teaches you whatever the last outcome happened to be. Deliberate structure is what converts experience into skill.

**Separate process from outcome.** Every decision falls into one of four cells:

| | Good outcome | Bad outcome |
|---|---|---|
| **Good process** | **Deserved success** — repeat it | **Bad break** — repeat it anyway |
| **Bad process** | **Dumb luck** — the most dangerous cell | **Deserved failure** — the easiest lesson |

The top-right and bottom-left cells are where all the learning is, and both are routinely misread. A bad break gets treated as a flawed method and abandoned. **Dumb luck gets treated as skill and repeated**, which is how a lucky first year produces an expensive fifth one.

You cannot tell which cell you are in from the outcome. You can only tell from a record of what you decided and why — written **before** you knew the result.`,
        },
        {
          kind: 'text',
          md: `**The decision journal.** One entry per decision, including the decisions not to act. Written at the time, never reconstructed.

| Field | Example |
|---|---|
| Date and decision | 2026-03-14, buy Vantage Diagnostics, 200 shares at $47.10 |
| Thesis in one sentence | Cartridge razor-and-blades economics with a validation-based switching cost, at 22% below my estimate of value |
| Estimate of value and price | $57–63; paid $47.10 |
| The single question it turns on | Do instrument placements keep growing? |
| **Confidence** | **70%** |
| What would change my mind | Placements down year over year two quarters running; gross margin below 57%; DSO above 75 days |
| How I felt | Slightly rushed — the price moved while I was reading |

**Confidence is the field that makes the journal analysable.** Record every decision at **50%, 70% or 90%** — the same three levels the app's prediction drills use (Unit 8) — and after enough entries you can score your own calibration against reality.

**The rejections matter as much as the purchases.** A journal of only your buys cannot tell you whether your process is filtering well; a journal that includes the twelve companies you researched and declined can, because some of them will turn out to have been right to decline and some will not.`,
        },
        {
          kind: 'example',
          md: `**Scoring your calibration.**

After two years you have **40** decisions logged at **90% confidence**. You review them and find **27** turned out correct.

- Actual hit rate: 27 / 40 = **67.5%**
- Stated confidence: **90%**
- **Overconfidence: 22.5 percentage points**

**Perfect calibration means your 90% calls are right 90% of the time and your 50% calls are right 50% of the time.** Note that being right *more* often than you claimed is also miscalibration — underconfidence — and it has its own cost: positions sized too small on views that deserved more.

**What a 22.5-point gap changes in practice, immediately:**

1. **Sizing.** Confidence is an input to position size (Unit 13, Lesson 9). If your 90% is really 67.5%, every high-conviction position you have ever taken was too large.
2. **The margin of safety.** Unit 7, Lesson 7 scales the discount you require to the uncertainty of your estimate. A demonstrated 22.5-point overconfidence means your estimates are wider than you believe, so the required discount should widen too.
3. **Which decisions to examine.** The 13 wrong calls are the syllabus. Sort them by cause — was the thesis wrong, the price wrong, the size wrong, or the timing wrong? — and the causes that repeat become new checklist items (Unit 13, Lesson 7).

**This is the single highest-value thing in this lesson**, and almost nobody does it, because it requires having written down a number you can later be embarrassed by.`,
        },
        {
          kind: 'text',
          md: `**Reading, and what each source is actually for.**

| Source | What it gives you |
|---|---|
| **Graham, The Intelligent Investor** | Margin of safety and Mr. Market — chapters 8 and 20 are the ones that matter |
| **Buffett's annual shareholder letters** | Decades of capital allocation reasoning, freely available, including the mistakes |
| **Howard Marks's memos** | Cycles, risk, and second-level thinking — the discipline of asking what is already priced in |
| **Housel, The Psychology of Money** | Why behaviour dominates analysis in real outcomes |
| **Kahneman, Thinking, Fast and Slow** | The mechanics underneath Unit 12 |
| **Company filings** | The only primary source. Read more of these than commentary. |

**A warning about the genre.** Investing books are written overwhelmingly by and about people who succeeded, and the strategies that failed produced no books. That is textbook survivorship bias, and it means the literature systematically overstates how reliably any approach works. Read for **frameworks and reasoning**, not for recipes.

**Communities and their biases.** Forums, social media, and group chats have four structural distortions, all pointing the same way:

1. **Survivorship** — losers stop posting.
2. **Selection** — wins are posted, quiet losses are not.
3. **Commitment escalation** — a publicly stated position becomes very hard to abandon (Unit 12).
4. **Undisclosed incentives** — some participants are paid to promote, and some simply want company in a position they already hold.

The result is a systematically over-optimistic, over-confident information environment. Communities are useful for **finding names to research** and **hearing the bear case**, and dangerous for **conviction**, which must be built from primary sources you read yourself.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "I learn from my losses."**

Only if you recorded what you expected in advance. Without a written thesis, the mind reconstructs the past to fit the outcome — you will remember having had doubts you did not have, and the lesson extracted will be the comfortable one ("I should have been more patient") rather than the true one ("I sized a 70% conviction like a 90% one"). Hindsight bias is not a weakness of careless people; it is how memory works. **A contemporaneous written record is the only defence**, and it is why the journal is written before the outcome rather than after.`,
        },
        {
          kind: 'callout',
          md: `**Staying humble is a practice, not a personality trait.** Three habits carry most of it. **Know the base rate** before you claim to be an exception — the majority of active participants underperform (Unit 1, Lesson 7), so any claim that you will not needs evidence rather than intention. **Write the bear case yourself**, in your own words, strongly enough that it is uncomfortable — if you cannot state it well, you do not understand the position. **Track your calibration and let it size your positions.** Humility that never changes a position size is decoration.`,
        },
        {
          kind: 'keypoint',
          md: `Separate process from outcome across four cells: deserved success, bad break (repeat it anyway), dumb luck (the most dangerous), deserved failure — and you can only tell which one you are in from a record written before the result. Keep a decision journal with a one-sentence thesis, an estimate of value, the question it turns on, what would change your mind, and a confidence of 50/70/90 — including the decisions to decline. Score calibration: 27 of 40 calls made at 90% is a 67.5% hit rate and 22.5 points of overconfidence, which immediately shrinks position sizes, widens the required margin of safety, and names the syllabus. Read frameworks not recipes, and remember that the literature and every community are survivorship-biased toward optimism.`,
        },
      ],
      quiz: [
        {
          id: 'u14-l11-q1',
          prompt: 'In the process-versus-outcome grid, which cell is the most dangerous?',
          choices: [
            'Good process, bad outcome — a bad break',
            'Bad process, bad outcome — deserved failure',
            'Bad process, good outcome — dumb luck, because it gets recorded as skill and repeated',
            'Good process, good outcome — deserved success',
          ],
          answerIdx: 2,
          explain:
            'A reckless decision that pays off teaches exactly the wrong lesson and gets repeated with larger size, which is how a lucky first year produces an expensive fifth one. A bad break is misread in the opposite direction — a sound method abandoned — but at least it does not escalate.',
        },
        {
          id: 'u14-l11-q2',
          prompt: 'Why must a decision journal be written before the outcome is known?',
          choices: [
            'Because brokers require contemporaneous records for tax purposes',
            'Because hindsight bias reconstructs the past to fit the outcome, so a retrospective account remembers doubts you did not have and extracts the comfortable lesson',
            'Because a thesis written later would be more accurate but less honest',
            'Because the confidence level cannot be estimated after the fact',
          ],
          answerIdx: 1,
          explain:
            'Memory rewrites itself to make what happened seem foreseeable, which is how "I sized a 70% conviction like a 90% one" becomes "I should have been more patient". This is not carelessness but the ordinary operation of memory, and a contemporaneous record is the only defence against it.',
        },
        {
          id: 'u14-l11-q3',
          prompt:
            'You logged 40 decisions at 90% confidence and 27 were correct. What should change immediately?',
          choices: [
            'Nothing — 27 out of 40 is a good hit rate',
            'Stop recording confidence, since it is demoralising',
            'Raise your confidence threshold to 95% for future decisions',
            'Position sizes should shrink and the required margin of safety should widen — a 67.5% hit rate against 90% stated confidence is 22.5 points of overconfidence',
          ],
          answerIdx: 3,
          explain:
            'Confidence is an input to position size and the margin of safety scales to the uncertainty of your estimate, so a demonstrated 22.5-point gap means every high-conviction position has been too large and every required discount too small. The 13 wrong calls also become the syllabus — sorted by whether the thesis, price, size, or timing was wrong.',
        },
        {
          id: 'u14-l11-q4',
          prompt: 'What are the structural biases of investing communities?',
          choices: [
            'They are too slow to react to news and too focused on large-cap stocks',
            'They are dominated by professionals with better information than participants realise',
            'They over-emphasise fundamentals at the expense of price action',
            'Survivorship (losers stop posting), selection (wins get posted), commitment escalation on public positions, and undisclosed incentives — all pushing toward over-optimism',
          ],
          answerIdx: 3,
          explain:
            'All four distortions point the same direction, producing a systematically over-confident information environment. That makes communities useful for finding names to research and for hearing the bear case, and dangerous as a source of conviction, which has to come from primary documents you read yourself.',
        },
        {
          id: 'u14-l11-q5',
          prompt: 'What is the survivorship problem with investing literature?',
          choices: [
            'Books are written overwhelmingly by and about people who succeeded, while the strategies that failed produced no books — so the literature overstates how reliably any approach works',
            'Most investing books are written by academics with no market experience',
            'Investment books become outdated within a few years of publication',
            'Authors are legally prevented from disclosing their actual returns',
          ],
          answerIdx: 0,
          explain:
            'You cannot read the memoir of the disciplined investor whose identical process happened to fail, because it was never published. The correct response is to read for frameworks and reasoning rather than recipes, and to spend more time on primary filings than on commentary.',
        },
      ],
      cardSeeds: [
        {
          id: 'u14-l11-c1',
          kind: 'basic',
          front: 'Name the four cells of the process-versus-outcome grid and the dangerous one.',
          back: 'Good process + good outcome = deserved success. Good process + bad outcome = bad break (repeat it anyway). Bad process + good outcome = dumb luck — the most dangerous, because it is recorded as skill and repeated with more size. Bad process + bad outcome = deserved failure, the easiest lesson.',
        },
        {
          id: 'u14-l11-c2',
          kind: 'basic',
          front: 'What fields belong in a decision journal entry?',
          back: 'Date and decision; thesis in one sentence; estimate of value and price paid; the single question it turns on; confidence at 50/70/90; what would change my mind; how I felt. Include the decisions to decline — a journal of only buys cannot tell you whether your filtering works.',
        },
        {
          id: 'u14-l11-c3',
          kind: 'cloze',
          front:
            '27 correct out of 40 decisions logged at 90% confidence is a hit rate of ____ and overconfidence of ____ points, which should shrink ____ and widen ____.',
          back: '67.5%; 22.5; position sizes; the required margin of safety',
        },
        {
          id: 'u14-l11-c4',
          kind: 'basic',
          front: 'Three habits that make humility operational rather than decorative.',
          back: 'Know the base rate before claiming to be an exception. Write the bear case yourself, strongly enough to be uncomfortable — if you cannot state it well you do not understand the position. Track your calibration and let it set your position sizes; humility that never changes a size is decoration.',
        },
      ],
    },

    // ── L12 ───────────────────────────────────────────────────────────────
    {
      id: 'u14-l12',
      unitId: 'u14',
      order: 12,
      title: 'The Complete Investor',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Fourteen units. Here is the whole thing on one page, so you can see what each one is actually for.

| Unit | What it gave you | The question it answers |
|---|---|---|
| **1. Foundations** | Ownership, markets, compounding, risk, the base rate for active investors | Why does any of this work? |
| **2. Mechanics** | Orders, spreads, share count, funds, brokers, tax | How do I transact without leaking money? |
| **3. Income Statement** | Revenue to EPS, margins, EBITDA, dilution | Does it earn anything? |
| **4. Balance Sheet & Cash Flow** | Assets, liabilities, working capital, FCF, the three statements linked | Does it survive, and is the profit cash? |
| **5. Ratios** | Margins, DuPont, **ROIC vs WACC**, leverage, red flags, the 10-point checklist | Is it a good business? |
| **6. Multiples** | P/E, EV, sales and cash-flow multiples, comps, when multiples lie | What are similar businesses worth? |
| **7. DCF** | Discounting, WACC, projections, terminal value, sensitivity, margin of safety, reverse DCF | What is this one worth from first principles? |
| **8. Technical Foundations** | Candles, timeframes, trend, support and resistance, volume | What is the price actually doing? |
| **9. Chart Patterns** | Recognisable structures and their failure rates | Where might the risk level sit? |
| **10. Indicators** | Moving averages, momentum, and their limits | How do I quantify what the chart shows? |
| **11. Risk & Position Sizing** | Risk per idea, sizing, drawdowns, ruin | How much? |
| **12. Behavioural Finance** | The biases that make all of the above fail in practice | Will I actually do it? |
| **13. Strategy & Synthesis** | Combining disciplines, screening, research process, checklist, selling, portfolio construction, the strategy document | What is my repeatable process? |
| **14. Expert Topics** | Microstructure, shorting, options, factors, macro, moats, filings, special situations, alternatives, learning | What is going on underneath, and how do I keep improving? |

**Notice the shape.** Units 3 to 7 answer "what is it worth", 8 to 10 answer "what is the price doing", 11 and 12 answer "will I survive myself", and 13 assembles all of it. Unit 14 is the layer under the floorboards — useful for understanding, and never a substitute for the process in Unit 13.`,
        },
        {
          kind: 'example',
          md: `**Self-assessment.** Twenty items across six domains. Score each **yes** or **not yet**, honestly — this is for you and nobody else will see it.

**Analysis (5)**
1. I can read an income statement, balance sheet and cash flow statement without help and explain how a change in one flows to the others.
2. I can compute ROIC and compare it to a cost of capital I can defend.
3. I can build a DCF and state which two assumptions carry the answer.
4. I can run a reverse DCF and describe what today's price already requires.
5. I can identify at least four earnings-quality red flags in a filing.

**Valuation judgement (3)**
6. I quote my estimates of value as a range, never a point.
7. When two methods disagree, I diagnose the gap rather than averaging it.
8. I can state what would make me change my estimate.

**Process (4)**
9. I have a written checklist with red-flag vetoes, and I run it every time.
10. I write a one-page thesis before every purchase.
11. I have written exit criteria before I enter.
12. I keep a decision journal, including the decisions to decline.

**Risk (3)**
13. Every position has a stated size rationale and a hard cap.
14. I know what a 40% drawdown does to my portfolio and to me.
15. I know which of my positions are one bet wearing several tickers.

**Behaviour (3)**
16. I have named my own failure modes and built specific tripwires against them.
17. I can hold through a 30% decline without a trigger firing, and I have actually done it.
18. I have said no to an idea I was excited about, because of a rule.

**Perspective (2)**
19. I track my calibration and let it size my positions.
20. I know my honest edge, and I know what would disprove it.

**Reading the score.** 16 or more with the process items among them means you have a working system. 10 to 15 means the analysis is ahead of the discipline, which is the normal and dangerous stage — items 9 to 18 are where the money is actually made or lost. Below 10 means keep the satellite small and keep practising; the app's paper portfolio exists precisely for this.

**The item to be most suspicious of is 17**, because until it has genuinely happened, everything else is theory.`,
        },
        {
          kind: 'text',
          md: `**What mastery actually looks like.** Not what most people expect.

**1. Calibrated confidence, not high confidence.** An expert investor is frequently uncertain and knows *how* uncertain. They say "I think this is worth $57 to $63, I am about 70% confident the placement growth continues, and here is what would change my mind." A novice says "this is a great company." The expert's statement can be scored; the novice's cannot.

**2. Process discipline over outcome obsession.** Mastery is judging yourself on whether you followed a good process, and being genuinely unmoved by a position that went up for reasons you did not anticipate. That is much harder than it sounds, because outcomes are loud and process is quiet.

**3. Knowing the boundary of your competence — and staying inside it.** Not "I understand semiconductors" but "I understand analogue power management and I do not understand advanced packaging, so that second one is not an investment for me at any price." Mastery is more about the size of the "no" pile than the quality of the "yes" pile.

**4. Doing much less.** An experienced investor makes fewer decisions each year, holds longer, trades less, and spends most of their time reading rather than acting. Every unit in this curriculum, followed properly, produces *less* activity, not more.

**5. Iterating forever.** The checklist grows from your own post-mortems. The calibration score improves. The strategy document accumulates dated revisions. Nobody arrives.

**And the honest note to end on.** None of this guarantees a good outcome. A rigorous process improves your odds and reduces the chance of catastrophic error; it does not make you right. Markets contain irreducible uncertainty, and the correct response to that is neither despair nor false confidence — it is **appropriate position sizing and a long horizon**, which are the two things that let a decent process survive long enough for its edge, if it has one, to show up.`,
        },
        {
          kind: 'example',
          md: `**Why any of this is worth the effort — the arithmetic of a small edge.**

$10,000 invested for **30 years** (Unit 1, Lesson 4):

| Annual return | Ending value |
|---|---|
| 7% | **$76,123** |
| 8% | **$100,627** |

**One percentage point a year is $24,504, or 32.2% more money**, on the same starting capital over the same period.

**Where that point most plausibly comes from** — and note that none of these require picking a single winning stock:

- **Not paying 1% in fund fees** (Unit 2, Lesson 6)
- **Not turning over the portfolio 200 times a year**, which cost 2.00 points in Unit 13, Lesson 2
- **Not realising gains at short-term rates** unnecessarily (Unit 2, Lesson 8)
- **Not selling in the drawdown** (Unit 12)
- **Not taking a position so large that one mistake is unrecoverable** (Unit 11)

**Every item on that list is a mistake avoided rather than an insight gained.** That is the honest summary of what this curriculum is for: the largest and most reliable returns available to an individual investor come from *not doing* the expensive things, and the analysis exists mainly to give you the confidence to sit still while other people do them.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "I have completed the curriculum, so I am ready to invest confidently."**

Completion means you have the vocabulary and the tools. It does not mean you have the skill, because every one of the hardest items on that list — holding through a 30% decline, saying no to an idea you love, sizing a 70% conviction as a 70%, admitting a thesis broke — is only learned by doing it with something at stake. **The most common failure of a newly educated investor is confusing knowledge with calibration**, and it usually shows up as positions that are too large, taken too quickly, on ideas that are genuinely good. Start small, start slowly, and let the decision journal tell you when you have earned more size.`,
        },
        {
          kind: 'callout',
          md: `**Educational, not financial advice.** Everything in this curriculum — all fourteen units, every worked example, every checklist, every threshold — is **educational material**. It is not financial, investment, legal, or tax advice, and it is not a recommendation to buy, sell, or hold any security or asset. All companies used in worked examples are **fictional**, and their numbers were constructed to illustrate a method rather than to describe any real business. Your circumstances, tax situation, time horizon, obligations, and risk capacity are specific to you and are not known here. Markets involve real risk of permanent loss, past performance does not predict future results, and no process described here removes that risk. **Consider consulting a qualified, ideally fee-only, financial professional before making investment decisions**, and treat everything above as a way of thinking rather than as instructions.`,
        },
        {
          kind: 'callout',
          md: `**Graduation.** You began at Unit 1 not knowing what a share was. You can now read a set of financial statements, judge a business on returns against its cost of capital, build and stress a valuation, read a chart for a risk level, size a position, recognise the biases that will attack all of it, and write down a process you can be held to.

That is a genuine and uncommon competence. It is also, honestly, the beginning: everything here becomes skill only through repetition, ideally with the paper portfolio first and with small amounts of real money after that. **The next step is not another unit. It is your first entry in the decision journal.**`,
        },
        {
          kind: 'keypoint',
          md: `The map: Units 3–7 answer what it is worth, 8–10 what the price is doing, 11–12 whether you will survive yourself, 13 assembles the process, and 14 is the layer underneath. Score the 20-item self-assessment honestly — items 9 to 18 (process, risk, behaviour) are where outcomes are decided, and item 17 is only real once it has actually happened. Mastery is calibrated confidence rather than high confidence, process discipline over outcome obsession, a large "no" pile, doing much less, and iterating forever. One extra point a year turns $10,000 into $100,627 rather than $76,123 over 30 years — 32.2% more — and every reliable source of that point is a mistake avoided, not an insight gained. This is educational material, not financial advice.`,
        },
      ],
      quiz: [
        {
          id: 'u14-l12-q1',
          prompt: 'In the curriculum map, what do Units 11 and 12 contribute that Units 3 to 10 cannot?',
          choices: [
            'More precise estimates of intrinsic value',
            'Whether you will survive yourself — how much to risk, and the biases that make correct analysis fail in practice',
            'Faster identification of undervalued companies',
            'Better entry and exit timing on individual trades',
          ],
          answerIdx: 1,
          explain:
            'Units 3 to 7 answer what a business is worth and 8 to 10 answer what the price is doing, but neither addresses position size or the behaviour that determines whether you act on your own analysis. A correct valuation held at the wrong size, or sold in a drawdown, produces a loss regardless of how good the analysis was.',
        },
        {
          id: 'u14-l12-q2',
          prompt: 'Which self-assessment item does the lesson say to be most suspicious of, and why?',
          choices: [
            'Item 3, building a DCF — because DCFs are unreliable',
            'Item 17, holding through a 30% decline without a trigger firing — because until it has actually happened, everything else is theory',
            'Item 20, knowing your edge — because most investors have none',
            'Item 1, reading the three statements — because it is the hardest technical skill',
          ],
          answerIdx: 1,
          explain:
            'Every other item can be satisfied by knowledge or by a habit practised in calm conditions, but holding through a real 30% decline is only demonstrated by having done it. Believing you would is exactly the prediction that Unit 12 shows people get wrong about themselves.',
        },
        {
          id: 'u14-l12-q3',
          prompt: 'What does the lesson identify as the defining feature of mastery?',
          choices: [
            'High confidence built on thorough research',
            'The ability to predict short-term price movements consistently',
            'Calibrated confidence — being frequently uncertain and knowing how uncertain, in a form that can be scored',
            'A large number of well-researched positions',
          ],
          answerIdx: 2,
          explain:
            '"I think this is worth $57 to $63, I am about 70% confident, and here is what would change my mind" can be checked against reality later, while "this is a great company" cannot. Mastery also shows in doing much less, keeping a large "no" pile, and judging yourself on process rather than on outcomes.',
        },
        {
          id: 'u14-l12-q4',
          prompt:
            '$10,000 over 30 years grows to $76,123 at 7% and $100,627 at 8%. What is the lesson\'s point about that extra point?',
          choices: [
            'That stock selection is the highest-value skill in the curriculum',
            'That 30-year horizons are required for any strategy to work',
            'That every reliable source of it is a mistake avoided — fees, turnover, unnecessary short-term taxes, selling in drawdowns, oversized positions — rather than an insight gained',
            'That 8% is the realistic long-run expectation for a disciplined investor',
          ],
          answerIdx: 2,
          explain:
            'One point compounds into $24,504, or 32.2% more money, and the listed sources are all things you avoid doing rather than things you correctly predict. The analysis in the curriculum exists mainly to give you the confidence to sit still while other people incur those costs.',
        },
        {
          id: 'u14-l12-q5',
          prompt: 'What is the correct status of everything in this curriculum?',
          choices: [
            'A tested investment strategy suitable for immediate use with real money',
            'Financial advice tailored to the reader\'s circumstances',
            'A set of rules that, if followed exactly, produce reliable market outperformance',
            'Educational material — not financial, investment, legal or tax advice, with all worked examples fictional and no guarantee of any outcome',
          ],
          answerIdx: 3,
          explain:
            'Every company used is fictional and its numbers were constructed to illustrate a method, and no process described here removes the risk of permanent loss. Your horizon, tax position, obligations and risk capacity are specific to you and unknown here, which is why consulting a qualified professional is the appropriate next step before acting.',
        },
      ],
      cardSeeds: [
        {
          id: 'u14-l12-c1',
          kind: 'cloze',
          front:
            'The curriculum map: Units 3–7 answer ____, Units 8–10 answer ____, Units 11–12 answer ____, Unit 13 provides ____, and Unit 14 is ____.',
          back: 'what the business is worth; what the price is doing; whether you will survive yourself; the repeatable process; the layer underneath, for understanding rather than substitution',
        },
        {
          id: 'u14-l12-c2',
          kind: 'basic',
          front: 'What are the five features of mastery?',
          back: 'Calibrated confidence rather than high confidence; process discipline over outcome obsession; knowing the boundary of competence and staying inside it (a large "no" pile); doing much less — fewer decisions, longer holds, more reading; and iterating forever, since nobody arrives.',
        },
        {
          id: 'u14-l12-c3',
          kind: 'cloze',
          front:
            '$10,000 over 30 years is ____ at 7% and ____ at 8% — one extra point is ____ more, or ____%. Every reliable source of that point is a ____ rather than an ____.',
          back: '$76,123; $100,627; $24,504; 32.2; mistake avoided; insight gained',
        },
        {
          id: 'u14-l12-c4',
          kind: 'basic',
          front: 'What is the status of this curriculum, and what does it not do?',
          back: 'Educational material only — not financial, investment, legal or tax advice, and not a recommendation on any security. All worked examples use fictional companies with constructed numbers. A rigorous process improves the odds and reduces catastrophic error; it does not make you right, and markets carry irreducible risk of permanent loss.',
        },
      ],
    },
  ],
}
