import { budgets, goals, months, type Transaction } from '../data/mockData'
import { fmt } from './format'

export function buildFinancialContext(
  transactions: Transaction[],
  monthIndex: number,
) {
  const monthTx = transactions.filter((t) => t.month === monthIndex)
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

  const categoriasLines = Object.keys(budgets)
    .map((nome) => {
      const spent = catSpend[nome] ?? 0
      const budget = budgets[nome]
      const status = spent > budget ? 'acima do orçamento' : 'dentro do orçamento'
      return `- ${nome}: gasto ${fmt(spent)} de orçamento ${fmt(budget)} (${status})`
    })
    .join('\n')

  const metasLines = goals
    .map((g) => {
      const pct = Math.round((g.current / g.target) * 100)
      return `- ${g.nome}: ${fmt(g.current)} guardados de ${fmt(g.target)} (${pct}%), prazo ${g.prazo}`
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
