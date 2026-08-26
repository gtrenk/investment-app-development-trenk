# TickerQuest 📈

A personal, gamified path from beginner to expert in stock-market investing — covering both **fundamental analysis** (financial statements, ratios, valuation, DCF) and **technical analysis** (chart patterns, indicators, risk management) — built as a mobile-first, offline-capable PWA.

Built around evidence-based learning techniques:

- **Micro-lessons** (2–3 min) with active-recall quizzes
- **SM-2 spaced repetition** — lessons mint flashcards that resurface on an expanding schedule
- **Applied drills** — pattern recognition and "what happens next?" prediction on real-shaped charts, with **confidence calibration** scoring
- **Gamification** — XP, levels, streaks (with freezes), badges, daily goals
- **Paper trading** (Phase 3) — $100k virtual portfolio benchmarked against SPY
- **Case studies** — six guided end-to-end company analyses, the bridge from knowing the material to doing the work

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
| `node scripts/fetch-data.mjs` | **Replace synthetic data with real Stooq history** (needs network access to stooq.com) |
| `node scripts/validate-data.mjs` | Gate the dataset: manifest ↔ files, OHLC invariants, minimum bar count |
| `node scripts/curate-windows.mjs --report` | Re-derive every drill window from `public/data` and print the per-class yield |
| `node scripts/render-windows.mjs --n=15` | Render a sample of curated windows to PNG for an eyeball check |

## Daily flow (Smart Session + pace)

Home's big green button — **"Start today's session — N min"** — runs the whole
day in one tap: due reviews first, then today's lesson or lessons, then the
daily drill, with each player's completion panel offering **Next: …** instead of
dropping you back at the tab bar (and advancing itself after two seconds when
[listen mode](#listen-mode-read-aloud) is on, so a session is genuinely
hands-free end to end). A rail across the top shows the steps and ticks them
off; when the lessons mint fresh flashcards, those get chained on the end so the
day's goal is actually reachable. How many lessons a day it asks for is the
**daily pace** — *Chill 1 / Focused 2 / Intense 3*, set per profile under
**Profile → ✏️ Edit → Daily pace**, which also quotes the honest calendar cost
(~6 / ~3 / ~2 months to finish the curriculum at five study days a week). Pace
raises the daily goal, and with it the SRS caps (5 → 15 new cards a day, 30 → 50
reviews) so the flashcards keep up with the reading. Nothing about a session is
persisted: leave it at any point and it simply ends — starting again replans
from whatever is genuinely still undone that day.

## Case studies

Six applied capstones at **`/cases`**, unlocking in order, each an 8–12 step
guided analysis of one fictional company: read the statements, compute the
ratios, judge the earnings quality, value the business, and make the call. The
ramp runs *The Steady Compounder* (a grocer whose 3% margin and sub-1.0 current
ratio are features, not failures) → *Growth at What Price?* (stock compensation
turning a positive free cash flow negative) → *The Leverage Trap* (a 6× P/E that
is dearer than an 11× P/E once the debt is priced) → *Earnings Quality
Detective* (a profit that never became cash, and the two Unit 13 vetoes it
trips) → *The Valuation Gauntlet* (multiples, a DCF and a reverse DCF that
disagree by a factor of two) → *The Final Memo* (the full Unit 5 ten-point
checklist, a triangulated value, and a position sized in shares under the Unit
11 rules). Every step shows the relevant statements in a collapsible panel,
every question is multiple choice with miscalculation distractors and a worked
explanation, and each case ends with a written thesis of your own placed beside
the model verdict. Progress is per profile, resumable mid-case, and travels over
cloud sync. **No number in the content is trusted**: `tests/cases.test.ts`
recomputes every quoted figure from `public/data/financials/companies.json` via
`@core/financials/ratios` and `@core/financials/valuation`, and fails on any
percentage, multiple or dollar figure it cannot account for.

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

## Market data

Chart drills read bundled daily OHLCV for 27 symbols from `public/data/`, and the
windows they play from `public/data/drills/windows.json`.

**Refreshing with real market data is one click.** Actions → **Refresh market
data** → *Run workflow*. A GitHub runner has the outbound access this project's
build sandbox does not, so it fetches ~10 years of real daily bars from Stooq,
re-curates every drill window against them, runs the content tests and commits
to `main` — which triggers the Pages deploy. The same workflow runs on its own
at 06:00 UTC on the 1st of each month, and commits nothing at all when nothing
changed. See `.github/workflows/refresh-data.yml`.

The committed data is **synthetic but realistic** (a seeded regime-switching
model with fat tails, `scripts/generate-data.mjs`) so the whole pipeline builds,
tests and plays offline with no network at all. That stays the fallback: if a
refresh fails, the last good dataset is what ships.

### Why the windows are data, not code

A drill window is an index range into a symbol's bars, so it is only meaningful
for the dataset it was curated against — refresh the bars and every hard-coded
index points at a different day. `scripts/curate-windows.mjs` therefore commits
the *criteria* rather than the answers, and re-derives the windows from whatever
data is present:

- **Structural detectors, not regression lines.** Two least-squares lines through
  any trend "converge", which is how a plain uptrend gets labelled a rising
  wedge. Triangles and wedges additionally require envelope containment, three
  real pivot touches on each boundary, alternation between them, and an actual
  contraction of the high-low range.
- **Ambiguity is discarded.** A window matching two pattern classes is thrown
  away rather than assigned to the better-scoring one.
- **Empty is an allowed answer.** A class that finds no honest instance ships
  with zero windows and survives as a distractor.
- **What-next outcomes are balanced exactly** (20 up / 20 flat / 20 down) and
  every pick clears the ±2% band by another full percent, so the "right" answer
  is never a rounding accident.
- **Deterministic.** The only randomness is seeded from the data manifest, so the
  same bars always produce a byte-identical `windows.json` — which is what lets
  the monthly refresh commit only when something really changed.

`tests/windows.test.ts` guards the shipped file (bounds, caps, spacing, exact
outcome balance) and re-runs the curator in a child process to prove it is
reproducible.

## Architecture

```
src/core/       Pure TypeScript engines — no React, no DOM (portable to React Native)
  srs/          SM-2 algorithm + daily queue scheduler
  gamification/ XP/levels, streak state machine, declarative badges
  drills/       Drill selection, outcome grading, calibration stats, window-doc parsing
  market/       Series slicing/validation helpers
  speech/       Markdown → speakable text (notation, bullets, cloze blanks)
  storage/      StorageAdapter interface + versioned keys
  sync/         Cloud-sync protocol (fetch injected) + the sync-code alphabet
src/content/    Curriculum authored as typed data (units, drill labels + window fallback)
src/state/      Zustand store: engines ↔ IndexedDB ↔ UI glue
src/ui/         React screens/components (the only layer that knows about the DOM)
  speech/       window.speechSynthesis wrapper (chunking, voice, queue)
```

Rule: `ui/` imports `core/`; `core/` never imports `ui/`. All date math flows through an injected `Clock` (`window.__TEST_CLOCK__` override in e2e tests).

## Curriculum

14 units unlocking sequentially at 80% completion (the technical track branches after Unit 2):

All 14 units are authored (134 lessons): Market Foundations · Market Mechanics · Income Statement · Balance Sheet & Cash Flow · Ratios & Financial Health · Valuation I: Multiples · Valuation II: DCF · Technical Foundations · Chart Patterns · Indicators · Risk & Position Sizing · Behavioral Finance · Strategy & Synthesis · Expert Topics

> Educational project for personal use. Nothing in this app is financial advice.
