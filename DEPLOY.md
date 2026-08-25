# Deploying TickerQuest

Everything here is optional: the app runs perfectly from `npm run dev` on your
laptop with your phone on the same Wi-Fi. Deploy when you want it installed on
the home screen with a stable URL that works away from the house.

The build is a **static site plus one tiny stateless worker**. There is no
database and no auth — all progress lives in the browser's IndexedDB on the
device, which is also why the deploy story is this short.

---

## 1. Build

```bash
npm install
npm run build        # tsc -b && vite build → dist/
npm run preview      # sanity-check the production bundle at :4173
```

`dist/` is ~4 MB, most of it the bundled OHLCV JSON that makes drills and
offline quotes work. All of it is precached by the service worker.

> **Deploying under a sub-path?** Vite must know at build time:
> `vite build --base=/tickerquest/`. Every data file is loaded through
> `import.meta.env.BASE_URL`, so nothing else needs changing.

---

## 2. Host `dist/` on any static host

All three of these serve the SPA correctly (deep links, the service worker and
the `data/**` JSON are plain files — nothing else is required).

**Cloudflare Pages**

```bash
npm i -g wrangler
wrangler pages deploy dist --project-name tickerquest
```

**Netlify**

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

**Vercel**

```bash
npm i -g vercel
vercel deploy --prod dist
```

### SPA fallback

The app uses client-side routing, so a hard refresh on `/portfolio` must serve
`index.html` rather than 404. Cloudflare Pages and Vercel do this by default for
a single-page app; Netlify needs one line, and adding it costs nothing anywhere:

```bash
echo '/*  /index.html  200' > dist/_redirects        # Netlify / Cloudflare Pages
```

The service worker already registers `navigateFallback: '/index.html'`, so this
only matters for the very first load of a deep link.

---

## 3. Live quotes: deploy the proxy worker

Without this, the app still works — quotes fall back to the last bundled close
and are badged **Stale** everywhere they appear. With it, paper trading fills at
delayed live prices.

Stooq serves keyless CSV but sends no CORS headers, so the browser cannot call
it directly. `proxy/worker.js` is a ~40-line GET-only, allow-listed, stateless
Cloudflare Worker that forwards two path prefixes and adds the CORS header.

```bash
npm i -g wrangler
wrangler login
wrangler deploy proxy/worker.js \
  --name tickerquest-quotes \
  --compatibility-date 2024-01-01
```

Smoke-test it before wiring it in:

```bash
curl 'https://tickerquest-quotes.<subdomain>.workers.dev/q/l/?s=aapl.us&f=sd2t2ohlcv&h&e=csv'
```

Then point the app at it **at build time** (Vite inlines `VITE_*` variables, so
this must happen before `npm run build`, not after):

```bash
echo 'VITE_QUOTE_PROXY=https://tickerquest-quotes.<subdomain>.workers.dev' >> .env.production
npm run build
```

On a hosted CI build (Netlify/Vercel/Pages dashboards), set `VITE_QUOTE_PROXY`
as a build environment variable instead of committing `.env.production`.

Verify: open a trade ticket. If the **Stale** badge is gone and the "as of" date
is today, the proxy is live. If it is still there, the app fell back to bundled
data — check the worker URL and its CORS response.

---

## 4. Swap synthetic data for real history

The committed `public/data/` is **deterministic synthetic** OHLCV, because the
sandbox this was built in cannot reach market-data hosts. On your own network:

```bash
node scripts/fetch-data.mjs                  # 27 symbols, ~10 years, from Stooq
node scripts/fetch-data.mjs --symbols=AAPL,SPY --years=5
```

It rewrites `public/data/ohlcv/{SYMBOL}.json` and `public/data/manifest.json`
(`manifest.generated` flips from `synthetic` to `stooq`). Then:

```bash
npm test          # bundled-data suites re-validate every series
npm run build
```

Commit the refreshed `public/data/` — it is part of the app, not a build
artifact.

⚠ Two things change under real data that are worth knowing:

- **Pattern drills reference bar indices.** `src/content/drills/patterns.ts`
  pins windows by `startIdx`/`endIdx` into each series. New data shifts those
  windows, so re-check the drills (`npm test` catches out-of-range windows, not
  a window that no longer contains the pattern).
- Stooq rate-limits. "Exceeded the daily hits limit" comes back as HTTP 200 with
  that text as the body; the script reports it per symbol. Retry tomorrow.

The financial statements in `public/data/financials/companies.json` are
**fictional by design** and are not touched by any fetch script.

---

## 5. PWA update behaviour

The service worker is registered with `registerType: 'autoUpdate'`
(`vite.config.ts`), which means:

- a new deploy is picked up on the next visit; the new worker installs in the
  background and activates on the **next** navigation or reload
- so an installed home-screen app can run one version behind for exactly one
  session — expected, not a bug
- `dist/data/**` is precached, so after the first successful load the whole
  curriculum, every chart and every statement work with the network off
- nothing in IndexedDB is touched by an update. Storage keys are versioned
  (`tq.v1.*`, `SCHEMA_VERSION` in `src/core/storage/adapter.ts`) — bump those
  only for a breaking shape change, and write a migration when you do

To force a clean slate on a device: DevTools → Application → Clear storage, or
Profile → Reset in the app.

---

## 6. Check it before you trust it

Run Lighthouse against the deployed URL (Chrome DevTools → Lighthouse, or CLI)
in **mobile** mode, with the PWA and Performance categories:

```bash
npx lighthouse https://<your-url> --preset=desktop --view      # or mobile
```

What to look for:

- **Installable** — manifest, icons and service worker all resolve
- **Works offline** — reload with the network disabled and the app still renders
- **Performance** — the main JS chunk is ~500 KB (lightweight-charts is most of
  it); if that ever matters, the chart is the thing to lazy-load, not the app

Then the real test: open it on the phone, **Share → Add to Home Screen**, turn
on airplane mode, and do a full day — a lesson, the review queue and the daily
drill. Only the live quote should be missing, and it should say so.
