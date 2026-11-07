# Welcome to the course

Linux runs most of the world's servers, every Android phone, most of the cloud, and the containers your apps probably ship in. Being comfortable at a Linux shell is one of the most useful skills a developer or IT professional can have.

This course takes you from your first command to automating a real task:

1. **Getting started**: what Linux is, how to get a system to practice on, and how the shell works.
2. **Files and the file system**: the directory layout, managing and finding files, links and inodes.
3. **Users and permissions**: accounts, groups, permission bits (with the octal arithmetic behind `chmod 755`) and `sudo`.
4. **The command-line toolbox**: pipes and redirection, text processing with `grep`, `sed` and `awk`, and shell scripting, from first script to robust script.
5. **Processes and services**: signals, `systemd`, logs and scheduled jobs.
6. **Software, storage and networking**: packages, disks and the basic network tools.
7. **Project**: an automated, rotating backup run by a `systemd` timer.

## How to follow along

Type the commands yourself. Reading about the shell is like reading about swimming. Any Linux system works. The next lesson shows several free options, including WSL on Windows.

The pages that teach scripting have sample files attached. Download them, make them executable with `chmod +x file.sh`, and run them.

Commands are shown like this. `$` is the prompt of a normal user, and `#` the prompt of root; you don't type either:

```bash
$ echo "Hello, Linux"
Hello, Linux
```

The follow-up course, *Advanced Linux: Security and Hardening*, builds on everything here.
