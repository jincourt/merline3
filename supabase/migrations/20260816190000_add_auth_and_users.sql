-- Profiles linked to auth.users
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Link listings to users + status
alter table public.products
  add column user_id uuid references auth.users (id) on delete set null,
  add column status text not null default 'active'
    check (status in ('active', 'paused', 'sold', 'closed'));

alter table public.buy_requests
  add column user_id uuid references auth.users (id) on delete set null,
  add column status text not null default 'active'
    check (status in ('active', 'paused', 'found', 'closed'));

create index products_user_id_idx on public.products (user_id);
create index buy_requests_user_id_idx on public.buy_requests (user_id);

-- Products RLS: tighten insert, allow owner management
drop policy if exists "Allow public insert on products" on public.products;

create policy "Authenticated users insert own products"
  on public.products
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own products"
  on public.products
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own products"
  on public.products
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Buy requests RLS
drop policy if exists "Allow public insert on buy_requests" on public.buy_requests;

create policy "Authenticated users insert own buy_requests"
  on public.buy_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own buy_requests"
  on public.buy_requests
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own buy_requests"
  on public.buy_requests
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Messages placeholder for future
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  listing_id uuid,
  listing_type text check (listing_type in ('product', 'buy_request')),
  sender_name text not null,
  body text not null check (char_length(trim(body)) >= 1),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index messages_user_id_idx on public.messages (user_id, created_at desc);

alter table public.messages enable row level security;

create policy "Users read own messages"
  on public.messages
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users update own messages"
  on public.messages
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
