# Fase 6 - Sistema de Autorização e Melhorias de Segurança

**Documento:** Enumeração de Pendências - ATUALIZADO
**Fase:** 6 - Sistema de Autorização Robusto e Melhorias de Segurança
**Data:** 04/11/2025
**Status:** **PLANEJADO** (baseado nos resultados dos testes automatizados)
**Branch de Desenvolvimento:** `main` (estável)

---

## **CONTEXTO - FASES ANTERIORES CONCLUÍDAS**

### Status das Fases Concluídas

| Fase | Status | Conclusão | Validação |
|------|--------|-----------|-----------|
| **Fase 1-3** | ✅ CONCLUÍDAS | Outubro 2025 | Sistema funcional |
| **Fase 4** | ✅ CONCLUÍDA | 02/11/2025 | Interface admin completa |
| **Fase 5** | ✅ CONCLUÍDA | 04/11/2025 | CSS/JS reorganizados |
| **Validação** | ✅ EXECUTADA | 04/11/2025 | 77.3% testes aprovados |

### Resultados dos Testes Automatizados (04/11/2025)

**Sistema Funcional:** ✅ CaraCore operacional em produção
**Taxa de Sucesso:** 77.3% (17/22 testes aprovados)

**Áreas que Requerem Melhoria (5 testes falharam):**

- 🔴 **Sistema de Autorização:** 0% (0/2 testes) - Não implementado
- 🟡 **Validação de Credenciais:** 75% (3/4 testes) - Requer calibração
- 🟡 **Proteção de Endpoints:** 50% (2/4 testes) - Requer fortalecimento

---

## **FASE 6: SISTEMA DE AUTORIZAÇÃO ROBUSTO**

**Prioridade:** 🔴 CRÍTICA
**Baseado em:** Resultados dos testes automatizados
**Objetivo:** Elevar taxa de sucesso dos testes de 77.3% para >90%
**Estimativa:** 1 semana
**Meta:** Resolver os 5 testes que falharam

---

## **ITEM 1: SISTEMA DE AUTORIZAÇÃO ROBUSTO - CRÍTICO**

**Prioridade:** 🔴 CRÍTICA 
**Status:** ⚪ NÃO IMPLEMENTADO (0% nos testes)
**Estimativa:** 2 dias 
**Responsável:** Backend + Testes

### Problema Identificado

**Testes que Falharam:**
- ❌ Verificação de Usuário Autorizado
- ❌ Rejeição de Usuário Não Autorizado

**Impacto:** Sistema permite acesso a qualquer usuário autenticado, sem verificação de autorização.

### Solução Requerida

#### 1. Implementar Middleware de Autorização

**Arquivo:** `backend/authorization_middleware.py` (~200 linhas)

- [ ] **1.1** Criar decorator `@require_authorization`
- [ ] **1.2** Verificar se usuário está na lista autorizada
- [ ] **1.3** Retornar 403 Forbidden para usuários não autorizados
- [ ] **1.4** Adicionar logs de tentativas não autorizadas

#### 2. Criar Sistema de Usuários Autorizados

**Arquivo:** `backend/data/authorized_users.json`

```json
{
  "version": "1.0",
  "updated_at": "2025-11-04T19:30:00Z",
  "users": [
    {
      "email": "suporte@caracore.com.br",
      "name": "Super Admin",
      "role": "super_admin",
      "provider": "google",
      "status": "active",
      "authorized_at": "2025-11-04T19:30:00Z"
    }
  ]
}
```

#### 3. Aplicar Autorização em Endpoints Protegidos

- [ ] **3.1** `/api/admin/users` - Requer autorização
- [ ] **3.2** `/api/admin/access-requests` - Requer autorização  
- [ ] **3.3** `/auth/super-admin` - Manter funcional
- [ ] **3.4** Páginas admin HTML - Verificar autorização

### Critério de Aceite

- ✅ Teste "Verificação de Usuário Autorizado" deve PASSAR
- ✅ Teste "Rejeição de Usuário Não Autorizado" deve PASSAR
- ✅ Usuários não autorizados recebem 403 Forbidden
- ✅ Logs registram tentativas não autorizadas

---

## **ITEM 2: PROTEÇÃO DE ENDPOINTS - ALTA PRIORIDADE**

**Prioridade:** � ALTA
**Status:** 🟡 PARCIAL (50% nos testes)
**Estimativa:** 1 dia
**Responsável:** Backend + Segurança

### Problemas Identificados

**Testes que Falharam:**

- ❌ Proteção Sem Token (Status: NO RESPONSE)
- ❌ Proteção Token Inválido (Sistema aceitou token inválido)

### Soluções Requeridas

#### 1. Fortalecer Validação de Token JWT

**Arquivo:** `backend/app.py` (modificações)

- [ ] **2.1** Validar existência de token em Authorization header
- [ ] **2.2** Verificar assinatura JWT corretamente
- [ ] **2.3** Validar expiração do token
- [ ] **2.4** Retornar 401 Unauthorized para tokens inválidos

#### 2. Implementar Proteção Consistente

- [ ] **2.5** Middleware que intercepta TODAS as requisições protegidas
- [ ] **2.6** Resposta padronizada para acesso sem token
- [ ] **2.7** Resposta padronizada para token inválido/expirado
- [ ] **2.8** Logging de tentativas com tokens inválidos

### Critério de Aceite

- ✅ Teste "Proteção Sem Token" deve retornar 401 Unauthorized
- ✅ Teste "Proteção Token Inválido" deve retornar 401 Unauthorized
- ✅ Todos os endpoints protegidos validam token corretamente

---

## **ITEM 3: VALIDAÇÃO DE CREDENCIAIS - MÉDIA PRIORIDADE**

**Prioridade:** 🟡 MÉDIA
**Status:** 🟡 PARCIAL (75% nos testes)
**Estimativa:** 0.5 dia
**Responsável:** Backend

### Problema Identificado

**Teste que Falhou:**
- ❌ Rejeição de Credenciais Inválidas (Sistema não rejeitou credenciais inválidas)

### Solução Requerida

#### 1. Calibrar Sistema de Autenticação

**Arquivo:** `backend/app.py` (endpoint `/auth/super-admin`)

- [ ] **3.1** Verificar se hash da senha está correto
- [ ] **3.2** Retornar 401 para credenciais inválidas (email ou senha)
- [ ] **3.3** Adicionar throttling para tentativas consecutivas
- [ ] **3.4** Logging de tentativas de login falhadas

### Critério de Aceite

- ✅ Teste "Rejeição de Credenciais Inválidas" deve PASSAR
- ✅ Credenciais incorretas retornam 401 Unauthorized
- ✅ Sistema registra tentativas de login falhadas

---

## **ITEM 4: SISTEMA DE MONITORAMENTO E ALERTAS**

**Prioridade:** 🟢 BAIXA
**Status:** ⚪ PLANEJADO (para após 90% nos testes)
**Estimativa:** 1 dia
**Responsável:** DevOps

### Tarefas Futuras

- [ ] **4.1** Dashboard de métricas de segurança
- [ ] **4.2** Alertas para falhas de autenticação em massa
- [ ] **4.3** Monitoramento de endpoints críticos
- [ ] **4.4** Relatórios de auditoria automáticos

---

## **CRONOGRAMA FASE 6**

### Semana 1 (04-08/11/2025)

| Dia | Item | Atividades | Horas |
|-----|------|-----------|-------|
| **Segunda 04/11** | Item 1 | Sistema de Autorização Completo | 8h |
| **Terça 05/11** | Item 2 | Proteção de Endpoints | 4h |
| **Terça 05/11** | Item 3 | Validação de Credenciais | 2h |
| **Quarta 06/11** | Testes | Executar teste_api_fase_5.py e validar >90% | 2h |
| **Quinta 07/11** | Item 4 | Monitoramento (se testes >90%) | 8h |

**Meta:** Taxa de sucesso >90% nos testes automatizados

---

## **ARQUIVOS A IMPLEMENTAR/MODIFICAR**

### Novos Arquivos

1. `backend/authorization_middleware.py` (~200 linhas)
2. `backend/data/authorized_users.json` (estrutura de dados)

### Arquivos a Modificar

1. `backend/app.py` (adicionar middleware e melhorar validações)
2. `scripts/teste_api_fase_5.py` (se necessário, ajustar testes)

### Estrutura de Dados Autorização

```json
{
  "version": "1.0",
  "updated_at": "2025-11-04T19:30:00Z",
  "super_admins": [
    "suporte@caracore.com.br"
  ],
  "authorized_users": [
    {
      "email": "user@example.com",
      "name": "Nome do Usuário", 
      "role": "admin|user|viewer",
      "provider": "google|microsoft",
      "status": "active|inactive",
      "authorized_at": "2025-11-04T19:30:00Z",
      "authorized_by": "suporte@caracore.com.br"
    }
  ],
  "pending_requests": []
}
```

---

## **CRITÉRIOS DE SUCESSO FASE 6**

### Teste Automatizado

- ✅ Taxa de sucesso >90% no `teste_api_fase_5.py`
- ✅ Todos os 5 testes que falharam devem PASSAR
- ✅ Sistema mantém funcionalidades existentes

### Funcionalidades

- ✅ Apenas usuários autorizados acessam endpoints protegidos
- ✅ Tokens inválidos/ausentes são rejeitados consistentemente
- ✅ Credenciais inválidas são rejeitadas corretamente
- ✅ Logs de segurança registram todas as tentativas

### Segurança

- ✅ Middleware de autorização funcional
- ✅ Proteção robusta em todos os endpoints
- ✅ Validação JWT correta e segura
- ✅ Auditoria completa de eventos de segurança

---

## **PRÓXIMOS PASSOS IMEDIATOS**

### Passo 1: Análise dos Testes Falhados

- [ ] Revisar output detalhado do `teste_api_fase_5.py`
- [ ] Identificar exatamente por que cada teste falhou
- [ ] Mapear correções necessárias

### Passo 2: Implementar Autorização (Prioridade 1)

- [ ] Criar `backend/authorization_middleware.py`
- [ ] Criar `backend/data/authorized_users.json`
- [ ] Aplicar middleware nos endpoints protegidos
- [ ] Testar autorização funcional

### Passo 3: Fortalecer Segurança (Prioridade 2)

- [ ] Melhorar validação de JWT
- [ ] Implementar proteção consistente sem token
- [ ] Calibrar rejeição de credenciais inválidas
- [ ] Executar testes e validar melhorias

### Passo 4: Validação Final

- [ ] Executar `teste_api_fase_5.py`
- [ ] Confirmar taxa >90%
- [ ] Documentar mudanças
- [ ] Deploy para produção

---

## **NOTAS IMPORTANTES**

1. **Meta Clara:** Elevar taxa de 77.3% para >90% nos testes automatizados
2. **Foco:** Resolver exatamente os 5 testes que falharam
3. **Manter:** Todas as funcionalidades existentes funcionais
4. **Validar:** Executar testes após cada implementação
5. **Documentar:** Mudanças e melhorias implementadas

---

**Baseado em:** Teste automatizado executado em 04/11/2025 19:05:23
**Atualizado em:** 04/11/2025 19:30:00
**Responsável:** Equipe Cara Core
**Status:** 🔴 Pronto para implementação - Meta: >90% nos testes
---

**Criado em:** 04/11/2025
**Atualizado em:** 04/11/2025 
**Responsável:** Equipe Cara Core Informática
**Branch:** main (estável)
**Status:** 🔴 Crítico - Implementação necessária para >90% nos testes

## **REFERÊNCIAS**

- **Teste Automatizado:** `scripts/teste_api_fase_5.py`
- **Relatório Atual:** `test_report_fase5_20251104_190527.json`
- **Status Sistema:** `docs/pendencias/STATUS-ATUAL.md`
- **Backend Produção:** https://caracore-backend-docker.azurewebsites.net
- **Frontend Produção:** https://www.caracore.com.br

## **VALIDAÇÃO CONTÍNUA**

Após cada implementação:
```bash
cd d:\dev\site\cara-core
python scripts\teste_api_fase_5.py
```

**Meta:** Taxa de sucesso >90% (atual: 77.3%)
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

**Criado em:** 04/11/2025
**Atualizado em:** 04/11/2025 
**Responsável:** Equipe Cara Core Informática
**Branch:** main (estável)
**Status:** 🔴 Crítico - Implementação necessária para >90% nos testes

## **REFERÊNCIAS**

- **Teste Automatizado:** `scripts/teste_api_fase_5.py`
- **Relatório Atual:** `test_report_fase5_20251104_190527.json`
- **Status Sistema:** `docs/pendencias/STATUS-ATUAL.md`
- **Backend Produção:** https://caracore-backend-docker.azurewebsites.net
- **Frontend Produção:** https://www.caracore.com.br

## **VALIDAÇÃO CONTÍNUA**

Após cada implementação:
```bash
cd d:\dev\site\cara-core
python scripts\teste_api_fase_5.py
```

**Meta:** Taxa de sucesso >90% (atual: 77.3%)
