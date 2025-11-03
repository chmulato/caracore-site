# Scripts CaraCore - Guia de Utilização

## Visão Geral

Esta pasta contém scripts essenciais para teste, validação e operação do sistema CaraCore após a limpeza e reorganização de novembro 2025.

## Arquitetura Atual - Pós Limpeza

**Scripts Ativos:** Apenas scripts essenciais mantidos (4 arquivos)
**Redução:** 87.5% dos scripts removidos (32 → 4)
**Backend Produção:** `caracore-backend.azurewebsites.net` (Azure App Service)

## Scripts Ativos

### `teste.py` - SCRIPT PRINCIPAL

**Função:** Script unificado de testes para todo o projeto CaraCore

**Funcionalidades:**
- **Testes HTTP:** Validação de páginas principais (index.html, secure/*)
- **Testes HTML:** Verificação de estrutura e conteúdo das páginas do sistema de gerenciamento de usuários
- **Testes JavaScript:** Execução automática via Jest dos testes unitários (quando Node.js disponível)
- **Relatório Consolidado:** Estatísticas detalhadas por categoria de teste

**Uso:**
```bash
cd D:\dev\site\cara-core
python scripts/teste.py
```

**Dependências:**
- Python 3.x (obrigatório)
- Node.js + npm/npx (opcional, para testes JS)

### `server.py` - SERVIDOR DE DESENVOLVIMENTO

**Função:** Servidor HTTP local para desenvolvimento

**Uso:**
```bash
python scripts/server.py
```

**Porta:** 8000 (padrão)

## Backend de Produção

### `backend/app.py` - BACKEND FLASK

**URL Produção:** `https://caracore-backend.azurewebsites.net`
**Funcionalidade:** OAuth 2.1 + OIDC com Google e Microsoft Entra ID

**Endpoints Principais:**
- `/health` - Health check
- `/oauth/google/token` - Token exchange Google
- `/oauth/microsoft/token` - Token exchange Microsoft
- `/auth/validate` - Validação de tokens

## Testes Automatizados

### Testes Unitários JavaScript

**Localização:** `/secure/testes/`
**Framework:** Jest com JSDOM
**Total:** 75 testes unitários

**Arquivos de Teste:**
- `super-admin-setup.test.js` - 15 testes
- `request-access-enhanced.test.js` - 18 testes
- `approval-requests.test.js` - 20 testes
- `user-management-navigation.test.js` - 22 testes

**Execução:**
```bash
cd secure/testes
npx jest
```

### `teste_caminho_feliz.py` - VALIDAÇÃO OIDC

**Função:** Validação automatizada completa do fluxo OAuth 2.1 + OpenID Connect

**Funcionalidades:**
- ✅ 64 validações automáticas do caminho feliz OIDC
- ✅ Suporte a Google e Microsoft Entra ID
- ✅ Validação PKCE obrigatória (OAuth 2.1)
- ✅ Verificação de claims JWT (iss, aud, exp, sub, iat)
- ✅ Métricas de performance e segurança
- ✅ Exportação de relatórios JSON

**Uso:**
```bash
cd secure/testes

# Teste com Google (padrão)
python teste_caminho_feliz.py

# Teste com Microsoft Entra ID
python teste_caminho_feliz.py --provider entra

# Gerar relatório JSON
python teste_caminho_feliz.py --output relatorio.json
```

**Dependências:**
```bash
pip install -r secure/testes/requirements.txt
```

## Cobertura Total de Testes

| Categoria | Testes | Ferramenta |
|-----------|--------|-----------|
| OAuth 2.1 + OIDC | 64 | `teste_caminho_feliz.py` |
| JavaScript UI | 75 | Jest |
| Páginas HTTP | 16 | `teste.py` |
| HTML Estrutura | 5 | `teste.py` |
| **TOTAL** | **160** | - |
```

## Limpeza Realizada (Novembro 2025)

### Scripts Removidos

**Total Removido:** 32 arquivos obsoletos incluindo:
- Scripts de deploy manuais
- Scripts de configuração Azure complexos
- Múltiplos scripts de teste específicos
- Scripts de verificação duplicados
- Utilitários de build obsoletos

### Justificativa

1. **Arquitetura Simplificada:** App Service Settings eliminou scripts de configuração complexos
2. **Testes Unificados:** `teste.py` substitui múltiplos scripts específicos  
3. **Deploy Automatizado:** GitHub Actions substitui scripts manuais
4. **Manutenibilidade:** Redução drástica de complexidade

## Comandos Essenciais

### Desenvolvimento Local
```bash
# Iniciar servidor de desenvolvimento
python scripts/server.py

# Executar todos os testes do projeto
python scripts/teste.py
```

### Validação OAuth 2.1 + OIDC
```bash
# Teste completo com Google (64 validações)
cd secure/testes
python teste_caminho_feliz.py

# Teste com Microsoft Entra ID
python teste_caminho_feliz.py --provider entra

# Teste com URL de produção
python teste_caminho_feliz.py --base-url "https://www.caracore.com.br"

# Gerar relatório detalhado
python teste_caminho_feliz.py --output relatorio.json
```

### Testes JavaScript
```bash
cd secure/testes
npx jest --coverage
```

## Documentação Complementar

- **README_PY.md** - Documentação técnica detalhada
- **../docs/BACKEND-CARACORE.md** - Documentação do backend
- **../secure/testes/EXECUTAR_TESTES.md** - Configuração Jest

## Estrutura Final

```
scripts/
├── README.md              # Este guia
├── README_PY.md           # Documentação técnica detalhada  
├── server.py              # Servidor de desenvolvimento
└── teste.py               # Script principal de testes
```
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

- Health check (`https://caracore-backend-docker.azurewebsites.net/health`)
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
