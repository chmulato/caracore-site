# Script PowerShell para verificar se o armazenamento persistente está funcionando
# Uso: .\scripts\verify_persistent_storage.ps1

$ErrorActionPreference = "Stop"

$RESOURCE_GROUP = "rg-caracore"
$WEB_APP_NAME = "caracore-backend-docker"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Verificação de Armazenamento Persistente" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Azure CLI está instalado
try {
    $null = az --version 2>&1
} catch {
    Write-Host "[ERRO] Azure CLI não está instalado" -ForegroundColor Red
    exit 1
}

# Verificar configuração de montagem
Write-Host "[1] Verificando configuração de montagem..." -ForegroundColor Yellow
try {
    $mounts = az webapp config storage-account list `
        --resource-group $RESOURCE_GROUP `
        --name $WEB_APP_NAME `
        --output json | ConvertFrom-Json
    
    $dataMount = $mounts | Where-Object { $_.mountPath -eq "/home/data" }
    
    if ($dataMount) {
        Write-Host "[OK] Montagem /home/data configurada" -ForegroundColor Green
        $dataMount | Format-List
    } else {
        Write-Host "[ERRO] Montagem /home/data não encontrada" -ForegroundColor Red
        Write-Host "Execute: .\scripts\configure_azure_files.ps1" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "[ERRO] Falha ao verificar montagem: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Verificar logs do Web App
Write-Host "[2] Verificando logs recentes..." -ForegroundColor Yellow
Write-Host "Buscando mensagem: 'Detectado ambiente Azure - usando /home/data'"
Write-Host ""

try {
    # Tentar obter logs (pode falhar se não houver logs disponíveis)
    $logs = az webapp log tail `
        --resource-group $RESOURCE_GROUP `
        --name $WEB_APP_NAME `
        --output tsv 2>&1 | Select-Object -First 100
    
    if ($logs -match "Detectado ambiente Azure - usando /home/data") {
        Write-Host "[OK] Logs confirmam uso de /home/data" -ForegroundColor Green
        $logs | Select-String -Pattern "home/data" | Select-Object -First 5
    } else {
        Write-Host "[AVISO] Mensagem não encontrada nos logs recentes" -ForegroundColor Yellow
        Write-Host "Isso pode significar:"
        Write-Host "  - O Web App ainda não foi reiniciado após a configuração"
        Write-Host "  - Os logs ainda não foram atualizados"
        Write-Host ""
        Write-Host "Verifique manualmente:"
        Write-Host "  az webapp log tail --resource-group $RESOURCE_GROUP --name $WEB_APP_NAME"
    }
} catch {
    Write-Host "[AVISO] Não foi possível obter logs: $_" -ForegroundColor Yellow
    Write-Host "Verifique manualmente no Azure Portal" -ForegroundColor Yellow
}
Write-Host ""

# Verificar via SSH (se disponível)
Write-Host "[3] Verificando via SSH (opcional)..." -ForegroundColor Yellow
Write-Host "Para verificar manualmente via SSH:"
Write-Host "  1. Azure Portal > App Services > $WEB_APP_NAME > SSH"
Write-Host "  2. Execute: ls -la /home/data/"
Write-Host "  3. Execute: cat /home/data/authorized_users.json"
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "Verificação concluída" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

