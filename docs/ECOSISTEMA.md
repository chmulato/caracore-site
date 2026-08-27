# Ecossistema — `ecosistema.html`

Documentação operacional da página pública [ecosistema.html](../ecosistema.html).  
**Atualizado:** 2026-06-07 · Estilos: [assets/css/ecosistema.css](../assets/css/ecosistema.css)

**Papel na matriz:** mapa de produtos como **prova de entrega** da [engenharia B2B](../index.html#engenharia-b2b) — não substitui a home comercial nem o portfólio detalhado.

**Frase-guia (rodapé):** *Alocação técnica dedicada ou consultoria por projeto — modelo B2B, código transparente no ambiente do cliente.*

---

## 1. O que a página faz

| Para o visitante | Conteúdo |
|------------------|----------|
| Entender o ecossistema | Mapa em camadas, cards por produto, roadmap |
| Saber o que está pronto vs. planejado | Status, datas, tabela roadmap |
| Ir para a loja canónica | CTAs → `*.caracore.com.br` (nunca `/delivery/` como destino principal) |
| Contratar engenharia | Links → `#engenharia-b2b`, `#decisoes-engenharia`, `#contato` |

**Wiki paralela:** [wiki.caracore.com.br/ecosistema.html](https://wiki.caracore.com.br/ecosistema.html) — trilhas; matriz permanece canónica para mapa + CTAs institucionais.

---

## 2. Estrutura actual (implementada)

| Secção | ID / notas |
|--------|------------|
| Hero | `#ecossistema` — B2B + Bunker + link cases |
| Mapa visual | `#mapa-visual` — núcleo PDV, satélites, garagem, gratuitos |
| Bunker Digital | `#bunker-digital` — conceito + exemplo prático |
| Para quem | `#para-quem` — segmentos (varejo, indústria, educação…) |
| Valores | `#valores` — soberania híbrida, offline-first, modularidade, FinOps |
| Prateleira | `#prateleira` — cards PDV Java/Rust, Ink, OIDC, etc. |
| Pilares técnicos | `#pilares-tecnicos` |
| Lojas oficiais | `#lojas-oficiais` — tabela matriz ↔ subdomínio |
| Garagem | `#garagem` — Hub, RU, CSO |
| Roadmap | `#roadmap` — timeline + tabela |
| Arquitetura | `#arquitetura` — Mermaid integração |

**Navegação:** índice lateral `.eco-toc` · breadcrumb `.eco-breadcrumb` · links finais B2B / cases / portfólio / wiki / contato.

---

## 3. Versões e discurso PDV (fixo)

| Linha | Release | Loja |
|-------|---------|------|
| Java · JavaFX | **v3.2.2-free** | pdv.caracore.com.br |
| Rust + Tauri 2 | **v0.1.2** | pdv-rust + GitHub Releases |

- Coexistência: link para [portfolio.html#pdv-coexistencia](../portfolio.html#pdv-coexistencia)
- Evitar: “PDV v3” sozinho, “substitui”, “nova geração”

---

## 4. Alinhamento B2B (jun/2026)

| Item | Onde |
|------|------|
| Hero — produtos = prova de entrega B2B | `#ecossistema` |
| Link estudos de caso | `portfolio.html#decisoes-engenharia` |
| Nav matriz | Engenharia B2B · Produtos · Portfólio · Ecossistema (sem nav Operação/serviços PME) |
| Tom público | Híbrido/FinOps/resiliência — não “rejeita nuvem total” na vitrine |
| Meta / JSON-LD | title + description com B2B + versões actuais |
| Rodapé | Frase-guia + link `#engenharia-b2b` |
| TOC lateral | Engenharia B2B · Decisões e impacto |

---

## 5. Manutenção

### Ao lançar produto ou release

1. Actualizar card em `#prateleira` ou `#garagem`
2. Actualizar `#roadmap` e `#lojas-oficiais`
3. Sincronizar [ECOSYSTEM_LOJAS.md](ECOSYSTEM_LOJAS.md) e [VALIDACAO_LOJAS_MATRIZ.md](VALIDACAO_LOJAS_MATRIZ.md)
4. Se PDV: alinhar `portfolio.html`, loja e wiki

### Ao mudar copy B2B

- Hero, rodapé, TOC e meta de `ecosistema.html` em conjunto com `index.html` e [DILEMA.md](DILEMA.md)

### Pré-deploy

- [CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md](CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md)
- Smoke: ecossistema → loja → voltar ao portfólio `#decisoes-engenharia`

---

## 6. Melhorias futuras (backlog — não bloqueiam deploy)

| Prioridade | Melhoria |
|------------|----------|
| Baixa | Versão EN/IT do ecossistema (`aligned/` — hoje só PT) |
| Baixa | Schema.org `SoftwareApplication` por produto no JSON-LD |
| Baixa | Roadmap colapsável / timeline horizontal mais visual |
| Baixa | Lazy-load de imagens pesadas (se adicionadas) |

Ver também mapa visual: [ECOSSISTEMA_MAPA_VISUAL.md](ECOSSISTEMA_MAPA_VISUAL.md) · guia matriz: [SITE_MATRIZ.md](SITE_MATRIZ.md)
