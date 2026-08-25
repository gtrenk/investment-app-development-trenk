import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { XP_JOURNAL_NOTE } from '../src/core/gamification/xp'
import { STARTING_CASH } from '../src/core/portfolio/engine'

// Quotes in this environment always come from the bundled provider: stooq.com is
// unreachable and `vite preview` does not proxy `/api/stooq`, so the live leg
// fails and the fallback fills every order at the last bar of
// `public/data/ohlcv/{SYMBOL}.json`. That makes every number below exact.
const AAPL_CLOSE = 215.99
const LAST_BAR_DATE = '2026-08-21'

/**
 * Day one is set *before* the last bundled bar so the final step can advance the
 * clock and watch `backfillSnapshots` draw the days in between.
 */
const DAY_ONE = '2026-06-01'

const SHOTS = 'test-results/screens'

/** Pin the app's clock. Re-appliable: the last init script to run wins. */
async function setClock(page: Page, day: string): Promise<void> {
  await page.addInitScript((d: string) => {
    window.__TEST_CLOCK__ = { today: d, now: `${d}T15:30:00.000Z` }
  }, day)
}

/** Money exactly as `src/ui/format.ts` renders it. */
function money(x: number): string {
  return `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Dismiss the badge/level overlay if one is up, so the next tap lands. */
async function clearCelebration(page: Page): Promise<void> {
  const overlay = page.getByTestId('celebration')
  if (await overlay.isVisible()) {
    await overlay.click()
    await expect(overlay).toBeHidden()
  }
}

/** Open the ticket for `symbol` from the picker. */
async function openTicket(page: Page, symbol: string): Promise<void> {
  await page.getByTestId('symbol-search').fill(symbol)
  const tile = page.getByTestId('symbol-tile').filter({ hasText: symbol })
  await expect(tile).toHaveCount(1)
  await tile.click()
  await expect(page.getByTestId('trade-ticket')).toHaveAttribute('data-symbol', symbol)
  // The ticket must not render a price until it has one — a fill at "···" is a bug.
  await expect(page.getByTestId('quote-price')).not.toHaveText('···')
}

test.describe('paper trading', () => {
  test('first buy, sell, journal note, persistence, and the equity curve', async ({ page }) => {
    await setClock(page, DAY_ONE)
    await page.goto('/portfolio')

    // ── Empty account ──
    await expect(page.getByTestId('portfolio-screen')).toBeVisible()
    await expect(page.getByTestId('portfolio-equity')).toHaveText(money(STARTING_CASH))
    await expect(page.getByTestId('portfolio-cash')).toHaveText(money(STARTING_CASH))
    await expect(page.getByTestId('perf-empty')).toBeVisible()
    await expect(page.getByTestId('positions-empty')).toBeVisible()
    // Bundled quotes are historical closes and the UI has to admit it.
    await expect(page.getByTestId('stale-badge')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/01-portfolio-empty.png`, fullPage: true })

    // ── Picker ──
    await page.getByTestId('cta-trade').click()
    await expect(page).toHaveURL(/\/trade$/)
    await expect(page.getByTestId('symbol-picker')).toBeVisible()
    await expect(page.getByTestId('symbol-tile')).toHaveCount(27)
    // Prices fill in from the bundled files.
    await expect(
      page.getByTestId('symbol-tile').filter({ hasText: 'AAPL' }),
    ).toContainText(money(AAPL_CLOSE))
    await page.screenshot({ path: `${SHOTS}/02-symbol-picker.png`, fullPage: true })

    // Search narrows by name as well as by ticker.
    await page.getByTestId('symbol-search').fill('netflix')
    await expect(page.getByTestId('symbol-tile')).toHaveCount(1)
    await expect(page.getByTestId('symbol-tile')).toHaveAttribute('data-symbol', 'NFLX')

    // ── Ticket: $10,000 of AAPL ──
    await openTicket(page, 'AAPL')
    await expect(page.getByTestId('quote-price')).toHaveText(money(AAPL_CLOSE))
    await expect(page.getByTestId('quote-asof')).toContainText('Aug 21, 2026')
    await expect(page.getByTestId('stale-badge')).toBeVisible()
    await expect(page.getByTestId('candle-chart')).toBeVisible()
    // Nothing held yet, so selling is not on the menu.
    await expect(page.getByTestId('side-sell')).toBeDisabled()

    await page.getByTestId('mode-dollars').click()
    await page.getByTestId('qty-input').fill('10000')
    await expect(page.getByTestId('preview-cost')).toHaveText(money(10_000))
    await expect(page.getByTestId('preview-cash-after')).toHaveText(money(90_000))
    await expect(page.getByTestId('preview-weight')).toHaveText('10.0%')
    await expect(page.getByTestId('concentration-warning')).toHaveCount(0)
    await page.screenshot({ path: `${SHOTS}/03-trade-ticket.png`, fullPage: true })

    await page.getByTestId('confirm-btn').click()
    await expect(page.getByTestId('trade-success')).toBeVisible()
    await expect(page.getByTestId('trade-success')).toContainText('Bought')
    // No note on this one — no journal XP.
    await expect(page.getByTestId('success-xp')).toHaveCount(0)
    // The first paper trade earns a badge, which settles through the same queue
    // every other award uses.
    await expect(page.getByTestId('celebration')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/04a-first-trade-badge.png`, fullPage: true })
    await clearCelebration(page)
    await page.screenshot({ path: `${SHOTS}/04b-trade-success.png`, fullPage: true })

    // ── Portfolio reflects the fill ──
    await page.getByTestId('success-portfolio').click()
    await expect(page).toHaveURL(/\/portfolio$/)
    await expect(page.getByTestId('position-row')).toHaveCount(1)
    await expect(page.getByTestId('position-row').first()).toHaveAttribute('data-symbol', 'AAPL')
    await expect(page.getByTestId('position-value')).toHaveText(money(10_000))
    await expect(page.getByTestId('position-weight')).toHaveText('10.0%')
    // A market buy is value-neutral: cash became shares worth the same.
    await expect(page.getByTestId('portfolio-equity')).toHaveText(money(STARTING_CASH))
    await expect(page.getByTestId('portfolio-cash')).toHaveText(money(90_000))
    // The benchmark is live now, so the chart replaces the empty state.
    await expect(page.getByTestId('perf-empty')).toHaveCount(0)
    await expect(page.getByTestId('perf-chart')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/05-portfolio-first-position.png`, fullPage: true })

    // ── Sell half ──
    await expect(page.getByTestId('realized-pnl')).toHaveCount(0)
    await page.getByTestId('position-row').first().click()
    await expect(page.getByTestId('trade-ticket')).toHaveAttribute('data-symbol', 'AAPL')
    await expect(page.getByTestId('held-qty')).toContainText('46.2984')

    await page.getByTestId('side-sell').click()
    await page.getByTestId('amount-chip').filter({ hasText: '50%' }).click()
    await expect(page.getByTestId('preview-cost')).toHaveText(money(5_000))
    await expect(page.getByTestId('preview-cash-after')).toHaveText(money(95_000))
    await page.screenshot({ path: `${SHOTS}/06-sell-ticket.png`, fullPage: true })

    await page.getByTestId('confirm-btn').click()
    await expect(page.getByTestId('trade-success')).toContainText('Sold')
    // Sold at the price it was bought at, so the realized line is a clean zero.
    await expect(page.getByTestId('success-realized')).toContainText('$0.00')
    await clearCelebration(page)

    await page.getByTestId('success-portfolio').click()
    await expect(page.getByTestId('realized-pnl')).toBeVisible()
    await expect(page.getByTestId('realized-pnl-value')).toHaveText('$0.00')
    await expect(page.getByTestId('portfolio-cash')).toHaveText(money(95_000))

    // ── A trade with a thesis attached ──
    await page.getByTestId('cta-trade').click()
    await openTicket(page, 'MSFT')
    await page.getByTestId('mode-dollars').click()
    await page.getByTestId('qty-input').fill('1000')
    await page.getByTestId('note-input').fill('Cloud margins still expanding.')
    await page.getByTestId('confirm-btn').click()
    await expect(page.getByTestId('trade-success')).toBeVisible()
    await expect(page.getByTestId('success-xp')).toContainText(`+${XP_JOURNAL_NOTE} XP`)
    await clearCelebration(page)

    await page.getByTestId('success-portfolio').click()
    await expect(page.getByTestId('portfolio-cash')).toHaveText(money(94_000))
    // The note is kept with the trade, not just celebrated and thrown away.
    await page.getByTestId('tx-toggle').click()
    await expect(page.getByTestId('tx-row')).toHaveCount(3)
    await expect(page.getByTestId('tx-note')).toContainText('Cloud margins still expanding.')
    await page.screenshot({ path: `${SHOTS}/07-portfolio-history.png`, fullPage: true })

    // Journal XP shows up in the same lifetime total everything else feeds.
    await page.getByTestId('tab-home').click()
    await expect(page.getByTestId('xp-total')).toHaveText(`${XP_JOURNAL_NOTE} XP`)
    await expect(page.getByTestId('home-portfolio-tile')).toBeVisible()
    await expect(page.getByTestId('home-portfolio-equity')).toHaveText(money(STARTING_CASH))
    await page.screenshot({ path: `${SHOTS}/08-home-tile.png`, fullPage: true })

    // ── Persistence ──
    await page.reload()
    await page.getByTestId('tab-portfolio').click()
    await expect(page.getByTestId('portfolio-cash')).toHaveText(money(94_000))
    await expect(page.getByTestId('position-row')).toHaveCount(2)
    await expect(page.getByTestId('realized-pnl')).toBeVisible()

    // ── Days pass: the curve fills itself in ──
    await setClock(page, LAST_BAR_DATE)
    await page.reload()
    await page.getByTestId('tab-portfolio').click()
    const chart = page.getByTestId('perf-chart')
    await expect(chart).toBeVisible()
    // One point per SPY session between day one and today — a line, not a dot.
    await expect(async () => {
      const points = Number(await chart.getAttribute('data-points'))
      expect(points).toBeGreaterThan(30)
    }).toPass()
    // Both lines are drawn (a flat carried-forward equity line has zero bounding
    // height, so `toBeVisible` is the wrong question — ask for the geometry).
    await expect(page.getByTestId('perf-line-portfolio')).toHaveAttribute('d', /^M[\d.]+,[\d.]+ L/)
    await expect(page.getByTestId('perf-line-benchmark')).toHaveAttribute('d', /^M[\d.]+,[\d.]+ L/)
    // Two snapshots exist now, so the headline can show a day move.
    await expect(page.getByTestId('portfolio-daychange')).toBeVisible()
    await expect(page.getByTestId('portfolio-vs-spy')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/09-portfolio-curve.png`, fullPage: true })
  })

  test('concentration guardrail and engine validation surface on the ticket', async ({ page }) => {
    await setClock(page, DAY_ONE)
    await page.goto('/trade')

    await openTicket(page, 'NVDA')
    await page.getByTestId('mode-dollars').click()

    // Under the threshold: no scolding.
    await page.getByTestId('qty-input').fill('10000')
    await expect(page.getByTestId('concentration-warning')).toHaveCount(0)

    // $30k of a $100k account is 30% in one name.
    await page.getByTestId('qty-input').fill('30000')
    await expect(page.getByTestId('preview-weight')).toHaveText('30.0%')
    await expect(page.getByTestId('concentration-warning')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/10-concentration-warning.png`, fullPage: true })

    // The engine is the authority on affordability, and its message is shown as-is.
    await page.getByTestId('qty-input').fill('250000')
    await page.getByTestId('confirm-btn').click()
    await expect(page.getByTestId('trade-error')).toContainText('Not enough cash')
    await expect(page.getByTestId('trade-success')).toHaveCount(0)
    await page.screenshot({ path: `${SHOTS}/11-trade-error.png`, fullPage: true })
  })

  test('a live quote is cached to IndexedDB and survives a reload', async ({ page }) => {
    // The only place in the suite where the live leg succeeds: everything the
    // Stooq provider needs is a CSV body, so a fulfilled route is a real quote
    // as far as the app is concerned.
    const csv = [
      'Symbol,Date,Time,Open,High,Low,Close,Volume',
      'AAPL.US,2026-08-24,22:00:07,230.10,231.00,229.00,230.50,41282925',
    ].join('\n')
    await page.route('**/api/stooq/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/csv', body: csv }),
    )

    await setClock(page, DAY_ONE)
    await page.goto('/trade?symbol=AAPL')
    await expect(page.getByTestId('quote-price')).toHaveText(money(230.5))
    // A live mark is not stale, and must not wear the badge.
    await expect(page.getByTestId('stale-badge')).toHaveCount(0)

    // The cache lives in the same IndexedDB the rest of the app persists to.
    // Writes are coalesced behind a short timer, so poll rather than sample once.
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            new Promise<number | null>((resolve) => {
              const open = indexedDB.open('tickerquest')
              open.onsuccess = () => {
                const req = open.result
                  .transaction('kv', 'readonly')
                  .objectStore('kv')
                  .get('tq.v1.quotes')
                req.onsuccess = () => resolve(req.result?.AAPL?.quote?.price ?? null)
                req.onerror = () => resolve(null)
              }
              open.onerror = () => resolve(null)
            }),
        ),
      )
      .toBe(230.5)

    // Take the wire away. Within the TTL the persisted entry answers on its own,
    // so the reloaded tab still shows the live price rather than falling back to
    // the bundled close.
    await page.unroute('**/api/stooq/**')
    await page.route('**/api/stooq/**', (route) => route.abort())
    await page.reload()
    await expect(page.getByTestId('quote-price')).toHaveText(money(230.5))
    await expect(page.getByTestId('stale-badge')).toHaveCount(0)
    await page.screenshot({ path: `${SHOTS}/12-live-quote-cached.png`, fullPage: true })
  })
})
