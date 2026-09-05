-- Group messaging (separate from 1:1 convs)

create table public.msg_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) >= 1),
  description text not null default '',
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index msg_groups_created_by_idx on public.msg_groups (created_by);
create index msg_groups_updated_at_idx on public.msg_groups (updated_at desc);

create table public.msg_group_members (
  group_id uuid not null references public.msg_groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (group_id, user_id)
);

create index msg_group_members_user_id_idx on public.msg_group_members (user_id);

create table public.msg_group_msgs (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.msg_groups (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(trim(body)) >= 1),
  created_at timestamptz not null default now()
);

create index msg_group_msgs_group_id_idx on public.msg_group_msgs (group_id, created_at asc);

alter table public.msg_groups enable row level security;
alter table public.msg_group_members enable row level security;
alter table public.msg_group_msgs enable row level security;

create or replace function public.is_msg_group_member(p_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.msg_group_members
    where group_id = p_group_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_msg_group_creator(p_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.msg_groups
    where id = p_group_id
      and created_by = auth.uid()
  );
$$;

grant execute on function public.is_msg_group_member(uuid) to authenticated;
grant execute on function public.is_msg_group_creator(uuid) to authenticated;

create policy "Members read groups"
  on public.msg_groups
  for select
  to authenticated
  using (
    created_by = auth.uid()
    or public.is_msg_group_member(id)
  );

create policy "Users create groups"
  on public.msg_groups
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Members update groups"
  on public.msg_groups
  for update
  to authenticated
  using (
    created_by = auth.uid()
    or public.is_msg_group_member(id)
  )
  with check (
    created_by = auth.uid()
    or public.is_msg_group_member(id)
  );

create policy "Members read group members"
  on public.msg_group_members
  for select
  to authenticated
  using (public.is_msg_group_member(group_id));

create policy "Creator inserts group members"
  on public.msg_group_members
  for insert
  to authenticated
  with check (public.is_msg_group_creator(group_id));

create policy "Members update own read state"
  on public.msg_group_members
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Members read group msgs"
  on public.msg_group_msgs
  for select
  to authenticated
  using (public.is_msg_group_member(group_id));

create policy "Members insert group msgs"
  on public.msg_group_msgs
  for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_msg_group_member(group_id)
  );
