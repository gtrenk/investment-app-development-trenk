import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@ui/App'
import './index.css'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('#root missing from index.html')

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter>
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
