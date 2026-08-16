-- Reject unapproved Studio emails before sign-in or password recovery.
create or replace function public.is_studio_email_allowed(candidate_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.site_admins
    where lower(email) = lower(trim(candidate_email))
  );
$$;

revoke all on function public.is_studio_email_allowed(text) from public;
grant execute on function public.is_studio_email_allowed(text) to anon, authenticated;
