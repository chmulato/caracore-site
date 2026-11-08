# Memória do ecossistema — retomada de desenvolvimento

Referência única para alinhar **matriz**, **lojas**, **oficinas**, **wiki**, **retrô** e **releases** ao retomar trabalho.

### Ink Agenda — Onda 1 da P1 fechada tecnicamente, inclusive o ramo de agendamento (08/11/2026)

**Estado:** Desktop **2.3.0** (P1 Onda 1, release em **29/01/2027** — data decidida em 08/11/2026; era 06/04/2027, o dia do GA do Hub) com **P1.1** e
**P1.2.1** em 06/11/2026 e **P1.2.2–P1.2.8**, **P1.3.1–P1.3.4** e **G1** em 08/11/2026 — 17 de 17
sub-itens (o **P1.2.8** nasceu do plano de alinhamento e fechou AL-01/AL-02 no mesmo dia). Nada
publicado: o produto no ar continua o **Desktop 2.2.1** e o canal segue keyless desde 07/11/2026.
Falta a **homologação de prints** (H-A04, H-C04, H-C06 e H-A08) na semana de 10–14/11. A data da entrega foi revista no mesmo dia de 06/04/2027 para **29/01/2027**: o corte cai na Fase 2A do Hub (G2 em 05/02) e mar–abr/2027 ficam intocados; a fatia gasta nov+dez+jan (15 dias) e devolve **13 dias (fev–abr) ao envelope do núcleo**.

**Ramo de agendamento (P1.2.6/P1.2.7):** a **V30** acrescenta `attends_sessions` e `specialty` a
`app_users`. O cadastro de equipe pergunta «Atende sessões» e a especialidade; a **recepção** agenda
para todos mas **não entra no seletor**, e o perfil Financeiro nunca atende. O seletor de
profissional existe no diálogo do dia **e no fluxo de Clientes**, e o conflito de horário é por
profissional. A copy segue a skin do nicho — Tatuador(a)/Tatuadores, Dentista/Dentistas,
Profissional de beleza/Profissionais de beleza — sem criar personagens novos. A visão «minha agenda»
(filtro «Todos / Só a minha») fica no **P1.4 (Onda 2)**; o 2.3.0 mantém a visão compartilhada do dia.

**Alinhamento de congruência (P1.2.8, 08/11/2026):** o import do CSV de recuperação passa o
profissional ao detector de conflito (dois profissionais no mesmo horário entram os dois) e o
vocabulário por nicho cobre as telas fora do fluxo do dia, a lista de ignorados do CSV e os 5 erros
do `LegacyDomainSyncService`. A **AL-03** (receita por nicho no caixa) ficou como limitação doc-only,
com nota obrigatória na release (R-A03, rascunho pendente), e a **AL-04** (recorte do aceite) como
recorte doc-only — 9 requisitos, 15 casos e `V27`–`V30` —, sem código novo.

**Gate medido em 08/11/2026:** `mvn -B verify` **745/0** (+8 do gate LGPD), `mvn -Ptestfx verify`
**825/0** (745 + 80 `*FxIT`/IT) e validador demo «Base demo consistente» em base recém-migrada até a
**V30**. Checklist de homologação com **84 casos** (H-C10 e H-C11 entram como «Automatizado verde»).
**Sem commit, push, tag ou release** do 2.3.0 sem pedido explícito do dono.

### Hub — `v2.1.0-rc1.10` publicada com canal de atualização assinado (07/11/2026)

**Publicado:** tag `v2.1.0-rc1.10` em `chmulato/caracore-hub-releases`, como **Latest público e não
pré-release**, por autorização explícita do dono em 07/11/2026; recebida em 22:11 UTC. ZIP portátil
`CaraCore-Hub-2.1.0-rc1.10-windows-x64.zip`, **228.354.977 bytes**, SHA-256
`0b18fbcf3af02d53a341ac5b83af9132a0ef201e698585160f332d3ad8bdae00`; sem instalador NSIS, binários
sem assinatura Authenticode.

**Base da atualização assinada:** chave pública Ed25519 embutida no Hub
(`hub-release-public.pem`, kid `hub-release-2026-a`), conferente fail-closed de SHA-256 e assinatura
do manifesto. O gateway serve `https://api.caracore.com.br/releases/hub/latest.json` com envelope
`releaseDate`/`kid`/`signature`; o `latest.json` publicado tem 746 bytes, SHA-256 `12eab17f…`,
byte-idêntico ao manifesto local. Esta versão **ainda não baixa nem aplica atualização sozinha**.

**Medição:** CI `42415755367` verde em `9746911` (2ª tentativa), `clean verify` 2.608 testes / 0
falhas / 0 erros; E2E 60/1/0 (uma falha de janela do harness, não do produto); pacotes Windows,
macOS e Linux; smoke Linux x64 10/10 no backend `gnome_libsecret`. `B7` (smoke Linux x64) **fechado**
em 07/11/2026 com essa run; `S6.9` segue aberto.

**Ainda não homologada:** aceite de QA da `rc1.10` pendente. A rodada 5 reprovou a `rc1.7`
(N1/N2 bloqueantes). Publicar como Latest no GitHub **não** substitui o aceite formal; o rótulo
editorial continua **Beta (RC)/pré-release**. GA do instalador Windows em 06/04/2027, não homologado.

**Superfícies:** loja `hub.caracore.com.br` (`caracore-hub-releases/docs`), wiki, central
`download.caracore.com.br` e matriz alinhadas a `v2.1.0-rc1.10` no mesmo corte. Tags publicadas não
se reescrevem; a `rc1.8` (31/10, ZIP 324.536.724 B) e as anteriores conservam os pacotes delas.

### PDV v4 — GA em 08/11/2026 propagado ao ecossistema (05/11/2026)

**Decisão:** o dono decidiu por escrito em 04/11/2026 que **a v4.0.0 sai como GA em 08/11/2026**. A
entrada substitui a D-C (03/11) e a D-GE-7 na parte que recusava GA nessa data, e fecha a **D-GA-1**
(`caracore-pdv/docs/arquitetura/DECISOES_GA_V4.md:1053-1123`).

**Medido em 05/11 — nada publicado:** tag `v4.0.0` responde `404`, `caracore-pdv4-releases` responde
`404` e `api.caracore.com.br/releases/pdv-v4/latest.json` responde `404 no_release`; o canal
`latest.json` segue em `3.2.12-free`. Fila da oficina: **#64** pacote GA com as duas chaves →
**#65** T032 17/17 no hash que vai ser publicado → **Gate E escrito** → **#66/#67** canal →
**#68/#69** loja e notas → virada de 08/11.

**Divergência publicada:** a home da vitrine já diz "Lançamento oficial · CaraCore PDV v4.0.0"
(`caracore-pdv-releases/docs/index.html:61`) com "build de 08/11/2026" (`:93`), mas o `download.html`
no ar serve a prévia `v4.0.0-candidato-20261031` e ainda dizia "não é GA". A oficina fixou prazo de
**07/11** para as duas dizerem o mesmo (`DECISOES_GA_V4.md:1077`). Em **05/11** a vitrine foi varrida
**no checkout local** (`caracore-pdv-releases`, 8 arquivos, 43/40 linhas — **sem commit e sem deploy**):
`download.html`, `roadmap-2026.html`, `versoes.html`, `pwa.html`, `tecnologia.html`,
`wiki-release-v3-2-12-free.html`, `wiki-release-v3-2-8-free.html` e `wiki-release-v4-0-0-rc6.html`
passaram a dizer "lançamento marcado para 08/11/2026" com as condições dos gates; só ficaram as
referências legítimas à "prévia v4". **O que está no ar segue na redação anterior** — a vitrine
publicada ainda diz "em pré-lançamento" e "sem data definida".

**Condições em aberto, não presumíveis:** duração do soak, SCA (OSV medido; NVD não — nunca
"0 CVE"), pacote assinado com as duas chaves e canal `pdv-v4`. Até lá o GA está **decidido**, não
**publicado**.

**Corrigido nesta data:** `AGENTS.md` (cabeçalho, canais, produto, marcos, ciclo de vida Java,
tabela de execução, mapa Java, cota, retomada), `docs/CALENDARIO_COTA_CURSOR.md` (datas públicas,
dono do ciclo, ponteiros), `ecosistema.html` (caixa do PDV e nota de fecho), `docs/INICIAR_NOVA_TAREFA.md`
(discurso do CSO, canal da loja PDV e adendo datado que supera o bloco "Estado (2026-10-31)") e,
neste ficheiro, o snapshot e a § "Retomada em 30 segundos" (itens 4, 4a e 5). Os blocos datados abaixo
continuam como histórico e não foram reescritos.

### Ink Agenda 2.2.1 — correção do atualizador e alinhamento de ecossistema (04/11/2026)

**Release:** tag `v2.2.1` em `caracore-ink`, publicada em `caracore-ink-releases` em 04/11/2026.
Assets: Windows setup `.exe` 62.947.840 B, SHA-256 `39eafa4a…270c124b`; Windows ZIP 61.477.189 B,
SHA-256 `4baf257d…deef98b1`; Linux `.deb` 53.419.622 B, SHA-256 `1b89bb76…841cef14`. Os três seguem
**sem assinatura Authenticode**; o `.deb` não foi instalado nesta homologação.

**O que mudou:** o botão «Baixar e abrir instalador» falhava em toda tentativa nas 2.1.0 e 2.2.0
(o GitHub responde 302 e o app só aceitava 200). A 2.2.1 segue até 5 saltos, valida cada salto
(HTTPS, sem credencial, porta 443, domínios oficiais) e mantém o SHA-256 do manifesto assinado como
obrigatório. Jackson 3.1.1 → 3.1.7 fecha os 18 achados OSV da 2.2.0. Gate: `mvn verify` com Java 25,
**713 testes**, 0 falhas. Nenhuma migração nova: bases 2.0.1–2.2.0 abrem no esquema **V26** já criado
na 2.2.0 (`app_users`, PBKDF2).

**Produto (herdado da 2.2.0):** equipe com papéis Administrador/Agenda/Financeiro, mensageria por
WhatsApp ou Telegram que abre o app instalado com o texto pronto (o Ink não envia sozinho, não
confirma entrega nem lê respostas), layout de 1280×800 com mínimo 768×520 e alvos de 44 px.

**Superfícies alinhadas e publicadas em 04/11/2026:** loja Ink com a 2.2.1 em `f65e149` e o
CTA/manual em `0805fdc` (`index`, `download`, `versoes`, `manual`, `primeiro-acesso`, `pwa`,
`tecnologia`, `artifacts/*` e checksums). Wiki (`projeto-ink`, `projetos-overview`, `ecosistema`,
`status`, busca) em `0ffbc5d`; Central (`produtos.json`, `catalog-data.js`, `download`, `index`,
`roadmap`, `mapa`) em `4d30e35`; matriz (`portfolio`, `ecosistema`, `index`, `planning-data.js`,
este AGENTS e docs de ecossistema) neste commit. A conferência no ar depende da propagação do
GitHub Pages.

**Achado corrigido nesta publicação:** `RELEASE_NOTES_v2.2.1.md` (loja) dizia «a base nasce ou
permanece na V25»; o esquema real é **V26** desde a 2.2.0. Corrigido em `0805fdc`, junto com
«2.0.1 a 2.2.0» em `download.html`.

**Pendências:** clique real no botão dentro da interface 2.1.0 → oferta da 2.2.1 não foi medido (só
a classe publicada contra o canal real); percentuais do `planning-data.js` continuam a leitura de
31/10/2026, com a versão 2.2.1 declarada em nota; conferência visual no ar após o Pages.

### Ink Agenda 2.1.0 — release e alinhamento de ecossistema (03/11/2026)

**Release:** tag anotada `v2.1.0` em `caracore-ink` (`b51bc3f`), publicada às 18:40:32Z em
`caracore-ink-releases`. Assets oficiais do CI: Windows ZIP 61.416.136 B, SHA-256
`4e8b6666…55e2551`; setup `.exe` 62.886.400 B, SHA-256 `81fd338f…a1aed4dbd`; Linux `.deb`
53.472.220 B, SHA-256 `58c0d3f0…f870bf18`. O `latest.json` do gateway já serve a 2.1.0 com esses
três assets e `min_supported` 2.0.2.

**Produto:** um executável, três perfis — Tatuagem & Arte Corporal (lilás), Odontologia & Saúde
(turquesa) e Beleza & Estética (dourado) — com paleta, vocabulário e catálogo financeiro por nicho.
Preferência em `app_preferences` (V24), sementes V25, bases 2.0.1–2.0.4 migram sem perda e o perfil
Tatuador é o padrão. macOS segue sem instalador; a 3.0 em PWA não vem antes de 2028.

**Superfícies publicadas em 03/11/2026:** wiki (`projeto-ink`,
`projetos-overview`, `status`, `ecosistema`, busca), Central (`produtos.json`, `catalog-data.js`,
`download.html`, `index`, `roadmap`, `mapa`), loja Ink (`index`, `download`, `versoes`, `manual`,
`primeiro-acesso`, `pwa`, `tecnologia`, `canal-feedback`, `mirror-delivery`, `artifacts/*` e
checksums) e matriz (`portfolio`, `ecosistema`, `index`, docs de ecossistema).

**Pendências medidas:** o macOS foi **aposentado** da linha 2.x: o job `build-macos` e o script de
delivery foram removidos da oficina (commit `1d1780a`), e o corpo da release e o `releaseNotes` do
gateway já saem só com Windows e Linux. A Central e a loja Ink mantêm, no HTML, os mesmos números do
canal como fallback; a página `versoes.html` agora separa 2.1.0 (atual) de 2.0.4 (histórico).
Inspeção visual em navegador ainda não refeita para esta rodada.

### Como uma IA abre uma feature nova (30/10/2026 — ler antes de editar código)

**Fonte mestre:** `caracore-site/AGENTS.md` + este ficheiro. O antigo `D:\onedrive\dev\AGENTS.md` **não existe
mais**: todo ponteiro para o "AGENTS.md da raiz do workspace" está morto e não deve ser seguido nem citado.

**Ordem de leitura:** `AGENTS.md` → este ficheiro → `INICIAR_NOVA_TAREFA.md` → `project-memory.mdc` **do repo
da tarefa**. A memória da oficina manda no estado do produto; este documento manda na copy institucional.

**Camadas — uma por vez:** oficina (`caracore-<produto>`, código) → loja (`caracore-<produto>-releases`,
vitrine e assets) → Central (`caracore-loja`, catálogo único) → matriz (`caracore-site`, resumo + CTA) → wiki
(`caracore-wiki`, manual e alinhamento). Nunca editar vitrine dentro da oficina, nunca publicar `WAR`/binário de
build como release.

**Antes de escrever qualquer coisa:** contrato de promessas (`docs/PROMPT_HONESTIDADE_PROMESSAS.md`) — sem
`arquivo:linha`, teste ou run não é fato; estado antes de adjetivo; tela protegida não é API protegida; default
do fornecedor se declara; aceite não atravessa builds. Tabela renderizada por `assets/js/*-data.js` **é copy**:
atualizar só o HTML deixa a tela mentindo (foi assim que a Central e a matriz quase publicaram dado velho).

**Estado por produto (31/10/2026)**

| Produto | Estado medido | Onde começar |
|---|---|---|
| PDV Java v4 | **GA recusado no Gate E**; rota `rc7` curta + GA em data escrita (`D-GE-7`); prévia pública = `v4.0.0-candidato-20261031` (build 31/10, fonte `c343890`, SHA `0c2003b0…83434d`, 178.317.680 B; run `41244424886`, 1.039 testes, 0 falhas, 3 ignorados, LINE 52,82%); `v4.0.0-rc6`/`rc5` no histórico, RC7 sem tag; pacote `ff400efd8737…` mediu T032 16/16 e matriz 11/11 — **não esta candidata**; **SCA não medido** e cenário migrado bloqueado; superfícies públicas **publicadas na candidata em 01/11/2026** (loja `e54476d`, wiki `fb040bf`, Central `45835e5`, matriz `fd4b150`, todas com Pages `built`) | `caracore-pdv/AGENTS.md` § "Como desenvolver uma feature nova na v4" |
| PDV Java 3.2.12 | **versão anterior** na copy desde 29/10, ainda a indicada para operar; GitHub ainda marca Latest; manutenção só até 08/11/2026 | `caracore-pdv/AGENTS.md` § Diretriz de transição |
| Hub | `v2.1.0-rc1.8` publicada em 31/10 (ZIP portátil, SHA `3c4e61b2…743334`, 324.536.724 B; `clean verify` 2.585/0 e E1–E6 PASS em `9874273`), **sem aceite de QA**; a `rc1.7` foi **REPROVADA** na rodada 5 (N1/N2 bloqueantes); rótulo editorial Beta (RC)/pré-release mantido apesar do Latest no GitHub; GA 06/04/2027 | `caracore-hub/.cursor/rules/project-memory.mdc` § "Como desenvolver uma feature nova" |

**Entrega:** commit e push só com autorização explícita, por ação; nos repos de site, PR + merge (rebase, sem
merge commit) só quando pedido. Evidência de execução vale no dia (copiar run + log + artefato). Prompt da
próxima tarefa sempre em `.txt` em `docs/` da oficina. Publicação é passo separado, nunca efeito de commit.

### Canal de atualização da frota desktop — pdv/hub/cso/ink no mesmo gateway (01/11/2026; ink em 02/11/2026)

**Fonte da verdade (decisão de 02/11/2026):** `caracore-api` é a única fonte da verdade do Gateway de
versões da Cara Core Informática (contrato, `AppCatalogo`, rotas `/releases/{app}/latest(.json)`). O
`caracore-cso-quarkus` apenas espelha o núcleo. **`AppCatalogo.java` é primário no `caracore-api`** e o
CSO deve refletir exatamente essa classe (e as outras cinco do núcleo): alterar só no `caracore-api`,
replicar com `python caracore-api/scripts/sincronizar_nucleo_cso.py --aplicar` sempre que a versão/catálogo
de um app mudar (ex.: Ink Agenda) e conferir com `verificar_nucleo_cso.py` (byte a byte). Sem CI
cross-repo (exigiria PAT entre repositórios): a sincronização é manual e nunca faz commit sozinha. Estado em 02/11/2026:
`ink` no `AppCatalogo` commitado nos dois (`caracore-api` `7054dad`, `caracore-cso-quarkus` `0f6f1a8`).
**Ressalva:** o `application.properties` do `caracore-api` ainda não tem `caracore.api.apps.ink.*`
(`repo`, `asset-regex`) — só o `cso-quarkus` tem — e o endpoint de produção hoje roda do deploy do
`cso-quarkus` (Railway). Portar essas propriedades e a variável `CARACORE_API_APPS_INK_REPO` antes de
mover o deploy para o `caracore-api`.

**Estratégia de desacoplamento (02/11/2026):** o `caracore-api` é a fonte primária da *especificação* do
Gateway de versões; o `caracore-cso-quarkus` só **hospeda temporariamente a réplica** do serviço. Para a
migração futura a um servidor dedicado sem impacto nos desktops, as rotas usam URLs/interfaces neutras
(`api.caracore.com.br/releases/{app}/latest(.json)`, sem nome do CSO, contrato JSON estável, URL compilada
nos clientes): migrar = trocar deploy/DNS. Regra nos dois `AGENTS.md`; wiki em `projeto-cso.html#gateway-versoes`.
Sem data aprovada para a migração.

Infra transversal aos desktops (PDV, Hub, CSO Gestão de Transportes, Ink Agenda). Gateway embutido hoje no
**`caracore-cso-quarkus`** (api.caracore.com.br, Railway), pacote `br.com.caracore.api.update`, rotas
`/releases/{pdv|hub|cso|ink}/latest(.json)` no Router do Vert.x (fora do JAX-RS); o legado
`/releases/latest.json` é o app **pdv**. **ink** → 200 `2.2.1` (3 assets: windows-setup, windows-zip e linux-deb com os SHA-256 oficiais, envelope assinado com `key_id ink-2026-11`; medido em 04/11/2026, `published_at` 2026-11-04T21:07:10Z, `min_supported` 2.0.2). O `releaseNotes` do envelope sai só com Windows e Linux — **macOS não tem instalador**.

- **Estado medido ao vivo em 04/11/2026:** pdv → 200 `3.2.12-free` · hub → 200 `2.1.0-rc1.8` · ink → 200 `2.2.1` ·
  cso → 204 (fiação armada; falta a 1ª release real e um cliente de atualização no desktop do CSO).
- **Variáveis reais no Railway:** `CARACORE_API_APPS_HUB_REPO`, `CARACORE_API_APPS_CSO_REPO` e
  `GITHUB_PAT`. Os nomes curtos `HUB_REPO`/`CSO_REPO` nunca existiram — placeholders do properties
  alinhados nos commits `a171141`/`ae635a5` do cso-quarkus (pushados e deployados em 01/11).
- **Contrato:** 200 = JSON com `version`/`downloadUrl`/`sha256`/`releaseNotes`/`mandatory`; 204 = nada
  publicado (não é erro); cache de 15 min em memória guarda também a ausência; pré-release **não** entra
  no Latest. Virada do canal = promover a release no GitHub, sem mudar código. Round-trip validado no
  ambiente real (release dummy → 200 → apagada → 204 após redeploy).
- **Clientes:** PDV `UpdateManager` (URL compilada, `/releases/latest.json`); Hub
  `CanalAtualizacaoClient` (`/releases/hub/latest.json`, token de licença no header, nunca em log);
  CSO desktop ainda sem cliente — é a peça que falta para o trio fechar.
- **Suporte:** o gateway derruba junto o canal e o SaaS do CSO (mesmo deployment), mas o cliente desktop
  degrada sem bloquear o operador. Suíte do cso-quarkus: 430 testes/0 falhas (21 do canal).

### Checkpoint 01/11/2026 — superfícies publicadas na prévia de 31/10 e fila de retomada

**Estado medido em 01/11/2026.** As quatro superfícies que descrevem o PDV Java foram alinhadas à candidata,
commitadas, empurradas e conferidas ao vivo; o GitHub Pages construiu o commit exato em todas:

| Repositório | Superfície | Commit | Pages |
|---|---|---|---|
| `caracore-pdv-releases` | pdv.caracore.com.br | `e54476d` | `built` |
| `caracore-wiki` | wiki.caracore.com.br | `fb040bf` | `built` |
| `caracore-loja` | download.caracore.com.br | `45835e5` | `built` |
| `caracore-site` | caracore.com.br | `fd4b150` | `built` |

- **Prévia pública = `v4.0.0-candidato-20261031`** (release publicada em 31/10/2026 22:36Z com
  `prerelease=true` e `draft=false` pelo dono): ZIP `CaraCore-PDV-4.0.0-qute-portable-windows-x64.zip` de
  **178.317.680 B**, SHA-256 `0c2003b0f99a75328f7ebe632fc20b07cb5834a3f75b6f0e97ccfb7aef83434d`, sidecar de
  116 B. A vitrine usa `download.html#pre-release-v4`; a RC6 vai para `#rc6` como prévia anterior;
  `#instalacao-rc6` não existe mais. Selo: **"Em pré-lançamento · prévia candidata"**, sem data
  (selo é status, data é build).
- **O canal de atualização continua em `3.2.12-free`** (`https://api.caracore.com.br/releases/latest.json`,
  medido em 01/11: `version=3.2.12-free`, `sha256=6d7a50b0…`). É o comportamento correto enquanto a v4 for
  pré-release — não "consertar" o canal antes do GA.
- **Resíduo de copy conhecido:** o corpo da release `v3.2.12-free` no GitHub — que o canal espelha em
  `releaseNotes` — ainda diz "A linha v4 RC6 permanece separada, como pré-release". Só se corrige por
  `gh release edit` (ação de publicação, exige pedido do dono; não muda tag nem asset).
- **A memória da oficina estava atrás desta publicação:** `caracore-pdv/AGENTS.md` ainda dizia que a prévia
  pública era a RC6 e que nada tinha sido publicado no ciclo. Corrigido em 01/11/2026 no próprio ficheiro;
  o que governa é este checkpoint + o checkpoint de Gate E de 30/10.

**Próximas tarefas — em ordem de dependência, cada uma com a evidência que a fecha**

| # | Frente | Tarefa | Fecha com | Onde começar |
|---|---|---|---|---|
| 1 | PDV v4 | Rodar o ciclo manual do T032 (16 passos) no ZIP de 31/10 | `16/16` medido no próprio binário, evidência copiada em `scratch/` no dia | `caracore-pdv/docs/prompt-proxima-tarefa-ga-v4-entrega-20261029.txt`; sonda `scripts/sonda_matriz_m_t032.py` |
| 2 | PDV v4 | Medir a matriz M01–M11 no mesmo pacote | tabela medida no hash; **M11 declarado bloqueado** (PERF-001–007) | `caracore-pdv/scripts/sonda_matriz_m_t032.py`; formato de `caracore-pdv/docs/relatorio-rc7.md` |
| 3 | PDV v4 | Medir SCA/G1 (`D-SCA-1`) | run do dependency-check com feed atualizado + laudo; **nunca "0 CVE"** | `caracore-pdv/docs/arquitetura/DECISOES_GA_V4.md` § `D-SCA-1`; falta `NVD_API_KEY` |
| 4 | PDV v4 | Desbloquear o cenário "banco 3.2.12 migrado" | `9/9` no pacote novo, sonda sempre sobre cópia | `caracore-pdv/scripts/cenario_banco_migrado_t032.py` |
| 5 | PDV v4 | Escrever a `rc7` curta | tag + ZIP + T032/matriz no hash + run de push verde | `D-GE-7`; **aprovação escrita do dono (F7)** |
| 6 | PDV v4 | GA em data escrita | data escrita + aceites formais + estágio anterior fechado | `caracore-pdv/docs/arquitetura/DECISOES_GA_V4.md` § `D-GA-1` |
| 7 | PDV v4 | Apontar o canal para a v4 quando promovível | `latest.json` com a v4 + `sha256` + download 200 + notas sem "RC6" | `caracore-cso-quarkus` pacote `br.com.caracore.api.update`; deploy Railway autorizado |
| 8 | PDV 3.2.12 | Decidir o que acontece com o download depois de 08/11/2026 | decisão escrita do dono refletida nas quatro superfícies; nada muda sozinho | este documento + memória da oficina |
| 9 | Hub | Aceite de QA da `v2.1.0-rc1.10` | rodada concluída, **N1/N2** e S6.9 resolvidos (B7 fechado em 07/11/2026); rótulo Beta (RC) só cai com aceite formal | `caracore-hub/docs/contexto-rapido.md` · `docs/handoff-construtora-hub-rc1.7-20261027.txt` |
| 10 | CSO | Seguir Transportes + VT | INT-03 estima total de sprints/ciclos (hoje 0/21); alvo conjunto 08/11/2028 | `caracore-cso-transportes/docs/plano_organizado_execucao_cso.md` |

**Conferir publicação sem presumir:** `git -C <repo> rev-parse --short HEAD` + `gh api
repos/chmulato/<repo>/pages/builds/latest --jq '.status + " " + .commit'`; conteúdo ao vivo por `curl` com
cache-bust (`?cb=...`). O Pages pode servir o build anterior por alguns minutos — build `built` no commit
certo é o que prova.

### PDV v4 em pré-lançamento — virada de discurso no ecossistema (29/10/2026, loja e wiki publicadas)

Decisão do dono nesta data: **focar o pré-lançamento da v4 e tratar a 3.2.12-free como versão antiga**.
O discurso passa a ter dois estados, aplicados em loja (`caracore-pdv-releases`), wiki (`caracore-wiki`)
e matriz (`caracore-site`):

- **PDV v4 = em pré-lançamento.** Prévia pública de avaliação = `v4.0.0-candidato-20261031` (Windows x64,
  build 31/10/2026, SHA-256 `0c2003b0…ef83434d`), desde a rodada de 31/10/2026; `v4.0.0-rc6` (SHA
  `0c00b24b…780d5325`) e `v4.0.0-rc5` ficam no histórico. Não é GA, não é “estável”, não é “Latest”;
  GA só depois dos gates e aceites formais (**D-GE-7/D-GA-1** abertas). A RC7 é a rota aprovada do Gate E,
  ainda sem tag publicada.
- **3.2.12-free = versão anterior.** Última da linha 3.2.x, em manutenção de transição até 08/11/2026,
  **ainda a indicada para operar** até a v4 ser aprovada. Some o rótulo “estável/Latest” da copy pública;
  o fato histórico da publicação de 15/10 permanece.

**Superfícies alteradas (só árvore de trabalho):** loja `download.html`, `index.html`, `versoes.html`,
`pwa.html`, `roadmap-2026.html`, `tecnologia.html`, `homologacao-v4.html` + `portal-style.css` (novo selo
`.selo-anterior`) + `README.md`; wiki `projeto-pdv.html`, `index.html`, `projetos-overview.html`,
`guia-estagiario.html`, `projeto-pdv-rust.html`, `tecnologias.html`; matriz `index.html`, `portfolio.html`,
`ecosistema.html`, os dados renderizados em runtime (`assets/js/catalog-data.js`, `planning.js`,
`planning-data.js`) e os docs de estado (`docs/ECOSISTEMA.md`, `docs/ECOSYSTEM_CARA_CORE.md`,
`docs/ECOSYSTEM_LOJAS.md`, `docs/INICIAR_NOVA_TAREFA.md`, `docs/MEMORIA_DO_PROJETO.md`, `README.md`).
Lição repetida da auditoria de 26/10: **tabela renderizada por `assets/js/*-data.js` também é copy** —
HTML atualizado com o dado antigo no JS é regressão.

**Bloqueado por decisão, não escrever antes do aceite:** nome final da versão, SHA-256 do pacote de GA,
página `wiki-release-v4-0-0.html` e qualquer “0 CVE” (SCA segue **não medido**, D-SCA-1).

**Publicação (autorizada pelo dono nesta data):** `caracore-pdv-releases` no commit `b29f6a4` e
`caracore-wiki` no commit `8c8517a`, ambos com GitHub Pages `built` e conferidos ao vivo por `curl` com
cache-bust. Nada tagueado; o produto em si segue sem publicação (F7 aberta).

**Segunda rodada — Central, Rust e memória interna (mesma data, árvore de trabalho):** por decisão do dono
(“tudo, incluindo a memória interna”), o mesmo vocabulário foi aplicado em três repositórios.
`caracore-loja` (Central, `download.caracore.com.br`): `docs/download.html`, `docs/index.html`,
`docs/mapa.html`, `docs/roadmap.html` e **`docs/assets/data/produtos.json`** — este último é obrigatório
porque `assets/js/download-app.js:134-145` sobrescreve `.status-badge` a partir do JSON; o catálogo mantém
o filtro **Estável/Piloto/Preview** (`data-maturity` intacto) e muda só o rótulo visível para
**“Versão anterior · indicada para operar”** e **“Em pré-lançamento”**.
`caracore-pdv-rust-releases` (`pdv-rust.caracore.com.br`): `docs/index.html` e `docs/download.html` — a
caixa de convivência deixou de dizer “linha estável” e “prévia da próxima edição”; esse repo **não** tem
trap de JSON (só `docs/assets/data/release-latest.json`).
Memória interna: `caracore-site/AGENTS.md` (bloco novo de 29/10 na cabeça + tabela de produtos, marcos,
canais, coexistência, calendário e fontes de retomada), `caracore-loja/AGENTS.md` + `README.md`.
**Regra nova registrada:** *selo é status, data é build* — foi colar data em selo que produziu a leitura
falsa “a linha antiga é mais nova” (manutenção 15/10/2026 × prévia 10/10/2026) e obrigou a trocar o rótulo
da linha de comparação para **“Último build”** com nota explicativa.

### Convenção — prompt de próxima tarefa sempre em `.txt` (24/10/2026)

Regra do dono, válida para todas as oficinas: o prompt da próxima tarefa é entregue **em `.txt`**
(ASCII, CRLF, sem markdown) em `docs/` da oficina, com o nome
`prompt-proxima-tarefa-<tema>-<AAAAMMDD>.txt`. O `.md` de mesmo nome fica como espelho de leitura
(tabelas e links relativos) e **não** substitui o `.txt`. Não perguntar o formato nem entregar só
o `.md`. Registrado também em `AGENTS.md` (§ Como IAs colaboram, item 6), no espelho
`caracore-site/AGENTS.md` e em `caracore-hub/.cursor/rules/project-memory.mdc`.

### Coerência — correções de copy aplicadas (27/10/2026, local, sem nova tag)

Fechadas as divergências da auditoria de 26/10, com evidência de código:

- **Tela de auditoria.** `caracore-hub-releases/docs/download.html:43`, `RELEASE_2.1.0-rc1.6.md`
  e o **corpo da release no GitHub** (editado em 27/10 por `gh release edit`, sem tocar assets ou tag)
  passaram a dizer que **Auditoria e Logs** (`/admin/auditoria`, ADMIN —
  `AdminAuditoriaServlet.java:21`) se abre **pela URL nesta RC**; o item de menu entra na próxima.
  A wiki (`docs/hub/admin.html:123-124`) separa **Log de Auditoria** (`/auditoria/lista`) de
  **Auditoria e Logs** (`usuario_auditoria`) e registra que a primeira não mostra as ações da segunda.
- **Deck Tia Sócia.** `docs/slides/assets/js/apresentacao-tia-socia.js:28` saiu de `rc1.2` para
  `v2.1.0-rc1.6`.
- **Memória interna sem `rc1.2` como versão a publicar.** `caracore-loja/AGENTS.md:32,53`,
  `caracore-loja/README.md:25`, `caracore-wiki/README.md:20`,
  `caracore-wiki/.cursor/rules/project-memory.mdc:48,50`,
  `caracore-hub-releases/.cursor/rules/project-memory.mdc` e
  `caracore-site/.cursor/rules/project-memory.mdc:17-19`. O `project-memory` do hub-releases agora
  avisa que **só `docs/` é publicado** e que as cópias da raiz são legadas; o README do repo também.
- **Precisão.** `caracore-site/assets/js/planning-data.js:42,44` → “RC7 não publicada (candidatos
  locais de 12/10; D-RC7 aberta)”; `caracore-pdv/docs/arquitetura/STATUS_ATUAL_APLICACAO.md:24`
  marcado como **histórico** (step 7 verde em `40421491568`); nota da `v4.0.0-rc6` (local e corpo no
  GitHub) trocou “Latest continua v3.2.7-free” por “estável/Latest é a `v3.2.12-free` desde 15/10/2026”.

**Fato novo medido:** a recuperação de senha exige **12 caracteres**
(`CodigoRecuperacaoService.java:27`, aplicado em `:229-231`), enquanto `Usuario.java:40` ainda declara
`@Size(min = 6)`. É divergência **de código**, não de copy — **fechada na `v2.1.0-rc1.7`**, que
unificou o mínimo em 12 caracteres e o máximo em 72 bytes em todos os caminhos e passou a gerar a
senha temporária com 16 caracteres.

**Escopo do que está no ar:** apenas os dois corpos de release foram alterados no remoto. Loja, central,
matriz e wiki seguem com estas correções **locais, sem commit nem push**. Status público inalterado:
pré-release não homologada, GA 06/04/2027.

### Hub — `v2.1.0-rc1.7` publicada nas quatro camadas (27/10/2026)

**Publicado, e nada além disso:** a pré-release `v2.1.0-rc1.7` está no ar em
`chmulato/caracore-hub-releases` como **Pre-release** (não Latest, não GA), unsigned. EXE
`CaraCore.Hub-2.1.0-rc1.7-win-x64.exe` 274.162.562 B
`1563f1bd343b0044f9a64dd9bb7d3a1604761ee7f1e2354e8663b693cb310ba1`; ZIP
`CaraCore.Hub-2.1.0-rc1.7-win-x64.zip` 324.502.796 B
`924af1960ccda606e4b3979ff36741f7e78228f8f77c396ccb985878b940b37e`; WAR interno 69.448.885 B
`73b9adf5233598362f34cd4a7ac4128fd71c5805aede8f13110cd8d0fc2023b0`, o mesmo em `web/target`,
`electron/app` e `electron/runtime/tomcat/webapps`. Os dois `.sha256` e os dois manifestos estão na
release; os binários foram baixados de volta e conferidos por SHA-256 e tamanho.

O que a `rc1.7` muda em relação à `rc1.6`: **uma única política de senha — mínimo de 12 caracteres
e máximo de 72 bytes** — no setup, na recuperação por código offline, na troca pelo perfil e no
cadastro pelo administrador, com senha temporária de **16 caracteres** gerada por `SecureRandom`
(antes, cinco regras diferentes, com mínimo 6 na troca pelo perfil, e temporária de 8); e
**Auditoria e Logs com item no menu** (`navbar.jsp`, Administração → Auditoria e Logs, abaixo de
Log de Auditoria), resolvendo a tela órfã que a auditoria de coerência de 25/10 apontou. Nada mais
mudou de comportamento: RBAC por perfil com `403` em JSON, `usuario_auditoria` (V18), canais
travados em Mercado Livre/Shopee/Temu e a saída de `test.jsp`, `usuarios-demo.jsp`,
`UsuariosServlet` e da ROOT padrão do Tomcat continuam vindo da `rc1.6`.

Gate desta build, medido no mesmo código do pacote (commit `ce9007f`): `npm run verify` **PASS** em
`dist_hub/verify/20261027T150209Z` (`promotable=true`, `dirtyEntries=0`, 22min06s, 2.555 testes,
8 ignorados, 0 falhas, E6 com 0 ALTA/0 média e OWASP 1 CVE em 120 dependências) e E2E dos bytes
publicados com **62 PASS / 1 WARN / 0 FAIL** (instalador) e **60 PASS / 1 WARN / 0 FAIL** (ZIP).
**Não homologada:** rodada 5 de QA, **B7** (smoke Linux x64) e **S6.9** (decisões do dono) seguem
abertos. GA em 06/04/2027. A tag `v2.1.0-rc1.6` conserva o pacote de 25/10/2026; `rc1.3`, `rc1.4`
e `rc1.5` nunca foram tagueadas.

Quatro camadas alinhadas no mesmo corte: loja `hub.caracore.com.br`, central
`download.caracore.com.br`, wiki `wiki.caracore.com.br` e matriz. Versão, tamanho e SHA-256
conferidos contra o manifesto, e wiki e central deixaram de citar `rc1.6` como versão vigente.

### Hub — `v2.1.0-rc1.6` publicada, auditoria de coerência e mapa do GA (25/10/2026)

**Publicado, e nada além disso:** a pré-release `v2.1.0-rc1.6` está no ar em
`chmulato/caracore-hub-releases` como **Pre-release** (não Latest, não GA), unsigned. EXE
`CaraCore.Hub-2.1.0-rc1.6-win-x64.exe` 274.160.424 B `05b87529…b4afc8c4`; ZIP
`CaraCore.Hub-2.1.0-rc1.6-win-x64.zip` 324.500.797 B `fe3400c7…17a17c9c0d`; WAR interno 69.447.783 B
`70a3f900…` idêntico em `web/target`, `electron/app` e `electron/runtime/tomcat/webapps`. Electron
35.7.5 · Java 25.0.4.1+1 · Tomcat 10.1.60. As quatro camadas foram empurradas e conferidas: loja
`b3dc257`, central `f919ce6`, matriz `161b536`, wiki `d919cdd`, oficina `40a8657`. As versões `rc1.3`,
`rc1.4` e `rc1.5` **nunca foram tagueadas**; `rc1.2`, `rc1.1` e `rc1` continuam no histórico.

Gate desta build: `npm run verify` **PASS** em `dist_hub/verify/20261025T214503Z` (17min26s,
`promotable=true`, `dirtyEntries=0`, 2.555 testes, E6 com 0 Alta/0 Média, OWASP 1 CVE triado) e E2E dos
bytes publicados com **61 PASS / 1 WARN / 0 FAIL** (instalador) e **59/1/0** (ZIP). **Não homologada:**
rodada de QA, **B7** (smoke Linux x64) e **S6.9** (decisões do dono) seguem abertos. GA em 06/04/2027.

O que a `rc1.6` entrega e a `rc1.2` não tinha: **RBAC por perfil** na API (ADMIN `200` ×
OPERADOR/SUPERVISOR `403`, em JSON), **auditoria de usuários persistida** (`V18__cria_usuario_auditoria`,
`GET /api/auditoria/usuarios`, card em `admin/auditoria.jsp`), **`403` no contrato JSON**
(`ContratoDeErro` + `ForbiddenExceptionMapper`), freemium/backup/diagnóstico da `rc1.5`, `test.jsp` /
`usuarios-demo.jsp` / `UsuariosServlet` e a ROOT do Tomcat fora, canais AMAZON/B2W travados.

**Auditoria de coerência do ecossistema contra esses bytes:** versão, hashes, tamanho, data, status
Pré-release e ressalvas de honestidade bateram nas quatro camadas. **Uma divergência**, com arquivo e
linha: a loja promete a auditoria de usuários “em **Administração → Auditoria e Logs**”
(`caracore-hub-releases/docs/download.html:43`), mas `navbar.jsp:107` só aponta `/auditoria/lista`
(“Log de Auditoria”) e **nenhum** JSP/XML do webapp cita `admin/auditoria` — `AdminAuditoriaServlet` →
`admin/auditoria.jsp` existe e só é alcançável digitando a URL. A wiki agrava:
`caracore-wiki/docs/hub/admin.html:123` descreve filtros por usuário/data/tipo e exportação sob
“Administração → Auditoria”, o que é `/auditoria/lista` (`auditoria/lista.jsp:43,140,249`,
`/api/auditoria/exportar`) e **não** mostra `usuario_auditoria`. O gate não pega porque
`scripts/verify_hub_e2e.ps1` sonda `/admin/auditoria` como anônimo (302), `403` JSON e persistência da
API, mas nunca o caminho de entrada na interface. **Correções:** item de menu → exige **`rc1.7`** (tag
publicada não se reescreve); separar as duas telas no manual da wiki → pode sair **já**, sem RC; check
de presença do link no E2E.

**Mapa do caminho até o GA** (três estados, gates abertos, as 8 decisões do dono e ordem de execução):
`caracore-hub/docs/status-hub-ga-2027-20261025.md`. Memória da oficina: `contexto-rapido.md` (topo) e
`.cursor/rules/project-memory.mdc`. **Não** chamar a `rc1.6` de estável, de versão final ou de GA.

### Hub — Sprint 6 em 6/14, retrato de saúde e fila da `rc1.4` (23/10/2026)

Oficina `caracore-hub`, **sem tag e sem asset**: a loja continua servindo `v2.1.0-rc1.2`
(unsigned, reprovada pela QA da rodada 4) e o GA segue 06/04/2027. A oficina está em
`2.1.0-rc1.3`, e essa build **falhou na E2E de 20/10** (17 PASS / 2 WARN / 4 FAIL).

O quadro real é **6 de 14 `[x]`** (S6.0, S6.2, S6.3, S6.6, S6.11, S6.12). Fecharam nesta
rodada o **S6.2** (SQLite real: migração do zero, `SqlPortabilidadeTest`, concorrência sem
`SQLITE_BUSY` e migração **V16** alinhando os CHECKs de status aos enums) e o **S6.3**
(HTTP: 22/22 casos, 26 raízes de `/api/*` em 401 JSON sem `Set-Cookie`, 13 telas em 200,
ADMIN×OPERADOR 200/403), com `clean package` de 2.436 testes e 0 falhas. **Os dois
fechamentos estão no working tree, sem commit:** quem clona o repo não os vê e
`npm run verify` continua saindo `promotable=false`.

Seguem abertos S6.1, S6.4, S6.5, S6.7, S6.8, S6.9, S6.10 e S6.13, mais **S6.14 proposto**
(RBAC por perfil). A fila que destrava a `rc1.4` é **B7** (run verde do smoke Linux x64) →
**E7** (app empacotado) → **S6.7** (rodada limpa + bloco `verify` no manifesto + job de CI)
→ **S6.13** (E2E do pacote) → **S6.10** (tag). **S6.9** depende só do dono: assinatura C7,
`UAC.dll` de 2015 C4, login da conta real e T1 (Defender nesta máquina ou em VM).

Armadilhas conferidas na árvore, não só em laudo: `RolesAllowedDynamicFeature` não é
registrada (`@RolesAllowed` é decorativo e existe só nas duas `AdminLogsResource`),
`web.xml` sem `session-config` (30 min é default do Tomcat), `outputTimestamp` ausente nos
5 POMs (WAR não reprodutível), CSRF só em três servlets de formulário e `/api/health/ready`
privada por comparação exata de caminho, com `ex.getMessage()` no `detail`.

Retrato de saúde por dimensão, com a evidência de cada nota:
[`caracore-hub/docs/avaliacao-saude-aplicacao-20261023.md`](../../caracore-hub/docs/avaliacao-saude-aplicacao-20261023.md).
Próxima tarefa escrita:
[`prompt-proxima-tarefa-saude-rc14-20261023.md`](../../caracore-hub/docs/prompt-proxima-tarefa-saude-rc14-20261023.md)
(`.md` e `.txt`). O `README.md` da oficina foi corrigido (dizia "Sistema 100% finalizado e em
produção" e tratava PostgreSQL/Redis como stack) e `project_hub/docs/` foi marcada como
**legado congelado**. Sem resposta do dono ainda: o `token.txt` na raiz da oficina e o
destino dos 230 arquivos dessa árvore legada.

### Hub — Sprint 6 em 4/14 e handoff de continuidade (22/10/2026)

Trabalho de **oficina** (`caracore-hub`), sem tag, asset ou mudança de copy pública: a
loja continua servindo `v2.1.0-rc1.2` (unsigned, reprovada pela QA da rodada 4) e o GA
segue 06/04/2027. A oficina está em `2.1.0-rc1.3`, com os POMs em `2.1.0-rc1`.

O quadro real da Sprint 6 é **4 de 14 `[x]`** (S6.0, S6.6, S6.11 e S6.12). Seguem
abertos S6.1, S6.2, S6.3, S6.4, S6.5, S6.7, S6.8, S6.9, S6.10 e S6.13. Os dois itens
sem nenhuma entrega são **S6.2** (SQLite real: migrações do zero, varredura de SQL
PostgreSQL-only, concorrência sem `SQLITE_BUSY`) e **S6.3** (HTTP/REST Assured, CSRF
dos POST JSON e **RBAC por perfil** nos 31/32 recursos de `/api/*` fora de
`/api/admin/*`). **S6.9** depende só de decisão do dono (assinatura C7, `UAC.dll` de
2015 C4, login da conta real, T1 com Defender).

Na rodada de 22/10 o **S6.8** foi executado: **D6 fechado** (`HubCleanTempCopy` no
`installer.nsh`, resíduo `~nsu*` = 0, smoke do instalador 26/26), **E8 medido**
(EXE 272.853.525 B `aff44de2…`, ZIP 323.192.638 B `2f03af7a…`, WAR `3d876bbb…` nos dois
caminhos do pacote) e **C6 medido** (mediana 79.207 ms, `target: null`; primeiro boot
após instalação 173.386 ms). O **E7 não foi aprovado**: o app empacotado sai com
`ExitCode 0` porque `window-all-closed` chama `stopTomcat()` e `app.quit()`, e o caso
`04-order-stock-export` consome ~58 s de um orçamento de 60 s contra o scheduler de 30 s.
Falta guard `HUB_TEST_NO_QUIT=1` (ou bancada dedicada) e preservar o perfil `mkdtemp`
quando o teste falha.

O **S6.7** tem o orquestrador `npm run verify` com E1–E6 (`dist_hub/verify/20261022T201709Z`,
PASS em 18min26s, 2454 testes, 8 ignorados, 10 specs Playwright), mas `promotable=false`
porque a árvore estava suja (34 arquivos). O **S6.12** está fechado, porém **B7** (smoke
Linux x64, cofre/`gnome-keyring`/D-Bus) segue vermelho e o run `39774971331` sumiu da API
do GitHub — o CI **não** vale como prova durável da `rc1.4`.

Nada é publicável nesta data: a `rc1.4` depende de **S6.10**. Handoff para a próxima IA,
com o quadro dos 14 itens, comandos, armadilhas já pagas e ordem de retomada:
[`caracore-hub/docs/handoff-sprint6-continuidade-20261022.md`](../../caracore-hub/docs/handoff-sprint6-continuidade-20261022.md).


### MCP local — DeepSeek direto e NVIDIA NIM (22/10/2026)

No workspace `D:\onedrive\dev`, `.vscode/mcp.json` mantém dois servidores
isolados: `nvidia-deepseek` (`deepseek-ai/deepseek-v4.1-flash`) e
`deepseek-direct` (`deepseek-flash`, API oficial). Nenhuma chave é salva nos
arquivos. O servidor direto usa prompt de segredo protegido do VS Code; uma
chamada real DeepSeek ainda não foi feita. O teste ao vivo NVIDIA expirou em
180 s, sem confirmar inferência. Estado detalhado, ferramentas, arquivos e
passos para retomada: [MEMORIA_CONFIGURACAO_MCP_DEEPSEEK_NVIDIA_2026-10-22.md](./MEMORIA_CONFIGURACAO_MCP_DEEPSEEK_NVIDIA_2026-10-22.md).

### Hub — Sprint 6 fecha autorização anônima no runtime empacotado (21/10/2026)

Trabalho de **oficina** (`caracore-hub`), sem tag, asset ou mudança de copy
pública: a loja continua servindo `v2.1.0-rc1.2` e o GA segue 06/04/2027.

O item **S6.11 (B1+B2 / D4+D7)** foi fechado no plano. O runner de validação do
runtime empacotado (`electron/test/validate-local-rc1.cjs`) ganhou
`verifyAnonymousAuthorization()`, que roda depois do setup e, **sem sessão**,
comprova: 20 recursos `/api/*` em **401 JSON** com `"status":401` e sem
`Set-Cookie`; 10 telas administrativas em **302** para `/login`; `/api/health` em
**200**; e `POST /api/pedidos` em 401 **sem** inserir linha em `pedido`
(contagem antes/depois via `node:sqlite` somente-leitura). A ordem importa:
antes do primeiro acesso o `InitialSetupFilter` responde `/setup` e o 302 não
provaria nada sobre o guarda. Execução de aceite: `npm run test:rc1:local` com
`EXITCODE=0`, 10/10 em 1,8 min (Tomcat/JRE distribuídos) e 10/10 em 2,2 min
(Electron); WAR `2d8a1a3d…6624A`.

No mesmo dia, dois commits anteriores fecharam a parte de código dos outros
defeitos: `2fa0c81` (D2/D3 — `test.jsp`, `usuarios-demo.jsp` e `UsuariosServlet`
fora; canais AMAZON/B2W travados por `CanalPedido.isDisponivelNaEdicaoFree()` e
`CanalPedidoTest`; ROOT do Tomcat removida no preparo do pacote; `clean package`
no CI) e `268d0be` (D1 — pré-compilação JSP `jspc-precompile` + `JspElValidationTest`
+ spec E2E de retirada/scan). Os três commits estão em `chmulato/caracore-hub`
`master` (`60135c8`); o plano e o laudo da sonda ficaram sem commit nesta data.

**Correção de honestidade registrada:** a nota antiga do item S6.5 afirmava que
`verifyRemovedDemoRoutes()` já sondava rotas anônimas — não sondava; só verificava
quatro 404. A sonda passou a existir em `verifyAnonymousAuthorization()` e a nota
foi corrigida no plano, com a evidência apontada. O que a sonda prova é
**autenticação**, não RBAC por perfil: 31/32 recursos de `/api/*` fora de
`/api/admin/*` continuam abertos a usuário autenticado e pertencem a S6.3.
Rota inexistente não vale como gate: `/api/health/live` e `/api/login` não
existem (liveness é `/api/health`; login é `/api/auth/login`).

Sprint 6 está em **2 de 14 tarefas com `[x]`** (S6.0 e S6.11); S6.1, S6.4 e S6.5
têm entrega no código mas seguem abertos porque o critério escrito é o **pacote
publicado** — a `rc1.2` ainda tem o erro de EL e ainda serve os dois JSP. Antes de
gerar a `rc1.4` (S6.10) faltam S6.12, S6.6, S6.7, S6.8, S6.9, S6.2 e S6.3; depois
vem S6.13 (E2E no pacote final, 0 FAIL). O WAR não é reprodutível entre builds
(sem `project.build.outputTimestamp`), então aceite de bytes só no binário
publicado. Detalhes: `caracore-hub/docs/contexto-rapido.md`,
`caracore-hub/docs/relatorio-s611-autorizacao-20261021.md` e
`caracore-hub/docs/plano-lancamento-rc1.md` (Sprint 6).

### Hub — produto Free + suporte recorrente (20/10/2026)

Decisão do dono: o **produto é Free** — não há licença mensal pelo Hub. O
**suporte é opcional** e tem **pagamento recorrente de R$ 79,90/mês**, o mesmo
preço do PDV Premium. O motivo é a operação: as integrações com Mercado Livre,
Shopee e Temu (credenciais, webhooks, etiquetas e mudanças de canal) geram
chamado com regularidade. A pré-release `v2.1.0-rc1.2` é de avaliação, sem
cobrança; não há checkout antes do GA de 06/04/2027.

CTA público ajustado nas quatro camadas: loja (`caracore-hub-releases`, raiz e
`docs/`), central (`caracore-loja/docs/download.html`), matriz
(`caracore-site/ecosistema.html` e `portfolio.html`) e wiki
(`caracore-wiki/docs/projeto-hub.html`). O botão primário é "Baixar pré-release
(Free)"; o secundário é "Suporte recorrente: R$ 79,90/mês", com âncora `#plano`.
Nas páginas tocadas, "sem assinatura" virou "sem assinatura digital" para não
confundir o binário unsigned com a cobrança do suporte.

### Hub — documentação pública alinhada à aplicação web 2.1 (20/10/2026)

Segunda passagem do mesmo dia, agora sobre o **texto**: `WAR` e "oficina" saíram
da copy pública da matriz, da vitrine (`caracore-hub-releases`), da wiki e da
central (`caracore-loja`). O cliente lê a **aplicação web 2.1 sobre Tomcat
embutido no instalador, com SQLite local no computador do ponto de retirada**;
o `WAR` continua existindo como artefato interno de build, fora do discurso
público. Pré-release `v2.1.0-rc1.2` e GA `06/04/2027` não mudaram; nenhuma tag
ou asset novo foi criado.

Onde a copy encosta em login e conta, ela passou a seguir o código, conferido
nesta sessão em `caracore-hub`:

- o login é por **telefone** (`login.jsp`), não por e-mail; "Lembrar" existe e
  **não** prolonga a sessão; sem `session-config` no `web.xml`, vale o padrão do
  Tomcat: a sessão expira após **30 minutos** de inatividade (configuração
  ausente = default do fornecedor, não promessa de duração infinita);
- a recuperação é **offline, por código**: `CodigoRecuperacaoService` gera
  `CODE_COUNT = 10` códigos de uso único de **27 caracteres** (Base64 URL-safe de
  `CODE_BYTES = 20`), e cada uso invalida os demais; a nova senha exige **≥12**;
- o setup cria o administrador com **≥12** e a tela de usuários exige **≥6**;
  a senha temporária gerada quando o campo fica vazio tem **8** caracteres;
- **não** existe senha por e-mail/SMS nem troca obrigatória no primeiro
  acesso; as páginas não podem prometer nenhum dos dois.

Camadas tocadas: `caracore-site` (cartão do Hub na home e fechamento de `div`
que faltava), `caracore-hub-releases` (README, `RELEASE_2.1.0-rc1.md` e nota de
leitura datada no laudo de 19/09, que fica como histórico), `caracore-wiki`
(10 páginas do manual, `projeto-hub.html`, glossário, ecossistema e
tecnologias) e `caracore-loja` (`download.html`). Commits `098fa88`,
`ceb7a51`, `3fc45d2` e `d5295f0`; o `origin/master` de cada repositório confere
com o local por `git ls-remote` e as árvores estão limpas.

Validação: varredura de 33 arquivos com 23 ocorrências, todas justificadas —
`oficina` como nome canônico da camada 3 na matriz e em `caracore-loja/AGENTS.md`,
o laudo histórico e um falso positivo do filtro em `wiki/docs/hub/admin.html`,
que afirma que o Hub **não** envia senha por e-mail nem por SMS. Checagem de HTML
ok nos 29 arquivos alterados, links do manual sem falha e nenhuma âncora
`#oficina` restante na wiki. Pendências conhecidas: as âncoras de letra do
`glossario.html` (`#I`, `#K`, `#L`, `#N`, `#Q`, `#U`, `#W`, `#X`, `#Y`, `#Z`,
`#top`) já estavam quebradas antes deste corte (dívida separada), o `README.md`
da vitrine ainda aponta o repositório privado `caracore-hub` e não houve smoke
visual no Edge.

Estado do produto segue o de 16/10: a QA da rodada 4 **não aprovou** a
`v2.1.0-rc1.2` e os defeitos D1–D6 continuam abertos no plano de lançamento.
Documentação alinhada não é aceite de QA nem GA.

### Hub — reposicionamento para PUDOs em 20/10/2026

Copy pública alinhada em `caracore-hub-releases` (vitrine `docs/` e cópias legadas da
raiz), `caracore-wiki`, `caracore-loja` e `caracore-site`: o Hub passa a ser descrito
como **gestão logística interna para pontos de retirada (PUDOs)**, não como ferramenta
de centro de distribuição nem de marketplace. Encomendas de Mercado Livre, Shopee e
Temu continuam como origem dos pacotes; Amazon e B2W seguem só no modelo de dados, sem
conector. Pré-release Windows `v2.1.0-rc1.2` e GA `06/04/2027` inalterados.

Na oficina, `/retirada/scan` deixou de avaliar EL dentro de template literal JS (o
render falhava com HTTP 500) e o filtro de canais de `PedidosListaServlet` consulta
`isDisponivelNaEdicaoFree`. Maven `2.1.0-rc1` completo: core 614, persistence 571, api
841 (8 ignorados), web 283 testes, zero falhas/erros. Publicado a pedido do dono:
`caracore-hub` `981e81c` (fix + docs de posicionamento e stack), `caracore-hub-releases`
`cd1edb0`, `caracore-wiki` `883cb3b`, `caracore-loja` `4048991`; a matriz registra este
corte aqui e em `.cursor/rules/project-memory.mdc`. Os cinco repositórios estão limpos e
iguais ao `origin/master`; nenhuma tag ou asset novo foi criado — a vitrine pública
continua na `v2.1.0-rc1.2`.


### PDV v4 — checkpoint de pausa em 18/10/2026, 14:54 BRT

Trabalho pausado por créditos de IA, sem GA aprovado. `caracore-pdv` está em `master`
`257e58c`, com Maven local `4.0.0` e alterações não commitadas; isso não é release.
Estável registrada `v3.2.12-free`; RC6 continua pré-release pública. Novas decisões:
preservar modelo/dados da 3.2.12 (migração segura ainda bloqueadora) e homologar
automaticamente em ambiente isolado/simulado, SQLite real de teste, viewport 1280×800
emulado. Automatizar o fluxo até a entrega, com publicação somente autorizada.
Relatórios existentes têm 1.294 testes, zero falhas/erros e três ignorados, sem prova
de execução única completa do candidato; não equivalem a homologação final.
M11, caminho de publicação e CTA pendentes; PERF congelada. Sem commit/push/publicação
nesta sessão. Retomar pelo [checkpoint da oficina](../../caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md#checkpoint-de-pausa--18102026-1454-brt)
e pelas [decisões de GA](../../caracore-pdv/docs/arquitetura/DECISOES_GA_V4.md).

### CSO — alinhamento de planejamento em 17/10/2026

Prevalece sobre snapshots anteriores: Frotas Web e Transportes Desktop são
duas aplicações; Virtual Tracker é capacidade integrada de localização, não
terceiro produto. Alvo conjunto **08/11/2028**, não garantia de entrega.
O [plano mestre](../../caracore-cso-transportes/docs/plano_organizado_execucao_cso.md)
registra 10 sprints locais estimadas + 21 tarefas INT em 6 etapas (0/21).
INT-01/02/03 validam baseline, viabilidade móvel e capacidade; total de sprints
e alocação ainda pendentes. MON continua 0/53, com reaproveitamento seletivo.
O [calendário empresarial](CALENDARIO_COTA_CURSOR.md) agora reconhece esse
recorte de integração em 2028, sem antecipar implementação ou mudar PDV/Hub.

Frotas permanece online-only. VT planejado: relay E2EE, sem leitura ou
persistência de posições/rotas/trânsito/envelopes, nem em logs/APM/cache/filas.
Memória transitória limitada; mapa, histórico e chave privada somente no
desktop. Presença 120 s quando necessária, posição 60 s em viagem como
perfil de referência a medir. Sem fila/recuperação offline ou promessa de
posição instantânea. Protocolo e endpoints ainda serão aprovados.

Matriz e wiki passam a apresentar a mesma proposta da loja: organizar
entregas e acompanhar deslocamentos pelo celular, com conexão, finalidade
autorizada e limites explícitos. CTA de interesse leva à loja; Frotas segue
com acesso separado. Alterações desta revisão são locais: sem commit,
push, deploy ou implementação de integração/GPS.

Validação local desta revisão: 4/4 testes Node focados no painel de
planejamento; sintaxe JS e `git diff --check` aprovados nas duas árvores.
11 páginas HTML alteradas verificadas em UTF-8, com um H1 e sem novos
links/âncoras locais quebrados ou IDs duplicados; espelhos de `AGENTS.md`
idênticos. Navegador: ecossistema, portfólio e planning sem overflow em
390/768/1366 px; painel mostra integração e INT-03, sem a exclusão antiga.
Wiki CSO tem o mesmo pequeno overflow móvel (14 px em 390 px) observado na
página Hub não alterada; não corrigido por ser layout preexistente.
Âncora Virtual Tracker e CTA da loja conferidos. Sem teste real de
localização, banda, criptografia ou capacidade nesta revisão.

**Atualizado:** 2026-10-15 · PDV Free `v3.2.12-free` estável/Latest; fonte `hotfix/3.2.12-free` `72ace488aed4ee91001c60cf40a3934ddfe8faf1`. Publicação estável/Latest autorizada em 15/10/2026, com validações pendentes. 19/19 testes focados passaram em Java 25/H2; ZIPs e hashes remotos conferidos. Suíte completa, smoke portátil com SQLite/health/navegador, execução Linux/macOS e homologação operacional completa permanecem pendentes. Não transferir aceites da 3.2.8. Windows SHA-256 `6d7a50b0acf2a05620a090eebdd48f049a1dd5599ccb6c40c419c38145f7c0e2`; Linux/macOS `795a396318da61d1bd45dcfe816879d2184706f1c7849f1cd2ad98baa99fd9c1`. Release: https://github.com/chmulato/caracore-pdv-releases/releases/tag/v3.2.12-free. Pacotes locais em `D:\temp_pdv`. A 3.2.8 permanece no histórico e a v4 RC6 continua pré-release separada. Manutenção restrita até 08/11/2026, sem GA v4 automático. Registros anteriores abaixo são históricos.
**Workspace típico:** `D:\dev\` ou `D:\onedrive\dev`  
**Guia de produtividade:** [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) ← use ao **iniciar nova tarefa**  
**Fonte mestre para IAs:** `caracore-site/AGENTS.md` — **não existe mais** `D:\onedrive\dev\AGENTS.md`, e qualquer ponteiro que mande ler o `AGENTS.md` da raiz do workspace está morto · Cursor: `.cursor/rules/ecosystem-cara-core.mdc`

### Como Gemini, Copilot e Cursor devem retomar

Comece por este documento para obter o snapshot e os handoffs; consulte em seguida **`caracore-site/AGENTS.md`** para regras de ecossistema (o `AGENTS.md` da raiz do workspace **não existe** — ponteiro morto) e a memória/arquivo de status da oficina antes de alterar um produto. Antes de compilar uma aplicação Java, leia `D:\onedrive\dev\APPS_JAVA_VERSION.md` e use o JDK declarado ali (PDV Free e v4 25, CSO Frotas 21, CSO Transportes 25, Hub 25, Ink 25, Helianto 25, RU 25, Seed 25). O Copilot do CSO lê também `caracore-cso-quarkus/.github/copilot-instructions.md`. A tabela abaixo é um índice de status, não substitui o estado operacional do repositório. Se houver divergência, prevalece o status mais recente da oficina; registre a correção nesta memória e no changelog. Confirme deploy/publicação no destino antes de afirmar que uma alteração local está no ar. Em 06/10 a aplicação `cso.caracore.com.br` já descreve a gestão de frota. A copy correspondente da matriz, da wiki e da loja `cso-transp` está alinhada no checkout e ainda não foi publicada.

### Snapshot das aplicações e frentes (atualizado em 2026-11-07)

| Aplicação / frente | Status registrado | Próximo gate ou limite | Retomada canônica |
|---|---|---|---|
| **PDV Java Free** | `v3.2.12-free` Latest, Windows/Linux/macOS, publicada em 15/10 por autorização explícita; 405 JSON, ESTORNADA/CANCELADA e V047; mesmos limites Free, sem PIX/NF-e/NFC-e. | Publicação estável/Latest autorizada em 15/10/2026, com validações pendentes. 19/19 testes focados passaram em Java 25/H2; ZIPs e hashes remotos conferidos. Suíte completa, smoke portátil com SQLite/health/navegador, execução Linux/macOS e homologação operacional completa permanecem pendentes. Não transferir aceites da 3.2.8. Manutenção restrita até 08/11/2026. | `caracore-pdv` branch `hotfix/3.2.12-free` · fonte `72ace488aed4ee91001c60cf40a3934ddfe8faf1` · release `https://github.com/chmulato/caracore-pdv-releases/releases/tag/v3.2.12-free` |
| **PDV Java v4** | **GA em 08/11/2026** (decisão escrita do dono em 04/11/2026, `D-GA-1` fechada). Até o corte, a prévia pública é **`v4.0.0-candidato-20261031`** (build 31/10/2026, SHA-256 `0c2003b0f99a75328f7ebe632fc20b07cb5834a3f75b6f0e97ccfb7aef83434d`, 178.317.680 bytes; fonte `master` `c343890`; Java 25 embutido, sem JDK/Python; Windows 10/11 x64 + Edge). A `v4.0.0-rc6` (SHA `0c00b24b…`, fonte `681ea32`, tag `b3358fe`) e a `v4.0.0-rc5` ficam no histórico; a **RC7** segue sem tag. Em 05/11 nada do GA está publicado: tag `v4.0.0` 404, `caracore-pdv4-releases` 404, canal `pdv-v4` 404 `no_release`. | Publicação condicionada a pacote assinado com as duas chaves, T032 17/17 no hash novo, Gate E escrito e canal `pdv-v4` (#64–#69). Em aberto: duração do soak; SCA (OSV medido, NVD não — nunca "0 CVE"). T032/M01–M11 foram medidos em `ff400efd`, **não** neste pacote — aceite não atravessa hash; migração do banco 3.2.12 bloqueada; `PERF-001–007` congeladas. | `caracore-pdv/AGENTS.md` · `docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md` · `PLANO_LANCAMENTO_V4.md` |
| **PDV Rust** | Piloto Windows `v0.1.4`, linha independente do Java; limite de 100 vendas durante a vida do piloto. Loja e artefatos no mesmo repo de releases. | Não misturar canais, artefatos ou anunciar que substitui o Java. | `caracore-pdv-rust/docs/contexto-rapido.md` · `status.md` |
| **CSO Frotas** | Gestão de frota FRO 24/24 em produção desde 06/10 (`b90d1dc`, Flyway V33). Index com convite principal e roadmap desta versão (`e1e8d63`). Não é GPS. | Freeze M1 em 08/11/2026 estabiliza o que já está no ar. Sem jornada, app offline nem GPS. MON-0 não iniciado. | `caracore-cso-quarkus/docs/plano-lancamento-2026-11-08.md` · `docs/plano-gestao-frota.md` |
| **CSO Transportes + VT** | Desktop e capacidade integrada em desenvolvimento; alvo conjunto 08/11/2028, condicionado aos gates INT. | 10 sprints locais + 21 tarefas integradas (0/21); INT-03 estima total e capacidade. Loja única CSO, sem contratação antecipada. | `caracore-cso-transportes/docs/plano_organizado_execucao_cso.md` |
| **CaraCore Hub** | Download da loja: tag `v2.1.0-rc1.10` (07/11, unsigned, pré-release editorial). ZIP portátil 228.354.977 B, SHA-256 `0b18fbcf3af02d53a341ac5b83af9132a0ef201e698585160f332d3ad8bdae00`; sem instalador NSIS nesta build. Banco do produto: SQLite local (WAL) no computador do cliente. Java 25, Jakarta EE 10, Tomcat 10.1, runtime jlink. FileVersion `2.1.0-rc1.10`. Base da atualização assinada (Ed25519) embutida; canal publica manifesto assinado, sem auto-apply nesta versão. A tag `v2.1.0-rc1.8` conserva o pacote de 31/10 (ZIP 324.536.724 B), a `v2.1.0-rc1.7` o de 27/10 (EXE e ZIP), a `v2.1.0-rc1.6` o de 25/10, a `v2.1.0-rc1.1` o de 06/10 e a `v2.1.0-rc1` o instalador de 05/10. Web 2.1 concluída. Mac e Linux fora desta tag. | Login da conta real ainda sem causa confirmada. Aceite de QA da `rc1.10` ainda não foi feito: a rodada 5 reprovou a `rc1.7` (N1/N2 bloqueantes); B7 (smoke Linux x64) fechado em 07/11/2026 (run `42415755367`); S6.9 aberto. Backup/atualização automática não fazem parte deste aceite. GA 06/04/2027 mantido. Amazon/B2W não operacionais. | `caracore-hub/docs/contexto-rapido.md` · https://github.com/chmulato/caracore-hub-releases/releases/tag/v2.1.0-rc1.10 |
| **Minerador ETE** | Canal público `v1.2.3` (Ouro 4.0). | Não regredir para os bundles quebrados `v1.2.1`/`v1.2.2`. | `caracore-ete/AGENTS.md` · `.cursor/rules/project-memory.mdc` |
| **BioReator 4.0** | Community **1.1.1** publicada em 13/10/2026, Windows x64, sem assinatura. Distingue biomassa viável/total, calcula P/V pelo volume líquido e registra o primeiro critério de término em `end_reason`; mantém as melhorias cinéticas da 1.1.0. | Release `bioreator-1.1.1`: MSI 72.675.328 bytes (SHA-256 `6eb0dd01006304d78c74f185345711bc8d4e135b03443d2ab583379338b04b21`) e ZIP 73.592.557 bytes (SHA-256 `b36d18a0fae828f359db3c2a6509ad519849e560487d0ebbfaa3c3c85e09e1d7`); EXE 524.800 bytes (SHA-256 `88eb22c17b547ded71aed275021bfbbd4121b171cbaba4373dfdca96c11a609a`) fica no ZIP. Premium em 18/06/2027, sem preço e sem PIX. | Loja `ru.caracore.com.br/download.html#arquivos` · `manual-tecnico.html#criterios-fim` · `exemplo-bioreator.html` · `fundamentos-bioprocesso.html` |
| **Ink Agenda** | Desktop **`v2.2.1` é a versão atual** (Latest, publicada em 04/11/2026) para Windows (setup/ZIP) e Linux (`.deb`), unsigned; um executável com três perfis (Tatuagem, Odontologia e Beleza), equipe com papéis (Administrador/Agenda/Financeiro em `app_users`, V26) e mensageria por WhatsApp ou Telegram; macOS sem instalador. SHA-256 oficiais: ZIP `4baf257d…deef98b1`, EXE `39eafa4a…270c124b`, DEB `1b89bb76…841cef14`. A 2.2.1 corrige o download do instalador pelo app (302 seguido até 5 saltos, cada salto validado, SHA-256 obrigatório): quem está na 2.1.0 ou 2.2.0 baixa a 2.2.1 pela loja uma vez. `mvn verify` com Java 25: 713 testes, 0 falhas. Loja publicada (`f65e149`, CTA em `0805fdc`); Wiki (`0ffbc5d`), Central (`4d30e35`) e matriz (este commit) publicadas em 04/11/2026. Histórico: `v2.1.0` (03/11/2026), `v2.0.4` (02/11/2026), `v2.0.1` (07/10/2026) e a candidata `v2.0.2`. Código em `caracore-ink` `master`. **Histórico abaixo (não é o estado atual):** **02/11/2026 — `v2.0.3` publicada** em `caracore-ink-releases` (Latest) com setup, ZIP e .deb, gerados pelo workflow `Build Instaladores Nativos` na tag `v2.0.3` (`f8553bf`; correções de CI: JDK Corretto com jmods, timeout do DPAPI, BOM no token). SHA-256: setup `709032228fe47ebf21e69237f82204094e58bd313b6035f907798952a9b9c407`, ZIP `8e65aedf79acd6c9f36f4474a7ed04700021852a106652b381f0fc2ef8541ccd`, .deb `a0e4ad1d0a4738a3343f2e8e61c4dcbf5202b7814d7c7368734ad4d700229440`. 619 testes unitários, 8 do gate de logs e 58 TestFX; migration V23 remove receitas duplicadas da 2.0.2. Loja e catálogo atualizados para a 2.0.3. Sem assinatura Authenticode. Gateway (`api.caracore.com.br/releases/ink/latest.json`) já anuncia a 2.0.3 (lê a release Latest do GitHub; setup.exe + SHA-256 `709032…c407`) e o cliente 2.0.3 o reconhece como CURRENT (verificado em 02/11/2026). Pendentes: job macOS do CI (sem runner), assinatura, validação visual de Configurações. Gateway commitado em `caracore-api` e `caracore-cso-quarkus`. **Fechamento 02/11/2026:** publicação da 2.0.3 concluída para **Windows e Linux**; loja (`download.html`, commit `2a031c4`) mostra "Linux (.deb)" com link da release e "macOS (.dmg): em breve" sem link (verificado no ar; .deb responde 200). **macOS:** sem pacote porque o GitHub não alocou runner macOS; quando houver capacidade, re-disparar só o job macOS da tag, anexar o .dmg à release, trocar "em breve" pelo link e registrar o SHA-256 aqui. Job `update-notes` nunca rodou (notas publicadas à mão; corrigir o gerador antes da próxima tag). **02/11/2026 — `v2.0.4` publicada** (Latest) com setup, ZIP e `.deb`, tag `v2.0.4` em `8a2d84f`; CI `Build Instaladores Nativos` verde nas quatro jobs, inclusive macOS (`.dmg` anexado à release, fora da loja por decisão do dono). Aplica A1–A9 e assinatura Ed25519 na verificação de atualização (chave pública embutida). `mvn -B verify`: 637 testes, cobertura e gate LGPD aprovados. SHA-256: ZIP `7849d462…e6fd3`, EXE `5ea79dac…ebd1c`, DEB `30eee2bd…dfc941`. Gateway serve 2.0.4 assinado (`min_supported` 2.0.2, `mandatory` false). Loja, Wiki, Central e matriz alinhadas a 2.0.4. | **Histórico — candidata 2.0.2:** 596 testes unitários, 8 testes do gate de logs e 58 TestFX; cobertura e validação da base demo aprovadas. SHA256: setup `f9dde7c521dd64c39ee5dfa3c62bdb8c09f000bf7083c34e15fe47bc0a6cfa54`, ZIP `ab66a21bb39ab597757374ac1b4e280c1129171de54b71f36bacfe90e9171a94`. Assinatura ausente; homologação visual e teste de upgrade com cópia real da base 2.0.1 pendentes. **3.0 em PWA** não antes de 2028 (nuvem HTTPS, um SQLite por estúdio; substitui o Desktop no S9 após importação); a 3.0 **não** sai com `.dmg`/`.deb`/Electron/GluonFX — o `.deb` da 2.x é outro canal — e **não** é offline-first (o service worker guarda só a interface). **Plano atual (08/11/2026):** o Desktop **2.3.0** — data revista em 08/11/2026 para **29/01/2027**, era 06/04/2027 — entrega **apenas a P1 Onda 1** — P1.1 e P1.2.1 entregues em `6ae4f1c` (06/11/2026), P1.2.2–P1.2.8 e P1.3.1–P1.3.4 + **G1** em 08/11/2026 (**17 de 17 sub-itens**, incluindo o P1.2.8 nascido do alinhamento AL-01/AL-02; gate `mvn -B verify` 745/0 + 8 LGPD, `mvn -Ptestfx verify` 825/0 e demo V30; Onda 1 fechada tecnicamente, faltam só os prints H-A04, H-C04, H-C06 e H-A08 na semana de 10–14/11, tudo **commitado e empurrado em `3381aa3`** em 08/11/2026, 72 ficheiros, +3.214/−262); o **P1.4 foi cortado** em 06/11/2026 e passa para a Onda 2, junto com o 3.0.0-RC1. | `caracore-ink/docs/RELEASE_2.2.1.md` · `caracore-ink/docs/PLANO_PWA.md` · https://github.com/chmulato/caracore-ink-releases/releases/tag/v2.0.2 |
| **Seed** | Piloto público local gratuito sob MIT; próprio Seed sem ativação. Pré-release candidata Windows x64 `0.1.5` publicada para avaliação sem convite ou cadastro prévio; `0.1.4` release estável anterior. EXE unsigned, 216.466.586 bytes, SHA-256 `e449ca2cee74fda135ac098d2333fe674c2c476773a7d4adb60bc016a767db16`. API protegida por sessão ADMIN/CSRF e token por licença, Host validado, porta dinâmica, heartbeats com relógio UTC do servidor, payload assinado documentado e Swagger UI local. Migração aditiva compatível com bancos 0.1.3/0.1.4; SQLite, dados e chaves preservados. Homologação independente pendente; não pronto para produção. Sem monitoramento remoto; Linux fora desta etapa; código-fonte não publicado. Complementar no ecossistema, sem centralizar banco ou acesso dos outros produtos. | Preservar SQLite e chaves ao atualizar; licenças antigas podem exigir emissão/rotação do token API. Manter claro que o piloto não está homologado nem pronto para produção. | `caracore-seed/docs/memoria-projeto.txt` |
| **Reino OIDC / Circuito / Área 51** | OIDC Edição Free `v2.0.2-free` publicada na loja, sem certificado digital. Três Eras e progressão narrativa gratuitas para estudo pessoal. A edição paga está em desenvolvimento; a loja não combina PIX nesta etapa. A página de download oferece só essa tag. Circuito Ferradura `v2.0.24` publicado na loja e na release em 08/10/2026; EXE Windows sem assinatura; pacotes Windows, macOS e HTML. Área 51 com baseline `0.1.0-dev` e vitrine de consultoria. | OIDC `v2.0.1-free` e `v2.0.0`, e Circuito `v2.0.23`, ficam no histórico. São brincos: cedem prioridade de cota e headline aos produtos principais. | `caracore-oidc` · `caracore-circuito` · `caracore-area51` · https://github.com/chmulato/caracore-circuito-releases/releases/tag/v2.0.24 · https://github.com/chmulato/caracore-oidc-releases/releases/tag/v2.0.2-free |
| **MKT / Sala** | Vitrine `mkt.caracore.com.br` (CNAME → `chmulato.github.io`, restaurado em 10/10/2026). Ferramenta interna, gratuita, não vendemos. Sala `tools.caracore.com.br/sala/`. | Brinco; não deslocar prioridade dos produtos principais. | `caracore-mkt` · `caracore-mkt-releases` · `caracore-tools` |
| **RU Soberano** | Garagem/roadmap; marco Simulador + Sala Retro previsto para 18/06/2027. | Sem abrir frente pesada fora da fila de cota. | `caracore-ru` |
| **Helianto** | Vitrine `helianto.caracore.com.br` (CNAME → `chmulato.github.io`, restaurado em 10/10/2026). Oficina/roadmap; GA 30/12/2029. | Agent em 2029, após CSO Transportes; não antecipar para 2027–2028. | `caracore-helianto` · `caracore-helianto-releases` |
| **Matriz, Central e Suporte Local** | Host público: GitHub Pages. WebP do logo branco no ar (`logo_branca.65d940959999.webp`, 117.882 bytes). 404 sem redirect automático. | `Cache-Control: max-age=600` na home, no portfólio e no WebP. | `caracore-site/docs/SITE_MATRIZ.md` |

### Status PDV Java (2026-10-08) — para IAs

| Item | Valor |
|------|--------|
| Canal loja | **`v3.2.12-free` estável/Latest** (15/10/2026), cinco assets conferidos; Publicação estável/Latest autorizada em 15/10/2026, com validações pendentes. 19/19 testes focados passaram em Java 25/H2; ZIPs e hashes remotos conferidos. Suíte completa, smoke portátil com SQLite/health/navegador, execução Linux/macOS e homologação operacional completa permanecem pendentes. Não transferir aceites da 3.2.8. |
| Artefatos Free | Windows `caracore-pdv-v3.2.12-free-windows-x64.zip`, SHA-256 `6d7a50b0acf2a05620a090eebdd48f049a1dd5599ccb6c40c419c38145f7c0e2`; Linux `caracore-pdv-v3.2.12-free-linux-x64.zip`, SHA-256 `795a396318da61d1bd45dcfe816879d2184706f1c7849f1cd2ad98baa99fd9c1`; macOS `caracore-pdv-v3.2.12-free-macos-x64.zip`, SHA-256 `795a396318da61d1bd45dcfe816879d2184706f1c7849f1cd2ad98baa99fd9c1` |
| Código Free | Branch `hotfix/3.2.12-free`, commit `72ace488aed4ee91001c60cf40a3934ddfe8faf1`. Tag de distribuição no repo público; nenhuma tag nova no repo de código. 3.2.8 e anteriores no histórico. |
| Checkout oficina `master` | `c343890` · Qute · fonte do ZIP público da candidata de 31/10/2026. A `v4.0.0-rc6` (tag `b3358fe`, fonte `681ea32`) e a `v4.0.0-rc5` ficam no histórico |
| Próximo Agent pesado | **out–nov/2026** = ciclo de RCs v4 e respectivos gates (`PLANO_LANCAMENTO_V4.md`); sem GA automático em 08/11 |
| Handoff | `caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md` · `caracore-pdv/AGENTS.md` |
| Retomada local | `v4.0.0-candidato-20261031` é a prévia pública (100 vendas finalizadas/mês), build 31/10/2026, SHA-256 `0c2003b0f99a75328f7ebe632fc20b07cb5834a3f75b6f0e97ccfb7aef83434d`. Prosseguir pelas RCs e gates; T032/M01–M11 medidos só em `ff400efd`; SCA não medido; `PERF-001–007` congeladas |

---

## Retomada em 30 segundos

1. **Nova tarefa?** → [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) (fluxo por tipo de trabalho). **Compilar Java?** → `D:\onedrive\dev\APPS_JAVA_VERSION.md` (JDK por aplicação; Maven em `D:\onedrive\dev\.m2\repository`).
2. **Status das aplicações (Gemini/Cursor):** começar pelo **§ Snapshot das aplicações e frentes (07/11/2026)** e pelo **§ Checkpoint 01/11/2026** (superfícies publicadas + próximas tarefas); o **§ Status PDV Java (2026-10-08)** e os blocos datados são **histórico**; depois consultar a memória canônica da oficina antes de editar ou anunciar status.
3. **Visão ecossistema:** este ficheiro + `ECOSYSTEM_CARA_CORE.md` + `ECOSYSTEM_LOJAS.md` + **`caracore-site/AGENTS.md`**
4. **Produtos principais (só estes três):** PDV (Java Free `v3.2.12-free`, atualização corretiva da linha 3.2.x até 08/11/2026; v4 **com GA em 08/11/2026** por decisão escrita do dono em 04/11, condicionado a pacote assinado, T032 17/17 no hash novo, Gate E escrito e canal `pdv-v4` + Rust `v0.1.4`) · CSO (gestão de frota **no ar**, FRO 24/24; freeze M1 08/11/2026; loja `cso-transp`; Transportes **08/11/2028**; ≠ GPS) · Hub (encomendas; pré-release Windows `v2.1.0-rc1.10` com base de atualização assinada; GA Windows 06/04/2027). **Brincos:** Ink, OIDC, Seed, Circuito, Área 51, RU, BioReator 4.0, Helianto, MKT, Minerador — existem; em conflito de cota ou headline, **cedem**. **MKT e Helianto voltaram ao mapa de lojas em 10/10/2026** (`mkt.caracore.com.br` e `helianto.caracore.com.br` → `chmulato.github.io`; `MEMORIA_INFRAESTRUTURA_CARACORE.txt`).
4a. **Marcos PDV/CSO em 08/11/2026:** o dia tem duas coisas. **(1) GA da PDV v4.0.0** — decisão escrita do dono em 04/11/2026 (`D-GA-1` fechada, substitui D-C e D-GE-7); exige pacote `--channel ga` assinado com as duas chaves em custódia, T032 17/17 no mesmo hash, Gate E escrito e canal `pdv-v4` (#64–#69 na oficina). **(2) Encerra a manutenção restrita da linha Free 3.2.x** (corretiva atual `v3.2.12-free`). Em 05/11 nada do GA estava publicado: tag `v4.0.0` 404, `caracore-pdv4-releases` 404, canal `pdv-v4` 404 `no_release`; se um gate não fechar, a data desliza e não se anuncia como cumprida. A prévia pública `v4.0.0-candidato-20261031` (build 31/10/2026) segue como prévia até a virada; rc6/rc5 ficam no histórico e a RC7 é a rota aprovada, sem tag. CSO = freeze do que já está no ar, inclusive a gestão de frota publicada em 06/10. Não misturar com Transportes 2028.
4b. **Cota Cursor (fila única):** `docs/CALENDARIO_COTA_CURSOR.md` — US$ 20/mês · 1 produto pesado por ciclo. Página pública **Funding / Patrocínio:** `planning.html#patrocinio` (US$ 800 até dez/2029). set = CSO COE · out–nov = PDV v4 · dez/2026–06/04/2027 = **Hub** · 2028 = Transportes · **2029 = Helianto (GA 30/12/2029)**. A janela antiga de FRO em 08/abr–dez/2027 foi antecipada: os seis pilares já estão em produção desde 06/10. Ink PWA = Tab; sem Agent até folga (**não antes de 2028**). Exceção de 05/11/2026: **5 dias/mês ao Desktop 2.3.0** até 06/04/2027 (fatia, não dono de ciclo — R14 em `RISCOS_ECOSSISTEMA.md`).
4b2. **Riscos / decisão:** `docs/RISCOS_ECOSSISTEMA.md` — ler antes de mudar GA, dono de ciclo ou abrir Agent noutro produto.
4c. **CSO retomada:** aplicação `cso.caracore.com.br` · loja única `D:\onedrive\dev\caracore-cso-releases` · wiki `caracore-wiki/docs/projeto-cso.html` · app/oficina `caracore-cso-quarkus`. Em 06/10 a gestão de frota está em produção: commit `b90d1dc`, Flyway V33, suíte local 409/409. A index `e1e8d63` tem um convite principal e o roadmap desta versão. Freeze M1 até 08/11/2026. MON-0 não iniciado. Não é GPS. Transportes desktop permanece 08/11/2028.
5. **PDV Java:** oficina `caracore-pdv/AGENTS.md` · ciclo de RCs v4 em `docs/arquitetura/PLANO_LANCAMENTO_V4.md` (**execução Cursor: outubro–novembro/2026**, cota) · loja CTA = **Baixar Free (3.2.12)**. Free `v3.2.12-free`: atualização corretiva da linha 3.2.x, manutenção restrita até 08/11/2026; 100 vendas/mês, 100 produtos, 1 operador, 4 vendedores, 1 loja; aplicação web local no navegador; recibo digital por link e PDF **sem valor fiscal**; sem PIX integrado nem emissão de NF-e/NFC-e. Premium R$ 79,90/mês (PIX integrado, fiscal). Canal Free publicado = `v3.2.12-free` (`localhost:8080/login`, `admin`/`admin`, escuta em `127.0.0.1`). A prévia pública é a `v4.0.0-candidato-20261031` (ZIP na loja, build 31/10/2026, SHA-256 `0c2003b0f99a75328f7ebe632fc20b07cb5834a3f75b6f0e97ccfb7aef83434d`, 178.317.680 B; fonte no `master` `c343890`); `v4.0.0-rc6` (SHA `0c00b24b…`, fonte `681ea32`, tag `b3358fe`) e `v4.0.0-rc5` ficam no histórico, e a RC7 é a rota aprovada, sem tag. **GA em 08/11/2026** por decisão escrita do dono em 04/11/2026, condicionado a pacote assinado com as duas chaves, T032 17/17 no hash novo, Gate E escrito e canal `pdv-v4` (#64–#69); até a publicação, a v4 não se anuncia como publicada. T032/M01–M11 foram medidos em `ff400efd`, não nesta candidata; o SCA segue não medido (OSV sim, NVD não — nunca "0 CVE"); o ciclo manual completo do roteiro segue pendente. Rust piloto = 100 vendas na vida. **Não** substituir o PDV Rust.
6. **PDV Rust oficina:** `caracore-pdv-rust/docs/contexto-rapido.md` · `status.md` · `caracore-pdv-continuacao.mdc`
7. **Hub oficina (GA Windows 06/04/2027):** [handoff](../../caracore-hub/docs/contexto-rapido.md) → [status atual](../../caracore-hub/project_hub/docs/STATUS-ATUAL.md) → [plano RC1](../../caracore-hub/docs/plano-lancamento-rc1.md) → [memória Cursor](../../caracore-hub/.cursor/rules/project-memory.mdc). Web 2.1 concluída. O download da loja é a tag `v2.1.0-rc1.8` em https://github.com/chmulato/caracore-hub-releases/releases/tag/v2.1.0-rc1.8 (ZIP portátil 324.536.724 B, SHA-256 `3c4e61b2e192fece6667ccfbc79d735f3fad7ce8542e50c492b9ef24a9743334`; sem instalador NSIS nesta build). A `v2.1.0-rc1.7` conserva o pacote de 27/10 (EXE e ZIP), a `v2.1.0-rc1.6` o de 25/10/2026 e a `v2.1.0-rc1.1` o de 06/10; a `v2.1.0-rc1` conserva o instalador de 05/10. A release está marcada como **Latest** no GitHub por autorização do responsável, o que não substitui o aceite formal; o rótulo editorial segue **Beta (RC)/pré-release**. Evidência da build: `clean verify` 2.585 testes/0 falhas e E1–E6 PASS em `9874273`. Mac e Linux fora desta tag. Não é GA: aceite de QA pendente (a rodada 5 reprovou a `rc1.7`; N1/N2 bloqueantes). **Login real ainda aberto:** usuário usou `npm run dev`, perfil/banco original não localizado; consultar apenas existência/status após identificar `HUB_USER_DATA_PATH`/`userData` e WAR efetivos, sem senha/hash. Recuperação offline de senha é tarefa separada. Manual: wiki.caracore.com.br/hub/
7a. **Próxima pré-release do Hub:** outra tag, com bytes novos. `v2.1.0-rc1`, `v2.1.0-rc1.1`, `v2.1.0-rc1.2`, `v2.1.0-rc1.6`, `v2.1.0-rc1.7`, `v2.1.0-rc1.8` e `v2.1.0-rc1.10` permanecem; `rc1.3`, `rc1.4` e `rc1.5` nunca foram tagueadas. Ordem: versão em `electron/package.json` e nos POMs (`2.1.0-rc1.10` desde 07/11/2026); commit com árvore limpa; instalador `scripts/build_hub_exe.ps1` (recusa árvore suja e commit posterior ao artefato), nome público `CaraCore.Hub-<versão>-win-x64.exe`, ou ZIP portátil `scripts/build_hub_portable.py` com nome `CaraCore-Hub-<versão>-windows-x64.zip`; tag em `caracore-hub-releases`; cartão em `caracore-loja/docs/download.html`; matriz em `ecosistema.html`, `portfolio.html` e `assets/js/planning-data.js` / `planning.js`; sincronizar `AGENTS.md`, este ficheiro e as regras Cursor. A oficina privada só vai ao remoto quando o dono pedir. Sem certificado no repositório e sem anunciar GA.
6a. **Seed oficina:** `caracore-seed/docs/memoria-projeto.txt` · Java 25, launcher Tomcat embutido, runtime reduzido e Electron para piloto local gratuito sob MIT; app administra clientes/licenças, auditoria, alertas e registros locais de heartbeats; `StubPaymentGateway` não processa pagamentos reais. Piloto público aberto, sem convite ou cadastro prévio. Pré-release candidata Windows x64 `0.1.5` publicada para avaliação: [release](https://github.com/chmulato/caracore-seed-releases/releases/tag/v0.1.5), 216.466.586 bytes, SHA-256 `e449ca2cee74fda135ac098d2333fe674c2c476773a7d4adb60bc016a767db16`, unsigned; `0.1.4` é a release estável anterior. API protegida por sessão ADMIN/CSRF e token por licença; Host validado e porta local dinâmica. Heartbeats usam UTC do servidor; o cliente recebe `signedPayload` RSA documentado. Migração V8 preserva bancos 0.1.3/0.1.4 e chaves; Swagger UI/OpenAPI locais sem CDN. Homologação independente pendente; não declarar pronto para produção. Linux fora desta etapa; SQLite local, sem monitoramento remoto; código-fonte não publicado. Preservar banco e chaves ao atualizar; licenças antigas podem exigir emissão/rotação de token. Seed é complementar; cada produto mantém o próprio aplicativo e banco.
6b. **Retrô:** `caracore-retro/.agents/AGENTS.md` · 139 artigos HTML confirmados. A validação editorial permanece amarela/vermelha por BOM/byte extra antes do `DOCTYPE` em muitos artigos e avisos de SEO em `docs/articles.html`; não declarar 100% saudável antes da normalização controlada.
7. **PDV Rust (loja + artefatos):** um só repo `chmulato/caracore-rust-pdv-releases` — Pages = `pdv-rust.caracore.com.br` · Releases = https://github.com/chmulato/caracore-rust-pdv-releases/releases (tag v0.1.4). Clone local: `caracore-pdv-rust-releases`. **Nunca** `caracore-pdv-releases` (Java).
8. **Copy B2B:** [DILEMA.md](DILEMA.md) · hero `#engenharia-b2b` · portfólio `#decisoes-engenharia` · tom **FinOps/híbrido** (não anti-cloud na vitrine)
9. **Suporte PME:** [suporte-local.html](../suporte-local.html) — fora do nav B2B; horários noite/sábado só lá

---

## Handover multi-IA — Ink Agenda 2.0.4 e Gateway assinado (02/11/2026)

Para Cursor, Gemini/Antigravity, Qoder ou GitHub Copilot retomarem sem depender do histórico de chat.

**Estado (tudo em `master`):** `caracore-ink` e `caracore-ink-releases` sincronizados com o remoto; as alterações de alinhamento desta rodada em `caracore-site`, `caracore-wiki` e `caracore-loja` estão no checkout e **aguardam commit/publicação autorizados**. `caracore-api` e `caracore-cso-quarkus` recebem o núcleo do Gateway.
- Ink Desktop `v2.0.4` **publicada** (Latest em `caracore-ink-releases`): setup 62.870.016 B (`5ea79dac…ebd1c`), ZIP 61.399.641 B (`7849d462…e6fd3`) e `.deb` 53.457.882 B (`30eee2bd…dfc941`), além do `.dmg` 64.775.569 B (`34eb6777…4da183`), `checksum.sha256`, `SHA256SUMS`, `checksum.md5` e os checksums por plataforma. Tag `v2.0.4` em `8a2d84f`. CI `Build Instaladores Nativos` verde nas quatro jobs, incluindo macOS.
- O `.dmg` **não entra na loja nem na Central**: decisão do dono em 02/11/2026 (macOS fica para a 3.0 em PWA). O corpo da release no GitHub ainda descreve macOS — ver pendência 2.
- Conteúdo: A1–A9 (pagamento refletido no status, «lembrar senha» com DPAPI/AES-GCM por 12 h, avisos de backup e bloqueio, orçamento rolável, código de emergência mascarado, nomes longos) e verificação de atualização assinada com Ed25519 e chave pública embutida (`/release-signing-public-key.pem`, SPKI SHA-256 `7eb05dd4…bc48a`), allowlist `github.com/chmulato`/`*.caracore.com.br`, SHA-256 antes de abrir, `mandatory`/`min_supported` e timeout de 10 s. `mvn -B verify`: 637 testes, cobertura e gate LGPD aprovados.
- Gateway `api.caracore.com.br/releases/ink/latest.json` responde **200** com envelope assinado (`key_id ink-2026-11`), `version 2.0.4`, `min_supported 2.0.2`, `mandatory false` e os três assets; medido às 00:39Z de 02/11/2026, depois de a publicação das 00:22:50Z (release) e das 00:25:11Z (setup) deixar o canal em 404 por ~15 min de cache vazio.
- Superfícies alinhadas: loja `ink.caracore.com.br`, Central `download.caracore.com.br` (catálogo JSON + cartão), Wiki (`projeto-ink.html`, `projetos-overview.html`, `status.html`) e matriz (`portfolio.html`, `ecosistema.html`, `index.html`).

**Pendências, em ordem sugerida:**
1. Corrigir a interação publicação × cache do Gateway: hoje um manifesto incompleto fica 15 min em cache (`PT15M`) e o canal responde 404 até expirar. Opções: publicar a release depois de todos os assets ou não guardar manifesto vazio. Exige autorização para alterar/deployar.
2. Decidir o destino do `.dmg` e das notas da release: o corpo do GitHub cita macOS 13+, mas a loja diz que macOS não tem instalador. Alinhar o corpo (ou assumir macOS na copy) antes da próxima tag; o gerador `update-notes` continua escrevendo Java 21/pasta `AgendaInk\`.
3. Testar de verdade a atualização 2.0.3 → 2.0.4 com a chave embutida e um manifesto assinado (o caminho de erro também).
4. Validação visual de Configurações (1366×768, 100% e 125%) e do botão que abre a página de releases.
5. Assinatura Authenticode: depende de certificado e `signtool`; os textos públicos avisam do SmartScreen.

---

## Handover multi-IA — Ink Agenda 2.0.3 e Gateway (02/11/2026)

Para Cursor, Gemini/Antigravity, Qoder ou GitHub Copilot retomarem sem depender do histórico de chat.

**Estado (tudo em `master`, árvores limpas e sincronizadas em `caracore-ink`, `caracore-site`, `caracore-wiki`, `caracore-ink-releases`, `caracore-api`, `caracore-cso-quarkus`):**
- Ink Desktop `v2.0.3` **publicada** (Latest em `caracore-ink-releases`): setup, ZIP e .deb; SHA-256 na linha do Ink do changelog abaixo. Tag `v2.0.3` em `c67407e` (tag object `f8553bf`). Loja `ink.caracore.com.br/download.html` (commit `2a031c4`): Windows em destaque, "Linux (.deb)" com link, "macOS (.dmg): em breve" sem link.
- Gateway `api.caracore.com.br/releases/ink/latest.json` responde 2.0.3 (setup + SHA-256); cliente 2.0.3 reconhece como CURRENT. Fonte primária da especificação: `caracore-api`; produção ainda faz deploy de `caracore-cso-quarkus` (réplica temporária). Sincronizar o núcleo com `caracore-api/scripts/sincronizar_nucleo_cso.py --aplicar` e conferir com `verificar_nucleo_cso.py`. Rotas neutras (ver seção Gateway acima).
- App usa **Java 25** embutido (não 21) e JavaFX + SQLite (sem Quarkus no desktop).

**Pendências, em ordem sugerida:**
1. Corrigir o gerador de notas do job `update-notes` (escreve Java 21 e pasta `AgendaInk\` inexistente); hoje as notas da release foram editadas à mão e a próxima tag as sobrescreveria.
2. Portar `caracore.api.apps.ink.repo` / `asset-regex` (e a variável `CARACORE_API_APPS_INK_REPO`) para `caracore-api` antes de mover o deploy de produção.
3. macOS: o GitHub nunca alocou runner. `gh run rerun --failed` reusa o workflow antigo e reconstruiria tudo; o caminho seguro é adicionar ao workflow um `workflow_dispatch` só do job macOS para a tag existente (sem mudar hashes de Windows/Linux), anexar o .dmg, trocar "em breve" pelo link e registrar o SHA-256.
4. Validação visual de Configurações (1366×768, 100% e 125%) e do botão que abre a página de releases.
5. Assinatura Authenticode: depende de certificado e `signtool` (inexistentes); textos públicos avisam do SmartScreen.

**Armadilhas conhecidas:** JDK Temurin não traz `jmods` (ProGuard falha), o CI usa Corretto · `token.txt` (gitignored, nunca imprimir) é `NAME=value` com BOM · PowerShell `Set-Content -Encoding utf8` grava BOM (usar `edit` ou UTF-8 sem BOM) · o `download.html` de `caracore-site/delivery/ink` é só redirecionamento; a página real fica em `caracore-ink-releases/docs/` · não anunciar a 3.0 com data · não commitar/push sem pedido explícito do dono, e commits com o trailer `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>` quando feitos pelo Copilot.

---

## Presenças web (2026-10-05)

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
| MKT vitrine | https://mkt.caracore.com.br/ | caracore-mkt-releases |
| Helianto vitrine | https://helianto.caracore.com.br/ | caracore-helianto-releases |
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

**Marco v4 (04/10/2026) — snapshot desse dia:** em 04/10, `v4.0.0-rc4` era a pré-release pública da edição Free, para avaliação e com limite de 100 vendas finalizadas por mês civil — ZIP portátil Windows x64 unsigned; MSI não incluído. O asset remoto foi verificado após download; SHA-256 `31a0cdeda68dce058079c5d0d3d5652084ba8a8cc073dfce60e021c4b3c1fdf2`. A execução 20 do workflow antigo de validação falhou porque procurou EXE na release e resolveu o latest estável; o workflow foi atualizado localmente para validar ZIP/sidecar, ainda sem novo dispatch. T032 segue aberto pelo roteiro operacional formal; Edge/Windows 1280×800 e troca obrigatória de senha inicial estão resolvidos; `PERF-001–007` seguem congeladas. Naquele dia, a RC4 não era GA nem download estável. Launcher `iniciar_pdv.bat` (underscore); banco só `./data/caracore-pdv.db`. **Não** misturar com Free estável (`iniciar-pdv.bat` hífen; `%APPDATA%\caracore\`). A frente GA público 08/11/2026 continua condicionada ao aceite dos gates. Na mesma data o CSO congela a gestão de frota já publicada em 06/10. Nessa data, `v3.2.6-free` era a versão estável e multiplataforma. O canal estável passou a `v3.2.7-free` em 07/10/2026. O estado vigente está no topo deste ficheiro: download público `v4.0.0-rc5`; `v4.0.0-rc6` em preparação, SHA-256 a publicar.

**Planos Java** (`PlanoLicencaService`): Free = 100 vendas/mês, 100 produtos, 1 operador, 4 vendedores, 1 loja, sem PIX integrado ou NF-e/NFC-e. A copy pode informar recibo digital por link e PDF, sempre **sem valor fiscal**. Premium = R$ 79,90/mês, sem teto de 100 vendas, com PIX integrado e trilha fiscal. Loja: CTA = **Baixar Free (3.2.12)**; Premium via demonstração. A `v3.2.12-free` é atualização corretiva da linha 3.2.x, em manutenção restrita até 08/11/2026. Rust `v0.1.4` = 100 vendas na vida do piloto.

| Papel | Repo / URL |
|-------|------------|
| Java maduro | pdv.caracore.com.br · **v3.2.12-free** · caracore-pdv (`hotfix/3.2.12-free`) |
| Java v4 candidata 31/10 | prévia pública (build 31/10/2026) · 100 vendas finalizadas/mês · SHA-256 `0c2003b0f99a75328f7ebe632fc20b07cb5834a3f75b6f0e97ccfb7aef83434d` · rc6/rc5 no histórico · não GA |
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

## BioReator 4.0 — referência rápida

**Community 1.1.1 publicada em 13/10/2026.** Simulador desktop de bioinsumos e fermentação. A oficina é a do RU (`caracore-ru`). A loja do produto é **`https://ru.caracore.com.br/`**; a Central de Downloads também lista os artefatos.

| Papel | Onde está |
|-------|-----------|
| Community | *Bradyrhizobium japonicum*, batelada, gráficos, histórico local e CSV com estimativa configurada de UFC/mL. A 1.1.1 distingue biomassa viável/total, calcula P/V pelo volume líquido e registra o primeiro critério de término em `end_reason`; mantém os efeitos de oxigênio, temperatura e pH, fase lag, decaimento celular e término por esgotamento do substrato introduzidos na 1.1.0. |
| Pro | Catálogo, batelada alimentada, custos informados pelo operador e PDF. Sem preço e sem PIX. |
| Versão | Community **1.1.1**, release `bioreator-1.1.1`. Premium do mesmo produto em 18/06/2027. Maven da oficina permanece `ru-free` `1.0.0-SNAPSHOT`. |
| Artefatos | MSI 72.675.328 bytes, SHA-256 `6eb0dd01006304d78c74f185345711bc8d4e135b03443d2ab583379338b04b21`. ZIP 73.592.557 bytes, SHA-256 `b36d18a0fae828f359db3c2a6509ad519849e560487d0ebbfaa3c3c85e09e1d7`. EXE dentro do ZIP, 524.800 bytes, SHA-256 `88eb22c17b547ded71aed275021bfbbd4121b171cbaba4373dfdca96c11a609a`. Sem assinatura. |
| Loja | `https://ru.caracore.com.br/bioreator.html` · downloads em `download.html#arquivos` · manual `manual-bioreator.html` · critérios `manual-tecnico.html#criterios-fim` · fundamentos `fundamentos-bioprocesso.html` · exemplo `exemplo-bioreator.html` |
| Oficina | `caracore-ru/docs/PLANO_SPRINTS_BIORREATOR.md` · `docs/MANUAL_OPERADOR_BIOREATOR.md` |
| Matriz | `portfolio.html#bioreator40` · `ecosistema.html` |
| Wiki | `projeto-bioreator.html` · `bioreator-tecnico.html` |

*Bacillus thuringiensis* descreve só o crescimento. A medição da máquina de 10/10/2026 ficou em 3,8 s e 175 MB, acima dos limites internos de 2,5 s e 120 MB. O lançamento de 18/06/2027 continua sendo o do RU Soberano. Fora da cota de outubro.

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
| BioReator 4.0 | `#bioreator40` |
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
| caracore-seed | `docs/memoria-projeto.txt` | Piloto público MIT local; pré-release candidata Windows 0.1.5 para avaliação, sem convite; API protegida e porta dinâmica; documentação local sem CDN; homologação independente pendente; Linux fora desta etapa |
| caracore-hub-releases | `.cursor/rules/project-memory.mdc` | Loja hub.caracore.com.br |
| caracore-pdv-rust-releases | Sim | Loja pdv-rust |
| caracore-pdv | `AGENTS.md` · `docs/arquitetura/STATUS_ATUAL_APLICACAO.md` · `CONTINUIDADE_DESENVOLVIMENTO.md` · `.cursor/rules/project-memory.mdc` | Free `v3.2.12-free` no ramo `hotfix/3.2.12-free`; `master` `c343890` é a fonte do ZIP público v4 `v4.0.0-candidato-20261031` (SHA-256 `0c2003b0f99a75328f7ebe632fc20b07cb5834a3f75b6f0e97ccfb7aef83434d`); `v4.0.0-rc6` (tag `b3358fe`, fonte `681ea32`) e `v4.0.0-rc5` no histórico; RC7 é a rota aprovada, sem tag; Gate E de 29/10 recusou o GA; T032/M01–M11 medidos em `ff400efd`; SCA não medido; `PERF-001–007` congeladas |
| caracore-pdv-releases | `.cursor/rules/project-memory.mdc` | Loja pdv.caracore.com.br · CTA Baixar Free (3.2.12) · Free 100/mês · sem PIX integrado |
| caracore-ete | `AGENTS.md` · `.cursor/rules/project-memory.mdc` | Canal **v1.2.3**; Windows onefile+ZIP; PyArmor no bundle; Flask 5150 |
| caracore-ete-releases | `docs/artifacts/VERSION` | Loja ete.caracore.com.br · Latest v1.2.3 |
| Demais produtos | Sim | ink, ru, … |

Lista completa: `ECOSYSTEM_CARA_CORE.md`.

---

## Estado recente do ecossistema (changelog)

| 2026-10-13 | **CaraCore Seed — candidato local `0.1.3` para homologação fechada:** Windows x64, 218.924.034 bytes, SHA-256 `5adf48b1b8b14d79ff55fc7aecc1f38f7d4ee221848b68af3bae58e5a83626e8`, unsigned. Suíte Java 914, launcher 2 e Electron 6 aprovados; instalador/uso em perfil limpo ainda pendente. Mensagens do primeiro acesso e da troca/recuperação de senha esclarecem cópia da chave, senha inicial `admin`, limite de 8 caracteres e confirmação. Candidato não enviado nem publicado; Linux fora desta entrega. SHA-256 real do artefato `0.1.0` presente no checkout: `e4d68a4ca3e22a80275c21b652b8fa24e755a1ca5634f615b8265d8dae0d5d95` (corrige o valor anteriormente registrado). |

| Data | Alteração |
|------|-----------|
| 2026-11-08 | **Ink: data da entrega do 2.3.0 revista de 06/04/2027 para 29/01/2027 (decisão do dono):** o corte usa a Fase 1/2A do Hub — os 3 dias de abril da fatia Ink (01, 02 e 05/04) são exatamente a Fase 4, a única janela reservada a retrabalho S1/S2 do Hub —, e **mar–abr/2027 ficam intocados**. A fatia passa a gastar **nov+dez+jan (15 dias)** e devolve **13 dias (fev–abr) ao envelope do núcleo**. Risco assumido e registrado: um atraso de uma semana cai direto no **G2 do Hub (05/02/2027)**; o gate do Ink continua a não se cortar para caber na data. Propagado em `caracore-ink` (ROADMAP_P1, CHECKLIST_RELEASE_2_3_0, AGENTS, PLANO_PWA, ROADMAP, PLANO_ALINHAMENTO, REGISTRO_RISCOS, EPICO_J_MP, matriz e índices) e neste repositório (AGENTS, CALENDARIO_COTA_CURSOR, RISCOS_ECOSSISTEMA, ECOSYSTEM_CARA_CORE, este ficheiro). Nada publicado: produto no ar continua o 2.2.1 |
| 2026-11-08 | **Ink: Onda 1 commitada e empurrada em `3381aa3` (nada publicado como produto):** a árvore de 73 entradas do fecho do dia (63 modificadas + 10 novas) foi auditada, o gate foi remédido na árvore exacta (745/0 + 8 LGPD e 825/0, demo V30) e foi publicado o commit `feat(2.3.0): P1.2.4–P1.2.8, presença e G1 da Onda 1` — 72 ficheiros, +3.214/−262, sobre `b4fe1dd`; `master` em sincronia com `origin/master` e árvore limpa. Em seguida, `eebf76d` acertou os pontos de retomada no próprio repo (AGENTS, ROADMAP_P1, PLANO_ALINHAMENTO, CHECKLIST_HOMOLOGACAO, CHECKLIST_RELEASE, project-memory e nova linha no REGISTRO_RISCOS) e este commit acerta as superfícies do ecossistema. **O que não mudou:** o download continua o **2.2.1**, o canal segue **keyless**, não houve tag, release nem deploy, e nenhum caso `H-*` muda de status — os prints H-A04, H-A08 e H-C04 seguem para 10–14/11 e a data de 06/04/2027 não se move. |
| 2026-11-08 | **Ink: fecho do dia 08/11/2026 — sessão encerrada, nada publicado:** Onda 1 da P1 fechada tecnicamente e plano de alinhamento aplicado (P1.2.8, AL-01/AL-02 corrigidos, AL-03 declarado, AL-04 confirmado). Working tree **sem commit** (`HEAD` `b4fe1dd`, 73 entradas: 63 modificadas + 10 novas). Gate de saída: `mvn -B verify` **745/0** (+8 LGPD), `mvn -Ptestfx verify` **825/0** (745 + 80 `*FxIT`/IT) e demo «Base demo consistente» em **V30**. Próxima sessão (10–14/11, os 2 dias restantes de nov/2026): sandbox B1 → **H-A04**, depois **H-C04** na mesma base; o **H-A08** depende de um `.inkbak` 2.2.1 (senão escorrega para dez/2026). Riscos abertos no fecho: **RK-01 e RK-02** (mar/2027); **RK-06 mitigado** com os prints pendentes. Release segue em 06/04/2027; nenhum caso `H-*` vira «Conforme» sem evidência. |
| 2026-11-08 | **Ink: cinco decisões de alinhamento aplicadas e P1.2.8 entregue (checkout, nada publicado):** AL-01 corrigido — o import do CSV de recuperação passa o `professionalLogin` ao `AppointmentConflictDetector` (dois profissionais no mesmo horário entram os dois; o mesmo profissional continua bloqueado), com 2 testes novos no `CsvBackupServiceTest` (17/17). AL-02 corrigido — 21 strings em 11 classes e as 5 mensagens do `LegacyDomainSyncService` passaram a usar `NicheTerminology`, com os helpers novos `termWorkspaceLower`/`termSessionLower` e `NicheTerminologyTest#copyOutsideTheDayFlowFollowsTheNiche` provando os três nichos (inclui «não atende sessões/consultas/procedimentos» e «Backup do estúdio/consultório/espaço»). AL-03 declarado nas notas da release (R-A03) e AL-04 confirmado como recorte doc-only (9 requisitos, 15 casos, `V27`–`V30`); o rótulo da correção M2 virou caso do H-C10. Gate remédido: `mvn -B verify` **745/0** (+8 LGPD), `mvn -Ptestfx verify` **825/0** e demo em V30. Sem commit, push, tag ou deploy; 06/04/2027 não se moveu. |
| 2026-11-08 | **Ink: arrumação de coerência da documentação da Onda 1 (checkout, nada publicado):** rastreabilidade de casos corrigida no `ROADMAP_P1.md` — `H-A07` passa a **Onda 2/P1.6.4** (depende do backfill de `cliente_id`), `H-A08` fica só no **P1.11.4 (Onda 4)** e a execução de 10–14/11 passa a ser rotulada como **evidência de release** (upgrade 2.2.1 → 2.3.0), `H-C09` entra na Onda 1 pelo P1.2.5; a tabela de capacidade de 05/11/2026 foi marcada como **histórica**, com as posições datadas de 07/11 e 08/11 como estado vigente; o pré-requisito do H-A08 (não existe `.inkbak` 2.2.1 no projeto — verificado em 08/11/2026) ficou registado no checklist, com a regra de escorregar para dez/2026 se não houver backup; no registro de riscos, **RK-09 → Controlado** (ciclo de nov/2026 fechado: 3 itens nos 3 dias) e **RK-10** atualizado para o gate de 08/11/2026 (V29, 727/0 + 8 LGPD, 802/0 com 75 ITs, demo V29); contagens alinhadas à tabela real do roadmap (**14** sub-itens na Onda 1, antes 13; **82** casos no checklist, antes 81). Sem commit, push, tag ou deploy. |
| 2026-11-08 | **Ink: P1.3 entregue e G1 verde — Onda 1 fechada tecnicamente (sem commit, nada publicado):** a presença passou a ser estado próprio (`AttendanceStatus`: Agendado, Atendido, Faltou, Cancelado) separada do estágio comercial; a **V29** cria `attendance_status` com backfill (`Pago`/`Sessão`/`Aftercare` → Atendido; o resto → Agendado) e índice por estúdio/dia. O espelho legado traduz a presença para o vocabulário do calendário (Atendido→Encerrado, Faltou→NoShow, Cancelado→Cancelado, Agendado→Confirmado) e o teste prova zero órfãos. O pagamento da sessão ficou idempotente (marcar pago 2× = 1 `Recebimento`) e ganhou desfazer (remove o recebimento e reabre a cobrança). O resumo do dia (`DaySummaryService`) exclui falta/cancelado do previsto e nunca apaga dinheiro recebido; a linha do dia ganhou o seletor de presença. **RK-18 corrigido:** o CSV de recuperação exporta `professional_login` e importa como coluna opcional (CSV antigo cai na autoria). Testes: `AttendanceStatusTest` 3, `DaySummaryTest` 3, `DaySummaryIT` 3, `FinanceiroControllerTest` +2 (H-C05/H-C06), `CsvBackupServiceTest` +2 e `BusinessRulesFxIT` 19 → 20 (H-C04 no ecrã: FALTOU/CANCELADO mudam só a presença e tiram o valor do previsto). Gate medido em 08/11/2026: `mvn -B verify` **727/0** (+8 do gate LGPD), `mvn -Ptestfx verify` **802/0** (75 `*FxIT`/IT) e validador da demo verde em base recém-migrada até a **V29**; upgrade/restore cobertos por `FlywaySqliteMigratorTest` e `RestoreServiceTest` (dossiê V25 → V29). **G1 registrado verde no mesmo dia** — 14 de 14 sub-itens da Onda 1; faltam os prints H-A04, H-A08 e H-C04 na semana de 10–14/11, e nenhum caso `H-*` vira «Conforme» antes do SHA homologado. |
| 2026-11-08 | **Ink: P1.2.4 entregue — conflito de horário por profissional (commit local, nada publicado):** `AppointmentConflictDetector.findConflict` e `AgendaController.findSessionConflict` (5 argumentos) passaram a filtrar pelo profissional; o mesmo horário de outro profissional é permitido, o mesmo profissional bloqueia e a mensagem nomeia quem atende (`ProfessionalDirectory.displayNameOf`), voltando à frase antiga quando o nome não resolve. Chamada de 4 argumentos (fluxo legado) continua comparando a agenda inteira. O `OperationalAppointmentDialog` resolve o profissional **antes** da checagem, de modo que conflito e gravação usam o mesmo valor; o `ClientFormTab` usa um único valor na checagem e no `ClientIntakeController.createPrimaryFlow`. `ControllerCoverageTest` 13 → 14, `ClientFormTabConflictMessageTest` (novo, 2 casos) e `BusinessRulesFxIT` 18 → 19 (o teste de conflito passou a isolar o `caracore.ink.localappdata`, que antes lia o `owner-contact` real da máquina). Gate medido em 08/11/2026: `mvn -B verify` **724/0**, `mvn -Ptestfx verify` **795/0** (71 `*FxIT`/IT) e validador da demo verde até a **V28** (9 agendamentos operacionais, 0 sem `professional_login`); 9 de 14 sub-itens da Onda 1, próximo **P1.3** (presença × dinheiro; o CSV de recuperação leva o profissional, RK-18). **H-C07 fechado como automatizado em 08/11/2026, a pedido do dono:** `BusinessRulesFxIT#dayAgendaDialogScopesTheConflictToTheProfessional` abre o «Novo agendamento» e grava 10:00 para Ana (permitido), 15:00 para o dono (controle positivo) e tenta 10:00 para o dono (bloqueado); a mensagem que nomeia quem atende fica em `ClientFormTabConflictMessageTest`; o print manual deixou de ser requisito (o login na sandbox falhou). **Incidente no mesmo dia (RK-14):** `mvn -Dcaracore.ink.localappdata=… javafx:run` não propagou a propriedade ao JVM filho e a GUI abriu a base real do `AppData`, migrando V22 → V28; sem perda observada, o app gerou backup pós-migração e **não existe backup pré-migração** — lançamento de GUI passa a exigir `JAVA_TOOL_OPTIONS=-Dcaracore.ink.localappdata=<sandbox>` e conferência do caminho da base. Os gates também escreviam backups/auditoria no AppData real (testes faziam `clearProperty` do override); surefire passou a usar `target/test-sandbox-appdata` e failsafe `target/testfx-appdata`, com os testes restaurando o valor anterior — medido antes/depois, o AppData real não muda. O print do H-C08 saiu no mesmo dia. |
| 2026-11-08 | **Ink: P1.2.2 e P1.2.3 entregues — profissional gravado e seletor só quando há mais de um (commit local, nada publicado):** **P1.2.2** (`370a8b1`, commit local sem push): `Appointment.professionalLogin` entra no create/update/list do repositório; sem profissional explícito vale a autoria (numa base de um profissional, o dono) e a edição que omite o campo preserva o valor atual — `ControllerCoverageTest` 10 → 13 casos. **P1.2.3:** `ProfessionalDirectory` (novo) define quem atende: **dono + usuários ativos de perfil Agenda** (perfil Financeiro vê dinheiro, não atende, e não aparece no seletor); o `OperationalAppointmentDialog` só constrói o campo com 2+ profissionais (com um só, fica oculto e fixo no dono) e o mesmo valor resolvido chega ao `ClientIntakeController.createPrimaryFlow` pela `ClientFormTab`; `AuthController.listTeamMembers()` novo e sem gate de ADMIN para a leitura da equipe. Testes novos/ampliados: `ProfessionalDirectoryTest` 2, `ClientIntakeControllerTest` 2 → 3, `BusinessRulesFxIT` 16 → 18 (prova a ausência real do campo com um profissional). Gate medido em 08/11/2026: `mvn -B verify` **721/0**, `mvn -Ptestfx verify` **791/0** (70 `*FxIT`/IT) e validador da demo verde até a **V28** (0 agendamentos sem `professional_login`; 9 com o marcador `local-user`); 8 de 14 sub-itens da Onda 1, próximo **P1.2.4** (conflito por profissional, H-C07). **H-C08 fechado no mesmo dia:** print numa base sandbox com 1 profissional (0 usuários de equipe, `local-user`) mostra o «Novo agendamento» sem o campo «Profissional»; evidência local em `caracore-ink/docs/evidencias/` (fora do git). RK-18 (CSV de recuperação sem o profissional) segue aberto para decisão do dono. |
| 2026-11-07 | **Ink: chave `ink-2026-11` relacrada com senha nova, envelopes da 2.2.1 publicados e segredo retirado do Railway:** ao executar o passo 1 da ordem de custódia de 06/11, a senha do gerenciador **não abriu** o lacre de 02/11/2026 (320 B, `8be5ad2b…84cd4`) — recusada tanto pelo 7-Zip como pelo py7zr, inclusive com digitação direta do dono. A chave **não estava perdida**: a cópia em claro ainda existia e derivou fingerprint `7eb05dd4…48a`, igual ao PEM embutido no app. Decisão do dono: **relacrar a mesma chave** (não gerar par novo, que exigiria versão-ponte e quebraria a atualização de todo app 2.2.x) com senha nova guardada no gerenciador. Lacre novo: **314 B, SHA-256 `f766e774…45ed`**, provado por duas leituras independentes (py7zr e 7-Zip, este devolvendo `7eb05dd4…48a`), cabeçalhos cifrados e senha errada recusada; o lacre antigo ficou aposentado como `.20261102` e a **cópia em claro foi apagada** (sobrescrita com bytes aleatórios, varredura sem resíduo) depois de o dono confirmar a senha no gerenciador. **Cofre atualizado em 07/11/2026** com o mesmo lacre novo (SHA-256 conferido nas duas pastas). **Virada concluída no mesmo dia:** deploy do R-E06 (`8d530ad` no `caracore-cso-quarkus`, CI `Quarkus CI Pipeline` verde em 4m31s, Railway SUCCESS); os dois envelopes da 2.2.1 foram assinados com a chave decifrada **só em memória** — `ink-manifest.json` 8.859 B `ab2d82b8baa34000f66d6e306ce524718cf72689c1d77f3ecb5d4c340d988bf7` e `ink-manifest-mandatory.json` 8.854 B `c33ca51de7200ed9ce069dbf1a512c9485ea9fc41b23d3896d93c45dad52ff97` —, verificados com OpenSSL pela pública embutida e publicados na `v2.2.1`; payload e assinatura saíram byte a byte iguais aos que o serviço assinava na hora (Ed25519 é determinística). Em seguida `INK_RELEASE_SIGNING_KEY` foi **removida do Railway** (ausente por nome, 34 variáveis restantes, `INK_RELEASE_SIGNING_KEY_ID` mantida) com redeploy `3f73f761` SUCCESS, porque apagar variável não reinicia sozinho; o canal mede 200 **sem a chave**, com `key_id ink-2026-11`, versão 2.2.1, assinatura válida, corpo idêntico ao asset, `mandatory=false` em `?current=2.2.1` e `mandatory=true` em `?current=2.0.1`, CORS estreito. Emergência daqui em diante: **substituir o asset**, nunca repor a chave. Registro detalhado: `E:\CC_KEYS\ink-release-keys\CUSTODIA_CHAVE_INK_20261102.md` §10.6. |
| 2026-11-06 | **Ink: P1.4 cortada do 2.3.0, P1.1 + P1.2.1 entregues e caminho do `.deb` provado (commit local, nada publicado):** a **P1.4 (Hoje com resumo) saiu do 2.3.0** e passa para a Onda 2 — o Desktop **2.3.0 de 06/04/2027 entrega só a Onda 1**, e março/2027 vira homologação manual e ensaio de release (R-A..R-D). Entregue na linha 2.x, SHA `6ae4f1c`: **P1.1** (escopo de estúdio, V27) e **P1.2.1** (profissional no agendamento, V28 + remap do legado). Gate medido no mesmo SHA: `mvn -B verify` **715/0** (inclui 8 do gate LGPD), `mvn -Ptestfx verify` **783/0** (68 `*FxIT`/IT), validador da demo "Base demo consistente", schema **V28**. Progresso **6 de 13** sub-itens da Onda 1; próximo P1.2.2 → P1.2.3 → P1.2.4 → P1.3.1–P1.3.4 → G1. **D-H2 resolvida (06/11/2026):** o dono assina o aceite como responsável; independência = gate automatizado no SHA de release + checklist em máquina limpa + acompanhamento de 30 dias, com segundo assinante humano **opcional** (revisão externa ou estúdio piloto, condicionado a D-H3 — ainda aberta ao lado da custódia da chave de assinatura). Épico **J-MP (Mercado Pago no Desktop)** especificado em `caracore-ink/docs/EPICO_J_MP.md` (6 passos, 12 erros orientativos; D1–D3 fechadas: desktop→MP por HTTPS + polling, Access Token colado, cofre do SO) e **começa depois do corte do 2.3.0**. Checklist de release 2.3.0 com 38 itens `R-*`; o caminho do `.deb` Linux apontava para um script removido em `e70e725` e foi trocado pelo real — `docker/Dockerfile.linux-build`, base **JDK 25 Corretto** porque o Temurin 24+ deixa de trazer `jmods` (JEP 493) e quebra o ProGuard — e provado ponta a ponta: BUILD SUCCESS em 2 min 28 s e `agenda-ink_2.2.1_amd64.deb` 55,3 MB (`4d0088fb…5c41d97c`). Commits locais `174714a` (build) e `12aae94` (docs), **sem push**. Defeito do `Maintainer` do `.deb` **corrigido em 06/11/2026** (o `linuxDebMaintainer` já trazia nome+e-mail e o jpackage prefixa o vendor; agora leva só o e-mail e o artefato regerado mostra `Maintainer: Cara Core Informática <suporte@caracore.com.br>`, 55.310.508 B, `c6f75b91…b6cc1`). **D-H3 fechada** no mesmo dia: o piloto com 3 estúdios fica para fase posterior e não condiciona o 2.3.0. **Custódia da chave decidida:** a `ink-2026-11` (Ed25519, fingerprint `7eb05dd4…48a`, lacre `8be5ad2b…84cd4`) passa a existir em **duas cópias lacradas — o HD `E:\CC_KEYS` e o cofre OneDrive** `D:\onedrive\Cofre Pessoal`, com o mesmo SHA-256 conferido nas duas em 06/11/2026 —, sai do Railway e da cópia em claro, e o manifesto do corte exige **assinatura offline** com o HD conectado (R-E06); nenhuma chave nova é gerada, porque os apps 2.2.x só aceitam essa. Superfícies de IA alinhadas nesta revisão: `caracore-site/AGENTS.md`, `CALENDARIO_COTA_CURSOR.md`, `RISCOS_ECOSSISTEMA.md` (R14), `.cursor/rules/ecosystem-cara-core.mdc` e `caracore-ink/.cursor/rules/project-memory.mdc`. |
| 2026-11-05 | **Cota do Ink refeita: 5 dias/mês até 06/04/2027 e entrega do Desktop 2.3.0 (nada publicado, nada commitado):** decisão do dono ao alinhar o plano — **5 dias de trabalho por mês de nov/2026 a 06/04/2027** para o Ink, dentro da janela do Hub, sem tirar dias do Hub nem do PDV. Medição que precedeu a decisão: 28 dias nominais (nov 5 · dez 5 · jan 5 · fev 5 · mar 5 · abr 3, porque 06/04 é a entrega) e ~20–23 úteis depois de gates, homologação e folga de release; P1 completa 44–60 dias, S1+S2 10–14, S3–S8 24–34, GA 3.0 78–108 — a 5 dias/mês o GA só sairia em 2028, e fechá-lo em 06/04 exigiria ~15–20 dias/mês e tomaria o Hub. **Portanto 06/04/2027 entrega o Desktop 2.3.0**, não o 3.0: P1 Onda 1 (fundação multi-perfil, profissional e presença, migrações V27–V29) garantida na linha 2.x; P1.4 (Hoje com resumo) como alongamento; a PWA (S3–S8) e o GA 3.0 ficam **pós-Hub, sem data dura** — mantida a projeção de 2028, o "não antes de 2028" da loja continua verdadeiro. Ordem revista: **2.3.0 → S1 (`ink-core`) → S2 → P1 Ondas 2–4 (3.0.0-RC1) → S3–S9**, deixando de tratar S1/S2 como pré-requisito da P1. Capacidade do ciclo (R14 em `RISCOS_ECOSSISTEMA.md`): a fatia não acumula mês ocioso, não é segunda frente pesada no mesmo dia e cede inteira se o núcleo precisar; S1–S8 seguem fechados na janela do Hub. Alinhado em `caracore-ink` (`AGENTS.md`, `.cursor/rules/project-memory.mdc`, `README.md`, `ROADMAP.md`, `STACK.md`, `docs/MEMORIA_MATRIZ.md`, `docs/PLANO_PWA.md`, `docs/ROADMAP_P1.md`, e o local-ignorado `agenda-java/docs/INDICE_DOCUMENTACAO.md`) e neste repositório (`CALENDARIO_COTA_CURSOR.md`, `RISCOS_ECOSSISTEMA.md`, `AGENTS.md`). Nenhum código de produto escrito e nenhuma tag; loja (`caracore-ink-releases`: index, download, pwa e tecnologia) e wiki (`projeto-ink.html`) passaram a citar o 2.3.0 em 05/11/2026, apenas no disco — sem commit nem publicação. |
| 2026-11-04 | **Ink Agenda Desktop `v2.2.1` nas quatro camadas e memória do ecossistema realinhada:** release `v2.2.1` (Latest) com setup 62.947.840 B `39eafa4a…270c124b`, ZIP 61.477.189 B `4baf257d…deef98b1` e `.deb` 53.419.622 B `1b89bb76…841cef14`, unsigned; loja `0805fdc`, wiki `0ffbc5d`, central `4d30e35` e matriz `6a12418` empurrados com Pages `built`; o canal `releases/ink/latest.json` serve `2.2.1` (`min_supported 2.0.2`, medido ao vivo). `mvn verify` em Java 25 = 713 testes; SCA por OSV no artefato: 0 achados em 16 dependências (NVD/OWASP DC **não** rodaram). **Varredura de coerência das superfícies de IA (só ficheiros locais, sem commit):** na regra sempre-aplicada `.cursor/rules/ecosystem-cara-core.mdc`, Ink 2.0.1 → 2.2.1, PDV `rc6` → candidato de 31/10, Hub `rc1.7`/“próxima `rc1.8`” → `rc1.8` publicada e BioReator 1.0.0 → 1.1.1; em `AGENTS.md`, data de atualização, bloco novo de 04/11, checkpoint do Hub marcado como histórico, DMG/DEB da 3.0 e correções 2.2.x; em `ECOSYSTEM_MEMORIA.md`, gateway Ink 2.1.0 → 2.2.1, ponteiro morto para o `AGENTS.md` da raiz, snapshot do PDV v4, âncora quebrada da retomada e dumps antigos do Ink marcados como histórico; `v3.2.8` → `v3.2.12-free` no `CALENDARIO_COTA_CURSOR.md`, `VALIDACAO_LOJAS_MATRIZ.md` e `VALIDACAO_NEGOCIO.md`; DMG/DEB e o ponteiro da raiz no `RISCOS_ECOSSISTEMA.md`; BioReator 1.1.1 no `INICIAR_NOVA_TAREFA.md`; retrô com **139 artigos** em `STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md` e `MEMORIA_DO_PROJETO.md`; `GEMINI.md`; oficina Ink (`agents.md`, `.cursor/rules/project-memory.mdc`, `docs/PLANO_PWA.md`, `docs/RELEASE_2.2.1.md`); regra da oficina Hub (`rc1.8`) e regra da matriz (OIDC `v2.0.2-free`). **Segunda passagem (mesmo dia, ainda sem commit):** regra da loja Hub reescrita para o pacote `v2.1.0-rc1.8` (ZIP 324.536.724 B `3c4e61b2…743334`, sem NSIS, aceite pendente; `rc1.7` movida para o histórico como REPROVADA); `caracore-hub/docs/contexto-rapido.md` com a "Situação" em `rc1.8` e o bloco de 29/10 rotulado como histórico; regra da loja Ink sem o ponteiro morto para o arquivo `VERSION` (a versão vive em `agenda-java/pom.xml`); `.github/copilot-instructions.md` acertado com Hub `rc1.8`, prévia do PDV, Ink 2.2.1 e **Seed em Java 25** (o `maven.compiler.release` do Seed é 25 — a regra do workspace e o `GEMINI.md` diziam 17, corrigidos). |

| 2026-11-02 | **Ink Agenda 2.0.4 publicada (Latest) e superfícies alinhadas:** release `v2.0.4` em `caracore-ink-releases` (tag `8a2d84f`) com setup 62.870.016 B `5ea79dac30719ef11150e2f5de09d340b697f967918524ae12761c07051ebd1c`, ZIP 61.399.641 B `7849d462625dbb356900d6e7f97a54c491d634ad5ac9b7cee9a6c8f3ee3e6fd3`, `.deb` 53.457.882 B `30eee2bda5972decf8805855e002010e6a80978a74c259f5b61e57f3d9dfc941`, `.dmg` 64.775.569 B `34eb67778e5a672b2a8a76e18ca83dbbb1c35f583419272b6d0d001b454da183` e checksums; CI `Build Instaladores Nativos` verde nas quatro jobs. Aplica A1–A9 e verificação de atualização assinada (Ed25519, chave pública embutida, allowlist, SHA-256, `mandatory`/`min_supported`, timeout de 10 s); `mvn -B verify` com 637 testes. Gateway `api.caracore.com.br/releases/ink/latest.json` passou a responder 200 assinado (`key_id ink-2026-11`, `2.0.4`, `min_supported 2.0.2`) às 00:39Z, após ~15 min de 404 por cache de manifesto incompleto. Loja `ink.caracore.com.br`, Central `download.caracore.com.br` (`produtos.json` + `download.html`), Wiki (`projeto-ink.html`, `projetos-overview.html`, `status.html`) e matriz (`portfolio.html`, `ecosistema.html`, `index.html`) passam a 2.0.4; macOS segue fora da loja por decisão do dono, embora o `.dmg` esteja anexado e o corpo da release o descreva. **Pendência aberta:** corrigir a interação publicação × cache (`PT15M`) e alinhar o corpo da release sobre macOS. |
| 2026-11-01 | **Ink Agenda 2.0.2 disponibilizada como prerelease para homologação:** a release GitHub `v2.0.2` deixa de ser draft e fica marcada como prerelease (não Latest/GA); a `v2.0.1` permanece estável/Latest. Site institucional, Wiki, Central e loja do Ink passam a oferecer os assets candidatos com os avisos de assinatura ausente e homologação pendente. Assets: setup 56.872.960 B, SHA-256 `f9dde7c521dd64c39ee5dfa3c62bdb8c09f000bf7083c34e15fe47bc0a6cfa54`; ZIP 60.350.991 B, SHA-256 `ab66a21bb39ab597757374ac1b4e280c1129171de54b71f36bacfe90e9171a94`; `checksum.sha256` incluído. A candidata ainda não foi aprovada para uso estável. |
| 2026-11-01 | **Ink Agenda 2.0.2 preparada em draft antes da autorização para homologação:** fonte `caracore-ink` commit `af075f1` em `master`; artefatos Windows ofuscados enviados à release draft `v2.0.2` em `caracore-ink-releases` (asset setup SHA-256 `f9dde7c521dd64c39ee5dfa3c62bdb8c09f000bf7083c34e15fe47bc0a6cfa54`, ZIP `ab66a21bb39ab597757374ac1b4e280c1129171de54b71f36bacfe90e9171a94`, checksum sidecar incluído). Gate no candidato: `mvn -o verify -Ptestfx` — 596 unitários, 8 do gate de logs e 58 TestFX, cobertura aprovada; validação `scripts/run_agenda_demo.py --validate-db agenda-java/demo.db` aprovada. Setup e launcher retornam `NotSigned`; sem certificado. Loja candidata em `caracore-ink-releases` branch `release/v2.0.2-draft`, commit `69c7e28`; páginas públicas apontavam à v2.0.1 até a publicação da prerelease e das superfícies em 01/11. Pendentes antes de aprovar como estável: homologação visual 1366×768 a 100%/125%, teste de upgrade em cópia real da base v2.0.1 e decisão/aceite sobre assinatura. |
| 2026-11-01 | **PDV v4 — vitrine, wiki, Central e matriz PUBLICADAS na candidata de 31/10; fila de retomada registrada:** por pedido do dono, `caracore-pdv-releases` `e54476d`, `caracore-wiki` `fb040bf`, `caracore-loja` `45835e5` e `caracore-site` `fd4b150` foram empurrados e o GitHub Pages construiu cada commit (`status=built`); conferido ao vivo com cache-bust. A vitrine serve `download.html#pre-release-v4` (ZIP 178.317.680 B, SHA-256 `0c2003b0…83434d`, sidecar, release no GitHub e registro em markdown) e manda a RC6 para `#rc6`; `#instalacao-rc6` deixou de existir; selo **"Em pré-lançamento · prévia candidata"** sem data. O canal `api.caracore.com.br/releases/latest.json` segue em `3.2.12-free` (`sha256=6d7a50b0…`), correto enquanto a v4 for pré-release. **Resíduo aberto:** o corpo da release `v3.2.12-free` no GitHub, espelhado em `releaseNotes`, ainda cita "a linha v4 RC6"; correção só por `gh release edit`, sob pedido. **Contradição corrigida:** a memória da oficina (`caracore-pdv/AGENTS.md`) ainda dizia que a prévia pública era a RC6 e que nada fora publicado no ciclo — atualizada em 01/11/2026. **Fila registrada** no § "Checkpoint 01/11/2026": T032 manual e matriz M01–M11 no pacote de 31/10; SCA/G1; cenário migrado; `rc7`; GA em data escrita (`D-GA-1`); canal para a v4; decisão sobre 08/11/2026; aceite de QA da `rc1.8`; CSO Transportes. Nada tagueado nesta data; F7 continua valendo para as próximas publicações. |
| 2026-10-31 | **PDV Java v4 — prévia pública passa à candidata de 31/10 e as três superfícies são alinhadas:** release `v4.0.0-candidato-20261031` em `caracore-pdv-releases` como **pré-release** (não GA, não Latest), asset `CaraCore-PDV-4.0.0-qute-portable-windows-x64.zip`, 178.317.680 bytes, SHA-256 `0c2003b0f99a75328f7ebe632fc20b07cb5834a3f75b6f0e97ccfb7aef83434d`, sidecar `SHA256SUMS` de 116 bytes conferido; fonte `master` `c343890`, build 31/10/2026, Java 25.0.3 embutido, launcher `iniciar_pdv.bat`, `UPDATE_URL` = `https://api.caracore.com.br/releases/latest.json`. Suíte no CI run `41244424886` em `c343890`: 1.039 testes, 0 falhas, 3 ignorados, LINE 52,82% (5.385/10.195) contra piso de 50%. Sobre o pacote: T032 (16 passos) e a matriz M01–M11 foram medidos em `ff400efd`, **não nesta candidata**; SCA não medido (`D-SCA-1`); cenário "banco 3.2.12 migrado" bloqueado; cancelar venda paga na v4 não devolve estoque nem grava `ESTORNADA` (`D-S1`); sem MSI, unsigned. `v4.0.0-rc6` (11/10/2026, SHA `0c00b24b…780d5325`) e `v4.0.0-rc5` ficam no histórico; a RC7 é a rota aprovada do Gate E, ainda sem tag. Loja (`caracore-loja` Central e `caracore-pdv-releases` quando publicado), wiki (`caracore-wiki`) e matriz (`caracore-site`) alinhadas para a candidata, com o selo editorial **Beta (RC)/prévia pública candidata** mantido e o canal de atualização ainda servindo `v3.2.12-free` (a candidata é pré-release e o canal só serve Latest). |
| 2026-10-31 | **Hub `v2.1.0-rc1.8` publicada e loja, wiki e matriz alinhadas:** release `v2.1.0-rc1.8` em `caracore-hub-releases` com o único asset `CaraCore-Hub-2.1.0-rc1.8-windows-x64.zip`, 324.536.724 B, SHA-256 `3c4e61b2e192fece6667ccfbc79d735f3fad7ce8542e50c492b9ef24a9743334`, unsigned, sem instalador NSIS. A central (`api.caracore.com.br/releases/hub/latest.json`) serve a mesma versão e hash. Mudanças da build: versão alinhada no Maven/Electron, canal de atualização no launcher (`api.caracore.com.br/releases/hub/latest.json`, `UPDATE_URL` só HTTPS/localhost, token não logado), `/api/atualizacao` pública por correspondência exata e cliente tolerante a 200/204/503/erro de rede; `clean verify` 2.585 testes/0 falhas, E1–E6 PASS em `9874273`. A release está marcada como **Latest** no GitHub por autorização do responsável, o que não substitui o aceite formal; o rótulo editorial **Beta (RC)/pré-release** foi mantido. A rodada 5 reprovou a `rc1.7` (N1/N2 bloqueantes) e o aceite de QA da `rc1.8` segue pendente. GA instalador 06/04/2027. |
| 2026-10-30 | **Matriz: resíduo do host que não usamos removido e `Site validation` verde:** por decisão do dono, o arquivo de configuração do host saiu do repositório. As duas regras exatas de redirect que só existiam nele (retrô e wiki) foram para o `_redirects`; `build-static.cjs`, `preview-static.cjs` e `cdn-assets.test.cjs` deixaram de lê-lo, o preview local passou a servir os arquivos com `must-revalidate` sem emular cache/redirect e o filtro do workflow perdeu o caminho do arquivo. Saíram também `docs/CDN_VERCEL.md`, a condição de host em `secure/js/logger.js` e as menções em `AGENTS.md`, `DEPLOY_STATIC.md` e nos docs de roteamento. **INC-13 fechado:** stubs `/delivery/mkt/*` e `_redirects:89-91` apontam para a vitrine `mkt.caracore.com.br` (200 medido). **INC-14 fechado:** o passo 5 valida só o `_redirects`. Medido: `validate-delivery-stubs` 40 stubs/0 problemas, `validate-redirects-config` 0 problemas, `run-site-validation.ps1` de ponta a ponta com `EXITCODE=0` (passos 1–5) e `node scripts/build-static.cjs` com 8/8 testes. |
| 2026-10-27 | **Hub `v2.1.0-rc1.7` conferida ao vivo nas quatro camadas e validadores da matriz corrigidos:** a central (`download.caracore.com.br/download.html`) passou a mostrar tamanho e hash do EXE **274.162.562 B** e do ZIP **324.502.796 B** no cartão do Hub, e as páginas no ar (loja `hub.caracore.com.br/download.html`, central, wiki `projeto-hub.html` e matriz `ecosistema.html`) foram lidas de novo: todas em `v2.1.0-rc1.7`, sem `rc1.6` como versão vigente. A release no GitHub confirma `draft=false`, `prerelease=true` e seis assets com os tamanhos do manifesto. Correção de defeito real nos validadores: `scripts/validate-delivery-stubs.ps1` e `scripts/validate-redirects-config.ps1` esperavam `https://rust-pdv.caracore.com.br`, host que **não resolve** (HTTP `000` medido); o canónico é `pdv-rust.caracore.com.br` (`200`), como em `_redirects:49-51` e nos stubs. O `Site validation` do repo estava vermelho desde 06/10 por esse defeito **e** por dois itens de decisão do dono: `/delivery/mkt/*` (stubs e `_redirects`) aponta para a Sala enquanto o mapa e os validadores esperam a vitrine `mkt.caracore.com.br` (INC-13), e a cobrança do arquivo de configuração do host que não usamos (INC-14). Registrados em `docs/CORRECOES_COERENCIA_ECOSSISTEMA.md`; `validate-delivery-stubs`: 4 → 2 problemas. |
| 2026-10-27 | **Hub `v2.1.0-rc1.7` publicada como pré-release nas quatro camadas:** release `v2.1.0-rc1.7` em `caracore-hub-releases` marcada **Pre-release** (não Latest, não GA), unsigned, com instalador, ZIP, dois `.sha256` e dois manifestos — EXE 274.162.562 B `1563f1bd343b0044f9a64dd9bb7d3a1604761ee7f1e2354e8663b693cb310ba1`, ZIP 324.502.796 B `924af1960ccda606e4b3979ff36741f7e78228f8f77c396ccb985878b940b37e`; binários baixados de volta e conferidos. O que mudou: política única de senha (12 caracteres, máximo 72 bytes, temporária de 16 por `SecureRandom`) e **Auditoria e Logs com item no menu**. Gate medido no mesmo código: `npm run verify` PASS em `dist_hub/verify/20261027T150209Z` (commit `ce9007f`, `promotable=true`, `dirtyEntries=0`, 2.555 testes, 8 ignorados), WAR 69.448.885 B `73b9adf5…2023b0` igual nos dois caminhos do pacote, E2E 62/1/0 no instalador e 60/1/0 no ZIP. Loja, central, wiki e matriz alinhadas para `v2.1.0-rc1.7`. Segue **pré-release não homologada**: QA rodada 5, B7 e S6.9 abertos; GA 06/04/2027. |
| 2026-10-26 | **Matriz alinhada ao Hub `v2.1.0-rc1.6` nas fontes de dados em JS:** `assets/js/catalog-data.js` (versão, `detalhe` e `atualizadoEm`), `assets/js/planning-data.js` (4 textos + `AS_OF_LABEL` + `NOTE`), `assets/js/planning.js` (glossário), `planning.html` (fallback `pl-asof` e `?v=20261026`) e `portfolio.html` (data de conferência) ainda liam `v2.1.0-rc1.2` e a leitura de 15/10; o texto de `index.html`, `ecosistema.html` e `portfolio.html` já estava em `v2.1.0-rc1.6` e `v3.2.12-free`, e o desvio só aparecia nas tabelas renderizadas em runtime. Documentos internos corrigidos: `INICIAR_NOVA_TAREFA.md`, `VALIDACAO_LOJAS_MATRIZ.md`, `ECOSYSTEM_LOJAS.md`, `CORRECOES_COERENCIA_ECOSSISTEMA.md` (que ainda dava PDV `v3.2.8-free` como vigente), `AGENTS.md` e a regra Cursor. PDV segue `v3.2.12-free` (Latest) e `v4.0.0-rc6` (pré-release); Hub segue pré-release não homologada, GA 06/04/2027. |
| 2026-10-25 | **Hub `v2.1.0-rc1.6` publicada como pré-release (loja no ar):** release `v2.1.0-rc1.6` em `caracore-hub-releases` marcada **Pre-release** (não Latest), com EXE 274.160.424 B `05b87529112db79db67e50d1e708c1dc8568daf69c905f73bfb1abe7b4afc8c4`, ZIP 324.500.797 B `fe3400c7a3d4101452f95d2f26ca82b0c7bfe84d427dbfaa6659af17a17c9c0d`, dois `.sha256` e dois manifestos; binários baixados do release e conferidos por SHA-256 contra o manifesto. Loja `hub.caracore.com.br` (Pages em `docs/`, commit `b3dc257`) atualizada com as novidades: RBAC por perfil com `403` em JSON, auditoria de usuários persistida (`usuario_auditoria`, V18) e telas de demonstração removidas. Oficina empurrada até `ee66981`. Armadilha registrada: release interrompida fica em `draft` e os links respondem `404` até `gh release edit --draft=false`. Segue **pré-release não homologada**: QA rodada 5, B7 (smoke Linux x64) e S6.9 abertos; GA 06/04/2027. Central, matriz e wiki alinhadas para `v2.1.0-rc1.6` em commit local, sem push. |

| 2026-10-15 | **PDV Free 3.2.12 publicada estável/Latest por autorização explícita:** fonte `72ace488aed4ee91001c60cf40a3934ddfe8faf1`, branch `hotfix/3.2.12-free`; correções 405→500, distinção ESTORNADA/CANCELADA com V047 e fila em transação independente. Windows SHA-256 `6d7a50b0acf2a05620a090eebdd48f049a1dd5599ccb6c40c419c38145f7c0e2`; Linux/macOS `795a396318da61d1bd45dcfe816879d2184706f1c7849f1cd2ad98baa99fd9c1`. Cinco assets remotos conferidos. Publicação estável/Latest autorizada em 15/10/2026, com validações pendentes. 19/19 testes focados passaram em Java 25/H2; ZIPs e hashes remotos conferidos. Suíte completa, smoke portátil com SQLite/health/navegador, execução Linux/macOS e homologação operacional completa permanecem pendentes. Não transferir aceites da 3.2.8. Releases 3.2.8 e v4 RC6 preservadas. Alinhamento de loja, central, matriz, wiki e memórias preparado no checkout; verificar deploy antes de declarar sites atualizados no ar. Cópias de rollback sob `target/release-free-v3.2.8-64f564a` foram removidas pelo clean de 15/10; não presumir disponibilidade. |
| 2026-10-14 | **PDV Free 3.2.8 — artefatos republicados com gates pendentes, por autorização explícita:** reconstruídos ZIPs Windows/Linux/macOS e `SHA256SUMS.txt`/`RELEASE_MANIFEST.json` a partir do commit `64f564ae66f17560c8aeb5d63fccd6a3bf3ea942`; substituídos os cinco assets na release `caracore-pdv-releases/releases/tag/v3.2.8-free`, sem mover a tag. SHA Windows `e9aa2753e32c45ec939bb7a4483dd39223300570d8eeec898e58b55dc210ae4b`; Linux/macOS `a7a6ebd3463ade4b9a3febb2bb61c96319733ce40724df86ca1873f5aa055895`. Remotos conferidos contra os artefatos locais; CRC/estrutura passaram. Testes focados 19/19, porém suíte Maven completa e boot/health/navegador dos ZIPs seguem pendentes; não anunciar homologação completa. Backup/novos pacotes sob `caracore-pdv/target/release-free-v3.2.8-64f564a/`; manter para rollback/rastreabilidade. Branch `hotfix/3.2.8-free` enviada até `b46d921`; `installer-wix/v4-qute/` ficou fora dos commits. |
| 2026-10-14 | **Registro da publicação inicial de PDV Free 3.2.8 (hashes abaixo foram substituídos no registro imediatamente anterior):** workflow multiplataforma oficial concluído e tag `v3.2.8-free` indicada como Latest em `caracore-pdv-releases`. Hashes dos assets iniciais: Windows `caracore-pdv-v3.2.8-free-windows-x64.zip` — `ef0116c383ae35df8fff96866cf8a767665db3a555bf2873435e9e8f985e612e`; Linux `caracore-pdv-v3.2.8-free-linux-x64.zip` — `50c30fad7c13825c95beba55a281934b008cbf330490d981c09592eba7eb57a5`; macOS `caracore-pdv-v3.2.8-free-macos-x64.zip` — `1ade201a3c84b6f445f417c6cc8e4123096f1b1f8ed3702c70898af07d637476`. Loja, wiki e matriz alinhadas no checkout. Testes focados da publicação inicial: 57 (0 falhas/erros, 1 ignorado). Homologação manual completa no Edge/leitor físico não concluída; publicação autorizada pelo responsável com essa ressalva. Manutenção somente até 08/11/2026, sem novos recursos. A sucessão segue as RCs da v4 e depende de aprovação dos gates; 08/11 não é GA automático. Sem NF-e, NFC-e ou PIX integrado no Free; RC6 segue pré-release separada. |
| 2026-10-13 | **CaraCore Seed alinhado entre vitrine, Central, matriz e Wiki (checkout local, sem publicação):** candidato Windows 0.1.3 em homologação independente, sem download público; CTA de solicitação de convite não garante participação. Central lista o Seed como piloto filtrável sem binário/hash. Corrigidas as instruções de primeiro acesso e recuperação: `admin`/`admin`, senha nova de exatamente 8 caracteres com confirmação e chave; não apagar manualmente o arquivo de credenciais. Wiki atualizada com escopo funcional, stack Electron/Java 25/SQLite, limites locais e status do piloto. Linux fora da entrega. Homologação foi atribuída a outra IA; não distribuir antes do aceite. |
| 2026-10-13 | **CaraCore Seed — piloto público no modelo do PDV Rust:** publicada a release Windows x64 `0.1.3`, sem convite ou cadastro prévio. EXE unsigned, 218.924.034 bytes, SHA-256 `5adf48b1b8b14d79ff55fc7aecc1f38f7d4ee221848b68af3bae58e5a83626e8`; loja, Central, matriz e Wiki devem apontar para o instalador/checksum. É candidato para avaliação, não homologado nem pronto para produção; instalação/uso em perfil limpo e regressões manuais seguem pendentes. Linux fora desta entrega; app local em SQLite, sem monitoramento remoto de heartbeats.**
| 2026-10-13 | **CaraCore Seed 0.1.4 publicada:** instalador Windows x64 unsigned, 216.458.520 bytes, SHA-256 `a01da8dbad7fdee2e9e59b1a99ed1be45b3f2e1d007d559cf289c6a606a30c2a`. Substitui a 0.1.3 e protege a API local com sessão ADMIN/CSRF e token por licença; porta local dinâmica e recursos web incluídos. Loja, Central, matriz e Wiki atualizadas. Ao atualizar, preservar SQLite e chaves; licenças antigas podem exigir emissão/rotação do token de API. Homologação independente e regressões manuais completas pendentes; não pronto para produção. |
| 2026-10-13 | **CaraCore Seed 0.1.5 publicada como pré-release candidata:** instalador Windows x64 unsigned, 216.466.586 bytes, SHA-256 `e449ca2cee74fda135ac098d2333fe674c2c476773a7d4adb60bc016a767db16`. A release estável anterior é a 0.1.4. Atualiza heartbeat para UTC do servidor, mantém diagnóstico de desvio de relógio, informa status de licença revogada/expirada com token válido, valida Host em todas as rotas, renova CSRF e expõe o payload RSA assinado. Migração V8 aditiva preserva bancos 0.1.3/0.1.4 e chaves; Swagger UI/OpenAPI locais sem CDN. Atualizar vitrine Seed, Central de Downloads e matriz para apresentar o Seed como complemento local do ecossistema Cara Core, sem centralizar os bancos dos outros produtos. Homologação independente pendente; não declarar pronto para produção. |
| 2026-10-13 | **CaraCore Seed 0.1.5 publicada como pré-release candidata:** instalador Windows x64 unsigned, 216.466.586 bytes, SHA-256 `e449ca2cee74fda135ac098d2333fe674c2c476773a7d4adb60bc016a767db16`. A release estável anterior é a 0.1.4. Atualiza heartbeat para UTC do servidor, mantém diagnóstico de desvio de relógio, informa status de licença revogada/expirada com token válido, valida Host em todas as rotas, renova CSRF e expõe o payload RSA assinado. Migração V8 aditiva preserva bancos 0.1.3/0.1.4 e chaves; Swagger UI/OpenAPI locais sem CDN. Atualizar vitrine Seed, Central de Downloads e matriz para apresentar o Seed como complemento local do ecossistema Cara Core, sem centralizar os bancos dos outros produtos. Homologação independente pendente; não declarar pronto para produção. |
| 2026-10-13 | **BioReator 4.0 Community 1.1.1 publicada e loja RU ampliada.** Release `bioreator-1.1.1` oferece MSI e ZIP Windows x64, sem assinatura. Matriz alinhada à biomassa viável/total, cálculo de P/V pelo volume líquido e registro do primeiro critério de término em `end_reason`; inclui links para o manual técnico/critério de fim, fundamentos e exemplo de batelada. A 1.1.0 permanece no histórico. |
| 2026-10-12 | **BioReator 4.0 Community 1.1.0 publicada.** Release `bioreator-1.1.0` oferece MSI e ZIP portátil para Windows x64, sem assinatura digital. Loja RU, Central de Downloads, matriz e Wiki alinhadas; 1.0.0 permanece como versão histórica. |
| 2026-10-11 | **Memória do PDV v4 alinhada ao ZIP publicado.** Status da oficina, handoff, `AGENTS.md` e esta memória apontam SHA-256 `0c00b24b33b3c365fd1f24ec173bfa4e35bedf1946b2df4151035250780d5325`. Fonte: `master` `681ea32`. A tag Git `v4.0.0-rc6` permanece em `b3358fe`. |
| 2026-10-11 | **PDV v4 — ZIP da tag `v4.0.0-rc6` substituído de novo.** 178.166.244 bytes, SHA-256 `0c00b24b33b3c365fd1f24ec173bfa4e35bedf1946b2df4151035250780d5325`. O arquivo anterior desta tag (`847f0cfe…`, 178.165.533 bytes) saiu. Neste pacote foram vistos menu, uma venda, recibo e saída da sessão. Não é GA nem Latest. Naquele momento, `v3.2.7-free` permanecia Latest e 08/11 era avaliado como data de corte v4; atualização de 14/10 substituiu esse marco pela data de encerramento da Free 3.2.8 e pelo ciclo de RCs. |
| 2026-10-11 | **PDV v4 — ZIP da tag `v4.0.0-rc6` substituído.** 178.165.533 bytes, SHA-256 `847f0cfec022b33e0d4c1c7d608cc0772ab1c46064004a093037dd7a29dc840f`. Java 25 em `runtime\`, sem JDK e sem Python do sistema. O ZIP de 10/10 (`a2ec0d80…`) saiu da tag. Não é GA nem Latest. Naquele momento `v3.2.7-free` permanecia Latest e a data 08/11 era reavaliada como corte v4; desde 14/10, a última 3.2.x é `v3.2.8-free` e 08/11 encerra sua manutenção. A frente de caixa daquele arquivo cobria o menu. |
| 2026-10-11 | **Planning: glossário da v4 e nota do BioReator.** O verbete de `v4.0.0-rc6` passa a dizer pré-release pública com SHA-256 publicado; a `v4.0.0-rc5` fica no histórico. O verbete `v2.0.0-RC1` sai e entra `v2.0.2-free`. A nota da grelha deixa de dizer que o BioReator está fora: a torre 10 permanece, Community 1.0.0 publicada, percentual em 12%. Premium em 18/06/2027, sem preço e sem PIX. |
| 2026-10-10 | **Wiki alinhada ao BioReator 4.0.** A ficha, a visão geral, o glossário, a trilha e o mapa da wiki prometem um produto: Community 1.0.0 agora, Premium em 18/06/2027, sem preço e sem PIX. |
| 2026-10-10 | **Portfólio e ecossistema passam a um produto.** O cartão do RU Soberano sai. A vitrine pública é o BioReator 4.0: Community 1.0.0 na loja, Premium em 18/06/2027, sem preço e sem PIX. |
| 2026-10-10 | **Planning alinhado ao BioReator.** A torre 10 passa a ler BioReator 4.0: Community 1.0.0 na loja, Premium em 18/06/2027, sem preço e sem PIX. O percentual permanece 12%. Sem torre nova e sem mês de Agent. |
| 2026-10-10 | **A loja do BioReator não publica página .txt.** Os hashes ficam em `download.html#bioreator40`. O arquivo `artifacts/bioreator-1.0.0.txt` sai do site. |
| 2026-10-10 | **A loja do RU promete um produto.** BioReator 4.0 Community 1.0.0 é a edição que se baixa. A Premium do mesmo produto fica em 18/06/2027, sem preço, sem PIX e sem arquivo. A data deixa de ser um segundo produto. |
| 2026-10-10 | **Download público do BioReator 4.0 Community 1.0.0.** Release `bioreator-1.0.0` em `caracore-ru-releases`: MSI 72.658.944 bytes, SHA-256 `8efc60902c5ba6c37096401f02ba180b545f4dce754247e4a51ea1e96905995e`; ZIP portátil 73.594.305 bytes, SHA-256 `49e83e5361b77ca8bc1bd854e6acaf77ce50404380b5d84229e15816dad5405a`. O EXE de 524.800 bytes fica dentro do ZIP. Sem assinatura digital. A Pro segue sem preço e sem data. O RU Soberano segue em 18/06/2027. |
| 2026-10-10 | **Página do BioReator 4.0 na loja do RU.** `bioreator.html` abre pela fermentação no computador, depois explica a batelada e só então as edições. Community 1.0.0 continua a edição atual. EXE e MSI seguem na oficina. A Pro segue sem preço, sem PIX e sem data. O RU Soberano segue com lançamento em 18/06/2027. |
| 2026-10-10 | **Coerência do vocabulário.** A Community 1.0.0 do BioReator sai da lista de futuros lançamentos na matriz, na loja do RU, na wiki e nas memórias. O planning passa a ler 10/10/2026: pré-release pública do PDV é a `v4.0.0-rc6`, com SHA publicado; estável continua `v3.2.7-free`; T032 aberto. Percentuais das 11 torres não mudam. A Pro do BioReator continua sem data e fora da cota de outubro. |
| 2026-10-10 | **BioReator 4.0 Community 1.0.0 sai do planejamento.** A edição atual entra em “Já publicado” no roadmap da central e no filtro estável de download.caracore.com.br. A Pro segue sem preço, sem PIX e sem data. O EXE e o MSI continuam na oficina. O marco de 18/06/2027 continua o do RU Soberano. |
| 2026-10-10 | **BioReator 4.0 ganha exemplo e cinética.** Loja `exemplo-bioreator.html`: carga de referência Community, 100 L, *Bradyrhizobium*, leitura de X, S e oxigênio. Wiki `bioreator-tecnico.html`: as mesmas contas, o catálogo calibrado e o contraste de 6 h em batelada alimentada na Pro. Números do simulador 1.0.0, não medição de planta. |
| 2026-10-10 | **BioReator 4.0 1.0.0 no inventário.** Pacote Community de oficina: EXE `BioReator40.exe` (524.800 bytes, SHA-256 `378efe2eb3fd32e4fb5aa167d860ca86df11d45f9b31af53c0d5e65470611c38`) e MSI `BioReator40-1.0.0.msi` (72.658.944 bytes, SHA-256 `8efc60902c5ba6c37096401f02ba180b545f4dce754247e4a51ea1e96905995e`). Windows x64, JDK 25, sem assinatura. `publicDownload: false`. Inventário em `caracore-ru-releases/docs/artifacts/bioreator-1.0.0.txt`. Central, matriz, wiki e memórias citam a versão. A 1.0.0 do RU Soberano continua a outra linha, com marco 18/06/2027. Checkout, sem publicação. |
| 2026-10-10 | **BioReator 4.0 entra no mapa como brinco.** Oficina `caracore-ru`. Loja no subdomínio `https://ru.caracore.com.br/`, com as edições em `download.html#bioreator40` e sem arquivo. Community no pacote local; Pro sem preço e sem PIX. A data de 18/06/2027 continua a do RU Soberano. Cota de outubro permanece no PDV v4. Matriz, wiki e memórias alinhadas no checkout, sem publicação. |
| 2026-10-10 | **Fonte da PDV v4 `v4.0.0-rc6` no `master`:** oficina `caracore-pdv`, commit `b3358fe`, tag `v4.0.0-rc6`. O ZIP público permanece o já publicado (113.889.451 bytes, SHA-256 `a2ec0d8019e8f492369aaf6aa2de40b96904b72e87193d5933c212f4c4adf892`). Latest continua `v3.2.7-free`. Ciclo manual completo do roteiro ainda pendente. |
| 2026-10-10 | **PDV v4 `v4.0.0-rc6` publicada:** ZIP `CaraCore-PDV-4.0.0-rc6-qute-portable-windows-x64.zip`, 113.889.451 bytes, SHA-256 `a2ec0d8019e8f492369aaf6aa2de40b96904b72e87193d5933c212f4c4adf892`. Pré-release, não Latest. Estável continua `v3.2.7-free`. A `v4.0.0-rc5` fica no histórico. Ciclo manual completo do roteiro ainda pendente. Sem NF-e, NFC-e nem PIX integrado. |
| 2026-10-10 | **MKT e Helianto de volta ao mapa de lojas:** CNAMEs `mkt.caracore.com.br` e `helianto.caracore.com.br` → `chmulato.github.io` (consulta 8.8.8.8 em 10/10). Memória: `MEMORIA_INFRAESTRUTURA_CARACORE.txt`. MKT: vitrine gratuita em `caracore-mkt-releases`; Sala continua em `tools.caracore.com.br/sala/`; não vendemos. Helianto: vitrine em `caracore-helianto-releases`; GA 30/12/2029. Os dois continuam brincos. A remoção de 06/10 fica no histórico. |
| 2026-10-09 | **Planning — leitura de 09/10:** a grelha passa a dizer que a oficina do PDV Java está em `v4.0.0-rc6` (SHA-256 a publicar) e que o download público continua `v4.0.0-rc5`, com estável `v3.2.7-free` e T032 aberto. O CSO deixa o aviso de deploy de responsividade: Frotas em produção desde 06/10, freeze M1 em 08/11/2026, Transportes em 08/11/2028. Hub permanece atenção, pré-release `v2.1.0-rc1.2`. Percentuais inalterados. A página mostra as 11 torres; média, flags, critérios e a faixa do Hub saem da primeira vista. Envelope, cota, cronograma e histórico ficam recolhidos. Checkout local, sem deploy. |
| 2026-10-09 | **Blog — O Efeito Borboleta do Dinheiro:** trilogia local em `caracore-personal` (chamada e Partes 1–3, 10/13/18-10-2026). Acervo em 268 HTML. Assinatura do cartão: Cidadão Global. Navegação entre partes vizinhas no corpo; rodapé só com o início do blog. Home, ciclo ativo, feed e sitemap alinhados no checkout. Sem commit e sem deploy. A contagem 264 do INC-08 fica no histórico. |
| 2026-10-09 | **Host da matriz:** GitHub Pages. INC-10 fechado com a medição de 09/10: WebP do logo branco no ar (117.882 bytes), `Cache-Control: max-age=600`, 404 sem redirect automático. |
| 2026-10-09 | **Coerência INC-09 e INC-11:** a copy da frota está no ar em `ecosistema.html`, `wiki.caracore.com.br/projeto-cso.html` e `cso-transp.caracore.com.br`. A home, o ecossistema e o portfólio oferecem Reino OIDC `v2.0.2-free`. **INC-10 permanece aberto:** o host público é GitHub Pages, com `Cache-Control: max-age=600`; o WebP do logo branco está no ar (117.882 bytes) e o 404 não redireciona sozinho. |
| 2026-10-09 | **Coerência INC-07:** `planning-data.js` passa o Reino OIDC para a Edição Free `v2.0.2-free`, com `v2.0.1-free` e `v2.0.0` no histórico, e o Circuito Ferradura para `v2.0.24` na loja, com `v2.0.23` no histórico. Checkout local, sem deploy. |
| 2026-10-09 | **Coerência INC-08:** contagem de HTML em 09/10. Retrô: 139 ficheiros em `docs/articles`, números 1 a 139. Blog: 264 ficheiros em `docs/articles`. Esse par ficou vigente nos dois `AGENTS.md`, em `INDEX.md`, em `ECOSYSTEM_CARA_CORE.md` e na regra Cursor da matriz. Linhas antigas do changelog permanecem. |
| 2026-10-09 | **Coerência INC-05 e INC-06:** `ECOSYSTEM_LOJAS.md` passa o Ink para Desktop `v2.0.1` e o Hub para a pré-release Windows `v2.1.0-rc1.2` (instalador e ZIP, unsigned; GA 06/04/2027). O bloco Marco v4 de 04/10 fica como snapshot: a RC4 era a pré-release daquele dia, com o SHA-256 conservado. O estado vigente permanece no topo deste ficheiro. |
| 2026-10-09 | **Coerência INC-03 e INC-04:** `VALIDACAO_LOJAS_MATRIZ.md` passa a Ink `v2.0.1`, OIDC `v2.0.2-free`, Hub pré-release `v2.1.0-rc1.2` (GA 06/04/2027) e CSO com Frotas em produção e loja `cso-transp`. `ECOSYSTEM_CARA_CORE.md` passa o PDV para download público `v4.0.0-rc5` e `v4.0.0-rc6` em preparação. CSO vigente `b90d1dc`, Flyway V33, FRO 24/24 desde 06/10; `e193d6d` fica como commit anterior de COE. Contagens de artigos permanecem no INC-08. |
| 2026-10-09 | **Coerência INC-01 e INC-02:** a linha da Loja PDV nos dois `AGENTS.md` deixa de chamar a RC4 de pré-release vigente e passa a registrar a pré-release pública `v4.0.0-rc5` (roteiro formal pendente) e a `v4.0.0-rc6` em preparação. No `portfolio.html`, selo, rodapé, comentário e linha do tempo do Ink passam a `v2.0.1` · 07/10/2026; `v2.0.0` de 26/06/2026 fica só no parágrafo histórico do card. Checkout local, sem deploy. |
| 2026-10-09 | **PDV alinhado na oferta pública:** estável `v3.2.7-free`. Pré-release publicada `v4.0.0-rc5`. A `v4.0.0-rc6` fica em preparação, SHA-256 a publicar, sem arquivo no GitHub. O roteiro público mantém o registro da RC5 com o ciclo manual pendente e separa a RC6. A wiki fiscal deixa de chamar o Free de 3.2.6. Sem NF-e, NFC-e nem PIX integrado. |
| 2026-10-09 | **PDV v4 `v4.0.0-rc6` na oficina:** correções do QA de usabilidade e homologação do rc5. Venda finalizada imutável, uma venda aberta, pós-login no caixa, pagamento pelo teclado, desconto em reais, auditoria com o operador real, rotas Premium do Free em 403. O ZIP da RC6 não entrou no GitHub Releases. SHA-256 a publicar. A oferta pública permanece a `v4.0.0-rc5`. O download público da pré-release continua `v4.0.0-rc5`. Free estável `v3.2.7-free`. Sem NF-e, NFC-e nem PIX integrado. `PERF-001–007` congeladas. |
| 2026-10-08 | **Registo de coerência:** inconsistências de texto e publicações por confirmar ficaram em `docs/CORRECOES_COERENCIA_ECOSSISTEMA.md` (INC-01 a INC-11). Nenhuma correção desse registo foi aplicada neste lançamento. |
| 2026-10-08 | **Reino OIDC Free `v2.0.2-free`:** release https://github.com/chmulato/caracore-oidc-releases/releases/tag/v2.0.2-free. EXE `ReinoOIDC-2.0.2-free.exe` (17.861.640 bytes), SHA-256 `d5c6121e921dedab678b056129653870ebb6fbfa28a75b12074f3d4fbc131bcc`, MD5 `df0b506ef766bed54b5e80f590f0024e`. Sem certificado digital. As três Eras seguem gratuitas para estudo pessoal. A edição paga está em desenvolvimento e não entra nesta versão. CTA **Baixar Free (2.0.2)**. A loja não combina PIX nesta etapa. A página de download oferece só `v2.0.2-free`. `v2.0.1-free` e `v2.0.0` ficam no histórico; os assets não foram despublicados. A nota da tag `v2.0.0` passou a indicar a substituição. Loja OIDC publicada. Central de downloads e wiki alinhadas. Matriz alinhada no checkout, sem deploy. Oficina privada commitada localmente e não enviada ao remoto. |
| 2026-10-08 | **Circuito Ferradura — `v2.0.24` na loja, na release, na matriz e na central:** download em https://circuito.caracore.com.br/download.html e https://github.com/chmulato/caracore-circuito-releases/releases/tag/v2.0.24. EXE SHA-256 `eca7027c08d062f1fcbfb529092db53e5f30a3766d286ec448089c2f8734aa12`. Windows ZIP `dea72267c5700b1831d176729d57dee539900bdcfafccaac10b9c5f0bf2c01dc`. macOS ZIP `ff6deb284029f4ad333575f6e4d9f0509d7481cfcb47b3c43dbc2f0020833951`. HTML ZIP `7cf46b92c97652339c860bb29308a075057db19d570e57422a76a5bc47d986d6`. O executável é só Windows e não tem assinatura digital. `v2.0.23` fica no histórico. |
| 2026-10-08 | **Circuito Ferradura — `v2.0.23` na loja, na release, na matriz e na central:** download em https://circuito.caracore.com.br/download.html e https://github.com/chmulato/caracore-circuito-releases/releases/tag/v2.0.23. EXE SHA-256 `12df7a9d7d0984f78612b710418d0c76686796e011748001278a399d2ce9e68d`. Windows ZIP `d61d1953ff8193d29859a2c923bac26d91ec9d2fc72b2f6d9fd546cc3ff198d5`. macOS ZIP `989d1b5fe3cfa775e9407ed934c0a292cc705a41a84d38b38349d8158863dc9d`. HTML ZIP `d4c312dcfac8a2289566dda3931681bfedb0331282b44fdd8c457b38475d8d5c`. O executável é só Windows e não tem assinatura digital. `v2.0.0` fica no histórico. |
| 2026-10-08 | **Reino OIDC Free `v2.0.1-free`:** release https://github.com/chmulato/caracore-oidc-releases/releases/tag/v2.0.1-free. EXE `ReinoOIDC-v2.exe` (18.157.874 bytes), SHA-256 `067352c7201f2e3478d11abcf3a87f212fad6dc1c02768ccebd6ad78de2992b5`. Sem certificado digital e sem chave de ativação. As três Eras seguem gratuitas para estudo pessoal. A edição paga não entra nesta versão. CTA **Baixar Free (2.0.1)**. A edição paga está em desenvolvimento; a loja não combina PIX nesta etapa. Aviso pelo WhatsApp (`+55 41 9 9909-7797`), sem pagamento. A página de download oferece só `v2.0.1-free`. `v2.0.0` fica no histórico e o asset não foi despublicado. Loja OIDC `1143250`. Matriz, wiki e central de downloads alinhadas no checkout. Oficina privada não enviada ao remoto. |
| 2026-10-07 | **Reino OIDC Free `v2.0.0` — GA publicado:** release estável em https://github.com/chmulato/caracore-oidc-releases/releases/tag/v2.0.0, com EXE, checksums e guia; SHA-256 `af0a5bd3bf4f8f6586de6e32a29b7ba750985788e8cca768f87ecf74fd59952d`. Oferta coerente: três Eras e progressão narrativa gratuitas para estudo pessoal; R$ 29,90 (valor único) apenas para decks adicionais de Mineração de Chaves; sem certificação, consultoria ou suporte técnico. Matriz, loja e memórias sincronizadas; conferir push/deploy antes de afirmar que a loja está publicada. |
| 2026-10-07 | **Ink Desktop — suporte até a 3.0:** decisão do dono: o Desktop Windows continua com suporte e correções 2.0.x (achados de QA, sem funcionalidade nova) até o S9 do PWA. A 3.0 em PWA segue como substituta, não antes de 2028; o download do Desktop só sai da loja depois da importação dos dados. `PLANO_PWA.md`, `caracore-ink/AGENTS.md`, `pwa.html`, wiki `projeto-ink.html` e `ECOSYSTEM_CARA_CORE.md` atualizados. Central de downloads (`caracore-loja`, `download.caracore.com.br`) aponta o card do Ink para a v2.0.1 (links e SHA256). |
| 2026-10-07 | **Ink Desktop 2.0.1 — publicada** (tag `v2.0.1` em `caracore-ink-releases`, a pedido do dono “subir as novas”; RC1–RC8 marcadas como superadas e corpo da v2.0.0 corrigido): testes 588 + 8 unitários, 58 TestFX e cobertura JaCoCo aprovados. Jar ofuscado com ProGuard (a 2.0.0 publicada saiu sem ofuscação); regras corrigidas: pré-verificação ligada e otimização desligada, classe de entrada, `@FXML`, constantes de enum usadas em anotações, diretório `db/migration` para o Flyway. Smoke do ZIP extraído: abre sem JDK, cria `agenda.db` e log, passos 1 e 2 do primeiro acesso renderizados. Setup `AgendaInk-2.0.1-windows-setup.exe` SHA256 `49bdd76a10ab97b7902e47b8c393c638ef90ea6b490874224a9734a802f90a6b`; ZIP `AgendaInk-2.0.1-windows.zip` SHA256 `3118eac8fafdfa5cc4d3e341969d0cd205d5a29caabbe069e12d7b956a994ff3`. Release `https://github.com/chmulato/caracore-ink-releases/releases/tag/v2.0.1`; loja, wiki e matriz publicadas. Checklist de telas do build ofuscado em `caracore-ink/docs/RELEASE_2.0.1.md`. |
| 2026-10-07 | **Exceção de cota — Ink Desktop 2.0.1:** o dono abriu Agent para o patch 2.0.1 (achados do QA da 2.0.0) dentro da janela do PDV v4. Registado como R13 em `RISCOS_ECOSSISTEMA.md`. Escopo: importação idempotente, pt-BR no runtime, build sem demo, sessão com duração/valor, painel com faturamento/médias, check de pagamento, tela de clientes, criar orçamento, `.inkbak` criptografado, P2 de textos/PDF/log. Build e SHA locais; publicação só com aprovação. |
| 2026-10-07 | **Ink Agenda 3.0 = PWA:** a 3.0 é nova aplicação de lançamento em PWA, sobre o `ink-core` extraído da v2.0.0 (mesmas regras). Substitui o Desktop Windows v2.0.0: o download só sai da loja no S9, depois da importação dos dados da v2 (H4 fechada como obrigatória) e de aviso com data; tag `v2.0.0` fica como histórico. Plano `caracore-ink/docs/PLANO_PWA.md` passa a S0–S9. Copy da loja (`pwa.html`, `index.html`, `tecnologia.html`) no checkout, sem push. Calendário intacto: não antes de 2028. |
| 2026-10-07 | **Ink Agenda PWA — arquitetura de dados:** web, Android, Mac e iPhone saem de um único PWA (`ink-web`). Servidor na nuvem com HTTPS e **um SQLite por estúdio** (mesmo schema/Flyway do Desktop). PWA precisa de internet; Desktop Windows v2.0.0 segue offline com base local, sem sincronização no GA. Copy na loja (`pwa.html`, `tecnologia.html`) no checkout, sem push. Calendário intacto: Tab; Agent não antes de 2028. Canónico `caracore-ink/docs/PLANO_PWA.md` (H2–H5 abertas antes do S3). |
| 2026-10-07 | **PDV Java Free v3.2.7-free publicado:** estoque na venda, turno com X/Z, saldo em dinheiro pelo valor da venda, recibo offline com itens e PDF, OpenAPI fechado, escuta em `127.0.0.1`, logs em `%APPDATA%\caracore\logs`. Sem NF-e, NFC-e nem PIX integrado. Limite de 100 vendas/mês permanece. ZIP `caracore-pdv-v3.2.7-free-free-{windows,linux,macos}-x64.zip`. SHA256 Windows `37110b7c07a045942bd89628fd473e649c7b57756707ce8a71908a1ec4c03c89` · Linux `bc8b67462a4505ad54e2d0afe18982321536101fb66f9e2c06c91bd3f7a63df7` · macOS `c0ffcf3992327df0dd31e5e2e2fc8173f3e1bf32c97178355e22994fa56b630a`. Tag `v3.2.7-free` / ramo `hotfix/3.2.7-free`. Pré-release v4 atual = `v4.0.0-rc5`. Histórico: `v3.2.6-free`. |
| 2026-10-06 | **Versões Java:** mapa canónico em `D:\onedrive\dev\APPS_JAVA_VERSION.md`, apontado em `AGENTS.md` (raiz e cópia da matriz), `.cursor/rules/ecosystem-cara-core.mdc`, `.github/copilot-instructions.md` e `GEMINI.md`. PDV Free e v4 = 25; CSO Frotas = 21; CSO Transportes, Hub, Ink, Helianto e RU = 25; Seed = release 17. |
| 2026-10-06 | **Memória para outras IAs:** CSO FRO 24/24 em produção (V33, index `e1e8d63`). PDV v4 permanece pré-release `v4.0.0-rc4` (T032 aberto, `PERF-001–007` congeladas). Hub permanece pré-release Windows `v2.1.0-rc1.1`. A copy da matriz, da wiki e da loja `cso-transp` foi alinhada no checkout e ainda não foi publicada. A aplicação `cso.caracore.com.br` já descreve a frota desta versão. |
| 2026-10-06 | **CSO — FRO-5 local:** `/relatorios/cpk` calcula combustível mais manutenção dividido pelos quilômetros do mês. Sem quilômetro, não há divisão. A landing local marca a frota como disponível. Produção continua na página anterior. V31–V33 sem deploy. Foco: `CpkCalculoTest`, página `/relatorios/cpk` e smoke pack `frota`. Suíte 362/362 não reexecutada. Epic 24/24 no código. MON-0 não iniciado. |
| 2026-10-06 | **CSO — FRO-4.4 local:** infração de outro tenant não grava; ponto zero grava e ponto negativo não grava. A viagem inicia com exame toxicológico vencido. V31–V33 sem deploy. Foco: `InfracaoServiceTest`, `ViagemServiceTest` e `DtoValidatorTest`. Suíte 362/362 não reexecutada. FRO-4 fechado no código. Próximo ID: FRO-5.1. |
| 2026-10-06 | **CSO — FRO-4.3 local:** | o gestor registra infração no cadastro do motorista e vê o exame toxicológico vencido em `/relatorios/condutor`. A CNH permanece só com a habilitação. V31–V33 sem deploy. Foco: `InfracaoServiceTest` e `MotoristasWebIntegrationTest`. Suíte 362/362 não reexecutada. Próximo ID: FRO-4.4. |
| 2026-10-06 | **CSO — FRO-4.2 local:** | `tb_infracao` no arquivo V33 (motorista obrigatório, veículo opcional, valor e pontos opcionais). Sem integração DETRAN. V31–V33 sem deploy. Foco: `V33InfracaoMigrationTest`. Suíte 362/362 não reexecutada. Próximo ID: FRO-4.3. |
| 2026-10-06 | **CSO — FRO-4.1 local:** | o cadastro de motorista grava a validade do exame toxicológico. Data vazia fica sem cadastro. V33 fica no código; V31–V33 sem deploy. A viagem não consulta esse campo. Foco: `MotoristaServiceTest` e `MotoristasWebIntegrationTest`. Suíte 362/362 não reexecutada. Próximo ID: FRO-4.2. |
| 2026-10-06 | **CSO — FRO-3 local:** cadastro `/pneus`, alerta operacional (sulco abaixo de 3,0 mm ou km desde a instalação no limite) e filtro com atalho em veículos e manutenções. V32 fica no código; V31 e V32 sem deploy. Foco: `PneuAlertaTest`, `PneuServiceTest` e `PneusWebIntegrationTest`. Suíte 362/362 não reexecutada. Próximo ID: FRO-4.1. |
| 2026-10-06 | **CSO — FRO-2.4 local:** o dashboard conta documentos vencidos no carregamento da página e a lista de veículos aponta `/relatorios/documentos`. V31 continua sem deploy. FRO-2 fechado no código. Próximo ID: FRO-3.1. |
| 2026-10-06 | **CSO — FRO-2.3 local:** `/relatorios/documentos` classifica vencido, a vencer em N dias, regular e sem cadastro. O título da coluna segue o país do documento. V31 continua sem deploy. Próximo ID: FRO-2.4. |
| 2026-10-06 | **CSO — FRO-2.2 local:** | o form `/veiculos` grava vencimentos, apólice e combustível. O rótulo segue o país do documento. V31 continua sem deploy. Próximo ID: FRO-2.3. |
| 2026-10-06 | **CSO — CSS de produção e FRO-2.1 local:** `/`, `/q/health` e `/login` responderam 200; `/login` serve `cso.css?v=20261003b`. Schema Flyway efetivo continua não confirmado. Arquivo `V31__documentos_veiculo_fro.sql` (vencimentos genéricos do veículo) está na oficina e ainda não foi publicado. Próximo ID: FRO-2.2. |
| 2026-10-06 | **MKT e Helianto fora do mapa de lojas:** CNAMEs `mkt.caracore.com.br` e `helianto.caracore.com.br` removidos no Registro.br (limite de 40 registros). Memória: `MEMORIA_INFRAESTRUTURA_CARACORE.txt`. MKT permanece na Sala `tools.caracore.com.br/sala/`. Helianto permanece oficina, GA 30/12/2029, sem subdomínio. Matriz, `AGENTS.md` e mapa de lojas deixam de apontar esses hostnames como vitrine. |
| 2026-10-08 | **Roadmap alinhado às novidades:** a linha do tempo pública lê Hub `v2.1.0-rc1.2` com SQLite local e GA em 06/04/2027, PDV estável `v3.2.7-free`, Ink Desktop `v2.0.1` e FRO publicado em 06/10. A leitura do planning passa a 08/10/2026. |
| 2026-10-08 | **Memória das IAs — banco do Hub:** retomada da oficina, da loja, do Gemini e do Copilot registra SQLite local (WAL) como banco do Hub. Java 25, Jakarta EE 10, Tomcat 10.1. |
| 2026-10-08 | **Hub — banco local em SQLite:** o discurso público (portfólio, ecossistema, loja, wiki e memória) descreve o banco do Hub como SQLite local no computador do cliente. Java 25, Jakarta EE 10 e Tomcat 10.1. PostgreSQL e Docker saem da stack pública do Hub. |
| 2026-10-08 | **Coerência do planning e da memória:** o planning público passa a ler PDV estável `v3.2.7-free` e pré-release `v4.0.0-rc5`. O FRO 24/24 permanece publicado em 06/10; a janela 08/04–dez/2027 não reabre o epic. A home da loja do Hub marca a RC Windows `v2.1.0-rc1.2` e reserva 06/04/2027 para o GA. |
| 2026-10-08 | **Hub — wiki alinhada a `v2.1.0-rc1.2`:** `projeto-hub.html`, o manual `docs/hub/` e as trilhas passam a descrever a pré-release Windows para avaliação. O GA do instalador permanece 06/04/2027. |
| 2026-10-08 | **Hub — memória para outras IAs:** o download vigente é `v2.1.0-rc1.2` na loja, na matriz e na central. A próxima pré-release nasce numa tag nova, com árvore limpa e manifesto fiel. As tags anteriores permanecem. Não é GA. |
| 2026-10-08 | **Hub — matriz e central de downloads em `v2.1.0-rc1.2`:** ecossistema, portfólio e planning de `www.caracore.com.br`, e o cartão da central `download.caracore.com.br`, passam a oferecer a mesma pré-release Windows da loja do Hub. Instalador SHA-256 `50d38ff0ee4defce5bb2598967331d0295fb4817dbec59df5d3e7574b22975e5`. ZIP SHA-256 `ec82b2bd57053c252faac4fdbb0066e9a5cea2df293562b35384107e5cb624b4`. As tags anteriores permanecem. Não é GA. |
| 2026-10-08 | **Hub — download da loja em `v2.1.0-rc1.2`:** instalador SHA-256 `50d38ff0ee4defce5bb2598967331d0295fb4817dbec59df5d3e7574b22975e5` (281.529.680 bytes) e ZIP SHA-256 `ec82b2bd57053c252faac4fdbb0066e9a5cea2df293562b35384107e5cb624b4` (333.342.883 bytes). FileVersion `2.1.0-rc1.2`. Manifesto do commit `463a854`, árvore limpa. As tags `v2.1.0-rc1.1` e `v2.1.0-rc1` permanecem. Não é GA. O aceite da QA desta build ainda não foi feito. |
| 2026-10-06 | **Hub — matriz, portfólio, planning e wiki alinhados a `v2.1.0-rc1.1`:** o download público deixa de apontar a tag `v2.1.0-rc1`. A pré-release continua sem assinatura, com instalador e ZIP. GA 06/04/2027 inalterado. |
| 2026-10-06 | **Hub — download da loja em `v2.1.0-rc1.1`:** instalador SHA-256 `841c0ce2da6796bd25b3f958d5ec366ee7ef5758dbf7439d1f44b55617206d3c` (281.521.557 bytes) e ZIP SHA-256 `1b942bbe04dac9d32622f117d6542100c242e0fbb4561238ec4371f436de5058` (333.338.656 bytes). A tag `v2.1.0-rc1` conserva o instalador de 05/10. Não é GA. |
| 2026-10-05 | **Hub — status vigente separado da suíte 9/9:** o download da tag `v2.1.0-rc1` é o instalador com log (SHA-256 `86f010a3…`). A suíte 9/9 fica no asset anterior `f59b959d…`. A home da loja passa a descrever a pré-release como disponível para avaliação; o GA permanece 06/04/2027. |
| 2026-10-05 | **Hub — asset da tag `v2.1.0-rc1` substituído:** o download Windows passa a ser o NSIS com log de instalação, 285.745.501 bytes, SHA-256 `86f010a33359f92fbc03452d7a2d5f7a045b75f43c62dd3168c3e3c302c6e4e9`, unsigned. O arquivo anterior `f59b959d34c97f5048ebf2cfaadeb42a7e5b7d84597b15db00d790779def29ae` (285.746.041 bytes) permanece o da suíte 9/9. Não é GA. Causa do `0xC0000005` não confirmada. |
| 2026-10-05 | **Alinhamento das memórias de status:** a regra Cursor do ecossistema ainda descrevia o PDV como RC3, o smoke `-Full` do CSO como pendente e a copy Free como sem recibo. `INICIAR_NOVA_TAREFA.md` e `MEMORIA_DO_PROJETO.md` repetiam RC3 e a proibição do recibo. A oficina do Hub ainda tratava a RC1 como não publicada. Conferido no GitHub: PDV `v4.0.0-rc4` (SHA-256 `31a0cdeda68dce058079c5d0d3d5652084ba8a8cc073dfce60e021c4b3c1fdf2`) e Hub `v2.1.0-rc1` (`publishedAt` 2026-10-05T20:37:22Z, SHA-256 `f59b959d34c97f5048ebf2cfaadeb42a7e5b7d84597b15db00d790779def29ae`). CSO: smoke `-Full` local de 03/10 permanece aprovado; deploy de `febaa3c` segue não confirmado. Os dois `AGENTS.md` já estavam iguais no texto. |
| 2026-10-05 | **Hub — pré-release Windows `v2.1.0-rc1` alinhada no ecossistema:** release em https://github.com/chmulato/caracore-hub-releases/releases/tag/v2.1.0-rc1. Matriz, planning, wiki e loja passam a apontar a RC Windows unsigned. GA 06/04/2027 e Mac/Linux fora desta tag. Alterações locais, sem deploy. |
| 2026-10-05 | **Planning e ecossistema alinhados ao núcleo:** `planning-data.js` passa a ler 05/10/2026 (série de outubro nas 11 torres: PDV Java 80%, Hub 62%, CSO 40%; média 72%). Flags: RC4 com T032 aberto, freeze M1 do CSO sem deploy confirmado, Hub RC1 sem aceite em macOS/Linux. `ecosistema.html` descreve o mesmo recorte na garagem, no roadmap e num aviso de CSO + Hub. Sem mudança de GA, cota ou publicação. |
| 2026-10-05 | **Matriz — redução local de CDN/Fast Data Transfer (CDN do host de então):** Observability indicava ~8,1 mil respostas de `logo_branca.png` × 1.389.022 B ≈ 11,25 GB; peso por resposta confirmado, origem dos acessos repetidos não. Gerados logo branco WebP com hash (117.882 B, −91,51%) e PNG compatível otimizado (456.635 B, −67,13%); logo comum −48,54%. Cache `max-age=120, s-maxage=86400` restrito à home e cinco páginas públicas; cache hashed immutable e vendors 24 h. 404 agora preserva erro e não navega automaticamente; 14 links legados corrigidos, sitemap alinhado e favicon duplicado removido. Build: 100 HTML, 507 referências, 98 verificações JS, 8/8 testes; Edge desktop/mobile passou, uma requisição do logo na primeira visita, cache reutilizado na recarga e zero requests à origem durante 65 s idle desktop. 3 erros JS e 6 source maps ausentes são preexistentes; sem novos erros. **Alterações apenas locais, sem commit/push/deploy**; aferir headers e redução no dashboard depois de publicar. O relatório daquele dia saiu do repo em 30/10/2026 com a configuração do host que não usamos; detalhes no histórico do git. |
| 2026-10-05 | **Hub — pausa e colaboração Gemini/Cursor:** handoff, status atual da oficina, regras Cursor e AGENTS espelhados atualizados. S4.3 passou apenas no runtime local Windows; Java focado 70/70, Playwright 4/4, WAR gerado/copiado com hash conferido. Login real via `npm run dev` permanece sem causa confirmada porque perfil/banco original não foi localizado; próximo passo é identificar runtime/perfil sem ler senha/hash nem alterar dados. Recuperação offline de senha segue tarefa separada. S4.2 depende de CI verde nos quatro alvos; S4.4–S4.9/Sprint 5 abertas; sem RC1 pública ou novo instalador validado — registro anterior à tag publicada no mesmo dia; o status vigente é a pré-release Windows. Git observado até `7e7fd14`; sem commit/push pelo assistente nesta atualização. GA e cota inalterados. |
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
