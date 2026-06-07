# Memória do Projeto — Matriz (Cara Core Informática)

Referência rápida do site matriz (caracore.com.br). Actualizar quando mudar estrutura, portfólio, redirects, copy B2B ou integrações.

**Última actualização:** 2026-06-07  
**Iniciar tarefa:** [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md)  
**Posicionamento:** [DILEMA.md](DILEMA.md) · **Índice:** [INDEX.md](INDEX.md)

---

## Papel da matriz

- **Site:** https://www.caracore.com.br
- **Repo:** caracore-site
- **Função:** Home B2B, portfólio, ecossistema, publicações, Área 51 (`/secure/`). **Não** é vitrine principal — cada produto na loja (`*.caracore.com.br`).
- **Internacional:** `aligned/en/` · `aligned/it/`
- **Wiki:** https://wiki.caracore.com.br · **Retrô:** https://retro.caracore.com.br · **Sala:** https://tools.caracore.com.br/sala/

**Frase-guia:** *Alocação técnica dedicada ou consultoria por projeto — modelo B2B, código transparente no ambiente do cliente.*

---

## Home (`index.html`) — ordem e âncoras

| Secção | ID / notas |
|--------|------------|
| Hero | Engenharia antifrágil B2B + frase-guia |
| Engenharia B2B | `#engenharia-b2b` — alocação, legados, ágil contínuo |
| Antifragilidade | `#diferenciais` |
| Produtos | `#produtos` — Decisão / Stack; link `#decisoes-engenharia` |
| Operação | `#operacao` — complementar (M365, suporte, treinamentos) |
| Sobre | `#sobre` — **Nossa Operação** (boutique enxuta) |
| Contato | `#contato` |

**Nav:** Engenharia B2B · Produtos · Portfólio · Ecossistema · Antifragilidade · Operação · Sobre · Contato

---

## Modelo matriz ↔ loja

- **Matriz** = resumo executivo + CTAs + cases de decisão → subdomínio da loja
- **Loja** = vitrine, download, wiki (`caracore-*-releases/docs/`)
- **Oficina** = código (`caracore-{produto}`)
- **Não** duplicar vitrine longa; **não** usar `/delivery/` em CTAs novos

---

## CaraCore PDV — duas linhas desktop

| Linha | Oficina | Loja | Release |
|-------|---------|------|---------|
| Java · JavaFX | caracore-pdv | pdv.caracore.com.br | **v3.2.2-free** |
| Rust + Tauri 2 | caracore-pdv-rust | rust-pdv.caracore.com.br | **v0.1.2** |
| Releases Rust | caracore-rust-pdv-releases | GitHub Releases | download oficial |

- Filosofia Bunker · SQLite local · **nenhuma linha substitui a outra**
- Portfólio: `#pdv-coexistencia` · `#caracore-pdv` · `#caracore-pdv-rust`
- Loja Rust: **sem SEED** na vitrine
- Discurso: v3.2.x (Java) ≠ v0.1.x (Rust); evitar “PDV v3” sozinho / “substitui”

---

## Páginas principais

| Ficheiro | Conteúdo |
|----------|----------|
| index.html | Home B2B, produtos, operação, contato |
| portfolio.html | TOC, `#decisoes-engenharia`, Bunker, PDV, releases |
| ecosistema.html | Mapa Eco Mundo |
| aligned/en · aligned/it | B2B EN/IT |
| delivery/ | Stubs redirect |
| secure/ | Área 51 OIDC |

---

## Portfólio — secções transversais

`#decisoes-engenharia` · `#filosofia-bunker` · `#pdv-coexistencia` · `#portfolio-releases` · `#sobre-caracore`

Guia: [PORTFOLIO_README.md](PORTFOLIO_README.md) · CSS: `assets/css/portfolio.css`

---

## Redirects legado `/delivery/*`

- **Produção:** GitHub Pages — stubs HTML + `_redirects` / `vercel.json`
- Mapa: [MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md](MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md)
- Smoke (2026-05): 52/52 rotas críticas OK

---

## Documentos operacionais (`docs/`)

| Ficheiro | Uso |
|----------|-----|
| [STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md](STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md) | Estratégia executiva |
| [DILEMA.md](DILEMA.md) | Posicionamento B2B + scorecard |
| [ECOSYSTEM_CARA_CORE.md](ECOSYSTEM_CARA_CORE.md) | Mapa repos |
| [ECOSYSTEM_LOJAS.md](ECOSYSTEM_LOJAS.md) | URLs canónicas |
| [VALIDACAO_LOJAS_MATRIZ.md](VALIDACAO_LOJAS_MATRIZ.md) | Checklist matriz ↔ lojas |
| [VALIDACAO_NEGOCIO.md](VALIDACAO_NEGOCIO.md) | Validação comercial |
| [FEEDBACK.md](FEEDBACK.md) | Histórico branding Bunker (fev/2026) |
