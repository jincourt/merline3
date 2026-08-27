drop index if exists public.profiles_full_name_unique_idx;

alter table public.profiles
  rename column full_name to username;

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(trim(username)))
  where username is not null and trim(username) <> '';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    )
  );
  return new;
end;
$$;
