import { GoalCard } from '../components/metas/GoalCard'
import { goals } from '../data/mockData'

export function Metas() {
  return (
    <div className="grid grid-cols-2 gap-[18px]">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}

      <button
        type="button"
        className="flex min-h-[170px] flex-col items-center justify-center gap-2 rounded-card border-[1.5px] border-dashed border-[#D8D2C0] text-text-muted transition-colors hover:border-[#B9B199] hover:text-text-secondary"
      >
        <div className="text-[26px] font-light">+</div>
        <div className="text-[13px] font-semibold">Nova meta</div>
      </button>
    </div>
  )
}
