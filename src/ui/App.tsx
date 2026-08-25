// ─── App shell & routing ─────────────────────────────────────────────────────

import { useEffect } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import { useAppStore, appClock } from '@state/useAppStore'
import { todayQueue } from '@state/selectors'
import { TabBar } from './components/TabBar'
import { CelebrationOverlay } from './components/CelebrationOverlay'
import { HomeScreen } from './screens/HomeScreen'
import { LearnScreen } from './screens/LearnScreen'
import { LessonPlayer } from './screens/LessonPlayer'
import { ReviewScreen } from './screens/ReviewScreen'
import { DrillsScreen } from './screens/DrillsScreen'
import { PortfolioScreen } from './screens/PortfolioScreen'

function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-950">
      <div className="text-center">
        <div aria-hidden className="mb-3 text-4xl">
          📈
        </div>
        <p className="text-sm tracking-widest text-slate-500">TICKERQUEST</p>
      </div>
    </div>
  )
}

/** Layout for the five tabbed screens. */
function TabLayout() {
  const srs = useAppStore((s) => s.srs)
  const dueCount = todayQueue(srs, appClock.today()).length
  return (
    <>
      <main className="momentum pad-for-tabbar safe-x mx-auto min-h-dvh w-full max-w-md">
        <Outlet />
      </main>
      <TabBar dueCount={dueCount} />
    </>
  )
}

/** Full-screen layout with no tab bar — used for focused lesson flows. */
function FocusLayout() {
  return (
    <main className="momentum safe-x mx-auto min-h-dvh w-full max-w-md">
      <Outlet />
    </main>
  )
}

function NotFound() {
  return (
    <div className="safe-top px-4 py-16 text-center">
      <p className="text-5xl">🧭</p>
      <h1 className="mt-4 text-lg font-bold text-slate-100">Nothing here</h1>
      <p className="mt-1 text-sm text-slate-500">That screen does not exist yet.</p>
    </div>
  )
}

export default function App() {
  const ready = useAppStore((s) => s.ready)
  const hydrate = useAppStore((s) => s.hydrate)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  if (!ready) return <Splash />

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <Routes>
        <Route element={<TabLayout />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/learn" element={<LearnScreen />} />
          <Route path="/review" element={<ReviewScreen />} />
          <Route path="/drills" element={<DrillsScreen />} />
          <Route path="/portfolio" element={<PortfolioScreen />} />
        </Route>
        <Route element={<FocusLayout />}>
          <Route path="/lesson/:id" element={<LessonPlayer />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CelebrationOverlay />
    </div>
  )
}
