# Managing files

## Listing

```bash
$ ls -l
-rw-r--r-- 1 ada ada  1234 Nov  7 10:15 notes.txt
drwxr-xr-x 2 ada ada  4096 Nov  7 10:16 photos
```

From left to right: the type and permissions (chapter 3), the link count, the owner, the group, the size in bytes, the modification time and the name. Useful variations:

- `ls -lh`: human-readable sizes (`1.2K`, `3.4M`).
- `ls -lt`: newest first.
- `ls -lS`: largest first.
- `ls -ld dir`: the directory itself, not its contents.

## Creating, copying, moving, deleting

```bash
$ mkdir -p projects/site/css      # -p creates the parents too and doesn't fail if it exists
$ touch index.html                # creates an empty file (or updates its time stamp)
$ cp index.html backup.html       # copy
$ cp -r projects projects-old     # copy a directory recursively
$ cp -a src/ dest/                # archive mode: keep permissions, owners and times
$ mv backup.html old/             # move
$ mv old.txt new.txt              # moving within a directory is renaming
$ rm file.txt                     # delete a file
$ rm -r directory                 # delete a directory and everything in it
$ rmdir empty-dir                 # delete only if empty
```

**There is no recycle bin.** `rm` deletes immediately. Habits that help:

- `rm -i` asks before each deletion.
- Run `ls` with the same pattern first: `ls *.log`, then `rm *.log`.
- Be extremely careful with `rm -rf` and variables: `rm -rf "$dir/"` with an empty `$dir` becomes `rm -rf /`. Scripts should use `set -u` (chapter 4) and `"${dir:?}"`.

## Wildcards (globbing)

The shell expands patterns *before* running the command:

| Pattern | Matches |
|---|---|
| `*` | any characters, including none |
| `?` | exactly one character |
| `[abc]`, `[0-9]` | one character from the set or range |
| `{jpg,png}` | each alternative (brace expansion, which also works for names that don't exist) |

```bash
$ ls *.txt
$ cp photo-??.jpg album/
$ mkdir -p 2026/{01,02,03}
$ mv report.{txt,md}            # renames report.txt to report.md
```

## Viewing and editing

```bash
$ cat file.txt                  # print the whole file
$ less /var/log/syslog          # page through it: Space, b, /search, q
$ head -n 20 file.txt           # first 20 lines
$ tail -n 20 file.txt           # last 20 lines
$ tail -f /var/log/syslog       # follow new lines as they arrive (Ctrl+C stops)
$ nano file.txt                 # a friendly editor (the shortcuts are at the bottom)
$ vim file.txt                  # powerful: i inserts, Esc then :wq saves and quits, :q! quits without saving
```
