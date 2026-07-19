import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'

type ResetDataModalProps = {
  open: boolean
  onClose: () => void
}

export function ResetDataModal({ open, onClose }: ResetDataModalProps) {
  const { profile } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return
    setPassword('')
    setError(null)
    setLoading(false)
    setDone(false)
  }, [open])

  if (!open) return null

  async function handleConfirm() {
    if (!supabase || !profile?.email) return
    if (!password) {
      setError('Digite sua senha pra confirmar.')
      return
    }
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    })
    if (authError) {
      setLoading(false)
      setError('Senha incorreta.')
      return
    }

    const { error: resetError } = await supabase.rpc('reset_couple_data')
    setLoading(false)
    if (resetError) {
      setError('Não consegui resetar os dados. Tenta de novo.')
      return
    }

    setDone(true)
    setTimeout(() => window.location.reload(), 1200)
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
          <div className="font-heading text-[17px] font-extrabold">
            Resetar todos os dados
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none text-text-muted"
          >
            ✕
          </button>
        </div>

        {done ? (
          <div className="rounded-control bg-[#E8F5EC] px-3.5 py-2.5 text-[12.5px] text-receita">
            Dados resetados. Recarregando…
          </div>
        ) : (
          <>
            <div className="rounded-control bg-[#F7E9E4] px-3.5 py-2.5 text-[12.5px] text-despesa">
              Isso apaga <strong>todas</strong> as transações, categorias, metas e o
              histórico do chat do casal — afeta o que o seu parceiro vê também. Não
              tem como desfazer.
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="text-xs font-semibold text-text-secondary">
                Confirme sua senha
              </div>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-control border border-border px-3.5 py-3 text-[13.5px] outline-none"
              />
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
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 rounded-control bg-despesa py-3.5 text-center text-[13.5px] font-bold text-white disabled:opacity-60"
              >
                {loading ? 'Resetando…' : 'Resetar tudo'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
