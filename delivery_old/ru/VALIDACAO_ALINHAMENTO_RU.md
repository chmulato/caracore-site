# Validação de alinhamento — RU Soberano (matriz/delivery vs oficina e memória)

**Data:** 2026-02-08  
**Referência:** `caracore-ru` (oficina), `docs/memoria-projeto.txt`, `CONTEXTO_RU.md`, `STATUS_ATUAL.TXT`

---

## 1. Oferta e mensagem (oficina e memória)

| Item | Fonte | Conteúdo |
|------|--------|----------|
| **FREE** | CONTEXTO_RU, memoria-projeto.txt | Ambientação RETRO (sala de aula UFPR 1991) para estudo do **Balanço de Massa** do **Prof. Soccol** na Engenharia Química. |
| **Pago (R$ 29,90)** | Idem | Simulador de reator — jornada completa: Inteligência de Processo + Memorial RU, narrativa (Lord OIDC, 1991 → 2026), kernel e artefatos. Ativação com `license.key`. |
| **Data** | Idem | Disponível a partir de **18 de junho de 2026**. Produto pronto na garagem. |
| **Reator (tipo)** | CONTEXTO_RU, memoria | **Em definição na garagem** — **não fixar "reator PFR" como produto fechado** na comunicação. |
| **Imagem** | CONTEXTO_RU | caracore_ru.png = aluno do Prof. Soccol; ambientação RETRO, Balanço de Massa. |

---

## 2. O que está alinhado

### 2.1 ecossistema.html (matriz)

- **Card RU:** DES, RU como laboratório didático, fluxo/filas/throughput/tempo de residência — alinhado ao código (src/simulador.py, README, SIMULATING).
- **Oferta gratuita:** ambientação RETRO (sala UFPR 1991, Balanço de Massa) — alinhado a CONTEXTO_RU e memória.
- **Oferta paga:** simulador de reator, jornada completa, narrativa Lord OIDC (1991 → 2026), 3D — alinhado (ru3d, dashboard Soberana, memoria).
- **Data:** 18 de junho de 2026 — alinhado.
- **Sem fixar PFR** no card — alinhado à regra da memória.

### 2.2 delivery/ru/index.html (matriz)

- Aviso de evolução, hero, CTA, metodologia, oficina/loja: mensagem FREE = RETRO, pago = simulador de reator (R$ 29,90), data 18/Junho/2026 — alinhado.
- Proposta biotecnologia: “em desenho”, ciclo O₂, link para ambientação RETRO — alinhado a docs/BIOTECNOLOGIA.md e CONTEXTO_RU.
- Links para caracore-ru-releases, canal-feedback, portfólio — corretos.

### 2.3 Código (oficina)

- **Entrada:** `python run_soberana.py` → dashboard PyWebView (5 Atos, Quadro Verde, P&ID) — conforme memoria e STATUS_ATUAL.
- **Build exe:** `build_soberania_exe.bat` → `dist/Soberania_RU_v1.0_CaraCore.exe` — conforme CONTEXTO_RU e LOJA.
- **Estrutura:** dashboard/, src/, ru3d/, aulas/, docs/, simulador_3d/ — conforme memoria.

---

## 3. Desalinhamento encontrado e correção

### 3.1 Título da página delivery (fixar PFR)

- **Arquivo:** `delivery/ru/index.html`
- **Atual:** `<title>RU Soberano — Reator Catalítico PFR | Cara Core Informática</title>`
- **Problema:** CONTEXTO_RU e memória pedem **não fixar "reator PFR" como produto fechado** na comunicação. O título fixa “Reator Catalítico PFR”.
- **Correção recomendada:** trocar para um título que não fixe PFR, por exemplo:  
  `RU Soberano — Simulador de reator e ambientação RETRO | Cara Core Informática`  
  ou:  
  `RU Soberano — Engenharia de Processos e ambientação RETRO | Cara Core Informática`

### 3.2 Card “Valor técnico” (menção a PFR)

- **Arquivo:** `delivery/ru/index.html`, card “Valor técnico (apoio)”.
- **Atual:** “Reator PFR, balanço de massa, perfil de conversão…”
- **Avaliação:** Menção técnica/educacional (como no README e docs) é aceitável; a regra é não usar PFR como **nome do produto** ou **chamada comercial**. Opcional: suavizar para “Reator (PFR e correlatos), balanço de massa…” se quiser deixar explícito que o tipo está em definição.

---

## 4. Resumo

| Onde | Status | Observação |
|------|--------|------------|
| **ecosistema.html** | Alinhado | Card RU e meta sem PFR; oferta FREE/pago e data corretas. |
| **delivery/ru/index.html (conteúdo)** | Alinhado | Mensagem FREE/pago, data, biotec, links corretos. |
| **delivery/ru/index.html (title)** | Desalinhado | Título fixa “Reator Catalítico PFR”; corrigir para não fixar PFR como produto. |
| **Memória + CONTEXTO_RU** | Referência única | Build, exe, oferta, data e regra “não fixar PFR” consistentes com STATUS_ATUAL e código. |

Correções aplicadas em `delivery/ru/index.html`: título (seção 3.1) e card "Valor técnico" (seção 3.2 — suavização "Reator (PFR e correlatos)").
