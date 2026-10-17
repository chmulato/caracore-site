/**
 * Planning Cara Core — dados mensais das 11 torres (0–100%).
 *
 * Actualização (1.º dia útil do mês):
 * 1. Alterar AS_OF para "YYYY-MM".
 * 2. Em cada produto, acrescentar { m: "YYYY-MM", p: N } no fim de history.
 *    N = progresso rumo ao marco desse produto no horizonte 2026 → 2029.
 * 3. Ajustar YEARS[].pct (quanto daquele ano civil já está cumprido).
 * 4. FUNDING só muda se a assinatura ou o horizonte mudarem (US$ 20 × 40 = US$ 800).
 * 5. Publicar a matriz. Não inventar depoimento nem GA que não saiu.
 *
 * 100% = o compromisso público desse produto até Dez/2029, não “produto eterno”.
 * Fonte de datas: AGENTS.md · CALENDARIO_COTA_CURSOR.md · ecosistema.html#roadmap
 */
window.CARACORE_PLANNING = {
  AS_OF: "2026-10",
  AS_OF_LABEL: "15/10/2026",
  HORIZON: "2026 → 2029",
  NOTE:
    "Leitura de 15/10/2026. Os principais são PDV, CSO e Hub; o resto são brincos e não mandam na cota. A Free v3.2.12 é uma atualização corretiva da linha 3.2.x, em manutenção até 08/11/2026; a build publicada excepcionalmente ainda tem gates pendentes e não está homologada por completo. Depois, a transição é pela PDV v4 via ciclo de RCs; GA somente após gates e aceites formais, sem data automática em 08/11. A pré-release pública é a v4.0.0-rc6, com SHA-256 publicado; a v4.0.0-rc5 fica no histórico. O Hub segue em pré-release Windows, com aceite de QA pendente. Seed 0.1.5 é pré-release candidata para avaliação, sem homologação independente. BioReator 4.0 Community 1.1.1 foi publicada em 13/10; permanece na torre 10, com o percentual em 12%. A Premium chega em 18/06/2027, sem preço e sem PIX. Helianto e MKT ficam fora desta grelha. Um produto pesado por ciclo. Percentual representa avanço rumo ao compromisso público, não homologação técnica, e não sobe por GA que ainda não saiu.",

  /**
   * Camada executiva (L1). Actualizar no 1.º dia útil com AS_OF.
   * flags[] = só exceções. Produto em ritmo normal não entra aqui.
   * text permanece o parágrafo-fonte. lead + detail são as duas linhas públicas; tip vai para hover e ficha.
   */
  EXEC: {
    owner: { period: "out–08/nov/2026", who: "PDV v4 RCs + transição Free 3.2.12" },
    ownerNext: { period: "09/nov–04/dez/2026", who: "PDV v4 RCs + copy CSO M1" },
    next: {
      when: "08/11/2026",
      what: "Encerramento da manutenção da Free PDV 3.2.12",
      gate: "Transição para o ciclo de RCs v4",
      action: "Continuar homologação; promover GA somente após aprovação formal",
    },
    flags: [
      {
        id: "pdv-java",
        kind: "risco",
        title: "PDV Java · transição 3.2.12 para v4",
        lead: "A v3.2.12-free é uma atualização corretiva da linha 3.2.x, com encerramento em 08/11. A corretiva foi publicada em 15/10/2026 com autorização explícita para validações pendentes; 19/19 testes focados Java 25/H2 aprovados.",
        detail: "Homologação operacional incompleta · RC6 pública · RC7 em QA local",
        tip: "Na Free, seguem pendentes suíte completa, validação das migrações SQLite/V047 no pacote, smoke/soak Windows, runtime Linux/macOS e aceites Edge/leitor. 08/11 encerra a manutenção da 3.2.12, não é data de GA v4.",
        text: "A v3.2.12-free foi publicada como estável/Latest em 15/10/2026 por autorização explícita; 19/19 testes focados Java 25/H2 e integridade dos ZIPs aprovados; não declarar homologação operacional completa. Permanecem pendentes suíte completa, validação das migrações SQLite/V047 no pacote, smoke/soak Windows, runtime Linux/macOS e aceites Edge/leitor físico. A pré-release pública v4.0.0-rc6 tem SHA-256 0c00b24b33b3c365fd1f24ec173bfa4e35bedf1946b2df4151035250780d5325; RC7 está em QA local. T032 e aceites formais permanecem pendentes. 08/11 encerra a manutenção da 3.2.12, não é data de GA v4.",
      },
      {
        id: "cso",
        kind: "desvio",
        title: "CSO · freeze M1 em 08/11/2026",
        lead: "Frotas em produção desde 06/10. O freeze M1 ainda não fechou.",
        detail: "Transportes + Virtual Tracker integrado: alvo conjunto 08/11/2028",
        tip: "Frotas sem GPS hoje. Integração futura exige prova móvel, capacidade e homologação; histórico somente no desktop.",
        text: "Frotas em produção desde 06/10. Freeze M1 em 08/11/2026 estabiliza essa versão. Sem jornada, app offline nem GPS.",
      },
      {
        id: "hub",
        kind: "desvio",
        title: "Hub · pré-release Windows no ar",
        lead: "Pré-release Windows no ar; o aceite de QA desta build ainda está pendente.",
        detail: "v2.1.0-rc1.2 · instalador e ZIP · unsigned · GA previsto em 06/04/2027",
        text: "Pré-release Windows v2.1.0-rc1.2 disponível com instalador e ZIP, sem assinatura; o aceite de QA desta build ainda não foi feito. GA do instalador previsto para 06/04/2027. Mac e Linux ficam fora desta tag.",
      },
    ],
  },

  /**
   * Envelope de Funding / Patrocínio. Actualizar só se a assinatura ou o horizonte mudarem.
   * Canónico de capacidade: caracore-site/docs/CALENDARIO_COTA_CURSOR.md
   */
  FUNDING: {
    fromLabel: "set/2026",
    toLabel: "dez/2029",
    monthly: 20,
    months: 40,
    total: 800,
    currency: "US$",
    tool: "Cursor Pro",
    capPct: 80,
    sessionsPerWeek: 2,
    onDemand: false,
    verdict:
      "Envelope de US$ 20/mês até dezembro de 2029, com um produto pesado por ciclo e sem on-demand. A viabilidade do alvo conjunto Transportes + Virtual Tracker depende da prova móvel e da estimativa INT-03; não é prazo garantido.",
    paidNote:
      "A cota não acumula. Mês ocioso ainda é cobrado. Mês cheio não empresta crédito ao seguinte. Tab e autocomplete não entram nesta conta; o que queima o envelope é Agent (Flyway, auth, extract, HTTP).",
    covers: [
      { when: "08/11/2026", item: "Encerramento da Free PDV 3.2.12; v4 segue no ciclo de RCs", spend: "Agent out–nov/2026" },
      { when: "06/04/2027", item: "Hub instalador Windows", spend: "Agent dez/2026–06/04/2027" },
      { when: "08/04–dez/2027", item: "Sem dono de Agent", spend: "FRO 24/24 já publicado em 06/10" },
      { when: "Alvo: 08/11/2028", item: "CSO Transportes + Virtual Tracker integrado", spend: "Jan–nov/2028; capacidade a validar em INT-03" },
      { when: "30/12/2029", item: "Helianto Condominium (GA)", spend: "Agent 2029" },
    ],
    queue: [
      { period: "set/2026", owner: "CSO COE (concluído)" },
      { period: "out–08/nov/2026", owner: "PDV v4" },
      { period: "09/nov–04/dez/2026", owner: "PDV corte + copy CSO M1" },
      { period: "dez/2026–06/04/2027", owner: "Hub" },
      { period: "08/04–dez/2027", owner: "Sem dono · FRO já publicado" },
      { period: "2028", owner: "CSO Transportes + integração VT, sujeito aos gates INT" },
      { period: "dez/2028", owner: "Buffer Transportes" },
      { period: "2029", owner: "Helianto" },
    ],
    notInEnvelope: [
      "Reabrir o FRO (já publicado em 06/10/2026)",
      "Ink PWA com Agent antes de 2028 (brinco; Tab até folga do núcleo)",
      "Epic Momento 2 completo, além do recorte aprovado para integração INT",
      "PWA de gestão offline cancelada; sem fila ou recuperação de trajetos offline",
      "BioReator 4.0 com mês de Agent (Community 1.1.1 publicada; Premium em 18/06/2027, sem preço e sem PIX)",
      "PIX Split PDV em código antes do Hub no ar",
    ],
    sponsorAdds:
      "Patrocínio acima deste envelope (segunda cota, on-demand pontual ou mês extra de Agent) abre Momento 2 ou dá mês ao BioReator. Não substitui os GAs já calendariados nem reabre o FRO.",
    contactHref: "index.html#contato",
    source: "docs/CALENDARIO_COTA_CURSOR.md",
  },

  YEARS: [
    {
      id: "y2026",
      label: "2026",
      subtitle: "PDV v4 · freeze CSO M1",
      pct: 74,
      note: "Free 3.2.12-free é uma atualização corretiva da linha 3.2.x e encerra em 08/11/2026; a corretiva foi publicada em 15/10/2026 por autorização explícita, com gates e homologação operacional pendentes. Pré-release pública v4.0.0-rc6, com SHA-256 publicado; RC7 em QA local. A sucessão v4 segue pelo ciclo de RCs e o GA depende de gates e aceites formais, sem data automática em 08/11. Freeze M1 do CSO ainda não fechado. BioReator Community 1.1.1 publicada em 13/10 na torre 10, percentual em 12%. Premium em 18/06/2027.",
    },
    {
      id: "y2027",
      label: "2027",
      subtitle: "Hub",
      pct: 14,
      note: "Hub: pré-release Windows v2.1.0-rc1.2 publicada; aceite de QA pendente. GA do instalador em 06/04. A janela 08/04–dez não reabre o FRO. Ink PWA = Tab, não antes de 2028.",
    },
    {
      id: "y2028",
      label: "2028",
      subtitle: "CSO Transportes + Virtual Tracker",
      pct: 6,
      note: "Alvo conjunto 08/11/2028, não GA garantido. Duas aplicações, VT como capacidade integrada. 10 sprints locais estimadas + 21 tarefas INT em 6 etapas (0/21); INT-03 fecha o total após baseline e prova móvel. Frotas somente relay E2EE sem ler ou persistir trajetos/envelopes; chave privada, mapa e histórico somente no desktop. Conexão obrigatória, sem fila offline. Perfil a medir: presença 120 s quando necessária e posição 60 s em viagem, não instantânea.",
    },
    {
      id: "y2029",
      label: "2029",
      subtitle: "Helianto",
      pct: 0,
      note: "GA público 30/12/2029. Agent no ano civil 2029, depois do Transportes.",
    },
  ],

  PRODUCTS: [
    {
      id: "pdv-java",
      n: 1,
      name: "PDV Java",
      core: true,
      state: "risk",
      tone: "pdv",
      shop: "https://pdv.caracore.com.br/",
      hundred: "atualização corretiva da linha 3.2.x: v3.2.12-free, manutenção até 08/11/2026. Pré-release pública v4.0.0-rc6; sucessão pelo ciclo de RCs, com GA somente após os gates e aceites formais.",
      now: "Pré-release pública v4.0.0-rc6, com SHA publicado. Estável v3.2.12-free, Latest. T032 aberto. Sem PIX integrado nem NF-e/NFC-e no Free.",
      history: [
        { m: "2026-06", p: 62 },
        { m: "2026-07", p: 68 },
        { m: "2026-08", p: 74 },
        { m: "2026-09", p: 76 },
        { m: "2026-10", p: 80 },
      ],
    },
    {
      id: "pdv-rust",
      n: 2,
      name: "PDV Rust",
      core: false,
      state: "ok",
      tone: "rust",
      shop: "https://pdv-rust.caracore.com.br/",
      hundred: "Piloto Windows utilizável, sem substituir o Java, até Mar/2029.",
      now: "v0.1.4 no ar. Não é a frente de cota até o GA Java v4.",
      history: [
        { m: "2026-06", p: 28 },
        { m: "2026-07", p: 32 },
        { m: "2026-08", p: 36 },
        { m: "2026-09", p: 38 },
        { m: "2026-10", p: 38 },
      ],
    },
    {
      id: "minerador",
      n: 3,
      name: "Minerador 4.0",
      core: false,
      state: "done",
      tone: "ete",
      shop: "https://ete.caracore.com.br/",
      hundred: "Canal público estável (v1.2.3) no horizonte.",
      now: "v1.2.3 Windows/Linux/macOS. Manutenção, sem GA novo.",
      history: [
        { m: "2026-06", p: 88 },
        { m: "2026-07", p: 92 },
        { m: "2026-08", p: 100 },
        { m: "2026-09", p: 100 },
        { m: "2026-10", p: 100 },
      ],
    },
    {
      id: "oidc",
      n: 4,
      name: "Reino OIDC",
      core: false,
      state: "done",
      tone: "reino",
      shop: "https://oidc.caracore.com.br/",
      hundred: "Sala de estudo Windows. Edição Free 2.0.2 publicada.",
      now: "Edição Free v2.0.2-free. Três Eras gratuitas. A edição paga está em desenvolvimento, sem PIX nesta etapa. v2.0.1-free e v2.0.0 no histórico. Sem mês de Agent na fila 2026–2028.",
      history: [
        { m: "2026-06", p: 85 },
        { m: "2026-07", p: 90 },
        { m: "2026-08", p: 92 },
        { m: "2026-09", p: 92 },
        { m: "2026-10", p: 92 },
      ],
    },
    {
      id: "circuito",
      n: 5,
      name: "Circuito Ferradura",
      core: false,
      state: "done",
      tone: "circuito",
      shop: "https://circuito.caracore.com.br/",
      hundred: "Trilha ativa (PF grátis · escolas R$ 5/aluno/mês).",
      now: "v2.0.24 na loja (08/10/2026). Demo de console Windows sem assinatura; curso HTML e pacote macOS. v2.0.23 no histórico.",
      history: [
        { m: "2026-06", p: 95 },
        { m: "2026-07", p: 96 },
        { m: "2026-08", p: 98 },
        { m: "2026-09", p: 98 },
        { m: "2026-10", p: 98 },
      ],
    },
    {
      id: "hub",
      n: 6,
      name: "Hub",
      core: true,
      state: "watch",
      tone: "hub",
      shop: "https://hub.caracore.com.br/",
      hundred: "Instalador Windows com SQLite em 06/04/2027. Canais: Mercado Livre, Shopee e Temu.",
      now: "Pré-release Windows v2.1.0-rc1.2 publicada, instalador e ZIP, sem assinatura. GA 06/04/2027. Mac e Linux fora desta tag.",
      history: [
        { m: "2026-06", p: 48 },
        { m: "2026-07", p: 52 },
        { m: "2026-08", p: 55 },
        { m: "2026-09", p: 58 },
        { m: "2026-10", p: 70 },
      ],
    },
    {
      id: "area51",
      n: 7,
      name: "Área 51",
      core: false,
      state: "done",
      tone: "area51",
      shop: "https://area51.caracore.com.br/",
      hundred: "Baseline institucional 0.1.0-dev no ar (loja + wiki).",
      now: "Pacote licenciado publicado. Não é o Hub nem o CSO.",
      history: [
        { m: "2026-06", p: 90 },
        { m: "2026-07", p: 95 },
        { m: "2026-08", p: 100 },
        { m: "2026-09", p: 100 },
        { m: "2026-10", p: 100 },
      ],
    },
    {
      id: "ink",
      n: 8,
      name: "Ink Agenda",
      core: false,
      state: "ok",
      tone: "ink",
      shop: "https://ink.caracore.com.br/",
      hundred: "Desktop v2 no ar. PWA em roadmap (não antes de 2028).",
      now: "Windows v2.0.1 publicado. PWA em roadmap, não antes de 2028. Sem Agent até folga do núcleo.",
      history: [
        { m: "2026-06", p: 68 },
        { m: "2026-07", p: 70 },
        { m: "2026-08", p: 70 },
        { m: "2026-09", p: 72 },
        { m: "2026-10", p: 72 },
      ],
    },
    {
      id: "seed",
      n: 9,
      name: "Seed",
      core: false,
      state: "watch",
      tone: "seed",
      shop: "https://seed.caracore.com.br/",
      hundred: "Piloto público local gratuito sob MIT; pré-release candidata Windows 0.1.5 para avaliação. Homologação independente pendente.",
      now: "v0.1.5 candidata publicada para avaliação; 0.1.4 é a release estável anterior. Não homologado nem pronto para produção.",
      history: [
        { m: "2026-06", p: 100 },
        { m: "2026-07", p: 100 },
        { m: "2026-08", p: 100 },
        { m: "2026-09", p: 100 },
        { m: "2026-10", p: 100 },
      ],
    },
    {
      id: "ru",
      n: 10,
      name: "BioReator 4.0",
      core: false,
      state: "ok",
      tone: "ru",
      shop: "https://ru.caracore.com.br/",
      hundred: "Community 1.1.1 publicada em 13/10/2026. Distingue biomassa viável/total, calcula P/V pelo volume líquido e registra critérios de término. Premium em 18/06/2027, sem preço e sem PIX.",
      now: "Community 1.1.1 na loja, MSI e ZIP na release. Premium em 18/06/2027. Sem mês de Agent.",
      history: [
        { m: "2026-06", p: 8 },
        { m: "2026-07", p: 10 },
        { m: "2026-08", p: 12 },
        { m: "2026-09", p: 12 },
        { m: "2026-10", p: 12 },
      ],
    },
    {
      id: "cso",
      n: 11,
      name: "CSO",
      core: true,
      state: "watch",
      tone: "cso",
      shop: "https://cso-transp.caracore.com.br/",
      hundred: "Frotas disponível e Transportes + Virtual Tracker integrado homologados; alvo conjunto 08/11/2028 condicionado aos gates INT, sem disponibilidade automática.",
      now: "Frotas em produção desde 06/10, sem GPS hoje; freeze M1 em 08/11/2026. Transportes + VT integrado em desenvolvimento: 0/21 tarefas INT, total de sprints/capacidade pendente em INT-03. Sem contratação antecipada.",
      history: [
        { m: "2026-06", p: 30 },
        { m: "2026-07", p: 34 },
        { m: "2026-08", p: 36 },
        { m: "2026-09", p: 38 },
        { m: "2026-10", p: 40 },
      ],
    },
  ],
};
