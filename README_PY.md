# Inventario de Scripts Python - CaraCore

Este documento lista todos os scripts Python do repositorio CaraCore, suas funcoes e inter-relacionamentos.

## Arquivos Principais (Raiz)

### `server.py`

**Funcao:** Servidor HTTP principal do projeto com suporte a OIDC

- Serve arquivos estaticos do site
- Implementa endpoints OAuth para Google e Microsoft
- Gerencia integracao com backend Docker
- Suporte a logs estruturados e rotacao
- Auto-inicializacao do backend via Docker Compose

- **Relacionamentos:** Usa `backend/app.py`, interage com Docker

### `backend/app.py`

**Funcao:** Backend Flask para troca de tokens OAuth

- Endpoint `/health` para verificacao de saude
- Endpoint `/oauth/google/token` para troca de codigo por token Google
- Endpoint `/oauth/microsoft/token` para troca de codigo por token Microsoft
- Validacao de ID tokens usando JWKS
- Suporte a CORS configuravel

- **Relacionamentos:** Usado por `server.py`, complementa frontend OIDC

## Scripts de Teste e Validacao

### `endpoint_checks.py`

**Funcao:** Biblioteca comum para testes de endpoints

- Classe `CheckResult` para resultados de testes
- Funcoes helper para testes CORS, health check
- Validacao de encaminhamento para provedores OAuth
- **Relacionamentos:** Usado por todos os scripts de teste

### `teste_end_point_azure.py`

**Funcao:** Suite completa de testes para API Azure

- Testes de health check
- Validacao de integracao Key Vault
- Testes CORS para Google e Microsoft
- Validacao de campos obrigatorios
- Testes de encaminhamento OAuth

- **Relacionamentos:** Usa `endpoint_checks.py`

### `teste_end_point_local.py`

**Funcao:** Testes para backend local/desenvolvimento

- Similar ao Azure mas para ambiente local
- Testes com/sem configuracao OAuth
- Validacao de docker backend
- **Relacionamentos:** Usa `endpoint_checks.py`

### `teste_keyvault_azure.py`

**Funcao:** Teste especifico para integracao Azure Key Vault

- Valida se GOOGLE_CLIENT_SECRET esta carregando do Key Vault
- Analise de respostas de erro para determinar status de configuracao
- **Relacionamentos:** Funciona independente, complementa `teste_end_point_azure.py`

### `teste_keyvault_simples.py`

**Funcao:** Versao simplificada do teste Key Vault (compativel Windows)

- Mesma funcionalidade que `teste_keyvault_azure.py` sem emojis Unicode

- **Relacionamentos:** Alternativa a `teste_keyvault_azure.py`

### `smoke_teste_local.py`

**Funcao:** Testes rapidos para desenvolvimento local

- Validacao basica de funcionalidade
- Auto-deteccao de configuracao
- **Relacionamentos:** Usa `teste_end_point_local.py`

### `validar_api_azure.py`

**Funcao:** Executor principal para todos os testes Azure

- Combina teste Key Vault + endpoints
- Relatorio consolidado de status
- **Relacionamentos:** Executa `teste_keyvault_simples.py` e `teste_end_point_azure.py`

### `executar_testes_azure.py` / `executar_testes_azure_simples.py`

**Funcao:** Scripts executores alternativos para testes Azure

- Versoes com/sem emojis Unicode

- **Relacionamentos:** Executam os scripts de teste

## Scripts de Deploy e Infraestrutura

### `infra_to_azure.py`

**Funcao:** Provisiona infraestrutura Azure para CaraCore

- Cria Resource Group, App Service Plan, Web App
- Configura App Settings e variaveis de ambiente
- Integracao opcional com Azure Key Vault
- Configuracao CORS e HTTPS
- **Relacionamentos:** Prerequisito para `deploy_to_azure.py`

### `deploy_to_azure.py`

**Funcao:** Deploy da aplicacao para Azure App Service

- Gera backend.zip com dependencias
- Upload via Azure CLI
- Reinicializacao opcional do App Service
- Execucao opcional de smoke tests

- **Relacionamentos:** Usa `deploy_helpers.py`, executa `teste_end_point_azure.py`

### `deploy_helpers.py`

**Funcao:** Funcoes auxiliares para deploy

- Funcoes para construir backend.zip
- Empacotamento de dependencias Python

- **Relacionamentos:** Usado por `deploy_to_azure.py`

### `checklist_infra.py`

**Funcao:** Validacao de infraestrutura Azure

- Verifica existencia de recursos Azure
- Validacao de configuracoes
- Health check opcional

- **Relacionamentos:** Complementa `infra_to_azure.py`

## Scripts de Utilidades e Ferramentas

### `scripts/package_backend_with_docker.py`

**Funcao:** Empacotamento do backend com dependencias Linux

- Usa container Docker python:3.11-bullseye
- Gera dependencias compativeis com Azure App Service
- Cria backend.zip pronto para deploy
- **Relacionamentos:** Alternativa ao processo manual de deploy

### `scripts/test_oidc_login.py` / `scripts/test_oidc_login_full.py`

**Funcao:** Testes de fluxo OIDC completo

- Simulacao de login Google/Microsoft
- Validacao de tokens
- **Relacionamentos:** Testa integracao com `backend/app.py`

### `scripts/validate_oidc_endpoints.py`

**Funcao:** Validacao especifica de endpoints OIDC

- Testes focados em OAuth flows

- **Relacionamentos:** Similar aos testes de endpoint

### `scripts/snapshot_and_diff.py`

**Funcao:** Comparacao de estados do projeto

- Captura snapshots de arquivos
- Gera diffs entre versoes

- **Relacionamentos:** Ferramenta de monitoramento independente

### `scripts/generate_prod_diffs.py`

**Funcao:** Gera diffs para ambiente de producao

- Comparacao entre desenvolvimento e producao
- **Relacionamentos:** Complementa `snapshot_and_diff.py`

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

### Desenvolvimento Local:

```text
server.py -> backend/app.py -> Docker containers
    |
    v
smoke_teste_local.py -> teste_end_point_local.py -> endpoint_checks.py
```

### Deploy para Azure:

```text
infra_to_azure.py (provisiona infraestrutura)
    |
    v
scripts/package_backend_with_docker.py OU deploy_helpers.py
    |
    v
deploy_to_azure.py -> Azure App Service
    |
    v
validar_api_azure.py -> teste_keyvault_simples.py + teste_end_point_azure.py
```

### Validacao de Producao:

```text
checklist_infra.py (valida infraestrutura)
    |
    v
teste_end_point_azure.py -> endpoint_checks.py
    |
    v
teste_keyvault_azure.py (valida Key Vault)
```

## Dependencias Externas Principais

- **Flask**: Backend web (`backend/app.py`)
- **Requests**: Testes HTTP (scripts de teste)
- **Azure SDK**: Gerenciamento de infraestrutura (`infra_to_azure.py`)
- **Docker**: Empacotamento (`scripts/package_backend_with_docker.py`)
- **Pandoc**: Conversao de documentacao (`handbook/*.py`)

## Scripts por Categoria

### **Core Application:**

- `server.py`
- `backend/app.py`

### **Testing & Validation:**

- `endpoint_checks.py`
- `teste_end_point_azure.py`
- `teste_end_point_local.py`
- `teste_keyvault_azure.py`
- `teste_keyvault_simples.py`
- `smoke_teste_local.py`
- `validar_api_azure.py`

### **Deployment & Infrastructure:**

- `infra_to_azure.py`
- `deploy_to_azure.py`
- `deploy_helpers.py`
- `checklist_infra.py`
- `scripts/package_backend_with_docker.py`

### **Documentation:**

- `handbook/HANDBOOK.py`
- `handbook/SERVICEGUIDE.py`

### **Utilities:**

- `scripts/snapshot_and_diff.py`
- `scripts/generate_prod_diffs.py`
- `security/monitor_exe.py`
- `wi_fi/get_wi_fi.py`

---

**Total de Scripts Python:** 52 arquivos
**Ultima Atualizacao:** Campo Largo, Domingo, 5 de outubro de 2025.