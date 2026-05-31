# Correção do Erro 400 Microsoft OAuth - Processo Correto

## Entendendo o Erro 400 (AADSTS70000)

O erro **AADSTS70000** indica que:
> "The request was denied because one or more scopes requested are unauthorized or expired. The user must first sign in and grant the client application access to the requested scope."

### Causa Raiz

O erro ocorre quando:
1. **Escopos não configurados no Azure AD** - O App Registration não tem os escopos necessários configurados
2. **Escopos não autorizados pelo usuário** - O usuário não concedeu as permissões necessárias
3. **Tenant mismatch** - O código foi gerado para um tenant, mas o backend tenta trocar usando outro tenant
4. **Redirect URI não corresponde** - O redirect_uri usado na troca não corresponde ao configurado

## Processo Correto para Resolver

### 1. Configurar Escopos no Azure AD (App Registration)

#### Passo 1: Acessar App Registration
1. Acesse [Azure Portal - App Registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Localize o App Registration: **Cara-Core Area51** (Client ID: `8ef17663-438f-4777-99ca-c5ad5b2a2993`)
3. Clique no app

#### Passo 2: Configurar API Permissions
1. No menu lateral, clique em **API permissions**
2. Verifique se os seguintes escopos estão configurados:
   - ✅ `openid` (delegated) - Microsoft Graph
   - ✅ `profile` (delegated) - Microsoft Graph
   - ✅ `email` (delegated) - Microsoft Graph
   - ✅ `offline_access` (delegated) - Microsoft Graph (opcional, para refresh token)

3. **Se faltar algum escopo:**
   - Clique em **+ Add a permission**
   - Selecione **Microsoft Graph**
   - Selecione **Delegated permissions**
   - Marque os escopos necessários
   - Clique em **Add permissions**

4. **IMPORTANTE:** Para contas pessoais (hotmail.com, outlook.com):
   - Os escopos `openid`, `profile`, `email` são **sempre disponíveis** e não precisam de consentimento administrativo
   - O escopo `offline_access` pode precisar de consentimento do usuário

#### Passo 3: Verificar Redirect URIs
1. No menu lateral, clique em **Authentication**
2. Em **Web platform**, verifique se as seguintes Redirect URIs estão configuradas:
   - ✅ `https://www.caracore.com.br/secure/callback.html`
   - ✅ `http://localhost:8000/secure/callback.html` (desenvolvimento)

3. **IMPORTANTE:** O Redirect URI deve corresponder **EXATAMENTE** ao usado no código
   - Verifique em `js/config.js` ou `secure/js/config.js`
   - Deve ser: `window.location.origin + "/secure/callback.html"`

#### Passo 4: Configurar Supported Account Types
1. Em **Authentication**, role até **Supported account types**
2. Para suportar contas pessoais Microsoft (hotmail.com, outlook.com):
   - Selecione: **Accounts in any organizational directory and personal Microsoft accounts (e.g. Skype, Xbox)**
   - Ou: **Personal Microsoft accounts only**

### 2. Garantir que os Escopos são Solicitados Corretamente

#### Frontend - Verificar Escopos Solicitados

**Arquivo:** `js/config.js` ou `secure/js/config.js`

```javascript
azure: {
  clientId: "8ef17663-438f-4777-99ca-c5ad5b2a2993",
  authority: "https://login.microsoftonline.com/consumers/v2.0",
  scopes: ["openid", "profile", "email", "offline_access"]  // ✅ Correto
}
```

**Verificar:**
- ✅ Escopos devem ser: `["openid", "profile", "email"]` (mínimo)
- ✅ `offline_access` é opcional mas recomendado para refresh token
- ✅ Não adicionar escopos que não estão configurados no Azure AD

#### Backend - Verificar Escopos Enviados

**Arquivo:** `backend/app.py`

```python
DEFAULT_AZURE_SCOPE = "openid profile email offline_access"
```

**Verificar:**
- ✅ O backend deve usar os mesmos escopos do frontend
- ✅ Variável `AZURE_SCOPE` no ambiente (se configurada) deve corresponder

### 3. Resolver Tenant Mismatch

#### Problema
- Frontend usa: `https://login.microsoftonline.com/consumers/v2.0` (contas pessoais)
- Backend pode usar: Tenant específico ou `common`

#### Solução

**Opção A: Usar `consumers` no Backend (Recomendado para contas pessoais)**

No Azure App Service Configuration:
```
AZURE_TENANT_ID=consumers
```

**Opção B: Usar `common` no Backend (Suporta ambos)**

No Azure App Service Configuration:
```
AZURE_TENANT_ID=common
```

**Opção C: Enviar tenant do frontend para o backend**

O código já implementa isso em `oidc-callback-microsoft.js`:
```javascript
// Extrair tenant da authority
let tenant = 'consumers';
const authority = config.azureAuthority || 'https://login.microsoftonline.com/consumers';
const match = authority.match(/login\.microsoftonline\.com\/([^\/]+)/i);
if (match && match[1]) {
    tenant = match[1].replace(/\/v2\.0$/i, '').trim();
}

// Enviar tenant no request
requestBody.tenant = tenant;
```

**Backend já suporta isso:**
```python
tenant_override = payload.get("tenant")
token_endpoint = resolve_azure_token_endpoint(tenant_override)
```

### 4. Garantir que o Usuário Concede Permissões

#### Problema
Mesmo com escopos configurados, o usuário precisa **conceder consentimento** na primeira vez.

#### Solução

**Adicionar `prompt=consent` na URL de autorização:**

No frontend, ao iniciar o fluxo OAuth:
```javascript
const authUrl = `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?
  client_id=${clientId}&
  response_type=code&
  redirect_uri=${redirectUri}&
  scope=openid profile email offline_access&
  prompt=consent&  // ✅ Força consentimento
  state=${state}&
  code_challenge=${codeChallenge}&
  code_challenge_method=S256`;
```

**Verificar se o oidc-client-ts está usando prompt:**
```javascript
// Em auth-standalone.js ou similar
const config = {
  // ...
  prompt: "consent", // Força consentimento
  // ...
};
```

### 5. Verificar Credenciais no Backend

#### Variáveis Necessárias no Azure App Service

1. **AZURE_CLIENT_ID**
   - Valor: `8ef17663-438f-4777-99ca-c5ad5b2a2993`
   - Deve corresponder ao Client ID do App Registration

2. **AZURE_CLIENT_SECRET**
   - Obter no Azure AD → App Registration → Certificates & secrets
   - Criar novo secret se necessário
   - ⚠️ Copiar o valor imediatamente (só aparece uma vez)

3. **AZURE_TENANT_ID**
   - Para contas pessoais: `consumers` ou `common`
   - Para contas corporativas: Tenant ID específico

#### Verificar Configuração

Execute o diagnóstico:
```bash
python scripts/diagnose_microsoft_oauth_simple.py
```

Ou acesse:
```
https://caracore-backend-docker.azurewebsites.net/health/oauth/microsoft
```

### 6. Fluxo Correto Esperado

#### Passo 1: Autorização
```
Frontend → Microsoft:
GET https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?
  client_id=8ef17663-438f-4777-99ca-c5ad5b2a2993&
  response_type=code&
  redirect_uri=https://www.caracore.com.br/secure/callback.html&
  scope=openid profile email offline_access&
  prompt=consent&
  state=xxx&
  code_challenge=xxx&
  code_challenge_method=S256
```

**Microsoft responde:**
- ✅ Usuário concede permissões
- ✅ Microsoft retorna código de autorização

#### Passo 2: Troca de Código por Token
```
Frontend → Backend:
POST /oauth/microsoft/token
{
  "code": "autorization_code_from_microsoft",
  "redirect_uri": "https://www.caracore.com.br/secure/callback.html",
  "code_verifier": "xxx",
  "tenant": "consumers"
}

Backend → Microsoft:
POST https://login.microsoftonline.com/consumers/oauth2/v2.0/token
{
  "client_id": "8ef17663-438f-4777-99ca-c5ad5b2a2993",
  "client_secret": "xxx",
  "code": "autorization_code_from_microsoft",
  "redirect_uri": "https://www.caracore.com.br/secure/callback.html",
  "grant_type": "authorization_code",
  "code_verifier": "xxx",
  "scope": "openid profile email offline_access"
}
```

**Microsoft responde:**
- ✅ Token de acesso
- ✅ ID token (com email do usuário)
- ✅ Refresh token (se `offline_access` foi solicitado)

## Checklist de Verificação

### Azure AD (App Registration)
- [ ] Escopos configurados: `openid`, `profile`, `email`
- [ ] Redirect URIs configurados corretamente
- [ ] Supported account types inclui contas pessoais
- [ ] Client Secret válido e não expirado

### Backend (Azure App Service)
- [ ] `AZURE_CLIENT_ID` configurado
- [ ] `AZURE_CLIENT_SECRET` configurado e válido
- [ ] `AZURE_TENANT_ID` = `consumers` ou `common` (para contas pessoais)
- [ ] `AZURE_SCOPE` = `openid profile email offline_access` (se configurado)

### Frontend
- [ ] Escopos solicitados: `["openid", "profile", "email", "offline_access"]`
- [ ] Authority: `https://login.microsoftonline.com/consumers/v2.0`
- [ ] Redirect URI: `window.location.origin + "/secure/callback.html"`
- [ ] `prompt=consent` na URL de autorização (primeira vez)

### Teste
- [ ] Usuário consegue autorizar no Microsoft
- [ ] Backend recebe código de autorização
- [ ] Backend troca código por token com sucesso (sem erro 400)
- [ ] Email do usuário é extraído do ID token
- [ ] Usuário autorizado acessa área restrita

## Solução de Problemas

### Erro 400: AADSTS70000
**Causa:** Escopos não autorizados
**Solução:**
1. Verificar se escopos estão configurados no Azure AD
2. Adicionar `prompt=consent` para forçar consentimento
3. Verificar se usuário concedeu permissões

### Erro 400: Tenant Mismatch
**Causa:** Código gerado para `/consumers` mas backend usa tenant específico
**Solução:**
1. Configurar `AZURE_TENANT_ID=consumers` no backend
2. Ou enviar `tenant=consumers` no request do frontend

### Erro 400: Redirect URI Mismatch
**Causa:** Redirect URI não corresponde
**Solução:**
1. Verificar Redirect URI no Azure AD
2. Verificar Redirect URI no código frontend
3. Devem ser **exatamente** iguais

### Erro 500: Credenciais Ausentes
**Causa:** Variáveis não configuradas no App Service
**Solução:**
1. Configurar `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`
2. Verificar se Client Secret não expirou

## Referências

- [Microsoft Identity Platform - OAuth 2.0](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
- [Microsoft Graph Permissions](https://learn.microsoft.com/en-us/graph/permissions-reference)
- [Azure AD App Registration](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)

