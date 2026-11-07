# Networking basics

## Addresses and routes

```bash
$ ip -br address            # interfaces and their addresses, one line each
$ ip route                  # the routing table; "default via ..." is the gateway
$ ip -br link               # interfaces and whether they're UP
```

(`ifconfig` and `route` are the old tools. `ip` replaces both.)

## Is it reachable?

Debug layer by layer, from the bottom up:

```bash
$ ping -c 3 192.168.1.1          # 1. can I reach the gateway?
$ ping -c 3 1.1.1.1              # 2. can I reach the internet by IP?
$ resolvectl query example.com   # 3. does DNS work? (or: dig example.com, host example.com)
$ curl -I https://example.com    # 4. does the service answer? (-I: headers only)
$ tracepath example.com          # where along the path does it stop?
```

If 2 works but 3 fails, it's DNS. Look at `/etc/resolv.conf` and `resolvectl status`.

## What is listening?

```bash
$ sudo ss -tulpn
Netid State  Local Address:Port  Process
tcp   LISTEN 0.0.0.0:22          users:(("sshd",pid=812,fd=3))
tcp   LISTEN 127.0.0.1:5432      users:(("postgres",pid=990,fd=6))
```

`-t` TCP, `-u` UDP, `-l` listening, `-p` the process, `-n` numbers instead of names. `0.0.0.0` (or `[::]`) means reachable from the network, while `127.0.0.1` means local only. This distinction matters a lot for security.

## Talking HTTP

```bash
$ curl https://api.example.com/items                 # GET
$ curl -s https://api.example.com/items | jq .       # pretty-print JSON (install jq)
$ curl -X POST -H "Content-Type: application/json" -d '{"name":"pen"}' https://api.example.com/items
$ curl -o file.iso -L https://example.com/download   # save to a file, following redirects
$ curl -v https://example.com                        # verbose: the TLS handshake and all headers
```

## SSH: the remote shell

```bash
$ ssh ada@server.example.com                 # log in
$ ssh-keygen -t ed25519                      # create a key pair (once)
$ ssh-copy-id ada@server.example.com         # install your public key on the server
$ scp report.pdf ada@server:/tmp/            # copy a file
$ rsync -avz site/ ada@server:/var/www/site/ # synchronize a directory (only the changes)
$ ssh -L 5432:localhost:5432 ada@server      # tunnel: the server's local port 5432 becomes your local port
```

Keys are both more convenient and much more secure than passwords. The security course shows how to turn password logins off entirely.

A `~/.ssh/config` saves typing:

```
Host web
    HostName server.example.com
    User ada
    IdentityFile ~/.ssh/id_ed25519
```

Then `ssh web` is enough.

## Names and hosts

- `/etc/hosts` maps names to addresses locally, and is checked before DNS.
- `hostnamectl` shows and sets the machine's name.
