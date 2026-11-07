# HTTPS and TLS

HTTPS is HTTP inside **TLS** (Transport Layer Security), which provides:

- **Confidentiality**: the traffic is encrypted.
- **Integrity**: any modification is detected.
- **Authentication**: the server proves it really is `bank.example`.

## The handshake, simplified (TLS 1.3)

1. **Client hello**: the browser sends the TLS versions and algorithms it supports, plus a key share for the key exchange.
2. **Server hello**: the server picks the algorithms, sends its own key share, and from then on everything is encrypted. It sends its **certificate**, and a **signature** proving it holds the certificate's private key.
3. Both sides derive the same session keys from the key exchange (Diffie-Hellman). The keys never cross the network.
4. Encrypted application data flows.

Because the session keys come from ephemeral Diffie-Hellman, TLS 1.3 has **forward secrecy**: stealing the server's private key later doesn't decrypt recorded past traffic.

## Certificates and trust

A certificate binds a **domain name** to a **public key**, and is signed by a **certificate authority (CA)**. Your browser trusts about 150 root CAs, and checks that:

- the chain leads from the server's certificate, through intermediate CAs, to a trusted root;
- the name you typed is in the certificate's Subject Alternative Names;
- the certificate is within its validity period, and not revoked.

Every certificate is also logged publicly in **Certificate Transparency** logs, so a CA that issues a certificate for your domain to someone else can be caught. You can watch the logs for your own domains (crt.sh).

Run the attached `check-tls.js` against a site to see all of it:

```
$ node check-tls.js example.com
  trusted chain:   yes
  protocol:        TLSv1.3
  cipher suite:    TLS_AES_256_GCM_SHA384
  key exchange:    X25519MLKEM768
  names (SAN):     DNS:example.com, DNS:*.example.com
  valid until:     Dec 25 22:56:35 2026 GMT (49 days)
  chain:
    0: example.com  (issued by Cloudflare TLS Issuing ECC CA 3)
    1: Cloudflare TLS Issuing ECC CA 3  (issued by SSL.com TLS Transit ECC CA R2)
    ...
```

`X25519MLKEM768` is a **hybrid post-quantum** key exchange: classical X25519 combined with ML-KEM, so the session stays safe even against a future quantum computer. The cryptography course explains both.

## Running HTTPS well

- **Get certificates automatically**: Let's Encrypt and the ACME protocol issue free certificates, valid for 90 days or less, renewed by a tool (certbot, Caddy, your cloud's load balancer).
- **TLS 1.2 and 1.3 only**. TLS 1.0 and 1.1, and all versions of SSL, are deprecated.
- **Redirect HTTP to HTTPS**, and send **HSTS** (`Strict-Transport-Security`), so that browsers never even try plain HTTP again. Otherwise the first request can be intercepted and downgraded.
- **Monitor expiry**: an expired certificate is an outage.

The attached `nginx-security.conf` in the web chapter puts all of this together.

## What HTTPS doesn't do

The padlock means "the connection to this domain is private and authentic". It **doesn't** mean the site is honest: phishing sites have valid certificates too (free and automatic for everyone). Check the domain name, not the padlock.
