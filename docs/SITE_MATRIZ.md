# Guia operacional — Site matriz

Referência para editar e publicar **caracore.com.br** sem duplicar conteúdo das lojas.

**Repo:** `caracore-site` · **Domínio:** `www.caracore.com.br`

---

## 1. O que é (e o que não é) a matriz

| É | Não é |
|---|--------|
| Home, portfólio, ecossistema, políticas | Vitrine completa de cada produto |
| CTAs para subdomínios oficiais | Segunda cópia de wiki/download das lojas |
| Redirects `/delivery/*` → lojas | Canal principal do PDV Rust (use rust-pdv) |
| Área 51 (`/secure/`) | Sala Cara Core (canónica: tools.caracore.com.br/sala) |

Regra de ouro: [FONTES_CANONICAS_MATRIZ_LOJAS.md](FONTES_CANONICAS_MATRIZ_LOJAS.md).

---

## 2. Páginas HTML principais

| Ficheiro | Âncoras / notas |
|----------|-----------------|
| `index.html` | Cards produtos; links para lojas |
| `portfolio.html` | Índice por categoria; ver secção 3 |
| `ecosistema.html` | Tabela de produtos e URLs |
| `404.html` | Erro amigável |
| `aligned/` | Variantes internacionais (en, it) |

---

## 3. Portfólio (`portfolio.html`)

### Fluxo de leitura

1. Cabeçalho + **índice categorizado** (`nav.portfolio-toc`)
2. **Filosofia Bunker** (`#filosofia-bunker`)
3. **Coexistência PDV** (`#pdv-coexistencia`) — Java vs Rust, tabela “quando escolher”
4. Produtos por **divisores de categoria** (`.portfolio-category-divider`)
5. **Releases e marcos** (`#portfolio-releases`)
6. **Sobre a Cara Core** (`#sobre-caracore`)
7. Contacto

### Categorias no índice

- Varejo e caixa — PDV Java, PDV Rust, Ink Agenda
- Operação — Hub, CSO
- Educação — Reino OIDC, Circuito Ferradura
- Infraestrutura — Área 51, Seed, Sala Cara Core (Mkt)
- Nicho — Minerador 4.0, RU Soberano

### Blocos por produto

- `.block-executive` — visão gestor
- `.block-leigos` — linguagem acessível
- CTAs → **loja** do produto, não `/delivery/`

Detalhes: [PORTFOLIO_README.md](PORTFOLIO_README.md).

---

## 4. PDV Desktop — comunicação

| | Java | Rust + Tauri 2 |
|---|------|----------------|
| Loja / vitrine | pdv.caracore.com.br | **rust-pdv.caracore.com.br** |
| Download | loja Java | **GitHub Releases** (`caracore-rust-pdv-releases`) |
| Release | v3.1.2-free | v0.1.1 |
| Portfólio | `#caracore-pdv` | `#caracore-pdv-rust` |

Evitar: “PDV v3” sozinho, “substitui”, “nova geração”. Usar `#pdv-coexistencia` em vez de repetir comparação em cada bloco.

---

## 5. Redirects (`_redirects` + stubs GitHub Pages)

**Produção actual:** GitHub Pages (`www.caracore.com.br`) — não aplica `_redirects` nem `vercel.json`.

- **`delivery/{produto}/`** — apenas HTML mínimo de redirect (meta refresh + `location.replace`) para a loja canónica; sem vitrine duplicada.
- **`_redirects`** / **`vercel.json`** — mesma lógica para Netlify/Vercel se o hospedeiro mudar.

Exemplos:

```text
/delivery/pdv-rust/   →  https://rust-pdv.caracore.com.br/
/delivery/pdv/        →  https://pdv.caracore.com.br/
/delivery/sala/       →  https://tools.caracore.com.br/sala/
```

Mapa completo: [MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md](MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md).

---

## 6. Publicação

1. Revisar [CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md](CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md)
2. CTAs novos → subdomínio da loja
3. `sitemap.xml` / canonical se página nova indexável
4. Smoke: home → portfólio → ecossistema → uma loja
5. Testar redirect legado se tocado em `_redirects`

---

## 7. Ficheiros de referência na raiz

| Ficheiro | Uso |
|----------|-----|
| `ECOSYSTEM_CARA_CORE.txt` | Mapa de repos |
| `ECOSYSTEM_LOJAS.txt` | URLs lojas |
| `COMPONENTES_LOJA.txt` | Padrão vitrine (nos repos *-releases) |
| `.cursor/rules/project-memory.mdc` | Memória Cursor |

---

## 8. Onde editar conteúdo de produto

| Tipo | Onde |
|------|------|
| Texto comercial longo, download, wiki | Repo `caracore-*-releases` |
| Resumo + CTA institucional | `portfolio.html`, `ecosistema.html`, `index.html` |
| PDV Rust (sem SEED na loja) | `caracore-pdv-rust-releases` |

Não recriar `delivery/pdv-rust/` na matriz.
