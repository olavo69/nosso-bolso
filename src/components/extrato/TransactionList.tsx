import { useCategories } from '../../context/CategoriesContext'
import { usePessoaLabel } from '../../lib/usePessoaLabel'
import type { TransactionRow } from '../../types/db'
import {
  amountColor,
  amountDisplay,
  colorFor,
  dataLabel,
  statusColor,
  tintFor,
} from '../../lib/format'

type TransactionListProps = {
  transactions: TransactionRow[]
  onEdit: (transaction: TransactionRow) => void
}

export function TransactionList({ transactions, onEdit }: TransactionListProps) {
  const { categories } = useCategories()
  const pessoaLabel = usePessoaLabel()

  if (transactions.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface px-6 py-10 text-center text-[13.5px] text-text-muted">
        Nenhuma transação neste filtro.
      </div>
    )
  }

  return (
    <div className="rounded-card border border-border bg-surface px-6">
      {transactions.map((tx) => {
        const hue = categories.find((c) => c.nome === tx.categoria)?.hue ?? 0

        return (
          <button
            key={tx.id}
            type="button"
            onClick={() => onEdit(tx)}
            title="Clique para editar"
            className="flex w-full items-center gap-3.5 border-b border-row-border py-3.5 text-left transition-colors last:border-b-0 hover:bg-bg"
          >
            <div
              className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[11px] text-[13px] font-bold"
              style={{ background: tintFor(hue), color: colorFor(hue) }}
            >
              {tx.categoria.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{tx.descricao}</div>
              <div className="mt-0.5 text-xs text-text-muted">
                {tx.categoria} · {pessoaLabel(tx.pessoa_id)} · {dataLabel(tx.data)}
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-[14.5px] font-bold"
                style={{ color: amountColor(tx.type) }}
              >
                {amountDisplay(tx.type, tx.amount)}
              </div>
              <div
                className="mt-0.5 text-[11px] font-semibold"
                style={{ color: statusColor(tx.status ?? undefined) }}
              >
                {tx.status ?? 'pago'}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
