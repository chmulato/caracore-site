# Inventário de Scripts Python - CaraCore

Este documento lista todos os scripts Python do repositório CaraCore, suas funções e inter-relacionamentos após a migração para arquitetura simplificada (outubro 2025).

## Arquitetura Atual - Pós Migração

**Recursos Azure Ativos:**

- `caracore-backend` (App Service)
- `caracore-plan` (App Service Plan)

**Arquitetura Simplificada:** Migração completa de Key Vault para App Service Settings, com redução de custos e complexidade.
**Frontend Otimizado:** CSS/JS centralizado em pastas dedicadas com controle de versão (v=20251012).

## Arquivos Principais (Raiz)

### `server.py`

**Função:** Servidor HTTP principal do projeto com suporte a OIDC

- Serve arquivos estáticos do site
- Implementa endpoints OAuth para Google e Microsoft
- Gerencia integração com backend local via Docker
- Suporte a logs estruturados e rotação
- Auto-inicialização do backend via Docker Compose

- **Relacionamentos:** Usa `backend/app.py`, interage com Docker

### `backend/app.py`

**Função:** Backend Flask OAuth 2.1 + OIDC (deployado como caracore-backend)

- **Endpoints de Autenticação:**
  - `/health` - Health check
  - `/oauth/google/token` - Token exchange Google
  - `/oauth/microsoft/token` - Token exchange Microsoft Entra ID
  - `/auth/validate` - Validação de tokens
  - `/auth/token/refresh` - Refresh de tokens
  - `/auth/logout` - Logout seguro
  - `/api/consent/register` - Registro de consentimento
  - `/api/consent/revoke` - Revogação de consentimento

- **Segurança:**
  - PKCE (S256) obrigatório
  - Validação JWKS automática
  - Rate limiting (10-30 req/min por endpoint)
  - HTTPS enforcement
  - Security headers (CSP, HSTS, X-Frame-Options)
  - CORS configurável
  - Audit logging

- **Módulos:**
  - `auth_manager.py` - PKCEValidator, TokenValidator, AuditLogger
  - `rate_limiter.py` - Rate limiting por IP
  - `security.py` - Headers e HTTPS enforcement
  - `startup.txt` - Gunicorn startup command

- **Deployed URL:** `caracore-backend.azurewebsites.net`
- **Python Version:** 3.11
- **WSGI Server:** Gunicorn (timeout 600s)

- **Relacionamentos:** Usado por `server.py` local e frontend OIDC em produção

### `backend/auth_manager.py`

**Função:** Gerenciamento de autenticação OAuth 2.1 + OIDC

- **PKCEValidator:** Validação de code_verifier vs code_challenge (S256)
- **TokenValidator:** Validação de ID tokens usando JWKS
- **AuditLogger:** Logging estruturado de eventos de autenticação
- Cache de JWKS com TTL configurável (600s padrão)
- Suporte a Google OAuth2 e Microsoft Entra ID

- **Relacionamentos:** Usado por `backend/app.py`

### `backend/rate_limiter.py`

**Função:** Rate limiting para proteção de APIs

- Limite por IP e por endpoint
- Configurações: 10-30 requisições por minuto
- Resposta HTTP 429 quando limite excedido
- Cleanup automático de registros antigos

- **Relacionamentos:** Usado por `backend/app.py`

### `backend/security.py`

**Função:** Security headers e enforcement

- HTTPS enforcement (redirect automático)
- Content Security Policy (CSP)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options, X-Content-Type-Options
- Referrer-Policy

- **Relacionamentos:** Usado por `backend/app.py`

### `backend/startup.txt`

**Função:** Comando de inicialização do Gunicorn no Azure

- Conteúdo: `gunicorn --bind=0.0.0.0 --timeout 600 app:app`
- Usado pelo Azure App Service para iniciar a aplicação
- Timeout de 600s para operações OAuth

- **Relacionamentos:** Referenciado por `deploy_to_azure.py`

## Scripts de Teste e Validação

### `endpoint_checks.py` (ARQUIVADO)

**Função:** (Obsoleto - Arquitetura Anterior)

- Substituído por novos testes compatíveis com a arquitetura simplificada
- Arquivo original disponível em `arquivados_testes_2025_10_12/endpoint_checks.py.deprecated`
- **Motivo:** Incompatível com a arquitetura simplificada (outubro 2025)

### `teste_end_point_azure.py` (ARQUIVADO)

**Função:** (Obsoleto - Arquitetura Anterior)

- Substituído por novos testes compatíveis com a arquitetura simplificada
- Arquivo original disponível em `arquivados_testes_2025_10_12/teste_end_point_azure.py.deprecated`
- **Motivo:** Incompatível com a arquitetura simplificada (outubro 2025)

### `teste_end_point_local.py` (ARQUIVADO)

**Função:** (Obsoleto - Arquitetura Anterior)

- Substituído por novos testes compatíveis com a arquitetura simplificada
- Arquivo original disponível em `arquivados_testes_2025_10_12/teste_end_point_local.py.deprecated`
- **Motivo:** Incompatível com a arquitetura simplificada (outubro 2025)

### `smoke_teste_local.py` (ARQUIVADO)

**Função:** (Obsoleto - Arquitetura Anterior)

- Substituído por novos testes compatíveis com a arquitetura simplificada
- Arquivo original disponível em `arquivados_testes_2025_10_12/smoke_teste_local.py.deprecated`
- **Motivo:** Incompatível com a arquitetura simplificada (outubro 2025)

### `validar_api_azure.py` (ARQUIVADO)

**Função:** (Obsoleto - Arquitetura Anterior)

- Substituído por novos testes compatíveis com a arquitetura simplificada
- Arquivo original disponível em `arquivados_testes_2025_10_12/validar_api_azure.py.deprecated`
- **Motivo:** Incompatível com a arquitetura simplificada (outubro 2025)

### `executar_testes_azure.py` / `executar_testes_azure_simples.py` (ARQUIVADO)

**Função:** (Obsoleto - Arquitetura Anterior)

- Substituído por novos testes compatíveis com a arquitetura simplificada
- Arquivos originais disponíveis em `arquivados_testes_2025_10_12/`
- **Motivo:** Incompatível com a arquitetura simplificada (outubro 2025)

### `teste_centralizacao_frontend.py`

**Função:** Testes unitários para centralização de frontend

- Framework unittest para validação sistemática
- Verificação de existência de diretórios e arquivos
- Validação de referências em HTML com parâmetros de versão
- Detecção de CSS/JS inline não permitido
- Testes automatizados compatíveis com nova arquitetura

- **Relacionamentos:** Complementa `verificar_centralizacao.py`

### `teste_servidor_simplificado.py`

**Função:** Testes de inicialização do servidor na arquitetura simplificada

- Inicialização e verificação do servidor local sem dependência Docker
- Validação de acesso a arquivos estáticos (CSS/JS centralizados)
- Verificação da área segura do site
- Compatível com nova arquitetura (pós migração outubro/2025)

- **Relacionamentos:** Substitui `smoke_teste_local.py` para nova arquitetura

## Scripts de Deploy e Infraestrutura

### `infra_to_azure.py`

**Função:** Provisiona infraestrutura Azure para CaraCore

- Cria Resource Group, App Service Plan (`caracore-plan`), Web App (`caracore-backend`)
- Configura App Settings com Google Client Secret diretamente
- **Migração Key Vault → App Settings:** Simplificação completa da arquitetura
- Configuração CORS e HTTPS automática
- **Relacionamentos:** Pré-requisito para `deploy_to_azure.py`

### `deploy_to_azure.py`

**Função:** Deploy da aplicação para Azure App Service (caracore-backend)

- Gera backend.zip com dependências Python em `.python_packages`
- Upload via Azure CLI (`az webapp deployment source config-zip`)
- Validação automática de App Settings críticos (OAuth, secrets)
- Verificação e configuração do startup command (gunicorn)
- Reinicialização opcional do App Service
- Execução opcional de smoke tests pós-deploy

- **Configurações validadas:**
  - `APP_SECRET_KEY`, `ORIGIN_ALLOWED`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `TENANT_ID`, `CLIENT_ID`, `CLIENT_SECRET`
  - `OAUTH_REDIRECT_URI`, `COOKIE_SECURE`

- **Opções de deploy:**
  - `--set-startup-command`: Configura gunicorn automaticamente
  - `--restart`: Reinicia após deploy
  - `--run-tests`: Executa smoke tests
  - `--bundle-backend-deps`: Instala dependências (padrão: habilitado)

- **Exemplo de uso:**

  ```powershell
  # Deploy completo com validação e restart
  python scripts/deploy_to_azure.py --set-startup-command --restart
  
  # Deploy com smoke tests
  python scripts/deploy_to_azure.py --restart --run-tests --tests-wait 10
  
  # Deploy rápido (ZIP pré-existente)
  python scripts/deploy_to_azure.py --zip backend.zip --restart
  ```

- **Relacionamentos:** Usa `deploy_helpers.py`, requer `backend/startup.txt`

### `deploy_helpers.py`

**Função:** Funções auxiliares para deploy

- Funções para construir backend.zip
- Empacotamento de dependências Python

- **Relacionamentos:** Usado por `deploy_to_azure.py`

### `checklist_infra.py`

**Função:** Validação de infraestrutura Azure

- Verifica existência de recursos Azure (caracore-backend, caracore-plan)
- Validação de configurações App Service Settings
- Health check opcional no caracore-backend.azurewebsites.net

- **Relacionamentos:** Complementa `infra_to_azure.py`

## Scripts de Otimização e Frontend

### `scripts/verificar_centralizacao.py`

**Função:** Validação da estratégia de centralização de CSS/JS

- Verifica a existência e integridade de arquivos centralizados:
  - `/secure/css/` - secure-layout.css, secure-restrita.css, secure-callback.css, secure-logout.css, secure-admin-logs.css
  - `/secure/js/` - nav-controls.js, secure-auth-ui.js, callback-helpers.js, admin-logs.js
- Validação de referências corretas nos arquivos HTML com regex
- Verificação de parâmetros de versão (v=20251012) para controle de cache
- Identificação de referências ausentes ou incorretas
- **Relacionamentos:** Independente, parte da estratégia de otimização

### `scripts/diagnostico_auth_producao.py`

**Função:** Diagnóstico de problemas de autenticação OIDC

- Análise de arquivos de configuração JavaScript em produção
- Identificação de problemas com URIs de redirecionamento
- Detecção de loops de refresh em auth-force-recognition.js
- Validação de Client IDs Google/Microsoft
- Verificações de cross-domain para autenticação

- **Relacionamentos:** Independente, auxilia na correção de problemas de autenticação

## Scripts de Utilidades e Ferramentas

### `organizar_scripts_pos_migracao.py`

**Função:** Ferramenta de organização pós-migração

- Categoriza scripts por função (migração, operacional, descontinuado)
- Move scripts de migração para arquivo histórico
- Remove scripts obsoletos com backup
- **Relacionamentos:** Script de manutenção executado uma vez após migração

### `verificar_referencias_legadas.py`

**Função:** Validação de referências a recursos antigos

- Verifica menções a api-caracore, kv-api-caracore, plan-caracore
- Identifica arquivos que ainda referenciam arquitetura legada
- **Relacionamentos:** Script de validação pós-migração

### `scripts/package_backend_with_docker.py`

**Função:** Empacotamento do backend com dependências Linux

- Usa container Docker python:3.11-bullseye
- Gera dependências compatíveis com Azure App Service
- Cria backend.zip pronto para deploy
- **Relacionamentos:** Alternativa ao processo manual de deploy

### `scripts/test_oidc_login.py` / `scripts/test_oidc_login_full.py`

**Função:** Testes de fluxo OIDC completo

- Simulação de login Google/Microsoft
- Validação de tokens
- **Relacionamentos:** Testa integração com `backend/app.py`

### `scripts/validate_oidc_endpoints.py`

**Função:** Validação específica de endpoints OIDC

- Testes focados em OAuth flows

- **Relacionamentos:** Similar aos testes de endpoint

### `scripts/snapshot_and_diff.py`

**Função:** Comparação de estados do projeto

- Captura snapshots de arquivos
- Gera diffs entre versões

- **Relacionamentos:** Ferramenta de monitoramento independente

### `scripts/generate_prod_diffs.py`

**Função:** Gera diffs para ambiente de produção

- Comparação entre desenvolvimento e produção
- **Relacionamentos:** Complementa `snapshot_and_diff.py`

### `scripts/verificar_centralizacao.py`

**Função:** Validação da centralização de CSS e JS

- Verifica existência dos arquivos CSS/JS centralizados
- Valida referências corretas nos arquivos HTML
- Verificação de parâmetros de versão (v=20251012)

- **Relacionamentos:** Script independente de validação

### `scripts/teste_centralizacao_frontend.py`

**Função:** Testes unitários para centralização de frontend

- Framework unittest para validação sistemática
- Verificação de existência de diretórios e arquivos
- Validação de referências em HTML com parâmetros de versão
- Detecção de CSS/JS inline não permitido
- Testes automatizados compatíveis com nova arquitetura

- **Relacionamentos:** Complementa `verificar_centralizacao.py`

### `scripts/teste_servidor_simplificado.py`

**Função:** Testes de inicialização do servidor na arquitetura simplificada

- Inicialização e verificação do servidor local sem dependência Docker
- Validação de acesso a arquivos estáticos (CSS/JS centralizados)
- Verificação da área segura do site
- Compatível com nova arquitetura (pós migração outubro/2025)

- **Relacionamentos:** Substitui `smoke_teste_local.py` para nova arquitetura

### `scripts/diagnostico_auth_producao.py`

**Função:** Diagnóstico de problemas de autenticação em produção

- Análise de configuração OIDC em produção
- Validação de URIs de redirecionamento
- Detecção de loops de refresh infinito
- Verificação de Client IDs

- **Relacionamentos:** Ferramenta independente de diagnóstico

## Scripts Arquivados

### Scripts de Migração (2025-10-11)

Os seguintes scripts foram movidos para `arquivo_migracao_2025_10_11/` após a migração para arquitetura simplificada:

- `analisar_recursos_legados.py` - Análise de recursos para remoção
- `configurar_google_secret_azure.py` - Configuração Key Vault (obsoleto)
- `implantar_backend_azure.py` - Script de implantação usado na migração
- `plano_migracao_recursos.py` - Planejamento da migração executada
- `reconfigurar_azure_vars.ps1` - Reconfiguração PowerShell usada na migração
- `remover_recursos_redundantes.py` - Remoção de recursos legados executada
- `testar_configuracao_final.py` - Testes finais da migração

### Scripts de Teste Removidos (2025-10-12)

Os seguintes scripts foram completamente removidos por incompatibilidade com a nova arquitetura:

- `endpoint_checks.py` - Biblioteca para testes de endpoints (arquitetura anterior)
- `teste_end_point_azure.py` - Testes para API Azure na arquitetura anterior
- `teste_end_point_local.py` - Testes para backend local na arquitetura anterior
- `smoke_teste_local.py` - Testes de fumaça para ambiente local
- `validar_api_azure.py` - Executor de testes Azure 
- `executar_testes_azure.py` - Scripts executores de testes Azure
- `executar_testes_azure_simples.py` - Versão simplificada de execução de testes

**Razão da Remoção:** Incompatibilidade com a nova arquitetura simplificada. Substituídos por:
- `teste_centralizacao_frontend.py` - Testes unitários para centralização de frontend
- `teste_servidor_simplificado.py` - Testes de inicialização sem dependência Docker

- `endpoint_checks.py.deprecated` - Biblioteca para testes de endpoints (arquitetura anterior)
- `teste_end_point_azure.py.deprecated` - Testes para API Azure na arquitetura anterior
- `teste_end_point_local.py.deprecated` - Testes para backend local na arquitetura anterior
- `smoke_teste_local.py.deprecated` - Testes de fumaça para ambiente local
- `validar_api_azure.py.deprecated` - Executor de testes Azure 
- `executar_testes_azure.py.deprecated` - Scripts executores de testes Azure
- `executar_testes_azure_simples.py.deprecated` - Versão simplificada de execução de testes

**Razão do Arquivamento:** Incompatibilidade com a nova arquitetura simplificada. Substituídos por:
- `teste_centralizacao_frontend.py` - Testes unitários para centralização de frontend
- `teste_servidor_simplificado.py` - Testes de inicialização sem dependência Docker

### Scripts Descontinuados

- `teste_keyvault_azure.py.deprecated` - Testes Key Vault (não mais necessário)
- `teste_keyvault_simples.py.deprecated` - Versão simplificada Key Vault (descontinuado)

**Razão do Arquivamento:** Migração completa de Azure Key Vault para App Service Settings, simplificando a arquitetura e reduzindo custos (~$0.30/mês).

## Scripts de Documentacao

### `handbook/HANDBOOK.py`

**Funcao:** Converte documentacao Markdown para HTML

- Conversao automatizada usando Pandoc
- CSS responsivo para dispositivos moveis
- Normalizacao de ancoras internas
- **Relacionamentos:** Processa arquivos .md do handbook

### `handbook/SERVICEGUIDE.py`

**Funcao:** Similar ao HANDBOOK.py para guias de servico

- Conversao especializada para guias tecnico

- **Relacionamentos:** Complementa `HANDBOOK.py`

## Scripts de Seguranca e Monitoramento

### `security/monitor_exe.py`

**Funcao:** Monitoramento de execucao de processos

- Deteccao de executaveis suspeitos
- Logs de seguranca
- **Relacionamentos:** Sistema independente de monitoramento

### `wi_fi/get_wi_fi.py`

**Funcao:** Utilitario para informacoes de rede Wi-Fi

- Coleta dados de rede
- **Relacionamentos:** Ferramenta auxiliar independente

## Scripts Diversos

### `teste.py`

**Funcao:** Script de teste generico/experimentacao

- Testes ad-hoc durante desenvolvimento
- **Relacionamentos:** Arquivo de trabalho temporario

## Fluxo de Relacionamentos Principais

### Desenvolvimento Local

```text
server.py -> backend/app.py -> Docker containers
    |
    v
smoke_teste_local.py -> teste_end_point_local.py -> endpoint_checks.py
```

### Deploy para Azure (Arquitetura Simplificada)

```text
infra_to_azure.py (provisiona caracore-plan + caracore-backend)
    |
    v
[Configurar App Settings via Azure CLI]
az webapp config appsettings set --name caracore-backend ...
    |
    v
deploy_to_azure.py (valida configs + startup.txt)
    |
    v
deploy_helpers.py (bundle_backend_dependencies + build_backend_zip)
    |
    v
az webapp deployment source config-zip
    |
    v
caracore-backend.azurewebsites.net (Python 3.11 + Gunicorn)
    |
    v
[Smoke Tests Opcionais]
teste_end_point_azure.py
```

### Validação de Produção

```text
checklist_infra.py (valida caracore-backend + caracore-plan)
    |
    v
teste_end_point_azure.py -> endpoint_checks.py
    |
    v
caracore-backend.azurewebsites.net/health (App Service Settings)
```

## Dependências Externas Principais

- **Flask**: Backend web (`backend/app.py`)
- **Requests**: Testes HTTP (scripts de teste)
- **Azure SDK**: Gerenciamento de infraestrutura (`infra_to_azure.py`)
- **Docker**: Empacotamento (`scripts/package_backend_with_docker.py`)
- **Pandoc**: Conversão de documentação (`handbook/*.py`)

## Scripts por Categoria

### **Core Application:**

- `server.py` (desenvolvimento local)
- `backend/app.py` (produção: caracore-backend.azurewebsites.net)

### **Testing & Validation:**

- `endpoint_checks.py`
- `teste_end_point_azure.py`
- `teste_end_point_local.py`
- `smoke_teste_local.py`
- `validar_api_azure.py`
- `executar_testes_azure.py`
- `executar_testes_azure_simples.py`

### **Deployment & Infrastructure:**

- `infra_to_azure.py`
- `deploy_to_azure.py`
- `deploy_helpers.py`
- `checklist_infra.py`
- `scripts/package_backend_with_docker.py`

### **Migration & Organization:**

- `organizar_scripts_pos_migracao.py`
- `verificar_referencias_legadas.py`

### **Documentation:**

- `handbook/HANDBOOK.py`
- `handbook/SERVICEGUIDE.py`

### **Utilities:**

- `scripts/snapshot_and_diff.py`
- `scripts/generate_prod_diffs.py`
- `scripts/verificar_centralizacao.py`
- `scripts/teste_centralizacao_frontend.py`
- `scripts/teste_servidor_simplificado.py`
- `scripts/diagnostico_auth_producao.py`
- `security/monitor_exe.py`
- `wi_fi/get_wi_fi.py`

---

**Total de Scripts Python Ativos:** 49 arquivos
**Scripts Arquivados:** 9 arquivos em `arquivo_migracao_2025_10_11/`
**Scripts Removidos:** 7 scripts de teste da arquitetura anterior
**Arquitetura:** Simplificada (App Service Settings, sem Key Vault)
**Backend:** OAuth 2.1 + OIDC com PKCE, rate limiting, security headers
**Deploy:** Azure CLI com validação automática de configurações
**CSS/JS:** Centralizado em pastas /secure/css/ e /secure/js/ (out/2025)
**Testes Frontend:** Framework unittest para validação da centralização
**Python Version:** 3.11 (Azure App Service)
**WSGI Server:** Gunicorn com timeout 600s
**Última Atualização:** Campo Largo, 30 de outubro de 2025
 
 
