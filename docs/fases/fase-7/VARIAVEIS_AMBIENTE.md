# Variáveis de Ambiente - Fase 7

## 📋 Resumo das Variáveis Necessárias

### ✅ Variáveis Obrigatórias (Já Implementadas)

Estas variáveis **DEVEM** ser configuradas no Azure App Service:

#### 1. Criptografia (OBRIGATÓRIO)
```bash
TOKEN_ENCRYPTION_KEY=<base64_encoded_32_byte_key>
```
- **Uso:** `backend/crypto_manager.py`
- **Geração:** `python scripts/generate_encryption_keys.py`
- **Formato:** Base64-encoded de 32 bytes (256 bits)
- **Validação:** Sistema valida automaticamente se não configurado

#### 2. Configurações de Sessão (Opcionais - têm defaults)
```bash
SESSION_TIMEOUT_HOURS=24
MAX_SESSIONS_PER_USER=5
```
- **Uso:** `backend/session_manager.py`
- **Default:** 24 horas e 5 sessões respectivamente
- **Recomendado:** Configurar explicitamente em produção

#### 3. Cleanup Service (Opcionais - têm defaults)
```bash
CLEANUP_INTERVAL_HOURS=6
AUDIT_LOG_RETENTION_DAYS=90
```
- **Uso:** `backend/cleanup_service.py`
- **Default:** 6 horas e 90 dias respectivamente
- **Recomendado:** Configurar explicitamente em produção

#### 4. Auditoria (Opcional)
```bash
AUDIT_LOG_PATH=backend/logs/token_audit.log
```
- **Uso:** `backend/token_audit.py`
- **Default:** `backend/logs/token_audit.log`
- **Opcional:** Apenas se quiser caminho customizado

### ⚠️ Variáveis Não Implementadas (Podem ser removidas do template)

Estas variáveis foram mencionadas na documentação mas **NÃO estão sendo usadas**:

```bash
# NÃO USADO - Pode ser removido do template
SESSION_SECRET_KEY=<não implementado>
```

**Nota:** `SESSION_SECRET_KEY` foi incluído no template mas não está sendo usado no código. Pode ser removido ou implementado no futuro se necessário.

### 📝 Variáveis de Rate Limiting

O sistema usa o rate limiter existente (`backend/rate_limiter.py`), que não requer variáveis de ambiente específicas da Fase 7. As configurações de rate limiting são feitas via decorators no código:

```python
@rate_limit("/auth/session/refresh")  # 10 req/min (hardcoded)
@rate_limit("/auth/session/create")   # 5 req/min (hardcoded)
```

**Recomendação:** Se quiser tornar configurável, adicionar:
```bash
RATE_LIMIT_TOKEN_REFRESH=10/minute
RATE_LIMIT_SESSION_CREATE=5/minute
```

Mas isso requer modificação no código para ler essas variáveis.

---

## 🔧 Como Configurar no Azure App Service

### Método 1: Via Azure Portal

1. Acesse: [Azure Portal](https://portal.azure.com)
2. Navegue até: **App Services** > **caracore-backend-docker**
3. Vá em: **Configuration** > **Application settings**
4. Adicione cada variável:
   - Clique em **+ New application setting**
   - Digite o nome da variável
   - Digite o valor
   - Clique em **OK**
5. Clique em **Save** no topo

### Método 2: Via Azure CLI

```powershell
# Configurar todas as variáveis da Fase 7
az webapp config appsettings set `
  --name caracore-backend-docker `
  --resource-group rg-caracore `
  --settings `
    TOKEN_ENCRYPTION_KEY="<sua_chave_base64>" `
    SESSION_TIMEOUT_HOURS="24" `
    MAX_SESSIONS_PER_USER="5" `
    CLEANUP_INTERVAL_HOURS="6" `
    AUDIT_LOG_RETENTION_DAYS="90"
```

### Método 3: Via Script PowerShell

```powershell
# Usar o script existente que lê de secrets.txt
.\scripts\configure_azure_all_settings.ps1
```

**Pré-requisito:** Ter `secrets.txt` configurado com todas as variáveis.

---

## ✅ Checklist de Configuração

Antes de fazer deploy da Fase 7, verifique:

- [ ] `TOKEN_ENCRYPTION_KEY` foi gerado e configurado
- [ ] `SESSION_TIMEOUT_HOURS` configurado (ou usando default 24)
- [ ] `MAX_SESSIONS_PER_USER` configurado (ou usando default 5)
- [ ] `CLEANUP_INTERVAL_HOURS` configurado (ou usando default 6)
- [ ] `AUDIT_LOG_RETENTION_DAYS` configurado (ou usando default 90)
- [ ] Variáveis foram testadas localmente
- [ ] Variáveis foram configuradas no Azure App Service
- [ ] Backend iniciou sem erros (verificar logs)

---

## 🧪 Como Testar

### 1. Verificar se variáveis estão configuradas

```powershell
# Listar todas as variáveis
az webapp config appsettings list `
  --name caracore-backend-docker `
  --resource-group rg-caracore `
  --query "[?contains(name, 'TOKEN') || contains(name, 'SESSION') || contains(name, 'CLEANUP') || contains(name, 'AUDIT')]" `
  --output table
```

### 2. Testar localmente

```bash
# Definir variáveis de ambiente
export TOKEN_ENCRYPTION_KEY="<sua_chave>"
export SESSION_TIMEOUT_HOURS="24"
export MAX_SESSIONS_PER_USER="5"

# Iniciar backend
cd backend
python app.py
```

### 3. Verificar logs de inicialização

```powershell
# Ver logs do Azure
az webapp log tail `
  --name caracore-backend-docker `
  --resource-group rg-caracore
```

Procure por mensagens como:
- `"CryptoManager inicializado com AES-256-CBC"`
- `"SessionManager inicializado: timeout=24h, max_sessions=5"`
- `"TokenStorage inicializado"`
- `"CleanupService inicializado"`

Se aparecer erro sobre `TOKEN_ENCRYPTION_KEY`, a variável não está configurada.

---

## 📚 Referências

- **Documentação Completa:** `docs/fases/fase-7/README.md`
- **Template de Configuração:** `secrets.txt.template`
- **Script de Geração:** `scripts/generate_encryption_keys.py`
- **Código Fonte:**
  - `backend/crypto_manager.py` - Usa `TOKEN_ENCRYPTION_KEY`
  - `backend/session_manager.py` - Usa `SESSION_TIMEOUT_HOURS`, `MAX_SESSIONS_PER_USER`
  - `backend/cleanup_service.py` - Usa `CLEANUP_INTERVAL_HOURS`, `AUDIT_LOG_RETENTION_DAYS`
  - `backend/token_audit.py` - Usa `AUDIT_LOG_PATH` (opcional)

---

**Última Atualização:** 15/11/2025  
**Versão:** 1.0

