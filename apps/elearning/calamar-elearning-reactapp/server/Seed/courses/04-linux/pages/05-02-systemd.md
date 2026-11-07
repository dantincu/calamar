# Services with systemd

**systemd** starts the system, supervises services (restarting them if they crash), collects their logs and much more. You talk to it with `systemctl`.

## Controlling services

```bash
$ systemctl status nginx              # state, PID, memory and the latest log lines
$ sudo systemctl start nginx
$ sudo systemctl stop nginx
$ sudo systemctl restart nginx
$ sudo systemctl reload nginx         # reload the configuration without stopping, if the service supports it
$ sudo systemctl enable nginx         # start at boot
$ sudo systemctl enable --now nginx   # enable and start
$ sudo systemctl disable nginx
$ systemctl list-units --type=service --state=running
$ systemctl --failed                  # what's broken?
```

## Unit files

A service is described by a **unit file**. Packages install theirs in `/usr/lib/systemd/system/`, and yours go in `/etc/systemd/system/`:

```ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My web application
After=network-online.target
Wants=network-online.target

[Service]
User=myapp
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/bin/server --port 8080
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
$ sudo systemctl daemon-reload        # after creating or editing a unit file
$ sudo systemctl enable --now myapp
```

| Setting | Means |
|---|---|
| `After=`/`Wants=` | ordering and soft dependencies |
| `Type=` | `simple` (the default: the process is the service), `oneshot` (runs and exits), `notify`, `forking` |
| `Restart=on-failure` | restart when it crashes or exits with an error |
| `WantedBy=multi-user.target` | started at normal boot when enabled |

To change a packaged unit, don't edit it: `sudo systemctl edit nginx` creates an override file that survives updates.

## Logs with journalctl

systemd's journal collects the output of every service:

```bash
$ journalctl -u myapp                 # one service's logs
$ journalctl -u myapp -f              # follow, like tail -f
$ journalctl -u myapp --since "1 hour ago"
$ journalctl -b -p err                # errors since the last boot
$ journalctl -k                       # kernel messages
$ journalctl --disk-usage
```

Anything your program prints to stdout or stderr ends up in the journal, with a time stamp. There's no need to manage log files yourself.

## Traditional log files

Many systems also write text logs in `/var/log`: `syslog` or `messages`, `auth.log` or `secure` (logins and sudo), and per-application directories like `/var/log/nginx/`. **logrotate** compresses and deletes old ones on a schedule.
