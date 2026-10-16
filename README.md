# Jatin Kr. Koli — Full Stack Portfolio

A responsive, database-driven portfolio built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and Supabase.
Public pages read **published** content from Supabase; a private admin area (email + password, allowlisted) manages it.

> **Status: work in progress.** See [What works today](#what-works-today) and [Not built yet](#not-built-yet) before relying on a feature.

## What works today

- **Public site** — Home, About, Projects (search / category / technology filters), project case-study pages with table of contents, Services, Credentials (tabs), Blog (search / categories), Contact (placeholder heading only), Privacy, 404/error/loading states, sitemap and robots.
- **Responsive** — layouts tested for horizontal overflow at 320, 375, 768, 1024 and 1440 px on every public route. Mobile navigation, 44 px touch targets, `prefers-reduced-motion` respected.
- **Dark / light theme** with persistence, no flash on load.
- **Supabase schema + row-level security** (`supabase/migrations/`) — 17 tables, public/private storage buckets, admin allowlist. Anonymous visitors can read only published content.
- **Admin editors** — projects (with case study sections, technologies, cover upload, publish/draft), services, skills/experience/education/certifications, blog, profile and contact settings. Every action re-checks admin rights on the server.
- **Admin login & dashboard** — `/admin/login`, session refresh in `src/proxy.ts`, server-side `requireAdmin()` on every admin page, and a dashboard with live counts. Sign-out works.
- **Safe content rendering** — Markdown without raw HTML; validated uploads (file-signature check, size limits, SVG rejected); open-redirect protection; Zod schemas for all content types.
- **Graceful fallback** — without Supabase env vars the site renders clearly-labelled placeholder content and your real contact links.

## Not built yet

- Admin media library, drag-to-reorder (use the Sort order field), and live draft preview. Admin editors compile and pass type checks but have **not** been exercised against a live database.
- **Project inquiry wizard**, inquiry API, email notifications (Resend) and the inquiry CRM. The Contact page is a heading only; do not treat it as a working inquiry flow.
- Playwright end-to-end tests, analytics, structured data (JSON-LD), social preview images.
- A strong shared rate limiter (the current one is per server instance — see Security notes).

## Run locally

Requires Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test` (Vitest), `test:e2e` (Playwright, no tests yet), `format`.

## Environment variables

| Variable | Where it comes from | Needed for |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | your production origin | canonical URLs, sitemap (required in production) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | reading content, admin login |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the *publishable* (`sb_publishable_…`) or legacy anon key — browser-safe | reading content, admin login |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API (secret). **Server only** | saving public inquiries (not built yet) |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | Resend dashboard | inquiry emails (not built yet) |

Never prefix a secret with `NEXT_PUBLIC_`. Never commit `.env.local`.

## Database setup

Use a **dedicated** Supabase project for the portfolio (do not share one with another app).

1. Create a project. In the SQL editor (or with the Supabase CLI) run the files in `supabase/migrations/` in order.
2. In **Authentication → Users → Add user**, create your admin account with a strong password and *Auto Confirm*.
3. Add it to the allowlist (replace the email):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
4. Enable *leaked password protection* under Authentication → Policies.

Only users listed in `public.admins` can sign in to the admin area or modify data; this is enforced both in server code and by RLS policies.

## Content onboarding checklist

- [ ] Replace the sample/placeholder projects with verified projects, descriptions, screenshots and links.
- [ ] Confirm email, LinkedIn, Instagram, GitHub and WhatsApp (seeded from details you supplied).
- [ ] Review the seeded skill list — it came from the design mockup, not a verified skills audit.
- [ ] Add verified education, certifications and experience.
- [ ] Upload a resume (the hero says "Resume available on request" until you do).
- [ ] Write the first blog post (or leave the Blog empty).
- [ ] Set the production site URL and a social preview image.

No qualifications, employment, testimonials or metrics are invented by this codebase.

## Deploy to Vercel

1. Import the GitHub repo into Vercel (default Next.js settings).
2. Add the environment variables above (Production + Preview).
3. In Supabase → Authentication → URL Configuration, add your site URL.
4. Deploy, then check `/`, `/projects`, `/admin/login`, `/sitemap.xml`.

Backups: enable Supabase backups (Pro plan) or schedule `pg_dump`; restore by re-running migrations and importing the dump.

## Security notes

- Row-level security is enabled on every table; `public.is_admin()` gates all writes.
- The proxy (`src/proxy.ts`) is only an optimistic redirect. Real authorization is `requireAdmin()` in server code and RLS in the database.
- The login rate limiter is in-memory per server instance, so on serverless hosting it only slows bursts. For stronger protection add Vercel's WAF rate limiting or a shared store (e.g. Upstash Redis).
- The service-role key bypasses RLS: use it only in vetted server code.

## Tests

`npm test` runs Vitest unit tests (content mapping, validation schemas, upload checks, redirect safety). Last run: 21 passing. These do **not** cover Supabase itself or the admin UI against a live database.

## Troubleshooting

- **Site shows placeholder projects** — Supabase env vars are missing/empty (expected fallback).
- **Site shows "No projects published yet"** — connected correctly; nothing is published.
- **Cannot sign in** — the account must exist in Supabase Auth *and* in `public.admins`; the error message is intentionally generic.
- **Build fails fetching data** — the build machine cannot reach Supabase; check the URL/key and network access.
