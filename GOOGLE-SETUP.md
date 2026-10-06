# Google Search Console and Analytics

Deploy the frontend changes to Vercel after setting these frontend environment variables for Production:

```dotenv
NEXT_PUBLIC_SITE_URL=https://lawersfoundation-ten.vercel.app
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOUR_MEASUREMENT_ID
GOOGLE_SITE_VERIFICATION=YOUR_HTML_TAG_CONTENT
```

Replace both placeholder IDs with your account's values. Do not include HTML around the verification value. Keep NEXT_PUBLIC_API_URL pointed at the production backend, because the sitemap reads public stories and events from it. Use your primary custom domain instead of the Vercel domain if you have moved the site. Redeploy after changing environment variables. Leave the GA ID blank on preview deployments to avoid mixing test visits with production.

## Search Console

1. Open https://search.google.com/search-console and add a **URL prefix** property for `https://lawersfoundation-ten.vercel.app/`.
2. Choose **HTML tag** under ownership verification. Copy only the `content` value into `GOOGLE_SITE_VERIFICATION` in the frontend Vercel project.
3. Redeploy, then click Verify in Search Console. The application generates the verification meta tag in the page head; no verification HTML file is necessary.
4. In Sitemaps, submit `sitemap.xml`.

After deployment the generated files are:

- https://lawersfoundation-ten.vercel.app/sitemap.xml
- https://lawersfoundation-ten.vercel.app/robots.txt

The sitemap includes public static routes and current stories/events, excluding admin and API routes. It reads the backend on each request. If the backend is unavailable it fails rather than publishing an incomplete sitemap. Restore backend availability and retry submission in that case. Admin pages allow crawling so search engines can see their noindex metadata; authentication remains the access control.

## Google Analytics 4

1. Open https://analytics.google.com and create or select a GA4 property.
2. Under Admin → Data streams, create/select a Web stream for the frontend URL.
3. Copy the stream's **Measurement ID** (`G-...`) into `NEXT_PUBLIC_GA_MEASUREMENT_ID` and redeploy.
4. **Turn off Enhanced measurement for this stream.** This integration sends page views explicitly for Next.js navigation. Automatic history-based page views would double-count visits and could capture admin URLs or query strings.
5. Open the public website and check Analytics → Realtime. Navigate between public pages to confirm page views arrive. Tracking blockers and browser privacy preferences can suppress events.

No sitemap is submitted to Analytics. The integration reports public page views, excludes admin pages, omits query strings/fragments and reduces external referrers to their origin. It respects Do Not Track and Global Privacy Control. Advertising signals are disabled. The existing dashboard analytics remains independent. No consent banner is added by this change.

References: https://support.google.com/webmasters/answer/7451001 and https://developers.google.com/analytics/devguides/collection/ga4/views
