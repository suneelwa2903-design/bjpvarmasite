# BJP Varma Website — How It Works

**One-page overview for the office team and decision-makers.**

Live site: **https://bjpvarma.co.in**

---

## What you're running

A single website with **three side-by-side experiences**, each behind its own login:

| Experience | URL | Who logs in | What they do |
|---|---|---|---|
| **Public site** | `https://bjpvarma.co.in/` | Anyone — no login | Reads bio, news, initiatives, watches videos, sends a contact message, submits a citizen grievance |
| **Make It Better** (citizen portal) | `https://bjpvarma.co.in/make-it-better` | Citizens (self-register with email + OTP) | Submit grievances, track their own ticket, add comments |
| **Office Portal** | `https://bjpvarma.co.in/office/login` | Office staff (created by admin) | View incoming citizen grievances, assign owners, set status, write internal updates, log own office tickets |
| **Admin (CMS)** | `https://bjpvarma.co.in/admin` | Site admin (2 named accounts) | Update everything visible on the public site, manage office team users, configure category lists for both portals |

You never share logins across these. The three sessions are isolated — an admin cookie does not give office access and vice versa.

---

## The 4 people in the system

1. **Public visitor** — no account, reads the site.
2. **Citizen** — self-signs-up at `/make-it-better/register`, verifies email with a 6-digit code, then can submit and track grievances.
3. **Office staff** — accounts created by Admin from `/admin/make-it-better` → **Office Users** tab. Three role levels:
   - **Office Viewer** — can read all grievances + analytics, can't edit.
   - **Office Agent** — Viewer + can change ticket status, assign, comment.
   - **Office Admin** — Agent + can create/delete other office users.
4. **CMS Admin** (you) — full keys. Two accounts:
   - `mvsuneelkumar2903@gmail.com`
   - `bhupathirajusrinivasvarma@gmail.com`

Both admins can also log into the Office portal with the same email (they're seeded as `OFFICE_ADMIN` too).

---

## What the Admin (CMS) can update from one place

Log into `https://bjpvarma.co.in/admin` → you land on the **Admin Dashboard**. A left-side menu lists every editable area:

- **Homepage Slideshow** — the big rotating photos at the top
- **Initiatives** — schemes, programs, action items
- **Press Releases** — news posts with images
- **Speeches** — video embeds + descriptions
- **Gallery** — photo grid sections
- **Voices of Support** — endorsements
- **Profile / Biography** — long-form profile content
- **Journey** — milestones timeline
- **News & Updates** — short news cards on homepage
- **Make It Better** — categories, sub-categories, and Office users (3 tabs)
- **MibSetting** — system-level settings (rarely touched)

Every save goes live immediately. There's no staging — what you save is what visitors see.

---

## What gets a 6-digit code by email

Three flows send a 6-digit OTP to email (codes expire in 15 minutes):

1. **Citizen sign-up** — verify email before first login.
2. **Forgot password** for citizen, office, and admin — all three login pages have a "Forgot password?" link.
3. **Office account creation** — when an admin creates an office user, that user gets an invite-style email and verifies on first login.

Emails go through Gmail SMTP using a configured app password.

---

## Where the data lives

| What | Where |
|---|---|
| All page content (slides, news, profile, etc.) | Google Cloud SQL (PostgreSQL) |
| Public images (slides, photos) | Google Cloud Storage bucket `varmasite-public` (publicly readable) |
| Private citizen attachments (PDFs, ID proofs, etc.) | Google Cloud Storage bucket `varmasite-uploads` (private — signed URLs, valid 1 hour) |
| Nightly database backups | Google Cloud Storage bucket `varmasite-backups`, kept 7+ days |
| Application code | GitHub: `github.com/suneelwa2903-design/bjpvarmasite` |
| Web server + Next.js app | Google Compute Engine VM `varmasite-app` (zone `asia-south1-a`) |
| Domain | `bjpvarma.co.in` via Namecheap, A-record points at `34.14.221.245`, HTTPS via Let's Encrypt (auto-renews) |

---

## Day-to-day, what you actually do

| Want to… | Go to |
|---|---|
| Change a slide on the homepage | `/admin` → Homepage Slideshow → edit/upload |
| Post a press release | `/admin` → Press Releases → New |
| Reply to a citizen grievance | `/office/tickets` → click the ticket → write internal comment, change status |
| Onboard a new office staffer | `/admin` → Make It Better → **Office Users** tab → Create user |
| Add a new grievance category | `/admin` → Make It Better → **Public Form** (or **Office Internal**) tab |
| Look at how many grievances were filed this week | `/office/analytics` |
| Change your own password | `/admin` (login page) → **Forgot password?** OR a future Settings page |

---

## What happens if…

| Scenario | What we do |
|---|---|
| Site is slow or down | Check `https://status.cloud.google.com`, check VM is running in GCP console, then SSH and `pm2 status` |
| You forgot the admin password | Click **Forgot password?** on the `/admin` login page. Code goes to your registered Gmail. |
| You accidentally deleted content | The nightly backup from 2:00 AM IST is in `gs://varmasite-backups/db-backups/`. Restore is a Cloud SQL operation — call the developer. |
| A new office staffer can't log in | Verify they exist in `/admin` → Make It Better → Office Users. Reset their password from the same panel. |
| A citizen says they didn't get the verification code | Check Spam/Promotions. Their email exists in DB. They can request a resend from the registration page. |

---

For the full step-by-step on **how to update each item**, see **`CONTENT_UPDATE_PLAYBOOK.md`** (the companion document).
