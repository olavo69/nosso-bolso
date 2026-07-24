export type ProfileRow = {
  id: string
  couple_id: string | null
  name: string
  email: string | null
  phone: string | null
  currency: string
  plan: string
  created_at: string
}

export type CategoryRow = {
  id: string
  couple_id: string
  nome: string
  tipo: 'despesa' | 'receita' | 'investimento'
  hue: number
  budget: number | null
  created_at: string
  deleted_at: string | null
}

export type GoalRow = {
  id: string
  couple_id: string
  nome: string
  current_amount: number
  target: number
  prazo: string
  hue: number
  created_at: string
  deleted_at: string | null
}

export type TransactionRow = {
  id: string
  couple_id: string
  pessoa_id: string | null
  type: 'receita' | 'despesa' | 'investimento'
  amount: number
  data: string
  categoria: string
  descricao: string
  status: string | null
  recorrente: boolean
  parcela_atual: number | null
  parcela_total: number | null
  created_at: string
  deleted_at: string | null
}

export type ChatMessageRow = {
  id: string
  couple_id: string
  profile_id: string | null
  from_role: 'user' | 'bot'
  text: string
  created_at: string
}
