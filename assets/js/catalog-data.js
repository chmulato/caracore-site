/**
 * Cara Core Informática — catálogo canônico do ecossistema.
 *
 * Fonte única para nome público, categoria, estágio de maturidade, edição
 * gratuita, oferta paga, preço e loja de cada produto apresentado na matriz
 * (portfolio.html e ecosistema.html). Os planos de desenvolvimento de sites
 * não entram aqui: vivem em sites.html.
 *
 * Regras de manutenção:
 * - Não criar nome alternativo aqui: o nome deste arquivo é o nome da matriz.
 * - Estágio não é preço. "Free" e "Community" são edições; "Gratuito" é preço.
 * - Preço só entra quando está publicado na loja do produto. Sem publicação,
 *   usar "a definir", "sob proposta" ou "conferir na loja" — nunca estimar.
 * - Versões, datas, limites e ressalvas devem espelhar o AGENTS.md da matriz.
 * - Este arquivo é consumido por assets/js/catalog.js (tabela e legenda).
 */
(function (global) {
  'use strict';

  var CATALOGO = {
    atualizadoEm: '27/10/2026',

    /**
     * Quatro estágios canônicos. Toda página da matriz usa estes rótulos.
     */
    estagios: [
      {
        id: 'disponivel',
        rotulo: 'Disponível',
        descricao: 'Release pública estável, com download ou acesso ativo na loja do produto.'
      },
      {
        id: 'beta',
        rotulo: 'Beta (RC)',
        descricao: 'Pré-release pública em ciclo de RC. GA só depois dos gates e aceites formais, sem data presumida.'
      },
      {
        id: 'piloto',
        rotulo: 'Piloto',
        descricao: 'Edição piloto pública, com limite declarado e homologação parcial. Não é GA.'
      },
      {
        id: 'desenvolvimento',
        rotulo: 'Em desenvolvimento',
        descricao: 'Em construção ou na Garagem. Sem contratação antecipada, sem instalador publicado.'
      }
    ],

    /**
     * Categorias comerciais. Núcleo = PDV, CSO e Hub (produtos principais);
     * os demais são complementos do ecossistema.
     */
    categorias: [
      { id: 'nucleo', rotulo: 'Núcleo', descricao: 'PDV, CSO e Hub — os produtos principais.' },
      { id: 'satelite', rotulo: 'Satélite', descricao: 'Verticais próprias que complementam o núcleo.' },
      { id: 'educacao', rotulo: 'Educação', descricao: 'Formação, estudo e critério técnico.' },
      { id: 'institucional', rotulo: 'Institucional', descricao: 'Identidade, licenciamento e ferramentas internas.' },
      { id: 'garagem', rotulo: 'Garagem', descricao: 'Lançamento futuro, sem venda antecipada.' }
    ],

    produtos: [
      {
        id: 'pdv-java',
        nome: 'CaraCore PDV Java',
        categoria: 'nucleo',
        estagio: 'disponivel',
        versao: 'v3.2.12-free · v4.0.0-rc6',
        detalhe: 'Free é a estável/Latest; a v4 segue em ciclo de RCs, sem GA presumido.',
        free: 'Até 100 vendas/mês, 100 produtos, 1 operador, 4 vendedores e 1 loja.',
        pago: 'Premium: sem teto de vendas, produtos e operadores.',
        preco: 'R$ 79,90/mês',
        pagamento: 'Contratação pela loja; Premium sob demonstração.',
        loja: 'pdv.caracore.com.br',
        url: 'https://pdv.caracore.com.br/',
        portfolio: 'portfolio.html#caracore-pdv',
        nota: 'Aplicação web local (localhost:8080/login). Não inclui PIX integrado nem NF-e/NFC-e no plano Free.'
      },
      {
        id: 'pdv-rust',
        nome: 'CaraCore PDV Rust (piloto)',
        categoria: 'nucleo',
        estagio: 'piloto',
        versao: 'v0.1.4',
        detalhe: 'Piloto Windows; linha independente da Java, nenhuma substitui a outra.',
        free: 'Piloto gratuito com teto de 100 vendas na vida do banco.',
        pago: 'Sem edição paga publicada.',
        preco: 'R$ 0 (piloto)',
        pagamento: 'Sem checkout; download no GitHub Releases.',
        loja: 'pdv-rust.caracore.com.br',
        url: 'https://pdv-rust.caracore.com.br/',
        portfolio: 'portfolio.html#caracore-pdv-rust',
        nota: 'Rust + Tauri 2 + React. Não é migração forçada nem substituto do PDV Java.'
      },
      {
        id: 'cso',
        nome: 'CaraCore CSO',
        categoria: 'nucleo',
        estagio: 'disponivel',
        versao: 'Frotas em produção',
        detalhe: 'Frotas no ar desde 06/10/2026; Transportes + Virtual Tracker em desenvolvimento (alvo 08/11/2028).',
        free: 'Frotas: grátis até 3 veículos, sem cartão no cadastro.',
        pago: 'Frotas: planos P5, P10 e Corporate por limite de veículos. Transportes não é vendido.',
        preco: 'R$ 5,00 · R$ 10,00 · R$ 49,00/mês',
        pagamento: 'Checkout na loja (Pix no Brasil); o plano é liberado depois da conferência do comprovante.',
        loja: 'cso-transp.caracore.com.br',
        url: 'https://cso-transp.caracore.com.br/',
        portfolio: 'portfolio.html#caracore-cso',
        nota: 'Duas aplicações, uma solução. Sem GPS hoje; gestão e acompanhamento exigem conexão.'
      },
      {
        id: 'hub',
        nome: 'CaraCore Hub',
        categoria: 'nucleo',
        estagio: 'beta',
        versao: 'v2.1.0-rc1.7',
        detalhe: 'Pré-release Windows (instalador e ZIP, unsigned) para avaliação; aceite de QA pendente. GA em 06/04/2027.',
        free: 'Pré-release Windows para avaliação.',
        pago: 'Edição comercial prevista para o GA.',
        preco: 'a definir',
        pagamento: 'Sem checkout público nesta etapa.',
        loja: 'hub.caracore.com.br',
        url: 'https://hub.caracore.com.br/',
        portfolio: 'portfolio.html#caracore-hub',
        nota: 'Encomendas de Mercado Livre, Shopee e Temu. Amazon e B2W não são canais operacionais.'
      },
      {
        id: 'ink',
        nome: 'CaraCore Ink Agenda',
        categoria: 'satelite',
        estagio: 'disponivel',
        versao: 'v2.0.1',
        detalhe: 'Desktop Windows desde 07/10/2026; PWA em roadmap, não antes de 2028.',
        free: 'Sem edição gratuita publicada.',
        pago: 'Licença do Desktop v2.0.x.',
        preco: 'conferir na loja',
        pagamento: 'Condições e preço na loja do produto.',
        loja: 'ink.caracore.com.br',
        url: 'https://ink.caracore.com.br/',
        portfolio: 'portfolio.html#caracore-ink-agenda',
        nota: 'Agenda e financeiro offline-first para estúdios. Sem instalador nativo macOS/Linux.'
      },
      {
        id: 'minerador',
        nome: 'Minerador 4.0',
        categoria: 'satelite',
        estagio: 'disponivel',
        versao: 'v1.2.3',
        detalhe: 'Canal público Ouro 4.0.',
        free: 'Edição Free.',
        pago: 'Módulo mineração Premium.',
        preco: 'R$ 29,90 (módulo Premium)',
        pagamento: 'Compra na loja do produto.',
        loja: 'ete.caracore.com.br',
        url: 'https://ete.caracore.com.br/',
        portfolio: 'portfolio.html#minerador-ete',
        nota: '"ETE" é o domínio de aplicação (efluentes), não outro produto. O nome público é Minerador 4.0.'
      },
      {
        id: 'bioreator',
        nome: 'BioReator 4.0',
        categoria: 'satelite',
        estagio: 'disponivel',
        versao: 'Community 1.1.1',
        detalhe: 'Community publicada em 13/10/2026; Premium prevista para 18/06/2027.',
        free: 'Community 1.1.1 (MSI e ZIP Windows x64).',
        pago: 'Premium: catálogo, batelada alimentada, custos e PDF.',
        preco: 'a definir',
        pagamento: 'Sem PIX nesta etapa; Premium sem preço publicado.',
        loja: 'ru.caracore.com.br',
        url: 'https://ru.caracore.com.br/bioreator.html',
        portfolio: 'portfolio.html#bioreator40',
        nota: 'Produto da oficina do RU; a loja do RU hospeda a vitrine. Parâmetros são simulações.'
      },
      {
        id: 'reino',
        nome: 'Reino OIDC',
        categoria: 'educacao',
        estagio: 'disponivel',
        versao: 'v2.0.2-free',
        detalhe: 'Três Eras gratuitas para estudo pessoal.',
        free: 'Currículo completo das três Eras.',
        pago: 'Edição paga em desenvolvimento.',
        preco: 'a definir',
        pagamento: 'Sem PIX nesta etapa.',
        loja: 'oidc.caracore.com.br',
        url: 'https://oidc.caracore.com.br/',
        portfolio: 'portfolio.html#reino-oidc',
        nota: 'Produto educativo de estudo. A oferta institucional de identidade é a Área 51.'
      },
      {
        id: 'circuito',
        nome: 'Circuito Ferradura',
        categoria: 'educacao',
        estagio: 'disponivel',
        versao: 'v2.0.24',
        detalhe: 'Curso e demo de console; Windows, macOS e HTML.',
        free: 'Gratuito para pessoa física (estudo).',
        pago: 'Escolas: R$ 5 por aluno/mês.',
        preco: 'R$ 5/aluno/mês',
        pagamento: 'Contratação escolar na loja do produto.',
        loja: 'circuito.caracore.com.br',
        url: 'https://circuito.caracore.com.br/',
        portfolio: 'portfolio.html#circuito-python',
        nota: 'Executável apenas Windows, sem assinatura digital.'
      },
      {
        id: 'area51',
        nome: 'Área 51',
        categoria: 'institucional',
        estagio: 'disponivel',
        versao: 'baseline 0.1.0-dev',
        detalhe: 'Identidade e acesso institucional: pacote licenciado, implantação assistida e suporte.',
        free: 'Sem edição gratuita publicada.',
        pago: 'Níveis 1 a 3 (licença, implantação e suporte institucional).',
        preco: 'sob proposta',
        pagamento: 'Contratação institucional.',
        loja: 'area51.caracore.com.br',
        url: 'https://area51.caracore.com.br/',
        portfolio: 'portfolio.html#area-51',
        nota: 'Não confundir com a área restrita do site (secure/), também chamada Área 51 no menu.'
      },
      {
        id: 'seed',
        nome: 'Cara Core Seed',
        categoria: 'institucional',
        estagio: 'piloto',
        versao: '0.1.5 (candidata)',
        detalhe: 'Piloto público Windows x64 sob MIT; homologação independente pendente.',
        free: 'Gratuito, sem exigir licença do próprio Seed.',
        pago: 'Sem edição paga.',
        preco: 'R$ 0',
        pagamento: 'Sem checkout.',
        loja: 'seed.caracore.com.br',
        url: 'https://seed.caracore.com.br/',
        portfolio: 'portfolio.html#caracore-seed',
        nota: 'Gestão local de clientes e licenças. Cada produto mantém o próprio banco.'
      },
      {
        id: 'mkt',
        nome: 'Cara Core MKT / Sala',
        categoria: 'institucional',
        estagio: 'disponivel',
        versao: 'Vitrine e Sala ativas',
        detalhe: 'Ferramenta interna e vitrine gratuita.',
        free: 'Vitrine e Sala Cara Core abertas.',
        pago: 'Não vendido.',
        preco: 'não vendido',
        pagamento: '—',
        loja: 'mkt.caracore.com.br',
        url: 'https://mkt.caracore.com.br/',
        portfolio: 'portfolio.html#caracore-mkt',
        nota: 'Ferramenta interna; a Sala fica em tools.caracore.com.br/sala/.'
      },
      {
        id: 'helianto',
        nome: 'Helianto Condominium',
        categoria: 'garagem',
        estagio: 'desenvolvimento',
        versao: 'GA 30/12/2029',
        detalhe: 'Vitrine no ar; sem instalador e sem contratação antecipada.',
        free: '—',
        pago: 'SaaS condominial previsto para o GA.',
        preco: 'a definir',
        pagamento: 'Sem venda antecipada.',
        loja: 'helianto.caracore.com.br',
        url: 'https://helianto.caracore.com.br/',
        portfolio: 'portfolio.html#caracore-helianto',
        nota: 'Java 25 + Spring Boot + React, multi-tenant. Data de lançamento, não de disponibilidade.'
      }
    ],

    /**
     * Regras de nomenclatura e desambiguação exibidas junto do catálogo.
     */
    notas: [
      'Marca: "Cara Core Informática" nomeia a empresa; "CaraCore" é prefixo de produto (CaraCore PDV, CaraCore Hub, CaraCore CSO, CaraCore Seed), como nos instaladores e nas lojas.',
      'Duas linhas PDV, dois nomes: "CaraCore PDV Java" (web local, estável) e "CaraCore PDV Rust (piloto)" (desktop). Nenhuma substitui a outra.',
      'Produto educacional e oferta institucional: "Reino OIDC" ensina identidade e login; "Área 51" licencia identidade e acesso institucional.',
      '"Área 51" do catálogo é o produto em area51.caracore.com.br; a área restrita do site (secure/) é outro destino.',
      '"Minerador 4.0" é o único nome público; "ETE" descreve o domínio de aplicação e não é um segundo produto.',
      'Estágio não é preço: "Free" e "Community" são edições; "Piloto" e "Beta (RC)" são estágios; "Gratuito" é preço.',
      'Planos de desenvolvimento de sites são serviço de engenharia, fora deste catálogo: consulte a página Sites da matriz.'
    ]
  };

  global.CARACORE_CATALOG = CATALOGO;
})(window);

