# Passo a Passo - Configuração de Persistência

**Status Atual:** ⚠️ Código pronto, mas Azure Files precisa ser configurado via Portal

---

## 📊 Situação Atual

✅ **Código atualizado** - Pronto para usar `/home/data` quando disponível  
⚠️ **Azure Files** - Ainda não configurado (logs mostram uso de `/app/data`)  
✅ **Web App funcionando** - Sistema operacional

**Logs atuais mostram:**
```
INFO:authorization:Authorization module - DATA_DIR: /app/data
INFO:authorization:Authorization module - AUTHORIZED_USERS_FILE: /app/data/authorized_users.json
```

**Após configurar Azure Files, deve mostrar:**
```
INFO:authorization:Detectado ambiente Azure - usando /home/data para persistência
INFO:authorization:Authorization module - DATA_DIR: /home/data
```

---

## ✅ Passo 1: Configurar Azure Files via Portal

**Problema:** Assinatura Azure não acessível via CLI

**Solução:** Configurar manualmente via Portal Azure

### Instruções Detalhadas:

1. **Acesse o Portal Azure:**
   - https://portal.azure.com
   - Faça login com sua conta

2. **Criar Storage Account:**
   - Clique em **+ Criar um recurso**
   - Busque por **Storage account**
   - Clique em **Criar**
   - Preencha:
     - **Subscription:** Assinatura do Azure 1
     - **Resource Group:** `rg-caracore`
     - **Storage account name:** `caracoredata` (ou outro nome único)
     - **Region:** Brazil South
     - **Performance:** Standard
     - **Redundancy:** LRS
   - Clique em **Revisar + criar** > **Criar**
   - Aguarde criação (1-2 minutos)

3. **Criar File Share:**
   - No Storage Account criado, vá em **Data storage** > **File shares**
   - Clique em **+ File share**
   - **Name:** `caracore-data`
   - **Quota:** 5 GB
   - Clique em **Criar**

4. **Configurar Montagem no Web App:**
   - Azure Portal > **App Services** > `caracore-backend-docker`
   - Menu lateral > **Configuration** > **Path mappings**
   - Clique em **+ New Azure Storage Mount**
   - Preencha:
     - **Name:** `data-storage`
     - **Storage type:** Azure Files
     - **Storage account:** Selecione o storage account criado
     - **Storage container:** Selecione `caracore-data`
     - **Mount path:** `/home/data`
     - **Access key:** Selecione **Key1**
   - Clique em **OK**
   - Clique em **Save** (topo da página)
   - **O Web App será reiniciado automaticamente**

**Tempo estimado:** 10-15 minutos

**Guia completo:** `docs/CONFIGURAR_AZURE_FILES_PORTAL.md`

---

## ✅ Passo 2: Deploy do Código

**Status:** Código já está pronto, mas precisa ser commitado

### Executar:

```powershell
# Adicionar arquivos
git add backend/authorization.py backend/migrate_to_persistent_storage.py docs/ scripts/

# Commit
git commit -m "feat: adicionar suporte a armazenamento persistente Azure Files

- Detecção automática de ambiente Azure
- Uso de /home/data quando Azure Files está montado
- Fallback para /app/data em desenvolvimento
- Scripts de configuração e migração
- Documentação completa"

# Push (dispara deploy automático)
git push origin main
```

**Aguardar deploy:** 5-10 minutos (GitHub Actions)

**Verificar deploy:**
- GitHub > Actions > Verificar se workflow executou com sucesso

---

## ✅ Passo 3: Migrar Dados Existentes

**Quando:** Após configurar Azure Files (Passo 1) e fazer deploy (Passo 2)

### Via SSH no Azure Portal:

1. **Conectar:**
   - Azure Portal > App Services > `caracore-backend-docker` > **SSH**

2. **Executar migração:**
   ```bash
   python3 -c "
   import json, shutil
   from pathlib import Path
   old = Path('/app/data/authorized_users.json')
   new = Path('/home/data/authorized_users.json')
   if old.exists() and not new.exists():
       Path('/home/data').mkdir(parents=True, exist_ok=True)
       shutil.copy(old, new)
       print('✅ Dados migrados com sucesso!')
       print(f'   De: {old}')
       print(f'   Para: {new}')
   else:
       print('ℹ️ Nenhum dado para migrar ou já migrado')
   "
   ```

3. **Verificar:**
   ```bash
   ls -la /home/data/
   cat /home/data/authorized_users.json
   ```

**Tempo estimado:** 2-3 minutos

---

## ✅ Passo 4: Verificar nos Logs

### Opção A: Via Portal Azure

1. Azure Portal > App Services > `caracore-backend-docker` > **Log stream**
2. Procurar por: `"Detectado ambiente Azure - usando /home/data para persistência"`

### Opção B: Via Script PowerShell

```powershell
.\scripts\verify_persistent_storage.ps1
```

### Opção C: Via Azure CLI

```powershell
az webapp log tail --resource-group rg-caracore --name caracore-backend-docker | Select-String "home/data"
```

### O que procurar:

**✅ Sucesso:**
```
INFO:authorization:Detectado ambiente Azure - usando /home/data para persistência
INFO:authorization:Authorization module - DATA_DIR: /home/data
INFO:authorization:Authorization module - AUTHORIZED_USERS_FILE: /home/data/authorized_users.json
```

**❌ Ainda não configurado:**
```
INFO:authorization:Authorization module - DATA_DIR: /app/data
```

**Tempo estimado:** 1-2 minutos

---

## 🧪 Teste Final de Persistência

Após completar todos os passos:

1. **Criar uma solicitação de acesso** (via formulário de primeiro acesso)
2. **Fazer um deploy** (qualquer mudança no código)
3. **Verificar se os dados ainda estão presentes:**
   ```bash
   # Via SSH
   cat /home/data/authorized_users.json | python3 -m json.tool | grep -A 5 "pending_requests"
   ```

Se os dados ainda estiverem lá após o deploy, a persistência está funcionando! ✅

---

## 📋 Checklist

- [ ] **Passo 1:** Configurar Azure Files via Portal (`docs/CONFIGURAR_AZURE_FILES_PORTAL.md`)
- [ ] **Passo 2:** Fazer commit e push do código atualizado
- [ ] **Passo 3:** Aguardar deploy automático (5-10 minutos)
- [ ] **Passo 4:** Migrar dados existentes via SSH (se houver)
- [ ] **Passo 5:** Verificar logs confirmando uso de `/home/data`
- [ ] **Teste:** Criar dados → Deploy → Verificar persistência

---

## 🚨 Problemas Conhecidos

1. **Assinatura Azure via CLI:** Erro "SubscriptionNotFound"
   - **Solução:** Usar Portal Azure para configuração
   - **Status:** Guia criado em `docs/CONFIGURAR_AZURE_FILES_PORTAL.md`

2. **Logs ainda mostram `/app/data`:**
   - **Causa:** Azure Files ainda não configurado
   - **Solução:** Completar Passo 1 (configurar via Portal)

---

**Próximo passo imediato:** Executar Passo 1 (configurar Azure Files via Portal)

