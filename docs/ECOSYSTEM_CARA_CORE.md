# Ecossistema Cara Core — mapa de repositórios

Documento de referência dos repositórios e pastas que compõem o ecossistema da Cara Core Informática (estado em 10/10/2026).

**Produtos-chave:** PDV · CSO · Hub. Fonte para IAs: `AGENTS.md` na raiz do workspace.


---


VISÃO GERAL

  Diretório / Repositório       Papel                                      Observação
  ----------------------------- ------------------------------------------ ----------------------------------------------------------
  caracore-site                 Site oficial (matriz institucional)         caracore.com.br — portfólio, ecossistema, redirects /delivery
  caracore-retro                Artigos Retrô (LinkedIn / editorial)        GitHub Pages: retro.caracore.com.br (139 artigos)
  caracore-wiki                 Wiki institucional                          GitHub Pages: wiki.caracore.com.br
  caracore-pdv                  Oficina — PDV Java web local / v4           v3.2.7-free estável; pré-release pública v4.0.0-rc6; T032/GA 08/11/2026; planos em PlanoLicencaService
  caracore-pdv-releases         Loja — PDV Java web local                   pdv.caracore.com.br · CTA Baixar Free (3.2.7) · Free 100 vendas/mês
  caracore-pdv-rust             Oficina — PDV Desktop (Rust + Tauri 2)      Rust, Tauri 2, React, SQLite; release v0.1.4
  caracore-rust-pdv-releases    Loja + artefatos — PDV Desktop Rust         UM repo: Pages = pdv-rust.caracore.com.br · Releases = NSIS/MSI/ZIP (tag v0.1.4). Clone local: caracore-pdv-rust-releases
  caracore-hub                  Oficina — CaraCore Hub                      Encomendas; web 2.1 concluída na oficina; WAR/Tomcat validado; GA Windows 06/04/2027; retomada docs/contexto-rapido.md
  caracore-hub-releases         Loja online e releases do Hub               GitHub Pages: hub.caracore.com.br; pré-release Windows v2.1.0-rc1.2 (instalador e ZIP, unsigned); GA 06/04/2027
  caracore-ete                  Código do Minerador 4.0 (ETE)               chmulatoETE Minerador; Windows .exe
  caracore-ete-releases         Loja online e releases Minerador 4.0        GitHub Pages: ete.caracore.com.br
  caracore-seed                 Código do Cara Core Seed                    Ferramenta interna; aplicação não disponível ao público
  caracore-seed-releases        Vitrine do Seed                             Informa que a aplicação não está disponível
  caracore-ink                  Oficina do Cara Core Ink Agenda             Java 25 + JavaFX (Windows); PWA não antes de 2028
  caracore-ink-releases         Loja online e releases Ink Agenda           GitHub Pages: ink.caracore.com.br
  caracore-ru                   Oficina do RU Soberano e do BioReator 4.0  Java 25 + JavaFX; sala RETRO + simulador; BioReator em garagem
  caracore-ru-releases          Loja do RU e seção do BioReator 4.0        GitHub Pages: ru.caracore.com.br · pacote de oficina 1.0.0 · #bioreator40 sem arquivo
  caracore-circuito             Oficina do Circuito Ferradura               Curso proprietário de lógica e Python
  caracore-circuito-releases    Loja online e releases Circuito Ferradura   GitHub Pages: circuito.caracore.com.br
  caracore-oidc                 Oficina do Reino OIDC (identidade)          OAuth 2.1 / OIDC; ReinoOIDC.exe
  caracore-oidc-releases        Loja online e releases do Reino OIDC        GitHub Pages: oidc.caracore.com.br
  caracore-area51               Oficina da Área 51 (código do sistema)      Desenvolvimento; autenticação enterprise OAuth 2.1/OIDC/PKCE
  caracore-area51-releases      Loja online do Suporte Área 51              Vitrine do serviço de consultoria; GitHub Pages
  caracore-helianto             Oficina do Helianto Condominium             Java 25 + Spring Boot 4 + React; GA 30/12/2029
  caracore-helianto-releases    Loja do Helianto Condominium                GitHub Pages: helianto.caracore.com.br (CNAME restaurado 10/10/2026)
  caracore-cso-quarkus          Oficina — CSO Gestão de Frotas (Web)        Produção `b90d1dc`, Flyway V33, FRO 24/24 desde 06/10 · freeze M1 até 08/11/2026 · `e193d6d` é commit anterior de COE · janela 08/abr–dez/2027 não reabre
  caracore-cso-transportes      Oficina — CSO Gestão de Transportes         Desktop JavaFX; GA 08/11/2028; sem URL/copy de loja
  caracore-cso-releases         Loja única CSO (Frotas + Transportes)       Clone: D:\onedrive\dev\caracore-cso-releases · Pages: cso-transp.caracore.com.br (app: cso.caracore.com.br)
  caracore-mkt                  Oficina do Cara Core MKT                    Ferramenta interna. Sala: tools.caracore.com.br/sala/
  caracore-mkt-releases         Loja do Cara Core MKT                       GitHub Pages: mkt.caracore.com.br (CNAME restaurado 10/10/2026); vitrine gratuita; não vendemos
  caracore-tools                Tools / Sala Cara Core                      tools.caracore.com.br/sala/
  caracore-personal             Blog pessoal de Christian Mulato            personal.caracore.com.br (268 artigos)


---


CARACORE PDV — DUAS LINHAS INDEPENDENTES

  Java: aplicação web local no navegador, com SQLite local.
  Rust: aplicativo desktop com Tauri e SQLite local.
  Nenhuma linha substitui a outra. Stacks e faixas de versão são independentes.

  Linha                    Oficina                  Loja                         Release / canal
  ------------------------ ------------------------ ---------------------------- ---------------------------
  PDV Java web local       caracore-pdv             caracore-pdv-releases        v3.2.7-free (estável) · pré-release pública v4.0.0-rc6 · Free 100 vendas/mês
  CaraCore PDV             caracore-pdv-rust        caracore-rust-pdv-releases    v0.1.4 (piloto Windows; loja + NSIS/MSI/ZIP no mesmo repo)

  Posicionamento V3 (negócio): PME, PIX Split 2027 — comum às duas linhas.
  Não confundir: V3 negócio ≠ canal Java v3.2.x ≠ release Rust v0.1.x.
  Evitar na comunicação: "PDV v3" sozinho, "nova geração", "substitui", "reescrito".

  Matriz site: portfólio #caracore-pdv-rust · loja pdv-rust.caracore.com.br
  Wiki institucional: caracore-wiki — projeto-pdv.html (hub), projeto-pdv-rust.html


---


AGRUPAMENTO POR FUNÇÃO

Site e presença pública
  caracore-site: Site matriz (home, portfólio, ecossistema, _redirects legado → lojas).
  caracore-wiki: Wiki institucional (projetos, tecnologias, trilhas, ecossistema). Portfólio: www.caracore.com.br apenas.
  caracore-retro: Artigos Retrô LinkedIn (retro.caracore.com.br).
  Retomada / produtividade: caracore-site/docs/INICIAR_NOVA_TAREFA.md + docs/ECOSYSTEM_MEMORIA.md

Produtos com entrega ativa (matriz + loja online)
  CaraCore PDV Java (web local): caracore-pdv + caracore-pdv-releases. Loja: pdv.caracore.com.br
  CaraCore PDV: caracore-pdv-rust + caracore-rust-pdv-releases (clone local caracore-pdv-rust-releases). Loja: **pdv-rust.caracore.com.br**. Artefatos: github.com/chmulato/caracore-rust-pdv-releases/releases (mesmo repo). Sem delivery matriz.
  Cara Core Hub: caracore-hub + caracore-hub-releases. Loja: hub.caracore.com.br. Banco: SQLite local (WAL). Download vigente: pré-release Windows v2.1.0-rc1.2 (instalador e ZIP, unsigned; tag nova na release seguinte). GA instalador 06/04/2027. Central: download.caracore.com.br. Não é Flask. Retomada: caracore-hub/docs/contexto-rapido.md. Manual: wiki.caracore.com.br/hub/
  CaraCore CSO: caracore-cso-quarkus (Frotas em produção desde 06/10, commit `b90d1dc`, Flyway V33; FRO 24/24) + caracore-cso-transportes (Desktop 08/11/2028, oficina sem loja). `e193d6d` fica como commit anterior de COE. Freeze M1: 08/11/2026. A janela 08/abr–dez/2027 não reabre o epic. Loja única (home de conversão): D:\onedrive\dev\caracore-cso-releases → cso-transp.caracore.com.br. App: cso.caracore.com.br. Um produto em 08/11/2028. CSO ≠ GPS.
  Circuito Ferradura: caracore-circuito + caracore-circuito-releases. Loja: circuito.caracore.com.br
  Reino OIDC: caracore-oidc + caracore-oidc-releases. Loja: oidc.caracore.com.br
  Ink Agenda: caracore-ink + caracore-ink-releases. Loja: ink.caracore.com.br · Desktop Windows v2.0.1 (com suporte até a 3.0) · 3.0 em PWA não antes de 2028, substitui o Desktop após importação dos dados (sem DMG/DEB nativos)
  RU Soberano: caracore-ru + caracore-ru-releases. Loja: ru.caracore.com.br. Lançamento 18/06/2027.
  BioReator 4.0: mesma oficina. Loja: https://ru.caracore.com.br/ (subdomínio do RU; edições em download.html#bioreator40; inventário artifacts/bioreator-1.0.0.txt). Garagem 1.0.0 Community, Windows x64, EXE e MSI na oficina, sem assinatura e sem arquivo na loja. Pro sem preço e sem PIX. A versão 1.0.0 do RU Soberano é outra linha.

Vitrines restauradas em 10/10/2026 (CNAME → chmulato.github.io; ver MEMORIA_INFRAESTRUTURA_CARACORE.txt)
  Helianto Condominium: caracore-helianto + caracore-helianto-releases. Loja: helianto.caracore.com.br. GA 30/12/2029.
  Cara Core MKT: caracore-mkt + caracore-mkt-releases. Loja: mkt.caracore.com.br. Sala: tools.caracore.com.br/sala/. Vitrine gratuita; não vendemos.

Produtos com vitrine, sem oferta de aplicação
  Cara Core Seed: caracore-seed + caracore-seed-releases. Loja: seed.caracore.com.br (ferramenta interna)

Serviço institucional
  Suporte Área 51: caracore-area51 + caracore-area51-releases. Loja: area51.caracore.com.br


---


REFERÊNCIAS CRUZADAS

  Lojas online (URLs e matriz): ver ECOSYSTEM_LOJAS.md
  Componentes padrão das lojas: ver COMPONENTES_LOJA.md
  Índice memorias (retomada): docs/ECOSYSTEM_MEMORIA.md — fonte única jun/2026
  Retrô B2B / IA (art. 115): retro.caracore.com.br/articles/2026_12_25_article_115.html
  Retrô PDV Rust (art. 114): retro.caracore.com.br/articles/2026_12_20_article_114.html
  Memória Cursor da matriz: caracore-site/.cursor/rules/project-memory.mdc
  Portfólio: https://www.caracore.com.br/portfolio.html
  Mapa visual: https://www.caracore.com.br/ecosistema.html
  Validação matriz/lojas: VALIDACAO_LOJAS_MATRIZ.md

Alinhamento matriz e lojas
  Em cada portal da matriz: links "Ver loja" apontam para o subdomínio ou GitHub Pages oficial.
  Regra de nomenclatura: oficina = caracore-<produto>; loja = caracore-<produto>-releases; publicação via docs/.


---


Atualizado em 09/10/2026.
