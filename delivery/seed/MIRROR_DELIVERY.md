# Espelho de delivery — Cara Core Seed

**Lógica igual à do Reino OIDC.** Portal inspirado no **chmulato/ETE Minerador 4.0** (D:\dev\workspace-ete-releases): tema escuro, Inter, cards de metodologia e navegação em grid.

## Alinhamento dos três

| Onde | Papel | Caminho |
|------|--------|---------|
| **Domínio Cara Core Informática** | Portal completo (fonte de verdade) | `D:\dev\site\cara-core\delivery\seed` |
| **Vitrine e balcão público** | Espelho público (GitHub Pages / releases) | `D:\dev\caracore-seed-releases` (raiz: index.html, download.html, tecnologia, readme, portal-controle) |
| **Repositório principal** | Código-fonte + portal alinhado (index = mesmo estilo) | `D:\dev\caracore-seed` |

- O conteúdo **canônico** do portal fica em **delivery/seed**. CSS compartilhado: `assets/css/seed-portal.css` (estilo Minerador).
- **caracore-seed-releases** é a **vitrine**: pode ser atualizado com `push_public_to_seed_releases.ps1` (copia index, download, tecnologia, readme, portal-controle e assets de delivery/seed).
- **caracore-seed** (repo): index.html é o portal alinhado ao Minerador, com links para Releases, vitrine, apresentação técnica e portfólio Cara Core.
- Links para o portfólio usam URL absoluta (caracore.com.br) para funcionar tanto no delivery quanto na vitrine.

*Cara Core Informática — Cara Core Seed.*
