// ─── Bundled financial statements (UI layer) ─────────────────────────────────
// The financials drills reference companies by id; the statements themselves
// live in `public/data/financials/companies.json`, precached by the service
// worker alongside the OHLCV files. core/ never fetches, so — exactly like
// `loadSeries` — this is the one place that pulls the file off the wire.
//
// It is a single small file (~10KB) covering every company, so it is loaded once
// and memoised as a promise: two drills mounting in the same tick share one
// round trip and every later lookup is synchronous on the microtask queue.

import { useEffect, useState } from 'react'
import type { FinStatementSnapshot } from '@core/types'
import { statementIssues } from '@core/financials/ratios'

let pending: Promise<FinStatementSnapshot[]> | null = null

function urlFor(): string {
  return `${import.meta.env.BASE_URL}data/financials/companies.json`
}

async function fetchCompanies(): Promise<FinStatementSnapshot[]> {
  const res = await fetch(urlFor())
  if (!res.ok) throw new Error(`loadFinancials: HTTP ${res.status}`)
  const data = (await res.json()) as FinStatementSnapshot[]
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('loadFinancials: companies.json is empty or malformed')
  }
  // A statement that does not add up would render as a table of plausible
  // nonsense and quietly teach the wrong arithmetic — fail loudly instead.
  for (const s of data) {
    const issues = statementIssues(s)
    if (issues.length > 0) throw new Error(`loadFinancials: ${s.id} — ${issues[0]}`)
  }
  return data
}

/** Every bundled company statement. Memoised; a failure is evicted so it retries. */
export function loadFinancials(): Promise<FinStatementSnapshot[]> {
  if (pending) return pending
  pending = fetchCompanies().catch((err: unknown) => {
    pending = null
    throw err
  })
  return pending
}

/** Drop the memo — only used by tests. */
export function clearFinancialsCache(): void {
  pending = null
}

export interface StatementsQuery {
  /** One entry per requested id, in the order asked for. Empty until loaded. */
  statements: FinStatementSnapshot[]
  loading: boolean
  error: string | null
}

/**
 * Resolve statement ids to snapshots.
 *
 * An id with no matching company is an authoring bug in the drill definition,
 * so it surfaces as an error rather than a silently short table.
 */
export function useStatements(ids: readonly string[]): StatementsQuery {
  const key = ids.join(',')
  const [state, setState] = useState<StatementsQuery>({
    statements: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let live = true
    setState({ statements: [], loading: true, error: null })
    loadFinancials().then(
      (all) => {
        if (!live) return
        const wanted = key.split(',').filter(Boolean)
        const found: FinStatementSnapshot[] = []
        for (const id of wanted) {
          const hit = all.find((s) => s.id === id)
          if (!hit) {
            setState({ statements: [], loading: false, error: `Unknown company: ${id}` })
            return
          }
          found.push(hit)
        }
        setState({ statements: found, loading: false, error: null })
      },
      (err: unknown) => {
        if (!live) return
        setState({
          statements: [],
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        })
      },
    )
    return () => {
      live = false
    }
  }, [key])

  return state
}
