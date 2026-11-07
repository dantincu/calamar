<#
.SYNOPSIS
    Applies a simple Windows Firewall baseline: every profile on, inbound blocked by default, dropped packets logged,
    and an example of a narrowly scoped inbound rule.

.DESCRIPTION
    Run from an elevated PowerShell. ALWAYS try it first with -WhatIf, which shows what would change without changing it.
    On a remote machine, make sure the rules keep your own remote access open before applying.

.EXAMPLE
    .\Set-FirewallBaseline.ps1 -WhatIf
.EXAMPLE
    .\Set-FirewallBaseline.ps1 -RdpFrom 192.0.2.0/24
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    # Allow Remote Desktop only from these addresses (empty: don't create the rule)
    [string[]]$RdpFrom = @()
)

# 1. All three profiles on; block unsolicited inbound traffic; allow outbound; log what is dropped
foreach ($profileName in 'Domain', 'Private', 'Public') {
    if ($PSCmdlet.ShouldProcess("$profileName profile", 'Enable, block inbound by default, log dropped packets')) {
        Set-NetFirewallProfile -Name $profileName -Enabled True -DefaultInboundAction Block -DefaultOutboundAction Allow `
            -NotifyOnListen True -LogBlocked True -LogMaxSizeKilobytes 16384 `
            -LogFileName "%systemroot%\system32\LogFiles\Firewall\pfirewall.log"
    }
}

# 2. On public networks (cafés, airports), ignore the local "allow" rules that apps created: only Group Policy rules apply
if ($PSCmdlet.ShouldProcess('Public profile', 'Ignore locally created allow rules')) {
    Set-NetFirewallProfile -Name Public -AllowLocalFirewallRules False
}

# 3. An example of a narrow rule: Remote Desktop only from a management network, only on the Domain/Private profiles
if ($RdpFrom.Count -gt 0 -and $PSCmdlet.ShouldProcess("RDP from $($RdpFrom -join ', ')", 'Create inbound rule')) {
    Get-NetFirewallRule -DisplayName 'Baseline - RDP from management' -ErrorAction SilentlyContinue | Remove-NetFirewallRule
    New-NetFirewallRule -DisplayName 'Baseline - RDP from management' -Direction Inbound -Action Allow `
        -Protocol TCP -LocalPort 3389 -RemoteAddress $RdpFrom -Profile Domain, Private | Out-Null
}

# 4. Show inbound allow rules that are enabled for ANY remote address on the Public profile: review each one
$risky = Get-NetFirewallRule -Direction Inbound -Action Allow -Enabled True -ErrorAction SilentlyContinue |
    Where-Object { $_.Profile -match 'Public|Any' } |
    Where-Object { ($_ | Get-NetFirewallAddressFilter).RemoteAddress -contains 'Any' }
Write-Host "Inbound allow rules open to any address on public networks: $(@($risky).Count)"
$risky | Select-Object -First 15 DisplayName, Profile | Format-Table -AutoSize
