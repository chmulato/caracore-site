# Problema - Google Não Retorna Refresh Token

## 📋 Problema

O Google não está retornando `refresh_token` na primeira troca de código, mesmo com `access_type=offline` e `prompt=consent` configurados.

**Sintomas:**
- Login bem-sucedido
- Backend retorna tokens (status 200)
- `hasRefreshToken: false` no frontend
- Mensagem: `⚠️ [Google] Sem refresh_token, não é possível criar sessão persistente`

---

## 🔍 Causa

O Google só retorna `refresh_token` se:

1. ✅ `access_type=offline` está na requisição de autorização
2. ✅ `prompt=consent` força novo consentimento
3. ❌ **MAS:** Se o usuário já consentiu antes, o Google pode não mostrar a tela de consentimento novamente, mesmo com `prompt=consent`
4. ❌ **RESULTADO:** Google não retorna `refresh_token` porque não houve novo consentimento

---

## ✅ Soluções

### **Solução 1: Revogar Consentimento Anterior (RECOMENDADO)**

**Para o usuário:**

1. Acesse: https://myaccount.google.com/permissions
2. Encontre a aplicação "Cara Core" (ou o nome da sua aplicação)
3. Clique em "Remover acesso" ou "Revogar"
4. Faça login novamente
5. Google mostrará tela de consentimento
6. `refresh_token` será retornado

---

### **Solução 2: Verificar Configuração**

**Verificar se `extraQueryParams` está sendo usado:**

1. Abrir DevTools → Console
2. Fazer login com Google
3. Verificar logs:
   ```
   [DEBUG] Config extraQueryParams detectado
   {
     provider: 'google',
     extraQueryParams: { access_type: 'offline', prompt: 'consent' }
   }
   ```

**Se não aparecer:**
- `extraQueryParams` não está sendo usado
- Verificar `dynamic-config.js` linha 75-78

---

### **Solução 3: Verificar URL de Autorização**

**Verificar se os parâmetros estão na URL:**

1. Abrir DevTools → Network
2. Fazer login com Google
3. Verificar requisição para `accounts.google.com/o/oauth2/v2/auth`
4. Verificar se a URL contém:
   - `access_type=offline`
   - `prompt=consent`

**Se não estiver:**
- `oidc-client-ts` não está usando `extraQueryParams`
- Pode ser necessário adicionar manualmente na URL

---

### **Solução 4: Adicionar `approval_prompt=force` (DEPRECATED)**

**Nota:** `approval_prompt=force` está deprecated, mas ainda funciona.

**Modificar `dynamic-config.js`:**

```javascript
extraQueryParams: {
    access_type: 'offline',
    prompt: 'consent',
    approval_prompt: 'force'  // DEPRECATED mas ainda funciona
}
```

---

## 🔧 Verificações Implementadas

### **1. Log de Configuração**

**Arquivo:** `secure/js/auth-standalone.js`

```javascript
// Log da configuração para debug (especialmente extraQueryParams)
if (config.extraQueryParams) {
    this.logger.debug('Config extraQueryParams detectado', {
        provider: resolvedProvider,
        extraQueryParams: config.extraQueryParams
    });
} else {
    this.logger.debug('Config SEM extraQueryParams', {
        provider: resolvedProvider
    });
}
```

**Uso:** Verificar se `extraQueryParams` está sendo detectado na inicialização.

---

### **2. Mensagem de Aviso**

**Arquivo:** `secure/js/oidc-callback-google.js`

```javascript
if (!refreshToken) {
    console.warn('⚠️ [Google] Sem refresh_token, não é possível criar sessão persistente');
}
```

**Uso:** Avisar quando `refresh_token` não está disponível.

---

## 📊 Configuração Atual

**Arquivo:** `secure/js/dynamic-config.js`

```javascript
extraQueryParams: {
    access_type: 'offline',
    prompt: 'consent'  // Força novo consentimento para garantir refresh_token mesmo se já tiver consentido antes
}
```

**Status:** ✅ **CORRETO** - Configuração está correta

---

## 🧪 Como Testar

### **1. Verificar Logs**

**Console (Frontend):**
```
✅ [DEBUG] Config extraQueryParams detectado
✅ { provider: 'google', extraQueryParams: { access_type: 'offline', prompt: 'consent' } }
```

**Se não aparecer:**
- `extraQueryParams` não está sendo usado
- Verificar `dynamic-config.js`

---

### **2. Verificar URL de Autorização**

**Network (DevTools):**
```
GET https://accounts.google.com/o/oauth2/v2/auth?
  client_id=...
  &redirect_uri=...
  &response_type=code
  &scope=...
  &access_type=offline      ← DEVE ESTAR PRESENTE
  &prompt=consent           ← DEVE ESTAR PRESENTE
  &state=...
```

**Se não estiver:**
- `oidc-client-ts` não está usando `extraQueryParams`
- Pode ser necessário adicionar manualmente

---

### **3. Revogar Consentimento**

1. Acesse: https://myaccount.google.com/permissions
2. Revogue acesso da aplicação
3. Faça login novamente
4. Verificar se `refresh_token` é retornado

---

## ⚠️ Notas Importantes

### **1. Google Behavior**

O Google pode não retornar `refresh_token` se:
- Usuário já consentiu antes
- Google não mostra tela de consentimento novamente (mesmo com `prompt=consent`)
- Usuário tem refresh_token válido anterior

---

### **2. Solução Temporária**

Se `refresh_token` não estiver disponível:
- Sessão será criada sem refresh_token
- Usuário precisará fazer login novamente quando sessão expirar
- Não é ideal, mas funciona

---

### **3. Solução Permanente**

**Recomendação:**
- Revogar consentimento anterior
- Fazer login novamente
- Google mostrará tela de consentimento
- `refresh_token` será retornado

---

## 🔗 Referências

- **Google OAuth 2.0:** https://developers.google.com/identity/protocols/oauth2/web-server#offline
- **oidc-client-ts:** https://github.com/authts/oidc-client-ts
- **Configuração:** `secure/js/dynamic-config.js`
- **Callback:** `secure/js/oidc-callback-google.js`

---

## ✅ Status

**Problema:** ✅ **IDENTIFICADO** - Google não retorna refresh_token se usuário já consentiu antes

**Solução:** ✅ **DOCUMENTADA** - Revogar consentimento anterior e fazer login novamente

**Configuração:** ✅ **CORRETA** - `access_type=offline` e `prompt=consent` estão configurados

**Próximos Passos:**
1. Verificar se `extraQueryParams` está sendo usado (logs adicionados)
2. Se não estiver, adicionar manualmente na URL de autorização
3. Orientar usuários a revogar consentimento anterior se necessário

