# File integrity and rootkits

After a break-in, attackers often modify system files: a backdoored `sshd`, an extra key in `authorized_keys`, a trojaned `ls` that hides their files. **File integrity monitoring (FIM)** detects such changes by comparing files with a trusted baseline.

## Hashes as fingerprints

A cryptographic hash such as SHA-256 maps any file to a 256-bit fingerprint. Changing even one bit of the file changes the fingerprint completely, and finding a different file with the same fingerprint is computationally infeasible:

```bash
$ sha256sum /usr/sbin/sshd
3b1f…e9a4  /usr/sbin/sshd
```

## Verifying against the package manager

The package database already holds checksums of every installed file:

```bash
$ sudo debsums -s                     # Debian/Ubuntu: print only files that don't match (install debsums)
$ sudo dpkg --verify                  # built-in alternative
$ sudo rpm -Va                        # RHEL family: every changed file, with a code per property
```

In `rpm -Va` output, `5` means the checksum differs, `M` the mode, `U` the user and `T` the modification time. Changed configuration files (marked `c`) are normal. A changed binary in `/usr/bin` is not.

**The limit:** an attacker with root can also modify the package database. That's why serious FIM keeps its baseline **off the machine**, or on read-only media.

## AIDE

AIDE (Advanced Intrusion Detection Environment) builds its own database of hashes and attributes for the paths you choose:

```bash
$ sudo apt install aide           # or dnf install aide
$ sudo aide --init                # build the baseline (Debian: sudo aideinit)
$ sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db   # the path may differ by distribution
$ sudo aide --check               # compare with the baseline
```

- Run `--check` daily (a systemd timer), and alert on differences.
- After a legitimate change (updates), review the report, then `aide --update` to accept it.
- Copy the database off the machine after each update.

## Rootkits

A **rootkit** hides an attacker's presence: processes, files, network connections and kernel modules. User-space rootkits replace tools like `ps` and `ls`, and FIM catches those. Kernel rootkits modify the kernel itself, so every tool on the machine can be lied to.

- `rkhunter` and `chkrootkit` look for known signs. They're useful, but they're signature-based and noisy.
- Compare views: processes in `/proc` versus `ps`, and `ss` versus an external port scan. Disagreement is a strong signal.
- Prevent kernel rootkits: Secure Boot with signed modules, `kernel.kexec_load_disabled`, `-e 2` audit rules on module loading, and lockdown mode (`/sys/kernel/security/lockdown`).

## If you find a compromise

**Don't try to clean a rooted machine.** You can't trust anything on it. Isolate it, preserve evidence, find out how they got in, and **rebuild** from known-good images and backups. The project chapter covers this.
