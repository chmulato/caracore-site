# Plano de Testes E2E - Fase 2 (Sistema de Feedback Visual + Logout)

**Data:** 30/10/2025 
**Versão:** 1.0 
**Fase:** 2 - Items 3, 4 e 5 
**Ambiente:** Desenvolvimento (localhost) e Produção (Azure)

---

## Objetivos dos Testes

1. Validar integração completa do sistema de notificações
2. Validar LogoutModal (local e federado)
3. Validar fluxo completo: login → consent → uso → logout
4. Validar acessibilidade (WCAG 2.1 AA)
5. Validar compatibilidade cross-browser

---

## Pré-requisitos

### Ambiente de Teste
- [ ] Backend rodando (local: `http://localhost:5051` ou produção: `https://api.caracore.com.br`)
- [ ] Frontend acessível (`http://localhost:5500` ou `https://caracore.com.br`)
- [ ] Credenciais válidas (Google e Microsoft)
- [ ] Console do navegador aberto (F12)
- [ ] Navegadores instalados (Chrome, Firefox)

### Configuração
- [ ] CORS configurado corretamente
- [ ] Redirect URIs registrados nos provedores OAuth
- [ ] Variáveis de ambiente configuradas (CLIENT_ID, CLIENT_SECRET)

### Limpeza Inicial
```javascript
// Executar no console antes de cada teste
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## Casos de Teste

### **CT-01: Fluxo Completo de Login (Google)**

**Pré-condição:** Usuário não autenticado

**Passos:**

1. Acessar `http://localhost:5500/secure/restrita.html`
2. Verificar redirecionamento para `/secure/index.html`
3. Clicar no botão "Entrar com Google"
4. Fazer login com credenciais Google
5. Aceitar permissões (se solicitado)
6. Aguardar redirecionamento

**Resultado Esperado:**

- Redirecionamento para página de login
- Botão "Entrar com Google" visível e clicável
- Autenticação bem-sucedida no Google
- Redirecionamento para `/secure/restrita.html`
- **Notificação toast "Login Realizado" aparece** (verde, 3s)
- Conteúdo protegido carregado
- Botão "Encerrar sessão" visível
- Console sem erros JavaScript

**Dados de Verificação:**
```javascript
// Executar no console
console.log('Autenticado:', SessionManager.isAuthenticated());
console.log('User Info:', SessionManager.getUserInfo());
console.log('Provider:', localStorage.getItem('auth_provider'));
```

**Critério de Aceitação:**
- [ ] Login completo em menos de 10 segundos
- [ ] Notificação "Login Realizado" exibida automaticamente
- [ ] Token salvo no localStorage
- [ ] Provider = 'google'

---

### **CT-02: Fluxo Completo de Login (Microsoft)**

**Pré-condição:** Usuário não autenticado

**Passos:**

1. Acessar `http://localhost:5500/secure/restrita.html`
2. Verificar redirecionamento para `/secure/index.html`
3. Clicar no botão "Entrar com Microsoft"
4. Fazer login com credenciais Microsoft (Entra ID)
5. Aceitar permissões (se solicitado)
6. Aguardar redirecionamento

**Resultado Esperado:**

- Redirecionamento para página de login
- Botão "Entrar com Microsoft" visível e clicável
- Autenticação bem-sucedida no Microsoft
- Redirecionamento para `/secure/restrita.html`
- **Notificação toast "Login Realizado" aparece** (verde, 3s)
- Conteúdo protegido carregado
- Botão "Encerrar sessão" visível
- Console sem erros JavaScript

**Critério de Aceitação:**

- [ ] Login completo em menos de 15 segundos (Microsoft pode ser mais lento)
- [ ] Notificação "Login Realizado" exibida automaticamente
- [ ] Token salvo no localStorage
- [ ] Provider = 'microsoft'

---

### **CT-03: Consentimento LGPD/GDPR**

**Pré-condição:** Primeira vez que usuário acessa (sem consentimento prévio)

**Passos:**
1. Limpar localStorage e cookies
2. Fazer login (Google ou Microsoft)
3. Verificar se tela de consentimento aparece
4. Ler termos de uso e política de privacidade
5. Marcar checkbox "Li e aceito..."
6. Clicar em "Autorizar e Continuar"

**Resultado Esperado:**
- Tela de consentimento aparece ANTES da página protegida
- Termos e política exibidos claramente
- Checkbox obrigatório
- Botão "Autorizar" desabilitado até marcar checkbox
- **Notificação "Consentimento Registrado" aparece** (verde, 4s)
- Redirecionamento para página protegida
- Consentimento salvo (não pede novamente)

**Dados de Verificação:**
```javascript
// Verificar consentimento
fetch('https://api.caracore.com.br/api/consent/status', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 user_id: SessionManager.getUserInfo().sub,
 provider: localStorage.getItem('auth_provider')
 })
}).then(r => r.json()).then(console.log);
```

**Critério de Aceitação:**
- [ ] Consentimento solicitado apenas na primeira vez
- [ ] Notificação de confirmação exibida
- [ ] Backend registra consentimento (verificar logs)

---

### **CT-04: Logout Local (Sair deste site)**

**Pré-condição:** Usuário autenticado em `restrita.html`

**Passos:**

1. Clicar no botão "Encerrar sessão"
2. Verificar abertura do LogoutModal
3. Ler as 2 opções apresentadas
4. Clicar em **"Sair deste site"** (logout local)
5. Aguardar processamento

**Resultado Esperado:**

- Modal aparece com animação suave (fadeIn 0.2s)
- 2 opções claramente diferenciadas:
 - "Sair deste site" (azul)
 - "Sair de todas as contas" (vermelho)
- Textos explicativos abaixo de cada botão
- **Notificação "Logout Realizado" aparece** (verde, 3s)
- localStorage limpo
- sessionStorage limpo
- Cookies limpos
- Redirecionamento para `/secure/index.html`
- Tokens revogados no backend

**Dados de Verificação:**
```javascript
// ANTES do logout
console.log('Token antes:', localStorage.getItem('auth_access_token'));

// DEPOIS do logout (deve ser null)
console.log('Token depois:', localStorage.getItem('auth_access_token'));
```

**Critério de Aceitação:**
- [ ] Modal acessível (ARIA, teclado, ESC fecha)
- [ ] Notificação "Logout Realizado" exibida
- [ ] Logout completo em menos de 2 segundos
- [ ] Não é possível acessar páginas protegidas após logout
- [ ] Ainda logado no Google/Microsoft (verificar em outra aba)

---

### **CT-05: Logout Federado (Sair de todas as contas - Google)**

**Pré-condição:** Usuário autenticado com Google em `restrita.html`

**Passos:**

1. Abrir nova aba: `https://myaccount.google.com/`
2. Verificar que está logado no Google
3. Voltar para `restrita.html`
4. Clicar no botão "Encerrar sessão"
5. Verificar abertura do LogoutModal
6. Clicar em **"Sair de todas as contas"** (logout federado)
7. Aguardar processamento
8. Verificar redirecionamento para `accounts.google.com/Logout`
9. Voltar para a aplicação
10. Verificar aba do Google Account

**Resultado Esperado:**
- Modal aparece corretamente
- **Notificação "Logout Realizado" aparece** (verde, 3s)
- localStorage limpo
- Redirecionamento para logout do Google
- Logout do Google bem-sucedido
- Não está mais logado no Google Account
- Precisa fazer login novamente em ambos

**Critério de Aceitação:**
- [ ] Logout local completo
- [ ] Logout federado completo
- [ ] Notificação exibida ANTES do redirecionamento
- [ ] Não logado em nenhum lugar

---

### **CT-06: Logout Federado (Sair de todas as contas - Microsoft)**

**Pré-condição:** Usuário autenticado com Microsoft em `restrita.html`

**Passos:**

1. Abrir nova aba: `https://account.microsoft.com/`
2. Verificar que está logado no Microsoft
3. Voltar para `restrita.html`
4. Clicar no botão "Encerrar sessão"
5. Verificar abertura do LogoutModal
6. Clicar em **"Sair de todas as contas"** (logout federado)
7. Aguardar processamento
8. Verificar redirecionamento para `login.microsoftonline.com/.../logout`
9. Voltar para a aplicação
10. Verificar aba do Microsoft Account

**Resultado Esperado:**
- Modal aparece corretamente
- **Notificação "Logout Realizado" aparece** (verde, 3s)
- localStorage limpo
- Redirecionamento para logout do Microsoft
- Logout do Microsoft bem-sucedido
- Não está mais logado no Microsoft Account
- Precisa fazer login novamente em ambos

**Critério de Aceitação:**
- [ ] Logout local completo
- [ ] Logout federado completo
- [ ] Notificação exibida ANTES do redirecionamento
- [ ] Não logado em nenhum lugar

---

### **CT-07: Sessão Expirada (Token Inválido)**

**Pré-condição:** Usuário autenticado

**Passos:**
1. Fazer login normalmente
2. Abrir console do navegador
3. Executar: `localStorage.setItem('auth_access_token', 'token_invalido_xyz')`
4. Aguardar 60 segundos (intervalo de verificação)
5. Ou navegar para outra página protegida

**Resultado Esperado:**
- SessionManager detecta token inválido
- **Notificação "Sessão Expirada" aparece** (vermelho, não fecha automaticamente)
- Texto: "Sua sessão expirou por inatividade. Por favor, faça login novamente."
- Redirecionamento para login após 3-5 segundos
- Ou clicar na notificação redireciona imediatamente

**Critério de Aceitação:**
- [ ] Notificação de erro exibida
- [ ] Notificação não fecha automaticamente (autoDismiss: false)
- [ ] Redirecionamento para login
- [ ] Mensagem clara e amigável

---

### **CT-08: Timeout de Inatividade**

**Pré-condição:** Usuário autenticado

**Passos:**
1. Fazer login normalmente
2. **Não interagir** com a página por 1 hora
3. Ou modificar `SESSION_TIMEOUT` em session-manager.js para 60 segundos (apenas para teste)
4. Aguardar expiração

**Resultado Esperado:**
- Após 1 hora de inatividade:
- **Notificação "Timeout de Inatividade" aparece** (laranja/warning, não fecha)
- Texto: "Sua sessão foi encerrada devido à inatividade prolongada. Você será redirecionado em 5 segundos."
- Contagem regressiva visível (5, 4, 3, 2, 1...)
- Redirecionamento automático para login
- Sessão limpa completamente

**Critério de Aceitação:**
- [ ] Monitoramento de atividade funcionando
- [ ] Notificação exibida 5s antes do redirect
- [ ] Redirecionamento automático
- [ ] Mensagem clara sobre motivo

---

### **CT-09: Auto-Refresh de Token (Silencioso)**

**Pré-condição:** Usuário autenticado, token próximo da expiração

**Passos:**
1. Fazer login normalmente
2. Aguardar até 5 minutos antes da expiração do token
3. Ou modificar `REFRESH_BEFORE` para 60 segundos (teste rápido)
4. Verificar console do navegador

**Resultado Esperado:**
- SessionManager detecta token próximo da expiração
- Faz refresh automaticamente
- **Notificação "Sessão Renovada" aparece** (verde, 3s, discreta)
- Texto: "Sua sessão foi renovada automaticamente."
- Novo token salvo no localStorage
- Usuário continua navegando sem interrupção
- Console: `[SessionManager] Token refresh bem-sucedido`

**Critério de Aceitação:**
- [ ] Refresh silencioso (não interrompe usuário)
- [ ] Notificação discreta (3s)
- [ ] Token atualizado corretamente
- [ ] Sessão continua válida

---

### **CT-10: Erro de Rede (Offline)**

**Pré-condição:** Usuário autenticado

**Passos:**
1. Fazer login normalmente
2. Desconectar internet (Wi-Fi off ou cabo desconectado)
3. Aguardar 60 segundos (intervalo de verificação)
4. Ou tentar navegar para outra página
5. Verificar notificação

**Resultado Esperado:**
- SessionManager tenta validar sessão
- Detecta falha de conexão
- **Notificação "Erro de Conexão" aparece** (vermelho)
- Texto: "Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
- Notificação não fecha automaticamente
- Console: `[SessionManager] Erro ao validar sessão: [Network Error]`

**Dados de Verificação:**
```javascript
// Simular erro de rede
fetch('https://api.caracore.com.br/auth/validate', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 access_token: 'invalid',
 provider: 'google'
 })
}).catch(err => {
 NotificationBridge.showError('network_error');
});
```

**Critério de Aceitação:**
- [ ] Erro detectado corretamente
- [ ] Notificação apropriada exibida
- [ ] Mensagem clara sobre o problema
- [ ] Não faz logout (aguarda reconexão)

---

### **CT-11: Rate Limiting (429 Too Many Requests)**

**Pré-condição:** Backend com rate limiting ativo

**Passos:**
1. Fazer login normalmente
2. Abrir console do navegador
3. Executar múltiplas requisições rápidas:
```javascript
for (let i = 0; i < 50; i++) {
 fetch('https://api.caracore.com.br/auth/validate', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 access_token: localStorage.getItem('auth_access_token'),
 provider: localStorage.getItem('auth_provider')
 })
 });
}
```
4. Verificar resposta 429
5. Verificar notificação

**Resultado Esperado:**
- Backend bloqueia requisições após limite
- Resposta HTTP 429
- **Notificação "Limite de Requisições Excedido" aparece** (laranja/warning, 7s)
- Texto: "Você fez muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente."
- Se Retry-After header presente: "Tente novamente em X segundos"

**Critério de Aceitação:**
- [ ] Rate limiting funcionando
- [ ] Notificação apropriada exibida
- [ ] Mensagem clara sobre tempo de espera
- [ ] Retry-After respeitado

---

### **CT-12: Acessibilidade - Navegação por Teclado**

**Pré-condição:** Usuário autenticado em `restrita.html`

**Passos:**

1. **NÃO usar o mouse**
2. Pressionar `Tab` repetidamente
3. Navegar até o botão "Encerrar sessão"
4. Pressionar `Enter` para abrir LogoutModal
5. Pressionar `Tab` para navegar entre opções do modal
6. Pressionar `ESC` para fechar modal
7. Reabrir modal com `Enter`
8. Navegar com `Tab` até "Sair deste site"
9. Pressionar `Enter` para confirmar

**Resultado Esperado:**

- Todos os elementos interativos acessíveis via `Tab`
- Focus visível (outline azul)
- LogoutModal abre com `Enter`
- LogoutModal fecha com `ESC`
- Focus trap dentro do modal (não sai do modal)
- Botões do modal acessíveis via `Tab` + `Enter`
- Logout executado corretamente
- Notificações anunciadas (ARIA live region)

**Critério de Aceitação:**

- [ ] 100% navegável por teclado
- [ ] Focus visível em todos os elementos
- [ ] ESC fecha modal
- [ ] Enter ativa botões
- [ ] Sem armadilhas de foco

---

### **CT-13: Acessibilidade - Screen Reader (NVDA/JAWS)**

**Pré-condição:** NVDA ou JAWS instalado e ativo

**Passos:**

1. Ativar screen reader (NVDA: Ctrl+Alt+N)
2. Navegar pela página com setas
3. Ouvir anúncios de notificações
4. Abrir LogoutModal
5. Ouvir descrição do modal
6. Navegar entre opções
7. Executar logout

**Resultado Esperado:**

- Notificações anunciadas automaticamente (aria-live="polite")
- Erros anunciados com prioridade (aria-live="assertive")
- LogoutModal anunciado: "Dialog: Encerrar Sessão"
- Botões descritos claramente:
 - "Sair deste site - Botão"
 - "Sair de todas as contas - Botão"
- Textos explicativos lidos
- Estado do modal (aberto/fechado) anunciado

**Critério de Aceitação:**

- [ ] Todas as notificações anunciadas
- [ ] Modal anunciado corretamente
- [ ] Botões descritos claramente
- [ ] Navegação compreensível

---

### **CT-14: Compatibilidade - Google Chrome**

**Ambiente:** Windows 10/11, Chrome 120+

**Passos:**

1. Executar todos os casos de teste CT-01 a CT-13
2. Verificar console (F12)
3. Verificar performance (Lighthouse)

**Resultado Esperado:**

- Todos os testes passam
- Sem erros JavaScript no console
- Sem avisos de segurança
- Performance aceitável (Lighthouse > 80)
- Acessibilidade (Lighthouse > 90)
- Animações suaves (60fps)

**Critério de Aceitação:**

- [ ] 100% funcional no Chrome
- [ ] Performance otimizada
- [ ] Sem erros críticos

---

### **CT-15: Compatibilidade - Mozilla Firefox**

**Ambiente:** Windows 10/11, Firefox 120+

**Passos:**

1. Executar todos os casos de teste CT-01 a CT-13
2. Verificar console (F12)
3. Verificar comportamento específico do Firefox

**Resultado Esperado:**

- Todos os testes passam
- Sem erros JavaScript no console
- CSS funciona corretamente (prefix -moz-)
- Animações suaves
- CORS funcionando

**Critério de Aceitação:**

- [ ] 100% funcional no Firefox
- [ ] Comportamento idêntico ao Chrome
- [ ] Sem erros críticos

---

### **CT-16: Teste de Múltiplas Notificações**

**Pré-condição:** Usuário autenticado

**Passos:**

1. Abrir console do navegador

2. Executar rapidamente:

```javascript
NotificationBridge.showSuccess('login_success');
NotificationBridge.showError('invalid_token');
NotificationBridge.showWarning('rate_limit_exceeded');
NotificationBridge.showInfo('session_refreshed');
NotificationBridge.showSuccess('consent_registered');
NotificationBridge.showError('network_error');
NotificationBridge.showWarning('logout_partial');
```

**Resultado Esperado:**

- Máximo de 5 notificações visíveis simultaneamente
- Notificações mais antigas removidas automaticamente
- Fila gerenciada corretamente (FIFO)
- Cada notificação visível por 3-7 segundos
- Progress bar animada em cada notificação
- Sem sobreposição ou conflito visual
- Todas empilhadas verticalmente com gap de 12px

**Critério de Aceitação:**

- [ ] Máximo 5 notificações por vez
- [ ] Fila gerenciada (FIFO)
- [ ] Layout não quebra
- [ ] Animações suaves

---

### **CT-17: Teste de Idioma (pt-BR e en-US)**

**Pré-condição:** Usuário autenticado

**Passos:**

1. Verificar idioma atual no console:

```javascript
console.log('Idioma:', ErrorMessages.getLanguage());
```

2. Testar notificação em pt-BR:

```javascript
NotificationBridge.showError('invalid_token');
// Esperado: "Token Inválido" / "Sua sessão expirou..."
```

3. Alterar para inglês:

```javascript
ErrorMessages.setLanguage('en-US');
NotificationBridge.showError('invalid_token');
// Esperado: "Invalid Token" / "Your session has expired..."
```

4. Voltar para português:

```javascript
ErrorMessages.setLanguage('pt-BR');
```

**Resultado Esperado:**

- Idioma detectado automaticamente (navegador)
- pt-BR: "Token Inválido" / "Sua sessão expirou ou o token é inválido..."
- en-US: "Invalid Token" / "Your session has expired or the token is invalid..."
- Mudança de idioma instantânea
- Todas as mensagens traduzidas

**Critério de Aceitação:**

- [ ] Auto-detecção funciona
- [ ] pt-BR completo
- [ ] en-US completo
- [ ] Mudança dinâmica funciona

---

### **CT-18: Teste de Responsividade (Mobile)**

**Pré-condição:** Navegador com DevTools

**Passos:**

1. Abrir DevTools (F12)
2. Ativar modo responsivo (Ctrl+Shift+M)
3. Testar em resoluções:
 - 375x667 (iPhone SE)
 - 414x896 (iPhone 11 Pro Max)
 - 360x740 (Samsung Galaxy S8+)
4. Abrir notificações
5. Abrir LogoutModal
6. Testar touch (cliques)

**Resultado Esperado:**

- Notificações adaptam para largura da tela
- Container: `max-width: calc(100% - 32px)`
- Notificações centralizadas em mobile
- Textos legíveis (não quebram)
- LogoutModal responsivo
- Botões grandes o suficiente para touch (min 44x44px)
- Sem scroll horizontal

**Critério de Aceitação:**

- [ ] Funciona em 375px (mínimo)
- [ ] Layout responsivo
- [ ] Touch-friendly
- [ ] Sem quebras visuais

---

## Resumo de Execução

### Planilha de Resultados

| ID | Caso de Teste | Chrome | Firefox | Status | Observações |
|----|---------------|--------|---------|--------|-------------|
| CT-01 | Login Google | ⬜ | ⬜ | 🔲 | |
| CT-02 | Login Microsoft | ⬜ | ⬜ | 🔲 | |
| CT-03 | Consentimento | ⬜ | ⬜ | 🔲 | |
| CT-04 | Logout Local | ⬜ | ⬜ | 🔲 | |
| CT-05 | Logout Federado (Google) | ⬜ | ⬜ | 🔲 | |
| CT-06 | Logout Federado (Microsoft) | ⬜ | ⬜ | 🔲 | |
| CT-07 | Sessão Expirada | ⬜ | ⬜ | 🔲 | |
| CT-08 | Timeout Inatividade | ⬜ | ⬜ | 🔲 | |
| CT-09 | Auto-Refresh Token | ⬜ | ⬜ | 🔲 | |
| CT-10 | Erro de Rede | ⬜ | ⬜ | 🔲 | |
| CT-11 | Rate Limiting | ⬜ | ⬜ | 🔲 | |
| CT-12 | Teclado | ⬜ | ⬜ | 🔲 | |
| CT-13 | Screen Reader | ⬜ | ⬜ | 🔲 | |
| CT-14 | Chrome Compat | | - | 🔲 | |
| CT-15 | Firefox Compat | - | | 🔲 | |
| CT-16 | Múltiplas Notificações | ⬜ | ⬜ | 🔲 | |
| CT-17 | Idiomas | ⬜ | ⬜ | 🔲 | |
| CT-18 | Responsividade | ⬜ | ⬜ | 🔲 | |

**Legenda:**

- Passou
- Falhou
- Parcial
- 🔲 Não testado
- ⬜ N/A

---

## 🐛 Registro de Bugs

### Template de Bug Report

```markdown
**ID:** BUG-001
**Caso de Teste:** CT-XX
**Navegador:** Chrome 120 / Firefox 120
**Severidade:** Crítica / Alta / Média / Baixa
**Descrição:** [Descrição detalhada do problema]
**Passos para Reproduzir:**
1. ...
2. ...
3. ...
**Resultado Esperado:** [O que deveria acontecer]
**Resultado Atual:** [O que aconteceu]
**Screenshots/Console:** [Anexar se possível]
**Workaround:** [Solução temporária, se houver]
```

---

## Critérios de Aceitação Final

### Para aprovar a Fase 2:

- [ ] **Login/Logout:** 100% funcional (CT-01, CT-02, CT-04, CT-05, CT-06)
- [ ] **Consentimento:** 100% funcional (CT-03)
- [ ] **Notificações:** Todas exibidas corretamente (CT-01 a CT-11, CT-16)
- [ ] **Sessão:** Auto-refresh e timeouts funcionando (CT-08, CT-09)
- [ ] **Erros:** Tratados graciosamente (CT-07, CT-10, CT-11)
- [ ] **Acessibilidade:** WCAG 2.1 AA (CT-12, CT-13)
- [ ] **Compatibilidade:** Chrome + Firefox (CT-14, CT-15)
- [ ] **Idiomas:** pt-BR e en-US (CT-17)
- [ ] **Responsividade:** Mobile-friendly (CT-18)
- [ ] **Performance:** Lighthouse > 80 (todas as métricas)
- [ ] **Sem bugs críticos:** 0 bugs críticos, máximo 3 bugs médios

---

## Notas de Execução

### Dicas para Testes Eficientes

1.**Limpar estado entre testes:**

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

2.**Verificar logs do backend:**

- Acessar `/secure/admin-logs.html`
- Filtrar por eventos relevantes

3.**Usar console para debug:**

```javascript
// Verificar estado
console.table({
 autenticado: SessionManager.isAuthenticated(),
 provider: localStorage.getItem('auth_provider'),
 token: localStorage.getItem('auth_access_token')?.substring(0, 20) + '...',
 idioma: ErrorMessages.getLanguage()
});
```

4.**Testar em janela anônima:**

- Sem cache ou cookies anteriores
- Simula primeiro acesso

5.**Screenshots e vídeos:**

- Capturar evidências de sucesso/falha
- Facilita troubleshooting

---

## Próximos Passos Após Testes

1.**Se todos os testes passarem:**

- Marcar Fase 2 como 100% completa
- Criar release tag (v2.0.0)
- Atualizar documentação
- Deploy para produção

2.**Se houver bugs:**

- 🐛 Registrar bugs encontrados
- Priorizar correções
- 🔄 Re-testar após correções
- Aprovar quando 100% funcional

---

**Executor:** _________________ 
**Data Início:** _________________ 
**Data Fim:** _________________ 
**Resultado:** Aprovado / Reprovado / Aprovado com Ressalvas
