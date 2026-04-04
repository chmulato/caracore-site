# Checkpoint de Continuidade
Data: 2026-04-04
Repositorio: caracore-site
Objetivo: consolidar a virada para modelo subdominio-first com matriz desacoplada de ownership de delivery/wiki de produto.

## Escopo confirmado neste checkpoint
- Matriz com links canonicos para subdominios oficiais nas areas principais.
- Wiki de produto na matriz em modo compatibilidade (redirecionamento para lojas).
- Delivery de produto na matriz em modo compatibilidade (entrypoints redirecionando para subdominios).
- Artefatos de planejamento atualizados com status de ciclos 1, 2 e 3 como concluidos.

## Arquivos-chave de rastreabilidade
- portfolio.html
- docs/CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md
- docs/PLANO_DESATIVACAO_DELIVERY_SUBDOMINIOS.md

## Pacotes de commit recomendados (atomicos)

### Pacote A - Planejamento e governanca
Arquivos:
- docs/CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md
- docs/CRONOGRAMA_REMODELAGEM_DELIVERY.md
- docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md
- docs/MATRIZ_MIGRACAO_CONTEUDO_PARA_RELEASES.md
- docs/PLANO_DESATIVACAO_DELIVERY_SUBDOMINIOS.md
- docs/CHECKPOINT_2026-04-04_SUBDOMINIO_FIRST.md

Mensagem sugerida:
- docs: consolida status da remodelagem delivery->subdominios (ciclos 1-3 concluidos)

### Pacote B - Canonizacao da matriz (paginas publicas)
Arquivos minimos:
- portfolio.html
- index.html
- ecosistema.html

Mensagem sugerida:
- site: canoniza links publicos para subdominios oficiais

### Pacote C - Compatibilidade legado wiki/delivery
Arquivos de exemplo (ajustar conforme selecao final):
- wiki/projeto-*.html
- delivery/*/index.html
- delivery/*/download*.html
- delivery/*/canal-feedback.html

Mensagem sugerida:
- site: aplica redirecionamentos de compatibilidade para rotas legado de produto

## Comandos prontos (sem push)
Observacao: execute por pacote para manter historico limpo.

Pacote A:
- git add docs/CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md docs/CRONOGRAMA_REMODELAGEM_DELIVERY.md docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md docs/MATRIZ_MIGRACAO_CONTEUDO_PARA_RELEASES.md docs/PLANO_DESATIVACAO_DELIVERY_SUBDOMINIOS.md docs/CHECKPOINT_2026-04-04_SUBDOMINIO_FIRST.md
- git commit -m "docs: consolida status da remodelagem delivery->subdominios (ciclos 1-3 concluidos)"

Pacote B:
- git add portfolio.html index.html ecosistema.html
- git commit -m "site: canoniza links publicos para subdominios oficiais"

Pacote C (exemplo com selecao ampla):
- git add delivery/ wiki/
- git commit -m "site: aplica redirecionamentos de compatibilidade para rotas legado de produto"

## Checklist pre-commit recomendado
- Revisar diff por pacote antes do commit.
- Garantir que nao ha alteracoes acidentais de encoding em textos sensiveis.
- Validar links principais: portfolio, wiki de projeto, entrypoint de delivery por produto.
- Executar git status apos cada commit para confirmar fronteira limpa entre pacotes.

## Proximo passo natural
- Iniciar Ciclo 4 (SEO/observabilidade): canonical, sitemap e monitoramento de 404/cadeias de redirect.
