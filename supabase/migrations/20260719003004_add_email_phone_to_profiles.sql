-- Adiciona email/phone em profiles (hoje só existiam em auth.users)
alter table profiles add column email text;
alter table profiles add column phone text;

-- Backfill das contas já existentes
update profiles
set
  email = auth.users.email,
  phone = nullif(auth.users.phone, '')
from auth.users
where profiles.id = auth.users.id;

-- Trigger de signup passa a copiar email também
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    nullif(new.phone, '')
  );
  return new;
end;
$$;
