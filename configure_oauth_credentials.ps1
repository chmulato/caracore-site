# Script PowerShell para configurar variáveis de ambiente OAuth no Azure Web App
# Este script solicita as credenciais de forma interativa e não as armazena no código

Write-Host "=== Configuração de Credenciais OAuth para CaraCore Backend ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "ATENÇÃO: Este script configurará credenciais sensíveis no Azure." -ForegroundColor Yellow
Write-Host "Certifique-se de ter as credenciais OAuth corretas antes de continuar." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Deseja continuar? (s/N)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "Operação cancelada." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "=== Configuração Google OAuth ===" -ForegroundColor Green
$GOOGLE_CLIENT_ID = Read-Host "Google Client ID"
$GOOGLE_CLIENT_SECRET = Read-Host "Google Client Secret" -AsSecureString
$GOOGLE_CLIENT_SECRET_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($GOOGLE_CLIENT_SECRET))

Write-Host ""
Write-Host "=== Configuração Microsoft Entra ID ===" -ForegroundColor Green
$AZURE_CLIENT_ID = Read-Host "Azure Client ID"
$AZURE_CLIENT_SECRET = Read-Host "Azure Client Secret" -AsSecureString
$AZURE_CLIENT_SECRET_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($AZURE_CLIENT_SECRET))
$AZURE_TENANT_ID = Read-Host "Azure Tenant ID"

Write-Host ""
Write-Host "=== Aplicando configurações no Azure Web App ===" -ForegroundColor Cyan

# Configurar Google OAuth
Write-Host "Configurando Google OAuth..." -ForegroundColor Yellow
try {
    az webapp config appsettings set `
      --resource-group rg-caracore `
      --name caracore-backend-docker `
      --settings `
        GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" `
        GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET_PLAIN" `
      --output none

    Write-Host "✅ Google OAuth configurado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao configurar Google OAuth: $_" -ForegroundColor Red
    exit 1
}

# Configurar Microsoft Entra ID
Write-Host "Configurando Microsoft Entra ID..." -ForegroundColor Yellow
try {
    az webapp config appsettings set `
      --resource-group rg-caracore `
      --name caracore-backend-docker `
      --settings `
        AZURE_CLIENT_ID="$AZURE_CLIENT_ID" `
        AZURE_CLIENT_SECRET="$AZURE_CLIENT_SECRET_PLAIN" `
        AZURE_TENANT_ID="$AZURE_TENANT_ID" `
      --output none

    Write-Host "✅ Microsoft Entra ID configurado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao configurar Microsoft Entra ID: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Configuração Concluída ===" -ForegroundColor Cyan
Write-Host "✅ Todas as credenciais OAuth foram configuradas no Azure Web App" -ForegroundColor Green
Write-Host "🔒 As credenciais estão seguras nas variáveis de ambiente do Azure" -ForegroundColor Green
Write-Host ""
Write-Host "Para testar a aplicação:" -ForegroundColor White
Write-Host "Invoke-WebRequest -Uri https://caracore-backend-docker.azurewebsites.net/health" -ForegroundColor Gray
Write-Host ""
Write-Host "Endpoint da aplicação: https://caracore-backend-docker.azurewebsites.net" -ForegroundColor White

# Limpar variáveis por segurança
$GOOGLE_CLIENT_ID = $null
$GOOGLE_CLIENT_SECRET = $null
$GOOGLE_CLIENT_SECRET_PLAIN = $null
$AZURE_CLIENT_ID = $null
$AZURE_CLIENT_SECRET = $null
$AZURE_CLIENT_SECRET_PLAIN = $null
$AZURE_TENANT_ID = $null

Write-Host ""
Write-Host "🔐 Variáveis locais limpas por segurança." -ForegroundColor Green