# Content Update Playbook — BJP Varma Website

**A complete how-to for updating every piece of content on the live site.**

Live site: **https://bjpvarma.co.in**
Admin login: **https://bjpvarma.co.in/admin**

For an at-a-glance overview, see the companion document `SITE_OVERVIEW_ONE_PAGER.md`.

---

## Before you start

1. **You need an Admin account.** Two are seeded: `mvsuneelkumar2903@gmail.com` and `bhupathirajusrinivasvarma@gmail.com`.
2. **Use a desktop browser** (Chrome, Edge, Firefox). The admin UI is not optimized for mobile.
3. **Have your image files ready** — sized per `IMAGE_DIMENSIONS_GUIDE.md`. Wrong sizes look stretched or pixelated.
4. **Every save goes live immediately.** Treat the admin like a live editor — there's no "publish" button, no draft state.
5. **If you make a bad change**, the nightly backup at 2:00 AM IST can restore everything. Call the developer.

---

## Logging in

1. Open **https://bjpvarma.co.in/admin** in your browser.
2. Enter your **email** as the username and your **password**.
3. Click **Login**. You land on the **Admin Dashboard**.

**Forgot your password?** Click **"Forgot password?"** on the login screen. Enter your email. A 6-digit code arrives at your Gmail in under a minute. Enter the code + a new password (minimum 8 characters). Done.

---

## 1. Homepage Slideshow

This is the big rotating photo carousel at the top of the homepage.

**Where:** Admin Dashboard → **Homepage Slideshow**

**To add a new slide:**
1. Click **Add New Slide**.
2. **Title** — short headline (3-8 words).
3. **Caption** — sub-text (one sentence).
4. **Image** — Click **Choose File**, select a JPG that is **1920 × 1080 pixels** (landscape, 16:9). Files larger than 5 MB will be rejected.
5. **Order** — Lower numbers appear first. Use multiples of 10 (10, 20, 30…) so you can insert later.
6. Toggle **Active** on.
7. Click **Save**.

**To edit/replace a slide:** Click the slide row → change fields or upload a new image → **Save**.

**To remove a slide:** Toggle **Active** off (recommended — keeps history) OR click **Delete** (permanent).

**Tips:**
- Keep slide count between 4-7 for best load time.
- Headline text overlays the image — pick photos with a less busy left side.

---

## 2. Press Releases / News

**Where:** Admin Dashboard → **Press Releases** (or **News & Updates**)

**To publish a new press release:**
1. Click **Add Press Release**.
2. **Title** — full headline as you want it displayed.
3. **Slug** — auto-generated from the title (the URL path, e.g. `varma-launches-housing-scheme`). You can edit it.
4. **Date** — when the event happened (not always today).
5. **Excerpt** — 2-3 sentence summary that shows on the listings page.
6. **Image** — featured image (**1200 × 630 pixels** recommended).
7. **Body** — full article. Use the rich-text editor's formatting buttons (bold, italic, headings, bullet lists, links).
8. Toggle **Published** on.
9. Click **Save**.

The release immediately appears on `/press-release` and links from the homepage news strip.

**To unpublish:** Toggle **Published** off. Stays in DB but not visible.

---

## 3. Initiatives

Initiatives are programs, schemes, action items shown in the Initiatives section.

**Where:** Admin Dashboard → **Initiatives**

**To add:**
1. Click **Add Initiative**.
2. **Title** — name of the program.
3. **Type** — category dropdown (e.g. Infrastructure, Welfare, Education).
4. **Date** — when launched (or planned).
5. **Description** — 1-2 paragraphs.
6. **Achievements** — bullet-point list of outcomes (one per line).
7. **Image** (optional) — **800 × 600 pixels**, used as the card thumbnail.
8. Toggle **Active** on.
9. **Save**.

**Order:** Initiatives sort by date descending (newest first) by default.

---

## 4. Speeches / Videos

**Where:** Admin Dashboard → **Speeches**

**To embed a video:**
1. Click **Add Speech**.
2. **Title** — name of the speech/talk.
3. **Date** — when delivered.
4. **Description** — short summary.
5. **Video URL** — **paste a YouTube URL** (e.g. `https://www.youtube.com/watch?v=ABC123`). The site auto-embeds the player.
6. **Thumbnail** (optional) — falls back to YouTube's auto-thumbnail if blank.
7. Toggle **Active** on.
8. **Save**.

**To replace a video:** Edit the entry → change the YouTube URL → **Save**.

---

## 5. Gallery

The photo gallery shows grouped image collections.

**Where:** Admin Dashboard → **Gallery**

**To add photos:**
1. Click **Add Gallery Item**.
2. **Category** — choose existing or create a new category name (e.g. "Public Events 2026").
3. **Image** — **1600 × 1200 pixels** (4:3) for best display in the grid.
4. **Caption** — short description.
5. **Order** — same logic as slideshow.
6. Toggle **Active** on.
7. **Save**.

**To group photos:** Use the same Category for related photos. They render together as a section.

---

## 6. Voices of Support (Endorsements)

**Where:** Admin Dashboard → **Voices of Support**

**To add an endorsement:**
1. **Name** — supporter's full name.
2. **Designation** — role/title (e.g. "Local Business Owner").
3. **Quote** — their endorsement (1-3 sentences).
4. **Photo** — square headshot, **400 × 400 pixels**.
5. Toggle **Active** on.
6. **Save**.

---

## 7. Profile / Biography

The long-form biography page at `/biography`.

**Where:** Admin Dashboard → **Biography**

This is one rich-text editor for the whole page. Edit any section, click **Save**. The page rebuilds.

**Headshot / hero image:** Upload a new file in the Hero Image field. Recommended **1200 × 800 pixels**.

---

## 8. Journey (Timeline)

Milestones shown as a timeline.

**Where:** Admin Dashboard → **Journey**

**To add a milestone:**
1. **Year** (e.g. 2024).
2. **Title** — what happened.
3. **Description** — 1-2 sentences.
4. **Image** (optional) — Journey images are auto-converted to **black & white** for visual unity. Upload color; the site handles conversion.
5. **Order within the year** if multiple events same year.
6. **Save**.

Milestones sort by Year descending (newest first).

---

## 9. Contact Information

Footer + Contact page details (phone, address, social media).

**Where:** Admin Dashboard → **MibSetting** → look for the contact / social keys

This one is more advanced — the developer can walk you through any field changes here. Most office teams won't need to touch this.

---

## 10. Make It Better — Public Form Categories

The list of categories citizens can choose when submitting a grievance.

**Where:** Admin Dashboard → **Make It Better** → **Public Form** tab (blue)

**Layout:** Left column = Categories. Right column = Sub-categories of the selected category.

**To add a new category:**
1. Type the name in the **"Add new category"** field (left column).
2. Click **Add**.
3. The category appears in the list.

**To add sub-categories:**
1. Click a category in the left column to select it.
2. Type a sub-category name in the right column's **"Add new"** field.
3. Click **Add**.

**To hide (not delete) a category:** Click the **eye icon** next to it. Hidden categories are kept in DB but don't show on the public form.

**Click Save when done.** Changes take effect on the citizen form within seconds.

---

## 11. Make It Better — Office Form Categories

Internal taxonomy for office tickets.

**Where:** Admin Dashboard → **Make It Better** → **Office Internal** tab (purple)

Same UI as Public Form, but these categories show only inside the office portal. The defaults (Constituency – Grievances, Parliament Matters, Office Administration, etc.) come pre-seeded.

**To customize:** Add/edit/hide categories same as Public Form.

---

## 12. Office Users (Office Team Onboarding)

**Where:** Admin Dashboard → **Make It Better** → **Office Users** tab (green)

**To add an office team member:**
1. Click **Create Office User**.
2. **Email** — their work or Gmail address.
3. **Full Name**.
4. **Role** — pick one:
   - **Office Viewer** — read-only, sees all grievances + analytics.
   - **Office Agent** — Viewer + can update ticket status, comment, assign.
   - **Office Admin** — Agent + can create more users.
5. **Initial Password** — at least 12 characters. They will be asked to verify their email on first login.
6. Click **Save**.

**To deactivate someone:** Toggle their **Active** flag off. They keep their data but can't log in.

**To reset their password:** Click the user row → **Reset Password** → enter a new 12+ character password → **Save**. (Or have them use the **Forgot password?** link on the office login page.)

---

## 13. Reviewing Citizen Grievances (Office Workflow)

This is what office staff do, not admin — included here for completeness.

**Where:** **https://bjpvarma.co.in/office/login**

After login:

1. **`/office/tickets`** — list of all grievances. Filter by status, category, priority.
2. Click any ticket → ticket detail page.
3. **Internal comments** — only office sees these. Use for notes between team members.
4. **Status** — Open → In Progress → Resolved → Closed.
5. **Assign** — pick which office member owns the resolution.
6. **ETA** — set a target date.
7. **Citizen-visible reply** — when you write a comment marked "Visible to Citizen", the citizen sees it in their `/make-it-better` portal.

---

## 14. Submitting an "Office Activity" Ticket

Office staff sometimes log their own work tickets (e.g. tracking a file in a ministry, a parliament question, a CSR proposal).

**Where:** **https://bjpvarma.co.in/office/activity**

1. **Category** — pick from the dropdown (Constituency – Grievances, Parliament Matters, Office Administration, etc.). This list is editable by Admin (see section 11).
2. **Type** — sub-category that appears once a Category is picked.
3. **Title** + **Description**.
4. **Priority** — P1 Critical → P5 Low.
5. **ETA** — target date.
6. **Owner / Assignee** — who's responsible.
7. Submit. Ticket joins the office queue.

---

## 15. Analytics

**Where:** **https://bjpvarma.co.in/office/analytics**

Shows:
- New grievances this week / month
- Resolution time histogram
- Top categories
- Office-staff performance (tickets resolved per agent)
- Open vs Closed split

This is **Office Admin** view. CMS admins also see it (because they're seeded as `OFFICE_ADMIN`).

---

## Image Size Cheat Sheet

| Where | Dimensions | Format | Max file size |
|---|---|---|---|
| Slideshow | **1920 × 1080** (16:9) | JPG | 5 MB |
| Press Release / News featured | 1200 × 630 | JPG | 5 MB |
| Initiative card | 800 × 600 | JPG/PNG | 3 MB |
| Gallery photo | 1600 × 1200 (4:3) | JPG | 5 MB |
| Voice of Support headshot | 400 × 400 (square) | JPG/PNG | 1 MB |
| Biography hero | 1200 × 800 | JPG | 5 MB |
| Journey milestone | 800 × 600 (color in — site converts to B&W) | JPG | 3 MB |
| Speech thumbnail (optional) | 1280 × 720 (16:9) | JPG | 3 MB |

Use any free online tool (TinyPNG, Squoosh) to compress before upload.

---

## Common pitfalls

| Problem | Fix |
|---|---|
| "I uploaded the image but it's cropped" | Image wasn't at the recommended aspect ratio — use a cropping tool to match the dimensions above before uploading. |
| "My slide doesn't show on the homepage" | Toggle **Active** is off, OR slide is set to inactive in the database. |
| "I changed a category but the public form still shows the old list" | Refresh the citizen form page (Ctrl+F5). Categories are cached for ~60 seconds. |
| "I can't delete a category that has tickets in it" | The system protects categories with attached data. Mark it **Hidden** instead — it disappears from new submissions but old tickets keep their category. |
| "Office staff can't see new grievances" | Check their role — Viewer/Agent/Admin all see all tickets; verify the user's **Active** toggle is on. |
| "The site is unreachable" | Check `https://status.cloud.google.com` for GCP outage. If GCP is fine, contact the developer. |

---

## Who to ask

| If you need help with… | Contact |
|---|---|
| Adding content, using the admin UI | Lead the office team / Admin who set up the site |
| Resetting a forgotten password | Use the **Forgot password?** link first — code arrives in ~30 seconds. If email isn't arriving, check Spam, then ask Admin to manually reset via the user manager. |
| Site is down, errors, anything technical | Developer (you should have their contact) |
| Adding a new admin user | Currently only the developer can seed a new top-level admin. Office users are self-serve from the Office Users tab. |

---

**Print this document or keep it bookmarked.** It covers 90 % of day-to-day operations. For the 10 % beyond — when in doubt, ask before clicking Delete.
