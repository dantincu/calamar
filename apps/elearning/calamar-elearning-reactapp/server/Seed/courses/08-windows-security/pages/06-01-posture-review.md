# Reviewing a Windows PC

Use your own PC or a lab VM. Steps 1 to 3 change nothing.

## 1. Measure

```powershell
Unblock-File .\Get-SecurityPosture.ps1, .\Find-WeakPermissions.ps1
.\Get-SecurityPosture.ps1 | Format-Table -AutoSize -Wrap          # once normally…
# …and once from an elevated PowerShell, which adds BitLocker and Secure Boot
.\Get-SecurityPosture.ps1 | Export-Csv "posture-$(Get-Date -Format yyyy-MM-dd).csv" -NoTypeInformation
.\Find-WeakPermissions.ps1
```

Here is a real, unedited excerpt from a developer's PC, run without elevation:

```
Area          Status Check
Antivirus     PASS   Active antivirus: Bitdefender Antivirus
Defender      INFO   Microsoft Defender is not the active antivirus: its settings (ASR rules, …) are not in effect
Firewall      PASS   Public profile on, inbound default: NotConfigured = the Windows default, Block
UAC           PASS   Administrators are prompted before elevation (ConsentPromptBehaviorAdmin = 5)
Accounts      WARN   You (PC\ada) are a local administrator: use a standard account for daily work
Credentials   PASS   LSA protection is configured (RunAsPPL = 2)
Credentials   INFO   Credential Guard is not running (requires Enterprise/Education or a supported edition, …)
Network       PASS   SMBv1 server is disabled
Remote access PASS   Remote Desktop is off
PowerShell    INFO   Script block logging is not enabled by policy
```

## 2. Interpret

For each WARN and INFO line, decide:

- **Is it a real risk here?** "Credential Guard not running" on Windows Home is a limitation of the edition, not a misconfiguration. "Defender's ASR rules aren't in effect" is expected when another product protects the PC, but then check what *that* product offers instead.
- **What would an attacker do with it?** "Daily work as an administrator" means any malware you run gets admin rights, can dump credentials, and can disable protection.

## 3. Prioritize

Score each finding with **likelihood × impact** (1–5 each), and fix from the top. Typical high scorers:

| Finding | Why it's high |
|---|---|
| daily work as administrator | every other compromise becomes total |
| exposed RDP, or RDP without NLA | a top ransomware entry point |
| missing updates (> 45 days) | known, exploited vulnerabilities |
| no disk encryption on a laptop | theft means data loss |
| writable service binaries or PATH folders | instant local privilege escalation |
| SMBv1 enabled | wormable, as in WannaCry |

## 4. Fix (in a VM first)

- Create a standard account for daily use, and keep the admin account separate.
- Turn on BitLocker or device encryption; escrow the recovery key.
- Preview, then apply the firewall baseline: `.\Set-FirewallBaseline.ps1 -WhatIf`.
- If Defender is your antivirus: `.\Enable-AsrRules.ps1` (audit mode), review events 1121 and 1122 for a week, then `-Mode Enabled`.
- Enable script block logging, process-creation auditing with command lines, and a larger Security log.
- Install Sysmon with `sysmon-starter.xml`.
- Fix any `Find-WeakPermissions.ps1` findings with `icacls`, or by quoting service paths (in the service's `ImagePath` registry value).

## 5. Verify

Run step 1 again, and compare the two CSV files:

```powershell
$before = Import-Csv .\posture-2026-11-01.csv; $after = Import-Csv .\posture-2026-11-08.csv
Compare-Object $before $after -Property Area, Status, Check | Sort-Object Area | Format-Table
```

Then test that the controls actually **work**:

- Try to start PowerShell from a macro-enabled test document in a VM with the Office ASR rule in block mode.
- Run `Get-LogonActivity.ps1` (elevated) after a deliberate wrong password.
- Check that Sysmon logged your test with event 1.

## What the scripts taught us

Three of this course's scripts had bugs in their first versions, all caught by testing them on a real machine:

- the permission checker treated **read** access as **write** access (a bit-mask mistake), and flagged `System32`;
- the posture check didn't notice a **third-party antivirus**, and raised three false alarms;
- the logon report turned **"access denied" into "no events found"**, the most dangerous kind of bug for a security tool.

The lesson applies to every security tool you write or buy: **test it against known-bad and known-good cases**, and make sure it can tell "all clear" apart from "couldn't check".

Congratulations on finishing the course.
