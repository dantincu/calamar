# Links and inodes

## What a file really is

On disk, a file's metadata lives in an **inode**: owner, permissions, size, time stamps and where its data blocks are. The inode doesn't contain the **name**. Names live in directories, which are tables that map names to inode numbers.

```bash
$ ls -i notes.txt
1311234 notes.txt
$ stat notes.txt          # everything the inode knows
```

## Hard links

A hard link is a second name for the same inode:

```bash
$ ln notes.txt notes-link.txt
$ ls -li notes*
1311234 -rw-r--r-- 2 ada ada 1234 Nov  7 10:15 notes-link.txt
1311234 -rw-r--r-- 2 ada ada 1234 Nov  7 10:15 notes.txt
```

Both names have the same inode number, and the **link count** is now 2. Editing through either name changes the same data. Deleting one name decrements the count. The data is freed only when the count reaches 0 *and* no process still has the file open.

Hard links can't point to directories, and can't cross file systems, because inode numbers are only unique within one file system.

## Symbolic links

A symbolic (soft) link is a small file that contains a **path**:

```bash
$ ln -s /etc/nginx/sites-available/site.conf /etc/nginx/sites-enabled/site.conf
$ ls -l /etc/nginx/sites-enabled/
lrwxrwxrwx 1 root root 36 Nov  7 site.conf -> /etc/nginx/sites-available/site.conf
```

- They can point to directories and across file systems.
- If the target is deleted or moved, the link **dangles** (it's shown in red by `ls`).
- `readlink -f path` resolves all the links in a path.

| | Hard link | Symbolic link |
|---|---|---|
| Points to | an inode | a path |
| Survives renaming the target | yes | no |
| Directories | no | yes |
| Across file systems | no | yes |

## Why disks fill up "invisibly"

A deleted log file that a process still has open keeps using space until the process closes it. `df` shows the disk full, while `du` can't find the space. To find such files:

```bash
$ sudo lsof +L1          # open files with a link count below 1: deleted but still open
```

Restarting the process (or truncating the file through `/proc/<pid>/fd/<n>`) frees the space.

## Inodes can run out

Each file system has a fixed number of inodes. Millions of tiny files (caches, mail queues) can exhaust them while gigabytes remain free:

```bash
$ df -i           # inode usage per file system
```
