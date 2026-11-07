# Package management

A **package manager** installs software from the distribution's repositories. It resolves dependencies, verifies signatures and keeps everything updatable with one command. Prefer it to downloading programs from websites.

| Task | Debian / Ubuntu (`apt`) | Fedora / RHEL (`dnf`) |
|---|---|---|
| Refresh the package lists | `sudo apt update` | (automatic) |
| Upgrade everything | `sudo apt upgrade` | `sudo dnf upgrade` |
| Install | `sudo apt install nginx` | `sudo dnf install nginx` |
| Remove | `sudo apt remove nginx` | `sudo dnf remove nginx` |
| Search | `apt search json` | `dnf search json` |
| Show details | `apt show nginx` | `dnf info nginx` |
| Which package owns a file? | `dpkg -S /usr/bin/curl` | `rpm -qf /usr/bin/curl` |
| List the installed packages | `apt list --installed` | `dnf list installed` |
| Remove unneeded dependencies | `sudo apt autoremove` | `sudo dnf autoremove` |

## Repositories and trust

Repositories are listed in `/etc/apt/sources.list.d/` (apt) and `/etc/yum.repos.d/` (dnf). Packages are signed, and the package manager refuses packages whose signatures don't match a trusted key.

Adding a third-party repository means trusting its owner with **root on your machine**, because package install scripts run as root. Add only vendors you would trust with that.

## Other ways to get software

| Method | Notes |
|---|---|
| Snap, Flatpak | sandboxed desktop apps that bundle their dependencies |
| Language package managers (pip, npm, cargo) | for development; prefer per-project virtual environments over `sudo pip install` |
| Containers | ship the app with its whole user space |
| Building from source | `./configure && make && sudo make install` puts files in `/usr/local`, outside the package manager's knowledge |

## Updates

Security updates matter most. On servers, automate them: `unattended-upgrades` on Debian and Ubuntu, `dnf-automatic` on Fedora and RHEL. After a kernel update, you need a reboot to run the new kernel:

```bash
$ cat /var/run/reboot-required 2>/dev/null   # Debian/Ubuntu: present if a reboot is needed
$ sudo needs-restarting -r                    # RHEL family (dnf-utils)
```
