# Updates and security baselines

## Patch Tuesday

Microsoft releases security updates on the **second Tuesday of each month**, with out-of-band releases for actively exploited flaws. Updates are **cumulative**: the latest one contains all the previous fixes.

```powershell
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 5 HotFixID, InstalledOn
```

`Get-SecurityPosture.ps1` warns when the last update is more than 45 days old: more than one Patch Tuesday has been missed.

What else needs updating:

- **Third-party software**: browsers, PDF readers, Java runtimes, VPN clients and archivers are frequent targets. `winget upgrade --all` updates many of them.
- **Drivers and firmware**, including the BIOS/UEFI, and Secure Boot revocations.
- **Microsoft Office**, through its own update channel.

In organizations: Windows Update for Business or Autopatch through Intune, or WSUS or Configuration Manager on-premises, with **rings** (pilot, then broad). Prioritize vulnerabilities that are being actively exploited (the CISA KEV catalog) and internet-facing systems.

## Security baselines

Windows has thousands of settings. **Security baselines** are Microsoft's recommended configurations, tested for compatibility:

- Microsoft's **Security Compliance Toolkit**: Group Policy objects for each Windows release, with `Policy Analyzer` to compare them with your current settings, and `LGPO.exe` to apply them to standalone machines;
- **Intune security baselines** for cloud-managed devices;
- the **CIS Benchmarks**: an independent alternative, with "Level 1" (sensible) and "Level 2" (strict) profiles.

Typical settings in baselines:

| Area | Examples |
|---|---|
| Legacy protocols | SMBv1 off; LLMNR and NetBIOS name resolution off (poisoning attacks); NTLMv1 refused |
| Signing | SMB and LDAP signing required |
| Accounts | lockout policy; Guest disabled; blank passwords refused for network sign-in |
| Auditing | process creation (4688) with command lines; logon events; account management |
| PowerShell | script block logging |
| Credentials | WDigest off (no cleartext passwords in memory); LSA protection; Credential Guard |
| Office | macros from the internet blocked |

```powershell
Get-SmbServerConfiguration | Select-Object EnableSMB1Protocol, RequireSecuritySignature
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol     # elevated
```

SMBv1 deserves its reputation: the **WannaCry** and **NotPetya** outbreaks of 2017 spread through an SMBv1 vulnerability (EternalBlue), automatically, across networks.

## Apply, then verify

Settings drift: someone makes an exception, an installer changes a policy. Re-check regularly with `Get-SecurityPosture.ps1`, Policy Analyzer, or your management platform's compliance reports.
