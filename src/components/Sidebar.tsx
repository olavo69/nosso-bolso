import { NavLink } from 'react-router'
import { navItems } from '../lib/navigation'
import { useAuth } from '../context/AuthContext'

export function Sidebar() {
  const { signOut } = useAuth()

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

        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2.5 rounded-control px-3 py-[11px] text-left text-[14.5px] font-semibold text-sidebar-text-inactive transition-colors hover:text-bg"
        >
          <span className="h-[7px] w-[7px] rounded-full bg-sidebar-dot-inactive" />
          Sair
        </button>
      </nav>
    </aside>
  )
}
