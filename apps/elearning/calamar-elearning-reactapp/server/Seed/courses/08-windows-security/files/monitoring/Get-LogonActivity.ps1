<#
.SYNOPSIS
    Summarizes sign-in activity from the Security event log: successes (4624), failures (4625) and lockouts (4740).

.DESCRIPTION
    Reading the Security log requires an elevated PowerShell (or membership in Event Log Readers).
    Logon types: 2 interactive, 3 network, 4 batch, 5 service, 7 unlock, 8 network cleartext,
    9 new credentials (runas /netonly), 10 remote interactive (RDP), 11 cached interactive.

.EXAMPLE
    .\Get-LogonActivity.ps1 -Hours 24
.EXAMPLE
    .\Get-LogonActivity.ps1 -Hours 168 -FailuresOnly | Format-Table
#>
[CmdletBinding()]
param(
    [int]$Hours = 24,
    [switch]$FailuresOnly
)

$logonTypes = @{ 2 = 'Interactive'; 3 = 'Network'; 4 = 'Batch'; 5 = 'Service'; 7 = 'Unlock'; 8 = 'NetworkCleartext';
                 9 = 'NewCredentials'; 10 = 'RemoteInteractive (RDP)'; 11 = 'CachedInteractive' }
$ids = if ($FailuresOnly) { 4625, 4740 } else { 4624, 4625, 4740 }

# Check access first: without the right to read the Security log, a FILTERED query reports
# "No events were found" instead of "access denied", which would look like a clean result.
try { Get-WinEvent -LogName Security -MaxEvents 1 -ErrorAction Stop | Out-Null }
catch [System.UnauthorizedAccessException] {
    Write-Warning "Access to the Security log was denied. Run PowerShell as administrator (or join the Event Log Readers group)."
    return
}

try {
    $events = Get-WinEvent -FilterHashtable @{ LogName = 'Security'; Id = $ids; StartTime = (Get-Date).AddHours(-$Hours) } -ErrorAction Stop
} catch [System.Exception] {
    if ($_.Exception.Message -match 'No events were found') { Write-Host "No matching events in the last $Hours hours."; return }
    Write-Warning "Can't read the Security log: $($_.Exception.Message). Run PowerShell as administrator."
    return
}

$rows = foreach ($e in $events) {
    # The event's data fields, by name (more robust than positions, which differ between event IDs)
    $xml = [xml]$e.ToXml()
    $data = @{}
    foreach ($d in $xml.Event.EventData.Data) { $data[$d.Name] = $d.'#text' }

    # Skip the noise of the machine and its services signing in
    if ($e.Id -eq 4624 -and ($data['TargetUserSid'] -in 'S-1-5-18', 'S-1-5-19', 'S-1-5-20' -or $data['TargetUserName'] -like '*$')) { continue }

    $type = 0; [void][int]::TryParse([string]$data['LogonType'], [ref]$type)
    [pscustomobject]@{
        Time      = $e.TimeCreated
        Event     = switch ($e.Id) { 4624 { 'Success' } 4625 { 'FAILURE' } 4740 { 'LOCKOUT' } }
        User      = "$($data['TargetDomainName'])\$($data['TargetUserName'])".TrimStart('\')
        LogonType = if ($logonTypes.ContainsKey($type)) { $logonTypes[$type] } else { '' }
        Source    = if ($data['IpAddress'] -and $data['IpAddress'] -ne '-') { $data['IpAddress'] } else { $data['WorkstationName'] }
        # For failures: 0xC000006A = wrong password, 0xC0000064 = unknown user, 0xC0000234 = account locked
        Status    = $data['SubStatus']
    }
}

$rows
Write-Host ''
Write-Host 'Failures by source and user:' -ForegroundColor Yellow
$rows | Where-Object Event -eq 'FAILURE' | Group-Object Source, User -NoElement | Sort-Object Count -Descending |
    Select-Object -First 10 | Format-Table Count, Name -AutoSize
