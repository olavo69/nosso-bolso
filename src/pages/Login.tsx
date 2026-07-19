import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Mode = 'entrar' | 'cadastrar'

export function Login() {
  const [mode, setMode] = useState<Mode>('entrar')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function changeMode(newMode: Mode) {
    setMode(newMode)
    setError(null)
    setSuccessMessage(null)
  }

  async function handleGoogleLogin() {
    if (!supabase) return
    setError(null)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  async function handleForgotPassword() {
    if (!supabase) return
    if (!email) {
      setError('Digite seu e-mail acima primeiro, depois clique em "Esqueci minha senha".')
      return
    }
    setError(null)
    setLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)
    setLoading(false)
    if (resetError) {
      setError(resetError.message)
      return
    }
    setSuccessMessage(`Enviamos um link de redefinição de senha para ${email}.`)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (mode === 'cadastrar') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
        if (signUpError) throw signUpError

        // Supabase não retorna erro para e-mail já cadastrado (evita enumeração);
        // identities vazio é o sinal de que a conta já existia.
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError(
            'Esse e-mail já está cadastrado. Tente entrar, ou clique em "Esqueci minha senha" na aba Entrar.',
          )
          return
        }

        setSuccessMessage(
          `Enviamos um e-mail de confirmação para ${email}. Clique no link para ativar sua conta e depois entre por aqui.`,
        )
        setPassword('')
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
            onClick={() => changeMode('entrar')}
            className={`flex-1 rounded-[9px] py-2.5 text-center text-[12.5px] font-bold ${
              mode === 'entrar' ? 'bg-surface text-text' : 'text-text-muted'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => changeMode('cadastrar')}
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
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-text-secondary">Senha</div>
              {mode === 'entrar' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-semibold text-accent"
                >
                  Esqueci minha senha
                </button>
              )}
            </div>
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

          {successMessage && (
            <div className="rounded-control bg-[#E8F5EC] px-3.5 py-2.5 text-[12.5px] text-receita">
              {successMessage}
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

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <div className="text-[11px] font-semibold text-text-muted">ou</div>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-2.5 rounded-control border border-border py-3.5 text-[13.5px] font-bold text-text transition-colors hover:bg-bg"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z"
            />
            <path
              fill="#FBBC05"
              d="M3.96 10.71A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3-2.33Z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58Z"
            />
          </svg>
          Continuar com Google
        </button>
      </div>
    </div>
  )
}
