# Levantamento â€” PrÃ³xima IteraÃ§Ã£o de Input

**Data:** Junho de 2025
**Escopo:** Matriz (caracore.com.br) + todas as lojas (GitHub Pages) do ecossistema Cara Core
**Objetivo:** Relacionar o que precisa ser ajustado em uma prÃ³xima rodada de ediÃ§Ã£o

---

## Resumo do que foi executado nesta sessÃ£o

| Produto | Arquivo | AÃ§Ã£o | Status |
|---------|---------|------|--------|
| Hub | delivery/hub/index.html | Data 2026 â†’ 2027 | âœ… |
| Hub | delivery/hub/download.html | Data 2026 â†’ 2027 | âœ… |
| Hub | portfolio.html | Data 2026 â†’ 2027 | âœ… |
| Hub | caracore-hub-releases/download.html | Data 2026 â†’ 2027 | âœ… |
| RU | delivery/ru/index.html | Data 2026 â†’ 2027 (8 ocorrÃªncias) | âœ… |
| RU | delivery/ru/MIRROR_DELIVERY.md | Data 2026 â†’ 2027 | âœ… |
| RU | caracore-ru-releases/README.md | Data 2026 â†’ 2027 | âœ… |
| RU | caracore-ru-releases/docs/MIRROR_DELIVERY.md | Data 2026 â†’ 2027 | âœ… |
| RU | caracore-ru-releases/docs/download.html | Data 2026 â†’ 2027 | âœ… |
| CSO | delivery/cso/index.html | Data 2026 â†’ 2028 (6 ocorrÃªncias) | âœ… |
| CSO | caracore-cso-releases/README.md | Data + tabela roadmap | âœ… |
| CSO | caracore-cso-releases/docs/assets/js/main.js | Countdown 2026 â†’ 2028 | âœ… |
| CSO | caracore-cso-releases/PLAINTEXT.TXT | DATA MESTRE 2026 â†’ 2028 | âœ… |
| CSO | caracore-cso-releases/docs/index.html | Data 2026 â†’ 2028 (4 ocorrÃªncias) | âœ… |
| Ãrea 51 | delivery/area51/index.html | Mensagem serviÃ§o pago + startup + OIDC como prova | âœ… |
| Ãrea 51 | caracore-area51-releases/docs/index.html | Idem | âœ… |

---

## 1. CRÃTICO â€” Datas no passado sem decisÃ£o

### 1.1 CaraCore PDV â€” "03 de marÃ§o de 2026"

**OcorrÃªncias:**

- `delivery/pdv/index.html` â€” banner de status (linha ~72): "PrÃ©-lanÃ§amento oficial em **03 de marÃ§o de 2026**"
- `delivery/pdv/download.html` â€” provavelmente tem a data tambÃ©m (nÃ£o lido nesta sessÃ£o)
- `caracore-pdv-releases/docs/index.html` â€” a verificar
- `caracore-pdv-releases/docs/download.html` â€” a verificar

**SituaÃ§Ã£o:** A data passou. O banner diz "rc1 disponÃ­vel" â€” o produto estÃ¡ tecnicamente disponÃ­vel para degustaÃ§Ã£o. HÃ¡ duas opÃ§Ãµes:

- **OpÃ§Ã£o A:** Atualizar para nova data de lanÃ§amento oficial (pede decisÃ£o: qual data?)
- **OpÃ§Ã£o B:** Trocar o banner para "Em produÃ§Ã£o" ou "DisponÃ­vel para degustaÃ§Ã£o â€” versÃ£o 1.0.17-rc1" removendo a referÃªncia futura ao lanÃ§amento oficial

**PendÃªncia:** Aguardar decisÃ£o sobre o que priorizar para o PDV.

---

### 1.2 Cara Core Ink Agenda â€” "26 de junho de 2026"

**OcorrÃªncias:**

- `delivery/ink/index.html` â€” banner principal, tagline e footer
- `delivery/ink/` â€” provavelmente em download.html tambÃ©m
- `caracore-ink-releases/README.md` â€” "LanÃ§amento oficial: 26 de Junho de 2026"
- `caracore-ink-releases/docs/index.html` â€” a verificar
- `caracore-ink-releases/docs/download.html` â€” a verificar

**SituaÃ§Ã£o:** Mesma lÃ³gica do PDV. Data passou. O app v2.0 (desktop Windows) ainda nÃ£o foi lanÃ§ado, mas hÃ¡ versÃ£o Android na Play Store como "versÃ£o anterior" em produÃ§Ã£o.

**PendÃªncia:** Decidir nova data ou mudar o enquadramento para "em desenvolvimento".

---

### 1.3 Ãrea 51 loja â€” "02 de agosto de 2026" âœ… RESOLVIDO NESTA SESSÃƒO

**OcorrÃªncias corrigidas:**

- `caracore-area51-releases/docs/index.html` â€” card de download: substituÃ­do por "Releases a publicar. Contrate o Suporte Ãrea 51 para implementaÃ§Ã£o."
- `caracore-area51-releases/docs/index.html` â€” footer: substituÃ­do por "ServiÃ§o contratÃ¡vel."

---

## 2. DESIGN â€” InconsistÃªncia de stack CSS/JS entre produtos

| Produto | Stack front-end |
|---------|----------------|
| PDV | **Tailwind CSS CDN** + Font Awesome CDN + `portal-style.css` |
| Reino OIDC | **Bootstrap 5** (CDN) + `style.css` |
| Todos os outros | **Vanilla CSS** + Inter (Google Fonts) |

**SituaÃ§Ã£o:** PDV e OIDC tÃªm dependÃªncias de CDN externas (Tailwind, Bootstrap, Font Awesome). Os demais sÃ£o auto-contidos. Isso nÃ£o Ã© um bug, mas gera:

- Risco de CDN fora do ar / breaking changes
- PÃ¡gina mais pesada (Tailwind CDN carrega a engine completa via JavaScript)
- Identidade visual menos uniforme

**PendÃªncia futura:** Quando houver energia para revisÃ£o visual, avaliar migraÃ§Ã£o do PDV para o padrÃ£o `vanilla CSS + Inter` do ecossistema. Baixa urgÃªncia.

---

## 3. INFRAESTRUTURA â€” PadrÃµes de URL nas lojas

| Produto | URL da loja | PadrÃ£o? |
|---------|-------------|---------|
| Hub | `hub.caracore.com.br/` | âœ… |
| CSO | `cso.caracore.com.br/` | âœ… |
| RU | `ru.caracore.com.br/` | âœ… |
| Ãrea 51 | `area51.caracore.com.br/` | âœ… |
| PDV | `pdv.caracore.com.br/` | âœ… |
| Ink Agenda | `ink.caracore.com.br/` | âœ… |
| Seed | `seed.caracore.com.br/` | âœ… |
| Minerador 4.0 | `ete.caracore.com.br/` | âœ… |
| Reino OIDC | `oidc.caracore.com.br/` | âš ï¸ fora do padrÃ£o |
| Circuito Ferradura | `circuito.caracore.com.br/` | âœ… |

**PendÃªncia:**

- **OIDC:** O nome do repositÃ³rio Ã© `reino-oidc-releases` em vez de `caracore-oidc-releases`. NÃ£o Ã© bloqueante, mas quebra o padrÃ£o visual da URL. Renomear o repositÃ³rio eventualmente (operaÃ§Ã£o simples no GitHub, mas afeta todos os links externos existentes).
- **Circuito:** O download aponta direto para GitHub Releases, nÃ£o para um site GitHub Pages. NÃ£o tem loja/vitrine Pages completa como os demais. Avaliar se cabe criar estrutura `docs/` para o repo `circuito-python-releases`.

---

## 4. CONTEÃšDO â€” Componente evolution-status nas lojas

O documento `delivery/EVOLUTION_STATUS_APLICADO_LOJAS.md` lista 8 lojas com o componente. **Faltam dois:** CSO e Ink.

| Loja | evolution-status aplicado? |
|------|--------------------------|
| caracore-area51-releases | âœ… |
| caracore-ete-releases | âœ… |
| caracore-hub-releases | âœ… |
| caracore-pdv-releases | âœ… |
| caracore-ru-releases | âœ… |
| caracore-seed-releases | âœ… |
| circuito-python-releases | âœ… |
| reino-oidc-releases | âœ… |
| **caracore-cso-releases** | âŒ nÃ£o listado |
| **caracore-ink-releases** | âŒ nÃ£o listado |

**PendÃªncia:** Adicionar o componente `evolution-status` Ã s pÃ¡ginas principais de CSO e Ink seguindo o padrÃ£o de `EVOLUTION_STATUS_APLICADO_LOJAS.md`, e atualizar o documento com as entradas de CSO e Ink.

---

## 5. LINK CORRUPÃ‡ÃƒO â€” HTTP em vez de HTTPS

**OcorrÃªncia:**

- `delivery/pdv/consultoria.html` â€” rodapÃ©: `http://www.caracore.com.br` (HTTP, nÃ£o HTTPS, sem slug `/`)

**PendÃªncia:** Corrigir para `https://caracore.com.br` no rodapÃ© de consultoria.html do PDV.

---

## 6. SEED â€” Lista de produtos desatualizada

Na delivery/seed/index.html, o card "O que Ã© o CaraCore Seed?" cita:
> "Centraliza a contabilidade de clientes e licenÃ§as do ecossistema Cara Core (PDV, Minerador 4.0, Reino OIDC, Hub)"

**SituaÃ§Ã£o:** Hub estÃ¡ listado mas nÃ£o foi lanÃ§ado ainda (2027). Quando lanÃ§ar, a lista estÃ¡ certa. Mas CSO, RU, Ink Agenda e Ãrea 51 nÃ£o aparecem. Em uma prÃ³xima iteraÃ§Ã£o, atualizar a lista para refletir o ecossistema completo. Baixa urgÃªncia.

---

## 7. OIDC â€” Estilo visual diferente

O portal `delivery/oidc/index.html` usa Bootstrap 5 com navegaÃ§Ã£o em topo, listas de links expandÃ­veis e design totalmente diferente dos demais portais. TambÃ©m usa emoji no navbar (`ðŸ° Reino OIDC`).

**SituaÃ§Ã£o:** O OIDC Ã© um produto educacional com identidade prÃ³pria ("saga", "personagens"), entÃ£o alguma diferenÃ§a de estilo Ã© intencional. Mas em uma prÃ³xima revisÃ£o de branding, avaliar se faz sentido aproximar o header e o breadcrumb do padrÃ£o usado em hub/cso/ru etc.

**PendÃªncia:** Baixa urgÃªncia. Avaliar na prÃ³xima revisÃ£o de identidade visual.

---

## 8. PDV â€” "Pronto para 2026" no menu e "Reforma 2026"

**OcorrÃªncia:**

- `delivery/pdv/index.html` â€” item do menu `href="#fiscal"` com texto "Pronto para 2026"
- Meta description e cards: "Reforma TributÃ¡ria 2026", "Blindagem fiscal 2026"

**SituaÃ§Ã£o:** Esses sÃ£o parte do posicionamento de produto (o PDV foi pensado para a Reforma TributÃ¡ria). Com o passar do tempo, a referÃªncia "2026" no menu pode parecer desatualizada. Em algum momento, avaliar se o menu item vira "Pronto para a Reforma" (sem ano) ou "Reforma TributÃ¡ria".

**PendÃªncia:** Baixa urgÃªncia. DecisÃ£o editorial.

---

## 9. ECOSYSTEM_LOJAS.txt â€” Validar apÃ³s mudanÃ§as desta sessÃ£o

O arquivo `d:\dev\caracore-site\ECOSYSTEM_LOJAS.txt` mapeia os URLs de todos os produtos. ApÃ³s as datas de Hub (2027), RU (2027) e CSO (2028) terem sido atualizadas nesta sessÃ£o, verificar se hÃ¡ referÃªncias a datas dentro do `ECOSYSTEM_LOJAS.txt` que precisem acompanhar.

**PendÃªncia:** Ler e verificar se `ECOSYSTEM_LOJAS.txt` tem datas que precisem ser atualizadas.

---

## 10. STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.txt â€” Sincronizar

O arquivo raiz `d:\dev\caracore-site\STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.txt` Ã© o documento mestre de estratÃ©gia. ApÃ³s as datas de Hub, CSO, RU e o messaging de Ãrea 51 terem mudado nesta sessÃ£o, verificar se o documento mestre ainda reflete a realidade atualizada.

**PendÃªncia:** Ler e atualizar as seÃ§Ãµes de roadmap e posicionamento do Ãrea 51 dentro do documento de estratÃ©gia.

---

## Matriz de priorizaÃ§Ã£o para a prÃ³xima rodada

| # | Item | UrgÃªncia | EsforÃ§o |
|---|------|----------|---------|
| 1 | PDV â€” decisÃ£o sobre data passada (03/03/2026) | Alta | Baixo |
| 2 | Ink â€” decisÃ£o sobre data passada (26/06/2026) | Alta | Baixo |
| 3 | ~~Ãrea 51 loja â€” remover "02/08/2026" do card download~~ | ~~Alta~~ | âœ… Feito |
| 4 | Sincronizar STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.txt | MÃ©dia | MÃ©dio |
| 5 | Sincronizar ECOSYSTEM_LOJAS.txt | MÃ©dia | Baixo |
| 6 | Evolution-status nas lojas CSO e Ink | MÃ©dia | MÃ©dio |
| 7 | Corrigir HTTP â†’ HTTPS em PDV/consultoria.html | MÃ©dia | MÃ­nimo |
| 8 | Seed â€” atualizar lista de produtos | Baixa | MÃ­nimo |
| 9 | ~~Circuito â€” avaliar criar loja Pages dedicada~~ | ~~Baixa~~ | âœ… Feito (19/02/2026) |
| 10 | OIDC â€” renomear repo ou aceitar URL diferente | Baixa | MÃ©dio |
| 11 | PDV â€” harmonizaÃ§Ã£o visual (Tailwind â†’ vanilla CSS) | Baixa | Alto |
| 12 | PDV â€” "Pronto para 2026" no menu (decisÃ£o editorial) | Baixa | MÃ­nimo |
| 13 | OIDC â€” aproximar header/branding do padrÃ£o | Baixa | MÃ©dio |

---

## SessÃ£o 19/02/2026 â€” Executado

| Produto | Arquivo | AÃ§Ã£o | Status |
|---------|---------|------|--------|
| Circuito | `caracore-circuito-releases/docs/index.html` | MIT â†’ proprietÃ¡rio (12 ocorrÃªncias) | âœ… |
| Circuito | `delivery/circuito/index.html` | MIT â†’ proprietÃ¡rio; hero CTA â†’ relativo | âœ… |
| Circuito | `delivery/circuito/curso/` | Curso HTML 6 fases copiado da oficina (`pages_ferradura/`) | âœ… |
| Circuito | `caracore-circuito-releases/docs/curso/` | Curso HTML 6 fases copiado para loja | âœ… |
| Circuito | CTA hero (loja e matriz) | `github.io/circuito_python/` â†’ `curso/index.html` relativo | âœ… |
| Circuito (loja) | nav-card LicenÃ§a | Adicionado "LicenÃ§a proprietÃ¡ria â€” nÃ£o Ã© MIT, nÃ£o Ã© open source" | âœ… |
| Circuito (matriz) | nav-card LicenÃ§a | Adicionado "LicenÃ§a proprietÃ¡ria â€” nÃ£o Ã© MIT, nÃ£o Ã© open source" | âœ… |
| OIDC | `caracore-oidc/LICENSE` | Reescrito: MIT â†’ licenÃ§a proprietÃ¡ria Cara Core | âœ… |
| OIDC | `caracore-oidc/LICENSING.md` | Reescrito: "nÃ£o Ã© MIT, nÃ£o Ã© open source" | âœ… |
| OIDC | `caracore-oidc/CONTEXTO_COLABORACAO_IA.md` | SeÃ§Ã£o 5 atualizada com aviso da decisÃ£o | âœ… |
| OIDC | `caracore-oidc-releases/docs/index.html` | Footer: MIT â†’ proprietÃ¡rio; span morto â†’ link matriz | âœ… |
| OIDC | `caracore-oidc-releases/docs/licenca-uso.html` | TÃ­tulo, meta, header, bloco FREE â†’ proprietÃ¡rio | âœ… |
| OIDC | `delivery/oidc/index.html` | Hero, footer: MIT â†’ proprietÃ¡rio; span Circuito â†’ link real | âœ… |
| Ãrea 51 | `caracore-area51-releases/docs/index.html` | "produto MIT" â†’ "produto proprietÃ¡rio Cara Core" (3 ocorrÃªncias) | âœ… |
| MemÃ³ria | `D:\dev\CONTEXTO_SESSAO_IA.md` | Arquivo central de memÃ³ria criado | âœ… |
| MemÃ³ria | `delivery/oidc/MIRROR_DELIVERY.md` | Atualizado: MIT â†’ proprietÃ¡rio + aviso | âœ… |
| MemÃ³ria | `delivery/circuito/MIRROR_DELIVERY.md` | Atualizado: curso na loja + aviso | âœ… |

---

*Levantamento gerado em sessÃ£o de trabalho via GitHub Copilot. Arquivos mais relevantes: `delivery/pdv/`, `delivery/ink/`, `delivery/EVOLUTION_STATUS_APLICADO_LOJAS.md`, `caracore-area51-releases/docs/index.html`, `STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.txt`, `ECOSYSTEM_LOJAS.txt`.*

