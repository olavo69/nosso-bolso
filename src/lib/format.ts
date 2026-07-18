import type { Pessoa } from '../data/mockData'

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
