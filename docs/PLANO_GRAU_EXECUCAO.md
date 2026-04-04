# Grau de execução do plano (escala 0–9)

Uma escala **única** de progresso para a remodelagem **Delivery → subdomínios** e fontes canónicas. Documento operacional: `docs/CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md`.

| Grau | Significado | Critério (tudo o que está acima +) |
|:----:|-------------|-------------------------------------|
| **0** | Não iniciado | Plano e baseline não existem ou são inválidos |
| **1** | Ciclo 0 | Preparação e baseline concluídos |
| **2** | Ciclo 1 | Matriz canonizada (CTAs não apontam para `/delivery/*` como destino comercial) |
| **3** | Ciclo 2 | Redirecionamentos por produto ativos nas rotas principais |
| **4** | Ciclo 3 | Duplicidade comercial cortada; `delivery/` só compatibilidade |
| **5** | Ciclo 4 técnico | SEO matriz: `sitemap.xml`, `robots.txt`, procedimentos 404/redirect no runbook |
| **6** | Ciclo 4–5 técnico | Grau 5 + runbook permanente + checklist de manutenção + artefatos transitórios alinhados (runbook §6); **gates de negócio ainda em aberto** |
| **7** | Gate Ciclo 4 | Evidência de estabilidade de tráfego/conversão (Search Console / marketing) — **aprovação humana** registada no checklist |
| **8** | Gate final | Encerramento Ciclo 5 após evidência — **aprovação humana** registada no checklist |
| **9** | Encerrado | Grau 8 + revisão operacional opcional (ex.: confirmação pós-janela SLA ou “modo só manutenção”) |

## Estado atual (sinalização)

| Campo | Valor |
|--------|--------|
| **Grau oficial** | **6** |
| **Pré-grau 7 (técnico)** | **Concluído** — baseline em `docs/EVIDENCIA_BASELINE_TECNICO_PRE_GRAU7.md` (repositório). O número **7** só após gate Ciclo 4 + registo. |
| **Escala** | 0 a 9 (10 níveis) |
| **Bloqueios para subir** | Grau **7**: evidência SC/marketing + fechar gate Ciclo 4 no checklist. Grau **8**: gate final. Grau **9**: encerramento operacional. |

Atualizar o **Grau** neste ficheiro e a linha correspondente em `CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md` sempre que um gate for aprovado ou quando o critério do grau 9 for cumprido.

---

## Ligação aos ciclos

- Graus **1–4** ↔ Ciclos **0–3** (itens técnicos do checklist).
- Graus **5–6** ↔ Ciclo **4** (técnico) e **5** (documentação permanente), sem gates.
- Graus **7–8** ↔ checkboxes de **aprovação** nos Ciclos 4 e 5.
- Grau **9** ↔ fecho formal após grau 8.

---

## Rota para os graus 7, 8 e 9

| Alvo | Ação | Onde registar |
|------|------|----------------|
| **→ 7** | Reunir evidência de estabilidade (Search Console: cobertura/erros; opcional: período comparativo antes/depois dos redirects). Marketing/produto confirma que não há incidente aberto ligado a URLs `/delivery/*`. Aprovador humano marca o gate Ciclo 4 no checklist e preenche a tabela de registo. | `CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md` §Gates |
| **→ 8** | Com base na mesma evidência (ou relatório único que cubra ambos os critérios), aprovador marca o **gate final** Ciclo 5. Pode coincidir com o fecho do gate 7 na mesma reunião. | Idem |
| **→ 9** | Registar data e nota curta de “plano em modo manutenção” (ex.: SLA Ciclo 0 revisto, ou confirmação de que só se altera `delivery/` para redirects). Responsável identificado para futuras alterações. | Tabela **§ Gates de negócio** no checklist |

**Regra:** o número do grau neste ficheiro e no topo do checklist só sobe **depois** do registo preenchido e dos checkboxes `[x]` correspondentes. A **tabela de datas e aprovadores** é a do checklist mestre (`CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md` §Gates de negócio).

---

## Preparação no grau 6 (antes da aprovação humana)

Checklist técnica no repositório (não substitui Search Console):

- [x] `sala/**/*.html` sem ocorrências de `/delivery/` em links (compatível com fonte canónica em `sala/`).
- [x] Baseline técnica documentada (`docs/EVIDENCIA_BASELINE_TECNICO_PRE_GRAU7.md`).
- [ ] Export ou nota Search Console (equipa — preencher §Gates do checklist).
- [ ] Smoke em **produção**: home → portfólio → um link por loja principal (`RUNBOOK_OPERACAO_DELIVERY_SUBDOMINIOS.md` §4).

**Baseline técnico (repositório):** ver ficheiro de evidência acima. Repetir grep antes de fechar o gate 7 se houver PRs grandes na matriz.
