# Acompanhamento - Fase 2

**Fase:** 2 - Consentimento, Logout e Feedback  
**Data de Início:** 30/10/2025  
**Data Prevista de Término:** 13/11/2025  
**Responsável:** Equipe Cara Core Informática

## Status Geral

**Progresso:** 0%  
**Status:** 🟡 Em Andamento

## Itens da Fase

### Item 3: Consentimento e Fluxos Seguros

**Responsável:** Desenvolvedor Frontend + UX  
**Status:** 🟡 Em Andamento  
**Progresso:** 0%

**Tarefas:**

- [ ] Implementar tela de consentimento clara e compreensível
- [ ] Registrar consentimento do usuário no backend
- [ ] Remover completamente fluxos inseguros (Implicit Flow, ROPC)
- [ ] Validar que apenas Authorization Code + PKCE é utilizado
- [ ] Implementar revogação de consentimento

**Observações:**
Iniciando desenvolvimento após conclusão da Fase 1.

---

### Item 4: Logout Seguro

**Responsável:** Desenvolvedor Backend + Frontend  
**Status:** ⚪ Não Iniciado  
**Progresso:** 0%

**Tarefas:**

- [ ] Implementar logout local (limpeza de sessão local)
- [ ] Implementar logout federado com provedores OIDC
- [ ] Configurar OIDC logout endpoints quando disponíveis
- [ ] Limpar todos os tokens e storage após logout
- [ ] Implementar confirmação de logout
- [ ] Testar logout em diferentes cenários

**Observações:**
Aguardando conclusão do Item 3.

---

### Item 5: Mensagens e Feedback

**Responsável:** Desenvolvedor Frontend + UX  
**Status:** ⚪ Não Iniciado  
**Progresso:** 0%

**Tarefas:**

- [ ] Implementar feedback para status de autenticação
- [ ] Criar mensagens para erros de autenticação
- [ ] Implementar notificações de expiração de sessão
- [ ] Criar feedback para erros de rede
- [ ] Garantir acessibilidade (ARIA labels, contraste)
- [ ] Usar modals/popups dinâmicos via JavaScript

**Observações:**
Aguardando início. Desenvolvimento em paralelo com Item 4.

---

## Testes da Fase

### Testes Funcionais

- [ ] Tela de consentimento exibida corretamente
- [ ] Consentimento registrado no backend
- [ ] Logout local limpa sessão
- [ ] Logout federado funciona com Google
- [ ] Logout federado funciona com Microsoft
- [ ] Mensagens de erro exibidas corretamente
- [ ] Notificações de expiração funcionando

### Testes de Usabilidade

- [ ] Interface de consentimento intuitiva
- [ ] Processo de logout simples
- [ ] Feedback visual claro
- [ ] Acessibilidade WCAG 2.1

### Testes de Segurança

- [ ] Apenas Authorization Code + PKCE permitido
- [ ] Tokens limpos após logout
- [ ] Sem vazamento de dados sensíveis

---

## Cronograma

| Semana | Item | Atividades |
|--------|------|------------|
| 3 | Item 3 | Consentimento e fluxos seguros |
| 3-4 | Item 4 | Logout seguro (local + federado) |
| 4 | Item 5 | Mensagens e feedback |

---

**Última Atualização:** 30/10/2025  
**Atualizado por:** GitHub Copilot (Cara Core Team)
