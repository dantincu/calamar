// check-tls.js: connects to an HTTPS server and reports what a browser would check, and a bit more.
//   node check-tls.js example.com
//   node check-tls.js example.com 8443
import tls from 'node:tls';

const host = process.argv[2] ?? 'example.com';
const port = Number(process.argv[3] ?? 443);

// rejectUnauthorized: false so that we can REPORT a bad certificate instead of just failing. Never do this in
// a client that sends or receives real data: it's how man-in-the-middle attacks get through.
const socket = tls.connect({ host, port, servername: host, ALPNProtocols: ['h2', 'http/1.1'], timeout: 10_000, rejectUnauthorized: false }, () => {
  const cert = socket.getPeerCertificate(true);
  const days = (Date.parse(cert.valid_to) - Date.now()) / 86_400_000;

  console.log(`${host}:${port}`);
  console.log(`  trusted chain:   ${socket.authorized ? 'yes' : `NO (${socket.authorizationError})`}`);
  console.log(`  protocol:        ${socket.getProtocol()}`);
  console.log(`  cipher suite:    ${socket.getCipher().name}`);
  console.log(`  key exchange:    ${(socket.getEphemeralKeyInfo() ?? {}).name ?? 'n/a (TLS 1.3 groups are not always reported)'}`);
  console.log(`  ALPN:            ${socket.alpnProtocol || 'none'}`);
  console.log(`  subject:         ${cert.subject?.CN ?? '(none)'}`);
  console.log(`  names (SAN):     ${cert.subjectaltname ?? '(none)'}`);
  console.log(`  issuer:          ${cert.issuer?.O ?? ''} ${cert.issuer?.CN ?? ''}`.trimEnd());
  console.log(`  valid until:     ${cert.valid_to} (${days.toFixed(0)} days)${days < 14 ? '  <-- RENEW SOON' : ''}`);
  console.log(`  key:             ${cert.asn1Curve ?? ''} ${cert.bits ? cert.bits + ' bits' : ''}`.trimEnd());
  console.log(`  SHA-256 fingerprint: ${cert.fingerprint256}`);

  // Walk up the chain the server sent
  console.log('  chain:');
  const seen = new Set();
  for (let c = cert, depth = 0; c && !seen.has(c.fingerprint256); c = c.issuerCertificate, depth++) {
    seen.add(c.fingerprint256);
    console.log(`    ${depth}: ${c.subject?.CN ?? c.subject?.O}  (issued by ${c.issuer?.CN ?? c.issuer?.O})`);
  }
  if (!socket.authorized) process.exitCode = 2;
  socket.end();
});

socket.on('timeout', () => { console.error('Timed out'); socket.destroy(); process.exitCode = 1; });
socket.on('error', (e) => { console.error(`Connection failed: ${e.message}`); process.exitCode = 1; });
