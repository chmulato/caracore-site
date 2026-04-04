# Matriz de Migracao de Conteudo para Lojas `-releases`
## Regra de ouro
- Loja oficial de cada produto = repositório `*-releases`.
- Vitrine, wiki e material comercial de produto devem ser publicados no `docs/` da loja correspondente.
- `caracore-site` permanece como matriz institucional (portfólio, contexto, roteamento), sem duplicidade comercial.

## Escopo de lojas
- caracore-area51-releases
- caracore-circuito-releases
- caracore-cso-releases
- caracore-ete-releases
- caracore-hub-releases
- caracore-ink-releases
- caracore-mkt-releases
- caracore-oidc-releases
- caracore-pdv-releases
- caracore-ru-releases
- caracore-seed-releases

## Mapeamento origem -> destino por produto
| Produto | Origem (matriz) | Destino (loja `-releases`) | Status inicial |
|---|---|---|---|
| PDV | `caracore-site/delivery/pdv/*` + `caracore-site/wiki/projeto-pdv.html` | `caracore-pdv-releases/docs/*` + `caracore-pdv-releases/docs/wiki/projeto-pdv.html` | pronto para migrar |
| Hub | `caracore-site/delivery/hub/*` + `caracore-site/wiki/projeto-hub.html` | `caracore-hub-releases/docs/*` + `caracore-hub-releases/docs/wiki/projeto-hub.html` | pronto para migrar |
| Ink | `caracore-site/delivery/ink/*` + `caracore-site/wiki/projeto-ink.html` | `caracore-ink-releases/docs/*` + `caracore-ink-releases/docs/wiki/projeto-ink.html` | pronto para migrar |
| Seed | `caracore-site/delivery/seed/*` + `caracore-site/wiki/projeto-seed.html` | `caracore-seed-releases/docs/*` + `caracore-seed-releases/docs/wiki/projeto-seed.html` | pronto para migrar |
| ETE | `caracore-site/delivery/ete/*` + `caracore-site/wiki/projeto-minerador.html` | `caracore-ete-releases/docs/*` + `caracore-ete-releases/docs/wiki/projeto-minerador.html` | pronto para migrar |
| OIDC | `caracore-site/delivery/oidc/*` + `caracore-site/wiki/projeto-reino.html` | `caracore-oidc-releases/docs/*` + `caracore-oidc-releases/docs/wiki/projeto-reino.html` | pronto para migrar |
| Circuito | `caracore-site/delivery/circuito/*` + `caracore-site/wiki/projeto-python.html` | `caracore-circuito-releases/docs/*` + `caracore-circuito-releases/docs/wiki/projeto-python.html` | pronto para migrar |
| Area 51 | `caracore-site/delivery/area51/*` + `caracore-site/wiki/projeto-area51.html` | `caracore-area51-releases/docs/*` + `caracore-area51-releases/docs/wiki/projeto-area51.html` | pronto para migrar |
| RU | `caracore-site/delivery/ru/*` | `caracore-ru-releases/docs/*` | pronto para migrar |
| CSO | `caracore-site/delivery/cso/*` | `caracore-cso-releases/docs/*` | pronto para migrar |
| MKT | `caracore-site/delivery/mkt/*` | `caracore-mkt-releases/docs/*` | preparar estrutura base |

## Ordenacao de execucao sugerida
- Onda 1 (alto impacto): PDV, Hub, Ink
- Onda 2 (medio impacto): Seed, ETE, OIDC
- Onda 3 (conclusao): Circuito, Area51, RU, CSO, MKT

## Padrao minimo por loja
Cada `*-releases/docs/` deve ter:
- `index.html`
- `download.html` (quando aplicavel)
- `canal-feedback.html`
- `licenca-uso.html` (quando aplicavel)
- `wiki/` com a pagina principal da aplicacao (quando houver wiki de produto)

## Regras de qualidade antes de publicar
- Links internos da loja devem apontar para a propria loja.
- Nenhum CTA comercial deve voltar para `caracore-site/delivery/*`.
- Revisar texto para remover referencia de "matriz como fonte oficial".
- Validar CNAME e navegacao em dominio oficial.

## Observacao operacional
Politica vigente no checkpoint: lojas `-releases` devem permanecer autocontidas, sem links externos clicaveis desnecessarios. Se a wiki exigir referencia externa, tratar como excecao formal e registrar no changelog da loja.
