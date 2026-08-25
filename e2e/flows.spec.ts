// `test` comes from the shared fixture, which pre-seeds a throwaway profile so
// this spec still sees the app at '/' — see e2e/fixtures.ts.
import { expect, test } from './fixtures'
import type { Page } from '@playwright/test'
// The curriculum and the XP table are plain data, so the spec can assert exact
// numbers instead of "greater than zero".
import { ALL_LESSONS } from '../src/content/units'
import {
  XP_LESSON,
  XP_PER_CARD,
  XP_QUIZ_ITEM,
  XP_REVIEW_SESSION,
} from '../src/core/gamification/xp'

const LESSON = ALL_LESSONS[0]
const CARDS = LESSON.cardSeeds.length
const QUESTIONS = LESSON.quiz.length

/** Page through every content block; returns how many were shown. */
async function pageThroughBlocks(page: Page): Promise<number> {
  let blocks = 0
  for (let i = 0; i < 40; i++) {
    if (await page.getByTestId('quiz-prompt').isVisible()) break
    await expect(page.getByTestId('content-block')).toBeVisible()
    blocks++
    await page.getByTestId('next-btn').click()
  }
  return blocks
}

/** Tap `choice`, assert the feedback + explanation panel, then continue. */
async function answerQuestion(page: Page, choice: number, expectCorrect: boolean): Promise<void> {
  const choices = page.getByTestId('quiz-choice')
  await expect(choices).toHaveCount(4)
  await choices.nth(choice).click()

  const feedback = page.getByTestId('quiz-feedback')
  await expect(feedback).toBeVisible()
  await expect(feedback).toHaveAttribute('data-correct', String(expectCorrect))
  await expect(page.getByTestId('quiz-explain')).toBeVisible()
  // Either way the learner is shown which answer was right.
  await expect(page.locator('[data-testid="quiz-choice"][data-state="correct"], [data-testid="quiz-choice"][data-state="revealed"]')).toHaveCount(1)

  await page.getByTestId('next-btn').click()
}

test.describe('day-one flow', () => {
  test('lesson → quiz → review → streak, and it survives a reload', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /today.s quest/i })).toBeVisible()
    await expect(page.getByTestId('streak-count')).toHaveText('0')

    // ── Learn → first lesson ──
    await page.getByTestId('tab-learn').click()
    await expect(page).toHaveURL(/\/learn$/)

    await expect(page.getByTestId('unit-card').first()).toHaveAttribute('data-locked', 'false')
    // Unit 2 stays locked until 80% of unit 1 is done.
    await expect(page.getByTestId('unit-card').nth(1)).toHaveAttribute('data-locked', 'true')

    const firstLesson = page.getByTestId('lesson-link').first()
    await expect(firstLesson).toHaveAttribute('data-lesson', LESSON.id)
    await firstLesson.click()
    await expect(page).toHaveURL(new RegExp(`/lesson/${LESSON.id}$`))

    // ── Content blocks ──
    expect(await pageThroughBlocks(page)).toBe(LESSON.blocks.length)

    // ── Quiz: get the first one deliberately wrong, the rest right ──
    for (let i = 0; i < QUESTIONS; i++) {
      const item = LESSON.quiz[i]
      const wrongIdx = (item.answerIdx + 1) % 4
      const pickWrong = i === 0
      await answerQuestion(page, pickWrong ? wrongIdx : item.answerIdx, !pickWrong)
    }
    const firstTryCorrect = QUESTIONS - 1

    // ── Completion screen ──
    await expect(page.getByTestId('lesson-complete')).toBeVisible()
    await expect(page.getByTestId('cards-minted')).toHaveText(String(CARDS))

    // ── Review the freshly minted cards ──
    await page.getByTestId('summary-review').click()
    await expect(page).toHaveURL(/\/review$/)
    await expect(page.getByTestId('review-progress')).toHaveText(`1 of ${CARDS}`)

    for (let i = 0; i < CARDS; i++) {
      await expect(page.getByTestId('review-progress')).toHaveText(`${i + 1} of ${CARDS}`)
      await expect(page.getByTestId('card-front')).toBeVisible()
      await page.getByTestId('reveal-btn').click()
      await expect(page.getByTestId('card-back')).toBeVisible()
      await page.getByTestId('grade-good').click()
    }
    await expect(page.getByTestId('review-complete')).toBeVisible()

    // ── Home reflects the day ──
    const expectedXp =
      XP_LESSON +
      XP_QUIZ_ITEM * firstTryCorrect +
      XP_REVIEW_SESSION +
      XP_PER_CARD * CARDS

    await page.getByTestId('tab-home').click()
    await expect(page.getByTestId('streak-count')).toHaveText('1')
    await expect(page.getByTestId('xp-total')).toHaveText(`${expectedXp} XP`)
    // The first lesson earns the "First Steps" badge.
    await expect(page.getByTestId('badge-strip')).toBeVisible()

    // ── Persistence across a reload ──
    await page.reload()
    await expect(page.getByTestId('streak-count')).toHaveText('1')
    await expect(page.getByTestId('xp-total')).toHaveText(`${expectedXp} XP`)

    // Nothing is due again today, and the lesson is marked done.
    await page.getByTestId('tab-review').click()
    await expect(page.getByTestId('review-empty')).toBeVisible()
    await page.getByTestId('tab-learn').click()
    await expect(page.getByTestId('unit-card').first()).toContainText('1 / 8 lessons')
  })
})
