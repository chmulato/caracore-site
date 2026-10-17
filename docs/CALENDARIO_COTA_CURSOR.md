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
| PDV Free `v3.2.8` | Encerramento da última versão 3.2.x em **08/11/2026** | Manutenção restrita até a data; sem novas features |
| PDV Java v4 | Próxima linha, seguindo o ciclo de RCs; GA sem data definida até aceites formais | Agent out/2026 em diante, conforme os gates |
| Hub instalador Windows | **06/04/2027** | Agent **dez/2026–06/04/2027**. Web 2.1 já existe; o EXE é o trabalho. |
| CSO Transportes + Virtual Tracker integrado | **08/11/2028 — alvo conjunto** | Janela jan–nov/2028; capacidade e total de sprints dependem de INT-03 |

08/11/2026 encerra a manutenção de transição da última Free 3.2.x (`v3.2.8`); não é GA da PDV v4. A v4 prossegue pelas RCs, e a promoção a GA depende da aprovação formal dos gates e aceites. O freeze M1 do CSO nessa data permanece: congela o que já está no ar, inclusive a gestão de frota publicada em 06/10. Sem jornada, app offline nem GPS.

**Brincos (não mandam na fila):** Ink PWA = Tab; **sem GA com Agent** até folga do núcleo (**não antes de 2028**). Helianto = **30/12/2029** (Agent 2029; cede se o CSO precisar do ano). RU 18/06/2027 = Garagem sem Agent. PIX Split = papel até o Hub no ar.

---

## Dono do ciclo (Agent pesado)

| Período | Dono | O que entrega | Não abrir |
|---------|------|---------------|-----------|
| set/2026 | **CSO COE** | COE-B/E publicados (`e193d6d`); sem novo escopo COE em fila | PDV v4 Agent; Ink S1; Hub H |
| out/2026 → 08/11/2026 | **PDV v4 RCs + transição Free** | Qualificar as RCs; `v3.2.8` encerra em 08/11; sem corte GA nessa data | MON-0; reabrir FRO; Ink extract; Hub H; CSO e PDV no mesmo dia |
| 09/11 → 04/12/2026 | **PDV v4 RCs + copy CSO M1** | Continuar homologação até aprovação formal; Freeze M1 (L) | MON-0; V34; Ink S1 |
| dez/2026 → 06/04/2027 | **Hub** | SQLite + EXE + SHA na loja · **GA 06/04** | Ink S1–S8; reabrir FRO; PIX Split Agent |
| 08/04 → dez/2027 | — | FRO 24/24 já publicado em 06/10 | Não reabrir o epic; Ink Agent; Helianto; PIX Split Agent; PWA frota |
| jan–nov/2028 | **CSO Transportes + integração VT** | Alvo conjunto **08/11/2028**, condicionado à prova móvel, capacidade e homologação | PWA frota/offline móvel; Helianto Agent; Ink Agent; todo MON sem recorte aprovado |
| dez/2028 | buffer | Loja/wiki do Transportes | Não abrir Helianto nem Ink Agent |
| 2029 | **Helianto** | SaaS condomínio **GA 30/12/2029** | RU Agent; Momento 2 / PWA frota; VT |

Tab no Hub (SQLite, scripts) pode andar em set–nov sem Agent, sem competir com o PDV. Ink PWA: Tab + mãos; Agent só com folga do núcleo (não antes de 2028).

---

## O que cede (senão o envelope não fecha)

| Item | Antes (oficina isolada) | Agora |
|------|-------------------------|--------|
| CSO FRO 24/24 | Janela planejada 08/04–dez/2027 | **Publicado em 06/10/2026** (decisão explícita). Não reabrir o epic |
| Ink PWA Agent | dez/2026–jun/2027 | **Tab**; GA com Agent **não antes de 2028** |
| CSO Momento 2 | 2027 | Epic completo sem antecipação automática; reaproveitar somente itens necessários à integração, conforme INT-03. PWA de gestão offline cancelada em 15/10/2026 |
| Virtual Tracker | Fora do envelope de Transportes em 2028 | Decisão de 17/10/2026: capacidade integrada, não terceiro produto; alvo conjunto **08/11/2028**, condicionado aos gates INT |
| PIX Split PDV | 2027 código | Papel até o Hub no ar; Agent **só com folga do FRO** |
| Helianto SaaS | 30/12/2027 código | **30/12/2029**; Agent **2029**; cede se o CSO precisar |

### CSO integrado — decisão de planejamento de 17/10/2026

Esta decisão substitui a exclusão anterior do VT em 2028, mas não libera
implementação imediata, cota extra ou execução simultânea das duas oficinas.
PDV, Hub, teto de 80% e um produto pesado por ciclo permanecem.

Fonte operacional: [plano mestre de Transportes, seção 7](../../caracore-cso-transportes/docs/plano_organizado_execucao_cso.md#7-plano-integrado-transportes--virtual-tracker).
São **10 sprints locais estimadas**, mais **21 tarefas integradas (0/21)** em
**6 etapas**, não seis sprints. INT-01/02 levantam o baseline e provam o celular;
INT-03 fecha estimativa total, responsáveis, ciclos e folga antes de confirmar
a viabilidade da data. MON permanece 0/53; não somar seus itens ao INT como
trabalho independente, nem antecipar todo o epic.

Frotas continua somente online. No VT planejado, autentica e encaminha
envelopes cifrados ponta a ponta, sem ler nem persistir posições, rotas,
trânsito ou envelopes, inclusive em logs/cache/filas. Chave privada,
mapa e histórico ficam somente no desktop. Relay apenas em memória
transitória limitada; sem base conectada, não acumula. Perfil econômico
de referência: presença 120 s quando necessária e posição 60 s em viagem,
com limites, reconexão progressiva e sem fila offline. Protocolo, endpoints,
prova móvel e medições ainda pendentes; não vender localização instantânea.

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
| CSO Frotas | `caracore-cso-quarkus/docs/plano-calendario-cota-2026.md` | FRO 24/24 publicado em 06/10; freeze M1 em 08/11/2026 |
| Ink PWA | `caracore-ink/docs/PLANO_PWA.md` | Tab; Agent **não antes de 2028** |
| CSO Transportes | oficina `caracore-cso-transportes` | 2028 |
| Helianto | oficina `caracore-helianto` · vitrine `helianto.caracore.com.br` | **2029** (GA 30/12/2029) |

## Funding / Patrocínio (página pública)

A matriz expõe este envelope em [`planning.html#patrocinio`](../planning.html#patrocinio). Números: **US$ 20/mês · 40 meses · US$ 800** (set/2026 → dez/2029). Não é P&L da empresa (Railway, domínio, Pix ficam fora). Patrocínio extra (segunda cota, on-demand pontual, mês de Agent) pode abrir Momento 2, dar mês a RU ou abrir Agent no Ink. Não substitui PDV v4, Hub EXE, Transportes nem Helianto, e não reabre o FRO.

## Riscos (guia de decisão)

Antes de mudar um GA, um dono de ciclo ou abrir Agent noutro produto: [`RISCOS_ECOSSISTEMA.md`](RISCOS_ECOSSISTEMA.md). Se um ciclo bater 80% cedo, desliza o dono seguinte — não comprime dois GAs.

IAs: `AGENTS.md` § cota · `.cursor/rules/ecosystem-cara-core.mdc` · `ECOSYSTEM_MEMORIA.md` · `RISCOS_ECOSSISTEMA.md`.
