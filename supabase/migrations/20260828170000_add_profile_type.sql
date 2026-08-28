-- Profile type: annonceur (seller) or agent (broker)
alter table public.profiles
  add column profile_type text
  check (profile_type is null or profile_type in ('annonceur', 'agent'));

create index profiles_profile_type_idx
  on public.profiles (profile_type)
  where profile_type is not null;

-- Allow public read of community profiles (username, location, type)
create policy "Public can read community profiles"
  on public.profiles
  for select
  to anon, authenticated
  using (
    profile_type is not null
    and username is not null
    and trim(username) <> ''
  );
