# SOLUÇÃO: Erro redirect_uri inválido

## 🚨 Problema Identificado

**Erro:** `invalid_request: The provided value for the input parameter 'redirect_uri' is not valid`

**Causa:** As URIs de redirecionamento não estão registradas nos consoles dos provedores (Google e/ou Microsoft).

## ✅ Solução Implementada

### 📊 Scripts de Diagnóstico Criados:

1. **`diagnose-redirect-uri.js`** - Diagnóstico completo
2. **`fix-redirect-uri-detection.js`** - Correção de detecção de ambiente  
3. **`show-current-uris.js`** - Mostra URIs atuais (AUTO-EXECUTA)

### 🔧 URIs que DEVEM estar registradas:

#### Google Cloud Console:

```text
http://localhost:8000/secure/callback.html
http://127.0.0.1:8000/secure/callback.html  
https://chmulato.github.io/cara-core/secure/callback.html
```

#### Microsoft Azure Portal:

```text
http://localhost:8000/secure/callback.html
http://127.0.0.1:8000/secure/callback.html
https://chmulato.github.io/cara-core/secure/callback.html
```

## 🎯 AÇÃO NECESSÁRIA

### 1. Verificar URIs Atuais

- Acesse a área restrita
- Abra o console do navegador
- O script `show-current-uris.js` executará automaticamente
- Copie as URIs mostradas

### 2. Registrar no Google Cloud Console

1. Acesse: <https://console.cloud.google.com/>
2. APIs & Services > Credentials
3. Client ID: `1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com`
4. Adicione as URIs na seção "Authorized redirect URIs"
5. Save

### 3. Registrar no Microsoft Azure Portal  

1. Acesse: [https://portal.azure.com/]
2. Azure Active Directory > App registrations
3. App: Cara Core Área 51 (`***AZURE_SECRET_REDACTED***`)
4. Authentication > Redirect URIs
5. Adicione as URIs
6. Save

### 4. Testar

- Aguarde 2-5 minutos para propagação
- Tente fazer login novamente
- Verifique se o erro desapareceu

## 🧪 Comandos de Teste

```javascript
// Verificar URIs atuais
await window.showCurrentUris();

// Copiar URIs para clipboard
await window.copyUrisToClipboard();

// Diagnóstico completo
await window.redirectUriDiagnostic.diagnose();

// Corrigir configuração
await window.redirectUriFix.fixConfig();
```

## 📞 Status

**🔧 IMPLEMENTADO:** Scripts de diagnóstico e correção  
**⏳ PENDENTE:** Registrar URIs nos consoles dos provedores  
**🎯 PRÓXIMO:** Testar login após registro das URIs

---
O erro será resolvido assim que as URIs forem registradas nos consoles do Google e Microsoft.