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
  AS_OF: "2026-09",
  AS_OF_LABEL: "Setembro de 2026",
  HORIZON: "2026 → 2029",
  NOTE:
    "Onze produtos do checklist de negócio. Helianto e MKT ficam fora desta grelha (Garagem / canal gratuito). A cota Cursor (US$ 20/mês) define quem sobe cada mês — um produto pesado por ciclo.",

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
      "O roadmap público cabe em US$ 20/mês até dezembro de 2029 se a empresa tiver um produto pesado por ciclo e não comprar on-demand.",
    paidNote:
      "A cota não acumula. Mês ocioso ainda é cobrado. Mês cheio não empresta crédito ao seguinte. Tab e autocomplete não entram nesta conta; o que queima o envelope é Agent (Flyway, auth, extract, HTTP).",
    covers: [
      { when: "08/11/2026", item: "PDV Java v4 (GA)", spend: "Agent out–nov/2026" },
      { when: "06/04/2027", item: "Hub instalador Windows", spend: "Agent 01–07/04/2027; resto Tab" },
      { when: "26/06/2027", item: "Ink Agenda PWA", spend: "Agent dez/2026–jun/2027" },
      { when: "08/11/2028", item: "CSO Transportes desktop", spend: "Agent jan–nov/2028" },
      { when: "30/12/2029", item: "Helianto Condominium (GA)", spend: "Agent 2029" },
    ],
    queue: [
      { period: "set/2026", owner: "CSO COE" },
      { period: "out–08/nov/2026", owner: "PDV v4" },
      { period: "dez/2026–jun/2027", owner: "Ink PWA" },
      { period: "01–07/abr/2027", owner: "Hub EXE (leve)" },
      { period: "jul–dez/2027", owner: "CSO FRO" },
      { period: "2028", owner: "CSO Transportes" },
      { period: "dez/2028", owner: "Buffer Transportes" },
      { period: "2029", owner: "Helianto" },
    ],
    notInEnvelope: [
      "FRO da Frotas em outubro/2026 (briga com o PDV v4)",
      "Momento 2 e PWA da frota em 2027–2029 (2029 é Helianto)",
      "Virtual Tracker / GPS no mesmo ano do Transportes",
      "RU com mês de Agent",
      "PIX Split PDV em código no semestre do PWA Ink",
    ],
    sponsorAdds:
      "Patrocínio acima deste envelope (segunda cota, on-demand pontual ou mês extra de Agent) é o que antecipa FRO, abre Momento 2 ou dá mês a RU — não substitui os GAs já calendariados.",
    contactHref: "index.html#contato",
    source: "docs/CALENDARIO_COTA_CURSOR.md",
  },

  YEARS: [
    {
      id: "y2026",
      label: "2026",
      subtitle: "PDV v4 · freeze CSO M1",
      pct: 72,
      note: "Free 3.2.4, Ink desktop, Minerador, Circuito e Frotas no ar. Falta o corte T032 (08/11).",
    },
    {
      id: "y2027",
      label: "2027",
      subtitle: "Hub · Ink PWA · FRO",
      pct: 12,
      note: "Hub web 2.1 pronta. Instalador 06/04, PWA 26/06 e FRO no 2.º semestre ainda não começaram em Agent.",
    },
    {
      id: "y2028",
      label: "2028",
      subtitle: "CSO Transportes",
      pct: 6,
      note: "Oficina desktop existe. GA público 08/11/2028. Virtual Tracker não compete neste ano.",
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
      tone: "pdv",
      shop: "https://pdv.caracore.com.br/",
      hundred: "GA v4 em 08/11/2026 (T032). Free 3.2.4 já no ar.",
      now: "Canal maduro v3.2.4-free. Candidato RC2 estacionado. Agent: out–nov/2026.",
      history: [
        { m: "2026-06", p: 62 },
        { m: "2026-07", p: 68 },
        { m: "2026-08", p: 74 },
        { m: "2026-09", p: 76 },
      ],
    },
    {
      id: "pdv-rust",
      n: 2,
      name: "PDV Rust",
      tone: "rust",
      shop: "https://pdv-rust.caracore.com.br/",
      hundred: "Piloto Windows utilizável, sem substituir o Java, até Mar/2029.",
      now: "v0.1.4 no ar. Não é a frente de cota até o GA Java v4.",
      history: [
        { m: "2026-06", p: 28 },
        { m: "2026-07", p: 32 },
        { m: "2026-08", p: 36 },
        { m: "2026-09", p: 38 },
      ],
    },
    {
      id: "minerador",
      n: 3,
      name: "Minerador 4.0",
      tone: "ete",
      shop: "https://ete.caracore.com.br/",
      hundred: "Canal público estável (v1.2.3) no horizonte.",
      now: "v1.2.3 Windows/Linux/macOS. Manutenção, sem GA novo.",
      history: [
        { m: "2026-06", p: 88 },
        { m: "2026-07", p: 92 },
        { m: "2026-08", p: 100 },
        { m: "2026-09", p: 100 },
      ],
    },
    {
      id: "oidc",
      n: 4,
      name: "Reino OIDC",
      tone: "reino",
      shop: "https://oidc.caracore.com.br/",
      hundred: "Sala de estudo Windows com RC público estável.",
      now: "v2.0.0-RC1. Sem mês de Agent na fila 2026–2028.",
      history: [
        { m: "2026-06", p: 85 },
        { m: "2026-07", p: 90 },
        { m: "2026-08", p: 92 },
        { m: "2026-09", p: 92 },
      ],
    },
    {
      id: "circuito",
      n: 5,
      name: "Circuito Ferradura",
      tone: "circuito",
      shop: "https://circuito.caracore.com.br/",
      hundred: "Trilha activa (PF grátis · escolas R$ 5/aluno/mês).",
      now: "Fase activa no ecossistema. Sem GA novo neste horizonte.",
      history: [
        { m: "2026-06", p: 95 },
        { m: "2026-07", p: 96 },
        { m: "2026-08", p: 98 },
        { m: "2026-09", p: 98 },
      ],
    },
    {
      id: "hub",
      n: 6,
      name: "Hub",
      tone: "hub",
      shop: "https://hub.caracore.com.br/",
      hundred: "Instalador Windows SQLite em 06/04/2027.",
      now: "Web 2.1 pronta. Agent do EXE só 01–07/04/2027. Até lá: Tab + mãos.",
      history: [
        { m: "2026-06", p: 48 },
        { m: "2026-07", p: 52 },
        { m: "2026-08", p: 55 },
        { m: "2026-09", p: 58 },
      ],
    },
    {
      id: "area51",
      n: 7,
      name: "Área 51",
      tone: "area51",
      shop: "https://area51.caracore.com.br/",
      hundred: "Baseline institucional 0.1.0-dev no ar (loja + wiki).",
      now: "Pacote licenciado publicado. Não é o Hub nem o CSO.",
      history: [
        { m: "2026-06", p: 90 },
        { m: "2026-07", p: 95 },
        { m: "2026-08", p: 100 },
        { m: "2026-09", p: 100 },
      ],
    },
    {
      id: "ink",
      n: 8,
      name: "Ink Agenda",
      tone: "ink",
      shop: "https://ink.caracore.com.br/",
      hundred: "Desktop v2 no ar + PWA em 26/06/2027.",
      now: "Windows v2.0.0 publicado. PWA = S0 docs. Agent S1 em dez/2026.",
      history: [
        { m: "2026-06", p: 68 },
        { m: "2026-07", p: 70 },
        { m: "2026-08", p: 70 },
        { m: "2026-09", p: 72 },
      ],
    },
    {
      id: "seed",
      n: 9,
      name: "Seed",
      tone: "seed",
      shop: "https://seed.caracore.com.br/",
      hundred: "Vitrine honesta: ferramenta interna, sem oferta aberta.",
      now: "Estado declarado. Sem download público.",
      history: [
        { m: "2026-06", p: 100 },
        { m: "2026-07", p: 100 },
        { m: "2026-08", p: 100 },
        { m: "2026-09", p: 100 },
      ],
    },
    {
      id: "ru",
      n: 10,
      name: "RU Soberano",
      tone: "ru",
      shop: "https://ru.caracore.com.br/",
      hundred: "Garagem 18/06/2027 (simulador + sala retrô).",
      now: "Vitrine no ar. Sem mês de Agent — copy no junho do Ink PWA.",
      history: [
        { m: "2026-06", p: 8 },
        { m: "2026-07", p: 10 },
        { m: "2026-08", p: 12 },
        { m: "2026-09", p: 12 },
      ],
    },
    {
      id: "cso",
      n: 11,
      name: "CSO",
      tone: "cso",
      shop: "https://cso-transp.caracore.com.br/",
      hundred: "Frotas completa (FRO) + Transportes desktop 08/11/2028.",
      now: "Frotas em produção (COE 27/33). Freeze M1 em 08/11. FRO Agent só jul–dez/2027. Transportes = 2028.",
      history: [
        { m: "2026-06", p: 30 },
        { m: "2026-07", p: 34 },
        { m: "2026-08", p: 36 },
        { m: "2026-09", p: 38 },
      ],
    },
  ],
};
