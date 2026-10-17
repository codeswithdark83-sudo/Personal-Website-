-- Portfolio schema. Additive only: does not touch existing tables.
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 1 and 120),
  headline text not null default '' check (char_length(headline) <= 200),
  bio text not null default '' check (char_length(bio) <= 4000),
  avatar_path text, resume_path text, location_label text,
  availability_status text not null default 'available' check (availability_status in ('available','limited','unavailable')),
  updated_at timestamptz not null default now()
);

create table public.technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 60),
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  summary text not null default '' check (char_length(summary) <= 500),
  description text not null default '' check (char_length(description) <= 20000),
  cover_image_path text,
  gallery_paths text[] not null default '{}',
  live_url text check (live_url is null or live_url ~* '^https?://'),
  repository_url text check (repository_url is null or repository_url ~* '^https?://'),
  project_type text not null default 'Web Application',
  category text not null default 'General',
  timeline_label text,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_status_sort_idx on public.projects (status, sort_order);

create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  problem text, goals text, role text, approach text, solution text, architecture text,
  challenges text, outcomes text, lessons_learned text,
  content_blocks jsonb not null default '[]' check (jsonb_typeof(content_blocks) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_technologies (
  project_id uuid not null references public.projects(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  primary key (project_id, technology_id)
);
create index project_technologies_tech_idx on public.project_technologies (technology_id);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  category text not null default 'General',
  visible boolean not null default true,
  sort_order integer not null default 0,
  unique (category, name)
);

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null, organization text not null, description text,
  start_date date, end_date date, url text check (url is null or url ~* '^https?://'),
  visible boolean not null default true, sort_order integer not null default 0
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null, qualification text not null, description text,
  start_date date, end_date date,
  visible boolean not null default true, sort_order integer not null default 0
);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  title text not null, issuer text not null,
  issued_on date, expires_on date, credential_id text,
  verification_url text check (verification_url is null or verification_url ~* '^https?://'),
  visible boolean not null default true, sort_order integer not null default 0
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  icon text not null default 'monitor' check (icon in ('monitor','code','layers','cart','plug','wrench')),
  target_client text, scope text, pricing_note text, timeline_note text,
  deliverables text[] not null default '{}',
  faqs jsonb not null default '[]' check (jsonb_typeof(faqs) = 'array'),
  cta_label text not null default 'Get in Touch',
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  excerpt text not null default '' check (char_length(excerpt) <= 600),
  body text not null default '' check (char_length(body) <= 200000),
  cover_image_path text,
  category text not null default 'General',
  tags text[] not null default '{}',
  seo_title text, seo_description text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index blog_posts_status_pub_idx on public.blog_posts (status, published_at desc);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  company text check (char_length(company) <= 160),
  phone text check (char_length(phone) <= 40),
  project_type text not null check (char_length(project_type) <= 80),
  project_title text check (char_length(project_title) <= 200),
  budget_range text check (char_length(budget_range) <= 80),
  timeline text check (char_length(timeline) <= 120),
  brief text not null check (char_length(brief) between 1 and 5000),
  details jsonb not null default '{}',
  preferred_contact text not null default 'email' check (preferred_contact in ('email','whatsapp','phone','linkedin','instagram')),
  status text not null default 'new' check (status in ('new','contacted','qualified','proposal_sent','won','closed')),
  next_action text, follow_up_at date,
  email_notification text not null default 'pending' check (email_notification in ('pending','sent','failed','skipped')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index inquiries_status_created_idx on public.inquiries (status, created_at desc);

create table public.inquiry_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  note text not null check (char_length(note) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index inquiry_notes_inquiry_idx on public.inquiry_notes (inquiry_id, created_at desc);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null unique check (platform in ('github','linkedin','instagram','whatsapp','email','scheduling')),
  url text not null check (url ~* '^(https?://|mailto:)'),
  visible boolean not null default true,
  sort_order integer not null default 0
);

create table public.site_settings (
  key text primary key check (key ~ '^[a-z0-9_]+$'),
  value jsonb not null,
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null check (bucket in ('public-assets','private-documents')),
  path text not null, alt_text text, mime_type text not null,
  size_bytes integer not null check (size_bytes > 0),
  created_at timestamptz not null default now(),
  unique (bucket, path)
);

do $$ declare t text; begin
  foreach t in array array['profiles','projects','case_studies','services','blog_posts','inquiries','site_settings'] loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;
