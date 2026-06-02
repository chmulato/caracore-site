# Memória do ecossistema — retomada de desenvolvimento

Referência única para alinhar **matriz**, **lojas**, **oficinas** e **wiki** num segundo ciclo de trabalho.

**Atualizado:** 2026-06-02

---

## Modelo fixo (desde maio/2026)

| Camada | O quê | Onde editar conteúdo comercial longo |
|--------|--------|--------------------------------------|
| **Matriz** | Apresentação institucional | `caracore-site` — home, portfólio, ecossistema |
| **Loja** | Vitrine, download, wiki do produto | `caracore-*-releases/docs/` → `*.caracore.com.br` |
| **Oficina** | Código, CI, releases | `caracore-{produto}` |
| **Wiki** | Trilhas institucionais | `caracore-wiki/docs/` → wiki.caracore.com.br |

**Regras:**

- CTAs novos → **subdomínio da loja**, nunca `/delivery/` como destino principal.
- Matriz → **portfólio** (`portfolio.html#{âncora}`), não portal delivery.
- URL legada `/delivery/{produto}/` → redirect (stubs HTML na matriz + `_redirects` / `vercel.json`).
- Duas linhas **CaraCore PDV Desktop**: Java (maduro) + Rust (piloto); **nenhuma substitui a outra**. Comparação única: `#pdv-coexistencia`.

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

## Lojas canónicas

Ver `ECOSYSTEM_LOJAS.txt`. PDV: **pdv.** e **rust-pdv.** (domínios distintos). Download Rust: **GitHub Releases** (`caracore-rust-pdv-releases`); loja Rust = vitrine + formatos.

## PDV Rust — camadas (jun/2026)

| Camada | Repo / URL |
|--------|------------|
| Matriz | caracore-site — `#caracore-pdv-rust`, CTAs → releases |
| Loja | caracore-pdv-rust-releases → rust-pdv.caracore.com.br |
| Releases | github.com/chmulato/caracore-rust-pdv-releases — **v0.1.1** |
| Oficina | caracore-pdv-rust |

---

## Ficheiros de memória Cursor (`.cursor/rules/project-memory.mdc`)

| Repo | Papel |
|------|--------|
| caracore-site | Matriz |
| caracore-wiki | Wiki institucional |
| caracore-pdv | Oficina PDV Java |
| caracore-pdv-releases | Loja PDV Java |
| caracore-pdv-rust | Oficina PDV Rust |
| caracore-pdv-rust-releases | Loja PDV Rust |
| caracore-hub | Oficina Hub |
| caracore-hub-releases | Loja Hub |
| caracore-ete | Oficina Minerador 4.0 |
| caracore-ete-releases | Loja ETE |
| caracore-circuito | Oficina Circuito |
| caracore-circuito-releases | Loja Circuito |
| caracore-area51 | Oficina Área 51 |
| caracore-area51-releases | Loja Área 51 |
| caracore-cso | Oficina CSO |
| caracore-cso-releases | Loja CSO |
| caracore-mkt | Oficina MKT |
| caracore-mkt-releases | Loja MKT |
| caracore-ru | Oficina RU |
| caracore-ru-releases | Loja RU |
| caracore-ink | Oficina Ink (+ `docs/memoria-projeto.txt`) |
| caracore-ink-releases | Loja Ink |
| caracore-oidc | Oficina OIDC (+ `docs/memoria-projeto.txt`) |
| caracore-oidc-releases | Loja OIDC |
| caracore-seed | Oficina Seed (+ `docs/memoria-projeto.txt`) |
| caracore-seed-releases | Loja Seed |

---

## Checklists antes de publicar

1. `VALIDACAO_LOJAS_MATRIZ.txt` — matriz ↔ lojas
2. `VALIDACAO_NEGOCIO.txt` — produtos, preços, fluxos
3. `docs/CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md` — deploy matriz
4. Smoke: home → portfólio → loja → portfólio (footer)

---

## Documentos na matriz (fonte viva)

- `docs/INDEX.md` · `docs/SITE_MATRIZ.md` · `docs/PORTFOLIO_README.md`
- `ECOSYSTEM_CARA_CORE.txt` · `ECOSYSTEM_LOJAS.txt` · `COMPONENTES_LOJA.txt`
- `docs/archive/` — histórico (OAuth, migração delivery); **não** usar como operação diária

---

## Espelho interno (`mirror-delivery.html`)

Lojas com documento de alinhamento matriz ↔ vitrine: **Ink**, **RU**, **MKT**, **Reino OIDC**. Demais produtos: footer da loja com link ao portfólio.

---

Cara Core Informática — uso interno.
