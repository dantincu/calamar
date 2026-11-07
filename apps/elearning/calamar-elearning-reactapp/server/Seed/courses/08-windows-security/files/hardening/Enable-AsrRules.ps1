<#
.SYNOPSIS
    Turns on Microsoft Defender attack surface reduction (ASR) rules, in AUDIT mode by default.

.DESCRIPTION
    ASR rules block behaviors that malware relies on, such as Office starting child processes or scripts launching
    downloaded programs. Start in audit mode, review what would have been blocked (Event Viewer > Applications and
    Services Logs > Microsoft > Windows > Windows Defender > Operational, event 1121 = blocked, 1122 = audited),
    then switch to -Mode Enabled.

    Requires an elevated PowerShell and Microsoft Defender Antivirus as the active antivirus.
    The rule GUIDs come from Microsoft's "ASR rules reference"; check it for new rules.

.EXAMPLE
    .\Enable-AsrRules.ps1 -WhatIf
.EXAMPLE
    .\Enable-AsrRules.ps1                  # audit mode
.EXAMPLE
    .\Enable-AsrRules.ps1 -Mode Enabled    # block mode
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [ValidateSet('AuditMode', 'Warn', 'Enabled', 'Disabled')]
    [string]$Mode = 'AuditMode'
)

# The "standard protection" rules (safe for almost everyone) and the most useful others
$rules = [ordered]@{
    '56a863a9-875e-4185-98a7-b882c64b5ce5' = 'Block abuse of exploited vulnerable signed drivers'
    '9e6c4e1f-7d60-472f-ba1a-a39ef669e4b2' = 'Block credential stealing from the Windows local security authority subsystem (lsass.exe)'
    'e6db77e5-3df2-4cf1-b95a-636979351e5b' = 'Block persistence through WMI event subscription'
    'be9ba2d9-53ea-4cdc-84e5-9b1eeee46550' = 'Block executable content from email client and webmail'
    'd4f940ab-401b-4efc-aadc-ad5f3c50688a' = 'Block all Office applications from creating child processes'
    '3b576869-a4ec-4529-8536-b80a7769e899' = 'Block Office applications from creating executable content'
    '75668c1f-73b5-4cf0-bb93-3ecf5cb7cc84' = 'Block Office applications from injecting code into other processes'
    '26190899-1602-49e8-8b27-eb1d0a1ce869' = 'Block Office communication application from creating child processes'
    '92e97fa1-2edf-4476-bdd6-9dd0b4dddc7b' = 'Block Win32 API calls from Office macros'
    'd3e037e1-3eb8-44c8-a917-57927947596d' = 'Block JavaScript or VBScript from launching downloaded executable content'
    '5beb7efe-fd9a-4556-801d-275e5ffc04cc' = 'Block execution of potentially obfuscated scripts'
    'b2b3f03d-6a65-4f7b-a9c7-1c7ef74a9ba4' = 'Block untrusted and unsigned processes that run from USB'
    '7674ba52-37eb-4a4f-a9a1-f0f9a1619a2c' = 'Block Adobe Reader from creating child processes'
    'c1db55ab-c21a-4637-bb3f-a12568109d35' = 'Use advanced protection against ransomware'
    # Test these two carefully: they break some management and admin tools
    # 'd1e49aac-8f56-4280-b9ba-993a6d77406c' = 'Block process creations originating from PSExec and WMI commands'
    # '01443614-cd74-433a-b99e-2ecdc07bfc25' = 'Block executable files from running unless they meet a prevalence, age, or trusted list criterion'
}

foreach ($id in $rules.Keys) {
    if ($PSCmdlet.ShouldProcess($rules[$id], "Set ASR rule to $Mode")) {
        # Add-MpPreference adds or updates one rule without touching the others (Set-MpPreference would replace the whole list)
        Add-MpPreference -AttackSurfaceReductionRules_Ids $id -AttackSurfaceReductionRules_Actions $Mode
    }
}

# Show the result: 0 = disabled, 1 = block, 2 = audit, 6 = warn
if (-not $WhatIfPreference) {
    $pref = Get-MpPreference
    $names = @{ 0 = 'Disabled'; 1 = 'Block'; 2 = 'Audit'; 6 = 'Warn' }
    for ($i = 0; $i -lt @($pref.AttackSurfaceReductionRules_Ids).Count; $i++) {
        $id = $pref.AttackSurfaceReductionRules_Ids[$i]
        $label = if ($rules.Contains($id)) { $rules[$id] } else { '(other rule)' }
        [pscustomobject]@{ Mode = $names[[int]$pref.AttackSurfaceReductionRules_Actions[$i]]; Rule = $label; Id = $id }
    }
}
