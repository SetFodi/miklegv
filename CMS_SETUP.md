# Mikle Studio setup

The private studio is available at `/admin`. It uses Supabase for email-and-password authentication, content storage, and video/image uploads.

## One-time setup

1. Create a Supabase project.
2. Apply every SQL file in `supabase/migrations` in filename order using the Supabase GitHub integration, CLI, or SQL editor.
3. In the SQL editor, grant Mikle access with the following command, replacing the example address with his actual email. Do not commit his private email to this public repository.

   ```sql
   insert into public.site_admins (email)
   values (lower('MIKLE_EMAIL_HERE'))
   on conflict (email) do nothing;
   ```

4. In Supabase Authentication → URL Configuration, add the production site URL and `https://YOUR_DOMAIN/admin` as allowed redirect URLs. Keep `http://localhost:5173/admin` for local development. These callbacks are used only for first-time password setup and forgotten-password recovery.
5. Copy `.env.example` to `.env.local` and add the project URL and public anon key:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
   ```

   Use the browser-safe publishable key, never a secret or legacy `service_role` key. The app still accepts the legacy `VITE_SUPABASE_ANON_KEY` name as a temporary fallback for older projects.

6. Restart the development server or redeploy the site.

The included `vercel.json` keeps `/admin` working when opened directly or returned to from a password setup link. If another static host is used, configure its equivalent single-page-app rewrite for `/admin`.

## Set the first passwords

If an approved owner has already entered through a magic link, their browser session is still valid. Open `/admin`, choose **Account**, and set a permanent Studio password before signing out.

If the browser is already signed out, choose **Set or reset password** on the Studio login screen. Supabase sends one setup email; the link returns to a page that collects the new password. Normal logins after that use the email and password immediately and do not send email.

An email must exist under Supabase **Authentication → Users** before password recovery can be used. For a brand-new owner, use **Add user** in that dashboard to create or invite the account, and keep the same email in `public.site_admins`. Never add a public sign-up form or place a secret/service-role key in the website.

## What Mikle can manage

- Add Instagram Reels that play inside the website.
- Upload MP4/WebM videos that use the site’s native player.
- Upload or replace thumbnails.
- Save drafts, publish videos, feature a video in the homepage hero, choose language and duration, reorder, edit, or delete.
- Edit every visible public-site label and message in English and Georgian: navigation, preloader, hero, buttons, ticker, system, library, video player, biography, credentials, six pillars, closing section, footer, and disclaimer.
- Edit browser/search metadata and accessibility labels without touching code.
- Replace the logo and profile photograph and edit his display names, short wordmarks, bilingual locations, Instagram handle, and Instagram URL.

Only email addresses present in `public.site_admins` can sign in to the Studio or mutate content. Password reset requests are checked against the same allowlist before an email is sent. Public visitors can only read published content.
