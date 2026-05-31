# Configurar Azure Files via Portal Azure

Este guia mostra como configurar Azure Files manualmente via Portal Azure.

> **💡 Dica:** Para configuração automática, use o script Python: `python scripts/configure_azure_files.py`

---

## 📋 Passo 1: Criar Storage Account

1. Acesse: [https://portal.azure.com]
2. No menu superior, clique em **+ Criar um recurso**
3. Busque por **Storage account**
4. Clique em **Criar**
5. Preencha:
   - **Subscription:** Assinatura do Azure 1
   - **Resource Group:** `rg-caracore`
   - **Storage account name:** `caracoredata` (ou outro nome único se este já estiver em uso)
   - **Region:** Brazil South
   - **Performance:** Standard
   - **Redundancy:** LRS (Local-redundant storage)
6. Clique em **Revisar + criar** > **Criar**
7. Aguarde a criação (1-2 minutos)

---

## 📋 Passo 2: Criar File Share

1. No Storage Account criado, vá em **Data storage** > **File shares**
2. Clique em **+ File share**
3. Preencha:
   - **Name:** `caracore-data`
   - **Quota:** 5 GB
4. Clique em **Criar**

---

## 📋 Passo 3: Configurar Montagem no Web App

1. Azure Portal > **App Services** > `caracore-backend-docker`
2. No menu lateral esquerdo, vá em **Configuration**
3. Clique na aba **Path mappings**
4. Clique em **+ New Azure Storage Mount**
5. Preencha o formulário:
   - **Name:** `data-storage`
   - **Storage type:** Azure Files
   - **Storage account:** Selecione o storage account criado (`caracoredata`)
   - **Storage container:** Selecione o file share (`caracore-data`)
   - **Mount path:** `/home/data`
   - **Access key:** Selecione **Key1** (ou Key2)
6. Clique em **OK**
7. Clique em **Save** no topo da página
8. **IMPORTANTE:** O Web App será reiniciado automaticamente

---

## ✅ Passo 4: Verificar Configuração

1. Após o reinício, vá em **Log stream** (no menu lateral)
2. Procure por: `"Detectado ambiente Azure - usando /home/data para persistência"`
3. Se aparecer essa mensagem, a configuração está funcionando!

---

## 🔄 Passo 5: Migrar Dados Existentes (se houver)

1. Azure Portal > App Services > `caracore-backend-docker` > **SSH** (no menu lateral)
2. Execute:

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
else:
      print('ℹ️ Nenhum dado para migrar ou já migrado')
"
```

3. Verificar:

```bash
ls -la /home/data/
cat /home/data/authorized_users.json
```

---

## 🧪 Teste Final

1. Criar uma solicitação de acesso (via formulário)
2. Fazer um deploy (qualquer mudança no código)
3. Verificar se os dados ainda estão presentes após o deploy

---

**Tempo estimado:** 10-15 minutos

**Última atualização:** 15/11/2025

