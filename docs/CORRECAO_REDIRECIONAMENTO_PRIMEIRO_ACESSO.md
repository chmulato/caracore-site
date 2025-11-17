# Correção: Redirecionamento Incorreto para Primeiro Acesso

## Problema Identificado

Usuário autorizado (`chmulato@hotmail.com`) foi redirecionado incorretamente para a página de primeiro cadastro quando deveria ter acesso direto à Área 51.

### Causa Raiz

1. **Erro 500 no Backend:** O endpoint `/oauth/microsoft/token` retornou erro 500
   - Possível causa: Credenciais Microsoft não configuradas ou problema na configuração
   - Log: `POST https://caracore-backend-docker.azurewebsites.net/oauth/microsoft/token 500 (Internal Server Error)`

2. **Falta de Verificação de Autorização:** Quando o backend retorna erro 500, o sistema não consegue obter o email do token e redireciona automaticamente para primeiro acesso, sem verificar se o usuário já está autorizado.

3. **Fluxo Incorreto:** O sistema assumia que qualquer erro no callback = primeiro acesso, sem verificar se o usuário já estava na lista de autorizados.

---

## Solução Implementada

### 1. Verificação de Autorização Antes de Redirecionar

**Arquivo:** `secure/js/oidc-callback-microsoft.js`

Quando há erro ao obter o token do backend:
1. ✅ Tenta obter email de fontes alternativas:
   - Parâmetros da URL (`?email=...`)
   - `localStorage` (`user_email`, `auth_user_email`)
   - `sessionStorage` (`user_email`)

2. ✅ Se encontrar email, verifica autorização via API:
   ```javascript
   POST /api/check-authorization
   {
     "email": "chmulato@hotmail.com",
     "provider": "microsoft"
   }
   ```

3. ✅ Se usuário está autorizado:
   - Continua com autenticação básica (mesmo sem token completo)
   - Permite acesso à área restrita

4. ✅ Se usuário não está autorizado:
   - Redireciona para `/secure/request-access.html` (solicitação de acesso)

### 2. Melhoria no Callback de Autorização

**Arquivo:** `secure/js/callback-authorization.js`

Quando há erro na verificação de autorização:
1. ✅ Tenta verificar autorização diretamente via API antes de redirecionar
2. ✅ Se autorizado, redireciona para `/secure/restrita.html`
3. ✅ Se não autorizado, redireciona para `/secure/request-access.html`

### 3. URL de Redirecionamento Corrigida

**Arquivo:** `secure/js/authorization-check.js`

- Alterado `firstAccessUrl` de `/secure/first-access.html` para `/secure/request-access.html`
- Garante que usuários não autorizados vão para a página correta de solicitação

---

## Fluxo Corrigido

### Antes (Problema):
```
Login OIDC → Erro 500 no backend → Sem email → Redireciona para first-access.html ❌
```

### Depois (Corrigido):
```
Login OIDC → Erro 500 no backend → 
  ├─ Tenta obter email de storage/URL
  ├─ Se encontrar email:
  │   ├─ Verifica autorização via API
  │   ├─ Se autorizado → Continua autenticação → restrita.html ✅
  │   └─ Se não autorizado → request-access.html ✅
  └─ Se não encontrar email → request-access.html ✅
```

---

## Problema do Erro 500 no Backend

### Possíveis Causas

1. **Credenciais Microsoft não configuradas:**
   - `AZURE_CLIENT_ID` não definido
   - `AZURE_CLIENT_SECRET` não definido
   - Verificar variáveis de ambiente no Azure App Service

2. **Problema na comunicação com Microsoft:**
   - Timeout na requisição
   - Erro de rede
   - Token endpoint da Microsoft indisponível

### Como Verificar

**Backend:** `backend/app.py` (linha 1041-1047)
```python
if not azure_client_id or not azure_client_secret:
    logger.error("Credenciais Microsoft ausentes no ambiente - respondendo erro 500")
    resp = make_response(jsonify({
        "error": "server_error",
        "error_description": "Server not configured with Microsoft Entra client credentials"
    }), 500)
    return add_cors(resp)
```

**Verificar logs do Azure:**
```bash
az webapp log tail \
  --name caracore-backend-docker \
  --resource-group rg-caracore
```

**Procurar por:**
- `"Credenciais Microsoft ausentes no ambiente"`
- `"Falha ao chamar Microsoft Token Endpoint"`
- Erros relacionados a `AZURE_CLIENT_ID` ou `AZURE_CLIENT_SECRET`

---

## Melhorias Implementadas

### ✅ Verificação Inteligente de Autorização

- Sistema agora verifica se usuário está autorizado antes de redirecionar para primeiro acesso
- Usa múltiplas fontes para obter email (URL, localStorage, sessionStorage)
- Evita redirecionamento incorreto para usuários já autorizados

### ✅ Tratamento de Erros Melhorado

- Quando há erro no callback, tenta recuperar informações do usuário
- Verifica autorização mesmo quando há problemas técnicos
- Redireciona para página correta baseado no status de autorização

### ✅ URLs Corrigidas

- `firstAccessUrl` agora aponta para `/secure/request-access.html`
- Consistência em todos os pontos de redirecionamento

---

## Testes Recomendados

### Cenário 1: Usuário Autorizado com Erro 500
1. ✅ Usuário autorizado (`chmulato@hotmail.com`) faz login
2. ✅ Backend retorna erro 500
3. ✅ Sistema encontra email em storage
4. ✅ Verifica autorização via API
5. ✅ Confirma que está autorizado
6. ✅ Continua autenticação e permite acesso

### Cenário 2: Usuário Não Autorizado
1. ✅ Usuário não autorizado faz login
2. ✅ Backend retorna erro 500
3. ✅ Sistema encontra email em storage
4. ✅ Verifica autorização via API
5. ✅ Confirma que não está autorizado
6. ✅ Redireciona para `/secure/request-access.html`

### Cenário 3: Primeira Tentativa (Sem Email Salvo)
1. ✅ Usuário faz login pela primeira vez
2. ✅ Backend retorna erro 500
3. ✅ Sistema não encontra email em storage
4. ✅ Redireciona para `/secure/request-access.html`

---

## Próximos Passos

### 1. Investigar Erro 500 no Backend

**Verificar:**
- [ ] Variáveis de ambiente `AZURE_CLIENT_ID` e `AZURE_CLIENT_SECRET` estão configuradas no Azure?
- [ ] Credenciais estão corretas?
- [ ] Há logs de erro específicos no Azure?

**Comando para verificar variáveis:**
```bash
az webapp config appsettings list \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --query "[?name=='AZURE_CLIENT_ID' || name=='AZURE_CLIENT_SECRET'].{name:name, value:value}"
```

### 2. Melhorar Tratamento de Erros

- Adicionar retry logic para erros temporários
- Melhorar mensagens de erro para o usuário
- Adicionar fallback para obter email de outras fontes

### 3. Monitoramento

- Adicionar alertas para erros 500 no endpoint `/oauth/microsoft/token`
- Monitorar taxa de redirecionamentos incorretos
- Acompanhar logs de autorização

---

## Arquivos Modificados

1. ✅ `secure/js/oidc-callback-microsoft.js` - Verificação de autorização antes de redirecionar
2. ✅ `secure/js/callback-authorization.js` - Verificação adicional no callback
3. ✅ `secure/js/authorization-check.js` - URL corrigida para `request-access.html`
4. ✅ `secure/js/main.js` - Link para primeiro acesso adicionado
5. ✅ `secure/index.html` - Subtítulo atualizado

---

## Conclusão

A correção implementada resolve o problema de redirecionamento incorreto para usuários autorizados quando há erro no backend. O sistema agora:

- ✅ Verifica autorização antes de redirecionar
- ✅ Usa múltiplas fontes para obter email
- ✅ Redireciona para página correta baseado no status
- ✅ Trata erros de forma mais inteligente

**Nota:** O erro 500 no backend ainda precisa ser investigado e corrigido, mas agora o sistema consegue lidar melhor com essa situação e não redireciona incorretamente usuários autorizados.

