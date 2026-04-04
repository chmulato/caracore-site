# Status de Evolução (Seed) — Aplicado nas lojas GitHub Pages

Estratégia aplicada nas **8 lojas** de demonstração. Domínio da matriz: **Cara Core Informática** (caracore.com.br).

---

## O que foi feito em cada repositório

### 1. caracore-area51-releases
- **CSS:** `docs/assets/evolution-status/evolution-status.css`
- **Páginas com componente:** `docs/index.html`, `docs/canal-feedback.html`

### 2. caracore-ete-releases
- **CSS:** `docs/assets/evolution-status/evolution-status.css`
- **Páginas com componente:** `docs/index.html`, `docs/download.html`, `docs/canal-feedback.html`, `docs/apostila_efluentes.html`
- **Páginas sem componente (opcional):** index_v2, artigo_ete_v3, licencas_ete, serie-decantadores-ph, painel-convergencia, painel-simbiotico, upgrade-ouro40, termos-uso-creditos, licenca-uso, laboratorio_campo_largo

### 3. caracore-hub-releases
- **CSS:** `assets/evolution-status/evolution-status.css` (na **raiz** do repo; páginas principais estão na raiz)
- **Páginas com componente:** `index.html`, `download.html`, `canal-feedback.html`
- **Páginas sem componente (opcional):** `tecnologia.html`
- **Nota:** O Hub usa HTML na raiz; o path do CSS é `assets/evolution-status/evolution-status.css`.

### 4. caracore-pdv-releases
- **CSS:** `docs/assets/evolution-status/evolution-status.css`
- **Páginas com componente:** `docs/index.html`, `docs/download.html`, `docs/canal-feedback.html`
- **Páginas sem componente (opcional):** `docs/tecnologia.html`

### 5. caracore-ru-releases
- **CSS:** `docs/assets/evolution-status/evolution-status.css`
- **Páginas com componente:** `docs/index.html`
- **Páginas sem componente (opcional):** download, canal-feedback, licenca-uso, manual-tecnico

### 6. caracore-seed-releases
- **CSS:** `docs/assets/evolution-status/evolution-status.css`
- **Páginas com componente:** `docs/index.html`
- **Páginas sem componente (opcional):** ativacao, canal-feedback, compra, download, portal-controle, readme, tecnologia

### 7. circuito-python-releases
- **CSS:** `docs/assets/evolution-status/evolution-status.css`
- **Páginas com componente:** `docs/index.html`
- **Páginas sem componente (opcional):** download, canal-feedback, licenca-uso, portal-escolas

### 8. reino-oidc-releases
- **CSS:** `docs/assets/evolution-status/evolution-status.css`
- **Páginas com componente:** `docs/index.html`
- **Páginas sem componente (opcional):** todas as demais (download, canal-feedback, conteudo-free, etc.)

---

## Como adicionar o componente em mais páginas

Em qualquer HTML da loja:

1. **No `<head>`**, após os outros CSS:
   ```html
   <link rel="stylesheet" href="assets/evolution-status/evolution-status.css">
   ```
   (No **Hub**, as páginas estão na raiz, então o path é o mesmo. Nos outros repos, as páginas estão em `docs/`, então o path relativo é `assets/...`.)

2. **Antes de `</body>`**, colar o fragmento:
   ```html
   <div class="evo-beta-wrap" aria-hidden="true"><span class="evo-beta-badge" title="Versão de teste oficial">Seed<span class="evo-beta-tooltip">Esta é uma versão oficial de teste da Cara Core Informática para parceiros do Plano Premium+.</span></span></div>
   <footer class="evo-roadmap-footer" role="contentinfo"><p class="evo-roadmap-title">Próximos passos</p><ul class="evo-roadmap-list"><li>Domínio próprio <span class="evo-roadmap-tag">Março/2026</span></li><li>Integração PIX nativa</li><li>IA para estoque</li></ul></footer>
   <div class="evo-feedback-fab"><a href="https://wa.me/5541999097797?text=Olá!%20Sugestão%20de%20melhoria%20para%20a%20loja%20em%20fase%20Seed%20—%20Cara%20Core%20Informática." class="evo-feedback-btn" target="_blank" rel="noopener noreferrer" aria-label="Sugira uma melhoria pelo WhatsApp"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Sugira uma melhoria</a></div>
   ```

---

## Resumo

| Loja | CSS criado | Páginas com Seed (mínimo) |
|------|------------|---------------------------|
| Área 51 | ✓ docs/assets/evolution-status/ | index, canal-feedback |
| ETE | ✓ docs/assets/evolution-status/ | index, download, canal-feedback, apostila_efluentes |
| HUB | ✓ assets/evolution-status/ (raiz) | index, download, canal-feedback |
| PDV | ✓ docs/assets/evolution-status/ | index, download, canal-feedback |
| RU | ✓ docs/assets/evolution-status/ | index |
| Seed | ✓ docs/assets/evolution-status/ | index |
| Circuito Python | ✓ docs/assets/evolution-status/ | index |
| Reino OIDC | ✓ docs/assets/evolution-status/ | index |

Todas as lojas passam a exibir o **selo Seed**, o **rodapé de roadmap** e o **botão "Sugira uma melhoria"** (WhatsApp) nas páginas onde o componente foi injetado. Para estender às demais páginas de cada repo, use o mesmo link de CSS e o mesmo fragmento HTML acima.
