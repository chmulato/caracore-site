# Memória do ecossistema — retomada de desenvolvimento

Referência única para alinhar **matriz**, **lojas**, **oficinas**, **wiki**, **retrô** e **releases** ao retomar trabalho.

### PDV — PIX e NFC-e como módulos do Plano Pro na v4.1.0: alinhamento das quatro superfícies — 27/11/2026

**O que mudou no discurso:** a fórmula «são módulos **em desenvolvimento** para a v4.1.0» saiu de
circulação e passou a «são **módulos do Plano Pro na v4.1.0, cada um ativado pela credencial do
próprio provedor, com meta em 24/03/2027**». A redação é a mesma nas quatro superfícies (loja, matriz,
wiki, Central). **O portão que a copy descrevia não existia:** `roadmap-2026.html:132` prometia os
módulos «como módulos opcionais para um **plano pago superior**» — no código medido não há plano acima
do Pro. Em `pdv-apps/src/main/java/br/com/caracore/pdv/service/PlanoLicencaService.java` há **um**
portão, `isPremium()` (`:111`), para o qual delegam `isPixHabilitado()` (`:132-133`) e
`isNfceHabilitado()` (`:128-129`); o que separa PIX de PIX + fiscal é a **credencial salva** do
provedor (`MercadoPagoCredencialService`, `PlugnotasCredencialService`), não uma faixa de preço
adicional. **Por que «em desenvolvimento» deixou de ser a palavra:** a mesma auditoria que motivou o
adendo de 22/11 está vencida pelo próprio tronco — em `feature/4.1.0-mp-plugnotas` `0f7399e` o reator é
`4.1.0`, `integration/mercadopago` e `integration/plugnotas` estão na árvore, as migrações
`V057`–`V072` também, e o gate medido é **1.814 · 0 · 0 · 3** com LINE **57,52%** e scripts **165/165**.
**Por que «disponível» ainda não é a palavra:** **0** tags da 4.1.0 no repositório e **0** no de
distribuição (43 tags, nenhuma da linha), e nenhuma mídia 4.1.0 na prateleira — o que se baixa hoje é a
`v4.0.0`. A frase vira «disponível» com **corte e empacotamento oficiais da v4.1.0 publicados**
(fila `PKG-F1`/I2, T032 rodado no próprio pacote); para a NFC-e soma-se a homologação real (P6/#74),
porque o sandbox é simulação e não alcança SEFAZ/município/ADN (**D-FOCO-1**, 24/11).

**Propagação medida (antes × depois):**

| Superfície | Arquivos tocados | Das 24 ocorrências | Variantes irmãs | Depois |
|---|---|---|---|---|
| Loja `caracore-pdv-releases` | 3 `.html` + 1 `.md` | 2 (`docs/index.html:295`, `docs/tecnologia.html:105`) | 4 (`roadmap-2026.html:114`, `:127`, `:132` e `README.md:29`) | 0 |
| Wiki `caracore-wiki` | 6 `.html` | 15 (`glossario` 1, `pdv/contador` 2, `pdv/index` 1, `pdv/parceiros` 5, `projeto-pdv` 3, `projetos-overview` 3) | 0 — os 2 banners ganharam a âncora `na v4.0.0` | 0 |
| Matriz `caracore-site` | 3 `.html` + 2 `.md` | 7 (`ecosistema.html:233/868/1308`, `index.html:592`, `portfolio.html:1791`, `AGENTS.md`, este arquivo) | 0 | 0 |
| Central `caracore-loja` | 1 `.html` | 0 | 1 (`docs/index.html:293`) | 0 |
| Oficina `caracore-pdv` | 0 | 0 | 0 | 0 |

**A quarta variante irmã apareceu na validação, não no inventário:** `caracore-pdv-releases/README.md:29`
dizia «PIX integrado e emissão fiscal **em desenvolvimento (roadmap)**, não disponíveis hoje» sem o verbo
da forma que a varredura procurava (`estão em desenvolvimento`), e por isso ficou de fora das 24 + 3. É a
mesma família e é página viva (o GitHub renderiza o README do repositório de distribuição), então entrou
no lote.

**Formas verbais encontradas** (a regex `est[ãa]o? em desenvolvimento` não basta): K1 plural «são
módulos em desenvolvimento para a v4.1.0» (**20**, das quais **2** fechando período —
`caracore-pdv-releases/docs/index.html:295` e `caracore-site/portfolio.html:1791` — e **1** com o
`<strong>` abraçando o sintagma inteiro, `caracore-site/index.html:592`), K2 «estão em desenvolvimento
para a v4.1.0» (**1**, `ecosistema.html:1308`), K3 singular «está em desenvolvimento para a v4.1.0»
(**3**: `tecnologia.html:105`, `projetos-overview.html:284`, `parceiros.html:347`). 20 + 1 + 3 = **24** ✓.
Âncora e data: **6** linhas que omitiam `24/03/2027` passaram a trazê-la (as **2** do K1 com período,
`pdv/parceiros.html:347`, `roadmap-2026.html:114`, `caracore-loja/docs/index.html:293` e o
`README.md:29` da loja); `roadmap-2026.html:132` fica **sem** a data de propósito, porque a frase descreve
a topologia de planos e a data já está em `:114`, `:118` e `:127`. Os dois banners da wiki que
diziam «Nenhum plano do PDV emite NF-e/NFC-e nem faz PIX pelo sistema» agora dizem **na v4.0.0**
(`pdv/index.html:129`, `pdv/contador.html:128`), porque a afirmação é do artefato baixável, não da
família. **Nos 14 arquivos de página (13 `.html` + o `README.md` da loja) nenhuma linha foi criada nem
removida** — substituição in-place, numstat simétrico linha a linha (`3/3`, `1/1`, `5/5`, `2/2`); linhas
novas só nos dois documentos canônicos, que recebem o adendo e esta seção (`AGENTS.md` `3/1`; aqui, só
adições).

**Armadilha de instrumento, nova:** neste Perl do Git Bash, `"\x{00e3}"` resolve para o **byte único
`0xE3`**, não para o par UTF-8 `C3 A3`. Uma variante escrita com escapes `\x{…}` casa **0** vezes contra
texto UTF-8 cru sem dar erro nenhum — o script roda, o residual parece alto e a tentação é ampliar o
padrão. A forma que funciona é texto literal UTF-8 no fonte do script com leitura e escrita em `:raw`.
**Armadilha de contagem:** `git grep -c -o` devolve **0** num arquivo que tem 1 ocorrência quando a
linha é longa demais; a contagem por arquivo é `grep -c -a -F` direto no caminho. **Armadilha de EOL,
já conhecida e agora medida nos 16:** `core.autocrlf=true` e **5** dos 16 arquivos estão `w/crlf` na
árvore com `i/lf` no índice (`caracore-pdv-releases/docs/index.html`, `roadmap-2026.html`,
`caracore-wiki/docs/projeto-pdv.html`, `caracore-wiki/docs/pdv/index.html`,
`caracore-loja/docs/index.html`); a prova de integridade é `CR == nº de linhas` (CRLF uniforme) ou
`CR == 0` (LF puro) — conferir o hash do arquivo em disco contra o congelado acusaria os cinco. Os outros
**11** estão `w/lf`. Desses, **6** disparam o aviso «LF will be replaced by CRLF the next time Git touches
it» (`README.md` e `docs/tecnologia.html` da loja, e os 4 `.html` da wiki que não são `w/crlf`): os três
repositórios não têm `.gitattributes`, e com `core.autocrlf=true` o próximo checkout deles reconvertê-los-ia
— o `caracore-site` não avisa nada porque fixa `* text=auto eol=lf`. É ruído do checkout seguinte, não
desta edição: em disco os arquivos seguem intactos e o blob do commit fica LF.

**Resíduos nomeados, sem edição nesta passada:** (a) `caracore-site/assets/js/catalog-data.js:76`
carrega **1** ocorrência da frase antiga — `.js`, fora do recorte `.html`/`.md` aprovado; (b) quatro
linhas vivas da loja afirmam «NF-e/NFC-e: roadmap, sem data» ou «não está disponível em nenhum plano»
(`readme.html:216`, `:232`, `:344`, `download.html:267`) — verdadeiro para NF-e, contrariado para NFC-e
pela redação nova, e por isso o par merece passada própria com o dono; (c) a wiki chama o plano pago de
**Premium** em seus 6 arquivos (Pro = **0** ocorrências ali), enquanto loja e matriz usam **Pro**; a
equivalência «Pro (o Premium da loja 3.2.12)» está publicada em 4 páginas da loja e em **nenhuma** da
wiki; (d) `caracore-pdv-releases/README.md:27` diz «desktop local (Windows, Linux e macOS)», contra a
matriz de empacotamento de 23/11/2026 (Windows x64 e Linux x64, **macOS cortado**) — é a frente de
plataforma, não desta fórmula. As notas históricas `wiki-release-v3-2-*.html` ficam como história medida.

**Correção datada do mesmo dia (27/11) — o «resíduo 0» das páginas estava sub-medido:** a varredura que
fechou o lote usou `git grep -c -F 'em desenvolvimento para a v4.1.0' -- '*.html'`, e o `grep` lê **uma
linha por vez**: não casa a frase quebrada entre duas linhas nem o sintagma interrompido por `<strong>`.
Refeita em multilinha (`perl -0777` sobre `em desenvolvimento.{0,120}v4\.1\.0` no arquivo inteiro, inclusive
o `git show HEAD:arquivo`) e em varredura literal de `em desenvolvimento` por extensão, a fórmula antiga
estava viva em **3** páginas, não em 0: `caracore-pdv-releases/docs/index.html:122-123` (frase partida),
`caracore-site/portfolio.html:200` (nota de rodapé com `<strong>` no meio) e
`caracore-pdv-releases/docs/tecnologia.html:30` (descrição JSON-LD na forma curta «Emissão de NF-e/NFC-e em
desenvolvimento», sem verbo e sem `v4.1.0` na vizinhança — classe que a regex multilinha também não
cobria). Os três receberam a redação canônica neste lote (numstat `3/2`, `1/1` e `1/1`), com o EOL
preservado — `docs/index.html` segue CRLF uniforme (`CR 392 == linhas 392`) e os outros dois LF puro — e o
bloco JSON-LD revalidado como JSON. **Recontado:** **0** nos `.html` dos cinco repositórios pelo
instrumento multilinha e **1** fora do recorte aprovado, o `.js` do item (a) acima. Lição de instrumento
que entra na regra da casa: varredura de fórmula em HTML se faz em multilinha **e** por extensão, e o
veredito «resíduo 0» exige o nome do comando **com sua limitação declarada** ao lado do número.

**Estado dos repositórios (snapshot do lote, antes do envio):** 1 commit local por repositório tocado,
**0** `git push`, **0** tag nova,
nenhum `.java`/`.py`/`.sql`/`.wxs`/workflow alterado, banco Free intacto em `663.552 B`
(`99ae26f2f59dfcb1776d3f30f65aad932541e3df308c365222c612188702fd5b`, mtime 15/10/2026 09:40:40) e
`%APPDATA%\CaraCorePDV` inexistente. **O que veio depois:** os quatro commits foram **empurrados em 27/11**
com autorização do dono — fast-forward, sem `--force`, sem tag, Pages `built` nos quatro SHA novos e o
corpo servido conferido por SHA-256 contra o blob do `HEAD` — e o lote da correção de resíduo do parágrafo
acima saiu em **1** commit por repositório (`caracore-site` `d55bee0`, `caracore-pdv-releases` `8f1dcae`),
**empurrados em 27/11** com Pages `built` nos dois SHA novos e o mesmo par de provas: `pdv.caracore.com.br/`
`dd4342d1…`, `pdv.caracore.com.br/tecnologia` `9715798f…` e `caracore.com.br/portfolio` `fe8c896b…`, todos
**200**, com SHA-256 do corpo **idêntico ao blob** e resíduo da fórmula aposentada **0** nas três.

### PDV Local-First — três superfícies e a wiki alinhadas ao mesmo texto — 22/11/2026

**O que mudou no discurso:** cinco frases do ecossistema diziam que **só o plano Free** não tinha
PIX integrado nem NF-e/NFC-e. Medido no pacote que se baixa hoje (`v4.0.0`, release de 06/11 e
lançamento em 08/11/2026), **nenhum dos dois planos** emite nota fiscal nem opera PIX pelo sistema.
A redação canônica, igual em loja, matriz e wiki:

> `Na v4.0.0, nem o Free nem o Premium emitem NF-e/NFC-e nem fazem PIX pelo sistema — o PIX é feito
> pela maquininha do banco, fora do PDV. PIX integrado (Mercado Pago) e NFC-e sob demanda (TecnoSpeed
> PlugNotas, já desenhada para a transição IBS/CBS) são módulos em desenvolvimento para a v4.1.0, com
> meta em 24/03/2027. NF-e e NFS-e não estão no escopo planejado.`

Saiu de circulação o **«roadmap, sem data»** (0 ocorrências em `caracore-wiki/docs/` e 0 nas seis
páginas ao vivo). O motivo de dizer «em desenvolvimento» e não «pronto», medido no repositório: os
módulos estão **fora** do que se baixa. No tronco `feature/4.1.0-mp-plugnotas` — aberto em
**11/11/2026** com `baddab4` (branch do Mercado Pago), `3106403` (branch da PlugNotas), `ae757d5`
(«trunk novo MP + PlugNotas», o elo que os junta) e `5e28536` (o PIX no caixa com QR) — há **20**
arquivos em `integration/mercadopago/`, **19** em `integration/plugnotas/` e **41** Java citando a
PlugNotas; na `master` os três contadores são **0**, e `master..feature/4.1.0-mp-plugnotas` devolve a
cadeia inteira. O que a `master` tem é um **placeholder** honesto:
`service/gateway/MercadoPagoGatewayService.java:15` declara «Provedor MercadoPago (placeholder —
integracao real requer SDK MP)», o `generatePixQRCode` loga «nao implementado» em `:30` e atira
`UnsupportedOperationException` em `:31` — nem no tronco principal há chamada real ao provedor. O
`8244494` de 17/11/2026 é checkpoint posterior desse tronco, não a primeira entrada. A NFC-e é
**«sob demanda, botão no caixa»** (decisão do dono em 11/11/2026), nunca automática. O pilar que
entrou no lugar do rótulo fiscal é o **Local-First**: cadastro, venda e fechamento de turno na
máquina da loja, mesmo com a internet fora, com os dados em SQLite local e sem servidor de
terceiros no meio do caminho.

**Publicado em três lotes (commit e numstat conferidos em cada repo):**

| Camada | Repo · commit | Arquivos | Linhas |
|---|---|---|---|
| Loja | `caracore-pdv-releases` `691e73d` | `docs/index.html` 48/15 · `docs/tecnologia.html` 7/7 | 55/22 |
| Matriz | `caracore-site` `82f7e43` | `index.html` 11/8 · `portfolio.html` 11/9 · `ecosistema.html` 8/8 · `assets/js/catalog-data.js` 1/1 | 31/26 |
| Wiki | `caracore-wiki` `2e8a555` | os 7 arquivos abaixo | 20/20 |

**A passada da wiki (7 arquivos, 20 inserções / 20 remoções):** `assets/js/wiki-search.js` 1/1 (o
cartão do índice de busca), `glossario.html` 1/1, `pdv/contador.html` 2/2, `pdv/index.html` 2/2,
`pdv/parceiros.html` 5/5, `projeto-pdv.html` 4/4, `projetos-overview.html` 5/5.

**Trava anti-duplicação, nascida nesta passada:** onde o parágrafo já trazia uma afirmação própria
dos dois planos — a chamada em negrito «Nenhum plano do PDV emite…» ou o qualificador adiantado
«Sem PIX integrado e sem NF-e/NFC-e na v4.0.0 — no Free e no Pro.» — a cauda canônica entrou **sem a
cláusula de abertura** (`pdv/index.html:129`, `pdv/contador.html:128`, `pdv/parceiros.html:336`) e,
nos dois pontos em que o qualificador adiantado competia com ela, foi trocado por **«Sem servidor de
terceiros no meio do caminho.»** (`glossario.html:400`, `projetos-overview.html:277`). Uma afirmação
por parágrafo; o escaneamento linha a linha dos sete arquivos fechou com 0 duplicidades.

**Ficou como estava, porque é afirmação verdadeira e não divergência:** `pdv/contador.html:139` («No
PDV Free, a Reforma Tributária não é um benefício… Ele não calcula CBS/IBS» — fala do Free, e o Free
realmente não calcula), `projeto-pdv.html:205` (linha de tabela escopo do Free: «“outros” não é PIX
integrado. Sem QR/gateway e sem NF-e/NFC-e.»), o bullet de planos em `projetos-overview.html:290`
(mesma coisa, escopo do Free) e `projeto-pdv-rust.html:138` — «PIX com QR Code e confirmação no
caixa» é do **piloto Rust** (`v0.1.4`), outra linha, outro produto, e continua verdadeiro.

**Três achados contra a minha própria anotação, corrigidos neste mesmo registro:** (a) eu tinha
anotado «primeiro código `8244494`, 17/11/2026» para a entrada do Mercado Pago/PlugNotas — medido o
`git log` do tronco, a cadeia começa em **11/11/2026** (`baddab4`, `3106403`, `ae757d5`, `5e28536`) e o
`8244494` é checkpoint posterior; (b) atribuí a frase do Rust com QR a `projetos-overview.html:233`,
que é um cartão do **Ink** — a frase está em `projeto-pdv-rust.html:138`; (c) escrevi que os módulos
«existem **só** no tronco», e a `master` tem seis arquivos Java que citam Mercado Pago — ao ler o
código, são o `MercadoPagoGatewayService` placeholder (`:15`, `:30`, `:31`) mais o registro de
provedores e seus testes, que **não** chamam o provedor. A frase correta é «0 arquivos dos pacotes
`integration/mercadopago` e `integration/plugnotas` na `master`». Lição gravada: «só no tronco» é
afirmação de árvore e se mede por pacote, não por presença de nome.

**Dois julgamentos propostos pelo agente e ratificados pelo dono na aprovação:** (a) caiu a frase «o
ciclo manual completo no Edge ainda não foi preenchido» do parágrafo da prévia — não há medição dela
para a `v4.0.0` publicada, em nenhum dos dois sentidos, então não se pode afirmar nem negar; (b) «ZIP
portátil unsigned» permanece **só** no histórico do candidato de 31/10, porque é a descrição do
arquivo daquela tag. O parágrafo `projeto-pdv.html:233` passou de «prévia em circulação» para
**histórico da prévia**, com o link da tag `v4.0.0-candidato-20261031`, os 178.317.680 B e o SHA-256
`0c2003b0…83434d` mantidos como dados do arquivo de 31/10, e as `rc6`/`rc5` declaradas histórico.

**Validação local antes do commit:** `git status` com exatamente os 7 arquivos (nenhum CSS ou skin
tocado); 0 linhas de `<meta>` alteradas; saldo de tags nulo contra o HEAD em 12 marcas; 1 `<h1>` e 1
canonical por página; JSON-LD parseando. **Armadilha de EOL medida:** `docs/pdv/index.html` (162 CR /
162 linhas) e `docs/projeto-pdv.html` (362/362) estão `w/crlf` na árvore do dono com `i/lf` no índice
(`core.autocrlf=true`); os outros cinco são LF. O numstat continua só de conteúdo e **os bytes servidos
são os LF do blob** — por isso o SHA-256 servido bate com `git show HEAD:arquivo | sha256sum`.

**Prova do que está no ar (medida em 22/11/2026, depois do push):** `e5a6e62..2e8a555` empurrado,
`git ls-remote origin refs/heads/master` igual ao HEAD, árvore limpa e Pages **`built`** em `2e8a555`
com `duration` 22.116 ms. Os sete caminhos públicos — a wiki serve sem o prefixo `docs/` — respondem
**200** e o SHA-256 servido é o do blob commitado: `projeto-pdv.html` `f5e5ec870364`,
`projetos-overview.html` `e07142679b2a`, `glossario.html` `22970c94320f`, `pdv/index.html`
`8091724877af`, `pdv/contador.html` `9bd1ce37f8f7`, `pdv/parceiros.html` `a305468607cd`,
`assets/js/wiki-search.js` `90f45748e407`. Ao vivo: «roadmap, sem data» **0**, «Nenhum plano do PDV
emite NF-e/NFC-e» 2, «nem o Free nem o Premium emitem NF-e/NFC-e» 10, «v4.1.0, com meta em
24/03/2027» 14, «NF-e e NFS-e não estão no escopo planejado» 12, «Local-First» 7, «ciclo manual
completo no Edge» **0** e «ZIP portátil unsigned» só em `projeto-pdv.html:233`.

**Armadilha de prova que segue valendo:** `git rev-parse HEAD:arquivo` devolve SHA-1 do **blob** e
fabrica divergência contra o arquivo servido; a conferência é `git show HEAD:arquivo | sha256sum`.
Série medida desta wiki nas últimas oito construções: **13.054–23.035 ms** — o `duration` não é sinal
de problema; o que é sinal é `errored` com `duration=0` (travamento da plataforma, que se resolve com
rebuild pela API, não com novo commit).

**Ficam abertos, sem ação nesta passada:** as duas divergências da wiki à espera de decisão do dono
(`docs/projeto-hub.html:169` chama de «Concluída» a fila Mercado Livre/WhatsApp e
`docs/hub/admin.html:128` fala senha de 6 e temporária de 8 contra os **12** publicados desde a
`rc1.7`); a passada dedicada do contraste AA do hero; e nada de produto, versão, hash ou preço mudou
por estes lotes — é texto.

### Retrô — artigo 149 publicado e contagens do acervo alinhadas — 21/11/2026

**O que foi publicado:** o lote do artigo 149 (*O que tem dentro da caixa*, 15/09/2027) saiu em
`caracore-retro` no commit **`3618764`** — **16 arquivos, +246/−25**: o HTML novo do 149 (193
linhas, 17.979 B), três capas novas (`2027_09_15_article_149_01.png` 3.513.453 B, `_720.webp`
49.006 B, `_1600.webp` 177.568 B), as três capas do 148 renomeadas para o padrão com data (R100,
zero byte alterado), o elo novo no fim do 148 («Continue em: O que tem dentro da caixa»),
`docs/feed.xml`, `docs/index.html`, `docs/sitemap.xml`, `docs/assets/js/editorial-index.js` e os
quatro documentos do próprio repo que contavam o acervo (README, `.agents/AGENTS.md`,
`.github/copilot-instructions.md`, `.cursor/rules/project-memory.mdc`). A mensagem do commit traz
**`[skip linkedin]`**, que é o que `deploy.yml:75` e `:125` leem para não postar em rede social
num push de docs.

**Gate nos bytes publicados:** `tools/validate_site.py` **945** verificações APROVADO (o registro
anterior do repo, antes deste lote, era 916), `tools/validate_social_metadata.py` **151 URLs · 149
`BlogPosting` · 151 `WebPage`** e os **2** testes unitários do gerador de metadados. O feed é
gerado a partir dos cartões de `docs/index.html` e o sitemap é regenerado do mesmo catálogo,
então mexer no corpo de um artigo não muda os bytes de nenhum dos dois.

**Prova do que está no ar (medida em 21/11/2026, depois do dispatch):**

- Run de push `44951195298` **success** nos quatro jobs, com `publish-linkedin` e
  `publish-linkedin-company` **skipped** exatamente pelo `[skip linkedin]`; Pages **built** no SHA
  publicado em 79 s.
- Dez arquivos conferidos **byte a byte**: o SHA-256 servido é o do blob do commit
  (`git show 3618764:arquivo | sha256sum`). O 149 serve 200 com 17.979 B e SHA-256 `9bac020b…`.
- Sitemap ao vivo com **151** `<loc>`, feed ao vivo com **149** `<item>`.
- As capas legadas do 148 respondem **404** (`article_148_01.png`, `article_148_01_720.webp`);
  as renomeadas respondem 200. O elo «Continue em» do 148 resolve
  `https://retro.caracore.com.br/articles/2027_09_15_article_149.html` em **200** e o `og:image`
  do 149 em **200**.

**LinkedIn — despacho pedido pelo dono para o 149:** `workflow_dispatch` com `article=149` no
workflow «Deploy GitHub Pages», run **`44951604416`** `completed success` nos quatro jobs. No
perfil pessoal: `PUBLICADO [com thumbnail]: …/2027_09_15_article_149.html`
`urn:li:share:7530019304625561601`. O bot gravou o ledger em **`0dc789e`**
(`chore: registra publicacoes no LinkedIn [skip ci]`, push `3618764..0dc789e`), que é a ponta atual
da `master`: o `linkedin_published.json` remoto passou a ter a chave do 149 e esse commit muda só
esse arquivo — fora de `docs/`, portanto não exige novo deploy. **O despacho não publicou na página
da empresa:** naquele run, sem `LINKEDIN_ORG_ACCESS_TOKEN` e `LINKEDIN_ORG_URN` o canal entrou em
`MODO DRY-RUN` com o `::warning::` de projeto e o `linkedin_company_published.json` não mudou.

**Página da empresa — 148 e 149 gravados no ledger à mão (21/11/2026, 21:48Z):** o painel da página
mostrou o 148 no ar (≈20/11) sem constar no ledger, e o dono publicou o 149 na sequência, pelo
painel, sem credencial de organização. As duas chaves entraram em `linkedin_company_published.json`
no commit **`5aee24d`** (`chore: registra 148 e 149 no ledger da pagina da empresa [skip linkedin]`,
push `0dc789e..5aee24d`, `git ls-remote origin master` conferido igual ao HEAD), que deixa o ledger
com **7** chaves — as cinco anteriores (#143, #108, #145, #146, #147) e agora #148 e #149. Prova da
sonda sem credencial: `python tools/publish_linkedin.py --article 149 --ledger linkedin_company_published.json`
responde `JA PUBLICADO: 2027_09_15_article_149.html (…)` e `Nenhum artigo novo detectado; nada a publicar.`
O run do push **`44953402339`** fechou `success` (`validate` 16 s, `deploy` 49 s) com
`publish-linkedin` e `publish-linkedin-company` **`skipped`** pela cláusula `[skip linkedin]` da
mensagem, e o Pages ficou `built` em `5aee24d`. **Correção da justificativa que circulei antes de
gravar:** o risco não era o `--due-today` de 07/09 e 15/09/2027 — `scheduled_articles()`
(`caracore-retro/tools/publish_linkedin.py:179-186`) devolve lista vazia fora da janela
`SCHEDULE_START 15/11/2026` … `SCHEDULE_END 31/12/2026` (medido: 2026-11-21, 2027-09-07 e 2027-09-15
→ `[]`), então artigo de 2027 nunca entra pelo agendamento. O ledger serve às entradas manuais e de
esteira que **não** filtram por data — `--latest`, `--article N` e o `git diff` do push — e mantém a
contabilidade do canal igual ao que a página realmente mostra. O canal segue dormente para artigo novo
até os secrets `LINKEDIN_ORG_*` serem cadastrados.

**Contagens da matriz corrigidas (este commit, `caracore-site`):** sete arquivos / dez linhas
que ainda diziam **139 artigos** ou descreviam a capa errada — `AGENTS.md:215`,
`.cursor/rules/project-memory.mdc:201-202`, `docs/INDEX.md:61`,
`docs/MEMORIA_DO_PROJETO.md:119` e `:122-123`, `docs/STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md:88`,
`docs/ECOSYSTEM_CARA_CORE.md:28` e os itens **6b** (`:1154`, depois deste próprio bloco entrar no
ficheiro) e da tabela (`:1326`).
**Ficam como estão, porque são registro datado e não estado:** `AGENTS.md:22` (adendo de 04/11),
as linhas `:1367` e `:1472` deste ficheiro e as seções de 19/11/2026 do
`docs/INDEXACAO_SEO.md` (`:67`, `:107`, `:113`, `:118`), que dizem 150/148 porque mediram 150/148.

**Três afirmações falsas achadas ao conferir, e corrigidas no lugar:** a capa **não** é
`<img>` com `max-width:300px; float:right` — 0 de 149 artigos usam isso e **149 de 149** usam
`<picture class="article-hero">` com WebP 720 (≤680 px), WebP 1600 e PNG de reserva; **não** há
«BOM em muitos artigos» nem validação HTML pendente por encoding — 0 dos 149 artigos têm BOM e os
30 arquivos com BOM do repositório estão todos em `docs/regis/`; e o prompt de capa não vive em
`assets/img/…_PROMPT_IMAGEM.txt` — o caminho real é `docs/articles/assets/prompts/YYYY_MM_DD_article_NN.txt`,
com 9 arquivos no repo (116, 131–134, 143–145).

**O que este registro não muda:** nenhuma versão, tag, artefato ou data de produto; os artigos
seguem o mesmo calendário editorial; o canal da página da empresa continua dormente pelo mesmo
motivo de antes (falta de secrets), e a campanha Facebook do Retrô não foi tocada.

### Discurso comercial do Gaspar — 21/11/2026 (publicado nas cinco superfícies)

**Estado confirmado:** o Gaspar deixou de ser apresentado como “mascote com SMS em nuvem” e passou a ser **mensageria local sem mensalidade por SMS** — o módulo que dá o recado do caixa no celular da loja, no chip e no plano que a loja já tem. A identidade nova está no ar em cinco repositórios: loja `caracore-mascote` **`4cf36c6`**, Central `caracore-loja` **`9f7ba96`**, matriz `caracore-site` **`e8f1011`**, `caracore-pdv-releases` **`3c2bba4`** e `caracore-hub-releases` **`10f4618`**. Dez arquivos, todos de copy/metadado; **nenhum código de produto foi tocado**.

**O que mudou por superfície:**

| Superfície | Arquivos | Mudança |
|---|---|---|
| Loja do Gaspar | `docs/index.html` (+68/−51), `docs/atualizacao.html` (+5/−5) | título `Gaspar \| Avisos pelo celular da loja, sem mensalidade`; hero `O recado do caixa sai pelo celular da loja.`; selo `SMS opcional` → `Mensageria local · sem mensalidade` + selo novo `Sem mensalidade por mensagem`; os quatro cards reordenados e renomeados (aviso no celular / sem servidor no meio / presença discreta / atualização tranquila); `applicationCategory` trocada de `UtilitiesApplication` para `BusinessApplication`; FAQ de 3 para 7 entradas (custo, teto diário, fora da loja, pacote no balcão); faixa `O PDV cuida da venda. O Gaspar cuida do recado.`; rodapé `Gaspar 1.7.4 · o recado do caixa no celular da loja` |
| Central de Downloads | `docs/download.html` (+12/−12), `assets/data/produtos.json` (+5/−5), `assets/js/download-app.js` (+1/−1), `docs/roadmap.html` (+2/−2) | o cartão sai do rótulo “mascote” e passa a **ferramenta do PDV 4** (também no `ListItem` 15 do JSON-LD); os sete `avisos[]` do bloco `gaspar` espelham o texto da loja; linha do roadmap sobre a chamada automática reescrita |
| Matriz | `index.html` (+6/−4) | novo par `<dt>Recado no celular</dt>` dentro do bloco do PDV; bloco do Gaspar reescrito (papel / publicado / integração / rede) |
| Loja do PDV | `docs/roadmap-2026.html:133` (+1/−1) | uma linha citando o Gaspar como o módulo do recado sem mensalidade |
| Loja do Hub | `docs/download.html:175`, `docs/tecnologia.html:180` (+1/−1 cada) | “quem dá o recado no celular é o Gaspar — e hoje o Hub não chama o Gaspar” |

**Regra de copy que fica valendo (contrato de promessas):**

1. **A chamada automática do recado pelo PDV não tem versão nem data.** A cláusula que prometia a integração “na v4.1.0” saiu das cinco superfícies. O `roadmap-2026.html:127` do PDV **mantém** a meta dele de 24/03/2027 para a v4.1.0 — o dono do roadmap próprio decide o escopo próprio; só se removeu a promessa que era do Gaspar.
2. **Aviso de pacote retirado (Mercado Livre, Shopee, Temu) mandado pelo Gaspar não existe.** Medido no `caracore-hub`: `git grep -il gaspar` devolve **zero** arquivos rastreados. As duas frases que escrevi nas lojas do Hub dizem apenas “quem dá o recado no celular, pelo chip da loja e sem mensalidade, é o Gaspar — e hoje o Hub não chama o Gaspar” (`download.html:175`, `tecnologia.html:180`). **Correção do que registrei aqui nesta mesma data:** escrevi que o conector WhatsApp vivia «só na árvore legada congelada `project_hub/`». **Está errado.** `project_hub/caracore-hub/` é a árvore dos módulos que **embarcam** no pacote (`<modules>` core/persistence/api/web), e as classes aparecem dentro de `WEB-INF/lib/caracore-hub-api-2.1.0-rc1.10.jar`, no WAR que está dentro do ZIP publicado; legado ali são só `project_hub/docs/` e `project_hub/archive/`. O que `git ls-files | grep -i whatsapp` devolve tudo sob `project_hub/` não significa árvore morta — significa que a oficina mantém esse caminho como fonte. A frase de `tecnologia.html:158` foi tratada no mesmo dia com evidência tirada do artefato, não do git: ver a seção **«Hub — aviso automático ao cliente — 21/11/2026»**.
3. **Fora da loja, pelo e-mail da loja, ainda não está na versão que se baixa.** Medido no repositório: `EmailActivity.java`, `EmailBridge.java`, `EmailDespacho.java` e `EmailMemoria.java` existem na `master` do `caracore-mascote` mas **não** existem na etiqueta `android-v1.7` (varredura de `git ls-tree -r android-v1.7 -- android/src/main/java` não acha nenhum arquivo `*Email*` e o `AndroidManifest.xml` da tag não declara a tela); eles entraram em `763d010` — “ondas B4 e B5, motorista `android_lan` e app Android 2.0”, ou seja, trabalho **não publicado**. Está redigido como “estamos preparando um caminho pelo e-mail da loja… ainda não está na versão que se baixa”, sem data.
4. **Os números de ritmo têm evidência no código:** desktop `gaspar/messaging/config.py:86` `daily_limit_per_origin: int = 300` e `:88` `per_minute_limit_per_origin: int = 20` (o teto configurável do SMS em `gaspar/sms/config.py:24` é 120/min, mas o padrão é 20); celular `android/src/main/java/br/com/caracore/pdv/sms/SmsPreferences.java:41` `DAILY_LIMIT = 300`, cobrado em `consumeSmsQuota()` (`:224`) com o erro “Limite diário do celular atingido” (`SendSmsActivity.java:103`). A copy diz 20/min e 300/dia no computador e limite diário próprio de 300 no aplicativo.

**Como a loja do Gaspar publica — armadilha que trava outra IA:** o `caracore-mascote` tem Pages com **`build_type: workflow`**. Commit na `master` **não** publica nada; a API de builds fica mostrando o build antigo (`built c7f585a 2026-11-12`) e isso não é build encravado. Quem publica é o workflow **“Canal de atualizacao”** (`.github/workflows/channel.yml`, `workflow_dispatch`, entrada obrigatória `tag`), que baixa o manifesto assinado da release, confere a assinatura, copia `docs/` para `site/`, escreve o `CNAME` e faz o `deploy-pages`. **Este é o único disparo que toca o canal de atualização do produto instalado na máquina do cliente — precisa de autorização explícita do dono.** Além disso a `master` do repo tem `enforce_admins: true` com o check obrigatório **“Portao”** (`portao.yml`, roda em `pull_request`), `required_pull_request_reviews` e `required_conversation_resolution` — push direto é recusado (`protected branch hook declined`). O fluxo da casa, seguido nesta data: branch de docs → PR **#15** → Portão verde (1m7s) → `gh pr merge --squash` → `4cf36c6` → dispatch.

**Prova do que está no ar (medida em 21/11/2026):**

- Run do canal `44921789202`, job “Publicar canal” **success em 21 s**, 11 passos verdes, incluindo *“Conferir a assinatura com a chave publica do repositorio”*; deployment do Pages no sha `4cf36c6940d8e7f3846e6bea369a3393cceb5795`.
- Bytes servidos × bytes commitados: `docs/index.html` `0eb0cd496ed3d077` IGUAL, `docs/atualizacao.html` `130030b9224e9314` IGUAL. Nos outros quatro repositórios os Pages de branch ficaram `built` nos commits listados e os oito arquivos conferiram byte a byte.
- **Nenhum link de instalador ou número de versão foi modificado:** os quatro links continuam em `gaspar-v1.7.4` (EXE/DEB/AppImage) e `android-v1.7` (APK). O conjunto ordenado de hrefs versionados, hasheado em `git show 4cf36c6^:docs/index.html` e no que o servidor devolve, dá o mesmo digest `efb64e477bf8`.
- Canal `https://gaspar.caracore.com.br/latest.json`: SHA-256 `51bfdf38361bfabdcf65d60cfbb8af2b2abe330e7dc8ffb2e530074611e2a7b7` **idêntico antes e depois**, comparação profunda dos dois JSON `True` — `version 1.7.4`, `key_id gaspar-2026-11`, `published_at 2026-11-13T18:04:45Z`, `mandatory false`, `min_supported 1.7.0`, assinatura de 88 caracteres.
- Jargão proibido (HTTP, REST, TCP, AES-GCM, IMAP, SMTP, SQLite, daemon, thread, webhook, API, endpoint) nas duas páginas da loja do Gaspar: **0**. Promessa antiga removida: **0** ocorrências nas cinco superfícies.
- **Armadilha de verificação:** `www.caracore.com.br` responde **301** do nginx com uma página de 162 bytes. Conferir a matriz sem `curl -L` dá falso negativo (a checagem mostrou `0` ocorrências da frase nova até refazer com seguimento de redirecionamento). Dois outros falsos negativos foram padrão de busca meu, não conteúdo: o texto real é “Android 1.7” / “aplicativo 1.7 do celular” e “teto de 20 envios por minuto e 300 por dia”.
- Varredura final de jargão e de “2.0” em botão de download: o que resta na Central (4 ocorrências), na matriz e na `tecnologia.html` do Hub pertence a **outros produtos** — Reino OIDC `v2.0.2-free` (“Baixar Free (2.0.2)”), Circuito Ferradura `v2.0.24` e SQLite/API nas tabelas de stack. Nenhum deles é o Gaspar e nenhum texto é dos trechos escritos nesta passagem.

**O que este registro não muda:** nenhuma versão, tag, artefato ou data de produto. O Gaspar continua fora do núcleo de quatro produtos (PDV, CSO, Hub, Ink) e é apresentado como ferramenta da linha do PDV. O registro deste trabalho (esta seção e o adendo do `AGENTS.md`) foi commitado e empurrado na mesma data em **`7e7dd12`** — primeiro ficou só no checkout, por pedido do dono, e depois foi enviado ao remoto.

### Hub — aviso automático ao cliente: o que a v2.1.0-rc1.10 entrega e a copy corrigida — 21/11/2026

**Ponto de partida:** a dívida de copy apontada na regra 2 da seção do Gaspar. Antes de tocar a frase, medi **o produto que se baixa**, não a ponta da `master` da oficina — foi isso que desmentiu o meu próprio rótulo de «árvore legada».

**O que foi medido (artefato publicado):** ZIP `CaraCore-Hub-2.1.0-rc1.10-windows-x64.zip`, 228.354.977 B, SHA-256 `0b18fbcf3af02d53a341ac5b83af9132a0ef201e698585160f332d3ad8bdae00` → `resources/app/caracore-hub.war`, 69.791.168 B, SHA-256 começando em `4157564959bfd6`. De dentro do WAR:

| Pergunta | Resposta medida | Evidência |
|---|---|---|
| O conector WhatsApp embarca? | **Sim** — as classes estão no jar de API dentro do WAR publicado | `WEB-INF/lib/caracore-hub-api-2.1.0-rc1.10.jar` |
| Ele envia algo nesta versão? | **Não** — o padrão do programa é mock, e nada no pacote o desliga do mock | `AppConfig.java:358-361` (`isUseMocks()`, default `"true"`); nenhum arquivo do pacote define `USE_MOCKS` e não há `application.properties` no WAR; `WhatsAppNotificacaoService.java:26-32` escolhe `WhatsAppClientMock` |
| O que o mock faz? | Grava log e devolve `true`; `estaConfigurado()` é sempre verdadeiro, então quem chama entende que enviou | `WhatsAppClientMock.java:20-44` |
| E o aviso de atraso das 6 h? | **Não roda** no Tomcat embutido: o `@Schedule` é `jakarta.ejb`, e o Tomcat não traz contêiner EJB/CDI | `NotificacaoAtrasoScheduledJob.java:24-26`; **0** ocorrências de weld/cdi/ejb em `WEB-INF/lib` e em `resources/runtime/tomcat/lib/*.jar` |
| O Redis é usado? | **Não** — a fábrica está marcada como aposentada e devolve `NoopCacheService`, embora o `lettuce-core-6.8.2.RELEASE.jar` embarque | `CacheFactory.java:5,14` |
| O que o lojista vê na tela? | Uma linha dizendo que a notificação **foi enviada**, quando nada saiu | `LogProntoRetiradaNotifier.java:21-22,49-53` grava o `payload` “Notificação enviada para cliente quando pedido ficou PRONTO”; `pedidos/detalhe.jsp:163-195` imprime `${evento.tipo}` e `${evento.payload}` na ficha do pedido |
| A tela de notificações funciona? | Não — as leituras devolvem lista vazia com “Implementação simplificada … TODO” e o “marcar como lida” responde sucesso sem gravar nada | `NotificacaoResource.java:44-45,53,61-62,65-78` |

**Fato que a leitura da `master` esconde:** o botão «Abrir no WhatsApp» entrou no código em `66aca3d` (09/11/2026), **depois** do build da `rc1.10`. Ele existe no WAR local de 15/11 (69.830.867 B) e **não** existe no que a loja serve. Conferir a ponta do git diria que a versão publicada já tinha botão de WhatsApp — não tem.

**Publicado na loja (escopo aprovado pelo dono: «frase + card do aviso»):** `caracore-hub-releases` **`e3c1ff8`**, +6/−2 em três arquivos — `docs/tecnologia.html:158` reescrita (“nesta edição o Hub não escreve para o cliente: quem avisa é a pessoa do balcão, no WhatsApp da loja…”), card novo **“Aviso automático ao cliente”** em `docs/tecnologia.html:182-185` dizendo que a marca que aparece hoje afirma que o aviso foi enviado e isso não acontece, e `docs/index.html:231` alinhada. Prova: Pages `built` no commit e **bytes servidos iguais aos commitados**, comparados com `git show HEAD:arquivo | sha256sum` (a armadilha é comparar com `git rev-parse HEAD:arquivo`, que devolve SHA-1 do blob e dá falso negativo de divergência). **Nada de versão ou download mudou:** os hrefs e as cinco ocorrências de `v2.1.0-rc1.10`, os tamanhos e os SHA-256 do EXE e do ZIP estão intocados.

**Ressalva declarada, não corrigida:** `tecnologia.html:156` (“cada um com API e webhook”), a metade de Redis/SQLite da linha 158 e o card “O WAR é artefato interno” continuam em linguagem técnica. A regra de zero tequinês foi aplicada às páginas do lojista no trabalho do Gaspar; este arquivo é documentação técnica da loja e uma varredura dele é passo próprio, com pedido.

**Três defeitos de produto (são do código, não da copy) — entregues à oficina na fila da integração do Hub Builder:**
1. `LogProntoRetiradaNotifier.java:22` — o texto gravado como evento afirma um envio que não aconteceu; é o que o cliente lê na ficha do pedido.
2. `admin/usuarios-form.jsp:82` — a opção `WHATSAPP` sai `selected` nos dois ramos da expressão, então uma credencial **Telegram** gravada nunca aparece marcada ao editar.
3. `recuperar-senha-validar.jsp:47` — promete “código de 6 dígitos que foi enviado para seu WhatsApp ou Telegram”; não há canal de envio configurado nesta edição.

**Varredura das outras superfícies à mesma promessa (nada editado nelas):** Central `download.caracore.com.br` e matriz `www.caracore.com.br` têm **0** ocorrências — os hits de WhatsApp/Telegram são do Ink (mensageria do agenda) e links de contato. A wiki já estava mais honesta que a loja: `docs/hub/admin.html:155` descreve que o job das 6 h não roda no Tomcat do pacote e exige disparo externo, e `docs/hub/admin.html:128` / `docs/hub/login.html:140` declaram o aviso desligado. **Duas divergências achadas e não corrigidas, à espera de decisão do dono:** `docs/projeto-hub.html:169` lista “Mercado Livre (webhook HMAC, worker, WhatsApp)” como **Concluída**, e `docs/hub/admin.html:128` fala em senha de 6 caracteres com temporária de 8, contra a política de **12** caracteres publicada desde a `rc1.7`.

### Retrô → Facebook: automação cortada, posts confirmados seguem — 24/11/2026

**Decisão do dono, terça 24/11/2026, duas passadas.** Primeira: sair da automação — «é muito burocrático», e a Meta tem ferramenta mais prática dentro do próprio ecossistema (Business Suite / Planejador da Página). Segunda, depois de medir: **os posts já confirmados vão ser publicados**, só não mais por esta máquina. Não é fracasso técnico e não deixa culpa: é troca de frente.

**O que saiu do `caracore-retro`, com prova.**
- Commit `6f26d38` (09h29 de Brasília, no remoto): 28 arquivos — `facebook.yml`, `facebook-publish-article.yml`, `facebook-diagnostics.yml`, os 4 `tools/facebook_*`, os 4 `test_facebook_*` da raiz e os 17 `facebook_campaign_article_*.json`. Corte limpo medido antes do commit: zero import órfão, 945 verificações do site aprovadas, testes restantes 2/2.
- **Ambientes `facebook` e `facebook-auto` apagados às 09h50**, cada um com o seu `FACEBOOK_PAGE_TOKEN`. Varredura do repositório: não há cópia da chave em lugar algum. Consequência declarada: a credencial continua válida **dentro da Meta** até o dono expirá-la no painel, e **não há como provar essa revogação daqui** — sem token, não existe chamada de leitura que a meça. Atenuante medido antes do corte: a mesma chave já falhava em `GET /me?fields=id` («A credencial nao confirmou o acesso a pagina escolhida»).
- **Refs de reserva apagadas às 09h48:** `a107`–`a112` e `a148` de `refs/heads/facebook-reservas/p1657316127663973/`. Prova: `git ls-remote origin 'refs/heads/facebook-reservas/*'` = 0 linhas. Os sete commits continuam alcançáveis no banco local até um `gc` e recriam-se pelos shas de `caracore-retro/ARQUIVO_FACEBOOK.md`; os `remote_id` foram copiados na conversa de 24/11 e não se repetem em arquivo.

**A medição que invalida este doc em dois pontos.** O workflow `facebook.yml` (id 424162129, cron `0 6 * * 2,4` em `America/Sao_Paulo`) fechou 24/11 com **`total_count` de runs = 0**: a cadência **nunca executou** — nem na quinta 20/11, nem na terça 24/11 às 06h, nem em qualquer data anterior. Portanto: (a) a tabela de «primeiras execuções elegíveis previstas» da seção abaixo está **vencida por objeto, não por data**, e não se cumpre mais; (b) `a149` e `a113` **nunca existiram** — o artigo 149 (24/11 09h) e o 113 (22/12) nunca foram aceitos pela Meta por esta esteira, e não há post deles na Página.

**O que a Meta tem, e o que isso significa.** As sete campanhas confirmadas antes do corte — 26/11, 01/12, 03/12, 08/12, 10/12, 15/12 e a reserva `a148` — estão agendadas **lá dentro** e vão ser publicadas nas datas próprias. Apagar workflow, ref, ambiente ou chave **jamais cancelou** um agendamento: o cancelamento seria clique do dono no Calendário do Business Suite, e **não é o que se quer**. Não há pendência de cancelamento.

**Como fica a operação a partir de 24/11.** As chamadas seguintes são agendadas à mão no Planejador da Página, seguindo o mesmo calendário editorial (terça e quinta, 09h de Brasília). O `facebook_publication_history.json` do Retrô — hoje com as chaves **147 e 148** — passa a receber entrada **manual**, escrita só com `post_id` e link reais, porque a esteira que os gravava não existe mais. Ficam no repositório como registro, e não devem ser apagados: o ledger e os 23 `docs/facebook/*.html` + `sala-theme-facebook.css` (páginas do site; apagar quebra link).

**LinkedIn do Retrô, para não confundir.** Continua automatizado, **só no canal pessoal** (`publish-linkedin`, no `deploy.yml`, 8 publicações reais de 30/11 a 30/12). O canal da **empresa** saiu da esteira na mesma terça: `LINKEDIN_ORG_ACCESS_TOKEN` e `LINKEDIN_ORG_URN` nunca existiram em repo nem ambiente algum, e o job fechava verde em *dry-run* sem postar — as datas de dezembro fingiriam sucesso na Página. `linkedin_company_published.json` (7 chaves) fica histórico, sem escritor.

**Superfícies alinhadas nesta passada.** Em `caracore-retro`: `README.md` (§ «Divulgação nas redes»), `.agents/AGENTS.md:11` e `:25`, `.cursor/rules/project-memory.mdc` e o novo `ARQUIVO_FACEBOOK.md` — pushed em `7dec21d` e corrigido em `b1e4133` (texto das publicações confirmadas), com não-perda provada: 41/42 linhas do trecho removido do README, 16/16 do `.mdc` e as duas linhas do `AGENTS.md` estão verbatim no arquivo; a única divergente é o ponteiro deste doc, trocado do caminho relativo pela URL do repositório. Aqui em `caracore-site`: esta seção e os dois adendos do `AGENTS.md` (20/11 marcado como superado).

### Campanha Facebook do Retrô — fila até fevereiro de 2027 (20/11/2026) — **estado deste dia; leitura vencida pela seção acima**

**Estado confirmado:** `caracore-retro` publicou o commit `b89c642` na `master`; o deploy do Pages concluiu com sucesso na execução `44737098411`. A fila aprovada contém os artigos **#107–#122**, sempre terça ou quinta às **09h de Brasília** (`America/Sao_Paulo`). Os rascunhos #121 e #122 tiveram as descrições sociais truncadas corrigidas antes do deploy. Não houve publicação imediata.

**Fila local não é o Planejador.** A Meta confirmou os agendamentos **#107–#112**: #107 em 26/11; #108 em 01/12; #109 em 03/12; #110 em 08/12; #111 em 10/12; #112 em 15/12. Em 20/11, as reservas duráveis `facebook-reservas` existiam para esses seis artigos e para o #148 (publicação imediata anterior). Os artigos #113–#122 estão nos arquivos `facebook_campaign_article_*.json`, mas ainda não têm reserva/ID confirmado da Meta.

**Por que o calendário parece vazio:** a Pages API aceita `scheduled_publish_time` de 10 minutos até no máximo 30 dias no futuro ([documentação oficial](https://developers.facebook.com/documentation/pages-api/posts)); em 20/11, com o horário padrão do compositor, o seletor mostrou 20/12/2026 desabilitado (19/12 era o último dia selecionável). Portanto, a semana 20–26/12 estava vazia: #113 (22/12) e #114 (24/12) ainda não podiam ser enviados. A fila não deve ser alterada nem enviada por outro caminho para “preencher” meses que ainda estão fora da janela.

O workflow `.github/workflows/facebook.yml` **rodava** (verbo no passado de propósito: ele foi removido em 24/11/2026 sem nunca ter executado) terças e quintas às **06h** e enviaria os itens aprovados entre 15 minutos e menos de 30 dias antes da publicação. Previsão, na época, das primeiras execuções que poderiam incluí-los — **nenhuma delas aconteceu**:

| Artigo | Publicação no Planejador | Primeira execução elegível prevista (06h) |
|---|---:|---:|
| #113 | 22/12/2026 | 24/11/2026 |
| #114 | 24/12/2026 | 26/11/2026 |
| #115 | 29/12/2026 | 01/12/2026 |
| #116 | 31/12/2026 | 03/12/2026 |
| #117 | 05/01/2027 | 08/12/2026 |
| #118 | 12/01/2027 | 15/12/2026 |
| #119 | 21/01/2027 | 24/12/2026 |
| #120 | 02/02/2027 | 05/01/2027 |
| #121 | 11/02/2027 | 14/01/2027 |
| #122 | 23/02/2027 | 26/01/2027 |

As datas acima são previsões baseadas no cron atual; somente o log com “A Meta aceitou o agendamento” e a reserva `ID_RECEBIDO` comprovam que o post entrou no Planejador. **Nenhuma execução aconteceu, então nenhuma previsão desta tabela se cumpriu.** A rotina automática **usava** `facebook-auto` (`FACEBOOK_PAGE_TOKEN`) e o acionamento individual manual **mantinha** revisão/aprovação no ambiente `facebook` — **os dois ambientes foram apagados em 24/11/2026 com as suas chaves**. A reserva por página/artigo impedia repetição: estado `ID_RECEBIDO` com digest igual era ignorado; estado sem confirmação ou divergente bloqueava a campanha para conferência manual. **Nunca repetir uma tentativa incerta nem agendar manualmente pela interface sem antes reconciliar a reserva e o Planejador**, pois isso pode criar duplicidade — recomendação que segue válida para o agendamento feito à mão no Business Suite.

**Referências de manutenção — todas as de máquina estão mortas desde 24/11/2026:** `.github/workflows/facebook.yml`, `tools/facebook_campaign.py`, `tools/facebook_github.py` e `test_facebook_campaign.py` **não existem mais** no `caracore-retro`; o texto das regras que eles aplicavam, com os motivos do corte e os shas das refs apagadas, está em `caracore-retro/ARQUIVO_FACEBOOK.md`. O que permanece vivo como documento: `caracore-retro/README.md` (seção «Divulgação nas redes» — Facebook à mão, LinkedIn automático) e esta seção como histórico. **A conta dos 68 fecha no medir:** eram `test_facebook_campaign.py` 36 + `test_facebook_drafts.py` 17 + `test_facebook_github.py` 15 = **68**, exatamente a classe «campanha/rascunhos/reservas» registrada em 20/11. Somavam-se a eles os 12 métodos por artigo (`…_148.py` 5 + `…_149.py` 7), removidos em 21/11 e substituídos por 12 métodos da rota genérica. **Hoje restam 0 arquivos de teste de Facebook no `caracore-retro`** (a árvore só tem `test_blog.py`, `test_publish_linkedin_schedule.py` e `tools/test_social_metadata.py`); os cinco módulos acima saíram no corte `6f26d38`. A última execução automática com seis confirmações foi `44735784711`; o deploy da extensão até fevereiro foi `44737098411`.

### SEO dos três sites — publicação e verificação final — 19/11/2026

O alinhamento de metadados sociais, JSON-LD e validação foi publicado nas três superfícies:
Retrô `7016f65`, Personal `3a847a3` (seguido do commit de feed `3257f0e`) e matriz
institucional `0e68d84` (junto com `703ff3b`). Os workflows de deploy/validação e Pages
concluíram com sucesso. A verificação pública confirmou sitemaps com 150 URLs no Retrô,
284 no Personal e 10 na matriz; o feed do Personal tem 277 artigos. O artigo 148 responde
200, declara `datePublished` `2027-09-07` e a imagem responde 200. A rota inexistente da matriz
responde HTTP 404 com página personalizada, `noindex` e sem JavaScript ou stylesheet externo.

Os workflows de LinkedIn concluíram sem novas postagens; Facebook não foi acionado. Os
sitemaps dos blogs continuam pendentes de envio ao Search Console pelo proprietário. Evidência
detalhada e IDs dos workflows: `docs/INDEXACAO_SEO.md`.

### Capas da home do blog pessoal — 15/11/2026 (correção publicada)

A home de `personal.caracore.com.br` monta os cards em JavaScript (`caracore-personal/docs/articles/assets/js/main.js`) e resolvia a capa **só pela data do artigo** (`<data>_IMAGE_001`). Como a trilogia *A Engenharia do Choque Controlado* tem quatro textos na mesma data (14/11/2026), os quatro cards exibiam a `2026_11_14_IMAGE_001.webp`, apesar de as imagens 002/003/004 existirem e cada página de artigo usar a sua.

**Correção publicada:** commit `98f57d8` no `caracore-personal` (só o `main.js`, 11 linhas novas e 1 trocada), com push para `master` e Pages `built` em 101.882 ms no commit seguinte, `2a3f51e` (o bot do blog cria esse commit de feed/sitemap). O `main.js` servido tem SHA-256 `7a382803…011132`, idêntico ao arquivo local. A resolução da capa passou a ser **`coverByArticle[slug do artigo]` → `coverFallbacks[data]` → `<data>_IMAGE_001`**, ou seja, **o artigo vem antes da data**. Entraram cinco entradas: `ep01`→`002`, `ep02`→`003`, `ep03`→`004` (a chamada já caía na `001`) e, por terem o mesmo defeito latente, `2026_04_23_a_ressaca_da_ia…`→`002` e `2026_04_30_a_era_da_ia_costurada…`→`002`.

**Prova medida:** varredura dos 276 cards do arquivo mostrou **apenas essas cinco capas alteradas** (as três restantes que divergem do hero do próprio artigo são quedas de data intencionais, anteriores); na home publicada, os 276/276 cards foram montados sem nenhum fallback para `.png`, cada capa confere com o hero do seu artigo e as imagens respondem 200 com bytes iguais aos locais.

**Regra para outras IAs:** artigo novo que **divide a data** com outro e tem imagem própria (`_IMAGE_002+`) precisa de linha em `coverByArticle` antes do commit — sem ela, todos os cards daquela data repetem a `_IMAGE_001`. Regra de ouro: **a capa do card é a mesma imagem que o artigo usa como hero.** O detalhe mora em `caracore-personal/AGENTS.md` §3.1 item 4, na regra `.cursor/rules/blog-personal-workspace.mdc` e em `.agents/AGENTS.md` § Convenção de Imagens.

### Publicações dos blogs — 14/11/2026

**Retrô — artigos 145 e 146:** publicados no blog em `https://retro.caracore.com.br/articles/2027_08_17_article_145.html` e `https://retro.caracore.com.br/articles/2027_08_25_article_146.html` (ambos responderam HTTP 200). O commit `b9c9609` foi publicado pelo workflow `43593863756`, com `validate`, `deploy` e `publish-linkedin` concluídos. LinkedIn: artigo 145 `urn:li:share:7527343782082535424`; artigo 146 `urn:li:share:7527343790320431105`.

**Blog pessoal — dois artigos da série A Evolução Cíclica da TI:** páginas no ar (HTTP 200): [Ato I, 19/11](https://personal.caracore.com.br/articles/2026_11_19_serie_evolucao_ciclica_ti_ato01_passado.html) e [Ato II, 23/11](https://personal.caracore.com.br/articles/2026_11_23_serie_evolucao_ciclica_ti_ato02_presente.html). A pedido do dono, ambos foram publicados antecipadamente no LinkedIn em 14/11: Actions `43594621070` (Ato I, `urn:li:share:7527345675974635520`) e `43594730483` (Ato II, `urn:li:share:7527346023921479680`), sucesso com `DRY_RUN=false`. O ledger foi atualizado pelo workflow.

**Cuidado com o histórico do blog pessoal:** o ledger já listava esses dois artigos antes, mas isso não refletia uma publicação real; a execução antiga `34722217279` (12/09) era `DRY_RUN=true` e apontava para outro artigo. Para confirmar publicação, conferir no log do Actions `DRY_RUN=false` e a mensagem `Artigo publicado no LinkedIn` com o URN. O `workflow_dispatch` publica imediatamente (não agenda); `dry_run` tem padrão `true` e `force=true` ignora o ledger, então só usar com autorização e após verificar o histórico do artigo.

### Agendamento LinkedIn — 14/11/2026

Os workflows de `caracore-retro` (`ee99cc2`) e `caracore-personal` (`39bfebb`) foram ativados em `master` para publicar artigos pela data editorial às **07h30 em `America/Sao_Paulo`**. O início de um workflow agendado pode atrasar por fila do GitHub Actions; a hora não é uma garantia de execução exata. A seleção de código limita publicações agendadas a 2026, até 31/12, e pushes não publicam antecipadamente artigos dessas datas.

**Retrô:** agenda #109 em 30/11; #110 em 03/12; #111 em 08/12; #112 em 12/12; #113 em 18/12; #114 em 20/12; #115 em 25/12; #116 em 30/12. Todas as oito páginas responderam HTTP 200. O push da configuração passou no Actions `43596389605`. Por autorização, o #108 (14/11) foi publicado com atraso no LinkedIn pelo workflow `43596519937`, com sucesso e thumbnail: `urn:li:share:7527351856835133440`; o ledger foi atualizado pelo bot no commit `76ff62a`.

**Blog pessoal:** agenda 16/11, 27/11 e 30/11; 05/12, 10/12, 15/12, 22/12 e 29/12. As oito páginas responderam HTTP 200. O ledger foi limpo apenas para esses artigos, cujos registros antigos eram marcações de 12/09 sem evidência de publicação. Ato I (19/11) e Ato II (23/11) foram excluídos porque já foram publicados antecipadamente em 14/11 (Actions `43594621070` e `43594730483`). O episódio de 26/11 de “O Silêncio na Escala” não entrou na agenda porque o ledger o marca como publicado em 10/10; a lista de execuções atualmente acessível não contém evidência para confirmar esse post. Em 14/11, o dono confirmou mantê-lo fora da agenda para evitar uma possível duplicidade.

### Relançamentos no LinkedIn — 14/11/2026 (agenda de abril e maio de 2027)

A trilogia *A Engenharia do Choque Controlado* (chamada + ep01–ep03) foi **antecipada** para 14/11/2026: as quatro páginas passaram a `2026_11_14_serie_engenharia_urgencia_*`, com imagens, home e `ciclo-ativo.html` no dia novo, e os quatro posts saíram no LinkedIn no mesmo dia com thumbnail, um por `workflow_dispatch` (`force=true`, `dry_run=false`): chamada `43650577716` `urn:li:share:7527504559997628416`; ep01 `43650639356` `urn:li:share:7527504772547895296`; ep02 `43650703980` `urn:li:share:7527504977783787520`; ep03 `43650769923` `urn:li:share:7527505177927454720`. Por decisão do dono, as datas editoriais originais ficaram registradas como **relançamento**: 20/04 (chamada), 26/04 (ep01), 06/05 (ep02) e 16/05/2027 (ep03).

O registro vive no próprio blog, em `caracore-personal/linkedin_republicacoes.json` (`data → arquivos`), e é a **única** exceção ao bloqueio de datas fora da janela de 2026 do agendador: no modo agendado o script soma esses arquivos aos artigos do dia e ignora o ledger (`linkedin_published.json`) **somente** para eles. O workflow ganhou os crons `30 7 20,26 4 *` e `30 7 6,16 5 *` (`America/Sao_Paulo`), além de três testes novos; a bateria local ficou em 25 testes verdes.

Os endereços antigos (`2027_04_20_*`, `2027_04_26_*`, `2027_05_06_*`, `2027_05_16_*`) são páginas `noindex` de redirecionamento para os atuais e ficaram fora de `feed.xml`, `sitemap.xml` e do validador de metadados (`SKIP_NAMES`/`REDIRECTS`), para não virarem artigos duplicados.

**Pré-requisitos para outra IA retomar em 2027:** (a) o `LINKEDIN_ACCESS_TOKEN` gerado em 10/11/2026 expira ~09/01/2027 — renovar antes de abril; (b) o GitHub desativa workflow agendado após 60 dias sem atividade no repositório — reativar em Actions e conferir com `workflow_dispatch` (`dry_run=true`); (c) se a execução falhar, publicar à mão com `workflow_dispatch` (`force=true`, `dry_run=false`), que publica imediatamente; (d) a imagem de capa é a mesma dos artigos (`2026_11_14_IMAGE_001..004.png`). O estado detalhado do blog está em `caracore-personal/AGENTS.md` § "Republicações registradas" e na regra `.cursor/rules/blog-personal-workspace.mdc`.

### Checkpoint 10/11/2026 — estado do ecossistema para retomada (fim do dia)

**Comece por aqui.** Se você é outra IA e está retomando o ecossistema, este é o retrato medido no fim de 10/11/2026; os blocos datados abaixo são histórico, não estado.

**Núcleo público — quatro produtos (decisão do dono em 09/11/2026):**

| Produto | O que está no ar hoje | Próximo marco / limite |
|---|---|---|
| **PDV Java** | **`v4.0.0` lançada em 08/11/2026.** Release publicada em 06/11/2026 em `caracore-pdv4-releases` (tag `v4.0.0`): ZIP portátil Windows 10/11 x64 de 176.613.179 B, SHA-256 `9557e0b16d77a85e0bb68971eb0e8710356977261337a8c1c05593e893d81eac`, `SHA256SUMS` com duas assinaturas Ed25519. A `v3.2.12-free` é a **versão anterior**, com manutenção encerrada em 08/11/2026 e pacotes ainda disponíveis. | A 4.1.0 (Appmax/PlugNotas) existe só em branch e **não** se anuncia. SCA por OSV (NVD não medido). `PERF-001–007` congeladas. |
| **CSO Frotas** | Gestão de frota FRO 24/24 **no ar** desde 06/10 (`b90d1dc`, Flyway V33). Em 10/11 passou a servir os próprios assets — **sem Cloudflare, sem CDN e sem Turnstile** (`f395c10`) — e o cadastro voltou a gravar (V34, `22bee2d`). | Freeze M1 aplicado em 08/11/2026. Transportes + VT têm alvo conjunto em 08/11/2028, sujeito aos gates INT. Sem GPS hoje. |
| **Hub** | Pré-release Windows **`v2.1.0-rc1.10`** (07/11/2026, ZIP portátil 228.354.977 B, SHA-256 `0b18fbcf3af02d53a341ac5b83af9132a0ef201e698585160f332d3ad8bdae00`, unsigned), com base de atualização assinada Ed25519 embutida. Web 2.1 concluída; SQLite local no computador do cliente. | **Aceite de QA da `rc1.10` pendente** — a rodada 5 reprovou a `rc1.7` (N1/N2); B7 fechado em 07/11 e S6.9 aberto. GA Windows 06/04/2027. Não é GA e não foi homologada. Mac e Linux fora desta tag. |
| **Ink Agenda** | Desktop **`v2.2.1`** (Latest, 04/11/2026), Windows (setup/ZIP) e Linux (`.deb`), unsigned, três perfis e equipe com papéis. | Desktop **2.3.0** planejado para **29/01/2027** — Onda 1 fechada tecnicamente e empurrada em `3381aa3`; a homologação manual de **15/11/2026** fechou H-A04, H-C04, H-C06, H-B02 e H-B03, com H-A09 parcial e H-B01 pendentes do relogin do dono e o H-A08 escorregado para dez/2026. **Ponto de parada registado em 15/11/2026:** a retomada de H-B01/H-A09 entra na cota de **dez/2026**, em sandbox nova com senha e frase de recuperação anotadas pelo dono. 3.0 em PWA **não antes de 2028**. |

**Regra de superfície (fixada em 10/11/2026):** nenhuma superfície publicada depende de CDN externo, Cloudflare ou equivalente — matriz, wiki, lojas, blogs, Sala e Central servem os próprios assets, com layout equivalente em mobile, tablet e desktop. Medido em 21 superfícies sem carga de CDN. GA4 só depois do aceite (Consent Mode v2): matriz, wiki, quatro lojas do núcleo e blog pessoal (este último corrigido em 10/11, `df71835`).

**Operação e segurança do CSO (10/11/2026):**

- O Postgres de produção está no plano **HOBBY** do Railway: **não tem PITR, bucket nem backup agendado** do provedor (`railway postgres history`).
- A proteção passou a ser **rotina própria de dump diário** em `E:\CC_BAK_CSO` (HD removível): `pg_dump -Fc -Z9` por `railway ssh`, 30 arquivos de retenção, log, `sha256`, checagem de TOC contra as 22 tabelas e **restauração provada** em container descartável `postgres:18`. É dump diário, **não** PITR: perde-se até o dia.
- A **senha do usuário `postgres` foi rotacionada** em 10/11/2026 (escopo autorizado): 6 variáveis literais (`Postgres`: `POSTGRES_PASSWORD`, `PGPASSWORD`, `DATABASE_URL`; `caracore-cso-quarkus`: `DATABASE_PASSWORD`, `PGPASSWORD`, `DATABASE_URL`), `ALTER USER`, deploy `f7b103d8` SUCCESS e `/q/health/ready` UP com o check de banco. Prova positiva e negativa **pela rede privada** — o loopback é `trust` e daria verde falso.
- O banco **não tem endpoint público**; responde só em `postgres.railway.internal`.

**Pendências abertas ao fim do dia (não presumir fechadas):**

1. **Hub:** aceite de QA da `rc1.10` e **S6.9** — mapa em `caracore-hub/docs/status-hub-ga-2027-20261025.md`.
2. **Ink:** retomada de H-B01/H-A09 na cota de **dez/2026** (sandbox nova, senha e frase anotadas pelo dono) e **H-A08** (restore de `.inkbak` 2.2.1) no mesmo mês; H-A04, H-C04 e H-C06 executados em 15/11/2026.
3. **CSO, decisão do dono:** PITR/Pro (pago) versus a proteção atual de dump diário; apagar o `tokens.txt` local (gitignored) que guarda a credencial antiga e mais dois segredos, já sem valor de acesso.
4. **CSO, limpeza em produção:** o smoke criou o tenant `2` (`SMOKE QA CSO 20261110`) e o usuário `53`, removíveis em `/ops/tenants/2/purgar` com a sessão do dono.
5. **Matriz:** 2 conflitos sitemap × `noindex` no Ink sem decisão (`docs/INDEXACAO_SEO.md`).
6. **Local e não publicado:** rodapé de `caracore-loja/docs/index.html` alinhado ao núcleo de quatro produtos, **sem commit**.

**Onde cada frente continua:** PDV → `caracore-pdv/AGENTS.md` · CSO → `caracore-cso-quarkus/docs/` · Hub → `caracore-hub/docs/contexto-rapido.md` · Ink → `caracore-ink/AGENTS.md` e `docs/ROADMAP_P1.md` · regras de ecossistema → `caracore-site/AGENTS.md` e `.cursor/rules/ecosystem-cara-core.mdc`.

### Blog pessoal — trava de consentimento do GA4 publicada no `analytics.js` (10/11/2026)

**O furo, medido antes da correção:** em perfil limpo, `personal.caracore.com.br` carregava o `gtag.js` e gravava `_ga` e `_ga_MKFC9G3CL0` em `.caracore.com.br` na própria carga, **sem consultar consentimento e sem banner** — 2 requisições a `googletagmanager.com` e 2 cookies antes de qualquer clique. Era o único ponto do ecossistema fora da trava: as outras 18 superfícies medidas não faziam requisição externa nenhuma.

**O que passou a valer** (`caracore-personal`, `docs/articles/assets/js/analytics.js`), no mesmo padrão da matriz:

- **Consent Mode v2** com `ad_storage`, `ad_user_data`, `ad_personalization` e `analytics_storage` negados por padrão (`wait_for_update: 500`), com `consent update` a cada decisão.
- **Chave `cc-ga-consent`** (`granted`/`denied`) com data em `cc-ga-consent-date` e **migração da chave legada `lgpd-consent`** (`accepted`/`declined`).
- **Banner injetado** (`#cc-consent`, `role="dialog"`, `aria-live="polite"`) com **Aceitar** e **Recusar** de 44 px, texto que diz que a medição é de audiência e que recusar não altera o funcionamento do site, com link para a Política de Privacidade.
- **`gtag.js` só depois do aceite**: o adiamento por interação ou `requestIdleCallback` passou a existir apenas dentro do caminho de consentimento concedido.
- **Ao recusar**, `_ga`, `_gid` e `_gat` são apagados no domínio `.caracore.com.br` e no host; ao aceitar, a tag carrega na hora.

**Publicação em 10/11/2026:** commit `df71835` (`b416c53..df71835`); em seguida o bot do próprio repositório criou `d73b8d7` (`chore: atualiza feed.xml, sitemap.xml... [skip ci]`) e o Pages ficou `built` nesse commit em **118.217 ms**. O arquivo servido é byte a byte o local: **7.605 B**, SHA-256 `b282fd2431a10328fc9f73e1b0460f080e76f086ae39864dc824aa8bdbe2c2cf`.

**Cenários medidos no site publicado** (Chrome real, contextos isolados, rede de verdade):

| Cenário | Banner | Requisições ao Google antes da ação | Cookies `_ga` | Depois da ação |
|---|---|---|---|---|
| Primeiro acesso | visível | 0 | 0 | — |
| Clica **Recusar** | — | 0 | 0 | banner some, segue 0 requisição, 0 cookie, `cc-ga-consent=denied` |
| Clica **Aceitar** | — | 0 | 0 | banner some, 2 requisições, `_ga` + `_ga_MKFC9G3CL0`, `cc-ga-consent=granted` |
| Já aceitou antes | não aparece | 2 | 2 | — |
| Já recusou antes | não aparece | 0 | 0 | — |
| Chave legada `lgpd-consent=accepted` | não aparece | 2 | 2 | migração tratada como aceite |

**Cobertura:** 280 das 282 páginas HTML — 3 carregam o `analytics.js` direto (dois artigos de 2025 e `ciclo-ativo.html`, sem `main.js`) e 277 o recebem pela injeção do `main.js`; as 2 restantes (`articles.html` e um `README.html` em `assets/img`) não rastreiam. Verificado ao vivo nas 3 diretas e numa amostra das injetadas: 200, script presente, banner renderizado e 0 requisição ao GA antes do clique.

**Layout ao vivo:** barra de 390×147 ancorada no rodapé em 390×844 e de 1366×73 em 1366×768, botões de 85×44 e 89×44, sem rolagem horizontal.

**Ressalva registrada:** o `analytics.js` é referenciado sem `?v=` e o GitHub Pages serve com `Cache-Control: max-age=600`; quem tinha a versão antiga em cache pode continuar disparando o GA sem consentimento por até 10 minutos após o último acesso, até o arquivo expirar.

**O que não mudou:** nenhuma versão de produto, data ou gate — PDV `v4.0.0`, Hub `v2.1.0-rc1.10`, Ink Desktop `v2.2.1` e CSO Frotas seguem como estavam; o blog continua com 282 páginas e nenhum asset externo além do GA4, agora condicionado a consentimento.

### Regra de superfície local e lote de assets publicado (10/11/2026)

**Regra fixada para todo o ecossistema:** nenhuma superfície publicada depende de CDN externo ou de Cloudflare ou equivalente; matriz, wiki, lojas, blogs, Sala e Central servem os próprios assets e abrem por servidor local, com layout e desempenho equivalentes em **mobile, tablet e desktop**. Serve de referência o que já foi vendorizado: Font Awesome subsetado, Inter, Montserrat, Source Sans 3, Sora, IBM Plex Mono, Fira Code, Tailwind compilado, mermaid, swagger-ui e Bootstrap Icons subsetado; as `base href` saíram de ETE, Circuito, Seed e RU.

**Lote fechado e publicado em 10/11/2026** (push + Pages `built` + conferência ao vivo):

- **Navbar da loja OIDC** (`caracore-oidc-releases` `1eb9b0b`): em ≥992 px o `.navbar-nav` quebra em 2 linhas alinhadas à direita (`flex-wrap: wrap` + `justify-content: flex-end` + `padding`/fonte menores); medido 0 overflow de 992 a 1600 px, 2 linhas, links de 34 px (rótulo em uma linha) e, abaixo de 992 px, nada muda (hambúrguer, 56–57 px). A regra está em `docs/assets/css/style.css` (14 páginas) e no `<style>` de `upgrade-trono.html`.
- **Favicon das seis lojas** (`area51` `719c237`, `mkt` `4ddb23a`, `ete` `8f6e770`, `circuito` `25e8cb8`, `seed` `0911e99`, `tools` `9e47694`): 190 páginas passam a declarar `<link rel="icon">` no `<head>`; as seis lojas usam o ícone institucional (`sha256 9e6a6894…`, 32.038 B), substituindo o selo "RU 1991" copiado do template (2.840 B), e `caracore-tools` ganhou o arquivo que não tinha. Verificação estática: 190/190 com exatamente um `rel="icon"` dentro do `<head>` e href que resolve; no navegador, 0 requisição a `/favicon.ico` e 0 resposta 404.
- **Ícone órfão da loja PDV** (`caracore-pdv-releases` `6fe7d0c`): `docs/assets/css/bootstrap-icons.min.css` removido — nenhuma página o referenciava, nenhuma classe `bi-*` existia e o `@font-face` apontava apenas para o jsDelivr, sem woff/woff2 local. As 56 páginas da loja carregam sem resposta 4xx e o caminho responde 404.

**Armadilha de operação:** os builds de Pages de `ete` e `circuito` saíram `errored` com `duration=0` e sem mensagem, ambos no mesmo segundo — falha de infraestrutura, não de conteúdo; o rebuild por `POST /repos/{owner}/{repo}/pages/builds` passou (243 s e 225 s, contra os 50–65 s habituais nesses dois repositórios).

**O que não mudou:** nenhuma versão dos quatro produtos foi tocada — PDV `v4.0.0` (lançada em 08/11/2026), Hub `v2.1.0-rc1.10` (pré-release, aceite pendente; GA Windows 06/04/2027), Ink Desktop `v2.2.1` (2.3.0 planejado para 29/01/2027, não publicado) e CSO Frotas no ar desde 06/10 (freeze M1 em 08/11/2026; Transportes + VT em 08/11/2028).

### CSO Frotas — aplicação servida local, sem Cloudflare nem CDN (10/11/2026)

**Publicado em 10/11/2026** na oficina `caracore-cso-quarkus`: commit `f395c10` (`3482282..f395c10`), CI `Quarkus CI Pipeline`
`42869460638` = `success` e deploy do Railway no mesmo commit = `SUCCESS`. Nenhuma outra superfície foi tocada.

**O que saiu do código:** `TurnstileCaptchaService` (única chamada a `challenges.cloudflare.com`) apagado; widget e `<script>`
do Turnstile fora de `/cadastro` e `/auth/setup-senha`; chaves `CSO_CAPTCHA_*` fora do `application.properties`, do workflow
e do `pipeline_local.py` (que reprovava produção sem `CSO_CAPTCHA_ENABLED=true`); Google Fonts e o Pico via jsDelivr fora das
17 telas. Pico CSS 2.1.1 (83.319 B) e Inter variable latin/latin-ext (48.256 B + 85.068 B) passam a sair da própria aplicação.
O anti-bot do cadastro continua o de antes: honeypot `website`, `formToken` HMAC e rate limit por IP.

**Vídeo da landing:** o iframe do YouTube era a última requisição externa em tempo de carga; virou fachada click-to-load com
capa local (`/img/landing-video.jpg`, 82.075 B, 1280×720) e `/js/landing-video.js`, que monta o iframe `youtube-nocookie` só
no clique. A caixa é a mesma (`inset: 0` no mesmo frame 16:9), então o layout não muda.

**Medido no ar (`cso.caracore.com.br`):**

- **CSP:** `default-src 'self'`, `font-src 'self' data:`, `connect-src 'self'`, sem `challenges.cloudflare.com` e sem CDN;
  a única origem externa é `frame-src https://www.youtube-nocookie.com https://www.youtube.com`.
- **Assets:** `/css/pico.min.css` 200 com 83.319 B, `/fonts/inter-latin.woff2` 200 com 48.256 B,
  `/fonts/inter-latin-ext.woff2` 200 com 85.068 B, `/js/landing-video.js` 200 e `/img/landing-video.jpg` 200.
- **Landing no Chrome:** 10 recursos, **todos do próprio host, 0 domínio externo**, Inter carregada do local e nenhum iframe
  antes do clique; o clique real na capa monta `https://www.youtube-nocookie.com/embed/QxDKWjRASsI?autoplay=1` com
  `allowfullscreen` e a fachada desaparece.
- **Telas com `base.html`** (medidas na página de erro 404, que usa o mesmo layout): `pico.min.css?v=20261110` carregado e
  aplicado, 0 recurso externo.
- **`/cadastro`** 200 sem menção a Turnstile/Cloudflare, com `name="website"` e `name="formToken"` presentes; `/login` e
  `/ops/login` 200 com 0 referência externa.
- **Saúde:** `/` 200, `/q/health` e `/q/health/ready` `UP` (inclui o banco) e `/q/openapi` 404 — o checklist do README segue
  verdadeiro.

**O que não mudou:** nenhuma versão, tag, loja ou data de produto. O CSO Frotas segue no ar desde 06/10 e a captação continua
com as três camadas locais.

### CSO Frotas — cadastro em 500 por sequence do seed, corrigido na V34 (10/11/2026)

**Medido no ar:** o smoke de cadastro com dados válidos devolvia **500** e o log do container mostrava `duplicate key value
violates unique constraint "tenant_pkey"`, `Key (id)=(1)`, em `TenantService.criarComPlano`. Causa: `V3__seed_cso.sql` insere
o tenant de demonstração com **id explícito**, caminho em que o Postgres não avança a sequence; a `V13` religou as sequences
das tabelas `tb_*` mas deixou `tenant` de fora. O primeiro `nextval` devolvia 1 e colidia com o seed — ou seja, **nenhum
cadastro novo gravava**, e não era caso de borda.

**Correção publicada** na oficina `caracore-cso-quarkus`: commit `22bee2d` (`f395c10..22bee2d`), CI `Quarkus CI Pipeline`
`42873488518` = `success` e deploy do Railway no mesmo commit = `SUCCESS`. `V34__resync_sequences_seed.sql` faz
`setval(pg_get_serial_sequence('tenant','id'), GREATEST((SELECT COALESCE(MAX(id),1) FROM tenant),1))`; o Flyway aplicou no
boot (`Current version 33` → `Migrating to version 34` → `now at version v34`). `tb_cambio_referencia` ficou fora: o `id` dela
é `SMALLINT` explícito, sem sequence — um `setval` ali devolveria NULL e derrubaria o boot.

**Prova do fluxo completo:** `GET /cadastro` 200 com `formToken`; `POST /cadastro` com dados válidos → **200** com a página
de chave de recuperação e os cookies de sessão; `GET /api/v1/usuarios` com essa sessão → usuário `53`, `tenantId` `2`,
perfil `ADMIN`; `/dashboard` → `303` para `/lgpd/termos`, o onboarding do tenant novo. O POST antes da correção devolvia o
500 e a transação era revertida — nada ficou pela metade.

**Lixo de teste:** o smoke criou o tenant `2` (`SMOKE QA CSO 20261110`, sem CNPJ) e o usuário `53`
(`smoke.qa.20261110@example.com`); a remoção é pelo painel de Ops (`/ops/tenants/2/purgar`), que exige a sessão do dono.

### Núcleo público passa a quatro produtos — PDV, CSO, Hub e Ink Agenda (09/11/2026)

**Decisão do dono em 09/11/2026:** os produtos principais deixam de ser três e passam a **quatro** — **PDV**, **CSO**,
**Hub** e **Ink Agenda**. Todo o resto (PDV Rust piloto, Minerador, BioReator, OIDC, Circuito, Seed, Helianto, MKT,
Área 51) fica **fora do núcleo**: continua existindo e com loja, mas **não pode disputar headline, CTA, posição de catálogo nem
espaço de destaque** com os quatro principais. A ordem canónica de leitura (prosa e cards) ficou **PDV, CSO, Hub,
Ink**, idêntica em matriz, loja e wiki.

**O que mudou (só ficheiros locais — nada commitado nem publicado):** na **Central de Downloads**
(`caracore-loja`) o quarto produto entrou na vitrine e a lista de destaques segue a ordem nova. Na **matriz**
(`caracore-site`) `index.html`, `ecosistema.html`, `portfolio.html` e `planning.html` já traziam o Ink como
`PRODUTO 04`; nesta passagem as fontes de dados em JS (`catalog-data.js`, `planning-data.js`, `planning.js`) foram
conferidas e o `NOTE`/`notInEnvelope` passaram a dizer "principais: PDV, CSO, Hub e Ink Agenda". Na **wiki**
(`caracore-wiki`): `ecosistema.html` (linha de núcleo com quatro cartões e o trio "Demais produtos" sem Ink),
`projetos-overview.html` (catálogo renumerado 1…13 com os quatro primeiros primeiro e o Ink em `#caracore-ink`),
`trilha-cliente.html` (quarto cenário de Ink e selo "PDV, Hub, CSO, Ink"), `status.html` (acordeão próprio do Ink;
a linha saiu de "Demais produtos"), `index.html` (quarto cartão `.wiki-product--ink` e o link "Agendar e Receber"),
`trilha-socio.html`, `guia-estagiario.html` e `assets/js/wiki-search.js`; `wiki-responsive.css` ganhou o grid de
quatro colunas no desktop. Nos canónicos: `AGENTS.md` (parágrafo do núcleo, tabela de produtos e nota datada),
`docs/RISCOS_ECOSSISTEMA.md`, `docs/CALENDARIO_COTA_CURSOR.md`, `docs/VALIDACAO_NEGOCIO.md`,
`docs/INICIAR_NOVA_TAREFA.md`, `.cursor/rules/ecosystem-cara-core.mdc` e `docs/PORTFOLIO_README.md` do workspace.

**O que não mudou:** nenhuma versão, data ou gate foi tocado por esta decisão. O **Ink Desktop 2.3.0** continua
**planejado para 29/01/2027** com conteúdo **não publicado** (Onda 1 fechada tecnicamente em 08/11/2026; homologação de
15/11/2026 executada com H-C04, H-C06, H-B02 e H-B03 conformes, H-A09 parcial e H-B01 em dez/2026), o **Hub** segue em **`v2.1.0-rc1.10`** com aceite de QA pendente e GA em
06/04/2027, o **CSO Transportes + VT** mantém o alvo de **08/11/2028** e a **linha 4.1.0 do PDV**
(Appmax/PlugNotas) **não se anuncia**. A **cota não ganhou dias**: continua **um produto pesado por ciclo** e a
fatia de **5 dias/mês** do Desktop 2.3.0, que **cede** se o núcleo precisar — o Ink ter entrado no núcleo muda a
vitrine, não o envelope.

### PDV v4.0.0 lançada em 08/11/2026 — matriz e wiki realinhadas (09/11/2026)

**Estado:** a **v4.0.0 foi lançada em 08/11/2026** e é a versão indicada para operar no Windows 10/11 x64
(launcher no Edge, banco `./data/caracore-pdv.db`). A release foi publicada em **06/11/2026** em
`chmulato/caracore-pdv4-releases` (tag `v4.0.0`): ZIP portátil de **176.613.179 B**, SHA-256
`9557e0b16d77a85e0bb68971eb0e8710356977261337a8c1c05593e893d81eac`, `SHA256SUMS.txt` assinado com duas
chaves Ed25519. No ZIP: T032 **17/17**, matriz **11/11** (M11, desempenho, **não medido**), banco 3.2.12
migrado **9/9** (047→052) e sonda **20 aprovadas / 0 reprovadas / 1 não coberta / 0 bloqueadas**; o canal
`pdv-v4` serve esse hash e a aplicação do pacote é **manual**. SCA = OSV de 06/11/2026 (275 pacotes, 1
achado alto triado por byte); **NVD não medido** — nunca "0 CVE". A **`v3.2.12-free` é a versão anterior**,
última da linha 3.2.x, com manutenção encerrada em 08/11/2026 e pacotes ainda disponíveis para Windows,
Linux e macOS. Migração: backup antes; copiar `%APPDATA%\caracore\caracore-pdv.db` para
`data\caracore-pdv.db` **antes da primeira abertura**; a v4 não desfaz venda finalizada. **Não anunciar a
linha 4.1.0** (Appmax/PlugNotas, em branch).

**Nesta passagem (só ficheiros locais, nada commitado nem publicado):** as páginas públicas da matriz
(`index.html`, `ecosistema.html`, `portfolio.html`, `planning.html`) e os dados em JS
(`catalog-data.js`, `planning-data.js`, `planning.js`) passaram a dizer v4.0.0 atual e 3.2.12 anterior; na
wiki, `projeto-pdv.html` (incluindo a seção de migração), `projetos-overview.html`, `glossario.html`,
`tecnologias.html`, `status.html`, `projeto-ink.html`, `projetos-overview.html`, `guia-estagiario.html`,
`trilha-cliente.html`, `trilha-estagiario.html`, `ecosistema.html`, `projeto-pdv-rust.html` e `pdv/usar.html`
foram alinhados. A **Ink Desktop 2.3.0** aparece como **planejada para 29/01/2027** (Onda 1 fechada
tecnicamente em 08/11/2026; prints e homologação de release pendentes) e o **Hub** segue em
**`v2.1.0-rc1.10`** com aceite de QA pendente e GA em 06/04/2027. O `AGENTS.md` da matriz usa codificação
legada e guarda blocos datados de 08/11 dizendo "pacote GA ainda não existe": são **histórico** e estão
superados por este registro. Em 09/11/2026 a gravação foi controlada por bytes (só o cabeçalho, o parágrafo do
núcleo e a tabela de produtos), sem reescrever o ficheiro; a nota datada no topo declara o que ler como histórico.

### Ink Agenda — Onda 1 da P1 fechada tecnicamente, inclusive o ramo de agendamento (08/11/2026)

**Estado:** Desktop **2.3.0** (P1 Onda 1, release em **29/01/2027** — data decidida em 08/11/2026; era 06/04/2027, o dia do GA do Hub) com **P1.1** e
**P1.2.1** em 06/11/2026 e **P1.2.2–P1.2.8**, **P1.3.1–P1.3.4** e **G1** em 08/11/2026 — 17 de 17
sub-itens (o **P1.2.8** nasceu do plano de alinhamento e fechou AL-01/AL-02 no mesmo dia). Nada
publicado: o produto no ar continua o **Desktop 2.2.1** e o canal segue keyless desde 07/11/2026.
A **homologação de prints** ficou para 15/11/2026 (resultado no parágrafo seguinte). A data da entrega foi revista no mesmo dia de 06/04/2027 para **29/01/2027**: o corte cai na Fase 2A do Hub (G2 em 05/02) e mar–abr/2027 ficam intocados; a fatia gasta nov+dez+jan (15 dias) e devolve **13 dias (fev–abr) ao envelope do núcleo**.

**Homologação manual de 15/11/2026 (sandbox B1):** H-A04, H-C04, H-C06 e o bloco dos dois logins executados com prints e contagens locais (pasta `docs/evidencias/homolog-p1-20261115/`, fora do Git) — **conformes** H-C04, H-C06, H-B02 e H-B03; **H-A09 ficou parcial** (login da Ana provado, relogin do dono não executado) e **H-B01 pendente**; o **H-A08 escorregou para dez/2026** (falta um `.inkbak` 2.2.1) e o aceite formal continua no P1.11.4. Nada publicado e nenhum caso muda de status por intenção. **Ponto de parada (15/11/2026, a pedido do dono):** nov/2026 fechou com **5 de 5 dias** (14/11 foi o P1.2.9; 15/11, a homologação) e a retomada de H-B01/H-A09 vai para a cota de **dez/2026**, em sandbox nova em que o dono anota senha e frase de recuperação no gerenciador dele — a senha da B1 não foi anotada e não há como recuperá-la, por isso a sessão parou em vez de insistir. O passo a passo da retomada e o retrato da base B1 no fecho estão em `../caracore-ink/agenda-java/docs/CHECKLIST_HOMOLOGACAO_P1.md` (secção «Retomada da homologação — estado em 15/11/2026») e o registro datado, em `../caracore-ink/docs/ROADMAP_P1.md` («Estado e bloqueios», commit `8333f63`).

**Ramo de agendamento (P1.2.6/P1.2.7):** a **V30** acrescenta `attends_sessions` e `specialty` a
`app_users`. O cadastro de equipe pergunta «Atende sessões» e a especialidade; a **recepção** agenda
para todos mas **não entra no seletor**, e o perfil Financeiro nunca atende. O seletor de
profissional existe no diálogo do dia **e no fluxo de Clientes**, e o conflito de horário é por
profissional. A copy segue a skin do nicho — Tatuador(a)/Tatuadores, Dentista/Dentistas,
Profissional de beleza/Profissionais de beleza — sem criar personagens novos. A visão «minha agenda»
(filtro «Todos / Só a minha») fica no **P1.4 (Onda 2)**; o 2.3.0 mantém a visão compartilhada do dia.

**Alinhamento de congruência (P1.2.8, 08/11/2026):** o import do CSV de recuperação passa o
profissional ao detector de conflito (dois profissionais no mesmo horário entram os dois) e o
vocabulário por nicho cobre as telas fora do fluxo do dia, a lista de ignorados do CSV e os 5 erros
do `LegacyDomainSyncService`. A **AL-03** (receita por nicho no caixa) ficou como limitação doc-only,
com nota obrigatória na release (R-A03, rascunho pendente), e a **AL-04** (recorte do aceite) como
recorte doc-only — 9 requisitos, 15 casos e `V27`–`V30` —, sem código novo.

**Gate medido em 08/11/2026:** `mvn -B verify` **745/0** (+8 do gate LGPD), `mvn -Ptestfx verify`
**825/0** (745 + 80 `*FxIT`/IT) e validador demo «Base demo consistente» em base recém-migrada até a
**V30**. Checklist de homologação com **84 casos** (H-C10 e H-C11 entram como «Automatizado verde»).
**Sem commit, push, tag ou release** do 2.3.0 sem pedido explícito do dono.

### Hub — `v2.1.0-rc1.10` publicada com canal de atualização assinado (07/11/2026)

**Publicado:** tag `v2.1.0-rc1.10` em `chmulato/caracore-hub-releases`, como **Latest público e não
pré-release**, por autorização explícita do dono em 07/11/2026; recebida em 22:11 UTC. ZIP portátil
`CaraCore-Hub-2.1.0-rc1.10-windows-x64.zip`, **228.354.977 bytes**, SHA-256
`0b18fbcf3af02d53a341ac5b83af9132a0ef201e698585160f332d3ad8bdae00`; sem instalador NSIS, binários
sem assinatura Authenticode.

**Base da atualização assinada:** chave pública Ed25519 embutida no Hub
(`hub-release-public.pem`, kid `hub-release-2026-a`), conferente fail-closed de SHA-256 e assinatura
do manifesto. O gateway serve `https://api.caracore.com.br/releases/hub/latest.json` com envelope
`releaseDate`/`kid`/`signature`; o `latest.json` publicado tem 746 bytes, SHA-256 `12eab17f…`,
byte-idêntico ao manifesto local. Esta versão **ainda não baixa nem aplica atualização sozinha**.

**Medição:** CI `42415755367` verde em `9746911` (2ª tentativa), `clean verify` 2.608 testes / 0
falhas / 0 erros; E2E 60/1/0 (uma falha de janela do harness, não do produto); pacotes Windows,
macOS e Linux; smoke Linux x64 10/10 no backend `gnome_libsecret`. `B7` (smoke Linux x64) **fechado**
em 07/11/2026 com essa run; `S6.9` segue aberto.

**Ainda não homologada:** aceite de QA da `rc1.10` pendente. A rodada 5 reprovou a `rc1.7`
(N1/N2 bloqueantes). Publicar como Latest no GitHub **não** substitui o aceite formal; o rótulo
editorial continua **Beta (RC)/pré-release**. GA do instalador Windows em 06/04/2027, não homologado.

**Superfícies:** loja `hub.caracore.com.br` (`caracore-hub-releases/docs`), wiki, central
`download.caracore.com.br` e matriz alinhadas a `v2.1.0-rc1.10` no mesmo corte. Tags publicadas não
se reescrevem; a `rc1.8` (31/10, ZIP 324.536.724 B) e as anteriores conservam os pacotes delas.

### PDV v4 — GA em 08/11/2026 propagado ao ecossistema (05/11/2026)

**Decisão:** o dono decidiu por escrito em 04/11/2026 que **a v4.0.0 sai como GA em 08/11/2026**. A
entrada substitui a D-C (03/11) e a D-GE-7 na parte que recusava GA nessa data, e fecha a **D-GA-1**
(`caracore-pdv/docs/arquitetura/DECISOES_GA_V4.md:1053-1123`).

**Medido em 05/11 — nada publicado:** tag `v4.0.0` responde `404`, `caracore-pdv4-releases` responde
`404` e `api.caracore.com.br/releases/pdv-v4/latest.json` responde `404 no_release`; o canal
`latest.json` segue em `3.2.12-free`. Fila da oficina: **#64** pacote GA com as duas chaves →
**#65** T032 17/17 no hash que vai ser publicado → **Gate E escrito** → **#66/#67** canal →
**#68/#69** loja e notas → virada de 08/11.

**Divergência publicada:** a home da vitrine já diz "Lançamento oficial · CaraCore PDV v4.0.0"
(`caracore-pdv-releases/docs/index.html:61`) com "build de 08/11/2026" (`:93`), mas o `download.html`
no ar serve a prévia `v4.0.0-candidato-20261031` e ainda dizia "não é GA". A oficina fixou prazo de
**07/11** para as duas dizerem o mesmo (`DECISOES_GA_V4.md:1077`). Em **05/11** a vitrine foi varrida
**no checkout local** (`caracore-pdv-releases`, 8 arquivos, 43/40 linhas — **sem commit e sem deploy**):
`download.html`, `roadmap-2026.html`, `versoes.html`, `pwa.html`, `tecnologia.html`,
`wiki-release-v3-2-12-free.html`, `wiki-release-v3-2-8-free.html` e `wiki-release-v4-0-0-rc6.html`
passaram a dizer "lançamento marcado para 08/11/2026" com as condições dos gates; só ficaram as
referências legítimas à "prévia v4". **O que está no ar segue na redação anterior** — a vitrine
publicada ainda diz "em pré-lançamento" e "sem data definida".

**Condições em aberto, não presumíveis:** duração do soak, SCA (OSV medido; NVD não — nunca
"0 CVE"), pacote assinado com as duas chaves e canal `pdv-v4`. Até lá o GA está **decidido**, não
**publicado**.

**Corrigido nesta data:** `AGENTS.md` (cabeçalho, canais, produto, marcos, ciclo de vida Java,
tabela de execução, mapa Java, cota, retomada), `docs/CALENDARIO_COTA_CURSOR.md` (datas públicas,
dono do ciclo, ponteiros), `ecosistema.html` (caixa do PDV e nota de fecho), `docs/INICIAR_NOVA_TAREFA.md`
(discurso do CSO, canal da loja PDV e adendo datado que supera o bloco "Estado (2026-10-31)") e,
neste ficheiro, o snapshot e a § "Retomada em 30 segundos" (itens 4, 4a e 5). Os blocos datados abaixo
continuam como histórico e não foram reescritos.

### Ink Agenda 2.2.1 — correção do atualizador e alinhamento de ecossistema (04/11/2026)

**Release:** tag `v2.2.1` em `caracore-ink`, publicada em `caracore-ink-releases` em 04/11/2026.
Assets: Windows setup `.exe` 62.947.840 B, SHA-256 `39eafa4a…270c124b`; Windows ZIP 61.477.189 B,
SHA-256 `4baf257d…deef98b1`; Linux `.deb` 53.419.622 B, SHA-256 `1b89bb76…841cef14`. Os três seguem
**sem assinatura Authenticode**; o `.deb` não foi instalado nesta homologação.

**O que mudou:** o botão «Baixar e abrir instalador» falhava em toda tentativa nas 2.1.0 e 2.2.0
(o GitHub responde 302 e o app só aceitava 200). A 2.2.1 segue até 5 saltos, valida cada salto
(HTTPS, sem credencial, porta 443, domínios oficiais) e mantém o SHA-256 do manifesto assinado como
obrigatório. Jackson 3.1.1 → 3.1.7 fecha os 18 achados OSV da 2.2.0. Gate: `mvn verify` com Java 25,
**713 testes**, 0 falhas. Nenhuma migração nova: bases 2.0.1–2.2.0 abrem no esquema **V26** já criado
na 2.2.0 (`app_users`, PBKDF2).

**Produto (herdado da 2.2.0):** equipe com papéis Administrador/Agenda/Financeiro, mensageria por
WhatsApp ou Telegram que abre o app instalado com o texto pronto (o Ink não envia sozinho, não
confirma entrega nem lê respostas), layout de 1280×800 com mínimo 768×520 e alvos de 44 px.

**Superfícies alinhadas e publicadas em 04/11/2026:** loja Ink com a 2.2.1 em `f65e149` e o
CTA/manual em `0805fdc` (`index`, `download`, `versoes`, `manual`, `primeiro-acesso`, `pwa`,
`tecnologia`, `artifacts/*` e checksums). Wiki (`projeto-ink`, `projetos-overview`, `ecosistema`,
`status`, busca) em `0ffbc5d`; Central (`produtos.json`, `catalog-data.js`, `download`, `index`,
`roadmap`, `mapa`) em `4d30e35`; matriz (`portfolio`, `ecosistema`, `index`, `planning-data.js`,
este AGENTS e docs de ecossistema) neste commit. A conferência no ar depende da propagação do
GitHub Pages.

**Achado corrigido nesta publicação:** `RELEASE_NOTES_v2.2.1.md` (loja) dizia «a base nasce ou
permanece na V25»; o esquema real é **V26** desde a 2.2.0. Corrigido em `0805fdc`, junto com
«2.0.1 a 2.2.0» em `download.html`.

**Pendências:** clique real no botão dentro da interface 2.1.0 → oferta da 2.2.1 não foi medido (só
a classe publicada contra o canal real); percentuais do `planning-data.js` continuam a leitura de
31/10/2026, com a versão 2.2.1 declarada em nota; conferência visual no ar após o Pages.

### Ink Agenda 2.1.0 — release e alinhamento de ecossistema (03/11/2026)

**Release:** tag anotada `v2.1.0` em `caracore-ink` (`b51bc3f`), publicada às 18:40:32Z em
`caracore-ink-releases`. Assets oficiais do CI: Windows ZIP 61.416.136 B, SHA-256
`4e8b6666…55e2551`; setup `.exe` 62.886.400 B, SHA-256 `81fd338f…a1aed4dbd`; Linux `.deb`
53.472.220 B, SHA-256 `58c0d3f0…f870bf18`. O `latest.json` do gateway já serve a 2.1.0 com esses
três assets e `min_supported` 2.0.2.

**Produto:** um executável, três perfis — Tatuagem & Arte Corporal (lilás), Odontologia & Saúde
(turquesa) e Beleza & Estética (dourado) — com paleta, vocabulário e catálogo financeiro por nicho.
Preferência em `app_preferences` (V24), sementes V25, bases 2.0.1–2.0.4 migram sem perda e o perfil
Tatuador é o padrão. macOS segue sem instalador; a 3.0 em PWA não vem antes de 2028.

**Superfícies publicadas em 03/11/2026:** wiki (`projeto-ink`,
`projetos-overview`, `status`, `ecosistema`, busca), Central (`produtos.json`, `catalog-data.js`,
`download.html`, `index`, `roadmap`, `mapa`), loja Ink (`index`, `download`, `versoes`, `manual`,
`primeiro-acesso`, `pwa`, `tecnologia`, `canal-feedback`, `mirror-delivery`, `artifacts/*` e
checksums) e matriz (`portfolio`, `ecosistema`, `index`, docs de ecossistema).

**Pendências medidas:** o macOS foi **aposentado** da linha 2.x: o job `build-macos` e o script de
delivery foram removidos da oficina (commit `1d1780a`), e o corpo da release e o `releaseNotes` do
gateway já saem só com Windows e Linux. A Central e a loja Ink mantêm, no HTML, os mesmos números do
canal como fallback; a página `versoes.html` agora separa 2.1.0 (atual) de 2.0.4 (histórico).
Inspeção visual em navegador ainda não refeita para esta rodada.

### Como uma IA abre uma feature nova (30/10/2026 — ler antes de editar código)

**Fonte mestre:** `caracore-site/AGENTS.md` + este ficheiro. O antigo `D:\onedrive\dev\AGENTS.md` **não existe
mais**: todo ponteiro para o "AGENTS.md da raiz do workspace" está morto e não deve ser seguido nem citado.

**Ordem de leitura:** `AGENTS.md` → este ficheiro → `INICIAR_NOVA_TAREFA.md` → `project-memory.mdc` **do repo
da tarefa**. A memória da oficina manda no estado do produto; este documento manda na copy institucional.

**Camadas — uma por vez:** oficina (`caracore-<produto>`, código) → loja (`caracore-<produto>-releases`,
vitrine e assets) → Central (`caracore-loja`, catálogo único) → matriz (`caracore-site`, resumo + CTA) → wiki
(`caracore-wiki`, manual e alinhamento). Nunca editar vitrine dentro da oficina, nunca publicar `WAR`/binário de
build como release.

**Antes de escrever qualquer coisa:** contrato de promessas (`docs/PROMPT_HONESTIDADE_PROMESSAS.md`) — sem
`arquivo:linha`, teste ou run não é fato; estado antes de adjetivo; tela protegida não é API protegida; default
do fornecedor se declara; aceite não atravessa builds. Tabela renderizada por `assets/js/*-data.js` **é copy**:
atualizar só o HTML deixa a tela mentindo (foi assim que a Central e a matriz quase publicaram dado velho).

**Estado por produto (31/10/2026)**

| Produto | Estado medido | Onde começar |
|---|---|---|
| PDV Java v4 | **GA recusado no Gate E**; rota `rc7` curta + GA em data escrita (`D-GE-7`); prévia pública = `v4.0.0-candidato-20261031` (build 31/10, fonte `c343890`, SHA `0c2003b0…83434d`, 178.317.680 B; run `41244424886`, 1.039 testes, 0 falhas, 3 ignorados, LINE 52,82%); `v4.0.0-rc6`/`rc5` no histórico, RC7 sem tag; pacote `ff400efd8737…` mediu T032 16/16 e matriz 11/11 — **não esta candidata**; **SCA não medido** e cenário migrado bloqueado; superfícies públicas **publicadas na candidata em 01/11/2026** (loja `e54476d`, wiki `fb040bf`, Central `45835e5`, matriz `fd4b150`, todas com Pages `built`) | `caracore-pdv/AGENTS.md` § "Como desenvolver uma feature nova na v4" |
| PDV Java 3.2.12 | **versão anterior** na copy desde 29/10, ainda a indicada para operar; GitHub ainda marca Latest; manutenção só até 08/11/2026 | `caracore-pdv/AGENTS.md` § Diretriz de transição |
| Hub | `v2.1.0-rc1.8` publicada em 31/10 (ZIP portátil, SHA `3c4e61b2…743334`, 324.536.724 B; `clean verify` 2.585/0 e E1–E6 PASS em `9874273`), **sem aceite de QA**; a `rc1.7` foi **REPROVADA** na rodada 5 (N1/N2 bloqueantes); rótulo editorial Beta (RC)/pré-release mantido apesar do Latest no GitHub; GA 06/04/2027 | `caracore-hub/.cursor/rules/project-memory.mdc` § "Como desenvolver uma feature nova" |

**Entrega:** commit e push só com autorização explícita, por ação; nos repos de site, PR + merge (rebase, sem
merge commit) só quando pedido. Evidência de execução vale no dia (copiar run + log + artefato). Prompt da
próxima tarefa sempre em `.txt` em `docs/` da oficina. Publicação é passo separado, nunca efeito de commit.

### Canal de atualização da frota desktop — pdv/hub/cso/ink no mesmo gateway (01/11/2026; ink em 02/11/2026)

**Fonte da verdade (decisão de 02/11/2026):** `caracore-api` é a única fonte da verdade do Gateway de
versões da Cara Core Informática (contrato, `AppCatalogo`, rotas `/releases/{app}/latest(.json)`). O
`caracore-cso-quarkus` apenas espelha o núcleo. **`AppCatalogo.java` é primário no `caracore-api`** e o
CSO deve refletir exatamente essa classe (e as outras cinco do núcleo): alterar só no `caracore-api`,
replicar com `python caracore-api/scripts/sincronizar_nucleo_cso.py --aplicar` sempre que a versão/catálogo
de um app mudar (ex.: Ink Agenda) e conferir com `verificar_nucleo_cso.py` (byte a byte). Sem CI
cross-repo (exigiria PAT entre repositórios): a sincronização é manual e nunca faz commit sozinha. Estado em 02/11/2026:
`ink` no `AppCatalogo` commitado nos dois (`caracore-api` `7054dad`, `caracore-cso-quarkus` `0f6f1a8`).
**Ressalva:** o `application.properties` do `caracore-api` ainda não tem `caracore.api.apps.ink.*`
(`repo`, `asset-regex`) — só o `cso-quarkus` tem — e o endpoint de produção hoje roda do deploy do
`cso-quarkus` (Railway). Portar essas propriedades e a variável `CARACORE_API_APPS_INK_REPO` antes de
mover o deploy para o `caracore-api`.

**Estratégia de desacoplamento (02/11/2026):** o `caracore-api` é a fonte primária da *especificação* do
Gateway de versões; o `caracore-cso-quarkus` só **hospeda temporariamente a réplica** do serviço. Para a
migração futura a um servidor dedicado sem impacto nos desktops, as rotas usam URLs/interfaces neutras
(`api.caracore.com.br/releases/{app}/latest(.json)`, sem nome do CSO, contrato JSON estável, URL compilada
nos clientes): migrar = trocar deploy/DNS. Regra nos dois `AGENTS.md`; wiki em `projeto-cso.html#gateway-versoes`.
Sem data aprovada para a migração.

Infra transversal aos desktops (PDV, CSO, Hub Gestão de Transportes, Ink Agenda). Gateway embutido hoje no
**`caracore-cso-quarkus`** (api.caracore.com.br, Railway), pacote `br.com.caracore.api.update`, rotas
`/releases/{pdv|hub|cso|ink}/latest(.json)` no Router do Vert.x (fora do JAX-RS); o legado
`/releases/latest.json` é o app **pdv**. **ink** → 200 `2.2.1` (3 assets: windows-setup, windows-zip e linux-deb com os SHA-256 oficiais, envelope assinado com `key_id ink-2026-11`; medido em 04/11/2026, `published_at` 2026-11-04T21:07:10Z, `min_supported` 2.0.2). O `releaseNotes` do envelope sai só com Windows e Linux — **macOS não tem instalador**.

- **Estado medido ao vivo em 04/11/2026:** pdv → 200 `3.2.12-free` · hub → 200 `2.1.0-rc1.8` · ink → 200 `2.2.1` ·
  cso → 204 (fiação armada; falta a 1ª release real e um cliente de atualização no desktop do CSO).
- **Variáveis reais no Railway:** `CARACORE_API_APPS_HUB_REPO`, `CARACORE_API_APPS_CSO_REPO` e
  `GITHUB_PAT`. Os nomes curtos `HUB_REPO`/`CSO_REPO` nunca existiram — placeholders do properties
  alinhados nos commits `a171141`/`ae635a5` do cso-quarkus (pushados e deployados em 01/11).
- **Contrato:** 200 = JSON com `version`/`downloadUrl`/`sha256`/`releaseNotes`/`mandatory`; 204 = nada
  publicado (não é erro); cache de 15 min em memória guarda também a ausência; pré-release **não** entra
  no Latest. Virada do canal = promover a release no GitHub, sem mudar código. Round-trip validado no
  ambiente real (release dummy → 200 → apagada → 204 após redeploy).
- **Clientes:** PDV `UpdateManager` (URL compilada, `/releases/latest.json`); Hub
  `CanalAtualizacaoClient` (`/releases/hub/latest.json`, token de licença no header, nunca em log);
  CSO desktop ainda sem cliente — é a peça que falta para o trio fechar.
- **Suporte:** o gateway derruba junto o canal e o SaaS do CSO (mesmo deployment), mas o cliente desktop
  degrada sem bloquear o operador. Suíte do cso-quarkus: 430 testes/0 falhas (21 do canal).

### Checkpoint 01/11/2026 — superfícies publicadas na prévia de 31/10 e fila de retomada

**Estado medido em 01/11/2026.** As quatro superfícies que descrevem o PDV Java foram alinhadas à candidata,
commitadas, empurradas e conferidas ao vivo; o GitHub Pages construiu o commit exato em todas:

| Repositório | Superfície | Commit | Pages |
|---|---|---|---|
| `caracore-pdv-releases` | pdv.caracore.com.br | `e54476d` | `built` |
| `caracore-wiki` | wiki.caracore.com.br | `fb040bf` | `built` |
| `caracore-loja` | download.caracore.com.br | `45835e5` | `built` |
| `caracore-site` | caracore.com.br | `fd4b150` | `built` |

- **Prévia pública = `v4.0.0-candidato-20261031`** (release publicada em 31/10/2026 22:36Z com
  `prerelease=true` e `draft=false` pelo dono): ZIP `CaraCore-PDV-4.0.0-qute-portable-windows-x64.zip` de
  **178.317.680 B**, SHA-256 `0c2003b0f99a75328f7ebe632fc20b07cb5834a3f75b6f0e97ccfb7aef83434d`, sidecar de
  116 B. A vitrine usa `download.html#pre-release-v4`; a RC6 vai para `#rc6` como prévia anterior;
  `#instalacao-rc6` não existe mais. Selo: **"Em pré-lançamento · prévia candidata"**, sem data
  (selo é status, data é build).
- **O canal de atualização continua em `3.2.12-free`** (`https://api.caracore.com.br/releases/latest.json`,
  medido em 01/11: `version=3.2.12-free`, `sha256=6d7a50b0…`). É o comportamento correto enquanto a v4 for
  pré-release — não "consertar" o canal antes do GA.
- **Resíduo de copy conhecido:** o corpo da release `v3.2.12-free` no GitHub — que o canal espelha em
  `releaseNotes` — ainda diz "A linha v4 RC6 permanece separada, como pré-release". Só se corrige por
  `gh release edit` (ação de publicação, exige pedido do dono; não muda tag nem asset).
- **A memória da oficina estava atrás desta publicação:** `caracore-pdv/AGENTS.md` ainda dizia que a prévia
  pública era a RC6 e que nada tinha sido publicado no ciclo. Corrigido em 01/11/2026 no próprio ficheiro;
  o que governa é este checkpoint + o checkpoint de Gate E de 30/10.

**Próximas tarefas — em ordem de dependência, cada uma com a evidência que a fecha**

| # | Frente | Tarefa | Fecha com | Onde começar |
|---|---|---|---|---|
| 1 | PDV v4 | Rodar o ciclo manual do T032 (16 passos) no ZIP de 31/10 | `16/16` medido no próprio binário, evidência copiada em `scratch/` no dia | `caracore-pdv/docs/prompt-proxima-tarefa-ga-v4-entrega-20261029.txt`; sonda `scripts/sonda_matriz_m_t032.py` |
| 2 | PDV v4 | Medir a matriz M01–M11 no mesmo pacote | tabela medida no hash; **M11 declarado bloqueado** (PERF-001–007) | `caracore-pdv/scripts/sonda_matriz_m_t032.py`; formato de `caracore-pdv/docs/relatorio-rc7.md` |
| 3 | PDV v4 | Medir SCA/G1 (`D-SCA-1`) | run do dependency-check com feed atualizado + laudo; **nunca "0 CVE"** | `caracore-pdv/docs/arquitetura/DECISOES_GA_V4.md` § `D-SCA-1`; falta `NVD_API_KEY` |
| 4 | PDV v4 | Desbloquear o cenário "banco 3.2.12 migrado" | `9/9` no pacote novo, sonda sempre sobre cópia | `caracore-pdv/scripts/cenario_banco_migrado_t032.py` |
| 5 | PDV v4 | Escrever a `rc7` curta | tag + ZIP + T032/matriz no hash + run de push verde | `D-GE-7`; **aprovação escrita do dono (F7)** |
| 6 | PDV v4 | GA em data escrita | data escrita + aceites formais + estágio anterior fechado | `caracore-pdv/docs/arquitetura/DECISOES_GA_V4.md` § `D-GA-1` |
| 7 | PDV v4 | Apontar o canal para a v4 quando promovível | `latest.json` com a v4 + `sha256` + download 200 + notas sem "RC6" | `caracore-cso-quarkus` pacote `br.com.caracore.api.update`; deploy Railway autorizado |
| 8 | PDV 3.2.12 | Decidir o que acontece com o download depois de 08/11/2026 | decisão escrita do dono refletida nas quatro superfícies; nada muda sozinho | este documento + memória da oficina |
| 9 | Hub | Aceite de QA da `v2.1.0-rc1.10` | rodada concluída, **N1/N2** e S6.9 resolvidos (B7 fechado em 07/11/2026); rótulo Beta (RC) só cai com aceite formal | `caracore-hub/docs/contexto-rapido.md` · `docs/handoff-construtora-hub-rc1.7-20261027.txt` |
| 10 | CSO | Seguir Transportes + VT | INT-03 estima total de sprints/ciclos (hoje 0/21); alvo conjunto 08/11/2028 | `caracore-cso-transportes/docs/plano_organizado_execucao_cso.md` |

**Conferir publicação sem presumir:** `git -C <repo> rev-parse --short HEAD` + `gh api
repos/chmulato/<repo>/pages/builds/latest --jq '.status + " " + .commit'`; conteúdo ao vivo por `curl` com
cache-bust (`?cb=...`). O Pages pode servir o build anterior por alguns minutos — build `built` no commit
certo é o que prova.

### PDV v4 em pré-lançamento — virada de discurso no ecossistema (29/10/2026, loja e wiki publicadas)

Decisão do dono nesta data: **focar o pré-lançamento da v4 e tratar a 3.2.12-free como versão antiga**.
O discurso passa a ter dois estados, aplicados em loja (`caracore-pdv-releases`), wiki (`caracore-wiki`)
e matriz (`caracore-site`):

- **PDV v4 = em pré-lançamento.** Prévia pública de avaliação = `v4.0.0-candidato-20261031` (Windows x64,
  build 31/10/2026, SHA-256 `0c2003b0…ef83434d`), desde a rodada de 31/10/2026; `v4.0.0-rc6` (SHA
  `0c00b24b…780d5325`) e `v4.0.0-rc5` ficam no histórico. Não é GA, não é “estável”, não é “Latest”;
  GA só depois dos gates e aceites formais (**D-GE-7/D-GA-1** abertas). A RC7 é a rota aprovada do Gate E,
  ainda sem tag publicada.
- **3.2.12-free = versão anterior.** Última da linha 3.2.x, em manutenção de transição até 08/11/2026,
  **ainda a indicada para operar** até a v4 ser aprovada. Some o rótulo “estável/Latest” da copy pública;
  o fato histórico da publicação de 15/10 permanece.

**Superfícies alteradas (só árvore de trabalho):** loja `download.html`, `index.html`, `versoes.html`,
`pwa.html`, `roadmap-2026.html`, `tecnologia.html`, `homologacao-v4.html` + `portal-style.css` (novo selo
`.selo-anterior`) + `README.md`; wiki `projeto-pdv.html`, `index.html`, `projetos-overview.html`,
`guia-estagiario.html`, `projeto-pdv-rust.html`, `tecnologias.html`; matriz `index.html`, `portfolio.html`,
`ecosistema.html`, os dados renderizados em runtime (`assets/js/catalog-data.js`, `planning.js`,
`planning-data.js`) e os docs de estado (`docs/ECOSISTEMA.md`, `docs/ECOSYSTEM_CARA_CORE.md`,
`docs/ECOSYSTEM_LOJAS.md`, `docs/INICIAR_NOVA_TAREFA.md`, `docs/MEMORIA_DO_PROJETO.md`, `README.md`).
Lição repetida da auditoria de 26/10: **tabela renderizada por `assets/js/*-data.js` também é copy** —
HTML atualizado com o dado antigo no JS é regressão.

**Bloqueado por decisão, não escrever antes do aceite:** nome final da versão, SHA-256 do pacote de GA,
página `wiki-release-v4-0-0.html` e qualquer “0 CVE” (SCA segue **não medido**, D-SCA-1).

**Publicação (autorizada pelo dono nesta data):** `caracore-pdv-releases` no commit `b29f6a4` e
`caracore-wiki` no commit `8c8517a`, ambos com GitHub Pages `built` e conferidos ao vivo por `curl` com
cache-bust. Nada tagueado; o produto em si segue sem publicação (F7 aberta).

**Segunda rodada — Central, Rust e memória interna (mesma data, árvore de trabalho):** por decisão do dono
(“tudo, incluindo a memória interna”), o mesmo vocabulário foi aplicado em três repositórios.
`caracore-loja` (Central, `download.caracore.com.br`): `docs/download.html`, `docs/index.html`,
`docs/mapa.html`, `docs/roadmap.html` e **`docs/assets/data/produtos.json`** — este último é obrigatório
porque `assets/js/download-app.js:134-145` sobrescreve `.status-badge` a partir do JSON; o catálogo mantém
o filtro **Estável/Piloto/Preview** (`data-maturity` intacto) e muda só o rótulo visível para
**“Versão anterior · indicada para operar”** e **“Em pré-lançamento”**.
`caracore-pdv-rust-releases` (`pdv-rust.caracore.com.br`): `docs/index.html` e `docs/download.html` — a
caixa de convivência deixou de dizer “linha estável” e “prévia da próxima edição”; esse repo **não** tem
trap de JSON (só `docs/assets/data/release-latest.json`).
Memória interna: `caracore-site/AGENTS.md` (bloco novo de 29/10 na cabeça + tabela de produtos, marcos,
canais, coexistência, calendário e fontes de retomada), `caracore-loja/AGENTS.md` + `README.md`.
**Regra nova registrada:** *selo é status, data é build* — foi colar data em selo que produziu a leitura
falsa “a linha antiga é mais nova” (manutenção 15/10/2026 × prévia 10/10/2026) e obrigou a trocar o rótulo
da linha de comparação para **“Último build”** com nota explicativa.

### Convenção — prompt de próxima tarefa sempre em `.txt` (24/10/2026)

Regra do dono, válida para todas as oficinas: o prompt da próxima tarefa é entregue **em `.txt`**
(ASCII, CRLF, sem markdown) em `docs/` da oficina, com o nome
`prompt-proxima-tarefa-<tema>-<AAAAMMDD>.txt`. O `.md` de mesmo nome fica como espelho de leitura
(tabelas e links relativos) e **não** substitui o `.txt`. Não perguntar o formato nem entregar só
o `.md`. Registrado também em `AGENTS.md` (§ Como IAs colaboram, item 6), no espelho
`caracore-site/AGENTS.md` e em `caracore-hub/.cursor/rules/project-memory.mdc`.

### Coerência — correções de copy aplicadas (27/10/2026, local, sem nova tag)

Fechadas as divergências da auditoria de 26/10, com evidência de código:

- **Tela de auditoria.** `caracore-hub-releases/docs/download.html:43`, `RELEASE_2.1.0-rc1.6.md`
  e o **corpo da release no GitHub** (editado em 27/10 por `gh release edit`, sem tocar assets ou tag)
  passaram a dizer que **Auditoria e Logs** (`/admin/auditoria`, ADMIN —
  `AdminAuditoriaServlet.java:21`) se abre **pela URL nesta RC**; o item de menu entra na próxima.
  A wiki (`docs/hub/admin.html:123-124`) separa **Log de Auditoria** (`/auditoria/lista`) de
  **Auditoria e Logs** (`usuario_auditoria`) e registra que a primeira não mostra as ações da segunda.
- **Deck Tia Sócia.** `docs/slides/assets/js/apresentacao-tia-socia.js:28` saiu de `rc1.2` para
  `v2.1.0-rc1.6`.
- **Memória interna sem `rc1.2` como versão a publicar.** `caracore-loja/AGENTS.md:32,53`,
  `caracore-loja/README.md:25`, `caracore-wiki/README.md:20`,
  `caracore-wiki/.cursor/rules/project-memory.mdc:48,50`,
  `caracore-hub-releases/.cursor/rules/project-memory.mdc` e
  `caracore-site/.cursor/rules/project-memory.mdc:17-19`. O `project-memory` do hub-releases agora
  avisa que **só `docs/` é publicado** e que as cópias da raiz são legadas; o README do repo também.
- **Precisão.** `caracore-site/assets/js/planning-data.js:42,44` → “RC7 não publicada (candidatos
  locais de 12/10; D-RC7 aberta)”; `caracore-pdv/docs/arquitetura/STATUS_ATUAL_APLICACAO.md:24`
  marcado como **histórico** (step 7 verde em `40421491568`); nota da `v4.0.0-rc6` (local e corpo no
  GitHub) trocou “Latest continua v3.2.7-free” por “estável/Latest é a `v3.2.12-free` desde 15/10/2026”.

**Fato novo medido:** a recuperação de senha exige **12 caracteres**
(`CodigoRecuperacaoService.java:27`, aplicado em `:229-231`), enquanto `Usuario.java:40` ainda declara
`@Size(min = 6)`. É divergência **de código**, não de copy — **fechada na `v2.1.0-rc1.7`**, que
unificou o mínimo em 12 caracteres e o máximo em 72 bytes em todos os caminhos e passou a gerar a
senha temporária com 16 caracteres.

**Escopo do que está no ar:** apenas os dois corpos de release foram alterados no remoto. Loja, central,
matriz e wiki seguem com estas correções **locais, sem commit nem push**. Status público inalterado:
pré-release não homologada, GA 06/04/2027.

### Hub — `v2.1.0-rc1.7` publicada nas quatro camadas (27/10/2026)

**Publicado, e nada além disso:** a pré-release `v2.1.0-rc1.7` está no ar em
`chmulato/caracore-hub-releases` como **Pre-release** (não Latest, não GA), unsigned. EXE
`CaraCore.Hub-2.1.0-rc1.7-win-x64.exe` 274.162.562 B
`1563f1bd343b0044f9a64dd9bb7d3a1604761ee7f1e2354e8663b693cb310ba1`; ZIP
`CaraCore.Hub-2.1.0-rc1.7-win-x64.zip` 324.502.796 B
`924af1960ccda606e4b3979ff36741f7e78228f8f77c396ccb985878b940b37e`; WAR interno 69.448.885 B
`73b9adf5233598362f34cd4a7ac4128fd71c5805aede8f13110cd8d0fc2023b0`, o mesmo em `web/target`,
`electron/app` e `electron/runtime/tomcat/webapps`. Os dois `.sha256` e os dois manifestos estão na
release; os binários foram baixados de volta e conferidos por SHA-256 e tamanho.

O que a `rc1.7` muda em relação à `rc1.6`: **uma única política de senha — mínimo de 12 caracteres
e máximo de 72 bytes** — no setup, na recuperação por código offline, na troca pelo perfil e no
cadastro pelo administrador, com senha temporária de **16 caracteres** gerada por `SecureRandom`
(antes, cinco regras diferentes, com mínimo 6 na troca pelo perfil, e temporária de 8); e
**Auditoria e Logs com item no menu** (`navbar.jsp`, Administração → Auditoria e Logs, abaixo de
Log de Auditoria), resolvendo a tela órfã que a auditoria de coerência de 25/10 apontou. Nada mais
mudou de comportamento: RBAC por perfil com `403` em JSON, `usuario_auditoria` (V18), canais
travados em Mercado Livre/Shopee/Temu e a saída de `test.jsp`, `usuarios-demo.jsp`,
`UsuariosServlet` e da ROOT padrão do Tomcat continuam vindo da `rc1.6`.

Gate desta build, medido no mesmo código do pacote (commit `ce9007f`): `npm run verify` **PASS** em
`dist_hub/verify/20261027T150209Z` (`promotable=true`, `dirtyEntries=0`, 22min06s, 2.555 testes,
8 ignorados, 0 falhas, E6 com 0 ALTA/0 média e OWASP 1 CVE em 120 dependências) e E2E dos bytes
publicados com **62 PASS / 1 WARN / 0 FAIL** (instalador) e **60 PASS / 1 WARN / 0 FAIL** (ZIP).
**Não homologada:** rodada 5 de QA, **B7** (smoke Linux x64) e **S6.9** (decisões do dono) seguem
abertos. GA em 06/04/2027. A tag `v2.1.0-rc1.6` conserva o pacote de 25/10/2026; `rc1.3`, `rc1.4`
e `rc1.5` nunca foram tagueadas.

Quatro camadas alinhadas no mesmo corte: loja `hub.caracore.com.br`, central
`download.caracore.com.br`, wiki `wiki.caracore.com.br` e matriz. Versão, tamanho e SHA-256
conferidos contra o manifesto, e wiki e central deixaram de citar `rc1.6` como versão vigente.

### Hub — `v2.1.0-rc1.6` publicada, auditoria de coerência e mapa do GA (25/10/2026)

**Publicado, e nada além disso:** a pré-release `v2.1.0-rc1.6` está no ar em
`chmulato/caracore-hub-releases` como **Pre-release** (não Latest, não GA), unsigned. EXE
`CaraCore.Hub-2.1.0-rc1.6-win-x64.exe` 274.160.424 B `05b87529…b4afc8c4`; ZIP
`CaraCore.Hub-2.1.0-rc1.6-win-x64.zip` 324.500.797 B `fe3400c7…17a17c9c0d`; WAR interno 69.447.783 B
`70a3f900…` idêntico em `web/target`, `electron/app` e `electron/runtime/tomcat/webapps`. Electron
35.7.5 · Java 25.0.4.1+1 · Tomcat 10.1.60. As quatro camadas foram empurradas e conferidas: loja
`b3dc257`, central `f919ce6`, matriz `161b536`, wiki `d919cdd`, oficina `40a8657`. As versões `rc1.3`,
`rc1.4` e `rc1.5` **nunca foram tagueadas**; `rc1.2`, `rc1.1` e `rc1` continuam no histórico.

Gate desta build: `npm run verify` **PASS** em `dist_hub/verify/20261025T214503Z` (17min26s,
`promotable=true`, `dirtyEntries=0`, 2.555 testes, E6 com 0 Alta/0 Média, OWASP 1 CVE triado) e E2E dos
bytes publicados com **61 PASS / 1 WARN / 0 FAIL** (instalador) e **59/1/0** (ZIP). **Não homologada:**
rodada de QA, **B7** (smoke Linux x64) e **S6.9** (decisões do dono) seguem abertos. GA em 06/04/2027.

O que a `rc1.6` entrega e a `rc1.2` não tinha: **RBAC por perfil** na API (ADMIN `200` ×
OPERADOR/SUPERVISOR `403`, em JSON), **auditoria de usuários persistida** (`V18__cria_usuario_auditoria`,
`GET /api/auditoria/usuarios`, card em `admin/auditoria.jsp`), **`403` no contrato JSON**
(`ContratoDeErro` + `ForbiddenExceptionMapper`), freemium/backup/diagnóstico da `rc1.5`, `test.jsp` /
`usuarios-demo.jsp` / `UsuariosServlet` e a ROOT do Tomcat fora, canais AMAZON/B2W travados.

**Auditoria de coerência do ecossistema contra esses bytes:** versão, hashes, tamanho, data, status
Pré-release e ressalvas de honestidade bateram nas quatro camadas. **Uma divergência**, com arquivo e
linha: a loja promete a auditoria de usuários “em **Administração → Auditoria e Logs**”
(`caracore-hub-releases/docs/download.html:43`), mas `navbar.jsp:107` só aponta `/auditoria/lista`
(“Log de Auditoria”) e **nenhum** JSP/XML do webapp cita `admin/auditoria` — `AdminAuditoriaServlet` →
`admin/auditoria.jsp` existe e só é alcançável digitando a URL. A wiki agrava:
`caracore-wiki/docs/hub/admin.html:123` descreve filtros por usuário/data/tipo e exportação sob
“Administração → Auditoria”, o que é `/auditoria/lista` (`auditoria/lista.jsp:43,140,249`,
`/api/auditoria/exportar`) e **não** mostra `usuario_auditoria`. O gate não pega porque
`scripts/verify_hub_e2e.ps1` sonda `/admin/auditoria` como anônimo (302), `403` JSON e persistência da
API, mas nunca o caminho de entrada na interface. **Correções:** item de menu → exige **`rc1.7`** (tag
publicada não se reescreve); separar as duas telas no manual da wiki → pode sair **já**, sem RC; check
de presença do link no E2E.

**Mapa do caminho até o GA** (três estados, gates abertos, as 8 decisões do dono e ordem de execução):
`caracore-hub/docs/status-hub-ga-2027-20261025.md`. Memória da oficina: `contexto-rapido.md` (topo) e
`.cursor/rules/project-memory.mdc`. **Não** chamar a `rc1.6` de estável, de versão final ou de GA.

### Hub — Sprint 6 em 6/14, retrato de saúde e fila da `rc1.4` (23/10/2026)

Oficina `caracore-hub`, **sem tag e sem asset**: a loja continua servindo `v2.1.0-rc1.2`
(unsigned, reprovada pela QA da rodada 4) e o GA segue 06/04/2027. A oficina está em
`2.1.0-rc1.3`, e essa build **falhou na E2E de 20/10** (17 PASS / 2 WARN / 4 FAIL).

O quadro real é **6 de 14 `[x]`** (S6.0, S6.2, S6.3, S6.6, S6.11, S6.12). Fecharam nesta
rodada o **S6.2** (SQLite real: migração do zero, `SqlPortabilidadeTest`, concorrência sem
`SQLITE_BUSY` e migração **V16** alinhando os CHECKs de status aos enums) e o **S6.3**
(HTTP: 22/22 casos, 26 raízes de `/api/*` em 401 JSON sem `Set-Cookie`, 13 telas em 200,
ADMIN×OPERADOR 200/403), com `clean package` de 2.436 testes e 0 falhas. **Os dois
fechamentos estão no working tree, sem commit:** quem clona o repo não os vê e
`npm run verify` continua saindo `promotable=false`.

Seguem abertos S6.1, S6.4, S6.5, S6.7, S6.8, S6.9, S6.10 e S6.13, mais **S6.14 proposto**
(RBAC por perfil). A fila que destrava a `rc1.4` é **B7** (run verde do smoke Linux x64) →
**E7** (app empacotado) → **S6.7** (rodada limpa + bloco `verify` no manifesto + job de CI)
→ **S6.13** (E2E do pacote) → **S6.10** (tag). **S6.9** depende só do dono: assinatura C7,
`UAC.dll` de 2015 C4, login da conta real e T1 (Defender nesta máquina ou em VM).

Armadilhas conferidas na árvore, não só em laudo: `RolesAllowedDynamicFeature` não é
registrada (`@RolesAllowed` é decorativo e existe só nas duas `AdminLogsResource`),
`web.xml` sem `session-config` (30 min é default do Tomcat), `outputTimestamp` ausente nos
5 POMs (WAR não reprodutível), CSRF só em três servlets de formulário e `/api/health/ready`
privada por comparação exata de caminho, com `ex.getMessage()` no `detail`.

Retrato de saúde por dimensão, com a evidência de cada nota:
[`caracore-hub/docs/avaliacao-saude-aplicacao-20261023.md`](../../caracore-hub/docs/avaliacao-saude-aplicacao-20261023.md).
Próxima tarefa escrita:
[`prompt-proxima-tarefa-saude-rc14-20261023.md`](../../caracore-hub/docs/prompt-proxima-tarefa-saude-rc14-20261023.md)
(`.md` e `.txt`). O `README.md` da oficina foi corrigido (dizia "Sistema 100% finalizado e em
produção" e tratava PostgreSQL/Redis como stack) e `project_hub/docs/` foi marcada como
**legado congelado**. Sem resposta do dono ainda: o `token.txt` na raiz da oficina e o
destino dos 230 arquivos dessa árvore legada.

### Hub — Sprint 6 em 4/14 e handoff de continuidade (22/10/2026)

Trabalho de **oficina** (`caracore-hub`), sem tag, asset ou mudança de copy pública: a
loja continua servindo `v2.1.0-rc1.2` (unsigned, reprovada pela QA da rodada 4) e o GA
segue 06/04/2027. A oficina está em `2.1.0-rc1.3`, com os POMs em `2.1.0-rc1`.

O quadro real da Sprint 6 é **4 de 14 `[x]`** (S6.0, S6.6, S6.11 e S6.12). Seguem
abertos S6.1, S6.2, S6.3, S6.4, S6.5, S6.7, S6.8, S6.9, S6.10 e S6.13. Os dois itens
sem nenhuma entrega são **S6.2** (SQLite real: migrações do zero, varredura de SQL
PostgreSQL-only, concorrência sem `SQLITE_BUSY`) e **S6.3** (HTTP/REST Assured, CSRF
dos POST JSON e **RBAC por perfil** nos 31/32 recursos de `/api/*` fora de
`/api/admin/*`). **S6.9** depende só de decisão do dono (assinatura C7, `UAC.dll` de
2015 C4, login da conta real, T1 com Defender).

Na rodada de 22/10 o **S6.8** foi executado: **D6 fechado** (`HubCleanTempCopy` no
`installer.nsh`, resíduo `~nsu*` = 0, smoke do instalador 26/26), **E8 medido**
(EXE 272.853.525 B `aff44de2…`, ZIP 323.192.638 B `2f03af7a…`, WAR `3d876bbb…` nos dois
caminhos do pacote) e **C6 medido** (mediana 79.207 ms, `target: null`; primeiro boot
após instalação 173.386 ms). O **E7 não foi aprovado**: o app empacotado sai com
`ExitCode 0` porque `window-all-closed` chama `stopTomcat()` e `app.quit()`, e o caso
`04-order-stock-export` consome ~58 s de um orçamento de 60 s contra o scheduler de 30 s.
Falta guard `HUB_TEST_NO_QUIT=1` (ou bancada dedicada) e preservar o perfil `mkdtemp`
quando o teste falha.

O **S6.7** tem o orquestrador `npm run verify` com E1–E6 (`dist_hub/verify/20261022T201709Z`,
PASS em 18min26s, 2454 testes, 8 ignorados, 10 specs Playwright), mas `promotable=false`
porque a árvore estava suja (34 arquivos). O **S6.12** está fechado, porém **B7** (smoke
Linux x64, cofre/`gnome-keyring`/D-Bus) segue vermelho e o run `39774971331` sumiu da API
do GitHub — o CI **não** vale como prova durável da `rc1.4`.

Nada é publicável nesta data: a `rc1.4` depende de **S6.10**. Handoff para a próxima IA,
com o quadro dos 14 itens, comandos, armadilhas já pagas e ordem de retomada:
[`caracore-hub/docs/handoff-sprint6-continuidade-20261022.md`](../../caracore-hub/docs/handoff-sprint6-continuidade-20261022.md).


### MCP local — DeepSeek direto e NVIDIA NIM (22/10/2026)

No workspace `D:\onedrive\dev`, `.vscode/mcp.json` mantém dois servidores
isolados: `nvidia-deepseek` (`deepseek-ai/deepseek-v4.1-flash`) e
`deepseek-direct` (`deepseek-flash`, API oficial). Nenhuma chave é salva nos
arquivos. O servidor direto usa prompt de segredo protegido do VS Code; uma
chamada real DeepSeek ainda não foi feita. O teste ao vivo NVIDIA expirou em
180 s, sem confirmar inferência. Estado detalhado, ferramentas, arquivos e
passos para retomada: [MEMORIA_CONFIGURACAO_MCP_DEEPSEEK_NVIDIA_2026-10-22.md](./MEMORIA_CONFIGURACAO_MCP_DEEPSEEK_NVIDIA_2026-10-22.md).

### Hub — Sprint 6 fecha autorização anônima no runtime empacotado (21/10/2026)

Trabalho de **oficina** (`caracore-hub`), sem tag, asset ou mudança de copy
pública: a loja continua servindo `v2.1.0-rc1.2` e o GA segue 06/04/2027.

O item **S6.11 (B1+B2 / D4+D7)** foi fechado no plano. O runner de validação do
runtime empacotado (`electron/test/validate-local-rc1.cjs`) ganhou
`verifyAnonymousAuthorization()`, que roda depois do setup e, **sem sessão**,
comprova: 20 recursos `/api/*` em **401 JSON** com `"status":401` e sem
`Set-Cookie`; 10 telas administrativas em **302** para `/login`; `/api/health` em
**200**; e `POST /api/pedidos` em 401 **sem** inserir linha em `pedido`
(contagem antes/depois via `node:sqlite` somente-leitura). A ordem importa:
antes do primeiro acesso o `InitialSetupFilter` responde `/setup` e o 302 não
provaria nada sobre o guarda. Execução de aceite: `npm run test:rc1:local` com
`EXITCODE=0`, 10/10 em 1,8 min (Tomcat/JRE distribuídos) e 10/10 em 2,2 min
(Electron); WAR `2d8a1a3d…6624A`.

No mesmo dia, dois commits anteriores fecharam a parte de código dos outros
defeitos: `2fa0c81` (D2/D3 — `test.jsp`, `usuarios-demo.jsp` e `UsuariosServlet`
fora; canais AMAZON/B2W travados por `CanalPedido.isDisponivelNaEdicaoFree()` e
`CanalPedidoTest`; ROOT do Tomcat removida no preparo do pacote; `clean package`
no CI) e `268d0be` (D1 — pré-compilação JSP `jspc-precompile` + `JspElValidationTest`
+ spec E2E de retirada/scan). Os três commits estão em `chmulato/caracore-hub`
`master` (`60135c8`); o plano e o laudo da sonda ficaram sem commit nesta data.

**Correção de honestidade registrada:** a nota antiga do item S6.5 afirmava que
`verifyRemovedDemoRoutes()` já sondava rotas anônimas — não sondava; só verificava
quatro 404. A sonda passou a existir em `verifyAnonymousAuthorization()` e a nota
foi corrigida no plano, com a evidência apontada. O que a sonda prova é
**autenticação**, não RBAC por perfil: 31/32 recursos de `/api/*` fora de
`/api/admin/*` continuam abertos a usuário autenticado e pertencem a S6.3.
Rota inexistente não vale como gate: `/api/health/live` e `/api/login` não
existem (liveness é `/api/health`; login é `/api/auth/login`).

Sprint 6 está em **2 de 14 tarefas com `[x]`** (S6.0 e S6.11); S6.1, S6.4 e S6.5
têm entrega no código mas seguem abertos porque o critério escrito é o **pacote
publicado** — a `rc1.2` ainda tem o erro de EL e ainda serve os dois JSP. Antes de
gerar a `rc1.4` (S6.10) faltam S6.12, S6.6, S6.7, S6.8, S6.9, S6.2 e S6.3; depois
vem S6.13 (E2E no pacote final, 0 FAIL). O WAR não é reprodutível entre builds
(sem `project.build.outputTimestamp`), então aceite de bytes só no binário
publicado. Detalhes: `caracore-hub/docs/contexto-rapido.md`,
`caracore-hub/docs/relatorio-s611-autorizacao-20261021.md` e
`caracore-hub/docs/plano-lancamento-rc1.md` (Sprint 6).

### Hub — produto Free + suporte recorrente (20/10/2026)

Decisão do dono: o **produto é Free** — não há licença mensal pelo Hub. O
**suporte é opcional** e tem **pagamento recorrente de R$ 79,90/mês**, o mesmo
preço do PDV Premium. O motivo é a operação: as integrações com Mercado Livre,
Shopee e Temu (credenciais, webhooks, etiquetas e mudanças de canal) geram
chamado com regularidade. A pré-release `v2.1.0-rc1.2` é de avaliação, sem
cobrança; não há checkout antes do GA de 06/04/2027.

CTA público ajustado nas quatro camadas: loja (`caracore-hub-releases`, raiz e
`docs/`), central (`caracore-loja/docs/download.html`), matriz
(`caracore-site/ecosistema.html` e `portfolio.html`) e wiki
(`caracore-wiki/docs/projeto-hub.html`). O botão primário é "Baixar pré-release
(Free)"; o secundário é "Suporte recorrente: R$ 79,90/mês", com âncora `#plano`.
Nas páginas tocadas, "sem assinatura" virou "sem assinatura digital" para não
confundir o binário unsigned com a cobrança do suporte.

### Hub — documentação pública alinhada à aplicação web 2.1 (20/10/2026)

Segunda passagem do mesmo dia, agora sobre o **texto**: `WAR` e "oficina" saíram
da copy pública da matriz, da vitrine (`caracore-hub-releases`), da wiki e da
central (`caracore-loja`). O cliente lê a **aplicação web 2.1 sobre Tomcat
embutido no instalador, com SQLite local no computador do ponto de retirada**;
o `WAR` continua existindo como artefato interno de build, fora do discurso
público. Pré-release `v2.1.0-rc1.2` e GA `06/04/2027` não mudaram; nenhuma tag
ou asset novo foi criado.

Onde a copy encosta em login e conta, ela passou a seguir o código, conferido
nesta sessão em `caracore-hub`:

- o login é por **telefone** (`login.jsp`), não por e-mail; "Lembrar" existe e
  **não** prolonga a sessão; sem `session-config` no `web.xml`, vale o padrão do
  Tomcat: a sessão expira após **30 minutos** de inatividade (configuração
  ausente = default do fornecedor, não promessa de duração infinita);
- a recuperação é **offline, por código**: `CodigoRecuperacaoService` gera
  `CODE_COUNT = 10` códigos de uso único de **27 caracteres** (Base64 URL-safe de
  `CODE_BYTES = 20`), e cada uso invalida os demais; a nova senha exige **≥12**;
- o setup cria o administrador com **≥12** e a tela de usuários exige **≥6**;
  a senha temporária gerada quando o campo fica vazio tem **8** caracteres;
- **não** existe senha por e-mail/SMS nem troca obrigatória no primeiro
  acesso; as páginas não podem prometer nenhum dos dois.

Camadas tocadas: `caracore-site` (cartão do Hub na home e fechamento de `div`
que faltava), `caracore-hub-releases` (README, `RELEASE_2.1.0-rc1.md` e nota de
leitura datada no laudo de 19/09, que fica como histórico), `caracore-wiki`
(10 páginas do manual, `projeto-hub.html`, glossário, ecossistema e
tecnologias) e `caracore-loja` (`download.html`). Commits `098fa88`,
`ceb7a51`, `3fc45d2` e `d5295f0`; o `origin/master` de cada repositório confere
com o local por `git ls-remote` e as árvores estão limpas.

Validação: varredura de 33 arquivos com 23 ocorrências, todas justificadas —
`oficina` como nome canônico da camada 3 na matriz e em `caracore-loja/AGENTS.md`,
o laudo histórico e um falso positivo do filtro em `wiki/docs/hub/admin.html`,
que afirma que o Hub **não** envia senha por e-mail nem por SMS. Checagem de HTML
ok nos 29 arquivos alterados, links do manual sem falha e nenhuma âncora
`#oficina` restante na wiki. Pendências conhecidas: as âncoras de letra do
`glossario.html` (`#I`, `#K`, `#L`, `#N`, `#Q`, `#U`, `#W`, `#X`, `#Y`, `#Z`,
`#top`) já estavam quebradas antes deste corte (dívida separada), o `README.md`
da vitrine ainda aponta o repositório privado `caracore-hub` e não houve smoke
visual no Edge.

Estado do produto segue o de 16/10: a QA da rodada 4 **não aprovou** a
`v2.1.0-rc1.2` e os defeitos D1–D6 continuam abertos no plano de lançamento.
Documentação alinhada não é aceite de QA nem GA.

### Hub — reposicionamento para PUDOs em 20/10/2026

Copy pública alinhada em `caracore-hub-releases` (vitrine `docs/` e cópias legadas da
raiz), `caracore-wiki`, `caracore-loja` e `caracore-site`: o Hub passa a ser descrito
como **gestão logística interna para pontos de retirada (PUDOs)**, não como ferramenta
de centro de distribuição nem de marketplace. Encomendas de Mercado Livre, Shopee e
Temu continuam como origem dos pacotes; Amazon e B2W seguem só no modelo de dados, sem
conector. Pré-release Windows `v2.1.0-rc1.2` e GA `06/04/2027` inalterados.

Na oficina, `/retirada/scan` deixou de avaliar EL dentro de template literal JS (o
render falhava com HTTP 500) e o filtro de canais de `PedidosListaServlet` consulta
`isDisponivelNaEdicaoFree`. Maven `2.1.0-rc1` completo: core 614, persistence 571, api
841 (8 ignorados), web 283 testes, zero falhas/erros. Publicado a pedido do dono:
`caracore-hub` `981e81c` (fix + docs de posicionamento e stack), `caracore-hub-releases`
`cd1edb0`, `caracore-wiki` `883cb3b`, `caracore-loja` `4048991`; a matriz registra este
corte aqui e em `.cursor/rules/project-memory.mdc`. Os cinco repositórios estão limpos e
iguais ao `origin/master`; nenhuma tag ou asset novo foi criado — a vitrine pública
continua na `v2.1.0-rc1.2`.


### PDV v4 — checkpoint de pausa em 18/10/2026, 14:54 BRT

Trabalho pausado por créditos de IA, sem GA aprovado. `caracore-pdv` está em `master`
`257e58c`, com Maven local `4.0.0` e alterações não commitadas; isso não é release.
Estável registrada `v3.2.12-free`; RC6 continua pré-release pública. Novas decisões:
preservar modelo/dados da 3.2.12 (migração segura ainda bloqueadora) e homologar
automaticamente em ambiente isolado/simulado, SQLite real de teste, viewport 1280×800
emulado. Automatizar o fluxo até a entrega, com publicação somente autorizada.
Relatórios existentes têm 1.294 testes, zero falhas/erros e três ignorados, sem prova
de execução única completa do candidato; não equivalem a homologação final.
M11, caminho de publicação e CTA pendentes; PERF congelada. Sem commit/push/publicação
nesta sessão. Retomar pelo [checkpoint da oficina](../../caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md#checkpoint-de-pausa--18102026-1454-brt)
e pelas [decisões de GA](../../caracore-pdv/docs/arquitetura/DECISOES_GA_V4.md).

### CSO — alinhamento de planejamento em 17/10/2026

Prevalece sobre snapshots anteriores: Frotas Web e Transportes Desktop são
duas aplicações; Virtual Tracker é capacidade integrada de localização, não
terceiro produto. Alvo conjunto **08/11/2028**, não garantia de entrega.
O [plano mestre](../../caracore-cso-transportes/docs/plano_organizado_execucao_cso.md)
registra 10 sprints locais estimadas + 21 tarefas INT em 6 etapas (0/21).
INT-01/02/03 validam baseline, viabilidade móvel e capacidade; total de sprints
e alocação ainda pendentes. MON continua 0/53, com reaproveitamento seletivo.
O [calendário empresarial](CALENDARIO_COTA_CURSOR.md) agora reconhece esse
recorte de integração em 2028, sem antecipar implementação ou mudar PDV/Hub.

Frotas permanece online-only. VT planejado: relay E2EE, sem leitura ou
persistência de posições/rotas/trânsito/envelopes, nem em logs/APM/cache/filas.
Memória transitória limitada; mapa, histórico e chave privada somente no
desktop. Presença 120 s quando necessária, posição 60 s em viagem como
perfil de referência a medir. Sem fila/recuperação offline ou promessa de
posição instantânea. Protocolo e endpoints ainda serão aprovados.

Matriz e wiki passam a apresentar a mesma proposta da loja: organizar
entregas e acompanhar deslocamentos pelo celular, com conexão, finalidade
autorizada e limites explícitos. CTA de interesse leva à loja; Frotas segue
com acesso separado. Alterações desta revisão são locais: sem commit,
push, deploy ou implementação de integração/GPS.

Validação local desta revisão: 4/4 testes Node focados no painel de
planejamento; sintaxe JS e `git diff --check` aprovados nas duas árvores.
11 páginas HTML alteradas verificadas em UTF-8, com um H1 e sem novos
links/âncoras locais quebrados ou IDs duplicados; espelhos de `AGENTS.md`
idênticos. Navegador: ecossistema, portfólio e planning sem overflow em
390/768/1366 px; painel mostra integração e INT-03, sem a exclusão antiga.
Wiki CSO tem o mesmo pequeno overflow móvel (14 px em 390 px) observado na
página Hub não alterada; não corrigido por ser layout preexistente.
Âncora Virtual Tracker e CTA da loja conferidos. Sem teste real de
localização, banda, criptografia ou capacidade nesta revisão.

**Atualizado:** 2026-10-15 · PDV Free `v3.2.12-free` estável/Latest; fonte `hotfix/3.2.12-free` `72ace488aed4ee91001c60cf40a3934ddfe8faf1`. Publicação estável/Latest autorizada em 15/10/2026, com validações pendentes. 19/19 testes focados passaram em Java 25/H2; ZIPs e hashes remotos conferidos. Suíte completa, smoke portátil com SQLite/health/navegador, execução Linux/macOS e homologação operacional completa permanecem pendentes. Não transferir aceites da 3.2.8. Windows SHA-256 `6d7a50b0acf2a05620a090eebdd48f049a1dd5599ccb6c40c419c38145f7c0e2`; Linux/macOS `795a396318da61d1bd45dcfe816879d2184706f1c7849f1cd2ad98baa99fd9c1`. Release: https://github.com/chmulato/caracore-pdv-releases/releases/tag/v3.2.12-free. Pacotes locais em `D:\temp_pdv`. A 3.2.8 permanece no histórico e a v4 RC6 continua pré-release separada. Manutenção restrita até 08/11/2026, sem GA v4 automático. Registros anteriores abaixo são históricos.
**Workspace típico:** `D:\dev\` ou `D:\onedrive\dev`  
**Guia de produtividade:** [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) ← use ao **iniciar nova tarefa**  
**Fonte mestre para IAs:** `caracore-site/AGENTS.md` — **não existe mais** `D:\onedrive\dev\AGENTS.md`, e qualquer ponteiro que mande ler o `AGENTS.md` da raiz do workspace está morto · Cursor: `.cursor/rules/ecosystem-cara-core.mdc`

### Como Gemini, Copilot e Cursor devem retomar

Comece por este documento para obter o snapshot e os handoffs; consulte em seguida **`caracore-site/AGENTS.md`** para regras de ecossistema (o `AGENTS.md` da raiz do workspace **não existe** — ponteiro morto) e a memória/arquivo de status da oficina antes de alterar um produto. Antes de compilar uma aplicação Java, leia `D:\onedrive\dev\APPS_JAVA_VERSION.md` e use o JDK declarado ali (PDV Free e v4 25, CSO Frotas 21, CSO Transportes 25, Hub 25, Ink 25, Helianto 25, RU 25, Seed 25). O Copilot do CSO lê também `caracore-cso-quarkus/.github/copilot-instructions.md`. A tabela abaixo é um índice de status, não substitui o estado operacional do repositório. Se houver divergência, prevalece o status mais recente da oficina; registre a correção nesta memória e no changelog. Confirme deploy/publicação no destino antes de afirmar que uma alteração local está no ar. Em 06/10 a aplicação `cso.caracore.com.br` já descreve a gestão de frota. A copy correspondente da matriz, da wiki e da loja `cso-transp` está alinhada no checkout e ainda não foi publicada.

### Snapshot das aplicações e frentes (atualizado em 2026-11-10)

| Aplicação / frente | Status registrado | Próximo gate ou limite | Retomada canônica |
|---|---|---|---|
| **PDV Java — versão anterior** | `v3.2.12-free`, última da linha 3.2.x, Windows/Linux/macOS, publicada em 15/10 por autorização explícita; 405 JSON, ESTORNADA/CANCELADA e V047; mesmos limites Free, sem PIX/NF-e/NFC-e. Manutenção **encerrada em 08/11/2026**; pacotes ainda disponíveis. | 19/19 testes focados passaram em Java 25/H2; ZIPs e hashes remotos conferidos. Suíte completa, smoke portátil com SQLite/health/navegador, execução Linux/macOS e homologação operacional completa nunca foram fechadas. Não transferir aceites para a v4. | `caracore-pdv` branch `hotfix/3.2.12-free` · fonte `72ace488aed4ee91001c60cf40a3934ddfe8faf1` · release `https://github.com/chmulato/caracore-pdv-releases/releases/tag/v3.2.12-free` |
| **PDV Java v4** | **`v4.0.0` lançada em 08/11/2026** (decisão escrita do dono em 04/11/2026, `D-GA-1` fechada). Release publicada em **06/11/2026** em `caracore-pdv4-releases` (tag `v4.0.0`): ZIP portátil Windows 10/11 x64 de 176.613.179 B, SHA-256 `9557e0b16d77a85e0bb68971eb0e8710356977261337a8c1c05593e893d81eac`, `SHA256SUMS` assinado com duas chaves Ed25519; T032 17/17, matriz 11/11 (M11 não medido), banco 3.2.12 migrado 9/9, sonda 20/0/1/0. Histórico: `v4.0.0-candidato-20261031`, `v4.0.0-rc6`, `v4.0.0-rc5`. | Aplicação do pacote é manual; canal `pdv-v4` serve o hash. SCA = OSV 06/11/2026 (275 pacotes, 1 alto triado por byte); NVD não medido. `PERF-001–007` congeladas. Não anunciar a 4.1.0 (Appmax/PlugNotas, em branch). Migração exige copiar o banco 3.2.x antes da primeira abertura. | `caracore-pdv/AGENTS.md` · `docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md` · release `https://github.com/chmulato/caracore-pdv4-releases/releases/tag/v4.0.0` |
| **PDV Rust** | Piloto Windows `v0.1.4`, linha independente do Java; limite de 100 vendas durante a vida do piloto. Loja e artefatos no mesmo repo de releases. | Não misturar canais, artefatos ou anunciar que substitui o Java. | `caracore-pdv-rust/docs/contexto-rapido.md` · `status.md` |
| **CSO Frotas** | Gestão de frota FRO 24/24 em produção desde 06/10 (`b90d1dc`, Flyway V33). Index com convite principal e roadmap desta versão (`e1e8d63`). Desde 10/11 serve os próprios assets, **sem Cloudflare, CDN ou Turnstile** (`f395c10`), e o cadastro voltou a gravar com a **V34** (`22bee2d`). Não é GPS. | Freeze M1 em 08/11/2026 estabiliza o que já está no ar. Sem jornada, app offline nem GPS. MON-0 não iniciado. Sem PITR no plano HOBBY: a proteção é dump diário próprio em `E:\CC_BAK_CSO`. | `caracore-cso-quarkus/docs/plano-lancamento-2026-11-08.md` · `docs/plano-gestao-frota.md` |
| **CSO Transportes + VT** | Desktop e capacidade integrada em desenvolvimento; alvo conjunto 08/11/2028, condicionado aos gates INT. | 10 sprints locais + 21 tarefas integradas (0/21); INT-03 estima total e capacidade. Loja única CSO, sem contratação antecipada. | `caracore-cso-transportes/docs/plano_organizado_execucao_cso.md` |
| **CaraCore Hub** | Download da loja: tag `v2.1.0-rc1.10` (07/11, unsigned, pré-release editorial). ZIP portátil 228.354.977 B, SHA-256 `0b18fbcf3af02d53a341ac5b83af9132a0ef201e698585160f332d3ad8bdae00`; sem instalador NSIS nesta build. Banco do produto: SQLite local (WAL) no computador do cliente. Java 25, Jakarta EE 10, Tomcat 10.1, runtime jlink. FileVersion `2.1.0-rc1.10`. Base da atualização assinada (Ed25519) embutida; canal publica manifesto assinado, sem auto-apply nesta versão. A tag `v2.1.0-rc1.8` conserva o pacote de 31/10 (ZIP 324.536.724 B), a `v2.1.0-rc1.7` o de 27/10 (EXE e ZIP), a `v2.1.0-rc1.6` o de 25/10, a `v2.1.0-rc1.1` o de 06/10 e a `v2.1.0-rc1` o instalador de 05/10. Web 2.1 concluída. Mac e Linux fora desta tag. | Login da conta real ainda sem causa confirmada. Aceite de QA da `rc1.10` ainda não foi feito: a rodada 5 reprovou a `rc1.7` (N1/N2 bloqueantes); B7 (smoke Linux x64) fechado em 07/11/2026 (run `42415755367`); S6.9 aberto. Backup/atualização automática não fazem parte deste aceite. GA 06/04/2027 mantido. Amazon/B2W não operacionais. | `caracore-hub/docs/contexto-rapido.md` · https://github.com/chmulato/caracore-hub-releases/releases/tag/v2.1.0-rc1.10 |
| **Minerador ETE** | Canal público `v1.2.3` (Ouro 4.0). | Não regredir para os bundles quebrados `v1.2.1`/`v1.2.2`. | `caracore-ete/AGENTS.md` · `.cursor/rules/project-memory.mdc` |
| **BioReator 4.0** | Community **1.1.1** publicada em 13/10/2026, Windows x64, sem assinatura. Distingue biomassa viável/total, calcula P/V pelo volume líquido e registra o primeiro critério de término em `end_reason`; mantém as melhorias cinéticas da 1.1.0. | Release `bioreator-1.1.1`: MSI 72.675.328 bytes (SHA-256 `6eb0dd01006304d78c74f185345711bc8d4e135b03443d2ab583379338b04b21`) e ZIP 73.592.557 bytes (SHA-256 `b36d18a0fae828f359db3c2a6509ad519849e560487d0ebbfaa3c3c85e09e1d7`); EXE 524.800 bytes (SHA-256 `88eb22c17b547ded71aed275021bfbbd4121b171cbaba4373dfdca96c11a609a`) fica no ZIP. Premium em 18/06/2027, sem preço e sem PIX. | Loja `ru.caracore.com.br/download.html#arquivos` · `manual-tecnico.html#criterios-fim` · `exemplo-bioreator.html` · `fundamentos-bioprocesso.html` |
| **Ink Agenda** | Desktop **`v2.2.1` é a versão atual** (Latest, publicada em 04/11/2026) para Windows (setup/ZIP) e Linux (`.deb`), unsigned; um executável com três perfis (Tatuagem, Odontologia e Beleza), equipe com papéis (Administrador/Agenda/Financeiro em `app_users`, V26) e mensageria por WhatsApp ou Telegram; macOS sem instalador. SHA-256 oficiais: ZIP `4baf257d…deef98b1`, EXE `39eafa4a…270c124b`, DEB `1b89bb76…841cef14`. A 2.2.1 corrige o download do instalador pelo app (302 seguido até 5 saltos, cada salto validado, SHA-256 obrigatório): quem está na 2.1.0 ou 2.2.0 baixa a 2.2.1 pela loja uma vez. `mvn verify` com Java 25: 713 testes, 0 falhas. Loja publicada (`f65e149`, CTA em `0805fdc`); Wiki (`0ffbc5d`), Central (`4d30e35`) e matriz (este commit) publicadas em 04/11/2026. Histórico: `v2.1.0` (03/11/2026), `v2.0.4` (02/11/2026), `v2.0.1` (07/10/2026) e a candidata `v2.0.2`. Código em `caracore-ink` `master`. **Histórico abaixo (não é o estado atual):** **02/11/2026 — `v2.0.3` publicada** em `caracore-ink-releases` (Latest) com setup, ZIP e .deb, gerados pelo workflow `Build Instaladores Nativos` na tag `v2.0.3` (`f8553bf`; correções de CI: JDK Corretto com jmods, timeout do DPAPI, BOM no token). SHA-256: setup `709032228fe47ebf21e69237f82204094e58bd313b6035f907798952a9b9c407`, ZIP `8e65aedf79acd6c9f36f4474a7ed04700021852a106652b381f0fc2ef8541ccd`, .deb `a0e4ad1d0a4738a3343f2e8e61c4dcbf5202b7814d7c7368734ad4d700229440`. 619 testes unitários, 8 do gate de logs e 58 TestFX; migration V23 remove receitas duplicadas da 2.0.2. Loja e catálogo atualizados para a 2.0.3. Sem assinatura Authenticode. Gateway (`api.caracore.com.br/releases/ink/latest.json`) já anuncia a 2.0.3 (lê a release Latest do GitHub; setup.exe + SHA-256 `709032…c407`) e o cliente 2.0.3 o reconhece como CURRENT (verificado em 02/11/2026). Pendentes: job macOS do CI (sem runner), assinatura, validação visual de Configurações. Gateway commitado em `caracore-api` e `caracore-cso-quarkus`. **Fechamento 02/11/2026:** publicação da 2.0.3 concluída para **Windows e Linux**; loja (`download.html`, commit `2a031c4`) mostra "Linux (.deb)" com link da release e "macOS (.dmg): em breve" sem link (verificado no ar; .deb responde 200). **macOS:** sem pacote porque o GitHub não alocou runner macOS; quando houver capacidade, re-disparar só o job macOS da tag, anexar o .dmg à release, trocar "em breve" pelo link e registrar o SHA-256 aqui. Job `update-notes` nunca rodou (notas publicadas à mão; corrigir o gerador antes da próxima tag). **02/11/2026 — `v2.0.4` publicada** (Latest) com setup, ZIP e `.deb`, tag `v2.0.4` em `8a2d84f`; CI `Build Instaladores Nativos` verde nas quatro jobs, inclusive macOS (`.dmg` anexado à release, fora da loja por decisão do dono). Aplica A1–A9 e assinatura Ed25519 na verificação de atualização (chave pública embutida). `mvn -B verify`: 637 testes, cobertura e gate LGPD aprovados. SHA-256: ZIP `7849d462…e6fd3`, EXE `5ea79dac…ebd1c`, DEB `30eee2bd…dfc941`. Gateway serve 2.0.4 assinado (`min_supported` 2.0.2, `mandatory` false). Loja, Wiki, Central e matriz alinhadas a 2.0.4. | **Histórico — candidata 2.0.2:** 596 testes unitários, 8 testes do gate de logs e 58 TestFX; cobertura e validação da base demo aprovadas. SHA256: setup `f9dde7c521dd64c39ee5dfa3c62bdb8c09f000bf7083c34e15fe47bc0a6cfa54`, ZIP `ab66a21bb39ab597757374ac1b4e280c1129171de54b71f36bacfe90e9171a94`. Assinatura ausente; homologação visual e teste de upgrade com cópia real da base 2.0.1 pendentes. **3.0 em PWA** não antes de 2028 (nuvem HTTPS, um SQLite por estúdio; substitui o Desktop no S9 após importação); a 3.0 **não** sai com `.dmg`/`.deb`/Electron/GluonFX — o `.deb` da 2.x é outro canal — e **não** é offline-first (o service worker guarda só a interface). **Plano atual (08/11/2026):** o Desktop **2.3.0** — data revista em 08/11/2026 para **29/01/2027**, era 06/04/2027 — entrega **apenas a P1 Onda 1** — P1.1 e P1.2.1 entregues em `6ae4f1c` (06/11/2026), P1.2.2–P1.2.8 e P1.3.1–P1.3.4 + **G1** em 08/11/2026 (**17 de 17 sub-itens**, incluindo o P1.2.8 nascido do alinhamento AL-01/AL-02; gate `mvn -B verify` 745/0 + 8 LGPD, `mvn -Ptestfx verify` 825/0 e demo V30; Onda 1 fechada tecnicamente, faltam só os prints H-A04, H-C04, H-C06 e H-A08 na semana de 10–14/11, tudo **commitado e empurrado em `3381aa3`** em 08/11/2026, 72 ficheiros, +3.214/−262); o **P1.4 foi cortado** em 06/11/2026 e passa para a Onda 2, junto com o 3.0.0-RC1. | `caracore-ink/docs/RELEASE_2.2.1.md` · `caracore-ink/docs/PLANO_PWA.md` · https://github.com/chmulato/caracore-ink-releases/releases/tag/v2.0.2 |
| **Seed** | Piloto público local gratuito sob MIT; próprio Seed sem ativação. Pré-release candidata Windows x64 `0.1.5` publicada para avaliação sem convite ou cadastro prévio; `0.1.4` release estável anterior. EXE unsigned, 216.466.586 bytes, SHA-256 `e449ca2cee74fda135ac098d2333fe674c2c476773a7d4adb60bc016a767db16`. API protegida por sessão ADMIN/CSRF e token por licença, Host validado, porta dinâmica, heartbeats com relógio UTC do servidor, payload assinado documentado e Swagger UI local. Migração aditiva compatível com bancos 0.1.3/0.1.4; SQLite, dados e chaves preservados. Homologação independente pendente; não pronto para produção. Sem monitoramento remoto; Linux fora desta etapa; código-fonte não publicado. Complementar no ecossistema, sem centralizar banco ou acesso dos outros produtos. | Preservar SQLite e chaves ao atualizar; licenças antigas podem exigir emissão/rotação do token API. Manter claro que o piloto não está homologado nem pronto para produção. | `caracore-seed/docs/memoria-projeto.txt` |
| **Reino OIDC / Circuito / Área 51** | OIDC Edição Free `v2.0.2-free` publicada na loja, sem certificado digital. Três Eras e progressão narrativa gratuitas para estudo pessoal. A edição paga está em desenvolvimento; a loja não combina PIX nesta etapa. A página de download oferece só essa tag. Circuito Ferradura `v2.0.24` publicado na loja e na release em 08/10/2026; EXE Windows sem assinatura; pacotes Windows, macOS e HTML. Área 51 com baseline `0.1.0-dev` e vitrine de consultoria. | OIDC `v2.0.1-free` e `v2.0.0`, e Circuito `v2.0.23`, ficam no histórico. São satélites: cedem prioridade de cota e headline aos produtos principais. | `caracore-oidc` · `caracore-circuito` · `caracore-area51` · https://github.com/chmulato/caracore-circuito-releases/releases/tag/v2.0.24 · https://github.com/chmulato/caracore-oidc-releases/releases/tag/v2.0.2-free |
| **MKT / Sala** | Vitrine `mkt.caracore.com.br` (CNAME → `chmulato.github.io`, restaurado em 10/10/2026). Ferramenta interna, gratuita, não vendemos. Sala `tools.caracore.com.br/sala/`. | Gratuito; não deslocar prioridade dos produtos principais. | `caracore-mkt` · `caracore-mkt-releases` · `caracore-tools` |
| **RU Soberano** | Garagem/roadmap; marco Simulador + Sala Retro previsto para 18/06/2027. | Sem abrir frente pesada fora da fila de cota. | `caracore-ru` |
| **Helianto** | Vitrine `helianto.caracore.com.br` (CNAME → `chmulato.github.io`, restaurado em 10/10/2026). Oficina/roadmap; GA 30/12/2029. | Agent em 2029, após CSO Transportes; não antecipar para 2027–2028. | `caracore-helianto` · `caracore-helianto-releases` |
| **Matriz, Central e Suporte Local** | Host público: GitHub Pages. WebP do logo branco no ar (`logo_branca.65d940959999.webp`, 117.882 bytes). 404 sem redirect automático. | `Cache-Control: max-age=600` na home, no portfólio e no WebP. | `caracore-site/docs/SITE_MATRIZ.md` |

### Status PDV Java (2026-10-08) — para IAs

| Item | Valor |
|------|--------|
| Canal loja | **`v3.2.12-free` estável/Latest** (15/10/2026), cinco assets conferidos; Publicação estável/Latest autorizada em 15/10/2026, com validações pendentes. 19/19 testes focados passaram em Java 25/H2; ZIPs e hashes remotos conferidos. Suíte completa, smoke portátil com SQLite/health/navegador, execução Linux/macOS e homologação operacional completa permanecem pendentes. Não transferir aceites da 3.2.8. |
| Artefatos Free | Windows `caracore-pdv-v3.2.12-free-windows-x64.zip`, SHA-256 `6d7a50b0acf2a05620a090eebdd48f049a1dd5599ccb6c40c419c38145f7c0e2`; Linux `caracore-pdv-v3.2.12-free-linux-x64.zip`, SHA-256 `795a396318da61d1bd45dcfe816879d2184706f1c7849f1cd2ad98baa99fd9c1`; macOS `caracore-pdv-v3.2.12-free-macos-x64.zip`, SHA-256 `795a396318da61d1bd45dcfe816879d2184706f1c7849f1cd2ad98baa99fd9c1` |
| Código Free | Branch `hotfix/3.2.12-free`, commit `72ace488aed4ee91001c60cf40a3934ddfe8faf1`. Tag de distribuição no repo público; nenhuma tag nova no repo de código. 3.2.8 e anteriores no histórico. |
| Checkout oficina `master` | `c343890` · Qute · fonte do ZIP público da candidata de 31/10/2026. A `v4.0.0-rc6` (tag `b3358fe`, fonte `681ea32`) e a `v4.0.0-rc5` ficam no histórico |
| Próximo Agent pesado | **out–nov/2026** = ciclo de RCs v4 e respectivos gates (`PLANO_LANCAMENTO_V4.md`); sem GA automático em 08/11 |
| Handoff | `caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md` · `caracore-pdv/AGENTS.md` |
| Retomada local | `v4.0.0-candidato-20261031` é a prévia pública (100 vendas finalizadas/mês), build 31/10/2026, SHA-256 `0c2003b0f99a75328f7ebe632fc20b07cb5834a3f75b6f0e97ccfb7aef83434d`. Prosseguir pelas RCs e gates; T032/M01–M11 medidos só em `ff400efd`; SCA não medido; `PERF-001–007` congeladas |

---

## Retomada em 30 segundos

1. **Nova tarefa?** → [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) (fluxo por tipo de trabalho). **Compilar Java?** → `D:\onedrive\dev\APPS_JAVA_VERSION.md` (JDK por aplicação; Maven em `D:\onedrive\dev\.m2\repository`).
2. **Status das aplicações (Gemini/Cursor):** começar pelo **§ Checkpoint 10/11/2026** (topo deste ficheiro, estado dos quatro produtos + pendências) e pelo **§ Snapshot das aplicações e frentes (10/11/2026)**; o **§ Status PDV Java (2026-10-08)** e os blocos datados são **histórico**; depois consultar a memória canônica da oficina antes de editar ou anunciar status.
3. **Visão ecossistema:** este ficheiro + `ECOSYSTEM_CARA_CORE.md` + `ECOSYSTEM_LOJAS.md` + **`caracore-site/AGENTS.md`**
4. **Produtos principais (só estes quatro):** PDV (Java **`v4.0.0` lançada em 08/11/2026**, com a `v3.2.12-free` como versão anterior e os pacotes ainda disponíveis + Rust `v0.1.4`) · CSO (gestão de frota **no ar**, FRO 24/24; freeze M1 08/11/2026; loja `cso-transp`; Transportes **08/11/2028**; ≠ GPS) · Hub (encomendas; pré-release Windows `v2.1.0-rc1.10` com base de atualização assinada; GA Windows 06/04/2027) · Ink (agenda de hora marcada; Desktop `v2.2.1` publicado em 04/11/2026; 2.3.0 planejado para 29/01/2027; 3.0 em PWA não antes de 2028). **Fora do núcleo:** OIDC, Seed, Circuito, Área 51, RU, BioReator 4.0, Helianto, MKT, Minerador — existem; em conflito de cota ou headline, **cedem**. **MKT e Helianto voltaram ao mapa de lojas em 10/10/2026** (`mkt.caracore.com.br` e `helianto.caracore.com.br` → `chmulato.github.io`; `MEMORIA_INFRAESTRUTURA_CARACORE.txt`).
4a. **Marcos PDV/CSO em 08/11/2026 — cumpridos no lado do PDV:** **(1) A PDV v4.0.0 foi lançada** (release publicada em 06/11/2026 em `caracore-pdv4-releases`, tag `v4.0.0`, ZIP 176.613.179 B `9557e0b1…d81eac`, `SHA256SUMS` assinado com duas chaves Ed25519; T032 17/17, matriz 11/11 com M11 não medido, banco migrado 9/9, canal `pdv-v4` servindo o hash). **(2) Encerrou a manutenção restrita da linha Free 3.2.x**, que passa a versão anterior com os pacotes disponíveis. O freeze M1 do CSO caiu na mesma data, sem registro de fechamento medido neste repositório. Em 05/11 nada do GA estava publicado: tag `v4.0.0` 404, `caracore-pdv4-releases` 404, canal `pdv-v4` 404 `no_release`; se um gate não fechar, a data desliza e não se anuncia como cumprida. A prévia pública `v4.0.0-candidato-20261031` (build 31/10/2026) segue como prévia até a virada; rc6/rc5 ficam no histórico e a RC7 é a rota aprovada, sem tag. CSO = freeze do que já está no ar, inclusive a gestão de frota publicada em 06/10. Não misturar com Transportes 2028.
4b. **Cota Cursor (fila única):** `docs/CALENDARIO_COTA_CURSOR.md` — US$ 20/mês · 1 produto pesado por ciclo. Página pública **Funding / Patrocínio:** `planning.html#patrocinio` (US$ 800 até dez/2029). set = CSO COE · out–nov = PDV v4 · dez/2026–06/04/2027 = **Hub** · 2028 = Transportes · **2029 = Helianto (GA 30/12/2029)**. A janela antiga de FRO em 08/abr–dez/2027 foi antecipada: os seis pilares já estão em produção desde 06/10. Ink PWA = Tab; sem Agent até folga (**não antes de 2028**). Exceção de 05/11/2026: **5 dias/mês ao Desktop 2.3.0** até 06/04/2027 (fatia, não dono de ciclo — R14 em `RISCOS_ECOSSISTEMA.md`).
4b2. **Riscos / decisão:** `docs/RISCOS_ECOSSISTEMA.md` — ler antes de mudar GA, dono de ciclo ou abrir Agent noutro produto.
4c. **CSO retomada:** aplicação `cso.caracore.com.br` · loja única `D:\onedrive\dev\caracore-cso-releases` · wiki `caracore-wiki/docs/projeto-cso.html` · app/oficina `caracore-cso-quarkus`. Em 06/10 a gestão de frota está em produção: commit `b90d1dc`, Flyway V33, suíte local 409/409. A index `e1e8d63` tem um convite principal e o roadmap desta versão. Freeze M1 até 08/11/2026. MON-0 não iniciado. Não é GPS. Transportes desktop permanece 08/11/2028.
5. **PDV Java:** oficina `caracore-pdv/AGENTS.md` · **`v4.0.0` é a linha atual desde 08/11/2026** (release publicada em 06/11/2026 em `caracore-pdv4-releases`, tag `v4.0.0`: ZIP portátil Windows 10/11 x64, 176.613.179 B, SHA-256 `9557e0b16d77a85e0bb68971eb0e8710356977261337a8c1c05593e893d81eac`, `SHA256SUMS` assinado com duas chaves Ed25519; T032 17/17, matriz 11/11 com M11 não medido, banco 3.2.12 migrado 9/9, sonda 20/0/1/0 e canal `pdv-v4` servindo o hash; aplicação manual) · loja CTA = **Baixar Free**. Free: 100 vendas/mês, 100 produtos, 1 operador, 4 vendedores, 1 loja; recibo digital por link e PDF **sem valor fiscal**; sem PIX integrado nem emissão de NF-e/NFC-e. Premium R$ 79,90/mês (PIX integrado, fiscal). A **`v3.2.12-free` é a versão anterior**, última da linha 3.2.x, com manutenção encerrada em 08/11/2026 e pacotes ainda disponíveis (Windows/Linux/macOS, `localhost:8080/login`, `admin`/`admin`). Migração para a v4: backup antes e copiar `%APPDATA%\caracore\caracore-pdv.db` para `data\caracore-pdv.db` **antes da primeira abertura**; a v4 não desfaz venda finalizada. Histórico: `v4.0.0-candidato-20261031`, `v4.0.0-rc6`, `v4.0.0-rc5`. SCA = OSV de 06/11/2026 (275 pacotes, 1 alto triado por byte), NVD não medido — nunca "0 CVE". **Não anunciar a linha 4.1.0** (Appmax/PlugNotas, em branch). Rust piloto = 100 vendas na vida. **Não** substituir o PDV Rust.
6. **PDV Rust oficina:** `caracore-pdv-rust/docs/contexto-rapido.md` · `status.md` · `caracore-pdv-continuacao.mdc`
7. **Hub oficina (GA Windows 06/04/2027):** [handoff](../../caracore-hub/docs/contexto-rapido.md) → [status atual](../../caracore-hub/project_hub/docs/STATUS-ATUAL.md) → [plano RC1](../../caracore-hub/docs/plano-lancamento-rc1.md) → [memória Cursor](../../caracore-hub/.cursor/rules/project-memory.mdc). Web 2.1 concluída. O download da loja é a tag `v2.1.0-rc1.8` em https://github.com/chmulato/caracore-hub-releases/releases/tag/v2.1.0-rc1.8 (ZIP portátil 324.536.724 B, SHA-256 `3c4e61b2e192fece6667ccfbc79d735f3fad7ce8542e50c492b9ef24a9743334`; sem instalador NSIS nesta build). A `v2.1.0-rc1.7` conserva o pacote de 27/10 (EXE e ZIP), a `v2.1.0-rc1.6` o de 25/10/2026 e a `v2.1.0-rc1.1` o de 06/10; a `v2.1.0-rc1` conserva o instalador de 05/10. A release está marcada como **Latest** no GitHub por autorização do responsável, o que não substitui o aceite formal; o rótulo editorial segue **Beta (RC)/pré-release**. Evidência da build: `clean verify` 2.585 testes/0 falhas e E1–E6 PASS em `9874273`. Mac e Linux fora desta tag. Não é GA: aceite de QA pendente (a rodada 5 reprovou a `rc1.7`; N1/N2 bloqueantes). **Login real ainda aberto:** usuário usou `npm run dev`, perfil/banco original não localizado; consultar apenas existência/status após identificar `HUB_USER_DATA_PATH`/`userData` e WAR efetivos, sem senha/hash. Recuperação offline de senha é tarefa separada. Manual: wiki.caracore.com.br/hub/
7a. **Próxima pré-release do Hub:** outra tag, com bytes novos. `v2.1.0-rc1`, `v2.1.0-rc1.1`, `v2.1.0-rc1.2`, `v2.1.0-rc1.6`, `v2.1.0-rc1.7`, `v2.1.0-rc1.8` e `v2.1.0-rc1.10` permanecem; `rc1.3`, `rc1.4` e `rc1.5` nunca foram tagueadas. Ordem: versão em `electron/package.json` e nos POMs (`2.1.0-rc1.10` desde 07/11/2026); commit com árvore limpa; instalador `scripts/build_hub_exe.ps1` (recusa árvore suja e commit posterior ao artefato), nome público `CaraCore.Hub-<versão>-win-x64.exe`, ou ZIP portátil `scripts/build_hub_portable.py` com nome `CaraCore-Hub-<versão>-windows-x64.zip`; tag em `caracore-hub-releases`; cartão em `caracore-loja/docs/download.html`; matriz em `ecosistema.html`, `portfolio.html` e `assets/js/planning-data.js` / `planning.js`; sincronizar `AGENTS.md`, este ficheiro e as regras Cursor. A oficina privada só vai ao remoto quando o dono pedir. Sem certificado no repositório e sem anunciar GA.
6a. **Seed oficina:** `caracore-seed/docs/memoria-projeto.txt` · Java 25, launcher Tomcat embutido, runtime reduzido e Electron para piloto local gratuito sob MIT; app administra clientes/licenças, auditoria, alertas e registros locais de heartbeats; `StubPaymentGateway` não processa pagamentos reais. Piloto público aberto, sem convite ou cadastro prévio. Pré-release candidata Windows x64 `0.1.5` publicada para avaliação: [release](https://github.com/chmulato/caracore-seed-releases/releases/tag/v0.1.5), 216.466.586 bytes, SHA-256 `e449ca2cee74fda135ac098d2333fe674c2c476773a7d4adb60bc016a767db16`, unsigned; `0.1.4` é a release estável anterior. API protegida por sessão ADMIN/CSRF e token por licença; Host validado e porta local dinâmica. Heartbeats usam UTC do servidor; o cliente recebe `signedPayload` RSA documentado. Migração V8 preserva bancos 0.1.3/0.1.4 e chaves; Swagger UI/OpenAPI locais sem CDN. Homologação independente pendente; não declarar pronto para produção. Linux fora desta etapa; SQLite local, sem monitoramento remoto; código-fonte não publicado. Preservar banco e chaves ao atualizar; licenças antigas podem exigir emissão/rotação de token. Seed é complementar; cada produto mantém o próprio aplicativo e banco.
6b. **Retrô:** `caracore-retro/.agents/AGENTS.md` · **149 artigos** HTML (numeração 01–149 contínua; 32 em 2024, 33 em 2025, 51 em 2026, 33 em 2027 — medido em 21/11/2026). Gates locais verdes no lote do 149: `tools/validate_site.py` **945 verificações APROVADO**, `tools/validate_social_metadata.py` **151 URLs · 149 BlogPosting · 151 WebPage** e 2 testes unitários OK. A dívida de BOM não alcança o catálogo: **0** dos 149 artigos têm BOM; os 30 HTML com BOM em `docs/` estão todos em `docs/regis/` (legado, fora do índice e do sitemap). `docs/articles.html` é um stub de redirect de 498 B com canonical para `/` — não é página indexável nem fonte de aviso de SEO.
7. **PDV Rust (loja + artefatos):** um só repo `chmulato/caracore-rust-pdv-releases` — Pages = `pdv-rust.caracore.com.br` · Releases = https://github.com/chmulato/caracore-rust-pdv-releases/releases (tag v0.1.4). Clone local: `caracore-pdv-rust-releases`. **Nunca** `caracore-pdv-releases` (Java).
8. **Copy B2B:** [DILEMA.md](DILEMA.md) · hero `#engenharia-b2b` · portfólio `#decisoes-engenharia` · tom **FinOps/híbrido** (não anti-cloud na vitrine)
9. **Suporte PME:** [suporte-local.html](../suporte-local.html) — fora do nav B2B; horários noite/sábado só lá

---

## Handover multi-IA — Ink Agenda 2.0.4 e Gateway assinado (02/11/2026)

Para Cursor, Gemini/Antigravity, Qoder ou GitHub Copilot retomarem sem depender do histórico de chat.

**Estado (tudo em `master`):** `caracore-ink` e `caracore-ink-releases` sincronizados com o remoto; as alterações de alinhamento desta rodada em `caracore-site`, `caracore-wiki` e `caracore-loja` estão no checkout e **aguardam commit/publicação autorizados**. `caracore-api` e `caracore-cso-quarkus` recebem o núcleo do Gateway.
- Ink Desktop `v2.0.4` **publicada** (Latest em `caracore-ink-releases`): setup 62.870.016 B (`5ea79dac…ebd1c`), ZIP 61.399.641 B (`7849d462…e6fd3`) e `.deb` 53.457.882 B (`30eee2bd…dfc941`), além do `.dmg` 64.775.569 B (`34eb6777…4da183`), `checksum.sha256`, `SHA256SUMS`, `checksum.md5` e os checksums por plataforma. Tag `v2.0.4` em `8a2d84f`. CI `Build Instaladores Nativos` verde nas quatro jobs, incluindo macOS.
- O `.dmg` **não entra na loja nem na Central**: decisão do dono em 02/11/2026 (macOS fica para a 3.0 em PWA). O corpo da release no GitHub ainda descreve macOS — ver pendência 2.
- Conteúdo: A1–A9 (pagamento refletido no status, «lembrar senha» com DPAPI/AES-GCM por 12 h, avisos de backup e bloqueio, orçamento rolável, código de emergência mascarado, nomes longos) e verificação de atualização assinada com Ed25519 e chave pública embutida (`/release-signing-public-key.pem`, SPKI SHA-256 `7eb05dd4…bc48a`), allowlist `github.com/chmulato`/`*.caracore.com.br`, SHA-256 antes de abrir, `mandatory`/`min_supported` e timeout de 10 s. `mvn -B verify`: 637 testes, cobertura e gate LGPD aprovados.
- Gateway `api.caracore.com.br/releases/ink/latest.json` responde **200** com envelope assinado (`key_id ink-2026-11`), `version 2.0.4`, `min_supported 2.0.2`, `mandatory false` e os três assets; medido às 00:39Z de 02/11/2026, depois de a publicação das 00:22:50Z (release) e das 00:25:11Z (setup) deixar o canal em 404 por ~15 min de cache vazio.
- Superfícies alinhadas: loja `ink.caracore.com.br`, Central `download.caracore.com.br` (catálogo JSON + cartão), Wiki (`projeto-ink.html`, `projetos-overview.html`, `status.html`) e matriz (`portfolio.html`, `ecosistema.html`, `index.html`).

**Pendências, em ordem sugerida:**
1. Corrigir a interação publicação × cache do Gateway: hoje um manifesto incompleto fica 15 min em cache (`PT15M`) e o canal responde 404 até expirar. Opções: publicar a release depois de todos os assets ou não guardar manifesto vazio. Exige autorização para alterar/deployar.
2. Decidir o destino do `.dmg` e das notas da release: o corpo do GitHub cita macOS 13+, mas a loja diz que macOS não tem instalador. Alinhar o corpo (ou assumir macOS na copy) antes da próxima tag; o gerador `update-notes` continua escrevendo Java 21/pasta `AgendaInk\`.
3. Testar de verdade a atualização 2.0.3 → 2.0.4 com a chave embutida e um manifesto assinado (o caminho de erro também).
4. Validação visual de Configurações (1366×768, 100% e 125%) e do botão que abre a página de releases.
5. Assinatura Authenticode: depende de certificado e `signtool`; os textos públicos avisam do SmartScreen.

---

## Handover multi-IA — Ink Agenda 2.0.3 e Gateway (02/11/2026)

Para Cursor, Gemini/Antigravity, Qoder ou GitHub Copilot retomarem sem depender do histórico de chat.

**Estado (tudo em `master`, árvores limpas e sincronizadas em `caracore-ink`, `caracore-site`, `caracore-wiki`, `caracore-ink-releases`, `caracore-api`, `caracore-cso-quarkus`):**
- Ink Desktop `v2.0.3` **publicada** (Latest em `caracore-ink-releases`): setup, ZIP e .deb; SHA-256 na linha do Ink do changelog abaixo. Tag `v2.0.3` em `c67407e` (tag object `f8553bf`). Loja `ink.caracore.com.br/download.html` (commit `2a031c4`): Windows em destaque, "Linux (.deb)" com link, "macOS (.dmg): em breve" sem link.
- Gateway `api.caracore.com.br/releases/ink/latest.json` responde 2.0.3 (setup + SHA-256); cliente 2.0.3 reconhece como CURRENT. Fonte primária da especificação: `caracore-api`; produção ainda faz deploy de `caracore-cso-quarkus` (réplica temporária). Sincronizar o núcleo com `caracore-api/scripts/sincronizar_nucleo_cso.py --aplicar` e conferir com `verificar_nucleo_cso.py`. Rotas neutras (ver seção Gateway acima).
- App usa **Java 25** embutido (não 21) e JavaFX + SQLite (sem Quarkus no desktop).

**Pendências, em ordem sugerida:**
1. Corrigir o gerador de notas do job `update-notes` (escreve Java 21 e pasta `AgendaInk\` inexistente); hoje as notas da release foram editadas à mão e a próxima tag as sobrescreveria.
2. Portar `caracore.api.apps.ink.repo` / `asset-regex` (e a variável `CARACORE_API_APPS_INK_REPO`) para `caracore-api` antes de mover o deploy de produção.
3. macOS: o GitHub nunca alocou runner. `gh run rerun --failed` reusa o workflow antigo e reconstruiria tudo; o caminho seguro é adicionar ao workflow um `workflow_dispatch` só do job macOS para a tag existente (sem mudar hashes de Windows/Linux), anexar o .dmg, trocar "em breve" pelo link e registrar o SHA-256.
4. Validação visual de Configurações (1366×768, 100% e 125%) e do botão que abre a página de releases.
5. Assinatura Authenticode: depende de certificado e `signtool` (inexistentes); textos públicos avisam do SmartScreen.

**Armadilhas conhecidas:** JDK Temurin não traz `jmods` (ProGuard falha), o CI usa Corretto · `token.txt` (gitignored, nunca imprimir) é `NAME=value` com BOM · PowerShell `Set-Content -Encoding utf8` grava BOM (usar `edit` ou UTF-8 sem BOM) · o `download.html` de `caracore-site/delivery/ink` é só redirecionamento; a página real fica em `caracore-ink-releases/docs/` · não anunciar a 3.0 com data · não commitar/push sem pedido explícito do dono, e commits com o trailer `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>` quando feitos pelo Copilot.

---

## Presenças web (2026-10-05)

| Papel | URL | Repo |
|-------|-----|------|
| Matriz | https://www.caracore.com.br/ | caracore-site |
| Suporte PME (PT) | https://www.caracore.com.br/suporte-local.html | caracore-site |
| B2B EN | https://www.caracore.com.br/aligned/en/ | caracore-site |
| B2B IT | https://www.caracore.com.br/aligned/it/ | caracore-site |
| Portfólio | https://www.caracore.com.br/portfolio.html | caracore-site |
| Eco Mundo (matriz) | https://www.caracore.com.br/ecosistema.html | caracore-site |
| Planning (torres 0–100% + Funding) | https://www.caracore.com.br/planning.html · [#patrocinio](https://www.caracore.com.br/planning.html#patrocinio) | caracore-site |
| Wiki | https://wiki.caracore.com.br/ | caracore-wiki |
| Retrô | https://retro.caracore.com.br/ | caracore-retro |
| Sala operações | https://tools.caracore.com.br/sala/ | caracore-site / caracore-mkt |
| MKT vitrine | https://mkt.caracore.com.br/ | caracore-mkt-releases |
| Helianto vitrine | https://helianto.caracore.com.br/ | caracore-helianto-releases |
| PDV Java loja | https://pdv.caracore.com.br/ | caracore-pdv-releases |
| PDV Rust loja + artefatos | https://pdv-rust.caracore.com.br/ · https://github.com/chmulato/caracore-rust-pdv-releases/releases | `caracore-rust-pdv-releases` (clone local `caracore-pdv-rust-releases`) |
| CSO Produção (Frotas) | https://cso.caracore.com.br/ | caracore-cso-quarkus |
| CSO loja única (Frotas + Transportes) | https://cso-transp.caracore.com.br/ | caracore-cso-releases · clone `D:\onedrive\dev\caracore-cso-releases` |
| Hub vitrine | https://hub.caracore.com.br/ | caracore-hub-releases |

**Correção wiki (jun/2026):** portfólio **não** está em `wiki.caracore.com.br/portfolio.html` — usar **www**; wiki tem redirect stub.

---

## Modelo fixo (camadas)

| Camada | Repositório | Destino |
|--------|-------------|---------|
| **Matriz** | caracore-site | www.caracore.com.br |
| **Loja** | caracore-*-releases | *.caracore.com.br |
| **Releases** | GitHub *-releases | binários + SHA256 (PDV Rust) |
| **Oficina** | caracore-{produto} | código / CI |
| **Wiki** | caracore-wiki | wiki.caracore.com.br |
| **Retrô** | caracore-retro | retro.caracore.com.br |

**Regras:** CTAs de download → loja ou GitHub Releases · documentação de produto → wiki.caracore.com.br · **quem entra / perfis de demonstração** → loja daquela linha (não a wiki como fonte de senha) · matriz → `portfolio.html#{âncora}` · PDV comparação → `#pdv-coexistencia` · sem `/delivery/` em links novos.

**IAs (progressivo):** uma camada por vez; depois de corte ou copy no ar, atualizar `AGENTS.md`, este changelog e `.cursor/rules` do repo. Não misturar Java e Rust.

---

## PDV Java + Rust — referência rápida

**Marco v4 (04/10/2026) — snapshot desse dia:** em 04/10, `v4.0.0-rc4` era a pré-release pública da edição Free, para avaliação e com limite de 100 vendas finalizadas por mês civil — ZIP portátil Windows x64 unsigned; MSI não incluído. O asset remoto foi verificado após download; SHA-256 `31a0cdeda68dce058079c5d0d3d5652084ba8a8cc073dfce60e021c4b3c1fdf2`. A execução 20 do workflow antigo de validação falhou porque procurou EXE na release e resolveu o latest estável; o workflow foi atualizado localmente para validar ZIP/sidecar, ainda sem novo dispatch. T032 segue aberto pelo roteiro operacional formal; Edge/Windows 1280×800 e troca obrigatória de senha inicial estão resolvidos; `PERF-001–007` seguem congeladas. Naquele dia, a RC4 não era GA nem download estável. Launcher `iniciar_pdv.bat` (underscore); banco só `./data/caracore-pdv.db`. **Não** misturar com Free estável (`iniciar-pdv.bat` hífen; `%APPDATA%\caracore\`). A frente GA público 08/11/2026 continua condicionada ao aceite dos gates. Na mesma data o CSO congela a gestão de frota já publicada em 06/10. Nessa data, `v3.2.6-free` era a versão estável e multiplataforma. O canal estável passou a `v3.2.7-free` em 07/10/2026. O estado vigente está no topo deste ficheiro: download público `v4.0.0-rc5`; `v4.0.0-rc6` em preparação, SHA-256 a publicar.

**Planos Java** (`PlanoLicencaService`): Free = 100 vendas/mês, 100 produtos, 1 operador, 4 vendedores, 1 loja, sem PIX integrado ou NF-e/NFC-e. A copy pode informar recibo digital por link e PDF, sempre **sem valor fiscal**. Premium = R$ 79,90/mês, sem teto de 100 vendas, com PIX integrado e trilha fiscal. Loja: CTA = **Baixar Free (3.2.12)**; Premium via demonstração. A `v3.2.12-free` é atualização corretiva da linha 3.2.x, em manutenção restrita até 08/11/2026. Rust `v0.1.4` = 100 vendas na vida do piloto.

| Papel | Repo / URL |
|-------|------------|
| Java maduro | pdv.caracore.com.br · **v3.2.12-free** · caracore-pdv (`hotfix/3.2.12-free`) |
| Java v4 candidata 31/10 | prévia pública (build 31/10/2026) · 100 vendas finalizadas/mês · SHA-256 `0c2003b0f99a75328f7ebe632fc20b07cb5834a3f75b6f0e97ccfb7aef83434d` · rc6/rc5 no histórico · não GA |
| Rust piloto | pdv-rust (vitrine) · tag GitHub **v0.1.4** em `caracore-rust-pdv-releases` · oficina `caracore-pdv-rust` |
| Coexistência | portfolio `#pdv-coexistencia` · não substituir Java |
| Comunicação | Retrô art. **115** (B2B/IA) · art. 114 (PDV Rust) · wiki projeto-pdv* |

**Discurso:** v3.2.x = Java · v0.1.x = Rust · V3 negócio (PME) = ambas · evitar “PDV v3” sozinho / “migração” / “substitui”.

---

## Minerador 4.0 (ETE) — referência rápida

**Canal público (08/09/2026):** **v1.2.3** na loja `ete.caracore.com.br` e em [caracore-ete-releases/releases/latest](https://github.com/chmulato/caracore-ete-releases/releases/latest). Mesmo binário Free × Premium (Ouro 4.0, R$ 29,90). Flask local `127.0.0.1:5150`.

| Papel | Repo / URL |
|-------|------------|
| Loja | ete.caracore.com.br · tag **v1.2.3** · Windows `.exe` + `.zip`, Linux `.tar.gz`, macOS `.dmg` |
| Oficina | `caracore-ete` · `AGENTS.md` (bloco Canal público) · `.cursor/rules/project-memory.mdc` |
| Matriz | `portfolio.html#minerador-ete` · badge v1.2.3 em `index.html` / `ecosistema.html` |
| Wiki | `projeto-minerador.html` |

**Não regressar:** v1.2.1 = launcher ~5 MB sem `_internal`; v1.2.2 = Flask morto (`pyarmor_runtime` em falta). GO = exe de dezenas de MB + porta 5150. Delivery automático da loja falha (PAT); publicar com `gh` local.

---

## BioReator 4.0 — referência rápida

**Community 1.1.1 publicada em 13/10/2026.** Simulador desktop de bioinsumos e fermentação. A oficina é a do RU (`caracore-ru`). A loja do produto é **`https://ru.caracore.com.br/`**; a Central de Downloads também lista os artefatos.

| Papel | Onde está |
|-------|-----------|
| Community | *Bradyrhizobium japonicum*, batelada, gráficos, histórico local e CSV com estimativa configurada de UFC/mL. A 1.1.1 distingue biomassa viável/total, calcula P/V pelo volume líquido e registra o primeiro critério de término em `end_reason`; mantém os efeitos de oxigênio, temperatura e pH, fase lag, decaimento celular e término por esgotamento do substrato introduzidos na 1.1.0. |
| Pro | Catálogo, batelada alimentada, custos informados pelo operador e PDF. Sem preço e sem PIX. |
| Versão | Community **1.1.1**, release `bioreator-1.1.1`. Premium do mesmo produto em 18/06/2027. Maven da oficina permanece `ru-free` `1.0.0-SNAPSHOT`. |
| Artefatos | MSI 72.675.328 bytes, SHA-256 `6eb0dd01006304d78c74f185345711bc8d4e135b03443d2ab583379338b04b21`. ZIP 73.592.557 bytes, SHA-256 `b36d18a0fae828f359db3c2a6509ad519849e560487d0ebbfaa3c3c85e09e1d7`. EXE dentro do ZIP, 524.800 bytes, SHA-256 `88eb22c17b547ded71aed275021bfbbd4121b171cbaba4373dfdca96c11a609a`. Sem assinatura. |
| Loja | `https://ru.caracore.com.br/bioreator.html` · downloads em `download.html#arquivos` · manual `manual-bioreator.html` · critérios `manual-tecnico.html#criterios-fim` · fundamentos `fundamentos-bioprocesso.html` · exemplo `exemplo-bioreator.html` |
| Oficina | `caracore-ru/docs/PLANO_SPRINTS_BIORREATOR.md` · `docs/MANUAL_OPERADOR_BIOREATOR.md` |
| Matriz | `portfolio.html#bioreator40` · `ecosistema.html` |
| Wiki | `projeto-bioreator.html` · `bioreator-tecnico.html` |

*Bacillus thuringiensis* descreve só o crescimento. A medição da máquina de 10/10/2026 ficou em 3,8 s e 175 MB, acima dos limites internos de 2,5 s e 120 MB. O lançamento de 18/06/2027 continua sendo o do RU Soberano. Fora da cota de outubro.

---

## Âncoras portfólio (matriz)

| Produto | Âncora |
|---------|--------|
| PDV Java | `#caracore-pdv` |
| PDV Rust | `#caracore-pdv-rust` |
| Coexistência PDV | `#pdv-coexistencia` |
| Decisões / impacto | `#decisoes-engenharia` |
| Hub | `#caracore-hub` |
| Minerador 4.0 | `#minerador-ete` |
| BioReator 4.0 | `#bioreator40` |
| Reino OIDC | `#reino-oidc` |
| Circuito | `#circuito-python` |
| Ink | `#caracore-ink-agenda` |
| Seed | `#caracore-seed` |
| Área 51 | `#area-51` |
| RU | `#caracore-ru` |
| CSO | `#caracore-cso` |
| MKT / Sala | `#caracore-mkt` |

---

## Repositórios e memória Cursor / IA

| Repo | Referência de Memória | Notas |
|------|-----------------------|-------|
| Workspace raiz | `AGENTS.md` | Guia mestre para IAs |
| caracore-site | `docs/ECOSYSTEM_*.md` | Matriz institucional |
| caracore-wiki | `docs/ecosistema.html` | Wiki institucional |
| caracore-cso-quarkus | `AGENTS.md` / `docs/memoria-agente-p0.md` | Frotas Web em produção |
| caracore-retro | `.agents/AGENTS.md` | 149 artigos · capa `<picture class="article-hero">` (WebP 720/1600 + PNG) · gate local 945 APROVADO · BOM só em `docs/regis/` (30), nenhum nos artigos |
| caracore-pdv-rust | `docs/contexto-rapido.md` | Oficina PDV Rust |
| caracore-hub | `docs/contexto-rapido.md` · `.cursor/rules/project-memory.mdc` | Web 2.1 validada em Java 25; GA Windows 06/04/2027 |
| caracore-seed | `docs/memoria-projeto.txt` | Piloto público MIT local; pré-release candidata Windows 0.1.5 para avaliação, sem convite; API protegida e porta dinâmica; documentação local sem CDN; homologação independente pendente; Linux fora desta etapa |
| caracore-hub-releases | `.cursor/rules/project-memory.mdc` | Loja hub.caracore.com.br |
| caracore-pdv-rust-releases | Sim | Loja pdv-rust |
| caracore-pdv | `AGENTS.md` · `docs/arquitetura/STATUS_ATUAL_APLICACAO.md` · `CONTINUIDADE_DESENVOLVIMENTO.md` · `.cursor/rules/project-memory.mdc` | Free `v3.2.12-free` no ramo `hotfix/3.2.12-free`; `master` `c343890` é a fonte do ZIP público v4 `v4.0.0-candidato-20261031` (SHA-256 `0c2003b0f99a75328f7ebe632fc20b07cb5834a3f75b6f0e97ccfb7aef83434d`); `v4.0.0-rc6` (tag `b3358fe`, fonte `681ea32`) e `v4.0.0-rc5` no histórico; RC7 é a rota aprovada, sem tag; Gate E de 29/10 recusou o GA; T032/M01–M11 medidos em `ff400efd`; SCA não medido; `PERF-001–007` congeladas |
| caracore-pdv-releases | `.cursor/rules/project-memory.mdc` | Loja pdv.caracore.com.br · CTA Baixar Free (3.2.12) · Free 100/mês · sem PIX integrado |
| caracore-ete | `AGENTS.md` · `.cursor/rules/project-memory.mdc` | Canal **v1.2.3**; Windows onefile+ZIP; PyArmor no bundle; Flask 5150 |
| caracore-ete-releases | `docs/artifacts/VERSION` | Loja ete.caracore.com.br · Latest v1.2.3 |
| Demais produtos | Sim | ink, ru, … |

Lista completa: `ECOSYSTEM_CARA_CORE.md`.

---

## Estado recente do ecossistema (changelog)

| Data | Alteração |
|------|-----------|
| 2026-11-22 | **Ink Agenda (Desktop 2.3.0): dia 1 da cota de dezembro fechou as quatro etapas da OS `PROMPT_INK_BUILDER_2026-12-01.txt` — P1.13 implementado, R-C06 ensaiado três vezes e H-A08 executado.** `RestoreService` passou a aceitar que **a senha do dossiê autorize o vínculo à máquina nova** (`app_identity.hardware_id` regrava; dossiê legado sem senha continua preso à origem; falha em instalação limpa apaga o resíduo; trilha `event=dossier.restore.link` só com hashes curtos, sem migração — `V31` segue livre). Gate remédio na árvore: `mvn -B verify` **759/0** (+8 LGPD = **767**), `mvn -Ptestfx verify` **852/0** (85 ITs), demo **V30**. Homologação: **H-A09 e H-B01 viraram Conforme** (relogin do dono executado em `b1-20261201`), H-B02/H-B03 reconfirmados e o **H-A08** foi registrado como **evidência de release do RK-01 sem mudar de status** (`.inkbak` criado pela **2.2.1 publicada** — 11 225 B, SHA-256 `1f680083…609f` — restaurado em `b7` limpa: contagens e UUIDs idênticos, schema V30, `outcome=kept`, nenhum agendamento sem profissional). Observação do caminho de **restauro** (a migração V26→V30 roda dentro do `RestoreService` e não chama o `snapshotBeforeMigration` do R-C04, então quem sobe por dossiê fica sem a «cópia anterior à actualização») **decidida no mesmo dia pelo dono como `RK-30`, limitação declarada para a 2.3.0**, sem código de banco antes do corte; contorno declarado nas notas e em `agenda-java/docs/BACKUP.md`: o próprio `.inkbak` de origem é a cópia externa imutável anterior à operação. Tudo em sandbox (`b3`/`b1`/`b4`–`b7`), base real do AppData conferida intacta; **commit local do lote P1.13 + registro documental a pedido do dono; sem push, sem etiqueta, sem publicação** — produto no ar segue o **2.2.1** com canal keyless; entrega do 2.3.0 continua **29/01/2027**. Evidência local (fora do Git): `caracore-ink/docs/evidencias/homolog-p1-20261201/`.
| 2026-11-10 | **Blogs Retrô e pessoal publicando no LinkedIn com thumbnail da capa, validado ponta a ponta nos dois:** a capa do artigo (`og:image`) sobe pela Images API (`initializeUpload` → PUT dos bytes → `urn:li:image` no `thumbnail` do card; o LinkedIn não faz scraping de URL) e falha de upload não bloqueia o post. **Retrô** (`caracore-retro`): `tools/publish_linkedin.py` + job `publish-linkedin` do `deploy.yml`, modo manual por `workflow_dispatch` (input `article`), header `LinkedIn-Version: 202601` obrigatório, URL nunca solta no commentary (o markdown corrompe `_`), página de privacidade nova em `docs/privacidade.html` — posts 143 e 144 republicados com capa e **imagem confirmada no card** (`urn:li:share:7526091630282596352`, `urn:li:share:7526092112099082241`). **Pessoal** (`caracore-personal`): `linkedin_rss_auto.py` + `publish-linkedin.yml` (ledger `linkedin_published.json`, log do `urn:li:share` para validação externa), artigo de 09/11 republicado com `force` e **imagem confirmada no card**. **Credenciais:** secrets `LINKEDIN_ACCESS_TOKEN` + `LINKEDIN_AUTHOR_URN` (Retrô, app «Artigos Retrô») e `LINKEDIN_ACCESS_TOKEN` + `PERSON_URN` (pessoal, app «Blog Dev») — o `sub` é pairwise por app, os URNs **não** são intercambiáveis; tokens gerados em 10/11/2026, expiram **~09/01/2027** → renovar até **05/01/2027** (lembretes `.ics`, um por blog, em Downloads). Detalhes completos nas memórias locais `.cursor/rules` dos dois repos. Pendências do dono: apagar posts antigos sem imagem/duplicados e cadastrar a URL de privacidade nas Settings do app LinkedIn. Nenhuma versão de produto mudou. |
| 2026-11-10 | **CSO em produção: rede de segurança própria (dump diário em HD removível, restauração provada) e senha do banco rotacionada:** o Postgres do Railway está no plano **HOBBY** e não tem PITR, bucket nem backup agendado (`railway postgres history`, medido em 10/11/2026). A proteção passou a ser a rotina `E:\CC_BAK_CSO\backup-cso.sh`: `pg_dump -Fc -Z9` por `railway ssh`, retenção de **30** arquivos, log em `logs/backup.log`, lock com tratamento de resíduo velho, 3 tentativas com 10 s em timeout, agendamento diário por `schtasks` mais launcher VBS na pasta Iniciar (o `onlogon` exige elevação) para catch-up com `StartWhenAvailable` e sem bloqueio por bateria. Cada arquivo é checado por magic `PGDMP`, tamanho > 1 KB, TOC por `pg_restore -l` conferido contra `select count(*) from pg_tables where schemaname='public'` (22) e `sha256` ao lado. **Restauração provada** em container descartável `postgres:18`: contagens idênticas às da produção (tenant=2, usuario=4, veiculo=7, migracoes=30, tabelas=22). Limite declarado: é dump diário, **não** PITR — perde-se até o dia; PITR/Pro segue **decisão de custo do dono**. No mesmo dia a **senha do usuário `postgres` foi rotacionada** (escopo autorizado pelo dono): 6 variáveis literais atualizadas (`Postgres`: `POSTGRES_PASSWORD`, `PGPASSWORD`, `DATABASE_URL`; `caracore-cso-quarkus`: `DATABASE_PASSWORD`, `PGPASSWORD`, `DATABASE_URL`), `ALTER USER`, deploy `f7b103d8` SUCCESS às 21:42Z e `/q/health/ready` UP com o check de banco; prova positiva e negativa **pela rede privada**, porque `local`, `127.0.0.1/32` e `::1/128` são `trust` no `pg_hba` e o loopback daria verde falso. Motivo da rotação: a senha havia sido impressa no chat por `railway connect --tunnel-only`. O banco não tem endpoint público (só `postgres.railway.internal`). Nenhuma versão, tag, data ou gate de produto mudou. |
| 2026-11-10 | **Checkpoint de fim do dia registrado no topo deste ficheiro**, com o estado dos quatro produtos, a regra de superfície local, a operação/segurança do CSO e seis pendências abertas (aceite da `rc1.10`, prints do Ink, PITR × dump diário, purga do tenant `2`/usuário `53`, conflitos sitemap × `noindex`, rodapé da Central sem commit). Correção de coerência junto: a «Retomada em 30 segundos» ainda dizia **três** produtos principais e listava o **Ink como satélite**, contra a decisão de 09/11/2026 — passou a quatro, com o Ink no núcleo. |
| 2026-11-10 | **[Não publicado] Central de Downloads: rodapé alinhado ao núcleo de quatro produtos** em `caracore-loja/docs/index.html` (PDV 4, Hub, CSO Frotas e Ink Agenda nas colunas, satélites no bloco secundário). Alteração só no checkout local, **sem commit e sem deploy**; não altera versão, data ou gate. |
| 2026-11-10 | **CSO Frotas: cadastro devolvia 500 por sequence do seed, corrigido na V34 e publicado** (`22bee2d`, CI `42873488518` `success`, Railway `SUCCESS`, Flyway `now at version v34`) o smoke com dados válidos bateu em `duplicate key value violates unique constraint "tenant_pkey"` (Key `(id)=(1)`), porque `V3__seed_cso.sql` insere o tenant de demonstração com id explícito e o Postgres não avança a sequence; a `V13` religou as tabelas `tb_*` mas esqueceu `tenant`. A `V34__resync_sequences_seed.sql` faz `setval(pg_get_serial_sequence('tenant','id'), GREATEST(MAX(id),1))`; `tb_cambio_referencia` não entra porque o id dela é `SMALLINT` explícito, sem sequence. Prova depois do deploy: `POST /cadastro` 200 com chave de recuperação e sessão, `GET /api/v1/usuarios` devolvendo usuário `53` / `tenantId` `2` / `ADMIN`, `/dashboard` 303 para `/lgpd/termos`. O smoke criou tenant `2` (`SMOKE QA CSO 20261110`, sem CNPJ) e usuário `53` (`smoke.qa.20261110@example.com`), removíveis em `/ops/tenants/2/purgar` com a sessão do dono. Nenhuma versão, tag ou data de produto mudou. |
| 2026-11-10 | **CSO Frotas: aplicação servida local, sem Cloudflare nem CDN, publicada em `f395c10` (CI `42869460638` `success`, Railway `SUCCESS` no mesmo commit):** `TurnstileCaptchaService` e as chaves `CSO_CAPTCHA_*` removidos (do código, do workflow e do `pipeline_local.py`), Pico 2.1.1 e Inter latin/latin-ext servidos pela própria aplicação, Google Fonts e jsDelivr fora das 17 telas, e o iframe do YouTube virou fachada click-to-load com capa local. No ar: CSP sem `challenges.cloudflare.com` e sem CDN (só `frame-src` do YouTube), assets 200 com os bytes locais, landing com 0 requisição externa antes do clique, `/cadastro` sem Turnstile e com honeypot + `formToken`, `/q/health` `UP` e `/q/openapi` 404. Anti-bot do cadastro continua local (honeypot, HMAC e rate limit). Nenhuma versão, tag ou data de produto mudou. |
| 2026-11-10 | **Blog pessoal: trava de consentimento do GA4 no `analytics.js`, publicada em `df71835` com Pages `built` em `d73b8d7`:** antes da correção, medido ao vivo, o blog carregava o `gtag.js` e gravava `_ga`/`_ga_MKFC9G3CL0` em `.caracore.com.br` na própria carga, sem banner e sem consultar consentimento. Passa a seguir a matriz — Consent Mode v2 negado por padrão, `cc-ga-consent` com migração de `lgpd-consent`, banner Aceitar/Recusar de 44 px, exclusão de `_ga`/`_gid`/`_gat` ao recusar e tag só depois do aceite. Seis cenários medidos no site publicado (0 requisição e 0 cookie antes da ação; 2 requisições e cookies só no aceite; legado `accepted` tratado como aceite), 280 de 282 páginas cobertas (3 diretas + 277 pelo `main.js`; `articles.html` e um `README.html` não rastreiam) e layout de 390×147 no celular e 1366×73 no desktop. Arquivo no ar idêntico ao local (7.605 B, `b282fd24…c2cf`). Ressalva: sem `?v=`, com `max-age=600`, quem tinha o arquivo velho em cache pode disparar GA por até 10 min. Nenhuma versão de produto mudou. |
| 2026-11-10 | **Regra de superfície local fixada e lote de assets publicado nas 8 lojas (push + Pages `built` + conferência ao vivo):** navbar da loja OIDC em 2 linhas e sem overflow (`1eb9b0b`), 190 páginas com `rel="icon"` e as seis lojas com o ícone institucional (`719c237`, `4ddb23a`, `8f6e770`, `25e8cb8`, `0911e99`, `9e47694`), e ícone órfão do PDV removido (`6fe7d0c`). Nenhuma versão dos quatro produtos mudou. |
| 2026-11-09 | **Núcleo público passa de três para quatro produtos: PDV, CSO, Hub e Ink Agenda (decisão do dono; nada commitado nem publicado):** o Ink Agenda deixa de ser satélite e entra no núcleo; PDV Rust piloto, Minerador, BioReator, OIDC, Circuito, Seed, Helianto, MKT e Área 51 continuam fora do núcleo e **não disputam** headline, CTA, catálogo nem destaque. A ordem canónica ficou **PDV, CSO, Hub, Ink** em prosa e em cartões. Na Central de Downloads (`caracore-loja`) a vitrine passou a destacar os quatro. Na matriz (`caracore-site`), `catalog-data.js`, `planning-data.js` (NOTE e `notInEnvelope`) e `planning.js` foram conferidos — `portfolio.html` já trazia o Ink como `PRODUTO 04`. Na wiki (`caracore-wiki`): `ecosistema.html` (linha de núcleo com quatro cartões, Ink fora de "Demais produtos", subtítulo "Quatro produtos-chave"), `projetos-overview.html` (catálogo renumerado 1…13, quatro primeiros primeiro, Ink em `#caracore-ink`), `trilha-cliente.html` (quarto cenário e selo "PDV, Hub, CSO, Ink"), `status.html` (acordeão próprio do Ink), `index.html` (quarto cartão e o link "Agendar e Receber"), `trilha-socio.html`, `guia-estagiario.html`, `assets/js/wiki-search.js` e o grid de quatro colunas em `wiki-responsive.css`. Nos canónicos: `AGENTS.md` (cabeçalho, parágrafo do núcleo, tabela de produtos com linha nova do Ink e nota datada, gravados por bytes para não tocar a codificação legada), `.cursor/rules/ecosystem-cara-core.mdc`, `docs/RISCOS_ECOSSISTEMA.md`, `docs/CALENDARIO_COTA_CURSOR.md`, `docs/VALIDACAO_NEGOCIO.md`, `docs/INICIAR_NOVA_TAREFA.md` e `docs/PORTFOLIO_README.md`. **Sem efeito em versão, data ou gate:** Ink 2.3.0 continua planejado para 29/01/2027 com conteúdo não publicado, Hub em `v2.1.0-rc1.10` com aceite pendente, CSO Transportes em 08/11/2028, linha 4.1.0 do PDV não anunciada; a cota segue em **um produto pesado por ciclo** e a fatia de 5 dias/mês do Ink 2.3.0 continua cedendo ao núcleo. |
| 2026-11-08 | **Ink: data da entrega do 2.3.0 revista de 06/04/2027 para 29/01/2027 (decisão do dono):** o corte usa a Fase 1/2A do Hub — os 3 dias de abril da fatia Ink (01, 02 e 05/04) são exatamente a Fase 4, a única janela reservada a retrabalho S1/S2 do Hub —, e **mar–abr/2027 ficam intocados**. A fatia passa a gastar **nov+dez+jan (15 dias)** e devolve **13 dias (fev–abr) ao envelope do núcleo**. Risco assumido e registrado: um atraso de uma semana cai direto no **G2 do Hub (05/02/2027)**; o gate do Ink continua a não se cortar para caber na data. Propagado em `caracore-ink` (ROADMAP_P1, CHECKLIST_RELEASE_2_3_0, AGENTS, PLANO_PWA, ROADMAP, PLANO_ALINHAMENTO, REGISTRO_RISCOS, EPICO_J_MP, matriz e índices) e neste repositório (AGENTS, CALENDARIO_COTA_CURSOR, RISCOS_ECOSSISTEMA, ECOSYSTEM_CARA_CORE, este ficheiro). Nada publicado: produto no ar continua o 2.2.1 |
| 2026-11-08 | **Ink: Onda 1 commitada e empurrada em `3381aa3` (nada publicado como produto):** a árvore de 73 entradas do fecho do dia (63 modificadas + 10 novas) foi auditada, o gate foi remédido na árvore exacta (745/0 + 8 LGPD e 825/0, demo V30) e foi publicado o commit `feat(2.3.0): P1.2.4–P1.2.8, presença e G1 da Onda 1` — 72 ficheiros, +3.214/−262, sobre `b4fe1dd`; `master` em sincronia com `origin/master` e árvore limpa. Em seguida, `eebf76d` acertou os pontos de retomada no próprio repo (AGENTS, ROADMAP_P1, PLANO_ALINHAMENTO, CHECKLIST_HOMOLOGACAO, CHECKLIST_RELEASE, project-memory e nova linha no REGISTRO_RISCOS) e este commit acerta as superfícies do ecossistema. **O que não mudou:** o download continua o **2.2.1**, o canal segue **keyless**, não houve tag, release nem deploy, e nenhum caso `H-*` muda de status — os prints H-A04, H-A08 e H-C04 seguem para 10–14/11 e a data de 06/04/2027 não se move. |
| 2026-11-08 | **Ink: fecho do dia 08/11/2026 — sessão encerrada, nada publicado:** Onda 1 da P1 fechada tecnicamente e plano de alinhamento aplicado (P1.2.8, AL-01/AL-02 corrigidos, AL-03 declarado, AL-04 confirmado). Working tree **sem commit** (`HEAD` `b4fe1dd`, 73 entradas: 63 modificadas + 10 novas). Gate de saída: `mvn -B verify` **745/0** (+8 LGPD), `mvn -Ptestfx verify` **825/0** (745 + 80 `*FxIT`/IT) e demo «Base demo consistente» em **V30**. Próxima sessão (10–14/11, os 2 dias restantes de nov/2026): sandbox B1 → **H-A04**, depois **H-C04** na mesma base; o **H-A08** depende de um `.inkbak` 2.2.1 (senão escorrega para dez/2026). Riscos abertos no fecho: **RK-01 e RK-02** (mar/2027); **RK-06 mitigado** com os prints pendentes. Release segue em 06/04/2027; nenhum caso `H-*` vira «Conforme» sem evidência. |
| 2026-11-08 | **Ink: cinco decisões de alinhamento aplicadas e P1.2.8 entregue (checkout, nada publicado):** AL-01 corrigido — o import do CSV de recuperação passa o `professionalLogin` ao `AppointmentConflictDetector` (dois profissionais no mesmo horário entram os dois; o mesmo profissional continua bloqueado), com 2 testes novos no `CsvBackupServiceTest` (17/17). AL-02 corrigido — 21 strings em 11 classes e as 5 mensagens do `LegacyDomainSyncService` passaram a usar `NicheTerminology`, com os helpers novos `termWorkspaceLower`/`termSessionLower` e `NicheTerminologyTest#copyOutsideTheDayFlowFollowsTheNiche` provando os três nichos (inclui «não atende sessões/consultas/procedimentos» e «Backup do estúdio/consultório/espaço»). AL-03 declarado nas notas da release (R-A03) e AL-04 confirmado como recorte doc-only (9 requisitos, 15 casos, `V27`–`V30`); o rótulo da correção M2 virou caso do H-C10. Gate remédido: `mvn -B verify` **745/0** (+8 LGPD), `mvn -Ptestfx verify` **825/0** e demo em V30. Sem commit, push, tag ou deploy; 06/04/2027 não se moveu. |
| 2026-11-08 | **Ink: arrumação de coerência da documentação da Onda 1 (checkout, nada publicado):** rastreabilidade de casos corrigida no `ROADMAP_P1.md` — `H-A07` passa a **Onda 2/P1.6.4** (depende do backfill de `cliente_id`), `H-A08` fica só no **P1.11.4 (Onda 4)** e a execução de 10–14/11 passa a ser rotulada como **evidência de release** (upgrade 2.2.1 → 2.3.0), `H-C09` entra na Onda 1 pelo P1.2.5; a tabela de capacidade de 05/11/2026 foi marcada como **histórica**, com as posições datadas de 07/11 e 08/11 como estado vigente; o pré-requisito do H-A08 (não existe `.inkbak` 2.2.1 no projeto — verificado em 08/11/2026) ficou registado no checklist, com a regra de escorregar para dez/2026 se não houver backup; no registro de riscos, **RK-09 → Controlado** (ciclo de nov/2026 fechado: 3 itens nos 3 dias) e **RK-10** atualizado para o gate de 08/11/2026 (V29, 727/0 + 8 LGPD, 802/0 com 75 ITs, demo V29); contagens alinhadas à tabela real do roadmap (**14** sub-itens na Onda 1, antes 13; **82** casos no checklist, antes 81). Sem commit, push, tag ou deploy. |
| 2026-11-08 | **Ink: P1.3 entregue e G1 verde — Onda 1 fechada tecnicamente (sem commit, nada publicado):** a presença passou a ser estado próprio (`AttendanceStatus`: Agendado, Atendido, Faltou, Cancelado) separada do estágio comercial; a **V29** cria `attendance_status` com backfill (`Pago`/`Sessão`/`Aftercare` → Atendido; o resto → Agendado) e índice por estúdio/dia. O espelho legado traduz a presença para o vocabulário do calendário (Atendido→Encerrado, Faltou→NoShow, Cancelado→Cancelado, Agendado→Confirmado) e o teste prova zero órfãos. O pagamento da sessão ficou idempotente (marcar pago 2× = 1 `Recebimento`) e ganhou desfazer (remove o recebimento e reabre a cobrança). O resumo do dia (`DaySummaryService`) exclui falta/cancelado do previsto e nunca apaga dinheiro recebido; a linha do dia ganhou o seletor de presença. **RK-18 corrigido:** o CSV de recuperação exporta `professional_login` e importa como coluna opcional (CSV antigo cai na autoria). Testes: `AttendanceStatusTest` 3, `DaySummaryTest` 3, `DaySummaryIT` 3, `FinanceiroControllerTest` +2 (H-C05/H-C06), `CsvBackupServiceTest` +2 e `BusinessRulesFxIT` 19 → 20 (H-C04 no ecrã: FALTOU/CANCELADO mudam só a presença e tiram o valor do previsto). Gate medido em 08/11/2026: `mvn -B verify` **727/0** (+8 do gate LGPD), `mvn -Ptestfx verify` **802/0** (75 `*FxIT`/IT) e validador da demo verde em base recém-migrada até a **V29**; upgrade/restore cobertos por `FlywaySqliteMigratorTest` e `RestoreServiceTest` (dossiê V25 → V29). **G1 registrado verde no mesmo dia** — 14 de 14 sub-itens da Onda 1; faltam os prints H-A04, H-A08 e H-C04 na semana de 10–14/11, e nenhum caso `H-*` vira «Conforme» antes do SHA homologado. |
| 2026-11-08 | **Ink: P1.2.4 entregue — conflito de horário por profissional (commit local, nada publicado):** `AppointmentConflictDetector.findConflict` e `AgendaController.findSessionConflict` (5 argumentos) passaram a filtrar pelo profissional; o mesmo horário de outro profissional é permitido, o mesmo profissional bloqueia e a mensagem nomeia quem atende (`ProfessionalDirectory.displayNameOf`), voltando à frase antiga quando o nome não resolve. Chamada de 4 argumentos (fluxo legado) continua comparando a agenda inteira. O `OperationalAppointmentDialog` resolve o profissional **antes** da checagem, de modo que conflito e gravação usam o mesmo valor; o `ClientFormTab` usa um único valor na checagem e no `ClientIntakeController.createPrimaryFlow`. `ControllerCoverageTest` 13 → 14, `ClientFormTabConflictMessageTest` (novo, 2 casos) e `BusinessRulesFxIT` 18 → 19 (o teste de conflito passou a isolar o `caracore.ink.localappdata`, que antes lia o `owner-contact` real da máquina). Gate medido em 08/11/2026: `mvn -B verify` **724/0**, `mvn -Ptestfx verify` **795/0** (71 `*FxIT`/IT) e validador da demo verde até a **V28** (9 agendamentos operacionais, 0 sem `professional_login`); 9 de 14 sub-itens da Onda 1, próximo **P1.3** (presença × dinheiro; o CSV de recuperação leva o profissional, RK-18). **H-C07 fechado como automatizado em 08/11/2026, a pedido do dono:** `BusinessRulesFxIT#dayAgendaDialogScopesTheConflictToTheProfessional` abre o «Novo agendamento» e grava 10:00 para Ana (permitido), 15:00 para o dono (controle positivo) e tenta 10:00 para o dono (bloqueado); a mensagem que nomeia quem atende fica em `ClientFormTabConflictMessageTest`; o print manual deixou de ser requisito (o login na sandbox falhou). **Incidente no mesmo dia (RK-14):** `mvn -Dcaracore.ink.localappdata=… javafx:run` não propagou a propriedade ao JVM filho e a GUI abriu a base real do `AppData`, migrando V22 → V28; sem perda observada, o app gerou backup pós-migração e **não existe backup pré-migração** — lançamento de GUI passa a exigir `JAVA_TOOL_OPTIONS=-Dcaracore.ink.localappdata=<sandbox>` e conferência do caminho da base. Os gates também escreviam backups/auditoria no AppData real (testes faziam `clearProperty` do override); surefire passou a usar `target/test-sandbox-appdata` e failsafe `target/testfx-appdata`, com os testes restaurando o valor anterior — medido antes/depois, o AppData real não muda. O print do H-C08 saiu no mesmo dia. |
| 2026-11-08 | **Ink: P1.2.2 e P1.2.3 entregues — profissional gravado e seletor só quando há mais de um (commit local, nada publicado):** **P1.2.2** (`370a8b1`, commit local sem push): `Appointment.professionalLogin` entra no create/update/list do repositório; sem profissional explícito vale a autoria (numa base de um profissional, o dono) e a edição que omite o campo preserva o valor atual — `ControllerCoverageTest` 10 → 13 casos. **P1.2.3:** `ProfessionalDirectory` (novo) define quem atende: **dono + usuários ativos de perfil Agenda** (perfil Financeiro vê dinheiro, não atende, e não aparece no seletor); o `OperationalAppointmentDialog` só constrói o campo com 2+ profissionais (com um só, fica oculto e fixo no dono) e o mesmo valor resolvido chega ao `ClientIntakeController.createPrimaryFlow` pela `ClientFormTab`; `AuthController.listTeamMembers()` novo e sem gate de ADMIN para a leitura da equipe. Testes novos/ampliados: `ProfessionalDirectoryTest` 2, `ClientIntakeControllerTest` 2 → 3, `BusinessRulesFxIT` 16 → 18 (prova a ausência real do campo com um profissional). Gate medido em 08/11/2026: `mvn -B verify` **721/0**, `mvn -Ptestfx verify` **791/0** (70 `*FxIT`/IT) e validador da demo verde até a **V28** (0 agendamentos sem `professional_login`; 9 com o marcador `local-user`); 8 de 14 sub-itens da Onda 1, próximo **P1.2.4** (conflito por profissional, H-C07). **H-C08 fechado no mesmo dia:** print numa base sandbox com 1 profissional (0 usuários de equipe, `local-user`) mostra o «Novo agendamento» sem o campo «Profissional»; evidência local em `caracore-ink/docs/evidencias/` (fora do git). RK-18 (CSV de recuperação sem o profissional) segue aberto para decisão do dono. |
| 2026-11-07 | **Ink: chave `ink-2026-11` relacrada com senha nova, envelopes da 2.2.1 publicados e segredo retirado do Railway:** ao executar o passo 1 da ordem de custódia de 06/11, a senha do gerenciador **não abriu** o lacre de 02/11/2026 (320 B, `8be5ad2b…84cd4`) — recusada tanto pelo 7-Zip como pelo py7zr, inclusive com digitação direta do dono. A chave **não estava perdida**: a cópia em claro ainda existia e derivou fingerprint `7eb05dd4…48a`, igual ao PEM embutido no app. Decisão do dono: **relacrar a mesma chave** (não gerar par novo, que exigiria versão-ponte e quebraria a atualização de todo app 2.2.x) com senha nova guardada no gerenciador. Lacre novo: **314 B, SHA-256 `f766e774…45ed`**, provado por duas leituras independentes (py7zr e 7-Zip, este devolvendo `7eb05dd4…48a`), cabeçalhos cifrados e senha errada recusada; o lacre antigo ficou aposentado como `.20261102` e a **cópia em claro foi apagada** (sobrescrita com bytes aleatórios, varredura sem resíduo) depois de o dono confirmar a senha no gerenciador. **Cofre atualizado em 07/11/2026** com o mesmo lacre novo (SHA-256 conferido nas duas pastas). **Virada concluída no mesmo dia:** deploy do R-E06 (`8d530ad` no `caracore-cso-quarkus`, CI `Quarkus CI Pipeline` verde em 4m31s, Railway SUCCESS); os dois envelopes da 2.2.1 foram assinados com a chave decifrada **só em memória** — `ink-manifest.json` 8.859 B `ab2d82b8baa34000f66d6e306ce524718cf72689c1d77f3ecb5d4c340d988bf7` e `ink-manifest-mandatory.json` 8.854 B `c33ca51de7200ed9ce069dbf1a512c9485ea9fc41b23d3896d93c45dad52ff97` —, verificados com OpenSSL pela pública embutida e publicados na `v2.2.1`; payload e assinatura saíram byte a byte iguais aos que o serviço assinava na hora (Ed25519 é determinística). Em seguida `INK_RELEASE_SIGNING_KEY` foi **removida do Railway** (ausente por nome, 34 variáveis restantes, `INK_RELEASE_SIGNING_KEY_ID` mantida) com redeploy `3f73f761` SUCCESS, porque apagar variável não reinicia sozinho; o canal mede 200 **sem a chave**, com `key_id ink-2026-11`, versão 2.2.1, assinatura válida, corpo idêntico ao asset, `mandatory=false` em `?current=2.2.1` e `mandatory=true` em `?current=2.0.1`, CORS estreito. Emergência daqui em diante: **substituir o asset**, nunca repor a chave. Registro detalhado: `E:\CC_KEYS\ink-release-keys\CUSTODIA_CHAVE_INK_20261102.md` §10.6. |
| 2026-11-06 | **Ink: P1.4 cortada do 2.3.0, P1.1 + P1.2.1 entregues e caminho do `.deb` provado (commit local, nada publicado):** a **P1.4 (Hoje com resumo) saiu do 2.3.0** e passa para a Onda 2 — o Desktop **2.3.0 de 06/04/2027 entrega só a Onda 1**, e março/2027 vira homologação manual e ensaio de release (R-A..R-D). Entregue na linha 2.x, SHA `6ae4f1c`: **P1.1** (escopo de estúdio, V27) e **P1.2.1** (profissional no agendamento, V28 + remap do legado). Gate medido no mesmo SHA: `mvn -B verify` **715/0** (inclui 8 do gate LGPD), `mvn -Ptestfx verify` **783/0** (68 `*FxIT`/IT), validador da demo "Base demo consistente", schema **V28**. Progresso **6 de 13** sub-itens da Onda 1; próximo P1.2.2 → P1.2.3 → P1.2.4 → P1.3.1–P1.3.4 → G1. **D-H2 resolvida (06/11/2026):** o dono assina o aceite como responsável; independência = gate automatizado no SHA de release + checklist em máquina limpa + acompanhamento de 30 dias, com segundo assinante humano **opcional** (revisão externa ou estúdio piloto, condicionado a D-H3 — ainda aberta ao lado da custódia da chave de assinatura). Épico **J-MP (Mercado Pago no Desktop)** especificado em `caracore-ink/docs/EPICO_J_MP.md` (6 passos, 12 erros orientativos; D1–D3 fechadas: desktop→MP por HTTPS + polling, Access Token colado, cofre do SO) e **começa depois do corte do 2.3.0**. Checklist de release 2.3.0 com 38 itens `R-*`; o caminho do `.deb` Linux apontava para um script removido em `e70e725` e foi trocado pelo real — `docker/Dockerfile.linux-build`, base **JDK 25 Corretto** porque o Temurin 24+ deixa de trazer `jmods` (JEP 493) e quebra o ProGuard — e provado ponta a ponta: BUILD SUCCESS em 2 min 28 s e `agenda-ink_2.2.1_amd64.deb` 55,3 MB (`4d0088fb…5c41d97c`). Commits locais `174714a` (build) e `12aae94` (docs), **sem push**. Defeito do `Maintainer` do `.deb` **corrigido em 06/11/2026** (o `linuxDebMaintainer` já trazia nome+e-mail e o jpackage prefixa o vendor; agora leva só o e-mail e o artefato regerado mostra `Maintainer: Cara Core Informática <suporte@caracore.com.br>`, 55.310.508 B, `c6f75b91…b6cc1`). **D-H3 fechada** no mesmo dia: o piloto com 3 estúdios fica para fase posterior e não condiciona o 2.3.0. **Custódia da chave decidida:** a `ink-2026-11` (Ed25519, fingerprint `7eb05dd4…48a`, lacre `8be5ad2b…84cd4`) passa a existir em **duas cópias lacradas — o HD `E:\CC_KEYS` e o cofre OneDrive** `D:\onedrive\Cofre Pessoal`, com o mesmo SHA-256 conferido nas duas em 06/11/2026 —, sai do Railway e da cópia em claro, e o manifesto do corte exige **assinatura offline** com o HD conectado (R-E06); nenhuma chave nova é gerada, porque os apps 2.2.x só aceitam essa. Superfícies de IA alinhadas nesta revisão: `caracore-site/AGENTS.md`, `CALENDARIO_COTA_CURSOR.md`, `RISCOS_ECOSSISTEMA.md` (R14), `.cursor/rules/ecosystem-cara-core.mdc` e `caracore-ink/.cursor/rules/project-memory.mdc`. |
| 2026-11-05 | **Cota do Ink refeita: 5 dias/mês até 06/04/2027 e entrega do Desktop 2.3.0 (nada publicado, nada commitado):** decisão do dono ao alinhar o plano — **5 dias de trabalho por mês de nov/2026 a 06/04/2027** para o Ink, dentro da janela do Hub, sem tirar dias do Hub nem do PDV. Medição que precedeu a decisão: 28 dias nominais (nov 5 · dez 5 · jan 5 · fev 5 · mar 5 · abr 3, porque 06/04 é a entrega) e ~20–23 úteis depois de gates, homologação e folga de release; P1 completa 44–60 dias, S1+S2 10–14, S3–S8 24–34, GA 3.0 78–108 — a 5 dias/mês o GA só sairia em 2028, e fechá-lo em 06/04 exigiria ~15–20 dias/mês e tomaria o Hub. **Portanto 06/04/2027 entrega o Desktop 2.3.0**, não o 3.0: P1 Onda 1 (fundação multi-perfil, profissional e presença, migrações V27–V29) garantida na linha 2.x; P1.4 (Hoje com resumo) como alongamento; a PWA (S3–S8) e o GA 3.0 ficam **pós-Hub, sem data dura** — mantida a projeção de 2028, o "não antes de 2028" da loja continua verdadeiro. Ordem revista: **2.3.0 → S1 (`ink-core`) → S2 → P1 Ondas 2–4 (3.0.0-RC1) → S3–S9**, deixando de tratar S1/S2 como pré-requisito da P1. Capacidade do ciclo (R14 em `RISCOS_ECOSSISTEMA.md`): a fatia não acumula mês ocioso, não é segunda frente pesada no mesmo dia e cede inteira se o núcleo precisar; S1–S8 seguem fechados na janela do Hub. Alinhado em `caracore-ink` (`AGENTS.md`, `.cursor/rules/project-memory.mdc`, `README.md`, `ROADMAP.md`, `STACK.md`, `docs/MEMORIA_MATRIZ.md`, `docs/PLANO_PWA.md`, `docs/ROADMAP_P1.md`, e o local-ignorado `agenda-java/docs/INDICE_DOCUMENTACAO.md`) e neste repositório (`CALENDARIO_COTA_CURSOR.md`, `RISCOS_ECOSSISTEMA.md`, `AGENTS.md`). Nenhum código de produto escrito e nenhuma tag; loja (`caracore-ink-releases`: index, download, pwa e tecnologia) e wiki (`projeto-ink.html`) passaram a citar o 2.3.0 em 05/11/2026, apenas no disco — sem commit nem publicação. |
| 2026-11-04 | **Ink Agenda Desktop `v2.2.1` nas quatro camadas e memória do ecossistema realinhada:** release `v2.2.1` (Latest) com setup 62.947.840 B `39eafa4a…270c124b`, ZIP 61.477.189 B `4baf257d…deef98b1` e `.deb` 53.419.622 B `1b89bb76…841cef14`, unsigned; loja `0805fdc`, wiki `0ffbc5d`, central `4d30e35` e matriz `6a12418` empurrados com Pages `built`; o canal `releases/ink/latest.json` serve `2.2.1` (`min_supported 2.0.2`, medido ao vivo). `mvn verify` em Java 25 = 713 testes; SCA por OSV no artefato: 0 achados em 16 dependências (NVD/OWASP DC **não** rodaram). **Varredura de coerência das superfícies de IA (só ficheiros locais, sem commit):** na regra sempre-aplicada `.cursor/rules/ecosystem-cara-core.mdc`, Ink 2.0.1 → 2.2.1, PDV `rc6` → candidato de 31/10, Hub `rc1.7`/“próxima `rc1.8`” → `rc1.8` publicada e BioReator 1.0.0 → 1.1.1; em `AGENTS.md`, data de atualização, bloco novo de 04/11, checkpoint do Hub marcado como histórico, DMG/DEB da 3.0 e correções 2.2.x; em `ECOSYSTEM_MEMORIA.md`, gateway Ink 2.1.0 → 2.2.1, ponteiro morto para o `AGENTS.md` da raiz, snapshot do PDV v4, âncora quebrada da retomada e dumps antigos do Ink marcados como histórico; `v3.2.8` → `v3.2.12-free` no `CALENDARIO_COTA_CURSOR.md`, `VALIDACAO_LOJAS_MATRIZ.md` e `VALIDACAO_NEGOCIO.md`; DMG/DEB e o ponteiro da raiz no `RISCOS_ECOSSISTEMA.md`; BioReator 1.1.1 no `INICIAR_NOVA_TAREFA.md`; retrô com **139 artigos** em `STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md` e `MEMORIA_DO_PROJETO.md`; `GEMINI.md`; oficina Ink (`agents.md`, `.cursor/rules/project-memory.mdc`, `docs/PLANO_PWA.md`, `docs/RELEASE_2.2.1.md`); regra da oficina Hub (`rc1.8`) e regra da matriz (OIDC `v2.0.2-free`). **Segunda passagem (mesmo dia, ainda sem commit):** regra da loja Hub reescrita para o pacote `v2.1.0-rc1.8` (ZIP 324.536.724 B `3c4e61b2…743334`, sem NSIS, aceite pendente; `rc1.7` movida para o histórico como REPROVADA); `caracore-hub/docs/contexto-rapido.md` com a "Situação" em `rc1.8` e o bloco de 29/10 rotulado como histórico; regra da loja Ink sem o ponteiro morto para o arquivo `VERSION` (a versão vive em `agenda-java/pom.xml`); `.github/copilot-instructions.md` acertado com Hub `rc1.8`, prévia do PDV, Ink 2.2.1 e **Seed em Java 25** (o `maven.compiler.release` do Seed é 25 — a regra do workspace e o `GEMINI.md` diziam 17, corrigidos). |
| 2026-11-02 | **Ink Agenda 2.0.4 publicada (Latest) e superfícies alinhadas:** release `v2.0.4` em `caracore-ink-releases` (tag `8a2d84f`) com setup 62.870.016 B `5ea79dac30719ef11150e2f5de09d340b697f967918524ae12761c07051ebd1c`, ZIP 61.399.641 B `7849d462625dbb356900d6e7f97a54c491d634ad5ac9b7cee9a6c8f3ee3e6fd3`, `.deb` 53.457.882 B `30eee2bda5972decf8805855e002010e6a80978a74c259f5b61e57f3d9dfc941`, `.dmg` 64.775.569 B `34eb67778e5a672b2a8a76e18ca83dbbb1c35f583419272b6d0d001b454da183` e checksums; CI `Build Instaladores Nativos` verde nas quatro jobs. Aplica A1–A9 e verificação de atualização assinada (Ed25519, chave pública embutida, allowlist, SHA-256, `mandatory`/`min_supported`, timeout de 10 s); `mvn -B verify` com 637 testes. Gateway `api.caracore.com.br/releases/ink/latest.json` passou a responder 200 assinado (`key_id ink-2026-11`, `2.0.4`, `min_supported 2.0.2`) às 00:39Z, após ~15 min de 404 por cache de manifesto incompleto. Loja `ink.caracore.com.br`, Central `download.caracore.com.br` (`produtos.json` + `download.html`), Wiki (`projeto-ink.html`, `projetos-overview.html`, `status.html`) e matriz (`portfolio.html`, `ecosistema.html`, `index.html`) passam a 2.0.4; macOS segue fora da loja por decisão do dono, embora o `.dmg` esteja anexado e o corpo da release o descreva. **Pendência aberta:** corrigir a interação publicação × cache (`PT15M`) e alinhar o corpo da release sobre macOS. |
| 2026-11-01 | **Ink Agenda 2.0.2 disponibilizada como prerelease para homologação:** a release GitHub `v2.0.2` deixa de ser draft e fica marcada como prerelease (não Latest/GA); a `v2.0.1` permanece estável/Latest. Site institucional, Wiki, Central e loja do Ink passam a oferecer os assets candidatos com os avisos de assinatura ausente e homologação pendente. Assets: setup 56.872.960 B, SHA-256 `f9dde7c521dd64c39ee5dfa3c62bdb8c09f000bf7083c34e15fe47bc0a6cfa54`; ZIP 60.350.991 B, SHA-256 `ab66a21bb39ab597757374ac1b4e280c1129171de54b71f36bacfe90e9171a94`; `checksum.sha256` incluído. A candidata ainda não foi aprovada para uso estável. |
| 2026-11-01 | **Ink Agenda 2.0.2 preparada em draft antes da autorização para homologação:** fonte `caracore-ink` commit `af075f1` em `master`; artefatos Windows ofuscados enviados à release draft `v2.0.2` em `caracore-ink-releases` (asset setup SHA-256 `f9dde7c521dd64c39ee5dfa3c62bdb8c09f000bf7083c34e15fe47bc0a6cfa54`, ZIP `ab66a21bb39ab597757374ac1b4e280c1129171de54b71f36bacfe90e9171a94`, checksum sidecar incluído). Gate no candidato: `mvn -o verify -Ptestfx` — 596 unitários, 8 do gate de logs e 58 TestFX, cobertura aprovada; validação `scripts/run_agenda_demo.py --validate-db agenda-java/demo.db` aprovada. Setup e launcher retornam `NotSigned`; sem certificado. Loja candidata em `caracore-ink-releases` branch `release/v2.0.2-draft`, commit `69c7e28`; páginas públicas apontavam à v2.0.1 até a publicação da prerelease e das superfícies em 01/11. Pendentes antes de aprovar como estável: homologação visual 1366×768 a 100%/125%, teste de upgrade em cópia real da base v2.0.1 e decisão/aceite sobre assinatura. |
| 2026-11-01 | **PDV v4 — vitrine, wiki, Central e matriz PUBLICADAS na candidata de 31/10; fila de retomada registrada:** por pedido do dono, `caracore-pdv-releases` `e54476d`, `caracore-wiki` `fb040bf`, `caracore-loja` `45835e5` e `caracore-site` `fd4b150` foram empurrados e o GitHub Pages construiu cada commit (`status=built`); conferido ao vivo com cache-bust. A vitrine serve `download.html#pre-release-v4` (ZIP 178.317.680 B, SHA-256 `0c2003b0…83434d`, sidecar, release no GitHub e registro em markdown) e manda a RC6 para `#rc6`; `#instalacao-rc6` deixou de existir; selo **"Em pré-lançamento · prévia candidata"** sem data. O canal `api.caracore.com.br/releases/latest.json` segue em `3.2.12-free` (`sha256=6d7a50b0…`), correto enquanto a v4 for pré-release. **Resíduo aberto:** o corpo da release `v3.2.12-free` no GitHub, espelhado em `releaseNotes`, ainda cita "a linha v4 RC6"; correção só por `gh release edit`, sob pedido. **Contradição corrigida:** a memória da oficina (`caracore-pdv/AGENTS.md`) ainda dizia que a prévia pública era a RC6 e que nada fora publicado no ciclo — atualizada em 01/11/2026. **Fila registrada** no § "Checkpoint 01/11/2026": T032 manual e matriz M01–M11 no pacote de 31/10; SCA/G1; cenário migrado; `rc7`; GA em data escrita (`D-GA-1`); canal para a v4; decisão sobre 08/11/2026; aceite de QA da `rc1.8`; CSO Transportes. Nada tagueado nesta data; F7 continua valendo para as próximas publicações. |
| 2026-10-31 | **PDV Java v4 — prévia pública passa à candidata de 31/10 e as três superfícies são alinhadas:** release `v4.0.0-candidato-20261031` em `caracore-pdv-releases` como **pré-release** (não GA, não Latest), asset `CaraCore-PDV-4.0.0-qute-portable-windows-x64.zip`, 178.317.680 bytes, SHA-256 `0c2003b0f99a75328f7ebe632fc20b07cb5834a3f75b6f0e97ccfb7aef83434d`, sidecar `SHA256SUMS` de 116 bytes conferido; fonte `master` `c343890`, build 31/10/2026, Java 25.0.3 embutido, launcher `iniciar_pdv.bat`, `UPDATE_URL` = `https://api.caracore.com.br/releases/latest.json`. Suíte no CI run `41244424886` em `c343890`: 1.039 testes, 0 falhas, 3 ignorados, LINE 52,82% (5.385/10.195) contra piso de 50%. Sobre o pacote: T032 (16 passos) e a matriz M01–M11 foram medidos em `ff400efd`, **não nesta candidata**; SCA não medido (`D-SCA-1`); cenário "banco 3.2.12 migrado" bloqueado; cancelar venda paga na v4 não devolve estoque nem grava `ESTORNADA` (`D-S1`); sem MSI, unsigned. `v4.0.0-rc6` (11/10/2026, SHA `0c00b24b…780d5325`) e `v4.0.0-rc5` ficam no histórico; a RC7 é a rota aprovada do Gate E, ainda sem tag. Loja (`caracore-loja` Central e `caracore-pdv-releases` quando publicado), wiki (`caracore-wiki`) e matriz (`caracore-site`) alinhadas para a candidata, com o selo editorial **Beta (RC)/prévia pública candidata** mantido e o canal de atualização ainda servindo `v3.2.12-free` (a candidata é pré-release e o canal só serve Latest). |
| 2026-10-31 | **Hub `v2.1.0-rc1.8` publicada e loja, wiki e matriz alinhadas:** release `v2.1.0-rc1.8` em `caracore-hub-releases` com o único asset `CaraCore-Hub-2.1.0-rc1.8-windows-x64.zip`, 324.536.724 B, SHA-256 `3c4e61b2e192fece6667ccfbc79d735f3fad7ce8542e50c492b9ef24a9743334`, unsigned, sem instalador NSIS. A central (`api.caracore.com.br/releases/hub/latest.json`) serve a mesma versão e hash. Mudanças da build: versão alinhada no Maven/Electron, canal de atualização no launcher (`api.caracore.com.br/releases/hub/latest.json`, `UPDATE_URL` só HTTPS/localhost, token não logado), `/api/atualizacao` pública por correspondência exata e cliente tolerante a 200/204/503/erro de rede; `clean verify` 2.585 testes/0 falhas, E1–E6 PASS em `9874273`. A release está marcada como **Latest** no GitHub por autorização do responsável, o que não substitui o aceite formal; o rótulo editorial **Beta (RC)/pré-release** foi mantido. A rodada 5 reprovou a `rc1.7` (N1/N2 bloqueantes) e o aceite de QA da `rc1.8` segue pendente. GA instalador 06/04/2027. |
| 2026-10-30 | **Matriz: resíduo do host que não usamos removido e `Site validation` verde:** por decisão do dono, o arquivo de configuração do host saiu do repositório. As duas regras exatas de redirect que só existiam nele (retrô e wiki) foram para o `_redirects`; `build-static.cjs`, `preview-static.cjs` e `cdn-assets.test.cjs` deixaram de lê-lo, o preview local passou a servir os arquivos com `must-revalidate` sem emular cache/redirect e o filtro do workflow perdeu o caminho do arquivo. Saíram também `docs/CDN_VERCEL.md`, a condição de host em `secure/js/logger.js` e as menções em `AGENTS.md`, `DEPLOY_STATIC.md` e nos docs de roteamento. **INC-13 fechado:** stubs `/delivery/mkt/*` e `_redirects:89-91` apontam para a vitrine `mkt.caracore.com.br` (200 medido). **INC-14 fechado:** o passo 5 valida só o `_redirects`. Medido: `validate-delivery-stubs` 40 stubs/0 problemas, `validate-redirects-config` 0 problemas, `run-site-validation.ps1` de ponta a ponta com `EXITCODE=0` (passos 1–5) e `node scripts/build-static.cjs` com 8/8 testes. |
| 2026-10-27 | **Hub `v2.1.0-rc1.7` conferida ao vivo nas quatro camadas e validadores da matriz corrigidos:** a central (`download.caracore.com.br/download.html`) passou a mostrar tamanho e hash do EXE **274.162.562 B** e do ZIP **324.502.796 B** no cartão do Hub, e as páginas no ar (loja `hub.caracore.com.br/download.html`, central, wiki `projeto-hub.html` e matriz `ecosistema.html`) foram lidas de novo: todas em `v2.1.0-rc1.7`, sem `rc1.6` como versão vigente. A release no GitHub confirma `draft=false`, `prerelease=true` e seis assets com os tamanhos do manifesto. Correção de defeito real nos validadores: `scripts/validate-delivery-stubs.ps1` e `scripts/validate-redirects-config.ps1` esperavam `https://rust-pdv.caracore.com.br`, host que **não resolve** (HTTP `000` medido); o canónico é `pdv-rust.caracore.com.br` (`200`), como em `_redirects:49-51` e nos stubs. O `Site validation` do repo estava vermelho desde 06/10 por esse defeito **e** por dois itens de decisão do dono: `/delivery/mkt/*` (stubs e `_redirects`) aponta para a Sala enquanto o mapa e os validadores esperam a vitrine `mkt.caracore.com.br` (INC-13), e a cobrança do arquivo de configuração do host que não usamos (INC-14). Registrados em `docs/CORRECOES_COERENCIA_ECOSSISTEMA.md`; `validate-delivery-stubs`: 4 → 2 problemas. |
| 2026-10-27 | **Hub `v2.1.0-rc1.7` publicada como pré-release nas quatro camadas:** release `v2.1.0-rc1.7` em `caracore-hub-releases` marcada **Pre-release** (não Latest, não GA), unsigned, com instalador, ZIP, dois `.sha256` e dois manifestos — EXE 274.162.562 B `1563f1bd343b0044f9a64dd9bb7d3a1604761ee7f1e2354e8663b693cb310ba1`, ZIP 324.502.796 B `924af1960ccda606e4b3979ff36741f7e78228f8f77c396ccb985878b940b37e`; binários baixados de volta e conferidos. O que mudou: política única de senha (12 caracteres, máximo 72 bytes, temporária de 16 por `SecureRandom`) e **Auditoria e Logs com item no menu**. Gate medido no mesmo código: `npm run verify` PASS em `dist_hub/verify/20261027T150209Z` (commit `ce9007f`, `promotable=true`, `dirtyEntries=0`, 2.555 testes, 8 ignorados), WAR 69.448.885 B `73b9adf5…2023b0` igual nos dois caminhos do pacote, E2E 62/1/0 no instalador e 60/1/0 no ZIP. Loja, central, wiki e matriz alinhadas para `v2.1.0-rc1.7`. Segue **pré-release não homologada**: QA rodada 5, B7 e S6.9 abertos; GA 06/04/2027. |
| 2026-10-26 | **Matriz alinhada ao Hub `v2.1.0-rc1.6` nas fontes de dados em JS:** `assets/js/catalog-data.js` (versão, `detalhe` e `atualizadoEm`), `assets/js/planning-data.js` (4 textos + `AS_OF_LABEL` + `NOTE`), `assets/js/planning.js` (glossário), `planning.html` (fallback `pl-asof` e `?v=20261026`) e `portfolio.html` (data de conferência) ainda liam `v2.1.0-rc1.2` e a leitura de 15/10; o texto de `index.html`, `ecosistema.html` e `portfolio.html` já estava em `v2.1.0-rc1.6` e `v3.2.12-free`, e o desvio só aparecia nas tabelas renderizadas em runtime. Documentos internos corrigidos: `INICIAR_NOVA_TAREFA.md`, `VALIDACAO_LOJAS_MATRIZ.md`, `ECOSYSTEM_LOJAS.md`, `CORRECOES_COERENCIA_ECOSSISTEMA.md` (que ainda dava PDV `v3.2.8-free` como vigente), `AGENTS.md` e a regra Cursor. PDV segue `v3.2.12-free` (Latest) e `v4.0.0-rc6` (pré-release); Hub segue pré-release não homologada, GA 06/04/2027. |
| 2026-10-25 | **Hub `v2.1.0-rc1.6` publicada como pré-release (loja no ar):** release `v2.1.0-rc1.6` em `caracore-hub-releases` marcada **Pre-release** (não Latest), com EXE 274.160.424 B `05b87529112db79db67e50d1e708c1dc8568daf69c905f73bfb1abe7b4afc8c4`, ZIP 324.500.797 B `fe3400c7a3d4101452f95d2f26ca82b0c7bfe84d427dbfaa6659af17a17c9c0d`, dois `.sha256` e dois manifestos; binários baixados do release e conferidos por SHA-256 contra o manifesto. Loja `hub.caracore.com.br` (Pages em `docs/`, commit `b3dc257`) atualizada com as novidades: RBAC por perfil com `403` em JSON, auditoria de usuários persistida (`usuario_auditoria`, V18) e telas de demonstração removidas. Oficina empurrada até `ee66981`. Armadilha registrada: release interrompida fica em `draft` e os links respondem `404` até `gh release edit --draft=false`. Segue **pré-release não homologada**: QA rodada 5, B7 (smoke Linux x64) e S6.9 abertos; GA 06/04/2027. Central, matriz e wiki alinhadas para `v2.1.0-rc1.6` em commit local, sem push. |
| 2026-10-15 | **PDV Free 3.2.12 publicada estável/Latest por autorização explícita:** fonte `72ace488aed4ee91001c60cf40a3934ddfe8faf1`, branch `hotfix/3.2.12-free`; correções 405→500, distinção ESTORNADA/CANCELADA com V047 e fila em transação independente. Windows SHA-256 `6d7a50b0acf2a05620a090eebdd48f049a1dd5599ccb6c40c419c38145f7c0e2`; Linux/macOS `795a396318da61d1bd45dcfe816879d2184706f1c7849f1cd2ad98baa99fd9c1`. Cinco assets remotos conferidos. Publicação estável/Latest autorizada em 15/10/2026, com validações pendentes. 19/19 testes focados passaram em Java 25/H2; ZIPs e hashes remotos conferidos. Suíte completa, smoke portátil com SQLite/health/navegador, execução Linux/macOS e homologação operacional completa permanecem pendentes. Não transferir aceites da 3.2.8. Releases 3.2.8 e v4 RC6 preservadas. Alinhamento de loja, central, matriz, wiki e memórias preparado no checkout; verificar deploy antes de declarar sites atualizados no ar. Cópias de rollback sob `target/release-free-v3.2.8-64f564a` foram removidas pelo clean de 15/10; não presumir disponibilidade. |
| 2026-10-14 | **PDV Free 3.2.8 — artefatos republicados com gates pendentes, por autorização explícita:** reconstruídos ZIPs Windows/Linux/macOS e `SHA256SUMS.txt`/`RELEASE_MANIFEST.json` a partir do commit `64f564ae66f17560c8aeb5d63fccd6a3bf3ea942`; substituídos os cinco assets na release `caracore-pdv-releases/releases/tag/v3.2.8-free`, sem mover a tag. SHA Windows `e9aa2753e32c45ec939bb7a4483dd39223300570d8eeec898e58b55dc210ae4b`; Linux/macOS `a7a6ebd3463ade4b9a3febb2bb61c96319733ce40724df86ca1873f5aa055895`. Remotos conferidos contra os artefatos locais; CRC/estrutura passaram. Testes focados 19/19, porém suíte Maven completa e boot/health/navegador dos ZIPs seguem pendentes; não anunciar homologação completa. Backup/novos pacotes sob `caracore-pdv/target/release-free-v3.2.8-64f564a/`; manter para rollback/rastreabilidade. Branch `hotfix/3.2.8-free` enviada até `b46d921`; `installer-wix/v4-qute/` ficou fora dos commits. |
| 2026-10-14 | **Registro da publicação inicial de PDV Free 3.2.8 (hashes abaixo foram substituídos no registro imediatamente anterior):** workflow multiplataforma oficial concluído e tag `v3.2.8-free` indicada como Latest em `caracore-pdv-releases`. Hashes dos assets iniciais: Windows `caracore-pdv-v3.2.8-free-windows-x64.zip` — `ef0116c383ae35df8fff96866cf8a767665db3a555bf2873435e9e8f985e612e`; Linux `caracore-pdv-v3.2.8-free-linux-x64.zip` — `50c30fad7c13825c95beba55a281934b008cbf330490d981c09592eba7eb57a5`; macOS `caracore-pdv-v3.2.8-free-macos-x64.zip` — `1ade201a3c84b6f445f417c6cc8e4123096f1b1f8ed3702c70898af07d637476`. Loja, wiki e matriz alinhadas no checkout. Testes focados da publicação inicial: 57 (0 falhas/erros, 1 ignorado). Homologação manual completa no Edge/leitor físico não concluída; publicação autorizada pelo responsável com essa ressalva. Manutenção somente até 08/11/2026, sem novos recursos. A sucessão segue as RCs da v4 e depende de aprovação dos gates; 08/11 não é GA automático. Sem NF-e, NFC-e ou PIX integrado no Free; RC6 segue pré-release separada. |
| 2026-10-13 | **CaraCore Seed alinhado entre vitrine, Central, matriz e Wiki (checkout local, sem publicação):** candidato Windows 0.1.3 em homologação independente, sem download público; CTA de solicitação de convite não garante participação. Central lista o Seed como piloto filtrável sem binário/hash. Corrigidas as instruções de primeiro acesso e recuperação: `admin`/`admin`, senha nova de exatamente 8 caracteres com confirmação e chave; não apagar manualmente o arquivo de credenciais. Wiki atualizada com escopo funcional, stack Electron/Java 25/SQLite, limites locais e status do piloto. Linux fora da entrega. Homologação foi atribuída a outra IA; não distribuir antes do aceite. |
| 2026-10-13 | **CaraCore Seed — piloto público no modelo do PDV Rust:** publicada a release Windows x64 `0.1.3`, sem convite ou cadastro prévio. EXE unsigned, 218.924.034 bytes, SHA-256 `5adf48b1b8b14d79ff55fc7aecc1f38f7d4ee221848b68af3bae58e5a83626e8`; loja, Central, matriz e Wiki devem apontar para o instalador/checksum. É candidato para avaliação, não homologado nem pronto para produção; instalação/uso em perfil limpo e regressões manuais seguem pendentes. Linux fora desta entrega; app local em SQLite, sem monitoramento remoto de heartbeats. |
| 2026-10-13 | **CaraCore Seed 0.1.4 publicada:** instalador Windows x64 unsigned, 216.458.520 bytes, SHA-256 `a01da8dbad7fdee2e9e59b1a99ed1be45b3f2e1d007d559cf289c6a606a30c2a`. Substitui a 0.1.3 e protege a API local com sessão ADMIN/CSRF e token por licença; porta local dinâmica e recursos web incluídos. Loja, Central, matriz e Wiki atualizadas. Ao atualizar, preservar SQLite e chaves; licenças antigas podem exigir emissão/rotação do token de API. Homologação independente e regressões manuais completas pendentes; não pronto para produção. |
| 2026-10-13 | **CaraCore Seed 0.1.5 publicada como pré-release candidata:** instalador Windows x64 unsigned, 216.466.586 bytes, SHA-256 `e449ca2cee74fda135ac098d2333fe674c2c476773a7d4adb60bc016a767db16`. A release estável anterior é a 0.1.4. Atualiza heartbeat para UTC do servidor, mantém diagnóstico de desvio de relógio, informa status de licença revogada/expirada com token válido, valida Host em todas as rotas, renova CSRF e expõe o payload RSA assinado. Migração V8 aditiva preserva bancos 0.1.3/0.1.4 e chaves; Swagger UI/OpenAPI locais sem CDN. Atualizar vitrine Seed, Central de Downloads e matriz para apresentar o Seed como complemento local do ecossistema Cara Core, sem centralizar os bancos dos outros produtos. Homologação independente pendente; não declarar pronto para produção. |
| 2026-10-13 | **BioReator 4.0 Community 1.1.1 publicada e loja RU ampliada.** Release `bioreator-1.1.1` oferece MSI e ZIP Windows x64, sem assinatura. Matriz alinhada à biomassa viável/total, cálculo de P/V pelo volume líquido e registro do primeiro critério de término em `end_reason`; inclui links para o manual técnico/critério de fim, fundamentos e exemplo de batelada. A 1.1.0 permanece no histórico. |
| 2026-10-13 | **CaraCore Seed — candidato local `0.1.3` para homologação fechada:** Windows x64, 218.924.034 bytes, SHA-256 `5adf48b1b8b14d79ff55fc7aecc1f38f7d4ee221848b68af3bae58e5a83626e8`, unsigned. Suíte Java 914, launcher 2 e Electron 6 aprovados; instalador/uso em perfil limpo ainda pendente. Mensagens do primeiro acesso e da troca/recuperação de senha esclarecem cópia da chave, senha inicial `admin`, limite de 8 caracteres e confirmação. Candidato não enviado nem publicado; Linux fora desta entrega. SHA-256 real do artefato `0.1.0` presente no checkout: `e4d68a4ca3e22a80275c21b652b8fa24e755a1ca5634f615b8265d8dae0d5d95` (corrige o valor anteriormente registrado). |
| 2026-10-12 | **BioReator 4.0 Community 1.1.0 publicada.** Release `bioreator-1.1.0` oferece MSI e ZIP portátil para Windows x64, sem assinatura digital. Loja RU, Central de Downloads, matriz e Wiki alinhadas; 1.0.0 permanece como versão histórica. |
| 2026-10-11 | **Memória do PDV v4 alinhada ao ZIP publicado.** Status da oficina, handoff, `AGENTS.md` e esta memória apontam SHA-256 `0c00b24b33b3c365fd1f24ec173bfa4e35bedf1946b2df4151035250780d5325`. Fonte: `master` `681ea32`. A tag Git `v4.0.0-rc6` permanece em `b3358fe`. |
| 2026-10-11 | **PDV v4 — ZIP da tag `v4.0.0-rc6` substituído de novo.** 178.166.244 bytes, SHA-256 `0c00b24b33b3c365fd1f24ec173bfa4e35bedf1946b2df4151035250780d5325`. O arquivo anterior desta tag (`847f0cfe…`, 178.165.533 bytes) saiu. Neste pacote foram vistos menu, uma venda, recibo e saída da sessão. Não é GA nem Latest. Naquele momento, `v3.2.7-free` permanecia Latest e 08/11 era avaliado como data de corte v4; atualização de 14/10 substituiu esse marco pela data de encerramento da Free 3.2.8 e pelo ciclo de RCs. |
| 2026-10-11 | **PDV v4 — ZIP da tag `v4.0.0-rc6` substituído.** 178.165.533 bytes, SHA-256 `847f0cfec022b33e0d4c1c7d608cc0772ab1c46064004a093037dd7a29dc840f`. Java 25 em `runtime\`, sem JDK e sem Python do sistema. O ZIP de 10/10 (`a2ec0d80…`) saiu da tag. Não é GA nem Latest. Naquele momento `v3.2.7-free` permanecia Latest e a data 08/11 era reavaliada como corte v4; desde 14/10, a última 3.2.x é `v3.2.8-free` e 08/11 encerra sua manutenção. A frente de caixa daquele arquivo cobria o menu. |
| 2026-10-11 | **Planning: glossário da v4 e nota do BioReator.** O verbete de `v4.0.0-rc6` passa a dizer pré-release pública com SHA-256 publicado; a `v4.0.0-rc5` fica no histórico. O verbete `v2.0.0-RC1` sai e entra `v2.0.2-free`. A nota da grelha deixa de dizer que o BioReator está fora: a torre 10 permanece, Community 1.0.0 publicada, percentual em 12%. Premium em 18/06/2027, sem preço e sem PIX. |
| 2026-10-10 | **Wiki alinhada ao BioReator 4.0.** A ficha, a visão geral, o glossário, a trilha e o mapa da wiki prometem um produto: Community 1.0.0 agora, Premium em 18/06/2027, sem preço e sem PIX. |
| 2026-10-10 | **Portfólio e ecossistema passam a um produto.** O cartão do RU Soberano sai. A vitrine pública é o BioReator 4.0: Community 1.0.0 na loja, Premium em 18/06/2027, sem preço e sem PIX. |
| 2026-10-10 | **Planning alinhado ao BioReator.** A torre 10 passa a ler BioReator 4.0: Community 1.0.0 na loja, Premium em 18/06/2027, sem preço e sem PIX. O percentual permanece 12%. Sem torre nova e sem mês de Agent. |
| 2026-10-10 | **A loja do BioReator não publica página .txt.** Os hashes ficam em `download.html#bioreator40`. O arquivo `artifacts/bioreator-1.0.0.txt` sai do site. |
| 2026-10-10 | **A loja do RU promete um produto.** BioReator 4.0 Community 1.0.0 é a edição que se baixa. A Premium do mesmo produto fica em 18/06/2027, sem preço, sem PIX e sem arquivo. A data deixa de ser um segundo produto. |
| 2026-10-10 | **Download público do BioReator 4.0 Community 1.0.0.** Release `bioreator-1.0.0` em `caracore-ru-releases`: MSI 72.658.944 bytes, SHA-256 `8efc60902c5ba6c37096401f02ba180b545f4dce754247e4a51ea1e96905995e`; ZIP portátil 73.594.305 bytes, SHA-256 `49e83e5361b77ca8bc1bd854e6acaf77ce50404380b5d84229e15816dad5405a`. O EXE de 524.800 bytes fica dentro do ZIP. Sem assinatura digital. A Pro segue sem preço e sem data. O RU Soberano segue em 18/06/2027. |
| 2026-10-10 | **Página do BioReator 4.0 na loja do RU.** `bioreator.html` abre pela fermentação no computador, depois explica a batelada e só então as edições. Community 1.0.0 continua a edição atual. EXE e MSI seguem na oficina. A Pro segue sem preço, sem PIX e sem data. O RU Soberano segue com lançamento em 18/06/2027. |
| 2026-10-10 | **Coerência do vocabulário.** A Community 1.0.0 do BioReator sai da lista de futuros lançamentos na matriz, na loja do RU, na wiki e nas memórias. O planning passa a ler 10/10/2026: pré-release pública do PDV é a `v4.0.0-rc6`, com SHA publicado; estável continua `v3.2.7-free`; T032 aberto. Percentuais das 11 torres não mudam. A Pro do BioReator continua sem data e fora da cota de outubro. |
| 2026-10-10 | **BioReator 4.0 Community 1.0.0 sai do planejamento.** A edição atual entra em “Já publicado” no roadmap da central e no filtro estável de download.caracore.com.br. A Pro segue sem preço, sem PIX e sem data. O EXE e o MSI continuam na oficina. O marco de 18/06/2027 continua o do RU Soberano. |
| 2026-10-10 | **BioReator 4.0 ganha exemplo e cinética.** Loja `exemplo-bioreator.html`: carga de referência Community, 100 L, *Bradyrhizobium*, leitura de X, S e oxigênio. Wiki `bioreator-tecnico.html`: as mesmas contas, o catálogo calibrado e o contraste de 6 h em batelada alimentada na Pro. Números do simulador 1.0.0, não medição de planta. |
| 2026-10-10 | **BioReator 4.0 1.0.0 no inventário.** Pacote Community de oficina: EXE `BioReator40.exe` (524.800 bytes, SHA-256 `378efe2eb3fd32e4fb5aa167d860ca86df11d45f9b31af53c0d5e65470611c38`) e MSI `BioReator40-1.0.0.msi` (72.658.944 bytes, SHA-256 `8efc60902c5ba6c37096401f02ba180b545f4dce754247e4a51ea1e96905995e`). Windows x64, JDK 25, sem assinatura. `publicDownload: false`. Inventário em `caracore-ru-releases/docs/artifacts/bioreator-1.0.0.txt`. Central, matriz, wiki e memórias citam a versão. A 1.0.0 do RU Soberano continua a outra linha, com marco 18/06/2027. Checkout, sem publicação. |
| 2026-10-10 | **BioReator 4.0 entra no mapa como satélite.** Oficina `caracore-ru`. Loja no subdomínio `https://ru.caracore.com.br/`, com as edições em `download.html#bioreator40` e sem arquivo. Community no pacote local; Pro sem preço e sem PIX. A data de 18/06/2027 continua a do RU Soberano. Cota de outubro permanece no PDV v4. Matriz, wiki e memórias alinhadas no checkout, sem publicação. |
| 2026-10-10 | **Fonte da PDV v4 `v4.0.0-rc6` no `master`:** oficina `caracore-pdv`, commit `b3358fe`, tag `v4.0.0-rc6`. O ZIP público permanece o já publicado (113.889.451 bytes, SHA-256 `a2ec0d8019e8f492369aaf6aa2de40b96904b72e87193d5933c212f4c4adf892`). Latest continua `v3.2.7-free`. Ciclo manual completo do roteiro ainda pendente. |
| 2026-10-10 | **PDV v4 `v4.0.0-rc6` publicada:** ZIP `CaraCore-PDV-4.0.0-rc6-qute-portable-windows-x64.zip`, 113.889.451 bytes, SHA-256 `a2ec0d8019e8f492369aaf6aa2de40b96904b72e87193d5933c212f4c4adf892`. Pré-release, não Latest. Estável continua `v3.2.7-free`. A `v4.0.0-rc5` fica no histórico. Ciclo manual completo do roteiro ainda pendente. Sem NF-e, NFC-e nem PIX integrado. |
| 2026-10-10 | **MKT e Helianto de volta ao mapa de lojas:** CNAMEs `mkt.caracore.com.br` e `helianto.caracore.com.br` → `chmulato.github.io` (consulta 8.8.8.8 em 10/10). Memória: `MEMORIA_INFRAESTRUTURA_CARACORE.txt`. MKT: vitrine gratuita em `caracore-mkt-releases`; Sala continua em `tools.caracore.com.br/sala/`; não vendemos. Helianto: vitrine em `caracore-helianto-releases`; GA 30/12/2029. Os dois continuam fora do núcleo. A remoção de 06/10 fica no histórico. |
| 2026-10-09 | **Planning — leitura de 09/10:** a grelha passa a dizer que a oficina do PDV Java está em `v4.0.0-rc6` (SHA-256 a publicar) e que o download público continua `v4.0.0-rc5`, com estável `v3.2.7-free` e T032 aberto. O CSO deixa o aviso de deploy de responsividade: Frotas em produção desde 06/10, freeze M1 em 08/11/2026, Transportes em 08/11/2028. Hub permanece atenção, pré-release `v2.1.0-rc1.2`. Percentuais inalterados. A página mostra as 11 torres; média, flags, critérios e a faixa do Hub saem da primeira vista. Envelope, cota, cronograma e histórico ficam recolhidos. Checkout local, sem deploy. |
| 2026-10-09 | **Blog — O Efeito Borboleta do Dinheiro:** trilogia local em `caracore-personal` (chamada e Partes 1–3, 10/13/18-10-2026). Acervo em 268 HTML. Assinatura do cartão: Cidadão Global. Navegação entre partes vizinhas no corpo; rodapé só com o início do blog. Home, ciclo ativo, feed e sitemap alinhados no checkout. Sem commit e sem deploy. A contagem 264 do INC-08 fica no histórico. |
| 2026-10-09 | **Host da matriz:** GitHub Pages. INC-10 fechado com a medição de 09/10: WebP do logo branco no ar (117.882 bytes), `Cache-Control: max-age=600`, 404 sem redirect automático. |
| 2026-10-09 | **Coerência INC-09 e INC-11:** a copy da frota está no ar em `ecosistema.html`, `wiki.caracore.com.br/projeto-cso.html` e `cso-transp.caracore.com.br`. A home, o ecossistema e o portfólio oferecem Reino OIDC `v2.0.2-free`. **INC-10 permanece aberto:** o host público é GitHub Pages, com `Cache-Control: max-age=600`; o WebP do logo branco está no ar (117.882 bytes) e o 404 não redireciona sozinho. |
| 2026-10-09 | **Coerência INC-07:** `planning-data.js` passa o Reino OIDC para a Edição Free `v2.0.2-free`, com `v2.0.1-free` e `v2.0.0` no histórico, e o Circuito Ferradura para `v2.0.24` na loja, com `v2.0.23` no histórico. Checkout local, sem deploy. |
| 2026-10-09 | **Coerência INC-08:** contagem de HTML em 09/10. Retrô: 139 ficheiros em `docs/articles`, números 1 a 139. Blog: 264 ficheiros em `docs/articles`. Esse par ficou vigente nos dois `AGENTS.md`, em `INDEX.md`, em `ECOSYSTEM_CARA_CORE.md` e na regra Cursor da matriz. Linhas antigas do changelog permanecem. |
| 2026-10-09 | **Coerência INC-05 e INC-06:** `ECOSYSTEM_LOJAS.md` passa o Ink para Desktop `v2.0.1` e o Hub para a pré-release Windows `v2.1.0-rc1.2` (instalador e ZIP, unsigned; GA 06/04/2027). O bloco Marco v4 de 04/10 fica como snapshot: a RC4 era a pré-release daquele dia, com o SHA-256 conservado. O estado vigente permanece no topo deste ficheiro. |
| 2026-10-09 | **Coerência INC-03 e INC-04:** `VALIDACAO_LOJAS_MATRIZ.md` passa a Ink `v2.0.1`, OIDC `v2.0.2-free`, Hub pré-release `v2.1.0-rc1.2` (GA 06/04/2027) e CSO com Frotas em produção e loja `cso-transp`. `ECOSYSTEM_CARA_CORE.md` passa o PDV para download público `v4.0.0-rc5` e `v4.0.0-rc6` em preparação. CSO vigente `b90d1dc`, Flyway V33, FRO 24/24 desde 06/10; `e193d6d` fica como commit anterior de COE. Contagens de artigos permanecem no INC-08. |
| 2026-10-09 | **Coerência INC-01 e INC-02:** a linha da Loja PDV nos dois `AGENTS.md` deixa de chamar a RC4 de pré-release vigente e passa a registrar a pré-release pública `v4.0.0-rc5` (roteiro formal pendente) e a `v4.0.0-rc6` em preparação. No `portfolio.html`, selo, rodapé, comentário e linha do tempo do Ink passam a `v2.0.1` · 07/10/2026; `v2.0.0` de 26/06/2026 fica só no parágrafo histórico do card. Checkout local, sem deploy. |
| 2026-10-09 | **PDV alinhado na oferta pública:** estável `v3.2.7-free`. Pré-release publicada `v4.0.0-rc5`. A `v4.0.0-rc6` fica em preparação, SHA-256 a publicar, sem arquivo no GitHub. O roteiro público mantém o registro da RC5 com o ciclo manual pendente e separa a RC6. A wiki fiscal deixa de chamar o Free de 3.2.6. Sem NF-e, NFC-e nem PIX integrado. |
| 2026-10-09 | **PDV v4 `v4.0.0-rc6` na oficina:** correções do QA de usabilidade e homologação do rc5. Venda finalizada imutável, uma venda aberta, pós-login no caixa, pagamento pelo teclado, desconto em reais, auditoria com o operador real, rotas Premium do Free em 403. O ZIP da RC6 não entrou no GitHub Releases. SHA-256 a publicar. A oferta pública permanece a `v4.0.0-rc5`. O download público da pré-release continua `v4.0.0-rc5`. Free estável `v3.2.7-free`. Sem NF-e, NFC-e nem PIX integrado. `PERF-001–007` congeladas. |
| 2026-10-08 | **Registo de coerência:** inconsistências de texto e publicações por confirmar ficaram em `docs/CORRECOES_COERENCIA_ECOSSISTEMA.md` (INC-01 a INC-11). Nenhuma correção desse registo foi aplicada neste lançamento. |
| 2026-10-08 | **Reino OIDC Free `v2.0.2-free`:** release https://github.com/chmulato/caracore-oidc-releases/releases/tag/v2.0.2-free. EXE `ReinoOIDC-2.0.2-free.exe` (17.861.640 bytes), SHA-256 `d5c6121e921dedab678b056129653870ebb6fbfa28a75b12074f3d4fbc131bcc`, MD5 `df0b506ef766bed54b5e80f590f0024e`. Sem certificado digital. As três Eras seguem gratuitas para estudo pessoal. A edição paga está em desenvolvimento e não entra nesta versão. CTA **Baixar Free (2.0.2)**. A loja não combina PIX nesta etapa. A página de download oferece só `v2.0.2-free`. `v2.0.1-free` e `v2.0.0` ficam no histórico; os assets não foram despublicados. A nota da tag `v2.0.0` passou a indicar a substituição. Loja OIDC publicada. Central de downloads e wiki alinhadas. Matriz alinhada no checkout, sem deploy. Oficina privada commitada localmente e não enviada ao remoto. |
| 2026-10-08 | **Circuito Ferradura — `v2.0.24` na loja, na release, na matriz e na central:** download em https://circuito.caracore.com.br/download.html e https://github.com/chmulato/caracore-circuito-releases/releases/tag/v2.0.24. EXE SHA-256 `eca7027c08d062f1fcbfb529092db53e5f30a3766d286ec448089c2f8734aa12`. Windows ZIP `dea72267c5700b1831d176729d57dee539900bdcfafccaac10b9c5f0bf2c01dc`. macOS ZIP `ff6deb284029f4ad333575f6e4d9f0509d7481cfcb47b3c43dbc2f0020833951`. HTML ZIP `7cf46b92c97652339c860bb29308a075057db19d570e57422a76a5bc47d986d6`. O executável é só Windows e não tem assinatura digital. `v2.0.23` fica no histórico. |
| 2026-10-08 | **Circuito Ferradura — `v2.0.23` na loja, na release, na matriz e na central:** download em https://circuito.caracore.com.br/download.html e https://github.com/chmulato/caracore-circuito-releases/releases/tag/v2.0.23. EXE SHA-256 `12df7a9d7d0984f78612b710418d0c76686796e011748001278a399d2ce9e68d`. Windows ZIP `d61d1953ff8193d29859a2c923bac26d91ec9d2fc72b2f6d9fd546cc3ff198d5`. macOS ZIP `989d1b5fe3cfa775e9407ed934c0a292cc705a41a84d38b38349d8158863dc9d`. HTML ZIP `d4c312dcfac8a2289566dda3931681bfedb0331282b44fdd8c457b38475d8d5c`. O executável é só Windows e não tem assinatura digital. `v2.0.0` fica no histórico. |
| 2026-10-08 | **Reino OIDC Free `v2.0.1-free`:** release https://github.com/chmulato/caracore-oidc-releases/releases/tag/v2.0.1-free. EXE `ReinoOIDC-v2.exe` (18.157.874 bytes), SHA-256 `067352c7201f2e3478d11abcf3a87f212fad6dc1c02768ccebd6ad78de2992b5`. Sem certificado digital e sem chave de ativação. As três Eras seguem gratuitas para estudo pessoal. A edição paga não entra nesta versão. CTA **Baixar Free (2.0.1)**. A edição paga está em desenvolvimento; a loja não combina PIX nesta etapa. Aviso pelo WhatsApp (`+55 41 9 9909-7797`), sem pagamento. A página de download oferece só `v2.0.1-free`. `v2.0.0` fica no histórico e o asset não foi despublicado. Loja OIDC `1143250`. Matriz, wiki e central de downloads alinhadas no checkout. Oficina privada não enviada ao remoto. |
| 2026-10-08 | **Roadmap alinhado às novidades:** a linha do tempo pública lê Hub `v2.1.0-rc1.2` com SQLite local e GA em 06/04/2027, PDV estável `v3.2.7-free`, Ink Desktop `v2.0.1` e FRO publicado em 06/10. A leitura do planning passa a 08/10/2026. |
| 2026-10-08 | **Memória das IAs — banco do Hub:** retomada da oficina, da loja, do Gemini e do Copilot registra SQLite local (WAL) como banco do Hub. Java 25, Jakarta EE 10, Tomcat 10.1. |
| 2026-10-08 | **Hub — banco local em SQLite:** o discurso público (portfólio, ecossistema, loja, wiki e memória) descreve o banco do Hub como SQLite local no computador do cliente. Java 25, Jakarta EE 10 e Tomcat 10.1. PostgreSQL e Docker saem da stack pública do Hub. |
| 2026-10-08 | **Coerência do planning e da memória:** o planning público passa a ler PDV estável `v3.2.7-free` e pré-release `v4.0.0-rc5`. O FRO 24/24 permanece publicado em 06/10; a janela 08/04–dez/2027 não reabre o epic. A home da loja do Hub marca a RC Windows `v2.1.0-rc1.2` e reserva 06/04/2027 para o GA. |
| 2026-10-08 | **Hub — wiki alinhada a `v2.1.0-rc1.2`:** `projeto-hub.html`, o manual `docs/hub/` e as trilhas passam a descrever a pré-release Windows para avaliação. O GA do instalador permanece 06/04/2027. |
| 2026-10-08 | **Hub — memória para outras IAs:** o download vigente é `v2.1.0-rc1.2` na loja, na matriz e na central. A próxima pré-release nasce numa tag nova, com árvore limpa e manifesto fiel. As tags anteriores permanecem. Não é GA. |
| 2026-10-08 | **Hub — matriz e central de downloads em `v2.1.0-rc1.2`:** ecossistema, portfólio e planning de `www.caracore.com.br`, e o cartão da central `download.caracore.com.br`, passam a oferecer a mesma pré-release Windows da loja do Hub. Instalador SHA-256 `50d38ff0ee4defce5bb2598967331d0295fb4817dbec59df5d3e7574b22975e5`. ZIP SHA-256 `ec82b2bd57053c252faac4fdbb0066e9a5cea2df293562b35384107e5cb624b4`. As tags anteriores permanecem. Não é GA. |
| 2026-10-08 | **Hub — download da loja em `v2.1.0-rc1.2`:** instalador SHA-256 `50d38ff0ee4defce5bb2598967331d0295fb4817dbec59df5d3e7574b22975e5` (281.529.680 bytes) e ZIP SHA-256 `ec82b2bd57053c252faac4fdbb0066e9a5cea2df293562b35384107e5cb624b4` (333.342.883 bytes). FileVersion `2.1.0-rc1.2`. Manifesto do commit `463a854`, árvore limpa. As tags `v2.1.0-rc1.1` e `v2.1.0-rc1` permanecem. Não é GA. O aceite da QA desta build ainda não foi feito. |
| 2026-10-07 | **Reino OIDC Free `v2.0.0` — GA publicado:** release estável em https://github.com/chmulato/caracore-oidc-releases/releases/tag/v2.0.0, com EXE, checksums e guia; SHA-256 `af0a5bd3bf4f8f6586de6e32a29b7ba750985788e8cca768f87ecf74fd59952d`. Oferta coerente: três Eras e progressão narrativa gratuitas para estudo pessoal; R$ 29,90 (valor único) apenas para decks adicionais de Mineração de Chaves; sem certificação, consultoria ou suporte técnico. Matriz, loja e memórias sincronizadas; conferir push/deploy antes de afirmar que a loja está publicada. |
| 2026-10-07 | **Ink Desktop — suporte até a 3.0:** decisão do dono: o Desktop Windows continua com suporte e correções 2.0.x (achados de QA, sem funcionalidade nova) até o S9 do PWA. A 3.0 em PWA segue como substituta, não antes de 2028; o download do Desktop só sai da loja depois da importação dos dados. `PLANO_PWA.md`, `caracore-ink/AGENTS.md`, `pwa.html`, wiki `projeto-ink.html` e `ECOSYSTEM_CARA_CORE.md` atualizados. Central de downloads (`caracore-loja`, `download.caracore.com.br`) aponta o card do Ink para a v2.0.1 (links e SHA256). |
| 2026-10-07 | **Ink Desktop 2.0.1 — publicada** (tag `v2.0.1` em `caracore-ink-releases`, a pedido do dono “subir as novas”; RC1–RC8 marcadas como superadas e corpo da v2.0.0 corrigido): testes 588 + 8 unitários, 58 TestFX e cobertura JaCoCo aprovados. Jar ofuscado com ProGuard (a 2.0.0 publicada saiu sem ofuscação); regras corrigidas: pré-verificação ligada e otimização desligada, classe de entrada, `@FXML`, constantes de enum usadas em anotações, diretório `db/migration` para o Flyway. Smoke do ZIP extraído: abre sem JDK, cria `agenda.db` e log, passos 1 e 2 do primeiro acesso renderizados. Setup `AgendaInk-2.0.1-windows-setup.exe` SHA256 `49bdd76a10ab97b7902e47b8c393c638ef90ea6b490874224a9734a802f90a6b`; ZIP `AgendaInk-2.0.1-windows.zip` SHA256 `3118eac8fafdfa5cc4d3e341969d0cd205d5a29caabbe069e12d7b956a994ff3`. Release `https://github.com/chmulato/caracore-ink-releases/releases/tag/v2.0.1`; loja, wiki e matriz publicadas. Checklist de telas do build ofuscado em `caracore-ink/docs/RELEASE_2.0.1.md`. |
| 2026-10-07 | **Exceção de cota — Ink Desktop 2.0.1:** o dono abriu Agent para o patch 2.0.1 (achados do QA da 2.0.0) dentro da janela do PDV v4. Registado como R13 em `RISCOS_ECOSSISTEMA.md`. Escopo: importação idempotente, pt-BR no runtime, build sem demo, sessão com duração/valor, painel com faturamento/médias, check de pagamento, tela de clientes, criar orçamento, `.inkbak` criptografado, P2 de textos/PDF/log. Build e SHA locais; publicação só com aprovação. |
| 2026-10-07 | **Ink Agenda 3.0 = PWA:** a 3.0 é nova aplicação de lançamento em PWA, sobre o `ink-core` extraído da v2.0.0 (mesmas regras). Substitui o Desktop Windows v2.0.0: o download só sai da loja no S9, depois da importação dos dados da v2 (H4 fechada como obrigatória) e de aviso com data; tag `v2.0.0` fica como histórico. Plano `caracore-ink/docs/PLANO_PWA.md` passa a S0–S9. Copy da loja (`pwa.html`, `index.html`, `tecnologia.html`) no checkout, sem push. Calendário intacto: não antes de 2028. |
| 2026-10-07 | **Ink Agenda PWA — arquitetura de dados:** web, Android, Mac e iPhone saem de um único PWA (`ink-web`). Servidor na nuvem com HTTPS e **um SQLite por estúdio** (mesmo schema/Flyway do Desktop). PWA precisa de internet; Desktop Windows v2.0.0 segue offline com base local, sem sincronização no GA. Copy na loja (`pwa.html`, `tecnologia.html`) no checkout, sem push. Calendário intacto: Tab; Agent não antes de 2028. Canónico `caracore-ink/docs/PLANO_PWA.md` (H2–H5 abertas antes do S3). |
| 2026-10-07 | **PDV Java Free v3.2.7-free publicado:** estoque na venda, turno com X/Z, saldo em dinheiro pelo valor da venda, recibo offline com itens e PDF, OpenAPI fechado, escuta em `127.0.0.1`, logs em `%APPDATA%\caracore\logs`. Sem NF-e, NFC-e nem PIX integrado. Limite de 100 vendas/mês permanece. ZIP `caracore-pdv-v3.2.7-free-free-{windows,linux,macos}-x64.zip`. SHA256 Windows `37110b7c07a045942bd89628fd473e649c7b57756707ce8a71908a1ec4c03c89` · Linux `bc8b67462a4505ad54e2d0afe18982321536101fb66f9e2c06c91bd3f7a63df7` · macOS `c0ffcf3992327df0dd31e5e2e2fc8173f3e1bf32c97178355e22994fa56b630a`. Tag `v3.2.7-free` / ramo `hotfix/3.2.7-free`. Pré-release v4 atual = `v4.0.0-rc5`. Histórico: `v3.2.6-free`. |
| 2026-10-06 | **Versões Java:** mapa canónico em `D:\onedrive\dev\APPS_JAVA_VERSION.md`, apontado em `AGENTS.md` da matriz, `.cursor/rules/ecosystem-cara-core.mdc`, `.github/copilot-instructions.md` e `GEMINI.md`. PDV Free e v4 = 25; CSO Frotas = 21; CSO Transportes, Hub, Ink, Helianto e RU = 25; Seed = release 25 (o `maven.compiler.release` do Seed é 25 — este registo dizia 17; corrigido em 10/11/2026, junto com o ponteiro para o `AGENTS.md` da raiz, que não existe mais). |
| 2026-10-06 | **Memória para outras IAs:** CSO FRO 24/24 em produção (V33, index `e1e8d63`). PDV v4 permanece pré-release `v4.0.0-rc4` (T032 aberto, `PERF-001–007` congeladas). Hub permanece pré-release Windows `v2.1.0-rc1.1`. A copy da matriz, da wiki e da loja `cso-transp` foi alinhada no checkout e ainda não foi publicada. A aplicação `cso.caracore.com.br` já descreve a frota desta versão. |
| 2026-10-06 | **Hub — matriz, portfólio, planning e wiki alinhados a `v2.1.0-rc1.1`:** o download público deixa de apontar a tag `v2.1.0-rc1`. A pré-release continua sem assinatura, com instalador e ZIP. GA 06/04/2027 inalterado. |
| 2026-10-06 | **Hub — download da loja em `v2.1.0-rc1.1`:** instalador SHA-256 `841c0ce2da6796bd25b3f958d5ec366ee7ef5758dbf7439d1f44b55617206d3c` (281.521.557 bytes) e ZIP SHA-256 `1b942bbe04dac9d32622f117d6542100c242e0fbb4561238ec4371f436de5058` (333.338.656 bytes). A tag `v2.1.0-rc1` conserva o instalador de 05/10. Não é GA. |
| 2026-10-06 | **CSO — FRO-5 local:** `/relatorios/cpk` calcula combustível mais manutenção dividido pelos quilômetros do mês. Sem quilômetro, não há divisão. A landing local marca a frota como disponível. Produção continua na página anterior. V31–V33 sem deploy. Foco: `CpkCalculoTest`, página `/relatorios/cpk` e smoke pack `frota`. Suíte 362/362 não reexecutada. Epic 24/24 no código. MON-0 não iniciado. |
| 2026-10-06 | **CSO — FRO-4.4 local:** infração de outro tenant não grava; ponto zero grava e ponto negativo não grava. A viagem inicia com exame toxicológico vencido. V31–V33 sem deploy. Foco: `InfracaoServiceTest`, `ViagemServiceTest` e `DtoValidatorTest`. Suíte 362/362 não reexecutada. FRO-4 fechado no código. Próximo ID: FRO-5.1. |
| 2026-10-06 | **CSO — FRO-4.3 local:** o gestor registra infração no cadastro do motorista e vê o exame toxicológico vencido em `/relatorios/condutor`. A CNH permanece só com a habilitação. V31–V33 sem deploy. Foco: `InfracaoServiceTest` e `MotoristasWebIntegrationTest`. Suíte 362/362 não reexecutada. Próximo ID: FRO-4.4. |
| 2026-10-06 | **CSO — FRO-4.2 local:** `tb_infracao` no arquivo V33 (motorista obrigatório, veículo opcional, valor e pontos opcionais). Sem integração DETRAN. V31–V33 sem deploy. Foco: `V33InfracaoMigrationTest`. Suíte 362/362 não reexecutada. Próximo ID: FRO-4.3. |
| 2026-10-06 | **CSO — FRO-4.1 local:** o cadastro de motorista grava a validade do exame toxicológico. Data vazia fica sem cadastro. V33 fica no código; V31–V33 sem deploy. A viagem não consulta esse campo. Foco: `MotoristaServiceTest` e `MotoristasWebIntegrationTest`. Suíte 362/362 não reexecutada. Próximo ID: FRO-4.2. |
| 2026-10-06 | **CSO — FRO-3 local:** cadastro `/pneus`, alerta operacional (sulco abaixo de 3,0 mm ou km desde a instalação no limite) e filtro com atalho em veículos e manutenções. V32 fica no código; V31 e V32 sem deploy. Foco: `PneuAlertaTest`, `PneuServiceTest` e `PneusWebIntegrationTest`. Suíte 362/362 não reexecutada. Próximo ID: FRO-4.1. |
| 2026-10-06 | **CSO — FRO-2.4 local:** o dashboard conta documentos vencidos no carregamento da página e a lista de veículos aponta `/relatorios/documentos`. V31 continua sem deploy. FRO-2 fechado no código. Próximo ID: FRO-3.1. |
| 2026-10-06 | **CSO — FRO-2.3 local:** `/relatorios/documentos` classifica vencido, a vencer em N dias, regular e sem cadastro. O título da coluna segue o país do documento. V31 continua sem deploy. Próximo ID: FRO-2.4. |
| 2026-10-06 | **CSO — FRO-2.2 local:** o form `/veiculos` grava vencimentos, apólice e combustível. O rótulo segue o país do documento. V31 continua sem deploy. Próximo ID: FRO-2.3. |
| 2026-10-06 | **CSO — CSS de produção e FRO-2.1 local:** `/`, `/q/health` e `/login` responderam 200; `/login` serve `cso.css?v=20261003b`. Schema Flyway efetivo continua não confirmado. Arquivo `V31__documentos_veiculo_fro.sql` (vencimentos genéricos do veículo) está na oficina e ainda não foi publicado. Próximo ID: FRO-2.2. |
| 2026-10-06 | **MKT e Helianto fora do mapa de lojas:** CNAMEs `mkt.caracore.com.br` e `helianto.caracore.com.br` removidos no Registro.br (limite de 40 registros). Memória: `MEMORIA_INFRAESTRUTURA_CARACORE.txt`. MKT permanece na Sala `tools.caracore.com.br/sala/`. Helianto permanece oficina, GA 30/12/2029, sem subdomínio. Matriz, `AGENTS.md` e mapa de lojas deixam de apontar esses hostnames como vitrine. **Revertido em 10/10/2026:** os dois CNAMEs voltaram a apontar para `chmulato.github.io` (entrada de 10/10 neste changelog), `mkt.caracore.com.br` e `helianto.caracore.com.br` respondem `200` (medido em 10/11/2026) e `AGENTS.md` volta a listar os dois como vitrine. |
| 2026-10-05 | **Hub — status vigente separado da suíte 9/9:** o download da tag `v2.1.0-rc1` é o instalador com log (SHA-256 `86f010a3…`). A suíte 9/9 fica no asset anterior `f59b959d…`. A home da loja passa a descrever a pré-release como disponível para avaliação; o GA permanece 06/04/2027. |
| 2026-10-05 | **Hub — asset da tag `v2.1.0-rc1` substituído:** o download Windows passa a ser o NSIS com log de instalação, 285.745.501 bytes, SHA-256 `86f010a33359f92fbc03452d7a2d5f7a045b75f43c62dd3168c3e3c302c6e4e9`, unsigned. O arquivo anterior `f59b959d34c97f5048ebf2cfaadeb42a7e5b7d84597b15db00d790779def29ae` (285.746.041 bytes) permanece o da suíte 9/9. Não é GA. Causa do `0xC0000005` não confirmada. |
| 2026-10-05 | **Alinhamento das memórias de status:** a regra Cursor do ecossistema ainda descrevia o PDV como RC3, o smoke `-Full` do CSO como pendente e a copy Free como sem recibo. `INICIAR_NOVA_TAREFA.md` e `MEMORIA_DO_PROJETO.md` repetiam RC3 e a proibição do recibo. A oficina do Hub ainda tratava a RC1 como não publicada. Conferido no GitHub: PDV `v4.0.0-rc4` (SHA-256 `31a0cdeda68dce058079c5d0d3d5652084ba8a8cc073dfce60e021c4b3c1fdf2`) e Hub `v2.1.0-rc1` (`publishedAt` 2026-10-05T20:37:22Z, SHA-256 `f59b959d34c97f5048ebf2cfaadeb42a7e5b7d84597b15db00d790779def29ae`). CSO: smoke `-Full` local de 03/10 permanece aprovado; deploy de `febaa3c` segue não confirmado. Os dois `AGENTS.md` já estavam iguais no texto. |
| 2026-10-05 | **Hub — pré-release Windows `v2.1.0-rc1` alinhada no ecossistema:** release em https://github.com/chmulato/caracore-hub-releases/releases/tag/v2.1.0-rc1. Matriz, planning, wiki e loja passam a apontar a RC Windows unsigned. GA 06/04/2027 e Mac/Linux fora desta tag. Alterações locais, sem deploy. |
| 2026-10-05 | **Planning e ecossistema alinhados ao núcleo:** `planning-data.js` passa a ler 05/10/2026 (série de outubro nas 11 torres: PDV Java 80%, Hub 62%, CSO 40%; média 72%). Flags: RC4 com T032 aberto, freeze M1 do CSO sem deploy confirmado, Hub RC1 sem aceite em macOS/Linux. `ecosistema.html` descreve o mesmo recorte na garagem, no roadmap e num aviso de CSO + Hub. Sem mudança de GA, cota ou publicação. |
| 2026-10-05 | **Matriz — redução local de CDN/Fast Data Transfer (CDN do host de então):** Observability indicava ~8,1 mil respostas de `logo_branca.png` × 1.389.022 B ≈ 11,25 GB; peso por resposta confirmado, origem dos acessos repetidos não. Gerados logo branco WebP com hash (117.882 B, −91,51%) e PNG compatível otimizado (456.635 B, −67,13%); logo comum −48,54%. Cache `max-age=120, s-maxage=86400` restrito à home e cinco páginas públicas; cache hashed immutable e vendors 24 h. 404 agora preserva erro e não navega automaticamente; 14 links legados corrigidos, sitemap alinhado e favicon duplicado removido. Build: 100 HTML, 507 referências, 98 verificações JS, 8/8 testes; Edge desktop/mobile passou, uma requisição do logo na primeira visita, cache reutilizado na recarga e zero requests à origem durante 65 s idle desktop. 3 erros JS e 6 source maps ausentes são preexistentes; sem novos erros. **Alterações apenas locais, sem commit/push/deploy**; aferir headers e redução no dashboard depois de publicar. O relatório daquele dia saiu do repo em 30/10/2026 com a configuração do host que não usamos; detalhes no histórico do git. |
| 2026-10-05 | **Hub — pausa e colaboração Gemini/Cursor:** handoff, status atual da oficina, regras Cursor e AGENTS espelhados atualizados. S4.3 passou apenas no runtime local Windows; Java focado 70/70, Playwright 4/4, WAR gerado/copiado com hash conferido. Login real via `npm run dev` permanece sem causa confirmada porque perfil/banco original não foi localizado; próximo passo é identificar runtime/perfil sem ler senha/hash nem alterar dados. Recuperação offline de senha segue tarefa separada. S4.2 depende de CI verde nos quatro alvos; S4.4–S4.9/Sprint 5 abertas; sem RC1 pública ou novo instalador validado — registro anterior à tag publicada no mesmo dia; o status vigente é a pré-release Windows. Git observado até `7e7fd14`; sem commit/push pelo assistente nesta atualização. GA e cota inalterados. |
| 2026-10-04 | **CaraCore Hub — handoff RC1 Free `2.1.0-rc1`:** contexto rápido, regra Cursor e plano atualizados. Sprints 1–3 e S4.1 concluídas; S4.2 segue pendente após falha CI #7: barra final ausente na base Playwright corrigida localmente para Windows/macOS; causa do `ECONNREFUSED` Linux ainda não comprovada. Smoke local Windows passou 3/3 com perfil isolado; migração SQLite e suíte Electron passaram. Alterações locais ainda sem commit/push; próximo gate é CI atualizada nos quatro alvos. RC1 não é GA. Handoff: `caracore-hub/docs/contexto-rapido.md`. |
| 2026-10-04 | **Memória operacional para Gemini/Cursor:** incluído snapshot de status, gates e handoffs das aplicações; explicitada a precedência do status operacional da oficina e a necessidade de confirmar deploy antes de declarar publicação. Corrigida a copy do recibo Free para “link e PDF, sem valor fiscal” na memória e nos dois `AGENTS.md`. Registrados o convite da home à Central e o alinhamento do menu Suporte Local; deploy dessas páginas não foi verificado nesta atualização. |
| 2026-10-04 | **Alinhamento da Central de Downloads:** Free Java descrito com recibo digital por link/PDF sem valor fiscal, sem PIX integrado nem NF-e/NFC-e; removida a promessa não confirmada de sincronização em nuvem e corrigida a explicação de que SHA256 não certifica segurança. Mapa do PDV esclarece Java web local e Rust desktop; AGENTS global e cópia da matriz sincronizados. |
| 2026-10-04 | **PDV v4 — Free RC4 publicada como pré-release:** suíte Maven 843 testes (0 falhas/erros, 3 ignorados), empacotador 6/6 e smoke isolado aprovados. O ZIP e sidecar estão na [GitHub Release](https://github.com/chmulato/caracore-pdv-releases/releases/tag/v4.0.0-rc4); asset baixado confere com SHA-256 `31a0cdeda68dce058079c5d0d3d5652084ba8a8cc073dfce60e021c4b3c1fdf2`. T032 segue aberto pelo roteiro operacional formal. `v3.2.6-free` permanece Latest/estável; RC4 não é GA e o Free não inclui PIX integrado nem NF-e/NFC-e. |
| 2026-10-04 | **PDV v4 — edição Free RC3:** runner reconstruído após detectar a divergência no primeiro asset; a classe do pagamento no runner confere com a compilada. ZIP portátil Windows x64 unsigned substituído na mesma pré-release e baixado novamente para verificar SHA-256 `51f46120dac04dfbbe7fbfb6d442d4f79717327940452b043cc8ec65b9bcd4f3`. Tag e número RC3 preservados; `v3.2.6-free` segue Latest e versão estável. Loja, release notes e memória sincronizadas. T032 permanece aberto; RC3 não é GA nem está homologada para produção. |
| 2026-10-03 | **PDV v4 — rota ZIP aprovada e exercitada localmente:** o usuário escolheu distribuição futura por ZIP portátil sem assinatura Authenticode, com aviso transparente, instrução para não desativar proteções e SHA-256 publicado separadamente; MSI não será distribuído. `--portable-only` passou em 5/5 testes; gerou candidato local e sidecar de uma entrada, com SHA-256 conferido (`c6652188d48ffb3c8eee3cfcbe2e0ea4aae231672650598a232dc880b2998d01`). Extração confirmou launcher/runner e ausência de MSI/banco. Nada publicado. T032 permanece aberto para homologação Edge/Windows 1280×800, roteiro operacional, troca obrigatória de senha e hash externo publicado quando autorizado. Handoff: `caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md`. |
| 2026-10-03 | **PDV v4 — estado T032 atualizado:** suíte Maven completa passou com Java 25 (833 testes, 0 falhas/erros, 3 ignorados); MSI WiX unsigned instalado em escopo per-user e smoke básico aprovado (login API, hashes do manifesto, reinício gracioso e integridade SQLite); banco legado Free preservado. T032 segue aberto: falta homologação Edge/Windows 1280×800, roteiro operacional e validação explícita da troca obrigatória de senha inicial. Uma interação de browser avançou ao dashboard sem definição/verificação deliberada de senha nova; investigar no roteiro, sem considerar o fluxo aceito. `PERF-001–007` permanecem congeladas por decisão do usuário. A obtenção de assinatura MSI deixou de ser critério: em 03/10 o usuário aprovou ZIP unsigned com transparência e hash separado como rota futura. Handoff/status: `caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md` e `STATUS_ATUAL_APLICACAO.md`; alterações sem commit/publicação. |
| 2026-10-03 | **CSO — RBAC + responsividade:** `3c0e41e` (convites por perfil) e `febaa3c` (mobile/tablet, tabelas acessíveis e navbar compacta) estão em `master`/`origin/master`. `mvn test` 362/362, smoke `-Full` e inspeção visual em seis larguras passaram localmente. Produção `/` e `/q/health` = 200, mas `/login` ainda serve CSS `20260807c` frente ao `20261003b` do commit atual; deploy desta entrega não confirmado. Freeze M1 08/11/2026 inalterado; gates Railway finais pendentes. |
| 2026-10-02 | **PDV v4 — `PERF-002` instrumentada:** filtro HTTP opt-in com request ID e duração, correlação MDC nos logs dos serviços e tempos no gateway SQLite; configuração permanece desligada por padrão. Testes focados: 4/4 aprovados, incluindo ID único e correlação HTTP→serviços em `/dashboard`; gateway SQLite testado fora da requisição, portanto correlação HTTP→SQLite ainda não validada. Captura operacional controlada pendente; não confundir testes da instrumentação com benchmark. `PERF-005` segue sem aceite: preflight 19:25 com 120 amostras, CPU média 80,82% e pico 100%, sem startup executado; `PERF-006` continua bloqueada. `PERF-001` permanece inconclusiva e `GET /api/dashboard` dispensado. Handoff: `caracore-pdv/docs/arquitetura/CONTINUIDADE_DESENVOLVIMENTO.md`; alterações ainda sem commit. |
| 2026-10-02 | **Retomada PDV v4 registrada:** `V4L-UI-01–05` concluídos; `PERF-001` permanece inconclusivo (p50/p95 E2E em direções opostas; `GET /api/dashboard` dispensado por decisão do usuário); `PERF-005` tem shutdown validado 3/3, mas startup mediano de 19,899 s acima do alvo de 10 s. Preflight não encontrou baixa carga, então não houve nova medição de startup. Próximo passo é repetir sem JFR sob baixa carga com dados/heartbeat/APPDATA isolados; `PERF-006` aguarda o fechamento de `PERF-005`. Detalhes no handoff da oficina. |
| 2026-09-30 | **CSO COE-B/E publicados em produção** (`e193d6d`): convites por chave, categorias/filtros, gates de veículos inativos, quilometragem por abastecimento/viagem e termos LGPD 2.1. Freeze M1 segue até 08/11/2026, pendente de smoke `-Full`/gates finais; FRO = **08/abr–dez/2027**. Railway `/` e `/q/health` responderam 200; versão efetiva Flyway em produção não foi consultada diretamente. Atualizados AGENTS, wiki e memória do ecossistema. |
| 2026-09-19 | **Memórias sincronizadas:** Hub backend validado em Java 25 (JaCoCo `0.8.14`, Mockito `5.17.0`, Byte Buddy `1.18.14`; `core` 606, `persistence` 541, `web` 274 e `api` verde; WAR gerado); Seed com bloqueio Java 25/Byte Buddy resolvido e teste crítico verde; Retrô atualizado para 139 artigos, com pendência explícita de BOM/byte extra antes do `DOCTYPE` e SEO de `docs/articles.html`. Referências: memórias locais de `caracore-hub`, `caracore-seed` e `caracore-retro`. |
| 2026-09-13 | PDV Java Free **v3.2.6-free** no canal da loja (substitui v3.2.5-free): shell PDV em coluna + caixa registradora; **Restrito** empilhado no mapa Premium; login honesto pós-troca de senha; mesmos limites e login inicial `admin`/`admin`; launcher `iniciar-pdv.bat`; banco `%APPDATA%\caracore\`; browser `localhost:8080/login`; sem PIX gateway / NF-e. ZIP `caracore-pdv-v3.2.6-free-free-{windows,linux,macos}-x64.zip`. SHA256 Windows `4b15a12dbe9b525bdb31be59aff5c226f32cbb40f766eca752744996fda634d9` · Linux `028e5987d35650fd0b2f5f4b2146033e92707b413c0cc8242d05df27e1a26e72` · macOS `7e617aebe895d87ffe0446643751886263f29cbab7422a9e2ac3bcdd0aa5deff`. CTA **Baixar Free (3.2.6)**. Código Free = tag `v3.2.6-free` / `feature/free-3.2.6-pdv-ux`. RC2 v4 continua estacionada; Rust `v0.1.4` inalterado. Sync AGENTS.md + loja + wiki + regras Cursor. Handoff IAs: `CONTINUIDADE_DESENVOLVIMENTO.md` · patch Free ≠ `master` Qute. |
| 2026-09-13 | PDV Java Free **v3.2.5-free** no canal da loja (substitui v3.2.4-free): shell com menu lateral (Início/Produtos/Caixa operáveis; mapa Premium com badges Restrito); opcional «Carregar loja de exemplo» / «Remover exemplos»; empty states; badge `Plano Free · X/100 vendas neste mês · Y/100 produtos`; mesmos limites e login `admin`/`admin`; launcher `iniciar-pdv.bat`; banco `%APPDATA%\caracore\`; browser `localhost:8080/login`; sem PIX gateway / NF-e. ZIP `caracore-pdv-v3.2.5-free-free-{windows,linux,macos}-x64.zip`. SHA256 Windows `e772ca5d57d1c368d80716ce2e8fce5ada488593cf65e2f00206694e79a00fc0` · Linux `85ca05555bb1da59dd0ca493a6a76f7071f7da97d4100cba92f288eec909c6ca` · macOS `dc6cb9666b07900dc01f5b54446281e841e55c854f4bdf84cd8981387b4f110d`. RC2 v4 continua estacionada; Rust `v0.1.4` inalterado. Sync AGENTS.md + loja + wiki + regras Cursor. Handoff IAs: `CONTINUIDADE_DESENVOLVIMENTO.md` (Status 2026-09-13) · patch Free ≠ `master` Qute. |
| 2026-09-09 | **Fila núcleo-primeiro:** dez/2026–06/04/2027 = **Hub** (Agent da janela inteira). FRO = **08/04–dez/2027**. Ink PWA sai das datas que não escorregam: Tab; **sem GA com Agent até folga do núcleo (não antes de 2028)**. 26/06/2027 deixa de ser GA. Copy pública honesta na matriz, loja e wiki. |
| 2026-09-09 | **Principais vs resto:** PDV · CSO · Hub mandam. O resto (Ink, Helianto, RU, OIDC, Seed, Circuito, Área 51, MKT, Minerador) fica fora do núcleo: em conflito de cota ou headline, cede. `AGENTS.md` · `RISCOS_ECOSSISTEMA.md`. |
| 2026-09-09 | Guia de decisão **`RISCOS_ECOSSISTEMA.md`**: T032, fila única, Hub em abril, resto vs núcleo, copy à frente da loja. Ponteiros em INICIAR_NOVA_TAREFA, AGENTS.md e calendário de cota. |
| 2026-09-09 | **Helianto GA 30/12/2029** (era 30/12/2027). Agent só em **2029**, depois do CSO Transportes. Envelope Cursor: US$ 20 × 40 meses = **US$ 800** (set/2026–dez/2029). Momento 2 / PWA frota depois de dez/2029. |
| 2026-09-09 | Matriz **Funding / Patrocínio** em `planning.html#patrocinio`: envelope Cursor Pro até dez/2029. Dados em `planning-data.js` (`FUNDING`). Não é P&L (nuvem/domínio fora). CTA `index.html#contato`. |
| 2026-09-09 | Matriz `planning.html`: skyline de **11 torres 0–100%** (checklist de negócio) no horizonte 2026–início 2029. Actualização mensal em `assets/js/planning-data.js`. Nav em index/portfólio/ecossistema. |
| 2026-09-09 | **Cota Cursor fila única** (`CALENDARIO_COTA_CURSOR.md`): US$ 20/mês · teto 80% · 1 produto pesado por ciclo. Registro inicial de calendário, consolidado depois na janela de **08/04–dez/2027** para CSO FRO. FRO **não** começa em outubro (cede ao PDV). M2/PWA frota/VT fora do envelope até dez/2028. |
| 2026-09-09 | Ink Agenda: **não haverá** DMG/DEB nativos. **Novidade** = PWA em **26/06/2027**. Download oficial continua só Windows v2.0.0. Roadmap da matriz: Desktop **Concluído** · PWA **Em andamento**. Loja: `pwa.html` + cartão na home; `download.html` sem PWA. |
| 2026-09-08 | Minerador 4.0 **v1.2.3** na loja (`ete.caracore.com.br`): Windows `.exe` + ZIP, Linux `.tar.gz`, macOS `.dmg`. Corrige Flask morto da v1.2.2 (`pyarmor_runtime` no bundle). Memórias IAs: `AGENTS.md` oficina (Canal público), `ECOSYSTEM_MEMORIA` (bloco ETE), `INICIAR_NOVA_TAREFA`, regras Cursor oficina/matriz. |
| 2026-09-08 | PDV v4: plano de GA escrito (`PLANO_LANCAMENTO_V4.md`); **execução com Cursor adiadas para outubro–novembro/2026** (crédito da assinatura). Setembro = não queimar cota nas 8/19 tarefas. CSO Frotas não no mesmo dia de cota. GA 08/11 permanece objetivo; se outubro não absorver A–D, reavaliar a data. |
| 2026-09-08 | **Frentes 08/11/2026:** PDV v4 = GA público (`PLANO_LANCAMENTO_V4.md`; T032 + transparência de líquido). CSO Frotas = já no ar + freeze Momento 1 (COE; FRO/MON/GPS fora deste dia). Transportes desktop = **08/11/2028**. Headline pública do dia = PDV. CSO continua em andamento sem competir pelo lançamento. |
| 2026-09-08 | Memórias IAs + lojas: logins **por linha** (Java Free = 1 operador `admin`/`admin` em `download.html#perfis`; Rust v0.1.4 = quatro logins em `primeiros-passos.html#perfis`). Wiki aponta, não duplica senha. Colaboração: uma camada por vez; sync AGENTS + ECOSYSTEM_MEMORIA + regras do repo. |
| 2026-09-08 | PDV Rust piloto **v0.1.4**: versão discreta na UI; turno do shell alinhado ao SQLite; Gestão/Auditoria do smoke; NSIS/MSI/ZIP + SHA256 na tag `v0.1.4`. PIX QR + teto de 100 vendas na vida inalterados. Não substitui o Java Free. |
| 2026-09-07 | PDV Rust piloto **v0.1.3**: correção busca/scanner no balcão; NSIS/MSI/ZIP + SHA256 na tag `v0.1.3`. PIX QR + teto de 100 vendas na vida inalterados. Não substitui o Java Free. |
| 2026-09-07 | Memórias IAs sincronizadas (AGENTS.md, ecosystem-cara-core.mdc, ECOSYSTEM_MEMORIA, loja/wiki/matriz/oficina): canal loja = `v3.2.4-free`; RC2 **estacionada** para T032; copy Free sem PIX/recibo; SHA RC2 canónico `5e5d55b6…`. |
| 2026-09-07 | PDV Java Free **v3.2.4-free**: UI de balcão no browser (produto + venda + dinheiro), porta 8080, `/login`, Java 25+. Sem PIX integrado e sem recibo na copy pública. Substitui a 3.2.3-free no download da loja. ZIP sem LEIA-ME interno (sidecar na release). RC2 continua prévia. |
| 2026-09-06 | PDV Java Free **v3.2.3-free**: porta 8080, `/login` de operador, launcher Java 25+, boot `3.2.3-free`. Substitui a 3.2.2-free no download da loja. RC2 continua prévia. |
| 2026-09-06 | PDV Java: pré-release **v4.0.0-rc2** (instalação isolada em pasta nova + `./data/caracore-pdv.db`; login `admin/admin`). RC1 não deve ser reutilizado para primeiro acesso. Canal maduro permanece `v3.2.2-free`. T032/GA aberto. |
| 2026-09-06 | Download Rust oficial = `caracore-rust-pdv-releases/releases` (tag v0.1.2). `caracore-pdv-releases` = canal Java. |
| 2026-09-05 | PDV planos + loja: Free alinhado a `PlanoLicencaService` (100 vendas/mês, 100 produtos, 1 operador, 4 vendedores, 1 loja, 10 SMS/mês; sem PIX/NF-e). Premium R$ 79,90/mês. CTA da loja = demonstração presencial. Memória IAs sincronizada. |
| 2026-09-05 | PDV Java: pré-release **v4.0.0-rc1** (Quarkus + Qute, ZIP portátil). Canal maduro permanece `v3.2.2-free`. T032/GA aberto. |
| 2026-09-05 | PDV Java: loja aponta para ZIPs reais da tag `v3.2.2-free` (Windows, Linux e macOS; nomes `free-free` no GitHub). PWA da vitrine em `pdv.caracore.com.br/pwa.html` — não é o caixa. |
| 2026-09-05 | PDV Java oficina: paridade Qute Fases 0–7 técnica (cadastros, fiscal, backup, offline, personas). JavaFX removido do caminho de produção da oficina. **T032 corte não aprovado** (Edge real, suíte completa, instalador assinado). Canal público permanece `v3.2.2-free`. Não substitui o PDV Rust. |
| 2026-09-05 | CSO loja: home de conversão no ar (`cso-transp.caracore.com.br`) — hero Frotas hoje, CTAs `/cadastro`, planos em cards; 2028/GPS/stack abaixo. Sem prova social inventada. |
| 2026-09-05 | CSO Frotas (app): landing com JSON-LD, cache 5 min e LCP WebP em produção (`cso.caracore.com.br`). |
| 2026-09-05 | CSO: loja única centralizada em `D:\onedrive\dev\caracore-cso-releases` (`cso-transp.caracore.com.br`). Oficina `caracore-cso-transportes` sem URL/copy de loja. Em 08/11/2028 as duas frentes viram um só produto. |
| 2026-08-27 | Hosts novos: loja PDV Rust em `pdv-rust.caracore.com.br` (antes rust-pdv); vitrine CSO em `cso-transp.caracore.com.br`. Aplicação Frotas permanece em `cso.caracore.com.br`. Transportes Desktop 08/11/2028. |
| 2026-08-26 | Hub: memória de colaboração para o GA Windows 06/04/2027 (`caracore-hub/docs/contexto-rapido.md`). Web 2.1 pronta; instalador SQLite é o trabalho aberto. Manual público em wiki.caracore.com.br/hub/. |
| 2026-08-26 | Wiki + lojas: PDV/CSO/Hub como produtos-chave; Hub = encomendas (não Flask); CSO ≠ GPS. AGENTS.md e `.cursor/rules/ecosystem-cara-core.mdc` sincronizados. |
| 2026-08-20 | Alinhamento total do ecossistema validado: Roadmap sincronizado (Hub 06/04/2027, RU 18/06/2027, Helianto 30/12/2027, CSO Transportes 08/11/2028). Padronização da oficina `caracore-cso-quarkus`. Atualização da stack Java 25 para Ink e RU na matriz. Correção do link "Site Principal" na Wiki. Criação do `AGENTS.md` raiz. |
| 2026-08-15 | Nomes comerciais: **CaraCore CSO** e **CaraCore PDV** (linha Rust); CSO em `https://cso.caracore.com.br/`. |
| 2026-06-27 | Matriz/Blog: Publicado ensaio avulso "A Normose da Engenharia Financeira e o Retrato de Veblen" no blog de Christian Mulato (total 153 artigos), criticando a patologia social de buscar retornos e atalhos digitais rápidos sem esforço real e trabalho duro, assinado como "Cidadão Brasileiro". |
| 2026-06-14 | Matriz/Blog: Publicado artigo avulso "Os Erros Invisíveis na Arquitetura que Ninguém Te Conta" no blog de Christian Mulato, aprofundando o OWASP Top 10 e assinado como "Cidadão Brasileiro". |
| 2026-06-13 | Matriz/Blog/Retrô: Publicado artigo "O Espelho da Linha de Frente" no blog de Christian Mulato (total 151 artigos) assinado como "Cidadão Brasileiro". Atualizado repositórios (personal-articles → caracore-personal) e contagem do Retrô para 117 artigos. |
| 2026-06-07 | Retrô art. **115** — engenharia B2B pragmática na era da IA; links matriz `#engenharia-b2b`, `#decisoes-engenharia`, `suporte-local.html` |
| 2026-06-07 | Tom vitrine matriz: FinOps/resiliência/híbrido (PT/EN/IT); gaps ideológicos wiki/retrô/lojas = backlog |
| 2026-06-07 | Copy B2B PT/EN/IT: `#engenharia-b2b`, frase-guia, `#decisoes-engenharia`, `suporte-local.html`, docs/ só .md |
| 2026-06-02 | Matriz: PDV Rust v0.1.2, CTAs → GitHub Releases |
| 2026-06-02 | Loja rust-pdv: nav Download → releases; Formatos |
| 2026-06-02 | Wiki: links portfólio corrigidos (www); redirect `portfolio.html` |
| 2026-06-02 | Retrô: artigo 114 PDV Rust/Tauri; doc ecossistema expandida |
| 2026-06-02 | `INICIAR_NOVA_TAREFA.md` — guia produtividade |

---

## Checklists publicação

1. `VALIDACAO_LOJAS_MATRIZ.md`
2. `VALIDACAO_NEGOCIO.md`
3. `CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md`
4. Loja Rust: `releases.js` · nav · transparência
5. Oficina Rust: `sync_docs_status.py --full`
6. Smoke: matriz → loja/releases → footer portfólio

---

## Documentos na matriz (índice)

| Documento | Uso |
|-----------|-----|
| [INDEX.md](INDEX.md) | Índice curado docs/ |
| [INICIAR_NOVA_TAREFA.md](INICIAR_NOVA_TAREFA.md) | **Início de tarefa** |
| [SITE_MATRIZ.md](SITE_MATRIZ.md) | Operar site matriz |
| [MEMORIA_DO_PROJETO.md](MEMORIA_DO_PROJETO.md) | Resumo repo matriz |
| [DILEMA.md](DILEMA.md) | Posicionamento e alinhamento copy B2B |
| [FEEDBACK.md](FEEDBACK.md) | Branding Bunker (fev/2026) |
| [ECOSYSTEM_CARA_CORE.md](ECOSYSTEM_CARA_CORE.md) | Mapa repos |
| [ECOSYSTEM_LOJAS.md](ECOSYSTEM_LOJAS.md) | URLs canónicas |
| [VALIDACAO_LOJAS_MATRIZ.md](VALIDACAO_LOJAS_MATRIZ.md) | Checklist matriz ↔ lojas |
| [VALIDACAO_NEGOCIO.md](VALIDACAO_NEGOCIO.md) | Validação comercial |
| [STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md](STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md) | Estratégia |
| `docs/archive/` | Histórico — não operação diária |

---

## Manutenção desta memória

Ao mudar **URL, release, repo ou regra de comunicação**:

1. Atualizar este ficheiro + `INICIAR_NOVA_TAREFA.md` (se afetar fluxo)
2. Atualizar `ECOSYSTEM_CARA_CORE.md` / `ECOSYSTEM_LOJAS.md`
3. Atualizar `project-memory.mdc` do(s) repo(s) tocados
4. Registar linha na tabela **changelog** acima

---

Cara Core Informática — uso interno.
