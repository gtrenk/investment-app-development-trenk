// ─── Display formatting ──────────────────────────────────────────────────────
// Money and share quantities are shown in exactly one way across the app, so a
// number never reads differently on two screens. Pure string helpers — no
// rounding decisions leak back into the engines, which keep full precision.

/** `$1,234.50` — always two decimals, always a thousands separator. */
export function money(x: number): string {
  if (!Number.isFinite(x)) return '—'
  const sign = x < 0 ? '−' : ''
  return `${sign}$${Math.abs(x).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** `+$1,234.50` / `−$12.00` — for P&L, where the sign carries the meaning. */
export function signedMoney(x: number): string {
  if (!Number.isFinite(x)) return '—'
  return `${x > 0 ? '+' : ''}${money(x)}`
}

/** `+1.24%` — two decimals, explicit sign. */
export function signedPct(x: number): string {
  if (!Number.isFinite(x)) return '—'
  return `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.abs(x).toFixed(2)}%`
}

/** `12.5%` — unsigned, one decimal. Used for weights and concentration. */
export function pct(x: number, dp = 1): string {
  if (!Number.isFinite(x)) return '—'
  return `${x.toFixed(dp)}%`
}

/**
 * Share quantity: up to 4 decimals, trailing zeros trimmed.
 * `46.2984` · `10` · `0.5`
 */
export function qty(x: number): string {
  if (!Number.isFinite(x)) return '—'
  return x.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 })
}

/** Tailwind text colour for a P&L figure — green up, rose down, slate flat. */
export function pnlTone(x: number): string {
  if (!Number.isFinite(x) || x === 0) return 'text-slate-300'
  return x > 0 ? 'text-emerald-400' : 'text-rose-400'
}

/** `Aug 21, 2026` from an ISO timestamp or `YYYY-MM-DD`. */
export function shortDate(iso: string): string {
  const ms = Date.parse(iso.length === 10 ? `${iso}T00:00:00Z` : iso)
  if (!Number.isFinite(ms)) return iso
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * `Aug 21` — the day a transaction was filled, in the viewer's local zone.
 * Deliberately no year and no time: the history list is read as "when, roughly",
 * and the full ISO stamp is still on the record for anything that needs it.
 */
export function stampDate(iso: string): string {
  const ms = Date.parse(iso)
  if (!Number.isFinite(ms)) return iso
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
