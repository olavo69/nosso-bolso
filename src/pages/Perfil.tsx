import { useState } from 'react'
import { Toggle } from '../components/perfil/Toggle'
import { prefs as initialPrefs, profile } from '../data/mockData'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

const prefLabels: { key: keyof typeof initialPrefs; label: string }[] = [
  { key: 'notif', label: 'Notificações de gastos' },
  { key: 'resumoSemanal', label: 'Resumo semanal por e-mail' },
  { key: 'compartilharAutomatico', label: 'Compartilhar lançamentos automaticamente' },
]

export function Perfil() {
  const [prefs, setPrefs] = useState(initialPrefs)

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

        <div className="flex gap-3.5 border-t border-row-border pt-1.5">
          <div className="flex flex-1 items-center gap-3 rounded-[14px] bg-bg px-4 py-3.5">
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#A9C9B8] text-[13px] font-bold">
              {initials(profile.partnerName)}
            </div>
            <div>
              <div className="text-[13px] font-bold">{profile.partnerName}</div>
              <div className="text-[11.5px] font-semibold text-accent">
                Conta vinculada
              </div>
            </div>
          </div>
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
            className="flex justify-between py-2 text-left font-semibold text-despesa"
          >
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  )
}
