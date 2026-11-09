# Portfólio — documentação da página

Página pública: [portfolio.html](../portfolio.html) · Estilos: [assets/css/portfolio.css](../assets/css/portfolio.css)

---

## Objetivo

Comunicar **negócio antes de engenharia**: em menos de 10 segundos o visitante identifica os quatro produtos principais (PDV, CSO, Hub, Ink Agenda), para quem servem e qual problema resolvem. Versões, releases, hashes, gates e stack ficam em blocos recolhíveis, sem sair da página. O conteúdo comercial completo continua nos subdomínios `*.caracore.com.br`.

---

## Estrutura da página (ordem de scroll)

| Secção | ID | Descrição |
|--------|-----|-----------|
| Hero | `#portfolio-header` | Título, subtítulo, CTA "Conheça os produtos" e atalhos |
| Produtos principais | `#produtos-principais` | Quatro cards grandes: PDV, CSO, Hub, Ink Agenda (`#caracore-pdv`, `#caracore-cso`, `#caracore-hub`, `#caracore-ink-agenda`) |
| Diferenciais | `#diferenciais` | Seis cards sobre a filosofia comum (`#filosofia-bunker` é o anchor histórico) |
| Ecossistema | `#ecossistema-projetos` | Quatro grupos recolhíveis: Pesquisa e Laboratório, Educação e Conteúdo, Ferramentas Complementares, Iniciativas Experimentais |
| Engenharia e releases | `#engenharia` | Seis acordeões: catálogo (`#catalogo`), releases (`#portfolio-releases`), homologação PDV (`#eng-pdv`), homologação Hub (`#eng-hub`), fichas completas (`#eng-fichas`), decisões (`#decisoes-engenharia`) |
| Sobre | `#sobre-caracore` | Identidade + ecossistema |
| Contacto | — | CTA para `index.html#contato` |

`#pdv-coexistencia` continua a existir dentro do acordeão de decisões de engenharia, preservando os links antigos.

---

## Padrão por bloco

### Produto principal — `article.pf-core-card`

1. `.pf-core-head` — faixa colorida por produto (`--pdv`, `--cso`, `--hub`, `--ink`) com `PRODUTO 0x`, selo de status, nome, subtítulo e "Para quem"
2. `.pf-core-body` — "O que resolve", duas colunas (Benefícios · Principais recursos)
3. `.pf-core-more` — escopo e limites do plano, recolhido
4. `.pf-core-footnote` — status honesto (v4.0.0 atual × 3.2.12-free anterior)
5. `.pf-core-actions` — CTA da loja, download e âncora para a homologação (`#eng-pdv`, `#eng-hub`)

### Projeto secundário — `details.eco-item`

O bloco legado (`.project-card` completo, com gradiente, visão executiva, bloco para leigos e CTAs) é mantido **byte a byte** dentro de `.eco-item-body`; o CSS neutraliza o gradiente e o peso visual. O `summary` traz nome, selo de estágio e uma linha de descrição. Nenhum projeto secundário pode receber tratamento visual igual ao dos quatro principais.

### Bloco técnico — `details.eng-item`

`summary` com título e metadados; corpo com tabelas, hashes, listas de gates e links. `details.eng-sub` para níveis extras (ex.: integridade dos ZIPs).

### Arquivo de fichas — `#eng-fichas`

Os blocos originais completos de PDV, CSO e Hub (visão executiva, bloco para leigos, faixas de tecnologia, links de homologação e de release) ficam preservados **byte a byte** dentro de `#eng-fichas`, em três `details.eng-sub` — são a origem do texto enxugado dos cards comerciais. O card do Ink Agenda (PRODUTO 04, desde 09/11/2026) foi escrito direto, sem ficha legada a preservar. A classe `.legacy-produto` neutraliza o peso visual (sem gradiente, títulos em cinza, selos discretos). Não duplicar ali conteúdo novo: o que muda de versão vai para `#eng-pdv`/`#eng-hub`, e o texto comercial, para os cards.

---

## CSS relevante

| Classe | Uso |
|--------|-----|
| `.pf-hero*` | Hero da página |
| `.pf-section`, `.pf-section--alt` | Ritmo e faixas de fundo das secções |
| `.pf-core-card*` | Cards dos quatro produtos principais |
| `.pf-diff-grid`, `.pf-diff-card` | Diferenciais |
| `.pf-eco-group`, `.eco-item*` | Grupos e itens do ecossistema |
| `.eng-item*` | Acordeões de engenharia |
| `.legacy-produto` | Neutraliza o peso visual dos blocos legados preservados (ecossistema e fichas) |
| `.portfolio-secondary` | Sub-acordeões dentro dos blocos técnicos |
| `.release-timeline`, `.portfolio-releases` | Grid de versões |
| `.portfolio-about` | Secção sobre a empresa |

`#diferenciais.pf-section--alt` neutraliza a regra `#diferenciais` de `main.css` (gradiente verde da home) — não remover essa sobreposição.

---

## Manutenção

### Novo produto no portfólio

1. **Produto principal:** novo `article.pf-core-card` em `#produtos-principais`, com faixa própria em `portfolio.css`
2. **Projeto secundário:** novo `details.eco-item` no grupo adequado de `#ecossistema-projetos`
3. Item em `#portfolio-releases` se houver release pública
4. Actualizar `ecosistema.html`, `assets/js/catalog-data.js` e `ECOSYSTEM_LOJAS.md`
5. CTA → subdomínio da loja (nunca `/delivery/` como destino principal)

### Alterar PDV Rust

- Loja canónica: **pdv-rust.caracore.com.br**
- Coexistência: editar `#pdv-coexistencia` (dentro de `#decisoes-engenharia`) e o card do PDV
- Matriz **sem** `delivery/pdv-rust`

### Âncoras e recolhimento

Os IDs vivem em `<details>` aninhados. O script no fim da página abre todos os `details` ancestrais do alvo ao chegar por hash — manter esse comportamento ao mexer na estrutura.

### Diagramas Mermaid

Reino OIDC e Circuito Ferradura usam Mermaid inline (dentro de `details` recolhidos); carregado no final de `portfolio.html`.

---

## SEO

- `canonical`: `https://www.caracore.com.br/portfolio.html`
- Title e meta description citam PDV, CSO, Hub e Ink Agenda
- Links externos: `rel="noopener"` + `target="_blank"` onde aplicável
- `portfolio.css` é referenciado com `?v=AAAAMMDD` para invalidar cache do GitHub Pages

---

Ver também: [SITE_MATRIZ.md](SITE_MATRIZ.md) · [FONTES_CANONICAS_MATRIZ_LOJAS.md](FONTES_CANONICAS_MATRIZ_LOJAS.md)
