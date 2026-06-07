# Dilema de posicionamento — Cara Core Informática

Documento estratégico que consolida a conversa original (Gemini + reportagem CNN Brasil), o diagnóstico do portal e o **status de alinhamento** do site após as levas de copy em PT, EN e IT.

| Campo | Valor |
|--------|--------|
| **Site** | [www.caracore.com.br](https://www.caracore.com.br) |
| **Contexto** | Dev sênior (~18 anos), CNPJ Cara Core, contratação B2B |
| **Fonte bruta** | [`DILEMA_HISTORICO.md`](./DILEMA_HISTORICO.md) (transcrição da conversa; parcial) |
| **Status operacional** | [`STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md`](STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md) |
| **Alinhamento de copy** | Atualizado em **2026-06-07** |

---

## 1. Contexto de mercado (era da IA)

Referência: [CNN Brasil — mercado de trabalho para engenheiros de software](https://www.cnnbrasil.com.br/economia/macroeconomia/com-ia-mercado-de-trabalho-para-engenheiros-de-software-e-desafio/)

### O que mudou

- **Papel do engenheiro:** de “escrever código” para **decidir o que construir**, arquitetura e trade-offs.
- **Processos seletivos:** testes rígidos sem IA não refletem o trabalho real; empresas ainda não sabem avaliar senioridade na era da IA.
- **Commoditização de sintaxe:** linguagens deixam de ser diferencial — **impacto, decisão e entrega** passam a valer.

### Implicação para a Cara Core

Um portal próprio deixa de ser “currículo bonito” e vira **prova de entrega** e **vitrine de julgamento técnico** — especialmente para contratação B2B, onde o cliente não quer adivinhar capacidade por teste escolar.

---

## 2. O dilema central

> Trabalhar via CNPJ (modelo corporativo B2B), ser selecionado por empresas, **mas não ser lido como “agência grande”** nem como “freelancer genérico” — e, ao mesmo tempo, **não virar um segundo LinkedIn** com foto pessoal.

### Tensões identificadas

| Polo A | Polo B | Resolução adotada |
|--------|--------|-------------------|
| Parecer **software house** com equipe fixa | Parecer **solo sem estrutura** | **Consultoria boutique B2B** — operação enxuta, entrega ponta a ponta |
| Vitrine de **produtos** (PDV, ecossistema) | Vitrine de **engenharia para terceiros** | Produtos = **prova de entrega**; engenharia B2B = **oferta principal** no hero e nav |
| **Lista de stacks** (Java, Rust…) | **Cases e decisões** | Portfólio com `#decisoes-engenharia`; stacks como *consequência*, não headline |
| Termo **“PJ”** (carga pejorativa / pejotização) | Clareza comercial | **Frase-guia B2B** (ver §5) — sem “PJ” na copy comercial |
| **Escopo fechado** (caixa preta) | Transparência | Alocação dedicada + consultoria por projeto, código no ambiente do cliente |

### O que **não** foi escolhido

- Site estilo LinkedIn (foto + “eu” em destaque).
- Posicionamento de fábrica de software ou agência de suporte de TI genérico.
- Escopo fechado como modelo principal de venda.

---

## 3. Posicionamento decidido

### 3.1 Boutique de engenharia B2B

A Cara Core se apresenta como **empresa de consultoria enxuta**, não como agência numerosa:

- Contratação **entre empresas** (CNPJ no rodapé; copy comercial fala em **modelo B2B**).
- **Alocação técnica dedicada** ou **consultoria por projeto**.
- **Transparência de código** no repositório e ambiente do cliente — sem escopo fechado como armadilha.

### 3.2 Bunker Digital como diferencial (mantido)

Soberania local, offline-first e antifragilidade **continuam centrais** — são prova de que a operação entende o que acontece “debaixo do capô”, o que a IA sozinha não substitui.

### 3.3 Produtos = evidência, não discurso principal

PDV Java/Rust, Ink, Reino OIDC, Circuito Ferradura etc. documentam **capacidade real de entrega**. A mensagem comercial prioriza **decisão arquitetural + impacto operacional**.

---

## 4. Diagnóstico do site **antes** do alinhamento

Snapshot analisado na conversa original (texto em `DILEMA_HISTORICO.md`):

| Gatilho | Efeito no leitor |
|---------|------------------|
| Hero focado em Bunker + PDV, sem engenharia B2B | “Empresa de produto / varejo software” |
| “Somos…”, “Nossa Equipe” (Arquitetura + Design) | “Agência com time fixo” |
| Consultoria M365, suporte, antivírus, Excel | “Informática local / helpdesk” |
| Lista forte de stacks nos produtos | “Domino linguagens” (commodity na era IA) |
| Sem seção clara de alocação / staff augmentation | CTO não vê oferta para projetos corporativos |

**Veredito da conversa:** portal excelente para **produtos e Bunker**, insuficiente para **engenharia B2B de alto nível** sem reordenação de mensagem.

---

## 5. Frase-guia e vocabulário (canônico)

### Copy principal (PT)

> **Alocação técnica dedicada ou consultoria por projeto — modelo B2B, código transparente no ambiente do cliente.**

### Traduções alinhadas

| Idioma | Frase-guia |
|--------|------------|
| **EN** | Dedicated staff augmentation or project-based consulting — B2B model, code transparent in your environment. |
| **IT** | Allocazione tecnica dedicata o consulenza per progetto — modello B2B, codice trasparente nell'ambiente del cliente. |

### Termos preferidos vs evitar

| Usar | Evitar na copy comercial |
|------|---------------------------|
| Engenharia B2B / corporativa | “PJ”, “pejotização”, “autônomo” |
| Alocação técnica dedicada | “Escopo fechado” como promessa |
| Consultoria por projeto | “Fábrica de apps”, “Nossa equipe” (plural corporativo vazio) |
| Prova de entrega / decisões de engenharia | Stack como argumento de venda no hero |
| Operação enxuta / boutique | Suporte genérico (M365, antivírus) em destaque igual à engenharia |

**Nota:** CNPJ no rodapé permanece — dado legal, não termo comercial.

---

## 6. Alinhamento implementado no site (status 2026-06-07)

### 6.1 Português — matriz (`/`)

| Item | Status | Onde |
|------|--------|------|
| Hero: engenharia antifrágil **B2B** + frase-guia | ✅ | `index.html` |
| Seção `#engenharia-b2b` (3 pilares: alocação, legados, ágil contínuo) | ✅ | `index.html` |
| Nav: Engenharia B2B · Operação (não “Consultoria” genérica) | ✅ | `index.html`, `portfolio.html`, `ecosistema.html` |
| “Nossa Equipe” → **Nossa Operação** (boutique enxuta) | ✅ | `index.html` |
| Produtos: **Decisão / Stack** (stack secundária) | ✅ | `index.html` |
| 3 mini cases (`#decisoes-engenharia`) | ✅ | `portfolio.html` |
| Contato + meta tags com frase-guia | ✅ | `index.html` |
| Remoção de “PJ” na copy | ✅ | PT matriz |

### 6.2 Inglês e italiano — `aligned/en/`, `aligned/it/`

| Item | Status |
|------|--------|
| B2B / Corporate Engineering no index | ✅ |
| Frase-guia em hero, B2B, contact, footer | ✅ |
| `about.html`, `services.html`, `contact.html` | ✅ |
| Expertise: **Decision areas** / **Giudizio di ingegneria** (não “Hard Skills”) | ✅ |
| Tom híbrido/edge + horário corporativo B2B (EN/IT) | ✅ |
| Link suporte PME Brasil → `suporte-local.html` no rodapé EN/IT | ✅ |
| Formulário: alocação **ou** consultoria por projeto | ✅ |

### 6.3 Ordem de leitura desejada (home PT)

```text
Hero (B2B + frase-guia)
  → Engenharia B2B (#engenharia-b2b)
  → Antifragilidade
  → Produtos (prova de entrega)
  → Sobre / Contato
  (Suporte PME → suporte-local.html, rodapé)
```

---

## 7. Scorecard vs dilema

Escala orientativa (conversa original + revisão pós-alinhamento):

| Critério | Antes | Agora | Observação |
|----------|-------|-------|------------|
| Clareza B2B / alocação | ⚠️ | ✅ | Hero + seção dedicada + nav |
| Não parecer agência grande | ⚠️ | ✅ | “Operação enxuta”, boutique |
| Não parecer helpdesk | ❌ | ✅ | Suporte PME isolado em `suporte-local.html`; home só B2B |
| Cases > stacks | ❌ | ⚠️ | 3 cases qualitativos; **faltam métricas reais** |
| Vocabulário sem “PJ” | ❌ | ✅ | Frase-guia B2B em PT/EN/IT |
| Produtos como prova | ✅ | ✅ | Portfólio + ecossistema |
| Antifragilidade / Bunker | ✅ | ✅ | Mantido como diferencial |

**Nota global estimada:** ~**8/10** para objetivo “engenharia B2B sênior”; gap principal = **números nos cases** (%, downtime, lojas, etc.).

---

## 8. Gaps remanescentes

### 8.1 Site e copy

- [ ] Inserir **métricas reais** nos 3 cases (`portfolio.html#decisoes-engenharia`).
- [x] ~~Revisar `STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md`~~ — actualizado 2026-06-07 (boutique B2B).
- [x] ~~Actualizar `docs/SITE_MATRIZ.md` com referência a este documento~~ — feito 2026-06-07.
- [x] ~~Separar suporte PME (M365, antivírus, Excel) da home B2B~~ — `suporte-local.html` (2026-06-07).
- [x] ~~Horários noite/sábado na home~~ — movidos para Suporte Local; contato B2B = horário corporativo.
- [x] ~~Suavizar tom ideológico anti-cloud no site matriz (home, portfólio, ecossistema, EN/IT)~~ — FinOps/resiliência/híbrido (2026-06-07).
- [ ] Suavizar tom ideológico anti-cloud onde ainda aparecer (**wiki, lojas** — backlog; retrô art. 115 já alinhado ao tom pragmático).
- [ ] Alinhar `secure/`, handbook e publicações internas, se citarem posicionamento antigo.

### 8.2 Deploy e validação

- [ ] Publicar alterações em produção + smoke test (home → `#engenharia-b2b` → `#decisoes-engenharia` → lojas).
- [ ] Validar redirects e versões EN/IT em produção.

---

## 9. Modelo de serviço (referência rápida)

Três pilares espelhados no site — **time & materials / integração ao squad**, não projeto fechado opaco:

1. **Alocação técnica dedicada** — senioridade integrada ao fluxo, repos e ritmo do cliente.
2. **Consultoria e evolução de legados** — análise, refatoração, modernização documentada.
3. **Desenvolvimento ágil contínuo** — entregas cíclicas com visibilidade total.

---

## 10. Arquivos de referência no repositório

| Arquivo | Função |
|---------|--------|
| `index.html` | Hero, `#engenharia-b2b`, produtos, contato |
| `portfolio.html` | `#decisoes-engenharia`, filosofia Bunker, produtos |
| `ecosistema.html` | Mapa do ecossistema como prova de entrega |
| `aligned/en/*.html` | Versão internacional EN |
| `aligned/it/*.html` | Versão internacional IT |
| `docs/DILEMA_HISTORICO.md` | Transcrição original (arquivo histórico) |
| `docs/DILEMA.md` | **Este documento** — visão estruturada + status |

---

## 11. Próximo passo lógico sugerido

1. **Cases com impacto mensurável** — completar Problema / Decisão / Resultado com números reais.
2. **Deploy** — validar três línguas e anchors (`#engenharia-b2b`, `#decisoes-engenharia`).

---

*Cara Core Informática — CNPJ 23.969.028/0001-37 · documento interno de estratégia de posicionamento.*
