# Security headers and safe deployment

A few HTTP response headers switch on protections that browsers already have. They cost almost nothing to add.

| Header | Value | Protects against |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | HTTPS downgrades and cookie theft on the first plain-HTTP request |
| `Content-Security-Policy` | (see the XSS lesson) | XSS, clickjacking (`frame-ancestors`), data exfiltration |
| `X-Content-Type-Options` | `nosniff` | browsers "guessing" that an uploaded text file is a script |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | URLs (with tokens or private paths) leaking to other sites |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | embedded or injected content using powerful features |
| `Cross-Origin-Opener-Policy` | `same-origin` | other windows getting a handle on yours (some cross-window attacks) |

Retired headers: `X-XSS-Protection` (removed from browsers; send `0` or nothing) and `X-Frame-Options` (superseded by CSP's `frame-ancestors`, but harmless to keep for old browsers).

## Where to set them

In the application (the attached `secure-server.js` sets them on every response), or in the reverse proxy in front of it (the attached `nginx-security.conf`). The proxy is a good place, because it covers every response, including error pages and static files.

`nginx-security.conf` also:

- redirects HTTP to HTTPS;
- allows only TLS 1.2 and 1.3, with forward-secret AEAD cipher suites;
- hides the server version (`server_tokens off`);
- limits request sizes, and rate-limits `/login`;
- refuses to serve dotfiles (`.git`, `.env`), which are a classic accidental leak.

## Check your site

```bash
$ curl -sI https://your-site.example | grep -iE 'strict-transport|content-security|x-content-type|referrer|permissions'
$ node check-tls.js your-site.example
```

Online scanners (Mozilla HTTP Observatory, SSL Labs) give a graded report of both headers and TLS.

## Errors and secrets

- **Never show stack traces** or database errors to users. Log them on the server, and show a generic message with an ID. `secure-server.js` catches everything and answers `400 Bad request`.
- **Keep secrets out of code and images**: use environment variables or a secret manager. Scan repositories for leaked secrets (`gitleaks`, GitHub secret scanning). A key pushed to a public repository is typically found by bots within minutes.
- **Disable debug modes** in production.
- **Log security events** (logins, failures, permission denials, admin actions) with enough context to investigate, but without passwords, tokens or full card numbers.

## Run the self-test

```bash
$ node secure-server.js --selftest
GET / headers:
  content-security-policy: default-src 'self'; object-src 'none'; …
  strict-transport-security: max-age=31536000; includeSubDomains
Login: 303
  Set-Cookie: __Host-sid=…; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600
Transfer with the CSRF token:    200
Transfer without the CSRF token: 403
Six wrong passwords in a row: 401 401 401 401 401 429
```

Every line is one control from this chapter, working.
