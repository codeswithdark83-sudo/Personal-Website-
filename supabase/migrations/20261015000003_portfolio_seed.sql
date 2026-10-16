-- Real details supplied by the owner (no invented content).
insert into public.profiles (display_name, headline, bio, availability_status) values
  ('Jatin Kr. Koli', 'Full Stack Developer',
   'I build modern, scalable and user-friendly web applications with a focus on performance, clean code and great user experience.', 'available');

insert into public.social_links (platform, url, sort_order) values
  ('github',    'https://github.com/codeswithdark83-sudo', 1),
  ('linkedin',  'https://www.linkedin.com/in/jatin-kr-koli/', 2),
  ('instagram', 'https://www.instagram.com/codeswithdark/', 3),
  ('whatsapp',  'https://wa.me/917827486302', 4),
  ('email',     'mailto:codeswithdark83@gmail.com', 5);

insert into public.site_settings (key, value, is_public) values
  ('contact', '{"email":"codeswithdark83@gmail.com","whatsapp_number":"917827486302","whatsapp_prefill":"Hi Jatin, I found your portfolio and would like to discuss a project."}', true);

insert into public.skills (name, category, sort_order)
select s.name, s.category, s.ord from (values
  ('React','Frontend',1),('Next.js','Frontend',2),('TypeScript','Frontend',3),('Tailwind CSS','Frontend',4),('HTML','Frontend',5),('CSS','Frontend',6),
  ('Node.js','Backend',1),('Express.js','Backend',2),('Supabase','Backend',3),('PostgreSQL','Backend',4),('REST APIs','Backend',5),
  ('Git','Tools & Others',1),('GitHub','Tools & Others',2),('Docker','Tools & Others',3),('VS Code','Tools & Others',4),('Vercel','Tools & Others',5),('Figma','Tools & Others',6)
) as s(name, category, ord);
