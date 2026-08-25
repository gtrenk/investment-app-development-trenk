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

## Bundled market data

Chart drills use bundled daily OHLCV for 27 symbols under `public/data/`. The committed data is **synthetic but realistic** (seeded regime-switching model with fat tails) because the build environment cannot reach market-data hosts. To swap in real 10-year Stooq history, run `node scripts/fetch-data.mjs` locally and commit the refreshed `public/data/`.

## Architecture

```
src/core/       Pure TypeScript engines — no React, no DOM (portable to React Native)
  srs/          SM-2 algorithm + daily queue scheduler
  gamification/ XP/levels, streak state machine, declarative badges
  drills/       Drill selection, outcome grading, calibration stats
  market/       Series slicing/validation helpers
  storage/      StorageAdapter interface + versioned keys
src/content/    Curriculum authored as typed data (units, drill windows)
src/state/      Zustand store: engines ↔ IndexedDB ↔ UI glue
src/ui/         React screens/components (the only layer that knows about the DOM)
```

Rule: `ui/` imports `core/`; `core/` never imports `ui/`. All date math flows through an injected `Clock` (`window.__TEST_CLOCK__` override in e2e tests).

## Curriculum

14 planned units (~118 lessons), unlocking sequentially at 80% completion:

1. ✅ Market Foundations · 2. ✅ Market Mechanics · 3. ✅ Income Statement · 4. ✅ Balance Sheet & Cash Flow · 5. ✅ Ratios & Financial Health · 6–7. Valuation (Multiples, DCF) · 8–10. Technical Analysis (Foundations, Patterns, Indicators) · 11. Risk & Position Sizing · 12. Behavioral Finance · 13. Strategy & Synthesis · 14. Expert Topics

> Educational project for personal use. Nothing in this app is financial advice.
