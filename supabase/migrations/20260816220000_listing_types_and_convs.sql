-- Extend listing_type values (short db names: educ, app)
alter table public.products
  drop constraint if exists products_listing_type_check;

alter table public.products
  add constraint products_listing_type_check
  check (listing_type in ('objet', 'service', 'educ', 'app'));

alter table public.buy_requests
  drop constraint if exists buy_requests_listing_type_check;

alter table public.buy_requests
  add constraint buy_requests_listing_type_check
  check (listing_type in ('objet', 'service', 'educ', 'app'));

-- Conversations (short table/column names)
create table public.convs (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null,
  src text not null check (src in ('prod', 'buy')),
  owner_id uuid not null references auth.users (id) on delete cascade,
  peer_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (owner_id <> peer_id),
  unique (listing_id, src, peer_id)
);

create index convs_owner_id_idx on public.convs (owner_id, updated_at desc);
create index convs_peer_id_idx on public.convs (peer_id, updated_at desc);

create table public.conv_msgs (
  id uuid primary key default gen_random_uuid(),
  conv_id uuid not null references public.convs (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(trim(body)) >= 1),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index conv_msgs_conv_id_idx on public.conv_msgs (conv_id, created_at asc);

alter table public.convs enable row level security;
alter table public.conv_msgs enable row level security;

create policy "Users read own convs"
  on public.convs
  for select
  to authenticated
  using (auth.uid() = owner_id or auth.uid() = peer_id);

create policy "Users insert convs as peer"
  on public.convs
  for insert
  to authenticated
  with check (auth.uid() = peer_id);

create policy "Users update own convs"
  on public.convs
  for update
  to authenticated
  using (auth.uid() = owner_id or auth.uid() = peer_id)
  with check (auth.uid() = owner_id or auth.uid() = peer_id);

create policy "Users read conv msgs"
  on public.conv_msgs
  for select
  to authenticated
  using (
    exists (
      select 1 from public.convs c
      where c.id = conv_id
        and (c.owner_id = auth.uid() or c.peer_id = auth.uid())
    )
  );

create policy "Users insert conv msgs"
  on public.conv_msgs
  for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.convs c
      where c.id = conv_id
        and (c.owner_id = auth.uid() or c.peer_id = auth.uid())
    )
  );

create policy "Users update conv msgs read"
  on public.conv_msgs
  for update
  to authenticated
  using (
    exists (
      select 1 from public.convs c
      where c.id = conv_id
        and (c.owner_id = auth.uid() or c.peer_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.convs c
      where c.id = conv_id
        and (c.owner_id = auth.uid() or c.peer_id = auth.uid())
    )
  );
