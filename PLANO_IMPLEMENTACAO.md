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
- [x] Criar projeto no Supabase (`nosso-bolso`, ref `uzmicducyxwkbbddlkxl`) — feito na Fase 9, sob demanda
- [ ] Conectar repo ao Cloudflare Pages (build command, preview deploys automáticos por PR)

## Fase 1 — Modelagem de dados (Supabase)
- [x] `profiles` (usuário: nome, moeda, plano, `couple_id`)
- [x] `couples` (`invite_code` único; vincula 2 profiles)
- [x] `transactions` (id, couple_id, `pessoa_id` nullable, type, amount, categoria, data, status, recorrente, parcela_atual/parcela_total)
- [x] `categories` (por couple, `tipo` despesa/receita/investimento, hue, budget nullable)
- [x] `goals` (metas de poupança: nome, prazo, `current_amount`/target, hue)
- [x] `chat_messages` (histórico do chat com IA — persistido de verdade, não é mais opcional)
- [x] Row Level Security em todas as tabelas via função `my_couple_id()` (security definer, evita recursão)
- [x] Seed de categorias padrão via função `seed_default_categories()`, chamada automaticamente em `create_couple()`

Migrations em `supabase/migrations/`. Colunas monetárias usam `double precision` (não `numeric`) — PostgREST devolve `numeric` como string, o que quebraria as contas no front.

## Fase 2 — Auth & vínculo de casal
- [x] Tela de login/cadastro (Supabase Auth) — `src/pages/Login.tsx`, sem referência no design original
- [x] Fluxo de convite/vínculo do parceiro — funções RPC `create_couple()` / `join_couple(code)`, código de 6 caracteres
- [x] Contexto de auth no React (`AuthContext`: usuário atual + parceiro vinculado)
- [x] Login com Google (OAuth) — cliente criado no Google Cloud Console (projeto `gseapi`), provider ativado no Supabase. Redirect testado (cai certo na tela do Google); fluxo completo depende de login real do usuário.
- [x] "Esqueci minha senha" (`resetPasswordForEmail`)
- [x] Detecção de e-mail já cadastrado no signup (Supabase não retorna erro por padrão; checamos `identities.length === 0`)

Testado de ponta a ponta: 2 contas reais cadastradas, vinculadas via código de convite, dados mockados originais re-inseridos nelas para comparação visual, e uma 3ª conta não vinculada confirmando que o RLS isola os dados corretamente (não vê nada do casal Ana/Marcos).

`pessoa` deixou de ser `'ana'|'marcos'|'casal'` fixo e virou `pessoa_id` (uuid nullable, `null` = casal) — isso mudou `pessoaLabel`, `PersonFilter`, o seletor "Quem" do modal e os avatares da Topbar, que agora resolvem nome/iniciais reais via `AuthContext`.

Nota: `mailer_autoconfirm` foi ativado temporariamente durante os testes (contas de teste sem confirmação por e-mail) e reativado (`false`) em seguida — cadastros agora exigem confirmação por e-mail antes de entrar. O Supabase usa seu mailer próprio no plano gratuito (limite baixo de envios/hora); configurar SMTP próprio fica como item da Fase 11 se o volume de cadastro exigir.

## Fase 3 — Shell da aplicação
- [x] Sidebar fixa (232px, `#1B1F1C`, 6 seções)
- [x] Topbar (76px): título da tela, toggle Individual/Casal, avatares, botão "+ Nova transação"
- [x] Roteamento com transição entre views (fade/slide-up, 0.4s)
- [x] Tokens de design no Tailwind config (cores, radius 12–22px, sem sombras pesadas)

## Fase 4 — Dashboard
- [x] Barra de período (Mês/Trimestre/Ano/Personalizado) + lógica de cálculo dos totais
- [x] 4 cards de resumo (Saldo, Receitas, Despesas, Investido) com animação de contagem (0 → valor, ease-out cúbico, 700ms)
- [x] Gráfico "gastos e economia mês a mês" (barras + linha sobreposta)
- [x] Gráfico "por categoria" (barras horizontais, top 5)
- [x] Card "Transações recentes" (últimas 5)
- [x] "Metas em foco" (top 2) + "Investimentos do mês"

Dados agora vêm do Supabase (Fase 1) via `TransactionsContext`/`CategoriesContext`/`GoalsContext`. `src/data/mockData.ts` ainda existe só para os textos/labels estáticos (meses, hues de referência) e como base do script de seed usado nas contas de teste.

## Fase 5 — Extrato mensal
- [x] Barra de período + filtro por pessoa (pills: Todos/Ana/Marcos)
- [x] Lista de transações (ícone circular por categoria, status: pago/pendente/recebido/a receber/aplicado/a aplicar)

## Fase 6 — Categorias
- [x] Grid de cards (ícone, status dentro/acima do orçamento, barra de progresso — vermelha se estourou)
- [x] Card tracejado "+ Nova categoria"

## Fase 7 — Metas
- [x] Grid de cards (nome, prazo, badge %, progresso, guardado/meta)
- [x] Card tracejado "+ Nova meta"

## Fase 8 — Modal "Nova transação"
- [x] Abas Receita / Despesa / Investimento (categorias mudam por aba)
- [x] Formulário (Valor, Categoria, Data, Quem, Descrição, Status, Repetição) — usando `useState` simples em vez de React Hook Form + Zod (formulário pequeno e sem validação complexa; reavaliar se crescer)
- [x] Lógica de parcelamento (divide valor por N, cria N transações rotuladas "(i/N)", 1ª com status escolhido, demais pendentes)
- [x] Lógica de recorrência (12 lançamentos mensais com mesmo valor)
- [x] Persistência no Supabase — `TransactionsContext` lê/grava direto na tabela `transactions`
- [x] Editar transação existente — gap do design original (não tinha essa opção); clicar numa linha no Extrato, Dashboard ou Investimentos abre o mesmo modal preenchido, sem a seção Repetição
- [x] Excluir transação — botão no modal de edição, com confirmação em 2 cliques ("Excluir transação" → "Clique de novo para confirmar")

## Fase 9 — Chat com IA
- [x] Edge Function no Supabase como proxy para o OpenRouter (esconde a API key) — deployada em `nosso-bolso` (ref `uzmicducyxwkbbddlkxl`)
- [x] UI de chat (bolhas usuário/bot, chips de sugestão, indicador "digitando…")
- [x] Contexto financeiro do usuário incluído no prompt (transações, categorias, metas)

Modelo em uso: `openai/gpt-oss-20b:free` (gratuito, testado e estável — outros modelos `:free` testados deram rate limit ou foram descontinuados). Trocar em `supabase/functions/chat/index.ts` (`MODEL`) se quiser algo mais robusto depois de adicionar crédito no OpenRouter.

## Fase 10 — Perfil
- [x] Card de perfil (avatar, nome, e-mail) + card do parceiro vinculado
- [x] Card "Preferências" (toggles) + card "Conta" (moeda, plano, sair)
- [x] Resetar todos os dados — gap do design original; botão em "Conta" abre modal que exige confirmar a senha atual (`signInWithPassword`) antes de chamar a função `reset_couple_data()` (apaga transações/metas/categorias do casal e re-semeia as categorias padrão)

## Fase 11 — Deploy & polish
- [ ] Deploy de produção no Cloudflare Pages
- [ ] Variáveis de ambiente configuradas (Supabase URL/anon key, etc.)
- [ ] Teste manual das 6 telas + modal, comparando com as screenshots de referência
- [ ] Checagem de responsividade básica (design é desktop-first, mas vale checar breakpoints mínimos)

---

## Como acompanhar
Marque os checkboxes `[ ]` → `[x]` conforme formos avançando. Podemos ir fase por fase — cada uma vira um passo de implementação que eu executo e você revisa antes de seguir pra próxima.
