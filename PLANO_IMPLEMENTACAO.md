# Plano de Implementação — Nosso Bolso

Baseado no handoff de design em [design_handoff_nosso_bolso/README.md](design_handoff_nosso_bolso/README.md).

## Stack definida
- **Frontend**: React 19 + Vite + TypeScript
- **Estilo**: Tailwind CSS
- **Backend**: Supabase (Postgres + Auth + RLS + Edge Functions)
- **IA**: OpenRouter, acessado via Edge Function (proxy — a key nunca fica no client)
- **Deploy**: Cloudflare Pages

Libs de apoio: `@supabase/supabase-js`, `@tanstack/react-query` (cache de dados), `react-hook-form` + `zod` (formulário do modal), `recharts` (gráficos), `date-fns` (cálculo de períodos), `react-router` (navegação).

---

## Fase 0 — Setup do projeto
- [x] Criar repositório Git
- [x] Scaffold Vite + React 19 + TypeScript
- [x] Instalar e configurar Tailwind (cores, fontes Nunito/Inter, radius conforme tokens)
- [x] Instalar libs de apoio (lista acima)
- [ ] Criar projeto no Supabase
- [ ] Conectar repo ao Cloudflare Pages (build command, preview deploys automáticos por PR)

## Fase 1 — Modelagem de dados (Supabase)
- [ ] `profiles` (usuário: nome, avatar, moeda, plano)
- [ ] `couples` (vincula 2 profiles)
- [ ] `transactions` (id, couple_id, pessoa, type: receita/despesa/investimento, amount, categoria, data, status, recorrente, info de parcela)
- [ ] `categories` / `budgets` (por couple, orçamento mensal por categoria)
- [ ] `goals` (metas de poupança: nome, prazo, valor guardado/meta)
- [ ] `chat_messages` (histórico do chat com IA, opcional)
- [ ] Row Level Security: cada usuário só acessa dados do próprio `couple_id`
- [ ] Seed de categorias padrão (cores via `oklch(55% 0.14 <hue>)`, hues do README)

## Fase 2 — Auth & vínculo de casal
- [ ] Tela de login/cadastro (Supabase Auth)
- [ ] Fluxo de convite/vínculo do parceiro (gera `couple_id` compartilhado)
- [ ] Contexto de auth no React (usuário atual + parceiro vinculado)

## Fase 3 — Shell da aplicação
- [x] Sidebar fixa (232px, `#1B1F1C`, 6 seções)
- [x] Topbar (76px): título da tela, toggle Individual/Casal, avatares, botão "+ Nova transação"
- [x] Roteamento com transição entre views (fade/slide-up, 0.4s)
- [x] Tokens de design no Tailwind config (cores, radius 12–22px, sem sombras pesadas)

## Fase 4 — Dashboard
- [ ] Barra de período (Mês/Trimestre/Ano/Personalizado) + lógica de cálculo dos totais
- [ ] 4 cards de resumo (Saldo, Receitas, Despesas, Investido) com animação de contagem (0 → valor, ease-out cúbico, 700ms)
- [ ] Gráfico "gastos e economia mês a mês" (barras + linha sobreposta)
- [ ] Gráfico "por categoria" (barras horizontais, top 5)
- [ ] Card "Transações recentes" (últimas 5)
- [ ] "Metas em foco" (top 2) + "Investimentos do mês"

## Fase 5 — Extrato mensal
- [ ] Barra de período + filtro por pessoa (pills: Todos/Ana/Marcos)
- [ ] Lista de transações (ícone circular por categoria, status: pago/pendente/recebido/a receber/aplicado/a aplicar)

## Fase 6 — Categorias
- [ ] Grid de cards (ícone, status dentro/acima do orçamento, barra de progresso — vermelha se estourou)
- [ ] Card tracejado "+ Nova categoria"

## Fase 7 — Metas
- [ ] Grid de cards (nome, prazo, badge %, progresso, guardado/meta)
- [ ] Card tracejado "+ Nova meta"

## Fase 8 — Modal "Nova transação"
- [ ] Abas Receita / Despesa / Investimento (categorias mudam por aba)
- [ ] Formulário com React Hook Form + Zod (Valor, Categoria, Data, Quem, Descrição, Status, Repetição)
- [ ] Lógica de parcelamento (divide valor por N, cria N transações rotuladas "(i/N)", 1ª com status escolhido, demais pendentes)
- [ ] Lógica de recorrência (12 lançamentos mensais com mesmo valor)
- [ ] Persistência no Supabase

## Fase 9 — Chat com IA
- [ ] Edge Function no Supabase como proxy para o OpenRouter (esconde a API key)
- [ ] UI de chat (bolhas usuário/bot, chips de sugestão, indicador "digitando…")
- [ ] Contexto financeiro do usuário incluído no prompt (transações, categorias, metas)

## Fase 10 — Perfil
- [ ] Card de perfil (avatar, nome, e-mail) + card do parceiro vinculado
- [ ] Card "Preferências" (toggles) + card "Conta" (moeda, plano, sair)

## Fase 11 — Deploy & polish
- [ ] Deploy de produção no Cloudflare Pages
- [ ] Variáveis de ambiente configuradas (Supabase URL/anon key, etc.)
- [ ] Teste manual das 6 telas + modal, comparando com as screenshots de referência
- [ ] Checagem de responsividade básica (design é desktop-first, mas vale checar breakpoints mínimos)

---

## Como acompanhar
Marque os checkboxes `[ ]` → `[x]` conforme formos avançando. Podemos ir fase por fase — cada uma vira um passo de implementação que eu executo e você revisa antes de seguir pra próxima.
