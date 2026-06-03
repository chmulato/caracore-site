# Iniciar nova tarefa — ecossistema Cara Core

Guia de **produtividade** para retomar trabalho dias ou semanas depois. Leia em 3–5 minutos antes de abrir código.

**Índice mestre:** [ECOSYSTEM_MEMORIA.md](ECOSYSTEM_MEMORIA.md)  
**Atualizado:** 2026-06-02  
**Workspace típico:** `D:\dev\` (repos irmãos)

---

## 1. Antes de qualquer coisa

| Passo | Ação |
|-------|------|
| 1 | Abrir `caracore-site/docs/ECOSYSTEM_MEMORIA.md` (visão atual) |
| 2 | Abrir `.cursor/rules/project-memory.mdc` **do repo onde vai trabalhar** |
| 3 | Confirmar **qual camada** edita: matriz · loja · oficina · wiki · retrô · releases GitHub |
| 4 | **Não** usar `/delivery/` nem `wiki.caracore.com.br/portfolio.html` em CTAs novos |

**Portfólio institucional:** sempre `https://www.caracore.com.br/portfolio.html` (âncoras `#caracore-pdv`, `#caracore-pdv-rust`, `#pdv-coexistencia`).

---

## 2. Escolha o fluxo pelo tipo de tarefa

### Matriz institucional (`caracore-site`)

| Ler | Ficheiro |
|-----|----------|
| Operação | `docs/SITE_MATRIZ.md` |
| Portfólio | `docs/PORTFOLIO_README.md` · `portfolio.html` |
| Pré-deploy | `docs/CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md` |
| Redirects | `docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md` · `_redirects` |
| Validação | `scripts/run-site-validation.ps1` |

**PDV Rust na matriz:** CTAs → GitHub Releases; coexistência em `#pdv-coexistencia`.

---

### Loja PDV Java (`caracore-pdv-releases`)

| URL | https://pdv.caracore.com.br/ |
| Canal | v3.1.2-free |
| Oficina | `caracore-pdv` |
| Matriz | `#caracore-pdv` |

---

### Loja PDV Rust (`caracore-pdv-rust-releases`)

| URL vitrine | https://rust-pdv.caracore.com.br/ |
| Download oficial | https://github.com/chmulato/caracore-rust-pdv-releases/releases |
| Oficina | `caracore-pdv-rust` |
| Matriz | `#caracore-pdv-rust` |

**Nav loja:** Download → GitHub · **Formatos** → `download.html` · `releases.js` + `portal.js`.

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
| Portfólio nos links | **www.caracore.com.br** (não wiki) |
| Eco Mundo wiki | `docs/ecosistema.html` |
| Hub PDV | `projeto-pdv.html` · `projeto-pdv-rust.html` |

Redirect legado: `docs/portfolio.html` → matriz.

---

### Retrô (`caracore-retro`)

| URL | https://retro.caracore.com.br/ |
| Artigo | `docs/articles/YYYY_MM_DD_article_NN.html` |
| Imagem | `docs/articles/assets/img/..._NN_01.png` |
| Índice | `docs/index.html` · `docs/feed.xml` · `docs/ciclo-ativo.html` |

---

### Editorial / comunicação PDV

| Canal | Onde |
|-------|------|
| Matriz | `portfolio.html` · `ecosistema.html` |
| Loja Rust | `caracore-pdv-rust-releases/docs/` |
| Wiki | `caracore-wiki/docs/projeto-pdv*.html` |
| Retrô | ex. artigo 114 — PDV Rust/Tauri coexistência |
| Discurso | dois PDVs desktop; **não** “migração obrigatória”; evitar “PDV v3” sozinho |

---

## 3. Mapa de URLs (não confundir)

| Papel | URL correta | URL errada comum |
|-------|-------------|------------------|
| Matriz / portfólio | www.caracore.com.br/portfolio.html | wiki.caracore.com.br/portfolio.html |
| Eco Mundo (matriz) | www.caracore.com.br/ecosistema.html | — |
| Eco Mundo (wiki) | wiki.caracore.com.br/ecosistema.html | — |
| Download PDV Rust | github.com/.../caracore-rust-pdv-releases/releases | só rust-pdv para binário |
| CTAs legado | — | www.caracore.com.br/delivery/... |

---

## 4. Ao fechar a tarefa (checklist mínimo)

- [ ] Versão/copy alinhados entre **oficina ↔ loja ↔ matriz ↔ wiki** (se tocou produto)
- [ ] `VALIDACAO_LOJAS_MATRIZ.txt` (se mudou links matriz/loja)
- [ ] Oficina Rust: `python tools/sync_docs_status.py --full` se mudança relevante
- [ ] Atualizar `ECOSYSTEM_MEMORIA.md` se mudou **regra de ecossistema** (repo, URL, release)
- [ ] Atualizar `project-memory.mdc` do repo trabalhado
- [ ] Smoke manual: home → portfólio → loja ou releases → voltar

---

## 5. Armadilhas que custam tempo

1. **Tratar Rust como substituto do Java** — são linhas paralelas (v3.1.x ≠ v0.1.x).
2. **Colocar download só na loja Rust** — artefatos oficiais ficam no **GitHub Releases**.
3. **Duplicar vitrine longa na matriz** — resumo + CTA para loja.
4. **Esquecer push da loja** após mudar `caracore-pdv-rust-releases` (Pages demora minutos).
5. **Commit na oficina Rust** sem pedido explícito do usuário (regra da oficina).

---

## 6. Documentos por profundidade

| Necessidade | Documento |
|-------------|-----------|
| Visão 30 s | `ECOSYSTEM_MEMORIA.md` |
| Esta página (fluxos) | `INICIAR_NOVA_TAREFA.md` |
| Mapa repos | `../ECOSYSTEM_CARA_CORE.txt` |
| URLs lojas | `../ECOSYSTEM_LOJAS.txt` |
| Estratégia | `../STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.txt` |
| Índice docs matriz | `INDEX.md` |

---

Cara Core Informática — uso interno.
