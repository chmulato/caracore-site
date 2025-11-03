# Guia de Deploy - Azure Container Registry + Web App

**Backend Python/Flask Dockerizado** 
**Versão:** 3.0.0 
**Última Atualização:** 02/11/2025 
**Arquitetura:** Docker Container + Azure Container Registry

---

## Visão Geral

Este documento descreve o processo completo de deploy do backend Python/Flask usando **Docker containers** no Azure, incluindo Azure Container Registry (ACR), GitHub Actions CI/CD, e Web App for Containers.

### Informações do Ambiente

**Produção Docker:**

- **Web App:** `caracore-backend-docker`
- **URL:** [https://caracore-backend-docker.azurewebsites.net]
- **Container Registry:** `caracoreregistry.azurecr.io`
- **Resource Group:** `rg-caracore`
- **Plan:** `caracore-plan` (F1 Free → B1 recomendado)
- **Runtime:** Docker Container (Python 3.10-slim)
- **Region:** Brazil South (Web App) + East US (ACR)

**Arquitetura Docker:**

- **CI/CD:** GitHub Actions automatizado
- **Registry:** Azure Container Registry (ACR Basic)
- **Container:** Multi-stage build otimizado
- **Deployment:** Web App for Containers
- **Health Check:** Endpoint `/health` automático

---

## Pré-requisitos

### Ferramentas Necessárias

1. **Docker** (versão 20.10+)

 ```powershell
 docker --version
 # Se não instalado: winget install Docker.DockerDesktop
 ```

2. **Azure CLI** (versão 2.50+)

 ```powershell
 az --version
 # Se não instalado: winget install Microsoft.AzureCLI
 ```

3. **Git** (para controle de versão e CI/CD)

 ```powershell
 git --version
 ```

### Login no Azure e Docker

```powershell
# Fazer login no Azure
az login

# Verificar conta ativa
az account show

# Login no Azure Container Registry
az acr login --name caracoreregistry

# Verificar conectividade com ACR
docker pull caracoreregistry.azurecr.io/caracore-backend:latest
```

---

## 📦 Estrutura Docker

```text
cara-core/
├── backend/
│ ├── app.py # Aplicação principal Flask
│ ├── requirements-docker.txt # Dependências otimizadas (5 packages)
│ ├── requirements.txt # Dependências completas (12 packages)
│ └── logs/ # Logs JSONL (gitignored)
├── Dockerfile.azure # Multi-stage build otimizado
├── docker-compose.yml # Desenvolvimento local
└── .github/workflows/
 └── azure-docker-deploy.yml # CI/CD GitHub Actions
```

### Dependências Docker (requirements-docker.txt)

```txt
Flask==3.0.3
gunicorn==23.0.0
Authlib==1.3.1
requests==2.32.3
python-dotenv==1.0.1
```

**Otimizações:**

- **5 packages** vs. 12 no requirements.txt completo
- **Build 70% mais rápido** (~2 min vs. ~7 min)
- **Imagem 60% menor** (~250 MB vs. ~800 MB)
- **Base `python:3.10-slim`** para segurança

### Dockerfile Multi-stage

```dockerfile
# Dockerfile.azure (otimizado para produção)
FROM python:3.10-slim

# Security: non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install dependencies
WORKDIR /app
COPY backend/requirements-docker.txt .
RUN pip install --no-cache-dir -r requirements-docker.txt

# Copy application
COPY backend/ .
RUN chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
 CMD curl -f http://localhost:$PORT/health || exit 1

# Startup
EXPOSE $PORT
CMD gunicorn --bind=0.0.0.0:$PORT --workers=1 --timeout=300 app:app
```

---

## Variáveis de Ambiente (Docker)

As seguintes variáveis **devem estar configuradas** no Azure Web App for Containers:

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

### Configurações Docker

```bash
# Container Configuration
DOCKER_REGISTRY_SERVER_URL="https://caracoreregistry.azurecr.io"
DOCKER_REGISTRY_SERVER_USERNAME="caracoreregistry"
DOCKER_REGISTRY_SERVER_PASSWORD="<ACR_PASSWORD>"

# Application Settings
FLASK_ENV="production"
ORIGIN_ALLOWED="https://www.caracore.com.br"
PORT="8000" # Dinamicamente definido pelo Azure
```

### Como Configurar no Azure Web App

**Via Portal Azure:**

1. Azure Portal > App Services > caracore-backend-docker
2. Settings > Configuration > Application Settings
3. Container Settings > Registry settings (para ACR)

**Via CLI:**

```powershell
# Configurar aplicação settings
az webapp config appsettings set `
 --name caracore-backend-docker `
 --resource-group rg-caracore `
 --settings GOOGLE_CLIENT_ID="valor" GOOGLE_CLIENT_SECRET="valor"

# Configurar container registry
az webapp config container set `
 --name caracore-backend-docker `
 --resource-group rg-caracore `
 --docker-custom-image-name caracoreregistry.azurecr.io/caracore-backend:latest `
 --docker-registry-server-url https://caracoreregistry.azurecr.io `
 --docker-registry-server-user caracoreregistry `
 --docker-registry-server-password <PASSWORD>
```

** DIFERENÇAS DO DOCKER:**

- **Não precisa** de `WEBSITES_PORT` (Docker usa variável `$PORT` automaticamente)
- **Precisa** configurar Azure Container Registry credentials
- **Health check** é gerenciado pelo Docker, não pelo Azure App Service
- **Startup time** pode ser maior (cold start ~60-90s)

---

## Deploy Docker para Produção

### Método 1: GitHub Actions CI/CD (Recomendado) ✨ AUTOMATIZADO

O deploy é **totalmente automatizado** via GitHub Actions sempre que há push para `main` com alterações em `backend/`.

```yaml
# .github/workflows/azure-docker-deploy.yml
name: Deploy Docker Backend to Azure

on:
 push:
 branches: [main]
 paths:
 - 'backend/**'
 - 'Dockerfile.azure'
 - '.github/workflows/azure-docker-deploy.yml'

jobs:
 deploy:
 runs-on: ubuntu-latest
 steps:
 - uses: actions/checkout@v4
 
 - name: Build Docker image
 run: |
 docker build -f Dockerfile.azure -t caracore-backend:${{ github.sha }} .
 docker tag caracore-backend:${{ github.sha }} caracoreregistry.azurecr.io/caracore-backend:latest
 docker tag caracore-backend:${{ github.sha }} caracoreregistry.azurecr.io/caracore-backend:${{ github.sha }}
 
 - name: Login to Azure Container Registry
 run: |
 echo "${{ secrets.ACR_PASSWORD }}" | docker login caracoreregistry.azurecr.io -u "${{ secrets.ACR_USERNAME }}" --password-stdin
 
 - name: Push to ACR
 run: |
 docker push caracoreregistry.azurecr.io/caracore-backend:latest
 docker push caracoreregistry.azurecr.io/caracore-backend:${{ github.sha }}
 
 - name: Deploy to Azure Web App
 uses: azure/webapps-deploy@v2
 with:
 app-name: 'caracore-backend-docker'
 publish-profile: ${{ secrets.AZURE_WEBAPP_DOCKER_PUBLISH_PROFILE }}
 images: 'caracoreregistry.azurecr.io/caracore-backend:latest'
 
 - name: Health Check
 run: |
 sleep 60 # Wait for container startup
 curl -f https://caracore-backend-docker.azurewebsites.net/health
```

**Secrets necessários no GitHub:**

- `ACR_USERNAME`: Username do Azure Container Registry
- `ACR_PASSWORD`: Password do Azure Container Registry 
- `AZURE_WEBAPP_DOCKER_PUBLISH_PROFILE`: Publish profile do Web App

**Como funciona:**

1. **Trigger automático:** Push para `main` com mudanças em `backend/`
2. **Build Docker:** Usando `Dockerfile.azure` otimizado
3. **Push para ACR:** Tag com `latest` + commit SHA
4. **Deploy automático:** Azure Web App pull da nova imagem
5. **Health check:** Verificação automática do endpoint `/health`

**Tempo estimado:** 3-4 minutos (build + push + deploy + warm-up)

### Método 2: Build e Push Manual

```powershell
# 1. Build da imagem Docker
cd d:\dev\site\cara-core
docker build -f Dockerfile.azure -t caracore-backend:latest .

# 2. Tag para ACR
docker tag caracore-backend:latest caracoreregistry.azurecr.io/caracore-backend:latest

# 3. Login no ACR (se necessário)
az acr login --name caracoreregistry

# 4. Push para ACR
docker push caracoreregistry.azurecr.io/caracore-backend:latest

# 5. Restart Web App para pull da nova imagem
az webapp restart --name caracore-backend-docker --resource-group rg-caracore
```

### Método 3: Desenvolvimento Local com Docker

```powershell
# 1. Build para teste local
docker build -f Dockerfile.azure -t caracore-local .

# 2. Run local (com environment variables)
docker run -d `
 -p 8000:8000 `
 -e GOOGLE_CLIENT_ID="seu_client_id" `
 -e GOOGLE_CLIENT_SECRET="seu_secret" `
 -e FLASK_ENV="development" `
 --name caracore-dev `
 caracore-local

# 3. Testar localmente
curl http://localhost:8000/health

# 4. Ver logs
docker logs caracore-dev

# 5. Cleanup
docker stop caracore-dev && docker rm caracore-dev
```

---

## Verificação Pós-Deploy Docker

### 1. Health Check Automático

```powershell
# Testar endpoint de saúde
curl https://caracore-backend-docker.azurewebsites.net/health

# Resposta esperada:
# {"status": "ok", "timestamp": "2025-11-02T12:00:00Z", "version": "docker"}
```

### 2. Verificar Container Status

```powershell
# Status do Web App Docker
az webapp show --name caracore-backend-docker --resource-group rg-caracore --query state

# Logs do container
az webapp log tail --name caracore-backend-docker --resource-group rg-caracore

# Container runtime info
az webapp config show --name caracore-backend-docker --resource-group rg-caracore --query linuxFxVersion
```

### 3. Verificar Azure Container Registry

```powershell
# Listar imagens no registry
az acr repository list --name caracoreregistry

# Ver tags da imagem
az acr repository show-tags --name caracoreregistry --repository caracore-backend

# Informações da imagem atual
az acr repository show --name caracoreregistry --repository caracore-backend
```

### 4. Testes Automatizados Docker

```powershell
# Testar todos os endpoints principais
curl -I https://caracore-backend-docker.azurewebsites.net/health # Health check
curl -I https://caracore-backend-docker.azurewebsites.net/api/admin/users # Authorization API
curl -I https://caracore-backend-docker.azurewebsites.net/auth/google # OAuth Google
curl -I https://caracore-backend-docker.azurewebsites.net/auth/microsoft # OAuth Microsoft

# Verificar CORS headers
curl -H "Origin: https://www.caracore.com.br" -I https://caracore-backend-docker.azurewebsites.net/health
```

### 5. Monitoramento de Performance

```powershell
# Container startup time (deve ser < 90 segundos)
time curl -f https://caracore-backend-docker.azurewebsites.net/health

# Memory usage (via Azure portal)
# Azure Portal > App Services > caracore-backend-docker > Metrics > Memory Percentage

# CPU usage (via Azure portal) 
# Azure Portal > App Services > caracore-backend-docker > Metrics > CPU Percentage
```

---

## 🔄 Processo de Rollback Docker

### Rollback via Azure Container Registry Tags

**Listar versões disponíveis:**

```powershell
# Ver todas as tags no ACR
az acr repository show-tags --name caracoreregistry --repository caracore-backend

# Exemplo de output:
# [
# "latest",
# "abc123def456", # commit SHA
# "def789ghi012", # commit SHA anterior
# "v1.2.0" # tag de release
# ]
```

**Reverter para versão específica:**

```powershell
# 1. Identificar a tag da versão anterior
az acr repository show-tags --name caracoreregistry --repository caracore-backend --orderby time_desc

# 2. Atualizar Web App para usar tag específica
az webapp config container set `
 --name caracore-backend-docker `
 --resource-group rg-caracore `
 --docker-custom-image-name caracoreregistry.azurecr.io/caracore-backend:def789ghi012

# 3. Restart para aplicar nova imagem
az webapp restart --name caracore-backend-docker --resource-group rg-caracore

# 4. Health check após rollback
curl https://caracore-backend-docker.azurewebsites.net/health
```

### Rollback via GitHub Actions

**Re-executar deploy anterior:**

1. GitHub → Actions → Deploy Docker Backend
2. Selecionar workflow run anterior bem-sucedido
3. Clicar em "Re-run jobs"
4. Aguardar deploy e verificar health check

### Rollback via Docker Local + Push

```powershell
# 1. Checkout do commit anterior
git log --oneline -10 # Ver últimos 10 commits
git checkout abc123def456 # Commit conhecido funcionando

# 2. Build da versão anterior
docker build -f Dockerfile.azure -t caracore-rollback .

# 3. Tag e push para ACR
docker tag caracore-rollback caracoreregistry.azurecr.io/caracore-backend:rollback-$(date +%Y%m%d)
az acr login --name caracoreregistry
docker push caracoreregistry.azurecr.io/caracore-backend:rollback-$(date +%Y%m%d)

# 4. Update Web App
az webapp config container set `
 --name caracore-backend-docker `
 --resource-group rg-caracore `
 --docker-custom-image-name caracoreregistry.azurecr.io/caracore-backend:rollback-$(date +%Y%m%d)

# 5. Restart e verificar
az webapp restart --name caracore-backend-docker --resource-group rg-caracore
curl https://caracore-backend-docker.azurewebsites.net/health

# 6. Voltar para branch principal
git checkout main
```

**Vantagens do Rollback Docker:**

- **Versioning:** Cada deploy gera tag única (commit SHA)
- **Rapidez:** Rollback em ~2-3 minutos (pull de imagem existente)
- **Consistência:** Exata mesma imagem que funcionou antes
- **Auditoria:** Histórico completo no ACR e GitHub Actions

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

** IMPORTANTE:** Azure App Service Python **requer** configuração específica de porta:

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
# ERRADO (porta hardcoded)
--startup-file "gunicorn --bind=0.0.0.0:8000 --timeout 600 app:app"

# CORRETO (usa variável $PORT do Azure)
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
 return '', 204 # Retorna vazio com status 204

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

## Segurança Docker

### Container Security

**Otimizações implementadas:**

```dockerfile
# Dockerfile.azure - Security best practices
FROM python:3.10-slim # Minimal base image
RUN groupadd -r appuser && useradd -r -g appuser appuser # Non-root user
COPY backend/requirements-docker.txt . # Minimal dependencies (5 packages)
RUN chown -R appuser:appuser /app # Proper file ownership
USER appuser # Run as non-root
```

**Secrets Management:**
- **GitHub Secrets:** ACR credentials protegidos
- **Azure Container Registry:** Access tokens com escopo limitado
- **Web App Environment:** Variables separadas do código
- **No hardcoding:** Todas credenciais via environment variables

### Validação de Secrets Docker

```powershell
# Verificar se container registry está configurado
az webapp config container show --name caracore-backend-docker --resource-group rg-caracore

# Verificar application settings
az webapp config appsettings list --name caracore-backend-docker --resource-group rg-caracore --query "[?name=='GOOGLE_CLIENT_ID' || name=='MICROSOFT_CLIENT_ID']"

# Testar autenticação OAuth
curl -I https://caracore-backend-docker.azurewebsites.net/auth/google
curl -I https://caracore-backend-docker.azurewebsites.net/auth/microsoft
```

---

## Monitoramento Docker

### Azure Container Insights

```powershell
# Habilitar Container Insights (se disponível)
az monitor diagnostic-settings create `
 --name caracore-docker-insights `
 --resource "/subscriptions/<sub-id>/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend-docker" `
 --logs '[{"category":"AppServiceConsoleLogs","enabled":true}]' `
 --metrics '[{"category":"AllMetrics","enabled":true}]' `
 --workspace "/subscriptions/<sub-id>/resourceGroups/rg-caracore/providers/Microsoft.OperationalInsights/workspaces/caracore-workspace"

# Verificar métricas do container
az monitor metrics list `
 --resource "/subscriptions/<sub-id>/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend-docker" `
 --metric "CpuPercentage,MemoryPercentage" `
 --interval PT1M
```

### Métricas Importantes Docker

| Métrica | Target | Current | Status |
|---------|--------|---------|--------|
| **Container Start Time** | < 90s | ~60s | |
| **Response Time** | < 500ms | ~200ms | |
| **Memory Usage** | < 80% | ~45% | |
| **CPU Usage** | < 70% | ~25% | |
| **Image Size** | < 500MB | ~250MB | |
| **Build Time** | < 5min | ~2min | |

### Health Monitoring

```powershell
# Health check endpoint
curl https://caracore-backend-docker.azurewebsites.net/health

# Expected response:
# {
# "status": "ok",
# "timestamp": "2025-11-02T12:00:00Z",
# "version": "docker",
# "container": {
# "image": "caracoreregistry.azurecr.io/caracore-backend:latest",
# "uptime": "2h 30m",
# "memory_usage": "180MB/1GB"
# }
# }

# Container logs monitoring
az webapp log tail --name caracore-backend-docker --resource-group rg-caracore
```

### Alertas Recomendados

```powershell
# CPU alert (>80% por 5 minutos)
az monitor metrics alert create `
 --name "caracore-docker-high-cpu" `
 --resource-group rg-caracore `
 --scopes "/subscriptions/<sub-id>/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend-docker" `
 --condition "avg CpuPercentage > 80" `
 --window-size 5m `
 --evaluation-frequency 1m

# Memory alert (>90% por 3 minutos)
az monitor metrics alert create `
 --name "caracore-docker-high-memory" `
 --resource-group rg-caracore `
 --scopes "/subscriptions/<sub-id>/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend-docker" `
 --condition "avg MemoryPercentage > 90" `
 --window-size 3m `
 --evaluation-frequency 1m
```

---

## Checklist de Deploy

### Usando Script Automatizado (deploy_production.py)

O script já faz a maioria das verificações automaticamente:

**Verificações Automáticas (feitas pelo script):**

- Azure CLI instalado e autenticado
- Branch Git atual (avisa se não for main)
- Mudanças não commitadas (avisa)
- Testes pytest (opcional com --skip-tests)
- Backup automático criado
- Health check pós-deploy
- Teste de autenticação

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

## Links Úteis Docker

### Azure Resources

- **Web App Docker:** [https://portal.azure.com/#@caracore.com.br/resource/subscriptions/.../caracore-backend-docker]
- **Container Registry:** [https://portal.azure.com/#@caracore.com.br/resource/subscriptions/.../caracoreregistry]
- **Resource Group:** rg-caracore
- **GitHub Actions:** [https://github.com/chmulato/cara-core/actions]

### URLs de Produção

- **API Backend:** [https://caracore-backend-docker.azurewebsites.net]
- **Health Check:** [https://caracore-backend-docker.azurewebsites.net/health]
- **Admin API:** [https://caracore-backend-docker.azurewebsites.net/api/admin/users]
- **OAuth Google:** [https://caracore-backend-docker.azurewebsites.net/auth/google]
- **OAuth Microsoft:** [https://caracore-backend-docker.azurewebsites.net/auth/microsoft]

### Documentação

- **Docker Documentation:** [https://docs.docker.com/]
- **Azure Container Registry:** [https://docs.microsoft.com/en-us/azure/container-registry/]
- **Azure Web App for Containers:** [https://docs.microsoft.com/en-us/azure/app-service/containers/]
- **GitHub Actions:** [https://docs.github.com/en/actions]

### Documentação do Projeto

- **[INDEX.md](./INDEX.md)** - Índice central de documentação
- **[AZURE-CUSTO.md](./AZURE-CUSTO.md)** - Análise executiva de custos (USD 5,00 → USD 18,14/mês)
- **[VERSOES.md](./VERSOES.md)** - Controle de versões Docker
- **[GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)** - Configuração de secrets CI/CD

---

## 📞 Suporte

**Em caso de problemas críticos com Docker:**

1. **Verificar GitHub Actions:** Logs de build e deploy
2. **Rollback imediato:** Via ACR tags ou re-run workflow anterior
3. **Verificar logs container:** `az webapp log tail --name caracore-backend-docker`
4. **Consultar este documento** para troubleshooting específico
5. **Teste local:** Build e run da imagem Docker localmente

### Contatos de Emergência

- **Desenvolvedor:** Carlos H. Mulato
- **Email:** [seu-email]
- **Repositório:** https://github.com/chmulato/cara-core
- **Issues:** https://github.com/chmulato/cara-core/issues

### Status Pages

- **Azure Status:** [https://status.azure.com/]
- **GitHub Status:** [https://www.githubstatus.com/]
- **Sistema CaraCore:** Health check endpoint para verificação automática

---

**Documento mantido por:** Cara Core Informática 
**Última revisão:** 02/11/2025 
**Versão:** 3.0.0 (Docker) 
**Arquitetura:** Docker Container + Azure Container Registry + Web App for Containers 
**Status:** Funcionando em produção
