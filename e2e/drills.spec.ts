import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
// Only alias-free modules may be imported here: Playwright transpiles the spec
// without the app's `@core/*` path mapping, so `xp.ts` (which imports nothing)
// is safe while the drill engine is not.
import { XP_DRILL, XP_DRILL_CORRECT_BONUS } from '../src/core/gamification/xp'

/**
 * The drill kind alternates on day-of-epoch parity, so a fixed date pins the
 * kind without the spec needing the engine. 2026-03-02 is 20 514 days after the
 * epoch (even → pattern); the next day is odd → what-next.
 */
const PATTERN_DAY = '2026-03-02'
const WHATNEXT_DAY = '2026-03-03'

/** Bars of lead-in a what-next drill shows, plus the cutoff bar itself. */
const LEADIN_BARS = 121
const HORIZON = 10

/** Freeze the app's clock before any app code runs. */
async function useDay(page: Page, day: string): Promise<void> {
  await page.addInitScript(
    (clock) => {
      ;(window as unknown as { __TEST_CLOCK__: unknown }).__TEST_CLOCK__ = clock
    },
    { today: day, now: `${day}T09:30:00.000Z` },
  )
}

/**
 * Answering a drill meets the day-one goal (no cards are due), so a celebration
 * overlay covers the screen. It self-dismisses, but a click is faster and the
 * queue can hold more than one.
 */
async function clearCelebrations(page: Page): Promise<void> {
  const overlay = page.getByTestId('celebration')
  for (let i = 0; i < 6; i++) {
    if (!(await overlay.isVisible())) return
    await overlay.click()
    await page.waitForTimeout(150)
  }
  await expect(overlay).toBeHidden()
}

/** The candlestick canvas lightweight-charts mounts, plus the bar count drawn. */
async function expectChart(page: Page, bars?: number): Promise<void> {
  const chart = page.getByTestId('candle-chart')
  await expect(chart).toBeVisible()
  // lightweight-charts paints onto canvases inside the container.
  expect(await chart.locator('canvas').count()).toBeGreaterThan(0)
  if (bars !== undefined) await expect(chart).toHaveAttribute('data-bars', String(bars))
}

test.describe('daily drill', () => {
  test('pattern drill: chart → answer → explanation → XP, and it sticks', async ({ page }) => {
    await useDay(page, PATTERN_DAY)
    await page.goto('/')
    await expect(page.getByTestId('xp-total')).toHaveText('0 XP')

    // ── Drills tab offers today's drill ──
    await page.getByTestId('tab-drills').click()
    await expect(page).toHaveURL(/\/drills$/)
    const card = page.getByTestId('drill-today')
    await expect(card).toBeVisible()
    await expect(card).toHaveAttribute('data-kind', 'pattern')
    // The ticker is never on the announcement card.
    await expect(card).toContainText('Mystery Chart')
    // Calibration stays locked until there is enough data to be worth reading.
    await expect(page.getByTestId('calibration-summary')).toHaveCount(0)

    await page.getByTestId('start-drill').click()
    await expect(page).toHaveURL(/\/drill$/)

    // ── The chart renders ──
    await expectChart(page)
    await expect(page.getByTestId('drill-question')).toHaveText('What pattern is this?')

    const choices = page.getByTestId('drill-choice')
    await expect(choices).toHaveCount(4)
    await choices.first().click()

    // ── Feedback ──
    const explain = page.getByTestId('drill-explain')
    await expect(explain).toBeVisible()
    const wasCorrect = (await explain.getAttribute('data-correct')) === 'true'
    // Right or wrong, the learner is always shown which answer was correct.
    await expect(
      page.locator(
        '[data-testid="drill-choice"][data-state="correct"], [data-testid="drill-choice"][data-state="revealed"]',
      ),
    ).toHaveCount(1)
    // Every choice is locked once one is taken.
    for (let i = 0; i < 4; i++) await expect(choices.nth(i)).toBeDisabled()

    await page.getByTestId('drill-continue').click()

    // ── Done panel ──
    const expectedXp = XP_DRILL + (wasCorrect ? XP_DRILL_CORRECT_BONUS : 0)
    await expect(page.getByTestId('drill-done')).toBeVisible()
    await expect(page.getByTestId('drill-score')).toHaveText(wasCorrect ? '+10 pts' : '0 pts')
    await expect(page.getByTestId('drill-xp')).toHaveText(`+${expectedXp} XP`)

    await clearCelebrations(page)
    await page.getByTestId('drill-back').click()

    // ── Drills tab flips to the answered state ──
    await expect(page).toHaveURL(/\/drills$/)
    await expect(page.getByTestId('drill-answered')).toBeVisible()
    await expect(page.getByTestId('drill-today')).toHaveCount(0)

    // ── Home checklist ticks the drill row and XP landed ──
    await page.getByTestId('tab-home').click()
    await expect(page.getByTestId('today-task').nth(2)).toHaveAttribute('data-done', 'true')
    await expect(page.getByTestId('xp-total')).toHaveText(`${expectedXp} XP`)

    // ── Survives a reload ──
    await page.reload()
    await expect(page.getByTestId('xp-total')).toHaveText(`${expectedXp} XP`)
    await page.getByTestId('tab-drills').click()
    await expect(page.getByTestId('drill-answered')).toBeVisible()
    await expect(page.getByTestId('start-drill')).toHaveCount(0)

    // Going straight to the player is refused rather than handing out a second drill.
    await page.goto('/drill')
    await expect(page.getByTestId('drill-already-done')).toBeVisible()
  })

  test('what-next drill: masked chart → call → confidence → reveal', async ({ page }) => {
    await useDay(page, WHATNEXT_DAY)
    await page.goto('/')
    await page.getByTestId('tab-drills').click()

    const card = page.getByTestId('drill-today')
    await expect(card).toHaveAttribute('data-kind', 'whatnext')
    await page.getByTestId('start-drill').click()

    // ── Step 1: the call, on a chart that ends at the cutoff ──
    await expectChart(page, LEADIN_BARS)
    await expect(page.getByText('Mystery Chart')).toBeVisible()
    await expect(page.getByTestId('drill-question')).toContainText(`${HORIZON} bars`)

    const outcomes = page.getByTestId('drill-choice')
    await expect(outcomes).toHaveCount(3)
    // The ±2% band is spelled out on the buttons, not left implicit.
    await expect(outcomes.filter({ hasText: 'Up' })).toContainText('+2%')
    await outcomes.filter({ hasText: 'Up' }).click()

    // ── Step 2: confidence ──
    const confidences = page.getByTestId('confidence-choice')
    await expect(confidences).toHaveCount(3)
    await page.locator('[data-testid="confidence-choice"][data-confidence="90"]').click()

    // ── Reveal: the hidden bars are appended to the same window ──
    const reveal = page.getByTestId('drill-reveal')
    await expect(reveal).toBeVisible()
    await expectChart(page, LEADIN_BARS + HORIZON)
    const wasCorrect = (await reveal.getAttribute('data-correct')) === 'true'
    await expect(page.getByTestId('drill-actual')).toHaveText(/^[+−]\d+\.\d%$/)
    // The calibration adjustment is explained in words, not just applied.
    await expect(reveal).toContainText('90% sure')

    await page.getByTestId('drill-continue').click()

    // correct @90 → +15, wrong @90 → −5 (the calibration penalty is real).
    await expect(page.getByTestId('drill-score')).toHaveText(wasCorrect ? '+15 pts' : '−5 pts')
    const expectedXp = XP_DRILL + (wasCorrect ? XP_DRILL_CORRECT_BONUS : 0)
    await expect(page.getByTestId('drill-xp')).toHaveText(`+${expectedXp} XP`)

    await clearCelebrations(page)

    // ── Stats screen picks up the answer ──
    await page.goto('/drill-stats')
    await expect(page.getByTestId('drill-stats-screen')).toBeVisible()
    await expect(page.getByTestId('calibration-chart')).toBeVisible()
    await expect(
      page.locator('[data-testid="calibration-bar"][data-confidence="90"]'),
    ).toContainText('n=1')
    await expect(
      page.locator('[data-testid="kind-total"][data-kind="whatnext"]'),
    ).toContainText(wasCorrect ? '1 of 1 correct' : '0 of 1 correct')

    // ── Home agrees ──
    // /drill-stats is a focus layout with no tab bar, so leave it the way the UI does.
    await page.getByRole('link', { name: 'Back to Drills' }).last().click()
    await expect(page).toHaveURL(/\/drills$/)
    await page.getByTestId('tab-home').click()
    await expect(page.getByTestId('today-task').nth(2)).toHaveAttribute('data-done', 'true')
    await expect(page.getByTestId('xp-total')).toHaveText(`${expectedXp} XP`)
  })
})
