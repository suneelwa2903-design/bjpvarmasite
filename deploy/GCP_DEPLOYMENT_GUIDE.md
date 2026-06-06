# VarmaSite GCP Deployment Guide

This is the runbook for a fresh deployment of VarmaSite onto Google Cloud. Steps 0–4 are owner-executed in the GCP console / from a laptop. Steps 5+ run on the VM.

## Architecture

```
User → Namecheap DNS → GCE VM (Nginx + Next.js + PM2)
                          │
                          ├─→ Cloud SQL Postgres 16 (private IP, same VPC)
                          ├─→ GCS varmasite-public  (CMS images, public-read)
                          └─→ GCS varmasite-uploads (MIB attachments, private + signed URLs)

           Cron on the VM ─→ pg_dump → GCS varmasite-backups (private, 7-day retention)
```

Everything lives in `asia-south1` (Mumbai).

## Cost (after $300 credit exhausts)

| Service | Monthly |
|---|---|
| Compute Engine e2-small (24/7) | ~$13 |
| Cloud SQL db-g1-small (24/7) | ~$25 |
| Cloud SQL storage (10 GB SSD) | ~$1.70 |
| Cloud Storage (public + private + backups) | ~$0.20 |
| Egress (~10 GB/month) | ~$1.20 |
| Static external IP (attached, in-use) | $0 |
| **Total** | **~$41/month** |

If too high, downgrade Cloud SQL to `db-f1-micro` (~$8) or self-host Postgres on the VM (saves $25). $300 credit gives ~7 months but **expires at 90 days regardless of balance** — plan accordingly.

---

## Step 0: One-time setup (~10 min)

In Cloud Console:

1. **Billing → Budgets & alerts → Create budget**: $50/month, alerts at 50% / 90% / 100%. **Non-negotiable.**
2. **APIs & Services → Library → enable:**
   - Compute Engine API
   - Cloud SQL Admin API
   - Cloud Storage API
   - Service Networking API (required for Cloud SQL private IP)
3. Install `gcloud` CLI locally if not already (`brew install google-cloud-sdk` / `winget install Google.CloudSDK`).
4. `gcloud auth login` and `gcloud config set project YOUR_PROJECT_ID` from your laptop.

---

## Step 1: Create Cloud SQL Postgres instance (~15 min provisioning)

Console → **SQL → Create Instance → PostgreSQL**:

- Instance ID: `varmasite-db`
- Root password: generate strong, save to password manager.
- Region: `asia-south1` (Mumbai), **Single zone** (cheaper; HA not needed for this workload).
- Version: PostgreSQL 16.
- Machine: **db-g1-small** (1.7 GB RAM). Use `db-f1-micro` only if squeezed — f1 shares CPU and can be janky.
- Storage: 10 GB SSD, enable automatic increases.
- Connectivity: **Private IP** in the default VPC. **Skip Public IP** (no exposure to the internet).
   - See [cloudsql-proxy-setup.md](cloudsql-proxy-setup.md) for why private IP and when you'd want the Auth Proxy instead.
- Backups: enabled, retain 7 days, 02:00 IST window.

After creation:
- **SQL → Databases → Create database**: `varmasite`.
- **SQL → Users → Create user**: `varmasite` with a strong password.
- Note the **private IP** address — used in `DATABASE_URL` below.

---

## Step 2: Create GCS buckets (~2 min)

Two buckets, different access posture (this is intentional — see [../MIGRATION_NOTES.md](../MIGRATION_NOTES.md) for the why).

```bash
# Public bucket: CMS images (homepage slideshow, initiatives, press).
# Served as plain HTTPS URLs from the public homepage.
gcloud storage buckets create gs://varmasite-public \
  --location=asia-south1 \
  --uniform-bucket-level-access

# Grant public read so the homepage works for anonymous visitors:
gcloud storage buckets add-iam-policy-binding gs://varmasite-public \
  --member=allUsers \
  --role=roles/storage.objectViewer

# Private bucket: MIB ticket attachments (citizen grievance docs).
# Signed URLs only, gated by server-side permission checks.
gcloud storage buckets create gs://varmasite-uploads \
  --location=asia-south1 \
  --uniform-bucket-level-access \
  --public-access-prevention

# Backup bucket: nightly pg_dump landing zone.
gcloud storage buckets create gs://varmasite-backups \
  --location=asia-south1 \
  --uniform-bucket-level-access \
  --public-access-prevention
```

Bucket-name verification: GCS bucket names are globally unique. If `varmasite-public` is taken, use a project-prefixed variant like `<project-id>-varmasite-public` and update env vars accordingly.

---

## Step 3: Create the storage service account (~2 min)

The VM gets a service account JSON key that grants the app permission to write to both buckets and sign URLs. Store it on the VM at `/var/www/varmasite/secrets/gcp-storage-sa.json` (gitignored).

```bash
gcloud iam service-accounts create varmasite-storage \
  --display-name="VarmaSite storage access"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:varmasite-storage@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Generate the JSON key. KEEP THIS FILE PRIVATE.
gcloud iam service-accounts keys create gcp-storage-sa.json \
  --iam-account=varmasite-storage@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

`roles/storage.objectAdmin` at the project level lets the SA read/write/sign on every bucket in the project. Tighter alternative: grant `roles/storage.objectAdmin` at each bucket individually. Skipping that here for simplicity — the SA only has storage permissions, not compute or SQL.

---

## Step 4: Create the GCE VM (~3 min)

Console → **Compute Engine → VM instances → Create instance**:

- Name: `varmasite-app`
- Region: `asia-south1`, Zone: `asia-south1-a`.
- Machine: **E2 → e2-small** (2 vCPU shared, 2 GB RAM).
- Boot disk: **Ubuntu 22.04 LTS**, 20 GB SSD.
- Network: **default VPC** (same as Cloud SQL — required for private IP to work).
- Firewall: ✅ Allow HTTP traffic, ✅ Allow HTTPS traffic.
- Networking → Network interfaces → External IPv4: **reserve a STATIC IP** (so the IP survives reboots — required for DNS).
- Identity & API access: leave default service account; we use the storage SA JSON for app-level access.

Note the static external IP — used for the smoke test and DNS cutover later.

---

## Step 5: SSH in and bootstrap (~5 min)

From your laptop:

```bash
# Copy the storage SA JSON onto the VM (before SSH'ing — needs the key on disk).
gcloud compute scp gcp-storage-sa.json \
  varmasite-app:~/gcp-storage-sa.json --zone=asia-south1-a

# SSH into the VM.
gcloud compute ssh varmasite-app --zone=asia-south1-a
```

On the VM:

```bash
# Clone repo
sudo mkdir -p /var/www/varmasite
sudo chown -R "$USER":"$USER" /var/www/varmasite
cd /var/www/varmasite
git clone <REPO_URL> .

# Bootstrap
chmod +x deploy/setup-gce.sh
sudo bash deploy/setup-gce.sh

# Stage the SA JSON
mv ~/gcp-storage-sa.json /var/www/varmasite/secrets/gcp-storage-sa.json
chmod 600 /var/www/varmasite/secrets/gcp-storage-sa.json
```

---

## Step 6: Configure `.env` on the VM (~5 min)

```bash
cd /var/www/varmasite
cp env.example .env
nano .env
```

Fill in:

```env
# Database — use the Cloud SQL private IP from Step 1
DATABASE_URL=postgresql://varmasite:PASSWORD@CLOUDSQL_PRIVATE_IP:5432/varmasite

# Session secret — generate fresh
SESSION_SECRET=PASTE_FROM_openssl_rand_hex_32

# Cloud Storage
GCS_PUBLIC_BUCKET=varmasite-public
GCS_PRIVATE_BUCKET=varmasite-uploads
GCS_BACKUP_BUCKET=varmasite-backups
GOOGLE_APPLICATION_CREDENTIALS=/var/www/varmasite/secrets/gcp-storage-sa.json
GCP_PROJECT_ID=YOUR_PROJECT_ID

# Email (existing Gmail App Password)
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASS=your-16-char-app-password
EMAIL_FROM=noreply@bjpvarma.co.in

# Production
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://bjpvarma.co.in
```

`openssl rand -hex 32` generates `SESSION_SECRET`. Lock the file: `chmod 600 .env`.

---

## Step 7: Build and run (~5 min)

```bash
cd /var/www/varmasite

# Switch Prisma schema to PostgreSQL (overwrites schema.prisma)
npm run schema:postgres

# Install deps (regenerates package-lock.json from package.json)
npm install
# Commit the fresh lockfile back to the repo for reproducibility:
# git add package-lock.json && git commit -m "chore: lockfile for GCP deploy"

# Generate Prisma client, run migrations against the empty Cloud SQL DB
npx prisma generate
npx prisma migrate deploy

# Seed the two initial admin accounts (CMS + office portal access).
# Generate both passwords in a password manager BEFORE running this — never
# type them anywhere else. They are NOT stored in env.example or in any file.
# After seeding, log in immediately and rotate them via the admin UI so the
# bootstrap env-var values can be discarded.
SUNEEL_ADMIN_PASSWORD='paste-strong-password-here' \
  VARMA_ADMIN_PASSWORD='paste-other-strong-password-here' \
  node scripts/bootstrap-prod-admins.js --confirm-production

# Build Next.js
npm run build

# Start under PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # follow the printed command to enable on boot
```

`prisma migrate deploy` runs all six migrations against the new database. No baselining needed (this is a fresh DB, not a Cloud SQL with existing data).

---

## Step 8: Nginx (~3 min)

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/varmasite
sudo ln -s /etc/nginx/sites-available/varmasite /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

`deploy/nginx.conf` already has `server_name bjpvarma.co.in www.bjpvarma.co.in` set.

---

## Step 9: Smoke test on raw IP — DO NOT skip

```bash
# From your laptop:
curl -H "Host: bjpvarma.co.in" http://<VM_STATIC_IP>/
```

Should return the homepage HTML (look for `<title>` containing "BJP Varma"). Hit `/admin` — should serve the login page. **STOP HERE if this fails.** Debug on the VM with `pm2 logs varmasite` and `sudo tail -f /var/log/nginx/error.log` before touching DNS.

Optional but recommended: open a browser session to `http://<VM_STATIC_IP>/` (the cert mismatch warning is fine for now — bypass), log into admin with the seeded credentials (see "Admin user creation" below), confirm a slideshow image upload writes to GCS public bucket, and confirm an MIB ticket upload writes to the private bucket and renders via signed URL.

---

## Step 10: DNS cutover on Namecheap (~30 min including propagation)

- Namecheap → Domain List → **bjpvarma.co.in** → Manage → Advanced DNS.
- Delete any existing `A` records for `@` and `www`.
- Add `A` record: Host `@`, Value `<VM_STATIC_IP>`, TTL 5 min.
- Add `A` record: Host `www`, Value `<VM_STATIC_IP>`, TTL 5 min.
- Save.
- Wait 5–30 min. Verify from your laptop: `dig bjpvarma.co.in @8.8.8.8` should return the VM IP.

---

## Step 11: TLS (~3 min)

Once DNS resolves to the VM:

```bash
sudo certbot --nginx -d bjpvarma.co.in -d www.bjpvarma.co.in
```

Certbot edits the nginx config in place: adds the certificate, listens on 443, sets up an HTTP→HTTPS redirect. Auto-renewal runs via systemd timer; verify with `sudo systemctl list-timers | grep certbot`.

---

## Step 12: Backup cron (~2 min)

```bash
sudo crontab -e
# Add this line:
0 2 * * * /var/www/varmasite/deploy/backup-db.sh >> /var/log/varmasite-backup.log 2>&1
```

Daily 02:00 IST, `pg_dump` to local + mirror to `gs://varmasite-backups/db-backups/`, prune local copies after 7 days. The backup script reads `DATABASE_URL` from `.env`, so no separate config needed.

The VM's attached default service account needs `roles/storage.objectAdmin` on the backup bucket. Either grant it explicitly, or simpler — copy the storage SA JSON path into the cron environment so `gcloud storage cp` uses the same SA the app does:

```cron
0 2 * * * GOOGLE_APPLICATION_CREDENTIALS=/var/www/varmasite/secrets/gcp-storage-sa.json /var/www/varmasite/deploy/backup-db.sh >> /var/log/varmasite-backup.log 2>&1
```

---

## Step 13: Admin user verification

Admin accounts were already seeded in Step 7 by `scripts/bootstrap-prod-admins.js`. Verify:

```bash
cd /var/www/varmasite
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const a = await p.adminUser.count();
  const o = await p.mibUser.count({ where: { role: 'OFFICE_ADMIN' } });
  console.log('AdminUser count:', a, '(expected 2)');
  console.log('OFFICE_ADMIN MibUser count:', o, '(expected 2)');
  await p.\$disconnect();
})();
"
```

Both counts should be 2. Test login at `https://bjpvarma.co.in/admin` and `https://bjpvarma.co.in/office/login` with both pairs of credentials.

**Rotate the bootstrap passwords immediately on first login.** The values used in the env-var-driven bootstrap should never be used again after this step. Discard them from anywhere they were temporarily stored (terminal history, password manager scratch entries) once new passwords are set via the admin UI.

Office taxonomy seeding (the categories the office team uses inside the grievance back-office) lives in `scripts/seed-office-taxonomy-prod.js`. Review the categories in that file against what the office team actually needs, then run:

```bash
node scripts/seed-office-taxonomy-prod.js
```

---

## Step 14: Final verification (the definition of done)

- [ ] `https://bjpvarma.co.in` loads with a valid Let's Encrypt cert.
- [ ] Admin login works (`/admin`).
- [ ] Office login works (`/office/login`).
- [ ] **Anonymous hit on `/admin/tickets` redirects to `/admin`** (not a 200 — confirms the auth guard from MIGRATION_NOTES.md ships correctly).
- [ ] CMS image upload (e.g. add a slideshow slide) writes to `gs://varmasite-public/images/admin/...` and the homepage renders it.
- [ ] MIB ticket upload (citizen attachment) writes to `gs://varmasite-uploads/uploads/mib/...`. In the office portal, the attachment renders inline — view-source confirms a `storage.googleapis.com/...?X-Goog-Signature=...` signed URL, not a bare public path.
- [ ] Contact form sends an email.
- [ ] `pm2 logs varmasite` is clean (no startup errors, no Storage SDK auth errors).
- [ ] $50 GCP budget alert is active.
- [ ] First nightly backup lands in `gs://varmasite-backups/db-backups/` the morning after cutover.

---

## Subsequent deployments

```bash
cd /var/www/varmasite
bash deploy/deploy.sh
```

Pulls latest code, installs deps, runs migrations, builds, reloads PM2.

---

## Rollback

If anything fails before Step 10: don't touch DNS. The Namecheap records still point nowhere; nothing to revert.

If you've already cut DNS over and things break: most issues are in-place fixes (env-var typo, nginx config, migration). Fix on the VM and `pm2 reload varmasite`. True nuclear rollback: delete the Namecheap `A` records — the site goes dark, but no users are lost (the dead AWS deployment had no live traffic to preserve).

---

## Monitoring

```bash
pm2 status                                  # app process
pm2 logs varmasite                          # tail app logs
sudo tail -f /var/log/nginx/access.log      # request log
sudo tail -f /var/log/nginx/error.log       # nginx errors
sudo tail -f /var/log/varmasite-backup.log  # nightly backup output
df -h                                       # disk
free -m                                     # memory
```

Cloud SQL has its own monitoring in the console under **SQL → varmasite-db → Monitoring** (CPU, memory, IOPS, connections). Set up an alerting policy if traffic ramps up.
