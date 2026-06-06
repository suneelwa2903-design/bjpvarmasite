# Office Team Quickstart — BJP Varma Website

Welcome. This guide is for the office team that manages day-to-day content on **bjpvarma.co.in**. You don't need to be technical to follow it. Read the section that matches what you want to do.

If you get stuck, the website's developer can help — note down exactly what you clicked and what happened, then send that.

---

## 1. Logging in

There are **two separate places** to log in, depending on what you need to do.

### Content management (CMS) — `https://bjpvarma.co.in/admin`

Use this to edit the public website: slideshow, biography, news, gallery, events, etc.

1. Open `https://bjpvarma.co.in/admin` in your browser.
2. Enter your email and password.
3. You'll be taken to the admin dashboard.

### Office portal (grievances) — `https://bjpvarma.co.in/office/login`

Use this to handle citizen grievances submitted through "Make It Better".

1. Open `https://bjpvarma.co.in/office/login`.
2. Enter your office email and password.
3. You'll see the ticket list.

### Which one do I use?

| You want to… | Use |
|---|---|
| Add a press release, photo, or biography update | `/admin` |
| Edit the website's slideshow or initiatives | `/admin` |
| View a citizen's grievance | `/office/login` |
| Change a ticket's status or assign it to someone | `/office/login` |

Some people have access to **both**. If you do, they're separate logins — your password may even be different between the two.

### Forgot your password?

For now: contact whoever set up your account. (A self-serve password reset for office accounts may be added later.)

---

## 2. First-week priorities — make the site look "alive"

Right after launch, the website needs basic content so visitors don't see empty sections. Do these in this order:

1. **Slideshow** — upload 3 to 5 hero images. Without these, the homepage looks broken. See Section 5.
2. **Biography photo and text** — replace the placeholder. See Section 5.
3. **Latest 3-5 press releases** — even if they're older items, the homepage news section needs content. See Section 3.
4. **At least 3 initiatives** — under Impact, fill in current constituency or ministry work. See Section 5.
5. **A few gallery photos** — recent constituency visits. See Section 5.

Aim to do all of the above in the first week. After that, you're in maintenance mode — add new items as they happen.

---

## 3. Adding a press release

Press releases appear in three places on the public site: the homepage news section, the `/press-release` listing page, and the featured carousel (if you mark it featured).

1. Log in at `/admin` and open the dashboard.
2. In the sidebar, click **Press Release** (under "Content").
3. Click **+ Add Article** (or similar — the button at the top of the manager).
4. Fill in:
   - **Title** — clear and short.
   - **Source** — newspaper name, or "BJP Varma Office" for official statements.
   - **Date** — publication date.
   - **Summary** — 1-2 sentences that show up under the title in the news list.
   - **Body** — the full text or your summary.
   - **External link** — if it's a third-party article, link to the source.
   - **Featured** — toggle this on if you want it in the homepage carousel.
   - **Thumbnail image** — see `IMAGE_DIMENSIONS_GUIDE.md` for sizes. The CMS shows the right dimensions above the upload field.
5. Click **Save**.
6. Open `/press-release` in another tab to confirm it appears.

### Tips

- **Use the same thumbnail dimensions every time** so the news section looks consistent. The CMS suggests 1920 × 1080 JPEG.
- If you have a PDF press statement, you can attach it too via the "Upload PDF (optional)" field.
- Don't add the same item twice — search the existing list first.

---

## 4. Adding a news article or linking to an initiative

The "News" section on the homepage and on each initiative page reuses press release content. You don't need to add news separately — adding a press release is enough.

If you want a news article to also appear inside an Initiative's page:

1. Open the **Initiatives** manager in the admin CMS.
2. Find the initiative.
3. Edit it.
4. Scroll to "Linked news articles" (or similar) — select the press release(s) that relate to this initiative.
5. Save.

The press release will now show on both `/press-release` and inside the initiative's detail view.

---

## 5. Updating slideshow / biography / initiatives / journey / events / gallery / foundation

All of these work the same way. Open the relevant manager from the admin sidebar, follow the prompts.

Each section has an inline guidance box above the file-input that tells you the recommended photo dimensions and a one-line crop tip. The full reference is in `IMAGE_DIMENSIONS_GUIDE.md` at the root of this codebase.

### Section-by-section quick notes

- **Slideshow**: The most important photos. They rotate at the top of the homepage. Use vibrant photos with a clear subject. Max 5-6 active slides.
- **Biography**: One photo, one block of text. Take your time to write it once well.
- **Initiatives (Impact)**: Each initiative is a card with title, summary, photos, and an optional official letter. Mark as "constituency" or "ministry".
- **Journey**: The timeline section on the homepage. **Photos are automatically displayed in black & white** — still upload colour photos; the site converts.
- **Events**: Upcoming and past events. Status: "Upcoming" or "Past". Photos optional.
- **Gallery**: Just photos. Lighter to manage. People can click to see full size.
- **Foundation / CSR**: Your foundation activities. Each card has a title, description, image, and optional external link.

### Reordering items

Most managers support drag-to-reorder (look for the grip handle on the left of each row). Drag to change order; save when done.

### Show/hide without deleting

Most items have an "Active" toggle. Turning it off hides the item from the public site without deleting it — useful when content is outdated but you may want it back.

---

## 6. Managing contact form messages

When someone fills in the "Write to Us" form on the contact page, three things happen:

1. The message lands in the admin CMS under **Contact Messages**.
2. An email is sent to the office admin email (configured in production).
3. The submitter gets an automatic "We received your message" confirmation.

To view incoming messages:

1. Log in at `/admin`.
2. In the sidebar, click **Contact Messages**.
3. You'll see a list, newest first. Unread ones are marked.
4. Click a message to see the full body.
5. After replying (via your regular email), mark the message as read or delete it.

### Tips

- Don't reply *inside* the CMS — there's no "reply" feature. Reply from your office email account directly to the sender's email address shown.
- If you receive spam, just delete it.
- The CMS shows you everything that came in — there's no separate inbox to check.

---

## 7. Newsletter subscribers

Visitors who sign up for the newsletter (via the footer form) have their email saved.

To view subscribers:

1. Log in at `/admin`.
2. In the sidebar, click **Newsletter Subscribers**.
3. You'll see the list of emails and dates.
4. **Export CSV** button (if available) downloads the list — open in Excel or Google Sheets to send a mass email through your preferred tool.

> Note: The website does **not** send newsletter emails automatically. It collects subscribers; you send the actual newsletter from a tool of your choice (Mailchimp, Brevo, your own Gmail, etc.). If automated sending is needed, that's a future feature add — discuss with the developer.

---

## 8. Office staff workflow (Make It Better grievances)

This is the back-office side of the citizen grievance portal.

### Logging in

1. Go to `https://bjpvarma.co.in/office/login`.
2. Enter your office email and password.
3. You'll see the **ticket list** — all citizen grievances, newest first.

### Viewing a ticket

1. Click a ticket from the list.
2. You'll see: applicant details (name, mobile, email, location), the category and subject, the description, and any attached photos or documents.

### Changing a ticket's status

The workflow is:

```
NEW → OPEN → IN_PROGRESS → RESOLVED → CLOSED
```

Optional: any open ticket can be set to **NEED_INFO** if you need more information from the citizen. When they reply, it goes back to OPEN automatically.

1. Open the ticket.
2. Click the **Status** dropdown (top right or sidebar).
3. Choose the next valid status.
4. **A comment is required when you change status.** Write a short note explaining what you did or what's pending.
5. The citizen is automatically notified by email.

### Adding a comment

- **External comment** — visible to the citizen. Use this for updates you want the citizen to see.
- **Internal comment** — visible only to office staff. Use this for notes between teammates.

### Assigning a ticket

- Only **OFFICE_ADMIN** users can assign tickets.
- Open the ticket, click the **Assign To** dropdown, choose a teammate.
- Once assigned, the assigned person can change the status. Other agents cannot.

### Role differences

| Role | Can view tickets | Can comment | Can change status | Can assign | Can create office users |
|---|---|---|---|---|---|
| OFFICE_VIEWER | ✓ | — | — | — | — |
| OFFICE_AGENT | ✓ | ✓ (on assigned tickets) | ✓ (on assigned tickets) | — | — |
| OFFICE_ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ |

### Setting an ETA

For tickets where the citizen has been told "we will get back to you by X", set an ETA so it's tracked.

1. Open the ticket.
2. Click the **ETA** field.
3. Pick a future date.
4. Save.

### Setting priority

Tickets default to P2 (medium). Mark genuinely urgent items as P1 — but reserve P1 for things that actually need same-week attention.

---

## 9. What citizens see (Make It Better — public side)

Helpful to know, so you can guide citizens or anticipate their questions.

1. A citizen visits **`/make-it-better`** on the website.
2. They can either **submit a grievance anonymously** (without registering), or **register an account** to track their tickets.
3. To register: email + mobile + password → an OTP is emailed → they verify → they're logged in.
4. Filing a grievance: pick category, fill location, write a description, optionally attach evidence files.
   - Anonymous submitters can't attach files — they're prompted to log in first if they want to attach.
5. After submission, they see a ticket number (`MIB-YYMM-NNNNN`).
6. Logged-in citizens can visit **`/make-it-better/my-tickets`** to see the status of all their submissions.
7. When status changes or office adds an external comment, they get an email notification.
8. If status is set to **NEED_INFO**, they can reply with additional details directly through the portal.

---

## 10. Common gotchas and how to get help

### Image upload fails

- Check the file size. Max 5 MB.
- Check the file type. JPEG, PNG, WebP, or PDF (for press only).
- See `IMAGE_DIMENSIONS_GUIDE.md` for the recommended dimensions.

### Photo looks cropped or blurry on the live site

- Crop: subjects too close to the edge get cut off. Re-upload with the subject in the centre.
- Blurry: the original photo was too small. Upload at 1920 × 1080 or larger.

### Page shows "Loading…" forever

- Refresh once. If it keeps happening, contact the developer with the URL.

### A teammate needs office access

- Only an OFFICE_ADMIN can create new office users.
- Go to `/admin/make-it-better` → "Office Access" or "Users" section.
- Add the user with their name, email, role, and a strong starting password (≥8 characters).
- Share the credentials with the teammate via a secure channel (not WhatsApp or unencrypted email). They can change the password after first login.

### Getting help

When you hit something you can't solve from this guide:

1. Note the **URL** you were on.
2. Note **what you clicked**.
3. Note **what the screen said** (or a screenshot).
4. Send those three things to the developer. Specific reports get fixed in minutes; vague "it's broken" reports take longer.

---

## Where to find more

- **Image dimensions** for every section: `IMAGE_DIMENSIONS_GUIDE.md` in this codebase.
- **Privacy / Terms / Cookies / Disclaimer / Accessibility** pages: linked at the bottom of every public page.
- **Technical setup, deployment, migration history**: `MIGRATION_NOTES.md`, `deploy/GCP_DEPLOYMENT_GUIDE.md` — these are for the developer, not the office team.

Welcome to the team. Take it slow at first — get used to one section before tackling the next. The site is yours to manage now.
