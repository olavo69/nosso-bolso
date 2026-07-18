import { months } from '../../data/mockData'
import type { PeriodMode } from '../../lib/period'

const periodOptions: { key: PeriodMode; label: string }[] = [
  { key: 'mes', label: 'Mês' },
  { key: 'trimestre', label: 'Trimestre' },
  { key: 'ano', label: 'Ano' },
  { key: 'custom', label: 'Personalizado' },
]

type PeriodBarProps = {
  monthIndex: number
  onPrevMonth: () => void
  onNextMonth: () => void
  periodMode: PeriodMode
  onPeriodModeChange: (mode: PeriodMode) => void
  customStart: string
  onCustomStartChange: (value: string) => void
  customEnd: string
  onCustomEndChange: (value: string) => void
}

export function PeriodBar({
  monthIndex,
  onPrevMonth,
  onNextMonth,
  periodMode,
  onPeriodModeChange,
  customStart,
  onCustomStartChange,
  customEnd,
  onCustomEndChange,
}: PeriodBarProps) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="flex items-center gap-3.5 rounded-[14px] border border-border bg-surface px-3.5 py-2">
        <button
          type="button"
          onClick={onPrevMonth}
          className="cursor-pointer px-2 py-0.5 font-bold text-text-secondary"
        >
          ‹
        </button>
        <div className="min-w-[120px] text-center text-sm font-bold">
          {months[monthIndex]}
        </div>
        <button
          type="button"
          onClick={onNextMonth}
          className="cursor-pointer px-2 py-0.5 font-bold text-text-secondary"
        >
          ›
        </button>
      </div>

      <div className="flex gap-0.5 rounded-control bg-pill-bg p-1">
        {periodOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onPeriodModeChange(option.key)}
            className={`rounded-[10px] px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
              periodMode === option.key
                ? 'bg-text text-bg'
                : 'text-text-secondary'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {periodMode === 'custom' && (
        <div className="flex items-center gap-2 rounded-[14px] border border-border bg-surface px-3 py-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => onCustomStartChange(e.target.value)}
            className="border-none text-[12.5px] text-text outline-none"
          />
          <div className="text-xs text-text-muted">até</div>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="border-none text-[12.5px] text-text outline-none"
          />
        </div>
      )}
    </div>
  )
}
