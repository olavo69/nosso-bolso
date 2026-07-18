import { useLocation } from 'react-router'
import { navItems, viewTitles } from '../lib/navigation'

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
  const view = navItems.find((item) => item.path === pathname)?.key ?? 'dashboard'
  const [title, subtitle] = viewTitles[view]

  return (
    <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-border bg-topbar-bg px-8">
      <div>
        <div className="font-heading text-xl font-extrabold">{title}</div>
        <div className="mt-0.5 text-[13px] text-text-secondary">
          {subtitle}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-0.5 rounded-pill bg-pill-bg p-1">
          <button
            type="button"
            onClick={() => onToggleCouple(false)}
            className={`rounded-pill px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
              !coupleMode ? 'bg-surface text-text' : 'text-text-muted'
            }`}
          >
            Individual
          </button>
          <button
            type="button"
            onClick={() => onToggleCouple(true)}
            className={`rounded-pill px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
              coupleMode ? 'bg-surface text-text' : 'text-text-muted'
            }`}
          >
            Casal
          </button>
        </div>

        <div className="flex items-center">
          <div className="z-[2] flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-topbar-bg bg-[#D9C9A3] text-xs font-bold text-text">
            AS
          </div>
          {coupleMode && (
            <div className="-ml-[10px] flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-topbar-bg bg-[#A9C9B8] text-xs font-bold text-text">
              MS
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onNewTransaction}
          className="whitespace-nowrap rounded-control bg-accent px-[18px] py-[11px] text-[13.5px] font-bold text-accent-ink shadow-[0_6px_16px_-6px_var(--color-accent)] transition-transform hover:-translate-y-px"
        >
          + Nova transação
        </button>
      </div>
    </header>
  )
}
