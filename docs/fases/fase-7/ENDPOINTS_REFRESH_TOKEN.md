# Endpoints de Refresh Token - Google e Microsoft Entra ID

## 📋 Resumo

O backend possui **endpoints separados por provider** para tratar refresh tokens:

1. **`/auth/token/refresh/google`** - Endpoint específico Google (✅ Recomendado)
2. **`/auth/token/refresh/microsoft`** - Endpoint específico Microsoft (✅ Recomendado)
3. **`/auth/token/refresh`** - Endpoint genérico (⚠️ Deprecated - legado)
4. **`/auth/session/refresh`** - Endpoint da Fase 7 (✅ Recomendado - genérico)

**Recomendação:** Use os endpoints específicos por provider para novos desenvolvimentos.

---

## 🔄 Endpoints Específicos por Provider (✅ Recomendados)

### Endpoint 1.1: `/auth/token/refresh/google` - Google

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
- ✅ Não requer parâmetro `provider` (já está no endpoint)
- ✅ Não requer `scope` no refresh (conforme especificação Google)
- ✅ Rate limiting específico: `/auth/token/refresh/google`

**Implementação:**
```python
token_url = "https://oauth2.googleapis.com/token"
payload = {
    "client_id": os.getenv("GOOGLE_CLIENT_ID"),
    "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
    "refresh_token": refresh_token_val,
    "grant_type": "refresh_token"
    # Google não requer scope no refresh
}
```

---

### Endpoint 1.2: `/auth/token/refresh/microsoft` - Microsoft

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
- ✅ Não requer parâmetro `provider` (já está no endpoint)
- ✅ Inclui `scope` no refresh (obrigatório para Microsoft)
- ✅ Rate limiting específico: `/auth/token/refresh/microsoft`

**Implementação:**
```python
tenant = os.getenv("AZURE_TENANT_ID", "consumers")
token_url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
payload = {
    "client_id": os.getenv("MICROSOFT_CLIENT_ID") or os.getenv("AZURE_CLIENT_ID"),
    "client_secret": os.getenv("MICROSOFT_CLIENT_SECRET") or os.getenv("AZURE_CLIENT_SECRET"),
    "refresh_token": refresh_token_val,
    "grant_type": "refresh_token",
    "scope": "openid profile email offline_access"  # Obrigatório para Microsoft
}
```

---

## ⚠️ Endpoint Legado (Deprecated)

### Endpoint 1: `/auth/token/refresh` (Genérico - Deprecated)

### Descrição
⚠️ **DEPRECATED** - Use `/auth/token/refresh/google` ou `/auth/token/refresh/microsoft`

Endpoint genérico que aceita `refresh_token` e `provider`, e renova tokens diretamente com o provedor OAuth.
Mantido apenas para compatibilidade com código legado.

### Rota
```
POST /auth/token/refresh
```

### Request Body
```json
{
  "refresh_token": "1//0eWzCyAzVKwXUCgYIAR...",
  "provider": "google"  // ou "microsoft"
}
```

### Response (200 OK)
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

### Erros
- `400` - `refresh_token` ou `provider` ausente
- `400` - Provider não suportado
- `400` - Refresh token inválido ou expirado
- `500` - Erro interno do servidor

### Implementação

#### Google
```python
token_url = "https://oauth2.googleapis.com/token"
payload = {
    "client_id": os.getenv("GOOGLE_CLIENT_ID"),
    "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
    "refresh_token": refresh_token_val,
    "grant_type": "refresh_token"
}
```

#### Microsoft Entra ID
```python
tenant = os.getenv("AZURE_TENANT_ID", "common")
token_url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
payload = {
    "client_id": os.getenv("MICROSOFT_CLIENT_ID") or os.getenv("AZURE_CLIENT_ID"),
    "client_secret": os.getenv("MICROSOFT_CLIENT_SECRET") or os.getenv("AZURE_CLIENT_SECRET"),
    "refresh_token": refresh_token_val,
    "grant_type": "refresh_token",
    "scope": "openid profile email offline_access"
}
```

### Características
- ✅ Suporta Google e Microsoft
- ✅ Rate limiting (configurado)
- ✅ HTTPS obrigatório
- ✅ Logs de auditoria
- ⚠️ Requer que o frontend gerencie o `refresh_token`
- ⚠️ Não criptografa refresh tokens

---

## 🔐 Endpoint 2: `/auth/session/refresh` (Fase 7 - Recomendado)

### Descrição
Endpoint da Fase 7 que usa `session_id` para renovar tokens. O refresh token é armazenado criptografado no backend.

### Rota
```
POST /auth/session/refresh
```

### Request Body
```json
{
  "session_id": "sess_abc123def456..."
}
```

### Response (200 OK)
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "expires_in": 3600,
  "expires_at": "2025-11-15T17:00:00Z"
}
```

### Erros
- `400` - `session_id` ausente ou inválido
- `401` - Sessão não encontrada ou expirada
- `500` - Erro interno do servidor

### Implementação

O `SessionManager` usa métodos internos:

#### Google
```python
def _refresh_google_token(self, refresh_token: str) -> Dict[str, Any]:
    token_url = "https://oauth2.googleapis.com/token"
    payload = {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    # ... faz requisição e retorna tokens
```

#### Microsoft Entra ID
```python
def _refresh_microsoft_token(self, refresh_token: str) -> Dict[str, Any]:
    tenant = os.getenv("AZURE_TENANT_ID", "common")
    token_url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
    payload = {
        "client_id": os.getenv("AZURE_CLIENT_ID") or os.getenv("MICROSOFT_CLIENT_ID"),
        "client_secret": os.getenv("AZURE_CLIENT_SECRET") or os.getenv("MICROSOFT_CLIENT_SECRET"),
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
        "scope": "openid profile email offline_access"
    }
    # ... faz requisição e retorna tokens
```

### Características
- ✅ Suporta Google e Microsoft
- ✅ Refresh token criptografado (AES-256) no backend
- ✅ Rate limiting (configurado)
- ✅ HTTPS obrigatório
- ✅ Logs de auditoria completos
- ✅ Rotação de refresh token (OAuth 2.1)
- ✅ Validação de sessão (expiração, status)
- ✅ Frontend não precisa gerenciar refresh_token

---

## 🔍 Comparação dos Endpoints

| Característica | `/auth/token/refresh` | `/auth/session/refresh` |
|----------------|------------------------|-------------------------|
| **Método** | Direto | Via SessionManager |
| **Input** | `refresh_token` + `provider` | `session_id` |
| **Segurança** | Refresh token em texto | Refresh token criptografado |
| **Gerenciamento** | Frontend gerencia | Backend gerencia |
| **Rotação** | Manual | Automática (OAuth 2.1) |
| **Auditoria** | Básica | Completa |
| **Recomendado** | Compatibilidade | ✅ **Sim (Fase 7)** |

---

## 📝 Exemplos de Uso

### Exemplo 1: Usando `/auth/token/refresh` (Direto)

```javascript
// Frontend precisa ter o refresh_token
const refreshToken = localStorage.getItem('auth_refresh_token');
const provider = localStorage.getItem('auth_provider'); // 'google' ou 'microsoft'

const response = await fetch('/auth/token/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        refresh_token: refreshToken,
        provider: provider
    })
});

const tokens = await response.json();
// Atualizar tokens no frontend
localStorage.setItem('auth_access_token', tokens.access_token);
```

### Exemplo 2: Usando `/auth/session/refresh` (Fase 7 - Recomendado)

```javascript
// Frontend só precisa do session_id
const sessionId = localStorage.getItem('cara_core_session_id');

const response = await fetch('/auth/session/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        session_id: sessionId
    })
});

const tokens = await response.json();
// Atualizar tokens no frontend
sessionStorage.setItem('cara_core_access_token', tokens.access_token);
```

---

## 🔧 Variáveis de Ambiente Necessárias

### Google
```bash
GOOGLE_CLIENT_ID=1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Microsoft Entra ID
```bash
AZURE_CLIENT_ID=ac886d42-bd01-4cf0-9a3b-6014384670dc
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=189c46ad-e437-48bd-bc87-050ef735c2c7

# Aliases para compatibilidade
MICROSOFT_CLIENT_ID=ac886d42-bd01-4cf0-9a3b-6014384670dc
MICROSOFT_CLIENT_SECRET=your_azure_client_secret
```

---

## ✅ Status de Implementação

### Google OAuth
- ✅ Endpoint `/auth/token/refresh` implementado
- ✅ Endpoint `/auth/session/refresh` implementado
- ✅ Método `_refresh_google_token()` no SessionManager
- ✅ Suporte a rotação de refresh token

### Microsoft Entra ID
- ✅ Endpoint `/auth/token/refresh` implementado
- ✅ Endpoint `/auth/session/refresh` implementado
- ✅ Método `_refresh_microsoft_token()` no SessionManager
- ✅ Suporte a rotação de refresh token
- ✅ Suporte a múltiplos tenants (common, organizations, consumers)

---

## 🧪 Testes

### Teste Google
```bash
curl -X POST https://caracore-backend-docker.azurewebsites.net/auth/token/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "1//0eWzCyAzVKwXUCgYIAR...",
    "provider": "google"
  }'
```

### Teste Microsoft
```bash
curl -X POST https://caracore-backend-docker.azurewebsites.net/auth/token/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "0.ARwA6Wg3...",
    "provider": "microsoft"
  }'
```

### Teste Fase 7 (Session)
```bash
curl -X POST https://caracore-backend-docker.azurewebsites.net/auth/session/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "sess_abc123def456..."
  }'
```

---

## 📊 Fluxo Completo

### Fluxo com `/auth/session/refresh` (Fase 7)

```
1. Login OAuth → Backend recebe tokens
2. Backend cria sessão:
   - Criptografa refresh_token (AES-256)
   - Gera session_id único
   - Salva em user_sessions.json
3. Frontend recebe session_id
4. Access token expira → Frontend chama /auth/session/refresh
5. Backend:
   - Valida session_id
   - Descriptografa refresh_token
   - Renova tokens via Google/Microsoft
   - Atualiza refresh_token se fornecido (rotação)
   - Retorna novos tokens
6. Frontend atualiza tokens e re-agenda renovação
```

---

## 🔒 Segurança

### Endpoint `/auth/token/refresh`
- ⚠️ Refresh token trafega em texto (HTTPS obrigatório)
- ⚠️ Frontend precisa armazenar refresh_token
- ✅ Rate limiting configurado
- ✅ Logs de auditoria

### Endpoint `/auth/session/refresh` (Fase 7)
- ✅ Refresh token nunca sai do backend (criptografado)
- ✅ Frontend só gerencia session_id (não sensível)
- ✅ Rate limiting configurado
- ✅ Logs de auditoria completos
- ✅ Validação de sessão (expiração, status)
- ✅ Rotação automática de refresh token

---

## 📚 Documentação Adicional

- **Guia de Ativação:** `docs/fases/fase-7/COMO_ATIVAR_FASE_7.md`
- **Documentação Completa:** `docs/fases/fase-7/README.md`
- **Swagger/OpenAPI:** `https://caracore-backend-docker.azurewebsites.net/api-docs`

---

**Última atualização:** 15/11/2025  
**Status:** ✅ Implementado e funcional para Google e Microsoft Entra ID

