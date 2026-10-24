-- Record of a policy already applied to the live database.
-- Lets the contact form save an inquiry with the public (anon) key when no service-role key is configured.
-- Anyone can ADD an inquiry in its initial state; nobody but admins can read, change or delete rows.
create policy "public submit inquiry" on public.inquiries for insert to anon
  with check (
    status = 'new' and email_notification = 'pending' and next_action is null and follow_up_at is null
    and details = '{}'::jsonb and char_length(brief) >= 10
  );
