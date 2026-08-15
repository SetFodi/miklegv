# Mikle — Health as a system

A bilingual personal health-education website for Mikle Gvianidze, built with React, TypeScript, and Vite.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Mikle Studio

The private, non-technical content manager lives at `/admin`. Once connected to Supabase, Mikle can sign in with an approved email link and manage videos, thumbnails, publishing, ordering, bilingual page copy, the six health pillars, his biography, profile image, and logo. See [`CMS_SETUP.md`](./CMS_SETUP.md) for the one-time setup.

## Project content

- English and Georgian fallback copy and pillar content live in `src/App.tsx`.
- The visual system and responsive layouts live in `src/styles.css`.
- The four launch videos—two English and two Georgian—are stored locally in WebM with MP4 fallbacks, filtered by the selected site language, and play in the website’s native modal player.
- Mikle’s public Instagram profile image is stored locally in `public/images` so the design does not rely on expiring CDN links.

The health content is framed as general education and includes a visible medical disclaimer. Verify credentials and professional titles with Mikle before publishing publicly.
