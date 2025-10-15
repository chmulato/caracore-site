# Política de Segurança de Conteúdo (CSP) e Cookies

Este documento explica as alterações de segurança implementadas no site Cara Core para resolver problemas relacionados a cookies e segurança.

## Problema

O site estava enfrentando os seguintes problemas:

1. Avisos de cookies sendo rejeitados
2. Problemas com o modo Quirks do navegador
3. Falta de política de segurança de conteúdo (CSP)
4. Problemas de acessibilidade em links e elementos interativos

## Soluções Implementadas

### 1. Política de Segurança de Conteúdo (CSP)

Foi adicionada uma meta tag CSP no cabeçalho do site para controlar quais recursos podem ser carregados:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://www.googletagmanager.com https://cdn.jsdelivr.net 'unsafe-inline'; style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; img-src 'self' https://www.google-analytics.com https://www.googletagmanager.com data:; connect-src 'self' https://caracore-backend.azurewebsites.net https://www.google-analytics.com https://accounts.google.com https://login.microsoftonline.com; font-src 'self' https://cdn.jsdelivr.net data:; frame-src 'self'; object-src 'none';">
```

Esta política:

- Limita scripts a origens confiáveis (próprio site, Google Analytics e CDN Bootstrap)
- Limita conexões a origens confiáveis (próprio site, backend Azure, Google Analytics, provedores OIDC)
- Restringe iframes e recursos de mídia
- Bloqueia objetos potencialmente perigosos

### 2. Configuração Adequada de Cookies

A configuração do Google Analytics foi atualizada para garantir que os cookies sejam definidos corretamente:

```javascript
gtag('config', 'G-MKFC9G3CL0', {
  'cookie_domain': 'caracore.com.br',
  'cookie_flags': 'SameSite=None;Secure',
  'cookie_update': true
});
```

Estas configurações:

- Definem explicitamente o domínio do cookie para `caracore.com.br`
- Configuram flags de cookie para usar `SameSite=None;Secure` para compatibilidade com autenticação de terceiros
- Garantem que os cookies sejam atualizados adequadamente

### 3. Melhorias de Acessibilidade e Segurança

- Foram adicionados atributos `rel="noopener"` a todos os links que abrem em novas guias
- Foram adicionados atributos `title` a todos os links e botões para melhorar a acessibilidade
- Foi adicionado `referrerpolicy="no-referrer"` ao iframe do Google Maps
- Foram adicionados textos acessíveis para leitores de tela em ícones de redes sociais

### 4. Modo Standards (Não-Quirks)

- Foi garantido que a declaração `<!DOCTYPE html>` aparece corretamente na primeira linha do documento para forçar o modo padrão em todos os navegadores

## Benefícios

1. **Segurança Aprimorada**: A CSP protege contra ataques XSS e injeção de conteúdo
2. **Cookies Funcionais**: Configuração correta de cookies evita rejeições do navegador
3. **Melhor Acessibilidade**: Links e elementos interativos seguem as melhores práticas
4. **Renderização Consistente**: O modo padrão garante renderização consistente entre navegadores

## Próximos Passos

Algumas melhorias adicionais que podem ser consideradas:

1. Mover estilos inline para arquivos CSS externos
2. Implementar Subresource Integrity (SRI) para recursos de terceiros
3. Considerar o uso de um Content Security Policy Report-Only para monitoramento antes de impor restrições rígidas
4. Adicionar cabeçalhos HTTP de segurança adicionais através da configuração do servidor