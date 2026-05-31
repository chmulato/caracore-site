# Tokens Retornados pelo Serviço OIDC - Microsoft

## 📋 Resumo

Durante a autenticação com o provider Microsoft, o endpoint `/oauth/microsoft/token` retorna os tokens fornecidos pela Microsoft Entra ID, mais informações adicionais do backend quando aplicável.

---

## 🔑 Tokens Retornados pelo Endpoint `/oauth/microsoft/token`

### Response (200 OK)

O backend retorna **exatamente** o que a Microsoft retorna, mais campos adicionais:

```json
{
  // Tokens da Microsoft (sempre presentes em caso de sucesso)
  "access_token": "eyJ0eXAiOiJKV1QiLCJub25jZSI6Il...",
  "id_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...",
  "refresh_token": "0.AXcA...",  // Pode estar presente ou não
  "expires_in": 3599,              // Tempo de expiração em segundos (geralmente 3600 = 1 hora)
  "token_type": "Bearer",
  "scope": "openid profile email",
  
  // Campo adicional do backend (se SESSION_MANAGER_ENABLED = true)
  "session_id": "sess_abc123def456..."  // Opcional: presente apenas se sessão foi criada
}
```

---

## 📝 Detalhes dos Tokens

### 1. `access_token` (Obrigatório)
- **Tipo**: String (JWT)
- **Uso**: Autenticar requisições à API da Microsoft
- **Validade**: Geralmente 1 hora (3600 segundos)
- **Formato**: JWT não assinado (opaque token) ou JWT assinado

**Exemplo de uso:**
```javascript
headers: {
  'Authorization': `Bearer ${access_token}`
}
```

### 2. `id_token` (Obrigatório)
- **Tipo**: String (JWT)
- **Uso**: Identificar o usuário autenticado
- **Conteúdo**: Claims do usuário (email, nome, OID, etc.)
- **Validade**: Geralmente 1 hora

**Claims principais no ID token:**
```json
{
  "oid": "00000000-0000-0000-e4c1-c69606a9e51f",  // Object ID do usuário
  "preferred_username": "ale.mulato@hotmail.com",  // Email do usuário
  "email": "ale.mulato@hotmail.com",                // Email (pode não estar presente)
  "name": "Ale Mulato",                             // Nome do usuário
  "iss": "https://login.microsoftonline.com/...",   // Issuer
  "aud": "client-id",                               // Audience (Client ID)
  "exp": 1763424199,                                // Expiração (timestamp)
  "iat": 1763420599,                                // Emitido em (timestamp)
  "nonce": "...",                                   // Nonce (se usado)
  "tid": "9188040d-6c67-4c5b-b112-36a304b66dad"    // Tenant ID
}
```

### 3. `refresh_token` (Opcional)
- **Tipo**: String
- **Uso**: Renovar `access_token` e `id_token` quando expirarem
- **Validade**: Longa duração (dias/semanas)
- **Disponibilidade**: 
  - ✅ Presente se o scope `offline_access` foi solicitado
  - ❌ Ausente se o scope não foi solicitado ou não foi concedido

**Importante**: O `refresh_token` pode não estar presente em todas as respostas, especialmente:
- Se o usuário não concedeu permissão `offline_access`
- Se o scope não foi solicitado corretamente
- Em alguns fluxos de autenticação específicos

### 4. `expires_in` (Obrigatório)
- **Tipo**: Number (segundos)
- **Valor típico**: `3600` (1 hora)
- **Uso**: Calcular quando o token expira

**Cálculo de expiração:**
```javascript
const expiresAt = Date.now() + (expires_in * 1000);
```

### 5. `token_type` (Obrigatório)
- **Tipo**: String
- **Valor**: Sempre `"Bearer"`
- **Uso**: Especificar o tipo de token para autenticação

### 6. `scope` (Obrigatório)
- **Tipo**: String
- **Valor típico**: `"openid profile email"`
- **Uso**: Lista de permissões concedidas

**Scopes comuns:**
- `openid` - Identificação do usuário (obrigatório para OIDC)
- `profile` - Informações do perfil (nome, etc.)
- `email` - Email do usuário
- `offline_access` - Refresh token (necessário para renovação)

### 7. `session_id` (Opcional - Adicionado pelo Backend)
- **Tipo**: String
- **Formato**: `sess_` seguido de hash
- **Disponibilidade**: 
  - ✅ Presente se `SESSION_MANAGER_ENABLED = true` E `refresh_token` está presente
  - ❌ Ausente se sistema de sessões não está habilitado ou não há refresh_token

**Uso do session_id:**
```javascript
// Renovar tokens usando session_id
POST /auth/session/refresh
{
  "session_id": "sess_abc123..."
}
```

---

## ⚠️ Casos Especiais

### Erro 400 (Bad Request)

Mesmo em caso de erro, o backend pode retornar `session_id` se uma sessão foi criada antes do erro:

```json
{
  "error": "invalid_grant",
  "error_description": "AADSTS70000: The request was denied...",
  "session_id": "sess_abc123..."  // Pode estar presente mesmo com erro
}
```

**Estratégia recomendada:**
1. Verificar se `session_id` está presente na resposta (mesmo com erro)
2. Se presente, usar `/auth/session/refresh` para obter tokens válidos
3. Se não presente, tratar como erro de autenticação

---

## 🔄 Fluxo de Uso dos Tokens

### 1. Autenticação Inicial
```
POST /oauth/microsoft/token
  ↓
Resposta: access_token, id_token, refresh_token, expires_in, session_id
  ↓
Salvar tokens no frontend
```

### 2. Uso do Access Token
```
GET /api/protected
Headers: Authorization: Bearer {access_token}
```

### 3. Renovação de Tokens

**Opção A: Usando session_id (Recomendado)**
```
POST /auth/session/refresh
Body: { "session_id": "sess_abc123..." }
  ↓
Resposta: access_token, id_token, expires_in, expires_at
```

**Opção B: Usando refresh_token diretamente**
```
POST /auth/token/refresh
Body: { "refresh_token": "...", "provider": "microsoft" }
  ↓
Resposta: access_token, id_token, refresh_token (novo), expires_in
```

---

## 📊 Estrutura Completa da Resposta

### Sucesso (200 OK)
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJub25jZSI6Il...",
  "id_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...",
  "refresh_token": "0.AXcA...",           // Opcional
  "expires_in": 3599,
  "token_type": "Bearer",
  "scope": "openid profile email",
  "session_id": "sess_abc123..."          // Opcional (adicionado pelo backend)
}
```

### Erro (400 Bad Request)
```json
{
  "error": "invalid_grant",
  "error_description": "AADSTS70000: The request was denied...",
  "session_id": "sess_abc123..."          // Pode estar presente mesmo com erro
}
```

---

## 🔐 Segurança

### Tokens Sensíveis
- ⚠️ **NUNCA** expor `access_token` ou `refresh_token` em logs públicos
- ⚠️ **SEMPRE** usar HTTPS para transmitir tokens
- ⚠️ **VALIDAR** `id_token` antes de confiar nas informações

### Validação do ID Token
O backend valida automaticamente:
- ✅ Assinatura do token
- ✅ Expiração (`exp`)
- ✅ Issuer (`iss`)
- ✅ Audience (`aud`)
- ✅ Nonce (se usado)
- ✅ Tenant ID (se configurado)

---

## 📚 Referências

- [Microsoft Identity Platform - Token Response](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#successful-response-2)
- [OpenID Connect - Token Response](https://openid.net/specs/openid-connect-core-1_0.html#TokenResponse)
- [OAuth 2.0 - Access Token Response](https://datatracker.ietf.org/doc/html/rfc6749#section-5.1)

