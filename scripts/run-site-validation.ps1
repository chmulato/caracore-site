# Executa todas as verificações estáticas do caracore-site (links, imagens, integridade 2026).
# Uso: powershell -File scripts/run-site-validation.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

Write-Host ""
Write-Host ">>> 1/3 find-orphan-links.ps1 (href, src, srcset, poster, og/twitter:image)"
Write-Host ""
& (Join-Path $PSScriptRoot "find-orphan-links.ps1")
if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) { exit $LASTEXITCODE }

Write-Host ""
Write-Host ">>> 2/3 tools/validate_article_images.ps1"
Write-Host ""
& (Join-Path $root "tools\validate_article_images.ps1")

Write-Host ""
Write-Host ">>> 3/3 tools/validate_integrity_2026.ps1"
Write-Host ""
& (Join-Path $root "tools\validate_integrity_2026.ps1")

Write-Host ""
Write-Host "Relatorios em sala/regis/: VALIDACAO_IMAGENS_RETRO_BLOG.txt, VALIDACAO_INTEGRIDADE_2026.txt"
Write-Host "Concluido."
