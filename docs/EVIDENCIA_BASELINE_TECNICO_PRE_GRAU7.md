# Baseline técnico — pré-requisito para grau 7

Documento **automático / repositório** para suportar o gate Ciclo 4 (“estabilidade tráfego/conversão”). **Não substitui** evidência Search Console nem aprovação humana; quando a equipa tiver export SC e aprovador, preencher `CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md` §Gates e subir o **grau oficial** para **7**.

**Gerado:** 2026-04-04 (verificação local do workspace).

---

## 1. Ficheiros críticos na raiz do site

| Ficheiro | Estado |
|----------|--------|
| `sitemap.xml` | Presente |
| `robots.txt` | Presente |
| `index.html` | Presente |

---

## 2. Sala canónica (`sala/`)

| Verificação | Resultado |
|-------------|-----------|
| `sala/**/*.html` sem `/delivery/` em links | **0** ocorrências (grep) |

---

## 3. HTML e URL `caracore.com.br/delivery`

| Verificação | Resultado |
|-------------|-----------|
| Ficheiros `*.html` com URL literal `caracore.com.br/delivery` em conteúdo comercial | Stubs de produto usam subdomínios; `delivery/sala/` foi removido do repo (redirects no hospedeiro). |

---

## 4. Exemplo de redirect de produto (`delivery/pdv/`)

Stub `index.html` redireciona para `https://pdv.caracore.com.br/` com `canonical` alinhado (amostra revista no repositório).

---

## 5. O que falta para o **grau 7** (negócio)

1. **Search Console** (ou equivalente): export ou nota com período e conclusão de estabilidade / ausência de regressão relevante.
2. **Smoke em produção** (recomendado): home → portfólio → pelo menos um link por loja principal — `RUNBOOK_OPERACAO_DELIVERY_SUBDOMINIOS.md` §4.
3. Preencher tabela **§ Gates de negócio** no checklist e marcar o checkbox do Ciclo 4; atualizar **Grau** para **7** em `PLANO_GRAU_EXECUCAO.md` e no topo do checklist.

---

## 6. Registo após aprovação

| Campo | Valor |
|-------|--------|
| Data | _(preencher)_ |
| Aprovador | _(preencher)_ |
| Evidência SC / nota | _(preencher ou anexar)_ |
