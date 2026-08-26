// ─── Case studies ────────────────────────────────────────────────────────────
// Six guided end-to-end analyses, in difficulty order. The array order IS the
// unlock order (see `isCaseUnlocked` in @core/cases/progress), and it is also a
// deliberate teaching sequence:
//
//   1  read a statement and ask "compared with what"      — margins, turnover
//   2  the gap between GAAP and cash                      — stock compensation
//   3  the gap between the equity and the enterprise      — leverage
//   4  the gap between profit and cash                    — earnings quality
//   5  the gap between three valuations of one company    — triangulation
//   6  all of it, once, ending in a sized position        — the memo
//
// Content only. Nothing here fetches, and the statements a case references are
// resolved at render time from public/data/financials/companies.json.

import type { CaseId, CaseStudy } from '@core/types'
import { CASE_1 } from './c1-steady-compounder'
import { CASE_2 } from './c2-growth-at-what-price'
import { CASE_3 } from './c3-leverage-trap'
import { CASE_4 } from './c4-earnings-quality'
import { CASE_5 } from './c5-valuation-gauntlet'
import { CASE_6 } from './c6-final-memo'

export const CASES: readonly CaseStudy[] = [CASE_1, CASE_2, CASE_3, CASE_4, CASE_5, CASE_6]

/** Ids in unlock order — the argument every helper in @core/cases/progress wants. */
export const CASE_ORDER: readonly CaseId[] = CASES.map((c) => c.id)

export function caseById(id: string): CaseStudy | undefined {
  return CASES.find((c) => c.id === id)
}

/** 1-based, for the "Case 3 of 6" label. */
export function caseNumber(id: string): number {
  return CASE_ORDER.indexOf(id) + 1
}

/** Every statement id a case refers to, de-duplicated, in first-mention order. */
export function caseStatementIds(study: CaseStudy): string[] {
  const seen = new Set<string>()
  if (typeof study.company === 'string') seen.add(study.company)
  for (const step of study.steps) {
    if (step.kind === 'thesis') continue
    for (const id of step.statementIds) seen.add(id)
  }
  return [...seen]
}
