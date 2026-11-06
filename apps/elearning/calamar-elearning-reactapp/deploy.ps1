# Builds the React client and publishes the ASP.NET Core server into the deployment folder:
#   <Target>\client   the built client (served by the server)
#   <Target>\server   the server binaries
# The data folders (<Target>\local-data and <Target>\remote-data by default) are never touched.
param(
    [string]$Target = "$env:LOCALAPPDATA\Calamar\Apps\Bin\calamar-elearning-reactapp"
)
# Native tools (npm, dotnet) write warnings to stderr, which 'Stop' would turn into failures in Windows PowerShell 5.1;
# their exit codes are checked instead, and the file operations below stop on error explicitly.
$ErrorActionPreference = 'Continue'
$root = $PSScriptRoot

# A running instance locks its binaries: stop it first.
Get-CimInstance Win32_Process -Filter "Name='dotnet.exe' OR Name='Calamar.ELearning.Server.exe'" |
    Where-Object { $_.CommandLine -like "*$Target\server*" } |
    ForEach-Object { Write-Host "Stopping the running server (pid $($_.ProcessId))"; Stop-Process -Id $_.ProcessId -Force }

Write-Host "Building the client..."
Push-Location "$root\client"
try {
    npm ci --no-audit --no-fund
    if ($LASTEXITCODE) { throw "npm ci failed" }
    npm run build
    if ($LASTEXITCODE) { throw "the client build failed" }
} finally { Pop-Location }

Write-Host "Copying the client to $Target\client..."
New-Item -ItemType Directory -Force "$Target\client" | Out-Null
Get-ChildItem "$Target\client" -Force | Remove-Item -Recurse -Force -ErrorAction Stop
Copy-Item "$root\client\dist\*" "$Target\client" -Recurse -ErrorAction Stop

Write-Host "Publishing the server to $Target\server..."
dotnet publish "$root\server\Calamar.ELearning.Server.csproj" -c Release -o "$Target\server" --nologo
if ($LASTEXITCODE) { throw "dotnet publish failed" }

Write-Host ""
Write-Host "Deployed. Start it with:  $Target\server\Calamar.ELearning.Server.exe"
Write-Host "then open https://localhost:5181"
