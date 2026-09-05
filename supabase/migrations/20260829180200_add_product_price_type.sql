-- Sale price kind: fixed, average (with % commission), or hourly (services)

alter table public.products
  add column if not exists price_type text
  check (price_type is null or price_type in ('fixed', 'average', 'hourly'));

comment on column public.products.price_type is 'How the listing price should be interpreted: fixed, average, or hourly rate';
