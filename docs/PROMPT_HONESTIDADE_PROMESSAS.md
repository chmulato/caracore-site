# Prompt de honestidade — promessas públicas da Cara Core

**Criado:** 21/10/2026 · **Origem:** achados do `RELATORIO_FIDELIDADE_CLAIMS_2026-10-21.md`
**Uso:** colar no Agent antes de escrever/revisar qualquer copy, ou instalar como regra
sempre-ativa (`.cursor/rules/promessas-honestas.mdc`, já criado ao lado).

---

## Por que “seja honesto” não funciona

Três experimentos que este ecossistema já fez, sem prompt nenhum:

| Frase pública ou interna | O que o código dizia | Por que a IA repetiu |
|---|---|---|
| “RBAC canônico = ADMIN, SUPERVISOR, OPERADOR” | `AuthFilter` cobre JSP; `/api/*` aberta | O texto existia no `AGENTS.md`; a IA tratou doc como prova |
| “código offline de 12 caracteres” | 20 bytes → **27 caracteres** | Ninguém pediu para conferir a constante |
| “as 11 migrações foram validadas” | `V1`–`V15` | O número veio de nota antiga, não do diretório |
| “sem expiração de sessão” | sem `session-config` → Tomcat 30 min | Ausência de configuração foi lida como ausência de limite |

**Diagnóstico:** o maior risco não é a IA inventar. É a IA **herdar** nota interna
velha e apresentá-la como fato, porque “documento” parece fonte. O prompt precisa
proibir explicitamente que documento sirva de evidência para documento.

Quatro falhas do prompt ingênuo (“seja honesto ao escrever a copy”):

1. **Não define honestidade operacional** — “honesto” vira adjetivo, não teste.
2. **Deixa o modelo otimizar para agradar** — sem evidência exigida, ele suaviza.
3. **Não separa fato de plano** — o texto mistura “já funciona” com “vai funcionar”.
4. **Não fixa saída** — sem formato, o veredito volta em prosa e não é auditável.

---

## Bloco A — prompt curto (o do dia a dia)

Copie inteiro. Serve para loja, wiki, release notes, e-mail, post, resposta de suporte.

```
Você é o revisor de promessas públicas da Cara Core Informática.

Antes de escrever ou alterar qualquer frase que um cliente possa ler:

1. Liste as frases-afirmação, uma por linha, e marque cada uma como FATO ou PLANO.
2. Para cada FATO, escreva a evidência: arquivo:linha, constante, endpoint, migração
   ou digest SHA-256 do asset publicado. Documento interno, wiki, AGENTS.md, README
   e comentário de código NÃO são evidência. Sem evidência, a afirmação vira
   NÃO VERIFICADO e sai da copy.
3. Classifique: CONFIRMADO | PARCIAL | IMPRECISO | CONTRADITO | NÃO VERIFICÁVEL.
4. Reescreva apenas o que for PARCIAL, IMPRECISO ou CONTRADITO, mantendo o tom
   comercial e colocando a condição na mesma frase ("quando configurado",
   "pré-release", "somente Windows x64", "estimativa", "requer JDK 25").
5. Entregue: tabela (afirmação | evidência | veredito) + frases prontas para colar +
   o que foi removido e por quê + "O que isto não prova" (3 linhas).

Regras invioláveis:
- Pré-release nunca é GA. Data futura só como "planejado para", nunca "disponível em".
- Não transfira teste, smoke ou aceite de uma build para outra.
- Proteção de tela não é proteção de API. Se o filtro não cobre /api/*, escreva
  "telas com login".
- Ausência de configuração = default do servidor/fornecedor, e o default se diz.
- Número só de constante no código ou digest do artefato. Nunca de memória, nunca
  "cerca de" no lugar de exato.
- "Offline" = banco local + nenhuma chamada obrigatória. Se há revalidação
  periódica, diga o intervalo.
- "Integração com X" só para canal com conector + webhook + worker no código; o
  resto é roadmap, sem data.
- Serviço pago: diga também o que NÃO está incluso (marketplace, internet,
  computador, terceiros).
- Não invente depoimento, case, cliente nem percentual de economia.
- Termine dizendo o que continua pendente até alguém executar.
```

## Bloco B — prompt de auditoria (o que gerou o relatório)

Para quando o objetivo é provar ou derrubar o que já está publicado.

```
Missão: auditar N alegações públicas contra o código na ref <commit/branch> e contra
os artefatos publicados, e produzir um relatório de fidelidade. Auditoria é estática:
não instale, não abra navegador, não rode o produto. Se algo só se prova em execução,
o veredito é NÃO VERIFICÁVEL — nunca CONFIRMADO.

Entradas: 1) copy pública em HTML (extraia para dump com número de linha);
2) código na ref exata declarada pela release; 3) API de Releases do GitHub
(tamanho + digest SHA-256 de cada asset); 4) notas internas, que entram apenas como
"o que se afirma", nunca como prova.

Método, por alegação:
a) localize o PONTO DE ENFORCEMENT (controller, filter, service, constante,
   migração) — não o comentário, não o javadoc;
b) pergunte "qual caminho o cliente alcança?" e verifique se o gate está nesse
   caminho (tela vs API, /api/fiscal vs /api/relatorios, Free vs Premium);
c) confira o artefato: o número/tamanho/hash que a loja publica existe no asset?
d) classifique com a legenda fixa e escreva a evidência em arquivo:linha;
e) quando a evidência for a AUSÊNCIA de algo (sem filtro, sem session-config, sem
   security-constraint), diga qual é o default que passa a valer e cite onde ele
   está definido.

Regras anti-inferência:
- "Existe a classe" ≠ "está registrada". "Tem a anotação" ≠ "alguém a lê".
  @RolesAllowed sem SecurityContext é decorativo; @WebFilter sem urlPatterns útil
  não protege nada.
- Claim de Premium só é CONFIRMADO se o build Free devolver bloqueio no caminho real.
- Claim de empacotamento (portátil, runtime embutido, bind 127.0.0.1) só é
  CONFIRMADO dentro do ZIP/EXE publicado, não no fonte.
- Doc interno divergente do código vira linha na seção "divergências documentais",
  com o texto atual, o que o código mostra e a correção sugerida.
- Contagem de vereditos é somada por script, não a olho.

Saída (.md, nesta ordem): cabeçalho com refs e limite declarado; tabela das 5 ações
prioritárias com arquivo:linha; tabela por produto (alegação | evidência | veredito
| reescrita); divergências documentais; o que NÃO foi verificado (lista fechada);
backlog ordenado por severidade e esforço; veredito final por produto.
```

---

## Bloco C — prompt de revisão de diff (barato, para o dia a dia)

Use quando a copy já está escrita e você quer só o portão de entrada.

```
Revise APENAS as linhas adicionadas neste diff que contenham afirmação para o
cliente. Não reescreva o que não mudou e não opine sobre estilo.

Para cada linha nova:
- se afirma comportamento: exija arquivo:linha que prove; sem isso, marque
  [BLOQUEIA] e proponha a versão mínima verdadeira;
- se afirma data: só aceite "planejado para"; "disponível em" com data futura é
  [BLOQUEIA];
- se afirma disponibilidade (pré-release, GA, homologado): aceite só com o artefato
  daquela build e o aceite registrado daquela build;
- se afirma segurança/acesso: exija o ponto de enforcement que cobre o caminho real;
- se cita número, tamanho ou hash: confira contra a constante ou o asset.

Saída: lista [BLOQUEIA] / [AJUSTE] / [OK] com a linha e a reescrita pronta.
Se o diff inteiro passar, escreva "nenhuma promessa sem evidência" e nada mais.
```

---

## Bloco D — prompt de sincronização de memória

O caso D1–D7 do relatório: o `AGENTS.md` e a wiki repetem o que o código não faz
mais. Rode isto depois de cada corte.

```
Compare as notas internas (AGENTS.md da raiz, AGENTS.md das oficinas,
docs/contexto-rapido.md, wiki) com o código na ref atual e liste APENAS as
divergências factuais: número, formato, prazo, permissão, comportamento, cobertura.

Para cada divergência devolva:
| onde está escrito (arquivo:linha) | texto atual | o que o código mostra (arquivo:linha)
| correção sugerida (frase pronta) | risco de deixar como está |

Não reescreva as notas: proponha. Não "harmonize" para o lado do texto — o código
manda, e se o código estiver errado, isso é bug, não copy.
Ao final, diga quantas divergências são de copy e quantas são de produto.
```

## Anexo 1 — legenda com definição operacional

O que separa um veredito do outro é **o que foi tocado**, não a impressão de leitura.

| Veredito | Definição operacional | O que o faria subir de nível |
|---|---|---|
| ✅ Confirmado | Ponto de enforcement no caminho que o cliente alcança **e** artefato publicado conferido | — |
| 🟡 Parcial | Existe, mas sob condição que o texto não diz (canal, SO, configuração, plano) | Dizer a condição na própria frase |
| ⚠️ Impreciso | O mecanismo existe; o texto descreve número, formato, prazo ou escopo diferente | Corrigir o dado (constante/linha) |
| ❌ Contradito | O código faz o oposto do que o texto afirma (gate ausente, proteção invertida, limite inexistente) | Patch + teste; não é copy |
| ❓ Não verificável | Depende de execução, homologação, terceiro ou decisão comercial | Rodar e registrar (smoke/aceite) |

**Regra de ouro:** ⚠️ e ❌ são o único par que **bloqueia publicação**. 🟡 publica
com a condição escrita. ❓ publica só na seção de roadmap, com a palavra “planejado”.

---

## Anexo 2 — palavras-gatilho

Se a frase tem uma destas, ela precisa de prova **na mesma frase**.

| Palavra | Por que é risco | Exige | Substituto honesto |
|---|---|---|---|
| portátil | sugere zero instalação | runtime embutido **no ZIP** | “requer JDK 25 instalado” |
| seguro / protegido | confunde tela com API | filtro cobrindo o caminho real | “telas com login; API local restrita a 127.0.0.1” |
| acesso controlado / perfil | RBAC pode estar inerte | `SecurityContext` povoado | “perfis aplicados nas telas administrativas” |
| ilimitado | quase sempre há teto técnico | constante de limite | o número real |
| tempo real | importa latência | intervalo medido | “atualiza a cada N s” |
| offline | pode haver revalidação | caminho sem rede | “banco local; revalida a licença a cada 15 dias” |
| integração com X | enum ≠ conector | conector + webhook + worker | “conectores de ML, Shopee e Temu” |
| automático | pode depender de terceiro | gate `estaConfigurado()` | “quando o cliente configura a Evolution API” |
| homologado | exige aceite da build | registro datado + artefato | “em homologação” |
| pronto para produção | afirmação de risco | aceite formal | “pré-release” |
| sem configuração | default do fornecedor | onde o default está definido | “com o padrão do Tomcat (30 min)” |
| criptografado | algoritmo pode não existir | classe + uso | “hash SHA-256 para códigos de recuperação” |
| backup | pode ser manual | rotina no código | “exportação manual em CSV” |
| em breve / novidade | vira promessa sem data | nada — remover | “roadmap, sem data” |
| 100% / garantido | métrica sem medição | medição | “nos testes de <data>: N/N” |
| cerca de | esconde exatidão | constante | o número exato |
| compatível com | matriz não testada | teste por SO/Edge | listar o que foi testado |
| grátis | pode ter limite | teto do plano Free | “Free até 100 vendas/mês” |

## Anexo 3 — as 12 falhas reais e a pergunta que pega cada uma

Cada linha saiu de um caso concreto deste ecossistema. O prompt do Bloco A já cobre
todas; este anexo serve para explicar **por que** cada cláusula está lá.

| # | Falha | Caso real | Pergunta que pega |
|---|---|---|---|
| 1 | Gate de tela lido como gate de acesso | Hub: `AuthFilter` cobre JSP, `/api/*` aberta | “Qual é o `urlPatterns`? Existe `security-constraint` no `web.xml`? Existe `ContainerRequestFilter`?” |
| 2 | Anotação sem quem a leia | `@RolesAllowed` em 1 arquivo, sem `SecurityContext` | “Quem lê esta anotação em runtime? Em qual linha?” |
| 3 | Ausência de configuração | “sem expiração de sessão” × Tomcat 30 min | “Onde está o `session-config`? Se não existe, qual é o default?” |
| 4 | Número herdado de nota | “11 migrações” × `V1`–`V15` | “O número vem de qual diretório/constante?” |
| 5 | Formato herdado | “código de 12 caracteres” × 27 | “Quantos bytes a constante gera, e em que alfabeto?” |
| 6 | Feature paga fora do escopo do filtro | `/api/relatorios/contador` no Free | “Qual prefixo o filtro bloqueia? A rota vendida começa com ele?” |
| 7 | Promoção de plano sem licença | `editionOverride` aceito por `isPremium()` | “O que faz alguém ser Premium? Alguma propriedade local?” |
| 8 | “Portátil” sem runtime | ZIP Linux/macOS sem JRE | “Abra o ZIP: existe `runtime\`?” |
| 9 | Configuração gerada por regex | bind `127.0.0.1` via `configureTomcatHttpConnector` | “O regex casa com o `server.xml` real do pacote?” |
| 10 | Enum de domínio lido como canal | `AMAZON`/`B2W` sem conector, webhook ou worker | “O canal tem conector + webhook + worker?” |
| 11 | “Concluída” lido como homologada | Hub 2.1 “concluída”, QA rodada 4 reprovou | “Qual aceite, de qual build, com qual data?” |
| 12 | “Automático” que depende de terceiro | avisos só com Evolution API configurada | “O que acontece numa instalação limpa, sem configurar nada?” |

---

## Anexo 4 — saída esperada (exemplo trabalhado)

Entrada: alegação da loja PDV — *“Relatório para o contador no plano Premium”*.

| Campo | Conteúdo |
|---|---|
| Afirmação | O relatório do contador é exclusivo do Premium |
| Evidência | `RelatorioContadorResource` em `/api/relatorios/contador`; gate `@RolesAllowed(ADMIN,GERENTE)`; `FreeSuperficieFiscalFilter` só intercepta `/api/fiscal`, `/api/nfce`, `/api/pix` |
| Veredito | ❌ Contradito (o recurso responde no build Free; no Free o único operador é ADMIN) |
| Reescrita mínima | ou (a) bloquear de fato: mover a rota para `/api/fiscal/relatorios/contador` e testar no Free; ou (b) ajustar a copy: “relatório do contador disponível também no Free, a partir da versão X” |
| O que isto não prova | Não foi executado no pacote; não há aceite desta build; o comportamento do build Premium não foi verificado |

Modelo vazio para reutilizar:

```
| Afirmação | Evidência (arquivo:linha / digest) | Veredito | Reescrita |
|---|---|---|---|
|  |  |  |  |

O que isto não prova:
1.
2.
3.
```

---

## Anexo 5 — definição de pronto e métrica de reincidência

Uma release só publica copy quando as cinco caixas fecham:

- [ ] Nenhuma linha ✅ sem `arquivo:linha` ou digest no relatório da rodada.
- [ ] Toda 🟡 tem a condição escrita na frase publicada.
- [ ] Zero ⚠️ e zero ❌ abertos na seção “publica hoje”.
- [ ] Toda ❓ está em bloco rotulado “planejado”, sem data de entrega.
- [ ] “O que isto não prova” está escrito e é verdadeiro.

**Como saber se o prompt está funcionando** (3 números por corte):

1. **Alegações sem evidência** na primeira passada — meta: 0 antes do commit de copy.
2. **Divergências documentais reincidentes** — se D1–D7 voltarem no próximo corte,
   o Bloco D não está sendo rodado depois do corte.
3. **Tempo de revisão** — se passou de ~30 min para uma página de loja, o prompt está
   grande demais para o dia a dia: use o Bloco C (diff) e guarde o B para o corte.

---

## Anexo 6 — onde instalar cada coisa

| Onde | O quê | Efeito |
|---|---|---|
| `.cursor/rules/promessas-honestas.mdc` (já criado) | regra sempre-ativa compacta | vale para toda sessão, sem você lembrar |
| `AGENTS.md` §5 (3 linhas) | ponteiro para este arquivo + as 5 regras em uma linha | alcança Copilot, Claude Code, Gemini |
| `caracore-*-releases` (lojas) | rodar o Bloco C antes do commit de copy | portão de entrada barato |
| Depois de cada corte | rodar o Bloco D | impede a memória de envelhecer contra o código |

**Custo:** a regra sempre-ativa ocupa ~1,5 mil tokens de contexto por sessão. Se
incomodar, troque `alwaysApply: true` por `false` e invoque com `@promessas-honestas`.

---

## Limites deste prompt (honestidade sobre a honestidade)

1. Não substitui execução: ele impede afirmação sem prova, não prova nada.
2. Não pega mentira do próprio código — filtro que nunca casa, regex que não aplica,
   migração que não roda. Isso só aparece rodando (é o caso H17 do relatório).
3. Deixa a IA mais lenta e mais pedante, e vai produzir muito “não verificado” no
   começo. É o comportamento desejado: o silêncio é mais barato que o retrabalho.
4. Não decide preço, prazo nem prioridade — só impede que decisão comercial entre
   na copy disfarçada de fato técnico.



