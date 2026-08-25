interface Props {
  /** 0–1 */
  value: number
  className?: string
  /** Tailwind bg-* class for the filled portion */
  barClass?: string
  label?: string
}

export function ProgressBar({ value, className = '', barClass = 'bg-emerald-400', label }: Props) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-slate-800 ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${barClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
