-- DockHub project, written from the owner's own case study PDF (DockHub_Case_Study.pdf).
-- Only facts stated in that document are used. Challenges and lessons are left empty on purpose.
with p as (
  insert into public.projects (title, slug, summary, description, cover_image_path, live_url, repository_url,
    project_type, category, timeline_label, featured, status, sort_order, published_at)
  values (
    'DockHub', 'dockhub',
    'A personal bookmark and tools dashboard: organized categories, instant search and cross-device sync, built and deployed end to end as an installable web app.',
    $$DockHub is a personal startpage that replaces a cluttered browser bookmark bar with an organized, searchable dashboard. Links are grouped into custom categories, each with its own icon, brand logo and drag-to-reorder layout. Sign in once and the whole dashboard, every category and bookmark, follows across every device.$$,
    '/images/projects/dockhub.webp', 'https://dock-hub.vercel.app', 'https://github.com/codeswithdark83-sudo/DockHub',
    'Web Application (PWA)', 'Productivity', 'v1.0.0 · October 2026', true, 'published', 0, now())
  on conflict (slug) do nothing
  returning id
)
insert into public.case_studies (project_id, problem, goals, role, approach, solution, architecture, outcomes)
select id,
$$- Bookmark bars get cluttered and cramped fast.
- Browser bookmarks don't follow you to a new device.
- Finding one saved link among hundreds takes too long.
- No visual grouping: everything looks the same.$$,
$$Replace the browser bookmark bar with a dashboard that keeps links grouped in custom categories, syncs to every device after one sign-in, and lets you find any link instantly.$$,
$$Solo, end to end: product design, frontend engineering, backend and authentication architecture, database security and deployment, from the first wireframe to the live, installable production app.$$,
$$1. Design: wireframed the dashboard, chose a dark-first palette and planned the category and bookmark data model before writing code.
2. Build: built the entire UI in vanilla JavaScript, then added Supabase authentication, a Postgres schema and Row Level Security.
3. Ship: connected GitHub to Vercel for automatic deploys, added a manifest and service worker, and shipped an installable PWA.$$,
$$- Custom categories: collapsible sections with 100+ searchable icons, renamed and reordered in place.
- Drag and reorder: mouse drag-and-drop on desktop, plus Move up/down controls for touch devices.
- Instant search: filters bookmarks as you type; Enter falls back to a web search.
- Brand logos: auto-matched logos for popular sites, a custom logo upload, or a letter-tile fallback.
- Dark and light themes with an animated transition that respects the system preference.
- Mobile-first: accordion categories and a floating bottom navigation bar.
- Keyboard shortcuts: "/" focuses search, Enter triggers a web search, Esc closes any modal.
- Accessibility care: respects prefers-reduced-motion and device safe areas.$$,
$$- Sign-in is required, so every bookmark is tied to its owner (email and password, or Google, through Supabase Auth with confirmed emails and password reset).
- Postgres Row Level Security ensures each user can only read or write their own data.
- Admin access is verified inside a Postgres function, never just hidden in the UI.
- Every add, edit, delete or reorder is upserted immediately; a fresh device pulls the latest data on login.
- Web App Manifest and Service Worker give offline app-shell caching and add-to-home-screen installation.
- Hosting: Vercel static hosting with automatic HTTPS and a global CDN.$$,
$$- Live on Vercel at dock-hub.vercel.app and installable as a PWA on iOS, Android and desktop.
- About 55 KB for the entire app, in a single file.
- Zero runtime dependencies and 100+ built-in category icons.$$
from p;

with t(name) as (values ('HTML5'),('CSS3'),('JavaScript'),('Supabase'),('PostgreSQL'),('PWA'),('Vercel'))
insert into public.technologies (name) select name from t on conflict (name) do nothing;

insert into public.project_technologies (project_id, technology_id)
select p.id, t.id from public.projects p join public.technologies t on t.name in ('HTML5','CSS3','JavaScript','Supabase','PostgreSQL','PWA','Vercel')
where p.slug = 'dockhub' on conflict do nothing;
