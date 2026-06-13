# Documentação — Site matriz (caracore-site)

Índice **curado** para quem edita o site institucional. Toda a pasta `docs/` está em **Markdown** (`.md`); documentação histórica de backend OAuth, migração `delivery/` e sessões antigas está em [archive/](archive/).

**Última atualização:** 2026-06-07

---

## Essencial (ler primeiro)

| Documento | Para quê |
|-----------|----------|
| **[INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md)** | **Ao iniciar nova tarefa** — fluxo por repo e armadilhas |
| [MEMORIA_DO_PROJETO.md](MEMORIA_DO_PROJETO.md) | Memória rápida do repositório (páginas, PDV, redirects) |
| [ECOSYSTEM_MEMORIA.md](ECOSYSTEM_MEMORIA.md) | Visão atual do ecossistema + changelog |
| [SITE_MATRIZ.md](SITE_MATRIZ.md) | Páginas, portfólio, redirects, publicação |
| [FONTES_CANONICAS_MATRIZ_LOJAS.md](FONTES_CANONICAS_MATRIZ_LOJAS.md) | Matriz vs lojas — uma fonte por tipo de conteúdo |
| [CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md](CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md) | Antes de PR/deploy visível |

---

## Posicionamento e copy (B2B)

| Documento | Para quê |
|-----------|----------|
| **[DILEMA.md](DILEMA.md)** | Dilema PJ/empresa/sênior, diagnóstico, scorecard e **status de alinhamento** do site |
| [DILEMA_HISTORICO.md](DILEMA_HISTORICO.md) | Transcrição bruta da conversa Gemini (arquivo histórico; parcial) |
| [FEEDBACK.md](FEEDBACK.md) | Leva Bunker Digital (fev/2026) — vocabulário histórico; superseded pela leva B2B (jun/2026) |

**Frase-guia canónica (PT):** *Alocação técnica dedicada ou consultoria por projeto — modelo B2B, código transparente no ambiente do cliente.*

| Onde no site | Âncora / path |
|--------------|----------------|
| Home PT | `#engenharia-b2b`, `#contato` |
| Portfólio — cases | `#decisoes-engenharia` |
| EN / IT | `aligned/en/`, `aligned/it/` |

---

## Ecossistema e operação (mapas e validação)

Documentos operacionais — **fonte viva** para repos, URLs, checklists e estratégia:

| Documento | Conteúdo |
|-----------|----------|
| [ECOSYSTEM_CARA_CORE.md](ECOSYSTEM_CARA_CORE.md) | Mapa de repositórios (oficina + loja + matriz) |
| [ECOSYSTEM_LOJAS.md](ECOSYSTEM_LOJAS.md) | URLs canónicas das vitrines (`*.caracore.com.br`) |
| [COMPONENTES_LOJA.md](COMPONENTES_LOJA.md) | Molde de páginas por loja (`*-releases`) |
| [VALIDACAO_LOJAS_MATRIZ.md](VALIDACAO_LOJAS_MATRIZ.md) | Checklist alinhamento portfólio ↔ lojas |
| [VALIDACAO_NEGOCIO.md](VALIDACAO_NEGOCIO.md) | Validação comercial — produtos, preços, fluxos |
| [STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md](STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md) | Resumo executivo — estado actual e próximos passos |
| [ECOSSISTEMA_MAPA_VISUAL.md](ECOSSISTEMA_MAPA_VISUAL.md) | Mapa em camadas implementado em `ecosistema.html#mapa-visual` |

| Presença | URL | Repo |
|----------|-----|------|
| Wiki | [wiki.caracore.com.br](https://wiki.caracore.com.br/) | `caracore-wiki` |
| Retrô | [retro.caracore.com.br](https://retro.caracore.com.br/) | `caracore-retro` — **117 artigos**; art. 117 Fortaleza Digital · art. 115 B2B/IA |
| Sala | [tools.caracore.com.br/sala/](https://tools.caracore.com.br/sala/) | campanhas |

**Portfólio publicado:** [www.caracore.com.br/portfolio.html](https://www.caracore.com.br/portfolio.html)

---

## Páginas HTML da matriz

| Ficheiro | Conteúdo |
|----------|----------|
| `../index.html` | Hero B2B, `#engenharia-b2b`, produtos, operação, contato |
| `../portfolio.html` | Portfólio categorizado + estudos de caso |
| `../ecosistema.html` | Mapa produtos, roadmap, prova de entrega B2B |
| `../suporte-local.html` | Suporte PME / M365 / TI local (canal separado) |
| `../aligned/en/` · `../aligned/it/` | Variantes internacionais (B2B engineering) |
| `../secure/` | Área 51 OIDC |
| `../404.html` | Erro amigável |

**Ordem de leitura sugerida (home PT):** Hero → Engenharia B2B → Antifragilidade → Produtos → Sobre → Contato. Suporte PME: [suporte-local.html](../suporte-local.html) (link no rodapé).

---

## Portfólio

| Documento | Conteúdo |
|-----------|----------|
| [PORTFOLIO_README.md](PORTFOLIO_README.md) | Estrutura, categorias, blocos, CSS |
| [ECOSISTEMA.md](ECOSISTEMA.md) | Estado actual e manutenção de `ecosistema.html` |
| `../portfolio.html` | Página publicada |
| `../assets/css/portfolio.css` | Estilos (TOC, cases, Bunker, PDV, releases) |
| `../assets/css/ecosistema.css` | Layout ecossistema (cards, timeline) |

### Secções transversais (`portfolio.html`)

| Âncora | Conteúdo |
|--------|----------|
| `#decisoes-engenharia` | 3 mini cases — decisão / impacto (era IA) |
| `#filosofia-bunker` | Filosofia Bunker Digital |
| `#pdv-coexistencia` | Java vs Rust — comparação única |
| `#portfolio-releases` | Releases e marcos |
| `#sobre-caracore` | Sobre a Cara Core |

Detalhes: [SITE_MATRIZ.md §3](SITE_MATRIZ.md).

---

## Redirects e legado `/delivery/`

| Documento | Conteúdo |
|-----------|----------|
| [MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md](MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md) | Mapa URL legado → loja |
| `../_redirects` · `../vercel.json` | Regras para hospedeiros com redirect HTTP |
| `../delivery/` | Stubs HTML (meta refresh) — GitHub Pages |

PDV Rust: redirect para `https://rust-pdv.caracore.com.br/`. Histórico: [archive/delivery-migracao/](archive/delivery-migracao/).

---

## Checklists e publicação

| Documento | Quando usar |
|-----------|-------------|
| [CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md](CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md) | Manutenção geral da matriz |
| [CHECKLIST_PUBLICACAO_ARTEFATOS_ETE_PDV.md](CHECKLIST_PUBLICACAO_ARTEFATOS_ETE_PDV.md) | Publicação de artefactos ETE / PDV |
| [VALIDACAO_LOJAS_MATRIZ.md](VALIDACAO_LOJAS_MATRIZ.md) | Antes de deploy que altere links matriz ↔ loja |

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

## Arquivo (`docs/archive/`)

| Pasta / documento | Conteúdo |
|-------------------|----------|
| [archive/README.md](archive/README.md) | Índice do arquivo |
| [archive/sessoes-trabalho/](archive/sessoes-trabalho/) | `VALIDACAO_NEGOCIO_HISTORICO.md`, `STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC_HISTORICO.md`, levantamentos |
| [archive/delivery-migracao/](archive/delivery-migracao/) | Desativação de `delivery/` |
| [archive/backend-auth/](archive/backend-auth/) | OAuth, Azure, fases 2–7 |

---

## Scripts úteis

| Script | Função |
|--------|--------|
| `../scripts/server.py` | Servidor local para preview |
| `../scripts/convert_docs_txt_to_md.py` | Conversão `.txt` → `.md` em `docs/` |

---

## Mapa rápido — todos os `.md` em `docs/` (raiz)

| Estratégia e ecossistema | Site e portfólio | Posicionamento |
|--------------------------|------------------|----------------|
| ECOSYSTEM_CARA_CORE.md | SITE_MATRIZ.md | DILEMA.md |
| ECOSYSTEM_LOJAS.md | PORTFOLIO_README.md | DILEMA_HISTORICO.md |
| COMPONENTES_LOJA.md | ECOSISTEMA.md | FEEDBACK.md |
| VALIDACAO_LOJAS_MATRIZ.md | ECOSSISTEMA_MAPA_VISUAL.md | |
| VALIDACAO_NEGOCIO.md | AREA51_PORTFOLIO.md | |
| STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md | | |

| Índice e fluxo | Checklists e rotas |
|----------------|-------------------|
| INDEX.md · INICIAR_NOVA_TAREFA.md | CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md |
| MEMORIA_DO_PROJETO.md · ECOSYSTEM_MEMORIA.md | CHECKLIST_PUBLICACAO_ARTEFATOS_ETE_PDV.md |
| FONTES_CANONICAS_MATRIZ_LOJAS.md | MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md |

| Outros |
|--------|
| MIGRACAO_IMAGENS.md · GOOGLE_ANALYTICS.md |
