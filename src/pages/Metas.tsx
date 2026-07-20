import { useState } from 'react'
import { GoalCard } from '../components/metas/GoalCard'
import { NewGoalModal } from '../components/metas/NewGoalModal'
import { useGoals } from '../context/GoalsContext'

export function Metas() {
  const { goals } = useGoals()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex min-h-[170px] flex-col items-center justify-center gap-2 rounded-card border-[1.5px] border-dashed border-[#D8D2C0] text-text-muted transition-colors hover:border-[#B9B199] hover:text-text-secondary"
      >
        <div className="text-[26px] font-light">+</div>
        <div className="text-[13px] font-semibold">Nova meta</div>
      </button>

      <NewGoalModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
