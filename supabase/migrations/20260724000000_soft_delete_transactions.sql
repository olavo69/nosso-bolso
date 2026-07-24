-- Soft delete: em vez de apagar linhas de verdade, marca deleted_at e esconde
-- via RLS. Motivado por um erro real (24/07): um DELETE mal escopado apagou
-- transações de mais de uma conta de uma vez, sem forma de recuperar. Com
-- isso, um DELETE feito pelo app nunca mais some com dado de verdade — fica
-- só invisível, reversível com um UPDATE.
--
-- Não protege contra acesso direto ao banco com a senha do superusuário
-- (RLS não vale pra esse papel) — isso depende de backup/PITR (fora do
-- escopo desta migration) e de disciplina operacional.

alter table transactions add column deleted_at timestamptz;
alter table categories add column deleted_at timestamptz;
alter table goals add column deleted_at timestamptz;

drop policy "transactions_select" on transactions;
create policy "transactions_select" on transactions
  for select using (couple_id = my_couple_id() and deleted_at is null);
drop policy "transactions_delete" on transactions;

drop policy "categories_select" on categories;
create policy "categories_select" on categories
  for select using (couple_id = my_couple_id() and deleted_at is null);
drop policy "categories_delete" on categories;

drop policy "goals_select" on goals;
create policy "goals_select" on goals
  for select using (couple_id = my_couple_id() and deleted_at is null);
drop policy "goals_delete" on goals;
