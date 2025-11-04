# Índice de Documentação - CaraCore

**Última Atualização:** 04/11/2025 - Sistema Admin Completo funcionando

Este documento serve como índice central para toda a documentação do projeto CaraCore.

---

## Documentação Essencial

### Documentos Core

| Documento | Descrição | Status |
|-----------|-----------|--------|
| **[FASE-4-CONCLUIDA.md](./FASE-4-CONCLUIDA.md)** | **Marco: Sistema de Autorização 100% Implementado** | **CONCLUÍDO** |
| **[DEPLOY_SUCCESS_SUMMARY.md](./DEPLOY_SUCCESS_SUMMARY.md)** | **Marco: Deploy Docker bem-sucedido no Azure** | **FUNCIONANDO** |
| [pendencias/STATUS-ATUAL.md](./pendencias/STATUS-ATUAL.md) | Status global detalhado do projeto (1219 linhas) | Atualizado |

### Autenticação e Segurança

| Documento | Descrição | Status |
|-----------|-----------|--------|
| **[SUPER-ADMIN-AUTH.md](./SUPER-ADMIN-AUTH.md)** | **Guia técnico completo de autenticação do Super Administrador** | **IMPLEMENTADO** |
| **[SUPER-ADMIN-DOCKER.md](./SUPER-ADMIN-DOCKER.md)** | **Configuração específica para ambiente Docker/Azure Container Apps** | **IMPLEMENTADO** |
| **[CHECKLIST-SUPER-ADMIN.md](./CHECKLIST-SUPER-ADMIN.md)** | **Checklist passo-a-passo para configuração Azure** | **DISPONÍVEL** |
| **[RESUMO-SUPER-ADMIN.md](./RESUMO-SUPER-ADMIN.md)** | **Resumo executivo da implementação** | **DISPONÍVEL** |

### Guias Operacionais

| Documento | Descrição | Status |
|-----------|-----------|--------|
| [AZURE_DEPLOY.md](./AZURE_DEPLOY.md) | Guia completo de deploy e rollback no Azure | Atualizado |
| **[AZURE-CUSTO.md](./AZURE-CUSTO.md)** | **Análise executiva de custos da infraestrutura Azure** | **DISPONÍVEL** |
| [AZURE_MONITOR.md](./AZURE_MONITOR.md) | Configuração de monitoramento e alertas | Disponível |
| [VERSOES.md](./VERSOES.md) | Controle de versões de dependências | Atualizado |

### Documentação por Fase

| Fase | Status | Documentação | Detalhes |
|------|--------|--------------|----------|
| **Fase 1** | 100% | [OAuth 2.1 + OIDC](./fases/fase-1/) | Autenticação |
| **Fase 2** | 100% | [Logout e Segurança](./fases/fase-2/) | Segurança |
| **Fase 3** | 100% | [Auditoria e Backend](./fases/fase-3/) | Backend |
| **Fase 4** | **100%** | **[Sistema de Autorização](./FASE-4-CONCLUIDA.md)** | **CONCLUÍDA** |
| **Fase 5** | **100%** | **[Sistema Admin Completo](./pendencias/STATUS-ATUAL.md)** | **CONCLUÍDA** |

### Status e Relatórios

| Documento | Descrição | Última Atualização |
|-----------|-----------|-------------------|
| [pendencias/STATUS-ATUAL.md](./pendencias/STATUS-ATUAL.md) | **Status global detalhado** (1343+ linhas) - **Fase 5 incluída** | 04/11/2025 |
| [pendencias/CRITERIOS-DE-ACEITE-OAUTH_2.1-OIDC.md](./pendencias/CRITERIOS-DE-ACEITE-OAUTH_2.1-OIDC.md) | Critérios de aceite OAuth | Atualizado |

---

## Gestão de Custos e ROI

### Análise Financeira Azure

| Documento | Descrição | Público-Alvo |
|-----------|-----------|--------------|
| **[AZURE-CUSTO.md](./AZURE-CUSTO.md)** | **Análise executiva de custos operacionais Azure** | **Executivos/Gestores** |

### Resumo Executivo de Custos

**Cenário Atual (Desenvolvimento):**

- Azure Container Registry (Basic): USD 5,00/mês
- App Service (F1 Free): USD 0,00/mês
- **Total**: USD 5,00/mês

**Cenário Recomendado (Produção):**

- Azure Container Registry (Basic): USD 5,00/mês 
- App Service (B1 Basic): USD 13,14/mês
- **Total**: USD 18,14/mês

**ROI Justificativa:**

- SLA 99,95% vs. limitações do tier gratuito
- Custo por usuário: USD 0,18/mês (base 100 usuários)
- Break-even: 1 incidente crítico evitado por trimestre
- Sistema OAuth enterprise por menos de USD 220/ano

**Documentação completa:** [AZURE-CUSTO.md](./AZURE-CUSTO.md)

---

## MARCOS ALCANÇADOS

### Sistema Admin Completo (Fase 5) - IMPLEMENTADO

- **Data**: 04/11/2025
- **Status**: Sistema administrativo completo com interface CSS/JS modularizada
- **Documentação**: [pendencias/STATUS-ATUAL.md](./pendencias/STATUS-ATUAL.md)
- **Componentes**:
  - Interface: super-admin-login.html, admin-users.html, approval-requests.html
  - CSS Modularizado: 4 arquivos CSS centralizados (v20251104)
  - JS Modularizado: 4 arquivos JavaScript centralizados (v20251104)
  - Navegação: Links integrados entre todas as páginas administrativas
  - Segurança: Modal controlado por flags de autorização

### Autenticação Super Administrador - IMPLEMENTADO

- **Data**: 03/11/2025
- **Status**: Sistema híbrido de autenticação implementado e configurado
- **Documentação**: [SUPER-ADMIN-AUTH.md](./SUPER-ADMIN-AUTH.md)
- **Componentes**:
  - Backend: Endpoints `/auth/super-admin` e `/auth/verify-super-admin`
  - Frontend: Página de login reformulada com autenticação direta
  - Segurança: Hash SHA-256 + Tokens JWT com role específica
  - Scripts: `setup_super_admin.py` para geração de credenciais
- **Tecnologias**: SHA-256, JWT HS256, Rate Limiting, CORS

### Sistema de Autorização (Fase 4) - CONCLUÍDO

- **Data**: 02/11/2025
- **Status**: 100% implementado e funcionando em produção
- **Documentação**: [FASE-4-CONCLUIDA.md](./FASE-4-CONCLUIDA.md)
- **Componentes**: 
 - Backend: authorization.py (485 linhas)
 - Frontend: admin-users.html, access-denied.html, request-access.html
 - APIs: 4 endpoints REST funcionando
 - Testes: Cobertura 80%+ implementada

### Deploy Docker - FUNCIONANDO

- **Data**: 02/11/2025 
- **Status**: Aplicação rodando em produção Azure
- **URL**: [https://caracore-backend-docker.azurewebsites.net]
- **Documentação**: [DEPLOY_SUCCESS_SUMMARY.md](./DEPLOY_SUCCESS_SUMMARY.md)
- **Infraestrutura**: Container Registry + Web App for Containers

---

## Quick Start

### Para Desenvolvedores

1. **Clone o repositório**

 ```bash
 git clone https://github.com/chmulato/cara-core.git
 cd cara-core
 ```

2. **Leia a documentação essencial**
 - [FASE-4-CONCLUIDA.md](./FASE-4-CONCLUIDA.md) - Sistema de autorização
 - [DEPLOY_SUCCESS_SUMMARY.md](./DEPLOY_SUCCESS_SUMMARY.md) - Deploy Docker
 - [AZURE_DEPLOY.md](./AZURE_DEPLOY.md) - Operações Azure
 - [AZURE-CUSTO.md](./AZURE-CUSTO.md) - Análise de custos executiva
 - [VERSOES.md](./VERSOES.md) - Dependências

3. **Configure o ambiente local**

 ```bash
 cd backend
 pip install -r requirements-docker.txt # Versão simplificada
 # ou
 pip install -r requirements.txt # Versão completa
 ```

### Para Deploy Docker

**Deploy via Azure Container Registry:**

```bash
# Build da imagem
docker build -f Dockerfile.azure -t caracore-backend:latest .

# Tag para ACR
docker tag caracore-backend:latest caracoreregistry.azurecr.io/caracore-backend:latest

# Push para ACR
docker push caracoreregistry.azurecr.io/caracore-backend:latest
```

**Configuração OAuth:**

```powershell
# Script seguro para configurar credenciais
.\configure_oauth_credentials.ps1
```

---

## Estrutura de Documentação

```text
docs/
├── INDEX.md # Este arquivo (índice central)
│
├── DOCUMENTOS CORE
├── FASE-4-CONCLUIDA.md # Marco: Sistema de Autorização
├── DEPLOY_SUCCESS_SUMMARY.md # Marco: Deploy Docker
│
├── AUTENTICAÇÃO E SEGURANÇA
├── SUPER-ADMIN-AUTH.md # Guia técnico completo do super admin
├── SUPER-ADMIN-DOCKER.md # Configuração Docker/Azure Container Apps
├── CHECKLIST-SUPER-ADMIN.md # Checklist configuração Azure
├── RESUMO-SUPER-ADMIN.md # Resumo executivo implementação
│
├── OPERAÇÕES
├── AZURE_DEPLOY.md # Guia de deploy e operações
├── AZURE-CUSTO.md # Análise executiva de custos Azure
├── AZURE_MONITOR.md # Monitoramento e alertas
├── VERSOES.md # Controle de versões
│
├── fases/ # Documentação por fase
│ ├── README.md # Organização das fases
│ ├── checklist-geral.md # Checklist do projeto
│ ├── template-acompanhamento.md # Template para fases
│ ├── fase-1/ # OAuth 2.1 + OIDC (CONCLUÍDA)
│ ├── fase-2/ # Logout e Segurança (CONCLUÍDA)
│ ├── fase-3/ # Auditoria e Backend (CONCLUÍDA)
│ └── fase-4/ # Sistema de Autorização (CONCLUÍDA)
│
└── pendencias/ # Status e critérios
 ├── STATUS-ATUAL.md # Status global completo (1219 linhas)
 └── CRITERIOS-DE-ACEITE-OAUTH_2.1-OIDC.md # Critérios OAuth
```

---

## Troubleshooting Comum

### 1. Aplicação Docker não responde

**Problema:** `https://caracore-backend-docker.azurewebsites.net/health` não responde

**Causas:**

- Container Registry não acessível
- Imagem Docker com problemas
- Environment variables não configuradas

**Solução:**

```powershell
# 1. Verificar status do Web App
az webapp show --resource-group rg-caracore --name caracore-backend-docker

# 2. Verificar logs
az webapp log tail --resource-group rg-caracore --name caracore-backend-docker

# 3. Configurar OAuth (se necessário)
.\configure_oauth_credentials.ps1

# 4. Restart
az webapp restart --resource-group rg-caracore --name caracore-backend-docker
```

**Documentação:** [DEPLOY_SUCCESS_SUMMARY.md](./DEPLOY_SUCCESS_SUMMARY.md)

### 2. Sistema de Autorização não funciona

**Problema:** Usuários autenticados não conseguem acessar Área 51

**Causa:** Sistema de autorização não carregando dados

**Verificação:**

```bash
# Testar endpoint de autorização
curl https://caracore-backend-docker.azurewebsites.net/api/admin/users
```

**Solução:** Verificar se `authorized_users.json` está incluído no container

**Documentação:** [FASE-4-CONCLUIDA.md](./FASE-4-CONCLUIDA.md)

### 3. Cryptography ImportError (Resolvido)

**Problema:** `cannot import name 'x509' from 'cryptography.hazmat.bindings._rust'`

**Solução:** Usar a versão Docker simplificada:

```bash
# Usar requirements-docker.txt (sem cryptography problemática)
pip install -r backend/requirements-docker.txt
```

**Documentação:** [DEPLOY_SUCCESS_SUMMARY.md - Docker Setup](./DEPLOY_SUCCESS_SUMMARY.md)

**Solução:**

```python
# backend/app.py
@app.route('/api/admin/logs', methods=['OPTIONS'])
def admin_logs_options():
 response = make_response('', 204)
 response.headers['Access-Control-Allow-Origin'] = os.getenv('ORIGIN_ALLOWED', 'https://www.caracore.com.br')
 response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
 response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
 return response
```

**Documentação:** [AZURE_DEPLOY.md - CORS](./AZURE_DEPLOY.md#3-cors-error-no-dashboard)

### 3. Variáveis de Ambiente Perdidas

**Problema:** Backend retorna erro 500 por falta de variáveis

**Solução:**

```powershell
# Usar script automatizado para configurar todas as variáveis
cd d:\dev\site\cara-core
.\scripts\configure_azure_all_settings.ps1
```

**Documentação:** [AZURE_DEPLOY.md - Variáveis](./AZURE_DEPLOY.md#-variáveis-de-ambiente-secrets)

### 4. Super Admin - Credenciais Inválidas

**Problema:** Login do super admin retorna "Credenciais inválidas"

**Causas:**

- Senha incorreta
- Variáveis de ambiente não configuradas no Azure
- Hash SHA-256 não corresponde

**Verificação:**

```bash
# Verificar se variáveis estão no Azure
az webapp config appsettings list --name caracore-backend-docker --resource-group rg-caracore --query "[?name=='SUPER_ADMIN_PASSWORD_HASH' || name=='JWT_SECRET_KEY']"
```

**Solução:**

```bash
# Regenerar credenciais
cd scripts
python setup_super_admin.py

# Atualizar no Azure via Portal ou CLI
# Ver: docs/CHECKLIST-SUPER-ADMIN.md
```

**Documentação:** [SUPER-ADMIN-AUTH.md - Troubleshooting](./SUPER-ADMIN-AUTH.md)

---

## Scripts de Automação

### Deploy e Operações

| Script | Descrição | Uso |
|--------|-----------|-----|
| `deploy_production.py` | Deploy automatizado com verificações | `python scripts/deploy_production.py` |
| `rollback.py` | Rollback para versão anterior | `python scripts/rollback.py --latest` |
| `configure_azure_all_settings.ps1` | Configura variáveis de ambiente Azure | `.\scripts\configure_azure_all_settings.ps1` |

### Autenticação e Segurança

| Script | Descrição | Uso |
|--------|-----------|-----|
| `setup_super_admin.py` | Geração de credenciais super admin | `python scripts/setup_super_admin.py` |

### Validação e Testes

| Script | Descrição | Uso |
|--------|-----------|-----|
| `teste_caminho_feliz.py` | Testes OIDC completos (64 testes) | `python secure/testes/teste_caminho_feliz.py` |
| `backend/validar_dashboard.py` | Testes E2E da Fase 3 | `python backend/validar_dashboard.py` |
| `backend/test_admin_logs.py` | Testes de endpoints de auditoria | `pytest backend/test_admin_logs.py` |

**Documentação completa:** [scripts/README_PY.md](../scripts/README_PY.md)

---

## Segurança

### Secrets Management

**Arquivos sensíveis (gitignored):**

- `secrets.txt` - Variáveis de ambiente gerais
- `backend/.env` - Configuração local do backend
- `backend/logs/*.jsonl` - Logs com dados de usuários
- Arquivos `*SECRET*.txt` - Configurações sensíveis

**Como configurar secrets:**

1. Copiar template:

 ```bash
 cp secrets.txt.template secrets.txt
 ```

2. Editar com valores reais (nunca commitar!)

3. Gerar credenciais do super admin:

 ```bash
 python scripts/setup_super_admin.py
 ```

4. Configurar no Azure:

 ```powershell
 .\scripts\configure_azure_all_settings.ps1
 ```

**Documentação:** 
- [AZURE_DEPLOY.md - Segurança](./AZURE_DEPLOY.md#-segurança)
- [SUPER-ADMIN-AUTH.md - Autenticação](./SUPER-ADMIN-AUTH.md)

### Autenticação Híbrida

**Sistema duplo implementado:**

1. **OAuth 2.1 + OIDC** - Para usuários regulares
 - Google Workspace
 - Microsoft Entra ID
 - Tokens PKCE + JWT

2. **Autenticação Direta** - Para Super Administrador
 - Email fixo: suporte@caracore.com.br
 - Senha com hash SHA-256
 - Tokens JWT com role específica
 - Rate limiting e logging

**Documentação completa:** [SUPER-ADMIN-AUTH.md](./SUPER-ADMIN-AUTH.md)

---

## Arquitetura

### Ambientes

| Ambiente | Descrição | URL |
|----------|-----------|-----|
| **Local** | Desenvolvimento e testes | `http://localhost:8000` |
| **Produção** | Azure App Service | `https://caracore-backend.azurewebsites.net` |

**Não há ambiente de staging.** Deploy é feito diretamente para produção com backups automáticos.

### Tecnologias

| Componente | Tecnologia | Versão |
|------------|-----------|--------|
| Backend | Python + Flask | 3.11 + 3.0.3 |
| WSGI Server | Gunicorn | 23.0.0 |
| Auth | Authlib (OAuth 2.1 + OIDC) | 1.3.1 |
| Cloud | Azure App Service (B1) | - |
| Frontend | Vanilla JS + CSS3 | - |

**Documentação:** [VERSOES.md](./VERSOES.md)

---

## Progresso do Projeto

| Fase | Status | Documentação | Data Conclusão |
|------|--------|--------------|----------------|
| Fase 1: OAuth 2.1 + OIDC | **100%** | [fase-1/](./fases/fase-1/) | Concluída |
| Fase 2: Logout e Segurança | **100%** | [fase-2/](./fases/fase-2/) | Concluída |
| Fase 3: Auditoria e Backend | **100%** | [fase-3/](./fases/fase-3/) | Concluída |
| **Fase 4: Sistema de Autorização** | **100%** | **[FASE-4-CONCLUIDA.md](./FASE-4-CONCLUIDA.md)** | **02/11/2025** |
| **Fase 5: Sistema Admin Completo** | **100%** | **[STATUS-ATUAL.md](./pendencias/STATUS-ATUAL.md)** | **04/11/2025** |
| **Super Admin Auth** | **100%** | **[SUPER-ADMIN-AUTH.md](./SUPER-ADMIN-AUTH.md)** | **03/11/2025** |

### **Status Atual: SISTEMA COMPLETO**

- **Todas as 5 fases concluídas**
- **Sistema administrativo completo funcionando**
- **Interface CSS/JS modularizada implementada**
- **Sistema de autorização funcionando em produção**
- **Autenticação super admin implementada**
- **Deploy Docker bem-sucedido no Azure**
- **Sistema híbrido OAuth + senha direta operacional**

**Status detalhado:** [pendencias/STATUS-ATUAL.md](./pendencias/STATUS-ATUAL.md)

---

## Marcos Técnicos Alcançados

### Sistema Admin Completo (Fase 5) - 04/11/2025

- **Interface Completa**: super-admin-login.html, admin-users.html, approval-requests.html
- **CSS Modularizado**: 4 arquivos CSS centralizados com versionamento (v20251104)
- **JS Modularizado**: 4 arquivos JavaScript centralizados com funcionalidade compartilhada
- **Navegação Integrada**: Links entre todas as páginas administrativas
- **Controle de Modal**: Sistema robusto de autorização para popups
- **Logout Unificado**: Funcionalidade consistente em todas as páginas admin

### Autenticação Super Administrador (03/11/2025)

- **Backend**: Endpoints `/auth/super-admin` e `/auth/verify-super-admin`
- **Frontend**: Página de login reformulada (secure/super-admin-setup.html)
- **Segurança**: Hash SHA-256 + JWT HS256 + Rate Limiting
- **Scripts**: setup_super_admin.py para geração automática de credenciais
- **Arquitetura**: Sistema híbrido independente de OAuth
- **Testes**: 64 testes OIDC validados (100% pass rate)

### Sistema de Autorização (Fase 4)

- **Backend**: authorization.py (485 linhas) funcionando
- **Frontend**: 3 páginas HTML + 2 módulos JavaScript 
- **APIs**: 4 endpoints REST ativos
- **Testes**: Cobertura 80%+ implementada
- **Data**: authorized_users.json com 2 admins carregados

### Infraestrutura Docker

- **Aplicação**: caracore-backend-docker.azurewebsites.net
- **Container Registry**: caracoreregistry.azurecr.io
- **Status**: Online e funcional
- **CI/CD**: GitHub Actions com deploy automático
- **Solução**: Resolveu cryptography e data persistence issues

---

## Suporte

### Contatos

- **Desenvolvedor:** Christian Vladimir Uhdre Mulato
- **Email:** [suporte@caracore.com.br]
- **Repositório:** <https://github.com/chmulato/cara-core>

### Documentação Adicional

- **Azure App Service:** <https://learn.microsoft.com/azure/app-service/>
- **Flask:** <https://flask.palletsprojects.com/>
- **OAuth 2.1:** <https://oauth.net/2.1/>
- **OIDC:** <https://openid.net/connect/>

---

**Dica:** Adicione este arquivo aos favoritos do seu navegador para acesso rápido!
