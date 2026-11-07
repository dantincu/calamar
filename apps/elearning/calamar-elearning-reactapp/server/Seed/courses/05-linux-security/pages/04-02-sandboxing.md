# Sandboxing services with systemd

systemd can wrap any service in namespaces, seccomp filters and capability limits with a few lines in its unit file. It's one of the highest-value, lowest-effort hardening steps on modern Linux.

## Measure first

```bash
$ systemd-analyze security                     # every service, with an exposure score from 0 to 10
$ systemd-analyze security nginx.service       # the detail for one: each setting and its weight
```

Many services score 9 or more ("UNSAFE") out of the box. The settings in the attached `myapp.service` bring a unit down into the low range; check yours with the command above, because the exact score depends on your systemd version and on what your service needs.

## The settings, by theme

**Identity and privileges**

| Setting | Effect |
|---|---|
| `DynamicUser=yes` | a throwaway UID allocated at start; the service owns nothing outside its own directories |
| `NoNewPrivileges=yes` | setuid binaries and file capabilities stop working inside the service |
| `CapabilityBoundingSet=` (empty) | no capabilities at all, even as root |
| `RestrictSUIDSGID=yes` | can't create setuid or setgid files |

**File system**

| Setting | Effect |
|---|---|
| `ProtectSystem=strict` | the whole file system is read-only… |
| `StateDirectory=`, `LogsDirectory=`, `CacheDirectory=` | …except these, created for the service |
| `ProtectHome=yes` | `/home`, `/root` and `/run/user` are invisible |
| `PrivateTmp=yes` | its own empty `/tmp`, so no shared-tmp attacks |
| `PrivateDevices=yes` | no access to physical devices |

**Kernel and system calls**

| Setting | Effect |
|---|---|
| `ProtectKernelTunables/Modules/Logs=yes` | no `sysctl` writes, no module loading, no kernel log |
| `SystemCallFilter=@system-service` | a seccomp allow-list of the system calls normal services use |
| `SystemCallFilter=~@privileged @resources` | and explicitly not these |
| `RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX` | no raw sockets, netlink, Bluetooth… |
| `RestrictNamespaces=yes` | can't create namespaces (a common container-escape and exploit tool) |
| `MemoryDenyWriteExecute=yes` | no writable-and-executable memory; **breaks JIT runtimes** (Node.js, Java, .NET) |

**Resources**: `MemoryMax=512M` and `TasksMax=200` keep a runaway or hijacked service from taking the machine down.

## The method

1. Start from the attached unit, with your `ExecStart`.
2. Add settings in small groups, and restart after each: `sudo systemctl daemon-reload && sudo systemctl restart myapp`.
3. When something breaks, `journalctl -u myapp` usually says what was denied (`Permission denied`, `Read-only file system`, `Operation not permitted`). Seccomp denials show in the kernel log with `journalctl -k | grep -i seccomp`.
4. Loosen only what's needed: for example, `ReadWritePaths=/srv/uploads` for one extra directory.

## Hardening packaged services

Don't edit the vendor's unit. Add an override:

```bash
$ sudo systemctl edit nginx
```

```ini
[Service]
ProtectHome=yes
PrivateTmp=yes
ProtectKernelModules=yes
NoNewPrivileges=yes
```

Overrides survive package updates, and `systemctl cat nginx` shows the merged result.
