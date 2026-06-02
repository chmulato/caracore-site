# Memória do ecossistema — retomada de desenvolvimento

Referência única para alinhar **matriz**, **lojas**, **oficinas**, **wiki**, **retrô** e **releases** num segundo ciclo de trabalho.

**Atualizado:** 2026-06-02  
**Workspace típico:** `D:\dev\` (repos lado a lado)

---

## Retomada em 30 segundos

1. **Índice vivo (este ficheiro):** `caracore-site/docs/ECOSYSTEM_MEMORIA.md`
2. **Mapa de repos:** `caracore-site/ECOSYSTEM_CARA_CORE.txt` · **URLs lojas:** `ECOSYSTEM_LOJAS.txt`
3. **Memória Cursor por repo:** `.cursor/rules/project-memory.mdc` (tabela abaixo)
4. **PDV Rust oficina:** `caracore-pdv-rust/docs/status.md` + `.cursor/rules/caracore-pdv-continuacao.mdc`
5. **Dois PDVs:** Java maduro (`pdv.*`) + Rust piloto (`rust-pdv.*` + **GitHub Releases**) — **coexistência**, sem substituição

---

## Modelo fixo (desde maio/2026)

| Camada | O quê | Repositório | URL / destino |
|--------|--------|-------------|----------------|
| **Matriz** | Institucional, portfólio | `caracore-site` | https://www.caracore.com.br/ |
| **Loja** | Vitrine, wiki produto | `caracore-*-releases` | `*.caracore.com.br` |
| **Releases (artefatos)** | Binários verificados | GitHub `*-releases` (ex. PDV Rust) | github.com/chmulato/... |
| **Oficina** | Código, CI, testes | `caracore-{produto}` | local / privado |
| **Wiki** | Trilhas institucionais | `caracore-wiki` | https://wiki.caracore.com.br/ |
| **Retrô** | Artigos LinkedIn / editorial | `caracore-retro` | https://retro.caracore.com.br/ |
| **Sala (operações)** | Campanhas, manuais rede | `caracore-site` `sala/` + `caracore-mkt` | https://tools.caracore.com.br/sala/ |

**Regras:**

- CTAs novos → **loja** ou **GitHub Releases** (PDV Rust); nunca `/delivery/` como destino principal.
- Matriz → `portfolio.html#{âncora}`; comparação PDV → `#pdv-coexistencia`.
- Duas linhas **CaraCore PDV Desktop:** Java (maduro) + Rust (piloto); **nenhuma substitui a outra**.

---

## PDV Desktop — mapa rápido (jun/2026)

| Papel | Repo | URL / release |
|-------|------|----------------|
| Oficina Java | caracore-pdv | — |
| Loja Java | caracore-pdv-releases | pdv.caracore.com.br · **v3.1.2-free** |
| Oficina Rust | caracore-pdv-rust | `D:\dev\caracore-pdv-rust` |
| Loja Rust (vitrine) | caracore-pdv-rust-releases | rust-pdv.caracore.com.br · nav Download → GitHub |
| Artefatos Rust | caracore-rust-pdv-releases | releases · **v0.1.1** multi-OS |
| Matriz | caracore-site | #caracore-pdv-rust · #pdv-coexistencia |
| Wiki | caracore-wiki | projeto-pdv.html · projeto-pdv-rust.html |
| Retrô (comunicação) | caracore-retro | artigo **114** (20/12/2026) — Rust/Tauri, coexistência |

**Loja Rust:** download oficial = GitHub; página **Formatos** = NSIS/MSI/ZIP. **Sem SEED** na vitrine.

---

## Âncoras do portfólio (matriz)

| Produto | Âncora |
|---------|--------|
| PDV Java | `#caracore-pdv` |
| PDV Rust | `#caracore-pdv-rust` |
| Coexistência PDV | `#pdv-coexistencia` |
| Hub | `#caracore-hub` |
| Minerador 4.0 | `#minerador-ete` |
| Reino OIDC | `#reino-oidc` |
| Circuito Ferradura | `#circuito-python` |
| Ink Agenda | `#caracore-ink-agenda` |
| Seed | `#caracore-seed` |
| Área 51 | `#area-51` |
| RU Soberano | `#caracore-ru` |
| CSO | `#caracore-cso` |
| MKT / Sala | `#caracore-mkt` |

---

## Memória Cursor (`.cursor/rules/project-memory.mdc`)

| Repo | Papel |
|------|--------|
| **caracore-site** | Matriz · ECOSYSTEM_* na raiz |
| **caracore-wiki** | Wiki institucional |
| **caracore-retro** | Retrô LinkedIn (103 artigos) |
| caracore-pdv | Oficina PDV Java |
| caracore-pdv-releases | Loja PDV Java |
| caracore-pdv-rust | Oficina PDV Rust (+ `caracore-pdv-continuacao.mdc`) |
| caracore-pdv-rust-releases | Loja PDV Rust |
| caracore-hub / *-releases | Hub |
| caracore-ete / *-releases | Minerador 4.0 |
| caracore-circuito / *-releases | Circuito |
| caracore-oidc / *-releases | Reino OIDC |
| caracore-area51 / *-releases | Área 51 |
| caracore-ink / *-releases | Ink (+ memoria-projeto.txt na oficina) |
| caracore-ru / *-releases | RU |
| caracore-cso / *-releases | CSO |
| caracore-mkt / *-releases | MKT / Sala |
| caracore-seed / *-releases | Seed (vitrine, app interna) |

**Oficina PDV Rust — regra extra:** `caracore-pdv-continuacao.mdc` (estado técnico, gates, auth).

---

## Comunicação e editorial (2026)

| Canal | Repo | Notas |
|-------|------|--------|
| Retrô | caracore-retro | `docs/articles/YYYY_MM_DD_article_NN.html` · imagem `*_NN_01.png` · prompt `*_PROMPT_IMAGEM.txt` |
| Artigo PDV Rust | 114 · 20/12/2026 | Duas linhas no balcão — leitura leve + tabela TI no final |
| Matriz publicada | caracore-site | PDV Rust v0.1.1 · CTAs → GitHub Releases (commit ~jun/2026) |

---

## Checklists antes de publicar

1. `VALIDACAO_LOJAS_MATRIZ.txt` — matriz ↔ lojas  
2. `VALIDACAO_NEGOCIO.txt` — produtos, preços, fluxos  
3. `docs/CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md` — deploy matriz  
4. Loja Rust: `releases.js` + nav Download → GitHub  
5. Oficina Rust: `python tools/sync_docs_status.py --full` após mudanças relevantes  
6. Smoke: home → portfólio → loja/releases → portfólio (footer)

---

## Documentos na matriz (fonte viva)

- `docs/INDEX.md` · `docs/SITE_MATRIZ.md` · `docs/PORTFOLIO_README.md` · `docs/memoria-projeto.txt`
- `ECOSYSTEM_CARA_CORE.txt` · `ECOSYSTEM_LOJAS.txt` · `COMPONENTES_LOJA.txt`
- `STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.txt`
- `docs/archive/` — histórico; **não** operação diária

---

## Espelho interno (`mirror-delivery.html`)

Lojas: **Ink**, **RU**, **MKT**, **Reino OIDC**. Demais: footer → `portfolio.html#{âncora}`.

---

Cara Core Informática — uso interno. Ao alterar ecossistema, atualizar **este ficheiro** e o `project-memory.mdc` do repo em que estiver a trabalhar.
