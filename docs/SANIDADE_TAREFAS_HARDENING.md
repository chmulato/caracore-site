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

## Backlog curto (proxima rodada)

1. Curadoria por lote no acervo tecnico/historico (sala/redes retro) preservando contexto.
2. Definir estrategia para endpoint institucional de releases (eliminar dependencia de owner pessoal no JS do download).
3. Executar varredura final por dominio/owner pessoal em todo o site e consolidar baseline.
