# Memória do Projeto — Matriz (Cara Core Informática)

Referência rápida do site matriz (caracore.com.br). Actualizar quando mudar estrutura, portfólio, redirects, copy B2B ou integrações.

**Última actualização:** 2026-11-04
**Iniciar tarefa:** [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) · **Fonte mestre para IAs:** [`AGENTS.md` do repo](../AGENTS.md) + [ECOSYSTEM_MEMORIA.md](ECOSYSTEM_MEMORIA.md)  
**Posicionamento:** [DILEMA.md](DILEMA.md) · **Índice:** [INDEX.md](INDEX.md)

---

## Papel da matriz

- **Site:** https://www.caracore.com.br
- **Repo:** caracore-site
- **Função:** Home B2B, portfólio, ecossistema, publicações, Área 51 (`/secure/`). **Não** é vitrine principal — cada produto na loja (`*.caracore.com.br`).
- **Internacional:** `aligned/en/` · `aligned/it/` — tom híbrido/edge (não anti-cloud); link rodapé → `suporte-local.html` (Brasil)
- **Wiki:** https://wiki.caracore.com.br · **Retrô:** https://retro.caracore.com.br · **Sala:** https://tools.caracore.com.br/sala/

**Frase-guia:** *Alocação técnica dedicada ou consultoria por projeto — modelo B2B, código transparente no ambiente do cliente.*

---

## Home (`index.html`) — ordem e âncoras

| Secção | ID / notas |
|--------|------------|
| Hero | Engenharia antifrágil B2B · FinOps/híbrido/edge · frase-guia · produtos = prova de entrega |
| Engenharia B2B | `#engenharia-b2b` — alocação, legados, ágil contínuo |
| Antifragilidade | `#diferenciais` — Resiliência e FinOps; arquitetura híbrida (não ideologia anti-cloud) |
| Produtos | `#produtos` — Decisão / Stack; link `#decisoes-engenharia` |
| Sobre | `#sobre` — **Nossa Operação** (boutique enxuta) |
| Contato | `#contato` — horário corporativo B2B; suporte PME em `suporte-local.html` |

**Fora do fluxo B2B:** [suporte-local.html](../suporte-local.html) — M365, TI local, treinamentos, horários noite/sábado.

**Nav:** Engenharia B2B · Produtos · Portfólio · Ecossistema · Antifragilidade · Sobre · Contato

---

## Modelo matriz ↔ loja

- **Matriz** = resumo executivo + CTAs + cases de decisão → subdomínio da loja
- **Loja** = vitrine, download, wiki (`caracore-*-releases/docs/`)
- **Oficina** = código (`caracore-{produto}`)
- **Não** duplicar vitrine longa; **não** usar `/delivery/` em CTAs novos

---

## CaraCore PDV — linha Java web local e linha Rust desktop

| Linha | Oficina | Loja | Release |
|-------|---------|------|---------|
| Java — v4 (atual) | caracore-pdv | pdv.caracore.com.br | **v4.0.0**, lançada em 08/11/2026 · release publicada em 06/11/2026 em `caracore-pdv4-releases` (ZIP portátil Windows x64, 176.613.179 B, SHA-256 `9557e0b1…d81eac`, `SHA256SUMS` assinado com duas chaves Ed25519) |
| Java — versão anterior | caracore-pdv | pdv.caracore.com.br | **v3.2.12-free** — última da linha 3.2.x, Windows/Linux/macOS, manutenção encerrada em 08/11/2026 e pacotes ainda disponíveis |
| Rust + Tauri 2 | caracore-pdv-rust | pdv-rust.caracore.com.br + `caracore-rust-pdv-releases/releases` | **v0.1.4** (100 vendas na vida; loja e artefatos no mesmo repo) |

- Java: launcher no Edge na v4; navegador na 3.2.12 · Rust: aplicativo desktop · SQLite local · **nenhuma linha substitui a outra**
- Planos Java (`PlanoLicencaService`): Free = 100 vendas/mês, 100 produtos, 1 operador, 4 vendedores, 1 loja; sem PIX/NF-e. Copy pública pode informar recibo digital por link e PDF, sempre sem valor fiscal. Premium R$ 79,90/mês. Loja: CTA = **Baixar Free**; Premium via demonstração.
- v4 Java: Quarkus + Qute + SQLite + launcher; no pacote de 06/11/2026, T032 17/17, matriz 11/11 (M11, desempenho, não medido — `PERF-001–007` congeladas), banco 3.2.12 migrado 9/9 e sonda 20/0/1/0. SCA = OSV de 06/11/2026 (275 pacotes, 1 alto triado por byte); NVD não medido — nunca "0 CVE".
- Ciclo de vida: a v4.0.0 é a linha atual desde 08/11/2026; a `v3.2.12-free` é a versão anterior, com manutenção encerrada na mesma data e os pacotes disponíveis. Migração: backup, copiar `%APPDATA%\caracore\caracore-pdv.db` para `data\caracore-pdv.db` **antes da primeira abertura** e manter a 3.2.12 instalada até conferir. A v4 não desfaz venda finalizada.
- Histórico: `v4.0.0-candidato-20261031` (build 31/10/2026, fonte `master` `c343890`, SHA-256 `0c2003b0f99a75328f7ebe632fc20b07cb5834a3f75b6f0e97ccfb7aef83434d`, 178.317.680 bytes), `v4.0.0-rc6` e `v4.0.0-rc5`. **Não anunciar a linha 4.1.0** (Appmax/PlugNotas, em branch). Retomada: `caracore-pdv/AGENTS.md`.
- Portfólio: `#pdv-coexistencia` · `#caracore-pdv` · `#caracore-pdv-rust`
- Loja Rust: **sem SEED** na vitrine
- Discurso: v3.2.x (Java) ≠ v0.1.x (Rust); evitar “PDV v3” sozinho / “substitui”

---

## Páginas principais

| Ficheiro | Conteúdo |
|----------|----------|
| index.html | Home B2B, produtos, sobre, contato (sem suporte PME) |
| suporte-local.html | M365, TI local, treinamentos, horários noite/sábado |
| portfolio.html | TOC, `#decisoes-engenharia`, Bunker, PDV, releases |
| ecosistema.html | Mapa produtos, roadmap, links B2B e `#decisoes-engenharia` |
| aligned/en · aligned/it | B2B EN/IT |
| delivery/ | Stubs redirect |
| secure/ | Área 51 OIDC |

---

## Portfólio — secções transversais

`#decisoes-engenharia` · `#filosofia-bunker` · `#pdv-coexistencia` · `#portfolio-releases` · `#sobre-caracore`

Guia: [PORTFOLIO_README.md](PORTFOLIO_README.md) · CSS: `assets/css/portfolio.css`

---

## Redirects legado `/delivery/*`

- **Produção:** GitHub Pages — stubs HTML + `_redirects` (mapa declarado)
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
| [ECOSISTEMA.md](ECOSISTEMA.md) | Manutenção de `ecosistema.html` |
| [ECOSSISTEMA_MAPA_VISUAL.md](ECOSSISTEMA_MAPA_VISUAL.md) | Mapa em camadas (`#mapa-visual`) |
| [FEEDBACK.md](FEEDBACK.md) | Histórico branding Bunker (fev/2026) |

---

## Retrô e editorial (caracore-retro)

| Item | Referência |
|------|------------|
| URL | https://retro.caracore.com.br/ |
| Total | **139 artigos** confirmados (lacunas históricas na numeração) |
| Art. 115 (25/12/2026) | *O Boleto Vence o Debate* — B2B/IA, portal PJ, tom pragmático |
| Art. 114 (20/12/2026) | PDV Rust — coexistência Java; não migração forçada |
| Capa inline | `max-width:300px; float:right` (padrão artigos recentes) |
| Prompt capa | `assets/img/YYYY_MM_DD_article_NN_PROMPT_IMAGEM.txt` (geração 16:9) |
