# Welcome to the course

Everything you do online (banking, work, messaging, shopping) depends on systems that are attacked constantly, mostly by automated tools looking for easy targets. This course explains how those attacks work and, above all, how to defend against them, both as a user and as someone who builds or runs web applications.

## What you will learn

1. **Foundations**: the goals of security (confidentiality, integrity, availability), today's threats, and how the internet's protocols work, from a security angle.
2. **Securing connections**: HTTPS and TLS, DNS and its attacks, Wi-Fi and VPNs.
3. **Accounts and identity**: password strength with the math behind it, multi-factor authentication and passkeys, and phishing.
4. **Web application security**: the OWASP Top 10, with runnable demos of SQL injection, cross-site scripting, CSRF, password storage, sessions and security headers.
5. **Defending**: malware, ransomware, backups, and responding to incidents.
6. **Project**: securing a small web application end to end.

## The sample files

The web lessons come with small Node.js programs (Node 22 or later, no dependencies) that you can run and change:

- `sqli-demo.js`: SQL injection against an in-memory database, and the fix.
- `xss-demo.js`: output encoding and Content Security Policy.
- `password-storage.js`: scrypt and Argon2id, and why fast hashes fail.
- `secure-server.js`: security headers, session cookies, CSRF tokens and login rate limiting, with a `--selftest` mode.
- `password-strength.js`: password entropy and guessing times.
- `check-tls.js`: inspects any HTTPS server's TLS setup and certificate chain.

## Ground rules

Security knowledge is dual-use. Practice attacks only on systems you own, or that you have **written permission** to test: your own VMs, the course demos, or deliberately vulnerable training apps such as OWASP Juice Shop. Testing other people's systems without permission is illegal in most countries, however good the intentions.

The follow-up course, *Applied Cryptography*, explains the math that makes HTTPS, passwords and signatures work.
