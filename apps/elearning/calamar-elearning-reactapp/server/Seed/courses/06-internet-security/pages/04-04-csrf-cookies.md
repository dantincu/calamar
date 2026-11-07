# CSRF and cookie security

## Cross-site request forgery

Browsers attach cookies to requests automatically, including requests that **another site** triggers. If you're logged in to `bank.example`, a page on `evil.example` can contain:

```html
<form action="https://bank.example/transfer" method="post">
  <input name="to" value="attacker"> <input name="amount" value="5000">
</form>
<script>document.forms[0].submit()</script>
```

Your browser sends the POST **with your session cookie**, and the bank sees a legitimate, authenticated request. The attacker can't read the response, but they don't need to: the transfer is done.

## Defense 1: SameSite cookies

The `SameSite` attribute controls whether a cookie is sent on cross-site requests:

| Value | Sent on cross-site… | Use for |
|---|---|---|
| `Strict` | nothing (not even links clicked from elsewhere) | high-security apps |
| `Lax` | top-level GET navigations only (links), not POSTs, iframes or fetches | most session cookies; the browsers' default |
| `None` | everything (requires `Secure`) | only for real cross-site uses, like embedded widgets |

`SameSite=Lax` blocks the forged POST above. But it isn't a complete defense: it allows GET requests, so **never change state on GET**, and "same-site" includes your sibling subdomains.

## Defense 2: CSRF tokens

The server puts a random, secret token in every form (or a custom header for APIs), tied to the session, and checks it on every state-changing request. The attacker's page can't read the token (the same-origin policy stops it), so it can't forge a valid request.

The attached `secure-server.js` does exactly this. Its self-test shows:

```
Transfer with the CSRF token:    200
Transfer without the CSRF token: 403 (what a forged cross-site form would get)
```

Compare tokens in constant time (`crypto.timingSafeEqual`), and use your framework's built-in CSRF protection where there is one.

## Cookie attributes for sessions

```
Set-Cookie: __Host-sid=<random>; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600
```

| Attribute | Protects against |
|---|---|
| `HttpOnly` | theft by JavaScript (XSS) |
| `Secure` | sending over plain HTTP, where it can be sniffed |
| `SameSite=Lax` or `Strict` | CSRF |
| `__Host-` prefix | browsers reject the cookie unless it's `Secure`, has `Path=/` and no `Domain`, so a subdomain can't overwrite it |
| `Max-Age` / `Expires` | sessions that live forever |

## CORS isn't a CSRF defense

CORS (`Access-Control-Allow-Origin`) controls whether another site's JavaScript may **read** your responses. It *relaxes* the same-origin policy, and doesn't stop requests from being sent. Misconfigured CORS (reflecting any `Origin` with `Allow-Credentials: true`) actually *creates* a vulnerability: any site could read your users' data. Allow-list exact origins, or don't enable CORS at all.
