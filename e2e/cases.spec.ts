// `test` comes from the shared fixture, which pre-seeds a throwaway profile —
// see e2e/fixtures.ts.
import { expect, test } from './fixtures'
import type { Page } from '@playwright/test'

/**
 * The case list has no entry point from a tabbed screen yet — the intended one
 * is a card on Drills, and it lands with the shell wiring (see the note at the
 * top of src/ui/screens/caseRoutes.tsx). Until then the spec navigates by URL,
 * which is also how a deep link or a restored tab arrives.
 */
const LIST = '/cases'

/** Case 1 asks eight questions across eleven steps. */
const C1_STEPS = 11
const C1_QUESTIONS = 8

/** `c1-q1` keys on "25.0%" at index 0, so index 1 is reliably wrong. */
const FIRST_CALC_WRONG_CHOICE = 1

async function openList(page: Page): Promise<void> {
  await page.goto(LIST)
  await expect(page.getByTestId('cases-screen')).toHaveAttribute('data-ready', 'true')
}

/** Answer whatever is on screen (if anything) and move on. */
async function advance(page: Page): Promise<void> {
  const quiz = page.getByTestId('case-quiz')
  if (await quiz.isVisible()) {
    const first = page.getByTestId('quiz-choice').first()
    if ((await first.getAttribute('data-state')) === 'idle') await first.click()
    await expect(page.getByTestId('case-explain')).toBeVisible()
  }
  await page.getByTestId('case-next').click()
}

test.describe('case studies', () => {
  test('locked list → play → leave → resume → finish → unlocks the next case', async ({ page }) => {
    await openList(page)

    // ── The list starts with exactly one case open ──
    await expect(page.getByTestId('case-card')).toHaveCount(6)
    await expect(page.getByTestId('cases-done')).toHaveText('0/6')
    await expect(page.locator('[data-case-id="c1"]')).toHaveAttribute('data-state', 'open')
    for (const id of ['c2', 'c3', 'c4', 'c5', 'c6']) {
      await expect(page.locator(`[data-case-id="${id}"]`)).toHaveAttribute('data-state', 'locked')
    }

    // A locked case cannot be opened, even by URL.
    await page.goto('/case/c3')
    await expect(page.getByTestId('case-locked')).toBeVisible()

    // ── Open case 1 ──
    await openList(page)
    await page.locator('[data-case-id="c1"]').click()
    await expect(page.getByTestId('case-player')).toHaveAttribute('data-case-id', 'c1')
    await expect(page.getByTestId('case-step')).toHaveAttribute('data-idx', '0')
    await expect(page.getByTestId('case-step')).toHaveAttribute('data-kind', 'read')

    // Step 0 shows both fiscal years of the grocer's statements.
    await expect(page.getByTestId('statement-table')).toHaveAttribute('data-companies', '2')
    await expect(page.getByTestId('statement-company')).toHaveCount(2)

    // The statements collapse, so a long question is not pushed off the screen.
    await page.getByTestId('case-statements-toggle').click()
    await expect(page.getByTestId('statement-table')).toBeHidden()
    await page.getByTestId('case-statements-toggle').click()
    await expect(page.getByTestId('statement-table')).toBeVisible()

    await page.getByTestId('case-next').click()

    // ── Step 1: a calc question, answered wrong on purpose ──
    await expect(page.getByTestId('case-step')).toHaveAttribute('data-kind', 'calc')
    await expect(page.getByTestId('case-formula-hint')).toContainText('Gross margin')
    // Next is refused until something is picked.
    await expect(page.getByTestId('case-next')).toBeDisabled()

    const choices = page.getByTestId('quiz-choice')
    await expect(choices).toHaveCount(4)
    await choices.nth(FIRST_CALC_WRONG_CHOICE).click()

    const explain = page.getByTestId('case-explain')
    await expect(explain).toBeVisible()
    await expect(explain).toHaveAttribute('data-correct', 'false')
    await expect(explain).toContainText('25.0%')
    // The keyed choice is revealed alongside the wrong pick.
    await expect(choices.nth(FIRST_CALC_WRONG_CHOICE)).toHaveAttribute('data-state', 'wrong')
    await expect(choices.nth(0)).toHaveAttribute('data-state', 'revealed')
    await expect(page.getByTestId('case-next')).toBeEnabled()

    // ── Walk to the thesis step and write something ──
    const thesis = page.getByTestId('case-thesis-input')
    for (let i = 0; i < C1_STEPS && !(await thesis.isVisible()); i++) await advance(page)
    await expect(thesis).toBeVisible()
    await thesis.fill('Boring, cheap, and the share count is falling. Small position.')
    // The debounce has to have fired before the tab goes away.
    await page.waitForTimeout(900)

    const thesisStep = await page.getByTestId('case-step').getAttribute('data-idx')

    // ── Leave mid-case ──
    await page.getByTestId('case-exit').click()
    await expect(page.getByTestId('cases-screen')).toBeVisible()
    await expect(page.locator('[data-case-id="c1"]')).toHaveAttribute('data-state', 'resume')
    await expect(page.locator('[data-case-id="c1"]')).toContainText('Resume · step')

    // ── Come back: same step, same text ──
    await page.locator('[data-case-id="c1"]').click()
    await expect(page.getByTestId('case-step')).toHaveAttribute('data-idx', thesisStep ?? '')
    await expect(page.getByTestId('case-thesis-input')).toHaveValue(
      'Boring, cheap, and the share count is falling. Small position.',
    )

    // ── Finish ──
    for (let i = 0; i < C1_STEPS; i++) {
      if (await page.getByTestId('case-complete').isVisible()) break
      await advance(page)
    }

    const complete = page.getByTestId('case-complete')
    await expect(complete).toBeVisible()
    // One question was deliberately failed, so the score cannot be perfect.
    await expect(page.getByTestId('case-score')).toContainText(`/${C1_QUESTIONS}`)
    await expect(page.getByTestId('case-score')).not.toContainText(
      `${C1_QUESTIONS}/${C1_QUESTIONS}`,
    )
    await expect(page.getByTestId('case-xp-earned')).toContainText('+')
    await expect(page.getByTestId('case-verdict')).toHaveAttribute('data-checklist-score', '9')
    await expect(page.getByTestId('case-verdict')).toContainText('Buy')
    await expect(page.getByTestId('case-your-thesis')).toContainText('Boring, cheap')

    // ── The next case is now open, and nothing beyond it ──
    await page.getByTestId('case-back-to-list').click()
    await expect(page.getByTestId('cases-screen')).toBeVisible()
    await expect(page.locator('[data-case-id="c1"]')).toHaveAttribute('data-state', 'done')
    await expect(page.locator('[data-case-id="c2"]')).toHaveAttribute('data-state', 'open')
    await expect(page.locator('[data-case-id="c3"]')).toHaveAttribute('data-state', 'locked')
    await expect(page.getByTestId('cases-done')).toHaveText('1/6')

    const xp = await page.getByTestId('cases-xp').textContent()
    expect(Number(xp)).toBeGreaterThanOrEqual(25)

    // ── And it survives a reload ──
    await page.reload()
    await expect(page.getByTestId('cases-screen')).toHaveAttribute('data-ready', 'true')
    await expect(page.locator('[data-case-id="c1"]')).toHaveAttribute('data-state', 'done')
    await expect(page.locator('[data-case-id="c2"]')).toHaveAttribute('data-state', 'open')
    await expect(page.getByTestId('cases-xp')).toHaveText(xp ?? '')
  })
})
