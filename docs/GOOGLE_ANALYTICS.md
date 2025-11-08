# Google Analytics - Documentação de Implementação

## Visão Geral

Configuração completa do Google Analytics GA4 para o site da Cara Core Informática com tracking avançado de eventos personalizados.

## Informações Principais

- ID de Medição: G-MKFC9G3CL0
- Domínio: caracore.com.br
- Versão: 2.0
- Data de Implementação: 08/11/2025

## Arquivos Envolvidos

### 1. assets/js/analytics-config.js

Arquivo centralizado com toda a configuração do Google Analytics.

Localização: `d:\dev\site\cara-core\assets\js\analytics-config.js`

### 2. `index.html` e `portfolio.html`

Scripts do GA carregados no `<head>` de ambas as páginas:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-MKFC9G3CL0"></script>
<script src="assets/js/analytics-config.js"></script>
```

## Eventos Rastreados

### 1. Page View (Visualização de Página)

- Rastreamento automático de todas as páginas
- Captura: título, URL completa e caminho

### 2. Outbound Links (Links Externos)

- Tracking de cliques em links externos ao domínio caracore.com.br
- Categoria: `outbound`
- Label: URL do link clicado

### 3. Contact Clicks (Cliques em Contato)

- WhatsApp
- Telegram  
- Email
- Categoria: `engagement`
- Label: Tipo de contato (WhatsApp/Telegram/Email)

### 4. Navigation (Navegação no Menu)

- Tracking de todos os cliques nos itens do menu
- Categoria: `menu`
- Label: Nome do item do menu

### 5. Portfolio - View Item (Visualização de Projetos)

- Dispara quando um card de projeto se torna 50% visível na tela
- Categoria: `portfolio`
- Label: Nome do projeto (CaraCore Hub, CaraCore Seed, Reino OIDC)
- Usa Intersection Observer API

### 6. Portfolio - Project Link Clicks

- Tracking de cliques em links dos projetos (GitHub, Demo)
- Categoria: `portfolio`
- Label: Nome do projeto + Tipo de link

### 7. Scroll Depth (Profundidade de Rolagem)

- Marcos: 25%, 50%, 75%, 90%
- Categoria: `engagement`
- Label: Percentual de scroll

### 8. Time on Page (Tempo na Página)

- Marcos: 30s, 60s, 120s, 300s
- Categoria: `engagement`
- Label: Tempo em segundos

## ⚙️ Configurações GA4

```javascript
gtag('config', 'G-MKFC9G3CL0', {
  'cookie_domain': 'caracore.com.br',
  'cookie_flags': 'SameSite=None;Secure',
  'cookie_update': true,
  'anonymize_ip': true,
  'send_page_view': true
});
```

### Parâmetros:

- cookie_domain: Domínio específico para cookies
- cookie_flags: Cookies seguros com SameSite=None
- cookie_update: Atualiza cookies em cada visita
- anonymize_ip: Anonimiza IPs para compliance LGPD/GDPR
- send_page_view: Envia pageview automaticamente

## 🔒 Segurança (CSP)

Ambos os arquivos HTML incluem Content Security Policy permitindo:

```text
script-src 'self' https://www.googletagmanager.com https://cdn.jsdelivr.net 'unsafe-inline'
img-src 'self' https://www.google-analytics.com https://www.googletagmanager.com data:
connect-src 'self' https://www.google-analytics.com
```

## 📈 Relatórios Disponíveis no GA4

Com esta implementação, você pode visualizar:

1. Aquisição
   - Fonte/Mídia de tráfego
   - Campanhas
   - Páginas de entrada

2. Engajamento
   - Páginas mais visitadas
   - Tempo médio na página
   - Profundidade de scroll
   - Taxa de rejeição

3. Eventos Personalizados
   - Cliques em contato (WhatsApp, Telegram, Email)
   - Visualizações de projetos do portfolio
   - Cliques em links de projetos
   - Navegação no menu
   - Links externos clicados

4. Conversões
   - Configure os eventos acima como conversões no GA4
   - Sugestões: `contact_click`, `project_link_click`

## 🚀 Como Testar

### 1. Modo Real-Time no GA4

1. Acesse [Google Analytics](https://analytics.google.com)
2. Selecione a propriedade G-MKFC9G3CL0
3. Vá em Relatórios > Tempo real
4. Navegue pelo site e observe os eventos

### 2. Chrome DevTools

1. Abra o console (F12)
2. Vá em Network
3. Filtre por "collect" ou "analytics"
4. Interaja com o site e veja as requisições

### 3. Google Tag Assistant

1. Instale a extensão [Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-companion/jmekfmbnaedfebfnmakmokmlfpblbfdm)
2. Abra o site
3. Clique no ícone da extensão
4. Veja tags e eventos disparados

## 🛠️ Manutenção

### Adicionar Novo Evento

Edite `assets/js/analytics-config.js` e adicione dentro do `window.addEventListener('load')`:

```javascript
// Exemplo: tracking de formulário
document.querySelector('#meuFormulario').addEventListener('submit', function(e) {
  gtag('event', 'form_submit', {
    'event_category': 'forms',
    'event_label': 'Formulário de Contato',
    'value': 1
  });
});
```

### Alterar ID de Medição

Se precisar alterar o ID do GA4:

1. Em `analytics-config.js`: linha 24, alterar `'G-MKFC9G3CL0'`
2. Em `index.html` e `portfolio.html`: alterar `?id=G-MKFC9G3CL0`

## 📚 Referências

- [Google Analytics 4](https://support.google.com/analytics/answer/10089681)
- [Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [gtag.js API](https://developers.google.com/tag-platform/gtagjs/reference)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

## ✅ Checklist de Verificação

- [x] Script gtag.js carregado no `<head>`
- [x] Configuração centralizada em arquivo externo
- [x] Eventos personalizados implementados
- [x] CSP atualizado para permitir GA
- [x] Anonimização de IP ativa (LGPD/GDPR)
- [x] Tracking de conversões (contato, projetos)
- [x] Documentação completa

---

Desenvolvido por: Cara Core Informática  
Data: 08 de novembro de 2025  
Versão: 2.0
