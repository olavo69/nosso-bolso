import { hues, type Transaction } from '../../data/mockData'
import { colorFor, fmt, pessoaLabel, tintFor } from '../../lib/format'

type InvestmentsListProps = {
  transactions: Transaction[]
}

export function InvestmentsList({ transactions }: InvestmentsListProps) {
  const investmentRows = transactions.filter((t) => t.type === 'investimento')

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-[22px_24px]">
      <div className="font-heading text-[15px] font-bold">
        Investimentos do mês
      </div>

      {investmentRows.length === 0 && (
        <div className="py-5 text-center text-[13.5px] text-text-muted">
          Nenhum investimento lançado neste mês.
        </div>
      )}

      {investmentRows.map((tx) => {
        const hue = hues[tx.categoria] ?? 0
        const statusColor =
          tx.status === 'a aplicar'
            ? 'var(--color-pendente)'
            : 'var(--color-investimento)'

        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 border-t border-row-border py-2.5"
          >
            <div
              className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] text-xs font-bold"
              style={{ background: tintFor(hue), color: colorFor(hue) }}
            >
              {tx.categoria.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-semibold">{tx.descricao}</div>
              <div className="text-[11.5px] text-text-muted">
                {tx.categoria} · {pessoaLabel(tx.pessoa)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-investimento">
                {fmt(tx.amount)}
              </div>
              <div
                className="mt-0.5 text-[11px] font-semibold"
                style={{ color: statusColor }}
              >
                {tx.status}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
