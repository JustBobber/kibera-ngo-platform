# Kibera NGO Platform

Open-source MVP: a website where NGOs in Kibera (Nairobi) can see each other's ongoing projects and collaborate, and where locals can browse projects and show interest. The project will be taken over by other developers, so keep everything simple, readable and lightweight. Users may have slow mobile connections: mobile-first, minimal dependencies.

## Stack
- TypeScript, React (Vite), Tailwind + shadcn/ui
- Supabase (`@supabase/supabase-js`) for database and auth
- React Router, TanStack Query, react-hook-form + zod
- react-leaflet + OpenStreetMap for maps (no API key)
- No Vercel-specific features: the app must be a static site deployable anywhere.
- All UI text, code and comments are in English.
- Ask before adding any dependency not listed here.

## Supabase
- Env vars live in `.env` (gitignored): `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Keep `.env.example` up to date with empty values.
- One shared typed client in `src/lib/supabase.ts`.
- Only the anon/publishable key is used in the frontend. Never use, ask for or commit the `service_role`/secret key.
- The schema lives in `supabase/migrations/`. Read it before touching data code.
- Never edit a migration that has already been pushed. Add a new one: `npx supabase migration new <name>`, then apply with `npx supabase db push --remote`.
- The CLI targets the local database by default, so use `--remote` to hit the hosted project.
- After every migration, regenerate types into `src/types/database.ts` (check `npx supabase gen types --help` for current flags).
- Do not change the database through the dashboard Table Editor; use migrations.
- Auth: Supabase Auth, email + password. A `profiles` row is created automatically on signup by a trigger.

## Data model
`profiles`, `ngos`, `ngo_members`, `projects`, `project_ngos` (`is_lead` marks the lead NGO), `events`, `project_interests` (a "like": project_id + user_id).
Enums: `project_status` (in_planning, running, done, canceled), `project_category` (5 values), `user_role` (admin, user), `ngo_member_role` (ngo_admin, member).
"Active" projects are `in_planning` and `running`.

## Roles and permissions
Enforced by RLS in the database; the UI should mirror them.
- Everyone, no login: browse all projects, NGOs and events.
- Logged-in user: like/unlike projects.
- `member`: edit their NGO's profile, projects and events.
- `ngo_admin`: everything a member can, plus create projects and add members.
- `admin` (platform): creates NGOs, assigns ngo_admins, promotes other admins.
- Create projects ONLY via `supabase.rpc('create_project', {...})`. Direct inserts are blocked.
- Add NGO members ONLY via `supabase.rpc('add_ngo_member', { _ngo_id, _email, _role })`. It returns `false` if no user has that email.

## MVP scope
Pages: projects overview (filters + map), project detail, NGO list/detail, login/signup, NGO dashboard, platform admin page.
Out of scope for now: notifications, messaging, verification flows.

## Design
Design templates are in `design/`. Follow them for layout and style.

## Working style
- Prefer small, readable components over clever abstractions.
- Keep the README setup section current (env vars, running locally, migrations).
- Keep extra work to a minimum; this is an MVP.