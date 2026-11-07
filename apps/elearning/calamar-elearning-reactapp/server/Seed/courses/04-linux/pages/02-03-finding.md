# Finding files and text

## find: search by name, type, size, time, owner…

```bash
$ find ~/projects -name "*.md"               # by name (quote the pattern, so the shell doesn't expand it)
$ find . -iname "readme*"                    # case-insensitive
$ find /var/log -type f -size +10M           # regular files over 10 MiB
$ find ~ -type d -name node_modules -prune   # directories (and don't descend into them)
$ find /tmp -type f -mtime +7                # modified more than 7 days ago
$ find /etc -newer /etc/hostname             # modified more recently than a reference file
$ find / -user ada 2>/dev/null               # owned by ada; hide "Permission denied" errors
```

Tests are combined with AND by default. Use `-o` for OR and `!` for NOT:

```bash
$ find . \( -name "*.jpg" -o -name "*.png" \) ! -path "*/thumbnails/*"
```

### Acting on the results

```bash
$ find . -name "*.tmp" -delete                       # delete them (run without -delete first!)
$ find . -name "*.sh" -exec chmod +x {} +            # run a command on all the results at once
$ find . -type f -print0 | xargs -0 wc -l            # safe with spaces and newlines in names
```

## locate: fast lookup in an index

```bash
$ locate sshd_config        # instant, but only as fresh as the index
$ sudo updatedb             # refresh the index
```

(Install the `plocate` package if `locate` is missing.)

## grep: search inside files

```bash
$ grep "error" app.log                 # lines containing "error"
$ grep -i "error" app.log              # ignore case
$ grep -n "TODO" *.js                  # with line numbers
$ grep -r "listen" /etc/nginx/         # recursively through a directory
$ grep -rl "password" ~/projects       # just the names of matching files
$ grep -v "^#" /etc/ssh/sshd_config    # lines NOT matching: here, drop the comments
$ grep -E "warn|error" app.log         # extended regular expressions: | means OR
$ grep -c "404" access.log             # count the matching lines
```

## which, type and whereis: where is a command?

```bash
$ which python3          # the path of the program that would run
$ type ll                # also shows aliases and functions
$ whereis ssh            # the binary, its sources and man pages
```
