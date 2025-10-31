# Script para configurar TODAS as variáveis de ambiente no Azure App Service
# Baseado no arquivo backend/.env.example
# Uso: .\configure_azure_all_settings.ps1

$appName = "caracore-backend"
$resourceGroup = "rg-caracore"

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Configuracao COMPLETA - Azure App Service" -ForegroundColor Cyan
Write-Host "App Service: $appName" -ForegroundColor Cyan
Write-Host "Resource Group: $resourceGroup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Lê as configurações do arquivo secrets.txt
$secretsFile = Join-Path $PSScriptRoot "..\secrets.txt"

if (-not (Test-Path $secretsFile)) {
    Write-Host "ERRO: Arquivo secrets.txt nao encontrado!" -ForegroundColor Red
    Write-Host "Crie o arquivo secrets.txt na raiz do projeto com os valores necessarios." -ForegroundColor Yellow
    Write-Host "Use backend/.env.example como referencia." -ForegroundColor Yellow
    exit 1
}

Write-Host "Lendo configuracoes de: $secretsFile" -ForegroundColor Cyan
$publicSettings = @{}

Get-Content $secretsFile | ForEach-Object {
    if ($_ -match '^([A-Z_]+)=(.+)$' -and -not $_.StartsWith('#')) {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $publicSettings[$key] = $value
    }
}

Write-Host "Configuracoes publicas a serem aplicadas:" -ForegroundColor Green
foreach ($key in $publicSettings.Keys) {
    Write-Host "  $key = $($publicSettings[$key])" -ForegroundColor White
}
Write-Host ""

$confirm = Read-Host "Confirma a configuracao? (S/n)"
if ($confirm -ne "" -and $confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Configuracao cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Configurando variaveis no Azure..." -ForegroundColor Yellow

# Construir o comando
$settingsArgs = @()
foreach ($key in $publicSettings.Keys) {
    $value = $publicSettings[$key]
    $settingsArgs += "$key=`"$value`""
}

$settingsString = $settingsArgs -join ' '
Write-Host "Executando: az webapp config appsettings set..." -ForegroundColor Cyan

$command = "az webapp config appsettings set --name $appName --resource-group $resourceGroup --settings $settingsString"
$result = Invoke-Expression $command | ConvertFrom-Json

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=======================================" -ForegroundColor Green
    Write-Host "Variaveis configuradas com sucesso!" -ForegroundColor Green
    Write-Host "=======================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
    Write-Host "1. Deploy do codigo com fix de CORS" -ForegroundColor White
    Write-Host "2. Configurar secrets (APP_SECRET_KEY, etc)" -ForegroundColor White
    Write-Host "3. Reiniciar App Service" -ForegroundColor White
    Write-Host "4. Testar dashboard" -ForegroundColor White
} else {
    Write-Host "Erro ao configurar variaveis!" -ForegroundColor Red
}
