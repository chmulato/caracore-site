# Correção do Erro PKCE - code_verifier não corresponde ao code_challenge

## Problema Identificado

O erro ocorre quando o usuário tenta fazer login com Microsoft OAuth:

```
AADSTS70000: The provided 'code_verifier' input value does not match the original 'code_challenge.'
```

### Causa Raiz

O `code_verifier` recuperado no callback não corresponde ao `code_challenge` usado na autorização. Isso pode acontecer porque:

1. **Múltiplas tentativas de login**: O `code_verifier` está sendo recuperado de uma tentativa anterior
2. **Estado OIDC não preservado**: O estado OIDC criado pelo `oidc-client-ts` não está sendo preservado corretamente
3. **Busca em fontes incorretas**: O código estava buscando o `code_verifier` em múltiplas fontes sem priorizar o estado correto

### Fluxo do Erro

```
1. Frontend → Microsoft: Autorização com code_challenge (gerado pelo oidc-client-ts)
2. Microsoft → Frontend: Código de autorização
3. Frontend → Backend: Envia código + code_verifier (ERRADO - não corresponde ao code_challenge)
4. Backend → Microsoft: Tenta trocar código usando code_verifier incorreto
5. Microsoft → Backend: ERRO 400 - code_verifier não corresponde ao code_challenge
```

## Solução Implementada

### 1. Priorização da Recuperação do code_verifier

Modificado `secure/js/oauth-callback-auto-fix.js` para:

1. **PRIORIDADE 1**: Buscar o `code_verifier` do estado OIDC usando o `state` do callback
   - Formato: `oidc.${state}` no sessionStorage ou localStorage
   - Isso garante que o `code_verifier` corresponde ao `code_challenge` usado na autorização

2. **PRIORIDADE 2**: Fallback para chaves específicas do provider
   - Formato: `${provider}_pkce_verifier`

3. **PRIORIDADE 3**: Fallback para chaves genéricas
   - Formato: `oidc.pkce.code_verifier`

4. **PRIORIDADE 4**: Busca em estados OIDC alternativos (apenas se o state corresponder)

### 2. Preservação do Estado OIDC Original

Modificado a função `restoreOAuthState` para:

- **Preservar o estado original**: Antes de criar um novo estado, tenta recuperar o estado original do `oidc-client-ts`
- **Preservar o code_verifier**: Se o estado original existir, preserva o `code_verifier` original
- **Não gerar code_verifier aleatório**: Se não encontrar o `code_verifier`, não gera um novo (deixa o `oidc-client-ts` fazer isso)

### 3. Logs Melhorados

Adicionados logs detalhados para rastrear:
- De onde o `code_verifier` foi recuperado
- Se o estado OIDC foi encontrado e preservado
- Qual fonte foi usada para recuperar o `code_verifier`

## Código Modificado

### Antes (Problema)

```javascript
// Buscava code_verifier em múltiplas fontes sem priorizar o state
codeVerifier = sessionStorage.getItem(`${provider}_pkce_verifier`) || 
               localStorage.getItem(`${provider}_pkce_verifier`);

if (!codeVerifier && params.state) {
    const oidcState = sessionStorage.getItem(`oidc.${params.state}`);
    // ...
}
```

### Depois (Solução)

```javascript
// PRIORIDADE 1: Buscar do estado OIDC usando o state do callback
if (params.state) {
    const oidcState = sessionStorage.getItem(`oidc.${params.state}`);
    if (oidcState) {
        const stateData = JSON.parse(oidcState);
        if (stateData.code_verifier) {
            codeVerifier = stateData.code_verifier;
            console.log('✅ code_verifier encontrado no estado OIDC (state match)');
        }
    }
}

// PRIORIDADE 2: Fallback para chaves específicas
if (!codeVerifier) {
    codeVerifier = sessionStorage.getItem(`${provider}_pkce_verifier`) || 
                   localStorage.getItem(`${provider}_pkce_verifier`);
}
```

## Teste

Após a correção, testar com:
1. Conta pessoal Microsoft (hotmail.com, outlook.com)
2. Verificar os logs do console para confirmar que o `code_verifier` foi recuperado do estado OIDC correto

### Logs Esperados (Sucesso)

```
✅ code_verifier encontrado no estado OIDC (state match)
✅ Tenant extraído da authority: consumers
✅ Tenant incluído no request: consumers
📤 Enviando requisição para backend: {hasCode: true, hasCodeVerifier: true, ...}
```

### Logs Esperados (Erro - se ainda ocorrer)

```
⚠️ code_verifier não encontrado no estado. O oidc-client-ts precisará criar um novo.
⚠️ code_verifier não encontrado. Tentando sem PKCE...
```

## Próximos Passos

Se o problema persistir:

1. **Verificar se o oidc-client-ts está armazenando o estado corretamente**
   - Verificar se `oidc.${state}` existe no sessionStorage após a autorização

2. **Limpar estados antigos**
   - Limpar sessionStorage antes de fazer login novamente
   - Verificar se há múltiplos estados OIDC armazenados

3. **Verificar se há timeout na inicialização**
   - O log mostra "Timeout na inicialização do OIDCAuth (5s)"
   - Isso pode impedir que o estado seja recuperado corretamente

## Referências

- [OAuth 2.0 PKCE](https://oauth.net/2/pkce/)
- [Microsoft Identity Platform - PKCE](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code)
- [oidc-client-ts Documentation](https://github.com/authts/oidc-client-ts)

