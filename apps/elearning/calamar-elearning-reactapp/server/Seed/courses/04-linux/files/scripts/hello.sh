#!/usr/bin/env bash
# hello.sh: the building blocks of a shell script.
#   chmod +x hello.sh
#   ./hello.sh Ada Linus

greeting="Hello"            # no spaces around =
count=$#                    # number of arguments

# A function: arguments are $1, $2, ... inside it too
greet() {
  local name=$1             # 'local' keeps the variable inside the function
  echo "$greeting, $name!"
}

# if / elif / else: [[ ... ]] is bash's test command
if [[ $count -eq 0 ]]; then
  echo "Usage: $0 NAME..." >&2   # errors go to stderr
  exit 1
elif [[ $count -eq 1 ]]; then
  echo "One name given."
else
  echo "$count names given."
fi

# for over the arguments: always quote "$@" so names with spaces stay whole
for name in "$@"; do
  greet "$name"
done

# Command substitution and arithmetic
today=$(date +%A)
echo "Today is $today, and $count squared is $((count * count))."

# while with a counter
i=3
while (( i > 0 )); do
  echo "Countdown: $i"
  (( i-- ))
done

# case: matching patterns
case "${1,,}" in            # ${1,,} = first argument in lowercase
  root|admin) echo "Careful, $1." ;;
  a*)         echo "$1 starts with an A." ;;
  *)          echo "Nice to meet you, $1." ;;
esac
