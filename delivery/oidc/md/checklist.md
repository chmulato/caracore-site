# ✅ CHECKLIST DE ESTUDOS — OPENID CONNECT (OIDC)

Guia de perguntas e respostas para revisar os conceitos fundamentais de autenticação federada com OpenID Connect.

---

## 🟦 1. Introdução

- [ ] **O que é o OpenID Connect (OIDC)?**  
  É um protocolo de autenticação baseado no OAuth 2.0 que permite que usuários se identifiquem com provedores de identidade (Google, Microsoft etc.).

- [ ] **Como o OIDC se diferencia do OAuth 2.0?**  
  OAuth 2.0 → autorização (acesso a recursos).  
  OIDC → autenticação (verificação de identidade).

- [ ] **Qual é o objetivo principal do OIDC?**  
  Oferecer autenticação segura e interoperável por meio de tokens JSON (JWT).

---

## 🟩 2. Identidade, Autenticação e Autorização

- [ ] **O que é identidade digital?**  
  Conjunto de atributos que identificam o usuário (nome, e-mail, `sub`).

- [ ] **O que é autenticação?**  
  Processo de confirmar *quem* é o usuário.

- [ ] **O que é autorização?**  
  Processo de definir *o que* o usuário pode acessar.

- [ ] **Um sistema pode autenticar sem autorizar?**  
  Sim — autenticar identifica; autorizar define permissões.

---

## 🟨 3. Terminologia e Conceitos-Chave

| Termo | Descrição |
|--------|------------|
| **End User** | Usuário final que se autentica. |
| **Client / RP (Relying Party)** | Aplicação que confia no provedor de identidade. |
| **Authorization Server / IdP** | Servidor que autentica e emite tokens. |
| **Resource Server** | API que protege recursos e valida tokens. |
| **Scopes** | Permissões solicitadas (ex: `openid`, `email`). |
| **Claims** | Informações sobre o usuário dentro do token. |

---

## 🟥 4. Componentes do Protocolo OIDC

- [ ] **Principais endpoints:**  
  `/authorize`, `/token`, `/userinfo`, `/.well-known/openid-configuration`.

- [ ] **Escopo obrigatório:**  
  `openid`.

- [ ] **Onde ficam as chaves públicas para validação?**  
  No endpoint `/jwks.json`.

---

## 🟦 5. Função do Servidor de Autorização

- [ ] **Responsabilidade principal:**  
  Autenticar o usuário e emitir tokens (ID, Access e Refresh).

- [ ] **Funções adicionais:**  
  - Validar credenciais / MFA;  
  - Gerenciar consentimentos e sessões;  
  - Publicar metadados e chaves públicas.

---

## 🟧 6. Proprietário dos Recursos e RP

- [ ] **Quem é o proprietário do recurso?**  
  O usuário final, dono de seus próprios dados.

- [ ] **O que é o RP (Relying Party)?**  
  Aplicação que delega a autenticação ao provedor OIDC.

- [ ] **Qual a relação entre RP e Authorization Server?**  
  O RP confia no servidor de autorização para validar identidade e emitir tokens seguros.

---

## 🟩 7. Tokens do OIDC

| Token | Função | Formato | Duração típica |
|--------|--------|----------|----------------|
| **ID Token** | Prova a identidade do usuário. | JWT | Minutos |
| **Access Token** | Autoriza acesso a APIs. | JWT ou opaco | Minutos |
| **Refresh Token** | Gera novos access tokens. | Opaco | Dias/Semanas |

- [ ] **O que contém o ID Token?**  
  Claims: `sub`, `iss`, `aud`, `exp`, `email`, `name`.

- [ ] **Onde é usado o Access Token?**  
  Em chamadas HTTP com cabeçalho `Authorization: Bearer <token>`.

- [ ] **Por que o Refresh Token é sensível?**  
  Porque pode gerar novos access tokens — deve ser criptografado e protegido.

---

## 🟨 8. Fluxo de Autenticação (Authorization Code Flow)

- [ ] **Fluxo mais seguro:**  
  Authorization Code Flow (com PKCE em apps públicos).

**Etapas resumidas:**
1. Usuário clica em “Entrar com…” → redireciona para `/authorize`;  
2. Servidor autentica o usuário;  
3. Usuário concede permissão (scopes);  
4. RP recebe *authorization code*;  
5. RP troca o código no `/token` por tokens;  
6. RP valida o ID Token e cria sessão local.

- [ ] **Por que esse fluxo é seguro?**  
  Tokens nunca passam pelo navegador; só o backend troca o código por tokens.

---

## 🟦 9. Formato JWT Token

- [ ] **O que é JWT?**  
  JSON Web Token — formato compacto e assinado digitalmente.

- [ ] **Partes de um JWT:**  
  1. Header → tipo e algoritmo (`alg`, `typ`);  
  2. Payload → claims (dados do usuário);  
  3. Signature → garante integridade e autenticidade.

- [ ] **Como validar um JWT:**  
  - Verificar assinatura com chave pública;  
  - Checar `iss`, `aud`, `exp`;  
  - Garantir que não expirou e foi emitido para o seu cliente.

- [ ] **Exemplo de claims comuns:**  
  `sub`, `iss`, `aud`, `email`, `role`, `exp`.

---

## 💡 Dica Final

> Autenticação federada não é apenas “login social” —  
> OIDC é o padrão técnico que permite integração segura entre múltiplas identidades e aplicações empresariais.

---

### 🧩 Próximos Passos

- [ ] Criar **diagrama visual 16:9** ilustrando o fluxo OIDC (Authorization Code Flow).  
- [ ] Estudar o uso do **Refresh Token com rotação e expiração segura**.  
- [ ] Implementar **filtro de autenticação e ACL local** no *Cara Core Hub*.  
- [ ] Validar integração com **Google** e **Microsoft Entra ID** em ambiente de teste.

---
