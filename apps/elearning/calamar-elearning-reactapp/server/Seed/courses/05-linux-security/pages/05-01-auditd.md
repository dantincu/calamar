# Auditing with auditd

The Linux **audit framework** records security-relevant events in the kernel: file accesses, system calls and logins. Each event is attributed to the **login user** (the `auid`), even after `sudo` or `su`. That's what answers "who changed `/etc/sudoers` at 03:12?"

```bash
$ sudo apt install auditd          # Debian/Ubuntu (preinstalled on the RHEL family)
$ sudo systemctl enable --now auditd
```

## Rules

Rules live in `/etc/audit/rules.d/*.rules`. The attached `50-hardening.rules` uses both kinds:

**File watches**: `-w path -p permissions -k key`

```
-w /etc/sudoers -p wa -k sudoers          # w = write, a = attribute change (chmod, chown)
-w /etc/ssh/sshd_config.d/ -p wa -k sshd
-w /etc/systemd/system/ -p wa -k systemd  # new services are a favorite persistence method
```

**System call rules**: `-a always,exit -F filters -S syscalls -k key`

```
-a always,exit -F arch=b64 -S execve -F euid=0 -F auid>=1000 -F auid!=unset -k root_cmds
```

That one logs every program executed with root privileges by a human who logged in (UID ≥ 1000), however they became root.

```bash
$ sudo augenrules --load       # compile rules.d into the active rule set
$ sudo auditctl -l             # list the active rules
```

## Searching

```bash
$ sudo ausearch -k sudoers -i                 # events with a key; -i = names instead of numbers
$ sudo ausearch -k root_cmds -ts today -i
$ sudo ausearch -m USER_LOGIN --success no -i # failed logins
$ sudo aureport --summary
$ sudo aureport -au                           # an authentication report
```

## Immutable rules

The last line, `-e 2`, locks the rules until the next reboot. An intruder with root can't quietly delete them, and changing them requires a reboot, which is itself noticeable. Enable it only once your rules are final.

## Volume and noise

Every rule costs CPU and disk. Syscall rules on busy calls (`open`, `read`) can produce gigabytes per day. Start with watches and a few targeted syscall rules like the attached ones, and look at the volume (`aureport --summary`) before adding more.

## Get the logs off the box

An intruder with root can edit local logs. Forward them to a separate log server or SIEM, so that the evidence survives:

- the journal: `systemd-journal-remote` / `systemd-journal-upload`;
- syslog: `rsyslog` with TLS;
- audit events: the `audisp-remote` plugin, or an agent (Elastic, Wazuh…).

## What to alert on

A few high-signal events are better than thousands of ignored ones:

- changes to `sudoers`, `sshd_config`, `passwd`, `shadow` and PAM;
- new systemd units, timers and cron jobs;
- kernel modules loaded at runtime;
- logins at odd hours or from new places (`last`, `journalctl _COMM=sshd`);
- `auditd` itself stopping, or logs going silent.
