# Password strength, with the math

## Entropy of a random password

If a password of length $L$ is chosen **uniformly at random** from an alphabet of $N$ symbols, there are $N^L$ equally likely possibilities. Its **entropy**, in bits, is

$$
H = \log_2\!\left(N^L\right) = L \log_2 N
$$

Each bit doubles the attacker's work. An attacker making $r$ guesses per second needs on average

$$
t = \frac{2^{H-1}}{r}
$$

seconds: half the space, on average.

| Password | $N$ | $L$ | $H$ (bits) |
|---|---|---|---|
| 8 lowercase letters | 26 | 8 | 37.6 |
| 8 printable ASCII characters | 95 | 8 | 52.6 |
| 12 letters and digits | 62 | 12 | 71.5 |
| 16 letters and digits | 62 | 16 | 95.3 |
| 6 words from the EFF list | 7776 | 6 | 77.5 |

## The guessing rate decides everything

| Situation | Rough rate $r$ |
|---|---|
| online, with rate limiting | 10 per second or less |
| offline, against a **fast** hash (MD5, SHA-256) on GPUs | $10^{10}$ to $10^{11}$ per second |
| offline, against **Argon2id/scrypt/bcrypt** | thousands per second |

8 printable characters (52.6 bits) against a fast hash: $2^{51.6} / 10^{11} \approx 9$ **hours**. The same password against Argon2id at $10^4$ per second: about **10,000 years**. The attached `password-strength.js` computes this table, and generates random examples.

## Humans aren't random

The formula only holds for random secrets. People choose `Summer2026!`, `P@ssw0rd`, names, dates and keyboard walks. Attackers don't brute-force those; they try **leaked password lists and mutation rules** first. A "complex-looking" human password often falls in minutes. That's why:

- **Length beats complexity rules.** NIST SP 800-63B recommends allowing long passphrases, checking new passwords against **lists of breached passwords**, and **not** forcing composition rules or periodic changes.
- **Passphrases** of random words are easy to remember: `lilac-ivory-lunar-ocean-pixel-radar`. The entropy comes from the random *choice*, so let a generator pick them, not you.

## Reuse is the real killer

Billions of credentials from past breaches circulate publicly. **Credential stuffing** tries them on other sites, automatically. A strong password reused on ten sites is only as strong as the weakest of those sites' security. Check whether yours appear in known breaches at haveibeenpwned.com. Its password check uses k-anonymity: only the first 5 hex digits of the password's SHA-1 hash leave your browser.

## Password managers

A password manager is the only practical way to have a unique, random password for every site:

- generate 20+ random characters, or a long passphrase, per site;
- autofill only on the **exact domain**, which is also a strong anti-phishing feature: if it doesn't offer your bank password, you're probably not on your bank's site;
- protect the vault with a strong passphrase and MFA.
