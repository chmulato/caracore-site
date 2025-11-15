# Status Atual - Persistência de Dados

**Data:** 15/11/2025  
**Status:** ⚠️ **INCOMPATIBILIDADE DE CAMINHOS - Requer Correção**

---

## 🔴 Problema Identificado

Há uma **incompatibilidade** entre o caminho montado pelo Azure Files e o caminho que o backend está procurando:

| Componente | Caminho Configurado | Status |
|------------|---------------------|--------|
| **Azure Files Mount** | `/home/site/wwwroot/data` | ✅ Montado e funcionando |
| **Backend (authorization.py)** | `/home/data` | ❌ Não encontra o mount |

### Consequência

- ❌ **Os dados NÃO estão sendo persistidos corretamente**
- ❌ A cada deploy, os dados são perdidos
- ❌ O backend está usando o diretório local (`backend/data`) ao invés do Azure Files

---

## 📊 Situação Atual Detalhada

### ✅ O que está configurado:

1. **Azure Files Mount** ✅
   - Nome: `data-storage`
   - Storage Account: `caracoredata`
   - File Share: `caracore-data`
   - Mount Path: `/home/site/wwwroot/data`
   - Protocol: SMB
   - Estado: `Ok`
   - **Autenticação:** Access Key (não Managed Identity ainda)

2. **Variáveis de Ambiente** ✅
   - `AZURE_STORAGE_ACCOUNT=caracoredata`
   - `AZURE_STORAGE_SHARE_NAME=caracore-data`
   - `AZURE_STORAGE_ACCESS_KEY` (configurada)
   - `AZURE_STORAGE_ACCESS_TYPE=ManagedIdentity` (mas mount usa Access Key)
   - `AZURE_STORAGE_MOUNT_PATH=/home/site/wwwroot/data`
   - `SESSION_DATA_FILE=/home/site/wwwroot/data/user_sessions.json`
   - `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true`

3. **Código do Backend** ⚠️
   - `backend/authorization.py` procura por `/home/data`
   - Se não encontrar, usa `backend/data` (local, não persistente)

---

## 🔧 Solução Necessária

### Opção 1: Atualizar o Backend (Recomendado)

Modificar `backend/authorization.py` para usar o caminho correto:

```python
# Linha 31 - ATUAL (incorreto):
AZURE_DATA_DIR = '/home/data'

# DEVE SER:
AZURE_DATA_DIR = '/home/site/wwwroot/data'
```

**Vantagens:**
- ✅ Alinha com o mount configurado
- ✅ Não requer mudanças no Azure
- ✅ Funciona imediatamente após deploy

### Opção 2: Reconfigurar o Mount (Alternativa)

Mudar o mount path no Azure para `/home/data`:

**Via Portal:**
1. App Services > `caracore-backend-docker`
2. Configuration > Path mappings
3. Editar `data-storage`
4. Mudar Mount path para `/home/data`
5. Salvar e reiniciar

**Via CLI:**
```bash
az webapp config storage-account delete \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --custom-id data-storage

az webapp config storage-account add \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --custom-id data-storage \
  --storage-type AzureFiles \
  --account-name caracoredata \
  --share-name caracore-data \
  --access-key rhNrjnj8bseYNLTr3YkggpOoxxIcLDYfzlv2ma/j5H/TJC+z3pLuaOdLnWlWAiiMoW149OsrwYFT+AStPrlvnA== \
  --mount-path /home/data
```

**Desvantagens:**
- ⚠️ Requer remover e recriar o mount
- ⚠️ Pode causar downtime

---

## 🎯 Recomendação

**Usar Opção 1** (atualizar o backend) porque:
- ✅ Mais rápido e seguro
- ✅ Não requer mudanças na infraestrutura
- ✅ Alinha com as variáveis de ambiente já configuradas

---

## 📋 Checklist de Correção

### Passo 1: Corrigir o Código
- [ ] Atualizar `backend/authorization.py` linha 31
- [ ] Mudar `AZURE_DATA_DIR = '/home/data'` para `AZURE_DATA_DIR = '/home/site/wwwroot/data'`
- [ ] Ou melhor: usar variável de ambiente `AZURE_STORAGE_MOUNT_PATH`

### Passo 2: Fazer Deploy
- [ ] Commit das alterações
- [ ] Push para trigger do deploy automático
- [ ] Aguardar deploy completar

### Passo 3: Verificar Logs
- [ ] Verificar logs do App Service
- [ ] Confirmar mensagem: `"Detectado ambiente Azure - usando /home/site/wwwroot/data para persistência"`
- [ ] Verificar se `AUTHORIZED_USERS_FILE` aponta para o caminho correto

### Passo 4: Testar Persistência
- [ ] Criar um usuário ou solicitação de acesso
- [ ] Fazer um novo deploy
- [ ] Verificar se os dados persistiram

### Passo 5: Migrar Dados Existentes (se houver)
- [ ] Se houver dados em `backend/data/authorized_users.json` local
- [ ] Executar script de migração via SSH
- [ ] Ou copiar manualmente para `/home/site/wwwroot/data`

---

## 🔍 Como Verificar Após Correção

### 1. Verificar Logs:
```bash
az webapp log tail \
  --name caracore-backend-docker \
  --resource-group rg-caracore
```

**Procurar por:**
```
Detectado ambiente Azure - usando /home/site/wwwroot/data para persistência
Authorization module - DATA_DIR: /home/site/wwwroot/data
Authorization module - AUTHORIZED_USERS_FILE: /home/site/wwwroot/data/authorized_users.json
```

### 2. Testar via SSH:
```bash
az webapp ssh --name caracore-backend-docker --resource-group rg-caracore

# Dentro do shell:
ls -la /home/site/wwwroot/data
cat /home/site/wwwroot/data/authorized_users.json
exit
```

### 3. Testar Persistência:
```bash
# Criar arquivo de teste
az webapp ssh --name caracore-backend-docker --resource-group rg-caracore
echo "test-$(date +%s)" > /home/site/wwwroot/data/test.txt
exit

# Reiniciar App Service
az webapp restart --name caracore-backend-docker --resource-group rg-caracore

# Verificar se arquivo ainda existe
az webapp ssh --name caracore-backend-docker --resource-group rg-caracore
cat /home/site/wwwroot/data/test.txt
rm /home/site/wwwroot/data/test.txt
exit
```

---

## 📝 Notas Adicionais

### Sobre Managed Identity

Atualmente o mount está usando **Access Key**. Para melhorar a segurança:

1. Configurar mount com Managed Identity via Portal (veja `docs/CONFIGURACAO_MANAGED_IDENTITY_STATUS.md`)
2. Remover `AZURE_STORAGE_ACCESS_KEY` das variáveis de ambiente após migrar para Managed Identity

### Sobre Migração de Dados

Se houver dados existentes em `backend/data/authorized_users.json` (desenvolvimento local), será necessário:

1. Fazer backup do arquivo
2. Após correção e deploy, copiar via SSH para `/home/site/wwwroot/data/authorized_users.json`

---

## 🚨 Status Final

**ATUAL:** ❌ Dados NÃO estão sendo persistidos (incompatibilidade de caminhos)  
**APÓS CORREÇÃO:** ✅ Dados serão persistidos corretamente entre deploys

---

**Próximo Passo:** Corrigir `backend/authorization.py` para usar `/home/site/wwwroot/data`

