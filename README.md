# Nosso Bolso

App financeiro para casais — receitas, despesas e investimentos individuais ou em conjunto, com dashboard, extrato, categorias, metas e chat com IA.

Design de referência em [design_handoff_nosso_bolso/](design_handoff_nosso_bolso/). Plano de implementação e progresso em [PLANO_IMPLEMENTACAO.md](PLANO_IMPLEMENTACAO.md).

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + RLS + Edge Functions)
- OpenRouter (via Edge Function proxy) para o chat com IA
- Deploy: Cloudflare Pages

## Rodando localmente

```bash
npm install
npm run dev
```
