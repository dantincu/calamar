# Threat modeling and attack surface

## Four questions

A **threat model** answers four questions (Adam Shostack's framing):

1. **What are we working on?** Draw the system: services, data, users, network paths and trust boundaries.
2. **What can go wrong?** List the threats.
3. **What are we going to do about it?** Mitigate, accept, transfer (insurance, a provider) or eliminate (remove the feature).
4. **Did we do a good job?** Test, review and revisit.

## STRIDE: a checklist of what can go wrong

| Threat | Violates | Linux example | Typical defense |
|---|---|---|---|
| **S**poofing | authenticity | someone logs in as you over SSH | keys, MFA |
| **T**ampering | integrity | a binary in `/usr/bin` is replaced | packages, file integrity checks, read-only file systems |
| **R**epudiation | accountability | "I never ran that command" | per-user accounts, `sudo` logs, `auditd` |
| **I**nformation disclosure | confidentiality | a world-readable backup of `/etc/shadow` | permissions, encryption |
| **D**enial of service | availability | a fork bomb, or a full disk | resource limits, quotas, monitoring |
| **E**levation of privilege | authorization | a setuid bug gives root | least privilege, patches, MAC |

## Risk

Not every threat deserves the same effort. A common, simple model is

$$
\text{risk} = \text{likelihood} \times \text{impact}
$$

scored, for example, from 1 to 5 each. An internet-facing SSH server with password logins scores high on likelihood (it *will* be brute-forced within hours). A stolen database of customers scores high on impact. Spend your effort from the highest product down.

## Attack surface

The **attack surface** is everything an attacker can interact with: listening ports, accounts that can log in, setuid programs, web forms, APIs and people. Each item is a potential entry point, so **reducing the surface is the cheapest defense there is**:

```bash
$ sudo ss -tulpn                         # what listens on the network?
$ systemctl list-units --type=service --state=running
$ awk -F: '$7 !~ /(nologin|false)$/' /etc/passwd     # who can log in?
$ find / -xdev -perm -4000 -type f 2>/dev/null       # setuid programs
```

Every service you don't run is a vulnerability you'll never have to patch.

## Who are the attackers?

Most attacks on a typical server are **automated and opportunistic**: botnets scanning the whole IPv4 space for SSH with weak passwords, unpatched web apps, exposed databases and admin panels. The `access.log` from the fundamentals course showed it: `/.env`, `/wp-admin/`, `/phpmyadmin/`. Basic hygiene (keys only, patches, firewall, no exposed admin interfaces) defeats nearly all of them.

**Targeted** attackers are rarer, more patient and more skilled. Against them you need defense in depth and, above all, **detection**: you assume that some layer will fail, and you make sure that you'll notice when it does.
