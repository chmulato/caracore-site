# Guia operacional — Site matriz

Referência para editar e publicar **caracore.com.br** sem duplicar conteúdo das lojas.

**Repo:** `caracore-site` · **Domínio:** `www.caracore.com.br`  
**Retomada:** [ECOSYSTEM_MEMORIA.md](ECOSYSTEM_MEMORIA.md) · [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) · [DILEMA.md](DILEMA.md)

**Frase-guia (PT):** *Alocação técnica dedicada ou consultoria por projeto — modelo B2B, código transparente no ambiente do cliente.*

---

## 1. O que é (e o que não é) a matriz

| É | Não é |
|---|--------|
| Home B2B, portfólio, ecossistema, políticas | Vitrine completa de cada produto |
| Prova de entrega (produtos) + engenharia B2B | Lista de stacks como argumento de venda |
| CTAs para subdomínios oficiais | Segunda cópia de wiki/download das lojas |
| Redirects `/delivery/*` → lojas | Canal principal do PDV Rust (use rust-pdv) |
| Área 51 (`/secure/`) | Sala (canónica: tools.caracore.com.br/sala) |
| Variantes `aligned/en/` · `aligned/it/` | Tradução literal de “PJ” |

Regra de ouro: [FONTES_CANONICAS_MATRIZ_LOJAS.md](FONTES_CANONICAS_MATRIZ_LOJAS.md).

---

## 2. Páginas HTML principais

| Ficheiro | Âncoras / notas |
|----------|-----------------|
| `index.html` | `#engenharia-b2b` · `#produtos` · `#sobre` · `#contato` — ver §2.1 |
| `suporte-local.html` | Canal PME (M365, TI local) — **fora** do fluxo B2B |
| `portfolio.html` | `#decisoes-engenharia` · categorias — ver §3 |
| `ecosistema.html` | Mapa produtos, roadmap, prova de entrega B2B |
| `aligned/en/` · `aligned/it/` | B2B engineering — mesma frase-guia adaptada |
| `404.html` | Erro amigável |
| `secure/` | Área 51 OIDC |

### 2.1 Home PT — ordem de secções

1. Hero (B2B + frase-guia)  
2. `#engenharia-b2b` — três pilares de entrega  
3. `#diferenciais` — antifragilidade (híbrido/edge; não anti-cloud)  
4. `#produtos` — Decisão / Stack; link para cases  
5. `#sobre` — **Nossa Operação** (boutique)  
6. `#contato` — horário corporativo B2B; link `suporte-local.html`

**Suporte PME:** `suporte-local.html` — fora do nav principal (rodapé).

---

## 3. Portfólio (`portfolio.html`)

### Fluxo de leitura

1. Cabeçalho + **índice categorizado** (`nav.portfolio-toc`)
2. **Decisões e impacto** (`#decisoes-engenharia`) — 3 mini cases (era IA)
3. **Filosofia Bunker** (`#filosofia-bunker`)
4. **Coexistência PDV** (`#pdv-coexistencia`)
5. Produtos por **divisores de categoria**
6. **Releases e marcos** (`#portfolio-releases`)
7. **Sobre a Cara Core** (`#sobre-caracore`)
8. Contacto

### Categorias no índice

- Varejo e caixa — PDV Java, PDV Rust, Ink Agenda
- Operação — Hub, CSO
- Educação — Reino OIDC, Circuito Ferradura
- Infraestrutura — Área 51, Seed, Sala Cara Core (Mkt)
- Nicho — Minerador 4.0, RU Soberano

Detalhes: [PORTFOLIO_README.md](PORTFOLIO_README.md).

---

## 4. PDV Desktop — comunicação

| | Java | Rust + Tauri 2 |
|---|------|----------------|
| Loja / vitrine | pdv.caracore.com.br | rust-pdv.caracore.com.br |
| Download | loja Java | GitHub Releases |
| Release | **v3.2.2-free** | **v0.1.2** |
| Portfólio | `#caracore-pdv` | `#caracore-pdv-rust` |

Evitar: “PDV v3” sozinho, “substitui”, “nova geração”. Comparação única em `#pdv-coexistencia`.

---

## 5. Redirects (`_redirects` + stubs GitHub Pages)

**Produção actual:** GitHub Pages — não aplica `_redirects` sozinho.

- **`delivery/{produto}/`** — HTML mínimo → loja canónica
- **`_redirects`** / **`vercel.json`** — Netlify/Vercel

Mapa: [MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md](MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md).

---

## 6. Publicação

1. [CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md](CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md)
2. [VALIDACAO_LOJAS_MATRIZ.md](VALIDACAO_LOJAS_MATRIZ.md) se links matriz ↔ loja mudaram
3. Smoke: home → `#engenharia-b2b` → portfólio `#decisoes-engenharia` → loja
4. Validar `aligned/en/` e `aligned/it/` se copy B2B mudou

---

## 7. Documentos operacionais (`docs/`)

| Ficheiro | Uso |
|----------|-----|
| [ECOSYSTEM_CARA_CORE.md](ECOSYSTEM_CARA_CORE.md) | Mapa de repos |
| [ECOSYSTEM_LOJAS.md](ECOSYSTEM_LOJAS.md) | URLs lojas |
| [COMPONENTES_LOJA.md](COMPONENTES_LOJA.md) | Padrão vitrine |
| [STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md](STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md) | Estratégia |
| `.cursor/rules/project-memory.mdc` | Memória Cursor |

---

## 8. Onde editar conteúdo de produto

| Tipo | Onde |
|------|------|
| Texto comercial longo, download, wiki | Repo `caracore-*-releases` |
| Resumo + CTA + case de decisão | `portfolio.html`, `ecosistema.html`, `index.html` |
| Copy B2B institucional | `index.html`, `aligned/` |

Não recriar `delivery/pdv-rust/` na matriz.
