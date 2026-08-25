import type { StreakState } from '@core/types'

export function StreakFlame({ streak, goalMet }: { streak: StreakState; goalMet: boolean }) {
  const alive = streak.current > 0
  return (
    <div
      data-testid="streak-flame"
      className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3"
    >
      <span
        aria-hidden
        className={`text-3xl leading-none ${alive ? '' : 'opacity-30 grayscale'} ${
          goalMet ? 'anim-pop' : ''
        }`}
      >
        🔥
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-2xl font-extrabold tabular-nums text-orange-300"
            data-testid="streak-count"
          >
            {streak.current}
          </span>
          <span className="text-sm text-slate-400">day{streak.current === 1 ? '' : 's'}</span>
        </div>
        <p className="truncate text-xs text-slate-500">
          {goalMet
            ? 'Goal met today — nice.'
            : alive
              ? 'Keep it alive today'
              : 'Start your streak today'}
          {streak.freezes > 0 && (
            <span className="ml-1 text-sky-300" title="Streak freezes banked">
              · {'❄️'.repeat(streak.freezes)}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
