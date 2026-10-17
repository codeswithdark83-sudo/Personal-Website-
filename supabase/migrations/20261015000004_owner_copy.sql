-- Owner-written copy carried over from the original single-page site (Personal-Website- repo).
update public.profiles set
  bio = 'I build modern, scalable and user-friendly web applications. Passionate about clean code, great user experiences, and turning ideas into reality.',
  location_label = 'Haryana, India'
where display_name = 'Jatin Kr. Koli';

insert into public.site_settings (key, value, is_public) values
 ('about', '{"title":"Turning Ideas into Real Web Solutions","body":"I’m a passionate full-stack developer who enjoys building modern web applications. I focus on writing clean code, creating great user experiences, and solving real problems with technology."}', true),
 ('journey', '[{"label":"Building now","text":"Creating modern web applications and exploring new technologies."},{"label":"Full stack focus","text":"Learning across frontend, backend, APIs, and databases."},{"label":"Getting started","text":"Started with HTML, CSS, and JavaScript, then kept building."}]', true)
on conflict (key) do nothing;
