import { useMemo } from 'react'
import { CategoryCard } from '../components/categorias/CategoryCard'
import { DEFAULT_MONTH_INDEX } from '../data/mockData'
import { useTransactions } from '../context/TransactionsContext'
import { useCategories } from '../context/CategoriesContext'

export function Categorias() {
  const { transactions } = useTransactions()
  const { categories } = useCategories()
  const despesaCategories = categories.filter((c) => c.tipo === 'despesa')

  const catSpend = useMemo(() => {
    const spend: Record<string, number> = {}
    transactions
      .filter(
        (t) =>
          new Date(`${t.data}T00:00:00`).getMonth() === DEFAULT_MONTH_INDEX &&
          t.type === 'despesa',
      )
      .forEach((t) => {
        spend[t.categoria] = (spend[t.categoria] ?? 0) + t.amount
      })
    return spend
  }, [transactions])

  return (
    <div className="grid grid-cols-3 gap-[18px]">
      {despesaCategories.map((cat) => (
        <CategoryCard
          key={cat.id}
          nome={cat.nome}
          hue={cat.hue}
          spent={catSpend[cat.nome] ?? 0}
          budget={cat.budget ?? 0}
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
