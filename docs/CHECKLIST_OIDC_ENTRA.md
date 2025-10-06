# Checklist OIDC Microsoft Entra

Segue um checklist de diagnóstico passo a passo para os pontos críticos do OIDC no Microsoft Entra ID, diretamente no portal (inclui “onde clicar” e testes rápidos).

## 1. Fluxo certo (Authorization Code + PKCE) e tipo de aplicativo

### 1.1 Onde verificar no portal

- Entra ID ▸ **App registrations** ▸ *seu app* ▸ **Authentication**.
- Escolha a plataforma correta:
  - **Single-page application (SPA)** para registrar os Redirect URIs do front-end.
  - **Web** para registrar os Redirect URIs do backend/servidor.
- Evite habilitar *Implicit grant*; mantenha o fluxo **Authorization Code + PKCE**.

### 1.2 Teste rápido

- Monte uma URL `/authorize` v2.0 com `response_type=code` e `code_challenge` e confirme se chega um `code` no `redirect_uri` configurado.

## 2. Redirect URIs exatas (evitando AADSTS50011)

### 2.1 Onde verificar no portal

- Entra ID ▸ **App registrations** ▸ *seu app* ▸ **Authentication** ▸ **Redirect URIs**.
- Valide protocolo, host, porta, caminho e barra final para todos os ambientes (dev/homolog/prod).
- O `post_logout_redirect_uri` precisa constar na lista de Redirect URIs (não só no campo de front-channel).

### 2.2 Teste rápido

- Se ocorrer `AADSTS50011 ("redirect_uri mismatch")`, copie o *Application (client) ID* exibido no erro e ajuste o Redirect URI correspondente em **Authentication**.

## 3. Single-tenant vs. Multi-tenant e endpoint correto

### 3.1 Onde verificar no portal

- Entra ID ▸ **App registrations** ▸ *seu app* ▸ **Authentication** ▸ **Supported account types**: escolha **single-tenant** ou **multitenant** conforme o público alvo.
- Em código/configuração, use `authority=https://login.microsoftonline.com/{tenant}/v2.0` e substitua `{tenant}` por `common`, `organizations`, `consumers` ou pelo Tenant ID/domínio (single-tenant).

### 3.2 Teste rápido

- Acesse `https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration` e confira `issuer` e endpoints.
- Erro comum `AADSTS50194`: ocorre ao usar `/common` com app single-tenant. Ajuste para o tenant específico ou torne o app multitenant.

## 4. Escopos, consentimento e admin consent

### 4.1 Onde verificar no portal

- Entra ID ▸ **App registrations** ▸ *seu app* ▸ **API permissions**.
- Diferencie permissões **Delegated** (usuário) e **Application** (daemon).
- Adicione `openid`, `profile` e `email` para OIDC e outros escopos necessários (por exemplo, Microsoft Graph).
- Para permissões privilegiadas, clique em **Grant admin consent** e use consentimento incremental quando possível.

### 4.2 Teste rápido

- Realize um login interativo e valide se o consentimento é exibido e se o token contém os escopos esperados.

## 5. Validação de tokens, `state` e `nonce`

### 5.1 Onde verificar / implementar

- Consulte o `jwks_uri` em `/.well-known/openid-configuration` para obter as chaves públicas.
- No backend, valide assinatura, `issuer`, `audience` (seu `client_id`), `exp`/`nbf` (com tolerância de clock) e `nonce` (ID token). Mantenha `state` para mitigar CSRF.

### 5.2 Teste rápido

- Decodifique o ID token com uma biblioteca oficial e confirme `iss`, `aud`, `nonce` e horários.

## 6. Logout e SSO entre aplicativos (front-channel)

### 6.1 Onde verificar no portal

- Entra ID ▸ **App registrations** ▸ *seu app* ▸ **Authentication** ▸ **Front-channel logout URL**: cadastre o endpoint que limpa a sessão local.
- No fluxo do usuário, utilize o endpoint `/logout` com `post_logout_redirect_uri` (que deve estar listado em Redirect URIs).

### 6.2 Teste rápido

- Realize logout no Aplicativo A e verifique se o Entra chama a URL de front-channel do Aplicativo B e se ambos limpam a sessão. Atenção: bloqueios de cookies de terceiros podem impedir o sign-out via iFrame.

## 7. Cookies, SameSite, CORS e storage

### 7.1 Onde verificar / implementar

- Aplicações Web com cookies de sessão: configure `SameSite=None; Secure` quando houver cenários cross-site ou iframes.
- SPA com MSAL.js: tokens ficam em storage do navegador; verifique configurações de CORS das APIs chamadas.
- Teste em navegadores com Intelligent Tracking Prevention (Safari), abas anônimas e cenários restritivos.

### 7.2 Teste rápido

- Inspecione o atributo `SameSite` durante o fluxo e confirme se não há bloqueio causado por ITP ou cookies de terceiros.

## 8. Diferença entre ID token e Access token

### 8.1 Diagnóstico

- **ID token** identifica o usuário e deve ficar no cliente.
- **Access token** autoriza chamadas à API (o campo `aud` indica o recurso). Utilize sempre o token adequado.

### 8.2 Teste rápido

- Verifique o `aud` do token enviado à API. Se corresponder ao seu `client_id`, trata-se de um ID token usado incorretamente.

## 9. Claims e dados do usuário (Token configuration)

### 9.1 Onde verificar no portal

- Entra ID ▸ **App registrations** ▸ *seu app* ▸ **Token configuration** ▸ **+ Add optional claim** para incluir `email`, `given_name`, `family_name`, `upn`, etc., tanto em ID tokens quanto em Access tokens.
- Lembre-se: o claim `email` só aparece se existir no perfil do usuário. Para identificadores estáveis, prefira `oid`/`sub` em vez de `upn`.

### 9.2 Teste rápido

- Faça novo login e confira se os claims adicionais estão presentes. Caso contrário, valide as permissões sugeridas ao adicionar o claim (por exemplo, Microsoft Graph `email`) e se o atributo está preenchido no perfil do usuário.

## 10. Ambientes, domínios e `authority`

### 10.1 Onde verificar / implementar

- Utilize sempre o endpoint `/v2.0` e separe ambientes (dev/homolog/prod) com aplicativos distintos ou, ao menos, Redirect URIs próprios.
- Em domínios customizados, mantenha consistência dos Redirect URIs e endpoints em cada ambiente.

### 10.2 Teste rápido

- Consulte a discovery de cada ambiente e garanta que o aplicativo correto (client_id/issuer) está respondendo.

## Ferramentas úteis para testes rápidos

- **Discovery OIDC:** `https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration` (confira endpoints, issuer e `jwks_uri`).
- **Logout:** `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/logout?post_logout_redirect_uri={URI_REGISTRADA}` (ou utilize `logoutRedirect()` no MSAL.js).

> ℹ️ Para aprofundar cada etapa, consulte a documentação oficial no [Microsoft Learn](https://learn.microsoft.com/azure/active-directory/develop/).