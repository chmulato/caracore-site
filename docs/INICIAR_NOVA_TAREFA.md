# Iniciar nova tarefa — ecossistema Cara Core

Guia de **produtividade** para retomar trabalho dias ou semanas depois. Leia em 3–5 minutos antes de abrir código.

**Índice mestre:** [ECOSYSTEM_MEMORIA.md](ECOSYSTEM_MEMORIA.md)  
**Fonte IAs:** `D:\onedrive\dev\AGENTS.md` · Cursor: `.cursor/rules/ecosystem-cara-core.mdc`  
**Atualizado:** 2026-08-26  
**Workspace típico:** `D:\dev\` ou `D:\onedrive\dev` (repos irmãos)

---

## 1. Antes de qualquer coisa

| Passo | Ação |
|-------|------|
| 0 | Ler `AGENTS.md` na raiz (produtos-chave PDV · CSO · Hub e discurso honesto) |
| 1 | Abrir `caracore-site/docs/ECOSYSTEM_MEMORIA.md` (visão actual) |
| 1b | Posicionamento B2B: `docs/DILEMA.md` · frase-guia em hero e `#engenharia-b2b` |
| 2 | Abrir `.cursor/rules/project-memory.mdc` **do repo onde vai trabalhar** |
| 3 | Confirmar **qual camada** edita: matriz · loja · oficina · wiki · retrô · releases GitHub |
| 4 | **Não** usar `/delivery/` nem `wiki.caracore.com.br/portfolio.html` em CTAs novos |

**Portfólio institucional:** sempre `https://www.caracore.com.br/portfolio.html` (âncoras `#decisoes-engenharia`, `#caracore-pdv`, `#caracore-pdv-rust`, `#pdv-coexistencia`).

---

## 2. Escolha o fluxo pelo tipo de tarefa

### Matriz institucional (`caracore-site`)

| Ler | Ficheiro |
|-----|----------|
| Posicionamento | `docs/DILEMA.md` |
| Operação | `docs/SITE_MATRIZ.md` |
| Portfólio | `docs/PORTFOLIO_README.md` · `portfolio.html` |
| Pré-deploy | `docs/CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md` |
| Redirects | `docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md` · `_redirects` |
| Validação | `scripts/run-site-validation.ps1` |

**PDV Rust na matriz:** CTAs → tag GitHub v0.1.2 (não `/latest`); coexistência em `#pdv-coexistencia`.

---

### Loja Hub (`caracore-hub-releases`)

| URL | https://hub.caracore.com.br/ |
| O que é | Encomendas (ML, Shopee, Temu) — não Flask, não “central telefônica” |
| GA | Instalador Windows 06/04/2027 (SQLite). Oficina web 2.1 ainda PostgreSQL |
| Oficina | `caracore-hub` |
| Matriz | `#caracore-hub` |
| Wiki alinhamento | wiki.caracore.com.br/projeto-hub.html |
| Wiki uso | wiki.caracore.com.br/hub/ |

---

### Oficina Hub (`caracore-hub`)

| Ler | Ficheiro |
|-----|----------|
| Retomada (GA 2027) | `docs/contexto-rapido.md` |
| Status web 2.1 | `project_hub/docs/STATUS-ATUAL.md` |
| Cursor | `.cursor/rules/project-memory.mdc` · `ga-windows-2027.mdc` |
| SQLite | `project_hub/docs/INDEX_SQLITE.md` |
| Desktop | `electron/README.md` |
| Ecossistema | `../caracore-site/docs/ECOSYSTEM_MEMORIA.md` |

**Foco até 06/04/2027:** instalador EXE + SQLite local. Não reescrever as fases 1–5 da WAR. Não commitar salvo pedido explícito.

**Wiki:** manual operacional em `caracore-wiki/docs/hub/` (público).

---

### CSO (`caracore-cso-quarkus` + `caracore-cso-transportes`)

| URL canónica | https://cso.caracore.com.br/ (aplicação Frotas; **sem** vitrine Pages) |
| Frotas | Produção · oficina `caracore-cso-quarkus` |
| Transportes | Garagem 08/11/2028 · oficina `caracore-cso-transportes` |
| Discurso | CSO ≠ GPS. Virtual Tracker™ é produto separado, 2028 |
| Wiki alinhamento | wiki.caracore.com.br/projeto-cso.html |

---

### Loja PDV Java (`caracore-pdv-releases`)

| URL | https://pdv.caracore.com.br/ |
| Canal | v3.2.2-free |
| Oficina | `caracore-pdv` |
| Matriz | `#caracore-pdv` |

---

### Loja PDV Rust (`caracore-pdv-rust-releases`)

| URL vitrine | https://rust-pdv.caracore.com.br/ |
| Download oficial | https://github.com/chmulato/caracore-pdv-releases/releases/tag/v0.1.2 (**não** `/latest`) |
| Oficina | `caracore-pdv-rust` |
| Matriz | `#caracore-pdv-rust` |

**Nav loja:** Formatos → `download.html` · botões de download → tag **v0.1.2**, nunca `releases/latest` (latest = Java).

---

### Oficina PDV Rust (`caracore-pdv-rust`)

| Ler | Ficheiro |
|-----|----------|
| Retomada rápida | `docs/contexto-rapido.md` |
| Estado técnico | `docs/status.md` · `docs/aplicativo.md` |
| Cursor | `.cursor/rules/caracore-pdv-continuacao.mdc` |
| Ecossistema | `../caracore-site/docs/ECOSYSTEM_MEMORIA.md` |

**Comandos frequentes:**

```powershell
python tools/backend_validation_flow.py --skip-postgres
cd apps/desktop-tauri; npm test
python tools/sync_docs_status.py --full
```

**Release:** `python tools/run_release_delivery_oneclick.py --tag v0.1.2` · publicar loja: `python tools/publish_portal_assets_loja.py --push`

**Regra oficina:** não commitar salvo pedido explícito do usuário.

---

### Wiki (`caracore-wiki`)

| URL | https://wiki.caracore.com.br/ |
| Publicação | `docs/` → GitHub Pages |
| Papel | Documentação de **todos** os produtos (alinhamento + manuais). Lojas só vitrine/download/feedback; `/wiki/` nas lojas redireciona para cá. |
| Portfólio nos links | **www.caracore.com.br** (não wiki) |
| Eco Mundo wiki | `docs/ecosistema.html` |
| Hub PDV | `projeto-pdv.html` · `projeto-pdv-rust.html` · manuais Java em `docs/pdv/` |
| CSO | `projeto-cso.html` (Frotas + Transportes; ≠ GPS) |
| Hub | `projeto-hub.html` · manual de uso em `docs/hub/` (encomendas; GA 06/04/2027) |

Redirect legado: `docs/portfolio.html` → matriz.

---

### Retrô (`caracore-retro`)

| URL | https://retro.caracore.com.br/ |
| Artigo | `docs/articles/YYYY_MM_DD_article_NN.html` |
| Imagem | `docs/articles/assets/img/..._NN_01.png` (inline: `max-width:300px; float:right`) |
| Prompt capa | `..._PROMPT_IMAGEM.txt` (geração 16:9) |
| Índice | `docs/index.html` · `docs/feed.xml` · `docs/ciclo-ativo.html` |
| Recentes | **115** B2B/IA (25/12) · **114** PDV Rust (20/12) |

---

### Editorial / comunicação PDV

| Canal | Onde |
|-------|------|
| Matriz | `portfolio.html` · `ecosistema.html` |
| Loja Rust | `caracore-pdv-rust-releases/docs/` |
| Wiki | `caracore-wiki/docs/projeto-pdv*.html` |
| Retrô | art. **115** — B2B/IA, portal PJ, FinOps/híbrido · art. **114** — PDV Rust/Tauri coexistência |
| Matriz editorial | `#engenharia-b2b` · `#decisoes-engenharia` · `suporte-local.html` (PME separado) |
| Discurso | dois PDVs desktop; **não** “migração obrigatória”; evitar “PDV v3” sozinho |

---

## 3. Mapa de URLs (não confundir)

| Papel | URL correta | URL errada comum |
|-------|-------------|------------------|
| Matriz / portfólio | www.caracore.com.br/portfolio.html | wiki.caracore.com.br/portfolio.html |
| Eco Mundo (matriz) | www.caracore.com.br/ecosistema.html | — |
| Eco Mundo (wiki) | wiki.caracore.com.br/ecosistema.html | — |
| Download PDV Rust | github.com/chmulato/caracore-pdv-releases/releases/tag/v0.1.2 | `/releases/latest` (Java) ou `caracore-rust-pdv-releases/releases` |
| CTAs legado | — | www.caracore.com.br/delivery/... |

---

## 4. Ao fechar a tarefa (checklist mínimo)

- [ ] Versão/copy alinhados entre **oficina ↔ loja ↔ matriz ↔ wiki** (se tocou produto)
- [ ] `VALIDACAO_LOJAS_MATRIZ.md` (se mudou links matriz/loja)
- [ ] Oficina Rust: `python tools/sync_docs_status.py --full` se mudança relevante
- [ ] Atualizar `ECOSYSTEM_MEMORIA.md` se mudou **regra de ecossistema** (repo, URL, release)
- [ ] Atualizar `project-memory.mdc` do repo trabalhado
- [ ] Smoke manual: home → portfólio → loja ou releases → voltar

---

## 5. Armadilhas que custam tempo

1. **Tratar Rust como substituto do Java** — são linhas paralelas (v3.2.x ≠ v0.1.x).
2. **Usar `/releases/latest` no PDV Rust** — latest de `caracore-pdv-releases` é o canal **Java**. Usar a tag **v0.1.2**.
3. **Descrever Hub como Flask / central telefônica** — Hub é encomendas (Jakarta EE). Flask é Área 51.
4. **Vender CSO como GPS** — Frotas é gestão administrativa; Virtual Tracker™ é produto separado.
5. **Duplicar vitrine longa na matriz** — resumo + CTA para loja.
6. **Esquecer push da loja** após mudar `caracore-pdv-rust-releases` (Pages demora minutos).
7. **Misturar suporte PME na home B2B** — M365/antivírus/horários noite ficam em `suporte-local.html`.
8. **Tom xiita anti-cloud na vitrine** — usar híbrido/FinOps/resiliência; ideologia fica para backlog wiki/retrô/lojas.
9. **Commit na oficina** sem pedido explícito do usuário.

---

## 6. Documentos por profundidade

| Necessidade | Documento |
|-------------|-----------|
| Visão 30 s | `ECOSYSTEM_MEMORIA.md` |
| IAs (Cursor e outras) | `D:\onedrive\dev\AGENTS.md` |
| Esta página (fluxos) | `INICIAR_NOVA_TAREFA.md` |
| Mapa repos | `ECOSYSTEM_CARA_CORE.md` |
| URLs lojas | `ECOSYSTEM_LOJAS.md` |
| Estratégia | `STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md` |
| Índice docs matriz | `INDEX.md` |

---

Cara Core Informática — uso interno.
