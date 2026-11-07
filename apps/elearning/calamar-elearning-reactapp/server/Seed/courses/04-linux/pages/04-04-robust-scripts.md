# Writing robust scripts

By default, bash keeps going after errors, treats unset variables as empty strings, and splits unquoted variables at spaces. That's convenient at the prompt and dangerous in scripts. The attached `disk-report.sh` applies every technique on this page.

## Strict mode

```bash
set -euo pipefail
```

| Option | Effect |
|---|---|
| `-e` | exit when a command fails (except in conditions like `if` and `&&`) |
| `-u` | an unset variable is an error, not an empty string |
| `-o pipefail` | a pipeline fails if *any* command in it fails, not just the last one |

Without `-u`, a typo like `rm -rf "$BUILD_DIRR/"` silently becomes `rm -rf /`. With `-u` the script stops. `"${dir:?message}"` adds a clear error message.

## Quote everything

```bash
for f in $(ls *.txt); do …     # breaks on file names with spaces
for f in *.txt; do …           # correct: globs produce whole names
rm $file                       # "my file.txt" becomes two arguments
rm -- "$file"                  # correct; -- ends the options, in case a name starts with -
```

## Check the inputs

```bash
if ! [[ $threshold =~ ^[0-9]+$ ]] || (( threshold > 100 )); then
  echo "The threshold must be a number from 0 to 100" >&2
  exit 2
fi
```

Send errors to **stderr** (`>&2`), and use distinct **exit codes**, so that callers (cron, systemd, other scripts) can react.

## Options with getopts

```bash
while getopts ":t:h" opt; do
  case $opt in
    t) threshold=$OPTARG ;;
    h) usage; exit 0 ;;
    \?) echo "Unknown option: -$OPTARG" >&2; exit 2 ;;
  esac
done
```

## Clean up with trap

```bash
tmp=$(mktemp)                 # a unique temporary file, never a fixed name like /tmp/data
trap 'rm -f "$tmp"' EXIT      # runs however the script ends: success, error or Ctrl+C
```

## Parsing output safely

`IFS=$'\n\t'` makes word splitting happen only at newlines and tabs, which is safer for file names. But `read` uses `IFS` too: with that setting, `read -r a b c` no longer splits a line at spaces. `disk-report.sh` had exactly that bug in its first version: it silently found no full disks. The script now matches each `df` line with a regular expression (`[[ $line =~ $pattern ]]` with `BASH_REMATCH`), which also copes with mount points that contain spaces.

The lesson: **test the failure path**. A monitoring script that never warns looks exactly like a healthy system.

## Make writes atomic

```bash
tar -czf "$out.partial" …  &&  mv "$out.partial" "$out"
```

`mv` within one file system is atomic, so readers never see a half-written file. The backup project uses this.

## Check your scripts

**ShellCheck** (`apt install shellcheck`) finds quoting bugs, unused variables and dozens of classic mistakes:

```bash
$ shellcheck disk-report.sh
```

## When not to use bash

Past about 100 lines, or when you need data structures, JSON or serious error handling, switch to Python or another real language. Bash is the glue, not the whole program.
