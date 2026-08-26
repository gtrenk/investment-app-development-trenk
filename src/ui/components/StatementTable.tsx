// ─── Financial statements on a phone ─────────────────────────────────────────
// A 10-K page is 8.5 inches wide and this screen is 390 CSS pixels, so the table
// cannot simply be shrunk — it has to be rebuilt for the shape of the device.
// The rules this component follows:
//
// 1. **Never scroll sideways.** A statement read by swiping left and right is a
//    statement nobody reads. The label column flexes and the number columns are
//    fixed, so the widest figure in the set (`27,000`) fits at every width.
// 2. **Numbers right-aligned and `tabular-nums`.** Digits have to line up in a
//    column for the eye to compare magnitudes — that is the entire reason a
//    statement is a table and not a paragraph.
// 3. **Deductions in parentheses, indented.** `(840)` under `4,200` shows the
//    arithmetic of the statement without a single word of explanation, and the
//    subtotal rules underneath say where each subtraction lands.
// 4. **One unit statement, once.** Everything is $ millions except per-share
//    figures, said at the top and never repeated per row.
//
// Two-company compare stacks the same rows into a shared label column with one
// number column per company. Side by side beats one-below-the-other here: the
// question is always "which of these two is bigger", and that comparison must be
// a glance, not a scroll.

import type { FinStatementSnapshot } from '@core/types'

// ─── Number formatting ───────────────────────────────────────────────────────

/** `4200` → `4,200`; `-450` → `(450)`. Millions of dollars, no decimals. */
export function finMoney(x: number): string {
  if (!Number.isFinite(x)) return '—'
  const body = Math.abs(Math.round(x)).toLocaleString('en-US')
  return x < 0 ? `(${body})` : body
}

/** A deducted line is shown as `(840)` even though it is stored positive. */
function deducted(x: number): string {
  return finMoney(-Math.abs(x))
}

/** `2.02` → `$2.02` — per-share figures keep their dollar sign and decimals. */
function perShare(x: number): string {
  if (!Number.isFinite(x)) return '—'
  return `$${x.toFixed(2)}`
}

// ─── Row model ───────────────────────────────────────────────────────────────

type RowStyle = 'normal' | 'deduct' | 'subtotal' | 'total'

interface StatementRow {
  label: string
  /** One rendered string per company, in the order the companies were given. */
  values: string[]
  style: RowStyle
}

export type StatementSectionId = 'income' | 'balance' | 'cash'

interface StatementSection {
  id: StatementSectionId
  title: string
  rows: StatementRow[]
}

/** Build one row across every company from a per-company accessor. */
function row(
  label: string,
  style: RowStyle,
  companies: readonly FinStatementSnapshot[],
  read: (s: FinStatementSnapshot) => string,
): StatementRow {
  return { label, style, values: companies.map(read) }
}

/**
 * The line items, in statement order.
 *
 * This is a deliberately *simplified* set: the lines a learner reasons about,
 * with SG&A and R&D collapsed into one operating-expense line and every acquired
 * intangible in goodwill. See the `FinStatementSnapshot` docs — these are
 * teaching instruments, not filings.
 */
export function statementSections(
  companies: readonly FinStatementSnapshot[],
): StatementSection[] {
  return [
    {
      id: 'income',
      title: 'Income statement',
      rows: [
        row('Revenue', 'normal', companies, (s) => finMoney(s.incomeStatement.revenue)),
        row('Cost of revenue', 'deduct', companies, (s) => deducted(s.incomeStatement.cogs)),
        row('Gross profit', 'subtotal', companies, (s) => finMoney(s.incomeStatement.grossProfit)),
        row('Operating expenses', 'deduct', companies, (s) => deducted(s.incomeStatement.opex)),
        row('Operating income', 'subtotal', companies, (s) =>
          finMoney(s.incomeStatement.operatingIncome),
        ),
        row('Interest expense', 'deduct', companies, (s) =>
          deducted(s.incomeStatement.interestExpense),
        ),
        row('Pretax income', 'subtotal', companies, (s) => finMoney(s.incomeStatement.pretaxIncome)),
        row('Taxes', 'deduct', companies, (s) => deducted(s.incomeStatement.taxes)),
        row('Net income', 'total', companies, (s) => finMoney(s.incomeStatement.netIncome)),
        row('Diluted shares', 'normal', companies, (s) => finMoney(s.incomeStatement.shares)),
        row('EPS', 'normal', companies, (s) => perShare(s.incomeStatement.eps)),
      ],
    },
    {
      id: 'balance',
      title: 'Balance sheet',
      rows: [
        row('Cash', 'normal', companies, (s) => finMoney(s.balanceSheet.cash)),
        row('Receivables', 'normal', companies, (s) => finMoney(s.balanceSheet.receivables)),
        row('Inventory', 'normal', companies, (s) => finMoney(s.balanceSheet.inventory)),
        row('Current assets', 'subtotal', companies, (s) => finMoney(s.balanceSheet.currentAssets)),
        row('PP&E', 'normal', companies, (s) => finMoney(s.balanceSheet.ppe)),
        row('Goodwill', 'normal', companies, (s) => finMoney(s.balanceSheet.goodwill)),
        row('Total assets', 'total', companies, (s) => finMoney(s.balanceSheet.totalAssets)),
        row('Current liabilities', 'normal', companies, (s) =>
          finMoney(s.balanceSheet.currentLiabilities),
        ),
        row('Long-term debt', 'normal', companies, (s) => finMoney(s.balanceSheet.longTermDebt)),
        row('Total liabilities', 'subtotal', companies, (s) =>
          finMoney(s.balanceSheet.totalLiabilities),
        ),
        row('Shareholders’ equity', 'total', companies, (s) => finMoney(s.balanceSheet.equity)),
      ],
    },
    {
      id: 'cash',
      title: 'Cash flow',
      rows: [
        row('Cash from operations', 'normal', companies, (s) => finMoney(s.cashFlow.cfo)),
        row('Capital expenditure', 'deduct', companies, (s) => deducted(s.cashFlow.capex)),
        row('Free cash flow', 'total', companies, (s) => finMoney(s.cashFlow.fcf)),
        row('Stock-based comp', 'normal', companies, (s) => finMoney(s.cashFlow.sbc)),
      ],
    },
  ]
}

// ─── Presentation ────────────────────────────────────────────────────────────

/** Column accent per company — the same two colours the header legend uses. */
const ACCENTS = ['text-emerald-300', 'text-sky-300'] as const
const DOTS = ['bg-emerald-400', 'bg-sky-400'] as const

const LABEL_CLS: Record<RowStyle, string> = {
  normal: 'text-slate-400',
  deduct: 'pl-3 text-slate-500',
  subtotal: 'font-semibold text-slate-300',
  total: 'font-bold text-slate-100',
}

const VALUE_CLS: Record<RowStyle, string> = {
  normal: 'text-slate-200',
  deduct: 'text-slate-400',
  subtotal: 'font-semibold text-slate-100',
  total: 'font-extrabold text-white',
}

/** The short form of a company name — the first word fits a column header. */
export function shortName(company: string): string {
  return company.split(/\s+/)[0]
}

/**
 * Column headers for a two-company compare.
 *
 * Normally the companies differ and their names are what distinguish the
 * columns. When the same company appears twice it is one business across two
 * fiscal years — a case study reading a trend — and repeating the name in both
 * headers labels nothing. The period is then the distinguishing fact.
 */
export function columnLabels(companies: readonly FinStatementSnapshot[]): string[] {
  const names = companies.map((c) => shortName(c.company))
  return new Set(names).size === companies.length ? names : companies.map((c) => c.period)
}

function Section({
  section,
  companies,
  compare,
}: {
  section: StatementSection
  companies: readonly FinStatementSnapshot[]
  compare: boolean
}) {
  return (
    <div data-testid="statement-section" data-section={section.id}>
      <div className="flex items-baseline gap-2 border-b border-slate-800 px-3 pb-1.5 pt-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">
          {section.title}
        </h3>
        {compare && (
          <div className="ml-auto flex shrink-0 gap-2">
            {columnLabels(companies).map((label, i) => (
              <span
                key={companies[i].id}
                className={`w-[74px] text-right text-[10px] font-bold uppercase tracking-wide ${ACCENTS[i] ?? 'text-slate-300'}`}
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
      <dl>
        {section.rows.map((r) => (
          <div
            key={r.label}
            data-testid="statement-row"
            data-label={r.label}
            className={`flex items-baseline gap-2 px-3 py-[5px] ${
              r.style === 'subtotal' || r.style === 'total'
                ? 'border-t border-slate-800/80'
                : ''
            }`}
          >
            <dt className={`min-w-0 flex-1 truncate text-[12.5px] ${LABEL_CLS[r.style]}`}>
              {r.label}
            </dt>
            {r.values.map((v, i) => (
              <dd
                key={i}
                data-company={i}
                className={`w-[74px] shrink-0 text-right text-[13px] tabular-nums ${VALUE_CLS[r.style]}`}
              >
                {v}
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </div>
  )
}

/**
 * One or two company statements as a single readable card.
 *
 * Pass one snapshot for a `ratio-calc` / `red-flag` drill, two for a `compare`.
 * Three or more is not supported on purpose: a third 74px column would push the
 * label column below legibility at 390px.
 */
export function StatementTable({ companies }: { companies: readonly FinStatementSnapshot[] }) {
  if (companies.length === 0) return null
  const compare = companies.length > 1
  const sections = statementSections(companies)

  return (
    <section
      data-testid="statement-table"
      data-companies={companies.length}
      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70"
    >
      {/* ── Who we are looking at ── */}
      <header className="border-b border-slate-800 bg-slate-900 px-3 py-2.5">
        {compare ? (
          <ul className="space-y-1">
            {companies.map((c, i) => (
              <li key={c.id} className="flex items-center gap-2" data-testid="statement-company">
                <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${DOTS[i] ?? 'bg-slate-500'}`} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-white">
                  {c.company}
                </span>
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-500">
                  {c.sector} · {c.period}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-baseline justify-between gap-2" data-testid="statement-company">
            <h2 className="min-w-0 truncate text-[15px] font-extrabold tracking-tight text-white">
              {companies[0].company}
            </h2>
            <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-500">
              {companies[0].sector} · {companies[0].period}
            </span>
          </div>
        )}
        <p className="mt-1 text-[10px] text-slate-600">
          $ millions, except shares (millions) and EPS
        </p>
      </header>

      {sections.map((s) => (
        <Section key={s.id} section={s} companies={companies} compare={compare} />
      ))}
    </section>
  )
}
