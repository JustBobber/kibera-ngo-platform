-- Demo data for development and testing. NOT for production.
--
-- Run against the linked (hosted) project:
--   npx supabase db query --remote -f supabase/seed.sql
-- Remove it again:
--   npx supabase db query --remote -f supabase/seed_remove.sql
--
-- Safe to run more than once: all rows use fixed ids starting with 5eed0000-
-- and existing rows are left unchanged. Event dates are relative to today,
-- so there are always upcoming events. Some items have no coordinates on
-- purpose (they should not appear on the map).
-- No users are created: sign up in the app, then see the bottom of this file.

-- NGOS ------------------------------------------------------------------
insert into ngos (id, name, description, contact_email, contact_phone, website, latitude, longitude) values
  ('5eed0000-0000-4000-8000-000000000001', 'Demo Clean Water Group',
   'Demo data. Builds and maintains water points and sanitation blocks in Kibera.',
   'water@example.org', '+254 700 000 001', 'https://example.org/water', -1.3135, 36.7830),
  ('5eed0000-0000-4000-8000-000000000002', 'Demo Community Health Network',
   'Demo data. Community health workers running clinics and health days.',
   'health@example.org', '+254 700 000 002', null, -1.3105, 36.7770),
  ('5eed0000-0000-4000-8000-000000000003', 'Demo Youth Learning Centre',
   'Demo data. After-school tutoring, libraries and sports for kids and youth.',
   'youth@example.org', null, 'https://example.org/youth', -1.3150, 36.7895),
  ('5eed0000-0000-4000-8000-000000000004', 'Demo Women''s Savings Group',
   'Demo data. Savings groups, small business training and micro-loans.',
   null, '+254 700 000 004', null, null, null),
  ('5eed0000-0000-4000-8000-000000000005', 'Demo Open Data Mappers',
   'Demo data. Maps the community with OpenStreetMap and runs rights workshops.',
   'maps@example.org', null, 'https://example.org/maps', -1.3170, 36.7960)
on conflict (id) do nothing;

-- PROJECTS --------------------------------------------------------------
insert into projects (id, name, description, start_date, end_date, status, category, latitude, longitude) values
  ('5eed0000-0000-4000-8000-000000000101', 'Water kiosks in Gatwekera',
   'Demo data. Three new water kiosks with fair prices, run by local committees.',
   current_date - 60, current_date + 120, 'running', 'infrastructure_engineering', -1.3128, 36.7822),
  ('5eed0000-0000-4000-8000-000000000102', 'Drainage clean-up along the river',
   'Demo data. Clearing drainage channels before the rainy season.',
   current_date + 14, current_date + 45, 'in_planning', 'infrastructure_engineering', null, null),
  ('5eed0000-0000-4000-8000-000000000103', 'Mobile health days',
   'Demo data. Monthly free check-ups, vaccinations and nutrition advice.',
   current_date - 200, null, 'running', 'health_relief_welfare', -1.3112, 36.7785),
  ('5eed0000-0000-4000-8000-000000000104', 'Homework club and library',
   'Demo data. A quiet place to study after school, with volunteer tutors.',
   current_date - 30, current_date + 300, 'running', 'education_kids_youth', -1.3152, 36.7890),
  ('5eed0000-0000-4000-8000-000000000105', 'Youth football league',
   'Demo data. Weekend league for under-16 teams from all villages.',
   current_date + 30, current_date + 150, 'in_planning', 'education_kids_youth', -1.3140, 36.7905),
  ('5eed0000-0000-4000-8000-000000000106', 'Tailoring and business skills',
   'Demo data. Six-week course in tailoring, bookkeeping and selling.',
   current_date - 10, current_date + 32, 'running', 'economic_development_empowerment', null, null),
  ('5eed0000-0000-4000-8000-000000000107', 'Community map of Kibera',
   'Demo data. Mapping schools, clinics, water points and toilets on OpenStreetMap.',
   current_date - 400, current_date - 20, 'done', 'human_rights_data', -1.3165, 36.7950),
  ('5eed0000-0000-4000-8000-000000000108', 'Know your rights workshops',
   'Demo data. Workshops on tenant rights and access to public services.',
   current_date + 7, current_date + 90, 'in_planning', 'human_rights_data', -1.3160, 36.7920),
  ('5eed0000-0000-4000-8000-000000000109', 'Solar street lights',
   'Demo data. Canceled because of a funding gap.',
   null, null, 'canceled', 'infrastructure_engineering', null, null)
on conflict (id) do nothing;

-- LEAD AND PARTNER NGOS -------------------------------------------------
insert into project_ngos (project_id, ngo_id, is_lead) values
  ('5eed0000-0000-4000-8000-000000000101', '5eed0000-0000-4000-8000-000000000001', true),
  ('5eed0000-0000-4000-8000-000000000101', '5eed0000-0000-4000-8000-000000000005', false),
  ('5eed0000-0000-4000-8000-000000000102', '5eed0000-0000-4000-8000-000000000001', true),
  ('5eed0000-0000-4000-8000-000000000103', '5eed0000-0000-4000-8000-000000000002', true),
  ('5eed0000-0000-4000-8000-000000000103', '5eed0000-0000-4000-8000-000000000004', false),
  ('5eed0000-0000-4000-8000-000000000104', '5eed0000-0000-4000-8000-000000000003', true),
  ('5eed0000-0000-4000-8000-000000000105', '5eed0000-0000-4000-8000-000000000003', true),
  ('5eed0000-0000-4000-8000-000000000105', '5eed0000-0000-4000-8000-000000000002', false),
  ('5eed0000-0000-4000-8000-000000000106', '5eed0000-0000-4000-8000-000000000004', true),
  ('5eed0000-0000-4000-8000-000000000107', '5eed0000-0000-4000-8000-000000000005', true),
  ('5eed0000-0000-4000-8000-000000000108', '5eed0000-0000-4000-8000-000000000005', true),
  ('5eed0000-0000-4000-8000-000000000108', '5eed0000-0000-4000-8000-000000000004', false),
  ('5eed0000-0000-4000-8000-000000000109', '5eed0000-0000-4000-8000-000000000001', true)
on conflict (project_id, ngo_id) do nothing;

-- EVENTS ----------------------------------------------------------------
-- Times are in UTC; Nairobi is UTC+3 (so 07:00 UTC is 10:00 in Nairobi).
insert into events (id, project_id, name, description, date, location, latitude, longitude) values
  ('5eed0000-0000-4000-8000-000000000201', '5eed0000-0000-4000-8000-000000000101',
   'Water kiosk opening', 'Demo data. Opening of the first kiosk. Everyone welcome.',
   date_trunc('day', now()) + interval '3 days 7 hours', 'Gatwekera, next to the chief''s camp', -1.3130, 36.7825),
  ('5eed0000-0000-4000-8000-000000000202', '5eed0000-0000-4000-8000-000000000103',
   'Health day: vaccinations', 'Demo data. Free vaccinations for children under 5.',
   date_trunc('day', now()) + interval '5 days 6 hours', 'Kianda community hall', -1.3108, 36.7772),
  ('5eed0000-0000-4000-8000-000000000203', '5eed0000-0000-4000-8000-000000000103',
   'Health day: nutrition', 'Demo data. Nutrition advice and weighing of babies.',
   date_trunc('day', now()) + interval '35 days 6 hours', 'Kianda community hall', null, null),
  ('5eed0000-0000-4000-8000-000000000204', '5eed0000-0000-4000-8000-000000000104',
   'Library open day', 'Demo data. Come and see the new library. Free books for kids.',
   date_trunc('day', now()) + interval '5 days 12 hours', 'Laini Saba', -1.3150, 36.7893),
  ('5eed0000-0000-4000-8000-000000000205', '5eed0000-0000-4000-8000-000000000105',
   'Football team registration', 'Demo data. Register your under-16 team.',
   date_trunc('day', now()) + interval '10 days 13 hours', 'Olympic grounds', -1.3115, 36.7790),
  ('5eed0000-0000-4000-8000-000000000206', '5eed0000-0000-4000-8000-000000000106',
   'Tailoring class graduation', 'Demo data. Graduation and small market for the course participants.',
   date_trunc('day', now()) + interval '32 days 11 hours', 'Makina market', null, null),
  ('5eed0000-0000-4000-8000-000000000207', '5eed0000-0000-4000-8000-000000000108',
   'Workshop: tenant rights', 'Demo data. What a landlord can and cannot do.',
   date_trunc('day', now()) + interval '8 days 14 hours', 'Silanga social hall', -1.3160, 36.7920),
  ('5eed0000-0000-4000-8000-000000000208', '5eed0000-0000-4000-8000-000000000107',
   'Map presentation', 'Demo data. A past event: presenting the finished map.',
   date_trunc('day', now()) - interval '25 days' + interval '12 hours', 'Soweto East', -1.3170, 36.7960)
on conflict (id) do nothing;

-- OPTIONAL: MAKE YOURSELF A MEMBER OF A DEMO NGO ------------------------
-- Sign up in the app and confirm your email first, then uncomment, set your
-- email and run this file again (or run just this statement in the SQL Editor).
--
-- insert into ngo_members (ngo_id, user_id, role)
-- select '5eed0000-0000-4000-8000-000000000001', id, 'ngo_admin'
-- from auth.users where email = 'you@example.com'
-- on conflict (ngo_id, user_id) do update set role = excluded.role;
