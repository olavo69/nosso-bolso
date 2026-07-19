import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Mode = 'entrar' | 'cadastrar'

export function Login() {
  const [mode, setMode] = useState<Mode>('entrar')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setError(null)
    setLoading(true)

    try {
      if (mode === 'cadastrar') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
        if (signUpError) throw signUpError
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado. Tenta de novo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[380px] rounded-card border border-border bg-surface p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-accent font-heading text-[15px] font-extrabold text-accent-ink">
            NB
          </div>
          <div className="font-heading text-[17px] font-extrabold tracking-tight">
            Nosso Bolso
          </div>
        </div>

        <div className="mb-5 flex rounded-control bg-[#F0EDE3] p-1">
          <button
            type="button"
            onClick={() => setMode('entrar')}
            className={`flex-1 rounded-[9px] py-2.5 text-center text-[12.5px] font-bold ${
              mode === 'entrar' ? 'bg-surface text-text' : 'text-text-muted'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode('cadastrar')}
            className={`flex-1 rounded-[9px] py-2.5 text-center text-[12.5px] font-bold ${
              mode === 'cadastrar' ? 'bg-surface text-text' : 'text-text-muted'
            }`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === 'cadastrar' && (
            <div className="flex flex-col gap-1.5">
              <div className="text-xs font-semibold text-text-secondary">Nome</div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="rounded-control border border-border px-3.5 py-3 text-[13.5px] outline-none"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <div className="text-xs font-semibold text-text-secondary">E-mail</div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="rounded-control border border-border px-3.5 py-3 text-[13.5px] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-xs font-semibold text-text-secondary">Senha</div>
            <input
              type="password"
              required
              minLength={6}
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

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-control bg-accent py-3.5 text-center text-[13.5px] font-bold text-accent-ink disabled:opacity-60"
          >
            {loading ? 'Aguarde…' : mode === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  )
}
