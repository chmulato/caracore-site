# Status da Configuração - Managed Identity

**Data:** 15/11/2025  
**Status:** ⚠️ Parcialmente Configurado - Requer Ação Manual no Portal

---

## ✅ O que já foi configurado:

1. **Managed Identity habilitado** ✅
   - Principal ID: `8d25f168-910b-4f75-93fb-5d355e77f391`
   - Tipo: System Assigned

2. **Role atribuída** ✅
   - Role: `Storage File Data SMB Share Contributor`
   - Scope: Storage Account `caracoredata`

3. **Application Settings configuradas** ✅
   - `SESSION_DATA_FILE=/home/site/wwwroot/data/user_sessions.json`
   - `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true`

4. **Storage Account e File Share** ✅
   - Storage Account: `caracoredata`
   - File Share: `caracore-data`

5. **Montagem configurada** ⚠️
   - Nome: `data-storage`
   - Mount Path: `/home/site/wwwroot/data`
   - **Problema:** Ainda usando Access Key (não Managed Identity)

---

## ⚠️ O que precisa ser feito:

### Configurar Montagem com Managed Identity via Portal Azure

**IMPORTANTE:** O Azure CLI não suporta diretamente a configuração de montagem com Managed Identity. É necessário fazer via Portal.

#### Passo a Passo:

1. **Acesse o Azure Portal:**
   - https://portal.azure.com

2. **Navegue até o App Service:**
   - **App Services** > `caracore-backend-docker`

3. **Vá em Configuration:**
   - Menu lateral > **Configuration**
   - Aba **Path mappings**

4. **Edite a montagem existente:**
   - Clique na montagem `data-storage`
   - Ou remova e crie uma nova

5. **Configure com Managed Identity:**
   - **Name:** `data-storage` (ou `cara-files`)
   - **Storage type:** `Azure Files`
   - **Storage account:** `caracoredata`
   - **File share:** `caracore-data`
   - **Access type:** ⚠️ **Selecione "Identity (System Assigned)"** (NÃO "Access Key")
   - **Mount path:** `/home/site/wwwroot/data`

6. **Salve e aguarde reinício:**
   - Clique em **Save**
   - O App Service será reiniciado automaticamente

---

## ✅ Validação após Configuração:

### 1. Verificar Montagem:

```bash
az webapp config storage-account list \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  -o json
```

**Resultado esperado:** `accessKey` deve ser `null` ou não aparecer.

### 2. Verificar Logs:

```bash
az webapp log tail \
  --name caracore-backend-docker \
  --resource-group rg-caracore
```

**Procurar por:**
- `"Detectado ambiente Azure - usando /home/site/wwwroot/data para persistência"`

### 3. Testar Persistência via SSH:

```bash
# Conectar via SSH
az webapp ssh --name caracore-backend-docker --resource-group rg-caracore

# Dentro do shell:
ls -la /home/site/wwwroot/data
echo "persist-test-$(date +%s)" > /home/site/wwwroot/data/validate_persist.txt
cat /home/site/wwwroot/data/validate_persist.txt
exit

# Reiniciar App Service
az webapp restart --name caracore-backend-docker --resource-group rg-caracore

# Conectar novamente
az webapp ssh --name caracore-backend-docker --resource-group rg-caracore

# Verificar se arquivo ainda existe
cat /home/site/wwwroot/data/validate_persist.txt

# Limpar arquivo de teste
rm /home/site/wwwroot/data/validate_persist.txt
exit
```

---

## 📋 Checklist Final:

- [x] Managed Identity habilitado
- [x] Role "Storage File Data SMB Share Contributor" atribuída
- [x] Application Settings configuradas
- [x] Storage Account e File Share existem
- [ ] **Montagem configurada com Managed Identity (via Portal)** ⚠️
- [ ] Logs verificados (confirmando uso de `/home/site/wwwroot/data`)
- [ ] Teste de persistência realizado

---

## 🔗 Referências:

- Documentação completa: `docs/AZURE_FILES_MANAGED_IDENTITY.md`
- Guia rápido: `docs/QUICK_START_PERSISTENT_STORAGE.md`

---

**Próximo Passo:** Configurar a montagem via Portal Azure conforme instruções acima.

