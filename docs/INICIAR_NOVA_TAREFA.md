# Iniciar nova tarefa — ecossistema Cara Core

Guia de **produtividade** para retomar trabalho dias ou semanas depois. Leia em 3–5 minutos antes de abrir código.

**Índice mestre:** [ECOSYSTEM_MEMORIA.md](ECOSYSTEM_MEMORIA.md) · [Cota Cursor](CALENDARIO_COTA_CURSOR.md) · [Riscos / decisão](RISCOS_ECOSSISTEMA.md)  
**Fonte IAs:** `caracore-site/AGENTS.md` (não existe mais `D:\onedrive\dev\AGENTS.md`) · Cursor: `.cursor/rules/ecosystem-cara-core.mdc` · Java: `D:\onedrive\dev\APPS_JAVA_VERSION.md`  
**Atualizado:** 2026-11-04 (estado por produto no § Snapshot de [ECOSYSTEM_MEMORIA.md](ECOSYSTEM_MEMORIA.md); os blocos datados abaixo são histórico)  
**Workspace típico:** `D:\dev\` ou `D:\onedrive\dev` (repos irmãos)

---

## 1. Antes de qualquer coisa

| Passo | Ação |
|-------|------|
| 0 | Ler `caracore-site/AGENTS.md` (**principais** PDV · CSO · Hub · Ink Agenda; o resto é **brinco**, bloco **Marcos de transição PDV/CSO** e **Cota Cursor**). O `AGENTS.md` da raiz do workspace **não existe mais** |
| 0b | Confirmar o **dono do ciclo** em `docs/CALENDARIO_COTA_CURSOR.md`. Não abrir Agent pesado noutro produto. |
| 0c | Se a tarefa muda um **GA público**, o **dono do ciclo** ou abre Agent noutro produto → ler `docs/RISCOS_ECOSSISTEMA.md` e aplicar a coluna «Decisão». |
| 0d | Antes de compilar Java, ler `D:\onedrive\dev\APPS_JAVA_VERSION.md` e usar o JDK daquela aplicação |
| 1 | Abrir `caracore-site/docs/ECOSYSTEM_MEMORIA.md` (visão actual) |
| 1b | Posicionamento B2B: `docs/DILEMA.md` · frase-guia em hero e `#engenharia-b2b` |
| 2 | Abrir `.cursor/rules/project-memory.mdc` **do repo onde vai trabalhar** |
| 3 | Confirmar **qual camada** edita: matriz · loja · oficina · wiki · retrô · releases GitHub |
| 4 | **Não** usar `/delivery/` nem `wiki.caracore.com.br/portfolio.html` em CTAs novos |
| 4b | **Nenhum CDN externo** (Cloudflare ou similar) em página publicada: o asset é servido pelo próprio domínio e a superfície abre por servidor local, com layout e desempenho equivalentes em mobile, tablet e desktop |

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
| GA | Instalador Windows 06/04/2027 (Electron + Tomcat embutido + SQLite WAL). Aplicação web 2.1 implementada, sem homologação: a QA da rodada 5 (27/10/2026) reprovou a `rc1.7` e o aceite da `rc1.10` segue pendente; `WAR` é artefato interno de build, não release pública |
| Banco | SQLite local (WAL) no computador do cliente. Java 25, Jakarta EE 10, Tomcat 10.1 |
| RC Windows | Download da loja: `v2.1.0-rc1.10` — ZIP portátil `CaraCore-Hub-2.1.0-rc1.10-windows-x64.zip` 228.354.977 B SHA-256 `0b18fbcf3af02d53a341ac5b83af9132a0ef201e698585160f332d3ad8bdae00`. Publicada em 07/11/2026, unsigned, **sem instalador NSIS nesta build**. A `v2.1.0-rc1.8` conserva o pacote de 31/10/2026 (ZIP 324.536.724 B); a `v2.1.0-rc1.7` conserva o de 27/10/2026 (EXE e ZIP) e as tags `v2.1.0-rc1.6`, `v2.1.0-rc1.2`, `v2.1.0-rc1.1` e `v2.1.0-rc1` os anteriores; `rc1.3`, `rc1.4` e `rc1.5` nunca foram tagueadas. Não homologada: aceite de QA da `rc1.10` pendente; B7 (smoke Linux x64) fechado em 07/11/2026; S6.9 aberto. Mac e Linux fora desta tag. Login do perfil real ainda sem causa confirmada. |
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
| Discurso | Home da loja = conversão Frotas hoje (CTAs → /cadastro). CSO ≠ GPS. Um produto em 08/11/2028. Loja não substitui a aplicação. Sem depoimento inventado. 08/11/**2026** encerra a manutenção da Free 3.2.12 **e** é o GA da v4.0.0 (decisão escrita do dono em 04/11; `D-GA-1` fechada), condicionado a pacote assinado, T032 no hash novo, Gate E escrito e canal `pdv-v4`. |
| Landing app | JSON-LD + cache 5 min + LCP WebP no ar (oficina quarkus) |
| Wiki alinhamento | wiki.caracore.com.br/projeto-cso.html |

---

### Loja PDV Java (`caracore-pdv-releases`)

| URL | https://pdv.caracore.com.br/ |
| Canal | **`v4.0.0` é a versão atual**, lançada em 08/11/2026: release publicada em 06/11/2026 em `caracore-pdv4-releases` (ZIP portátil Windows 10/11 x64, 176.613.179 B, SHA-256 `9557e0b1…d81eac`, `SHA256SUMS` assinado com duas chaves Ed25519), T032 17/17, matriz 11/11 (M11 não medido), banco 3.2.12 migrado 9/9 e canal `pdv-v4` servindo o hash; aplicação do pacote manual. `v3.2.12-free` é a **versão anterior**, última da linha 3.2.x, com manutenção encerrada em 08/11/2026 e pacotes ainda disponíveis (Windows/Linux/macOS). `v4.0.0-candidato-20261031`, `v4.0.0-rc6` e `v4.0.0-rc5` ficam no histórico. **Não anunciar a 4.1.0** (Appmax/PlugNotas, em branch). |
| Planos | Free: 100 vendas/mês, 100 produtos, 1 operador, 4 vendedores, 1 loja; sem PIX integrado e sem NF-e. Copy pode informar recibo digital por link e PDF, sempre sem valor fiscal. Premium R$ 79,90/mês. Fonte: `PlanoLicencaService`. |
| CTA | **Baixar Free**. Premium via demonstração (`consultoria.html`). |
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
| Feature nova | `AGENTS.md` § **"Como desenvolver uma feature nova na v4"** (JDK 25, `mvn -B -ntp verify`, piso 50% dentro do `verify`, evidência do dia, pacote = medição nova) |

**Estado (2026-10-31):** **Gate E recusou o GA** (`docs/arquitetura/GATE_E_MATRIZ_20261029.md:143`); rota = **`rc7` curta** e GA em data escrita (`D-GE-7`). Último commit de **código** verde no CI = `c343890` (run `41244424886`, 1.039 testes / 3 ignorados, LINE 52,82% contra piso de 50%). Superfícies públicas (loja, wiki, matriz, Central e Rust) no **estado B**, **publicadas em 01/11/2026** com a candidata (loja `e54476d`, wiki `fb040bf`, Central `45835e5`, matriz `fd4b150`, todas com Pages `built`): v4 em pré-lançamento e 3.2.12-free como versão anterior. Fila de próximas tarefas e evidência exigida: `ECOSYSTEM_MEMORIA.md` § "Checkpoint 01/11/2026". Free `v3.2.12-free` é a última da linha 3.2.x e **não recebe recurso novo**; manutenção de transição somente até 08/11/2026 e sem feature branch. Correções nessa linha apenas se críticas, impeditivas à operação ou necessárias à migração; verificar aplicação à v4 quando pertinente. Download público da prévia = `v4.0.0-candidato-20261031` (ZIP unsigned Windows x64, 178.317.680 bytes, SHA-256 `0c2003b0f99a75328f7ebe632fc20b07cb5834a3f75b6f0e97ccfb7aef83434d`), build 31/10/2026 da fonte `master` `c343890`; `v4.0.0-rc6` (11/10/2026) e `v4.0.0-rc5` ficam no histórico; a RC7 é a rota aprovada, ainda sem tag. O pacote medido de T032 (16/16) e da matriz M01–M11 é o `ff400efd8737…` (M11 bloqueado por `PERF-001–007`), **não esta candidata** — pacote novo exige medição nova. O ciclo completo de homologação segue pendente: falta **SCA medido** (`D-SCA-1`), o **cenário "banco 3.2.12 migrado"** (bloqueado) e o aceite formal. 08/11 encerra a manutenção 3.2.12, não é GA da v4. `PERF-001–007` congeladas. Copy Free sem PIX integrado nem NF-e/NFC-e; recibo digital por link e PDF, sempre sem valor fiscal. Não substitui o PDV Rust. Feature nova: `caracore-pdv/AGENTS.md` § "Como desenvolver uma feature nova na v4". Handoff: `CONTINUIDADE_DESENVOLVIMENTO.md`.

**Atualização (05/11/2026), supera o "Estado (2026-10-31)" acima:** o GA da **v4.0.0 foi decidido pelo dono para 08/11/2026** (`D-GA-1` fechada; substitui D-C e D-GE-7) — o mesmo dia encerra a manutenção da 3.2.12. A publicação exige pacote `--channel ga` assinado com as duas chaves, T032 17/17 no hash novo, Gate E escrito e canal `pdv-v4`. Em 05/11 nada do GA estava publicado: tag `v4.0.0` 404, `caracore-pdv4-releases` 404 e canal `pdv-v4` 404 `no_release`. Fonte: `caracore-pdv/docs/arquitetura/DECISOES_GA_V4.md` § "Registro de 04/11/2026".

**Atualização (09/11/2026), supera as duas acima: a v4.0.0 foi lançada em 08/11/2026.** A release foi publicada em **06/11/2026** em `chmulato/caracore-pdv4-releases` (tag `v4.0.0`): ZIP portátil Windows 10/11 x64 de **176.613.179 B**, SHA-256 `9557e0b16d77a85e0bb68971eb0e8710356977261337a8c1c05593e893d81eac`, `SHA256SUMS.txt` assinado com duas chaves Ed25519. No próprio ZIP: T032 **17/17**, matriz 11 itens medidos e 11 aprovados (M11, desempenho, **não medido**), banco 3.2.12 migrado **9/9** (047→052) e sonda **20 aprovadas / 0 reprovadas / 1 não coberta / 0 bloqueadas**. O canal `pdv-v4` serve esse hash e a aplicação do pacote é manual. SCA = OSV de 06/11/2026 (275 pacotes, 1 achado alto triado por byte); **NVD não medido** — nunca "0 CVE". A `v3.2.12-free` passa a **versão anterior** (manutenção encerrada em 08/11/2026, pacotes ainda disponíveis). Migração: backup antes; copiar `%APPDATA%\caracore\caracore-pdv.db` para `data\caracore-pdv.db` na pasta da v4 **antes da primeira abertura**; a v4 não desfaz venda finalizada. Não anunciar a linha 4.1.0 (Appmax/PlugNotas, em branch).

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

### BioReator 4.0 (`caracore-ru` + seção em `caracore-ru-releases`)

| O que é | Estação desktop de bioinsumos e fermentação |
| Versão | Community **1.1.1** (13/10/2026) · Windows x64 · release `bioreator-1.1.1` (MSI e ZIP) · EXE dentro do ZIP · sem assinatura |
| Loja | https://ru.caracore.com.br/ (subdomínio do RU) · edições em download.html#bioreator40 |
| Community | *Bradyrhizobium japonicum*, batelada, histórico e CSV; biomassa viável/total, P/V pelo volume líquido e critério de término em `end_reason` |
| Pro | Catálogo, batelada alimentada, custos do operador e PDF. Sem preço e sem PIX |
| Oficina | `caracore-ru/docs/PLANO_SPRINTS_BIORREATOR.md` · `docs/MANUAL_OPERADOR_BIOREATOR.md` |
| Matriz | `#bioreator40` |
| Wiki | `projeto-bioreator.html` |

O subdomínio da loja é https://ru.caracore.com.br/. O lançamento de 18/06/2027 continua sendo o do RU Soberano. Fora da cota de outubro.

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
- [ ] Atualizar `caracore-site/AGENTS.md` e o `project-memory.mdc` do repo trabalhado (não existe mais `AGENTS.md` na raiz do workspace)
- [ ] **Prompt da próxima tarefa em `.txt`** (ASCII, sem markdown, em `docs/` da oficina, nome `prompt-proxima-tarefa-<tema>-<AAAAMMDD>.txt`); o `.md` é só espelho — regra fixa, não perguntar o formato
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
12. **Puxar biblioteca de CDN externo** (jsDelivr, cdnjs, unpkg, Tailwind Play) — matriz, wiki, lojas, blogs, Sala e Central servem os próprios assets; o que faltar entra vendorizado e subsetado, porque a superfície precisa abrir local/offline.

---

## 6. Documentos por profundidade

| Necessidade | Documento |
|-------------|-----------|
| Visão 30 s | `ECOSYSTEM_MEMORIA.md` |
| IAs (Cursor e outras) | `caracore-site/AGENTS.md` (fonte única; o antigo `D:\onedrive\dev\AGENTS.md` não existe mais) |
| Esta página (fluxos) | `INICIAR_NOVA_TAREFA.md` |
| Mapa repos | `ECOSYSTEM_CARA_CORE.md` |
| URLs lojas | `ECOSYSTEM_LOJAS.md` |
| Estratégia | `STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md` |
| Índice docs matriz | `INDEX.md` |

---

Cara Core Informática — uso interno.
