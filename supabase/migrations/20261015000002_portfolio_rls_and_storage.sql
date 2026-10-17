-- Admin check: SECURITY INVOKER, reads the allowlist through its own RLS policy (no definer needed).
alter table public.admins enable row level security;
create policy "admins read own row" on public.admins for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_admin() returns boolean
language sql stable set search_path = '' as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
$$;

-- Public may read only published / visible rows; admins may read and write everything.
do $$
declare r record;
begin
  for r in select * from (values
    ('projects','status = ''published'''),('blog_posts','status = ''published'''),('services','status = ''published'''),
    ('skills','visible'),('experiences','visible'),('education','visible'),('certifications','visible'),
    ('social_links','visible'),('site_settings','is_public'),('profiles','true'),('technologies','true')
  ) as v(tbl, cond) loop
    execute format('alter table public.%I enable row level security', r.tbl);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (%s or public.is_admin())', r.tbl, r.cond);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.is_admin())', r.tbl);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', r.tbl);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.is_admin())', r.tbl);
  end loop;
end $$;

-- Case studies and tech links follow their parent project's publication state.
alter table public.case_studies enable row level security;
create policy "public read" on public.case_studies for select to anon, authenticated
  using (public.is_admin() or exists (select 1 from public.projects p where p.id = project_id and p.status = 'published'));
create policy "admin insert" on public.case_studies for insert to authenticated with check (public.is_admin());
create policy "admin update" on public.case_studies for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.case_studies for delete to authenticated using (public.is_admin());

alter table public.project_technologies enable row level security;
create policy "public read" on public.project_technologies for select to anon, authenticated
  using (public.is_admin() or exists (select 1 from public.projects p where p.id = project_id and p.status = 'published'));
create policy "admin insert" on public.project_technologies for insert to authenticated with check (public.is_admin());
create policy "admin update" on public.project_technologies for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.project_technologies for delete to authenticated using (public.is_admin());

-- Private tables: admins only. Public inquiry inserts go through a server route using the service role.
do $$
declare t text;
begin
  foreach t in array array['inquiries','inquiry_notes','media_assets'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "admin select" on public.%I for select to authenticated using (public.is_admin())', t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- Storage: public-assets is world-readable by URL (no listing policy); private-documents is admin-only.
-- SVG is deliberately excluded from the public bucket (SVGs can embed scripts).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('public-assets', 'public-assets', true, 5242880, array['image/png','image/jpeg','image/webp','image/avif','application/pdf']),
  ('private-documents', 'private-documents', false, 10485760, array['application/pdf','image/png','image/jpeg'])
on conflict (id) do nothing;

create policy "admin insert objects" on storage.objects for insert to authenticated
  with check (bucket_id in ('public-assets','private-documents') and public.is_admin());
create policy "admin update objects" on storage.objects for update to authenticated
  using (bucket_id in ('public-assets','private-documents') and public.is_admin());
create policy "admin delete objects" on storage.objects for delete to authenticated
  using (bucket_id in ('public-assets','private-documents') and public.is_admin());
create policy "admin read private objects" on storage.objects for select to authenticated
  using (bucket_id = 'private-documents' and public.is_admin());
