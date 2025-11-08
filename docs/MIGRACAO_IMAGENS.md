# 📸 Migração de Imagens - Cara Core Site

**Data:** 8 de novembro de 2025  
**Status:** ✅ Concluída (index.html e portfolio.html)  
**Pendente:** ⏳ Outras páginas (publications, secure)

---

## 🎯 Objetivo

Padronizar a estrutura de assets, movendo imagens de `/images` para `/assets/images` seguindo o mesmo padrão já estabelecido para CSS e JavaScript.

---

## 📁 Estrutura

### Antes

```text
cara-core/
├── images/
│   ├── favicon.ico
│   ├── logo.png
│   ├── logo_p.png
│   ├── security.png
│   └── portfolio/
│       ├── area51-architecture.mmd
│       ├── caracore-hub-architecture.mmd
│       ├── caracore-seed-architecture.mmd
│       └── reino-oidc-journey.mmd
└── assets/
    ├── css/
    └── js/
```

### Depois

```text
cara-core/
└── assets/
    ├── css/
    ├── js/
    └── images/
        ├── favicon.ico
        ├── logo.png
        ├── logo_p.png
        ├── security.png
        └── portfolio/
            ├── area51-architecture.mmd
            ├── caracore-hub-architecture.mmd
            ├── caracore-seed-architecture.mmd
            └── reino-oidc-journey.mmd
```

---

## ✅ Arquivos Migrados

### Imagens Principais (4 arquivos)

| Arquivo | Descrição | Uso |
|---------|-----------|-----|
| `favicon.ico` | Ícone do site (aba do navegador) | index.html, portfolio.html |
| `logo.png` | Logotipo principal (alta resolução) | Hero section, Open Graph |
| `logo_p.png` | Logotipo pequeno | Seção Sobre |
| `security.png` | Imagem de segurança | (referência futura) |

### Diagramas Mermaid (4 arquivos)

| Arquivo | Descrição | Projeto |
|---------|-----------|---------|
| `area51-architecture.mmd` | Arquitetura OAuth 2.1 + OIDC | Área 51 |
| `caracore-hub-architecture.mmd` | Sistema Hub multi-usuário | Caracore Hub |
| `caracore-seed-architecture.mmd` | Template Seed base | Caracore Seed |
| `reino-oidc-journey.mmd` | Jornada educacional OIDC | Reino OIDC |

---

## 🔧 Páginas Atualizadas

### ✅ index.html (5 referências)

```html
<!-- Favicon -->
<link rel="icon" href="assets/images/favicon.ico">
<link rel="shortcut icon" href="assets/images/favicon.ico">

<!-- Open Graph -->
<meta property="og:image" content="https://caracore.com.br/assets/images/logo.png">

<!-- Twitter Card -->
<meta name="twitter:image" content="https://caracore.com.br/assets/images/logo.png">

<!-- Hero Section -->
<img src="assets/images/logo.png" alt="Cara Core Logo">

<!-- About Section -->
<img src="assets/images/logo_p.png" alt="Cara Core">
```

### ✅ portfolio.html (3 referências)

```html
<!-- Favicon -->
<link rel="icon" href="assets/images/favicon.ico">
<link rel="shortcut icon" href="assets/images/favicon.ico">

<!-- Open Graph -->
<meta property="og:image" content="https://caracore.com.br/assets/images/logo.png">
```

---

## ⏳ Pendente - Outras Páginas

### publications/livros/

#### apostila_ms365.html

```html
<!-- META TAGS -->
<meta property="og:image" content="https://caracore.com.br/handbook/images/COVER.png">
<meta name="twitter:image" content="https://caracore.com.br/handbook/images/COVER.png">

<!-- IMAGENS NO CONTEÚDO -->
<img src="images/COVER.png" alt="Apostila Microsoft 365" />
<img src="images/ONEDRIVE.png" alt="OneDrive" />
<img src="images/SHAREPOINT.png" alt="SharePoint" />
<img src="images/SECURITY.png" alt="Security" />
```

#### guia_de_servicos.html

```html
<!-- META TAGS -->
<meta property="og:image" content="https://caracore.com.br/publications/livros/images/guia_de_servicos_cover.png">
<meta name="twitter:image" content="https://caracore.com.br/publications/livros/images/guia_de_servicos_cover.png">

<!-- IMAGENS NO CONTEÚDO -->
<img src="images/CAPA_MANUAL_PY.png" alt="Manual de Serviços" />
<img src="images/PACOTES.png" alt="Pacotes" />
```

#### python_escritorios.html

```html
<!-- META TAGS -->
<meta property="og:image" content="https://caracore.com.br/publications/livros/images/python_escritorios_cover.png">

<!-- IMAGENS NO CONTEÚDO -->
<img src="images/capa.png" alt="Capa do Livro">
<img src="images/contra_capa.png" alt="Contra Capa">
```

#### python_engenharia.html

```html
<!-- META TAGS -->
<meta property="og:image" content="https://caracore.com.br/publications/livros/images/python_engenharia_cover.png">
```

#### tcc.html

```html
<!-- META TAGS -->
<meta property="og:image" content="https://caracore.com.br/publications/livros/images/tcc_cover.png">
```

### secure/

#### approval-requests.html

```html
<link rel="icon" href="/images/favicon.ico" />
```

#### logout.html

```html
<link rel="icon" href="/images/favicon.ico" />
```

---

## 🚨 Recomendação

**NÃO REMOVER** a pasta antiga `d:\dev\site\cara-core\images\` ainda!

Ela contém imagens ainda referenciadas por:

- 5 páginas em `publications/livros/`
- 2 páginas em `secure/`

---

## 📋 Próximos Passos

1. **Migrar publications/livros/**
   - Verificar quais imagens existem em cada pasta local
   - Mover para `assets/images/livros/`
   - Atualizar referências HTML

2. **Migrar secure/**
   - Confirmar se usam favicon.ico já migrado
   - Atualizar paths para `/assets/images/favicon.ico`

3. **Remover pasta antiga**
   - Após confirmar todas as migrações
   - Comando: `Remove-Item 'd:\dev\site\cara-core\images' -Recurse -Force`

4. **Validar em produção**
   - Testar todas as páginas
   - Verificar DevTools Network tab
   - Confirmar imagens carregando corretamente

---

## 📊 Estatísticas

- **Arquivos migrados:** 8 (4 imagens + 4 diagramas)
- **Páginas atualizadas:** 2 (index.html, portfolio.html)
- **Referências corrigidas:** 8
- **Páginas pendentes:** 7
- **Status:** 22% concluído

---

## ✨ Benefícios

1. **Organização:** Todos os assets (CSS, JS, images) em uma estrutura centralizada
2. **Manutenibilidade:** Padrão consistente facilita futuras alterações
3. **Escalabilidade:** Subpastas organizadas por tipo (portfolio/, livros/)
4. **Documentação:** assets/README.md descreve toda a estrutura

---

**Última atualização:** 8 de novembro de 2025
