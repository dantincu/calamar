# Text processing: grep, cut, sort, uniq, sed and awk

Logs, CSV exports, configuration files and command outputs are all text. A handful of tools can answer most questions about them.

## The attached example

`access.log` is a small web server log, with one request per line:

```
198.51.100.23 - - [07/Nov/2026:10:01:16 +0000] "POST /login HTTP/1.1" 401 512 "-" "Mozilla/5.0"
└─ field 1                 field 4                 6     7       8     9   10
```

`log-report.sh` answers questions about it with the tools below. Run it with `./log-report.sh access.log`.

## cut: extract columns

```bash
$ cut -d' ' -f1 access.log          # the 1st space-separated field: client IPs
$ cut -d: -f1,7 /etc/passwd         # user names and shells
$ cut -c1-10 file                   # characters 1 to 10
```

## sort and uniq

```bash
$ sort names.txt                    # alphabetically
$ sort -n numbers.txt               # numerically
$ sort -rn                          # numerically, largest first
$ sort -t, -k3 data.csv             # by the 3rd comma-separated field
$ sort -u                           # sorted, without duplicates
$ uniq -c                           # count ADJACENT equal lines (so sort first)
```

The **counting idiom** comes up again and again:

```bash
$ cut -d' ' -f1 access.log | sort | uniq -c | sort -rn
      6 198.51.100.23
      4 203.0.113.7
      3 203.0.113.42
      3 192.0.2.55
```

## wc, head and tail

```bash
$ wc -l access.log                  # lines (-w words, -c bytes)
$ head -n 3 file; tail -n 3 file
```

## sed: edit streams

sed applies editing commands to each line. Its most used command is substitution, `s/old/new/flags`:

```bash
$ sed 's/http:/https:/' links.txt          # the first match on each line
$ sed 's/http:/https:/g' links.txt         # all the matches (g = global)
$ sed -n '10,20p' file                     # print only lines 10 to 20
$ sed '/^#/d' config                       # delete comment lines
$ sed -i.bak 's/8080/9090/' app.conf       # edit the file in place, keeping app.conf.bak
```

## awk: fields, conditions and arithmetic

awk splits each line into fields `$1`, `$2`… (`$0` is the whole line, and `NF` the number of fields). Programs are `condition { action }` pairs:

```bash
$ awk '{ print $1, $9 }' access.log                      # IP and status
$ awk '$9 == 404 { print $7 }' access.log                # paths that returned 404
$ awk '$9 >= 500' access.log                             # whole lines with server errors
$ awk '{ sum += $10 } END { print sum " bytes" }' access.log   # a total
$ awk -F: '$3 >= 1000 { print $1 }' /etc/passwd          # -F sets the separator: regular users
$ awk '{ n[$9]++ } END { for (s in n) print s, n[s] }' access.log   # counts in an associative array
```

## Regular expressions in one table

| Pattern | Matches |
|---|---|
| `.` | any one character |
| `*`, `+`, `?` | the previous item 0+, 1+, 0 or 1 times (`+` and `?` need `grep -E`) |
| `^`, `$` | the start and end of the line |
| `[0-9]`, `[^a-z]` | a character in / not in the set |
| `\b` | a word boundary |
| `(a|b)` | alternatives (`grep -E`) |

```bash
$ grep -E '^([0-9]{1,3}\.){3}[0-9]{1,3} ' access.log    # lines starting with an IPv4 address
```

## Exercise

Using only pipelines on `access.log`: which IP made the most failed login attempts, and which IP probed for paths like `/.env` and `/wp-admin/`? (Both are classic signs of automated attacks. The security course shows how `fail2ban` blocks them.)
