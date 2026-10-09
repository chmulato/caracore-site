# Correções de coerência do ecossistema

Registo do que ainda contradiz o discurso canônico de **08/10/2026**. Serve para corrigir texto e para separar o que está escrito no checkout do que já foi publicado.

**Aberto em:** 08/10/2026  
**Fonte do valor certo:** `AGENTS.md` (raiz e cópia `caracore-site/AGENTS.md`, que permanecem iguais) e o snapshot de `docs/ECOSYSTEM_MEMORIA.md`.  
**Fora deste registo:** gates já declarados de forma consistente (roteiro formal do T032, `PERF-001–007` congeladas, aceite de QA do Hub `v2.1.0-rc1.2`, causa do login da conta real). Não os “fechar” no texto.

Leitura de checkout. Produção no ar não foi reconsultada nesta data.

---

## Como usar

1. Corrigir um item de cada vez. Uma camada por vez: documento interno, depois copy da matriz, e publicação só quando o dono pedir.
2. Linhas de changelog com data passada ficam como histórico. O que se corrige é frase no presente que ainda trata versão antiga como vigente.
3. Ao fechar um item, marcar **feito** nesta tabela e acrescentar uma linha no changelog de `ECOSYSTEM_MEMORIA.md`.
4. Contagens de artigos só entram no texto depois de contar os ficheiros. Não copiar 117, 138, 139 ou 259 sem essa contagem.

---

## Valor canônico (08/10/2026)

| Frente | Valor vigente |
|---|---|
| PDV Java estável | `v3.2.7-free` · CTA **Baixar Free (3.2.7)** |
| PDV Java v4 | Download público `v4.0.0-rc5`. `v4.0.0-rc6` em preparação, SHA-256 a publicar. GA 08/11/2026 condicionado ao T032 |
| PDV Rust | Piloto `v0.1.4` |
| CSO Frotas | FRO 24/24 em produção desde 06/10 (`b90d1dc`, Flyway V33). Freeze M1 em 08/11/2026. A janela abr–dez/2027 não reabre |
| CSO Transportes | GA 08/11/2028 |
| Hub | Pré-release Windows `v2.1.0-rc1.2` (instalador e ZIP, unsigned). GA 06/04/2027 |
| Ink | Desktop Windows `v2.0.1` (07/10/2026). `v2.0.0` no histórico |
| Reino OIDC | Free `v2.0.2-free` na página de download |
| Circuito Ferradura | `v2.0.24`. `v2.0.23` no histórico |

---

## A. Texto que ainda contradiz o canônico

| ID | Onde | O que está escrito | Correção | Estado |
|---|---|---|---|---|
| INC-01 | `AGENTS.md` e `caracore-site/AGENTS.md`, linha da **Loja PDV** no snapshot | “RC4 é pré-release da edição Free, ainda não homologada para produção” | Pré-release pública `v4.0.0-rc5`, validada em testes internos, roteiro formal pendente. `v4.0.0-rc6` em preparação, SHA-256 a publicar. As duas cópias de `AGENTS.md` saem iguais | feito |
| INC-02 | `caracore-site/portfolio.html` · `#caracore-ink-agenda` e `#portfolio-releases` | O corpo já diz `v2.0.1`. O selo, o rodapé do card, o comentário HTML e a linha do tempo ainda apresentavam `v2.0.0` de 26/06/2026 como versão atual | Versão atual do card e da linha do tempo = `v2.0.1` · 07/10/2026. A data 26/06/2026 permanece só como histórico da `v2.0.0` | feito |
| INC-03 | `docs/VALIDACAO_LOJAS_MATRIZ.md` (atualizado em 07/06/2026) | Ink `v2.0.0`. OIDC `v2.0.0-RC1`. Secção 11 trata o CSO como garagem. Hub marcado OK sem a pré-release | Ink `v2.0.1`. OIDC `v2.0.2-free`. CSO: Frotas em produção, loja `cso-transp`, Transportes em 08/11/2028. Hub: pré-release `v2.1.0-rc1.2`, GA 06/04/2027. Atualizar a data do ficheiro | feito |
| INC-04 | `docs/ECOSYSTEM_CARA_CORE.md` (cabeçalho 30/09/2026) | PDV ainda em RC4 (linhas 18 e 60). CSO na linha 40: produção `e193d6d` e FRO `08/abr–dez/2027`. A linha 86 mistura esse commit com “FRO 24/24 publicado em 06/10” | Download público `v4.0.0-rc5`; `v4.0.0-rc6` em preparação, SHA-256 a publicar. CSO vigente = `b90d1dc`, Flyway V33, FRO 24/24 desde 06/10. `e193d6d` fica como commit anterior de COE. A janela de 2027 não reabre | feito |
| INC-05 | `docs/ECOSYSTEM_LOJAS.md` (rodapé 27/08/2026) | Ink “Desktop v2.0.0”. Hub “sem release pública” | Ink `v2.0.1`. Hub: pré-release Windows `v2.1.0-rc1.2`, instalador e ZIP, unsigned; GA 06/04/2027. Atualizar a data do ficheiro | feito |
| INC-06 | `docs/ECOSYSTEM_MEMORIA.md`, bloco **Marco v4 (04/10/2026)** | A frase abre no presente: “`v4.0.0-rc4` é a pré-release pública” | Manter o SHA e o relato daquele dia. Marcar o bloco como snapshot de 04/10. O estado vigente fica no topo: download público `v4.0.0-rc5`; `v4.0.0-rc6` em preparação | feito |
| INC-07 | `caracore-site/assets/js/planning-data.js` | Reino OIDC `now` / `hundred`: “Edição Free 2.0.1”. Circuito `now`: “v2.0.23 na loja” | OIDC `v2.0.2-free`. Circuito `v2.0.24`, com `v2.0.23` no histórico | feito |
| INC-08 | `docs/INDEX.md` (09/09/2026) e mapas de artigos | Retrô ainda com **117 artigos** (`INDEX.md`, `ECOSYSTEM_CARA_CORE.md`). O mesmo mapa do blog pessoal ainda diz **153 artigos**. `AGENTS.md` diz 138 no Retrô e 259 no blog; a memória diz 139 HTML no Retrô | Contagem em 09/10: Retrô 139 HTML em `docs/articles` (1 a 139). Blog 264 HTML em `docs/articles`. Número vigente em `AGENTS.md`, `INDEX.md` e `ECOSYSTEM_CARA_CORE.md`. Linhas antigas do changelog não se reescrevem | feito |

---

## B. Escrito no checkout, publicação por confirmar

Isto não se corrige apagando a frase. A frase está certa: o texto local existe e o deploy ainda não foi confirmado.

| ID | Frente | O que a memória já regista | Próximo passo | Estado |
|---|---|---|---|---|
| INC-09 | CSO institucional | Em 06/10 a aplicação `cso.caracore.com.br` já descreve a frota. A copy da matriz, da wiki e da loja `cso-transp` foi alinhada no checkout e ainda não foi publicada | Conferido no ar em 09/10: `ecosistema.html`, `wiki.caracore.com.br/projeto-cso.html` e `cso-transp.caracore.com.br` descrevem km/L, documentos, pneus, exame, infrações e custo por km | feito |
| INC-10 | CDN da matriz | Correções em `docs/CDN_VERCEL.md`: logo WebP, cache e 404. Build e testes locais passaram. Sem commit/push/deploy | A Vercel não é o serviço. Host público: GitHub Pages. WebP no ar, 117.882 bytes, `Cache-Control: max-age=600`. 404 sem redirect automático. O `vercel.json` não governa esses headers | feito |
| INC-11 | Matriz do Reino OIDC `v2.0.2-free` | Loja, central de downloads e wiki alinhadas. A matriz ficou no checkout, sem deploy | Conferido no ar em 09/10: home, `ecosistema.html` e `portfolio.html` oferecem `v2.0.2-free` e **Baixar Free (2.0.2)**. `Last-Modified` da home: 09/10/2026 13:52:50 GMT | feito |

---

## C. Ordem sugerida

1. Registo de 08/10 fechado em 09/10. INC-01 a INC-11 feitos. A matriz pública é GitHub Pages. A Vercel não é o serviço.

---

## Fechos

| Data | ID | O que ficou feito |
|---|---|---|
| 2026-10-09 | INC-01 | Linha da Loja PDV nos dois `AGENTS.md`: pré-release pública `v4.0.0-rc5`, roteiro formal pendente; `v4.0.0-rc6` em preparação, SHA-256 a publicar |
| 2026-10-09 | INC-02 | `portfolio.html`: selo, rodapé, comentário e linha do tempo do Ink passam a `v2.0.1` · 07/10/2026. O parágrafo do card conserva `v2.0.0` em 26/06/2026 como histórico. Checkout local, sem deploy |
| 2026-10-09 | INC-03 | `VALIDACAO_LOJAS_MATRIZ.md`: Ink `v2.0.1`, OIDC `v2.0.2-free`, Hub pré-release `v2.1.0-rc1.2` com GA 06/04/2027, CSO com Frotas em produção e loja `cso-transp`. Data do ficheiro atualizada |
| 2026-10-09 | INC-04 | `ECOSYSTEM_CARA_CORE.md`: PDV com download público `v4.0.0-rc5` e `v4.0.0-rc6` em preparação. CSO vigente `b90d1dc`, Flyway V33, FRO 24/24 desde 06/10. `e193d6d` fica como commit anterior de COE. Contagens de artigos ficam para o INC-08 |
| 2026-10-09 | INC-05 | `ECOSYSTEM_LOJAS.md`: Ink `v2.0.1` (07/10/2026). Hub: pré-release Windows `v2.1.0-rc1.2`, instalador e ZIP, unsigned; GA 06/04/2027. Data do ficheiro atualizada |
| 2026-10-09 | INC-06 | Bloco Marco v4 de `ECOSYSTEM_MEMORIA.md` marcado como snapshot de 04/10. SHA-256 da RC4 conservado. O estado vigente permanece no topo: download público `v4.0.0-rc5`; `v4.0.0-rc6` em preparação |
| 2026-10-09 | INC-08 | Contagem de HTML: Retrô 139 em `caracore-retro/docs/articles` (1 a 139, sem falha). Blog 264 em `caracore-personal/docs/articles`. Número vigente nos dois `AGENTS.md`, em `INDEX.md`, em `ECOSYSTEM_CARA_CORE.md` e na regra Cursor da matriz. Changelog antigo intacto |
| 2026-10-09 | INC-07 | `planning-data.js`: Reino OIDC passa a Edição Free `v2.0.2-free` (`v2.0.1-free` e `v2.0.0` no histórico). Circuito Ferradura passa a `v2.0.24` na loja, com `v2.0.23` no histórico. Checkout local, sem deploy |
| 2026-10-09 | INC-09 | Copy da frota confirmada no ar: `www.caracore.com.br/ecosistema.html`, `wiki.caracore.com.br/projeto-cso.html` e `cso-transp.caracore.com.br` descrevem km/L, documentos, pneus, exame, infrações e custo por km |
| 2026-10-09 | INC-11 | Matriz no ar com Reino OIDC `v2.0.2-free` e **Baixar Free (2.0.2)** na home, no ecossistema e no portfólio. `Last-Modified` da home: 09/10/2026 13:52:50 GMT |
| 2026-10-09 | INC-10 | A Vercel não é o serviço. Host público da matriz: GitHub Pages. WebP do logo branco no ar (117.882 bytes) com `Cache-Control: max-age=600`. 404 sem redirect automático. O `vercel.json` não governa esses headers |
