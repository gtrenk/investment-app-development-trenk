// ─── Case-study routes ───────────────────────────────────────────────────────
//
// NOTE FOR WHOEVER WIRES THE SHELL: these two routes are exported as data
// rather than being added to App.tsx by hand, because the case-study work and
// the app-shell work landed in the same wave and App.tsx has one owner. The
// shell mounts them with a single line inside the `FocusLayout` block:
//
//     {CASE_ROUTES.map((r) => <Route key={r.path} path={r.path} element={r.element} />)}
//
// Both belong in `FocusLayout`, not `TabLayout`: neither has a tab, and the
// player is a full-screen reading flow that must not lose 4rem to a tab bar.
//
// There is no entry point from any tabbed screen yet. The intended one is a
// "Case studies" card on the Drills screen, linking to `/cases`; until that
// lands, `/cases` is reachable by URL and by the back link inside the flow.

import type { ReactElement } from 'react'
import { CasesScreen } from './CasesScreen'
import { CasePlayer } from './CasePlayer'

export interface CaseRoute {
  path: string
  element: ReactElement
}

export const CASE_ROUTES: readonly CaseRoute[] = [
  { path: '/cases', element: <CasesScreen /> },
  { path: '/case/:id', element: <CasePlayer /> },
]
