# Authentication and sessions

## Storing passwords

**Never store passwords**, not even encrypted: whoever has the key can decrypt them all. Store a **slow, salted hash** made by a dedicated password-hashing function:

| Function | Status |
|---|---|
| **Argon2id** | the first choice (OWASP's recommendation); memory-hard |
| **scrypt** | good; memory-hard |
| **bcrypt** | acceptable; widely available; truncates passwords at 72 bytes |
| PBKDF2-SHA256 | acceptable with a high iteration count (600,000+), e.g. when FIPS compliance is required |
| MD5, SHA-1, SHA-256 (plain, or salted) | **wrong**: billions of guesses per second on GPUs |

The attached `password-storage.js` measures the difference on your machine. A typical run:

```
scrypt hash (N=2^17)                   249 ms
Argon2id hash (64 MiB, 3 passes)       133 ms
SHA-256 on this CPU: ~600,000 guesses per second (a GPU does billions).
```

A quarter of a second is nothing for a user who logs in once. For an attacker with a stolen database, it's the difference between hours and centuries. **Memory-hardness** (scrypt, Argon2) matters because GPUs and custom chips have lots of compute, but little fast memory per core.

The details that matter:

- A **random salt per user** (16 bytes), stored with the hash, so that equal passwords give different hashes and precomputed tables are useless.
- **Store the parameters** with the hash (`scrypt$131072$8$1$salt$hash`), so you can raise them later and re-hash on the next login.
- **Constant-time comparison** (`timingSafeEqual`).
- Normalize Unicode (`NFKC`) before hashing, so the same password typed on different devices matches.

## Login endpoints

- **The same error message** for "unknown user" and "wrong password", and the same timing (hash even for unknown users). Otherwise attackers can enumerate your users.
- **Rate limiting** per account and per IP, with backoff. `secure-server.js` locks an IP for 15 minutes after 5 failures. Its self-test shows `401 401 401 401 401 429`.
- **Check new passwords against breached-password lists**, as NIST recommends.
- Offer **MFA**, and passkeys.

## Sessions

After login, a **session identifier** stands in for the password on every request, so it must be as unguessable:

- at least 128 bits from a cryptographic random generator (`crypto.randomBytes(32)`);
- **a new ID at login** and at privilege changes, which defeats *session fixation*, where an attacker plants a known ID before you log in;
- cookie attributes `HttpOnly; Secure; SameSite; __Host-` (previous lesson);
- an idle timeout and an absolute timeout;
- **invalidated on the server** at logout, and on password change.

## Tokens (JWT)

JSON Web Tokens are signed, self-contained claims. They're common in APIs, and often misused:

- **Verify the signature, with a fixed algorithm.** Never accept `alg: none`, and never let the token's header choose the algorithm.
- Check `exp`, `iss` and `aud`.
- Keep lifetimes short: a JWT can't be revoked before it expires unless you add a server-side deny-list. That's why plain server-side sessions are often simpler and safer for websites.
- Don't put secrets in the payload: it's only base64-encoded, not encrypted.

## Password reset

A reset flow is a login flow. Use single-use, random, short-lived tokens (15–60 minutes), stored **hashed** like passwords. Give the same response whether or not the account exists. Invalidate the existing sessions after a reset.
