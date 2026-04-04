# Mapa de Rotas
## Delivery (legado na matriz) → lojas (fonte oficial)

**Plano:** cada rota `/delivery/{produto}/...` na matriz deve corresponder ao destino na **loja** desse produto (`https://{produto}.caracore.com.br/...`); ver `docs/FONTES_CANONICAS_MATRIZ_LOJAS.md` §1.0. **Estado-alvo:** quando a pasta `delivery/` for removida do repo, este mapa define as **mesmas** rotas, implementadas **só** no hospedeiro (§1.0a).

**Onde editar conteúdo (Sala vs lojas):** `docs/FONTES_CANONICAS_MATRIZ_LOJAS.md`. Este ficheiro é o **mapeamento de URLs** legado na matriz → URL oficial na loja.

## Regras de mapeamento
- Rota base de produto: /delivery/{produto}/ -> https://{subdominio}/
- Download: /delivery/{produto}/download*.html -> https://{subdominio}/download.html
- Canal de feedback: /delivery/{produto}/canal-feedback.html -> https://{subdominio}/canal-feedback.html
- Licenca/termos: /delivery/{produto}/licenca-uso.html -> pagina equivalente no subdominio

## Mapa base por produto

| Produto | Rota legado base | Destino oficial | Status |
|---|---|---|---|
| PDV | /delivery/pdv/ | https://pdv.caracore.com.br/ | mapeado |
| Hub | /delivery/hub/ | https://hub.caracore.com.br/ | mapeado |
| Circuito Ferradura | /delivery/circuito/ | https://circuito.caracore.com.br/ | mapeado |
| Reino OIDC | /delivery/oidc/ | https://oidc.caracore.com.br/ | mapeado |
| Seed | /delivery/seed/ | https://seed.caracore.com.br/ | mapeado |
| Area 51 | /delivery/area51/ | https://area51.caracore.com.br/ | mapeado |
| RU | /delivery/ru/ | https://ru.caracore.com.br/ | mapeado |
| CSO | /delivery/cso/ | https://cso.caracore.com.br/ | mapeado |
| Ink | /delivery/ink/ | https://ink.caracore.com.br/ | mapeado |
| ETE | /delivery/ete/ | https://ete.caracore.com.br/ | mapeado |
| MKT | /delivery/mkt/ | https://mkt.caracore.com.br/ | mapeado |

## Prioridade por impacto (baseline 2026-04-04)
Referencias fora de delivery para cada rota legado, usadas para ordenar a migracao.

| Produto | Referencias | Prioridade |
|---|---:|---|
| PDV | 14 | P0 |
| Hub | 8 | P0 |
| Ink | 8 | P0 |
| Seed | 7 | P1 |
| ETE | 6 | P1 |
| Reino OIDC | 5 | P1 |
| Circuito Ferradura | 4 | P2 |
| Area 51 | 1 | P3 |
| RU | 0 | P3 |
| CSO | 0 | P3 |
| MKT | 0 | P3 |

## Mapa de rotas criticas por produto

| Produto | Rota legado critica | Destino oficial |
|---|---|---|
| PDV | /delivery/pdv/ | https://pdv.caracore.com.br/ |
| PDV | /delivery/pdv/index.html | https://pdv.caracore.com.br/ |
| PDV | /delivery/pdv/download.html | https://pdv.caracore.com.br/download.html |
| PDV | /delivery/pdv/download-oficial.html | https://pdv.caracore.com.br/download.html |
| Hub | /delivery/hub/ | https://hub.caracore.com.br/ |
| Hub | /delivery/hub/index.html | https://hub.caracore.com.br/ |
| Hub | /delivery/hub/download.html | https://hub.caracore.com.br/download.html |
| Hub | /delivery/hub/canal-feedback.html | https://hub.caracore.com.br/canal-feedback.html |
| Ink | /delivery/ink/ | https://ink.caracore.com.br/ |
| Ink | /delivery/ink/index.html | https://ink.caracore.com.br/ |
| Ink | /delivery/ink/download.html | https://ink.caracore.com.br/download.html |
| Ink | /delivery/ink/canal-feedback.html | https://ink.caracore.com.br/canal-feedback.html |
| Seed | /delivery/seed/ | https://seed.caracore.com.br/ |
| Seed | /delivery/seed/index.html | https://seed.caracore.com.br/ |
| Seed | /delivery/seed/download.html | https://seed.caracore.com.br/download.html |
| Seed | /delivery/seed/canal-feedback.html | https://seed.caracore.com.br/canal-feedback.html |
| ETE | /delivery/ete/ | https://ete.caracore.com.br/ |
| ETE | /delivery/ete/index.html | https://ete.caracore.com.br/ |
| ETE | /delivery/ete/download.html | https://ete.caracore.com.br/download.html |
| ETE | /delivery/ete/download-oficial.html | https://ete.caracore.com.br/download.html |
| ETE | /delivery/ete/canal-feedback.html | https://ete.caracore.com.br/canal-feedback.html |
| ETE | /delivery/ete/licenca-uso.html | https://ete.caracore.com.br/licenca-uso.html |
| Reino OIDC | /delivery/oidc/ | https://oidc.caracore.com.br/ |
| Reino OIDC | /delivery/oidc/index.html | https://oidc.caracore.com.br/ |
| Reino OIDC | /delivery/oidc/download.html | https://oidc.caracore.com.br/download.html |
| Reino OIDC | /delivery/oidc/canal-feedback.html | https://oidc.caracore.com.br/canal-feedback.html |
| Reino OIDC | /delivery/oidc/licenca-uso.html | https://oidc.caracore.com.br/licenca-uso.html |
| Circuito Ferradura | /delivery/circuito/ | https://circuito.caracore.com.br/ |
| Circuito Ferradura | /delivery/circuito/index.html | https://circuito.caracore.com.br/ |
| Circuito Ferradura | /delivery/circuito/canal-feedback.html | https://circuito.caracore.com.br/canal-feedback.html |
| Circuito Ferradura | /delivery/circuito/licenca-uso.html | https://circuito.caracore.com.br/licenca-uso.html |
| Area 51 | /delivery/area51/ | https://area51.caracore.com.br/ |
| Area 51 | /delivery/area51/index.html | https://area51.caracore.com.br/ |
| Area 51 | /delivery/area51/download.html | https://area51.caracore.com.br/download.html |
| Area 51 | /delivery/area51/canal-feedback.html | https://area51.caracore.com.br/canal-feedback.html |
| Area 51 | /delivery/area51/licenca-uso.html | https://area51.caracore.com.br/licenca-uso.html |
| RU | /delivery/ru/ | https://ru.caracore.com.br/ |
| RU | /delivery/ru/index.html | https://ru.caracore.com.br/ |
| RU | /delivery/ru/canal-feedback.html | https://ru.caracore.com.br/canal-feedback.html |
| RU | /delivery/ru/email_pos_venda.html | https://ru.caracore.com.br/email_pos_venda.html |
| CSO | /delivery/cso/ | https://cso.caracore.com.br/ |
| CSO | /delivery/cso/index.html | https://cso.caracore.com.br/ |
| CSO | /delivery/cso/download.html | https://cso.caracore.com.br/download.html |
| CSO | /delivery/cso/canal-feedback.html | https://cso.caracore.com.br/canal-feedback.html |
| MKT | /delivery/mkt/ | https://mkt.caracore.com.br/ |
| MKT | /delivery/mkt/index.html | https://mkt.caracore.com.br/ |
| MKT | /delivery/mkt/canal-feedback.html | https://mkt.caracore.com.br/canal-feedback.html |

## Entradas especiais para tratar no Ciclo 0
- /delivery/publications/
- /delivery/sala/ (legado — só redirect HTTP / CDN; pasta removida do repo)
- /delivery/assets/

## Decisao proposta para entradas especiais
- publications: manter na matriz (nao produto unico de subdominio); stubs em `delivery/publications/` apontam para `/publications/` e `/sala/` conforme o caso
- sala: acervo canónico em `/sala/` (`sala/` na raiz do repo). **Sem** `delivery/sala/` no repositório; mapear `/delivery/sala/*` → `/sala/*` no hospedeiro (`_redirects`, CDN, etc.); ver `docs/DELIVERY_RESTRUCTURA.md`
- assets: manter como biblioteca compartilhada

## Edge / hospedeiro (implementado no repo)

- **`_redirects`** (Netlify e compatíveis): na raiz do `caracore-site` — redirects 301 para `/delivery/{produto}/...` → lojas, `/delivery/sala/*` → `/sala/*`, `/delivery/publications` (índice) → `/sala/`, filhos → `/publications/:path*`. Ordem: regras específicas antes do catch-all SPA.
- **`vercel.json`**: mesma lógica para deploy na Vercel.
- **GitHub Pages puro** ou outro host sem `_redirects`: replicar estas regras na CDN (ex.: Cloudflare Redirect Rules / Page Rules) ou migrar para um dos hosts acima — ver `docs/DELIVERY_RESTRUCTURA.md`.

**Nota:** `delivery/assets/` (ex.: evolution-status) e ficheiros estáticos ainda servidos sob `delivery/` até migração; não estão neste lote de redirects externos.
