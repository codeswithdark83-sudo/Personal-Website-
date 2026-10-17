-- Services written from the owner's gig PDF (GIG.pdf). Only scope facts that the PDF states and that are
-- internally consistent are published. Prices and delivery days are deliberately left out: the PDF itself says
-- to choose the final price/currency and to confirm delivery feasibility before publishing.
insert into public.services (title, slug, description, icon, target_client, pricing_note, timeline_note, deliverables, cta_label, status, sort_order) values
('Starter Landing Page', 'starter-landing-page',
 'A clean, fully responsive 1–3 page modern website or landing page that loads fast and stays focused on one clear goal.',
 'monitor', 'Individuals and small businesses that need a simple, focused web presence.',
 'Confirmed quote after we agree the scope.', 'Timeline confirmed per project.',
 array['Up to 3 pages','Fully responsive design','1 revision','Content upload','1 plugin/extension installation','Opt-in form','Speed optimization','Hosting setup','Social media icons'],
 'Get a Quote', 'published', 1),
('Business Website', 'business-website',
 'A professional multi-page responsive website for businesses and service providers, with SEO basics, forms and more.',
 'layers', 'Businesses and service providers that need a complete multi-page site.',
 'Confirmed quote after we agree the scope.', 'Timeline confirmed per project.',
 array['Up to 6 pages','Fully responsive design','SEO and contact forms','3 revisions','Content upload','3 plugin/extension installations','Opt-in form','Speed optimization','Hosting setup','Social media icons'],
 'Get a Quote', 'published', 2),
('Complete Pro / E-Commerce Solution', 'complete-pro-ecommerce',
 'A full-featured, high-converting website or online store with payment integration.',
 'cart', 'Brands and sellers that want to sell online or need a feature-rich website.',
 'Confirmed quote after we agree the scope.', 'Timeline confirmed per project.',
 array['Up to 10 pages','E-commerce functionality','Payment integration','Autoresponder integration','Unlimited revisions (reasonable scope agreed before work starts)','7 plugin/extension installations','Content upload','Opt-in form','Speed optimization','Hosting setup','Social media icons','Number of products confirmed before the order'],
 'Get a Quote', 'published', 3),
('Optional Add-ons', 'optional-add-ons',
 'Extras you can add to any package. Each one is priced separately and confirmed when we agree the scope.',
 'plug', 'Anyone who needs a little more than a package includes.',
 'Priced separately; confirmed in your quote.', 'Extra time confirmed per add-on.',
 array['Extra-fast delivery','Additional pages','Additional revisions','Payment integration','Google Authentication for faster sign-in','Additional plugin installation or products (quoted separately)'],
 'Ask About Add-ons', 'published', 4)
on conflict (slug) do nothing;
