# Configuração Azure Monitor + Application Insights

**Backend:** caracore-backend  
**Resource Group:** rg-caracore  
**Data:** 01/11/2025

---

## 📊 Visão Geral

Este documento descreve a configuração de monitoramento e alertas para o backend CaraCore usando Azure Monitor e Application Insights.

### Objetivos

- ✅ Monitorar disponibilidade do backend (uptime)
- ✅ Alertar sobre erros e falhas
- ✅ Monitorar performance (tempo de resposta)
- ✅ Monitorar uso de recursos (CPU, memória, disco)
- ✅ Notificações por email em eventos críticos

---

## 🚀 Configuração Rápida

### Passo 1: Criar Application Insights

```powershell
# 1. Criar recurso Application Insights
az monitor app-insights component create `
  --app caracore-backend-insights `
  --location brazilsouth `
  --resource-group rg-caracore `
  --application-type web `
  --retention-time 90

# 2. Obter Instrumentation Key
$instrumentationKey = az monitor app-insights component show `
  --app caracore-backend-insights `
  --resource-group rg-caracore `
  --query instrumentationKey `
  --output tsv

Write-Host "Instrumentation Key: $instrumentationKey"
```

### Passo 2: Conectar ao App Service

```powershell
# Configurar Application Insights no App Service
az webapp config appsettings set `
  --name caracore-backend `
  --resource-group rg-caracore `
  --settings `
    APPINSIGHTS_INSTRUMENTATIONKEY=$instrumentationKey `
    APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=$instrumentationKey" `
    ApplicationInsightsAgent_EXTENSION_VERSION="~3" `
    XDT_MicrosoftApplicationInsights_Mode="recommended"
```

### Passo 3: Restart do App Service

```powershell
# Restart para aplicar mudanças
az webapp restart --name caracore-backend --resource-group rg-caracore
```

---

## 🔔 Configuração de Alertas

### Criar Action Group (Notificações por Email)

```powershell
# Criar action group para notificações
az monitor action-group create `
  --name caracore-alerts `
  --resource-group rg-caracore `
  --short-name caracore `
  --action email admin seu-email@exemplo.com
```

### Alerta 1: Backend Indisponível (Disponibilidade < 95%)

```powershell
az monitor metrics alert create `
  --name "Backend Indisponível" `
  --resource-group rg-caracore `
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend `
  --condition "avg Http2xx < 1" `
  --window-size 5m `
  --evaluation-frequency 1m `
  --action caracore-alerts `
  --description "Backend não está respondendo com HTTP 2xx" `
  --severity 0
```

### Alerta 2: Taxa de Erro Elevada (> 5%)

```powershell
az monitor metrics alert create `
  --name "Taxa de Erro Elevada" `
  --resource-group rg-caracore `
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend `
  --condition "avg Http5xx > 5" `
  --window-size 5m `
  --evaluation-frequency 1m `
  --action caracore-alerts `
  --description "Mais de 5 erros HTTP 5xx em 5 minutos" `
  --severity 2
```

### Alerta 3: Tempo de Resposta Alto (> 5 segundos)

```powershell
az monitor metrics alert create `
  --name "Tempo de Resposta Alto" `
  --resource-group rg-caracore `
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend `
  --condition "avg ResponseTime > 5" `
  --window-size 5m `
  --evaluation-frequency 1m `
  --action caracore-alerts `
  --description "Tempo de resposta acima de 5 segundos" `
  --severity 3
```

### Alerta 4: CPU Elevada (> 80%)

```powershell
az monitor metrics alert create `
  --name "CPU Elevada" `
  --resource-group rg-caracore `
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend `
  --condition "avg CpuPercentage > 80" `
  --window-size 5m `
  --evaluation-frequency 1m `
  --action caracore-alerts `
  --description "CPU acima de 80% por mais de 5 minutos" `
  --severity 2
```

### Alerta 5: Memória Elevada (> 80%)

```powershell
az monitor metrics alert create `
  --name "Memória Elevada" `
  --resource-group rg-caracore `
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend `
  --condition "avg MemoryPercentage > 80" `
  --window-size 5m `
  --evaluation-frequency 1m `
  --action caracore-alerts `
  --description "Memória acima de 80% por mais de 5 minutos" `
  --severity 2
```

### Alerta 6: Disco Cheio (> 80% dos 10GB)

```powershell
az monitor metrics alert create `
  --name "Disco Cheio" `
  --resource-group rg-caracore `
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend `
  --condition "avg FileSystemUsage > 8000000000" `
  --window-size 5m `
  --evaluation-frequency 1m `
  --action caracore-alerts `
  --description "Uso de disco acima de 8GB (80% do limite de 10GB)" `
  --severity 1
```

---

## 📊 Métricas Disponíveis

### Métricas do App Service

| Métrica | Descrição | Limite Recomendado |
|---------|-----------|-------------------|
| `Http2xx` | Respostas HTTP 2xx (sucesso) | > 95% das requests |
| `Http4xx` | Respostas HTTP 4xx (erro cliente) | < 5% |
| `Http5xx` | Respostas HTTP 5xx (erro servidor) | < 1% |
| `ResponseTime` | Tempo médio de resposta | < 500ms (normal), < 5s (aceitável) |
| `Requests` | Total de requisições | - |
| `CpuPercentage` | Uso de CPU | < 70% (normal), > 80% (alerta) |
| `MemoryPercentage` | Uso de memória | < 70% (normal), > 80% (alerta) |
| `FileSystemUsage` | Uso de disco | < 7GB (normal), > 8GB (alerta) |

### Métricas do Application Insights

| Métrica | Descrição |
|---------|-----------|
| `availabilityResults/availabilityPercentage` | Disponibilidade do serviço |
| `requests/duration` | Duração de requisições |
| `requests/failed` | Requisições falhadas |
| `exceptions/count` | Exceções não tratadas |
| `performanceCounters/processCpuPercentage` | CPU do processo |
| `performanceCounters/processPrivateBytes` | Memória privada |

---

## 🔍 Verificação da Configuração

### Testar Application Insights

```powershell
# 1. Fazer algumas requisições ao backend
curl https://caracore-backend.azurewebsites.net/health
curl https://caracore-backend.azurewebsites.net/health/detailed

# 2. Aguardar 2-3 minutos para dados aparecerem

# 3. Verificar dados no portal
# Azure Portal > Application Insights > caracore-backend-insights > Logs
```

### Query KQL para Testar

```kql
// Últimas 100 requisições
requests
| where timestamp > ago(1h)
| project timestamp, name, resultCode, duration, url
| order by timestamp desc
| limit 100

// Taxa de erro
requests
| where timestamp > ago(1h)
| summarize 
    Total = count(),
    Sucessos = countif(resultCode < 400),
    Erros = countif(resultCode >= 400)
| extend TaxaErro = (Erros * 100.0) / Total

// Tempo médio de resposta
requests
| where timestamp > ago(1h)
| summarize TempoMedio = avg(duration), P95 = percentile(duration, 95)
```

### Testar Alertas

```powershell
# Listar alertas configurados
az monitor metrics alert list `
  --resource-group rg-caracore `
  --output table

# Verificar action groups
az monitor action-group list `
  --resource-group rg-caracore `
  --output table
```

---

## 📈 Dashboards Recomendados

### Dashboard Básico (Portal Azure)

1. Acessar: Azure Portal > Dashboards > + New dashboard
2. Adicionar tiles:
   - **Availability** (Application Insights)
   - **Response Time** (App Service)
   - **Requests** (App Service)
   - **CPU %** (App Service)
   - **Memory %** (App Service)
   - **Disk Usage** (App Service)

### Queries Úteis para Dashboards

```kql
// Health Check Status (últimas 24h)
requests
| where name contains "health"
| where timestamp > ago(24h)
| summarize count() by bin(timestamp, 1h), resultCode
| render timechart

// Endpoints mais usados
requests
| where timestamp > ago(24h)
| summarize count() by name
| order by count_ desc
| render piechart

// Distribuição de tempo de resposta
requests
| where timestamp > ago(24h)
| summarize percentiles(duration, 50, 75, 90, 95, 99)
| render barchart
```

---

## 🎯 Níveis de Severidade dos Alertas

| Severity | Descrição | Ação Requerida | Exemplos |
|----------|-----------|----------------|----------|
| **0 - Critical** | Sistema completamente fora do ar | Ação imediata 24/7 | Backend indisponível |
| **1 - Error** | Funcionalidade crítica comprometida | Ação em 1 hora | Disco > 80%, erro 5xx |
| **2 - Warning** | Degradação de performance | Ação em 4 horas | CPU/memória > 80% |
| **3 - Informational** | Informação importante | Monitorar | Response time elevado |

---

## 🔧 Troubleshooting

### Application Insights não está coletando dados

**Verificar:**

1. Instrumentation Key configurada corretamente
2. App Service foi reiniciado após configuração
3. Extension version está definida (`~3`)
4. Aguardar 2-3 minutos para dados aparecerem

**Solução:**

```powershell
# Verificar settings
az webapp config appsettings list `
  --name caracore-backend `
  --resource-group rg-caracore `
  --query "[?name=='APPINSIGHTS_INSTRUMENTATIONKEY']"

# Reconfigurar se necessário
az webapp restart --name caracore-backend --resource-group rg-caracore
```

### Alertas não estão disparando

**Verificar:**

1. Action group tem email configurado corretamente
2. Métricas estão sendo coletadas (ver no portal)
3. Threshold dos alertas está correto
4. Email não foi para spam

**Solução:**

```powershell
# Testar action group manualmente
az monitor action-group test-notifications create `
  --action-group caracore-alerts `
  --resource-group rg-caracore `
  --notification-type Email
```

---

## 💰 Custos Estimados

| Serviço | Volume | Custo Mensal (USD) |
|---------|--------|-------------------|
| Application Insights | < 5GB/mês | $0-5 (primeiros 5GB grátis) |
| Alert Rules | 6 alertas | $0.10 x 6 = $0.60 |
| Action Groups | 1000 emails/mês | Grátis |
| **TOTAL** | | **~$0.60/mês** |

**Nota:** Custos muito baixos para o projeto, com grande benefício em visibilidade e confiabilidade.

---

## 📝 Checklist de Configuração

- [ ] Application Insights criado
- [ ] Instrumentation Key obtida
- [ ] App Service conectado ao App Insights
- [ ] App Service reiniciado
- [ ] Action Group criado com email
- [ ] 6 alertas configurados:
  - [ ] Backend Indisponível (Sev 0)
  - [ ] Taxa de Erro Elevada (Sev 2)
  - [ ] Tempo de Resposta Alto (Sev 3)
  - [ ] CPU Elevada (Sev 2)
  - [ ] Memória Elevada (Sev 2)
  - [ ] Disco Cheio (Sev 1)
- [ ] Dados aparecendo no portal (aguardar 2-3 min)
- [ ] Alerta de teste disparado com sucesso
- [ ] Email de teste recebido

---

## 📚 Referências

- [Application Insights Overview](https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [App Service Metrics](https://learn.microsoft.com/azure/app-service/web-sites-monitor)
- [Azure Monitor Alerts](https://learn.microsoft.com/azure/azure-monitor/alerts/alerts-overview)
- [KQL Query Language](https://learn.microsoft.com/azure/data-explorer/kusto/query/)

---

**Última Atualização:** 01/11/2025  
**Autor:** Carlos H. Mulato
