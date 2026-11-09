# Google Analytics 4 no ecossistema Cara Core

Fonte única da medição de audiência. Estado de **09/11/2026**.

## Decisão de arquitetura

**Uma propriedade, um stream.** O ID `G-MKFC9G3CL0` vale para todo `*.caracore.com.br`;
a separação entre matriz, wiki, central e lojas é feita pela dimensão `hostname`, e o
cruzamento entre subdomínios usa cookie em `.caracore.com.br` mais `linker`.
Alternativas descartadas em 09/11/2026: um stream por subdomínio (15 IDs para manter) e
uma propriedade por produto (perde o funil matriz → loja → download).

## Onde a tag está

Arquivo único `assets/js/analytics.js`, copiado byte a byte em cada repositório e publicado
em `assets/js/analytics.js` da raiz de cada site. Checksum de referência:

```
5539dfbb4c40be7686e67787409cf7f7fb6d5f18417f4d790474144185155f30
```

| Superfície | Host | Páginas com a tag |
|---|---|---|
| Matriz | `caracore.com.br` / `www` | 13 (raiz e `publications/livros/`) + 14 em `aligned/` |
| Wiki | `wiki.caracore.com.br` | 63 de 63 |
| Central de Downloads | `download.caracore.com.br` | 4 de 4 |
| PDV | `pdv.caracore.com.br` | 56 de 56 |
| Hub | `hub.caracore.com.br` | 7 de 7 |
| Ink | `ink.caracore.com.br` | 17 de 17 |
| CSO | `cso-transp.caracore.com.br` | 9 de 9 |

Todas as páginas carregam `<script defer src="/assets/js/analytics.js"></script>` antes de
`</body>` (na matriz, com caminho relativo `assets/js/analytics.js`).

**Fora da medição, de propósito:** `secure/` (área autenticada, bloqueada no `robots.txt`), as
lojas dos brincos (OIDC, Circuito, Seed, RU, Helianto, ETE, Área 51, MKT e afins) e `404.html`
(o teste `404 remains an error page without automatic navigation or heavy resources` exige página
sem `<script>`; e `aligned/index.html`, que é só o seletor de idioma que redireciona em 2 s).

## Como a tag funciona

1. **Consent Mode v2.** Antes de qualquer comando, publica `consent default` com
   `analytics_storage`, `ad_storage`, `ad_user_data` e `ad_personalization` negados.
2. **Sem aceite, sem download.** O `gtag.js` só é baixado depois de `analytics_storage`
   concedido; interação e ociosidade apenas antecipam a carga quando o aceite já existe.
   Quem recusa não gera cookie nem requisição ao Google.
3. **Carga adiada.** A tag não compete com o LCP: o `dataLayer` enfileira e o script entra
   após interação ou ~3 s de ociosidade.
4. **Banner.** Páginas com `#lgpd-banner` usam o banner próprio (`assets/js/lgpd.js`, que
   agora só delega para `CaraCoreAnalytics.grant()`/`deny()`); as demais recebem um banner
   injetado com o mesmo texto e as mesmas cores do site.
5. **Cookies.** `cookie_domain: '.caracore.com.br'`, padrão do GA4 no restante. Recusar
   apaga `_ga`, `_gid` e `_gat` do domínio e do host.
6. **Evento-chave `contato`.** Clique em `wa.me`, `t.me`, `mailto:` ou `tel:` envia
   `contato` com `metodo` (`whatsapp`, `email`, `telefone`), `link_url` e `link_text`.
   Download de arquivo e clique externo continuam vindo da medição aprimorada.
7. **CSP.** As páginas da matriz liberam `https://*.google-analytics.com`,
   `https://*.analytics.google.com` e `https://www.googletagmanager.com` em `connect-src`.
   Antes disso o `region1.google-analytics.com` era bloqueado e parte dos hits se perdia.

## O que só o dono faz (portal)

GA4 → Administrador:

1. **Fluxos de dados → stream do `caracore.com.br` → Configurar seus domínios**: incluir
   todos os subdomínios acima (mede o cruzamento matriz → loja).
2. **Coleta de dados → Medição aprimorada**: manter ativa (page view, rolagem, clique
   externo, download de arquivo, interação com formulário).
3. **Exibição de dados → Retenção**: 14 meses (máximo do plano gratuito).
4. **Vínculos de produto → Search Console**: vincular a propriedade de domínio
   `caracore.com.br` para habilitar os relatórios de Consulta e o canal orgânico.
5. **Eventos → Eventos principais**: marcar `contato` e `file_download` como conversões.
6. **Definições personalizadas**: registrar `metodo` (escopo de evento) para relatar canal
   de contato.
7. **Filtros de dados → Tráfego interno**: definir a regra por IP (casa, escritório e as
   máquinas usadas em verificação) e marcar como `traffic_type`.
8. **Configurações da propriedade**: fuso `America/Sao_Paulo`, moeda `BRL`.
9. **Anotações**: registrar 06/11/2026 (release pública da PDV v4.0.0) e 08/11/2026 (GA).

Search Console:

1. A **propriedade de domínio** `caracore.com.br` está verificada por registro TXT e cobre
   todos os subdomínios; a meta tag de verificação continua só na home (`index.html`).
2. Enviar os **sete sitemaps** (matriz, wiki, central, PDV, Hub, Ink e CSO). Regras, inventário
   e lista de URLs em `INDEXACAO_SEO.md`.

## Leitura do insight de 06/11/2026

O "total de usuários em 1 dia" deu 81 contra a faixa prevista de 16–61 no mesmo dia em que a
PDV v4.0.0 teve a release pública. O pico tem duas origens conhecidas — lançamento mais
acesso de verificação às páginas publicadas — e nenhuma delas era separável antes deste
ajuste, porque não havia filtro de tráfego interno. Depois do item 7 da lista do portal,
picos passam a ter causa atribuível.

## Pendências conhecidas

- Lojas dos brincos sem tag (10 repositórios).
- Blog pessoal (`caracore-personal`) com script próprio, que ainda carrega o `gtag.js` sem
  consultar o consentimento.
- Lojas dos brincos sem `robots.txt` e sem `sitemap.xml` próprios; o núcleo (matriz, wiki,
  central e quatro lojas) está coberto — ver `INDEXACAO_SEO.md`.
- `assets/js/analytics.js` é copiado por repositório: qualquer alteração precisa ser
  propagada e conferida pelo checksum acima.
- Dívida anterior a este ajuste: `scripts/tests/cdn-assets.test.cjs` reprova dois casos
  (`404 remains an error page…` e `local preview…`) porque `404.html` carrega seis
  folhas de estilo e o bundle do Bootstrap desde antes — o teste exige uma página de erro sem
  recursos externos. Não é consequência da tag: o arquivo está igual ao `HEAD`.
