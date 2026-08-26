-- Buy requests: users describe what they want to purchase

create table public.buy_requests (
  id uuid primary key default gen_random_uuid(),
  listing_type text not null default 'objet'
    check (listing_type in ('objet', 'service')),
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

create index buy_requests_created_at_idx on public.buy_requests (created_at desc);
create index buy_requests_listing_type_idx on public.buy_requests (listing_type);

alter table public.buy_requests enable row level security;

create policy "Allow public insert on buy_requests"
  on public.buy_requests
  for insert
  to anon, authenticated
  with check (true);
