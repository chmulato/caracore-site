# Guia de Deploy - Azure App Service

**Backend Python/Flask da Área 51**  
**Versão:** 2.0.0  
**Última Atualização:** 01/11/2025

---

## 📋 Visão Geral

Este documento descreve o processo completo de deploy do backend Python/Flask no Azure App Service, incluindo configurações, troubleshooting e rollback.

### Informações do Ambiente

**Produção:**

- **Nome:** `caracore-backend`
- **URL:** https://caracore-backend.azurewebsites.net
- **Resource Group:** `rg-caracore`
- **Plan:** `caracore-plan` (Basic B1)
- **Runtime:** Python 3.11 (Linux Container)
- **Region:** Brazil South

**Arquitetura:**

- **2 Ambientes:** Local (desenvolvimento) e Produção (Azure)
- **Sem Staging:** Deploy direto para produção com backups automáticos
- **Scripts Automatizados:** Python para deploy e rollback

---

## 🚀 Pré-requisitos

### Ferramentas Necessárias

1. **Azure CLI** (versão 2.50+)

   ```powershell
   az --version
   # Se não instalado: winget install Microsoft.AzureCLI
   ```

2. **Python 3.11.14**

   ```powershell
   python --version
   # Deve retornar: Python 3.11.14
   ```

3. **Git** (para controle de versão)

   ```powershell
   git --version
   ```

### Login no Azure

```powershell
# Fazer login
az login

# Verificar conta ativa
az account show

# Selecionar subscription (se necessário)
az account set --subscription "SUBSCRIPTION_ID"
```

---

## 📦 Estrutura do Backend

```text
backend/
├── app.py                  # Aplicação principal Flask
├── requirements.txt        # Dependências Python
├── .azure/
│   └── config             # Configuração Azure CLI
├── logs/                  # Logs JSONL (gitignored)
└── oryx-build-commands.txt # Comandos de build Azure
```

### Dependências (requirements.txt)

```txt
Flask==3.0.3
Authlib==1.3.1
requests==2.32.3
gunicorn==23.0.0
python-dotenv==1.0.1
```

---

## 🔧 Variáveis de Ambiente (Secrets)

As seguintes variáveis **devem estar configuradas** no Azure App Service:

### OAuth Google

```bash
GOOGLE_CLIENT_ID="1023942712021-xxxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxx"
```

### OAuth Microsoft

```bash
MICROSOFT_CLIENT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
MICROSOFT_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
MICROSOFT_TENANT_ID="189c46ad-e437-48bd-bc87-050ef735c2c7"
```

### Configurações Gerais

```bash
FLASK_ENV="production"
ALLOWED_ORIGINS="https://www.caracore.com.br"
```

### Como Configurar no Azure

**Via Portal:**

1. Acessar Azure Portal > App Services > caracore-backend
2. Settings > Configuration > Application Settings
3. Clicar em "+ New application setting"
4. Adicionar cada variável

**Via CLI (Manual):**

```powershell
az webapp config appsettings set `
  --name caracore-backend `
  --resource-group rg-caracore `
  --settings GOOGLE_CLIENT_ID="valor" GOOGLE_CLIENT_SECRET="valor"
```

**Via Script Automatizado (Recomendado):**

Para configurar **todas as 25 variáveis** de uma vez, use o script PowerShell:

```powershell
# 1. Criar arquivo secrets.txt (git-ignored) com todas as variáveis
# Exemplo: secrets.txt
GOOGLE_CLIENT_ID=1023942712021-xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_SECRET=xxxxx
AZURE_TENANT_ID=189c46ad-e437-48bd-bc87-050ef735c2c7
ORIGIN_ALLOWED=https://www.caracore.com.br
OAUTH_REDIRECT_URI=https://www.caracore.com.br/secure/callback.html
APP_SECRET_KEY=xxxxx
WEBSITES_PORT=8000
# ... mais 16 variáveis

# 2. Executar script de configuração
cd d:\dev\site\cara-core
.\scripts\configure_azure_all_settings.ps1

# 3. Verificar se todas foram configuradas
az webapp config appsettings list --name caracore-backend --resource-group rg-caracore --output table
```

**⚠️ IMPORTANTE:**
- `secrets.txt` está no `.gitignore` para não expor credenciais
- Use o template `secrets.txt.template` como referência
- Script lê linha por linha e configura cada variável automaticamente
- Total de ~25 variáveis configuradas em <2 minutos

---

## 🚀 Deploy para Produção

### Método 1: Script Automatizado (Recomendado) ✨ NOVO

O deploy agora é feito através de script Python automatizado com verificações de segurança.

```powershell
# Deploy completo com todas as verificações
cd d:\dev\site\cara-core
python scripts/deploy_production.py

# Deploy pulando testes (mais rápido)
python scripts/deploy_production.py --skip-tests

# Deploy forçado (ignora avisos de branch/uncommitted)
python scripts/deploy_production.py --force
```

**O que o script faz:**
- ✅ Verifica Azure CLI instalado e autenticado
- ✅ Valida branch Git (avisa se não for main)
- ✅ Detecta mudanças não commitadas
- ✅ Executa testes pytest (opcional)
- ✅ Cria backup automático (backups/backup_TIMESTAMP.zip)
- ✅ Cria pacote ZIP excluindo __pycache__, logs, .env
- ✅ Deploy via `az webapp deployment source config-zip`
- ✅ Health check (aguarda 30s + testa /health)
- ✅ Teste de autenticação (/api/admin/logs deve retornar 401)
- ✅ Cleanup de arquivos temporários
- ✅ Log estruturado em JSON (backend/logs/deploys.jsonl)

**Tempo estimado:** 2-3 minutos (inclui warm-up)

### Método 2: Azure CLI (Manual)

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend to Azure

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'caracore-backend'
          package: './backend'
```

---

## ✅ Verificação Pós-Deploy

### 1. Health Check

```powershell
# Testar endpoint de saúde
curl https://caracore-backend.azurewebsites.net/health

# Resposta esperada:
# {"status": "ok", "timestamp": "2025-10-31T12:00:00Z"}
```

### 2. Testes Automatizados

```powershell
# Executar script de testes
cd d:\dev\site\cara-core\scripts
python teste_backend_azure.py

# Deve passar 6/6 testes:
# ✓ Health Check (200 OK)
# ✓ CORS Headers
# ✓ Security Headers (4/4)
# ✓ OAuth Google Endpoint
# ✓ OAuth Microsoft Endpoint
# ✓ Rate Limiting
```

### 3. Verificar Logs

```powershell
# Streaming de logs em tempo real
az webapp log tail --name caracore-backend --resource-group rg-caracore

# Ou via portal:
# Azure Portal > App Services > caracore-backend > Monitoring > Log stream
```

---

## 🔄 Processo de Rollback

### Script Automatizado de Rollback ✨ NOVO

O rollback agora é feito através de script Python com confirmação obrigatória.

**Listar backups disponíveis:**

```powershell
cd d:\dev\site\cara-core
python scripts/rollback.py --list
```

**Reverter para último backup:**

```powershell
python scripts/rollback.py --latest
# Digite "ROLLBACK" para confirmar
```

**Reverter para backup específico:**

```powershell
python scripts/rollback.py --backup backup_20251101_153045.zip
# Digite "ROLLBACK" para confirmar
```

**Reverter para commit Git específico:**

```powershell
python scripts/rollback.py --commit abc1234
# Digite "ROLLBACK" para confirmar
# Cria branch temporária, faz deploy, volta para branch original
```

**O que o script faz:**
- ✅ Lista backups disponíveis (data/hora, arquivo)
- ✅ Mostra últimos 10 deploys do log
- ✅ Confirmação obrigatória (digitar "ROLLBACK")
- ✅ Cria backup de segurança antes de reverter (pre_rollback_*.zip)
- ✅ Deploy do backup via config-zip
- ✅ Health check pós-rollback (30s warm-up + teste)
- ✅ Validação de existência de backup/commit

**Tempo estimado:** 2-3 minutos

### Rollback Manual (Backup via ZIP)

# 3. Re-deploy
cd backend
az webapp up --name caracore-backend --runtime PYTHON:3.11

# 4. Voltar para branch principal
git checkout fase-01  # ou main
```

### Opção 3: Restore via Portal

1. Azure Portal > App Services > caracore-backend
2. Deployment > Deployment Center
3. Selecionar versão anterior da lista
4. Clicar em "Redeploy"

---

## 🐛 Troubleshooting

### Erro: "ModuleNotFoundError"

**Problema:** Dependência faltando em `requirements.txt`

**Solução:**

```powershell
# 1. Adicionar dependência em requirements.txt
# 2. Re-deploy
cd backend
az webapp up --name caracore-backend --runtime PYTHON:3.11
```

### Erro: "Application Timeout" ou Backend Não Responde

**Problema:** Gunicorn timeout muito curto OU Azure não consegue rotear requisições

**⚠️ IMPORTANTE:** Azure App Service Python **requer** configuração específica de porta:

**Solução 1: Configurar WEBSITES_PORT**

```powershell
# OBRIGATÓRIO: Definir porta que Azure vai usar
az webapp config appsettings set `
  --name caracore-backend `
  --resource-group rg-caracore `
  --settings WEBSITES_PORT=8000
```

**Solução 2: Configurar Startup Command com $PORT dinâmico**

```powershell
# ❌ ERRADO (porta hardcoded)
--startup-file "gunicorn --bind=0.0.0.0:8000 --timeout 600 app:app"

# ✅ CORRETO (usa variável $PORT do Azure)
az webapp config set `
  --name caracore-backend `
  --resource-group rg-caracore `
  --startup-file "gunicorn --bind=0.0.0.0:`$PORT --timeout 600 app:app"
```

**Por que isso é necessário:**
- Azure App Service injeta a variável `$PORT` no runtime container
- `WEBSITES_PORT` informa ao proxy do Azure qual porta esperar
- Sem essas configurações, Azure não consegue rotear HTTP → Gunicorn

**Verificação:**

```powershell
# 1. Verificar WEBSITES_PORT configurado
az webapp config appsettings list --name caracore-backend --resource-group rg-caracore --query "[?name=='WEBSITES_PORT']"

# 2. Testar health endpoint (deve responder em <5 segundos)
curl https://caracore-backend.azurewebsites.net/health

# 3. Cold start pode demorar 45-60 segundos (B1 tier)
```

### Erro: "503 Service Unavailable"

**Problema:** App não está respondendo

**Verificações:**

```powershell
# 1. Verificar logs
az webapp log tail --name caracore-backend --resource-group rg-caracore

# 2. Reiniciar app
az webapp restart --name caracore-backend --resource-group rg-caracore

# 3. Verificar health endpoint
curl https://caracore-backend.azurewebsites.net/health
```

### Erro: CORS Preflight Blocked

**Problema:** Console do navegador mostra `blocked by CORS policy: Response to preflight request doesn't pass access control check`

**Sintomas:**
- `curl` e Postman funcionam normalmente
- Dashboard frontend não consegue fazer requisições
- Backend responde 200 OK mas navegador bloqueia a resposta

**Causa Raiz:**
- Falta handler OPTIONS para requisições preflight CORS

**Solução:**

```python
# backend/app.py
# OBRIGATÓRIO: Todo endpoint de API precisa de handler OPTIONS

@app.route("/api/admin/logs", methods=["OPTIONS"])
def admin_logs_preflight():
    """Handler para CORS preflight"""
    return '', 204  # Retorna vazio com status 204

@app.route("/api/admin/logs", methods=["GET"])
@add_cors
def admin_logs():
    """Endpoint principal"""
    # ... lógica do endpoint
```

**Verificar em app.py:**
- `ORIGIN_ALLOWED` deve estar configurado (não usar wildcard `*` em produção)
- Todos os endpoints de API devem ter handler OPTIONS
- Function `add_cors()` deve estar aplicada em ambos (OPTIONS e GET/POST)

**Verificação:**

```powershell
# 1. Testar OPTIONS (deve retornar 204)
curl -X OPTIONS https://caracore-backend.azurewebsites.net/api/admin/logs -I

# 2. Verificar headers CORS
curl -H "Origin: https://www.caracore.com.br" -I https://caracore-backend.azurewebsites.net/api/admin/logs

# Deve incluir:
# Access-Control-Allow-Origin: https://www.caracore.com.br
# Access-Control-Allow-Methods: GET, POST, OPTIONS
```

---

## 🔐 Segurança

### Secrets Management

**NUNCA commitar secrets no Git!**

✅ **Correto:**

- Usar Azure App Settings
- Usar Azure Key Vault
- Usar variáveis de ambiente

❌ **Errado:**

- Hardcode no código
- Commitar `.env` files
- Enviar secrets por email/chat

### Validação de Secrets

```powershell
# Verificar se secrets estão configurados
az webapp config appsettings list `
  --name caracore-backend `
  --resource-group rg-caracore `
  --query "[?name=='GOOGLE_CLIENT_ID' || name=='MICROSOFT_CLIENT_ID']"
```

---

## 📊 Monitoramento

### Azure Application Insights (Opcional)

```powershell
# Habilitar Application Insights
az monitor app-insights component create `
  --app caracore-backend-insights `
  --location brazilsouth `
  --resource-group rg-caracore `
  --application-type web

# Conectar ao App Service
az webapp config appsettings set `
  --name caracore-backend `
  --resource-group rg-caracore `
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="xxxxx"
```

### Métricas Importantes

- **Response Time** (< 500ms)
- **Error Rate** (< 1%)
- **Availability** (> 99.9%)
- **CPU Usage** (< 70%)
- **Memory Usage** (< 80%)

---

## 📝 Checklist de Deploy

### Usando Script Automatizado (deploy_production.py)

O script já faz a maioria das verificações automaticamente:

**Verificações Automáticas (feitas pelo script):**
- ✅ Azure CLI instalado e autenticado
- ✅ Branch Git atual (avisa se não for main)
- ✅ Mudanças não commitadas (avisa)
- ✅ Testes pytest (opcional com --skip-tests)
- ✅ Backup automático criado
- ✅ Health check pós-deploy
- ✅ Teste de autenticação

**Verificações Manuais (antes de rodar o script):**
- [ ] Código testado localmente
- [ ] `requirements.txt` atualizado (se adicionou dependências)
- [ ] Secrets configurados no Azure (primeira vez apenas)
- [ ] Commit com mensagem descritiva

**Comando:**
```powershell
python scripts/deploy_production.py
```

### Deploy Manual (se necessário)

Antes de cada deploy:

- [ ] Código testado localmente
- [ ] Testes automatizados passando (6/6)
- [ ] `requirements.txt` atualizado
- [ ] Secrets configurados no Azure
- [ ] Branch correta (main)
- [ ] Commit message descritivo
- [ ] Backup da versão anterior
- [ ] Janela de manutenção (se necessário)

Após o deploy:

- [ ] Health check retornando 200 OK
- [ ] Testes automatizados passando em produção
- [ ] Logs sem erros críticos
- [ ] Frontend consegue autenticar (Google + Microsoft)
- [ ] CORS funcionando
- [ ] Rate limiting ativo

---

## 🔗 Links Úteis

- **App Service:** [https://portal.azure.com/#@caracore.com.br/resource/subscriptions/.../caracore-backend]
- **Resource Group:** rg-caracore
- **Documentation:** [https://docs.microsoft.com/en-us/azure/app-service/]
- **Azure CLI Reference:** [https://docs.microsoft.com/en-us/cli/azure/webapp]

---

## 📞 Suporte

**Em caso de problemas críticos:**

1. Executar rollback imediato
2. Verificar logs: `az webapp log tail`
3. Consultar este documento
4. Contatar equipe de DevOps

---

**Documento mantido por:** Cara Core Informática  
**Última revisão:** 31/10/2025  
**Versão:** 1.0.0
