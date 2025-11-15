# Configurar Variáveis de Ambiente - Azure Storage

**Objetivo:** Configurar as variáveis de ambiente relacionadas ao Azure Storage no Azure App Service.

---

## 📋 Variáveis a Configurar

As seguintes variáveis devem ser configuradas no Azure App Service:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `AZURE_STORAGE_ACCOUNT` | `caracoredata` | Nome do Storage Account |
| `AZURE_RESOURCE_GROUP` | `rg-caracore` | Nome do Resource Group |
| `AZURE_STORAGE_SHARE_NAME` | `caracore-data` | Nome do File Share |
| `AZURE_STORAGE_ACCESS_TYPE` | `ManagedIdentity` | Tipo de acesso (recomendado) |
| `AZURE_STORAGE_MOUNT_PATH` | `/home/site/wwwroot/data` | Caminho de montagem |
| `AZURE_STORAGE_MOUNT_ID` | `cara-files` | ID da montagem |

**Nota:** `AZURE_STORAGE_ACCESS_KEY` não deve ser configurada quando usar Managed Identity.

---

## 🔧 Métodos de Configuração

### Método 1: Via Script Python (Recomendado) ⭐

```bash
# Configurar todas as variáveis de storage
python scripts/configure_app_settings.py --set \
  AZURE_STORAGE_ACCOUNT=caracoredata \
  AZURE_RESOURCE_GROUP=rg-caracore \
  AZURE_STORAGE_SHARE_NAME=caracore-data \
  AZURE_STORAGE_ACCESS_TYPE=ManagedIdentity \
  AZURE_STORAGE_MOUNT_PATH=/home/site/wwwroot/data \
  AZURE_STORAGE_MOUNT_ID=cara-files
```

**Ou carregar de arquivo:**

```bash
# Se você tem um arquivo secrets.txt com as variáveis
python scripts/configure_app_settings.py --file secrets.txt
```

**Verificar configuração:**

```bash
# Listar variáveis de storage
python scripts/configure_app_settings.py --list --filter STORAGE
```

---

### Método 2: Via Azure CLI

```bash
az webapp config appsettings set \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --settings \
    AZURE_STORAGE_ACCOUNT=caracoredata \
    AZURE_RESOURCE_GROUP=rg-caracore \
    AZURE_STORAGE_SHARE_NAME=caracore-data \
    AZURE_STORAGE_ACCESS_TYPE=ManagedIdentity \
    AZURE_STORAGE_MOUNT_PATH=/home/site/wwwroot/data \
    AZURE_STORAGE_MOUNT_ID=cara-files
```

**Verificar:**

```bash
az webapp config appsettings list \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --query "[?contains(name, 'STORAGE')].{Nome:name, Valor:value}" \
  --output table
```

---

### Método 3: Via Azure Portal

1. **Acesse o Azure Portal:**
   - https://portal.azure.com

2. **Navegue até o App Service:**
   - **App Services** > `caracore-backend-docker`

3. **Vá em Configuration:**
   - Menu lateral > **Configuration** > **Application settings**

4. **Adicione cada variável:**
   - Clique em **+ New application setting**
   - **Name:** `AZURE_STORAGE_ACCOUNT`
   - **Value:** `caracoredata`
   - Clique em **OK**
   - Repita para cada variável

5. **Variáveis a configurar:**
   ```
   AZURE_STORAGE_ACCOUNT = caracoredata
   AZURE_RESOURCE_GROUP = rg-caracore
   AZURE_STORAGE_SHARE_NAME = caracore-data
   AZURE_STORAGE_ACCESS_TYPE = ManagedIdentity
   AZURE_STORAGE_MOUNT_PATH = /home/site/wwwroot/data
   AZURE_STORAGE_MOUNT_ID = cara-files
   ```

6. **Salve:**
   - Clique em **Save** no topo
   - Confirme quando solicitado

---

## ✅ Verificação

### 1. Listar Variáveis Configuradas

```bash
# Via script Python
python scripts/configure_app_settings.py --list --filter STORAGE

# Via Azure CLI
az webapp config appsettings list \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --query "[?contains(name, 'STORAGE')]" \
  --output table
```

### 2. Verificar Logs

Após configurar, reinicie o App Service e verifique os logs:

```bash
# Reiniciar App Service
az webapp restart --name caracore-backend-docker --resource-group rg-caracore

# Ver logs
az webapp log tail --name caracore-backend-docker --resource-group rg-caracore
```

**Procurar por:**
- `"Detectado ambiente Azure - usando /home/site/wwwroot/data para persistência"`

---

## 🔐 Segurança

### Managed Identity (Recomendado) ⭐

**Configuração:**
- `AZURE_STORAGE_ACCESS_TYPE=ManagedIdentity`
- **NÃO** configure `AZURE_STORAGE_ACCESS_KEY` (deixe vazia ou não configure)

**Pré-requisitos:**
- Managed Identity habilitado no App Service
- Role "Storage File Data SMB Share Contributor" atribuída

### Access Key (Alternativa)

**Quando usar:**
- Managed Identity não disponível
- Desenvolvimento local
- Testes

**Configuração:**
- `AZURE_STORAGE_ACCESS_TYPE=AccessKey`
- `AZURE_STORAGE_ACCESS_KEY=<sua_access_key>` ⚠️ **SECRET**

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

## 📝 Exemplo Completo

### Carregar de Arquivo

1. **Criar arquivo `storage.env`:**
   ```bash
   AZURE_STORAGE_ACCOUNT=caracoredata
   AZURE_RESOURCE_GROUP=rg-caracore
   AZURE_STORAGE_SHARE_NAME=caracore-data
   AZURE_STORAGE_ACCESS_TYPE=ManagedIdentity
   AZURE_STORAGE_MOUNT_PATH=/home/site/wwwroot/data
   AZURE_STORAGE_MOUNT_ID=cara-files
   ```

2. **Aplicar:**
   ```bash
   python scripts/configure_app_settings.py --file storage.env
   ```

3. **Verificar:**
   ```bash
   python scripts/configure_app_settings.py --list --filter STORAGE
   ```

---

## 🔄 Atualizar Variáveis

### Atualizar Variável Específica

```bash
# Via script Python
python scripts/configure_app_settings.py --set AZURE_STORAGE_MOUNT_PATH=/home/data

# Via Azure CLI
az webapp config appsettings set \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --settings AZURE_STORAGE_MOUNT_PATH=/home/data
```

### Remover Variável

```bash
# Via script Python
python scripts/configure_app_settings.py --remove AZURE_STORAGE_ACCESS_KEY

# Via Azure CLI
az webapp config appsettings delete \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --setting-names AZURE_STORAGE_ACCESS_KEY
```

---

## 🚨 Troubleshooting

### Problema: Variáveis não aparecem após configurar

**Solução:**
1. Verifique se clicou em **Save** no Portal
2. Reinicie o App Service
3. Aguarde alguns minutos para propagação

### Problema: Script não encontra Azure CLI

**Solução:**
1. Verifique se Azure CLI está instalado: `az --version`
2. Adicione ao PATH se necessário
3. Ou use Azure Portal ou Azure CLI diretamente

### Problema: Variáveis não são lidas pela aplicação

**Solução:**
1. Verifique se os nomes estão corretos (case-sensitive)
2. Reinicie o App Service após configurar
3. Verifique logs para erros de leitura

---

## 📋 Checklist

- [ ] `AZURE_STORAGE_ACCOUNT` configurado
- [ ] `AZURE_RESOURCE_GROUP` configurado
- [ ] `AZURE_STORAGE_SHARE_NAME` configurado
- [ ] `AZURE_STORAGE_ACCESS_TYPE` configurado (ManagedIdentity ou AccessKey)
- [ ] `AZURE_STORAGE_MOUNT_PATH` configurado
- [ ] `AZURE_STORAGE_MOUNT_ID` configurado
- [ ] Se usar AccessKey: `AZURE_STORAGE_ACCESS_KEY` configurada (não commitar)
- [ ] App Service reiniciado após configuração
- [ ] Logs verificados (confirmando uso do caminho correto)
- [ ] Teste de persistência realizado

---

## 🔗 Referências

- Documentação de variáveis: `docs/VARIAVEIS_AMBIENTE_STORAGE.md`
- Script de configuração: `scripts/configure_app_settings.py`
- Configuração Managed Identity: `docs/AZURE_FILES_MANAGED_IDENTITY.md`
- Template de secrets: `secrets.txt.template`

---

**Última Atualização:** 15/11/2025  
**Status:** ✅ Documentação completa

