import { useEffect, useState } from 'react'
import { useCategories } from '../../context/CategoriesContext'
import { colorFor } from '../../lib/format'
import type { CategoryRow } from '../../types/db'

const HUE_SWATCHES = [0, 30, 60, 110, 150, 190, 220, 260, 300, 330]

type CategoryTipo = CategoryRow['tipo']

const tipoLabels: { key: CategoryTipo; label: string }[] = [
  { key: 'despesa', label: 'Despesa' },
  { key: 'receita', label: 'Receita' },
  { key: 'investimento', label: 'Investimento' },
]

type NewCategoryModalProps = {
  open: boolean
  fixedTipo?: CategoryTipo
  onClose: () => void
  onCreated?: (category: CategoryRow) => void
}

export function NewCategoryModal({
  open,
  fixedTipo,
  onClose,
  onCreated,
}: NewCategoryModalProps) {
  const { addCategory } = useCategories()
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<CategoryTipo>(fixedTipo ?? 'despesa')
  const [budget, setBudget] = useState('')
  const [hue, setHue] = useState(HUE_SWATCHES[0])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setNome('')
    setTipo(fixedTipo ?? 'despesa')
    setBudget('')
    setHue(HUE_SWATCHES[Math.floor(Math.random() * HUE_SWATCHES.length)])
    setError(null)
  }, [open, fixedTipo])

  if (!open) return null

  async function handleSave() {
    if (!nome.trim()) {
      setError('Dá um nome pra categoria.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const created = await addCategory({
        nome: nome.trim(),
        tipo,
        hue,
        budget: tipo === 'despesa' && budget ? parseFloat(budget) : null,
      })
      onCreated?.(created)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(
        message.includes('duplicate') || message.includes('unique')
          ? 'Já existe uma categoria com esse nome nesse tipo.'
          : 'Não consegui salvar a categoria. Tenta de novo.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
      className="overlay-in fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(17,18,15,0.45)]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pop-in flex w-[400px] flex-col gap-4 rounded-[22px] bg-surface p-[26px]"
        style={{ animationDuration: '0.25s' }}
      >
        <div className="flex items-center justify-between">
          <div className="font-heading text-[17px] font-extrabold">
            Nova categoria
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none text-text-muted"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-semibold text-text-secondary">Nome</div>
          <input
            type="text"
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Pets"
            className="rounded-control border border-border px-3.5 py-3 text-[13.5px] outline-none"
          />
        </div>

        {!fixedTipo && (
          <div className="flex flex-col gap-1.5">
            <div className="text-xs font-semibold text-text-secondary">Tipo</div>
            <div className="flex rounded-control bg-[#F0EDE3] p-1">
              {tipoLabels.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTipo(t.key)}
                  className={`flex-1 rounded-[9px] py-2.5 text-center text-[12.5px] font-bold ${
                    tipo === t.key ? 'bg-surface text-text' : 'text-text-muted'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {tipo === 'despesa' && (
          <div className="flex flex-col gap-1.5">
            <div className="text-xs font-semibold text-text-secondary">
              Orçamento mensal (opcional)
            </div>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="R$ 0,00"
              className="rounded-control border border-border px-3.5 py-3 text-[13.5px] outline-none"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-semibold text-text-secondary">Cor</div>
          <div className="flex flex-wrap gap-2">
            {HUE_SWATCHES.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHue(h)}
                className={`h-7 w-7 rounded-full transition-transform ${
                  hue === h ? 'scale-110 ring-2 ring-offset-2 ring-text' : ''
                }`}
                style={{ background: colorFor(h) }}
              />
            ))}
          </div>
        </div>

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
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-control bg-accent py-3.5 text-center text-[13.5px] font-bold text-accent-ink disabled:opacity-60"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
