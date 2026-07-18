import { useEffect, useState } from 'react'
import { budgets, invCategorias, type Pessoa, type Transaction, type TransactionType } from '../../data/mockData'
import { useTransactions } from '../../context/TransactionsContext'

const receitaCategorias = ['Salário', 'Freelance', 'Outros']
const despesaCategorias = Object.keys(budgets)

function categoriasFor(type: TransactionType) {
  if (type === 'receita') return receitaCategorias
  if (type === 'investimento') return invCategorias
  return despesaCategorias
}

type RepeticaoKey = 'unica' | 'parcelada' | 'recorrente'

type FormState = {
  valor: string
  categoria: string
  data: string
  descricao: string
  pessoa: Pessoa
  pago: boolean
  repeticao: RepeticaoKey
  parcelas: number
}

function defaultForm(type: TransactionType): FormState {
  return {
    valor: '',
    categoria: categoriasFor(type)[0],
    data: '2026-07-18',
    descricao: '',
    pessoa: 'ana',
    pago: true,
    repeticao: 'unica',
    parcelas: 2,
  }
}

const tabs: { key: TransactionType; label: string; activeColor: string }[] = [
  { key: 'receita', label: 'Receita', activeColor: 'var(--color-receita)' },
  { key: 'despesa', label: 'Despesa', activeColor: 'var(--color-despesa)' },
  { key: 'investimento', label: 'Investimento', activeColor: 'var(--color-investimento)' },
]

const pessoaOptions: { key: Pessoa; label: string }[] = [
  { key: 'ana', label: 'Ana' },
  { key: 'marcos', label: 'Marcos' },
  { key: 'casal', label: 'Casal' },
]

const repeticaoOptions: { key: RepeticaoKey; label: string }[] = [
  { key: 'unica', label: 'Única' },
  { key: 'parcelada', label: 'Parcelada' },
  { key: 'recorrente', label: 'Recorrente' },
]

type NewTransactionModalProps = {
  open: boolean
  initialType: TransactionType
  onClose: () => void
}

export function NewTransactionModal({
  open,
  initialType,
  onClose,
}: NewTransactionModalProps) {
  const { addTransactions } = useTransactions()
  const [modalType, setModalType] = useState<TransactionType>(initialType)
  const [form, setForm] = useState<FormState>(() => defaultForm(initialType))

  useEffect(() => {
    if (open) {
      setModalType(initialType)
      setForm(defaultForm(initialType))
    }
  }, [open, initialType])

  if (!open) return null

  function changeTab(type: TransactionType) {
    setModalType(type)
    setForm((f) => ({ ...f, categoria: categoriasFor(type)[0] }))
  }

  const pagoLabel =
    modalType === 'receita' ? 'Recebido' : modalType === 'investimento' ? 'Aplicado' : 'Pago'
  const naoPagoLabel =
    modalType === 'receita' ? 'A receber' : modalType === 'investimento' ? 'A aplicar' : 'Não pago'

  function handleSave() {
    const valorTotal = parseFloat(form.valor)
    if (!valorTotal || valorTotal <= 0) return

    const baseDesc = form.descricao || (modalType === 'receita' ? 'Receita' : 'Despesa')
    const status = form.pago
      ? modalType === 'receita'
        ? 'recebido'
        : modalType === 'investimento'
          ? 'aplicado'
          : 'pago'
      : modalType === 'receita'
        ? 'a receber'
        : modalType === 'investimento'
          ? 'a aplicar'
          : 'pendente'
    const pendingStatus =
      modalType === 'receita' ? 'a receber' : modalType === 'investimento' ? 'a aplicar' : 'pendente'

    const [y0, m0, d0] = form.data.split('-').map(Number)
    const count = form.repeticao === 'parcelada' ? form.parcelas : form.repeticao === 'recorrente' ? 12 : 1
    const amountEach = form.repeticao === 'parcelada' ? +(valorTotal / count).toFixed(2) : valorTotal

    const newTxs: Omit<Transaction, 'id'>[] = []
    for (let i = 0; i < count; i++) {
      const dt = new Date(y0, m0 - 1 + i, d0)
      const desc = form.repeticao === 'parcelada' ? `${baseDesc} (${i + 1}/${count})` : baseDesc
      newTxs.push({
        month: dt.getMonth(),
        date: dt.toISOString().slice(0, 10),
        descricao: desc,
        categoria: form.categoria,
        pessoa: form.pessoa,
        type: modalType,
        amount: amountEach,
        status: i === 0 ? status : pendingStatus,
        recorrente: form.repeticao === 'recorrente',
      })
    }

    addTransactions(newTxs)
    onClose()
  }

  return (
    <div
      onClick={onClose}
      className="overlay-in fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,18,15,0.45)]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pop-in flex w-[440px] flex-col gap-4 rounded-[22px] bg-surface p-[26px]"
        style={{ animationDuration: '0.25s' }}
      >
        <div className="flex items-center justify-between">
          <div className="font-heading text-[17px] font-extrabold">
            Nova transação
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none text-text-muted"
          >
            ✕
          </button>
        </div>

        <div className="flex rounded-control bg-[#F0EDE3] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => changeTab(tab.key)}
              className="flex-1 rounded-[9px] py-2.5 text-center text-[12.5px] font-bold"
              style={{
                background: modalType === tab.key ? '#FFFFFF' : 'transparent',
                color: modalType === tab.key ? tab.activeColor : '#9A9C91',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-semibold text-text-secondary">Valor</div>
          <input
            type="number"
            value={form.valor}
            onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
            placeholder="R$ 0,00"
            className="rounded-control border border-border px-3.5 py-3 text-[15px] font-bold outline-none"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="text-xs font-semibold text-text-secondary">
              Categoria
            </div>
            <select
              value={form.categoria}
              onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
              className="rounded-control border border-border px-2.5 py-3 text-[13.5px] outline-none"
            >
              {categoriasFor(modalType).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="text-xs font-semibold text-text-secondary">Data</div>
            <input
              type="date"
              value={form.data}
              onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
              className="rounded-control border border-border px-2.5 py-3 text-[13.5px] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-semibold text-text-secondary">Quem</div>
          <div className="flex gap-2">
            {pessoaOptions.map((po) => (
              <button
                key={po.key}
                type="button"
                onClick={() => setForm((f) => ({ ...f, pessoa: po.key }))}
                className={`flex-1 rounded-[10px] py-2.5 text-center text-[12.5px] font-semibold ${
                  form.pessoa === po.key ? 'bg-text text-bg' : 'bg-bg text-[#5B5F58]'
                }`}
              >
                {po.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-semibold text-text-secondary">
            Descrição
          </div>
          <input
            type="text"
            value={form.descricao}
            onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            placeholder="Ex: Supermercado"
            className="rounded-control border border-border px-3.5 py-3 text-[13.5px] outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-semibold text-text-secondary">Status</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, pago: true }))}
              className={`flex-1 rounded-[10px] py-2.5 text-center text-[13px] font-bold ${
                form.pago ? 'bg-text text-bg' : 'bg-bg text-[#5B5F58]'
              }`}
            >
              {pagoLabel}
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, pago: false }))}
              className={`flex-1 rounded-[10px] py-2.5 text-center text-[13px] font-bold ${
                !form.pago ? 'bg-text text-bg' : 'bg-bg text-[#5B5F58]'
              }`}
            >
              {naoPagoLabel}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-semibold text-text-secondary">
            Repetição
          </div>
          <div className="flex rounded-control bg-[#F0EDE3] p-1">
            {repeticaoOptions.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setForm((f) => ({ ...f, repeticao: r.key }))}
                className={`flex-1 rounded-[9px] py-2.5 text-center text-[12.5px] font-bold ${
                  form.repeticao === r.key ? 'bg-text text-bg' : 'text-[#5B5F58]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {form.repeticao === 'parcelada' && (
            <div className="mt-1 flex items-center gap-2.5">
              <div className="text-[12.5px] text-text-secondary">
                Número de parcelas
              </div>
              <input
                type="number"
                min={2}
                value={form.parcelas}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    parcelas: Math.max(2, parseInt(e.target.value, 10) || 2),
                  }))
                }
                className="w-[70px] rounded-[10px] border border-border px-2.5 py-2 text-[13px] outline-none"
              />
            </div>
          )}

          {form.repeticao === 'recorrente' && (
            <div className="mt-1 text-xs text-text-muted">
              Será lançada automaticamente todo mês, como um aluguel ou assinatura.
            </div>
          )}
        </div>

        <div className="mt-1.5 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-control border border-border py-3.5 text-center text-[13.5px] font-bold text-[#5B5F58]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-control bg-accent py-3.5 text-center text-[13.5px] font-bold text-accent-ink"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
