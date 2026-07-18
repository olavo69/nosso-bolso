import type { Pessoa, TransactionType } from '../data/mockData'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function fmt(n: number) {
  return currencyFormatter.format(n)
}

export function colorFor(hue: number, l = 55, c = 0.14) {
  return `oklch(${l}% ${c} ${hue})`
}

export function tintFor(hue: number) {
  return `oklch(94% 0.03 ${hue})`
}

export function pessoaLabel(p: Pessoa) {
  return p === 'ana' ? 'Ana' : p === 'marcos' ? 'Marcos' : 'Casal'
}

export function dataLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export function amountDisplay(type: TransactionType, amount: number) {
  const sign = type === 'receita' ? '+ ' : type === 'investimento' ? '→ ' : '- '
  return sign + fmt(amount)
}

export function amountColor(type: TransactionType) {
  return type === 'receita'
    ? 'var(--color-receita)'
    : type === 'investimento'
      ? 'var(--color-investimento)'
      : 'var(--color-despesa)'
}

export function statusColor(status?: string) {
  return status === 'pendente' || status === 'a receber' || status === 'a aplicar'
    ? 'var(--color-pendente)'
    : 'var(--color-status-ok)'
}
