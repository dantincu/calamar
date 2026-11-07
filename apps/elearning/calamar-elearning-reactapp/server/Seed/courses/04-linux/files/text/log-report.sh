#!/usr/bin/env bash
# log-report.sh: answers common questions about a web server access log with pipelines.
#   ./log-report.sh access.log
set -euo pipefail
log=${1:?Usage: log-report.sh ACCESS_LOG}

echo "== Requests per IP address (most first)"
# field 1 is the client address; sort groups equal lines, uniq -c counts them, sort -rn orders by count
cut -d' ' -f1 "$log" | sort | uniq -c | sort -rn

echo
echo "== Requests per status code"
# with awk, $9 is the status code in the common log format
awk '{ print $9 }' "$log" | sort | uniq -c | sort -rn

echo
echo "== Failed logins (POST /login answered 401), per IP"
grep '"POST /login' "$log" | awk '$9 == 401 { print $1 }' | sort | uniq -c | sort -rn

echo
echo "== Requests for paths that don't exist (404)"
awk '$9 == 404 { print $1, $7 }' "$log"

echo
echo "== Bytes sent in total"
awk '{ total += $10 } END { printf "%d bytes (%.1f KiB)\n", total, total / 1024 }' "$log"

echo
echo "== Server errors (5xx), with time and path"
# sed strips the leading "[" from the time stamp
awk '$9 ~ /^5/ { print $4, $7 }' "$log" | sed 's/^\[//'
