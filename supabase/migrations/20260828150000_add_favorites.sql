create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  listing_id uuid not null,
  src text not null check (src in ('prod', 'buy')),
  created_at timestamptz not null default now(),
  unique (user_id, listing_id, src)
);

create index favorites_user_id_idx on public.favorites (user_id, created_at desc);

alter table public.favorites enable row level security;

create policy "Users read own favorites"
  on public.favorites
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own favorites"
  on public.favorites
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users delete own favorites"
  on public.favorites
  for delete
  to authenticated
  using (auth.uid() = user_id);
