// ─── Trade: pick a symbol, see the price, place the order ────────────────────
// Two steps in one route. `/trade` is the picker; `/trade?symbol=AAPL` is the
// ticket for that name, so the browser back button steps back to the grid and a
// position row on the Portfolio screen can deep-link straight into its ticket.
//
// The rule the whole screen is built around: **the fill happens at the price
// that was on screen.** The quote is fetched once per ticket, displayed with its
// `asOf` stamp, badged when it is a bundled (stale) close, and handed to
// `placeTrade` unchanged. No re-quote between preview and confirm.

import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { sliceSeries } from '@core/market/bundled'
import {
  CONCENTRATION_WARN_PCT,
  concentrationPct,
  sharesHeld,
} from '@core/portfolio/engine'
import { XP_JOURNAL_NOTE } from '@core/gamification/xp'
import type { Transaction } from '@core/types'
import { useAppStore } from '@state/useAppStore'
import type { TradeOutcome } from '@state/useAppStore'
import { useQuotes } from '@ui/data/quotes'
import { useSeries } from '@ui/data/loadSeries'
import { usePortfolioValuation } from '@ui/data/usePortfolio'
import { TRADABLE_SYMBOLS, searchUniverse, symbolName } from '@ui/data/universe'
import { CandleChart, ATTRIBUTION } from '@ui/charts/CandleChart'
import { money, pct, pnlTone, qty as fmtQty, shortDate, signedMoney } from '@ui/format'

/** Bars of history on the ticket's mini chart — about six months. */
const PREVIEW_BARS = 120

type Side = 'buy' | 'sell'
type Mode = 'shares' | 'dollars'

// ── Symbol picker ────────────────────────────────────────────────────────────

function SymbolPicker({ onPick }: { onPick: (symbol: string) => void }) {
  const [query, setQuery] = useState('')
  const { portfolio } = usePortfolioValuation()
  const { quotes } = useQuotes(TRADABLE_SYMBOLS)
  const matches = searchUniverse(query)

  return (
    <div className="space-y-4" data-testid="symbol-picker">
      <input
        type="search"
        inputMode="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search 27 symbols — AAPL, Netflix…"
        aria-label="Search symbols"
        data-testid="symbol-search"
        className="min-h-[44px] w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
      />

      {matches.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-800 px-4 py-8 text-center text-xs text-slate-600">
          Nothing matches “{query}”. The tradable universe is the 27 symbols that ship with the app,
          so every one of them can be priced offline.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2">
          {matches.map((u) => {
            const q = quotes[u.symbol]
            const held = sharesHeld(portfolio, u.symbol)
            return (
              <li key={u.symbol}>
                <button
                  type="button"
                  data-testid="symbol-tile"
                  data-symbol={u.symbol}
                  onClick={() => onPick(u.symbol)}
                  className="flex min-h-[76px] w-full flex-col items-start justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2.5 text-left active:bg-slate-800"
                >
                  <div className="flex w-full items-baseline justify-between gap-1">
                    <span className="text-sm font-extrabold tracking-tight text-slate-100">
                      {u.symbol}
                    </span>
                    {held > 0 && (
                      <span className="rounded bg-emerald-500/15 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-300">
                        held
                      </span>
                    )}
                  </div>
                  <span className="w-full truncate text-[11px] text-slate-500">{u.name}</span>
                  <span className="mt-0.5 text-xs font-semibold tabular-nums text-slate-300">
                    {q ? money(q.price) : '···'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ── Fill summary ─────────────────────────────────────────────────────────────

function SuccessPanel({
  tx,
  realized,
  xp,
  cash,
  onAgain,
}: {
  tx: Transaction
  realized?: number
  xp: number
  /** Cash left after the fill — read from the already-updated store. */
  cash: number
  onAgain: () => void
}) {
  const notional = tx.qty * tx.price
  return (
    <div className="space-y-4" data-testid="trade-success">
      <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-6 text-center">
        <p aria-hidden className="text-5xl">
          ✅
        </p>
        <p className="mt-3 text-lg font-extrabold text-white">
          {tx.side === 'buy' ? 'Bought' : 'Sold'} {fmtQty(tx.qty)} {tx.symbol}
        </p>
        <p className="mt-1 text-sm tabular-nums text-slate-300">
          {money(notional)} at {money(tx.price)}/sh
        </p>
        <p className="mt-1 text-xs tabular-nums text-slate-500" data-testid="success-cash">
          Cash now {money(cash)}
        </p>
        {realized !== undefined && (
          <p
            className={`mt-3 text-sm font-bold tabular-nums ${pnlTone(realized)}`}
            data-testid="success-realized"
          >
            {signedMoney(realized)} realized
          </p>
        )}
        {xp > 0 && (
          <p
            className="mt-3 inline-block rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300"
            data-testid="success-xp"
          >
            +{xp} XP · journal note
          </p>
        )}
        {tx.note && (
          <p className="mt-3 text-[12px] italic leading-snug text-slate-400">“{tx.note}”</p>
        )}
      </div>

      <Link
        to="/portfolio"
        data-testid="success-portfolio"
        className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 font-bold text-slate-950 active:bg-emerald-400"
      >
        Back to Portfolio
      </Link>
      <button
        type="button"
        onClick={onAgain}
        data-testid="success-again"
        className="flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-5 font-bold text-slate-100 active:bg-slate-800"
      >
        Place another trade
      </button>
    </div>
  )
}

// ── Ticket ───────────────────────────────────────────────────────────────────

function TradeTicket({ symbol }: { symbol: string }) {
  const placeTrade = useAppStore((s) => s.placeTrade)
  const { portfolio, prices, equity } = usePortfolioValuation()
  const { quotes } = useQuotes([symbol])
  const { series } = useSeries(symbol)

  const [side, setSide] = useState<Side>('buy')
  const [mode, setMode] = useState<Mode>('dollars')
  const [amount, setAmount] = useState('')
  /**
   * Full-precision quantity behind a percentage chip. `held / 2` is
   * 23.149219871290338 shares — correct, and unreadable in a text field. The
   * field shows the trimmed number and this carries the exact one through to the
   * engine, so "Sell all" actually empties the position instead of leaving
   * $0.004 of dust behind.
   */
  const [exact, setExact] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<Extract<TradeOutcome, { ok: true }> | null>(null)

  const quote = quotes[symbol]
  const price = quote?.price ?? 0
  const held = sharesHeld(portfolio, symbol)

  const window = useMemo(() => {
    if (!series) return null
    const end = series.t.length - 1
    return sliceSeries(series, Math.max(0, end - PREVIEW_BARS + 1), end)
  }, [series])

  // ── Order maths ──
  const typed = Number(amount)
  const typedOk = Number.isFinite(typed) && typed > 0 && price > 0
  // In dollar mode the quantity is deliberately *not* rounded: rounding it to
  // four decimals first would make "$10,000 of AAPL" cost $9,999.99.
  const qty = !typedOk ? 0 : mode === 'shares' ? (exact ?? typed) : typed / price
  const valid = qty > 0 && price > 0
  const notional = Math.round(qty * price * 100) / 100
  const cashAfter = Math.round((portfolio.cash + (side === 'buy' ? -notional : notional)) * 100) / 100

  const heldValue = held * (prices[symbol] ?? price)
  const weightAfter =
    side === 'buy'
      ? concentrationPct(portfolio, symbol, notional, prices)
      : equity.equity > 0
        ? (Math.max(0, heldValue - notional) / equity.equity) * 100
        : 0
  const concentrated = side === 'buy' && weightAfter >= CONCENTRATION_WARN_PCT

  function confirm() {
    const outcome = placeTrade({ symbol, side, qty, price, note })
    if (!outcome.ok) {
      setError(outcome.error)
      return
    }
    setError(null)
    setDone(outcome)
  }

  function reset() {
    setDone(null)
    setAmount('')
    setExact(null)
    setNote('')
    setError(null)
  }

  if (done) {
    return (
      <SuccessPanel
        tx={done.tx}
        realized={done.realized}
        xp={done.xp}
        cash={portfolio.cash}
        onAgain={reset}
      />
    )
  }

  const chips: { label: string; value: number }[] =
    side === 'sell'
      ? [
          { label: '25%', value: held / 4 },
          { label: '50%', value: held / 2 },
          { label: 'Sell all', value: held },
        ]
      : mode === 'dollars'
        ? [
            { label: '$1,000', value: 1000 },
            { label: '$5,000', value: 5000 },
            { label: '$10,000', value: 10_000 },
          ]
        : [
            { label: '1 sh', value: 1 },
            { label: '5 sh', value: 5 },
            { label: '10 sh', value: 10 },
          ]

  return (
    <div className="space-y-4" data-testid="trade-ticket" data-symbol={symbol}>
      {/* ── Quote ── */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lg font-extrabold tracking-tight text-white">{symbol}</p>
            <p className="truncate text-xs text-slate-500">{symbolName(symbol)}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-extrabold tabular-nums text-white" data-testid="quote-price">
              {quote ? money(quote.price) : '···'}
            </p>
            {quote && (
              <p className="text-[10px] text-slate-500" data-testid="quote-asof">
                as of {shortDate(quote.asOf)}
              </p>
            )}
          </div>
        </div>
        {quote?.stale && (
          <p
            className="mt-2 flex items-center gap-2 rounded-lg bg-amber-500/10 px-2 py-1.5 text-[10px] leading-tight text-amber-300"
            data-testid="stale-badge"
          >
            <span className="rounded bg-amber-400/20 px-1.5 py-0.5 font-bold uppercase tracking-widest">
              Stale
            </span>
            Bundled data — last close, not a live quote.
          </p>
        )}
        {held > 0 && (
          <p className="mt-2 text-[11px] tabular-nums text-slate-400" data-testid="held-qty">
            You hold {fmtQty(held)} sh · {money(heldValue)}
          </p>
        )}
      </section>

      {/* ── Chart ── */}
      {window && (
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 pt-2">
          <CandleChart series={window} height={180} />
          <p className="px-3 pb-2 pt-1 text-[9px] text-slate-600">
            Last {window.t.length} sessions · {ATTRIBUTION}
          </p>
        </section>
      )}

      {/* ── Side ── */}
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Buy or sell">
        {(['buy', 'sell'] as Side[]).map((s) => {
          const disabled = s === 'sell' && held <= 0
          return (
            <button
              key={s}
              type="button"
              disabled={disabled}
              data-testid={`side-${s}`}
              data-active={side === s}
              onClick={() => {
                setSide(s)
                setAmount('')
                setExact(null)
                setError(null)
                if (s === 'sell') setMode('shares')
              }}
              className={`min-h-[44px] rounded-2xl border text-sm font-bold uppercase tracking-wide transition-colors ${
                side === s
                  ? s === 'buy'
                    ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                    : 'border-rose-400 bg-rose-500 text-slate-950'
                  : disabled
                    ? 'border-slate-800 text-slate-700'
                    : 'border-slate-700 bg-slate-900 text-slate-300 active:bg-slate-800'
              }`}
            >
              {s}
            </button>
          )
        })}
      </div>

      {/* ── Amount ── */}
      <section className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <label htmlFor="tq-amount" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {mode === 'shares' ? 'Shares' : 'Amount'}
          </label>
          <div className="flex overflow-hidden rounded-lg border border-slate-700">
            {(['shares', 'dollars'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                data-testid={`mode-${m}`}
                data-active={mode === m}
                onClick={() => {
                  setMode(m)
                  setAmount('')
                  setExact(null)
                }}
                className={`min-h-[32px] px-3 text-[11px] font-bold uppercase tracking-wide ${
                  mode === m ? 'bg-slate-700 text-slate-100' : 'text-slate-500'
                }`}
              >
                {m === 'shares' ? 'Shares' : '$'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'dollars' && <span className="text-2xl font-bold text-slate-500">$</span>}
          <input
            id="tq-amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(/[^0-9.]/g, ''))
              setExact(null)
              setError(null)
            }}
            placeholder="0"
            data-testid="qty-input"
            className="min-h-[48px] w-full bg-transparent text-2xl font-extrabold tabular-nums text-white placeholder:text-slate-700 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          {chips.map((c) => (
            <button
              key={c.label}
              type="button"
              data-testid="amount-chip"
              data-chip={c.label}
              onClick={() => {
                setAmount(String(Math.round(c.value * 10000) / 10000))
                setExact(mode === 'shares' ? c.value : null)
                setError(null)
              }}
              className="min-h-[32px] flex-1 rounded-lg border border-slate-700 px-2 text-[11px] font-semibold text-slate-300 active:bg-slate-800"
            >
              {c.label}
            </button>
          ))}
        </div>

        {valid && (
          <p className="text-[11px] tabular-nums text-slate-500" data-testid="qty-derived">
            {mode === 'dollars'
              ? `≈ ${fmtQty(Math.round(qty * 10000) / 10000)} shares`
              : `≈ ${money(notional)}`}
            {exact !== null && exact === held && ' · closes the position'}
          </p>
        )}
      </section>

      {/* ── Preview ── */}
      <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3.5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-slate-400">{side === 'buy' ? 'Cost' : 'Proceeds'}</span>
          <span className="font-bold tabular-nums text-slate-100" data-testid="preview-cost">
            {money(notional)}
          </span>
        </div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-slate-400">Cash after</span>
          <span
            className={`font-bold tabular-nums ${cashAfter < 0 ? 'text-rose-400' : 'text-slate-100'}`}
            data-testid="preview-cash-after"
          >
            {money(cashAfter)}
          </span>
        </div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-slate-400">{symbol} share of portfolio</span>
          <span
            className={`font-bold tabular-nums ${concentrated ? 'text-amber-300' : 'text-slate-100'}`}
            data-testid="preview-weight"
          >
            {pct(weightAfter)}
          </span>
        </div>
        {concentrated && (
          <p
            className="rounded-lg bg-amber-500/10 px-2.5 py-2 text-[11px] leading-snug text-amber-300"
            data-testid="concentration-warning"
          >
            Over {CONCENTRATION_WARN_PCT}% in one name. That is a bet on a company, not a portfolio —
            fine if you meant it, expensive if you did not.
          </p>
        )}
      </section>

      {/* ── Journal ── */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5">
        <label htmlFor="tq-note" className="text-xs font-semibold text-slate-300">
          Why this trade?{' '}
          <span className="font-bold text-amber-300">+{XP_JOURNAL_NOTE} XP</span>
        </label>
        <input
          id="tq-note"
          type="text"
          maxLength={140}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="One line — the thesis you can be held to later"
          data-testid="note-input"
          className="mt-2 min-h-[40px] w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
        />
      </section>

      {error && (
        <p
          role="alert"
          data-testid="trade-error"
          className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={confirm}
        disabled={!valid}
        data-testid="confirm-btn"
        className={`flex min-h-[54px] w-full items-center justify-center rounded-2xl px-5 text-base font-extrabold ${
          !valid
            ? 'bg-slate-800 text-slate-600'
            : side === 'buy'
              ? 'bg-emerald-500 text-slate-950 active:bg-emerald-400'
              : 'bg-rose-500 text-slate-950 active:bg-rose-400'
        }`}
      >
        {side === 'buy' ? 'Buy' : 'Sell'} {valid ? money(notional) : ''} {symbol}
      </button>
    </div>
  )
}

// ── Route ────────────────────────────────────────────────────────────────────

export function TradeScreen() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const raw = params.get('symbol')
  const symbol = raw && TRADABLE_SYMBOLS.includes(raw.toUpperCase()) ? raw.toUpperCase() : null

  return (
    <div className="safe-top space-y-4 px-4 pb-10" data-testid="trade-screen">
      <header className="flex items-center gap-3">
        <button
          type="button"
          aria-label={symbol ? 'Back to symbols' : 'Back to Portfolio'}
          data-testid="trade-back"
          onClick={() => (symbol ? setParams({}) : navigate('/portfolio'))}
          className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-slate-400 active:bg-slate-800"
        >
          ←
        </button>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-slate-500">Paper trade</p>
          <h1 className="truncate text-xl font-extrabold tracking-tight text-white">
            {symbol ? `${symbol} ticket` : 'Pick a symbol'}
          </h1>
        </div>
      </header>

      {symbol ? (
        <TradeTicket key={symbol} symbol={symbol} />
      ) : (
        <SymbolPicker onPick={(s) => setParams({ symbol: s })} />
      )}
    </div>
  )
}
