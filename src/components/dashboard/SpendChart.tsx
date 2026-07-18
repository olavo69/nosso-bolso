import { monthsShort, type MonthlyHistory } from '../../data/mockData'
import { fmt } from '../../lib/format'

const CHART_HEIGHT = 150

type SpendChartProps = {
  monthlyHistory: MonthlyHistory[]
  monthIndex: number
  accent: string
}

export function SpendChart({ monthlyHistory, monthIndex, accent }: SpendChartProps) {
  const maxExpense = Math.max(...monthlyHistory.map((m) => m.expense))
  const spendChart = monthlyHistory.map((m) => ({
    month: m.month,
    label: monthsShort[m.month],
    valueDisplay: fmt(m.expense),
    heightPct: Math.max(4, (m.expense / maxExpense) * 100),
    isCurrent: m.month === monthIndex,
  }))

  const savingsSeries = monthlyHistory.map((m) => ({
    month: m.month,
    savings: m.income - m.expense,
  }))
  const maxSavings = Math.max(...savingsSeries.map((m) => Math.abs(m.savings)), 1)
  const n = savingsSeries.length
  const points = savingsSeries.map((m, i) => {
    const x = ((i + 0.5) / n) * 600
    const y =
      CHART_HEIGHT - (Math.abs(m.savings) / maxSavings) * (CHART_HEIGHT - 20) - 10
    return { x, y }
  })
  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="flex flex-col gap-3.5 rounded-card border border-border bg-surface p-[22px_24px]">
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
        className="relative flex items-end gap-3.5 pt-2"
        style={{ height: CHART_HEIGHT }}
      >
        {spendChart.map((b) => (
          <div
            key={b.month}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            title={b.valueDisplay}
          >
            <div
              className="w-full rounded-t-[8px] rounded-b-[3px] transition-[height] duration-500 ease-out"
              style={{
                height: `${b.heightPct}%`,
                background: b.isCurrent ? '#E2DCCB' : '#EFEBE0',
              }}
            />
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
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={4} fill={accent} />
          ))}
        </svg>
      </div>
    </div>
  )
}
