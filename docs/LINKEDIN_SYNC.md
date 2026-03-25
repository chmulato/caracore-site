# Sincronizacao Blog + Retro -> LinkedIn

Este projeto possui sincronizacao automatica da publicacao mais recente entre os feeds do blog do Christian e dos Artigos Retro da Cara Core Informática para o LinkedIn.

## Como funciona

- Fontes de dados:
  - `personal/feed.xml`
  - `sala/redes/retro/feed.xml`
- Execucao automatica: workflow `.github/workflows/linkedin-sync.yml`.
- Trigger automatico: qualquer push na branch `main` que altere `personal/feed.xml`, `personal/articles/**`, `sala/redes/retro/feed.xml` ou `sala/redes/retro/articles/**`.
- Trigger por agenda: execucao diaria automatica (12:00 UTC) para garantir sincronizacao mesmo sem alteracao direta no feed.
- Trigger manual: `workflow_dispatch` no GitHub Actions.
- Selecao do item: o script escolhe a publicacao com `pubDate` mais recente entre os dois feeds.
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
$env:BLOG_RSS_PATHS = "personal/feed.xml,sala/redes/retro/feed.xml"
python scripts/linkedin_sync_from_rss.py
```

## Geracao do LINKEDIN_ACCESS_TOKEN

O repositório agora inclui um helper local para OAuth do LinkedIn:

```powershell
python scripts/linkedin_oauth_helper.py auth-url
```

Ou, para automatizar o fluxo completo (callback local + troca do code + gravacao do token no `secrets.txt` + opcionalmente no GitHub Secret):

```powershell
python scripts/linkedin_oauth_helper.py auto --set-github-secret --repo chmulato/cara-core
```

Abra a URL gerada no navegador, autorize o app e copie o valor de `code` do redirect.

Depois troque o code por token:

```powershell
python scripts/linkedin_oauth_helper.py exchange-code --code "AQ..."
```

O JSON de resposta trará `access_token`, que deve ser cadastrado no GitHub como `LINKEDIN_ACCESS_TOKEN`.

## Observacoes

- O sincronizador publica apenas o item mais recente entre os dois RSS configurados.
- Se precisar publicar backlog de varios itens, rode manualmente em lotes ajustando o feed ou evolua o script para modo batch.
