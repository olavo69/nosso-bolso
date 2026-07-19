-- Nosso Bolso — schema principal + RLS
-- Tabelas: couples, profiles, categories, goals, transactions, chat_messages

create table couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  couple_id uuid references couples (id) on delete set null,
  name text not null,
  currency text not null default 'BRL',
  plan text not null default 'gratuito',
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  nome text not null,
  tipo text not null check (tipo in ('despesa', 'receita', 'investimento')),
  hue integer not null,
  budget numeric(12, 2),
  created_at timestamptz not null default now(),
  unique (couple_id, nome, tipo)
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  nome text not null,
  current_amount numeric(12, 2) not null default 0,
  target numeric(12, 2) not null,
  prazo text not null,
  hue integer not null,
  created_at timestamptz not null default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  pessoa_id uuid references profiles (id) on delete set null,
  type text not null check (type in ('receita', 'despesa', 'investimento')),
  amount numeric(12, 2) not null,
  data date not null,
  categoria text not null,
  descricao text not null,
  status text,
  recorrente boolean not null default false,
  parcela_atual integer,
  parcela_total integer,
  created_at timestamptz not null default now()
);

create index transactions_couple_id_idx on transactions (couple_id);
create index transactions_couple_id_data_idx on transactions (couple_id, data);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  profile_id uuid references profiles (id) on delete set null,
  from_role text not null check (from_role in ('user', 'bot')),
  text text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_couple_id_idx on chat_messages (couple_id, created_at);

-- RLS

alter table couples enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table goals enable row level security;
alter table transactions enable row level security;
alter table chat_messages enable row level security;

-- Função auxiliar (security definer) para evitar recursão de RLS em profiles
create function my_couple_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select couple_id from profiles where id = auth.uid()
$$;

-- profiles: cada um vê o próprio perfil e o do parceiro vinculado
create policy "profiles_select_self_or_partner" on profiles
  for select using (id = auth.uid() or couple_id = my_couple_id());

create policy "profiles_update_self" on profiles
  for update using (id = auth.uid());

create policy "profiles_insert_self" on profiles
  for insert with check (id = auth.uid());

-- couples: só membros enxergam o próprio casal
create policy "couples_select_member" on couples
  for select using (id = my_couple_id());

-- categories / goals / transactions / chat_messages: escopo por couple_id
create policy "categories_select" on categories
  for select using (couple_id = my_couple_id());
create policy "categories_insert" on categories
  for insert with check (couple_id = my_couple_id());
create policy "categories_update" on categories
  for update using (couple_id = my_couple_id());
create policy "categories_delete" on categories
  for delete using (couple_id = my_couple_id());

create policy "goals_select" on goals
  for select using (couple_id = my_couple_id());
create policy "goals_insert" on goals
  for insert with check (couple_id = my_couple_id());
create policy "goals_update" on goals
  for update using (couple_id = my_couple_id());
create policy "goals_delete" on goals
  for delete using (couple_id = my_couple_id());

create policy "transactions_select" on transactions
  for select using (couple_id = my_couple_id());
create policy "transactions_insert" on transactions
  for insert with check (couple_id = my_couple_id());
create policy "transactions_update" on transactions
  for update using (couple_id = my_couple_id());
create policy "transactions_delete" on transactions
  for delete using (couple_id = my_couple_id());

create policy "chat_messages_select" on chat_messages
  for select using (couple_id = my_couple_id());
create policy "chat_messages_insert" on chat_messages
  for insert with check (couple_id = my_couple_id());
