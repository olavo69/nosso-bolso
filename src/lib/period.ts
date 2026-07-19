import { useState } from 'react'
import { months } from '../data/mockData'
import type { TransactionRow } from '../types/db'

export type PeriodMode = 'mes' | 'trimestre' | 'ano' | 'custom'

export function usePeriod(initialMonthIndex: number) {
  const [monthIndex, setMonthIndex] = useState(initialMonthIndex)
  const [periodMode, setPeriodMode] = useState<PeriodMode>('mes')
  const [customStart, setCustomStart] = useState('2026-07-01')
  const [customEnd, setCustomEnd] = useState('2026-07-31')

  return {
    monthIndex,
    setMonthIndex,
    periodMode,
    setPeriodMode,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
  }
}

function monthOf(tx: TransactionRow) {
  return new Date(`${tx.data}T00:00:00`).getMonth()
}

export function getPeriodTx(
  transactions: TransactionRow[],
  periodMode: PeriodMode,
  monthIndex: number,
  customStart: string,
  customEnd: string,
) {
  if (periodMode === 'custom') {
    return transactions.filter((t) => t.data >= customStart && t.data <= customEnd)
  }
  if (periodMode === 'trimestre') {
    const lo = Math.max(0, monthIndex - 2)
    return transactions.filter((t) => monthOf(t) >= lo && monthOf(t) <= monthIndex)
  }
  if (periodMode === 'ano') {
    return transactions.filter((t) => t.data.startsWith('2026'))
  }
  return transactions.filter((t) => monthOf(t) === monthIndex)
}

export function periodLabel(
  periodMode: PeriodMode,
  monthIndex: number,
  customStart: string,
  customEnd: string,
) {
  if (periodMode === 'custom') {
    const format = (d: string) =>
      new Date(`${d}T00:00:00`).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
    return `${format(customStart)} – ${format(customEnd)}`
  }
  if (periodMode === 'trimestre') {
    const lo = Math.max(0, monthIndex - 2)
    return `${months[lo].split('/')[0]}–${months[monthIndex]}`
  }
  if (periodMode === 'ano') return 'Ano de 2026'
  return months[monthIndex]
}
