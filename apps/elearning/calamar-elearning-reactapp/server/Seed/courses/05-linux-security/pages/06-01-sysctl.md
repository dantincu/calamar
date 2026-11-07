# Kernel hardening with sysctl

`sysctl` reads and writes kernel parameters, which also appear as files under `/proc/sys`. Settings in `/etc/sysctl.d/*.conf` are applied at boot:

```bash
$ sysctl kernel.kptr_restrict           # read one
$ sudo sysctl -w kernel.dmesg_restrict=1   # set it until the next reboot
$ sudo sysctl --system                   # (re)apply every file in sysctl.d
```

The attached `99-hardening.conf` groups the settings by purpose.

## Information leaks

| Setting | Effect |
|---|---|
| `kernel.kptr_restrict = 2` | hides kernel addresses in `/proc`, which exploits use to defeat address randomization (KASLR) |
| `kernel.dmesg_restrict = 1` | only root reads the kernel log, which can also leak addresses |
| `kernel.unprivileged_bpf_disabled = 1` | unprivileged users can't load eBPF programs, a frequent source of kernel exploits |

## Processes

| Setting | Effect |
|---|---|
| `kernel.yama.ptrace_scope = 1` | a process can only debug its own children, so malware can't read the memory of your other processes (like an SSH agent) |
| `fs.suid_dumpable = 0` | setuid programs don't write core dumps, which could contain secrets |
| `kernel.kexec_load_disabled = 1` | no replacing the running kernel without a reboot |

## Files

`fs.protected_symlinks`, `protected_hardlinks`, `protected_fifos` and `protected_regular` block a whole class of attacks in world-writable sticky directories like `/tmp`: the attacker plants a link with a predictable name, and a root process follows it and overwrites a file of the attacker's choice.

## Network

| Setting | Effect |
|---|---|
| `rp_filter = 1` | drops packets whose source address doesn't match the route back (anti-spoofing) |
| `accept_redirects = 0`, `send_redirects = 0` | no ICMP redirects, which could reroute traffic through an attacker |
| `accept_source_route = 0` | refuses packets that dictate their own path |
| `tcp_syncookies = 1` | survives SYN floods |
| `log_martians = 1` | logs packets with impossible addresses |

## Test before you deploy

Some settings break things: `ptrace_scope = 2` stops `gdb -p`, strict `rp_filter` breaks asymmetric routing, and container hosts and routers need `ip_forward = 1`. Apply on a test machine, run your workloads, then roll out.

## Beyond sysctl

- **Kernel lockdown** (`lockdown=integrity` on the kernel command line, automatic with Secure Boot on many distros) stops even root from modifying the running kernel.
- **Module signing**, and `kernel.modules_disabled = 1` after boot on fixed-function servers (no more module loading at all, until reboot).
- **Keep the kernel updated**: no setting compensates for a known local privilege-escalation bug.
