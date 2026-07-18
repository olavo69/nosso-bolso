import { useNavigate } from 'react-router'
import type { Goal } from '../../data/mockData'
import { colorFor } from '../../lib/format'

type GoalsInFocusProps = {
  goals: Goal[]
}

export function GoalsInFocus({ goals }: GoalsInFocusProps) {
  const navigate = useNavigate()
  const topGoals = goals.slice(0, 2)

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-[22px_24px]">
      <div className="flex items-center justify-between">
        <div className="font-heading text-[15px] font-bold">Metas em foco</div>
        <button
          type="button"
          onClick={() => navigate('/metas')}
          className="text-[12.5px] font-bold text-accent"
        >
          ver todas
        </button>
      </div>

      {topGoals.map((goal) => {
        const pct = Math.min(100, Math.round((goal.current / goal.target) * 100))
        return (
          <div key={goal.id} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[12.5px]">
              <div className="font-semibold">{goal.nome}</div>
              <div className="text-text-secondary">{pct}%</div>
            </div>
            <div className="h-[7px] overflow-hidden rounded-pill bg-pill-bg">
              <div
                className="h-full rounded-pill transition-[width] duration-500 ease-out"
                style={{ width: `${pct}%`, background: colorFor(goal.hue) }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
