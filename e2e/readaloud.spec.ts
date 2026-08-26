// ─── Read aloud ──────────────────────────────────────────────────────────────
// Web Speech has no headless implementation, so the spec installs its own
// engine before the app boots: a mock that records every utterance and fires
// `onend` a tick later. That does two jobs at once — it captures exactly what
// the app tried to say, and it makes hands-free auto-advance (which is driven
// by `onend`) something a test can actually observe.
//
// The mock lives here rather than in fixtures.ts because it is the subject of
// this one spec; every other spec should keep running against a browser with no
// speech engine at all, which is also the honest default.

import { expect, test } from './fixtures'
import type { Page } from '@playwright/test'
import { ALL_LESSONS } from '../src/content/units'
import { speakableFromMarkdown, speakableQuiz } from '../src/core/speech/text'

const LESSON = ALL_LESSONS[0]

declare global {
  interface Window {
    __TTS_LOG__?: string[]
    /** Freezes the mock mid-utterance, so "is speaking" stops being a race. */
    __TTS_HOLD__?: boolean
  }
}

/**
 * A stand-in speech engine.
 *
 * Deliberately faithful about the two behaviours the app depends on:
 * `cancel()` drops the queue without firing `onend` (so a cancelled utterance
 * can never advance the lesson), and every spoken chunk ends asynchronously.
 */
async function installSpeechMock(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const log: string[] = []
    window.__TTS_LOG__ = log

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
        if (window.__TTS_HOLD__) return
        const next = queue.shift()
        next?.onend?.()
        pump()
      }, 20)
    }

    const synth = {
      speaking: false,
      pending: false,
      paused: false,
      speak(u: MockUtterance) {
        log.push(u.text)
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
      pause() {
        this.paused = true
      },
      resume() {
        this.paused = false
      },
      getVoices: () => [],
      addEventListener() {},
      removeEventListener() {},
    }

    Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true })
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: MockUtterance,
      configurable: true,
      writable: true,
    })
  })
}

/** Everything the app has tried to say, oldest first. */
function log(page: Page): Promise<string[]> {
  return page.evaluate(() => window.__TTS_LOG__ ?? [])
}

/** Chunks are re-joined with a space, which is exactly how they were split. */
async function heard(page: Page): Promise<string> {
  return (await log(page)).join(' ')
}

async function clearLog(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (window.__TTS_LOG__) window.__TTS_LOG__.length = 0
  })
}

/**
 * Read one key straight out of the app's IndexedDB store.
 *
 * Persistence is write-through and un-awaited — `write()` in useAppStore fires
 * the put and returns — so a spec that reloads the instant a toggle is tapped
 * can legitimately beat the write to disk. Poll the real bytes rather than
 * guess at a timeout.
 */
function persistedSettings(page: Page): Promise<unknown> {
  return page.evaluate(
    () =>
      new Promise((resolve) => {
        const req = indexedDB.open('tickerquest')
        req.onsuccess = () => {
          const db = req.result
          if (!db.objectStoreNames.contains('kv')) return resolve(null)
          const read = db.transaction('kv', 'readonly').objectStore('kv').get('p1:tq.v1.settings')
          read.onsuccess = () => resolve(read.result ?? null)
          read.onerror = () => resolve(null)
        }
        req.onerror = () => resolve(null)
      }),
  )
}

/** Open the edit panel for the auto-created test profile. */
async function openProfileEditor(page: Page): Promise<void> {
  await page.goto('/profiles')
  await expect(page.getByTestId('profile-picker')).toBeVisible()
  await page.getByTestId('profile-edit').first().click()
  await expect(page.getByTestId('readaloud-section')).toBeVisible()
}

async function backToApp(page: Page): Promise<void> {
  await page.getByTestId('profile-back').click()
  await page.getByTestId('profile-cancel').click()
  await expect(page).toHaveURL(/\/$/)
}

async function openFirstLesson(page: Page): Promise<void> {
  await page.getByTestId('tab-learn').click()
  await page.getByTestId('lesson-link').first().click()
  await expect(page).toHaveURL(new RegExp(`/lesson/${LESSON.id}$`))
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('read aloud', () => {
  test.beforeEach(async ({ page }) => {
    await installSpeechMock(page)
  })

  test('is off until the owner turns it on, and remembers the choice', async ({ page }) => {
    await openProfileEditor(page)

    const section = page.getByTestId('readaloud-section')
    await expect(section).toHaveAttribute('data-enabled', 'false')
    // The rate control only exists once there is something to set the rate of.
    await expect(page.getByTestId('readaloud-rate')).toHaveCount(0)
    // One line of safety copy, and no lecture.
    await expect(page.getByTestId('readaloud-note')).toContainText(
      'Listen mode reads lessons hands-free. Stay attentive to your surroundings.',
    )

    // Nothing has been spoken, because nothing asked for it.
    expect(await log(page)).toEqual([])

    await page.getByTestId('readaloud-toggle').click()
    await expect(section).toHaveAttribute('data-enabled', 'true')
    await expect(page.getByTestId('readaloud-rate-option')).toHaveCount(4)

    await page.getByTestId('readaloud-rate-option').filter({ hasText: '1.2' }).click()
    await expect(
      page.locator('[data-testid="readaloud-rate-option"][data-rate="1.2"]'),
    ).toHaveAttribute('aria-pressed', 'true')

    // It lands in this profile's own namespace, as bytes on disk…
    await expect.poll(() => persistedSettings(page)).toEqual({
      readAloud: { enabled: true, rate: 1.2 },
    })

    // …so a cold start reads it back.
    await openProfileEditor(page)
    await expect(page.getByTestId('readaloud-section')).toHaveAttribute('data-enabled', 'true')
    await expect(
      page.locator('[data-testid="readaloud-rate-option"][data-rate="1.2"]'),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  test('reads a lesson hands-free, and stops when told to', async ({ page }) => {
    await openProfileEditor(page)
    await page.getByTestId('readaloud-toggle').click()
    await expect(page.getByTestId('readaloud-section')).toHaveAttribute('data-enabled', 'true')
    await backToApp(page)

    await clearLog(page)
    await openFirstLesson(page)

    // ── The first block is spoken on arrival, with the markdown stripped out ──
    const firstBlock = speakableFromMarkdown(LESSON.blocks[0].md)
    await expect.poll(() => heard(page), { timeout: 15_000 }).toContain(firstBlock)

    const spoken = await log(page)
    expect(spoken.length).toBeGreaterThan(0)
    for (const utterance of spoken) {
      expect(utterance).not.toContain('**')
      expect(utterance).not.toContain('`')
      expect(utterance).not.toContain('$')
    }

    await expect(page.getByTestId('tts-toggle')).toHaveAttribute('aria-pressed', 'true')

    // ── Auto-advance: page two arrives without anyone tapping Next ──
    const secondBlock = speakableFromMarkdown(LESSON.blocks[1].md)
    await expect.poll(() => heard(page), { timeout: 20_000 }).toContain(secondBlock)
    // …and it is genuinely the next page, not just the next utterance.
    await expect(page.getByTestId('content-block')).toContainText(
      LESSON.blocks[1].md.replace(/[*`_#]/g, '').trim().slice(0, 24),
    )

    // ── Quiz: prompt plus four lettered options, then a spoken verdict ──
    while (!(await page.getByTestId('quiz-prompt').isVisible())) {
      await page.getByTestId('next-btn').click()
    }

    const quiz = speakableQuiz(LESSON.quiz[0])
    await expect.poll(() => heard(page), { timeout: 15_000 }).toContain(quiz.question)
    await expect.poll(() => heard(page), { timeout: 15_000 }).toContain(quiz.choices[3])

    // A quiz never advances itself — the answer needs a tap.
    await page.waitForTimeout(1500)
    await expect(page.getByTestId('quiz-prompt')).toBeVisible()

    await clearLog(page)
    await page.getByTestId('quiz-choice').nth(LESSON.quiz[0].answerIdx).click()
    await expect(page.getByTestId('quiz-feedback')).toBeVisible()
    await expect.poll(() => heard(page), { timeout: 15_000 }).toContain('Correct!')
    await expect
      .poll(() => heard(page), { timeout: 15_000 })
      .toContain(speakableFromMarkdown(LESSON.quiz[0].explain))

    // ── Off from the header: the next page is silent ──
    await page.getByTestId('tts-toggle').click()
    await expect(page.getByTestId('tts-toggle')).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByTestId('tts-playpause')).toHaveCount(0)

    await clearLog(page)
    await page.getByTestId('next-btn').click()
    await page.waitForTimeout(1500)
    expect(await log(page)).toEqual([])

    // And the page still turned by hand, exactly as it did before listen mode:
    // either the next question or the completion panel is on screen.
    await expect(
      page.getByTestId('quiz-prompt').or(page.getByTestId('lesson-complete')),
    ).toBeVisible()
  })

  test('leaving the lesson silences it', async ({ page }) => {
    await openProfileEditor(page)
    await page.getByTestId('readaloud-toggle').click()
    await backToApp(page)
    await openFirstLesson(page)

    await expect.poll(() => heard(page), { timeout: 15_000 }).not.toBe('')

    await page.getByTestId('lesson-exit').click()
    await expect(page).toHaveURL(/\/learn$/)
    await clearLog(page)
    await page.waitForTimeout(1500)
    expect(await log(page)).toEqual([])
  })

  test('offers pause and resume while a lesson is playing', async ({ page }) => {
    // Hold the mock mid-utterance: without it the whole lesson plays out in
    // milliseconds and "currently speaking" is a race no assertion can win.
    await page.addInitScript(() => {
      window.__TTS_HOLD__ = true
    })

    await openProfileEditor(page)
    await page.getByTestId('readaloud-toggle').click()
    await backToApp(page)
    await openFirstLesson(page)

    const playPause = page.getByTestId('tts-playpause')
    await expect(playPause).toBeVisible()
    await expect(playPause).toHaveAttribute('aria-label', 'Pause reading')

    await playPause.click()
    await expect(playPause).toHaveAttribute('aria-label', 'Resume reading')
    await playPause.click()
    await expect(playPause).toHaveAttribute('aria-label', 'Pause reading')

    // Nothing turns the page while the voice is still on the first block.
    const block = page.getByTestId('content-block')
    const before = await block.textContent()
    await page.waitForTimeout(1500)
    expect(await block.textContent()).toBe(before)

    // Turning listen mode off takes the pause control with it.
    await page.getByTestId('tts-toggle').click()
    await expect(playPause).toHaveCount(0)
  })

  test('reads a review card, front then back', async ({ page }) => {
    // Finish a lesson with listen mode off, so there is a review queue and a
    // clean log to assert against.
    await page.goto('/')
    await openFirstLesson(page)
    for (let i = 0; i < 40; i++) {
      if (await page.getByTestId('lesson-complete').isVisible()) break
      if (await page.getByTestId('quiz-choice').first().isVisible()) {
        await page.getByTestId('quiz-choice').first().click()
      }
      await page.getByTestId('next-btn').click()
    }
    await expect(page.getByTestId('lesson-complete')).toBeVisible()

    await openProfileEditor(page)
    await page.getByTestId('readaloud-toggle').click()
    await expect(page.getByTestId('readaloud-section')).toHaveAttribute('data-enabled', 'true')
    await backToApp(page)

    await clearLog(page)
    await page.getByTestId('tab-review').click()
    await expect(page.getByTestId('card-front')).toBeVisible()

    // The front is rendered as plain text, so it is exactly the authored seed.
    const front = await page.getByTestId('card-front').innerText()
    await expect
      .poll(() => heard(page), { timeout: 15_000 })
      .toContain(speakableFromMarkdown(front).slice(0, 40))

    await clearLog(page)
    await page.getByTestId('reveal-btn').click()
    await expect(page.getByTestId('card-back')).toBeVisible()
    await expect.poll(() => heard(page), { timeout: 15_000 }).not.toBe('')

    // Grading stays a deliberate tap: only the learner knows if they recalled it.
    await expect(page.getByTestId('grade-buttons')).toBeVisible()
  })
})

test.describe('read aloud without a speech engine', () => {
  test('says so, and offers nothing that cannot work', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true })
    })

    await openProfileEditor(page)
    await expect(page.getByTestId('readaloud-unsupported')).toBeVisible()
    await expect(page.getByTestId('readaloud-toggle')).toBeDisabled()

    await backToApp(page)
    await openFirstLesson(page)
    // No dead control in the lesson header either.
    await expect(page.getByTestId('tts-toggle')).toHaveCount(0)
    await expect(page.getByTestId('content-block')).toBeVisible()
  })
})
