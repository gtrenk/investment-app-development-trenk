import type { Unit } from '@core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Unit 05 — Ratios & Financial Health
// The three statements gave you raw numbers. Ratios turn them into judgements:
// how profitable, how efficient, how leveraged, how honest. This is where a
// pile of filings becomes a verdict on a business.
// ─────────────────────────────────────────────────────────────────────────────

export const u05: Unit = {
  id: 'u05',
  title: 'Ratios & Financial Health',
  order: 5,
  description:
    'Turn raw statements into judgements: margins, ROE and DuPont, ROIC versus cost of capital, liquidity, leverage, efficiency, growth quality, earnings-quality red flags, and a repeatable 10-point health checklist.',
  unlockAfter: 'u04',
  lessons: [
    // ── L01 ───────────────────────────────────────────────────────────────
    {
      id: 'u05-l01',
      unitId: 'u05',
      order: 1,
      title: 'Why Ratios?',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `Units 3 and 4 gave you the three statements. They are full of **absolute** numbers — $4.2 billion of revenue, $310 million of inventory, $1.8 billion of debt. Absolute numbers answer "how much?" but almost never answer the question you actually care about: **"is this good?"**

A **ratio** divides one line item by another to strip out size. Once you divide, a corner shop and a global conglomerate can stand on the same measuring stick.

> A ratio is not a fact about a company. It is a **question** about a company.`,
        },
        {
          kind: 'text',
          md: `Every ratio should be read through **three lenses**, and a number read through only one of them is close to useless:

1. **Trend** — the same company against its own past. Five years of gross margin tells you whether pricing power is strengthening or quietly eroding.
2. **Peer** — the company against direct competitors *in the same industry*. A 3% net margin is disastrous for software and perfectly healthy for a grocer.
3. **Absolute** — the number against a structural threshold that holds everywhere. Interest coverage below 1.5x is dangerous in any industry, because it means operating profit barely covers the interest bill.

Trend catches deterioration. Peer catches excuses. Absolute catches genuine danger.`,
        },
        {
          kind: 'example',
          md: `**Size hides everything until you divide.**

| | Atlas Industrial | Kestrel Devices |
|---|---|---|
| Revenue | $50,000M | $800M |
| Net income | $4,000M | $88M |
| **Net margin** | **8.0%** | **11.0%** |

Atlas earns **45 times** more profit in dollars. Kestrel converts each dollar of sales into profit **more effectively**. Both statements are true, and only the ratio lets you see the second one.

Now add the trend lens. Over five years:

- Atlas net margin: 8.0% → 8.1% → 8.0% → 7.9% → 8.0% — stable, boring, dependable.
- Kestrel net margin: 17.0% → 15.5% → 14.0% → 12.5% → 11.0% — **still higher, and falling fast**.

Kestrel wins on the snapshot and loses on the trajectory. A single-year comparison would have told you the exact opposite of the story that matters.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "This company has a 30% ROE, so it's a great business."

No single ratio can carry that verdict. A 30% ROE can come from a wonderful business or from a mediocre one loaded with debt (Lesson 3 pulls that apart). A soaring current ratio can mean safety — or a company that cannot sell its inventory. Ratios are **interlocking**: each one you compute raises a follow-up question, and the answer only emerges from the set.`,
        },
        {
          kind: 'callout',
          md: `**Watch the denominator convention.** Ratios that mix a flow (income statement, covering a *period*) with a stock (balance sheet, a *point in time*) should use an **average** balance: (beginning + ending) / 2. ROE uses average equity; asset turnover uses average assets. Using the ending balance is common and usually close enough for a stable company — but it badly distorts a company that just raised capital or made a large acquisition mid-year.`,
        },
        {
          kind: 'keypoint',
          md: `Ratios normalise for size so companies of any scale can be compared. Read every one through three lenses — trend (vs. its own past), peer (vs. same-industry rivals), absolute (vs. a structural danger threshold). Never render a verdict on a single ratio.`,
        },
      ],
      quiz: [
        {
          id: 'u05-l01-q1',
          prompt: 'What is the primary reason for converting raw financial figures into ratios?',
          choices: [
            'Ratios are required by GAAP for all public filings',
            'Ratios eliminate the need to read the cash flow statement',
            'Ratios strip out company size, making businesses of different scales comparable',
            'Ratios are more accurate than the underlying reported numbers',
          ],
          answerIdx: 2,
          explain:
            'Dividing one line item by another removes the scale effect, so a $800M company and a $50B company can be judged on the same measuring stick. Ratios are derived from the reported figures, so they can never be more accurate than their inputs — and they are analytical tools, not a filing requirement.',
        },
        {
          id: 'u05-l01-q2',
          prompt:
            'Atlas earns $4,000M on $50,000M of revenue; Kestrel earns $88M on $800M. Which converts revenue into profit more effectively?',
          choices: [
            'Kestrel, at an 11.0% net margin versus Atlas at 8.0%',
            'Atlas, because it earns 45 times more profit in dollars',
            'They are equivalent once adjusted for revenue',
            'It cannot be determined without knowing their share prices',
          ],
          answerIdx: 0,
          explain:
            '88 / 800 = 11.0% against 4,000 / 50,000 = 8.0%, so Kestrel keeps more of each sales dollar. Pointing at the larger absolute profit answers "how much?" rather than "how well?" — which is exactly the confusion ratios exist to remove.',
        },
        {
          id: 'u05-l01-q3',
          prompt:
            'A company reports an 11% net margin, well above its peer group average of 7%. Its margin five years ago was 17%. What should you conclude?',
          choices: [
            'It is clearly the best business in the group',
            'The peer comparison is invalid because margins differ by company',
            'The five-year history is irrelevant once you have peer data',
            'It still leads its peers, but the sharp downward trend is the more important signal',
          ],
          answerIdx: 3,
          explain:
            'Trend and peer lenses can point in opposite directions, and a margin falling from 17% to 11% suggests eroding pricing power or rising costs that will eventually take it below the peer average. Reading only the snapshot would have you buying into deterioration precisely because it still looks good today.',
        },
        {
          id: 'u05-l01-q4',
          prompt:
            'Which ratio comparison is the *least* meaningful without industry context?',
          choices: [
            'Interest coverage below 1.5x flagged as dangerous',
            'A 3% net margin judged as "poor profitability"',
            'A company\'s current gross margin against its own gross margin five years ago',
            'Net debt / EBITDA compared against the same company last year',
          ],
          answerIdx: 1,
          explain:
            'Net margin varies enormously by business model — 3% is dire for software and entirely normal for a grocer or distributor — so it demands peer context. Interest coverage under 1.5x means operating profit barely covers the interest bill, which is structurally dangerous everywhere, and both self-comparisons are trend readings that need no peer group at all.',
        },
      ],
      cardSeeds: [
        {
          id: 'u05-l01-c1',
          kind: 'basic',
          front: 'What are the three lenses for reading any financial ratio?',
          back: 'Trend (vs. the company\'s own history), peer (vs. same-industry competitors), and absolute (vs. a structural danger threshold). Trend catches deterioration, peer catches excuses, absolute catches real danger.',
        },
        {
          id: 'u05-l01-c2',
          kind: 'cloze',
          front:
            'A ratio that mixes an income statement flow with a balance sheet balance should use the ____ balance, calculated as ____.',
          back: 'average; (beginning + ending) / 2',
        },
        {
          id: 'u05-l01-c3',
          kind: 'basic',
          front: 'Why is a single ratio never enough to judge a company?',
          back: 'Ratios interlock — a high ROE may just be leverage, a high current ratio may be unsellable inventory. Each ratio raises a follow-up question, and the verdict only emerges from the whole set read across trend, peers, and absolute thresholds.',
        },
      ],
    },

    // ── L02 ───────────────────────────────────────────────────────────────
    {
      id: 'u05-l02',
      unitId: 'u05',
      order: 2,
      title: 'Profitability Ratios',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**Margins** track a dollar of revenue as it is eaten away on its journey down the income statement. Three checkpoints matter:

> **Gross margin = gross profit ÷ revenue** = (revenue − COGS) ÷ revenue
> **Operating margin = operating income ÷ revenue**
> **Net margin = net income ÷ revenue**

Each answers a different question:

- **Gross margin** — pricing power and unit economics. What is left after the direct cost of delivering the product.
- **Operating margin** — operating efficiency. What survives R&D, sales and marketing, and general overhead. This is the cleanest read on the *business* itself.
- **Net margin** — the bottom line after interest, taxes, and one-off items. Real, but noisiest: a debt refinancing or a tax settlement can move it without the business changing at all.`,
        },
        {
          kind: 'text',
          md: `"Good" is entirely industry-dependent. Rough US norms:

| Industry | Gross margin | Operating margin | Net margin |
|---|---|---|---|
| Enterprise software | 70–85% | 15–35% | 12–30% |
| Pharma (large cap) | 65–80% | 20–35% | 15–25% |
| Branded consumer goods | 40–60% | 15–25% | 10–18% |
| Industrial manufacturing | 25–40% | 8–15% | 5–12% |
| Airlines | 15–30% | 3–12% | 2–8% |
| Grocery / food retail | 20–28% | 2–4% | 1–3% |
| Distribution / wholesale | 10–20% | 2–5% | 1–3% |

The pattern: high gross margins come from **intangible** advantages (brands, patents, network effects, near-zero marginal cost) and low ones from moving physical goods. Note that grocers and distributors are not bad businesses — they earn their returns on **velocity** rather than margin, which is exactly what Lesson 7 measures.`,
        },
        {
          kind: 'example',
          md: `**Two healthy companies that look nothing alike.**

**Northwind Software** — revenue $1,000M
- COGS $220M → gross profit **$780M** → gross margin **78.0%**
- Operating expenses $600M → operating income **$180M** → operating margin **18.0%**
- Net income $140M → net margin **14.0%**

**Harbor Grocers** — revenue $20,000M
- COGS $15,000M → gross profit **$5,000M** → gross margin **25.0%**
- Operating expenses $4,400M → operating income **$600M** → operating margin **3.0%**
- Net income $420M → net margin **2.1%**

Harbor earns **three times** Northwind's profit in dollars on **twenty times** the revenue. Judging Harbor by Northwind's yardstick would condemn a perfectly sound business; judging Northwind by Harbor's would make an ordinary software company look miraculous.

**Where the margin actually leaks.** Northwind's 78% gross margin becomes an 18% operating margin: **60 points of revenue** go to opex. Split it — R&D $250M (25%), sales and marketing $290M (29%), G&A $60M (6%). That is where the real question lives: is $290M of sales spend buying durable customers, or renting revenue that leaves the moment spending stops?`,
        },
        {
          kind: 'callout',
          md: `**Pitfall: chasing net margin alone.** Net income sits below interest, tax, and non-recurring items, so it is the easiest margin to distort. A company can post a fat net margin because it sold a building, settled litigation favourably, or booked a one-off tax benefit. **Operating margin is the cleaner comparison** between businesses, because it stops above the capital structure and the tax code. If net margin and operating margin diverge sharply, find out why before you use either.`,
        },
        {
          kind: 'callout',
          md: `**Beware "adjusted" margins.** Companies love non-GAAP measures that exclude stock-based compensation, restructuring, or amortisation of acquired intangibles. Stock comp is a **real cost** — it dilutes you (Unit 2, Lesson 4). Restructuring charges that appear every single year are not one-off. Always compute margins from GAAP figures first, then decide which adjustments you personally believe.`,
        },
        {
          kind: 'keypoint',
          md: `Gross margin = (revenue − COGS) ÷ revenue → pricing power. Operating margin = operating income ÷ revenue → operating efficiency and the best cross-company comparison. Net margin = net income ÷ revenue → real but noisy. "Good" is defined by the industry, not by an absolute number.`,
        },
      ],
      quiz: [
        {
          id: 'u05-l02-q1',
          prompt:
            'A company reports revenue of $1,000M and COGS of $220M. What is its gross margin?',
          choices: [
            '78.0%',
            '22.0%',
            '4.55x',
            '$780M',
          ],
          answerIdx: 0,
          explain:
            'Gross profit is $1,000M − $220M = $780M, and $780M / $1,000M = 78.0%. The 22.0% answer is the *cost* ratio (COGS as a share of revenue) — its complement, and a genuinely easy slip when you divide the wrong number by revenue.',
        },
        {
          id: 'u05-l02-q2',
          prompt:
            'Which margin is generally the best starting point for comparing the operating quality of two companies in the same industry?',
          choices: [
            'Net margin, because it reflects the true bottom line',
            'Gross margin, because it is the largest number',
            'Operating margin, because it stops above interest, taxes, and one-off items',
            'EBITDA margin, because it is always reported',
          ],
          answerIdx: 2,
          explain:
            'Operating margin captures the business itself while excluding capital structure and tax effects, which differ between companies for reasons unrelated to operating skill. Net margin sits below all of those distortions, so a favourable tax settlement or a building sale can make a weaker operator look stronger.',
        },
        {
          id: 'u05-l02-q3',
          prompt:
            'Harbor Grocers has a 2.1% net margin and Northwind Software has 14.0%. What is the correct conclusion?',
          choices: [
            'Northwind is the better investment at any price',
            'Both may be healthy — margin norms differ enormously by industry',
            'Harbor is losing money on most of its sales',
            'Harbor should immediately raise prices to match Northwind',
          ],
          answerIdx: 1,
          explain:
            'A 2–3% net margin is normal for food retail, where returns come from inventory velocity rather than markup, while 14% is unremarkable for software. Assuming the higher margin wins ignores both industry structure and price — margin describes the business, not the attractiveness of the stock.',
        },
        {
          id: 'u05-l02-q4',
          prompt:
            'A company\'s net margin jumps from 9% to 16% while its operating margin is unchanged at 12%. What is the most likely explanation?',
          choices: [
            'It gained substantial pricing power during the year',
            'Its cost of goods sold fell sharply',
            'It became far more efficient at controlling overhead',
            'Something below operating income changed — a one-off gain, or a tax or interest benefit',
          ],
          answerIdx: 3,
          explain:
            'An unchanged operating margin means revenue, COGS, and operating expenses moved together, so the entire swing came from below the operating line: an asset sale, a legal settlement, a refinancing, or a tax benefit. Attributing it to pricing power or cost control would credit the business for something the business did not do.',
        },
        {
          id: 'u05-l02-q5',
          prompt:
            'Why should you be cautious about a company\'s "adjusted" operating margin that excludes stock-based compensation?',
          choices: [
            'Stock-based compensation is a real cost that dilutes existing shareholders',
            'Stock-based compensation is illegal to exclude under GAAP',
            'Adjusted figures are never audited in any form',
            'Excluding it always lowers the reported margin',
          ],
          answerIdx: 0,
          explain:
            'Paying employees in shares enlarges the share count, shrinking every existing holder\'s claim on future profits — the cost is real even though no cash leaves. Excluding it *raises* the adjusted margin, which is precisely why management favours the adjustment; non-GAAP presentation is permitted, just not a substitute for the GAAP figures.',
        },
      ],
      cardSeeds: [
        {
          id: 'u05-l02-c1',
          kind: 'cloze',
          front: 'Gross margin = (____ − ____) ÷ ____.',
          back: '(revenue − COGS) ÷ revenue',
        },
        {
          id: 'u05-l02-c2',
          kind: 'cloze',
          front: 'Operating margin = ____ ÷ ____. Net margin = ____ ÷ ____.',
          back: 'operating income ÷ revenue; net income ÷ revenue',
        },
        {
          id: 'u05-l02-c3',
          kind: 'basic',
          front: 'Why is operating margin usually a better cross-company comparison than net margin?',
          back: 'It stops above interest, taxes, and non-recurring items, so it reflects the business rather than the capital structure, the tax code, or a one-off gain.',
        },
        {
          id: 'u05-l02-c4',
          kind: 'basic',
          front: 'Roughly what gross margins distinguish intangible-advantage businesses from physical-goods businesses?',
          back: 'Software and pharma run ~65–85% gross margins (brands, patents, near-zero marginal cost). Grocery, distribution, and wholesale run ~10–28% and earn their returns on volume and velocity instead.',
        },
      ],
    },

    // ── L03 ───────────────────────────────────────────────────────────────
    {
      id: 'u05-l03',
      unitId: 'u05',
      order: 3,
      title: 'Return on Equity & DuPont',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Margins tell you how profitable each *sale* is. **Return on equity** tells you how profitable each dollar of *owner capital* is — and as a shareholder, that is your capital.

> **ROE = net income ÷ average shareholders' equity**

If a company earns $500M on $2,500M of average equity, ROE is **20%**: every dollar owners have tied up in the business generated twenty cents of profit this year.

Broadly, sustained ROE above ~15% suggests a business with some durable advantage; below ~10% suggests capital is working hard for a modest reward. But raw ROE is the single most **misleading** headline ratio in finance, because there are three completely different ways to produce a big one.`,
        },
        {
          kind: 'text',
          md: `The **DuPont decomposition** splits ROE into those three drivers by inserting revenue and assets and cancelling them:

> **ROE = (net income ÷ revenue) × (revenue ÷ assets) × (assets ÷ equity)**
> **ROE = net margin × asset turnover × equity multiplier**

Read as three business strategies:

1. **Net margin** — *sell at a premium.* Brands, patents, software. Luxury goods, enterprise software.
2. **Asset turnover** — *sell a lot, fast, off a small asset base.* Discount retail, distribution.
3. **Equity multiplier** (assets ÷ equity) — *use other people's money.* Banks, REITs, leveraged roll-ups.

Only the first two are operating skill. The third is a **financing choice** — and it magnifies losses exactly as much as it magnifies gains. Two companies can post identical ROEs while being entirely different animals, and DuPont is how you tell them apart.`,
        },
        {
          kind: 'example',
          md: `**Same ROE is not the same business.**

**Levered Co.**
- Net income $500M, revenue $5,000M → net margin **10.0%**
- Revenue $5,000M, average assets $4,000M → asset turnover **1.25x**
- Average assets $4,000M, average equity $1,250M → equity multiplier **3.20x**
- ROE = 0.100 × 1.25 × 3.20 = **40.0%** (check: 500 / 1,250 = 40.0%)

**Quality Co.**
- Net income $500M, revenue $2,500M → net margin **20.0%**
- Revenue $2,500M, average assets $2,500M → asset turnover **1.00x**
- Average assets $2,500M, average equity $2,500M → equity multiplier **1.00x**
- ROE = 0.200 × 1.00 × 1.00 = **20.0%** (check: 500 / 2,500 = 20.0%)

Levered Co. wins the headline **40% vs 20%** — and it does so with **half** the margin and **zero** net cash cushion. Strip the 3.2x multiplier and its underlying return on assets is 0.100 × 1.25 = **12.5%**, against Quality Co.'s **20.0%**.

**Now stress it.** Suppose a recession cuts both companies' operating profit by 40%.
- Quality Co., debt-free, simply earns less: ROE falls to roughly **12%**.
- Levered Co. still owes its interest bill regardless. Net income drops far more than 40% — it may go negative — and equity, being the thin slice at the bottom, absorbs all of it.

**Equity can also be engineered.** Large buybacks and accumulated losses both shrink the equity denominator. A company that has bought back so much stock that equity is nearly zero can post a spectacular — and nearly meaningless — ROE.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "High ROE means a high-quality business."**

High ROE means *one* of: fat margins, fast turnover, or heavy leverage. Always run DuPont before you admire an ROE. The follow-up question is always "**which factor?**" — because margin and turnover are earned, and leverage is merely borrowed. This is also why **ROIC** (next lesson) is the more honest measure: it ignores the financing decision entirely.`,
        },
        {
          kind: 'keypoint',
          md: `ROE = net income ÷ average shareholders' equity. DuPont: ROE = (NI/revenue) × (revenue/assets) × (assets/equity) = net margin × asset turnover × equity multiplier. The first two are operating skill; the third is borrowed risk. Always ask which factor is doing the work.`,
        },
      ],
      quiz: [
        {
          id: 'u05-l03-q1',
          prompt: 'What is the formula for return on equity?',
          choices: [
            'Operating income ÷ total assets',
            'Net income ÷ average shareholders\' equity',
            'Net income ÷ revenue',
            'Revenue ÷ average shareholders\' equity',
          ],
          answerIdx: 1,
          explain:
            'ROE measures profit generated per dollar of owner capital, so net income sits over average shareholders\' equity. Net income over revenue is net margin — a related but entirely different question, since it measures profit per dollar of *sales* rather than per dollar of *capital*.',
        },
        {
          id: 'u05-l03-q2',
          prompt: 'The DuPont decomposition breaks ROE into which three factors?',
          choices: [
            'Gross margin, operating margin, net margin',
            'Revenue growth, margin expansion, buybacks',
            'Return on assets, cost of capital, tax rate',
            'Net margin, asset turnover, and the equity multiplier',
          ],
          answerIdx: 3,
          explain:
            'ROE = (NI/revenue) × (revenue/assets) × (assets/equity); revenue and assets cancel, leaving net income over equity. The three-margin option stacks measures of the same thing, which cannot reconstruct ROE because none of them ever references the balance sheet.',
        },
        {
          id: 'u05-l03-q3',
          prompt:
            'A company has a 10% net margin, 1.25x asset turnover, and a 3.2x equity multiplier. What is its ROE?',
          choices: [
            '12.5%',
            '31.3%',
            '40.0%',
            '14.5%',
          ],
          answerIdx: 2,
          explain:
            '0.10 × 1.25 × 3.20 = 0.40, or 40.0%. The 12.5% answer is return on assets (margin × turnover) — the return the business earns before the leverage multiplier is applied, and the number worth comparing against a debt-free peer.',
        },
        {
          id: 'u05-l03-q4',
          prompt:
            'Levered Co. posts a 40% ROE with a 3.2x equity multiplier; Quality Co. posts 20% with a 1.0x multiplier. What does this tell you?',
          choices: [
            'Levered Co.\'s advantage comes from borrowing, not from superior operations',
            'Levered Co. is twice as operationally efficient',
            'Quality Co. is destroying shareholder value',
            'The two ROEs are not comparable in any way',
          ],
          answerIdx: 0,
          explain:
            'Strip the multiplier and Levered Co. returns 12.5% on assets against Quality Co.\'s 20.0%, so its higher ROE is entirely a financing artefact — and one that will amplify losses just as hard in a downturn. The DuPont split is precisely what makes the two ROEs comparable rather than incomparable.',
        },
        {
          id: 'u05-l03-q5',
          prompt:
            'A company has bought back stock aggressively for years, shrinking shareholders\' equity to a very small figure. What happens to its reported ROE?',
          choices: [
            'It falls, because buybacks reduce net income',
            'It is unaffected, because buybacks are a balance sheet event',
            'It becomes negative by definition',
            'It rises mechanically as the equity denominator shrinks, telling you little about the business',
          ],
          answerIdx: 3,
          explain:
            'Buybacks reduce equity without reducing profit, so ROE inflates for reasons unconnected to operating performance — at very low equity the ratio can reach absurd levels. This is a third route to a big ROE alongside margin and turnover, and one more reason to check ROIC, which uses total invested capital instead.',
        },
      ],
      cardSeeds: [
        {
          id: 'u05-l03-c1',
          kind: 'cloze',
          front: 'ROE = ____ ÷ ____.',
          back: 'net income ÷ average shareholders\' equity',
        },
        {
          id: 'u05-l03-c2',
          kind: 'cloze',
          front:
            'DuPont: ROE = (____ ÷ revenue) × (revenue ÷ ____) × (____ ÷ equity), i.e. ____ × ____ × ____.',
          back: '(net income ÷ revenue) × (revenue ÷ assets) × (assets ÷ equity) = net margin × asset turnover × equity multiplier',
        },
        {
          id: 'u05-l03-c3',
          kind: 'basic',
          front: 'Why can a high ROE be misleading?',
          back: 'It can come from fat margins, fast asset turnover, OR heavy leverage. Only the first two are operating skill; the equity multiplier is a financing choice that amplifies losses as much as gains. Shrinking equity via buybacks or accumulated losses inflates it too.',
        },
        {
          id: 'u05-l03-c4',
          kind: 'basic',
          front: 'What is the equity multiplier, and what does a value of 3.2x mean?',
          back: 'Average assets ÷ average equity. At 3.2x the company funds $3.20 of assets for every $1.00 of owner capital — the other $2.20 comes from liabilities, which magnifies both returns and losses.',
        },
      ],
    },

    // ── L04 ───────────────────────────────────────────────────────────────
    {
      id: 'u05-l04',
      unitId: 'u05',
      order: 4,
      title: 'Return on Invested Capital',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `ROE has a structural flaw: it measures returns to *one* class of capital provider while the business is funded by two. **Return on invested capital** fixes this by measuring the return on **all** the money put to work — debt and equity together, before any decision about how to split the proceeds.

> **ROIC = NOPAT ÷ invested capital**

**NOPAT** ("net operating profit after tax") is what the business would earn if it had no debt at all:

> **NOPAT = EBIT × (1 − tax rate)**

**Invested capital** is the money actually funding operations. Two equivalent routes:

- **Financing view:** total debt + shareholders' equity − excess cash
- **Operating view:** net working capital + net PP&E + other operating assets

Excess cash is subtracted because idle cash on the balance sheet is not being *invested* in the business — leaving it in would understate how well the operating assets perform.`,
        },
        {
          kind: 'text',
          md: `ROIC only becomes a verdict when you compare it to what the capital **costs**. The **weighted average cost of capital (WACC)** is the blended return debt and equity holders require — typically **7–10%** for a stable large-cap.

> **The value-creation test: ROIC > WACC.**

- **ROIC > WACC** — every dollar reinvested creates value. Growth is *good*, and more of it is better.
- **ROIC ≈ WACC** — growth is value-neutral. The company runs hard to stand still.
- **ROIC < WACC** — every dollar reinvested **destroys** value. Growth makes shareholders **poorer**.

That last line is the one most investors never internalise. Revenue growth is not automatically good. A company growing 25% a year at a 5% ROIC against an 8% WACC is burning shareholder wealth *faster* than a stagnant one. The spread (ROIC − WACC) times the capital invested is, roughly, the economic profit the business creates.`,
        },
        {
          kind: 'example',
          md: `**Two companies, identical profits, opposite verdicts.**

**Sable Instruments**
- EBIT $600M, tax rate 25% → NOPAT = 600 × 0.75 = **$450M**
- Total debt $1,200M + equity $1,800M − excess cash $200M = invested capital **$2,800M**
- **ROIC = 450 / 2,800 = 16.1%**, WACC 8.0% → **spread +8.1 points**

**Grange Logistics**
- EBIT $600M, tax rate 25% → NOPAT **$450M** (identical)
- Total debt $5,000M + equity $4,400M − excess cash $400M = invested capital **$9,000M**
- **ROIC = 450 / 9,000 = 5.0%**, WACC 8.0% → **spread −3.0 points**

Same profit. Sable needed **$2.8B** of capital to produce it; Grange needed **$9.0B**.

**Now let both grow.** Each reinvests $1,000M to expand.

- Sable's new capital earns ~16% → about **$161M** of extra NOPAT against an $80M annual capital charge (8% × $1,000M) → roughly **+$81M** of economic profit. Value created.
- Grange's new capital earns ~5% → about **$50M** of extra NOPAT against the same $80M charge → roughly **−$30M**. Value destroyed — and Grange's revenue and earnings both *rose* while doing it.

Grange's press release will read "record revenue, record earnings." Its shareholders are worse off.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Growth is always good."**

Growth is a **multiplier on the sign of your ROIC spread.** Positive spread: grow as fast as you can fund it. Negative spread: growth accelerates the destruction, and the honest move is to shrink, return capital, or fix the returns first. This single idea explains why capital-hungry industries with fast top-line growth so often produce dreadful long-run shareholder returns.`,
        },
        {
          kind: 'callout',
          md: `**Practical notes.** (1) There is no single canonical ROIC formula — screeners differ on goodwill, leases, and cash. Compute it the same way across every company you compare, and check the trend rather than the third decimal. (2) Including acquired **goodwill** in invested capital asks "did the acquisitions pay off?"; excluding it asks "how good are the underlying operations?" Both are useful, and the gap between them is itself informative. (3) A close cousin, **ROCE** (EBIT ÷ capital employed), is pre-tax — do not compare it directly with an after-tax ROIC.`,
        },
        {
          kind: 'keypoint',
          md: `ROIC = NOPAT ÷ invested capital, where NOPAT = EBIT × (1 − tax rate) and invested capital = debt + equity − excess cash. ROIC > WACC creates value; ROIC < WACC means growth destroys it. This spread, not revenue growth, is the value-creation test.`,
        },
      ],
      quiz: [
        {
          id: 'u05-l04-q1',
          prompt: 'What does NOPAT represent in the ROIC formula?',
          choices: [
            'Net income plus depreciation and amortisation',
            'Revenue minus all operating expenses, before depreciation',
            'EBIT × (1 − tax rate) — operating profit after tax, as if the company had no debt',
            'Net income minus dividends paid to shareholders',
          ],
          answerIdx: 2,
          explain:
            'Taxing EBIT strips out the tax shield from interest, so NOPAT shows the operating profit the business generates independent of how it is financed — which is what makes ROIC comparable across capital structures. Net income already reflects interest expense, so using it would smuggle the financing decision back into the ratio.',
        },
        {
          id: 'u05-l04-q2',
          prompt:
            'A company has EBIT of $600M, a 25% tax rate, total debt of $1,200M, equity of $1,800M, and $200M of excess cash. What is its ROIC?',
          choices: [
            '20.0%',
            '16.1%',
            '15.0%',
            '25.0%',
          ],
          answerIdx: 1,
          explain:
            'NOPAT = 600 × 0.75 = $450M; invested capital = 1,200 + 1,800 − 200 = $2,800M; 450 / 2,800 = 16.1%. The 15.0% answer forgets to subtract the excess cash, which inflates the denominator and understates how hard the operating assets are actually working.',
        },
        {
          id: 'u05-l04-q3',
          prompt:
            'A company earns a 5% ROIC against an 8% WACC and is growing revenue 25% a year. What is happening to shareholder value?',
          choices: [
            'It is being destroyed — each reinvested dollar returns less than it costs',
            'It is being created, because rapid growth always compounds value',
            'It is unchanged, since growth and cost of capital offset',
            'It cannot be assessed without the company\'s net margin',
          ],
          answerIdx: 0,
          explain:
            'Every dollar reinvested earns 5 cents while costing 8 cents, so faster growth simply destroys value faster — revenue and reported earnings can rise the whole time. Treating growth as automatically good is exactly the error this test exists to catch.',
        },
        {
          id: 'u05-l04-q4',
          prompt: 'Why is excess cash subtracted when calculating invested capital?',
          choices: [
            'Because cash is a liability under GAAP',
            'Because cash cannot be used to pay dividends',
            'Because auditors require it to be excluded',
            'Because idle cash is not invested in operations, so including it would understate the return on the assets that are',
          ],
          answerIdx: 3,
          explain:
            'ROIC is meant to measure how well the *operating* asset base performs, and a large idle cash pile earning money-market rates would drag the ratio down for reasons unrelated to the business. Cash is unambiguously an asset — the exclusion is an analytical choice, not an accounting rule.',
        },
        {
          id: 'u05-l04-q5',
          prompt:
            'Sable and Grange both generate $450M of NOPAT. Sable uses $2,800M of invested capital, Grange uses $9,000M. Which is the better business, and why?',
          choices: [
            'Grange, because a larger capital base signals greater scale and durability',
            'Sable, because it produces the same profit from far less capital (16.1% ROIC vs 5.0%)',
            'They are equivalent, since profit is identical',
            'Grange, because more assets means more collateral for cheap borrowing',
          ],
          answerIdx: 1,
          explain:
            'Producing identical profit from less than a third of the capital means each dollar entrusted to Sable works more than three times as hard, and only Sable clears an 8% WACC. Identical profits look equivalent only until you ask what they cost to generate — which is the entire point of a return ratio.',
        },
      ],
      cardSeeds: [
        {
          id: 'u05-l04-c1',
          kind: 'cloze',
          front: 'ROIC = ____ ÷ ____, where NOPAT = ____ × (1 − ____).',
          back: 'NOPAT ÷ invested capital; EBIT × (1 − tax rate)',
        },
        {
          id: 'u05-l04-c2',
          kind: 'cloze',
          front:
            'Invested capital (financing view) = ____ + ____ − ____.',
          back: 'total debt + shareholders\' equity − excess cash',
        },
        {
          id: 'u05-l04-c3',
          kind: 'basic',
          front: 'What is the value-creation test, and what does it imply about growth?',
          back: 'ROIC > WACC creates value; ROIC < WACC destroys it. Growth multiplies the sign of the spread — so a fast-growing company earning below its cost of capital makes shareholders poorer, faster.',
        },
        {
          id: 'u05-l04-c4',
          kind: 'basic',
          front: 'Why is ROIC more honest than ROE?',
          back: 'ROE measures return to equity holders only and rises with leverage or a shrinking equity base. ROIC measures the return on all capital (debt and equity), using after-tax operating profit, so it is unaffected by the financing decision.',
        },
      ],
    },

    // ── L05 ───────────────────────────────────────────────────────────────
    {
      id: 'u05-l05',
      unitId: 'u05',
      order: 5,
      title: 'Liquidity Ratios',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `Profitability is about the long run. **Liquidity** is about the next twelve months: can this company pay the bills that come due? Profitable companies go bankrupt over liquidity, not profitability — cash runs out before the strategy pays off.

Three ratios, increasingly strict:

> **Current ratio = current assets ÷ current liabilities**
> **Quick ratio = (current assets − inventory) ÷ current liabilities**
> **Cash ratio = (cash + cash equivalents + short-term investments) ÷ current liabilities**

Each step removes assets that are harder to turn into cash quickly. The **quick ratio** (also called the acid-test) strips inventory because inventory is the current asset most likely to be unsellable exactly when you need the money. Some analysts also remove prepaid expenses, which cannot be converted to cash at all.`,
        },
        {
          kind: 'text',
          md: `Rough rules of thumb — and they really are rough:

- **Current ratio** around **1.5–3.0** is comfortable for a typical manufacturer. Below 1.0 deserves an explanation. Far above 3.0 can signal a bloated balance sheet: idle cash, or inventory that is not moving.
- **Quick ratio** around **1.0** means near-term obligations are covered without selling a single widget.
- **Cash ratio** is deliberately severe; most healthy companies sit well below 1.0 and that is fine.

A **falling** current ratio matters far more than the level itself, and inventory piling up is one of the classic ways a current ratio *improves* while the business deteriorates (Lesson 9).`,
        },
        {
          kind: 'example',
          md: `**Same balance sheet, three verdicts.** Fenwick Manufacturing:

| Current assets | $M | Current liabilities | $M |
|---|---|---|---|
| Cash | 600 | Accounts payable | 1,500 |
| Short-term investments | 200 | Accrued expenses | 700 |
| Accounts receivable | 900 | Short-term debt | 300 |
| Inventory | 2,000 | | |
| Prepaid expenses | 300 | | |
| **Total** | **4,000** | **Total** | **2,500** |

- **Current ratio** = 4,000 / 2,500 = **1.60** — comfortable.
- **Quick ratio** = (4,000 − 2,000) / 2,500 = 2,000 / 2,500 = **0.80** — below 1.0.
- **Cash ratio** = (600 + 200) / 2,500 = 800 / 2,500 = **0.32** — thin.

Half of Fenwick's current assets are inventory. The reassuring 1.60 depends entirely on selling that inventory at something near carrying value. If demand stalls, the real cushion is 0.80, not 1.60.

**Why a low current ratio can be excellent.** Consider a warehouse-club retailer:

- Inventory turns **12x** a year → about **30 days** of stock on hand.
- Sales are cash and card → **DSO about 4 days**.
- Suppliers are paid in **35 days**.

Cash arrives roughly **34 days** after the goods land and the supplier bill is due at **35 days**. The company is funding its inventory with its suppliers' money — **negative working capital** — so growth *generates* cash instead of consuming it. Its current ratio may sit near **0.9**, and that is a sign of operating strength, not fragility. Costco is the textbook case.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "A higher current ratio is always safer."**

A current ratio of 4.0 might mean a fortress balance sheet — or $2B of unsold inventory and receivables nobody is collecting. Always look at *what* the current assets are, and read the ratio alongside inventory turnover and DSO from Lesson 7. Conversely, a sub-1.0 current ratio is only alarming if the company does **not** collect cash faster than it pays suppliers. The correct question is never "is the ratio high?" but "**how fast does cash actually cycle?**"`,
        },
        {
          kind: 'keypoint',
          md: `Current ratio = current assets ÷ current liabilities. Quick ratio = (current assets − inventory) ÷ current liabilities. Cash ratio = (cash + equivalents + short-term investments) ÷ current liabilities. A low current ratio is fine when cash collects faster than bills come due — negative working capital is a strength, not a warning.`,
        },
      ],
      quiz: [
        {
          id: 'u05-l05-q1',
          prompt:
            'A company has $4,000M of current assets (including $2,000M of inventory) and $2,500M of current liabilities. What is its quick ratio?',
          choices: [
            '0.80',
            '1.60',
            '2.00',
            '0.32',
          ],
          answerIdx: 0,
          explain:
            '(4,000 − 2,000) / 2,500 = 2,000 / 2,500 = 0.80. The 1.60 answer is the current ratio, which includes inventory — and the gap between the two is exactly the point: this company\'s apparent cushion depends on selling every unit of stock.',
        },
        {
          id: 'u05-l05-q2',
          prompt: 'Why does the quick ratio exclude inventory?',
          choices: [
            'Inventory is not owned by the company until it is sold',
            'Inventory is classified as a non-current asset',
            'Inventory is the current asset least reliably convertible to cash, especially when a business is under stress',
            'Inventory is always carried at an inflated value under GAAP',
          ],
          answerIdx: 2,
          explain:
            'Inventory may be obsolete, seasonal, or saleable only at a steep discount — and the moment you urgently need cash is usually the moment it is hardest to sell. It is unambiguously an owned current asset; the exclusion is about liquidity, not ownership or classification.',
        },
        {
          id: 'u05-l05-q3',
          prompt:
            'A large retailer runs a current ratio of 0.9. Its inventory turns 12x a year, customers pay at the register, and suppliers are paid in 35 days. How should you read this?',
          choices: [
            'It is on the verge of insolvency and should raise capital',
            'It should immediately slow inventory turnover to build a cushion',
            'The ratio is meaningless for retailers and should be ignored',
            'It is a strength — cash collects faster than supplier bills come due, so growth funds itself',
          ],
          answerIdx: 3,
          explain:
            'Selling in about 30 days and collecting instantly while paying suppliers at 35 days means the company holds its suppliers\' cash — negative working capital, where expansion generates cash rather than consuming it. Applying a generic "1.5 or higher" rule here would flag one of the strongest operating models in retail as a risk.',
        },
        {
          id: 'u05-l05-q4',
          prompt:
            'A manufacturer\'s current ratio rises from 1.6 to 2.4 while its inventory balance doubles and sales are flat. What is the most likely interpretation?',
          choices: [
            'Liquidity has genuinely improved and the company is safer',
            'Unsold inventory is inflating current assets — a deterioration, not an improvement',
            'The company has paid down short-term debt',
            'The company has switched inventory accounting methods',
          ],
          answerIdx: 1,
          explain:
            'Doubling inventory against flat sales means goods are piling up unsold, yet inventory is a current asset, so the ratio mechanically improves as the business gets worse. This is why the current ratio must always be read alongside inventory turnover — and why the quick ratio, which excludes inventory, would have fallen here.',
        },
      ],
      cardSeeds: [
        {
          id: 'u05-l05-c1',
          kind: 'cloze',
          front:
            'Current ratio = ____ ÷ ____. Quick ratio = (____ − ____) ÷ ____.',
          back: 'current assets ÷ current liabilities; (current assets − inventory) ÷ current liabilities',
        },
        {
          id: 'u05-l05-c2',
          kind: 'cloze',
          front: 'Cash ratio = (____ + ____ + ____) ÷ current liabilities.',
          back: '(cash + cash equivalents + short-term investments) ÷ current liabilities',
        },
        {
          id: 'u05-l05-c3',
          kind: 'basic',
          front: 'When is a current ratio below 1.0 a sign of strength rather than danger?',
          back: 'When the company collects cash faster than it pays suppliers — fast inventory turns, near-zero DSO, long payables terms. This negative working capital means suppliers finance the inventory and growth generates cash. Costco is the classic example.',
        },
      ],
    },

    // ── L06 ───────────────────────────────────────────────────────────────
    {
      id: 'u05-l06',
      unitId: 'u05',
      order: 6,
      title: 'Leverage & Solvency',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Liquidity asks about the next year. **Solvency** asks whether the company can survive its debt burden at all. Three ratios do most of the work:

> **Debt-to-equity = total debt ÷ shareholders' equity**
> **Net debt / EBITDA = (total debt − cash) ÷ EBITDA**
> **Interest coverage = EBIT ÷ interest expense**

They answer different questions:

- **D/E** — *balance sheet structure.* How much of the asset base is funded by lenders versus owners. Highly industry-dependent: banks and utilities run far higher than software companies.
- **Net debt / EBITDA** — *how many years of cash earnings it would take to repay the debt.* The number lenders and credit agencies actually watch, and the one written into loan covenants.
- **Interest coverage** — *can the company service the debt right now?* The most immediate danger signal of the three.

Rough thresholds: **net debt/EBITDA under 3.0x** is generally comfortable, 3–4x warrants attention, above 4–5x is aggressive outside of stable, regulated cash flows. **Interest coverage above 4x** is comfortable; below 2x is fragile; below 1.5x means operating profit barely covers the interest bill.`,
        },
        {
          kind: 'text',
          md: `Debt is not bad. It is **cheaper than equity** (interest is tax-deductible; lenders accept a lower return because they are paid first) and a company with zero debt may be under-using a legitimate tool. What debt does is remove **optionality**: interest and principal are contractual, while dividends and buybacks are discretionary.

The mechanism is simple and unforgiving. Leverage **amplifies returns in both directions** — the same multiplier that turns a good year into a great one turns a mediocre year into a loss. Debt does not cause a downturn; it converts a survivable one into a fatal one by forcing the company to refinance or sell assets at the worst possible moment.

Also check *when* the debt matures. A company with 4x leverage and no maturities for seven years is in a very different position from one with 2.5x leverage that must refinance $2B next year into a market that has moved against it. And **fixed vs floating** matters: floating-rate debt re-prices upward in exactly the environment that pressures earnings.`,
        },
        {
          kind: 'example',
          md: `**Reading a leveraged balance sheet.** Corvus Packaging:

- Total debt **$3,500M**, cash **$500M** → **net debt $3,000M**
- EBITDA **$1,000M** → **net debt / EBITDA = 3.0x**
- EBIT **$700M**, interest expense **$175M** → **interest coverage = 4.0x**
- Shareholders' equity **$2,000M** → **D/E = 3,500 / 2,000 = 1.75x**

Comfortable, not carefree: three years of cash earnings to clear the debt, and operating profit covers interest four times over.

**Now watch leverage work in both directions.** Two companies each hold **$1,000** of assets. Ignore tax for clarity.

- **Unlevered Co.** — funded by **$1,000** of equity, no debt.
- **Levered Co.** — funded by **$250** equity + **$750** debt at **6%** → interest **$45** per year.

| Assets return | Unlevered profit | Unlevered ROE | Levered profit | Levered ROE |
|---|---|---|---|---|
| Good year: 10% | $100 | **10.0%** | $100 − $45 = $55 | **+22.0%** |
| Bad year: 3% | $30 | **3.0%** | $30 − $45 = −$15 | **−6.0%** |

A **7-point** swing in asset returns becomes a **28-point** swing in ROE. Levered Co. looks like a superior business in the good year and is losing money in a year when the assets still earned a positive 3%. Two consecutive bad years would put its $250 of equity in real jeopardy — and if a covenant sets a maximum net debt/EBITDA of 4.0x, a 25% drop in EBITDA alone trips it, handing the lenders control.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Debt-free companies are always safer investments."**

Zero debt removes bankruptcy risk but does not create returns. Modest, well-laddered debt at a company whose ROIC comfortably exceeds its borrowing cost is genuinely value-creating. The real questions are: **how much** (net debt/EBITDA), **can it be serviced** (interest coverage), **when is it due** (the maturity wall), and **is the rate fixed or floating**. A company with 1.0x leverage in a wildly cyclical industry can be riskier than one at 3.0x with contracted, regulated revenue.`,
        },
        {
          kind: 'callout',
          md: `**Two details that trip people up.** (1) **Operating leases** are now capitalised on the balance sheet under current standards, so retailers and airlines carry lease liabilities that older comparisons missed — include them in "total debt" or your leverage ratio understates reality. (2) **EBITDA is not cash flow.** It excludes capital expenditure, working capital, interest, and tax. A capital-intensive company at 3.0x net debt/EBITDA may have far less spare cash than an asset-light one at the same multiple.`,
        },
        {
          kind: 'keypoint',
          md: `D/E = total debt ÷ equity. Net debt/EBITDA = (total debt − cash) ÷ EBITDA — under ~3.0x is comfortable. Interest coverage = EBIT ÷ interest expense — above ~4x is comfortable, below ~1.5x is dangerous. Leverage amplifies returns symmetrically: it makes good years better and bad years fatal.`,
        },
      ],
      quiz: [
        {
          id: 'u05-l06-q1',
          prompt: 'What is the formula for interest coverage?',
          choices: [
            'Net income ÷ total debt',
            'Cash ÷ annual interest expense',
            'EBITDA ÷ total debt',
            'EBIT ÷ interest expense',
          ],
          answerIdx: 3,
          explain:
            'EBIT divided by interest expense shows how many times over operating profit covers the interest bill — the most immediate solvency signal there is. Using net income would double-count, since interest has already been deducted from it, mechanically understating the true cushion.',
        },
        {
          id: 'u05-l06-q2',
          prompt:
            'A company has $3,500M of total debt, $500M of cash, and $1,000M of EBITDA. What is its net debt / EBITDA?',
          choices: [
            '3.0x',
            '3.5x',
            '2.0x',
            '4.0x',
          ],
          answerIdx: 0,
          explain:
            '(3,500 − 500) / 1,000 = 3.0x, meaning roughly three years of cash earnings would clear the debt. The 3.5x answer uses gross debt and forgets the cash offset — a meaningful distinction for any company holding a large cash balance against its borrowings.',
        },
        {
          id: 'u05-l06-q3',
          prompt:
            'Levered Co. funds $1,000 of assets with $250 of equity and $750 of debt at 6%. If the assets return 3%, what is its ROE?',
          choices: [
            '+3.0%',
            '+1.2%',
            '−6.0%',
            '0.0%',
          ],
          answerIdx: 2,
          explain:
            'Assets earn $30 while interest costs $45, so profit is −$15 on $250 of equity: −6.0%. A positive 3% asset return still produces a loss for owners because the interest bill is fixed — which is precisely how leverage converts a mediocre year into a damaging one.',
        },
        {
          id: 'u05-l06-q4',
          prompt: 'Which statement about debt is most accurate?',
          choices: [
            'Any debt is a red flag; the safest companies carry none',
            'Debt is cheaper than equity but removes optionality, since interest and principal are contractual',
            'Debt is always preferable to equity because interest is tax-deductible',
            'Leverage improves returns in good years without affecting bad ones',
          ],
          answerIdx: 1,
          explain:
            'Interest is tax-deductible and lenders accept lower returns for being paid first, so debt genuinely lowers the cost of capital — but unlike dividends it must be paid regardless of results. The claim that leverage only helps in good years inverts the whole mechanism: amplification is symmetric, which is exactly what makes it dangerous.',
        },
        {
          id: 'u05-l06-q5',
          prompt:
            'Why can two companies at an identical 3.0x net debt/EBITDA carry very different levels of real risk?',
          choices: [
            'Because EBITDA is not reported consistently under GAAP',
            'Because net debt excludes accounts payable at some companies',
            'Because maturity schedules, fixed vs floating rates, capital intensity, and cash flow stability all differ',
            'Because the ratio is only valid for companies above $1B in revenue',
          ],
          answerIdx: 2,
          explain:
            'A regulated utility with contracted revenue, fixed-rate debt, and no maturities for seven years is in a different world from a cyclical manufacturer with floating-rate debt refinancing next year — and EBITDA ignores the capex that a capital-intensive business must fund first. The ratio is a starting point, not the verdict.',
        },
      ],
      cardSeeds: [
        {
          id: 'u05-l06-c1',
          kind: 'cloze',
          front: 'Interest coverage = ____ ÷ ____. Comfortable is above ____; dangerous is below ____.',
          back: 'EBIT ÷ interest expense; above ~4x; below ~1.5x',
        },
        {
          id: 'u05-l06-c2',
          kind: 'cloze',
          front: 'Net debt / EBITDA = (____ − ____) ÷ ____.',
          back: '(total debt − cash) ÷ EBITDA — under ~3.0x is generally comfortable',
        },
        {
          id: 'u05-l06-c3',
          kind: 'basic',
          front: 'Why does leverage amplify returns in both directions?',
          back: 'Interest is a fixed contractual cost against a thin equity base. If assets return more than the borrowing rate, the surplus accrues entirely to owners; if less, the shortfall does too. A small swing in asset returns becomes a large swing in ROE.',
        },
        {
          id: 'u05-l06-c4',
          kind: 'basic',
          front: 'Beyond the leverage ratio itself, what four things determine how risky a company\'s debt really is?',
          back: 'How much (net debt/EBITDA), whether it can be serviced (interest coverage), when it matures (the refinancing wall), and whether the rate is fixed or floating. Cash flow stability and capital intensity sit behind all four.',
        },
      ],
    },

    // ── L07 ───────────────────────────────────────────────────────────────
    {
      id: 'u05-l07',
      unitId: 'u05',
      order: 7,
      title: 'Efficiency Ratios',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Efficiency (or **activity**) ratios ask how hard the asset base works. They are the "turnover" leg of the DuPont identity, and they explain how a 2% net margin grocer can still earn a respectable ROE.

> **Asset turnover = revenue ÷ average total assets**
> **Inventory turnover = COGS ÷ average inventory**
> **Receivables turnover = revenue ÷ average accounts receivable**
> **Fixed asset turnover = revenue ÷ average net PP&E**

Turnover ratios convert naturally into **days**, which are far more intuitive:

> **Days inventory outstanding (DIO) = 365 ÷ inventory turnover**
> **Days sales outstanding (DSO) = 365 ÷ receivables turnover** = (average AR ÷ revenue) × 365
> **Days payable outstanding (DPO) = 365 ÷ (COGS ÷ average accounts payable)**

Note that inventory turnover uses **COGS**, not revenue — both numerator and denominator must be at cost, or the markup inflates the ratio.`,
        },
        {
          kind: 'text',
          md: `Chain the three day-counts together and you get the **cash conversion cycle**:

> **CCC = DIO + DSO − DPO**

This is the number of days a dollar is trapped in operations between paying a supplier and collecting from a customer. Lower is better; **negative** is exceptional — it means customers pay you before you pay your suppliers, so growth funds itself (the negative-working-capital model from Lesson 5).

**Fixed-asset intensity** is the structural cousin. A steel mill or semiconductor fab turns net PP&E maybe **0.5–1.5x** a year; a consulting firm or software company might turn it **10x or more**. Capital-intensive businesses need high margins to justify the asset base, and they carry more operating leverage — high fixed costs mean profits swing hard with volume in either direction.`,
        },
        {
          kind: 'example',
          md: `**Working through Fenwick Manufacturing.** Revenue $8,000M, COGS $5,600M.

| Item | Average balance |
|---|---|
| Total assets | $6,400M |
| Inventory | $700M |
| Accounts receivable | $800M |
| Accounts payable | $560M |
| Net PP&E | $2,000M |

- **Asset turnover** = 8,000 / 6,400 = **1.25x** — each dollar of assets produces $1.25 of sales.
- **Inventory turnover** = 5,600 / 700 = **8.0x** → **DIO = 365 / 8.0 = 45.6 days**.
- **Receivables turnover** = 8,000 / 800 = **10.0x** → **DSO = 365 / 10.0 = 36.5 days**.
- **Payables turnover** = 5,600 / 560 = **10.0x** → **DPO = 36.5 days**.
- **Fixed asset turnover** = 8,000 / 2,000 = **4.0x**.

**Cash conversion cycle** = 45.6 + 36.5 − 36.5 = **45.6 days**. Fenwick funds roughly a month and a half of operations out of its own pocket.

**What improvement is worth.** Suppose Fenwick cuts DIO from 45.6 to 36.5 days (turnover 8.0x → 10.0x). Average inventory falls from $700M to 5,600 / 10.0 = **$560M**, releasing **$140M** of cash — with no extra sales, no new customers, and no capital raised. That freed cash can repay debt, fund capex, or buy back stock. Working capital discipline is one of the quietest sources of shareholder value there is.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "Faster is always better."**

Push inventory turns too high and you start **stocking out**, losing sales and disappointing customers. Push DSO too low by tightening credit terms and you push customers to competitors who offer 60 days. Stretch DPO too far and suppliers raise prices, deprioritise you, or demand cash up front. Every efficiency ratio has an optimum, not a maximum — and the optimum is set by the industry and the strategy, which is why the peer lens matters most here.`,
        },
        {
          kind: 'callout',
          md: `**Two mechanical traps.** (1) Inventory turnover must use **COGS**, not revenue — using revenue inflates the ratio by the full gross margin and makes a company look far leaner than it is. (2) Use **average** balances, not year-end. Many retailers deliberately end their fiscal year at the seasonal trough, when inventory is at its lowest, which flatters any year-end-based turnover calculation.`,
        },
        {
          kind: 'keypoint',
          md: `Asset turnover = revenue ÷ average total assets. Inventory turnover = COGS ÷ average inventory (DIO = 365 ÷ turns). Receivables turnover = revenue ÷ average AR (DSO = 365 ÷ turns). Cash conversion cycle = DIO + DSO − DPO; lower is better and negative is exceptional. Faster has an optimum, not a maximum.`,
        },
      ],
      quiz: [
        {
          id: 'u05-l07-q1',
          prompt:
            'A company reports revenue of $8,000M, COGS of $5,600M, and average inventory of $700M. What is its inventory turnover?',
          choices: [
            '11.4x',
            '8.0x',
            '0.125x',
            '1.25x',
          ],
          answerIdx: 1,
          explain:
            'Inventory turnover = COGS ÷ average inventory = 5,600 / 700 = 8.0x, implying about 45.6 days of stock. The 11.4x answer uses revenue instead of COGS, inflating the result by the entire gross margin — the most common mechanical error in the whole efficiency family.',
        },
        {
          id: 'u05-l07-q2',
          prompt: 'What is the cash conversion cycle?',
          choices: [
            'DIO + DSO + DPO',
            'DSO − DIO + DPO',
            '365 ÷ asset turnover',
            'DIO + DSO − DPO',
          ],
          answerIdx: 3,
          explain:
            'You hold inventory (DIO), then wait to collect from customers (DSO), but supplier credit (DPO) funds part of that period — so payables are subtracted. Adding DPO instead would treat supplier financing as if it *trapped* your cash rather than freeing it, inverting the meaning entirely.',
        },
        {
          id: 'u05-l07-q3',
          prompt:
            'A company with $5,600M of COGS improves inventory turnover from 8.0x to 10.0x. Roughly how much cash does that release?',
          choices: [
            'About $140M, as average inventory falls from $700M to $560M',
            'About $1,120M, equal to the change in turnover times COGS',
            'Nothing — turnover is a ratio and does not affect cash',
            'About $700M, the entire original inventory balance',
          ],
          answerIdx: 0,
          explain:
            'Average inventory = COGS ÷ turnover, so it falls from 5,600/8.0 = $700M to 5,600/10.0 = $560M, freeing $140M with no additional sales. Dismissing this as "just a ratio" misses that inventory is a real cash asset — working capital discipline is one of the quietest sources of shareholder value.',
        },
        {
          id: 'u05-l07-q4',
          prompt:
            'A manufacturer aggressively cuts DSO from 45 days to 15 days by demanding much tighter credit terms. What is the most likely consequence?',
          choices: [
            'Its cash conversion cycle worsens',
            'Its inventory turnover falls proportionally',
            'Customers defect to competitors offering more generous payment terms',
            'Its gross margin rises by the interest saved',
          ],
          answerIdx: 2,
          explain:
            'Credit terms are part of the commercial offer, so tightening them far below industry norms hands rivals an easy advantage and costs revenue. The CCC would mechanically *improve* — which is exactly the trap: the ratio gets better while the business gets worse, so every efficiency measure has an optimum rather than a maximum.',
        },
      ],
      cardSeeds: [
        {
          id: 'u05-l07-c1',
          kind: 'cloze',
          front: 'Inventory turnover = ____ ÷ ____ (never revenue). DIO = ____ ÷ inventory turnover.',
          back: 'COGS ÷ average inventory; 365 ÷ inventory turnover',
        },
        {
          id: 'u05-l07-c2',
          kind: 'cloze',
          front: 'Asset turnover = ____ ÷ ____. DSO = ____ ÷ receivables turnover.',
          back: 'revenue ÷ average total assets; 365 ÷ receivables turnover',
        },
        {
          id: 'u05-l07-c3',
          kind: 'cloze',
          front: 'Cash conversion cycle = ____ + ____ − ____.',
          back: 'DIO + DSO − DPO — days a dollar is trapped between paying suppliers and collecting from customers',
        },
        {
          id: 'u05-l07-c4',
          kind: 'basic',
          front: 'Why is a maximum efficiency ratio not the goal?',
          back: 'Too-fast inventory turns cause stockouts and lost sales; too-low DSO drives customers to rivals with better credit terms; too-high DPO strains suppliers. Each ratio has an industry- and strategy-specific optimum, not a maximum.',
        },
      ],
    },

    // ── L08 ───────────────────────────────────────────────────────────────
    {
      id: 'u05-l08',
      unitId: 'u05',
      order: 8,
      title: 'Growth & Per-Share Metrics',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Growth needs a rate that ignores the noise of any single year. That rate is the **compound annual growth rate**:

> **CAGR = (ending value ÷ beginning value)^(1 ÷ n) − 1**

where **n** is the number of *periods*, which is one less than the number of data points — five years of growth spans six annual figures. A CAGR smooths a jagged path into the constant rate that would have produced the same endpoints, which is exactly what you want for comparison and exactly what you must not mistake for stability. Two companies can share a 10% CAGR while one grew steadily and the other collapsed and rebounded.

Always compute CAGR on **revenue** and on **EPS** separately. The gap between them tells you a story that neither number tells alone.`,
        },
        {
          kind: 'text',
          md: `**Think per share, always.** You do not own a company; you own a **fraction** of one. Total profit growing 10% while the share count grows 12% leaves you worse off.

- **Buybacks** shrink the share count, so EPS grows faster than net income. They are only value-creating if the shares are repurchased **below intrinsic value** — buying back overpriced stock destroys value just as surely as a bad acquisition.
- **Dilution** from stock-based compensation, convertible notes, or equity raises does the opposite. Watch **diluted** shares outstanding over five years; it is one of the most revealing single time series in a filing.

The other essential growth idea is how fast a company can grow **without raising outside capital**:

> **Sustainable growth rate = ROE × retention ratio**, where **retention ratio = 1 − dividend payout ratio**

A company earning a 15% ROE and paying out 40% of earnings retains 60%, so it can self-fund about **9%** growth. Push beyond that and it must issue equity (diluting you) or borrow (adding leverage). SGR is a reality check on any management growth target.`,
        },
        {
          kind: 'example',
          md: `**Where per-share growth actually comes from.** Vantage Components, over five years:

| | Year 0 | Year 5 |
|---|---|---|
| Revenue | $2,000M | $3,220M |
| Net income | $200M | $340M |
| Diluted shares | 100M | 85M |
| EPS | $2.00 | $4.00 |

- **Revenue CAGR** = (3,220 / 2,000)^(1/5) − 1 = 1.610^0.2 − 1 ≈ **10.0%**
- **Net income CAGR** = (340 / 200)^(1/5) − 1 = 1.700^0.2 − 1 ≈ **11.2%**
- **EPS CAGR** = (4.00 / 2.00)^(1/5) − 1 = 2.000^0.2 − 1 ≈ **14.9%**

Three different growth rates from one company. Revenue grew 10.0%; margin expansion added about **1.2 points**; retiring **15%** of the shares added roughly another **3.7 points**. An investor who only quoted "EPS grew 15%" would be crediting operations for something buybacks did.

**The reverse case.** Meridian Tools grew revenue at **3.0%** but issued shares at **2%** a year to fund stock compensation. Net income CAGR **3.2%**, share count up **10.4%** over five years → **EPS CAGR ≈ 1.2%**. Headline "revenue and profits both grew every year" — per-share, an owner gained almost nothing.

**Sustainable growth check.** Vantage's ROE is 18% and it pays out 25% of earnings → retention 75% → **SGR = 0.18 × 0.75 = 13.5%**. Its 10% revenue growth is comfortably self-funded. A management team guiding to 20% growth off the same balance sheet would be promising something that requires new equity or new debt.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "EPS growth is the same as business growth."**

EPS is a **ratio**, and its denominator is under management's control. EPS can rise while revenue is flat (buybacks), while net income is falling (aggressive buybacks), or purely from a lower tax rate. It can also fall at a thriving company that is issuing shares to fund genuine expansion. Always decompose: **EPS growth = revenue growth + margin change + share-count change.** And treat buybacks as capital allocation — a repurchase above intrinsic value transfers wealth from continuing holders to sellers.`,
        },
        {
          kind: 'callout',
          md: `**CAGR endpoint sensitivity.** Because CAGR uses only two data points, the choice of start year can transform the result. Measuring from a recession trough produces a flattering rate; measuring from a cyclical peak produces a dismal one. Use a period spanning a full cycle where possible, sanity-check the CAGR against the year-by-year figures, and be suspicious of any five-year rate that starts in an obviously unusual year.`,
        },
        {
          kind: 'keypoint',
          md: `CAGR = (ending ÷ beginning)^(1/n) − 1, with n = periods, not data points. Think per share: EPS growth = revenue growth + margin change + share-count change. Sustainable growth rate = ROE × retention ratio (1 − payout) is the fastest a company can grow without issuing equity or adding debt.`,
        },
      ],
      quiz: [
        {
          id: 'u05-l08-q1',
          prompt:
            'Revenue grows from $2,000M to $3,220M over five years. What is the CAGR?',
          choices: [
            'About 10.0%',
            'About 12.2%',
            'About 61.0%',
            'About 20.4%',
          ],
          answerIdx: 0,
          explain:
            '(3,220 / 2,000)^(1/5) − 1 = 1.610^0.2 − 1 ≈ 0.100, or 10.0%. The 12.2% answer divides the 61.0% total growth by five, which ignores compounding and always overstates the annual rate.',
        },
        {
          id: 'u05-l08-q2',
          prompt:
            'A company grows revenue 10.0% a year, net income 11.2%, and EPS 14.9%. What explains the gap between net income growth and EPS growth?',
          choices: [
            'A lower effective tax rate',
            'A falling share count from buybacks',
            'Rising gross margin',
            'An accounting change in revenue recognition',
          ],
          answerIdx: 1,
          explain:
            'EPS is net income divided by shares, so with profit growing 11.2% the extra 3.7 points must come from a shrinking denominator. Margin improvement and tax changes both flow through net income itself, so they would already be captured in the 11.2% figure.',
        },
        {
          id: 'u05-l08-q3',
          prompt:
            'A company earns a 15% ROE and pays out 40% of earnings as dividends. What is its sustainable growth rate?',
          choices: [
            '15%',
            '6%',
            '25%',
            '9%',
          ],
          answerIdx: 3,
          explain:
            'SGR = ROE × retention ratio = 0.15 × (1 − 0.40) = 0.15 × 0.60 = 9%. The 6% answer multiplies ROE by the *payout* ratio instead of the retention ratio — but it is retained earnings, not distributed ones, that fund future growth.',
        },
        {
          id: 'u05-l08-q4',
          prompt:
            'Meridian grows revenue 3.0% a year while diluting shareholders roughly 2% a year through stock compensation. What is the effect on an existing shareholder?',
          choices: [
            'They benefit fully from the 3.0% revenue growth',
            'They are unaffected, since their share count is unchanged',
            'Their per-share claim grows barely at all — EPS CAGR near 1.2%',
            'Their dividend per share rises 3.0% a year automatically',
          ],
          answerIdx: 2,
          explain:
            'Growth in the numerator is almost entirely offset by growth in the denominator, so per-share value barely moves even as the company reports rising revenue and profits every year. Your own share count never changes with dilution — the erosion happens in the total, which is why it is so easy to miss.',
        },
        {
          id: 'u05-l08-q5',
          prompt:
            'Why can a five-year CAGR be misleading even when correctly calculated?',
          choices: [
            'It uses only the endpoints, so an unusual start or end year distorts the whole rate',
            'It always understates growth for profitable companies',
            'It cannot be applied to per-share figures',
            'It requires at least ten years of data to be valid',
          ],
          answerIdx: 0,
          explain:
            'Two data points determine the entire result, so starting from a recession trough flatters the rate and starting from a cyclical peak crushes it — and CAGR says nothing about the volatility in between. It works on any series, per-share figures included, and carries no directional bias.',
        },
      ],
      cardSeeds: [
        {
          id: 'u05-l08-c1',
          kind: 'cloze',
          front: 'CAGR = (____ ÷ ____)^(1 ÷ ____) − 1, where n = the number of ____.',
          back: '(ending value ÷ beginning value)^(1/n) − 1; n = periods (one less than the number of data points)',
        },
        {
          id: 'u05-l08-c2',
          kind: 'cloze',
          front: 'Sustainable growth rate = ____ × ____, where retention ratio = 1 − ____.',
          back: 'ROE × retention ratio; 1 − dividend payout ratio',
        },
        {
          id: 'u05-l08-c3',
          kind: 'basic',
          front: 'Decompose EPS growth into its three sources.',
          back: 'EPS growth ≈ revenue growth + margin change + share-count change. Buybacks add to it, dilution subtracts, and neither has anything to do with operating performance.',
        },
        {
          id: 'u05-l08-c4',
          kind: 'basic',
          front: 'When do buybacks create value, and when do they destroy it?',
          back: 'They create value when shares are repurchased below intrinsic value — continuing holders gain. They destroy value when shares are bought above it, transferring wealth from continuing holders to sellers. Buybacks are capital allocation, not automatic good news.',
        },
      ],
    },

    // ── L09 ───────────────────────────────────────────────────────────────
    {
      id: 'u05-l09',
      unitId: 'u05',
      order: 9,
      title: 'Red Flags & Earnings Quality',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**Earnings quality** measures how closely reported profit corresponds to actual economic performance. Low-quality earnings are not necessarily fraudulent — accrual accounting requires judgement, and judgement can be applied optimistically for a long time before it becomes a lie.

The single best quality test is the one Unit 4 set up:

> **Cash flow from operations should track net income over time.**

Net income is an opinion; cash is a fact. When CFO runs persistently **below** net income for several years, the difference is sitting in accruals — receivables not yet collected, inventory not yet sold, revenue recognised ahead of cash. One divergent quarter is noise. Three divergent years is a pattern.`,
        },
        {
          kind: 'text',
          md: `The classic warning signs, roughly in order of how reliable they are:

1. **Receivables growing faster than revenue** (rising DSO). Sales may be booked with stretched credit terms, channel-stuffed into distributors, or made to customers who cannot pay.
2. **Inventory growing faster than sales** (rising DIO). Demand is weakening, or a write-down is coming. Inventory sitting on the balance sheet has not yet hit COGS, so it flatters current margins.
3. **CFO persistently below net income.** The master signal above.
4. **Serial "one-time" charges.** Restructuring every year for five years is not restructuring — it is an operating expense being routed around the income statement.
5. **Aggressive capitalisation.** Costs moved from the income statement to the balance sheet (software development, customer acquisition, interest) boost current profit and push the expense into future amortisation. Watch for capitalisation rates rising, or diverging from peers.
6. **Widening GAAP vs non-GAAP gap.** If "adjusted" earnings keep pulling further away from reported earnings, ask what is being adjusted away and whether it recurs.
7. **Auditor changes, CFO turnover, late filings, restatements.** Individually explainable; together, a strong signal. An auditor resignation or a material weakness disclosure deserves your full attention.
8. **Falling depreciation relative to the asset base**, or extended useful lives. Stretching a depreciation schedule raises reported profit without changing anything real.

None of these is proof. Each one is a **question you now have to answer** before you can trust the earnings.`,
        },
        {
          kind: 'example',
          md: `**Anchor Systems: the numbers that should stop you.**

| | Year 1 | Year 2 | Change |
|---|---|---|---|
| Revenue | $1,000M | $1,100M | **+10%** |
| Accounts receivable | $120M | $174M | **+45%** |
| Inventory | $200M | $260M | **+30%** |
| Net income | $130M | $150M | **+15%** |
| Cash flow from operations | $125M | $60M | **−52%** |

Run the ratios:

- **DSO** = (AR ÷ revenue) × 365: Year 1 = (120 / 1,000) × 365 = **43.8 days**; Year 2 = (174 / 1,100) × 365 = **57.7 days**. Nearly **two extra weeks** of uncollected sales.
- **Inventory up 30%** on **10%** revenue growth — roughly $60M of goods that did not sell.
- **CFO ÷ net income**: Year 1 = 125 / 130 = **0.96**; Year 2 = 60 / 150 = **0.40**.

Reported earnings grew 15%. The cash they supposedly generated fell by more than half. The $90M gap between net income and CFO is sitting in receivables and inventory — assets that only become cash if customers pay and goods sell.

Add one more disclosure: Anchor's auditor resigned in Q4 and the 10-K was filed late. The individual signals were arguable. Together they describe a company whose reported profit is being financed by its own balance sheet.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception: "The auditors signed off, so the numbers are fine."**

An unqualified audit opinion says the statements are free of *material misstatement* under GAAP — it does not say the accounting choices are conservative, that management's estimates are realistic, or that the business is healthy. Enron, Wirecard, and Luckin Coffee all had audited financials. GAAP has wide latitude on revenue timing, reserve levels, useful lives, and capitalisation, and a determined management can sit at the aggressive end of every one of those ranges while remaining entirely within the rules.`,
        },
        {
          kind: 'callout',
          md: `**Innocent explanations exist — check for them first.** DSO can jump because of an acquisition with different terms, a deliberate move upmarket to enterprise customers, or a late-quarter surge in shipments. Inventory can build ahead of a genuine product launch or to buffer a known supply disruption. Read the MD&A, listen to how management explains it, and see whether the ratio reverts next period. A red flag is a **prompt to investigate**, not a verdict — and management refusing to address a direct question about it is itself informative.`,
        },
        {
          kind: 'keypoint',
          md: `Cash flow from operations should track net income over time; a persistent gap means profit is sitting in accruals. Watch DSO rising faster than revenue, inventory outpacing sales, serial "one-time" charges, aggressive capitalisation, a widening GAAP/non-GAAP gap, and auditor or CFO turnover. A clean audit opinion is not a quality guarantee.`,
        },
      ],
      quiz: [
        {
          id: 'u05-l09-q1',
          prompt:
            'What is the single most useful test of earnings quality?',
          choices: [
            'Whether the company beats analyst estimates each quarter',
            'Whether the gross margin exceeds the peer average',
            'Whether the auditor issued an unqualified opinion',
            'Whether cash flow from operations tracks net income over several years',
          ],
          answerIdx: 3,
          explain:
            'Net income depends on accrual judgements while operating cash flow is far harder to manufacture, so a persistent gap between them shows profit accumulating in receivables, inventory, or premature revenue. An unqualified opinion only means the statements are free of material misstatement under GAAP — Enron and Wirecard both had one.',
        },
        {
          id: 'u05-l09-q2',
          prompt:
            'Revenue grows 10% while accounts receivable grows 45%, pushing DSO from 44 to 58 days. What does this most likely indicate?',
          choices: [
            'The company has become more efficient at collections',
            'Sales are being booked that have not been collected — possibly stretched terms, channel stuffing, or weak customers',
            'The company has reduced its credit exposure',
            'Revenue recognition has become more conservative',
          ],
          answerIdx: 1,
          explain:
            'Receivables ballooning far faster than sales means an increasing share of reported revenue exists only as a promise to pay, which is the opposite of improved collections. It is also the opposite of conservatism — recognising revenue earlier and collecting later is aggressive on both dimensions.',
        },
        {
          id: 'u05-l09-q3',
          prompt:
            'A company records a "one-time restructuring charge" in each of the last five years. How should you treat these charges?',
          choices: [
            'Exclude them all, as management recommends',
            'Exclude them only in the years the company was profitable',
            'Treat them as a recurring operating expense — repeated annually, they are not one-time',
            'Ignore them entirely because they are non-cash',
          ],
          answerIdx: 2,
          explain:
            'Something that happens every single year is by definition part of normal operations, so excluding it systematically overstates the company\'s true earning power. Restructuring charges are frequently cash costs too — severance and lease terminations are paid in real money.',
        },
        {
          id: 'u05-l09-q4',
          prompt:
            'A software company begins capitalising a much larger share of its development costs than in prior years. What is the immediate effect on the financial statements?',
          choices: [
            'Reported profit rises now, with the cost shifted into future amortisation',
            'Reported profit falls now and rises later',
            'Operating cash flow falls immediately',
            'There is no effect, since the cash spent is identical either way',
          ],
          answerIdx: 0,
          explain:
            'Capitalising moves the spend from an immediate expense to a balance sheet asset, so current profit rises and the cost reappears gradually as amortisation in future years. The cash outflow is indeed unchanged — which is exactly why the cash flow statement is the check on this manoeuvre, and why a rising capitalisation rate deserves scrutiny.',
        },
      ],
      cardSeeds: [
        {
          id: 'u05-l09-c1',
          kind: 'basic',
          front: 'What is the master test of earnings quality, and what does a persistent gap mean?',
          back: 'Cash flow from operations should track net income over several years. CFO persistently below net income means reported profit is sitting in accruals — uncollected receivables, unsold inventory, or revenue recognised ahead of cash.',
        },
        {
          id: 'u05-l09-c2',
          kind: 'basic',
          front: 'Name six earnings-quality red flags.',
          back: 'Receivables outgrowing revenue (rising DSO); inventory outpacing sales; CFO persistently below net income; serial "one-time" charges; aggressive capitalisation of costs; a widening GAAP/non-GAAP gap. Add auditor changes, CFO turnover, late filings, and restatements.',
        },
        {
          id: 'u05-l09-c3',
          kind: 'cloze',
          front:
            'An unqualified audit opinion means the statements are free of ____ under GAAP — it does not mean the accounting is ____ or the business is ____.',
          back: 'material misstatement; conservative; healthy',
        },
      ],
    },

    // ── L10 ───────────────────────────────────────────────────────────────
    {
      id: 'u05-l10',
      unitId: 'u05',
      order: 10,
      title: 'The Financial Health Checklist',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Nine lessons of ratios become useful only when you run them in a fixed order, every time, on every company. A checklist beats intuition for the same reason pilots use one: it stops you skipping the step you skipped last time.

Work outward in five layers, in this sequence:

**Profitability → Returns → Liquidity → Leverage → Quality**

The order matters. Profitability tells you whether the business earns anything; returns tell you whether that profit justifies the capital consumed; liquidity and leverage tell you whether it survives long enough to keep doing so; quality tells you whether to believe any of the preceding numbers. Quality is last because it is the **veto** — if the earnings are not real, everything above it is decoration.`,
        },
        {
          kind: 'text',
          md: `**The 10-point checklist.** Score each item pass, watch, or fail — and always across three to five years, never a single snapshot.

| # | Layer | Test | Rough threshold |
|---|---|---|---|
| 1 | Profitability | Gross margin stable or rising | No multi-year erosion |
| 2 | Profitability | Operating margin at or above peers, and improving | Peer-relative |
| 3 | Returns | ROE, decomposed by DuPont | >15% not driven mainly by leverage |
| 4 | Returns | **ROIC > WACC** by a clear margin | Spread of +3 points or more |
| 5 | Liquidity | Current ratio, or a demonstrable negative-working-capital model | ≥1.0, or fast cash cycle |
| 6 | Leverage | Net debt / EBITDA | <3.0x |
| 7 | Leverage | Interest coverage | >4x |
| 8 | Quality | CFO ÷ net income, three-year average | ≥1.0 |
| 9 | Quality | DSO and inventory days flat or improving | No divergence from revenue |
| 10 | Growth | Share count flat or falling; revenue and EPS growing | EPS CAGR ≥ revenue CAGR |

Item **4** is the one that matters most and is skipped most often. A company can pass every other line and still destroy value if it reinvests below its cost of capital.

**Reading the score.** 9–10 is a genuinely healthy business — which says nothing about whether the stock is worth the price (Units 6 and 7). 6–8 means specific, nameable issues to investigate. Below 6 means the burden of proof has shifted: you need a concrete thesis for why the failures reverse, not a hope.`,
        },
        {
          kind: 'example',
          md: `**Worked example — Meridian Tools Inc. (fictional).** Industrial components, revenue $2,400M.

Inputs: gross profit $984M · operating income $336M · net income $185M · EBITDA $430M · EBIT $336M · interest expense $37M · total debt $860M · cash $170M · average equity $1,030M · CFO $210M · WACC 8.5%.

| # | Test | Calculation | Result | Score |
|---|---|---|---|---|
| 1 | Gross margin | 984 / 2,400 = 41.0% (41.2%, 40.8%, 41.0% over 3y) | Stable | **Pass** |
| 2 | Operating margin | 336 / 2,400 = 14.0%, up from 12.0%; peers ~12% | Above peers, improving | **Pass** |
| 3 | ROE (DuPont) | 185 / 1,030 = 18.0% = 7.7% margin × 1.14x turnover × 2.05x multiplier | Modest leverage | **Pass** |
| 4 | ROIC vs WACC | NOPAT = 336 × 0.75 = 252; IC = 860 + 1,030 − 170 = 1,720 → 14.7% vs 8.5% | Spread +6.2 pts | **Pass** |
| 5 | Current ratio | 1.80 (quick 1.00) | Comfortable | **Pass** |
| 6 | Net debt / EBITDA | (860 − 170) / 430 = 1.6x | Well under 3.0x | **Pass** |
| 7 | Interest coverage | 336 / 37 = 9.1x | Well over 4x | **Pass** |
| 8 | CFO ÷ net income | 210 / 185 = 1.14 (3y avg 1.11) | Cash-backed | **Pass** |
| 9 | Working capital trend | DSO 47 → 58 days; inventory +14% vs revenue +3% | Deteriorating | **Fail** |
| 10 | Per-share growth | Revenue CAGR 3.0%; shares +2%/yr → EPS CAGR 1.2% | Dilution eats growth | **Fail** |

**Score: 8 / 10.**

**The verdict.** Meridian is a solidly profitable, conservatively financed business earning a genuine 6.2-point spread over its cost of capital. Every failure sits in the same place: the business has **stopped growing**, and the working capital build in item 9 suggests it may be pushing product into a market that no longer wants it as readily. Item 10 confirms owners are capturing almost none of what growth remains, because stock compensation is diluting them at nearly the rate revenue expands.

**What you would do next:** read the last four quarters of MD&A for the DSO explanation, check whether inventory growth is a deliberate pre-launch build or unsold stock, and compare the stock-compensation run rate against peers. The checklist did not answer the question — it told you exactly which three questions to ask.`,
        },
        {
          kind: 'callout',
          md: `**A healthy company is not automatically a good investment.** Everything in this unit measures the **business**. Whether the stock is worth buying depends on the **price** you pay for that business, which is the subject of Units 6 and 7. A 10/10 company at an absurd valuation can be a poor investment; a 6/10 company priced for bankruptcy can be an excellent one. Never let a strong checklist score substitute for a valuation.`,
        },
        {
          kind: 'callout',
          md: `**Adapt the thresholds to the industry.** Banks and insurers need an entirely different framework (regulatory capital, net interest margin, combined ratio) and most of these items simply do not apply. REITs run high leverage by design and are judged on FFO, not EPS. Early-stage growth companies may fail items 3, 4, and 8 legitimately while investing heavily ahead of revenue — the question there becomes unit economics and the path to positive ROIC, not the current reading. Use the checklist as a **structure**, and let the industry set the numbers.`,
        },
        {
          kind: 'keypoint',
          md: `Run every company through the same five layers in order: profitability → returns → liquidity → leverage → quality, with growth as a per-share cross-check. Quality is last because it is the veto. Item 4 — ROIC > WACC — is the most important and most often skipped. And a healthy business is still not a good investment at any price.`,
        },
      ],
      quiz: [
        {
          id: 'u05-l10-q1',
          prompt:
            'Why is earnings quality assessed last in the checklist rather than first?',
          choices: [
            'Because it is the least important of the five layers',
            'Because it acts as a veto — if earnings are not real, every ratio built on them is meaningless',
            'Because it requires data that is only released annually',
            'Because regulators require it to be disclosed after the ratios',
          ],
          answerIdx: 1,
          explain:
            'Quality comes last in sequence but first in authority: a company can pass profitability, returns, liquidity, and leverage on numbers that turn out to be accrual-inflated, which invalidates all of them at once. Placing it last is about workflow, not priority — it is the check you apply to everything above it.',
        },
        {
          id: 'u05-l10-q2',
          prompt:
            'Meridian Tools has EBIT of $336M, a 25% tax rate, total debt of $860M, average equity of $1,030M, and $170M of cash. What is its ROIC?',
          choices: [
            '19.5%',
            '17.9%',
            '14.7%',
            '13.3%',
          ],
          answerIdx: 2,
          explain:
            'NOPAT = 336 × 0.75 = $252M; invested capital = 860 + 1,030 − 170 = $1,720M; 252 / 1,720 = 14.7%. The 13.3% answer leaves the $170M of cash in the denominator, which understates how hard the operating assets actually work.',
        },
        {
          id: 'u05-l10-q3',
          prompt:
            'Which single checklist item is described as the most important and the most often skipped?',
          choices: [
            'Gross margin stability',
            'Interest coverage above 4x',
            'Current ratio at or above 1.0',
            'ROIC exceeding WACC by a clear margin',
          ],
          answerIdx: 3,
          explain:
            'A company can clear every other test and still make shareholders poorer if it reinvests capital at a return below what that capital costs. The other items measure profitability, safety, or liquidity — none of them ever compares the return earned against the return required, which is the actual value-creation test.',
        },
        {
          id: 'u05-l10-q4',
          prompt:
            'Meridian scores 8/10, failing only the working capital trend and per-share growth items. What is the correct conclusion?',
          choices: [
            'It is a sound, well-financed business whose growth has stalled and whose owners are being diluted — investigate those two areas specifically',
            'The two failures are minor and can safely be ignored given six clean passes',
            'The business is fundamentally unsound and should be dismissed',
            'The score means the stock is attractively priced',
          ],
          answerIdx: 0,
          explain:
            'Both failures cluster around the same theme — rising DSO and inventory alongside near-zero per-share growth — which converts a score into a specific research agenda rather than a verdict. The checklist measures the business only: it says nothing whatever about whether the price is attractive.',
        },
        {
          id: 'u05-l10-q5',
          prompt:
            'A company scores 10/10 on the financial health checklist. What does this tell you about the stock?',
          choices: [
            'It is a buy, since all ten health tests passed',
            'Nothing about the stock — the checklist measures the business, not the price you would pay',
            'It will outperform the market over the next year',
            'Its valuation multiple must already be low',
          ],
          answerIdx: 1,
          explain:
            'Every item here measures business quality, and none of them references the share price, so a perfect score is entirely compatible with a valuation that guarantees poor returns. Separating "is this a good business?" from "is this a good price?" is the whole reason Units 6 and 7 exist.',
        },
      ],
      cardSeeds: [
        {
          id: 'u05-l10-c1',
          kind: 'cloze',
          front:
            'The financial health checklist runs five layers in order: ____ → ____ → ____ → ____ → ____.',
          back: 'profitability → returns → liquidity → leverage → quality (quality is last because it is the veto)',
        },
        {
          id: 'u05-l10-c2',
          kind: 'basic',
          front: 'Name the seven quantitative thresholds in the 10-point health checklist.',
          back: 'ROE >15% not driven by leverage; ROIC > WACC by 3+ points; current ratio ≥1.0 (or negative working capital); net debt/EBITDA <3.0x; interest coverage >4x; CFO ÷ net income ≥1.0 on a 3-year average; EPS CAGR ≥ revenue CAGR with a flat or falling share count.',
        },
        {
          id: 'u05-l10-c3',
          kind: 'basic',
          front: 'Why is a 10/10 financial health score not a buy signal?',
          back: 'The checklist measures the business, never the price. A superb company bought at an absurd valuation can deliver poor returns, and a mediocre one priced for bankruptcy can deliver excellent ones. Valuation is a separate step.',
        },
      ],
    },
  ],
}
