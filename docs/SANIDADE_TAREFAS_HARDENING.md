# Runbook de Sanidade â€” Hardening de ExposiÃ§Ã£o

Data: 14/03/2026  
Escopo: caracore-site (matriz + delivery + wiki)

## Objetivo

Manter uma rotina previsÃ­vel de hardening contra engenharia social e cÃ³pia oportunista, sem quebrar fluxo comercial.

## PrincÃ­pios de execuÃ§Ã£o

- Priorizar paginas de conversao/comercial antes de conteudo historico-editorial.
- Substituir links pessoais/publicos por rotas institucionais internas sempre que houver alternativa.
- Nao bloquear navegacao do usuario final: trocar endpoint, nao remover caminho.
- Evitar refatoracao visual ampla na mesma rodada de hardening.

## Ordem de ataque (sempre igual)

1. Matriz comercial: index, portfolio, ecossistema.
2. Delivery comercial ativo: pdv, oidc, hub, ink, cso, area51, circuito, ru, seed, mkt.
3. Wiki front-facing: projetos-overview, tecnologias, guias de entrada.
4. Publicacoes e historico (handbook/sala/personal/aligned) apenas em rodada dedicada.

## Checklist operacional por rodada

1. Levantar residuos:

   - grep por: caracore.com.br | caracore.com.br | chmulato/

2. Classificar achados:

   - C1: CTA comercial (alta prioridade)
   - C2: navegacao secundaria/rodape (media)
   - C3: arquivo historico/editorial (baixa)

3. Corrigir C1 e C2 primeiro:

   - Preferir links internos do proprio delivery (index/download/canal-feedback)

4. Validar novamente com grep no mesmo escopo.
5. Rodar get_errors nos arquivos alterados (somente para regressao).
6. Atualizar este runbook com data e delta da rodada.

## Padrao de substituicao recomendado

- "Ver loja (releases)" -> pagina interna `download.html` ou `index.html` do produto.
- "Releases -> Latest (GitHub)" -> "Download oficial" (link interno).
- "Loja filial" -> "Canal institucional".
- MenÃ§Ã£o a owner/namespace pessoal -> nomenclatura institucional neutra.

## Criterios de pronto da rodada

- Zero ocorrencias de owner pessoal no escopo C1/C2 tratado.
- Todos os CTAs principais continuam funcionais.
- Nenhum erro novo de sintaxe/markup nos arquivos alterados.
- Registro de execucao atualizado em "Historico de rodadas".

## Historico de rodadas

### 2026-03-14 â€” Rodada R1 (comercial ativo)

- Feito:

  - Remocao de referencias pessoais em portfolio/ecosistema e deliveries principais.
  - Fechamento adicional em RU, PDV (rodape) e MKT.

- Pendencias naturais:

  - Wiki front-facing (ex.: projetos-overview, projeto-*.html).
  - Conteudo historico/editorial (sala/personal/aligned) em trilha separada.
  - Caso estrutural: PDV download usa API de releases publicos (OWNER/REPO) para resolver instalador; migracao depende de endpoint institucional proprio.

### 2026-03-14 â€” Rodada R2 (wiki front-facing)

- Feito:
- Limpeza de links pessoais em paginas wiki de entrada e projeto: projetos-overview, tecnologias, projeto-pdv, projeto-ink, projeto-hub.
- Substituicao de CTAs para rotas internas de delivery/download/canal institucional.
- Ajuste de linguagem de licenca em pontos de wiki (remocao de mensagem open source no front-facing).

- Pendencias naturais:
- Completar trilha wiki restante (projeto-seed, projeto-reino, projeto-python, guia-estagiario e correlatas).
- Tratar acervo historico/editorial (sala/personal/aligned) em rodada dedicada.
- Resolver dependencia estrutural de endpoints publicos no JS de download do PDV (OWNER/REPO).

### 2026-03-14 â€” Rodada R3 (wiki produtos/guias remanescentes)

- Feito:
- Limpeza de links pessoais nas paginas wiki remanescentes: projeto-seed, projeto-reino, projeto-python, guia-estagiario, projeto-area51.
- Substituicao de links para rotas institucionais internas de delivery/download.
- ValidaÃ§Ã£o do escopo R3 com zero ocorrencias de owner pessoal.

- Pendencias naturais:
- Rodada dedicada para acervo historico/editorial (sala, personal, aligned, handbook/publications legadas).
- Resolver dependencia estrutural de endpoint publico no fluxo de download do PDV (variaveis OWNER/REPO no JS).

### 2026-03-14 â€” Rodada R4 (acervo editorial institucional)

- Feito:
- Limpeza de links pessoais em conteudo editorial institucional:
   - handbook/HANDBOOK.html
   - publications/livros/apostila_ms365.html
   - sala/facebook/2026_04_06_hub_lancamento.html
   - sala/redes/retro/articles/2026_02_12_article_72.html
   - sala/redes/retro/articles/2026_01_03_article_66.html
   - sala/redes/retro/articles/2025_12_02_article_61.html
- Substituicao por rotas institucionais de delivery/wiki.

- Pendencias naturais:
- Acervo editorial tecnico/historico com repositorios de referencia (sala/redes retro antigos e similares) exige curadoria por lote para preservar contexto.
- Resolver dependencia estrutural de endpoint publico no fluxo de download do PDV (variaveis OWNER/REPO no JS).

### 2026-03-14 â€” Rodada R5 (sincronizacao de espelhos editoriais)

- Feito:
- Alinhamento de copias espelhadas em `delivery/sala/redes/retro/articles` que ainda estavam com links antigos ja corrigidos em `sala/redes/retro/articles`.
- Limpeza aplicada em:
   - delivery/sala/redes/retro/articles/2026_02_12_article_72.html
   - delivery/sala/redes/retro/articles/2026_01_03_article_66.html
   - delivery/sala/redes/retro/articles/2025_12_02_article_61.html
   - delivery/sala/redes/retro/articles/2025_10_31_article_55.html
   - sala/redes/retro/articles/2025_10_31_article_55.html
- Substituicao de URLs pessoais por rotas institucionais de dominio principal/delivery.

- Pendencias naturais:
- Continuar curadoria dos artigos tecnicos/historicos restantes (`sala` e `delivery/sala`) em lotes pequenos para evitar perda de contexto.
- Resolver dependencia estrutural de endpoint publico no fluxo de download do PDV (variaveis OWNER/REPO no JS).

### 2026-03-14 â€” Rodada R6 (delivery/ete â€” fechamento comercial)

- Feito:
- Limpeza de toda a area `delivery/ete` (6 arquivos) exceto 1 residual estrutural:
   - delivery/ete/index.html â€” nav-card e rodape redirecionados para `download.html`
   - delivery/ete/canal-feedback.html â€” link externo substituido por rota interna
   - delivery/ete/termos-uso-creditos.html â€” nome "chmulato/ETE" â†’ "CaraCore ETE"
   - delivery/ete/artigo_ete_v3.html â€” 8 ocorrencias de "chmulato/ETE" â†’ "CaraCore ETE"
   - delivery/ete/laboratorio_campo_largo.html â€” og/twitter meta, title, badge, botoes, todos substituidos por URLs institucionais
- Residual estrutural intencional: delivery/ete/download.html linha 79 (releases/latest) â€” mantem link para binario ate endpoint institucional ser criado.

- Pendencias naturais:
- Prosseguir pelos passos restantes conforme backlog.

### 2026-03-14 â€” Passo 2 (sala/redes/retro/articles â€” canonico)

- Feito:
  - 11 substituicoes em 8 arquivos `sala/redes/retro/articles`:
    - 2025_09_09_article_46.html â€” repo-box `personal_articles` â†’ contato institucional
    - 2025_09_02_article_45.html â€” li `Sending_CV` + repo-box â†’ contato institucional
    - 2025_08_31_article_44.html â€” repo-box `caracore-dental.git` â†’ contato institucional
    - 2025_08_25_article_43.html â€” bash `git clone cara-core-dashboard` â†’ comentario neutro; repo-box GitHub link â†’ contato institucional
    - 2025_08_04_article_40.html â€” li + paragrafo `zeca-delivery-automation` â†’ contato institucional
    - 2025_07_16_article_39.html â€” link `Sending_CV` â†’ contato institucional
    - 2025_07_06_article_38.html â€” paragrafo + link `seo-article-builder` â†’ texto + contato institucional
    - 2025_06_15_article_35.html â€” 2 links de scripts `cara-core/tree/...` â†’ `<span>` sem href
  - Validacao pos-edicao: zero matches em `sala/redes/retro/articles/**`
  - 17 matches remanescentes confirmados em `delivery/sala/redes/retro/articles/**` (Passo 3)

- Backlog atualizado:
1. ~~Fechar `sala/redes/retro/articles` restante (8 arquivos tecnicos historicos).~~ CONCLUIDO
2. Fechar `delivery/sala/redes/retro/articles` espelhado restante (8 arquivos) â€” Passo 3.
3. Fechar `aligned/en` e `aligned/it` (14 arquivos â€” rodape/contato) â€” Passo 4.
4. Fechar `personal/articles` e `personal/index.html` (21 arquivos â€” curadoria editorial) â€” Passo 5.
5. Fechar `cv/public` (1 arquivo) â€” Passo 5.
6. Resolver bloqueio estrutural de endpoints de download (ETE download.html + PDV JS) para eliminar os 2 residuais de binario â€” Passo 6.
7. Varredura final global + baseline zero â€” Passo 6.

### 2026-03-14 â€” Passo 3 (delivery/sala/redes/retro/articles â€” espelho)

- Feito:
  - 11 substituicoes identicas ao Passo 2 nos 8 arquivos espelho `delivery/sala/redes/retro/articles`:
    - delivery/.../2025_09_09_article_46.html â€” repo-box `personal_articles` â†’ contato institucional
    - delivery/.../2025_09_02_article_45.html â€” li `Sending_CV` + repo-box â†’ contato institucional
    - delivery/.../2025_08_31_article_44.html â€” repo-box `caracore-dental.git` â†’ contato institucional
    - delivery/.../2025_08_25_article_43.html â€” bash `git clone` â†’ comentario neutro; repo-box â†’ contato
    - delivery/.../2025_08_04_article_40.html â€” li + paragrafo `zeca-delivery-automation` â†’ contato
    - delivery/.../2025_07_16_article_39.html â€” link `Sending_CV` â†’ contato institucional
    - delivery/.../2025_07_06_article_38.html â€” paragrafo + link `seo-article-builder` â†’ texto + contato
    - delivery/.../2025_06_15_article_35.html â€” 2 links de scripts `cara-core/tree/...` â†’ `<span>` sem href
  - Validacao pos-edicao: zero matches em `delivery/sala/redes/retro/articles/**`

- Backlog atualizado:
1. ~~Fechar `sala/redes/retro/articles` (8 arquivos).~~ CONCLUIDO
2. ~~Fechar `delivery/sala/redes/retro/articles` (8 arquivos).~~ CONCLUIDO
3. Fechar `aligned/en` e `aligned/it` (14 arquivos) â€” Passo 4.
4. Fechar `personal/articles` e `personal/index.html` (21 arquivos) â€” Passo 5.
5. Fechar `cv/public` (1 arquivo) â€” Passo 5.
6. Resolver bloqueio estrutural + varredura final global + baseline zero â€” Passo 6.

### 2026-03-14 â€” Passo 4 (aligned/en + aligned/it â€” rodapÃ©/contato)

- Feito:
  - 16 substituicoes em 14 arquivos (7 EN + 7 IT):
    - Footer social block (12 arquivos): LinkedIn pessoal â†’ `linkedin.com/company/cara-core/`; GitHub pessoal â†’ `www.caracore.com.br` (Ã­cone `bi-globe`)
    - en/index.html value-card section: LinkedIn pessoal â†’ company; seÃ§Ã£o GitHub â†’ Sito Web/Website
    - it/index.html value-card section: idem em italiano
    - en/contact.html contact-info-item: LinkedIn pessoal â†’ company; GitHub â†’ Website
    - it/contact.html contact-info-item: idem em italiano
  - Validacao pos-edicao: zero matches em `aligned/en/**` e `aligned/it/**`

- Backlog atualizado:
1. ~~Fechar `sala/redes/retro/articles` (8 arquivos).~~ CONCLUIDO
2. ~~Fechar `delivery/sala/redes/retro/articles` (8 arquivos).~~ CONCLUIDO
3. ~~Fechar `aligned/en` e `aligned/it` (14 arquivos).~~ CONCLUIDO
4. Fechar `personal/articles` e `personal/index.html` (21 arquivos) â€” Passo 5.
5. Fechar `cv/public` (1 arquivo) â€” Passo 5.
6. Resolver bloqueio estrutural + varredura final global + baseline zero â€” Passo 6.

### 2026-03-14 â€” Passo 5 (personal + cv/public â€” curadoria editorial)

- Feito:
  - `personal/index.html`:
    - Header e footer: LinkedIn pessoal -> `linkedin.com/company/cara-core/`
    - GitHub pessoal -> `www.caracore.com.br` (label `Website`)
  - `personal/articles` (20 arquivos):
    - Remocao/substituicao de links pessoais/repositorios para `www.caracore.com.br` ou `mailto:suporte@caracore.com.br`
    - Delink de bylines pessoais mantendo autoria textual
    - Troca de `ete.caracore.com.br/` por `../../delivery/ete/index.html`
  - `cv/public/index.html`:
    - Removido link GitHub pessoal da barra de contatos
  - `cv/public/json` (4 arquivos):
    - `portfolio` + 3 URLs de projetos substituidos por `https://www.caracore.com.br`
  - `cv/public/docs` (4 arquivos):
    - Perfil/portfolio GitHub pessoal substituido por website institucional
    - URLs de projetos pessoais substituidas por `https://www.caracore.com.br`
  - Validacao pos-edicao:
    - zero matches em `personal/**`
    - zero matches em `cv/**`

- Backlog atualizado:
1. ~~Fechar `sala/redes/retro/articles` (8 arquivos).~~ CONCLUIDO
2. ~~Fechar `delivery/sala/redes/retro/articles` (8 arquivos).~~ CONCLUIDO
3. ~~Fechar `aligned/en` e `aligned/it` (14 arquivos).~~ CONCLUIDO
4. ~~Fechar `personal/articles` e `personal/index.html` (21 arquivos).~~ CONCLUIDO
5. ~~Fechar `cv/public` (escopo publico completo).~~ CONCLUIDO
6. Resolver bloqueio estrutural de endpoints de download (ETE `download.html` + PDV JS) e executar varredura final global + baseline zero â€” Passo 6.

### 2026-03-14 â€” Passo 5.1 (aligned EN/IT â€” alinhamento institucional + LGPD)

- Feito:
  - Alinhamento espelhado EN/IT em `aligned` com a mesma taxonomia de competencias.
  - Consolidacao de blocos de hard skills e soft skills em EN e IT com aplicacao pelo time Brasil.
  - Remocao de exposicao nominal pessoal no escopo EN/IT (titulos, copy, autoria e contato).
  - Substituicao de canais pessoais por canais institucionais nas paginas de contato.
  - Ajuste de linguagem para conformidade LGPD no fluxo de contato.
  - Validacao local no escopo EN/IT sem erros de diagnostico apos edicoes.

- Registro de validacao:
  - Varredura por padroes pessoais no escopo `aligned/en/**` e `aligned/it/**` sem ocorrencias remanescentes dos identificadores tratados.
  - Revisao de consistencia EN/IT concluida para homepage, services, about, contact, articles e artigos principais.

- Proximo passo natural (sanitario):
  - Executar Passo 6 estrutural em fluxo controlado, sem quebrar UX de download.
  - Bloqueios estruturais mapeados:
    - `delivery/ete/download.html`: CTA principal ainda aponta para `github.com/.../releases/latest`.
    - `delivery/pdv/download.html`: resolver dinÃ¢mico usa `OWNER/REPO` + `api.github.com/repos/.../releases/latest` e fallback GitHub direto.

- CritÃ©rio de pronto do Passo 6:
  - Endpoint institucional de download definido e publicado (ou redirect institucional estÃ¡vel) para ETE e PDV.
  - Remocao de `OWNER/REPO`, `api.github.com/repos` e links diretos `caracore.com.br/.../releases/latest` dos fluxos C1/C2 do dominio matriz.
  - Revalidacao com grep no escopo de hardening e registro de baseline final.

### 2026-03-14 â€” Passo 7.1 (residual publico: ETE, personal, CV localizacao)

- Feito:
  - `delivery/ete/index.html`:
    - Branding institucional no titulo, breadcrumb, `h1` e `alt` do logo (`CaraCore ETE Minerador 4.0`).
  - `personal/articles/2025_08_01_lula_vs_bolsonaro_e_us_and_them_o_que_ainda_nao_entendemos_sobre_a_polarizacao.html`:
    - Removida mencao com link pessoal de terceiro (LinkedIn), mantido texto neutro de homenagem.
  - `cv/public/**` (arquivos `.json`, `.txt`, `.md`):
    - Normalizacao de localizacao publica (`Curitiba/Parana` -> `Brasil/Brazil/Brasile`, conforme idioma).
    - Normalizacao de string de instituicao com geografia explicita para rotulo neutro.
    - Ajuste de labels com `| Curitiba |` para `| Brasil |`.

- Validacao pos-edicao:
  - Escopo `personal/**`: removido residual de `linkedin.com/in/` identificado na rodada.
  - Escopo `cv/public/**`: reduzidos residuos de localizacao explicita nos artefatos de dados/documentacao publica.

- Pendencias naturais:
  - Curadoria seletiva de menÃ§Ãµes academicas historicas em `delivery/ete/**` (UFPR e referencias de homenagem), para decidir manutencao editorial x neutralizacao adicional.

### 2026-03-14 â€” Passo 6 (estrutural, fase 1 â€” saneamento de fluxo ETE/PDV)

- Feito:
  - `delivery/ete/download.html`:
    - Removido link direto para `caracore.com.br/.../releases/latest` no CTA principal.
    - CTA de download redirecionado para `canal-feedback.html` (canal institucional).
    - Texto de apoio ajustado para "canal institucional de download".
  - `delivery/pdv/download.html`:
    - Removida dependencia de `OWNER/REPO` e `api.github.com/repos/.../releases/latest` no script da pagina.
    - Removido fallback de "Latest Release" com URL direta para owner pessoal.
    - Fluxo de abertura pos-formulario alterado para `canal-feedback.html` (canal institucional).
    - Mensageria da pagina ajustada para canal institucional (sem referencia direta a GitHub Releases).

- Validacao da fase 1:
  - Nos arquivos alvo (`delivery/ete/download.html` e `delivery/pdv/download.html`), nao ha ocorrencias de:
    - `caracore.com.br`
    - `api.github.com/repos`
    - `OWNER`/`REPO` (script de resolucao de latest)
    - `releases/latest`

- Pendencia para fechamento final do Passo 6:
  - Publicar endpoint institucional definitivo de distribuicao para ETE/PDV (download direto com artefato versionado), mantendo o canal como fallback.
  - Executar varredura final global do escopo definido e registrar baseline zero da rodada.

### 2026-03-14 â€” Passo 6 (estrutural, fase 2 â€” endpoints institucionais publicados)

- Feito:
  - Endpoints institucionais de artefato publicados no dominio matriz:
    - `delivery/ete/download-oficial.html`
    - `delivery/pdv/download-oficial.html`
  - Estrategia aplicada: endpoint institucional estavel (URL controlada pela matriz) + canal institucional como fallback.

- Alinhamento aplicado nos fluxos principais:
  - `delivery/ete/download.html` agora aponta para `download-oficial.html` como rota primaria.
  - `delivery/pdv/download.html` agora usa `download-oficial.html` como endpoint primario no fluxo manual e no fluxo pos-formulario.

### 2026-03-14 â€” Passo 6 (estrutural, fase 3 â€” sweep final de escopo + baseline)

- Escopo da varredura final:
  - `delivery/ete/download*.html`
  - `delivery/pdv/download*.html`

### 2026-03-14 â€” Passo 7.2 (rodada final â€” neutralizacao academica publica)

- Feito:
  - `delivery/ru/index.html`:
    - Removidas referencias nominativas e institucionais em copy publica (`UFPR`, `Prof. Soccol`), mantendo a narrativa tecnica e a ambientacao RETRO.
  - `delivery/ete/**`:
    - `termos-uso-creditos.html`, `licenca-uso.html`, `laboratorio_campo_largo.html`, `painel-simbiotico.html`, `painel-convergencia.html`, `upgrade-ouro40.html`, `apostila_efluentes.html`
    - Referencias nominativas (`Pawlowsky`, `UFPR`) substituidas por linguagem neutra de inspiracao cientifica e legado academico.
    - Selo visual renomeado para `Selo de Qualidade Cientifica` com asset institucional (`selo_cientifico_legado.png`).
  - `delivery/oidc/**`:
    - `super_trunfo.html` + CSS/JS associados atualizados para nomenclatura neutra (`selo-cientifico`, `card-seal-cientifico`, `selo-cientifico-modal`).

- Validacao pos-edicao:
  - Zero ocorrencias de `Pawlowsky|pawlowsky|Soccol|UFPR|UTFPR` no escopo tratado:
    - `delivery/ru/**/*.{html,css,js}`
    - `delivery/ete/**/*.{html,css,js}`
    - `delivery/oidc/**/*.{html,css,js}`

- Observacao de baseline:
  - Residual historico/editorial fora do escopo final pode permanecer em acervos dedicados (`delivery/sala/**` e similares) quando o contexto do texto justificar preservacao curatorial.

- Regras validadas (zero ocorrencias no escopo):
  - `caracore.com.br`
  - `api.github.com/repos`
  - `OWNER` / `REPO`
  - `releases/latest`

- Diagnostico final do escopo alterado:
  - Sem erros nos arquivos:
    - `delivery/ete/download.html`
    - `delivery/ete/download-oficial.html`
    - `delivery/pdv/download.html`
    - `delivery/pdv/download-oficial.html`

- Baseline da rodada (escopo Passo 6):
  - CONCLUIDO para o fluxo de download ETE/PDV na matriz, com endpoint institucional publicado e fallback institucional preservado.

### 2026-03-14 â€” Passo 6 (estrutural, fase 4 â€” staging de artefatos e handoff de publicacao)

- Feito:
  - Estrutura institucional de artefatos criada e publicada:
    - `delivery/ete/artifacts/`
      - `INSTALACAO.md`
      - `checksum.sha256`
      - `checksum.md5`
    - `delivery/pdv/artifacts/`
      - `INSTALACAO.md`
      - `checksum.sha256`
      - `checksum.md5`
  - Endpoints oficiais ajustados para nao gerar link primario morto durante janela de publicacao:
    - `delivery/ete/download-oficial.html` -> CTA primario para `artifacts/INSTALACAO.md`
    - `delivery/pdv/download-oficial.html` -> CTA primario para `artifacts/INSTALACAO.md`

- Resultado operacional:
  - URLs institucionais estaveis estao ativas e com conteudo publicado.
  - Fluxo comercial permanece funcional sem exposicao de owner/API externa no caminho principal.

- Pendente para go-live binario (ultimo mile):
  - Publicar binarios reais nas rotas:
    - `/delivery/ete/artifacts/Minerador40.exe`
    - `/delivery/pdv/artifacts/CaraCorePDV.exe`
  - Atualizar `checksum.sha256` e `checksum.md5` com valores reais.
  - Opcional apos publicacao: retomar CTA primario dos endpoints oficiais para o `.exe`.

- Kit operacional adicionado para execucao rapida e auditavel:
  - Checklist central:
    - `docs/CHECKLIST_PUBLICACAO_ARTEFATOS_ETE_PDV.md`
  - Scripts de checksum por produto:
    - `delivery/ete/artifacts/publish-artifacts.ps1`
    - `delivery/pdv/artifacts/publish-artifacts.ps1`

### 2026-03-14 â€” Passo 6 (estrutural, fase 5 â€” go-live binario concluido)

- Feito:
  - Binarios publicados no dominio matriz:
    - `/delivery/ete/artifacts/Minerador40.exe`
    - `/delivery/pdv/artifacts/CaraCorePDV.exe`
  - Checksums reais publicados (SHA-256 e MD5) para ETE e PDV.
  - Endpoints oficiais confirmados com CTA primario para `.exe`:
    - `delivery/ete/download-oficial.html`
    - `delivery/pdv/download-oficial.html`

- Evidencia tecnica (SHA-256):
  - `Minerador40.exe`: `29E0E1E23B74354E5DF62FD08EBA2BBE7A30F261BA43FBB78333005A9B0EF954`
  - `CaraCorePDV.exe`: `17D6F179AA456442DCB21596AF034FC12557BAA6737A838C0E64FCE118C592D9`

- Resultado final do Passo 6:
  - Fluxo de download ETE/PDV no dominio matriz finalizado com endpoint institucional direto.
  - Fallback institucional (`canal-feedback.html`) preservado.
  - Sem reintroducao de owner pessoal/API externa/release latest no caminho principal C1/C2 tratado.

### 2026-03-14 â€” Passo 6 (estrutural, fase 6 â€” hardening de distribuicao remota segura)

- Motivo:
  - Entrega publica direta de executavel (`.exe`) aumenta superficie de risco para ambientes remotos.

- Ajuste aplicado:
  - Endpoints oficiais (`delivery/ete/download-oficial.html` e `delivery/pdv/download-oficial.html`) migrados para fluxo de solicitacao de entrega segura via canal institucional.
  - CTAs primarios de download direto removidos do front oficial.
  - Guia tecnico e checksums permanecem publicados para validacao de integridade e auditoria.

- Regra operacional nova:
  - Modo padrao: entrega controlada (sem link publico direto para `.exe`).
  - Excecao controlada: habilitacao de `.exe` publico somente com acao explicita (`-AllowPublicExe`) no script de finalizacao.

### 2026-03-14 â€” Passo 6 (estrutural, fase 7 â€” sincronizacao das vitrines de apps)

- Feito:
  - Vitrines de apps em `delivery` alinhadas com a politica comercial institucional:
    - Free liberado sem cobranca para avaliacao.
    - Premium liberado somente apos confirmacao de pagamento.
    - Registro LGPD obrigatorio para entrega/ativacao.
  - Ajustes aplicados em vitrines com fluxo Free/Premium:
    - `delivery/pdv/index.html`
    - `delivery/ete/index.html`
    - `delivery/oidc/index.html`
    - `delivery/oidc/download.html`
    - `delivery/ru/index.html`
  - Modelo operacional de registro criado em:
    - `docs/REGISTRO_LGPD_ENTREGA_CLIENTES.md`

- Resultado:
  - Narrativa comercial e operacional unificada nas vitrines principais do delivery.
  - Fluxo de entrega Premium condicionado a confirmacao financeira e trilha LGPD.

### 2026-03-14 â€” Passo 6 (estrutural, fase 8 â€” sincronizacao da Garagem)

- Feito:
  - Alinhamento da secao Garagem na matriz com a politica institucional Free/Premium + LGPD.
  - Ajustes aplicados em:
    - `ecosistema.html` (secao `#garagem`, com regra institucional explicita)
    - `delivery/hub/index.html`
    - `delivery/ink/index.html`
    - `delivery/cso/index.html`
    - `delivery/area51/index.html`
  - Regra refletida nas paginas de Garagem:
    - Free sem cobranca para avaliacao (quando aplicavel)
    - Premium somente apos confirmacao de pagamento
    - Registro LGPD de atendimento e auditoria

- Resultado:
  - Matriz (Garagem) e vitrines correspondentes sincronizadas com a politica comercial e de privacidade.

### 2026-03-14 â€” Passo 6 (estrutural, fase 9 â€” propagacao para wiki/projetos)

- Feito:
  - Propagacao da mesma regra institucional para paginas de wiki e overview com trilha Free/Premium.
  - Arquivos atualizados:
    - `wiki/projetos-overview.html`
    - `wiki/projeto-pdv.html`
    - `wiki/projeto-minerador.html`
    - `wiki/projeto-reino.html`
    - `wiki/tecnologias.html`

- Regra aplicada:
  - Free sem cobranca para avaliacao (quando aplicavel)
  - Premium somente apos confirmacao de pagamento
  - Registro LGPD de atendimento e auditoria

- Resultado:
  - Matriz, vitrines e wiki sincronizados na narrativa comercial e de privacidade.

### 2026-03-14 â€” Passo 6 (estrutural, fase 10 â€” sincronizacao ampliada das vitrines delivery)

- Feito:
  - Sincronizacao das vitrines restantes do delivery com a mesma politica institucional.
  - Arquivos atualizados:
    - `delivery/seed/index.html`
    - `delivery/mkt/index.html`
    - `delivery/circuito/index.html`
    - `delivery/sala/index.html`
    - `delivery/oidc/index.html`

- Regra aplicada:
  - Quando houver trilha Free/Premium no ecossistema:
    - Free sem cobranca para avaliacao
    - Premium somente apos confirmacao de pagamento
    - Registro LGPD de atendimento e auditoria
  - Produtos internos (Seed/Mkt/Sala) mantidos como nao comercializados, com referencia explicita a regra institucional para produtos aplicaveis.

- Resultado:
  - Vitrines de delivery alinhadas de ponta a ponta com a narrativa comercial e de privacidade da matriz.

### 2026-03-14 â€” Fechamento do dia (seguranca operacional + baseline final)

- Validacoes finais executadas:
  - Escopo estrutural de download ETE/PDV revalidado com zero ocorrencias para:
    - `api.github.com/repos`
    - `caracore.com.br/.../releases/latest`
    - `OWNER` / `REPO` no fluxo principal
  - OWASP Dependency-Check mais recente no CSO sem vulnerabilidades reportadas (`NO_VULNERABILITIES_FOUND`).
  - Governanca de licencas mantida com cobertura de LICENSE de raiz em 100% dos repositorios auditados.

- Estado de fechamento:
  - Job de seguranca do dia concluido no escopo definido (matriz/delivery/wiki + trilha estrutural de downloads).
  - Risco residual classificado como baixo e operacional (monitoramento continuo, sem bloqueio para operacao).

- Proxima rotina recomendada (D+1):
  - Repetir varredura curta de hardening apos qualquer alteracao em paginas de download/comercial.
  - Executar dependency-check por projeto critico antes de publicacao de release.

### 2026-03-14 â€” Passo 7 (hardening de exposicao no CV publico)

- Feito:
  - Escopo institucionalizado em `cv/public` com remocao de canais pessoais e identificadores nominais diretos.
  - Arquivos atualizados:
    - `cv/public/index.html`
    - `cv/public/js/script.js`
    - `cv/public/css/style.css`
    - `cv/public/lang/pt.json`
    - `cv/public/lang/en.json`
    - `cv/public/lang/it.json`
    - saneamento textual em `cv/public/json/**` e `cv/public/docs/**`
  - Ajustes aplicados:
    - Contato publico padronizado para canal institucional (`suporte@caracore.com.br` + `www.caracore.com.br`).
    - Nome exibido no front e no PDF padronizado para `Cara Core`.
    - Remocao de referencias sensiveis de exposicao (identificadores pessoais, links pessoais, marcadores academicos/geograficos explicitos no escopo publico).
    - Correcao de seguranca no link externo com `rel="noopener"`.

- Validacao:
  - Varredura no escopo `cv/public/**` com zero ocorrencias para padroes sensiveis:
    - `chmulato`, `chmulato@hotmail.com`, `linkedin.com/in/chmulato`
    - `UFPR`, `UTFPR`
    - `Relocation`, `(Brasil)` e variantes geograficas tratadas
  - Diagnostico sem erros nos arquivos alterados principais (`index.html`, `style.css`).

- Proximo passo natural:
  - Executar varredura global final do repositorio para fechamento de baseline consolidada da rodada atual.

