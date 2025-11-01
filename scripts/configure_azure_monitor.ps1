#!/usr/bin/env powershell
<#
.SYNOPSIS
    Script de configuração do Azure Monitor + Application Insights

.DESCRIPTION
    Configura monitoramento completo para o backend caracore-backend:
    - Cria Application Insights
    - Conecta ao App Service
    - Configura 6 alertas críticos
    - Cria action group para notificações

.PARAMETER Email
    Email para receber alertas (obrigatório)

.EXAMPLE
    .\configure_azure_monitor.ps1
    .\configure_azure_monitor.ps1 -Email "outro-email@exemplo.com"
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Email = "suporte@caracore.com.br"
)

$ErrorActionPreference = "Stop"

# Configurações
$ResourceGroup = "rg-caracore"
$AppName = "caracore-backend"
$InsightsName = "caracore-backend-insights"
$ActionGroupName = "caracore-alerts"
$Location = "brazilsouth"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Azure Monitor - Setup CaraCore" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Obter Subscription ID
Write-Host "► Obtendo Subscription ID..." -ForegroundColor Yellow
$SubscriptionId = az account show --query "id" --output tsv
Write-Host "  Subscription: $SubscriptionId" -ForegroundColor Green
Write-Host ""

# Passo 1: Verificar/Registrar provider
Write-Host "► Verificando provider Microsoft.OperationalInsights..." -ForegroundColor Yellow
$providerState = az provider show -n Microsoft.OperationalInsights --query "registrationState" --output tsv

if ($providerState -ne "Registered") {
    Write-Host "  Provider não registrado. Registrando..." -ForegroundColor Yellow
    az provider register --namespace Microsoft.OperationalInsights | Out-Null
    
    Write-Host "  Aguardando registro (pode levar 1-2 minutos)..." -ForegroundColor Yellow
    $attempts = 0
    $maxAttempts = 30
    
    while ($attempts -lt $maxAttempts) {
        $providerState = az provider show -n Microsoft.OperationalInsights --query "registrationState" --output tsv
        
        if ($providerState -eq "Registered") {
            Write-Host "  ✓ Provider registrado!" -ForegroundColor Green
            break
        }
        
        Write-Host "  Aguardando... ($attempts/$maxAttempts)" -ForegroundColor Gray
        Start-Sleep -Seconds 10
        $attempts++
    }
    
    if ($attempts -eq $maxAttempts) {
        Write-Host "  ✗ Timeout ao registrar provider. Execute manualmente:" -ForegroundColor Red
        Write-Host "    az provider register --namespace Microsoft.OperationalInsights" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✓ Provider já registrado" -ForegroundColor Green
}
Write-Host ""

# Passo 2: Criar Application Insights
Write-Host "► Criando Application Insights..." -ForegroundColor Yellow

$existingInsights = az monitor app-insights component show `
    --app $InsightsName `
    --resource-group $ResourceGroup `
    2>$null

if ($existingInsights) {
    Write-Host "  ℹ Application Insights já existe, usando existente" -ForegroundColor Cyan
} else {
    az monitor app-insights component create `
        --app $InsightsName `
        --location $Location `
        --resource-group $ResourceGroup `
        --application-type web `
        --retention-time 90 `
        --output none
    
    Write-Host "  ✓ Application Insights criado" -ForegroundColor Green
}
Write-Host ""

# Passo 3: Obter Instrumentation Key
Write-Host "► Obtendo Instrumentation Key..." -ForegroundColor Yellow
$InstrumentationKey = az monitor app-insights component show `
    --app $InsightsName `
    --resource-group $ResourceGroup `
    --query instrumentationKey `
    --output tsv

Write-Host "  Key: $InstrumentationKey" -ForegroundColor Green
Write-Host ""

# Passo 4: Conectar ao App Service
Write-Host "► Conectando Application Insights ao App Service..." -ForegroundColor Yellow
az webapp config appsettings set `
    --name $AppName `
    --resource-group $ResourceGroup `
    --settings `
        APPINSIGHTS_INSTRUMENTATIONKEY=$InstrumentationKey `
        APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=$InstrumentationKey" `
        ApplicationInsightsAgent_EXTENSION_VERSION="~3" `
        XDT_MicrosoftApplicationInsights_Mode="recommended" `
    --output none

Write-Host "  ✓ App Service conectado ao Application Insights" -ForegroundColor Green
Write-Host ""

# Passo 5: Restart do App Service
Write-Host "► Reiniciando App Service para aplicar mudanças..." -ForegroundColor Yellow
az webapp restart --name $AppName --resource-group $ResourceGroup --output none
Write-Host "  ✓ App Service reiniciado" -ForegroundColor Green
Write-Host ""

# Passo 6: Criar Action Group
Write-Host "► Criando Action Group para notificações..." -ForegroundColor Yellow

$existingActionGroup = az monitor action-group show `
    --name $ActionGroupName `
    --resource-group $ResourceGroup `
    2>$null

if ($existingActionGroup) {
    Write-Host "  ℹ Action Group já existe, atualizando email" -ForegroundColor Cyan
    az monitor action-group update `
        --name $ActionGroupName `
        --resource-group $ResourceGroup `
        --add-action email admin $Email `
        --output none
} else {
    az monitor action-group create `
        --name $ActionGroupName `
        --resource-group $ResourceGroup `
        --short-name caracore `
        --action email admin $Email `
        --output none
    
    Write-Host "  ✓ Action Group criado" -ForegroundColor Green
}
Write-Host "  Email de notificação: $Email" -ForegroundColor Green
Write-Host ""

# Passo 7: Configurar Alertas
Write-Host "► Configurando alertas..." -ForegroundColor Yellow

$ResourceId = "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Web/sites/$AppName"

# Array de alertas
$alerts = @(
    @{
        Name = "Backend-Indisponivel"
        Description = "Backend não está respondendo com HTTP 2xx"
        Condition = "avg Http2xx < 1"
        Severity = 0
    },
    @{
        Name = "Taxa-Erro-Elevada"
        Description = "Mais de 5 erros HTTP 5xx em 5 minutos"
        Condition = "avg Http5xx > 5"
        Severity = 2
    },
    @{
        Name = "Tempo-Resposta-Alto"
        Description = "Tempo de resposta acima de 5 segundos"
        Condition = "avg ResponseTime > 5"
        Severity = 3
    },
    @{
        Name = "CPU-Elevada"
        Description = "CPU acima de 80% por mais de 5 minutos"
        Condition = "avg CpuPercentage > 80"
        Severity = 2
    },
    @{
        Name = "Memoria-Elevada"
        Description = "Memória acima de 80% por mais de 5 minutos"
        Condition = "avg MemoryPercentage > 80"
        Severity = 2
    },
    @{
        Name = "Disco-Cheio"
        Description = "Uso de disco acima de 8GB (80% do limite de 10GB)"
        Condition = "avg FileSystemUsage > 8000000000"
        Severity = 1
    }
)

$createdCount = 0
$skippedCount = 0

foreach ($alert in $alerts) {
    $existingAlert = az monitor metrics alert show `
        --name $alert.Name `
        --resource-group $ResourceGroup `
        2>$null
    
    if ($existingAlert) {
        Write-Host "  ⊙ $($alert.Name) (já existe)" -ForegroundColor Gray
        $skippedCount++
    } else {
        az monitor metrics alert create `
            --name $alert.Name `
            --resource-group $ResourceGroup `
            --scopes $ResourceId `
            --condition $alert.Condition `
            --window-size 5m `
            --evaluation-frequency 1m `
            --action $ActionGroupName `
            --description $alert.Description `
            --severity $alert.Severity `
            --output none
        
        Write-Host "  ✓ $($alert.Name) (Severidade $($alert.Severity))" -ForegroundColor Green
        $createdCount++
    }
}

Write-Host ""
Write-Host "  Alertas criados: $createdCount" -ForegroundColor Green
Write-Host "  Alertas existentes: $skippedCount" -ForegroundColor Cyan
Write-Host ""

# Resumo Final
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ✓ Configuração Concluída!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Recursos Criados:" -ForegroundColor Cyan
Write-Host "  • Application Insights: $InsightsName" -ForegroundColor White
Write-Host "  • Action Group: $ActionGroupName" -ForegroundColor White
Write-Host "  • Alertas: 6 configurados" -ForegroundColor White
Write-Host "  • Email: $Email" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Próximos Passos:" -ForegroundColor Cyan
Write-Host "  1. Aguardar 2-3 minutos para dados aparecerem" -ForegroundColor White
Write-Host "  2. Acessar: https://portal.azure.com" -ForegroundColor White
Write-Host "  3. Buscar: $InsightsName" -ForegroundColor White
Write-Host "  4. Ver métricas e logs em tempo real" -ForegroundColor White
Write-Host ""
Write-Host "📧 Notificações:" -ForegroundColor Cyan
Write-Host "  • Você receberá email quando alertas dispararem" -ForegroundColor White
Write-Host "  • Verifique sua caixa de entrada (e spam!)" -ForegroundColor White
Write-Host ""
Write-Host "💰 Custo: $0.00/mês (dentro do free tier)" -ForegroundColor Green
Write-Host ""
