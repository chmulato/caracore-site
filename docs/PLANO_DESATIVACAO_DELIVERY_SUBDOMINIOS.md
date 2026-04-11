# Plano de Remodelagem por Fases
## Desativação de Redundância em Delivery e Consolidação nos Subdomínios

**Fontes canónicas (Sala vs lojas vs matriz):** `docs/FONTES_CANONICAS_MATRIZ_LOJAS.md` — ler antes de duplicar conteúdo entre pastas.

**Enunciado do plano:** na matriz, **`delivery/` é camada de legado** (URLs antigas); o tráfego e a informação **oficial de produto** devem ir para as **respetivas lojas** por subdomínio. A matriz não é a vitrine de produto — ver §1.0 em `FONTES_CANONICAS_MATRIZ_LOJAS.md`.

**Estado-alvo:** **não precisar da pasta `delivery/`** no repositório (`caracore-site/delivery`): eliminar a pasta depois de redirects no hospedeiro cobrirem o mapa e de `assets`/`publications` estarem resolvidos — ver **`docs/FONTES_CANONICAS_MATRIZ_LOJAS.md` §1.0a**.

## 1. Objetivo
Eliminar a duplicidade entre matriz (delivery) e lojas por subdomínio, mantendo:
- continuidade de acesso para links antigos
- integridade comercial e SEO
- manutenção mais simples (fonte única por produto)

## 2. Escopo
Produtos com subdomínio ativo:
- pdv.caracore.com.br
- hub.caracore.com.br
- circuito.caracore.com.br
- oidc.caracore.com.br
- seed.caracore.com.br
- area51.caracore.com.br
- ru.caracore.com.br
- cso.caracore.com.br
- ink.caracore.com.br
- ete.caracore.com.br
- mkt.caracore.com.br

Fora de escopo inicial:
- exclusão física imediata de arquivos delivery
- mudanças estruturais em produtos sem subdomínio estável

## 3. Princípios de arquitetura
Detalhe e tabela de “onde vive cada coisa”: **`docs/FONTES_CANONICAS_MATRIZ_LOJAS.md`**.

Resumo:
- **Sala de Operações:** canónica em `sala/` na raiz do `caracore-site` → `https://www.caracore.com.br/sala/`; `delivery/sala/` não existe no repo (redirects no hospedeiro).
- **Fonte única de produto:** subdomínio + repositório `*-releases` correspondente.
- **Matriz:** institucional, portfólio e roteamento.
- **Delivery:** camada de compatibilidade (redirects), não vitrine nem acervo editorial.
- Toda rota pública antiga deve ter destino explícito (`MAPA_ROTAS_*`).

Regra operacional:
- Conteúdo de vitrine, wiki e material comercial de cada produto vive no `-releases` e na loja; a matriz não duplica esse conteúdo como fonte principal.

## 4. Modelo de execução por ciclos
Cada ciclo fecha com evidência e gate de aprovação.

### Ciclo 0 - Preparação e baseline
Objetivo:
- congelar baseline atual
- mapear dependências e risco de quebra

Ações:
- inventário de páginas em delivery por produto
- inventário de referências para delivery em todo o repositório
- mapa rota antiga -> rota nova (subdomínio)
- definição de janela de compatibilidade (ex.: 90 dias)

Entregáveis:
- matriz de roteamento de migração
- lista de páginas críticas (top tráfego e campanha)
- checklist de rollback

Gate:
- 100% das rotas delivery principais têm destino mapeado

Status do ciclo 0 (2026-04-04):
- concluido: baseline por produto
- concluido: mapa de rotas criticas por arquivo
- concluido: priorizacao por impacto (P0 a P3)
- concluido: janela de compatibilidade definida em 90 dias
- concluido: estrategia de rollback por produto definida

Decisoes operacionais do ciclo 0:
- SLA de redirect: 90 dias corridos por produto apos ativacao
- Sequencia de execucao:
	- P0: pdv, hub, ink
	- P1: seed, ete, oidc
	- P2: circuito
	- P3: area51, ru, cso, mkt
- Rollback padrao por produto:
	- desativar redirect somente do produto impactado
	- restaurar entrypoint legado e CTAs da matriz desse produto
	- validar links publicos antes de novo rollout

### Ciclo 1 - Canonização da navegação da matriz
Objetivo:
- remover dependência funcional de delivery nas páginas públicas principais

Ações:
- atualizar CTAs da matriz para subdomínios
- manter somente links institucionais para matriz
- validar links quebrados nas páginas públicas

Entregáveis:
- páginas públicas sem CTA de produto para delivery
- relatório de links válidos

Gate:
- zero links ativos de funil comercial para delivery na matriz

### Ciclo 2 - Redirecionamento de compatibilidade (soft deprecaton)
Objetivo:
- preservar acesso legado sem manter conteúdo duplicado

Ações:
- transformar entrypoints de delivery em páginas de redirecionamento
- redirecionamento por produto para o subdomínio correto
- banner de descontinuação em páginas remanescentes

Entregáveis:
- rota /delivery/produto/ redirecionando para subdomínio
- tabela de redirecionamentos aplicada

Gate:
- 100% das rotas de entrada de delivery redirecionando corretamente

### Ciclo 3 - Migração de conteúdo e corte de duplicidade
Objetivo:
- retirar conteúdo de produto da matriz delivery

Ações:
- migrar vitrines e wiki de produto para o repositório `-releases` correspondente
- manter na matriz somente resumo institucional e links para subdomínio
- remover páginas duplicadas de venda/download/wiki já cobertas em `-releases`
- preservar histórico em área de arquivo quando necessário

Entregáveis:
- estrutura delivery reduzida para compatibilidade e acervo
- conteúdo comercial concentrado em subdomínios

Gate:
- não existe conteúdo comercial duplicado entre matriz e subdomínio

### Ciclo 4 - SEO, observabilidade e hardening
Objetivo:
- estabilizar tráfego e operação após transição

Ações:
- revisar canonical/robots/sitemap
- monitorar 404 e cadeias de redirecionamento
- revisar campanhas e materiais externos

Entregáveis:
- relatório de saúde pós-migração
- backlog de ajustes finos

Gate:
- sem regressão relevante em tráfego orgânico e conversão
- 404 de rotas delivery em patamar controlado

### Ciclo 5 - Fechamento e operação contínua
Objetivo:
- instituir padrão permanente de manutenção

Ações:
- formalizar política: produto vive no subdomínio
- criar checklist de publicação único
- remover artefatos transitórios não mais necessários

Entregáveis:
- runbook final de manutenção
- checklist operacional por produto

Gate:
- governança publicada e aplicada em todas as frentes

## 5. Checklist operacional por produto
Para cada produto:
- validar subdomínio ativo e íntegro
- confirmar CNAME no repositório releases
- mapear rotas delivery antigas
- configurar redirecionamento da rota base delivery
- revisar CTAs na matriz e portfólio
- validar download, licença e canal de feedback no subdomínio
- registrar evidência de validação

## 6. Matriz de risco
Risco 1: quebra de links antigos
- Mitigação: redirecionamento por 90 dias + monitoramento 404

Risco 2: divergência de conteúdo entre matriz e loja
- Mitigação: fonte única por produto no subdomínio

Risco 3: perda de contexto institucional
- Mitigação: matriz mantém resumo e contexto de portfólio

Risco 4: queda de SEO
- Mitigação: canonical, sitemap e monitoramento por ciclo

## 7. Critérios de conclusão (ciclo final)
- matriz sem conteúdo comercial redundante de produto
- subdomínios como único ponto de produto
- delivery atuando apenas como compatibilidade/acervo (ou removido por completo)
- monitoramento pós-migração estável
- processo de manutenção simplificado e documentado

## 8. Próximo passo recomendado
Iniciar Ciclo 0 com a criação do arquivo de mapeamento rota antiga -> destino novo, produto por produto.

## 9. Cronograma e execução
Documentos de execução desta remodelagem:
- Cronograma: docs/CRONOGRAMA_REMODELAGEM_DELIVERY.md
- Checklist: docs/CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md
- Mapa de rotas: docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md
- Matriz de migracao de conteudo: docs/MATRIZ_MIGRACAO_CONTEUDO_PARA_RELEASES.md

Status de início:
- Ciclo 0 iniciado
- Baseline de inventário por produto registrado
- Mapeamento base de rotas legado -> subdomínio registrado

## 10. Status atual de execucao (2026-04-04)
- Ciclo 0: concluido.
- Ciclo 1: concluido (matriz canonizada para subdominios oficiais).
- Ciclo 2: concluido (rotas de entrada em `delivery/{produto}` com redirecionamento para subdominios).
- Ciclo 3: concluido (wiki e conteudo comercial de produto concentrados em `*-releases`).
- Estado da matriz (`caracore-site`): institucional e de roteamento; sem ownership de wiki de produto.
- Proximo foco: Ciclo 4 (SEO, observabilidade e hardening) e Ciclo 5 (fechamento operacional).
