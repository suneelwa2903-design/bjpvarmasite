# VarmaSite — Manual UAT Checklist

This is a browser-only walk-through that exercises the parts of the app that automated tests can't verify well: visual layout, email delivery to real inboxes, mobile responsiveness, etc. Allow **30–60 minutes** end to end. Run after the dev server is up but before the GCP cutover.

If anything below doesn't match the expected behavior, stop and note it — that's a bug to fix before deploy.

---

## Before you start

You'll need:

1. **Dev server running.** `npm run dev` → opens on `http://localhost:3003`.
2. **A real email address** you can check (Gmail is fine). One you don't mind getting a few test emails to.
3. **A second email address** on a different provider (Outlook / Yahoo / iCloud) — to confirm emails aren't landing in spam on more than one provider.
4. **A mobile device or browser dev-tools responsive mode** — so you can check the mobile experience.
5. **Test credentials** (pre-seeded for this UAT):

   | Role | Email / username | Password |
   |---|---|---|
   | CMS admin | `test-admin` | `TestPass123!` |
   | Office admin | `office-admin@test.local` | `TestPass123!` |
   | Office agent | `office-agent@test.local` | `TestPass123!` |
   | Office viewer | `office-viewer@test.local` | `TestPass123!` |
   | Citizen A | `citizen-a@test.local` | `TestPass123!` |
   | Citizen B | `citizen-b@test.local` | `TestPass123!` |

6. **One pre-seeded test ticket** belonging to Citizen A: `TEST-A-001` (one belonging to Citizen B: `TEST-B-001`).

Open `http://localhost:3003` in your browser and let's go.

---

## Part 1 — Anonymous visitor (≈10 min)

### 1.1 Homepage on desktop

- [ ] Open `/` in a desktop-width browser (≥ 1280 px wide).
- [ ] Watch the welcome splash auto-dismiss after ~7 seconds, or click to dismiss it manually. **Both** behaviors should work.
- [ ] **Header**: orange-saffron color scheme, BJP Varma profile photo, role labels (Union Minister of State + MP for Narsapuram), Prime Minister link, settings gear.
- [ ] **Nav**: HOME / IMPACT / PRESS RELEASE / GALLERY / MAKE IT BETTER FOR PEOPLE / CONTACT. Hover effects work.
- [ ] **Hero slideshow**: at least one image renders sharp (not blurry, not pixelated, not over-compressed). Click the prev/next arrows — slides change. Click the small dot indicators — slides change.
- [ ] **Quote ticker** below the header: shows quotes in both English and Telugu, scrolling/cycling.
- [ ] **Biography section**: photo on left, text on right. Long bio is readable. "Download Profile" button is clickable.
- [ ] **Journey timeline**: photo cards with captions. Pagination arrows work; dot indicators work.
- [ ] **Latest News (press)**: 3 articles with dates and "Read More" links. Each "Read More" leads to a working press-release detail page.
- [ ] **Voices of Support**: testimonial cards with at least one quote from a named supporter (e.g. N. Chandrababu Naidu).
- [ ] **Yearly Reports** section: at least one report card with a download link (the link itself may 404 if no PDF is uploaded — that's fine for UAT).
- [ ] **Foundation / CSR** section: visible if the admin toggle is ON; otherwise hidden cleanly (no broken layout gap).
- [ ] **Social media embeds** at the bottom (Instagram / Twitter / YouTube). They may render empty if SociableKit env vars aren't set — that's OK; the issue is whether the layout still looks clean.
- [ ] **Floating WhatsApp button** bottom-right.
- [ ] **Footer**: "BHARATIYA JANATA PARTY · BJPVARMA.CO.IN" centered.

### 1.2 Homepage on mobile (≤ 480 px)

Use your phone, or Chrome dev-tools → device toolbar → iPhone or Pixel preset.

- [ ] Page is fully usable, no horizontal scroll.
- [ ] Nav collapses to a hamburger menu; clicking opens the menu; tap-to-close works.
- [ ] Hero slideshow images are cropped sensibly (no awkward whitespace, no important content cut off).
- [ ] Biography text wraps at a readable size.
- [ ] All buttons are tappable (no microscopic tap targets).
- [ ] Floating WhatsApp button doesn't overlap with content awkwardly.

### 1.3 Other public pages

Visit each and confirm it loads to a sensible-looking page:

- [ ] `/biography` — full bio page.
- [ ] `/initiatives` — list of impact items, "Read More" links work.
- [ ] `/press-release` — paginated list of press items, year/month filters work.
- [ ] `/gallery` — image grid, "Load More" works if there are enough items.
- [ ] `/profile` — minister profile.
- [ ] `/speeches`, `/events` — list pages render even if empty (no error).
- [ ] `/contact` — contact form with name / email / subject / message fields.
- [ ] `/privacy-policy` — static page.
- [ ] `/search` — at minimum loads (empty search shows an empty state).
- [ ] `/make-it-better` — citizen grievance landing page with login / register tabs.

### 1.4 Anonymous form submissions

**Contact form**:
- [ ] Fill name / your-real-email / subject / message. Submit.
- [ ] Page shows a success state.
- [ ] **Check your real inbox**: a "We received your message" email arrives within 1–2 minutes. It's branded (orange header, name in the subject area). NOT in spam.
- [ ] Try submitting again immediately — works for 4 more submissions, then on the 6th you should see a "Too many submissions" rate-limit message. (Rate limit is per-IP; using a single browser counts as one IP.)
- [ ] After a successful submission, also test: name field with `<script>alert(1)</script>Mallory`. Submit. NO alert box should pop up in your browser. The email confirmation should arrive with just `Mallory` in the name (script tag stripped).

**Newsletter signup** (if visible on homepage / footer):
- [ ] Enter your email. Submit. Confirmation visible. Email arrives (if SMTP is configured).

**Anonymous grievance** (the public ticketing form):
- [ ] Go to `/make-it-better`. Click "Submit a Grievance" or equivalent.
- [ ] Fill the form *without* registering: name, mobile, real email, category (e.g. "Infrastructure Grievance" → "Roads"), state Andhra Pradesh, district West Godavari, subject, description.
- [ ] In the Attachments section, you should see a message like **"Log in to attach evidence files"** — NOT a file picker. This is the post-audit behavior: anonymous submissions are allowed but require login to attach.
- [ ] Submit. Confirmation message shows a ticket number (`MIB-YYMM-XXXXX`).
- [ ] Note that ticket number — you'll check it from the admin side later.

---

## Part 2 — Citizen (≈10 min)

### 2.1 Citizen registration

- [ ] Go to `/make-it-better` → "Register" tab.
- [ ] Use a fresh email you haven't registered before (a Gmail alias like `youraddress+uatcitizen@gmail.com` is perfect).
- [ ] Fill name, email, mobile (10 digits, India), password (≥ 8 chars), accept terms. Submit.
- [ ] You're shown an "Enter OTP" form.
- [ ] **Check your inbox**: a verification code email arrives. Copy the 6-digit code.
- [ ] Paste the code into the OTP form. Submit.
- [ ] You should now be **automatically logged in** — no separate login screen. (Post-Wave-2 auto-login.)

### 2.2 Citizen file ticket WITH attachment

- [ ] Now that you're logged in, go to the submit-grievance flow again.
- [ ] The Attachments section should now show a **file picker** instead of the "Log in to attach" prompt.
- [ ] Pick a real image file (any PNG / JPG). Fill the rest of the form. Submit.
- [ ] Confirmation with ticket number. Note it.

### 2.3 "My Tickets"

- [ ] Go to `/make-it-better/my-tickets`.
- [ ] You should see your two tickets (the anonymous one if you used the same email, plus the one with attachment).
- [ ] You should NOT see Citizen A's or Citizen B's tickets — only yours.
- [ ] Click on one of your tickets. Status / subject / category visible.

### 2.4 Logout

- [ ] Click "Sign Out" in the my-tickets header.
- [ ] You're returned to `/make-it-better`.
- [ ] Try navigating directly to `/make-it-better/my-tickets` — you should see "Please login to view your tickets."

---

## Part 3 — Office staff (≈15 min)

Test each role separately. Open a fresh incognito window for each so cookies don't bleed.

### 3.1 Office AGENT

- [ ] Open incognito, go to `/office/login`. Log in with `office-agent@test.local` / `TestPass123!`.
- [ ] Ticket list loads. You can see all tickets (including yours from Part 2 and `TEST-A-001` / `TEST-B-001`).
- [ ] Click into `TEST-A-001`. You can VIEW it.
- [ ] Try to change status. **You should be blocked** (button missing, or click → 403 / error) because the ticket isn't assigned to you yet.
- [ ] Try to change priority — same, blocked.
- [ ] Try to set ETA — same, blocked.

### 3.2 Office ADMIN — assignment + state machine

- [ ] Fresh incognito → log in as `office-admin@test.local`.
- [ ] Ticket list loads. Open `TEST-A-001`.
- [ ] **Assign** it to office-agent (use the assignment dropdown / UI).
- [ ] Transition the status **CREATED → OPEN**. Confirmation visible.
- [ ] **OPEN → CLOSED** — should be REJECTED (invalid state-machine jump).
- [ ] **OPEN → IN_PROGRESS** — works.
- [ ] **IN_PROGRESS → RESOLVED** — works.
- [ ] **RESOLVED → CLOSED** — works.
- [ ] **CLOSED → OPEN** — should be REJECTED.
- [ ] Set the ticket back to OPEN by editing in DB or using the admin override path (so Part 3.3 has something to work with). If not feasible, skip this re-open step.

### 3.3 Office AGENT — now-assigned ticket

- [ ] Back to the AGENT incognito window. Refresh `TEST-A-001` detail.
- [ ] Status / priority / ETA controls are now ENABLED.
- [ ] Change the status — works.
- [ ] Change priority — works.
- [ ] Set an ETA — works. Try setting ETA in the past — note what happens (the UI may or may not block it; if it accepts a past date, that's worth noting as a UX concern).

### 3.4 Office VIEWER

- [ ] Fresh incognito → log in as `office-viewer@test.local`.
- [ ] Ticket list loads.
- [ ] Open `TEST-A-001`. You can VIEW it.
- [ ] Status / priority / ETA / assignment controls should be **disabled or hidden**. If clicking any of them sends a request, expect a 403.

### 3.5 Office user directory PII gating

- [ ] As ADMIN (open incognito): in the user-management UI, you should see all office users **with their email and mobile**.
- [ ] As VIEWER or AGENT: you should NOT see emails or mobile numbers in any user list (just name and role). This was a Wave-1 fix.

---

## Part 4 — CMS admin (≈10 min)

### 4.1 Admin login

- [ ] Fresh incognito → go to `/admin`.
- [ ] Username `test-admin`, password `TestPass123!`. Log in.
- [ ] Redirected to `/admin/dashboard`.

### 4.2 Direct-URL admin gate (post-C5 layout guard)

- [ ] In a **non-incognito** browser without an admin session, try to visit:
  - `/admin/dashboard`
  - `/admin/make-it-better`
  - `/admin/tickets`
  - `/admin/tickets/TEST-A-001`
- [ ] **Each one should redirect** to `/admin` (login page). NOT render the page contents to an anonymous visitor.

### 4.3 Sidebar navigation

Back in the admin incognito window:

- [ ] Sidebar groups collapse/expand correctly.
- [ ] Click each manager in turn:
  - Slideshow Manager
  - Biography
  - Journey
  - Voices of Support
  - Quotes Ticker
  - Impact / Initiatives
  - Press Release
  - Gallery
  - Yearly Reports
  - Foundation / CSR
  - Make It Better (embedded — should load `/admin/make-it-better` in the iframe)
  - Contact Messages
  - Newsletter Subscribers
  - Site Settings
- [ ] Each one renders without errors. The data table or grid populates.

### 4.4 Slideshow round-trip

- [ ] Slideshow Manager → "Add Slide" or "Upload Image".
- [ ] Pick a real image file. Upload.
- [ ] The image appears in the slide list with a thumbnail.
- [ ] Save / publish.
- [ ] Open `/` in another tab. Refresh. The new slide appears in the homepage hero slideshow. If the slide is set to active=true.
- [ ] Back in the manager, drag to reorder slides. Save. Refresh homepage. New order reflected.
- [ ] Delete the test slide. Refresh homepage. It's gone.

### 4.5 Press release create / publish

- [ ] Press Release Manager → "Add Article".
- [ ] Fill: title, source, date, snippet, body. Mark as featured.
- [ ] Optional: upload an image.
- [ ] Save.
- [ ] Visit `/press-release` (anonymous tab). The new article appears. Click it → detail page loads.
- [ ] Featured items should appear in the homepage "Featured Press Carousel" (if your test article is recent + featured).
- [ ] Delete the test article.

### 4.6 Contact messages viewer

- [ ] Contact Messages Manager → see the list including the message you submitted from Part 1.4.
- [ ] Click to expand a message. Body is readable as plain text.
- [ ] If you tested the `<script>` payload in Part 1.4, that message should display the literal text "Mallory" — no script execution, no broken HTML.
- [ ] Delete a test message — it disappears from the list.

### 4.7 Newsletter subscribers

- [ ] Newsletter Subscribers Manager → list of emails.
- [ ] Click "Export CSV" — a `.csv` file downloads, opens cleanly in Excel / Sheets / Numbers.

### 4.8 Site Settings toggles

- [ ] Site Settings panel → turn OFF "Foundation/CSR" toggle. Save.
- [ ] Refresh homepage in the anonymous tab. The Foundation section is gone.
- [ ] Turn it back ON. Refresh. Section returns.

### 4.9 Make It Better admin section

- [ ] `/admin/make-it-better` (or via sidebar). Taxonomy editor visible.
- [ ] Try adding a category. Save. Confirmation. Refresh the citizen-side grievance form — new category appears in the dropdown.
- [ ] Office Access section → create a new test office user. **Password is now a required field** with a "must be ≥8 characters" rule. Try empty → blocked. Try `short` → blocked. Use a real strong password → created. Verify you can log in as that new user from `/office/login`.
- [ ] Delete the test office user.

---

## Part 5 — Cross-role spot checks (≈5 min)

### 5.1 Session isolation

- [ ] Open admin dashboard in one tab (admin session cookie).
- [ ] In a different tab in the same browser, visit `/office/tickets/TEST-A-001` directly.
- [ ] You should be redirected to `/office/login`. The admin session doesn't grant office access.

### 5.2 Email delivery to a second provider

- [ ] Repeat Part 1.4 contact-form submission, but use your second email address (the non-Gmail one). Check that inbox: confirmation email arrives, NOT in spam.

### 5.3 Print stylesheets (if applicable)

- [ ] On the admin ticket detail page, hit Print / Cmd-P / Ctrl-P. The print preview should be readable — no nav clutter, no overlapping text.

---

## What's NOT in this checklist (and why)

These need staging or are otherwise out of scope:

- **GCS upload** — can only be tested after the GCP deploy. Local dev writes files to `public/uploads/mib/` instead. Phase 5 of the original test brief covers staging.
- **Signed URL expiry on private bucket** — same; GCS only.
- **WhatsApp inbound webhook** — needs a real Meta Business Manager configuration + a tunnel. Test after deploy.
- **Rate-limit lockout duration** — verifiable but slow; the in-process counter would need 15+ minutes to fully reset.
- **SMTP from the actual production server** — local dev uses whatever SMTP is in `.env.local`. The deployed VM will use whatever you put in its `.env`. Run one contact-form submission post-deploy as a smoke test.

---

## When something fails

Note three things and hand them to the developer:
1. **What you did** — the exact click path, with the URL bar.
2. **What you expected** — what this checklist said should happen.
3. **What actually happened** — exact error message or "page froze" or screenshot.

A specific report ("clicked 'Save' on the new slideshow slide; got 500 error in dev console; URL was `/api/admin/upload`") is fixable in minutes. A vague report ("CMS is broken") isn't.

When every box above is checked, the app is UAT-ready for GCP deploy. Move to `deploy/GCP_DEPLOYMENT_GUIDE.md`.
