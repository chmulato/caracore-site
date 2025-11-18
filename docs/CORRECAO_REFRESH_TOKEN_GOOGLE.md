# Correção - Refresh Token Google Não Retornado

## 📋 Problema

O Google não estava retornando `refresh_token` durante o login, resultando em:

```
⚠️ [Google] Sem refresh_token, não é possível criar sessão persistente
```

**Logs do Backend:**
```
refresh_token=ausente
```

**Logs do Frontend:**
```
hasRefreshToken: false
```

---

## 🔍 Causa

O Google OAuth requer o parâmetro `access_type=offline` na URL de autorização para retornar `refresh_token`. Sem este parâmetro, o Google retorna apenas `access_token` e `id_token`.

**Documentação Google:**
- [Using OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server#offline)
- O parâmetro `access_type=offline` é obrigatório para obter refresh tokens

---

## ✅ Correção Implementada

**Arquivo:** `secure/js/dynamic-config.js`

**Mudança:**
Adicionado `extraQueryParams` na configuração do Google:

```javascript
extraQueryParams: {
    access_type: 'offline',  // Obrigatório para obter refresh_token
    prompt: 'consent'         // Força novo consentimento para garantir refresh_token
}
```

**Código Completo:**
```javascript
return {
    authority: "https://accounts.google.com",
    client_id: "1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com",
    redirect_uri: `${baseUrl}${paths.callback}`,
    response_type: "code",
    scope: 'openid profile email',
    extraQueryParams: {
        access_type: 'offline',  // ✅ NOVO: Obtém refresh_token
        prompt: 'consent'        // ✅ NOVO: Força consentimento
    },
    // ... resto da configuração
};
```

---

## 📝 Explicação dos Parâmetros

### **1. `access_type=offline`**

**Obrigatório** para obter refresh_token do Google.

**Comportamento:**
- ✅ Com `access_type=offline`: Google retorna `refresh_token` na resposta
- ❌ Sem `access_type=offline`: Google retorna apenas `access_token` e `id_token`

**Documentação:** [Google OAuth 2.0 - Offline Access](https://developers.google.com/identity/protocols/oauth2/web-server#offline)

---

### **2. `prompt=consent`**

**Opcional**, mas recomendado para garantir refresh_token.

**Comportamento:**
- ✅ Força o Google a mostrar tela de consentimento
- ✅ Garante que refresh_token seja retornado mesmo se usuário já consentiu antes
- ⚠️ Usuário verá tela de consentimento toda vez (pode ser inconveniente)

**Alternativa:**
- Remover `prompt=consent` se quiser consentimento apenas na primeira vez
- Google retornará refresh_token apenas na primeira autorização

**Recomendação:**
- Manter `prompt=consent` para garantir refresh_token sempre
- Ou remover e aceitar que refresh_token só vem na primeira vez

---

## 🔄 Fluxo Antes vs Depois

### **Antes (Sem `access_type=offline`)**

```
1. Usuário faz login
   ↓
2. Google autoriza
   ↓
3. Backend troca código por tokens
   ↓
4. Google retorna: access_token, id_token
   ❌ refresh_token: ausente
   ↓
5. Frontend detecta: "Sem refresh_token"
   ↓
6. Sessão não persistente (expira em ~1 hora)
```

---

### **Depois (Com `access_type=offline`)**

```
1. Usuário faz login
   ↓
2. Google autoriza (com access_type=offline)
   ↓
3. Backend troca código por tokens
   ↓
4. Google retorna: access_token, id_token, refresh_token ✅
   ↓
5. Frontend salva refresh_token
   ↓
6. Sessão persistente (pode renovar tokens)
```

---

## 🧪 Como Testar

### **1. Limpar Consentimento Anterior**

Para testar, é necessário revogar consentimento anterior:

1. Acesse: https://myaccount.google.com/permissions
2. Revogue acesso da aplicação "CaraCore" (ou nome da app)
3. Faça login novamente

---

### **2. Fazer Login**

1. Acesse: `https://www.caracore.com.br/secure/index.html`
2. Digite email: `chmulato@gmail.com`
3. Clique em "Continuar com Google"
4. **Verificar:** Google deve mostrar tela de consentimento (devido a `prompt=consent`)

---

### **3. Verificar Logs**

**Backend:**
```
refresh_token=presente  ✅ (antes era "ausente")
```

**Frontend (Console):**
```
✅ [Google] Usando tokens REAIS: {
    hasAccessToken: true,
    hasIdToken: true,
    hasRefreshToken: true,  ✅ (antes era false)
    expiresIn: 3589
}
```

---

## ⚠️ Notas Importantes

### **1. Consentimento do Usuário**

Com `prompt=consent`, o usuário verá a tela de consentimento toda vez que fizer login. Isso pode ser inconveniente, mas garante refresh_token.

**Alternativa:**
- Remover `prompt: 'consent'` se preferir consentimento apenas na primeira vez
- Google retornará refresh_token apenas na primeira autorização

---

### **2. Refresh Token na Primeira Vez**

Mesmo com `access_type=offline`, o Google pode não retornar refresh_token se:
- Usuário já consentiu antes (sem `prompt=consent`)
- É uma re-autorização (não primeira vez)

**Solução:**
- Usar `prompt=consent` para forçar novo consentimento
- Ou aceitar que refresh_token só vem na primeira vez

---

### **3. Refresh Token Rotation**

O Google pode retornar um novo refresh_token a cada renovação (OAuth 2.1). O backend já está preparado para isso com refresh token rotation.

---

## 📚 Referências

- **Google OAuth 2.0 - Offline Access:** https://developers.google.com/identity/protocols/oauth2/web-server#offline
- **Google OAuth 2.0 - Prompt Parameter:** https://developers.google.com/identity/protocols/oauth2/openid-connect#re-consent
- **oidc-client-ts - extraQueryParams:** https://github.com/authts/oidc-client-ts

---

## ✅ Status

**Implementação:** ✅ **COMPLETA**

**Arquivo Modificado:**
- `secure/js/dynamic-config.js` - Adicionado `extraQueryParams` com `access_type=offline` e `prompt=consent`

**Próximos Passos:**
1. Testar login com Gmail
2. Verificar se refresh_token está sendo retornado
3. Verificar se sessão está sendo criada no backend
4. Testar renovação automática de tokens

---

## 🔄 Se Ainda Não Funcionar

### **Verificar Google Cloud Console**

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Verifique OAuth 2.0 Client ID
3. Verifique se "Authorized redirect URIs" inclui:
   - `https://www.caracore.com.br/secure/callback.html`

### **Verificar Consentimento**

1. Revogar consentimento: https://myaccount.google.com/permissions
2. Fazer login novamente
3. Verificar se refresh_token é retornado

### **Verificar Logs**

**Backend:**
```bash
# Procurar por:
refresh_token=presente
```

**Frontend (Console):**
```javascript
// Procurar por:
hasRefreshToken: true
```

