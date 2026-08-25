import type { Unit } from '@core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Unit 01 — Market Foundations
// The "why" and the vocabulary. Everything later units do assumes this.
// ─────────────────────────────────────────────────────────────────────────────

export const u01: Unit = {
  id: 'u01',
  title: 'Market Foundations',
  order: 1,
  description:
    'What a stock actually is, how markets work, why compounding is the whole game, and what realistically separates investors who do well from those who do not.',
  unlockAfter: null,
  lessons: [
    // ── L01 ───────────────────────────────────────────────────────────────
    {
      id: 'u01-l01',
      unitId: 'u01',
      order: 1,
      title: 'What Is a Stock?',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `A **stock** is a slice of ownership in a company. Not a lottery ticket, not a number that wiggles on a screen — a legal claim on a real business.

Companies divide their ownership into units called **shares**. Own one share out of a million and you own one-millionth of the company: one-millionth of its factories, its brand, its cash, and — the part that matters — one-millionth of every dollar of profit it will ever earn.`,
        },
        {
          kind: 'text',
          md: `That ownership comes with two real rights:

- **A claim on profits.** Companies can pay profits out as **dividends** or reinvest them to grow. Either way, the value belongs to shareholders.
- **A vote.** Usually one vote per share on things like electing the board of directors.

You are last in line, though. Employees, suppliers, and lenders all get paid before shareholders. That's why stocks are called *residual* claims — and it's the root of why they're risky.`,
        },
        {
          kind: 'example',
          md: `**Worked example.** Suppose a company has **1,000,000 shares outstanding** and the stock trades at **$40**.

- Total value of the company (its **market capitalization**) = 1,000,000 × $40 = **$40,000,000**.
- You buy **10 shares** for **$400**. You now own 10 / 1,000,000 = **0.001%** of the business.
- The company earns **$4,000,000** in profit this year. Your slice of that profit is 0.001% × $4,000,000 = **$40**.

Whether that $40 arrives as a dividend cheque or stays inside the company to fund growth, it is economically yours.`,
        },
        {
          kind: 'text',
          md: `Why do companies sell off pieces of themselves? To raise money without borrowing it.

When a company first sells shares to the public — an **IPO**, or initial public offering — the cash goes to the company. That's the **primary market**. After that, shares trade between investors on the **secondary market**, which is what you use when you buy through a broker.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "When I buy Apple stock, Apple gets my money."

Almost never. Once shares are issued, they change hands between investors. Your money goes to whoever sold you the share. Apple sees none of it. The company benefits *indirectly* — a higher share price makes it cheaper to raise money later and makes stock-based pay more valuable — but your purchase is not an investment *in* the company's bank account.`,
        },
        {
          kind: 'keypoint',
          md: `A share is a fractional ownership claim on a real business's future profits. Its long-run value comes from what the business earns, not from what the ticker did today.`,
        },
      ],
      quiz: [
        {
          id: 'u01-l01-q1',
          prompt:
            'A company has 500,000 shares outstanding and earns $2,000,000 in profit. You own 5,000 shares. What share of that profit is economically yours?',
          choices: ['$200', '$2,000', '$20,000', '$400,000'],
          answerIdx: 2,
          explain:
            'You own 5,000 / 500,000 = 1% of the company, so 1% × $2,000,000 = $20,000. The tempting wrong answer is $2,000 — that comes from dividing profit by share count ($4 per share) and forgetting to multiply by all 5,000 of your shares. Always compute your ownership fraction first, then apply it to the total.',
        },
        {
          id: 'u01-l01-q2',
          prompt:
            'You buy 20 shares of a large public company through your broker. Where does your money go?',
          choices: [
            'To the company, to fund its operations',
            'To the investor who sold you the shares',
            'To the exchange, which holds it in escrow',
            'To the company, minus a fee kept by the exchange',
          ],
          answerIdx: 1,
          explain:
            'Ordinary trades happen on the secondary market: shares move from one investor to another, and your cash goes to the seller. The company only receives money on the primary market — at its IPO or when it issues new shares later. Believing the company gets your cash makes buying stock feel like funding a business, which distorts how you think about price.',
        },
        {
          id: 'u01-l01-q3',
          prompt:
            'A company goes bankrupt and its assets are sold off. Who has the weakest claim on the proceeds?',
          choices: [
            'Bondholders and other lenders',
            'Employees owed wages',
            'Common shareholders',
            'Suppliers with unpaid invoices',
          ],
          answerIdx: 2,
          explain:
            'Shareholders hold a residual claim — they are paid only after every creditor is made whole, which in most bankruptcies means nothing. Bondholders feel like the risky choice because bonds are less famous, but debt sits above equity in the capital structure. This ordering is precisely why stocks must offer higher expected returns than bonds.',
        },
        {
          id: 'u01-l01-q4',
          prompt: 'Which statement best describes what a share of stock is?',
          choices: [
            'A loan you have made to the company that it must repay',
            'A contract that entitles you to buy the company\'s products at a discount',
            'A fractional ownership claim on the company\'s assets and future profits',
            'A government-guaranteed certificate whose value rises with inflation',
          ],
          answerIdx: 2,
          explain:
            'Equity is ownership. The tempting distractor is the loan answer — that describes a **bond**, where you are a creditor with a fixed repayment claim, not an owner. Owners have unlimited upside and can lose everything; lenders have capped upside and get paid first.',
        },
      ],
      cardSeeds: [
        {
          id: 'u01-l01-c1',
          kind: 'basic',
          front: 'What is a share of stock?',
          back: 'A fractional ownership claim on a company — its assets, and its future profits. Comes with a vote and a residual claim on earnings.',
        },
        {
          id: 'u01-l01-c2',
          kind: 'basic',
          front: 'Primary market vs. secondary market',
          back: 'Primary: the company issues new shares and receives the cash (e.g. an IPO). Secondary: investors trade existing shares with each other — the company receives nothing.',
        },
        {
          id: 'u01-l01-c3',
          kind: 'cloze',
          front:
            'In a bankruptcy, common shareholders are paid ____ — after all creditors are made whole.',
          back: 'last (they hold a *residual* claim)',
        },
        {
          id: 'u01-l01-c4',
          kind: 'basic',
          front: 'Formula: market capitalization',
          back: 'Market cap = share price × shares outstanding. It is the market\'s price for the whole equity of the business.',
        },
      ],
    },

    // ── L02 ───────────────────────────────────────────────────────────────
    {
      id: 'u01-l02',
      unitId: 'u01',
      order: 2,
      title: 'How Markets Work',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A stock market is not a place where prices are *set*. It's a place where buyers and sellers **meet**, and the price is whatever the most recent pair of them agreed on.

In the US the two big venues are the **NYSE** (New York Stock Exchange) and the **Nasdaq**. Historically the NYSE ran on a physical trading floor with human specialists and Nasdaq was electronic from the start; today both are overwhelmingly computerized and the practical differences for you are close to zero.`,
        },
        {
          kind: 'text',
          md: `Every exchange runs an **order book** — a live list of what people want to do:

- **Bids**: the prices buyers are willing to pay, best (highest) at the top.
- **Asks** (or offers): the prices sellers will accept, best (lowest) at the top.

A trade happens the instant a bid and an ask overlap. That's it. The "price of the stock" is simply the price of the last trade that printed.`,
        },
        {
          kind: 'example',
          md: `**Walk a trade through.** You tap *Buy 10 shares* in your broker's app at 10:32am.

1. Your broker routes the order to an exchange or a market maker.
2. The book shows the best ask at **$50.10** for 400 shares.
3. Your 10 shares match instantly against that ask. The trade **prints** at $50.10.
4. Your broker's confirmation says *filled: 10 @ $50.10*, total **$501.00**.
5. **Settlement** happens the next business day (**T+1** in the US since May 2024) — that's when the shares legally become yours and the cash actually leaves.

Elapsed time for steps 1–4: well under a second.`,
        },
        {
          kind: 'text',
          md: `Regular US trading hours are **9:30am to 4:00pm Eastern**, Monday to Friday, minus holidays. There is pre-market and after-hours trading, but volume is thin, spreads are wide, and prices move erratically — a bad place for a beginner to be.

Behind the scenes, **market makers** quote both a bid and an ask continuously and earn the difference. They're the reason your order fills instantly even when no other human wants to trade with you right now.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "The exchange decides the price" or "the company sets the price."

Neither. Nobody sets a stock price. The last trade prints wherever a willing buyer and a willing seller crossed. A company can influence its *value* through performance, but it cannot set its *price* — and when you see a stock "gap" overnight, that's just the first trade of the morning printing at a level buyers and sellers newly agree on.`,
        },
        {
          kind: 'keypoint',
          md: `Price is the last agreed transaction, produced by an order book of bids and asks. Regular hours are 9:30–16:00 ET; US trades settle T+1.`,
        },
      ],
      quiz: [
        {
          id: 'u01-l02-q1',
          prompt: 'What does the "price" of a stock on your screen actually represent?',
          choices: [
            'The price the exchange has set for the next trading session',
            'The average of all trades so far today',
            'The price at which the most recent trade executed',
            'The value the company\'s accountants assign to one share',
          ],
          answerIdx: 2,
          explain:
            'The quoted last price is simply the print of the most recent completed trade. The "average of all trades" answer is tempting because that number does exist — it is called VWAP and traders use it — but it is not what your ticker shows. And accounting book value is a separate concept entirely, usually far from market price.',
        },
        {
          id: 'u01-l02-q2',
          prompt: 'In an order book, the "ask" is:',
          choices: [
            'The lowest price a seller is currently willing to accept',
            'The highest price a buyer is currently willing to pay',
            'The price at which the stock opened this morning',
            'A fee charged by the exchange per share traded',
          ],
          answerIdx: 0,
          explain:
            'Ask = the best (lowest) offer from sellers; bid = the best (highest) offer from buyers. Mixing these up is the single most common beginner slip. Remember it from your own side: you **buy at the ask** and **sell at the bid**, which means you always cross the spread and always start slightly behind.',
        },
        {
          id: 'u01-l02-q3',
          prompt: 'You buy shares on a Tuesday during regular hours. Under US T+1 settlement, when does the transaction officially settle?',
          choices: [
            'Immediately, at the moment of the fill',
            'Wednesday (the next business day)',
            'Thursday (two business days later)',
            'The following Monday',
          ],
          answerIdx: 1,
          explain:
            'The US moved from T+2 to **T+1** in May 2024, so a Tuesday trade settles Wednesday. Execution and settlement are different events: your fill is instant, but legal transfer of shares and cash happens the next business day. The T+2 answer was correct for years, which is why stale advice still repeats it.',
        },
        {
          id: 'u01-l02-q4',
          prompt: 'Why can your small market order fill in under a second even if no other individual investor wants to trade at that exact moment?',
          choices: [
            'The exchange lends you the shares until a buyer appears',
            'Market makers continuously quote both sides and take the other side of your trade',
            'The company issues new shares on demand to satisfy orders',
            'Your broker holds the order until the closing auction',
          ],
          answerIdx: 1,
          explain:
            'Market makers provide continuous two-sided quotes and earn the bid-ask spread for supplying that liquidity. The "company issues new shares" answer confuses the secondary market with the primary market — companies do not print shares to fill your 10-share order.',
        },
        {
          id: 'u01-l02-q5',
          prompt: 'Which is the most accurate reason for a beginner to avoid after-hours trading?',
          choices: [
            'Trades placed after hours are not legally binding',
            'Prices are frozen until the next open, so orders cannot fill',
            'Volume is thin and spreads are wide, so you get worse prices',
            'Brokers are prohibited from routing retail orders after 4pm ET',
          ],
          answerIdx: 2,
          explain:
            'After-hours sessions have far fewer participants, which widens the bid-ask spread and lets small orders move prices sharply. The trades are perfectly binding and perfectly legal — the problem is purely execution quality, which is exactly the kind of hidden cost this course keeps returning to.',
        },
      ],
      cardSeeds: [
        {
          id: 'u01-l02-c1',
          kind: 'basic',
          front: 'Bid vs. ask',
          back: 'Bid = highest price a buyer will pay. Ask = lowest price a seller will accept. You buy at the ask and sell at the bid.',
        },
        {
          id: 'u01-l02-c2',
          kind: 'cloze',
          front: 'US regular trading hours are ____ to ____ Eastern time.',
          back: '9:30am to 4:00pm ET, Monday–Friday (excluding market holidays)',
        },
        {
          id: 'u01-l02-c3',
          kind: 'basic',
          front: 'What does T+1 settlement mean?',
          back: 'A US stock trade legally settles one business day after execution — that is when shares and cash actually change hands. (Changed from T+2 in May 2024.)',
        },
        {
          id: 'u01-l02-c4',
          kind: 'basic',
          front: 'What does a market maker do, and how is it paid?',
          back: 'Continuously quotes a bid and an ask so orders can fill instantly. It earns the bid-ask spread as compensation for providing liquidity.',
        },
      ],
    },

    // ── L03 ───────────────────────────────────────────────────────────────
    {
      id: 'u01-l03',
      unitId: 'u01',
      order: 3,
      title: 'Market Indices',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `When a headline says *"the market was up today,"* it means an **index** rose. An index is just a recipe: pick a basket of stocks, weight them by a rule, and track the basket's value over time.

The three you'll hear constantly:

- **S&P 500** — about 500 large US companies, weighted by float-adjusted market cap. The default proxy for "the US stock market."
- **Dow Jones Industrial Average** — only 30 companies, and weighted by *share price*, which is a 19th-century quirk.
- **Nasdaq Composite** — every stock listed on the Nasdaq exchange (thousands), market-cap weighted and heavily tilted toward technology.`,
        },
        {
          kind: 'text',
          md: `**Weighting is the whole story.** In a market-cap-weighted index like the S&P 500, a company's influence is proportional to its total value, so the largest handful of companies can drive most of the move. In the price-weighted Dow, a $500 stock has ten times the influence of a $50 stock even if the $50 company is far bigger.

That's why the Dow is a poor market gauge and the S&P 500 is the one professionals actually benchmark against.`,
        },
        {
          kind: 'example',
          md: `**Why price-weighting is weird.** Take a two-stock price-weighted index:

- Stock A: **$500** per share, 1 million shares → market cap **$500M**
- Stock B: **$50** per share, 100 million shares → market cap **$5,000M** (10× bigger company)

Stock A rises 10% (+$50). Stock B rises 10% (+$5). The index adds the price moves: A contributes ten times more to the index than B, despite being one-tenth the company. Market-cap weighting would have given B ten times A's influence — the sensible way round.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "The Dow is at 44,000 and the S&P 500 is at 6,000, so the Dow is doing better."

Index *levels* are meaningless across indices — they're artifacts of history and divisors, not scores. Only **percentage changes** are comparable. Similarly, "the Dow fell 400 points" tells you nothing until you convert it: 400 points on 44,000 is under 1%.`,
        },
        {
          kind: 'keypoint',
          md: `The S&P 500 (500 large US companies, market-cap weighted) is the standard benchmark. Compare indices by percentage change, never by level or point moves.`,
        },
      ],
      quiz: [
        {
          id: 'u01-l03-q1',
          prompt: 'Which index is the standard benchmark professionals use for "the US stock market"?',
          choices: [
            'The Dow Jones Industrial Average',
            'The S&P 500',
            'The Nasdaq Composite',
            'The VIX',
          ],
          answerIdx: 1,
          explain:
            'The S&P 500 covers roughly 500 large-cap US companies weighted by market value, making it broad and economically representative. The Dow is famous but holds only 30 names and uses price weighting; the VIX is not an index of stocks at all — it measures expected volatility.',
        },
        {
          id: 'u01-l03-q2',
          prompt: 'In a price-weighted index, which stock has the greatest influence on the index?',
          choices: [
            'The one with the largest market capitalization',
            'The one with the most shares outstanding',
            'The one with the highest share price',
            'The one with the highest trading volume',
          ],
          answerIdx: 2,
          explain:
            'Price weighting sums share prices, so the highest-priced stock dominates regardless of company size. Choosing "largest market cap" describes a **market-cap-weighted** index like the S&P 500 — the distinction matters because it explains why the Dow can diverge from the broader market for purely mechanical reasons.',
        },
        {
          id: 'u01-l03-q3',
          prompt:
            'The Dow falls 300 points from 44,000 while the S&P 500 falls 60 points from 6,000. Which index had the larger decline?',
          choices: [
            'The Dow, since 300 points is five times 60 points',
            'The S&P 500 — about 1.0% versus the Dow\'s roughly 0.7%',
            'They declined equally once you adjust for the number of companies',
            'The Dow, because its components are larger companies',
          ],
          answerIdx: 1,
          explain:
            'Convert to percentages before comparing: 300 / 44,000 is about 0.7%, but 60 / 6,000 is 1.0%. The bigger point move was the smaller decline. Headlines quote points because they sound dramatic, but points depend on an index\'s arbitrary level — always divide first.',
        },
        {
          id: 'u01-l03-q4',
          prompt: 'The Nasdaq Composite fell 2% while the S&P 500 fell 0.7% on the same day. What is the most likely explanation?',
          choices: [
            'The Nasdaq contains fewer companies, so it is more volatile',
            'The Nasdaq is heavily weighted toward technology, which sold off harder that day',
            'The Nasdaq is price-weighted, amplifying moves in expensive stocks',
            'The Nasdaq includes international stocks that traded overnight',
          ],
          answerIdx: 1,
          explain:
            'The Nasdaq Composite is market-cap weighted and dominated by large technology companies, so tech-driven days show up amplified there. It actually contains *more* companies than the S&P 500, not fewer, and it is not price-weighted — that is the Dow.',
        },
      ],
      cardSeeds: [
        {
          id: 'u01-l03-c1',
          kind: 'basic',
          front: 'What is the S&P 500, and how is it weighted?',
          back: 'An index of about 500 large US companies, weighted by float-adjusted market capitalization. The standard benchmark for the US stock market.',
        },
        {
          id: 'u01-l03-c2',
          kind: 'cloze',
          front:
            'The Dow Jones Industrial Average holds only ____ companies and is weighted by ____.',
          back: '30 companies; share price (price-weighted)',
        },
        {
          id: 'u01-l03-c3',
          kind: 'basic',
          front: 'Why can you not compare two indices by their point moves?',
          back: 'Index levels are historical artifacts with different scales and divisors. Only percentage changes are comparable.',
        },
      ],
    },

    // ── L04 ───────────────────────────────────────────────────────────────
    {
      id: 'u01-l04',
      unitId: 'u01',
      order: 4,
      title: 'The Power of Compounding',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Compounding is earning returns **on your previous returns**. It sounds mild. It is the single most important force in investing, and human intuition is terrible at it — we instinctively extrapolate in straight lines while compounding curves upward.

The US stock market has historically returned roughly **10% per year nominally** over the long run, or about **7% after inflation**. Those are averages across decades, not a promise about any given year — most individual years land nowhere near 10%.`,
        },
        {
          kind: 'text',
          md: `**The Rule of 72** is the mental shortcut worth memorizing:

> Years to double ≈ **72 ÷ annual return %**

- At 8%: 72 ÷ 8 = **9 years** to double
- At 6%: 72 ÷ 6 = **12 years**
- At 3%: 72 ÷ 3 = **24 years**

Notice how brutal that last one is. Halving your return doesn't halve your outcome — it devastates it, because you get far fewer doublings inside a lifetime.`,
        },
        {
          kind: 'example',
          md: `**Two investors, one difference: ten years.** Both invest **$10,000 once** and earn **8% per year** until age 65.

- **Ana invests at 25** → 40 years of growth → $10,000 × 1.08⁴⁰ ≈ **$217,000**
- **Ben invests at 35** → 30 years of growth → $10,000 × 1.08³⁰ ≈ **$101,000**

Same money, same return. Ana ends with **more than double** Ben's balance because she bought ten extra years — which, at 8%, is one extra doubling plus change.

**And with regular contributions:** $200/month at 8% for 30 years grows to roughly **$298,000**, of which only **$72,000** is money you deposited. The other ~$226,000 is compounding.`,
        },
        {
          kind: 'callout',
          md: `**The mirror image: fees compound too.** A 1% annual fee doesn't cost you 1%. Over 30 years at 8% vs 7%, a $10,000 investment grows to about $100,600 versus $76,100 — the "small" 1% fee quietly ate roughly **a quarter of your final wealth**. This is why expense ratios get their own lesson later.`,
        },
        {
          kind: 'keypoint',
          md: `Rule of 72: years to double ≈ 72 ÷ return%. Time in the market is the dominant variable — and fees, which compound against you, are the dominant controllable cost.`,
        },
      ],
      quiz: [
        {
          id: 'u01-l04-q1',
          prompt: 'Using the Rule of 72, roughly how long does money take to double at a 9% annual return?',
          choices: ['4 years', '8 years', '12 years', '18 years'],
          answerIdx: 1,
          explain:
            '72 ÷ 9 = 8 years. The tempting error is dividing 72 by 9 incorrectly or reaching for 100 ÷ 9 ≈ 11. The constant is 72 precisely because it approximates the logarithmic math well for returns in the 4–12% range — it drifts a bit at extremes.',
        },
        {
          id: 'u01-l04-q2',
          prompt:
            'Ana invests $10,000 at age 25 and Ben invests the same $10,000 at 35. Both earn 8% until 65 and neither adds another dollar. Roughly how do their final balances compare?',
          choices: [
            'Ana ends with about 33% more, since she invested for 33% longer',
            'They end up nearly equal, because the same money earns the same rate',
            'Ana ends with roughly double Ben\'s balance',
            'Ben ends ahead, because his money compounded over a shorter, more recent period',
          ],
          answerIdx: 2,
          explain:
            'Ana gets 40 years of compounding (≈$217,000) versus Ben\'s 30 (≈$101,000) — more than double. The "33% more" answer is the classic linear-thinking trap: growth is exponential, so an extra 10 years at 8% adds a full doubling, not a proportional slice.',
        },
        {
          id: 'u01-l04-q3',
          prompt: 'Why does a seemingly small 1% annual fee matter so much over decades?',
          choices: [
            'Because brokers charge the fee on gains, not on the balance',
            'Because the fee is deducted from every trade you place',
            'Because the fee reduces the base that compounds, and the shortfall itself compounds',
            'Because fees are taxed at a higher rate than capital gains',
          ],
          answerIdx: 2,
          explain:
            'Every dollar taken as a fee is a dollar that never compounds again, so the gap widens exponentially — a 1% drag can cost roughly a quarter of final wealth over 30 years. The "deducted from every trade" answer confuses an ongoing expense ratio with per-trade commissions; expense ratios are charged continuously against assets.',
        },
        {
          id: 'u01-l04-q4',
          prompt:
            'The long-run US stock market return is often quoted as about 10% per year nominal. What does that figure mean in practice?',
          choices: [
            'Most individual years land close to 10%',
            'It is an average across decades; individual years vary wildly and are often negative',
            'It is a floor guaranteed over any 10-year period',
            'It is the return after inflation and fees',
          ],
          answerIdx: 1,
          explain:
            'The ~10% figure is a long-run average, and yearly outcomes are scattered far from it — big double-digit gains and losses are normal, and years landing near +10% are actually rare. It is also *before* inflation: the real historical figure is closer to 7%.',
        },
        {
          id: 'u01-l04-q5',
          prompt:
            'You contribute $200/month for 30 years and end with roughly $298,000 at an 8% return. About how much of that did you actually deposit?',
          choices: ['$72,000', '$120,000', '$226,000', '$298,000'],
          answerIdx: 0,
          explain:
            '$200 × 12 months × 30 years = $72,000 of contributions; the remaining ~$226,000 is compound growth. People typically guess much higher for the contribution share, which is exactly the intuition failure that makes compounding feel unbelievable until you run the numbers.',
        },
      ],
      cardSeeds: [
        {
          id: 'u01-l04-c1',
          kind: 'cloze',
          front: 'Rule of 72: years to double ≈ ____ ÷ ____.',
          back: '72 ÷ the annual return percentage (e.g. 72 ÷ 8% = 9 years)',
        },
        {
          id: 'u01-l04-c2',
          kind: 'basic',
          front: 'Long-run historical US stock market return, nominal and real?',
          back: 'Roughly 10% per year nominal; roughly 7% per year after inflation. Long-run averages only — single years vary enormously.',
        },
        {
          id: 'u01-l04-c3',
          kind: 'basic',
          front: 'Why does a 1% annual fee cost far more than 1% of your wealth?',
          back: 'The fee removes capital that would otherwise compound. Over ~30 years a 1% drag can consume roughly a quarter of the final balance.',
        },
        {
          id: 'u01-l04-c4',
          kind: 'basic',
          front: 'What is compounding?',
          back: 'Earning returns on prior returns, so growth is exponential rather than linear. Time invested is the variable it is most sensitive to.',
        },
      ],
    },

    // ── L05 ───────────────────────────────────────────────────────────────
    {
      id: 'u01-l05',
      unitId: 'u01',
      order: 5,
      title: 'Risk and Return',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `In finance, **risk** doesn't mean "bad things might happen." It means **uncertainty of outcome** — the range of results you might get, not just the ugly end of it.

The everyday measure is **volatility**: how much returns bounce around their average, usually reported as standard deviation. The S&P 500's annual return standard deviation is historically around **15–20%**. So a "typical" year for a market with a 10% average might land anywhere from roughly −8% to +28% — and worse years happen regularly.`,
        },
        {
          kind: 'text',
          md: `Why must riskier assets *offer* higher returns? Because nobody would hold them otherwise.

If a volatile stock and a Treasury bill offered the same expected return, every rational investor would take the T-bill. So the stock's price must fall until its expected return is high enough to compensate — that extra expected return is the **risk premium**. Note the word *expected*: it's compensation for bearing uncertainty, not a payout you're owed.`,
        },
        {
          kind: 'example',
          md: `**Two portfolios, same average, different rides.**

- **Portfolio A** returns +7%, +7%, +7% → $10,000 becomes **$12,250**
- **Portfolio B** returns +40%, −30%, +11% → $10,000 becomes 10,000 × 1.40 × 0.70 × 1.11 ≈ **$10,878**

Both average +7% per year arithmetically. B ends **12% poorer**, because volatility drags on compounded growth: a 30% loss requires a ~43% gain just to get back to even. This is why controlling risk isn't timidity — it's arithmetic.`,
        },
        {
          kind: 'text',
          md: `**Diversification** is the one genuinely free improvement available. Owning many stocks whose fortunes don't move in lockstep cancels out company-specific bad luck — a fraud, a failed product, a lost lawsuit.

What it *cannot* remove is **market risk**: recessions, rate shocks, and panics hit nearly everything at once. So risk splits in two:

- **Idiosyncratic (company-specific) risk** → diversifiable, and the market pays you nothing for bearing it.
- **Systematic (market) risk** → not diversifiable, and this is what the risk premium compensates.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Higher risk means higher returns."

It means higher **expected** returns *and* a wider range of outcomes — including permanent loss. If risk reliably paid off, it wouldn't be risk. And taking company-specific risk you could have diversified away is simply unpaid risk: more variance, no extra expected reward.`,
        },
        {
          kind: 'keypoint',
          md: `Risk is uncertainty, measured by volatility. Higher risk buys higher *expected* return only for undiversifiable market risk — company-specific risk is uncompensated, so diversify it away.`,
        },
      ],
      quiz: [
        {
          id: 'u01-l05-q1',
          prompt: 'Portfolio B returns +40%, −30%, then +11%; Portfolio A returns +7% three years running. What is true?',
          choices: [
            'B ends ahead because its best year was much larger',
            'They end equal, since both average +7% per year',
            'A ends ahead, because volatility drags on compounded growth',
            'B ends ahead, but only after taxes',
          ],
          answerIdx: 2,
          explain:
            'Compounding multiplies, it does not add: 1.40 × 0.70 × 1.11 ≈ 1.088 versus 1.07³ ≈ 1.225. Equal *arithmetic* averages do not mean equal ending wealth — the volatile path loses because a 30% loss needs a ~43% gain to recover. This gap between arithmetic and geometric returns is why big drawdowns matter so much.',
        },
        {
          id: 'u01-l05-q2',
          prompt: 'Which risk does diversification across many companies mainly eliminate?',
          choices: [
            'Company-specific (idiosyncratic) risk',
            'Recession risk',
            'Interest-rate risk',
            'Inflation risk',
          ],
          answerIdx: 0,
          explain:
            'Spreading across many businesses averages away single-company disasters — a fraud or failed product in one holding barely dents the portfolio. Recessions, rate moves, and inflation are **systematic** risks that hit nearly all stocks at once, so no amount of diversification within stocks removes them.',
        },
        {
          id: 'u01-l05-q3',
          prompt: 'A stock is far riskier than a Treasury bill. What does finance theory say this implies?',
          choices: [
            'The stock will outperform the T-bill over any 10-year period',
            'The stock has a higher expected return, with a much wider range of possible outcomes',
            'The stock is a better investment for everyone regardless of horizon',
            'The stock\'s price is guaranteed to be more efficient',
          ],
          answerIdx: 1,
          explain:
            'Risk buys a higher *expected* return — an average across many possible futures — not a guaranteed one. The "will outperform over 10 years" answer is the seductive version of the same idea, but stocks have underperformed cash over decade-long stretches; if the payoff were guaranteed there would be no risk to compensate.',
        },
        {
          id: 'u01-l05-q4',
          prompt: 'You hold a single stock instead of a broad fund. How does the market reward you for that extra risk?',
          choices: [
            'With a higher expected return proportional to the extra volatility',
            'With a dividend premium paid by the exchange',
            'It does not — company-specific risk is uncompensated',
            'With lower taxes on any eventual gains',
          ],
          answerIdx: 2,
          explain:
            'Because that risk *could* have been diversified away for free, the market prices in no premium for bearing it. You get more variance for the same expected return — the definition of a bad trade. Only undiversifiable systematic risk earns the risk premium.',
        },
        {
          id: 'u01-l05-q5',
          prompt: 'Your portfolio drops 30%. What percentage gain is needed just to return to the starting value?',
          choices: ['30%', 'About 37%', 'About 43%', '70%'],
          answerIdx: 2,
          explain:
            '$100 falling 30% leaves $70, and $70 must rise by $30 — that is 30/70 ≈ 43%. Answering 30% treats losses and gains as symmetric, which they are not: the bigger the drawdown the more asymmetric it becomes (a 50% loss needs a 100% gain).',
        },
      ],
      cardSeeds: [
        {
          id: 'u01-l05-c1',
          kind: 'basic',
          front: 'What does "risk" mean in finance, and how is it commonly measured?',
          back: 'Uncertainty about the range of outcomes — not just downside. Commonly measured as volatility (standard deviation of returns).',
        },
        {
          id: 'u01-l05-c2',
          kind: 'basic',
          front: 'Systematic vs. idiosyncratic risk',
          back: 'Systematic = market-wide (recessions, rates); undiversifiable and compensated by the risk premium. Idiosyncratic = company-specific; diversifiable and uncompensated.',
        },
        {
          id: 'u01-l05-c3',
          kind: 'cloze',
          front: 'After a 50% loss, you need a ____% gain just to break even.',
          back: '100% — losses and gains are asymmetric (a 30% loss needs ~43%).',
        },
        {
          id: 'u01-l05-c4',
          kind: 'basic',
          front: 'What is the risk premium?',
          back: 'The extra *expected* return an asset must offer above the risk-free rate to persuade investors to bear its undiversifiable risk.',
        },
      ],
    },

    // ── L06 ───────────────────────────────────────────────────────────────
    {
      id: 'u01-l06',
      unitId: 'u01',
      order: 6,
      title: 'Bulls, Bears, and Cycles',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Markets don't go up in a straight line — they go up in a jagged, terrifying, upward scribble. Learning the vocabulary of that scribble helps you recognise a normal event as normal while it's happening.

The conventional thresholds, measured from the most recent peak:

- **Pullback**: −5% or so. Happens constantly; barely news.
- **Correction**: **−10%**. Roughly once a year on average.
- **Bear market**: **−20%**. Historically every ~5–6 years.
- **Crash**: no formal definition — a very fast, very large drop.

A **bull market** is the long recovery and expansion between bears. Note the asymmetry: bull markets tend to last years, bears tend to last months.`,
        },
        {
          kind: 'example',
          md: `**Four bears worth knowing (S&P 500, peak to trough):**

| Episode | Decline | Duration | Recovery |
|---|---|---|---|
| Dot-com bust (2000–2002) | about −49% | ~2.5 years | ~7 years |
| Global financial crisis (2007–2009) | about −57% | ~1.4 years | ~5.5 years |
| COVID crash (Feb–Mar 2020) | about −34% | **33 days** | ~5 months |
| Rate-shock bear (2022) | about −25% | ~9 months | ~2 years |

The pattern isn't "they always bounce back quickly" — COVID was unusually fast and 2000 took most of a decade. The pattern is that broad indices have, so far, always eventually made new highs — while individual companies frequently have not.`,
        },
        {
          kind: 'text',
          md: `Bear markets usually cluster with recessions, credit stress, or rate shocks, and they feel maximally hopeless right at the bottom — that's not a coincidence, it's *why* the bottom is the bottom. Prices fall until the marginal panicked seller has sold.

The practical consequence: the days when it is most emotionally obvious to sell are historically the worst days to sell, and a handful of the market's best days tend to occur within weeks of its worst days.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "I'll just get out before the bear market and buy back at the bottom."

This requires being right twice, and the second call is harder than the first. Missing even a small number of the market's best days — which cluster inside downturns, right when you're most likely to be sitting in cash — has historically gutted long-run returns. "Time in the market beats timing the market" survives as a cliché because the data keeps supporting it.`,
        },
        {
          kind: 'keypoint',
          md: `Correction = −10% from the peak, bear market = −20%. Both are routine features of a market that has still trended upward over decades — plan for them rather than reacting to them.`,
        },
      ],
      quiz: [
        {
          id: 'u01-l06-q1',
          prompt: 'A broad index falls 12% from its recent high. What is this conventionally called?',
          choices: ['A pullback', 'A correction', 'A bear market', 'A crash'],
          answerIdx: 1,
          explain:
            'A correction is a decline of 10% or more from the peak; a bear market requires 20%. People reach for "bear market" because 12% feels dramatic in the moment, but the labels are arithmetic, not emotional — and knowing that helps you keep perspective.',
        },
        {
          id: 'u01-l06-q2',
          prompt: 'Which bear market had the fastest decline of those listed?',
          choices: [
            'The dot-com bust (2000–2002)',
            'The global financial crisis (2007–2009)',
            'The COVID crash (February–March 2020)',
            'The 2022 rate-shock bear',
          ],
          answerIdx: 2,
          explain:
            'The COVID crash took the S&P 500 down about 34% in roughly 33 days — the fastest bear market on record — and recovered within months. The GFC was deeper (about −57%) but unfolded over more than a year, showing that depth and speed are separate dimensions of a downturn.',
        },
        {
          id: 'u01-l06-q3',
          prompt: 'What is the core problem with the plan "sell before the crash, buy back at the bottom"?',
          choices: [
            'Brokers charge higher fees on large sales',
            'It requires two correct calls, and the market\'s best days cluster near its worst',
            'You cannot re-buy the same stock within 30 days',
            'Bear markets are never visible in advance, but bottoms always are',
          ],
          answerIdx: 1,
          explain:
            'Exiting is only half the trade; re-entry is the harder half, because the sharpest rallies happen amid the worst sentiment, when a market-timer is sitting in cash. The 30-day answer confuses this with the wash-sale rule, which only disallows a *tax loss* — it never prevents you from re-buying.',
        },
        {
          id: 'u01-l06-q4',
          prompt: 'Which statement about long-run market history is best supported?',
          choices: [
            'Broad indices have always recovered to new highs, and so have individual stocks',
            'Broad indices have historically recovered to new highs, though individual companies often never do',
            'Bear markets typically last longer than bull markets',
            'Recoveries reliably take less than a year',
          ],
          answerIdx: 1,
          explain:
            'Diversified indices have so far gone on to new highs because failing companies are replaced by growing ones — but that survivorship does not extend to individual stocks, many of which never recover. Bulls also last far longer than bears on average, and recovery times have ranged from months (2020) to years (2000).',
        },
      ],
      cardSeeds: [
        {
          id: 'u01-l06-c1',
          kind: 'cloze',
          front:
            'A ____ is a decline of 10% from the peak; a ____ market is a decline of 20%.',
          back: 'correction; bear',
        },
        {
          id: 'u01-l06-c2',
          kind: 'basic',
          front: 'Roughly how often do corrections and bear markets occur historically?',
          back: 'Corrections (−10%) roughly once a year on average; bear markets (−20%) roughly every 5–6 years.',
        },
        {
          id: 'u01-l06-c3',
          kind: 'basic',
          front: 'How deep was the 2007–2009 S&P 500 bear market, and the 2020 COVID crash?',
          back: 'GFC: about −57% over ~1.4 years. COVID: about −34% in only ~33 days, the fastest bear market on record.',
        },
        {
          id: 'u01-l06-c4',
          kind: 'basic',
          front: 'Why is market timing so hard even for someone who correctly predicts a crash?',
          back: 'It needs two correct calls — exit and re-entry — and the best rebound days cluster right beside the worst days, when a timer is usually in cash.',
        },
      ],
    },

    // ── L07 ───────────────────────────────────────────────────────────────
    {
      id: 'u01-l07',
      unitId: 'u01',
      order: 7,
      title: 'Why Most Traders Underperform',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `This lesson is the uncomfortable one, and it's here early on purpose. Before learning *how* to analyse stocks, you should know exactly what you're up against — otherwise every skill you build gets aimed at the wrong target.

The evidence is unusually consistent. **SPIVA** scorecards, published twice a year, compare professional active fund managers to their benchmarks. Over 15-year windows, roughly **90% of US large-cap active funds underperform the S&P 500**. These are full-time professionals with research teams, terminals, and direct access to management.`,
        },
        {
          kind: 'text',
          md: `Four forces do the damage:

1. **Costs.** Every trade crosses the bid-ask spread, and active funds layer on expense ratios. Costs are certain; outperformance is not.
2. **Overtrading.** Classic research by Barber and Odean found the most active individual traders underperformed the least active by several percentage points a year — same market, different turnover.
3. **Behaviour.** Investors buy after rallies and sell after drops, so the return they actually *earn* trails the fund's reported return. This gap has its own name: the **behaviour gap**.
4. **Efficiency.** Prices already reflect widely known information, because millions of motivated people are competing to exploit it. To beat the market you need to be right *and* differently right from the consensus.`,
        },
        {
          kind: 'example',
          md: `**The arithmetic of active management** (Sharpe's insight, and it's just algebra):

All investors together own the entire market, so the *average* dollar earns exactly the market return **before costs**. After costs, the average actively managed dollar must earn **less than** the market — by the amount of its costs.

Make it concrete. Market returns **8%**.

- Index fund at a **0.03%** expense ratio → **7.97%**
- Active fund at **0.75%**, trading costs of ~0.25% → **7.00%**

The active manager needs to beat the market by a full percentage point *just to tie*. Over 30 years on $10,000, 7.97% compounds to about **$99,000** versus roughly **$76,000** at 7.00%.`,
        },
        {
          kind: 'callout',
          md: `**Misconception:** "So analysis is pointless — just buy an index fund and stop."

Not the conclusion. Efficiency is *strong*, not absolute, and the humbling data is exactly why learning to analyse businesses is worth it: it tells you when a thesis is genuinely differentiated versus when you're paying for consensus. It also makes you a better *owner* — able to hold through a −40% drawdown because you understand what you own. Skill's first payoff is avoiding unforced errors.`,
        },
        {
          kind: 'keypoint',
          md: `Roughly 90% of active US large-cap funds trail the S&P 500 over 15 years. Costs and turnover are certain; edge is not. Assume you must earn any outperformance, and treat low costs as your default advantage.`,
        },
      ],
      quiz: [
        {
          id: 'u01-l07-q1',
          prompt:
            'SPIVA-style research consistently finds what about professional active US large-cap fund managers over 15-year periods?',
          choices: [
            'About half beat their benchmark, as chance would predict',
            'The large majority — around 90% — underperform their benchmark',
            'They beat the benchmark before fees but not after, roughly evenly',
            'Results are too noisy to draw any conclusion',
          ],
          answerIdx: 1,
          explain:
            'Long-horizon SPIVA data repeatedly shows roughly 90% of US large-cap active funds trailing the S&P 500. "About half" sounds statistically reasonable but ignores costs: fees and trading frictions shift the whole distribution downward, so the median active fund starts behind and stays there.',
        },
        {
          id: 'u01-l07-q2',
          prompt:
            'What is the "behaviour gap"?',
          choices: [
            'The difference between a fund\'s reported return and the return its investors actually earn',
            'The spread between the bid and the ask',
            'The difference between a stock\'s price and its intrinsic value',
            'The performance difference between institutional and retail share classes',
          ],
          answerIdx: 0,
          explain:
            'Investors tend to add money after gains and withdraw after losses, so their dollar-weighted returns trail the fund\'s time-weighted returns. The price-versus-value answer describes a different (also important) concept — the margin of safety — and the bid-ask spread is a transaction cost, not a behavioural one.',
        },
        {
          id: 'u01-l07-q3',
          prompt:
            'The market returns 8%. An active fund charges 0.75% plus about 0.25% in trading costs. How much gross outperformance does it need just to match a 0.03% index fund?',
          choices: ['About 0.25%', 'About 0.5%', 'About 1 percentage point', 'None — fees are paid from the fund company\'s profits'],
          answerIdx: 2,
          explain:
            'Its total drag is roughly 1.00% versus the index fund\'s 0.03%, so it must generate about a percentage point of extra gross return to finish level. Fees are paid out of fund assets, never by the manager, which is why the cost hurdle is borne entirely by you.',
        },
        {
          id: 'u01-l07-q4',
          prompt:
            'What did Barber and Odean\'s research on individual brokerage accounts find?',
          choices: [
            'Traders with the largest accounts performed best',
            'The most frequent traders underperformed the least active ones by a wide margin',
            'Trading frequency had no measurable effect on returns',
            'Individuals outperformed institutions after adjusting for risk',
          ],
          answerIdx: 1,
          explain:
            'High-turnover accounts trailed low-turnover accounts by several percentage points a year, driven by trading costs and poor selection — activity itself was the destructive variable. The "no effect" answer would only hold if trading were free and stock picks were on average correct; neither is true.',
        },
        {
          id: 'u01-l07-q5',
          prompt:
            'Why does the arithmetic of active management guarantee that the average active dollar underperforms after costs?',
          choices: [
            'Because active managers are less skilled than index managers',
            'Because index funds get preferential pricing on trades',
            'Because all investors collectively hold the market, so the average dollar earns the market return before costs',
            'Because active funds must hold cash for redemptions',
          ],
          answerIdx: 2,
          explain:
            'This is Sharpe\'s arithmetic: since all holdings together *are* the market, the average dollar earns the market return before costs — subtracting higher costs mathematically drags the average active dollar below it. Skill is not the issue; the identity holds even if every manager is brilliant. Cash drag is a real but secondary effect.',
        },
      ],
      cardSeeds: [
        {
          id: 'u01-l07-c1',
          kind: 'cloze',
          front:
            'Over 15-year periods, roughly ____% of US large-cap active funds underperform the S&P 500.',
          back: '90%',
        },
        {
          id: 'u01-l07-c2',
          kind: 'basic',
          front: 'Sharpe\'s "arithmetic of active management" — what does it prove?',
          back: 'All investors together hold the market, so the average dollar earns the market return before costs. After costs, the average active dollar must underperform the index. It is algebra, not a claim about skill.',
        },
        {
          id: 'u01-l07-c3',
          kind: 'basic',
          front: 'What is the behaviour gap?',
          back: 'The shortfall between a fund\'s reported return and what its investors actually earn, caused by buying after gains and selling after losses.',
        },
        {
          id: 'u01-l07-c4',
          kind: 'basic',
          front: 'Barber & Odean\'s finding on trading frequency',
          back: 'Among individual brokerage accounts, the most active traders underperformed the least active by several percentage points a year — turnover itself destroyed returns.',
        },
      ],
    },

    // ── L08 ───────────────────────────────────────────────────────────────
    {
      id: 'u01-l08',
      unitId: 'u01',
      order: 8,
      title: 'Your Investing Toolkit',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `You invest through a **brokerage account** — an account at a firm licensed to buy and hold securities for you. Opening one takes minutes: identity details, a bank link, done. Most major US brokers now charge **$0 commission** on US stock and ETF trades.

But *which* account you open matters more than which broker, because the account type determines how much of your return the tax code lets you keep.`,
        },
        {
          kind: 'text',
          md: `**The order of operations.** Do these in sequence; skipping ahead is the most expensive mistake beginners make.

1. **Kill high-interest debt.** Paying off a 22% credit card is a guaranteed 22% return. Nothing in this course beats that.
2. **Build an emergency fund.** Three to six months of essential expenses, in cash or a money-market fund. This is what stops you selling stocks at the bottom because the boiler died.
3. **Capture the employer 401(k) match.** A 50% or 100% match is an immediate, risk-free return on the money you contribute.
4. **Fill tax-advantaged space.** IRA (traditional or Roth), HSA if eligible, then more 401(k) up to the annual IRS limit.
5. **Then a taxable brokerage account** for anything beyond that.

Steps 1 and 2 are not investing — they're what makes investing survivable.`,
        },
        {
          kind: 'example',
          md: `**Why the match comes first.** Your employer matches 50% of contributions up to 6% of a **$60,000** salary.

- You contribute **6%** = **$3,600**.
- The employer adds **$1,800**.
- Instantly, you are up **50%** on that money — before any market return.

To earn $1,800 on $3,600 in the market at 8% a year would take about **five and a half years** (Rule of 72: ~9 years to double, and this is halfway there). Leaving the match unclaimed is declining a raise.`,
        },
        {
          kind: 'text',
          md: `**Where this course goes next.** Two tracks, deliberately interleaved:

- **Fundamental analysis** — reading income statements, balance sheets and cash-flow statements; ratios and financial health; valuation by multiples and by discounted cash flow. The question it answers: *what is this business worth?*
- **Technical analysis** — price and volume behaviour, trend, chart patterns, indicators, and above all risk management and position sizing. The question it answers: *what is the market currently doing, and how much should I risk?*

Around these sit **behavioural finance** (why your own brain is the adversary) and **synthesis** — turning it all into a written, testable process.`,
        },
        {
          kind: 'callout',
          md: `**Educational, not financial advice.** Everything in TickerQuest is for learning. It is not personalised investment, tax, or legal advice, no specific security is being recommended, and tax rules and contribution limits change and vary by country and situation. For decisions about your own money, consult a licensed professional who knows your circumstances.`,
        },
        {
          kind: 'keypoint',
          md: `Order of operations: high-interest debt → emergency fund → employer match → tax-advantaged accounts → taxable brokerage. Account choice and cost control are the returns you fully control.`,
        },
      ],
      quiz: [
        {
          id: 'u01-l08-q1',
          prompt:
            'You have $5,000 spare, a credit card balance at 22% APR, and no emergency fund. What does the standard order of operations suggest first?',
          choices: [
            'Open a taxable brokerage account and buy a broad index fund',
            'Pay off the 22% credit card balance',
            'Max out a Roth IRA to lock in tax-free growth',
            'Split it evenly across all three to diversify',
          ],
          answerIdx: 1,
          explain:
            'Eliminating 22% debt is a guaranteed, risk-free, tax-free 22% return — far above any realistic market expectation of roughly 10%. The Roth answer is tempting because tax-free growth sounds powerful, but growth on borrowed money costing 22% is negative growth.',
        },
        {
          id: 'u01-l08-q2',
          prompt: 'What is the main purpose of an emergency fund for an investor?',
          choices: [
            'To earn a higher return than stocks with less risk',
            'To satisfy brokerage account minimums',
            'To avoid being forced to sell investments at a bad time',
            'To qualify for margin trading',
          ],
          answerIdx: 2,
          explain:
            'Cash reserves let you ride out job loss or a broken furnace without liquidating stocks during a downturn — protecting the compounding you have already earned. It is not there to out-earn stocks; by design it sits in low-return, low-volatility instruments.',
        },
        {
          id: 'u01-l08-q3',
          prompt:
            'Your employer matches 50% of contributions up to 6% of salary. On a $60,000 salary, contributing the full 6% gets you how much free money?',
          choices: ['$900', '$1,800', '$3,600', '$5,400'],
          answerIdx: 1,
          explain:
            '6% of $60,000 is $3,600, and a 50% match adds half of that: $1,800. Choosing $3,600 confuses a 50% match with a dollar-for-dollar (100%) match — worth checking in your own plan document, since both structures are common.',
        },
        {
          id: 'u01-l08-q4',
          prompt: 'Which best describes the difference between fundamental and technical analysis?',
          choices: [
            'Fundamental analysis is for long-term investors; technical analysis is illegal for retail traders',
            'Fundamental analysis estimates what a business is worth; technical analysis studies price and volume behaviour',
            'Fundamental analysis uses charts; technical analysis uses financial statements',
            'They are competing names for the same set of valuation techniques',
          ],
          answerIdx: 1,
          explain:
            'Fundamentals ask *what is it worth* using financial statements and valuation; technicals ask *what is price doing* using price, volume, trend, and risk management. Answer three simply reverses the two definitions — a common mix-up worth locking down before Units 3 and 8.',
        },
      ],
      cardSeeds: [
        {
          id: 'u01-l08-c1',
          kind: 'basic',
          front: 'The investing order of operations (5 steps)',
          back: '1) Pay off high-interest debt. 2) Build a 3–6 month emergency fund. 3) Capture the full employer 401(k) match. 4) Fill tax-advantaged space (IRA/HSA/401k). 5) Then a taxable brokerage account.',
        },
        {
          id: 'u01-l08-c2',
          kind: 'cloze',
          front: 'An emergency fund should cover ____ to ____ months of essential expenses.',
          back: 'three to six months',
        },
        {
          id: 'u01-l08-c3',
          kind: 'basic',
          front: 'Why does the employer 401(k) match rank above every market investment?',
          back: 'It is an immediate, risk-free return — a 50% match is +50% on contributed dollars before any market return, which would otherwise take years to earn.',
        },
        {
          id: 'u01-l08-c4',
          kind: 'basic',
          front: 'Fundamental vs. technical analysis — the core question each asks',
          back: 'Fundamental: what is this business worth? (statements, ratios, valuation). Technical: what is price doing and how much should I risk? (trend, patterns, indicators, position sizing).',
        },
      ],
    },
  ],
}
