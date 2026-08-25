// ─── Portfolio: the paper account ────────────────────────────────────────────
// Marked to market on every open. Everything here is derived — the store holds
// cash, lots, transactions and daily snapshots, and nothing else.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CONCENTRATION_WARN_PCT } from '@core/portfolio/engine'
import { performanceSeries } from '@core/portfolio/benchmark'
import {
  LIMIT_ORDER_TTL_DAYS,
  orderAgeDays,
  visibleOrders,
} from '@core/portfolio/limitOrders'
import {
  dayChange,
  positionRows,
  transactionsNewestFirst,
  vsBenchmarkPct,
} from '@state/selectors'
import { useAppStore, appClock } from '@state/useAppStore'
import { usePortfolioValuation } from '@ui/data/usePortfolio'
import { useWatchlistRows } from '@ui/data/useOrders'
import { symbolName } from '@ui/data/universe'
import { PerformanceChart } from '@ui/charts/PerformanceChart'
import { StarButton } from '@ui/components/StarButton'
import { money, pct, pnlTone, qty as fmtQty, shortDate, signedMoney, signedPct, stampDate } from '@ui/format'

/**
 * One label/value line. Deliberately a row and not a tile in a 3-up grid: at
 * 390px a third of the width clips `$100,000.00`, and shrinking the type to fit
 * makes the most important numbers on the screen the hardest to read.
 */
function Stat({
  label,
  value,
  tone = 'text-slate-100',
  testId,
}: {
  label: string
  value: string
  tone?: string
  testId?: string
}) {
  return (
    <div className="flex items-baseline justify-between px-4 py-2.5">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`text-base font-bold tabular-nums ${tone}`} data-testid={testId}>
        {value}
      </span>
    </div>
  )
}

/** One resting (or lapsed) limit order. */
function OrderRow({
  order,
  today,
  onCancel,
}: {
  order: ReturnType<typeof visibleOrders>[number]
  today: string
  onCancel: (id: string) => void
}) {
  const age = orderAgeDays(order, today)
  const expired = order.status === 'expired'
  return (
    <li
      data-testid="order-row"
      data-symbol={order.symbol}
      data-status={order.status}
      className="flex items-center gap-3 px-4 py-3"
    >
      <span
        className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
          expired
            ? 'bg-slate-700/60 text-slate-400'
            : order.side === 'buy'
              ? 'bg-emerald-500/15 text-emerald-300'
              : 'bg-rose-500/15 text-rose-300'
        }`}
      >
        {order.side}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-100">
          {fmtQty(order.qty)} {order.symbol}
          <span className="ml-1.5 font-normal tabular-nums text-slate-400">
            @ {money(order.limitPrice)}
          </span>
        </p>
        <p className="text-[11px] text-slate-500" data-testid="order-age">
          {expired
            ? `Expired unfilled after ${LIMIT_ORDER_TTL_DAYS} days`
            : age === 0
              ? 'Placed today'
              : `Resting ${age} day${age === 1 ? '' : 's'} · ${LIMIT_ORDER_TTL_DAYS - age} left`}
        </p>
      </div>
      <button
        type="button"
        data-testid="order-cancel"
        onClick={() => onCancel(order.id)}
        className="min-h-[36px] shrink-0 rounded-lg border border-slate-700 px-2.5 text-[11px] font-semibold text-slate-300 active:bg-slate-800"
      >
        {expired ? 'Clear' : 'Cancel'}
      </button>
    </li>
  )
}

export function PortfolioScreen() {
  const [showHistory, setShowHistory] = useState(false)
  const { portfolio, equity, prices, quotes, spyPrice, loading, stale } = usePortfolioValuation()
  const openOrders = useAppStore((s) => s.openOrders)
  const cancelLimitOrder = useAppStore((s) => s.cancelLimitOrder)
  const { rows: watchRows } = useWatchlistRows()
  const orders = visibleOrders(openOrders)
  const today = appClock.today()

  const rows = positionRows(portfolio, prices, equity.equity)
  const curve = performanceSeries(portfolio)
  const change = dayChange(portfolio, equity.equity)
  const vsSpy = spyPrice === null ? null : vsBenchmarkPct(portfolio, equity.equity, spyPrice)
  const txs = transactionsNewestFirst(portfolio)
  const traded = txs.length > 0
  const hasSold = portfolio.transactions.some((t) => t.side === 'sell')
  const asOf = quotes.SPY?.asOf

  return (
    <div className="safe-top space-y-5 px-4 pb-4" data-testid="portfolio-screen">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Paper account</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Portfolio</h1>
        </div>
        {stale && (
          <span
            data-testid="stale-badge"
            className="mt-1 shrink-0 rounded-md bg-amber-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-300"
          >
            Stale
          </span>
        )}
      </header>

      {/* ── Headline ── */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 px-5 py-5">
        <p className="text-[11px] uppercase tracking-widest text-slate-500">Total equity</p>
        <p
          className="mt-1 text-4xl font-extrabold tabular-nums tracking-tight text-white"
          data-testid="portfolio-equity"
        >
          {loading && !traded ? '—' : money(equity.equity)}
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          {change ? (
            <span className={`tabular-nums ${pnlTone(change.abs)}`} data-testid="portfolio-daychange">
              {signedMoney(change.abs)} ({signedPct(change.pct)}) today
            </span>
          ) : (
            <span className="text-xs text-slate-500" data-testid="portfolio-daychange-empty">
              Day change appears after your first overnight
            </span>
          )}
          {vsSpy !== null && (
            <span
              className={`tabular-nums text-xs ${pnlTone(vsSpy)}`}
              data-testid="portfolio-vs-spy"
            >
              {signedPct(vsSpy)} vs SPY
            </span>
          )}
        </div>
        {asOf && (
          <p className="mt-2 text-[11px] text-slate-500" data-testid="portfolio-asof">
            Priced as of {shortDate(asOf)}
            {stale ? ' — bundled data' : ''}
          </p>
        )}
        {equity.pricesMissing.length > 0 && (
          <p className="mt-1 text-[11px] text-amber-300/80" data-testid="portfolio-unpriced">
            No quote for {equity.pricesMissing.join(', ')} — held at cost.
          </p>
        )}
      </section>

      <section className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900/70">
        <Stat label="Cash" value={money(equity.cash)} testId="portfolio-cash" />
        <Stat label="Invested" value={money(equity.positionsValue)} testId="portfolio-invested" />
        <Stat
          label="Unrealized P&L"
          value={signedMoney(equity.unrealizedPnl)}
          tone={pnlTone(equity.unrealizedPnl)}
          testId="portfolio-unrealized"
        />
      </section>

      {(hasSold || portfolio.realizedPnl !== 0) && (
        <section
          className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3"
          data-testid="realized-pnl"
        >
          <div>
            <p className="text-sm font-semibold text-slate-200">Realized P&amp;L</p>
            <p className="text-[11px] text-slate-500">Locked in by closed lots, FIFO</p>
          </div>
          <p
            className={`text-lg font-bold tabular-nums ${pnlTone(portfolio.realizedPnl)}`}
            data-testid="realized-pnl-value"
          >
            {signedMoney(portfolio.realizedPnl)}
          </p>
        </section>
      )}

      {/* ── Equity vs SPY ── */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          You vs the index
        </h2>
        {/* The benchmark is initialised on first open, so a snapshot can exist
            before any trade does. Until something has actually been bought,
            there is no "you" line worth plotting — say so instead. */}
        {!traded || curve.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed border-slate-800 px-4 py-8 text-center"
            data-testid="perf-empty"
          >
            <p className="text-3xl" aria-hidden>
              📉
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-300">Make your first trade</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              The day you buy something, $100,000 also goes into SPY. From then on this chart shows
              which of you is winning.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-4">
            <PerformanceChart points={curve} />
            {curve.length < 2 && (
              <p className="mt-2 text-center text-[11px] text-slate-600" data-testid="perf-one-point">
                One point so far — the curve draws itself a day at a time.
              </p>
            )}
          </div>
        )}
      </section>

      <Link
        to="/trade"
        data-testid="cta-trade"
        className="flex min-h-[52px] w-full items-center justify-between rounded-2xl bg-emerald-500 px-5 py-3.5 font-bold text-slate-950 active:bg-emerald-400"
      >
        <span>Trade</span>
        <span aria-hidden>→</span>
      </Link>

      {/* ── Positions ── */}
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Positions
          </h2>
          <span className="text-xs tabular-nums text-slate-500">{rows.length}</span>
        </div>
        {rows.length === 0 ? (
          <p
            className="rounded-2xl border border-dashed border-slate-800 px-4 py-6 text-center text-xs text-slate-600"
            data-testid="positions-empty"
          >
            No positions yet — all {money(equity.cash)} of it is still cash.
          </p>
        ) : (
          <ul className="divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            {rows.map((r) => (
              <li key={r.symbol} data-testid="position-row" data-symbol={r.symbol}>
                <Link
                  to={`/trade?symbol=${r.symbol}`}
                  className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-800/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-100">
                      {r.symbol}
                      <span className="ml-2 text-[11px] font-normal text-slate-500">
                        {symbolName(r.symbol)}
                      </span>
                    </p>
                    <p className="text-[11px] tabular-nums text-slate-500">
                      {fmtQty(r.qty)} sh · avg {money(r.avgCost)}
                      {r.unpriced && <span className="ml-1 text-amber-300/80">· at cost</span>}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold tabular-nums text-slate-100" data-testid="position-value">
                      {money(r.marketValue)}
                    </p>
                    <p className={`text-[11px] tabular-nums ${pnlTone(r.unrealizedPnl)}`} data-testid="position-pnl">
                      {signedMoney(r.unrealizedPnl)} ({signedPct(r.unrealizedPct)})
                    </p>
                  </div>
                  <span
                    className={`w-11 shrink-0 text-right text-[11px] tabular-nums ${
                      r.weightPct >= CONCENTRATION_WARN_PCT ? 'text-amber-300' : 'text-slate-500'
                    }`}
                    data-testid="position-weight"
                  >
                    {pct(r.weightPct)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Open orders ──
          Only rendered when there are any: an empty "Open Orders" header on a
          screen that already has an empty Positions state is two dead sections
          telling the learner the same thing. */}
      {orders.length > 0 && (
        <section data-testid="orders-section">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Open orders
            </h2>
            <span className="text-xs tabular-nums text-slate-500">{orders.length}</span>
          </div>
          <ul className="divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            {orders.map((o) => (
              <OrderRow key={o.id} order={o} today={today} onCancel={cancelLimitOrder} />
            ))}
          </ul>
          <p className="mt-1.5 px-1 text-[11px] leading-relaxed text-slate-600">
            Checked against the daily bars each time you open the app — a limit that was crossed
            while you were away fills at that day’s price, not today’s.
          </p>
        </section>
      )}

      {/* ── Watchlist ── */}
      {watchRows.length > 0 && (
        <section data-testid="watchlist-section">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Watchlist
            </h2>
            <span className="text-xs tabular-nums text-slate-500">{watchRows.length}</span>
          </div>
          <ul className="divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            {watchRows.map((w) => (
              <li
                key={w.symbol}
                data-testid="watch-row"
                data-symbol={w.symbol}
                className="flex items-center"
              >
                <Link
                  to={`/trade?symbol=${w.symbol}`}
                  className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-4 active:bg-slate-800/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-100">
                      {w.symbol}
                      <span className="ml-2 text-[11px] font-normal text-slate-500">
                        {symbolName(w.symbol)}
                      </span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className="text-sm font-bold tabular-nums text-slate-100"
                      data-testid="watch-price"
                    >
                      {w.price === null ? '···' : money(w.price)}
                    </p>
                    <p
                      className={`text-[11px] tabular-nums ${
                        w.change === null ? 'text-slate-500' : pnlTone(w.change)
                      }`}
                      data-testid="watch-change"
                    >
                      {w.change === null || w.changePct === null
                        ? '—'
                        : `${signedMoney(w.change)} (${signedPct(w.changePct)})`}
                    </p>
                  </div>
                </Link>
                <StarButton symbol={w.symbol} className="mr-1 shrink-0" />
              </li>
            ))}
          </ul>
          <p className="mt-1.5 px-1 text-[11px] leading-relaxed text-slate-600">
            Move shown against the previous bundled close.
          </p>
        </section>
      )}

      {/* ── History ── */}
      {traded && (
        <section>
          <button
            type="button"
            data-testid="tx-toggle"
            aria-expanded={showHistory}
            onClick={() => setShowHistory((v) => !v)}
            className="flex min-h-[44px] w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-left"
          >
            <span className="text-sm font-semibold text-slate-200">
              History <span className="text-slate-500">({txs.length})</span>
            </span>
            <span aria-hidden className="text-slate-500">
              {showHistory ? '▲' : '▼'}
            </span>
          </button>
          {showHistory && (
            <ul className="mt-2 divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
              {txs.map((t) => (
                <li key={t.id} data-testid="tx-row" data-side={t.side} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-100">
                      <span
                        className={
                          t.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        {t.side === 'buy' ? 'Bought' : 'Sold'}
                      </span>{' '}
                      {fmtQty(t.qty)} {t.symbol}
                    </p>
                    <p className="shrink-0 text-sm tabular-nums text-slate-300">
                      {money(t.qty * t.price)}
                    </p>
                  </div>
                  <p className="text-[11px] tabular-nums text-slate-500">
                    {stampDate(t.ts)} · {money(t.price)}/sh
                  </p>
                  {t.note && (
                    <p
                      data-testid="tx-note"
                      className="mt-1.5 border-l-2 border-slate-700 pl-2 text-[12px] italic leading-snug text-slate-400"
                    >
                      “{t.note}”
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="px-1 text-[11px] leading-relaxed text-slate-600">
        Virtual money, real prices. Fills happen at the quote you were shown, with no spread, no
        commission and no slippage — which flatters every strategy you will ever test here.
      </p>
    </div>
  )
}
