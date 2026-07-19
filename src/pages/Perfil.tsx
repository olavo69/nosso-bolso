import { useEffect, useState } from 'react'
import { Toggle } from '../components/perfil/Toggle'
import { ResetDataModal } from '../components/perfil/ResetDataModal'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { initials } from '../lib/format'

const prefLabels = [
  { key: 'notif', label: 'Notificações de gastos' },
  { key: 'resumoSemanal', label: 'Resumo semanal por e-mail' },
  { key: 'compartilharAutomatico', label: 'Compartilhar lançamentos automaticamente' },
] as const

export function Perfil() {
  const { profile, partnerProfile, refreshProfile, signOut } = useAuth()
  const [prefs, setPrefs] = useState({
    notif: true,
    resumoSemanal: true,
    compartilharAutomatico: false,
  })
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [linkError, setLinkError] = useState<string | null>(null)
  const [linkLoading, setLinkLoading] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)

  useEffect(() => {
    async function fetchInviteCode() {
      if (!supabase || !profile?.couple_id) return
      const { data } = await supabase
        .from('couples')
        .select('invite_code')
        .eq('id', profile.couple_id)
        .maybeSingle()
      setInviteCode(data?.invite_code ?? null)
    }
    fetchInviteCode()
  }, [profile?.couple_id])

  async function handleGenerateCode() {
    if (!supabase) return
    setLinkLoading(true)
    setLinkError(null)
    const { data, error } = await supabase.rpc('create_couple')
    setLinkLoading(false)
    if (error) {
      setLinkError(error.message)
      return
    }
    setInviteCode(data?.[0]?.invite_code ?? null)
    await refreshProfile()
  }

  async function handleJoin() {
    if (!supabase || !joinCodeInput.trim()) return
    setLinkLoading(true)
    setLinkError(null)
    const { error } = await supabase.rpc('join_couple', { code: joinCodeInput.trim() })
    setLinkLoading(false)
    if (error) {
      setLinkError(error.message)
      return
    }
    setJoinCodeInput('')
    await refreshProfile()
  }

  if (!profile) return null

  return (
    <div className="grid max-w-[900px] grid-cols-2 gap-[18px]">
      <div className="col-span-2 flex flex-col gap-4 rounded-card border border-border bg-surface p-[26px]">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D9C9A3] font-heading text-xl font-extrabold">
            {initials(profile.name)}
          </div>
          <div>
            <div className="font-heading text-[19px] font-extrabold">
              {profile.name}
            </div>
            <div className="text-[13px] text-text-muted">{profile.email}</div>
          </div>
        </div>

        <div className="border-t border-row-border pt-3.5">
          {partnerProfile ? (
            <div className="flex items-center gap-3 rounded-[14px] bg-bg px-4 py-3.5">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#A9C9B8] text-[13px] font-bold">
                {initials(partnerProfile.name)}
              </div>
              <div>
                <div className="text-[13px] font-bold">{partnerProfile.name}</div>
                <div className="text-[11.5px] font-semibold text-accent">
                  Conta vinculada
                </div>
              </div>
            </div>
          ) : profile.couple_id ? (
            <div className="rounded-[14px] bg-bg px-4 py-3.5">
              <div className="text-[13px] font-bold">Aguardando parceiro</div>
              <div className="mt-1 text-[12.5px] text-text-secondary">
                Compartilhe este código de convite:{' '}
                <span className="font-bold text-text">{inviteCode ?? '…'}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-[13px] font-bold">Vincular parceiro</div>
              <button
                type="button"
                onClick={handleGenerateCode}
                disabled={linkLoading}
                className="self-start rounded-control bg-accent px-4 py-2.5 text-[12.5px] font-bold text-accent-ink disabled:opacity-60"
              >
                Gerar código de convite
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="Já tem um código? Cole aqui"
                  className="flex-1 rounded-control border border-border px-3.5 py-2.5 text-[12.5px] uppercase outline-none"
                />
                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={linkLoading}
                  className="rounded-control border border-border px-4 py-2.5 text-[12.5px] font-bold disabled:opacity-60"
                >
                  Entrar
                </button>
              </div>
              {linkError && <div className="text-xs text-despesa">{linkError}</div>}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3.5 rounded-card border border-border bg-surface p-6">
        <div className="font-heading text-[15px] font-bold">Preferências</div>
        {prefLabels.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="text-[13.5px] font-semibold">{label}</div>
            <Toggle
              checked={prefs[key]}
              onChange={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3.5 rounded-card border border-border bg-surface p-6">
        <div className="font-heading text-[15px] font-bold">Conta</div>
        <div className="flex flex-col text-[13.5px]">
          <div className="flex justify-between border-b border-row-border py-2">
            <div className="text-text-secondary">Moeda</div>
            <div className="font-semibold">Real (R$)</div>
          </div>
          <div className="flex justify-between border-b border-row-border py-2">
            <div className="text-text-secondary">Plano</div>
            <div className="font-semibold">Casal · Gratuito</div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="flex justify-between py-2 text-left font-semibold text-despesa"
          >
            Sair da conta
          </button>
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="flex justify-between border-t border-row-border py-2 pt-3 text-left font-semibold text-despesa"
          >
            Resetar todos os dados
          </button>
        </div>
      </div>

      <ResetDataModal open={resetModalOpen} onClose={() => setResetModalOpen(false)} />
    </div>
  )
}
