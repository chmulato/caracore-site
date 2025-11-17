# Frontend - Endpoints Separados por Provider

## 📋 Resumo

O frontend foi atualizado para usar os novos endpoints específicos por provider (Google e Microsoft) em vez do endpoint genérico.

---

## 🔄 Mudanças Implementadas

### 1. ✅ SessionManager - Refresh Token

**Arquivo:** `secure/js/session-manager.js` e `js/session-manager.js`

**Antes:**
```javascript
const response = await fetch(`${CONFIG.BACKEND_URL}/auth/token/refresh`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        refresh_token: refreshTokenVal,
        provider: provider  // Parâmetro necessário
    })
});
```

**Depois:**
```javascript
// Usar endpoint específico por provider
const endpoint = provider === 'google' 
    ? '/auth/token/refresh/google'
    : provider === 'microsoft'
    ? '/auth/token/refresh/microsoft'
    : '/auth/token/refresh'; // Fallback para legado

const response = await fetch(`${CONFIG.BACKEND_URL}${endpoint}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        refresh_token: refreshTokenVal
        // Não precisa enviar provider - já está no endpoint
    })
});
```

**Benefícios:**
- ✅ Endpoint específico por provider
- ✅ Não precisa enviar parâmetro `provider` no body
- ✅ Fallback para endpoint legado se provider não identificado
- ✅ Código mais claro e específico

---

## 📊 Endpoints Utilizados pelo Frontend

### ✅ Endpoints Específicos (Recomendados)

| Endpoint | Provider | Uso |
|----------|----------|-----|
| `/auth/token/refresh/google` | Google | SessionManager.refreshToken() |
| `/auth/token/refresh/microsoft` | Microsoft | SessionManager.refreshToken() |

### ✅ Endpoints Genéricos (Mantidos)

| Endpoint | Uso | Razão |
|----------|-----|-------|
| `/auth/session/refresh` | TokenManager, OIDC callbacks | Usa session_id (já identifica provider) |
| `/auth/session/create` | TokenManager | Provider no user_data |

### ⚠️ Endpoint Legado (Fallback)

| Endpoint | Status | Uso |
|----------|--------|-----|
| `/auth/token/refresh` | Deprecated | Fallback se provider não identificado |

---

## 🔍 Detecção de Provider

O `SessionManager` detecta o provider do `localStorage`:

```javascript
const provider = localStorage.getItem(CONFIG.STORAGE_KEYS.PROVIDER);
// Valores possíveis: 'google', 'microsoft'
```

**Fluxo:**
1. Lê `auth_provider` do `localStorage`
2. Seleciona endpoint específico baseado no provider
3. Se provider não identificado, usa endpoint legado como fallback

---

## 📝 Exemplos de Uso

### SessionManager - Refresh Token Automático

```javascript
// SessionManager detecta provider automaticamente
const provider = localStorage.getItem('auth_provider'); // 'google' ou 'microsoft'

// Seleciona endpoint específico
const endpoint = provider === 'google' 
    ? '/auth/token/refresh/google'
    : '/auth/token/refresh/microsoft';

// Faz requisição sem parâmetro provider
fetch(`${BACKEND_URL}${endpoint}`, {
    method: 'POST',
    body: JSON.stringify({
        refresh_token: refreshToken
    })
});
```

---

## ✅ Arquivos Atualizados

1. ✅ `secure/js/session-manager.js` - Atualizado para usar endpoints específicos
2. ✅ `js/session-manager.js` - Atualizado para usar endpoints específicos

---

## 🔄 Compatibilidade

### Backward Compatibility

- ✅ Endpoint legado `/auth/token/refresh` ainda funciona (deprecated)
- ✅ Fallback automático se provider não identificado
- ✅ Código legado continua funcionando

### Migração

**Código legado que ainda funciona:**
```javascript
// Ainda funciona, mas não recomendado
POST /auth/token/refresh
{
  "refresh_token": "...",
  "provider": "google"
}
```

**Código novo (recomendado):**
```javascript
// Recomendado
POST /auth/token/refresh/google
{
  "refresh_token": "..."
}
```

---

## 🎯 Próximos Passos (Opcional)

1. **Remover fallback legado** (após migração completa)
2. **Atualizar outros módulos** que possam usar endpoint genérico
3. **Adicionar validação** para garantir que provider está sempre identificado

---

## 📚 Referências

- [Backend - Endpoints Separados](./ENDPOINTS_SEPARADOS_POR_PROVIDER.md)
- [Backend - Refresh Token](./fases/fase-7/ENDPOINTS_REFRESH_TOKEN.md)

