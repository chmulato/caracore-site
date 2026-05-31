# Cara Core Informática — Site matriz

Repositório do site institucional **[caracore.com.br](https://www.caracore.com.br)**: home, portfólio, ecossistema, publicações, redirects de compatibilidade e **Área 51** (`/secure/`).

**Papel da matriz:** apresentação institucional e CTAs para as lojas oficiais de cada produto. Vitrine, download e documentação comercial vivem nos repositórios `caracore-*-releases` (subdomínios `*.caracore.com.br`).

---

## Páginas públicas principais

| Página | Ficheiro | Função |
|--------|----------|--------|
| Home | `index.html` | Institucional, produtos, contacto |
| Portfólio | `portfolio.html` | Ativos por categoria, coexistência PDV, releases |
| Ecossistema | `ecosistema.html` | Mapa de produtos e lojas |
| Políticas | `politica/` | Privacidade, termos |
| Área 51 | `secure/` | Login OIDC (Google / Microsoft) |

**Estilos do portfólio:** `assets/css/portfolio.css` · **Redirects legado:** `_redirects` (ex.: `/delivery/pdv-rust` → `rust-pdv.caracore.com.br`).

---

## PDV Desktop — duas linhas (discurso fixo)

| Linha | Loja canónica | Release |
|-------|---------------|---------|
| Java · JavaFX | [pdv.caracore.com.br](https://pdv.caracore.com.br/) | v3.1.2-free |
| Rust + Tauri 2 | [rust-pdv.caracore.com.br](https://rust-pdv.caracore.com.br/) | v0.1.0 |

Ambos são **desktop** na máquina da loja. Stacks distintas; **nenhuma substitui a outra**. Portfólio: `#pdv-coexistencia`, `#caracore-pdv`, `#caracore-pdv-rust`.

---

## Documentação (site)

| Documento | Conteúdo |
|-----------|----------|
| [docs/INDEX.md](docs/INDEX.md) | Índice curado |
| [docs/SITE_MATRIZ.md](docs/SITE_MATRIZ.md) | Guia operacional da matriz |
| [docs/memoria-projeto.txt](docs/memoria-projeto.txt) | Memória rápida do repo |
| [docs/FONTES_CANONICAS_MATRIZ_LOJAS.md](docs/FONTES_CANONICAS_MATRIZ_LOJAS.md) | Onde editar cada tipo de conteúdo |
| [docs/CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md](docs/CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md) | Checklist pré-deploy |
| [docs/PORTFOLIO_README.md](docs/PORTFOLIO_README.md) | Estrutura do portfólio |
| [ECOSYSTEM_CARA_CORE.txt](ECOSYSTEM_CARA_CORE.txt) | Repositórios do ecossistema |
| [ECOSYSTEM_LOJAS.txt](ECOSYSTEM_LOJAS.txt) | URLs das lojas |

Ecossistema completo: [wiki.caracore.com.br](https://wiki.caracore.com.br/).

---

## Estrutura resumida

```text
caracore-site/
├── index.html, portfolio.html, ecosistema.html
├── _redirects, _config.yml, CNAME, sitemap.xml, robots.txt
├── assets/          # CSS, JS, imagens do site
├── secure/          # Área 51 (OIDC) — ver secure/README.md
├── backend/         # API Flask (Azure) — suporte à Área 51
├── docs/            # Documentação do site (índice em docs/INDEX.md)
├── publications/    # Acervo editorial na matriz
└── politica/        # Privacidade e termos
```

URLs antigas `/delivery/{produto}/` redirecionam para as lojas via `_redirects`; **não** manter conteúdo comercial duplicado na matriz.

---

## Desenvolvimento local

```powershell
# Site estático (porta 8080 por defeito)
python scripts/server.py
```

Abrir [http://localhost:8080](http://localhost:8080) · Portfólio: `/portfolio.html` · Área 51: `/secure/`.

Backend OAuth (opcional): ver [secure/README.md](secure/README.md) e `backend/.env.example`.

---

## Publicação

- **Site estático:** GitHub Pages / hospedeiro com suporte a `_redirects` e `CNAME`.
- **Checklist:** [docs/CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md](docs/CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md).
- **Backend Azure:** documentação histórica em [docs/archive/backend-auth/](docs/archive/backend-auth/) (não faz parte do dia-a-dia do site estático).

---

## Contacto

- Site: [caracore.com.br](https://www.caracore.com.br)
- E-mail: [suporte@caracore.com.br](mailto:suporte@caracore.com.br)
- CNPJ: 23.969.028/0001-37

© Cara Core Informática
