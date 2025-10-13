# Guia de Configuração - Redirect URIs para Provedores OIDC

## 🚨 Erro Atual

**Erro:** `invalid_request: The provided value for the input parameter 'redirect_uri' is not valid`

**Causa:** A URI de redirecionamento não está registrada no provedor (Google ou Microsoft)

## 📝 URIs que DEVEM estar registradas

### 🔵 Google Cloud Console

**Projeto:** Cara Core Área 51  
**Client ID:** `1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com`

**URIs de Redirecionamento Autorizadas:**

```text
http://localhost:8000/secure/callback.html
http://127.0.0.1:8000/secure/callback.html
https://chmulato.github.io/cara-core/secure/callback.html
https://www.caracore.com.br/secure/callback.html
```

**URIs de Logout Autorizadas:**

```text
http://localhost:8000/secure/logout.html
http://127.0.0.1:8000/secure/logout.html
https://chmulato.github.io/cara-core/secure/logout.html
https://www.caracore.com.br/secure/logout.html
```

### 🔷 Microsoft Azure Portal

**Aplicação:** Cara Core Área 51  
**Client ID:** `8ef17663-438f-4777-99ca-c5ad5b2a2993`

**URIs de Redirecionamento:**

```text
http://localhost:8000/secure/callback.html
http://127.0.0.1:8000/secure/callback.html
https://chmulato.github.io/cara-core/secure/callback.html
https://www.caracore.com.br/secure/callback.html
```

**URIs de Logout:**

```text
http://localhost:8000/secure/logout.html
http://127.0.0.1:8000/secure/logout.html
https://chmulato.github.io/cara-core/secure/logout.html
https://www.caracore.com.br/secure/logout.html
```

## 🔧 Como Configurar

### Google Cloud Console

1. Acesse: <https://console.cloud.google.com/>
2. Navegue para: **APIs & Services** > **Credentials**
3. Clique no Client ID: `1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com`
4. Na seção **Authorized redirect URIs**, adicione:
   - `http://localhost:8000/secure/callback.html`
   - `http://127.0.0.1:8000/secure/callback.html`
   - `https://chmulato.github.io/cara-core/secure/callback.html`
5. Clique em **Save**

### Microsoft Azure Portal

1. Acesse: <https://portal.azure.com/>
2. Navegue para: **Azure Active Directory** > **App registrations**
3. Encontre: **Cara Core Área 51** (`8ef17663-438f-4777-99ca-c5ad5b2a2993`)
4. Clique em **Authentication**
5. Na seção **Redirect URIs**, adicione:
   - `http://localhost:8000/secure/callback.html`
   - `http://127.0.0.1:8000/secure/callback.html`
   - `https://chmulato.github.io/cara-core/secure/callback.html`
   - `https://www.caracore.com.br/secure/callback.html`
6. Na seção **Logout URLs**, adicione as URLs de logout correspondentes
   - `http://localhost:8000/secure/logout.html`
   - `http://127.0.0.1:8000/secure/logout.html`
   - `https://chmulato.github.io/cara-core/secure/logout.html`
   - `https://www.caracore.com.br/secure/logout.html`
7. Em **Supported account types**, selecione **Personal Microsoft accounts only**
8. Confirme que a autoridade utilizada no front-end aponta para: `https://login.microsoftonline.com/consumers/v2.0`
9. Clique em **Save**

## 🧪 Como Testar a Configuração

### 1. Teste Automático

```javascript
// No console do navegador
await window.redirectUriDiagnostic.diagnose();
```

### 2. Verificar URIs Atuais

```javascript
// Verificar configuração atual
const googleConfig = await window.getProviderConfig('google');
const microsoftConfig = await window.getProviderConfig('microsoft');

console.log('Google redirect_uri:', googleConfig.redirect_uri);
console.log('Microsoft redirect_uri:', microsoftConfig.redirect_uri);
```

### 3. Testar URI Específica

```javascript
// Testar uma URI específica
window.redirectUriDiagnostic.test('https://chmulato.github.io/cara-core/secure/callback.html');
```

## 🔍 Verificação de Ambiente

O sistema detecta automaticamente o ambiente e gera as URIs correspondentes:

| Ambiente | URL Base | Redirect URI |
|----------|----------|--------------|
| **Desenvolvimento** | `http://localhost:8000` | `http://localhost:8000/secure/callback.html` |
| **GitHub Pages** | `https://chmulato.github.io` | `https://chmulato.github.io/cara-core/secure/callback.html` |
| **Produção (Cara Core)** | `https://www.caracore.com.br` | `https://www.caracore.com.br/secure/callback.html` |
| **Produção** | `https://seu-dominio.com` | `https://seu-dominio.com/secure/callback.html` |

## ⚠️ Pontos Importantes

1. **Caso Sensível:** As URIs são case-sensitive
2. **HTTP vs HTTPS:** Localhost pode usar HTTP, produção deve usar HTTPS
3. **Propagação:** Mudanças podem demorar alguns minutos para propagar
4. **Teste:** Sempre teste após fazer alterações
5. **Logs:** Verifique os logs OIDC para detalhes de erro

## 🚀 Solução Rápida

Se você tem acesso aos consoles dos provedores, execute estes passos:

### Passo 1: Verificar URI Atual

```javascript
console.log('URI atual:', window.location.origin + '/secure/callback.html');
```

### Passo 2: Adicionar nos Provedores

- Google: Adicionar a URI no Google Cloud Console
- Microsoft: Adicionar a URI no Azure Portal

### Passo 3: Aguardar Propagação

- Aguarde 2-5 minutos para as mudanças propagarem

### Passo 4: Testar Login

- Tente fazer login novamente
- Verifique se não há mais erro de redirect_uri

## 📞 Troubleshooting

### Erro Persiste?

1. **Limpe o cache** do navegador
2. **Aguarde mais tempo** para propagação
3. **Verifique caracteres especiais** na URI
4. **Confirme HTTPS** em produção
5. **Teste em abas anônimas**

### Verificar Logs

```javascript
// Acessar logs detalhados
window.logOIDC.exportLogs('json');
```

## 🆔 Microsoft Entra ID - Audience e Authority

- A aplicação **Cara Core Área 51** está configurada para **Personal Microsoft accounts only**.
- Utilize sempre a URL de autoridade para contas pessoais Microsoft: `https://login.microsoftonline.com/consumers/v2.0`.
- Esta configuração permite que qualquer pessoa com conta Microsoft pessoal (outlook.com, hotmail.com, etc.) faça login na aplicação.
- Se desejar restringir para apenas contas da sua organização, seria necessário atualizar o App Registration para **Accounts in this organizational directory only (Single tenant)** e revisar a configuração de segurança.

---
**Status:** 🔧 **EM CORREÇÃO** - Aguardando configuração dos provedores
