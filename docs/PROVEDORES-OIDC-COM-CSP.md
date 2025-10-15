# Configurações de Provedores OIDC com CSP

Este documento explica as configurações necessárias nos provedores de identidade OIDC (Google e Microsoft) para garantir compatibilidade com as Políticas de Segurança de Conteúdo (CSP) implementadas no site.

## Configurações do Google Cloud Platform

### 1. URIs de Redirecionamento Autorizados

Para o provedor Google, é necessário configurar as seguintes URIs de redirecionamento no Console do Google Cloud Platform:

- `https://caracore.com.br/secure/callback.html`
- `https://www.caracore.com.br/secure/callback.html`

### 2. Origens JavaScript Autorizadas

As seguintes origens devem ser configuradas como JavaScript Origins:

- `https://caracore.com.br`
- `https://www.caracore.com.br`

### 3. Escopos OAuth Necessários

Os seguintes escopos devem ser configurados:

- `openid`
- `profile`
- `email`

## Configurações da Microsoft Entra ID (Azure AD)

### 1. URIs de Redirecionamento

Para o provedor Microsoft, é necessário configurar as seguintes URIs de redirecionamento no Portal do Azure:

- `https://caracore.com.br/secure/callback.html`
- `https://www.caracore.com.br/secure/callback.html`

### 2. Tipos de Contas Suportados

Configurar para "Contas pessoais da Microsoft somente" para permitir contas @outlook.com, @hotmail.com, etc.

### 3. Permissões da API

As seguintes permissões devem ser configuradas:

- Microsoft Graph > User.Read
- Microsoft Graph > email
- Microsoft Graph > profile
- Microsoft Graph > openid

## Cabeçalhos CORS no Backend

O backend Azure deve ser configurado com os seguintes cabeçalhos CORS:

```
Access-Control-Allow-Origin: https://caracore.com.br, https://www.caracore.com.br
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## Compatibilidade com CSP

### 1. Google

As políticas de segurança de conteúdo devem incluir:

```
script-src: 'self' https://accounts.google.com
connect-src: 'self' https://accounts.google.com https://*.google.com
frame-src: 'self' https://accounts.google.com
img-src: 'self' data: https://*.googleusercontent.com
```

### 2. Microsoft

As políticas de segurança de conteúdo devem incluir:

```
script-src: 'self' https://login.microsoftonline.com
connect-src: 'self' https://login.microsoftonline.com https://*.microsoft.com
frame-src: 'self' https://login.microsoftonline.com
img-src: 'self' data: https://*.microsoft.com
```

## Validação do Fluxo de Autenticação

Após a implementação das políticas de segurança, é importante validar:

1. Processo de login completo com ambos os provedores
2. Recuperação e armazenamento correto de tokens
3. Processo de logout e limpeza de sessão
4. Redirecionamentos para as páginas corretas após login/logout
5. Ausência de violações CSP no console do navegador durante todo o fluxo

## Solução de Problemas Comuns

### Violações de CSP

Se ocorrerem violações de CSP durante o fluxo de autenticação:

1. Verifique o console do navegador para identificar recursos bloqueados
2. Ajuste a política CSP para incluir os domínios necessários
3. Considere usar um nonce para scripts inline críticos se necessário

### Problemas com Cookies

Se houver problemas relacionados a cookies durante a autenticação:

1. Verifique se os cookies estão sendo configurados com as flags corretas (Secure, HttpOnly)
2. Para cookies SameSite=None, certifique-se de que o protocolo é HTTPS
3. Alguns navegadores podem bloquear cookies de terceiros - implemente tratamento adequado

### Problemas de Redirecionamento

Se ocorrerem falhas nos redirecionamentos:

1. Verifique se todas as URIs de redirecionamento estão registradas nos provedores de identidade
2. Confirme se as URIs de redirecionamento correspondem exatamente (incluindo protocolo e caso)
3. Verifique se as políticas de frame-ancestors e form-action não estão bloqueando redirecionamentos