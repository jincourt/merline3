-- Activate Merline Pro for francis216 (test / dev account)
update public.profiles
set
  merline_pro_active = true,
  merline_pro_started_at = timezone('utc', now()),
  merline_pro_expires_at = timezone('utc', now()) + interval '1 month',
  merline_pro_auto_renew = true
where lower(trim(username)) = 'francis216';
