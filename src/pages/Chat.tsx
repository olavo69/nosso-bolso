import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTransactions } from '../context/TransactionsContext'
import { useCategories } from '../context/CategoriesContext'
import { useGoals } from '../context/GoalsContext'
import { buildFinancialContext } from '../lib/financialContext'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { DEFAULT_MONTH_INDEX } from '../data/mockData'
import type { ChatMessageRow } from '../types/db'

type ChatTurn = { from: 'user' | 'bot'; text: string }

const suggestions = [
  'Quanto gastamos com Lazer esse mês?',
  'Como estão nossas metas?',
  'Dá pra economizar mais?',
]

function buildWelcomeMessage(hasPartner: boolean): ChatTurn {
  return {
    from: 'bot',
    text: hasPartner
      ? 'Oi! Sou a assistente do Nosso Bolso. Posso te ajudar a entender os gastos do casal. O que quer saber?'
      : 'Oi! Sou a assistente do Nosso Bolso. Posso te ajudar a entender seus gastos. O que quer saber?',
  }
}

export function Chat() {
  const { profile, partnerProfile } = useAuth()
  const hasPartner = Boolean(partnerProfile)
  const { transactions, refetch: refetchTransactions } = useTransactions()
  const { categories } = useCategories()
  const { goals } = useGoals()
  const [messages, setMessages] = useState<ChatTurn[]>([buildWelcomeMessage(hasPartner)])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadHistory() {
      if (!supabase || !profile?.couple_id) return
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
      if (data && data.length > 0) {
        setMessages(
          data.map((m: ChatMessageRow) => ({ from: m.from_role, text: m.text })),
        )
      }
    }
    loadHistory()
  }, [profile?.couple_id])

  async function persistMessage(fromRole: 'user' | 'bot', text: string) {
    if (!supabase || !profile?.couple_id) return
    await supabase.from('chat_messages').insert({
      couple_id: profile.couple_id,
      profile_id: fromRole === 'user' ? profile.id : null,
      from_role: fromRole,
      text,
    })
  }

  async function sendText(text: string) {
    if (!text.trim() || typing) return

    const history = messages
    setMessages((m) => [...m, { from: 'user', text }])
    setInput('')
    setError(null)
    persistMessage('user', text)

    if (!supabase) {
      setError(
        'Chat ainda não está conectado — falta configurar o Supabase e a chave do OpenRouter.',
      )
      return
    }

    setTyping(true)
    try {
      const financialContext = buildFinancialContext(
        transactions,
        categories,
        goals,
        DEFAULT_MONTH_INDEX,
        hasPartner,
      )
      const { data, error: fnError } = await supabase.functions.invoke('chat', {
        body: { message: text, history, financialContext },
      })
      if (fnError) throw fnError
      setMessages((m) => [...m, { from: 'bot', text: data.reply }])
      persistMessage('bot', data.reply)
      if (data.transactionCreated) {
        await refetchTransactions()
      }
    } catch {
      setError('Não consegui falar com a IA agora. Tenta de novo em instantes.')
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-260px)] max-w-[720px] flex-col rounded-card border border-border bg-surface sm:h-[calc(100vh-200px)]">
      <div className="flex items-center gap-2.5 border-b border-row-border px-4 py-3.5 sm:px-[22px] sm:py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent font-heading text-[13px] font-extrabold">
          IA
        </div>
        <div>
          <div className="text-sm font-bold">Assistente financeira</div>
          <div className="text-[11.5px] text-text-muted">
            Pergunte sobre gastos, metas e categorias
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-4 py-4 sm:px-[22px] sm:py-5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 text-[13.5px] sm:max-w-[75%] ${
                m.from === 'user'
                  ? 'rounded-[14px_14px_4px_14px] bg-accent font-semibold text-accent-ink'
                  : 'rounded-[14px_14px_14px_4px] bg-bg text-text'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="self-start rounded-[14px_14px_14px_4px] bg-bg px-3.5 py-2.5 text-[13px] text-text-muted">
            digitando…
          </div>
        )}

        {error && (
          <div className="self-start rounded-[14px_14px_14px_4px] bg-[#F7E9E4] px-3.5 py-2.5 text-[13px] text-despesa">
            {error}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5 border-t border-row-border px-3.5 py-3 sm:px-[18px] sm:py-3.5">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendText(s)}
              className="rounded-pill bg-bg px-3 py-[7px] text-xs font-semibold text-[#5B5F58] transition-colors hover:bg-pill-bg"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendText(input)
            }}
            placeholder="Escreva sua dúvida financeira..."
            className="flex-1 rounded-control border border-border px-3.5 py-[11px] text-[13.5px] outline-none"
          />
          <button
            type="button"
            onClick={() => sendText(input)}
            className="rounded-control bg-accent px-[18px] py-[11px] text-[13.5px] font-bold text-accent-ink"
          >
            Enviar
          </button>
        </div>
        {!isSupabaseConfigured && (
          <div className="text-[11px] text-text-muted">
            Supabase não configurado ainda — as respostas da IA não vão funcionar até isso ser feito.
          </div>
        )}
      </div>
    </div>
  )
}
