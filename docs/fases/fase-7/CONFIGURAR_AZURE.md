# Como Configurar Variáveis de Ambiente da Fase 7 no Azure

## 🚀 Métodos de Configuração

### Método 1: Script Python Automatizado (Recomendado) ⭐

```bash
python scripts/configure_fase7_azure.py
```

**O script irá:**

- Verificar se Azure CLI está instalado
- Verificar se você está logado no Azure
- Verificar se o App Service existe
- Solicitar valores interativamente
- Gerar `TOKEN_ENCRYPTION_KEY` automaticamente se necessário
- Configurar todas as variáveis
- Mostrar resumo da configuração
- Verificar se configuração foi aplicada

---

### Método 2: Azure CLI Manual

#### Passo 1: Gerar TOKEN_ENCRYPTION_KEY

```bash
python scripts/generate_encryption_keys.py
```

Copie o valor de `TOKEN_ENCRYPTION_KEY` exibido.

#### Passo 2: Configurar Variáveis

**Python (Recomendado):**

```bash
python scripts/configure_fase7_azure.py
```

**Ou manualmente via Azure CLI:**

**Windows (PowerShell):**

```powershell
az webapp config appsettings set `
  --name caracore-backend-docker `
  --resource-group rg-caracore `
  --settings `
    TOKEN_ENCRYPTION_KEY="<cole_aqui_a_chave_gerada>" `
    SESSION_TIMEOUT_HOURS="24" `
    MAX_SESSIONS_PER_USER="5" `
    CLEANUP_INTERVAL_HOURS="6" `
    AUDIT_LOG_RETENTION_DAYS="90"
```

**Linux/Mac (Bash):**

```bash
az webapp config appsettings set \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --settings \
    TOKEN_ENCRYPTION_KEY="<cole_aqui_a_chave_gerada>" \
    SESSION_TIMEOUT_HOURS="24" \
    MAX_SESSIONS_PER_USER="5" \
    CLEANUP_INTERVAL_HOURS="6" \
    AUDIT_LOG_RETENTION_DAYS="90"
```

#### Passo 3: Verificar Configuração

```bash
az webapp config appsettings list \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --query "[?contains(name, 'TOKEN') || contains(name, 'SESSION') || contains(name, 'CLEANUP') || contains(name, 'AUDIT')].{Nome:name, Valor:value}" \
  --output table
```

---

### Método 3: Azure Portal (Interface Gráfica)

1. **Acesse o Azure Portal:**
   - [https://portal.azure.com]

2. **Navegue até o App Service:**
   - **App Services** > **caracore-backend-docker**

3. **Vá em Configuration:**
   - Menu lateral: **Configuration** > **Application settings**

4. **Adicione cada variável:**
   - Clique em **+ New application setting**
   - **Name:** `TOKEN_ENCRYPTION_KEY`
   - **Value:** Cole a chave gerada
   - Clique em **OK**
   - Repita para cada variável

5. **Variáveis a configurar:**

```text
TOKEN_ENCRYPTION_KEY = <chave_gerada>
SESSION_TIMEOUT_HOURS = 24
MAX_SESSIONS_PER_USER = 5
CLEANUP_INTERVAL_HOURS = 6
AUDIT_LOG_RETENTION_DAYS = 90
```

6.**Salve:**

- Clique em **Save** no topo
- Confirme quando solicitado

---

## ✅ Verificação Pós-Configuração

### 1. Reiniciar App Service

```bash
az webapp restart \
  --name caracore-backend-docker \
  --resource-group rg-caracore
```

### 2. Verificar Logs

```bash
az webapp log tail \
  --name caracore-backend-docker \
  --resource-group rg-caracore
```

**Procure por estas mensagens:**

- ✅ `CryptoManager inicializado com AES-256-CBC`
- ✅ `SessionManager inicializado: timeout=24h, max_sessions=5`
- ✅ `TokenStorage inicializado`
- ✅ `CleanupService inicializado`

**Se aparecer erro:**

- ❌ `TOKEN_ENCRYPTION_KEY não configurada` → Variável não foi configurada corretamente

### 3. Testar Health Endpoint

```bash
curl https://caracore-backend-docker.azurewebsites.net/health
```

Deve retornar: `{"status":"ok"}`

---

## 🔧 Comandos Úteis

### Listar Todas as Variáveis

```bash
az webapp config appsettings list \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --output table
```

### Ver Apenas Variáveis da Fase 7

```bash
az webapp config appsettings list \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --query "[?contains(name, 'TOKEN') || contains(name, 'SESSION') || contains(name, 'CLEANUP') || contains(name, 'AUDIT')]" \
  --output table
```

### Remover uma Variável

```bash
az webapp config appsettings delete \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --setting-names VARIABLE_NAME
```

### Atualizar uma Variável

```bash
az webapp config appsettings set \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --settings VARIABLE_NAME="novo_valor"
```

---

## 🐛 Troubleshooting

### Erro: "App Service não encontrado"

**Causa:** Nome do App Service ou Resource Group incorreto

**Solução:**

```bash
# Listar todos os App Services
az webapp list --output table

# Verificar Resource Group
az group list --output table
```

### Erro: "Não está logado no Azure"

**Solução:**

```bash
az login
```

### Erro: "TOKEN_ENCRYPTION_KEY não configurada"

**Causa:** Variável não foi configurada ou valor inválido

**Solução:**

1. Verificar se variável existe:

```bash
az webapp config appsettings list \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --query "[?name=='TOKEN_ENCRYPTION_KEY']"
```

2.Se não existir, configurar novamente

3.Se existir mas com valor inválido, verificar:

- Deve ser base64-encoded
- Deve ter 32 bytes quando decodificado
- Não deve ter espaços ou quebras de linha

### Variáveis não aparecem após configurar

**Solução:**

1. Aguardar alguns segundos (propagação)
2. Reiniciar App Service:

```bash
az webapp restart --name caracore-backend-docker --resource-group rg-caracore
```

3.Verificar novamente

---

## 📋 Checklist Completo

Antes de considerar a configuração completa:

- [ ] Azure CLI instalado e atualizado
- [ ] Logado no Azure (`az login`)
- [ ] `TOKEN_ENCRYPTION_KEY` gerado com `generate_encryption_keys.py`
- [ ] Todas as variáveis configuradas no Azure
- [ ] Variáveis verificadas com `az webapp config appsettings list`
- [ ] App Service reiniciado
- [ ] Logs verificados (sem erros de configuração)
- [ ] Health endpoint respondendo corretamente
- [ ] Mensagens de inicialização aparecem nos logs

---

## 📚 Referências

- **Documentação Azure CLI:** [https://docs.microsoft.com/cli/azure/webapp/config/appsettings]
- **Variáveis da Fase 7:** `docs/fases/fase-7/VARIAVEIS_AMBIENTE.md`
- **Scripts:** `scripts/configure_fase7_azure.ps1` e `scripts/configure_fase7_azure.sh`

---

**Última Atualização:** 15/11/2025  
**Versão:** 1.0