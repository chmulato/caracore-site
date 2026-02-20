# Validação: Selo StartUp (Seed) e links externos — Lojas GitHub

**Data:** 06/02/2026  
**Escopo:** 8 lojas (Área 51, ETE Minerador 4.0, HUB, PDV, Soberania RU, Contador Seed, Circuito Python, Reino OIDC)

---

## 1. Selo de StartUp (Seed) para sugestões

| Loja | Páginas com selo | Total HTML | Status |
|------|------------------|------------|--------|
| **Área 51** | 2 | 2 | OK |
| **ETE Minerador 4.0** | 4 | 14 | **10 páginas sem selo** |
| **HUB** | 7 (raiz + docs) | — | OK |
| **PDV** | 3 | 4 | **tecnologia.html sem selo** |
| **Soberania RU** | 5 | 5 | OK |
| **Contador Seed** | 8 | 8 | OK |
| **Circuito Python** | 5 | 5 | OK |
| **Reino OIDC** | 4 | 19 | **15 páginas sem selo** |

### Páginas que precisavam do selo (já corrigidas)

- **PDV:** `docs/tecnologia.html` ✓
- **ETE:** index_v2, artigo_ete_v3, painel-simbiotico, painel-convergencia, serie-decantadores-ph, upgrade-ouro40, termos-uso-creditos, licenca-uso, licencas_ete, laboratorio_campo_largo ✓
- **Reino OIDC:** caminho_feliz, mundo_do_conhecimento, glossario, personagens, mapas, conclusao, upgrade-trono, conteudo-free, mapa_evolucao, aprendiz, super_trunfo, historia_p1, historia_p2, historia_p3, acesso_negado ✓

**Nota ETE:** usar sempre o CSS dourado em `docs/assets/evolution-status/evolution-status.css`.

---

## 2. Links para fora do GitHub (caracore.com.br)

Objetivo: evitar links que apontam para fora do GitHub (portfolio, delivery/...) para não gerar inconsistência com clientes e visitantes. **Padrão de referência:** loja Seed (breadcrumb/rodapé com texto "Portfólio: caracore.com.br" sem `href`; links só internos e GitHub).

| Loja | Links externos encontrados | Ação |
|------|----------------------------|------|
| **Área 51** | portfolio, delivery/area51 | ✓ Ajustado (index, canal-feedback) |
| **ETE** | Nenhum (ou já tratado) | OK |
| **HUB** | portfolio, delivery/hub (docs + raiz) | Pendente: substituir por interno/texto |
| **PDV** | portfolio, delivery/pdv | ✓ Ajustado (index, download, tecnologia, canal-feedback) |
| **Soberania RU** | portfolio, delivery/ru | Pendente: substituir por interno/texto |
| **Contador Seed** | Já ajustado | OK |
| **Circuito Python** | portfolio, delivery/circuito | ✅ Concluído (19/02/2026): curso interno `curso/index.html`; CTA primary relativo; loja e matriz alinhadas |
| **Reino OIDC** | portfolio, delivery/oidc | ✅ Parcial (index: navbar + footer); demais páginas pendentes |

---

## 3. Resumo de ações

1. **Selo:** ✓ Concluído. Componente (link CSS + badge + rodapé roadmap + FAB WhatsApp) incluído em PDV (tecnologia.html), ETE (10 páginas) e Reino OIDC (15 páginas).
2. **Links:** ✓ PDV e Área 51 totalmente ajustados. ✓ Reino OIDC index (navbar + footer). **Pendente:** HUB (docs + raiz), RU, Circuito Python e demais páginas do Reino OIDC (download, canal-feedback, licenca-uso, glossario, conteudo-free) — trocar links para `caracore.com.br` por navegação interna (index.html) e/ou texto sem link ("Portfólio: caracore.com.br", "Matriz: caracore.com.br"), seguindo o padrão da loja Seed.
