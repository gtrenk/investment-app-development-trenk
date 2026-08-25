import { expect, test } from '@playwright/test'

test.describe('PWA shell', () => {
  test('links a manifest and registers a service worker', async ({ page }) => {
    await page.goto('/')

    // Manifest is linked and served with the expected identity.
    const href = await page.getAttribute('link[rel="manifest"]', 'href')
    expect(href).toBeTruthy()

    const manifest = await page.request.get(new URL(href!, page.url()).toString())
    expect(manifest.ok()).toBeTruthy()
    const json = await manifest.json()
    expect(json.name).toContain('TickerQuest')
    expect(json.display).toBe('standalone')
    expect(json.icons.length).toBeGreaterThan(0)

    // The theme colour drives the installed status bar.
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0f172a')

    // The real Workbox service worker takes control.
    await page.evaluate(() => navigator.serviceWorker.ready)
    const controlled = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready
      return Boolean(reg.active)
    })
    expect(controlled).toBe(true)
  })

  test('renders the app shell offline after a reload', async ({ page, context }) => {
    await page.goto('/')
    await page.evaluate(() => navigator.serviceWorker.ready)
    // Give Workbox a beat to finish writing the precache before cutting the wire.
    await expect(page.getByTestId('tab-bar')).toBeVisible()
    await page.waitForTimeout(1000)

    await context.setOffline(true)
    await page.reload()

    await expect(page.getByTestId('tab-bar')).toBeVisible()
    await expect(page.getByRole('heading', { name: /today.s quest/i })).toBeVisible()

    await context.setOffline(false)
  })
})
