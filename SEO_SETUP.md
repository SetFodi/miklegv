# Search engine launch checklist

The site exposes two canonical, crawlable language pages:

- English (United States): `https://miklegvianidze.vercel.app/en`
- Georgian (Georgia): `https://miklegvianidze.vercel.app/ka`

The root page points search engines to the English canonical. The private Studio is served with an `X-Robots-Tag: noindex` header.

## Google Search Console

1. Add `miklegvianidze.vercel.app` as a URL-prefix property, or add the final custom domain as a Domain property.
2. Complete ownership verification. DNS verification is preferred for a custom domain.
3. Open **Sitemaps** and submit `https://miklegvianidze.vercel.app/sitemap.xml`.
4. Use **URL inspection** for `/en` and `/ka`, run **Test live URL**, and request indexing.
5. Test both URLs with Google's Rich Results Test and confirm the `ProfilePage` and `Person` entities are detected without errors.

## Bing Webmaster Tools

1. Add the site, or import the verified property from Google Search Console.
2. Open **Sitemaps** and submit `https://miklegvianidze.vercel.app/sitemap.xml`.
3. Inspect and submit `/en` and `/ka` through URL Inspection.
4. Enable IndexNow later if the site begins publishing new pages frequently. The current two-page sitemap is sufficient for this small site.

## After adding a custom domain

Replace `https://miklegvianidze.vercel.app` in these files, rebuild, and redeploy:

- `src/seo.ts`
- `index.html`
- `en/index.html`
- `ka/index.html`
- `public/robots.txt`
- `public/sitemap.xml`

Then add the custom domain to Google Search Console and Bing Webmaster Tools and resubmit the sitemap. Do not keep both hosts as independent canonical sites.
