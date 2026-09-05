-- Merline Pro subscription period and renewal preference
alter table public.profiles
  add column if not exists merline_pro_started_at timestamptz,
  add column if not exists merline_pro_expires_at timestamptz,
  add column if not exists merline_pro_auto_renew boolean not null default true;

comment on column public.profiles.merline_pro_started_at is 'Start of the current Merline Pro billing period';
comment on column public.profiles.merline_pro_expires_at is 'End of the current Merline Pro billing period';
comment on column public.profiles.merline_pro_auto_renew is 'Whether the subscription renews automatically at period end';
