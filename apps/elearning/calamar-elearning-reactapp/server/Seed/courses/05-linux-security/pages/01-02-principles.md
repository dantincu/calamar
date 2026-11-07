# Security principles

Every technique in this course applies one or more of these principles. When you meet a situation the course doesn't cover, reason from them.

## Least privilege

Every user, process and program gets **only the access it needs, only for as long as it needs it**.

- Services run as dedicated users, not as root (`DynamicUser=yes` in systemd).
- `sudo` rules name exact commands, not `ALL`.
- Capabilities instead of setuid root: a web server needs to bind port 443, not to own the machine.

## Defense in depth

Assume that each layer can fail, and stack independent ones:

```
internet → firewall → SSH keys only → fail2ban → non-root user → sudo rules
         → AppArmor profile → systemd sandbox → auditd logs → off-site backups
```

An attacker who gets past one layer meets the next, and every layer they cross is a chance for detection.

## Secure defaults and fail closed

- Firewalls drop by default (`policy drop`) and allow by exception.
- On error, deny: an unreadable configuration should stop a service, not start it wide open.

## Minimize the attack surface

Uninstall what you don't use. Bind internal services to `127.0.0.1`. Disable SSH features you don't need. Fewer moving parts mean fewer bugs.

## Separation of duties and accountability

- One account per person: shared accounts (and shared root passwords) make logs useless.
- Administrative actions go through `sudo`, which logs who did what.
- Logs are shipped off the machine, where an intruder with root can't edit them.

## Keep it simple, and keep it updated

Complex configurations hide mistakes. Most real compromises exploit **known** vulnerabilities for which a patch already existed. Patching quickly beats almost any clever hardening.

## Don't rely on obscurity, but use it as noise reduction

Moving SSH to port 2222 doesn't stop a determined attacker: a port scan finds it in seconds. But it does cut the automated noise in your logs considerably. It's fine as an *extra*, and never a substitute for keys only.

## Verify

Configuration you haven't tested is a hope, not a control. Every lesson ends with a way to check: `sshd -T`, `nft list ruleset`, `systemd-analyze security`, `auditctl -l`, and the course's `audit-host.sh`.
