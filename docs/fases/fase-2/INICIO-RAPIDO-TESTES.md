# Guia de Início Rápido - Testes E2E

**Pronto para começar os testes!** 🧪

---

## 🚀 Passo 1: Preparação do Ambiente

### 1.1. Verificar Backend

```powershell
# Verificar se backend está rodando
curl http://localhost:5051/health

# Ou acessar no navegador:
# http://localhost:5051/health
# Deve retornar: {"status": "ok", ...}
```

**Se backend NÃO estiver rodando:**
```powershell
cd D:\dev\site\cara-core\backend
python app.py
```

### 1.2. Verificar Frontend

Abrir no navegador:
- Local: `http://localhost:5500` (ou porta configurada)
- Ou usar Live Server do VS Code

### 1.3. Limpar Estado Inicial

Abrir Console do navegador (F12) e executar:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 🧪 Passo 2: Testes Críticos (Ordem Recomendada)

### **TESTE 1: Login + Notificação** ⭐ (5 min)

1. ✅ Acessar: `http://localhost:5500/secure/restrita.html`
2. ✅ Clicar em "Entrar com Google" ou "Entrar com Microsoft"
3. ✅ Fazer login
4. ✅ **VERIFICAR:** Notificação verde "Login Realizado" aparece no canto superior direito
5. ✅ **VERIFICAR:** Duração ~3 segundos, depois desaparece

**Console (F12):**
```javascript
// Verificar estado
SessionManager.isAuthenticated(); // deve retornar true
SessionManager.getUserInfo();      // deve retornar objeto com email/name
localStorage.getItem('auth_provider'); // 'google' ou 'microsoft'
```

**✅ PASSOU se:**
- Notificação apareceu
- Login completo
- Console sem erros

---

### **TESTE 2: LogoutModal Local** ⭐ (3 min)

1. ✅ Clicar em "Encerrar sessão" na página
2. ✅ **VERIFICAR:** Modal aparece com 2 opções
3. ✅ Ler as opções:
   - "Sair deste site" (azul)
   - "Sair de todas as contas" (vermelho)
4. ✅ Clicar em **"Sair deste site"**
5. ✅ **VERIFICAR:** Notificação verde "Logout Realizado" aparece
6. ✅ **VERIFICAR:** Redirecionamento para página de login

**Console:**
```javascript
// Após logout, deve retornar null
localStorage.getItem('auth_access_token'); // null
SessionManager.isAuthenticated();          // false
```

**✅ PASSOU se:**
- Modal abriu
- Notificação apareceu
- Logout completo
- Redirecionamento OK

---

### **TESTE 3: LogoutModal Federado** ⭐ (5 min)

**IMPORTANTE:** Antes do teste, abrir nova aba:
- Google: `https://myaccount.google.com/`
- Microsoft: `https://account.microsoft.com/`

Verificar que está logado no provedor.

**Passos:**
1. ✅ Fazer login novamente na aplicação
2. ✅ Clicar em "Encerrar sessão"
3. ✅ Clicar em **"Sair de todas as contas"**
4. ✅ **VERIFICAR:** Notificação "Logout Realizado" aparece
5. ✅ **VERIFICAR:** Redirecionamento para logout do provedor
6. ✅ Voltar para aba do Google/Microsoft Account
7. ✅ **VERIFICAR:** Não está mais logado lá também

**✅ PASSOU se:**
- Modal funcionou
- Notificação apareceu
- Logout federado completo
- Deslogado em ambos os lugares

---

### **TESTE 4: Teclado + ESC** ⭐ (3 min)

**NÃO USAR O MOUSE!**

1. ✅ Fazer login
2. ✅ Pressionar `Tab` até chegar no botão "Encerrar sessão"
3. ✅ Pressionar `Enter` para abrir modal
4. ✅ **VERIFICAR:** Modal abre
5. ✅ Pressionar `ESC`
6. ✅ **VERIFICAR:** Modal fecha
7. ✅ Pressionar `Tab` + `Enter` novamente para reabrir
8. ✅ Pressionar `Tab` para navegar entre botões do modal
9. ✅ Pressionar `Enter` no botão desejado

**✅ PASSOU se:**
- 100% navegável por teclado
- ESC fecha modal
- Enter ativa botões
- Focus visível (borda azul)

---

### **TESTE 5: Múltiplas Notificações** ⭐ (2 min)

Abrir Console (F12) e executar:

```javascript
// Disparar 7 notificações rapidamente
NotificationBridge.showSuccess('login_success');
NotificationBridge.showError('invalid_token');
NotificationBridge.showWarning('rate_limit_exceeded');
NotificationBridge.showInfo('session_refreshed');
NotificationBridge.showSuccess('consent_registered');
NotificationBridge.showError('network_error');
NotificationBridge.showWarning('logout_partial');
```

**VERIFICAR:**
- ✅ Máximo 5 notificações visíveis ao mesmo tempo
- ✅ Mais antigas desaparecem automaticamente
- ✅ Empilhadas verticalmente
- ✅ Sem sobreposição
- ✅ Cada uma com progress bar animada

**✅ PASSOU se:**
- Máximo 5 visíveis
- Fila gerenciada
- Layout perfeito

---

### **TESTE 6: Sessão Expirada** ⭐ (2 min)

**Simular token inválido:**

```javascript
// 1. Invalidar token manualmente
localStorage.setItem('auth_access_token', 'token_invalido_xyz123');

// 2. Aguardar 60 segundos OU navegar para outra página
location.reload();

// 3. VERIFICAR notificação vermelha "Sessão Expirada"
```

**VERIFICAR:**
- ✅ Notificação vermelha aparece
- ✅ Título: "Sessão Expirada"
- ✅ Mensagem: "Sua sessão expirou... faça login novamente"
- ✅ **NÃO fecha automaticamente** (precisa clicar)
- ✅ Clicar redireciona para login

**✅ PASSOU se:**
- Notificação de erro exibida
- Não fecha automaticamente
- Redirecionamento funciona

---

### **TESTE 7: Idiomas (pt-BR e en-US)** ⭐ (2 min)

```javascript
// 1. Verificar idioma atual
ErrorMessages.getLanguage(); // 'pt-BR' ou 'en-US'

// 2. Testar em português
ErrorMessages.setLanguage('pt-BR');
NotificationBridge.showError('invalid_token');
// VERIFICAR: "Token Inválido" / "Sua sessão expirou..."

// 3. Aguardar fechar, depois mudar para inglês
ErrorMessages.setLanguage('en-US');
NotificationBridge.showError('invalid_token');
// VERIFICAR: "Invalid Token" / "Your session has expired..."

// 4. Voltar para português
ErrorMessages.setLanguage('pt-BR');
```

**✅ PASSOU se:**
- pt-BR: Textos em português
- en-US: Textos em inglês
- Mudança instantânea

---

### **TESTE 8: Responsividade Mobile** ⭐ (3 min)

1. ✅ Abrir DevTools (F12)
2. ✅ Ativar modo responsivo (Ctrl+Shift+M no Chrome)
3. ✅ Selecionar dispositivo: **iPhone SE (375x667)**
4. ✅ Fazer login
5. ✅ **VERIFICAR:** Notificação se adapta à largura
6. ✅ Abrir LogoutModal
7. ✅ **VERIFICAR:** Modal responsivo
8. ✅ Testar botões (touch-friendly)

**Resoluções para testar:**
- 375x667 (iPhone SE) - MÍNIMO
- 414x896 (iPhone 11 Pro Max)
- 360x740 (Samsung Galaxy S8+)

**✅ PASSOU se:**
- Tudo visível e funcional em 375px
- Layout não quebra
- Botões clicáveis (touch)
- Sem scroll horizontal

---

## 📊 Checklist Rápido de Validação

Após executar os 8 testes acima, marcar:

- [ ] **CT-1:** Login + Notificação ✅
- [ ] **CT-2:** Logout Local + Notificação ✅
- [ ] **CT-3:** Logout Federado ✅
- [ ] **CT-4:** Navegação por Teclado (Tab, Enter, ESC) ✅
- [ ] **CT-5:** Múltiplas Notificações (máx 5) ✅
- [ ] **CT-6:** Sessão Expirada (erro vermelho) ✅
- [ ] **CT-7:** Idiomas (pt-BR e en-US) ✅
- [ ] **CT-8:** Responsividade Mobile (375px) ✅

---

## 🐛 Se Encontrar Problemas

### Problema 1: Notificações não aparecem

**Solução:**
```javascript
// Verificar se NotificationBridge carregou
console.log(typeof NotificationBridge); // deve ser 'object'

// Testar manualmente
NotificationBridge.showSuccess('login_success');

// Se não funcionar, verificar ordem de scripts em restrita.html
// Ordem correta:
// 1. notification-manager.js
// 2. error-messages.js
// 3. notification-bridge.js
// 4. session-manager.js
```

### Problema 2: LogoutModal não abre

**Solução:**
```javascript
// Verificar se LogoutModal carregou
console.log(typeof LogoutModal); // deve ser 'object'

// Testar manualmente
LogoutModal.show('google');

// Verificar ID do botão
document.getElementById('logoutButton'); // deve retornar <button>
```

### Problema 3: Erros de CORS

**Solução:**
- Verificar backend rodando em `localhost:5051`
- Verificar configuração de CORS no `app.py`
- Verificar URL no `session-manager.js` (linha 16-18)

### Problema 4: Token não salvo

**Solução:**
```javascript
// Verificar callback
// Deve ter code na URL: ?code=xxxxx

// Verificar localStorage
localStorage.getItem('auth_access_token'); // deve ter valor

// Se null, verificar endpoint /oauth/google/token no backend
```

---

## ✅ Resultado Final

**Se todos os 8 testes passarem:**
✅ **Fase 2 - Item 5: Sistema de Feedback Visual - VALIDADO!**

**Próximas ações:**
1. Marcar Fase 2 como 100% completa
2. Atualizar README com funcionalidades
3. Criar release tag (v2.0.0-fase-2)
4. (Opcional) Deploy para produção

---

## 📝 Comandos Úteis para Testes

```javascript
// === VERIFICAÇÃO DE ESTADO ===
SessionManager.isAuthenticated();
SessionManager.getUserInfo();
localStorage.getItem('auth_provider');
ErrorMessages.getLanguage();

// === TESTAR NOTIFICAÇÕES ===
NotificationBridge.showSuccess('login_success');
NotificationBridge.showError('invalid_token');
NotificationBridge.showWarning('rate_limit_exceeded');
NotificationBridge.showInfo('session_refreshed');
NotificationBridge.dismissAll();

// === TESTAR MODAL ===
LogoutModal.show('google');
LogoutModal.close();

// === LIMPAR TUDO ===
localStorage.clear();
sessionStorage.clear();
location.reload();

// === DEBUG ===
console.table({
  autenticado: SessionManager.isAuthenticated(),
  provider: localStorage.getItem('auth_provider'),
  token: localStorage.getItem('auth_access_token')?.substring(0, 20) + '...',
  idioma: ErrorMessages.getLanguage()
});
```

---

## 🎯 Tempo Estimado

- **Testes Críticos (8 testes):** ~25 minutos
- **Testes Completos (18 testes):** ~90 minutos
- **Testes + Correções:** ~2-3 horas

---

## 📞 Suporte

Se encontrar dificuldades:
1. Verificar console do navegador (F12)
2. Verificar logs do backend (`/secure/admin-logs.html`)
3. Consultar `GUIA-INTEGRACAO-NOTIFICACOES.md`
4. Consultar `PLANO-TESTES-E2E.md` (testes detalhados)

---

**Boa sorte com os testes!** 🚀

Execute os 8 testes acima e reporte os resultados.
