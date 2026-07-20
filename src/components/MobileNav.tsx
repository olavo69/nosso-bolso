import { NavLink } from 'react-router'
import { navItems } from '../lib/navigation'

const mobileLabels: Record<string, string> = {
  dashboard: 'Início',
  extrato: 'Extrato',
  categorias: 'Categorias',
  metas: 'Metas',
  chat: 'Chat',
  perfil: 'Perfil',
}

export function MobileNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-sidebar-card-border bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.key}
          to={item.path}
          end={item.path === '/'}
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2.5"
        >
          {({ isActive }) => (
            <>
              <span
                className={`h-[6px] w-[6px] rounded-full ${
                  isActive ? 'bg-accent' : 'bg-sidebar-dot-inactive'
                }`}
              />
              <span
                className={`max-w-full truncate px-0.5 text-[9.5px] font-semibold ${
                  isActive ? 'text-bg' : 'text-sidebar-text-inactive'
                }`}
              >
                {mobileLabels[item.key]}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
