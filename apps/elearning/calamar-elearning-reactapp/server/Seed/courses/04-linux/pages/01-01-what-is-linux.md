# What is Linux?

Strictly speaking, **Linux is a kernel**: the core of an operating system that manages the CPU, memory, devices and processes. Linus Torvalds started it in 1991, and thousands of developers maintain it today.

A kernel alone isn't usable. A complete system adds:

| Layer | Examples |
|---|---|
| Boot loader | GRUB, systemd-boot |
| Kernel | Linux |
| Init system and service manager | systemd |
| Core user-space tools | GNU coreutils (`ls`, `cp`…), bash, util-linux |
| Package manager | apt, dnf, pacman, zypper |
| Optional desktop | GNOME, KDE Plasma, Xfce |

## Distributions

A **distribution** (distro) packages all of this together, with an installer, a release schedule and security updates.

| Family | Distros | Package tool | Typical use |
|---|---|---|---|
| Debian | Debian, Ubuntu, Linux Mint | `apt` (`.deb`) | servers, desktops, cloud |
| Red Hat | RHEL, Fedora, Rocky Linux, AlmaLinux | `dnf` (`.rpm`) | enterprise servers |
| Arch | Arch Linux, Manjaro | `pacman` | rolling-release desktops |
| SUSE | openSUSE, SLES | `zypper` (`.rpm`) | enterprise, Europe |
| Alpine | Alpine Linux | `apk` | small containers |

The commands in this course work on all of them, except package management, where we show `apt` and `dnf`.

## The Unix philosophy

Linux follows ideas from Unix (1970s):

- **Everything is a file**: documents, but also devices (`/dev/sda`), kernel information (`/proc/cpuinfo`) and settings.
- **Small tools that do one thing well**, combined with pipes (chapter 4).
- **Plain text** for configuration and data, so the same tools work on everything.

## Why the command line?

Graphical tools exist, but servers usually have no screen, and the command line is:

- **repeatable**: a command can be saved, shared and put in a script;
- **remote**: works over SSH from anywhere;
- **composable**: tools combine in ways their authors never planned.
