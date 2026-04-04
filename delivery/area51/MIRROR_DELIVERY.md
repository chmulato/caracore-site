# Espelho de delivery — Suporte Área 51

Este diretório é o **portal de delivery do Suporte Área 51** no domínio da **Cara Core Informática (matriz)**.

## Onde está o quê

| Local | Papel | URL ou caminho |
|-------|--------|----------------|
| **Oficina (código)** | Repositório de desenvolvimento do sistema Área 51 | `D:\dev\caracore-area51` (chmulato/caracore-area51) |
| **Matriz (este diretório)** | Portal completo: apresentação do suporte, benefícios, como contratar, canal de feedback | `https://caracore.com.br/delivery/area51/` |
| **Loja online (vitrine)** | Repositório público de vitrine do suporte Área 51 | `https://area51.caracore.com.br/` |

## Conteúdo alinhado

- **Matriz:** index (hero, o que é o suporte, Cara ↔ Crachá, benefícios, como contratar), download (o que o serviço entrega, Cara ↔ Crachá, serviço contratado), licenca-uso (licença proprietária, PI, uso e responsabilidade), canal-feedback.
- **Loja online:** index (hero, CTAs, Reino das Entidades Federadas, Cara ↔ Crachá), download (o que o serviço entrega, serviço contratado), licenca-uso, canal-feedback. Mensagem alinhada à matriz: Suporte Área 51 = serviço contratado; sem data de lançamento; licença proprietária; solicitar orçamento.

> **Regra de espelho:** a Matriz define as páginas; a Loja espelha. Novas páginas devem ser criadas na Matriz primeiro e depois replicadas na Loja via script de delivery.

## Links cruzados

- Na **matriz**: links para a **loja online** (area51.caracore.com.br) e para o portfólio (caracore.com.br/portfolio.html#area-51).
- Na **loja**: footer e CTAs apontam para a **matriz** (caracore.com.br/delivery/area51/) e para o portfólio.

Referência central do ecossistema de lojas: **ECOSYSTEM_LOJAS.md** (ou ECOSYSTEM_LOJAS.txt) na raiz do site. Mapeamento dos repositórios: **ECOSYSTEM_CARA_CORE.md** (ou .txt).

## Sincronizar matriz → loja

Na **oficina** (caracore-area51), use o script de delivery para publicar a vitrine na loja:

- Script: `scripts/delivery_vitrine_area51_to_releases.py`
- Token: `TOKEN_DELIVERY_CC_AREA_51_RELEASES`
- Ver: `caracore-area51/scripts/README_DELIVERY_AREA51_RELEASES.md`

---

Cara Core Informática — Suporte Área 51 — Delivery matriz.
