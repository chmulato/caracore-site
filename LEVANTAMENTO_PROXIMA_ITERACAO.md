# Levantamento — Próxima Iteração de Input

**Data:** Junho de 2025
**Escopo:** Matriz (caracore.com.br) + todas as lojas (GitHub Pages) do ecossistema Cara Core
**Objetivo:** Relacionar o que precisa ser ajustado em uma próxima rodada de edição

---

## Resumo do que foi executado nesta sessão

| Produto | Arquivo | Ação | Status |
|---------|---------|------|--------|
| Hub | delivery/hub/index.html | Data 2026 → 2027 | ✅ |
| Hub | delivery/hub/download.html | Data 2026 → 2027 | ✅ |
| Hub | portfolio.html | Data 2026 → 2027 | ✅ |
| Hub | caracore-hub-releases/download.html | Data 2026 → 2027 | ✅ |
| RU | delivery/ru/index.html | Data 2026 → 2027 (8 ocorrências) | ✅ |
| RU | delivery/ru/MIRROR_DELIVERY.md | Data 2026 → 2027 | ✅ |
| RU | caracore-ru-releases/README.md | Data 2026 → 2027 | ✅ |
| RU | caracore-ru-releases/docs/MIRROR_DELIVERY.md | Data 2026 → 2027 | ✅ |
| RU | caracore-ru-releases/docs/download.html | Data 2026 → 2027 | ✅ |
| CSO | delivery/cso/index.html | Data 2026 → 2028 (6 ocorrências) | ✅ |
| CSO | caracore-cso-releases/README.md | Data + tabela roadmap | ✅ |
| CSO | caracore-cso-releases/docs/assets/js/main.js | Countdown 2026 → 2028 | ✅ |
| CSO | caracore-cso-releases/PLAINTEXT.TXT | DATA MESTRE 2026 → 2028 | ✅ |
| CSO | caracore-cso-releases/docs/index.html | Data 2026 → 2028 (4 ocorrências) | ✅ |
| Área 51 | delivery/area51/index.html | Mensagem serviço pago + startup + OIDC como prova | ✅ |
| Área 51 | caracore-area51-releases/docs/index.html | Idem | ✅ |

---

## 1. CRÍTICO — Datas no passado sem decisão

### 1.1 CaraCore PDV — "03 de março de 2026"

**Ocorrências:**

- `delivery/pdv/index.html` — banner de status (linha ~72): "Pré-lançamento oficial em **03 de março de 2026**"
- `delivery/pdv/download.html` — provavelmente tem a data também (não lido nesta sessão)
- `caracore-pdv-releases/docs/index.html` — a verificar
- `caracore-pdv-releases/docs/download.html` — a verificar

**Situação:** A data passou. O banner diz "rc1 disponível" — o produto está tecnicamente disponível para degustação. Há duas opções:

- **Opção A:** Atualizar para nova data de lançamento oficial (pede decisão: qual data?)
- **Opção B:** Trocar o banner para "Em produção" ou "Disponível para degustação — versão 1.0.17-rc1" removendo a referência futura ao lançamento oficial

**Pendência:** Aguardar decisão sobre o que priorizar para o PDV.

---

### 1.2 Cara Core Ink Agenda — "26 de junho de 2026"

**Ocorrências:**

- `delivery/ink/index.html` — banner principal, tagline e footer
- `delivery/ink/` — provavelmente em download.html também
- `caracore-ink-releases/README.md` — "Lançamento oficial: 26 de Junho de 2026"
- `caracore-ink-releases/docs/index.html` — a verificar
- `caracore-ink-releases/docs/download.html` — a verificar

**Situação:** Mesma lógica do PDV. Data passou. O app v2.0 (desktop Windows) ainda não foi lançado, mas há versão Android na Play Store como "versão anterior" em produção.

**Pendência:** Decidir nova data ou mudar o enquadramento para "em desenvolvimento".

---

### 1.3 Área 51 loja — "02 de agosto de 2026" ✅ RESOLVIDO NESTA SESSÃO

**Ocorrências corrigidas:**

- `caracore-area51-releases/docs/index.html` — card de download: substituído por "Releases a publicar. Contrate o Suporte Área 51 para implementação."
- `caracore-area51-releases/docs/index.html` — footer: substituído por "Serviço contratável."

---

## 2. DESIGN — Inconsistência de stack CSS/JS entre produtos

| Produto | Stack front-end |
|---------|----------------|
| PDV | **Tailwind CSS CDN** + Font Awesome CDN + `portal-style.css` |
| Reino OIDC | **Bootstrap 5** (CDN) + `style.css` |
| Todos os outros | **Vanilla CSS** + Inter (Google Fonts) |

**Situação:** PDV e OIDC têm dependências de CDN externas (Tailwind, Bootstrap, Font Awesome). Os demais são auto-contidos. Isso não é um bug, mas gera:

- Risco de CDN fora do ar / breaking changes
- Página mais pesada (Tailwind CDN carrega a engine completa via JavaScript)
- Identidade visual menos uniforme

**Pendência futura:** Quando houver energia para revisão visual, avaliar migração do PDV para o padrão `vanilla CSS + Inter` do ecossistema. Baixa urgência.

---

## 3. INFRAESTRUTURA — Padrões de URL nas lojas

| Produto | URL da loja | Padrão? |
|---------|-------------|---------|
| Hub | `hub.caracore.com.br/` | ✅ |
| CSO | `cso.caracore.com.br/` | ✅ |
| RU | `ru.caracore.com.br/` | ✅ |
| Área 51 | `area51.caracore.com.br/` | ✅ |
| PDV | `pdv.caracore.com.br/` | ✅ |
| Ink Agenda | `ink.caracore.com.br/` | ✅ |
| Seed | `seed.caracore.com.br/` | ✅ |
| Minerador 4.0 | `ete.caracore.com.br/` | ✅ |
| Reino OIDC | `oidc.caracore.com.br/` | ⚠️ fora do padrão |
| Circuito Ferradura | `github.com/chmulato/circuito-python-releases/releases/latest` | ⚠️ sem site Pages |

**Pendência:**

- **OIDC:** O nome do repositório é `reino-oidc-releases` em vez de `caracore-oidc-releases`. Não é bloqueante, mas quebra o padrão visual da URL. Renomear o repositório eventualmente (operação simples no GitHub, mas afeta todos os links externos existentes).
- **Circuito:** O download aponta direto para GitHub Releases, não para um site GitHub Pages. Não tem loja/vitrine Pages completa como os demais. Avaliar se cabe criar estrutura `docs/` para o repo `circuito-python-releases`.

---

## 4. CONTEÚDO — Componente evolution-status nas lojas

O documento `delivery/EVOLUTION_STATUS_APLICADO_LOJAS.md` lista 8 lojas com o componente. **Faltam dois:** CSO e Ink.

| Loja | evolution-status aplicado? |
|------|--------------------------|
| caracore-area51-releases | ✅ |
| caracore-ete-releases | ✅ |
| caracore-hub-releases | ✅ |
| caracore-pdv-releases | ✅ |
| caracore-ru-releases | ✅ |
| caracore-seed-releases | ✅ |
| circuito-python-releases | ✅ |
| reino-oidc-releases | ✅ |
| **caracore-cso-releases** | ❌ não listado |
| **caracore-ink-releases** | ❌ não listado |

**Pendência:** Adicionar o componente `evolution-status` às páginas principais de CSO e Ink seguindo o padrão de `EVOLUTION_STATUS_APLICADO_LOJAS.md`, e atualizar o documento com as entradas de CSO e Ink.

---

## 5. LINK CORRUPÇÃO — HTTP em vez de HTTPS

**Ocorrência:**

- `delivery/pdv/consultoria.html` — rodapé: `http://www.caracore.com.br` (HTTP, não HTTPS, sem slug `/`)

**Pendência:** Corrigir para `https://caracore.com.br` no rodapé de consultoria.html do PDV.

---

## 6. SEED — Lista de produtos desatualizada

Na delivery/seed/index.html, o card "O que é o CaraCore Seed?" cita:
> "Centraliza a contabilidade de clientes e licenças do ecossistema Cara Core (PDV, Minerador 4.0, Reino OIDC, Hub)"

**Situação:** Hub está listado mas não foi lançado ainda (2027). Quando lançar, a lista está certa. Mas CSO, RU, Ink Agenda e Área 51 não aparecem. Em uma próxima iteração, atualizar a lista para refletir o ecossistema completo. Baixa urgência.

---

## 7. OIDC — Estilo visual diferente

O portal `delivery/oidc/index.html` usa Bootstrap 5 com navegação em topo, listas de links expandíveis e design totalmente diferente dos demais portais. Também usa emoji no navbar (`🏰 Reino OIDC`).

**Situação:** O OIDC é um produto educacional com identidade própria ("saga", "personagens"), então alguma diferença de estilo é intencional. Mas em uma próxima revisão de branding, avaliar se faz sentido aproximar o header e o breadcrumb do padrão usado em hub/cso/ru etc.

**Pendência:** Baixa urgência. Avaliar na próxima revisão de identidade visual.

---

## 8. PDV — "Pronto para 2026" no menu e "Reforma 2026"

**Ocorrência:**

- `delivery/pdv/index.html` — item do menu `href="#fiscal"` com texto "Pronto para 2026"
- Meta description e cards: "Reforma Tributária 2026", "Blindagem fiscal 2026"

**Situação:** Esses são parte do posicionamento de produto (o PDV foi pensado para a Reforma Tributária). Com o passar do tempo, a referência "2026" no menu pode parecer desatualizada. Em algum momento, avaliar se o menu item vira "Pronto para a Reforma" (sem ano) ou "Reforma Tributária".

**Pendência:** Baixa urgência. Decisão editorial.

---

## 9. ECOSYSTEM_LOJAS.txt — Validar após mudanças desta sessão

O arquivo `d:\dev\caracore-site\ECOSYSTEM_LOJAS.txt` mapeia os URLs de todos os produtos. Após as datas de Hub (2027), RU (2027) e CSO (2028) terem sido atualizadas nesta sessão, verificar se há referências a datas dentro do `ECOSYSTEM_LOJAS.txt` que precisem acompanhar.

**Pendência:** Ler e verificar se `ECOSYSTEM_LOJAS.txt` tem datas que precisem ser atualizadas.

---

## 10. STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.txt — Sincronizar

O arquivo raiz `d:\dev\caracore-site\STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.txt` é o documento mestre de estratégia. Após as datas de Hub, CSO, RU e o messaging de Área 51 terem mudado nesta sessão, verificar se o documento mestre ainda reflete a realidade atualizada.

**Pendência:** Ler e atualizar as seções de roadmap e posicionamento do Área 51 dentro do documento de estratégia.

---

## Matriz de priorização para a próxima rodada

| # | Item | Urgência | Esforço |
|---|------|----------|---------|
| 1 | PDV — decisão sobre data passada (03/03/2026) | Alta | Baixo |
| 2 | Ink — decisão sobre data passada (26/06/2026) | Alta | Baixo |
| 3 | ~~Área 51 loja — remover "02/08/2026" do card download~~ | ~~Alta~~ | ✅ Feito |
| 4 | Sincronizar STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.txt | Média | Médio |
| 5 | Sincronizar ECOSYSTEM_LOJAS.txt | Média | Baixo |
| 6 | Evolution-status nas lojas CSO e Ink | Média | Médio |
| 7 | Corrigir HTTP → HTTPS em PDV/consultoria.html | Média | Mínimo |
| 8 | Seed — atualizar lista de produtos | Baixa | Mínimo |
| 9 | ~~Circuito — avaliar criar loja Pages dedicada~~ | ~~Baixa~~ | ✅ Feito (19/02/2026) |
| 10 | OIDC — renomear repo ou aceitar URL diferente | Baixa | Médio |
| 11 | PDV — harmonização visual (Tailwind → vanilla CSS) | Baixa | Alto |
| 12 | PDV — "Pronto para 2026" no menu (decisão editorial) | Baixa | Mínimo |
| 13 | OIDC — aproximar header/branding do padrão | Baixa | Médio |

---

## Sessão 19/02/2026 — Executado

| Produto | Arquivo | Ação | Status |
|---------|---------|------|--------|
| Circuito | `caracore-circuito-releases/docs/index.html` | MIT → proprietário (12 ocorrências) | ✅ |
| Circuito | `delivery/circuito/index.html` | MIT → proprietário; hero CTA → relativo | ✅ |
| Circuito | `delivery/circuito/curso/` | Curso HTML 6 fases copiado da oficina (`pages_ferradura/`) | ✅ |
| Circuito | `caracore-circuito-releases/docs/curso/` | Curso HTML 6 fases copiado para loja | ✅ |
| Circuito | CTA hero (loja e matriz) | `github.io/circuito_python/` → `curso/index.html` relativo | ✅ |
| Circuito (loja) | nav-card Licença | Adicionado "Licença proprietária — não é MIT, não é open source" | ✅ |
| Circuito (matriz) | nav-card Licença | Adicionado "Licença proprietária — não é MIT, não é open source" | ✅ |
| OIDC | `caracore-oidc/LICENSE` | Reescrito: MIT → licença proprietária Cara Core | ✅ |
| OIDC | `caracore-oidc/LICENSING.md` | Reescrito: "não é MIT, não é open source" | ✅ |
| OIDC | `caracore-oidc/CONTEXTO_COLABORACAO_IA.md` | Seção 5 atualizada com aviso da decisão | ✅ |
| OIDC | `caracore-oidc-releases/docs/index.html` | Footer: MIT → proprietário; span morto → link matriz | ✅ |
| OIDC | `caracore-oidc-releases/docs/licenca-uso.html` | Título, meta, header, bloco FREE → proprietário | ✅ |
| OIDC | `delivery/oidc/index.html` | Hero, footer: MIT → proprietário; span Circuito → link real | ✅ |
| Área 51 | `caracore-area51-releases/docs/index.html` | "produto MIT" → "produto proprietário Cara Core" (3 ocorrências) | ✅ |
| Memória | `D:\dev\CONTEXTO_SESSAO_IA.md` | Arquivo central de memória criado | ✅ |
| Memória | `delivery/oidc/MIRROR_DELIVERY.md` | Atualizado: MIT → proprietário + aviso | ✅ |
| Memória | `delivery/circuito/MIRROR_DELIVERY.md` | Atualizado: curso na loja + aviso | ✅ |

---

*Levantamento gerado em sessão de trabalho via GitHub Copilot. Arquivos mais relevantes: `delivery/pdv/`, `delivery/ink/`, `delivery/EVOLUTION_STATUS_APLICADO_LOJAS.md`, `caracore-area51-releases/docs/index.html`, `STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.txt`, `ECOSYSTEM_LOJAS.txt`.*
