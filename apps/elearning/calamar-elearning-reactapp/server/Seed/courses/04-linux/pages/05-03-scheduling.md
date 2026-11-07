# Scheduling jobs: cron and systemd timers

## cron

Each user has a **crontab**, a table of schedules and commands:

```bash
$ crontab -e      # edit yours
$ crontab -l      # list it
```

Each line has five time fields, then the command:

```
minute  hour  day-of-month  month  day-of-week   command
  30     2         *          *         *        /usr/local/bin/backup.sh
```

| Syntax | Means | Example |
|---|---|---|
| `*` | every value | `* * * * *`: every minute |
| `a,b` | a list | `0 8,12,18 * * *`: at 08:00, 12:00 and 18:00 |
| `a-b` | a range | `0 9 * * 1-5`: 09:00 on weekdays |
| `*/n` | every n | `*/15 * * * *`: every 15 minutes |

The attached `crontab.example` has more, with comments.

**cron gotchas:**

- cron runs with a minimal environment: a short `PATH`, no aliases, no `.bashrc`. Use absolute paths, or set `PATH` at the top of the crontab.
- Output is e-mailed to the user, or lost. Redirect it: `>> /var/log/myjob.log 2>&1`.
- `%` is special in crontab lines (it means a newline). Escape it as `\%`, as in `date +\%F`.

## systemd timers

Timers are the systemd alternative. They take two files: a `.service` that says *what* to run, and a `.timer` that says *when*. The project chapter uses `backup.service` and `backup.timer` (attached):

```ini
[Timer]
OnCalendar=*-*-* 02:30:00
Persistent=true
RandomizedDelaySec=10min
```

| Advantage of timers | |
|---|---|
| Logging | output goes to the journal: `journalctl -u backup.service` |
| Missed runs | `Persistent=true` catches up after downtime |
| Testing | `systemctl start backup.service` runs the job now, exactly as the timer would |
| Overview | `systemctl list-timers` shows the next and last runs |
| Resource control | `Nice=`, `IOSchedulingClass=`, memory limits and sandboxing in the service |

Check calendar expressions before you trust them:

```bash
$ systemd-analyze calendar "Mon..Fri *-*-* 09:00"
$ systemd-analyze calendar --iterations=3 "*-*-01 00:00"
```

## One-off jobs

```bash
$ echo "/usr/local/bin/report.sh" | at 17:00   # once, at 17:00 (install the 'at' package)
$ systemd-run --on-active=30m /usr/local/bin/cleanup.sh   # once, in 30 minutes
```
