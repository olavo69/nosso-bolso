import { months } from '../data/mockData'
import type { CategoryRow, GoalRow, TransactionRow } from '../types/db'
import { fmt } from './format'

export function buildFinancialContext(
  transactions: TransactionRow[],
  categories: CategoryRow[],
  goals: GoalRow[],
  monthIndex: number,
) {
  const monthTx = transactions.filter(
    (t) => new Date(`${t.data}T00:00:00`).getMonth() === monthIndex,
  )
  const income = monthTx
    .filter((t) => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0)
  const expense = monthTx
    .filter((t) => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0)
  const invested = monthTx
    .filter((t) => t.type === 'investimento')
    .reduce((sum, t) => sum + t.amount, 0)

  const catSpend: Record<string, number> = {}
  monthTx
    .filter((t) => t.type === 'despesa')
    .forEach((t) => {
      catSpend[t.categoria] = (catSpend[t.categoria] ?? 0) + t.amount
    })

  const categoriasLines = categories
    .filter((c) => c.tipo === 'despesa')
    .map((c) => {
      const spent = catSpend[c.nome] ?? 0
      const budget = c.budget ?? 0
      const status = spent > budget ? 'acima do orçamento' : 'dentro do orçamento'
      return `- ${c.nome}: gasto ${fmt(spent)} de orçamento ${fmt(budget)} (${status})`
    })
    .join('\n')

  const metasLines = goals
    .map((g) => {
      const pct = Math.round((g.current_amount / g.target) * 100)
      return `- ${g.nome}: ${fmt(g.current_amount)} guardados de ${fmt(g.target)} (${pct}%), prazo ${g.prazo}`
    })
    .join('\n')

  return [
    `Mês de referência: ${months[monthIndex]}`,
    `Saldo do mês: ${fmt(income - expense)}`,
    `Receitas: ${fmt(income)}`,
    `Despesas: ${fmt(expense)}`,
    `Investido: ${fmt(invested)} (não entra no saldo)`,
    '',
    'Gastos por categoria neste mês:',
    categoriasLines,
    '',
    'Metas de poupança do casal:',
    metasLines,
  ].join('\n')
}
