# VarmaSite — Handoff & Pending Items

## What's Built and Working

### Public Website (bjpvarma.co.in)
| Feature | Status | Notes |
|---------|--------|-------|
| Homepage with welcome splash | Done | Auto-dismiss after 7s or click |
| Main slideshow (admin-managed) | Done | Drag-to-reorder, image upload |
| Biography section | Done | Editable via admin |
| Journey timeline | Done | Photo cards with drag reorder |
| Latest News (press releases) | Done | Auto-pulls from press data |
| Voices of Support (testimonials) | Done | 4 endorsements loaded |
| Foundation/CSR section | Done | Toggle ON/OFF in settings |
| Social media embeds | Done | Instagram, Twitter, YouTube via SociableKit |
| Yearly Reports section | Done | Downloadable report cards |
| Featured Press Carousel | Done | Shows items marked as featured |
| Press Release page | Done | Year/month filters, load more |
| Gallery page | Done | Load more pagination |
| Impact/Initiatives page | Done | Funding badge, official order links |
| Contact form | Done | Stores messages in admin |
| Newsletter subscription | Done | CSV export in admin |
| Floating WhatsApp button | Done | Links to WhatsApp |
| SEO (sitemap, robots.txt, meta) | Done | Auto-generated |
| Privacy Policy page | Done | Static content |
| Responsive design | Done | Mobile + desktop |
| Quotes Ticker | Done | Bilingual English + Telugu |
| Profile page | Done | Minister bio |

### Admin Portal (/admin/dashboard)
| Feature | Status | Notes |
|---------|--------|-------|
| Sidebar navigation | Done | Collapsible groups |
| Slideshow manager | Done | CRUD + drag reorder + image upload |
| Biography editor | Done | Text + image |
| Journey manager | Done | CRUD + drag reorder |
| Voices of Support manager | Done | Add/edit/delete testimonials |
| Quotes Ticker manager | Done | Bilingual quotes, toggle active |
| Impact/Initiatives manager | Done | Funding amount, official letter URL |
| Press Release manager | Done | isFeatured checkbox, slug auto-gen |
| Gallery manager | Done | Image upload + metadata |
| Yearly Reports manager | Done | CRUD |
| Foundation/CSR manager | Done | Simple cards with image/link |
| Make It Better (embedded) | Done | Taxonomy editor + office user management |
| Contact Messages | Done | Unread badge, expand to read, delete |
| Newsletter Subscribers | Done | View + CSV export |
| Site Settings | Done | ON/OFF toggles for homepage sections |

### Office Portal (/office)
| Feature | Status | Notes |
|---------|--------|-------|
| Login (email + password) | Done | No OTP for office users |
| Role-based access (ADMIN/AGENT/VIEWER) | Done | Tested with E2E suite |
| Ticket list with search/filter | Done | Mobile card layout + desktop table |
| Ticket detail with timeline | Done | Status stepper visualization |
| Status transitions | Done | CREATED > OPEN > IN_PROGRESS > RESOLVED > CLOSED |
| Ticket assignment | Done | ADMIN only |
| Priority management (P1-P4) | Done | With SLA calculation |
| ETA management | Done | Date/time picker |
| Ticket creation (office form) | Done | On behalf of citizens |
| Analytics dashboard | Done | Priority dist, resolution time, aging, ETA compliance |
| Toast notifications | Done | Replaced all alert() calls |
| Orange/saffron theme | Done | Matches main website |

### Public Grievance Form (/make-it-better)
| Feature | Status | Notes |
|---------|--------|-------|
| Citizen registration | Done | Email + password |
| Citizen login | Done | Token-based auth |
| Ticket submission | Done | Category, location, description, attachments |
| My Tickets tracking | Done | View status, add comments |
| Password reset | Done | Email-based OTP |

### Security
| Feature | Status | Notes |
|---------|--------|-------|
| CSRF protection | Done | Double-submit cookie on all mutations |
| JWT sessions | Done | httpOnly, secure, sameSite, 30min idle timeout |
| CSP headers | Done | Script/style/frame source restrictions |
| Rate limiting | Done | On all auth endpoints |
| bcrypt passwords | Done | Salt rounds: 10 |
| Input sanitization | Done | XSS prevention |
| HTTPS enforcement | Done | HSTS header |

### Testing
| Test | Status | Notes |
|------|--------|-------|
| E2E office portal (33 tests) | Passing | `npx tsx tests/office-e2e.ts` |
| Build verification | Passing | `npm run build` |

---

## What's Pending

### Priority 1: Deployment (Developer — 2-3 hours)
See [GCP_DEPLOYMENT_GUIDE.md](GCP_DEPLOYMENT_GUIDE.md) and [../MIGRATION_NOTES.md](../MIGRATION_NOTES.md) for the full runbook.

| Task | Who | Steps |
|------|-----|-------|
| One-time GCP setup (budget alert, enable APIs) | Developer | Guide Step 0 |
| Create Cloud SQL Postgres instance | Developer | Guide Step 1 |
| Create GCS buckets (public, private, backups) | Developer | Guide Step 2 |
| Create storage service account + JSON key | Developer | Guide Step 3 |
| Create GCE VM with static IP | Developer | Guide Step 4 |
| Run setup-gce.sh + place SA JSON | Developer | Guide Step 5 |
| Configure .env + build + start PM2 | Developer | Guide Steps 6–7 |
| Configure Nginx + smoke test on raw IP | Developer | Guide Steps 8–9 |
| Set up domain + SSL | Developer + Client | Client owns Namecheap account; developer configures DNS + certbot. Guide Steps 10–11 |
| Create admin user | Developer | Guide Step 13 |
| Set up DB backup cron | Developer | Guide Step 12 |

### Priority 2: Content (Client — ongoing)
| Task | Who | Notes |
|------|-----|-------|
| Add real press releases | Client (via admin portal) | Upload images, write summaries |
| Add gallery photos | Client (via admin portal) | High-res constituency photos |
| Update biography text | Client (via admin portal) | Current bio and achievements |
| Add journey milestones | Client (via admin portal) | Key career moments with photos |
| Add CSR initiatives | Client (via admin portal) | Foundation activities |
| Mark featured press items | Client (via admin portal) | For homepage carousel |
| Create office staff accounts | Client (via admin portal) | Make It Better > Office Access |

### Priority 3: Email Setup (Developer + Client — 1 hour)
| Task | Who | Steps |
|------|-----|-------|
| Create dedicated email | Client | e.g., noreply@bjpvarma.co.in via domain provider |
| Generate Gmail App Password | Client | Google Account > Security > App Passwords |
| Configure SMTP in .env | Developer | Set EMAIL_SMTP_* variables |
| Test email delivery | Developer | Submit a test contact form |

### Priority 4: Domain (Client — 30 min)
| Task | Who | Steps |
|------|-----|-------|
| Domain already registered | Client | bjpvarma.co.in (Namecheap) |
| Add A record | Client/Developer | Point @ and www to GCE VM static IP |
| Wait for DNS propagation | — | 5-30 minutes |
| Run certbot for SSL | Developer | `sudo certbot --nginx -d bjpvarma.co.in -d www.bjpvarma.co.in` |

### Priority 5: WhatsApp Business API (Client + Developer — 2-3 days)
| Task | Who | Steps |
|------|-----|-------|
| Create Meta Business Account | Client | business.facebook.com |
| Register WhatsApp Business phone | Client | Dedicated number for the office |
| Create message templates | Client | ticket_created, status_update, ticket_resolved |
| Wait for Meta approval | — | 24-48 hours |
| Configure env vars | Developer | WHATSAPP_ACCESS_TOKEN, PHONE_NUMBER_ID, etc. |
| Wire notification calls into ticket APIs | Developer | Call notifyTicketCreated(), notifyStatusUpdate() |

### Priority 6: Social Media Embeds (Client — 30 min)
| Task | Who | Steps |
|------|-----|-------|
| Create SociableKit account | Client | sociablekit.com |
| Create Instagram feed embed | Client | Get embed code |
| Create Twitter feed embed | Client | Get embed code |
| Create YouTube feed embed | Client | Get embed code |
| Set NEXT_PUBLIC_SOCIABLEKIT_* env vars | Developer | Paste embed codes |

---

## Future Enhancements (Phase 2+)

| Enhancement | Effort | Impact |
|-------------|--------|--------|
| WhatsApp OTP for citizen grievance form | 2-3 days | Prevents spam submissions |
| Cloud CDN in front of GCS public bucket | 1 hour | Faster image loading globally |
| SEO: JSON-LD structured data | 2-3 hours | Better Google search results |
| Google Search Console setup | 30 min | Track search traffic |
| Google Analytics integration | 30 min | Visitor analytics |
| Cloud Monitoring alerts (VM CPU, Cloud SQL health) | 1 hour | Server health alerts |
| Multi-language support expansion | 3-5 days | Hindi, other regional languages |
| Accessibility audit (WCAG) | 2-3 days | Screen reader compatibility |
| Performance optimization | 1-2 days | Lighthouse score improvements |

---

## Maintenance Procedures

### Regular Updates
```bash
# Deploy latest code (run on the GCE VM)
cd /var/www/varmasite
bash deploy/deploy.sh
```

### Database Backup (runs daily at 2 AM automatically)
```bash
# Manual backup (uses DATABASE_URL from .env to reach Cloud SQL)
bash deploy/backup-db.sh

# Restore from backup — point psql at Cloud SQL via the same DATABASE_URL
gunzip < backup-file.sql.gz | psql "$DATABASE_URL"
```
Cloud SQL also takes its own automated daily snapshots (configured at instance level). Console → SQL → varmasite-db → Backups to restore from those.

### SSL Certificate Renewal (automatic via certbot cron)
```bash
# Manual renewal if needed
sudo certbot renew
```

### Server Monitoring
```bash
pm2 status          # Check app health
pm2 logs varmasite  # View application logs
free -m             # Check memory
df -h               # Check disk space
```
