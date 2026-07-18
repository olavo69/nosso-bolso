export type Pessoa = 'ana' | 'marcos' | 'casal'
export type TransactionType = 'receita' | 'despesa' | 'investimento'

export type Transaction = {
  id: number
  month: number
  date: string
  descricao: string
  categoria: string
  pessoa: Pessoa
  type: TransactionType
  amount: number
  status?: string
}

export type Goal = {
  id: number
  nome: string
  current: number
  target: number
  prazo: string
  hue: number
}

export type MonthlyHistory = {
  month: number
  income: number
  expense: number
}

export const months = [
  'Jan/2026', 'Fev/2026', 'Mar/2026', 'Abr/2026', 'Mai/2026', 'Jun/2026',
  'Jul/2026', 'Ago/2026', 'Set/2026', 'Out/2026', 'Nov/2026', 'Dez/2026',
]

export const monthsShort = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

export const hues: Record<string, number> = {
  Moradia: 200,
  Alimentação: 40,
  Transporte: 260,
  Lazer: 330,
  Saúde: 150,
  Compras: 280,
  'Reserva de emergência': 190,
  Ações: 110,
  'Tesouro Direto': 60,
  Fundos: 20,
}

export const budgets: Record<string, number> = {
  Moradia: 2200,
  Alimentação: 1500,
  Transporte: 700,
  Lazer: 500,
  Saúde: 400,
  Compras: 600,
}

export const invCategorias = [
  'Reserva de emergência',
  'Ações',
  'Tesouro Direto',
  'Fundos',
  'Outros',
]

export const transactions: Transaction[] = [
  { id: 1, month: 6, date: '2026-07-02', descricao: 'Salário', categoria: 'Salário', pessoa: 'ana', type: 'receita', amount: 6200 },
  { id: 2, month: 6, date: '2026-07-03', descricao: 'Salário', categoria: 'Salário', pessoa: 'marcos', type: 'receita', amount: 5400 },
  { id: 3, month: 6, date: '2026-07-04', descricao: 'Aluguel', categoria: 'Moradia', pessoa: 'casal', type: 'despesa', amount: 2100, status: 'pago' },
  { id: 4, month: 6, date: '2026-07-05', descricao: 'Supermercado Pão de Açúcar', categoria: 'Alimentação', pessoa: 'ana', type: 'despesa', amount: 480, status: 'pago' },
  { id: 5, month: 6, date: '2026-07-06', descricao: 'Uber', categoria: 'Transporte', pessoa: 'marcos', type: 'despesa', amount: 95, status: 'pago' },
  { id: 6, month: 6, date: '2026-07-08', descricao: 'Cinema', categoria: 'Lazer', pessoa: 'casal', type: 'despesa', amount: 120, status: 'pago' },
  { id: 7, month: 6, date: '2026-07-09', descricao: 'Farmácia', categoria: 'Saúde', pessoa: 'ana', type: 'despesa', amount: 150, status: 'pago' },
  { id: 8, month: 6, date: '2026-07-10', descricao: 'Freelance design', categoria: 'Freelance', pessoa: 'ana', type: 'receita', amount: 900, status: 'recebido' },
  { id: 9, month: 6, date: '2026-07-11', descricao: 'Roupas Zara', categoria: 'Compras', pessoa: 'ana', type: 'despesa', amount: 340, status: 'pago' },
  { id: 10, month: 6, date: '2026-07-12', descricao: 'Combustível', categoria: 'Transporte', pessoa: 'marcos', type: 'despesa', amount: 210, status: 'pago' },
  { id: 11, month: 6, date: '2026-07-14', descricao: 'Restaurante japonês', categoria: 'Alimentação', pessoa: 'casal', type: 'despesa', amount: 260, status: 'pago' },
  { id: 12, month: 6, date: '2026-07-15', descricao: 'Academia', categoria: 'Saúde', pessoa: 'marcos', type: 'despesa', amount: 130, status: 'pendente' },
  { id: 13, month: 6, date: '2026-07-16', descricao: 'Show Ana Carolina', categoria: 'Lazer', pessoa: 'casal', type: 'despesa', amount: 380, status: 'pendente' },
  { id: 14, month: 6, date: '2026-07-17', descricao: 'Conta de luz', categoria: 'Moradia', pessoa: 'casal', type: 'despesa', amount: 260, status: 'pendente' },
  { id: 21, month: 6, date: '2026-07-05', descricao: 'Aporte reserva de emergência', categoria: 'Reserva de emergência', pessoa: 'casal', type: 'investimento', amount: 800, status: 'aplicado' },
  { id: 22, month: 6, date: '2026-07-10', descricao: 'Compra de ações ITSA4', categoria: 'Ações', pessoa: 'marcos', type: 'investimento', amount: 450, status: 'aplicado' },
  { id: 23, month: 6, date: '2026-07-15', descricao: 'Tesouro Selic 2029', categoria: 'Tesouro Direto', pessoa: 'ana', type: 'investimento', amount: 600, status: 'aplicado' },
  { id: 24, month: 6, date: '2026-07-20', descricao: 'Fundo multimercado', categoria: 'Fundos', pessoa: 'casal', type: 'investimento', amount: 300, status: 'a aplicar' },
  { id: 15, month: 5, date: '2026-06-02', descricao: 'Salário', categoria: 'Salário', pessoa: 'ana', type: 'receita', amount: 6200 },
  { id: 16, month: 5, date: '2026-06-03', descricao: 'Salário', categoria: 'Salário', pessoa: 'marcos', type: 'receita', amount: 5400 },
  { id: 17, month: 5, date: '2026-06-05', descricao: 'Aluguel', categoria: 'Moradia', pessoa: 'casal', type: 'despesa', amount: 2100 },
  { id: 18, month: 5, date: '2026-06-08', descricao: 'Supermercado', categoria: 'Alimentação', pessoa: 'marcos', type: 'despesa', amount: 610 },
  { id: 19, month: 5, date: '2026-06-12', descricao: 'Viagem fim de semana', categoria: 'Lazer', pessoa: 'casal', type: 'despesa', amount: 540 },
  { id: 20, month: 5, date: '2026-06-20', descricao: 'Plano de saúde', categoria: 'Saúde', pessoa: 'casal', type: 'despesa', amount: 320 },
]

export const goals: Goal[] = [
  { id: 1, nome: 'Viagem à Bahia', current: 4200, target: 8000, prazo: 'Dez/2026', hue: 150 },
  { id: 2, nome: 'Reserva de emergência', current: 9500, target: 15000, prazo: 'Mar/2027', hue: 85 },
  { id: 3, nome: 'Carro novo', current: 12000, target: 40000, prazo: 'Jun/2028', hue: 260 },
  { id: 4, nome: 'Casamento', current: 6800, target: 20000, prazo: 'Nov/2027', hue: 330 },
]

export const monthlyHistory: MonthlyHistory[] = [
  { month: 1, income: 10500, expense: 4200 },
  { month: 2, income: 10800, expense: 3900 },
  { month: 3, income: 11000, expense: 4400 },
  { month: 4, income: 11200, expense: 3800 },
  { month: 5, income: 11600, expense: 3570 },
  { month: 6, income: 12500, expense: 4525 },
]

export const profile = {
  name: 'Ana Silva',
  partnerName: 'Marcos Silva',
  email: 'ana.silva@email.com',
}

export const prefs = {
  notif: true,
  resumoSemanal: true,
  compartilharAutomatico: false,
}

export const DEFAULT_MONTH_INDEX = 6
