# Espelho de delivery — Suporte Área 51

Este diretório é o **portal de delivery do Suporte Área 51** no domínio da **Cara Core Informática (matriz)**.

## Onde está o quê

| Local | Papel | URL ou caminho |
|-------|--------|----------------|
| **Oficina (código)** | Repositório de desenvolvimento do sistema Área 51 | `D:\dev\caracore-area51` (chmulato/caracore-area51) |
| **Matriz (este diretório)** | Portal completo: apresentação do suporte, benefícios, como contratar, canal de feedback | `https://caracore.com.br/delivery/area51/` |
| **Loja online (vitrine)** | Repositório público de vitrine do suporte Área 51 | `https://chmulato.github.io/caracore-area51-releases/` |

## Conteúdo alinhado

- **Matriz:** index (hero, o que é o suporte, benefícios, como contratar), canal-feedback (e-mail, WhatsApp, Telegram; assunto Suporte Área 51).
- **Loja online:** index (hero, CTAs, pilares), canal-feedback. Mensagem alinhada à matriz: consultoria OAuth 2.1, OIDC, PKCE; solicitar suporte/orçamento.

## Links cruzados

- Na **matriz**: links para a **loja online** (chmulato.github.io/caracore-area51-releases) e para o portfólio (caracore.com.br/portfolio.html#area-51).
- Na **loja**: footer e CTAs apontam para a **matriz** (caracore.com.br/delivery/area51/) e para o portfólio.

Referência central do ecossistema de lojas: **ECOSYSTEM_LOJAS.md** (ou ECOSYSTEM_LOJAS.txt) na raiz do site. Mapeamento dos repositórios: **ECOSYSTEM_CARA_CORE.md** (ou .txt).

## Sincronizar matriz → loja

Na **oficina** (caracore-area51), use o script de delivery para publicar a vitrine na loja:

- Script: `scripts/delivery_vitrine_area51_to_releases.py`
- Token: `TOKEN_DELIVERY_CC_AREA_51_RELEASES`
- Ver: `caracore-area51/scripts/README_DELIVERY_AREA51_RELEASES.md`

---

Cara Core Informática — Suporte Área 51 — Delivery matriz.
