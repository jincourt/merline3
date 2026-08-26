-- Add listing type (objet | service)

alter table public.products
  add column if not exists listing_type text not null default 'objet'
  check (listing_type in ('objet', 'service'));

create index if not exists products_listing_type_idx on public.products (listing_type);
