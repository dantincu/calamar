# Users and groups

## Who am I?

```bash
$ id
uid=1000(ada) gid=1000(ada) groups=1000(ada),27(sudo),998(docker)
```

The kernel works with numbers: a **UID** for the user, a primary **GID** and a list of supplementary groups. Names are just for people.

- **UID 0 is root**, the superuser, to whom most permission checks don't apply.
- **System accounts** (UIDs below 1000 on most distros) run services: `www-data`, `postgres`, `sshd`. They usually can't log in.
- **Regular users** start at 1000.

## Where accounts are stored

```bash
$ grep ada /etc/passwd
ada:x:1000:1000:Ada Lovelace:/home/ada:/bin/bash
```

The seven fields, separated by `:`, are: name, password placeholder (`x` means "see /etc/shadow"), UID, primary GID, comment, home directory and login shell.

- `/etc/shadow` holds the password hashes, and only root can read it.
- `/etc/group` lists the groups and their members.

## Managing accounts

```bash
$ sudo useradd -m -s /bin/bash -c "Grace Hopper" grace   # -m creates the home directory
$ sudo passwd grace                  # set the password
$ sudo usermod -aG docker grace      # add to a supplementary group (-a = append; without it, other groups are removed!)
$ sudo gpasswd -d grace docker       # remove from a group
$ sudo usermod -L grace              # lock the password
$ sudo userdel -r grace              # delete, with the home directory
$ sudo groupadd developers
```

On Debian and Ubuntu, `adduser grace` is an interactive, friendlier front end.

Group changes apply to **new** login sessions. Log out and back in, or start a shell in the new group with `newgrp docker`.

## Switching users

```bash
$ su - grace          # become grace (asks for grace's password); - gives a full login environment
$ sudo -u grace whoami  # run one command as grace (asks for YOUR password, if you're allowed)
```

## File ownership

```bash
$ sudo chown grace report.txt            # change the owner
$ sudo chown grace:developers report.txt # the owner and the group
$ sudo chown -R www-data:www-data /var/www/site
$ chgrp developers report.txt            # just the group (you must be a member)
```

Only root can give a file away to another user. Otherwise, users could dodge disk quotas or plant files that look like someone else's.
