# Deploy estático (GitHub Pages / Vercel / Netlify)

Este repositório foi ajustado para rodar como um site estático sem dependências de autenticação/OIDC ou infraestrutura Azure.

Opções de hospedagem gratuitas:

- GitHub Pages (recomendado para site estático simples):
  1. No GitHub, vá em Settings → Pages e selecione branch `gh-pages` ou `main`/`docs` como source.
  2. Se preferir usar `gh-pages` branch, rode localmente:
     - `npm run build` (se houver processo de build)
     - `git checkout -b gh-pages`
     - Copie os arquivos estáticos para raiz (ou configure `docs/`) e commit.
     - Push e ative Pages nas configurações.

- Vercel / Netlify:
  1. Conecte o repositório e aceite as configurações padrão.
  2. Defina `build command` apenas se necessário; para site já estático, deixe em branco.
  3. Defina `output directory` como `.` ou o diretório com os arquivos estáticos.

Notas:
- Arquivos de autenticação foram desativados e configs sensíveis foram substituídos por placeholders.
- Antes de tornar o repositório público novamente, ROTACIONE todas as credenciais comprometidas (Google, Microsoft, Azure, LinkedIn, chaves de tokens).
- Após rotação, considere limpar o histórico (`git-filter-repo`) se desejar remover segredos do histórico git.

Contato / documentação adicional:
- Para ajuda na publicação, abra uma issue ou peça suporte.

## Build e validação de CDN

O site continua estático: os arquivos da raiz já são a saída publicável.
Não há compilação de framework nem bundle a gerar. O build verifica todos
os recursos HTML/CSS, a sintaxe JavaScript e os testes de regressão de CDN.

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

Na Vercel, manter **Output Directory = `.`**. O Build Command pode continuar
em branco ou executar `node scripts/build-static.cjs` em um checkout com Git
e Node disponíveis. Não adicionar os rewrites genéricos de `_redirects`:
esse arquivo é específico do Netlify e a matriz é multipágina.

### Política de cache

- Os dois arquivos de logo branco com hash no nome têm cache de navegador
  de um ano, `immutable`. Ao mudar os bytes, gerar outro hash/nome, atualizar
  as duas imagens da home e as regras exatas de `vercel.json`.
- PNGs de compatibilidade e bibliotecas/fontes em `css/vendor` e `js/vendor`
  têm cache de navegador de 24 horas, sem `immutable`. Uma substituição
  nesses URLs pode levar até 24 horas para alcançar um navegador que já
  os armazenou; para uma atualização urgente, versionar o URL.
- HTML, APIs e configurações de autenticação não receberam cache longo.
- Um HIT da CDN não elimina CDN Requests nem a transferência do corpo
  para o visitante. Cache de navegador e redução de payload atuam sobre
  problemas diferentes.

Para preview local com as regras de cache/redirect desta configuração:

```console
node scripts/preview-static.cjs
```

O preview escuta somente em `http://127.0.0.1:4173`. Ele ajuda a testar a
configuração, mas não substitui verificar os headers reais após o deploy:

```console
curl -I https://www.caracore.com.br/assets/images/logo_branca.65d940959999.webp
curl -I https://www.caracore.com.br/css/vendor/bootstrap-icons/fonts/bootstrap-icons.woff2
curl -I https://www.caracore.com.br/sala/redes/retro/articles.html
```

Verificar também uma URL inexistente: deve continuar retornando HTTP 404,
sem redirecionamento automático para a home. O erro oferece links manuais
para a página inicial e a área segura.

Evidências, reduções medidas e limitações:
[Relatório de CDN/Fast Data Transfer](docs/CDN_VERCEL.md).
