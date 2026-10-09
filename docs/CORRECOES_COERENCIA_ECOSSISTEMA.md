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
| PDV Java v4 | Pré-release `v4.0.0-rc5`. RC4 fica no histórico. GA 08/11/2026 condicionado ao T032 |
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
| INC-01 | `AGENTS.md` e `caracore-site/AGENTS.md`, linha da **Loja PDV** no snapshot | “RC4 é pré-release da edição Free, ainda não homologada para produção” | Pré-release vigente = `v4.0.0-rc5`, validada em testes internos, roteiro formal pendente. As duas cópias de `AGENTS.md` saem iguais | aberto |
| INC-02 | `caracore-site/portfolio.html` · `#caracore-ink-agenda` e `#portfolio-releases` | O corpo já diz `v2.0.1`. O selo (linha 516), o rodapé do card (linha 578), o comentário HTML (linha 496) e a linha do tempo (linhas 1595–1598) ainda apresentam `v2.0.0` de 26/06/2026 como versão atual | Versão atual do card e da linha do tempo = `v2.0.1` · 07/10/2026. A data 26/06/2026 permanece só como histórico da `v2.0.0` | aberto |
| INC-03 | `docs/VALIDACAO_LOJAS_MATRIZ.md` (atualizado em 07/06/2026) | Ink `v2.0.0`. OIDC `v2.0.0-RC1`. Secção 11 trata o CSO como garagem. Hub marcado OK sem a pré-release | Ink `v2.0.1`. OIDC `v2.0.2-free`. CSO: Frotas em produção, loja `cso-transp`, Transportes em 08/11/2028. Hub: pré-release `v2.1.0-rc1.2`, GA 06/04/2027. Atualizar a data do ficheiro | aberto |
| INC-04 | `docs/ECOSYSTEM_CARA_CORE.md` (cabeçalho 30/09/2026) | PDV ainda em RC4 (linhas 18 e 60). CSO na linha 40: produção `e193d6d` e FRO `08/abr–dez/2027`. A linha 86 mistura esse commit com “FRO 24/24 publicado em 06/10” | PDV = `v4.0.0-rc5`. CSO vigente = `b90d1dc`, Flyway V33, FRO 24/24 desde 06/10. `e193d6d` fica como commit anterior de COE, se ainda for útil como histórico. A janela de 2027 não reabre | aberto |
| INC-05 | `docs/ECOSYSTEM_LOJAS.md` (rodapé 27/08/2026) | Ink “Desktop v2.0.0”. Hub “sem release pública” | Ink `v2.0.1`. Hub: pré-release Windows `v2.1.0-rc1.2`, instalador e ZIP, unsigned; GA 06/04/2027. Atualizar a data do ficheiro | aberto |
| INC-06 | `docs/ECOSYSTEM_MEMORIA.md`, bloco **Marco v4 (04/10/2026)** | A frase abre no presente: “`v4.0.0-rc4` é a pré-release pública” | Manter o SHA e o relato daquele dia. Marcar o bloco como snapshot de 04/10. A pré-release vigente, no topo do ficheiro, continua a ser a RC5 | aberto |
| INC-07 | `caracore-site/assets/js/planning-data.js` | Reino OIDC `now` / `hundred`: “Edição Free 2.0.1”. Circuito `now`: “v2.0.23 na loja” | OIDC `v2.0.2-free`. Circuito `v2.0.24`, com `v2.0.23` no histórico | aberto |
| INC-08 | `docs/INDEX.md` (09/09/2026) e mapas de artigos | Retrô ainda com **117 artigos** (`INDEX.md`, `ECOSYSTEM_CARA_CORE.md`). O mesmo mapa do blog pessoal ainda diz **153 artigos**. `AGENTS.md` diz 138 no Retrô e 259 no blog; a memória diz 139 HTML no Retrô | Contar os HTML em `caracore-retro` e `caracore-personal`. Gravar um único número vigente em `AGENTS.md`, `INDEX.md` e `ECOSYSTEM_CARA_CORE.md`. Linhas antigas do changelog não se reescrevem | aberto |

---

## B. Escrito no checkout, publicação por confirmar

Isto não se corrige apagando a frase. A frase está certa: o texto local existe e o deploy ainda não foi confirmado.

| ID | Frente | O que a memória já regista | Próximo passo | Estado |
|---|---|---|---|---|
| INC-09 | CSO institucional | Em 06/10 a aplicação `cso.caracore.com.br` já descreve a frota. A copy da matriz, da wiki e da loja `cso-transp` foi alinhada no checkout e ainda não foi publicada | Publicar só a pedido do dono. Depois, confirmar no ar e fechar este item | aberto |
| INC-10 | CDN da matriz | Correções em `docs/CDN_VERCEL.md`: logo WebP, cache e 404. Build e testes locais passaram. Sem commit/push/deploy | Medir headers e transferência na Vercel depois do deploy | aberto |
| INC-11 | Matriz do Reino OIDC `v2.0.2-free` | Loja, central de downloads e wiki alinhadas. A matriz ficou no checkout, sem deploy | Publicar a matriz a pedido do dono e confirmar a página no ar | aberto |

---

## C. Ordem sugerida

1. INC-01, INC-04, INC-05, INC-06 e INC-03 — documentos que outras IAs leem como estado atual.
2. INC-08 — só depois da contagem.
3. INC-02 e INC-07 — copy pública da matriz, no mesmo checkout.
4. INC-09, INC-10 e INC-11 — publicação, cada uma com pedido explícito.

---

## Fechos

| Data | ID | O que ficou feito |
|---|---|---|
| — | — | Nenhum item fechado na abertura deste registo |
