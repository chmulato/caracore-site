# Script PowerShell para copiar favicon.ico para a raiz do projeto
# Necessário para GitHub Pages que não suporta redirecionamentos de servidor

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$FaviconSource = Join-Path $ProjectRoot "images\favicon.ico"
$FaviconDest = Join-Path $ProjectRoot "favicon.ico"

if (-not (Test-Path $FaviconSource)) {
    Write-Host "❌ Erro: favicon.ico não encontrado em $FaviconSource" -ForegroundColor Red
    exit 1
}

# Copiar favicon para a raiz
Copy-Item -Path $FaviconSource -Destination $FaviconDest -Force

if (Test-Path $FaviconDest) {
    Write-Host "✅ Favicon copiado com sucesso para $FaviconDest" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao copiar favicon" -ForegroundColor Red
    exit 1
}

