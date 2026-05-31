# Tempo de Sessão - Autenticação pelos Provedores

## 📋 Resumo

O tempo de sessão é definido em **múltiplas camadas**, cada uma com um propósito específico:

1. **Access Token Expiration** (Provedores) - ~1 hora
2. **Session Expiration** (Backend) - 24 horas (configurável)
3. **Inactivity Timeout** (Frontend) - 1 hora (configurável)

---

## 🔑 1. Access Token Expiration (Provedores)

### **Google OAuth**

**Valor:** `expires_in: 3600` segundos (1 hora)

**Definido por:** Google OAuth 2.0

**Onde:** Retornado no endpoint `/oauth/google/token`

**Código:**
```javascript
// secure/js/oidc-callback-google.js
const expiresIn = realUserData.expires_in || 3600; // Default: 1 hora
const expiresAt = now + expiresIn;
```

**Características:**
- ✅ Definido pelo Google (não configurável)
- ✅ Geralmente 3600 segundos (1 hora)
- ✅ Pode variar ligeiramente (ex: 3599 segundos)
- ✅ Renovado automaticamente via refresh token

---

### **Microsoft Entra ID**

**Valor:** `expires_in: 3599` ou `3600` segundos (~1 hora)

**Definido por:** Microsoft Entra ID

**Onde:** Retornado no endpoint `/oauth/microsoft/token`

**Código:**
```javascript
// secure/js/oidc-callback-microsoft.js
const expiresIn = realUserData.expires_in || 3600; // Default: 1 hora
const expiresAt = realUserData.expires_at 
    ? Math.floor(new Date(realUserData.expires_at).getTime() / 1000)
    : now + expiresIn;
```

**Características:**
- ✅ Definido pela Microsoft (não configurável)
- ✅ Geralmente 3599 ou 3600 segundos (~1 hora)
- ✅ Pode variar ligeiramente
- ✅ Renovado automaticamente via refresh token

---

## 🗄️ 2. Session Expiration (Backend)

### **Backend - SessionManager**

**Valor:** `SESSION_TIMEOUT_HOURS` (default: 24 horas)

**Definido por:** Variável de ambiente ou código

**Onde:** `backend/session_manager.py`

**Código:**
```python
# backend/session_manager.py
def __init__(
    self,
    session_timeout_hours: int = None,
    max_sessions_per_user: int = None
):
    # Configurações
    self.session_timeout_hours = (
        session_timeout_hours or
        int(os.getenv("SESSION_TIMEOUT_HOURS", "24"))  # Default: 24 horas
    )
```

**Características:**
- ✅ Configurável via variável de ambiente `SESSION_TIMEOUT_HOURS`
- ✅ Default: 24 horas
- ✅ Define quando a sessão completa (refresh token) expira
- ✅ Usado para expiração do refresh token no backend

**Configuração:**
```bash
# .env ou variável de ambiente
SESSION_TIMEOUT_HOURS=24  # Horas até expiração da sessão
```

**Uso:**
```python
# backend/session_manager.py - create_session()
session_data = self.storage.save_token(
    session_id=session_id,
    user_email=email,
    user_id=user_id,
    provider=provider,
    refresh_token=refresh_token,
    ip_address=ip_address,
    user_agent=user_agent,
    expires_in_hours=self.session_timeout_hours  # Usa SESSION_TIMEOUT_HOURS
)
```

---

### **Backend - TokenStorage**

**Valor:** `expires_in_hours` (default: 24 horas)

**Definido por:** Parâmetro passado pelo SessionManager

**Onde:** `backend/token_storage.py`

**Código:**
```python
# backend/token_storage.py
def save_token(
    self,
    session_id: str,
    user_email: str,
    user_id: str,
    provider: str,
    refresh_token: str,
    ip_address: str = None,
    user_agent: str = None,
    expires_in_hours: int = 24  # Default: 24 horas
) -> Dict[str, Any]:
    # Calcular datas
    now = datetime.utcnow()
    expires_at = now + timedelta(hours=expires_in_hours)  # Expiração da sessão
    
    session_data = {
        "expires_at": expires_at.isoformat() + "Z",  # Data de expiração
        # ...
    }
```

**Características:**
- ✅ Recebe valor do SessionManager (geralmente 24 horas)
- ✅ Define quando o refresh token armazenado expira
- ✅ Verificado em `get_token()` para validar sessão

**Validação:**
```python
# backend/token_storage.py - get_token()
expires_at = date_parser.parse(session_data["expires_at"])
now = datetime.utcnow().replace(tzinfo=timezone.utc)

if now > expires_at:
    logger.warning(f"Sessão expirada: {session_id}")
    return None  # Sessão expirada
```

---

## 💻 3. Inactivity Timeout (Frontend)

### **Frontend - SessionManager**

**Valor:** `SESSION_TIMEOUT: 3600` segundos (1 hora)

**Definido por:** Código JavaScript

**Onde:** `secure/js/session-manager.js`

**Código:**
```javascript
// secure/js/session-manager.js
const CONFIG = {
    BACKEND_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5051'
        : 'https://caracore-backend-docker.azurewebsites.net',
    
    CHECK_INTERVAL: 60000,  // Verificar sessão a cada 60 segundos
    REFRESH_BEFORE: 300,    // Refresh token 5 min antes de expirar
    SESSION_TIMEOUT: 3600,  // Timeout de sessão: 1 hora (segundos)
    
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'auth_access_token',
        REFRESH_TOKEN: 'auth_refresh_token',
        PROVIDER: 'auth_provider',
        USER_INFO: 'auth_user_info',
        EXPIRES_AT: 'auth_expires_at',
        LAST_ACTIVITY: 'auth_last_activity'
    }
};
```

**Características:**
- ✅ Hardcoded no código (não configurável via variável de ambiente)
- ✅ Default: 3600 segundos (1 hora)
- ✅ Define timeout de inatividade do usuário
- ✅ Verificado em `checkInactivityTimeout()`

**Uso:**
```javascript
// secure/js/session-manager.js - checkInactivityTimeout()
function checkInactivityTimeout() {
    const lastActivity = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_ACTIVITY);
    if (!lastActivity) {
        return false;
    }
    
    const elapsed = Math.floor(Date.now() / 1000) - parseInt(lastActivity);
    if (elapsed > CONFIG.SESSION_TIMEOUT) {  // 3600 segundos = 1 hora
        console.log('[SessionManager] Timeout de inatividade');
        // Notificar e fazer logout
        return true;
    }
    
    return false;
}
```

**Atualização de Atividade:**
```javascript
// secure/js/session-manager.js - updateLastActivity()
function updateLastActivity() {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_ACTIVITY, now.toString());
}
```

---

## 🔄 4. Access Token Expiration Check (Frontend)

### **Frontend - SessionManager.isAuthenticated()**

**Valor:** Baseado em `expires_at` do access token

**Definido por:** Provedor (Google/Microsoft) via `expires_in`

**Onde:** `secure/js/session-manager.js`

**Código:**
```javascript
// secure/js/session-manager.js - isAuthenticated()
function isAuthenticated() {
    const accessToken = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    const expiresAt = localStorage.getItem(CONFIG.STORAGE_KEYS.EXPIRES_AT);
    
    if (!accessToken || !expiresAt) {
        return false;
    }
    
    // Verificar se token expirou
    const now = Math.floor(Date.now() / 1000);
    if (now >= parseInt(expiresAt)) {
        console.log('[SessionManager] Token expirado');
        return false;
    }
    
    return true;
}
```

**Características:**
- ✅ Verifica expiração do access token (não da sessão completa)
- ✅ Baseado em `expires_at` salvo no localStorage
- ✅ Calculado a partir de `expires_in` retornado pelo provedor
- ✅ Renovado automaticamente via refresh token quando próximo de expirar

**Cálculo de Expiração:**
```javascript
// secure/js/oidc-callback-google.js ou oidc-callback-microsoft.js
const expiresIn = realUserData.expires_in || 3600; // Do provedor
const expiresAt = now + expiresIn; // Timestamp de expiração
localStorage.setItem('auth_expires_at', expiresAt.toString());
```

---

## 📊 Resumo das Configurações

| Camada | Valor | Configurável? | Onde Configurar |
|--------|-------|----------------|-----------------|
| **Access Token (Google)** | ~3600s (1h) | ❌ Não | Definido pelo Google |
| **Access Token (Microsoft)** | ~3600s (1h) | ❌ Não | Definido pela Microsoft |
| **Session Expiration (Backend)** | 24h | ✅ Sim | `SESSION_TIMEOUT_HOURS` (env var) |
| **Inactivity Timeout (Frontend)** | 3600s (1h) | ❌ Não | Hardcoded em `session-manager.js` |
| **Refresh Before (Frontend)** | 300s (5min) | ❌ Não | Hardcoded em `session-manager.js` |

---

## 🔧 Como Configurar

### **1. Session Expiration (Backend)**

**Variável de Ambiente:**
```bash
# .env ou Azure App Settings
SESSION_TIMEOUT_HOURS=24  # Horas até expiração da sessão (refresh token)
```

**Valores Recomendados:**
- **Desenvolvimento:** 24 horas
- **Produção:** 24 horas (padrão) ou 48 horas (se necessário)
- **Segurança Alta:** 12 horas

**Impacto:**
- Define quando o refresh token armazenado no backend expira
- Após expirar, usuário precisa fazer login novamente
- Não afeta expiração do access token (sempre ~1 hora)

---

### **2. Inactivity Timeout (Frontend)**

**Atualmente:** Hardcoded em `secure/js/session-manager.js`

**Para Tornar Configurável:**

1. **Adicionar variável de ambiente no frontend:**
```javascript
// secure/js/session-manager.js
const CONFIG = {
    // ...
    SESSION_TIMEOUT: parseInt(
        window.SESSION_TIMEOUT || 
        localStorage.getItem('session_timeout') || 
        '3600'
    ),  // Timeout de sessão (segundos)
    // ...
};
```

2. **Ou usar configuração via meta tag:**
```html
<!-- secure/index.html -->
<meta name="session-timeout" content="3600">
```

```javascript
// secure/js/session-manager.js
const SESSION_TIMEOUT_META = document.querySelector('meta[name="session-timeout"]');
const CONFIG = {
    // ...
    SESSION_TIMEOUT: SESSION_TIMEOUT_META 
        ? parseInt(SESSION_TIMEOUT_META.content) 
        : 3600,
    // ...
};
```

**Valores Recomendados:**
- **Desenvolvimento:** 3600 segundos (1 hora)
- **Produção:** 3600 segundos (1 hora) ou 7200 segundos (2 horas)
- **Segurança Alta:** 1800 segundos (30 minutos)

---

### **3. Refresh Before (Frontend)**

**Atualmente:** Hardcoded em `secure/js/session-manager.js`

**Valor:** `REFRESH_BEFORE: 300` (5 minutos antes de expirar)

**Para Tornar Configurável:**

```javascript
// secure/js/session-manager.js
const CONFIG = {
    // ...
    REFRESH_BEFORE: parseInt(
        window.REFRESH_BEFORE || 
        localStorage.getItem('refresh_before') || 
        '300'
    ),  // Refresh token X segundos antes de expirar
    // ...
};
```

**Valores Recomendados:**
- **Desenvolvimento:** 300 segundos (5 minutos)
- **Produção:** 300 segundos (5 minutos)
- **Rede Lenta:** 600 segundos (10 minutos)

---

## 🔄 Fluxo de Expiração

### **1. Access Token Expira (~1 hora)**

```
Login → Access Token válido (1h)
  ↓
Usuário usa sistema
  ↓
Access Token próximo de expirar (5 min antes)
  ↓
Frontend detecta → Chama refresh token
  ↓
Backend renova → Novo Access Token (mais 1h)
  ↓
Ciclo continua...
```

### **2. Session Expira (24 horas)**

```
Login → Session criada (24h)
  ↓
Usuário usa sistema (access tokens renovados)
  ↓
24 horas passam
  ↓
Backend verifica → Session expirada
  ↓
Refresh token rejeitado
  ↓
Frontend detecta → Redireciona para login
```

### **3. Inactivity Timeout (1 hora)**

```
Login → Última atividade registrada
  ↓
Usuário inativo
  ↓
1 hora sem atividade
  ↓
Frontend detecta → Timeout de inatividade
  ↓
Notifica usuário → Faz logout
```

---

## 📝 Notas Importantes

### **1. Access Token vs Session**

- **Access Token:** Expira em ~1 hora (definido pelo provedor)
- **Session:** Expira em 24 horas (definido pelo backend)
- **Refresh Token:** Usado para renovar access tokens até a sessão expirar

### **2. Múltiplas Camadas de Expiração**

O sistema tem **3 camadas de expiração**:
1. **Access Token** (provedor) - ~1 hora
2. **Session** (backend) - 24 horas
3. **Inactivity** (frontend) - 1 hora

A sessão expira quando **qualquer uma** dessas condições for atendida.

### **3. Renovação Automática**

- Access tokens são renovados automaticamente via refresh token
- Renovação acontece 5 minutos antes de expirar
- Se refresh token expirar, usuário precisa fazer login novamente

### **4. Configuração Recomendada**

**Produção:**
```bash
SESSION_TIMEOUT_HOURS=24  # 24 horas de sessão
```

**Frontend (hardcoded):**
```javascript
SESSION_TIMEOUT: 3600,     // 1 hora de inatividade
REFRESH_BEFORE: 300,       // Renovar 5 min antes
```

---

## ✅ Conclusão

O tempo de sessão é definido em **múltiplas camadas**:

1. **Provedores (Google/Microsoft)** definem expiração do access token (~1 hora)
2. **Backend** define expiração da sessão completa (24 horas, configurável)
3. **Frontend** define timeout de inatividade (1 hora, hardcoded)

Para alterar o tempo de sessão, configure a variável de ambiente `SESSION_TIMEOUT_HOURS` no backend.

