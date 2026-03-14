# Runbook de Sanidade — Hardening de Exposição

Data: 14/03/2026  
Escopo: caracore-site (matriz + delivery + wiki)

## Objetivo

Manter uma rotina previsível de hardening contra engenharia social e cópia oportunista, sem quebrar fluxo comercial.

## Princípios de execução

- Priorizar paginas de conversao/comercial antes de conteudo historico-editorial.
- Substituir links pessoais/publicos por rotas institucionais internas sempre que houver alternativa.
- Nao bloquear navegacao do usuario final: trocar endpoint, nao remover caminho.
- Evitar refatoracao visual ampla na mesma rodada de hardening.

## Ordem de ataque (sempre igual)

1. Matriz comercial: index, portfolio, ecossistema.
2. Delivery comercial ativo: pdv, oidc, hub, ink, cso, area51, circuito, ru, seed, mkt.
3. Wiki front-facing: projetos-overview, tecnologias, guias de entrada.
4. Publicacoes e historico (handbook/sala/personal/moving_to_ch) apenas em rodada dedicada.

## Checklist operacional por rodada

1. Levantar residuos:

   - grep por: github.com/chmulato | chmulato.github.io | chmulato/

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
- Menção a owner/namespace pessoal -> nomenclatura institucional neutra.

## Criterios de pronto da rodada

- Zero ocorrencias de owner pessoal no escopo C1/C2 tratado.
- Todos os CTAs principais continuam funcionais.
- Nenhum erro novo de sintaxe/markup nos arquivos alterados.
- Registro de execucao atualizado em "Historico de rodadas".

## Historico de rodadas

### 2026-03-14 — Rodada R1 (comercial ativo)

- Feito:

  - Remocao de referencias pessoais em portfolio/ecosistema e deliveries principais.
  - Fechamento adicional em RU, PDV (rodape) e MKT.

- Pendencias naturais:

  - Wiki front-facing (ex.: projetos-overview, projeto-*.html).
  - Conteudo historico/editorial (sala/personal/moving_to_ch) em trilha separada.
  - Caso estrutural: PDV download usa API de releases publicos (OWNER/REPO) para resolver instalador; migracao depende de endpoint institucional proprio.

### 2026-03-14 — Rodada R2 (wiki front-facing)

- Feito:
- Limpeza de links pessoais em paginas wiki de entrada e projeto: projetos-overview, tecnologias, projeto-pdv, projeto-ink, projeto-hub.
- Substituicao de CTAs para rotas internas de delivery/download/canal institucional.
- Ajuste de linguagem de licenca em pontos de wiki (remocao de mensagem open source no front-facing).

- Pendencias naturais:
- Completar trilha wiki restante (projeto-seed, projeto-reino, projeto-python, guia-estagiario e correlatas).
- Tratar acervo historico/editorial (sala/personal/moving_to_ch) em rodada dedicada.
- Resolver dependencia estrutural de endpoints publicos no JS de download do PDV (OWNER/REPO).

### 2026-03-14 — Rodada R3 (wiki produtos/guias remanescentes)

- Feito:
- Limpeza de links pessoais nas paginas wiki remanescentes: projeto-seed, projeto-reino, projeto-python, guia-estagiario, projeto-area51.
- Substituicao de links para rotas institucionais internas de delivery/download.
- Validação do escopo R3 com zero ocorrencias de owner pessoal.

- Pendencias naturais:
- Rodada dedicada para acervo historico/editorial (sala, personal, moving_to_ch, handbook/publications legadas).
- Resolver dependencia estrutural de endpoint publico no fluxo de download do PDV (variaveis OWNER/REPO no JS).

### 2026-03-14 — Rodada R4 (acervo editorial institucional)

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

### 2026-03-14 — Rodada R5 (sincronizacao de espelhos editoriais)

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

### 2026-03-14 — Rodada R6 (delivery/ete — fechamento comercial)

- Feito:
- Limpeza de toda a area `delivery/ete` (6 arquivos) exceto 1 residual estrutural:
   - delivery/ete/index.html — nav-card e rodape redirecionados para `download.html`
   - delivery/ete/canal-feedback.html — link externo substituido por rota interna
   - delivery/ete/termos-uso-creditos.html — nome "chmulato/ETE" → "CaraCore ETE"
   - delivery/ete/artigo_ete_v3.html — 8 ocorrencias de "chmulato/ETE" → "CaraCore ETE"
   - delivery/ete/laboratorio_campo_largo.html — og/twitter meta, title, badge, botoes, todos substituidos por URLs institucionais
- Residual estrutural intencional: delivery/ete/download.html linha 79 (releases/latest) — mantem link para binario ate endpoint institucional ser criado.

- Pendencias naturais:
- Prosseguir pelos passos restantes conforme backlog.

### 2026-03-14 — Passo 2 (sala/redes/retro/articles — canonico)

- Feito:
  - 11 substituicoes em 8 arquivos `sala/redes/retro/articles`:
    - 2025_09_09_article_46.html — repo-box `personal_articles` → contato institucional
    - 2025_09_02_article_45.html — li `Sending_CV` + repo-box → contato institucional
    - 2025_08_31_article_44.html — repo-box `caracore-dental.git` → contato institucional
    - 2025_08_25_article_43.html — bash `git clone cara-core-dashboard` → comentario neutro; repo-box GitHub link → contato institucional
    - 2025_08_04_article_40.html — li + paragrafo `zeca-delivery-automation` → contato institucional
    - 2025_07_16_article_39.html — link `Sending_CV` → contato institucional
    - 2025_07_06_article_38.html — paragrafo + link `seo-article-builder` → texto + contato institucional
    - 2025_06_15_article_35.html — 2 links de scripts `cara-core/tree/...` → `<span>` sem href
  - Validacao pos-edicao: zero matches em `sala/redes/retro/articles/**`
  - 17 matches remanescentes confirmados em `delivery/sala/redes/retro/articles/**` (Passo 3)

- Backlog atualizado:
1. ~~Fechar `sala/redes/retro/articles` restante (8 arquivos tecnicos historicos).~~ CONCLUIDO
2. Fechar `delivery/sala/redes/retro/articles` espelhado restante (8 arquivos) — Passo 3.
3. Fechar `moving_to_ch/en` e `moving_to_ch/it` (14 arquivos — rodape/contato) — Passo 4.
4. Fechar `personal/articles` e `personal/index.html` (21 arquivos — curadoria editorial) — Passo 5.
5. Fechar `cv/public` (1 arquivo) — Passo 5.
6. Resolver bloqueio estrutural de endpoints de download (ETE download.html + PDV JS) para eliminar os 2 residuais de binario — Passo 6.
7. Varredura final global + baseline zero — Passo 6.

### 2026-03-14 — Passo 3 (delivery/sala/redes/retro/articles — espelho)

- Feito:
  - 11 substituicoes identicas ao Passo 2 nos 8 arquivos espelho `delivery/sala/redes/retro/articles`:
    - delivery/.../2025_09_09_article_46.html — repo-box `personal_articles` → contato institucional
    - delivery/.../2025_09_02_article_45.html — li `Sending_CV` + repo-box → contato institucional
    - delivery/.../2025_08_31_article_44.html — repo-box `caracore-dental.git` → contato institucional
    - delivery/.../2025_08_25_article_43.html — bash `git clone` → comentario neutro; repo-box → contato
    - delivery/.../2025_08_04_article_40.html — li + paragrafo `zeca-delivery-automation` → contato
    - delivery/.../2025_07_16_article_39.html — link `Sending_CV` → contato institucional
    - delivery/.../2025_07_06_article_38.html — paragrafo + link `seo-article-builder` → texto + contato
    - delivery/.../2025_06_15_article_35.html — 2 links de scripts `cara-core/tree/...` → `<span>` sem href
  - Validacao pos-edicao: zero matches em `delivery/sala/redes/retro/articles/**`

- Backlog atualizado:
1. ~~Fechar `sala/redes/retro/articles` (8 arquivos).~~ CONCLUIDO
2. ~~Fechar `delivery/sala/redes/retro/articles` (8 arquivos).~~ CONCLUIDO
3. Fechar `moving_to_ch/en` e `moving_to_ch/it` (14 arquivos) — Passo 4.
4. Fechar `personal/articles` e `personal/index.html` (21 arquivos) — Passo 5.
5. Fechar `cv/public` (1 arquivo) — Passo 5.
6. Resolver bloqueio estrutural + varredura final global + baseline zero — Passo 6.

### 2026-03-14 — Passo 4 (moving_to_ch/en + moving_to_ch/it — rodapé/contato)

- Feito:
  - 16 substituicoes em 14 arquivos (7 EN + 7 IT):
    - Footer social block (12 arquivos): LinkedIn pessoal → `linkedin.com/company/cara-core/`; GitHub pessoal → `www.caracore.com.br` (ícone `bi-globe`)
    - en/index.html value-card section: LinkedIn pessoal → company; seção GitHub → Sito Web/Website
    - it/index.html value-card section: idem em italiano
    - en/contact.html contact-info-item: LinkedIn pessoal → company; GitHub → Website
    - it/contact.html contact-info-item: idem em italiano
  - Validacao pos-edicao: zero matches em `moving_to_ch/en/**` e `moving_to_ch/it/**`

- Backlog atualizado:
1. ~~Fechar `sala/redes/retro/articles` (8 arquivos).~~ CONCLUIDO
2. ~~Fechar `delivery/sala/redes/retro/articles` (8 arquivos).~~ CONCLUIDO
3. ~~Fechar `moving_to_ch/en` e `moving_to_ch/it` (14 arquivos).~~ CONCLUIDO
4. Fechar `personal/articles` e `personal/index.html` (21 arquivos) — Passo 5.
5. Fechar `cv/public` (1 arquivo) — Passo 5.
6. Resolver bloqueio estrutural + varredura final global + baseline zero — Passo 6.
