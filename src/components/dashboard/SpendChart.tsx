import { useState } from 'react'
import { monthsShort, type MonthlyHistory } from '../../data/mockData'
import { fmt } from '../../lib/format'

const CHART_HEIGHT = 150

type SpendChartProps = {
  monthlyHistory: MonthlyHistory[]
  monthIndex: number
  accent: string
}

export function SpendChart({ monthlyHistory, monthIndex, accent }: SpendChartProps) {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null)

  const maxExpense = Math.max(...monthlyHistory.map((m) => m.expense), 0)
  const spendChart = monthlyHistory.map((m) => ({
    month: m.month,
    label: monthsShort[m.month],
    income: m.income,
    expense: m.expense,
    savings: m.income - m.expense,
    heightPct: maxExpense === 0 ? 4 : Math.max(4, (m.expense / maxExpense) * 100),
    isCurrent: m.month === monthIndex,
  }))

  const maxSavings = Math.max(...spendChart.map((m) => Math.abs(m.savings)), 1)
  const n = spendChart.length
  const points = spendChart.map((m, i) => {
    const x = ((i + 0.5) / n) * 600
    const y =
      CHART_HEIGHT - (Math.abs(m.savings) / maxSavings) * (CHART_HEIGHT - 20) - 10
    return { x, y, month: m.month }
  })
  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="flex h-full flex-col gap-3.5 rounded-card border border-border bg-surface p-[22px_24px]">
      <div className="flex items-center justify-between">
        <div className="font-heading text-[15px] font-bold">
          Gastos e economia mês a mês
        </div>
        <div className="flex gap-3.5 text-[11.5px] text-text-secondary">
          <div className="flex items-center gap-1.5">
            <div className="h-[9px] w-[9px] rounded-sm bg-pill-bg" />
            Gastos
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="h-[9px] w-[9px] rounded-full"
              style={{ background: accent }}
            />
            Economia
          </div>
        </div>
      </div>

      <div
        className="relative flex flex-1 items-end gap-3.5 pt-2"
        style={{ minHeight: CHART_HEIGHT }}
      >
        {spendChart.map((b, i) => (
          <div
            key={b.month}
            className="relative flex h-full flex-1 flex-col items-center gap-1.5"
            onMouseEnter={() => setHoveredMonth(b.month)}
            onMouseLeave={() => setHoveredMonth(null)}
          >
            {hoveredMonth === b.month && (
              <div
                className={`absolute bottom-full z-20 mb-2 w-max rounded-[10px] border border-sidebar-card-border bg-sidebar px-3 py-2 text-xs text-bg ${
                  i === 0
                    ? 'left-0'
                    : i === spendChart.length - 1
                      ? 'right-0'
                      : 'left-1/2 -translate-x-1/2'
                }`}
              >
                <div className="font-heading font-bold">{b.label}</div>
                <div className="mt-1 flex items-center gap-1.5 text-receita">
                  <span className="h-1.5 w-1.5 rounded-full bg-receita" />
                  Receitas: {fmt(b.income)}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-despesa">
                  <span className="h-1.5 w-1.5 rounded-full bg-despesa" />
                  Despesas: {fmt(b.expense)}
                </div>
              </div>
            )}

            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-[8px] rounded-b-[3px] transition-[height] duration-500 ease-out"
                style={{
                  height: `${b.heightPct}%`,
                  background: b.isCurrent ? '#E2DCCB' : '#EFEBE0',
                }}
              />
            </div>
            <div className="text-[11px] font-semibold text-text-muted">
              {b.label}
            </div>
          </div>
        ))}

        <svg
          viewBox="0 0 600 150"
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-0 top-0 h-full w-full"
        >
          <polyline
            points={linePoints}
            fill="none"
            stroke={accent}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p) => (
            <circle
              key={p.month}
              cx={p.x}
              cy={p.y}
              r={hoveredMonth === p.month ? 5.5 : 4}
              fill={accent}
              className="transition-[r] duration-150"
            />
          ))}
        </svg>
      </div>
    </div>
  )
}
