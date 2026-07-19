-- Trigger: cria profile automaticamente ao cadastrar no auth.users
create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Seed de categorias padrão para um casal novo (README: hues + orçamentos)
create function seed_default_categories(target_couple_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (couple_id, nome, tipo, hue, budget) values
    (target_couple_id, 'Moradia', 'despesa', 200, 2200),
    (target_couple_id, 'Alimentação', 'despesa', 40, 1500),
    (target_couple_id, 'Transporte', 'despesa', 260, 700),
    (target_couple_id, 'Lazer', 'despesa', 330, 500),
    (target_couple_id, 'Saúde', 'despesa', 150, 400),
    (target_couple_id, 'Compras', 'despesa', 280, 600),
    (target_couple_id, 'Reserva de emergência', 'investimento', 190, null),
    (target_couple_id, 'Ações', 'investimento', 110, null),
    (target_couple_id, 'Tesouro Direto', 'investimento', 60, null),
    (target_couple_id, 'Fundos', 'investimento', 20, null),
    (target_couple_id, 'Salário', 'receita', 150, null),
    (target_couple_id, 'Freelance', 'receita', 90, null),
    (target_couple_id, 'Outros', 'receita', 0, null);
end;
$$;

-- Cria um casal novo (ou retorna o existente) vinculado ao usuário chamador
create function create_couple()
returns table (id uuid, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_couple_id uuid;
  new_couple_id uuid;
  code text;
  attempts int := 0;
begin
  select p.couple_id into existing_couple_id from profiles p where p.id = auth.uid();

  if existing_couple_id is not null then
    return query select c.id, c.invite_code from couples c where c.id = existing_couple_id;
    return;
  end if;

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

  update profiles set couple_id = new_couple_id where profiles.id = auth.uid();
  perform seed_default_categories(new_couple_id);

  return query select new_couple_id, code;
end;
$$;

-- Vincula o usuário chamador a um casal existente via código de convite
create function join_couple(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_couple_id uuid;
  caller_couple_id uuid;
begin
  select p.couple_id into caller_couple_id from profiles p where p.id = auth.uid();
  if caller_couple_id is not null then
    raise exception 'Você já está vinculado a um casal';
  end if;

  select c.id into target_couple_id from couples c where c.invite_code = upper(code);
  if target_couple_id is null then
    raise exception 'Código de convite inválido';
  end if;

  update profiles set couple_id = target_couple_id where id = auth.uid();
  return target_couple_id;
end;
$$;

grant execute on function create_couple() to authenticated;
grant execute on function join_couple(text) to authenticated;
