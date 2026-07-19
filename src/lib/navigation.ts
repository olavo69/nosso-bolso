export type ViewKey =
  | 'dashboard'
  | 'extrato'
  | 'categorias'
  | 'metas'
  | 'chat'
  | 'perfil'

export const navItems: { key: ViewKey; label: string; path: string }[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/' },
  { key: 'extrato', label: 'Extrato mensal', path: '/extrato' },
  { key: 'categorias', label: 'Categorias', path: '/categorias' },
  { key: 'metas', label: 'Metas', path: '/metas' },
  { key: 'chat', label: 'Chat com IA', path: '/chat' },
  { key: 'perfil', label: 'Perfil', path: '/perfil' },
]

export const viewTitles: Record<ViewKey, [string, string]> = {
  dashboard: ['Olá 👋', 'Aqui está o resumo financeiro do casal'],
  extrato: ['Extrato mensal', 'Todas as transações do período'],
  categorias: ['Categorias', 'Orçamento e gastos por categoria'],
  metas: ['Metas', 'Acompanhe os objetivos do casal'],
  chat: ['Chat com IA', 'Tire dúvidas sobre suas finanças'],
  perfil: ['Perfil', 'Sua conta e preferências'],
}
