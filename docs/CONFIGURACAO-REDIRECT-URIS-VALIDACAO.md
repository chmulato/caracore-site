# Configuração e Validação de Redirect URIs

## 📋 Visão Geral

Este documento fornece um guia completo para configurar e validar os redirect URIs necessários para autenticação OIDC em ambos Google e Microsoft Entra ID, especialmente para testes em ambientes limpos (fresh browser installations).

## 🎯 Redirect URIs Necessários

### Para Desenvolvimento Local

#### Google OAuth 2.0
```
http://localhost:8000/secure/callback.html
http://127.0.0.1:8000/secure/callback.html
```

#### Microsoft Entra ID (Contas Pessoais)
```
http://localhost:8000/secure/callback.html
http://127.0.0.1:8000/secure/callback.html
```

### Para GitHub Pages (Preview)
```
https://chmulato.github.io/cara-core/secure/callback.html
```

### Para Produção
```
https://www.caracore.com.br/secure/callback.html
```

## 🔧 Configuração no Google Cloud Console

### Passo 1: Acessar o Console
1. Acesse [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=chmulato-web-oauth2)
2. Localize o OAuth 2.0 Client ID: `1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com`

### Passo 2: Configurar Origens JavaScript
**Authorized JavaScript origins:**
```
http://localhost:8000
http://127.0.0.1:8000
https://chmulato.github.io
https://www.caracore.com.br
```

### Passo 3: Configurar Redirect URIs
**Authorized redirect URIs:**
```
http://localhost:8000/secure/callback.html
http://127.0.0.1:8000/secure/callback.html
https://chmulato.github.io/cara-core/secure/callback.html
https://www.caracore.com.br/secure/callback.html
```

### Passo 4: Configurar Permissões (Scopes)
**Scopes necessários:**
- `openid` - Obrigatório para OIDC
- `profile` - Informações de perfil básico (nome, foto)
- `email` - Endereço de e-mail do usuário

**Configuração automática no código:**
```javascript
// secure/dynamic-config.js
scope: 'openid profile email'
```

### Passo 5: Configurar OAuth Consent Screen
1. Acesse **OAuth consent screen**
2. **Application type:** External (para contas pessoais)
3. **Application name:** Cara Core - Área 51
4. **Support email:** suporte@caracore.com.br
5. **Authorized domains:**
   - `caracore.com.br`
   - `github.io` (para preview)
6. **Scopes:** openid, profile, email

### Passo 6: Testar Usuários (Modo Testing)
Se a aplicação estiver em modo "Testing" no Google:
1. Acesse **OAuth consent screen > Test users**
2. Adicione os e-mails dos testadores
3. Limite: 100 usuários em modo testing

**Nota:** Para uso público, publique a aplicação (requer verificação do Google).

## 🔧 Configuração no Microsoft Azure / Entra ID

### Passo 1: Acessar o Portal
1. Acesse [Azure Portal - App registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Localize o app com Client ID: `***AZURE_SECRET_REDACTED***`

### Passo 2: Configurar Authentication
1. No menu lateral, selecione **Authentication**
2. Em **Platform configurations**, selecione **Web**

### Passo 3: Adicionar Redirect URIs
**Web - Redirect URIs:**
```
http://localhost:8000/secure/callback.html
http://127.0.0.1:8000/secure/callback.html
https://chmulato.github.io/cara-core/secure/callback.html
https://www.caracore.com.br/secure/callback.html
```

### Passo 4: Configurar Tipo de Conta
**Supported account types:**
- ✅ **Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)**
- Esta opção permite contas pessoais (@outlook.com, @hotmail.com, Xbox, etc.)

**Configuração automática no código:**
```javascript
// secure/dynamic-config.js
const authorityRoot = 'https://login.microsoftonline.com/consumers';
```

### Passo 5: Configurar API Permissions
1. No menu lateral, selecione **API permissions**
2. Adicionar permissões delegadas:
   - ✅ `openid` - Sign users in
   - ✅ `profile` - View users' basic profile
   - ✅ `email` - View users' email address
   - ✅ `offline_access` (opcional) - Maintain access to data

3. **Grant admin consent** (se aplicável)

### Passo 6: Configurar Token Configuration
1. No menu lateral, selecione **Token configuration**
2. Adicionar claims opcionais ao ID token:
   - `email`
   - `family_name`
   - `given_name`
   - `upn` (User Principal Name)

### Passo 7: Verificar Endpoints
Em **Overview > Endpoints**, confirme:
```
OAuth 2.0 authorization endpoint (v2):
https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize

OAuth 2.0 token endpoint (v2):
https://login.microsoftonline.com/consumers/oauth2/v2.0/token
```

## ✅ Checklist de Validação

### Google OAuth 2.0
- [ ] Client ID configurado corretamente
- [ ] Authorized JavaScript origins incluem todos os domínios
- [ ] Authorized redirect URIs incluem todos os ambientes
- [ ] OAuth consent screen configurado
- [ ] Scopes corretos (openid, profile, email)
- [ ] Usuários de teste adicionados (se em modo Testing)
- [ ] Aplicação publicada (se necessário acesso público)

### Microsoft Entra ID
- [ ] App Registration criado
- [ ] Client ID configurado
- [ ] Redirect URIs incluem todos os ambientes
- [ ] Supported account types = contas pessoais Microsoft
- [ ] API permissions configuradas e consentidas
- [ ] Authority configurada para /consumers
- [ ] Token configuration com claims necessários
- [ ] Endpoints verificados

### Implementação no Código
- [ ] dynamic-config.js com configurações corretas
- [ ] oauth-callback-auto-fix.js carregado em callback.html
- [ ] auth-force-recognition.js carregado em restrita.html
- [ ] Error handlers implementados
- [ ] Logging configurado para troubleshooting

## 🧪 Testes de Validação

### Teste 1: Validar Google OAuth
```bash
# Iniciar servidor local
python -m http.server 8000

# Abrir no navegador
http://localhost:8000/secure/index.html

# Clicar em "Continuar com Google"
# Verificar:
# 1. Redirecionamento para accounts.google.com
# 2. URL de callback correta após autorização
# 3. Sem erros de redirect_uri
```

### Teste 2: Validar Microsoft Entra
```bash
# Iniciar servidor local
python -m http.server 8000

# Abrir no navegador
http://localhost:8000/secure/index.html

# Clicar em "Continuar com Microsoft"
# Verificar:
# 1. Redirecionamento para login.microsoftonline.com/consumers
# 2. URL de callback correta após autorização
# 3. Sem erros AADSTS9002346 (redirect_uri mismatch)
```

### Teste 3: Validar Fresh Browser (Firefox)
```bash
# Abrir Firefox em modo privado ou fresh install
# Limpar todo histórico, cookies e storage
# Testar login completo com ambos provedores
# Verificar logs do console para troubleshooting
```

## 🐛 Troubleshooting

### Erro: "redirect_uri_mismatch" (Google)

**Causa:** A URI de redirecionamento não está cadastrada no Google Cloud Console.

**Solução:**
1. Verificar a URI exata que está sendo usada (copiar do erro)
2. Acessar Google Cloud Console
3. Adicionar a URI exata em **Authorized redirect URIs**
4. Aguardar alguns minutos para propagação
5. Limpar cache do navegador
6. Testar novamente

**Exemplo de erro:**
```
Error 400: redirect_uri_mismatch
The redirect URI in the request: http://localhost:8000/secure/callback.html
does not match the ones authorized for the OAuth client.
```

### Erro: "AADSTS9002346" (Microsoft)

**Causa:** A URI de redirecionamento não está cadastrada no Azure Portal.

**Solução:**
1. Verificar a URI exata no erro
2. Acessar Azure Portal > App registrations
3. Selecionar a aplicação
4. Authentication > Web > Redirect URIs
5. Adicionar a URI exata
6. Salvar
7. Testar novamente

**Exemplo de erro:**
```
AADSTS9002346: Invalid redirect URI
The redirect URI 'http://localhost:8000/secure/callback.html' is not
registered for this application.
```

### Erro: "authority mismatch" (Microsoft)

**Causa:** O callback está sendo processado com uma authority diferente da usada no início do fluxo.

**Solução:**
1. Limpar sessionStorage e localStorage
2. Garantir que está usando o botão correto (Google vs Microsoft)
3. Verificar que `cara_core_oidc_provider` está sendo salvo corretamente
4. Recarregar a página (Ctrl+F5)

**No console:**
```javascript
// Limpar storage manualmente
sessionStorage.clear();
localStorage.clear();

// Ou especificamente
sessionStorage.removeItem('cara_core_oidc_provider');
localStorage.removeItem('cara_core_oidc_provider');
```

### Erro: "access_denied" (Ambos)

**Causa:** Usuário cancelou a autorização ou não tem permissão.

**Solução:**
1. Verificar se o usuário está usando conta correta
2. Para Google: verificar se está na lista de test users
3. Para Microsoft: verificar se é conta pessoal (não corporativa)
4. Tentar novamente com conta apropriada

## 📊 Logs de Validação Esperados

### Sucesso - Google OAuth
```
🔧 OAuth Auto-Fix carregado
🎯 Página de callback detectada, iniciando auto-fix...
📋 Parâmetros extraídos: {code: '4/0AY0e-g7...', state: 'state_...', scope: 'openid profile email'}
🔍 Provider detectado: google
🔧 Restaurando estado google: state_...
✅ Estado restaurado: oidc.state_...
✅ Autenticação GOOGLE criada para: Usuário Google CaraCore
🔍 Verificação: {hasProvider: true, hasTokens: true, hasOidcState: true}
🎉 Auto-fix aplicado com sucesso!
✅ URL limpa
🚀 Redirecionando para área restrita...
```

### Sucesso - Microsoft Entra
```
🔧 OAuth Auto-Fix carregado
🎯 Página de callback detectada, iniciando auto-fix...
📋 Parâmetros extraídos: {code: 'M.C5-...', state: 'state_...', scope: 'openid profile email'}
🔍 Provider detectado: azure
🔧 Restaurando estado azure: state_...
✅ Estado restaurado: oidc.state_...
✅ Autenticação AZURE criada para: Usuário Microsoft CaraCore
🔍 Verificação: {hasProvider: true, hasTokens: true, hasOidcState: true}
🎉 Auto-fix aplicado com sucesso!
✅ URL limpa
🚀 Redirecionando para área restrita...
```

## 🔒 Considerações de Segurança

### Redirect URIs
- ✅ **SEMPRE usar HTTPS em produção**
- ✅ **Permitir HTTP apenas para localhost em desenvolvimento**
- ✅ **Evitar wildcards em redirect URIs**
- ✅ **Validar URIs exatas (incluindo path)**

### Scopes
- ✅ **Solicitar apenas scopes necessários**
- ✅ **openid, profile, email são suficientes para autenticação básica**
- ✅ **Evitar scopes sensíveis desnecessários**

### Tokens
- ✅ **Nunca expor client_secret no frontend**
- ✅ **Usar PKCE para fluxo no browser**
- ✅ **Validar ID tokens antes de usar**
- ✅ **Respeitar tempo de expiração**

### Storage
- ✅ **Usar sessionStorage para dados temporários**
- ✅ **localStorage apenas para persistência não-sensível**
- ✅ **Cookies com flags HttpOnly, Secure, SameSite**

## 📱 Suporte Multi-Plataforma

### Navegadores Certificados
- ✅ **Chrome** (versão atual)
- ✅ **Microsoft Edge** (versão atual)
- ✅ **Firefox** 118+
- ✅ **Safari** 17+ (macOS/iOS)

### Dispositivos Móveis
- ✅ **iOS Safari** 17+
- ✅ **Android Chrome** (versão atual)
- ⚠️ **Navegadores in-app** podem ter limitações

### Modo Privado / Incognito
- ✅ **Totalmente suportado**
- ✅ **Ideal para testar fresh install scenarios**
- ✅ **Sem dados de sessões anteriores**

## 📚 Referências

### Documentação Oficial
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [OIDC Specification](https://openid.net/specs/openid-connect-core-1_0.html)

### Documentação do Projeto
- [OAUTH-AUTOMATICO-IMPLEMENTADO.md](./OAUTH-AUTOMATICO-IMPLEMENTADO.md)
- [VALIDACAO-FIREFOX-FRESH-INSTALL.md](./VALIDACAO-FIREFOX-FRESH-INSTALL.md)
- [SISTEMA-TIMEOUT-ERROS.md](./SISTEMA-TIMEOUT-ERROS.md)

---

**Data de Criação:** 2025-10-14  
**Última Atualização:** 2025-10-14  
**Status:** ✅ Validado e Atualizado
