# Kibera Connect

An open-source platform where NGOs in Kibera (Nairobi) can see each other's ongoing projects and collaborate, and where locals can browse projects and events and show interest.

Built with React + TypeScript (Vite), Tailwind + shadcn/ui, Supabase (database + auth) and Leaflet + OpenStreetMap. The app is a static site that can be hosted anywhere.

## Setup

### 1. Install

Requires Node.js 22 or newer.

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in the values from the Supabase dashboard (Project Settings → API):

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The **publishable** (anon) key |

Never put the `service_role`/secret key in `.env` or anywhere in the frontend.

### 3. Run locally

```bash
npm run dev      # development server
npm run build    # production build into dist/
npm run lint     # lint with oxlint
npm run preview  # serve the production build locally
```

## Supabase

### Link the project (once)

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
```

### Migrations

The database schema lives in `supabase/migrations/`. Never edit a migration that has already been pushed; add a new one instead.

```bash
npx supabase migration new <name>      # creates an empty SQL file in supabase/migrations/
npx supabase db push --remote          # applies new migrations to the linked (hosted) project
```

The Supabase CLI targets a *local* database by default, so `--remote` is needed to reach the hosted project.

After every migration, regenerate the TypeScript types:

```bash
npx supabase gen types typescript --remote > src/types/database.ts
```

**If the first migration was run by hand in the SQL Editor**, `db push` will try to run it again and fail. Mark it as applied first:

```bash
npx supabase migration repair --status applied 20261111102102 --remote
```

Do not change the database through the dashboard Table Editor. The only exception is creating the first platform admin (below).

### Demo data (optional)

`supabase/seed.sql` adds demo NGOs, projects (all categories and statuses) and events (relative to today). It can be run more than once and creates no users.

```bash
npx supabase db query --remote -f supabase/seed.sql         # add demo data
npx supabase db query --remote -f supabase/seed_remove.sql  # remove it again
```

To test as an NGO admin, see the optional statement at the bottom of `seed.sql`.

Supabase rejects sign-ups with fake domains (like `test.com`). To create a confirmed test admin without email, copy `supabase/seed_test_admin.sql`, set a password in the copy (don't commit it) and run the copy with `npx supabase db query --remote -f <copy>.sql`.

### Auth settings

Email + password login with email confirmation (the Supabase default). In the dashboard under Authentication → URL Configuration, set the **Site URL** to where the app is hosted, and add `http://localhost:5173` to the **Redirect URLs** for local development. The confirmation email links back to the app.

### Create the first platform admin

1. Sign up in the app and confirm your email.
2. In the Supabase dashboard, open the SQL Editor and run:

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

After that, admins can promote other admins from the Admin page in the app.

## Roles

| Who | Can |
| --- | --- |
| Everyone | Browse projects, NGOs, events, the map, and interest counts |
| Logged-in user | Show/withdraw interest in a project (anonymous: only totals are shown) |
| NGO `member` | Edit their NGO's profile; edit projects their NGO is part of (lead or partner) and those projects' events |
| NGO `ngo_admin` | Everything a member can, plus create projects (their NGO becomes lead), add/remove members, and, for projects where their NGO is the lead, add/remove partner NGOs and delete the project |
| Platform `admin` | Create/delete NGOs, add NGO admins, promote/demote platform admins |

All rules are enforced in the database with Row Level Security; the UI only hides what a user can't do.

Typical flow: the platform admin creates an NGO on the Admin page, then adds its first NGO admin (by email) on the Dashboard. The NGO admin adds members and creates projects. Users must sign up before they can be added.

## Deployment

`npm run build` produces a static site in `dist/`. Upload it to any static host.

**SPA fallback is required:** the host must serve `index.html` for unknown paths, so deep links like `/projects/123` work. Examples:

- **Netlify**: add a file `public/_redirects` containing `/* /index.html 200`
- **Cloudflare Pages**: works out of the box (no `404.html` in the build)
- **nginx**: `location / { try_files $uri /index.html; }`
- **Apache**: `FallbackResource /index.html` in `.htaccess`

Remember to set the environment variables at build time on the host, and to add the host's URL in Supabase Auth settings.

## Project structure

```
src/
  api/          data hooks (TanStack Query) per table
  components/   shared components; ui/ holds shadcn/ui components
  components/map/  Leaflet maps (always lazy-loaded)
  lib/          Supabase client, auth context, helpers
  pages/        one component per route
  types/        generated Supabase types
supabase/migrations/   database schema (source of truth)
design/        design sketches
```
