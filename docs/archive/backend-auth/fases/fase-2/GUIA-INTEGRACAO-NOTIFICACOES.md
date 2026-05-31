# Guia de Integração - Sistema de Notificações e LogoutModal

## 📦 Componentes Implementados (Fase 2)

### Item 4: Logout Seguro

- **js/logout-modal.js** (395 linhas) - Modal UI para logout local/federado
- **js/session-manager.js** (modificado) - Funções `logoutLocal()` e `logoutFederated()`

### Item 5: Sistema de Feedback Visual

- **secure/js/notification-manager.js** (580 linhas) - Sistema de toasts
- **secure/js/error-messages.js** (450 linhas) - Dicionário de mensagens pt-BR/en-US
- **secure/js/notification-bridge.js** (265 linhas) - Bridge de integração

---

## Ordem de Carregamento dos Scripts

### Para páginas protegidas em `/secure/`

```html
<!-- 1. Sistema de Notificações (PRIMEIRO) -->
<script src="/secure/js/notification-manager.js"></script>
<script src="/secure/js/error-messages.js"></script>
<script src="/secure/js/notification-bridge.js"></script>

<!-- 2. Session Manager (SEGUNDO - depende de notificações) -->
<script src="/js/session-manager.js"></script>

<!-- 3. Logout Modal (TERCEIRO - depende de SessionManager) -->
<script src="/js/logout-modal.js"></script>

<!-- 4. Scripts específicos da página (ÚLTIMO) -->
<script src="/secure/js/sua-pagina.js"></script>
```

** IMPORTANTE:**

- Notificações devem carregar ANTES do SessionManager
- LogoutModal deve carregar DEPOIS do SessionManager
- Ordem correta garante integração automática

---

## Integração do LogoutModal em Páginas

### Passo 1: Converter link/botão de logout

**Antes (link estático):**

```html
<a class="btn btn-primary" href="../secure/logout.html" id="logoutButton">
 Sair
</a>
```

**Depois (botão com modal):**

```html
<button class="btn btn-primary" type="button" id="logoutButton">
 Sair
</button>
```

### Passo 2: Adicionar script de configuração

```javascript
<script>
 (function() {
 'use strict';
 
 const logoutBtn = document.getElementById('logoutButton');
 const provider = localStorage.getItem('auth_provider');
 
 if (logoutBtn && typeof LogoutModal !== 'undefined') {
 logoutBtn.addEventListener('click', (e) => {
 e.preventDefault();
 LogoutModal.show(provider);
 });
 console.log('LogoutModal configurado');
 } else if (logoutBtn && typeof SessionManager !== 'undefined') {
 // Fallback
 logoutBtn.addEventListener('click', async (e) => {
 e.preventDefault();
 await SessionManager.logout();
 });
 console.warn('LogoutModal não encontrado, usando logout padrão');
 }
 })();
</script>
```

---

## Páginas Já Integradas

### secure/restrita.html

- Sistema de notificações carregado
- LogoutModal carregado
- Botão de logout configurado
- Fallback implementado

### secure/admin-logs.html

- Sistema de notificações carregado
- LogoutModal carregado
- Botão de logout adicionado no navbar
- Script de configuração implementado

---

## Notificações Automáticas Implementadas

O SessionManager agora exibe notificações automaticamente nos seguintes eventos:

### Eventos de Sucesso

- **Login bem-sucedido** - `loginSuccess()`
- **Logout completo** - `logoutSuccess()`
- **Sessão renovada** - `sessionRefreshed()` (silencioso)

### Eventos de Erro

- **Sessão expirada** - `sessionExpired()`
- **Timeout de inatividade** - `inactivityTimeout(5)` (avisa 5s antes)
- **Falha no refresh** - `showError('refresh_failed')`
- **Erro de rede** - `showError('network_error')`
- **Logout parcial** - `showWarning('logout_partial')`

### Uso Manual (em scripts customizados)

```javascript
// Exibir notificação de sucesso
NotificationBridge.showSuccess('login_success');

// Exibir notificação de erro
NotificationBridge.showError('invalid_token');

// Exibir notificação customizada
NotificationBridge.showCustom('info', 'Título', 'Mensagem', {
 duration: 5000,
 autoDismiss: true
});

// Processar erro de API automaticamente
fetch('/api/endpoint')
 .catch(error => NotificationBridge.handleApiError(error));
```

---

## 🌍 Suporte a Idiomas

### Idiomas Suportados

- **pt-BR** (padrão) - Português do Brasil
- **en-US** - English (United States)

### Auto-detecção

O sistema detecta automaticamente o idioma do navegador e configura as mensagens.

### Configuração Manual

```javascript
// Alterar idioma
ErrorMessages.setLanguage('en-US');

// Verificar idioma atual
console.log(ErrorMessages.getLanguage());

// Auto-detectar novamente
ErrorMessages.autoDetectLanguage();
```

---

## Customização de Notificações

### Posição do Container

```javascript
// Alterar posição (padrão: top-right)
NotificationManager.setPosition('top-center');

// Opções disponíveis:
// - top-right
// - top-left
// - bottom-right
// - bottom-left
// - top-center
// - bottom-center
```

### Duração Customizada

```javascript
NotificationBridge.showSuccess('consent_registered', {
 duration: 7000, // 7 segundos
 autoDismiss: true
});

// Notificação que não fecha automaticamente
NotificationBridge.showError('session_expired', {
 autoDismiss: false,
 onClick: () => {
 SessionManager.redirectToLogin();
 }
});
```

---

## Testando a Integração

### 1. Teste de Notificações no Console

```javascript
// Abrir console do navegador (F12) e executar:

// Teste 1: Notificação de sucesso
NotificationBridge.showSuccess('login_success');

// Teste 2: Notificação de erro
NotificationBridge.showError('invalid_token');

// Teste 3: Notificação de aviso
NotificationBridge.showWarning('rate_limit_exceeded');

// Teste 4: Notificação de info
NotificationBridge.showInfo('session_refreshed');

// Teste 5: Limpar todas
NotificationBridge.dismissAll();
```

### 2. Teste do LogoutModal

1.Fazer login em uma página protegida
2.Clicar no botão "Sair" / "Encerrar sessão"
3.Verificar se o modal aparece com 2 opções:

- "Sair deste site" (logout local)
- "Sair de todas as contas" (logout federado)

4.Testar ambas as opções
5.Verificar notificações de logout

### 3. Teste de Eventos Automáticos

1. **Login**: Fazer login e verificar notificação de sucesso
2. **Inatividade**: Aguardar 1 hora sem atividade (ou reduzir `SESSION_TIMEOUT` no SessionManager)
3. **Refresh**: Token será renovado automaticamente 5min antes de expirar
4. **Logout**: Clicar em logout e verificar notificação

---

## Próximas Páginas a Integrar

### Páginas ainda sem integração:

- secure/index.html (página inicial de login)
- secure/callback.html (callback OAuth)
- secure/consent.html (já tem session-manager, adicionar notificações)
- secure/logout.html (pode ser substituída pelo modal)

### Template de integração rápida:

```html
<!-- Adicionar antes de </body> -->

<!-- Sistema de Notificações -->
<script src="/secure/js/notification-manager.js"></script>
<script src="/secure/js/error-messages.js"></script>
<script src="/secure/js/notification-bridge.js"></script>

<!-- Session Manager -->
<script src="/js/session-manager.js"></script>

<!-- Logout Modal -->
<script src="/js/logout-modal.js"></script>

<!-- Configuração do botão de logout -->
<script>
 const btn = document.getElementById('logoutButton');
 if (btn) {
 btn.addEventListener('click', (e) => {
 e.preventDefault();
 LogoutModal.show(localStorage.getItem('auth_provider'));
 });
 }
</script>
```

---

## 🐛 Troubleshooting

### Notificações não aparecem

- Verificar se `notification-manager.js` carregou ANTES dos outros scripts
- Abrir console e verificar erros JavaScript
- Testar manualmente: `NotificationBridge.showSuccess('login_success')`

### LogoutModal não abre

- Verificar se `logout-modal.js` carregou DEPOIS do `session-manager.js`
- Verificar se botão tem ID correto (`logoutButton`)
- Testar manualmente: `LogoutModal.show('google')`

### SessionManager não exibe notificações

- Verificar ordem de carregamento (notificações ANTES do SessionManager)
- Verificar console: `typeof NotificationBridge` deve retornar `'object'`
- SessionManager funciona mesmo sem NotificationBridge (fallback)

### Mensagens em inglês quando deveria ser português

- Verificar idioma do navegador
- Forçar idioma: `ErrorMessages.setLanguage('pt-BR')`

---

## Status de Implementação

| Componente | Status | Linhas | Observações |
|-----------|--------|--------|-------------|
| notification-manager.js | 100% | 580 | Sistema de toasts completo |
| error-messages.js | 100% | 450 | 30+ códigos mapeados |
| notification-bridge.js | 100% | 265 | API unificada |
| session-manager.js | 100% | +83 | 8 pontos de integração |
| logout-modal.js | 100% | 395 | Modal acessível |
| restrita.html | 100% | - | Integrado |
| admin-logs.html | 100% | - | Integrado |

---

## Checklist de Integração

Para integrar em uma nova página protegida:

- [ ] Adicionar scripts de notificação (3 arquivos)
- [ ] Adicionar session-manager.js
- [ ] Adicionar logout-modal.js
- [ ] Converter link de logout em botão
- [ ] Adicionar script de configuração do botão
- [ ] Testar notificações no console
- [ ] Testar LogoutModal (local e federado)
- [ ] Testar em Chrome e Firefox
- [ ] Validar acessibilidade (teclado, ESC)

---

**Versão:** 1.0 
**Data:** 30/10/2025 
**Fase:** 2 - Item 5 (Sistema de Feedback Visual) 
**Commit:** 8c35305 (SessionManager) + próximo (integração páginas)
