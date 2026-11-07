# Welcome to the course

Windows runs on most of the world's desktops and laptops, and Active Directory still anchors the identity of most organizations. That makes Windows the most targeted platform for ransomware and credential theft. This course explains how Windows security works internally, and how to configure, monitor and audit it, with PowerShell.

## What you will learn

1. **How Windows security works**: accounts and SIDs, access tokens, integrity levels, UAC and access control lists.
2. **Identity and credentials**: account types, Windows Hello, LAPS, NTLM versus Kerberos, and how attackers steal credentials (and how Credential Guard and LSA protection stop them).
3. **Protecting the system**: Microsoft Defender and attack surface reduction rules, the firewall, BitLocker and Secure Boot, and application control.
4. **Updates and configuration**: patching, security baselines, and PowerShell security.
5. **Monitoring**: the event IDs that matter, and Sysmon.
6. **Project**: a security posture review of a Windows PC, with scripts.

## The sample files

All are PowerShell scripts that work in Windows PowerShell 5.1 and PowerShell 7:

| File | Does | Changes anything? |
|---|---|---|
| `Get-SecurityPosture.ps1` | checks antivirus, Defender, firewall, UAC, BitLocker, Secure Boot, credential protection, admins, SMBv1, RDP, PowerShell logging | no |
| `Find-WeakPermissions.ps1` | finds privilege-escalation paths: writable PATH folders, writable service binaries, unquoted service paths | no |
| `Get-LogonActivity.ps1` | summarizes sign-ins, failures and lockouts from the Security log | no |
| `Set-FirewallBaseline.ps1` | applies a firewall baseline | **yes**: run with `-WhatIf` first |
| `Enable-AsrRules.ps1` | enables attack surface reduction rules, in audit mode by default | **yes**: run with `-WhatIf` first |
| `sysmon-starter.xml` | a small, commented Sysmon configuration | (configuration) |

Scripts downloaded from the internet are marked as such by Windows. Read them first, then unblock them with `Unblock-File .\script.ps1`. Several need an **elevated** PowerShell (*Run as administrator*); they say so when they do.

## Practice safely

Use a virtual machine (Hyper-V, VirtualBox, or Windows Sandbox for quick experiments) with a checkpoint to return to, especially for the firewall, ASR and application-control lessons.
