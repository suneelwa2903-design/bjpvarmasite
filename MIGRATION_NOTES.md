# Migration Notes — AWS → GCP

Why the repo looks the way it does after the migration. Read this before searching for files that don't exist anymore or wondering why an env var was renamed.

## TL;DR

The app moved from AWS (EC2 + S3, possibly Amplify at some point) to GCP (Compute Engine + Cloud SQL + Cloud Storage). Same architecture pattern — single VM running PM2 + Nginx, managed Postgres, object storage for uploads — different provider.

## Storage: two buckets, not one

The original AWS setup used a single public-read S3 bucket for everything that gets uploaded. The migration split that into two buckets with different access posture:

| Bucket | Contents | Access | What's stored in the DB |
|---|---|---|---|
| `varmasite-public` | CMS images (homepage slideshow, initiative photos, press images) | Public-read (`allUsers:objectViewer`) | The full `https://storage.googleapis.com/...` URL — same shape as the old S3 URL. |
| `varmasite-uploads` | MIB ticket attachments (citizen grievance documents, IDs, photos) | **Private** (public-access-prevention). Read via short-lived v4 signed URLs only. | The bare GCS object key (e.g. `uploads/mib/photo-1730000000000.webp`). |

**Why two:** CMS images render on the anonymous public homepage — making them private would require server-side URL signing on every page render, which is slow and pointless (the images are *meant* to be seen by everyone). MIB attachments are citizen grievance evidence — making them public was always wrong and the migration fixes that. The `MibTicketAttachment.storageUrl` column kept its name; its content semantics changed from "URL" to "object key".

## Read-path signing for MIB attachments

Wherever the office/admin UI surfaces a citizen attachment, the server transforms the stored object key into a freshly-minted v4 signed URL (1-hour expiry) before handing it to the client. Implementation: [src/lib/storage.ts](src/lib/storage.ts) exports `signAttachments(items[])`, called from:

- [src/app/admin/tickets/[ticketNo]/page.tsx](src/app/admin/tickets/[ticketNo]/page.tsx) (admin detail page)
- [src/app/office/tickets/[ticketNo]/page.tsx](src/app/office/tickets/[ticketNo]/page.tsx) (office detail page)
- [src/app/api/mib/tickets/admin/route.ts](src/app/api/mib/tickets/admin/route.ts) (admin list API → `GrievancesManager.tsx`)
- [src/app/api/mib/tickets/[ticketNo]/details/route.ts](src/app/api/mib/tickets/[ticketNo]/details/route.ts) (shared detail API)

`signAttachments` is defensive: if the stored value already looks like a URL (`http(s)://...` or a local-dev `/...` path), it passes through unchanged. Only bare object keys get signed. That means dev (which writes to `public/uploads/mib/...` on local disk) works without any GCS config, and any legacy URL-shaped rows from before the migration would still render. The new prod DB shouldn't have any such rows — but the fallback costs nothing.

## Admin auth gap — discovered and fixed during migration

The discovery step (Phase 1) flagged that `src/app/admin/tickets/[ticketNo]/page.tsx` had **no server-side auth guard**. In the AWS world that was bad-but-recoverable: attachments were public anyway, so the only leak was ticket metadata (status, comments, citizen name).

In the new world, signed-URL privacy means the page itself does the signing. An unauthenticated visitor who guesses a ticket URL would get freshly-minted signed URLs to citizen grievance documents handed to their browser. That turned an existing posture gap into a migration-induced regression.

Fixed in this migration: both `src/app/admin/tickets/page.tsx` (list) and `src/app/admin/tickets/[ticketNo]/page.tsx` (detail) now call `getCurrentSession()` at the top and `redirect('/admin')` on a miss — verbatim mirror of the office page's existing pattern. The list page change wasn't strictly required by the signing model (no attachments in the list view), but the same posture gap leaked citizen PII at scale, and treating both pages with one fix kept the admin section consistent.

Other parts of the admin section (the dashboard, the various managers) are client components that gate themselves via API-route 401s. Those weren't touched by this migration.

## Env var rename map

| Old (AWS) | New (GCP) | Notes |
|---|---|---|
| `S3_BUCKET` / `AWS_S3_BUCKET` | `GCS_PUBLIC_BUCKET` + `GCS_PRIVATE_BUCKET` | Two buckets now (see above). |
| `S3_ACCESS_KEY_ID` / `AWS_ACCESS_KEY_ID` | *(removed)* | Service-account JSON instead. |
| `S3_SECRET_ACCESS_KEY` / `AWS_SECRET_ACCESS_KEY` | *(removed)* | Same. |
| `REGION` / `AWS_REGION` | *(removed)* | GCS region is bucket-bound; not passed to SDK. |
| *(new)* | `GOOGLE_APPLICATION_CREDENTIALS` | Path to service-account JSON on disk. |
| *(new)* | `GCP_PROJECT_ID` | Used by `gcloud` and for clarity. |
| *(new)* | `GCS_BACKUP_BUCKET` | Used by `deploy/backup-db.sh`. |
| `DATABASE_URL` | `DATABASE_URL` | Same name; value now points at Cloud SQL private IP. |
| `RUNTIME_DATABASE_URL`, `DATABASE_URL_RUNTIME`, `POSTGRES_URL` | *(removed)* | Amplify-era fallback chain in `src/lib/prisma.ts`. Pruned. Only `DATABASE_URL` is read now. |
| All `SMTP_*` / `EMAIL_*` | unchanged | Gmail SMTP carries over. |
| All `SESSION_*` / `COOKIE_*` | unchanged | Generate fresh `SESSION_SECRET` for the new env (`openssl rand -hex 32`). |
| All `WHATSAPP_*` | unchanged | |
| All social `*_API_KEY` / `*_ACCESS_TOKEN` | unchanged | Owner confirmed these are still wanted. |

## Where the AWS-specific stuff used to live

These files were deleted during the migration. If you're hunting for one, it's gone:

| Deleted | What it was | Replaced by |
|---|---|---|
| `amplify.yml` | AWS Amplify Hosting build spec | — (Amplify isn't used) |
| `deploy/AWS_DEPLOYMENT_GUIDE.md` | EC2 deployment runbook | [deploy/GCP_DEPLOYMENT_GUIDE.md](deploy/GCP_DEPLOYMENT_GUIDE.md) |
| `deploy/setup-ec2.sh` | Ubuntu/EC2 bootstrap (installed Postgres on-box) | [deploy/setup-gce.sh](deploy/setup-gce.sh) (no Postgres server — Cloud SQL) |
| `scripts/migrate-to-postgres.md` | SQLite → AWS RDS migration doc | — (fresh DB; no migration needed) |
| `src/lib/s3.ts` | AWS S3 SDK wrapper | [src/lib/storage.ts](src/lib/storage.ts) (GCS, two-bucket aware, signing helper) |
| `package.json: @aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` | AWS SDK deps | `@google-cloud/storage` |
| `package.json: pptxgenjs`, `jspdf`, `html2canvas` | Were used only by `deploy/create-pptx.js` (a one-off client-presentation generator) | — (script and deps removed; unrelated to app runtime) |
| `deploy/VarmaSite_Billing_Scope.pdf`, `deploy/VarmaSite_Client_Presentation.pptx`, `deploy/create-billing-pdf.py`, `deploy/create-pptx.js` | Client-billing artifacts | — (unrelated to deployment; deleted as cleanup) |
| `package-lock.json` | Stale lockfile from AWS-era node_modules | — (regenerated by `npm install` on the VM during Step 7 of the deploy guide; commit the fresh one to git) |

## Backup story changed

Old: `pg_dump | gzip` → local `/var/backups/` → `aws s3 cp` to `varmasite-backups` S3 bucket. Single source of truth.

New: `pg_dump | gzip` → local `/var/backups/` → `gcloud storage cp` to `gs://varmasite-backups/db-backups/`. **Plus**: Cloud SQL has its own automated backups configured at the instance level (7-day retention, 02:00 IST window). The cron script is belt-and-suspenders against losing the Cloud SQL instance itself.

## Citizen session — added during pre-prod audit

The original code identified citizens via `?email=` / `?mobile=` query params on read endpoints and matching values in the body of write endpoints, with no server-side session. That was a CRITICAL IDOR: anyone who knew a citizen's email could read all their tickets or post comments as them. Closed during the security audit.

Citizens now get a real signed-JWT session in an `httpOnly` `mib-session` cookie ([src/lib/mibCitizenSession.ts](src/lib/mibCitizenSession.ts)), mirroring the admin (`admin-session`) and office (`office-session`) patterns. Set on successful `POST /api/mib/auth/login` and on `POST /api/mib/auth/verify` (auto-login after OTP). Cleared by `POST /api/mib/auth/logout`. Same 30-min idle / 24-h absolute timeouts as office.

Two user-facing consequences worth knowing:

1. **Anonymous citizens can still file a grievance.** `POST /api/mib/tickets` is unchanged — the public submission form does not require login.
2. **Attaching evidence files requires login.** `POST /api/mib/upload` now requires any one of `mib-session`, `office-session`, or `admin-session`. Anonymous uploads → 401. The public ticket form ([src/components/mib/TicketForm.tsx](src/components/mib/TicketForm.tsx)) checks `/api/mib/me` on mount and shows a "Log in to attach evidence files" prompt instead of the file picker when no session exists. This trade-off closes a storage-DoS attack surface (anyone hitting `/api/mib/upload` could fill the bucket); citizens motivated to attach evidence are motivated to do a one-time email+OTP registration.

`localStorage` keys (`mibUserName`, `mibUserEmail`, `mibUserMobile`) are still written by the citizen login response and read by the form for prefill/greeting. They are **UI convenience only** — never trusted server-side anymore.

## Lessons from the pre-prod audit

**Any DB column storing JSON should have schema validation at the write boundary.** Phase 2 surfaced a crash on `/admin/make-it-better` traced to a Phase-2 smoke-test PUT that wrote `{"taxonomy":{}}` into the `taxonomy_public` MibSetting row. The route's PUT had no shape check; the page's GET happily served the bogus value; the editor blew up trying `.filter()` on an object. Audited 2026-06-06 — only `taxonomy_public` and `taxonomy_office` MibSetting keys exist; both share the single write route (`PUT /api/mib/settings/taxonomy`) which now has a shape guard rejecting non-`Record<string, string[]>` bodies. **If new JSON-blob columns are added later (other MibSetting keys, other models with `String @db.Text` JSON fields), repeat this audit and guard the write boundary.**

## Contact form — three notification surfaces

Submissions to `/api/contact` produce three notifications:

1. **Admin email** — sent to `EMAIL_FROM` (or fallback `SMTP_USER`) with subject `[BJPVarma.co.in] New Contact: <subject>` and the full submission as an HTML table.
2. **Submitter confirmation** — sent to the email the submitter typed in, branded "We received your message — BJP Varma Office".
3. **CMS list** — every submission appears in the admin Contact Messages manager regardless of SMTP state.

The two email surfaces only fire when SMTP is configured. **In local dev SMTP is unset**, so you only see things in the CMS list — that's expected, not a bug. On the GCP VM, populate `EMAIL_SMTP_HOST`/`EMAIL_SMTP_USER`/`EMAIL_SMTP_PASS`/`EMAIL_FROM` per `env.example` and all three start working.

If you later want additional channels (Slack ping, WhatsApp ping to office, unread-count badge in the admin sidebar), that's a future feature add — pick the channels and we'll wire them.

## Known post-launch follow-ups

Items surfaced during the pre-prod audit that were triaged as non-blocking and deferred. Each has a sketched fix shape so the next pass can move quickly.

### MEDIUM — No office-portal commenting UI
The office ticket-detail page at [src/app/office/tickets/[ticketNo]/page.tsx](src/app/office/tickets/[ticketNo]/page.tsx) renders existing comments but has no form to post one. The only comment-posting route, `POST /api/mib/tickets/[ticketNo]/comments`, gates on `getCurrentSession()` (CMS admin only), so even if a form were added, it would 403. Office staff today can only attach a `note` to a status change — that note goes to `MibTicketEvent.note` (an audit-trail string), not to `MibTicketComment.bodyHtml`. **Fix shape**: relax the comments route to also accept `getOfficeSessionUser()` (with VIEWER excluded since they can't mutate), then add a small comment form to the office page. Mirror the visibility-toggle UI from the admin manager.

### LOW — Anonymous ticket creation locks out future registration
[src/app/api/mib/tickets/route.ts:80-86](src/app/api/mib/tickets/route.ts:80) upserts a `MibUser` row keyed by email when an anonymous submitter files a ticket. The row gets `role: 'CITIZEN'` but **no `passwordHash` and no `emailVerifiedAt`**. If the same person later calls `POST /api/mib/auth/register` with the same email, the route hits the existing row and returns 409 "Email already registered." The user is locked out from registering with their own email; they can still file additional tickets anonymously, but can't claim and manage them. **Fix shape**: on register, if the existing row has no `passwordHash`, treat the request as an account-claim — set `passwordHash` from the request, send a verification OTP, mark `emailVerifiedAt` only after OTP verification. Make sure the existing tickets stay associated via the unchanged user ID.

### Phase 3 deferred items

- **MEDIUM-P3-2** — Routes that call `request.json()` and rely on a try/catch around the whole handler return **500 instead of 400** on a malformed body. Affects `/api/contact`, `/api/mib/auth/login`, `/api/admin/auth`, and others. Logs get noisy; no data leak, no exploit. **Fix shape**: introduce a `parseJsonBody(req): Promise<{ok: true, body} | {ok: false, response}>` helper that returns 400 cleanly; apply across all `request.json()` call sites.
- **MEDIUM-P3-3** — Same root cause: wrong `Content-Type` (e.g. `application/x-www-form-urlencoded` to a JSON route) also lands as 500. The same `parseJsonBody()` helper covers it.
- **LOW-P3-1 / LOW-P3-2** — Null bytes (U+0000) and RTL-override characters (U+202E) are tolerated through `sanitizeText`. Safe today because the strings only reach React text rendering (auto-escaped) or `sanitizeHtml`. A scope-warning comment now lives at [src/lib/security/sanitize.ts](src/lib/security/sanitize.ts) explicitly listing the call-site requirements (filename / shell / `dangerouslySetInnerHTML` paths must validate independently).

### Other deferred items (from Phase 1 audit)
- **MEDIUM** — Auth enumeration messages (distinct errors for "Email not verified" vs "Invalid credentials" etc.) across `/api/mib/auth/login`, `/api/mib/auth/register`, `/api/office/auth/request-otp`. Cosmetic, not exploitable in isolation.
- **MEDIUM** — Stateless JWT logout: a copied cookie value remains cryptographically valid until `exp`. Real browsers discard the cleared cookie. **Fix shape**: per-user `sessionVersion` column; verifier rejects mismatched versions; logout increments. Enables real "kick a session" after password change.
- **MEDIUM** — `e?.message` echoed in 500 responses across ~12 routes. Can leak Prisma schema details. **Fix shape**: `respondError(req, e, fallbackMessage)` helper that logs server-side and returns a fallback to the client in production.
- **MEDIUM** — Upload routes trust client-supplied `file.type`; `sharp` falls back to original buffer on processing failure for images, so mislabeled types still land. **Fix shape**: magic-byte sniff on the first ~16 bytes against the claimed MIME, reject on mismatch.
- **LOW** — `sanitizeEmbedCode()` in [src/lib/security/sanitize.ts:78-91](src/lib/security/sanitize.ts:78) allows `<script>`. Today only consumes operator-controlled env vars (`NEXT_PUBLIC_SOCIABLEKIT_*_EMBED`). Rename to `embedHtmlPassthrough` to make the trust assumption explicit.
- **LOW** — Bcrypt rounds inconsistency: hashing call sites use 10, the dedicated `password.ts` helper enforces 12+. Either consolidate to one helper or document the rationale.
- **LOW** — `SESSION_SECRET_SECONDARY` is exported but never read by the verifier. Rotation appears designed but isn't wired.
- **LOW** — CSP has `'unsafe-eval'` plus `'unsafe-inline'` in `script-src`. Investigate which third-party widget needs `'unsafe-eval'`; nonce-gate `'unsafe-inline'`.
- **LOW** — HMAC comparison in [src/lib/whatsapp.ts:135](src/lib/whatsapp.ts:135) uses `===` instead of timing-safe compare. Practically infeasible to exploit over the network.
- **LOW** — PATCH `/api/office/admin/users` doesn't validate the `role` field against the enum. Minor.

## What this migration did NOT do

- Database data migration. The AWS instance is dead, no data to preserve. Cloud SQL starts empty. `prisma migrate deploy` builds the schema from scratch on first deploy.
- Containerization. No Dockerfile was added. The app still runs as `next start` under PM2. A future move to Cloud Run is possible but is a separate project.
- CI/CD. There's no `.github/workflows/` directory. Deployments are still manual: SSH in, `bash deploy/deploy.sh`. Add CI later if it earns its keep.
- Provisioning automation (Terraform / Pulumi). Everything in [deploy/GCP_DEPLOYMENT_GUIDE.md](deploy/GCP_DEPLOYMENT_GUIDE.md) is console clicks + `gcloud` commands. Fine for a single VM; revisit if the topology grows.
