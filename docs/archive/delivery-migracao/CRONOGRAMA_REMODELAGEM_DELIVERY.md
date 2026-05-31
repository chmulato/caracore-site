# Cronograma de Execucao
## Remodelagem Delivery -> Subdominios

## Janela de execucao proposta
- Ciclo total: 6 semanas
- Modelo: gates semanais com evidencia
- Cadencia: 2 checkpoints por semana

## Roadmap por fase

| Semana | Ciclo | Objetivo | Entregavel de saida | Gate |
|---|---|---|---|---|
| S1 | Ciclo 0 | Baseline, inventario e mapeamento de rotas | Mapa rota antiga -> subdominio + inventario por produto | 100% das rotas base mapeadas |
| S2 | Ciclo 1 | Canonizacao de links da matriz | CTAs da matriz apontando para subdominios | 0 links comerciais para delivery na matriz |
| S3 | Ciclo 2 | Compatibilidade por redirecionamento | Entry points de delivery redirecionando para subdominios | 100% das rotas principais com redirect funcional |
| S4 | Ciclo 3 | Migracao fisica de conteudo para `-releases` | Vitrines e wiki de produto publicadas nos repositorios de loja | Fonte unica por produto em `-releases` |
| S5 | Ciclo 4 | SEO e observabilidade | Canonical/sitemap + relatorio de 404 e chains | Sem regressao relevante de trafego/conv. |
| S6 | Ciclo 5 | Fechamento operacional | Runbook final + checklist permanente de publicacao | Governanca publicada e adotada |

## Criticidade por produto
- Alta: pdv, hub, circuito, oidc
- Media: ete, ru, cso, area51, ink
- Baixa: seed, mkt

## Ritmo de deploy sugerido
- Segunda: alteracoes de links e roteamento
- Quarta: validacao funcional e SEO
- Sexta: gate, evidencia e decisao de avancar

## Evidencias obrigatorias por ciclo
- Lista de arquivos alterados
- Resultado de varredura de links
- Status de redirecionamentos
- Registro de risco e rollback
