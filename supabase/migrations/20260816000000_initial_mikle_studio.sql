-- Mikle Studio: database, access rules, media storage, and launch content.

create extension if not exists pgcrypto;

create table if not exists public.site_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.videos (
  id text primary key default gen_random_uuid()::text,
  title_en text not null,
  title_ka text not null default '',
  description_en text not null default '',
  description_ka text not null default '',
  duration text not null default '',
  language text not null default 'EN',
  thumbnail_url text not null,
  source_type text not null check (source_type in ('instagram', 'upload', 'external')),
  source_url text not null,
  fallback_url text,
  published boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.videos
add column if not exists fallback_url text;

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.site_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to anon, authenticated;

-- Check the private allowlist before sending a magic link. This keeps admin
-- addresses in Postgres instead of exposing them in the public JavaScript bundle.
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

alter table public.site_admins enable row level security;
alter table public.videos enable row level security;
alter table public.site_settings enable row level security;

-- Use explicit Data API grants so automatic table exposure can remain disabled.
grant usage on schema public to anon, authenticated;
revoke all privileges on table public.site_admins, public.videos, public.site_settings from anon, authenticated;
grant select on table public.site_admins to authenticated;
grant select on table public.videos, public.site_settings to anon, authenticated;
grant insert, update, delete on table public.videos to authenticated;
grant insert, update on table public.site_settings to authenticated;

drop policy if exists "Admin can confirm own access" on public.site_admins;
create policy "Admin can confirm own access"
on public.site_admins for select
to authenticated
using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "Public can read published videos" on public.videos;
create policy "Public can read published videos"
on public.videos for select
to anon, authenticated
using (published or public.is_site_admin());

drop policy if exists "Admin can insert videos" on public.videos;
create policy "Admin can insert videos"
on public.videos for insert
to authenticated
with check (public.is_site_admin());

drop policy if exists "Admin can update videos" on public.videos;
create policy "Admin can update videos"
on public.videos for update
to authenticated
using (public.is_site_admin())
with check (public.is_site_admin());

drop policy if exists "Admin can delete videos" on public.videos;
create policy "Admin can delete videos"
on public.videos for delete
to authenticated
using (public.is_site_admin());

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admin can insert site settings" on public.site_settings;
create policy "Admin can insert site settings"
on public.site_settings for insert
to authenticated
with check (public.is_site_admin());

drop policy if exists "Admin can update site settings" on public.site_settings;
create policy "Admin can update site settings"
on public.site_settings for update
to authenticated
using (public.is_site_admin())
with check (public.is_site_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  209715200,
  array['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public media is viewable" on storage.objects;
create policy "Public media is viewable"
on storage.objects for select
to public
using (bucket_id = 'media');

drop policy if exists "Admin can upload media" on storage.objects;
create policy "Admin can upload media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'media' and public.is_site_admin());

drop policy if exists "Admin can update media" on storage.objects;
create policy "Admin can update media"
on storage.objects for update
to authenticated
using (bucket_id = 'media' and public.is_site_admin())
with check (bucket_id = 'media' and public.is_site_admin());

drop policy if exists "Admin can delete media" on storage.objects;
create policy "Admin can delete media"
on storage.objects for delete
to authenticated
using (bucket_id = 'media' and public.is_site_admin());

-- Initial public videos. Mikle can edit or delete all of these from the studio.
insert into public.videos (
  id, title_en, title_ka, description_en, description_ka, duration, language,
  thumbnail_url, source_type, source_url, fallback_url, published, featured, sort_order
)
values
  (
    'instagram-DcDOnd1pRrY',
    'What does it mean to actually live healthy?',
    'რას ნიშნავს სინამდვილეში ჯანსაღად ცხოვრება?',
    'Why food and exercise are only two parts of a much larger system.',
    'რატომ არის კვება და ვარჯიში უფრო დიდი სისტემის მხოლოდ ორი ნაწილი.',
    '02:27', 'EN', '/images/reel-health-en.jpg', 'upload',
    '/videos/health-en.webm', '/videos/health-en-browser.mp4', true, true, 1
  ),
  (
    'instagram-DcDORepJscQ',
    'What is health? — ქართულად',
    'რას ნიშნავს ჯანმრთელობა? — ქართულად',
    'The same whole-system idea, shared directly with his Georgian community.',
    'იგივე იდეა ჯანმრთელობის მთლიან სისტემაზე — ქართული აუდიტორიისთვის.',
    '02:43', 'KA', '/images/reel-health-ka.jpg', 'upload',
    '/videos/health-ka.webm', '/videos/health-ka-browser.mp4', true, false, 2
  ),
  (
    'instagram-Db_p4EsJIi8',
    'Why I started this page',
    'რატომ დავიწყე ეს გვერდი',
    'An introduction to Mikle, his studies, and the questions guiding his work.',
    'მაიკლის, მისი სწავლისა და მისი საქმიანობის მთავარი კითხვების გაცნობა.',
    '02:49', 'EN', '/images/reel-intro-en.jpg', 'upload',
    '/videos/intro-en.webm', '/videos/intro-en-browser.mp4', true, false, 3
  ),
  (
    'instagram-Db_kEjAJYNQ',
    'Why I started this page — in Georgian',
    'რატომ დავიწყე ეს გვერდი',
    'Mikle’s introduction, shared directly with his Georgian community.',
    'მაიკლის გაცნობა, მისი სწავლისა და საქმიანობის მთავარი კითხვები.',
    '02:56', 'KA', '/images/reel-intro-ka.jpg', 'upload',
    '/videos/intro-ka.webm', '/videos/intro-ka-browser.mp4', true, false, 4
  )
on conflict (id) do nothing;
