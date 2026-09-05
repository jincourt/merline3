-- Fix infinite recursion in msg_group_members RLS (self-referential policies)

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

drop policy if exists "Members read groups" on public.msg_groups;
drop policy if exists "Members update groups" on public.msg_groups;

create policy "Members read groups"
  on public.msg_groups
  for select
  to authenticated
  using (
    created_by = auth.uid()
    or public.is_msg_group_member(id)
  );

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

drop policy if exists "Members read group members" on public.msg_group_members;
drop policy if exists "Creator inserts group members" on public.msg_group_members;

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

drop policy if exists "Members read group msgs" on public.msg_group_msgs;
drop policy if exists "Members insert group msgs" on public.msg_group_msgs;

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
