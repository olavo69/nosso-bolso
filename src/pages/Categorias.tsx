import { useMemo } from 'react'
import { CategoryCard } from '../components/categorias/CategoryCard'
import { budgets, DEFAULT_MONTH_INDEX, hues, transactions } from '../data/mockData'

export function Categorias() {
  const catSpend = useMemo(() => {
    const spend: Record<string, number> = {}
    transactions
      .filter((t) => t.month === DEFAULT_MONTH_INDEX && t.type === 'despesa')
      .forEach((t) => {
        spend[t.categoria] = (spend[t.categoria] ?? 0) + t.amount
      })
    return spend
  }, [])

  return (
    <div className="grid grid-cols-3 gap-[18px]">
      {Object.keys(budgets).map((nome) => (
        <CategoryCard
          key={nome}
          nome={nome}
          hue={hues[nome] ?? 0}
          spent={catSpend[nome] ?? 0}
          budget={budgets[nome]}
        />
      ))}

      <button
        type="button"
        className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-card border-[1.5px] border-dashed border-[#D8D2C0] text-text-muted transition-colors hover:border-[#B9B199] hover:text-text-secondary"
      >
        <div className="text-[26px] font-light">+</div>
        <div className="text-[13px] font-semibold">Nova categoria</div>
      </button>
    </div>
  )
}
