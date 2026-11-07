# Auditing a host

The attached `audit-host.sh` is a **read-only** check of the topics in this course. It changes nothing, and it prints `PASS`, `WARN` or `INFO` for each check.

```bash
$ chmod +x audit-host.sh
$ sudo ./audit-host.sh | tee audit-$(hostname)-$(date +%F).txt
$ echo $?            # the number of warnings
```

## What it checks

| Section | Checks |
|---|---|
| System | pending reboot after a kernel update |
| Accounts | extra UID 0 accounts, empty passwords, obsolete hash formats, accounts with a login shell |
| SSH | effective `PermitRootLogin`, password and keyboard-interactive logins, X11 forwarding (from `sshd -T`) |
| Network | services listening on non-loopback addresses; an nftables input chain with policy drop |
| Files | permissions of `passwd`, `group`, `shadow` and `gshadow`; world-writable files; setuid files outside the system directories |
| Kernel | key `sysctl` values from the hardening lesson |
| MAC | AppArmor profiles in enforce mode, or SELinux enforcing |
| Logging | auditd rules loaded; automatic updates enabled |

## A detail worth understanding

The permission check accepts a file if its mode has **no bit that the maximum lacks**. In octal, with bitwise operations:

$$
\text{ok} \iff (\text{mode} \wedge \lnot\,\text{max}) = 0
$$

`/etc/shadow` at `600` passes against a maximum of `640`, because $600 \wedge \lnot 640 = 0$. At `644` it fails, because the "others read" bit $004$ survives. A plain numeric comparison (`mode <= max`) would be wrong: $604 < 640$ numerically, yet `604` gives everybody read access to the password hashes.

In bash: `(( (8#$mode & ~8#$max) == 0 ))`, where `8#` reads the number as octal.

## The exercise

1. Build a fresh VM from your distribution's standard server image, and run the script. Save the report.
2. Fix every `WARN`, using the course's files: the SSH drop-in, `nftables.conf`, `99-hardening.conf`, `audit` rules and `unattended-upgrades`.
3. Review every `INFO` line. For each network-exposed service, decide: needed? local-only? firewalled?
4. Run the script again, and diff the reports.
5. Extend it with a check of your own. Suggestions:
   - no `authorized_keys` file is writable by group or others;
   - `fail2ban` is active, with the `sshd` jail enabled;
   - `/tmp` is mounted `nosuid,nodev`;
   - `systemd-analyze security` gives no service above 9.0, except for an allow-list.

## Then compare with the professionals

- **Lynis** (`apt install lynis; sudo lynis audit system`) runs hundreds of checks and gives a hardening index.
- The **CIS Benchmarks** are detailed, consensus hardening guides per distribution, with automated assessment tools.
- **OpenSCAP** (`oscap`) evaluates systems against SCAP profiles such as CIS, STIG and PCI-DSS, and can generate remediation scripts.

Treat their findings like the script's: understand each one, then decide. Not every recommendation fits every system.
