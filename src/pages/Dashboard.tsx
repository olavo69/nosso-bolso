import { useMemo } from 'react'
import { useOutletContext } from 'react-router'
import { CategoryBars } from '../components/dashboard/CategoryBars'
import { GoalsInFocus } from '../components/dashboard/GoalsInFocus'
import { InvestmentsList } from '../components/dashboard/InvestmentsList'
import { PeriodBar } from '../components/PeriodBar'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'
import { SpendChart } from '../components/dashboard/SpendChart'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { DEFAULT_MONTH_INDEX, monthlyHistory } from '../data/mockData'
import { useTransactions } from '../context/TransactionsContext'
import { useGoals } from '../context/GoalsContext'
import { useCategories } from '../context/CategoriesContext'
import type { AppOutletContext } from '../layouts/AppLayout'
import { getPeriodTx, periodLabel, usePeriod } from '../lib/period'
import { ACCENT } from '../lib/theme'

export function Dashboard() {
  const { transactions } = useTransactions()
  const { goals } = useGoals()
  const { categories } = useCategories()
  const { openEditModal } = useOutletContext<AppOutletContext>()
  const period = usePeriod(DEFAULT_MONTH_INDEX)

  const periodTx = useMemo(
    () =>
      getPeriodTx(
        transactions,
        period.periodMode,
        period.monthIndex,
        period.customStart,
        period.customEnd,
      ),
    [transactions, period.periodMode, period.monthIndex, period.customStart, period.customEnd],
  )

  const income = periodTx
    .filter((t) => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0)
  const expense = periodTx
    .filter((t) => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0)
  const invested = periodTx
    .filter((t) => t.type === 'investimento')
    .reduce((sum, t) => sum + t.amount, 0)
  const balance = income - expense

  const catSpend = useMemo(() => {
    const spend: Record<string, number> = {}
    periodTx
      .filter((t) => t.type === 'despesa')
      .forEach((t) => {
        spend[t.categoria] = (spend[t.categoria] ?? 0) + t.amount
      })
    return spend
  }, [periodTx])

  const recentTx = useMemo(
    () =>
      transactions
        .filter(
          (t) => new Date(`${t.data}T00:00:00`).getMonth() === period.monthIndex,
        )
        .sort((a, b) => b.data.localeCompare(a.data))
        .slice(0, 5),
    [transactions, period.monthIndex],
  )

  const label = periodLabel(
    period.periodMode,
    period.monthIndex,
    period.customStart,
    period.customEnd,
  )

  return (
    <div className="flex flex-col gap-5">
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

      <SummaryCards
        balance={balance}
        income={income}
        expense={expense}
        invested={invested}
        periodLabel={label}
      />

      <div className="grid grid-cols-[1.6fr_1fr] items-stretch gap-[18px]">
        <SpendChart
          monthlyHistory={monthlyHistory}
          monthIndex={period.monthIndex}
          accent={ACCENT}
        />
        <CategoryBars catSpend={catSpend} categories={categories} />
      </div>

      <div className="grid grid-cols-[1.3fr_1fr] items-start gap-[18px]">
        <RecentTransactions transactions={recentTx} onEdit={openEditModal} />
        <GoalsInFocus goals={goals} />
      </div>

      <InvestmentsList transactions={periodTx} onEdit={openEditModal} />
    </div>
  )
}
