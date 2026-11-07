# Welcome to the course

This is the advanced follow-up to *Linux Fundamentals*. It assumes you are comfortable with the shell, permissions, `sudo`, `systemd` and basic networking, and it teaches you to make a Linux server **hard to break into, and noisy when someone tries**.

## What you will learn

1. **Thinking about security**: threat models, attack surface, and the principles that every hardening step applies.
2. **Accounts and authentication**: password hashing and PAM, tight `sudo` rules, and SSH that accepts keys only and bans scanners.
3. **Files and privileges**: setuid programs, capabilities and ACLs, and mandatory access control with AppArmor and SELinux.
4. **Network defense**: a default-deny `nftables` firewall, and services sandboxed by `systemd`.
5. **Monitoring and detection**: the audit framework, file integrity checks and patch management.
6. **Kernel and containers**: `sysctl` hardening, namespaces and cgroups, and running containers safely.
7. **Project**: auditing a host with a script, and what to do when you find a compromise.

## The sample files

Each topic comes with a ready-to-adapt configuration file: `sshd_config` drop-in, `fail2ban` jail, `sudoers` rules, an `nftables` ruleset, a sandboxed `systemd` unit, `auditd` rules, `sysctl` settings, an AppArmor profile, and `audit-host.sh`, a read-only audit script.

## A warning before you start

Hardening can lock you out. A wrong SSH or firewall setting on a remote server can cost you access to it. Throughout the course:

- **practice on a virtual machine** with a snapshot to return to;
- **keep a second session open** while changing SSH or the firewall;
- **check the syntax** before applying (`sshd -t`, `nft -c`, `visudo -c`);
- know your provider's **out-of-band console** (VNC, serial console) before you need it.

Everything here is defensive. You'll learn how attacks work so that you can stop them on systems you're responsible for.
