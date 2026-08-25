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
