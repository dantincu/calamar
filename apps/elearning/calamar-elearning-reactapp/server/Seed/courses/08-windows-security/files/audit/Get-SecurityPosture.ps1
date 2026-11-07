<#
.SYNOPSIS
    A READ-ONLY check of a Windows PC's main security settings. It changes nothing.

.DESCRIPTION
    Reports PASS, WARN or INFO for: Windows version and updates, Microsoft Defender, attack surface reduction rules,
    the firewall, UAC, BitLocker, Secure Boot, credential protections (LSA protection, Credential Guard),
    local administrators, legacy protocols (SMBv1), remote desktop, and PowerShell logging.

    Some checks need an elevated (administrator) PowerShell; without it they are reported as INFO.

.EXAMPLE
    .\Get-SecurityPosture.ps1
.EXAMPLE
    .\Get-SecurityPosture.ps1 | Where-Object Status -eq WARN
.EXAMPLE
    .\Get-SecurityPosture.ps1 | Export-Csv posture.csv -NoTypeInformation
#>
[CmdletBinding()]
param()

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator)

function Result([string]$Area, [string]$Status, [string]$Check) {
    [pscustomobject]@{ Area = $Area; Status = $Status; Check = $Check }
}
function RegValue([string]$Path, [string]$Name) {
    try { (Get-ItemProperty -Path $Path -Name $Name -ErrorAction Stop).$Name } catch { $null }
}

if (-not $isAdmin) { Result 'General' 'INFO' 'Not elevated: BitLocker, Secure Boot and some other checks are skipped' }

# ---- System and updates -------------------------------------------------------------------------------------
$os = Get-CimInstance Win32_OperatingSystem
Result 'System' 'INFO' "$($os.Caption) build $($os.BuildNumber)"
$lastPatch = Get-HotFix -ErrorAction SilentlyContinue | Where-Object InstalledOn | Sort-Object InstalledOn -Descending | Select-Object -First 1
if ($lastPatch) {
    $days = [int]((Get-Date) - $lastPatch.InstalledOn).TotalDays
    if ($days -le 45) { Result 'Updates' 'PASS' "Last update installed $days days ago ($($lastPatch.HotFixID))" }
    else { Result 'Updates' 'WARN' "Last update installed $days days ago ($($lastPatch.HotFixID)): check Windows Update" }
}

# ---- Antivirus: which product does Windows Security Center see as active? ----------------------------------------
# productState is a bit field; bits 12-13 of the middle byte ((state -shr 8) -band 0x30) are 0x10 when real-time protection is on.
$avProducts = @(Get-CimInstance -Namespace root\SecurityCenter2 -ClassName AntiVirusProduct -ErrorAction SilentlyContinue)
$activeAv = @($avProducts | Where-Object { (($_.productState -shr 8) -band 0x30) -eq 0x10 })
if ($activeAv.Count) { Result 'Antivirus' 'PASS' "Active antivirus: $(($activeAv.displayName) -join ', ')" }
elseif ($avProducts.Count) { Result 'Antivirus' 'WARN' "Antivirus registered but none reports real-time protection: $(($avProducts.displayName) -join ', ')" }
else { Result 'Antivirus' 'INFO' 'Security Center reports no antivirus (normal on Windows Server, which has no Security Center)' }
$defenderIsActive = (-not $avProducts.Count) -or ($activeAv.displayName -contains 'Windows Defender') -or ($activeAv.displayName -contains 'Microsoft Defender Antivirus')

# ---- Microsoft Defender (its own settings are only meaningful when it is the active antivirus) ----------------------
if (-not $defenderIsActive) {
    Result 'Defender' 'INFO' 'Microsoft Defender is not the active antivirus: its settings (ASR rules, controlled folder access) are not in effect'
} else { try {
    $mp = Get-MpComputerStatus -ErrorAction Stop
    if ($mp.AntivirusEnabled -and $mp.RealTimeProtectionEnabled) { Result 'Defender' 'PASS' 'Antivirus and real-time protection are on' }
    else { Result 'Defender' 'WARN' "Antivirus enabled: $($mp.AntivirusEnabled), real-time protection: $($mp.RealTimeProtectionEnabled)" }
    if ($mp.AntivirusSignatureAge -le 3) { Result 'Defender' 'PASS' "Signatures are $($mp.AntivirusSignatureAge) day(s) old" }
    else { Result 'Defender' 'WARN' "Signatures are $($mp.AntivirusSignatureAge) days old" }
    if ($mp.IsTamperProtected) { Result 'Defender' 'PASS' 'Tamper protection is on' } else { Result 'Defender' 'WARN' 'Tamper protection is off' }

    $pref = Get-MpPreference -ErrorAction Stop
    $asr = @($pref.AttackSurfaceReductionRules_Ids)
    $actions = @($pref.AttackSurfaceReductionRules_Actions)
    $blocking = 0; $auditing = 0
    for ($i = 0; $i -lt $asr.Count; $i++) {
        if ($actions[$i] -eq 1) { $blocking++ } elseif ($actions[$i] -eq 2 -or $actions[$i] -eq 6) { $auditing++ }
    }
    if ($blocking -gt 0) { Result 'Defender' 'PASS' "Attack surface reduction: $blocking rule(s) blocking, $auditing auditing or warning" }
    elseif ($auditing -gt 0) { Result 'Defender' 'INFO' "Attack surface reduction: $auditing rule(s) in audit or warn mode, none blocking yet" }
    else { Result 'Defender' 'WARN' 'No attack surface reduction rules configured (see Enable-AsrRules.ps1)' }
    if ($pref.EnableControlledFolderAccess -eq 1) { Result 'Defender' 'PASS' 'Controlled folder access (ransomware protection) is on' }
    else { Result 'Defender' 'INFO' 'Controlled folder access (ransomware protection) is off' }
    if ($pref.PUAProtection -eq 1) { Result 'Defender' 'PASS' 'Blocking of potentially unwanted apps is on' } else { Result 'Defender' 'INFO' 'Blocking of potentially unwanted apps is off' }
} catch {
    Result 'Defender' 'INFO' "Microsoft Defender status unavailable: $($_.Exception.Message)"
} }

# ---- Firewall ------------------------------------------------------------------------------------------------
# (Third-party security suites can replace the Windows Firewall; then these settings are not what protects the PC.)
foreach ($p in Get-NetFirewallProfile -ErrorAction SilentlyContinue) {
    $inbound = if ("$($p.DefaultInboundAction)" -eq 'NotConfigured') { 'NotConfigured = the Windows default, Block' } else { "$($p.DefaultInboundAction)" }
    if ($p.Enabled -and $p.DefaultInboundAction -ne 'Allow') { Result 'Firewall' 'PASS' "$($p.Name) profile on, inbound default: $inbound" }
    else { Result 'Firewall' 'WARN' "$($p.Name) profile: enabled=$($p.Enabled), inbound default=$($p.DefaultInboundAction)" }
}

# ---- UAC -----------------------------------------------------------------------------------------------------
$uacKey = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System'
if ((RegValue $uacKey 'EnableLUA') -eq 1) { Result 'UAC' 'PASS' 'User Account Control is on' } else { Result 'UAC' 'WARN' 'User Account Control is OFF' }
$consent = RegValue $uacKey 'ConsentPromptBehaviorAdmin'
if ($consent -eq 0) { Result 'UAC' 'WARN' 'Administrators are elevated without any prompt (ConsentPromptBehaviorAdmin = 0)' }
elseif ($null -ne $consent) { Result 'UAC' 'PASS' "Administrators are prompted before elevation (ConsentPromptBehaviorAdmin = $consent)" }

# ---- Local administrators --------------------------------------------------------------------------------------
try {
    $admins = Get-LocalGroupMember -SID 'S-1-5-32-544' -ErrorAction Stop   # the Administrators group, whatever its local name
    Result 'Accounts' 'INFO' "Members of Administrators: $(($admins.Name) -join ', ')"
    $me = [Security.Principal.WindowsIdentity]::GetCurrent().Name
    if ($admins.Name -contains $me) { Result 'Accounts' 'WARN' "You ($me) are a local administrator: use a standard account for daily work" }
    else { Result 'Accounts' 'PASS' "You ($me) work as a standard user" }
} catch { Result 'Accounts' 'INFO' "Local administrators unavailable: $($_.Exception.Message)" }
$guest = Get-LocalUser -ErrorAction SilentlyContinue | Where-Object { $_.SID.Value -like '*-501' }
if ($guest -and $guest.Enabled) { Result 'Accounts' 'WARN' 'The Guest account is enabled' } elseif ($guest) { Result 'Accounts' 'PASS' 'The Guest account is disabled' }

# ---- Credential protection ---------------------------------------------------------------------------------------
$runAsPpl = RegValue 'HKLM:\SYSTEM\CurrentControlSet\Control\Lsa' 'RunAsPPL'
if ($runAsPpl -in 1, 2) { Result 'Credentials' 'PASS' "LSA protection is configured (RunAsPPL = $runAsPpl)" }
else { Result 'Credentials' 'INFO' 'LSA protection (RunAsPPL) is not configured in the registry (it may still be on by default on new Windows 11 installs)' }
try {
    $dg = Get-CimInstance -Namespace root\Microsoft\Windows\DeviceGuard -ClassName Win32_DeviceGuard -ErrorAction Stop
    if ($dg.SecurityServicesRunning -contains 1) { Result 'Credentials' 'PASS' 'Credential Guard is running' }
    else { Result 'Credentials' 'INFO' 'Credential Guard is not running (requires Enterprise/Education or a supported edition, and virtualization-based security)' }
    if ($dg.VirtualizationBasedSecurityStatus -eq 2) { Result 'Credentials' 'PASS' 'Virtualization-based security is running' }
    else { Result 'Credentials' 'INFO' "Virtualization-based security status: $($dg.VirtualizationBasedSecurityStatus) (2 = running)" }
} catch { Result 'Credentials' 'INFO' 'Device Guard information unavailable' }

# ---- Disk encryption and boot ----------------------------------------------------------------------------------
if ($isAdmin) {
    try {
        $bl = Get-BitLockerVolume -MountPoint $env:SystemDrive -ErrorAction Stop
        if ($bl.ProtectionStatus -eq 'On') { Result 'Encryption' 'PASS' "BitLocker protects $($env:SystemDrive) ($($bl.EncryptionMethod))" }
        else { Result 'Encryption' 'WARN' "BitLocker does not protect $($env:SystemDrive) (status: $($bl.VolumeStatus))" }
    } catch { Result 'Encryption' 'INFO' "BitLocker status unavailable: $($_.Exception.Message)" }
    try {
        if (Confirm-SecureBootUEFI -ErrorAction Stop) { Result 'Boot' 'PASS' 'Secure Boot is on' } else { Result 'Boot' 'WARN' 'Secure Boot is off' }
    } catch { Result 'Boot' 'INFO' 'Secure Boot not supported or not readable (legacy BIOS?)' }
}

# ---- Legacy protocols and remote access --------------------------------------------------------------------------
try {
    $smb = Get-SmbServerConfiguration -ErrorAction Stop
    if ($smb.EnableSMB1Protocol) { Result 'Network' 'WARN' 'SMBv1 server is enabled (WannaCry, NotPetya spread through it)' } else { Result 'Network' 'PASS' 'SMBv1 server is disabled' }
} catch { Result 'Network' 'INFO' 'SMB server configuration unavailable' }

$rdpOff = RegValue 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server' 'fDenyTSConnections'
if ($rdpOff -eq 1) { Result 'Remote access' 'PASS' 'Remote Desktop is off' }
else {
    $nla = RegValue 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' 'UserAuthentication'
    if ($nla -eq 1) { Result 'Remote access' 'INFO' 'Remote Desktop is ON, with Network Level Authentication: never expose it to the internet' }
    else { Result 'Remote access' 'WARN' 'Remote Desktop is ON without Network Level Authentication' }
}

# ---- PowerShell ---------------------------------------------------------------------------------------------------
$sbl = RegValue 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging' 'EnableScriptBlockLogging'
if ($sbl -eq 1) { Result 'PowerShell' 'PASS' 'Script block logging is on (event 4104)' } else { Result 'PowerShell' 'INFO' 'Script block logging is not enabled by policy' }
Result 'PowerShell' 'INFO' "Execution policy: $(Get-ExecutionPolicy) (a safety belt against accidents, not a security boundary)"
