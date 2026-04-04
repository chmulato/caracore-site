# Runbook operacional — Delivery → subdomínios

**Âmbito:** matriz `caracore.com.br`, pastas `delivery/*`, lojas em `*.caracore.com.br`.  
**Plano (MD):** `delivery/` na matriz = **legado/redirect**; destino canónico = **lojas**. **Estado-alvo:** repositório **sem** pasta `delivery/` — pré-requisitos em `docs/FONTES_CANONICAS_MATRIZ_LOJAS.md` §**1.0a**.  
**Fonte canónica por tipo de conteúdo (Sala / lojas / matriz):** `docs/FONTES_CANONICAS_MATRIZ_LOJAS.md` — não repetir essas regras noutros sítios; atualizar só lá quando a arquitetura de informação mudar.

**Grau de execução do plano (0–9):** `docs/PLANO_GRAU_EXECUCAO.md` (sinalização junto ao checklist mestre).

**Documentos relacionados:** `delivery/README.md`, `CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md`, `MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md`, `PLANO_DESATIVACAO_DELIVERY_SUBDOMINIOS.md`.

---

## 1. Princípios

- **Sala de Operações:** canónica em `sala/` na raiz do repo → `/sala/`; produtos **não** duplicam a Sala em `delivery/{produto}/`.
- **Fonte comercial de produto:** subdomínio oficial + repositório `*-releases` (detalhe: `FONTES_CANONICAS_MATRIZ_LOJAS.md`).
- **Matriz:** institucional, portfólio, ecossistema; `delivery/` é **legado** na matriz: **redirect** para as lojas, não vitrine nem fonte de conteúdo comercial novo.
- **Lojas:** cada subdomínio conserva a **apresentação própria** do produto (narrativa, UI); alinhamento canónico = URL/repo — ver `docs/FONTES_CANONICAS_MATRIZ_LOJAS.md` §**1.0b**. Os sites de loja **são** o produto na web (§**1.0c**); o plano não os elimina.
- **SLA de redirect:** 90 dias após ativação por produto (ver checklist mestre).

---

## 2. Publicação e links

1. Novos CTAs e campanhas devem usar **URLs canónicas** do subdomínio (ex.: `https://pdv.caracore.com.br/`), não `https://caracore.com.br/delivery/pdv/`.
2. Páginas em `delivery/{produto}/` devem manter `<link rel="canonical">` apontando para o subdomínio (já padronizado nos `index.html` de produto).
3. Antes de merge, procurar links antigos:
   ```text
   rg "caracore\.com\.br/delivery/" --glob "*.html" .
   ```
4. Artigos retro/sala com links `/delivery/` podem permanecer: os redirects cobrem; em revisões editoriais, trocar para o subdomínio.

---

## 3. SEO na matriz

- **`/sitemap.xml`:** páginas institucionais principais (home, ecossistema, portfólio). Atualizar ao acrescentar página pública indexável no mesmo nível.
- **`robots.txt`:** contém `Sitemap:`; rotas `Disallow` (secure, wiki, sala, personal, etc.) mantêm-se por política.
- **Search Console:** propriedade `caracore.com.br` — enviar sitemap após deploy; monitorar cobertura e erros de rastreio.

---

## 4. Observabilidade — 404 e cadeias de redirect

1. **Manual:** a partir do portfólio e da home, abrir cada CTA para loja e confirmar **um salto** para o subdomínio (sem cadeias longas ou loops).
2. **Search Console** (ou relatório de rastreio): rever URLs com erro e “Redirect” com volume.
3. **Azure Static Web Apps / hospedagem:** se existir relatório de 404, cruzar com `MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md`.
4. Registar incidente se redirect de um produto falhar (ver secção rollback no checklist mestre).

---

## 5. Rollback (resumo)

1. Desativar apenas o redirect do produto afetado (configuração de hospedagem).
2. Restaurar entrypoint legado em `delivery/{produto}/` se necessário.
3. Reativar CTAs na matriz **só** para esse produto, se acordado.
4. Validar links públicos antes de novo rollout.

---

## 6. Artefatos canónicos vs transitórios

| Canónico (manter) | Transitório / histórico |
|---------------------|-------------------------|
| `docs/FONTES_CANONICAS_MATRIZ_LOJAS.md` | |
| `docs/CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md` | Checkpoints datados após fecho do gate final |
| `docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md` | Rascunhos de IP local não commitados |
| `docs/CRONOGRAMA_REMODELAGEM_DELIVERY.md` | |
| Este runbook | |

---

## 7. Gate Ciclo 4 e 5

- **Ciclo 4:** sitemap + robots atualizados; procedimentos deste runbook válidos; revisão de campanhas conforme `CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md`.
- **Ciclo 5:** runbook + checklist permanentes publicados; fecho formal após aprovação de tráfego/conversão (dados reais — responsável produto/marketing).
