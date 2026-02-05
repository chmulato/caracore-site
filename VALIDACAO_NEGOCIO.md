# Validação de negócio — Fábrica de aplicativos Windows Desktop

**Objetivo:** Pente fino no que construímos, com olhar de uma pessoa de negócio que está construindo uma **fábrica de aplicativos Windows Desktop** para um **público seleto e com poder de compra**. Garantir funcionalidade dos produtos e coerência do ecossistema.

**Produtos em foco (já validados ou em validação):**
1. **Cara Core PDV** — validado com muito esforço  
2. **chmulatoETE Minerador 4.0** — validado com muito esforço  
3. **Reino OIDC — Reino das Identidades Federadas** — material educacional / identidade  
4. **Cara Core Seed** — Contador de licenças offline, agregando valor ao ecossistema  

---

## 1. Narrativa de negócio (fábrica + público seleto)

| O que validar | Status | Observação |
|---------------|--------|------------|
| **Fábrica de apps Windows Desktop** | ⚠️ Implícito | PDV (web + offline/Electron), Minerador (Windows .exe), Seed (Windows .exe) estão alinhados. Reino OIDC é web/educação — complementar (identidade, formação). Vale deixar **explícito** no portfólio uma linha que una os quatro: ex. "Soluções Windows Desktop e identidade para um público seleto". |
| **Público seleto / poder de compra** | ⚠️ Parcial | Preços claros onde aplicável (Seed R$ 29,90; Minerador Ouro 4.0 R$ 29,90). PDV Premium sem valor no portfólio (pode ser proposital — "sob consulta"). Recomendação: reforçar em cada produto **para quem** é (gestor, contador, empresa, jovem desenvolvedora) e **que problema resolve**. |
| **Agregação de valor entre produtos** | ✅ Bom | Seed é o "Contador de Licenças" dos que compram PDV, Minerador, Reino, Hub. Minerador e Seed compartilham filosofia (transparência, LGPD, R$ 29,90). PDV e Minerador já validados; Seed e Reino agregam sem duplicar. |

---

## 2. Produto a produto

### 2.1 Cara Core PDV
| Critério | Status | Detalhe |
|----------|--------|---------|
| **Proposta de valor clara** | ✅ | Reforma Tributária 2026-2033, offline, PIX Split, planos Free/Premium. |
| **Público** | ✅ | Pequenos e médios negócios, varejo; contador e gestor. |
| **Preço/plano** | ⚠️ | Free e Premium descritos; valor do Premium não está no portfólio (pode ser intencional). |
| **Delivery funcional** | ✅ | `delivery/pdv/` → apresentação; `delivery/pdv/tecnologia.html`; `wiki/projeto-pdv.html` existe. |
| **Windows Desktop** | ✅ | Instalação simples, um arquivo de dados, modo offline; Electron quando aplicável. |

**Ação sugerida:** Manter como está. Se quiser reforçar "público seleto", acrescentar na Visão Executiva algo como "para lojistas e redes que exigem conformidade fiscal e operação confiável".

---

### 2.2 chmulatoETE Minerador 4.0
| Critério | Status | Detalhe |
|----------|--------|---------|
| **Proposta de valor** | ✅ | ETE aplicada ao refino de terras raras; instalador Windows; checksums; upgrade Ouro 4.0. |
| **Público** | ✅ | Mineração, hidrometalurgia, educação (Campo Largo). |
| **Preço** | ⚠️ | R$ 29,90 (Ouro 4.0) está no portal ETE (upgrade-ouro40.html), **não** no texto do portfólio. Para consistência com Seed, vale citar no lead ou no alerta. |
| **Delivery funcional** | ✅ | `delivery/ete/`, `delivery/ete/download.html` → GitHub ETE-releases. |
| **Windows Desktop** | ✅ | Instalador .exe, checksums SHA-256/MD5. |

**Ação sugerida:** No portfólio, no alerta de licenciamento do Minerador 4.0, acrescentar: "Upgrade Ouro 4.0: R$ 29,90 (valor único)."

---

### 2.3 Reino OIDC — Reino das Identidades Federadas
| Critério | Status | Detalhe |
|----------|--------|---------|
| **Proposta de valor** | ✅ | Material educacional OAuth 2.1 / OIDC; gamificação; PI Cara Core. **Primeira entrega FREE**; upgrade **O Trono da Identidade** R$ 29,90 (inspirado no Minerador 4.0). |
| **Público** | ✅ | **Jovens Entusiastas Desenvolvedores** (foco em **público-alvo feminino**); mercado seleto, olhar crítico; Security, Big Tech. |
| **Preço** | ✅ | FREE (MIT) + upgrade R$ 29,90 (valor único). |
| **Delivery funcional** | ✅ | `delivery/oidc/` → index (FREE); `delivery/oidc/upgrade-trono.html` → PIX R$ 29,90. |
| **Windows Desktop** | ➖ | Não se aplica — é conteúdo web. **Papel no ecossistema:** reforça marca "identidade" e atrai talento; não compete com PDV/Minerador/Seed. |

**Estratégia de negócio:** Ver `delivery/oidc/ESTRATEGIA_NEGOCIO_REINO_OIDC.md` e `delivery/oidc/PUBLICO_ALVO.md`.

---

### 2.4 Cara Core Seed
| Critério | Status | Detalhe |
|----------|--------|---------|
| **Proposta de valor** | ✅ | Contador de Licenças; gestão offline; portal de controle; LGPD; R$ 29,90. |
| **Público** | ✅ | Clientes que compram PDV, Minerador, Reino, Hub (Windows); contador interno / comprador. |
| **Preço** | ✅ | R$ 29,90 (valor único) explícito no portfólio e no delivery. |
| **Delivery funcional** | ✅ | `delivery/seed/index.html`, `portal-controle.html`, `download.html`; `caracore-seed-releases` (index + download → releases/latest). |
| **Windows Desktop** | ✅ | Electron, SQLite, 100% offline. |
| **Agregação de valor** | ✅ | Inspirado no Minerador 4.0 (transparência, LGPD); centraliza licenças de todos os produtos. |

**Ação sugerida:** No portfólio, o botão "Ver no GitHub (releases)" pode ser complementado com um CTA explícito "Baixar EXE" apontando para `delivery/seed/download.html` ou para `https://github.com/chmulato/caracore-seed-releases/releases/latest`, para quem só quer o artefato.

---

## 3. Funcionalidade dos fluxos (cliente final)

| Fluxo | O que o cliente faz | Funciona? |
|-------|---------------------|-----------|
| **Conhecer PDV** | Portfólio → Ver Apresentação → delivery/pdv/ | ✅ (delivery/pdv/ resolve para index) |
| **Baixar Minerador 4.0** | Portfólio → Download → delivery/ete/download.html → GitHub ETE-releases/latest | ✅ |
| **Explorar Reino OIDC** | Portfólio → Explorar o Reino → delivery/oidc/ | ✅ |
| **Conhecer Seed e baixar EXE** | Portfólio → Portal de delivery ou Ver no GitHub → delivery/seed/ ou caracore-seed-releases → download | ✅; CTA "Baixar EXE" deixaria ainda mais óbvio |
| **Portal de controle (Seed)** | Portfólio ou delivery Seed → Portal de controle | ✅ |

---

## 4. Consistência de mensagem (público seleto)

| Tema | PDV | Minerador 4.0 | Reino OIDC | Seed |
|------|-----|---------------|------------|------|
| **Nome completo / posicionamento** | Cara Core PDV | chmulatoETE Minerador 4.0 | Reino OIDC — Reino das Identidades Federadas | Cara Core Seed |
| **Preço visível** | Free + Premium (valor Premium não citado) | Free + Ouro 4.0 R$ 29,90 (sugerido no portfólio) | Gratuito | R$ 29,90 |
| **Entrega Windows** | Sim (offline/Electron) | Sim (.exe) | Não (web) | Sim (.exe) |
| **Transparência / LGPD** | Conformidade citada | Portal/licenças ETE | — | Portal de controle, LGPD |
| **Link direto para download/EXE** | Apresentação + Wiki | Download → ETE-releases | Explorar Reino | Portal + GitHub; sugerido: "Baixar EXE" |

---

## 5. Resumo de ações recomendadas

1. **Portfólio — Frase de framing:** Adicionar uma linha no header ou logo abaixo do lead do portfólio reforçando: *Soluções Windows Desktop e identidade para um público seleto* (ou equivalente), ligando os quatro produtos.
2. **Minerador 4.0:** Incluir no alerta de licenciamento do card: "Upgrade Ouro 4.0: R$ 29,90 (valor único)."
3. **Seed:** Incluir botão ou link explícito "Baixar EXE" (→ delivery/seed/download.html ou caracore-seed-releases/releases/latest) ao lado de "Ver no GitHub (releases)".
4. **Reino OIDC:** Manter nome completo "Reino OIDC — Reino das Identidades Federadas" em qualquer novo material.
5. **Revisão periódica:** Usar este documento como checklist em próximas releases (novos produtos, mudança de preço, novos CTAs).

---

## 6. Conclusão

- **Funcionalidade:** Os fluxos de apresentação e download estão coerentes e operantes; links de delivery e GitHub conferidos.
- **Validação já feita:** PDV e Minerador 4.0 continuam bem posicionados; Seed e Reino OIDC agregam valor (licenças + identidade/educação) sem conflito.
- **Pente fino:** Pequenos ajustes de copy (framing, R$ 29,90 no Minerador, CTA "Baixar EXE" no Seed) deixam a fábrica de aplicativos Windows Desktop e o público seleto mais claros para quem lê o portfólio.

*Documento gerado para validação de negócio — Cara Core Informática.*
