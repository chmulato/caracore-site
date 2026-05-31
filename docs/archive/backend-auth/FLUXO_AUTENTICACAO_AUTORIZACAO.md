# Fluxo de Autenticação e Autorização - Área 51

## Cenário: Usuário já autenticado e autorizado acessa o link da Área 51

### Resumo do Fluxo

Quando um usuário **já está autenticado** (sessão OIDC ativa) e **está na lista de usuários autorizados**, o fluxo é o seguinte:

```text
/secure/index.html → Verificação de Autenticação → Verificação de Autorização → /secure/restrita.html
```

---

## Passo a Passo Detalhado

### 1. **Acesso Inicial** (`/secure/index.html`)

**Arquivo:** `secure/index.html`  
**Script principal:** `secure/js/main.js`

- Usuário acessa o link da Área 51 (`/secure/index.html`)
- A página carrega e executa `main.js`

### 2. **Verificação de Autenticação** (`main.js` - linha 30)

**Código:**

```javascript
const isAuthenticated = await window.OIDCAuth.isAuthenticated();
```

**O que acontece:**

- Verifica se há uma sessão OIDC ativa (token válido no `sessionStorage` ou `localStorage`)
- Se **NÃO** estiver autenticado:
  - Mostra a tela de login com botões Google/Microsoft
  - Aguarda o usuário clicar em um dos botões

### 3. **Usuário Já Autenticado** (`main.js` - linha 32-65)

Se `isAuthenticated === true`:

**3.1. Obter informações do usuário:**

```javascript
const user = await window.OIDCAuth.getUser();
const userEmail = user?.profile?.email;
const provider = user?.provider;
```

**3.2. Verificar autorização:**

```javascript
const isAuthorized = await window.authChecker.checkAndRedirect(userEmail, provider, false);
```

**Arquivo:** `secure/js/authorization-check.js`  
**Método:** `checkAndRedirect()` (linha 158)

**O que acontece:**

- Faz uma requisição para `/api/check-authorization` no backend
- Backend verifica se o email está em `authorized_users.json`
- Backend verifica se o status do usuário é `active`
- Retorna `{ authorized: true/false, role: 'user'/'admin'/'super_admin' }`

**3.3. Se autorizado:**

```javascript
if (isAuthorized) {
  await showUserInfo();  // Mostra informações do usuário na tela
  window.AuthUIFeedback.updateState('success');
  setTimeout(() => {
    window.location.href = '/secure/restrita.html';  // ← REDIRECIONAMENTO FINAL
  }, 2000);  // Aguarda 2 segundos antes de redirecionar
}
```

**3.4. Se NÃO autorizado:**

- `checkAndRedirect()` já faz o redirecionamento automático para:
  - `/secure/access-denied.html` (se usuário não está na lista)
  - `/secure/first-access.html` (se é primeiro acesso - precisa solicitar aprovação)
  - `/secure/access-pending.html` (se solicitação está pendente)

### 4. **Página Final: Área Restrita** (`/secure/restrita.html`)

**Arquivo:** `secure/restrita.html`

**O que acontece:**

**4.1. Verificação adicional de autorização** (linha 218-285):

```javascript
document.addEventListener('DOMContentLoaded', async function() {
  const userEmail = localStorage.getItem('user_email') || 
                   localStorage.getItem('auth_user_email');
  const provider = localStorage.getItem('auth_provider') || 'google';
  
  if (userEmail) {
    const isAuthorized = await requireAuthorization({
      email: userEmail,
      provider: provider,
      showLoading: false,
      redirectOnFail: true
    });
    
    if (isAuthorized) {
      await loadUserInfo(userEmail, provider);  // Carrega e exibe dados do usuário
      // Mostra card de informações do usuário
      const userInfoCard = document.getElementById('userInfoCard');
      if (userInfoCard) {
        userInfoCard.classList.remove('d-none');
      }
    }
  }
});
```

**4.2. Exibição do conteúdo:**

- Mostra card com informações do usuário (nome, email, role)
- Exibe conteúdo protegido da Área 51
- Usuário pode navegar pela área restrita

---

## Fluxo Visual

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário acessa /secure/index.html                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. main.js verifica: OIDCAuth.isAuthenticated()             │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    [SIM]                   [NÃO]
         │                       │
         │                       └──► Mostra tela de login
         │                            (botões Google/Microsoft)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Obtém email e provider do usuário                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. authChecker.checkAndRedirect(email, provider)            │
│    → POST /api/check-authorization                          │
│    → Backend verifica authorized_users.json                 │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
   [AUTORIZADO]            [NÃO AUTORIZADO]
         │                       │
         │                       └──► Redireciona para:
         │                            - access-denied.html
         │                            - first-access.html
         │                            - access-pending.html
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. showUserInfo() - Exibe dados do usuário                  │
│    Aguarda 2 segundos                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. REDIRECIONAMENTO FINAL:                                  │
│    window.location.href = '/secure/restrita.html'           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. restrita.html carrega                                    │
│    - Verifica autorização novamente                         │
│    - Carrega informações do usuário                         │
│    - Exibe conteúdo protegido                               │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. USUÁRIO FICA NA PÁGINA restrita.html                     │
│    (Ponto final do fluxo)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Resposta Direta à Pergunta

**["Se o usuário foi autenticado e o mesmo estiver dentro da lista de usuário autorizado. Após entrar no link da Área 51 ele vai para onde até parar?"]**

### Resposta:

O usuário vai para **`/secure/restrita.html`** e **para lá**.

**Fluxo completo:**

1. Acessa `/secure/index.html`
2. Sistema detecta que já está autenticado
3. Verifica autorização (backend consulta `authorized_users.json`)
4. Se autorizado, aguarda 2 segundos mostrando informações do usuário
5. **Redireciona para `/secure/restrita.html`** ← **PONTO FINAL**
6. `restrita.html` faz uma verificação adicional de autorização
7. Exibe o conteúdo protegido
8. **Usuário permanece em `restrita.html`** (página final)

---

## Arquivos Envolvidos

### Frontend:

- `secure/index.html` - Página inicial de login
- `secure/js/main.js` - Lógica principal de autenticação
- `secure/js/authorization-check.js` - Verificação de autorização
- `secure/restrita.html` - Página final (área restrita)
- `secure/js/auth-standalone.js` - Gerenciamento OIDC

### Backend:

- `backend/app.py` - Endpoint `/api/check-authorization`
- `backend/authorization.py` - Lógica de verificação de autorização
- `backend/data/authorized_users.json` - Lista de usuários autorizados

---

## Observações Importantes

1. **Dupla verificação:** A autorização é verificada tanto em `index.html` quanto em `restrita.html` para garantir segurança.

2. **Cache de autorização:** O resultado da verificação pode ser cacheado por alguns minutos para melhor performance.

3. **Status do usuário:** Mesmo estando na lista, se o status for `inactive`, o acesso será negado.

4. **Timeout:** O redirecionamento para `restrita.html` acontece após 2 segundos para dar tempo de mostrar feedback visual ao usuário.

5. **Fallback:** Se houver qualquer erro no processo, o usuário é redirecionado para `access-denied.html`.

