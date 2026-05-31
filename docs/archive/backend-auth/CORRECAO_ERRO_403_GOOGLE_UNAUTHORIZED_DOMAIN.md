# Correção de Erro 403 - Google Unauthorized Domain

## 📋 Resumo

Correção do erro 403 (Forbidden) ao tentar fazer login com Google quando o domínio do email não está autorizado (ex: `gmail.com` quando apenas `caracore.com.br` é permitido).

---

## 🐛 Problema Identificado

### Erro no Backend
```
POST /oauth/google/token 403 (Forbidden)
ERROR: Falha ao validar ID token Google: unauthorized_domain - Domínio gmail.com não autorizado para login Google
```

### Comportamento Anterior (PROBLEMÁTICO)
1. Backend retorna 403 (domínio não autorizado)
2. Frontend detecta erro 403
3. Frontend extrai email da resposta de erro
4. Frontend verifica autorização (usuário está autorizado)
5. ❌ **Frontend redireciona para área restrita SEM tokens reais**
6. ❌ **`restrita-main.js` cria sessão mínima (fake tokens)**
7. ❌ **Usuário acessa com sessão fake**

---

## ✅ Correções Implementadas

### 1. ✅ Callback Google - Redirecionamento para Reautenticação

**Arquivo:** `secure/js/oidc-callback-google.js`

**Mudanças:**

#### Antes (PROBLEMÁTICO):
```javascript
if (authResult && authResult.authorized) {
    // Redirecionar para área restrita SEM tokens reais
    window.location.href = '/secure/restrita.html';
    return null;
}
```

#### Depois (CORRETO):
```javascript
if (authResult && authResult.authorized) {
    console.log('✅ Usuário autorizado, mas não autenticado corretamente (domínio não autorizado).');
    console.log('🔄 Redirecionando para reautenticação...');
    
    // Redirecionar para login com mensagem clara
    const errorMessage = encodeURIComponent('Seu domínio de email não está autorizado para login Google. Por favor, use uma conta @caracore.com.br ou faça login novamente.');
    const redirectUrl = `/secure/index.html?email=${encodeURIComponent(userEmail)}&provider=google&error=auth_failed&message=${errorMessage}&reason=unauthorized_domain`;
    
    setTimeout(() => {
        window.location.href = redirectUrl;
    }, 1500);
    return null;
}
```

**Locais Corrigidos:**
- Linha 540-553: Quando usuário autorizado via `authChecker`
- Linha 570-582: Quando usuário autorizado via `requireAuthorization`

---

### 2. ✅ Restrita Main - Remoção de Criação de Sessão Mínima

**Arquivo:** `secure/js/restrita-main.js`

**Mudanças:**

#### Antes (PROBLEMÁTICO):
```javascript
if (isMinimalSession) {
    // Criar sessão mínima para permitir acesso
    localStorage.setItem('auth_minimal_session', 'true');
    // ...
}
```

#### Depois (CORRETO):
```javascript
if (isMinimalSession) {
    console.log('Restrita: Usuário autorizado mas sem sessão válida.');
    console.log('🔄 Redirecionando para reautenticação...');
    
    // Redirecionar para login com mensagem clara
    const errorMessage = encodeURIComponent('Por favor, faça login novamente para acessar o sistema com segurança');
    const redirectUrl = `/secure/index.html?email=${encodeURIComponent(userEmail)}&provider=${provider || 'google'}&error=auth_failed&message=${errorMessage}&reason=no_valid_session`;
    
    setTimeout(() => {
        window.location.href = redirectUrl;
    }, 1500);
    return; // Parar processamento
}
```

**Locais Corrigidos:**
- Linha 65-81: Quando não há sessão válida
- Linha 129-137: Quando sessão expira
- Linha 172-187: Quando retry não encontra sessão
- Linha 326-329: Função de renovação automática

---

### 3. ✅ Melhorias nas Mensagens de Erro

**Arquivo:** `secure/js/main.js`

**Mudanças:**

```javascript
// Mensagens específicas por tipo de erro
if (errorReason === 'unauthorized_domain') {
    userMessage = errorMessage || 'Seu domínio de email não está autorizado para login. Por favor, use uma conta autorizada ou faça login novamente.';
} else if (errorReason === 'no_valid_session' || errorReason === 'session_expired') {
    userMessage = errorMessage || 'Sua sessão expirou. Por favor, faça login novamente.';
}
```

---

## 📊 Fluxo Corrigido

### Cenário: Usuário com Gmail.com Tenta Login

1. **Login Iniciado**
   - Usuário clica em "Login com Google"
   - Frontend redireciona para Google

2. **Callback Recebido**
   - Frontend recebe código de autorização
   - Tenta trocar código por tokens

3. **Backend Rejeita (403)**
   - Backend valida ID token
   - Detecta que domínio `gmail.com` não está autorizado
   - Retorna 403 com email na resposta

4. **Frontend Processa Erro**
   - Detecta erro 403 (unauthorized_domain)
   - Extrai email da resposta: `chmulato@gmail.com`
   - Verifica autorização: usuário está autorizado

5. **Ação Correta (NOVO)**
   - ✅ Redireciona para `/secure/index.html` com mensagem clara
   - ✅ Mensagem: "Seu domínio de email não está autorizado para login Google. Por favor, use uma conta @caracore.com.br ou faça login novamente."
   - ✅ Usuário vê mensagem e pode tentar novamente

6. **Ação Anterior (ANTIGO - PROBLEMÁTICO)**
   - ❌ Redirecionava para `/secure/restrita.html` sem tokens
   - ❌ `restrita-main.js` criava sessão mínima (fake tokens)
   - ❌ Usuário acessava com sessão fake

---

## 🔒 Impacto na Segurança

### Antes (PROBLEMÁTICO)
- ❌ Usuários com domínio não autorizado podiam acessar com sessão fake
- ❌ Sem auditoria adequada
- ❌ Viola princípios OAuth 2.1
- ❌ Backend rejeita, mas frontend permite acesso

### Depois (CORRETO)
- ✅ Usuários são redirecionados para reautenticação
- ✅ Mensagem clara sobre domínio não autorizado
- ✅ Conformidade com OAuth 2.1
- ✅ Backend e frontend alinhados

---

## 📈 Estatísticas de Mudanças

| Item | Antes | Depois |
|------|-------|--------|
| **Criação de Sessão Mínima (Google)** | 2 locais | 0 locais (removido) |
| **Criação de Sessão Mínima (Restrita)** | 4 locais | 0 locais (removido) |
| **Redirecionamento para Reautenticação** | 0 locais | 6 locais (adicionado) |
| **Mensagens de Erro Específicas** | 2 tipos | 4 tipos (adicionado) |

---

## ✅ Testes Recomendados

1. **Teste de Domínio Não Autorizado**
   - Login com `gmail.com` quando apenas `caracore.com.br` é permitido
   - Verificar que redireciona para `/secure/index.html`
   - Verificar que mensagem é exibida corretamente

2. **Teste de Sessão Expirada**
   - Aguardar expiração de sessão
   - Verificar que redireciona para reautenticação
   - Verificar que não cria sessão mínima

3. **Teste de Retry**
   - Simular retry sem sessão válida
   - Verificar que redireciona para reautenticação
   - Verificar que não cria sessão mínima

---

## 📚 Arquivos Modificados

1. ✅ `secure/js/oidc-callback-google.js`
   - Substituição de redirecionamento para área restrita por reautenticação (2 locais)
   - Mensagens específicas para erro de domínio não autorizado

2. ✅ `secure/js/restrita-main.js`
   - Remoção de criação de sessão mínima (4 locais)
   - Substituição por redirecionamento para reautenticação

3. ✅ `secure/js/main.js`
   - Mensagens específicas para `unauthorized_domain`
   - Mensagens específicas para `no_valid_session` e `session_expired`

---

## 🎯 Status Final

**Implementação:** ✅ **COMPLETA**

**Conformidade com Recomendação Principal:** ✅ **100%**

**Melhorias Implementadas:**
- ✅ Redirecionamento para reautenticação (substitui sessão mínima)
- ✅ Mensagens específicas por tipo de erro
- ✅ Tratamento correto de erro 403 (domínio não autorizado)
- ✅ Alinhamento entre backend e frontend

---

## 📝 Notas Importantes

### Sobre Domínios Autorizados

O backend está configurado para aceitar apenas `caracore.com.br` para Google:

```python
google_allowed_domains = ['caracore.com.br']
```

**Isso é intencional?**
- Se SIM: Correções estão corretas - usuários com `gmail.com` serão redirecionados
- Se NÃO: Precisa adicionar `gmail.com` à lista de domínios permitidos no backend

**Para permitir gmail.com:**
```bash
# Variável de ambiente
GOOGLE_ALLOWED_DOMAINS=caracore.com.br,gmail.com
```

---

## 🔄 Próximos Passos (Opcional)

1. **Decisão sobre Domínios**
   - Confirmar se `gmail.com` deve ser permitido
   - Se sim, atualizar `GOOGLE_ALLOWED_DOMAINS`

2. **Monitoramento**
   - Rastrear quantos usuários têm erro de domínio não autorizado
   - Ajustar mensagens baseado em feedback

3. **Documentação**
   - Documentar política de domínios autorizados
   - Criar guia para adicionar novos domínios

