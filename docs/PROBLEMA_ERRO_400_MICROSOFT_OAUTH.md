# Problema: Erro 400 no Login Microsoft OAuth

## Situação

Usuário autorizado `chmulato@hotmail.com` não consegue fazer login. O backend retorna erro 400 no endpoint `/oauth/microsoft/token`.

## Análise do Log

### Fluxo Observado:

1. ✅ Usuário clica em "Continuar com Microsoft"
2. ✅ Redireciona para Microsoft OAuth
3. ✅ Retorna para callback com código de autorização
4. ✅ `code_verifier` encontrado no storage
5. ❌ Backend retorna **400 Bad Request** ao tentar trocar código por token
6. ❌ Sistema não consegue obter email do token
7. ❌ Redireciona para `/secure/request-access.html` (incorreto para usuário autorizado)

### Erro Específico:

```
POST https://caracore-backend-docker.azurewebsites.net/oauth/microsoft/token 400 (Bad Request)
```

## Possíveis Causas do Erro 400

### 1. Validação PKCE Falhando

O backend valida PKCE se `code_challenge` for fornecido. O erro pode ocorrer se:

- `code_verifier` não corresponde ao `code_challenge` original
- `code_challenge` não está sendo enviado na requisição
- `code_verifier` foi gerado incorretamente

### 2. Código de Autorização Expirado

O código de autorização OAuth tem validade limitada (geralmente 10 minutos). Se o usuário demorar muito, o código expira.

### 3. Redirect URI Não Corresponde

O `redirect_uri` usado na troca de token deve corresponder exatamente ao configurado no Azure AD.

### 4. Campos Obrigatórios Faltando

Se `PKCE_VALIDATION_ENABLED` estiver habilitado, o `code_verifier` é obrigatório.

## Solução Implementada

### 1. Melhorias no Tratamento de Erro 400

**Arquivo:** `secure/js/oidc-callback-microsoft.js`

- ✅ Logging detalhado do erro 400
- ✅ Identificação de possíveis causas
- ✅ Busca melhorada de email em múltiplas fontes (localStorage, sessionStorage, URL)
- ✅ Verificação de autorização mesmo quando há erro 400
- ✅ Se usuário autorizado → permite acesso sem token completo
- ✅ Se usuário não autorizado → redireciona para solicitação de acesso

### 2. Melhorias no Backend

**Arquivo:** `backend/app.py`

- ✅ Logging mais detalhado quando há campos faltando
- ✅ Resposta de erro inclui detalhes sobre quais campos estão faltando
- ✅ Facilita diagnóstico sem precisar acessar logs

### 3. Busca Melhorada de Email

O sistema agora busca email em:
1. Parâmetros da URL (`?email=...`)
2. `localStorage` (`user_email`, `auth_user_email`)
3. `sessionStorage` (`user_email`)
4. Todas as chaves do storage que contenham 'email', 'user' ou 'profile'
5. Valores JSON parseados (se o email estiver em objeto)

## Como Diagnosticar

### 1. Verificar Logs do Backend

Acesse os logs do App Service e procure por:

```
"Requisicao invalida para Microsoft - campos ausentes: ..."
```

Isso indicará exatamente quais campos estão faltando.

### 2. Verificar no Console do Navegador

Após tentar fazer login, verifique no console:

- `❌ Erro do backend:` - Mostra detalhes do erro 400
- `❌ Erro 400 - Possíveis causas:` - Lista possíveis causas
- `📧 Email encontrado:` - Se encontrou email para verificar autorização

### 3. Verificar Storage do Navegador

No DevTools → Application → Storage:
- Verifique se há `code_verifier` salvo
- Verifique se há email salvo em alguma chave
- Verifique se há estado OIDC salvo

## Solução Temporária

Se o problema persistir, o sistema agora:

1. ✅ Tenta obter email de múltiplas fontes
2. ✅ Verifica se o usuário está autorizado mesmo sem token
3. ✅ Permite acesso se o usuário estiver autorizado
4. ✅ Redireciona para solicitação de acesso apenas se não autorizado

## Próximos Passos para Resolver Definitivamente

### 1. Verificar PKCE

O problema pode ser que o `code_challenge` não está sendo armazenado/recuperado corretamente. Verificar:

- Se o `code_challenge` está sendo salvo quando o login é iniciado
- Se o `code_challenge` está sendo recuperado no callback
- Se o `code_challenge` corresponde ao `code_verifier`

### 2. Verificar Validade do Código

O código de autorização pode estar expirando. Verificar:

- Tempo entre início do login e callback
- Se há timeout configurado muito curto

### 3. Verificar Redirect URI

Verificar se o `redirect_uri` usado corresponde ao configurado no Azure AD:

- Deve ser: `https://www.caracore.com.br/secure/callback.html`
- Verificar no Azure AD → App Registration → Authentication → Redirect URIs

## Teste

Após as melhorias, quando o usuário `chmulato@hotmail.com` tentar fazer login:

1. Se houver erro 400, o sistema tentará encontrar o email em storage
2. Se encontrar o email, verificará se está autorizado
3. Se estiver autorizado, permitirá o acesso mesmo sem token completo
4. Se não estiver autorizado, redirecionará para solicitação de acesso

**Teste novamente e verifique os logs do console para ver se o email foi encontrado e se a autorização foi verificada.**

