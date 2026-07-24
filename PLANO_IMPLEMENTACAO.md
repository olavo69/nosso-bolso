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

**Bug real (23/07) reportado por usuária de fora (Helen)**: cadastro ficava com `couple_id` nulo até a pessoa clicar em "Vincular parceiro" no Perfil — nada obrigava ou lembrava disso. Enquanto isso, `TransactionsContext.addTransactions`/`updateTransaction`/`deleteTransaction` apenas retornavam sem erro quando `couple_id` era nulo, então toda tentativa de lançar receita/despesa fechava o modal como se tivesse salvo, mas nada ia pro banco. Corrigido em duas frentes:
- `handle_new_user()` (trigger de signup) agora já cria o casal + semeia as categorias padrão automaticamente pra todo cadastro novo (senha ou Google) — `couple_id` nunca mais fica nulo.
- `TransactionsContext` agora lança erro nesse caso (igual `CategoriesContext`/`GoalsContext` já faziam), e os modais mostram uma mensagem clara em vez de fechar silenciosamente.

Duas contas reais presas nesse estado (Helen e uma outra usuária, Jessica, cadastrada em 20/07) foram corrigidas manualmente no banco.

`pessoa` deixou de ser `'ana'|'marcos'|'casal'` fixo e virou `pessoa_id` (uuid nullable, `null` = casal) — isso mudou `pessoaLabel`, `PersonFilter`, o seletor "Quem" do modal e os avatares da Topbar, que agora resolvem nome/iniciais reais via `AuthContext`.

Nota: `mailer_autoconfirm` foi ativado temporariamente durante os testes (contas de teste sem confirmação por e-mail) e reativado (`false`) em seguida — cadastros agora exigem confirmação por e-mail antes de entrar. O Supabase usa seu mailer próprio no plano gratuito (limite baixo de envios/hora); configurar SMTP próprio fica como item da Fase 11 se o volume de cadastro exigir.

- [x] Landing page (`/`) para visitantes sem sessão — gap do design original, que não tinha essa tela. Copy e estrutura (hero, funcionalidades, "como funciona", depoimentos, FAQ, CTA) geradas com apoio de IA de design e portadas pra `src/pages/Landing.tsx` usando os mesmos tokens visuais do app. `/login` ganhou suporte a `?mode=cadastrar` pro CTA "Criar conta grátis" abrir direto na aba de cadastro.

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

Modelo em uso: `nvidia/nemotron-3-nano-30b-a3b:free` (gratuito, 256k de contexto, testado com pergunta financeira real e respondeu certo duas vezes seguidas). Já foi trocado uma vez antes (`openai/gpt-oss-20b:free`, que funcionava mas era mais fraco); `google/gemma-4-31b-it:free` foi testado e descartado (erro 502). Trocar em `supabase/functions/chat/index.ts` (`MODEL`) se quiser algo mais robusto depois de adicionar crédito no OpenRouter.

## Fase 10 — Perfil
- [x] Card de perfil (avatar, nome, e-mail) + card do parceiro vinculado
- [x] Card "Preferências" (toggles) + card "Conta" (moeda, plano, sair)
- [x] Resetar todos os dados — gap do design original; botão em "Conta" abre modal que exige confirmar a senha atual (`signInWithPassword`) antes de chamar a função `reset_couple_data()` (apaga transações/metas/categorias do casal e re-semeia as categorias padrão)

## Fase 11 — Deploy & polish
- [x] Deploy de produção no Cloudflare Pages — https://nosso-bolso-5cl.pages.dev, projeto `nosso-bolso` conectado ao repo `olavo69/nosso-bolso` (build automático a cada `git push` na `main`)
- [x] Variáveis de ambiente configuradas (Supabase URL/anon key, etc.) — as variáveis do painel do Cloudflare não estavam chegando no passo de build (bug/limite da plataforma, builds sucessivos saíam com bundle idêntico); contornado commitando `.env.production` com os valores públicos (URL + anon key — protegidos por RLS, não por sigilo, então é seguro versionar)
- [x] Teste manual pós-deploy: landing page e login/dashboard testados direto em produção (conta da Ana), carregando dados reais do Supabase sem erros de console
- [x] Teste manual completo das 6 telas + modal em produção, comparando com as screenshots de referência
- [ ] Domínio customizado (opcional — hoje roda no subdomínio gratuito `.pages.dev`)

Bug encontrado durante o teste manual em produção: o gráfico "Gastos e economia mês a mês" do Dashboard ainda usava o histórico mockado fixo (`monthlyHistory` de `mockData.ts`) em vez de calcular a partir das transações reais — aparecia igual em qualquer conta, inclusive depois de um reset. Corrigido calculando os 6 meses a partir de `transactions` de verdade.

Bug encontrado com usuários reais testando: login com Google (e, possivelmente, links de confirmação de e-mail) falhavam com `ERR_CONNECTION_FAILED` apontando pra `localhost`. Causa: o **Site URL** e **Redirect URLs** do Supabase Auth (`Authentication → URL Configuration`) continuavam configurados só para `http://localhost:5173` — nunca tinham sido atualizados para o domínio de produção depois do deploy no Cloudflare. Corrigido adicionando `https://nosso-bolso-5cl.pages.dev` como Site URL e `https://nosso-bolso-5cl.pages.dev/**` em Redirect URLs. **Atenção**: se o domínio mudar (domínio customizado, por exemplo), essa configuração precisa ser atualizada de novo.

## Fase 12 — Responsivo (navegador mobile)

Hoje o app é desktop-first: sidebar fixa de 232px, grids de 2-4 colunas, modal com largura fixa. O objetivo dessa fase é o site inteiro ficar usável abrindo direto pelo navegador do celular (Safari/Chrome mobile), sem precisar de app nativo (isso fica pra Fase 13).

- [x] Sidebar: vira menu inferior fixo (`MobileNav.tsx`) abaixo de `md` (768px); sidebar lateral escondida via `hidden md:flex`
- [x] Topbar: reorganizada — título encolhe e some o subtítulo, toggle Individual/Casal e botão "+ Nova transação" encolhem, avatares somem, tudo com `flex-wrap` abaixo de `sm`
- [x] Dashboard: cards de resumo em grid 2×2 no mobile (4 no desktop), gráfico + categorias e transações + metas empilhando em coluna única abaixo de `lg`
- [x] Extrato, Categorias, Metas: grids caindo pra 1 coluna (`sm`/`lg` conforme o caso); `PeriodBar` com `flex-wrap` e o seletor de período com scroll horizontal
- [x] Modal "Nova transação" e os demais (Nova categoria, Nova meta, Resetar dados): tela cheia no mobile (ou quase, com `max-h`/scroll interno) em vez do card de largura fixa
- [x] Chat: padding e largura das bolhas ajustados, altura recalculada considerando o menu inferior
- [x] Login: já era responsivo (max-width + padding), só validado
- [x] Landing page: padding horizontal, tamanho da headline e wrap dos botões/rodapé ajustados pra mobile
- [x] Testado em 375px e 430px (Playwright): sem overflow horizontal em nenhuma tela, sem erros de console

Bug real reportado por usuários de fora testando pelo celular (não abria de forma usável) — motivou essa fase ser adiantada.

## Fase 13 — Apps nativos (iOS e Android)

Anotado para depois da Fase 12. Ainda sem decisão de abordagem (React Native/Expo reaproveitando lógica, PWA instalável, Capacitor envolvendo o mesmo front web, etc.) — avaliar quando chegar a hora.

## Fase 14 — Integração com WhatsApp

### Decisões de arquitetura

**Meta Cloud API (oficial) vs Evolution API** — usar a **Cloud API oficial da Meta**. A Evolution API (e libs parecidas como Baileys/whatsapp-web.js) automatiza o WhatsApp Web sem aprovação da Meta, então sobe muito mais rápido, mas roda por fora dos Termos de Uso do WhatsApp — o número pode ser banido sem aviso, e o app já tem usuários reais com dados financeiros de verdade dependendo disso. Vale a pena começar já o processo de verificação de conta Business (pode levar dias a semanas) em paralelo com o resto do desenvolvimento, em vez de deixar pra depois.

**Precisa de LangChain?** Não. O Chat já funciona hoje chamando o OpenRouter direto (Edge Function + prompt), sem framework por cima. Pra extrair uma transação estruturada de uma mensagem tipo "gastei 50 no mercado", o caminho mais simples é usar **structured output / function calling nativo** do modelo (formato JSON schema, que o OpenRouter já repassa pra a maioria dos modelos), sem precisar de LangChain — LangChain compensa em pipelines multi-etapa com muitas ferramentas e memória complexa, que não é o nosso caso aqui (é basicamente "texto → 1 objeto estruturado → grava no banco").

**Precisa de Python?** Não. Toda a stack já é TypeScript (React no front, Supabase Edge Functions em Deno no back). O webhook do WhatsApp é só mais uma Edge Function nova (`whatsapp-webhook`), no mesmo padrão da função `chat` que já existe — sem introduzir uma segunda linguagem/serviço pra manter.

### Como a IA lança uma transação a partir da mensagem

1. Mensagem chega no número do WhatsApp Business → webhook da Meta → nova Edge Function `whatsapp-webhook`.
2. A função identifica de qual usuário é o número (ver seção de identificação abaixo) e busca o `couple_id` e as categorias existentes.
3. Chama o OpenRouter com a mensagem + um "tool" `registrar_transacao` (schema: tipo, valor, categoria, descrição, data, quem) — mesmo modelo já usado no Chat, só trocando o prompt e adicionando a extração estruturada.
4. Se a extração vier completa e com confiança razoável, grava direto em `transactions` (mesma tabela e RLS de hoje, só que gravado a partir do backend com o `couple_id` correto).
5. Responde no WhatsApp confirmando o que foi lançado (ex: "Lancei R$ 50,00 em Alimentação ✅") — importante pra dar chance da pessoa corrigir se a IA entendeu errado.
6. Se a mensagem for ambígua (falta valor, categoria não existe, etc.), a IA pergunta de volta em vez de chutar.
7. Correção/edição por mensagem (ex: "errado, era R$ 80") fica como melhoria pra depois do MVP, não é bloqueante pra primeira versão.

### Como ela manda relatórios pelo WhatsApp

Duas situações diferentes, porque o WhatsApp trata mensagem "de resposta" e mensagem "iniciada pela empresa" de formas diferentes:

- **Usuário pergunta primeiro** (ex: "como estão nossos gastos esse mês?"): dentro da janela de 24h depois da última mensagem do usuário, dá pra responder com texto livre — reaproveita a mesma lógica de contexto financeiro já usada no Chat (`buildFinancialContext`).
- **Relatório proativo** (ex: resumo toda segunda-feira, sem o usuário ter mandado nada): fora da janela de 24h, o WhatsApp exige um **template de mensagem pré-aprovado pela Meta** (texto fixo com variáveis, tipo "Resumo semanal: vocês gastaram {{1}} essa semana"). Precisa submeter esse template pra aprovação com antecedência. O disparo em si viria de um job agendado (cron do Supabase ou do Cloudflare) chamando a Cloud API pra cada usuário que tiver optado por receber.

### Como identificar o usuário certo

`profiles.phone` já existe no schema, mas confiar num número digitado num formulário é arriscado (erro de formatação, DDI errado). Melhor reaproveitar o mesmo padrão já usado pro vínculo de casal (código de convite):

1. Em Perfil, um botão "Conectar WhatsApp" gera um código único (RPC parecida com `create_couple`).
2. O usuário manda esse código como primeira mensagem pro número do bot.
3. O webhook confirma o código, vincula o `wa_id` (identificador do WhatsApp) ao `profile.id`, e responde confirmando a conexão.
4. Daí em diante, toda mensagem desse número já cai automaticamente na conta certa, sem precisar confiar em número digitado à mão.

### Ordem sugerida de execução

- [ ] Criar app/conta Business no Meta for Developers e iniciar processo de verificação (demora, então começar cedo)
- [ ] Migration: coluna/tabela pra vincular `wa_id` ↔ `profile.id` (e código de vínculo, reaproveitando padrão de `couples.invite_code`)
- [ ] UI em Perfil: botão "Conectar WhatsApp" + exibição do código
- [ ] Edge Function `whatsapp-webhook`: recebe mensagens, resolve o usuário, chama o OpenRouter com function calling
- [ ] Fluxo de lançar transação por mensagem (com confirmação/pergunta de volta)
- [ ] Fluxo de pergunta livre dentro da janela de 24h (reusa `buildFinancialContext`)
- [ ] Template de relatório proativo + aprovação na Meta + job agendado (fase 2 desse recurso, não bloqueia o lançamento inicial)
- [ ] (futuro) Relatório em PDF mandado por WhatsApp — ver Fase 15

## Fase 15 — Importar planilha de finanças antigas

Anotado, sem escopo detalhado ainda. Não é um problema de IA "pesada": ler o arquivo (CSV/Excel), mapear colunas pra data/valor/descrição/categoria/tipo (com o usuário confirmando o mapeamento antes de importar) e gravar em lote em `transactions` — parecido com o que a função `addTransactions` já faz pro parcelamento. IA entra só num ponto pontual, se a planilha não tiver categoria já definida: classificar a descrição numa das categorias existentes (chamada simples ao modelo, sem RAG nem banco vetorial).

## Fase 16 — Chat lança transação por texto ("gastei 250 no mercado")

Serve de base pro item "lançar transação por mensagem" da Fase 14 (WhatsApp) — a mesma lógica de function calling dá pra usar nos dois lugares.

- [x] Edge Function `chat`: ferramenta `registrar_transacao` (tipo, valor, categoria, descrição, data) via function calling do OpenRouter (modelo em uso já suporta `tools`/`tool_choice`)
- [x] Quando o modelo chama a ferramenta, grava direto em `transactions` (usa `ctx.supabase` — client autenticado do `@supabase/server`, respeitando RLS — em vez de confiar em `couple_id` vindo do client)
- [x] Se faltar dado ou a categoria não existir, a IA pergunta de volta em vez de chutar
- [x] `Chat.tsx`: atualiza Extrato/Dashboard automaticamente depois de uma transação criada pelo chat (`refetch` exposto pelo `TransactionsContext`)
- [x] Correção: a IA "inventava" uma data quando o usuário não mencionava uma (ex: gravou 2025-11-03 pra um lançamento de hoje) — corrigido informando a data real no prompt e validando no servidor com uma margem de segurança (rejeita datas fora de ~1 ano atrás a 7 dias no futuro, usa hoje como padrão)

A função `withSupabase` estava configurada como `{ auth: ["publishable"] }` (não valida usuário, `ctx.userClaims` sempre nulo) — trocado pra `{ auth: ["user"] }` pra dar pra identificar quem está mandando a mensagem.

## Fase 17 — Backup / Point-in-Time Recovery

Anotado, não implementado. Motivado por um erro real (24/07): um `DELETE` mal escopado rodado direto no banco (fora do app) apagou transações de mais de uma conta de uma vez, sem qualquer forma de recuperação — o projeto está no plano gratuito do Supabase, que não inclui backup nem PITR (`pitr_enabled: false`, zero backups físicos, confirmado via `supabase backups list`).

- [ ] Avaliar upgrade pro plano Pro do Supabase (~US$25/mês) quando o app tiver usuários reais dependendo dele no dia a dia
- [ ] Habilitar PITR (recuperação por timestamp, geralmente com alguns dias de retenção)

Complementar ao soft delete (abaixo): soft delete protege contra erro/bug feito *através do app* (RLS ainda vale); backup/PITR é a única proteção contra erro feito com acesso direto ao banco via credencial de superusuário — que é exatamente o que causou o incidente de 24/07.

## Soft delete em transactions/categories/goals

Implementado em 24/07, junto com o item acima. Em vez de `DELETE` de verdade, `deleteTransaction` agora marca `deleted_at` — a linha nunca some do banco, só fica escondida das consultas normais (filtro `.is('deleted_at', null)` no código, não no RLS — ver nota abaixo). Reversível com um `UPDATE` simples se algo for apagado por engano.

Nota técnica: a primeira tentativa colocou o filtro `deleted_at is null` na política de `SELECT` do RLS, mas isso quebra o próprio `UPDATE` que marca `deleted_at` — o PostgREST sempre faz `RETURNING` internamente (mesmo com `Prefer: return=minimal`), e como a linha recém-atualizada deixa de satisfazer a política de SELECT, o Postgres rejeita o UPDATE inteiro. Corrigido movendo o filtro pro código da aplicação, que é o padrão mais comum pra soft delete por causa dessa exata interação do RLS com RETURNING.

---

## Como acompanhar
Marque os checkboxes `[ ]` → `[x]` conforme formos avançando. Podemos ir fase por fase — cada uma vira um passo de implementação que eu executo e você revisa antes de seguir pra próxima.
