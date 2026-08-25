import { test as base, expect } from '@playwright/test'

/**
 * Shared Playwright fixture — a test-harness accommodation, not app behaviour.
 *
 * Real users always land on the profile picker: TickerQuest never invents a
 * profile for you. Every spec below this line, though, was written against the
 * single-user app and opens '/' expecting Home. `__TEST_AUTO_PROFILE__` tells
 * boot to sign a throwaway 'Test' profile in silently so those specs keep
 * asserting what they were written to assert.
 *
 * The flag is read only from `window`, so it exists solely inside a Playwright
 * page; nothing in a production build can set it.
 *
 * e2e/profiles.spec.ts imports `test` straight from '@playwright/test' instead,
 * which is what lets it see the real first-run experience.
 */
export const test = base.extend<{ autoProfile: void }>({
  autoProfile: [
    async ({ page }, use) => {
      await page.addInitScript(() => {
        ;(window as unknown as { __TEST_AUTO_PROFILE__: boolean }).__TEST_AUTO_PROFILE__ = true
      })
      await use()
    },
    { auto: true },
  ],
})

export { expect }
