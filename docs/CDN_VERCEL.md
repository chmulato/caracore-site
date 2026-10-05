# Correção de CDN / Fast Data Transfer — Vercel Hobby

Validação local: 05/10/2026. **Sem commit, push ou deploy nesta tarefa.**
Domínio, DNS, HTTPS, plano e Firewall não foram alterados.

## 1. Causa confirmada — ALTO

O arquivo `assets/images/logo_branca.png` tinha **1.389.022 bytes**,
PNG RGBA de **1024 × 1536 px**. Cerca de 8.100 respostas completas desse
arquivo correspondem a **11,251 GB decimais**, compatíveis com os
aproximadamente **11,24 GB Transfer Out** informados na Vercel.

Isso confirma a causa do custo por resposta, mas **não identifica quem
originou os acessos**. Cache HIT da CDN não elimina transferência ao
cliente. Não há evidência para atribuir o volume a bots conhecidos.

Antes: dois elementos visuais na home carregavam o mesmo PNG. A home não
altera seu `src`, não usa polling, service worker ou reload automático.
Bootstrap é incluído uma vez por página, não duas. O navegador validado
coalesceu os dois logos em **uma requisição**, portanto não se confirmou
que as duas posições provoquem dois downloads em cada visita.

O logo escuro original tem **16.357 bytes**, PNG RGBA de **154 × 200 px**.
São três referências públicas em HTML: Open Graph e Twitter na home,
Open Graph no portfólio. A auditoria anterior contou 14 menções textuais
no projeto incluindo documentação/ferramentas. Há uma cópia compatível
em `images/logo.png`.

## 2. Modificações e redução medida

| Arquivo/uso | Antes (bytes) | Depois (bytes) | Redução | Alteração |
|---|---:|---:|---:|---|
| Logo branco carregado pela home | 1.389.022 | 117.882 | 91,51% | WebP qualidade 90, `logo_branca.65d940959999.webp` |
| `assets/images/logo_branca.png` | 1.389.022 | 456.635 | 67,13% | PNG cinza + alpha; mantém o URL antigo |
| Fallback da home | 1.389.022 | 456.635 | 67,13% | PNG versionado `logo_branca.ee46061e2dfb.png` |
| `assets/images/logo.png` | 16.357 | 8.418 | 48,54% | PNG paletizado sem perdas de pixels, com ICC preservado |
| `images/logo.png` | 16.357 | 8.418 | 48,54% | Mesma compressão da cópia compatível |

O WebP e os PNGs preservam dimensões e **alpha pixel a pixel**. Para o
logo escuro, todos os pixels RGBA foram preservados. O PNG branco remove
uma variação mínima de cor ao usar cinza, com diferença RMS por canal
inferior a 0,25 em escala 0–255 sobre os fundos testados; não se trata
de compressão lossless desse logo.

O WebP branco teve RMS inferior a 0,5 em preto, branco e verde da página.
Screenshots comparados com o original renderizado no mesmo navegador:
RMS máximo de **0,258 no desktop** e **0,327 no mobile**, em escala 0–255.
Inspeção visual preservou marca, texto, bordas e brilho.

Mantivemos 1024 × 1536: o logo renderizou com larguras de 356/451 px no
desktop e 244/366 px no mobile. A ordem existente do CSS prevalece sobre
alguns limites declarados nas classes de logo; não alteramos esse layout.
As dimensões originais continuam úteis para telas de alta densidade.

Os dois `picture` usam o mesmo WebP versionado, com fallback PNG.
Nenhuma referência visual ativa da home carrega o PNG antigo. A versão
antiga também foi reduzida para beneficiar acessos diretos e páginas
antigas em cache. PNG foi mantido nos metadados sociais por compatibilidade.

## 3. Impacto esperado

- Para o mesmo número de 8.100 respostas completas do novo WebP: cerca
  de **0,955 GB**, em lugar de **11,251 GB** — economia de **10,296 GB**.
- Se um cliente continuar requisitando o URL PNG antigo: cerca de
  **3,699 GB** para 8.100 respostas, redução de 67,13%.
- Browser cache pode eliminar requisições de assets em visitas repetidas
  do mesmo navegador, enquanto estiverem frescos. Não impede acessos de
  novos clientes, requisições diretas ou clientes que ignoram cache.
- Não há garantia de reduzir o total de CDN Requests em 91,51%; essa
  porcentagem é a redução do payload do logo branco.

As milhares de requisições aos vendors são compatíveis com os milhares
de carregamentos de páginas observados, mas sua origem não está provada.
São recursos legítimos de CSS, JavaScript e ícones. Nenhuma biblioteca
vendor foi editada, removida ou substituída.

## 4. Cache — MÉDIO

Na inspeção inicial, produção servia `public, max-age=0, must-revalidate`,
inclusive para logos/vendors. Esse header exige revalidação no browser
antes do reuso; um 304 economiza corpo, mas ainda é uma requisição.

`vercel.json` agora define:

- Um ano + `immutable` exclusivamente para os dois URLs com hash.
- 24 horas, sem `immutable`, para os PNGs antigos e vendors/fontes.
- `max-age=120, s-maxage=86400` apenas na home e cinco páginas
  institucionais públicas; o navegador pode reutilizar HTML por dois
  minutos, enquanto o cache compartilhado pode mantê-lo por 24 horas.
- Nenhum cache público explícito nas demais páginas HTML, APIs ou
  configurações de autenticação.
- Sem alteração das bibliotecas nem redução deliberada do cache de edge.

O cache curto do HTML pode evitar uma nova CDN Request quando o mesmo
navegador revisita uma dessas páginas em até dois minutos. A redução depende
de haver visitas repetidas dentro dessa janela; não evita a primeira visita
nem reduz o número de acessos de clientes/crawlers diferentes.

Regras locais foram testadas em um preview que aplica a configuração.
**Headers reais da Vercel e redução de consumo precisam ser confirmados
depois da publicação**. Não temos acesso autenticado à configuração de
build/output, Firewall ou logs do dashboard.

## 5. 404 — MÉDIO

`404.html` redirecionava automaticamente para `/` ou `/secure/index.html`.
Uma visita a um caminho inválido podia, portanto, carregar a home e
seus assets pesados. Não se comprovou loop infinito de redirect.
Uma resposta de erro recebida como imagem/script/fetch não executa,
por si só, esse JavaScript de navegação.

Agora o erro não tem script ou refresh, contém `noindex` e oferece
links explícitos. URLs desconhecidos continuam sendo erros, não páginas
200 reescritas indiscriminadamente para a home.

Correções comprovadas:

- 12 links em `aligned/en/articles.html` e `aligned/it/articles.html`
  passam a apontar para `https://retro.caracore.com.br/`.
- Dois links em `handbook/HANDBOOK.html` e
  `publications/livros/apostila_ms365.html` apontam para
  `https://wiki.caracore.com.br/projetos-overview.html`.
- A entrada retrô antiga do sitemap foi atualizada para a URL canônica.
- Dois redirects permanentes **exatos** na Vercel preservam URLs antigas.
- O `articles.html` da loja retrô é um stub com meta refresh para `/`;
  os novos links apontam direto ao destino final para evitar outro salto.
- A home passou de quatro declarações de favicon para uma; os arquivos
  e URLs de compatibilidade continuam existindo.

Não copiamos os rewrites catch-all do Netlify para a Vercel.
`robots.txt`, as páginas indexáveis, o domínio e os metadados sociais
foram preservados, fora a correção canônica dessa entrada do sitemap.

## 6. Requests automáticos e hipóteses não confirmadas

- **Home:** inicialização de UI, Analytics e iframe lazy do mapa;
  nenhuma requisição recorrente ao próprio site nos 65 segundos testados.
  Tráfego de terceiros não é contabilizado como saída da Vercel.
- **Legado administrativo:** `secure/js/admin-users-manager.js` possui
  auto-refresh de 30 segundos para `/api/admin/users`, condicionado ao
  fluxo autenticado. Esse endpoint está ausente na publicação estática.
  Pode gerar 404 numa aba que alcance esse fluxo, mas não explica o
  payload do logo na home. Não inventamos uma API nem refizemos autenticação.
- **Outros scripts legados:** validação de sessão, token refresh,
  retries limitados e reload após recuperação/ação de usuário.
  Presença de timers não comprova execução na home.
- **Não confirmados:** hotlink, monitor externo, usuários/crawlers sem
  cache, request direto, tráfego com classificação incompleta de bot.
  Para atribuição, comparar IP/ASN, User-Agent, Referer, status 200/304
  e bytes por request na Vercel, respeitando dados pessoais.

Não foi aplicado bloqueio genérico, desafio indiscriminado nem alteração
de Firewall/Bot Protection. Se necessário depois da correção, usar
monitoramento e regras gratuitas estreitas, baseadas em abuso comprovado,
sem bloquear buscadores legítimos ou tráfego normal.

## 7. Assets mais pesados, antes da correção

Não são todos carregados pela home. Mantivemos imagens de publicação,
impressão/PDF e bibliotecas não relacionadas ao problema, sem otimização
indiscriminada.

| Arquivo | Bytes | Tipo |
|---|---:|---|
| `cv/public/img/banner_top.png` | 4.225.284 | PNG |
| `secure/img/historia_01.png` | 3.366.659 | PNG |
| `publications/livros/assets/img/02_capa_old.png` | 2.841.117 | PNG |
| `handbook/business_plan/images/CAPA_MANUAL_PY.png` | 2.782.654 | PNG |
| `handbook/images/CAPA_MANUAL_PY.png` | 2.782.654 | PNG |
| `publications/livros/assets/img/CAPA_MANUAL_PY.png` | 2.782.654 | PNG |
| `js/vendor/mermaid/mermaid.min.js` | 2.748.992 | JavaScript |
| `secure/img/historia_02.png` | 2.561.652 | PNG |
| `publications/livros/assets/img/02_capa.png` | 2.412.076 | PNG |
| `publications/livros/assets/img/01_capa.png` | 2.364.469 | PNG |
| `publications/livros/assets/img/contra_capa.png` | 2.247.386 | PNG |
| `publications/livros/assets/img/capa.png` | 2.160.501 | PNG |
| `handbook/business_plan/images/CAPA_MANUAL.png` | 2.150.969 | PNG |
| `images/security.png` | 2.148.293 | PNG |
| `secure/img/security.png` | 2.148.293 | PNG |
| `assets/images/security.png` | 2.148.293 | PNG |
| `publications/livros/assets/img/COVER.png` | 2.135.229 | PNG |
| `handbook/images/COVER.png` | 2.135.229 | PNG |
| `handbook/images/SECURITY.png` | 1.657.760 | PNG |
| `publications/livros/assets/img/SECURITY.png` | 1.657.760 | PNG |

## 8. Validação

- Build estático completo: HTML/CSS, referências a recursos, sintaxe JS
  e testes de regressão. Os wrappers de build antes apontavam para
  arquivos inexistentes; foram implementados sem novas dependências.
- 100 HTML, 507 referências a recursos e 98 checagens de sintaxe JS.
- Oito testes Node: logos, hashes, budgets, cache, 404, redirects,
  favicon, vendors e respostas HTTP no preview.
- Edge headless desktop 1366 × 900 e mobile iPhone 13 (390 × 844):
  logos renderizados, uma requisição WebP por visita fria, zero PNG,
  cache reutilizado na recarga, sem overflow e menu mobile funcional.
- Nenhuma requisição adicional à própria origem ou navegação/reload
  na janela ociosa de 65 segundos desktop; mobile também sem requests
  adicionais na janela de cinco segundos.
- URL inválida testada: HTTP 404, endereço preservado, sem imagens,
  iframe ou scripts, sem navegação automática.
- Transparência e diferenças visuais verificadas com Pillow e
  screenshots do navegador. Nenhuma dependência foi instalada.
- O fallback PNG também foi carregado nas duas posições no Edge,
  simulando a ausência de suporte ao tipo WebP.
- Diagnósticos do editor: sem erros nos arquivos centrais alterados.
- O runner de runtime da extensão estava indisponível; o replay foi
  feito com Node e Edge locais, não apresentado como execução da extensão.
- `npm run build:windows` passou. `npm run build` chamou o Bash do WSL
  e falhou por um disco WSL inexistente nesta máquina. O build nativo
  completo não depende de WSL; esse problema de ambiente não foi alterado.

### Avisos preexistentes — BAIXO para este problema de CDN

Seis source maps opcionais de Bootstrap CSS/JS, Chart.js, oidc-client-ts
e das duas cópias de html2pdf estão ausentes. DevTools pode procurá-los;
navegação normal não depende deles. São avisos explícitos no build.
Não removemos comentários de bibliotecas vendor nem inventamos maps.

Três scripts legados já possuem erros de sintaxe:

- `js/oidc.js:18`: `await` fora de função async.
- `secure/js/session-manager.js:21`: `}` inesperado.
- `secure/js/user-session-manager.js:22`: `}` inesperado.

O build compara os bytes com `HEAD` antes de classificar esses erros como
preexistentes. Falhas de sintaxe novas ou em arquivos alterados são fatais.
Não há novos erros de sintaxe; isso **não significa que todo o legado
esteja livre de erros**. Esses três arquivos não foram alterados nem são
carregados pela home validada.

## 9. Próximos passos após publicar

1. Confirmar headers, WebP, favicon, redirects exatos e status 404 na Vercel.
2. Comparar bytes por resposta e transferência por caminho na mesma
   janela de 12 horas; observar WebP e PNG antigo separadamente.
3. Investigar a origem dos requests se o volume continuar alto, em vez
   de concluir automaticamente que são bots ou aumentar o plano.

Referências:

- [Cache-Control na Vercel](https://vercel.com/docs/caching/cache-control-headers)
- [CDN Cache na Vercel](https://vercel.com/docs/caching/cdn-cache)
- [Deploy e comandos de validação](../DEPLOY_STATIC.md)
