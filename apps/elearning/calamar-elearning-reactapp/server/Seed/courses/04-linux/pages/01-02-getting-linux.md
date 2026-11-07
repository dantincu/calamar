# Getting a Linux system

Pick whichever is easiest for you. You can't break anything that matters on a practice system.

## On Windows: WSL

The **Windows Subsystem for Linux** runs a real Linux kernel in a lightweight virtual machine. From an administrator PowerShell:

```powershell
wsl --install          # installs WSL and Ubuntu; restart when asked
wsl                    # opens a Linux shell
```

Your Windows drives appear under `/mnt/c`, `/mnt/d`… Keep the course exercises in your Linux home directory (`~`), which is much faster.

## On macOS or anywhere: a virtual machine

Install a hypervisor (VirtualBox, UTM on Apple silicon, VMware or Hyper-V), download an Ubuntu Server or Debian ISO and install it. 2 CPUs, 2 GB of RAM and 20 GB of disk are plenty. Take a **snapshot** after installing, so you can roll back after experiments.

## In a container

If you have Docker:

```bash
docker run -it --rm ubuntu:24.04 bash
```

You get a root shell in a minimal system. It's great for quick tests, but it has no `systemd`, and everything disappears when you exit (`--rm`).

## In the cloud

Every cloud provider has small Linux VMs, often within a free tier. You connect with SSH (chapter 6). It's the most realistic option for the project, but remember to delete the VM when you're done.

## First steps after installing

```bash
$ whoami          # your user name
$ hostname        # the machine's name
$ uname -r        # the kernel version
$ cat /etc/os-release   # which distribution
$ sudo apt update && sudo apt upgrade     # Debian/Ubuntu: install updates
$ sudo dnf upgrade                        # Fedora/RHEL family
```
