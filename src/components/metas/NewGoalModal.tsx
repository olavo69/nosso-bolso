import { useEffect, useState } from 'react'
import { useGoals } from '../../context/GoalsContext'
import { colorFor } from '../../lib/format'

const HUE_SWATCHES = [0, 30, 60, 110, 150, 190, 220, 260, 300, 330]

type NewGoalModalProps = {
  open: boolean
  onClose: () => void
}

export function NewGoalModal({ open, onClose }: NewGoalModalProps) {
  const { addGoal } = useGoals()
  const [nome, setNome] = useState('')
  const [target, setTarget] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [prazo, setPrazo] = useState('')
  const [hue, setHue] = useState(HUE_SWATCHES[0])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setNome('')
    setTarget('')
    setCurrentAmount('')
    setPrazo('')
    setHue(HUE_SWATCHES[Math.floor(Math.random() * HUE_SWATCHES.length)])
    setError(null)
  }, [open])

  if (!open) return null

  async function handleSave() {
    if (!nome.trim()) {
      setError('Dá um nome pra meta.')
      return
    }
    const targetValue = parseFloat(target)
    if (!targetValue || targetValue <= 0) {
      setError('Informa um valor de meta válido.')
      return
    }
    if (!prazo.trim()) {
      setError('Informa um prazo, ex: Dez/2026.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await addGoal({
        nome: nome.trim(),
        target: targetValue,
        current_amount: currentAmount ? parseFloat(currentAmount) : 0,
        prazo: prazo.trim(),
        hue,
      })
      onClose()
    } catch {
      setError('Não consegui salvar a meta. Tenta de novo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      onClick={onClose}
      className="overlay-in fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,18,15,0.45)]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pop-in flex w-[400px] flex-col gap-4 rounded-[22px] bg-surface p-[26px]"
        style={{ animationDuration: '0.25s' }}
      >
        <div className="flex items-center justify-between">
          <div className="font-heading text-[17px] font-extrabold">Nova meta</div>
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
            placeholder="Ex: Reforma da cozinha"
            className="rounded-control border border-border px-3.5 py-3 text-[13.5px] outline-none"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="text-xs font-semibold text-text-secondary">
              Valor da meta
            </div>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="R$ 0,00"
              className="rounded-control border border-border px-3.5 py-3 text-[13.5px] outline-none"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="text-xs font-semibold text-text-secondary">
              Já guardado
            </div>
            <input
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="R$ 0,00"
              className="rounded-control border border-border px-3.5 py-3 text-[13.5px] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-semibold text-text-secondary">Prazo</div>
          <input
            type="text"
            value={prazo}
            onChange={(e) => setPrazo(e.target.value)}
            placeholder="Ex: Dez/2026"
            className="rounded-control border border-border px-3.5 py-3 text-[13.5px] outline-none"
          />
        </div>

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
