import { levelFor, levelProgress, xpForNextLevel, xpIntoLevel } from '@core/gamification/xp'
import { ProgressBar } from './ProgressBar'

export function XPBar({ xp }: { xp: number }) {
  const level = levelFor(xp)
  const into = xpIntoLevel(xp)
  const need = xpForNextLevel(level)

  return (
    <div data-testid="xp-bar">
      <div className="mb-1.5 flex items-end justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-bold tracking-wide text-emerald-300">
            LEVEL {level}
          </span>
          <span className="text-xs text-slate-400" data-testid="xp-total">
            {xp} XP
          </span>
        </div>
        <span className="text-xs tabular-nums text-slate-400">
          {into} / {need}
        </span>
      </div>
      <ProgressBar value={levelProgress(xp)} label={`Level ${level} progress`} />
    </div>
  )
}
