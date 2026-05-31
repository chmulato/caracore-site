# Executa verificacoes estaticas do caracore-site (Etapa 1 + Etapa 2).
# Uso: powershell -File scripts/run-site-validation.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

function Invoke-Step {
    param([string]$Label, [string]$ScriptPath)
    Write-Host ""
    Write-Host ">>> $Label"
    Write-Host ""
    & $ScriptPath
    if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) {
        throw "Falhou: $ScriptPath (exit $LASTEXITCODE)"
    }
}

Invoke-Step "1/5 find-orphan-links.ps1" (Join-Path $PSScriptRoot "find-orphan-links.ps1")
Invoke-Step "2/5 validate_article_images.ps1" (Join-Path $root "tools\validate_article_images.ps1")
Invoke-Step "3/5 validate_integrity_2026.ps1" (Join-Path $root "tools\validate_integrity_2026.ps1")
Invoke-Step "4/5 validate-delivery-stubs.ps1" (Join-Path $PSScriptRoot "validate-delivery-stubs.ps1")
Invoke-Step "5/5 validate-redirects-config.ps1" (Join-Path $PSScriptRoot "validate-redirects-config.ps1")

Write-Host ""
Write-Host "Relatorios em sala/regis/:"
Write-Host "  VALIDACAO_IMAGENS_RETRO_BLOG.txt"
Write-Host "  VALIDACAO_INTEGRIDADE_2026.txt"
Write-Host "  VALIDACAO_DELIVERY_STUBS.txt"
Write-Host "  VALIDACAO_REDIRECTS_CONFIG.txt"
Write-Host ""
Write-Host "Concluido."
