-- Kibera NGO platform: coordinates on NGOs and events, anonymous interest,
-- lead-only partner management, and platform-admin-only ngo_admin assignment.

-- 1. COORDINATES ON NGOS AND EVENTS -------------------------------------
alter table ngos
  add column latitude double precision,
  add column longitude double precision,
  add constraint ngos_coordinates_both_or_none check ((latitude is null) = (longitude is null));

alter table events
  add column latitude double precision,
  add column longitude double precision,
  add constraint events_coordinates_both_or_none check ((latitude is null) = (longitude is null));

-- 2. ANONYMOUS INTEREST -------------------------------------------------
-- Users only see their own interest rows. Nobody can see who is interested.
drop policy "interests_select" on project_interests;
create policy "interests_select_own" on project_interests for select
  using (user_id = auth.uid());

-- Same as before, minus "users interested in the viewer's projects".
create or replace function can_view_profile(_user_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select _user_id = auth.uid()
    or is_admin()
    or exists (
      select 1 from ngo_members a join ngo_members b on a.ngo_id = b.ngo_id
      where a.user_id = _user_id and b.user_id = auth.uid()
    );
$$;

-- 3. PUBLIC INTEREST COUNTS ---------------------------------------------
-- Returns only counts, never user ids. Projects without interest are not listed.
-- Usage: supabase.rpc('get_interest_counts')
create or replace function get_interest_counts()
returns table (project_id uuid, interest_count bigint)
language sql security definer stable set search_path = public as $$
  select project_id, count(*) from project_interests group by project_id;
$$;

grant execute on function get_interest_counts() to anon, authenticated;

-- 4. ONLY THE LEAD NGO'S ADMINS MANAGE PARTNERS AND DELETE PROJECTS ------
-- (All NGOs on a project can still edit the project and its events.)
create or replace function is_lead_admin(_project_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from project_ngos pn
    join ngo_members nm on nm.ngo_id = pn.ngo_id
    where pn.project_id = _project_id and pn.is_lead
      and nm.user_id = auth.uid() and nm.role = 'ngo_admin'
  );
$$;

drop policy "projects_delete" on projects;
create policy "projects_delete" on projects for delete
  using (is_lead_admin(id) or is_admin());

drop policy "project_ngos_insert" on project_ngos;
drop policy "project_ngos_update" on project_ngos;
drop policy "project_ngos_delete" on project_ngos;

create policy "project_ngos_insert" on project_ngos for insert to authenticated
  with check ((is_lead_admin(project_id) and is_lead = false) or is_admin());
create policy "project_ngos_update" on project_ngos for update
  using (is_admin()) with check (is_admin());
create policy "project_ngos_delete" on project_ngos for delete
  using ((is_lead_admin(project_id) and is_lead = false) or is_admin());

-- 5. ONLY PLATFORM ADMINS ASSIGN NGO_ADMINS -----------------------------
-- ngo_admins can add and remove plain members; roles are changed by platform admins.
drop policy "ngo_members_insert" on ngo_members;
drop policy "ngo_members_update" on ngo_members;
drop policy "ngo_members_delete" on ngo_members;

create policy "ngo_members_insert" on ngo_members for insert to authenticated
  with check (is_admin() or (is_ngo_admin(ngo_id) and role = 'member'));
create policy "ngo_members_update" on ngo_members for update
  using (is_admin()) with check (is_admin());
create policy "ngo_members_delete" on ngo_members for delete
  using (user_id = auth.uid() or is_admin() or (is_ngo_admin(ngo_id) and role = 'member'));

-- Returns true if added (or already a member), false if no user has that email.
-- Usage: supabase.rpc('add_ngo_member', { _ngo_id, _email, _role })
create or replace function add_ngo_member(
  _ngo_id uuid,
  _email text,
  _role ngo_member_role default 'member'
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  target_id uuid;
begin
  if not (is_ngo_admin(_ngo_id) or is_admin()) then
    raise exception 'Only an NGO admin can add members';
  end if;
  if _role = 'ngo_admin' and not is_admin() then
    raise exception 'Only platform admins can assign NGO admins';
  end if;

  select id into target_id from auth.users where lower(email) = lower(trim(_email));
  if target_id is null then
    return false;
  end if;

  if is_admin() then
    insert into ngo_members (ngo_id, user_id, role)
    values (_ngo_id, target_id, _role)
    on conflict (ngo_id, user_id) do update set role = excluded.role;
  else
    -- ngo_admins cannot change the role of an existing member
    insert into ngo_members (ngo_id, user_id, role)
    values (_ngo_id, target_id, _role)
    on conflict (ngo_id, user_id) do nothing;
  end if;

  return true;
end;
$$;

-- 6. SET A USER'S PLATFORM ROLE BY EMAIL (platform admins only) ----------
-- Returns true if updated, false if no user has that email.
-- Usage: supabase.rpc('set_user_role', { _email, _role })
create or replace function set_user_role(_email text, _role user_role) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  target_id uuid;
begin
  if not is_admin() then
    raise exception 'Only platform admins can change roles';
  end if;

  select id into target_id from auth.users where lower(email) = lower(trim(_email));
  if target_id is null then
    return false;
  end if;

  update profiles set role = _role where id = target_id;
  return true;
end;
$$;
