# Accounts, tokens, integrity levels and UAC

## Security identifiers

Windows identifies users, groups and computers by **SIDs**, not names:

```
S-1-5-21-3623811015-3361044348-30300820-1013
│ │ │  └──────── domain or machine identifier ────────┘ └── RID: the account within it
│ │ └ NT authority
│ └ revision
└ "SID"
```

Some well-known SIDs:

| SID | Is |
|---|---|
| `S-1-5-18` | LocalSystem (SYSTEM): the most powerful account on the machine |
| `S-1-5-19`, `S-1-5-20` | LocalService, NetworkService: limited service accounts |
| `S-1-5-32-544` | the built-in Administrators group |
| `S-1-5-32-545` | the built-in Users group |
| `…-500` | the built-in Administrator account (disabled by default on clients) |
| `…-501` | the Guest account |

Renaming an account doesn't change its SID, which is why scripts should use SIDs. `Get-SecurityPosture.ps1` finds the Administrators group with `Get-LocalGroupMember -SID 'S-1-5-32-544'`, which works in any language.

```powershell
whoami /user          # your SID
whoami /groups        # your groups, and the integrity level
whoami /priv          # your privileges
```

## Access tokens

At sign-in, LSASS (the Local Security Authority) creates an **access token** holding the user's SID, group SIDs, **privileges** (such as `SeDebugPrivilege` and `SeBackupPrivilege`) and **integrity level**. Every process started by the user gets a copy, and every access check compares the token against the object's ACL.

Dangerous privileges are as good as administrator rights. `SeDebugPrivilege` reads any process's memory (including LSASS's credentials), `SeImpersonatePrivilege` (held by service accounts) is the basis of the "Potato" escalation family, and `SeBackupPrivilege` reads any file.

## Integrity levels

Mandatory integrity control adds a second check. A process can't **write** to objects with a higher integrity level than its own:

| Level | Typical processes |
|---|---|
| Untrusted / Low | browser sandboxes, AppContainers |
| Medium | normal user programs |
| High | elevated ("Run as administrator") programs |
| System | services, the kernel's user-mode helpers |

That's why a compromised browser tab (Low) can't change your documents' settings, even though it runs as you.

## User Account Control

When an administrator signs in, Windows creates **two tokens**: a filtered, standard-user token (Medium integrity) for everyday use, and a full administrator token (High integrity). UAC prompts before using the full one.

- **Consent prompt** (for administrators): "Do you want to allow this app to make changes?"
- **Credential prompt** (for standard users): an administrator must type a password.

`Get-SecurityPosture.ps1` checks that UAC is on (`EnableLUA = 1`), and that administrators are prompted (`ConsentPromptBehaviorAdmin` isn't 0, which would mean silent elevation).

**Microsoft doesn't treat UAC as a security boundary.** Bypasses from an administrator's filtered token to their full token exist, and aren't treated as vulnerabilities. The real boundary is between a **standard user** and an administrator. Hence the most effective single piece of Windows hardening: **do daily work as a standard user**, and use a separate admin account only when needed. Microsoft's newer *Administrator protection* feature in Windows 11 moves in that direction, by elevating into a separate, temporary admin token.

## Services and SYSTEM

Services run in session 0, often as LocalSystem. A service that a standard user can reconfigure, or whose executable they can replace, is a direct path to SYSTEM. The next lesson, and `Find-WeakPermissions.ps1`, look for exactly that.
