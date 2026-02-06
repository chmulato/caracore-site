# Espelho de delivery — CaraCore Hub

Este diretório é o **portal de delivery do CaraCore Hub** no domínio da **Cara Core Informática (matriz)**.

## Onde está o quê

| Local | Papel | URL (exemplo) |
|-------|--------|----------------|
| **Matriz (este diretório)** | Portal completo de delivery no site Cara Core | `https://caracore.com.br/delivery/hub/` |
| **Vitrine** | Repositório público de vitrine e releases | `https://chmulato.github.io/caracore-hub-releases/` |

## Conteúdo alinhado

- **index.html** — Apresentação do Hub (gestão logística, e-commerce, SQLite, autonomia local), links para Download, Canal de feedback, Tecnologia, Portfólio e Vitrine (caracore-hub-releases).
- **download.html** — WAR/Tomcat, SQLite, link para GitHub Releases (releases/latest).
- **canal-feedback.html** — E-mail, WhatsApp, Telegram (suporte@caracore.com.br, assunto CaraCore Hub).
- **tecnologia.html** — Stack: Java/Jakarta EE, SQLite, Tomcat, Flyway; Redis opcional.

Em ambas (matriz e vitrine), a seção **Negócios aplicáveis** menciona o projeto **Tia Sócia** como exemplo de negócio para o qual o Hub foi pensado (gestão logística, e-commerce, marketplaces). A **apresentação Tia Sócia** (pitch deck, 21 slides) está disponível em ambas:

- **Matriz:** `delivery/hub/slides/apresentacao_tia_socia.html`
- **Vitrine:** `slides/apresentacao_tia_socia.html` (em caracore-hub-releases)

Cada uma usa **assets** separados na pasta `slides/`:

- **slides/assets/css/apresentacao-tia-socia.css** — estilos da apresentação
- **slides/assets/js/apresentacao-tia-socia.js** — lógica (slides, áudio, modal “Ler texto”)
- **slides/assets/img/** — imagens dos slides (`cara_core_hub_slide_01.png` … `cara_core_hub_slide_21.png`)
- **slides/assets/audio/** — (opcional) narrações por slide, se houver: `slide_01_naracao_natural.mp3`, etc.

O conteúdo das páginas da **matriz** e da **vitrine** é equivalente em mensagem; a matriz usa links relativos para as páginas do hub e URLs absolutas para portfólio e vitrine.

## Links cruzados

- Na **matriz**: footer e nav apontam para a **vitrine** (chmulato.github.io/caracore-hub-releases) e para o portfólio (caracore.com.br/portfolio.html#caracore-hub).
- Na **vitrine**: footer pode apontar para o **delivery matriz** (caracore.com.br/delivery/hub/) e para o portfólio.

## Estilo

O portal usa `assets/css/hub-portal.css`, inspirado em `delivery/seed/assets/css/seed-portal.css` (tema escuro, Inter, variáveis --accent-blue, --accent-gold, --accent-green).

---

*Cara Core Informática — CaraCore Hub — Delivery matriz.*
