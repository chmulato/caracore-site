# Estrutura de Assets - Cara Core Informática

Esta pasta centraliza todos os recursos estáticos (CSS, JavaScript e imagens) do site.

## 📁 Estrutura de Diretórios

```
assets/
├── css/
│   ├── main.css           # Estilos principais compartilhados
│   └── portfolio.css      # Estilos específicos do portfólio
├── js/
│   ├── main.js           # Scripts principais (planos, interações)
│   └── analytics-config.js # Configuração do Google Analytics
└── images/
    ├── favicon.ico       # Ícone do site
    ├── logo.png          # Logotipo principal
    ├── logo_p.png        # Logotipo pequeno
    ├── security.png      # Imagem de segurança
    └── portfolio/        # Imagens e diagramas do portfólio
        ├── area51-architecture.mmd      # Diagrama Área 51
        ├── caracore-hub-architecture.mmd  # Diagrama Hub
        ├── caracore-seed-architecture.mmd # Diagrama Seed
        └── reino-oidc-journey.mmd        # Diagrama Reino OIDC
```

## 🎨 CSS

### main.css
Contém todos os estilos principais do site:
- Background gradiente
- Seções (#servicos, #diferenciais, #sobre, #contato)
- Links de contato
- Navbar
- Cards
- Botões
- Tabela de horários
- Media queries responsivas

**Usado em:**
- index.html
- portfolio.html

### portfolio.css
Estilos específicos da página de portfólio:
- Cards de projetos (.project-card)
- Headers de projetos (.project-header.hub/.seed/.reino)
- Badges de tecnologia (.tech-badge)
- Containers de diagramas (.diagram-container)
- Botões de projeto (.btn-project)
- Lista de features (.feature-list)

**Usado em:**
- portfolio.html

## 📜 JavaScript

### main.js
Scripts de funcionalidades interativas:
- **initPlanosSection()**: Gerencia exibição/ocultação da seção de planos
  - Evento no botão "Planos Flexíveis"
  - Evento no botão "Fechar"
  - Scroll suave

**Usado em:**
- index.html

### analytics-config.js
Configuração do Google Analytics:
- Inicialização do dataLayer
- Configuração do gtag
- Cookie settings para caracore.com.br

**Usado em:**
- index.html
- portfolio.html

## 🖼️ Imagens

### Imagens Principais
Recursos visuais do site:
- **favicon.ico**: Ícone do site exibido na aba do navegador
- **logo.png**: Logotipo principal da Cara Core Informática
- **logo_p.png**: Versão pequena do logotipo
- **security.png**: Imagem relacionada à segurança

### portfolio/
Contém recursos visuais do portfólio:
- **Arquivos .mmd**: Diagramas fonte em Mermaid (versionados)
- **Arquivos .png**: Imagens geradas opcionalmente

#### Diagramas Disponíveis

1. **area51-architecture.mmd**
   - Arquitetura do sistema Área 51
   - Componentes: Frontend, Backend, Provedores OIDC, Armazenamento
   - Fluxo completo de autenticação OAuth 2.1 + OIDC

2. **caracore-hub-architecture.mmd**
   - Arquitetura do sistema CaraCore Hub
   - Camadas: Apresentação, Aplicação, Integrações, Dados, Infraestrutura

3. **caracore-seed-architecture.mmd**
   - Arquitetura do sistema de licenciamento
   - Componentes: API, Segurança, Dados, Docker

4. **reino-oidc-journey.mmd**
   - Jornada de aprendizagem do Reino OIDC
   - Fluxo: Entrada → Narrativa → Aprendizagem → Recursos

## 🔗 Como Usar

### Incluir CSS em HTML
```html
<head>
  <!-- Bootstrap (CDN) -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  
  <!-- CSS Local -->
  <link rel="stylesheet" href="css/additional-styles.css">
  
  <!-- Assets Centralizados -->
  <link rel="stylesheet" href="assets/css/main.css">
  <link rel="stylesheet" href="assets/css/portfolio.css"> <!-- Apenas em portfolio.html -->
</head>
```

### Incluir JavaScript em HTML
```html
<body>
  <!-- Conteúdo -->
  
  <!-- Scripts (antes de fechar </body>) -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="assets/js/main.js"></script> <!-- index.html -->
  
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-MKFC9G3CL0"></script>
  <script src="assets/js/analytics-config.js"></script>
</body>
```

## 🎯 Benefícios da Centralização

### ✅ Organização
- Todos os assets em um único local
- Estrutura clara e previsível
- Fácil localização de recursos

### ✅ Manutenção
- Alterações CSS/JS em um só lugar
- Sem duplicação de código
- Versionamento simplificado

### ✅ Performance
- CSS/JS externos podem ser cacheados pelo navegador
- Reduz tamanho dos arquivos HTML
- Melhor separação de responsabilidades

### ✅ Reutilização
- Estilos compartilhados entre páginas
- Scripts comuns centralizados
- DRY (Don't Repeat Yourself)

## 🔧 Manutenção

### Adicionar Novo Estilo
1. Editar `assets/css/main.css` (estilos globais)
2. Ou criar novo arquivo CSS específico
3. Incluir no HTML com `<link rel="stylesheet" href="assets/css/nome.css">`

### Adicionar Novo Script
1. Criar arquivo em `assets/js/nome.js`
2. Usar padrão IIFE para encapsulamento:
```javascript
(function() {
  'use strict';
  // Seu código aqui
})();
```
3. Incluir no HTML antes de `</body>`

### Adicionar Nova Imagem
1. Salvar em `assets/images/` ou subpasta apropriada
2. Referenciar com caminho relativo: `assets/images/nome.png`

## 📊 Compatibilidade

- ✅ **Browsers**: Chrome, Firefox, Safari, Edge (versões modernas)
- ✅ **Mobile**: Totalmente responsivo
- ✅ **SEO**: Estrutura otimizada para motores de busca
- ✅ **Performance**: Assets otimizados para carregamento rápido

## 🔒 Segurança

- CSP (Content Security Policy) configurado
- Assets carregados apenas de domínios confiáveis
- Sem inline styles ou scripts (exceto onde necessário)
- rel="noopener" em links externos

## 📝 Notas

- Os arquivos CSS/JS antigos em `/css` e `/js` ainda existem para compatibilidade
- `css/additional-styles.css` é mantido por compatibilidade com código legado
- Gradualmente, migrar todo código para a pasta `assets/`

---

**Última atualização:** 08/11/2025  
**Mantido por:** Cara Core Informática
