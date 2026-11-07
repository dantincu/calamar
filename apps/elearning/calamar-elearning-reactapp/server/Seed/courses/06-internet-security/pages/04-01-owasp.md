# The OWASP Top 10

The **OWASP Top 10** is the best-known list of web application security risks, based on data from many thousands of applications. The 2021 edition:

| # | Risk | In one sentence | This course |
|---|---|---|---|
| A01 | **Broken access control** | users can act outside their permissions: other users' data, admin functions | below |
| A02 | **Cryptographic failures** | sensitive data unencrypted, or protected with weak algorithms | HTTPS, password storage |
| A03 | **Injection** | input is interpreted as code: SQL, OS commands, and XSS | SQL injection, XSS |
| A04 | **Insecure design** | missing controls in the design itself, such as no rate limit on password reset | threat modeling |
| A05 | **Security misconfiguration** | defaults, verbose errors, open cloud storage, missing headers | security headers |
| A06 | **Vulnerable and outdated components** | known-vulnerable libraries and frameworks | dependency management |
| A07 | **Identification and authentication failures** | weak passwords allowed, no MFA, broken sessions | sessions, passwords |
| A08 | **Software and data integrity failures** | unverified updates, insecure deserialization, CI/CD tampering | supply chain |
| A09 | **Security logging and monitoring failures** | attacks happen unnoticed | logging |
| A10 | **Server-side request forgery (SSRF)** | the server can be made to fetch attacker-chosen URLs, including internal ones | below |

## Broken access control: the number one

It's number one because it's easy to get wrong and hard to find with scanners: every endpoint needs the right check.

```
GET /api/invoices/1043     ← your invoice
GET /api/invoices/1044     ← someone else's: does the server check?
```

This is an **IDOR** (insecure direct object reference). The fix is to authorize **every request on the server**, against the logged-in user:

```js
const invoice = db.get('SELECT * FROM invoices WHERE id = ? AND owner_id = ?', id, session.userId);
if (!invoice) return res.status(404).end();   // 404, not 403: don't confirm that it exists
```

Rules:

- **Deny by default**: an endpoint without an explicit authorization rule is refused.
- Never trust anything the client sends to make access decisions (hidden fields, `role=admin` in a request, a disabled button).
- Hiding the "Delete" button in the UI is not access control.
- Test with two accounts: can user A see or change user B's things?

## SSRF in brief

If your server fetches URLs that users supply (link previews, webhooks, image imports), an attacker can supply `http://169.254.169.254/` (the cloud metadata service, which can hand out credentials) or `http://localhost:6379/` (internal services). Allow-list the destinations, resolve the name and block private and link-local address ranges, and run such fetchers with minimal network access.

## Vulnerable components

Most of an application's code is dependencies. Use `npm audit`, `pip-audit`, `dotnet list package --vulnerable` and Dependabot or Renovate. Pin versions with lock files, and update regularly, so that urgent security updates are small steps rather than big migrations.
