-- Versatile Online Store, written from the owner's case study PDF. Only facts stated there are used.
with p as (
  insert into public.projects (title, slug, summary, description, cover_image_path, live_url, repository_url,
    project_type, category, timeline_label, featured, status, sort_order, published_at)
  values (
    'Versatile Online Store', 'versatile-online-store',
    'A premium clothing store for an Indian fashion brand: storefront, secure payments with Cash on Delivery, customer accounts and an admin dashboard the owner runs alone.',
    $$Versatile wanted to sell directly to customers in India instead of relying on marketplaces. I designed and built the store end to end for the brand: a storefront, checkout, customer accounts and admin tools, shipped on its own domain as a responsive website and installable PWA. Every price and stock check is verified on the server, and each change was released in small steps so the live store was never left half-finished.$$,
    '/images/projects/versatile.webp', 'https://www.versatilehub.in', null,
    'E-commerce Web App (PWA)', 'E-commerce', '3 months · Freelance', true, 'published', 1, now())
  on conflict (slug) do nothing
  returning id
)
insert into public.case_studies (project_id, problem, goals, role, approach, solution, architecture, challenges, outcomes)
select id,
$$Versatile needed more than a template. The brand wanted a premium, editorial look; trustworthy online payments with Cash on Delivery; GST-ready invoicing; and a back office simple enough for the owner to manage stock and orders daily. It also had to work well on phones, where most fashion shoppers browse, and stay reliable while new features were added to a live store.$$,
$$- Sell directly to customers in India instead of relying on marketplaces.
- A look that feels like the brand.
- Secure online payments plus Cash on Delivery, with GST-ready invoicing.
- An admin dashboard the owner can run without a developer.$$,
$$Design and full-stack development for a freelance client, end to end: brand-led design, storefront, checkout, customer accounts, admin tools, payments, deployment and SEO.$$,
$$Brand-led design first, taking the look from the brand's own photography: large type, generous space and chapter-style sections, with light motion so pages stay quick on mid-range phones. Light and dark themes, with photo overlays in fixed colours so text stays readable in either. Navigation, product cards and checkout were tuned down to 320 px screens. Features were released in small, reversible steps.$$,
$$Shopping journey
- Product pages with an image gallery, colour and size selectors, live stock messages and a size-chart image.
- Add to Bag and a one-tap Buy Now.
- Checkout with Razorpay (UPI, cards, netbanking, wallets) plus Cash on Delivery, GST-inclusive totals, policy consent and downloadable GST invoices.
- Order history with status and courier tracking, cancellation before shipping with automatic refund and restock, returns after delivery, a wishlist, and sign-in with email or Google.

Admin dashboard
- Orders: update status, add courier details, handle returns and refunds.
- Inventory: products, size and colour stock, and multiple images uploaded from a phone and compressed automatically.
- Customers: list and CSV export for accounting.
- Maintenance mode: one switch pauses shopping and payments while changes are made. It is enforced on the server and fails open, so a settings error can never lock the store.$$,
$$- Stack: React 19, TanStack Start, TypeScript, Tailwind CSS 4, Motion, Supabase (Postgres and Auth), Razorpay, Vercel, and a PWA service worker.
- Pricing, stock and payment verification run in typed server functions; a payment signature check and a webhook act as a safety net.
- Privileged database actions use a service key that never reaches the browser.
- Row-level security means customers only ever see their own orders and data.
- The whole database is reproducible from versioned migrations, so the project moved to a new Supabase account with one setup script.
- Installable on a home screen through a web manifest, service worker and offline page.$$,
$$- Slow, unresponsive pages: cached the product catalogue, prefetched routes and compressed uploaded images, so taps respond quickly on phones.
- Overlapping product text: rebuilt product cards so long names and prices wrap cleanly at any width.
- Empty collection after filtering: fixed an animation that hid products when switching Men / Women.
- Google couldn't read the sitemap: switched to absolute URLs and a clean robots file so the store can be indexed in Search Console.$$,
$$Versatile has a branded, fast storefront on its own domain, with online and COD payments, automatic invoices and a dashboard that lets the owner manage products, orders and returns without touching code. The store has been improved continuously after launch, with new features, performance fixes and a backend migration, without downtime for customers.

What I would highlight: owning the full cycle (design, build, payments, deployment and SEO), shipping safely on a live store with a maintenance switch and small reversible releases, and attention to mobile performance and real customer feedback.$$
from p;

with t(name) as (values ('React'),('TanStack Start'),('TypeScript'),('Tailwind CSS'),('Motion'),('Supabase'),('PostgreSQL'),('Razorpay'),('Vercel'),('PWA'))
insert into public.technologies (name) select name from t on conflict (name) do nothing;

insert into public.project_technologies (project_id, technology_id)
select p.id, t.id from public.projects p join public.technologies t on t.name in ('React','TanStack Start','TypeScript','Tailwind CSS','Motion','Supabase','PostgreSQL','Razorpay','Vercel','PWA')
where p.slug = 'versatile-online-store' on conflict do nothing;
