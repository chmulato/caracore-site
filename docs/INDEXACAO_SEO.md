# Indexação: host canônico, sitemaps e robots

Estado de **09/11/2026**. Complementa `GOOGLE_ANALYTICS.md`: ali está a medição, aqui está
como o Google descobre e escolhe a URL de cada página. Os sete sitemaps foram enviados no
Search Console em 09/11/2026 e o Google os processou com as contagens esperadas (§2). O que cada
página declara sobre si em JSON-LD está em §"Dados estruturados".

## Host canônico é o apex

`https://www.caracore.com.br/…` responde **301** para `https://caracore.com.br/…` (medido em
09/11/2026, na home e em página interna). Todo metadado que declara a URL de si mesmo passou a
citar o apex:

| Metadado | Onde |
|---|---|
| `rel="canonical"`, `og:url`, `og:image`, `twitter:image`, JSON-LD (`url`, `@id`, `logo`) | 21 páginas da matriz |
| JSON-LD (`@id`, `url`) | `download.html` e `index.html` da central |
| Redirecionamento e canonical dos espelhos | 2 páginas da wiki |
| `Sitemap:` no `robots.txt` | matriz (e os seis `robots.txt` novos) |

Motivo: canonical que aponta para uma URL que redireciona faz o buscador tratar a página como
duplicata de uma terceira URL e dividir os sinais entre as duas. Três páginas da matriz que
não tinham canonical ganharam o seu (`area51/wiki/`, `politica/politica-privacidade.html`,
`politica/termos-servico.html`). Os dois espelhos da wiki que redirecionam para a matriz
(`politica/politica-privacidade.html` e `portfolio.html`) deixaram de apontar para `www`.

## Regra do sitemap

Cada host tem o seu `sitemap.xml`, gerado a partir dos arquivos rastreados no git:

1. só entra URL **do próprio host** — entrada de outro domínio é ignorada pelo buscador (o
   `sitemap.xml` antigo da matriz listava wiki, blog pessoal e retrô);
2. fica fora página que redireciona (`meta refresh`), que tem `noindex` ou cujo canonical
   aponta para outro host;
3. `lastmod` é a data do último commit que tocou o arquivo — não a data da geração;
4. `changefreq` e `priority` existentes foram preservados; onde não havia, a raiz recebe
   `weekly`/`1.0`, o primeiro nível `monthly`/`0.9` e o resto `monthly`/`0.7`. O Google ignora
   os dois campos: eles ficam como documentação da intenção.

## Inventário

| Superfície | Arquivo publicado | URLs | Fora, por motivo |
|---|---|---|---|
| Matriz `caracore.com.br` | `sitemap.xml` (raiz do repo) | 10 | 40 stubs de `/delivery/`, 19 de `secure/`, 15 de `aligned/` (bloqueado no robots), 8 de `publications/`, 5 de `cv/` (noindex), 2 de `handbook/` (bloqueado), 1 de `folders/` (noindex), 1 `404.html` |
| Wiki `wiki.caracore.com.br` | `docs/sitemap.xml` | 51 | 12 redirecionamentos (espelhos de loja e trilhas) |
| Central `download.caracore.com.br` | `docs/sitemap.xml` | 4 | — |
| PDV `pdv.caracore.com.br` | `docs/sitemap.xml` | 24 | 32 stubs de wiki/release antiga |
| Hub `hub.caracore.com.br` | `docs/sitemap.xml` | 5 | 2 espelhos de wiki |
| Ink `ink.caracore.com.br` | `docs/sitemap.xml` | 15 | 2 espelhos de wiki |
| CSO `cso-transp.caracore.com.br` | `docs/sitemap.xml` | 5 | 4 redirecionamentos (`download`, `feedback/`, espelhos de wiki) |

Total: **114 URLs**. Os `robots.txt` da wiki, da central e das quatro lojas são novos e só
declaram `Allow: /` mais a linha `Sitemap:`; o da matriz continua bloqueando `secure/`,
`wiki/`, `handbook/`, `folders/`, `aligned/`, `cv/`, `personal/`, `sala/`, `pdf/` e
`publications/`, com a exceção `Allow: /publications/livros/` para a listagem dos livros.

## Verificação de 09/11/2026

- Os sete arquivos são XML válido, sem URL duplicada e com todas as entradas resolvendo em
  **200 sem redirecionamento** no site publicado (114 de 114 conferidas por `curl`).
- Toda entrada corresponde a um arquivo rastreado no repositório daquele host.
- `scripts/tests/cdn-assets.test.cjs` passou a exigir o canonical e o `og:image` no apex.

## Dados estruturados

O JSON-LD diz ao Google o que a página **é** — empresa, produto, versão e preço — em vez de
deixar o buscador só interpretar o texto. Inventário em 09/11/2026: **as 114 URLs dos sete
sitemaps têm bloco**, somando 116 páginas e 117 blocos.

| Superfície | Com JSON-LD | Tipos declarados |
|---|---|---|
| Matriz | 12 de 101 (10 do sitemap + `aligned/en/`, `aligned/it/`) | `Organization`, `WebPage`, `CollectionPage`, `ContactPage`, `Book` |
| Central | 4 de 4 | `Organization` (com `@id` e `taxID`), `ItemList` de 14 produtos, `WebPage`, `CollectionPage` |
| Wiki | 51 de 63 (as outras 12 são redirect ou `noindex`) | `WebSite`, `WebPage`, `CollectionPage` |
| PDV | 24 de 56 | `SoftwareApplication`, `WebPage`, `CollectionPage`, `ContactPage` |
| Hub | 5 de 7 | `SoftwareApplication`, `WebPage`, `ContactPage` |
| Ink | 15 de 17 | `SoftwareApplication`, `WebPage`, `CollectionPage`, `ContactPage` |
| CSO | 5 de 9 | `SoftwareApplication`, `WebPage`, `ContactPage` |

Ficam sem bloco, de propósito, as páginas que não estão em sitemap nenhum: `/delivery/` (stubs),
`secure/`, `handbook/`, `cv/`, `personal/`, `sala/`, os livros com `noindex` e os redirects da
wiki. As duas homes de `aligned/` já tinham bloco e continuam bloqueadas no `robots.txt` — não
entram no índice, e ali o dado só serve se alguém abrir a página por fora do buscador.

### `SoftwareApplication` nas quatro lojas do núcleo

Aplicado em 09/11/2026 nas oito páginas do núcleo:

| Loja | Páginas | `softwareVersion` | `datePublished` | Ofertas |
|---|---|---|---|---|
| PDV | `index.html`, `download.html` | 4.0.0 | 2026-11-08 | Free 0 · Pro 79.90/mês |
| Hub | `index.html`, `download.html` | 2.1.0-rc1.10 | 2026-11-07 | Free (Starter) 0 · Pro 79.90/mês |
| Ink | `index.html`, `download.html` | 2.2.1 | 2026-11-04 | Assinatura 79.90/mês |
| CSO | `index.html`, `disponibilidade.html` | não declarada | não declarada | Grátis 0 · 5.00 · 10.00 · 49.00 por mês |

Cada bloco também declara `name`, `url` (a própria página), `description`,
`applicationCategory` `BusinessApplication`, `operatingSystem`, `inLanguage` e `publisher` (a
`Organization` da Cara Core). As ofertas cobradas por mês levam `priceSpecification`
`UnitPriceSpecification` com `billingDuration` `P1M`; a CSO acrescenta `browserRequirements`
porque a Frotas exige conexão e não tem fila offline.

Decisões que valem registro:

- **Sem `aggregateRating` nem `review`.** Nenhuma loja tem avaliação publicada, e nota inventada
  é justamente o dado que rende ação manual por dados estruturados. Sem nota o resultado
  enriquecido de aplicativo não aparece, mas o bloco continua válido e descreve o produto.
- **CSO sem versão e sem data.** A loja não publica número de versão nem data de lançamento da
  Frotas; o campo ficou fora em vez de preenchido por dedução.
- **CSO: markup na `disponibilidade.html`, não na `download.html`.** A `download.html` da CSO é um
  stub com `noindex` que redireciona para `disponibilidade.html`; dado estruturado ali não seria
  lido.
- **Preço e CTA copiados da própria página.** Cada `Offer.price` bate com o cartão visível, e cada
  `Offer.url` é o botão que aquela página usa no plano (checkout da CSO, WhatsApp do Hub,
  `canal-feedback.html` do PDV e do Ink). Dado estruturado que diverge do texto visível é
  violação de diretriz.
- **Transportes e Virtual Tracker não entram como oferta.** Estão em desenvolvimento, com alvo
  08/11/2028 e sem preço definido.

### Páginas secundárias do sitemap

Em 09/11/2026 as 49 páginas que estavam no sitemap sem bloco receberam um nó de página: **37
`WebPage`**, **6 `CollectionPage`** (portfólio, biblioteca de livros, mapa do ecossistema,
`area51/wiki` e as duas listas de versões) e **6 `ContactPage`** (os quatro `canal-feedback.html`,
`consultoria.html` e `suporte-local.html`). Com isso o sitemap passou a ter cobertura total.

Cada bloco declara `@id` `<canonical>#webpage`, `url` igual ao canonical da própria página, `name`
igual ao `<title>`, `description` copiada da meta description (omitida nas duas páginas que não
têm uma: `slides/apresentacao_tia_socia.html` e `tecnologia.html` do Ink), `inLanguage`,
`isPartOf` para `https://<host>/#website` e `publisher` com o `@id`
`https://caracore.com.br/#organization`. Nenhuma delas declara preço, versão ou data — essas
páginas não publicam isso, e preencher por dedução seria inventar.

### Validação

Um validador próprio, executado fora dos repositórios e ainda não versionado, varreu as 257
páginas HTML das sete superfícies e checou: `JSON.parse`, `@context` com schema.org, `@type`
presente, `@id` absoluto, `@id` repetido na mesma página e entre páginas, referência a `@id` que
não existe em nenhuma superfície, `@id#webpage` derivando do canonical, `url` do nó de página
igual ao canonical, campos de `SoftwareApplication` e `Offer` (preço numérico, moeda ISO 4217,
`billingDuration` ISO-8601), contagem de `ListItem` e presença de nota ou avaliação. Resultado:
**0 erros e 0 avisos**; os únicos informativos são as páginas bloqueadas e o `ecosistema.html`.

O script foi testado antes contra um repositório-semente com defeitos plantados — JSON inválido,
vírgula sobrando, `url` relativa, moeda `real`, preço `79,90`, `@id` repetido, `@id` fora do
canonical e página sem canonical — e acusou todos.

Continua **sem teste automatizado versionado** para JSON-LD: o `cdn-assets.test.cjs` cobre
canonical e `og:image`, não dados estruturados.

### Divergências encontradas, não corrigidas

- `artifacts/instalacao-macos.html` e `mirror-delivery.html` estão no sitemap do Ink e declaram
  `noindex` — o sitemap pede indexação e a página recusa. Hoje o Google descarta as duas; ou saem
  do sitemap, ou perdem o `noindex`.
- As duas homes de `aligned/` declaram JSON-LD e estão bloqueadas no `robots.txt`.
- `ecosistema.html` tem dois blocos JSON-LD em vez de um.

### Conferência depois da publicação

O Rich Results Test só valida por URL pública, então a prova final vem depois do deploy:

1. <https://search.google.com/test/rich-results> com `https://pdv.caracore.com.br/`,
   `https://hub.caracore.com.br/download.html` e `https://cso-transp.caracore.com.br/` — os três
   devem acusar `SoftwareApplication` válido, sem campo obrigatório faltando.
2. Search Console → Inspeção de URL → **Testar URL ativa** → seção **Dados estruturados**: é o
   que o Google extraiu da página ao vivo, útil quando a dúvida é qual entidade ele escolheu.
3. "Nenhum resultado enriquecido detectado" com itens válidos é o esperado nas lojas sem nota —
   não é erro e não se resolve inventando avaliação.

## Passo a passo no Search Console (só o dono)

Só o dono entra no portal do Google. O resto — arquivos, URLs, canonical — já está publicado.

### 0. Pré-requisito

Os sete sitemaps estão no ar desde 09/11/2026, respondendo **200** e sem redirecionamento. Se
algum dia o envio falhar com "não foi possível buscar", confira antes no navegador:
`https://<host>/sitemap.xml` precisa abrir o XML, não uma página de erro.

### 1. Abrir a propriedade certa

1. Entre em <https://search.google.com/search-console> com a conta que já verifica o domínio.
2. No seletor do canto **superior esquerdo**, escolha `caracore.com.br` — aparece como
   `sc-domain:caracore.com.br`. É a **propriedade de domínio**, verificada por TXT no DNS.
3. Essa propriedade cobre **todos os subdomínios**. Não crie propriedade nova por host. Se na
   lista aparecer também uma de prefixo de URL (`https://www.caracore.com.br/`), ignore: ela é
   o resto da verificação antiga por meta tag e não enxerga wiki, central nem lojas.
4. Se a propriedade de domínio não estiver na lista: **Adicionar propriedade → Domínio**, digite
   `caracore.com.br`, copie o registro TXT que o Google mostrar, crie no DNS e volte para
   **Verificar**. A propagação costuma levar minutos, mas pode levar horas.

### 2. Enviar os sete sitemaps

1. No menu lateral, abra **Indexação → Sitemaps**.
2. No campo **Adicionar um novo sitemap**, cole a URL completa do host (ex.:
   `https://wiki.caracore.com.br/sitemap.xml`). Se o campo já exibir `caracore.com.br/` à
   esquerda, digite só `sitemap.xml` para a matriz e a URL completa para os subdomínios.
3. Clique em **Enviar**. Repita para os sete, um por vez.

| Host | Sitemap a enviar | URLs |
|---|---|---|
| Matriz | `https://caracore.com.br/sitemap.xml` | 10 |
| Wiki | `https://wiki.caracore.com.br/sitemap.xml` | 51 |
| Central | `https://download.caracore.com.br/sitemap.xml` | 4 |
| PDV | `https://pdv.caracore.com.br/sitemap.xml` | 24 |
| Hub | `https://hub.caracore.com.br/sitemap.xml` | 5 |
| Ink | `https://ink.caracore.com.br/sitemap.xml` | 15 |
| CSO | `https://cso-transp.caracore.com.br/sitemap.xml` | 5 |

Não é preciso reenviar a cada deploy: o Google relê o mesmo endereço e usa o `lastmod` de cada
URL para decidir o que buscar de novo.

#### Resultado do envio de 09/11/2026

Os sete foram enviados na mesma sessão e, minutos depois, todos apareciam como **Processado**
com a contagem de páginas igual à do inventário local:

| Host | Enviado | Status | Páginas encontradas |
|---|---|---|---|
| Matriz | 09/11/2026 | Processado | 10 |
| Wiki | 09/11/2026 | Processado | 51 |
| Central | 09/11/2026 | Processado | 4 |
| PDV | 09/11/2026 | Processado | 24 |
| Hub | 09/11/2026 | Processado | 5 |
| Ink | 09/11/2026 | Processado | 15 |
| CSO | 09/11/2026 | Processado | 5 |

Soma 114, o mesmo total da verificação por `curl`. Três dos sete (matriz, PDV e Ink) exibiram
**"Não foi possível buscar"** na linha recém-criada e viraram **Processado** na leitura
seguinte — a primeira tentativa do Google corre antes de o resultado ser gravado, então esse
estado isolado nas primeiras horas não é falha: só vale a pena reenviar se persistir depois de
um dia.

### 3. Ler a coluna de status

| Status | O que significa | O que fazer |
|---|---|---|
| **Em processamento** | o Google ainda está lendo o arquivo | esperar; normal nas primeiras horas |
| **Processado** | arquivo lido; a contagem sai em "Páginas encontradas" | nada, é o estado final |
| **Não foi possível buscar** | a leitura não foi gravada | recarregar a página; se persistir mais de um dia, abrir a URL no navegador e clicar em **Enviar** de novo |
| **Sitemap com erros** | o arquivo foi lido e alguma URL foi recusada | abrir o detalhe; erro comum é URL que redireciona ou de outro host |
| **Tipo desconhecido** | formato não reconhecido | conferir se a URL é a do `.xml` e não a de uma pasta |

"Processado" costuma levar de minutos a algumas horas. Reenviar não acelera e não atrapalha.

### 4. Conferir a indexação de fato

1. **Indexação → Páginas**: acompanha quantas URLs do sitemap já estão em "Indexada". Isso leva
   dias e não depende de novo envio.
2. **Inspeção de URL** (barra superior, por URL): cole o endereço e veja se aparece
   "O URL está no Google" e **qual canonical o Google escolheu**. Use em três páginas de
   controle: `https://caracore.com.br/`, `https://caracore.com.br/ecosistema.html` e
   `https://pdv.caracore.com.br/download.html`.
3. **Solicitar indexação** acelera a primeira visita a uma página específica (cota de poucas
   por dia). Vale para a home e as páginas comerciais; não faz sentido para as 114.
4. **Inspeção de `https://www.caracore.com.br/`** deve devolver "Página com redirecionamento"
   para o apex — é o comportamento correto desde 09/11/2026.

### 5. Acompanhar a virada de www para o apex

- **Desempenho → filtro "Página"** passa a mostrar o apex; URLs `www` que ainda aparecerem são
  histórico e migram sozinhas em algumas semanas.
- **Indexação → Páginas** deve encolher a categoria "Página com redirecionamento" e crescer
  "Indexada" para o apex. Não mexa em nada enquanto isso: o canonical já declara a escolha.
- Se em 4 semanas o apex ainda não for o canônico escolhido em alguma página, o próximo passo é
  Inspeção de URL → **Testar URL ativa** e conferir o HTML que o Google recebe.

### 6. Erros conhecidos e a causa

- **"Não foi possível buscar" persistente**: GitHub Pages serve o último commit publicado; antes
  do build terminar o arquivo responde 404. Espere o build e reenvie.
- **"URL não permitida"**: o sitemap cita outro host. Era o defeito do sitemap antigo da matriz,
  que listava wiki, blog pessoal e retrô — entrada de outro domínio é ignorada.
- **Sitemap lido, poucas URLs descobertas**: é esperado — 91 das 101 páginas HTML da matriz
  ficam fora de propósito (stubs de `/delivery/`, `secure/`, `aligned/`, `cv/`, `handbook/`,
  livros com `noindex`). O motivo de cada exclusão está na tabela acima.

## Decisões abertas (fora deste ajuste)

- `/aligned/` continua bloqueado no `robots.txt`: 15 páginas trilíngues (EN/IT) fora do índice.
- A wiki não declara canonical próprio nas 51 páginas do sitemap nem JSON-LD em nenhuma delas
  (nem `Organization`, nem `WebSite` com `SearchAction`). É o maior bloco de conteúdo do domínio
  e hoje não diz ao buscador o que é.
- Os 40 stubs de `/delivery/` respondem 200 e redirecionam no cliente, em vez de 301 no servidor.
- Os livros (`publications/livros/*.html`) seguem com `noindex` deliberado; só a listagem é
  indexável.
- A home da matriz declara o `Book` da Rebeldia da Mecatrônica e não uma entidade da empresa: o
  `@id` canônico `https://caracore.com.br/#organization`, com CNPJ e endereço, só está definido
  na central. As quatro lojas repetem a `Organization` inline (nome + URL) em vez de apontar
  para esse `@id`, o que impede o buscador de somar as declarações em uma entidade só.
- As lojas dos brincos (OIDC, Circuito, Seed, RU/BioReator, Helianto, ETE, Área 51, MKT,
  Rust) continuam sem `robots.txt` e sem `sitemap.xml` próprios.
