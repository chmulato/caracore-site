# Como Ativar a Fase 7 - Sistema de Refresh Tokens

## 📋 Status Atual

A Fase 7 está **✅ CONCLUÍDA E ATIVA EM PRODUÇÃO**:

✅ **Componentes Backend:**
- `crypto_manager.py` - Criptografia AES-256-CBC ✅
- `token_storage.py` - Armazenamento seguro ✅
- `session_manager.py` - Gerenciamento de sessões ✅
- `token_audit.py` - Auditoria ✅
- Endpoints REST (`/auth/session/create`, `/auth/session/refresh`, `/auth/session/revoke`) ✅
- Dependências instaladas (`cryptography`, `flask-limiter`, `python-dateutil`) ✅

✅ **Componentes Frontend:**
- `token-manager.js` - Gerenciamento de sessões ✅
- Integração com `oidc-callback-microsoft.js` e `oidc-callback-google.js` ✅
- Criação automática de sessão após login ✅

✅ **Configuração:**
- `TOKEN_ENCRYPTION_KEY` configurada no Azure App Service ✅
- Sistema validado e funcionando em produção ✅
- Logs confirmam: "SessionManager carregado - sistema de refresh tokens habilitado" ✅

📝 **Opcional (Futuro):**
- Configurar cleanup automático (opcional)

---

## 🚀 Passos para Ativar a Fase 7

### 1. Gerar Chave de Criptografia

A chave de criptografia é **obrigatória** para o sistema funcionar. Execute:

```bash
cd scripts
python generate_encryption_keys.py
```

Isso gerará uma chave base64-encoded de 32 bytes (256 bits) para AES-256.

**Exemplo de saída:**
```
🔐 Gerando chaves de criptografia para Fase 7...
✅ Chave de criptografia gerada:
TOKEN_ENCRYPTION_KEY=<REPLACE_WITH_BASE64_32BYTE_KEY>
```

### 2. Configurar Variável de Ambiente

#### Opção A: Azure App Service (Produção)

1. Acesse o Azure Portal
2. Vá em **App Services** > Seu App > **Configuration** > **Application settings**
3. Adicione:
   ```
   TOKEN_ENCRYPTION_KEY=<chave_gerada>
   ```
4. Clique em **Save** e reinicie o App Service

#### Opção B: Arquivo `.env` (Desenvolvimento Local)

Adicione ao arquivo `.env` na raiz do projeto:

```bash
TOKEN_ENCRYPTION_KEY=<REPLACE_WITH_BASE64_32BYTE_KEY>
```

⚠️ **IMPORTANTE:** NUNCA commite a chave real no Git! Use `secrets.txt.template` como referência.

### 3. Atualizar `secrets.txt.template`

Adicione a variável ao template:

```bash
# FASE 7 - SISTEMA DE REFRESH TOKENS
TOKEN_ENCRYPTION_KEY=your_32_byte_base64_encoded_key_here
```

### 4. Verificar Dependências

As dependências já estão no `requirements.txt`:

```txt
cryptography>=41.0.0      # Criptografia AES-256
flask-limiter>=3.5.0      # Rate limiting
python-dateutil>=2.8.2    # Manipulação de datas
```

Certifique-se de que estão instaladas:

```bash
cd backend
pip install -r requirements.txt
```

### 5. Verificar se SessionManager Está Habilitado

O sistema detecta automaticamente se o `SessionManager` está disponível. Verifique os logs do backend:

```
SessionManager carregado - sistema de refresh tokens habilitado
```

Se aparecer:
```
session_manager não disponível - sistema de refresh tokens desabilitado
```

Verifique:
- Se `crypto_manager.py`, `token_storage.py` e `session_manager.py` existem
- Se `TOKEN_ENCRYPTION_KEY` está configurada
- Se as dependências estão instaladas

### 6. Testar o Sistema

#### Teste Manual:

1. **Fazer login** com Google ou Microsoft
2. **Verificar no console do navegador:**
   ```
   [OAuth Callback] Criando sessão no backend (Fase 7)...
   [OAuth Callback] ✅ Sessão criada com sucesso no backend
   [TokenManager] Sessão inicializada: sess_abc123...
   ```

3. **Verificar no backend:**
   - Arquivo `backend/data/user_sessions.json` deve ser criado
   - Deve conter uma entrada com `session_id` e `refresh_token_encrypted`

4. **Aguardar expiração do token** (ou forçar):
   - O `TokenManager` deve renovar automaticamente 5 minutos antes de expirar
   - Verificar logs: `[TokenManager] Tokens renovados com sucesso`

#### Teste via API:

```bash
# Criar sessão (após login OAuth)
curl -X POST https://caracore-backend-docker.azurewebsites.net/auth/session/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_data": {
      "email": "test@example.com",
      "name": "Test User",
      "provider": "google",
      "user_id": "google_123"
    },
    "tokens": {
      "access_token": "eyJ...",
      "id_token": "eyJ...",
      "refresh_token": "1//...",
      "expires_in": 3600
    }
  }'

# Renovar tokens
curl -X POST https://caracore-backend-docker.azurewebsites.net/auth/session/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "sess_abc123..."
  }'
```

---

## 🔍 Verificação de Funcionamento

### Logs do Backend

Procure por estas mensagens nos logs:

✅ **Sucesso:**
```
SessionManager carregado - sistema de refresh tokens habilitado
Sessão criada: sess_abc123... para user@example.com (google)
Tokens renovados para sessão: sess_abc123...
```

❌ **Erro:**
```
TOKEN_ENCRYPTION_KEY não configurada
Erro ao inicializar CryptoManager: ...
```

### Arquivo de Sessões

Verifique se o arquivo `backend/data/user_sessions.json` está sendo criado:

```json
{
  "version": "1.0",
  "encryption_algorithm": "AES-256-CBC",
  "sessions": {
    "sess_abc123...": {
      "email": "user@example.com",
      "provider": "google",
      "refresh_token_encrypted": "...",
      "encryption_iv": "...",
      "status": "active"
    }
  }
}
```

### Console do Navegador

Após login, você deve ver:

```
[OAuth Callback] Criando sessão no backend (Fase 7)...
[TokenManager] Sessão criada após login OAuth
[TokenManager] Sessão inicializada: sess_abc123...
[TokenManager] Renovação agendada em 3300s (expira em 3600s)
```

---

## ⚙️ Configurações Opcionais

### Variáveis de Ambiente Adicionais

```bash
# Tempo de expiração da sessão (horas)
SESSION_TIMEOUT_HOURS=24

# Máximo de sessões por usuário
MAX_SESSIONS_PER_USER=5

# Intervalo de limpeza automática (horas)
CLEANUP_INTERVAL_HOURS=6
```

### Rate Limiting

Os endpoints já têm rate limiting configurado:
- `/auth/session/create`: 5 req/min
- `/auth/session/refresh`: 10 req/min
- `/auth/session/revoke`: 5 req/min

---

## 🐛 Troubleshooting

### Erro: "TOKEN_ENCRYPTION_KEY não configurada"

**Solução:**
1. Execute `python scripts/generate_encryption_keys.py`
2. Copie a chave gerada
3. Configure como variável de ambiente (Azure Portal ou `.env`)

### Erro: "session_manager não disponível"

**Solução:**
1. Verifique se os arquivos existem: `backend/crypto_manager.py`, `backend/token_storage.py`, `backend/session_manager.py`
2. Verifique se as dependências estão instaladas: `pip install cryptography python-dateutil`
3. Verifique se `TOKEN_ENCRYPTION_KEY` está configurada

### Sessão não é criada após login

**Solução:**
1. Verifique se `token-manager.js` está carregado na página de callback
2. Verifique se há `refresh_token` na resposta OAuth
3. Verifique o console do navegador para erros
4. Verifique se o endpoint `/auth/session/create` está acessível

### Tokens não são renovados automaticamente

**Solução:**
1. Verifique se `TokenManager` está inicializado: `window.tokenManager`
2. Verifique se há `session_id` salvo: `localStorage.getItem('cara_core_session_id')`
3. Verifique se o timer está agendado (console do navegador)
4. Verifique se o endpoint `/auth/session/refresh` está acessível

---

## 📊 Monitoramento

### Métricas Importantes

- **Taxa de criação de sessões:** Número de sessões criadas por dia
- **Taxa de renovação:** Sucesso vs. falha em renovações
- **Sessões ativas:** Número de sessões ativas no momento
- **Sessões expiradas:** Limpeza automática funcionando

### Logs de Auditoria

Os logs de auditoria são salvos automaticamente em:
- `backend/logs/token_audit.log` (se configurado)
- Logs do Azure App Service

---

## ✅ Checklist de Ativação

- [ ] Chave de criptografia gerada
- [ ] `TOKEN_ENCRYPTION_KEY` configurada no Azure Portal ou `.env`
- [ ] Dependências instaladas (`cryptography`, `python-dateutil`)
- [ ] `token-manager.js` carregado na página de callback
- [ ] Teste de login bem-sucedido
- [ ] Sessão criada no backend (verificar `user_sessions.json`)
- [ ] Renovação automática funcionando (aguardar ou forçar)
- [ ] Logs verificados (sem erros)

---

## 🎯 Próximos Passos Após Ativação

1. **Monitorar logs** por 24-48 horas
2. **Verificar métricas** de renovação
3. **Testar cenários de falha** (token expirado, refresh token inválido)
4. **Configurar cleanup automático** (opcional, via cron job ou scheduler)
5. **Documentar** qualquer comportamento inesperado

---

**Última atualização:** 15/11/2025  
**Status:** Pronto para ativação (após configurar chave de criptografia)


