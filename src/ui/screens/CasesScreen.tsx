// ─── Case studies: the list ──────────────────────────────────────────────────
// Six cards in a fixed order, each locked until the one before it is finished.
// The lock is not a game mechanic bolted on — case 5 assumes the learner has
// already argued with a cheap P/E in case 3 — so the locked state says which
// case unlocks it rather than just refusing.

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CASES, CASE_ORDER } from '@content/cases'
import { XP_CASE_QUESTION, caseItems, caseThesisCount, completionXp, isCaseUnlocked } from '@core/cases/progress'
import type { CaseStudy } from '@core/types'
import { useCasesStore } from '@state/cases'

type CardState = 'done' | 'resume' | 'open' | 'locked'

const SHELL: Record<CardState, string> = {
  done: 'border-emerald-500/40 bg-emerald-500/5',
  resume: 'border-emerald-500/60 bg-slate-900',
  open: 'border-slate-700 bg-slate-900',
  locked: 'border-slate-800 bg-slate-900/40',
}

const BADGE: Record<CardState, string> = {
  done: 'bg-emerald-400 text-slate-950',
  resume: 'bg-emerald-500/20 text-emerald-300',
  open: 'bg-slate-800 text-slate-300',
  locked: 'bg-slate-800/70 text-slate-600',
}

function CaseCard({
  study,
  index,
  state,
  detail,
}: {
  study: CaseStudy
  index: number
  state: CardState
  detail: string
}) {
  const body = (
    <>
      <span
        aria-hidden
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold tabular-nums ${BADGE[state]}`}
      >
        {state === 'done' ? '✓' : state === 'locked' ? '🔒' : index + 1}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-[15px] font-bold leading-tight ${
            state === 'locked' ? 'text-slate-500' : 'text-white'
          }`}
        >
          {study.title}
        </span>
        <span
          className={`mt-1 block text-[12.5px] leading-snug ${
            state === 'locked' ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          {study.blurb}
        </span>
        <span
          className={`mt-1.5 block text-[11px] font-semibold uppercase tracking-wide ${
            state === 'done'
              ? 'text-emerald-300'
              : state === 'resume'
                ? 'text-emerald-400'
                : state === 'locked'
                  ? 'text-slate-600'
                  : 'text-slate-500'
          }`}
        >
          {detail}
        </span>
      </span>
    </>
  )

  const className = `flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3.5 text-left ${SHELL[state]}`

  if (state === 'locked') {
    return (
      <div
        data-testid="case-card"
        data-case-id={study.id}
        data-state={state}
        aria-disabled="true"
        className={className}
      >
        {body}
      </div>
    )
  }

  return (
    <Link
      to={`/case/${study.id}`}
      data-testid="case-card"
      data-case-id={study.id}
      data-state={state}
      className={`${className} active:bg-slate-800`}
    >
      {body}
    </Link>
  )
}

export function CasesScreen() {
  const hydrate = useCasesStore((s) => s.hydrate)
  const ready = useCasesStore((s) => s.ready)
  const completed = useCasesStore((s) => s.completed)
  const inProgress = useCasesStore((s) => s.inProgress)
  const pendingXp = useCasesStore((s) => s.pendingXp)
  // Lifetime case XP: completed cases' credit (drained into the main XP total at
  // finish) plus whatever an in-progress case has accrued but not yet claimed.
  const lifetimeCaseXp =
    pendingXp +
    Object.entries(completed).reduce(
      (sum, [id, c]) => sum + c.score * XP_CASE_QUESTION + completionXp(id),
      0,
    )

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  const doneCount = CASE_ORDER.filter((id) => completed[id]).length

  return (
    <div className="safe-top space-y-6 px-4 pb-12" data-testid="cases-screen" data-ready={ready}>
      <header className="flex items-center gap-3">
        <Link
          to="/drills"
          aria-label="Back to Drills"
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-400 active:bg-slate-800"
        >
          ←
        </Link>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-slate-500">Applied practice</p>
          <h1 className="text-xl font-extrabold tracking-tight text-white">Case studies</h1>
        </div>
      </header>

      <p className="text-sm leading-relaxed text-slate-400">
        Six guided analyses, end to end: read the statements, compute the ratios, judge the
        quality, value the business, make the call — then compare with the model verdict.
      </p>

      <section className="grid grid-cols-2 gap-2.5" data-testid="cases-summary">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5">
          <p className="text-2xl font-extrabold tabular-nums text-white" data-testid="cases-done">
            {doneCount}
            <span className="text-base text-slate-500">/{CASES.length}</span>
          </p>
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">cases complete</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5">
          <p className="text-2xl font-extrabold tabular-nums text-white" data-testid="cases-xp">
            {lifetimeCaseXp}
          </p>
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">case XP earned</p>
        </div>
      </section>

      <ul className="space-y-2.5" data-testid="cases-list">
        {CASES.map((study, i) => {
          const record = completed[study.id]
          const unlocked = isCaseUnlocked({ completed, inProgress, pendingXp }, CASE_ORDER, study.id)
          const resuming = inProgress?.caseId === study.id && inProgress.stepIdx > 0
          const state: CardState = record
            ? 'done'
            : !unlocked
              ? 'locked'
              : resuming
                ? 'resume'
                : 'open'

          const detail = record
            ? `Complete · ${record.score}/${record.total || caseItems(study).length} · ${record.date}`
            : !unlocked
              ? `Finish case ${i} to unlock`
              : resuming
                ? `Resume · step ${Math.min(inProgress.stepIdx + 1, study.steps.length)} of ${study.steps.length}`
                : `${study.steps.length} steps · ${caseItems(study).length} questions · ${caseThesisCount(study)} written`

          return (
            <li key={study.id}>
              <CaseCard study={study} index={i} state={state} detail={detail} />
            </li>
          )
        })}
      </ul>

      <p className="text-xs leading-relaxed text-slate-600">
        Cases unlock in order. Each builds on the one before it — case 5 assumes you have already
        argued with a cheap P/E in case 3.
      </p>
    </div>
  )
}
