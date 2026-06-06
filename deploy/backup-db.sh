#!/bin/bash
# VarmaSite Database Backup Script
# Add to cron: 0 2 * * * /var/www/varmasite/deploy/backup-db.sh
# Runs daily at 2 AM, keeps 7 days of local backups, mirrors each backup to GCS.
#
# Belt-and-suspenders: Cloud SQL has its own automated backups (configured in
# the SQL instance). This script is a second copy that lives outside Cloud SQL
# in case the instance is deleted or corrupted in a way that wipes its backups.

set -e

BACKUP_DIR="/var/backups/varmasite"
GCS_BACKUP_BUCKET="${GCS_BACKUP_BUCKET:-varmasite-backups}"
DB_NAME="${DB_NAME:-varmasite}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"
RETENTION_DAYS=7

# DATABASE_URL is read from /var/www/varmasite/.env on the VM. Source it so
# pg_dump can connect using the same connection string the app uses (Cloud SQL
# private IP).
if [ -f /var/www/varmasite/.env ]; then
  # shellcheck disable=SC1091
  set -a; . /var/www/varmasite/.env; set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set. Aborting." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "Backing up database $DB_NAME..."
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

# Mirror to GCS. Uses Application Default Credentials, which on a GCE VM means
# the VM's attached service account. Grant that SA roles/storage.objectAdmin on
# the backup bucket (separate from the app's storage SA) or reuse the app SA.
if command -v gcloud &> /dev/null; then
  echo "Uploading to gs://${GCS_BACKUP_BUCKET}/db-backups/..."
  gcloud storage cp "$BACKUP_FILE" "gs://${GCS_BACKUP_BUCKET}/db-backups/$(basename "$BACKUP_FILE")"
else
  echo "gcloud CLI not found; skipping GCS upload. Local backup retained." >&2
fi

echo "Cleaning local backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup complete: $BACKUP_FILE"
