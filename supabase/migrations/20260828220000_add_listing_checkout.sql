-- Draft listings pending plan selection / payment
alter table public.products
  drop constraint if exists products_status_check;

alter table public.products
  add constraint products_status_check
  check (status in ('draft', 'pending_payment', 'active', 'paused', 'sold', 'closed'));

alter table public.products
  add column if not exists checkout_plan text,
  add column if not exists checkout_boost text;

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists merline_pro_active boolean not null default false;
