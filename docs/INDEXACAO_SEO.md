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

## O que só o dono faz (Search Console)

Propriedade de domínio `caracore.com.br` já verificada por TXT (tela de 09/11/2026). Falta
enviar os sitemaps, um por host:

1. `https://caracore.com.br/sitemap.xml`
2. `https://wiki.caracore.com.br/sitemap.xml`
3. `https://download.caracore.com.br/sitemap.xml`
4. `https://pdv.caracore.com.br/sitemap.xml`
5. `https://hub.caracore.com.br/sitemap.xml`
6. `https://ink.caracore.com.br/sitemap.xml`
7. `https://cso-transp.caracore.com.br/sitemap.xml`

Depois do deploy, cada URL precisa responder 200 em `<host>/sitemap.xml` e
`<host>/robots.txt` — antes disso o envio falha com "não foi possível buscar".

## Decisões abertas (fora deste ajuste)

- `/aligned/` continua bloqueado no `robots.txt`: 15 páginas trilíngues (EN/IT) fora do índice.
- A wiki não declara canonical próprio nas 51 páginas do sitemap; o espelho é hoje o próprio
  host, mas a declaração explícita ainda não existe.
- Os 40 stubs de `/delivery/` respondem 200 e redirecionam no cliente, em vez de 301 no servidor.
- Os livros (`publications/livros/*.html`) seguem com `noindex` deliberado; só a listagem é
  indexável.
- As lojas dos brincos (OIDC, Circuito, Seed, RU/BioReator, Helianto, ETE, Área 51, MKT,
  Rust) continuam sem `robots.txt` e sem `sitemap.xml` próprios.
