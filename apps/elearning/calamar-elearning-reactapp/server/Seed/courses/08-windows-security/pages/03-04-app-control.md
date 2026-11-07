# Application control

Antivirus asks "is this program known to be bad?" Application control asks the opposite question: **"is this program known to be good?"**, and runs nothing else. It's one of the most effective controls against malware and ransomware, because new malware is, by definition, not on the allow list.

## The options

| Technology | Availability | Model |
|---|---|---|
| **Smart App Control** | Windows 11 | automatic: allows apps that Microsoft's cloud predicts are safe, or that are properly signed; blocks the rest. Built for home and small business PCs |
| **App Control for Business** (formerly Windows Defender Application Control, WDAC) | all editions; managed through Intune, Group Policy or PowerShell | kernel-enforced policies: allow by signer, file hash, path or reputation; can also cover drivers and scripts |
| **AppLocker** | Enterprise/Education (and Server) | older, simpler, user-mode rules by publisher, path or hash; still useful, but no longer actively developed |

## Rule types, from strongest to weakest

1. **Publisher (signer) rules**: "allow anything signed by Contoso's code-signing certificate". Survives updates.
2. **Hash rules**: "allow exactly this file". Precise, but every update needs a new rule.
3. **Path rules**: "allow anything in `C:\Program Files`". Convenient, but only safe for paths that **standard users can't write to**. A path rule on a user-writable folder is an open door. (`Find-WeakPermissions.ps1` helps find such folders.)

## Rolling out App Control for Business

```powershell
# 1. Start from Microsoft's example policies (allow Windows + Microsoft-signed + reputable apps)
Copy-Item "$env:windir\schemas\CodeIntegrity\ExamplePolicies\SmartAppControl.xml" .\policy.xml
# 2. Keep it in audit mode while you collect what runs (rule option 3 = Audit Mode)
Set-RuleOption -FilePath .\policy.xml -Option 3
# 3. Compile it to binary, and deploy (here locally; in organizations through Intune or Group Policy)
ConvertFrom-CIPolicy -XmlFilePath .\policy.xml -BinaryFilePath .\policy.cip
```

Audit events appear in *Applications and Services Logs > Microsoft > Windows > CodeIntegrity > Operational* (3076 audited, 3077 blocked). Review them, add rules for legitimate software, then remove the audit option to enforce.

Practise in a VM: a wrong enforced policy can stop a machine from running the software it needs.

## Scripts and "living off the land"

Attackers increasingly avoid dropping executables at all, and abuse **built-in tools** instead: PowerShell, `mshta.exe`, `rundll32.exe`, `regsvr32.exe`, `certutil.exe`, `wmic.exe`. Application control helps here too:

- App Control for Business puts PowerShell into **Constrained Language Mode** for scripts that the policy doesn't allow (next chapter).
- Microsoft publishes a **recommended block list** of signed tools that bypass application control. Include it in your policies.
- The **vulnerable driver block list** (on by default in Windows 11) blocks known-vulnerable signed drivers that attackers load to disable security tools.

## Start small

Full allow-listing is hard on developer machines, and easy on kiosks, servers and single-purpose PCs. Start where it's easy, and pair it with the ASR rules elsewhere.
