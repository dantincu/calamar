<#
.SYNOPSIS
    Looks for classic local privilege-escalation paths: places where a standard user can write files that
    a privileged process will later run.

.DESCRIPTION
    READ-ONLY. Checks:
      1. Directories in the SYSTEM-wide PATH that ordinary users can write to
         (a planted DLL or program there can be loaded by privileged processes).
      2. Service executables, and their folders, that ordinary users can modify
         (services usually run as LocalSystem).
      3. Service paths with spaces and no quotes ("unquoted service paths"): C:\Program Files\My App\svc.exe
         is tried as C:\Program.exe, then C:\Program Files\My.exe, ... if those locations are writable.

    "Ordinary users" means Everyone, Authenticated Users, Users, and the current user when not an administrator.

.EXAMPLE
    .\Find-WeakPermissions.ps1
#>
[CmdletBinding()]
param()

$weakPrincipals = @('Everyone', 'NT AUTHORITY\Authenticated Users', 'BUILTIN\Users', 'NT AUTHORITY\INTERACTIVE')
# Only the bits that let someone plant or replace a file. NOT Modify or FullControl as masks: those combinations
# also contain the READ bits, so testing against them would flag plain read access.
#   WriteData/CreateFiles 0x2, AppendData/CreateDirectories 0x4, Delete 0x10000, ChangePermissions 0x40000,
#   TakeOwnership 0x80000, and the generic rights GENERIC_ALL 0x10000000 and GENERIC_WRITE 0x40000000
$writeMask = 0x2 -bor 0x4 -bor 0x10000 -bor 0x40000 -bor 0x80000 -bor 0x10000000 -bor 0x40000000

function Get-WeakWriters([string]$Path) {
    try { $acl = Get-Acl -LiteralPath $Path -ErrorAction Stop } catch { return }
    foreach ($ace in $acl.Access) {
        if ($ace.AccessControlType -ne 'Allow') { continue }
        if ($weakPrincipals -notcontains $ace.IdentityReference.Value) { continue }
        # Inherit-only entries apply to the children, not to this object itself
        if ($ace.PropagationFlags -band [System.Security.AccessControl.PropagationFlags]::InheritOnly) { continue }
        if (([int64]$ace.FileSystemRights -band $writeMask) -ne 0) {
            "$($ace.IdentityReference): $($ace.FileSystemRights)"
        }
    }
}

$findings = 0

Write-Host '== 1. Writable directories in the system PATH' -ForegroundColor Cyan
$machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine') -split ';' | Where-Object { $_ } | ForEach-Object { [Environment]::ExpandEnvironmentVariables($_) }
foreach ($dir in $machinePath | Select-Object -Unique) {
    if (-not (Test-Path -LiteralPath $dir)) { Write-Host "  INFO  missing directory in PATH: $dir"; continue }
    $w = @(Get-WeakWriters $dir)
    if ($w.Count) { $findings++; Write-Host "  WARN  $dir  <- $($w -join '; ')" -ForegroundColor Yellow }
}

Write-Host '== 2. Service executables and folders writable by ordinary users' -ForegroundColor Cyan
$services = Get-CimInstance Win32_Service | Where-Object PathName
foreach ($svc in $services) {
    # Extract the executable from PathName: either "quoted path" args, or the first token ending in .exe
    $exe = if ($svc.PathName -match '^"([^"]+)"') { $Matches[1] } elseif ($svc.PathName -match '^(.+?\.exe)') { $Matches[1] } else { $null }
    if (-not $exe -or -not (Test-Path -LiteralPath $exe)) { continue }
    foreach ($target in @($exe, (Split-Path -Parent $exe))) {
        $w = @(Get-WeakWriters $target)
        if ($w.Count) { $findings++; Write-Host "  WARN  $($svc.Name) ($($svc.StartName)): $target  <- $($w -join '; ')" -ForegroundColor Yellow }
    }
}

Write-Host '== 3. Unquoted service paths with spaces' -ForegroundColor Cyan
foreach ($svc in $services) {
    $p = $svc.PathName.Trim()
    if ($p.StartsWith('"')) { continue }
    $exePart = if ($p -match '^(.+?\.exe)') { $Matches[1] } else { $p }
    if ($exePart -match ' ' -and $exePart -notmatch '^[A-Za-z]:\\Windows\\') {
        $findings++
        Write-Host "  WARN  $($svc.Name): $p" -ForegroundColor Yellow
    }
}

Write-Host ''
Write-Host "$findings finding(s). Each one deserves a look: fix permissions with icacls, or quote the service path in its registry ImagePath."
