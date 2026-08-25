// ─── Learn: the unit map ─────────────────────────────────────────────────────

import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Unit } from '@core/types'
import { ALL_UNITS } from '@content/units'
import { useAppStore } from '@state/useAppStore'
import { UNLOCK_THRESHOLD, isUnitUnlocked, unitLessonsDone, unitProgress } from '@state/selectors'
import { ProgressBar } from '@ui/components/ProgressBar'

/** Small circular progress ring — cheap inline SVG, no icon dependency. */
function Ring({ value, locked }: { value: number; locked: boolean }) {
  const r = 16
  const c = 2 * Math.PI * r
  const pct = Math.min(1, Math.max(0, value))
  return (
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
      <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90">
        <circle cx="20" cy="20" r={r} className="fill-none stroke-slate-800" strokeWidth="4" />
        <circle
          cx="20"
          cy="20"
          r={r}
          className={`fill-none ${locked ? 'stroke-slate-700' : 'stroke-emerald-400'} transition-[stroke-dashoffset] duration-500`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <span className="absolute text-[11px] font-bold tabular-nums text-slate-300">
        {locked ? '🔒' : `${Math.round(pct * 100)}`}
      </span>
    </span>
  )
}

function UnitCard({ unit, expanded, onToggle }: { unit: Unit; expanded: boolean; onToggle: () => void }) {
  const progress = useAppStore((s) => s.progress)
  const unlocked = isUnitUnlocked(unit, progress)
  const pct = unitProgress(unit, progress)
  const done = unitLessonsDone(unit, progress)
  const prereq = ALL_UNITS.find((u) => u.id === unit.unlockAfter)
  const nextInUnit = unit.lessons.find((l) => !progress.completedLessons[l.id])?.id

  return (
    <li
      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70"
      data-testid="unit-card"
      data-unit={unit.id}
      data-locked={!unlocked}
    >
      <button
        type="button"
        onClick={unlocked ? onToggle : undefined}
        aria-expanded={expanded}
        className="flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left"
      >
        <Ring value={pct} locked={!unlocked} />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-white">{unit.title}</span>
          <span className="block truncate text-xs text-slate-500">
            {unlocked
              ? `${done} / ${unit.lessons.length} lessons`
              : `Unlocks at ${Math.round(UNLOCK_THRESHOLD * 100)}% of ${prereq?.title ?? 'the previous unit'}`}
          </span>
        </span>
        <span aria-hidden className="text-slate-600">
          {unlocked ? (expanded ? '▾' : '▸') : '🔒'}
        </span>
      </button>

      {unlocked && !expanded && pct > 0 && (
        <div className="px-4 pb-3">
          <ProgressBar value={pct} />
        </div>
      )}

      {expanded && unlocked && (
        <div className="anim-fade-up border-t border-slate-800 px-2 py-2">
          <p className="px-2 pb-2 pt-1 text-xs leading-relaxed text-slate-500">{unit.description}</p>
          <ul>
            {unit.lessons.map((lesson) => {
              const complete = Boolean(progress.completedLessons[lesson.id])
              const isNext = lesson.id === nextInUnit
              return (
                <li key={lesson.id}>
                  <Link
                    to={`/lesson/${lesson.id}`}
                    data-testid="lesson-link"
                    data-lesson={lesson.id}
                    className="flex min-h-[52px] items-center gap-3 rounded-xl px-2 py-2.5 active:bg-slate-800"
                  >
                    <span
                      aria-hidden
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        complete
                          ? 'bg-emerald-400 text-slate-950'
                          : isNext
                            ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400'
                            : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {complete ? '✓' : lesson.order}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm ${complete ? 'text-slate-400' : 'font-medium text-slate-100'}`}
                      >
                        {lesson.title}
                      </span>
                      <span className="block text-[11px] text-slate-600">
                        {lesson.minutes} min · {lesson.quiz.length} questions
                      </span>
                    </span>
                    {isNext && (
                      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-300">
                        NEXT
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </li>
  )
}

export function LearnScreen() {
  const progress = useAppStore((s) => s.progress)
  const firstOpen = ALL_UNITS.find((u) => isUnitUnlocked(u, progress) && unitProgress(u, progress) < 1)
  const [openId, setOpenId] = useState<string | null>(firstOpen?.id ?? ALL_UNITS[0]?.id ?? null)

  return (
    <div className="safe-top space-y-4 px-4 pb-4">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Learn</h1>
        <p className="text-sm text-slate-500">
          {ALL_UNITS.length} units authored · more arriving each update
        </p>
      </header>

      <ul className="space-y-3">
        {ALL_UNITS.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            expanded={openId === unit.id}
            onToggle={() => setOpenId((cur) => (cur === unit.id ? null : unit.id))}
          />
        ))}
      </ul>

      <p className="px-1 pt-2 text-center text-xs leading-relaxed text-slate-600">
        Units 3–14 — statements, ratios, valuation, technicals, risk and behaviour — are on the
        roadmap.
      </p>
    </div>
  )
}
