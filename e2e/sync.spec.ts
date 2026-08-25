// ─── Cloud sync, end to end ──────────────────────────────────────────────────
// Not from './fixtures': this spec needs the real first-run picker, the same as
// e2e/profiles.spec.ts.
//
// The worker is mocked with page.route, which also lets the test *see* what the
// app sent — the debounced PUT assertion at the bottom is the only way to prove
// from the outside that a mutation reached the cloud without a manual save.
//
// The "second device" is the same browser with its IndexedDB deleted: from the
// app's point of view that is a cold install on a phone it has never met, which
// is exactly the situation a sync code exists for.

import { expect, test } from '@playwright/test'
import type { Page, Route } from '@playwright/test'
import { ALL_LESSONS } from '../src/content/units'
import { XP_LESSON, XP_QUIZ_ITEM } from '../src/core/gamification/xp'
import { SYNC_KEYS } from '../src/core/sync/keys'

const LESSON = ALL_LESSONS[0]
const LESSON_XP = XP_LESSON + XP_QUIZ_ITEM * LESSON.quiz.length
const DAY = '2026-06-01'
const SHOTS = 'test-results/screens'

/** The origin the app is told to sync against; every request to it is faked. */
const SYNC_ORIGIN = 'https://sync.test'

// ── The mock worker ──────────────────────────────────────────────────────────

interface Blob_ {
  data: unknown
  updatedAt: number
}

interface MockWorker {
  blobs: Map<string, Blob_>
  tokens: Map<string, string>
  /** Every accepted PUT, in order — what the debounce assertions read. */
  puts: Array<{ key: string; updatedAt: number; at: number }>
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'X-Sync-Token, Content-Type',
  'cache-control': 'no-store',
}

const ALLOWED = new Set(SYNC_KEYS)

async function installMockWorker(page: Page): Promise<MockWorker> {
  const worker: MockWorker = { blobs: new Map(), tokens: new Map(), puts: [] }

  const json = (route: Route, status: number, body: unknown) =>
    route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) })

  await page.route(new RegExp(`^${SYNC_ORIGIN}/`), async (route) => {
    const request = route.request()
    const method = request.method()
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })

    const url = new URL(request.url())
    const rest = decodeURIComponent(url.pathname.slice('/sync'.length).replace(/^\//, ''))
    const token = request.headers()['x-sync-token'] ?? ''
    if (!/^[0-9A-HJKMNP-TV-Z]{20}$/.test(token)) return json(route, 401, { error: 'Invalid sync code.' })
    const syncId = token.slice(0, 8)

    const claimed = worker.tokens.get(syncId)
    if (claimed === undefined) {
      if (method !== 'PUT') return json(route, 401, { error: 'Unknown sync code.' })
    } else if (claimed !== token) {
      return json(route, 401, { error: 'Sync code does not match this profile.' })
    }

    if (rest === '') {
      if (method !== 'DELETE') return json(route, 405, { error: 'Method not allowed.' })
      for (const key of [...worker.blobs.keys()]) {
        if (key.startsWith(`${syncId}:`)) worker.blobs.delete(key)
      }
      worker.tokens.delete(syncId)
      return json(route, 200, { ok: true })
    }

    if (rest === 'manifest') {
      const out: Record<string, number> = {}
      for (const [key, rec] of worker.blobs) {
        if (key.startsWith(`${syncId}:`)) out[key.slice(syncId.length + 1)] = rec.updatedAt
      }
      return json(route, 200, out)
    }

    if (!ALLOWED.has(rest)) return json(route, 400, { error: `Unknown sync key: ${rest}` })

    if (method === 'PUT') {
      const body = JSON.parse(request.postData() ?? '{}') as Blob_
      worker.tokens.set(syncId, token)
      worker.blobs.set(`${syncId}:${rest}`, { data: body.data, updatedAt: body.updatedAt })
      worker.puts.push({ key: rest, updatedAt: body.updatedAt, at: Date.now() })
      return json(route, 200, { ok: true })
    }

    const rec = worker.blobs.get(`${syncId}:${rest}`)
    if (!rec) return json(route, 404, { error: 'Not found.' })
    const since = Number(url.searchParams.get('since'))
    if (Number.isFinite(since) && since > 0 && rec.updatedAt <= since) {
      return route.fulfill({ status: 304, headers: CORS })
    }
    return json(route, 200, rec)
  })

  return worker
}

// ── Page helpers (mirrors of e2e/profiles.spec.ts) ───────────────────────────

async function bootstrap(page: Page): Promise<MockWorker> {
  await page.addInitScript(
    ([day, origin]: [string, string]) => {
      ;(window as unknown as { __TEST_CLOCK__: unknown }).__TEST_CLOCK__ = {
        today: day,
        now: `${day}T15:30:00.000Z`,
      }
      // The e2e build has no VITE_QUOTE_PROXY, so without this there would be
      // no sync origin at all to intercept. See src/state/clock.ts.
      ;(window as unknown as { __TEST_SYNC_BASE__: string }).__TEST_SYNC_BASE__ = origin
    },
    [DAY, SYNC_ORIGIN] as [string, string],
  )
  return installMockWorker(page)
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

async function createProfile(page: Page, name: string, emoji: string): Promise<void> {
  await page.getByTestId('profile-new').click()
  await page.getByTestId('profile-name-input').fill(name)
  await page.getByTestId('emoji-option').filter({ hasText: emoji }).click()
  await page.getByTestId('profile-save').click()
  await expect(page.getByRole('heading', { name: /today.s quest/i })).toBeVisible()
}

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

/** Wipe the browser's copy of everything — a factory-fresh second device. */
async function wipeDevice(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase('tickerquest')
        req.onsuccess = () => resolve()
        req.onerror = () => resolve()
        req.onblocked = () => resolve()
      }),
  )
  await page.goto('/')
}

/** How many blobs the mock worker holds for one sync code. */
function blobsFor(worker: MockWorker, code: string): number {
  const prefix = `${code.slice(0, 8)}:`
  return [...worker.blobs.keys()].filter((k) => k.startsWith(prefix)).length
}

/** The 20 characters, read out of the five on-screen groups. */
async function readSyncCode(page: Page): Promise<string> {
  const raw = (await page.getByTestId('sync-code').textContent()) ?? ''
  return raw.replace(/[^0-9A-Z]/g, '')
}

// ── The spec ─────────────────────────────────────────────────────────────────

test.describe('cloud sync', () => {
  test('a code carries a profile to a second device, and changes keep flowing', async ({
    page,
  }) => {
    const worker = await bootstrap(page)

    // ── Device one: a profile with real progress on it ──
    await page.goto('/')
    await createProfile(page, 'Greg', '📈')
    await completeFirstLesson(page)
    await expect(page.getByTestId('xp-total')).toHaveText(`${LESSON_XP} XP`)

    // Nothing has been sent: sync is off until the owner turns it on.
    expect(worker.puts).toHaveLength(0)
    await expect(page.getByTestId('sync-dot')).toHaveCount(0)

    // ── The off state ──
    await page.getByTestId('profile-chip').click()
    await page.getByTestId('profile-edit').first().click()
    const section = page.getByTestId('sync-section')
    await expect(section).toHaveAttribute('data-sync-state', 'off')
    await expect(page.getByTestId('sync-enable')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/sync-off.png`, fullPage: true })

    // ── Enable: the code appears and the whole profile is uploaded ──
    await page.getByTestId('sync-enable').click()
    await expect(section).toHaveAttribute('data-sync-state', 'on')
    await expect(page.getByTestId('sync-just-enabled')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/sync-on.png`, fullPage: true })

    const code = await readSyncCode(page)
    expect(code).toHaveLength(20)
    // Every travelling key was claimed in one go, and nothing else was.
    expect([...new Set(worker.puts.map((p) => p.key))].sort()).toEqual([...SYNC_KEYS].sort())
    expect(worker.blobs.size).toBe(SYNC_KEYS.length)

    // ── Masking: the code is not left sitting on screen ──
    await page.getByTestId('sync-reveal').click()
    await expect(page.getByTestId('sync-code')).toHaveAttribute('data-masked', 'true')
    await expect(page.getByTestId('sync-code')).not.toContainText(code.slice(-4))
    await page.screenshot({ path: `${SHOTS}/sync-on-masked.png`, fullPage: true })

    // ── Second device: same browser, no local data at all ──
    await wipeDevice(page)
    await expect(page).toHaveURL(/\/profiles$/)
    await expect(page.getByTestId('profile-card')).toHaveCount(0)
    await expect(page.getByTestId('profile-link-device')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/sync-picker-link-entry.png` })

    await page.getByTestId('profile-link-device').click()
    await expect(page.getByTestId('sync-link-screen')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/sync-link-empty.png`, fullPage: true })

    // A wrong code is refused without taking a profile slot.
    await page.getByTestId('sync-code-input').fill('00000000000000000000')
    await page.getByTestId('sync-link-submit').click()
    await expect(page.getByTestId('sync-link-error')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/sync-link-error.png`, fullPage: true })

    // The real one, typed the way a person would: lowercase, with dashes.
    const typed = (code.match(/.{1,4}/g) ?? []).join('-').toLowerCase()
    await page.getByTestId('sync-code-input').fill(typed)
    await expect(page.getByTestId('sync-code-count')).toHaveText('20 / 20')
    await page.screenshot({ path: `${SHOTS}/sync-link-filled.png`, fullPage: true })
    await page.getByTestId('sync-link-submit').click()

    // ── It is Greg, with Greg's XP, on a device that never met him ──
    await expect(page.getByRole('heading', { name: /today.s quest/i })).toBeVisible()
    await expect(page.locator('header')).toContainText('Greg')
    await expect(page.getByTestId('profile-chip')).toHaveText('📈')
    await expect(page.getByTestId('xp-total')).toHaveText(`${LESSON_XP} XP`)
    await expect(page.getByTestId('sync-dot')).toHaveAttribute('data-sync-status', 'synced')
    await page.screenshot({ path: `${SHOTS}/sync-home-dot.png` })

    // The review queue came across too — this is SM-2 state, not just a counter.
    await page.getByTestId('tab-review').click()
    await expect(page.getByTestId('review-progress')).toHaveText(`1 of ${LESSON.cardSeeds.length}`)

    // ── A change here is pushed on its own, a few seconds later ──
    const before = worker.puts.length
    await page.getByTestId('reveal-btn').click()
    await page.getByTestId('grade-good').click()
    await expect(page.getByTestId('review-progress')).toHaveText(
      `2 of ${LESSON.cardSeeds.length}`,
    )

    await expect
      .poll(() => worker.puts.slice(before).map((p) => p.key), { timeout: 15_000 })
      .toContain('tq.v1.srs')

    // And the cloud copy really holds the graded card.
    const srs = worker.blobs.get([...worker.blobs.keys()].find((k) => k.endsWith(':tq.v1.srs'))!)
    expect(Object.keys(srs?.data as Record<string, unknown>)).toHaveLength(
      LESSON.cardSeeds.length,
    )
  })

  test('unlinking keeps the local profile; deleting the cloud copy frees the code', async ({
    page,
  }) => {
    const worker = await bootstrap(page)
    await page.goto('/')
    await createProfile(page, 'Ana', '🚀')
    await completeFirstLesson(page)

    await page.getByTestId('profile-chip').click()
    await page.getByTestId('profile-edit').first().click()
    await page.getByTestId('sync-enable').click()
    await expect(page.getByTestId('sync-section')).toHaveAttribute('data-sync-state', 'on')
    const firstCode = await readSyncCode(page)
    expect(blobsFor(worker, firstCode)).toBe(SYNC_KEYS.length)

    // ── Unlink: local data stays, and so does the cloud copy ──
    await page.getByTestId('sync-unlink').click()
    await expect(page.getByTestId('sync-section')).toHaveAttribute('data-sync-state', 'off')
    expect(blobsFor(worker, firstCode)).toBe(SYNC_KEYS.length)
    await page.getByTestId('profile-back').click()
    await page.getByTestId('profile-enter').click()
    await expect(page.getByTestId('xp-total')).toHaveText(`${LESSON_XP} XP`)

    // ── Re-enable: a brand-new code, because the old one was forgotten ──
    await page.getByTestId('profile-chip').click()
    await page.getByTestId('profile-edit').first().click()
    await page.getByTestId('sync-enable').click()
    await expect(page.getByTestId('sync-section')).toHaveAttribute('data-sync-state', 'on')
    const secondCode = await readSyncCode(page)
    expect(secondCode).not.toBe(firstCode)
    expect(blobsFor(worker, secondCode)).toBe(SYNC_KEYS.length)

    // ── Delete the cloud copy for real ──
    await page.getByTestId('sync-delete-cloud').click()
    await expect(page.getByTestId('sync-delete-confirm')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/sync-delete-confirm.png`, fullPage: true })
    await page.getByTestId('sync-delete-cloud-confirm').click()

    await expect(page.getByTestId('sync-section')).toHaveAttribute('data-sync-state', 'off')
    expect(blobsFor(worker, secondCode)).toBe(0)
    // The copy left behind by the first code is untouched — "unlink" really did
    // mean "leave it there for the other device", even though nothing on this
    // device can reach it any more.
    expect(blobsFor(worker, firstCode)).toBe(SYNC_KEYS.length)

    // The profile itself is entirely unharmed.
    await page.getByTestId('profile-back').click()
    await page.getByTestId('profile-enter').click()
    await expect(page.getByTestId('xp-total')).toHaveText(`${LESSON_XP} XP`)
    await expect(page.locator('header')).toContainText('Ana')
  })

  test('with no worker configured the panel explains itself and offers nothing', async ({
    page,
  }) => {
    // No __TEST_SYNC_BASE__ — i.e. exactly a GitHub Pages build with the repo
    // variable QUOTE_PROXY unset, which is the state the app ships in today.
    await page.addInitScript((day: string) => {
      ;(window as unknown as { __TEST_CLOCK__: unknown }).__TEST_CLOCK__ = {
        today: day,
        now: `${day}T15:30:00.000Z`,
      }
    }, DAY)

    await page.goto('/')
    await createProfile(page, 'Sam', '🦊')
    // The picker's main screen stays as it was: no link entry to a server that
    // does not exist.
    await page.getByTestId('profile-chip').click()
    await expect(page.getByTestId('profile-link-device')).toHaveCount(0)
    await expect(page.getByTestId('sync-dot')).toHaveCount(0)

    await page.getByTestId('profile-edit').first().click()
    await expect(page.getByTestId('sync-section')).toHaveAttribute(
      'data-sync-state',
      'unconfigured',
    )
    await expect(page.getByTestId('sync-unconfigured')).toContainText('Cloudflare')
    await expect(page.getByTestId('sync-enable')).toHaveCount(0)
    await page.screenshot({ path: `${SHOTS}/sync-unconfigured.png`, fullPage: true })
  })
})
