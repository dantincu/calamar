# Shell scripting basics

A script is a text file of commands. Anything you type twice is a candidate.

## The first line

```bash
#!/usr/bin/env bash
```

The **shebang** tells the kernel which interpreter runs the file. `/usr/bin/env bash` finds bash wherever it's installed. Then:

```bash
$ chmod +x hello.sh
$ ./hello.sh Ada          # ./ because the current directory isn't in $PATH
```

The attached `hello.sh` demonstrates everything on this page.

## Arguments

| Variable | Holds |
|---|---|
| `$0` | the script's name |
| `$1`, `$2`, … | the arguments |
| `$#` | the number of arguments |
| `"$@"` | all the arguments, each kept as one word (always quote it) |
| `$?` | the exit code of the last command |
| `$$` | the script's process ID |

## Conditions

```bash
if [[ -f "$file" ]]; then
  echo "$file exists"
elif [[ -d "$file" ]]; then
  echo "$file is a directory"
else
  echo "no such file"
fi
```

Common tests inside `[[ … ]]`:

| Test | True when |
|---|---|
| `-f path`, `-d path`, `-e path` | it's a file / a directory / it exists |
| `-r`, `-w`, `-x path` | readable / writable / executable |
| `-z "$s"`, `-n "$s"` | the string is empty / not empty |
| `"$a" == "$b"`, `"$a" != "$b"` | the strings are equal / different (`==` also matches patterns: `[[ $f == *.txt ]]`) |
| `$s =~ regex` | the string matches the regular expression |
| `$a -eq $b`, `-ne`, `-lt`, `-le`, `-gt`, `-ge` | numeric comparisons |

For arithmetic, use `(( … ))`: `if (( count > 10 )); then …`. Any command can be a condition, through its exit code: `if grep -q error log.txt; then …`.

## Loops

```bash
for file in *.jpg; do
  convert "$file" -resize 50% "small-$file"
done

for i in {1..5}; do echo "$i"; done

for (( i = 0; i < 3; i++ )); do echo "$i"; done

while read -r line; do          # read a file line by line
  echo "> $line"
done < input.txt
```

## Functions

```bash
backup_file() {
  local src=$1                       # local variables don't leak out
  cp -- "$src" "$src.$(date +%F).bak"
}
backup_file /etc/hosts
```

Functions return an exit code with `return N`. To return *data*, print it and capture it with `$(…)`.

## Arithmetic and strings

```bash
total=$(( price * quantity ))
(( count++ ))
file="report.final.pdf"
echo "${file%.pdf}"      # remove a suffix: report.final
echo "${file##*.}"       # the extension: pdf
echo "${#file}"          # the length: 16
echo "${name:-guest}"    # a default when name is unset or empty
echo "${name^^}"         # uppercase
```
