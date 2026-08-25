import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@ui/App'
import './index.css'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('#root missing from index.html')

// Vite bakes in the deploy base ('/' by default, '/<repo>/' on GitHub Pages).
// React Router wants it without the trailing slash, and '/' for a root deploy.
const basename = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/'

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// ── Durable storage ──────────────────────────────────────────────────────────
// Every profile's progress lives in IndexedDB, which a browser is free to evict
// under storage pressure — "best effort" is the default bucket policy. Asking
// for persistence promotes the origin so a phone clearing space throws away
// somebody else's cache instead of five learners' streaks.
//
// Best-effort by design: Safari grants it on user engagement, Chrome decides on
// its own heuristics, older browsers have no `navigator.storage` at all. Nothing
// in the app branches on the answer, so a `false` here is not a failure — the
// data is still written, it is just evictable.
async function requestPersistentStorage(): Promise<void> {
  try {
    await navigator.storage?.persist?.()
  } catch {
    // Unsupported or blocked — the app saves exactly the same either way.
  }
}

void requestPersistentStorage()

// ── Service worker ───────────────────────────────────────────────────────────
// vite-plugin-pwa injects `virtual:pwa-register`. Guarded so a browser without
// service workers (or a test environment that never builds the SW) still boots.
async function registerServiceWorker(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
  try {
    const { registerSW } = await import('virtual:pwa-register')
    registerSW({ immediate: true })
  } catch {
    // No SW in this environment — the app works fine online-only.
  }
}

void registerServiceWorker()
