# Ecossistema Cara Core — mapa de repositórios

Documento de referência dos repositórios e pastas que compõem o ecossistema da Cara Core Informática (estado em 08/08/2026).


---


VISÃO GERAL

  Diretório / Repositório       Papel                                      Observação
  ----------------------------- ------------------------------------------ ----------------------------------------------------------
  caracore-site                 Site oficial (matriz institucional)         caracore.com.br — portfólio, ecossistema, redirects /delivery
  caracore-retro                Artigos Retrô (LinkedIn / editorial)        GitHub Pages: retro.caracore.com.br (117 artigos)
  caracore-wiki                 Wiki institucional                          GitHub Pages: wiki.caracore.com.br
  caracore-pdv                  Oficina — PDV Desktop (Java · JavaFX)       Quarkus 3, Java 25, JavaFX; canal v3.2.2-free
  caracore-pdv-releases         Loja — PDV Desktop Java                     GitHub Pages: pdv.caracore.com.br
  caracore-pdv-rust             Oficina — PDV Desktop (Rust + Tauri 2)      Rust, Tauri 2, React, SQLite; release v0.1.2
  caracore-pdv-rust-releases    Loja — PDV Desktop Rust (piloto)            rust-pdv.caracore.com.br (vitrine; download → GitHub Releases)
  (GitHub) caracore-rust-pdv-releases  Artefatos oficiais (MSI/NSIS/ZIP/deb/dmg)   github.com/chmulato/caracore-rust-pdv-releases/releases
  caracore-hub                  Código do produto Cara Core Hub             Gestão logística e e-commerce; WAR (Tomcat); Tia Sócia
  caracore-hub-releases         Loja online e releases do Hub               GitHub Pages: hub.caracore.com.br
  caracore-ete                  Código do Minerador 4.0 (ETE)               chmulatoETE Minerador; Windows .exe
  caracore-ete-releases         Loja online e releases Minerador 4.0        GitHub Pages: ete.caracore.com.br
  caracore-seed                 Código do Cara Core Seed                    Ferramenta interna; aplicação não disponível ao público
  caracore-seed-releases        Vitrine do Seed                             Informa que a aplicação não está disponível
  caracore-ink                  Oficina do Cara Core Ink Agenda             Java 25 + JavaFX; desktop Windows/macOS/Linux
  caracore-ink-releases         Loja online e releases Ink Agenda           GitHub Pages: ink.caracore.com.br
  caracore-ru                   Oficina do RU Soberano                      Java 25 + JavaFX; sala RETRO + simulador
  caracore-ru-releases          Loja online e releases RU Soberano          GitHub Pages: ru.caracore.com.br
  caracore-circuito             Oficina do Circuito Ferradura               Curso proprietário de lógica e Python
  caracore-circuito-releases    Loja online e releases Circuito Ferradura   GitHub Pages: circuito.caracore.com.br
  caracore-oidc                 Oficina do Reino OIDC (identidade)          OAuth 2.1 / OIDC; ReinoOIDC.exe
  caracore-oidc-releases        Loja online e releases do Reino OIDC        GitHub Pages: oidc.caracore.com.br
  caracore-area51               Oficina da Área 51 (código do sistema)      Desenvolvimento; autenticação enterprise OAuth 2.1/OIDC/PKCE
  caracore-area51-releases      Loja online do Suporte Área 51              Vitrine do serviço de consultoria; GitHub Pages
  caracore-helianto             Oficina do Helianto Condominium             Java 25 + Spring Boot 4 + React; multi-tenant SaaS
  caracore-helianto-releases    Loja online e releases do Helianto          GitHub Pages: helianto.caracore.com.br
  caracore-cso-quarkus          Oficina — CSO Gestão de Frotas (Web)        Quarkus; produção em cso.caracore.com.br
  caracore-cso-transportes      Oficina — CSO Gestão de Transportes         Desktop JavaFX; lançamento 08/11/2028
  caracore-cso-releases         Sem vitrine de loja                         Aplicação canónica: cso.caracore.com.br
  caracore-mkt                  Oficina do Cara Core MKT / Sala             Scripts e portal; oferta gratuita
  caracore-mkt-releases         Loja online do Cara Core MKT                GitHub Pages: mkt.caracore.com.br
  caracore-tools                Tools / Sala Cara Core                      tools.caracore.com.br/sala/
  caracore-personal             Blog pessoal de Christian Mulato            personal.caracore.com.br (153 artigos)


---


CARACORE PDV — DUAS LINHAS DESKTOP (MESMO PRODUTO)

  Ambos são aplicativos DESKTOP instalados no computador da loja (SQLite local, operação Bunker).
  Nenhuma linha substitui a outra. Stacks e faixas de versão são independentes.

  Linha                    Oficina                  Loja                         Release / canal
  ------------------------ ------------------------ ---------------------------- ---------------------------
  PDV Desktop Java         caracore-pdv             caracore-pdv-releases        v3.2.2-free (maduro)
  CaraCore PDV             caracore-pdv-rust        loja + GitHub Releases       v0.1.2 (piloto Windows; download em GitHub)

  Posicionamento V3 (negócio): PME, PIX Split 2027 — comum às duas linhas.
  Não confundir: V3 negócio ≠ canal Java v3.2.x ≠ release Rust v0.1.x.
  Evitar na comunicação: "PDV v3" sozinho, "nova geração", "substitui", "reescrito".

  Matriz site: portfólio #caracore-pdv-rust · loja rust-pdv.caracore.com.br
  Wiki institucional: caracore-wiki — projeto-pdv.html (hub), projeto-pdv-rust.html


---


AGRUPAMENTO POR FUNÇÃO

Site e presença pública
  caracore-site: Site matriz (home, portfólio, ecossistema, _redirects legado → lojas).
  caracore-wiki: Wiki institucional (projetos, tecnologias, trilhas, ecossistema). Portfólio: www.caracore.com.br apenas.
  caracore-retro: Artigos Retrô LinkedIn (retro.caracore.com.br).
  Retomada / produtividade: caracore-site/docs/INICIAR_NOVA_TAREFA.md + docs/ECOSYSTEM_MEMORIA.md

Produtos com entrega ativa (matriz + loja online)
  CaraCore PDV Desktop (Java): caracore-pdv + caracore-pdv-releases. Loja: pdv.caracore.com.br
  CaraCore PDV: caracore-pdv-rust + caracore-pdv-rust-releases. Loja: **rust-pdv.caracore.com.br** (sem delivery matriz).
  Cara Core Hub: caracore-hub + caracore-hub-releases. Loja: hub.caracore.com.br
  Minerador 4.0 (ETE): caracore-ete + caracore-ete-releases. Loja: ete.caracore.com.br
  Circuito Ferradura: caracore-circuito + caracore-circuito-releases. Loja: circuito.caracore.com.br
  Reino OIDC: caracore-oidc + caracore-oidc-releases. Loja: oidc.caracore.com.br
  Ink Agenda: caracore-ink + caracore-ink-releases. Loja: ink.caracore.com.br
  RU Soberano: caracore-ru + caracore-ru-releases. Loja: ru.caracore.com.br
  Helianto Condominium: caracore-helianto + caracore-helianto-releases. Loja: helianto.caracore.com.br
  CaraCore CSO: caracore-cso-quarkus + caracore-cso-transportes. Aplicação: cso.caracore.com.br
  Cara Core MKT: caracore-mkt + caracore-mkt-releases (+ Sala em caracore-tools). Loja: mkt.caracore.com.br

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


Atualizado em 15/08/2026.
