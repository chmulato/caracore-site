# Configuração de Azure Files com Managed Identity (System Assigned)

**Objetivo:** Configurar persistência de dados no Azure App Service usando Azure Files com Managed Identity, eliminando a necessidade de armazenar Access Keys.

**Vantagens do Managed Identity:**
- ✅ Sem necessidade de gerenciar Access Keys
- ✅ Rotação automática de credenciais
- ✅ Melhor segurança (princípio de menor privilégio)
- ✅ Conformidade com melhores práticas Azure

---

## 📋 Pré-requisitos

1. Azure CLI instalado e configurado (`az login`)
2. Permissões para:
   - Configurar App Service
   - Criar/modificar Storage Account
   - Atribuir roles RBAC
3. Storage Account e File Share já criados (ou criar via Portal/script)

---

## 🔧 Configuração Completa

### Opção 1: Via Script Python (Recomendado)

```bash
python scripts/configure_azure_files_managed_identity.py
```

O script executa automaticamente:
- ✅ Habilita Managed Identity (System Assigned) no App Service
- ✅ Atribui role "Storage File Data SMB Share Contributor" ao Service Principal
- ✅ Configura Application Settings
- ✅ Reinicia o App Service

**Nota:** A montagem do volume pode precisar ser configurada manualmente via Portal (veja Opção 2).

---

### Opção 2: Via Portal Azure (Passo a Passo)

#### Passo 1: Habilitar Managed Identity no App Service

1. Acesse: [Azure Portal](https://portal.azure.com)
2. Navegue até: **App Services** > `{appName}` (ex: `caracore-backend-docker`)
3. No menu lateral, vá em **Identity**
4. Na aba **System assigned**, altere **Status** para **On**
5. Clique em **Save**
6. **Anote o Principal ID** que será exibido (será usado no Passo 3)

**Resultado esperado:**
```
Status: On
Principal ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

#### Passo 2: Verificar/Criar Storage Account e File Share

1. Navegue até: **Storage accounts** > `{storageAccount}`
2. Vá em **Data storage** > **File shares**
3. Verifique se o File Share `{fileShare}` existe
4. Se não existir, clique em **+ File share**:
   - **Name:** `{fileShare}` (ex: `caracore-data`)
   - **Quota:** 5 GB (suficiente para dados JSON)
   - Clique em **Create**

---

#### Passo 3: Atribuir Role ao Managed Identity

**Via Portal (Recomendado):**

1. No Storage Account, vá em **Access control (IAM)**
2. Clique em **+ Add** > **Add role assignment**
3. Preencha:
   - **Role:** `Storage File Data SMB Share Contributor`
   - **Assign access to:** Managed identity
   - **Members:** Selecione o App Service `{appName}`
4. Clique em **Review + assign**

**Via Azure CLI:**

```bash
# Obter Principal ID do App Service
PRINCIPAL_ID=$(az webapp identity show \
  --name {appName} \
  --resource-group {resourceGroup} \
  --query principalId -o tsv)

# Obter Resource ID do Storage Account
STORAGE_ID=$(az storage account show \
  --name {storageAccount} \
  --resource-group {resourceGroup} \
  --query id -o tsv)

# Atribuir role
az role assignment create \
  --assignee-object-id $PRINCIPAL_ID \
  --assignee-principal-type ServicePrincipal \
  --role "Storage File Data SMB Share Contributor" \
  --scope $STORAGE_ID
```

---

#### Passo 4: Configurar Montagem no App Service

1. Navegue até: **App Services** > `{appName}` > **Configuration**
2. Vá na aba **Path mappings**
3. Clique em **+ Add Azure Storage Mount**
4. Preencha o formulário:
   - **Name:** `{mountId}` (ex: `cara-files`)
   - **Storage type:** `Azure Files`
   - **Storage account:** Selecione `{storageAccount}`
   - **File share:** Selecione `{fileShare}`
   - **Access type:** **Identity (System Assigned)** ⚠️ **IMPORTANTE**
   - **Mount path:** `/home/site/wwwroot/data`
5. Clique em **OK**
6. Clique em **Save** no topo da página
7. **IMPORTANTE:** O App Service será reiniciado automaticamente

**⚠️ Atenção:** Certifique-se de selecionar **"Identity (System Assigned)"** e não "Access Key"!

---

#### Passo 5: Configurar Application Settings

1. No App Service, vá em **Configuration** > **Application settings**
2. Clique em **+ New application setting** e adicione:

   **Setting 1:**
   - **Name:** `SESSION_DATA_FILE`
   - **Value:** `/home/site/wwwroot/data/user_sessions.json`

   **Setting 2:**
   - **Name:** `WEBSITES_ENABLE_APP_SERVICE_STORAGE`
   - **Value:** `true`

3. Clique em **Save**
4. Se solicitado, reinicie o App Service

---

## ✅ Validação

### 1. Via Script Python

```bash
python scripts/validate_azure_files.py \
  --app-name {appName} \
  --resource-group {resourceGroup} \
  --storage-account {storageAccount} \
  --share-name {fileShare} \
  --mount-path /home/site/wwwroot/data \
  --save-report deploy_temp/azure_files_validation_{ts}.json
```

O script valida:
- ✅ Storage Account existe
- ✅ File Share existe
- ✅ Managed Identity habilitado
- ✅ Role assignment configurado
- ✅ Montagem configurada
- ✅ Application Settings configuradas

---

### 2. Via SSH no App Service

```bash
# Conectar via SSH
az webapp ssh --name {appName} --resource-group {resourceGroup}

# Dentro do shell:
ls -la /home/site/wwwroot/data

# Criar arquivo de teste
echo "persist-test-$(date +%s)" > /home/site/wwwroot/data/validate_persist.txt
cat /home/site/wwwroot/data/validate_persist.txt

# Sair do SSH
exit

# Reiniciar App Service
az webapp restart --name {appName} --resource-group {resourceGroup}

# Conectar novamente
az webapp ssh --name {appName} --resource-group {resourceGroup}

# Verificar se arquivo ainda existe (persistência)
cat /home/site/wwwroot/data/validate_persist.txt

# Limpar arquivo de teste
rm /home/site/wwwroot/data/validate_persist.txt
exit
```

**Resultado esperado:** O arquivo deve existir após o reinício, confirmando que a persistência está funcionando.

---

### 3. Via Endpoint de Health (se disponível)

```powershell
# PowerShell
Invoke-WebRequest -Uri "https://{appName}.azurewebsites.net/health/storage" -UseBasicParsing

# Ou via curl
curl https://{appName}.azurewebsites.net/health/storage
```

---

## 🔍 Verificação de Logs

Após a configuração, verifique os logs do App Service:

**Azure Portal:**
1. App Service > **Log stream**
2. Procure por: `"Detectado ambiente Azure - usando /home/site/wwwroot/data para persistência"`

**Ou via CLI:**
```bash
az webapp log tail --name {appName} --resource-group {resourceGroup}
```

---

## 🚨 Troubleshooting

### Problema: Montagem não aparece no App Service

**Causa:** Montagem não foi salva corretamente

**Solução:**
1. Verifique se clicou em **Save** após adicionar a montagem
2. Verifique se o App Service foi reiniciado
3. Tente remover e recriar a montagem

---

### Problema: Erro de permissão ao acessar File Share

**Causa:** Role não foi atribuída corretamente

**Solução:**
1. Verifique se Managed Identity está habilitado
2. Verifique se role "Storage File Data SMB Share Contributor" foi atribuída
3. Aguarde alguns minutos após atribuir a role (propagação)

```bash
# Verificar role assignments
az role assignment list \
  --assignee {principalId} \
  --scope {storageAccountId} \
  --output table
```

---

### Problema: Access type não mostra "Identity"

**Causa:** Managed Identity não está habilitado ou Portal não atualizou

**Solução:**
1. Verifique se Managed Identity está habilitado (Identity > System assigned: On)
2. Recarregue a página do Portal
3. Tente configurar a montagem novamente

---

### Problema: Dados ainda são perdidos após deploy

**Causa:** App está usando caminho incorreto ou montagem não está ativa

**Solução:**
1. Verifique se o mount path está correto: `/home/site/wwwroot/data`
2. Verifique logs para confirmar qual diretório está sendo usado
3. Verifique se Application Settings estão configuradas
4. Reinicie o App Service

---

## 📊 Estrutura de Dados

Após a configuração, os dados serão salvos em:

```
/home/site/wwwroot/data/
├── authorized_users.json      # Usuários e solicitações
├── user_sessions.json          # Sessões de usuários (se configurado)
└── backups/                    # Backups automáticos
    ├── authorized_users_20251115_120000.json
    └── ...
```

---

## 🔄 Migração de Dados Existentes

Se você já tem dados no container atual:

### Via SSH

```bash
# Conectar via SSH
az webapp ssh --name {appName} --resource-group {resourceGroup}

# Copiar dados existentes
cp /app/data/authorized_users.json /home/site/wwwroot/data/ 2>/dev/null || true
mkdir -p /home/site/wwwroot/data/backups
cp -r /app/data/backups/* /home/site/wwwroot/data/backups/ 2>/dev/null || true

exit
```

### Via Script Python

```bash
python backend/migrate_to_persistent_storage.py
```

---

## 💰 Custos

**Azure Files (Standard LRS):**
- Primeiros 5 GB: ~$0.06/mês
- Cada GB adicional: ~$0.06/mês
- **Estimativa para este projeto:** < $0.10/mês

**Managed Identity:**
- ✅ **Gratuito** (sem custos adicionais)

---

## 📝 Notas Importantes

1. **Backup Automático:** O sistema já cria backups automáticos em `/home/site/wwwroot/data/backups/`
2. **Compatibilidade:** O código detecta automaticamente se está em Azure ou local
3. **Fallback:** Se `/home/site/wwwroot/data` não existir, usa diretório local (desenvolvimento)
4. **Performance:** Azure Files tem latência baixa (< 10ms) para operações de leitura/escrita
5. **Segurança:** Managed Identity elimina a necessidade de armazenar Access Keys

---

## 🔗 Referências

- [Azure Files Documentation](https://docs.microsoft.com/en-us/azure/storage/files/)
- [Mount Azure Files in Web App](https://docs.microsoft.com/en-us/azure/app-service/configure-connect-to-azure-storage)
- [Managed Identity for App Service](https://docs.microsoft.com/en-us/azure/app-service/overview-managed-identity)
- [Azure Storage Pricing](https://azure.microsoft.com/en-us/pricing/details/storage/files/)

---

## 📋 Checklist de Configuração

- [ ] Managed Identity habilitado no App Service
- [ ] Storage Account criado
- [ ] File Share criado
- [ ] Role "Storage File Data SMB Share Contributor" atribuída
- [ ] Montagem configurada com Access type "Identity (System Assigned)"
- [ ] Application Settings configuradas:
  - [ ] `SESSION_DATA_FILE=/home/site/wwwroot/data/user_sessions.json`
  - [ ] `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true`
- [ ] App Service reiniciado
- [ ] Logs verificados (confirmando uso de `/home/site/wwwroot/data`)
- [ ] Teste de persistência realizado (arquivo criado antes e depois do reinício)

---

**Última Atualização:** 15/11/2025  
**Status:** ✅ Documentação completa  
**Responsável:** Equipe Cara Core

