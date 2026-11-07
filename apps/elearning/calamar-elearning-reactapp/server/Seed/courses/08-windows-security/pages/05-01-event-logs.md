# The event IDs that matter

Windows writes security events to the **Security** log, which needs administrator rights (or membership in *Event Log Readers*) to read. What's recorded depends on the **audit policy**:

```powershell
auditpol /get /category:*                                                    # elevated
auditpol /set /subcategory:"Process Creation" /success:enable
# also enable "Include command line in process creation events" (Group Policy: System > Audit Process Creation)
```

## Security log

| ID | Event | Why it matters |
|---|---|---|
| **4624** | successful logon | who signed in, how (logon type), and from where |
| **4625** | failed logon | password guessing and spraying |
| 4634 / 4647 | logoff | session length |
| 4648 | logon with explicit credentials | `runas`, and lateral movement tools |
| **4672** | special privileges assigned to a new logon | an administrator signed in |
| **4688** | process created (with command line, if enabled) | what ran: the core of host forensics |
| **4720** | user account created | persistence |
| 4722 / 4724 | account enabled / password reset | account takeover |
| **4728 / 4732 / 4756** | member added to a global / local / universal security group | someone was made an administrator |
| **4740** | account locked out | guessing, or a stale saved password |
| 4768 / 4769 | Kerberos TGT / service ticket requested (domain controllers) | Kerberoasting shows up as many 4769s with RC4 encryption |
| **1102** | the audit log was cleared | almost always worth an alert |

## Other logs

| Log | ID | Event |
|---|---|---|
| System | **7045** | a new service was installed: a classic persistence and lateral-movement trace |
| System | 104 | an event log was cleared |
| PowerShell/Operational | **4104** | script block logging (previous chapter) |
| Windows Defender/Operational | 1116, 1117 | malware detected, action taken |
| Windows Defender/Operational | 1121, 1122 | ASR rule blocked / audited |
| TaskScheduler/Operational | 106 | a scheduled task was registered |

## Logon types

The `LogonType` field in 4624 and 4625 tells you *how*:

| Type | Meaning |
|---|---|
| 2 | interactive (at the keyboard) |
| 3 | network (file shares, most remote management) |
| 4 / 5 | batch (scheduled task) / service |
| 7 | unlock |
| 10 | remote interactive (RDP) |
| 11 | cached interactive (offline domain logon) |

Many type-10 failures from internet addresses mean exposed RDP under attack. Type-3 successes for an admin account on many hosts within minutes suggest lateral movement.

## Reading the log with PowerShell

`Get-LogonActivity.ps1` summarizes sign-ins, failures and lockouts:

```powershell
.\Get-LogonActivity.ps1 -Hours 24                  # elevated
.\Get-LogonActivity.ps1 -Hours 168 -FailuresOnly
```

It reads each event's fields **by name**, from the event XML, rather than by position. Positions differ between event IDs and Windows versions. It also decodes the failure **sub-status**: `0xC000006A` is a wrong password, `0xC0000064` an unknown user name (a spraying signal), and `0xC0000234` a locked account.

## A trap worth knowing

Without permission to read the Security log, `Get-WinEvent -FilterHashtable @{ LogName = 'Security'; … }` doesn't say "access denied". It says **"No events were found that match the specified selection criteria"**. A script that trusts that message reports a clean bill of health while seeing nothing. The first version of `Get-LogonActivity.ps1` did exactly that. It now checks access first:

```powershell
try { Get-WinEvent -LogName Security -MaxEvents 1 -ErrorAction Stop | Out-Null }
catch [System.UnauthorizedAccessException] { Write-Warning 'Access to the Security log was denied…'; return }
```

Security tooling must tell "nothing happened" apart from "I couldn't look".

## Keep the logs

- Increase the Security log's size (the default fills up quickly on busy machines): `wevtutil sl Security /ms:1073741824` sets 1 GB.
- **Forward events** off the machine (Windows Event Forwarding, or a SIEM agent). An attacker with admin rights can clear local logs, as event 1102 records, but can't recall what was already forwarded.
