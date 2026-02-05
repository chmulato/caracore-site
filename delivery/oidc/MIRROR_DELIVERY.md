# Espelho de delivery — Reino OIDC

**Matriz (fonte de verdade):** domínio Cara Core Informática — `D:\dev\site\cara-core\delivery\oidc`  
**Filial (vitrine pública):** `D:\dev\reino_oidc_releases` (pasta `docs/`) — GitHub Pages / releases

## Regra: apresentação de loja só na Matriz e na Filial

- **Repositórios privados** (ex.: reino_oidc) **não** contêm apresentação de loja filial; apenas conteúdo do produto (história, personagens, etc.) e código-fonte.
- **Loja filial:** apenas em **reino_oidc_releases** (vitrine pública).
- **Apresentação (delivery):** apenas na **Matriz** Cara Core Informática (este diretório: delivery/oidc).
- **Matriz e filial** devem estar alinhadas com a **mesma transparência de negócio**.

## Alinhamento com o domínio Cara Core Informática

Este diretório é a **matriz** do produto Reino OIDC. Toda a lógica de negócio (vitrine, balcão de compras, canal de feedback, licenças) segue o mesmo padrão do chmulato/ETE Minerador 4.0 e do Cara Core Seed, com identidade visual e navegação alinhadas ao portfólio Cara Core.

- **index.html** — Balcão (portal): breadcrumb *Cara Core Informática · Portfólio · Reino OIDC — Delivery*; cards para Conteúdo FREE, Upgrade, Canal de feedback, Licença, Portfólio e Repositório.
- **conteudo-free.html** — Landing do conteúdo FREE: história, personagens, conhecimento, academia, glossário, mapas.
- **canal-feedback.html** — Canal de sugestões, bugs e dúvidas (WhatsApp, Telegram, e-mail).
- **licenca-uso.html** — Termos do conteúdo FREE (MIT) e do upgrade Premium (O Trono da Identidade).
- **upgrade-trono.html** — Página de compra do upgrade (R$ 29,90, PIX).

Todas as páginas FREE (personagens, historia_p1/2/3, conclusao, mundo_do_conhecimento, caminho_feliz, aprendiz, glossario, mapas) possuem:

- Logo/navbar apontando para **conteudo-free.html** (Início do conteúdo FREE).
- Link **Cara Core Informática · Portfólio** (`../../portfolio.html#reino-oidc`) na navbar.
- Link **Balcão** para **index.html** (portal de compras e controle).

## Sincronização matriz → vitrine

Ao alterar páginas, histórias, upgrade ou assets em **delivery/oidc**:

1. Copie o conteúdo para **reino_oidc_releases/docs/** (incluindo `conteudo-free.html`, `canal-feedback.html`, `licenca-uso.html`, `index.html` e demais HTML e `assets/`).
2. Na vitrine, ajuste links que apontam para o portfólio: substitua `../../portfolio.html` e `../../portfolio.html#reino-oidc` pela URL absoluta **https://caracore.com.br/portfolio.html#reino-oidc**.
3. No **index.html** da vitrine, mantenha o `<base href="https://chmulato.github.io/reino-oidc-releases/">` para que links relativos funcionem no GitHub Pages.

*Cara Core Informática — Reino OIDC: Reino das Identidades Federadas.*
