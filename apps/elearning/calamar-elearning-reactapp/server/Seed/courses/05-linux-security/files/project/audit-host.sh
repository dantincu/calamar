#!/usr/bin/env bash
# audit-host.sh: a READ-ONLY security check of a Linux host. It changes nothing.
#
#   sudo ./audit-host.sh            # some checks need root (sshd -T, /etc/shadow)
#   sudo ./audit-host.sh > report.txt
#
# Each line is PASS, WARN or INFO. The exit code is the number of WARN lines (capped at 100).
# It covers the course's main topics. It's a starting point, not a substitute for a benchmark
# like the CIS Benchmarks or a tool like Lynis.
set -uo pipefail          # no -e: a failing check must not stop the others

warns=0
pass() { printf 'PASS  %s\n' "$*"; }
warn() { printf 'WARN  %s\n' "$*"; warns=$((warns + 1)); }
info() { printf 'INFO  %s\n' "$*"; }
section() { printf '\n== %s\n' "$*"; }
have() { command -v "$1" >/dev/null 2>&1; }

if [[ $(uname -s) != Linux ]]; then
  echo "This script audits Linux hosts; this is $(uname -s)." >&2
  exit 100
fi
if (( EUID != 0 )); then
  info "Not running as root: some checks are skipped or incomplete"
fi

section "System"
info "$(. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME") / kernel $(uname -r)"
if [[ -f /var/run/reboot-required ]]; then
  warn "A reboot is pending (probably a kernel update)"
fi

section "Accounts"
uid0=$(awk -F: '$3 == 0 { print $1 }' /etc/passwd | tr '\n' ' ')
if [[ $uid0 == "root " ]]; then pass "Only root has UID 0"; else warn "Accounts with UID 0: $uid0"; fi

if [[ -r /etc/shadow ]]; then
  empty=$(awk -F: '$2 == "" { print $1 }' /etc/shadow | tr '\n' ' ')
  if [[ -z $empty ]]; then pass "No account has an empty password"; else warn "Accounts with an EMPTY password: $empty"; fi
  # $y$ = yescrypt, $6$ = SHA-512 crypt; $1$ (MD5) and DES hashes are obsolete
  weak=$(awk -F: '$2 ~ /^\$1\$/ || ($2 ~ /^[A-Za-z0-9.\/]{13}$/) { print $1 }' /etc/shadow | tr '\n' ' ')
  if [[ -z $weak ]]; then pass "No obsolete password hash formats"; else warn "Obsolete password hashes (MD5/DES): $weak"; fi
fi

shells=$(awk -F: '$3 >= 1000 && $3 < 65534 && $7 !~ /(nologin|false)$/ { print $1 }' /etc/passwd | tr '\n' ' ')
info "Human accounts with a login shell: ${shells:-none}"

section "SSH"
if have sshd && (( EUID == 0 )); then
  cfg=$(sshd -T 2>/dev/null)
  check_ssh() {   # key expected-value description
    local actual
    actual=$(awk -v k="$1" '$1 == k { print $2 }' <<<"$cfg")
    if [[ $actual == "$2" ]]; then pass "$3 ($1 $actual)"; else warn "$3 ($1 is '${actual:-unset}', expected '$2')"; fi
  }
  check_ssh permitrootlogin no "Root can't log in over SSH"
  check_ssh passwordauthentication no "SSH password logins are off"
  check_ssh kbdinteractiveauthentication no "SSH keyboard-interactive logins are off"
  check_ssh x11forwarding no "X11 forwarding is off"
elif have sshd; then
  info "Run as root to check the effective SSH configuration"
else
  info "sshd is not installed"
fi

section "Network exposure"
if have ss; then
  # Listening sockets not bound to loopback: reachable from the network (if the firewall allows)
  exposed=$(ss -Htuln | awk '{ print $1, $5 }' | grep -vE ' (127\.0\.0\.[0-9]+|\[::1\]):' | sort -u)
  if [[ -n $exposed ]]; then
    while read -r line; do info "Listening on the network: $line"; done <<<"$exposed"
  else
    pass "Nothing listens on a non-loopback address"
  fi
fi

if have nft && (( EUID == 0 )); then
  rules=$(nft list ruleset 2>/dev/null | grep -c 'hook input')
  policy=$(nft list ruleset 2>/dev/null | grep -E 'hook input.*policy drop' -c)
  if (( policy > 0 )); then pass "nftables input chain with policy drop"
  elif (( rules > 0 )); then warn "An nftables input chain exists, but its policy isn't drop"
  else warn "No nftables input chain: is there a firewall (ufw, firewalld, iptables)?"; fi
fi

section "File permissions"
for f in /etc/passwd:644 /etc/group:644 /etc/shadow:640 /etc/gshadow:640; do
  path=${f%%:*}; max=${f##*:}
  [[ -e $path ]] || continue
  mode=$(stat -c '%a' "$path")
  # a mode passes if it has no bit that the maximum doesn't have: (mode & ~max) == 0, in octal
  if (( (8#$mode & ~8#$max) == 0 )); then pass "$path is $mode"; else warn "$path is $mode (expected $max or stricter)"; fi
done

ww=$(find /etc /usr /var/lib -xdev -type f -perm -0002 2>/dev/null | head -n 20)
if [[ -z $ww ]]; then pass "No world-writable files under /etc, /usr, /var/lib"; else
  while read -r f; do warn "World-writable: $f"; done <<<"$ww"; fi

suid_count=$(find / -xdev -type f -perm -4000 2>/dev/null | wc -l)
info "$suid_count setuid files on the root file system (review: find / -xdev -perm -4000 -type f)"
odd_suid=$(find / -xdev -type f -perm -4000 2>/dev/null | grep -vE '^/(usr/)?(s?bin|lib|libexec)/' | head -n 20)
if [[ -n $odd_suid ]]; then while read -r f; do warn "setuid file outside the system directories: $f"; done <<<"$odd_suid"; fi

section "Kernel settings"
check_sysctl() {   # key expected
  local v
  v=$(sysctl -n "$1" 2>/dev/null) || { info "$1 not available"; return; }
  if [[ $v == "$2" ]]; then pass "$1 = $v"; else warn "$1 = $v (recommended: $2)"; fi
}
check_sysctl kernel.kptr_restrict 2
check_sysctl kernel.dmesg_restrict 1
check_sysctl kernel.unprivileged_bpf_disabled 1
check_sysctl fs.protected_symlinks 1
check_sysctl fs.protected_hardlinks 1
check_sysctl fs.suid_dumpable 0
check_sysctl net.ipv4.conf.all.accept_redirects 0
check_sysctl net.ipv4.tcp_syncookies 1

section "Mandatory access control"
if have aa-status && (( EUID == 0 )); then
  info "AppArmor: $(aa-status --enforced 2>/dev/null) profiles in enforce mode"
elif have getenforce; then
  mode=$(getenforce)
  if [[ $mode == Enforcing ]]; then pass "SELinux is enforcing"; else warn "SELinux is $mode"; fi
else
  info "Neither AppArmor nor SELinux tools found"
fi

section "Logging and updates"
if have auditctl && (( EUID == 0 )); then
  n=$(auditctl -l 2>/dev/null | grep -vc '^No rules')
  if (( n > 0 )); then pass "auditd has $n rules loaded"; else warn "auditd has no rules"; fi
else
  info "auditd not installed, or not root"
fi
if have systemctl; then
  for unit in unattended-upgrades.service dnf-automatic.timer; do
    if systemctl is-enabled "$unit" >/dev/null 2>&1; then pass "Automatic updates: $unit is enabled"; fi
  done
fi

printf '\n%d warning(s)\n' "$warns"
exit $(( warns > 100 ? 100 : warns ))
