# Password storage and PAM

## What's in /etc/shadow

```
ada:$y$j9T$Vh7Yw3...$Gq0x.../:20034:0:99999:7:::
```

The second field is the password hash, in the format `$id$parameters$salt$hash`:

| `$id$` | Algorithm | Status |
|---|---|---|
| `$y$` | yescrypt | the default on Debian 11+, Ubuntu 22.04+ and Fedora 35+ |
| `$6$` | SHA-512 crypt | acceptable (RHEL's default) |
| `$5$` | SHA-256 crypt | acceptable |
| `$1$` | MD5 crypt | obsolete: crackable |
| 13 characters, no `$` | DES crypt | broken |
| `!` or `*` prefix | locked | password login disabled |

The **salt** is random per user, so identical passwords produce different hashes, and precomputed tables are useless. yescrypt and SHA-512 crypt are **deliberately slow** (many iterations, and in yescrypt's case a lot of memory), which limits how fast stolen hashes can be guessed.

The remaining fields hold the date of the last change (in days since 1970), and the minimum and maximum ages and warning period for password expiry.

## Why slow hashing matters: the arithmetic

An attacker with stolen hashes tries candidate passwords offline. With $N$ possible passwords and $r$ guesses per second, the expected time to find one is

$$
t \approx \frac{N}{2r}
$$

An 8-character password of lowercase letters has $N = 26^8 \approx 2.1 \times 10^{11}$. Against a fast unsalted hash ($r \approx 10^{10}$ per second on a GPU) that takes about 10 seconds. Against yescrypt tuned to a few hundred guesses per second per GPU, it takes years. **The hash algorithm doesn't make weak passwords strong, but it multiplies the attacker's cost by a factor of millions.** Long passphrases do the rest.

## PAM: Pluggable Authentication Modules

Programs like `login`, `sshd`, `sudo` and `su` don't check passwords themselves. They ask **PAM**, configured in `/etc/pam.d/`. Each file is a stack of modules:

```
# /etc/pam.d/common-password (Debian) or system-auth (RHEL), simplified
password  requisite  pam_pwquality.so retry=3 minlen=12 difok=3
password  required   pam_unix.so use_authtok yescrypt
```

Useful modules:

| Module | Does |
|---|---|
| `pam_pwquality` | rejects weak new passwords (length, character classes, dictionary words) |
| `pam_faillock` | locks an account after repeated failures (`/etc/security/faillock.conf`: `deny = 5`, `unlock_time = 900`) |
| `pam_unix` | checks and stores `/etc/shadow` hashes |
| `pam_google_authenticator`, `pam_u2f` | add TOTP codes or security keys |
| `pam_limits` | applies `/etc/security/limits.conf` (process and file limits) |

**Change PAM with great care**, and keep a root shell open while testing: a broken stack can make *every* login fail, including yours. Prefer the distribution's tools (`authselect` on RHEL, `pam-auth-update` on Debian/Ubuntu) to hand edits.

## Policies that help

```bash
$ sudo chage -l ada                 # password ageing for a user
$ sudo passwd -l olduser            # lock the password (the key may still work: also expire the account!)
$ sudo usermod --expiredate 1 olduser   # disable the account entirely
$ sudo faillock --user ada          # failed attempts; --reset clears them
```

Current guidance (NIST SP 800-63B) favors **long passwords and no forced periodic changes**, unless there's evidence of compromise. Forced rotation produces `Summer2026!`, then `Autumn2026!`.
