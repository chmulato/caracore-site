# Espelho de delivery — Cara Core Seed

**Lógica igual à do Reino OIDC.** Portal inspirado no **chmulato/ETE Minerador 4.0** (D:\dev\workspace-ete-releases): tema escuro, Inter, cards de metodologia e navegação em grid.

## Regra: apresentação de loja só na Matriz e na Filial

- **Repositórios privados** (ex.: caracore-seed) **não** contêm apresentação de loja filial; apenas código-fonte e landing técnica com links para matriz e filial.
- **Loja filial:** apenas em **caracore-seed-releases** (vitrine pública).
- **Apresentação (delivery):** apenas na **Matriz** Cara Core Informática (este diretório: delivery/seed).
- **Matriz e filial** devem estar alinhadas com a **mesma transparência de negócio** (preço, PIX, LGPD, 100% offline).

## Alinhamento Matriz × Filial

| Onde | Papel | Caminho |
|------|--------|---------|
| **Matriz — Cara Core Informática** | Portal completo (fonte de verdade) | `D:\dev\site\cara-core\delivery\seed` |
| **Filial — vitrine pública** | Espelho público (GitHub Pages / releases) | `D:\dev\caracore-seed-releases\docs` (index, download, compra, tecnologia, etc.) |

- O conteúdo **canônico** do portal fica em **delivery/seed**. CSS: `assets/css/seed-portal.css` (estilo Minerador).
- **caracore-seed-releases** é a **loja filial**: vitrine na pasta **docs/** (padrão GitHub Pages: Branch + Folder /docs). Mesma cara e design. Produto **somente a pagamento** — R$ 29,00 (PIX, CNPJ Cara Core). Atualizar filial com `push_public_to_seed_releases.ps1` (fonte: delivery/seed; destino: docs/ do clone).
- **caracore-seed** (repo privado): apenas código-fonte; index.html é landing técnica com links para Matriz, Filial e apresentação técnica (apresentacao.html). Sem duplicar loja.
- Links para o portfólio usam URL absoluta (caracore.com.br) para funcionar tanto no delivery quanto na filial.

*Cara Core Informática — Cara Core Seed.*
