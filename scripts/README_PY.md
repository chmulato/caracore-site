# Inventário de Scripts Python - CaraCore

Este documento lista todos os scripts Python do repositório CaraCore, suas funções e inter-relacionamentos após a migração para arquitetura simplificada (outubro 2025).

## Arquitetura Atual - Pós Migração

**Recursos Azure Ativos:**

- `caracore-backend` (App Service)
- `caracore-plan` (App Service Plan)

**Arquitetura Simplificada:** Migração completa de Key Vault para App Service Settings, com redução de custos e complexidade.

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

**Função:** Backend Flask para troca de tokens OAuth (deployado como caracore-backend)

- Endpoint `/health` para verificação de saúde
- Endpoint `/oauth/google/token` para troca de código por token Google
- Endpoint `/oauth/microsoft/token` para troca de código por token Microsoft  
- Validação de ID tokens usando JWKS
- Suporte a CORS configurável
- **Deployed URL:** `caracore-backend.azurewebsites.net`

- **Relacionamentos:** Usado por `server.py` local e frontend OIDC em produção

## Scripts de Teste e Validação

### `endpoint_checks.py`

**Função:** Biblioteca comum para testes de endpoints

- Classe `CheckResult` para resultados de testes
- Funções helper para testes CORS, health check
- Validação de encaminhamento para provedores OAuth
- **Relacionamentos:** Usado por todos os scripts de teste

### `teste_end_point_azure.py`

**Função:** Suite completa de testes para API Azure (caracore-backend)

- Testes de health check no caracore-backend.azurewebsites.net
- Validação de App Service Settings (substituiu Key Vault)
- Testes CORS para Google e Microsoft
- Validação de campos obrigatórios
- Testes de encaminhamento OAuth

- **Relacionamentos:** Usa `endpoint_checks.py`

### `teste_end_point_local.py`

**Função:** Testes para backend local/desenvolvimento

- Similar ao Azure mas para ambiente local
- Testes com/sem configuração OAuth
- Validação de docker backend
- **Relacionamentos:** Usa `endpoint_checks.py`

### `smoke_teste_local.py`

**Função:** Testes rápidos para desenvolvimento local

- Validação básica de funcionalidade
- Auto-detecção de configuração
- **Relacionamentos:** Usa `teste_end_point_local.py`

### `validar_api_azure.py`

**Função:** Executor principal para todos os testes Azure

- Testes consolidados do caracore-backend
- Relatório consolidado de status
- **Relacionamentos:** Executa `teste_end_point_azure.py`

### `executar_testes_azure.py` / `executar_testes_azure_simples.py`

**Função:** Scripts executores alternativos para testes Azure

- Versões com/sem emojis Unicode
- **Relacionamentos:** Executam os scripts de teste

- **Relacionamentos:** Executam os scripts de teste

## Scripts de Deploy e Infraestrutura

### `infra_to_azure.py`

**Função:** Provisiona infraestrutura Azure para CaraCore

- Cria Resource Group, App Service Plan (`caracore-plan`), Web App (`caracore-backend`)
- Configura App Settings com Google Client Secret diretamente
- **Migração Key Vault → App Settings:** Simplificação completa da arquitetura
- Configuração CORS e HTTPS automática
- **Relacionamentos:** Pré-requisito para `deploy_to_azure.py`

### `deploy_to_azure.py`

**Função:** Deploy da aplicação para Azure App Service

- Gera backend.zip com dependências Python
- Upload via Azure CLI para caracore-backend
- Reinicialização opcional do App Service
- Execução opcional de smoke tests

- **Relacionamentos:** Usa `deploy_helpers.py`, executa `teste_end_point_azure.py`

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

## Scripts Arquivados (Migração 2025-10-11)

Os seguintes scripts foram movidos para `arquivo_migracao_2025_10_11/` após a migração para arquitetura simplificada:

### Scripts de Migração Arquivados

- `analisar_recursos_legados.py` - Análise de recursos para remoção
- `configurar_google_secret_azure.py` - Configuração Key Vault (obsoleto)
- `implantar_backend_azure.py` - Script de implantação usado na migração
- `plano_migracao_recursos.py` - Planejamento da migração executada
- `reconfigurar_azure_vars.ps1` - Reconfiguração PowerShell usada na migração
- `remover_recursos_redundantes.py` - Remoção de recursos legados executada
- `testar_configuracao_final.py` - Testes finais da migração

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
scripts/package_backend_with_docker.py OU deploy_helpers.py
    |
    v
deploy_to_azure.py -> caracore-backend.azurewebsites.net
    |
    v
validar_api_azure.py -> teste_end_point_azure.py
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
- `security/monitor_exe.py`
- `wi_fi/get_wi_fi.py`

---

**Total de Scripts Python Ativos:** 45 arquivos
**Scripts Arquivados:** 9 arquivos em `arquivo_migracao_2025_10_11/`
**Arquitetura:** Simplificada (App Service Settings, sem Key Vault)
**Última Atualização:** Campo Largo, 11 de outubro de 2025 
 
