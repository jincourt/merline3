create table public.email_otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index email_otp_codes_email_idx on public.email_otp_codes (email, expires_at desc);

alter table public.email_otp_codes enable row level security;
