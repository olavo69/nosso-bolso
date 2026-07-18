import { useNavigate } from 'react-router'
import { hues, type Transaction } from '../../data/mockData'
import { colorFor, dataLabel, fmt, pessoaLabel, tintFor } from '../../lib/format'

type RecentTransactionsProps = {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-3.5 rounded-card border border-border bg-surface p-[22px_24px]">
      <div className="flex items-center justify-between">
        <div className="font-heading text-[15px] font-bold">
          Transações recentes
        </div>
        <button
          type="button"
          onClick={() => navigate('/extrato')}
          className="text-[12.5px] font-bold text-accent"
        >
          ver extrato
        </button>
      </div>

      {transactions.map((tx) => {
        const hue = hues[tx.categoria] ?? 0
        const amountDisplay =
          (tx.type === 'receita' ? '+ ' : tx.type === 'investimento' ? '→ ' : '- ') +
          fmt(tx.amount)
        const amountColor =
          tx.type === 'receita'
            ? 'var(--color-receita)'
            : tx.type === 'investimento'
              ? 'var(--color-investimento)'
              : 'var(--color-despesa)'

        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 border-t border-row-border py-2.5"
          >
            <div
              className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[11px] text-[13px] font-bold"
              style={{ background: tintFor(hue), color: colorFor(hue) }}
            >
              {tx.categoria.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-semibold">{tx.descricao}</div>
              <div className="text-[11.5px] text-text-muted">
                {tx.categoria} · {pessoaLabel(tx.pessoa)} · {dataLabel(tx.date)}
              </div>
            </div>
            <div
              className="text-sm font-bold"
              style={{ color: amountColor }}
            >
              {amountDisplay}
            </div>
          </div>
        )
      })}
    </div>
  )
}
