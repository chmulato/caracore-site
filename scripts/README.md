# Scripts CaraCore - Guia de Utilização

## Visão Geral

Esta pasta contém scripts para teste, validação e operação do sistema CaraCore, incluindo o backend Flask deployado no Azure App Service (`caracore-backend.azurewebsites.net`).

## Arquitetura do Sistema

### Backend Flask (Produção)

- **URL:** `https://caracore-backend.azurewebsites.net`
- **Documentação:** [BACKEND-CARACORE.md](../docs/BACKEND-CARACORE.md)
- **Recursos Azure:** `caracore-backend` (App Service) + `caracore-plan` (Service Plan)
- **Funcionalidade:** Token exchange para Google OAuth e Microsoft Entra ID

### Desenvolvimento Local

- **Backend Local:** `backend/app.py` via Docker ou Python direto
- **Frontend:** Servido via `server.py` ou servidor HTTP estático
- **Testes:** Scripts automatizados para validação end-to-end

## Scripts de Teste OIDC

### Teste Interativo com Playwright

**Arquivo:** `test_oidc_login.py`

Playwright-based script que abre o site e clica nos botões de login Google e Microsoft, detectando navegação para provedores de autenticação.

#### Requisitos

- Python 3.8+
- Playwright e browsers:

```bash
python -m pip install playwright
python -m playwright install
```

#### Execução

```bash
# Teste com interface gráfica
python scripts/test_oidc_login.py

# Teste headless (CI/CD)
python scripts/test_oidc_login.py --headless

# Teste específico para Google OAuth
python scripts/test_oidc_login.py --provider google

# Teste específico para Microsoft Entra ID
python scripts/test_oidc_login.py --provider microsoft
```

#### Funcionalidades

- Detecta redirecionamento para Google OAuth
- Detecta redirecionamento para Microsoft Entra ID
- Valida CORS e preflight requests
- Testa callback handling
- Suporte a headless mode para CI/CD

### Validação de Endpoints HTTP

**Arquivo:** `validate_oidc_endpoints.py`

Script de validação HTTP-only que não precisa de browsers, ideal para ambientes de CI onde Playwright não está disponível.

#### Funcionalidades

- Testa endpoints do backend Flask
- Valida CORS headers
- Verifica health check (`/health`)
- Testa token exchange endpoints
- Validação de configuração OAuth

## Scripts de Operação Backend

### Testes de Endpoint Azure

**Arquivos:**

- `teste_end_point_azure.py` - Suite completa de testes para caracore-backend
- `executar_testes_azure.py` - Executor principal com relatórios
- `validar_api_azure.py` - Validação consolidada

#### Execução

```bash
# Teste completo do backend Azure
python scripts/teste_end_point_azure.py

# Execução com relatório detalhado
python scripts/executar_testes_azure.py --verbose

# Validação rápida
python scripts/validar_api_azure.py
```

#### Testes Realizados

- Health check (`https://caracore-backend.azurewebsites.net/health`)
- CORS preflight e headers
- Google OAuth token exchange
- Microsoft OAuth token exchange
- Validação de App Service Settings
- Error handling e responses

### Testes Locais

**Arquivos:**

- `teste_end_point_local.py` - Testes para desenvolvimento local
- `smoke_teste_local.py` - Testes rápidos de funcionalidade

#### Execução

```bash
# Testes locais completos
python scripts/teste_end_point_local.py

# Smoke tests rápidos
python scripts/smoke_teste_local.py
```

## Scripts de Deploy e Infraestrutura

### Infraestrutura Azure

**Arquivo:** `infra_to_azure.py`

Provisiona recursos Azure necessários para o CaraCore backend.

#### Recursos Criados

- Resource Group
- App Service Plan (`caracore-plan`)
- App Service (`caracore-backend`)
- App Service Settings (variáveis de ambiente)

#### Execução

```bash
python scripts/infra_to_azure.py
```

### Deploy da Aplicação

**Arquivo:** `deploy_to_azure.py`

Deploy do backend Flask para Azure App Service.

#### Funcionalidades

- Gera `backend.zip` com dependências
- Upload via Azure CLI
- Configuração automática de settings
- Restart do App Service
- Execução opcional de smoke tests

#### Execução

```bash
python scripts/deploy_to_azure.py
```

### Validação de Infraestrutura

**Arquivo:** `checklist_infra.py`

Valida recursos Azure e configurações.

#### Verificações

- Existência de `caracore-backend` e `caracore-plan`
- App Service Settings configurados
- CORS e HTTPS habilitados
- Health check responsivo

#### Execução

```bash
python scripts/checklist_infra.py
```

## Scripts de Monitoramento

### Cobertura de Testes OIDC

**Arquivo:** `validar_cobertura_ut_oidc.py`

Gera relatório de cobertura dos testes unitários OIDC.

#### Funcionalidades

- Análise de cobertura JavaScript
- Relatório HTML interativo
- Métricas de qualidade de código

#### Execução

```bash
python scripts/validar_cobertura_ut_oidc.py
```

### Executar Testes Unitários Secure

**Arquivo:** `executar_ut_secure.py`

Executa testes unitários da área secure (autenticação).

#### Funcionalidades

- Testes JavaScript via Node.js
- Interface web para execução
- Relatórios de resultado
- Suporte a headless mode

#### Execução

```bash
# Interface web
python scripts/executar_ut_secure.py

# Modo headless
python scripts/executar_ut_secure.py --headless

# Relatório em arquivo
python scripts/executar_ut_secure.py --output
```

## Scripts de Utilidades

### Empacotamento com Docker

**Arquivo:** `package_backend_with_docker.py`

Gera `backend.zip` com dependências Linux usando Docker.

#### Vantagens

- Dependências compatíveis com Azure App Service
- Build reproduzível
- Isolamento de ambiente

#### Execução

```bash
python scripts/package_backend_with_docker.py
```

### Snapshots e Diffs

**Arquivos:**

- `snapshot_and_diff.py` - Comparação de estados
- `generate_prod_diffs.py` - Diffs para produção

#### Funcionalidades

- Captura snapshots de arquivos
- Comparação entre versões
- Detecção de mudanças

## Documentação Adicional

### Documentos Relacionados

- [BACKEND-CARACORE.md](../docs/BACKEND-CARACORE.md) - Documentação técnica completa do backend
- [ARQUITETURA.md](../docs/ARQUITETURA.md) - Visão geral da arquitetura
- [DEPLOY.md](../docs/DEPLOY.md) - Guia de deploy e configuração

### Scripts Arquivados

- `arquivo_migracao_2025_10_11/` - Scripts da migração Key Vault para App Service Settings

### Configuração de Desenvolvimento

- Instalar dependências: `pip install -r requirements.txt`
- Configurar Azure CLI: `az login`
- Variáveis de ambiente: Ver [BACKEND-CARACORE.md](../docs/BACKEND-CARACORE.md)

## Notas Importantes

### Seletores de Página

O script `test_oidc_login.py` usa seletores CSS para detectar botões de login. Se sua página usa botões customizados, atualize os seletores na função `click_login_button`.

### Alternativas sem Browser

Se não puder instalar Playwright, use `validate_oidc_endpoints.py` que faz verificações HTTP-only.

### CI/CD Friendly

Todos os scripts suportam modo headless (`--headless`) para execução em pipelines de CI/CD.

---

**Última Atualização:** 11 de outubro de 2025  
**Backend Status:** Operacional em `caracore-backend.azurewebsites.net`
