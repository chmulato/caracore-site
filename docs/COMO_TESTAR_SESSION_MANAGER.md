# Como Testar se SessionManager está Implementado no Servidor

Este guia explica como verificar se o `session_manager.py` está implementado e funcionando no servidor backend.

## 📋 Métodos de Teste

### 1. Script Automatizado (Recomendado)

Use o script Python criado para testar automaticamente:

```bash
# Testar servidor de produção
python backend/test_session_manager_server.py --url https://caracore-backend-docker.azurewebsites.net

# Testar servidor local
python backend/test_session_manager_server.py --url http://localhost:5051

# Modo verbose (mostra requisições e respostas)
python backend/test_session_manager_server.py --verbose
```

O script testa:
- ✅ Health check do servidor
- ✅ Se SessionManager está habilitado
- ✅ Se os endpoints existem
- ✅ Se a validação funciona corretamente

### 2. Teste Manual com cURL

#### 2.1. Verificar se SessionManager está habilitado

```bash
curl -X POST https://caracore-backend-docker.azurewebsites.net/auth/session/create \
  -H "Content-Type: application/json" \
  -d '{"user_data": {}, "tokens": {}}'
```

**Respostas esperadas:**
- **503** com `"error": "service_unavailable"` → SessionManager **NÃO** está habilitado
- **400** com `"error": "invalid_request"` → SessionManager **ESTÁ** habilitado (validação funcionando)

#### 2.2. Verificar se endpoints existem

```bash
# Endpoint CREATE
curl -X OPTIONS https://caracore-backend-docker.azurewebsites.net/auth/session/create

# Endpoint REFRESH
curl -X OPTIONS https://caracore-backend-docker.azurewebsites.net/auth/session/refresh

# Endpoint REVOKE
curl -X OPTIONS https://caracore-backend-docker.azurewebsites.net/auth/session/revoke
```

Todos devem retornar **200** ou **204** se existirem.

#### 2.3. Testar validação

```bash
# Teste CREATE - deve retornar 400
curl -X POST https://caracore-backend-docker.azurewebsites.net/auth/session/create \
  -H "Content-Type: application/json" \
  -d '{"user_data": {}, "tokens": {}}'

# Teste REFRESH - deve retornar 400
curl -X POST https://caracore-backend-docker.azurewebsites.net/auth/session/refresh \
  -H "Content-Type: application/json" \
  -d '{"session_id": ""}'

# Teste REVOKE - deve retornar 400
curl -X POST https://caracore-backend-docker.azurewebsites.net/auth/session/revoke \
  -H "Content-Type: application/json" \
  -d '{"session_id": ""}'
```

### 3. Teste Manual com Postman/Insomnia

#### 3.1. Criar requisição para verificar status

**Método:** `POST`  
**URL:** `https://caracore-backend-docker.azurewebsites.net/auth/session/create`  
**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "user_data": {},
  "tokens": {}
}
```

**Resultado esperado:**
- **Status 503** → SessionManager não habilitado
- **Status 400** → SessionManager habilitado ✅

### 4. Verificar Logs do Servidor

#### 4.1. Azure App Service Logs

1. Acesse o Azure Portal
2. Vá para o App Service `caracore-backend-docker`
3. Navegue até **Log stream** ou **Logs**
4. Procure por mensagens como:
   - `"SessionManager carregado - sistema de refresh tokens habilitado"` ✅
   - `"SessionManager não pode ser inicializado"` ❌
   - `"session_manager não disponível"` ❌

#### 4.2. Logs de Inicialização

Procure por estas mensagens no início do log:

```
✅ SessionManager inicializado: timeout=24h, max_sessions=5
✅ SessionManager carregado - sistema de refresh tokens habilitado
```

Se aparecer:
```
⚠️ TOKEN_ENCRYPTION_KEY não configurada - sistema de refresh tokens desabilitado
⚠️ SessionManager não pode ser inicializado (chave inválida)
⚠️ session_manager não disponível
```

Significa que há um problema de configuração.

### 5. Verificar Status via Health Check Detalhado

O endpoint `/health/detailed` agora inclui informações sobre o SessionManager:

```bash
curl https://caracore-backend-docker.azurewebsites.net/health/detailed
```

**Resposta esperada (SessionManager habilitado):**
```json
{
  "status": "healthy",
  "checks": {
    "session_manager": {
      "status": "ok",
      "enabled": true,
      "encryption_key": {
        "status": "ok",
        "configured": true
      },
      "initialization": {
        "status": "ok"
      }
    }
  }
}
```

**Resposta esperada (SessionManager desabilitado):**
```json
{
  "status": "degraded",
  "checks": {
    "session_manager": {
      "status": "disabled",
      "enabled": false,
      "reason": "TOKEN_ENCRYPTION_KEY not configured"
    }
  }
}
```

### 6. Verificar Variáveis de Ambiente

O SessionManager requer a variável de ambiente `TOKEN_ENCRYPTION_KEY`:

#### 6.1. Azure App Service

1. Azure Portal → App Service → **Configuration** → **Application settings**
2. Verifique se existe `TOKEN_ENCRYPTION_KEY`
3. Valor deve ser uma string base64 de 32 bytes (44 caracteres)

### 7. Teste Completo de Fluxo (Opcional)

Se você tiver tokens OAuth válidos, pode testar o fluxo completo:

```bash
# 1. Criar sessão
curl -X POST https://caracore-backend-docker.azurewebsites.net/auth/session/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_data": {
      "email": "teste@example.com",
      "name": "Teste",
      "provider": "google"
    },
    "tokens": {
      "access_token": "TOKEN_AQUI",
      "id_token": "TOKEN_AQUI",
      "refresh_token": "TOKEN_AQUI",
      "expires_in": 3600
    }
  }'

# 2. Se retornar session_id, usar para refresh
curl -X POST https://caracore-backend-docker.azurewebsites.net/auth/session/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "SESSION_ID_AQUI"
  }'

# 3. Revogar sessão
curl -X POST https://caracore-backend-docker.azurewebsites.net/auth/session/revoke \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "SESSION_ID_AQUI"
  }'
```

## 🔍 Diagnóstico de Problemas

### Problema: SessionManager retorna 503

**Causas possíveis:**
1. ❌ Variável `TOKEN_ENCRYPTION_KEY` não configurada
2. ❌ Arquivo `session_manager.py` não está no deploy
3. ❌ Dependências faltando (`crypto_manager.py`, `token_storage.py`)
4. ❌ Erro na inicialização do SessionManager

**Solução:**
1. Verificar logs do servidor
2. Verificar variáveis de ambiente no Azure
3. Verificar se arquivos estão no Dockerfile
4. Verificar se dependências estão no `requirements.txt`

### Problema: Endpoints retornam 404

**Causa:** Endpoints não foram registrados no `app.py`

**Solução:** Verificar se as rotas estão definidas em `app.py`:
- `/auth/session/create`
- `/auth/session/refresh`
- `/auth/session/revoke`

### Problema: Erro 500 ao criar sessão

**Causas possíveis:**
1. Erro na criptografia (chave inválida)
2. Erro no armazenamento (permissões de arquivo)
3. Erro ao conectar com provider OAuth

**Solução:** Verificar logs detalhados do servidor

## ✅ Checklist de Verificação

- [ ] Script de teste executa sem erros
- [ ] Endpoint `/auth/session/create` retorna 400 (não 503) com dados inválidos
- [ ] Endpoints OPTIONS retornam 200/204
- [ ] Logs mostram "SessionManager carregado"
- [ ] Variável `TOKEN_ENCRYPTION_KEY` está configurada
- [ ] Arquivo `session_manager.py` está no deploy
- [ ] Dependências estão instaladas

## 📝 Notas

- O teste com dados inválidos é seguro e não cria sessões reais
- Os endpoints retornam 400 para dados inválidos quando o SessionManager está habilitado
- O código retorna 503 quando o SessionManager não está disponível
- Sempre verifique os logs do servidor para diagnóstico detalhado

