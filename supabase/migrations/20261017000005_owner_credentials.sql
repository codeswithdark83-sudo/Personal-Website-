-- Owner-supplied credentials. Institution and exact dates were not provided, so they are left empty/year-level.
insert into public.education (institution, qualification, description, start_date, end_date, sort_order)
select '', 'Bachelor''s in Computer Application (BCA)', null, '2024-01-01', '2027-01-01', 0
where not exists (select 1 from public.education where qualification = 'Bachelor''s in Computer Application (BCA)');

insert into public.experiences (role, organization, description, sort_order)
select 'Full-Stack Engineer', 'Versatile (clothing brand)', 'Freelance engagement. Project completed in 3 months.', 0
where not exists (select 1 from public.experiences where organization = 'Versatile (clothing brand)');
