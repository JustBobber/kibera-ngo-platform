# Kibera NGO Platform

Open-source MVP: a website where NGOs in Kibera (Nairobi) can see each other's ongoing projects and collaborate, and where locals can browse projects and show interest. The project will be taken over by other developers, so keep everything simple, readable and lightweight. Users may have slow mobile connections: mobile-first, minimal dependencies.

## Stack
- TypeScript, React (Vite), Tailwind + shadcn/ui
- Tooling from the Vite `react-ts` template: Vite, `@vitejs/plugin-react`, TypeScript, oxlint (`npm run lint`), `@types/*`. Plus `@tailwindcss/vite` and Vitest (`npm test`, unit tests as `*.test.ts` next to the code).
- Supabase (`@supabase/supabase-js`) for database and auth
- React Router (`react-router`), TanStack Query, react-hook-form + zod (+ `@hookform/resolvers`)
- react-leaflet + OpenStreetMap for maps (no API key)
- No Vercel-specific features: the app must be a static site deployable anywhere.
- All UI text, code and comments are in English.
- Ask before adding any dependency not listed here. Exception: shadcn/ui components and the packages the shadcn CLI installs with them (Base UI/Radix primitives, `react-day-picker`, `date-fns`, `lucide-react`, `clsx`, `tailwind-merge`, etc.) are allowed.

## Supabase
- Env vars live in `.env` (gitignored): `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Keep `.env.example` up to date with empty values.
- One shared typed client in `src/lib/supabase.ts`.
- Only the anon/publishable key is used in the frontend. Never use, ask for or commit the `service_role`/secret key.
- The schema lives in `supabase/migrations/`. Read it before touching data code. If this file and the migrations disagree, the migrations are the truth: point out the mismatch instead of guessing.
- The local project must be linked once: `npx supabase link --project-ref <ref>`.
- Never edit a migration that has already been pushed. Add a new one with `npx supabase migration new <name>`, then apply it to the hosted project with `npx supabase db push --remote`. The CLI (v3) targets a local database by default; `--remote` targets the linked project. The developer pushes migrations themselves: write the migration, but don't push it unless asked.
- After every migration, regenerate types into `src/types/database.ts` (`npx supabase gen types typescript --remote > src/types/database.ts`; check `--help` for current flags). If the migration isn't pushed yet, update the types by hand in the same format.
- Do not change the database through the dashboard Table Editor; use migrations. The one exception is creating the first platform admin (see README).

## Auth
- Supabase Auth, email + password. A `profiles` row is created automatically on signup by a trigger.
- Email confirmation is OFF for the MVP/testing (`supabase/config.toml`, `enable_confirmations = false`, applied with `npx supabase config push`), so users are logged in right after signup. It must be turned back on before real NGOs use the platform. The signup page handles both: with a session it logs the user in, otherwise it shows "check your email to confirm your account".
- Out of scope: password reset, social login, magic links.
- 

## Data model
`profiles`, `ngos`, `ngo_members`, `projects`, `project_ngos`, `events`, `project_interests`.
- A project has exactly one lead NGO (`project_ngos.is_lead = true`). Other rows in `project_ngos` are partner NGOs.
- An event belongs to one project (`events.project_id`).
- `project_interests` is an anonymous "show interest" (project_id + user_id). See Roles and permissions.
- `ngos`, `projects` and `events` have optional coordinates (`latitude`, `longitude`, nullable; both or neither set).

Enums:
- `project_status`: `in_planning`, `running`, `done`, `canceled`. "Active" projects are `in_planning` and `running`.
- `project_category`: `infrastructure_engineering`, `health_relief_welfare`, `education_kids_youth`, `economic_development_empowerment`, `human_rights_data`
- `user_role`: `admin`, `user`
- `ngo_member_role`: `ngo_admin`, `member`

## Roles and permissions
Enforced by RLS in the database; the UI should mirror them (hide buttons the user can't use).
- Everyone, no login: browse all projects, NGOs and events, and see each project's interest count (via `supabase.rpc('get_interest_counts')`).
- Logged-in user: show/withdraw interest in a project. They can see whether they themselves have shown interest. Interest is anonymous: nobody (not NGOs, not other users) can see who has shown interest, only the total count. Never select or display other users' `user_id`s from `project_interests`.
- `member`: edit their NGO's profile. Edit projects their NGO is part of (lead or partner), and those projects' events.
- `ngo_admin`: everything a member can, plus create projects (their NGO becomes the lead) and add/remove plain members of their NGO. For projects where their NGO is the lead: add/remove partner NGOs and delete the project.
- Only platform admins assign the `ngo_admin` role or change members' roles.
- `admin` (platform): creates/deletes NGOs, assigns ngo_admins, promotes other admins (`supabase.rpc('set_user_role', { _email, _role })`, returns `false` if no user has that email).
- Create projects ONLY via `supabase.rpc('create_project', {...})`. Direct inserts are blocked.
- Add NGO members ONLY via `supabase.rpc('add_ngo_member', { _ngo_id, _email, _role })`. It returns `false` if no user has that email; show a clear message ("No user with that email. They need to sign up first.").

## Maps
- Only show a marker for an NGO, project or event when both `latitude` and `longitude` are set. Items without coordinates are simply not on the map. Don't geocode addresses and don't add fallback positions.
- On detail pages, only render a map when the item has coordinates.
- Lazy-load map pages/components (`React.lazy`), because Leaflet is heavy. Import Leaflet's CSS and keep the OpenStreetMap attribution visible.

## MVP scope
Pages: projects overview, map (NGOs, projects and events that have coordinates), project detail, NGO list/detail, login/signup, NGO dashboard, platform admin page.
Out of scope for now: images/file uploads (no Supabase Storage), notifications, messaging, verification flows for NGOs, password reset.

## Deployment
- Static build (`npm run build` → `dist/`). The host must serve `index.html` for unknown paths (SPA fallback) so deep links like `/projects/123` work. Document this in the README.

## Design
Design templates are in `design/` (the app is called "Kibera Connect"). Follow them for layout and style.

## Working style
- Prefer small, readable components over clever abstractions.
- Keep the README setup section current: env vars, running locally, linking Supabase, migrations, creating the first admin, SPA fallback.
- Keep extra work to a minimum; this is an MVP.
- A task is done when `npm run build`, `npm run lint` and `npm test` pass without errors.