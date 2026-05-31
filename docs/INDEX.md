# Documentação — Site matriz (caracore-site)

Índice **curado** para quem edita o site institucional. Documentação histórica de backend OAuth, migração `delivery/` e fases antigas está em [archive/](archive/).

**Última atualização:** 2026-05-31

---

## Essencial (ler primeiro)

| Documento | Para quê |
|-----------|----------|
| [SITE_MATRIZ.md](SITE_MATRIZ.md) | Páginas, portfólio, redirects, publicação |
| [ECOSYSTEM_MEMORIA.md](ECOSYSTEM_MEMORIA.md) | Índice de memorias Cursor — retomada de desenvolvimento |
| [memoria-projeto.txt](memoria-projeto.txt) | Memória rápida do repositório |
| [FONTES_CANONICAS_MATRIZ_LOJAS.md](FONTES_CANONICAS_MATRIZ_LOJAS.md) | Matriz vs lojas — uma fonte por tipo de conteúdo |
| [CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md](CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md) | Antes de PR/deploy visível |

---

## Ecossistema e lojas (raiz do repo)

| Ficheiro | Conteúdo |
|----------|----------|
| [../ECOSYSTEM_CARA_CORE.txt](../ECOSYSTEM_CARA_CORE.txt) | Repositórios oficina + loja |
| [../ECOSYSTEM_LOJAS.txt](../ECOSYSTEM_LOJAS.txt) | URLs canónicas das vitrines |
| [../COMPONENTES_LOJA.txt](../COMPONENTES_LOJA.txt) | Molde de páginas por loja |
| [../VALIDACAO_LOJAS_MATRIZ.txt](../VALIDACAO_LOJAS_MATRIZ.txt) | Checklist alinhamento portfólio ↔ lojas |
| [../VALIDACAO_NEGOCIO.txt](../VALIDACAO_NEGOCIO.txt) | Validação comercial — produtos, preços, fluxos (2026-05) |
| [../STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.txt](../STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.txt) | Resumo executivo estratégia e próximos passos |
| [ECOSSISTEMA_MAPA_VISUAL.md](ECOSSISTEMA_MAPA_VISUAL.md) | Mapa visual (se aplicável) |

Wiki institucional: [wiki.caracore.com.br](https://wiki.caracore.com.br/) (repo `caracore-wiki`).

---

## Portfólio

| Documento | Conteúdo |
|-----------|----------|
| [PORTFOLIO_README.md](PORTFOLIO_README.md) | Estrutura, categorias, blocos, CSS |
| `../portfolio.html` | Página publicada |
| `../assets/css/portfolio.css` | Estilos (TOC, Bunker, coexistência PDV, releases) |

Secções transversais no portfólio: `#filosofia-bunker`, `#pdv-coexistencia`, `#portfolio-releases`, `#sobre-caracore`.

---

## Redirects e legado `/delivery/`

| Documento | Conteúdo |
|-----------|----------|
| [MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md](MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md) | Mapa URL legado → loja |
| `../_redirects` | Regras efectivas no hospedeiro |

PDV Rust: **sem** portal em `/delivery/pdv-rust` — redirect 301 para `https://rust-pdv.caracore.com.br/`.

---

## Área 51 e backend (referência)

| Documento | Conteúdo |
|-----------|----------|
| [../secure/README.md](../secure/README.md) | Fluxo OIDC na matriz |
| [AREA51_PORTFOLIO.md](AREA51_PORTFOLIO.md) | Bloco Área 51 no portfólio |
| [archive/backend-auth/](archive/backend-auth/) | Deploy Azure, OAuth, fases (histórico) |

---

## Assets e analytics

| Documento | Conteúdo |
|-----------|----------|
| [MIGRACAO_IMAGENS.md](MIGRACAO_IMAGENS.md) | Estrutura de imagens |
| [GOOGLE_ANALYTICS.md](GOOGLE_ANALYTICS.md) | GA4 (se existir) |

---

## Arquivo

[archive/README.md](archive/README.md) — documentos movidos por não serem relevantes ao dia-a-dia do site estático (troubleshooting OAuth pontual, cronogramas de migração delivery concluídos, etc.).
