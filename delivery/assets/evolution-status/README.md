# Status de Evolução (Seed) — Cara Core

Componente de UX/UI para comunicar que as lojas estão em fase **Seed** (evolução) e reforçar confiança com roadmap e canal de feedback.

## Conteúdo

| Arquivo | Uso |
|--------|-----|
| `evolution-status.css` | Estilos (usar quando preferir CSS externo) |
| `evolution-status.html` | Fragmento HTML (sem CSS embutido) |
| `evolution-status-inline.html` | **Fragmento único** com `<style>` + HTML — copiar e colar antes de `</body>` |

## Opção 1: Inline (uma única inclusão)

1. Abra `evolution-status-inline.html`.
2. Copie todo o conteúdo.
3. Cole **antes de `</body>`** em cada página da loja.

Não precisa de arquivo CSS externo; tudo está no fragmento.

## Opção 2: CSS externo + HTML

No `<head>` (ou antes do `</body>`):

```html
<link rel="stylesheet" href="assets/evolution-status/evolution-status.css">
```

Antes de `</body>`:

```html
<!-- Incluir conteúdo de evolution-status.html (sem as tags <style>) -->
```

Em **Thymeleaf**, por exemplo:

```html
<link rel="stylesheet" th:href="@{/assets/evolution-status/evolution-status.css}">
...
<div th:replace="~{fragments/evolution-status :: content}"></div>
```

Ou, com o fragmento no mesmo diretório da página (GitHub Pages):

```html
<link rel="stylesheet" href="assets/evolution-status/evolution-status.css">
<body>
  <!-- conteúdo da página -->
  <div th:replace="~{evolution-status}"></div>
</body>
```

## Personalização

- **WhatsApp:** altere o número em `href="https://wa.me/5541999097797?text=..."` no botão “Sugira uma melhoria”. O `text=` pode ser ajustado por loja.
- **Roadmap:** edite os itens em `<ul class="evo-roadmap-list">` (datas e textos).
- **Texto do tooltip:** altere o conteúdo de `<span class="evo-beta-tooltip">`.

## Paleta (Brand)

- **Verde Esmeralda:** `#059669`, `#10b981`, `#047857` — selo e CTAs.
- **Cinza Espacial:** `#1e293b`, `#475569`, `#94a3b8` — rodapé e texto.

Sem vermelho nem amarelo forte; foco em sustentabilidade e tecnologia.
