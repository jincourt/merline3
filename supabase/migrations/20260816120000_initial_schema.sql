-- Merline: contact requests + product listings

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  phone text not null check (char_length(trim(phone)) >= 8),
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null check (char_length(trim(title)) >= 2),
  description text not null check (char_length(trim(description)) >= 10),
  price numeric(10, 2) check (price is null or price >= 0),
  is_free boolean not null default false,
  address text not null,
  shipping_available boolean not null default false,
  contact_name text not null,
  email text,
  phone text,
  show_phone boolean not null default false,
  photos text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index products_created_at_idx on public.products (created_at desc);
create index products_category_idx on public.products (category);
create index contact_requests_created_at_idx on public.contact_requests (created_at desc);

alter table public.contact_requests enable row level security;
alter table public.products enable row level security;

create policy "Allow public insert on contact_requests"
  on public.contact_requests
  for insert
  to anon, authenticated
  with check (true);

create policy "Allow public read on products"
  on public.products
  for select
  to anon, authenticated
  using (true);

create policy "Allow public insert on products"
  on public.products
  for insert
  to anon, authenticated
  with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-photos',
  'product-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Allow public upload to product-photos"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'product-photos');

create policy "Allow public read from product-photos"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-photos');
