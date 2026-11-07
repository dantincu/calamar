# Microsoft Defender and attack surface reduction

## Which antivirus is active?

Microsoft Defender Antivirus is built into Windows. When you install another antivirus product, it registers with **Windows Security Center**, and Defender steps aside (it goes into passive mode, or turns off). Only one real-time engine should be active.

This matters for auditing. `Get-SecurityPosture.ps1` asks Security Center first:

```
Antivirus  PASS  Active antivirus: Bitdefender Antivirus
Defender   INFO  Microsoft Defender is not the active antivirus: its settings (ASR rules, controlled folder access) are not in effect
```

Its first version didn't, and on a PC protected by another product it reported three false warnings, including signatures "65535 days old" (Defender's placeholder value when it isn't running). Security Center's `productState` field is a bit field. Real-time protection is on when

$$
\left(\left\lfloor \tfrac{\text{productState}}{2^8} \right\rfloor \wedge \texttt{0x30}\right) = \texttt{0x10}
$$

For example, $266240 = \texttt{0x41000}$ gives $\texttt{0x410} \wedge \texttt{0x30} = \texttt{0x10}$: on. And $393472 = \texttt{0x60100}$ gives $\texttt{0x601} \wedge \texttt{0x30} = \texttt{0x00}$: off.

## Defender features worth turning on

```powershell
Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled, IsTamperProtected, AntivirusSignatureAge
Set-MpPreference -PUAProtection Enabled                 # block potentially unwanted apps (bundleware, adware)
Set-MpPreference -EnableControlledFolderAccess Enabled  # ransomware protection for Documents, Pictures…
Set-MpPreference -MAPSReporting Advanced -SubmitSamplesConsent SendSafeSamples   # cloud protection
```

- **Tamper protection** stops malware (and admins) from turning Defender off through the registry or PowerShell. Turn it on, and keep it on.
- **Cloud-delivered protection** gets verdicts on new files within seconds. Several ASR rules depend on it.
- **Controlled folder access** lets only trusted apps write to protected folders. It's very effective against ransomware, but expect to allow a few legitimate apps.

## Attack surface reduction (ASR) rules

ASR rules block **behaviors** that malware relies on, but legitimate software rarely needs:

| Rule (selection) | Blocks |
|---|---|
| Block all Office applications from creating child processes | the classic "macro starts PowerShell" chain |
| Block Win32 API calls from Office macros | shellcode launched straight from VBA |
| Block executable content from email client and webmail | attachments that drop executables and scripts |
| Block JavaScript or VBScript from launching downloaded executable content | script-based downloaders |
| Block execution of potentially obfuscated scripts | obfuscated PowerShell, JavaScript and VBScript |
| Block credential stealing from LSASS | credential dumping |
| Block persistence through WMI event subscription | a stealthy persistence technique |
| Block abuse of exploited vulnerable signed drivers | "bring your own vulnerable driver" attacks on the kernel |
| Use advanced protection against ransomware | files that look like ransomware |

Each rule has a GUID and a mode: `0` disabled, `1` block, `2` audit, `6` warn (the user may bypass).

## Rolling them out

`Enable-AsrRules.ps1` enables 14 rules (with GUIDs taken from Microsoft's ASR rules reference), in **audit mode** by default:

```powershell
.\Enable-AsrRules.ps1 -WhatIf          # show what would change
.\Enable-AsrRules.ps1                  # audit mode: log, don't block
.\Enable-AsrRules.ps1 -Mode Enabled    # block, after reviewing the audit events
```

It uses `Add-MpPreference`, which adds or updates rules one at a time. `Set-MpPreference` would **replace** the whole list, silently dropping rules configured elsewhere.

Review the audit events (Microsoft-Windows-Windows Defender/Operational: **1121** blocked, **1122** audited) for a week or two:

```powershell
Get-WinEvent -FilterHashtable @{ LogName = 'Microsoft-Windows-Windows Defender/Operational'; Id = 1121, 1122 } -MaxEvents 50 |
    Select-Object TimeCreated, Id, Message
```

Add exclusions for legitimate line-of-business tools, then switch to block mode. In organizations, deploy the rules through Intune or Group Policy instead of scripts.

The two rules commented out in the script ("PSExec and WMI" and "prevalence, age or trusted list") are the most likely to break management and admin tools. Pilot them separately.
