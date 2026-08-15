# Mikle Studio setup

The private studio is available at `/admin`. It uses Supabase for passwordless authentication, content storage, and video/image uploads.

## One-time setup

1. Create a Supabase project.
2. Apply `supabase/migrations/20260816000000_initial_mikle_studio.sql` using the Supabase GitHub integration, CLI, or SQL editor.
3. In the SQL editor, grant Mikle access with the following command, replacing the example address with his actual email. Do not commit his private email to this public repository.

   ```sql
   insert into public.site_admins (email)
   values ('MIKLE_EMAIL_HERE')
   on conflict (email) do nothing;
   ```

4. In Supabase Authentication → URL Configuration, add the production site URL and `https://YOUR_DOMAIN/admin` as allowed redirect URLs. Keep `http://localhost:5173/admin` for local development.
5. Copy `.env.example` to `.env.local` and add the project URL and public anon key:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
   ```

   Use the browser-safe publishable key, never a secret or legacy `service_role` key. The app still accepts the legacy `VITE_SUPABASE_ANON_KEY` name as a temporary fallback for older projects.

6. Restart the development server or redeploy the site.

The included `vercel.json` keeps `/admin` working when opened directly or returned to from a magic sign-in link. If another static host is used, configure its equivalent single-page-app rewrite for `/admin`.

## What Mikle can manage

- Add Instagram Reels that play inside the website.
- Upload MP4/WebM videos that use the site’s native player.
- Upload or replace thumbnails.
- Save drafts, publish videos, feature a video in the homepage hero, choose language and duration, reorder, edit, or delete.
- Edit homepage, system, library, biography, credentials, six pillars, closing message, and disclaimer in English and Georgian.
- Replace the logo and profile photograph and edit his display name, location, and Instagram URL.

Only email addresses present in `public.site_admins` can open the studio or mutate content. Public visitors can only read published content.
