# Checklist permanente — publicação na matriz Cara Core

Usar antes de PR/deploy de alterações visíveis em `caracore.com.br`.

**Referência:** `docs/FONTES_CANONICAS_MATRIZ_LOJAS.md` (Sala só em `sala/` na raiz; produtos nas lojas).

## Conteúdo e links

- [ ] Novos links comerciais de produto apontam para **subdomínio** (`https://{produto}.caracore.com.br/...`), não para `/delivery/{produto}/` (exceto teste de redirect).
- [ ] Alterações à Sala de Operações estão apenas em `sala/` na raiz do repo (não há `delivery/sala/` no repositório).
- [ ] Breadcrumb “Cara Core” na matriz: `https://caracore.com.br/` (não `index.html` isolado como marca).
- [ ] Imagens e assets com caminhos relativos corretos após mudança de pasta.

## SEO técnico

- [ ] Páginas novas **indexáveis** têm `<link rel="canonical">` absoluto em `https://caracore.com.br/...`.
- [ ] Se nova página de topo for para SEO: adicionar URL em `sitemap.xml` na raiz do site.
- [ ] `robots.txt`: só alterar `Disallow`/`Allow` com acordo (afeta rastreio).

## Qualidade

- [ ] `charset` UTF-8 nos primeiros 1024 bytes do HTML (meta charset logo após `<head>`).
- [ ] Revisão ortográfica em títulos e meta description.

## Pós-deploy

- [ ] Submeter `https://caracore.com.br/sitemap.xml` no Search Console (se alterado o sitemap ou URLs críticas).
- [ ] Smoke test: home → portfólio → ecossistema → um link de loja.
