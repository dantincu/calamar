# Processes and signals

## Looking at processes

```bash
$ ps aux                     # every process: user, PID, %CPU, %MEM, command
$ ps -ef --forest            # with the parent-child tree
$ pgrep -a nginx             # PIDs and command lines matching a name
$ top                        # live view (q quits, M sorts by memory, P by CPU)
$ htop                       # a friendlier top (install it)
```

Every process has a **PID** and a parent (**PPID**). PID 1 is the init system, `systemd` on most distributions, and it's the ancestor of everything else.

## Load average

```bash
$ uptime
 10:21:07 up 12 days,  3:02,  2 users,  load average: 0.42, 0.65, 0.71
```

The three numbers are the average number of processes running or waiting to run (including some waiting for disk I/O) over the last 1, 5 and 15 minutes. Compare them with the number of CPUs (`nproc`): a load of 4 is busy for 2 CPUs but light for 16.

## Signals

Signals are short messages that the kernel delivers to processes:

| Signal | Number | Meaning |
|---|---|---|
| `SIGTERM` | 15 | please terminate (the default for `kill`); the program can clean up |
| `SIGKILL` | 9 | terminate now; it can't be caught, so no clean-up happens |
| `SIGINT` | 2 | interrupt (`Ctrl+C`) |
| `SIGHUP` | 1 | the terminal went away; many daemons reload their configuration on it |
| `SIGSTOP` / `SIGCONT` | 19 / 18 | pause / resume (`Ctrl+Z` sends the similar SIGTSTP) |

```bash
$ kill 4321                  # SIGTERM
$ kill -9 4321               # SIGKILL: only when TERM didn't work
$ kill -HUP $(pgrep -o nginx)  # ask the nginx master process to reload
$ pkill -f "python server.py"  # by command line
```

Always try `SIGTERM` first: `kill -9` can leave lock files, temporary files and half-written data behind.

## Jobs: foreground and background

```bash
$ long-task &                # start in the background
$ jobs                       # list this shell's jobs
$ fg %1                      # bring job 1 to the foreground
$ # Ctrl+Z pauses the foreground job, then:
$ bg                         # resume it in the background
$ nohup long-task &          # keep running after you log out
```

For anything that should keep running for real, use a **systemd service** (next lesson), or a terminal multiplexer like `tmux`, which keeps sessions alive across disconnections.

## Priorities

```bash
$ nice -n 10 ./backup.sh     # start with a lower priority (from -20, highest, to 19, lowest)
$ renice 15 -p 4321          # change it while it runs
```
