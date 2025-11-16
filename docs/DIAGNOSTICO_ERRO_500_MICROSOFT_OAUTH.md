# Diagnóstico: Erro 500 no Endpoint Microsoft OAuth

## Problema

O endpoint `/oauth/microsoft/token` está retornando erro 500 (Internal Server Error).

## Causa Identificada

O erro 500 ocorre quando as credenciais Microsoft não estão configuradas no Azure App Service:

```python
if not azure_client_id or not azure_client_secret:
    logger.error("Credenciais Microsoft ausentes no ambiente - respondendo erro 500")
    return jsonify({
        "error": "server_error",
        "error_description": "Server not configured with Microsoft Entra client credentials"
    }), 500
```

## Variáveis Necessárias

O backend precisa das seguintes variáveis de ambiente configuradas no Azure App Service:

### Obrigatórias:
- ✅ `AZURE_CLIENT_ID` - Client ID do App Registration no Azure AD
- ✅ `AZURE_CLIENT_SECRET` - Client Secret do App Registration
- ✅ `AZURE_TENANT_ID` - Tenant ID (ou "common" para contas pessoais)

### Opcionais (com valores padrão):
- `AZURE_SCOPE` - Escopo OAuth (padrão: "openid profile email")
- `AZURE_TOKEN_ENDPOINT` - Endpoint de token (padrão: "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token")

## Diagnóstico

### Método 1: Script Automatizado (Recomendado)

Execute o script de diagnóstico:

```bash
python scripts/diagnose_microsoft_oauth.py
```

O script irá:
- ✅ Verificar se Azure CLI está instalado e autenticado
- ✅ Listar todas as variáveis de ambiente do App Service
- ✅ Identificar quais variáveis estão faltando
- ✅ Fornecer comandos para corrigir

### Método 2: Azure CLI Manual

**1. Verificar variáveis atuais:**

```bash
az webapp config appsettings list \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --query "[?name=='AZURE_CLIENT_ID' || name=='AZURE_CLIENT_SECRET' || name=='AZURE_TENANT_ID'].{name:name, value:value}" \
  --output table
```

**2. Verificar se variáveis estão definidas (sem mostrar valores):**

```bash
az webapp config appsettings list \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --query "[?name=='AZURE_CLIENT_ID' || name=='AZURE_CLIENT_SECRET' || name=='AZURE_TENANT_ID'].name" \
  --output table
```

### Método 3: Portal Azure

1. Acesse: https://portal.azure.com
2. Navegue até: **App Services** → **caracore-backend-docker**
3. Vá em: **Configuration** → **Application settings**
4. Procure por:
   - `AZURE_CLIENT_ID`
   - `AZURE_CLIENT_SECRET`
   - `AZURE_TENANT_ID`

## Correção

### Opção 1: Azure CLI (Recomendado)

```bash
az webapp config appsettings set \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --settings \
    AZURE_CLIENT_ID="ac886d42-bd01-4cf0-9a3b-6014384670dc" \
    AZURE_CLIENT_SECRET="<seu-client-secret>" \
    AZURE_TENANT_ID="189c46ad-e437-48bd-bc87-050ef735c2c7"
```

**⚠️ IMPORTANTE:** Substitua `<seu-client-secret>` pelo valor real do secret.

### Opção 2: Arquivo de Configuração

Se você tem um arquivo `secrets.txt` com as configurações:

```bash
az webapp config appsettings set \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --settings @secrets.txt
```

### Opção 3: Portal Azure

1. Acesse: https://portal.azure.com
2. Navegue até: **App Services** → **caracore-backend-docker**
3. Vá em: **Configuration** → **Application settings**
4. Clique em **+ New application setting** para cada variável:
   - **Name:** `AZURE_CLIENT_ID`
   - **Value:** `ac886d42-bd01-4cf0-9a3b-6014384670dc`
   
   - **Name:** `AZURE_CLIENT_SECRET`
   - **Value:** `<seu-client-secret>` (obtenha no Azure AD)
   
   - **Name:** `AZURE_TENANT_ID`
   - **Value:** `189c46ad-e437-48bd-bc87-050ef735c2c7`
5. Clique em **Save** e aguarde a reinicialização do App Service

## Obter Credenciais do Azure AD

### 1. Obter Client ID e Tenant ID

1. Acesse: https://portal.azure.com
2. Vá em: **Azure Active Directory** → **App registrations**
3. Procure pelo app: **Cara Core OAuth** (ou nome similar)
4. Na página **Overview**, você encontrará:
   - **Application (client) ID** = `AZURE_CLIENT_ID`
   - **Directory (tenant) ID** = `AZURE_TENANT_ID`

### 2. Obter/Criar Client Secret

1. No mesmo App Registration, vá em: **Certificates & secrets**
2. Se não houver secret ativo:
   - Clique em **+ New client secret**
   - Adicione uma descrição (ex: "Production Secret")
   - Escolha o período de expiração
   - Clique em **Add**
   - **⚠️ IMPORTANTE:** Copie o valor imediatamente (não será exibido novamente)
3. Se já houver secret:
   - Verifique se não está expirado
   - Se expirado, crie um novo e atualize no App Service

## Verificar Logs do App Service

Após configurar as variáveis, verifique os logs para confirmar:

```bash
az webapp log tail \
  --name caracore-backend-docker \
  --resource-group rg-caracore
```

Procure por:
- ✅ `"AZURE_CLIENT_ID configurado (valor oculto)"`
- ✅ `"AZURE_CLIENT_SECRET carregado do ambiente"`
- ✅ `"AZURE_TENANT_ID definido (valor oculto)"`

Se ainda houver erro, procure por:
- ❌ `"Credenciais Microsoft ausentes no ambiente"`
- ❌ `"Falha ao chamar Microsoft Token Endpoint"`

## Teste do Endpoint

Após configurar, teste o endpoint:

```bash
curl -X POST https://caracore-backend-docker.azurewebsites.net/oauth/microsoft/token \
  -H "Content-Type: application/json" \
  -d '{
    "code": "test_code",
    "code_verifier": "test_verifier",
    "redirect_uri": "https://www.caracore.com.br/secure/callback.html"
  }'
```

**Esperado:**
- ❌ **Antes:** `500 Internal Server Error` com mensagem sobre credenciais ausentes
- ✅ **Depois:** `400 Bad Request` (esperado, pois o código de teste é inválido, mas confirma que as credenciais estão configuradas)

## Checklist de Verificação

- [ ] Azure CLI instalado e autenticado
- [ ] `AZURE_CLIENT_ID` configurado no App Service
- [ ] `AZURE_CLIENT_SECRET` configurado no App Service (não expirado)
- [ ] `AZURE_TENANT_ID` configurado no App Service
- [ ] App Service reiniciado após configuração
- [ ] Logs do App Service mostram credenciais carregadas
- [ ] Teste do endpoint retorna erro diferente de 500 (mesmo que seja 400)

## Troubleshooting Adicional

### Problema: Secret Expirado

**Sintoma:** Erro 500 mesmo com variáveis configuradas

**Solução:**
1. Crie um novo Client Secret no Azure AD
2. Atualize `AZURE_CLIENT_SECRET` no App Service
3. Reinicie o App Service

### Problema: Client ID Incorreto

**Sintoma:** Erro ao trocar código por token

**Solução:**
1. Verifique se o Client ID está correto no App Registration
2. Verifique se o Redirect URI está configurado corretamente no Azure AD
3. Verifique se o Redirect URI no App Service corresponde ao configurado no Azure AD

### Problema: Tenant ID Incorreto

**Sintoma:** Erro de tenant mismatch

**Solução:**
- Para contas pessoais Microsoft, use `common` ou `consumers`
- Para contas corporativas, use o Tenant ID específico
- Verifique o Tenant ID no App Registration → Overview

## Referências

- [Documentação Azure AD App Registration](https://docs.microsoft.com/azure/active-directory/develop/quickstart-register-app)
- [Configurar App Settings no Azure](https://docs.microsoft.com/azure/app-service/configure-common)
- [Azure CLI - App Service](https://docs.microsoft.com/cli/azure/webapp/config/appsettings)

