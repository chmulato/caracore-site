# SOLUÇÃO URGENTE: [www.caracore.com.br]

## 🚨 Problema Detectado

**Domínio:** [www.caracore.com.br]  
**Erro:** `redirect_uri is not valid`  
**Causa:** URI não registrada no Google Cloud Console

## ✅ AÇÃO IMEDIATA NECESSÁRIA

### 🎯 URI que DEVE ser adicionada:

```text
https://www.caracore.com.br/secure/callback.html
```

### 🔵 Google Cloud Console (URGENTE)

1. **Acesse:** [https://console.cloud.google.com/apis/credentials]
2. **Encontre:** OAuth 2.0 Client ID: `1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com`
3. **Clique** no Client ID para editar
4. **Na seção "Authorized JavaScript origins"**, clique em "ADD URI"
5. **Adicione:** `https://www.caracore.com.br`
6. **Na seção "Authorized redirect URIs"**, clique em "ADD URI"  
7. **Adicione:** `https://www.caracore.com.br/secure/callback.html`
8. **Clique em "SAVE"**
9. **Aguarde 2-5 minutos** para propagação

### 🔷 Microsoft Azure Portal (OPCIONAL)

1. **Acesse:** [https://portal.azure.com/]
2. **Navegue:** Azure Active Directory > App registrations
3. **Encontre:** Cara Core Área 51 (`8ef17663-438f-4777-99ca-c5ad5b2a2993`)
4. **Clique:** Authentication
5. **Adicione:** `https://www.caracore.com.br/secure/callback.html` em Redirect URIs
6. **Save**

## 📋 Lista Completa de URIs Necessárias

### 🌐 Origens JavaScript autorizadas (JavaScript origins):

```
http://localhost:8000                              (desenvolvimento)
http://localhost:3000                              (desenvolvimento alt)  
https://chmulato.github.io                         (GitHub Pages)
https://www.caracore.com.br                        (NOVO - Caracore)
```

### 🔄 URIs de redirecionamento (Redirect URIs):

```text
http://localhost:8000/secure/callback.html           (desenvolvimento)
http://localhost:3000/secure/callback.html           (desenvolvimento alt)
https://chmulato.github.io/cara-core/secure/callback.html  (GitHub Pages)
https://www.caracore.com.br/secure/callback.html     (NOVO - Caracore)
```

## 🧪 Teste Rápido

### No console do navegador:

```javascript
// Verificar configuração atual
await window.showCurrentUris();

// Copiar URI para clipboard
await window.caracoreFix.copyUri();

// Executar correção específica
window.caracoreFix.fix();
```

## 🔧 Correções Aplicadas

### ✅ Problemas Resolvidos:

1. **Erro `OIDC is not defined`** - Corrigido para `window.OIDCAuth`
2. **Detecção do domínio caracore** - Script específico criado
3. **Configuração dinâmica** - Funciona para [www.caracore.com.br]

### ✅ Scripts Adicionados:

- `fix-caracore-domain.js` - Correção específica
- Detecção automática do domínio
- Instruções personalizadas para caracore

## ⏱️ Timeline da Solução

1. **AGORA:** Adicionar URI no Google Cloud Console
2. **2-5 min:** Aguardar propagação
3. **Depois:** Recarregar página e testar login
4. **Verificar:** Logs para confirmar sucesso

## 📞 Status

**🔧 IMPLEMENTADO:** Correções de código  
**⏳ PENDENTE:** Registro da URI no Google Cloud Console  
**🎯 ETA:** 5 minutos após registro da URI

---

**PRIORIDADE MÁXIMA:** Adicionar `https://www.caracore.com.br/secure/callback.html` no Google Cloud Console
