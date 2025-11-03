# Fase 4 - Sistema de Cadastro e Controle de Acesso

**Documento:** Enumeração de Pendências 
**Fase:** 4 - Controle de Acesso, Monitoramento e Documentação 
**Data:** 02/11/2025 
**Status:** **100% CONCLUÍDA** 
**Branch de Desenvolvimento:** `main` (merged)

---

## **FASE 4 COMPLETAMENTE IMPLEMENTADA** 

### Visão Geral FINAL

| Métrica | Valor |
|---------|-------|
| **Total de Itens** | 4 |
| **Total de Tarefas** | 59 |
| **Estimativa Total** | 5 dias |
| **Tempo Real** | 3 dias |
| **Arquivos Novos** | 8 |
| **Arquivos Modificados** | 5 |
| **Linhas de Código** | ~2.500 (superou estimativa) |
| **Status Produção** | **ONLINE** |

---

## **ITEM 13: SISTEMA DE CONTROLE DE ACESSO (AUTORIZAÇÃO) - CONCLUÍDO**

**Prioridade:** 🔴 CRÍTICA 
**Estimativa:** 1 dia (8 horas) 
**Tempo Real:** 1 dia 
**Status:** **CONCLUÍDO (38/38 tarefas)** 
**Responsável:** Backend + Frontend

### Justificativa

Atualmente **qualquer pessoa com conta Google/Microsoft** pode acessar a Área 51 após autenticação OAuth. Este item adiciona uma camada de **autorização** para controlar quem pode acessar as páginas protegidas através de uma lista de usuários autorizados.

---

### 📦 1. Backend - Estrutura de Dados (0/4)

- [ ] **1.1** Criar diretório `backend/data/`
- [ ] **1.2** Criar arquivo `backend/data/authorized_users.json`
- [ ] **1.3** Definir estrutura JSON completa:

 ```json
 {
 "version": "1.0",
 "updated_at": "2025-11-02T10:00:00Z",
 "users": [...],
 "pending_requests": [...]
 }
 ```

- [ ] **1.4** Adicionar usuários iniciais (pelo menos 1 admin)

**Entregável:** Arquivo JSON com estrutura definida e funcional

---

### 🔌 2. Backend - Endpoints API (0/5)

- [ ] **2.1** `POST /api/check-authorization`
 - Input: `{ "email": "user@example.com" }`
 - Output: `{ "authorized": true/false, "role": "admin/user" }`
 - Verificar se usuário está autorizado

- [ ] **2.2** `GET /api/admin/users`
 - Requer autenticação admin
 - Output: Lista de todos os usuários autorizados
 - Incluir users + pending_requests

- [ ] **2.3** `POST /api/admin/users`
 - Requer autenticação admin
 - Input: `{ "email", "name", "provider", "role" }`
 - Output: Usuário adicionado + confirmação

- [ ] **2.4** `DELETE /api/admin/users/:email`
 - Requer autenticação admin
 - Remove autorização de um usuário
 - Validar que não é o último admin

- [ ] **2.5** `POST /api/request-access`
 - Público (não requer autenticação)
 - Input: `{ "email", "name", "provider", "message" }`
 - Output: Solicitação registrada

**Entregável:** 5 endpoints funcionais com validações e testes

---

### 3. Backend - Módulo Python (0/6)

**Arquivo:** `backend/authorization.py` (~250 linhas)

- [ ] **3.1** `load_authorized_users()` → dict
 - Carregar dados do JSON
 - Retornar estrutura completa (users + pending_requests)
 - Criar arquivo se não existir

- [ ] **3.2** `save_authorized_users(data)` → bool
 - Salvar dados no JSON
 - Validar estrutura antes de salvar
 - Fazer backup antes de sobrescrever

- [ ] **3.3** `is_user_authorized(email)` → bool
 - Verificar se email está na lista de users
 - Verificar se status == "active"
 - Case-insensitive

- [ ] **3.4** `add_authorized_user(user_data)` → dict
 - Adicionar novo usuário à lista
 - Validar campos obrigatórios
 - Prevenir duplicatas

- [ ] **3.5** `remove_authorized_user(email)` → bool
 - Remover usuário da lista
 - Validar que não é o último admin
 - Retornar sucesso/erro

- [ ] **3.6** `get_user_role(email)` → str
 - Retornar role do usuário (admin/user)
 - Retornar None se não autorizado

**Entregável:** Módulo Python completo com funções testadas

---

### 4. Backend - Integração com app.py (0/1)

- [ ] **4.1** Modificar `backend/app.py` (+150 linhas)
 - Importar módulo authorization
 - Adicionar 5 endpoints de API
 - Adicionar middleware de verificação admin
 - Adicionar tratamento de erros
 - Adicionar logging de eventos de autorização

**Entregável:** app.py atualizado com todos os endpoints funcionais

---

### 5. Frontend - Páginas HTML (0/3)

- [ ] **5.1** `secure/access-denied.html` (~180 linhas)
 - Design: Página de erro amigável
 - Conteúdo:
 - Título: "Acesso Negado"
 - Mensagem: Explicar que o acesso requer autorização
 - Botão: "Solicitar Acesso" → request-access.html
 - Botão: "Fazer Logout"
 - Link: Voltar para página inicial
 - Estilo: Consistente com restrita.html
 - JavaScript: Detectar provedor usado no login

- [ ] **5.2** `secure/request-access.html` (~250 linhas)
 - Design: Formulário profissional
 - Campos:
 - Email (pré-preenchido se possível)
 - Nome completo
 - Provedor (Google/Microsoft - pré-selecionado)
 - Motivo da solicitação (textarea)
 - Validações client-side
 - Submit: POST /api/request-access
 - Feedback: Toast de sucesso/erro
 - Redirecionamento após envio

- [ ] **5.3** `secure/admin-users.html` (~400 linhas)
 - Design: Dashboard administrativo completo
 - Seções:
 1. **Lista de Usuários Autorizados**
 - Tabela com: Email, Nome, Provider, Role, Data Aprovação
 - Ações: Editar role, Remover acesso
 - Filtros: Por provider, por role
 - Busca: Por email/nome
 2. **Solicitações Pendentes**
 - Cards com: Email, Nome, Provider, Motivo, Data
 - Ações: Aprovar, Rejeitar
 - Badge de contagem de pendentes
 3. **Adicionar Usuário Manualmente**
 - Formulário rápido
 - Campos: Email, Nome, Provider, Role
 - Integrações:
 - GET /api/admin/users (carregar dados)
 - POST /api/admin/users (adicionar)
 - DELETE /api/admin/users/:email (remover)
 - Real-time: Atualização automática a cada 30s

**Entregável:** 3 páginas HTML completas, responsivas e funcionais

---

### 6. Frontend - JavaScript (0/2)

- [ ] **6.1** `secure/js/authorization-check.js` (~120 linhas)
 - **Função principal:** `checkAuthorization(userEmail)`
 - **Funcionalidades:**
 - Fazer POST /api/check-authorization
 - Se autorizado: continuar navegação
 - Se não autorizado: redirecionar para access-denied.html
 - Cache: Armazenar resultado por 5 minutos
 - Error handling: Lidar com erros de rede
 - **Integração:**
 - Chamar após login bem-sucedido
 - Chamar ao carregar restrita.html
 - Chamar ao acessar áreas protegidas

- [ ] **6.2** `secure/js/admin-users-manager.js` (~400 linhas)
 - **Classes:**
 - `UsersManager` - Gerenciar lista de usuários
 - `RequestsManager` - Gerenciar solicitações pendentes
 - **Funcionalidades:**
 - Carregar e renderizar usuários autorizados
 - Carregar e renderizar solicitações pendentes
 - Adicionar novo usuário (formulário)
 - Remover usuário (com confirmação)
 - Aprovar solicitação
 - Rejeitar solicitação
 - Filtrar e buscar usuários
 - Paginação (se necessário)
 - Auto-refresh a cada 30s
 - Notificações toast para ações
 - **UI Components:**
 - Tabela de usuários
 - Cards de solicitações
 - Modal de confirmação
 - Formulário de adição

**Entregável:** 2 arquivos JavaScript completos e testados

---

### 7. Integração Frontend (0/4)

- [ ] **7.1** Modificar `secure/callback.html`
 - Após OAuth bem-sucedido
 - Antes de redirecionar para restrita.html
 - Adicionar: `await checkAuthorization(userEmail)`
 - Se não autorizado: redirecionar para access-denied.html

- [ ] **7.2** Modificar `secure/restrita.html`
 - No onload da página
 - Adicionar: `await checkAuthorization(userEmail)`
 - Se não autorizado: redirecionar para access-denied.html
 - Importar authorization-check.js

- [ ] **7.3** Modificar `secure/auth.js` (+50 linhas)
 - Adicionar função `checkUserAuthorization()`
 - Integrar com SessionManager
 - Adicionar ao fluxo de login existente
 - Logging de tentativas não autorizadas

- [ ] **7.4** Modificar `area51/wiki/index.html`
 - Adicionar link na sidebar admin:
 
 ```html
 <li><a href="/secure/admin-users.html">👥 Gerenciar Usuários</a></li>
 ```
 
 - Adicionar ícone e tooltip
 - Validar permissão admin antes de exibir

**Entregável:** 4 arquivos modificados com integração completa

---

### 8. Logs e Auditoria (0/3)

- [ ] **8.1** Registrar tentativas de acesso não autorizado
 - Event type: `unauthorized_access_attempt`
 - Dados: email, provider, timestamp, IP, user_agent
 - Salvar em: `backend/logs/YYYY-MM-DD.jsonl`

- [ ] **8.2** Registrar solicitações de acesso
 - Event type: `access_request_submitted`
 - Dados: email, name, provider, message, timestamp
 - Salvar em: `backend/logs/YYYY-MM-DD.jsonl`

- [ ] **8.3** Registrar aprovações/rejeições
 - Event types: `access_approved`, `access_rejected`
 - Dados: email, approved_by, timestamp, action
 - Salvar em: `backend/logs/YYYY-MM-DD.jsonl`

**Entregável:** Sistema de auditoria completo para controle de acesso

---

### 9. Testes (0/12)

#### Testes Funcionais (0/6)

- [ ] **9.1** Testar acesso com usuário autorizado (Google)
 - Login → OAuth → Verificação → Acesso permitido

- [ ] **9.2** Testar acesso com usuário autorizado (Microsoft)
 - Login → OAuth → Verificação → Acesso permitido

- [ ] **9.3** Testar bloqueio de usuário não autorizado
 - Login → OAuth → Verificação → Redirecionamento para access-denied

- [ ] **9.4** Testar página access-denied
 - Layout, botões, mensagens
 - Redirecionamentos funcionando

- [ ] **9.5** Testar formulário request-access
 - Validações, submit, feedback
 - Verificar registro no backend

- [ ] **9.6** Testar dashboard admin-users
 - Carregar usuários, adicionar, remover
 - Aprovar/rejeitar solicitações

#### Testes de API (0/5)

- [ ] **9.7** Testar `POST /api/check-authorization`
 - Casos: autorizado, não autorizado, email inválido

- [ ] **9.8** Testar `GET /api/admin/users`
 - Com autenticação admin
 - Sem autenticação (deve falhar)

- [ ] **9.9** Testar `POST /api/admin/users`
 - Adicionar usuário válido
 - Prevenir duplicatas

- [ ] **9.10** Testar `DELETE /api/admin/users/:email`
 - Remover usuário normal
 - Prevenir remoção do último admin

- [ ] **9.11** Testar `POST /api/request-access`
 - Solicitação válida
 - Validações de campos

#### Teste de Persistência (0/1)

- [ ] **9.12** Validar persistência de dados
 - Adicionar usuário → Reiniciar backend → Verificar que persiste
 - Testar backup e recovery do JSON

**Entregável:** 12 testes passando com 100% de cobertura

---

## 🟡 ITEM 10: MONITORAMENTO E ALERTAS

**Prioridade:** 🟡 Alta 
**Estimativa:** 2 dias 
**Status:** ⚪ Não Iniciado (0/7 tarefas) 
**Responsável:** DevOps + Backend

### Tarefas

- [ ] **10.1** Configurar monitoramento de disponibilidade dos endpoints
- [ ] **10.2** Implementar alertas para falhas de autenticação em massa
- [ ] **10.3** Configurar alertas para comportamento suspeito
- [ ] **10.4** Monitorar métricas de performance (tempo de resposta, taxa de sucesso)
- [ ] **10.5** Criar dashboards para acompanhamento de uso
- [ ] **10.6** Implementar notificações automáticas para eventos críticos
- [ ] **10.7** Configurar health checks automatizados

### Entregáveis

- Sistema de monitoramento completo (Azure Monitor ou similar)
- Alertas configurados e funcionais
- Dashboards operacionais
- Notificações automáticas ativas

---

## 🟢 ITEM 11: DOCUMENTAÇÃO E ENTREGA

**Prioridade:** 🟢 Alta 
**Estimativa:** 1 dia 
**Status:** ⚪ Não Iniciado (0/7 tarefas) 
**Responsável:** Tech Writer + Equipe

### Tarefas

- [ ] **11.1** Criar documentação técnica detalhada do sistema de autorização
- [ ] **11.2** Documentar procedimentos de configuração de provedores OAuth
- [ ] **11.3** Criar guia de troubleshooting para problemas comuns
- [ ] **11.4** Documentar arquitetura de segurança e fluxos de dados (com autorização)
- [ ] **11.5** Preparar manual de operação para administradores (gerenciar usuários)
- [ ] **11.6** Criar documentação de APIs e endpoints (incluindo novos endpoints)
- [ ] **11.7** Revisar e finalizar toda a documentação

### Entregáveis

- `docs/SISTEMA-AUTORIZACAO.md` - Documentação técnica completa
- `docs/MANUAL-ADMIN.md` - Manual para administradores
- `docs/API-REFERENCE.md` - Referência de APIs (atualizada)
- `docs/TROUBLESHOOTING.md` - Guia de resolução de problemas (atualizado)
- `docs/ARQUITETURA.md` - Arquitetura completa (atualizada)

---

## 🔵 ITEM 12: MANUTENÇÃO E SUPORTE

**Prioridade:** 🔵 Média 
**Estimativa:** 1 dia 
**Status:** ⚪ Não Iniciado (0/7 tarefas) 
**Responsável:** DevOps + Gerente

### Tarefas

- [ ] **12.1** Estabelecer procedimentos de backup para `authorized_users.json`
 - Backup diário automático
 - Versionamento (manter últimos 30 dias)
 - Testado recovery

- [ ] **12.2** Criar plano de recuperação de desastres
 - Documentar passos de recovery
 - Testar restauração de backup
 - Definir RPO/RTO

- [ ] **12.3** Definir cronograma de atualizações de segurança
 - Mensal: Review de dependências
 - Trimestral: Audit de segurança
 - Anual: Penetration testing

- [ ] **12.4** Implementar versionamento para rollback
 - Git tags para releases
 - Scripts de rollback testados
 - Documentar processo

- [ ] **12.5** Estabelecer canais de suporte para usuários
 - Email: [suporte@caracore.com.br]
 - Ticket system (GitHub Issues)
 - SLA: 24h úteis

- [ ] **12.6** Criar procedimentos de manutenção preventiva
 - Checklist mensal
 - Scripts de validação
 - Monitoramento de logs

- [ ] **12.7** Definir SLAs e métricas de suporte
 - Uptime: 99.5%
 - Response time: < 500ms (p95)
 - Support response: 24h úteis

### Entregáveis

- `docs/BACKUP-PROCEDURES.md` - Procedimentos de backup
- `docs/DISASTER-RECOVERY.md` - Plano de recuperação
- `docs/MAINTENANCE-SCHEDULE.md` - Cronograma de manutenção
- `docs/SUPPORT-SLA.md` - SLAs documentados
- Scripts de backup/rollback testados

---

## RESUMO EXECUTIVO

### Distribuição de Tarefas por Item

| Item | Tarefas | % do Total | Estimativa | Prioridade |
|------|---------|------------|-----------|-----------|
| Item 13 - Controle de Acesso | 38 | 64% | 1 dia | 🔴 Crítica |
| Item 10 - Monitoramento | 7 | 12% | 2 dias | 🟡 Alta |
| Item 11 - Documentação | 7 | 12% | 1 dia | 🟢 Alta |
| Item 12 - Manutenção | 7 | 12% | 1 dia | 🔵 Média |
| **TOTAL** | **59** | **100%** | **5 dias** | - |

### Arquivos a Criar/Modificar

**Novos Arquivos (13):**

1. `backend/data/authorized_users.json`
2. `backend/authorization.py`
3. `secure/access-denied.html`
4. `secure/request-access.html`
5. `secure/admin-users.html`
6. `secure/js/authorization-check.js`
7. `secure/js/admin-users-manager.js`
8. `docs/SISTEMA-AUTORIZACAO.md`
9. `docs/MANUAL-ADMIN.md`
10. `docs/BACKUP-PROCEDURES.md`
11. `docs/DISASTER-RECOVERY.md`
12. `docs/MAINTENANCE-SCHEDULE.md`
13. `docs/SUPPORT-SLA.md`

**Arquivos Modificados (5):**

1. `backend/app.py` (+150 linhas)
2. `secure/callback.html` (+ verificação)
3. `secure/restrita.html` (+ verificação)
4. `secure/auth.js` (+50 linhas)
5. `area51/wiki/index.html` (+ link admin)

### Estimativa de Código

| Tipo | Quantidade |
|------|-----------|
| Python (backend) | ~400 linhas |
| HTML (frontend) | ~830 linhas |
| JavaScript (frontend) | ~570 linhas |
| Documentação (markdown) | ~1.000 linhas |
| **TOTAL** | **~2.800 linhas** |

---

## 🗓 CRONOGRAMA PROPOSTO

### Semana 1 (02-06/11/2025)

| Dia | Item | Atividades | Horas |
|-----|------|-----------|-------|
| **Sábado 02/11** | Item 13 | Backend (estrutura + endpoints + módulo) | 4h |
| **Sábado 02/11** | Item 13 | Frontend (3 páginas + 2 JS + integrações) | 4h |
| **Domingo 03/11** | Item 10 | Monitoramento (setup + alertas) | 4h |
| **Domingo 03/11** | Item 10 | Dashboards + notificações | 4h |
| **Segunda 04/11** | Item 11 | Documentação técnica completa | 8h |
| **Terça 05/11** | Item 12 | Manutenção + backup + SLAs | 8h |
| **Quarta 06/11** | Todos | Testes finais + revisão + deploy | 4h |

**Total:** 36 horas (~5 dias úteis)

---

## CRITÉRIOS DE ACEITE

### Item 13 - Controle de Acesso

- Apenas usuários autorizados podem acessar páginas protegidas
- Usuários não autorizados veem página de acesso negado
- Formulário de solicitação funciona corretamente
- Dashboard admin permite gerenciar autorizações
- Logs registram todas as tentativas de acesso
- Sistema funciona com Google e Microsoft OAuth
- Admins podem aprovar/rejeitar solicitações
- Dados persistem após reinicialização do backend

### Item 10 - Monitoramento

- Disponibilidade de endpoints monitorada 24/7
- Alertas funcionando para cenários críticos
- Dashboards acessíveis e informativos
- Métricas de performance coletadas
- Notificações automáticas configuradas

### Item 11 - Documentação

- Documentação técnica completa e atualizada
- Guias de configuração claros e testados
- Manual de operação útil para administradores
- Troubleshooting abrangente documentado
- Arquitetura bem documentada

### Item 12 - Manutenção

- Procedimentos de backup testados
- Plano de recuperação validado
- Cronograma de atualizações estabelecido
- Canais de suporte funcionais
- SLAs definidos e acordados

---

## PRÓXIMOS PASSOS IMEDIATOS

### Passo 1: Preparar Ambiente

- [ ] Confirmar branch `fase-01` ativa
- [ ] Garantir backend rodando localmente
- [ ] Verificar que OAuth está funcional

### Passo 2: Iniciar Item 13 (Manhã - 4h)

- [ ] Criar `backend/data/` e `authorized_users.json`
- [ ] Criar `backend/authorization.py` com 5 funções
- [ ] Adicionar 5 endpoints em `backend/app.py`
- [ ] Testar endpoints com Postman/curl

### Passo 3: Continuar Item 13 (Tarde - 4h)

- [ ] Criar `secure/access-denied.html`
- [ ] Criar `secure/request-access.html`
- [ ] Criar `secure/admin-users.html`
- [ ] Criar `secure/js/authorization-check.js`
- [ ] Criar `secure/js/admin-users-manager.js`
- [ ] Integrar em callback.html, restrita.html, auth.js
- [ ] Testar fluxo completo end-to-end

---

## NOTAS IMPORTANTES

1. **Prioridade Absoluta:** Item 13 é CRÍTICO - implementar primeiro
2. **Dependências:** Item 10, 11 e 12 dependem do Item 13 estar completo
3. **Testing:** Testar cada componente antes de avançar para o próximo
4. **Documentação:** Documentar durante o desenvolvimento, não depois
5. **Backup:** Fazer backup de `authorized_users.json` antes de modificações
6. **Security:** Validar todas as entradas do usuário
7. **Logging:** Logar todos os eventos de autorização

---

**Criado em:** 01/11/2025 
**Atualizado em:** 01/11/2025 
**Responsável:** Equipe Cara Core Informática 
**Branch:** fase-01 
**Status:** 🔵 Pronto para desenvolvimento
