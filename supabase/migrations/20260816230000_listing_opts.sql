-- Revert listing types to objet/service
update public.products
set listing_type = 'service'
where listing_type in ('educ', 'app');

update public.buy_requests
set listing_type = 'service'
where listing_type in ('educ', 'app');

alter table public.products
  drop constraint if exists products_listing_type_check;

alter table public.products
  add constraint products_listing_type_check
  check (listing_type in ('objet', 'service'));

alter table public.buy_requests
  drop constraint if exists buy_requests_listing_type_check;

alter table public.buy_requests
  add constraint buy_requests_listing_type_check
  check (listing_type in ('objet', 'service'));

-- Company + location (short column names)
alter table public.products
  add column if not exists is_co boolean not null default false,
  add column if not exists loc text not null default 'phys'
    check (loc in ('phys', 'online'));

alter table public.buy_requests
  add column if not exists is_co boolean not null default false,
  add column if not exists loc text not null default 'phys'
    check (loc in ('phys', 'online'));
