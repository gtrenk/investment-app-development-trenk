import { defineConfig } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

/**
 * This environment ships a pre-installed Chromium under PLAYWRIGHT_BROWSERS_PATH
 * whose build number need not match the pinned @playwright/test release, and no
 * `playwright install` is possible. When that directory is present we point the
 * launcher straight at it; otherwise Playwright resolves its own download.
 */
function preinstalledChromium(): string | undefined {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH
  if (!root || !fs.existsSync(root)) return undefined
  const builds = fs
    .readdirSync(root)
    .filter((d) => /^chromium-\d+$/.test(d))
    .sort((a, b) => Number(a.split('-')[1]) - Number(b.split('-')[1]))
  for (const build of builds.reverse()) {
    const exe = path.join(root, build, 'chrome-linux', 'chrome')
    if (fs.existsSync(exe)) return exe
  }
  return undefined
}

const executablePath = preinstalledChromium()

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`

// The specs exercise the real service worker, so they run against a production
// build served by `vite preview` — never the dev server.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    // Phone-sized: everything in the UI is designed for this viewport.
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    trace: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium', launchOptions: executablePath ? { executablePath } : {} },
    },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: BASE_URL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
