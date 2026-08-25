import { Markdown } from './Markdown'

interface Props {
  front: string
  back: string
  revealed: boolean
  onReveal: () => void
}

/**
 * Front and back are rendered exclusively (rather than as two faces of a 3D
 * flip) so "what is on screen" is unambiguous for both screen readers and the
 * e2e suite. The slide-in animation carries the same sense of a turn.
 */
export function Flashcard({ front, back, revealed, onReveal }: Props) {
  return (
    <button
      type="button"
      onClick={revealed ? undefined : onReveal}
      data-testid="flashcard"
      data-face={revealed ? 'back' : 'front'}
      className="flex min-h-[15rem] w-full flex-col justify-center rounded-3xl border border-slate-800 bg-slate-900 px-5 py-7 text-left shadow-lg shadow-black/30 disabled:cursor-default"
    >
      {revealed ? (
        <div key="back" className="anim-slide-in">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Answer
          </p>
          <div className="text-[15px] text-slate-100" data-testid="card-back">
            <Markdown md={back} />
          </div>
          <p className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-500">{front}</p>
        </div>
      ) : (
        <div key="front" className="anim-fade-up text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Recall it
          </p>
          <p className="text-xl font-semibold leading-snug text-white" data-testid="card-front">
            {front}
          </p>
          <p className="mt-6 text-sm text-emerald-400">Tap to reveal</p>
        </div>
      )}
    </button>
  )
}
