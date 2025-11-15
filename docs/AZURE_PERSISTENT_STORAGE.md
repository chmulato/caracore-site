# Configuração de Armazenamento Persistente - Azure Web App

**Problema:** A cada deploy, os dados de usuários autorizados e solicitações pendentes são perdidos porque o container Docker é recriado.

**Solução:** Configurar Azure Files para montar um volume persistente no container.

> **🚀 Guia Rápido:** Para executar os passos rapidamente, veja `docs/QUICK_START_PERSISTENT_STORAGE.md`

---

## 🎯 Objetivo

Garantir que os dados em `authorized_users.json` sejam persistidos entre deploys usando Azure Files montado em `/home/data`.

---

## 📋 Pré-requisitos

1. Azure Storage Account (já deve existir ou criar novo)
2. Azure Web App configurado
3. Permissões para configurar Web App

---

## 🔧 Configuração no Azure Portal

### Passo 1: Configurar Azure Files

**Opção A: Via Script Python (Recomendado)**

```bash
python scripts/configure_azure_files.py
```

O script executa automaticamente:
- Cria Storage Account (se não existir)
- Cria File Share `caracore-data`
- Configura montagem `/home/data` no Web App
- Reinicia o Web App automaticamente

**Opção B: Manualmente via Portal**

1. Azure Portal > **Storage accounts** > **+ Create**
2. Configurações básicas:
   - **Resource Group:** `rg-caracore` (ou o seu)
   - **Storage account name:** `caracoredata` (ou nome único)
   - **Region:** Brazil South (mesma região do Web App)
   - **Performance:** Standard
   - **Redundancy:** LRS (Local Redundant Storage) - mais barato
3. Clique em **Review + create** > **Create**

### Passo 2: Criar File Share

1. No Storage Account criado, vá em **Data storage** > **File shares**
2. Clique em **+ File share**
3. Configurações:
   - **Name:** `caracore-data`
   - **Quota:** 5 GB (suficiente para dados JSON)
4. Clique em **Create**

### Passo 3: Configurar Montagem no Web App

1. Azure Portal > **App Services** > `caracore-backend-docker`
2. No menu lateral, vá em **Configuration** > **Path mappings**
3. Clique em **+ New Azure Storage Mount**
4. Preencha:
   - **Name:** `data-storage`
   - **Storage type:** Azure Files
   - **Storage account:** Selecione o storage account criado
   - **Storage container:** Selecione o file share `caracore-data`
   - **Mount path:** `/home/data`
   - **Access key:** Selecione a chave de acesso (Key1 ou Key2)
5. Clique em **OK**
6. Clique em **Save** no topo da página
7. **IMPORTANTE:** O Web App será reiniciado automaticamente

---

## 🔧 Configuração via Script Python

**Recomendado:** Use o script Python que automatiza todo o processo:

```bash
python scripts/configure_azure_files.py
```

O script executa todos os passos automaticamente. Para configuração manual via Azure CLI, veja o código do script em `scripts/configure_azure_files.py`.

---

## ✅ Verificação

### 1. Verificar se o volume está montado

**Via Script Python (Recomendado):**

```bash
python scripts/verify_persistent_storage.py
```

**Ou via Azure Portal:**

Azure Portal > App Services > caracore-backend-docker > Log stream

Procurar por: `"Detectado ambiente Azure - usando /home/data para persistência"`

### 2. Testar persistência

1. Fazer uma solicitação de acesso (criar usuário pendente)
2. Fazer um deploy (qualquer mudança no código)
3. Verificar se os dados ainda estão presentes após o deploy

### 3. Verificar arquivo diretamente (SSH)

```bash
# Conectar via SSH no Azure Portal
Azure Portal > App Services > caracore-backend-docker > SSH

# Dentro do container:
ls -la /home/data/
cat /home/data/authorized_users.json
```

---

## 📊 Estrutura de Dados

Após a configuração, os dados serão salvos em:

```
/home/data/
├── authorized_users.json      # Usuários e solicitações
└── backups/                   # Backups automáticos
    ├── authorized_users_20251115_120000.json
    └── ...
```

---

## 🔄 Migração de Dados Existentes

Se você já tem dados no container atual:

### Opção 1: Via SSH (Recomendado)

```bash
# 1. Conectar via SSH
Azure Portal > App Services > caracore-backend-docker > SSH

# 2. Copiar dados existentes
cp /app/data/authorized_users.json /home/data/
mkdir -p /home/data/backups
cp -r /app/data/backups/* /home/data/backups/ 2>/dev/null || true
```

### Opção 2: Via Script Python

Criar um script temporário para migrar dados:

```python
# backend/migrate_data.py
import json
import shutil
from pathlib import Path

old_path = Path('/app/data/authorized_users.json')
new_path = Path('/home/data/authorized_users.json')

if old_path.exists() and not new_path.exists():
    shutil.copy(old_path, new_path)
    print(f"Dados migrados de {old_path} para {new_path}")
```

---

## 🚨 Troubleshooting

### Problema: Dados ainda são perdidos após deploy

**Causa:** Volume não está montado corretamente

**Solução:**
1. Verificar se o mount path está correto: `/home/data`
2. Verificar se o file share existe no Storage Account
3. Verificar logs do container para mensagens de erro
4. Reiniciar o Web App após configurar o mount

### Problema: Erro de permissão ao salvar

**Causa:** Permissões incorretas no file share

**Solução:**
```bash
# Via SSH no container
chmod -R 755 /home/data
chown -R appuser:appuser /home/data
```

### Problema: Storage Account não encontrado

**Causa:** Storage Account em resource group diferente

**Solução:**
- Verificar se o Storage Account está no mesmo resource group
- Ou usar o resource ID completo na configuração

---

## 💰 Custos

**Azure Files (Standard LRS):**
- Primeiros 5 GB: ~$0.06/mês
- Cada GB adicional: ~$0.06/mês
- **Estimativa para este projeto:** < $0.10/mês (dados JSON são pequenos)

**Comparação:**
- Sem persistência: Dados perdidos a cada deploy ❌
- Com Azure Files: Dados persistentes por ~$0.10/mês ✅

---

## 📝 Notas Importantes

1. **Backup Automático:** O sistema já cria backups automáticos em `/home/data/backups/`
2. **Compatibilidade:** O código detecta automaticamente se está em Azure ou local
3. **Fallback:** Se `/home/data` não existir, usa diretório local (desenvolvimento)
4. **Performance:** Azure Files tem latência baixa (< 10ms) para operações de leitura/escrita

---

## 🔗 Referências

- [Azure Files Documentation](https://docs.microsoft.com/en-us/azure/storage/files/)
- [Mount Azure Files in Web App](https://docs.microsoft.com/en-us/azure/app-service/configure-connect-to-azure-storage)
- [Azure Storage Pricing](https://azure.microsoft.com/en-us/pricing/details/storage/files/)

---

**Última Atualização:** 15/11/2025  
**Status:** ✅ Implementado e testado  
**Responsável:** Equipe Cara Core

