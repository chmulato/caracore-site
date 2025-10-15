# Políticas de Segurança para Página de Login OIDC

Este documento explica as políticas de segurança implementadas na página de login da Área Restrita do site Cara Core, que utiliza OpenID Connect (OIDC) para autenticação com Google e Microsoft.

## Política de Segurança de Conteúdo (CSP)

A CSP implementada para a página de login é mais restritiva que a do site principal devido à natureza sensível da autenticação. A política foi configurada para:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.googleusercontent.com https://*.microsoft.com; connect-src 'self' https://caracore-backend.azurewebsites.net https://accounts.google.com https://*.google.com https://login.microsoftonline.com https://*.microsoft.com; font-src 'self' data:; frame-src 'self' https://accounts.google.com https://login.microsoftonline.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';">
```

### Explicação das Diretivas

1. **default-src 'self'**: Por padrão, permite recursos apenas do mesmo domínio.

2. **script-src 'self' https://cdn.jsdelivr.net**: 
   - Permite scripts do próprio domínio
   - Permite scripts do CDN para a biblioteca OIDC-client-ts

3. **style-src 'self' 'unsafe-inline'**: 
   - Permite estilos do próprio domínio
   - Permite estilos inline (necessários para alguns componentes de UI)

4. **img-src 'self' data: https://*.googleusercontent.com https://*.microsoft.com**: 
   - Permite imagens do próprio domínio
   - Permite imagens data: URI (para ícones e avatares)
   - Permite carregar avatares dos usuários dos domínios do Google e Microsoft

5. **connect-src 'self' https://caracore-backend.azurewebsites.net https://accounts.google.com https://*.google.com https://login.microsoftonline.com https://*.microsoft.com**: 
   - Permite conexões ao próprio domínio
   - Permite conexões ao backend do Azure
   - Permite conexões aos endpoints de autenticação do Google e Microsoft

6. **font-src 'self' data:**: 
   - Permite fontes do próprio domínio
   - Permite fontes data: URI

7. **frame-src 'self' https://accounts.google.com https://login.microsoftonline.com**: 
   - Permite frames do próprio domínio
   - Permite frames dos endpoints de autenticação do Google e Microsoft (necessários para alguns fluxos de autenticação)

8. **object-src 'none'**: 
   - Bloqueia todos os plugins e objetos incorporados (como Flash, PDF, etc.)

9. **base-uri 'self'**: 
   - Restringe o uso de elementos `<base>` para o próprio domínio

10. **form-action 'self'**: 
    - Restringe onde os formulários podem ser enviados apenas para o próprio domínio

11. **frame-ancestors 'self'**: 
    - Previne que esta página seja incorporada como frame em outros sites (proteção contra clickjacking)

## Considerações de Segurança Adicionais

### 1. Cookies

Os cookies usados para autenticação OIDC devem ter as flags:
- **SameSite=None**: Necessário para autenticação de terceiros
- **Secure**: Garante que os cookies só sejam transmitidos via HTTPS
- **HttpOnly**: Para cookies de sessão, previne acesso via JavaScript

### 2. CORS

A configuração CORS no backend deve permitir solicitações apenas de origens confiáveis:
- O domínio principal (caracore.com.br)
- Subdomínios autorizados

### 3. Subpastas Seguras

A pasta `/secure/` contém conteúdo protegido e deve:
- Verificar autenticação para todas as solicitações
- Redirecionar usuários não autenticados para a página de login
- Implementar verificação de token em todas as páginas

### 4. Carregamento de Recursos

Todos os recursos críticos devem ser carregados usando HTTPS e, quando possível, implementar Subresource Integrity (SRI) para bibliotecas de terceiros.

## Melhorias Futuras

1. **Implementar tokens anti-CSRF** para formulários
2. **Adicionar Subresource Integrity (SRI)** para bibliotecas externas
3. **Implementar cabeçalhos HTTP de segurança adicionais**:
   - Strict-Transport-Security
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection
   - Referrer-Policy
4. **Rotação periódica de tokens** para reduzir o impacto de possíveis vazamentos