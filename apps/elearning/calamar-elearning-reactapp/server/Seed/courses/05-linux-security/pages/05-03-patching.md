# Patch and vulnerability management

Most real-world compromises exploit **known** vulnerabilities, for which patches existed weeks or years before the attack. Fast, boring, automatic patching beats almost any clever defense.

## Automatic security updates

Debian and Ubuntu:

```bash
$ sudo apt install unattended-upgrades
$ sudo dpkg-reconfigure -plow unattended-upgrades
$ cat /etc/apt/apt.conf.d/50unattended-upgrades     # which origins; Automatic-Reboot "true" with a time
$ sudo unattended-upgrade --dry-run -d               # what it would do
```

Fedora and RHEL:

```bash
$ sudo dnf install dnf-automatic
$ sudo sed -i 's/^apply_updates.*/apply_updates = yes/' /etc/dnf/automatic.conf
$ sudo systemctl enable --now dnf-automatic.timer
```

## Restarts and reboots

An update isn't applied until the code runs:

- **Libraries**: running processes keep the old version in memory. Restart them (`needrestart` on Debian/Ubuntu, `needs-restarting -s` on RHEL).
- **Kernel**: needs a reboot, or live patching (Canonical Livepatch, kpatch) for critical fixes between maintenance windows.

Schedule reboots. A server with 600 days of uptime is a server with 600 days of unpatched kernel bugs.

## Prioritizing: CVEs, CVSS, EPSS and KEV

Each publicly known vulnerability gets a **CVE** identifier. Several signals help you decide what to patch first:

| Signal | Answers | Scale |
|---|---|---|
| **CVSS** base score | how severe is it, technically? | 0–10 (≥ 9 critical) |
| **EPSS** | how likely is exploitation in the next 30 days? | probability 0–1 |
| **CISA KEV** catalog | is it being exploited in the wild **right now**? | yes or no |

A CVSS 9.8 in a component you don't expose may matter less than a CVSS 7.5 that's in KEV and runs on your public web server. Combine the signals with your own exposure:

$$
\text{priority} \approx \text{severity} \times \text{likelihood of exploitation} \times \text{exposure}
$$

This is the risk formula from chapter 1, with the likelihood estimated by data.

## Know what you run

You can't patch what you don't know about:

```bash
$ apt list --upgradable         # pending updates
$ dnf updateinfo list security  # pending security advisories (RHEL family)
```

Keep an inventory of servers, their roles and what they expose. Software installed outside the package manager (tarballs in `/opt`, `pip install`, containers) doesn't get updated by `apt`, so track it separately. Container images need rebuilding to pick up fixes, and scanners like Trivy or Grype list the CVEs in an image.

## Measure

Track the **time to patch**: the days between a fix's release and its installation. For internet-facing systems and actively exploited (KEV) vulnerabilities, aim for days, not months.
