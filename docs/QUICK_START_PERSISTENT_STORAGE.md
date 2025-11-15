# Guia Rápido - Configurar Persistência de Dados

Este guia executa os 4 passos necessários para configurar a persistência de dados no Azure.

---

## ✅ Passo 1: Configurar Azure Files

### Opção A: Via Script Python (Recomendado)

```bash
# Executar script Python
python scripts/configure_azure_files.py
```

### Opção B: Manualmente via Azure Portal

Siga o guia completo em: `docs/AZURE_PERSISTENT_STORAGE.md` ou `docs/CONFIGURAR_AZURE_FILES_PORTAL.md`

**O que o script faz:**
- ✅ Cria Storage Account (se não existir)
- ✅ Cria File Share `caracore-data`
- ✅ Configura montagem `/home/data` no Web App
- ✅ Reinicia o Web App automaticamente

**Tempo estimado:** 2-3 minutos

---

## ✅ Passo 2: Fazer Deploy do Código Atualizado

O código já está preparado para usar `/home/data` quando disponível.

### Deploy Automático (GitHub Actions)

Se você fez commit das alterações, o deploy será automático via GitHub Actions.

**Verificar deploy:**
1. GitHub > Actions > Verificar se o workflow executou
2. Aguardar conclusão do deploy (~5-10 minutos)

### Deploy Manual (se necessário)

```bash
# Build e push da imagem
docker build -f Dockerfile.azure -t caracoreregistry.azurecr.io/caracore-backend:latest .
docker push caracoreregistry.azurecr.io/caracore-backend:latest

# Atualizar Web App
az webapp config container set \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --docker-custom-image-name caracoreregistry.azurecr.io/caracore-backend:latest
```

**Tempo estimado:** 5-10 minutos (automático) ou 15-20 minutos (manual)

---

## ✅ Passo 3: Executar Script de Migração (se houver dados existentes)

### Via SSH no Azure Portal

1. **Conectar via SSH:**
   - Azure Portal > App Services > `caracore-backend-docker` > **SSH**

2. **Executar script de migração:**
   ```bash
   # Copiar script para o container (se necessário)
   # Ou executar diretamente via Python
   
   python3 -c "
   import json
   import shutil
   from pathlib import Path
   
   old_path = Path('/app/data/authorized_users.json')
   new_path = Path('/home/data/authorized_users.json')
   
   if old_path.exists() and not new_path.exists():
       Path('/home/data').mkdir(parents=True, exist_ok=True)
       shutil.copy(old_path, new_path)
       print('Dados migrados com sucesso!')
   else:
       print('Nenhum dado para migrar ou já migrado')
   "
   ```

3. **Verificar migração:**
   ```bash
   ls -la /home/data/
   cat /home/data/authorized_users.json
   ```

**Tempo estimado:** 2-3 minutos

---

## ✅ Passo 4: Verificar nos Logs

### Opção A: Via Script Python (Recomendado)

```bash
# Executar script Python
python scripts/verify_persistent_storage.py
```

### Opção B: Manualmente

1. **Azure Portal:**
   - App Services > `caracore-backend-docker` > **Log stream**
   - Procurar por: `"Detectado ambiente Azure - usando /home/data para persistência"`

2. **Via Azure CLI:**
   ```bash
   az webapp log tail \
     --resource-group rg-caracore \
     --name caracore-backend-docker \
     | grep -i "home/data"
   ```

3. **Via SSH:**
   ```bash
   # Verificar se o diretório existe
   ls -la /home/data/
   
   # Verificar se o arquivo existe
   cat /home/data/authorized_users.json
   
   # Verificar logs da aplicação
   tail -f /var/log/supervisor/gunicorn.log | grep -i "home/data"
   ```

**O que procurar nos logs:**
```
[INFO] Detectado ambiente Azure - usando /home/data para persistência
[INFO] Authorization module - DATA_DIR: /home/data
[INFO] Authorization module - AUTHORIZED_USERS_FILE: /home/data/authorized_users.json
```

**Tempo estimado:** 1-2 minutos

---

## 🧪 Teste de Persistência

Após configurar tudo, teste se os dados persistem:

1. **Criar uma solicitação de acesso** (via formulário de primeiro acesso)
2. **Fazer um deploy** (qualquer mudança no código)
3. **Verificar se os dados ainda estão presentes:**
   ```bash
   # Via SSH
   cat /home/data/authorized_users.json | jq '.pending_requests'
   ```

Se os dados ainda estiverem lá após o deploy, a persistência está funcionando! ✅

---

## 🚨 Troubleshooting Rápido

### Problema: Script de configuração falha

**Solução:**
- Verificar se está logado: `az account show`
- Verificar permissões no Resource Group
- Verificar se o Web App existe: `az webapp show --name caracore-backend-docker --resource-group rg-caracore`

### Problema: Logs não mostram "/home/data"

**Solução:**
- Aguardar 2-3 minutos após reiniciar o Web App
- Verificar se a montagem está configurada: `az webapp config storage-account list --name caracore-backend-docker --resource-group rg-caracore`
- Reiniciar o Web App manualmente: `az webapp restart --name caracore-backend-docker --resource-group rg-caracore`

### Problema: Dados ainda são perdidos

**Solução:**
- Verificar se `/home/data` existe no container: `ls -la /home/data/`
- Verificar permissões: `chmod -R 755 /home/data`
- Verificar se o arquivo está sendo salvo no lugar certo: verificar logs da aplicação

---

## 📋 Checklist Final

- [ ] Azure Files configurado (Storage Account + File Share + Mount)
- [ ] Código atualizado deployado
- [ ] Dados migrados (se houver dados existentes)
- [ ] Logs confirmam uso de `/home/data`
- [ ] Teste de persistência realizado (criar dados → deploy → verificar)

---

**Tempo total estimado:** 15-20 minutos

**Última atualização:** 15/11/2025

