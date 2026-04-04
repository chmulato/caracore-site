# Cara-Core InformÃ¡tica

Sistema completo de autenticaÃ§Ã£o OAuth 2.1 + OIDC com controle de acesso granular para Ã¡rea restrita corporativa.

## Sobre o Projeto

O projeto Cara-Core Ã© uma implementaÃ§Ã£o completa de sistema de autenticaÃ§Ã£o e autorizaÃ§Ã£o baseado em OAuth 2.1 e OpenID Connect (OIDC). O sistema oferece controle de acesso granular para Ã¡rea restrita, dashboard administrativo e integraÃ§Ã£o com provedores OAuth populares.

**Status:** ProduÃ§Ã£o estÃ¡vel  
**VersÃ£o:** 1.0.0  
**Ambiente:** [https://caracore-backend-docker.azurewebsites.net]  
**Frontend:** [https://www.caracore.com.br]

## CaracterÃ­sticas Principais

### Sistema de AutenticaÃ§Ã£o

- **OAuth 2.1 + OIDC:** ImplementaÃ§Ã£o completa conforme especificaÃ§Ãµes
- **PKCE ObrigatÃ³rio:** Todos os fluxos usam Proof Key for Code Exchange
- **MÃºltiplos Provedores:** Google OAuth e Microsoft Entra ID
- **Tokens JWT:** ValidaÃ§Ã£o completa (issuer, audience, expiraÃ§Ã£o)
- **Logout Federado:** Limpeza segura de sessÃµes

### Sistema de AutorizaÃ§Ã£o

- **Controle Granular:** UsuÃ¡rios, roles e permissÃµes
- **Dashboard Administrativo:** Interface completa para gestÃ£o
- **API REST:** 4 endpoints para operaÃ§Ãµes CRUD
- **SolicitaÃ§Ã£o de Acesso:** FormulÃ¡rio integrado com aprovaÃ§Ã£o
- **Auditoria Completa:** Logs estruturados de todas as operaÃ§Ãµes

### Infraestrutura

- **Docker Production:** Azure Container Registry
- **CI/CD:** GitHub Actions automatizado
- **Monitoramento:** Azure Application Insights
- **Backup AutomÃ¡tico:** Sistema de backup antes de atualizaÃ§Ãµes
- **Health Checks:** Monitoramento de saÃºde da aplicaÃ§Ã£o

## Ãndice

- [Cara-Core InformÃ¡tica](#cara-core-informÃ¡tica)
  - [Sobre o Projeto](#sobre-o-projeto)
  - [CaracterÃ­sticas Principais](#caracterÃ­sticas-principais)
    - [Sistema de AutenticaÃ§Ã£o](#sistema-de-autenticaÃ§Ã£o)
    - [Sistema de AutorizaÃ§Ã£o](#sistema-de-autorizaÃ§Ã£o)
    - [Infraestrutura](#infraestrutura)
  - [Ãndice](#Ã­ndice)
  - [DocumentaÃ§Ã£o TÃ©cnica](#documentaÃ§Ã£o-tÃ©cnica)
    - [Site Corporativo](#site-corporativo)
    - [Deploy e OperaÃ§Ãµes](#deploy-e-operaÃ§Ãµes)
    - [Scripts Python](#scripts-python)
    - [Fases do Projeto](#fases-do-projeto)
    - [Status e Progresso](#status-e-progresso)
    - [Sistema de AutenticaÃ§Ã£o (OIDC)](#sistema-de-autenticaÃ§Ã£o-oidc)
  - [ConteÃºdo do Site - VisÃ£o Geral](#conteÃºdo-do-site---visÃ£o-geral)
    - [Visual da PÃ¡gina Principal](#visual-da-pÃ¡gina-principal)
    - [Visual da PÃ¡gina de Login - Ãrea 51](#visual-da-pÃ¡gina-de-login---Ã¡rea-51)
      - [Diagrama Mermaid do fluxo OIDC da Ãrea 51](#diagrama-mermaid-do-fluxo-oidc-da-Ã¡rea-51)
      - [Log de Console do OIDC da Ãrea 51](#log-de-console-do-oidc-da-Ã¡rea-51)
    - [ServiÃ§os Oferecidos](#serviÃ§os-oferecidos)
    - [Ãrea de SeguranÃ§a](#Ã¡rea-de-seguranÃ§a)
    - [Materiais Digitais e Apostilas](#materiais-digitais-e-apostilas)
    - [Estrutura do RepositÃ³rio](#estrutura-do-repositÃ³rio)
  - [Ãrea 51 (VisÃ£o Geral)](#Ã¡rea-51-visÃ£o-geral)
  - [Como Visualizar](#como-visualizar)
  - [ObservaÃ§Ãµes](#observaÃ§Ãµes)
  - [Contato](#contato)
  - [Detalhes TÃ©cnicos](#detalhes-tÃ©cnicos)
    - [Sistema de AutenticaÃ§Ã£o OIDC](#sistema-de-autenticaÃ§Ã£o-oidc-1)
      - [CaracterÃ­sticas Principais](#caracterÃ­sticas-principais-1)
      - [PÃ¡ginas e Endpoints](#pÃ¡ginas-e-endpoints)
      - [DocumentaÃ§Ã£o Complementar](#documentaÃ§Ã£o-complementar)
    - [ConfiguraÃ§Ã£o dos Provedores OIDC](#configuraÃ§Ã£o-dos-provedores-oidc)
      - [Redirect URIs Essenciais](#redirect-uris-essenciais)
      - [Microsoft Entra ID (Azure)](#microsoft-entra-id-azure)
      - [Google OAuth (Gmail)](#google-oauth-gmail)
      - [VerificaÃ§Ã£o da ConfiguraÃ§Ã£o](#verificaÃ§Ã£o-da-configuraÃ§Ã£o)
    - [Fluxo de AutenticaÃ§Ã£o](#fluxo-de-autenticaÃ§Ã£o)
      - [SequÃªncia do Fluxo OAuth 2.1 + PKCE](#sequÃªncia-do-fluxo-oauth-21--pkce)
      - [ConfiguraÃ§Ã£o Personalizada](#configuraÃ§Ã£o-personalizada)
      - [PersistÃªncia de SessÃ£o](#persistÃªncia-de-sessÃ£o)
    - [Desenvolvimento Local](#desenvolvimento-local)
      - [Requisitos](#requisitos)
      - [1. Ambiente Virtual Python](#1-ambiente-virtual-python)
      - [2. ConfiguraÃ§Ã£o do Backend](#2-configuraÃ§Ã£o-do-backend)
      - [3. Executar o Ambiente](#3-executar-o-ambiente)
      - [4. VerificaÃ§Ã£o do Ambiente](#4-verificaÃ§Ã£o-do-ambiente)
      - [5. Testes Automatizados](#5-testes-automatizados)
      - [6. Troubleshooting](#6-troubleshooting)
    - [Backend Flask (Azure App Service)](#backend-flask-azure-app-service)
      - [Empacotamento para Deploy](#empacotamento-para-deploy)
        - [MÃ©todo Recomendado: Docker (Linux-compatible)](#mÃ©todo-recomendado-docker-linux-compatible)
        - [MÃ©todo Alternativo: UtilitÃ¡rio Cross-platform](#mÃ©todo-alternativo-utilitÃ¡rio-cross-platform)
    - [Deploy no Azure](#deploy-no-azure)
    - [Monitoramento e Logs](#monitoramento-e-logs)
      - [Logs Estruturados (Ãrea 51)](#logs-estruturados-Ã¡rea-51)
    - [Troubleshooting](#troubleshooting)
      - [Resolvendo "redirect\_uri is not valid"](#resolvendo-redirect_uri-is-not-valid)
      - [Erro "authority mismatch" (Microsoft Entra)](#erro-authority-mismatch-microsoft-entra)
      - [Verificar ConfiguraÃ§Ã£o Google Cloud Console](#verificar-configuraÃ§Ã£o-google-cloud-console)
      - [Verificar ConfiguraÃ§Ã£o Microsoft Azure/Entra](#verificar-configuraÃ§Ã£o-microsoft-azureentra)
    - [Ferramentas e UtilitÃ¡rios](#ferramentas-e-utilitÃ¡rios)
      - [Compilar Scripts Python em ExecutÃ¡veis](#compilar-scripts-python-em-executÃ¡veis)
      - [Compilando `monitor_exe.py`](#compilando-monitor_exepy)
      - [Compilando `get_wi_fi.py`](#compilando-get_wi_fipy)

---

## DocumentaÃ§Ã£o TÃ©cnica

> **Ãndice Completo:** [docs/INDEX.md](docs/INDEX.md) - Navegue por toda a documentaÃ§Ã£o do projeto

### Site Corporativo

- **[Portfolio](docs/PORTFOLIO_README.md)** - DocumentaÃ§Ã£o da pÃ¡gina de portfÃ³lio
- **[Ãrea 51 no Portfolio](docs/AREA51_PORTFOLIO.md)** - ImplementaÃ§Ã£o do projeto Ãrea 51
- **[Google Analytics](docs/GOOGLE_ANALYTICS.md)** - ConfiguraÃ§Ã£o completa GA4
- **[Analytics - Resumo](docs/GA_RESUMO.md)** - Resumo executivo da implementaÃ§Ã£o
- **[MigraÃ§Ã£o de Imagens](docs/MIGRACAO_IMAGENS.md)** - ReorganizaÃ§Ã£o da estrutura de assets

### Deploy e OperaÃ§Ãµes

- **[Guia de Deploy Azure](docs/AZURE_DEPLOY.md)** - Deploy, rollback e troubleshooting completo
- **[VersÃµes de DependÃªncias](docs/VERSOES.md)** - Python, Flask, Gunicorn e todas as dependÃªncias
- **[Azure Monitor](docs/AZURE_MONITOR.md)** - Monitoramento e observabilidade no Azure
- **[GitHub Actions Setup](docs/GITHUB_ACTIONS_SETUP.md)** - ConfiguraÃ§Ã£o de CI/CD
- **[Status de Deploy](docs/DEPLOY_STATUS_GITHUB_ACTIONS.md)** - Status das pipelines

**Scripts Automatizados:**

```powershell
# Deploy para produÃ§Ã£o
python scripts/deploy_production.py

# Rollback em emergÃªncia
python scripts/rollback.py --latest

# Listar backups disponÃ­veis
python scripts/rollback.py --list
```

### Scripts Python

- **[InventÃ¡rio de Scripts Python](scripts/README_PY.md)** - DocumentaÃ§Ã£o completa de todos os scripts
- **[ExecuÃ§Ã£o RÃ¡pida](run_script.py)** - Use `python run_script.py list` para listar scripts disponÃ­veis

### Fases do Projeto

- **[Fase 1: OAuth 2.1 + OIDC](docs/fases/fase-1/)** - FundaÃ§Ã£o da autenticaÃ§Ã£o (100% completo)
- **[Fase 2: Logout e SeguranÃ§a](docs/fases/fase-2/)** - Melhorias de seguranÃ§a (100% completo)
- **[Fase 3: Auditoria e Backend](docs/fases/fase-3/)** - Logs e observabilidade (90% completo)
- **[Fase 4: Monitoramento](docs/fases/fase-4/)** - Monitoramento avanÃ§ado (planejado)

### Status e Progresso

- **[Status Atual do Projeto](docs/pendencias/STATUS-ATUAL.md)** - Progresso detalhado de todas as fases
- **[CritÃ©rios de Aceite OAuth 2.1](docs/pendencias/CRITERIOS-DE-ACEITE-OAUTH_2.1-OIDC.md)** - CritÃ©rios de validaÃ§Ã£o
- **[Fase Cadastro](docs/pendencias/FASE-CADASTRO.md)** - EnumeraÃ§Ã£o da Fase 4

### Sistema de AutenticaÃ§Ã£o (OIDC)

A documentaÃ§Ã£o completa do sistema de autenticaÃ§Ã£o OAuth 2.1 + OIDC estÃ¡ organizada por fases:

- **[Fase 1: OAuth 2.1 + OIDC](docs/fases/fase-1/)** - ImplementaÃ§Ã£o base (100% completo)
- **[Fase 2: Logout e SeguranÃ§a](docs/fases/fase-2/)** - Melhorias de seguranÃ§a (100% completo)
- **[Fase 3: Auditoria e Logs](docs/fases/fase-3/)** - Sistema de logging estruturado (90% completo)

**DocumentaÃ§Ã£o de ReferÃªncia:**

- **[CritÃ©rios de Aceite OAuth 2.1](docs/pendencias/CRITERIOS-DE-ACEITE-OAUTH_2.1-OIDC.md)** - CritÃ©rios de validaÃ§Ã£o completos
- **[Status Atual](docs/pendencias/STATUS-ATUAL.md)** - Estado detalhado do sistema
- **[secure/README.md](secure/README.md)** - DocumentaÃ§Ã£o tÃ©cnica da Ãrea 51

---

## ConteÃºdo do Site - VisÃ£o Geral

O site destaca os principais serviÃ§os da empresa, reÃºne materiais para demonstraÃ§Ãµes comerciais e disponibiliza ferramentas internas de seguranÃ§a. Todo o conteÃºdo pÃºblico Ã© estÃ¡tico e otimizado para navegaÃ§Ã£o rÃ¡pida, enquanto a Ãrea 51 oferece autenticaÃ§Ã£o OIDC para entregar informaÃ§Ãµes confidenciais com controle de acesso contÃ­nuo.

### Visual da PÃ¡gina Principal

![PÃ¡gina inicial do site Cara-Core](docs/img/pagina_inicial_01.png)

### Visual da PÃ¡gina de Login - Ãrea 51

![Fluxo OIDC simplificado da Ãrea 51](docs/img/area_51_oidc.png)

---

_O diagrama detalha o fluxo Authorization Code + PKCE, pÃ¡ginas estÃ¡ticas e callbacks, e os pontos de configuraÃ§Ã£o nos provedores._

#### Diagrama Mermaid do fluxo OIDC da Ãrea 51

```mermaid
sequenceDiagram
   autonumber
   participant U as UsuÃ¡rio
   participant I as /secure/index.html
   participant P as Provedor (Google/Microsoft)
   participant C as /secure/callback.html
   participant R as /secure/restrita.html
   participant L as /secure/logout.html
   participant Bk as Backend (opcional)

   U->>I: Abrir pÃ¡gina e escolher provedor
   I->>P: Autorizar (response_type=code, code_challenge, redirect_uri=/secure/callback.html)
   P-->>C: Redirect com code + state

   alt Troca de token no navegador
      C->>P: POST /token (code + code_verifier)
      P-->>C: id_token + access_token
   else Via backend (opcional)
      C->>+Bk: POST /token (code + code_verifier)
      Bk->>P: POST /token
      P-->>Bk: tokens
      Bk-->>-C: tokens
   end

   C->>R: Redireciona usuÃ¡rio autenticado
   U->>L: Logout
   L->>P: end_session (se aplicÃ¡vel)
   P-->>I: Redirect final (/index.html)
```

---

#### Log de Console do OIDC da Ãrea 51

![Log de Console do OIDC da Ãrea 51](docs/img/area_51_oidc_full.png)

---

### ServiÃ§os Oferecidos

- **Consultoria Microsoft 365:** implantaÃ§Ã£o, migraÃ§Ã£o, governanÃ§a e treinamento.
- **AutomaÃ§Ã£o com Python:** integraÃ§Ãµes, geraÃ§Ã£o de relatÃ³rios e melhoria de processos.
- **Desenvolvimento de Sites:** sites institucionais, portfÃ³lios, blogs e landing pages responsivas.
- **Suporte TÃ©cnico:** backup, antivÃ­rus, seguranÃ§a da informaÃ§Ã£o e orientaÃ§Ã£o tecnolÃ³gica.
- **SeguranÃ§a Digital:** proteÃ§Ã£o de dados, firewall, monitoramento e respostas a incidentes.
- **Treinamentos:** Microsoft 365, Excel, Python e produtividade digital.

### Ãrea de SeguranÃ§a

Ferramentas internas para auditoria e monitoramento em ambientes Windows:

- `security/monitor_exe.py`: monitora, em tempo real, conexÃµes de rede de todos os processos.
- `wi_fi/get_wi_fi.py`: lista redes Wi-Fi salvas e respectivas senhas para fins de inventÃ¡rio.

As duas soluÃ§Ãµes ajudam a identificar acessos suspeitos, documentar atividades e reforÃ§ar polÃ­ticas de seguranÃ§a.

### Materiais Digitais e Apostilas

- `folders/folder_py.html`: folder digital com exportaÃ§Ã£o para PDF (ideal para apresentaÃ§Ãµes comerciais).
- Pasta `handbook/`: manuais, apostilas e scripts de conversÃ£o para HTML responsivo, incluindo o HANDBOOK e o SERVICEGUIDE.

### Estrutura do RepositÃ³rio

```text
cara-core/
â”œâ”€â”€ index.html                  # PÃ¡gina principal do site
â”œâ”€â”€ planos.html                 # PÃ¡gina de planos e serviÃ§os
â”œâ”€â”€ 404.html                    # PÃ¡gina de erro 404
â”œâ”€â”€ CNAME                       # ConfiguraÃ§Ã£o de domÃ­nio customizado
â”œâ”€â”€ _config.yml                 # ConfiguraÃ§Ã£o Jekyll (GitHub Pages)
â”œâ”€â”€ _redirects                  # Regras de redirecionamento
â”œâ”€â”€ vercel.json                 # ConfiguraÃ§Ã£o Vercel (opcional)
â”œâ”€â”€ package.json                # DependÃªncias Node.js (se aplicÃ¡vel)
â”œâ”€â”€ requirements.txt            # DependÃªncias Python do projeto
â”œâ”€â”€ run_script.py               # Launcher de scripts Python (executa scripts/)
â”œâ”€â”€ README.md                   # Este arquivo
â”œâ”€â”€ LICENSE                     # LicenÃ§a de uso
â”‚
â”œâ”€â”€ area51/                     # DocumentaÃ§Ã£o complementar
â”‚   â””â”€â”€ wiki/                   # Wiki da Ãrea 51
â”‚       â”œâ”€â”€ index.html          # PÃ¡gina principal da wiki
â”‚       â””â”€â”€ assets/             # Recursos da wiki (CSS, JS, imagens)
â”‚
â”œâ”€â”€ secure/                     # Ãrea 51 (pÃ¡ginas autenticadas)
â”‚   â”œâ”€â”€ index.html              # PÃ¡gina de login OIDC
â”‚   â”œâ”€â”€ callback.html           # Callback OAuth 2.1
â”‚   â”œâ”€â”€ restrita.html           # Ãrea restrita (pÃ³s-autenticaÃ§Ã£o)
â”‚   â”œâ”€â”€ logout.html             # PÃ¡gina de logout
â”‚   â”œâ”€â”€ admin-logs.html         # Painel de logs (admin)
â”‚   â”œâ”€â”€ auth-standalone.js      # LÃ³gica de autenticaÃ§Ã£o
â”‚   â”œâ”€â”€ dynamic-config.js       # ConfiguraÃ§Ã£o dinÃ¢mica de endpoints
â”‚   â”œâ”€â”€ log-config.js           # ConfiguraÃ§Ã£o de logging
â”‚   â””â”€â”€ README.md               # DocumentaÃ§Ã£o da Ãrea 51
â”‚
â”œâ”€â”€ backend/                    # API Flask (Azure App Service)
â”‚   â”œâ”€â”€ app.py                  # AplicaÃ§Ã£o Flask principal
â”‚   â”œâ”€â”€ requirements.txt        # DependÃªncias Python do backend
â”‚   â”œâ”€â”€ .env.example            # Template de variÃ¡veis de ambiente
â”‚   â”œâ”€â”€ allowlist.json          # Controle de acesso (whitelist)
â”‚   â”œâ”€â”€ oryx-build-commands.txt # Comandos de build Oryx (Azure)
â”‚   â”œâ”€â”€ logs/                   # Logs estruturados (*.jsonl)
â”‚   â””â”€â”€ data/                   # Dados JSON (se aplicÃ¡vel)
â”‚
â”œâ”€â”€ docker/                     # ConfiguraÃ§Ã£o Docker
â”‚   â”œâ”€â”€ Dockerfile              # Imagem Docker do backend
â”‚   â”œâ”€â”€ docker-compose.yml      # OrquestraÃ§Ã£o de containers
â”‚   â”œâ”€â”€ docker-entrypoint.sh    # Script de inicializaÃ§Ã£o
â”‚   â””â”€â”€ backend.env.sample      # Template de variÃ¡veis Docker
â”‚
â”œâ”€â”€ scripts/                                # Scripts de automaÃ§Ã£o e deploy
â”‚   â”œâ”€â”€ README_PY.md                        # DocumentaÃ§Ã£o completa dos scripts
â”‚   â”œâ”€â”€ server.py                           # Servidor local de desenvolvimento
â”‚   â”œâ”€â”€ teste.py                            # Testes do site estÃ¡tico
â”‚   â”œâ”€â”€ deploy_to_azure.py                  # Deploy manual para Azure
â”‚   â”œâ”€â”€ deploy_production.py                # Deploy automatizado com backup
â”‚   â”œâ”€â”€ rollback.py                         # Rollback de versÃµes
â”‚   â”œâ”€â”€ package_backend_with_docker.py      # Empacotamento Docker
â”‚   â”œâ”€â”€ executar_ut_secure.py               # Testes unitÃ¡rios OIDC
â”‚   â”œâ”€â”€ verificar_backend_azure_simples.py  # VerificaÃ§Ã£o Azure
â”‚   â”œâ”€â”€ verificar_producao.py               # DiagnÃ³stico completo produÃ§Ã£o
â”‚   â”œâ”€â”€ configurar_backend_azure.py         # ConfiguraÃ§Ã£o Azure
â”‚   â””â”€â”€ backend.zip                         # Pacote gerado para deploy
â”‚
â”œâ”€â”€ docs/                                # DocumentaÃ§Ã£o tÃ©cnica completa
â”‚   â”œâ”€â”€ INDEX.md                         # Ãndice geral da documentaÃ§Ã£o
â”‚   â”œâ”€â”€ AZURE_DEPLOY.md                  # Guia de deploy Azure
â”‚   â”œâ”€â”€ AZURE_MONITOR.md                 # Monitoramento e observabilidade
â”‚   â”œâ”€â”€ VERSOES.md                       # VersÃµes de dependÃªncias
â”‚   â”œâ”€â”€ GITHUB_ACTIONS_SETUP.md          # ConfiguraÃ§Ã£o CI/CD
â”‚   â”œâ”€â”€ DEPLOY_STATUS_GITHUB_ACTIONS.md  # Status pipelines
â”‚   â”œâ”€â”€ fases/                           # DocumentaÃ§Ã£o por fase
â”‚   â”‚   â”œâ”€â”€ README.md                    # VisÃ£o geral das fases
â”‚   â”‚   â”œâ”€â”€ fase-1/                      # Fase 1: OAuth 2.1 + OIDC (100%)
â”‚   â”‚   â”œâ”€â”€ fase-2/                      # Fase 2: Logout e SeguranÃ§a (100%)
â”‚   â”‚   â”œâ”€â”€ fase-3/                      # Fase 3: Auditoria e Backend (90%)
â”‚   â”‚   â””â”€â”€ fase-4/                      # Fase 4: Monitoramento (planejado)
â”‚   â”œâ”€â”€ pendencias/                      # Status e pendÃªncias
â”‚   â”‚   â”œâ”€â”€ STATUS-ATUAL.md              # Status detalhado do projeto
â”‚   â”‚   â”œâ”€â”€ FASE-CADASTRO.md             # EnumeraÃ§Ã£o Fase 4
â”‚   â”‚   â””â”€â”€ CRITERIOS-DE-ACEITE-OAUTH_2.1-OIDC.md
â”‚   â””â”€â”€ img/                             # Imagens da documentaÃ§Ã£o
â”‚
â”œâ”€â”€ css/                        # Folhas de estilo CSS
â”‚   â””â”€â”€ additional-styles.css   # Estilos customizados
â”‚
â”œâ”€â”€ js/                         # Scripts JavaScript pÃºblicos
â”‚   â”œâ”€â”€ analytics.js            # Google Analytics
â”‚   â”œâ”€â”€ config.js               # ConfiguraÃ§Ã£o geral
â”‚   â”œâ”€â”€ config-local.js         # ConfiguraÃ§Ã£o local
â”‚   â”œâ”€â”€ logging.js              # Sistema de logs
â”‚   â”œâ”€â”€ oidc.js                 # UtilitÃ¡rios OIDC
â”‚   â”œâ”€â”€ html2pdf.bundle.min.js  # GeraÃ§Ã£o de PDFs
â”‚   â””â”€â”€ vendor/                 # Bibliotecas de terceiros
â”‚
â”œâ”€â”€ images/                     # Imagens e logotipos do site
â”œâ”€â”€ fonts/                      # Fontes customizadas
â”‚
â”œâ”€â”€ folders/                    # Materiais comerciais
â”‚   â”œâ”€â”€ folder_py.html          # Folder digital exportÃ¡vel
â”‚   â””â”€â”€ apresentacao.md         # ApresentaÃ§Ã£o institucional
â”‚
â”œâ”€â”€ handbook/                   # Apostilas e manuais
â”‚   â”œâ”€â”€ HANDBOOK.md             # Apostila Microsoft 365 (fonte)
â”‚   â”œâ”€â”€ HANDBOOK.html           # Apostila convertida
â”‚   â”œâ”€â”€ HANDBOOK.py             # Script de conversÃ£o
â”‚   â”œâ”€â”€ SERVICEGUIDE.md         # Manual de serviÃ§os (fonte)
â”‚   â”œâ”€â”€ SERVICEGUIDE.html       # Manual convertido
â”‚   â”œâ”€â”€ SERVICEGUIDE.py         # Script de conversÃ£o
â”‚   â”œâ”€â”€ images/                 # Imagens dos manuais
â”‚   â”œâ”€â”€ business_plan/          # Planos de negÃ³cio
â”‚   â””â”€â”€ README.md               # DocumentaÃ§Ã£o do handbook
â”‚
â”œâ”€â”€ security/                   # Ferramentas de seguranÃ§a
â”‚   â””â”€â”€ monitor_exe.py          # Monitor de conexÃµes de rede
â”‚
â”œâ”€â”€ wi_fi/                      # UtilitÃ¡rios Wi-Fi
â”‚   â””â”€â”€ get_wi_fi.py            # Listagem de redes Wi-Fi salvas
â”‚
â”œâ”€â”€ cv/                         # CurrÃ­culos e portfÃ³lio
â”‚   â”œâ”€â”€ server.py               # Servidor de desenvolvimento CV
â”‚   â”œâ”€â”€ public/                 # Arquivos pÃºblicos CV
â”‚   â””â”€â”€ README.md               # DocumentaÃ§Ã£o CV
â”‚
â”œâ”€â”€ personal/                   # PÃ¡gina pessoal
â”‚   â”œâ”€â”€ index.html              # PÃ¡gina principal pessoal
â”‚   â””â”€â”€ articles/               # Artigos e posts
â”‚
â”œâ”€â”€ politica/                   # PolÃ­ticas e termos
â”‚   â”œâ”€â”€ politica-privacidade.html
â”‚   â””â”€â”€ termos-servico.html
â”‚
â”œâ”€â”€ publications/               # PublicaÃ§Ãµes e papers
â”œâ”€â”€ log/                        # Logs de execuÃ§Ã£o de scripts
â””â”€â”€ deploy_temp/                # Arquivos temporÃ¡rios de deploy
```

---

## Ãrea 51 (VisÃ£o Geral)

A Ãrea 51 Ã© a seÃ§Ã£o restrita do site, voltada a clientes, parceiros e aÃ§Ãµes internas. Ela oferece:

- **AutenticaÃ§Ã£o via OIDC** (Microsoft e Google) com fluxo Authorization Code + PKCE.
- **ExperiÃªncia consistente e local:** as pÃ¡ginas `secure/index.html`, `secure/callback.html`, `secure/restrita.html` e `secure/logout.html` utilizam sprite SVG, navegaÃ§Ã£o responsiva e apenas arquivos CSS/JS hospedados no prÃ³prio domÃ­nio.
- **Controle por allowlist:** o arquivo `backend/allowlist.json` define quem pode acessar.

| PÃ¡gina | DescriÃ§Ã£o |
|--------|-----------|
| `/secure/index.html` | Tela de login com seleÃ§Ã£o de provedores |
| `/secure/callback.html` | Callback dedicado que processa o retorno do provedor e conduz Ã  Ã¡rea restrita |
| `/secure/restrita.html` | Ãrea autenticada com conteÃºdos exclusivos |
| `/secure/logout.html` | ConfirmaÃ§Ã£o de saÃ­da com recomendaÃ§Ãµes de acesso |

A administraÃ§Ã£o pode acompanhar eventos em tempo real pela pÃ¡gina `secure/admin-logs.html`.

---

## Como Visualizar

1. Clone o repositÃ³rio:

   ```sh
   git clone https://caracore.com.br/
   ```

2. Abra a pasta no VS Code (ou editor de sua preferÃªncia).

3. Abra `index.html` no navegador para navegar pelas pÃ¡ginas pÃºblicas.

4. Acesse `/secure/` para visualizar a Ãrea 51 (Ã© exibido o fluxo de login, mesmo sem backend ativo).

---

## ObservaÃ§Ãµes

- Para uso comercial da fonte Bellerose, adquira a licenÃ§a em [harristype.com](https://www.harristype.com/font_store/bellerose_pro_family/bellerosefamily.html).
- Valores de planos e pacotes sÃ£o referÃªncias e podem ser personalizados para cada projeto.

---

## Contato

- WhatsApp: [41 9 9909-7797](https://wa.me/5541999097797)
- E-mail: [suporte@caracore.com.br](mailto:suporte@caracore.com.br)
- [Facebook](https://www.facebook.com/caracoreinformatica/)
- [YouTube](https://www.youtube.com/@caracoreinformatica7704)
- [LinkedIn](https://pt.linkedin.com/company/cara-core)
- [GitHub](https://caracore.com.br/ecosistema.html)
- [Site](https://caracore.com.br)

---

## Detalhes TÃ©cnicos

Esta seÃ§Ã£o contÃ©m informaÃ§Ãµes tÃ©cnicas detalhadas sobre configuraÃ§Ã£o, desenvolvimento e deploy do sistema. O conteÃºdo estÃ¡ organizado em ordem lÃ³gica de implementaÃ§Ã£o: autenticaÃ§Ã£o, configuraÃ§Ã£o, desenvolvimento, deploy e troubleshooting.

### Sistema de AutenticaÃ§Ã£o OIDC

O projeto implementa OAuth 2.1 + OIDC (OpenID Connect) com Authorization Code Flow + PKCE para mÃ¡xima seguranÃ§a.

#### CaracterÃ­sticas Principais

- **MÃºltiplos provedores:** Microsoft Entra ID e Google Identity Platform
- **SeguranÃ§a:** Authorization Code Flow + PKCE, cookies `HttpOnly`, `Secure` e `SameSite=Strict`
- **Logs estruturados:** eventos em JSON com sanitizaÃ§Ã£o de dados sensÃ­veis
- **Proxy de token inteligente:** roteamento automÃ¡tico entre desenvolvimento e produÃ§Ã£o
- **PersistÃªncia de provedor:** gerenciamento de sessÃ£o com `sessionStorage`/`localStorage`
- **Interface responsiva:** componentes prÃ³prios sem dependÃªncias de CDN
- **Layout unificado:** sprite SVG compartilhado entre todas as pÃ¡ginas da Ãrea 51

#### PÃ¡ginas e Endpoints

| URL | DescriÃ§Ã£o | FunÃ§Ã£o |
|-----|-----------|--------|
| `/secure/index.html` | PÃ¡gina de login | SeleÃ§Ã£o de provedor OAuth |
| `/secure/callback.html` | Callback OIDC | Processamento do authorization code |
| `/secure/restrita.html` | Ãrea autenticada | ConteÃºdo restrito pÃ³s-login |
| `/secure/logout.html` | Logout | Encerramento de sessÃ£o |
| `/secure/admin-logs.html` | Painel admin | VisualizaÃ§Ã£o de logs em tempo real |

#### DocumentaÃ§Ã£o Complementar

- **[secure/README.md](secure/README.md)** - DocumentaÃ§Ã£o completa da Ãrea 51
- **[Status Atual](docs/pendencias/STATUS-ATUAL.md)** - Estado detalhado do sistema
- **[Fase 1: OAuth 2.1](docs/fases/fase-1/)** - ImplementaÃ§Ã£o base da autenticaÃ§Ã£o
- **[Fase 2: SeguranÃ§a](docs/fases/fase-2/)** - Melhorias de seguranÃ§a e logout
- **[Fase 3: Auditoria](docs/fases/fase-3/)** - Logs estruturados e observabilidade

### ConfiguraÃ§Ã£o dos Provedores OIDC

#### Redirect URIs Essenciais

**Frontend (pÃ¡ginas estÃ¡ticas):**

- `http://localhost:8000/secure/callback.html` (desenvolvimento local)
- `http://127.0.0.1:8000/secure/callback.html` (desenvolvimento local alternativo)
- `https://caracore.com.br/secure/callback.html` (GitHub Pages preview)
- `https://www.caracore.com.br/secure/callback.html` (produÃ§Ã£o)

**Backend (quando em uso):**

- `http://localhost:5051/secure/` (desenvolvimento)
- DomÃ­nio pÃºblico do Azure App Service (produÃ§Ã£o)

#### Microsoft Entra ID (Azure)

**ConfiguraÃ§Ã£o no Azure Portal:**

1. Acesse [Azure Portal - App Registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Crie ou localize o App Registration: Client ID `8ef17663-438f-4777-99ca-c5ad5b2a2993`
3. Configure **Authentication > Web platform**:
   - Adicione as Redirect URIs listadas acima
4. Configure **API permissions**:
   - `openid` (delegated)
   - `profile` (delegated)
   - `email` (delegated)
5. Preencha `backend/.env`:

   ```env
   TENANT_ID=seu-tenant-id
   CLIENT_ID=8ef17663-438f-4777-99ca-c5ad5b2a2993
   CLIENT_SECRET=seu-client-secret
   ```

**DocumentaÃ§Ã£o complementar:**

- [Fase 1: OAuth 2.1 + OIDC](docs/fases/fase-1/) - ImplementaÃ§Ã£o base
- [Fase 2: SeguranÃ§a](docs/fases/fase-2/) - ConfiguraÃ§Ã£o de provedores
- [CritÃ©rios de Aceite](docs/pendencias/CRITERIOS-DE-ACEITE-OAUTH_2.1-OIDC.md) - ValidaÃ§Ã£o completa

#### Google OAuth (Gmail)

**ConfiguraÃ§Ã£o no Google Cloud Console:**

1. Acesse [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=chmulato-web-oauth2)
2. Localize o OAuth 2.0 Client ID: `1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com`
3. Configure **Authorized JavaScript origins**:
   - `https://www.caracore.com.br`
   - `http://localhost:8000` (desenvolvimento)
4. Configure **Authorized redirect URIs**:
   - Adicione todas as URIs listadas acima
5. Configure os escopos: `openid profile email`
6. Preencha `backend/.env`:

   ```env
   GOOGLE_CLIENT_ID=1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=seu-google-client-secret
   GOOGLE_ALLOWED_DOMAINS=example.com,anotherdomain.com
   ```

**DocumentaÃ§Ã£o complementar:**

- [Fase 1: OAuth 2.1 + OIDC](docs/fases/fase-1/) - ImplementaÃ§Ã£o base
- [Fase 2: SeguranÃ§a](docs/fases/fase-2/) - ConfiguraÃ§Ã£o de provedores
- [CritÃ©rios de Aceite](docs/pendencias/CRITERIOS-DE-ACEITE-OAUTH_2.1-OIDC.md) - ValidaÃ§Ã£o completa

#### VerificaÃ§Ã£o da ConfiguraÃ§Ã£o

```powershell
# 1. Inicie o backend
cd backend
python app.py

# 2. Em outro terminal, inicie o servidor estÃ¡tico
python server.py

# 3. Acesse o ambiente local
# http://localhost:8080/secure/

# 4. Teste o fluxo de autenticaÃ§Ã£o com ambos os provedores
```

**Checklist de verificaÃ§Ã£o:**

- [ ] Redirect URIs cadastradas em ambos os provedores
- [ ] VariÃ¡veis de ambiente configuradas no `backend/.env`
- [ ] Backend respondendo em `/health`
- [ ] Site estÃ¡tico acessÃ­vel
- [ ] Login Google funcional
- [ ] Login Microsoft funcional
- [ ] Logs sendo gravados corretamente

### Fluxo de AutenticaÃ§Ã£o

#### SequÃªncia do Fluxo OAuth 2.1 + PKCE

1. **Login:** usuÃ¡rio acessa `/secure/index.html` e escolhe provedor (Google ou Microsoft)
2. **AutorizaÃ§Ã£o:** redirecionamento para o provedor com `code_challenge` (PKCE)
3. **Callback:** provedor retorna para `/secure/callback.html` com authorization code
4. **Troca de tokens:** `auth-standalone.js` troca code por tokens usando `code_verifier`
5. **Acesso:** usuÃ¡rio Ã© redirecionado para `/secure/restrita.html` autenticado
6. **Logout:** via `/secure/logout.html` com encerramento de sessÃ£o no provedor

#### ConfiguraÃ§Ã£o Personalizada

O arquivo `secure/dynamic-config.js` gera os caminhos automaticamente usando `resolveOidcPaths()`.

**Personalizar endpoints:**

```html
<script>
   window.CARA_CORE_CONFIG = {
      oidcPaths: {
         callback: '/secure/custom-callback.html',
         logout: '/secure/custom-logout.html'
      }
   };
</script>
```

**Personalizar backend:**

```html
<script>
   window.CARA_CORE_CONFIG = {
      backendBaseUrl: 'https://api-suaempresa.azurewebsites.net',
      // Opcional: definir manualmente o endpoint de token
      googleTokenEndpoint: 'https://api-suaempresa.azurewebsites.net/oauth/google/token'
   };
</script>
```

#### PersistÃªncia de SessÃ£o

O sistema utiliza `sessionStorage` (com fallback para `localStorage`) para manter o provedor selecionado, evitando erros de "authority mismatch".

**Trocar de provedor durante testes:**

```javascript
// Limpar provedor armazenado
window.sessionStorage.removeItem('cara_core_oidc_provider');
window.localStorage.removeItem('cara_core_oidc_provider');

// Ou selecionar explicitamente o provedor desejado na UI
```

**Importante:** Os provedores devem ter `/secure/callback.html` obrigatoriamente cadastrado nas Redirect URIs.

### Desenvolvimento Local

Guia completo para configurar o ambiente de desenvolvimento no Windows usando PowerShell e VS Code.

#### Requisitos

- Windows 10/11
- Python 3.11 ou superior
- VS Code
- Docker Desktop (opcional, para backend em container)
- PowerShell 5.1 ou superior

#### 1. Ambiente Virtual Python

Crie e ative um ambiente virtual (recomendado):

```powershell
# Criar ambiente virtual
python -m venv .venv

# Ativar ambiente virtual
.\.venv\Scripts\Activate.ps1

# Atualizar pip
python -m pip install --upgrade pip

# Instalar dependÃªncias
python -m pip install -r requirements.txt
```

**Nota:** Se o launcher da Microsoft Store interferir, use `py -3.13` no lugar de `python`.

#### 2. ConfiguraÃ§Ã£o do Backend

**Arquivo `.env` principal:**

```powershell
# Copiar template
Copy-Item backend\.env.example backend\.env

# Editar arquivo com suas credenciais
code backend\.env
```

Preencha as seguintes variÃ¡veis em `backend/.env`:

```env
# Microsoft Entra ID
TENANT_ID=seu-tenant-id
CLIENT_ID=8ef17663-438f-4777-99ca-c5ad5b2a2993
CLIENT_SECRET=seu-client-secret

# Google OAuth
GOOGLE_CLIENT_ID=1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-google-client-secret
GOOGLE_ALLOWED_DOMAINS=example.com,anotherdomain.com

# Cache e SeguranÃ§a
JWKS_CACHE_TTL_SECONDS=3600
LOG_RETENTION_DAYS=30
```

**Arquivo Docker (opcional):**

Se for usar Docker para o backend:

```powershell
# Copiar template Docker
Copy-Item docker\backend.env.sample docker\backend.env

# Editar arquivo
code docker\backend.env
```

#### 3. Executar o Ambiente

**[OpÃ§Ã£o A]: Via VS Code Tasks (Recomendado)**

Use os atalhos do VS Code:

- **F5** ou `Run root server.py`: Inicia site estÃ¡tico + backend Docker
- `Run area51 app.py`: Sobe apenas o backend Flask
- `Test: site + area51 link`: Testa o link da Ãrea 51

**[OpÃ§Ã£o B]: Via PowerShell Manual**

**Servidor estÃ¡tico + Backend Docker:**

```powershell
# Na raiz do projeto
python server.py
```

O script automaticamente:

- Inicia Docker Desktop (se necessÃ¡rio)
- Sobe o backend via `docker compose`
- Serve o site estÃ¡tico em [http://localhost:8080]

Para desabilitar o inÃ­cio automÃ¡tico do Docker:

```powershell
$env:AUTO_START_DOCKER_BACKEND=0
python server.py
```

**Backend sem Docker:**

```powershell
# Executar Flask diretamente
cd backend
python app.py
```

O backend ficarÃ¡ disponÃ­vel em http://localhost:5051

**Backend Docker manual:**

```powershell
cd docker
docker compose up -d backend
```

#### 4. VerificaÃ§Ã£o do Ambiente

**Verificar serviÃ§os:**

```powershell
# Backend Health Check
curl http://localhost:5051/health

# Site estÃ¡tico
start http://localhost:8080

# Ãrea 51
start http://localhost:8080/secure/
```

**Acessar URLs:**

- Site estÃ¡tico: [http://localhost:8080]
- Backend API: [http://localhost:5051]
- Ãrea 51: [http://localhost:8080/secure/]
- Health Check: [http://localhost:5051/health]

#### 5. Testes Automatizados

**Teste do site estÃ¡tico:**

```powershell
python teste.py
```

Verifica: status 200, textos-chave, link "Ãrea 51"

**Teste do backend local:**

```powershell
python teste_end_point_local.py
```

Verifica: `/health`, CORS, endpoints sem credenciais

**Teste do backend Azure:**

```powershell
# Com URL padrÃ£o
python teste_end_point_azure.py

# Com URL customizada
python teste_end_point_azure.py --base-url https://sua-api.azurewebsites.net
```

**SaÃ­da esperada:** Todas verificaÃ§Ãµes marcadas como `OK` e mensagem final **"Todos os testes passaram."**

#### 6. Troubleshooting

**[Problema]: Python nÃ£o encontrado**

```powershell
# Usar py launcher
py -3.13 --version

# Ou ajustar no VS Code
# settings.json: "python.defaultInterpreterPath": "C:\\Python313\\python.exe"
```

**[Problema]: Docker nÃ£o inicia**

```powershell
# Verificar status do Docker
docker --version
docker ps

# Iniciar Docker Desktop manualmente
start "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

**[Problema]: Porta em uso**

```powershell
# Verificar porta 8080
netstat -ano | findstr :8080

# Encerrar processo (use o PID da saÃ­da acima)
taskkill /PID <PID> /F
```

**[Problema]: MÃ³dulos Python nÃ£o encontrados**

```powershell
# Garantir que estÃ¡ no ambiente virtual
.\.venv\Scripts\Activate.ps1

# Reinstalar dependÃªncias
python -m pip install -r requirements.txt --force-reinstall
```

### Backend Flask (Azure App Service)

- O backend vive em `backend/app.py` e expÃµe dois endpoints: `/health` e `/oauth/google/token`.
- O serviÃ§o roda em produÃ§Ã£o com `gunicorn --chdir backend app:app` (definido no App Service).
- VariÃ¡veis sensÃ­veis (ex.: `GOOGLE_CLIENT_SECRET`) sÃ£o buscadas do Azure Key Vault via App Settings com referÃªncia `@Microsoft.KeyVault(SecretUri=...)`.
- Logs sÃ£o estruturados em JSON e podem ser conferidos pelo **Log Stream** do App Service ou via `az webapp log tail`.
- O arquivo `backend/allowlist.json` controla quem pode concluir o login na Ãrea 51.

![API Cara-Core em produÃ§Ã£o](docs/img/pagina_da_api_caracore.png)

#### Empacotamento para Deploy

##### MÃ©todo Recomendado: Docker (Linux-compatible)

**Para garantir mÃ¡xima compatibilidade com Azure App Service**, use o script que gera o pacote dentro de um contÃªiner Linux:

```powershell
python scripts/package_backend_with_docker.py
```

**Vantagens do mÃ©todo Docker:**

- **Compatibilidade total** com Azure App Service (Linux glibc)
- **DependÃªncias nativas** compiladas para Linux amd64
- **Reprodutibilidade** entre diferentes sistemas operacionais
- **AutomatizaÃ§Ã£o completa** do processo de empacotamento

**O que o script faz:**

1. **Cria contÃªiner** `python:3.11-bullseye` (mesma base do Azure)
2. **Instala dependÃªncias** em `backend/.python_packages` (Linux wheels)
3. **Gera `backend.zip`** pronto para deploy
4. **Logs detalhados** em `log/package_backend_YYYYMMDD_HHMMSS.log`

**Requisitos:**

- Docker Desktop ativo (Windows/macOS) ou Docker Engine (Linux)
- Comando `docker` disponÃ­vel no PATH

**OpÃ§Ãµes avanÃ§adas:**

```powershell
# Especificar imagem Docker diferente
python scripts/package_backend_with_docker.py --docker-image python:3.12-slim

# Argumentos extras para pip
python scripts/package_backend_with_docker.py --pip-extra-arg="--no-cache-dir"

# DiretÃ³rio backend customizado
python scripts/package_backend_with_docker.py --backend-dir="custom-backend"
```

**Troubleshooting Docker:**

- **Erro "docker command not found"**: Instale Docker Desktop ou verifique PATH
- **Erro de permissÃ£o**: Certifique-se que Docker Desktop estÃ¡ executando
- **Builds lentos**: O primeiro download da imagem `python:3.11-bullseye` pode demorar
- **Logs detalhados**: Sempre disponÃ­veis em `log/package_backend_YYYYMMDD_HHMMSS.log`

##### MÃ©todo Alternativo: UtilitÃ¡rio Cross-platform

Para casos simples ou quando Docker nÃ£o estiver disponÃ­vel:

```powershell
python package_backend.py --overwrite
```

**Quando usar cada mÃ©todo:**

- **Docker**: Deploy para produÃ§Ã£o, CI/CD, mÃ¡xima compatibilidade
- **Cross-platform**: Desenvolvimento local, testes rÃ¡pidos, sem Docker

O script gera `scripts/backend.zip` (na pasta scripts), removendo `logs/`, `__pycache__/` e arquivos compilados. Como alternativa manual, gere o pacote a partir de uma cÃ³pia limpa da pasta `backend/`, sem `logs/` ou `__pycache__/`.

**PowerShell (Windows):**

```powershell
Remove-Item -Force -ErrorAction SilentlyContinue scripts/backend.zip
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue backend-deploy
robocopy backend backend-deploy /MIR /XD logs __pycache__
Compress-Archive -Path backend-deploy\* -DestinationPath scripts/backend.zip
Remove-Item -Recurse -Force backend-deploy
```

**bash (Linux/macOS):**

```bash
rm -f scripts/backend.zip
rm -rf backend-deploy
rsync -a backend/ backend-deploy/ --exclude logs --exclude __pycache__
(cd backend-deploy && zip -r ../scripts/backend.zip .)
rm -rf backend-deploy
```

> O zip precisa conter `app.py` e `requirements.txt` na raiz interna e jÃ¡ incluir `gunicorn` nas dependÃªncias.

Para validar rapidamente, execute `python teste_end_point_local.py` enquanto o contÃªiner Docker estiver ativo e, apÃ³s o deploy, rode `python teste_end_point_azure.py` apontando para a URL pÃºblica do App Service.

### Deploy no Azure

![Recursos Azure do projeto Cara-Core](docs/img/pagina_de_recursos_azure.png)

1. Execute `py -3.13 .\deploy_to_azure.py` para provisionar/atualizar Resource Group, App Service Plan (Linux) e Web App (Python 3.11).
   - O script identifica Subscription/Tenant via `az account show` e pergunta se o segredo do Google deve ser salvo no Key Vault.
   - Use a opÃ§Ã£o `--store-google-secret` para criar a referÃªncia segura `@Microsoft.KeyVault(...)` diretamente no App Setting.
   - Para execuÃ§Ã£o sem prompt, passe os parÃ¢metros de linha de comando (`--resource-group`, `--app-name`, `--zip scripts/backend.zip`, etc.).
1. ApÃ³s o deploy, reinicie o Web App se alterar App Settings crÃ­ticos:

   ```powershell
   az webapp restart --resource-group <RG> --name <APP_NAME>
   ```

1. Valide o endpoint de saÃºde (`/health`) e realize um login completo pela Ãrea 51 para confirmar a troca de tokens.
1. Acompanhe os logs em tempo real com `az webapp log tail --name <APP_NAME> --resource-group <RG>` e confirme os campos estruturados.
1. Crie um orÃ§amento em **Azure Portal > Cost Management + Billing > Budgets** para receber alertas mensais de consumo.

> Dica: habilite **Run From Package** ou utilize **Deployment Slots** para fazer deploy sem downtime quando publicar novas versÃµes do `backend.zip`.

### Monitoramento e Logs

#### Logs Estruturados (Ãrea 51)

- O endpoint `/logs` aceita eventos JSON com campos autorizados (`ts`, `event`, `session_id`, etc.)
- Dados sensÃ­veis (tokens, authorization codes, PII) sÃ£o bloqueados tanto no cliente quanto no servidor
- `LOG_RETENTION_DAYS` controla a retenÃ§Ã£o; os arquivos ficam em `backend/logs/*.jsonl`
- Cookies de sessÃ£o seguem boas prÃ¡ticas (`HttpOnly`, `Secure`, `SameSite=Strict`)

**Visualizar logs:**

```powershell
# Logs locais
Get-Content backend\logs\*.jsonl -Tail 20

# Logs Azure (tempo real)
az webapp log tail --name <APP_NAME> --resource-group <RG>
```

### Troubleshooting

#### Resolvendo "redirect_uri is not valid"

Problemas comuns de configuraÃ§Ã£o provocam erros "redirect_uri is not valid" (Google) ou `AADSTS9002346` (Microsoft). Ajuste conforme abaixo.

#### Erro "authority mismatch" (Microsoft Entra)

Esse erro indica que o callback retornou para um provedor diferente do usado no inÃ­cio do fluxo.

**SoluÃ§Ã£o:**

1. Certifique-se de iniciar o login com o botÃ£o "Continuar com Microsoft"
2. Se estiver alternando entre Google e Entra no mesmo navegador, limpe o provedor armazenado:

   ```javascript
   window.sessionStorage.removeItem('cara_core_oidc_provider');
   window.localStorage.removeItem('cara_core_oidc_provider');
   ```

3. Garanta que a aplicaÃ§Ã£o do Entra possui as Redirect URIs corretas cadastradas
4. Force o recarregamento (`Ctrl + F5`) para carregar o `auth-standalone.js` atualizado

#### Verificar ConfiguraÃ§Ã£o Google Cloud Console

**Checklist de Redirect URIs:**

1. Acesse [Google Cloud Console â€“ Credentials](https://console.cloud.google.com/apis/credentials?project=chmulato-web-oauth2)
2. Abra o OAuth 2.0 Client ID: `1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com`
3. Verifique **Authorized JavaScript origins**:
   - `https://www.caracore.com.br`
   - `http://localhost:8000` (desenvolvimento)
4. Verifique **Authorized redirect URIs**:
   - `http://localhost:8000/secure/callback.html`
   - `http://127.0.0.1:8000/secure/callback.html`
   - `https://caracore.com.br/secure/callback.html`
   - `https://www.caracore.com.br/secure/callback.html`
5. Salve e teste novamente

#### Verificar ConfiguraÃ§Ã£o Microsoft Azure/Entra

**Checklist de Redirect URIs:**

1. Acesse [Azure Portal â€“ App registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Localize o app com Client ID `8ef17663-438f-4777-99ca-c5ad5b2a2993`
3. Em **Authentication > Platform configurations > Web**, verifique as Redirect URIs:
   - `http://localhost:8000/secure/callback.html`
   - `http://127.0.0.1:8000/secure/callback.html`
   - `https://caracore.com.br/secure/callback.html`
   - `https://www.caracore.com.br/secure/callback.html`
4. Salve e repita o login

### Ferramentas e UtilitÃ¡rios

#### Compilar Scripts Python em ExecutÃ¡veis

Se desejar distribuir as ferramentas internas em formato `.exe`, utilize o PyInstaller.

#### Compilando `monitor_exe.py`

1. Instale o PyInstaller:

   ```sh
   pip install pyinstaller
   ```

2. Gere o executÃ¡vel:

   ```sh
   pyinstaller --onefile monitor_exe.py
   ```

3. Para ocultar o console, use `pyinstaller --onefile --noconsole monitor_exe.py`.
4. O binÃ¡rio final estarÃ¡ em `dist/monitor_exe.exe`.

#### Compilando `get_wi_fi.py`

1. Instale o PyInstaller (se ainda nÃ£o fez):

   ```sh
   pip install pyinstaller
   ```

2. Gere o executÃ¡vel:

   ```sh
   pyinstaller --onefile get_wi_fi.py
   ```

3. Para ocultar o console, utilize `pyinstaller --onefile --noconsole get_wi_fi.py`.
4. O executÃ¡vel estarÃ¡ em `dist/get_wi_fi.exe` â€” execute como administrador para listar senhas Wi-Fi.

---

Cara-Core InformÃ¡tica â€” soluÃ§Ãµes em tecnologia para o seu negÃ³cio.

