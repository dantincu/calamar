# Multi-factor authentication and passkeys

**Multi-factor authentication (MFA)** requires two or more different kinds of proof:

- something you **know** (a password);
- something you **have** (a phone, a security key);
- something you **are** (a fingerprint, a face), usually used to unlock the "have" factor locally.

A stolen password alone is no longer enough, which stops the vast majority of automated account takeovers.

## The factors compared

| Method | How it works | Phishing-resistant? | Weaknesses |
|---|---|---|---|
| SMS codes | a code sent by text message | no | SIM swapping, interception; the user can be tricked into typing the code on a fake site |
| TOTP apps | the app and the server share a secret; codes come from it and the time | no | the code can be relayed by a phishing site in real time |
| Push approval | "Is this you signing in?" on the phone | no | **MFA fatigue**: attackers spam requests until one is approved; number matching helps |
| **Security keys** (FIDO2/WebAuthn) | a challenge signed by a key that never leaves the device | **yes** | you need a backup key |
| **Passkeys** | FIDO2 credentials synced by your platform (Apple, Google, Microsoft) or password manager | **yes** | platform dependence; account recovery is the weak point |

Any MFA is far better than none. But only FIDO2 (security keys and passkeys) **resists phishing**.

## How TOTP works

The app and the server share a secret key $K$ (from the QR code). Every 30 seconds, both compute

$$
\text{TOTP} = \operatorname{Truncate}\big(\operatorname{HMAC\text{-}SHA1}(K,\ \lfloor t / 30 \rfloor)\big) \bmod 10^6
$$

where $t$ is the Unix time in seconds (RFC 6238). Without $K$, the next code is unpredictable. But a phishing site can simply **ask** for the current code and use it within the 30 seconds.

## Why passkeys stop phishing

With WebAuthn, the browser itself tells the authenticator **which website** (the origin) is asking. The credential for `bank.example` is cryptographically bound to that domain:

1. The site sends a random challenge.
2. The authenticator signs the challenge **together with the origin** using the private key it holds for that site, after a local fingerprint, face or PIN check.
3. The server verifies the signature with the public key it stored at registration.

On `bank-example-login.com`, there's no credential to use, and even a perfect visual copy of the site gets nothing. There's no shared secret on the server to steal either: the server only stores public keys.

## Recovery is the weak point

Attackers go after whatever is weakest, and that's often **account recovery**: a support desk that resets MFA on a phone call, or an e-mail reset link on a poorly protected mailbox. Protect recovery as strongly as login: backup security keys, recovery codes stored offline, and strict identity verification for help-desk resets.
