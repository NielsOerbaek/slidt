#!/usr/bin/env bash
# backup.sh — dump Postgres, tarball ./data/, upload to OneDrive via rclone.
#
# Usage:
#   ./scripts/backup.sh [rclone-remote:path]
#
# Default remote: onedrive:slidt-backups
# Prerequisites: rclone configured with an "onedrive" remote.
#   See: https://rclone.org/onedrive/
#
# Suggested cron (daily at 02:00):
#   0 2 * * * cd /opt/slidt && ./scripts/backup.sh >> /var/log/slidt-backup.log 2>&1

set -euo pipefail

REMOTE="${1:-onedrive:slidt-backups}"
TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
BACKUP_DIR="./data/backups"
SQL_DUMP="${BACKUP_DIR}/slidt-${TIMESTAMP}.sql"
ARCHIVE="${BACKUP_DIR}/slidt-${TIMESTAMP}.tar.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date -u +%FT%TZ)] Starting backup..."

# 1. Dump Postgres
echo "  Dumping Postgres..."
docker compose exec -T postgres pg_dump -U slidt slidt > "${SQL_DUMP}"

# 2. Create tarball (assets + this SQL dump)
echo "  Archiving to ${ARCHIVE}..."
tar -czf "${ARCHIVE}" \
  --transform "s|^data/||" \
  "data/assets" \
  "${SQL_DUMP}"

# 3. Remove raw SQL dump (it's inside the archive)
rm "${SQL_DUMP}"

# 4. Upload
echo "  Uploading to ${REMOTE}..."
rclone copy "${ARCHIVE}" "${REMOTE}" --progress

# 5. Prune local backups: keep last 7
echo "  Pruning old local backups (keeping 7)..."
# shellcheck disable=SC2012
ls -1t "${BACKUP_DIR}"/*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm --

echo "[$(date -u +%FT%TZ)] Backup complete: ${ARCHIVE}"
