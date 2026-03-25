# Sincronizacao Blog -> LinkedIn

Este projeto possui sincronizacao automatica do ultimo item do feed RSS para o LinkedIn.

## Como funciona

- Fonte de dados: `personal/feed.xml`.
- Execucao automatica: workflow `.github/workflows/linkedin-sync.yml`.
- Trigger automatico: qualquer push na branch `main` que altere `personal/feed.xml` ou `personal/articles/**`.
- Trigger por agenda: execucao diaria automatica (12:00 UTC) para garantir sincronizacao mesmo sem alteracao direta no feed.
- Trigger manual: `workflow_dispatch` no GitHub Actions.
- Anti-duplicacao: o script consulta posts recentes no LinkedIn e pula publicacao quando a URL ja existe.

## Secrets obrigatorios no GitHub

Configurar no repositorio, em `Settings > Secrets and variables > Actions`:

- `LINKEDIN_ACCESS_TOKEN`: token OAuth com permissao de publicacao.
- `LINKEDIN_AUTHOR_URN`: URN do autor no formato:
  - Pessoa: `urn:li:person:xxxxxxxx`
  - Organizacao: `urn:li:organization:xxxxxxxx`

## Permissoes esperadas do token

- Para perfil pessoal: `w_member_social`
- Para pagina de empresa: permissao equivalente para publicacao em organizacao e app autorizado como admin da pagina.

## Teste local (dry-run)

No dry-run nao faz chamadas na API do LinkedIn, apenas mostra o texto que seria publicado.

Exemplo (PowerShell):

```powershell
$env:DRY_RUN = "true"
$env:BLOG_RSS_PATH = "personal/feed.xml"
python scripts/linkedin_sync_from_rss.py
```

## Observacoes

- O sincronizador publica apenas o item mais recente do RSS.
- Se precisar publicar backlog de varios itens, rode manualmente em lotes ajustando o feed ou evolua o script para modo batch.
