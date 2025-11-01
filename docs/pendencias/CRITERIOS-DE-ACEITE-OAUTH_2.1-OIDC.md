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

### Requisitos Específicos do Plano B1 (Basic):

- **Limite de Armazenamento:** 10GB total (código + logs + dependências)
  - Implementar rotação automática de logs para evitar esgotar disco
  - Comprimir logs com mais de 7 dias
  - Deletar logs com mais de 60 dias (configurável via `LOG_RETENTION_DAYS`)
  - Monitorar uso de disco e alertar quando atingir 8GB (80%)
- **Configuração de Porta:** Obrigatório configurar `WEBSITES_PORT=8000`
- **Startup Command:** Usar `$PORT` dinâmico: `gunicorn --bind=0.0.0.0:$PORT --timeout 600 app:app`
- **Cold Start:** Esperar 45-60 segundos na primeira requisição (Always On não disponível no B1)
- **Upgrade Path:** Considerar migração para S1 (Standard) se precisar de:
  - Always On (sem cold start)
  - Mais de 10GB de armazenamento
  - Staging slots para deploy sem downtime

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

### Checklist Específico Plano B1:

- [ ] Rotação automática de logs implementada (compressão após 7 dias)
- [ ] Retenção de logs configurada (60 dias padrão)
- [ ] Monitoramento de uso de disco ativo
- [ ] Alerta configurado para 80% de capacidade (8GB)
- [ ] `WEBSITES_PORT=8000` configurado
- [ ] Startup command com `$PORT` dinâmico validado
- [ ] Cold start testado e documentado (45-60s)
- [ ] Plano de upgrade para S1 documentado (se necessário)

---

## 11. Sistema de Controle de Acesso (Autorização) — Fase 4

Após a autenticação via OAuth 2.1 + OIDC, é necessário implementar uma camada de **autorização** para controlar quem pode acessar a Área 51 (`secure/restrita.html`).

### 11.1. Contexto e Justificativa

- **Problema:** Atualmente, qualquer pessoa com conta Google/Microsoft pode acessar a Área 51 após autenticação OAuth.
- **Solução:** Implementar lista de usuários autorizados (`authorized_users.json`) com verificação após login.
- **Abordagem:** JSON file simples (sem necessidade de banco de dados) com possibilidade de migração futura para Cosmos DB.

### 11.2. Arquitetura do Sistema de Autorização

```text
Fluxo Completo:
1. Usuário → Login Google/Microsoft (OAuth 2.1 + OIDC)
2. OAuth Success → callback.html
3. Verificar Autenticação ✅
4. Verificar Autorização (NOVO):
   ├─ ✅ Autorizado → Redireciona para restrita.html
   └─ ❌ Não Autorizado → Redireciona para access-denied.html
5. access-denied.html:
   ├─ Botão "Solicitar Acesso" → request-access.html
   └─ Botão "Fazer Logout"
6. request-access.html → Formulário → POST /api/request-access
7. Admin → admin-users.html → Aprovar/Rejeitar solicitações
```

### 11.3. Backend - Estrutura de Dados

**Arquivo:** `backend/data/authorized_users.json`

Estrutura mínima obrigatória:

```json
{
  "version": "1.0",
  "updated_at": "2025-11-02T10:00:00Z",
  "users": [
    {
      "email": "admin@caracore.com.br",
      "name": "Admin CaraCore",
      "provider": "google",
      "role": "admin",
      "approved_at": "2025-11-01T12:00:00Z",
      "approved_by": "system",
      "status": "active"
    }
  ],
  "pending_requests": [
    {
      "email": "user@example.com",
      "name": "Novo Usuário",
      "provider": "microsoft",
      "requested_at": "2025-11-02T08:30:00Z",
      "message": "Motivo da solicitação"
    }
  ]
}
```

**Campos obrigatórios em `users`:**

- `email` (string, único, case-insensitive)
- `name` (string)
- `provider` (string: "google" | "microsoft")
- `role` (string: "admin" | "user")
- `approved_at` (string, ISO 8601)
- `status` (string: "active" | "inactive")

### 11.4. Backend - Endpoints API

Implementar no `backend/app.py`:

1. **`POST /api/check-authorization`**
   - Input: `{ "email": "user@example.com" }`
   - Output: `{ "authorized": true/false, "role": "admin/user" }`
   - Autenticação: Requerida (token OAuth válido)

2. **`GET /api/admin/users`**
   - Output: Lista completa (users + pending_requests)
   - Autenticação: Admin only

3. **`POST /api/admin/users`**
   - Input: `{ "email", "name", "provider", "role" }`
   - Output: Usuário adicionado + confirmação
   - Autenticação: Admin only

4. **`DELETE /api/admin/users/:email`**
   - Remove autorização de um usuário
   - Validação: Não permitir remoção do último admin
   - Autenticação: Admin only

5. **`POST /api/request-access`**
   - Input: `{ "email", "name", "provider", "message" }`
   - Output: Solicitação registrada
   - Autenticação: Não requerida (público)

### 11.5. Backend - Módulo Python

**Arquivo:** `backend/authorization.py` (~250 linhas)

Funções obrigatórias:

- `load_authorized_users()` → dict (carregar JSON)
- `save_authorized_users(data)` → bool (salvar JSON)
- `is_user_authorized(email)` → bool (verificar autorização)
- `get_user_role(email)` → str (retornar role: admin/user/None)
- `add_authorized_user(user_data)` → dict (adicionar usuário)
- `remove_authorized_user(email)` → bool (remover usuário)

### 11.6. Frontend - Páginas Novas

Criar 3 páginas HTML:

1. **`secure/access-denied.html`** (~180 linhas)
   - Mensagem clara de acesso negado
   - Botão "Solicitar Acesso" → request-access.html
   - Botão "Fazer Logout"
   - Link para página inicial

2. **`secure/request-access.html`** (~250 linhas)
   - Formulário com campos: email, nome, provider, motivo
   - Validações client-side
   - Submit: POST /api/request-access
   - Feedback visual (toasts)

3. **`secure/admin-users.html`** (~400 linhas)
   - Dashboard administrativo completo
   - Lista de usuários autorizados (tabela)
   - Solicitações pendentes (cards)
   - Ações: Aprovar, Rejeitar, Adicionar, Remover
   - Filtros e busca
   - Auto-refresh a cada 30s

### 11.7. Frontend - JavaScript

Criar 2 arquivos JavaScript:

1. **`secure/js/authorization-check.js`** (~120 linhas)
   - Função: `checkAuthorization(userEmail)`
   - POST /api/check-authorization
   - Redirecionar se não autorizado
   - Cache de resultado (5 min)

2. **`secure/js/admin-users-manager.js`** (~400 linhas)
   - Classes: UsersManager, RequestsManager
   - Carregar e renderizar dados
   - CRUD de usuários
   - Aprovar/rejeitar solicitações
   - Notificações toast

### 11.8. Integração

Modificar 4 arquivos existentes:

1. **`backend/app.py`** (+150 linhas)
   - Importar authorization.py
   - Adicionar 5 endpoints
   - Middleware de verificação admin
   - Logging de eventos de autorização

2. **`secure/callback.html`**
   - Adicionar verificação após OAuth
   - Chamar checkAuthorization() antes de redirecionar

3. **`secure/restrita.html`**
   - Adicionar verificação no onload
   - Importar authorization-check.js

4. **`secure/auth.js`** (+50 linhas)
   - Integrar checkUserAuthorization()
   - Adicionar ao fluxo de login

5. **`area51/wiki/index.html`**
   - Adicionar link: "👥 Gerenciar Usuários" → admin-users.html
   - Visível apenas para admins

### 11.9. Logs e Auditoria

Registrar em `backend/logs/YYYY-MM-DD.jsonl`:

1. **Tentativas de acesso não autorizado**
   - Event type: `unauthorized_access_attempt`
   - Dados: email, provider, timestamp, IP, user_agent

2. **Solicitações de acesso**
   - Event type: `access_request_submitted`
   - Dados: email, name, provider, message, timestamp

3. **Aprovações/Rejeições**
   - Event types: `access_approved`, `access_rejected`
   - Dados: email, approved_by, timestamp, action

### 11.10. Backup e Persistência

- **Backup automático diário** de `authorized_users.json`
- **Versionamento:** Manter últimos 30 dias
- **Recovery testado:** Documentar procedimento de restauração
- **Validação de integridade:** Verificar estrutura JSON antes de salvar

---

## Checklist de Aceite — Fase 4 (Controle de Acesso)

### Backend (8/8)

- [ ] Diretório `backend/data/` criado
- [ ] Arquivo `authorized_users.json` com estrutura correta
- [ ] Módulo `authorization.py` com 6 funções implementadas
- [ ] 5 endpoints de API implementados em `app.py`
- [ ] Validações de entrada em todos os endpoints
- [ ] Middleware de verificação admin funcionando
- [ ] Logs de auditoria registrando eventos de autorização
- [ ] Tratamento de erros robusto (JSON inválido, arquivo não encontrado)

### Frontend (7/7)

- [ ] Página `access-denied.html` criada e funcional
- [ ] Página `request-access.html` criada e funcional
- [ ] Página `admin-users.html` criada e funcional
- [ ] JavaScript `authorization-check.js` implementado
- [ ] JavaScript `admin-users-manager.js` implementado
- [ ] Integrações em `callback.html`, `restrita.html`, `auth.js` completas
- [ ] Link para admin-users adicionado no wiki

### Funcionalidades (12/12)

- [ ] Usuário autorizado (Google) consegue acessar restrita.html
- [ ] Usuário autorizado (Microsoft) consegue acessar restrita.html
- [ ] Usuário não autorizado é bloqueado e redirecionado
- [ ] Página access-denied exibe mensagem clara
- [ ] Formulário request-access funciona e registra solicitação
- [ ] Dashboard admin-users carrega usuários corretamente
- [ ] Admin consegue adicionar novo usuário
- [ ] Admin consegue remover usuário (exceto último admin)
- [ ] Admin consegue aprovar solicitação pendente
- [ ] Admin consegue rejeitar solicitação pendente
- [ ] Persistência: dados mantidos após reinicialização do backend
- [ ] Cache de autorização funciona (evita requisições desnecessárias)

### Segurança (5/5)

- [ ] Endpoints admin protegidos (não acessíveis por usuários comuns)
- [ ] Validação de email case-insensitive
- [ ] Prevenção de duplicatas (mesmo email)
- [ ] Impossível remover o último admin
- [ ] Logs de auditoria completos (unauthorized attempts, requests, approvals)

### Testes (6/6)

- [ ] Testado com usuário autorizado (Google)
- [ ] Testado com usuário autorizado (Microsoft)
- [ ] Testado com usuário não autorizado
- [ ] Testado formulário de solicitação
- [ ] Testado dashboard admin (todos os CRUDs)
- [ ] Testado persistência após restart

### Backup e Manutenção (3/3)

- [ ] Procedimento de backup documentado
- [ ] Backup automático diário configurado
- [ ] Recovery testado com sucesso

**Total:** 41 itens de verificação

---

**Responsável técnico:**

- Equipe de desenvolvimento Cara Core Informática
- Campo Largo, quinta-feira, 30 de outubro de 2025.
- **Atualizado:** sexta-feira, 01 de novembro de 2025 (Fase 4 - Controle de Acesso)

**Observações:**

- Este documento deve ser revisado a cada atualização de requisitos de segurança ou mudança de padrão OAuth/OIDC.
- **Fase 4 prioriza** o Item 13 (Sistema de Controle de Acesso) como CRÍTICO antes dos itens de monitoramento, documentação e manutenção.
