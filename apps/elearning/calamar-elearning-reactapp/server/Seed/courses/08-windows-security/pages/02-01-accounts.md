# Accounts and sign-in

## Kinds of accounts

| Account | Stored | Notes |
|---|---|---|
| **Local account** | the machine's SAM database | exists on one PC only |
| **Microsoft account** | Microsoft's cloud | consumer PCs; syncs settings; recovery and BitLocker key backup |
| **Domain account** | Active Directory | on-premises organizations; Kerberos |
| **Microsoft Entra ID account** | the cloud directory | modern organizations; Conditional Access, Intune |

## Standard users, separate admins

The biggest single improvement: **don't use an administrator account for daily work**. Malware that runs as a standard user can't install drivers or services, can't disable security tools and can't read other users' files, which blocks or contains most of it.

`Get-SecurityPosture.ps1` warns when you're a member of Administrators:

```
Accounts  WARN  You (PC\ada) are a local administrator: use a standard account for daily work
```

Create a separate admin account for the rare moments you need it. In organizations, use **tiered** admin accounts: a workstation admin account can't sign in to servers, and a server admin account can't sign in to domain controllers, so a stolen low-tier credential can't climb.

## Windows Hello and passkeys

Windows Hello replaces the password at sign-in with a **PIN or biometrics** that unlock a **key pair held in the TPM**:

- The PIN never leaves the device. Stolen, it's useless without the physical machine, unlike a password, which works from anywhere.
- The TPM rate-limits PIN guesses (**anti-hammering**), so even a short PIN resists guessing. A 6-digit PIN has $10^6$ possibilities, but at a handful of guesses before lockout, the chance of guessing it is tiny.
- **Windows Hello for Business** brings the same to domain and Entra accounts. Passkeys for websites are stored and unlocked the same way.

## LAPS: unique local admin passwords

When every PC in an organization has the same local Administrator password (from a shared image), one stolen hash opens every machine: **lateral movement** with pass-the-hash (next lesson). **Windows LAPS** (built in since 2023) sets a unique, random, regularly rotated password for each machine's local admin account, and stores it in Active Directory or Entra ID, where only authorized staff can read it.

```powershell
Get-LapsADPassword -Identity PC042 -AsPlainText     # for authorized admins
Reset-LapsPassword                                   # rotate now (on the device)
```

A LAPS password of 20 characters from about 90 symbols has

$$
H = 20 \log_2 90 \approx 130 \text{ bits}
$$

of entropy. It's unguessable, and different on every machine.

## Account hygiene

- **Disable the Guest account**, and the built-in Administrator on clients (`Get-SecurityPosture.ps1` checks the Guest account).
- Remove stale accounts and old admin group members, and review them regularly.
- Use **account lockout** (for example, 10 attempts, then 15 minutes) to slow online guessing, while being aware that attackers can use lockouts to deny service.
- In domains, put administrators in the **Protected Users** group: no NTLM, no cached credentials, no delegation, and short Kerberos ticket lifetimes.
