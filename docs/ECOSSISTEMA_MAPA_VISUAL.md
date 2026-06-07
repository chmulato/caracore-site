# Mapa visual do ecossistema — Cara Core Informática

Referência do **mapa em camadas** na matriz. **Implementado** em [ecosistema.html](../ecosistema.html) (`#mapa-visual`).

**Atualizado:** 2026-06-07

---

## 1. Onde está no site

| Local | Secção | Ficheiros |
|-------|--------|-----------|
| **Página dedicada (canónica)** | `#mapa-visual` | `ecosistema.html` · `assets/css/ecosistema.css` (`.eco-map*`) |
| Portfólio | Links por produto | `portfolio.html#{produto}` |
| Wiki | Visão expandida | wiki.caracore.com.br/ecosistema.html |

**Modelo de roteamento (2026):** matriz **apresenta e encaminha** → loja `*.caracore.com.br` é vitrine oficial. `/delivery/` = redirect legado apenas.

---

## 2. Camadas do mapa (`.eco-map`)

```text
                    [ PDV Java ]  [ PDV Rust ]
              ─── Núcleo Bunker · SQLite · offline-first ───
    OIDC · Minerador · Circuito · Ink · Área 51  (satélites)
              MKT gratuito · Seed institucional
              Hub · RU · CSO  (Garagem — datas futuras)
```

| Camada | Classe CSS | Conteúdo |
|--------|------------|----------|
| Núcleo | `.eco-map-node--nucleo` | PDV Java + PDV Rust |
| Bunker | `.eco-map-core` | SQLite local, offline-first |
| Satélites | `.eco-map-node--satelite` | OIDC, ETE, Circuito, Ink, Área 51 |
| Gratuitos | `.eco-map-node--gratuito` | MKT, Seed |
| Garagem | `.eco-map-node--garagem` | Hub (Abr/2027), RU (Jun/2027), CSO (Nov/2028) |

Legenda: `.eco-map-legend` — Prateleira · Educação · Garagem · Gratuito.

Nós clicáveis apontam para `portfolio.html#{âncora}` ou URL da loja quando aplicável.

---

## 3. Diagrama Mermaid (opcional / arquivo)

Existe um diagrama estático em:

`assets/images/portfolio/ecossistema-cara-core.mmd`

Pode ser incorporado no portfólio ou wiki se quiser **segunda representação** (Mermaid já usado em `#arquitetura` dentro de `ecosistema.html`). O mapa **interactivo em HTML** em `#mapa-visual` é a referência principal na matriz.

---

## 4. Tabela matriz ↔ loja

Na mesma página: secção `#lojas-oficiais` — uma linha por produto com subdomínio canónico.

Fonte viva de URLs: [ECOSYSTEM_LOJAS.md](ECOSYSTEM_LOJAS.md) · validação: [VALIDACAO_LOJAS_MATRIZ.md](VALIDACAO_LOJAS_MATRIZ.md).

---

## 5. Relação com posicionamento B2B

O mapa responde **“o que construímos?”** — produtos Bunker como prova de entrega.

A oferta comercial (**“contratar engenharia”**) fica na home (`#engenharia-b2b`) e nos cases (`portfolio.html#decisoes-engenharia`). O ecossistema liga-se a isso via hero, TOC, links finais e frase-guia no rodapé — ver [ECOSISTEMA.md](ECOSISTEMA.md).

---

## 6. Manutenção do mapa

Ao adicionar produto na Garagem ou Prateleira:

1. Novo nó em `.eco-map-row` (classe correcta por camada)
2. Entrada em `#lojas-oficiais` quando houver loja
3. Card em `#prateleira` ou `#garagem`
4. Actualizar `ECOSYSTEM_LOJAS.md`

Não duplicar vitrine longa na matriz — resumo + CTA para loja.
