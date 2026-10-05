# Memória do ecossistema — retomada de desenvolvimento

Referência única para alinhar **matriz**, **lojas**, **oficinas**, **wiki**, **retrô** e **releases** ao retomar trabalho.

**Atualizado:** 2026-10-04 · 22:22 BRT
**Workspace típico:** `D:\dev\` ou `D:\onedrive\dev`  
**Guia de produtividade:** [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) ← use ao **iniciar nova tarefa**  
**Fonte mestre para IAs:** `AGENTS.md` na raiz do workspace e **cópia git** `caracore-site/AGENTS.md` · Cursor: `.cursor/rules/ecosystem-cara-core.mdc`

### Como Gemini e Cursor devem retomar

Comece por este documento para obter o snapshot e os handoffs; consulte em seguida o `AGENTS.md` da raiz para regras de ecossistema e a memória/arquivo de status da oficina antes de alterar um produto. A tabela abaixo é um índice de status, não substitui o estado operacional do repositório. Se houver divergência, prevalece o status mais recente da oficina; registre a correção nesta memória e no changelog. Confirme deploy/publicação no destino antes de afirmar que uma alteração local está no ar.

### Snapshot das aplicações e frentes (2026-10-04)

| Aplicação / frente | Status registrado | Próximo gate ou limite | Retomada canônica |
|---|---|---|---|
| **PDV Java Free** | `v3.2.6-free` estável, Latest e multiplataforma; app web local no navegador. Recibo por link/PDF sem valor fiscal; sem PIX integrado ou NF-e/NFC-e. | Manter como download estável enquanto v4 não passar os gates de GA. | `caracore-pdv` · `AGENTS.md` da oficina |
| **PDV Java v4** | `v4.0.0-rc4` pré-release pública Free, ZIP portátil Windows x64 unsigned; hash e asset conferidos. Não é GA nem versão estável. | T032 aguarda o roteiro operacional formal; homologação Edge/Windows 1280×800 e troca obrigatória de senha estão concluídas. `PERF-001–007` congeladas: não fazer benchmark/tuning. GA 08/11/2026 condicionado. | `caracore-pdv/docs/arquitetura/STATUS_ATUAL_APLICACAO.md` · `CONTINUIDADE_DESENVOLVIMENTO.md` · `PLANO_LANCAMENTO_V4.md` |
| **PDV Rust** | Piloto Windows `v0.1.4`, linha independente do Java; limite de 100 vendas durante a vida do piloto. Loja e artefatos no mesmo repo de releases. | Não misturar canais, artefatos ou anunciar que substitui o Java. | `caracore-pdv-rust/docs/contexto-rapido.md` · `status.md` |
| **CSO Frotas** | SaaS em produção; release documentado `e193d6d`; commits de RBAC e responsividade estão em `master`/`origin/master`. Não é GPS. | Smoke `-Full` local passou em 03/10; confirmar CI/Railway e deploy atual antes de declarar a responsividade publicada. `/login` foi observado com CSS `20260807c` enquanto o código usa `20261003b`; schema Flyway efetivo em produção não confirmado. Freeze M1: 08/11/2026. | `caracore-cso-quarkus/AGENTS.md` · `docs/plano-lancamento-2026-11-08.md` |
| **CSO Transportes** | Frente desktop em roadmap; GA 08/11/2028. Não é a data do PDV nem uma aplicação web atualmente oferecida. | Oficina sem URL/copy de loja própria; usa a loja única CSO quando apropriado. | `caracore-cso-transportes` |
| **CaraCore Hub** | Web 2.1 concluída na oficina; RC1 Free `2.1.0-rc1` em QA, WAR não é release pública. Smoke Playwright 3/3 e regressão de migração SQLite passaram localmente no Windows. | S4.2 aguarda CI runtime nos quatro alvos; CI #7 teve falha de readiness Linux ainda sem causa confirmada. S4.3–S4.9 abertas; GA previsto 06/04/2027. Amazon/B2W não são oferta operacional. | `caracore-hub/docs/contexto-rapido.md` · `docs/plano-lancamento-rc1.md` |
| **Minerador ETE** | Canal público `v1.2.3` (Ouro 4.0). | Não regredir para os bundles quebrados `v1.2.1`/`v1.2.2`. | `caracore-ete/AGENTS.md` · `.cursor/rules/project-memory.mdc` |
| **Ink Agenda** | Desktop Windows `v2.0.0` estável. | PWA não antes de 2028; sem prometer DMG/DEB. | `caracore-ink/docs/PLANO_PWA.md` |
| **Seed** | Ferramenta interna; sem download público. | Manter a vitrine honesta sobre indisponibilidade pública. | `caracore-seed/docs/memoria-projeto.txt` |
| **Reino OIDC / Circuito / Área 51** | OIDC `v2.0.0-RC1`; Circuito ativo; Área 51 com baseline `0.1.0-dev` e vitrine de consultoria. | São brincos: cedem prioridade de cota e headline aos produtos principais. | `caracore-oidc` · `caracore-circuito` · `caracore-area51` |
| **MKT / Sala** | Ferramentas e portal de operações; a Sala é acessada em `tools.caracore.com.br/sala/`. | Brinco; não deslocar prioridade dos produtos principais. | `caracore-mkt` · `caracore-tools` |
| **RU Soberano** | Garagem/roadmap; marco Simulador + Sala Retro previsto para 18/06/2027. | Sem abrir frente pesada fora da fila de cota. | `caracore-ru` |
| **Helianto** | Roadmap SaaS; GA previsto para 30/12/2029. | Agent em 2029, após CSO Transportes; não antecipar para 2027–2028. | `caracore-helianto` |
| **Matriz, Central e Suporte Local** | Conteúdo alinhado no repositório: convite da home para a Central de Downloads e menu de `suporte-local.html` alinhado à navegação institucional. | Não inferir publicação/deploy pelo estado do repositório; conferir o site publicado antes de afirmar que está no ar. | `caracore-site/index.html` · `suporte-local.html` · `caracore-loja/docs/download.html` |

### Status PDV Java (2026-10-04) — para IAs

| Item | Valor |
|------|--------|
| Canal loja | **`v3.2.6-free` publicado** (Latest) — shell PDV coluna + caixa registradora; Restrito empilhado; login honesto pós-troca |
| Código Free | Tag `v3.2.6-free` · ramo `feature/free-3.2.6-pdv-ux` (não misturar com `master`) |
| Checkout oficina `master` | Maven `4.0.0-rc4` · Qute · pré-release pública RC4; roteiro operacional formal pendente antes de avaliar GA |
| Próximo Agent pesado | **out–nov/2026** = PERF/T032 v4 (`PLANO_LANCAMENTO_V4.md`) |
| Handoff | `caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md` · `caracore-pdv/AGENTS.md` |
| Retomada local | `v4.0.0-rc4` é a pré-release pública da edição Free (100 vendas finalizadas/mês), em ZIP portátil Windows x64 unsigned. Smoke local e download remoto concluídos; SHA-256 `31a0cdeda68dce058079c5d0d3d5652084ba8a8cc073dfce60e021c4b3c1fdf2`. T032 segue aberto pelo roteiro operacional formal; `PERF-001–007` congeladas por decisão do usuário; ver `STATUS_ATUAL_APLICACAO.md` e handoff |

---

## Retomada em 30 segundos

1. **Nova tarefa?** → [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) (fluxo por tipo de trabalho)
2. **Status das aplicações (Gemini/Cursor):** começar pelo [snapshot acima](#snapshot-das-aplicações-e-frentes-2026-10-04), depois consultar a memória canônica da oficina antes de editar ou anunciar status.
3. **Visão ecossistema:** este ficheiro + `ECOSYSTEM_CARA_CORE.md` + `ECOSYSTEM_LOJAS.md` + **`D:\onedrive\dev\AGENTS.md`**
4. **Produtos principais (só estes três):** PDV (Java Free `v3.2.6-free` + pré-release pública `v4.0.0-rc4` / **frente GA 08/11/2026** se T032 + Rust `v0.1.4`) · CSO (Frotas **no ar e em andamento**; freeze M1 08/11/2026; loja `cso-transp`; Transportes **08/11/2028**; ≠ GPS) · Hub (encomendas; GA Windows 06/04/2027). **Brincos:** Ink, OIDC, Seed, Circuito, Área 51, RU, Helianto, MKT, Minerador — existem; em conflito de cota ou headline, **cedem**.
4a. **Frentes 08/11/2026:** PDV v4 = GA público se T032 (`PLANO_LANCAMENTO_V4.md`). CSO Frotas = freeze do Momento 1, não lançamento novo: COE-B/E publicados em `e193d6d`; smoke `-Full` local passou em 03/10, mas deploy/CI e gates Railway finais ainda precisam ser confirmados. Não misturar com Transportes 2028. Headline pública do dia = PDV.
4b. **Cota Cursor (fila única):** `docs/CALENDARIO_COTA_CURSOR.md` — US$ 20/mês · 1 produto pesado por ciclo. Página pública **Funding / Patrocínio:** `planning.html#patrocinio` (US$ 800 até dez/2029). set = CSO COE · out–nov = PDV v4 · dez/2026–06/04/2027 = **Hub** · 08/04–dez/2027 = **CSO FRO** · 2028 = Transportes · **2029 = Helianto (GA 30/12/2029)**. Ink PWA = Tab; sem Agent até folga (**não antes de 2028**).
4b2. **Riscos / decisão:** `docs/RISCOS_ECOSSISTEMA.md` — ler antes de mudar GA, dono de ciclo ou abrir Agent noutro produto.
4c. **CSO retomada:** aplicação `cso.caracore.com.br` · loja única `D:\onedrive\dev\caracore-cso-releases` · wiki `caracore-wiki/docs/projeto-cso.html` · app/oficina `caracore-cso-quarkus` · oficina Transportes **sem** copy de loja. Release documentado `e193d6d`: termos LGPD 2.1, convites por chave, categoria/filtros de veículos, filtros operacionais, gates de veículo inativo e quilometragem por abastecimento/viagem. `3c0e41e` (RBAC de convites) e `febaa3c` (responsividade/acessibilidade) estão em `master`/`origin/master`. `mvn test` 362/362 e smoke `-Full` (val/auth/frota/pay + suíte) passaram; inspeção visual validou 390, 768, 820, 1024, 1280 e 1366 px sem overflow de página, com rolagem interna acessível para tabelas densas. Em 03/10, `/` e `/q/health` responderam 200, mas `/login` ainda carregava `/css/cso.css?v=20260807c` (o commit atual usa `20261003b`): não considerar a responsividade publicada até confirmar o deploy. Próximo: confirmar CI/Railway e fechar Freeze M1; FRO código **08/abr–dez/2027** (calendário vigente, não julho). A versão efetiva do schema Flyway em produção ainda não foi confirmada diretamente.
5. **PDV Java:** oficina `caracore-pdv/AGENTS.md` · plano de GA `docs/arquitetura/PLANO_LANCAMENTO_V4.md` (**execução Cursor: outubro–novembro/2026**, cota; setembro = plano escrito) · loja CTA = **Baixar Free (3.2.6)**. Free: 100 vendas/mês, 100 produtos, 1 operador, 4 vendedores, 1 loja; aplicação web local no navegador; recibo digital por link e PDF **sem valor fiscal**; sem PIX integrado nem emissão de NF-e/NFC-e. Premium R$ 79,90/mês (PIX integrado, fiscal). Canal Free publicado = `v3.2.6-free` (`localhost:8080/login`, `admin`/`admin`). RC4 Qute é pré-release pública para avaliação, não GA nem download estável; o roteiro operacional formal permanece como gate aberto do T032. Rust piloto = 100 vendas na vida. **Não** substituir o PDV Rust.
6. **PDV Rust oficina:** `caracore-pdv-rust/docs/contexto-rapido.md` · `status.md` · `caracore-pdv-continuacao.mdc`
7. **Hub oficina (GA Windows 06/04/2027):** `caracore-hub/docs/contexto-rapido.md` · `.cursor/rules/project-memory.mdc` · backend Java 25 validado (`core` 606 testes, `persistence` 541, `api` verde, `web` 274, WAR gerado). Em 22/09/2026: 11 migrações Flyway validadas no SQLite; casts Postgres (`jsonb`, `now`, `uuid`) saneados em `VolumeDAO`/`IntegracaoEventoDAO`; RBAC limpo (`ADMIN/SUPERVISOR/OPERADOR`); Spring expurgado do Electron. **Web 2.1 concluída na oficina; WAR não é release pública.** RC1 Free `2.1.0-rc1` em QA; CI #7 falhou no runtime Linux e os fluxos não passaram em CI Windows/macOS. Correções locais obtiveram smoke Playwright 3/3 no Windows, suíte Electron verde e teste das migrações SQLite aprovado; S4.2 aguarda nova CI nos quatro alvos. Não declarar RC/GA publicada. Manual: wiki.caracore.com.br/hub/
6a. **Seed oficina:** `caracore-seed/docs/memoria-projeto.txt` · Java 25 validado; JaCoCo `0.8.14`, Mockito `5.17.0`, Byte Buddy `1.18.14`; `CustomerLifecycleTest` verde e bloqueio anterior de bytecode major 69 resolvido. Seed continua brinco e a loja informa honestamente que não há download público.
6b. **Retrô:** `caracore-retro/.agents/AGENTS.md` · 139 artigos HTML confirmados. A validação editorial permanece amarela/vermelha por BOM/byte extra antes do `DOCTYPE` em muitos artigos e avisos de SEO em `docs/articles.html`; não declarar 100% saudável antes da normalização controlada.
7. **PDV Rust (loja + artefatos):** um só repo `chmulato/caracore-rust-pdv-releases` — Pages = `pdv-rust.caracore.com.br` · Releases = https://github.com/chmulato/caracore-rust-pdv-releases/releases (tag v0.1.4). Clone local: `caracore-pdv-rust-releases`. **Nunca** `caracore-pdv-releases` (Java).
8. **Copy B2B:** [DILEMA.md](DILEMA.md) · hero `#engenharia-b2b` · portfólio `#decisoes-engenharia` · tom **FinOps/híbrido** (não anti-cloud na vitrine)
9. **Suporte PME:** [suporte-local.html](../suporte-local.html) — fora do nav B2B; horários noite/sábado só lá

---

## Presenças web (2026-10-04)

| Papel | URL | Repo |
|-------|-----|------|
| Matriz | https://www.caracore.com.br/ | caracore-site |
| Suporte PME (PT) | https://www.caracore.com.br/suporte-local.html | caracore-site |
| B2B EN | https://www.caracore.com.br/aligned/en/ | caracore-site |
| B2B IT | https://www.caracore.com.br/aligned/it/ | caracore-site |
| Portfólio | https://www.caracore.com.br/portfolio.html | caracore-site |
| Eco Mundo (matriz) | https://www.caracore.com.br/ecosistema.html | caracore-site |
| Planning (torres 0–100% + Funding) | https://www.caracore.com.br/planning.html · [#patrocinio](https://www.caracore.com.br/planning.html#patrocinio) | caracore-site |
| Wiki | https://wiki.caracore.com.br/ | caracore-wiki |
| Retrô | https://retro.caracore.com.br/ | caracore-retro |
| Sala operações | https://tools.caracore.com.br/sala/ | caracore-site / caracore-mkt |
| PDV Java loja | https://pdv.caracore.com.br/ | caracore-pdv-releases |
| PDV Rust loja + artefatos | https://pdv-rust.caracore.com.br/ · https://github.com/chmulato/caracore-rust-pdv-releases/releases | `caracore-rust-pdv-releases` (clone local `caracore-pdv-rust-releases`) |
| CSO Produção (Frotas) | https://cso.caracore.com.br/ | caracore-cso-quarkus |
| CSO loja única (Frotas + Transportes) | https://cso-transp.caracore.com.br/ | caracore-cso-releases · clone `D:\onedrive\dev\caracore-cso-releases` |
| Hub vitrine | https://hub.caracore.com.br/ | caracore-hub-releases |

**Correção wiki (jun/2026):** portfólio **não** está em `wiki.caracore.com.br/portfolio.html` — usar **www**; wiki tem redirect stub.

---

## Modelo fixo (camadas)

| Camada | Repositório | Destino |
|--------|-------------|---------|
| **Matriz** | caracore-site | www.caracore.com.br |
| **Loja** | caracore-*-releases | *.caracore.com.br |
| **Releases** | GitHub *-releases | binários + SHA256 (PDV Rust) |
| **Oficina** | caracore-{produto} | código / CI |
| **Wiki** | caracore-wiki | wiki.caracore.com.br |
| **Retrô** | caracore-retro | retro.caracore.com.br |

**Regras:** CTAs de download → loja ou GitHub Releases · documentação de produto → wiki.caracore.com.br · **quem entra / perfis de demonstração** → loja daquela linha (não a wiki como fonte de senha) · matriz → `portfolio.html#{âncora}` · PDV comparação → `#pdv-coexistencia` · sem `/delivery/` em links novos.

**IAs (progressivo):** uma camada por vez; depois de corte ou copy no ar, atualizar `AGENTS.md`, este changelog e `.cursor/rules` do repo. Não misturar Java e Rust.

---

## PDV Java + Rust — referência rápida

**Marco v4 (04/10/2026):** `v4.0.0-rc4` é a pré-release pública da edição Free, para avaliação e com limite de 100 vendas finalizadas por mês civil — ZIP portátil Windows x64 unsigned; MSI não incluído. O asset remoto foi verificado após download; SHA-256 `31a0cdeda68dce058079c5d0d3d5652084ba8a8cc073dfce60e021c4b3c1fdf2`. A execução 20 do workflow antigo de validação falhou porque procurou EXE na release e resolveu o latest estável; o workflow foi atualizado localmente para validar ZIP/sidecar, ainda sem novo dispatch. T032 segue aberto pelo roteiro operacional formal; Edge/Windows 1280×800 e troca obrigatória de senha inicial estão resolvidos; `PERF-001–007` seguem congeladas. RC4 não é GA nem download estável. Launcher `iniciar_pdv.bat` (underscore); banco só `./data/caracore-pdv.db`. **Não** misturar com Free estável (`iniciar-pdv.bat` hífen; `%APPDATA%\caracore\`). A frente GA público 08/11/2026 continua condicionada ao aceite dos gates. Na mesma data o CSO Frotas só **congela Momento 1** (já no ar). `v3.2.6-free` permanece a versão estável e multiplataforma (shell PDV coluna + caixa registradora; Restrito empilhado; login honesto pós-troca).

**Planos Java** (`PlanoLicencaService`): Free = 100 vendas/mês, 100 produtos, 1 operador, 4 vendedores, 1 loja, sem PIX integrado ou NF-e/NFC-e. A copy pode informar recibo digital por link e PDF, sempre **sem valor fiscal**. Premium = R$ 79,90/mês, sem teto de 100 vendas, com PIX integrado e trilha fiscal. Loja: CTA = **Baixar Free (3.2.6)**; Premium via demonstração. Rust `v0.1.4` = 100 vendas na vida do piloto.

| Papel | Repo / URL |
|-------|------------|
| Java maduro | pdv.caracore.com.br · **v3.2.6-free** · caracore-pdv |
| Java v4 RC4 | pré-release pública da edição Free `v4.0.0-rc4` · 100 vendas finalizadas/mês · T032 aguarda roteiro formal · não GA |
| Rust piloto | pdv-rust (vitrine) · tag GitHub **v0.1.4** em `caracore-rust-pdv-releases` · oficina `caracore-pdv-rust` |
| Coexistência | portfolio `#pdv-coexistencia` · não substituir Java |
| Comunicação | Retrô art. **115** (B2B/IA) · art. 114 (PDV Rust) · wiki projeto-pdv* |

**Discurso:** v3.2.x = Java · v0.1.x = Rust · V3 negócio (PME) = ambas · evitar “PDV v3” sozinho / “migração” / “substitui”.

---

## Minerador 4.0 (ETE) — referência rápida

**Canal público (08/09/2026):** **v1.2.3** na loja `ete.caracore.com.br` e em [caracore-ete-releases/releases/latest](https://github.com/chmulato/caracore-ete-releases/releases/latest). Mesmo binário Free × Premium (Ouro 4.0, R$ 29,90). Flask local `127.0.0.1:5150`.

| Papel | Repo / URL |
|-------|------------|
| Loja | ete.caracore.com.br · tag **v1.2.3** · Windows `.exe` + `.zip`, Linux `.tar.gz`, macOS `.dmg` |
| Oficina | `caracore-ete` · `AGENTS.md` (bloco Canal público) · `.cursor/rules/project-memory.mdc` |
| Matriz | `portfolio.html#minerador-ete` · badge v1.2.3 em `index.html` / `ecosistema.html` |
| Wiki | `projeto-minerador.html` |

**Não regressar:** v1.2.1 = launcher ~5 MB sem `_internal`; v1.2.2 = Flask morto (`pyarmor_runtime` em falta). GO = exe de dezenas de MB + porta 5150. Delivery automático da loja falha (PAT); publicar com `gh` local.

---

## Âncoras portfólio (matriz)

| Produto | Âncora |
|---------|--------|
| PDV Java | `#caracore-pdv` |
| PDV Rust | `#caracore-pdv-rust` |
| Coexistência PDV | `#pdv-coexistencia` |
| Decisões / impacto | `#decisoes-engenharia` |
| Hub | `#caracore-hub` |
| Minerador 4.0 | `#minerador-ete` |
| Reino OIDC | `#reino-oidc` |
| Circuito | `#circuito-python` |
| Ink | `#caracore-ink-agenda` |
| Seed | `#caracore-seed` |
| Área 51 | `#area-51` |
| RU | `#caracore-ru` |
| CSO | `#caracore-cso` |
| MKT / Sala | `#caracore-mkt` |

---

## Repositórios e memória Cursor / IA

| Repo | Referência de Memória | Notas |
|------|-----------------------|-------|
| Workspace raiz | `AGENTS.md` | Guia mestre para IAs |
| caracore-site | `docs/ECOSYSTEM_*.md` | Matriz institucional |
| caracore-wiki | `docs/ecosistema.html` | Wiki institucional |
| caracore-cso-quarkus | `AGENTS.md` / `docs/memoria-agente-p0.md` | Frotas Web em produção |
| caracore-retro | `.agents/AGENTS.md` | 139 artigos · capa inline `max-width:300px` float-right · validação HTML pendente por encoding legado |
| caracore-pdv-rust | `docs/contexto-rapido.md` | Oficina PDV Rust |
| caracore-hub | `docs/contexto-rapido.md` · `.cursor/rules/project-memory.mdc` | Web 2.1 validada em Java 25; GA Windows 06/04/2027 |
| caracore-seed | `docs/memoria-projeto.txt` | Testes unitários estabilizados em Java 25; brinco sem download público |
| caracore-hub-releases | `.cursor/rules/project-memory.mdc` | Loja hub.caracore.com.br |
| caracore-pdv-rust-releases | Sim | Loja pdv-rust |
| caracore-pdv | `AGENTS.md` · `docs/arquitetura/STATUS_ATUAL_APLICACAO.md` · `CONTINUIDADE_DESENVOLVIMENTO.md` · `.cursor/rules/project-memory.mdc` | `v3.2.6-free`; RC4 Qute publicada como pré-release unsigned Windows x64 (SHA-256 `31a0cdeda68dce058079c5d0d3d5652084ba8a8cc073dfce60e021c4b3c1fdf2`); T032 aguarda roteiro operacional formal; `PERF-001–007` congeladas |
| caracore-pdv-releases | `.cursor/rules/project-memory.mdc` | Loja pdv.caracore.com.br · CTA Baixar Free (3.2.6) · Free 100/mês · sem PIX integrado |
| caracore-ete | `AGENTS.md` · `.cursor/rules/project-memory.mdc` | Canal **v1.2.3**; Windows onefile+ZIP; PyArmor no bundle; Flask 5150 |
| caracore-ete-releases | `docs/artifacts/VERSION` | Loja ete.caracore.com.br · Latest v1.2.3 |
| Demais produtos | Sim | ink, ru, … |

Lista completa: `ECOSYSTEM_CARA_CORE.md`.

---

## Estado recente do ecossistema (changelog)

| Data | Alteração |
|------|-----------|
| 2026-10-04 | **CaraCore Hub — handoff RC1 Free `2.1.0-rc1`:** contexto rápido, regra Cursor e plano atualizados. Sprints 1–3 e S4.1 concluídas; S4.2 segue pendente após falha CI #7: barra final ausente na base Playwright corrigida localmente para Windows/macOS; causa do `ECONNREFUSED` Linux ainda não comprovada. Smoke local Windows passou 3/3 com perfil isolado; migração SQLite e suíte Electron passaram. Alterações locais ainda sem commit/push; próximo gate é CI atualizada nos quatro alvos. RC1 não é GA. Handoff: `caracore-hub/docs/contexto-rapido.md`. |
| 2026-10-04 | **Memória operacional para Gemini/Cursor:** incluído snapshot de status, gates e handoffs das aplicações; explicitada a precedência do status operacional da oficina e a necessidade de confirmar deploy antes de declarar publicação. Corrigida a copy do recibo Free para “link e PDF, sem valor fiscal” na memória e nos dois `AGENTS.md`. Registrados o convite da home à Central e o alinhamento do menu Suporte Local; deploy dessas páginas não foi verificado nesta atualização. |
| 2026-10-04 | **Alinhamento da Central de Downloads:** Free Java descrito com recibo digital por link/PDF sem valor fiscal, sem PIX integrado nem NF-e/NFC-e; removida a promessa não confirmada de sincronização em nuvem e corrigida a explicação de que SHA256 não certifica segurança. Mapa do PDV esclarece Java web local e Rust desktop; AGENTS global e cópia da matriz sincronizados. |
| 2026-10-04 | **PDV v4 — Free RC4 publicada como pré-release:** suíte Maven 843 testes (0 falhas/erros, 3 ignorados), empacotador 6/6 e smoke isolado aprovados. O ZIP e sidecar estão na [GitHub Release](https://github.com/chmulato/caracore-pdv-releases/releases/tag/v4.0.0-rc4); asset baixado confere com SHA-256 `31a0cdeda68dce058079c5d0d3d5652084ba8a8cc073dfce60e021c4b3c1fdf2`. T032 segue aberto pelo roteiro operacional formal. `v3.2.6-free` permanece Latest/estável; RC4 não é GA e o Free não inclui PIX integrado nem NF-e/NFC-e. |
| 2026-10-04 | **PDV v4 — edição Free RC3:** runner reconstruído após detectar a divergência no primeiro asset; a classe do pagamento no runner confere com a compilada. ZIP portátil Windows x64 unsigned substituído na mesma pré-release e baixado novamente para verificar SHA-256 `51f46120dac04dfbbe7fbfb6d442d4f79717327940452b043cc8ec65b9bcd4f3`. Tag e número RC3 preservados; `v3.2.6-free` segue Latest e versão estável. Loja, release notes e memória sincronizadas. T032 permanece aberto; RC3 não é GA nem está homologada para produção. |
| 2026-10-03 | **PDV v4 — rota ZIP aprovada e exercitada localmente:** o usuário escolheu distribuição futura por ZIP portátil sem assinatura Authenticode, com aviso transparente, instrução para não desativar proteções e SHA-256 publicado separadamente; MSI não será distribuído. `--portable-only` passou em 5/5 testes; gerou candidato local e sidecar de uma entrada, com SHA-256 conferido (`c6652188d48ffb3c8eee3cfcbe2e0ea4aae231672650598a232dc880b2998d01`). Extração confirmou launcher/runner e ausência de MSI/banco. Nada publicado. T032 permanece aberto para homologação Edge/Windows 1280×800, roteiro operacional, troca obrigatória de senha e hash externo publicado quando autorizado. Handoff: `caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md`. |
| 2026-10-03 | **PDV v4 — estado T032 atualizado:** suíte Maven completa passou com Java 25 (833 testes, 0 falhas/erros, 3 ignorados); MSI WiX unsigned instalado em escopo per-user e smoke básico aprovado (login API, hashes do manifesto, reinício gracioso e integridade SQLite); banco legado Free preservado. T032 segue aberto: falta homologação Edge/Windows 1280×800, roteiro operacional e validação explícita da troca obrigatória de senha inicial. Uma interação de browser avançou ao dashboard sem definição/verificação deliberada de senha nova; investigar no roteiro, sem considerar o fluxo aceito. `PERF-001–007` permanecem congeladas por decisão do usuário. A obtenção de assinatura MSI deixou de ser critério: em 03/10 o usuário aprovou ZIP unsigned com transparência e hash separado como rota futura. Handoff/status: `caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md` e `STATUS_ATUAL_APLICACAO.md`; alterações sem commit/publicação. |
| 2026-10-02 | **PDV v4 — `PERF-002` instrumentada:** filtro HTTP opt-in com request ID e duração, correlação MDC nos logs dos serviços e tempos no gateway SQLite; configuração permanece desligada por padrão. Testes focados: 4/4 aprovados, incluindo ID único e correlação HTTP→serviços em `/dashboard`; gateway SQLite testado fora da requisição, portanto correlação HTTP→SQLite ainda não validada. Captura operacional controlada pendente; não confundir testes da instrumentação com benchmark. `PERF-005` segue sem aceite: preflight 19:25 com 120 amostras, CPU média 80,82% e pico 100%, sem startup executado; `PERF-006` continua bloqueada. `PERF-001` permanece inconclusiva e `GET /api/dashboard` dispensado. Handoff: `caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md`; alterações ainda sem commit. |
| 2026-10-02 | **Retomada PDV v4 registrada:** `V4L-UI-01–05` concluídos; `PERF-001` permanece inconclusivo (p50/p95 E2E em direções opostas; `GET /api/dashboard` dispensado por decisão do usuário); `PERF-005` tem shutdown validado 3/3, mas startup mediano de 19,899 s acima do alvo de 10 s. Preflight não encontrou baixa carga, então não houve nova medição de startup. Próximo passo é repetir sem JFR sob baixa carga com dados/heartbeat/APPDATA isolados; `PERF-006` aguarda o fechamento de `PERF-005`. Detalhes no handoff da oficina. |
| 2026-09-30 | **CSO COE-B/E publicados em produção** (`e193d6d`): convites por chave, categorias/filtros, gates de veículos inativos, quilometragem por abastecimento/viagem e termos LGPD 2.1. Freeze M1 segue até 08/11/2026, pendente de smoke `-Full`/gates finais; FRO = **08/abr–dez/2027**. Railway `/` e `/q/health` responderam 200; versão efetiva Flyway em produção não foi consultada diretamente. Atualizados AGENTS, wiki e memória do ecossistema. |
| 2026-09-19 | **Memórias sincronizadas:** Hub backend validado em Java 25 (JaCoCo `0.8.14`, Mockito `5.17.0`, Byte Buddy `1.18.14`; `core` 606, `persistence` 541, `web` 274 e `api` verde; WAR gerado); Seed com bloqueio Java 25/Byte Buddy resolvido e teste crítico verde; Retrô atualizado para 139 artigos, com pendência explícita de BOM/byte extra antes do `DOCTYPE` e SEO de `docs/articles.html`. Referências: memórias locais de `caracore-hub`, `caracore-seed` e `caracore-retro`. |
| 2026-09-13 | PDV Java Free **v3.2.6-free** no canal da loja (substitui v3.2.5-free): shell PDV em coluna + caixa registradora; **Restrito** empilhado no mapa Premium; login honesto pós-troca de senha; mesmos limites e login inicial `admin`/`admin`; launcher `iniciar-pdv.bat`; banco `%APPDATA%\caracore\`; browser `localhost:8080/login`; sem PIX gateway / NF-e. ZIP `caracore-pdv-v3.2.6-free-free-{windows,linux,macos}-x64.zip`. SHA256 Windows `4b15a12dbe9b525bdb31be59aff5c226f32cbb40f766eca752744996fda634d9` · Linux `028e5987d35650fd0b2f5f4b2146033e92707b413c0cc8242d05df27e1a26e72` · macOS `7e617aebe895d87ffe0446643751886263f29cbab7422a9e2ac3bcdd0aa5deff`. CTA **Baixar Free (3.2.6)**. Código Free = tag `v3.2.6-free` / `feature/free-3.2.6-pdv-ux`. RC2 v4 continua estacionada; Rust `v0.1.4` inalterado. Sync AGENTS.md + loja + wiki + regras Cursor. Handoff IAs: `CONTINUIDADE_DESENVOLVIMENTO.md` · patch Free ≠ `master` Qute. |
| 2026-09-13 | PDV Java Free **v3.2.5-free** no canal da loja (substitui v3.2.4-free): shell com menu lateral (Início/Produtos/Caixa operáveis; mapa Premium com badges Restrito); opcional «Carregar loja de exemplo» / «Remover exemplos»; empty states; badge `Plano Free · X/100 vendas neste mês · Y/100 produtos`; mesmos limites e login `admin`/`admin`; launcher `iniciar-pdv.bat`; banco `%APPDATA%\caracore\`; browser `localhost:8080/login`; sem PIX gateway / NF-e. ZIP `caracore-pdv-v3.2.5-free-free-{windows,linux,macos}-x64.zip`. SHA256 Windows `e772ca5d57d1c368d80716ce2e8fce5ada488593cf65e2f00206694e79a00fc0` · Linux `85ca05555bb1da59dd0ca493a6a76f7071f7da97d4100cba92f288eec909c6ca` · macOS `dc6cb9666b07900dc01f5b54446281e841e55c854f4bdf84cd8981387b4f110d`. RC2 v4 continua estacionada; Rust `v0.1.4` inalterado. Sync AGENTS.md + loja + wiki + regras Cursor. Handoff IAs: `CONTINUIDADE_DESENVOLVIMENTO.md` (Status 2026-09-13) · patch Free ≠ `master` Qute.
| 2026-09-09 | **Fila núcleo-primeiro:** dez/2026–06/04/2027 = **Hub** (Agent da janela inteira). FRO = **08/04–dez/2027**. Ink PWA sai das datas que não escorregam: Tab; **sem GA com Agent até folga do núcleo (não antes de 2028)**. 26/06/2027 deixa de ser GA. Copy pública honesta na matriz, loja e wiki. |
| 2026-09-09 | **Principais vs brincos:** PDV · CSO · Hub mandam. O resto (Ink, Helianto, RU, OIDC, Seed, Circuito, Área 51, MKT, Minerador) é brinco: em conflito de cota ou headline, cede. `AGENTS.md` · `RISCOS_ECOSSISTEMA.md`. |
| 2026-09-09 | Guia de decisão **`RISCOS_ECOSSISTEMA.md`**: T032, fila única, Hub em abril, brinco vs núcleo, copy à frente da loja. Ponteiros em INICIAR_NOVA_TAREFA, AGENTS.md e calendário de cota. |
| 2026-09-09 | **Helianto GA 30/12/2029** (era 30/12/2027). Agent só em **2029**, depois do CSO Transportes. Envelope Cursor: US$ 20 × 40 meses = **US$ 800** (set/2026–dez/2029). Momento 2 / PWA frota depois de dez/2029. |
| 2026-09-09 | Matriz **Funding / Patrocínio** em `planning.html#patrocinio`: envelope Cursor Pro até dez/2029. Dados em `planning-data.js` (`FUNDING`). Não é P&L (nuvem/domínio fora). CTA `index.html#contato`. |
| 2026-09-09 | Matriz `planning.html`: skyline de **11 torres 0–100%** (checklist de negócio) no horizonte 2026–início 2029. Actualização mensal em `assets/js/planning-data.js`. Nav em index/portfólio/ecossistema. |
| 2026-09-09 | **Cota Cursor fila única** (`CALENDARIO_COTA_CURSOR.md`): US$ 20/mês · teto 80% · 1 produto pesado por ciclo. Registro inicial de calendário, consolidado depois na janela de **08/04–dez/2027** para CSO FRO. FRO **não** começa em outubro (cede ao PDV). M2/PWA frota/VT fora do envelope até dez/2028. |
| 2026-09-09 | Ink Agenda: **não haverá** DMG/DEB nativos. **Novidade** = PWA em **26/06/2027**. Download oficial continua só Windows v2.0.0. Roadmap da matriz: Desktop **Concluído** · PWA **Em andamento**. Loja: `pwa.html` + cartão na home; `download.html` sem PWA. |
| 2026-09-08 | Minerador 4.0 **v1.2.3** na loja (`ete.caracore.com.br`): Windows `.exe` + ZIP, Linux `.tar.gz`, macOS `.dmg`. Corrige Flask morto da v1.2.2 (`pyarmor_runtime` no bundle). Memórias IAs: `AGENTS.md` oficina (Canal público), `ECOSYSTEM_MEMORIA` (bloco ETE), `INICIAR_NOVA_TAREFA`, regras Cursor oficina/matriz. |
| 2026-09-08 | PDV v4: plano de GA escrito (`PLANO_LANCAMENTO_V4.md`); **execução com Cursor adiadas para outubro–novembro/2026** (crédito da assinatura). Setembro = não queimar cota nas 8/19 tarefas. CSO Frotas não no mesmo dia de cota. GA 08/11 permanece objetivo; se outubro não absorver A–D, reavaliar a data. |
| 2026-09-08 | **Frentes 08/11/2026:** PDV v4 = GA público (`PLANO_LANCAMENTO_V4.md`; T032 + transparência de líquido). CSO Frotas = já no ar + freeze Momento 1 (COE; FRO/MON/GPS fora deste dia). Transportes desktop = **08/11/2028**. Headline pública do dia = PDV. CSO continua em andamento sem competir pelo lançamento. |
| 2026-09-08 | Memórias IAs + lojas: logins **por linha** (Java Free = 1 operador `admin`/`admin` em `download.html#perfis`; Rust v0.1.4 = quatro logins em `primeiros-passos.html#perfis`). Wiki aponta, não duplica senha. Colaboração: uma camada por vez; sync AGENTS + ECOSYSTEM_MEMORIA + regras do repo. |
| 2026-09-08 | PDV Rust piloto **v0.1.4**: versão discreta na UI; turno do shell alinhado ao SQLite; Gestão/Auditoria do smoke; NSIS/MSI/ZIP + SHA256 na tag `v0.1.4`. PIX QR + teto de 100 vendas na vida inalterados. Não substitui o Java Free. |
| 2026-09-07 | PDV Rust piloto **v0.1.3**: correção busca/scanner no balcão; NSIS/MSI/ZIP + SHA256 na tag `v0.1.3`. PIX QR + teto de 100 vendas na vida inalterados. Não substitui o Java Free. |
| 2026-09-07 | Memórias IAs sincronizadas (AGENTS.md, ecosystem-cara-core.mdc, ECOSYSTEM_MEMORIA, loja/wiki/matriz/oficina): canal loja = `v3.2.4-free`; RC2 **estacionada** para T032; copy Free sem PIX/recibo; SHA RC2 canónico `5e5d55b6…`. |
| 2026-09-07 | PDV Java Free **v3.2.4-free**: UI de balcão no browser (produto + venda + dinheiro), porta 8080, `/login`, Java 25+. Sem PIX integrado e sem recibo na copy pública. Substitui a 3.2.3-free no download da loja. ZIP sem LEIA-ME interno (sidecar na release). RC2 continua prévia. |
| 2026-09-06 | PDV Java Free **v3.2.3-free**: porta 8080, `/login` de operador, launcher Java 25+, boot `3.2.3-free`. Substitui a 3.2.2-free no download da loja. RC2 continua prévia. |
| 2026-09-05 | PDV planos + loja: Free alinhado a `PlanoLicencaService` (100 vendas/mês, 100 produtos, 1 operador, 4 vendedores, 1 loja, 10 SMS/mês; sem PIX/NF-e). Premium R$ 79,90/mês. CTA da loja = demonstração presencial. Memória IAs sincronizada. |
| 2026-09-06 | PDV Java: pré-release **v4.0.0-rc2** (instalação isolada em pasta nova + `./data/caracore-pdv.db`; login `admin/admin`). RC1 não deve ser reutilizado para primeiro acesso. Canal maduro permanece `v3.2.2-free`. T032/GA aberto. |
| 2026-09-05 | PDV Java: pré-release **v4.0.0-rc1** (Quarkus + Qute, ZIP portátil). Canal maduro permanece `v3.2.2-free`. T032/GA aberto. |
| 2026-09-05 | PDV Java: loja aponta para ZIPs reais da tag `v3.2.2-free` (Windows, Linux e macOS; nomes `free-free` no GitHub). PWA da vitrine em `pdv.caracore.com.br/pwa.html` — não é o caixa. |
| 2026-09-05 | PDV Java oficina: paridade Qute Fases 0–7 técnica (cadastros, fiscal, backup, offline, personas). JavaFX removido do caminho de produção da oficina. **T032 corte não aprovado** (Edge real, suíte completa, instalador assinado). Canal público permanece `v3.2.2-free`. Não substitui o PDV Rust. |
| 2026-09-05 | CSO loja: home de conversão no ar (`cso-transp.caracore.com.br`) — hero Frotas hoje, CTAs `/cadastro`, planos em cards; 2028/GPS/stack abaixo. Sem prova social inventada. |
| 2026-09-05 | CSO Frotas (app): landing com JSON-LD, cache 5 min e LCP WebP em produção (`cso.caracore.com.br`). |
| 2026-09-05 | CSO: loja única centralizada em `D:\onedrive\dev\caracore-cso-releases` (`cso-transp.caracore.com.br`). Oficina `caracore-cso-transportes` sem URL/copy de loja. Em 08/11/2028 as duas frentes viram um só produto. |
| 2026-08-27 | Hosts novos: loja PDV Rust em `pdv-rust.caracore.com.br` (antes rust-pdv); vitrine CSO em `cso-transp.caracore.com.br`. Aplicação Frotas permanece em `cso.caracore.com.br`. Transportes Desktop 08/11/2028. |
| 2026-08-26 | Hub: memória de colaboração para o GA Windows 06/04/2027 (`caracore-hub/docs/contexto-rapido.md`). Web 2.1 pronta; instalador SQLite é o trabalho aberto. Manual público em wiki.caracore.com.br/hub/. |
| 2026-09-06 | Download Rust oficial = `caracore-rust-pdv-releases/releases` (tag v0.1.2). `caracore-pdv-releases` = canal Java. |
| 2026-10-03 | **CSO — RBAC + responsividade:** `3c0e41e` (convites por perfil) e `febaa3c` (mobile/tablet, tabelas acessíveis e navbar compacta) estão em `master`/`origin/master`. `mvn test` 362/362, smoke `-Full` e inspeção visual em seis larguras passaram localmente. Produção `/` e `/q/health` = 200, mas `/login` ainda serve CSS `20260807c` frente ao `20261003b` do commit atual; deploy desta entrega não confirmado. Freeze M1 08/11/2026 inalterado; gates Railway finais pendentes. |
| 2026-08-26 | Wiki + lojas: PDV/CSO/Hub como produtos-chave; Hub = encomendas (não Flask); CSO ≠ GPS. AGENTS.md e `.cursor/rules/ecosystem-cara-core.mdc` sincronizados. |
| 2026-08-20 | Alinhamento total do ecossistema validado: Roadmap sincronizado (Hub 06/04/2027, RU 18/06/2027, Helianto 30/12/2027, CSO Transportes 08/11/2028). Padronização da oficina `caracore-cso-quarkus`. Atualização da stack Java 25 para Ink e RU na matriz. Correção do link "Site Principal" na Wiki. Criação do `AGENTS.md` raiz. |
| 2026-08-15 | Nomes comerciais: **CaraCore CSO** e **CaraCore PDV** (linha Rust); CSO em `https://cso.caracore.com.br/`. |
| 2026-06-27 | Matriz/Blog: Publicado ensaio avulso "A Normose da Engenharia Financeira e o Retrato de Veblen" no blog de Christian Mulato (total 153 artigos), criticando a patologia social de buscar retornos e atalhos digitais rápidos sem esforço real e trabalho duro, assinado como "Cidadão Brasileiro". |
| 2026-06-14 | Matriz/Blog: Publicado artigo avulso "Os Erros Invisíveis na Arquitetura que Ninguém Te Conta" no blog de Christian Mulato, aprofundando o OWASP Top 10 e assinado como "Cidadão Brasileiro". |
| 2026-06-13 | Matriz/Blog/Retrô: Publicado artigo "O Espelho da Linha de Frente" no blog de Christian Mulato (total 151 artigos) assinado como "Cidadão Brasileiro". Atualizado repositórios (personal-articles → caracore-personal) e contagem do Retrô para 117 artigos. |
| 2026-06-07 | Retrô art. **115** — engenharia B2B pragmática na era da IA; links matriz `#engenharia-b2b`, `#decisoes-engenharia`, `suporte-local.html` |
| 2026-06-07 | Tom vitrine matriz: FinOps/resiliência/híbrido (PT/EN/IT); gaps ideológicos wiki/retrô/lojas = backlog |
| 2026-06-07 | Copy B2B PT/EN/IT: `#engenharia-b2b`, frase-guia, `#decisoes-engenharia`, `suporte-local.html`, docs/ só .md |
| 2026-06-02 | Matriz: PDV Rust v0.1.2, CTAs → GitHub Releases |
| 2026-06-02 | Loja rust-pdv: nav Download → releases; Formatos |
| 2026-06-02 | Wiki: links portfólio corrigidos (www); redirect `portfolio.html` |
| 2026-06-02 | Retrô: artigo 114 PDV Rust/Tauri; doc ecossistema expandida |
| 2026-06-02 | `INICIAR_NOVA_TAREFA.md` — guia produtividade |

---

## Checklists publicação

1. `VALIDACAO_LOJAS_MATRIZ.md`
2. `VALIDACAO_NEGOCIO.md`
3. `CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md`
4. Loja Rust: `releases.js` · nav · transparência
5. Oficina Rust: `sync_docs_status.py --full`
6. Smoke: matriz → loja/releases → footer portfólio

---

## Documentos na matriz (índice)

| Documento | Uso |
|-----------|-----|
| [INDEX.md](INDEX.md) | Índice curado docs/ |
| [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) | **Início de tarefa** |
| [SITE_MATRIZ.md](SITE_MATRIZ.md) | Operar site matriz |
| [MEMORIA_DO_PROJETO.md](MEMORIA_DO_PROJETO.md) | Resumo repo matriz |
| [DILEMA.md](DILEMA.md) | Posicionamento e alinhamento copy B2B |
| [FEEDBACK.md](FEEDBACK.md) | Branding Bunker (fev/2026) |
| [ECOSYSTEM_CARA_CORE.md](ECOSYSTEM_CARA_CORE.md) | Mapa repos |
| [ECOSYSTEM_LOJAS.md](ECOSYSTEM_LOJAS.md) | URLs canónicas |
| [VALIDACAO_LOJAS_MATRIZ.md](VALIDACAO_LOJAS_MATRIZ.md) | Checklist matriz ↔ lojas |
| [VALIDACAO_NEGOCIO.md](VALIDACAO_NEGOCIO.md) | Validação comercial |
| [STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md](STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md) | Estratégia |
| `docs/archive/` | Histórico — não operação diária |

---

## Manutenção desta memória

Ao mudar **URL, release, repo ou regra de comunicação**:

1. Atualizar este ficheiro + `INICIAR_NOVA_TAREFA.md` (se afetar fluxo)
2. Atualizar `ECOSYSTEM_CARA_CORE.md` / `ECOSYSTEM_LOJAS.md`
3. Atualizar `project-memory.mdc` do(s) repo(s) tocados
4. Registar linha na tabela **changelog** acima

---

Cara Core Informática — uso interno.
