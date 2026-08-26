# Deploying TickerQuest

Everything here is optional: the app runs perfectly from `npm run dev` on your
laptop with your phone on the same Wi-Fi. Deploy when you want it installed on
the home screen with a stable URL that works away from the house.

The build is a **static site plus one tiny Cloudflare Worker**. There is no
database beyond a key-value bucket and no auth — progress lives in the browser's
IndexedDB, and cloud sync (§3) is an opt-in copy of it keyed by a code the owner
carries between devices. That is why the deploy story is this short.

---

## 0. GitHub Pages (automatic) — the easy path

`.github/workflows/deploy.yml` builds and publishes the app on every push to
`main` or `claude/investing-gamification-app-0w6x5q`, and on demand from the
Actions tab (**Run workflow**). Nothing to install, no CLI, no account beyond
GitHub.

**Final URL:** <https://gtrenk.github.io/investment-app-development-trenk/>

### What the workflow does

1. **build** — checkout, Node 22 with an npm cache, `npm ci`, then
   `npm run build` with `VITE_APP_BASE=/investment-app-development-trenk/`, and
   uploads `dist/` as a Pages artifact.
2. **deploy** — `configure-pages` then `deploy-pages`, in the `github-pages`
   environment with `pages: write` + `id-token: write`.

A `concurrency` group cancels a run that a newer push has superseded, so the
last push always wins rather than racing an older build.

The workflow does **not** run the test suites. That is deliberate: deploys stay
fast, and `npx tsc -b`, `npx vitest run` and `npx playwright test` are the
gates you run locally before pushing. A broken build still fails the deploy,
because `npm run build` runs `tsc -b` first.

### One-time repo setup (owner)

1. **Make the repository public.** Pages on a private repo needs GitHub Pro or
   an organization plan; public is free.
2. **Settings → Pages → Build and deployment → Source: _GitHub Actions_.**
   The workflow calls `actions/configure-pages@v5` with `enablement: true`,
   which flips this for you on the first successful run — so in practice you can
   often skip straight to pushing and only come here if the first run fails with
   "Pages is not enabled".
3. Push to one of the two branches (or hit **Run workflow**), then watch the
   run in the **Actions** tab. The first deploy takes a couple of minutes; the
   URL appears on the run's `deploy` job.

### Why a non-root base matters

Project pages are served from `/<repo>/`, not `/`. The app handles this from a
single build-time variable:

- `vite.config.ts` reads `VITE_APP_BASE` (default `/`, so local dev, `vite
  preview` and the e2e suite are completely unaffected)
- the router gets `basename={import.meta.env.BASE_URL}`
- every bundled-data fetch is built from `import.meta.env.BASE_URL`
- the PWA manifest's `start_url`/`scope` and the service worker's
  `navigateFallback` are all derived from the same value

To reproduce a Pages build locally:

```bash
VITE_APP_BASE='/investment-app-development-trenk/' npm run build
```

### SPA deep links on Pages

GitHub Pages has no rewrite rules, so a hard refresh on
`/investment-app-development-trenk/learn` would 404. The `postbuild` npm script
copies `dist/index.html` → `dist/404.html`; Pages serves that for any unknown
path, the app boots, and the router reads the real URL. It runs after the
service worker is generated, so `404.html` is not precached twice.

### Live quotes and cloud sync on Pages

Pages serves static files only, so the `/api/stooq` dev proxy does not exist
there — quotes fall back to the last bundled close and wear the **Stale** badge,
and cloud sync has no server to talk to (see §3). The workflow already reads the
Worker origin from a repo variable:

```yaml
env:
  VITE_QUOTE_PROXY: ${{ vars.QUOTE_PROXY }}
```

That one variable switches on **both** features. So the day you deploy the
Cloudflare Worker, set **Settings → Secrets and variables → Actions → Variables
→ New repository variable**, name `QUOTE_PROXY`, value the worker URL — then
re-run the workflow. No code change. Unset it is an empty string, which is
exactly the current fall-back behaviour, so leaving it alone is harmless.

The rest of this document covers building by hand and hosting anywhere else.

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
> `VITE_APP_BASE=/tickerquest/ npm run build`. The router basename, every data
> fetch, the manifest's `start_url`/`scope` and the service worker's navigation
> fallback are all derived from it, so nothing else needs changing.

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

The service worker already registers `navigateFallback: '${base}index.html'`, so
this only matters for the very first load of a deep link. `npm run build` also
emits `dist/404.html` (a copy of `index.html`) for hosts like GitHub Pages that
use a 404 document as their SPA fallback.

---

## 3. The Worker: live quotes **and** cloud sync

One Worker does both jobs, and one deploy turns both on:

| Path | What it does | Needs |
|---|---|---|
| `/q/l/…`, `/q/d/l/…` | Stateless CORS proxy in front of stooq.com | nothing |
| `/sync…` | Per-profile blob store, so a profile follows you between devices | a KV namespace |

Without it the app still works: quotes fall back to the last bundled close and
are badged **Stale**, and the Cloud sync panel in Profile → Edit says "not set
up yet". Both are inert, not broken.

### 3.1 One-time: create the KV namespace

Sync stores one small JSON blob per profile key. Free-tier KV (100k reads and
1k writes a day) is orders of magnitude more than a household will use.

```bash
npm i -g wrangler
wrangler login
npx wrangler kv namespace create SYNC
```

That prints an id. Paste it into `wrangler.toml`, replacing the placeholder:

```toml
[[kv_namespaces]]
binding = "SYNC"
id = "abc123…"          # ← the id wrangler just printed
```

### 3.2 Deploy

```bash
npx wrangler deploy      # reads wrangler.toml — name, entry point and binding
```

Smoke-test both halves:

```bash
# quotes
curl 'https://tickerquest-quotes.<subdomain>.workers.dev/q/l/?s=aapl.us&f=sd2t2ohlcv&h&e=csv'

# sync — an unclaimed code must 401, which proves KV is bound and reachable
curl -i -H 'X-Sync-Token: ABCDEFGH0123456789JK' \
  'https://tickerquest-quotes.<subdomain>.workers.dev/sync/manifest'
```

A `501 {"error":"Sync is not configured…"}` means the Worker deployed but the
KV binding is missing — re-check §3.1. A `401 {"error":"Unknown sync code."}` is
the healthy answer.

### 3.3 Point the app at it

`VITE_QUOTE_PROXY` is the Worker's **origin**, and it is the switch for both
features: quotes go to `<origin>/q/…`, sync goes to `<origin>/sync`. Vite
inlines `VITE_*` at build time, so this must happen **before** `npm run build`.

On GitHub Pages (the §0 path), there is no code change to make — set the repo
variable once:

> **Settings → Secrets and variables → Actions → Variables → New repository
> variable**, name `QUOTE_PROXY`, value
> `https://tickerquest-quotes.<subdomain>.workers.dev`

then re-run the workflow. Building by hand instead:

```bash
echo 'VITE_QUOTE_PROXY=https://tickerquest-quotes.<subdomain>.workers.dev' >> .env.production
npm run build
```

On a hosted CI build (Netlify/Vercel/Pages dashboards), set `VITE_QUOTE_PROXY`
as a build environment variable instead of committing `.env.production`.

### 3.4 Verify

- **Quotes** — open a trade ticket. If the **Stale** badge is gone and the "as
  of" date is today, the proxy is live. If it is still there, the app fell back
  to bundled data; check the Worker URL and its CORS response.
- **Sync** — Profile → ✏️ Edit → **Cloud sync** should now offer **Enable
  sync** instead of "Not set up yet". Turn it on, then open the app on a second
  device and use **Link from another device** with the code it shows.

### 3.5 What sync actually stores

Per profile: the seven per-profile storage keys (`progress`, `srs`, `game`,
`portfolio`, `drills`, `orders`, `watchlist`) plus a `profileMeta` blob holding
just the name and avatar. The shared quote cache is **not** synced — it is
market data, not anyone's progress.

Keys are `<syncId>:<blobKey>`, where `syncId` is the first 8 characters of the
20-character sync code. The first `PUT` for a syncId claims it by storing the
full code; every later request must present the identical code (compared in
constant time). There are no accounts, no email, no passwords to reset — the
code *is* the credential, which is why the UI tells the owner to treat it like a
password.

Blobs are capped at 256 KB and the key names are allow-listed, so the worst a
leaked code buys is one small fixed-shape bucket.

To wipe a profile's cloud copy: Profile → Edit → Cloud sync → **Delete cloud
copy**. To wipe everything the Worker holds, delete and recreate the KV
namespace.

⚠ **Conflict policy: per-key last-write-wins.** If two devices change the same
key before either syncs, the later timestamp wins and the other device's change
to that key is gone — no merge, no prompt. See the README's "Sync across
devices" for what that means in practice.

---

## 4. Swap synthetic data for real history

The committed `public/data/` is **deterministic synthetic** OHLCV, because the
sandbox this was built in cannot reach market-data hosts.

### The easy path: run the workflow

**Actions → Refresh market data → Run workflow.** A GitHub-hosted runner has
plain outbound internet, so it does the fetch this sandbox never could:

1. `node scripts/fetch-data.mjs --max-failures=3 --min-bars=2000` — ~10 years of
   daily bars for all 27 symbols, one polite request at a time. A few flaky
   tickers are tolerated (their committed bars are kept, so the universe never
   shrinks); a truncated history is rejected outright.
2. `node scripts/validate-data.mjs` — manifest ↔ files, OHLC invariants,
   strictly increasing timestamps, ≥ 2 000 bars per symbol.
3. `node scripts/curate-windows.mjs` — every drill window re-derived from the new
   bars. **This step is not optional**: a window is an index range, so new bars
   mean the old indices point at different days.
4. The content test suites, then a commit to `main` — which fires the Pages
   deploy in §0. Nothing changed? No commit, no deploy.

The same workflow runs itself at 06:00 UTC on the 1st of each month
(`.github/workflows/refresh-data.yml`, `permissions: contents: write`, pushing
with the default `GITHUB_TOKEN` as `github-actions[bot]`). A `refresh-data`
concurrency group stops two runs from stacking.

### By hand, on a network that can reach Stooq

```bash
node scripts/fetch-data.mjs                  # 27 symbols, ~10 years, from Stooq
node scripts/fetch-data.mjs --symbols=AAPL,SPY --years=5
node scripts/validate-data.mjs --expect-symbols=27
node scripts/curate-windows.mjs --report     # rebuild data/drills/windows.json
npm test && npm run build
```

`manifest.generated` flips from `synthetic` to `stooq`, and so does
`source` in `public/data/drills/windows.json`. Commit the refreshed
`public/data/` — it is part of the app, not a build artifact.

Before trusting the new windows, look at some:

```bash
node scripts/render-windows.mjs --n=15 --out=/tmp/shots
node scripts/render-windows.mjs --answer=rising-wedge --out=/tmp/shots
```

That writes candlestick PNGs (with the fitted envelope drawn over triangles and
wedges, where a detector is most likely to be arithmetically right and visually
wrong). The detectors are strict, but "strict" is a claim about arithmetic.

⚠ Things worth knowing under real data:

- **Drill windows are regenerated, not migrated.** After a refresh the drills a
  learner has already answered are different drills with different ids; their
  history stays valid but the 60-day exclusion no longer applies to the new ones.
- **Class coverage changes.** On synthetic bars several pattern classes find few
  or no honest instances and ship empty (they remain distractors). Real market
  data should fill them in — `--report` prints the per-class yield.
- Stooq rate-limits. "Exceeded the daily hits limit" comes back as HTTP 200 with
  that text as the body; the script reports it per symbol and retries with
  backoff. If a whole run is rate-limited, re-run the workflow the next day.

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
