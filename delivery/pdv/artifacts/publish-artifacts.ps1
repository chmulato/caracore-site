$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

$exe = Join-Path $PSScriptRoot "CaraCorePDV.exe"
if (-not (Test-Path $exe)) {
    throw "Arquivo nao encontrado: $exe"
}

$sha = (Get-FileHash -Path $exe -Algorithm SHA256).Hash
$md5 = (Get-FileHash -Path $exe -Algorithm MD5).Hash

"$sha  CaraCorePDV.exe" | Set-Content -Path (Join-Path $PSScriptRoot "checksum.sha256") -Encoding ASCII
"$md5  CaraCorePDV.exe" | Set-Content -Path (Join-Path $PSScriptRoot "checksum.md5") -Encoding ASCII

Write-Host "Checksums atualizados com sucesso:" -ForegroundColor Green
Write-Host "- checksum.sha256"
Write-Host "- checksum.md5"
