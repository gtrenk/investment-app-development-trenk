// ─── Watchlist star ──────────────────────────────────────────────────────────
// The whole watchlist feature from the learner's side: one tap, everywhere a
// symbol appears. It renders as a real `aria-pressed` toggle rather than a
// decorated glyph, because "is this one starred" has to be answerable by a
// screen reader and by a test without reading colours.

import { useAppStore } from '@state/useAppStore'

export function StarButton({
  symbol,
  className = '',
}: {
  symbol: string
  className?: string
}) {
  const watchlist = useAppStore((s) => s.watchlist)
  const toggleWatchlist = useAppStore((s) => s.toggleWatchlist)
  const watched = watchlist.includes(symbol)

  return (
    <button
      type="button"
      data-testid="watch-toggle"
      data-symbol={symbol}
      data-watched={watched}
      aria-pressed={watched}
      aria-label={watched ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
      onClick={(e) => {
        // The star often sits on top of a tile or a row that navigates.
        e.preventDefault()
        e.stopPropagation()
        toggleWatchlist(symbol)
      }}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-lg leading-none transition-colors ${
        watched ? 'text-amber-300' : 'text-slate-500 active:text-slate-300'
      } ${className}`}
    >
      <span aria-hidden>{watched ? '★' : '☆'}</span>
    </button>
  )
}
