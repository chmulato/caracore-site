# Deploy estático (GitHub Pages)

Este repositório roda como um site estático, sem dependências de autenticação/OIDC ou infraestrutura Azure.

## Publicação

- O host público é o **GitHub Pages**, servindo a raiz do repositório da branch `master`.
- Não há compilação de framework nem bundle: os arquivos da raiz já são a saída publicável.
- Cada push em `master` dispara o `pages-build-deployment`. O workflow `Site validation` roda as checagens estáticas.

Notas:

- Arquivos de autenticação foram desativados e configs sensíveis foram substituídos por placeholders.
- Antes de tornar o repositório público novamente, ROTACIONE todas as credenciais comprometidas (Google, Microsoft, Azure, LinkedIn, chaves de tokens).
- Após rotação, considere limpar o histórico (`git-filter-repo`) se desejar remover segredos do histórico git.

Contato / documentação adicional:

- Para ajuda na publicação, abra uma issue ou peça suporte.

## Build e validação

O build verifica todos os recursos HTML/CSS, a sintaxe JavaScript e os testes de regressão de CDN.

Com Node.js 18+ e Git:

```console
node scripts/build-static.cjs
```

Os wrappers `scripts/build.sh` e `scripts/build.bat` executam o mesmo build.
Quando o manifesto npm local estiver disponível, também funcionam
`npm run build` e `npm run build:windows`. Não é necessário instalar
dependências para este build. O manifesto npm local permanece ignorado pelo
Git; a validação não depende de publicá-lo.

No Windows, preferir o comando Node direto ou `npm run build:windows`.
`npm run build` exige um Bash funcional; o WSL desta máquina não está
disponível, sem impedir o build nativo.

### Cache

O repositório não publica configuração de cache: o GitHub Pages serve o site
com `Cache-Control: max-age=600` e não lê `_headers`, `_redirects` nem arquivos
equivalentes. Ao trocar os bytes de um logo com hash no nome, gerar outro
hash/nome e atualizar as duas imagens da home — o nome versionado é o que
evita cache antigo no navegador.

## Preview local

```console
node scripts/preview-static.cjs
```

O preview escuta somente em `http://127.0.0.1:4173`, serve os arquivos e
mantém 404 real para URL inexistente (sem redirecionamento automático para a
home). Ele não emula regras de cache ou redirect do host.

## Verificação pós-publicação

```console
curl -I https://www.caracore.com.br/assets/images/logo_branca.65d940959999.webp
curl -I https://www.caracore.com.br/css/vendor/bootstrap-icons/fonts/bootstrap-icons.woff2
```

Verificar também uma URL inexistente: deve continuar retornando HTTP 404,
sem redirecionamento automático para a home. O erro oferece links manuais
para a página inicial e a área segura.
