# Publicações (Matriz)

Lista de artigos e páginas da sala de notícias publicada no site matriz (caracore.com.br). Todo o conteúdo usa **links de referência relativos** para funcionar em qualquer base URL.

## Convenção de links relativos

- **A partir de `publications/`** (articles.html, index.html, nota_cc.html):
  - Lista de artigos: `articles.html`
  - Um artigo: `articles/<nome>.html`
  - CSS da lista: `articles/assets/css/articles.css`
  - Nota interna: `nota_cc.html`
  - Voltar ao início da seção: `index.html`

- **A partir de `publications/articles/`** (cada artigo):
  - Voltar para a lista: `../articles.html`
  - CSS: `assets/css/articles.css`
  - Imagens: `assets/img/<arquivo>.png`
  - Link para outro artigo (mesma pasta): `nome_do_artigo.html`

Não usar caminhos absolutos do site (ex.: `/publications/...`) para navegação interna; usar apenas relativos. Links externos (caracore.com.br, LinkedIn) permanecem absolutos. Canonical e og:url/og:image usam a URL canônica do matriz (https://caracore.com.br/publications/...).
