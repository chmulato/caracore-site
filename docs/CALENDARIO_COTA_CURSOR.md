# Calendário de cota Cursor — Cara Core Informática

**Vigência:** 09/09/2026 → 31/12/2029  
**Assinatura:** Cursor Pro **US$ 20/mês** · teto operacional **80%** · **sem on-demand**  
**Porquê:** o roadmap público só cabe se a **empresa** tiver um dono por ciclo. **Principais:** PDV · CSO · Hub. **Brincos** (Ink, Helianto, RU, etc.) não mandam na fila; em conflito, cedem. O calendário do CSO de 07/set/2026 reservava sozinho US$ 540 até 08/11/2028; não pode coexistir com os outros GAs do núcleo.

Este ficheiro é o **canónico de capacidade da empresa**. Trackers de escopo continuam nas oficinas. Datas públicas continuam em `AGENTS.md`, `ecosistema.html#roadmap` e o skyline mensal em `planning.html`. Envelope visível a patrocinadores: **`planning.html#patrocinio`** (US$ 20 × 40 meses = **US$ 800**, set/2026 → dez/2029).

---

## Premissas congeladas

| Premissa | Valor |
|----------|--------|
| Orçamento | US$ 20/mês, **todo mês**. Não acumula. Mês ocioso ainda é pago. |
| On-demand | **Não planejar.** Só produção quebrada. |
| Teto | **80%** do ciclo. Ao tocar 80% → parar Agent até o reset. ≥ 75% → só copy/docs. |
| Reset | ~dia 5 (confirmar no Spending). |
| Fila | **1 produto pesado por ciclo.** Duas frentes Agent no mesmo dia = estouro. |
| Sessão | 1 objetivo. **2 sessões Agent / semana.** |
| Tab | Ilimitado no Pro. Não conta neste envelope. SQLite/copy/instalador podem andar em Tab + mãos. |
| Agent pesado | Flyway, auth, extract de módulo, HTTP, sync, UI de fluxo novo. |

Sexta: ler Spending, gravar % se o ciclo for de oficina com tracker, cortar o Could.

---

## Datas públicas que não escorregam (núcleo)

| Marco | Data | Cota |
|-------|------|------|
| PDV Java v4 GA | **08/11/2026** | Agent out–08/nov/2026 |
| Hub instalador Windows | **06/04/2027** | Agent **dez/2026–06/04/2027**. Web 2.1 já existe; o EXE é o trabalho. |
| CSO Transportes desktop | **08/11/2028** | Agent jan–nov/2028 |

Headline de 08/11/**2026** = PDV v4. CSO Frotas nesse dia = freeze Momento 1 (já no ar), não FRO 24/24.

**Brincos (não mandam na fila):** Ink PWA = Tab; **sem GA com Agent** até folga do núcleo (**não antes de 2028**). Helianto = **30/12/2029** (Agent 2029; cede se o CSO precisar do ano). RU 18/06/2027 = Garagem sem Agent. PIX Split = papel até o Hub no ar.

---

## Dono do ciclo (Agent pesado)

| Período | Dono | O que entrega | Não abrir |
|---------|------|---------------|-----------|
| set/2026 | **CSO COE** | Residual Momento 1 (COE-5.3 só se Spending ≤ 60%) | PDV v4 Agent; Ink S1; Hub H |
| out/2026 → 08/11/2026 | **PDV v4** | Janela A, T032, corte GA | FRO-H; Ink extract; Hub H; CSO e PDV no mesmo dia |
| 09/11 → 04/12/2026 | **PDV corte + copy CSO M1** | Freeze M1 (L) | FRO Flyway; Ink S1 |
| dez/2026 → 06/04/2027 | **Hub** | SQLite + EXE + SHA na loja · **GA 06/04** | Ink S1–S8; FRO-H; PIX Split Agent |
| 08/04 → dez/2027 | **CSO FRO** | Núcleo gestão de frota 24/24 | Ink Agent; Helianto; PIX Split Agent; PWA frota |
| jan–nov/2028 | **CSO Transportes** | Desktop bunker **GA 08/11/2028** | Virtual Tracker / GPS; PWA frota; Helianto Agent; Ink Agent |
| dez/2028 | buffer | Loja/wiki do Transportes | Não abrir Helianto nem Ink Agent |
| 2029 | **Helianto** | SaaS condomínio **GA 30/12/2029** | RU Agent; Momento 2 / PWA frota; VT |

Tab no Hub (SQLite, scripts) pode andar em set–nov **sem** Agent, sem competir com o PDV. Ink PWA: Tab + mãos; S1+ de Agent **só** com folga depois do FRO (não antes de 2028).

---

## O que cede (senão o envelope não fecha)

| Item | Antes (oficina isolada) | Agora |
|------|-------------------------|--------|
| CSO FRO 24/24 | out/2026 → mar/2027; depois jul–dez/2027 | **08/04–dez/2027** (depois do Hub) |
| Ink PWA Agent | dez/2026–jun/2027 | **Tab**; GA com Agent **não antes de 2028** |
| CSO Momento 2 / PWA frota | 2027 | **depois de dez/2028** (2028 = Transportes) |
| Virtual Tracker™ | 08/11/2028 (mesmo dia do Transportes) | **não compete** com Transportes em 2028 |
| PIX Split PDV | 2027 código | Papel até o Hub no ar; Agent **só com folga do FRO** |
| Helianto SaaS | 30/12/2027 código | **30/12/2029**; Agent **2029**; cede se o CSO precisar |

Se um ciclo bater 80% cedo: **desliza o dono seguinte**, não comprime dois GAs no mesmo mês.

---

## Termómetro (antes de cada sessão Agent)

1. Abrir Cursor Spending do ciclo.
2. ≥ 80% → não implementar. Tracker/handoff só.
3. ≥ 75% → só IDs L (copy, i18n, data, FAQ).
4. Senão → 1 objetivo do **dono daquele período**, nesta tabela.
5. Confirmar que não há outra frente pesada no mesmo dia.

---

## Ponteiros por oficina

| Produto | Escopo (o quê) | Capacidade (quando) |
|---------|----------------|---------------------|
| Empresa | — | **Este ficheiro** |
| PDV v4 | `caracore-pdv/docs/arquitetura/PLANO_LANCAMENTO_V4.md` | out–nov/2026 |
| Hub Windows | `caracore-hub/docs/contexto-rapido.md` | Agent **dez/2026–06/04/2027** |
| CSO Frotas | `caracore-cso-quarkus/docs/plano-calendario-cota-2026.md` | set/2026 COE; FRO **08/04–dez/2027** |
| Ink PWA | `caracore-ink/docs/PLANO_PWA.md` | Tab; Agent **não antes de 2028** |
| CSO Transportes | oficina `caracore-cso-transportes` | 2028 |
| Helianto | `caracore-helianto` + loja `caracore-helianto-releases` | **2029** (GA 30/12/2029) |

## Funding / Patrocínio (página pública)

A matriz expõe este envelope em [`planning.html#patrocinio`](../planning.html#patrocinio). Números: **US$ 20/mês · 40 meses · US$ 800** (set/2026 → dez/2029). Não é P&L da empresa (Railway, domínio, Pix ficam fora). Patrocínio extra (segunda cota, on-demand pontual, mês de Agent) pode antecipar FRO, abrir Momento 2, dar mês a RU ou **abrir Agent no Ink**; **não** substitui PDV v4, Hub EXE, FRO, Transportes nem Helianto.

## Riscos (guia de decisão)

Antes de mudar um GA, um dono de ciclo ou abrir Agent noutro produto: [`RISCOS_ECOSSISTEMA.md`](RISCOS_ECOSSISTEMA.md). Se um ciclo bater 80% cedo, desliza o dono seguinte — não comprime dois GAs.

IAs: `AGENTS.md` § cota · `.cursor/rules/ecosystem-cara-core.mdc` · `ECOSYSTEM_MEMORIA.md` · `RISCOS_ECOSSISTEMA.md`.
