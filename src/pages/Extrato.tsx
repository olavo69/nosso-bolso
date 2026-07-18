import { useMemo, useState } from 'react'
import { PeriodBar } from '../components/PeriodBar'
import { PersonFilter } from '../components/extrato/PersonFilter'
import { TransactionList } from '../components/extrato/TransactionList'
import { DEFAULT_MONTH_INDEX, type Pessoa } from '../data/mockData'
import { useTransactions } from '../context/TransactionsContext'
import { getPeriodTx, usePeriod } from '../lib/period'

export function Extrato() {
  const { transactions } = useTransactions()
  const period = usePeriod(DEFAULT_MONTH_INDEX)
  const [personFilter, setPersonFilter] = useState<'todos' | Pessoa>('todos')

  const monthTx = useMemo(() => {
    const periodTx = getPeriodTx(
      transactions,
      period.periodMode,
      period.monthIndex,
      period.customStart,
      period.customEnd,
    )
    return periodTx
      .filter((t) => personFilter === 'todos' || t.pessoa === personFilter)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [
    transactions,
    period.periodMode,
    period.monthIndex,
    period.customStart,
    period.customEnd,
    personFilter,
  ])

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex items-center justify-between">
        <PeriodBar
          monthIndex={period.monthIndex}
          onPrevMonth={() => period.setMonthIndex((m) => Math.max(0, m - 1))}
          onNextMonth={() => period.setMonthIndex((m) => Math.min(11, m + 1))}
          periodMode={period.periodMode}
          onPeriodModeChange={period.setPeriodMode}
          customStart={period.customStart}
          onCustomStartChange={period.setCustomStart}
          customEnd={period.customEnd}
          onCustomEndChange={period.setCustomEnd}
        />

        <PersonFilter value={personFilter} onChange={setPersonFilter} />
      </div>

      <TransactionList transactions={monthTx} />
    </div>
  )
}
