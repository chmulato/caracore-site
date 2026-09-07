# Memória do ecossistema — retomada de desenvolvimento

Referência única para alinhar **matriz**, **lojas**, **oficinas**, **wiki**, **retrô** e **releases** ao retomar trabalho.

**Atualizado:** 2026-09-07  
**Workspace típico:** `D:\dev\` ou `D:\onedrive\dev`  
**Guia de produtividade:** [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) ← use ao **iniciar nova tarefa**  
**Fonte mestre para IAs:** `AGENTS.md` na raiz do workspace · Cursor: `.cursor/rules/ecosystem-cara-core.mdc`

---

## Retomada em 30 segundos

1. **Nova tarefa?** → [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) (fluxo por tipo de trabalho)
2. **Visão ecossistema:** este ficheiro + `ECOSYSTEM_CARA_CORE.md` + `ECOSYSTEM_LOJAS.md` + **`D:\onedrive\dev\AGENTS.md`**
3. **Produtos-chave:** PDV (Java Free `v3.2.4-free` + candidato `v4.0.0-rc2` / GA 08/11/2026 se T032 + Rust `v0.1.3`) · CSO (Frotas no ar; loja `cso-transp`; Transportes 08/11/2028; ≠ GPS) · Hub (encomendas; GA Windows 06/04/2027)
3b. **CSO retomada:** loja `D:\onedrive\dev\caracore-cso-releases` · app `caracore-cso-quarkus` · oficina Transportes **sem** copy de loja · próximo app = COE-5.1 só se cota
4. **PDV Java:** oficina `caracore-pdv/AGENTS.md` · loja CTA = **Baixar Free**. Free: 100 vendas/mês, 100 produtos, 1 operador, 4 vendedores, 1 loja; UI no navegador; sem PIX integrado e sem NF-e/NFC-e; copy **não** anuncia recibo. Premium R$ 79,90/mês (PIX integrado, fiscal). Canal público = `v3.2.4-free` (`localhost:8080/login`, `admin`/`admin`). RC2 Qute é pré-release. T032 não aprovado. Rust piloto = 100 vendas na vida. **Não** substituir o PDV Rust.
5. **PDV Rust oficina:** `caracore-pdv-rust/docs/contexto-rapido.md` · `status.md` · `caracore-pdv-continuacao.mdc`
6. **Hub oficina (GA Windows 06/04/2027):** `caracore-hub/docs/contexto-rapido.md` · `.cursor/rules/project-memory.mdc` · web 2.1 pronta; trabalho aberto = instalador SQLite. Manual: wiki.caracore.com.br/hub/
7. **PDV Rust (loja + artefatos):** um só repo `chmulato/caracore-rust-pdv-releases` — Pages = `pdv-rust.caracore.com.br` · Releases = https://github.com/chmulato/caracore-rust-pdv-releases/releases (tag v0.1.3). Clone local: `caracore-pdv-rust-releases`. **Nunca** `caracore-pdv-releases` (Java).
8. **Copy B2B:** [DILEMA.md](DILEMA.md) · hero `#engenharia-b2b` · portfólio `#decisoes-engenharia` · tom **FinOps/híbrido** (não anti-cloud na vitrine)
9. **Suporte PME:** [suporte-local.html](../suporte-local.html) — fora do nav B2B; horários noite/sábado só lá

---

## Presenças web (ago/2026)

| Papel | URL | Repo |
|-------|-----|------|
| Matriz | https://www.caracore.com.br/ | caracore-site |
| Suporte PME (PT) | https://www.caracore.com.br/suporte-local.html | caracore-site |
| B2B EN | https://www.caracore.com.br/aligned/en/ | caracore-site |
| B2B IT | https://www.caracore.com.br/aligned/it/ | caracore-site |
| Portfólio | https://www.caracore.com.br/portfolio.html | caracore-site |
| Eco Mundo (matriz) | https://www.caracore.com.br/ecosistema.html | caracore-site |
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

**Regras:** CTAs de download → loja ou GitHub Releases · documentação de produto → wiki.caracore.com.br · matriz → `portfolio.html#{âncora}` · PDV comparação → `#pdv-coexistencia` · sem `/delivery/` em links novos.

---

## PDV Desktop — referência rápida

**Marco v4 (estacionado 07/09/2026):** candidato `v4.0.0-rc2` permanece pré-release isolada — ZIP + SHA256 `5e5d55b6d376c7f1d6ce91a9fb9a73f6d606289af27b508adf2d9eb2cdcd955d` + tag git oficina `v4.0.0-rc2` + handoff `caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md`. Launcher `iniciar_pdv.bat` (underscore); banco só `./data/caracore-pdv.db`. **Não** misturar com Free (`iniciar-pdv.bat` hífen; `%APPDATA%\caracore\`). GA **08/11/2026** se T032 passar. Até o corte, `v3.2.4-free` é o canal Java maduro.

**Planos Java** (`PlanoLicencaService`): Free = 100 vendas/mês, 100 produtos, 1 operador, 4 vendedores, 1 loja, sem PIX/NF-e. Copy pública **não** anuncia recibo. Premium = R$ 79,90/mês, sem teto de 100 vendas, PIX integrado. Loja: CTA = **Baixar Free**; Premium via demonstração. Rust `v0.1.3` = 100 vendas na vida do piloto.

| Papel | Repo / URL |
|-------|------------|
| Java maduro | pdv.caracore.com.br · **v3.2.4-free** · caracore-pdv |
| Java v4 RC2 | tag `v4.0.0-rc2` · T032 aberto · não substitui o Free |
| Rust piloto | pdv-rust (vitrine) · tag GitHub **v0.1.3** em `caracore-rust-pdv-releases` · oficina `caracore-pdv-rust` |
| Coexistência | portfolio `#pdv-coexistencia` · não substituir Java |
| Comunicação | Retrô art. **115** (B2B/IA) · art. 114 (PDV Rust) · wiki projeto-pdv* |

**Discurso:** v3.2.x = Java · v0.1.x = Rust · V3 negócio (PME) = ambas · evitar “PDV v3” sozinho / “migração” / “substitui”.

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
| caracore-retro | Sim | 117 artigos · capa inline `max-width:300px` float-right |
| caracore-pdv-rust | `docs/contexto-rapido.md` | Oficina PDV Rust |
| caracore-hub | `docs/contexto-rapido.md` · `.cursor/rules/project-memory.mdc` | Web 2.1 pronta; GA Windows 06/04/2027 |
| caracore-hub-releases | `.cursor/rules/project-memory.mdc` | Loja hub.caracore.com.br |
| caracore-pdv-rust-releases | Sim | Loja pdv-rust |
| caracore-pdv | `AGENTS.md` · `docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md` · `.cursor/rules/project-memory.mdc` | `v3.2.4-free`; RC2 Qute; T032 aberto; planos em `PlanoLicencaService` |
| caracore-pdv-releases | `.cursor/rules/project-memory.mdc` | Loja pdv.caracore.com.br · CTA Baixar Free · Free 100/mês · sem PIX integrado |
| Demais produtos | Sim | ete, ink, ru, … |

Lista completa: `ECOSYSTEM_CARA_CORE.md`.

---

## Estado recente do ecossistema (changelog)

| Data | Alteração |
|------|-----------|
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
