<!--
	Relatório gerado em 2025-10-04
	Fonte: docs/CHECKLIST_OIDC_GOOGLE.md + inspeções nos scripts front/back
-->

# Validação OIDC – Google Identity Services

## Contexto da revisão

- **Data da verificação:** 4 de outubro de 2025
- **Artefatos analisados:** `secure/index.html`, `secure/auth-standalone.js`, `secure/dynamic-config.js`, `secure/show-current-uris.js`, `secure/diagnose-redirect-uri.js`, `secure/fix-caracore-domain.js`, `secure/copy-google-config.js`, `js/oidc.js`, backend `backend/app.py`, configurações estáticas em `secure/config/google.json`.
- **Escopo:** confirmar aderência do fluxo Google OIDC (Authorization Code + PKCE) e registrar lacunas que dependem de ação no Google Cloud Console ou em ajustes de código/backend.

## Resumo executivo

- O login Google utiliza Authorization Code + PKCE tanto no modo `oidc-client-ts` (`secure/auth-standalone.js`) quanto no fallback manual (`js/oidc.js`), com troca de código feita via backend seguro (`/oauth/google/token`).
- Há scripts que listam e diagnosticam Redirect/Logout URIs para todos os ambientes, porém ainda é necessário confirmar o cadastro das entradas no Google Cloud Console.
- O backend valida a assinatura e claims essenciais do ID token (`iss`, `aud`, `exp`, `iat`) antes de responder ao front, com cache de JWKS e logs detalhados.
- Quando o fallback manual (`js/oidc.js`) ou o fluxo gerenciado com `oidc-client-ts` (`secure/auth-standalone.js`) troca o código via backend, o `nonce` original é enviado junto com o `code_verifier`, permitindo que o backend valide `nonce` e `at_hash` (quando há `access_token`). Tokens inconsistentes são rejeitados antes de chegar ao navegador e o corpo da resposta não inclui mais `id_token_claims`, deixando as evidências apenas nos logs.
- É possível restringir logins por domínio Google Workspace configurando `GOOGLE_ALLOWED_DOMAINS` (lista separada por vírgulas); requisições fora da lista são rejeitadas com HTTP 403.
- Experiências especiais (logout, FedCM/ITP, incremental consent) exigem testes manuais e ajustes antes de considerar o checklist totalmente atendido.
- A página `secure/index.html` agora exibe um aviso discreto sobre navegadores certificados (Chrome/Edge atuais, Firefox 118+, Safari 17+), orientando a limpeza de sessões antigas antes de retestar para reduzir falsos positivos em cenários de cookies.

## Matriz de validação

| # | Item do checklist | Status | Evidências / Observações |
|---|-------------------|:------:|--------------------------|
| 1 | Fluxo e biblioteca (Authorization Code + PKCE / GIS) | ✅ | `secure/auth-standalone.js` instancia `oidc-client-ts` com `response_type=code` e PKCE automático; fallback `js/oidc.js` gera `code_challenge`/`code_verifier` e troca o código via backend (`/oauth/google/token`). |
| 2 | Redirect URIs idênticas | ⚠️ | `secure/dynamic-config.js`, `secure/show-current-uris.js`, `secure/diagnose-redirect-uri.js` e `secure/copy-google-config.js` fornecem listas e diagnósticos, mas é preciso verificar no Google Cloud Console se todas as URIs (localhost/GitHub/Caracore + logout) estão cadastradas, com HTTPS em produção. |
| 3 | Consent screen, escopos e verificação | ⚠️ | UI (`secure/index.html`) solicita apenas `openid profile email`. Confirmar no Console se o OAuth consent screen está em **In production**, com domínios verificados e eventual escopo sensível aprovado; se estiver em **Testing**, haverá limite de 100 usuários/testes a cada 7 dias. |
| 4 | Ciclo de vida dos tokens e `invalid_grant` | ⚠️ | `backend/app.py` registra a troca de token, mas não monitora refresh tokens ou limites por usuário. Executar logins simultâneos em múltiplos dispositivos e revisar erros `invalid_grant` / rotação de refresh tokens. |
| 5 | Validação do ID token no backend | ✅ | `backend/app.py` valida a assinatura contra JWKS, confere `iss` permitido, `aud` igual ao `GOOGLE_CLIENT_ID`, `exp`/`iat`, e valida `nonce`/`at_hash` agora fornecidos tanto pelo fallback `js/oidc.js` quanto pelo fluxo `oidc-client-ts`. Tokens inválidos são rejeitados e não há mais eco de `id_token_claims` no corpo da resposta. |
| 6 | Restrições por domínio (Google Workspace) | ✅ | Variável `GOOGLE_ALLOWED_DOMAINS` permite informar domínios autorizados; o backend decodifica o claim `hd` e retorna `unauthorized_domain` (HTTP 403) quando o valor não está na lista. |
| 7 | Logout e SSO (loop de re-login) | ⚠️ | `js/oidc.js` e `secure/auth-standalone.js` limpam storage e redirecionam para `secure/logout.html`, mas o logout do Google depende do usuário sair da Conta Google. Validar manualmente se One Tap/auto sign-in não reaparece indevidamente. |
| 8 | Cookies, ITP e FedCM | ⚠️ | A solução usa `localStorage/sessionStorage`. Não há fallback específico para ITP/FedCM além do monitoramento em `secure/logger.js`. A nova chamada visual na tela de login orienta navegadores certificados e limpeza de sessões, mas é preciso executar testes em Safari/Firefox/iOS para confirmar comportamento do GIS/One Tap. |
| 9 | Ambientes e múltiplos domínios | ⚠️ | `secure/fix-caracore-domain.js`, `secure/copy-google-config.js` e `secure/show-current-uris.js` ajustam `client_id`, redirect e logout conforme domínio. Ainda é necessário garantir client IDs/URIs separados ou devidamente cadastrados por ambiente no Console. |
| 10 | Aplicativos nativos e loopback RFC 8252 | ➖ | Não há aplicativos nativos nesta solução. Manter seção como não aplicável ou documentar caso surja app desktop/mobile. |
| 11 | Escopos, consentimento incremental e acesso offline | ⚠️ | Scopes default (`openid profile email`) estão configurados (`secure/dynamic-config.js`). Para chamar APIs Google é preciso incluir escopos adicionais e `include_granted_scopes=true`/`access_type=offline`. Processo ainda não automatizado. |
| 12 | Ferramentas de diagnóstico | ✅ | Scripts `secure/diagnose-redirect-uri.js`, `secure/show-current-uris.js`, `secure/copy-google-config.js` e `secure/caracore-instructions.js` oferecem diagnósticos, listas de URIs e instruções passo a passo. |
| 13 | Dicas finais (usar Access token, limites de refresh, claim `hd`) | ⚠️ | O checklist é seguido parcialmente: `js/oidc.js` diferencia tokens, porém ainda é necessário comprovar que as APIs downstream aceitam apenas access tokens válidos e que existe plano de rotação/revogação de refresh tokens. A checklist operacional em `secure/admin-logs.html` agora inclui lembretes para esses testes. |
| 14 | Links oficiais do Google | ✅ | Seção 14 do checklist referencia a documentação oficial mais recente e está inclusa em `docs/CHECKLIST_OIDC_GOOGLE.md`. |

Legenda: ✅ Conforme • ⚠️ Revisão manual/ajuste pendente • ❓ Investigação adicional • ➖ Não aplicável.

## Próximos passos recomendados

## Próximos passos prioritários

1. **Console Google Cloud**
	- Confirmar (com evidências) todas as URIs de redirect/logout e JavaScript origins para cada ambiente.
	- Garantir que o OAuth consent screen esteja em **In production**, com domínios verificados e eventuais escopos sensíveis aprovados.
2. **Testes manuais e navegadores**
	- Reexecutar cenários de login/logout em Chrome, Edge, Firefox 118+ e Safari 17+ (macOS/iOS), utilizando aba anônima quando necessário, registrando capturas das evidências.
	- Exercitar especialmente Safari/iOS para detectar comportamentos de ITP/FedCM e documentar ajustes, se necessários.
3. **APIs e tokens**
	- Definir e registrar a estratégia de escopos incrementais/`access_type=offline` antes de integrar APIs Google.
	- Validar que APIs downstream rejeitam access tokens inválidos/expirados e documentar o plano de rotação/revogação de refresh tokens (já cobrado na checklist operacional).

### Pendências consolidadas

- Evidências do Console (URIs, consent screen, domínios verificados).
- Relatórios de testes ITP/FedCM e navegadores certificados.
- Plano documentado para escopos incrementais e lifecycle de refresh tokens quando APIs Google forem ativadas.

---

_Relatório atualizado em 4/10/2025. Revisar após qualquer alteração no Google Cloud Console ou no fluxo de autenticação._
