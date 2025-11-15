# Variáveis de Ambiente - Azure Storage

**Objetivo:** Documentar as variáveis de ambiente relacionadas ao Azure Storage para persistência de dados.

---

## 📋 Variáveis Disponíveis

### Configuração Básica

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|--------|-------------|
| `AZURE_STORAGE_ACCOUNT` | Nome do Storage Account | `caracoredata` | Não |
| `AZURE_RESOURCE_GROUP` | Nome do Resource Group | `rg-caracore` | Não |
| `AZURE_STORAGE_SHARE_NAME` | Nome do File Share | `caracore-data` | Não |
| `AZURE_STORAGE_MOUNT_PATH` | Caminho de montagem no App Service | `/home/site/wwwroot/data` | Não |
| `AZURE_STORAGE_MOUNT_ID` | ID/Nome da montagem | `cara-files` | Não |

### Autenticação

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|--------|-------------|
| `AZURE_STORAGE_ACCESS_KEY` | Access Key do Storage Account | (vazio) | Não* |
| `AZURE_STORAGE_ACCESS_TYPE` | Tipo de acesso (`AccessKey` ou `ManagedIdentity`) | `ManagedIdentity` | Não |

**Nota:** `AZURE_STORAGE_ACCESS_KEY` é obrigatória apenas se `AZURE_STORAGE_ACCESS_TYPE=AccessKey`. Para Managed Identity, deixe vazia.

---

## 🔧 Como Usar

### Opção 1: Variáveis de Ambiente do Sistema

```bash
# Linux/macOS
export AZURE_STORAGE_ACCOUNT=caracoredata
export AZURE_RESOURCE_GROUP=rg-caracore
export AZURE_STORAGE_SHARE_NAME=caracore-data
export AZURE_STORAGE_ACCESS_TYPE=ManagedIdentity

# Windows PowerShell
$env:AZURE_STORAGE_ACCOUNT="caracoredata"
$env:AZURE_RESOURCE_GROUP="rg-caracore"
$env:AZURE_STORAGE_SHARE_NAME="caracore-data"
$env:AZURE_STORAGE_ACCESS_TYPE="ManagedIdentity"
```

### Opção 2: Arquivo `.env` (Desenvolvimento Local)

Crie um arquivo `.env` na raiz do projeto:

```bash
AZURE_STORAGE_ACCOUNT=caracoredata
AZURE_RESOURCE_GROUP=rg-caracore
AZURE_STORAGE_SHARE_NAME=caracore-data
AZURE_STORAGE_ACCESS_TYPE=ManagedIdentity
# AZURE_STORAGE_ACCESS_KEY=  # Deixe vazio para Managed Identity
```

### Opção 3: Azure App Service (Produção)

Configure via Azure Portal ou Azure CLI:

```bash
# Via Azure CLI
az webapp config appsettings set \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --settings \
    AZURE_STORAGE_ACCOUNT=caracoredata \
    AZURE_RESOURCE_GROUP=rg-caracore \
    AZURE_STORAGE_SHARE_NAME=caracore-data \
    AZURE_STORAGE_ACCESS_TYPE=ManagedIdentity
```

**Via Portal Azure:**
1. App Services > `caracore-backend-docker` > **Configuration** > **Application settings**
2. Clique em **+ New application setting**
3. Adicione cada variável
4. Clique em **Save**

---

## 🔐 Segurança

### Managed Identity (Recomendado) ⭐

**Vantagens:**
- ✅ Sem necessidade de gerenciar Access Keys
- ✅ Rotação automática de credenciais
- ✅ Melhor segurança (princípio de menor privilégio)
- ✅ Conformidade com melhores práticas Azure

**Configuração:**
```bash
AZURE_STORAGE_ACCESS_TYPE=ManagedIdentity
# Deixe AZURE_STORAGE_ACCESS_KEY vazio
```

**Pré-requisitos:**
- Managed Identity habilitado no App Service
- Role "Storage File Data SMB Share Contributor" atribuída

### Access Key (Alternativa)

**Quando usar:**
- Managed Identity não disponível
- Desenvolvimento local
- Testes

**Configuração:**
```bash
AZURE_STORAGE_ACCESS_TYPE=AccessKey
AZURE_STORAGE_ACCESS_KEY=sua_access_key_aqui
```

**⚠️ IMPORTANTE:**
- Nunca commite Access Keys no repositório
- Use Azure Key Vault para armazenar em produção
- Rotacione as chaves regularmente

**Obter Access Key:**
```bash
az storage account keys list \
  --account-name caracoredata \
  --resource-group rg-caracore \
  --query "[0].value" \
  -o tsv
```

---

## 📝 Exemplos de Uso

### Scripts Python

Os scripts Python já suportam essas variáveis:

```bash
# Usando variáveis de ambiente
export AZURE_STORAGE_ACCOUNT=meu-storage
python scripts/configure_azure_files_managed_identity.py

# Ou via linha de comando (se o script suportar)
python scripts/configure_azure_files_managed_identity.py \
  --storage-account meu-storage \
  --resource-group meu-rg
```

### Validação

```bash
# Usando variáveis de ambiente
export AZURE_STORAGE_ACCOUNT=caracoredata
export AZURE_RESOURCE_GROUP=rg-caracore
export AZURE_STORAGE_SHARE_NAME=caracore-data

python scripts/validate_azure_files.py \
  --use-env \
  --app-name caracore-backend-docker
```

---

## 🔄 Compatibilidade com Variáveis Antigas

Os scripts também suportam as variáveis antigas para compatibilidade:

| Variável Antiga | Variável Nova | Status |
|-----------------|---------------|--------|
| `AZ_RESOURCE_GROUP` | `AZURE_RESOURCE_GROUP` | ✅ Suportado |
| `AZ_STORAGE_ACCOUNT` | `AZURE_STORAGE_ACCOUNT` | ✅ Suportado |
| `AZ_SHARE_NAME` | `AZURE_STORAGE_SHARE_NAME` | ✅ Suportado |
| `AZ_MOUNT_PATH` | `AZURE_STORAGE_MOUNT_PATH` | ✅ Suportado |
| `AZ_MOUNT_ID` | `AZURE_STORAGE_MOUNT_ID` | ✅ Suportado |

**Ordem de precedência:**
1. Variável nova (`AZURE_*`)
2. Variável antiga (`AZ_*`)
3. Valor padrão

---

## 📋 Checklist de Configuração

### Para Managed Identity:

- [ ] Managed Identity habilitado no App Service
- [ ] Role "Storage File Data SMB Share Contributor" atribuída
- [ ] `AZURE_STORAGE_ACCESS_TYPE=ManagedIdentity` configurado
- [ ] `AZURE_STORAGE_ACCESS_KEY` deixado vazio ou não configurado
- [ ] Storage Account e File Share existem
- [ ] Montagem configurada via Portal com "Identity (System Assigned)"

### Para Access Key:

- [ ] Access Key obtida do Storage Account
- [ ] `AZURE_STORAGE_ACCESS_TYPE=AccessKey` configurado
- [ ] `AZURE_STORAGE_ACCESS_KEY` configurado (não commitar no repositório)
- [ ] Storage Account e File Share existem
- [ ] Montagem configurada via Portal com "Access Key"

---

## 🔗 Referências

- Documentação completa: `docs/AZURE_FILES_MANAGED_IDENTITY.md`
- Template de secrets: `secrets.txt.template`
- Scripts de configuração: `scripts/configure_azure_files*.py`

---

**Última Atualização:** 15/11/2025  
**Status:** ✅ Documentação completa

