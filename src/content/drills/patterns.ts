// ─── Chart-pattern & what-next drill definitions ─────────────────────────────
//
// Every window below is an index range into the bundled series in
// `public/data/ohlcv/{SYMBOL}.json` (2 520 daily bars per symbol, indices
// 0…2519). Ranges are inclusive on both ends.
//
// HOW THESE WERE CHOSEN
// ---------------------
// The bundled dataset is currently synthetic (see `scripts/generate-data.mjs`),
// so the windows could not be lifted from a textbook. Instead every candidate
// was found by a programmatic scan of all 27 symbols — regression slope and R²
// for trends, range width and touch counts for consolidations, fractal pivot
// analysis for double tops/bottoms and head-and-shoulders, envelope trendlines
// with containment + oscillation tests for triangles and wedges, pole/flag
// geometry for flags — and then every surviving window was rendered as a
// candlestick chart and inspected by eye. Only windows that survived both
// passes are here.
//
// WHAT IS DELIBERATELY MISSING
// ----------------------------
// Six labels in `PatternId` have **no** drill window:
//   ascending-triangle · descending-triangle · symmetrical-triangle
//   rising-wedge · falling-wedge · bear-flag
// The detector did surface candidates for all of them, but under inspection
// none was a shape a learner could name with any confidence — the "triangles"
// were choppy ranges and the "wedges" were plain trends whose pivot lines
// happened to converge. Labelling those windows would teach pattern-matching
// on noise, which is the opposite of the point. They remain in the `PatternId`
// union and are used as *distractors* (a learner still has to know what a
// rising wedge is in order to rule it out), and windows for them should be
// added once `scripts/fetch-data.mjs` has replaced the synthetic bars with
// real ones.
//
// Distractors are chosen to be wrong but not absurd: a plausible-looking
// alternative from the same family, so the choice turns on the defining
// feature rather than on eliminating nonsense.

import type { PatternDrillDef, PatternId, WhatNextDrillDef } from '@core/types'

/** Display names for the answer buttons and the reveal card. */
export const PATTERN_LABELS: Record<PatternId, string> = {
  'head-and-shoulders': 'Head and Shoulders',
  'inverse-head-and-shoulders': 'Inverse Head and Shoulders',
  'double-top': 'Double Top',
  'double-bottom': 'Double Bottom',
  'ascending-triangle': 'Ascending Triangle',
  'descending-triangle': 'Descending Triangle',
  'symmetrical-triangle': 'Symmetrical Triangle',
  'bull-flag': 'Bull Flag',
  'bear-flag': 'Bear Flag',
  'cup-and-handle': 'Cup and Handle',
  'rising-wedge': 'Rising Wedge',
  'falling-wedge': 'Falling Wedge',
  breakout: 'Breakout',
  'support-bounce': 'Support Bounce',
  uptrend: 'Uptrend',
  downtrend: 'Downtrend',
  consolidation: 'Consolidation',
}

export const PATTERN_DRILLS: PatternDrillDef[] = [
  // ── Uptrend ────────────────────────────────────────────────────────────────
  {
    id: 'pd-tsla-1855',
    symbol: 'TSLA',
    startIdx: 1855,
    endIdx: 1949,
    answer: 'uptrend',
    distractors: ['bull-flag', 'cup-and-handle', 'breakout'],
    explain:
      'A clean uptrend: each pullback bottoms above the last one and each rally tops above the last one — higher highs and higher lows, the definition of an uptrend. Draw a line under the lows and price stays above it the whole way. There is no ceiling being tested and no base to break out of, so this is trend continuation, not a pattern setup. The lesson: the trend is the context every other pattern is read inside.',
  },
  {
    id: 'pd-cat-1940',
    symbol: 'CAT',
    startIdx: 1940,
    endIdx: 2069,
    answer: 'uptrend',
    distractors: ['ascending-triangle', 'breakout', 'consolidation'],
    explain:
      'Price rises steadily from the left edge to the right with only shallow interruptions — the deepest dip barely dents the advance. An ascending triangle would need a flat ceiling that price keeps bumping into; here the highs keep rising, so there is no ceiling at all. Steady, low-drama uptrends like this are where trend-following strategies make their money.',
  },
  {
    id: 'pd-nvda-1710',
    symbol: 'NVDA',
    startIdx: 1710,
    endIdx: 1789,
    answer: 'uptrend',
    distractors: ['bull-flag', 'rising-wedge', 'double-bottom'],
    explain:
      'A steep, persistent advance. The tell against a rising wedge is that the swings are not narrowing — the distance between the rally highs and the pullback lows stays wide or widens as price climbs. A wedge converges; a trend does not. Strong trends in high-volatility names run further than most people expect, and also unwind faster.',
  },
  {
    id: 'pd-msft-750',
    symbol: 'MSFT',
    startIdx: 750,
    endIdx: 879,
    answer: 'uptrend',
    distractors: ['consolidation', 'cup-and-handle', 'support-bounce'],
    explain:
      'Left edge to right edge the price is meaningfully higher, and the path is a staircase of advances and shallow rests. A cup-and-handle would need a rounded decline first, forming a U before the advance; here there is no U — the chart starts near its low and only goes up. The rests inside a trend are where new buyers get their entries.',
  },
  {
    id: 'pd-dis-2235',
    symbol: 'DIS',
    startIdx: 2235,
    endIdx: 2314,
    answer: 'uptrend',
    distractors: ['breakout', 'bull-flag', 'symmetrical-triangle'],
    explain:
      'A quiet start giving way to a sustained climb, with the last third the steepest part. It is tempting to call the acceleration a breakout, but a breakout needs a clearly defined range to break *out of* — a ceiling that held several times. There is no such ceiling here; price simply trends. Accelerating trends often mark the late, most emotional stage of a move.',
  },

  // ── Downtrend ──────────────────────────────────────────────────────────────
  {
    id: 'pd-qqq-1910',
    symbol: 'QQQ',
    startIdx: 1910,
    endIdx: 2004,
    answer: 'downtrend',
    distractors: ['descending-triangle', 'bear-flag', 'head-and-shoulders'],
    explain:
      'Lower highs *and* lower lows all the way down — an orderly downtrend. A descending triangle would show the same falling highs but resting on a flat floor that price tests again and again; here the floor keeps dropping too, so there is nothing horizontal to hold. On an index this steady, a decline like this is the market-wide risk-off phase in miniature.',
  },
  {
    id: 'pd-nflx-545',
    symbol: 'NFLX',
    startIdx: 545,
    endIdx: 624,
    answer: 'downtrend',
    distractors: ['bear-flag', 'falling-wedge', 'double-top'],
    explain:
      'A persistent slide with every bounce failing below the previous one. Against a falling wedge: a wedge narrows as it falls, with the ceiling dropping faster than the floor until the two nearly meet. Here the swings stay just as wide at the right edge as at the left. Selling into failing bounces is what keeps a downtrend intact.',
  },
  {
    id: 'pd-dis-1840',
    symbol: 'DIS',
    startIdx: 1840,
    endIdx: 1934,
    answer: 'downtrend',
    distractors: ['consolidation', 'descending-triangle', 'inverse-head-and-shoulders'],
    explain:
      'The whole window slopes down: the right edge sits far below the left, with each rally stalling lower. Consolidation would mean a flat range with a roughly horizontal top and bottom — this has neither. Note how the down-days have larger bodies than the up-days; that imbalance is the visual signature of supply in control.',
  },
  {
    id: 'pd-jnj-1540',
    symbol: 'JNJ',
    startIdx: 1540,
    endIdx: 1619,
    answer: 'downtrend',
    distractors: ['bear-flag', 'symmetrical-triangle', 'support-bounce'],
    explain:
      'A grinding decline in a normally sleepy defensive name — the point being that a downtrend is defined by structure, not speed. A bear flag would be a *short* sideways drift after one sharp drop, and would occupy only part of the window; here the decline runs the full width with no distinct pole-and-pause.',
  },
  {
    id: 'pd-unh-1040',
    symbol: 'UNH',
    startIdx: 1040,
    endIdx: 1169,
    answer: 'downtrend',
    distractors: ['head-and-shoulders', 'double-top', 'descending-triangle'],
    explain:
      'Price rolls over early and then trends down for the rest of the window. A head-and-shoulders needs three distinct reaction peaks — a middle one clearly above two roughly level ones — and a horizontal neckline underneath them. Look for that structure here and it is not there: after the initial top, price simply steps down. Not every top is a named pattern.',
  },

  // ── Consolidation ──────────────────────────────────────────────────────────
  {
    id: 'pd-wmt-90',
    symbol: 'WMT',
    startIdx: 90,
    endIdx: 169,
    answer: 'consolidation',
    distractors: ['uptrend', 'symmetrical-triangle', 'double-top'],
    explain:
      'Price swings up and down but ends near where it started, contained by a roughly horizontal ceiling and floor that are each visited several times. That is consolidation: supply and demand temporarily balanced. A symmetrical triangle would show those swings getting *smaller* toward the right edge; these stay the same size. Ranges resolve eventually — which way is genuinely unknowable in advance, which is why the breakout is what you trade, not the range.',
  },
  {
    id: 'pd-spy-765',
    symbol: 'SPY',
    startIdx: 765,
    endIdx: 844,
    answer: 'consolidation',
    distractors: ['breakout', 'descending-triangle', 'bull-flag'],
    explain:
      'A choppy sideways band with no net progress. The distinction from a breakout is simply where the window ends: a breakout window finishes with price decisively *outside* the range on expanding volume. Here the last bars are still inside the band, so nothing has resolved yet. Recognising "nothing has happened yet" is a real skill — it stops you trading noise.',
  },
  {
    id: 'pd-ko-1540',
    symbol: 'KO',
    startIdx: 1540,
    endIdx: 1619,
    answer: 'consolidation',
    distractors: ['uptrend', 'downtrend', 'cup-and-handle'],
    explain:
      'A low-volatility staple drifting sideways in a narrow band. Neither a rising nor a falling structure survives the eye test: cover the middle of the chart and the left and right edges sit at the same level. Narrow ranges in low-beta names can persist for months; the practical read is "no edge here", not "something is about to happen".',
  },
  {
    id: 'pd-hd-1550',
    symbol: 'HD',
    startIdx: 1550,
    endIdx: 1659,
    answer: 'consolidation',
    distractors: ['symmetrical-triangle', 'double-top', 'support-bounce'],
    explain:
      'Several full swings between a stable ceiling and a stable floor. A double top would need exactly two prominent peaks at the same level followed by a decisive breakdown through the trough between them — here there are more than two peaks and no breakdown, so the range is still a range. Counting the touches is what separates the two.',
  },

  // ── Breakout ───────────────────────────────────────────────────────────────
  {
    id: 'pd-amzn-460',
    symbol: 'AMZN',
    startIdx: 460,
    endIdx: 539,
    answer: 'breakout',
    distractors: ['uptrend', 'consolidation', 'cup-and-handle'],
    explain:
      'A long, tight, flat base occupies most of the window, then the last stretch pushes decisively above the ceiling that had capped every previous rally — on visibly heavier volume. That combination (defined resistance, sustained base, expansion through it) is the breakout. The base matters as much as the break: the longer the range, the more meaningful its resolution.',
  },
  {
    id: 'pd-ma-885',
    symbol: 'MA',
    startIdx: 885,
    endIdx: 1014,
    answer: 'breakout',
    distractors: ['bull-flag', 'uptrend', 'ascending-triangle'],
    explain:
      'An extended flat stretch resolving upward in the final third. Against a bull flag: a flag has the sharp move *first* and the quiet drift *after*. Here the order is reversed — quiet first, sharp move last — which is a breakout, not a flag. Watching where the energetic part of the window sits is usually enough to tell them apart.',
  },
  {
    id: 'pd-wmt-1195',
    symbol: 'WMT',
    startIdx: 1195,
    endIdx: 1289,
    answer: 'breakout',
    distractors: ['consolidation', 'support-bounce', 'symmetrical-triangle'],
    explain:
      'About the cleanest version of the pattern in this dataset: a long dormant band, then a near-vertical push out of the top in the last handful of bars. Support-bounce is the wrong label because the action happens at the *ceiling*, not the floor. Breakouts that come after long, quiet bases tend to run furthest — there is no overhead supply left to sell into them.',
  },
  {
    id: 'pd-qqq-2360',
    symbol: 'QQQ',
    startIdx: 2360,
    endIdx: 2454,
    answer: 'breakout',
    distractors: ['uptrend', 'cup-and-handle', 'bull-flag'],
    explain:
      'A sideways index range broken to the upside in the closing bars. Cup-and-handle is the tempting alternative, but a cup requires a rounded U-shaped decline and recovery; this base is flat-bottomed, not curved. Index breakouts matter because they tend to drag the whole market of single names with them.',
  },

  // ── Support bounce ─────────────────────────────────────────────────────────
  {
    id: 'pd-jnj-1000',
    symbol: 'JNJ',
    startIdx: 1000,
    endIdx: 1129,
    answer: 'support-bounce',
    distractors: ['double-bottom', 'consolidation', 'ascending-triangle'],
    explain:
      'A horizontal level below the price is tested three or more separate times, holds every time, and the final test is followed by a rally away from it. That repeated defence is what makes it support. It is not a double bottom because a double bottom is a *reversal* pattern: it follows a real decline and has exactly two lows. Here the level is being defended inside an ongoing range.',
  },
  {
    id: 'pd-cat-2310',
    symbol: 'CAT',
    startIdx: 2310,
    endIdx: 2439,
    answer: 'support-bounce',
    distractors: ['double-bottom', 'breakout', 'uptrend'],
    explain:
      'Price sags to the same floor repeatedly, buyers appear each time, and the last touch launches the strongest rally in the window. The practical value of a level like this is risk definition: it gives you an obvious place to be wrong — a close well below the floor invalidates the idea, so the stop writes itself.',
  },
  {
    id: 'pd-v-2330',
    symbol: 'V',
    startIdx: 2330,
    endIdx: 2459,
    answer: 'support-bounce',
    distractors: ['consolidation', 'inverse-head-and-shoulders', 'falling-wedge'],
    explain:
      'The lows line up horizontally while the rallies between them are uneven — that asymmetry is the giveaway. An inverse head-and-shoulders would need the *middle* low to be clearly the deepest, with the two outer lows roughly level and higher; here every low sits at the same depth. Level lows = support; one deeper low in the middle = inverse H&S.',
  },

  // ── Double top ─────────────────────────────────────────────────────────────
  {
    id: 'pd-tsla-395',
    symbol: 'TSLA',
    startIdx: 395,
    endIdx: 524,
    answer: 'double-top',
    distractors: ['head-and-shoulders', 'consolidation', 'rising-wedge'],
    explain:
      'An advance, a peak, a pullback, a second rally that stalls at almost exactly the same price, then a decline through the trough between them. Two failures at one level tell you sellers are waiting there. Against head-and-shoulders: there are two peaks, not three, and neither is meaningfully higher than the other. The measured downside target is the pattern height projected below the neckline.',
  },
  {
    id: 'pd-nflx-495',
    symbol: 'NFLX',
    startIdx: 495,
    endIdx: 624,
    answer: 'double-top',
    distractors: ['consolidation', 'downtrend', 'symmetrical-triangle'],
    explain:
      'Two prominent highs at a matching level separated by a clear reaction low, followed by a sustained decline. The pattern is only confirmed when price closes below that reaction low — before then it is just a range. Note that the window ends well under the neckline: the reversal has already been ratified.',
  },
  {
    id: 'pd-msft-620',
    symbol: 'MSFT',
    startIdx: 620,
    endIdx: 749,
    answer: 'double-top',
    distractors: ['head-and-shoulders', 'downtrend', 'bear-flag'],
    explain:
      'A rise into two matched peaks and then a long, steady decline. The reason this is a double top rather than simply a downtrend is that the window captures the *turn*: the left side is an advance. Labelling depends on what fraction of the window the reversal structure occupies — here it is the dominant feature.',
  },
  {
    id: 'pd-nvda-1335',
    symbol: 'NVDA',
    startIdx: 1335,
    endIdx: 1464,
    answer: 'double-top',
    distractors: ['double-bottom', 'consolidation', 'rising-wedge'],
    explain:
      'Two equal highs with a visible valley between them, then a decline that carries below that valley. In a volatile name the two peaks rarely match to the cent — "the same level" means within a few percent, judged by eye across the whole swing, not by exact ticks.',
  },
  {
    id: 'pd-dis-1265',
    symbol: 'DIS',
    startIdx: 1265,
    endIdx: 1344,
    answer: 'double-top',
    distractors: ['consolidation', 'descending-triangle', 'bear-flag'],
    explain:
      'A compact version: the two peaks sit close together at the top of the window and the breakdown that follows is sharp. Consolidation is ruled out by the ending — price leaves the range decisively and never returns to it. A range that breaks *down* out of a twin-peak top is exactly what a double top is.',
  },

  // ── Double bottom ──────────────────────────────────────────────────────────
  {
    id: 'pd-cost-1415',
    symbol: 'COST',
    startIdx: 1415,
    endIdx: 1544,
    answer: 'double-bottom',
    distractors: ['inverse-head-and-shoulders', 'support-bounce', 'consolidation'],
    explain:
      'A decline into a low, a bounce, a retest of that low that holds, then a rally through the intervening high — the mirror image of a double top and a classic bottoming structure. Against inverse head-and-shoulders: two lows, not three, and they are level rather than having a deeper one in the middle.',
  },
  {
    id: 'pd-cat-225',
    symbol: 'CAT',
    startIdx: 225,
    endIdx: 354,
    answer: 'double-bottom',
    distractors: ['support-bounce', 'cup-and-handle', 'uptrend'],
    explain:
      'The second low undercuts nothing and the recovery from it is stronger than the first — the sign that sellers have been exhausted. Against cup-and-handle: a cup is a smooth, rounded, single-bottom U. Two distinct spikes down with a rally between them is a W, and a W is a double bottom.',
  },
  {
    id: 'pd-msft-1645',
    symbol: 'MSFT',
    startIdx: 1645,
    endIdx: 1754,
    answer: 'double-bottom',
    distractors: ['consolidation', 'falling-wedge', 'downtrend'],
    explain:
      'Two tests of the same floor, then a sustained advance that leaves the base behind. The confirmation bar is the close above the middle peak; everything before that is a hypothesis. Traders who wait for the confirmation give up some of the move in exchange for a much lower failure rate.',
  },
  {
    id: 'pd-nflx-1555',
    symbol: 'NFLX',
    startIdx: 1555,
    endIdx: 1664,
    answer: 'double-bottom',
    distractors: ['inverse-head-and-shoulders', 'support-bounce', 'bull-flag'],
    explain:
      'A decline, a low, a rally, a shallower second low, and then a strong advance. A second low that is slightly *higher* than the first still counts — it is arguably a stronger signal, because buyers stepped in earlier the second time. What matters is that the retest held.',
  },

  // ── Cup and handle ─────────────────────────────────────────────────────────
  {
    id: 'pd-amzn-2020',
    symbol: 'AMZN',
    startIdx: 2020,
    endIdx: 2114,
    answer: 'cup-and-handle',
    distractors: ['double-bottom', 'uptrend', 'consolidation'],
    explain:
      'A rounded U — decline, a broad curved base with no sharp spike low, then a recovery back to the level the decline started from — followed by a small, shallow drift lower at the right edge. That last drift is the handle: a final shakeout before the rim is cleared. The rounded base is what separates it from a double bottom, which puts two sharp points at the low.',
  },
  {
    id: 'pd-msft-1095',
    symbol: 'MSFT',
    startIdx: 1095,
    endIdx: 1174,
    answer: 'cup-and-handle',
    distractors: ['double-bottom', 'breakout', 'support-bounce'],
    explain:
      'The cup takes most of the window and the handle only the last stretch — the correct proportions. A valid handle retraces only a modest part of the cup depth; a deep handle that gives back most of the recovery invalidates the pattern, because it means the buyers who drove the right side of the cup have already lost control.',
  },
  {
    id: 'pd-xom-125',
    symbol: 'XOM',
    startIdx: 125,
    endIdx: 204,
    answer: 'cup-and-handle',
    distractors: ['double-bottom', 'inverse-head-and-shoulders', 'consolidation',],
    explain:
      'Decline, rounded bottom, recovery to a rim roughly level with the left edge, then a modest pullback to finish. Against inverse head-and-shoulders: there is one continuous curved low here, not three separate troughs with a deeper middle one. Trace the lows with a finger — a smooth arc means cup, three dips mean inverse H&S.',
  },

  // ── Bull flag ──────────────────────────────────────────────────────────────
  {
    id: 'pd-qqq-993',
    symbol: 'QQQ',
    startIdx: 993,
    endIdx: 1047,
    answer: 'bull-flag',
    distractors: ['double-top', 'uptrend', 'consolidation'],
    explain:
      'A sharp near-vertical advance (the pole) followed by a tight, slightly downward-sloping drift on lighter volume (the flag). The flag gives back only a fraction of the pole — a shallow, orderly pause rather than a reversal. Against double top: a double top needs two distinct peaks at the same level and a breakdown; this is one push and a rest.',
  },
  {
    id: 'pd-bac-2190',
    symbol: 'BAC',
    startIdx: 2190,
    endIdx: 2254,
    answer: 'bull-flag',
    distractors: ['double-top', 'rising-wedge', 'breakout'],
    explain:
      'Rally, then a compact sideways-to-lower drift that holds well above the base of the move. The key measurement is the retracement: a flag that gives back less than about half the pole is a pause; one that gives back much more is a failed move wearing a flag costume.',
  },
  {
    id: 'pd-ma-1653',
    symbol: 'MA',
    startIdx: 1653,
    endIdx: 1707,
    answer: 'bull-flag',
    distractors: ['consolidation', 'double-top', 'uptrend'],
    explain:
      'The window is roughly half pole and half flag, which is what makes the pattern readable. Consolidation is the wrong label because consolidation implies no prior directional thrust — a flag is defined precisely by the thrust that precedes it, and only means anything in that context.',
  },

  // ── Head and shoulders ─────────────────────────────────────────────────────
  {
    id: 'pd-tsla-2418',
    symbol: 'TSLA',
    startIdx: 2418,
    endIdx: 2497,
    answer: 'head-and-shoulders',
    distractors: ['double-top', 'consolidation', 'rising-wedge'],
    explain:
      'Three reaction peaks: a left shoulder, a clearly higher head, and a right shoulder back at roughly the left shoulder\'s level — with the two intervening lows forming a near-horizontal neckline, and price finishing below it. Against double top: count the peaks. Two matched peaks is a double top; three with a taller middle one is head-and-shoulders. It is the classic topping pattern, and the measured target is the head-to-neckline distance projected down from the break.',
  },
  {
    id: 'pd-xom-1614',
    symbol: 'XOM',
    startIdx: 1614,
    endIdx: 1708,
    answer: 'head-and-shoulders',
    distractors: ['double-top', 'downtrend', 'descending-triangle'],
    explain:
      'The head here is a sharp spike rather than a rounded peak — that is common and does not invalidate the pattern. What matters is the sequence and the levels: two roughly equal shoulders, a distinctly higher head between them, a flat neckline, and a decline that breaks it. Failure of the right shoulder to reach the head is the moment the trend actually changed hands.',
  },
  {
    id: 'pd-nflx-762',
    symbol: 'NFLX',
    startIdx: 762,
    endIdx: 841,
    answer: 'head-and-shoulders',
    distractors: ['double-top', 'symmetrical-triangle', 'bear-flag'],
    explain:
      'A compact head-and-shoulders where all three peaks fit comfortably inside the window and the decline afterwards is unambiguous. When judging one, check the neckline first: if the two troughs are at wildly different levels, the pattern is unreliable no matter how good the peaks look, because there is no single line for the market to defend.',
  },

  // ── Inverse head and shoulders ─────────────────────────────────────────────
  {
    id: 'pd-cat-1896',
    symbol: 'CAT',
    startIdx: 1896,
    endIdx: 2005,
    answer: 'inverse-head-and-shoulders',
    distractors: ['double-bottom', 'cup-and-handle', 'support-bounce'],
    explain:
      'The topping pattern turned upside down: a first low, a deeper low (the head), a third low back at roughly the first one\'s level, then a rally through the neckline drawn across the two intervening highs. Against double bottom: three troughs, not two, and the middle one is the deepest. This is the standard bottoming structure after a decline.',
  },
  {
    id: 'pd-nvda-1845',
    symbol: 'NVDA',
    startIdx: 1845,
    endIdx: 1939,
    answer: 'inverse-head-and-shoulders',
    distractors: ['double-bottom', 'falling-wedge', 'consolidation'],
    explain:
      'Three troughs with the middle one lowest, followed by a sustained advance. The right shoulder forming higher than the head is the informative part: buyers refused to let price return to the lows, which is the earliest structural evidence that the decline is over. Volume should be lightest at the head and heaviest on the neckline break.',
  },
]

/**
 * "What happens next" windows.
 *
 * Each shows the bars up to `cutoffIdx` (the player sees roughly the last 120)
 * with the symbol masked, asks for Up / Flat / Down over the next `horizon`
 * bars plus a 50/70/90 confidence, then animates the hidden bars in.
 *
 * The set is built to be honest rather than flattering:
 *   • all 27 symbols appear, spread evenly across the ten-year span
 *   • outcomes are balanced 10 up / 10 flat / 10 down, so guessing "up" every
 *     time scores about a third — a market that only ever went up would train
 *     exactly the wrong instinct
 *   • every window clears the ±2% classification band by a wide margin
 *     (up ≥ +3.5%, down ≤ −3.5%, flat within ±1.5%), so no answer is arguable
 *   • every `cutoffIdx` is at least 140 bars into the series and at least 140
 *     bars before its end, so both the lead-in chart and the reveal always have
 *     enough data
 */
export const WHATNEXT_DRILLS: WhatNextDrillDef[] = [
  { id: 'wn-aapl-172', symbol: 'AAPL', cutoffIdx: 172, horizon: 10 },
  { id: 'wn-jnj-291', symbol: 'JNJ', cutoffIdx: 291, horizon: 10 },
  { id: 'wn-hd-329', symbol: 'HD', cutoffIdx: 329, horizon: 10 },
  { id: 'wn-amzn-401', symbol: 'AMZN', cutoffIdx: 401, horizon: 10 },
  { id: 'wn-wmt-478', symbol: 'WMT', cutoffIdx: 478, horizon: 10 },
  { id: 'wn-spy-551', symbol: 'SPY', cutoffIdx: 551, horizon: 10 },
  { id: 'wn-tsla-622', symbol: 'TSLA', cutoffIdx: 622, horizon: 10 },
  { id: 'wn-pg-700', symbol: 'PG', cutoffIdx: 700, horizon: 10 },
  { id: 'wn-qqq-779', symbol: 'QQQ', cutoffIdx: 779, horizon: 10 },
  { id: 'wn-xom-856', symbol: 'XOM', cutoffIdx: 856, horizon: 10 },
  { id: 'wn-ba-928', symbol: 'BA', cutoffIdx: 928, horizon: 10 },
  { id: 'wn-msft-998', symbol: 'MSFT', cutoffIdx: 998, horizon: 10 },
  { id: 'wn-pfe-1073', symbol: 'PFE', cutoffIdx: 1073, horizon: 10 },
  { id: 'wn-v-1148', symbol: 'V', cutoffIdx: 1148, horizon: 10 },
  { id: 'wn-goog-1234', symbol: 'GOOG', cutoffIdx: 1234, horizon: 10 },
  { id: 'wn-cost-1299', symbol: 'COST', cutoffIdx: 1299, horizon: 10 },
  { id: 'wn-qqq-1382', symbol: 'QQQ', cutoffIdx: 1382, horizon: 10 },
  { id: 'wn-jpm-1442', symbol: 'JPM', cutoffIdx: 1442, horizon: 10 },
  { id: 'wn-dis-1513', symbol: 'DIS', cutoffIdx: 1513, horizon: 10 },
  { id: 'wn-tsla-1596', symbol: 'TSLA', cutoffIdx: 1596, horizon: 10 },
  { id: 'wn-cvx-1668', symbol: 'CVX', cutoffIdx: 1668, horizon: 10 },
  { id: 'wn-cat-1743', symbol: 'CAT', cutoffIdx: 1743, horizon: 10 },
  { id: 'wn-nvda-1837', symbol: 'NVDA', cutoffIdx: 1837, horizon: 10 },
  { id: 'wn-unh-1892', symbol: 'UNH', cutoffIdx: 1892, horizon: 10 },
  { id: 'wn-ma-1974', symbol: 'MA', cutoffIdx: 1974, horizon: 10 },
  { id: 'wn-meta-2056', symbol: 'META', cutoffIdx: 2056, horizon: 10 },
  { id: 'wn-ko-2120', symbol: 'KO', cutoffIdx: 2120, horizon: 10 },
  { id: 'wn-spy-2190', symbol: 'SPY', cutoffIdx: 2190, horizon: 10 },
  { id: 'wn-bac-2244', symbol: 'BAC', cutoffIdx: 2244, horizon: 10 },
  { id: 'wn-nflx-2351', symbol: 'NFLX', cutoffIdx: 2351, horizon: 10 },
]
