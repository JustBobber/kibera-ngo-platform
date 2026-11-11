
-- Kibera NGO platform: Supabase schema (MVP)
-- Run in Supabase -> SQL Editor
--
-- Roles:
--   profiles.role = 'admin'        platform admin (creates NGOs, promotes other admins)
--   profiles.role = 'user'         everyone else
--   ngo_members.role = 'ngo_admin' manages an NGO: members, projects, profile
--   ngo_members.role = 'member'    can edit NGO profile, projects and events (cannot
--                                  create projects or manage members)

-- ENUMS ---------------------------------------------------------------
create type user_role as enum ('admin', 'user');
create type ngo_member_role as enum ('ngo_admin', 'member');
create type project_status as enum ('in_planning', 'running', 'done', 'canceled');
create type project_category as enum (
  'infrastructure_engineering',
  'health_relief_welfare',
  'education_kids_youth',
  'economic_development_empowerment',
  'human_rights_data'
);

-- TABLES --------------------------------------------------------------
-- Email and password live in auth.users (Supabase Auth)
create table profiles (
                          id uuid primary key references auth.users(id) on delete cascade,
                          name text not null default '',
                          role user_role not null default 'user',
                          created_at timestamptz not null default now()
);

create table ngos (
                      id uuid primary key default gen_random_uuid(),
                      name text not null,
                      description text,
                      contact_email text,
                      contact_phone text,
                      website text,
                      created_at timestamptz not null default now()
);

create table ngo_members (
                             ngo_id uuid not null references ngos(id) on delete cascade,
                             user_id uuid not null references profiles(id) on delete cascade,
                             role ngo_member_role not null default 'member',
                             primary key (ngo_id, user_id)
);

create table projects (
                          id uuid primary key default gen_random_uuid(),
                          name text not null,
                          description text,
                          start_date date,
                          end_date date,
                          status project_status not null default 'in_planning',
                          category project_category not null,
                          latitude double precision,
                          longitude double precision,
                          created_at timestamptz not null default now(),
                          check (end_date is null or start_date is null or end_date >= start_date),
                          check ((latitude is null) = (longitude is null))
);

create table project_ngos (
                              project_id uuid not null references projects(id) on delete cascade,
                              ngo_id uuid not null references ngos(id) on delete cascade,
                              is_lead boolean not null default false,
                              primary key (project_id, ngo_id)
);
-- At most one lead NGO per project
create unique index one_lead_per_project on project_ngos(project_id) where is_lead;

create table events (
                        id uuid primary key default gen_random_uuid(),
                        project_id uuid not null references projects(id) on delete cascade,
                        name text not null,
                        description text,
                        date timestamptz not null,
                        location text,
                        created_at timestamptz not null default now()
);

-- A logged-in user "likes" a project to show interest
create table project_interests (
                                   project_id uuid not null references projects(id) on delete cascade,
                                   user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
                                   created_at timestamptz not null default now(),
                                   primary key (project_id, user_id)
);

create index on projects(status);
create index on projects(category);
create index on events(project_id, date);
create index on project_ngos(ngo_id);
create index on ngo_members(user_id);
create index on project_interests(user_id);

-- HELPER FUNCTIONS ----------------------------------------------------
create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function is_ngo_member(_ngo_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
select exists (select 1 from ngo_members where ngo_id = _ngo_id and user_id = auth.uid());
$$;

create or replace function is_ngo_admin(_ngo_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
select exists (select 1 from ngo_members
               where ngo_id = _ngo_id and user_id = auth.uid() and role = 'ngo_admin');
$$;

-- Member (any role) of an NGO that is part of the project
create or replace function is_project_member(_project_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
select exists (
    select 1 from project_ngos pn
                      join ngo_members nm on nm.ngo_id = pn.ngo_id
    where pn.project_id = _project_id and nm.user_id = auth.uid()
);
$$;

-- ngo_admin of an NGO that is part of the project
create or replace function is_project_admin(_project_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
select exists (
    select 1 from project_ngos pn
                      join ngo_members nm on nm.ngo_id = pn.ngo_id
    where pn.project_id = _project_id and nm.user_id = auth.uid() and nm.role = 'ngo_admin'
);
$$;

-- Can the current user see this profile?
-- (own profile, admins, NGO colleagues, and users interested in the viewer's projects)
create or replace function can_view_profile(_user_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
select _user_id = auth.uid()
           or is_admin()
           or exists (
        select 1 from project_interests pi
        where pi.user_id = _user_id and is_project_member(pi.project_id)
    )
           or exists (
        select 1 from ngo_members a join ngo_members b on a.ngo_id = b.ngo_id
        where a.user_id = _user_id and b.user_id = auth.uid()
    );
$$;

-- Create a profile automatically on signup
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
insert into profiles (id, name)
values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function handle_new_user();

-- Only admins can change a role. Changes made from the SQL editor
-- (no logged-in user) are allowed, so you can create the first admin.
create or replace function prevent_role_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not is_admin() then
    new.role := old.role;
end if;
return new;
end;
$$;

create trigger profiles_protect_role
    before update on profiles
    for each row execute function prevent_role_change();

-- RPC FUNCTIONS (called from the frontend) ------------------------------

-- Create a project for an NGO. Only ngo_admins of that NGO (or platform admins).
-- Usage: supabase.rpc('create_project', { _ngo_id, _name, _category, ... })
create or replace function create_project(
  _ngo_id uuid,
  _name text,
  _category project_category,
  _description text default null,
  _status project_status default 'in_planning',
  _start_date date default null,
  _end_date date default null,
  _latitude double precision default null,
  _longitude double precision default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
new_id uuid;
begin
  if not (is_ngo_admin(_ngo_id) or is_admin()) then
    raise exception 'Only an NGO admin can create projects for this NGO';
end if;

insert into projects (name, description, category, status, start_date, end_date, latitude, longitude)
values (_name, _description, _category, _status, _start_date, _end_date, _latitude, _longitude)
    returning id into new_id;

insert into project_ngos (project_id, ngo_id, is_lead)
values (new_id, _ngo_id, true);

return new_id;
end;
$$;

-- Add a user (who already has an account) to an NGO by email.
-- Returns true if added/updated, false if no user has that email.
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

select id into target_id from auth.users where lower(email) = lower(trim(_email));
if target_id is null then
    return false;
end if;

insert into ngo_members (ngo_id, user_id, role)
values (_ngo_id, target_id, _role)
    on conflict (ngo_id, user_id) do update set role = excluded.role;

return true;
end;
$$;

-- ROW LEVEL SECURITY --------------------------------------------------
alter table profiles          enable row level security;
alter table ngos              enable row level security;
alter table ngo_members       enable row level security;
alter table projects          enable row level security;
alter table project_ngos      enable row level security;
alter table events            enable row level security;
alter table project_interests enable row level security;

-- profiles: users edit their own; admins can edit anyone (e.g. promote to admin)
create policy "profiles_select" on profiles for select using (can_view_profile(id));
create policy "profiles_update_own" on profiles for update
                                                        using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_update_admin" on profiles for update
                                                          using (is_admin()) with check (is_admin());

-- ngos: publicly readable; created and deleted by platform admins only
create policy "ngos_select_all" on ngos for select using (true);
create policy "ngos_insert_admin" on ngos for insert to authenticated
  with check (is_admin());
create policy "ngos_update_member" on ngos for update
                                                          using (is_ngo_member(id) or is_admin());
create policy "ngos_delete_admin" on ngos for delete
using (is_admin());

-- ngo_members: platform admins and ngo_admins manage members
-- (ngo_admins normally use add_ngo_member(); members can also leave on their own)
create policy "ngo_members_select" on ngo_members for select
                                                          using (user_id = auth.uid() or is_ngo_member(ngo_id) or is_admin());
create policy "ngo_members_insert" on ngo_members for insert to authenticated
  with check (is_admin() or is_ngo_admin(ngo_id));
create policy "ngo_members_update" on ngo_members for update
                                                                 using (is_admin() or is_ngo_admin(ngo_id));
create policy "ngo_members_delete" on ngo_members for delete
using (user_id = auth.uid() or is_admin() or is_ngo_admin(ngo_id));

-- projects: publicly readable; created via create_project() only
create policy "projects_select_all" on projects for select using (true);
create policy "projects_update" on projects for update
                                                    using (is_project_member(id) or is_admin());
create policy "projects_delete" on projects for delete
using (is_project_admin(id) or is_admin());

-- project_ngos: project admins add/remove partner NGOs
create policy "project_ngos_select_all" on project_ngos for select using (true);
create policy "project_ngos_insert" on project_ngos for insert to authenticated
  with check ((is_project_admin(project_id) and is_lead = false) or is_admin());
create policy "project_ngos_update" on project_ngos for update
                                                                   using (is_project_admin(project_id) or is_admin());
create policy "project_ngos_delete" on project_ngos for delete
using (is_project_admin(project_id) or is_admin());

-- events: publicly readable; edited by members of the project's NGOs
create policy "events_select_all" on events for select using (true);
create policy "events_write" on events for all
  using (is_project_member(project_id) or is_admin())
  with check (is_project_member(project_id) or is_admin());

-- project_interests: logged-in users like/unlike; project NGOs can see who is interested
create policy "interests_select" on project_interests for select
                                                                     using (user_id = auth.uid() or is_project_member(project_id) or is_admin());
create policy "interests_insert_own" on project_interests for insert to authenticated
  with check (user_id = auth.uid());
create policy "interests_delete_own" on project_interests for delete
using (user_id = auth.uid() or is_admin());