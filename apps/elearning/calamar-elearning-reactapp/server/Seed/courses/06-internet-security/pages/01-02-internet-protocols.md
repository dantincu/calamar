# How the internet works, from a security angle

The internet's core protocols were designed in the 1970s and 80s for a network of trusted research institutions. Most have **no built-in security**, and the protection had to be added later, on top.

## The layers

| Layer | Protocols | What it does | Classic attacks | Protection added later |
|---|---|---|---|---|
| Link | Ethernet, Wi-Fi | delivers frames on the local network | ARP spoofing, rogue Wi-Fi access points | WPA3, 802.1X, switch port security |
| Internet | IP, ICMP | routes packets between networks | IP spoofing, BGP hijacking | ingress filtering, RPKI |
| Transport | TCP, UDP | connections and ports | SYN floods, port scanning | SYN cookies, firewalls |
| Application | DNS, HTTP, SMTP | names, the web, e-mail | DNS spoofing, eavesdropping, e-mail forgery | TLS, DNSSEC, SPF/DKIM/DMARC |

## What happens when you open https://bank.example

1. **DNS**: your device asks a resolver for the IP address of `bank.example`. Unencrypted by default, so it can be watched or forged (next chapter).
2. **TCP**: a three-way handshake (SYN, SYN-ACK, ACK) opens a connection to port 443.
3. **TLS**: the server proves its identity with a certificate, and both sides agree on encryption keys. From here on, nobody in between can read or change the traffic.
4. **HTTP**: your browser sends the request inside the TLS tunnel, including cookies that prove you're logged in.

**Everyone between you and the server** (the café's Wi-Fi, your ISP, routers in other countries) sees the packets. Before TLS, they could read and alter everything. With TLS, they still see *that* you connect to `bank.example`, *when* and *how much* data flows, but not the content.

## Ports and services

A port identifies a service on a host. Some well-known ones:

| Port | Service | Note |
|---|---|---|
| 22 | SSH | remote administration; constantly brute-forced |
| 25 / 587 | SMTP | e-mail between servers / from clients |
| 53 | DNS | |
| 80 / 443 | HTTP / HTTPS | |
| 3389 | RDP | Windows remote desktop; a top ransomware entry point when exposed |
| 3306, 5432, 27017, 6379 | MySQL, PostgreSQL, MongoDB, Redis | **should never be reachable from the internet** |

Automated scanners sweep the entire IPv4 address space ($2^{32} \approx 4.3$ billion addresses) in minutes, so any exposed service is found within hours. Internet search engines like Shodan index what they find. **Assume everything you expose is known to attackers.**

## Trust boundaries

A **trust boundary** is where data crosses from a less trusted zone to a more trusted one: the internet to your web server, a browser to your API, one microservice to another. Every boundary needs checks: authentication, input validation and encryption. Most web vulnerabilities (chapter 4) are failures to check data at a boundary.
