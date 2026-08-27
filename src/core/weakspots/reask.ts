// ─── Re-asking a missed question ─────────────────────────────────────────────
// The same item, with its four choices in a different order.
//
// WHY REORDER AT ALL. A learner who missed `u05-l03-q2` saw the right answer
// highlighted immediately afterwards, and what sticks from that is often "it
// was the third one" rather than the reasoning. Re-asking with the original
// order would let position memory answer the question, and the bank would
// retire an item nobody has actually re-learned.
//
// WHY NOT FORCE THE ANSWER TO MOVE. The tempting rule — "never put the correct
// choice back where it was" — is itself a leak: it hands anyone who notices it
// a free elimination on every single re-ask. A seeded shuffle leaves the answer
// where it was about a quarter of the time, which is exactly the uncertainty
// that makes position memory useless. The one case worth fixing is the whole
// permutation coming back unchanged (1 in 24), because then nothing was
// reordered at all; that one is rotated.
//
// WHY SEEDED RATHER THAN RANDOM. The order has to be the same on every render
// of the same step, across a reload, and on the learner's other device — the
// screen re-renders on every tap, and choices that reshuffled underneath a
// thumb would be a genuine misfire rather than a cosmetic one. Seeding on the
// item id gives that for free with no state to persist.
//
// Pure, dependency-free, and DOM-free like the rest of core/.

import type { QuizItem } from '@core/types'

/** Namespaced so the order cannot accidentally track the placement sampler's. */
export const REASK_SEED = 'tq.weakspot.reask.v1'

/**
 * FNV-1a + mulberry32, the same pair `@core/placement/engine` and
 * `@core/drills/engine` each keep their own copy of. Four lines is cheaper to
 * read in place than a shared module every generator would have to import.
 */
function hash32(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * The display order for one item: `order[slot]` is the index the choice at that
 * slot has in the authored item.
 *
 * Same item id, same order, forever.
 */
export function reaskOrder(itemId: string, size = 4): number[] {
  const rng = mulberry32(hash32(`${REASK_SEED}:${itemId}`))
  const order = Array.from({ length: size }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  // A shuffle that changed nothing is not a re-ask. Rotate it by one so every
  // item is genuinely reordered, without pinning where the answer lands.
  if (order.every((v, i) => v === i)) order.push(order.shift() as number)
  return order
}

export interface ReaskedItem {
  /** The original item, untouched — `explain`, `prompt` and ids all still apply. */
  item: QuizItem
  /** Choice texts in display order. */
  choices: string[]
  /** Where the correct answer now sits. */
  answerIdx: number
  /** `order[slot]` → index in `item.choices`. */
  order: number[]
}

export function reaskItem(item: QuizItem): ReaskedItem {
  const order = reaskOrder(item.id, item.choices.length)
  return {
    item,
    choices: order.map((i) => item.choices[i]),
    answerIdx: order.indexOf(item.answerIdx),
    order,
  }
}
