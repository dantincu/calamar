# Permissions

```bash
$ ls -l deploy.sh
-rwxr-x--- 1 ada developers 812 Nov  7 deploy.sh
```

The first character is the type (`-` file, `d` directory, `l` symbolic link). Then come three triplets:

| | owner (`u`) | group (`g`) | others (`o`) |
|---|---|---|---|
| bits | `rwx` | `r-x` | `---` |

## What r, w and x mean

| | On a file | On a directory |
|---|---|---|
| `r` | read the contents | list the names inside |
| `w` | change the contents | create, delete and rename entries inside |
| `x` | run it as a program | enter it, and reach the files inside by name |

Note that deleting a file depends on the **directory's** `w`, not on the file's permissions. The kernel checks **one** class: owner if you own the file, otherwise group if you're in its group, otherwise others. So an owner with `---` can't read their own file, even if "others" can.

## Octal notation

Each triplet is a 3-bit number, with $r = 4$, $w = 2$ and $x = 1$:

$$
\text{digit} = 4r + 2w + x, \qquad r, w, x \in \{0, 1\}
$$

| Bits | `rwx` | `rw-` | `r-x` | `r--` | `---` |
|---|---|---|---|---|---|
| Digit | 7 | 6 | 5 | 4 | 0 |

So `rwxr-x---` is $(4{+}2{+}1)(4{+}1)(0) = 750$, and the full mode is the number $d_u \cdot 8^2 + d_g \cdot 8 + d_o$ written in base 8.

```bash
$ chmod 750 deploy.sh        # rwxr-x---
$ chmod 644 notes.txt        # rw-r--r--: the usual mode for files
$ chmod 755 ~/bin            # rwxr-xr-x: the usual mode for directories and programs
$ chmod 600 ~/.ssh/id_ed25519  # private key: the owner only
```

Symbolic notation changes individual bits:

```bash
$ chmod u+x script.sh        # add execute for the owner
$ chmod go-w shared.txt      # remove write from group and others
$ chmod -R g+rX project/     # X: execute only on directories (and files already executable)
```

## umask: the default permissions

New files start from `666` (and directories from `777`). The **umask** removes bits:

$$
\text{mode} = \text{base} \wedge \lnot\,\text{umask}
$$

(a bitwise AND with the complement). With the common umask `022`: files get $666 \wedge \lnot 022 = 644$, and directories $777 \wedge \lnot 022 = 755$. With `077`, nobody else gets anything: files get $600$ and directories $700$.

```bash
$ umask          # show the current value
0022
$ umask 077      # for this shell: private by default
```

It's an AND-NOT, not a subtraction: with umask `033`, a file gets $666 \wedge \lnot 033 = 644$, while $666 - 033$ would be $633$.

## Special bits

A fourth, leading octal digit holds three special bits: **setuid** (4), **setgid** (2) and **sticky** (1).

- **setuid** on a program: it runs as the file's owner. `/usr/bin/passwd` is setuid root, so it can write `/etc/shadow`.
- **setgid** on a directory: new files inherit the directory's group, which is handy for shared folders.
- **sticky** on a directory: only a file's owner can delete it. That's how `/tmp` (mode `1777`) is world-writable but safe.

```bash
$ ls -ld /tmp
drwxrwxrwt 15 root root 4096 Nov  7 /tmp
$ chmod 2775 /srv/shared     # setgid + rwxrwxr-x
```

The security course looks at why setuid programs are a favorite target of attackers.
