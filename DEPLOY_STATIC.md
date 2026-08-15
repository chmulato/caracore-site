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
