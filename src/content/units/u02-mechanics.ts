import type { Unit } from '@core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Unit 02 — Market Mechanics
// The plumbing: orders, spreads, share counts, funds, accounts, and taxes.
// This is where beginners lose money to details they never knew existed.
// ─────────────────────────────────────────────────────────────────────────────

export const u02: Unit = {
  id: 'u02',
  title: 'Market Mechanics',
  order: 2,
  description:
    'How orders actually execute, what a spread really costs you, why share price alone means nothing, and how funds, account types, and taxes quietly shape your returns.',
  unlockAfter: 'u01',
  lessons: [
    // ── L01 ───────────────────────────────────────────────────────────────
    {
      id: 'u02-l01',
      unitId: 'u02',
      order: 1,
      title: 'Order Types I: Market vs. Limit',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `An **order** is an instruction to your broker. The two you'll use most sit at opposite ends of a single trade-off:

- **Market order** — "fill me now, at whatever the best available price is."
- **Limit order** — "fill me only at this price or better."

The rule that summarises everything else in this lesson:

> A **market order guarantees execution, not price.** A **limit order guarantees price, not execution.**`,
        },
        {
          kind: 'text',
          md: `A market order sweeps the order book, taking the best ask (for a buy) until your quantity is filled. In a liquid, heavily traded stock during regular hours, that's nearly always fine — you'll fill within a cent or two of the quote you saw.

In a thinly traded stock, in the first minutes after the open, or around an earnings release, the book is thin and jumpy. Your order can walk up several price levels before it finishes filling. That gap between the price you expected and the price you got is **slippage**.`,
        },
        {
          kind: 'example',
          md: `**When a market order bites.** A small-cap stock shows a last price of **$20.00**. The book looks like:

| Side | Price | Shares |
|---|---|---|
| Ask | $20.05 | 100 |
| Ask | $20.40 | 200 |
| Ask | $21.10 | 500 |

You send a **market buy for 500 shares**:

- 100 fill at $20.05 = $2,005
- 200 fill at $20.40 = $4,080
- 200 fill at $21.10 = $4,220

Total **$10,305**, an average of **$20.61** — about **3% above** the price you saw. A **limit buy at $20.10** would have filled only 100 shares, leaving 400 unfilled: worse coverage, but no nasty surprise.`,
        },
        {
          kind: 'callout',
          md: `**Pitfall: the "market order at the open."** Placing a market order before 9:30am ET means it executes into the opening auction, one of the least stable moments of the day. Overnight news, wide spreads and thin depth routinely produce fills far from the previous close. If you must trade near the open, use a limit.`,
        },
        {
          kind: 'text',
          md: `Practical defaults for a beginner:

- Liquid large-cap or big ETF, mid-session, ordinary size → a market order is fine and simple.
- Small-cap, low volume, extended hours, or a large order → **limit**, always.
- Limit price too aggressive means no fill; too loose and you've recreated a market order. Setting it at or just inside the current quote is the usual compromise.`,
        },
        {
          kind: 'keypoint',
          md: `Market order = guaranteed execution, uncertain price. Limit order = guaranteed price, uncertain execution. Illiquidity and volatility are what turn that theoretical difference into real money.`,
        },
      ],
      quiz: [
        {
          id: 'u02-l01-q1',
          prompt: 'Which statement correctly pairs the guarantee with the order type?',
          choices: [
            'Both guarantee execution, but only a limit order guarantees price',
            'A market order guarantees price; a limit order guarantees execution',
            'A market order guarantees execution; a limit order guarantees price',
            'Neither guarantees anything; both are best-efforts instructions',
          ],
          answerIdx: 2,
          explain:
            'A market order takes whatever price the book offers in exchange for certainty of filling; a limit order fixes your price and accepts that it may never fill. Reversing them is the most common beginner error, and it leads to using market orders precisely where price certainty matters most.',
        },
        {
          id: 'u02-l01-q2',
          prompt:
            'You send a market buy for 500 shares of a thinly traded stock quoted at $20.05. It fills at an average of $20.61. What is that $0.56 difference called?',
          choices: [
            'Slippage',
            'Commission',
            'The expense ratio',
            'A capital gain',
          ],
          answerIdx: 0,
          explain:
            'Slippage is the gap between the expected price and the realised fill, caused here by the order eating through several thin levels of the book. It is easy to mistake for a commission because both reduce your return, but commissions are disclosed and often zero — slippage is invisible and can be far larger.',
        },
        {
          id: 'u02-l01-q3',
          prompt:
            'The best ask is $50.10 and you place a limit buy at $49.90. What most likely happens?',
          choices: [
            'It fills immediately at $49.90',
            'It fills immediately at $50.10',
            'It rests unfilled until a seller is willing to come down to $49.90',
            'It is rejected by the exchange as an invalid price',
          ],
          answerIdx: 2,
          explain:
            'A buy limit below the current ask cannot execute — it sits in the book as a resting bid until sellers come to it. Expecting a fill at $50.10 misunderstands the instruction: a limit is a ceiling for buys, so the broker will never pay more than you specified, even to get you filled.',
        },
        {
          id: 'u02-l01-q4',
          prompt:
            'In which situation is a plain market order most likely to cost you meaningfully?',
          choices: [
            'A 2,000-share buy of a low-volume small-cap right after the open',
            'Any order placed on a Friday',
            'A 50-share buy of a mega-cap stock mid-session',
            'A 20-share buy of a major index ETF at 1pm ET',
          ],
          answerIdx: 0,
          explain:
            'Large size, thin liquidity, and opening-auction volatility compound each other — the order walks up multiple price levels. Liquid ETFs and mega-caps mid-session have penny-wide spreads and deep books, so a small market order there is essentially costless; the day of the week is irrelevant.',
        },
        {
          id: 'u02-l01-q5',
          prompt: 'What is the main downside of setting a very aggressive (far-from-market) limit price?',
          choices: [
            'It increases the bid-ask spread for everyone else',
            'Your broker charges a fee for unfilled orders',
            'The exchange converts it to a market order after an hour',
            'The order may never fill, so you miss the move entirely',
          ],
          answerIdx: 3,
          explain:
            'Price certainty is bought with execution uncertainty: if the market never comes to your limit, you simply do not trade. Nothing converts a limit into a market order automatically — that only happens with stop orders, which the next lesson covers.',
        },
      ],
      cardSeeds: [
        {
          id: 'u02-l01-c1',
          kind: 'cloze',
          front:
            'A market order guarantees ____ but not ____; a limit order guarantees ____ but not ____.',
          back: 'execution, price; price, execution',
        },
        {
          id: 'u02-l01-c2',
          kind: 'basic',
          front: 'What is slippage?',
          back: 'The difference between the price you expected and the price you actually filled at — caused by thin liquidity, fast markets, or an order large enough to walk through the book.',
        },
        {
          id: 'u02-l01-c3',
          kind: 'basic',
          front: 'When should a beginner insist on a limit order rather than a market order?',
          back: 'Low-volume or small-cap stocks, large order sizes, extended-hours or opening-auction trading, and around earnings — anywhere the book is thin or jumpy.',
        },
      ],
    },

    // ── L02 ───────────────────────────────────────────────────────────────
    {
      id: 'u02-l02',
      unitId: 'u02',
      order: 2,
      title: 'Order Types II: Stops and Time-in-Force',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A **stop order** is a dormant instruction: it does nothing until price touches your **stop price**, and then it wakes up and becomes a live order.

- **Stop-loss (stop-market)** — on trigger it becomes a **market order**. Fills almost certainly; price unknown.
- **Stop-limit** — on trigger it becomes a **limit order** at your limit price. Price protected; fill not guaranteed.

Same trade-off as the last lesson, one step removed.`,
        },
        {
          kind: 'text',
          md: `A **trailing stop** sets the stop a fixed distance (in dollars or percent) below the highest price reached since you placed it. It ratchets up as the stock rises and never moves down — a way to lock in gains without picking an exit level in advance.

The other dimension every order carries is **time-in-force**: how long the instruction stays alive.

- **DAY** — expires at the close if unfilled. The default at most brokers.
- **GTC** (good-til-cancelled) — persists across sessions, though brokers typically cap it around 60–90 days.
- **IOC** (immediate-or-cancel) — fill what you can right now, cancel the rest.
- **FOK** (fill-or-kill) — fill the entire order immediately or cancel all of it.
- **Extended-hours flag** — required if you want the order eligible pre-market or after-hours.`,
        },
        {
          kind: 'example',
          md: `**The gap-down problem.** You own 100 shares bought at **$50** and set a **stop-loss at $45** to cap the damage. Overnight the company reports terrible earnings and the stock opens at **$36**.

- **Stop-loss (stop-market):** the $45 stop triggers at the open, and your market order fills near **$36** — roughly a **$1,400** loss, not the ~$500 you pictured. Stops do not stop gaps.
- **Stop-limit at $45 stop / $44.50 limit:** it triggers, but no one will buy at $44.50 with the stock at $36. Nothing fills. You still own the shares — protected from a bad price, but not from the loss.

Neither is broken. Each simply chooses a different failure mode, and you should know which one you selected.`,
        },
        {
          kind: 'callout',
          md: `**Pitfall: a stop order is visible risk, not a safety net.** Two other traps: stop orders can trigger on a brief intraday spike ("stop hunting") and sell you out right before a recovery, and stop-market orders placed in illiquid names can fill dreadfully. A stop is a risk-management tool with known limitations — not insurance.`,
        },
        {
          kind: 'keypoint',
          md: `Stop-loss becomes a market order on trigger (fills, price unknown); stop-limit becomes a limit order (price known, may not fill). Neither protects against overnight gaps. DAY expires at the close; GTC persists for weeks.`,
        },
      ],
      quiz: [
        {
          id: 'u02-l02-q1',
          prompt: 'When a stop-loss order is triggered, what does it become?',
          choices: [
            'A limit order at the stop price',
            'A market order',
            'A guaranteed fill at the stop price',
            'A cancelled order pending your confirmation',
          ],
          answerIdx: 1,
          explain:
            'A stop-loss (stop-market) converts to a market order once the stop price trades, so it fills at whatever the book offers next. The "guaranteed fill at the stop price" answer is the dangerous myth — in a fast market or a gap, the actual fill can be far below the stop.',
        },
        {
          id: 'u02-l02-q2',
          prompt:
            'You hold shares bought at $50 with a stop-loss at $45. Bad news hits overnight and the stock opens at $36. What most likely happens?',
          choices: [
            'The order fills at $45, capping your loss as planned',
            'The order triggers and fills near $36',
            'The order is cancelled because the stop was skipped',
            'The order converts into a limit order at $45 and waits',
          ],
          answerIdx: 1,
          explain:
            'The stop is triggered by the open below $45, and the resulting market order fills at the prevailing price — around $36. Stops cannot protect against gaps because no trading occurs between the close and the open; believing otherwise leads people to size positions as if their downside were truly capped.',
        },
        {
          id: 'u02-l02-q3',
          prompt: 'What is the key risk of a stop-limit order compared with a stop-loss order?',
          choices: [
            'It may not fill at all, leaving you holding a falling position',
            'Brokers charge a premium for stop-limit orders',
            'It expires automatically after one hour',
            'It can fill far below your intended price',
          ],
          answerIdx: 0,
          explain:
            'A stop-limit protects your price but sacrifices certainty of execution — if price races past your limit, nothing fills and you keep the position. Filling far below your intended price is the *stop-market* risk; the two order types trade one failure mode for the other.',
        },
        {
          id: 'u02-l02-q4',
          prompt: 'You place a limit order with DAY time-in-force that does not fill. What happens to it?',
          choices: [
            'It executes at the closing auction price',
            'It carries over to the next session automatically',
            'It converts to a GTC order after the close',
            'It expires at the close of that trading day',
          ],
          answerIdx: 3,
          explain:
            'DAY orders expire unfilled at the close, which is why an order you thought was "still working" may quietly be gone the next morning. Persisting across sessions is what GTC does — and even GTC is usually capped by the broker at roughly 60–90 days.',
        },
        {
          id: 'u02-l02-q5',
          prompt: 'A trailing stop set at 10% behind the high does what as the stock rises from $50 to $70?',
          choices: [
            'Stays fixed at $45, where it started',
            'Ratchets up to $63 and back down if the stock falls to $65',
            'Ratchets up to $63 and never moves back down',
            'Triggers a partial sale at every 10% gain',
          ],
          answerIdx: 2,
          explain:
            'A trailing stop tracks the highest price reached — 10% below $70 is $63 — and it only moves upward, so a subsequent dip does not loosen it. Assuming it moves back down would defeat its purpose, which is to lock in gains without you having to choose an exit level in advance.',
        },
      ],
      cardSeeds: [
        {
          id: 'u02-l02-c1',
          kind: 'basic',
          front: 'Stop-loss vs. stop-limit — what does each become when triggered?',
          back: 'Stop-loss becomes a market order (fills, price uncertain). Stop-limit becomes a limit order (price certain, may never fill).',
        },
        {
          id: 'u02-l02-c2',
          kind: 'basic',
          front: 'Why does a stop-loss fail to cap losses on an overnight gap?',
          back: 'No trading happens between the close and the open, so the stop triggers at the new (much lower) opening price and fills there — the stop level is skipped entirely.',
        },
        {
          id: 'u02-l02-c3',
          kind: 'cloze',
          front:
            'A ____ order expires at the end of the trading day; a ____ order stays alive across sessions (usually capped near 60–90 days).',
          back: 'DAY; GTC (good-til-cancelled)',
        },
        {
          id: 'u02-l02-c4',
          kind: 'basic',
          front: 'How does a trailing stop behave?',
          back: 'It sits a fixed dollar or percent distance below the highest price reached since placement, ratcheting up as price rises and never moving back down.',
        },
      ],
    },

    // ── L03 ───────────────────────────────────────────────────────────────
    {
      id: 'u02-l03',
      unitId: 'u02',
      order: 3,
      title: 'Bid, Ask, and Spread',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `Every stock has two live prices, not one:

- **Bid** — the highest price a buyer will currently pay.
- **Ask** — the lowest price a seller will currently accept.
- **Spread** — ask minus bid.

You buy at the ask and sell at the bid, so the moment you buy you are already down by the spread. That's not a fee anyone charges you; it's a structural cost of transacting, and it's usually invisible on your statement.`,
        },
        {
          kind: 'text',
          md: `Spread width is a direct read on **liquidity**. Heavily traded names have many competing market makers and penny-wide spreads. Obscure names have few, so the spread widens to compensate them for inventory risk.

What widens spreads: low volume, small market cap, extended-hours sessions, high volatility, and pending news. All the same conditions that make market orders dangerous — which is not a coincidence.`,
        },
        {
          kind: 'example',
          md: `**Two stocks, same $10,000.**

**Liquid mega-cap:** bid $199.99 / ask $200.01 → spread **$0.02**, or **0.01%**.
Buy 50 shares at $200.01, sell immediately at $199.99 → round-trip cost **$1.00**.

**Thin small-cap:** bid $19.60 / ask $20.00 → spread **$0.40**, or **2.0%**.
Buy 500 shares at $20.00 = $10,000; sell immediately at $19.60 = $9,800 → round-trip cost **$200**.

Same trade size, **200× the cost**. And if you round-tripped that small-cap weekly for a year, spread alone would consume a multiple of any plausible annual return — before slippage, before taxes.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "My broker charges $0 commission, so trading is free."

Commissions are only the visible cost. The spread, slippage, and (in taxable accounts) tax on realised gains are the real bill. Zero-commission also isn't charity — many brokers route orders to market makers for **payment for order flow**, so the market maker's edge comes from the spread you just crossed.`,
        },
        {
          kind: 'keypoint',
          md: `Spread = ask − bid, and it is a real, invisible cost paid on every round trip. Wide spreads signal illiquidity; the wider the spread, the more your trading frequency costs you.`,
        },
      ],
      quiz: [
        {
          id: 'u02-l03-q1',
          prompt: 'A stock is quoted bid $19.60 / ask $20.00. You buy 500 shares and immediately sell them. Ignoring commissions, what is your loss?',
          choices: [
            '$0',
            '$20',
            '$200',
            '$400',
          ],
          answerIdx: 2,
          explain:
            'You buy at the ask ($20.00 × 500 = $10,000) and sell at the bid ($19.60 × 500 = $9,800), losing the full $0.40 spread on every share: $200. Answering $0 assumes a single "price" exists; there are always two, and you cross from one to the other.',
        },
        {
          id: 'u02-l03-q2',
          prompt: 'A wide bid-ask spread is primarily a signal of what?',
          choices: [
            'The stock is overvalued',
            'The company is about to report earnings',
            'The exchange has raised its fees',
            'The stock is illiquid — thin volume and few competing market makers',
          ],
          answerIdx: 3,
          explain:
            'Spreads widen when few participants compete to make markets, so market makers demand more compensation for inventory risk. Pending earnings can widen a spread temporarily, but that is a special case of the same cause — uncertainty and thin depth — not a reliable inference, and spread says nothing at all about valuation.',
        },
        {
          id: 'u02-l03-q3',
          prompt: 'At a broker charging $0 commissions, what is usually the largest hidden cost of frequent trading in a liquid stock?',
          choices: [
            'Account maintenance fees',
            'Interest charged on settled cash',
            'Crossing the spread and slippage on every round trip',
            'Exchange listing fees passed through to you',
          ],
          answerIdx: 2,
          explain:
            'Each round trip pays the spread and any slippage, and these repeat with every trade — so cost scales with frequency even when commissions are zero. Maintenance fees are typically waived at major brokers, and settled cash earns interest rather than being charged it.',
        },
        {
          id: 'u02-l03-q4',
          prompt:
            'The spread on a $200 mega-cap is $0.02 and on a $20 small-cap is $0.40. Which costs more as a percentage of the trade?',
          choices: [
            'The small-cap, at 2.0% versus the mega-cap’s 0.01%',
            'The mega-cap, at 0.01% versus the small-cap’s 0.2%',
            'They are equivalent once adjusted for share price',
            'The mega-cap, because its dollar price is higher',
          ],
          answerIdx: 0,
          explain:
            '$0.40 / $20.00 = 2.0%, against $0.02 / $200.00 = 0.01% — a 200-fold difference. Comparing spreads in dollars rather than percent of price is the trap: what matters is the fraction of your capital surrendered, not the size of the tick.',
        },
      ],
      cardSeeds: [
        {
          id: 'u02-l03-c1',
          kind: 'cloze',
          front: 'Spread = ____ minus ____. You buy at the ____ and sell at the ____.',
          back: 'ask minus bid; buy at the ask, sell at the bid',
        },
        {
          id: 'u02-l03-c2',
          kind: 'basic',
          front: 'Why is the bid-ask spread a real cost even with $0 commissions?',
          back: 'You buy at the ask and sell at the bid, so a round trip loses the full spread on every share — an invisible cost that never appears on a statement.',
        },
        {
          id: 'u02-l03-c3',
          kind: 'basic',
          front: 'What conditions widen the bid-ask spread?',
          back: 'Low volume, small market cap, extended-hours trading, high volatility, and pending news — anything that thins out competing market makers.',
        },
      ],
    },

    // ── L04 ───────────────────────────────────────────────────────────────
    {
      id: 'u02-l04',
      unitId: 'u02',
      order: 4,
      title: 'Market Cap and Share Count',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `Share price on its own tells you **nothing** about how big a company is or whether it's expensive. Price is value divided by an arbitrary number of slices, and companies choose how many slices to cut.

> **Market cap = share price × shares outstanding**

Market cap is what the market says the whole equity of the business is worth. That's the number worth comparing.`,
        },
        {
          kind: 'text',
          md: `The conventional US size buckets (approximate and drifting upward over time):

| Bucket | Market cap |
|---|---|
| Mega cap | above ~$200B |
| Large cap | ~$10B and up |
| Mid cap | ~$2B – $10B |
| Small cap | ~$300M – $2B |
| Micro cap | below ~$300M |

Size correlates with behaviour: smaller companies are typically more volatile, less liquid, less analysed, and more likely to fail — and historically have offered somewhat higher long-run returns as compensation.`,
        },
        {
          kind: 'example',
          md: `**Price tells you nothing.**

- **Company A:** $8 per share × 5,000,000,000 shares = **$40B** market cap
- **Company B:** $600 per share × 20,000,000 shares = **$12B** market cap

Company A trades at a "cheap-looking" $8 and is **more than three times** the size of the $600 stock. Anyone who thinks A is the smaller or cheaper business has been fooled by the slice count.

**The other half of the trap: dilution.** If a company issues 10% more shares to fund an acquisition or pay employees in stock, your ownership fraction shrinks by about 9% even though your share count never changed. Watch shares outstanding over time — a rising count is a quiet tax on existing owners, and a falling count (buybacks) is the reverse.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "A $5 stock has more room to run than a $500 stock."

Percentage moves are what compound, and a company's value can rise the same percentage from any starting price. Low nominal prices often mean the opposite of opportunity — sub-$5 stocks skew toward distressed, illiquid companies. Related terms worth knowing: **float** (shares actually available to trade, excluding insider-locked holdings) and **enterprise value** (market cap + debt − cash), which is what an acquirer would really pay.`,
        },
        {
          kind: 'keypoint',
          md: `Market cap = price × shares outstanding, and it — not price — measures company size. Track shares outstanding over time: dilution shrinks your ownership without touching your share count.`,
        },
      ],
      quiz: [
        {
          id: 'u02-l04-q1',
          prompt:
            'Company A trades at $8 with 5 billion shares; Company B trades at $600 with 20 million shares. Which is the larger company?',
          choices: [
            'Company B, because a $600 share price implies a larger business',
            'Company A, at $40B versus Company B’s $12B',
            'They are the same size once adjusted for share price',
            'It cannot be determined without knowing each company’s revenue',
          ],
          answerIdx: 1,
          explain:
            'Market cap = price × shares: A is $8 × 5B = $40B, B is $600 × 20M = $12B, so A is over three times larger. The instinct that a high share price signals a big company is pure illusion — share count is an arbitrary choice each company makes.',
        },
        {
          id: 'u02-l04-q2',
          prompt: 'A company with a $6B market cap falls into which conventional bucket?',
          choices: [
            'Micro cap',
            'Small cap',
            'Mid cap',
            'Large cap',
          ],
          answerIdx: 2,
          explain:
            'Mid cap conventionally spans roughly $2B to $10B, so $6B sits squarely in the middle. Large cap starts around $10B — the boundaries are conventions rather than rules, and they drift upward as the market grows, so treat them as rough guides.',
        },
        {
          id: 'u02-l04-q3',
          prompt:
            'A company you own issues 10% more shares to fund an acquisition. You still hold 100 shares. What happened to your stake?',
          choices: [
            'Nothing — your share count is unchanged',
            'Your ownership percentage fell by roughly 9%',
            'Your share count automatically increased by 10%',
            'Your shares were converted to preferred stock',
          ],
          answerIdx: 1,
          explain:
            'Your 100 shares are now 100 out of a 10% larger pool, so your ownership fraction drops by about 9% (1 / 1.10). Focusing only on your unchanged share count is exactly why dilution goes unnoticed — the change happens in the denominator, which is why you track shares outstanding over time.',
        },
        {
          id: 'u02-l04-q4',
          prompt: 'What is enterprise value?',
          choices: [
            'The book value of the company’s assets',
            'Market cap plus cash minus debt',
            'The total revenue a company generates in a year',
            'Market cap plus debt minus cash',
          ],
          answerIdx: 3,
          explain:
            'EV = market cap + debt − cash, approximating what an acquirer would pay: you assume the debt and get to keep the cash. Flipping the signs is the common slip — remember that debt makes a company *more* expensive to buy and cash makes it cheaper.',
        },
        {
          id: 'u02-l04-q5',
          prompt: 'What is the "float" of a stock?',
          choices: [
            'The total number of shares ever issued',
            'The average daily trading volume',
            'The shares actually available for public trading, excluding locked-up insider holdings',
            'The number of shares held by index funds',
          ],
          answerIdx: 2,
          explain:
            'Float excludes restricted and insider-held shares, so it measures what can actually change hands — a small float can make a stock far more volatile than its market cap suggests. Total shares issued is "shares outstanding", a related but larger figure.',
        },
      ],
      cardSeeds: [
        {
          id: 'u02-l04-c1',
          kind: 'cloze',
          front: 'Market cap = ____ × ____.',
          back: 'share price × shares outstanding',
        },
        {
          id: 'u02-l04-c2',
          kind: 'basic',
          front: 'US market-cap buckets (approximate)',
          back: 'Mega >$200B · Large >$10B · Mid $2–10B · Small $300M–$2B · Micro <$300M. Conventions, not rules, and they drift upward over time.',
        },
        {
          id: 'u02-l04-c3',
          kind: 'basic',
          front: 'What is dilution, and why does it matter to an existing shareholder?',
          back: 'The company issues new shares, enlarging the denominator. Your share count is unchanged but your ownership percentage and per-share claim on profits shrink.',
        },
        {
          id: 'u02-l04-c4',
          kind: 'basic',
          front: 'Formula: enterprise value',
          back: 'EV = market cap + total debt − cash. It approximates the true cost of acquiring the whole business.',
        },
      ],
    },

    // ── L05 ───────────────────────────────────────────────────────────────
    {
      id: 'u02-l05',
      unitId: 'u02',
      order: 5,
      title: 'Splits and Dividends',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A **stock split** slices the same pizza into more pieces. In a **4-for-1** split you end up with four times the shares at one quarter the price. Your position value, the company's market cap, and your ownership percentage are all **completely unchanged**.

A **reverse split** goes the other way (1-for-10: fewer shares, higher price), usually to escape a delisting threshold when a stock has fallen below an exchange's minimum price. That one is often a warning sign about the business.`,
        },
        {
          kind: 'text',
          md: `A **dividend** is a cash payment out of profits, usually quarterly in the US. Four dates govern it:

1. **Declaration date** — the board announces the amount.
2. **Ex-dividend date** — buy **on or after** this date and you do **not** get the dividend. The share price typically opens lower by roughly the dividend amount.
3. **Record date** — the company checks who is on the books. Under T+1 settlement the ex-date and record date now generally coincide.
4. **Payment date** — cash lands in your account.

**Dividend yield = annual dividend per share ÷ share price.** Note what happens when a stock collapses: yield rises. A very high yield is frequently a signal of distress and a dividend about to be cut — a **yield trap**.`,
        },
        {
          kind: 'example',
          md: `**A split changes nothing.** You own **10 shares at $600** = **$6,000**. The company announces a 4-for-1 split.

After: **40 shares at $150** = **$6,000**. Identical. The only real effects are psychological and mechanical (cheaper round lots, options contract sizing) — though fractional shares have made even that mostly obsolete.

**A dividend isn't free money.** A stock closes at **$100** and goes ex-dividend on a **$1** quarterly payment.

- It typically opens near **$99**.
- You receive **$1** in cash.
- Total value: **$100**, exactly as before — and in a taxable account you now owe tax on that $1.

Annualised, $1 quarterly = $4 per year, so the yield is $4 / $100 = **4%**. A **DRIP** (dividend reinvestment plan) automatically buys more shares with the payment, turning dividends back into compounding instead of idle cash.`,
        },
        {
          kind: 'callout',
          md: `**Pitfall: the "dividend capture" trade.** Buying just before the ex-date to collect the dividend and selling right after does not work — the price drops by roughly the dividend, and you are left with the transaction costs and a tax bill. Dividends transfer value from the share price to your cash balance; they do not create it.`,
        },
        {
          kind: 'keypoint',
          md: `Splits change the slice count, never the value. Dividends move value from share price to cash — buy before the ex-date to receive one. Yield = annual dividend ÷ price, and an unusually high yield often signals danger.`,
        },
      ],
      quiz: [
        {
          id: 'u02-l05-q1',
          prompt: 'You own 10 shares at $600 and the company executes a 4-for-1 split. What do you own afterwards?',
          choices: [
            '40 shares at $150, worth $6,000',
            '10 shares at $150, worth $1,500',
            '40 shares at $600, worth $24,000',
            '2.5 shares at $600, worth $1,500',
          ],
          answerIdx: 0,
          explain:
            'A 4-for-1 split multiplies share count by four and divides price by four, so $6,000 stays $6,000. The "40 shares at $600" answer treats a split as free wealth — it is purely cosmetic, which is why a split announcement changes nothing about what the business is worth.',
        },
        {
          id: 'u02-l05-q2',
          prompt: 'To receive an upcoming dividend, when must you own the shares?',
          choices: [
            'You must buy on or after the ex-dividend date',
            'You must hold continuously for at least 90 days',
            'You must buy before the ex-dividend date',
            'You must buy on the payment date',
          ],
          answerIdx: 2,
          explain:
            'Buying on or after the ex-date means the dividend goes to the seller, not you — so you must own the shares before the ex-date. The 90-day answer confuses this with the *qualified dividend* holding period, which affects the tax rate rather than eligibility to receive the payment.',
        },
        {
          id: 'u02-l05-q3',
          prompt:
            'A stock trades at $100 and pays $1 per quarter. What is its dividend yield?',
          choices: [
            '1%',
            '2%',
            '4%',
            '12%',
          ],
          answerIdx: 2,
          explain:
            'Yield uses the *annual* dividend: $1 × 4 quarters = $4, and $4 / $100 = 4%. Answering 1% uses a single quarterly payment — a very common error that understates income by a factor of four whenever you compare stocks on yield.',
        },
        {
          id: 'u02-l05-q4',
          prompt: 'A stock’s dividend yield jumps from 3% to 11% without any change to the declared dividend. What most likely happened?',
          choices: [
            'The share price collapsed, and the dividend may be at risk of being cut',
            'The company raised its payout dramatically',
            'The stock split, raising the yield mechanically',
            'The ex-dividend date passed',
          ],
          answerIdx: 0,
          explain:
            'Yield is dividend divided by price, so with the dividend fixed the only way for it to triple is for the price to fall by about two-thirds — a classic yield trap, where the market is pricing in a cut. A split leaves yield unchanged, since price and dividend per share adjust together.',
        },
        {
          id: 'u02-l05-q5',
          prompt: 'What does a DRIP do?',
          choices: [
            'Defers the tax on dividends until you sell',
            'Automatically reinvests dividend cash into additional shares',
            'Guarantees the dividend will not be cut',
            'Converts dividends into qualified dividends',
          ],
          answerIdx: 1,
          explain:
            'A dividend reinvestment plan buys more shares (often fractional) with each payment, keeping the money compounding rather than sitting as cash. It does **not** defer tax: in a taxable account, reinvested dividends are still taxable in the year received.',
        },
      ],
      cardSeeds: [
        {
          id: 'u02-l05-c1',
          kind: 'basic',
          front: 'What changes for a shareholder in a 4-for-1 stock split?',
          back: 'Share count ×4, price ÷4. Position value, market cap, and ownership percentage are all unchanged — a split is cosmetic.',
        },
        {
          id: 'u02-l05-c2',
          kind: 'cloze',
          front:
            'To receive a dividend you must own the shares ____ the ex-dividend date.',
          back: 'before (buy on or after the ex-date and the seller keeps the dividend)',
        },
        {
          id: 'u02-l05-c3',
          kind: 'cloze',
          front: 'Dividend yield = ____ ÷ ____.',
          back: 'annual dividend per share ÷ share price',
        },
        {
          id: 'u02-l05-c4',
          kind: 'basic',
          front: 'What is a yield trap?',
          back: 'An unusually high dividend yield created by a collapsing share price rather than a generous payout — usually a signal the dividend is about to be cut.',
        },
      ],
    },

    // ── L06 ───────────────────────────────────────────────────────────────
    {
      id: 'u02-l06',
      unitId: 'u02',
      order: 6,
      title: 'Funds: ETFs vs. Mutual Funds',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A **fund** pools money from many investors and buys a basket of securities. One purchase, instant diversification. Two wrappers dominate:

- **Mutual fund** — you transact directly with the fund company. All orders on a given day fill at the **NAV** (net asset value) calculated once, after the 4pm ET close. No intraday price.
- **ETF** (exchange-traded fund) — trades on an exchange all day like a stock, with a bid, an ask, and a live price.

Same underlying idea, different plumbing — and the plumbing has real consequences.`,
        },
        {
          kind: 'text',
          md: `The dimension that matters most is **cost**. The **expense ratio** is the annual percentage of assets the fund deducts, charged continuously and silently against your balance.

- Broad index funds and ETFs: roughly **0.03%–0.20%**.
- Actively managed funds: commonly **0.50%–1.00%+**.

**Index vs. active.** An index fund mechanically tracks a rule-based benchmark like the S&P 500. An active fund pays a manager to pick. As Unit 1 covered, roughly 90% of active US large-cap funds trail their benchmark over 15 years — and their higher fee is the most reliable part of the difference.

ETFs also tend to be more **tax-efficient** in taxable accounts: their in-kind creation/redemption mechanism means they rarely distribute capital gains, whereas a mutual fund selling holdings to meet redemptions can hand you a taxable gain in a year you didn't sell anything.`,
        },
        {
          kind: 'example',
          md: `**What 0.65% costs over 30 years.** $10,000 invested, market returns **8%** before fees.

- **Index ETF at 0.05%** → nets 7.95% → $10,000 × 1.0795³⁰ ≈ **$98,300**
- **Active fund at 0.70%** → nets 7.30% → $10,000 × 1.0730³⁰ ≈ **$82,300**

A **0.65%** annual difference costs about **$16,000** — roughly 16% of the ending balance — and that's before the active fund's extra trading costs and taxable distributions.

Also note **NAV timing**: place a mutual fund order at 11am and you'll fill at that evening's NAV, not the price you saw. The same order in an ETF fills in a second at the current quote.`,
        },
        {
          kind: 'callout',
          md: `**Pitfall: judging a fund by last year's return.** Past performance is a famously weak predictor of future performance; the expense ratio is a nearly perfect predictor of a permanent, guaranteed drag. Two other ETF-specific things to check: **premium/discount** to NAV (usually trivial in big ETFs, meaningful in thin ones) and the **spread**, which is a trading cost on top of the expense ratio.`,
        },
        {
          kind: 'keypoint',
          md: `ETFs trade intraday at a live price; mutual funds fill once daily at NAV. Expense ratio is the most reliable predictor of long-run fund performance — index funds at 0.03–0.20% vs active at 0.50–1.00%+.`,
        },
      ],
      quiz: [
        {
          id: 'u02-l06-q1',
          prompt: 'You place a mutual fund buy order at 11:00am ET. At what price does it execute?',
          choices: [
            'The price quoted at 11:00am',
            'The next morning’s opening price',
            'The average price across the trading day',
            'That day’s NAV, calculated after the 4pm ET close',
          ],
          answerIdx: 3,
          explain:
            'Mutual funds price once per day: every order placed before the cutoff fills at that evening’s NAV. Expecting an 11am price applies ETF intuition to the wrong wrapper — mutual funds have no intraday price at all.',
        },
        {
          id: 'u02-l06-q2',
          prompt: 'Which is the most reliable predictor of a fund’s long-run relative performance?',
          choices: [
            'Its return over the past three years',
            'The size of its assets under management',
            'The tenure of its portfolio manager',
            'Its expense ratio',
          ],
          answerIdx: 3,
          explain:
            'Costs are certain and compound against you, while past returns have repeatedly proven to be a weak predictor of future returns. Chasing three-year performance is the single most common fund-selection mistake, because strong recent results usually reflect a style or sector that has just had its run.',
        },
        {
          id: 'u02-l06-q3',
          prompt:
            'Over 30 years at an 8% gross return, roughly how much does a 0.70% fund cost versus a 0.05% fund on a $10,000 investment?',
          choices: [
            'About $1,950',
            'About $6,500',
            'About $16,000',
            'About $40,000',
          ],
          answerIdx: 2,
          explain:
            'The balances end near $82,300 and $98,300 — about $16,000 apart, roughly 16% of the final value. The "$1,950" answer comes from multiplying 0.65% × 30 years × $10,000 and ignoring compounding, which is exactly why fee differences feel trivial until you run them properly.',
        },
        {
          id: 'u02-l06-q4',
          prompt: 'Why are ETFs generally more tax-efficient than mutual funds in a taxable account?',
          choices: [
            'ETFs use in-kind creation/redemption, so they rarely distribute capital gains',
            'ETF dividends are always tax-free',
            'ETFs are exempt from capital gains tax under SEC rules',
            'ETF gains are always taxed at long-term rates',
          ],
          answerIdx: 0,
          explain:
            'The in-kind mechanism lets an ETF hand appreciated securities to authorised participants instead of selling them, avoiding realised gains that would be passed to shareholders. Mutual funds meeting redemptions with actual sales can distribute a taxable gain even in a year you bought nothing — but ETF dividends are certainly not tax-free.',
        },
        {
          id: 'u02-l06-q5',
          prompt: 'What does an index fund do?',
          choices: [
            'Pays a manager to select the most undervalued stocks in a benchmark',
            'Guarantees a return equal to the index, net of all costs',
            'Mechanically tracks a rule-based benchmark such as the S&P 500',
            'Holds only the largest ten companies in a market',
          ],
          answerIdx: 2,
          explain:
            'Index funds replicate a published, rule-based benchmark rather than exercising judgement — which is what makes them so cheap to run. They do not *guarantee* the index return either: tracking error and the expense ratio mean you reliably earn slightly less than the index itself.',
        },
      ],
      cardSeeds: [
        {
          id: 'u02-l06-c1',
          kind: 'basic',
          front: 'ETF vs. mutual fund — how does each price and trade?',
          back: 'ETF: trades on an exchange all day at a live bid/ask. Mutual fund: transacts with the fund company, filling once daily at the NAV struck after the 4pm ET close.',
        },
        {
          id: 'u02-l06-c2',
          kind: 'basic',
          front: 'What is an expense ratio, and what are typical index vs. active levels?',
          back: 'The annual percentage of assets a fund deducts continuously. Broad index funds/ETFs: ~0.03–0.20%. Active funds: commonly 0.50–1.00%+.',
        },
        {
          id: 'u02-l06-c3',
          kind: 'cloze',
          front:
            'ETFs avoid distributing capital gains thanks to their ____ creation and redemption mechanism.',
          back: 'in-kind',
        },
        {
          id: 'u02-l06-c4',
          kind: 'basic',
          front: 'Why is the expense ratio a better fund-selection criterion than past returns?',
          back: 'Fees are certain, permanent, and compound against you; past performance has repeatedly proven a weak predictor of future performance.',
        },
      ],
    },

    // ── L07 ───────────────────────────────────────────────────────────────
    {
      id: 'u02-l07',
      unitId: 'u02',
      order: 7,
      title: 'Choosing a Broker and Account Types',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Most large US brokers now offer $0 commissions on stocks and ETFs, so the differentiators are elsewhere: fund selection and expense ratios, fractional shares, interest paid on idle cash, transfer fees, tools, and how painful customer service is when something goes wrong.

More consequential than the broker is the **account type**, because that determines the tax treatment of everything inside it.`,
        },
        {
          kind: 'text',
          md: `**Taxable brokerage account.** No contribution limit, no withdrawal restrictions. You owe tax on dividends each year and on gains when you sell. Maximum flexibility, minimum tax shelter.

**Traditional IRA / 401(k).** Contributions are typically pre-tax (a deduction now), the account grows untaxed, and withdrawals in retirement are taxed as ordinary income. Withdrawals before **59½** generally trigger a 10% penalty plus tax, and required minimum distributions eventually apply.

**Roth IRA / Roth 401(k).** Contributions are after-tax, and **qualified withdrawals are entirely tax-free** — growth included. Roth IRAs have income eligibility limits; you may also withdraw your own *contributions* (not earnings) at any time without penalty.

**HSA.** If you have a qualifying high-deductible health plan, it's the only triple-tax-advantaged account: deductible in, growth untaxed, and tax-free out for medical expenses.

Contribution limits are set annually by the IRS and adjusted for inflation — always check the current year's figures rather than trusting a number you memorised.`,
        },
        {
          kind: 'example',
          md: `**Traditional vs. Roth, in one comparison.** You have **$6,000** pre-tax to invest, it grows **8×** over your career, and we compare two flat tax scenarios.

- **Traditional:** the full $6,000 goes in (no tax now) → grows to **$48,000** → withdrawn at a 22% rate → **$37,440** spendable.
- **Roth:** you pay 24% tax first, so **$4,560** goes in → grows to **$36,480** → withdrawn tax-free → **$36,480** spendable.

The winner depends entirely on your tax rate **now versus in retirement**. Traditional wins if your future rate is lower; Roth wins if it's higher — which is why Roth is often favoured early in a career, when income (and the tax rate) is at its lowest.`,
        },
        {
          kind: 'callout',
          md: `**Misconception: "SIPC insures me against losses."** It does not. **SIPC** protects up to **$500,000** in securities (including a **$250,000** cash sublimit) if your *brokerage firm fails* and assets go missing. If your stocks simply fall 60%, that is the market doing its job and no insurance exists for it. Also remember **settlement**: under T+1, proceeds from a sale are available to withdraw the next business day, and trading with unsettled cash in a cash account can trigger a good-faith violation.`,
        },
        {
          kind: 'keypoint',
          md: `Account type beats broker choice. Traditional = deduction now, taxed later; Roth = taxed now, tax-free later. SIPC covers broker failure ($500k, $250k cash), never market losses.`,
        },
      ],
      quiz: [
        {
          id: 'u02-l07-q1',
          prompt: 'What does SIPC coverage actually protect you against?',
          choices: [
            'Losses when your stocks decline in value',
            'Missing assets if your brokerage firm fails, up to $500,000',
            'Fraud committed by a public company you invested in',
            'Any loss up to $250,000 for any reason',
          ],
          answerIdx: 1,
          explain:
            'SIPC steps in when a member brokerage fails and customer assets are missing, covering up to $500,000 in securities with a $250,000 cash sublimit. Believing it insures against market declines is dangerous — it would imply stocks carry no downside, which is the opposite of why they return anything.',
        },
        {
          id: 'u02-l07-q2',
          prompt: 'Which describes a Roth IRA?',
          choices: [
            'Pre-tax contributions, tax-free withdrawals',
            'Pre-tax contributions, withdrawals taxed at capital gains rates',
            'After-tax contributions, withdrawals taxed as ordinary income',
            'After-tax contributions, tax-free qualified withdrawals',
          ],
          answerIdx: 3,
          explain:
            'You fund a Roth with money you have already paid tax on, and in exchange qualified withdrawals — contributions *and* all growth — come out entirely tax-free. The option pairing pre-tax contributions with capital gains rates describes no real account — retirement account withdrawals are never taxed at capital gains rates.',
        },
        {
          id: 'u02-l07-q3',
          prompt:
            'You expect your tax rate to be substantially higher in retirement than it is today. Which account type is generally more favourable?',
          choices: [
            'Traditional, because the deduction is worth more',
            'Roth, because you pay tax now at your lower rate',
            'Taxable, because it avoids retirement rules entirely',
            'It makes no difference; the math is identical either way',
          ],
          answerIdx: 1,
          explain:
            'Roth pays the tax bill at today’s low rate and shelters all future growth from a higher one. The "identical math" answer holds only when your tax rate is the same in both periods — which is exactly the assumption that makes the choice matter when it fails.',
        },
        {
          id: 'u02-l07-q4',
          prompt: 'You sell shares on Monday. Under T+1 settlement, when are the proceeds settled and freely withdrawable?',
          choices: [
            'Immediately Monday',
            'Tuesday',
            'Wednesday',
            'The following Monday',
          ],
          answerIdx: 1,
          explain:
            'T+1 means settlement one business day after the trade, so Monday’s sale settles Tuesday. The proceeds may appear as buying power immediately, but they are unsettled — spending them and then selling again in a cash account can trigger a good-faith violation.',
        },
        {
          id: 'u02-l07-q5',
          prompt: 'Which account is the only one offering a triple tax advantage in the US?',
          choices: [
            'HSA',
            'Traditional 401(k)',
            'Roth IRA',
            'Taxable brokerage',
          ],
          answerIdx: 0,
          explain:
            'A health savings account is deductible going in, grows untaxed, and comes out tax-free for qualified medical expenses — three advantages rather than two. A Roth gives you two (untaxed growth and tax-free withdrawals) but no deduction on the way in.',
        },
      ],
      cardSeeds: [
        {
          id: 'u02-l07-c1',
          kind: 'basic',
          front: 'Traditional vs. Roth retirement accounts',
          back: 'Traditional: pre-tax contribution (deduction now), withdrawals taxed as ordinary income. Roth: after-tax contribution, qualified withdrawals entirely tax-free. Choose based on your tax rate now vs. in retirement.',
        },
        {
          id: 'u02-l07-c2',
          kind: 'cloze',
          front:
            'SIPC protects up to $____ in securities (with a $____ cash sublimit) if your ____ fails — not against market losses.',
          back: '$500,000; $250,000; brokerage firm',
        },
        {
          id: 'u02-l07-c3',
          kind: 'basic',
          front: 'Why is the HSA called triple tax-advantaged?',
          back: 'Contributions are deductible, growth is untaxed, and withdrawals for qualified medical expenses are tax-free. Requires a qualifying high-deductible health plan.',
        },
        {
          id: 'u02-l07-c4',
          kind: 'cloze',
          front:
            'Withdrawals from a traditional IRA or 401(k) before age ____ generally incur a 10% penalty plus income tax.',
          back: '59½',
        },
      ],
    },

    // ── L08 ───────────────────────────────────────────────────────────────
    {
      id: 'u02-l08',
      unitId: 'u02',
      order: 8,
      title: 'Taxes for Investors',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Tax is a return you control without predicting anything, which makes it unusually valuable to understand. These are general US federal rules — see the note at the end.

**Nothing is taxed until it's realised.** A stock that triples while you hold it creates no tax bill. Selling does.

**Holding period sets the rate:**

- **Short-term capital gain** — held **one year or less** → taxed as **ordinary income** (your marginal rate, up to 37%).
- **Long-term capital gain** — held **more than one year** → taxed at preferential rates of **0%, 15%, or 20%** depending on income.

The holding period starts the day *after* purchase, and "more than one year" means genuinely more — selling on the anniversary itself is still short-term.`,
        },
        {
          kind: 'text',
          md: `**Dividends** split the same way:

- **Qualified dividends** — from most US corporations, and held for more than 60 days within the 121-day window around the ex-dividend date → taxed at the **long-term** rates.
- **Ordinary (non-qualified) dividends** — including most REIT distributions and interest-like payments → taxed at ordinary income rates.

**Losses are useful.** Capital losses offset capital gains dollar for dollar. If losses exceed gains, you may deduct up to **$3,000** per year against ordinary income and carry the remainder forward indefinitely. Deliberately realising losses to offset gains is called **tax-loss harvesting**.

**Cost basis method.** By default brokers use FIFO — the first shares you bought are the first sold. **Specific identification** lets you nominate which lots to sell, which is how you control whether a sale lands short- or long-term. Choose it *before* the trade settles.`,
        },
        {
          kind: 'example',
          md: `**The wash-sale rule, concretely.** You bought 100 shares at **$50** ($5,000). They fall to **$30**, so you sell for **$3,000** and book a **$2,000 loss**.

- **Case A — you wait 31+ days to re-buy.** The $2,000 loss is deductible. Clean.
- **Case B — you re-buy 100 shares 10 days later at $32.** This is a **wash sale**: you sold at a loss and acquired a substantially identical security within **30 days before or after** the sale (a 61-day window centred on the sale). The loss is **disallowed** for now — it is added to the cost basis of the new shares, which becomes $3,200 + $2,000 = **$5,200**. You get the benefit eventually, when you finally sell without repurchasing.

**The rate difference, in dollars.** A $10,000 gain at a 32% ordinary rate costs **$3,200** in tax; the same gain held one day past the one-year mark at a 15% long-term rate costs **$1,500**. Waiting saved **$1,700** — 17% of the gain, for doing nothing.`,
        },
        {
          kind: 'callout',
          md: `**Wash-sale traps people miss:** it applies across *all* your accounts, including a purchase in your IRA (where the loss is then lost permanently) and, in most readings, a spouse's account. Automatic **DRIP** reinvestments can also silently trigger it. Note too that none of this applies inside a tax-advantaged account — no tax on gains, no deduction for losses, no harvesting.`,
        },
        {
          kind: 'callout',
          md: `**Educational, not tax advice.** These are simplified general US federal rules as of writing. Rates, brackets, and thresholds change, state taxes vary, and individual situations differ enormously. Nothing here is personalised tax, legal, or investment advice — consult a qualified professional before acting.`,
        },
        {
          kind: 'keypoint',
          md: `Held one year or less = short-term = ordinary income rates. Held more than one year = long-term = 0/15/20%. Wash sale = buying a substantially identical security within 30 days before or after a loss sale, which disallows the loss and shifts it into the new cost basis.`,
        },
      ],
      quiz: [
        {
          id: 'u02-l08-q1',
          prompt: 'You buy a stock on 10 March 2025 and sell it at a gain on 10 March 2026. How is the gain taxed?',
          choices: [
            'Long-term, because you held it for a full year',
            'It is not taxed, because you held it a full year',
            'Short-term, because the holding period must exceed one year',
            'Half short-term and half long-term',
          ],
          answerIdx: 2,
          explain:
            'Long-term treatment requires holding *more than* one year, and the clock starts the day after purchase — so selling on the anniversary is still short-term, taxed at ordinary rates. Waiting a single extra day can be worth a large percentage of the gain, which is why this off-by-one detail matters.',
        },
        {
          id: 'u02-l08-q2',
          prompt: 'What triggers the wash-sale rule?',
          choices: [
            'Selling any position within 30 days of purchase',
            'Selling a stock at a gain and re-buying it within 30 days',
            'Selling at a loss and buying a substantially identical security within 30 days before or after the sale',
            'Buying a stock in two different accounts in the same month',
          ],
          answerIdx: 2,
          explain:
            'The rule applies only to *loss* sales, and the window runs 30 days on each side — 61 days in total centred on the sale. Gains are never washed: the IRS is happy to tax those immediately, which is why the rule only ever works against you.',
        },
        {
          id: 'u02-l08-q3',
          prompt:
            'You sell at a $2,000 loss and re-buy the same stock 10 days later for $3,200. What happens to the loss?',
          choices: [
            'It is disallowed for now and added to the new shares’ cost basis, making it $5,200',
            'It is permanently forfeited',
            'It is deductible immediately anyway',
            'It can be deducted, but only against future dividends',
          ],
          answerIdx: 0,
          explain:
            'A wash sale defers rather than destroys the loss: it is rolled into the replacement shares’ basis ($3,200 + $2,000 = $5,200), so you receive the benefit when you eventually sell without repurchasing. The exception is a repurchase inside an IRA, where the loss genuinely is lost forever.',
        },
        {
          id: 'u02-l08-q4',
          prompt:
            'Your capital losses exceed your capital gains by $8,000 this year. What can you do?',
          choices: [
            'Deduct the full $8,000 against ordinary income this year',
            'Deduct $3,000 against ordinary income and carry $5,000 forward',
            'Deduct nothing — losses only offset gains',
            'Carry the entire $8,000 forward with no current deduction',
          ],
          answerIdx: 1,
          explain:
            'Excess capital losses are deductible against ordinary income up to $3,000 per year, with the remainder carried forward indefinitely. The "$8,000 all at once" answer ignores that annual cap, which is why large harvested losses often take several years to fully use.',
        },
        {
          id: 'u02-l08-q5',
          prompt: 'Which is true of a tax-advantaged account such as an IRA?',
          choices: [
            'Gains inside it are taxed annually at long-term rates',
            'Tax-loss harvesting works especially well there',
            'The wash-sale rule cannot affect it in any way',
            'Trades inside it generate no annual capital gains tax and no deductible losses',
          ],
          answerIdx: 3,
          explain:
            'Buying and selling inside a retirement account creates no current tax and no deductible losses, so harvesting is pointless there. And the wash-sale rule very much *can* reach in: repurchasing in an IRA after a taxable-account loss sale disallows the loss permanently.',
        },
      ],
      cardSeeds: [
        {
          id: 'u02-l08-c1',
          kind: 'cloze',
          front:
            'A capital gain is long-term when the asset is held ____ one year; otherwise it is short-term and taxed at ____ rates.',
          back: 'more than; ordinary income',
        },
        {
          id: 'u02-l08-c2',
          kind: 'basic',
          front: 'US long-term capital gains tax rates',
          back: '0%, 15%, or 20% depending on taxable income — well below ordinary income rates, which top out at 37%. (General US federal rules; not tax advice.)',
        },
        {
          id: 'u02-l08-c3',
          kind: 'basic',
          front: 'Define the wash-sale rule.',
          back: 'Selling at a loss and buying a substantially identical security within 30 days before or after the sale disallows the loss; it is added to the replacement shares’ cost basis instead.',
        },
        {
          id: 'u02-l08-c4',
          kind: 'cloze',
          front:
            'Excess capital losses may offset up to $____ of ordinary income per year, with the rest carried forward ____.',
          back: '$3,000; indefinitely',
        },
      ],
    },
  ],
}
