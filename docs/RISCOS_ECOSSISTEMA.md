# Riscos do ecossistema — guia de decisão

**Canónico de risco (empresa).** Capacidade = [`CALENDARIO_COTA_CURSOR.md`](CALENDARIO_COTA_CURSOR.md). Datas públicas = `AGENTS.md` · `ecosistema.html#roadmap` · `planning.html`. Envelope visível = `planning.html#patrocinio`.

**Vigência:** 09/09/2026 → 31/12/2029  
**Actualizar:** quando um GA público mudar, quando a assinatura mudar, ou no 1.º dia útil do mês se um risco materializou.

Este ficheiro **não** é P&L nem tracker de oficina. Serve para **dizer não** (ou deslizar o dono seguinte) antes de abrir Agent, mudar data pública ou meter um **brinco** na fila dos produtos principais.

**Decisão CSO de 17/10/2026:** Transportes + Virtual Tracker integrado passam
a ter alvo conjunto em 08/11/2028, não garantia de GA. VT não é terceiro
produto. O plano mestre da oficina Transportes contém 21 tarefas INT (0/21)
em 6 etapas, além das 10 sprints locais estimadas; INT-03 fecha o total e
a capacidade após baseline e prova móvel. Sem liberação imediata de código,
cota extra ou antecipação de todo MON. PWA de gestão offline cancelada.
Frotas somente online e relay E2EE sem ler/persistir telemetria; histórico,
mapa e chave privada somente no desktop, sem fila offline.

---

## Como usar (antes de decidir)

1. Confirmar o **dono do ciclo** em `CALENDARIO_COTA_CURSOR.md`.
2. Abrir Cursor Spending. ≥ 80% → não implementar. ≥ 75% → só copy/docs.
3. Se a decisão **muda uma data pública**, um **dono de ciclo**, ou **abre Agent noutro produto**: ler a tabela abaixo e aplicar a regra da coluna «Decisão».
4. Se um ciclo bater 80% cedo: **desliza o dono seguinte**. Não comprimir dois GAs no mesmo mês.
5. **Principais:** PDV · CSO · Hub. **Brincos:** todo o resto (Ink, Helianto, RU, OIDC, Seed, Circuito, Área 51, MKT, Minerador). O brinco não fura a fila, não toma a headline e **cede** em conflito. Janelas do núcleo (PDV v4, Hub EXE, FRO, Transportes) e o brinco Helianto 2029 só mudam com actualização explícita deste ficheiro + calendário + `AGENTS.md`. Ink PWA **não** tem GA com Agent neste envelope.

---

## Premissas que não se negociam no dia a dia

| Premissa | Valor | Se violar |
|----------|--------|-----------|
| Principais vs brincos | PDV · CSO · Hub mandam; o resto cede | Brinco a furar Agent ou headline do núcleo. |
| Fila | **1 produto pesado por ciclo** | Estouro. O GA seguinte escorrega. |
| Orçamento Agent | US$ 20/mês, **não acumula**, sem on-demand | Mês ocioso ainda é pago; mês cheio não empresta. |
| Teto | 80% do ciclo | Parar código até o reset (~dia 5). |
| Sessão | 1 objectivo · **2 sessões Agent / semana** | Terceira sessão = outro produto a roubar o dono. |
| Tab | Ilimitado; não conta neste envelope | SQLite, copy, SHA, instalador podem andar em Tab + mãos. |
| Funding público | Cursor só (US$ 20 × 40 = **US$ 800** até dez/2029) | Railway, domínio, Pix e certificado de assinatura **não** estão no envelope. |

---

## Matriz de riscos → decisão

| ID | Risco | Quando dói | O que quebra | Decisão (regra) |
|----|--------|------------|--------------|-----------------|
| R1 | T032 do PDV v4 não fecha | out–08/nov/2026 | Headline de 08/11/2026. Hub e freeze CSO M1 deslizam. | Outubro = só PDV. Se A–D não caberem, **reavaliar a data pública** — não abrir Hub H nem Ink S1 em novembro para «compensar». Dezembro, se o PDV escorregar, **não** vai para o Ink. |
| R2 | Duas frentes Agent no mesmo ciclo | Qualquer mês | Cota estoura. O dono seguinte perde o mês. | **Não.** CSO + PDV, Hub + FRO, Frotas + Transportes no mesmo dia = proibido. |
| R3 | Hub EXE não fecha a 06/04 | dez/2026–06/04/2027 | GA Windows do núcleo falha e pressiona o calendário seguinte. | Hub **é** o dono desta janela (não uma semana leve). Tab em set–nov sem competir com o PDV. Não abrir Ink S1–S8 nem reabrir o FRO já publicado. |
| R4 | Brinco a ocupar o núcleo | qualquer mês até folga | Ink (ou outro brinco) toma Agent de Hub/FRO/Transportes. | Ink PWA = **Tab**. Sem GA com Agent **não antes de 2028**. Se PDV, Hub ou CSO precisarem do mês, o brinco **cede**. |
| R5 | Freeze M1 da Frotas não fecha | até 08/11/2026 | A versão já publicada fica sem a estabilização prevista. | FRO 24/24 está em produção desde 06/10/2026 (`b90d1dc`, Flyway V33). Fechar o Freeze M1 com smoke `-Full`/gates finais até 08/11. Sem jornada, app offline nem GPS; não reabrir o epic FRO na janela de 2027. |
| R6 | Transportes + VT não cabem no alvo | INT-02/03 e homologação em 2028 | Oferta conjunta de 08/11/2028 e fila de Helianto ficam em risco. | Provar viabilidade móvel e estimar backlog local + integrado antes de confirmar prazo. Se não couber, aprovar corte explícito ou nova data e espelhar na loja; deslizar Helianto se necessário. Não ocultar a ausência de VT nem presumir duas oficinas simultâneas. |
| R7 | Copy pública à frente da loja | Contínuo | Mac/Linux «em breve», PIX no Free, `/releases/latest` cruzado. | Copy de download/perfis **só na loja da linha**. Sem DMG/DEB Ink. Sem PIX no Free Java. Java ≠ Rust (pasta, launcher, senha). Publicar a camada que mudou. |
| R8 | Envelope Cursor ≠ P&L | Qualquer corte de instalador | Certificado Windows, Railway, domínio, Pix travam Hub EXE ou PDV v4. | Antes de um GA com instalador: confirmar custo **fora** dos US$ 20. Funding extra não substitui os GAs calendariados. |
| R9 | Uma cadeira, uma pessoa | Folga / incidente / mês a 80% no dia 12 | O dono seguinte herda o atraso. | Não planear on-demand. Segunda cota só com patrocínio explícito (`planning.html#patrocinio`). |
| R10 | Brinco Helianto a «abrir só um pouco» antes de 2029 | 2027–2028 | Fura a fila do núcleo. | Agent Helianto **só em 2029**. Até lá: Tab, copy, docs. Se CSO precisar de 2029, Helianto cede. |
| R11 | RU com data pública e sem Agent | 18/06/2027 | Promessa sem capacidade. | Garagem: copy/docs. **Sem** mês de Agent. Não competir com Hub nem FRO. |
| R13 | Exceção Ink Desktop 2.0.1 (07/10/2026) | out/2026 | Agent do Ink dentro da janela PDV v4. Risco de atrasar T032. | **Decisão explícita do dono em 07/10/2026:** patch Desktop Windows 2.0.1 (achados do QA da 2.0.0: importação, pt-BR, build limpo, promessas da loja, P2). Não é Ink PWA (3.0 segue não antes de 2028). Gera e valida localmente; publicação só com aprovação. Se o PDV v4 precisar da cota, a 2.0.1 pára. |
| R12 | Canais PDV Java × Rust misturados | Qualquer release | Loja errada, banco errado, senha errada. | Nunca `/releases/latest` de `caracore-pdv-releases` para o Rust. Free Java = `admin`/`admin`, 1 operador. Rust piloto = quatro logins na **loja Rust**. |

---

## Fora do envelope (até depois de 2029, salvo patrocínio)

Estes itens **não** entram na fila sem actualizar este ficheiro, o calendário e o `FUNDING` em `planning-data.js`:

- Epic CSO Momento 2 completo, além do recorte necessário à integração INT
- Escopo VT adicional ao mínimo aprovado em INT-03; PWA de gestão offline está cancelada, não depende de patrocínio para voltar à fila
- PIX Split PDV em **código** antes do Hub no ar (2027 em papel; Agent só com folga do FRO)
- Ink PWA com Agent **antes de 2028**
- RU Soberano com mês de Agent
- Segunda linha nativa Ink (`.dmg` / `.deb`) — **cancelada**; canal = PWA quando houver folga do núcleo

Patrocínio acima do envelope (segunda cota, on-demand pontual, mês extra) pode abrir Momento 2, dar mês a RU ou **abrir Agent no Ink**. **Não** substitui PDV v4, Hub EXE, Transportes nem Helianto, e não reabre o FRO já publicado.

---

## Caminho crítico (o que tem de fechar)

| Janela | Tem de fechar | Se falhar |
|--------|---------------|-----------|
| out–08/nov/2026 | PDV v4: T032 + corte | Materializado em 11/10: o corte foi recusado e 08/11 deixa de ser GA confirmado, sem data nova. Dezembro **não** é Ink — é Hub, ou o PDV se ainda não cortou. |
| dez/2026–06/04/2027 | Hub: SQLite + EXE + SHA na loja | GA 06/04 falha e pressiona a sequência dos marcos do núcleo. |
| 08/04–dez/2027 | Sem dono de Agent; FRO 24/24 já publicado | Não reabrir o epic FRO; não abrir Helianto, Ink Agent nem PIX Split Agent. |
| jan–nov/2028 | CSO Transportes + Virtual Tracker integrado, alvo 08/11/2028 sujeito aos gates INT | Aprovar recorte ou nova data; espelhar na loja e deslizar Helianto se necessário. |
| 2029 | Helianto GA 30/12/2029 | Sem segundo produto pesado neste ano. |

---

## Perguntas de decisão (usar à letra)

Antes de um Agent pesado ou de uma data nova:

1. Isto é o **dono deste ciclo**? Se não, parar.
2. Spending ≥ 75%? Se sim, só copy. ≥ 80%? Só tracker/handoff.
3. Isto muda um GA da tabela «não escorregam»? Se sim, actualizar `AGENTS.md`, `ecosistema.html#roadmap`, `planning-data.js` e este ficheiro **no mesmo movimento**.
4. Isto é **brinco** a furar PDV/CSO/Hub? Se sim, o brinco cede — não «só um extract». Revisão da fila só com actualização explícita dos canónicos.
5. A loja daquela linha já diz a verdade? Se a copy pública mentir (Mac «em breve», PIX no Free), **corrigir a loja antes** de mais código.

---

## Ponteiros

| Papel | Ficheiro |
|-------|----------|
| Capacidade (quando) | [`CALENDARIO_COTA_CURSOR.md`](CALENDARIO_COTA_CURSOR.md) |
| Funding público | [`../planning.html#patrocinio`](../planning.html#patrocinio) |
| Skyline 0–100% | [`../planning.html`](../planning.html) |
| Retomada | [`ECOSYSTEM_MEMORIA.md`](ECOSYSTEM_MEMORIA.md) · [`INICIAR_NOVA_TAREFA.md`](INICIAR_NOVA_TAREFA.md) |
| Fonte IAs | `AGENTS.md` (raiz e `caracore-site/AGENTS.md`) |
| PDV v4 | `caracore-pdv/docs/arquitetura/PLANO_LANCAMENTO_V4.md` |
| Ink PWA | `caracore-ink/docs/PLANO_PWA.md` |
| Hub EXE | `caracore-hub/docs/contexto-rapido.md` |

IAs: após corte ou mudança de dono, sincronizar este ficheiro + calendário + `ECOSYSTEM_MEMORIA.md` (linha no changelog) + regras Cursor do repo tocado.
