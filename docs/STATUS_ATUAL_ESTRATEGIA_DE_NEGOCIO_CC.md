# Status atual e estratégia de negócio

Documento executivo — estado actual e próximos passos.  
Uso interno. **Atualizado:** 2026-06-07.

Retomada / nova tarefa: [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) · [ECOSYSTEM_MEMORIA.md](ECOSYSTEM_MEMORIA.md)  
Posicionamento copy: [DILEMA.md](DILEMA.md)

Histórico detalhado (2025–2026, delivery/): [archive/sessoes-trabalho/STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC_HISTORICO.md](archive/sessoes-trabalho/STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC_HISTORICO.md)

Referências vivas: [ECOSYSTEM_CARA_CORE.md](ECOSYSTEM_CARA_CORE.md) · [ECOSYSTEM_LOJAS.md](ECOSYSTEM_LOJAS.md) · [VALIDACAO_LOJAS_MATRIZ.md](VALIDACAO_LOJAS_MATRIZ.md) · [VALIDACAO_NEGOCIO.md](VALIDACAO_NEGOCIO.md) · [SITE_MATRIZ.md](SITE_MATRIZ.md)

---

## 1. Visão estratégica (2026)

**Premissa:** consultoria boutique de **engenharia de software B2B** (~18 anos) + ecossistema de produtos em **Bunker Digital** como prova de entrega — sem braço de startup, sem discurso de “fábrica de apps”.

**Frase-guia (copy comercial PT):**  
*Alocação técnica dedicada ou consultoria por projeto — modelo B2B, código transparente no ambiente do cliente.*

**Pilares de comunicação:**

- Engenharia B2B: alocação dedicada, legados, entrega ágil contínua — sem escopo fechado
- Bunker Digital: soberania local, offline-first, arquitetura **híbrida** (FinOps/resiliência na vitrine — não anti-cloud)
- Decisão e impacto antes de lista de stacks (era IA)
- Loja própria por produto (subdomínio canónico)
- Matriz: portfólio + ecossistema + CTAs (não duplicar vitrines)

**Dois PDVs Desktop (mesmo CaraCore PDV):**

- Java · JavaFX — [pdv.caracore.com.br](https://pdv.caracore.com.br/) — **v3.2.2-free** (maduro)
- Rust + Tauri 2 — [pdv-rust](https://pdv-rust.caracore.com.br/) + GitHub Releases — **v0.1.2** (piloto)

**Internacional:** `aligned/en/` e `aligned/it/` — B2B engineering (espelho do posicionamento PT).

---

## 2. Estado actual — matriz (caracore-site)

### Copy e estrutura (jun/2026)

| Item | Estado |
|------|--------|
| Hero B2B + frase-guia | ✅ `index.html` |
| Secção `#engenharia-b2b` (3 pilares) | ✅ |
| Nav B2B (sem Operação/serviços PME) | ✅ |
| `suporte-local.html` (PME separado) | ✅ |
| Tom FinOps/híbrido (PT/EN/IT) | ✅ |
| “Nossa Operação” (boutique enxuta) | ✅ |
| Produtos: Decisão / Stack | ✅ |
| Portfólio `#decisoes-engenharia` (3 cases) | ✅ qualitativo — faltam métricas |
| EN/IT alinhados (B2B + contact) | ✅ |
| Termo “PJ” na copy comercial | ✅ removido |

### Infraestrutura editorial

- Portfólio: índice por categoria, Bunker, coexistência PDV, releases, sobre
- PDV Rust: vitrine pdv-rust; redirect `/delivery/pdv-rust`
- Documentação: `docs/` integralmente em Markdown; [INDEX.md](INDEX.md)
- Retrô: art. **115** (B2B/IA, 25/12) · art. **114** (PDV Rust, 20/12) — [retro.caracore.com.br](https://retro.caracore.com.br/)

**Páginas-chave:** `index.html` · `suporte-local.html` · `portfolio.html` · `ecosistema.html` · `aligned/` · `secure/`

**Ordem home PT:** Hero → Engenharia B2B → Antifragilidade → Produtos → Sobre → Contato (suporte PME: rodapé → `suporte-local.html`)

---

## 3. Estado por produto (resumo)

| Produto | Portfólio | Loja | Estado |
|---------|-----------|------|--------|
| PDV Java | `#caracore-pdv` | pdv.* | Entrega activa · v3.2.2-free |
| CaraCore PDV | `#caracore-pdv-rust` | pdv-rust + GitHub | Piloto v0.1.2 |
| Ink Agenda | `#caracore-ink-agenda` | ink.* | v2.0.0 estável |
| Minerador 4.0 | `#minerador-ete` | ete.* | Entrega activa |
| Reino OIDC | `#reino-oidc` | oidc.* | Entrega activa |
| Circuito Ferradura | `#circuito-python` | circuito.* | Entrega activa |
| Hub | `#caracore-hub` | hub.* | Evolução |
| Área 51 | `#area-51` | area51.* | Serviço |
| Seed | `#caracore-seed` | seed.* | Só informativo |
| Mkt / Sala | `#caracore-mkt` | mkt.* / tools/sala | Gratuito |
| RU Soberano | `#caracore-ru` | ru.* | Garagem → 18/06/2027 |
| Helianto | `#caracore-helianto` | helianto.caracore.com.br | Garagem → 30/12/2027 |
| CSO | `#caracore-cso` | cso.caracore.com.br | Aplicação · Transp. 08/11/2028 |

Wiki: [wiki.caracore.com.br](https://wiki.caracore.com.br/) (repo `caracore-wiki`)  
Retrô: [retro.caracore.com.br](https://retro.caracore.com.br/) — 104 artigos; editorial B2B art. 115

---

## 4. Modelo matriz ↔ loja

- **Matriz** apresenta e encaminha (resumo + CTAs + cases de decisão)
- **Loja** contém vitrine, download, wiki, feedback
- **Não** manter conteúdo comercial longo em `delivery/` — só redirects
- **Validação:** [VALIDACAO_LOJAS_MATRIZ.md](VALIDACAO_LOJAS_MATRIZ.md) antes de publicar

---

## 5. Próximos passos possíveis

### 5.1 Site matriz

- Publicar leva B2B + cases + docs em produção
- Smoke: home → `#engenharia-b2b` → portfólio `#decisoes-engenharia` → loja
- Inserir **métricas reais** nos 3 cases do portfólio

### 5.2 PDV

- Rust: evoluir piloto v0.1.x com feedback assistido
- Java: manter canal v3.2.x; Premium — divulgação de preço no portfólio (decisão comercial)
- Comunicação: `#pdv-coexistencia` como fonte única de comparação

### 5.3 Garagem

- RU: alinhar datas portfólio ↔ loja ↔ oficina
- CSO: aplicação em cso.caracore.com.br; alinhar datas Frotas/Transportes portfólio ↔ oficina
- Ecossistema: subgraph Garagem coerente com portfólio

### 5.4 Lojas (*-releases)

- CTAs “matriz” → `portfolio.html` ou `ecosistema.html`
- Ink: lançamento oficial 26/Jun/2026 — confirmar messaging

### 5.5 Processo

- Checklists: [VALIDACAO_NEGOCIO.md](VALIDACAO_NEGOCIO.md) + [CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md](CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md)
- Novo produto: [ECOSYSTEM_*.md](ECOSYSTEM_CARA_CORE.md) + portfólio + [COMPONENTES_LOJA.md](COMPONENTES_LOJA.md)

---

## 6. O que não é prioridade agora

- Recriar portais `delivery/` na matriz
- SEED na loja Rust
- Duplicar wikis comerciais na matriz
- Expandir documentação OAuth/backend no README ([archive/backend-auth/](archive/backend-auth/))

---

Cara Core Informática — documento para gestão interna e decisão executiva.
