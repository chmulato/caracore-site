# Cara Core Informática — Site matriz

Repositório do site institucional **[caracore.com.br](https://www.caracore.com.br)**: home B2B, portfólio, ecossistema, publicações, redirects de compatibilidade e **Área 51** (`/secure/`).

**Papel da matriz:** engenharia B2B boutique + prova de entrega (produtos Bunker) e CTAs para as lojas oficiais. Vitrine, download e documentação comercial vivem nos repositórios `caracore-*-releases` (subdomínios `*.caracore.com.br`).

**Frase-guia:** *Alocação técnica dedicada ou consultoria por projeto — modelo B2B, código transparente no ambiente do cliente.*

---

## Páginas públicas principais

| Página | Ficheiro | Função |
|--------|----------|--------|
| Home | `index.html` | Hero B2B, `#engenharia-b2b`, produtos, operação, contacto |
| Portfólio | `portfolio.html` | Cases `#decisoes-engenharia`, coexistência PDV, releases |
| Ecossistema | `ecosistema.html` | Mapa de produtos e lojas |
| EN / IT | `aligned/en/`, `aligned/it/` | B2B engineering (espelho PT) |
| Políticas | `politica/` | Privacidade, termos |
| Área 51 | `secure/` | Login OIDC (Google / Microsoft) |

**Estilos do portfólio:** `assets/css/portfolio.css` · **Redirects legado:** `_redirects` (ex.: `/delivery/pdv-rust` → `pdv-rust.caracore.com.br`).

---

## PDV Desktop — duas linhas (discurso fixo)

| Linha | Loja canónica | Release |
|-------|---------------|---------|
| Java · JavaFX | [pdv.caracore.com.br](https://pdv.caracore.com.br/) | v3.2.2-free |
| Rust + Tauri 2 | [pdv-rust](https://pdv-rust.caracore.com.br/) · [releases](https://github.com/chmulato/caracore-pdv-releases/releases/tag/v0.1.2) | v0.1.2 |

Ambos são **desktop** na máquina da loja. Stacks distintas; **nenhuma substitui a outra**. Portfólio: `#pdv-coexistencia`, `#caracore-pdv`, `#caracore-pdv-rust`.

---

## Documentação (site)

| Documento | Conteúdo |
|-----------|----------|
| [docs/INDEX.md](docs/INDEX.md) | Índice curado |
| [docs/SITE_MATRIZ.md](docs/SITE_MATRIZ.md) | Guia operacional da matriz |
| [docs/MEMORIA_DO_PROJETO.md](docs/MEMORIA_DO_PROJETO.md) | Memória rápida do repo |
| [docs/FONTES_CANONICAS_MATRIZ_LOJAS.md](docs/FONTES_CANONICAS_MATRIZ_LOJAS.md) | Onde editar cada tipo de conteúdo |
| [docs/CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md](docs/CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md) | Checklist pré-deploy |
| [docs/PORTFOLIO_README.md](docs/PORTFOLIO_README.md) | Estrutura do portfólio |
| [docs/ECOSYSTEM_CARA_CORE.md](docs/ECOSYSTEM_CARA_CORE.md) | Repositórios do ecossistema |
| [docs/ECOSYSTEM_LOJAS.md](docs/ECOSYSTEM_LOJAS.md) | URLs das lojas |
| [docs/DILEMA.md](docs/DILEMA.md) | Posicionamento B2B e status do site |

Ecossistema completo: [wiki.caracore.com.br](https://wiki.caracore.com.br/).

---

## Estrutura resumida

```text
caracore-site/
├── index.html, portfolio.html, ecosistema.html
├── aligned/en/, aligned/it/   # B2B engineering EN/IT
├── _redirects, _config.yml, CNAME, sitemap.xml, robots.txt
├── assets/          # CSS, JS, imagens do site
├── secure/          # Área 51 (OIDC) — ver secure/README.md
├── backend/         # API Flask (Azure) — suporte à Área 51
├── docs/            # Documentação do site (índice em docs/INDEX.md)
├── publications/    # Acervo editorial na matriz
└── politica/        # Privacidade e termos
├── infra/backend.disabled/  # Backend arquivado (movido)
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

## Backend arquivado

O backend foi arquivado e movido para `infra/backend.disabled/backend`. O site público funciona agora como um site estático e a Área 51 usa uma simulação em JavaScript, sem integrações ativas com Google/Microsoft/Azure.

- Localizar backend arquivado: `infra/backend.disabled/backend`
- Simulação de autenticação: a API do cliente OIDC simulada está em `secure/js/auth.js` e expõe `window.CaraCoreOIDC` (ex.: `getUser()`, `isAuthenticated()`). Ela retorna um usuário público simulado `PUBLIC_USER` para compatibilidade com a UI.

Para testar o site estático localmente, execute um servidor simples na raiz do repositório:

```powershell
python -m http.server 8080
```

Abra http://localhost:8080 e verifique `/portfolio.html` e `/secure/`.

Se precisar restaurar o backend para desenvolvimento, mova `infra/backend.disabled/backend` de volta para `backend/` e revise os arquivos de ambiente antes de executar.


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
