# Roteiro Técnico para Validação do Caminho Feliz OIDC com OAuth 2.1

Segue um roteiro técnico enumerado para validar o caminho feliz do fluxo OpenID Connect (OIDC) utilizando OAuth 2.1 dentro da aplicação existente:

## 1. Pré-requisitos

1.1. Aplicação cliente configurada com client_id, redirect_uri registrado e autorizado no provedor OIDC.

1.2. Provedor OIDC configurado para suportar OAuth 2.1 (authorization code flow com PKCE).

1.3. Ambiente de testes ou homologação com usuário(s) válidos cadastrados.

## 2. Início da autenticação

2.1. Acesse a aplicação e acione o botão/link de login.

2.2. Verifique no navegador se o redirecionamento para o endpoint de autorização do IdP ocorre com os parâmetros corretos:

- `response_type=code`
- `scope` contendo ao menos "openid"
- `client_id` correto
- `redirect_uri` exato e registrado
- Código PKCE (`code_challenge` e `code_challenge_method`)

## 3. Autenticação e consentimento

3.1. Realize login no IdP com credenciais válidas.

3.2. Confirme se a tela de consentimento (se houver) é apresentada e aceita.

## 4. Recebimento do código de autorização

4.1. Certifique-se que após o login o navegador redireciona para o `redirect_uri` com o parâmetro `code`.

4.2. Validar que não há erros no redirecionamento.

## 5. Troca do código por tokens

5.1. Confira a chamada de backend do cliente para o endpoint de token do IdP, passando:

- O código de autorização recebido
- O código PKCE original (`code_verifier`)
- Client credentials (se aplicável)

5.2. Verifique a resposta contém:

- ID Token (JWT contendo informações do usuário)
- Access Token
- Refresh Token (se habilitado)

## 6. Validação dos tokens

6.1. No cliente, valide:

- Assinatura JWT do ID Token
- Claims essenciais: `iss` (issuer), `aud` (audience), `exp` (expiry), `sub` (subject)
- Confirme scope e escopo "openid"

## 7. Estabelecer sessão

7.1. Crie a sessão do usuário com os dados do ID Token.

7.2. Garanta que a aplicação está autenticando o usuário conforme esperado.

## 8. Acesso protegido

8.1. Use o Access Token para realizar chamadas autenticadas a recursos protegidos (APIs).

8.2. Verifique respostas bem-sucedidas e permissões corretas.

## 9. Renovação (opcional)

9.1. Teste refresh token para garantir renovação segura sem pedir login novamente.

## 10. Logs e erros

10.1. Analise logs da aplicação e do provedor para quaisquer falhas ou alertas.

10.2. Assegure mensagens e comportamento consistente em todos os passos.

## Checklist Final

### 📋 Checklist Sequencial do Caminho Feliz OIDC

#### 1️⃣ Pré-requisitos

- [ ] 1.1. Aplicação cliente configurada com `client_id` válido
- [ ] 1.2. `redirect_uri` registrado e autorizado no provedor OIDC
- [ ] 1.3. Provedor OIDC configurado para OAuth 2.1 com PKCE obrigatório
- [ ] 1.4. Ambiente de testes com usuários válidos cadastrados

#### 2️⃣ Início da Autenticação

- [ ] 2.1. Botão/link de login funciona corretamente
- [ ] 2.2. Redirecionamento para endpoint de autorização ocorre
- [ ] 2.3. URL contém `response_type=code`
- [ ] 2.4. URL contém `scope` com pelo menos "openid"
- [ ] 2.5. URL contém `client_id` correto
- [ ] 2.6. URL contém `redirect_uri` exato registrado
- [ ] 2.7. URL contém `code_challenge` (PKCE)
- [ ] 2.8. URL contém `code_challenge_method=S256`
- [ ] 2.9. URL contém `state` para proteção CSRF

#### 3️⃣ Autenticação e Consentimento

- [ ] 3.1. Tela de login do IdP é exibida corretamente
- [ ] 3.2. Login com credenciais válidas é aceito
- [ ] 3.3. Tela de consentimento é apresentada (se configurada)
- [ ] 3.4. Consentimento é processado corretamente

#### 4️⃣ Recebimento do Código de Autorização

- [ ] 4.1. Redirecionamento para `redirect_uri` ocorre
- [ ] 4.2. URL de retorno contém parâmetro `code`
- [ ] 4.3. Parâmetro `state` está presente e válido
- [ ] 4.4. Não há parâmetros de erro na URL de retorno

#### 5️⃣ Troca do Código por Tokens

- [ ] 5.1. Chamada POST para endpoint de token é realizada
- [ ] 5.2. Requisição contém `grant_type=authorization_code`
- [ ] 5.3. Requisição contém o `code` recebido
- [ ] 5.4. Requisição contém `code_verifier` (PKCE)
- [ ] 5.5. Requisição contém `client_id`
- [ ] 5.6. Requisição contém `redirect_uri`
- [ ] 5.7. Resposta HTTP 200 é recebida
- [ ] 5.8. Resposta contém `id_token` (JWT)
- [ ] 5.9. Resposta contém `access_token`
- [ ] 5.10. Resposta contém `token_type=Bearer`
- [ ] 5.11. Resposta contém `expires_in`
- [ ] 5.12. Resposta contém `refresh_token` (se habilitado)

#### 6️⃣ Validação dos Tokens

- [ ] 6.1. Assinatura JWT do ID Token é válida
- [ ] 6.2. Claim `iss` (issuer) está correto
- [ ] 6.3. Claim `aud` (audience) corresponde ao `client_id`
- [ ] 6.4. Claim `exp` (expiry) não está expirado
- [ ] 6.5. Claim `sub` (subject) está presente
- [ ] 6.6. Claim `iat` (issued at) é válido
- [ ] 6.7. Scope "openid" está confirmado
- [ ] 6.8. Claims adicionais estão corretos (email, name, etc.)

#### 7️⃣ Estabelecer Sessão

- [ ] 7.1. Sessão do usuário é criada na aplicação
- [ ] 7.2. Dados do ID Token são armazenados na sessão
- [ ] 7.3. Estado de autenticado é definido
- [ ] 7.4. Usuário é redirecionado para área protegida
- [ ] 7.5. Interface mostra usuário como logado

#### 8️⃣ Acesso a Recursos Protegidos

- [ ] 8.1. Access Token é incluído no header `Authorization: Bearer`
- [ ] 8.2. Chamadas para APIs protegidas são bem-sucedidas
- [ ] 8.3. Recursos são retornados conforme permissões
- [ ] 8.4. Códigos de resposta HTTP são 200/201/204 (sucesso)

#### 9️⃣ Renovação de Tokens (Opcional)

- [ ] 9.1. Refresh Token está presente e válido
- [ ] 9.2. Renovação é acionada antes do `access_token` expirar
- [ ] 9.3. Novos tokens são recebidos corretamente
- [ ] 9.4. Sessão continua ativa sem novo login

#### 🔟 Logs e Monitoramento

- [ ] 10.1. Logs da aplicação não contêm tokens sensíveis
- [ ] 10.2. Logs do provedor OIDC mostram fluxo bem-sucedido
- [ ] 10.3. Não há erros ou alertas nos logs
- [ ] 10.4. Métricas de tempo de resposta estão normais
- [ ] 10.5. Comportamento é consistente em todos os passos

### ✅ Validação Final do Caminho Feliz

- [ ] **Fluxo completo**: Todos os 10 passos executados com sucesso
- [ ] **Segurança**: PKCE obrigatório e implementado corretamente
- [ ] **Padrões**: OAuth 2.1 e OpenID Connect conforme especificação
- [ ] **Performance**: Tempo total do fluxo ≤ 5 segundos
- [ ] **Experiência**: Processo transparente para o usuário final

## Conclusão

Com esse roteiro enumerado, é possível validar técnica e funcionalmente se o caminho feliz do fluxo OIDC + OAuth 2.1 está corretamente implementado dentro da aplicação atual.