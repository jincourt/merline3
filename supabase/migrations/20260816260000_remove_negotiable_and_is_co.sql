-- Remove negotiable commission and is_co from listings

update public.products
set
  commission_type = 'chf',
  commission_value = coalesce(commission_value, 0)
where commission_type = 'negotiable';

alter table public.products
  drop constraint if exists products_commission_value_required_check;

alter table public.products
  drop constraint if exists products_commission_type_check;

alter table public.products
  add constraint products_commission_type_check
  check (commission_type in ('chf', 'percent'));

alter table public.products
  alter column commission_value set not null;

alter table public.products
  add constraint products_commission_value_required_check
  check (commission_value is not null);

alter table public.products
  drop column if exists is_co;

alter table public.buy_requests
  drop column if exists is_co;
