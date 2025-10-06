# SOLUÇÃO COMPLETA: Google Cloud Console para www.caracore.com.br

## 🎯 CONFIGURAÇÕES NECESSÁRIAS NO GOOGLE CLOUD CONSOLE

### 📍 **Client ID:** `1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com`

### 🌐 **Authorized JavaScript origins:**
```
https://www.caracore.com.br
```
*(Adicionar esta origem para permitir que o JavaScript do site faça chamadas para o Google)*

### 🔄 **Authorized redirect URIs:**
```
https://www.caracore.com.br/secure/callback.html
```
*(Adicionar esta URI para onde o Google deve redirecionar após autenticação)*

## 📝 PASSOS DETALHADOS

### 1. **Acesse o Google Cloud Console:**
URL: <https://console.cloud.google.com/apis/credentials>

### 2. **Encontre o OAuth 2.0 Client ID:**
Procure por: `1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com`
Clique no Client ID para editar

### 3. **Configure JavaScript Origins:**
   - Na seção **"Authorized JavaScript origins"**
   - Clique em **"ADD URI"**
   - Adicione: `https://www.caracore.com.br`

### 4. **Configure Redirect URIs:**
   - Na seção **"Authorized redirect URIs"**  
   - Clique em **"ADD URI"**
   - Adicione: `https://www.caracore.com.br/secure/callback.html`

### 5. **Salvar:**
   - Clique em **"SAVE"**
   - Aguarde **2-5 minutos** para propagação

### 6. **Testar:**
   - Recarregue a página www.caracore.com.br
   - Teste o login com Google

## 🧪 COMANDOS DE TESTE

```javascript
// Copiar configurações completas
await window.googleConfig.copyAll();

// Copiar apenas URIs do Caracore  
await window.googleConfig.copyCaracore();

// Ver instruções passo a passo
window.googleConfig.instructions();

// Mostrar configuração atual vs necessária
window.googleConfig.compare();
```

## 📊 CONFIGURAÇÃO COMPLETA RECOMENDADA

Para evitar problemas futuros, recomenda-se adicionar **TODAS** as URIs:

### **JavaScript Origins:**
- `http://localhost:8000` (desenvolvimento)
- `http://localhost:3000` (desenvolvimento alternativo)
- `https://chmulato.github.io` (GitHub Pages)
- `https://www.caracore.com.br` (Caracore - **NOVO**)

### **Redirect URIs:**

- `http://localhost:8000/secure/callback.html`
- `http://localhost:3000/secure/callback.html`
- `https://chmulato.github.io/cara-core/secure/callback.html`
- `https://www.caracore.com.br/secure/callback.html` (**NOVO**)

## ⚠️ IMPORTANTE

1. **JavaScript Origins** = Domínio base onde o código JavaScript roda
2. **Redirect URIs** = URL específica para onde redirecionar após login
3. **Ambos são necessários** para funcionamento completo
4. **Aguarde propagação** - mudanças podem levar alguns minutos

## 🎯 PRIORIDADE

**URGENTE:** Adicionar especificamente para <https://www.caracore.com.br>:

- JavaScript Origin: `https://www.caracore.com.br`
- Redirect URI: `https://www.caracore.com.br/secure/callback.html`

---
**Status:** ⏳ Aguardando configuração no Google Cloud Console
