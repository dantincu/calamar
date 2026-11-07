# Security goals and today's threats

## The CIA triad

| Goal | Means | Broken by |
|---|---|---|
| **Confidentiality** | only authorized people can read the data | data breaches, eavesdropping, stolen laptops |
| **Integrity** | data can't be changed without detection | tampered downloads, altered transactions, defacement |
| **Availability** | systems work when they're needed | DDoS attacks, ransomware, outages |

Two more are often added: **authenticity** (you know who you're talking to) and **non-repudiation** (someone can't deny an action they took).

## The threat landscape

| Threat | What happens | Main defenses |
|---|---|---|
| **Phishing** | fake e-mails, messages or sites steal credentials or deliver malware | awareness, MFA, passkeys, mail filtering |
| **Credential stuffing** | passwords leaked from one site are tried on others | unique passwords, MFA, rate limiting |
| **Ransomware** | data is encrypted (and often stolen) for ransom | backups, patching, least privilege, EDR |
| **Exploited vulnerabilities** | unpatched software is attacked automatically | patching, minimal exposure, WAF |
| **Web app attacks** | injection, XSS, broken access control | secure coding (chapter 4) |
| **DDoS** | traffic floods take a service offline | CDN, scrubbing services, rate limiting |
| **Supply chain** | a trusted dependency or vendor is compromised | dependency review, signatures, least privilege |
| **Insider threats** | misuse by people with legitimate access | least privilege, logging, separation of duties |

Year after year, industry breach reports find the same few root causes behind most incidents: **stolen credentials, phishing and unpatched vulnerabilities**. The basics are not glamorous, but they are what matters most.

## Attackers and their economics

Most attackers are **opportunistic and economic**. They automate attacks against millions of targets, and move on from anything that costs extra effort. That's good news: you don't have to be impossible to breach, only **harder than the average target** for the mass attacks. Against a determined, targeted attacker, the goal shifts to detection and limiting the damage.

A useful way to think about it: an attack succeeds if its expected payoff exceeds its cost,

$$
P(\text{success}) \times \text{value} > \text{cost of the attack}
$$

Defenses work by lowering the probability of success (patches, MFA), lowering the value (encryption, minimal data retention) or raising the cost (rate limits, slow password hashes).

## Security is a trade-off

Every control costs something: money, convenience or performance. A bank and a hobby blog need different controls. The right question isn't "is it secure?" but **"secure against what, for whom, at what cost?"**, which is threat modeling.
