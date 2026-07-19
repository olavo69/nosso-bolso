-- Reseta os dados financeiros do casal do usuário chamador (transações, categorias,
-- metas e histórico do chat), recriando as categorias padrão em seguida.
-- A confirmação de senha acontece no client (re-autenticação) antes de chamar isso.
create or replace function reset_couple_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_couple_id uuid;
begin
  select couple_id into target_couple_id from profiles where id = auth.uid();

  if target_couple_id is null then
    raise exception 'Você não está vinculado a um casal.';
  end if;

  delete from transactions where couple_id = target_couple_id;
  delete from chat_messages where couple_id = target_couple_id;
  delete from goals where couple_id = target_couple_id;
  delete from categories where couple_id = target_couple_id;

  perform seed_default_categories(target_couple_id);
end;
$$;

grant execute on function reset_couple_data() to authenticated;
