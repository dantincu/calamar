# Sysmon

**Sysmon** (System Monitor, from Microsoft Sysinternals) is a free driver and service that logs detailed activity that Windows doesn't record by default: process creations with hashes and parent processes, network connections per process, DNS queries, registry changes and more. It's a staple of detection engineering and incident response.

## Installing

```powershell
# download Sysmon from Sysinternals (learn.microsoft.com/sysinternals), then from an elevated prompt:
.\sysmon64.exe -accepteula -i sysmon-starter.xml     # install with a configuration
.\sysmon64.exe -c sysmon-starter.xml                 # update the configuration later
.\sysmon64.exe -c                                    # show the current configuration
```

Events go to *Applications and Services Logs > Microsoft > Windows > Sysmon > Operational*.

## The events

| ID | Event | Detects |
|---|---|---|
| **1** | process creation: image, command line, **hashes**, **parent process**, user | almost everything: an Office app spawning PowerShell, encoded commands |
| **3** | network connection, per process | `rundll32.exe` talking to the internet; beaconing |
| 7 | image (DLL) loaded | DLL hijacking (noisy) |
| **8** | CreateRemoteThread | code injection |
| **10** | process access | tools opening `lsass.exe`: credential dumping |
| **11** | file created | droppers writing executables into Downloads, AppData or Temp |
| **12–14** | registry key and value changes | Run-key persistence, service creation |
| **22** | DNS query, per process | which program looked up which domain |
| 23 / 26 | file deleted (archived / logged) | wipers, attackers deleting their tools |

## The attached configuration

`sysmon-starter.xml` is deliberately small and commented, so you can read every line:

- **every process creation** (event 1) and **every DNS query** (22);
- network connections only from programs that rarely have a good reason to make them: PowerShell, `rundll32`, `regsvr32`, `mshta`, `certutil`, `wscript`, `cscript`;
- all remote-thread creation, and every access to `lsass.exe`;
- files created in user-writable locations, and changes to Run keys, services and Winlogon.

Rule logic: `onmatch="include"` logs only matches; `onmatch="exclude"` logs everything except matches, so an empty exclude logs everything.

For production, start from a maintained community configuration (SwiftOnSecurity's *sysmon-config*, or Olaf Hartong's *sysmon-modular*), and tune it to your environment's noise.

## Hunting with Sysmon and PowerShell

```powershell
$log = 'Microsoft-Windows-Sysmon/Operational'

# Office applications that started a command interpreter
Get-WinEvent -FilterHashtable @{ LogName = $log; Id = 1 } -MaxEvents 5000 |
    Where-Object { $_.Message -match 'ParentImage: .*\\(WINWORD|EXCEL|POWERPNT|OUTLOOK)\.EXE' -and
                   $_.Message -match 'Image: .*\\(powershell|cmd|wscript|mshta)\.exe' }

# Everything that opened lsass.exe
Get-WinEvent -FilterHashtable @{ LogName = $log; Id = 10 } -MaxEvents 1000 |
    ForEach-Object { ($_.Message -split "`n" | Select-String 'SourceImage').ToString().Trim() } |
    Group-Object | Sort-Object Count -Descending
```

The second query shows a baseline of legitimate LSASS accessors (security products, `svchost`). Anything new on that list deserves a closer look.

## Process trees tell the story

The single most useful idea in host detection is the **parent-child relationship**. `explorer.exe → winword.exe` is normal. `winword.exe → powershell.exe -enc …` is a malicious macro. `w3wp.exe → cmd.exe` is a web shell on an IIS server. Sysmon event 1 records both sides, together with hashes that you can check against threat intelligence.
