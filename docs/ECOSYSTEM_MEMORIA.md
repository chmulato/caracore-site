# Memória do ecossistema — retomada de desenvolvimento

Referência única para alinhar **matriz**, **lojas**, **oficinas**, **wiki**, **retrô** e **releases** ao retomar trabalho.

**Atualizado:** 2026-06-02  
**Workspace típico:** `D:\dev\`  
**Guia de produtividade:** [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) ← use ao **iniciar nova tarefa**

---

## Retomada em 30 segundos

1. **Nova tarefa?** → [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) (fluxo por tipo de trabalho)
2. **Visão ecossistema:** este ficheiro + `ECOSYSTEM_CARA_CORE.txt` + `ECOSYSTEM_LOJAS.txt`
3. **Memória Cursor:** `.cursor/rules/project-memory.mdc` no repo ativo
4. **PDV Rust oficina:** `caracore-pdv-rust/docs/contexto-rapido.md` · `status.md` · `caracore-pdv-continuacao.mdc`
5. **Dois PDVs:** Java `pdv.*` (v3.1.2-free) + Rust vitrine `rust-pdv.*` + download **GitHub Releases** (v0.1.1) — **coexistência**

---

## Presenças web (jun/2026)

| Papel | URL | Repo |
|-------|-----|------|
| Matriz | https://www.caracore.com.br/ | caracore-site |
| Portfólio | https://www.caracore.com.br/portfolio.html | caracore-site |
| Eco Mundo (matriz) | https://www.caracore.com.br/ecosistema.html | caracore-site |
| Wiki | https://wiki.caracore.com.br/ | caracore-wiki |
| Retrô | https://retro.caracore.com.br/ | caracore-retro |
| Sala operações | https://tools.caracore.com.br/sala/ | caracore-site / caracore-mkt |
| PDV Java loja | https://pdv.caracore.com.br/ | caracore-pdv-releases |
| PDV Rust vitrine | https://rust-pdv.caracore.com.br/ | caracore-pdv-rust-releases |
| PDV Rust download | https://github.com/chmulato/caracore-rust-pdv-releases/releases | GitHub (artefatos) |

**Correção wiki (jun/2026):** portfólio **não** está em `wiki.caracore.com.br/portfolio.html` — usar **www**; wiki tem redirect stub.

---

## Modelo fixo (camadas)

| Camada | Repositório | Destino |
|--------|-------------|---------|
| **Matriz** | caracore-site | www.caracore.com.br |
| **Loja** | caracore-*-releases | *.caracore.com.br |
| **Releases** | GitHub *-releases | binários + SHA256 (PDV Rust) |
| **Oficina** | caracore-{produto} | código / CI |
| **Wiki** | caracore-wiki | wiki.caracore.com.br |
| **Retrô** | caracore-retro | retro.caracore.com.br |

**Regras:** CTAs → loja ou GitHub Releases · matriz → `portfolio.html#{âncora}` · PDV comparação → `#pdv-coexistencia` · sem `/delivery/` em links novos.

---

## PDV Desktop — referência rápida

| Papel | Repo / URL |
|-------|------------|
| Java maduro | pdv.caracore.com.br · v3.1.2-free · caracore-pdv |
| Rust piloto | rust-pdv (vitrine) · GitHub Releases v0.1.1 · caracore-pdv-rust |
| Coexistência | portfolio `#pdv-coexistencia` · não substituir Java |
| Comunicação | Retrô art. 114 · matriz jun/2026 · wiki projeto-pdv* |

**Discurso:** v3.1.x = Java · v0.1.x = Rust · V3 negócio (PME) = ambas · evitar “PDV v3” sozinho / “migração” / “substitui”.

---

## Âncoras portfólio (matriz)

| Produto | Âncora |
|---------|--------|
| PDV Java | `#caracore-pdv` |
| PDV Rust | `#caracore-pdv-rust` |
| Coexistência PDV | `#pdv-coexistencia` |
| Hub | `#caracore-hub` |
| Minerador 4.0 | `#minerador-ete` |
| Reino OIDC | `#reino-oidc` |
| Circuito | `#circuito-python` |
| Ink | `#caracore-ink-agenda` |
| Seed | `#caracore-seed` |
| Área 51 | `#area-51` |
| RU | `#caracore-ru` |
| CSO | `#caracore-cso` |
| MKT / Sala | `#caracore-mkt` |

---

## Repositórios e memória Cursor

| Repo | `project-memory.mdc` | Notas |
|------|----------------------|-------|
| caracore-site | Sim | ECOSYSTEM_* na raiz |
| caracore-wiki | Sim | Portfólio → www |
| caracore-retro | Sim | 103 artigos |
| caracore-pdv-rust | Sim + **continuacao.mdc** | Oficina PDV Rust |
| caracore-pdv-rust-releases | Sim | Loja rust-pdv |
| caracore-pdv / *-releases | Sim | PDV Java |
| Demais produtos | Sim | hub, ete, ink, ru, … |

Lista completa: `ECOSYSTEM_CARA_CORE.txt`.

---

## Estado recente do ecossistema (changelog)

| Data | Alteração |
|------|-----------|
| 2026-06-02 | Matriz: PDV Rust v0.1.1, CTAs → GitHub Releases |
| 2026-06-02 | Loja rust-pdv: nav Download → releases; Formatos |
| 2026-06-02 | Wiki: links portfólio corrigidos (www); redirect `portfolio.html` |
| 2026-06-02 | Retrô: artigo 114 PDV Rust/Tauri; doc ecossistema expandida |
| 2026-06-02 | `INICIAR_NOVA_TAREFA.md` — guia produtividade |

---

## Checklists publicação

1. `VALIDACAO_LOJAS_MATRIZ.txt`
2. `VALIDACAO_NEGOCIO.txt`
3. `CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md`
4. Loja Rust: `releases.js` · nav · transparência
5. Oficina Rust: `sync_docs_status.py --full`
6. Smoke: matriz → loja/releases → footer portfólio

---

## Documentos na matriz (índice)

| Documento | Uso |
|-----------|-----|
| [INDEX.md](INDEX.md) | Índice curado docs/ |
| [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) | **Início de tarefa** |
| [SITE_MATRIZ.md](SITE_MATRIZ.md) | Operar site matriz |
| [memoria-projeto.txt](memoria-projeto.txt) | Resumo repo matriz |
| `../ECOSYSTEM_CARA_CORE.txt` | Mapa repos |
| `../ECOSYSTEM_LOJAS.txt` | URLs canónicas |
| `../STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.txt` | Estratégia |
| `docs/archive/` | Histórico — não operação diária |

---

## Manutenção desta memória

Ao mudar **URL, release, repo ou regra de comunicação**:

1. Atualizar este ficheiro + `INICIAR_NOVA_TAREFA.md` (se afetar fluxo)
2. Atualizar `ECOSYSTEM_CARA_CORE.txt` / `ECOSYSTEM_LOJAS.txt`
3. Atualizar `project-memory.mdc` do(s) repo(s) tocados
4. Registar linha na tabela **changelog** acima

---

Cara Core Informática — uso interno.
