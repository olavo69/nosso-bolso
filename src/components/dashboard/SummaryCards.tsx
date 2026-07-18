import { fmt } from '../../lib/format'
import { useCountUp } from '../../lib/useCountUp'

type SummaryCardsProps = {
  balance: number
  income: number
  expense: number
  invested: number
  periodLabel: string
}

export function SummaryCards({
  balance,
  income,
  expense,
  invested,
  periodLabel,
}: SummaryCardsProps) {
  const balanceAnim = useCountUp(balance)

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex min-w-0 flex-col gap-1.5 rounded-[18px] bg-sidebar p-5 text-bg">
        <div className="text-[12.5px] font-semibold text-[#A9AA9F]">
          Saldo do mês
        </div>
        <div className="whitespace-nowrap font-heading text-[21px] font-extrabold">
          {fmt(balanceAnim)}
        </div>
        <div className="text-xs font-semibold text-accent">
          ↑ saudável para {periodLabel}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 rounded-card border border-border bg-surface p-[22px_24px]">
        <div className="text-[12.5px] font-semibold text-text-secondary">
          Receitas
        </div>
        <div className="font-heading text-[22px] font-extrabold text-receita">
          {fmt(income)}
        </div>
        <div className="text-xs text-text-muted">{periodLabel}</div>
      </div>

      <div className="flex flex-col gap-1.5 rounded-card border border-border bg-surface p-[22px_24px]">
        <div className="text-[12.5px] font-semibold text-text-secondary">
          Despesas
        </div>
        <div className="font-heading text-[22px] font-extrabold text-despesa">
          {fmt(expense)}
        </div>
        <div className="text-xs text-text-muted">{periodLabel}</div>
      </div>

      <div className="flex flex-col gap-1.5 rounded-card border border-border bg-surface p-[22px_24px]">
        <div className="text-[12.5px] font-semibold text-text-secondary">
          Investido
        </div>
        <div className="font-heading text-[22px] font-extrabold text-investimento">
          {fmt(invested)}
        </div>
        <div className="text-xs text-text-muted">
          {periodLabel} · não conta no saldo
        </div>
      </div>
    </div>
  )
}
