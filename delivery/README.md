# Delivery na matriz (`caracore-site/delivery/`)

**Fontes canónicas:** `docs/FONTES_CANONICAS_MATRIZ_LOJAS.md`.

## Plano — estado-alvo: **não precisar desta pasta**

O plano fixado em MD é chegar ao ponto em que o repositório **não inclui** `D:\dev\caracore-site\delivery`: rotas legadas `https://caracore.com.br/delivery/...` tratam-se **apenas** no hospedeiro (redirects na CDN / edge), com o mapa em `docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md`. **Pré-requisitos e passos:** `docs/FONTES_CANONICAS_MATRIZ_LOJAS.md` §**1.0a**.

Enquanto a pasta existir, serve **só** como transição (redirects estáticos, `MIRROR_DELIVERY.md`); **não** é destino de conteúdo novo de produto — isso vai para as **respetivas lojas** e repos `*-releases`.

## Função atual (transitória)

- **Produtos** (pdv, hub, ink, seed, oidc, circuito, ete, area51, ru, cso, mkt): HTML mínimo de **redirecionamento** para o subdomínio oficial.

- **Sala:** **só** em `sala/` na raiz → `https://caracore.com.br/sala/`. Não há `delivery/sala/` no repo.

- **`delivery/assets/`:** migrar para local canónico antes de remover a pasta (ver §1.0a).

- **`delivery/publications/`:** redirecionamentos; notas em `/publications/` na matriz quando aplicável.

## Documentação canónica

| Documento | Conteúdo |
|-----------|-----------|
| `docs/FONTES_CANONICAS_MATRIZ_LOJAS.md` | Plano, §1.0a eliminação de `delivery/` |
| `docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md` | Rotas legado → loja / matriz |
| `docs/DELIVERY_RESTRUCTURA.md` | Transição até remover `delivery/` |
| `docs/PLANO_DESATIVACAO_DELIVERY_SUBDOMINIOS.md` | Fases do plano |
| `docs/RUNBOOK_OPERACAO_DELIVERY_SUBDOMINIOS.md` | Operação e SEO |
| `docs/CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md` | Gates e graus |

## Espelho por produto

Em cada pasta de produto existe `MIRROR_DELIVERY.md` com o link da loja oficial.
