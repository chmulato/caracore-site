# 🔧 SOLUÇÃO: Erro redirect_uri inválido - ENTRA ID

## 🚨 Problema Identificado

**Erro:** `invalid_request: The provided value for the input parameter 'redirect_uri' is not valid`

**URI Problemática:** `https://www.caracore.com.br/secure/callback.html`

**Causa:** O redirect URI de PRODUÇÃO não está registrado no Azure App Registration do Entra ID.

**Client ID:** `8ef17663-438f-4777-99ca-c5ad5b2a2993`

## ✅ Solução Passo a Passo

### 🎯 **AÇÃO IMEDIATA NECESSÁRIA - AZURE PORTAL**

#### **1️⃣ Acesse o Azure Portal**

```text
🌐 URL: https://portal.azure.com
👤 Login: Use sua conta Microsoft/Azure
```

#### **2️⃣ Navegue até App Registrations**

```text
📍 Caminho: Portal → Azure Active Directory → App registrations
```

#### **3️⃣ Localize sua Aplicação**

```text
🔍 Busque por Client ID: 8ef17663-438f-4777-99ca-c5ad5b2a2993
📱 Ou nome: cara-core (ou similar)
```

#### **4️⃣ Entre em Authentication**

```text
⚙️ Menu lateral → Authentication
📱 Seção: Platform configurations → Web
```

#### **5️⃣ Adicione as URIs de Redirecionamento**

**🚨 URIs OBRIGATÓRIAS para PRODUÇÃO:**

```text
✅ https://www.caracore.com.br/secure/callback.html
✅ https://caracore.com.br/secure/callback.html
✅ https://www.caracore.com.br/secure/logout.html
✅ https://caracore.com.br/secure/logout.html
```

#### **🔥 IMPORTANTE: Configure também o Front-channel logout URL**

Na mesma página **Authentication**, role para baixo até encontrar:

**Front-channel logout URL:**

```text
✅ https://www.caracore.com.br/secure/logout.html
```

> ⚠️ **CRÍTICO**: Este campo é obrigatório para Single Sign-Out funcionar corretamente!

**🔧 URIs OPCIONAIS para DESENVOLVIMENTO:**

```text
✅ http://localhost:8000/secure/callback.html
✅ http://localhost:8000/secure/logout.html
✅ http://localhost:8080/secure/callback.html
✅ http://localhost:8080/secure/logout.html
✅ http://127.0.0.1:8000/secure/callback.html
✅ http://127.0.0.1:8080/secure/callback.html
```

#### **6️⃣ Salve as Alterações**

```text
💾 Clique em "Save" no topo da página
⏳ Aguarde confirmação (2-5 minutos para propagação)
```

---

## 🧪 **TESTE RÁPIDO APÓS CORREÇÃO**

### **URL de Teste Direto:**

```text
https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id=8ef17663-438f-4777-99ca-c5ad5b2a2993&redirect_uri=https://www.caracore.com.br/secure/callback.html&response_type=code&scope=openid profile email
```

**✅ Sucesso:** Não aparece erro de redirect_uri  
**❌ Falha:** Ainda aparece "invalid redirect_uri"

### **Teste no Site Real:**

1. Acesse: `https://www.caracore.com.br/secure/`
2. Clique em "Login with Microsoft"
3. Deve redirecionar sem erro

---

## 📊 Scripts de Diagnóstico Criados

1.**`scripts/corrigir_redirect_uri_entra.py`** - Diagnóstico e instruções completas

```bash
python scripts/corrigir_redirect_uri_entra.py --fix
```

2.**Auto-execução de verificação** - URIs atuais mostradas no console

---

## ⚠️ **PONTOS CRÍTICOS**

### **Case Sensitive**

``` text
❌ ERRADO: /Secure/Callback.html
✅ CORRETO: /secure/callback.html
```

### **Protocolo Correto**

```text
❌ ERRADO: http://www.caracore.com.br (produção)
✅ CORRETO: https://www.caracore.com.br (produção)
```

### **Tempo de Propagação**

```text
⏳ Aguarde 2-5 minutos após salvar no Azure
🔄 Pode levar até 10 minutos em alguns casos
```

## 🆘 **TROUBLESHOOTING**

### **Problema: Não encontra a aplicação no Azure**

```text
🔍 Busque por: 8ef17663-438f-4777-99ca-c5ad5b2a2993
📂 Verifique: "All applications" (não apenas "Owned applications")
👤 Confirme: Permissões de administrador Azure
```

### **Problema: URIs não salvam**

```text
🔄 Atualize a página do Azure Portal
⏳ Aguarde alguns minutos
💾 Confirme se clicou em "Save"
🔐 Verifique permissões de edição
```

### **Problema: Ainda aparece erro após registro**

```text
⏰ Aguarde até 10 minutos para propagação
🔄 Limpe cache do navegador
🧪 Teste URL direta primeiro
📝 Confirme URIs exatas (case-sensitive)
```

---

## ✅ **CHECKLIST FINAL ATUALIZADO**

- [ ] Acessou Azure Portal ([https://portal.azure.com])
- [ ] Encontrou app por Client ID: `8ef17663-438f-4777-99ca-c5ad5b2a2993`
- [ ] **Redirect URIs** - Adicionou URI: `https://www.caracore.com.br/secure/callback.html`
- [ ] **Redirect URIs** - Adicionou URI: `https://caracore.com.br/secure/callback.html`
- [ ] **Redirect URIs** - Adicionou URIs de logout também
- [ ] **⭐ Front-channel logout URL** - Configurou: `https://www.caracore.com.br/secure/logout.html`
- [ ] Clicou em "Save" e confirmou
- [ ] Aguardou 5+ minutos para propagação
- [ ] Testou URL direta (sem erro)
- [ ] Testou login no site (funcionando)
- [ ] **Testou logout** (Single Sign-Out funcionando)

---

## 📞 **STATUS**

**🔧 IMPLEMENTADO:** Script de correção `scripts/corrigir_redirect_uri_entra.py`  
**⏳ PENDENTE:** Registrar URIs no Azure Portal (ação manual)  
**🎯 PRÓXIMO:** Testar login após registro das URIs

**Resolução**: O erro será resolvido assim que as URIs forem registradas no Azure Portal do Entra ID.

**Script de Ajuda**: `python scripts/corrigir_redirect_uri_entra.py --validate`