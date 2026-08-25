interface Props {
  icon: string
  title: string
  tagline: string
  bullets: string[]
  note: string
}

/** Shared placeholder for Phase 2/3 screens — deliberately on-brand, not a stub. */
export function ComingSoon({ icon, title, tagline, bullets, note }: Props) {
  return (
    <div className="safe-top space-y-5 px-4 pb-6" data-testid="coming-soon">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">{title}</h1>
        <span className="mt-1 inline-block rounded-md bg-sky-500/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-sky-300">
          Coming in the next update
        </span>
      </header>

      <div className="flex flex-col items-center rounded-3xl border border-slate-800 bg-slate-900/70 px-5 py-8 text-center">
        <div aria-hidden className="text-6xl">
          {icon}
        </div>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-300">{tagline}</p>
      </div>

      <ul className="space-y-2.5">
        {bullets.map((b) => (
          <li
            key={b}
            className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-[13px] leading-relaxed text-slate-400"
          >
            <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
            {b}
          </li>
        ))}
      </ul>

      <p className="px-2 text-center text-xs text-slate-600">{note}</p>
    </div>
  )
}
