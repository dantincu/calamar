// secure-server.js: a minimal Node HTTP server showing the security basics of a web app:
// security headers, safe session cookies, CSRF protection and login rate limiting. No dependencies.
//
//   node secure-server.js              # http://127.0.0.1:3000 (put it behind HTTPS in production: see nginx-security.conf)
//   node secure-server.js --selftest   # starts, makes a few requests, prints what happened, exits
import http from 'node:http';
import crypto from 'node:crypto';

const PORT = 3000;
const sessions = new Map();                 // session id -> { user, csrf }; use a real store in production
const failures = new Map();                 // ip -> { count, until }

// ---- Security headers on every response ---------------------------------------------------------------
function securityHeaders(res) {
  res.setHeader('Content-Security-Policy', "default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');   // only honored over HTTPS
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
}

// ---- Cookies ----------------------------------------------------------------------------------------------
function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie ?? '').split(';').filter(Boolean).map((c) => {
    const i = c.indexOf('=');
    return [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1).trim())];
  }));
}
function sessionCookie(id, maxAge = 3600) {
  // HttpOnly: invisible to JavaScript (XSS can't steal it). Secure: HTTPS only. SameSite=Lax: not sent on
  // cross-site POSTs. The __Host- prefix makes browsers require Secure, Path=/ and no Domain.
  // (Secure cookies need HTTPS; browsers make an exception for localhost, so this demo works over http there.)
  return `__Host-sid=${id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

// ---- Helpers ----------------------------------------------------------------------------------------------
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const sameToken = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length
  && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
async function readForm(req, limit = 10_000) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > limit) throw new Error('too large');
  }
  return Object.fromEntries(new URLSearchParams(body));
}
function send(res, status, html) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html><meta charset="utf-8"><title>Demo</title>${html}`);
}

// A demo account. In a real app: a password hash (see password-storage.js) in a database.
const USERS = { 'ada@example.com': crypto.scryptSync('correct horse battery staple', 'demo-salt', 32) };

const server = http.createServer(async (req, res) => {
  securityHeaders(res);
  const ip = req.socket.remoteAddress;
  const session = sessions.get(parseCookies(req)['__Host-sid']);

  try {
    if (req.method === 'GET' && req.url === '/') {
      if (!session) return send(res, 200, `<form method="post" action="/login">
        <input name="email" type="email" autocomplete="username"> <input name="password" type="password" autocomplete="current-password">
        <button>Sign in</button></form>`);
      // Every state-changing form carries the session's CSRF token
      return send(res, 200, `<p>Signed in as ${escapeHtml(session.user)}</p>
        <form method="post" action="/transfer"><input type="hidden" name="csrf" value="${session.csrf}">
        <input name="amount"> <button>Transfer</button></form>`);
    }

    if (req.method === 'POST' && req.url === '/login') {
      // Rate limiting: 5 failures per IP, then a 15-minute lock
      const f = failures.get(ip);
      if (f && f.until > Date.now()) return send(res, 429, '<p>Too many attempts. Try again later.</p>');
      const { email = '', password = '' } = await readForm(req);
      const expected = USERS[email.toLowerCase()];
      // Hash even for unknown users, so response times don't reveal which e-mails exist
      const actual = crypto.scryptSync(password, 'demo-salt', 32);
      if (!expected || !crypto.timingSafeEqual(actual, expected)) {
        const count = (f?.count ?? 0) + 1;
        failures.set(ip, { count, until: count >= 5 ? Date.now() + 15 * 60_000 : 0 });
        return send(res, 401, '<p>Wrong e-mail or password.</p>');   // the same message either way
      }
      failures.delete(ip);
      // A NEW random session id at login: prevents session fixation
      const id = crypto.randomBytes(32).toString('base64url');
      sessions.set(id, { user: email, csrf: crypto.randomBytes(32).toString('base64url') });
      res.setHeader('Set-Cookie', sessionCookie(id));
      res.statusCode = 303;
      res.setHeader('Location', '/');
      return res.end();
    }

    if (req.method === 'POST' && req.url === '/transfer') {
      if (!session) return send(res, 401, '<p>Sign in first.</p>');
      const form = await readForm(req);
      if (!sameToken(form.csrf, session.csrf)) return send(res, 403, '<p>Invalid CSRF token.</p>');
      return send(res, 200, `<p>Transferred ${escapeHtml(form.amount)}.</p>`);
    }

    send(res, 404, '<p>Not found.</p>');
  } catch {
    send(res, 400, '<p>Bad request.</p>');      // never send stack traces to clients
  }
});

server.listen(PORT, '127.0.0.1', async () => {
  console.log(`Listening on http://127.0.0.1:${PORT}`);
  if (!process.argv.includes('--selftest')) return;

  const base = `http://127.0.0.1:${PORT}`;
  const form = (o) => ({ method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(o), redirect: 'manual' });
  let r = await fetch(base + '/');
  console.log('\nGET / headers:');
  for (const h of ['content-security-policy', 'strict-transport-security', 'x-content-type-options', 'referrer-policy']) console.log(`  ${h}: ${r.headers.get(h)}`);

  r = await fetch(base + '/login', form({ email: 'ada@example.com', password: 'correct horse battery staple' }));
  const cookie = r.headers.get('set-cookie');
  console.log('\nLogin:', r.status, '\n  Set-Cookie:', cookie);
  const sid = cookie.split(';')[0];

  const page = await (await fetch(base + '/', { headers: { cookie: sid } })).text();
  const csrf = page.match(/name="csrf" value="([^"]+)"/)[1];
  r = await fetch(base + '/transfer', { ...form({ amount: '10', csrf }), headers: { ...form({}).headers, cookie: sid } });
  console.log('\nTransfer with the CSRF token:   ', r.status);
  r = await fetch(base + '/transfer', { ...form({ amount: '9999' }), headers: { ...form({}).headers, cookie: sid } });
  console.log('Transfer without the CSRF token:', r.status, '(what a forged cross-site form would get)');

  const codes = [];
  for (let i = 0; i < 6; i++) codes.push((await fetch(base + '/login', form({ email: 'ada@example.com', password: 'guess' + i }))).status);
  console.log('\nSix wrong passwords in a row:', codes.join(' '), '(429 = locked out)');
  server.close();
});
