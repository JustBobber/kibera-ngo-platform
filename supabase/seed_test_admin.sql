-- Creates a confirmed test user and makes it a platform admin. For development only.
-- Useful because Supabase rejects sign-ups with fake domains (like test.com)
-- and the confirmation email can't be received anyway.
--
-- 1. Copy this file (don't commit a password) and replace CHANGE_ME below.
-- 2. npx supabase db query --remote -f <your copy>.sql
--
-- If the user already exists, only the admin role is set (the password is not changed).
-- Delete test users before the platform goes live: Authentication -> Users in the dashboard.

do $$
declare
  _email text := 'admin@test.com';
  _password text := 'CHANGE_ME';
  _name text := 'Test Admin';
  _uid uuid;
begin
  if _password = 'CHANGE_ME' then
    raise exception 'Set a password in a copy of this file before running it';
  end if;

  select id into _uid from auth.users where lower(email) = lower(_email);

  if _uid is null then
    _uid := gen_random_uuid();

    -- Token columns must be '' (not null), otherwise Supabase Auth fails at login.
    -- The on_auth_user_created trigger creates the profiles row.
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', _uid, 'authenticated', 'authenticated', _email,
      extensions.crypt(_password, extensions.gen_salt('bf')), now(),
      '{"provider": "email", "providers": ["email"]}', jsonb_build_object('name', _name), now(), now(),
      '', '', '', ''
    );

    insert into auth.identities (user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (
      _uid, _uid::text, 'email',
      jsonb_build_object('sub', _uid::text, 'email', _email, 'email_verified', true),
      now(), now(), now()
    );
  end if;

  -- Allowed here because there is no logged-in user (see prevent_role_change).
  update public.profiles set role = 'admin' where id = _uid;
end $$;
