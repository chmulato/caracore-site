# Correção de Exceções - Autenticação Microsoft

## 📋 Resumo

Correções implementadas para tratar exceções encontradas durante autenticação Microsoft, especialmente para o usuário `ale.mulato@hotmail.com` em sessões diferentes do Windows.

---

## 🐛 Problemas Identificados

### 1. ❌ Erro de DateTime no Backend

**Erro:**
```
ERROR:token_storage:Erro ao verificar expiração: can't compare offset-naive and offset-aware datetimes
```

**Causa:**
- `date_parser.parse()` retorna datetime com timezone (offset-aware)
- `datetime.utcnow()` retorna datetime sem timezone (offset-naive)
- Comparação direta causa erro

**Impacto:**
- Sessões não eram validadas corretamente
- Erro 401 ao tentar usar `/auth/session/refresh`
- Usuários eram deslogados imediatamente após login

---

### 2. ⚠️ Erro AADSTS70000 - Escopos Não Autorizados

**Erro:**
```
AADSTS70000: The request was denied because one or more scopes requested are unauthorized or expired
```

**Causa:**
- Usuário não concedeu todas as permissões necessárias
- Permissões expiradas ou revogadas
- Usuário novo que precisa ser registrado

**Impacto:**
- Erro 400 no `/oauth/microsoft/token`
- Frontend criava "sessão mínima" (fake tokens)
- Usuário não conseguia autenticar corretamente

---

### 3. ⚠️ Timeout na Inicialização do OIDCAuth

**Erro:**
```
⚠️ Timeout na inicialização do OIDCAuth (usando fallback): Timeout na inicialização do OIDCAuth (10s)
```

**Causa:**
- OIDCAuth demora mais de 10s para inicializar
- Pode ser problema de rede ou carregamento de scripts

**Impacto:**
- Fallback para processamento alternativo
- Funcional, mas não ideal

---

### 4. ⚠️ Erro 401 no `/auth/session/refresh`

**Erro:**
```
POST /auth/session/refresh 401 (Unauthorized)
WARNING: Erro de validação ao renovar sessão: Sessão não encontrada ou expirada
```

**Causa:**
- Sessão ainda não persistida no backend
- Erro de datetime (corrigido)
- Race condition entre criação e refresh

**Impacto:**
- Tokens não eram obtidos do session_id
- Fallback para sessão mínima

---

## ✅ Correções Implementadas

### 1. ✅ Correção de DateTime no Backend

**Arquivo:** `backend/token_storage.py`

**Mudanças:**
```python
# ANTES
expires_at = date_parser.parse(session_data["expires_at"])
if datetime.utcnow() > expires_at:  # ❌ Erro: offset-naive vs offset-aware
    ...

# DEPOIS
expires_at = date_parser.parse(session_data["expires_at"])
now = datetime.utcnow().replace(tzinfo=timezone.utc)  # ✅ Offset-aware
if expires_at.tzinfo is None:
    expires_at = expires_at.replace(tzinfo=timezone.utc)  # ✅ Garantir timezone

if now > expires_at:  # ✅ Comparação segura
    ...
```

**Locais corrigidos:**
- `get_token()` - Verificação de expiração
- `cleanup_expired()` - Limpeza de sessões expiradas

**Benefícios:**
- ✅ Comparação de datetime funciona corretamente
- ✅ Sessões são validadas sem erros
- ✅ `/auth/session/refresh` funciona corretamente

---

### 2. ✅ Tratamento de Erro AADSTS70000

**Arquivo:** `secure/js/oidc-callback-microsoft.js`

**Mudanças:**
```javascript
// Detectar erro de escopos
if (isScopeError) {
    console.warn('⚠️ Erro de escopos não autorizados (AADSTS70000)...');
    
    // Tentar obter email de outras fontes
    const emailFromStorage = localStorage.getItem('user_email') || 
                            localStorage.getItem('auth_user_email') ||
                            sessionStorage.getItem('cara_core_user_email');
    
    if (emailFromStorage) {
        // Redirecionar para primeiro acesso
        setTimeout(() => {
            window.location.href = `/secure/first-access.html?email=${encodeURIComponent(emailFromStorage)}&provider=microsoft&error=scope_unauthorized`;
        }, 2000);
        return null; // Parar processamento
    }
}
```

**Benefícios:**
- ✅ Usuário é redirecionado para primeiro acesso
- ✅ Email é preservado na URL
- ✅ Erro específico é passado como parâmetro
- ✅ Usuário pode reaplicar permissões

---

### 3. ✅ Melhoria no Tratamento de Erro 401

**Arquivo:** `secure/js/oidc-callback-microsoft.js`

**Mudanças:**
```javascript
// Se for 401, pode ser que a sessão ainda não foi persistida
if (response.status === 401) {
    console.warn('⚠️ Sessão não encontrada ou ainda não persistida (401)...');
    
    // Se o erro mencionar datetime, pode ser o bug corrigido no backend
    if (errorMessage.includes('datetime') || errorMessage.includes('expiração')) {
        console.warn('⚠️ Possível erro de datetime no backend. Aguardando 2s e tentando novamente...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Retry uma vez
        const retryResponse = await fetch(...);
        if (retryResponse.ok) {
            // Tokens obtidos após retry
            return tokens;
        }
    }
}
```

**Benefícios:**
- ✅ Retry automático para erros de datetime
- ✅ Aguarda persistência da sessão
- ✅ Melhor tratamento de race conditions
- ✅ Logs mais detalhados

---

## 📊 Fluxo Corrigido

### Fluxo de Autenticação Microsoft

1. **Login Iniciado**
   - Usuário clica em "Login com Microsoft"
   - Frontend redireciona para Microsoft

2. **Callback Recebido**
   - Frontend recebe código de autorização
   - Tenta trocar código por tokens

3. **Tratamento de Erros**

   **Cenário A: Sucesso (200)**
   - Tokens obtidos com sucesso
   - Sessão criada no backend
   - Usuário autenticado

   **Cenário B: Erro 400 - AADSTS70000**
   - Detecta erro de escopos
   - Obtém email de storage
   - Redireciona para primeiro acesso
   - Usuário pode reaplicar permissões

   **Cenário C: Erro 400 - Outros**
   - Tenta obter tokens de outras fontes
   - Se usuário autorizado, cria sessão mínima
   - Logs detalhados para diagnóstico

4. **Validação de Sessão**
   - Backend valida expiração corretamente (datetime fix)
   - Frontend tenta obter tokens do session_id
   - Se 401, aguarda e retry (datetime fix)

---

## 🔍 Logs Melhorados

### Backend
```python
# Logs mais detalhados com exc_info
logger.error(f"Erro ao verificar expiração: {e}", exc_info=True)
logger.warning(f"Erro ao parsear expires_at para {session_id}: {e}")
```

### Frontend
```javascript
// Logs mais informativos
console.warn('⚠️ [Microsoft] Sessão não encontrada ou ainda não persistida (401):', {
    sessionId: sessionId,
    error: errorMessage,
    suggestion: 'A sessão pode estar sendo criada ou há problema de validação no backend...',
    details: errorData
});
```

---

## ✅ Testes Recomendados

1. **Teste de DateTime**
   - Login com Microsoft
   - Verificar que sessão é validada corretamente
   - Verificar que `/auth/session/refresh` funciona

2. **Teste de AADSTS70000**
   - Simular erro de escopos
   - Verificar redirecionamento para primeiro acesso
   - Verificar que email é preservado

3. **Teste de Race Condition**
   - Login rápido
   - Verificar que retry funciona
   - Verificar que sessão é persistida

4. **Teste de Múltiplas Sessões**
   - Login em diferentes navegadores/dispositivos
   - Verificar que sessões são gerenciadas corretamente
   - Verificar que limite de sessões funciona

---

## 📚 Referências

- [Backend - Token Storage](./backend/token_storage.py)
- [Frontend - OIDC Callback Microsoft](./secure/js/oidc-callback-microsoft.js)
- [Documentação - Tokens Microsoft OIDC](./TOKENS_MICROSOFT_OIDC.md)
- [Documentação - Comparação Refresh Token](./COMPARACAO_REFRESH_TOKEN_GOOGLE_MICROSOFT.md)

---

## 🎯 Próximos Passos (Opcional)

1. **Monitoramento**
   - Adicionar métricas para erros AADSTS70000
   - Alertar quando muitos usuários têm esse erro

2. **Melhorias**
   - Reduzir timeout do OIDCAuth se possível
   - Adicionar mais retries para erros temporários
   - Melhorar mensagens de erro para usuários

3. **Documentação**
   - Documentar todos os códigos de erro Microsoft
   - Criar guia de troubleshooting

