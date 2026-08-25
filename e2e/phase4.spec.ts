// `test` comes from the shared fixture, which pre-seeds a throwaway profile so
// this spec still sees the app at '/' — see e2e/fixtures.ts.
import { expect, test } from './fixtures'
import type { Page } from '@playwright/test'
// Only alias-free modules may be imported here: Playwright transpiles the spec
// without the app's `@core/*` path mapping.
import { XP_DRILL, XP_DRILL_CORRECT_BONUS } from '../src/core/gamification/xp'
import { STARTING_CASH } from '../src/core/portfolio/engine'

const SHOTS = 'test-results/screens'

/**
 * The drill kind is `dayOfEpoch % 3` once financials drills are loaded
 * (pattern → whatnext → financials), so a fixed date pins the kind without the
 * spec needing the engine.
 *   2026-03-04 → day 20 516 → 20 516 % 3 = 2 → financials (a two-company compare)
 *   2026-03-07 → day 20 519 → also financials, and a single-company ratio drill
 */
const COMPARE_DAY = '2026-03-04'
const RATIO_DAY = '2026-03-07'

/**
 * Limit-order dates. Quotes in this environment always come from the bundled
 * provider (stooq is unreachable), so AAPL is quoted at its last bundled close
 * of $215.99 on *every* date. A $196 buy limit therefore rests, and the AAPL bar
 * for 2026-06-02 (open 197.54, low 194.68) is the first one to cross it.
 */
const ORDER_DAY = '2026-06-01'
const AFTER_FILL_DAY = '2026-06-10'
const LIMIT_PRICE = 196
/** The first bar after placement that trades under the limit: 2026-06-02. */
const FILL_DAY_LABEL = 'Jun 2'
/** open 197.54 never gapped through, so the fill is the limit itself. */
const FILL_PRICE = 196
const ORDER_QTY = 10

/** Freeze the app's clock before any app code runs. Last init script wins. */
async function useDay(page: Page, day: string): Promise<void> {
  await page.addInitScript(
    (clock) => {
      ;(window as unknown as { __TEST_CLOCK__: unknown }).__TEST_CLOCK__ = clock
    },
    { today: day, now: `${day}T15:30:00.000Z` },
  )
}

/** Money exactly as `src/ui/format.ts` renders it. */
function money(x: number): string {
  return `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

async function clearCelebrations(page: Page): Promise<void> {
  const overlay = page.getByTestId('celebration')
  for (let i = 0; i < 6; i++) {
    if (!(await overlay.isVisible())) return
    await overlay.click()
    await page.waitForTimeout(150)
  }
  await expect(overlay).toBeHidden()
}

/**
 * The one thing a statement table on a phone must never do. Checked on the
 * document rather than the card, because an overflowing child widens the page
 * even when the card itself reports a tidy width.
 */
async function expectNoSideScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
}

test.describe('read-the-financials drill', () => {
  test('two-company compare: statements → answer → explanation → stats', async ({ page }) => {
    await useDay(page, COMPARE_DAY)
    await page.goto('/')
    await expect(page.getByTestId('xp-total')).toHaveText('0 XP')

    // ── The Drills tab offers the third kind ──
    await page.getByTestId('tab-drills').click()
    const card = page.getByTestId('drill-today')
    await expect(card).toHaveAttribute('data-kind', 'financials')
    await expect(card).toContainText('Read the Financials')
    // A financials drill has no ticker to hide, so it names the question type.
    await expect(card).not.toContainText('Mystery Chart')
    await page.screenshot({ path: `${SHOTS}/20-drills-financials-card.png`, fullPage: true })

    await page.getByTestId('start-drill').click()
    await expect(page).toHaveURL(/\/drill$/)

    // ── The statements render ──
    const table = page.getByTestId('statement-table')
    await expect(table).toBeVisible()
    await expect(table).toHaveAttribute('data-companies', '2')
    // Income statement, balance sheet, cash flow — all three, always.
    await expect(page.getByTestId('statement-section')).toHaveCount(3)
    await expect(page.locator('[data-testid="statement-section"][data-section="income"]')).toBeVisible()
    await expect(page.locator('[data-testid="statement-section"][data-section="balance"]')).toBeVisible()
    await expect(page.locator('[data-testid="statement-section"][data-section="cash"]')).toBeVisible()
    // Both companies are named, and every row carries a figure for each of them.
    await expect(page.getByTestId('statement-company')).toHaveCount(2)
    const revenue = page.locator('[data-testid="statement-row"][data-label="Revenue"]')
    await expect(revenue.locator('dd')).toHaveCount(2)
    await expect(revenue.locator('dd').first()).toHaveText(/^[\d,]+$/)
    // Deductions are shown the way a statement shows them.
    await expect(
      page.locator('[data-testid="statement-row"][data-label="Cost of revenue"] dd').first(),
    ).toHaveText(/^\(\d[\d,]*\)$/)
    await expectNoSideScroll(page)
    await page.screenshot({ path: `${SHOTS}/21-financials-compare.png`, fullPage: true })

    // ── Answer ──
    await expect(page.getByTestId('drill-question')).not.toHaveText('')
    const choices = page.getByTestId('drill-choice')
    await expect(choices).toHaveCount(4)
    await choices.first().click()

    const explain = page.getByTestId('drill-explain')
    await expect(explain).toBeVisible()
    const wasCorrect = (await explain.getAttribute('data-correct')) === 'true'
    // Right or wrong, the correct choice is always identified.
    await expect(
      page.locator(
        '[data-testid="drill-choice"][data-state="correct"], [data-testid="drill-choice"][data-state="revealed"]',
      ),
    ).toHaveCount(1)
    for (let i = 0; i < 4; i++) await expect(choices.nth(i)).toBeDisabled()
    await expectNoSideScroll(page)
    await page.screenshot({ path: `${SHOTS}/22-financials-explain.png`, fullPage: true })

    // ── Done panel ──
    await page.getByTestId('drill-continue').click()
    const expectedXp = XP_DRILL + (wasCorrect ? XP_DRILL_CORRECT_BONUS : 0)
    await expect(page.getByTestId('drill-done')).toBeVisible()
    // No confidence is asked on a financials drill, so the score is the flat one.
    await expect(page.getByTestId('drill-score')).toHaveText(wasCorrect ? '+10 pts' : '0 pts')
    await expect(page.getByTestId('drill-xp')).toHaveText(`+${expectedXp} XP`)
    await clearCelebrations(page)

    // ── Stats screen counts the third kind ──
    await page.goto('/drill-stats')
    await expect(page.getByTestId('kind-total')).toHaveCount(3)
    const finRow = page.locator('[data-testid="kind-total"][data-kind="financials"]')
    await expect(finRow).toContainText('Read the Financials')
    await expect(finRow).toContainText(wasCorrect ? '1 of 1 correct' : '0 of 1 correct')
    await page.screenshot({ path: `${SHOTS}/23-drill-stats-three-kinds.png`, fullPage: true })

    // ── It sticks, and a second drill is refused ──
    await page.reload()
    await page.goto('/drills')
    await expect(page.getByTestId('drill-answered')).toBeVisible()
    await page.goto('/drill')
    await expect(page.getByTestId('drill-already-done')).toBeVisible()
  })

  test('single-company ratio drill renders one statement column', async ({ page }) => {
    await useDay(page, RATIO_DAY)
    await page.goto('/drill')

    const table = page.getByTestId('statement-table')
    await expect(table).toBeVisible()
    await expect(table).toHaveAttribute('data-companies', '1')
    await expect(page.getByTestId('statement-company')).toHaveCount(1)
    await expect(
      page.locator('[data-testid="statement-row"][data-label="Net income"] dd'),
    ).toHaveCount(1)
    // EPS keeps its dollars and decimals while the rest of the table is $M.
    await expect(
      page.locator('[data-testid="statement-row"][data-label="EPS"] dd'),
    ).toHaveText(/^\$\d+\.\d{2}$/)
    await expectNoSideScroll(page)
    await page.screenshot({ path: `${SHOTS}/24-financials-single.png`, fullPage: true })
  })
})

test.describe('limit orders', () => {
  test('a resting buy limit fills against the bar that crossed it', async ({ page }) => {
    await useDay(page, ORDER_DAY)
    await page.goto('/trade?symbol=AAPL')
    await expect(page.getByTestId('quote-price')).not.toHaveText('···')

    // ── Switch the ticket to a limit order ──
    await page.getByTestId('ordertype-limit').click()
    // The limit prefills with the price on screen rather than an empty field.
    await expect(page.getByTestId('limit-input')).toHaveValue('215.99')
    await page.getByTestId('limit-input').fill(String(LIMIT_PRICE))
    await page.getByTestId('mode-shares').click()
    await page.getByTestId('qty-input').fill(String(ORDER_QTY))

    // Sized on the limit, not on the quote: 10 × $196.
    await expect(page.getByTestId('preview-cost')).toHaveText(money(LIMIT_PRICE * ORDER_QTY))
    await expect(page.getByTestId('limit-explain')).toContainText('at or below $196.00')
    // A buy limit under the market is not "already through" it.
    await expect(page.getByTestId('limit-crosses-warning')).toHaveCount(0)
    await page.screenshot({ path: `${SHOTS}/25-limit-ticket.png`, fullPage: true })

    await page.getByTestId('confirm-btn').click()
    const resting = page.getByTestId('order-resting')
    await expect(resting).toBeVisible()
    await expect(page.getByTestId('resting-summary')).toHaveText(
      `Buy ${ORDER_QTY} AAPL at ${money(LIMIT_PRICE)}`,
    )
    await page.screenshot({ path: `${SHOTS}/26-order-resting.png`, fullPage: true })

    // ── Nothing has been bought and no cash has moved ──
    await page.getByTestId('resting-portfolio').click()
    await expect(page.getByTestId('portfolio-cash')).toHaveText(money(STARTING_CASH))
    await expect(page.getByTestId('positions-empty')).toBeVisible()
    const row = page.getByTestId('order-row')
    await expect(row).toHaveCount(1)
    await expect(row).toHaveAttribute('data-status', 'open')
    await expect(row).toContainText('AAPL')
    await expect(row).toContainText(money(LIMIT_PRICE))
    await expect(page.getByTestId('order-age')).toHaveText('Placed today')
    await page.screenshot({ path: `${SHOTS}/27-open-orders.png`, fullPage: true })

    // ── The order survives a reload while the price has not come to it ──
    await page.reload()
    await expect(page.getByTestId('order-row')).toHaveCount(1)

    // ── Days pass; 2026-06-02 traded down to 194.68 and took the order ──
    await useDay(page, AFTER_FILL_DAY)
    await page.reload()
    await expect(page.getByTestId('position-row')).toHaveCount(1)
    await expect(page.getByTestId('position-row').first()).toHaveAttribute('data-symbol', 'AAPL')
    await expect(page.getByTestId('portfolio-cash')).toHaveText(
      money(STARTING_CASH - FILL_PRICE * ORDER_QTY),
    )
    // The book is consumed: the resting order is gone from Open orders.
    await expect(page.getByTestId('order-row')).toHaveCount(0)

    // ── The fill is an ordinary transaction, marked as what it was ──
    await page.getByTestId('tx-toggle').click()
    const tx = page.getByTestId('tx-row')
    await expect(tx).toHaveCount(1)
    await expect(tx).toContainText(`Bought ${ORDER_QTY} AAPL`)
    await expect(tx).toContainText(`${money(FILL_PRICE)}/sh`)
    // Stamped with the session that filled it, not with today.
    await expect(tx).toContainText(FILL_DAY_LABEL)
    await expect(page.getByTestId('tx-note')).toContainText('Limit order fill')
    await page.screenshot({ path: `${SHOTS}/28-limit-filled.png`, fullPage: true })

    // The app wrote that note, so it must not pay the journal-note XP.
    await page.getByTestId('tab-home').click()
    await expect(page.getByTestId('xp-total')).toHaveText('0 XP')

    // ── Re-opening does not fill it twice ──
    await page.reload()
    await page.getByTestId('tab-portfolio').click()
    await expect(page.getByTestId('position-row')).toHaveCount(1)
    await expect(page.getByTestId('portfolio-cash')).toHaveText(
      money(STARTING_CASH - FILL_PRICE * ORDER_QTY),
    )
  })

  test('a resting order can be cancelled before it fills', async ({ page }) => {
    await useDay(page, ORDER_DAY)
    await page.goto('/trade?symbol=MSFT')
    await page.getByTestId('ordertype-limit').click()
    await page.getByTestId('limit-input').fill('100')
    await page.getByTestId('mode-shares').click()
    await page.getByTestId('qty-input').fill('5')
    await page.getByTestId('confirm-btn').click()
    await expect(page.getByTestId('order-resting')).toBeVisible()

    await page.getByTestId('resting-portfolio').click()
    await expect(page.getByTestId('order-row')).toHaveCount(1)
    await page.getByTestId('order-cancel').click()
    await expect(page.getByTestId('orders-section')).toHaveCount(0)

    // A cancelled order stays cancelled across a reload — and never fills.
    await page.reload()
    await expect(page.getByTestId('orders-section')).toHaveCount(0)
    await expect(page.getByTestId('positions-empty')).toBeVisible()
  })
})

test.describe('watchlist', () => {
  test('starring a symbol persists and lists it on the Portfolio screen', async ({ page }) => {
    await useDay(page, ORDER_DAY)
    await page.goto('/trade')

    // Wait for the grid to price itself so the screenshot is the real screen.
    await expect(
      page.getByTestId('symbol-tile').filter({ hasText: 'AAPL' }),
    ).not.toContainText('···')

    const star = page.locator('[data-testid="watch-toggle"][data-symbol="NVDA"]')
    await expect(star).toHaveAttribute('data-watched', 'false')
    await star.click()
    await expect(star).toHaveAttribute('data-watched', 'true')
    await page.screenshot({ path: `${SHOTS}/29-watchlist-picker.png`, fullPage: true })

    // ── Survives a reload ──
    await page.reload()
    await expect(
      page.locator('[data-testid="watch-toggle"][data-symbol="NVDA"]'),
    ).toHaveAttribute('data-watched', 'true')

    // ── And shows up on the Portfolio screen with a price and a move ──
    // /trade is a focus layout with no tab bar, so leave it the way the UI does.
    await page.getByTestId('trade-back').click()
    await expect(page).toHaveURL(/\/portfolio$/)
    const section = page.getByTestId('watchlist-section')
    await expect(section).toBeVisible()
    const row = page.getByTestId('watch-row')
    await expect(row).toHaveCount(1)
    await expect(row).toHaveAttribute('data-symbol', 'NVDA')
    await expect(page.getByTestId('watch-price')).toHaveText(/^\$[\d,]+\.\d{2}$/)
    await expect(page.getByTestId('watch-change')).toHaveText(/^[+−]\$[\d,.]+ \([+−]\d+\.\d{2}%\)$/)
    await page.screenshot({ path: `${SHOTS}/30-watchlist-portfolio.png`, fullPage: true })

    // ── The ticket header star is the same toggle ──
    await page.getByTestId('watch-row').getByRole('link').first().click()
    await expect(page.getByTestId('trade-ticket')).toHaveAttribute('data-symbol', 'NVDA')
    const ticketStar = page.locator('[data-testid="watch-toggle"][data-symbol="NVDA"]')
    await expect(ticketStar).toHaveAttribute('data-watched', 'true')
    await ticketStar.click()
    await expect(ticketStar).toHaveAttribute('data-watched', 'false')

    // Back out of the ticket, then out of the picker.
    await page.getByTestId('trade-back').click()
    await expect(page.getByTestId('symbol-picker')).toBeVisible()
    await page.getByTestId('trade-back').click()
    await expect(page).toHaveURL(/\/portfolio$/)
    await expect(page.getByTestId('watchlist-section')).toHaveCount(0)
  })
})
