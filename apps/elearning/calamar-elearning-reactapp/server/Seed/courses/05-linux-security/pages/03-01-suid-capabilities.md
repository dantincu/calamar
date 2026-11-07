# setuid, capabilities and ACLs

## setuid and setgid programs

A setuid-root program runs as root whoever starts it. Some need it (`passwd`, `sudo`, `mount`), but each one is code running as root on input that an unprivileged user controls: arguments, environment variables, files. Any bug in it can be an escalation.

```bash
$ find / -xdev -perm -4000 -type f -exec ls -l {} \; 2>/dev/null   # setuid
$ find / -xdev -perm -2000 -type f 2>/dev/null                     # setgid
```

Know your list, and investigate any change. A setuid file in `/home`, `/tmp` or `/opt` is a red flag. Remove the bit from programs that don't need it:

```bash
$ sudo chmod u-s /usr/bin/some-tool
```

Mount file systems that should never hold programs with `nosuid` (and `nodev`, `noexec`), for example `/tmp` and removable media, in `/etc/fstab`:

```
tmpfs  /tmp  tmpfs  defaults,nosuid,nodev,noexec,size=2G  0 0
```

## World-writable files and directories

A world-writable script that root runs from cron is an instant escalation. The attacker just edits it.

```bash
$ find / -xdev -type f -perm -0002 2>/dev/null             # world-writable files
$ find / -xdev -type d -perm -0002 ! -perm -1000 2>/dev/null   # world-writable dirs WITHOUT the sticky bit
```

Also check that everything root *executes* (cron jobs, systemd units, scripts they call, and the directories that contain them) is writable by root only.

## Capabilities: root in pieces

Linux splits root's powers into about 40 **capabilities**. A program can get just the one it needs instead of full setuid root:

| Capability | Allows |
|---|---|
| `CAP_NET_BIND_SERVICE` | binding ports below 1024 |
| `CAP_NET_RAW` | raw sockets (`ping`) |
| `CAP_NET_ADMIN` | configuring interfaces and firewalls |
| `CAP_SYS_ADMIN` | a huge grab bag; nearly root |
| `CAP_DAC_OVERRIDE` | ignoring file permissions |
| `CAP_SETUID` | changing UID: effectively root |

```bash
$ sudo setcap 'cap_net_bind_service=+ep' /usr/local/bin/myapp   # bind :443 without root
$ getcap /usr/local/bin/myapp
$ sudo getcap -r / 2>/dev/null       # every file with capabilities: audit this list like setuid
```

Capabilities like `cap_setuid`, `cap_dac_override` or `cap_sys_admin` on an interpreter (`python3`, `perl`) amount to giving away root. For services, systemd's `AmbientCapabilities=` and `CapabilityBoundingSet=` (chapter 4) are cleaner than file capabilities.

## ACLs: finer permissions

When owner/group/others isn't enough, **access control lists** add per-user and per-group entries:

```bash
$ setfacl -m u:auditor:r /var/log/myapp/app.log    # let one extra user read
$ setfacl -d -m g:devs:rwX /srv/project             # default ACL: inherited by new files
$ getfacl /srv/project
$ ls -l
-rw-r-----+ 1 myapp myapp 1.2K app.log              # the + means "has an ACL"
```

ACLs are easy to forget during audits, because `ls -l` shows only a `+`. Include `getfacl -R` in reviews of sensitive directories.

## The escalation checklist attackers use

On a compromised account, attackers immediately check `sudo -l`, setuid and capability files, writable cron jobs and service files, credentials in readable files (`.env`, shell history, backups), the kernel version (for local exploits) and Docker group membership (chapter 6). **Run the same checks yourself first**, which is what `audit-host.sh` in the project does.
