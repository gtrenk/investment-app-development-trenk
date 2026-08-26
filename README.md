# TickerQuest 📈

A personal, gamified path from beginner to expert in stock-market investing — covering both **fundamental analysis** (financial statements, ratios, valuation, DCF) and **technical analysis** (chart patterns, indicators, risk management) — built as a mobile-first, offline-capable PWA.

Built around evidence-based learning techniques:

- **Micro-lessons** (2–3 min) with active-recall quizzes
- **SM-2 spaced repetition** — lessons mint flashcards that resurface on an expanding schedule
- **Applied drills** — pattern recognition and "what happens next?" prediction on real-shaped charts, with **confidence calibration** scoring
- **Gamification** — XP, levels, streaks (with freezes), badges, daily goals
- **Paper trading** (Phase 3) — $100k virtual portfolio benchmarked against SPY

## Quick start

```bash
npm install
npm run dev          # then open the LAN URL on your phone
```

To install on your phone: open the app in the browser → Share → **Add to Home Screen**. Everything except live quotes works fully offline.

Putting it on a real URL — static hosting, the quote proxy, real market data, PWA update behaviour: see **[DEPLOY.md](DEPLOY.md)**.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (add `-- --host` for LAN/phone access) |
| `npm run build` | Production PWA build (`dist/`) |
| `npm run preview` | Serve the production build |
| `npm test` | Vitest suites for all core engines |
| `npm run e2e` | Playwright end-to-end tests (PWA/offline/flows) |
| `node scripts/generate-data.mjs` | Regenerate the bundled synthetic chart data (deterministic) |
| `node scripts/fetch-data.mjs` | **Replace synthetic data with real Stooq history** (run on your own network) |

## Listen mode (read aloud)

Optional, off by default. **Profile → ✏️ Edit → Read aloud** turns on
text-to-speech for a profile and picks a speed (0.8×–1.5×); a 🔈 button in the
lesson header toggles it without leaving the lesson. With it on, each content
block is spoken through whatever the device is playing audio through — speaker,
headphones, car Bluetooth — and the page turns itself a second after the voice
finishes, so a whole lesson plays hands-free. Quiz questions are read out with
their four options lettered A–D but never auto-advance: answering is a tap.
Review cards read the prompt, then the answer once revealed.

Uses the browser's own voice (`window.speechSynthesis`) — no network, no
account, nothing installed. **Known platform limitation: iOS pauses web speech
when the screen locks, so keep the screen on for long listens.**

## Sync across devices

Each install holds up to five profiles, and a profile can follow you to another
phone or tablet. There are no accounts: in **Profile → ✏️ Edit → Cloud sync**,
turning sync on mints a 20-character **sync code**. Enter that code on the other
device under **Link from another device** and both are looking at the same
profile — same XP, streak, review schedule, drill history and paper portfolio.
The code is the entire credential, so treat it like a password; anyone who has
it can read and overwrite that profile. **Unlink this device** stops syncing
here and leaves the cloud copy alone; **Delete cloud copy** erases it for
everyone.

Conflicts are resolved **per key, last write wins**. Use the same profile on two
devices at once without letting either sync in between, and whichever change is
uploaded later keeps its value — the other device's edit to *that* key is gone,
with no merge and no prompt. Separate keys (a lesson on one device, a trade on
the other) do not collide. For a personal learning app that trade is worth the
simplicity; one device at a time and it never fires.

Sync is inert until the Cloudflare Worker is deployed and `QUOTE_PROXY` is set —
one Worker serves both live quotes and sync. See **[DEPLOY.md](DEPLOY.md) §3**.

## Bundled market data

Chart drills use bundled daily OHLCV for 27 symbols under `public/data/`. The committed data is **synthetic but realistic** (seeded regime-switching model with fat tails) because the build environment cannot reach market-data hosts. To swap in real 10-year Stooq history, run `node scripts/fetch-data.mjs` locally and commit the refreshed `public/data/`.

## Architecture

```
src/core/       Pure TypeScript engines — no React, no DOM (portable to React Native)
  srs/          SM-2 algorithm + daily queue scheduler
  gamification/ XP/levels, streak state machine, declarative badges
  drills/       Drill selection, outcome grading, calibration stats
  market/       Series slicing/validation helpers
  speech/       Markdown → speakable text (notation, bullets, cloze blanks)
  storage/      StorageAdapter interface + versioned keys
  sync/         Cloud-sync protocol (fetch injected) + the sync-code alphabet
src/content/    Curriculum authored as typed data (units, drill windows)
src/state/      Zustand store: engines ↔ IndexedDB ↔ UI glue
src/ui/         React screens/components (the only layer that knows about the DOM)
  speech/       window.speechSynthesis wrapper (chunking, voice, queue)
```

Rule: `ui/` imports `core/`; `core/` never imports `ui/`. All date math flows through an injected `Clock` (`window.__TEST_CLOCK__` override in e2e tests).

## Curriculum

14 units unlocking sequentially at 80% completion (the technical track branches after Unit 2):

All 14 units are authored (134 lessons): Market Foundations · Market Mechanics · Income Statement · Balance Sheet & Cash Flow · Ratios & Financial Health · Valuation I: Multiples · Valuation II: DCF · Technical Foundations · Chart Patterns · Indicators · Risk & Position Sizing · Behavioral Finance · Strategy & Synthesis · Expert Topics

> Educational project for personal use. Nothing in this app is financial advice.
