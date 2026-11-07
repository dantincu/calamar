#!/usr/bin/env bash
# disk-report.sh: warns about file systems that are fuller than a threshold.
#   ./disk-report.sh            # threshold 80%
#   ./disk-report.sh -t 90      # threshold 90%
#   ./disk-report.sh -h
# Exit code: 0 = all below the threshold, 1 = at least one above, 2 = usage error.
set -euo pipefail           # stop on errors, on unset variables, and on failures inside pipes
IFS=$'\n\t'                 # split words only on newlines and tabs

threshold=80

usage() {
  cat <<EOF
Usage: ${0##*/} [-t PERCENT]
Lists the file systems whose usage is at or above PERCENT (default $threshold).
EOF
}

while getopts ":t:h" opt; do
  case $opt in
    t) threshold=$OPTARG ;;
    h) usage; exit 0 ;;
    \?) echo "Unknown option: -$OPTARG" >&2; usage >&2; exit 2 ;;
    :)  echo "Option -$OPTARG needs a value" >&2; exit 2 ;;
  esac
done

if ! [[ $threshold =~ ^[0-9]+$ ]] || (( threshold > 100 )); then
  echo "The threshold must be a number from 0 to 100, not '$threshold'" >&2
  exit 2
fi

# A temporary file that is removed however the script ends
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT

# -P: one line per file system (POSIX format); skip the header line
df -P | tail -n +2 > "$tmp"

status=0
# Each line: FILESYSTEM BLOCKS USED AVAILABLE CAPACITY% MOUNTPOINT. Mount points may contain spaces, so instead of
# splitting into words, match from the "NN%" field: the regex captures the percentage and everything after it.
pattern=' ([0-9]+)% (.+)$'
while read -r line; do
  [[ $line =~ $pattern ]] || continue       # pseudo file systems may show "-" instead of a percentage
  pct=${BASH_REMATCH[1]}
  mount=${BASH_REMATCH[2]}
  if (( pct >= threshold )); then
    printf 'WARNING %3s%%  %s\n' "$pct" "$mount"
    status=1
  fi
done < "$tmp"

(( status == 0 )) && echo "All file systems are below ${threshold}%."
exit "$status"
