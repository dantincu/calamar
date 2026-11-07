# Project: reviewing and hardening a web application

Pick a small web application you're allowed to work on: one of your own projects, or `secure-server.js` (attached), which you'll extend. Then go through the stages below and write down what you find, as a short report.

## 1. Threat model (30 minutes)

- Draw the components: browser, reverse proxy, app, database, external services.
- Mark the **trust boundaries** (the internet to the proxy, the app to the database).
- List the assets: accounts, personal data, payment data, admin functions.
- For each boundary, ask: what could an attacker send across it?

## 2. Transport

```bash
$ node check-tls.js your-app.example
$ curl -sI http://your-app.example        # should be a 301 to https
```

- [ ] TLS 1.2 or 1.3 only, a valid chain, more than 14 days before expiry, automatic renewal
- [ ] HTTP redirects to HTTPS; HSTS is set

## 3. Headers and cookies

- [ ] CSP (at least `default-src 'self'; object-src 'none'; frame-ancestors 'none'`)
- [ ] `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- [ ] the session cookie is `HttpOnly; Secure; SameSite=Lax` (or `Strict`), ideally with the `__Host-` prefix

## 4. Authentication

- [ ] passwords hashed with Argon2id, scrypt or bcrypt, with per-user salts
- [ ] the same error and timing for unknown users and wrong passwords
- [ ] rate limiting on login and password reset
- [ ] a new session ID at login; sessions invalidated at logout and on password change
- [ ] MFA available; passkeys if possible

## 5. Input and output

Go through **every endpoint** that takes input:

- [ ] all SQL is parameterized (search the code for string-built queries: `` `SELECT … ${ `` or `"… " + `)
- [ ] no shell commands built from input
- [ ] output encoded by the template engine; no `innerHTML` or `dangerouslySetInnerHTML` with user data
- [ ] URLs from users are scheme-checked
- [ ] every state-changing request has CSRF protection, and no state changes on GET

## 6. Access control

With two test accounts, A and B:

- [ ] B can't read or change A's resources by changing IDs in URLs or request bodies
- [ ] a normal user can't call admin endpoints, even when calling them directly
- [ ] unauthenticated requests to protected endpoints get 401

## 7. Components, secrets, errors and logs

```bash
$ npm audit                  # or pip-audit, dotnet list package --vulnerable
$ gitleaks detect            # secrets committed to the repository
```

- [ ] no known-vulnerable dependencies, or a documented plan for them
- [ ] secrets come from the environment or a secret manager, not from the code
- [ ] no stack traces in responses
- [ ] logins, failures and admin actions are logged, without secrets

## 8. Extend secure-server.js

Exercises that practice the lessons:

1. Store `USERS` with a real per-user salt and the scrypt format from `password-storage.js`.
2. Add a logout endpoint that deletes the server-side session and expires the cookie (and protect it with CSRF too).
3. Add a per-**account** failure counter, alongside the per-IP one, and think about the trade-off: what stops an attacker from locking out a victim on purpose?
4. Add an idle timeout of 30 minutes to sessions.
5. Add a `Content-Security-Policy` with a per-response nonce, and an inline script that uses it.

## 9. Write the report

For each finding: **what** it is, **where**, the **risk** (likelihood × impact, from the first chapter), and the **fix**. Order the findings by risk. One page is enough, and a short, prioritized list gets acted on. A long one doesn't.

Congratulations on finishing the course. The *Applied Cryptography* course continues from here, with the math behind TLS, hashing and signatures.
