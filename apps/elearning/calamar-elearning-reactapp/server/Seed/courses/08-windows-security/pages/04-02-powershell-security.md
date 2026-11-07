# PowerShell security

PowerShell can do anything an administrator can, which is exactly why attackers love it: it's on every machine, trusted and powerful. The answer isn't to block it, but to make its use **visible** and **constrained**.

## The execution policy is not a security boundary

```powershell
Get-ExecutionPolicy -List
```

`Restricted`, `RemoteSigned` and `AllSigned` stop **accidental** execution of scripts, such as double-clicking a downloaded `.ps1`. They don't stop an attacker, who can simply run `powershell -ExecutionPolicy Bypass`, pipe a script into PowerShell, or type the commands. Microsoft documents this explicitly. `RemoteSigned` is a sensible default; just don't count it as a defense.

## Logging: make PowerShell visible

| Logging | Records | Where |
|---|---|---|
| **Script block logging** | the actual code that runs, **after de-obfuscation** | Microsoft-Windows-PowerShell/Operational, event **4104** |
| Module logging | pipeline execution details | event 4103 |
| Transcription | full input and output of sessions, as text files | a folder you choose (protect it, and ship it off the machine) |

Enable them with Group Policy (*Administrative Templates > Windows Components > Windows PowerShell*), or with the registry for testing:

```powershell
$key = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging'
New-Item $key -Force | Out-Null
Set-ItemProperty $key -Name EnableScriptBlockLogging -Value 1     # elevated
```

Even without that policy, PowerShell logs script blocks that contain suspicious keywords as **warning-level 4104 events**. Script block logging is particularly valuable because attackers obfuscate their commands, and the logged block is what actually executes.

## AMSI

The **Antimalware Scan Interface** lets the antivirus inspect scripts at run time, after de-obfuscation and just before execution, in PowerShell, VBScript, JScript, Office VBA macros and .NET. It's why the ASR rule "Block execution of potentially obfuscated scripts" can work. Attacks that try to disable AMSI in memory are themselves detected by most security products.

## Constrained Language Mode

In **Constrained Language Mode**, PowerShell can still run cmdlets, but can't call arbitrary .NET methods, Win32 APIs or COM objects, which removes most offensive tooling. It's enforced reliably by **App Control for Business**: scripts that the policy allows run in Full Language mode, and everything else (including interactive sessions of standard users) runs constrained.

```powershell
$ExecutionContext.SessionState.LanguageMode       # FullLanguage or ConstrainedLanguage
```

## Just Enough Administration (JEA)

**JEA** gives users a remote PowerShell endpoint where they can run **only** specific cmdlets with specific parameters, executed under a temporary privileged virtual account. It's the PowerShell equivalent of a tight `sudo` rule: the help desk can restart the print spooler without being administrators.

## Remove PowerShell 2.0

PowerShell 2.0 predates all of the above: no script block logging, no AMSI, no Constrained Language Mode. Attackers used `powershell -Version 2` to dodge them. Microsoft is removing it from Windows. Where it's still present, remove it:

```powershell
Disable-WindowsOptionalFeature -Online -FeatureName MicrosoftWindowsPowerShellV2Root   # elevated
```

## Sign your own scripts

In organizations with `AllSigned`, or App Control for Business, sign internal scripts with a code-signing certificate:

```powershell
$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Select-Object -First 1
Set-AuthenticodeSignature .\Get-SecurityPosture.ps1 -Certificate $cert -TimestampServer http://timestamp.digicert.com
```
