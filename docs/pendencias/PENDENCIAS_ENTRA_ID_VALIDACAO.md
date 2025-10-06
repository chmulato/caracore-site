# 🔍 O Que Falta Validar no Projeto Área 51 - Microsoft Entra ID

## 📋 **STATUS ATUAL (Baseado na Validação de 04/10/2025)**

### **✅ JÁ IMPLEMENTADO E FUNCIONANDO:**

1. **Fluxo OIDC Básico** ✅
   - Authorization Code + PKCE implementado
   - Backend valida `code_verifier`
   - Validação de tokens (assinatura JWKS, `aud`, `iss`, `exp`, `nonce`)

2. **Correção AADSTS9002346** ✅  
   - Endpoint `/consumers` para contas pessoais Microsoft
   - Documentado em `TESTE-CORRECAO-MICROSOFT.md`

3. **Ferramentas de Diagnóstico** ✅
   - Scripts para URIs (`diagnose-redirect-uri.js`, `show-current-uris.js`)
   - Logs administrativos (`secure/admin-logs.html`)

---

## ⚠️ **O QUE FALTA VALIDAR/IMPLEMENTAR:**

### **🏢 1. CONFIGURAÇÃO NO PORTAL MICROSOFT ENTRA**

#### **📍 PENDÊNCIAS CRÍTICAS:**
- [ ] **Verificar Redirect URIs cadastradas**
  - Confirmar todas as URIs em `dynamic-config.js` estão registradas
  - Validar URIs para dev/homolog/prod
  - Confirmar URIs de logout (`post_logout_redirect_uri`)

- [ ] **Verificar "Supported Account Types"**
  - Confirmar se app está como single-tenant ou multi-tenant
  - Validar comportamento com `authority: common` vs tenant específico

- [ ] **API Permissions e Admin Consent**
  - Revisar permissões em **API permissions**
  - Verificar se há consentimento administrativo necessário
  - Validar escopos além de `openid profile email`

#### **📍 Como Validar:**
```
1. Azure Portal → Microsoft Entra ID → App Registrations
2. Encontrar aplicação: client_id = 8ef17663-438f-4777-99ca-c5ad5b2a2993
3. Verificar:
   - Authentication → Redirect URIs
   - Authentication → Supported account types  
   - API permissions → Status dos consentimentos
   - Token configuration → Optional claims
```

### **🌐 2. TESTES CROSS-BROWSER E COMPATIBILIDADE**

#### **📍 PENDÊNCIAS:**
- [ ] **Teste Safari/iOS (ITP - Intelligent Tracking Prevention)**
  - Validar se login funciona no Safari
  - Testar em modo privado/anônimo
  - Verificar comportamento em iOS

- [ ] **Teste Cookies SameSite**
  - Validar `localStorage` vs cookies
  - Testar cenários com cookies restritos
  - Verificar CORS em produção

- [ ] **Teste Multi-Dispositivo**
  - Desktop vs mobile
  - Diferentes navegadores certificados

#### **📍 Como Testar:**
```bash
# Usar script automatizado existente
cd C:\dev\site_oidc\cara-core
python scripts/test_oidc_login.py --headless

# Teste manual em:
# - Chrome/Edge (atuais)
# - Firefox 118+
# - Safari 17+ / iOS
```

### **🔐 3. SEGURANÇA E TOKENS**

#### **📍 PENDÊNCIAS:**
- [ ] **Validação de Access vs ID Tokens**
  - Confirmar que APIs aceitam apenas access tokens válidos
  - Implementar rejeição de tokens expirados/inválidos

- [ ] **Plano de Rotação de Tokens**
  - Documentar estratégia refresh tokens
  - Implementar revogação de tokens
  - Definir TTL adequado

- [ ] **Claims Opcionais**
  - Revisar **Token configuration** no portal
  - Adicionar claims como `email`, `upn` se necessário
  - Validar se atributos existem para todos usuários

### **🔄 4. LOGOUT E SSO**

#### **📍 PENDÊNCIAS:**
- [ ] **Teste Logout Completo**
  - Validar front-channel logout
  - Testar SSO entre múltiplas abas/apps
  - Confirmar limpeza de sessões

- [ ] **Teste Multi-App**
  - Se houver outros apps no mesmo domínio
  - Validar comportamento SSO

### **🏗️ 5. AMBIENTES E CONFIGURAÇÃO**

#### **📍 PENDÊNCIAS:**
- [ ] **Segregação de Ambientes**
  - Confirmar client_id diferentes para dev/prod
  - Validar URIs específicas por ambiente
  - Testar discovery endpoints

- [ ] **Configuração Dinâmica**
  - Validar comportamento `fix-caracore-domain.js`
  - Testar alternância tenant específico vs common

---

## 🎯 **PLANO DE VALIDAÇÃO PRIORITÁRIO**

### **📅 SEMANA 1: Portal Microsoft**
1. **Login Azure Portal** e validar configurações
2. **Screenshots** de todas as configurações críticas
3. **Ajustes** necessários nas URIs/permissões

### **📅 SEMANA 2: Testes Práticos**
1. **Testes automatizados** com script existente
2. **Testes manuais** em diferentes navegadores
3. **Documentação** dos resultados

### **📅 SEMANA 3: Segurança**
1. **Implementar** validações de token adicionais
2. **Documentar** plano de rotação
3. **Testar** cenários de falha

---

## 🚨 **RISCOS IDENTIFICADOS**

### **🔴 ALTO RISCO:**
- **Portal não configurado** → Login não funciona
- **URIs incorretas** → Erro AADSTS50011
- **Safari/iOS incompatível** → Perda de usuários mobile

### **🟡 MÉDIO RISCO:**
- **Claims ausentes** → Dados incompletos do usuário
- **Tokens mal validados** → Vulnerabilidade de segurança
- **Logout incompleto** → Sessões orfãs

### **🟢 BAIXO RISCO:**
- **Ambientes misturados** → Confusão em desenvolvimento
- **Performance** → Latência aceitável

---

## ✅ **CHECKLIST DE VALIDAÇÃO FINAL**

### **Portal Microsoft Entra ID:**
- [ ] App registration encontrado e acessível
- [ ] Todas redirect URIs cadastradas
- [ ] Supported account types adequado
- [ ] API permissions com consentimento
- [ ] Token configuration revisada

### **Testes Funcionais:**
- [ ] Login funciona Chrome/Edge
- [ ] Login funciona Firefox 118+
- [ ] Login funciona Safari 17+/iOS
- [ ] Logout completo funciona
- [ ] Multi-tab/SSO funciona

### **Segurança:**
- [ ] Tokens validados corretamente
- [ ] APIs rejeitam tokens inválidos
- [ ] Plano rotação documentado
- [ ] Claims necessários configurados

### **Documentação:**
- [ ] Evidências portal atualizadas
- [ ] Resultados testes documentados
- [ ] Configuração final validada

---

## 📞 **PRÓXIMAS AÇÕES RECOMENDADAS**

1. **COMECE AQUI:** Validação portal Microsoft Entra ID
2. **PRIORITY:** Teste Safari/iOS (maior risco)
3. **SECURITY:** Implementação validações token
4. **DOCS:** Atualização evidências/relatórios

**Status:** 🟡 **75% COMPLETO** - Faltam validações portal + testes cross-browser