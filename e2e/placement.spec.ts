// ─── Placement test, end to end ──────────────────────────────────────────────
// The spec computes the right answers the same way the app does: it imports the
// engine's sampler and the curriculum, exactly as flows.spec.ts imports
// ALL_LESSONS and the XP table. That keeps the assertions exact (+15 XP, not
// "more than zero") and means a change to the sampler shows up here as a real
// failure rather than as a spec that quietly answers the wrong questions.

import { expect, test } from './fixtures'
import type { Page } from '@playwright/test'
import type { QuizItem } from '../src/core/types'
import { getUnit } from '../src/content/units'
import { sampleUnitItems } from '../src/core/placement/engine'
import { XP_PLACEMENT_UNIT } from '../src/core/gamification/xp'

function itemsFor(unitId: string): QuizItem[] {
  const unit = getUnit(unitId)
  if (!unit) throw new Error(`no such unit ${unitId}`)
  return sampleUnitItems(unit)
}

const U01 = itemsFor('u01')
const U02 = itemsFor('u02')
const U03 = itemsFor('u03')
const U08 = itemsFor('u08')

/** Dismiss any celebration overlays so the next tap lands. */
async function clearCelebrations(page: Page): Promise<void> {
  const overlay = page.getByTestId('celebration')
  for (let i = 0; i < 8; i++) {
    if (!(await overlay.isVisible())) return
    await overlay.click()
    await page.waitForTimeout(150)
  }
  await expect(overlay).toBeHidden()
}

/**
 * Answer one unit's five questions, getting the first `wrong` of them
 * deliberately wrong. Asserts as it goes that the app is asking the questions
 * the engine says it should, in the engine's order.
 */
async function answerUnit(page: Page, items: QuizItem[], wrong = 0): Promise<void> {
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    await expect(page.getByTestId('quiz-prompt')).toHaveText(item.prompt)
    // No explanation is ever shown mid-test — that is the whole design.
    await expect(page.getByTestId('quiz-explain')).toHaveCount(0)
    await expect(page.getByTestId('quiz-feedback')).toHaveCount(0)

    const pick = i < wrong ? (item.answerIdx + 1) % 4 : item.answerIdx
    const choices = page.getByTestId('quiz-choice')
    await expect(choices).toHaveCount(4)
    await choices.nth(pick).click()
    // The tap registers as "selected" — neutral, never right/wrong.
    await expect(choices.nth(pick)).toHaveAttribute('data-state', 'selected')
    await page.getByTestId('placement-next').click()
  }
}

async function expectInterstitial(
  page: Page,
  unitId: string,
  passed: boolean,
  score: number,
): Promise<void> {
  const panel = page.getByTestId('placement-interstitial')
  await expect(panel).toBeVisible()
  await expect(panel).toHaveAttribute('data-unit', unitId)
  await expect(panel).toHaveAttribute('data-passed', String(passed))
  await expect(panel).toHaveAttribute('data-score', String(score))
}

async function xpTotal(page: Page): Promise<number> {
  const text = (await page.getByTestId('xp-total').textContent()) ?? ''
  return Number(text.replace(/[^0-9]/g, ''))
}

test.describe('placement test', () => {
  test('offer → ladder → results → apply → retake', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /today.s quest/i })).toBeVisible()
    expect(await xpTotal(page)).toBe(0)

    // ── The offer, on a blank profile ──
    const offer = page.getByTestId('placement-offer')
    await expect(offer).toBeVisible()
    await expect(offer).toContainText(/15-minute placement test/i)
    await page.getByTestId('placement-offer-start').click()

    // ── Intro: the rules, stated before anything is asked ──
    await expect(page).toHaveURL(/\/placement$/)
    const intro = page.getByTestId('placement-intro')
    await expect(intro).toBeVisible()
    await expect(intro).toContainText('4 of 5')
    await expect(intro).toContainText(/miss stops that track/i)
    await expect(intro).toContainText(/never tested/i)
    // First attempt: nothing carried over.
    await expect(page.getByTestId('placement-retake-note')).toHaveCount(0)
    await page.getByTestId('placement-start').click()

    // ── Unit 1, all five right ──
    await expect(page.getByTestId('placement-question')).toHaveAttribute('data-unit', 'u01')
    await answerUnit(page, U01)
    await expectInterstitial(page, 'u01', true, 5)
    await expect(page.getByTestId('placement-next-unit')).toContainText('Unit 2')
    await page.getByTestId('placement-continue').click()

    // ── Unit 2, three wrong: the ladder stops here for both tracks ──
    await expect(page.getByTestId('placement-question')).toHaveAttribute('data-unit', 'u02')
    await answerUnit(page, U02, 3)
    await expectInterstitial(page, 'u02', false, 2)
    await expect(page.getByTestId('placement-next-unit')).toContainText(/last one/i)
    await page.getByTestId('placement-continue').click()

    // ── Results ──
    const results = page.getByTestId('placement-results')
    await expect(results).toBeVisible()
    const rows = page.getByTestId('placement-unit-result')
    await expect(rows).toHaveCount(2)
    await expect(rows.nth(0)).toHaveAttribute('data-unit', 'u01')
    await expect(rows.nth(0)).toHaveAttribute('data-passed', 'true')
    await expect(rows.nth(1)).toHaveAttribute('data-unit', 'u02')
    await expect(rows.nth(1)).toHaveAttribute('data-passed', 'false')

    // A failed u02 gates both branches below it, so neither track was reached.
    await expect(page.getByTestId('placement-track-start')).toHaveCount(2)
    await expect(page.locator('[data-testid="placement-track-start"][data-track="fundamental"]')).toHaveAttribute(
      'data-start',
      'u02',
    )
    await expect(page.locator('[data-testid="placement-track-start"][data-track="technical"]')).toHaveAttribute(
      'data-start',
      'u02',
    )

    // The explanations the test withheld are here, on the three missed items.
    await expect(page.getByTestId('placement-missed')).toHaveCount(3)

    // ── Apply ──
    await page.getByTestId('placement-apply').click()
    await expect(page).toHaveURL(/\/learn$/)
    await clearCelebrations(page)

    // Unit 1 is tested out; Unit 2 is unlocked by the 80% rule being satisfied.
    const u01Card = page.locator('[data-testid="unit-card"][data-unit="u01"]')
    await expect(u01Card).toHaveAttribute('data-tested-out', 'true')
    await expect(u01Card.getByTestId('tested-out-badge')).toBeVisible()
    await expect(page.locator('[data-testid="unit-card"][data-unit="u02"]')).toHaveAttribute(
      'data-locked',
      'false',
    )
    await expect(page.locator('[data-testid="unit-card"][data-unit="u02"]')).toHaveAttribute(
      'data-tested-out',
      'false',
    )

    // ── Home: exactly one unit's worth of credit, and no more offer ──
    await page.getByTestId('tab-home').click()
    await expect(page.getByTestId('placement-offer')).toHaveCount(0)
    expect(await xpTotal(page)).toBe(XP_PLACEMENT_UNIT)
    const nextLesson = getUnit('u02')!.lessons[0]
    await expect(page.getByTestId('cta-lesson')).toContainText(nextLesson.title)

    // ── It survives a reload ──
    await page.reload()
    await expect(page.getByRole('heading', { name: /today.s quest/i })).toBeVisible()
    await expect(page.getByTestId('placement-offer')).toHaveCount(0)
    expect(await xpTotal(page)).toBe(XP_PLACEMENT_UNIT)

    // ── Retake from the profile panel ──
    await page.getByTestId('profile-chip').click()
    await page.getByTestId('profile-edit').first().click()
    await page.getByTestId('placement-row').click()
    await expect(page).toHaveURL(/\/placement$/)
    // A retake resumes: Unit 1 is already credited and is not re-asked.
    await expect(page.getByTestId('placement-retake-note')).toContainText('Unit 2')
    await page.getByTestId('placement-start').click()

    await expect(page.getByTestId('placement-question')).toHaveAttribute('data-unit', 'u02')
    await answerUnit(page, U02)
    await expectInterstitial(page, 'u02', true, 5)
    await page.getByTestId('placement-continue').click()

    // Both tracks now open; end each of them with a miss to reach the results.
    await expect(page.getByTestId('placement-question')).toHaveAttribute('data-unit', 'u03')
    await answerUnit(page, U03, 5)
    await expectInterstitial(page, 'u03', false, 0)
    await page.getByTestId('placement-continue').click()

    await expect(page.getByTestId('placement-question')).toHaveAttribute('data-unit', 'u08')
    await answerUnit(page, U08, 5)
    await expectInterstitial(page, 'u08', false, 0)
    await page.getByTestId('placement-continue').click()

    // u01 shows as carried credit, not as a score earned today.
    const retakeRows = page.getByTestId('placement-unit-result')
    await expect(retakeRows).toHaveCount(4)
    await expect(retakeRows.nth(0)).toContainText(/earlier placement/i)
    await page.getByTestId('placement-apply').click()
    await expect(page).toHaveURL(/\/learn$/)
    await clearCelebrations(page)

    // u02 is credited now; u03 and u08 are open; u01 was NOT paid for twice.
    await expect(page.locator('[data-testid="unit-card"][data-unit="u02"]')).toHaveAttribute(
      'data-tested-out',
      'true',
    )
    await expect(page.locator('[data-testid="unit-card"][data-unit="u03"]')).toHaveAttribute(
      'data-locked',
      'false',
    )
    await expect(page.locator('[data-testid="unit-card"][data-unit="u08"]')).toHaveAttribute(
      'data-locked',
      'false',
    )

    await page.getByTestId('tab-home').click()
    expect(await xpTotal(page)).toBe(2 * XP_PLACEMENT_UNIT)
  })

  test('the offer can be dismissed for good, and the profile panel keeps a way back', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByTestId('placement-offer')).toBeVisible()
    await page.getByTestId('placement-offer-dismiss').click()
    await expect(page.getByTestId('placement-offer')).toHaveCount(0)

    await page.reload()
    await expect(page.getByRole('heading', { name: /today.s quest/i })).toBeVisible()
    await expect(page.getByTestId('placement-offer')).toHaveCount(0)

    // Still reachable — dismissing an offer must not delete the feature.
    await page.getByTestId('profile-chip').click()
    await page.getByTestId('profile-edit').first().click()
    await page.getByTestId('placement-row').click()
    await expect(page.getByTestId('placement-intro')).toBeVisible()
  })

  test('the ladder ends at the first miss — a beginner answers five questions', async ({ page }) => {
    await page.goto('/placement')
    await expect(page.getByTestId('placement-intro')).toBeVisible()
    await page.getByTestId('placement-start').click()

    await answerUnit(page, U01, 5)
    await expectInterstitial(page, 'u01', false, 0)
    await page.getByTestId('placement-continue').click()

    const results = page.getByTestId('placement-results')
    await expect(results).toBeVisible()
    await expect(page.getByTestId('placement-unit-result')).toHaveCount(1)
    await expect(page.getByTestId('placement-summary')).toContainText(/No units passed/i)
    await expect(
      page.locator('[data-testid="placement-track-start"][data-track="technical"]'),
    ).toHaveAttribute('data-start', 'u01')

    // Applying an empty outcome changes nothing but still retires the offer.
    await page.getByTestId('placement-apply').click()
    await expect(page).toHaveURL(/\/learn$/)
    await expect(page.locator('[data-testid="unit-card"][data-unit="u01"]')).toHaveAttribute(
      'data-tested-out',
      'false',
    )
    await page.getByTestId('tab-home').click()
    expect(await xpTotal(page)).toBe(0)
    await expect(page.getByTestId('placement-offer')).toHaveCount(0)
  })
})
