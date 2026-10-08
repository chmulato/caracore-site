# Iniciar nova tarefa — ecossistema Cara Core

Guia de **produtividade** para retomar trabalho dias ou semanas depois. Leia em 3–5 minutos antes de abrir código.

**Índice mestre:** [ECOSYSTEM_MEMORIA.md](ECOSYSTEM_MEMORIA.md) · [Cota Cursor](CALENDARIO_COTA_CURSOR.md) · [Riscos / decisão](RISCOS_ECOSSISTEMA.md)  
**Fonte IAs:** `D:\onedrive\dev\AGENTS.md` · Cursor: `.cursor/rules/ecosystem-cara-core.mdc` · Java: `D:\onedrive\dev\APPS_JAVA_VERSION.md`  
**Atualizado:** 2026-09-13  
**Workspace típico:** `D:\dev\` ou `D:\onedrive\dev` (repos irmãos)

---

## 1. Antes de qualquer coisa

| Passo | Ação |
|-------|------|
| 0 | Ler `AGENTS.md` na raiz (**principais** PDV · CSO · Hub; o resto é **brinco**, bloco **Frentes até 08/11/2026** e **Cota Cursor**) |
| 0b | Confirmar o **dono do ciclo** em `docs/CALENDARIO_COTA_CURSOR.md`. Não abrir Agent pesado noutro produto. |
| 0c | Se a tarefa muda um **GA público**, o **dono do ciclo** ou abre Agent noutro produto → ler `docs/RISCOS_ECOSSISTEMA.md` e aplicar a coluna «Decisão». |
| 0d | Antes de compilar Java, ler `D:\onedrive\dev\APPS_JAVA_VERSION.md` e usar o JDK daquela aplicação |
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

**PDV Rust na matriz:** CTAs → tag GitHub v0.1.4 (não `/latest`); coexistência em `#pdv-coexistencia`.

---

### Loja Hub (`caracore-hub-releases`)

| URL | https://hub.caracore.com.br/ |
| O que é | Encomendas (ML, Shopee, Temu) — não Flask, não “central telefônica” |
| GA | Instalador Windows 06/04/2027 (Electron + Tomcat embutido + SQLite WAL). Oficina web 2.1 concluída; WAR não é release pública |
| Banco | SQLite local (WAL) no computador do cliente. Java 25, Jakarta EE 10, Tomcat 10.1 |
| RC Windows | Download da loja: `v2.1.0-rc1.2` (instalador SHA-256 `50d38ff0ee4defce5bb2598967331d0295fb4817dbec59df5d3e7574b22975e5` e ZIP SHA-256 `ec82b2bd57053c252faac4fdbb0066e9a5cea2df293562b35384107e5cb624b4`). A tag `v2.1.0-rc1.1` conserva o pacote de 06/10. A tag `v2.1.0-rc1` conserva o instalador de 05/10. A suíte 9/9 vale para `f59b959d…`. Não é GA. Mac e Linux fora desta tag. Login do perfil real ainda sem causa confirmada. O aceite da QA desta build ainda não foi feito |
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

**Foco até 06/04/2027:** empacotamento do instalador EXE + Tomcat embutido. O banco já é SQLite local em WAL, na oficina e na pré-release. Não reescrever as fases 1–5 da WAR nem publicar o WAR como release pública. Não commitar salvo pedido explícito.

**Wiki:** manual operacional em `caracore-wiki/docs/hub/` (público).

---

### CSO (`caracore-cso-quarkus` + `caracore-cso-transportes`)

| Aplicação Frotas | https://cso.caracore.com.br/ |
| Loja única | https://cso-transp.caracore.com.br/ · clone `D:\onedrive\dev\caracore-cso-releases` |
| Frotas | Gestão de frota FRO 24/24 em produção desde 06/10 (`b90d1dc`, Flyway V33). Index `e1e8d63`. 08/11/2026 = freeze do que já está no ar, sem jornada, app offline nem GPS. Oficina `caracore-cso-quarkus` (não editar vitrine lá) |
| Copy da matriz, wiki e loja | Alinhada no checkout em 06/10 (`ecosistema.html`, `portfolio.html`, `projeto-cso.html`, loja `cso-transp`). Ainda sem commit/push. A aplicação já descreve a frota desta versão |
| Transportes | Garagem **08/11/2028** · oficina `caracore-cso-transportes` (**sem** informação de loja) · **não** é a data do PDV v4 |
| Discurso | Home da loja = conversão Frotas hoje (CTAs → /cadastro). CSO ≠ GPS. Um produto em 08/11/2028. Loja não substitui a aplicação. Sem depoimento inventado. Headline pública de 08/11/**2026** = PDV v4. |
| Landing app | JSON-LD + cache 5 min + LCP WebP no ar (oficina quarkus) |
| Wiki alinhamento | wiki.caracore.com.br/projeto-cso.html |

---

### Loja PDV Java (`caracore-pdv-releases`)

| URL | https://pdv.caracore.com.br/ |
| Canal | `v3.2.7-free` (download estável). Pré-release pública `v4.0.0-rc5` para avaliação = não é GA nem substitui o Free. RC4 fica no histórico. |
| Planos | Free: 100 vendas/mês, 100 produtos, 1 operador, 4 vendedores, 1 loja; UI no navegador; sem PIX integrado e sem NF-e. Copy pode informar recibo digital por link e PDF, sempre sem valor fiscal. Premium R$ 79,90/mês. Fonte: `PlanoLicencaService`. |
| CTA | **Baixar Free (3.2.7)**. Premium via demonstração (`consultoria.html`). |
| Quem entra | `admin` / `admin` (troca obrigatória). **1 operador** no Free. Copy: `download.html#perfis`. Não usar senhas do Rust. |
| Oficina | `caracore-pdv` |
| Matriz | `#caracore-pdv` |

---

### Oficina PDV Java (`caracore-pdv`)

| Ler | Ficheiro |
|-----|----------|
| Entrada IAs | `AGENTS.md` |
| Handoff | `docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md` |
| Plano de GA 08/11 | `docs/arquitetura/PLANO_LANCAMENTO_V4.md` |
| Plano Qute | `docs/arquitetura/PLANO_PARIDADE_NEGOCIO_QUTE.md` |
| Status vigente | `docs/arquitetura/STATUS_ATUAL_APLICACAO.md` |
| Cursor | `.cursor/rules/project-memory.mdc` · `qute-migracao.mdc` |

**Estado (2026-10-07):** canal maduro da **loja** = `v3.2.7-free` **publicado** (estoque na venda, turno com X/Z, saldo pelo valor da venda, recibo offline com itens e PDF; shell PDV coluna + caixa registradora; Restrito empilhado; login honesto pós-troca; navegador `localhost:8080/login`; escuta em `127.0.0.1`). Código Free = tag `v3.2.7-free` / `hotfix/3.2.7-free` — **não** o `master`. Histórico imediato: `v3.2.6-free` / `feature/free-3.2.6-pdv-ux`. Pré-release pública `v4.0.0-rc5` (ZIP unsigned Windows x64, SHA-256 `d45d12d9fbf6e3923f69ddbbf6173ef2128be0341e30e75f038b7dc1f3ab6f81`); não é GA. T032 segue aberto pelo roteiro operacional formal. **Frente de GA público 08/11/2026** (`PLANO_LANCAMENTO_V4.md`) permanece condicionada a esse roteiro. `PERF-001–007` congeladas. HEAD `master` = Maven da linha v4 (RC5), não o ZIP Free. Copy Free sem PIX integrado nem NF-e/NFC-e; recibo digital por link e PDF, sempre sem valor fiscal. Não substitui o PDV Rust. Handoff: `CONTINUIDADE_DESENVOLVIMENTO.md`.

---

### Loja PDV Rust (`caracore-rust-pdv-releases`)

| URL vitrine | https://pdv-rust.caracore.com.br/ (GitHub Pages do **mesmo** repo) |
| Download oficial | https://github.com/chmulato/caracore-rust-pdv-releases/releases (tag **v0.1.4**) |
| Clone local | `D:\onedrive\dev\caracore-pdv-rust-releases` (nome da pasta ≠ nome no GitHub) |
| Oficina | `caracore-pdv-rust` |
| Matriz | `#caracore-pdv-rust` |
| Quem entra | Quatro logins de demonstração em `primeiros-passos.html#perfis` (`admin`/`admin123` na primeira venda). Não são o Java Free. |

**Nav loja:** Formatos → `download.html` · botões → `caracore-rust-pdv-releases/releases`. Nunca usar `caracore-pdv-releases` para o Rust (Java).

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

**Release:** `python tools/run_release_delivery_oneclick.py --tag v0.1.4` · publicar loja: `python tools/publish_portal_assets_loja.py --push`

**Regra oficina:** não commitar salvo pedido explícito do usuário.

---

### Minerador 4.0 / ETE (`caracore-ete` + `caracore-ete-releases`)

| Loja | https://ete.caracore.com.br/ |
| Canal | **v1.2.3** Latest |
| Pacotes | Windows `.exe` + `.zip`, Linux `.tar.gz`, macOS `.dmg` |
| Oficina | `caracore-ete/AGENTS.md` (bloco Canal público) · `.cursor/rules/project-memory.mdc` |
| Matriz | `#minerador-ete` |
| Wiki | `projeto-minerador.html` |

**Não regressar:** v1.2.1 launcher ~5 MB sem `_internal`; v1.2.2 Flask morto sem `pyarmor_runtime`. GO = Flask em `127.0.0.1:5150`. Delivery automático da loja falha (PAT) — publicar com `gh` local.

---

### Wiki (`caracore-wiki`)

| URL | https://wiki.caracore.com.br/ |
| Publicação | `docs/` → GitHub Pages |
| Papel | Documentação de **todos** os produtos (alinhamento + manuais). Lojas: vitrine, download, feedback e **quem entra**. Wiki **aponta** senhas para a loja; `/wiki/` nas lojas redireciona para cá. |
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
| Download PDV Rust | github.com/chmulato/caracore-rust-pdv-releases/releases | `/releases/latest` de `caracore-pdv-releases` (Java) |
| CTAs legado | — | www.caracore.com.br/delivery/... |

---

## 4. Ao fechar a tarefa (checklist mínimo)

- [ ] Versão/copy alinhados entre **oficina ↔ loja ↔ matriz ↔ wiki** (se tocou produto)
- [ ] `VALIDACAO_LOJAS_MATRIZ.md` (se mudou links matriz/loja)
- [ ] Oficina Rust: `python tools/sync_docs_status.py --full` se mudança relevante
- [ ] Atualizar `ECOSYSTEM_MEMORIA.md` se mudou **regra de ecossistema** (repo, URL, release)
- [ ] Atualizar `AGENTS.md` (este repo + raiz do workspace) e `project-memory.mdc` do repo trabalhado
- [ ] Uma camada por vez (matriz · loja · oficina · wiki); não misturar Java e Rust no mesmo patch
- [ ] Smoke manual: home → portfólio → loja ou releases → voltar

---

## 5. Armadilhas que custam tempo

1. **Tratar Rust como substituto do Java** — são linhas paralelas (v3.2.x ≠ v0.1.x).
2. **Usar `/releases/latest` de `caracore-pdv-releases` para o Rust** — esse latest é o canal **Java**. Rust = `caracore-rust-pdv-releases/releases`.
3. **Descrever Hub como Flask / central telefônica** — Hub é encomendas (Jakarta EE). Flask é Área 51.
4. **Descrever o banco do Hub como PostgreSQL, Docker ou Java 17** — o banco é SQLite local (WAL) no computador. Stack pública: Java 25, Jakarta EE 10, Tomcat 10.1.
5. **Vender CSO como GPS** — Frotas é gestão administrativa; Virtual Tracker™ é produto separado.
6. **Duplicar vitrine longa na matriz** — resumo + CTA para loja.
7. **Esquecer push da loja** após mudar `caracore-pdv-rust-releases` (Pages demora minutos).
8. **Misturar suporte PME na home B2B** — M365/antivírus/horários noite ficam em `suporte-local.html`.
9. **Tom xiita anti-cloud na vitrine** — usar híbrido/FinOps/resiliência; ideologia fica para backlog wiki/retrô/lojas.
10. **Commit na oficina** sem pedido explícito do usuário.
11. **Misturar senhas Java × Rust** — Free = `admin`/`admin` (1 operador). Rust = quatro logins em `primeiros-passos.html#perfis`. Pastas `%APPDATA%\caracore\` ≠ `%APPDATA%\caracore-pdv\`.

---

## 6. Documentos por profundidade

| Necessidade | Documento |
|-------------|-----------|
| Visão 30 s | `ECOSYSTEM_MEMORIA.md` |
| IAs (Cursor e outras) | `AGENTS.md` neste repo · espelho `D:\onedrive\dev\AGENTS.md` |
| Esta página (fluxos) | `INICIAR_NOVA_TAREFA.md` |
| Mapa repos | `ECOSYSTEM_CARA_CORE.md` |
| URLs lojas | `ECOSYSTEM_LOJAS.md` |
| Estratégia | `STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md` |
| Índice docs matriz | `INDEX.md` |

---

Cara Core Informática — uso interno.
