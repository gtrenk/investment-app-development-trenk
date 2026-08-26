// ─── Smart Session ───────────────────────────────────────────────────────────
// The one-tap daily flow: due reviews → today's lesson(s) → today's drill, with
// no trip back to the tab bar in between, and a pace that decides how many
// lessons "today's lesson(s)" means.

import { expect, test } from './fixtures'
import type { Page } from '@playwright/test'
import { ALL_LESSONS } from '../src/content/units'

const L1 = ALL_LESSONS[0]
const L2 = ALL_LESSONS[1]

/** A fixed day, so the drill of the day and the queue are the same every run. */
const DAY = '2026-03-10'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ([today]) => {
      ;(window as unknown as { __TEST_CLOCK__: unknown }).__TEST_CLOCK__ = {
        today,
        now: `${today}T09:00:00.000Z`,
      }
    },
    [DAY],
  )
})

// ── Helpers ──────────────────────────────────────────────────────────────────

async function setPace(page: Page, value: 1 | 2 | 3): Promise<void> {
  await page.goto('/profiles')
  await page.getByTestId('profile-edit').first().click()
  await expect(page.getByTestId('pace-section')).toBeVisible()
  await page.locator(`[data-testid="pace-option"][data-value="${value}"]`).click()
  await expect(page.getByTestId('pace-section')).toHaveAttribute('data-pace', String(value))
  await page.getByTestId('profile-back').click()
  await page.getByTestId('profile-cancel').click()
  await expect(page).toHaveURL(/\/$/)
}

/** Page through a lesson: blocks, then any quiz, to the completion panel. */
async function playLesson(page: Page): Promise<void> {
  for (let i = 0; i < 60; i++) {
    if (await page.getByTestId('lesson-complete').isVisible()) break
    if (await page.getByTestId('quiz-choice').first().isVisible()) {
      await page.getByTestId('quiz-choice').first().click()
    }
    await page.getByTestId('next-btn').click()
  }
  await expect(page.getByTestId('lesson-complete')).toBeVisible()
}

/** Answer whichever of the three drill kinds today's rotation picked. */
async function playDrill(page: Page): Promise<void> {
  await expect(page.getByTestId('drill-question')).toBeVisible()
  await page.getByTestId('drill-choice').first().click()
  if (await page.getByTestId('confidence-choice').first().isVisible()) {
    await page.getByTestId('confidence-choice').first().click()
  }
  await page.getByTestId('drill-continue').click()
  await expect(page.getByTestId('drill-done')).toBeVisible()
}

/** Grade the whole review queue "Good". */
async function playReviews(page: Page): Promise<void> {
  await expect(page.getByTestId('review-progress')).toBeVisible()
  for (let i = 0; i < 40; i++) {
    if (await page.getByTestId('review-complete').isVisible()) break
    await page.getByTestId('reveal-btn').click()
    await page.getByTestId('grade-good').click()
  }
  await expect(page.getByTestId('review-complete')).toBeVisible()
}

const railKinds = (page: Page) =>
  page.getByTestId('session-rail-step').evaluateAll((els) =>
    els.map((el) => el.getAttribute('data-kind')),
  )

// ── Pace ─────────────────────────────────────────────────────────────────────

test.describe('daily pace', () => {
  test('raises the lesson goal and quotes an honest finish date', async ({ page }) => {
    await page.goto('/profiles')
    await page.getByTestId('profile-edit').first().click()

    const section = page.getByTestId('pace-section')
    await expect(section).toBeVisible()
    // One lesson a day until the owner says otherwise.
    await expect(section).toHaveAttribute('data-pace', '1')

    // The estimate is the whole point of the control: three paces, three
    // honestly different calendars, computed from the lessons actually left.
    await expect(page.locator('[data-testid="pace-estimate"][data-value="1"]')).toContainText(
      '~6 months',
    )
    await expect(page.locator('[data-testid="pace-estimate"][data-value="2"]')).toContainText(
      '~3 months',
    )
    await expect(page.locator('[data-testid="pace-estimate"][data-value="3"]')).toContainText(
      '~2 months',
    )

    await page.locator('[data-testid="pace-option"][data-value="3"]').click()
    await expect(section).toHaveAttribute('data-pace', '3')

    // It is a preference like any other: it survives a cold start.
    await page.reload()
    await page.getByTestId('profile-edit').first().click()
    await expect(page.getByTestId('pace-section')).toHaveAttribute('data-pace', '3')

    await page.getByTestId('profile-back').click()
    await page.getByTestId('profile-cancel').click()

    // …and Home now asks for three lessons, not one.
    await expect(page.getByTestId('today-task').nth(1)).toContainText('Lessons 0/3')
  })
})

// ── The flow ─────────────────────────────────────────────────────────────────

test.describe('smart session', () => {
  test('chains lessons → drill → the cards they minted, and lands the goal', async ({ page }) => {
    await setPace(page, 2)

    // ── Home: one button for the whole day ──
    const cta = page.getByTestId('cta-session')
    await expect(cta).toBeVisible()
    await expect(cta).toContainText('Start today’s session')
    await expect(cta).toContainText('min')
    // Nothing is due on a fresh account, so the day is two lessons + the drill.
    await expect(cta).toHaveAttribute('data-steps', '3')
    await expect(cta).toContainText(L1.title)

    await cta.click()

    // ── Step 1: straight into the lesson, no navigation ──
    await expect(page).toHaveURL(new RegExp(`/lesson/${L1.id}$`))
    await expect(page.getByTestId('session-rail')).toBeVisible()
    expect(await railKinds(page)).toEqual(['lesson', 'lesson', 'drill'])
    await expect(page.getByTestId('session-rail-step').first()).toHaveAttribute(
      'data-current',
      'true',
    )

    await playLesson(page)

    // The completion panel points forward instead of back at the tab bar.
    const next = page.getByTestId('session-next')
    await expect(next).toContainText(`Next: ${L2.title}`)
    await expect(page.getByTestId('summary-review')).toBeHidden()
    await next.click()

    // ── Step 2: the rail has moved on ──
    await expect(page).toHaveURL(new RegExp(`/lesson/${L2.id}$`))
    await expect(page.getByTestId('session-rail-step').first()).toHaveAttribute('data-done', 'true')
    await expect(page.getByTestId('session-rail-step').nth(1)).toHaveAttribute(
      'data-current',
      'true',
    )

    await playLesson(page)
    await expect(next).toContainText('Next: Daily drill')
    await next.click()

    // ── Step 3: the drill ──
    await expect(page).toHaveURL(/\/drill$/)
    await playDrill(page)

    // ── The cards those two lessons minted are chained on the end ──
    await expect(next).toContainText('Next: Review')
    expect(await railKinds(page)).toEqual(['lesson', 'lesson', 'drill', 'review'])
    await next.click()
    await expect(page).toHaveURL(/\/review$/)
    await playReviews(page)

    // ── The finish line ──
    await expect(next).toContainText('Finish session')
    await next.click()
    await expect(page).toHaveURL(/\/session$/)
    await expect(page.getByTestId('session-complete')).toBeVisible()
    await expect(page.getByTestId('session-goal')).toHaveAttribute('data-met', 'true')
    await expect(page.getByTestId('session-streak')).toContainText('1')
    await expect(page.getByTestId('session-summary-steps').locator('li')).toHaveCount(4)

    // Every rail step is ticked.
    const done = await page
      .getByTestId('session-rail-step')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-done')))
    expect(done).toEqual(['true', 'true', 'true', 'true'])

    // Home agrees: goal met, streak 1, and there is nothing left to start.
    await page.getByTestId('session-home').click()
    await expect(page.getByTestId('streak-count')).toHaveText('1')
    await expect(page.getByTestId('cta-session')).toHaveCount(0)
    // Leaving the flow ended the session, so the rail is gone with it.
    await expect(page.getByTestId('session-rail')).toHaveCount(0)
  })

  test('a mid-day restart skips what is already done', async ({ page }) => {
    await setPace(page, 2)

    // Lesson one, the old way — from the Learn tab, no session involved.
    await page.getByTestId('tab-learn').click()
    await page.getByTestId('lesson-link').first().click()
    await expect(page).toHaveURL(new RegExp(`/lesson/${L1.id}$`))
    await playLesson(page)
    // Outside a session the panel is unchanged: no forward button at all.
    await expect(page.getByTestId('session-next')).toHaveCount(0)
    await expect(page.getByTestId('summary-review')).toBeVisible()

    // Out of the player the ordinary way — it has no tab bar of its own.
    await page.getByTestId('summary-done').click()

    // Back home, later. The lesson minted cards, so the replanned day is
    // "reviews, the *second* lesson, the drill" — lesson one is not in it.
    await page.getByTestId('tab-home').click()
    await expect(page.getByTestId('today-task').nth(1)).toContainText('Lessons 1/2')

    const cta = page.getByTestId('cta-session')
    await expect(cta).toHaveAttribute('data-steps', '3')
    await expect(cta).toContainText(L2.title)
    await expect(cta).not.toContainText(L1.title)
    await cta.click()

    expect(await railKinds(page)).toEqual(['review', 'lesson', 'drill'])
    await expect(page).toHaveURL(/\/review$/)
    await playReviews(page)

    // …and the lesson it hands over to is lesson two.
    await page.getByTestId('session-next').click()
    await expect(page).toHaveURL(new RegExp(`/lesson/${L2.id}$`))
  })

  test('leaving mid-session ends it cleanly, and starting again replans', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('cta-session').click()
    await expect(page.getByTestId('session-rail')).toBeVisible()

    // Out through the lesson's ✕ — no modal, no "are you sure".
    await page.getByTestId('lesson-exit').click()
    await expect(page).toHaveURL(/\/learn$/)
    await expect(page.getByTestId('session-rail')).toHaveCount(0)

    // Nothing was saved and nothing was lost: the same day is offered again.
    await page.getByTestId('tab-home').click()
    await expect(page.getByTestId('cta-session')).toHaveAttribute('data-steps', '2')
  })
})

// ── Hands-free ───────────────────────────────────────────────────────────────

test.describe('smart session with read aloud', () => {
  /** Minimal speech engine: enough for the toggle to exist and pages to turn. */
  async function installSpeechMock(page: Page): Promise<void> {
    await page.addInitScript(() => {
      class MockUtterance {
        text: string
        rate = 1
        voice: unknown = null
        onend: (() => void) | null = null
        onerror: (() => void) | null = null
        constructor(text: string) {
          this.text = text
        }
      }
      let queue: MockUtterance[] = []
      let timer: ReturnType<typeof setTimeout> | null = null
      const pump = () => {
        if (timer !== null || queue.length === 0) return
        timer = setTimeout(() => {
          timer = null
          queue.shift()?.onend?.()
          pump()
        }, 20)
      }
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: {
          speaking: false,
          pending: false,
          paused: false,
          speak(u: MockUtterance) {
            queue.push(u)
            pump()
          },
          cancel() {
            queue = []
            if (timer !== null) {
              clearTimeout(timer)
              timer = null
            }
          },
          pause() {},
          resume() {},
          getVoices: () => [],
          addEventListener() {},
          removeEventListener() {},
        },
      })
      Object.defineProperty(window, 'SpeechSynthesisUtterance', {
        configurable: true,
        writable: true,
        value: MockUtterance,
      })
    })
  }

  test('runs the whole chain without a tap between steps', async ({ page }) => {
    await installSpeechMock(page)

    await page.goto('/profiles')
    await page.getByTestId('profile-edit').first().click()
    await page.getByTestId('readaloud-toggle').click()
    await expect(page.getByTestId('readaloud-section')).toHaveAttribute('data-enabled', 'true')
    await page.getByTestId('profile-back').click()
    await page.getByTestId('profile-cancel').click()

    await page.getByTestId('cta-session').click()
    await expect(page).toHaveURL(new RegExp(`/lesson/${L1.id}$`))

    // Listen mode turns the pages; only the quiz still wants a thumb.
    for (let i = 0; i < 60; i++) {
      if (await page.getByTestId('lesson-complete').isVisible()) break
      if (await page.getByTestId('quiz-choice').first().isVisible()) {
        await page.getByTestId('quiz-choice').first().click()
        await page.getByTestId('next-btn').click()
      } else {
        await page.waitForTimeout(120)
      }
    }
    await expect(page.getByTestId('lesson-complete')).toBeVisible()

    // The forward button is armed to fire on its own…
    await expect(page.getByTestId('session-next')).toHaveAttribute('data-auto', 'true')
    // …and it does: the drill arrives with nothing clicked.
    await expect(page).toHaveURL(/\/drill$/, { timeout: 15_000 })
    await expect(page.getByTestId('session-rail-step').first()).toHaveAttribute('data-done', 'true')
  })
})
