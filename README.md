# Lawer and Lawers Foundation

Next.js public website and staff dashboard, Express API, Firebase Authentication and Firestore. Cloudinary stores gallery image files. Existing styling is retained.

## Development and configuration

Install dependencies with `npm install` in `backend` and `frontend`; run `npm run dev` in each. Defaults: API port 4000, website port 3000. Node.js 20 or newer is required.

Backend `.env`:

```dotenv
PORT=4000
FRONTEND_URL=http://localhost:3000
PUBLIC_API_URL=http://localhost:4000
FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-service-account-private-key"
ADMIN_EMAILS=your-main-admin-email
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Put Cloudinary credentials from its console's API Keys page in the three backend variables. Restart the API after editing them. No Firebase Storage bucket or Blaze upgrade is needed for Cloudinary uploads. Cloudinary's free plan has usage limits; monitor them in its console. Keep the API secret and Firebase private key out of frontend code and Git.

Frontend `frontend/.env.local` needs `NEXT_PUBLIC_API_URL` and Firebase web configuration: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, and `NEXT_PUBLIC_FIREBASE_APP_ID`. Enable email/password sign-in in Firebase Authentication. Cloudinary needs no frontend credentials.

Firestore is required in normal operation. There is no silent local fallback on cloud errors. The temporary JSON store and local uploads are available only with both `NODE_ENV=test` and `DATA_BACKEND=local`.

## Firestore initialization

From `backend`, run `npm run setup:firestore` to add missing built-in roles, currency settings and profiles for existing configured main administrators. To also import missing content from the previous bundled JSON stores, run `npm run setup:firestore -- --migrate-local`. Existing records are preserved by ID. Review imported sample content before publication.

Collections include programs, stories, events, gallery, siteContent, donations, contacts, rsvps, staff, roles, settings and analyticsEvents. Image bytes live in Cloudinary; Firestore gallery documents contain public URLs, Cloudinary asset IDs, metadata and batch IDs.

`firestore.rules` denies direct client database access: requests go through the API and Firebase Admin SDK. Apply these rules to the project during deployment. `storage.rules` is retained for legacy Firebase Storage setups; new gallery uploads use Cloudinary.

## Staff and permissions

Sign in at `/admin/login` with Firebase email/password credentials. No shared default password is shipped. Existing account passwords are not readable from Firebase; use password recovery if needed.

Runtime access is bound to Firebase user IDs through provisioned `staff/{uid}` profiles. Email allowlists alone grant no access. The trusted `setup:firestore` utility resolves `ADMIN_EMAILS`/`SUPER_ADMINS` (and legacy publisher/event-manager lists) to existing Firebase users and creates missing profiles; it never replaces existing assignments. Provisioned main administrators retain protected full access. CEO has every permission by default. Managers initially manage content, gallery and events, and view analytics. Publishers initially manage content and gallery; event managers manage events. Unassigned accounts have no staff permissions.

Use **Staff Accounts** to create Firebase Authentication accounts and assign roles. Initial passwords must be at least 12 characters and are never stored in Firestore or sent by email. Use **Roles & Permissions** to create custom roles and toggle feature view/manage access. Role changes are enforced on every API request; dashboard permissions refresh on navigation, focus and periodically. Staff cannot grant privileges they do not possess, change their own role, or modify protected main administrators. The CEO role is configurable by another sufficiently privileged administrator.

## Pledges and currencies

Donors submit pledges and contact the administrator for payment details. The app does not collect payments, accept payment webhooks or imply that a pledge has been paid.

Use **Currencies** to add supported ISO currencies, enable or disable choices, and set the default. Donors select from enabled currencies. Amounts are checked against each currency's decimal precision. Reports keep totals separate by currency; no currency conversion is performed. Legacy pledges without a currency use GHS. Initially only GHS is enabled.

## Gallery and videos

**Gallery** accepts up to 20 JPEG, PNG or WebP images per batch, 5 MB per file and 50 MB total. Files are signature-checked before uploading; Cloudinary performs image processing validation. A batch uses a shared category and description, with optional numbered titles. The browser sends each file directly to Cloudinary using a short-lived server signature, avoiding the Vercel request-body limit. Only small authorization and completion requests pass through the backend. The backend verifies provider metadata before publishing each image. Successful images remain saved when another fails; retry processes the remaining images and skips reuploading files whose upload already succeeded. Keep the page open to retain retry state. Cancel and select files again if authorization expires after one hour. Interrupted or rejected uploads can leave unpublished assets in Cloudinary; review those in its console. Verification consumes Cloudinary Admin API quota. No unsigned upload preset is required.

The existing content editor media library uses the same storage service. Removing a published gallery entry unpublishes its metadata but retains the underlying image, because a story may reference it. Delete unreferenced assets in Cloudinary when appropriate to reclaim quota.

Add YouTube, Vimeo or direct HTTPS MP4/WebM URLs through the gallery's video mode. Videos play inside the gallery using embeds or a native player. The video host must permit embedding and playback. Videos are linked, not uploaded to Cloudinary.

## Website visit analytics

The dashboard shows page views, sessions, unique browser visitors, daily activity, popular pages and referring hosts for a selected period of up to 90 days. Tracking starts when this version is deployed; historical visits cannot be reconstructed. A session expires after 30 minutes of inactivity. Counts are estimates and do not identify individual people or exclude every bot.

Admin pages are excluded. The tracker honors browser DNT/GPC preferences and stores neither raw IP addresses nor URL queries in Firestore. Browser identifiers are hashed before storage. Each report is limited to 50,000 events and shows a notice if that limit is reached.

Events include `expiresAt` timestamps for 90-day retention. The TTL policy in `firestore.indexes.json` is **not automatically deployed**. Enable the analyticsEvents/expiresAt TTL policy only after reviewing Firebase plan requirements; without it, events remain until manually deleted. No paid cloud feature is enabled by this application.

## Verification

```text
backend:  npm test
backend:  npm run build
frontend: npm run lint -- --max-warnings 0
frontend: npm run build
```

Tests use temporary local data and mocked providers, never live donor records. They cover authentication rejection, permissions and CEO defaults, staff provisioning and rollback, currencies, pledge integrity, batch image validation, Cloudinary upload/cleanup, video URLs, analytics deduplication, event capacity and registration deduplication.

## Security hardening and rollout (September 2026)

Security fixes must be deployed to both Vercel projects to affect the live site. Dependencies were updated to Next.js 16.3.6, Firebase Web 12.19.0 and Firebase Admin 14.5.0. Backend Google clients use a scoped CommonJS-compatible uuid 11 override; gaxios uses its unchanged v4 API. Both package audits should be checked after future dependency updates.

Before deploying the form protection, configure a free Cloudflare Turnstile widget for the frontend hostname. Set `TURNSTILE_SECRET_KEY` in the backend and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in the frontend, in both local environment files and their respective Vercel projects. The site key is public; the secret is backend-only. Hostname and action are validated server-side, and Cloudflare rejects reused or expired tokens. Production forms intentionally reject submissions if verification is unavailable or keys are missing. Only isolated tests (`NODE_ENV=test` plus `DATA_BACKEND=local`) bypass the external provider. Never deploy with these test settings.

Contact, pledge and RSVP submissions have a Firestore-backed limit of 10 requests per client address per 15 minutes and a cap of 1,000 verified submissions per form per day. Analytics has 120 requests per client per minute and 10,000 events per day. Limits use atomic Firestore transactions shared across Vercel instances, with no in-memory production fallback. Vercel's overwritten forwarding header is trusted only when running on Vercel; other hosts use the socket address. Client addresses are keyed hashes, never stored in plain text. `RATE_LIMIT_SECRET` may be set to a strong random backend secret; otherwise the Firebase private key is used as the HMAC key. Rate-limit documents reuse their IDs across windows and have expiry metadata; no paid TTL feature is enabled automatically. Traffic still consumes backend/Firestore resources, so these controls are not a substitute for edge protection during a large attack.

New RSVP requests have `pending` status and do not reserve seats. Event managers confirm or reject them in Events & Registrations after checking the contact details. Only confirmation counts toward capacity; simultaneous approvals are checked atomically. Existing registrations without a status remain confirmed. Public requests are limited to five attendees; contact the administrator for larger groups. No verification or confirmation emails are sent automatically.

Frontend and API responses prevent external framing. The frontend CSP restricts embedded frames, objects, base URLs and form destinations; it does not claim a strict nonce-based script policy. Rich text is sanitized before insertion into the editor and again before the API stores stories. Contact and site-content updates accept only documented fields; page content currently supports the existing `home` and `about` structures.

Verification: `npm test` and `npm run build` in both projects, plus frontend `npm run lint -- --max-warnings 0`. Tests include sanitizer payloads, permission boundaries, input schemas, bot-token failures, rate limits and pending RSVP approvals.

The backend pins `jwks-rsa`'s nested `jose` to 5.10.0, which supports CommonJS. Version 6 is ESM-only and fails in Vercel runtimes without native `require(esm)` support. Keep this scoped override until the upstream/runtime incompatibility is resolved. The runtime regression test starts the compiled backend with `--no-experimental-require-module` and checks RSA signing-key conversion, health and CORS. Run the backend build before tests.

The sanitizer also uses a scoped `htmlparser2` 10.1.0 override: its 12.x release is ESM-only. The same strict CommonJS startup test loads the sanitizer, and sanitizer regression tests verify that executable markup is removed.
