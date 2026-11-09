/**
 * Planning Cara Core — dados mensais das torres (0–100%).
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
  AS_OF_LABEL: "31/10/2026",
  HORIZON: "2026 → 2029",
  NOTE:
    "Leitura de percentuais em 31/10/2026; estado dos produtos revisto em 09/11/2026. Os principais são PDV, CSO, Hub e Ink Agenda; o resto são brincos e não mandam na cota. A PDV v4.0.0 foi lançada em 08/11/2026 — release publicada em 06/11/2026, pacote assinado com duas chaves Ed25519 — e é a versão indicada para operar; a v3.2.12-free passa a versão anterior, com a manutenção encerrada em 08/11/2026 e os pacotes ainda disponíveis. A v4.0.0-rc6 e a v4.0.0-rc5 ficam no histórico. O Hub segue em pré-release Windows v2.1.0-rc1.10, em ZIP portátil, com aceite de QA pendente. O Ink Agenda está na v2.2.1 desde 04/11/2026 e o Desktop 2.3.0 tem entrega planejada para 29/01/2027. Seed 0.1.5 é pré-release candidata para avaliação, sem homologação independente. BioReator 4.0 Community 1.1.1 foi publicada em 13/10; permanece na torre 10, com o percentual em 12%. A Premium chega em 18/06/2027, sem preço e sem PIX. Helianto e MKT ficam fora desta grelha. Um produto pesado por ciclo. Os 5 dias/mês reservados ao Ink até o 2.3.0 sair cobrem só a atualização 2.3.0 do Desktop, não a PWA, e não tiram dias do Hub nem do PDV. Percentual representa avanço rumo ao compromisso público, não homologação técnica, e não sobe por lançamento que ainda não saiu.",

  /**
   * Camada executiva (L1). Actualizar no 1.º dia útil com AS_OF.
   * flags[] = só exceções. Produto em ritmo normal não entra aqui.
   * text permanece o parágrafo-fonte. lead + detail são as duas linhas públicas; tip vai para hover e ficha.
   */
  EXEC: {
    owner: { period: "09/nov–04/dez/2026", who: "PDV v4 pós-GA + copy CSO M1" },
    ownerNext: { period: "dez/2026–06/04/2027", who: "Hub · GA do instalador Windows" },
    next: {
      when: "29/01/2027",
      what: "Ink Desktop 2.3.0",
      gate: "Onda 1 fechada em 08/11/2026",
      action: "Publicar na loja do Ink depois do ensaio de release; o Hub segue dono da cota",
    },
    flags: [
      {
        id: "cso",
        kind: "desvio",
        title: "CSO · freeze M1 em 08/11/2026",
        lead: "Frotas em produção desde 06/10. O freeze M1 não tem fechamento registrado.",
        detail: "Transportes + Virtual Tracker integrado: alvo conjunto 08/11/2028",
        tip: "Frotas sem GPS hoje. Integração futura exige prova móvel, capacidade e homologação; histórico somente no desktop.",
        text: "Frotas em produção desde 06/10. Freeze M1 em 08/11/2026 estabiliza essa versão, sem registro de fechamento até aqui. Sem jornada, app offline nem GPS.",
      },
      {
        id: "hub",
        kind: "desvio",
        title: "Hub · pré-release Windows no ar",
        lead: "Pré-release Windows no ar; o aceite de QA desta build ainda está pendente.",
        detail: "v2.1.0-rc1.10 · ZIP portátil · unsigned · GA previsto em 06/04/2027",
        text: "Pré-release Windows v2.1.0-rc1.10 disponível em ZIP portátil, sem assinatura; o aceite de QA desta build ainda não foi feito. GA do instalador previsto para 06/04/2027. Mac e Linux ficam fora desta tag.",
      },
    ],
  },

  /**
   * Camada executiva do painel (2026-11). Só copy e agrupamento:
   * percentuais continuam em PRODUCTS, datas em EXEC/FUNDING.
   */
  PANEL: {
    core: {
      "pdv-java": {
        display: "CaraCore PDV",
        icon: "cash-stack",
        kicker: "Produto 01 · Varejo",
        status: "Em operação · v4.0.0 lançada em 08/11/2026",
        milestone: "Sem data pública · evolução da linha v4",
        priority: "Alta",
        priorityNote: "dono da cota até 04/12/2026, no pós-GA; depois o Hub assume",
        line: "A v4.0.0 está em operação desde 08/11/2026, com migração do banco da 3.2.x no primeiro acesso; a 3.2.12-free passa a versão anterior.",
      },
      hub: {
        display: "CaraCore Hub",
        icon: "box-seam",
        kicker: "Produto 02 · Logística de retirada",
        status: "Pré-release Windows · sem aceite de QA",
        milestone: "06/04/2027 · GA do instalador Windows",
        priority: "Alta",
        priorityNote: "próximo dono da cota, dez/2026–06/04/2027",
        line: "A rc1.10 está no ar como pré-release unsigned desde 07/11/2026. O GA depende do aceite de QA e dos gates ainda abertos.",
      },
      cso: {
        display: "CaraCore CSO",
        icon: "truck",
        kicker: "Produto 03 · Frotas e transporte",
        status: "Frotas em operação · Transportes em desenvolvimento",
        milestone: "08/11/2028 · Transportes + VT integrado (alvo conjunto)",
        priority: "Alta",
        priorityNote: "execução paralela, sem cota de Agent hoje",
        line: "Frotas roda desde 06/10/2026, sem GPS. Transportes + Virtual Tracker têm alvo conjunto em 08/11/2028, sujeito aos gates INT.",
      },
      ink: {
        display: "CaraCore Ink Agenda",
        icon: "calendar2-check",
        kicker: "Produto 04 · Agenda",
        status: "Desktop v2.2.1 em operação",
        milestone: "29/01/2027 · Desktop 2.3.0 (Onda 1)",
        priority: "Média",
        priorityNote: "5 dias/mês até o 2.3.0, sem tirar dias do Hub nem do PDV",
        line: "O Desktop v2.2.1 está publicado desde 04/11/2026 para Windows e Linux. A 2.3.0 tem data planejada para 29/01/2027 e conteúdo ainda não publicado; a PWA não sai antes de 2028.",
      },
    },

    satellites: [
      {
        label: "Pesquisa",
        icon: "diagram-3",
        hint: "Modelos e simulação aplicada.",
        items: ["minerador", "ru"],
      },
      {
        label: "Laboratório",
        icon: "beaker",
        hint: "Pilotos com limite explícito, fora da fila de execução.",
        items: ["pdv-rust", "seed"],
      },
      {
        label: "Educação",
        icon: "mortarboard",
        hint: "Conteúdo e trilhas de estudo, mantidos sem Agent.",
        items: ["circuito", "oidc", "rebeldia-mecatronica"],
      },
      {
        label: "Ferramentas complementares",
        icon: "tools",
        hint: "Apoio à operação e a projetos de nicho.",
        items: ["area51", "ink"],
      },
    ],

    /** Uma linha por projeto: por que ele está naquela cor do semáforo. */
    semaforo: {
      minerador: "v1.2.3 estável; sem GA novo no horizonte.",
      oidc: "Free 2.0.2 publicada; edição paga em desenvolvimento.",
      circuito: "v2.0.24 na loja desde 08/10/2026.",
      area51: "Baseline 0.1.0-dev no ar.",
      ink: "Desktop 2.2.1 publicado em 04/11/2026; PWA só depois de 2028.",
      ru: "Community 1.1.1 publicada em 13/10/2026.",
      "rebeldia-mecatronica": "Livro e PDF publicados; app em estudo.",
      "pdv-rust": "v0.1.4 no ar; fora da cota.",
      hub: "Pré-release rc1.10 sem aceite de QA.",
      cso: "Freeze M1 de 08/11/2026 sem fechamento registrado.",
      seed: "Candidata 0.1.5 sem homologação independente.",
      "pdv-java": "v4.0.0 em operação desde 08/11/2026; a 3.2.12-free vira versão anterior.",
    },

    roadmap: [
      {
        tag: "Agora",
        when: "09/nov–04/dez/2026",
        title: "PDV v4 pós-GA e copy do CSO M1",
        ship: "A v4.0.0 já está em operação desde 08/11/2026; agora é estabilização e a migração do banco da 3.2.x pelos clientes.",
        impact: "A linha 3.2.x sai de cena e a v4 passa a ser a única versão do PDV Java.",
        depends: "Acompanhamento pós-lançamento e suporte à migração; a copy do CSO M1 acompanha o freeze do Frotas.",
      },
      {
        tag: "Próximo marco",
        when: "29/01/2027",
        title: "Ink Agenda · Desktop 2.3.0",
        ship: "Atualização do Desktop com a Onda 1 da P1 (fundação multi-perfil, profissional e presença) na linha 2.x.",
        impact: "O Ink recebe a atualização planejada sem tirar dias do Hub nem do PDV.",
        depends: "Onda 1 fechada tecnicamente em 08/11/2026; faltam os prints e a homologação de release. A PWA segue fora, não antes de 2028.",
      },
      {
        tag: "Próxima entrega",
        when: "06/04/2027",
        title: "Hub · instalador Windows",
        ship: "Instalador com Tomcat embutido e SQLite local para pontos de retirada.",
        impact: "O Hub deixa de ser pré-release e ganha entrada comercial estável.",
        depends: "Aceite de QA independente, decisões abertas do dono (meta de subida, Defender e leitor físico) e a janela de cota dez/2026–06/04/2027.",
      },
      {
        tag: "Meta 2029",
        when: "30/12/2029",
        title: "Helianto Condominium",
        ship: "GA do Helianto — e, antes dele, o alvo conjunto de CSO Transportes + Virtual Tracker em 08/11/2028.",
        impact: "Abre a frente condominial sobre a mesma base de engenharia, sem reabrir o que já está publicado.",
        depends: "INT-03 fechar a capacidade do Transportes, prova móvel do VT e a cota de 2028–2029 sem on-demand.",
      },
    ],

    risks: [
      {
        kind: "Gargalo",
        title: "Uma cota, um produto pesado por ciclo",
        lead: "O envelope compra uma frente pesada por vez. Mês ocioso não acumula e mês cheio não empresta crédito ao seguinte.",
        effect: "Um atraso num ciclo passa direto para o próximo dono da fila; o Hub começa em dez/2026.",
        mitigation: "Ordem da fila explícita; trabalho leve (Tab, documentação, copy) fica fora da conta.",
      },
      {
        kind: "Dependência externa",
        title: "Aceite de QA do Hub",
        lead: "A rc1.7 foi reprovada na rodada 5, com N1 e N2 bloqueantes, e o aceite da rc1.10 segue pendente.",
        effect: "O GA de 06/04/2027 depende de aceite formal, não só de o pacote estar pronto.",
        mitigation: "Rodada de QA dedicada e correção dos bloqueantes antes de qualquer nova tag.",
      },
      {
        kind: "Decisão do dono",
        title: "Decisões abertas antes do GA do Hub",
        lead: "O mapa do GA ainda depende da meta de subida (C6, até 04/12/2026), da decisão sobre o Defender (T1, até 18/12/2026) e do teste com leitor físico (CT-06, até 15/01/2027).",
        effect: "Sem essas decisões, a data de 06/04/2027 não tem como ser provada.",
        mitigation: "Fechar cada decisão na data definida e registrar no gatekeeper do GA.",
      },
      {
        kind: "Patrocínio",
        title: "O envelope não cobre tudo o que foi pedido",
        lead: "US$ 20/mês até 2029 cobrem cinco marcos. Momento 2 do CSO, mês de Agent para o BioReator e PIX Split antes do Hub ficam fora.",
        effect: "Quem espera essas frentes espera por patrocínio extra, não por uma data.",
        mitigation: "Segunda cota ou on-demand pontual abre a frente sem reabrir o que já está publicado.",
      },
      {
        kind: "Cronograma",
        title: "Datas que dependem de capacidade não medida",
        lead: "O alvo conjunto de CSO Transportes + Virtual Tracker em 08/11/2028 depende do INT-03, que ainda não fechou o total de sprints.",
        effect: "Se a capacidade não fechar, a data de 2028 escorrega e leva a de 2029 junto.",
        mitigation: "Fechar INT-03 antes de comprometer prazo público.",
      },
      {
        kind: "Projetos críticos",
        title: "Dois produtos concentram o risco",
        lead: "Hub e CSO estão em amarelo; o PDV saiu do vermelho com o lançamento da v4.0.0 em 08/11/2026. Os outros dez projetos não têm pendência que trave entrega.",
        effect: "Nenhuma frente satélite compensa um atraso no Hub ou no Transportes.",
        mitigation: "Semáforo acima e a lista de pontos fora do ritmo logo abaixo, item por item.",
      },
    ],

    governance: [
      {
        term: "Como o percentual é calculado",
        text: "Cada produto vai de 0 a 100% do compromisso público declarado para dezembro de 2029. É uma estimativa interna revista na primeira leitura de cada mês: sobe quando existe entrega verificável e não sobe por lançamento que ainda não saiu. Não mede qualidade de código nem homologação técnica.",
      },
      {
        term: "Como os marcos são definidos",
        text: "Marco é uma data pública com três coisas presas a ela: entrega nomeada, impacto esperado e dependências. Nenhuma data desta página é garantia de lançamento: 06/04/2027 é a data do Hub e 08/11/2028 é o alvo do Transportes, sujeito aos gates INT.",
      },
      {
        term: "O que significa GA",
        text: "GA é lançamento estável (general availability): versão com aceite formal de qualidade e suporte assumido. O PDV v4.0.0 é o único núcleo em GA novo, lançado em 08/11/2026; o Hub segue em pré-release e o Transportes do CSO ainda não existe. O Frotas está em produção desde 06/10/2026.",
      },
      {
        term: "O que significa pré-release",
        text: "Build publicada para avaliação, com aceite ainda pendente — é o caso do Hub v2.1.0-rc1.10. Pode ser baixada e usada, mas não é o lançamento estável.",
      },
      {
        term: "O que significa piloto",
        text: "Piloto é produto utilizável com limite explícito e sem promessa de continuidade: o PDV Rust tem teto de 100 vendas na vida do piloto, e o Seed é piloto público sob MIT com homologação independente pendente.",
      },
      {
        term: "O que significa protótipo",
        text: "Protótipo é prova técnica ou demonstração, sem compromisso de suporte nem de prazo — o baseline 0.1.0-dev da Área 51 está nesse estágio. Protótipo não entra na fila da cota.",
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
      { when: "08/11/2026", item: "PDV v4.0.0 lançada; manutenção da 3.2.12 encerrada", spend: "Agent out–nov/2026" },
      { when: "06/04/2027", item: "Hub instalador Windows", spend: "Agent dez/2026–06/04/2027" },
      { when: "29/01/2027", item: "Ink Desktop 2.3.0 (atualização do produto atual)", spend: "5 dias/mês nov/2026–jan/2027; fev–abr voltam ao núcleo; cede ao Hub e ao PDV" },
      { when: "08/04–dez/2027", item: "Sem dono de Agent", spend: "FRO 24/24 já publicado em 06/10" },
      { when: "Alvo: 08/11/2028", item: "CSO Transportes + Virtual Tracker integrado", spend: "Jan–nov/2028; capacidade a validar em INT-03" },
      { when: "30/12/2029", item: "Helianto Condominium (GA)", spend: "Agent 2029" },
    ],
    queue: [
      { period: "set/2026", owner: "CSO COE (concluído)" },
      { period: "out–08/nov/2026", owner: "PDV v4.0.0 · GA em 08/11/2026" },
      { period: "09/nov–04/dez/2026", owner: "PDV v4 pós-GA + copy CSO M1" },
      { period: "dez/2026–06/04/2027", owner: "Hub · atualização Ink 2.3.0 até 29/01/2027 (5 dias/mês)" },
      { period: "08/04–dez/2027", owner: "Sem dono · FRO já publicado" },
      { period: "2028", owner: "CSO Transportes + integração VT, sujeito aos gates INT" },
      { period: "dez/2028", owner: "Buffer Transportes" },
      { period: "2029", owner: "Helianto" },
    ],
    notInEnvelope: [
      "Reabrir o FRO (já publicado em 06/10/2026)",
      "Ink PWA com Agent antes de 2028 (linha 3.0 em Tab até folga do núcleo)",
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
      note: "A PDV v4.0.0 foi lançada em 08/11/2026, com a release publicada em 06/11/2026 e o pacote assinado por duas chaves Ed25519; a 3.2.12-free passa a versão anterior, com a manutenção encerrada na mesma data e os pacotes ainda disponíveis. As v4.0.0-rc6 e v4.0.0-rc5 ficam no histórico. O Hub publicou a pré-release v2.1.0-rc1.10 em 07/11. O freeze M1 do CSO não tem registro de fechamento. BioReator Community 1.1.1 publicada em 13/10 na torre 10, percentual em 12%. Premium em 18/06/2027.",
    },
    {
      id: "y2027",
      label: "2027",
      subtitle: "Hub",
      pct: 14,
      note: "Hub: pré-release Windows v2.1.0-rc1.10 publicada em 07/11/2026; aceite de QA pendente. Ink Desktop 2.3.0 planejado para 29/01/2027; a fatia de 5 dias/mês devolve fev–abr ao núcleo. GA do instalador do Hub em 06/04. A janela 08/04–dez não reabre o FRO. Ink PWA = Tab, não antes de 2028.",
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
      state: "ok",
      tone: "pdv",
      shop: "https://pdv.caracore.com.br/",
      hundred: "Migração do banco da 3.2.x e suporte à linha v4 até dez/2029. A v4.0.0 está em operação desde 08/11/2026.",
      now: "v4.0.0 em operação desde 08/11/2026, com migração do banco da 3.2.x no primeiro acesso e SHA-256 publicado; a 3.2.12-free é a versão anterior, com os pacotes ainda disponíveis. Sem PIX integrado nem NF-e/NFC-e no Free.",
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
      now: "Pré-release Windows v2.1.0-rc1.10 publicada em 07/11/2026, ZIP portátil, sem assinatura; aceite de QA pendente. GA 06/04/2027. Mac e Linux fora desta tag.",
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
      core: true,
      state: "ok",
      tone: "ink",
      shop: "https://ink.caracore.com.br/",
      hundred: "Desktop 2.3.0 planejado para 29/01/2027. PWA em roadmap, não antes de 2028.",
      now: "Desktop v2.2.1 publicado em 04/11/2026 para Windows e Linux, com três perfis, equipe com papéis e mensagem por WhatsApp ou Telegram. A Onda 1 do 2.3.0 fechou tecnicamente em 08/11/2026; faltam os prints e a homologação de release. PWA em roadmap, não antes de 2028, sem Agent até folga do núcleo.",
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
    {
      id: "rebeldia-mecatronica",
      n: 12,
      name: "A Rebeldia da Mecatrônica",
      core: false,
      state: "ok",
      tone: "circuito",
      shop: "https://eng.caracore.com.br/",
      hundred: "Livro publicado (13 capítulos + 3 apêndices, PDF aberto) e app Universo Rebeldia em piloto.",
      now: "Livro publicado, leitura online e PDF abertos; app de estudo em piloto. Preço a definir, sem checkout. Não consome a cota de Agent.",
      history: [{ m: "2026-10", p: 92 }],
    },
  ],
};
