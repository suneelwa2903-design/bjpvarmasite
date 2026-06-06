#!/bin/bash
# VarmaSite GCE VM Setup Script
# Run on a fresh Ubuntu 22.04 LTS Compute Engine VM in asia-south1.
# Usage: sudo bash setup-gce.sh
#
# Replaces the old AWS EC2 bootstrap. Cloud SQL is the database (not on-box
# Postgres) — we only install the postgres CLIENT for pg_dump in backup-db.sh.

set -e

echo "=== VarmaSite GCE Setup ==="

# Update system
apt-get update && apt-get upgrade -y

# Essential tools
apt-get install -y curl git build-essential nginx certbot python3-certbot-nginx \
  ca-certificates gnupg lsb-release

# Node.js 20 via nvm — installed for the invoking user, not root, so PM2 picks
# up the right Node binary when the service starts.
RUN_USER="${SUDO_USER:-$USER}"
if [ -n "$RUN_USER" ] && [ "$RUN_USER" != "root" ]; then
  sudo -u "$RUN_USER" -H bash -c '
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
    nvm alias default 20
    npm install -g pm2
  '
else
  echo "WARN: running as root — installing nvm into /root. Consider re-running as a non-root sudoer." >&2
fi

# PostgreSQL CLIENT only (for pg_dump in the backup script). No server.
# The Cloud SQL instance is the database; this VM never runs Postgres locally.
apt-get install -y postgresql-client-common
# Pin client major to match Cloud SQL (16). The "postgresql-client-16" package
# on Ubuntu 22.04 comes from PGDG, not the default repo, so add that repo first:
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
  > /etc/apt/sources.list.d/pgdg.list
apt-get update
apt-get install -y postgresql-client-16

# Google Cloud SDK — gives us gcloud + gsutil (for the backup script and any
# manual ops). On a GCE VM the SDK picks up Application Default Credentials
# from the VM's attached service account; no key file needed for gcloud itself.
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" \
  > /etc/apt/sources.list.d/google-cloud-sdk.list
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
apt-get update
apt-get install -y google-cloud-cli

# Firewall: SSH + HTTP + HTTPS only. The VM's GCP firewall rules ALSO need to
# allow 80/443 ("Allow HTTP/HTTPS traffic" checkboxes when creating the VM).
# This ufw layer is a defense-in-depth backstop.
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# App directories
mkdir -p /var/www/varmasite
mkdir -p /var/log/pm2
mkdir -p /var/www/varmasite/secrets
chown -R "${RUN_USER:-root}":"${RUN_USER:-root}" /var/www/varmasite
chmod 700 /var/www/varmasite/secrets

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps (see deploy/GCP_DEPLOYMENT_GUIDE.md):"
echo "  1. Clone repo:    cd /var/www/varmasite && git clone <repo-url> ."
echo "  2. Copy SA JSON:  gcloud compute scp gcp-storage-sa.json varmasite-app:/var/www/varmasite/secrets/  (from your laptop)"
echo "  3. chmod 600 /var/www/varmasite/secrets/gcp-storage-sa.json"
echo "  4. Create .env:   cp env.example .env && nano .env"
echo "  5. chmod 600 .env"
echo "  6. Switch schema: npm run schema:postgres"
echo "  7. Install deps:  npm ci"
echo "  8. Migrate:       npx prisma migrate deploy"
echo "  9. Build:         npm run build"
echo "  10. Nginx:        sudo cp deploy/nginx.conf /etc/nginx/sites-available/varmasite && \\"
echo "                    sudo ln -s /etc/nginx/sites-available/varmasite /etc/nginx/sites-enabled/ && \\"
echo "                    sudo rm /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl reload nginx"
echo "  11. Smoke test:   curl -H 'Host: bjpvarma.co.in' http://localhost   (BEFORE cutting DNS)"
echo "  12. DNS cutover:  Namecheap A @ + www → VM static IP"
echo "  13. TLS:          sudo certbot --nginx -d bjpvarma.co.in -d www.bjpvarma.co.in"
echo "  14. PM2:          pm2 start ecosystem.config.js && pm2 save && pm2 startup"
echo "  15. Backup cron:  sudo crontab -e → 0 2 * * * /var/www/varmasite/deploy/backup-db.sh >> /var/log/varmasite-backup.log 2>&1"
