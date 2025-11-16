# Correção do Erro 400 Microsoft OAuth - Tenant Mismatch

## Problema Identificado

O log mostra o seguinte erro ao tentar fazer login com conta pessoal da Microsoft (hotmail.com):

```
AADSTS70000121: The passed grant is from a personal Microsoft account and is required to be sent to the /consumers or /common endpoint.
```

### Causa Raiz

1. **Frontend**: Usa `/consumers` para autorização (contas pessoais)
2. **Backend**: Usa tenant específico (`189c46ad-e437-48bd-bc87-050ef735c2c7`) configurado em `AZURE_TENANT_ID`
3. **Mismatch**: O código de autorização foi gerado com `/consumers`, mas o backend tenta trocar por token usando o tenant específico

### Fluxo do Erro

```
1. Frontend → Microsoft: Autorização com /consumers
2. Microsoft → Frontend: Código de autorização (válido para /consumers)
3. Frontend → Backend: Envia código (sem informar tenant)
4. Backend → Microsoft: Tenta trocar código usando tenant específico
5. Microsoft → Backend: ERRO 400 - código foi gerado para /consumers, não para tenant específico
```

## Solução Implementada

### 1. Frontend - Extração e Envio do Tenant

Modificado `secure/js/oauth-callback-auto-fix.js` para:
- Extrair o tenant da authority usada na autorização
- Incluir o parâmetro `tenant` no request para o backend

```javascript
// Extrair tenant da authority usada (para Microsoft)
let tenant = null;
if (provider === 'microsoft' || provider === 'entra') {
    const authority = config.azureAuthority || 'https://login.microsoftonline.com/consumers';
    const match = authority.match(/login\.microsoftonline\.com\/([^\/]+)/i);
    if (match && match[1]) {
        tenant = match[1].replace(/\/v2\.0$/i, '').trim();
    } else {
        tenant = 'consumers'; // Fallback
    }
}

// Adicionar tenant no request
if (tenant && (provider === 'microsoft' || provider === 'entra')) {
    requestBody.tenant = tenant;
}
```

### 2. Backend - Uso do Tenant do Request

O backend já suporta receber `tenant_override` no payload (linha 1127 de `backend/app.py`):

```python
tenant_override = payload.get("tenant")
token_endpoint = resolve_azure_token_endpoint(tenant_override)
```

A função `resolve_azure_token_endpoint` usa o `tenant_override` se fornecido, caso contrário usa `AZURE_TENANT_ID` ou `common` como fallback.

## Configuração Recomendada

### Opção 1: Usar `/common` (Recomendado)

Configurar `AZURE_TENANT_ID=common` no Azure App Service. Isso permite:
- ✅ Contas pessoais (hotmail.com, outlook.com)
- ✅ Contas corporativas do tenant específico
- ✅ Contas de outros tenants (multi-tenant)

### Opção 2: Usar `/consumers` (Apenas Contas Pessoais)

Configurar `AZURE_TENANT_ID=consumers` no Azure App Service. Isso permite:
- ✅ Contas pessoais (hotmail.com, outlook.com)
- ❌ Contas corporativas (não funcionam)

### Opção 3: Tenant Específico + Frontend Envia Tenant

Manter `AZURE_TENANT_ID` com tenant específico, mas garantir que o frontend sempre envie o `tenant` correto no request (já implementado).

## Teste

Após a correção, testar com:
1. Conta pessoal Microsoft (hotmail.com, outlook.com)
2. Conta corporativa (se aplicável)

O log deve mostrar:
- ✅ Frontend extraindo tenant: `consumers`
- ✅ Frontend incluindo tenant no request
- ✅ Backend usando tenant correto no token endpoint
- ✅ Login bem-sucedido

## Logs Esperados

### Sucesso
```
✅ Tenant extraído da authority: consumers
✅ Tenant incluído no request: consumers
Token endpoint Microsoft configurado: https://login.microsoftonline.com/consumers/oauth2/v2.0/token
```

### Erro (se ainda ocorrer)
```
⚠️ Não foi possível extrair tenant, usando fallback: consumers
```

## Referências

- [Microsoft Identity Platform - Tenant Types](https://learn.microsoft.com/en-us/azure/active-directory/develop/single-and-multi-tenant-apps)
- [OAuth 2.0 Authorization Code Flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)

