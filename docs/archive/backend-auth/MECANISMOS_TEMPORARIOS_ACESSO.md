# Mecanismos Temporários que Modificam o Acesso na Página Restrita

## Resumo Executivo

Sim, existem **vários mecanismos temporários** que podem modificar o acesso na página restrita **rapidamente**. O mais importante é o **status do usuário** (`active`/`inactive`), que pode ser alterado instantaneamente por um administrador.

---

## 1. Status do Usuário (Mecanismo Principal) ⚡

### Como Funciona

O sistema verifica o campo `status` do usuário em `authorized_users.json`. Se o status for `inactive`, o acesso é **imediatamente negado**, mesmo que o usuário esteja autenticado e na lista.

### Localização do Código

**Frontend:** `secure/js/authorization-check.js` (linha 166-171)

```javascript
// Verificar se usuário está inativo (existe mas status = 'inactive')
if (result.inactive === true) {
    console.log('AuthorizationChecker: Usuário está inativo:', userEmail);
    this.handleInactiveUser(userEmail, provider);
    return false;  // ← ACESSO NEGADO IMEDIATAMENTE
}
```

**Backend:** `backend/authorization.py` (linha 353-354)

```python
for user in data['users']:
    if (user.get('email', '').lower() == email_lower and 
        user.get('status') == 'active'):  # ← Só permite se status = 'active'
        return True
```

**Backend API:** `backend/app.py` (linha 2121-2131)

```python
# Verificar se usuário existe mas está inativo
user_info = auth_manager.get_user_status(email)
user_status = user_info.get('status') if user_info else None
is_inactive = user_info is not None and user_status == 'inactive'

response_data = {
    "authorized": is_authorized,
    "inactive": is_inactive  # Flag para facilitar verificação no frontend
}
```

### Como Alterar Rapidamente

**Via Interface Admin:**

1. Acessar `/secure/admin-users.html`
2. Localizar o usuário na tabela
3. Clicar no botão de **Desabilitar** (ícone X)
4. Confirmação → Status muda para `inactive` **instantaneamente**

**Via API:**

```bash
PUT /api/admin/users/{email}
{
  "status": "inactive"
}
```

### Tempo de Efeito

- **Imediato** (próxima verificação de autorização)
- **Limitação:** Cache de 5 minutos pode atrasar o efeito (veja seção 2)

---

## 2. Cache de Autorização (Pode Atrasar Mudanças) ⏱️

### [Como Funciona]

O sistema mantém um **cache de 5 minutos** dos resultados de autorização no frontend para melhorar performance.

**Localização:** `secure/js/authorization-check.js` (linha 21-22)

```javascript
this.cache = new Map();
this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
```

### Impacto

- Se um usuário foi **desabilitado** (status → `inactive`), ele pode continuar acessando por até **5 minutos** se o resultado estiver em cache
- Após 5 minutos, a próxima verificação consultará o backend e detectará o status `inactive`

### Como Forçar Verificação Imediata

**No código:**

```javascript
// Forçar verificação ignorando cache
const result = await authChecker.checkAuthorization(email, provider, true);
//                                                                    ^^^^ forceCheck = true
```

**Via botão na interface:**

- Em `restrita.html`, há um botão de **refresh** que força nova verificação:

```javascript
refreshAuthBtn.addEventListener('click', async function() {
    // Forçar nova verificação (ignorar cache)
    const result = await window.authChecker.checkAuthorization(userEmail, provider, true);
});
```

### Limpar Cache Manualmente

```javascript
// Limpar todo o cache
authChecker.clearCache();
```

---

## 3. Tokens OAuth (Expiração Automática) 🔐

### [Como Funciona

Os tokens OAuth têm **expiração automática**. Quando expiram, o usuário precisa fazer login novamente.

**Localização:** `js/session-manager.js` (linha 28)

```javascript
SESSION_TIMEOUT: 3600,  // Timeout de sessão: 1 hora (segundos)
```

**Verificação:** `js/session-manager.js` (linha 54-59)

```javascript
// Verificar se token expirou
const now = Math.floor(Date.now() / 1000);
if (now >= parseInt(expiresAt)) {
    console.log('[SessionManager] Token expirado');
    return false;  // ← Sessão expirada
}
```

### [Tempo de Efeito]

- **1 hora** após o login (configurável)
- Após expirar, usuário é redirecionado para login

---

## 4. Sessões do Backend (Expiração)

### [Como Funciona]

O backend mantém sessões com refresh tokens que podem expirar.

**Localização:** `backend/session_manager.py` (linha 53-56)

```python
self.session_timeout_hours = (
    session_timeout_hours or
    int(os.getenv("SESSION_TIMEOUT_HOURS", "24"))  # Default: 24 horas
)
```

### [Tempo de Efeito]

- **24 horas** por padrão (configurável via variável de ambiente)
- Após expirar, sessão é removida e usuário precisa fazer login novamente

---

## 5. Verificação Periódica na Página Restrita 🔄

### [Como Funciona]

A página `restrita.html` faz verificações periódicas de autorização.

**Localização:** `secure/restrita.html` (linha 218-285)

### [Impacto]

- Se o status do usuário mudar para `inactive` enquanto ele está na página, a próxima verificação detectará e redirecionará
- Não há polling automático, mas verificações ocorrem em:
  - Carregamento da página
  - Clique no botão de refresh
  - Navegação entre páginas protegidas

---

## Comparação dos Mecanismos

| Mecanismo | Tempo de Efeito | Reversível | Requer Ação do Admin |
|-----------|----------------|------------|---------------------|
| **Status do usuário** | Imediato* | Sim | Sim (via admin-users.html) |
| **Cache de autorização** | Até 5 minutos | Automático | Não |
| **Token OAuth** | 1 hora | Automático | Não |
| **Sessão backend** | 24 horas | Automático | Não |

\* *Imediato após expiração do cache (máximo 5 minutos)*

---

## Como Desabilitar Acesso Rapidamente (Recomendado)

### Método 1: Via Interface Admin (Mais Rápido)

1. Acessar `/secure/admin-users.html`
2. Localizar usuário na tabela
3. Clicar no botão **Desabilitar** (ícone X)
4. Confirmar ação
5. **Efeito:** Status muda para `inactive` instantaneamente

### Método 2: Forçar Limpeza de Cache + Verificação

Se o usuário já está na página restrita e você quer que ele seja deslogado imediatamente:

1. Desabilitar usuário (método 1)
2. O usuário será deslogado na próxima verificação (máximo 5 minutos)
3. Para forçar imediatamente, o usuário precisa clicar no botão de refresh ou navegar para outra página

### Método 3: Remover Usuário da Lista

1. Acessar `/secure/admin-users.html`
2. Clicar em **Remover** (ícone de lixeira)
3. **Efeito:** Usuário é removido completamente da lista
4. Próxima verificação negará acesso imediatamente (após cache expirar)

---

## Limitações e Considerações

### 1. Cache de 5 Minutos

- **Problema:** Mudanças de status podem levar até 5 minutos para ter efeito
- **Solução:** Usar `forceCheck: true` nas verificações críticas

### 2. Usuário Já Autenticado

- Se o usuário já está na página `restrita.html` e você desabilita ele:
  - Ele continuará vendo a página até a próxima verificação
  - Ao tentar navegar ou recarregar, será redirecionado

### 3. Múltiplas Abas

- Se o usuário tem múltiplas abas abertas:
  - Cada aba tem seu próprio cache
  - Desabilitar o usuário afetará todas as abas na próxima verificação

---

## Recomendações

### Para Desabilitar Acesso Rapidamente:

1. ✅ **Use o botão "Desabilitar"** em `admin-users.html`
2. ✅ **Status muda instantaneamente** no backend
3. ⚠️ **Cache pode atrasar até 5 minutos** no frontend
4. ✅ **Próxima verificação** (navegação, refresh, reload) detectará mudança

### Para Forçar Efeito Imediato:

1. Desabilitar usuário via admin
2. Usuário precisa:
   - Recarregar a página (F5)
   - Clicar no botão de refresh
   - Navegar para outra página protegida

### Para Monitoramento:

- Verificar logs de auditoria em `/secure/admin-logs.html`
- Verificar tentativas de acesso negado
- Monitorar status de sessões ativas

---

## Código de Exemplo: Forçar Verificação Imediata

```javascript
// No console do navegador ou em código customizado
async function forceAuthCheck() {
    const userEmail = localStorage.getItem('auth_user_email');
    const provider = localStorage.getItem('auth_provider') || 'google';
    
    if (!userEmail) {
        console.error('Email não encontrado');
        return;
    }
    
    // Forçar verificação ignorando cache
    const result = await window.authChecker.checkAuthorization(userEmail, provider, true);
    
    if (!result.authorized || result.inactive) {
        console.log('Acesso negado, redirecionando...');
        window.location.href = '/secure/access-denied.html';
    } else {
        console.log('Acesso autorizado');
    }
}

// Executar
forceAuthCheck();
```

---

## Conclusão

**Sim, existe um mecanismo que pode modificar o acesso rapidamente:** o **status do usuário** (`active`/`inactive`).

- ✅ Pode ser alterado **instantaneamente** via interface admin
- ⚠️ Efeito pode ser atrasado por até **5 minutos** devido ao cache
- ✅ Próxima verificação de autorização detectará a mudança
- ✅ Usuário será redirecionado para `access-denied.html` se inativo

**O mecanismo mais eficaz para controle rápido de acesso é alterar o status do usuário para `inactive` via página de administração.**

