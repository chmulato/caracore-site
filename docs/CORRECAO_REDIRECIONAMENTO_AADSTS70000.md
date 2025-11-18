# Correção - Redirecionamento Conflitante para AADSTS70000

## 📋 Problema

Quando ocorria erro `AADSTS70000` (escopos não autorizados) para `ale.mulato@hotmail.com`, o sistema fazia dois redirecionamentos conflitantes:

1. **Primeiro redirecionamento:** Para `/secure/first-access.html` (correto)
2. **Segundo redirecionamento:** Para `/secure/index.html` (sobrescrevia o primeiro)

**Resultado:** Usuário era redirecionado para `index.html` ao invés de `first-access.html`, impedindo que o usuário concedesse as permissões necessárias.

---

## 🔍 Causa

**Fluxo problemático:**

```
1. getRealUserEmail() detecta AADSTS70000
   ↓
2. Redireciona para first-access.html (setTimeout 2000ms)
   ↓
3. Retorna null
   ↓
4. createAuthentication() recebe null
   ↓
5. Busca email de outras fontes
   ↓
6. Verifica autorização (usuário está autorizado)
   ↓
7. Redireciona para index.html (setTimeout 1500ms) ← SOBRESCREVE O PRIMEIRO
```

**Problema:** O segundo redirecionamento (1500ms) acontecia antes do primeiro (2000ms), sobrescrevendo o redirecionamento correto.

---

## ✅ Correções Implementadas

**Arquivo:** `secure/js/oidc-callback-microsoft.js`

### **1. Redirecionamento Imediato para AADSTS70000**

**Antes:**
```javascript
if (isScopeError) {
    // ...
    setTimeout(() => {
        window.location.href = `/secure/first-access.html?...`;
    }, 2000);  // ← Delay permitia conflito
    return null;
}
```

**Depois:**
```javascript
if (isScopeError) {
    // ...
    if (emailFromStorage) {
        // Redirecionar imediatamente para evitar conflito
        window.location.href = `/secure/first-access.html?...`;
        return null; // Parar processamento imediatamente
    } else {
        // Se não houver email, redirecionar sem email
        window.location.href = `/secure/first-access.html?provider=microsoft&error=scope_unauthorized`;
        return null; // Parar processamento imediatamente
    }
}
```

**Benefício:** Redirecionamento imediato evita que o código continue processando.

---

### **2. Verificação de Redirecionamento em createAuthentication**

**Nova verificação:**
```javascript
if (!realUserData) {
    // Verificar se já foi redirecionado para first-access.html (erro AADSTS70000)
    // Se sim, não continuar processando para evitar redirecionamentos conflitantes
    const currentUrl = window.location.href;
    if (currentUrl.includes('first-access.html') || currentUrl.includes('scope_unauthorized')) {
        console.log('✅ Já redirecionado para first-access.html, parando processamento');
        return false;
    }
    // ... resto do código
}
```

**Benefício:** Evita processamento adicional se já foi redirecionado.

---

### **3. Verificação Dupla Antes de Redirecionar**

**Nova verificação:**
```javascript
if (authData.authorized === true) {
    // Verificar novamente se não foi redirecionado para first-access.html
    const currentUrlCheck = window.location.href;
    if (currentUrlCheck.includes('first-access.html') || currentUrlCheck.includes('scope_unauthorized')) {
        console.log('✅ Já redirecionado para first-access.html, não redirecionando novamente');
        return false;
    }
    // ... redirecionar para index.html
}
```

**Benefício:** Verificação adicional antes de fazer segundo redirecionamento.

---

## 🔄 Fluxo Corrigido

**Fluxo correto:**

```
1. getRealUserEmail() detecta AADSTS70000
   ↓
2. Redireciona IMEDIATAMENTE para first-access.html ✅
   ↓
3. Retorna null
   ↓
4. createAuthentication() recebe null
   ↓
5. Verifica URL atual
   ↓
6. Detecta que já está em first-access.html ✅
   ↓
7. Para processamento (return false) ✅
   ↓
8. Usuário vê página de primeiro acesso ✅
```

---

## 📊 Mudanças Implementadas

| Mudança | Localização | Impacto |
|---------|-------------|---------|
| Redirecionamento imediato | `getRealUserEmail()` linha 440 | Evita delay que permitia conflito |
| Verificação de URL | `createAuthentication()` linha 792 | Evita processamento após redirecionamento |
| Verificação dupla | `createAuthentication()` linha 874 | Garante que não há redirecionamento conflitante |

---

## 🧪 Como Testar

### **1. Simular Erro AADSTS70000**

1. Fazer login com `ale.mulato@hotmail.com`
2. Microsoft retorna erro 400 com `AADSTS70000`
3. **Verificar Console:**
   ```
   ⚠️ Erro de escopos não autorizados (AADSTS70000)
   📧 Email encontrado em storage, redirecionando para primeiro acesso: ale.mulato@hotmail.com
   ```

4. **Verificar Redirecionamento:**
   - URL deve ser: `/secure/first-access.html?email=ale.mulato%40hotmail.com&provider=microsoft&error=scope_unauthorized`
   - **NÃO deve** ser redirecionado para `index.html`

---

### **2. Verificar Logs**

**Console (Frontend):**
```
✅ ⚠️ Erro de escopos não autorizados (AADSTS70000)
✅ 📧 Email encontrado em storage, redirecionando para primeiro acesso: ale.mulato@hotmail.com
✅ ✅ Já redirecionado para first-access.html, parando processamento
```

**Não deve aparecer:**
```
❌ 📤 Redirecionando para: /secure/index.html?...
```

---

## ⚠️ Notas Importantes

### **1. Erro AADSTS70000**

Este erro indica que:
- Usuário não concedeu todas as permissões necessárias
- Permissões expiradas ou revogadas
- Usuário novo que precisa ser registrado

**Solução:** Redirecionar para `first-access.html` para que o usuário possa:
- Conceder permissões novamente
- Registrar-se no sistema (se necessário)

---

### **2. Redirecionamento Imediato**

**Antes:** `setTimeout(..., 2000)` permitia que o código continuasse processando.

**Depois:** `window.location.href = ...` imediato para evitar conflitos.

---

### **3. Verificação de URL**

A verificação de URL garante que:
- Se já foi redirecionado para `first-access.html`, não processar mais
- Evita redirecionamentos conflitantes
- Melhora experiência do usuário

---

## 🔗 Referências

- **Erro AADSTS70000:** `docs/CORRECAO_EXCECOES_MICROSOFT_AUTH.md`
- **Callback Microsoft:** `secure/js/oidc-callback-microsoft.js`
- **First Access:** `secure/js/first-access.js`

---

## ✅ Status

**Problema:** ✅ **CORRIGIDO** - Redirecionamento conflitante resolvido

**Implementação:** ✅ **COMPLETA** - 3 correções implementadas

**Teste:** ⏳ **PENDENTE** - Testar com `ale.mulato@hotmail.com`

---

## 🎯 Próximos Passos

1. Testar login com `ale.mulato@hotmail.com`
2. Verificar se redireciona para `first-access.html`
3. Verificar se usuário pode conceder permissões
4. Verificar se login funciona após conceder permissões

