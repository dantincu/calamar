# Redirection and pipes

Every process starts with three open streams:

| Number | Name | Default |
|---|---|---|
| 0 | standard input (stdin) | the keyboard |
| 1 | standard output (stdout) | the terminal |
| 2 | standard error (stderr) | the terminal |

## Redirection

```bash
$ ls -l > listing.txt          # stdout to a file (overwrites it)
$ ls -l >> listing.txt         # append
$ sort < names.txt             # stdin from a file
$ find / -name "*.conf" 2> errors.txt     # stderr to a file
$ find / -name "*.conf" 2> /dev/null      # throw errors away
$ make > build.log 2>&1        # both stdout and stderr to the same file
$ make &> build.log            # bash shorthand for the same
```

`2>&1` means "send stream 2 where stream 1 currently goes". Order matters: `> file 2>&1` sends both to the file, while `2>&1 > file` sends only stdout there.

## Here-documents

Feed several lines to a command's stdin:

```bash
cat > config.ini <<EOF
[server]
host = $(hostname)
port = 8080
EOF
```

Variables are expanded inside. Use `<<'EOF'` (quoted) to keep the text literal.

## Pipes

`|` connects one command's stdout to the next command's stdin. Each tool does one small step:

```bash
$ ps aux | grep nginx                       # filter
$ cat /etc/passwd | cut -d: -f1 | sort      # extract a field, sort
$ du -sh * | sort -h | tail -5              # the five largest items here
$ history | awk '{print $2}' | sort | uniq -c | sort -rn | head
#           ^ the command        count equal lines  ^ most used first
```

## tee: save and pass on

```bash
$ ./build.sh | tee build.log | grep -i error     # the full log in a file, errors on screen
```

## Command substitution

`$(...)` is replaced by the command's output:

```bash
$ echo "Today is $(date +%F) and there are $(ls | wc -l) entries here"
$ kill $(pgrep -f old-server)
```

## Process substitution

`<(...)` makes a command's output look like a file. That's useful for tools that want two files:

```bash
$ diff <(ls dir1) <(ls dir2)
$ diff <(ssh web1 cat /etc/nginx/nginx.conf) <(ssh web2 cat /etc/nginx/nginx.conf)
```

## xargs: output to arguments

Some commands take arguments, not stdin. xargs bridges the gap:

```bash
$ find . -name "*.log" -print0 | xargs -0 gzip      # -print0/-0: safe with any file name
$ cat hosts.txt | xargs -n1 -P4 ping -c1            # one host per command, 4 in parallel
```
