// ─── App shell & routing ─────────────────────────────────────────────────────

import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { useAppStore, appClock } from '@state/useAppStore'
import { useProfilesStore } from '@state/profiles'
import { initProfileSync } from '@state/sync'
import { todayQueue } from '@state/selectors'
import { ProfilePicker } from './screens/ProfilePicker'
import { TabBar } from './components/TabBar'
import { CelebrationOverlay } from './components/CelebrationOverlay'
import { HomeScreen } from './screens/HomeScreen'
import { SessionScreen } from './screens/SessionScreen'
import { LearnScreen } from './screens/LearnScreen'
import { LessonPlayer } from './screens/LessonPlayer'
import { PlacementScreen } from './screens/PlacementScreen'
import { ReviewScreen } from './screens/ReviewScreen'
import { DrillsScreen } from './screens/DrillsScreen'
import { DrillPlayer } from './screens/DrillPlayer'
import { DrillStatsScreen } from './screens/DrillStatsScreen'
import { CASE_ROUTES } from './screens/caseRoutes'
import { PortfolioScreen } from './screens/PortfolioScreen'
import { TradeScreen } from './screens/TradeScreen'
import { SessionRail } from './components/SessionRail'
import { SessionGuard } from './session/useSessionFlow'
import { PortfolioSync } from './data/usePortfolio'
import { LimitOrderSync } from './data/useOrders'
import { stop as stopSpeech } from './speech/tts'

/**
 * Speech is a tab-wide singleton, so somebody has to own "the screen changed —
 * stop talking". Doing it here rather than in each screen's unmount covers the
 * cases a screen cannot see: the tab bar, the browser Back gesture, a deep link
 * from a notification. Its cleanup runs before the incoming screen's effects,
 * so a route that starts reading immediately is not cut off by the exit of the
 * one it replaced.
 */
function StopSpeechOnNavigate() {
  const { pathname } = useLocation()
  useEffect(() => stopSpeech, [pathname])
  return null
}

/**
 * Every route change starts at the top of the page.
 *
 * The browser keeps the scroll offset when only the React tree changes, which
 * was survivable while screens were entered from a list — but a Smart Session
 * hands one full-height screen straight to the next, and arriving at a lesson
 * already scrolled past its own header (and past the session rail) is simply
 * wrong. Cheap, global, and it fixes the same annoyance on the tab bar.
 */
function ScrollToTopOnNavigate() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

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
  const pace = useAppStore((s) => s.settings.pace)
  const dueCount = todayQueue(srs, appClock.today(), pace).length
  return (
    <>
      <main className="momentum pad-for-tabbar safe-x mx-auto min-h-dvh w-full max-w-md">
        {/* Renders only while a Smart Session is live; see SessionRail. */}
        <SessionRail />
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
      <SessionRail />
      <Outlet />
    </main>
  )
}

/**
 * The lesson player, keyed on the lesson.
 *
 * React Router keeps one element mounted across a change of `:id`, which was
 * harmless while lessons were only ever entered from a list — but a Smart
 * Session goes lesson → lesson directly, and a player that keeps its `step`
 * (and its "already settled" flag) would show the second lesson's completion
 * panel the instant it arrived, without ever playing or recording it.
 */
function LessonRoute() {
  const { id = '' } = useParams()
  return <LessonPlayer key={id} />
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
  const profilesLoaded = useProfilesStore((s) => s.loaded)
  const activeId = useProfilesStore((s) => s.meta.activeId)
  const loadProfiles = useProfilesStore((s) => s.load)

  // Two-stage boot: which profile, then that profile's state. The store's own
  // hydrate() awaits the same memoised registry read, so the order is safe even
  // though these effects fire independently.
  useEffect(() => {
    void loadProfiles()
  }, [loadProfiles])

  useEffect(() => {
    if (activeId) void hydrate()
  }, [activeId, hydrate])

  // Stage three, and only once the store has read what is on this device: cloud
  // sync pulls whatever the other device left behind and takes over persistence
  // duty. Inert unless the profile opted in and a worker origin is configured,
  // so for most installs this effect does nothing at all.
  useEffect(() => {
    if (activeId && ready) void initProfileSync()
  }, [activeId, ready])

  // Stage one is still running: nothing at all is known yet.
  if (!profilesLoaded) return <Splash />

  // The picker reads only the profile registry, so it renders as soon as stage
  // one lands — whether nobody is signed in (it is then the whole app) or the
  // signed-in profile's state is still loading behind it.
  if (!activeId || !ready) {
    return (
      <div className="min-h-dvh bg-slate-950 text-slate-100">
        <Routes>
          <Route path="/profiles" element={<ProfilePicker />} />
          <Route
            path="*"
            element={activeId ? <Splash /> : <Navigate to="/profiles" replace />}
          />
        </Routes>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <StopSpeechOnNavigate />
      <ScrollToTopOnNavigate />
      <SessionGuard />
      <Routes>
        <Route path="/profiles" element={<ProfilePicker />} />
        <Route element={<TabLayout />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/learn" element={<LearnScreen />} />
          <Route path="/review" element={<ReviewScreen />} />
          <Route path="/drills" element={<DrillsScreen />} />
          <Route path="/portfolio" element={<PortfolioScreen />} />
        </Route>
        <Route element={<FocusLayout />}>
          <Route path="/session" element={<SessionScreen />} />
          <Route path="/lesson/:id" element={<LessonRoute />} />
          <Route path="/placement" element={<PlacementScreen />} />
          <Route path="/drill" element={<DrillPlayer />} />
          <Route path="/drill-stats" element={<DrillStatsScreen />} />
          <Route path="/trade" element={<TradeScreen />} />
          {CASE_ROUTES.map((r) => <Route key={r.path} path={r.path} element={r.element} />)}
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <PortfolioSync />
      <LimitOrderSync />
      <CelebrationOverlay />
    </div>
  )
}
