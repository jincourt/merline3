alter table public.msg_groups
  add column if not exists image_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'group-images',
  'group-images',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

drop policy if exists "Public read group images" on storage.objects;
create policy "Public read group images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'group-images');

drop policy if exists "Users upload group images" on storage.objects;
create policy "Users upload group images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'group-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update group images" on storage.objects;
create policy "Users update group images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'group-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'group-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete group images" on storage.objects;
create policy "Users delete group images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'group-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
