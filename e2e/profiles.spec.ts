// Deliberately NOT from './fixtures': this spec is the one that must see the
// real first-run experience, with no profile pre-seeded.
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { ALL_LESSONS } from '../src/content/units'
import { XP_LESSON, XP_QUIZ_ITEM } from '../src/core/gamification/xp'
import { MAX_PROFILES } from '../src/core/storage/profiles'

const LESSON = ALL_LESSONS[0]
const QUESTIONS = LESSON.quiz.length
const CARDS = LESSON.cardSeeds.length

const DAY = '2026-06-01'
const SHOTS = 'test-results/screens'

async function setClock(page: Page, day: string): Promise<void> {
  await page.addInitScript((d: string) => {
    ;(window as unknown as { __TEST_CLOCK__: unknown }).__TEST_CLOCK__ = {
      today: d,
      now: `${d}T15:30:00.000Z`,
    }
  }, day)
}

/** Dismiss any celebration overlays so the next tap lands. */
async function clearCelebrations(page: Page): Promise<void> {
  const overlay = page.getByTestId('celebration')
  for (let i = 0; i < 6; i++) {
    if (!(await overlay.isVisible())) return
    await overlay.click()
    await page.waitForTimeout(150)
  }
  await expect(overlay).toBeHidden()
}

/** Fill the new-profile form and land on Home as that profile. */
async function createProfile(page: Page, name: string, emoji: string): Promise<void> {
  await page.getByTestId('profile-new').click()
  await page.getByTestId('profile-name-input').fill(name)
  await page.getByTestId('emoji-option').filter({ hasText: emoji }).click()
  await expect(page.getByTestId('profile-preview-emoji')).toHaveText(emoji)
  await page.getByTestId('profile-save').click()
  // Selecting reloads the app at the deploy base, so wait for Home to be back.
  await expect(page.getByRole('heading', { name: /today.s quest/i })).toBeVisible()
}

/**
 * Earn a known amount of XP: page through the first lesson's blocks, answer
 * every quiz item correctly, then leave the completion screen.
 */
const LESSON_XP = XP_LESSON + XP_QUIZ_ITEM * QUESTIONS

async function completeFirstLesson(page: Page): Promise<void> {
  await page.getByTestId('cta-lesson').click()
  await expect(page).toHaveURL(new RegExp(`/lesson/${LESSON.id}$`))

  for (let i = 0; i < 40; i++) {
    if (await page.getByTestId('quiz-prompt').isVisible()) break
    await page.getByTestId('next-btn').click()
  }
  for (const item of LESSON.quiz) {
    await page.getByTestId('quiz-choice').nth(item.answerIdx).click()
    await expect(page.getByTestId('quiz-feedback')).toBeVisible()
    await page.getByTestId('next-btn').click()
  }
  await expect(page.getByTestId('lesson-complete')).toBeVisible()
  await page.getByTestId('summary-done').click()
  await clearCelebrations(page)
  await page.getByTestId('tab-home').click()
  await expect(page.getByRole('heading', { name: /today.s quest/i })).toBeVisible()
}

test.describe('profiles', () => {
  test('picker on first run, isolated state per profile, delete frees the slot', async ({
    page,
  }) => {
    await setClock(page, DAY)

    // ── First run lands on the picker, not on Home ──
    await page.goto('/')
    await expect(page).toHaveURL(/\/profiles$/)
    const picker = page.getByTestId('profile-picker')
    await expect(picker).toBeVisible()
    await expect(page.getByRole('heading', { name: /who.s playing/i })).toBeVisible()
    await expect(page.getByTestId('profile-card')).toHaveCount(0)
    await expect(page.getByTestId('profile-new')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/profiles-empty.png` })

    // ── The create form ──
    await page.getByTestId('profile-new').click()
    await expect(page.getByTestId('emoji-option')).toHaveCount(12)
    await page.getByTestId('profile-name-input').fill('Greg')
    await page.getByTestId('emoji-option').filter({ hasText: '📈' }).click()
    await page.screenshot({ path: `${SHOTS}/profiles-create.png` })

    // An empty name is refused rather than creating a nameless profile.
    await page.getByTestId('profile-name-input').fill('')
    await page.getByTestId('profile-save').click()
    await expect(page.getByTestId('profile-error')).toBeVisible()

    await page.getByTestId('profile-name-input').fill('Greg')
    await page.getByTestId('profile-save').click()

    // ── Greg starts empty ──
    await expect(page.getByRole('heading', { name: /today.s quest/i })).toBeVisible()
    await expect(page.getByTestId('xp-total')).toHaveText('0 XP')
    await expect(page.getByTestId('streak-count')).toHaveText('0')
    await expect(page.locator('header')).toContainText('Greg')
    await expect(page.getByTestId('profile-chip')).toHaveText('📈')

    // ── Greg earns XP ──
    await completeFirstLesson(page)
    await expect(page.getByTestId('xp-total')).toHaveText(`${LESSON_XP} XP`)

    // ── Switch profiles from the Home chip ──
    await page.getByTestId('profile-chip').click()
    await expect(page).toHaveURL(/\/profiles$/)
    await expect(page.getByTestId('profile-card')).toHaveCount(1)
    // The card previews Greg's progress without signing him in.
    await expect(page.getByTestId('profile-summary').first()).toContainText(`${LESSON_XP} XP`)
    await page.screenshot({ path: `${SHOTS}/profiles-populated.png` })

    // ── Ana is a clean slate ──
    await createProfile(page, 'Ana', '🚀')
    await expect(page.getByTestId('xp-total')).toHaveText('0 XP')
    await expect(page.getByTestId('streak-count')).toHaveText('0')
    await expect(page.locator('header')).toContainText('Ana')
    await expect(page.getByTestId('profile-chip')).toHaveText('🚀')
    // Nothing of Greg's leaked across.
    await page.getByTestId('tab-learn').click()
    await expect(page.getByTestId('unit-card').first()).toContainText('0 / 8 lessons')

    // ── Back to Greg: state intact ──
    await page.getByTestId('tab-home').click()
    await page.getByTestId('profile-chip').click()
    await expect(page.getByTestId('profile-card')).toHaveCount(2)
    await page
      .getByTestId('profile-card')
      .filter({ hasText: 'Greg' })
      .getByTestId('profile-enter')
      .click()
    await expect(page.getByTestId('xp-total')).toHaveText(`${LESSON_XP} XP`)
    await page.getByTestId('tab-learn').click()
    await expect(page.getByTestId('unit-card').first()).toContainText('1 / 8 lessons')
    await page.getByTestId('tab-home').click()

    // ── Delete Ana ──
    await page.getByTestId('profile-chip').click()
    await page
      .getByTestId('profile-card')
      .filter({ hasText: 'Ana' })
      .getByTestId('profile-edit')
      .click()
    await page.getByTestId('profile-delete').click()
    await expect(page.getByTestId('profile-delete-confirm')).toContainText('Ana')
    await page.getByTestId('profile-delete-confirm-btn').click()

    await expect(page.getByTestId('profile-card')).toHaveCount(1)
    await expect(page.getByTestId('profile-picker')).toContainText(
      `${MAX_PROFILES - 1} of ${MAX_PROFILES} slots free`,
    )

    // ── Greg is still the active profile across a reload ──
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /today.s quest/i })).toBeVisible()
    await expect(page.getByTestId('xp-total')).toHaveText(`${LESSON_XP} XP`)
    await expect(page.locator('header')).toContainText('Greg')
  })

  /**
   * Auto-save has no "save" button and no flush-on-exit hook, because there is
   * nothing buffered to flush: every action writes through at mutation time.
   * This proves it from the outside — act, reload cold, and the progress is
   * still there, in that profile's namespace and nowhere else.
   */
  test('auto-save: progress survives a bare reload, and only for its own profile', async ({
    page,
  }) => {
    await setClock(page, DAY)
    await page.goto('/')
    await createProfile(page, 'Greg', '📈')

    await completeFirstLesson(page)
    await expect(page.getByTestId('xp-total')).toHaveText(`${LESSON_XP} XP`)

    // ── One graded card: the smallest per-mutation write the store makes ──
    await page.getByTestId('tab-review').click()
    await expect(page.getByTestId('review-progress')).toHaveText(`1 of ${CARDS}`)
    await page.getByTestId('reveal-btn').click()
    await page.getByTestId('grade-good').click()
    await expect(page.getByTestId('review-progress')).toHaveText(`2 of ${CARDS}`)

    // ── Reload with no save, no navigation, no graceful exit ──
    await page.reload()
    // The graded card is scheduled for tomorrow, so one fewer is due — proof
    // the SM-2 state itself was written, not just the XP counter.
    await expect(page.getByTestId('review-progress')).toHaveText(`1 of ${CARDS - 1}`)
    await page.getByTestId('tab-home').click()
    await expect(page.getByTestId('xp-total')).toHaveText(`${LESSON_XP} XP`)

    // ── A second profile sees none of it ──
    await page.getByTestId('profile-chip').click()
    await createProfile(page, 'Ana', '🚀')
    await expect(page.getByTestId('xp-total')).toHaveText('0 XP')
    await page.getByTestId('tab-review').click()
    await expect(page.getByTestId('review-empty')).toBeVisible()

    // ── And Greg still has everything, exactly as he left it ──
    await page.getByTestId('tab-home').click()
    await page.getByTestId('profile-chip').click()
    await page
      .getByTestId('profile-card')
      .filter({ hasText: 'Greg' })
      .getByTestId('profile-enter')
      .click()
    await expect(page.getByTestId('xp-total')).toHaveText(`${LESSON_XP} XP`)
    await page.getByTestId('tab-review').click()
    await expect(page.getByTestId('review-progress')).toHaveText(`1 of ${CARDS - 1}`)
  })

  test('renaming and re-avatoring a profile sticks', async ({ page }) => {
    await setClock(page, DAY)
    await page.goto('/')
    await createProfile(page, 'Greg', '📈')

    await page.getByTestId('profile-chip').click()
    await page.getByTestId('profile-edit').first().click()
    await page.getByTestId('profile-name-input').fill('Gregory')
    await page.getByTestId('emoji-option').filter({ hasText: '🦊' }).click()
    await page.getByTestId('profile-save').click()

    await expect(page.getByTestId('profile-name')).toHaveText('Gregory')
    await page.getByTestId('profile-enter').click()
    await expect(page.getByTestId('profile-chip')).toHaveText('🦊')
    await expect(page.locator('header')).toContainText('Gregory')

    await page.reload()
    await expect(page.getByTestId('profile-chip')).toHaveText('🦊')
  })
})
