# Validação — lojas alinhadas com a matriz

Objetivo: Verificar alinhamento entre a **matriz institucional** (caracore.com.br) e as **lojas canónicas** (*.caracore.com.br). A matriz apresenta e encaminha; a loja é a fonte de vitrine, download e documentação comercial.

**Última actualização:** 2026-06-07  
**Referências:** ECOSYSTEM_LOJAS.md · ECOSYSTEM_CARA_CORE.md · COMPONENTES_LOJA.md · docs/FONTES_CANONICAS_MATRIZ_LOJAS.md · docs/SITE_MATRIZ.md


---


MODELO ACTUAL (desde 2026)

  Matriz (caracore-site)
    index.html (#engenharia-b2b) · portfolio.html (#decisoes-engenharia) · ecosistema.html
    CTAs → subdomínio da loja (nunca /delivery/ como destino principal)
    _redirects: /delivery/{produto}/* → loja

  Loja (caracore-*-releases)
    Fonte oficial de produto, download, wiki, feedback
    Identidade visual própria por produto (§1.0b FONTES_CANONICAS)

  Legado delivery/
    Stubs HTML mínimos (GitHub Pages) + _redirects / vercel.json
    PDV Rust: redirect → rust-pdv.caracore.com.br

  Pós-deploy 2026-05-31
    52/52 rotas críticas /delivery/* OK em produção (smoke test)
    Portfólio: #pdv-coexistencia, #filosofia-bunker, releases activos
    rust-pdv.caracore.com.br: 200, sem SEED
    Lojas: footers com link portfolio.html#{produto} (2026-05-31)


---


CHECKLIST POR PRODUTO

Para cada linha: (M) matriz · (L) loja · OK / rever


## 1. CARACORE PDV DESKTOP (JAVA)

   (M) portfolio.html#caracore-pdv · ecosistema.html
   (L) caracore-pdv-releases → pdv.caracore.com.br · v3.2.2-free
   Mensagem: dois PDVs desktop; Java = canal maduro multi-plataforma
   Coexistência: #pdv-coexistencia no portfólio
   Status: OK — rever após cada release Java


## 2. CARA CORE PDV DESKTOP (RUST + TAURI 2)

   (M) portfolio.html#caracore-pdv-rust · #pdv-coexistencia
   (L) caracore-pdv-rust-releases → rust-pdv.caracore.com.br · v0.1.2
   (R) github.com/chmulato/caracore-rust-pdv-releases/releases — download oficial
   Sem delivery/pdv-rust · sem SEED na loja Rust
   Status: OK — piloto multi-OS; CTAs matriz → GitHub Releases; loja = vitrine


## 3. INK AGENDA

   (M) portfolio.html#caracore-ink-agenda
   (L) caracore-ink-releases → ink.caracore.com.br · v2.0.0
   Status: OK


## 4. CARA CORE HUB

   (M) portfolio.html#caracore-hub
   (L) caracore-hub-releases → hub.caracore.com.br
   Status: OK


## 5. CIRCUITO FERRADURA

   (M) portfolio.html#circuito-python
   (L) caracore-circuito-releases → circuito.caracore.com.br
   Oficina: caracore-circuito
   Status: OK


## 6. REINO OIDC

   (M) portfolio.html#reino-oidc
   (L) caracore-oidc-releases → oidc.caracore.com.br · v2.0.0-RC1
   Oficina: caracore-oidc
   Status: OK


## 7. CARACORE SEED

   (M) portfolio.html#caracore-seed
   (L) caracore-seed-releases → seed.caracore.com.br
   Mensagem: ferramenta interna; app não disponível
   Status: OK


## 8. SUPORTE ÁREA 51

   (M) portfolio.html#area-51
   (L) caracore-area51-releases → area51.caracore.com.br
   Status: OK


## 9. MINERADOR 4.0 (ETE)

   (M) portfolio.html#minerador-ete · ecosistema.html
   (L) caracore-ete-releases → ete.caracore.com.br
   Oficina: caracore-ete
   Status: OK


## 10. RU SOBERANO (garagem)

    (M) portfolio.html#caracore-ru · ecosistema.html (Garagem)
    (L) caracore-ru-releases → ru.caracore.com.br
    Oficina: caracore-ru · lançamento previsto 18/06/2027
    Status: OK — matriz via portfólio (não delivery/ru)


## 11. CARA CORE CSO (garagem)

    (M) portfolio.html#caracore-cso
    Aplicação: https://cso.caracore.com.br/
    Oficinas: caracore-cso-frotas · caracore-cso-transportes
    Lançamento previsto 08/11/2028 (Transportes); Frotas em produção
    Status: OK — CTAs da matriz apontam para a aplicação


## 12. CARA CORE MKT / SALA

    (M) portfolio.html#caracore-mkt
    (L) mkt.caracore.com.br · Sala: tools.caracore.com.br/sala/
    Status: OK


---


CRITÉRIOS DE VALIDAÇÃO (aplicar em revisão periódica)

  Estrutura
    [ ] Loja tem páginas mínimas do molde (COMPONENTES_LOJA.md)
    [ ] Matriz tem bloco no portfólio com CTAs para a loja

  Mensagem
    [ ] Versão/release coerente entre portfólio (#portfolio-releases), ecossistema e loja
    [ ] PDV: coexistência Java/Rust só em #pdv-coexistencia (sem repetir em excesso)

  Links
    [ ] Nenhum CTA novo aponta para /delivery/{produto}/ como destino principal
    [ ] Breadcrumb / nav da loja referencia matriz (portfolio ou ecossistema) quando aplicável
    [ ] Redirects _redirects testados se URL legado mudou

  Discurso PDV
    [ ] Dois PDVs desktop; nenhum substitui o outro
    [ ] v3.2.x = Java · v0.1.x = Rust · evitar "PDV v3" sozinho


---


RESUMO

  Todos os produtos listados devem ter: resumo na matriz (portfólio/ecossistema) + vitrine na loja.
  Espelho interno: `mirror-delivery.html` nas lojas Ink, RU e MKT; demais produtos — footer com portfolio.html#{produto}.

  Smoke test pós-alteração:
    home → portfólio → ecossistema → loja de um produto → voltar à matriz


---


Cara Core Informática — uso interno. CNPJ 23.969.028/0001-37
