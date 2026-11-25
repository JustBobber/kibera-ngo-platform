-- Removes the demo data from supabase/seed.sql (all ids starting with 5eed0000-).
--   npx supabase db query --remote -f supabase/seed_remove.sql
-- Deleting projects also deletes their events, NGO links and interests;
-- deleting NGOs also deletes their memberships (foreign keys cascade).
delete from projects where id::text like '5eed0000-%';
delete from ngos where id::text like '5eed0000-%';
