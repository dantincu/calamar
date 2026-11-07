# When you find a compromise

An alert fires: an unknown SSH key in `root`'s `authorized_keys`, a process connecting to an odd address, a modified `sshd`. What now?

## The phases

The classic incident-response cycle (NIST SP 800-61):

1. **Preparation**: contacts, runbooks, backups, logs shipped off-host (done *before* the incident).
2. **Detection and analysis**: is it real? What's affected? Since when?
3. **Containment**: stop the spread, keep the evidence.
4. **Eradication**: remove the attacker's access, and fix the hole they used.
5. **Recovery**: rebuild, restore, monitor closely.
6. **Lessons learned**: what failed, what worked, what changes.

## First: don't make it worse

- **Don't reboot or shut down yet.** Memory, running processes and network connections are evidence, and they vanish.
- **Don't "clean up"** by deleting the suspicious files: you destroy evidence, and you'll never know what else they left.
- **Assume your tools may lie** (rootkits). Prefer statically linked tools from trusted media, and cross-check views.
- **Communicate out of band**, in case the attacker reads your e-mail or chat.

## Collect volatile data, most volatile first

```bash
$ date -u; uptime
$ ss -tanp                       # network connections and their processes
$ ps auxwwf                      # the full process tree
$ ls -l /proc/*/exe 2>/dev/null | grep deleted   # programs running from deleted files: a classic sign
$ who; last -F | head -50; lastb | head -20      # sessions, logins, failed logins
$ journalctl --since "-48h" -o short-iso > journal.txt
```

Save everything to **another machine** (`… | ssh collector 'cat > evidence/ps.txt'`), not to the compromised disk. For serious cases, capture memory and take a disk image (or a cloud snapshot) for forensic analysis.

## Contain

- Isolate the host: firewall it down to your own access, or move it to a quarantine network or security group. In the cloud, a snapshot plus a restrictive security group does both.
- **Rotate credentials** that the host held or could see: SSH keys, API tokens, database passwords, cloud keys. Assume they're stolen.
- Look for the same indicators on other hosts.

## Look for persistence

Attackers make sure they can come back. Common places:

| Where | Check |
|---|---|
| SSH keys | every `authorized_keys`, including system accounts' |
| Accounts | new users, new UID 0 accounts, changed `sudoers` |
| Scheduled jobs | crontabs (`/etc/cron*`, `/var/spool/cron`), systemd timers |
| Services | new or modified units in `/etc/systemd/system`, `~/.config/systemd/user` |
| Shell startup | `.bashrc`, `.profile`, `/etc/profile.d/` |
| Libraries | `/etc/ld.so.preload`, `LD_PRELOAD` in unit files |
| Binaries | `rpm -Va` / `debsums -s`, and AIDE against an off-host baseline |
| Kernel | unexpected modules in `lsmod` |

Your `auditd` rules from chapter 5 watch most of these, and their logs (if shipped off-host) give you a timeline.

## Eradicate and recover: rebuild

**Rebuild the machine from a known-good image**, restore *data* (not binaries or configuration you can't verify) from backups made **before** the intrusion, apply the hardening from this course, and **fix the entry point**. Otherwise the attacker simply comes back the same way.

## Learn

Write a blameless post-incident review: a timeline, the root cause, what detected it (and how long that took), and concrete changes. The most useful number is usually the **dwell time**, from intrusion to detection. Every control that would have shortened it is worth adding.

Congratulations on finishing the course. You now know how to make Linux systems hard to break into, and what to do when that isn't enough.
