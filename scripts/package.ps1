$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectRoot
try {
    node --test
    if ($LASTEXITCODE -ne 0) { throw 'Tests failed; package was not created.' }
    $manifest = Get-Content -LiteralPath 'extension/manifest.json' -Raw | ConvertFrom-Json
    New-Item -ItemType Directory -Path 'dist' -Force | Out-Null
    $archivePath = Join-Path $projectRoot ('dist/tab-position-' + $manifest.version + '.zip')
    Compress-Archive -Path 'extension/*' -DestinationPath $archivePath -Force
    Write-Output $archivePath
} finally {
    Pop-Location
}
