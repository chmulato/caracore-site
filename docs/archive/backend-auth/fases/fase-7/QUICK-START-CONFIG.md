# Quick Start - Configurar Variáveis da Fase 7

## 🚀 Configuração Rápida (3 passos)

### Passo 1: Gerar Chave de Criptografia

```bash
python scripts/generate_encryption_keys.py
```

**Copie o valor de `TOKEN_ENCRYPTION_KEY`** (ou deixe o script gerar automaticamente)

### Passo 2: Executar Script de Configuração

```bash
python scripts/configure_fase7_azure.py
```

O script irá:

- ✅ Verificar se você está logado no Azure
- ✅ Solicitar valores interativamente
- ✅ Configurar todas as variáveis automaticamente
- ✅ Mostrar resumo da configuração

### Passo 3: Reiniciar e Verificar

```bash
# Reiniciar App Service
az webapp restart --name caracore-backend-docker --resource-group rg-caracore

# Verificar logs
az webapp log tail --name caracore-backend-docker --resource-group rg-caracore
```

**Procure por:**

- ✅ `CryptoManager inicializado com AES-256-CBC`
- ✅ `SessionManager inicializado: timeout=24h, max_sessions=5`

---

## 📋 Valores Padrão

Se você pressionar Enter (deixar vazio) para as configurações opcionais, serão usados:

- `SESSION_TIMEOUT_HOURS` = 24
- `MAX_SESSIONS_PER_USER` = 5
- `CLEANUP_INTERVAL_HOURS` = 6
- `AUDIT_LOG_RETENTION_DAYS` = 90

---

## ⚠️ Pré-requisitos

1. **Azure CLI instalado:**

```bash
# Verificar
az --version

# Se não tiver, instale:
# https://docs.microsoft.com/cli/azure/install-azure-cli
```

2. **Logado no Azure:**

```bash
az login
```

3. **Python 3.6+ instalado**

---

## 🐛 Problemas Comuns

### "Azure CLI não encontrado"

- Instale: [https://docs.microsoft.com/cli/azure/install-azure-cli]
- Reinicie o terminal

### "Não está logado no Azure"

```bash
az login
```

### "App Service não encontrado"

- Verifique o nome: `caracore-backend-docker`
- Verifique o resource group: `rg-caracore`
- Ou edite o script para usar seus valores

---

**Documentação Completa:** `docs/fases/fase-7/CONFIGURAR_AZURE.md`