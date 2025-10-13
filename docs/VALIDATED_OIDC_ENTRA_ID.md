<!--
	Relatório gerado em 2025-10-04
	Fonte: docs/CHECKLIST_OIDC_ENTRA.md + evidências coletadas no front/backend
-->

# Validação OIDC – Microsoft Entra ID

## Contexto da revisão

- **Data da verificação:** 4 de outubro de 2025
- **Artefatos analisados:** `secure/index.html`, `secure/dynamic-config.js`, `secure/auth-standalone.js`, scripts auxiliares sob `secure/`, backend `backend/app.py`, checklist de referência `docs/CHECKLIST_OIDC_ENTRA.md`.
- **Escopo:** confirmar se a implementação atual atende aos requisitos críticos do fluxo OIDC com Microsoft Entra ID (Authorization Code + PKCE) e levantar inconsistências que dependem de ação no portal ou em código adicional.

## Resumo executivo

- O fluxo Authorization Code + PKCE está implementado corretamente e o backend exige `code_verifier` na troca de tokens.
- Há instrumentos de diagnóstico para redirect URIs, mas ainda é necessário validar no portal Microsoft/Google se todas as URIs listadas foram cadastradas.
- A configuração dinâmica alterna entre tenants (`common` vs. tenant específico) conforme domínio, exigindo conferência manual no Entra.
- O backend agora valida o ID token retornado pela Microsoft (assinatura via JWKS, `aud`, `iss`, `exp`, `iat`) e retorna erro quando os dados não são confiáveis; tanto o fluxo `oidc-client-ts` (`secure/auth-standalone.js`) quanto o fallback manual (`js/oidc.js`) enviam o `nonce` original ao backend, permitindo validar `nonce` e `at_hash` antes de concluir o fluxo.
- A tela `secure/index.html` evidencia um aviso de navegadores certificados (Chrome/Edge atuais, Firefox 118+, Safari 17+), instruindo a limpeza de sessões antigas antes de retestar e reduzindo falsos positivos de bloqueio por cookies.

## Matriz de validação

| # | Item do checklist | Status | Evidências / Observações |
|---|-------------------|:------:|--------------------------|
| 1 | Fluxo Authorization Code + PKCE e tipo de aplicativo | ✅ | `dynamic-config.js` força `response_type=code`; `oidc-client-ts` usa PKCE; backend (`backend/app.py`) exige `code_verifier` na troca de token. |
| 2 | Redirect URIs exatas (AADSTS50011) | ⚠️ | Scripts `dynamic-config.js`, `diagnose-redirect-uri.js`, `fix-caracore-domain.js`, `show-current-uris.js` listam URIs corretas, porém é necessário confirmar cadastro no portal (dev/homolog/prod, logout). |
| 3 | Single-tenant vs multi-tenant e autoridade | ✅ | O código `dynamic-config.js` força o uso de `consumers` para contas pessoais Microsoft, consistente com a configuração **Personal Microsoft accounts only** no portal Azure. |
| 4 | Escopos, consentimento e admin consent | ⚠️ | Front solicita `openid profile email`; backend aceita escopos adicionais. Revisar em **API permissions** se há consentimento administrativo e escopos privilegiados aprovados. |
| 5 | Validação de tokens (`state`, `nonce`, assinatura JWKS) | ✅ | O endpoint `/oauth/microsoft/token` valida a assinatura do ID token, confere `aud`, `iss`, `exp`/`iat`, `tid` (quando single-tenant) e também verifica `nonce`/`at_hash` com os valores agora fornecidos tanto pelo `oidc-client-ts` quanto pelo fallback. `state` continua tratado pelo `oidc-client-ts`. |
| 6 | Logout e SSO (front-channel / post_logout_redirect_uri) | ⚠️ | Existe página `secure/logout.html` e scripts lembrando do registro, mas é preciso validar no portal se URIs de logout constam e se o fluxo multiapp está testado. |
| 7 | Cookies, SameSite, CORS e storage | ⚠️ | O fluxo utiliza `localStorage` (SPA). Backend adiciona CORS básico (`backend/app.py`). A UI agora orienta navegadores certificados e limpeza de sessões, mas ainda são necessários testes com ITP (Safari/iOS) e cenários com cookies restritos. |
| 8 | Diferença entre ID token e Access token | ⚠️ | Código front distingue provedores, mas não há garantia nas APIs. A checklist operacional em `secure/admin-logs.html` agora cobra evidências de que serviços backend aceitam apenas access tokens válidos e de que há plano de rotação/revogação de refresh tokens. |
| 9 | Claims e Token configuration | ⚠️ | Não foram encontrados scripts que adicionem claims opcionais no Entra. Revisar **Token configuration** (inclusão de `email`, `upn`, etc.) e se os atributos existam para todos os usuários. |
| 10 | Ambientes, domínios e `authority` | ✅ | `dynamic-config.js` configura consistentemente o uso de `consumers` como tenant para todos os ambientes, sempre usando `https://login.microsoftonline.com/consumers/v2.0` como authority. |
| 11 | Ferramentas de diagnóstico rápidas | ✅ | Scripts (`diagnose-redirect-uri.js`, `show-current-uris.js`, `copy-google-config.js`) fornecem diagnósticos e instruções para URIs. |

Legenda: ✅ Conforme • ⚠️ Revisão manual/portal necessária • ❓ Investigação adicional/implementação pendente.

## Próximos passos prioritários

1. **Portal Microsoft Entra**
   - Revisar cada item marcado como ⚠️/❓ no checklist, anexando evidências (screenshots) do portal após os ajustes.
   - Confirmar cadastro de todas as URIs de redirect/logout e verificar que `Supported account types` está configurado como **Personal Microsoft accounts only**.
2. **Paridade com Google e navegação**
   - Repetir a conferência de URIs também no Google Cloud Console para manter paridade entre provedores.
   - Executar testes de login/logout em navegadores certificados (Chrome/Edge atuais, Firefox 118+, Safari 17+/iOS) utilizando janela anônima quando necessário, documentando resultados especialmente sobre ITP e cookies restritos.
3. **APIs e tokens**
   - Validar que integrações Microsoft rejeitam access tokens inválidos/expirados e registrar o plano de rotação/revogação de refresh tokens alinhado à checklist operacional.
   - Avaliar necessidade de claims opcionais adicionais (`email`, `upn`, etc.) em **Token configuration** e documentar decisão.

### Pendências consolidadas

- Evidências atualizadas do portal Microsoft Entra (URIs, tenants, consentimentos).
- Relatórios de testes cross-browser (incluindo Safari/iOS) com foco em ITP/cookies.
- Plano formal para lifecycle de access/refresh tokens e configuração de claims adicionais, se aplicável.

---

_Este relatório transcreve o estado de validação coletado em 4/10/2025 e deve ser atualizado após cada alteração no portal ou no código._
