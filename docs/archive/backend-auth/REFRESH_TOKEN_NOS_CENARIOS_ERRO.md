# Refresh Token nos Cenários de Erro

## 📋 Resumo

Este documento analisa **onde o refresh token entra** nos cenários de erro que foram corrigidos, e identifica **oportunidades de melhoria** para usar o refresh token antes de redirecionar para reautenticação.

---

## 🔍 Análise dos Cenários Atuais

### 1. **Cenário: `unauthorized_domain` (Google)**

**Arquivo:** `secure/js/oidc-callback-google.js`  
**Linhas:** 540-553, 570-582

**Situação:**
- Backend retorna `403 (Forbidden)` com `error: 'unauthorized_domain'`
- Usuário está autorizado no backend, mas o domínio do email não está na lista permitida
- Sistema redireciona para `/secure/index.html` com `reason=unauthorized_domain`

**Refresh Token:**
- ❌ **NÃO é usado** neste cenário
- ⚠️ **Razão:** O problema não é de token expirado, mas sim de domínio não autorizado
- ✅ **Correto:** Não faz sentido usar refresh token aqui, pois o problema é de autorização de domínio

---

### 2. **Cenário: `no_real_tokens` (Microsoft/Google)**

**Arquivo:** `secure/js/oidc-callback-microsoft.js`  
**Linhas:** 860-874

**Situação:**
- Backend não retornou tokens reais na resposta inicial
- Usuário está autorizado, mas não conseguiu obter tokens válidos
- Sistema redireciona para `/secure/index.html` com `reason=no_real_tokens`

**Refresh Token:**
- ❌ **NÃO é usado** neste cenário
- ⚠️ **Razão:** Não há tokens reais para usar, então não há refresh token disponível
- ✅ **Correto:** Se não há tokens reais, não há refresh token para usar

---

### 3. **Cenário: `no_valid_session` (Área Restrita)**

**Arquivo:** `secure/js/restrita-main.js`  
**Linhas:** 66-80, 168-180

**Situação:**
- Usuário está autorizado, mas não tem sessão válida (access token expirado ou ausente)
- Sistema redireciona para `/secure/index.html` com `reason=no_valid_session`

**Refresh Token:**
- ⚠️ **OPORTUNIDADE DE MELHORIA:** 
  - ✅ **DEVERIA tentar usar refresh token ANTES de redirecionar**
  - ✅ Se refresh token estiver disponível e válido, poderia obter novos tokens
  - ✅ Só redirecionaria se refresh token também estiver inválido/expirado

**Código Atual:**
```javascript
// Linha 66-80: restrita-main.js
if (!hasValidSession) {
  console.log('Restrita: Usuário autorizado mas sem sessão válida.');
  console.log('🔄 Redirecionando para reautenticação...');
  
  // ❌ Redireciona imediatamente, sem tentar refresh token
  const redirectUrl = `/secure/index.html?email=${encodeURIComponent(userEmail)}&provider=${provider || 'google'}&error=auth_failed&message=${errorMessage}&reason=no_valid_session`;
  
  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 1500);
  return;
}
```

**Melhoria Sugerida:**
```javascript
if (!hasValidSession) {
  console.log('Restrita: Usuário autorizado mas sem sessão válida.');
  
  // ✅ TENTAR USAR REFRESH TOKEN ANTES DE REDIRECIONAR
  if (SessionManager && typeof SessionManager.refreshToken === 'function') {
    console.log('🔄 Tentando renovar tokens usando refresh token...');
    const refreshSuccess = await SessionManager.refreshToken();
    
    if (refreshSuccess) {
      console.log('✅ Tokens renovados com sucesso!');
      // Verificar novamente se agora tem sessão válida
      if (SessionManager.isAuthenticated()) {
        console.log('✅ Sessão restaurada, continuando...');
        // Continuar com o fluxo normal
        return;
      }
    }
  }
  
  // Só redirecionar se refresh token também falhou
  console.log('🔄 Refresh token não disponível ou inválido. Redirecionando para reautenticação...');
  const redirectUrl = `/secure/index.html?email=${encodeURIComponent(userEmail)}&provider=${provider || 'google'}&error=auth_failed&message=${errorMessage}&reason=no_valid_session`;
  
  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 1500);
  return;
}
```

---

### 4. **Cenário: `session_expired` (Área Restrita)**

**Arquivo:** `secure/js/restrita-main.js`  
**Linhas:** 124-134

**Situação:**
- Sessão expirou (access token expirado)
- Usuário ainda está autorizado
- Sistema redireciona para `/secure/index.html` com `reason=session_expired`

**Refresh Token:**
- ⚠️ **OPORTUNIDADE DE MELHORIA:** 
  - ✅ **DEVERIA tentar usar refresh token ANTES de redirecionar**
  - ✅ Este é o caso de uso PRINCIPAL do refresh token
  - ✅ Se refresh token estiver válido, pode renovar tokens sem precisar reautenticar

**Código Atual:**
```javascript
// Linha 124-134: restrita-main.js
if (authResult.authorized) {
  // RECOMENDAÇÃO PRINCIPAL: Redirecionar para reautenticação ao invés de renovar sessão mínima
  console.log('Restrita: Usuário ainda autorizado, mas sessão expirada. Redirecionando para reautenticação...');
  
  // ❌ Redireciona imediatamente, sem tentar refresh token
  const redirectUrl = `/secure/index.html?email=${encodeURIComponent(userEmail)}&provider=${provider || 'google'}&error=auth_failed&message=${errorMessage}&reason=session_expired`;
  
  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 1500);
  return;
}
```

**Melhoria Sugerida:**
```javascript
if (authResult.authorized) {
  console.log('Restrita: Usuário ainda autorizado, mas sessão expirada.');
  
  // ✅ TENTAR USAR REFRESH TOKEN ANTES DE REDIRECIONAR
  if (SessionManager && typeof SessionManager.refreshToken === 'function') {
    console.log('🔄 Tentando renovar tokens usando refresh token...');
    const refreshSuccess = await SessionManager.refreshToken();
    
    if (refreshSuccess) {
      console.log('✅ Tokens renovados com sucesso!');
      // Verificar novamente se agora tem sessão válida
      if (SessionManager.isAuthenticated()) {
        console.log('✅ Sessão restaurada, continuando...');
        // Continuar com o fluxo normal
        return;
      }
    } else {
      console.warn('⚠️ Refresh token não disponível ou inválido.');
    }
  }
  
  // Só redirecionar se refresh token também falhou
  console.log('🔄 Redirecionando para reautenticação...');
  const redirectUrl = `/secure/index.html?email=${encodeURIComponent(userEmail)}&provider=${provider || 'google'}&error=auth_failed&message=${errorMessage}&reason=session_expired`;
  
  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 1500);
  return;
}
```

---

## 📊 Resumo da Análise

| Cenário | Arquivo | Refresh Token Usado? | Deveria Usar? | Prioridade |
|---------|---------|---------------------|---------------|------------|
| `unauthorized_domain` | `oidc-callback-google.js` | ❌ Não | ❌ Não | - |
| `no_real_tokens` | `oidc-callback-microsoft.js` | ❌ Não | ❌ Não | - |
| `no_valid_session` | `restrita-main.js` | ❌ Não | ✅ **SIM** | 🔴 **ALTA** |
| `session_expired` | `restrita-main.js` | ❌ Não | ✅ **SIM** | 🔴 **ALTA** |

---

## 🎯 Recomendações

### 1. **Implementar Tentativa de Refresh Token na Área Restrita**

**Prioridade:** 🔴 **ALTA**

**Arquivos a Modificar:**
- `secure/js/restrita-main.js` (2 locais)

**Benefícios:**
- ✅ Evita redirecionamento desnecessário quando refresh token ainda é válido
- ✅ Melhora experiência do usuário (menos interrupções)
- ✅ Segue boas práticas de OAuth 2.1 (usar refresh token antes de reautenticar)
- ✅ Reduz carga no servidor (menos requisições de autenticação)

**Riscos:**
- ⚠️ Se refresh token também estiver expirado, ainda precisará redirecionar
- ⚠️ Adiciona uma chamada de API antes de redirecionar (pode adicionar ~500ms de delay)

---

### 2. **Manter Comportamento Atual nos Callbacks**

**Prioridade:** 🟢 **BAIXA**

**Arquivos:**
- `secure/js/oidc-callback-google.js`
- `secure/js/oidc-callback-microsoft.js`

**Razão:**
- ✅ Nos callbacks, não há refresh token disponível ainda (é o primeiro login)
- ✅ Problemas de `unauthorized_domain` e `no_real_tokens` não são resolvidos com refresh token

---

## 🔄 Fluxo Recomendado

### **Área Restrita - Verificação de Sessão**

```
1. Usuário acessa área restrita
   ↓
2. Verificar se tem sessão válida
   ↓
3. Se NÃO tem sessão válida:
   ├─ Verificar se tem refresh token armazenado
   │  ↓
   │  Se SIM:
   │  ├─ Tentar usar refresh token para obter novos tokens
   │  │  ↓
   │  │  Se SUCESSO:
   │  │  └─ Continuar com sessão restaurada ✅
   │  │
   │  └─ Se FALHA:
   │     └─ Redirecionar para reautenticação ❌
   │
   └─ Se NÃO tem refresh token:
      └─ Redirecionar para reautenticação ❌
```

---

## 📝 Notas Técnicas

### **SessionManager.refreshToken()**

**Arquivo:** `secure/js/session-manager.js`  
**Linhas:** 266-360

**Funcionalidade:**
- ✅ Usa refresh token armazenado em `localStorage.getItem('auth_refresh_token')`
- ✅ Chama endpoint específico por provider (`/auth/token/refresh/google` ou `/auth/token/refresh/microsoft`)
- ✅ Atualiza tokens no localStorage se bem-sucedido
- ✅ Retorna `true` se sucesso, `false` se falha

**Uso:**
```javascript
if (SessionManager && typeof SessionManager.refreshToken === 'function') {
  const success = await SessionManager.refreshToken();
  if (success) {
    // Tokens renovados com sucesso
  }
}
```

---

## ✅ Implementação

### **Status:** ✅ **IMPLEMENTADO**

As melhorias foram implementadas em `secure/js/restrita-main.js` nos seguintes locais:

1. **Linha 65-110:** Cenário `no_valid_session` - Tenta usar refresh token antes de redirecionar
2. **Linha 153-198:** Cenário `session_expired` - Tenta usar refresh token antes de redirecionar
3. **Linha 231-275:** Retry de email - Tenta usar refresh token antes de redirecionar

**Comportamento Implementado:**
- ✅ Verifica se `SessionManager.refreshToken()` está disponível
- ✅ Tenta usar refresh token para obter novos tokens
- ✅ Se bem-sucedido, recarrega a página para reiniciar fluxo com sessão válida
- ✅ Se falhar, redireciona para reautenticação (comportamento original)

**Benefícios:**
- ✅ Evita redirecionamento desnecessário quando refresh token ainda é válido
- ✅ Melhora experiência do usuário (menos interrupções)
- ✅ Segue boas práticas de OAuth 2.1
- ✅ Reduz carga no servidor (menos requisições de autenticação)

---

## ✅ Conclusão

O refresh token **foi implementado** nos cenários de `no_valid_session` e `session_expired` na área restrita, **antes de redirecionar para reautenticação**. Isso melhora significativamente a experiência do usuário e segue as melhores práticas de OAuth 2.1.

Nos cenários de callback (`unauthorized_domain`, `no_real_tokens`), o comportamento atual está correto, pois não há refresh token disponível ou o problema não é resolvido com refresh token.

