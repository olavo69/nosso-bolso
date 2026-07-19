import { useNavigate } from 'react-router'
import { useCategories } from '../../context/CategoriesContext'
import { usePessoaLabel } from '../../lib/usePessoaLabel'
import type { TransactionRow } from '../../types/db'
import {
  amountColor,
  amountDisplay,
  colorFor,
  dataLabel,
  tintFor,
} from '../../lib/format'

type RecentTransactionsProps = {
  transactions: TransactionRow[]
  onEdit: (transaction: TransactionRow) => void
}

export function RecentTransactions({ transactions, onEdit }: RecentTransactionsProps) {
  const navigate = useNavigate()
  const { categories } = useCategories()
  const pessoaLabel = usePessoaLabel()

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
        const hue = categories.find((c) => c.nome === tx.categoria)?.hue ?? 0

        return (
          <button
            key={tx.id}
            type="button"
            onClick={() => onEdit(tx)}
            title="Clique para editar"
            className="flex w-full items-center gap-3 border-t border-row-border py-2.5 text-left transition-colors hover:bg-bg"
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
                {tx.categoria} · {pessoaLabel(tx.pessoa_id)} · {dataLabel(tx.data)}
              </div>
            </div>
            <div
              className="text-sm font-bold"
              style={{ color: amountColor(tx.type) }}
            >
              {amountDisplay(tx.type, tx.amount)}
            </div>
          </button>
        )
      })}
    </div>
  )
}
