# Handoff: Nosso Bolso — App financeiro para casais

## Overview
Protótipo de um web app (desktop) de finanças pessoais para casais. Permite gerenciar receitas, despesas e investimentos individualmente ou em conjunto, com dashboard, extrato mensal, categorias com orçamento, metas de poupança, chat com IA e perfil.

## About the Design Files
O arquivo `Nosso Bolso.dc.html` neste pacote é uma **referência de design em HTML** — um protótipo de alta fidelidade mostrando aparência e comportamento pretendidos, não código de produção para copiar diretamente. A tarefa é **recriar este design no ambiente de desenvolvimento do produto real** (React, Vue, etc. — ou o framework mais adequado, caso ainda não exista um), usando os padrões e bibliotecas já estabelecidos no projeto.

## Fidelity
**Alta fidelidade (hifi)**: cores, tipografia, espaçamento e interações finais. O desenvolvedor deve recriar a UI fielmente, adaptando aos componentes/libs já existentes no codebase de destino.

## Screens / Views
Navegação lateral fixa (sidebar, 232px, fundo `#1B1F1C`) com 6 seções. Uma topbar (76px) fica fixa no topo da área de conteúdo em todas as telas, com: título da tela, toggle Individual/Casal, avatares do casal, botão "+ Nova transação".

### 1. Dashboard
**Propósito**: visão geral financeira do mês/período selecionado.
**Layout**:
- Barra de período no topo: navegação `‹ Mês/Ano ›` + segmented control (Mês / Trimestre / Ano / Personalizado). Personalizado revela dois `<input type="date">` (início/fim).
- Grid de 4 cards de resumo (`grid-template-columns: repeat(4, minmax(0,1fr))`, gap 16px): Saldo do mês (card escuro `#1B1F1C`, texto `#F6F3EC`), Receitas (verde `#1F9D57`), Despesas (vermelho `#C2492F`), Investido (azul `#2E7DBF`, nota "não conta no saldo"). O valor do saldo anima de 0 até o valor real ao montar (ease-out cúbico, 700ms).
- Grid 1.6fr/1fr: card "Gastos e economia mês a mês" (barras = gastos por mês, linha/pontos SVG sobrepostos = economia) + card "Por categoria" (barras horizontais, top 5 categorias do período).
- Grid 1.3fr/1fr: card "Transações recentes" (últimas 5) + coluna com "Metas em foco" (top 2 metas) e "Investimentos do mês" (lista de investimentos do período).

### 2. Extrato mensal
Mesma barra de período do Dashboard + filtro adicional por pessoa (Todos/Ana/Marcos, pills). Lista de transações do período em um card único, cada linha: ícone circular (inicial da categoria, cor por hue), descrição, categoria · pessoa · data, valor (verde=receita/vermelho=despesa/azul=investimento) e status ("pago"/"pendente"/"recebido"/"a receber"/"aplicado"/"a aplicar").

### 3. Categorias
Grid 3 colunas de cards: ícone colorido, nome, status (dentro/acima do orçamento), valor gasto vs. orçamento, barra de progresso (vermelha se estourou). Último item: card tracejado "+ Nova categoria".

### 4. Metas
Grid 2 colunas de cards: nome, prazo, badge de %, barra de progresso, valores guardado/meta. Último item: card tracejado "+ Nova meta".

### 5. Chat com IA
Painel central (max-width 720px) estilo chat: header com ícone "IA", lista de mensagens (bolhas usuário à direita na cor de destaque, bot à esquerda em `#F6F3EC`), chips de sugestões, input + botão Enviar. Resposta simulada após 900ms ("digitando…").

### 6. Perfil
Card de perfil (avatar + nome + e-mail) com card do parceiro vinculado. Cards de "Preferências" (toggles) e "Conta" (moeda, plano, sair).

### Modal "Nova transação"
Overlay + painel centralizado (440px). Abas Receita / Despesa / Investimento (categorias mudam por aba). Campos: Valor, Categoria (select), Data, Quem (Ana/Marcos/Casal), Descrição, Status (Pago-Recebido-Aplicado / Não pago-A receber-A aplicar), Repetição (Única / Parcelada [com nº de parcelas] / Recorrente [gera 12 lançamentos mensais]). Botões Cancelar/Salvar.

## Interactions & Behavior
- Trocar de view faz fade/slide-up (`fadeSlideUp`, 0.4s) — usar `key` na view para remount.
- Toggle Individual/Casal mostra/esconde o segundo avatar.
- Barras/linhas de progresso animam com `transition: width/height .6s ease`.
- Modal: clique fora fecha; clique dentro não propaga.
- Filtro de período recalcula todos os totais/listas (Mês = mês âncora; Trimestre = 3 meses terminando no mês âncora; Ano = todas transações de 2026; Personalizado = intervalo de datas).
- Parcelamento divide o valor total por N e cria N transações mensais consecutivas rotuladas "(i/N)"; a 1ª usa o status escolhido, as seguintes ficam pendentes.
- Recorrente cria 12 lançamentos mensais com o mesmo valor.

## State Management
- `view`: 'dashboard' | 'extrato' | 'categorias' | 'metas' | 'chat' | 'perfil'
- `coupleMode`: boolean
- `periodMode`: 'mes' | 'trimestre' | 'ano' | 'custom'; `monthIndex` (0–11); `customStart`/`customEnd` (ISO date)
- `personFilter` (extrato): 'todos' | 'ana' | 'marcos'
- `transactions[]`: `{ id, month, date, descricao, categoria, pessoa, type: 'receita'|'despesa'|'investimento', amount, status, recorrente? }`
- `categories`/`budgets`, `goals[]`, `monthlyHistory[]` (para o gráfico), `chatMessages[]`, `profile`, `prefs`
- `modalOpen`, `modalType`, `form` (valor, categoria, data, descricao, pessoa, pago, repeticao, parcelas)

## Design Tokens
**Cores**
- Fundo geral: `#F6F3EC`
- Superfície/cards: `#FFFFFF`, borda `#E7E2D6`
- Texto principal: `#1B1F1C`; texto secundário: `#7A7C73` / `#9A9C91`
- Sidebar: `#1B1F1C`, hover/ativo com accent
- Accent (tweakable): `#2ECC71` (verde) — opções: `#2ECC71`, `#D9C9A3`, `#3AA0FF`
- Receita: `#1F9D57` · Despesa: `#C2492F` · Investimento: `#2E7DBF`
- Status pendente/a receber/a aplicar: `#B8862B`
- Categorias: cor gerada via `oklch(55% 0.14 <hue>)`, tint de fundo `oklch(94% 0.03 <hue>)` — hues: Moradia 200, Alimentação 40, Transporte 260, Lazer 330, Saúde 150, Compras 280, Reserva 190, Ações 110, Tesouro 60, Fundos 20

**Tipografia**
- Títulos/números de destaque: Nunito 700/800
- Corpo/dados: Inter 400/500/600/700

**Outros**
- Border-radius: 12–22px (cards 20px, botões/inputs 10–12px, avatares/pills 999px)
- Sombra: nenhuma sombra pesada — design flat com bordas sutis
- Moeda: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`

## Assets
Nenhuma imagem externa — avatares e ícones de categoria são iniciais em círculos coloridos (sem SVGs desenhados à mão).

## Files
- `Nosso Bolso.dc.html` — protótipo completo (template + lógica) com todas as 6 telas e o modal de nova transação.
