#!/usr/bin/env bash
# backup.sh: archives directories into a time-stamped .tar.gz and keeps only the newest few.
#
#   backup.sh DIR...                       # e.g. backup.sh /etc /home/ada/projects
#
# Settings (environment variables):
#   BACKUP_DEST   where archives go           (default /var/backups/snapshots)
#   BACKUP_KEEP   how many archives to keep   (default 7)
#
# Exit codes: 0 ok, 1 the archive failed, 2 usage error.
set -euo pipefail

dest=${BACKUP_DEST:-/var/backups/snapshots}
keep=${BACKUP_KEEP:-7}

log() { printf '%s %s\n' "$(date '+%F %T')" "$*"; }   # journald adds its own time stamps; this helps when run by hand

if (( $# == 0 )); then
  echo "Usage: ${0##*/} DIR..." >&2
  exit 2
fi
for dir in "$@"; do
  [[ -d $dir ]] || { echo "Not a directory: $dir" >&2; exit 2; }
done
[[ $keep =~ ^[1-9][0-9]*$ ]] || { echo "BACKUP_KEEP must be a positive number" >&2; exit 2; }

mkdir -p "$dest"
umask 077                                   # archives readable by the owner only: they may contain secrets

stamp=$(date +%Y%m%d-%H%M%S)
archive="$dest/backup-$stamp.tar.gz"
partial="$archive.partial"
trap 'rm -f "$partial"' EXIT                # never leave a half-written archive behind

log "Archiving $* into $archive"
if ! tar -czf "$partial" "$@"; then
  log "tar failed"
  exit 1
fi
mv "$partial" "$archive"                    # appears under its final name only when complete
log "Done: $(du -h "$archive" | cut -f1)"

# Rotation: list the archives newest first (the names sort by time), skip the first $keep, delete the rest
mapfile -t old < <(find "$dest" -maxdepth 1 -name 'backup-*.tar.gz' -printf '%f\n' | sort -r | tail -n +"$((keep + 1))")
for name in "${old[@]}"; do
  log "Removing old archive $name"
  rm -f -- "$dest/$name"
done
