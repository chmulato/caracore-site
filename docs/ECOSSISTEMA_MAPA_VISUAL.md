# Mapa visual do ecossistema — Cara Core Informática

Recomendações de **mapeamento visual** para o site da matriz representar o ecossistema da empresa.

---

## 1. Qual tipo de mapeamento fica mais visual?

### Recomendação principal: **Diagrama em camadas (flowchart)**

- **O que é:** Uma única figura com 2–3 faixas horizontais (camadas):
  - **Camada 1 — Site matriz:** caracore.com.br (portfólio, delivery, wiki).
  - **Camada 2 — Produtos:** PDV, Minerador 4.0, Reino OIDC, Circuito Python, Hub, Área 51, Seed.
  - **Camada 3 — Lojas online:** cada vitrine/releases (GitHub Pages).
- **Conexões:** Linhas ou setas ligando cada produto à sua pasta **delivery/** (matriz) e à sua **loja** (-releases).
- **Vantagem:** Fica imediato “onde está o quê” e “matriz ↔ loja” por produto. Alinha com ECOSYSTEM_LOJAS.txt e ECOSYSTEM_CARA_CORE.txt.

### Alternativas igualmente visuais

| Tipo | Descrição | Melhor para |
|------|-----------|-------------|
| **Grafo radial** | Cara Core no centro; ramos para cada produto; de cada produto, ramos “Matriz” e “Loja”. | Quem prefere “hub no centro” e relações em estrela. |
| **Matriz 2D (grid)** | Eixos, por ex.: “Tipo” (Windows Desktop / Identidade / Serviço) × “Oferta” (ativa / referência). Cada produto é um bloco. | Classificar produtos por tipo e oferta. |
| **Tabela visual (quadro de referência)** | Linhas = produtos; colunas = Matriz \| Loja \| Download. Células com ícone + link. | Escaneabilidade rápida e links diretos. |

Para o **site da matriz**, o **flowchart em camadas** tende a ser o mais claro: um só diagrama mostra “ecossistema” sem precisar de texto longo.

---

## 2. Onde colocar no site

- **Opção A:** Seção **“Ecossistema”** no topo do portfólio (portfolio.html), logo abaixo do lead, com o diagrama Mermaid e um parágrafo: “Cada produto tem apresentação completa na matriz e vitrine/loja em GitHub Pages.”
- **Opção B:** Página dedicada **ecossistema.html** (ou wiki/ecossistema.html) com o diagrama, tabela Matriz ↔ Loja e link “Ver portfólio”.
- **Opção C:** Wiki “Visão geral dos projetos” (projetos-overview.html) — adicionar o diagrama na seção “Como os Projetos se Integram”.

---

## 3. Implementação sugerida

- Usar **Mermaid** (já usado no portfólio para Reino OIDC e Seed) para o flowchart em camadas.
- O diagrama pode ser **estático** (só visual) ou **clicável** (links nos nós para delivery/ e lojas), dependendo de como o Mermaid for configurado (tooltips/links em alguns temas).
- Cores ou estilos por tipo: por exemplo, “entrega ativa” vs “referência (Seed)”; ou “Windows Desktop” vs “Serviço (Área 51)”.

O arquivo **assets/images/portfolio/ecossistema-cara-core.mmd** contém o diagrama em Mermaid pronto para incorporar na página escolhida (portfolio, ecossistema ou wiki).
