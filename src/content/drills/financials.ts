// ─── Read-the-financials drill definitions ───────────────────────────────────
//
// Every drill below points at one or two snapshots in
// `public/data/financials/companies.json` — twelve fictional companies, one
// fiscal year each, chosen so the *shape* of the statements differs as much as
// the numbers do: an 80%-gross-margin software vendor next to a 25%-margin
// grocer, an airline whose capex eats its operating cash, a homebuilder whose
// balance sheet is almost entirely inventory, a lender levered 5.8×, and one
// retailer (Brightway) carrying a deliberate cluster of red flags.
//
// WHY EVERY KIND IS MULTIPLE CHOICE
// ---------------------------------
// `ratio-calc` could have taken a typed number with a ±3% band. It doesn't, for
// two reasons. On a phone a keypad plus a tolerance rule is friction, and more
// importantly a tolerance band rewards being *near* the answer by luck. The
// distractors here are instead the four or five mistakes learners actually
// make — inverting the ratio, computing the quick ratio when asked for the
// current ratio, dividing by total assets instead of current liabilities,
// running inventory turns off revenue instead of COGS — so picking the right
// choice means having used the right formula, and every `explain` names which
// mistake each wrong choice is.
//
// VERIFICATION
// ------------
// `tests/finDrills.test.ts` recomputes every `ratio-calc` answer from the JSON
// via `@core/financials/ratios`, parses the number out of each choice string,
// and asserts the keyed choice matches to the printed precision while all three
// distractors do not. No number below is hand-trusted.

import type { FinDrillDef } from '@core/types'

// ─── ratio-calc (16) ─────────────────────────────────────────────────────────

const RATIO_CALC_DRILLS: FinDrillDef[] = [
  {
    id: 'fin-rc-01',
    kind: 'ratio-calc',
    statementIds: ['halden-industrial'],
    prompt:
      'Halden Industrial reports current assets of $4,700M and current liabilities of $2,600M (cash $620M, receivables $1,750M, inventory $2,130M, total assets $9,000M). What is its current ratio?',
    choices: ['0.55', '0.91', '1.81', '3.46'],
    answerIdx: 2,
    explain:
      'Current ratio = current assets ÷ current liabilities = 4,700 ÷ 2,600 = 1.81. Halden covers its next-twelve-months bills 1.8 times over.\n\n• 0.55 is the ratio upside down (2,600 ÷ 4,700). A current ratio below 1 is a real warning sign, so getting the direction wrong reverses the conclusion entirely.\n• 0.91 is the QUICK ratio — (cash 620 + receivables 1,750) ÷ 2,600 — which drops the $2,130M of inventory. Both numbers are worth knowing; this question asked for the one that keeps inventory in.\n• 3.46 divides TOTAL assets (9,000) by current liabilities. Total assets include $2,900M of factories and $1,400M of goodwill, which cannot pay a supplier invoice in March.',
  },
  {
    id: 'fin-rc-02',
    kind: 'ratio-calc',
    statementIds: ['harborline-grocers'],
    prompt:
      'Harborline Grocers holds cash $480M, receivables $320M and inventory $2,100M against current liabilities of $3,600M (current assets total $3,050M). What is its quick ratio?',
    choices: ['0.13', '0.22', '0.85', '4.50'],
    answerIdx: 1,
    explain:
      'Quick ratio = (cash + receivables) ÷ current liabilities = (480 + 320) ÷ 3,600 = 0.22. Only 22 cents of every dollar owed within the year is already cash or near-cash.\n\nThat looks alarming and is completely normal for a grocer: shoppers pay at the till while suppliers are paid on 30–60 day terms, so the business is deliberately financed by its payables. This is why liquidity ratios are only readable against an industry.\n\n• 0.13 is the CASH ratio, 480 ÷ 3,600 — stricter still, receivables excluded too.\n• 0.85 is the CURRENT ratio, 3,050 ÷ 3,600 — inventory left in. The whole point of the quick ratio is to ask what happens if that $2,100M of groceries does not sell.\n• 4.50 is the ratio inverted, 3,600 ÷ 800.',
  },
  {
    id: 'fin-rc-03',
    kind: 'ratio-calc',
    statementIds: ['northwind-systems'],
    prompt:
      'Northwind Systems: revenue $4,200M, COGS $840M, gross profit $3,360M, operating income $1,050M, net income $808M. What is its gross margin?',
    choices: ['19.2%', '20.0%', '25.0%', '80.0%'],
    answerIdx: 3,
    explain:
      'Gross margin = gross profit ÷ revenue = 3,360 ÷ 4,200 = 80.0%. Eighty cents of every sales dollar survives the cost of delivering the product — the signature of a software business, where COGS is hosting and support rather than raw materials.\n\n• 20.0% is COGS ÷ revenue. That is the cost ratio, the exact complement of the answer (they sum to 100%), so it is the easiest slip to make and the easiest to catch.\n• 25.0% is the OPERATING margin, 1,050 ÷ 4,200 — after the $2,310M of sales, marketing and R&D. Gross margin sits above opex, operating margin below it.\n• 19.2% is the NET margin, 808 ÷ 4,200 — after interest and tax as well.',
  },
  {
    id: 'fin-rc-04',
    kind: 'ratio-calc',
    statementIds: ['skyline-air'],
    prompt:
      'Skyline Air: revenue $14,200M, gross profit $2,272M, operating income $852M, pretax income $372M, net income $279M. What is its operating margin?',
    choices: ['2.0%', '2.6%', '6.0%', '16.0%'],
    answerIdx: 2,
    explain:
      'Operating margin = operating income ÷ revenue = 852 ÷ 14,200 = 6.0%. Six cents of profit per dollar of ticket sales before interest and tax — and Skyline carries $9,100M of long-term debt against that, which is why airlines swing to losses on small revenue moves.\n\n• 16.0% is the GROSS margin, 2,272 ÷ 14,200 — before the $1,420M of selling and administrative costs.\n• 2.6% is the PRETAX margin, 372 ÷ 14,200 — after the $480M interest bill. Interest is a financing cost, not an operating one, so it sits below the operating line.\n• 2.0% is the NET margin, 279 ÷ 14,200 — after tax as well.',
  },
  {
    id: 'fin-rc-05',
    kind: 'ratio-calc',
    statementIds: ['brightway-retail'],
    prompt:
      'Brightway Retail: operating income $620M, interest expense $496M, pretax income $124M, net income $100M. What is its interest coverage ratio?',
    choices: ['0.20x', '0.25x', '0.80x', '1.25x'],
    answerIdx: 3,
    explain:
      'Interest coverage = operating income ÷ interest expense = 620 ÷ 496 = 1.25×. A full year of operating profit covers the interest bill 1.25 times — there is essentially no margin for error. A 20% dip in operating profit wipes out pretax income entirely.\n\n• 0.25× uses PRETAX income (124 ÷ 496). Pretax income is already net of interest, so this double-counts the charge — the ratio has to be built from the profit measured *before* the cost it is covering.\n• 0.20× makes the same mistake one line lower, with net income.\n• 0.80× is the ratio inverted (496 ÷ 620) — that is interest as a share of operating profit, a legitimate figure but the reciprocal of what was asked.',
  },
  {
    id: 'fin-rc-06',
    kind: 'ratio-calc',
    statementIds: ['granite-power'],
    prompt:
      'Granite Power & Light: total assets $27,000M, current liabilities $2,900M, long-term debt $14,300M, total liabilities $17,200M, equity $9,800M. What is its debt-to-equity ratio (total liabilities ÷ equity)?',
    choices: ['0.57', '0.64', '1.46', '1.76'],
    answerIdx: 3,
    explain:
      'Debt-to-equity = total liabilities ÷ equity = 17,200 ÷ 9,800 = 1.76. Creditors have put in $1.76 for every $1 of shareholder capital — heavy by general standards, ordinary for a regulated utility funding $24,100M of poles, wires and generation.\n\n• 1.46 uses LONG-TERM DEBT only (14,300 ÷ 9,800). That is a defensible alternative definition, but it ignores the $2,900M of current liabilities. Always check which definition a screen is using before comparing two companies.\n• 0.64 is debt-to-ASSETS, 17,200 ÷ 27,000. Same numerator, different question: what share of the asset base creditors funded.\n• 0.57 is the answer inverted (9,800 ÷ 17,200) — equity per dollar of liabilities.',
  },
  {
    id: 'fin-rc-07',
    kind: 'ratio-calc',
    statementIds: ['maison-rivelle'],
    prompt:
      'Maison Rivelle: revenue $11,000M, operating income $3,080M, net income $2,299M, total assets $12,500M, equity $8,800M. What is its return on equity?',
    choices: ['18.4%', '20.9%', '26.1%', '35.0%'],
    answerIdx: 2,
    explain:
      'Return on equity = net income ÷ equity = 2,299 ÷ 8,800 = 26.1%. Every dollar of shareholder capital threw off 26 cents of profit last year, and Maison did it with only $1,100M of long-term debt against $3,600M of cash — the return is earned, not borrowed.\n\n• 18.4% is return on ASSETS, 2,299 ÷ 12,500. ROA ignores who funded the assets; ROE asks what the *owners* earned. The gap between them is the leverage effect, which here is small precisely because Maison barely borrows.\n• 20.9% is the NET MARGIN, 2,299 ÷ 11,000 — profit per dollar of sales, not per dollar of capital.\n• 35.0% divides OPERATING income by equity (3,080 ÷ 8,800), skipping the $55M of interest and $726M of tax that shareholders never see.',
  },
  {
    id: 'fin-rc-08',
    kind: 'ratio-calc',
    statementIds: ['silica-micro'],
    prompt:
      'Silica Micro reports cash flow from operations of $2,010M, capital expenditure of $1,240M, stock-based compensation of $410M and net income of $1,173M. What is its free cash flow?',
    choices: ['$360M', '$770M', '$2,010M', '$3,250M'],
    answerIdx: 1,
    explain:
      'Free cash flow = CFO − capex = 2,010 − 1,240 = $770M. Fabs are expensive: Silica has to spend 62% of its operating cash just to keep and grow capacity, so only $770M of the $2,010M is genuinely free.\n\n• $2,010M is CFO on its own — the number that ignores the fact that a semiconductor company cannot skip capex and stay in business.\n• $3,250M ADDS capex instead of subtracting it (2,010 + 1,240). Capex is a cash outflow reported as a positive number in this dataset, so the sign discipline matters.\n• $360M also deducts the $410M of stock comp (2,010 − 1,240 − 410). Tempting, and stock comp *is* a real cost — but it is a non-cash charge already added back inside CFO, so subtracting it here mixes a cash measure with a dilution measure. Track dilution through the share count instead.',
  },
  {
    id: 'fin-rc-09',
    kind: 'ratio-calc',
    statementIds: ['ridgeline-homes'],
    prompt:
      'Ridgeline Homes: revenue $5,600M, COGS $4,368M, inventory $4,900M, current assets $5,900M, total assets $6,200M. What is its inventory turnover?',
    choices: ['0.70x', '0.74x', '0.89x', '1.14x'],
    answerIdx: 2,
    explain:
      'Inventory turnover = COGS ÷ inventory = 4,368 ÷ 4,900 = 0.89×. Ridgeline turns its stock less than once a year — 365 ÷ 0.89 ≈ 410 days — because "inventory" for a homebuilder is land, lots and half-finished houses, and a build cycle really does run about a year.\n\n• 1.14× uses REVENUE ÷ inventory (5,600 ÷ 4,900). This is the single most common inventory-turns error. Inventory is carried at cost, so the numerator has to be at cost too; using revenue inflates every company\'s turns by its gross margin and makes high-margin firms look efficient when they are not.\n• 0.74× and 0.70× divide COGS by current assets and by total assets. Those are asset-turnover-style ratios, not stock turns.',
  },
  {
    id: 'fin-rc-10',
    kind: 'ratio-calc',
    statementIds: ['verity-therapeutics'],
    prompt:
      'Verity Therapeutics: revenue $7,800M, operating income $1,950M, pretax income $1,740M, taxes $261M, net income $1,479M. What is its effective tax rate?',
    choices: ['3.3%', '13.4%', '15.0%', '17.6%'],
    answerIdx: 2,
    explain:
      'Effective tax rate = taxes ÷ pretax income = 261 ÷ 1,740 = 15.0%. Well below a headline statutory rate, which for a pharma company usually means profits are booked where the patents are held. Worth a footnote check: a rate that low is often the thing that reverses first.\n\n• 17.6% divides tax by NET income (261 ÷ 1,479). Net income is already after tax, so the denominator is too small and the rate comes out too high. The denominator must be the profit the tax was assessed on.\n• 13.4% uses OPERATING income (261 ÷ 1,950), which is before the $210M of interest — interest is deductible, so it belongs in the base.\n• 3.3% is tax ÷ revenue, a "tax as a share of sales" figure that says nothing about the rate.',
  },
  {
    id: 'fin-rc-11',
    kind: 'ratio-calc',
    statementIds: ['beacon-credit'],
    prompt:
      'Beacon Credit Group: total assets $26,000M, total liabilities $22,200M, equity $3,800M, goodwill $1,100M, shares outstanding 150M. What is its book value per share?',
    choices: ['$18.00', '$25.33', '$148.00', '$173.33'],
    answerIdx: 1,
    explain:
      'Book value per share = equity ÷ shares = 3,800 ÷ 150 = $25.33. For a lender this is the number that matters most: equity is the buffer that absorbs loan losses before creditors are touched, and $3,800M of it stands behind $21,000M of loan receivables.\n\n• $18.00 is TANGIBLE book value per share — (3,800 − 1,100 goodwill) ÷ 150. A useful stricter measure, and the one to reach for when goodwill is large; it just is not what was asked.\n• $173.33 divides TOTAL ASSETS by shares (26,000 ÷ 150). Assets funded by depositors and bondholders do not belong to shareholders.\n• $148.00 divides total LIABILITIES by shares — debt per share, the opposite of book value.',
  },
  {
    id: 'fin-rc-12',
    kind: 'ratio-calc',
    statementIds: ['cobalt-cloud'],
    prompt:
      'Cobalt Cloud: revenue $1,800M, gross profit $1,350M, opex $1,530M, CFO $145M, stock-based compensation $396M. What is stock-based compensation as a share of revenue?',
    choices: ['22.0%', '25.9%', '29.3%', '273.1%'],
    answerIdx: 0,
    explain:
      'SBC ÷ revenue = 396 ÷ 1,800 = 22.0%. Cobalt pays out more than a fifth of its revenue in stock. That is the single most important number on the page: the $180M operating loss is less than half the stock comp, so the "adjusted profitability" story rests entirely on treating a 22%-of-revenue cost as if it were not one.\n\n• 25.9% and 29.3% use opex (396 ÷ 1,530) and gross profit (396 ÷ 1,350) as the base. Both are real ratios, but revenue is the standard denominator precisely because it is the one figure that is not itself affected by how much stock the company issues.\n• 273.1% is SBC ÷ CFO (396 ÷ 145). It shows how completely the add-back drives operating cash flow — but as a percentage of revenue it is nonsense.',
  },
  {
    id: 'fin-rc-13',
    kind: 'ratio-calc',
    statementIds: ['harborline-grocers'],
    prompt:
      'Harborline Grocers: revenue $28,500M, current assets $3,050M, total assets $10,000M, equity $3,300M. What is its asset turnover?',
    choices: ['0.35', '2.85', '8.64', '9.34'],
    answerIdx: 1,
    explain:
      'Asset turnover = revenue ÷ total assets = 28,500 ÷ 10,000 = 2.85. Every dollar of assets generates $2.85 of sales a year — enormous, and exactly how a 1.9% net margin still produces a 16.1% return on equity. Volume, not markup.\n\n• 9.34 uses CURRENT assets only (28,500 ÷ 3,050), leaving out the $6,400M of stores and distribution centres that actually generate the sales.\n• 8.64 uses EQUITY (28,500 ÷ 3,300). That is "revenue per dollar of shareholder capital", which mixes in the financing decision; asset turnover is meant to be leverage-neutral.\n• 0.35 is the ratio inverted (10,000 ÷ 28,500) — assets per dollar of sales.',
  },
  {
    id: 'fin-rc-14',
    kind: 'ratio-calc',
    statementIds: ['skyline-air'],
    prompt:
      'Skyline Air: revenue $14,200M, COGS $11,928M, receivables $620M, inventory $480M. What is its days sales outstanding (DSO)?',
    choices: ['14.7 days', '15.9 days', '19.0 days', '28.3 days'],
    answerIdx: 1,
    explain:
      'DSO = 365 × receivables ÷ revenue = 365 × 620 ÷ 14,200 = 15.9 days. Airlines collect almost immediately — the passenger pays before flying — so the receivable balance is mostly corporate and agency accounts. A DSO this short is a structural advantage: Skyline is funded by its customers.\n\n• 19.0 days divides by COGS instead of revenue (365 × 620 ÷ 11,928). Receivables arise from SALES, so the denominator is revenue. COGS is the right base for inventory days, not receivable days.\n• 14.7 days is DAYS INVENTORY (365 ÷ (11,928 ÷ 480)) — a different working-capital leg.\n• 28.3 days adds inventory into the numerator (365 × (620 + 480) ÷ 14,200), which measures receivables and stock together rather than collection speed.',
  },
  {
    id: 'fin-rc-15',
    kind: 'ratio-calc',
    statementIds: ['northwind-systems'],
    prompt:
      'Northwind Systems: operating income $1,050M, pretax income $1,010M, net income $808M, stock-based compensation $520M, diluted shares 400M. What is its diluted EPS?',
    choices: ['$0.72', '$2.02', '$2.53', '$2.63'],
    answerIdx: 1,
    explain:
      'EPS = net income ÷ diluted shares = 808 ÷ 400 = $2.02. EPS is always built from the bottom line — the profit that actually belongs to shareholders after interest and tax.\n\n• $2.53 uses PRETAX income (1,010 ÷ 400) and $2.63 uses OPERATING income (1,050 ÷ 400). Both describe profit the company never got to keep; the $202M tax bill is not optional.\n• $0.72 subtracts stock comp from net income first ((808 − 520) ÷ 400). Reported EPS never does this — SBC is already an expense inside the $808M. Deducting it again double-counts. The place stock comp shows up is in the *share count*: the "diluted" in diluted EPS is what makes those grants visible.',
  },
  {
    id: 'fin-rc-16',
    kind: 'ratio-calc',
    statementIds: ['granite-power'],
    prompt:
      'Granite Power & Light reports cash flow from operations of $2,450M, capital expenditure of $2,900M and net income of $896M. What is its free cash flow?',
    choices: ['−$450M', '$450M', '$896M', '$2,450M'],
    answerIdx: 0,
    explain:
      'Free cash flow = CFO − capex = 2,450 − 2,900 = −$450M. Granite spent $450M more on the grid than its operations produced, and covered the gap with debt — which is why long-term debt sits at $14,300M.\n\nFor a rate-regulated utility this is the business model, not a crisis: capex is added to the rate base and earns an allowed return, so outspending CFO is how the earnings base grows. Judge it on interest coverage (2.54×) and on whether the regulator keeps approving the spend.\n\n• $450M has the sign backwards (capex − CFO). Sign discipline is the whole point here: +$450M and −$450M tell opposite stories.\n• $2,450M is CFO before capex — meaningless for a company that cannot stop building.\n• $896M is net income, which is not a cash measure at all: it is after $2,900M of capex has been *capitalised* rather than expensed, and after non-cash depreciation on assets bought years ago.',
  },
]

// ─── compare (12) ────────────────────────────────────────────────────────────

const COMPARE_DRILLS: FinDrillDef[] = [
  {
    id: 'fin-cmp-01',
    kind: 'compare',
    statementIds: ['northwind-systems', 'harborline-grocers'],
    prompt:
      'Northwind Systems earned $3,360M of gross profit on $4,200M of revenue. Harborline Grocers earned $7,125M of gross profit on $28,500M of revenue. Which has the stronger gross margin profile, and what does it buy them?',
    choices: [
      'Harborline — $7,125M of gross profit is more than double Northwind\'s, so it has more to work with.',
      'Northwind — 80% vs 25%, so far more of each sales dollar is left to fund R&D, sales and profit.',
      'They are equivalent: Harborline\'s scale exactly offsets Northwind\'s margin.',
      'Neither — gross margin cannot be compared across different industries.',
    ],
    answerIdx: 1,
    explain:
      'Northwind: 3,360 ÷ 4,200 = 80.0%. Harborline: 7,125 ÷ 28,500 = 25.0%.\n\nMargin is a rate, not an amount. Northwind keeps 80 cents per sales dollar to spend on everything else; Harborline keeps 25. That is why Northwind can pour $2,310M (55% of revenue) into opex and still post a 25% operating margin, while Harborline\'s $6,270M of store operating costs leaves only 3.0%.\n\n• Absolute gross profit is the wrong comparison — it rewards size, not economics. Harborline needs 6.8× the revenue to produce 2.1× the gross profit.\n• "Scale offsets margin" is testable and false here: operating margin is 25.0% vs 3.0%.\n• Cross-industry comparison is not forbidden, it just has to be interpreted. The right conclusion is not "Northwind is the better company" but "these are different machines": Harborline answers back on asset turnover, 2.85× vs 0.70×.',
  },
  {
    id: 'fin-cmp-02',
    kind: 'compare',
    statementIds: ['brightway-retail', 'skyline-air'],
    prompt:
      'Brightway Retail: net income $100M, CFO $22M. Skyline Air: net income $279M, CFO $1,980M. Compare CFO to net income — whose earnings are better supported by cash?',
    choices: [
      'Brightway — a smaller gap between the two figures means less distortion.',
      'Skyline — CFO is 7.10× net income vs Brightway\'s 0.22×; Brightway\'s reported profit is not arriving as cash.',
      'Neither: CFO and net income are not comparable because one is a flow and one is a stock.',
      'Skyline — but only because it is the larger company.',
    ],
    answerIdx: 1,
    explain:
      'Cash conversion = CFO ÷ net income. Skyline: 1,980 ÷ 279 = 7.10×. Brightway: 22 ÷ 100 = 0.22×.\n\nBrightway is the problem. It booked $100M of profit and collected $22M of cash — 78 cents of every reported dollar stayed on the balance sheet, and the balance sheet says where: inventory of $1,850M against COGS of $3,906M is 173 days of stock. Profit that keeps turning into unsold goods is the oldest warning sign there is.\n\nSkyline\'s 7.10× is not the same kind of good news, and the follow-up question matters: most of the gap is depreciation on $14,800M of aircraft, and once you subtract the $1,850M of capex needed to replace them, free cash flow is $130M. High cash conversion plus heavy capex is a treadmill, not a windfall.\n\n• Both are flows over the same year — that is exactly why they can be compared.\n• Size is irrelevant; the ratio is already scale-free.',
  },
  {
    id: 'fin-cmp-03',
    kind: 'compare',
    statementIds: ['ridgeline-homes', 'halden-industrial'],
    prompt:
      'Ridgeline Homes shows a current ratio of 6.56 (current assets $5,900M, current liabilities $900M). Halden Industrial shows 1.81 ($4,700M / $2,600M). Which statement about their near-term liquidity is correct?',
    choices: [
      'Ridgeline is more than three times as liquid — 6.56 vs 1.81 is decisive.',
      'Their quick ratios are almost identical (0.94 vs 0.91): Ridgeline\'s entire advantage is inventory.',
      'Halden is more liquid because a current ratio near 2.0 is the textbook ideal.',
      'Neither ratio is meaningful without the cash flow statement.',
    ],
    answerIdx: 1,
    explain:
      'Strip the inventory out and the gap disappears.\n\nRidgeline quick ratio = (cash 720 + receivables 130) ÷ 900 = 0.94.\nHalden quick ratio = (cash 620 + receivables 1,750) ÷ 2,600 = 0.91.\n\nRidgeline\'s current assets are $4,900M of inventory out of $5,900M — 83% — and that inventory is land and part-built houses turning 0.89× a year. It cannot be converted to cash in a quarter at anything like carrying value; in a downturn it is the *first* thing to be written down. Halden\'s current assets are dominated by receivables from industrial customers, which convert on roughly a 67-day cycle.\n\nThis is the central lesson of the current ratio: a big number built out of slow inventory is worth less than a small number built out of receivables. Always read the two ratios together.\n\n• "Near 2.0 is ideal" is a rule of thumb with no industry in it — grocers run below 1.0 by design and are fine.\n• The cash flow statement adds a lot (Ridgeline\'s CFO is −$180M) but the balance sheet on its own already answers the question asked.',
  },
  {
    id: 'fin-cmp-04',
    kind: 'compare',
    statementIds: ['maison-rivelle', 'silica-micro'],
    prompt:
      'Maison Rivelle: revenue $11,000M, CFO $2,650M, capex $620M. Silica Micro: revenue $6,900M, CFO $2,010M, capex $1,240M. Which converts more of its revenue into free cash flow?',
    choices: [
      'Silica — its CFO is 29% of revenue, the higher of the two.',
      'Maison — 18.5% FCF margin vs 11.2%, because it reinvests 5.6% of revenue against Silica\'s 18.0%.',
      'They are equivalent once you exclude stock-based compensation.',
      'Silica — semiconductors are structurally more cash-generative than consumer goods.',
    ],
    answerIdx: 1,
    explain:
      'FCF = CFO − capex, then divide by revenue.\n\nMaison: 2,650 − 620 = $2,030M; 2,030 ÷ 11,000 = 18.5%.\nSilica: 2,010 − 1,240 = $770M; 770 ÷ 6,900 = 11.2%.\n\nSilica does have the higher operating-cash margin (2,010 ÷ 6,900 = 29.1% vs Maison\'s 24.1%) — which is what makes the first choice tempting. Capex is what settles it: fabs demand 18.0% of revenue every year just to stay current, while a leather-goods maker spends 5.6% on boutiques. Two-thirds of Silica\'s operating cash never reaches shareholders.\n\n• Excluding SBC would widen the gap, not close it: Silica\'s stock comp is 5.9% of revenue against Maison\'s 0.9%.\n• "Structurally more cash-generative" is exactly the assumption the numbers refute. Capital intensity is a property of the business model, and it is the difference here.',
  },
  {
    id: 'fin-cmp-05',
    kind: 'compare',
    statementIds: ['beacon-credit', 'granite-power'],
    prompt:
      'Beacon Credit Group is levered 5.84× (total liabilities $22,200M / equity $3,800M); Granite Power & Light 1.76× ($17,200M / $9,800M). Whose debt load is better supported by operating profit?',
    choices: [
      'Granite — its debt-to-equity is a third of Beacon\'s, so it is plainly the safer balance sheet.',
      'Beacon — interest coverage of 3.35× vs Granite\'s 2.54×; the leverage ratios are not comparable across these two business models.',
      'Beacon — because a lender\'s liabilities are not really debt.',
      'Neither can be judged without a credit rating.',
    ],
    answerIdx: 1,
    explain:
      'Interest coverage = operating income ÷ interest expense.\nBeacon: 1,140 ÷ 340 = 3.35×.\nGranite: 1,848 ÷ 728 = 2.54×.\n\nDebt-to-equity says Beacon is three times as levered. Coverage — which asks the question that actually causes defaults, can you pay the interest — puts Beacon ahead.\n\nThe reason is that borrowing is Beacon\'s raw material. A lender funds a $21,000M loan book with debt and earns the spread; 5.8× leverage is unremarkable, and the real risks are credit losses (its $1,360M provision) and funding access, not the ratio itself. Granite\'s 1.76× is modest by any general standard, but $728M of interest against $1,848M of operating profit on a business that must keep spending $2,900M a year on the grid leaves less room than the headline ratio suggests.\n\n• "A lender\'s liabilities are not really debt" is wrong and dangerous — they are exactly debt, which is why equity of $3,800M against $26,000M of assets means a 15% loss on the loan book would wipe out shareholders.\n• Ratings are opinions built from these same numbers; you can read them yourself.',
  },
  {
    id: 'fin-cmp-06',
    kind: 'compare',
    statementIds: ['cobalt-cloud', 'northwind-systems'],
    prompt:
      'Cobalt Cloud lost $200M last year on $1,800M of revenue but generated $145M of CFO and $90M of FCF, with $396M of stock-based compensation. Northwind Systems earned $808M on $4,200M with $520M of SBC. Which reading of Cobalt is the most defensible?',
    choices: [
      'Cobalt is cash-generative, so the GAAP loss is an accounting artefact that can be ignored.',
      'Cobalt is loss-making and burning cash; the FCF figure must be a reporting error.',
      'Cobalt\'s $90M of FCF exists only because $396M of SBC is added back — a real cost paid in dilution, and more than twice its $180M operating loss.',
      'The two cannot be compared because Northwind is profitable and Cobalt is not.',
    ],
    answerIdx: 2,
    explain:
      'Cobalt: operating loss $180M, net loss $200M, CFO +$145M, capex $55M, FCF = 145 − 55 = +$90M, SBC $396M ÷ revenue $1,800M = 22.0%.\n\nThe swing from a $200M loss to $145M of operating cash is roughly the size of the $396M stock-comp add-back. SBC is genuinely non-cash — no dollars leave — but it is not free: shareholders pay it by owning a smaller slice each year. Cobalt is not "profitable on a cash basis"; it is paying a fifth of its revenue in equity and reporting the result as positive cash flow.\n\nNorthwind is the control case. Its SBC is also large in absolute terms ($520M) but 12.4% of revenue, and it earns $808M *after* that charge, with $1,240M of FCF. Same add-back mechanic, completely different underlying business.\n\nThe way to hold companies like Cobalt honest is the diluted share count over time: if shares grow 4–6% a year, that is the real cost of the "non-cash" expense.\n\n• Ignoring the loss is the error the ratio is designed to catch.\n• The FCF is not an error — it is arithmetically correct and misleading, which is worse.',
  },
  {
    id: 'fin-cmp-07',
    kind: 'compare',
    statementIds: ['northwind-systems', 'verity-therapeutics'],
    prompt:
      'Northwind Systems and Verity Therapeutics both report an 80% gross margin and a 25% operating margin. Which turns a dollar of revenue into more free cash flow, and why?',
    choices: [
      'Verity — it is the larger business ($7,800M vs $4,200M of revenue).',
      'Northwind — 29.5% FCF margin vs 23.1%, helped by lower capex (4.3% vs 5.9% of revenue).',
      'They must be identical: identical operating margins mean identical cash economics.',
      'Verity — its 15% tax rate beats Northwind\'s 20%.',
    ],
    answerIdx: 1,
    explain:
      'FCF margin = (CFO − capex) ÷ revenue.\nNorthwind: (1,420 − 180) ÷ 4,200 = 1,240 ÷ 4,200 = 29.5%.\nVerity: (2,260 − 460) ÷ 7,800 = 1,800 ÷ 7,800 = 23.1%.\n\nIdentical margins down to the operating line, different cash outcomes below it. Two things separate them: Verity spends 5.9% of revenue on capex against Northwind\'s 4.3% (labs and manufacturing versus servers), and Verity carries $210M of interest against Northwind\'s $40M.\n\nThe general lesson: the income statement stops at accrual profit. Two companies can look identical through operating margin and still differ by six points of cash margin once working capital, capex and financing are counted. That is the case for reading all three statements rather than one.\n\n• Verity\'s lower 15.0% tax rate is real (261 ÷ 1,740) and does help net margin — 19.0% vs 19.2%, so it roughly offsets the interest — but taxes are not what decides FCF here.\n• Size does not enter a margin comparison at all.',
  },
  {
    id: 'fin-cmp-08',
    kind: 'compare',
    statementIds: ['harborline-grocers', 'brightway-retail'],
    prompt:
      'Harborline Grocers: COGS $21,375M, inventory $2,100M. Brightway Retail: COGS $3,906M, inventory $1,850M. What does the comparison say about Brightway?',
    choices: [
      'Brightway is more efficient — it holds less inventory in absolute dollars.',
      'Brightway turns stock 2.11× a year (173 days) against Harborline\'s 10.18× (36 days); its shelves are moving far too slowly for a retailer.',
      'The comparison is invalid because groceries are perishable and general merchandise is not.',
      'Both are normal: any turnover above 2× is healthy in retail.',
    ],
    answerIdx: 1,
    explain:
      'Inventory turnover = COGS ÷ inventory; days = 365 ÷ turnover.\nHarborline: 21,375 ÷ 2,100 = 10.18× → 35.9 days.\nBrightway: 3,906 ÷ 1,850 = 2.11× → 172.9 days.\n\nBrightway holds nearly six months of merchandise. Perishability explains part of the gap — a grocer *must* turn fast — but not a factor of five. The comparison that should worry you is against Brightway\'s own P&L: $1,850M of stock supports only $6,200M of revenue (29.8%), and the cash statement confirms it, with CFO of $22M against $100M of net income. Slow inventory and weak cash conversion are the same fact seen from two statements.\n\nIf that stock has to be cleared at a discount, the gross margin of 37.0% goes with it, and with interest coverage at 1.25× there is nothing to absorb the hit.\n\n• Absolute inventory dollars mean nothing without the sales they support — that is what the ratio is for.\n• "Above 2× is healthy" is invented; general merchandise retailers typically run 4–6×.\n• Perishability is a reason to *expect* a gap, not a reason to stop comparing.',
  },
  {
    id: 'fin-cmp-09',
    kind: 'compare',
    statementIds: ['skyline-air', 'granite-power'],
    prompt:
      'Skyline Air: revenue $14,200M, CFO $1,980M, capex $1,850M. Granite Power & Light: revenue $8,400M, CFO $2,450M, capex $2,900M. Which carries the heavier capital burden relative to its sales, and what is the consequence?',
    choices: [
      'Skyline — its $14,800M of PP&E is the larger asset base in absolute terms.',
      'Granite — capex is 34.5% of revenue vs Skyline\'s 13.0%, and it outspends CFO, leaving FCF at −$450M against Skyline\'s +$130M.',
      'Neither: both are capital-intensive, so the comparison adds nothing.',
      'Skyline — 93% of its CFO goes to capex, the highest possible burden.',
    ],
    answerIdx: 1,
    explain:
      'Capex ÷ revenue: Granite 2,900 ÷ 8,400 = 34.5%; Skyline 1,850 ÷ 14,200 = 13.0%.\nCapex ÷ CFO: Granite 2,900 ÷ 2,450 = 118%; Skyline 1,850 ÷ 1,980 = 93%.\nFCF: Granite −$450M; Skyline +$130M.\n\nGranite spends more than a third of every revenue dollar on the grid and more than it earns from operations, so growth is debt-funded — hence $14,300M of long-term debt and 2.54× interest coverage. Skyline is almost as bad on the CFO measure (the fourth choice quotes a real number, 93%) but revenue is what capex must ultimately be justified against, and on that basis Skyline is less than half as intensive.\n\nThe distinction that matters: Granite\'s spending earns a regulated return on the rate base, so it is a growth investment with a contracted payoff. Skyline\'s aircraft spending is largely replacement — it buys survival, not growth. Neither is free.\n\n• Absolute PP&E ignores the revenue each asset base supports; Granite\'s $24,100M produces $8,400M of sales, Skyline\'s $14,800M produces $14,200M.',
  },
  {
    id: 'fin-cmp-10',
    kind: 'compare',
    statementIds: ['maison-rivelle', 'halden-industrial'],
    prompt:
      'Maison Rivelle: cash $3,600M, long-term debt $1,100M, operating income $3,080M, interest $55M. Halden Industrial: cash $620M, long-term debt $2,800M, operating income $1,152M, interest $192M. Which has more room to absorb a bad year?',
    choices: [
      'Halden — its 1.81 current ratio beats Maison\'s 2.96 on the measure that matters for solvency.',
      'Maison — net cash of $2,500M, debt-to-equity of 0.42 and 56.0× interest coverage, against Halden\'s $2,180M of net debt, 1.50 and 6.0×.',
      'They are similar: both cover interest comfortably, so leverage is not a differentiator.',
      'Halden — lower absolute cash means lower carrying costs.',
    ],
    answerIdx: 1,
    explain:
      'Maison: net debt = 1,100 − 3,600 = −$2,500M (net cash). D/E = 3,700 ÷ 8,800 = 0.42. Coverage = 3,080 ÷ 55 = 56.0×.\nHalden: net debt = 2,800 − 620 = $2,180M. D/E = 5,400 ÷ 3,600 = 1.50. Coverage = 1,152 ÷ 192 = 6.0×.\n\nMaison could lose 98% of its operating profit and still pay its interest, and it holds more cash than debt. Halden is not in danger — 6× coverage is a comfortable number — but a cyclical downturn that halves operating profit takes it to 3×, which is where covenants start to bite and capex gets cut. That difference in the tail is what "room to absorb a bad year" means.\n\n• Maison\'s current ratio is the higher one (2.96 vs 1.81); the first choice inverts the comparison as well as the relevance — current ratio is a liquidity measure, not a solvency one.\n• "Both cover interest comfortably" is true and still misses the point: the question is what survives a shock, and 56× versus 6× is an order of magnitude.\n• Cash has a carrying cost only if it earns nothing; as insurance in a cyclical business it is cheap.',
  },
  {
    id: 'fin-cmp-11',
    kind: 'compare',
    statementIds: ['beacon-credit', 'harborline-grocers'],
    prompt:
      'Beacon Credit Group returns 15.8% on equity; Harborline Grocers returns 16.1%. Their returns on assets are 2.3% and 5.3%. What explains two near-identical ROEs?',
    choices: [
      'Coincidence — ROE and ROA are unrelated measures.',
      'Beacon earns far less per dollar of assets but runs 6.84× asset-to-equity leverage against Harborline\'s 3.03×, which closes the gap.',
      'Beacon\'s higher net margin (17.6% vs 1.9%) is what equalises the two.',
      'Harborline\'s inventory is understated, which flatters its ROA.',
    ],
    answerIdx: 1,
    explain:
      'ROE decomposes (DuPont) into net margin × asset turnover × equity multiplier:\n\nBeacon: 17.6% × 0.13 × 6.84 = 15.8%   (600/3,400 × 3,400/26,000 × 26,000/3,800)\nHarborline: 1.9% × 2.85 × 3.03 = 16.1%   (532/28,500 × 28,500/10,000 × 10,000/3,300)\n\nThe same destination by opposite roads. Beacon earns a fat margin on a slow, enormous balance sheet and multiplies a 2.3% return on assets with leverage. Harborline earns almost nothing per sale but turns its assets 2.85× a year and borrows far less.\n\nThe practical consequence is risk, which ROE hides: leverage magnifies losses as faithfully as gains. A 3% loss on Beacon\'s $21,000M loan book is $630M — more than a year\'s profit and a sixth of its equity. Harborline has no equivalent exposure. Two companies with the same ROE can have entirely different distributions of outcomes, which is why ROE is never read on its own.\n\n• Beacon\'s net margin is indeed higher, but on its own it would make Beacon\'s ROE much higher; asset turnover of 0.13× is what pulls it back.\n• Nothing in the data suggests misstated inventory — and inventory understatement would *raise* ROA, not lower it.',
  },
  {
    id: 'fin-cmp-12',
    kind: 'compare',
    statementIds: ['cobalt-cloud', 'silica-micro'],
    prompt:
      'Cobalt Cloud: revenue $1,800M, SBC $396M, operating income −$180M. Silica Micro: revenue $6,900M, SBC $410M, operating income $1,518M. The two pay almost the same dollar amount of stock comp. Whose reported results depend on it more?',
    choices: [
      'Silica — $410M is the larger absolute charge.',
      'Cobalt — SBC is 22.0% of revenue and 2.2× its entire operating loss; Silica\'s is 5.9% of revenue and its $1,518M operating profit stands without any adjustment.',
      'Neither — SBC is non-cash, so it does not affect reported results in either case.',
      'They depend on it equally, since the dollar amounts are within 4% of each other.',
    ],
    answerIdx: 1,
    explain:
      'SBC ÷ revenue: Cobalt 396 ÷ 1,800 = 22.0%; Silica 410 ÷ 6,900 = 5.9%.\nSBC ÷ |operating income|: Cobalt 396 ÷ 180 = 2.20×; Silica 410 ÷ 1,518 = 0.27×.\n\nNearly the same dollar charge, entirely different significance. Add Cobalt\'s stock comp back and a $180M operating loss becomes a $216M profit — the whole result turns on one line. Do the same for Silica and $1,518M becomes $1,928M: better, but the company was profitable either way.\n\nThis is why "adjusted" or "non-GAAP" figures deserve the most scepticism exactly where they change the sign. The test to apply is not whether SBC is non-cash — it is — but whether the reported profitability survives counting it.\n\n• Absolute dollars are meaningless across a 3.8× revenue difference.\n• "Non-cash so it does not affect results" is the error itself: SBC is an expense on both income statements, and its cost is borne through dilution.',
  },
]

// ─── red-flag (8) ────────────────────────────────────────────────────────────
//
// Five drills work Brightway Retail, the company built to fail. The other three
// are the necessary counterweight: negative free cash flow, negative operating
// cash flow and unusually high cash conversion all *look* like flags and, at a
// utility, a homebuilder and an airline, are the business model working
// normally. A learner who flags everything is no more useful than one who flags
// nothing.

const RED_FLAG_DRILLS: FinDrillDef[] = [
  {
    id: 'fin-rf-01',
    kind: 'red-flag',
    statementIds: ['brightway-retail'],
    prompt:
      'Brightway Retail reports net income of $100M, cash flow from operations of $22M, revenue of $6,200M and a 37.0% gross margin. Which line most warrants investigation?',
    choices: [
      'The 37.0% gross margin — too high for a retailer.',
      'CFO of $22M against $100M of net income: only 22% of reported profit arrived as cash.',
      'Revenue of $6,200M — too small to be meaningful.',
      'Net income of $100M — a positive result needs no scrutiny.',
    ],
    answerIdx: 1,
    explain:
      'Cash conversion = CFO ÷ net income = 22 ÷ 100 = 0.22×.\n\nOver a full year, a healthy company\'s CFO usually exceeds net income, because depreciation is added back. Brightway is at a fifth of it. Reported profit that does not become cash has to be sitting somewhere on the balance sheet, and here it is visible: inventory of $1,850M against COGS of $3,906M is 173 days of stock, against roughly 36 days at a grocer.\n\nSo the earnings are real in an accounting sense and unconverted in an economic one — goods bought and shelved, with the margin recognised on the way in.\n\n• 37.0% gross margin is unremarkable for general merchandise (and *lower* than a specialty retailer would post).\n• $6,200M of revenue is ample scale; size is not a flag.\n• "Positive result needs no scrutiny" is precisely the reflex that misses this pattern — the income statement is the one statement that can be managed most easily, which is why the cash flow statement is read against it.',
  },
  {
    id: 'fin-rf-02',
    kind: 'red-flag',
    statementIds: ['brightway-retail'],
    prompt:
      'Brightway Retail: revenue $6,200M, COGS $3,906M, inventory $1,850M, cash $95M. What does the inventory position tell you?',
    choices: [
      'Inventory turns 2.11× a year — 173 days of stock, roughly five times slower than a grocer and far outside retail norms.',
      'Inventory of $1,850M is prudent stockpiling ahead of a demand recovery.',
      'Inventory turns 3.35× a year, which is acceptable for general merchandise.',
      'Nothing — inventory is a balance sheet item and says nothing about performance.',
    ],
    answerIdx: 0,
    explain:
      'Inventory turnover = COGS ÷ inventory = 3,906 ÷ 1,850 = 2.11×, i.e. 365 ÷ 2.11 = 172.9 days on the shelf. General merchandise retailers typically run 4–6×; a grocer runs 10×+.\n\nTwo consequences follow, and they compound. Cash: with only $95M in the bank and $1,850M tied up in stock, Brightway has no flexibility — which is why CFO is $22M. Valuation: inventory is carried at cost, so if it has to be cleared at a discount the write-down comes straight out of the $950M of equity, and equity is already less than the $2,350M of goodwill.\n\n• 3.35× is COGS replaced by revenue in the numerator (6,200 ÷ 1,850) — the standard inventory-turns error, and it makes the position look 59% healthier than it is. Inventory is carried at cost, so the numerator must be at cost.\n• "Prudent stockpiling" is the story management tells; the test is whether the stock is selling, and 173 days says it is not.\n• Inventory is a balance sheet item that determines future gross margin and current cash — it is one of the most performance-relevant lines there is.',
  },
  {
    id: 'fin-rf-03',
    kind: 'red-flag',
    statementIds: ['brightway-retail'],
    prompt:
      'Brightway Retail\'s balance sheet: total assets $5,800M, goodwill $2,350M, equity $950M, total liabilities $4,850M. What should you conclude?',
    choices: [
      'Goodwill of $2,350M is an asset like any other and adds to the safety cushion.',
      'Equity of $950M is comfortable at 16% of assets.',
      'Goodwill is 40.5% of assets and exceeds equity, so tangible book value is −$1,400M: one impairment and the equity is gone.',
      'Total liabilities of $4,850M are fine because most are long-term.',
    ],
    answerIdx: 2,
    explain:
      'Tangible book value = equity − goodwill = 950 − 2,350 = −$1,400M. Goodwill ÷ total assets = 2,350 ÷ 5,800 = 40.5%.\n\nGoodwill is the premium paid over the fair value of what was bought in past acquisitions. It generates no cash by itself, cannot be sold separately, and is tested for impairment — and impairments arrive exactly when the acquired business underperforms, which is the same moment everything else is going wrong. Write off even 40% of this goodwill and Brightway\'s equity is negative.\n\nRead it with the rest of the file: 2.11× inventory turns, 0.22× cash conversion, 1.25× interest coverage. A company that acquired its way to $6,200M of revenue, cannot convert profit to cash, and has no tangible cushion left is one bad quarter from a covenant conversation.\n\n• "An asset like any other" is the mistake the tangible-book adjustment exists to prevent — creditors lend against assets that can be sold.\n• 16% equity-to-assets is thin on its own, and worse once you notice the equity is entirely acquisition premium.\n• The debt is $3,400M long-term and $1,450M current, but maturity does not matter much when interest coverage is 1.25×.',
  },
  {
    id: 'fin-rf-04',
    kind: 'red-flag',
    statementIds: ['brightway-retail'],
    prompt:
      'Brightway Retail: operating income $620M, interest expense $496M, pretax income $124M, long-term debt $3,400M, CFO $22M. How much room does the interest bill leave?',
    choices: [
      'Comfortable — the company is still profitable at every line of the income statement.',
      'Coverage is 1.25×: a 20% fall in operating profit erases pretax income, and CFO of $22M does not cover the $496M of interest at all.',
      'Coverage is 5.0×, the usual investment-grade threshold.',
      'Irrelevant — interest is a fixed cost that does not vary with performance.',
    ],
    answerIdx: 1,
    explain:
      'Interest coverage = operating income ÷ interest = 620 ÷ 496 = 1.25×. Operating profit would have to fall only 20% — from $620M to $496M — for pretax income to reach zero.\n\nThe cash view is worse than the accrual view. Interest is paid in cash, and CFO for the year was $22M against a $496M interest bill; the difference came from the balance sheet, not from operations. That is not sustainable across two consecutive years.\n\nAnd interest is precisely the cost you cannot cut in the year you need to. The fourth choice has the fact right — interest is fixed — and draws the opposite conclusion from it: being fixed is what makes it dangerous when revenue moves.\n\n• Being profitable at every line is true and thin. The margin of safety, not the sign, is what coverage measures.\n• 5.0× is a common comfort threshold, and Brightway is at a quarter of it — quoting the benchmark instead of computing the ratio is the trap.',
  },
  {
    id: 'fin-rf-05',
    kind: 'red-flag',
    statementIds: ['brightway-retail'],
    prompt:
      'Taking Brightway Retail\'s three statements together — net income $100M on $6,200M of revenue, CFO $22M, FCF −$118M, inventory $1,850M, goodwill $2,350M, equity $950M, interest coverage 1.25× — which single conclusion is best supported?',
    choices: [
      'It is a cheap turnaround: profitable, and the balance sheet issues are non-cash.',
      'The accounts are fraudulent.',
      'Profit is not converting to cash, the cash is trapped in slow inventory, and there is no tangible equity or interest cover left to absorb a shock.',
      'The main concern is the 1.6% net margin, which is below the retail average.',
    ],
    answerIdx: 2,
    explain:
      'The individual ratios: cash conversion 0.22×, FCF −$118M, inventory turns 2.11× (173 days), tangible book −$1,400M, interest coverage 1.25×, debt-to-equity 5.11×.\n\nEach is worrying on its own; together they are one story rather than five. Profit is booked but stays in inventory, so operating cash is $22M; capex of $140M then makes free cash flow negative, so the shortfall is funded from a $95M cash balance or from the $3,400M of debt that already consumes $496M a year in interest; and there is no tangible equity underneath any of it. Every escape route is the same route.\n\nWhat a careful analyst does next is name the falsifiable question: are those 173 days of inventory saleable at carrying value? If yes, this is a working-capital problem with a fix. If no, the write-down passes straight through a $950M equity account that is already $1,400M short of tangible.\n\n• "Non-cash issues" inverts the finding — the cash flow statement is where the problem is loudest.\n• Fraud is not supported. Nothing here is inconsistent; the statements are internally coherent and describe a business under strain, which is a different claim and the only one the evidence carries.\n• A 1.6% net margin is genuinely weak, but it is a symptom. Margin can be fixed with a good season; negative tangible equity and 1.25× coverage cannot.',
  },
  {
    id: 'fin-rf-06',
    kind: 'red-flag',
    statementIds: ['granite-power'],
    prompt:
      'Granite Power & Light: CFO $2,450M, capex $2,900M, free cash flow −$450M, long-term debt $14,300M, net income $896M, operating income $1,848M, interest $728M. Is the negative free cash flow the red flag here?',
    choices: [
      'Yes — negative FCF always means a company is destroying value.',
      'Yes — it proves capex is being used to disguise weak operations.',
      'No — a regulated utility funds rate-base growth with debt by design; the line to watch is interest coverage at 2.54×.',
      'No — free cash flow is not a meaningful measure for any capital-intensive business.',
    ],
    answerIdx: 2,
    explain:
      'FCF = 2,450 − 2,900 = −$450M. Capex ÷ revenue = 2,900 ÷ 8,400 = 34.5%. Interest coverage = 1,848 ÷ 728 = 2.54×.\n\nA rate-regulated utility earns an allowed return on its rate base, so capital spending is how earnings grow: the $2,900M goes into $24,100M of PP&E, the regulator permits a return on it, and the gap is funded with debt — which is why long-term debt is $14,300M. Persistent negative FCF here is the model operating as designed, and utilities have run this way for a century.\n\nWhat you actually monitor is whether the funding stays affordable. 2.54× coverage is adequate and not generous; if rates rise faster than the regulator allows recovery, or if a large project is disallowed, that number moves first. Also worth watching: debt growing faster than the rate base, and any deterioration in the regulatory relationship.\n\n• "Negative FCF always destroys value" would condemn every utility, railroad and growing retailer. The question is always what the cash bought.\n• "Disguising weak operations" needs evidence: a 22.0% operating margin and 2.73× cash conversion show the reverse.\n• FCF stays meaningful for capital-intensive firms — it is what tells you the growth is debt-funded.',
  },
  {
    id: 'fin-rf-07',
    kind: 'red-flag',
    statementIds: ['ridgeline-homes'],
    prompt:
      'Ridgeline Homes reports net income of $399M but CFO of −$180M, with inventory of $4,900M (79% of total assets) against COGS of $4,368M. Cash conversion is −0.45×, worse than Brightway Retail\'s 0.22×. What is the right read?',
    choices: [
      'It is the same red flag as Brightway, only more severe — the ratio is lower.',
      'Cash is going into land and homes under construction at a normal 0.89× turn (≈410 days, about one build cycle); it is a flag only if the homes stop selling.',
      'The negative CFO is an accounting error, since a profitable company cannot have negative operating cash flow.',
      'Inventory at 79% of assets is impossible for a legitimate company.',
    ],
    answerIdx: 1,
    explain:
      'Inventory turnover = 4,368 ÷ 4,900 = 0.89× → 365 ÷ 0.89 ≈ 410 days. Cash conversion = −180 ÷ 399 = −0.45×.\n\nA homebuilder buys land, holds it, builds on it and sells about a year later. Inventory *is* the business, and a builder that grows must put more cash into the pipeline than it takes out — so negative operating cash flow alongside positive profit is the normal signature of expansion. Balance-sheet support: only $1,700M of long-term debt against $3,600M of equity (D/E 0.72) and 7.33× interest coverage, so the build is being funded conservatively.\n\nThe contrast with Brightway is the entire point. The ratios point the same way; the causes do not. Brightway\'s stock turns five times slower than its own sector and its equity is negative on a tangible basis; Ridgeline\'s turns match its build cycle and its balance sheet is unlevered. Same symptom, different diagnosis — which is why an industry benchmark has to come before a verdict.\n\nWhat would turn this into a real flag: inventory growing while closings fall, turns dropping below the build cycle, or debt rising to fund the pipeline.\n\n• Profitable companies routinely report negative CFO while investing in working capital; it is not an error.\n• Inventory-dominated balance sheets are the norm for builders and distributors.',
  },
  {
    id: 'fin-rf-08',
    kind: 'red-flag',
    statementIds: ['skyline-air'],
    prompt:
      'Skyline Air converts net income of $279M into CFO of $1,980M — a cash conversion of 7.10×, the best of any company in this set. Is that the quality signal it appears to be?',
    choices: [
      'Yes — CFO seven times net income is the strongest possible evidence of earnings quality.',
      'Yes — it shows profits are understated by conservative accounting.',
      'No — most of the gap is depreciation on $14,800M of aircraft, and after $1,850M of capex free cash flow is only $130M.',
      'No — cash conversion above 1.0× always indicates manipulation.',
    ],
    answerIdx: 2,
    explain:
      'Cash conversion = 1,980 ÷ 279 = 7.10×. But FCF = 1,980 − 1,850 = $130M, which is 0.9% of the $14,200M of revenue and 0.47× net income.\n\nThe gap between profit and operating cash is mostly depreciation added back — a non-cash charge on $14,800M of aircraft. Depreciation is added back because no cash left this year; it is *not* added back because the expense was imaginary. Aircraft wear out and get replaced, and the replacement shows up one statement lower, as $1,850M of capex.\n\nSo a high cash conversion ratio in a capital-intensive business mostly measures how much depreciation the company has, not how good its earnings are. Read it with capex or not at all — which is exactly why free cash flow exists.\n\nThe useful comparison runs the other way too: Brightway Retail\'s 0.22× is a genuine warning because it has little depreciation to explain it, so the shortfall must be working capital.\n\n• "Understated by conservative accounting" is the opposite reading: the depreciation charge is a real economic cost being recognised on schedule.\n• Above 1.0× is normal and healthy for most companies; it becomes uninformative, not sinister, when depreciation is large.',
  },
]

// ─── Registry ────────────────────────────────────────────────────────────────

/** All read-the-financials drills: 16 ratio-calc + 12 compare + 8 red-flag. */
export const FIN_DRILLS: FinDrillDef[] = [
  ...RATIO_CALC_DRILLS,
  ...COMPARE_DRILLS,
  ...RED_FLAG_DRILLS,
]

const BY_ID = new Map(FIN_DRILLS.map((d) => [d.id, d]))

/** Look up one drill by id, or `undefined` if the id is unknown. */
export function finDrillById(id: string): FinDrillDef | undefined {
  return BY_ID.get(id)
}

/** Display names for the drill-kind chip in the player and the stats screen. */
export const FIN_DRILL_KIND_LABELS: Record<FinDrillDef['kind'], string> = {
  'ratio-calc': 'Ratio Calculation',
  compare: 'Head to Head',
  'red-flag': 'Spot the Red Flag',
}
