# Critérios de Aceite — OAuth 2.1 + OIDC para Área Restrita

Este documento orienta os requisitos mínimos para conformidade da área restrita (`secure/restrita.html`) com OAuth 2.1 e OIDC.

---

## 1. PKCE Obrigatório

- Todo fluxo Authorization Code deve usar PKCE (code_verifier e code_challenge).
- Não utilizar client_secret no frontend.

## 2. Escopos e Tokens

- Solicitar apenas escopos necessários: `openid profile email`.
- Validar tokens (issuer, audience, expiração) no backend.
- Não aceitar tokens sem validação completa.

## 3. Refresh Token Rotation

- Implementar rotação automática de refresh tokens (quando aplicável).
- Invalidar refresh tokens antigos após uso.

## 4. Consentimento do Usuário

- Consentimento deve ser claro, transparente e registrado.

## 5. Remover Fluxos Inseguros

- Desabilitar Implicit Flow e Resource Owner Password Credentials.
- Usar apenas Authorization Code + PKCE.

## 6. HTTPS Obrigatório

- Todas as comunicações devem ser feitas via HTTPS.
- Bloquear acesso por HTTP em produção.

## 7. Logout Seguro

- Implementar logout local e federado (OIDC logout endpoint, se disponível).
- Limpar storage e tokens após logout.

## 8. UI/UX

- Exibir status de autenticação, erros e expiração de sessão de forma clara ao usuário.
- Informar quando o token expirar e exigir novo login.

## 9. Documentação e Testes

- Documentar todos os fluxos e endpoints.
- Testar em navegadores modernos (Chrome, Edge, Firefox, Safari) e cenários (fresh install, modo privado).
- Validar logs e evidências de conformidade.

---

## 10. Back-end Python no Azure

- Garantir que o back-end Python hospedado no Azure seja atualizado para suportar todos os requisitos OAuth 2.1 + OIDC.
- Manter a versão do Python compatível com a imagem oficial do Azure App Service utilizada no deploy.
- Validar dependências e bibliotecas (ex: `requests`, `authlib`, etc.) para garantir compatibilidade.
- Documentar a versão do Python utilizada e atualizar sempre que houver mudança na imagem base do Azure.
- Testar o deploy em ambiente de staging antes de produção.

---

## Checklist de Aceite

- [ ] PKCE implementado em todos os fluxos
- [ ] Escopos mínimos solicitados
- [ ] Validação robusta de tokens
- [ ] Refresh token rotation ativa
- [ ] Consentimento do usuário registrado
- [ ] Fluxos inseguros desabilitados
- [ ] HTTPS obrigatório
- [ ] Logout seguro implementado
- [ ] UI/UX clara para autenticação
- [ ] Documentação atualizada
- [ ] Testes completos e evidenciados
- [ ] Back-end Python atualizado e compatível com imagem Azure

---

**Responsável técnico:**

- Equipe de desenvolvimento Cara Core Informática
- Campo Largo, quinta-feira, 30 de outubro de 2025.

**Observações:**

- Este documento deve ser revisado a cada atualização de requisitos de segurança ou mudança de padrão OAuth/OIDC.
