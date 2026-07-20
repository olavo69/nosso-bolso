import { useLocation } from 'react-router'
import { navItems, viewTitles } from '../lib/navigation'
import { useAuth } from '../context/AuthContext'
import { initials } from '../lib/format'

type TopbarProps = {
  coupleMode: boolean
  onToggleCouple: (coupleMode: boolean) => void
  onNewTransaction: () => void
}

export function Topbar({
  coupleMode,
  onToggleCouple,
  onNewTransaction,
}: TopbarProps) {
  const { pathname } = useLocation()
  const { profile, partnerProfile } = useAuth()
  const view = navItems.find((item) => item.path === pathname)?.key ?? 'dashboard'
  const [defaultTitle, subtitle] = viewTitles[view]
  const firstName = profile?.name.split(' ')[0]
  const title = view === 'dashboard' && firstName ? `Olá, ${firstName} 👋` : defaultTitle

  return (
    <header className="flex h-auto min-h-[64px] shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border bg-topbar-bg px-4 py-2.5 sm:h-[76px] sm:flex-nowrap sm:px-8 sm:py-0">
      <div className="min-w-0">
        <div className="truncate font-heading text-base font-extrabold sm:text-xl">
          {title}
        </div>
        <div className="mt-0.5 hidden text-[13px] text-text-secondary sm:block">
          {subtitle}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex gap-0.5 rounded-pill bg-pill-bg p-1">
          <button
            type="button"
            onClick={() => onToggleCouple(false)}
            className={`rounded-pill px-2.5 py-1.5 text-[11.5px] font-bold transition-colors sm:px-3.5 sm:py-2 sm:text-[12.5px] ${
              !coupleMode ? 'bg-surface text-text' : 'text-text-muted'
            }`}
          >
            Individual
          </button>
          <button
            type="button"
            onClick={() => onToggleCouple(true)}
            className={`rounded-pill px-2.5 py-1.5 text-[11.5px] font-bold transition-colors sm:px-3.5 sm:py-2 sm:text-[12.5px] ${
              coupleMode ? 'bg-surface text-text' : 'text-text-muted'
            }`}
          >
            Casal
          </button>
        </div>

        <div className="hidden items-center sm:flex">
          <div className="z-[2] flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-topbar-bg bg-[#D9C9A3] text-xs font-bold text-text">
            {profile ? initials(profile.name) : '…'}
          </div>
          {coupleMode && partnerProfile && (
            <div className="-ml-[10px] flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-topbar-bg bg-[#A9C9B8] text-xs font-bold text-text">
              {initials(partnerProfile.name)}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onNewTransaction}
          className="whitespace-nowrap rounded-control bg-accent px-3 py-2 text-[13px] font-bold text-accent-ink shadow-[0_6px_16px_-6px_var(--color-accent)] transition-transform hover:-translate-y-px sm:px-[18px] sm:py-[11px] sm:text-[13.5px]"
        >
          <span className="sm:hidden">+</span>
          <span className="hidden sm:inline">+ Nova transação</span>
        </button>
      </div>
    </header>
  )
}
