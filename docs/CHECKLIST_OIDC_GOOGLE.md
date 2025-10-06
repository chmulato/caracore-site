# Checklist OIDC Google

Checklist de diagnóstico passo a passo para integrações OIDC com o Google diretamente pelo Google Cloud Console. Cada seção traz onde configurar, um teste rápido e o que observar.

## 1. Fluxo e biblioteca (Authorization Code + PKCE / Google Identity Services)

### 1.1 Onde configurar no Console

- Console ▸ **APIs & Services** ▸ **Credentials** ▸ **Create Credentials** ▸ **OAuth client ID**.
- Aplicações Web com backend: utilize o fluxo **Authorization Code** com PKCE quando aplicável.
- SPA ou front-end puro: prefira **Google Identity Services (GIS)** (One Tap / botão “Sign in with Google”) em vez do fluxo implícito legado.

### 1.2 Teste rápido

- Gere uma URL `/o/oauth2/v2/auth` com `response_type=code`, `code_challenge` (S256), `scope=openid email profile`, `state` e `nonce`. Verifique se o `code` chega ao `redirect_uri` configurado.

## 2. Redirect URIs idênticas (evitando `redirect_uri_mismatch`)

### 2.1 Onde configurar no Console

- Console ▸ **APIs & Services** ▸ **Credentials** ▸ selecione o OAuth 2.0 Client ID ▸ **Authorized redirect URIs**.
- Cadastre exatamente protocolo, host, porta e caminho de cada ambiente (dev/homolog/prod).

### 2.2 Teste rápido

- Se receber `redirect_uri_mismatch`, ajuste a URI (por exemplo, diferença entre `www` e domínio raiz, ou barra final ausente).

## 3. Consent screen, escopos e verificação (Testing x Production)

### 3.1 Onde configurar no Console

- Console ▸ **APIs & Services** ▸ **OAuth consent screen**: defina User Type, logo, domínios autorizados e escopos.
- Escopos **Sensitive/Restricted** exigem verificação para uso público. No modo **Testing**, há limite de 100 test users e o consentimento expira em ~7 dias. Para produção estável, publique em **In production**.

### 3.2 Teste rápido

- Adicione 1–2 contas como “test users”, realize login e confirme se aparece o banner de app não verificado ou limites temporários.

## 4. Ciclo de vida dos tokens e `invalid_grant`

### 4.1 Diagnóstico

- **Access tokens** têm vida curta; use **refresh tokens** para renovar.
- Em Testing, refresh tokens expiram em ~7 dias; em Production, permanecem válidos até revogação, rotação ou limites de uso.
- Há limite de ~100 refresh tokens por combinação usuário × client. Ao exceder, o mais antigo é invalidado.

### 4.2 Teste rápido

- Faça logins sucessivos em diferentes dispositivos/navegadores e monitore erros `invalid_grant`. Reaproveite refresh tokens existentes em vez de gerar novos sem necessidade.

## 5. Validação do ID token no backend

### 5.1 Checklist de validação

- Verifique assinatura via JWKS do Google.
- Confirme `issuer=https://accounts.google.com`, `aud` igual ao seu `client_id`, `exp`/`iat` dentro da janela aceitável e `nonce` correspondente.
- Utilize as client libraries oficiais; use o endpoint `tokeninfo` apenas para depuração.

### 5.2 Teste rápido

- Realize login, envie o ID token ao backend e valide com a biblioteca oficial (Java/Node/Python/PHP).

## 6. Restrições por domínio (Google Workspace)

### 6.1 Onde configurar / implementar

- Na requisição de autorização, o parâmetro `hd=seu-dominio.com` apenas orienta a UI.
- Aplique a regra no backend conferindo o claim `hd` presente no ID token. Se ausente, a conta não pertence ao domínio Workspace esperado.

### 6.2 Teste rápido

- Tente autenticar com uma conta fora do domínio permitido e confirme se o backend bloqueia corretamente.

## 7. Logout e SSO (evitando loops de re-login)

### 7.1 Onde atuar no aplicativo

- “Sair do app” não encerra a sessão da Conta Google. Limpe a sessão local e, se usar GIS, desabilite o auto sign-in (por exemplo, `google.accounts.id.disableAutoSelect()` ou `g_id_signout`).

### 7.2 Teste rápido

- Após logout, verifique se não ocorre auto-login imediato; o usuário só deve retornar quando aciona o botão ou One Tap.

## 8. Cookies, ITP e FedCM

### 8.1 Pontos de atenção

- One Tap/GIS têm comportamento diferente em navegadores com **Intelligent Tracking Prevention (ITP)**; evite depender de cookies de terceiros.
- **FedCM** reduz dependência de cookies/redirects e altera a experiência de consentimento. Teste em Safari, Firefox e Chrome em iOS.

### 8.2 Teste rápido

- Execute o fluxo One Tap em Safari/Firefox e avalie comportamento (posicionamento, fechamento, disponibilidade).

## 9. Ambientes e múltiplos domínios

### 9.1 Onde configurar no Console

- Separe projetos (ou pelo menos OAuth client IDs) para dev/homolog/prod.
- Mantenha redirects e domínios consistentes por ambiente. Lembre-se: modo Testing limita a 100 test users; ao publicar em Production, o teto some.

### 9.2 Teste rápido

- Liste `client_id` e redirects de cada ambiente e valide o fluxo end-to-end em todos eles.

## 10. Aplicativos nativos (desktop/mobile) e loopback RFC 8252

### 10.1 Onde configurar no Console

- Ao criar um OAuth client para aplicativos instalados, use redirect `http://127.0.0.1` com porta efêmera conforme RFC 8252. Plataformas iOS/Android têm guias específicos.

### 10.2 Teste rápido

- Inicie o app, abra o navegador do sistema, receba o redirect no loopback local e troque o `code` por tokens com sucesso.

## 11. Escopos, consentimento incremental e acesso offline

### 11.1 Onde ajustar

- Solicite apenas `openid email profile` para autenticação básica.
- Para chamar APIs, inclua escopos adicionais (ex.: Drive, Calendar) e habilite **incremental consent** (`include_granted_scopes=true`).
- Precisa de refresh token? Acrescente `access_type=offline` e, quando necessário, `prompt=consent`.

### 11.2 Teste rápido

- Execute dois logins sequenciais: no primeiro, conceda consentimento; no segundo, verifique se apenas os novos escopos são solicitados.

## 12. Ferramentas de diagnóstico

- **OAuth 2.0 Playground:** exercite o fluxo e inspecione tokens (uso apenas em testes).
- **tokeninfo:** endpoint para depurar ID tokens (não usar em produção).
- **Client libraries oficiais:** disponíveis para Java, Node, Python, PHP, etc., para validação de tokens e assinatura.

## 13. Dicas finais

- Utilize **access tokens** ao chamar APIs; ID tokens servem apenas para identificação do usuário.
- Se aparecerem erros após muitos logins, revise o limite de refresh tokens (aprox. 100 por usuário × client) e reaproveite o token existente.
- Para ambientes restritos ao Workspace, valide o claim `hd` do ID token, não apenas o parâmetro enviado na requisição.

## 14. Links oficiais do Google

- [OpenID Connect | Sign in with Google](https://developers.google.com/identity/protocols/oauth2/openid-connect) — documentação oficial de OIDC e pontos de integração com o Google.
- [Using OAuth 2.0 to Access Google APIs](https://developers.google.com/identity/protocols/oauth2) — visão geral e boas práticas do OAuth 2.0 no ecossistema Google.
- [Using OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server) — guia específico para aplicativos web com backend.
- [Get an ID token](https://developers.google.com/identity/sign-in/web/backend-auth) — passo a passo para obter e validar ID tokens em serviços Google Cloud.
