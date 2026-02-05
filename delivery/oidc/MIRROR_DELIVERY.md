# Espelho de delivery — Reino OIDC

**Lógica igual à do Cara Core Seed:**

| Onde | Papel | Caminho |
|------|--------|---------|
| **Domínio Cara Core Informática** | Portal completo (fonte de verdade) | `D:\dev\site\cara-core\delivery\oidc` |
| **Vitrine e balcão público** | Espelho público (GitHub Pages / releases) | `D:\dev\reino_oidc_releases` (pasta `docs/`) |

- O conteúdo **canônico** fica em **delivery/oidc** (site Cara Core).
- O repositório **reino_oidc_releases** é o **espelho** (vitrine): mesmo conteúdo em `docs/` para publicação pública (ex.: GitHub Pages).
- Ao alterar páginas, histórias, upgrade ou assets em **delivery/oidc**, sincronize com **reino_oidc_releases/docs/** e ajuste links que apontam para o portfólio (`../../portfolio.html` → URL absoluta do portfólio Cara Core na vitrine).

*Cara Core Informática — Reino OIDC: Reino das Identidades Federadas.*
