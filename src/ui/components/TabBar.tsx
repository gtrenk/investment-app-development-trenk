import { NavLink } from 'react-router-dom'

interface Tab {
  to: string
  label: string
  icon: string
}

const TABS: Tab[] = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/learn', label: 'Learn', icon: '📚' },
  { to: '/review', label: 'Review', icon: '🧠' },
  { to: '/drills', label: 'Drills', icon: '📈' },
  { to: '/portfolio', label: 'Portfolio', icon: '💼' },
]

export function TabBar({ dueCount = 0 }: { dueCount?: number }) {
  return (
    <nav
      data-testid="tab-bar"
      className="safe-bottom safe-x fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.to === '/'}
              data-testid={`tab-${tab.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex h-16 min-h-[44px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-500'
                }`
              }
            >
              <span aria-hidden className="relative text-xl leading-none">
                {tab.icon}
                {tab.to === '/review' && dueCount > 0 && (
                  <span className="absolute -right-2.5 -top-1 min-w-[1.05rem] rounded-full bg-emerald-500 px-1 text-[10px] font-bold leading-[1.05rem] text-slate-950">
                    {dueCount > 99 ? '99+' : dueCount}
                  </span>
                )}
              </span>
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
