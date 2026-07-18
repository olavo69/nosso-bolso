import { NavLink } from 'react-router'
import { navItems } from '../lib/navigation'

export function Sidebar() {
  return (
    <aside className="flex w-[232px] shrink-0 flex-col gap-7 bg-sidebar p-4 pt-6">
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-accent font-heading text-[15px] font-extrabold text-accent-ink">
          NB
        </div>
        <div className="font-heading text-[17px] font-extrabold tracking-tight text-bg">
          Nosso Bolso
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-control px-3 py-[11px] text-[14.5px] font-semibold transition-colors ${
                isActive
                  ? 'bg-accent text-text'
                  : 'text-sidebar-text-inactive hover:text-bg'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`h-[7px] w-[7px] rounded-full ${
                    isActive ? 'bg-text' : 'bg-sidebar-dot-inactive'
                  }`}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2 rounded-2xl border border-sidebar-card-border bg-sidebar-card p-4">
        <div className="font-heading text-[13px] font-bold text-accent">
          Dica da IA
        </div>
        <div className="text-[12.5px] leading-relaxed text-sidebar-hint">
          Vocês gastaram 12% menos com Lazer este mês. Bom ritmo para a meta
          da viagem!
        </div>
      </div>
    </aside>
  )
}
