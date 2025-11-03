# Inventário de Scripts - CaraCore

Este documento lista todos os scripts ativos do repositório CaraCore após a limpeza e reorganização de novembro 2025.

## Arquitetura Atual - Pós Limpeza (Novembro 2025)

**Scripts Ativos:** Apenas scripts essenciais mantidos
**Recursos Azure Ativos:**
- `caracore-backend` (App Service)
- `caracore-plan` (App Service Plan)

**Arquitetura Simplificada:** OAuth 2.1 + OIDC com frontend centralizado

## Scripts Ativos (Pasta /scripts)

### `teste.py` ✅ PRINCIPAL

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

**Saída:**
```
🚀 CaraCore - Execução Completa de Testes
==================================================

📄 Executando testes básicos de páginas...
🌐 Executando testes HTML...
🧪 Executando testes JavaScript...

📊 RELATÓRIO FINAL DE TESTES
🌐 Testes Básicos de Páginas: 6/6 passaram
📄 Testes HTML Específicos: 5/5 passaram
🧪 Testes JavaScript: X/X passaram

🎉 SUCESSO: Todos os testes críticos passaram!
```

**Páginas Testadas:**
- `/index.html` - Página inicial com link "Área 51"
- `/secure/index.html` - Login OAuth
- `/secure/callback.html` - Callback OAuth
- `/secure/restrita.html` - Área protegida
- `/secure/logout.html` - Logout
- `/secure/historia.html` - História da Área 51
- `/secure/super-admin-setup.html` - Configuração de super admin
- `/secure/request-access-enhanced.html` - Solicitação de acesso
- `/secure/approval-requests.html` - Aprovação de solicitações
- `/secure/testes/test-runner.html` - Test runner HTML

**Testes JavaScript Incluídos:**
- `super-admin-setup.test.js` - Testes de configuração inicial
- `request-access-enhanced.test.js` - Testes de solicitação de acesso
- `approval-requests.test.js` - Testes de aprovação
- `user-management-navigation.test.js` - Testes de navegação

**Dependências:**
- Python 3.x (obrigatório)
- Node.js + npm/npx (opcional, para testes JS)
- Jest (instalado automaticamente se Node.js disponível)

**Status:** ATIVO - Script principal de validação do projeto

### `server.py` ✅ ATIVO

**Função:** Servidor HTTP de desenvolvimento local

**Funcionalidades:**
- Serve arquivos estáticos do site
- Suporte a desenvolvimento local
- Integração com backend Docker (quando disponível)

**Uso:**
```bash
cd D:\dev\site\cara-core
python scripts/server.py
```

**Porta:** Padrão 8000
**Status:** ATIVO - Servidor de desenvolvimento

## Arquivos de Backend (Pasta /backend)

### `app.py` ✅ PRODUÇÃO

**Função:** Backend Flask OAuth 2.1 + OIDC (deployado como caracore-backend)

**Endpoints Principais:**
- `/health` - Health check básico
- `/health/detailed` - Health check avançado
- `/oauth/google/token` - Token exchange Google
- `/oauth/microsoft/token` - Token exchange Microsoft Entra ID
- `/auth/validate` - Validação de tokens
- `/auth/logout` - Logout seguro

**URL de Produção:** `caracore-backend.azurewebsites.net`
**Python Version:** 3.11
**WSGI Server:** Gunicorn

### `auth_manager.py`, `rate_limiter.py`, `security.py`

**Função:** Módulos de suporte para o backend Flask
- Autenticação OAuth 2.1
- Rate limiting
- Security headers

## Testes Unitários (Pasta /secure/testes)

### Arquivos de Teste JavaScript

**Framework:** Jest com JSDOM
**Cobertura:** Sistema completo de gerenciamento de usuários

**Arquivos Ativos:**
- `test-setup.js` - Configuração global e mocks
- `super-admin-setup.test.js` - 15 testes (configuração inicial)
- `request-access-enhanced.test.js` - 18 testes (solicitação de acesso)
- `approval-requests.test.js` - 20 testes (aprovação de solicitações)
- `user-management-navigation.test.js` - 22 testes (navegação)

**Total:** 75 testes unitários JavaScript

**Execução:**
```bash
cd D:\dev\site\cara-core\secure\testes
npm install
npx jest
```

### `teste_caminho_feliz.py` ✅ NOVO - VALIDAÇÃO OIDC

**Função:** Script automatizado de validação completa do fluxo OAuth 2.1 + OpenID Connect

**Funcionalidades:**
- **64 Validações Automáticas:** Cobertura completa do caminho feliz OIDC
- **10 Etapas Validadas:** Pré-requisitos até renovação de tokens
- **Múltiplos Provedores:** Suporte a Google e Microsoft Entra ID
- **PKCE Obrigatório:** Validação de segurança OAuth 2.1
- **Relatório Colorido:** Output detalhado com status visual
- **Exportação JSON:** Geração de relatórios estruturados
- **Métricas de Performance:** Medição de tempo de fluxo

**Validações por Etapa:**
1. **Pré-requisitos (4 testes):** client_id, redirect_uri, endpoints
2. **Autenticação (9 testes):** URL de autorização completa
3. **Consentimento (4 testes):** Fluxo de login
4. **Callback (4 testes):** Código de autorização
5. **Tokens (12 testes):** Troca de código por tokens
6. **Validação (8 testes):** Claims JWT (iss, aud, exp, sub, iat)
7. **Sessão (5 testes):** Estabelecimento de sessão
8. **Recursos (4 testes):** APIs protegidas
9. **Renovação (4 testes):** Refresh tokens
10. **Logs (5 testes):** Monitoramento e performance

**Uso Básico (Simulado):**
```bash
cd D:\dev\site\cara-core\secure\testes
python teste_caminho_feliz.py
```

**Uso Avançado:**
```bash
# Testar com Microsoft Entra ID
python teste_caminho_feliz.py --provider entra

# Testar com URL de produção
python teste_caminho_feliz.py --base-url "https://www.caracore.com.br"

# Gerar relatório JSON
python teste_caminho_feliz.py --output relatorio.json

# Teste com código real (após login manual)
python teste_caminho_feliz.py --code "4/0AanR..." --real-tokens
```

**Opções da Linha de Comando:**
- `--provider` / `-p`: Provedor OIDC (google/entra) [padrão: google]
- `--base-url` / `-u`: URL base da aplicação [padrão: http://localhost:8000]
- `--code` / `-c`: Código de autorização real
- `--real-tokens` / `-r`: Obter tokens reais do provedor
- `--output` / `-o`: Arquivo para relatório JSON

**Saída:**
```
================================================================================
TESTE AUTOMATIZADO - CAMINHO FELIZ OIDC
Provedor: GOOGLE | Base URL: http://localhost:8000
================================================================================

✅ [Pré-requisitos] 1.1: Aplicação cliente configurada com client_id válido
✅ [Autenticação] 2.7: URL contém code_challenge (PKCE)
✅ [Tokens] 5.8: Resposta contém id_token (JWT)
...

================================================================================
ESTATÍSTICAS:
  Total de testes: 64
  ✅ Aprovados: 64
  ❌ Reprovados: 0
  Taxa de sucesso: 100.0%
================================================================================

🎉 TESTE CONCLUÍDO COM SUCESSO!
```

**Dependências:**
```bash
pip install -r secure/testes/requirements.txt
```
- `requests>=2.31.0` - Requisições HTTP
- `PyJWT>=2.8.0` - Decodificação JWT
- `cryptography>=41.0.0` - Operações criptográficas

**Integração CI/CD:**
```yaml
- name: Teste Caminho Feliz OIDC
  run: |
    cd secure/testes
    pip install -r requirements.txt
    python teste_caminho_feliz.py --output relatorio.json
```

**Status:** ATIVO - Validação automatizada de segurança OAuth 2.1 + OIDC

## Scripts de Execução (Pasta /secure/testes)

### `run-tests.ps1` e `run-tests.sh`

**Função:** Scripts interativos para execução de testes JavaScript

**Funcionalidades:**
- Menu interativo
- Instalação automática de dependências
- Execução por categoria
- Modo watch para desenvolvimento
- Relatórios de cobertura

## Limpeza Realizada (Novembro 2025)

### Scripts Removidos

**Scripts Obsoletos de Deploy:**
- `deploy_to_azure.py`
- `deploy_production.py`
- `deploy_helpers.py`
- `deploy-github-pages.js`
- `package_backend_with_docker.py`
- `setup_github_deploy.ps1`

**Scripts Obsoletos de Configuração:**
- `configurar_backend_azure.py`
- `configurar_backend_local.py`
- `configure_azure_all_settings.ps1`
- `configure_azure_monitor.ps1`
- `checklist_infra.py`

**Scripts Obsoletos de Teste:**
- `test_oidc_login.py`
- `test_oidc_login_full.py`
- `validar_cobertura_ut_oidc.py`
- `validate_oidc_endpoints.py`
- `executar_ut_secure.py`

**Scripts Obsoletos de Verificação:**
- `verificar_backend_azure_simples.py`
- `verificar_configuracao_completa_entra.py`
- `verificar_producao.py`
- `verificar_status_redirect_uri.py`
- `diagnostico_auth_producao.py`

**Scripts Obsoletos de Utilitários:**
- `rollback.py`
- `snapshot_and_diff.py`
- `generate_prod_diffs.py`
- `index.py`
- `build.bat`
- `build.sh`

**Arquivos Obsoletos:**
- `oidc_coverage_report.html`
- `oidc_coverage_report.json`
- `scripts/secure/log-config.js`

**Total Removido:** 32 arquivos obsoletos

## Justificativa da Limpeza

### Motivos para Remoção

1. **Arquitetura Simplificada:** Migração para App Service Settings eliminou necessidade de scripts complexos de configuração
2. **Testes Unificados:** Script `teste.py` substitui múltiplos scripts de teste específicos
3. **Deploy Automatizado:** GitHub Actions substitui scripts manuais de deploy
4. **Manutenibilidade:** Redução drástica de complexidade e pontos de falha

### Benefícios

- **Redução de 32 → 4 scripts** (87.5% de redução)
- **Manutenção simplificada** 
- **Onboarding mais rápido** para novos desenvolvedores
- **Menos pontos de falha**
- **Documentação focada** em scripts essenciais

## Estrutura Final (Novembro 2025)

```
scripts/
├── README.md              # Documentação geral
├── README_PY.md           # Esta documentação detalhada
├── server.py              # Servidor de desenvolvimento
└── teste.py               # Script principal de testes

backend/
├── app.py                 # Backend Flask OAuth (produção)
├── auth_manager.py        # Módulos de autenticação
├── rate_limiter.py        # Rate limiting
└── security.py           # Security headers

secure/testes/
├── *.test.js              # 4 arquivos de teste JavaScript
├── test-setup.js          # Configuração Jest
├── teste_caminho_feliz.py # Validação OIDC automatizada (64 testes)
├── requirements.txt       # Dependências Python para testes OIDC
├── run-tests.ps1          # Script Windows
└── run-tests.sh           # Script Linux/Mac
```

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
# Validação completa do caminho feliz OIDC (Google)
cd secure/testes
python teste_caminho_feliz.py

# Validação com Microsoft Entra ID
python teste_caminho_feliz.py --provider entra

# Gerar relatório JSON
python teste_caminho_feliz.py --output relatorio.json
```

### Testes JavaScript (Opcional)
```bash
cd secure/testes
.\run-tests.ps1           # Windows
./run-tests.sh            # Linux/Mac
```

## Cobertura de Testes

### Testes Automatizados Ativos

| Categoria | Ferramenta | Testes | Cobertura |
|-----------|-----------|---------|-----------|
| **Páginas HTTP** | `teste.py` | 16 | 100% das páginas principais |
| **HTML Estrutura** | `teste.py` | 5 | Sistema de gerenciamento |
| **JavaScript UI** | Jest | 75 | Gerenciamento de usuários |
| **OAuth 2.1 + OIDC** | `teste_caminho_feliz.py` | 64 | Caminho feliz completo |
| **TOTAL** | - | **160** | **Fluxo completo validado** |

### Cobertura por Funcionalidade

#### Autenticação e Segurança (64 testes)
- ✅ Pré-requisitos OIDC (4 testes)
- ✅ Fluxo de autorização com PKCE (9 testes)
- ✅ Callback e código de autorização (4 testes)
- ✅ Troca de tokens (12 testes)
- ✅ Validação JWT (8 testes)
- ✅ Gerenciamento de sessão (5 testes)
- ✅ APIs protegidas (4 testes)
- ✅ Refresh tokens (4 testes)
- ✅ Logs e monitoramento (5 testes)
- ✅ Validação final (5 testes)

#### Interface do Usuário (75 testes)
- ✅ Configuração super admin (15 testes)
- ✅ Solicitação de acesso (18 testes)
- ✅ Aprovação de solicitações (20 testes)
- ✅ Navegação e fluxos (22 testes)

#### Páginas e Estrutura (21 testes)
- ✅ Páginas principais (16 testes)
- ✅ Estrutura HTML (5 testes)

## Status do Projeto

- ✅ **OAuth 2.1 + OIDC:** 100% funcional (64 validações automáticas)
- ✅ **Sistema de Usuários:** 100% funcional (75 testes unitários)
- ✅ **Testes Automatizados:** 160 testes totais
- ✅ **Segurança PKCE:** Validada automaticamente
- ✅ **Deploy Automatizado:** GitHub Actions
- ✅ **Scripts Limpos:** 87.5% de redução
- ✅ **Documentação Atualizada:** Refletindo nova estrutura

**Última Atualização:** 03/11/2025
**Versão:** 2.1 (Com validação OIDC automatizada)
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

### `backend/test_admin_logs.py` **[NOVO - Fase 3]**

**Função:** Testes automatizados para endpoints de auditoria

- Testa endpoint `/api/admin/logs`
- Validação de filtros (date, event_type)
- Validação de paginação (limit, offset)
- Testes de formato de resposta JSON
- **Relacionamentos:** Testa `backend/app.py` endpoints de auditoria

### `backend/validar_dashboard.py` **[NOVO - Fase 3]**

**Função:** Validação E2E completa da Fase 3

- **4 Testes Principais:**
  1. Test health_detailed - Valida endpoint `/health/detailed`
  2. Test admin_logs - Valida endpoint `/api/admin/logs`
  3. Test filters - Valida filtros por event_type
  4. Test pagination - Valida paginação (offset/limit)

- Testa contra Azure produção: `caracore-backend.azurewebsites.net`
- Validação completa de metadados de logs
- Verifica estrutura JSON de resposta
- **Status:** 4/4 testes passando
- **Relacionamentos:** Validação E2E de `backend/app.py` Fase 3

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

### `scripts/deploy_production.py` **[NOVO - Fase 3 CORE]**

**Função:** Script Python de deploy automatizado para produção

- **Verificações de Segurança:**
  - Verifica Azure CLI instalado e autenticado
  - Valida branch Git atual (avisa se não for main)
  - Detecta mudanças não commitadas
  - Execução opcional de testes via pytest

- **Workflow de Deploy:**
  1. Criar diretório de backups automaticamente
  2. Criar pacote ZIP excluindo __pycache__, logs, .env, .git
  3. Deploy via `az webapp deployment source config-zip`
  4. Aguardar 30s para warm-up do backend
  5. Health check (GET /health, valida status=ok)
  6. Teste de autenticação (GET /api/admin/logs, espera 401)
  7. Cleanup de arquivos temporários
  8. Log estruturado em JSON (backend/logs/deploys.jsonl)

- **Parâmetros:**
  - `--skip-tests`: Pular execução de testes pytest
  - `--force`: Forçar deploy mesmo com avisos (branch, uncommitted)
  - `--message`: Mensagem customizada do deploy

- **Logs de Deploy:**
  - Timestamp, branch, commit, commit message
  - Duração do deploy
  - Localização do backup

- **Output:**
  - Colorizado (ANSI) para melhor visualização
  - URLs de produção (backend, health, dashboard)
  - Comandos sugeridos para próximos passos

- **Relacionamentos:** Usa subprocess (Azure CLI, Git), zipfile, requests (health check), JSON logging

### `scripts/rollback.py` **[NOVO - Fase 3 CORE]**

**Função:** Script Python de rollback para versão anterior em emergência

- **Modos de Rollback:**
  - `--latest`: Reverte para último backup disponível
  - `--backup <arquivo>`: Reverte para backup específico
  - `--commit <hash>`: Reverte para commit Git específico (cria branch temporária)
  - `--list`: Lista backups e deploys disponíveis

- **Segurança:**
  - Confirmação obrigatória (digitar "ROLLBACK")
  - Backup de segurança antes de reverter (pre_rollback_*.zip)
  - Validação de existência de backup/commit

- **Workflow de Rollback:**
  1. Listar backups disponíveis (backups/*.zip)
  2. Confirmar operação com usuário
  3. Criar backup de segurança do estado atual
  4. Deploy do backup selecionado via config-zip
  5. Aguardar 30s para warm-up
  6. Health check pós-rollback

- **Integração com Logs:**
  - Lê backend/logs/deploys.jsonl
  - Mostra últimos 10 deploys com timestamp, branch, commit, mensagem
  - Correlaciona backups com deploys

- **Output:**
  - Interface colorizada (vermelho para destaque de perigo)
  - Lista formatada de backups e deploys
  - URLs de verificação pós-rollback

- **Relacionamentos:** Usa subprocess (Azure CLI, Git), requests (health check), importa funções de deploy_production.py para rollback via commit

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

## Scripts de Auditoria e Monitoramento **[FASE 3]**

### Sistema de Logs de Auditoria

**Localização:** `backend/logs/`

**Formato:** JSONL (JSON Lines) - um evento por linha

**Estrutura dos Logs:**

```json
{
  "timestamp": "2025-10-31T10:15:00Z",
  "event_type": "login",
  "status": "success",
  "provider": "google",
  "user_email": "usuario@exemplo.com",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "message": "Login realizado com sucesso"
}
```

**Eventos Registrados:**

- `login` - Tentativas de login (sucesso/falha)
- `logout` - Eventos de logout (local/federado)
- `token_exchange` - Troca de authorization code por token
- `token_refresh` - Renovação de tokens
- `validation` - Validações de token/sessão
- `error` - Erros do sistema

**Características:**

- Arquivos diários: `YYYY-MM-DD.jsonl`
- Retenção: 90 dias (configurável)
- Rotação automática: Pendente implementação
- Acesso: Via endpoint `/api/admin/logs`

**Relacionamentos:** Usado por `backend/app.py`, consumido por dashboard de auditoria

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
- `backend/test_admin_logs.py` - Testes de endpoints de auditoria **[Fase 3]**
- `backend/validar_dashboard.py` - Validação E2E completa **[Fase 3]**

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

- `backend/test_admin_logs.py` **[NOVO - Fase 3]**
- `backend/validar_dashboard.py` **[NOVO - Fase 3]**
- `scripts/teste_centralizacao_frontend.py`
- `scripts/teste_servidor_simplificado.py`
- `scripts/test_oidc_login.py`
- `scripts/test_oidc_login_full.py`
- `scripts/validate_oidc_endpoints.py`

**Arquivados (arquitetura anterior):**

- `endpoint_checks.py.deprecated`
- `teste_end_point_azure.py.deprecated`
- `teste_end_point_local.py.deprecated`
- `smoke_teste_local.py.deprecated`
- `validar_api_azure.py.deprecated`
- `executar_testes_azure.py.deprecated`
- `executar_testes_azure_simples.py.deprecated`

### **Deployment & Infrastructure:**

- `infra_to_azure.py`
- `deploy_to_azure.py`
- `deploy_helpers.py`
- `checklist_infra.py`
- `scripts/package_backend_with_docker.py`
- `scripts/deploy_production.py` **[NOVO - Fase 3 CORE]**
- `scripts/rollback.py` **[NOVO - Fase 3 CORE]**

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

## Fase 3 - Sistema de Auditoria (Outubro 2025)

### Novos Componentes:

**Backend:**

- ✅ Endpoint `/health/detailed` - Health check avançado (120 linhas)
- ✅ Endpoint `/api/admin/logs` - API de logs com paginação (100 linhas)
- ✅ Sistema de logs JSONL diários (`backend/logs/`)
- ✅ Metadados completos (timestamp, user, IP, provider, event_type)

**Frontend:**

- ✅ Dashboard de Auditoria (`secure/admin-logs.html` - 330 linhas)
- ✅ JavaScript do Dashboard (`secure/js/audit-dashboard.js` - 462 linhas)
- ✅ Filtros dinâmicos (data, tipo de evento, busca)
- ✅ Paginação client-side (100 logs/página)
- ✅ Export JSON e CSV
- ✅ Integração com wiki Área 51

**Testes:**

- ✅ `backend/test_admin_logs.py` - Testes de endpoints de auditoria (102 linhas)
- ✅ `backend/validar_dashboard.py` - Validação E2E (249 linhas, 4/4 testes passando)

**Documentação:**

- ✅ `docs/AZURE_DEPLOY.md` - Guia completo de deploy
- ✅ `docs/fases/fase-3/README.md` - Documentação da Fase 3
- ✅ `docs/fases/fase-3/RESUMO-EXECUTIVO.md` - Resumo executivo
- ✅ `docs/fases/fase-3/acompanhamento-fase-3.md` - Tracking detalhado

**Status Fase 3:**

- Item 6 (Auditoria): 95% concluído
- Item 7 (Backend Azure): 90% concluído
- Item 9 (Testes): 30% concluído
- **Progresso Fase 3 Total: 70%**
- **Progresso Fase 3 CORE: 30%** (VERSOES.md ✅, deploy_production.py ✅, rollback.py ✅)

**Fase 3 CORE - Scripts de Automação:**

- ✅ `docs/VERSOES.md` - Documentação de versões de dependências (Python, Flask, Gunicorn, etc.)
- ✅ `scripts/deploy_production.py` - Deploy automatizado Python (350+ linhas)
- ✅ `scripts/rollback.py` - Rollback automatizado Python (350+ linhas)
- ⏳ `scripts/deploy_staging.py` - Deploy para staging (pendente)
- ⏳ Ambiente staging no Azure (pendente)
- ⏳ Azure Monitor + Application Insights (pendente)
- ⏳ Consolidação de documentação (pendente)

**Pendências Fase 3:**

- Rotação automática de logs (4h)
- Testes E2E automatizados (3 dias)
- CI/CD Pipeline (GitHub Actions)

**Pendências Fase 3 CORE (10h restantes):**

- Deploy staging script (2h)
- Ambiente staging Azure (2h)
- Azure Monitor configuração (2h)
- Consolidação documentação (2h)
- Atualizar STATUS-ATUAL.md (30min)

---

**Total de Scripts Python Ativos:** 53 arquivos (+4 novos: VERSOES.md, deploy_production.py, rollback.py)
**Scripts Removidos:** 7 scripts de teste da arquitetura anterior
**Arquitetura:** Simplificada (App Service Settings, sem Key Vault)
**Backend:** OAuth 2.1 + OIDC com PKCE, rate limiting, security headers, **auditoria completa**
**Deploy:** Azure CLI com validação automática + **scripts Python automatizados**
**Rollback:** **Sistema de rollback automatizado com backups e commits Git**
**CSS/JS:** Centralizado em pastas /secure/css/ e /secure/js/ (out/2025)
**Testes:** Framework unittest para validação + testes E2E de auditoria
**Auditoria:** Sistema de logs JSONL com dashboard avançado **[Fase 3]**
**Python Version:** 3.11 (Azure App Service), 3.13.7 (local dev)
**WSGI Server:** Gunicorn com timeout 600s
**Última Atualização:** Campo Largo, Sábado, 01 de novembro de 2025 - Fase 3 (70%), Fase 3 CORE (30%)
