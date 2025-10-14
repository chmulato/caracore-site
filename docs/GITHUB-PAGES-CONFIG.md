# Configuração para GitHub Pages

Este documento descreve como o site Cara Core está configurado para funcionar corretamente no GitHub Pages com autenticação OIDC.

## Arquivos de Configuração

### 1. `.nojekyll`

Este arquivo vazio informa ao GitHub Pages para não processar o site com Jekyll, permitindo que arquivos e diretórios que começam com underscore (_) sejam servidos normalmente.

### 2. `_config.yml`

Configuração básica do site no GitHub Pages:

- Define o título e descrição do site
- Configura a URL personalizada
- Lista arquivos e diretórios a serem excluídos da build

### 3. `_redirects`

Arquivo para serviços como Netlify ou Cloudflare Pages que ajudam no roteamento SPA.

### 4. `vercel.json`
Configuração para Vercel que define regras de redirecionamento, caso o site seja migrado para esse serviço no futuro.

## Configuração OIDC

Como o GitHub Pages é uma hospedagem estática sem capacidade de processamento no lado do servidor, nossa configuração OIDC foi adaptada para:

1. **Apontar diretamente para o backend**: Os endpoints de token agora apontam diretamente para o backend Azure:

   ```javascript
   googleTokenEndpoint: 'https://caracore-backend.azurewebsites.net/oauth/google/token',
   microsoftTokenEndpoint: 'https://caracore-backend.azurewebsites.net/oauth/microsoft/token'
   ```

2. **CORS no backend**: O backend foi configurado para aceitar solicitações cross-origin do domínio personalizado:

   ```bash
   ORIGIN_ALLOWED=https://www.caracore.com.br
   ```

## Limitações

- O arquivo `web.config` é ignorado pelo GitHub Pages, pois é específico do IIS
- Não há capacidade de reescrita de URL do lado do servidor
- Não é possível configurar cabeçalhos CORS do lado do servidor

## Alternativas à Configuração Atual

Se você precisar de mais recursos de servidor do que o GitHub Pages pode oferecer, considere:

1. **Azure Static Web Apps**: Oferece suporte para API Functions e mais controle sobre redirecionamentos
2. **Netlify**: Permite configuração de redirecionamentos e funções serverless
3. **Vercel**: Similar ao Netlify, com bom suporte para SPAs
4. **Cloudflare Pages**: Oferece funções e redirecionamentos personalizados

## Manutenção

Quando fizer alterações na configuração do OIDC:

1. Certifique-se de que todos os endpoints do token apontem diretamente para o backend Azure
2. Verifique se o backend tem as configurações CORS corretas
3. Teste a autenticação tanto com Google quanto com Microsoft