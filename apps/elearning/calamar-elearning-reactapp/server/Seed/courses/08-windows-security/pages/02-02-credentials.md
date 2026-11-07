# NTLM, Kerberos and credential theft

## NTLM

NTLM is a challenge-response protocol from the 1990s. The server sends a random challenge; the client answers with a value computed from the challenge and the **NT hash** of the password, which is an unsalted MD4 hash of the password.

Its weaknesses are fundamental:

- **Pass-the-hash**: the NT hash *is* the credential. An attacker who steals it from memory authenticates without ever knowing the password.
- **Relay**: an attacker in the middle forwards a victim's NTLM exchange to another server, and is authenticated there as the victim. SMB signing, LDAP signing and channel binding, and Extended Protection for Authentication, block relaying.
- Captured responses can be **cracked offline**, especially NTLMv1.

Microsoft has deprecated NTLM, and is moving to Kerberos everywhere. Audit NTLM use (the "Restrict NTLM" audit policies) before blocking it. Windows 11 24H2 and Windows Server 2025 require **SMB signing** by default, which stops SMB relay.

## Kerberos

In a domain, Kerberos uses **tickets** issued by the domain controller's Key Distribution Center (KDC):

1. **AS exchange**: you prove your identity, and get a **ticket-granting ticket** (TGT), encrypted with the key of the `krbtgt` account.
2. **TGS exchange**: you present the TGT, and get a **service ticket** for a specific service, encrypted with that **service account's key**.
3. You present the service ticket to the service.

Attacks target the keys behind the tickets:

| Attack | How | Defense |
|---|---|---|
| **Kerberoasting** | any user can request service tickets; those encrypted with a weak service-account password are cracked offline | long random service-account passwords; group Managed Service Accounts (gMSA); AES only, no RC4 |
| **AS-REP roasting** | accounts with pre-authentication disabled leak crackable material | keep pre-authentication on |
| **Pass-the-ticket** | stolen tickets are reused from memory | Credential Guard; short lifetimes |
| **Golden ticket** | with the `krbtgt` key, an attacker forges TGTs for anyone | protect domain controllers; reset `krbtgt` twice after a compromise |

Why do weak service passwords fall? A Kerberoast is an offline guess, so the rate is limited only by GPUs. A 10-character password from 62 symbols has $62^{10} \approx 8.4 \times 10^{17}$ possibilities. At $10^{10}$ guesses per second, that's about $4.2 \times 10^{7}$ seconds on average, or 16 months, and far less for anything human-chosen. A gMSA's 240-byte random password can't be cracked at all.

## LSASS: where credentials live

**LSASS** (`lsass.exe`) holds the credentials of signed-in users in memory (NT hashes, Kerberos tickets and keys) so that single sign-on to network resources works. Credential-dumping tools read LSASS's memory, which needs administrator rights or `SeDebugPrivilege`. It's the most common step after an initial compromise, and the hashes it yields lead to pass-the-hash and lateral movement.

## The defenses

| Protection | What it does |
|---|---|
| **LSA protection** (`RunAsPPL`) | runs LSASS as a protected process: even administrators can't open its memory, or load unsigned plugins into it. On by default on many new Windows 11 installs |
| **Credential Guard** | moves the secrets into an isolated, virtualization-based process (LSAIso) that even the kernel can't read; LSASS only gets opaque handles. On by default on eligible Windows 11 Enterprise/Education devices |
| **ASR rule** "Block credential stealing from LSASS" | blocks process access to LSASS's memory, where the above can't be used |
| **Protected Users** group | no NTLM, no cached credentials for its members |
| **Standard-user daily accounts** | dumping LSASS needs admin rights in the first place |

`Get-SecurityPosture.ps1` reports LSA protection, virtualization-based security and Credential Guard:

```
Credentials  PASS  LSA protection is configured (RunAsPPL = 2)
Credentials  INFO  Credential Guard is not running (requires Enterprise/Education or a supported edition, …)
Credentials  PASS  Virtualization-based security is running
```

(`RunAsPPL = 2` means LSA protection is enabled without a UEFI lock; `1` adds the UEFI lock, so it can't simply be switched off in the registry.)
