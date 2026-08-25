// ─── Home: the daily dashboard ───────────────────────────────────────────────

import { Link } from 'react-router-dom'
import { REVIEW_GOAL_CAP } from '@core/gamification/streak'
import { badgeById } from '@core/gamification/badges'
import { answeredToday, drillKindForDay } from '@core/drills/engine'
import { useAppStore, appClock } from '@state/useAppStore'
import {
  TOTAL_LESSONS,
  dayLogFor,
  drillResultsOn,
  lessonsCompletedCount,
  nextLesson,
  todayQueue,
} from '@state/selectors'
import { KIND_COPY } from '@ui/drills/labels'
import { XPBar } from '@ui/components/XPBar'
import { StreakFlame } from '@ui/components/StreakFlame'
import { ProgressBar } from '@ui/components/ProgressBar'

function greeting(nowIso: string): string {
  const h = new Date(nowIso).getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

interface TaskProps {
  done: boolean
  label: string
  detail: string
  soon?: boolean
  /** When set the whole row becomes a tap target for that route. */
  to?: string
}

function TaskRow({ done, label, detail, soon = false, to }: TaskProps) {
  const body = (
    <>
      <span
        aria-hidden
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
          done
            ? 'border-emerald-400 bg-emerald-400 text-slate-950'
            : soon
              ? 'border-slate-700 text-slate-600'
              : 'border-slate-600 text-transparent'
        }`}
      >
        {done ? '✓' : soon ? '·' : ''}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${done ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
          {label}
        </p>
        <p className="text-xs text-slate-500">{detail}</p>
      </div>
      {to && !done && (
        <span aria-hidden className="shrink-0 text-slate-600">
          →
        </span>
      )}
    </>
  )

  return (
    <li data-testid="today-task" data-done={done}>
      {to ? (
        <Link to={to} className="-mx-2 flex min-h-[44px] items-center gap-3 rounded-xl px-2 py-2.5 active:bg-slate-800/60">
          {body}
        </Link>
      ) : (
        <div className="flex items-center gap-3 py-2.5">{body}</div>
      )}
    </li>
  )
}

export function HomeScreen() {
  const progress = useAppStore((s) => s.progress)
  const srs = useAppStore((s) => s.srs)
  const game = useAppStore((s) => s.game)
  const drillHistory = useAppStore((s) => s.drillHistory)

  const today = appClock.today()
  const drillDone = answeredToday(drillHistory, today)
  const todayDrill = drillResultsOn(drillHistory, today)[0]
  const day = dayLogFor({ game }, today)
  const queue = todayQueue(srs, today)
  const dueNow = queue.length
  const reviewedToday = day.reviews
  const reviewTarget = Math.min(REVIEW_GOAL_CAP, reviewedToday + dueNow)
  const reviewsDone = dueNow === 0 && reviewedToday > 0

  const next = nextLesson(progress)
  const lessonsDone = lessonsCompletedCount(progress)
  const recentBadges = [...game.badges].slice(-4).reverse()

  return (
    <div className="safe-top space-y-5 px-4 pb-4">
      <header>
        <p className="text-sm text-slate-500">{greeting(appClock.now())}</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Today’s quest</h1>
      </header>

      <StreakFlame streak={game.streak} goalMet={day.goalMet} />

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4">
        <XPBar xp={game.xp} />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Today</h2>
        <ul className="divide-y divide-slate-800/80">
          <TaskRow
            done={reviewsDone}
            label="Clear your review queue"
            detail={
              dueNow > 0
                ? `${dueNow} card${dueNow === 1 ? '' : 's'} waiting · ${reviewedToday} done`
                : reviewedToday > 0
                  ? `${reviewedToday} reviewed — all caught up`
                  : 'No cards yet — finish a lesson to mint some'
            }
          />
          <TaskRow
            done={day.lessons > 0}
            label="Complete a lesson"
            detail={
              day.lessons > 0
                ? `${day.lessons} done today`
                : next
                  ? `Up next: ${next.title}`
                  : 'Every authored lesson is complete'
            }
          />
          <TaskRow
            done={drillDone}
            to="/drills"
            label="Daily drill"
            detail={
              drillDone
                ? todayDrill && todayDrill.correct
                  ? `${KIND_COPY[todayDrill.kind].title} — called it`
                  : `${todayDrill ? KIND_COPY[todayDrill.kind].title : 'Drill'} — logged`
                : `${KIND_COPY[drillKindForDay(today)].title} — one chart, one call`
            }
          />
        </ul>
        {reviewTarget > 0 && (
          <div className="pb-1 pt-2">
            <ProgressBar
              value={reviewTarget === 0 ? 0 : reviewedToday / reviewTarget}
              label="Reviews today"
            />
          </div>
        )}
      </section>

      <section className="space-y-2.5">
        {dueNow > 0 && (
          <Link
            to="/review"
            data-testid="cta-review"
            className="flex min-h-[52px] w-full items-center justify-between rounded-2xl bg-emerald-500 px-5 py-3.5 font-bold text-slate-950 active:bg-emerald-400"
          >
            <span>Review {dueNow} card{dueNow === 1 ? '' : 's'}</span>
            <span aria-hidden>→</span>
          </Link>
        )}
        {next && (
          <Link
            to={`/lesson/${next.id}`}
            data-testid="cta-lesson"
            className={`flex min-h-[52px] w-full items-center justify-between rounded-2xl px-5 py-3.5 font-bold ${
              dueNow > 0
                ? 'border border-slate-700 bg-slate-900 text-slate-100 active:bg-slate-800'
                : 'bg-emerald-500 text-slate-950 active:bg-emerald-400'
            }`}
          >
            <span className="min-w-0 truncate pr-3 text-left">
              {day.lessons > 0 ? 'Another lesson' : 'Start today’s lesson'}
              <span className="block text-xs font-normal opacity-70">{next.title}</span>
            </span>
            <span aria-hidden>→</span>
          </Link>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Curriculum
          </h2>
          <span className="text-xs tabular-nums text-slate-500">
            {lessonsDone} / {TOTAL_LESSONS} lessons
          </span>
        </div>
        <ProgressBar value={TOTAL_LESSONS ? lessonsDone / TOTAL_LESSONS : 0} barClass="bg-sky-400" />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Badges
        </h2>
        {recentBadges.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-800 px-4 py-5 text-center text-xs text-slate-600">
            No badges yet — your first lesson earns one.
          </p>
        ) : (
          <ul className="flex gap-2 overflow-x-auto momentum pb-1" data-testid="badge-strip">
            {recentBadges.map((b) => {
              const def = badgeById(b.id)
              return (
                <li
                  key={b.id}
                  className="w-24 shrink-0 rounded-2xl border border-slate-800 bg-slate-900/70 px-2 py-3 text-center"
                >
                  <div aria-hidden className="text-2xl leading-none">
                    {def?.icon ?? '🏆'}
                  </div>
                  <p className="mt-1.5 truncate text-[11px] font-semibold text-slate-200">
                    {def?.name ?? b.id}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
