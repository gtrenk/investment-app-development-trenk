import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

/**
 * Deploy base path, chosen at build time.
 *
 * Unset (the default) means `/` — local dev, `vite preview`, the e2e suite and
 * any root-domain host all behave exactly as they always have. GitHub Pages
 * serves this repo as a *project* site under `/<repo>/`, so its workflow builds
 * with `VITE_APP_BASE=/investment-app-development-trenk/`.
 *
 * Normalised to always carry a leading and a trailing slash, so both Vite and
 * every `${base}foo` concatenation below (and `import.meta.env.BASE_URL` at
 * runtime) agree on the shape.
 */
function normalizeBase(raw: string): string {
  const trimmed = raw.trim().replace(/^\/+/, '').replace(/\/+$/, '')
  return trimmed === '' ? '/' : `/${trimmed}/`
}

const base = normalizeBase(process.env.VITE_APP_BASE ?? '/')

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'TickerQuest — Master Investing',
        short_name: 'TickerQuest',
        description:
          'Gamified path from beginner to expert in fundamental & technical stock analysis',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        // Both must sit under the deploy base or the installed app launches at
        // the domain root and lands on someone else's 404.
        start_url: base,
        scope: base,
        // Icon `src` stays relative: the browser resolves it against the
        // manifest URL, which is itself served from `base`.
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the app shell and all bundled market data for full offline use
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}', 'data/**/*.json'],
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  resolve: {
    alias: {
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@content': fileURLToPath(new URL('./src/content', import.meta.url)),
      '@state': fileURLToPath(new URL('./src/state', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/ui', import.meta.url)),
      '@platform': fileURLToPath(new URL('./src/platform', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Dev-time CORS proxy for live quotes (prod uses the Cloudflare Worker in proxy/)
      '/api/stooq': {
        target: 'https://stooq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stooq/, ''),
      },
    },
  },
})
