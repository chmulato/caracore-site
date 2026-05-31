# Configuração Microsoft OAuth para Consumers (Contas Pessoais)

## Objetivo

Configurar o sistema para usar **`consumers`** como tenant padrão, permitindo autenticação apenas com contas pessoais Microsoft (hotmail.com, outlook.com, live.com, etc.).

## Configuração no Azure App Service

### Passo 1: Acessar Azure Portal

1. Acesse [Azure Portal](https://portal.azure.com)
2. Navegue até **App Services**
3. Selecione: **caracore-backend-docker**

### Passo 2: Configurar Variáveis de Ambiente

1. No menu lateral, clique em **Configuration**
2. Na aba **Application settings**, adicione/edite as seguintes variáveis:

#### Variável 1: AZURE_TENANT_ID
- **Name:** `AZURE_TENANT_ID`
- **Value:** `consumers`
- **Deployment slot setting:** Desmarcado

#### Variável 2: AZURE_CLIENT_ID
- **Name:** `AZURE_CLIENT_ID`
- **Value:** `8ef17663-438f-4777-99ca-c5ad5b2a2993`
- **Deployment slot setting:** Desmarcado

#### Variável 3: AZURE_CLIENT_SECRET
- **Name:** `AZURE_CLIENT_SECRET`
- **Value:** `<obtenha no Azure AD - veja abaixo>`
- **Deployment slot setting:** Desmarcado

### Passo 3: Salvar Configurações

1. Clique em **Save** no topo da página
2. Aguarde confirmação: "Application settings updated successfully"
3. O App Service será **reiniciado automaticamente**
4. Aguarde 1-2 minutos para o reinício completar

## Obter Client Secret do Azure AD

### Passo a Passo:

1. **Acesse Azure Portal:**
   - [Azure Portal - App Registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)

2. **Localize o App Registration:**
   - Procure pelo Client ID: `8ef17663-438f-4777-99ca-c5ad5b2a2993`
   - Ou procure por: **Cara-Core Area51**

3. **Vá para Certificates & secrets:**
   - No menu lateral, clique em **Certificates & secrets**

4. **Criar/Verificar Client Secret:**
   - Se já existe um secret ativo e não expirado, você pode usá-lo
   - ⚠️ **IMPORTANTE:** Você não pode ver o valor de um secret existente
   - Se não souber o valor, crie um novo:
     - Clique em **+ New client secret**
     - **Description:** "Production Secret - Consumers"
     - **Expires:** Escolha período (recomendado: 24 meses)
     - Clique em **Add**
     - ⚠️ **CRÍTICO:** Copie o **Value** imediatamente! Ele só será exibido uma vez.

5. **Copiar para App Service:**
   - Cole o valor no campo `AZURE_CLIENT_SECRET` no App Service Configuration

## Configuração no Azure AD (App Registration)

### Verificar Supported Account Types

1. No App Registration, vá para **Authentication**
2. Em **Supported account types**, verifique:
   - ✅ **Personal Microsoft accounts only** (recomendado para consumers)
   - Ou: **Accounts in any organizational directory and personal Microsoft accounts**

### Verificar Redirect URIs

1. Em **Authentication** → **Web platform**
2. Verifique se está configurado:
   - ✅ `https://www.caracore.com.br/secure/callback.html`
   - ✅ `http://localhost:8000/secure/callback.html` (desenvolvimento)

### Verificar API Permissions

1. Vá para **API permissions**
2. Verifique se os seguintes escopos estão configurados:
   - ✅ `openid` (delegated) - Microsoft Graph
   - ✅ `profile` (delegated) - Microsoft Graph
   - ✅ `email` (delegated) - Microsoft Graph
   - ✅ `offline_access` (delegated) - Microsoft Graph (opcional)

## Configuração no Frontend

### Verificar Configuração Atual

Os arquivos de configuração já estão configurados para `consumers`:

**`js/config.js` e `secure/js/config.js`:**
```javascript
azure: {
  clientId: "8ef17663-438f-4777-99ca-c5ad5b2a2993",
  authority: "https://login.microsoftonline.com/consumers/v2.0",  // ✅ Já configurado
  scopes: ["openid", "profile", "email", "offline_access"]
}
```

✅ **Não é necessário alterar o frontend** - já está configurado corretamente.

## Verificação da Configuração

### 1. Verificar Variáveis no App Service

Execute o diagnóstico:
```bash
python scripts/diagnose_microsoft_oauth_simple.py
```

Ou acesse diretamente:
```
https://caracore-backend-docker.azurewebsites.net/health/oauth/microsoft
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "microsoft_oauth": {
    "all_required_configured": true,
    "required_variables": {
      "AZURE_CLIENT_ID": {"configured": true},
      "AZURE_CLIENT_SECRET": {"configured": true},
      "AZURE_TENANT_ID": {"configured": true, "value": "consumers"}
    }
  }
}
```

### 2. Verificar Logs do Backend

Após configurar, os logs devem mostrar:
```
AZURE_TENANT_ID definido (valor oculto)
Token endpoint Microsoft configurado: https://login.microsoftonline.com/consumers/oauth2/v2.0/token
```

### 3. Testar Login

1. Acesse: [https://www.caracore.com.br/secure/index.html](https://www.caracore.com.br/secure/index.html)
2. Clique em **"Continuar com Microsoft"**
3. Faça login com conta pessoal (hotmail.com, outlook.com)
4. Deve funcionar sem erro 400

## Comportamento Esperado

### Com `AZURE_TENANT_ID=consumers`:

✅ **Funciona:**
- Contas pessoais Microsoft (hotmail.com, outlook.com, live.com, msn.com)
- Contas Xbox pessoais
- Contas Skype pessoais

❌ **NÃO funciona:**
- Contas corporativas/organizacionais
- Contas de outros tenants

### Fluxo Correto:

```
1. Frontend → Microsoft: 
   GET https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize
   
2. Microsoft → Frontend: 
   Código de autorização (válido para /consumers)
   
3. Frontend → Backend: 
   POST /oauth/microsoft/token
   { "code": "...", "tenant": "consumers" }
   
4. Backend → Microsoft: 
   POST https://login.microsoftonline.com/consumers/oauth2/v2.0/token
   ✅ CORRETO - mesmo tenant usado na autorização
   
5. Microsoft → Backend: 
   ✅ Token de acesso + ID token (com email)
```

## Troubleshooting

### Problema: Erro 400 - Tenant Mismatch

**Sintoma:**
```
AADSTS70000121: The passed grant is from a personal Microsoft account 
and is required to be sent to the /consumers or /common endpoint.
```

**Solução:**
1. Verificar se `AZURE_TENANT_ID=consumers` está configurado
2. Verificar se o frontend está enviando `tenant=consumers` no request
3. Verificar logs do backend para confirmar qual tenant está sendo usado

### Problema: Erro 400 - AADSTS70000 (Escopos não autorizados)

**Sintoma:**
```
AADSTS70000: The request was denied because one or more scopes requested 
are unauthorized or expired.
```

**Solução:**
1. Verificar se escopos estão configurados no Azure AD → API permissions
2. Adicionar `prompt=consent` na URL de autorização (primeira vez)
3. Verificar se usuário concedeu permissões

### Problema: Erro 500 - Credenciais Ausentes

**Sintoma:**
```
Server not configured with Microsoft Entra client credentials
```

**Solução:**
1. Verificar se `AZURE_CLIENT_ID` está configurado
2. Verificar se `AZURE_CLIENT_SECRET` está configurado e não expirado
3. Verificar se `AZURE_TENANT_ID` está configurado como `consumers`

## Checklist Final

- [ ] `AZURE_TENANT_ID=consumers` configurado no App Service
- [ ] `AZURE_CLIENT_ID` configurado no App Service
- [ ] `AZURE_CLIENT_SECRET` configurado e válido no App Service
- [ ] App Service reiniciado após configuração
- [ ] Redirect URIs configurados no Azure AD
- [ ] API Permissions configuradas no Azure AD
- [ ] Supported account types = "Personal Microsoft accounts only"
- [ ] Frontend usando `authority: "https://login.microsoftonline.com/consumers/v2.0"`
- [ ] Teste de login bem-sucedido com conta pessoal

## Referências

- [Microsoft Identity Platform - Consumers](https://learn.microsoft.com/en-us/azure/active-directory/develop/single-and-multi-tenant-apps#who-can-sign-in)
- [OAuth 2.0 Authorization Code Flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
- [Azure AD App Registration](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)

