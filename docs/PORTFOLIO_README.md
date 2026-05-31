# Portfólio — documentação da página

Página pública: [portfolio.html](../portfolio.html) · Estilos: [assets/css/portfolio.css](../assets/css/portfolio.css)

---

## Objetivo

Apresentação **institucional** dos ativos Cara Core: resumo executivo, bloco para leigos, CTAs para a **loja canónica** de cada produto. Conteúdo comercial completo fica nos subdomínios `*.caracore.com.br`.

---

## Estrutura da página (ordem de scroll)

| Secção | ID | Descrição |
|--------|-----|-----------|
| Cabeçalho | `#portfolio-header` | Título + índice categorizado |
| Filosofia Bunker | `#filosofia-bunker` | Soberania, offline, SQLite, loja própria |
| Coexistência PDV | `#pdv-coexistencia` | Java vs Rust + tabela quando escolher |
| Varejo | — | PDV Java, PDV Rust, Ink Agenda |
| Nicho | — | Minerador 4.0 |
| Educação | — | Reino OIDC, Circuito Ferradura |
| Operação | — | Hub, (CSO após infra) |
| Infraestrutura | — | Área 51, Mkt, Seed |
| Garagem | — | CSO, RU Soberano |
| Releases | `#portfolio-releases` | Grid versões + links download |
| Sobre | `#sobre-caracore` | Identidade + ecossistema |
| Contacto | — | CTA para `index.html#contato` |

O **índice no topo** agrupa por categoria (navegação lógica); a ordem no scroll segue divisores `.portfolio-category-divider`.

---

## Padrão por produto

Cada `.project-card` inclui:

1. **`.project-header`** — gradiente por produto (`.pdv`, `.pdv-rust`, `.ink`, …)
2. **Corpo** — duas colunas quando aplicável:
   - `.block-executive` — benefícios de negócio
   - `.block-leigos` — linguagem simples (caixa azul clara)
3. **Botões** `.btn-project` — loja, download, wiki
4. **Voltar ao topo** → `#portfolio-header`

PDV Java — bloco leigos em três subsecções (`.block-leigos-sub`): automático / operador / negócio.

PDV Rust — bloco leigos remete a `#pdv-coexistencia` (sem repetir tabela).

---

## CSS relevante

| Classe | Uso |
|--------|-----|
| `.portfolio-toc` | Índice categorizado no header |
| `.portfolio-bunker` | Bloco filosofia |
| `.portfolio-pdv-coexistence` | Comparativo Java/Rust |
| `.pdv-compare-card` | Cards `.java` e `.rust` |
| `.release-timeline` | Grid de releases |
| `.portfolio-about` | Secção sobre a empresa |
| `.nav-badge-pdv-rust` | Identidade visual linha Rust |

---

## Manutenção

### Novo produto no portfólio

1. Adicionar `<section id="...">` com `.project-card`
2. Entrada no `.portfolio-toc` (categoria correcta)
3. Item em `#portfolio-releases` se houver release pública
4. Actualizar `ecosistema.html` e `ECOSYSTEM_LOJAS.txt`
5. CTA → subdomínio da loja (nunca `/delivery/` como destino principal)

### Alterar PDV Rust

- Loja canónica: **rust-pdv.caracore.com.br**
- Coexistência: editar só `#pdv-coexistencia` + headers dos dois PDVs
- Matriz **sem** `delivery/pdv-rust`

### Diagramas Mermaid

Reino OIDC e Circuito Ferradura usam Mermaid inline; carregado no final de `portfolio.html`.

---

## SEO

- `canonical`: `https://www.caracore.com.br/portfolio.html`
- Meta description menciona PDV Java + Rust
- Links externos: `rel="noopener"` + `target="_blank"` onde aplicável

---

Ver também: [SITE_MATRIZ.md](SITE_MATRIZ.md) · [FONTES_CANONICAS_MATRIZ_LOJAS.md](FONTES_CANONICAS_MATRIZ_LOJAS.md)
