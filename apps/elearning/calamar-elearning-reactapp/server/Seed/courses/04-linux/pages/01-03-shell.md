# The shell

The terminal shows text. The **shell** (usually **bash**, sometimes zsh) reads what you type, runs it and prints the result.

## Anatomy of a command

```
ls  -l  -a  /etc
│   └──┬──┘ └─ argument
│   options (flags)
command
```

- Short options can be combined: `ls -la` is the same as `ls -l -a`.
- Long options use two dashes: `ls --all`.
- Arguments are usually what the command works on: files, directories, text.

## Getting help

```bash
$ man ls          # the manual page; q quits, / searches, n finds the next match
$ ls --help       # a short summary for most commands
$ type cd         # is it a program, a shell builtin or an alias?
$ help cd         # help for bash builtins
$ apropos copy    # search the manual page descriptions
```

## Keys that save hours

| Key | Does |
|---|---|
| `Tab` | completes commands and file names (press twice to list the options) |
| `↑` / `↓` | browse the history |
| `Ctrl+R` | search the history backwards |
| `Ctrl+C` | interrupt the running command |
| `Ctrl+D` | end of input (exits the shell when the line is empty) |
| `Ctrl+A` / `Ctrl+E` | jump to the start / end of the line |
| `Ctrl+L` | clear the screen |

## Variables and the environment

```bash
$ name="Ada"            # no spaces around =
$ echo "Hello, $name"
Hello, Ada
$ echo $HOME $USER $SHELL
$ export EDITOR=nano    # exported variables are passed to the programs you start
$ echo $PATH            # the directories searched for commands, separated by :
```

## Quoting

The shell splits a line into words at spaces and expands special characters *before* the command runs.

| You write | The command receives |
|---|---|
| `echo $HOME/*.txt` | your home path, with `*.txt` expanded to matching file names |
| `echo "$HOME/*.txt"` | the variable expanded, `*` left alone |
| `echo '$HOME/*.txt'` | exactly `$HOME/*.txt` |

**Rule of thumb: put double quotes around variables** (`"$file"`). A file name with a space would otherwise become two arguments.

## Exit codes

Every command ends with an exit code: `0` means success, and anything else is a failure. `$?` holds the last one:

```bash
$ ls /nonexistent; echo $?
ls: cannot access '/nonexistent': No such file or directory
2
$ mkdir -p demo && cd demo      # && runs the second command only if the first succeeded
$ ping -c1 example.com || echo "offline"   # || runs it only if the first failed
```
