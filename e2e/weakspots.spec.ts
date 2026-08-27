// ─── Weak-spot targeting, end to end ─────────────────────────────────────────
// Miss questions on purpose, watch them collect, then fix one and watch the
// numbers move — through the Home row, the /weakspots session and /insights.
//
// The spec computes the re-asked choice order the same way the app does (it
// imports `reaskItem`), so "click the right answer" stays exact rather than
// hunting for the correct-looking button, and a change to the shuffle shows up
// here as a real failure instead of a spec that quietly clicks the wrong one.

import { expect, test } from './fixtures'
import type { Page } from '@playwright/test'
import type { QuizItem } from '../src/core/types'
import { ALL_LESSONS, getUnit } from '../src/content/units'
import { sampleUnitItems } from '../src/core/placement/engine'
import { XP_LESSON, XP_QUIZ_ITEM, XP_WEAKSPOT } from '../src/core/gamification/xp'
import { reaskItem } from '../src/core/weakspots/reask'
import { WEAKSPOT_HOME_THRESHOLD } from '../src/core/weakspots/session'

const SHOTS = 'test-results/screens'

const LESSON_A = ALL_LESSONS[0] // u01-l01
const LESSON_B = ALL_LESSONS[1] // u01-l02
const LESSON_C = ALL_LESSONS[2] // u01-l03

/** Let the fade-up animation finish, so a screenshot is not caught mid-fade. */
async function settle(page: Page): Promise<void> {
  await page.waitForTimeout(400)
}

/** Dismiss any celebration overlay so the next tap lands. */
async function clearCelebrations(page: Page): Promise<void> {
  const overlay = page.getByTestId('celebration')
  for (let i = 0; i < 8; i++) {
    if (!(await overlay.isVisible())) return
    await overlay.click()
    await page.waitForTimeout(150)
  }
  await expect(overlay).toBeHidden()
}

/** Page through the content blocks until the first question is on screen. */
async function pageToQuiz(page: Page): Promise<void> {
  for (let i = 0; i < 40; i++) {
    if (await page.getByTestId('quiz-prompt').isVisible()) return
    await page.getByTestId('next-btn').click()
  }
  throw new Error('never reached the quiz')
}

/**
 * Play one lesson, missing the first `wrong` questions and answering the rest
 * correctly. Leaves the learner on the completion screen.
 */
async function playLesson(page: Page, lesson: typeof LESSON_A, wrong: number): Promise<void> {
  await page.goto(`/lesson/${lesson.id}`)
  await pageToQuiz(page)
  for (let i = 0; i < lesson.quiz.length; i++) {
    const item = lesson.quiz[i]
    const pick = i < wrong ? (item.answerIdx + 1) % 4 : item.answerIdx
    await page.getByTestId('quiz-choice').nth(pick).click()
    await expect(page.getByTestId('quiz-feedback')).toBeVisible()
    await page.getByTestId('next-btn').click()
  }
  await expect(page.getByTestId('lesson-complete')).toBeVisible()
  await clearCelebrations(page)
  // The store persists optimistically — it never awaits IndexedDB (see the
  // note on `write` in useAppStore). Every step below reaches the next screen
  // with a full `page.goto`, which reloads the app and re-reads what actually
  // landed, so the spec gives the last put of the lesson a moment first. A real
  // learner cannot navigate in the same millisecond as their last tap.
  await settle(page)
}

/** Answer the re-asked question on screen; `correct` decides which choice. */
async function answerReask(page: Page, item: QuizItem, correct: boolean): Promise<void> {
  const reasked = reaskItem(item)
  await expect(page.getByTestId('quiz-prompt')).toHaveText(item.prompt)
  await expect(page.getByTestId('quiz-choice')).toHaveCount(4)
  // The four buttons carry the shuffled order, not the authored one. Each one
  // renders its A–D badge before the text, so that leading letter comes off.
  const rendered = (await page.getByTestId('quiz-choice').allTextContents()).map((t) =>
    t.replace(/^[A-D]/, ''),
  )
  expect(rendered).toEqual(reasked.choices)

  const pick = correct ? reasked.answerIdx : (reasked.answerIdx + 1) % 4
  await page.getByTestId('quiz-choice').nth(pick).click()

  const feedback = page.getByTestId('quiz-feedback')
  await expect(feedback).toBeVisible()
  await expect(feedback).toHaveAttribute('data-correct', String(correct))
  // The whole point: the explanation shows either way. This is remediation.
  await expect(page.getByTestId('quiz-explain')).toBeVisible()
}

async function xpTotal(page: Page): Promise<number> {
  const text = (await page.getByTestId('xp-total').textContent()) ?? ''
  return Number(text.replace(/[^0-9]/g, ''))
}

/** Questions deliberately missed in each of the first two lessons. */
const MISS_A = 2
const MISS_B = 2

test.describe('weak-spot targeting', () => {
  test('missed questions collect, surface on Home, and get fixed in a session', async ({ page }) => {
    const missedA = LESSON_A.quiz.slice(0, MISS_A)
    const missedB = LESSON_B.quiz.slice(0, MISS_B)
    // Everything was missed today, so the queue's oldest-first order is item-id
    // order — lesson A's questions, then lesson B's.
    const bankOrder = [...missedA, ...missedB]

    // ── Lesson A: miss the first two ──
    await playLesson(page, LESSON_A, MISS_A)

    // Two misses is below the threshold — Home stays quiet. A row that appeared
    // after a single bad answer would be noise, not help.
    expect(missedA.length).toBeLessThan(WEAKSPOT_HOME_THRESHOLD)
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /today.s quest/i })).toBeVisible()
    await expect(page.getByTestId('home-weakspots')).toHaveCount(0)

    // ── Lesson B: two more misses cross the threshold ──
    await playLesson(page, LESSON_B, MISS_B)
    await page.goto('/')
    const row = page.getByTestId('home-weakspots')
    await expect(row).toBeVisible()
    await expect(row).toContainText('Fix my weak spots')
    await expect(row).toContainText(`${bankOrder.length} queued`)
    await page.screenshot({ path: `${SHOTS}/40-home-weakspots-row.png`, fullPage: true })

    // ── The session ──
    await row.click()
    await expect(page).toHaveURL(/\/weakspots$/)
    await expect(page.getByTestId('weakspot-miss')).toHaveAttribute('data-item', bankOrder[0].id)

    // First one: right. It resolves, pays XP_WEAKSPOT, and still explains.
    await answerReask(page, bankOrder[0], true)
    await expect(page.getByTestId('quiz-feedback')).toContainText(`+${XP_WEAKSPOT} XP`)
    await settle(page)
    await page.screenshot({ path: `${SHOTS}/41-weakspot-reask-explain.png`, fullPage: true })
    await page.getByTestId('next-btn').click()

    // Second one: wrong again — the record stays open and its counter climbs.
    await expect(page.getByTestId('weakspot-miss')).toHaveAttribute('data-item', bankOrder[1].id)
    await answerReask(page, bankOrder[1], false)
    await page.getByTestId('next-btn').click()

    // The rest: wrong too, so the bank keeps enough work to stay on Home.
    for (let i = 2; i < bankOrder.length; i++) {
      await expect(page.getByTestId('weakspot-miss')).toHaveAttribute('data-item', bankOrder[i].id)
      await answerReask(page, bankOrder[i], false)
      await page.getByTestId('next-btn').click()
    }

    // ── End screen ──
    const complete = page.getByTestId('weakspots-complete')
    await expect(complete).toBeVisible()
    await expect(complete).toContainText('1 weak spot fixed')
    await expect(page.getByTestId('weakspot-xp')).toHaveText(`+${XP_WEAKSPOT} XP`)
    await expect(page.getByTestId('weakspot-remaining')).toHaveText(String(bankOrder.length - 1))

    const delta = page.locator('[data-testid="weakspot-unit-delta"][data-unit="u01"]')
    await expect(delta).toHaveAttribute('data-before', String(bankOrder.length))
    await expect(delta).toHaveAttribute('data-after', String(bankOrder.length - 1))
    await clearCelebrations(page)
    await settle(page)
    await page.screenshot({ path: `${SHOTS}/42-weakspot-complete.png`, fullPage: true })

    // ── Home: the XP landed, and the row still has work in it ──
    const rightSoFar = LESSON_A.quiz.length - MISS_A + (LESSON_B.quiz.length - MISS_B)
    const expectedXp = 2 * XP_LESSON + XP_QUIZ_ITEM * rightSoFar + XP_WEAKSPOT
    await page.getByTestId('weakspots-home').click()
    await expect(page).toHaveURL(/\/$/)
    expect(await xpTotal(page)).toBe(expectedXp)
    await expect(page.getByTestId('home-weakspots')).toContainText(
      `${bankOrder.length - 1} queued`,
    )

    // ── It survives a reload ──
    await page.reload()
    await expect(page.getByTestId('home-weakspots')).toContainText(`${bankOrder.length - 1} queued`)
    expect(await xpTotal(page)).toBe(expectedXp)

    // …and the second miss really did increment: a fresh session opens on it,
    // now marked as missed twice.
    await page.getByTestId('home-weakspots').click()
    const step = page.getByTestId('weakspot-miss')
    await expect(step).toHaveAttribute('data-item', bankOrder[1].id)
    await expect(step).toContainText('missed 2×')
    // The one that was fixed is gone from the queue entirely.
    await expect(page.getByTestId('weakspots-exit')).toBeVisible()
    await page.goto('/')

    // ── The breakdown ──
    // One clean lesson first, so the accuracy bar is a real number rather than
    // a flat 0 % — and so the spec proves first-try-correct answers feed it.
    await playLesson(page, LESSON_C, 0)

    await page.goto('/drill-stats')
    await page.getByTestId('drill-stats-insights-link').click()
    await expect(page).toHaveURL(/\/insights$/)

    const attempted = LESSON_A.quiz.length + LESSON_B.quiz.length + LESSON_C.quiz.length
    const missed = bankOrder.length
    const u01 = page.locator('[data-testid="insight-unit-row"][data-unit="u01"]')
    await expect(u01).toBeVisible()
    await expect(u01).toHaveAttribute('data-open', String(bankOrder.length - 1))
    await expect(u01).toContainText(`${missed}/${attempted} missed`)
    await expect(u01).toContainText(`${bankOrder.length - 1} to fix`)
    await expect(page.getByTestId('insight-tiles')).toContainText(
      `${Math.round(((attempted - missed) / attempted) * 100)}%`,
    )
    await settle(page)
    await page.screenshot({ path: `${SHOTS}/43-insights-by-unit.png`, fullPage: true })

    // The panel taps through to the session it is describing.
    await u01.click()
    await expect(page).toHaveURL(/\/weakspots$/)
  })

  test('placement misses feed the same bank, even if the test is abandoned', async ({ page }) => {
    const items = sampleUnitItems(getUnit('u01')!)

    await page.goto('/placement')
    await page.getByTestId('placement-start').click()
    // Every one wrong. The test still says nothing about correctness — the
    // recording is silent, which is what keeps the exam an exam.
    for (const item of items) {
      await expect(page.getByTestId('quiz-prompt')).toHaveText(item.prompt)
      await expect(page.getByTestId('quiz-explain')).toHaveCount(0)
      await page.getByTestId('quiz-choice').nth((item.answerIdx + 1) % 4).click()
      await page.getByTestId('placement-next').click()
    }
    await expect(page.getByTestId('placement-interstitial')).toBeVisible()

    // Walk away without applying anything: the misses are already banked.
    await page.goto('/')
    await expect(page.getByTestId('home-weakspots')).toContainText(`${items.length} queued`)

    await page.getByTestId('home-weakspots').click()
    const first = page.getByTestId('weakspot-miss')
    await expect(first).toBeVisible()
    // Placement samples one item per lesson, so the queue's first is the
    // lowest item id of the five it asked.
    const expected = [...items].map((i) => i.id).sort()[0]
    await expect(first).toHaveAttribute('data-item', expected)
  })

  test('an untouched profile is told there is nothing to fix', async ({ page }) => {
    await page.goto('/weakspots')
    await expect(page.getByTestId('weakspots-empty')).toBeVisible()
    await page.getByTestId('weakspots-insights-link').click()
    await expect(page).toHaveURL(/\/insights$/)
    await expect(page.getByTestId('insights-empty')).toBeVisible()
  })
})
