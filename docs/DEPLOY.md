# Deploy Guide - Cara Core OIDC

## Visão Geral

Este documento descreve como fazer deploy do site Cara Core com autenticação OIDC (OpenID Connect) em dois cenários:

- GitHub Pages (conteúdo estático)
- Azure App Service (Linux, Python/Flask) com backend para troca de token do Google e segredos armazenados no Key Vault

### Destaques recentes

- **Proxy de token inteligente** – o frontend detecta automaticamente quando está em produção e encaminha `/oauth/google/token` para `https://api-caracore.azurewebsites.net`. Em desenvolvimento local, a troca de código continua usando o `server.py`. Para domínios alternativos, defina `window.CARA_CORE_CONFIG.backendBaseUrl` antes de carregar `secure/log-config.js`.
- **Persistência de provedor** – `secure/auth-standalone.js` armazena o último provedor selecionado (Google ou Microsoft Entra) para aplicar a mesma authority durante o callback. Ao alternar provedores em um único navegador, limpe `sessionStorage`/`localStorage` ou reutilize os botões da interface para sobrescrever a escolha.

## Variáveis Secretas Configuradas no GitHub

✅ **Repository Secrets configurados:**

```text
| Nome                    | Descrição                         | Status          |
|-------------------------|-----------------------------------|-----------------|
| `AZURE_CLIENT_ID`       | Client ID do Azure/Entra          | ✅ Configurado |
| `AZURE_CLIENT_SECRET`   | Client Secret do Azure/Entra      | ✅ Configurado |
| `AZURE_CREDENTIALS`     | Credenciais completas do Azure    | ✅ Configurado |
| `AZURE_SUBSCRIPTION_ID` | ID da Subscription Azure          | ✅ Configurado |
| `AZURE_TENANT_ID`       | Tenant ID do Azure/Entra          | ✅ Configurado |
| `ENTRA_CLIENT_SECRET`   | Client Secret específico do Entra | ✅ Configurado |
| `GOOGLE_CLIENT_SECRET`  | Client Secret do Google           | ✅ Configurado |
```

## URLs de Produção

### GitHub Pages

- **Site Principal:** `https://www.caracore.com.br/`
- **Espelho GitHub Pages:** `https://chmulato.github.io/cara-core/`
- **Página inicial da área segura:** `https://www.caracore.com.br/secure/index.html`
- **Callback OIDC (redirect_uri):** `https://www.caracore.com.br/secure/callback.html`
- **Área Restrita:** `https://www.caracore.com.br/secure/restrita.html`
- **Logout:** `https://www.caracore.com.br/secure/logout.html`


## Como Fazer Deploy

### 1. Deploy Automático (GitHub Pages via GitHub Actions)

```bash
# Fazer push para a branch main
git add .
git commit -m "Deploy: Update site"
git push origin main
```

O GitHub Actions irá automaticamente:

1. ✅ Instalar dependências Node.js
1. ✅ Executar script de build (`scripts/build.sh`)
1. ✅ Configurar URLs de produção nas configs OIDC
1. ✅ Deploy para GitHub Pages

### 2. Build Local para Desenvolvimento

```bash
# Linux/macOS
npm run build:dev
# ou
bash scripts/build.sh

# Windows
npm run build:windows
# ou
scripts\build.bat
```

### 3. Build Local para Produção

```bash
# Simular build de produção
npm run build:prod
```

## 🌍 Configurações por Ambiente

### Desenvolvimento (localhost)

- **Base URL:** `http://localhost:8000`
- **Log Level:** `DEBUG`
- **Console Logging:** `true`
- **Debug Panel:** `true`

### Produção (GitHub Pages)

- **Base URL:** `https://chmulato.github.io/cara-core`
- **Log Level:** `WARN`
- **Console Logging:** `false`
- **Debug Panel:** `false`
- **Token Endpoint (auto):** `https://api-caracore.azurewebsites.net/oauth/google/token`

#### Ajustando o backend em ambientes personalizados

Caso o token proxy esteja hospedado em outro domínio (por exemplo, um slot do App Service ou API corporativa), informe o destino antes de carregar `secure/log-config.js`:

```html
<script>
  window.CARA_CORE_CONFIG = {
    backendBaseUrl: 'https://api-suaempresa.azurewebsites.net'
    // Opcional: substitua manualmente o endpoint
    // googleTokenEndpoint: 'https://api-suaempresa.azurewebsites.net/oauth/google/token'
  };
</script>
```

O script atualizará `window.CARA_CORE_ENV.backendBaseUrl` e, se o endpoint ainda estiver no valor padrão (`/oauth/google/token`), substituirá automaticamente pelo endereço informado.

## Pré-requisitos para Testes Locais

1. Certifique-se de que o Docker Desktop (ou Docker Engine) está em execução — o `server.py` usa `docker/docker-compose.yml` para subir o backend Linux automaticamente.
1. Instale dependências Python (globalmente ou em um ambiente virtual já ativado):

```powershell
py -3.13 -m pip install --upgrade pip
py -3.13 -m pip install -r requirements.txt
```

1. Execute o script de build:

```powershell
# Windows
scripts\build.bat

# ou Linux/macOS
bash scripts/build.sh
```

1. Inicie o servidor local (isso também sobe o backend Linux em um contêiner):

```powershell
python server.py
```

1. Valide o backend local executando os smoke tests:

```powershell
python teste_end_point_local.py
```

  A saída deve listar seis verificações `OK`, cobrindo `/health`, CORS e os fluxos de troca de token sem credenciais configuradas.

## ⚙️ Configuração dos Provedores OIDC

### Google Cloud Console

1. Acessar [Google Cloud Console](https://console.cloud.google.com/)
1. Navegar para **APIs & Services > Credentials**
1. Editar OAuth 2.0 Client ID
1. Configure os campos:
   - Authorized redirect URIs (obrigatório):
     - `https://chmulato.github.io/cara-core/secure/callback.html`
     - `http://localhost:8000/secure/callback.html` (desenvolvimento)
   - Authorized JavaScript origins (recomendado):
     - `https://chmulato.github.io`
     - `http://localhost:8000`

### Microsoft Azure Portal / Microsoft Entra ID

1. Acessar [Azure Portal](https://portal.azure.com/)
1. Navegar para **App Registrations**
1. Selecionar a aplicação do Entra ID
1. Configurar filtros em **Authentication > Platform configurations > Web** e garantir:

- `https://chmulato.github.io/cara-core/secure/callback.html`
- `https://www.caracore.com.br/secure/callback.html`
- `http://localhost:8000/secure/callback.html` (desenvolvimento)
- Authority (padrão para contas pessoais): `https://login.microsoftonline.com/consumers/v2.0`
- Após ajustes, force o recarregamento de `/secure/index.html` (`Ctrl + F5`) para garantir que o provedor persistido seja atualizado.

## Arquivos de Configuração Gerados

Durante o build, os seguintes arquivos são criados automaticamente:

### `secure/config/google.json`

```json
{
  "authority": "https://accounts.google.com",
  "client_id": "1023942712021-...",
  "redirect_uri": "[BASE_URL]/secure/callback.html",
  "response_type": "code",
  "scope": "openid profile email",
  "post_logout_redirect_uri": "[BASE_URL]/secure/logout.html"
}
```

### `secure/config/entra.json`

```json
{
  "authority": "https://login.microsoftonline.com/consumers/v2.0",
  "client_id": "8ef17663-...",
  "redirect_uri": "[BASE_URL]/secure/callback.html",
  "response_type": "code",
  "scope": "openid profile email"
}
```

### `secure/log-config.js`

```javascript
window.OIDC_LOG_CONFIG = {
  logLevel: 'WARN', // ou 'DEBUG' em dev
  consoleLogging: false, // ou true em dev
  debugPanel: false, // ou true em dev
  environment: 'production' // ou 'development'
};
```

## Troubleshooting

### Erro: "Redirect URI Mismatch"

- ✅ Verificar URLs nos consoles Google/Azure (usar sempre `/secure/callback.html`)
- ✅ Confirmar que as URLs estão exatamente iguais
- ✅ Certificar que não há espaços em branco

### Erro: "CORS Policy"

- ✅ Verificar domínios autorizados nos provedores
- ✅ Confirmar configuração HTTPS em produção

### Erro: Microsoft Entra AADSTS9002346 (Contas pessoais)

- ✅ Use a autoridade com `/consumers` (ex.: `https://login.microsoftonline.com/consumers/v2.0`)
- ✅ Garanta que o redirect URI aponta para `/secure/callback.html`

### Erro: `callback_failed&reason=authority mismatch`

- ✅ Refaça o login usando o botão "Continuar com Microsoft" para que o provedor seja persistido corretamente.
- ✅ Limpe os registros `cara_core_oidc_provider` do `sessionStorage`/`localStorage` antes de alternar entre Google e Entra no mesmo navegador de testes.
- ✅ Confirme que as Redirect URIs do Entra incluem `https://www.caracore.com.br/secure/callback.html` e o espelho GitHub Pages.
- ✅ Force o recarregamento (`Ctrl + F5`) para garantir que o navegador carregue a versão mais recente de `secure/auth-standalone.js`.

### Logs não aparecendo

- ✅ Verificar se `secure/log-config.js` foi criado
- ✅ Confirmar configuração de ambiente
- ✅ Verificar console do navegador

### Como testar localmente

1. Execute o script de build para desenvolvimento:

```powershell
# Windows
scripts\build.bat

# Linux/macOS
bash scripts/build.sh
```

1. Inicie o servidor local:

```powershell
python server.py
```

1. Abra `http://localhost:8000/secure/` no navegador

1. Clique em "Entrar com Google" ou "Entrar com Microsoft"

Se algo falhar, verifique:

- Console do navegador para erros JavaScript
- Debug panel (em desenvolvimento)
- Logs exportados do sistema OIDC

### Backend via Docker (espelhando App Service)

Para reproduzir localmente a infraestrutura do App Service (incluindo variáveis de ambiente e gunicorn):

1. Copie `docker/backend.env.sample` para `docker/backend.env` e preencha `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` **e** `AZURE_CLIENT_ID`/`AZURE_CLIENT_SECRET`/`AZURE_TENANT_ID` com valores válidos (use credenciais de teste, não as de produção, se possível; utilize `AZURE_TENANT_ID=common` se quiser rodar em modo multi-tenant e edite `AZURE_SCOPE` somente se precisar de escopos extras).
1. Ajuste `ORIGIN_ALLOWED` e `OAUTH_REDIRECT_URI` conforme a URL do site local (por exemplo, `http://localhost:8000`).
1. Execute o backend com Docker:

  ```powershell
  cd docker
  docker compose up --build
  ```

1. Valide o backend acessando `http://localhost:5051/health`. O log no terminal deve mostrar `Backend inicializado`.
1. Para parar o ambiente: `docker compose down`.

> O arquivo `docker/backend.env` está ignorado no Git. Sempre que renovar o segredo no Azure, atualize o valor local correspondente e reinicie o container para manter o ambiente em sincronia.

## Monitoramento

### Métricas Coletadas

- ✅ Tentativas de login por provedor
- ✅ Sucessos/falhas de autenticação
- ✅ Duração de sessões
- ✅ Erros de OIDC por tipo

### Logs de Sistema

- ✅ Logs salvos automaticamente no localStorage
- ✅ Export disponível em JSON/CSV
- ✅ Filtragem por nível de log

---

## 🚀 Deploy no Azure App Service (Python/Flask)

Quando você precisa de backend (por exemplo, para a troca de código por tokens do Google no servidor) e segredos protegidos, utilize o App Service com Key Vault. **A infraestrutura precisa estar provisionada antes do deploy do artefato.**

### Fluxo resumido

1. **Provisionar/atualizar infraestrutura com `infra_to_azure.py`**
2. **Preparar o pacote do backend (`backend.zip`) e dependências**
3. **Publicar o pacote com `deploy_to_azure.py` (Zip Deploy/Run From Package)**
4. **Validar `/health`, CORS e logs**

> Dica: crie um orçamento no Azure para monitorar custos. O portal permite alertas mensais em **Cost Management > Budgets** com notificação por e-mail.

### Pré-requisitos

- Azure CLI instalada: <https://aka.ms/install-azure-cli>
- Login no Azure e seleção da assinatura:

  ```powershell
  az login
  az account set --subscription "<SUBSCRIPTION_NAME_OR_ID>"
  $env:AZURE_SUBSCRIPTION_ID = (az account show --query id -o tsv)
  $env:AZURE_TENANT_ID       = (az account show --query tenantId -o tsv)
  ```

- Ambiente Python configurado (executando `pip install -r requirements.txt`)
- Permissões para criar/gerenciar Resource Group, App Service Plan, Web App, Key Vault e Managed Identity

### 1. Provisionar infraestrutura com `infra_to_azure.py`

O script cuida de:

- Registrar provedores e assegurar Resource Group
- Criar/atualizar App Service Plan Linux e Web App (Python)
- Configurar Managed Identity
- Criar Key Vault (opcional) e associar segredos/App Settings (incluindo `GOOGLE_CLIENT_SECRET`)
- Ajustar CORS e URLs permitidas

#### Modo interativo (recomendado)

```powershell
python infra_to_azure.py
```

Durante a execução responda às perguntas sobre nomes de recursos, location, Key Vault e segredos.

#### Modo não interativo (CI/CD)

```powershell
python infra_to_azure.py `
  --subscription-id $env:AZURE_SUBSCRIPTION_ID `
  --resource-group rg-caracore `
  --location brazilsouth `
  --plan-name plan-caracore `
  --sku B1 `
  --app-name api-caracore `
  --python-version 3.11 `
  --keyvault-name kv-caracore `
  --kv-auth-mode auto `
  --allowed-origins "https://www.caracore.com.br,https://chmulato.github.io" `
  --setting FLASK_ENV=production `
  --setting LOG_LEVEL=INFO `
  --store-google-secret `
  --no-prompt
```

Parâmetros úteis:

- `--env-file .env` carrega KEY=VALUE como App Settings (prioridade menor que `--setting`)
- `--kv-auth-mode auto|access-policy|rbac` define como o Key Vault será acessado
- `--store-google-secret` solicita o valor local e já o envia ao Key Vault
- `--force` reaplica configurações mesmo que recurso exista

> Após criar RBAC/Access Policy aguarde alguns minutos para propagação das permissões.

### 2. Preparar o pacote `backend.zip`

Você pode gerar o pacote manualmente ou deixar o script de deploy cuidar disso.

**Opção 1 – Gerar manualmente (cross-platform):**

```powershell
python package_backend.py --overwrite
```

O utilitário remove `logs/`, `__pycache__/` e arquivos compilados, gerando um ZIP limpo. Alternativas manuais:

**PowerShell (Windows):**

```powershell
Remove-Item -Force -ErrorAction SilentlyContinue backend.zip
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue backend-deploy
robocopy backend backend-deploy /MIR /XD logs __pycache__ .python_packages
Compress-Archive -Path backend-deploy\* -DestinationPath backend.zip
Remove-Item -Recurse -Force backend-deploy
```

**bash (Linux/macOS):**

```bash
rm -f backend.zip
rm -rf backend-deploy
rsync -a backend/ backend-deploy/ --exclude logs --exclude __pycache__ --exclude .python_packages
(cd backend-deploy && zip -r ../backend.zip .)
rm -rf backend-deploy
```

**Opção 2 – Gerar durante o deploy:** use `deploy_to_azure.py --bundle-backend-deps --overwrite` (ver próximo passo). O script instala dependências em `backend/.python_packages` e cria o ZIP automaticamente.

> O pacote precisa ter `app.py` na raiz interna e depender de `gunicorn`. O App Service usa o comando `gunicorn --chdir backend app:app`.

### 3. Fazer o deploy do artefato com `deploy_to_azure.py`

O script assume que a infraestrutura (App Service + Key Vault) já existe.

#### Modo interativo

```powershell
python deploy_to_azure.py --bundle-backend-deps --overwrite --restart
```

Você pode informar manualmente o caminho do ZIP (`--zip backend.zip`). Sem o parâmetro, o script recria o pacote a partir da pasta `backend/` (instalando dependências caso `--bundle-backend-deps` seja usado).

#### Modo não interativo

```powershell
python deploy_to_azure.py `
  --subscription-id $env:AZURE_SUBSCRIPTION_ID `
  --resource-group rg-caracore `
  --app-name api-caracore `
  --backend-dir ./backend `
  --output-zip ./backend.zip `
  --bundle-backend-deps `
  --pip-extra-arg "--upgrade" `
  --overwrite `
  --restart
```

Parâmetros úteis:

- `--zip <arquivo>` usa um pacote já pronto (pula build)
- `--bundle-backend-deps` instala dependências em `.python_packages` antes de zipar
- `--bundle-python <path>` aponta para um Python específico para o `pip`
- `--pip-extra-arg <flag>` adiciona argumentos ao `pip` (pode repetir)
- `--restart` reinicia o Web App após o deploy (útil quando App Settings mudam)

O script executa `az webapp deployment source config-zip` e registra logs em `log/deploy_*.log`.

### 4. Key Vault, segredos e Managed Identity

- Armazene `GOOGLE_CLIENT_SECRET` e demais segredos no Key Vault sempre que possível.
- `infra_to_azure.py` já cria/associa a Managed Identity e garante acesso ao Key Vault (via RBAC ou Access Policy).
- O App Setting gera referências como `@Microsoft.KeyVault(SecretUri=<URI>)`.
- Caso adicione segredos manualmente, execute novamente o script (com `--force` se necessário) para atualizar o App Service.

### 5. Validar o backend publicado

- Execute o smoke test de produção:

  ```powershell
  python teste_end_point_azure.py --base-url https://api-caracore.azurewebsites.net
  ```

  Ajuste `--base-url` ou a variável `AZURE_BACKEND_BASE_URL` para slots ou domínios customizados.
- Reinicie o Web App quando alterar comando de inicialização ou configurações críticas:

  ```powershell
  az webapp restart --resource-group rg-caracore --name api-caracore
  ```

- Verifique `https://<app-name>.azurewebsites.net/health`
- Teste o fluxo via `secure/callback.html`
- Monitore logs com **Log Stream** no portal ou `az webapp log tail` (o backend usa logging estruturado em JSON)

### 6. Dicas para deploy contínuo

- Prefira **Run From Package** ou **Deployment Slots** para reduzir downtime.
- Versione `backend.zip` em um storage seguro (fora do repositório) e valide hashes antes do envio.
- Automatize a sequência `infra_to_azure.py` ➜ testes ➜ `deploy_to_azure.py` em pipelines.
- Automatize a geração do pacote em pipelines (ex.: GitHub Actions) usando os comandos acima.
- Configure alertas de orçamento/custos e, se necessário, um alerta de disponibilidade usando **Azure Monitor**.

### Problemas comuns (Azure)

- `DefaultAzureCredential` falhou: garanta `az login` no mesmo terminal e variáveis `AZURE_SUBSCRIPTION_ID`/`AZURE_TENANT_ID` corretas.
- 403 ao ler segredo do Key Vault: aguarde propagação de RBAC (pode levar alguns minutos) ou verifique a role/Access Policy.
- CORS bloqueando o frontend: confira `--allowed-origins` e a origem real do seu site.
- `ModuleNotFoundError: No module named 'app'`: revise o comando de startup (deve ser `gunicorn --chdir backend app:app`) e a estrutura interna do `backend.zip`.

---

Status: Deploy configurado e pronto para uso

Última atualização: 1º de outubro de 2025
