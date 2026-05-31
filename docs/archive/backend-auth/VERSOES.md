# Versões de Dependências - CaraCore

**Data:** 04 de novembro de 2025  
**Branch:** main  
**Ambiente:** Produção (Azure App Service B1)  
**Status:** Fase 5 concluída - Sistema Admin Completo funcionando

---

## Marco Atual: Sistema Administrativo Completo

- **OAuth 2.1 + OIDC**: Implementado e funcionando
- **Sistema de Autorização**: Completo com controle de acesso
- **Sistema Super Admin**: Interface completa de gestão
- **Deploy Docker**: Container Registry + Web App for Containers
- **Arquitetura CSS/JS**: Centralizada e modularizada
- **Custo Atual**: USD 18,14/mês (produção B1)

## Python

- **Versão Local (Dev):** Python 3.13.7
- **Versão Azure Produção:** Python 3.10-slim (Docker Container)
- **Versão Azure Legacy:** Python 3.11.13 (App Service runtime - não utilizada)
- **Recomendado:** Python 3.10+ (compatibilidade OAuth 2.1 / OIDC + Docker)

### Docker Container (Produção Atual)

**Base Image:** `python:3.10-slim`

- **Vantagens:** Menor tamanho (~200MB vs. ~800MB), segurança melhorada
- **Multi-stage build:** Otimizado para produção
- **Startup:** `gunicorn --bind=0.0.0.0:$PORT --workers=1 --timeout=300 app:app`

### Como atualizar Python local:

```powershell
# Windows - via python.org ou winget
winget install Python.Python.3.10

# Verificar versão
python --version
```

---

## Dependências Backend

### Produção (requirements-docker.txt) - VERSÃO SIMPLIFICADA

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **Flask** | 3.0.3 | Framework web principal |
| **gunicorn** | 23.0.0 | WSGI HTTP server (produção) |
| **Authlib** | 1.3.2 | OAuth 2.1 / OIDC client library |
| **cryptography** | 43.0.3 | Criptografia (dependência Authlib) |
| **Flask-CORS** | 4.0.2 | Cross-Origin Resource Sharing |
| **requests** | 2.32.3 | HTTP client para APIs externas |
| **python-dotenv** | 1.0.1 | Carregar variáveis .env |

**Total:** 7 packages (otimizado para produção)  
**Benefício:** Build Docker 60% mais rápido, imagem mais segura

### Desenvolvimento (requirements.txt) - VERSÃO COMPLETA

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **Flask** | 3.0.3 | Framework web principal |
| **Werkzeug** | 3.0.4 | WSGI toolkit (dependência do Flask) |
| **gunicorn** | 23.0.0 | WSGI HTTP server (produção) |
| **Authlib** | 1.3.2 | OAuth 2.1 / OIDC client library |
| **cryptography** | 43.0.3 | Criptografia (dependência Authlib) |
| **Flask-CORS** | 4.0.2 | Cross-Origin Resource Sharing |
| **cffi** | 1.17.1 | C Foreign Function Interface (dep. cryptography) |
| **requests** | 2.32.3 | HTTP client para APIs externas |
| **urllib3** | 2.2.3 | HTTP client (dependência requests) |
| **certifi** | 2024.8.30 | Certificados SSL/TLS |
| **charset-normalizer** | 3.4.0 | Detecção de charset (dep. requests) |
| **idna** | 3.10 | Internacionalização de domínios |
| **python-dotenv** | 1.0.1 | Carregar variáveis .env (dev only) |

**Nota:** Para desenvolvimento local, usar `requirements.txt`. Para Docker, usar `requirements-docker.txt`.

---

## Frontend

### JavaScript (Vanilla)

- **html2pdf.js** | 0.10.1 | Geração de PDFs do dashboard
- **ES6+** | Nativo | JavaScript moderno (async/await, modules)

### CSS

- **CSS3** | Nativo | Estilos modernos (Grid, Flexbox, Variables)

### Arquitetura Modularizada (Fase 5)

**CSS Centralizado:**
- `secure/css/super-admin-login.css` | v20251104 | Estilos da página de login
- `secure/css/admin-common.css` | v20251104 | Estilos compartilhados
- `secure/css/approval-requests.css` | v20251104 | Estilos do painel de aprovações

**JavaScript Modularizado:**
- `secure/js/super-admin-login.js` | v20251104 | Lógica de autenticação
- `secure/js/admin-common.js` | v20251104 | Funcionalidades compartilhadas
- `secure/js/approval-manager.js` | v20251104b | Gestão de solicitações
- `secure/js/admin-users-manager.js` | v20251104 | Gestão de usuários

---

## Azure - Infraestrutura Docker

### Configuração Atual (Produção)

| Componente | SKU/Versão | Custo Mensal | Status |
|------------|------------|--------------|--------|
| **Azure Container Registry** | Basic | USD 5,00 | Funcionando |
| **Azure App Service** | F1 (Free) | USD 0,00 | Limitado |
| **Total Atual** | | **USD 5,00** | Desenvolvimento |

### Configuração Recomendada (Produção)

| Componente | SKU/Versão | Custo Mensal | Benefícios |
|------------|------------|--------------|------------|
| **Azure Container Registry** | Basic | USD 5,00 | 10GB, webhooks |
| **Azure App Service** | B1 (Basic) | USD 13,14 | SLA 99,95%, CPU dedicado |
| **Total Recomendado** | | **USD 18,14** | Produção enterprise |

### URLs e Recursos

- **Container Registry:** `caracoreregistry.azurecr.io`
- **Web App:** `caracore-backend-docker.azurewebsites.net`
- **GitHub Actions:** Deploy automatizado configurado
- **Health Check:** `/health` endpoint funcional

### Especificações Docker

- **Base Image:** `python:3.10-slim`
- **Tamanho da Imagem:** ~250 MB (otimizada)
- **Build Time:** ~2 minutos
- **Startup Command:** `gunicorn --bind=0.0.0.0:$PORT --workers=1 --timeout=300 app:app`
- **Port:** Dinâmico (variável $PORT do Azure)

### Ferramentas de Gerenciamento

| Ferramenta | Versão | Propósito |
|------------|--------|-----------|
| **Azure CLI** | 2.65+ | Gerenciamento via CLI |
| **Docker** | 20.10+ | Containerização |
| **GitHub Actions** | - | CI/CD automatizado |

---

## Ferramentas de Desenvolvimento

### Git & GitHub

| Ferramenta | Versão | Propósito |
|------------|--------|-----------|
| **Git** | 2.47+ | Controle de versão |
| **GitHub CLI (gh)** | 2.82.1 | Automação GitHub |
| **GitHub Actions** | - | CI/CD para Docker |

### Container & Deploy

| Ferramenta | Versão | Propósito |
|------------|--------|-----------|
| **Docker** | 20.10+ | Containerização |
| **Docker Compose** | 2.21+ | Desenvolvimento local |

### PowerShell & Scripts

| Ferramenta | Versão | Propósito |
|------------|--------|-----------|
| **PowerShell** | 5.1+ / 7+ | Scripts de automação |
| **Azure CLI** | 2.65+ | Deploy e config Azure |

### Arquivos de Configuração

| Arquivo | Propósito | Status |
|---------|-----------|--------|
| `Dockerfile.azure` | Build otimizado para produção | Funcionando |
| `docker-compose.yml` | Desenvolvimento local | Disponível |
| `.github/workflows/azure-docker-deploy.yml` | CI/CD automatizado | Ativo |
| `requirements-docker.txt` | Dependências produção | Otimizado |

---

## Como Atualizar Dependências

### Backend Docker (Produção)

```powershell
# 1. Editar requirements-docker.txt (versão simplificada)
# Manter apenas: Flask, gunicorn, Authlib, requests, python-dotenv

# 2. Build e teste local
docker build -f Dockerfile.azure -t caracore-test .
docker run -p 8000:8000 caracore-test

# 3. Push para produção via GitHub Actions
git add backend/requirements-docker.txt
git commit -m "chore: Atualizar dependências Docker"
git push origin main
# GitHub Actions fará deploy automaticamente
```

### Backend Local (Desenvolvimento)

```powershell
# 1. Atualizar requirements.txt (versão completa)
cd backend
pip install -r requirements.txt --upgrade

# 2. Testar localmente
python app.py

# 3. Verificar versões instaladas
pip list --format=freeze
```

### Azure Container Registry

```powershell
# Verificar imagens no registry
az acr repository list --name caracoreregistry

# Limpar imagens antigas (otimização de custos)
az acr repository show-tags --name caracoreregistry --repository caracore-backend

# Manual push (se necessário)
docker tag caracore-backend:latest caracoreregistry.azurecr.io/caracore-backend:latest
docker push caracoreregistry.azurecr.io/caracore-backend:latest
```

---

## Avisos de Segurança

### Vulnerabilidades Conhecidas (CVEs)

**Status:** Todas as dependências atualizadas e sem CVEs críticos

**Otimização de Segurança Docker:**
- Base image `python:3.10-slim` (menos superficie de ataque)
- Dependências minimizadas (5 vs. 12 packages)
- Non-root user no container
- Health checks implementados

Para verificar vulnerabilidades:

```powershell
# Verificar versão de produção (Docker)
safety check -r backend/requirements-docker.txt

# Verificar versão de desenvolvimento (completa)
safety check -r backend/requirements.txt

# Instalar safety (se necessário)
pip install safety
```

### Política de Atualização

1. **Atualizações de Segurança:** Imediatas (dentro de 24h)
2. **Atualizações Minor (x.Y.z):** Mensais
3. **Atualizações Major (X.y.z):** Revisar breaking changes, planejar
4. **Docker Base Image:** Trimestral (seguindo releases Python)

### Monitoramento

- **GitHub Dependabot:** Ativado para alertas automáticos
- **Azure Monitor:** Health checks a cada 5 minutos
- **Manual Check:** Mensal via `safety check`

---

## Histórico de Atualizações

| Data | Versão | Mudanças | Commit |
|------|--------|----------|--------|
| 04/11/2025 | v2.1 | **Fase 5 concluída** - Sistema Admin Completo funcionando | `main` |
| 02/11/2025 | v2.0 | **Fase 4 concluída** - Sistema de Autorização completo | `main` |
| 02/11/2025 | v1.9 | Deploy Docker funcionando em produção Azure | `main` |
| 02/11/2025 | v1.8 | Otimização requirements-docker.txt (5 packages) | `main` |
| 02/11/2025 | v1.7 | GitHub Actions CI/CD implementado | `main` |
| 02/11/2025 | v1.6 | Azure Container Registry configurado | `main` |
| 01/11/2025 | v1.5 | Migração de fase-01 para main branch | `main` |
| 01/11/2025 | v1.0 | Configuração inicial do projeto OAuth 2.1 + OIDC | `fase-01` |

### Marcos de Desenvolvimento

**Fase 1 (OAuth 2.1 + OIDC):** Autenticação Google/Microsoft 
**Fase 2 (Logout e Segurança):** Logout seguro e validações 
**Fase 3 (Auditoria e Backend):** Dashboard de auditoria 
**Fase 4 (Sistema de Autorização):** Controle de acesso completo 
**Fase 5 (Sistema Admin Completo):** Interface administrativa com CSS/JS modularizado 

### Próximas Atualizações Planejadas

| Prioridade | Item | Estimativa |
|------------|------|------------|
| **Alta** | Upgrade Azure App Service F1 → B1 | Concluído (04/11/2025) |
| **Média** | Implementar Azure Monitor alerts | 30 dias |
| **Baixa** | Migração para Azure Functions (opcional) | 90 dias |

---

## Referências

### Documentação Principal

- **Flask:** [https://flask.palletsprojects.com/]
- **Authlib:** [https://docs.authlib.org/]
- **Gunicorn:** [https://docs.gunicorn.org/]
- **Docker:** [https://docs.docker.com/]

### Azure Resources

- **Azure App Service:** [https://learn.microsoft.com/azure/app-service/]
- **Azure Container Registry:** [https://learn.microsoft.com/azure/container-registry/]
- **Azure Monitor:** [https://learn.microsoft.com/azure/azure-monitor/]

### Segurança e Compliance

- **Python Security:** [https://pyup.io/]
- **OAuth 2.1 Spec:** [https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/]
- **OIDC Spec:** [https://openid.net/specs/openid-connect-core-1_0.html]

### Documentação do Projeto

- **[INDEX.md](./INDEX.md)** - Índice central de documentação
- **[AZURE-CUSTO.md](./AZURE-CUSTO.md)** - Análise executiva de custos
- **[FASE-4-CONCLUIDA.md](./FASE-4-CONCLUIDA.md)** - Marco: Sistema de Autorização
- **[DEPLOY_SUCCESS_SUMMARY.md](./DEPLOY_SUCCESS_SUMMARY.md)** - Marco: Deploy Docker
