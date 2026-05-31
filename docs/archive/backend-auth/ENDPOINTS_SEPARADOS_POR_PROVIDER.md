# Endpoints Separados por Provider - Google e Microsoft

## 📋 Resumo

Os endpoints do backend foram separados por provider (Google e Microsoft) para melhor organização, manutenção e clareza do código.

---

## 🔄 Endpoints de Refresh Token

### ✅ Novos Endpoints (Recomendados)

#### 1. `/auth/token/refresh/google` - Refresh Token Google

**Rota:**
```
POST /auth/token/refresh/google
```

**Request Body:**
```json
{
  "refresh_token": "1//0eWzCyAzVKwXUCgYIAR..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "1//0eWzCyAzVKwXUCgYIAR...",  // Novo refresh token (se fornecido)
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "openid profile email"
}
```

**Características:**
- ✅ Endpoint específico para Google
- ✅ Não requer `scope` no refresh (conforme especificação Google)
- ✅ Não requer parâmetro `provider` (já está no endpoint)
- ✅ Rate limiting específico: `/auth/token/refresh/google`

---

#### 2. `/auth/token/refresh/microsoft` - Refresh Token Microsoft

**Rota:**
```
POST /auth/token/refresh/microsoft
```

**Request Body:**
```json
{
  "refresh_token": "0.AXkA..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "0.AXkA...",  // Novo refresh token (se fornecido)
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "openid profile email offline_access"
}
```

**Características:**
- ✅ Endpoint específico para Microsoft
- ✅ Inclui `scope` no refresh (obrigatório para Microsoft)
- ✅ Não requer parâmetro `provider` (já está no endpoint)
- ✅ Rate limiting específico: `/auth/token/refresh/microsoft`

---

### ⚠️ Endpoint Legado (Deprecated)

#### `/auth/token/refresh` - Genérico

**Status:** ⚠️ **DEPRECATED**

**Rota:**
```
POST /auth/token/refresh
```

**Request Body:**
```json
{
  "refresh_token": "1//0eWzCyAzVKwXUCgYIAR...",
  "provider": "google"  // ou "microsoft"
}
```

**Observações:**
- ⚠️ Mantido apenas para compatibilidade com código legado
- ⚠️ **Não recomendado** para novos desenvolvimentos
- ✅ Use `/auth/token/refresh/google` ou `/auth/token/refresh/microsoft`

---

## 📊 Comparação de Endpoints

| Endpoint | Provider | Scope no Refresh | Status |
|----------|----------|------------------|--------|
| `/auth/token/refresh/google` | Google | ❌ Não requer | ✅ **Recomendado** |
| `/auth/token/refresh/microsoft` | Microsoft | ✅ **Obrigatório** | ✅ **Recomendado** |
| `/auth/token/refresh` | Ambos | Depende do provider | ⚠️ **Deprecated** |

---

## 🔄 Endpoints de Token Exchange (Já Separados)

### ✅ Google

**Rota:**
```
POST /oauth/google/token
```

**Características:**
- ✅ Endpoint específico para Google
- ✅ Validação PKCE
- ✅ Criação de sessão automática (Fase 7)

---

### ✅ Microsoft

**Rota:**
```
POST /oauth/microsoft/token
```

**Características:**
- ✅ Endpoint específico para Microsoft
- ✅ Validação PKCE
- ✅ Suporte a tenant (`consumers` ou corporativo)
- ✅ Criação de sessão automática (Fase 7)

---

## 🔄 Endpoints de Sessão (Genéricos)

### `/auth/session/create`

**Status:** ✅ **Genérico (OK)**

**Razão:** O provider já está incluído no `user_data.provider`, então não é necessário separar.

**Request:**
```json
{
  "user_data": {
    "email": "user@example.com",
    "provider": "google",  // ou "microsoft"
    ...
  },
  "tokens": {
    "refresh_token": "...",
    ...
  }
}
```

---

### `/auth/session/refresh`

**Status:** ✅ **Genérico (OK)**

**Razão:** O `session_id` já identifica o provider internamente, então não é necessário separar.

**Request:**
```json
{
  "session_id": "sess_abc123..."
}
```

---

## 📝 Exemplos de Uso

### Frontend - Google

```javascript
// Refresh token Google
const response = await fetch('https://caracore-backend-docker.azurewebsites.net/auth/token/refresh/google', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        refresh_token: refreshToken
        // Não precisa enviar provider
    })
});
```

### Frontend - Microsoft

```javascript
// Refresh token Microsoft
const response = await fetch('https://caracore-backend-docker.azurewebsites.net/auth/token/refresh/microsoft', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        refresh_token: refreshToken
        // Não precisa enviar provider
    })
});
```

---

## ✅ Benefícios da Separação

1. **Clareza**: Endpoints específicos deixam claro qual provider está sendo usado
2. **Manutenção**: Mais fácil de manter e debugar código específico por provider
3. **Segurança**: Rate limiting específico por provider
4. **Auditoria**: Logs mais claros e específicos
5. **Validação**: Validações específicas por provider (ex: scope no Microsoft)
6. **Extensibilidade**: Mais fácil adicionar novos providers no futuro

---

## 🔄 Migração

### Código Legado

**Antes:**
```javascript
POST /auth/token/refresh
{
  "refresh_token": "...",
  "provider": "google"
}
```

**Depois:**
```javascript
POST /auth/token/refresh/google
{
  "refresh_token": "..."
}
```

---

## 📚 Referências

- [Google OAuth 2.0 - Refresh Token](https://developers.google.com/identity/protocols/oauth2/web-server#offline)
- [Microsoft Identity Platform - Refresh Token](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#refresh-the-access-token)

---

## 🎯 Conclusão

**Endpoints separados por provider implementados:**

- ✅ `/auth/token/refresh/google` - Endpoint específico Google
- ✅ `/auth/token/refresh/microsoft` - Endpoint específico Microsoft
- ⚠️ `/auth/token/refresh` - Mantido como legado (deprecated)

**Recomendação:** Use os endpoints específicos para novos desenvolvimentos.

