import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router'
import { PeriodBar } from '../components/PeriodBar'
import { PersonFilter, type PersonFilterValue } from '../components/extrato/PersonFilter'
import { TransactionList } from '../components/extrato/TransactionList'
import { DEFAULT_MONTH_INDEX } from '../data/mockData'
import { useTransactions } from '../context/TransactionsContext'
import { useAuth } from '../context/AuthContext'
import type { AppOutletContext } from '../layouts/AppLayout'
import { getPeriodTx, usePeriod } from '../lib/period'

export function Extrato() {
  const { transactions } = useTransactions()
  const { profile, partnerProfile } = useAuth()
  const { openEditModal } = useOutletContext<AppOutletContext>()
  const period = usePeriod(DEFAULT_MONTH_INDEX)
  const [personFilter, setPersonFilter] = useState<PersonFilterValue>('todos')

  const personOptions = [
    { key: 'todos', label: 'Todos' },
    ...(profile ? [{ key: profile.id, label: profile.name }] : []),
    ...(partnerProfile ? [{ key: partnerProfile.id, label: partnerProfile.name }] : []),
  ]

  const monthTx = useMemo(() => {
    const periodTx = getPeriodTx(
      transactions,
      period.periodMode,
      period.monthIndex,
      period.customStart,
      period.customEnd,
    )
    return periodTx
      .filter((t) => personFilter === 'todos' || t.pessoa_id === personFilter)
      .sort((a, b) => b.data.localeCompare(a.data))
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

        <PersonFilter options={personOptions} value={personFilter} onChange={setPersonFilter} />
      </div>

      <TransactionList transactions={monthTx} onEdit={openEditModal} />
    </div>
  )
}
