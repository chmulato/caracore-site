# Correção - TokenManager Tentando Renovar Durante Callback

## 📋 Problema

O `TokenManager` estava tentando renovar tokens usando um `session_id` antigo durante o callback OAuth, resultando em:

```
POST /auth/session/refresh 500 (Internal Server Error)
[TokenManager] Tentativa 1/3 falhou, tentando novamente...
[TokenManager] Tentativa 2/3 falhou, tentando novamente...
[TokenManager] Tentativa 3/3 falhou, tentando novamente...
[TokenManager] Erro ao renovar token: Error: Erro interno ao renovar tokens
[TokenManager] Falha ao renovar token, fazendo logout
```

**Causa:**
1. TokenManager carrega sessão antiga do localStorage ao inicializar
2. Agenda renovação automática (`scheduleRefresh()`)
3. Durante callback, antes da nova sessão ser criada, tenta renovar usando `session_id` antigo
4. Backend retorna 500 porque sessão antiga não existe mais ou está inválida
5. TokenManager tenta 3 vezes e depois faz logout, interrompendo o callback

---

## ✅ Correções Implementadas

**Arquivo:** `secure/js/token-manager.js`

### **1. Detecção de Página de Callback**

**Nova função:** `isCallbackPage()`

```javascript
isCallbackPage() {
    const pathname = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    return pathname.includes('callback') || 
           search.includes('code=') || 
           search.includes('state=') ||
           search.includes('error=');
}
```

**Uso:** Detecta se estamos em uma página de callback OAuth antes de tentar renovar tokens.

---

### **2. Não Carregar Sessão Antiga Durante Callback**

**Função:** `loadSavedSession()`

**Antes:**
```javascript
loadSavedSession() {
    // Sempre carregava sessão antiga
    const savedSessionId = localStorage.getItem('cara_core_session_id');
    // ...
    this.scheduleRefresh(); // Agendava renovação
}
```

**Depois:**
```javascript
loadSavedSession() {
    // NÃO carregar sessão antiga se estivermos em callback
    if (this.isCallbackPage()) {
        console.log('[TokenManager] Página de callback detectada, não carregando sessão antiga');
        return;
    }
    // ... resto do código
}
```

---

### **3. Não Renovar Durante Callback**

**Função:** `refreshToken()`

**Antes:**
```javascript
async refreshToken(retryCount = 0) {
    // Sempre tentava renovar
    if (!this.sessionId) return;
    // ...
}
```

**Depois:**
```javascript
async refreshToken(retryCount = 0) {
    // NÃO tentar renovar durante callback
    if (this.isCallbackPage()) {
        console.log('[TokenManager] Página de callback detectada, não renovando tokens (nova sessão será criada)');
        return;
    }
    // ... resto do código
}
```

---

### **4. Melhor Tratamento de Erro 500**

**Função:** `refreshToken()`

**Antes:**
```javascript
if (response.status >= 500) {
    // Retry sempre
    if (retryCount < this.maxRetries) {
        return this.refreshToken(retryCount + 1);
    }
    throw new Error(...); // Fazia logout
}
```

**Depois:**
```javascript
if (response.status === 500) {
    // Se estamos em callback, não tentar retry - nova sessão será criada
    if (this.isCallbackPage()) {
        console.warn('[TokenManager] Erro 500 durante callback, limpando sessão antiga (nova sessão será criada)');
        this.clearSession();
        return;
    }
    
    // Retry apenas se não estiver em callback
    if (retryCount < this.maxRetries) {
        return this.refreshToken(retryCount + 1);
    }
    
    // Se todas as tentativas falharam, limpar sessão mas não fazer logout completo
    this.clearSession();
    return;
}
```

---

### **5. Não Agendar Renovação Durante Callback**

**Função:** `scheduleRefresh()`

**Antes:**
```javascript
scheduleRefresh() {
    // Sempre agendava renovação
    this.refreshTimer = setTimeout(() => {
        this.refreshToken();
    }, refreshTime);
}
```

**Depois:**
```javascript
scheduleRefresh() {
    // NÃO agendar renovação durante callback
    if (this.isCallbackPage()) {
        console.log('[TokenManager] Página de callback detectada, não agendando renovação');
        return;
    }
    // ... resto do código
}
```

---

### **6. Limpar Sessão Antiga ao Criar Nova**

**Função:** `initSession()`

**Antes:**
```javascript
async initSession(sessionData) {
    this.sessionId = sessionData.session_id;
    // ... salvar nova sessão
}
```

**Depois:**
```javascript
async initSession(sessionData) {
    // Limpar sessão antiga se existir (evitar conflito)
    if (this.sessionId && this.sessionId !== sessionData.session_id) {
        console.log('[TokenManager] Limpando sessão antiga antes de criar nova:', this.sessionId);
        this.clearSession();
    }
    // ... salvar nova sessão
}
```

---

### **7. Melhor Tratamento de Erro no Catch**

**Função:** `refreshToken()`

**Antes:**
```javascript
catch (error) {
    // Sempre fazia logout
    await this.logout();
}
```

**Depois:**
```javascript
catch (error) {
    // Se estamos em callback, não fazer retry nem logout - nova sessão será criada
    if (this.isCallbackPage()) {
        console.warn('[TokenManager] Erro durante callback, limpando sessão antiga (nova sessão será criada)');
        this.clearSession();
        return;
    }
    // ... resto do tratamento
}
```

---

## 🔄 Fluxo Antes vs Depois

### **Antes (PROBLEMÁTICO)**

```
1. Página carrega
   ↓
2. TokenManager carrega sessão antiga do localStorage
   ↓
3. Agenda renovação automática
   ↓
4. Usuário faz login → Callback OAuth
   ↓
5. TokenManager tenta renovar usando session_id antigo
   ↓
6. Backend retorna 500 (sessão não existe)
   ↓
7. TokenManager tenta 3 vezes
   ↓
8. Faz logout → Interrompe callback ❌
```

---

### **Depois (CORRETO)**

```
1. Página carrega
   ↓
2. TokenManager detecta callback → NÃO carrega sessão antiga ✅
   ↓
3. Usuário faz login → Callback OAuth
   ↓
4. TokenManager detecta callback → NÃO tenta renovar ✅
   ↓
5. Nova sessão é criada no backend
   ↓
6. TokenManager inicializa nova sessão
   ↓
7. Limpa sessão antiga se existir ✅
   ↓
8. Agenda renovação para nova sessão ✅
```

---

## 📊 Mudanças Implementadas

| Função | Mudança | Impacto |
|--------|---------|---------|
| `isCallbackPage()` | ✅ **NOVA** - Detecta callback | Evita operações durante callback |
| `loadSavedSession()` | ✅ Não carrega sessão antiga em callback | Evita conflito de sessões |
| `refreshToken()` | ✅ Não renova em callback | Evita erro 500 durante callback |
| `refreshToken()` | ✅ Melhor tratamento de erro 500 | Não faz logout durante callback |
| `scheduleRefresh()` | ✅ Não agenda em callback | Evita tentativas desnecessárias |
| `initSession()` | ✅ Limpa sessão antiga | Evita conflito de session_ids |
| `refreshToken()` catch | ✅ Não faz logout em callback | Não interrompe callback |

---

## 🧪 Como Testar

### **1. Limpar Sessão Antiga**

1. Abrir DevTools → Application → Local Storage
2. Remover `cara_core_session_id` e `cara_core_token_expires_at`
3. Ou fazer logout completo

---

### **2. Fazer Login**

1. Acesse: `https://www.caracore.com.br/secure/index.html`
2. Faça login com Microsoft ou Google
3. **Verificar Console:** Não deve aparecer erros de `refresh 500`

---

### **3. Verificar Logs**

**Console (Frontend):**
```
✅ [TokenManager] Página de callback detectada, não carregando sessão antiga
✅ [TokenManager] Página de callback detectada, não renovando tokens
✅ [TokenManager] Sessão inicializada: sess_...
```

**Não deve aparecer:**
```
❌ POST /auth/session/refresh 500
❌ [TokenManager] Tentativa 1/3 falhou
❌ [TokenManager] Falha ao renovar token, fazendo logout
```

---

## ⚠️ Notas Importantes

### **1. Detecção de Callback**

A detecção de callback verifica:
- `pathname.includes('callback')`
- `search.includes('code=')`
- `search.includes('state=')`
- `search.includes('error=')`

Isso cobre todos os cenários de callback OAuth.

---

### **2. Limpeza de Sessão Antiga**

Quando uma nova sessão é criada:
- Sessão antiga é limpa automaticamente
- Evita conflito entre `session_id` antigo e novo
- Garante que apenas a sessão atual seja usada

---

### **3. Tratamento de Erro 500**

**Durante Callback:**
- Erro 500 → Limpa sessão antiga
- Não tenta retry
- Não faz logout
- Aguarda nova sessão ser criada

**Fora de Callback:**
- Erro 500 → Tenta retry (até 3 vezes)
- Se persistir → Limpa sessão local
- Não faz logout completo (pode ser erro temporário)

---

## 🔍 Verificar Backend (Erro 500)

Se o erro 500 persistir, verificar logs do backend:

```bash
# Azure App Service
az webapp log tail \
  --resource-group rg-caracore \
  --name caracore-backend-docker \
  --filter "session/refresh"
```

**Possíveis causas:**
- Sessão não encontrada no backend
- Erro ao descriptografar refresh token
- Erro de datetime/timezone
- Problema de file locking

---

## ✅ Status

**Implementação:** ✅ **COMPLETA**

**Arquivo Modificado:**
- `secure/js/token-manager.js` - 7 melhorias implementadas

**Benefícios:**
- ✅ Não tenta renovar durante callback
- ✅ Não faz logout durante callback
- ✅ Limpa sessão antiga automaticamente
- ✅ Melhor tratamento de erros
- ✅ Não interrompe fluxo de autenticação

---

## 🔗 Referências

- **Documentação OAuth Callback:** `docs/IMPLEMENTACAO_CORRECOES_RECOMENDACAO_PRINCIPAL.md`
- **TokenManager:** `secure/js/token-manager.js`

