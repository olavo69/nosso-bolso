import type { Goal } from '../../data/mockData'
import { colorFor, fmt, tintFor } from '../../lib/format'

type GoalCardProps = {
  goal: Goal
}

export function GoalCard({ goal }: GoalCardProps) {
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100))

  return (
    <div className="pop-in flex flex-col gap-3.5 rounded-card border border-border bg-surface p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-heading text-base font-bold">{goal.nome}</div>
          <div className="mt-0.5 text-xs text-text-muted">
            Meta para {goal.prazo}
          </div>
        </div>
        <div
          className="rounded-pill px-2.5 py-1 text-xs font-bold"
          style={{ color: colorFor(goal.hue), background: tintFor(goal.hue) }}
        >
          {pct}%
        </div>
      </div>

      <div className="h-[9px] overflow-hidden rounded-pill bg-pill-bg">
        <div
          className="h-full rounded-pill transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%`, background: colorFor(goal.hue) }}
        />
      </div>

      <div className="flex justify-between text-[13.5px] text-text-secondary">
        <div>
          Guardado: <span className="font-bold text-text">{fmt(goal.current)}</span>
        </div>
        <div>
          Meta: <span className="font-bold text-text">{fmt(goal.target)}</span>
        </div>
      </div>
    </div>
  )
}
