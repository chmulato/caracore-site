# `delivery/` na matriz — transição até eliminação da pasta

**Arquitetura e plano:** `docs/FONTES_CANONICAS_MATRIZ_LOJAS.md` (§1.0 e **§1.0a — estado-alvo: não precisar de `D:\dev\caracore-site\delivery`**).

## Estado-alvo (plano)

O repositório **não deve precisar** da pasta `delivery/` a longo prazo: compatibilidade com URLs antigas passa a ser **só** no hospedeiro (CDN / redirects), conforme `docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md`. Até lá, `delivery/` é **transitório**.

## Enquanto `delivery/` existir

- **Produtos:** mínimo técnico (redirects para lojas); conteúdo real nas **lojas** e `*-releases`.
- **`delivery/sala/`:** não existe no repo; Sala canónica em `sala/`.
- **Redirects** `/delivery/sala/*` → `/sala/*`: `_redirects` (Netlify e similares); em GitHub Pages puro, CDN (ver abaixo).

## Redirecionamento `/delivery/sala/*` → `/sala/*`

| Mecanismo | Ficheiro / nota |
|-----------|-----------------|
| **Netlify** (e compatíveis) | `_redirects` na raiz |
| **GitHub Pages** puro | Redirect na **CDN** (ex.: Cloudflare) |
| **Azure Static Web Apps** | Regra de redirect ou função |

## Referências

- `delivery/README.md`
- `docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md`
- `docs/RUNBOOK_OPERACAO_DELIVERY_SUBDOMINIOS.md`
- `docs/PLANO_DESATIVACAO_DELIVERY_SUBDOMINIOS.md`
