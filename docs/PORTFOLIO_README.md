# Portfólio de Projetos - Cara Core Informática

Este documento descreve a estrutura e o uso da página de portfólio profissional da Cara Core Informática.

## 📁 Estrutura de Arquivos

```
site/cara-core/
├── portfolio.html                    # Página principal do portfólio
├── convert-diagrams.ps1              # Script para gerar PNGs dos diagramas
├── images/
│   └── portfolio/
│       ├── caracore-hub-architecture.mmd      # Diagrama Mermaid CaraCore Hub
│       ├── caracore-hub-architecture.png      # PNG gerado (opcional)
│       ├── caracore-seed-architecture.mmd     # Diagrama Mermaid CaraCore Seed
│       ├── caracore-seed-architecture.png     # PNG gerado (opcional)
│       ├── reino-oidc-journey.mmd             # Diagrama Mermaid Reino OIDC
│       └── reino-oidc-journey.png             # PNG gerado (opcional)
```

## 🎨 Características da Página

### Design Responsivo

- **Mobile-first**: Totalmente responsivo para todos os dispositivos
- **Gradientes modernos**: Design consistente com o site principal
- **Cards interativos**: Efeitos hover elegantes
- **Navegação integrada**: Menu consistente com index.html

### Conteúdo Dual

Cada projeto apresenta duas perspectivas:

1. **Visão Executiva** 🏢
   - Benefícios de negócio
   - ROI e métricas
   - Diferenciais competitivos
   - Tecnologias enterprise

2. **Para Leigos** 📖
   - Linguagem acessível
   - Metáforas do dia-a-dia
   - Exemplos práticos
   - Sem jargão técnico

### Diagramas de Arquitetura

- **Renderização dinâmica**: Mermaid.js renderiza diagramas no navegador
- **Alta qualidade**: Diagramas vetoriais escaláveis
- **Cores temáticas**: Cada projeto tem sua paleta de cores

## 🚀 Projetos Apresentados

### 1. CaraCore Hub

- **Tema**: E-commerce automation
- **Cores**: Laranja/Amarelo (#f7971e → #ffd200)
- **Foco**: Gestão de encomendas multi-marketplace

### 2. CaraCore Seed

- **Tema**: Sistema de licenciamento
- **Cores**: Verde/Azul (#43cea2 → #185a9d)
- **Foco**: Controle de acesso enterprise

### 3. Reino OIDC

- **Tema**: Educação em segurança digital
- **Cores**: Roxo (#8f6ed5 → #5f2c82)
- **Foco**: OAuth 2.1 e OpenID Connect

## 📊 Geração de Diagramas PNG

### Método 1: Renderização Dinâmica (Recomendado)

A página já usa **Mermaid.js** para renderizar os diagramas automaticamente no navegador. Não é necessário gerar PNGs.

### Método 2: Gerar PNGs Estáticos (Opcional)

Se preferir usar imagens PNG estáticas em vez de renderização dinâmica:

#### Pré-requisitos

```powershell
# Instalar Node.js e npm
# Depois instalar o Mermaid CLI:
npm install -g @mermaid-js/mermaid-cli
```

#### Executar Conversão

```powershell
# No diretório do site
cd D:\dev\site\cara-core
.\convert-diagrams.ps1
```

O script irá:

- ✅ Verificar instalação do mmdc
- ✅ Converter todos os .mmd para .png
- ✅ Aplicar configurações de alta qualidade (1920x1080, scale 2)
- ✅ Salvar em `images/portfolio/`

#### Configurações de Qualidade

- **Largura**: 1920px
- **Altura**: 1080px
- **Escala**: 2x (para displays retina)
- **Fundo**: Branco
- **Formato**: PNG com transparência

## 🔧 Manutenção

### Adicionar Novo Projeto

1. **Editar portfolio.html**

```html
<!-- Copiar estrutura de um projeto existente -->
<section class="container my-5">
   <div class="project-card">
      <!-- Adaptar conteúdo -->
   </div>
</section>
```

2. **Criar diagrama Mermaid**

- Criar arquivo `.mmd` em `images/portfolio/`
- Adicionar código Mermaid
- Definir paleta de cores

3. **Atualizar script de conversão**

- Adicionar nome do arquivo ao array `$diagramas`

### Atualizar Conteúdo

- **Visão Executiva**: Focar em benefícios de negócio
- **Para Leigos**: Usar metáforas e linguagem simples
- **Tecnologias**: Listar badges das tecnologias usadas
- **Links**: Incluir apresentação (GitHub Pages) e repositório

## 🎯 SEO e Performance

### Meta Tags

- ✅ Title otimizado
- ✅ Description com keywords
- ✅ Open Graph para redes sociais
- ✅ Canonical URL

### Performance

- ✅ CSS inline mínimo
- ✅ Bootstrap via CDN
- ✅ Mermaid.js carregado como módulo ES6
- ✅ Lazy loading de diagramas
- ✅ Imagens otimizadas (quando usar PNGs)

### Segurança

- ✅ CSP (Content Security Policy)
- ✅ rel="noopener" em links externos
- ✅ HTTPS enforced

## 📱 Navegação

O portfólio está integrado ao menu principal do site:

```text
Início → Serviços → Portfólio → Sobre → Contato → Área 51
```

Link no `index.html`:

```html
<li class="nav-item">
  <a class="nav-link" href="portfolio.html">Portfólio</a>
</li>
```

## 🌐 Deploy

### GitHub Pages

1. Commit dos arquivos
2. Push para branch `main`
3. Acessar em: `https://caracore.com.br/portfolio.html`

### Servidor Local

```powershell
# Testar localmente
python -m http.server 8000
# Abrir: http://localhost:8000/portfolio.html
```

## 📄 Licença

© 2025 Cara Core Informática - CNPJ: 23.969.028/0001-37

---

**Desenvolvido por:** Cara Core Informática  
**Contato:** [caracore.com.br](https://caracore.com.br)
