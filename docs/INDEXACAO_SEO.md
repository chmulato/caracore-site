# Indexação: host canônico, sitemaps e robots

Estado de **09/11/2026**. Complementa `GOOGLE_ANALYTICS.md`: ali está a medição, aqui está
como o Google descobre e escolhe a URL de cada página.

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

### 3. Ler a coluna de status

| Status | O que significa | O que fazer |
|---|---|---|
| **Em processamento** | o Google ainda está lendo o arquivo | esperar; normal nas primeiras horas |
| **Sucesso** | arquivo lido; o número de URLs aparece em "Descobertas" | nada, é o estado final |
| **Não foi possível buscar** | o arquivo não respondeu 200 | abrir a URL no navegador, esperar e clicar em **Enviar** de novo |
| **Sitemap com erros** | o arquivo foi lido e alguma URL foi recusada | abrir o detalhe; erro comum é URL que redireciona ou de outro host |
| **Tipo desconhecido** | formato não reconhecido | conferir se a URL é a do `.xml` e não a de uma pasta |

"Sucesso" pode levar de horas a alguns dias. Reenviar não acelera e não atrapalha.

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
- A wiki não declara canonical próprio nas 51 páginas do sitemap; o espelho é hoje o próprio
  host, mas a declaração explícita ainda não existe.
- Os 40 stubs de `/delivery/` respondem 200 e redirecionam no cliente, em vez de 301 no servidor.
- Os livros (`publications/livros/*.html`) seguem com `noindex` deliberado; só a listagem é
  indexável.
- As lojas dos brincos (OIDC, Circuito, Seed, RU/BioReator, Helianto, ETE, Área 51, MKT,
  Rust) continuam sem `robots.txt` e sem `sitemap.xml` próprios.
