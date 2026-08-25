export type ChoiceState = 'idle' | 'correct' | 'wrong' | 'revealed'

interface Props {
  index: number
  text: string
  state: ChoiceState
  disabled: boolean
  onPick: () => void
}

const LETTERS = ['A', 'B', 'C', 'D']

const SHELL: Record<ChoiceState, string> = {
  idle: 'border-slate-700 bg-slate-900 active:bg-slate-800',
  correct: 'border-emerald-400 bg-emerald-500/15',
  wrong: 'border-rose-400 bg-rose-500/15',
  revealed: 'border-emerald-500/50 bg-emerald-500/10',
}

const BADGE: Record<ChoiceState, string> = {
  idle: 'bg-slate-800 text-slate-400',
  correct: 'bg-emerald-400 text-slate-950',
  wrong: 'bg-rose-400 text-slate-950',
  revealed: 'bg-emerald-500/40 text-emerald-100',
}

export function QuizChoice({ index, text, state, disabled, onPick }: Props) {
  return (
    <button
      type="button"
      data-testid="quiz-choice"
      data-state={state}
      disabled={disabled}
      onClick={onPick}
      className={`flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors ${SHELL[state]} disabled:cursor-default`}
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${BADGE[state]}`}
      >
        {state === 'correct' || state === 'revealed' ? '✓' : state === 'wrong' ? '✕' : LETTERS[index]}
      </span>
      <span className="pt-0.5 text-[15px] leading-snug text-slate-100">{text}</span>
    </button>
  )
}
