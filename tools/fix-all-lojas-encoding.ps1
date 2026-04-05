# Aplica fix-html-mojibake.ps1 a todos os repositórios caracore-*-releases em DevRoot.
# Uso: powershell -File tools/fix-all-lojas-encoding.ps1 [-DevRoot D:\dev] [-WhatIf]
param(
    [string]$DevRoot = (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)),
    [switch]$WhatIf,
    [switch]$HtmlOnly
)

$ErrorActionPreference = "Stop"
$fix = Join-Path $PSScriptRoot "fix-html-mojibake.ps1"
if (-not (Test-Path -LiteralPath $fix)) {
    Write-Error "Não encontrado: $fix"
    exit 1
}

$stores = Get-ChildItem -LiteralPath $DevRoot -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "caracore-*-releases" } |
    Sort-Object Name

if (-not $stores) {
    Write-Warning "Nenhuma pasta caracore-*-releases em $DevRoot"
    exit 0
}

foreach ($d in $stores) {
    Write-Host "=== $($d.Name) ==="
    $args = @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $fix, "-RootPath", $d.FullName)
    if ($WhatIf) { $args += "-WhatIf" }
    if ($HtmlOnly) { $args += "-HtmlOnly" }
    & powershell @args
}

Write-Host "--- Concluído ($($stores.Count) lojas)."
