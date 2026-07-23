import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCategories } from '../../context/CategoriesContext'
import { useTransactions, type NewTransactionInput } from '../../context/TransactionsContext'
import { NewCategoryModal } from '../categorias/NewCategoryModal'
import type { TransactionRow } from '../../types/db'

const NEW_CATEGORY_VALUE = '__new__'

type TransactionType = TransactionRow['type']

type RepeticaoKey = 'unica' | 'parcelada' | 'recorrente'

type FormState = {
  valor: string
  categoria: string
  data: string
  descricao: string
  pessoaId: string | null
  pago: boolean
  repeticao: RepeticaoKey
  parcelas: number
}

const paidStatuses = ['pago', 'recebido', 'aplicado']

const tabs: { key: TransactionType; label: string; activeColor: string }[] = [
  { key: 'receita', label: 'Receita', activeColor: 'var(--color-receita)' },
  { key: 'despesa', label: 'Despesa', activeColor: 'var(--color-despesa)' },
  { key: 'investimento', label: 'Investimento', activeColor: 'var(--color-investimento)' },
]

const repeticaoOptions: { key: RepeticaoKey; label: string }[] = [
  { key: 'unica', label: 'Única' },
  { key: 'parcelada', label: 'Parcelada' },
  { key: 'recorrente', label: 'Recorrente' },
]

type NewTransactionModalProps = {
  open: boolean
  editing: TransactionRow | null
  defaultType: TransactionType
  onClose: () => void
}

export function NewTransactionModal({
  open,
  editing,
  defaultType,
  onClose,
}: NewTransactionModalProps) {
  const { profile, partnerProfile } = useAuth()
  const { categories } = useCategories()
  const { addTransactions, updateTransaction, deleteTransaction } = useTransactions()
  const [modalType, setModalType] = useState<TransactionType>(defaultType)
  const [form, setForm] = useState<FormState | null>(null)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pessoaOptions = [
    { id: 'self', key: profile?.id ?? null, label: profile?.name ?? 'Você' },
    ...(partnerProfile
      ? [{ id: 'partner', key: partnerProfile.id, label: partnerProfile.name }]
      : []),
    { id: 'casal', key: null, label: 'Casal' },
  ]

  function categoriasFor(type: TransactionType) {
    return categories.filter((c) => c.tipo === type).map((c) => c.nome)
  }

  function defaultForm(type: TransactionType): FormState {
    return {
      valor: '',
      categoria: categoriasFor(type)[0] ?? '',
      data: new Date().toISOString().slice(0, 10),
      descricao: '',
      pessoaId: profile?.id ?? null,
      pago: true,
      repeticao: 'unica',
      parcelas: 2,
    }
  }

  function formFromTransaction(tx: TransactionRow): FormState {
    return {
      valor: String(tx.amount),
      categoria: tx.categoria,
      data: tx.data,
      descricao: tx.descricao,
      pessoaId: tx.pessoa_id,
      pago: tx.status == null || paidStatuses.includes(tx.status),
      repeticao: 'unica',
      parcelas: 2,
    }
  }

  useEffect(() => {
    if (!open) return
    setConfirmingDelete(false)
    setError(null)
    if (editing) {
      setModalType(editing.type)
      setForm(formFromTransaction(editing))
    } else {
      setModalType(defaultType)
      setForm(defaultForm(defaultType))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, defaultType])

  if (!open || !form) return null

  const isEditing = editing !== null

  function changeTab(type: TransactionType) {
    setModalType(type)
    setForm((f) => (f ? { ...f, categoria: categoriasFor(type)[0] ?? '' } : f))
  }

  const pagoLabel =
    modalType === 'receita' ? 'Recebido' : modalType === 'investimento' ? 'Aplicado' : 'Pago'
  const naoPagoLabel =
    modalType === 'receita' ? 'A receber' : modalType === 'investimento' ? 'A aplicar' : 'Não pago'

  async function handleSave() {
    if (!form) return
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

    setSaving(true)
    setError(null)
    try {
      if (isEditing && editing) {
        await updateTransaction(editing.id, {
          data: form.data,
          descricao: baseDesc,
          categoria: form.categoria,
          pessoa_id: form.pessoaId,
          type: modalType,
          amount: valorTotal,
          status,
        })
        onClose()
        return
      }

      const pendingStatus =
        modalType === 'receita' ? 'a receber' : modalType === 'investimento' ? 'a aplicar' : 'pendente'

      const [y0, m0, d0] = form.data.split('-').map(Number)
      const count = form.repeticao === 'parcelada' ? form.parcelas : form.repeticao === 'recorrente' ? 12 : 1
      const amountEach = form.repeticao === 'parcelada' ? +(valorTotal / count).toFixed(2) : valorTotal

      const newTxs: NewTransactionInput[] = []
      for (let i = 0; i < count; i++) {
        const dt = new Date(y0, m0 - 1 + i, d0)
        const desc = form.repeticao === 'parcelada' ? `${baseDesc} (${i + 1}/${count})` : baseDesc
        newTxs.push({
          data: dt.toISOString().slice(0, 10),
          descricao: desc,
          categoria: form.categoria,
          pessoa_id: form.pessoaId,
          type: modalType,
          amount: amountEach,
          status: i === 0 ? status : pendingStatus,
          recorrente: form.repeticao === 'recorrente',
          parcela_atual: form.repeticao === 'parcelada' ? i + 1 : null,
          parcela_total: form.repeticao === 'parcelada' ? count : null,
        })
      }

      await addTransactions(newTxs)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(
        message.includes('casal')
          ? 'Sua conta ainda não tem um casal vinculado — vá em Perfil pra resolver isso antes de lançar transações.'
          : 'Não consegui salvar. Tenta de novo em instantes.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editing) return
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    setDeleting(true)
    try {
      await deleteTransaction(editing.id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      onClick={onClose}
      className="overlay-in fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,18,15,0.45)] p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pop-in flex h-full w-full max-w-full flex-col gap-4 overflow-y-auto rounded-none bg-surface p-5 sm:h-auto sm:max-h-[88vh] sm:w-[440px] sm:max-w-[440px] sm:rounded-[22px] sm:p-[26px]"
        style={{ animationDuration: '0.25s' }}
      >
        <div className="flex items-center justify-between">
          <div className="font-heading text-[17px] font-extrabold">
            {isEditing ? 'Editar transação' : 'Nova transação'}
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
            onChange={(e) => setForm((f) => (f ? { ...f, valor: e.target.value } : f))}
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
              onChange={(e) => {
                if (e.target.value === NEW_CATEGORY_VALUE) {
                  setCategoryModalOpen(true)
                  return
                }
                setForm((f) => (f ? { ...f, categoria: e.target.value } : f))
              }}
              className="rounded-control border border-border px-2.5 py-3 text-[13.5px] outline-none"
            >
              {categoriasFor(modalType).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
              <option value={NEW_CATEGORY_VALUE}>+ Criar categoria</option>
            </select>
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="text-xs font-semibold text-text-secondary">Data</div>
            <input
              type="date"
              value={form.data}
              onChange={(e) => setForm((f) => (f ? { ...f, data: e.target.value } : f))}
              className="rounded-control border border-border px-2.5 py-3 text-[13.5px] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-semibold text-text-secondary">Quem</div>
          <div className="flex gap-2">
            {pessoaOptions.map((po) => (
              <button
                key={po.id}
                type="button"
                onClick={() => setForm((f) => (f ? { ...f, pessoaId: po.key } : f))}
                className={`flex-1 rounded-[10px] py-2.5 text-center text-[12.5px] font-semibold ${
                  form.pessoaId === po.key ? 'bg-text text-bg' : 'bg-bg text-[#5B5F58]'
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
            onChange={(e) =>
              setForm((f) => (f ? { ...f, descricao: e.target.value } : f))
            }
            placeholder="Ex: Supermercado"
            className="rounded-control border border-border px-3.5 py-3 text-[13.5px] outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-semibold text-text-secondary">Status</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm((f) => (f ? { ...f, pago: true } : f))}
              className={`flex-1 rounded-[10px] py-2.5 text-center text-[13px] font-bold ${
                form.pago ? 'bg-text text-bg' : 'bg-bg text-[#5B5F58]'
              }`}
            >
              {pagoLabel}
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => (f ? { ...f, pago: false } : f))}
              className={`flex-1 rounded-[10px] py-2.5 text-center text-[13px] font-bold ${
                !form.pago ? 'bg-text text-bg' : 'bg-bg text-[#5B5F58]'
              }`}
            >
              {naoPagoLabel}
            </button>
          </div>
        </div>

        {!isEditing && (
          <div className="flex flex-col gap-1.5">
            <div className="text-xs font-semibold text-text-secondary">
              Repetição
            </div>
            <div className="flex rounded-control bg-[#F0EDE3] p-1">
              {repeticaoOptions.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() =>
                    setForm((f) => (f ? { ...f, repeticao: r.key } : f))
                  }
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
                    setForm((f) =>
                      f
                        ? {
                            ...f,
                            parcelas: Math.max(2, parseInt(e.target.value, 10) || 2),
                          }
                        : f,
                    )
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
        )}

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className={`rounded-control py-3 text-center text-[13px] font-bold transition-colors disabled:opacity-60 ${
              confirmingDelete
                ? 'bg-despesa text-white'
                : 'border border-despesa/40 text-despesa hover:bg-[#F7E9E4]'
            }`}
          >
            {deleting
              ? 'Excluindo…'
              : confirmingDelete
                ? 'Clique de novo para confirmar a exclusão'
                : 'Excluir transação'}
          </button>
        )}

        {error && (
          <div className="rounded-control bg-[#F7E9E4] px-3.5 py-2.5 text-[12.5px] text-despesa">
            {error}
          </div>
        )}

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
            disabled={saving}
            onClick={handleSave}
            className="flex-1 rounded-control bg-accent py-3.5 text-center text-[13.5px] font-bold text-accent-ink disabled:opacity-60"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>

      <NewCategoryModal
        open={categoryModalOpen}
        fixedTipo={modalType}
        onClose={() => setCategoryModalOpen(false)}
        onCreated={(created) => {
          setForm((f) => (f ? { ...f, categoria: created.nome } : f))
          setCategoryModalOpen(false)
        }}
      />
    </div>
  )
}
