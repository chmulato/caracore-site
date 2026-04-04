# Checklist de Execucao
## Remodelagem Delivery -> Subdominios

| Sinalização | Valor |
|-------------|--------|
| **Grau de execução (0–9)** | **6** |
| **Pré-grau 7 (técnico)** | **Concluído** — `docs/EVIDENCIA_BASELINE_TECNICO_PRE_GRAU7.md` |
| **Documento da escala** | `docs/PLANO_GRAU_EXECUCAO.md` |

**Próximo passo para o grau 7:** evidência Search Console + smoke em produção + **§ Gates de negócio** (registo). O lado técnico do repositório está preparado; ver evidência acima.

**Plano em MD:** `delivery/` na matriz = legado/redirect → **respetivas lojas**; **estado-alvo = eliminar a pasta `delivery/`** do repositório quando o hospedeiro cobrir o mapa — ver `docs/FONTES_CANONICAS_MATRIZ_LOJAS.md` §1.0 e **§1.0a**.  
**Arquitetura de informação (uma fonte por tipo):** `docs/FONTES_CANONICAS_MATRIZ_LOJAS.md` — Sala apenas em `sala/` na raiz; conteúdo de produto apenas nas lojas (subdomínios); `delivery/` só compatibilidade. Evita redundância e acoplamento entre documentos e pastas.

## Ciclo 0 - Preparacao e baseline
- [x] Criar plano de fases
- [x] Criar cronograma de execucao
- [x] Inventariar pastas por produto em delivery
- [x] Levantar baseline de volume por produto (arquivos)
- [x] Criar mapa inicial rota antiga -> subdominio
- [x] Mapear paginas criticas (top trafego/campanha)
- [x] Definir janela formal de compatibilidade (SLA de redirect)
- [x] Definir estrategia de rollback por produto
- [x] Documentar fontes canonicas e anti-redundancia (`docs/FONTES_CANONICAS_MATRIZ_LOJAS.md`)

## Ciclo 1 - Canonizacao da matriz
- [x] Remover CTAs de produto para /delivery/*
- [x] Direcionar CTAs para subdominios oficiais
- [x] Direcionar links da wiki para subdominios oficiais
- [x] Validar links quebrados em paginas publicas
- [x] Aprovar gate: zero links comerciais para /delivery/*

## Ciclo 2 - Redirecionamento
- [x] Criar pagina padrao de redirecionamento por produto
- [x] Aplicar redirect em /delivery/{produto}/
- [x] Validar navegacao em desktop/mobile
- [x] Aprovar gate: redirects funcionando nas rotas principais

## Ciclo 3 - Corte de duplicidade
- [x] Migrar vitrines do produto para repo `-releases` correspondente
- [x] Migrar wiki de produto para repo `-releases` correspondente
- [x] Migrar texto comercial para fonte unica (subdominio)
- [x] Reduzir delivery a compatibilidade/acervo
- [x] Revisar conteudo duplicado remanescente
- [x] Aprovar gate: sem duplicidade comercial ativa

## Ciclo 4 - SEO e observabilidade
- [x] Atualizar canonical/sitemap (canonical já nos HTML principais; `sitemap.xml` na raiz + `Sitemap:` em `robots.txt` — 2026-04-01)
- [x] Procedimentos de monitorização 404 e cadeias de redirect (ver `RUNBOOK_OPERACAO_DELIVERY_SUBDOMINIOS.md` §4)
- [x] Revisão de links em campanhas: procedimento no runbook; varredura `rg "caracore\\.com\\.br/delivery/" --glob "*.html"` — ainda há ocorrências em retro/sala (redirect cobre; trocar em revisões editoriais)
- [ ] Aprovar gate: estabilidade de trafego e conversao (dados Search Console / marketing — decisão humana)

## Ciclo 5 - Fechamento
- [x] Publicar runbook operacional final (`docs/RUNBOOK_OPERACAO_DELIVERY_SUBDOMINIOS.md`)
- [x] Publicar checklist de manutencao permanente (`docs/CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md`)
- [x] Encerrar artefatos transitorios (tabela canónico vs transitório no runbook §6)
- [ ] Aprovar gate final (após evidência de tráfego/conversão)

## Gates de negócio — registo (avanço para graus 7, 8 e 9)

Ao aprovar, marcar os checkboxes acima **e** atualizar o **Grau** no topo deste ficheiro e em `docs/PLANO_GRAU_EXECUCAO.md`.

| Gate | Grau | Data (AAAA-MM-DD) | Aprovador | Evidência (SC, relatório, nota) |
|------|:----:|-------------------|-----------|--------------------------------|
| Ciclo 4 — estabilidade tráfego/conversão | 7 | | | |
| Ciclo 5 — fecho após evidência | 8 | | | |
| Encerramento operacional (revisão SLA / modo manutenção) | 9 | | | |

## Baseline do inventario (iniciado)
- area51: 9 arquivos
- circuito: 32 arquivos
- cso: 5 arquivos
- ete: 68 arquivos
- hub: 56 arquivos
- ink: 8 arquivos
- mkt: 10 arquivos
- oidc: 59 arquivos
- pdv: 52 arquivos
- ru: 10 arquivos
- seed: 15 arquivos

## Decisoes fechadas do Ciclo 0
- Janela de compatibilidade (SLA): 90 dias corridos apos ativacao dos redirects por produto.
- Ordem de execucao por impacto: P0 (pdv, hub, ink) -> P1 (seed, ete, oidc) -> P2 (circuito) -> P3 (area51, ru, cso, mkt).
- Rollback por produto:
	1) Restaurar entrypoint legado sem redirect.
	2) Reativar links da matriz para a rota legado apenas do produto afetado.
	3) Abrir incidente e registrar causa, horario e escopo.
	4) Reprocessar validacao de links antes de nova tentativa.

## Atualizacao de status (2026-04-04)
- Ciclo 1 concluido.
- Ciclo 2 concluido.
- Ciclo 3 concluido.
- Estado atual da matriz: sem ownership de wiki de produto; paginas legado redirecionam para subdominios oficiais.

## Atualizacao de status (2026-04-01)
- Ciclo 4: entregaveis tecnicos e documentacao publicados (sitemap, robots, runbook, checklist manutencao). Gates de negocio (trafego/conversao) pendentes de aprovacao humana.
- Ciclo 5: runbook e checklist permanentes publicados; gate final pendente de aprovacao.

## Atualizacao de status (2026-04-01 — grau 0-9)
- **Grau 6:** todos os itens técnicos dos Ciclos 0–5 concluídos; pendem apenas os **gates de negócio** (Ciclo 4 e Ciclo 5). Detalhe: `docs/PLANO_GRAU_EXECUCAO.md`.
- **Continuação na escala:** rota 7→9, preparação no grau 6 e tabela de registo em `PLANO_GRAU_EXECUCAO.md` e §**Gates de negócio** neste ficheiro.

## Atualizacao de status (2026-04-04 — pré-grau 7)
- **Pré-requisito técnico para grau 7:** concluído — `docs/EVIDENCIA_BASELINE_TECNICO_PRE_GRAU7.md`. **Grau oficial** mantém-se **6** até gate Ciclo 4 (Search Console / marketing + registo na tabela §Gates).

## Atualizacao de status (2026-04-01 — redundancia delivery)
- **Conteúdo de produto na matriz:** pastas `delivery/{produto}/` contêm apenas HTML de **redirect** para subdomínios; vitrines e wikis ficam nas lojas `*-releases`.
- **`docs/FONTES_CANONICAS_MATRIZ_LOJAS.md`:** referência única para Sala vs lojas vs matriz; planos (`PLANO_*`, runbook, checklists) remetem a este ficheiro em vez de repetir tabelas.
- **`delivery/README.md`:** descreve exceções (`sala/`, `assets/`, `publications/`).
- **`MIRROR_DELIVERY.md`:** realinhados por produto (incl. `ete`, `cso`) para apontar só para a loja oficial.
- **`.github/config/production.yml`:** texto em UTF-8 (comentários e nomes sem mojibake).
