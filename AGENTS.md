# Cara Core Informática — Guia de Contexto e Memória para IAs (AGENTS.md)

> **Destinado a:** Todas as IAs, assistentes de código e agentes autônomos (Antigravity, Cursor, Copilot, Claude Code, Gemini).  
> **Data de Atualização:** 08/10/2026 (PDV Free estável `v3.2.7-free`; PDV v4 pré-release `v4.0.0-rc5`, validada em testes internos, roteiro formal pendente; CSO: gestão de frota FRO 24/24 em produção, Flyway V33; `PERF-001–007` congeladas; Hub permanece pré-release Windows `v2.1.0-rc1.2`, sem GA; Ink Agenda Desktop `v2.0.1` publicada, com suporte até a 3.0 em PWA; Reino OIDC Free `v2.0.0` GA publicado)
> **Workspace Raiz:** `D:\dev` (ou `D:\onedrive\dev`) 
> **Cópia no Git:** `caracore-site/AGENTS.md` — manter igual a este ficheiro para IAs que clonam só a matriz.  
> **CNPJ:** 23.969.028/0001-37 — Cara Core Informática 
> **Cursor:** `.cursor/rules/ecosystem-cara-core.mdc` aponta para este ficheiro.
> **Checkpoint Hub:** 08/10/2026 — pré-release Windows `v2.1.0-rc1.2` na loja, na matriz e na central de downloads (instalador e ZIP, unsigned). Aceite da QA desta build ainda pendente. GA 06/04/2027. Retomada: `caracore-hub/docs/contexto-rapido.md`.

---

## 1. Visão Geral e Filosofia Arquitetural

A Cara Core Informática desenvolve soluções sob o modelo de **Engenharia B2B**, **Código Transparente no Ambiente do Cliente** e a filosofia do **Bunker Digital**:
- **Offline-First & Soberania de Dados:** Prioridade para persistência local (SQLite / arquivos locais) onde a operação do cliente nunca é interrompida por instabilidades de rede ou nuvem.
- **FinOps & Abordagem Híbrida Pragmática:** A nuvem é utilizada para colaboração, captação e telemetria gerencial, sem onerar o cliente com custos recorrentes desnecessários.
- **Transparência Radical:** O que está pronto é vendido; o que está em desenvolvimento é claramente rotulado como *Garagem*, *Piloto* ou *Roadmap*; ferramentas internas (como o Seed) são declaradas sem falsas promessas de download.

### Produtos principais (núcleo) e brincos

Os **únicos produtos principais** são **PDV**, **CSO** e **Hub**. O resto do portfólio (Ink, OIDC, Seed, Circuito, Área 51, RU, Helianto, MKT, Minerador) são **brincos**: existem, têm loja ou vitrine, e **não** mandam na fila de Agent, na headline pública nem no discurso de negócio. Em conflito de cota ou de data, o brinco **cede**.

| Chave | O que é | Status público honesto |
|---|---|---|
| **PDV** | Caixa no computador da loja (Java web local + Rust desktop) | Java Free **`v3.2.7-free`** (100 vendas **por mês**; UI no navegador) · Java **`v4.0.0-rc5`** (pré-release pública para avaliação; validada em testes internos; roteiro formal pendente; GA **08/11/2026** condicionado) · Rust **`v0.1.4`** piloto Windows |
| **CSO** | Frotas Web + Transportes Desktop (2028) | Gestão de frota FRO 24/24 em produção desde 06/10 (Flyway V33). Freeze M1 em 08/11/2026. Jornada, app offline e GPS ficam depois. **Não é GPS** |
| **Hub** | Encomendas de Mercado Livre, Shopee e Temu | Vitrine pública · web 2.1 concluída · pré-release Windows `v2.1.0-rc1.2` (instalador e ZIP, unsigned) · sem Mac/Linux nesta tag · GA Windows **06/04/2027** |

### Registro da Matriz — CDN/Vercel — 05/10/2026

- Observability reportou cerca de 8,1 mil respostas de `assets/images/logo_branca.png`, 1.389.022 bytes cada, aproximadamente 11,25 GB em 12 horas. O tamanho do corpo por resposta explica a transferência; a origem e o motivo dos acessos repetidos permanecem não confirmados.
- Correções locais no `caracore-site`: WebP do logo branco versionado (117.882 bytes, −91,51%) e PNG compatível no URL legado (456.635 bytes, −67,13%); cache de um ano apenas para logos versionados; 24 h para assets compatíveis/vendors; `max-age=120, s-maxage=86400` somente na home e cinco páginas institucionais públicas. HTML seguro, APIs e configurações ficaram sem regra pública nova.
- Removido redirect automático da página 404; corrigidos links legados para Retrô/Wiki e duplicidade de favicons. Build estático e oito testes passaram; Edge desktop/mobile validou identidade, fallback PNG, cache de navegador e menu. Home permaneceu 65 s sem requests à mesma origem nem reload.
- **Não publicado:** mudanças estão no checkout local; não foram feitos commit/push/deploy, nem alterações de DNS, plano ou Firewall. Medir headers e impacto na Vercel após deploy. Relatório: `caracore-site/docs/CDN_VERCEL.md`.

### Registro Hub — 23/09/2026

- **Coerência funcional:** o escopo de negócio está coerente com o código para Mercado Livre, Shopee e Temu. Os três canais possuem webhook, worker e conector; RBAC canônico = `ADMIN`, `SUPERVISOR`, `OPERADOR`; SQLite/WAL e as 11 migrações foram validados.
- **Ponto de atenção:** `AMAZON` e `B2W` ainda aparecem no enum de domínio, mas não têm webhook, worker ou conector. Não são promessa pública do Hub. Até decisão posterior, tratar como roadmap e não aceitar esses canais na UI/API como se estivessem operacionais.
- **Pacote Windows atual (08/10/2026):** tag `v2.1.0-rc1.2` em `caracore-hub-releases`, unsigned. Instalador 281.529.680 bytes, SHA-256 `50d38ff0ee4defce5bb2598967331d0295fb4817dbec59df5d3e7574b22975e5`. ZIP da mesma edição, sem instalador, 333.342.883 bytes, SHA-256 `ec82b2bd57053c252faac4fdbb0066e9a5cea2df293562b35384107e5cb624b4`. FileVersion `2.1.0-rc1.2`. Manifesto: commit `463a85413205e772ffa6860d4b506309bb6cc951`, `sourceTreeDirty=false`. A tag `v2.1.0-rc1.1` conserva o pacote de 06/10. A tag `v2.1.0-rc1` conserva o instalador de 05/10. Mac e Linux não entram nesta tag. Não é GA. O aceite da QA desta build ainda não foi feito. Detalhes: `caracore-hub/docs/contexto-rapido.md` e `docs/plano-lancamento-rc1.md`.
- **Login real — ponto de parada:** corrigidos timestamps SQLite, busca de etiqueta/pedido e consulta de e-mail case-insensitive, mas o erro do screenshot continua sem causa confirmada. O usuário usou `npm run dev`; banco/perfil original não localizado nos caminhos conhecidos. Identificar `HUB_USER_DATA_PATH`, `userData` e WAR efetivos antes de consultar somente existência/status da conta; não solicitar/exibir senha/hash nem apagar banco. Recuperação offline de senha é tarefa separada e pendente. Git observado: `master`/referência local `origin/master` em `7e7fd14`; revalidar ao retomar. Gemini/Cursor devem seguir o handoff da oficina, sem confundir smoke limpo com resolução na conta real.
- **Status honesto:** web 2.1 pronta na oficina. O download da loja é a pré-release Windows `v2.1.0-rc1.2` em https://github.com/chmulato/caracore-hub-releases/releases/tag/v2.1.0-rc1.2 (instalador e ZIP, unsigned). Não é GA. Mac e Linux fora desta tag. Não anunciar Amazon/B2W nem o GA de 06/04/2027 como já entregue.
- **Fontes de retomada:** `caracore-hub/docs/contexto-rapido.md`, `caracore-hub/electron/README.md` e `caracore-hub/scripts/build_hub_exe.ps1`.

### Snapshot 08/09/2026 (ler isto primeiro)

**Frentes até 08/11/2026 (não são o mesmo lançamento):**

| Frente | O que a data significa | O que não é |
|---|---|---|
| **PDV Java v4** | **GA público** se T032 + `caracore-pdv/docs/arquitetura/PLANO_LANCAMENTO_V4.md`. **Código com Cursor: outubro–novembro/2026** (cota). | Não é o Free `v3.2.7-free`; não é copiloto PIX Split; não queimar cota em setembro neste plano |
| **CSO Gestão de Frotas** | Gestão de frota FRO 24/24 em produção desde 06/10 (`b90d1dc`, Flyway V33). Index `e1e8d63` no ar. Freeze M1 em **08/11/2026** estabiliza o que já está publicado | Não abre jornada, app offline nem GPS. Não é Momento 2 nem Transportes desktop |
| **CSO Transportes** | — | GA **08/11/2028**. Não usar a data do PDV |

Headline pública de 08/11/2026 = **PDV v4**. A gestão de frota do CSO já está no ar e não compete por essa promessa. Hub = 06/04/2027.

| Canal | O que está no ar | O que ainda não está |
|---|---|---|
| **PDV Java Free** | Tag `v3.2.7-free` · Maven `3.2.7` / display `3.2.7-free` · ZIP Windows/Linux/macOS · `http://localhost:8080/login` · primeiro acesso `admin`/`admin` (troca obrigatória; `/login` **não** anuncia `admin`/`admin` como válido após a troca) · shell PDV coluna + caixa registradora (busca/código Enter=+1, total grande, F2/F4/Esc; mapa Premium com **Restrito** empilhado) · loja de exemplo opcional · badge `Plano Free · X/100 vendas · Y/100 produtos` · limites em `PlanoLicencaService` (abaixo) | Versão estável da edição Free; a RC5 é a pré-release pública atual. Sem PIX integrado (QR/gateway) e sem NF-e/NFC-e. Nomes reais dos ZIP: `caracore-pdv-v3.2.7-free-free-{windows,linux,macos}-x64.zip`. SHA256 Windows `37110b7c07a045942bd89628fd473e649c7b57756707ce8a71908a1ec4c03c89` · Linux `bc8b67462a4505ad54e2d0afe18982321536101fb66f9e2c06c91bd3f7a63df7` · macOS `c0ffcf3992327df0dd31e5e2e2fc8173f3e1bf32c97178355e22994fa56b630a`. Histórico: `v3.2.6-free` / `feature/free-3.2.6-pdv-ux`. |
| **Loja PDV** | CTA primário = **Baixar Free (3.2.7)**. Premium via demonstração (`consultoria.html`). Qualidades: SQLite offline, venda no navegador, fechamento organizado. Copy Free pode mencionar recibo digital por link e PDF, identificado como **sem valor fiscal**. Sem depoimento inventado. | PWA da loja não é o caixa. RC4 é pré-release da edição Free, ainda não homologada para produção |
| **PDV Java v4** | Pré-release pública da edição Free `v4.0.0-rc5` · até 100 vendas finalizadas por mês civil · ZIP `CaraCore-PDV-4.0.0-rc5-qute-portable-windows-x64.zip` · Qute + launcher Edge (`iniciar_pdv.bat` underscore) · Windows x64 + Java 25+ + Python 3 + Microsoft Edge · unsigned, sem MSI/Authenticode; SHA-256 `d45d12d9fbf6e3923f69ddbbf6173ef2128be0341e30e75f038b7dc1f3ab6f81` e notas em `https://pdv.caracore.com.br/wiki-release-v4-0-0-rc5.html` · roteiro `https://pdv.caracore.com.br/homologacao-v4.html` · pasta nova + banco `./data/caracore-pdv.db` (não reabre `%APPDATA%/caracore/data/banco.db`) · plano de GA `caracore-pdv/docs/arquitetura/PLANO_LANCAMENTO_V4.md`. Validada em testes internos; roteiro formal pendente. `PERF-001–007` congeladas. | **Pré-release Free, não GA.** A `v3.2.7-free` permanece a versão estável e multiplataforma até os gates da 4.0. Não desativar SmartScreen, Defender ou antivírus |
| **PWA** | Loja: vitrine em `pdv.caracore.com.br/pwa.html` (atalho/offline da loja). Oficina: shell local do Quarkus depois do launcher | A PWA da loja **não** é o caixa. Sem Electron |
| **PDV Rust** | Piloto `v0.1.4` Windows · **loja + artefatos no mesmo repo** `chmulato/caracore-rust-pdv-releases` (Pages = `pdv-rust.caracore.com.br`; Releases = NSIS/MSI/ZIP) | **Nunca** `/releases/latest` de `caracore-pdv-releases` (repo Java; `latest` = Free). Não substitui o Java |
| **CSO** | Gestão de frota no ar em `cso.caracore.com.br` desde 06/10 (`b90d1dc`, Flyway V33): km/L, documentos, pneus, exame, infrações e custo por km. Index `e1e8d63`. Freeze M1 = **08/11/2026**. Loja `cso-transp.caracore.com.br` | Transportes desktop **08/11/2028**. Sem jornada, app offline nem GPS. Sem depoimento inventado. A data de 2026 não é o GA do Transportes |
| **Hub** | Vitrine + oficina web 2.1 concluída. Pré-release Windows `v2.1.0-rc1.2` (instalador e ZIP, unsigned) na loja | GA Windows **06/04/2027**. Mac e Linux fora desta tag. Login da conta real ainda sem causa confirmada. Não é Flask nem “central” da Cara Core |

### Planos Java Free / Premium (fonte: `PlanoLicencaService`)

| Limite | Free (R$ 0) | Premium (R$ 79,90/mês) |
|---|---|---|
| Vendas finalizadas / mês civil | 100 | Ilimitado |
| Produtos | 100 | Ilimitado |
| Operadores de caixa | 1 | Mais operadores |
| Vendedores | 4 | Sem o teto Free |
| Lojas | 1 | Sem o teto Free |
| Recibos SMS / mês | 10 no serviço | Sem o teto Free |
| PIX no caixa / emissão fiscal | Não | Sim (trilha Premium) |

Copy pública do Free pode informar recibo digital por link e PDF, sempre identificado como **sem valor fiscal**; não implica emissão de NF-e/NFC-e. A 3.2.6 acrescenta shell PDV coluna + caixa registradora (busca/código Enter=+1, total grande, F2/F4/Esc; Restrito empilhado), loja de exemplo opcional e badge de limites. A 3.2.7 baixa o estoque na venda, fecha o turno com relatório X/Z e lista os itens no recibo offline. Pagamentos Free: dinheiro, débito, crédito e outros — “outros” **não** é PIX integrado. Primeiro acesso ainda pode ser `admin`/`admin` com troca obrigatória; após a troca, `/login` **não** vende `admin`/`admin` como ainda válido. O pacote escuta só em `127.0.0.1`.

SHA256 Free (`v3.2.7-free`): Windows `37110b7c07a045942bd89628fd473e649c7b57756707ce8a71908a1ec4c03c89` · Linux `bc8b67462a4505ad54e2d0afe18982321536101fb66f9e2c06c91bd3f7a63df7` · macOS `c0ffcf3992327df0dd31e5e2e2fc8173f3e1bf32c97178355e22994fa56b630a`. O ZIP inclui `INSTALACAO.txt`. `SHA256SUMS.txt` e `RELEASE_MANIFEST.json` saem na release.

Rust piloto `v0.1.4`: teto de **100 vendas na vida do piloto**, não por mês. ZIP `CaraCore-PDV-v0.1.4-windows.zip` SHA256 `7d9cf69879eef8e12fd4972fcc3aaa5dc494df8630fa8554797bf47a98233a37`. Não misturar com o Free Java.

### Quem entra em cada PDV (fonte = loja da linha)

| Linha | Primeira venda | Perfis | Cliente lê em |
|---|---|---|---|
| **Java Free** | `admin` / `admin` no primeiro acesso (troca obrigatória; `/login` não anuncia essas credenciais após a troca) | **1 operador** no plano. Sem logins extras de demonstração. | https://pdv.caracore.com.br/download.html#perfis |
| **Rust piloto** | `admin` / `admin123` | `admin` (Administrador) · `operador` · `gestor` (tela **Financeiro**) · `auditoria`. “Acesso restrito” no operador é esperado. | https://pdv-rust.caracore.com.br/primeiros-passos.html#perfis |

Wiki **aponta** para essas âncoras; não é a fonte das senhas. Pasta Java `%APPDATA%\caracore\` ≠ Rust `%APPDATA%\caracore-pdv\`.

### Como IAs colaboram (desenvolvimento progressivo)

1. **Retomada:** este `AGENTS.md` → `.cursor/rules/ecosystem-cara-core.mdc` → `caracore-site/docs/ECOSYSTEM_MEMORIA.md` → `INICIAR_NOVA_TAREFA.md` → `.cursor/rules/project-memory.mdc` **do repo da tarefa**.
2. **Uma camada por vez:** matriz (`caracore-site`) · loja (`*-releases`) · oficina (`caracore-*`) · wiki (`caracore-wiki`). Não misturar Java e Rust no mesmo patch.
3. **Copy pública de login/perfis:** só na **loja daquela linha**. Wiki alinha produto e linka. Oficina guarda roteiro técnico (`contexto-rapido.md`, smokes).
4. **Depois de corte ou copy no ar:** atualizar este ficheiro, `ECOSYSTEM_MEMORIA.md` (linha no changelog), regras Cursor do repo tocado e da matriz. Não inventar depoimento, PIX no Free Java nem teto “/mês” no Rust.
5. **Git:** não commitar nem fazer push salvo pedido explícito. Exceção operacional: o dono pede “subir as novas”.

### Canais Java independentes (não misturar)

| Canal | Tag | Launcher | UI | Banco | Estado |
|---|---|---|---|---|---|
| **Free / loja** | `v3.2.7-free` (Latest) | `iniciar-pdv.bat` (hífen) | navegador `http://localhost:8080/login` | `%APPDATA%\caracore\` / `~/.caracore/` | **publicado** |
| **Pré-release pública v4** | `v4.0.0-rc5` | `iniciar_pdv.bat` (underscore) | Edge modo app | `./data/caracore-pdv.db` | ZIP publicado; validada em testes internos; roteiro formal pendente |

A oficina `caracore-pdv` (HEAD Maven `4.0.0-rc5`) **não** é o ZIP da loja. Retomada v4: `caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md`. Não apagar AppData da v3 “para limpar” a v4.

---

## 2. Padrão Arquitetural em 4 Camadas

Todo o ecossistema é organizado rigorosamente em 4 camadas:

```
[ 1. MATRIZ ]        → caracore-site (www.caracore.com.br) — B2B, portfólio e prova de entrega
     │
[ 2. PRODUTOS ]      → Definições conceituais de domínio, licença e personas de negócio
     │
[ 3. OFICINAS ]      → caracore-<produto> (Código-fonte, testes automatizados, CI/CD, baseline)
     │
[ 4. LOJAS ]         → caracore-<produto>-releases (*.caracore.com.br) — vitrine, download, feedback
[ 4b. WIKI ]         → caracore-wiki (wiki.caracore.com.br) — documentação de todos os produtos
```

### Regra de Ouro: Desacoplamento Oficina ↔ Loja
1. **Oficina (`caracore-<produto>`):** Contém código-fonte, scripts, testes, Docker, `.mvn` e documentação técnica interna.
2. **Loja (`caracore-<produto>-releases`):** Site estático publicado no GitHub Pages com subdomínio próprio (`*.caracore.com.br`), servindo como a **verdade comercial do produto** (vitrine, download e canal de feedback). A documentação vive em `wiki.caracore.com.br`.
3. **Sem destinos `/delivery/`:** Links e CTAs institucionais apontam diretamente para os subdomínios oficiais das lojas (o diretório legado `/delivery/` é mantido apenas por redirecionamentos `_redirects`).
4. **CSO (duas URLs, uma loja):** a **aplicação** Frotas vive em `cso.caracore.com.br`; a **loja única** (Frotas + Transportes) vive em `cso-transp.caracore.com.br`. Clone local canónico: `D:\onedrive\dev\caracore-cso-releases`. A loja não substitui o SaaS. Em 08/11/2028 as duas frentes viram um só produto.

---

## 3. Mapa Canónico de Repositórios e Subdomínios

| Produto | Oficina (Código/Dev) | Loja (Vitrine/Release) | Subdomínio Oficial | Stack Principal |
|---|---|---|---|---|
| **Matriz Institucional** | `caracore-site` | — | `www.caracore.com.br` | HTML5 / Bootstrap / B2B |
| **Blog Christian Mulato** | `caracore-personal` | — | `personal.caracore.com.br` | Editorial / 259 artigos / RSS |
| **Wiki Institucional** | `caracore-wiki` | — | `wiki.caracore.com.br` | HTML5 / Multi-persona |
| **Artigos Retrô** | `caracore-retro` | — | `retro.caracore.com.br` | Editorial / 138 artigos |
| **PDV Desktop (Java)** | `caracore-pdv` | `caracore-pdv-releases` | `pdv.caracore.com.br` | Java 25 · Quarkus · SQLite · Free `v3.2.7-free` (navegador `localhost:8080/login`) · v4 RC5 Qute pré-release |
| **CaraCore PDV (Rust)** | `caracore-pdv-rust` | `caracore-rust-pdv-releases` (clone local `caracore-pdv-rust-releases`) | `pdv-rust.caracore.com.br` + [Releases](https://github.com/chmulato/caracore-rust-pdv-releases/releases) | Rust · Tauri 2 · React · SQLite |
| **CSO Frotas (Web)** | `caracore-cso-quarkus` | `caracore-cso-releases` (loja única · clone `D:\onedrive\dev\caracore-cso-releases`) | Aplicação: `cso.caracore.com.br` · Loja: `cso-transp.caracore.com.br` | Java 21 · Quarkus · PostgreSQL · Qute/HTMX |
| **CSO Transportes (Desktop)** | `caracore-cso-transportes` (oficina **sem** URL/copy de loja) | `caracore-cso-releases` (a **mesma** loja) | Loja: `cso-transp.caracore.com.br` · GA **08/11/2028** | Quarkus · JavaFX · Vue 3 · SQLite |
| **Ink Agenda** | `caracore-ink` | `caracore-ink-releases` | `ink.caracore.com.br` | Java 25 · JavaFX (Windows **v2.0.1** publicada em 07/10/2026 com as correções do QA, jar ofuscado; v2.0.0 no histórico; Desktop com suporte e correções 2.0.x até a 3.0 o substituir) · **3.0 em PWA** em roadmap (**não antes de 2028**; nova aplicação de lançamento sobre o core da v2; web/Android/Mac/iPhone; nuvem HTTPS, um SQLite por estúdio; substitui o Desktop após importação dos dados; sem DMG/DEB) |
| **Minerador ETE 4.0** | `caracore-ete` | `caracore-ete-releases` | `ete.caracore.com.br` | Python · `v1.2.3` Ouro 4.0 · Windows/Linux/macOS |
| **CaraCore Hub** | `caracore-hub` | `caracore-hub-releases` | `hub.caracore.com.br` | Jakarta EE 10 · WAR/Tomcat · JSP |
| **Circuito Ferradura** | `caracore-circuito` | `caracore-circuito-releases` | `circuito.caracore.com.br` | Python · Lógica / Educação |
| **Reino OIDC** | `caracore-oidc` | `caracore-oidc-releases` | `oidc.caracore.com.br` | Free `v2.0.0` GA · OAuth 2.1 · OIDC · Windows .exe |
| **Área 51** | `caracore-area51` | `caracore-area51-releases` | `area51.caracore.com.br` | Python · Flask · Consultoria OIDC |
| **Helianto Condominium** | `caracore-helianto` | — | — | Java 25 · Spring Boot 4 · React · GA **30/12/2029** · **sem loja** |
| **RU Soberano** | `caracore-ru` | `caracore-ru-releases` | `ru.caracore.com.br` | Java 25 · JavaFX · SQLite · Simulador |
| **Cara Core Seed** | `caracore-seed` | `caracore-seed-releases` | `seed.caracore.com.br` | Ferramenta interna (sem download) |
| **Cara Core MKT / Sala** | `caracore-mkt` / `caracore-tools` | — | Sala: `tools.caracore.com.br/sala/` | Ferramenta interna · **sem loja** |
| **Central de Downloads** | — | `caracore-loja` | `download.caracore.com.br` | HTML5 / Vanilla CSS / Hub Unificado |

**Fora do mapa de lojas:** MKT e Helianto. CNAMEs `mkt.caracore.com.br` e `helianto.caracore.com.br` removidos no Registro.br. Fonte: `MEMORIA_INFRAESTRUTURA_CARACORE.txt`.

---

## 4. Ambiente Centralizado Único (`AMBIENTE_CENTRALIZADO.md`)

Para garantir uniformidade e evitar retrabalho, todos os agentes devem obedecer ao setup unificado:
* **Python Centralizado:** Usar sempre o interpretador em `D:\dev\.venv\Scripts\python.exe`.
* **Maven Centralizado:** Usar o wrapper em `D:\onedrive\dev\.mvn\bin\mvn.cmd` e o repositório em `D:\onedrive\dev\.m2\repository`.
* **Versões Java:** mapa canónico [`APPS_JAVA_VERSION.md`](APPS_JAVA_VERSION.md). PDV (Free `v3.2.7` e v4 `4.0.0-rc5`) **25** · CSO Frotas **21** · CSO Transportes **25** · Hub **25** · Ink **25** · Helianto **25** · RU **25** · Seed **17**. Nesta máquina o `JAVA_HOME` padrão é o JDK 21 (`C:\Program Files\Java\jdk21.0.11_10`); Seed usa `C:\Program Files\Java\jdk-17`; as aplicações 25 usam `C:\Program Files\Java\jdk-25.0.3_9`.
* **Script de Ativação:** `python D:\dev\bootstrap_env.py`.

---

## 5. Diretrizes de Comunicação e Discurso de Negócio

1. **Coexistência PDV (Java × Rust):**
 - Ambos são sistemas DESKTOP offline-first independentes.
 - NUNCA afirme que o PDV Rust *"substitui"* ou é uma *"migração forçada"* do PDV Java.
 - Java: canal estável **`v3.2.7-free`** (Free: 100 vendas/mês, 100 produtos, 1 operador, 4 vendedores, 1 loja; porta 8080 + `/login` no navegador; shell coluna + registradora; recibo digital por link e PDF sem valor fiscal; sem PIX integrado nem NF-e/NFC-e) · pré-release pública da edição Free **`v4.0.0-rc5`** (até 100 vendas finalizadas por mês civil; roteiro operacional formal ainda pendente; não é GA). Loja: CTA principal = **Baixar Free (3.2.7)**; Premium via demonstração.
 - Rust piloto `v0.1.4`.
 - V3 é a estratégia de negócio PME (com PIX Split 2027), comum a ambas as tecnologias.
 - Rust: loja própria (`pdv-rust.caracore.com.br`) e entrega própria de artefatos no **mesmo** repositório `chmulato/caracore-rust-pdv-releases` (GitHub Pages + GitHub Releases). Clone local da loja: `caracore-pdv-rust-releases` (nome da pasta ≠ nome no GitHub). Tag atual **`v0.1.4`**. Neste repo Rust, `/releases` e `/latest` são só o piloto. **Não** usar `caracore-pdv-releases` para o Rust (canal Java).
2. **CaraCore CSO (Estratégia Dual):**
   - **Frotas (Web):** Em produção em `https://cso.caracore.com.br/` (Quarkus + Postgres). Oficina `caracore-cso-quarkus` (não existe oficina `caracore-cso-frotas`). Desde 06/10 a versão inclui km/L, documentos, pneus, exame toxicológico, infrações e custo por km (`b90d1dc`, Flyway V33; index `e1e8d63`). Até 08/11/2026 o trabalho é o freeze M1 dessa versão. Jornada, app offline e GPS ficam depois.
   - **Transportes (Desktop):** Produto bunker offline previsto para lançamento em **08/11/2028**. Oficina `caracore-cso-transportes` — **só código e docs técnicos**; sem URL, clone nem copy de loja. **Não** é a data do PDV v4.
   - **Vitrine (loja única):** clone canónico `D:\onedrive\dev\caracore-cso-releases` → `https://cso-transp.caracore.com.br/`. Home = conversão da Frotas (CTAs → `/cadastro` e planos). 2028/GPS/stack ficam abaixo. Sem instalador público até o GA do desktop. Em **08/11/2028** as duas frentes viram um só produto.
   - **Landing da aplicação (05/09/2026):** JSON-LD (Organization + SoftwareApplication + FAQPage), cache 5 min na `/`, LCP WebP. Copy lidera com “gestão de frotas”. Oficina `caracore-cso-quarkus`.
   - CSO de gestão **não** é rastreador GPS. Virtual Tracker™ é produto futuro, separado, 2028. Na loja: sem depoimento inventado e sem % de economia.
3. **CaraCore Hub:**
   - Gestão de **encomendas** para centros de distribuição (Mercado Livre, Shopee, Temu). **Não** é orquestrador interno da Cara Core nem Python/Flask (isso é Área 51).
   - Oficina web **2.1 concluída** (Jakarta EE 10 · WAR · Tomcat · JSP · SQLite local em WAL). O banco do produto fica no computador do cliente. O WAR é artefato de oficina, não release pública. O calendário oficial de GA é o **instalador Windows com Electron, Tomcat embutido e o mesmo SQLite** em **06/04/2027**. Stack pública: Java 25, Jakarta EE 10, Tomcat 10.1.
   - Status em 08/10/2026: a loja oferece a pré-release Windows `v2.1.0-rc1.2` (instalador e ZIP, unsigned). Mac e Linux ficam fora desta tag. O login da conta real ainda não tem causa confirmada. O GA Windows permanece 06/04/2027.
   - Tia Sócia / Programa Tias Sócias é pitch ilustrativo, não o nome do produto.
   - Retomada para IAs na oficina: `caracore-hub/docs/contexto-rapido.md` · Cursor `.cursor/rules/project-memory.mdc`. Manual de uso público: `wiki.caracore.com.br/hub/`.
   - **Próxima tag:** outro sufixo, com bytes novos. As tags `v2.1.0-rc1`, `v2.1.0-rc1.1` e `v2.1.0-rc1.2` conservam os arquivos já publicados. A versão do instalador entra em `electron/package.json`; o commit fica com a árvore limpa antes de `scripts/build_hub_exe.ps1`; o manifesto sai com `sourceTreeDirty=false` e `builtAt` no horário do arquivo. Publicar a tag em `caracore-hub-releases`, depois o cartão em `caracore-loja` e a matriz (`ecosistema.html`, `portfolio.html`, planning), e sincronizar este ficheiro com `ECOSYSTEM_MEMORIA.md`. Os POMs Maven permanecem `2.1.0-rc1`. O nome público é `CaraCore.Hub-<versão>-win-x64`. A oficina privada só vai ao remoto quando o dono pedir.
4. **Wiki única no portal:**
   - Toda a documentação de produto vive em `wiki.caracore.com.br` (`caracore-wiki`).
   - As lojas (`*.caracore.com.br`) ficam com vitrine, download e canal de feedback. URLs antigas `/wiki/` nas lojas redirecionam para o portal.
   - CSO: aplicação em `cso.caracore.com.br`; vitrine em `cso-transp.caracore.com.br`; alinhamento em `projeto-cso.html`.
5. **Cara Core Seed:**
   - Produto de licenciamento interno. A vitrine pública informa de forma honesta que o aplicativo não está em oferta aberta.

---

## 6. Calendário Oficial do Roadmap (Sincronizado)

* **Concluídos / Em Operação:**
 - PDV Java Free (`v3.2.7-free` · 100 vendas/mês · aplicação web local no navegador; registradora)
 - PDV Java v4 pré-release pública (`v4.0.0-rc5`; validada em testes internos; roteiro formal pendente; GA **08/11/2026** condicionado)
 - Ink Agenda Desktop (`v2.0.1` estável, publicada em 07/10/2026 — correções do QA da `v2.0.0`)
  - Minerador 4.0 (`v1.2.3` Ouro 4.0)
  - Reino OIDC Free (`v2.0.0` GA): três Eras e progressão narrativa gratuitas para estudo pessoal; módulo pago opcional limitado aos decks adicionais de Mineração de Chaves.
  - Circuito Ferradura (Ativo)
  - Suporte Área 51 (Baseline `0.1.0-dev`)
  - CSO Frotas Web (Em produção)
* **Em Andamento (Garagem / Roadmap Público):**
  - **CaraCore PDV v4 (frente de GA público):** `08/11/2026` — plano `caracore-pdv/docs/arquitetura/PLANO_LANCAMENTO_V4.md`
  - **CaraCore CSO Frotas:** gestão de frota FRO 24/24 em produção desde 06/10 (`b90d1dc`, Flyway V33). Index pública em `e1e8d63`. Freeze M1 em `08/11/2026` (`caracore-cso-quarkus/docs/plano-lancamento-2026-11-08.md`) estabiliza o que já está no ar, sem jornada, app offline nem GPS.
  - **CaraCore Hub (GA Instalador Windows):** `06/04/2027`
  - **RU Soberano (Simulador + Sala Retro):** `18/06/2027`
  - **CaraCore CSO Transportes (Desktop Bunker):** `08/11/2028` — **dois anos** depois do PDV v4
  - **Helianto Condominium (SaaS Condominial):** `30/12/2029` — Agent em 2029 (depois do Transportes)
  - **Ink Agenda PWA:** roadmap — Tab; **sem GA com Agent** até folga do núcleo (**não antes de 2028**); sem DMG/DEB; sprints `caracore-ink/docs/PLANO_PWA.md`
  - **Evolução de Negócio PDV V3 (PIX Split PME):** `2027` (papel; Agent depois do Hub no ar e com folga do FRO)

### Cota Cursor (fila única da empresa)

Assinatura **Pro US$ 20/mês**. A cota **não acumula**. Teto **80%**. Sem on-demand. **Um produto pesado por ciclo.** Tab não conta.

Canónico: [`caracore-site/docs/CALENDARIO_COTA_CURSOR.md`](caracore-site/docs/CALENDARIO_COTA_CURSOR.md)

| Período | Dono do Agent | Marco |
|---------|---------------|-------|
| set/2026 | CSO COE | Frotas já no ar |
| out–08/nov/2026 | **PDV v4** | GA 08/11/2026 |
| 09/nov–04/dez/2026 | PDV corte + copy CSO M1 | Freeze M1 |
| dez/2026–06/04/2027 | **Hub** | GA Windows 06/04/2027 |
| 08/04–dez/2027 | — | FRO 24/24 já publicado em 06/10. Não reabrir o epic |
| 2028 | **CSO Transportes** | GA 08/11/2028 |
| 2029 | **Helianto** | GA 30/12/2029 |

FRO 24/24 já está em produção desde 06/10, por decisão explícita. Outubro–08/nov continua com o PDV v4 como dono do Agent. Não abrir MON nem PWA. Dezembro = **Hub**, não Ink. Ink PWA = Tab; Agent só com folga do núcleo (**não antes de 2028**). Momento 2 / PWA frota / Virtual Tracker **não** cabem neste envelope até depois de 2028. RU = Garagem sem mês de Agent. Helianto **não** abre Agent em 2027–2028. Guia se a decisão muda GA ou dono: [`RISCOS_ECOSSISTEMA.md`](caracore-site/docs/RISCOS_ECOSSISTEMA.md).

---

## 7. Documentos de Referência Rápida

- Este ficheiro (`AGENTS.md`) é a **fonte mestre para IAs** (Cursor, Copilot, Claude Code, Gemini, Antigravity).
- Cursor (sempre ativo): [`.cursor/rules/ecosystem-cara-core.mdc`](.cursor/rules/ecosystem-cara-core.mdc)
- Visão detalhada de ecossistema: [`caracore-site/docs/ECOSYSTEM_CARA_CORE.md`](caracore-site/docs/ECOSYSTEM_CARA_CORE.md)
- Cota Cursor (fila única da empresa): [`caracore-site/docs/CALENDARIO_COTA_CURSOR.md`](caracore-site/docs/CALENDARIO_COTA_CURSOR.md)
- Riscos / guia de decisão: [`caracore-site/docs/RISCOS_ECOSSISTEMA.md`](caracore-site/docs/RISCOS_ECOSSISTEMA.md)
- Memória de retomada de tarefas: [`caracore-site/docs/ECOSYSTEM_MEMORIA.md`](caracore-site/docs/ECOSYSTEM_MEMORIA.md)
- Auditoria/correção local de CDN da matriz (Vercel): [`caracore-site/docs/CDN_VERCEL.md`](caracore-site/docs/CDN_VERCEL.md)
- Guia para novas tarefas: [`caracore-site/docs/INICIAR_NOVA_TAREFA.md`](caracore-site/docs/INICIAR_NOVA_TAREFA.md)
- Validação matriz ↔ lojas: [`caracore-site/docs/VALIDACAO_LOJAS_MATRIZ.md`](caracore-site/docs/VALIDACAO_LOJAS_MATRIZ.md)
- Padrão de ambiente de dev: [`AMBIENTE_CENTRALIZADO.md`](AMBIENTE_CENTRALIZADO.md)
- Versões Java por aplicação (Cursor, Copilot, Gemini/Antigravity): [`APPS_JAVA_VERSION.md`](APPS_JAVA_VERSION.md)
- Wiki do portal: [`caracore-wiki/docs/projeto-pdv.html`](caracore-wiki/docs/projeto-pdv.html) · [`projeto-cso.html`](caracore-wiki/docs/projeto-cso.html) · [`projeto-hub.html`](caracore-wiki/docs/projeto-hub.html) · manual Hub [`docs/hub/`](caracore-wiki/docs/hub/)
- Retomada Hub (GA Windows 2027): [`caracore-hub/docs/contexto-rapido.md`](caracore-hub/docs/contexto-rapido.md)
- Retomada PDV Java (pré-release pública `v4.0.0-rc5`, validada em testes internos; roteiro formal pendente; canal maduro `v3.2.7-free`; **frente GA 08/11/2026 condicionada a T032**): [`caracore-pdv/AGENTS.md`](caracore-pdv/AGENTS.md) · [`PLANO_LANCAMENTO_V4.md`](caracore-pdv/docs/arquitetura/PLANO_LANCAMENTO_V4.md) · [`CONTINUIDADE_DESENVOLVIMENTO.md`](caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md)
- Retomada Minerador 4.0 (canal **v1.2.3**): [`caracore-ete/AGENTS.md`](caracore-ete/AGENTS.md) · loja `ete.caracore.com.br`
- Retomada Ink Agenda 3.0 em PWA (sprints S0–S9; não antes de 2028; nuvem HTTPS + SQLite por estúdio; substitui o Desktop v2 no S9; até lá o Desktop tem suporte e correções 2.0.x): [`caracore-ink/AGENTS.md`](caracore-ink/AGENTS.md) · [`PLANO_PWA.md`](caracore-ink/docs/PLANO_PWA.md) · loja `ink.caracore.com.br/pwa.html`

**Como outras IAs retomam (06/10/2026):** ler este `AGENTS.md` (bloco **Frentes até 08/11/2026** + **Cota Cursor**) → `.cursor/rules/ecosystem-cara-core.mdc` → `caracore-site/docs/CALENDARIO_COTA_CURSOR.md` → `caracore-site/docs/RISCOS_ECOSSISTEMA.md` (se mudar GA ou dono) → `caracore-site/docs/ECOSYSTEM_MEMORIA.md` → `INICIAR_NOVA_TAREFA.md` → oficinas relevantes. **CSO:** gestão de frota FRO 24/24 no ar em 06/10 (`b90d1dc`, Flyway V33). Freeze M1 em 08/11/2026 estabiliza o que já está publicado, sem jornada, app offline nem GPS. Transportes = **08/11/2028**. A aplicação já descreve essa versão. A copy da matriz (`ecosistema.html`, `portfolio.html`), da wiki (`projeto-cso.html`) e da loja `cso-transp` foi alinhada no checkout em 06/10 e **ainda não foi publicada**. **PDV:** Patch Free = checkout `v3.2.7-free` / `hotfix/3.2.7-free`; RC5 é a pré-release pública da edição Free, limitada a 100 vendas finalizadas por mês civil. Validada em testes internos; roteiro formal pendente. ZIP e sidecar públicos em `https://github.com/chmulato/caracore-pdv-releases/releases/tag/v4.0.0-rc5`; SHA-256 `d45d12d9fbf6e3923f69ddbbf6173ef2128be0341e30e75f038b7dc1f3ab6f81`. Roteiro: `https://pdv.caracore.com.br/homologacao-v4.html`. `PERF-001–007` congeladas. ZIP portátil Windows x64 unsigned, MSI não incluído; não desativar proteções do Windows. `v3.2.7-free` permanece estável e Latest. Retomada técnica: `caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md`; não tratar testes de instrumentação como benchmark nem executar nova medição até satisfazer o preflight de baixa carga. **Um produto pesado por ciclo** (US$ 20/mês). Hub: **dez/2026–06/04/2027**. Ink PWA: Tab; **não antes de 2028**. Helianto = **30/12/2029**. Rust piloto = `v0.1.4`. Não misturar pasta, launcher, senha nem banco. Minerador ETE = **v1.2.3**.

**Atualização Ink Agenda (07/10/2026):** Desktop Windows `v2.0.1` publicada (Latest em `caracore-ink-releases`; correções do QA da v2.0.0; jar ofuscado com ProGuard). Setup SHA256 `49bdd76a10ab97b7902e47b8c393c638ef90ea6b490874224a9734a802f90a6b` · ZIP `3118eac8fafdfa5cc4d3e341969d0cd205d5a29caabbe069e12d7b956a994ff3`. O Desktop continua com suporte (correções 2.0.x, sem funcionalidade nova) até o S9 da 3.0. A 3.0 em PWA (não antes de 2028; nuvem HTTPS, um SQLite por estúdio) substitui o Desktop depois da importação dos dados. Teste das telas do build ofuscado com o dono: `caracore-ink/docs/RELEASE_2.0.1.md`. Retomada: `caracore-ink/AGENTS.md` → `docs/PLANO_PWA.md`.

**Atualização PDV Free (07/10/2026):** canal estável `v3.2.7-free` no ramo `hotfix/3.2.7-free`. Estoque na venda, turno com X/Z, saldo em dinheiro pelo valor da venda, recibo offline com itens e PDF, OpenAPI fechado, escuta em `127.0.0.1`, logs em `%APPDATA%\caracore\logs`. Sem NF-e, NFC-e nem PIX integrado. ZIP `caracore-pdv-v3.2.7-free-free-{windows,linux,macos}-x64.zip`. SHA256 Windows `37110b7c07a045942bd89628fd473e649c7b57756707ce8a71908a1ec4c03c89` · Linux `bc8b67462a4505ad54e2d0afe18982321536101fb66f9e2c06c91bd3f7a63df7` · macOS `c0ffcf3992327df0dd31e5e2e2fc8173f3e1bf32c97178355e22994fa56b630a`. A pré-release pública da linha v4 continua `v4.0.0-rc5`. Histórico imediato: `v3.2.6-free`.

**Atualização PDV (07/10/2026):** pré-release `v4.0.0-rc5`. ZIP `CaraCore-PDV-4.0.0-rc5-qute-portable-windows-x64.zip`, SHA-256 `d45d12d9fbf6e3923f69ddbbf6173ef2128be0341e30e75f038b7dc1f3ab6f81`, igual na loja, no GitHub e na wiki. Leitor Quagga local, recibo com itens, logs contínuos e auditoria dos eventos de caixa. Validada em testes internos; roteiro formal pendente (`docs/homologacao-v4.md` e `https://pdv.caracore.com.br/homologacao-v4.html`). A RC4 fica no histórico. `v3.2.7-free` é o estável/Latest. `PERF-001–007` congeladas.

**Atualização PDV (04/10/2026):** as correções RC4 passaram na suíte Maven com Java 25 (843 testes, 0 falhas/erros, 3 ignorados) e nos testes do empacotador (6/6). O ZIP portátil unsigned foi publicado como pré-release, seu asset foi baixado novamente e o SHA-256 confirmado: `31a0cdeda68dce058079c5d0d3d5652084ba8a8cc073dfce60e021c4b3c1fdf2`. T032 segue aberto pelo roteiro operacional formal; Edge/Windows 1280×800 e troca obrigatória de senha inicial estão resolvidos. MSI não será distribuído e, nessa data, `v3.2.6-free` seguia estável/Latest. `PERF-001–007` continuam congeladas; não fazer benchmark/tuning. Handoff: `caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md`; status canônico: `caracore-pdv/docs/arquitetura/STATUS_ATUAL_APLICACAO.md`.

**Atualização Matriz/CDN (05/10/2026):** logo branco da home reduzido de 1.389.022 B para WebP versionado de 117.882 B; PNG compatível legado reduzido para 456.635 B. Cache local configurado para 120 s de navegador e 24 h de cache compartilhado somente em seis páginas institucionais públicas; assets com hash são immutable. Página 404 não redireciona automaticamente; links legados conhecidos corrigidos. Build Node completo, 8/8 testes e validação Edge desktop/mobile aprovados; três erros JS e seis source maps faltantes permanecem avisos preexistentes. **Sem commit/push/deploy**: confirmar headers e métricas na Vercel depois da publicação. Evidências e caveats: `caracore-site/docs/CDN_VERCEL.md`.

**Atualização Reino OIDC (07/10/2026):** Free `v2.0.0` publicado como GA em https://github.com/chmulato/caracore-oidc-releases/releases/tag/v2.0.0. SHA-256 do `ReinoOIDC-v2.exe`: `af0a5bd3bf4f8f6586de6e32a29b7ba750985788e8cca768f87ecf74fd59952d`. As três Eras e a progressão narrativa são gratuitas para estudo pessoal; o módulo pago opcional, R$ 29,90 em valor único, limita-se aos decks adicionais de Mineração de Chaves. Não inclui certificação, consultoria nem suporte técnico.
