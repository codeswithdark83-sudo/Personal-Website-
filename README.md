# Jatin Kr. Koli — Portfolio

A responsive portfolio starter based on the supplied dark, blue-accented design reference. The current version is a public-facing Next.js site with working navigation, a dark/light theme switch, project search and filters, service/contact calls to action, metadata, sitemap, and robots rules.

The hero uses a cropped, WebP-optimized portrait from the image you confirmed is you (`public/images/jatin-portrait.webp`).

## Run locally

Prerequisites: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. `NEXT_PUBLIC_SITE_URL` controls canonical metadata and sitemap URLs.

## Content onboarding checklist

- [ ] Replace the three clearly marked sample project cards with verified projects, descriptions, screenshots, and repository/demo links.
- [ ] Confirm email, LinkedIn, and Instagram URLs. The example email is intentionally marked as a placeholder.
- [ ] Add verified education, certifications, and professional experience.
- [ ] Add a real resume file and link after confirming its contents.
- [ ] Replace the placeholder journal message when articles are ready.
- [ ] Configure the production site URL and social preview image.

No qualifications, employment, testimonials, or performance metrics are claimed by this starter.

## Stack and scripts

- Next.js 16 App Router, React, and strict TypeScript.
- CSS is currently kept in one global stylesheet so the supplied visual direction can be tuned without adding a dependency to this empty repository.
- `npm run dev`, `npm run build`, `npm start`.

## Backend and CMS status

Supabase, authentication, database migrations, administrator dashboard, inquiry storage/CRM, email notifications, media storage, rate limiting, and automated tests are not connected in this initial deployment. The environment template lists the intended integration variables; none are required for the public site. Do not treat the public contact link as a submitted inquiry workflow.

To complete the full CMS, create a Supabase project, implement and review schema migrations and RLS policies, configure Supabase Auth and Storage, then add server-only email credentials in Vercel. Never expose service-role keys to browser code. Admin routes must perform authorization on the server.

## Deploy to Vercel

Connect the GitHub repository to a Vercel project and use the default Next.js build settings. Set `NEXT_PUBLIC_SITE_URL` to the production origin. The app has no required secrets for its public pages. Add only integrations you have configured; never commit `.env.local`.

## Verification report

This repository began empty. `npm run build` completed successfully with Next.js 16.4.1, and `npm audit` reported zero vulnerabilities. Browser-based visual comparison is blocked because the in-app browser could not reach the local development server. Supabase, private admin features, transactional email, inquiry submission, and the requested full test suite remain unimplemented and require further development and external configuration.
