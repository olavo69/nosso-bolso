-- A migration anterior (soft_delete_transactions) colocou "deleted_at is null"
-- na política de SELECT. Isso quebra o próprio UPDATE que marca deleted_at:
-- o PostgREST sempre faz RETURNING internamente (mesmo com Prefer: return=minimal),
-- e como a linha recém-atualizada deixa de satisfazer a política de SELECT, o
-- Postgres rejeita o UPDATE inteiro com "new row violates row-level security
-- policy" — confirmado isolando o problema direto em SQL puro (fora do PostgREST).
--
-- Corrige voltando as políticas de SELECT ao estado original (sem depender de
-- deleted_at) e movendo o filtro de "esconder apagados" pro código da
-- aplicação (`.is('deleted_at', null)` nas queries) — é o padrão mais comum
-- pra soft delete justamente por causa dessa interação do RLS com RETURNING.

drop policy "transactions_select" on transactions;
create policy "transactions_select" on transactions
  for select using (couple_id = my_couple_id());

drop policy "categories_select" on categories;
create policy "categories_select" on categories
  for select using (couple_id = my_couple_id());

drop policy "goals_select" on goals;
create policy "goals_select" on goals
  for select using (couple_id = my_couple_id());
