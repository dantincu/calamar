# Building a rotating backup

You'll install three attached files:

| File | Goes to | Role |
|---|---|---|
| `backup.sh` | `/usr/local/bin/backup.sh` | creates a time-stamped archive and deletes the oldest ones |
| `backup.service` | `/etc/systemd/system/` | runs the script once, with the settings |
| `backup.timer` | `/etc/systemd/system/` | starts the service every night |

## 1. Read the script

Before running anything as root, read it. Note how `backup.sh`:

- **validates its inputs**: directories must exist, and `BACKUP_KEEP` must be a positive number;
- uses `umask 077`, because archives of `/etc` and `/home` contain secrets (password hashes, SSH keys), so only root may read them;
- **writes atomically**: `tar` writes `….tar.gz.partial`, then `mv` renames it when complete, and a `trap` removes the partial file if anything fails;
- **rotates** by sorting the names (`backup-YYYYmmdd-HHMMSS` sorts chronologically), skipping the newest `$keep` and deleting the rest.

## 2. Try it by hand, safely

```bash
$ chmod +x backup.sh
$ mkdir -p /tmp/demo/src && echo hello > /tmp/demo/src/a.txt
$ for i in 1 2 3; do BACKUP_DEST=/tmp/demo/out BACKUP_KEEP=2 ./backup.sh /tmp/demo/src; sleep 1; done
$ ls /tmp/demo/out          # only the two newest archives remain
$ tar -tzf /tmp/demo/out/backup-*.tar.gz | head   # list what's inside
```

Then test the failure path: `./backup.sh /does/not/exist; echo $?` should print an error and `2`.

## 3. Install it

```bash
$ sudo install -m 755 backup.sh /usr/local/bin/backup.sh
$ sudo install -m 644 backup.service backup.timer /etc/systemd/system/
$ sudo systemctl daemon-reload
$ sudo systemctl start backup.service          # one run now
$ systemctl status backup.service              # should be "inactive (dead)" with status=0/SUCCESS
$ journalctl -u backup.service -n 20
$ sudo ls -l /var/backups/snapshots
```

## 4. Schedule it

```bash
$ sudo systemctl enable --now backup.timer
$ systemctl list-timers backup.timer
```

## 5. Know when it fails

A backup that silently fails is worse than none, because you *think* you're covered. Add an `OnFailure=` handler to `[Unit]` in `backup.service`, which starts another unit when the backup fails:

```ini
[Unit]
OnFailure=notify-failure@%n.service
```

Write `notify-failure@.service` to send yourself a message (for example with `curl` to a chat webhook, or with `mail`). `%n` passes the name of the failed unit.

## 6. Test a restore

**A backup is only proven when you've restored from it.**

```bash
$ mkdir /tmp/restore && sudo tar -xzf /var/backups/snapshots/backup-<stamp>.tar.gz -C /tmp/restore
$ sudo diff -r /tmp/restore/etc /etc | head
```

## How much space?

With archives of average size $s$ and $k$ kept, rotation keeps the space use bounded at about $k \cdot s$, plus one more archive during a run (the new archive is written before the old ones are deleted). With $s = 2\ \text{GB}$ and `BACKUP_KEEP=14`, plan for about $15 \times 2 = 30\ \text{GB}$.

## Going further

- Keep a copy **off the machine** (`rsync` to another host, or object storage). A backup on the same disk doesn't survive a disk failure, and ransomware encrypts both.
- Look at `restic` or `borg`, which add deduplication, encryption and incremental backups.
- The security course covers protecting the backups themselves.

Congratulations: you've built a real piece of system administration from scratch.
