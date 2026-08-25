/**
 * TickerQuest quote proxy — Cloudflare Worker (free tier, no build step).
 *
 * Stooq serves keyless CSV quotes but sends no CORS headers, so the browser
 * cannot call it directly from the deployed PWA. In dev, vite.config.ts proxies
 * `/api/stooq`; in production this ~40-line Worker does the same job.
 *
 * It is deliberately dumb and stateless: GET only, two allow-listed path
 * prefixes, everything else 403. No secrets, no logging, nothing to leak.
 *
 * Deploy (no wrangler.toml needed):
 *
 *   npm i -g wrangler
 *   wrangler login
 *   wrangler deploy proxy/worker.js --name tickerquest-quotes --compatibility-date 2024-01-01
 *
 * Then point the app at it and rebuild:
 *
 *   echo 'VITE_QUOTE_PROXY=https://tickerquest-quotes.<subdomain>.workers.dev' >> .env.production
 *   npm run build
 *
 * The app passes that value as `baseUrl` to `createStooqProvider`
 * (src/core/market/stooq.ts), falling back to `/api/stooq` when unset.
 *
 * Smoke test:
 *   curl 'https://tickerquest-quotes.<subdomain>.workers.dev/q/l/?s=aapl.us&f=sd2t2ohlcv&h&e=csv'
 */

const UPSTREAM = 'https://stooq.com'
const ALLOWED_PREFIXES = ['/q/l/', '/q/d/l/'] // last quote, daily history
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, max-age=300',
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 403, headers: CORS })

    const url = new URL(request.url)
    if (!ALLOWED_PREFIXES.some((p) => url.pathname.startsWith(p))) {
      return new Response('Forbidden', { status: 403, headers: CORS })
    }

    const upstream = new URL(url.pathname + url.search, UPSTREAM)
    // cf.cacheTtl lets the edge absorb repeat lookups and keeps us well inside
    // Stooq's daily request limit.
    const res = await fetch(upstream, { method: 'GET', cf: { cacheTtl: 300, cacheEverything: true } })

    return new Response(res.body, {
      status: res.status,
      headers: { ...CORS, 'Content-Type': res.headers.get('Content-Type') || 'text/csv' },
    })
  },
}
