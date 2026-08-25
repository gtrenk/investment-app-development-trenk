/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /**
   * Origin of the CORS proxy that forwards to stooq.com in production (the
   * Cloudflare Worker in `proxy/worker.js`). Unset in dev, where Vite's
   * `/api/stooq` proxy handles it.
   */
  readonly VITE_QUOTE_PROXY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
