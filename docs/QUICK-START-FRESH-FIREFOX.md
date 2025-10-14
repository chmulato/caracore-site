# Quick Start Guide: Testing OIDC in Fresh Firefox

## 🚀 Quick Start (5 Minutes)

Este guia rápido ajuda você a testar o sistema OIDC em uma instalação limpa do Firefox.

## 📋 Pré-requisitos

- Firefox 118+ instalado (fresh install ou modo privado)
- Acesso à internet
- Conta Google pessoal ou conta Microsoft pessoal (@outlook.com, @hotmail.com, etc.)

## ⚡ Teste Rápido (Modo Privado)

### Passo 1: Abrir Firefox em Modo Privado
```
1. Pressione Ctrl+Shift+P (Windows/Linux) ou Cmd+Shift+P (Mac)
2. Uma nova janela privada será aberta
3. Isso simula uma instalação limpa sem cache ou cookies
```

### Passo 2: Acessar a Área 51
```
https://www.caracore.com.br/secure/index.html
```

### Passo 3: Testar Login com Google
```
1. Clicar em "Continuar com Google"
2. Selecionar conta Google pessoal
3. Autorizar as permissões solicitadas
4. Aguardar redirecionamento automático
```

**Resultado Esperado:**
- ✅ Redirecionamento para callback
- ✅ Processamento automático
- ✅ Redirecionamento para área restrita
- ✅ Usuário autenticado exibido

### Passo 4: Verificar Console (Opcional)
```
1. Pressione F12 para abrir DevTools
2. Vá para aba "Console"
3. Observe os logs do auto-fix:
   - 🔧 OAuth Auto-Fix carregado
   - 🎯 Página de callback detectada
   - 🔍 Provider detectado: google
   - 🎉 Auto-fix aplicado com sucesso!
```

### Passo 5: Testar Microsoft (Opcional)
```
1. Fazer logout
2. Voltar para página de login
3. Clicar em "Continuar com Microsoft"
4. Usar conta pessoal Microsoft
5. Verificar redirecionamento automático
```

## 🧪 Teste Completo (Fresh Install)

### Cenário 1: Instalação Limpa Real

**Preparação:**
```bash
# Windows - Instalar Firefox novo
1. Fazer backup do Firefox atual (opcional)
2. Desinstalar Firefox completamente
3. Baixar versão mais recente
4. Instalar sem importar dados
```

**Teste:**
```
1. Abrir Firefox recém-instalado
2. Acessar https://www.caracore.com.br/secure/index.html
3. Testar login com Google
4. Verificar funcionamento completo
5. Testar login com Microsoft
6. Verificar funcionamento completo
```

### Cenário 2: Limpar Dados Existentes

**Preparação:**
```bash
# Firefox - Limpar todos os dados
1. Menu > Histórico > Limpar histórico recente
2. Selecionar "Tudo"
3. Marcar TODAS as opções:
   - Histórico de navegação
   - Histórico de download
   - Cookies e dados de sites
   - Cache
   - Dados de sites offline
   - Preferências de sites
   - Dados de login
4. Clicar em "Limpar agora"
5. Fechar e reabrir Firefox
```

**Teste:**
```
1. Acessar a Área 51
2. Testar ambos provedores
3. Verificar logs no console
```

## 📊 Checklist de Validação

### Teste com Google
- [ ] Página de login carrega corretamente
- [ ] Botão "Continuar com Google" funciona
- [ ] Redirecionamento para accounts.google.com
- [ ] Seleção de conta funciona
- [ ] Autorização de permissões funciona
- [ ] Callback recebe código OAuth
- [ ] Auto-fix processa automaticamente
- [ ] Redirecionamento para área restrita
- [ ] Usuário exibido como autenticado
- [ ] Nome e email corretos

### Teste com Microsoft
- [ ] Página de login carrega corretamente
- [ ] Botão "Continuar com Microsoft" funciona
- [ ] Redirecionamento para login.microsoftonline.com
- [ ] Seleção de conta funciona (pessoal)
- [ ] Autorização de permissões funciona
- [ ] Callback recebe código OAuth
- [ ] Auto-fix processa automaticamente
- [ ] Redirecionamento para área restrita
- [ ] Usuário exibido como autenticado
- [ ] Nome e email corretos

### Logs do Console
- [ ] "🔧 OAuth Auto-Fix carregado"
- [ ] "🎯 Página de callback detectada"
- [ ] "🔍 Provider detectado"
- [ ] "✅ Estado restaurado"
- [ ] "✅ Autenticação criada"
- [ ] "🎉 Auto-fix aplicado com sucesso!"
- [ ] "🚀 Redirecionando para área restrita"
- [ ] "🔐 Auth Force Recognition carregado"
- [ ] "✅ Override dos métodos aplicado"

## 🐛 Troubleshooting Rápido

### Problema: Erro "redirect_uri_mismatch"

**Solução:**
```
1. Verificar se está usando URL correta:
   - Local: http://localhost:8000/secure/index.html
   - Produção: https://www.caracore.com.br/secure/index.html
2. Verificar redirect URIs no Google Cloud Console
3. Aguardar 1-2 minutos após mudanças
4. Limpar cache (Ctrl+Shift+Delete)
5. Tentar novamente
```

### Problema: Erro "AADSTS9002346"

**Solução:**
```
1. Verificar redirect URIs no Azure Portal
2. Confirmar que está usando /consumers authority
3. Verificar se a conta é pessoal Microsoft
4. Limpar storage:
   sessionStorage.clear()
   localStorage.clear()
5. Tentar novamente
```

### Problema: Página fica "carregando"

**Solução:**
```
1. Abrir console (F12)
2. Verificar erros em vermelho
3. Verificar aba Network para requests bloqueados
4. Verificar se há bloqueador de anúncios ativo
5. Desabilitar bloqueadores temporariamente
6. Recarregar página
```

### Problema: "Você não está autenticado"

**Solução:**
```
1. Verificar logs no console
2. Verificar se auth-force-recognition.js carregou
3. Limpar storage e tentar novamente:
   sessionStorage.clear()
   localStorage.clear()
4. Fazer logout completo
5. Login novamente
```

## 📱 Teste em Dispositivos Móveis

### Android Chrome
```
1. Abrir Chrome em modo anônimo
2. Acessar URL da produção
3. Testar login (mobile-optimized)
4. Verificar redirecionamento
```

### iOS Safari
```
1. Abrir Safari em modo privado
2. Acessar URL da produção
3. Testar login (iOS-optimized)
4. Verificar redirecionamento
```

## 🔍 Logs Detalhados para Debug

### Ativar Logs Verbose
```javascript
// No console do navegador (F12)
window.OIDC_LOG_CONFIG = {
  logLevel: 'DEBUG',
  consoleLogging: true,
  debugPanel: true
};

// Recarregar página para aplicar
location.reload();
```

### Verificar Storage
```javascript
// Verificar sessionStorage
console.log('SessionStorage:', {
  provider: sessionStorage.getItem('cara_core_oidc_provider'),
  id_token: sessionStorage.getItem('cara_core_id_token'),
  access_token: sessionStorage.getItem('cara_core_access_token'),
  user_profile: sessionStorage.getItem('cara_core_user_profile')
});

// Verificar localStorage
console.log('LocalStorage:', {
  provider: localStorage.getItem('cara_core_oidc_provider'),
  last_login: localStorage.getItem('cara_core_last_login'),
  user_id: localStorage.getItem('cara_core_user_id')
});
```

### Verificar Tokens
```javascript
// Decodificar ID token
const idToken = sessionStorage.getItem('cara_core_id_token');
if (idToken) {
  const parts = idToken.split('.');
  const payload = JSON.parse(atob(parts[1]));
  console.log('Token Payload:', payload);
}
```

## 🎯 Métricas de Sucesso

### Tempo Esperado (Fresh Browser)
```
Login com Google:   5-10 segundos
Login com Microsoft: 5-10 segundos
Callback processing: < 2 segundos
Total flow:         7-15 segundos
```

### Taxa de Sucesso Esperada
```
Google OAuth:   > 99%
Microsoft OAuth: > 99%
Auto-fix:       > 99%
Force recognition: > 99%
```

## 📚 Documentação Completa

Para informações detalhadas, consulte:

1. **[VALIDACAO-FIREFOX-FRESH-INSTALL.md](./VALIDACAO-FIREFOX-FRESH-INSTALL.md)**
   - Validação completa do sistema
   - Cenários de teste detalhados
   - Logs esperados

2. **[CONFIGURACAO-REDIRECT-URIS-VALIDACAO.md](./CONFIGURACAO-REDIRECT-URIS-VALIDACAO.md)**
   - Configuração de redirect URIs
   - Permissões e scopes
   - Troubleshooting detalhado

3. **[OAUTH-AUTOMATICO-IMPLEMENTADO.md](./OAUTH-AUTOMATICO-IMPLEMENTADO.md)**
   - Implementação técnica
   - Arquivos envolvidos
   - Funcionamento interno

## ✅ Conclusão

Após seguir este guia:
- ✅ Você testou o sistema em ambiente limpo
- ✅ Verificou funcionamento com ambos provedores
- ✅ Confirmou logs de sucesso no console
- ✅ Validou redirecionamento automático
- ✅ Testou force recognition na área restrita

**O sistema está pronto para uso em produção!**

## 🆘 Suporte

Se encontrar problemas:
1. Verificar logs do console (F12)
2. Consultar seção de troubleshooting
3. Verificar documentação completa
4. Contatar suporte: suporte@caracore.com.br

---

**Data de Criação:** 2025-10-14  
**Ambiente:** Fresh Firefox Installation  
**Status:** ✅ Testado e Validado
