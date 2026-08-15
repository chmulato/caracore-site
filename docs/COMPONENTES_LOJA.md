# Componentes padrão das lojas (vitrines GitHub Pages)

Objetivo: Todas as lojas do ecossistema Cara Core devem ter o mesmo "molde" de componentes, conforme o tipo de produto. Data: 08/08/2026.


---


## 1. COMPONENTES OBRIGATORIOS EM TODA LOJA


---


  - index.html .............. Pagina principal (hero, oferta, CTAs, links)
  - canal-feedback.html ..... Contato: e-mail, WhatsApp, Telegram (nao atendemos ligacoes)
  - .nojekyll ............... Arquivo vazio (GitHub Pages sem Jekyll)
  - Navegacao ............... Breadcrumb: Cara Core Informática → Portfólio #{ancora} → Loja
  - Portfolio ............... Link "Portfólio Cara Core" → https://www.caracore.com.br/portfolio.html#{ancora}
  - Footer legal ............ Cara Core Informática · CNPJ 23.969.028/0001-37 · www.caracore.com.br · suporte@caracore.com.br
  - Badge evo-beta .......... Sem a palavra "Seed" nem "Premium+" fora do produto Seed; usar Garagem / RC / Oficial / Dual / Interno
  - Legado .................. /delivery/{produto}/ na matriz = redirect (stub HTML); não usar como CTA
  - Espelho interno ......... mirror-delivery.html (Ink, RU, MKT, Reino OIDC) — documento de alinhamento
  - Base URL ................. Quando a vitrine esta em docs/, usar o subdominio oficial da loja (ex.: <base href="https://oidc.caracore.com.br/">)


---


## 2. COMPONENTES POR TIPO DE PRODUTO


---


  Produto com download (EXE/WAR/instalador):
    - download.html ......... Link para releases/latest ou Degustacao + Releases

  Produto com pagina de tecnologia:
    - tecnologia.html ....... Stack, arquitetura, requisitos

  Produto com licenca/ativacao/compra:
    - ativacao.html ......... Quando ha licenca por maquina (ex.: Seed)
    - compra.html ........... Ou upgrade-trono.html, licenca-uso.html, portal-escolas conforme o produto

  Produto com documentacao na vitrine:
    - readme.html ........... Ou equivalente (documentacao, requisitos, links oficiais)

  Produto com portal de controle / conteudo extra:
    - portal-controle.html .. Ou conteudo-free.html, mapas, personagens, etc. conforme o produto


---


## 3. CHECKLIST POR LOJA (MATRIZ = portfólio; LOJA = repo *-releases/docs/)


---


  CARA CORE PDV DESKTOP (JAVA)
    Matriz: portfolio.html#caracore-pdv · #pdv-coexistencia
    Oficina: caracore-pdv/
    Loja:   caracore-pdv-releases/docs/
    index  download  tecnologia  canal-feedback  wiki/  .nojekyll
    Observacao: oferta madura multi-plataforma; canal v3.2.2-free. Wiki Fiscal e trilhas comerciais na loja.

  CARACORE PDV (RUST + TAURI)
    Portfólio: caracore-site/portfolio.html#caracore-pdv-rust (resumo institucional)
    Oficina: caracore-pdv-rust/
    Loja:   caracore-pdv-rust-releases/docs/ → rust-pdv.caracore.com.br
    index  produto  mercado  download  primeiros-passos  transparencia  wiki/  .nojekyll
    Observacao: vitrine canónica do produto Rust; valor comercial da stack desktop na loja. Redirect: /delivery/pdv-rust → loja.

  CARA CORE HUB
    Matriz: portfolio.html#caracore-hub
    Loja:   caracore-hub-releases/docs/
    index  download  tecnologia  canal-feedback  slides/  .nojekyll

  CIRCUITO FERRADURA
    Matriz: portfolio.html#circuito-python
    Oficina: caracore-circuito/
    Loja:   caracore-circuito-releases/docs/
    index  download  canal-feedback  licenca-uso  portal-escolas  .nojekyll
    Observacao: curso proprietario de logica, abaco romano e Python; codigos Python devem manter apresentacao profissional em blocos <pre><code> e CSS centralizado.

  REINO OIDC
    Matriz: portfolio.html#reino-oidc
    Oficina: caracore-oidc/
    Loja:   caracore-oidc-releases/docs/
    index  download  canal-feedback  upgrade-trono  licenca-uso  conteudo-free  historia/personagens/mapas/jogos  .nojekyll
    Observacao: convite para produto Python deve apontar para Circuito Ferradura, sem textos nao navegaveis no menu superior.

  MINERADOR 4.0 / ETE
    Matriz: portfolio.html#minerador-ete
    Oficina: caracore-ete/
    Loja:   caracore-ete-releases/docs/
    index  download  canal-feedback  licenca-uso  upgrade-ouro40  wiki/  artifacts/  .nojekyll
    Observacao: loja oficial em https://ete.caracore.com.br/; evitar topbars/breadcrumbs redundantes na vitrine.

  RU SOBERANO
    Matriz: portfolio.html#caracore-ru
    Oficina: caracore-ru/
    Loja:   caracore-ru-releases/docs/
    index  download  licenca-uso  manual-tecnico  canal-feedback  wiki/  .nojekyll
    Observacao: CSS centralizado em docs/assets/css; documentos publicados em docs devem ser paginas HTML, nao Markdown.

  CARA CORE INK AGENDA
    Matriz: portfolio.html#caracore-ink-agenda
    Oficina: caracore-ink/
    Loja:   caracore-ink-releases/docs/
    index  download  tecnologia  manual  canal-feedback  artifacts/  .nojekyll
    Observacao: RC1 multiplataforma; breadcrumbs devem evitar repeticao de "Cara Core Ink Agenda - Loja" + nome do produto.

  CARA CORE SEED
    Matriz: portfolio.html#caracore-seed
    Loja:   caracore-seed-releases/docs/
    index  download  tecnologia  canal-feedback  ativacao  compra  readme  portal-controle  .nojekyll  tools/README (opcional)
    Observacao: ferramenta interna — nao a venda; badge "Interno"; sem CTAs comerciais.

  AREA 51 — IDENTIDADE INSTITUCIONAL
    Matriz: portfolio.html#area-51 + secure/ (OIDC matriz)
    Loja:   caracore-area51-releases/docs/
    index  produto  servicos  wiki  download (como comecar)  apresentacao-tecnica  licenca-uso  canal-feedback
    Oficina: caracore-area51 (baseline 0.1.0-dev)
    Observacao: produto licenciado (titularidade GF); entrega via licenca — nao download publico. Suporte Area 51 = servico contratado (niveis 2-3).

  HELIANTO CONDOMINIUM
    Matriz: portfolio.html#caracore-helianto
    Oficina: caracore-helianto/
    Loja:   caracore-helianto-releases/docs/
    index  download  canal-feedback  manual/  .nojekyll
    Observacao: vitrine; lancamento publico 30/12/2027; badge Active/Oficial (nao Seed).

  CARACORE CSO
    Matriz: portfolio.html#caracore-cso
    Oficinas: caracore-cso-frotas/ · caracore-cso-transportes/
    Loja:   sem vitrine de loja
    Aplicação: https://cso.caracore.com.br/
    Observacao: dual Frotas Web (em produção) + Transportes Desktop (08/11/2028).

  CARA CORE MKT
    Matriz: portfolio.html#caracore-mkt
    Oficina: caracore-mkt/ (+ Sala em caracore-tools)
    Loja:   caracore-mkt-releases/docs/
    index  projeto-mkt  wiki  artefato-vitrine-gratuito  canal-feedback  .nojekyll
    Observacao: oferta gratuita; Sala em tools.caracore.com.br/sala/.


---


## 4. REGRAS DE ALINHAMENTO


---


  - Toda loja deve ter no minimo: index, canal-feedback, link para matriz e portfolio.
  - Breadcrumbs e topbars devem conter apenas navegacao util; evitar repetir dominio, nome da loja e pagina atual quando isso nao ajuda o usuario.
  - Arquivos de conteudo publicados como paginas devem ser HTML; Markdown pode ficar como documentacao interna fora da vitrine publica quando necessario.
  - Quando a matriz tem uma pagina (tecnologia, readme, portal-controle, ativacao, compra, upgrade, licenca-uso), a loja deve espelhar essa pagina, salvo combinacao contraria (ex.: consultoria e wiki do PDV so na matriz).
  - Links na vitrine: usar URL absoluta para portfolio (https://www.caracore.com.br/portfolio.html) e, quando a vitrine esta em docs/, usar <base href> para que links relativos entre paginas da loja funcionem.
  - Scripts de publicacao (push/sync) devem copiar da matriz para a pasta docs/ da loja e, quando necessario, pos-processar HTML (substituir ../../portfolio por URL absoluta e garantir base href).

Referencias: VALIDACAO_LOJAS_MATRIZ.md, ECOSYSTEM_LOJAS.md e mirror-delivery.html (Ink, RU, MKT, Reino OIDC).

Cara Core Informatica - Uso interno.
