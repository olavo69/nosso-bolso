-- Bug real: usuários que se cadastravam e nunca clicavam em "Vincular parceiro"
-- ficavam com couple_id nulo. Toda tentativa de lançar transação, criar categoria
-- ou meta falhava silenciosamente (addTransactions/etc. checam `!profile?.couple_id`
-- e apenas retornam, sem erro) — o usuário via o modal fechar como se tivesse
-- funcionado, mas nada era salvo.
--
-- Agora todo cadastro novo já ganha um casal (com código de convite) e as
-- categorias padrão automaticamente, igual ao que create_couple() já fazia
-- manualmente. Um parceiro pode entrar depois com o código, normalmente.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_couple_id uuid;
  code text;
  attempts int := 0;
begin
  insert into public.profiles (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    nullif(new.phone, '')
  );

  loop
    code := upper(substr(md5(random()::text), 1, 6));
    begin
      insert into couples (invite_code) values (code) returning couples.id into new_couple_id;
      exit;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts > 5 then
        raise exception 'Não foi possível gerar um código de convite único';
      end if;
    end;
  end loop;

  update profiles set couple_id = new_couple_id where profiles.id = new.id;
  perform seed_default_categories(new_couple_id);

  return new;
end;
$$;
