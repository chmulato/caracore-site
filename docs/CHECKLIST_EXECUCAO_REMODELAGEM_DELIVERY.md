# Checklist de Execucao
## Remodelagem Delivery -> Subdominios

## Ciclo 0 - Preparacao e baseline
- [x] Criar plano de fases
- [x] Criar cronograma de execucao
- [x] Inventariar pastas por produto em delivery
- [x] Levantar baseline de volume por produto (arquivos)
- [x] Criar mapa inicial rota antiga -> subdominio
- [x] Mapear paginas criticas (top trafego/campanha)
- [x] Definir janela formal de compatibilidade (SLA de redirect)
- [x] Definir estrategia de rollback por produto

## Ciclo 1 - Canonizacao da matriz
- [x] Remover CTAs de produto para /delivery/*
- [x] Direcionar CTAs para subdominios oficiais
- [x] Direcionar links da wiki para subdominios oficiais
- [x] Validar links quebrados em paginas publicas
- [x] Aprovar gate: zero links comerciais para /delivery/*

## Ciclo 2 - Redirecionamento
- [x] Criar pagina padrao de redirecionamento por produto
- [x] Aplicar redirect em /delivery/{produto}/
- [x] Validar navegacao em desktop/mobile
- [x] Aprovar gate: redirects funcionando nas rotas principais

## Ciclo 3 - Corte de duplicidade
- [x] Migrar vitrines do produto para repo `-releases` correspondente
- [x] Migrar wiki de produto para repo `-releases` correspondente
- [x] Migrar texto comercial para fonte unica (subdominio)
- [x] Reduzir delivery a compatibilidade/acervo
- [x] Revisar conteudo duplicado remanescente
- [x] Aprovar gate: sem duplicidade comercial ativa

## Ciclo 4 - SEO e observabilidade
- [ ] Atualizar canonical/sitemap
- [ ] Monitorar 404 e redirecionamentos em cadeia
- [ ] Revisar campanhas com links antigos
- [ ] Aprovar gate: estabilidade de trafego e conversao

## Ciclo 5 - Fechamento
- [ ] Publicar runbook operacional final
- [ ] Publicar checklist de manutencao permanente
- [ ] Encerrar artefatos transitorios
- [ ] Aprovar gate final

## Baseline do inventario (iniciado)
- area51: 9 arquivos
- circuito: 32 arquivos
- cso: 5 arquivos
- ete: 68 arquivos
- hub: 56 arquivos
- ink: 8 arquivos
- mkt: 10 arquivos
- oidc: 59 arquivos
- pdv: 52 arquivos
- ru: 10 arquivos
- seed: 15 arquivos

## Decisoes fechadas do Ciclo 0
- Janela de compatibilidade (SLA): 90 dias corridos apos ativacao dos redirects por produto.
- Ordem de execucao por impacto: P0 (pdv, hub, ink) -> P1 (seed, ete, oidc) -> P2 (circuito) -> P3 (area51, ru, cso, mkt).
- Rollback por produto:
	1) Restaurar entrypoint legado sem redirect.
	2) Reativar links da matriz para a rota legado apenas do produto afetado.
	3) Abrir incidente e registrar causa, horario e escopo.
	4) Reprocessar validacao de links antes de nova tentativa.

## Atualizacao de status (2026-04-04)
- Ciclo 1 concluido.
- Ciclo 2 concluido.
- Ciclo 3 concluido.
- Estado atual da matriz: sem ownership de wiki de produto; paginas legado redirecionam para subdominios oficiais.
